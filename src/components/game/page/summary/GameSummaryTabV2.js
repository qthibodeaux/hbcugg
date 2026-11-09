import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";
import { useMemo } from "react";
import { buildIdentityIndex } from "../../../../utils/headshots";
import { ANIMATION_STYLES } from "./summaryAnimations";
import PageShell from "../../../layouts/PageShell";
import { Box } from "@chakra-ui/react";
import { TeamStatsComparisonCard } from "./TeamStatsComparisonCard";
import { GameInfoCard } from "./GameInfoCard";
import { ScoringSummaryCard } from "./ScoringSummaryCard";
import { NotablePerformersCard } from "./NotablePerformersCard";
import { GameFactoidsCard } from "./GameFactoidsCard";
import { GameLeadersCard } from "./GameLeadersCard";
import { ScoringPlaysCard } from "./ScoringPlaysCard";
import { ChainsMovedCard, SeriesResultsCard } from "./SeriesCards";
import { getTeamAccent } from "../../../../utils/gameSummary/teamIdentity";
import { AdvancedBasicsCard } from "./AdvancedBasicsCard";
import { WinProbabilityCard } from "./WinProbabilityCard";

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SUMMARY TAB — PageShell Grid Layout
// ═══════════════════════════════════════════════════════════════════════════════
// Grid layout:
//   Row 1: The March (4x1) — DEFERRED past launch.0, not rendered
//   Row 2: ScoringSummary (1x1) | TeamStats (2x2)     | MVP (1x1)
//   Row 3: WinProb (1x1)        | TeamStats cont      | GameLeaders (1x2)
//   Row 4: GameInfo (1x1)       | DriveSummary (2x1)  | GameLeaders cont
//
//   Column reading order: left = Scoring Summary / Win Probability / Meta,
//   center = Team Stats / Drive Summary, right = Notable Performers / Game Leaders.
//   Auto-placement does the work — the emit order below is what sets the columns.
//   Row 5: Chains Moved (2x1) | Series Results (2x1)
//   Drive Summary — its own Drives tab since 2026-09-20 (DrivesTab.js); the
//   table still lives in this file and is exported from here.
// ═══════════════════════════════════════════════════════════════════════════════

