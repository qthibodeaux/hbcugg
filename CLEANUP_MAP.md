# Project Cleanup Map

Updated: 2026-11-06. Scope: frontend hbcugg1 only.

This is the working review backlog. [CODEMAP.md](CODEMAP.md) explains where things
live; this file records what we have checked, what remains, and the order of work.
[Full source inventory](CLEANUP_INVENTORY.md) lists every scanned source file,
its line count, review status, direct importer count and working-change flag.

## Rules for using this map

- A large file is a review candidate, not automatically bad or dead code.
- Reviewed means the stated scope was checked, not that its entire dependency
  tree is clean. Inventory-only files have not received a code-quality audit.
- Refactors preserve behavior. Statistical corrections, unavailable-data changes
  and new visuals are separate changes; new UI follows Test File -> Lab -> Live.
- Do not delete on filename, age, zero importers, or lab location alone. Check
  routes, barrels, dynamic imports, exports, tests and documented retention.
- Other agents are editing this workspace. Claim a narrow set of files, inspect
  current changes before editing, and preserve unrelated work. Record active
  ownership in the inventory; git changes do not establish ownership.
- Keep all edits inside hbcugg1. Backend requests stay in the appropriate local
  src/pages/**/md folder for the user to carry over.

## Reviewed and changed in this chat

| File | Current lines | Work completed | Remaining scope | Last reviewed | Reviewed by |
|---|---:|---|---|---|---|
| [src/pages/game-center/GamePage.js](<src/pages/game-center/GamePage.js>) | 129 | Removed unused location hook and lint suppression; consolidated imports and corrected comment. | Parent review complete; descendants remain separate work. | 2026-10-30 | Codex (cleanup chat) |
| [src/pages/game-center/SeasonSchedulePage.js](<src/pages/game-center/SeasonSchedulePage.js>) | 95 | 476 -> 95 lines; retained data/state and page composition. | Browser verification outstanding. | 2026-10-30 | Codex (cleanup chat) |
| [src/components/molecules/game/SeasonScheduleBanner.js](<src/components/molecules/game/SeasonScheduleBanner.js>) | 191 | Extracted existing desktop/mobile banners; parent passes density. | Keep layouts separate. | 2026-10-30 | Codex (cleanup chat) |
| [src/components/molecules/game/SeasonScheduleGrid.js](<src/components/molecules/game/SeasonScheduleGrid.js>) | 169 | Extracted existing desktop/mobile boards and cells. | Preserved different logo-sizing rules. | 2026-10-30 | Codex (cleanup chat) |
| [src/utils/seasonScheduleModel.js](<src/utils/seasonScheduleModel.js>) | 229 | Added shared cell details and moved group-game predicate. | Existing payload fallbacks and historical week windows not fully audited. | 2026-10-30 | Codex (cleanup chat) |
| [src/components/game/page/boxscore/PassingProductionClean.js](<src/components/game/page/boxscore/PassingProductionClean.js>) | 209 | 411 -> 209 lines; moved spotlight and zone adapter. | Imports passing model and team identity from production utilities. | 2026-10-31 | Codex (cleanup chat) |
| [src/components/game/page/boxscore/PassingSpotlight.js](<src/components/game/page/boxscore/PassingSpotlight.js>) | 135 | Extracted existing spotlight, chips and grid renderer. | No visual redesign. | 2026-10-30 | Codex (cleanup chat) |
| [src/utils/gamePassingZones.js](<src/utils/gamePassingZones.js>) | 57 | Isolated completed-game measured/called-zone adapter. | Not a universal season/player/preview adapter. | 2026-10-30 | Codex (cleanup chat) |
| [src/utils/gamePassingZones.test.js](<src/utils/gamePassingZones.test.js>) | 67 | Six focused regression tests. | Extend when its contract changes. | 2026-10-30 | Codex (cleanup chat) |
| [src/pages/game-center/TeamSchedulePage.js](<src/pages/game-center/TeamSchedulePage.js>) | 538 | Full page cleanup: removed dead `GameRowOld`, centralized row derivation in one view-model helper, and extracted repeated completed/upcoming list wrappers. | Shared hook/model semantics and backend-derived filter taxonomy remain separate work; browser verification outstanding. | 2026-10-31 | Codex — Team Schedule review |
| [src/hooks/useTeamScheduleData.js](<src/hooks/useTeamScheduleData.js>) | 121 | Data-layer cleanup: normalized shared defaults (`all` filter + v5 id helper) and memoized `useTeamRecentGames` derivation without changing query keys/enabled gates/fallback flow. | Scoped/wide transport fallback policy remains intentionally unchanged. | 2026-10-31 | Codex — Team Schedule data review |
| [src/utils/teamScheduleModel.js](<src/utils/teamScheduleModel.js>) | 70 | Data-layer cleanup: removed repeated search-text work for non-text filters, reused `getTeam`, and split completed/upcoming in one pass. | Filter taxonomy is still string/flag heuristic pending backend contract fields. | 2026-10-31 | Codex — Team Schedule data review |
| [src/pages/game-center/StandingsPage.js](<src/pages/game-center/StandingsPage.js>) | 1188 | Full page review and cleanup: removed unused matrix ref, removed unused mobile prop, and replaced repeated `rows.find(...)` lookups with row-id maps in desktop/mobile finish matrices. | Standings-race semantic assumptions (context-card derivation, fallback matrix defaults, and power metric proxy) remain unchanged and should be reviewed separately from structural cleanup. | 2026-10-31 | Codex — Standings review |

Verification already completed:

- GamePage: ESLint and diff checks.
- Passing extraction: six tests; output parity for 1,451 player rows from 72 game
  files; moved spotlight body comparison; syntax and ESLint checks.
- Schedule extraction: unchanged renderer/page JSX comparisons, helper parity
  for 2,475 cells across 42 season/group/filter combinations, import resolution,
  ESLint and diff checks.
- No full browser regression or production build has been performed in this
  cleanup sequence. Extracted lines are reorganized code, not deleted features.

## Inspected, but not fully cleaned

| File / family | Finding | Next action |
|---|---|---|
| useSeasonScheduleData.js | Fetching and selection already separated from UI. | Leave alone unless the schedule audit reveals a concrete issue. |
| GamePageShell.js / SummaryTab.js | Reviewed current callers; removed unused summary drives forwarding. | Keep existing layout and fallback behavior; downstream work tracked separately. |
| page/index.js | Import/export tracing only. | Barrel-wide export audit remains pending. |
| QGameBoxScore.js | Refactored 2026-10-31: 191-line compatibility/composition entry; pure models and separate lab panels. | Semantic fallback/identity issues remain documented separately. |
| PlayerProductionMaps.js | Live player consumers; multiple map types and estimated passing fallbacks. | Structural split complete; separately design honest unavailable-data handling. |
| GamePreviewScout.js | Separate screen/export grids; current working changes. | Coordinate ownership, then separate presentation from preparation. |
| PassingGridPosters.js | Simple/detailed cards share an aggregate source but differ intentionally. | Preserve separate presentations; coordinate with current author. |
| PlayerProfileControlStrip.js v1 | No current code callers found; design doc explicitly retains it. | Retained reference, not approved for deletion. |

See [Passing Grid Architecture](<src/pages/game-center/md/Passing Grid Architecture.md>)
and [Backend feedback](<src/pages/game-center/md/Backend Notes 2026-10-30.md>) for
charting basis, sample, depth thresholds, coverage and metric-contract questions.

## Priority 1: finish the Game Center dependency chain

Suggested order balances shared dependencies with the pages we have started.
Coordinate any file with existing changes before implementation.

| Order | File | Lines | Review focus |
|---:|---|---:|---|
| 1 | [src/components/organisms/test/QGameBoxScore.js](<src/components/organisms/test/QGameBoxScore.js>) | 191 | Completed structural extraction; see QGameBoxScore Cleanup.md. |
| 2 | [src/components/game/page/summary/GameSummaryTabV2.js](<src/components/game/page/summary/GameSummaryTabV2.js>) | 235 | Structural extraction complete; composition and compatibility exports remain. Visual/semantic follow-up still pending. |
| 3 | [src/components/game/page/GamePageShell.js](<src/components/game/page/GamePageShell.js>) | 179 | Trace props into desktop/mobile; remove only proven unused forwarding and branches. |
| 4 | [src/components/game/page/summary/SummaryTab.js](<src/components/game/page/summary/SummaryTab.js>) | 37 | Small wrapper; check unused forwarding before any larger restructuring. |
| 5 | [src/components/game/page/boxscore/ProductionPrimitives.js](<src/components/game/page/boxscore/ProductionPrimitives.js>) | 6 | Completed: focused helpers, bars, tables and spotlight; compatibility exports retained. |
| 6 | [src/pages/game-center/TeamSchedulePage.js](<src/pages/game-center/TeamSchedulePage.js>) | 538 | Reviewed 2026-10-31: removed dead row branch and deduplicated page-local row/list logic. |
| 7 | [src/pages/game-center/StandingsPage.js](<src/pages/game-center/StandingsPage.js>) | 1188 | Reviewed 2026-10-31: removed dead bindings and deduplicated finish-matrix row lookup work. |
| 8 | [src/components/molecules/game/PlayByPlayPanel.js](<src/components/molecules/game/PlayByPlayPanel.js>) | 1095 | Separate play preparation, controls and repeated renderers; coordinate current changes. |
| 9 | [src/components/game/preview/GamePreviewScout.js](<src/components/game/preview/GamePreviewScout.js>) | 767 | Separate page/export presentations while preserving samples and grid semantics. |

Current dependency outlines (not exhaustive):

~~~text
GamePage -> GamePageShell -> SummaryTab -> GameSummaryTabV2
                         -> GamePageMobile -> mobile summary / production
                         -> BoxScoreTab -> PassingProductionClean
                                             -> PassingSpotlight -> gamePassingZones
                                             -> utils/gameBoxScore (passing model + team identity)

SeasonSchedulePage -> useSeasonScheduleData -> seasonScheduleModel
                   -> SeasonScheduleBanner (desktop/mobile)
                   -> SeasonScheduleGrid (desktop/mobile) -> seasonScheduleModel

PlayerDetailPage -> PlayerProfileControlStripV2 -> molecules/player/productionMaps/PlayerProductionMap
PlayerAdvancedTab -----------------------------> molecules/player/productionMaps/PlayerProductionMap
DeepDiveCharts -> PassingGridPosters (simple/detailed)
~~~

## Priority 2: broader feature reviews

These are inventory leads, not completed audits. Review parent, hook/model,
children and mobile/export versions together; do not split solely by line count.

| File | Lines | Proposed review |
|---|---:|---|
| [src/pages/players/RostersPage.js](<src/pages/players/RostersPage.js>) | 2084 | Roster controls, mode composition, repeated team/player views. |
| [src/pages/players/PlayersPage.js](<src/pages/players/PlayersPage.js>) | 526 | Discovery/table/filter boundaries and reusable player views. |
| [src/pages/players/PlayerDetailPage.js](<src/pages/players/PlayerDetailPage.js>) | 475 | Production imports from lab and player-page assembly. |
| [src/components/organisms/test/PlayerProductionMaps.js](<src/components/organisms/test/PlayerProductionMaps.js>) | 2 | Compatibility exports only; both live consumers use production maps directly. Estimated fallbacks remain a correctness follow-up. |
| [src/components/organisms/stats/TeamAnalyticsTabs.js](<src/components/organisms/stats/TeamAnalyticsTabs.js>) | 2237 | Tab orchestration versus individual analytics bodies. |
| [src/components/organisms/stats/TeamAnalyticsTileStrip.js](<src/components/organisms/stats/TeamAnalyticsTileStrip.js>) | 109 | Tile bodies, shared animation/presentation, registry and mobile tab bar extracted; browser pending. |
| [src/components/organisms/stats/TeamProfilePhasesPassingCopy.js](<src/components/organisms/stats/TeamProfilePhasesPassingCopy.js>) | 180 | Section definitions, renderers, cells and presentation helpers extracted; live Profile controller retained. |
| [src/components/molecules/schools/UtilityRows.js](<src/components/molecules/schools/UtilityRows.js>) | 1188 | Live cards moved to SchoolsExplorerCards; remaining variants disconnected and flagged for archive review. |
| [src/components/molecules/roster/RosterHubCards.js](<src/components/molecules/roster/RosterHubCards.js>) | 12 | Compatibility exports; card implementations and pure helpers extracted; browser pending. |
| [src/hooks/useSWACData.js](<src/hooks/useSWACData.js>) | 30 | Public hook API retained; queries separated into players, schools, coaches, officials and game/wiki modules, with shared fetchers and normalizers. |
| [src/hooks/useRouteSideNav.js](<src/hooks/useRouteSideNav.js>) | 628 | Route mapping tables and pure helpers; preserve declarative design. |
| [src/pages/teams/TeamDetails.js](<src/pages/teams/TeamDetails.js>) | 191 | Hub composition and shared team context. |

## Priority 3: archives, duplication and bundle impact

- GamePage_Legacy.js imports GameBoxScore.js. Establish whether that whole chain
  has any route/tool consumers before calling either file dead.
- statsTileMock.js and homeStatsTileMock.js are both 1,825 lines. Compare contents
  and provenance before deduplicating. The production-named copy is imported by
  HomeHero and MobileMenu, so it is not simply an unused lab fixture.
- Audit organisms/test, test/legacy and test/archive against active registries,
  the tested-design archive, lab routes and production imports. Preserve intended
  reference artifacts; relocation must update imports and documentation.
- Audit component barrels and public exports before removal. The inventory's
  inbound counts do not establish transitive reachability from App/index.
- Bundle/runtime cost and repository size are different problems. Static JSON,
  copied assets, scripts and public/data snapshots need their own inventory;
  they were not audited here. Do not delete backend copies or run backend writers.

## Review checklist and handoff record

For each picked file/family, record:

1. Owner/chat and exact files claimed; current git changes checked.
2. Live routes, desktop/mobile/compact/export consumers and lab/archive consumers.
3. Data contract, public exports and behavior that must remain stable.
4. Actual dead code evidence; intended extractions and any semantic issues deferred.
5. Files changed, focused checks, visual coverage and remaining concerns.
6. Updated status here and in the inventory; release ownership after handoff.

Status vocabulary: **Not reviewed** -> **Inspected/partial** -> **Reviewed** or
**Refactored/verified**. **Retained reference** and **Awaiting data contract** are
explicit outcomes. Do not mark an entire feature done after cleaning its parent.

Next recommended unit for this chat: review ProductionPrimitives.js or StandingsPage after checking active claims.
QGameBoxScore structural extraction is complete; its semantic issues are a separate backlog.

## 2026-10-31: QGameBoxScore completed structural pass

Reviewed: 2026-10-31. Reviewed by: Codex (cleanup chat).

[Detailed handoff](<src/pages/game-center/md/QGameBoxScore Cleanup.md>).
Moved three pure models, identity/formatting helpers and four lab presentations
out of the legacy entry. Updated five production imports. Removed two unused
calculations and retained all compatibility exports. Verified 432 real-game
model comparisons, unchanged extracted declarations, 14 tests and clean lint.
Browser visual verification remains outstanding.

## 2026-10-31: Game summary batch 1

Reviewed: 2026-10-31. Reviewed by: Codex (cleanup chat).

[Detailed handoff](<src/pages/game-center/md/Game Summary Cleanup.md>).
Reviewed GamePageShell and SummaryTab; removed unused drives forwarding.
GameSummaryTabV2 reduced from 3,594 to 2,548 lines by extracting scoring summary,
win probability, drive cards/field strip, pure row preparation and shared
primitives. Removed four unreferenced private bindings; retained the explicitly
deferred field-position feature. Preserved current working changes and exports.
Verified 95 retained declarations, 1,788 drive rows and 576 initial component
outputs; clean lint. Browser verification and the remaining summary cleanup
are outstanding.

QGameBoxScore reachability follow-up: no current src/index.js -> App import path
reaches the compatibility component or its three remaining lab callers. The
extracted production utilities remain reachable. Retention/archive review is
pending; this is not deletion authorization.

## 2026-10-31: Game summary batch 2

Reviewed: 2026-10-31. Reviewed by: Codex (cleanup chat).

Metrics and team-stat models, the shared metrics hook and two desktop cards are
extracted. Mobile imports the shared logic directly; old exports remain. Summary
parent reduced from 2,548 to 1,909 lines. Verified historical and 2026 backend
metrics, unchanged declarations/card output, formatting/bar behavior and clean
lint. See [batch handoff](<src/pages/game-center/md/Game Summary Cleanup.md>).
Browser verification remains outstanding; leaders/performers/scoring plays and
the retained field-position experiment are still in the parent.

## 2026-10-31: Game summary batch 3

Reviewed: 2026-10-31. Reviewed by: Codex (cleanup chat).

Extracted leaders, notable performers, scoring plays, shared candidate-image
handling and pure player/scoring helpers. Parent: 1,909 -> 1,112 lines. Mobile
imports cards directly; legacy exports remain. All 38 original declarations,
mobile bodies and public exports matched the baseline; eight files passed
ESLint. Browser verification remains outstanding. Existing mock performer
fallback remains unchanged and needs a separate unavailable-data review.

## 2026-10-31: Team schedule page full review

Reviewed: 2026-10-31. Reviewed by: Codex — Team Schedule review.

Scope of review: full page review of [src/pages/game-center/TeamSchedulePage.js](<src/pages/game-center/TeamSchedulePage.js>) with read-only tracing of [src/hooks/useTeamScheduleData.js](<src/hooks/useTeamScheduleData.js>), [src/utils/teamScheduleModel.js](<src/utils/teamScheduleModel.js>), and [src/components/organisms/test/TeamScheduleBannerA.js](<src/components/organisms/test/TeamScheduleBannerA.js>).

Work completed:
- Removed dead, unrendered `GameRowOld` and its now-unused formatter.
- Consolidated duplicated desktop/mobile row derivations into a single page-local `buildGameRowViewModel` helper.
- Extracted repeated completed/upcoming list wrappers into one local renderer while preserving loading/error/empty behavior and mobile/desktop composition.

