# Backend feedback: passing-zone data contracts

Date: 2026-10-30. Status: clarification requested; no backend changes performed.

This note stays in the frontend repository for the user to carry to the backend.
Related: `Game Preview Scout Backend Request.md` and
`../../players/md/Player Profile Game Maps Backend Request.md`.

## Why this is needed

The preview QB grid, completed-game QB/receiver grid, player field map, and
simple/detailed team passing posters share a concept but consume different
contracts. We need a data inventory before sharing their adapters or labels.
Separate visual presentations are intentional; consistent statistical meaning
must come from the data contract, not a universal frontend component.

## Requested inventory

For each exported passing map, document the payload path and field path,
producer, schema/version, player/team identity keys, supported seasons,
subject (passer, receiver, team), sample (single game, season, selected games),
included game IDs or filters, through-week/as-of cutoff, and availability.
Distinguish page phase (pregame/postgame) from sample: a preview can display
season-to-date performance, not statistics from the upcoming game.

Known frontend consumers to reconcile:

| Consumer | Current shape |
|---|---|
| `GamePreviewScout.js` / preview exports | Flat QB cells with depth and L/M/R direction |
| `PassingProductionClean.js` | `individual_stats[team].passing/receiving[].direction_breakdown` or `call_breakdown` |
| `PlayerProductionMaps.js` | Selected profile `field_map.passing.cells` and `depth_bands` |
| `PassingGridPosters.js` | `swacPassingGrid2026W8.json`: `teams[].grid`, totals, coverage and ranks |

## Definitions requiring confirmation

1. **Depth:** supply numeric bounds, inclusive/exclusive edges, units, and
   authoritative display labels. Confirm the treatment of exactly 4, 12 and 13
   yards, negative air yards, and fractional values if supported. `>12` and
   `13+` agree only for integer yardage; `12+` is a different boundary.
   Confirm this is air distance to the target/catch/interception spot, not net
   yards gained. Do not relabel existing historical bins without verifying them.
2. **Measured versus called:** the game page uses two-row `call_breakdown`
   when `metadata.pass_spotting.incompletion_depth` is `unspotted` and that
   breakdown exists. Scorer calls of short/deep must not inherit numeric
   air-yard ranges or be silently merged with three-row measured grids.
   Please expose the charting basis on every applicable map, including mixed
   coverage season aggregates.
3. **Direction:** document whose perspective left/right describes, accepted
   keys (L/M/R versus left/middle/right), and handling of unknown direction.
   Unknown direction must not silently become middle.
4. **Metrics:** define yards, completions/attempts versus receptions/targets,
   touchdowns, success-rate denominator and rule, EPA denominator (attempt or
   dropback), aDOT denominator, and air yards/YAC (including negative air yards).
   State rate units (0-1 versus 0-100), sack/spike/throwaway/interception and
   penalty/no-play treatment. Supply rate numerators and denominators where
   aggregation is expected; averaging cell percentages is not a valid substitute.
5. **Coverage and missingness:** distinguish no attempts, unavailable map,
   uncharted attempts, and missing cells. Clarify whether omitted cells mean
   zero. Provide charted/uncharted counts and reasons, and whether reason
   counts overlap. Define reconciliation to official totals, including known
   exceptions. Current game UI hides grids above 20% uncharted; posters mute
   rates at 15%. These are separate frontend presentation policies, not proof
   of different backend definitions.
6. **Cross-view agreement:** equivalent subject/sample/basis must reconcile
   between game, player profile, preview, and aggregate exports. State rank
   population, filter, ties and cutoff independently of the displayed grid.

## Requested response / acceptance evidence

Return a field-level inventory and confirmed definitions, preferably reusable
schema metadata or a versioned definition reference in each payload. Existing
metadata may satisfy this: identify it before adding redundant fields.
Include representative payloads for measured and called maps, unavailable
and zero-attempt maps, receiver targets, and mixed-coverage aggregates.
Show a single-game player matching the same player-profile game, and a team
aggregate reconciling its included games and uncharted counts. Confirm boundary
examples at 4, 12 and 13 yards from producer logic.

Frontend cleanup will preserve existing thresholds and output while this is
unresolved. The frontend also has legacy estimated-grid fallbacks; those need
an explicit unavailable-data migration, not adoption as a shared data model.