export const GameSummaryTabV2 = ({
  game,
  awayId,
  homeId,
  meta,
  teamStats,
  advancedTeam,
  teamEntries,
  playerSeasons,
  priorPlayerSeasons = [],
  productionScores,
  drives,
  plays,
  leagueAvg = null,
}) => {
  const { isCompact } = useLayoutDensity();
  const identity = useMemo(() => buildIdentityIndex(playerSeasons, priorPlayerSeasons), [playerSeasons, priorPlayerSeasons]);

  return (
    <>
      <style>{ANIMATION_STYLES}</style>

      {/* Row 1: The March — pulled from the tab for launch.0 (see AFTER_LAUNCH_0.md §1).
          Retained implementation: organisms/test/GameFieldPositionMarch.js. */}

      {isCompact ? (
        <>
          {/* COMPACT ONLY — Team Stats and Game Leaders get full width (they're the densest
              cards here); everything else pairs up 2-and-2 instead of cramming 4 across a row.
              Mobile and standard density are untouched — see the else branch below. */}

          {/* Team Stats — full width, keeps its 2-row height */}
          <PageShell.Slot cols={4} rows={2}>
            <Box w="full" h="full">
              <TeamStatsComparisonCard awayId={awayId} homeId={homeId} teamStats={teamStats} advancedTeam={advancedTeam} game={game} leagueAvg={leagueAvg} />
            </Box>
          </PageShell.Slot>

          {/* Game Info + Scoring Summary — paired */}
          <PageShell.Slot cols={2}>
            <Box w="full" h="full">
              <GameInfoCard meta={meta} awayId={awayId} homeId={homeId} />
            </Box>
          </PageShell.Slot>
          <PageShell.Slot cols={2}>
            <Box w="full" h="full">
              <ScoringSummaryCard scoreByQuarter={game?.score_by_quarter} awayScore={game?.away_team?.score} homeScore={game?.home_team?.score} awayId={awayId} homeId={homeId} />
            </Box>
          </PageShell.Slot>

          {/* Notable Performers + Win Probability — paired */}
          <PageShell.Slot cols={2}>
            <Box w="full" h="full">
              <NotablePerformersCard awayId={awayId} homeId={homeId} teamEntries={teamEntries} identity={identity} parCard={game?.par_card} />
            </Box>
          </PageShell.Slot>
          <PageShell.Slot cols={2}>
            <Box w="full" h="full">
              <GameFactoidsCard plays={plays} awayId={awayId} homeId={homeId} />
            </Box>
          </PageShell.Slot>

          {/* Game Leaders — full width, keeps its 2-row height */}
          <PageShell.Slot cols={4} rows={2}>
            <Box w="full" h="full">
              <GameLeadersCard awayId={awayId} homeId={homeId} teamEntries={teamEntries} identity={identity} />
            </Box>
          </PageShell.Slot>

          {/* Scoring Plays — full width, its own row */}
          <PageShell.Slot cols={4}>
            <Box w="full" h="full">
              <ScoringPlaysCard scoringPlays={game?.scoring_plays} driveSummary={game?.drive_summary} identity={identity} awayId={awayId} homeId={homeId} />
            </Box>
          </PageShell.Slot>

          {/* Series read — two half-width cards, the last row */}
          <PageShell.Slot cols={2}>
            <Box w="full" h="full">
              <ChainsMovedCard seriesSummary={game?.series_summary} awayId={awayId} homeId={homeId} accent={getTeamAccent(awayId)} />
            </Box>
          </PageShell.Slot>
          <PageShell.Slot cols={2}>
            <Box w="full" h="full">
              <SeriesResultsCard seriesSummary={game?.series_summary} awayId={awayId} homeId={homeId} accent={getTeamAccent(awayId)} />
            </Box>
          </PageShell.Slot>
        </>
      ) : (
        <>
          {/* Row 2 left: Scoring Summary — 1x1 */}
          <PageShell.Slot cols={1}>
            <Box w="full" h="full">
              <ScoringSummaryCard scoreByQuarter={game?.score_by_quarter} awayScore={game?.away_team?.score} homeScore={game?.home_team?.score} awayId={awayId} homeId={homeId} />
            </Box>
          </PageShell.Slot>

          {/* Row 2-3 center-left: Team Stats — 1x2 */}
          <PageShell.Slot cols={1} rows={2}>
            <Box w="full" h="full">
              <TeamStatsComparisonCard awayId={awayId} homeId={homeId} teamStats={teamStats} advancedTeam={advancedTeam} game={game} leagueAvg={leagueAvg} />
            </Box>
          </PageShell.Slot>

          {/* Row 2-3 center-right: PAR Breakdown — 1x2 */}
          <PageShell.Slot cols={1} rows={2}>
            <Box w="full" h="full">
              <AdvancedBasicsCard awayId={awayId} homeId={homeId} drives={drives} plays={plays} teamStats={teamStats} advancedBasics={game?.advanced_basics} leagueAvg={leagueAvg} />
            </Box>
          </PageShell.Slot>

          {/* Row 2 right: MVP / Notable Performers — 1x1 */}
          <PageShell.Slot cols={1}>
            <Box w="full" h="full">
              <NotablePerformersCard awayId={awayId} homeId={homeId} teamEntries={teamEntries} identity={identity} parCard={game?.par_card} />
            </Box>
          </PageShell.Slot>

          {/* Row 3 left: Game Flow (Win Probability + Expected Points) — 1x1 */}
          <PageShell.Slot cols={1}>
            <Box w="full" h="full">
              <WinProbabilityCard winProbability={game?.win_probability} epaTimeline={game?.epa_timeline} awayId={awayId} homeId={homeId} />
            </Box>
          </PageShell.Slot>

          {/* Row 3-4 right: Game Leaders — 1x2 */}
          <PageShell.Slot cols={1} rows={2}>
            <Box w="full" h="full">
              <GameLeadersCard awayId={awayId} homeId={homeId} teamEntries={teamEntries} identity={identity} />
            </Box>
          </PageShell.Slot>

          {/* Row 4 left: Game Info / Meta — 1x1 */}
          <PageShell.Slot cols={1}>
            <Box w="full" h="full">
              <GameInfoCard meta={meta} awayId={awayId} homeId={homeId} />
            </Box>
          </PageShell.Slot>

          {/* Row 4 center: Scoring Plays — 2x1 */}
          <PageShell.Slot cols={2}>
            <Box w="full" h="full">
              <ScoringPlaysCard scoringPlays={game?.scoring_plays} driveSummary={game?.drive_summary} identity={identity} awayId={awayId} homeId={homeId} />
            </Box>
          </PageShell.Slot>

          {/* Series read — two half-width cards, the last row */}
          <PageShell.Slot cols={2}>
            <Box w="full" h="full">
              <ChainsMovedCard seriesSummary={game?.series_summary} awayId={awayId} homeId={homeId} accent={getTeamAccent(awayId)} />
            </Box>
          </PageShell.Slot>
          <PageShell.Slot cols={2}>
            <Box w="full" h="full">
              <SeriesResultsCard seriesSummary={game?.series_summary} awayId={awayId} homeId={homeId} accent={getTeamAccent(awayId)} />
            </Box>
          </PageShell.Slot>
        </>
      )}
    </>
  );
};

export default GameSummaryTabV2;

export { getTeamAccent } from "../../../../utils/gameSummary/teamIdentity";

export { ScoringSummaryCard } from "./ScoringSummaryCard";

export { WinProbabilityCard } from "./WinProbabilityCard";

export { DriveResultPill, DriveSummaryTable, DriveSummaryMobile } from "../drives/DriveSummaryCards";

export { statBarPct, statBarSegment, buildTeamStatRows } from "../../../../utils/gameSummary/teamStatsModel";

export { useMetricBlocks } from "../../../../hooks/useGameSummaryMetrics";

export { metricInk, metricShade, metricFmt } from "../../../../utils/gameSummary/metricsModel";

export { GameLeadersCard } from "./GameLeadersCard";

export { NotablePerformersCard } from "./NotablePerformersCard";

export { ScoringPlaysCard } from "./ScoringPlaysCard";

export { ANIMATION_STYLES } from "./summaryAnimations";

export { GameFactoidsCard } from "./GameFactoidsCard";

export { GameInfoCard } from "./GameInfoCard";