Validation performed:
- `npx eslint src/pages/game-center/TeamSchedulePage.js` (pass).
- Local import/symbol check inside the edited file (pass).

Remaining concerns and dependencies not audited:
- No browser visual pass was run in this chat.
- Shared filtering semantics and payload contracts in `useTeamScheduleData` / `teamScheduleModel` were intentionally left unchanged.
- The desktop row remains the current card-style treatment; no design reset was performed.

## 2026-10-31: Team schedule data-layer review

Reviewed: 2026-10-31. Reviewed by: Codex — Team Schedule data review.

Scope of review: full review and cleanup of [src/hooks/useTeamScheduleData.js](<src/hooks/useTeamScheduleData.js>) and [src/utils/teamScheduleModel.js](<src/utils/teamScheduleModel.js>), with consumer tracing of [src/pages/game-center/TeamSchedulePage.js](<src/pages/game-center/TeamSchedulePage.js>), [src/pages/teams/TeamSchedulePage.js](<src/pages/teams/TeamSchedulePage.js>), [src/pages/teams/TeamDetails.js](<src/pages/teams/TeamDetails.js>), [src/components/organisms/nav/MobileMenu.js](<src/components/organisms/nav/MobileMenu.js>), and [src/components/molecules/schedule/TeamScheduleList.js](<src/components/molecules/schedule/TeamScheduleList.js>).

Work completed:
- Kept hook/model responsibilities intact (query/state in hook, pure filtering/derivation in model).
- Removed duplicated literal defaults by introducing shared local constants in the hook.
- Memoized `useTeamRecentGames` model derivation and recent-game slicing to avoid redundant recompute churn on unchanged inputs.
- Optimized model filtering internals by computing prose search text only for prose-based filters and by splitting completed/upcoming in one pass.
- Preserved all public exports/returned fields, query keys, enabled conditions, scoped-team fetch with season-wide fallback, fixed-team behavior, and filter reset semantics.

Validation performed:
- `npx eslint src/hooks/useTeamScheduleData.js src/utils/teamScheduleModel.js` (pass).
- Representative parity script comparing pre/post model logic over 2025 current-export schedule data plus synthetic missing-data/external-opponent cases: matched outputs for 7 team entries × 7 filters.
- Import/consumer trace confirmed no caller contract changes for team schedule pages or mobile menu fetch warm-up.

Remaining concerns and dependencies not audited:
- No browser visual verification was performed (data-layer-only pass).
- Scoped availability fallback still treats any scoped fetch failure as a season-level fallback trigger; this pre-existing transport policy was not changed.
- Filter definitions (`championship` / `postseason`) still rely on mixed flags and string matching pending stronger backend classification fields.

## Review attribution and agent coordination

Historical reviewer for this chat: **Codex (cleanup chat)**. Initial page/passing
reviews were on 2026-10-30; box-score and summary batches were on 2026-10-31.
The inventory now records Last reviewed, Reviewed by and Active owner per file,
including partial inspections. Unreviewed files have no reviewer/date.

Before editing, each agent should claim exact files in Active owner using a
unique name or chat label. Check claims and existing working changes, then
record date, reviewer, scope and validation when done and release the claim.
A shared model or barrel requires coordination with all affected owners.
No agent is currently assigned by this update. Suggested independent work for
another agent: StandingsPage and its page-specific components; check shared
standings/schedule utilities before claiming them. Keep GameSummaryTabV2 and its current
extractions together as a separate work area.

When refreshing the inventory, preserve review dates, reviewer names and active
claims; do not reset them from file timestamps or Git status.

## 2026-10-31: Summary structural pass completed

Reviewed: 2026-10-31. Reviewed by: Codex (cleanup chat).

Parent: 1,112 -> 235 lines. Extracted factoid model/card and shared animation
styles. Preserved the deferred field-position implementation in
organisms/test/GameFieldPositionMarch.js without adding it to live imports or
the active registry. All 15 declarations/JSX and the public exports match the
baseline; five files pass ESLint and import/encoding checks. Browser validation
and previously documented statistical/mock-data concerns remain outstanding.

## 2026-10-31: Production primitives structural pass

Reviewed: 2026-10-31. Reviewed by: Codex (cleanup chat).

ProductionPrimitives.js: 771 -> 6 lines (compatibility exports). Split pure
formatting/colors and production indexing from bars, tables and spotlight UI.
Eight caller imports migrated, including export-image callers. All extracted
declarations and caller bodies match baseline AST; exports/imports preserved.
Fourteen files pass ESLint and encoding/import checks. No browser verification
performed. Existing responsive table measurement and portrait fallbacks remain.
No proven dead code was found in this module. Team Schedule files untouched.

## 2026-10-31: Team Schedule peer review

Reviewed by: Codex (cleanup chat). Original cleanup reviewer: Codex — Team
Schedule review. No actionable code regressions found. Compared 24 row states
(win/loss/tie/upcoming, home/away/neutral, covered/unknown opponents) and 20
page states (mobile/desktop, selected/unselected, loading/error/empty/filter-empty/
loaded) against the pre-cleanup Git version. All 44 structural output comparisons
passed with mocked UI/imports; ESLint passed. Confirmed private GameRowOld and
fmtDate had no remaining callers. Corrected stale map counts to 538 lines.
These are structural checks, not browser visual/interaction verification.

## 2026-10-31: Live rushing and defense panels

Reviewed: 2026-10-31. Reviewed by: Codex (cleanup chat).

RushingProductionClean: 473 -> 125 lines; DefenseProductionClean: 289 -> 182.
Extracted live production models into utils/gameProduction (distinct from the
older lab models in utils/gameBoxScore). Rushing context/spotlight rendering
has focused files. Havoc normalization moved out of the chart into a pure model;
chart compatibility export retained. All 28 declarations and JSX match baseline;
exports/imports and UTF-8 checks pass. Eight files pass ESLint. No browser
verification performed. Statistical defaults and charting definitions are
unchanged. Team Schedule hook/model work left to the other agent.

## 2026-10-31: Team schedule data peer review

Reviewed by: Codex (cleanup chat). Original reviewer: Codex — Team Schedule
data review. Found and fixed one contract regression: unknown team IDs returned
undefined after getTeam reuse; restored the original null with `?? null`.
441 model comparisons passed across team IDs, filters and empty/sample inputs
(with unchanged normalization mocked). Both files pass ESLint. Query keys,
enabled gates, fetch fallback, fixed-team guard and filter resets are unchanged.
Recent-game memo dependencies cover team data, ID and count. Browser verification
remains outstanding; previously documented transport/classification policies
remain unchanged.

## 2026-10-31: Special teams production

Reviewed: 2026-10-31. Reviewed by: Codex (cleanup chat).

SpecialTeamsProductionClean: 394 -> 161 lines. Extracted pure data preparation
and player-chip logic into specialTeamsModel.js; team metrics line into
SpecialTeamsLine.js. All 12 declarations/JSX match the current-work baseline;
three files pass ESLint, import and UTF-8 checks. Public panel exports retained.
No browser verification performed. Existing null/default policies remain.

## 2026-10-31: Standings page full review

Reviewed: 2026-10-31. Reviewed by: Codex — Standings review.

Scope of review: full review and cleanup of [src/pages/game-center/StandingsPage.js](<src/pages/game-center/StandingsPage.js>), with dependency/caller trace through [src/App.js](<src/App.js>) and page-local standings-race adapters/renderers.

Work completed:
- Removed an unused matrix-card ref (`cardRef`) that had no behavior impact.
- Removed the unused `def` prop from `DivisionTableMobile` and updated callers.
- Replaced repeated per-row `group.rows.find(...)` lookups inside desktop/mobile finish-matrix render loops with row-id maps, preserving all displayed values and tie-break presentation.
- Kept all standings/ranking/tie-break/filter behavior, query usage, routes, exports, and mobile/desktop layouts unchanged.

Validation performed:
- `npx eslint src/pages/game-center/StandingsPage.js` (pass).
- Syntax/import checks via ESLint and direct file inspection after edits.
- Focused behavior check: changes are structural-only around row lookup and unused bindings; comparator and model logic paths remain unchanged.

Remaining concerns and limitations:
- No browser visual verification was performed in this chat.
- Semantic/data-contract assumptions are unchanged (e.g., power metric proxy on `diff`, fallback finish matrix defaults, and context-item derivation from available fields).
- Shared hooks/models/components were intentionally not modified in this pass.

## 2026-10-31: Mobile game summary review

Reviewed: 2026-10-31. Reviewed by: Codex (cleanup chat).

SummaryMobile: 312 -> 108 lines. Extracted its three stat-card renderers and
shared part/label primitives. GameInfoCard has its own wrapper module, allowing
mobile to import it and animation styles directly without loading the desktop
summary composition. Desktop parent now 225 lines. GamePageMobile and
GameSectionHeader are reasonably sized; retained their structure. All original
declarations, JSX and exports match baseline. Seven files pass ESLint, import
and UTF-8 checks. No dead code found; browser interaction/visual verification
remains outstanding. Other agents’ assigned files untouched.

## 2026-10-31: Mobile navigation review

Reviewed: 2026-10-31. Reviewed by: Codex (cleanup chat).

Reviewed GameBannerMobile.js, useJumpSections.js and MobileTeamSwitch.js.
All three retained: no proven dead bindings or justified structural extraction.
Traced consumers in GamePageMobile, GameSectionHeader and all four production
panels. Inspected observer/ref registration and React 19 cleanup, jump ordering,
banner tabs/ticker and team-switch callbacks. ESLint and UTF-8 checks pass.
No code changes or browser interaction verification performed. Banner identity
fallbacks and hardcoded observer root margin are pre-existing context assumptions;
any behavior changes need their own targeted verification.

## 2026-10-31: User browser check and Data Room review

User reported the current browser experience looks good. Specific routes, sizes
and actions were not enumerated; do not treat that as exhaustive regression
coverage. This report precedes the Data Room extraction below.

Reviewed: 2026-10-31. Reviewed by: Codex (cleanup chat).

DataRoomTab: 540 -> 340 lines. Shared stat rows, overview, section presentation
and jump-ref context moved to DataRoomChrome.js. Metric lists and disabled
data-quality diagnostics retained. All declarations/JSX match the baseline;
four files pass ESLint. DrivesTab and PlayByPlayTab reviewed and retained as
small focused wrappers. New Data Room extraction has no browser verification
yet; analytics semantics remain in the existing hook, not audited here.

## 2026-10-31: Data Room analytics

Reviewed: 2026-10-31. Reviewed by: Codex (cleanup chat).

User confirmed Data Room looks good in browser before this analytics extraction.
useGameAnalytics: 624 -> 5 lines. Pure numerical helpers, play derivation, drive
derivation and final assembly are in utils/gameAnalytics. Memoization inputs
and returned fields preserved. Removed four private unused formatters (fmt,
pct, signed, ratio). Outputs matched baseline on 99 real game files, including
27 current-season exports, and three missing-data cases. Five files pass ESLint.
Browser verification of this new extraction remains outstanding. Existing
analytics formulas and fallback policies are preserved, not substantively audited.
The assembly file remains a cohesive field mapping; further splitting solely
to reduce its line count is not required.

## 2026-10-31: Usage gate and browser approval

User confirmed the analytics extraction passes the browser check.
Reviewed by: Codex (cleanup chat).

Before selecting further cleanup work, trace from src/index.js through App and
its imports/re-exports/literal dynamic imports. Prioritize reachable features.
Inventory now records App-entry usage. Reachable includes statically imported
lab routes and barrels; it does not prove every export renders or enters the
final bundle. Disconnected files require an archive/retention review, including
non-app tooling, documentation and registry consumers. Test tooling stays separate.
Do not refactor disconnected families unless preparing their archive or explicitly
restoring them. Preserve another agent’s claims and historical review records.

Current disconnected family marked for archive review:

- [src/components/organisms/test/QGameBoxScore.js](<src/components/organisms/test/QGameBoxScore.js>)
- [src/components/organisms/test/QGamePageTest.js](<src/components/organisms/test/QGamePageTest.js>)
- [src/components/organisms/test/HavocSpatialLogMock.js](<src/components/organisms/test/HavocSpatialLogMock.js>)
- [src/components/organisms/test/RushLaneAxisVariants.js](<src/components/organisms/test/RushLaneAxisVariants.js>)

Their exclusively disconnected dependencies should move together if archived;
shared production utilities must remain. GameFieldPositionMarch is disconnected
but explicitly retained for future restoration, so it has a distinct retention
status. No files were moved or deleted by this audit.

Scan covers relative imports, re-exports and literal require/dynamic imports.
Nonliteral module loaders found: 0. External scripts, CSS @imports,
conditional runtime reachability and documentation are outside this graph.

## 2026-10-31: Live game adapter review

Reviewed by: Codex (cleanup chat). Reviewed normalizePlays.js (89 lines),
normalizeDrives.js (14) and page/utils/teamHelpers.js (11). All retained:
small cohesive adapters/helpers, no dead bindings or justified extraction.
Confirmed usage through GamePage -> normalizeDrives, GamePageShell ->
PlayByPlayTab -> normalizePlays/teamHelpers, and live production spotlight/Data
Room consumers of teamHelpers. Labels and fallback colors differ from the other
identity helper families; no semantic consolidation performed. Normalization
assumes supported flat play/drive schemas and does not itself define canonical
backend statistics. ESLint and UTF-8 checks pass. No implementation changes.
Next live candidate: molecules/game/PlayByPlayPanel.js; check ownership first.

## 2026-10-31: Live play-by-play panel

Reviewed: 2026-10-31. Reviewed by: Codex (cleanup chat).

Usage confirmed: src/index -> App -> GamePage -> GamePageShell ->
PlayByPlayTab -> PlayByPlayPanel. Panel reduced from 1,095 to 278 lines.
Extracted pure display/filter definitions, memoized play row, desktop controls
and mobile controls. Root retains player selection, filter state and derived
play/player/drive lists. All 30 declarations and JSX match the pre-edit working
baseline, including state and filtering rules; PlayRow displayName preserved.
Five files pass ESLint, import and UTF-8 checks. No dead code found.
Browser check needed for player search, filter combinations, row expansion and
mobile team/player picker. Existing raw-text parsing, drive matching and scoring
badge semantics remain unchanged; they are not corrected by this extraction.
All new files are on the existing live import path, not archive candidates.

### Play-by-play browser confirmation

2026-10-31: User reported the refactored play-by-play experience is working
fine in the browser. Recorded by Codex (cleanup chat). This confirms the
reported experience; individual viewport/action coverage was not enumerated.

## 2026-10-31: Live game info and series cards

Reviewed: 2026-10-31. Reviewed by: Codex (cleanup chat).

GameInfoPassport is used through GameInfoCard on both desktop and mobile.
Removed unused React, HStack and Grid imports and their lint suppressions.
SeriesCards is used by both summary layouts and is retained as a focused
shared renderer; no dead code or worthwhile split found. Both files pass ESLint.
Desktop GameBannerScoreboardA is confirmed live through GamePageShell, despite
its lab location. Partial inspection only: its sizable inline layout/data
assembly remains an active cleanup candidate, not an archive candidate.
It also passes ESLint. No layout or runtime behavior changed in this batch.

## 2026-10-31: Largest live pages - refreshed queue

Reviewed by: Codex (cleanup chat). Prioritize live production routes by size;
lab routes and disconnected legacy files are separate queues.

| Page | Lines | Status |
|---|---:|---|
| [src/pages/players/PlayersPage.js](<src/pages/players/PlayersPage.js>) | 526 | Next large unreviewed page |
| [src/pages/game-center/StandingsPage.js](<src/pages/game-center/StandingsPage.js>) | 1301 | Other agent reviewed; preserve their work |
| [src/pages/players/RostersPage.js](<src/pages/players/RostersPage.js>) | 161 | Partial extraction complete; mode composition still pending |
| [src/pages/teams/TeamDetails.js](<src/pages/teams/TeamDetails.js>) | 191 | Not reviewed |
| [src/pages/players/PlayerDetailPage.js](<src/pages/players/PlayerDetailPage.js>) | 475 | Not reviewed |
| [src/pages/officials/OfficialsPage.js](<src/pages/officials/OfficialsPage.js>) | 392 | Not reviewed |

GamePage_Legacy.js and GameBoxScore.js remain disconnected archive-review
candidates; their size does not justify active feature refactoring.

### Roster hub batch 1

Reviewed: 2026-10-31. Reviewed by: Codex (cleanup chat).
Reachable through App -> RostersPage on the live roster routes. Page reduced
from 2,084 to 779 lines. Extracted configuration, aggregation/range helpers,
shared card primitives and composition/physical/geographic/transfer charts.
All 46 declarations and JSX match baseline. Sixty aggregation/range comparisons
passed across the five existing 2021-2025 roster payloads. Eight files pass
ESLint, import resolution and UTF-8 checks. No statistical definitions or
responsive layouts changed. Browser verification needed for all three roster
modes, year/team selection and position-range controls. Page mode renderers
and selector remain in the parent for the next bounded pass.

## 2026-10-31: Roster mode boundaries

Reviewed by: Codex (cleanup chat). RostersPage is now 161 lines.
LeagueRosterView owns league layout; DivisionRosterView owns division
aggregation/layout; TeamRosterView owns the selected-team dashboard;
RosterHubControls owns mode/KPI controls and selection UI. The page retains
year/mode/team state, data hooks and composition. These are responsibility
boundaries, not splits made to hit a line-count target.
All ten prior declarations/JSX match baseline; five files pass ESLint, imports
and UTF-8 checks. All new files are live dependencies. Browser review remains
needed across roster modes and widths. No features/statistical meaning removed.
Next largest unreviewed live page: PlayersPage.js (1,369 lines).

## 2026-10-31: Player hub view boundaries

Reviewed by: Codex (cleanup chat). User confirmed the roster changes look good
in browser; individual action/viewport coverage was not enumerated.

