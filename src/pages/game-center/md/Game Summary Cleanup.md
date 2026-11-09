# Game summary cleanup - batch 1

Date: 2026-10-31. Scope: GamePageShell, SummaryTab and the scoring-summary,
win-probability and drive-summary families inside GameSummaryTabV2.

## Changes

- GameSummaryTabV2: 3,594 -> 2,548 lines. Existing working-tree changes were the
  baseline for extraction; no older Git version was restored over them.
- Extracted ScoringSummaryCard and WinProbabilityCard into summary files.
- Extracted DriveSummaryTable, DriveSummaryMobile and their presentation helpers
  into drives/DriveSummaryCards.js. Both layouts stay separate.
- Extracted DriveFieldStrip into drives/DriveFieldStrip.js; scoring-play and drive
  presentations share the same existing field renderer.
- Moved team/color helpers and drive-row preparation to utils/gameSummary.
  These retain their own fallback/label semantics; they were not merged with
  the different box-score identity contract.
- Shared editorial primitives live in SummaryPrimitives.js.
- Original exports remain available from GameSummaryTabV2 for compatibility.
- DrivesTab and GamePageMobile now import drive cards directly. SummaryMobile
  imports the extracted win-probability card and team accent helper directly.
- SummaryTab's unused `drives` input and the corresponding GamePageShell prop
  forwarding were removed. It still maps `driveSummary` to the child's `drives`.
  GamePageShell retains its own normalized drives for the actual PBP consumers.

## Proven unused code removed

Private, unexported bindings with no references: getTeamName, LogoWatermark,
Hairline and HeroStat. Their unused-variable suppressions are gone. Unused
Recharts imports were also dropped while rebuilding the import list.

FieldPositionMarch and its sample/helper chain remain intact because their source
explicitly marks them as a deferred feature to restore. No archive deletion was
inferred from their lack of a current render call.

## Verification

- All 95 retained top-level declarations matched the pre-edit AST, including
  compact/standard/mobile JSX and the summary page composition.
- Public named/default exports are unchanged (moved names are re-exported).
- 1,788 drive rows across 72 real game files matched original model output.
- 576 initial component outputs matched for scoring summary, win probability,
  desktop drives and mobile drives, using compact/standard density mocks.
  These are structural element comparisons with mocked UI primitives, not browser
  screenshots or interaction tests.
- All 13 touched/new JavaScript files passed parsing, local-import resolution,
  UTF-8 checks and ESLint with zero warnings.
- No full build or browser visual verification performed.

## Still pending

GameSummaryTabV2 still owns advanced metric preparation, team-stat comparisons,
leaders, notable performers, factoids, scoring plays, animations and a retained
field-position experiment. Continue by separating metrics/model hooks from
presentation, then leaders/performers and scoring plays, preserving public
imports and source data meaning. This feature is not fully cleaned just because
several cards moved out.

GamePageShell's overall structure is reasonable; no additional restructuring was
needed in this batch. Its unsupported-section fallback is retained.

## Batch 2 - metrics and team stats (2026-10-31)

GameSummaryTabV2: 2,548 -> 1,909 lines. Extracted:

- utils/gameSummary/metricsModel.js: metric keys, aliases, labels, formatting,
  comparisons, shading and the existing drive/play-derived fallback.
- utils/gameSummary/teamStatsModel.js: team-stat rows and shared bar helpers.
- hooks/useGameSummaryMetrics.js: memoized backend-block/fallback selection.
- summary/AdvancedBasicsCard.js: desktop metrics presentation.
- summary/TeamStatsComparisonCard.js: desktop team-stat presentation.

Mobile reads the same model and hook directly. Existing public exports remain
available from GameSummaryTabV2. Statistical definitions, missing-data defaults,
sack handling, league scaling and layouts are unchanged. Pure models have no
React or component imports; the hook owns memoization only.

Checks: all 61 retained summary declarations and all mobile declarations matched
the pre-batch AST; exports/imports preserved; seven files passed ESLint with zero
warnings. On 72 historical games, 144 metric-block comparisons, 1,728 team-stat
row comparisons (including formatters and bars), and 288 initial card outputs
matched. Separately, all 567 backend metrics from 27 available 2026 exports
matched. Backend aliases, league scales, zero/missing values, formatting and
comparison coloring also matched in explicit edge cases.

No browser visual check or full build performed. This remains a structural pass:
the derived fallback assumes older flat drive fields, while 2026 prefers shipped
advanced_basics. Some team-stat missing values still become zero. These semantics
need a separate contract review if changed, not an incidental refactor fix.

Next: leaders/performers and scoring-play composition. The retained field-position
experiment and its data are still present; overall summary cleanup is not complete.

## Batch 3 - leaders, performers and scoring plays

Date: 2026-10-31. Parent reduced from 1,909 to 1,112 lines. Extracted
GameLeadersCard, NotablePerformersCard, ScoringPlaysCard and CandidateImage,
plus playerProductionModel and scoringPlaysModel. Mobile imports the cards
directly. All 38 declarations and mobile bodies matched baseline AST; public
exports preserved; eight files passed ESLint. No browser verification performed.
Existing mock performers on absent production data are preserved as a separate
semantic issue. Factoids and the explicitly retained field-position experiment
remain in the parent.

## Batch 4 - factoids and retained experiment

Date: 2026-10-31. Reviewed by: Codex (cleanup chat). Parent: 1,112 -> 235
lines. Factoids moved to factoidsModel.js and GameFactoidsCard.js; animations
to summaryAnimations.js. FieldPositionMarch and its existing sample/helper
chain are preserved in organisms/test/GameFieldPositionMarch.js, intentionally
not loaded by the live page or registered as a new experiment. Existing exports
are preserved. All 15 original declarations/JSX match the baseline; five files
pass ESLint and import/encoding checks. No browser verification performed.
Structural extraction is complete; semantic issues and visual regression remain
separate follow-up work.
