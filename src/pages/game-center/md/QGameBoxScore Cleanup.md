# QGameBoxScore cleanup

Date: 2026-10-31. Mechanical extraction with existing statistical behavior preserved.

## Ownership and consumers

The legacy entry `src/components/organisms/test/QGameBoxScore.js` is now 191
lines (previously 2,287). It retains the default component, `.Passing`, `.Rushing`,
`.Defense`, `.buildAvatarMap` and all six named helper/model exports. The existing
default export is retained for compatibility; new extracted lab files have named
exports only. No new visual variants or registry entries were introduced.

Production callers now import directly from `src/utils/gameBoxScore/`:

- `PassingProductionClean.js`: passing model and team identity.
- `RushingProductionClean.js`, `DefenseProductionClean.js`,
  `SpecialTeamsProductionClean.js`, `BoxscorePoster.js`: team identity.

Only those import statements were edited in the five consumers, preserving
concurrent work. Remaining old-path callers are lab components:
`QGamePageTest`, `HavocSpatialLogMock`, and `RushLaneAxisVariants`.

## File responsibilities

| Location | Responsibility |
|---|---|
| utils/gameBoxScore/teamIdentity.js | Team lookup, aliases and existing fallback colors/labels |
| utils/gameBoxScore/statHelpers.js | Normalization, player names, matching and formatting |
| utils/gameBoxScore/passingModel.js | Existing passing totals, players, splits and legacy grids |
| utils/gameBoxScore/rushingModel.js | Existing rushing totals, lanes and context |
| utils/gameBoxScore/defenseModel.js | Existing defensive aggregation and play-derived statistics |
| organisms/test/qGameBoxScore/DefenseIdentityCompact.js | Opposing defense identity presentation and grades |
| organisms/test/qGameBoxScore/PassingPanel.js | Existing passing panel and field-map presentation |
| organisms/test/qGameBoxScore/RushingPanel.js | Existing rushing panel and defensive-impact presentation |
| organisms/test/qGameBoxScore/DefensePanel.js | Existing defense panel and grades |
| organisms/test/QGameBoxScore.js | Lab data-hook/composition entry and compatibility exports |

Paths in this table are relative to src/components for organisms, and src for
utils. Pure utilities do not depend on React, Chakra or lab components.
The passing/rushing panel files still contain separate compact/standard JSX;
that retained size is deliberate, not an instruction to force both layouts
into one conditional renderer.

## Dead calculations removed

- `DefenseModule` computed an avatar map and never read it. Removed that memo,
  the unused destructured playerSeasons input and its lint suppression. Passing
  the same props still works; passing/rushing retain their avatar mapping.
- `buildDefenseData` incremented totalOppPlays and never read it. Removed the
  counter and suppression; output parity was checked afterward.

## Deferred semantic issues

These pre-existing behaviors were not changed or endorsed by extraction:

- Passing grids infer missing direction as middle and match player names.
- Opponent defense and defensive totals use estimated/default values; the
  rushing model estimates power-stop rate when absent.
- Rushing team lanes and player lanes read different direction fields; preserve
  their output until source-contract corrections have their own review.
- Rushing's leagueAvg argument is unused, and its returned context omits
  leagueAvg although DefensiveImpactPills reads it. Resolve grading/data intent
  before removing the query or connecting it to the presentation.
- Legacy avatar mapping parses filenames. Migrate to structured identity in a
  separate verified change; the current public static helper remains intact.
- These models retain historical schema assumptions. Extraction does not make
  them a canonical data contract for every passing/rushing/defense chart.

See Backend Notes 2026-10-30.md and Passing Grid Architecture.md for the pending
cross-view charting contract.

## Verification

- 432 model-output comparisons: passing/rushing/defense for 144 teams across
  72 real game files, matching the original implementation.
- Identity parity for all 18 teams' route/export/v5 aliases and unknown IDs.
- All 34 unchanged extracted declarations match their original AST.
- Old named exports, default export and four static members preserved.
- 14 tests passed (8 model contracts plus 6 existing passing-zone tests).
- All 16 touched/new JavaScript files passed parsing, import resolution, UTF-8
  checks and ESLint with zero warnings.
- Initial Jest run failed before executing tests due to a sandbox temporary-cache
  permission error. Rerun succeeded with cache inside node_modules/.cache/jest-qgame.
- No browser visual check or full production build was performed.