PlayersPage is live through App and remains the route-level owner of filters,
pagination, selection, navigation and data hooks. Extracted discovery cards,
leaderboard and transfer views, their shared leaderboard row, active lab-link
presentation and identity/display configuration. These files have distinct
view/reuse responsibilities; none is an archive candidate. Parent now 526
lines, from 1,369. All 19 declarations/JSX match baseline after newline
normalization; seven files pass ESLint, local-import and UTF-8 checks.
No behavior/statistical definitions changed. Historical year defaults, filter
semantics and data readiness remain as before and need separate consideration
if changed. Browser review needed for player views, search/filters, pagination,
player links and leaderboard/transfer controls. Page-level model/control
boundaries still need review; this is not a full feature audit.

## 2026-10-31: Player database boundary

Reviewed by: Codex (cleanup chat). User approved the previous player-hub view
extraction in browser. This subsequent pass separates PlayerDatabase controls/
results from pure filterPlayersHub rules. PlayersPage retains its state, data
loading, filter-reset handlers, navigation and discovery-board composition.
Database has explicit inputs; no state duplication or new context introduced.
Page now 152 lines. Existing database JSX and filter body match baseline;
324 filter combinations matched, including unknown conference/no-match cases.
Three files pass ESLint and imports. Historical search behavior and loading
policies are preserved, not silently corrected. Browser verification of this
last extraction remains pending. New files are reachable through PlayersPage.
Next large unreviewed production page: TeamDetails.js (523 lines).

## 2026-10-31: Team details source/layout boundaries

Reviewed by: Codex (cleanup chat). Live through App -> TeamDetails.
Separated legacy profile and newer hub-document mapping functions into
models/teamProfileAdapters.js, and mobile composition into TeamDetailsMobile.
The page keeps data hooks, season state, loading states, source precedence,
identity joins and desktop composition. It is now 191 lines (was 523).
All 27 declarations/JSX match baseline; three files pass ESLint, local-import
and UTF-8 checks. Other agents’ schedule model/hook files were read only.
Browser review needed for selected year, team profile cards and phone layout.

Deferred data-correctness concern: the pre-existing legacy profile branch
still supplies literal gameContext and keyStats values for the spotlight
(LAST GAME WEEK 4 SOUTHERN, +4.2, 245, 68%). Preserved during extraction;
these need a separate real-data/unavailable-state change. No new placeholders
were added. This structural review is not certification of those numbers.

## 2026-10-31: Player profile identity boundary

Reviewed by: Codex (cleanup chat). User approved TeamDetails in browser.
PlayerDetailPage is live through App. Extracted pure identity lookup, roster
matching, profile-game mapping and comparison helpers into playerProfileModel.
Page retains data hooks, URL tabs, state and layout. Parent: 475 -> 342 lines.
Adapter bodies match baseline after the location.state parameter substitution.
Person ID, encoded name/team URLs, state precedence and unavailable/played-game
cases passed. Two files pass ESLint. No browser check of this new pass yet.
Remaining page comparison/layout assembly needs a separate review.

Deferred correctness concern: rosterPlayers memo depends only on seasonRows.length;
a same-size roster update can retain old records. Preserved in this structural
pass; any correction needs a focused same-length update test. Legacy percentile,
rating and roster-context fallback policies are also preserved.

## 2026-10-31: Profile comparison hook and stale-roster correction

Reviewed by: Codex (cleanup chat). User confirmed profile URL reload looks good
for the previous identity extraction. Moved peer/comparison preparation into
usePlayerProfileComparisons; 19 comparison declarations match baseline.
Removed the roster memo keyed only on row count: profiles now use current
seasonRows, including updates of unchanged length. This resolves the stale-data
concern recorded above. A page-level regression test passes across a season
change and a subsequent same-season roster update, both with identical count.
Routing/presentation are mocked in that focused test (virtual router mock used
for the CRA Jest resolver). Three files pass ESLint. No new browser verification
performed for this pass. Public profile tabs and adapter contracts preserved.

## 2026-10-31: Five largest unreviewed reachable files

Reviewed by: Codex (cleanup chat). Selected from the refreshed size ranking;
reachable lab routes and static fixtures are explicitly distinguished below.

| File | Before / after | Review result and execution context |
|---|---:|---|
| [src/components/organisms/test/ConferenceWikiPageLabA.js](<src/components/organisms/test/ConferenceWikiPageLabA.js>) | 2242 / 96 | Production responsive banner separated from active conference-wiki lab; lab sections grouped by directory, identity, history, postseason and culture. |
| [src/components/organisms/stats/TeamAnalyticsTabs.js](<src/components/organisms/stats/TeamAnalyticsTabs.js>) | 2237 / 15 | Live team-analytics lenses separated into Board, Map, Matchup, Rating Lab, Trends and Glossary with shared primitives. |
| [src/components/molecules/game/GameProductionPanels.js](<src/components/molecules/game/GameProductionPanels.js>) | 1466 / 9 | Retained test-gamepage route only: passing, rushing, defense and special-teams renderers separated from shared model. Not the production game page. |
| [src/components/molecules/home/statsTileMock.js](<src/components/molecules/home/statsTileMock.js>) | 1825 / unchanged | Static fixture used by HomeHero/MobileMenu. Provenance flags distinguish real/placeholder fields; no data changed. |
| [src/components/organisms/test/gamePreviewScoutMock.js](<src/components/organisms/test/gamePreviewScoutMock.js>) | 1424 / unchanged | Static preview-lab fixture. Header identifies mocked sacks/air-yards fields and lab ranks; no data changed. |

All five are used; none is marked for archiving. Static data was not split
merely to reduce physical lines. The pre-existing static ConferenceWikiBanner.js
was left untouched; the live variant is ConferenceWikiResponsiveBanner.js.
SchoolsWikiPage now imports the live banner directly. Three profile consumers
import analytics primitives directly, preserving their other working changes.
Original public exports remain for compatibility.

Validation: 143 original declarations/JSX checked before dead-code removal;
141 retained compiled bodies match afterward. Two private unused lab helpers
(getTeamLabel/getTeamColor) removed after reference checks. Local symbols,
exports, encoding and extraction-module cycles verified. Thirty files linted:
zero errors, one pre-existing exhaustive-deps warning in TeamProfilePhases
(countingTeams); confirmed the baseline has the same warning. Fixtures have
no diff. No browser check or full production build performed.

### Browser checklist for this batch

- /schools/wiki: banner at desktop, compact and phone widths.
- /team-analytics: Board, Map, Matchup, Rating Lab, Trends and Glossary;
  change season/team scopes and one filter/metric/slider per lens. Also open a
  team Profile and its phase/radar sections because shared primitives moved.
- /lab/conference-wiki: scroll all sections; check directory rotation, history
  and rivalry/timeline interactions.
- /lab/test-gamepage: passing/rushing player selection and all four production
  panels. These lab routes may be excluded from demo builds.

Report blank panels, missing controls, clipping or console errors with the route
and action. Static fixture files were retained without changing their values.

## 2026-10-31: Next five large component families

Reviewed by: Codex (cleanup chat). All five current import chains were checked
from application routes. No statistical or visual behavior was intentionally
changed. Baselines were captured from current working files to preserve other
agents' edits, including the earlier PassingCopy primitive import change.

| Reviewed file | Before / after | Responsibility and remaining scope |
|---|---:|---|
| [src/components/molecules/schools/UtilityRows.js](<src/components/molecules/schools/UtilityRows.js>) | 1351 / 1188 | Live cards moved to SchoolsExplorerCards; remaining variants disconnected and flagged for archive review. |
| [src/components/organisms/stats/TeamAnalyticsTileStrip.js](<src/components/organisms/stats/TeamAnalyticsTileStrip.js>) | 1244 / 109 | Tile bodies, shared animation/presentation, registry and mobile tab bar extracted; browser pending. |
| [src/components/molecules/roster/RosterHubCards.js](<src/components/molecules/roster/RosterHubCards.js>) | 1191 / 12 | Compatibility exports; card implementations and pure helpers extracted; browser pending. |
| [src/components/organisms/test/PlayerProductionMaps.js](<src/components/organisms/test/PlayerProductionMaps.js>) | 1046 / 2 | Compatibility exports only; both live consumers use production maps directly. Estimated fallbacks remain a correctness follow-up. |
| [src/components/organisms/stats/TeamProfilePhasesPassingCopy.js](<src/components/organisms/stats/TeamProfilePhasesPassingCopy.js>) | 981 / 180 | Section definitions, renderers, cells and presentation helpers extracted; live Profile controller retained. |

Implementation ownership:

- SchoolsExplorerCards contains the two live Schools utility cards together.
  Teams imports it directly. No source imports remain for UtilityRows. Its
  unused roster/coaches/stat-lab variants, fixture totals and two old useEffect
  calls are retained for archive review, not refactored as live code. No new
  useEffect calls were introduced. Do not delete these variants until retention
  and lab-reference policy are checked.
- analyticsTiles owns per-tab readouts, the shared size/animation primitives,
  the tab registry and the mobile bottom-sheet bar. TeamAnalyticsTileStrip
  retains strip composition. Context identity, animation clocks, transitions,
  click behavior and responsive sizing are preserved.
- roster/hubCards separates KPI sizes, composition/experience, physical profile,
  transfers, geography and depth. Shared wrappers and pure color/format/model
  helpers are separate. RosterHubCards remains the existing public export API
  used by RosterHubGrid, not an unused-file deletion candidate.
- molecules/player/productionMaps separates passing, rushing, havoc, special
  teams and offensive-line views from the position/type router and shared source
  helpers. Both live consumers now import production directly; the old test file
  is only a compatibility facade. Estimated passing, lane, kick and punt fallbacks
  remain unchanged and explicitly documented; they need a separate correctness/
  unavailable-state pass. See the updated Passing Grid Architecture document.
- stats/profilePhases separates phase definitions, stat cells, presentation
  helpers and passing/rushing/havoc maps. TeamProfilePhasesPassingCopy remains
  the live state/data/section controller used by TeamProfileTab. Player and
  team aggregate chart contracts remain distinct.

Validation: all 193 original declarations retain identical compiled bodies;
original public exports remain. Thirty-nine source files pass ESLint with zero
errors/warnings. Relative imports and named/default exports resolve, extracted
modules have no cycles, and caller changes are import-source-only. UTF-8 without
BOM verified. Full source inventory parse: zero failures. Ownership claims were
released; existing other-agent review attribution is preserved. No new browser
verification or production build performed in this batch.

Browser checks at desktop, compact and phone widths:

1. /teams (or /schools): Roster Explorer and Team Analytics cards; verify links.
2. /teams/jackson-state/roster/hub: KPI, composition, experience, physical,
   transfer, geography and depth cards; test one map/chart interaction.
3. /team-analytics: all eight tiles and their rotations, click-through, and the
   mobile tab picker; change team/season and inspect Profile phase sections,
   offense/defense switches and tooltips.
4. /player/:playerKey: current-game field map and Stats tab. Check an available
   QB pass/rush toggle, RB, defender, OL and special teams where data is present.
   Reload and change game/season to confirm the displayed map follows selection.

No dead-code deletion was justified in the four live families by the binding/
consumer checks. The concrete unused-code finding is UtilityRows' remaining
variants; avoid treating file relocation as proof that fallback-data concerns
were solved.

## 2026-10-31: Next ten largest unreviewed reachable files

Reviewed by: Codex (cleanup chat). Nine structural refactors and one unchanged
fixture review. Baselines came from the current working tree, including existing
useSWACData edits and the untracked TeamProfilePosters work. Existing bodies,
statistical meanings, source paths and layout behavior were preserved.

| File | Before / after | Scope and result |
|---|---:|---|
| [src/hooks/useSWACData.js](<src/hooks/useSWACData.js>) | 1145 / 30 | Public hook API retained; queries separated into players, schools, coaches, officials and game/wiki modules, with shared fetchers and normalizers. |
| [src/components/organisms/test/GamesHubComponentExperiments.js](<src/components/organisms/test/GamesHubComponentExperiments.js>) | 1132 / 640 | Five cards used by Tested Designs separated from fixtures/controls. Historical unused variants retained and flagged for archive review. |
| [src/components/organisms/deepDive/TeamProfilePosters.js](<src/components/organisms/deepDive/TeamProfilePosters.js>) | 974 / 19 | Existing fixed PVAMU export variants separated into team results/stats, players, context and shared poster primitives. |
| [src/components/molecules/home/playersTileMock.js](<src/components/molecules/home/playersTileMock.js>) | 963 / 963 | Reviewed static fixture; retained unchanged. Header distinguishes real 2025 people/production from placeholder game/record figures despite the 2026 presentation season. |
| [src/components/organisms/test/GamePageMagazine.js](<src/components/organisms/test/GamePageMagazine.js>) | 944 / 120 | Retained lab controller separated from scoreboard/story, metrics, players, coaching/defense, special teams and game logs. |
| [src/components/organisms/test/BannerPages.js](<src/components/organisms/test/BannerPages.js>) | 943 / 12 | Live hub banners moved into production banner modules; 9 consumer files import the production modules directly. Compatibility exports retained. |
| [src/components/organisms/test/GameProductionSharedElements.js](<src/components/organisms/test/GameProductionSharedElements.js>) | 933 / 10 | Names, header/pill, table, spotlight and disruption components separated under productionLab. Lab panel/model imports now use these modules directly. |
| [src/components/molecules/wiki/WikiHistoryBanners.js](<src/components/molecules/wiki/WikiHistoryBanners.js>) | 819 / 4 | Rivalry tiles/banner, timeline cards/dial/banner and pure history/geometry helpers separated; public exports retained. |
| [src/components/molecules/schools/SchoolDirectory.js](<src/components/molecules/schools/SchoolDirectory.js>) | 814 / 12 | Public density/variant router retained; frames, standard/compact cards, views, shared presentation and animation/model helpers separated. |
| [src/components/organisms/test/GameSummaryPacketLab.js](<src/components/organisms/test/GameSummaryPacketLab.js>) | 789 / 53 | Lab composition retained; data/model and panel families separated. Unrendered private Hero, TabRail and getTeamLogo removed. |

### Usage and archive findings

- useSWACData remains the public API so callers keep their existing imports and
  cache-sharing behavior. Fetch functions and normalizers have no dependency on
  the hook barrel. Existing query keys, retry/enable/cache settings and public
  re-exports are retained. No useEffect calls were introduced.
- BannerPages served live pages despite its lab path. Its consumers now use
  molecules/banners directly. The old file and GameProductionSharedElements
  are compatibility facades without current consumers; retain pending a separate
  compatibility/archive decision. They are not the live implementations.
- Only five GamesHubComponentExperiments exports are used by TestedDesignsPage.
  That consumer now imports gamesHubExperiments/RetainedCards. Nine older variants
  remain in the disconnected original module for archive review; their existence
  is not a reason to refactor unused designs into more files.
- GamePageMagazine and GameSummaryPacketLab are real-data lab routes, not the
  live GamePage. TeamProfilePosters is used by the desktop Team Analytics Charts
  Deep Dive export viewer. The current PVAMU snapshot and all export variants,
  poster refs, dimensions and palette behavior are unchanged.
- The summary lab never rendered Hero, even when includeBanner was passed. Its
  private Hero/TabRail/logo-helper chain was removed; includeBanner remains an
  accepted but unused compatibility prop. No new banner behavior was added.

### Validation and limits

All 334 retained original declaration bodies match their compiled baselines;
three private unused declarations were removed. Original public exports remain.
Local imports/exports, extraction-module cycles, caller bodies and UTF-8 without
BOM pass. Eighty-five source files pass ESLint with zero errors/warnings, including
the unchanged fixture. No dependency installation or production build was run.

A mocked query contract check covered all 39 moved hooks: 302 calls matched query
keys, gates, cache/retry settings and no-data return values. Ten numeric inputs
to exportId hooks produced the same pre-existing invalid-input errors. The check
does not replace populated-payload or browser verification; the unchanged-body
comparison also covers selectors, maps and other populated-data branches.

The roster fetch fallback still retries the latest shipped 2026 file after any
fetch failure, not just a missing season. Unknown positions still map to ST,
and ID conversion still strips only trailing 25. These policies and the fixture
placeholders are documented follow-ups, not silently changed by cleanup.

The inventory updater incorrectly treated the two-column dependency table as
source review rows. It now isolates the source table before updating metadata,
regenerates dependency edges separately, and counts actual source files only.
Affected metadata was repaired from cleanup-map records. Team Schedule and
Standings retain their original named reviewers. Unreviewed dependency callers
remain unreviewed; an import-source update is not a full review.

### Browser checklist

1. Home and phone menu: player tile still loads and rotates.
2. Schools: directory cards rotate and navigate; check standard/compact layouts.
   Schools Wiki: rivalry rotation plus desktop/mobile title-path timeline/dial.
3. Games, Team Schedule, Standings, Rosters, Coaches, Officials and People hubs:
   banners at desktop/compact/phone widths, season/filter controls and sheets.
4. A player profile and a team roster/coaches page: loading, team/season changes
   and reloads after the shared-hook split.
5. Team Analytics > Charts > Deep Dive > PVAMU profile: all five poster choices,
   Light/Night palettes, and one PNG export.
6. Retained labs: /lab/tested-designs (five Games Hub cards),
   /lab/test-gamepage (production tables/spotlights),
   /lab/game-magazine/:gameId and /lab/game-summary-packet/:gameId.
   Lab routes may be excluded from demo builds.

No browser verification has been performed for this batch. Report blank panels,
missing controls, changed data, clipping or console errors with route and action.

## 2026-10-31: Ten more large live and retained-lab files

Reviewed by: Codex (cleanup chat). Selected the next ten largest unreviewed,
reachable, unassigned files from the corrected source inventory. Captured current
working-tree baselines, including existing TeamProfileTab edits and untracked
DlinePosters work. Public exports, payload paths and statistical meanings remain.

