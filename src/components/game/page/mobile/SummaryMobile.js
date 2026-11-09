import { Box } from "@chakra-ui/react";
import { useMemo } from "react";
import { buildIdentityIndex } from "../../../../utils/headshots";
import { getTeamAccent } from "../../../../utils/gameSummary/teamIdentity";
import { ANIMATION_STYLES } from "../summary/summaryAnimations";
import { Part } from "./MobileSummaryPrimitives";
import { ScoringSummaryMobile, TeamStatsMobile, MetricsMobile } from "./MobileSummaryCards";
import { WinProbabilityCard } from "../summary/WinProbabilityCard";
import { GameInfoCard } from "../summary/GameInfoCard";
import { NotablePerformersCard } from "../summary/NotablePerformersCard";
import { GameLeadersCard } from "../summary/GameLeadersCard";
import { ScoringPlaysCard } from "../summary/ScoringPlaysCard";
import { ChainsMovedCard, SeriesResultsCard } from "../summary/SeriesCards";

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY — MOBILE. One full-width part after another, flush, no gaps, each
// registered with the page's jump header. Team Stats and Metrics have their
// phone versions; the other parts still render their desktop cards at a fixed
// height until they get theirs (component by component).
// ─────────────────────────────────────────────────────────────────────────────

export const SUMMARY_PARTS = [
  { id: "scoring", label: "Scoring Summary" },
  { id: "team-stats", label: "Team Stats" },
  { id: "metrics", label: "Metrics" },
  { id: "flow", label: "Game Flow" },
  { id: "info", label: "Game Info" },
  { id: "performers", label: "Notable Performers" },
  { id: "leaders", label: "Game Leaders" },
  { id: "plays", label: "Scoring Plays" },
  { id: "chains", label: "Moving the Chains" },
  { id: "series", label: "Series Results" },
];

// Desktop card at a fixed height until its phone version is built.
const Legacy = ({ h, children }) => <Box h={h} w="full">{children}</Box>;

export const SummaryMobile = ({
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
  refs,
}) => {
  const identity = useMemo(() => buildIdentityIndex(playerSeasons, priorPlayerSeasons), [playerSeasons, priorPlayerSeasons]);
  const accent = getTeamAccent(awayId);

  return (
    <Box>
      <style>{ANIMATION_STYLES}</style>
      <Part id="scoring" refs={refs} tone={0}>
        <ScoringSummaryMobile scoreByQuarter={game?.score_by_quarter} awayScore={game?.away_team?.score} homeScore={game?.home_team?.score} awayId={awayId} homeId={homeId} />
      </Part>
      <Part id="team-stats" refs={refs} tone={1}>
        <TeamStatsMobile awayId={awayId} homeId={homeId} teamStats={teamStats} advancedTeam={advancedTeam} game={game} leagueAvg={leagueAvg} />
      </Part>
      <Part id="metrics" refs={refs} tone={0}>
        <MetricsMobile awayId={awayId} homeId={homeId} drives={drives} plays={plays} teamStats={teamStats} advancedBasics={game?.advanced_basics} leagueAvg={leagueAvg} />
      </Part>
      <Part id="flow" refs={refs} tone={1}>
        <Legacy h="22rem">
          <WinProbabilityCard winProbability={game?.win_probability} epaTimeline={game?.epa_timeline} awayId={awayId} homeId={homeId} />
        </Legacy>
      </Part>
      <Part id="info" refs={refs} tone={0}>
        <Legacy h="11.25rem">
          <GameInfoCard meta={meta} awayId={awayId} homeId={homeId} />
        </Legacy>
      </Part>
      <Part id="performers" refs={refs} tone={1}>
        <Legacy h="11.5rem">
          <NotablePerformersCard mobile awayId={awayId} homeId={homeId} teamEntries={teamEntries} identity={identity} parCard={game?.par_card} />
        </Legacy>
      </Part>
      <Part id="leaders" refs={refs} tone={0}>
        <Legacy h="36rem">
          <GameLeadersCard awayId={awayId} homeId={homeId} teamEntries={teamEntries} identity={identity} />
        </Legacy>
      </Part>
      <Part id="plays" refs={refs} tone={1}>
        <ScoringPlaysCard mobile scoringPlays={game?.scoring_plays} driveSummary={game?.drive_summary} identity={identity} awayId={awayId} homeId={homeId} />
      </Part>
      <Part id="chains" refs={refs} tone={0}>
        <Legacy h="15rem">
          <ChainsMovedCard seriesSummary={game?.series_summary} awayId={awayId} homeId={homeId} accent={accent} />
        </Legacy>
      </Part>
      <Part id="series" refs={refs} tone={1}>
        <Legacy h="15rem">
          <SeriesResultsCard seriesSummary={game?.series_summary} awayId={awayId} homeId={homeId} accent={accent} />
        </Legacy>
      </Part>
    </Box>
  );
};

export default SummaryMobile;

export { JUMP_MARGIN, Part } from "./MobileSummaryPrimitives";
