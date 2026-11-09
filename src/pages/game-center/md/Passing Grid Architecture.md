# Passing-grid family: ownership and cleanup map

Date: 2026-10-30. This is an internal code map, not user-facing product metadata.

## Boundaries

Share confirmed statistical contracts, source adapters, and formatting where
meanings match. Keep page composition and simple/detailed layouts separate.
Family membership records review impact; it does not mandate one renderer.
Numeric air-yard bands and scorer-called short/deep bands are distinct bases.
Backend questions: [Backend Notes 2026-10-30.md](Backend%20Notes%202026-10-30.md).

## Current consumers

Paths below are relative to src/.

| Presentation | Implementation / parents | Contract and behavior |
|---|---|---|
| Preview page and export | components/game/preview/GamePreviewScout.js: PassGrid and separate export grid; preview export/short-poster consumers | QB season sample, flat depth + L/M/R cells; completion-rate shading; hardcoded depth labels |
| Completed game desktop/mobile | components/game/page/boxscore/PassingProductionClean.js; BoxScoreTab.js and ../mobile/GamePageMobile.js | Player passing/receiving breakdown; measured 3x3 or called 2x3; yards/attempt heat; hides above 20% uncharted |
| Player profile/advanced | components/molecules/player/productionMaps/{PlayerProductionMap,PassingGridMap,playerMapModel}.js; organisms/test/PlayerProfileControlStripV2.js and organisms/player/PlayerAdvancedTab.js | Selected field_map and depth_bands; pass/rush selection; legacy estimated fallback when cells absent |
| Simple/detailed aggregate posters | components/organisms/deepDive/PassingGridPosters.js; DeepDiveCharts.js | Shared shipped team aggregate; separate SimpleCard/TeamCard; completion shading, rates muted at 15% uncharted, minimum shading sample 5 |
| Older game presentations and model | components/organisms/test/QGameBoxScore.js | Compatibility entry for labs; production now imports utils/gameBoxScore/passingModel and teamIdentity directly. Legacy grid reconstruction remains in passingModel. |

Attribution dimensions for future adapters: subject, sample and cutoff, charting
basis/schema, metric/denominator, coverage, presentation, layout density, and
consumers. Do not infer sample from page phase or compact mode from mobile alone.

## Completed first extraction

- PassingProductionClean.js retains team totals, player selection/tables, league
  query and desktop/mobile composition (411 to 209 lines).
- PassingSpotlight.js owns the existing spotlight/chips/zone rendering (135 lines).
- utils/gamePassingZones.js owns only the completed-game breakdown adapter,
  existing depth labels and hide threshold (57 lines). It is not yet a universal
  adapter for preview/player/season payloads.
- Existing JSX and adapter behavior are preserved. No new visual design, lab
  experiment or registry changes were introduced.
- Removed the obsolete comment claiming this is only appended for comparison;
  BoxScoreTab and GamePageMobile already use it as their passing presentation.

## Safe cleanup sequence after this slice

1. Completed 2026-10-31: extracted buildPassingData and dependencies into
   utils/gameBoxScore, preserving old exports and grid reconstruction. See
   [QGameBoxScore Cleanup](QGameBoxScore%20Cleanup.md) for checks and deferred semantics.
2. Completed structural split 2026-10-31: player production maps now live by
   production type under components/molecules/player/productionMaps; shared
   source/color helpers are in playerMapModel. The old test file retains compatibility
   exports only, and both current consumers import production directly.
   Missing/empty maps still trigger fabricated passing grids: replace through a deliberate unavailable-state lab pass, not a hidden
   semantic change during mechanical extraction.
3. Extract the preview page/export renderers from the scout parent, keeping their
   sizing and typography separate. This file is under concurrent modification.
4. Keep simple/detailed poster cards separate while moving shared aggregate
   selection/coverage/color-scale preparation into a small model when coordinated
   with its current author. These poster files are currently untracked work.
5. Consolidate depth definitions only after the backend confirms compatible
   contracts. A shared label must never conceal different binning logic.

## Dead-code findings

No unused bindings were reported by ESLint in PassingProductionClean,
QGameBoxScore or PlayerProductionMaps before extraction. Lab location is not
proof of dead code: both large test files serve live consumers.
PlayerProfileControlStrip.js v1 has no current code consumers, but the Player
Page Design Doc explicitly retains it for reference. Keep that documented
archive for now rather than deleting it as an accidental orphan.
No broad file deletions were made; concurrent edits were left intact.

## Verification and future visual matrix

Adapter checks cover measured/called grids, absent breakdowns, zero attempts,
receiver naming/keys, negative yardage, uncharted totals and the 20% boundary.
For any future visual change, review desktop and mobile game panels, passer
and receiver selection, measured/called/unavailable/high-uncharted states;
then review preview screen/export, player pass/rush switching, and both poster
presentations only when their shared dependencies changed. New visual variants
must follow Test File -> Lab -> Live Page.

Completed checks: six adapter tests passed; extracted adapter output matched
1,451 player rows across 72 real game files; moved spotlight body matched the
original after its export/call rename; all four changed/new JavaScript files
parsed and passed ESLint with zero warnings. No browser visual check or full
production build was performed for this mechanical extraction.

## 2026-10-31: Player and team-profile map ownership

Reviewed by: Codex (cleanup chat). Player map implementations are separate for
passing, rushing, havoc, special teams and offensive line. The production-kind
router retains the existing view-selection state and defaults. No depth-band,
missing-data, estimated-statistic or source-selection policy changed.

Team analytics Profile uses organisms/stats/TeamProfilePhasesPassingCopy.js
through TeamProfileTab. Its section definitions are now profilePhases/phaseConfig,
its passing/rushing/havoc renderers are separate modules, and its shared cells,
labels and formatting are isolated. Its team aggregate contract stays separate
from the player map contract; these charts do not share a universal renderer.

All 193 declarations across the five-file cleanup batch match compiled baseline
bodies. Local import/export and cycle checks passed; ESLint passed for 39 source
files. Browser verification for this batch is pending.