| File | Before / after | Scope and result |
|---|---:|---|
| [src/pages/game-center/WeekCentralEditorialLabPage.js](<src/pages/game-center/WeekCentralEditorialLabPage.js>) | 818 / 171 | Removed private unrendered GameLogo/EditorialPanel and their unused color helper; season/game models, row rendering and controls separated from page state/layout. |
| [src/components/molecules/schools/TeamStatusBlocks.js](<src/components/molecules/schools/TeamStatusBlocks.js>) | 761 / 11 | Public exports retained; record, upcoming/review game cards, stat card and production carousel separated from formatting/shared presentation. |
| [src/components/organisms/deepDive/DlinePosters.js](<src/components/organisms/deepDive/DlinePosters.js>) | 761 / 11 | Public poster list and width retained; fixed SWAC snapshot helpers, team panels, situational panels, player panels and poster layouts separated. |
| [src/components/molecules/wiki/ConferenceFootprint.js](<src/components/molecules/wiki/ConferenceFootprint.js>) | 709 / 59 | Conference/density routing retained; geographic lookups, legends, shared map, state dial and state explorer separated. |
| [src/components/organisms/test/GamePreviewScoutA.js](<src/components/organisms/test/GamePreviewScoutA.js>) | 704 / 31 | Retained active preview lab separated into screen panels, full-size poster sections, export workflow and shared presentation. Distinct production preview left untouched. |
| [src/components/organisms/player/PlayerStatsOverview.js](<src/components/organisms/player/PlayerStatsOverview.js>) | 703 / 172 | Overview assembly retained; pure model, presentation primitives, tracks, snapshots and production/range cards separated. Existing generated counting totals explicitly documented. |
| [src/components/organisms/stats/TeamProfileTab.js](<src/components/organisms/stats/TeamProfileTab.js>) | 686 / 309 | Profile UI state/layout retained; data preparation moved intact into useTeamProfileViewModel, and jump navigation/player/stat primitives separated. |
| [src/components/molecules/game/WeekCentralBrief.js](<src/components/molecules/game/WeekCentralBrief.js>) | 682 / 127 | Completed-game composition retained; adapters, leader rows, score table, shared presentation and upcoming brief separated. |
| [src/components/molecules/wiki/ConferenceIdentityPassport.js](<src/components/molecules/wiki/ConferenceIdentityPassport.js>) | 665 / 37 | Density routing retained; desktop/compact/mobile renderers and shared facts separated. Existing rotation effect replaced with tested mount-managed timer. |
| [src/components/molecules/roster/RosterFeatureRail.js](<src/components/molecules/roster/RosterFeatureRail.js>) | 663 / 62 | Selection/pause/navigation state retained; slide model, stack rendering, roster composition, controls, stage and responsive layouts separated. |

### Consumers and boundaries

- WeekCentralEditorialLabPage is /lab/week-central-editorial, not the live weekly
  page. GamePreviewScoutA is the active component registry experiment; its
  duplicated production preview implementation was intentionally left alone.
- TeamStatusBlocks serves TeamDetails and TeamDetailsMobile; WeekCentralBrief
  serves WeeklyBriefPanel and the editorial lab. Their old public imports remain
  valid, including named exports and existing desktop/mobile distinctions.
- DlinePosters serves Team Analytics Charts > Deep Dive. The three poster
  variants, hidden export refs, palette inputs and 1400px export width remain.
- ConferenceFootprint and passport renderers serve SchoolsWikiPage. Geography
  data, remote atlas URL, state selection, responsive modes and existing facts
  are unchanged. Library identity/lookup files were not expanded into a universal
  chart renderer. The roster rail serves TeamRosterHubPage; pause, selection,
  navigation and animation-driven advance are retained.
- PlayerStatsOverview is consumed by PlayerStatsTab. TeamProfileTab is the live
  Team Analytics profile; its new model hook executes the original block at the
  same point in hook order, before the no-data return. Existing memo dependencies
  and their suppression remain; this cleanup does not resolve their independent
  data-refresh correctness questions.

### Timer correction

ConferencePassportCarousel had a dependency-keyed useEffect timer, contrary to
AGENTS.md. usePassportRotation now owns a mount-managed timeout and direct event
reset. Automatic advance still occurs every five seconds, changing face restarts
that dwell, clicking the active face keeps its existing deadline, and unmount
clears the pending timeout. The two-face 700ms transform and all carousel markup
are unchanged. The hook configuration is fixed for the mounted carousel lifetime.
Four focused fake-timer hook tests pass for these behaviors.

### Validation and remaining data work

327 unchanged declaration bodies match their compiled baselines. Three private
unused declarations were removed from the editorial lab. The Profile hook, when
inlined at its call, reconstructs the original ProfileTab body. The carousel
presentation also matches after excluding its replaced timer setup. Original
public exports, local imports/exports, encoding and extraction-module cycles
pass across all 66 touched source files. All 66 pass ESLint with zero errors or
warnings. The full source inventory parses without errors. No production build
or browser pass was performed. All edit claims were released.

Player Stats Overview still derives every component counting line through
mockCountingStats; these are not observed season totals. Its per-component
replacement share is also an approximation. A local handoff note records the
need to check existing player-season/counting payloads before asserting a backend
gap: [player backend notes](src/pages/players/md/Backend%20Notes%202026-10-31.md).
TeamProductionCard retains illustrative PRODUCTION_FALLBACK values when its
carousel data is absent. Both concerns have explicit source comments; neither
was silently corrected during extraction. The Week Central lab also retains its
existing special-game fixtures, week derivation and winner/tie policies.

### Browser checklist

1. /game-center/week: select a completed game and upcoming game; inspect the
   weekly brief, scores, leaders and upcoming schedule details on desktop/phone.
2. Team Analytics Profile: change team and season; inspect the no-data state,
   radars, leader/impact rows, player detail sheet and phone jump navigation.
3. A player Stats Overview: production blocks, ranges and recent-game summaries.
4. /schools/wiki: conference/state maps, state dial, compact legends, passport
   facts, and mobile SWAC/MEAC flip. Wait five seconds and manually change faces.
5. Team roster hub: rail advances, pause/resume, select a slide and follow its
   player/full-roster link. Check compact and phone layouts as well as desktop.
6. Team Details status cards where exposed, and Team Analytics Charts > Deep Dive
   > SWAC D-line: all three posters, Light/Night and one PNG export.
7. /lab/week-central-editorial: season/week/filter and selected-game switching.
   /lab/components: scout preview plus export overlay and one full-size PNG.
   Lab routes may be excluded from demo builds.

## 2026-10-31: Navigation, exports and the next ten files

Reviewed by: Codex (cleanup chat). Nine structural extractions and one unchanged
generated-fixture review. Used current working-tree baselines, preserving existing
WeekRecapExport and useRouteSideNav edits. These are responsibility boundaries,
not claims that moving code has resolved every data policy or rendering concern.

| File | Before / after | Scope and result |
|---|---:|---|
| [src/components/molecules/game/GamesHubCards.js](<src/components/molecules/game/GamesHubCards.js>) | 644 / 519 | Four GridTestPage compatibility cards extracted to LegacyGridCards and consumer updated. Seven other candidates have no current source consumers; original module flagged for archive review. |
| [src/pages/game-center/WeekCentralExperimentPage.js](<src/pages/game-center/WeekCentralExperimentPage.js>) | 633 / 99 | Retained experiment page keeps state/query/composition; its model, banner, feature panels, slate and strips are separate modules. |
| [src/hooks/useRouteSideNav.js](<src/hooks/useRouteSideNav.js>) | 628 / 17 | Thin location/venues/memo hook; route configuration, parsing, helpers and pure sidebar resolver separated without changing the public API. |
| [src/components/organisms/player/PlayersHubCards.js](<src/components/organisms/player/PlayersHubCards.js>) | 606 / 10 | Public card API retained; spotlight, breakout/transfer, discovery and position/conference cards separated from shared presentation and identity helpers. |
| [src/components/organisms/test/GameProductionRushing.js](<src/components/organisms/test/GameProductionRushing.js>) | 602 / 48 | Retained box-score lab composition; unchanged static team fixture, name/color formatting, tables and runner panels separated. |
| [src/components/game/recap/WeekRecapExport.js](<src/components/game/recap/WeekRecapExport.js>) | 599 / 27 | Export button retained; recap model, margin board, performer/event panels, poster and preview modal separated. Shared palette moved to molecules/export/posterPalette. |
| [src/components/organisms/nav/MobileMenu.js](<src/components/organisms/nav/MobileMenu.js>) | 591 / 131 | Drawer/layout/event assembly retained; shared face primitives, Game Center/Schools/Analytics face hooks and page snapshot hook separated. |
| [src/components/organisms/people/PeopleHubCardDeck.js](<src/components/organisms/people/PeopleHubCardDeck.js>) | 590 / 33 | Deck allocation retained; card primitives, chart renderers, hero carousel, solo and cohort cards separated. |
| [src/components/organisms/test/statsHubCardsMock.js](<src/components/organisms/test/statsHubCardsMock.js>) | 589 / 589 | Reviewed generated active-lab fixture; retained unchanged. Header requires regeneration rather than manual data edits. |
| [src/components/molecules/game/ConferenceSlateMatrix.js](<src/components/molecules/game/ConferenceSlateMatrix.js>) | 577 / 158 | Desktop composition retained; pure lookup/axis helpers, cells, team cards and mobile view separated. Fetch keys and selection behavior unchanged. |

### Usage and compatibility

- MainLayout, MobileMenu and MobileSectionSwitcher use useRouteSideNav. The
  hook still reads location and the stable venue model, then memoizes from the
  same four dependencies. Its resolver builds callbacks without performing
  navigation or other effects. Team switching retains suffixes, analytics
  retains tab/team query behavior, and game/player/venue injections are preserved.
- The current source graph contradicts the older guide's implication that the
  seven GamesHubCards candidates are active. GridTestPage is its only importer
  and uses the four legacy exports. Those now import LegacyGridCards directly;
  the remaining original file is disconnected and marked for archive review.
  Namesakes imported from GameCenterLabCards are separate implementations and
  were not changed. No candidate cards were deleted.
- WeekRecapExport serves GameCenterPage. Its palette API also served five other
  export/viewer consumers; those now import the pure posterPalette module
  directly, retaining their existing other working edits. The old recap exports
  remain valid. CSS-variable names, palette fields, full-size export refs, PNG
  workflow and the lazy module-scoped canvas measurement cache are unchanged.
- PlayersHubCards serves PlayersPage; PeopleHubCardDeck serves PeopleHubPage.
  Chart-type choices, card allocation order, dimensions, links and carousel
  timing are preserved. MobileMenu stays mounted through App with the same
  cached query reads, snapshot query keys/enabled gates, drawer and close handlers.
- ConferenceSlateMatrix serves /game-center/conferenceslate and the current
  /game-center/schedule routes (including year/season suffixes). Desktop/mobile
  views keep their existing distinct selection and scroll behavior.
- WeekCentralExperimentPage is /lab/week-central-experiment, not the live week
  page. GameProductionRushing serves GameBoxScorePacketLab, not the similarly
  named production adapter. statsHubCardsMock serves the active StatsHubContextCardsA
  registry entry. Lab paths and static fixtures are not automatically dead code.

### Validation

232 original declarations retain identical compiled bodies. Inlining the new
route resolver reconstructs the original useRouteSideNav body. All original
public exports remain; moved functions retain their inputs, selectors and JSX.
Local imports/exports, caller import-only changes, extraction-module cycles and
UTF-8 without BOM checks pass. All 63 reviewed/touched source files pass ESLint
with zero errors/warnings. The Stats Hub fixture is byte-for-byte unchanged.
No dependency installation, production build or browser pass was performed.

A mocked-location/venue comparison covered 1,884 URL/query/venue cases, including
all 18 teams, hub and detail paths, empty/populated venues and query variations.
Labels, active states, stack/items, switchers and navigation callback outputs
matched before/after. The callback check counted 164,352 combined navigation
actions across the two versions; these are repeated test actions, not distinct
routes. Neither resolver navigated during derivation. Browser behavior and real
query transport still need the checks below.

No private dead binding was removed in this batch; the concrete unused-code
finding was the seven GamesHubCards candidates. Existing fixture values, lab
default seasons, date/week parsing, recap sorting and fallback axes are retained.
Mobile menu analytics face labels still use their existing local mapping rather
than the canonical sidebar tab list; any label unification is separate work.
The inventory now contains 1,001 unique source files with zero parse failures,
released edit claims and the original other-agent reviewer attribution intact.

### Browser checklist

1. Desktop sidebar: team page navigation and team switching; Player Profile
   sub-tabs; Team Analytics tabs/team picker; stadium picker and game/preview
   injections. Check back/forward navigation and URL-query changes.
2. Phone menu: open/close on Home, Game Center, Schools and Team Analytics;
   snapshots/rotating faces, team links and the close-on-navigation behavior.
3. /players and /people: card grids, hero rotation and player links.
4. Game Center weekly recap: preview, Light/Night palette and one PNG. Also
   check a shared-palette export such as Deep Dive or short game preview.
5. /game-center/schedule: conference/SWAC scope and year switching, matchup
   selection, desktop scroll and phone team cards.
6. /lab/week-central-experiment: season/week and slate selection.
   /lab/grid: four retained cards. The box-score packet lab: rushing table,
   runner selection and lane panel. /lab/components: Stats Hub context cards.
   Lab routes may be excluded from demo builds.

## 2026-10-31: User browser pass — navigation/export batch

User reported browser verification passed for the preceding ten-file batch
(navigation, mobile menu, card decks, recap/palette exports and conference slate).
This records that reported pass; it does not imply every retained lab, export
variant or data edge case was individually checked.

## 2026-10-31: Next ten — sidebar blocks, context family and roster/wiki views

Reviewed by: Codex (cleanup chat). User browser pass for the prior batch is
recorded above. This batch used fresh current-working-tree baselines, preserving
existing GameCenterContextCardsV2 and PlayersTab changes.

| File | Before / after | Scope and result |
|---|---:|---|
| [src/components/organisms/test/GameProductionPassingFieldMapA.js](<src/components/organisms/test/GameProductionPassingFieldMapA.js>) | 559 / 98 | Retained packet-lab composition; fixture, name/color helpers, tables, field-map spotlight and defense identity separated. |
| [src/components/organisms/SideNav.js](<src/components/organisms/SideNav.js>) | 558 / 82 | Sidebar frame/dispatch retained; memoized generic header, item, team switcher and venue switcher separated, including displayName assignments. |
| [src/components/organisms/test/WeekCentralGameRowJ.js](<src/components/organisms/test/WeekCentralGameRowJ.js>) | 540 / 52 | Live row/router and standard/compact implementations moved to molecules/game/weekRow. Test file retains its gallery and compatibility exports; two live callers import production directly. |
| [src/pages/game-center/GameCenterMicroHubPage.js](<src/pages/game-center/GameCenterMicroHubPage.js>) | 485 / 270 | Year-specific micro-hub page retains queries/mode UI; loading adapter, standings/grouping models and stat card separated. |
| [src/components/organisms/test/GameCenterContextCardsA.js](<src/components/organisms/test/GameCenterContextCardsA.js>) | 480 / 65 | Gallery and lab presentation retained; fifteen renderer bodies shared with production through a module-initialized presentation factory. |
| [src/components/molecules/roster/RosterOutlookCarousel.js](<src/components/molecules/roster/RosterOutlookCarousel.js>) | 466 / 233 | Carousel state/position selection and layout retained; pure formatting/eligibility data, cells and responsive player rows separated. |
| [src/data/wiki_data.js](<src/data/wiki_data.js>) | 463 / 8 | Public API retained; conference/comparison data, postseason ledger, rivalries and timeline separated by domain with all existing values preserved. |
| [src/components/molecules/wiki/WikiDirectory.js](<src/components/molecules/wiki/WikiDirectory.js>) | 462 / 12 | Density/router retained; wiki-specific data/animation configuration, shared shell, frames, cards and views separated. |
| [src/components/organisms/tabs/roster/PlayersTab.js](<src/components/organisms/tabs/roster/PlayersTab.js>) | 461 / 78 | Roster card view retains loading/empty states and density selection; identity/format helpers, animated name plates and player cards separated. |
| [src/components/molecules/game/GameCenterContextCardsV2.js](<src/components/molecules/game/GameCenterContextCardsV2.js>) | 454 / 34 | Public card map retained; live presentation settings remain distinct while identical renderer bodies and primitives are shared with the lab. |

### Shared context-card family

The lab and production had 22 identical private declarations: seven shared
primitives/constants and fifteen card renderer bodies. They differed in GOLD,
Small and Shell. Those three settings remain separate in ProductionPresentation
and LabPresentation. createContextCards accepts them explicitly and creates its
stateless renderer map once at module initialization, preserving component
identity during renders, registry keys/order, payload access and fallback logic.
This removes duplicated renderers without forcing live mobile sizing into the
lab or the lab's gold accent into the live page. Shared renderer changes affect
both presentations; a presentation-only edit stays in the relevant settings file.

All thirty mocked render trees (fifteen card types in two presentations) match
the original versions, and the complete lab gallery matches as well. Chakra
rendering is mocked; the check covers element trees/props and is not a visual
browser substitute. Placeholder lab data remains labelled and unchanged.

### Consumers and retained boundaries

- SideNav serves MainLayout and still renders the supplied route model. The
  route resolver from the previous batch was not changed. Memo boundaries,
  display names, skeleton CSS, active-item handling, team/venue switcher state,
  theme switch and callback bodies are retained. No useEffect was introduced.
- WeekCentralGameRowJ served live WeekGameRow and the editorial lab despite its
  test path. Both callers now use the production router. The separate phone row
  design was left alone. The original module remains connected to the tested
  designs gallery and is not an archive candidate. Its fixture stays local.
- The passing field-map component serves GameBoxScorePacketLab, not the live
  game breakdown. It remains a retained experiment. Its fixture is separate from
  measured backend passing-zone data, and all existing values are unchanged.
- GameCenterMicroHubPage serves season-specific week/team/standings/rankings
  deep links. Its base hub counterparts are separate pages. Existing transport,
  week grouping, standings and date-sort semantics are preserved.
- RosterOutlookCarousel serves RosterHubGrid. Eligibility/class conventions,
  position grouping, pause/advance and density-specific player rows remain.
  PlayersTab serves RosterTab's card view and retains prop/hook selection,
  image-fallback identity, name-pan animation and player navigation.
- WikiDirectory serves SchoolsWikiPage. Its metadata-only frame contract stays
  separate from the Schools directory's current-player/coaching feed. The public
  wiki_data import path remains valid for comparison, passport, footprint,
  postseason, rivalry and timeline consumers. No historical facts or identity
  values were corrected during this structural pass.

### Validation

123 declarations outside the context family retain identical compiled bodies.
All 54 original context declarations match their corresponding shared/variant
implementations, including the original registry body inside the factory. Original
public exports remain, as do memo display names. Two caller bodies differ only
in import sources. Local imports/exports, extraction-module cycles and encoding
checks pass across all 48 touched source files. All 48 pass ESLint with zero
errors/warnings. Twelve wiki data exports match at runtime, including comparison
slice/reference relationships and generated ledger values.

Full source inventory: 1,037 unique files, zero parse failures. Edit claims were
released and other-agent review attribution preserved. No dead-code deletion was
justified in this batch; none was performed. No production build or new browser
pass was performed. This is not a verification of factual freshness in wiki data
or a new statistical audit of lab fixtures and eligibility approximations.

### Browser checklist

1. Desktop sidebar: generic hub header, active buttons, team switcher, stadium
   switcher and the theme toggle, including narrow sidebar widths.
2. Live Week Central: standard/compact rows, selected highlight and matchup
   links. Also inspect /lab/week-central-editorial and retained row gallery.
3. Game Center context cards: desktop/phone card sizing and supporting text.
   /lab/components: all fifteen context cards, preserving the lab gold accent.
4. Team roster hub outlook: position filter, pause/resume and advance at desktop,
   compact and phone widths. Team roster card view: long names, images and links.
5. /schools/wiki: directory frames/navigation, conference comparison, postseason
   ledger, rivalries and timeline (shared wiki-data consumers).
6. Season-specific micro-hubs: /game-center/week/:season/:week,
   /game-center/team/:teamId/:season, /game-center/standings/:season and
   /game-center/rankings/:season. Use populated seasons plus one empty selection.
7. Box-score packet lab: passing/receiving selection and field map. Lab routes
   may be excluded from demo builds.

## 2026-11-01: Relocated wiki hook dynamic-import fix

Reviewed by: Codex (cleanup chat). User reported a compilation failure in
swac/gameWikiQueries.js. useWikiData retained its old relative dynamic import
after extraction from useSWACData.js. Changed ../data/teams.json to
../../data/teams.json. Earlier extraction validation covered static imports but
missed this import expression; declaration-body parity also preserved the wrong
relative literal. A full-source scan now checks literal relative import() and
require() expressions: one such expression, zero unresolved paths after the fix.
Targeted ESLint passes. No backend scripts or production build run.

## 2026-11-03: Pass-defense visual revision

Reviewed by: Codex (cleanup chat). User rejected the generic dashboard styling
and requested the established Deep Dive/scatter treatment. PassDefensePoster now
uses the existing 1400px frame dimensions, 76px editorial headline, flat panel,
wordmark, compact controls and hidden full-size PNG export source. The lab uses
the same revised components. Browser visual verification remains pending.

Site identity now wins over backend labels: teams.json shortName/name/logo/colors
are canonical (including ALCN). Bars retain primary hues, adjusted for contrast;
neutral black uses the team secondary on a dark ground. Logos accompany bar
labels. No extra colors encode a made-up performance score.

PD02 and PD06 now use Recharts scatters with team logos/abbreviations. PD02 plots
first-down success allowed vs 20+ gains per attempt, preserving independent
samples. PD06 plots first-half vs second-half success allowed on common bounds
with a y=x reference; no improvement metric or causal adjustment claim is added.
This user-directed revision supersedes the handoff's suggested grouped bars.

Percent bars retain a zero baseline with fitted maxima. On the complete shipped
18-team cohort, disruption maximum 22.06% uses a 25% axis; red-zone maximum
81.82% uses a 90% axis. The earlier fixed 100% ceiling was a frontend default,
not a backend data defect. PBU/INT is relabelled Attempts disrupted: PBU or INT
and explained as unique recorded attempts, not coverage wins.

Backend requests are in src/pages/stats/md/Pass Defense Visual Follow-up
2026-11-03.md for the user to carry over. Requests distinguish missing measures
from presentation problems, include sparse-sample qualification and stronger
per-game/receiver-group context, and preserve the three existing blocked views.
No backend files or scripts were changed. Sixteen model/presentation tests pass;
scoped ESLint passes and the running frontend compiles successfully. No new
browser visual pass has been completed.

## 2026-11-06: Next five — home fixture, standings lab, coaches, championship ledger and penalties

Reviewed on: 2026-11-06. Reviewed by: Codex (cleanup chat).
All five entry files were traced to current consumers before editing. Current
working-tree snapshots were used, retaining existing standings experiment and
penalty-poster work. Ownership claims are released in CLEANUP_INVENTORY.md.

| File | Before / after | Scope and result |
|---|---:|---|
| src/components/molecules/home/teamsTileMock.js | 441 / 4 | Literal fallback payload moved intact to src/data/home/teamsTileMock.json. Existing named export/import path retained. This is data organization, not removal of 437 lines of behavior or data. |
| src/pages/game-center/StandingsExperimentPage.js | 440 / 46 | PageShell composition retained; static experiment data, shared identity/form presentation, standings/ranking cards and the locally controlled finish matrix separated. |
| src/components/organisms/tabs/CoachesTab.js | 439 / 178 | Query, navigation, loading/empty handling and staff overview retained; coach classification/display helpers, head-coach spotlight and staff/stat cards separated. |
| src/components/molecules/postseason/CelebrationBowlLedger.js | 437 / 163 | Density routing and desktop/compact ledger composition retained; per-game responsive tile and mobile filmstrip/header separated. |
| src/components/organisms/deepDive/PenaltyPosters.js | 435 / 69 | Five public poster compositions and registry retained; published-data/formatting model, shared poster primitives and story-specific battle/cost, response, habits and officials panels separated. |

### Usage and boundaries

- HomeHero uses the teams fixture when its weekly payload is unavailable.
  Mobile-menu snapshots/faces and the retained mobile-tile lab also use it.
  Existing placeholder title counts and coach record remain placeholders;
  fixture values, rotation, item order and fetch/fallback policy are unchanged.
- App routes StandingsExperimentPage at /lab/standings-experiment outside demo
  builds. Its fixture remains distinct from the live standings feed. Static
  finish scenarios, feature-card copy, rankings and heat thresholds are retained;
  this pass does not validate them as current statistical claims.
- TeamCoachesPage renders CoachesTab at /teams/:teamId/coaches and its /hub
  alias. Head-coach/coordinator classification, tenure/stability calculations,
  staff ordering, internal navigation and external profile links are retained.
  The caller's pre-existing useEffect-based season synchronization was read but
  not changed in this five-file batch; flag it for the caller's own review.
- SchoolsWikiPage renders the Celebration Bowl ledger. Mobile still shows the
  full historical filmstrip; desktop/compact still use the first ten games in
  their original order. Breakpoints, tile variants, photos and sizing remain
  separate and unchanged. Other similarly named ledger implementations were
  not merged, deleted or treated as equivalent merely because names match.
- DeepDiveCharts consumes the penalties registry and metadata. Original public
  exports, full-size poster dimensions, palette behavior, ref forwarding, sort
  orders, source values and formatting are retained. Other Deep Dive families
  and concurrent pass-defense poster work were not modified.

### Validation and remaining checks

Scoped ESLint passes for all 20 JavaScript files in this batch. All 65 original
non-fixture declarations retain identical compiled bodies. The relocated JSON
fixture deep-equals its original literal. Original public exports remain; all
44 relative imports/re-exports resolve, including checks for literal dynamic
imports and require calls. No cycles among the batch modules, BOMs or newly
introduced effects were found. Frontend webpack development compilation passes
with zero warnings, using cache-local output without invoking backend scripts or
the data-sync build wrapper.

The refreshed inventory contains 1,072 source files with zero parse failures;
unrelated review dates, reviewers, statuses and ownership were preserved. All
five reviewed entries remain app-entry reachable; none is an archive candidate.
No dead-code deletion was justified. Browser visual verification is pending.

Browser checklist:

1. Homepage: rotating Teams tile and mobile menu school faces.
2. /lab/standings-experiment: cards, conference/division controls and finish
   matrix scrolling at desktop, compact and phone widths (non-demo build).
3. A team coaching page: head-coach spotlight/profile navigation, coordinator
   and position cards, season selection, and empty/loading states as available.
4. /schools/wiki: Celebration Bowl desktop row, compact two-row layout and
   mobile swipe strip, including photos and scores.
5. Stats > Team Analytics > Charts > Deep Dive > SWAC penalties: all five
   posters in Light and Night, plus one exported PNG.

## 2026-11-06: Mobile menu runtime-error investigation — unresolved on iPhone

Reviewed on: 2026-11-06. Reviewed by: Codex (cleanup chat).
User reports that pressing the menu button on an iPhone at the local HTTP IP
opens the CRA runtime overlay with only "Script error." The supplied screenshot
does not identify the underlying exception. Do not treat that generic text as
proof of a scroll-lock, HTTPS or data error.

Traced App -> Header -> MobileMenu, its shared route model, menu face hooks,
page snapshot and installed Chakra/Zag drawer open/scroll-lock code. The menu
was outside RouteErrorBoundary. Added MobileMenuErrorBoundary around the menu
in App, with a native-element fallback displaying the actual React exception
and a Close menu action. Closing resets the failed boundary for the next open.
No drawer mechanics, menu design, data sources or navigation targets changed.
No useEffect introduced; unrelated working changes retained.

Two regression tests pass for actual-message display, page isolation, closing
and retry. A temporary real-Chakra integration harness also passed open/close,
team-link selection and body scroll-lock cleanup with iPhone platform/touch
flags. That jsdom check is not an actual iOS Safari reproduction. Its modern
package-resolution shim and environment polyfills remain cache-local; the
retained boundary tests run with the ordinary CRA test command. Scoped ESLint
and frontend webpack development compilation pass with zero warnings.

Next phone check: reload, press Menu, and if the generic development overlay
returns, dismiss its X and read the underlying menu error message. The actual
iPhone cause remains unconfirmed; this change is diagnostic containment, not
a verified fix of the reported crash.

## 2026-11-06: Next five — player bio, layout lab, Week Review and dashboard cards

Reviewed on: 2026-11-06. Reviewed by: Codex (cleanup chat).
Navbar testing remains with the user; no navbar files were modified in this
batch. Newly added LeaderboardsPanel/PassDefensePosters and recently changed
GamesHubPage were skipped to avoid overlapping the other agent's work.
Fresh working-tree snapshots preserve existing WeekReviewTab/TeamDashComponents
changes. All edit claims have been released in the inventory.

| File | Before / after | Scope and result |
|---|---:|---|
| src/components/organisms/player/PlayerBioBackgroundPanel.js | 431 / 250 | Keeps player-specific derived values and the responsive four-column/two-by-two composition. Class/position labels and percentile formatting separated from shared column, comparative, percentile-bar, count-chip and class-grid presentation. |
| src/pages/game-center/GameCenterLayoutLabPage.js | 429 / 95 | Keeps query policy, memoization and lab composition. Existing memo callback moved intact to buildLayoutLabModel; historical experiment config and result rail separated into page-local modules. |
| src/components/organisms/stats/WeekReviewTab.js | 411 / 59 | Keeps selected-week state, export ref/header and empty handling. Week selector, chart, custom bar/logo/tooltip marks and color/label helpers separated. |
| src/components/molecules/game/GameCenterLabCards.js | 403 / 6 | Existing public exports retained; standings/defending-champion presentation separated from schedule/placeholder cards and recent-form/record cards. |
| src/components/molecules/schools/TeamDashComponents.js | 403 / 6 | Existing public exports retained; standard/compact player spotlight, coaching carousel, shared section label and formatting/data adapters separated. |

### Consumers and retained boundaries

- PlayerDetailPage uses the bio panel; class/transfer/in-state counts, measured
  height/weight deltas, map props, percentile colors and density-specific padding
  remain unchanged. PlayerHomeStateMap was read as a dependency, not modified.
- /lab/game-center-layout remains routed through App outside demo builds. Its
  original historical 2025 query and legacy layout remain isolated from live
  Game Center. Illustrative MVP labels, fixed quarter scores, quick-card copy,
  legacy destinations and opponent matching are retained, not promoted to
  validated live statistics. ScheduleRail lives beside this page's model;
  reusable components do not import the page implementation.
- TeamAnalyticsPage uses WeekReviewTab. Week selection, unplayed availability,
  raw winner_edge reads, row sorting, signed zero-centered bounds, negative-bar
  geometry, winner/loser logo placement, click routes, team hues, provisional
  treatment and PNG export ref/filename remain unchanged. No statistical
  measure, team-color policy or averaging rule was introduced.
- GameCenterPage uses TopThreeStandingsCard; the layout lab uses that card plus
  schedule, stretch, form and record cards. The collection's Lab name is not
  evidence that it can be archived: a live hub imports it. The similarly named
  GameCenterLabCards/GamesHubCards families have distinct contracts and were
  not merged merely to deduplicate their names.
- TeamDetails, TeamDetailsMobile and DashTab use the dashboard cards. Standard
  and compact spotlight sizing, image fallback, PAR display, coach delta reads,
  CSS-driven carousel clock and selection handlers remain unchanged. Public
  compatibility modules preserve caller imports without extra wrapper renders.

### Archive review candidates at the export level

No reviewed file is disconnected. The current source scan finds no consumers of
GameSpotlightCard, WeekScheduleCard, DashgraphPlaceholderCard, buildSpotlightPlayer
or buildHeadCoach beyond their own declarations/re-exports. Mark these named
exports for archive/removal review; they are retained for public API continuity
in this structural batch. Their containing modules also hold used exports and
must not be archived as whole files. No code was deleted as proven dead here.

### Validation

All 21 JavaScript files pass scoped ESLint. Sixty-seven declaration bodies match
the immediate extraction baselines, including the lifted model declaration.
The original layout-lab memo body is separately verified identical, and its
page changed only by delegating that callback. Six actual 2025 schedule/empty
model cases match the original output without input mutation. Original public
exports remain, all 35 relative imports/re-exports resolve, and no new-module
cycles, BOMs or effect calls were introduced. Frontend webpack development
compilation passes with zero warnings using cache-local output, without invoking
backend scripts or the data-sync build wrapper.

Inventory refreshed: 1,090 source files, zero parse failures; unrelated review
dates, reviewers, statuses and owners preserved. Browser verification remains
pending. This is structural validation, not a fresh statistical audit of older
lab placeholders or a browser screenshot comparison.

Browser checklist:

1. Player profile bio: desktop four columns and phone two-by-two layout;
   comparative values/bars, class grid/timeline, home-state map and background.
2. /lab/game-center-layout: featured cards, result rail and quick cards in a
   non-demo build; compare existing placeholder behavior rather than real stats.
3. Team Analytics Week Review: change weeks, inspect positive/negative bars,
   logo placement, tooltip, game navigation and one exported PNG.
4. Game Center: leader/defending-champion standings cards at standard and compact
   density, plus empty rows when available.
5. Team profile: player spotlight and coaching carousel at desktop/mobile sizes;
   let the carousel rotate and select another pagination dot.

## 2026-11-06: Next five — single-game lab, schedule rows/banner, QB map and officials

Reviewed on: 2026-11-06. Reviewed by: Codex (cleanup chat).
All five entries had current app consumers before editing. Fresh working-tree
snapshots retained pre-existing QB map and OfficialsPage changes. Leaderboards,
Pass Defense, GamesHubPage and navbar work were left alone. All claims released.

| File | Before / after | Scope and result |
|---|---:|---|
| src/pages/PageLab.js | 402 / 140 | Keeps query/loading/error handling and page composition. Display constants, statistic/player tables, target/rush matrices and play lists separated into page-local modules. |
| src/components/molecules/schedule/TeamScheduleList.js | 397 / 98 | Keeps section/empty states and recap-link composition. Shared date/week/tag/venue helpers, initial/score primitives, standard row and compact/phone row separated. |
| src/components/organisms/test/TeamScheduleBannerA.js | 395 / 4 | Existing banner implementation promoted into molecules/schedule/teamScheduleBanner, split into model, density router and independent desktop/mobile layouts. Old path retains a named compatibility re-export and is now an archive-review candidate. |
| src/components/organisms/PlayerAnalyticsQbMap.js | 395 / 103 | Keeps query/filter/hover state and page/export composition. SVG plot, numbered key, fixed-size export poster and presentation/identity helpers separated. |
| src/pages/officials/OfficialsPage.js | 392 / 104 | Keeps queries, URL tab handling, official lookup index, loading state and page frame. Tab/filter controls, official/crew cards and roster/crew views separated. |

### Consumers and behavior boundaries

- App renders PageLab at /lab/pages in non-demo builds. Its existing preview
  experiment, game_tables query, missing-data errors, percentile shading,
  table/target/rush order, player lines, play lists, backend gap list and source
  notes remain. The page-local display modules are not a new production passing
  grid family; their existing zero/null and formatting behavior was not changed.
- /teams/:teamId/schedule uses TeamScheduleList through the team-scoped schedule
  page. Date parsing, source week/stem fallback, venue parsing, tag selection,
  W/L/T/upcoming score presentation and recap routes are unchanged. Desktop and
  compact layouts retain distinct breakpoint rules and information density;
  both reuse shared helpers and score/initial primitives.
- The separate /game-center/team page consumes the schedule banner. Its import
  now points directly to the production implementation; the caller body is
  unchanged. The full prior TeamSchedulePage review attribution remains with
  its original reviewer/date rather than being replaced by this import-only
  change. Selector order and identity still come from teams.json; neutral reset,
  selected team callbacks, record calculations, mobile grid and desktop media
  rules remain. No mock statistics or new banner design were introduced.
- PlayerAnalyticsPage renders PlayerAnalyticsQbMap for its qb-map tab. Published
  eligibility, ranks, axes, quadrant labels and medians remain backend-owned.
  Division filtering, hover linkage, label collision placement, dot colors,
  headshots, photo-free poster key, 1200x1600 export dimensions and filename
  remain. The existing 2026 season scope and theme behavior were not redesigned.
- App renders OfficialsPage at /officials. Roster conference filtering/counts,
  partner summaries, crew-role ordering, official-name fallback and summary
  values remain unchanged. The current 2025 season label, query/error behavior,
  URL query replacement and local roster-filter reset on tab unmount are retained;
  this batch does not imply a PageShell migration or new officials data audit.

### Archive status

The old test/TeamScheduleBannerA.js compatibility file now has zero source
importers and is disconnected from the app entry after the live import moved.
It is marked Reviewed / archive candidate in CLEANUP_INVENTORY.md. Retain it
pending archive removal; production does not need this shim. The other four
entry files and all extracted implementations are app-entry reachable. No
statistical code or public API was deleted as dead code in this batch.

### Validation

All 25 touched JavaScript files (24 refactor files plus the import-only caller)
pass scoped ESLint. All 63 original declaration bodies match their compiled
extracted implementations. Original named/default exports remain; all 47
relative imports/re-exports in the refactor files resolve, with literal dynamic
import/require checks included. TeamSchedulePage's non-import body is identical.
New-module cycle, UTF-8/BOM and effect-call checks pass. Frontend webpack
development compilation passes with zero warnings, using cache-local output
without data sync or backend writes/scripts.

Inventory refreshed: 1,109 source files, zero parse failures. Other-agent review
attribution and unrelated ownership records were preserved. Browser visual
verification remains pending.

Browser checklist:

1. /lab/pages (non-demo): preview plus single-game statistic tables, shaded
   percentile cells, target/rush matrices, player lines, plays and gap list.
2. /teams/:teamId/schedule: desktop and phone rows; completed/upcoming states,
   opponent logos/initials, venue text, score boxes and available recap links.
3. /game-center/team: neutral All Teams state, select/change/reset team, record
   values and banner at phone, compact and desktop widths.
4. Player Analytics QB map: division filter, key/dot hover linkage, labels and
   one PNG export. The poster should still use team logos instead of headshots.
5. /officials: Roster/Crews tabs, conference chips/counts, frequent partners,
   crew role ordering, summary cards and mobile card wrapping.

## 2026-11-06: Next ten — Week Central blocks, Stats Hub family, player labs and story/career views

Reviewed on: 2026-11-06. Reviewed by: Codex (cleanup chat).
All ten original files were traced to current consumers; fresh working-tree
snapshots preserved existing WeekCentralBriefBlocks and SpotStory work. Recent
leaderboard/Pass Defense/Games Hub and pending navbar work were not modified.
All temporary ownership claims are released.

| File | Before / after | Scope and result |
|---|---:|---|
| src/components/molecules/game/WeekCentralBriefBlocks.js | 377 / 61 | Retains performer-card composition and public compatibility exports; identity/stat adapters, headshot fallback, team-stat display, position chips and performer adaptation separated within weekBrief. |
| src/components/organisms/test/StatsHubContextCardsA.js | 375 / 38 | Lab registry/gallery retained; identical primitives and four renderers shared with production, while six historical lab-specific views remain separate. |
| src/components/organisms/test/GameSpotlightColumn.js | 372 / 49 | Carousel hook and public exports retained; fixture/opponent/badge/stat presentation, game readout and PAR chart separated. |
| src/components/organisms/player/statsTabMock.js | 370 / 72 | Real PAR-gauge helper and reachable legacy game-log entry retained; synthetic category generators, season/advanced adapters and headline adapters separated and explicitly identified as mock logic. |
| src/components/molecules/stats/StatsHubContextCards.js | 369 / 30 | Live registry, default/named card export and slot helper retained; shared shell/renderers reused with the lab, and live-specific views kept independent. |
| src/components/organisms/test/GameTeamStatsPacketLab.js | 367 / 51 | Packet composition retained; identity/formatting/row model, banner and tables/data-quality UI separated. |
| src/components/organisms/test/SfaPvamuPreviewA.js | 365 / 103 | Historical matchup composition retained; source fixture/display scales, metric column and directional-card presentation separated. |
| src/pages/coaches/CoachDetailPage.js | 363 / 213 | Query, summary, hero and page states retained; role/identity helpers and movement/season timeline rows separated into page-local career modules. |
| src/components/organisms/spotlight/SpotStory.js | 362 / 62 | Story tile/export/visual dispatch retained; layout/ghost-number rules, shared labels/people, comparison visuals and game visuals separated. |
| src/components/organisms/test/gameCenterContextCardsMock.js | 362 / 3 | Literal lab payload moved intact to test/fixtures/gameCenterContextCardsMock.json. Existing named import path and design-only placeholder flags retained; data was relocated, not removed. |

### Reuse without merging different behavior

The Stats Hub lab and live copies had fifteen identical private declarations:
eleven constants/formatting/shell/type/logo primitives plus LeagueMap,
MetricOfWeek, ProductionLeader and Parity. They now share those stateless
implementations. Six views differ and remain distinct: WinLevers, RankGap,
DeadMetric, TwinBars, Fingerprint and ConferenceSplit. In particular, the live
RankGap uses the published archetype and the lab's historical version uses the
stat sign; the live DeadMetric prints its display field. These differences were
not silently normalized. Registries, slot order and dimensions remain unchanged.

This removes duplicated implementations while keeping renderer identities stable
at module scope; it adds no wrapper renders or per-render component factory.
Production modules do not import lab-specific views.

### Usage and retained contracts

- WeekCentralBrief, weekBrief/LeaderRows and briefModel use the original brief
  exports. Backend notable-performer ordering, per-position field reads,
  current/prior headshot candidates, initials fallback, league notches and
  standard-versus-mobile chip selection remain unchanged. Re-exported identity
  utilities still come directly from utils/headshots.
- StatsPage uses the live Stats Hub cards; componentLabRegistry uses the lab
  gallery. No correlations, ranks, display bounds or backend card payloads were
  recalculated. Shared stateless rendering does not unify their different data
  sources or six variant behaviors.
- PlayerProfileControlStripV2 uses the spotlight hook/readout/chart exports.
  Its fixture remains clearly mock. Hold/fade timing, current-array ref, timer
  cleanup, empty/out-of-range chart guards, Recharts touch selection and opponent
  abbreviation behavior are retained.
- PlayerStatsTab still calls buildGameLog from statsTabMock. This is a confirmed
  live mock dependency: counting fields are generated from per-game PAR or a
  fallback production signal. It is not safe to classify this file as lab-only
  or archive it merely by its name. The cleanup preserves behavior and creates
  no new mock data. Real PAR gauges remain distinct from generated categories.
  Follow-up inventory/wiring request: src/pages/players/md/Backend Notes
  2026-11-06.md, for the user to carry to the backend. Existing availability must
  be checked before asking for new backend calculations. No backend writes.
- App routes the team-stat packet at /lab/game-team-stats/:gameId outside demo
  builds. Grouped row definitions, value/formatting rules, winner/banner behavior
  and data-quality caveats remain. This is a retained lab packet, not a promotion
  into the live game-page statistics family.
- PageLab uses SfaPvamuPreviewA. Its historical 2025 external-reference fixture
  remains separate from the app's nine-zone passing data: the two-depth boundary
  text, zero/empty treatment, shared EPA tint scales and defensive color reversal
  were not relabelled or interpreted as current backend values.
- App uses CoachDetailPage at /coaches/:coachId. Loading/missing-coach behavior,
  summary counts, notable-movement filtering, links and row ordering remain. The
  existing meacnsuc -> Norfolk display alias moved with TEAM_DISPLAY into its
  identity module and is verified retained. No new alias or team was invented.
- TeamSpotlightPage uses LAYOUT/StoryTile. Backend-selected story kinds, tones,
  measurements, SVG/visual dispatch, source text, image fallback, mobile sizing
  and per-tile export refs/filenames remain. SpotStory's primitives/models stay
  separate from the Stats Hub and Game Center card families.
- GameCenterContextCardsA still imports the same fixture module. Its JSON values,
  item ordering and placeholder:true markers are identical. Relocation is not a
  new factual or statistical audit of that historical design fixture.

### Validation and archive review

Scoped ESLint passes for 37 unique JavaScript files. All 184 original declaration
comparisons match their compiled implementations across the nine code-bearing
entry files, including shared declarations compared against both originals.
The tenth file's JSON fixture deep-equals its original literal. Original public
exports remain; 83 relative import/re-export checks pass, including literal
dynamic import/require handling. New-module cycle, encoding/BOM and effect-call
checks pass. The coach alias initialization is also retained explicitly.

All 22 Stats Hub card render trees (eleven cards, two presentations), the complete
lab gallery and live slot metadata match before/after with Chakra rendering
mocked. All 216 legacy player-generator input/function cases match; this proves
behavior preservation, not statistical validity. Frontend webpack development
compilation passes with zero warnings using cache-local output without invoking
data sync or backend scripts.

Inventory refreshed: 1,143 source files, zero parse failures. Other agents' review
dates/reviewers/statuses and unrelated ownership were preserved. All ten reviewed
entry files remain app-entry reachable through live or retained lab consumers;
none is a whole-file archive candidate. Synthetic adapters without direct UI
callers remain compatibility exports, pending deliberate data replacement/API
review. No used branch was removed as dead code. Browser visual pass is pending.

Browser checklist:

1. Week Central game brief: stats/league notches and performer portraits/chips at
   standard and phone widths, including image fallback.
2. Stats hub context cards and /lab/components gallery: all card variants, text,
   colors and slot sizing. Production and lab RankGap/display differences remain.
3. Player profile spotlight: timer rotation, active-game selection, readout and
   PAR chart; player Stats > Game Log should retain its existing behavior.
4. /lab/game-team-stats/:gameId and /lab/pages: packet tables/data-quality text,
   historical SFA/PVAMU metric and directional comparisons (non-demo builds).
5. Coach detail: portrait/initials, summary, career rows and movement links.
6. Team Spotlight: story visuals at desktop/mobile widths and one tile export.
7. Retained Game Center context-card gallery: fixture-driven rendering/ordering.

## 2026-11-06: User browser pass — preceding ten-file batch

User reported that everything was working after the Week Central brief, Stats Hub
family, player labs, coach career, Spotlight stories and context-fixture batch.
Recorded as a reported browser pass for that batch; it does not certify every
data edge or newly reviewed file below. It is not confirmation of the previously
unreproduced iPhone menu exception's cause. Existing review attribution remains.

## 2026-11-06: Next ten — shared banners, mobile preview, analytics and stat registries

Reviewed on: 2026-11-06. Reviewed by: Codex (cleanup chat).
Fresh working-tree baselines retained existing changes; all ten entries were
traced to active consumers. Recent leaderboard/Pass Defense/Games Hub/export-data
work was left alone. All temporary ownership claims are released.

| File | Before / after | Scope and result |
|---|---:|---|
| src/components/organisms/MobileSectionSwitcher.js | 383 / 152 | Trigger/sheet state retained; hint/grid styles and team-hub sheet block separated. One-time timer setup now uses the approved useMountEffect wrapper. |
| src/components/organisms/stats/TeamProfilePicker.js | 357 / 28 | Selection/memoized stat preparation and density dispatch retained; cell display model and independent mobile/desktop presentations separated. |
| src/components/game/preview/GamePreviewScoutMobile.js | 350 / 36 | Mobile scout composition retained; presentation definitions, primitives, chrome/jump header, tape, units and personnel sections separated. |
| src/pages/analytics/scatterPresets.js | 348 / 78 | Public axis/series helpers retained; base team axes, advanced-axis catalog/read rules and preset registry separated. |
| src/components/organisms/game-center/week/WeekCentralBanner.js | 343 / 42 | Provider action/chrome wiring retained; controls, desktop banner, advanced panel and mobile banner separated. |
| src/components/organisms/player/PlayerProfileBanner.js | 342 / 177 | Player identity/rating derivation and desktop composition retained; phone presentation and shared avatar/tags separated. |
| src/pages/stats/countingStatsTabs.js | 337 / 3 | Stable public exports retained; team and player counting-table schemas separated without changing fields, tab order or sorts. |
| src/components/organisms/BannerControls.js | 328 / 5 | Stable shared banner API retained; frame/constants, portal dropdown and button/pill implementations separated. |
| src/pages/analytics/PlayerAnalyticsPage.js | 326 / 171 | Query, URL/view selection, division and player selection retained; identity/tab/mock-DNA configuration and avatar/DNA cards separated. |
| src/components/game/preview/PreviewTables.js | 322 / 3 | Stable preview-sheet API retained; shared row/value/rank presentation, matchup sheet and history sheet separated. |

### Scope and behavior

- MobileSectionSwitcher serves hub banners independently of the main hamburger
  drawer. Team-tab resolution, team switching, skeleton image load counting,
  navigation callbacks and BottomSheet behavior remain. Its pre-existing
  useEffect(..., []) only scheduled the 900ms/1600ms peek timers; useMountEffect
  now runs the identical callback/cleanup once. This is not a proposed cure for
  the unrelated Safari "Script error." report.
- TeamAnalyticsPage consumes TeamProfilePicker. Neutral reset, selected-team
  toggling, canonical identity display, existing record/rating/lever reads,
  percentile fills, ordering and memo dependencies remain. Desktop JSX was
  lifted intact with all eight referenced local values passed explicitly;
  mobile layout remains independent. Both default and named public exports
  are preserved.
- GamePreviewPage consumes the phone scout and HistorySheet. Mobile jump targets,
  fixed header offsets, counting/efficiency tables, side toggles, quarterback
  pass grid, production leaders and history sheet retain their original props,
  state and source contracts. Shared desktop scout constants/pass-grid renderer
  remain reused; no mobile styles were pushed into desktop views.
- Scatter presets serve MapTab and rotating analytics cards. Axis keys, advanced
  field units/direction/availability, source fallbacks, net reads, finite-value
  filtering, presets and mean/median center behavior remain exactly as before.
  This pass does not introduce a new backend-derived rate, rank or cohort.
- WeekCentralShell consumes WeekCentralBanner. Provider scope, pending versus
  committed controls, previous/next behavior, nonconference filter, advanced
  panel, phone sheet and add/filter actions retain their original behavior.
- PlayerDetailPage consumes PlayerProfileBanner. Desktop photo/avatar behavior,
  tags, name animation, rating gauge, rating label/display/suffix overrides and
  mobile full-photo identity plate remain. No rating or image policy changed.
- Counting-stat pages, navigation and builders keep their countingStatsTabs
  imports. Exact labels, keys, decimals, percent flags, side/tab membership,
  weekly-category maps and default sort definitions remain shared. Splitting the
  registries does not create parallel statistical inventories.
- BannerControls is used across many live/lab banners. All constant and component
  exports remain at the old import path. Dropdown controlled/uncontrolled state,
  disabled behavior, portal position, options, backdrop and selection handlers,
  responsive strip sizing and button/toggle/segmented-pill semantics are retained.
- PlayerAnalyticsPage retains its explicitly labelled mock DNA/concept tiles and
  locked tabs, distinct from its real player search, QB-map and rushing views.
  No new placeholder values were introduced or represented as measured data.

### Validation and archive review

Scoped ESLint passes for all 40 JavaScript files. All 107 immediate-extraction
baseline declaration comparisons pass. Separate initial-source checks verify
that the two intentional structural changes are limited to the one-time hook
wrapper and exact desktop-picker JSX/prop delegation. Public exports are checked
against the original files, not only the intermediate extraction baselines.

Seventy-six neutral/selected-team, desktop/mobile, populated/missing-season picker
render trees match before/after with Chakra mocked. Thirty-four real-data/empty
preset series cases match; preset availability, advanced-axis groups and all
counting registry values/functions match. Relative imports/re-exports, literal
dynamic imports/requires, new-module cycles, encoding/BOM and effect-call checks
pass. No direct useEffect remains in the reviewed switcher. Frontend webpack
development compilation passes with zero warnings using cache-local output,
without data sync or backend scripts/writes.

The refreshed inventory contains 1,175 source files with zero parse failures;
other-agent review attribution and unrelated claims were preserved. All ten
entry files remain used. MatchupSheet has no current source consumer beyond its
compatibility re-export: mark that public export/implementation for archive
review, while retaining the actively used HistorySheet and shared primitives.
No whole reviewed file was deleted or newly classified as disconnected.

Browser checklist for this batch (pending):

1. Shared banner dropdowns/buttons on several hubs: open, select, disable,
   toggle and reset at desktop/phone widths.
2. Phone section switcher: one-time hint, open/close, section links, team tabs,
   team logo grid and returning from the grid.
3. Team Analytics Profile picker: neutral state, selected team, reset, stat
   cells and phone/desktop layouts; Scatter presets/axis changes remain linked.
4. Game preview on phone: jump header/sections, unit/team switches, quarterbacks,
   leaders and historical meetings; compare desktop preview history as well.
5. Week Central: season/week changes before and after commit, previous/next,
   filters, advanced panel and mobile sheet.
6. Player profile banner and Player Analytics: image fallback, name/rating
   overrides, division/search selection and existing view switching.
7. Team/player counting stats: tabs, sides, weekly categories, column formatting
   and sorting on desktop and phone.


## 2026-11-06: Ten large entry files — responsibility-based extraction

Reviewed by: **Codex (cleanup chat)**. Review date: **2026-11-06**.
All batch claims are released. Standings retains the prior reviewer attribution
in the inventory. Browser verification passed: user reported the batch working on 2026-11-06.

| Entry file | Before lines | After lines |
|---|---:|---:|
| src/components/game/preview/GamePreviewScout.js | 799 | 38 |
| src/components/organisms/stats/LeaderboardsPanel.js | 730 | 108 |
| src/components/organisms/test/GameBannerScoreboardA.js | 519 | 1 |
| src/components/organisms/deepDive/PassDefensePosters.js | 505 | 87 |
| src/pages/game-center/GamesHubPage.js | 410 | 117 |
| src/components/game/export/exportData.js | 382 | 11 |
| src/components/organisms/deepDive/receivers/infographics.js | 345 | 5 |
| src/components/organisms/deepDive/receivers/groupTrustIdentity.js | 331 | 34 |
| src/hooks/useTeamAnalyticsData.js | 308 | 50 |
| src/pages/game-center/StandingsPage.js | 1301 | 110 |

### Scope and contracts

- GamePreviewScout now composes scoped header, passing, units, primitives,
  export controls and poster modules. Desktop, phone and export presentations
  retain their existing contracts; distinct depth-label sets remain distinct.
- LeaderboardsPanel retains selection/query controls, with rows, presentation,
  article models, standard posters, editorial charts and editorial posters
  separated by responsibility. Photo fallback, per-game/week selection and
  export behavior are preserved.
- The live game scoreboard now resides under molecules/game/scoreboard, with
  team panels, status/venue/ticker and model helpers separated. GamePageShell's
  only change is its import. The old named test export remains a compatibility
  shim. Its sole current consumer, QGamePageTest, is disconnected from the app
  entry; both remain marked for archive review, not approved deletion. The new
  production scoreboard is reachable.
- PassDefensePosters retains its eleven-poster registry; query adaptation,
  board/scatter renderers, depth, halftime and primitives are separate modules.
  Removed the proven unused private yd1 formatter. No metrics, axis policies,
  ranking, team identity or colors were redesigned in this cleanup.
- GamesHubPage retains page queries, filters and responsive composition, with
  grid presentation, tiles and grid rendering extracted. Jump/scroll behavior
  and quick export remain unchanged.
- exportData remains the public compatibility facade for identity, formatting,
  header, stat rows, production and passing-zone adapters. Existing team-color
  policy is unchanged; this pass does not resolve the separate light-mode issue.
- Receiver infographic composition is separated into primitives, changes,
  production and profile modules. Trust and identity panels and the state map
  have separate files; existing registries and public imports remain valid.
- useTeamAnalyticsData retains its public hooks while shared query helpers,
  hub assembly, hub queries and week-review queries have dedicated modules.
  Query keys, gates, identity joins, season filtering and source fallbacks stay
  unchanged. Only authoritative team metadata is used for identity joins.
- StandingsPage retains page state, queries and PageShell composition. Legacy
  derivation and published-race adaptation have separate model files; desktop
  tables, context cards, finish matrix and phone presentation are separated.
  Existing head-to-head ordering, power proxies and fallback policies remain.

These are extractions of existing behavior, not ten independent rewrites or
new visual variants. Stable exports keep consumers working. The 54 new modules
have explicit responsibilities; extracted code still exists and was not counted
as deleted functionality. No backend scripts or backend writes were performed.

### Validation and inventory

- Scoped ESLint with zero warnings allowed: all 65 JavaScript files, including
  the import-only game-page consumer.
- 337 declaration/body comparisons, public-export comparisons against original
  snapshots, 203 relative import resolutions and scoped new-module cycle checks
  passed. Encoding/BOM and banned-effect checks passed.
- Before/after runtime checks passed for 18 scoreboard cases, 845 export adapter
  cases, 10 standings cases, published analytics hub assembly and all 11 pass
  defense posters. Render comparisons mock Chakra; these are not browser tests.
- Exact scoreboard JSX delegation and the import-only consumer change were
  checked separately. A cycle introduced during extraction was resolved by
  separating shared scout primitives before validation completed.
- Frontend webpack development compilation passed with zero errors/warnings,
  using cache-local output and bypassing the data-sync build wrapper.
- Inventory refreshed to 1,230 source files with zero parse failures, preserving
  unrelated reviews/claims. Review dates and reviewers are recorded on the
  reviewed roots and extracted modules. The scoreboard compatibility path is
  marked disconnected/archive review; its live replacement remains reachable.

### Browser checklist — user confirmed passed 2026-11-06

1. Game preview: desktop/phone sections, team switches, full/short poster exports.
2. Leaderboards: team/conference/week filters, photos, standard/editorial exports.
3. Game scoreboard: score/record, tabs, ticker and compact/phone layouts.
4. Deep dives: pass-defense boards/scatters and receiver trust/identity/map views.
5. Games Hub: season/week filters, grid, last-week scrolling and quick export.
6. Standings: season/division changes, form, context cards, finish matrix and
   exports at desktop and phone widths.


## 2026-11-06: Next ten live files — home, team identity and stat boards

Reviewed by: **Codex (cleanup chat)**. Review date: **2026-11-06**.
Prior batch browser check: **passed, reported by the user**. Current batch browser
check: **pending**. Claims released after scoped checks.

| File | Before lines | After lines |
|---|---:|---:|
| src/pages/analytics/metricGlossary.js | 318 | 318 |
| src/components/molecules/schools/TeamKPIStrip.js | 317 | 168 |
| src/components/molecules/schools/RankingsCard.js | 305 | 137 |
| src/components/organisms/test/GameProductionSpecialTeamsC.js | 305 | 26 |
| src/components/organisms/threeAndOuts/ThreeAndOuts.js | 303 | 86 |
| src/components/organisms/home/GloryTeamOfWeek.js | 302 | 64 |
| src/components/organisms/test/GameProductionSpecialTeamsA.js | 302 | 16 |
| src/components/organisms/home/GamesPlates.js | 301 | 103 |
| src/components/organisms/test/BannerTeamDetail.js | 299 | 52 |
| src/pages/teams/models/rosterHubModel.js | 298 | 5 |

### Scope, reuse and archive review

- TeamKPIStrip: formatting/color policy and responsive cells/rings/ticker are
  separated from query selection and strip composition. The 2025-only analytics
  fallback guard, supplied stats and mobile sizing are unchanged.
- RankingsCard: existing ranking fixtures/authoritative identity lookup and
  scoreboard/bar-list variants are separated from the podium composition.
  Mock Glory scores remain explicitly mock; no new values or rankings added.
- GameProductionSpecialTeamsC: ledger data/formatting, visual primitives and
  phase sections are separate; the existing lab packet remains the consumer.
- ThreeAndOuts: shared stat definitions, ranked board, scatter and export poster
  have distinct files. Screen state/query controls remain at the old entry.
  Backend rates/ranks, lower/higher axis direction, conference scopes, no-game
  handling, finishing mode and offscreen export contract are unchanged.
- GloryTeamOfWeek: dictionary content/sizes, entry layouts and team reveal are
  separate. Random entry selection remains once per mount. The published pick,
  metric label, unavailable-file behavior and query cache/retry policy remain.
- GameProductionSpecialTeamsA: existing fixture/formatters, phase details,
  cards and two-team rows are separated. The file is reachable because B/C use
  its fixture export. The A visual export has no current source importer and
  is an archive-review candidate; this does not make the fixture or whole file
  dead. Compatibility exports retained; nothing deleted on that basis.
- GamesPlates: mobile layouts, collage cells, featured team/quarter rows and
  reasons presentation are separated. Public plate exports, responsive branch
  selection and backend-authored reasons/summary are unchanged.
- BannerTeamDetail: production desktop/mobile implementations and control
  helpers now live under molecules/banners/teamDetail. Named production/lab
  exports stay compatible. Pending versus committed seasons, phone sheet,
  section switcher, identity and retained lab-only cycling are unchanged.
- rosterHubModel: existing rollup and per-team-document adapters have separate
  files and shared helpers. The old path remains the public facade. Source
  precedence, same-team/same-season supplementation, explicit empty arrays,
  unknown handling, rounding, sorting and classifications are unchanged.
- metricGlossary: reviewed and retained unchanged. Its length is primarily a
  cohesive definition registry shared by tooltips and the glossary. First-alias
  indexing, mock flags, ordinal formatting and public exports are preserved.

Nine entries were refactored; one registry was deliberately retained. New files
are responsibility boundaries, not deleted functionality or a visual redesign.
All ten roots trace to the app entry (including fixture-only/retained lab paths).
No backend files, source data, team identity inventory or statistical policy changed.

### Validation

137 declaration/body comparisons and original public-export checks passed across
39 JavaScript files. All 90 relative import resolutions, scoped new-module cycle,
UTF-8/BOM and banned-effect checks passed. A phase-card/row cycle found during
extraction was removed before validation completed.

Before/after comparisons passed for 258 published-roster/empty adapter cases,
510 glossary lookups and 130 desktop/phone render cases (18 teams for KPI/banner,
ranking variants, special-teams views, dictionary and Games plates). Render
checks mock UI dependencies and do not constitute browser verification.

Scoped ESLint passed for all 39 JavaScript files with zero warnings allowed.
The existing roster model suite passed all 10 tests. Its first attempt hit a
Jest temporary-cache permission error; the rerun used a project-local cache.
Frontend-only webpack compilation passed with zero errors/warnings. No data-sync
build wrapper or backend scripts were used. Inventory refresh contains 1,259
source files with zero parse failures; unrelated review dates, reviewer
attribution and claims were checked and preserved.

### Browser checklist — pending

1. Home Games tile: collage, game of week, spotlight and look-ahead on desktop
   and phone; Glory dictionary and the team reveal if a published pick exists.
2. Team page: KPI strip/ticker and team banner at desktop/phone widths; season
   selection commits, phone season sheet, navigation and empty-season display.
3. Team Analytics charts: 3 & Outs / 3rd & Long boards, offense/defense, scopes,
   scatter, finishing view and image export.
4. Team roster hub: season changes, composition/experience/physical/transfer
   cards and missing-data states. Existing lab special-teams packet if used.


## 2026-11-06: Next ten live files — home tiles, payloads, schedules and retained galleries

Reviewed by: **Codex (cleanup chat)**. Review date: **2026-11-06**.
Current batch browser verification: **pending**. Claims released after review.

| Entry file | Before lines | After lines |
|---|---:|---:|
| src/components/organisms/test/TestedDesignsPage.js | 295 | 98 |
| src/utils/gameCenterPayloads.js | 293 | 5 |
| src/components/molecules/postseason/MeacSwacChallengeBanner.js | 287 | 158 |
| src/components/organisms/deepDive/receivers/groupTrendsYards.js | 285 | 32 |
| src/pages/schedule/SchedulePage.js | 274 | 176 |
| src/components/molecules/home/PlayersTileFaces.js | 274 | 32 |
| src/components/organisms/home/HomeHero.js | 274 | 150 |
| src/components/organisms/test/GameBoxScorePacketLab.js | 274 | 44 |
| src/components/molecules/schedule/TeamScheduleSummaryBand.js | 269 | 124 |
| src/components/molecules/schools/StandingsCard.js | 267 | 85 |

### Responsibilities and unchanged contracts

- TestedDesignsPage: archive entries/order and their frame wrappers live in a
  dedicated registry; the page retains gallery/header/slot composition. These
  are intentionally retained design references reached through the non-demo
  archive route, not dead files or active lab experiments.
- gameCenterPayloads: stable public exports now delegate to transport paths,
  authoritative team identity/alias resolution, and game-card/schedule adapters.
  ID formats, ambiguous mascot rejection, external-opponent fallback, density
  labels, backend-authored reasons, team-perspective fields, venue handling,
  legacy result/scoring precedence and cold transport fallback are unchanged.
- MeacSwacChallengeBanner: the phone layout is separate from desktop. Existing
  static almanac text, values and off-white visual treatment are preserved;
  this review does not verify or refresh the historical editorial content.
- Receiver groupTrendsYards: weekly form/share/streaks, height and yardage/depth
  panels have dedicated modules. WEEKLY_GROUP/YARDS_GROUP remain stable, using
  the same shared kit, published data, titles, chart scales and formatters.
  Shared kit and source JSON were read, not modified by this batch.
- SchedulePage: the legacy feed game card is a reusable component; page query,
  season state, memoized shaping and status states remain together. Existing
  endpoints, 2025 default, ordering/30-row limit, raw-ID-derived abbreviations
  and tie emphasis remain as before. Identity/default-policy modernization is
  a separate concern, not silently folded into structural cleanup.
- PlayersTileFaces: shared photo/identity/stat primitives, featured faces and
  arrival faces are separate. Registry, rotation filtering, duplicate-item
  consumption, phone dispatch and image error handling remain compatible.
- HomeHero: published tile loaders/mock fallback policy and per-face route
  selection are separate from page queries, composition and responsive grids.
  Query keys, cache policy, transitions/timing, ranked-game ordering, CTA links
  and loading behavior remain. Existing mock fallbacks are retained, not new
  measured data; replacing them is a separate data-wiring task.
- GameBoxScorePacketLab: identity/formatting, final banner and player tables
  are separated from PageShell composition. The non-demo lab route is retained;
  fixed production-card fixtures remain separate from its real game stat tables.
  No promotion of mock production cards into new live routes was performed.
- TeamScheduleSummaryBand: record/scoring summaries and phone banner/sheet are
  separate. Desktop composition, season control, zero/empty behavior, completed
  membership, home/away/conference splits and point averaging remain unchanged.
- StandingsCard: existing fixture/lookup and clean/brand-wash variants are
  separated from the heat-bar composition. Mock records, trend semantics,
  colors, links and named exports remain unchanged.

### Usage, archive decisions and checks

All ten entry files trace to the app entry, including deliberately retained
non-demo lab/archive routes. No whole file was newly declared dead or deleted.
Private declarations were checked for references; no additional private dead
code was proven in this batch. GameBoxScorePacketContent, StandingsClean and
StandingsHeatBar have no current source consumer beyond compatibility re-exports
and are marked for public-export archive review. The packet lab and brand-wash
standings variant remain used, so their parent files are retained. Public
compatibility paths remain intact.

129 declaration/body comparisons and original public-export checks passed
across 31 JavaScript files. All 84 scoped relative import resolutions, new-module
cycle checks, UTF-8/BOM and banned-effect checks passed. Scoped ESLint passed
with zero warnings allowed. Frontend webpack development compilation passed
with zero errors/warnings using cache-local output and no data-sync build.

Before/after checks passed for 509 adapter/path/summary cases, 216 face-link
cases, 12 JSON loader success/non-JSON/network-fallback cases, 112 render cases
and all 15 receiver trend/yardage posters. Render tests mock external UI/hooks;
they do not substitute for browser verification. Original helper function bodies
and callbacks are independently covered by compiled-body comparisons.

Inventory was refreshed with zero source parse failures. Unrelated review dates,
reviewer attribution and ownership claims were checked and preserved. No backend
writes/scripts, source data edits or new effect hooks were introduced.

### Browser checklist — pending

1. Home: Players tile faces/photo fallbacks and all four tiles' links, rotations
   and loading on desktop/phone.
2. Receiver deep dive: weekly form/share/streaks and yardage/height/depth posters,
   including export.
3. Team schedule: record/scoring summary, season selection and phone season sheet;
   legacy /schedule feed season buttons and recap links.
4. Schools Wiki: MEAC/SWAC Challenge banner at desktop/phone widths.
5. Non-demo lab: tested-design archive grouping/labels and box-score packet
   banner/player tables. Existing standings card variants where displayed.


## 2026-11-07 — Receiver posters, coaches, rushing and game views

Reviewed by **Codex (cleanup chat)** on **November 7, 2026**. Nine entries were
refactored and one shared view collection was reviewed and retained. All ten
entries trace to the app or a retained lab route. The inventory records the review
and released claims. Browser verification is pending for this batch.

| Entry file | Before | After |
|---|---:|---:|
| src/components/organisms/deepDive/receivers/kit.js | 286 | 25 |
| src/components/organisms/test/GameProductionDefenseMasteryA.js | 267 | 11 |
| src/components/organisms/deepDive/receivers/groupNewFaces.js | 265 | 27 |
| src/pages/coaches/CoachesPage.js | 260 | 161 |
| src/components/organisms/deepDive/RushingLanesPosters.js | 256 | 36 |
| src/utils/gamesHubModel.js | 256 | 84 |
| src/components/organisms/runDefense/RunDefense.js | 254 | 73 |
| src/components/organisms/deepDive/receivers/infoParts.js | 253 | 253 |
| src/components/organisms/game-center/week/WeekCentralProvider.js | 247 | 186 |
| src/components/organisms/player/PlayerHomeStateMap.js | 245 | 141 |

- Receiver kit separates poster frames, chart views and table/identity views.
  The kit import path still serves receiver panels. New Faces and Then/Now each
  own their panels, and the registry continues to expose the label-spacing
  helper used by the infographics. The infographic primitives already form a
  cohesive shared collection, so they stay together in infoParts.js.
- Defense Mastery lab keeps its fixture separate from the panel. The box-score
  packet lab still renders the variant.
- Coaches page hands the staff section its team and coaches. The staff section
  owns the head coach, coordinator and position coach groupings.
- Rushing Lanes has separate simple and detailed cards with shared yard scales
  and color selection. Run Game separates its data and chart panels from
  screen controls. The chart and export render paths use the existing data.
- Games Hub separates contract and legacy row adapters from filtering, sorting
  and grouping. The existing module path serves the page and week export.
- Week Central keeps committed controls and the three contexts in the provider.
  A dedicated hook owns the season probe, week query, selected-game request,
  roster identity and league average reads.
- The player hometown map shares its SVG between the desktop overlay and
  phone rows. State selection, projection, and roster-share visibility stay in
  the entry component.

Scoped ESLint passed for all 27 files. The frontend-only development compile
completed with zero webpack warnings. Original export checks, 132 declaration
comparisons, 82 relative import checks and the existing Games Hub tests passed.
Before/after comparisons matched for 42 published Games Hub cases, 12 map views,
6 Week Central context/query/action cases and 13 receiver and rushing posters.
The runtime comparisons use UI and hook stubs. The refreshed inventory contains
1,297 source files with zero source parse failures.

Browser checks for the batch

1. Coaches staff view and season switching.
2. Games Hub filters and Week Central season, week, non-conference and game
   selection controls, including the brief and phone sheet.
3. Player hometown map with same-state, two-state and missing-state profiles.
4. Receiver New Faces/Then and Now, simple/detailed Rushing Lanes and Run Game
   with filters and exports. Check the Defense Mastery card in the box-score lab
   if using the lab.

## 2026-11-07 — Player profile spotlight with no charted games

Reviewed by **Codex (cleanup chat)**. A profile can contain scheduled games
with zero rows marked `played`. The shared spotlight assumed that it could
select a game from the filtered list and read its stats. That assumption made
the whole profile fail for affected players.

The profile adapter now returns a list for every input. The shared spotlight
renders an empty or loading state until it has a charted game, then mounts the
game readout, PAR chart and field map. The rule applies to both profile layouts.

Checked 12,733 published player-season profiles across seven seasons. Of those,
6,079 had zero charted games, including 916 in 2026. The adapter check covered
27,421 charted rows. Desktop and mobile profile tests cover loading, missing,
empty, uncharted and later-arriving data. Browser verification is pending.


## 2026-11-07 — Roster rows, game previews, events and lab views

Reviewed by **Codex (cleanup chat)** on **November 7, 2026**. Seven entries were
refactored and three reachable lab collections were reviewed and retained. All
claims for this batch were released. Browser verification is pending.

| Entry file | Before | After |
|---|---:|---:|
| src/components/organisms/test/WeekCentralCreativeRows.js | 244 | 244 |
| src/components/organisms/test/WeekCentralMagicRows.js | 243 | 243 |
| src/components/organisms/test/WeekCentralMagicRowsLab.js | 243 | 243 |
| src/utils/gamePreviewScout.js | 240 | 112 |
| src/pages/analytics/ratingLab.js | 235 | 3 |
| src/components/organisms/tabs/roster/RosterLineList.js | 235 | 91 |
| src/pages/stats/StatLabPage.js | 229 | 164 |
| src/utils/eventsModel.js | 228 | 49 |
| src/pages/game-center/GameCenterPage.js | 222 | 105 |
| src/components/organisms/rushing/RushingPlot.js | 218 | 175 |

- Preview scout separates metric rows and player/coach lookup from the match
  model. The public formatter and model exports keep their existing paths.
- Rating Lab separates presets and weight serialization from ranking and
  backtests. Roster Line List delegates player formatting, badges and the
  desktop and phone row to one row component. The list owns grouping and
  navigation, and still exports the shared class formatter.
- Stat Lab separates its two leader tables from query, filters and status
  handling. Game Center moves the phone layout and shared status components
  out of the route page.
- The events model separates occurrence merging, venue resolution and classic
  editions from season summaries. Rushing Plot delegates label placement and
  the hover and off-chart readouts.
- The design archive still imports Glory Ghost, Heritage Ledger, Cinematic
  Collision, Magazine Spread and Marquee. Marked CreativeRowsGallery and its
  CyberPulse variant, MagicRowsGallery and its NeonMonolith variant, plus
  ScoreEclipse and WinnerTakeover, for export-level archive review. Each has
  no caller on a reachable render path. The source collections are retained.

Scoped lint and frontend-only webpack compilation passed. Export checks,
90 declaration comparisons and 38 relative imports passed across 20 source
files. Before/after checks matched for 155 cases across published preview and
event data, rating presets, roster rows and profile links, Stat Lab states,
Game Center layouts and rushing plots. The view comparisons use stubs for
external UI and hooks. The inventory now covers 1,310 source files with
zero parse errors and retains unrelated reviewer and ownership records.

Browser checks for this batch

1. Team roster line view, including a player link at desktop and phone widths.
2. Game Center on desktop and phone, plus the game preview scout and event hub.
3. Rating Lab presets, Stat Lab season filters, and rushing chart hover.


## 2026-11-07 — Week Central adapters, player search and lab composition

Reviewed by **Codex (cleanup chat)** on **November 7, 2026**. Eight entries were
refactored and two reachable lab specimens were reviewed and retained. All
claims for this batch were released. Browser verification is pending.

| Entry file | Before | After |
|---|---:|---:|
| src/components/molecules/game/GameCenterContextCards.js | 217 | 72 |
| src/components/organisms/wiki/BandShowcaseCard.js | 216 | 186 |
| src/pages/ComponentLab.js | 215 | 49 |
| src/components/organisms/PlayerAnalyticsSearchRow.js | 212 | 38 |
| src/components/organisms/game-center/week/weekCentralAdapter.js | 209 | 52 |
| src/pages/glory/GloryPage.js | 205 | 138 |
| src/components/molecules/game/GameCardStyleLab.js | 203 | 203 |
| src/components/organisms/test/WeekCentralGameCardA.js | 202 | 202 |
| src/components/organisms/test/GameBannerMobileA.js | 202 | 53 |
| src/pages/game-center/TestGamePage.js | 196 | 104 |

- Game Center's legacy context cards share their frame. Team form has its own
  view, and the existing card registry still resolves all four public exports.
- The wiki band card delegates audio state and playback events to a hook. Track
  selection, seeking, metadata and end-of-track handling were checked together.
- Component Lab delegates the catalog and specimen slots to separate views.
  The page continues to own slot sizing and registry order.
- Player Analytics search separates row layout from search and team panels.
  The public division predicate remains available at its original import path.
- Week Central separates game, side and theme derivation from week selection,
  filtering and totals. Preview and final themes follow the existing rules.
- Glory delegates player and program leaderboards to a view. The page retains
  its source queries, provisional-state handling and ranking inputs.
- The lab phone scoreboard is separate from its sample and demo wrapper.
  Test Game delegates the box score banner to a lab component.
- GameCardStyleLab and WeekCentralGameCardA stay together as cohesive specimens.
  The layout lab and grid lab consume them, respectively.

Scoped lint and frontend-only compilation passed. Export checks, 79 declaration
comparisons and 30 relative imports passed across 20 source files. Before/after
checks matched in 95 cases, including 62 published Week Central week/filter
cases, player search, context cards, lab states, Glory and band playback. View
comparisons use UI and hook stubs. The refreshed inventory has zero parse errors
and preserves unrelated reviewer and ownership records.

Browser checks for this batch

1. Week Central game selection and Game Center context cards.
2. Player Analytics search and team filters.
3. Schools Wiki band track selection and playback controls, plus Glory boards.
4. Component Lab specimen slots, phone scoreboard and Test Game if using labs.


## 2026-11-07 — Roster controls, results rows and player chart panels

Reviewed by **Codex (cleanup chat)** on **November 7, 2026**. Six entries were
refactored and four cohesive entries were reviewed and retained. All ten trace
to the app entry. Claims for the batch were released. Browser verification is
pending.

| Entry file | Before | After |
|---|---:|---:|
| src/components/molecules/roster/RosterHubBanner.js | 196 | 102 |
| src/components/organisms/player/advancedTabMock.js | 192 | 90 |
| src/components/molecules/game/GameCenterResultsRail.js | 191 | 43 |
| src/components/organisms/stats/MatchupPicker.js | 189 | 33 |
| src/components/molecules/roster/RosterViewControlBar.js | 188 | 86 |
| src/components/organisms/player/PlayerPerformanceCharts.js | 187 | 28 |
| src/pages/analytics/TeamAnalyticsPage.js | 189 | 189 |
| src/pages/analytics/teamAnalyticsDictionary.js | 184 | 184 |
| src/components/molecules/game/PerformerCard.js | 184 | 184 |
| src/theme/index.js | 184 | 184 |

- Roster Hub keeps desktop composition and the display name at the banner
  entry. The phone layout and its season sheet have a dedicated component.
- Roster controls and ticker have separate components. The ticker owns its
  roster/player analytics reads, formatting and animation. The mobile control
  stripe uses the same band height.
- The results rail delegates game rows and period columns. The row supports
  regular quarters, overtime and final-score-only entries.
- The Matchup Picker separates tiles and the phone sheet from selection and
  swap logic. The public tile and league ID exports serve existing callers.
- Player performance views share the same chart row model and panel module.
  The entry handles the empty state and arrangement. The Advanced mock model
  groups its numeric estimates separately from the availability and career
  builders. Both keep their existing source policies.
- Team Analytics page already owns route orchestration. The metric dictionary
  and theme each define a shared configuration. PerformerCard keeps one
  rendering and rotation contract across Game and Week Central variants.

Scoped lint and frontend-only compilation passed. Original export checks,
69 declaration comparisons and 36 relative imports passed across 17 source
files. Before/after comparisons matched for 125 cases across roster layouts and
data states, results rows, matchup views, position estimates and chart panels.
The view comparisons use UI and hook stubs. The refreshed inventory has zero
parse errors and preserves unrelated review and ownership records.

Browser checks for this batch

1. Roster hub season sheet on phone and controls and ticker on desktop and phone.
2. Game Center results rail with final scores, quarters and overtime.
3. Team Analytics matchup picker and player profile Trends and Advanced views.


## 2026-11-07 — Roster routes, penalty grid and preview export

Reviewed by **Codex (cleanup chat)** on **November 7, 2026**. Six entries were
refactored and four cohesive entries were reviewed and retained. All ten trace
to the app entry. Claims for the batch were released. Browser verification is
pending.

| Entry file | Before | After |
|---|---:|---:|
| src/components/organisms/test/CoachesHubEcosystemA.js | 178 | 92 |
| src/components/organisms/stats/PenaltyMatrix.js | 175 | 111 |
| src/pages/teams/TeamRosterFullPage.js | 174 | 138 |
| src/components/molecules/game/GamesHubBanner.js | 173 | 88 |
| src/components/game/preview/GamePreviewShortPoster.js | 167 | 52 |
| src/pages/teams/TeamRosterHubPage.js | 166 | 151 |
| src/components/game/export/GameFlowStrip.js | 177 | 177 |
| src/components/organisms/wiki/FootballLegacyCard.js | 172 | 172 |
| src/components/organisms/wiki/SocialInfluencerCard.js | 171 | 171 |
| src/pages/stats/PlayerCountingStatsPage.js | 167 | 167 |

- Full Roster delegates the roster/enrichment join to a pure model and shares
  its banner and controls across layouts. The join still uses 2025 enrichment
  only. Roster Hub shares its banner, feature rail, grid and full-roster link
  between layout branches.
- Penalty Matrix owns filters, sorting and export controls. The heat grid owns
  cell presentation, team headers and horizontal scrolling.
- The Games Hub filter sheet has its own phone view. The page banner owns the
  filter values, option labels and desktop controls.
- The short preview poster owns the 1080-square frame. The panels own the team
  identities, tiles and recent results.
- Coaches Ecosystem keeps the fixture and school header in the entry card and
  renders leadership and scheme/impact panels together in a focused view.
- GameFlowStrip is already a set of related export chart views. FootballLegacy
  and SocialInfluencer each render a wiki card. PlayerCountingStatsPage already
  delegates its tables and banner while owning query and tab orchestration.
  These four files were retained as cohesive modules.

Scoped lint and frontend-only compilation passed. Public exports, 47 declaration
comparisons and 50 relative imports passed across 15 files. Before/after checks
matched in 102 cases across both roster routes, Games Hub filters, coaches panels,
32 penalty filter/palette cases and 27 published preview posters. The runtime
comparisons use UI and hook stubs. Inventory parsing reported zero failures and
unrelated reviewer and ownership records were preserved.

Browser checks for this batch

1. Roster Hub and Full Roster, including the year picker and full-roster links.
2. Games Hub phone filter sheet and penalty matrix filters and export.
3. Short game preview export and the coaches ecosystem panels.


## 2026-11-07 — Twenty-file review of stats, previews, banners and exports

Reviewed by **Codex (cleanup chat)** on **November 7, 2026**. Seven entries were
refactored and thirteen were reviewed and retained. Inventory claims were
released. Browser verification is pending.

| Entry file | Before | After |
|---|---:|---:|
| src/components/organisms/stats/CountingTable.js | 158 | 85 |
| src/components/organisms/deepDive/receivers/groupLeaders.js | 152 | 62 |
| src/components/organisms/wiki/WikiHeroBanner.js | 151 | 95 |
| src/hooks/useGamePreview.js | 150 | 63 |
| src/components/organisms/test/BannerSchedule.js | 142 | 50 |
| src/components/molecules/events/SeasonCalendarList.js | 140 | 110 |
| src/pages/game-center/GameExportPage.js | 134 | 115 |
| src/pages/analytics/teamProfileMetrics.js | 163 | 163 |
| src/components/molecules/game/GameCenterFeaturedGameCard.js | 161 | 161 |
| src/pages/analytics/matchupMetrics.js | 160 | 160 |
| src/components/organisms/test/CoachesHubWidgets.js | 155 | 155 |
| src/components/game/export/PosterChrome.js | 154 | 154 |
| src/components/game/page/summary/DrivesPanel.js | 148 | 148 |
| src/pages/analytics/trendSeries.js | 147 | 147 |
| src/components/molecules/roster/RosterHubGrid.js | 146 | 146 |
| src/components/game/page/summary/GameProductionComparison.js | 140 | 140 |
| src/components/molecules/events/ClassicsFeatureCard.js | 135 | 135 |
| src/utils/gameHelpers.js | 134 | 134 |
| src/components/game/export/OffensePoster.js | 132 | 132 |
| src/components/molecules/venues/VenueFortressCard.js | 132 | 132 |

- CountingTable owns sorting and minimums. The shared cell view owns team and
  player identity, links, and numeric formatting.
- Receiver leaders and clutch keep their poster registries at the entry.
  Clutch plays, win-chance and big-moment panels have their own module.
- Wiki Hero and Conference Slate each separate their phone view from the main
  banner. The mobile views retain their existing switcher and season controls.
- Game Preview separates published payload adaptation from query and redirect
  logic. The missing-preview index lookup and public URL helper remain at the
  same import path.
- Season Calendar keeps its family/team filters and column arrangement. The row
  view owns the matchup, venue and sibling-tag presentation.
- Game Export uses the existing PNG capture, file conversion and download
  helpers. The removed local copies match the shared implementations.
- The profile, matchup and trend models, coaches widgets, poster chrome,
  featured game card, roster grid, classics card, offense poster and venue
  card already have cohesive roles. They were reviewed and retained.
- DrivesPanel and GameProductionComparison are reachable through the game-page
  barrel. Their named exports have no current render callers. The same names
  in GamePage_Legacy refer to separate local implementations. Both modules are
  flagged for archive review. gameHelpers remains shared. Its ordSuffix,
  completionPct, yardsPerAttempt, formatDuration and getTeamColor exports have
  no source importers and are flagged for export-level archive review.

Scoped lint and frontend-only compilation passed. Public export checks,
130 declaration comparisons and 52 relative imports passed across 26 files.
Before/after comparisons matched across 90 cases covering preview payloads
and fallback states, both banners, team/player tables, published calendar
rows, receiver posters and game export states. View checks use UI and hook
stubs. The inventory parser reported zero failures and preserved unrelated
review and ownership records.

Browser checks for this batch

1. Game previews and the game export page, including saving a poster.
2. Team and player counting table sort and links, and receiver clutch posters.
3. Wiki and Conference Slate banners on phone and desktop, and calendar filters.


## 2026-11-07 — Twenty-file review of roster grouping, chart views and hub models

Reviewed by **Codex (cleanup chat)** on **November 7, 2026**. Six entries were
refactored and fourteen were reviewed and retained. Inventory claims were
released. Browser verification is pending.

| Entry file | Before | After |
|---|---:|---:|
| src/utils/gamePreview.js | 126 | 56 |
| src/hooks/useGameCenterHubData.js | 125 | 29 |
| src/components/organisms/tabs/RosterTab.js | 119 | 47 |
| src/components/organisms/downDistance/DownDistanceCharts.js | 118 | 45 |
| src/components/organisms/player/PlayerStatsTab.js | 118 | 64 |
| src/components/game/export/GamesHubWeekPoster.js | 114 | 95 |
| src/components/game/page/summary/GameLeadersPanel.js | 131 | 131 |
| src/components/organisms/Header.js | 131 | 131 |
| src/components/organisms/wiki/RivalryCard.js | 131 | 131 |
| src/components/molecules/game/GameCenterFeaturedGameCardMobile.js | 130 | 130 |
| src/components/organisms/stats/TeamBarChart.js | 126 | 126 |
| src/components/organisms/SideNavGameButton.js | 125 | 125 |
| src/utils/headshots.js | 125 | 125 |
| src/components/organisms/wiki/HistoryTimelineCard.js | 124 | 124 |
| src/components/organisms/test/GamesHubMarqueeMatchupA.js | 119 | 119 |
| src/components/game/export/DrivesPoster.js | 118 | 118 |
| src/pages/stats/TeamCountingStatsPage.js | 115 | 115 |
| src/components/organisms/test/GamesHubPlaymakerSpotlightA.js | 115 | 115 |
| src/components/molecules/stats/StatTable.js | 114 | 114 |
| src/components/organisms/test/GamesHubIdentityClashA.js | 114 | 114 |

- Game preview separates its matchup sheet and rank presentation from route
  and date helpers. Existing callers still import from gamePreview.js. The
  kickoffDate export has no source caller and is flagged for archive review.
- Game Center Hub separates published data adaptation from the query hook.
  Home, the phone menu and Game Center still read the shared hook. The adapter
  covers featured cards, standings, context cards and missing/empty states.
- RosterTab delegates sorting, filtering and grouping to a pure model.
  RosterLineRow and the roster model now reuse the identical class formatter
  from playerCardModel. The existing formatter re-export still serves callers.
- Down & Distance keeps selection and export controls in the entry. Chart and
  poster presentation live together so both use the same chart dispatcher.
- The player game-log view owns its table and builds rows when selected.
  The existing log source and its generated-stat policy remain documented in
  the player backend note.
- Games Hub week selection lives alongside the schedule model. The poster
  path still exposes pickWeeks for compatibility.
- Header, SideNav game button, wiki rivalry/history cards, the mobile featured
  card, team bars, headshot matching, DrivesPoster, team counting route and
  StatTable each serve a cohesive role. The three Games Hub design specimens
  remain registered in the design archive.
- GameLeadersPanel is reachable through the game-page barrel but has no live
  render caller. The legacy game page defines a separate local implementation.
  The current barrel export is flagged for archive review.

Scoped lint and frontend-only compilation passed. Public exports,
92 declaration comparisons and 57 relative imports passed across 27 files.
Before/after checks matched in 121 cases across published matchup sheets,
hub states, roster grouping/filtering, Down & Distance, player stats and
seven seasons of week posters. View comparisons use UI and hook stubs.
The inventory parser reported zero failures and preserved unrelated review
and ownership records.

Browser checks for this batch

1. Game Center and the phone menu, plus a preview matchup and week poster.
2. Roster line/card views and grouping, sorting and filters.
3. Down & Distance chart switching and PNG export, plus the player Game Log.
