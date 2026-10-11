import { GameSummaryTabV2 } from "./GameSummaryTabV2";

export const SummaryTab = ({
  game,
  awayId,
  homeId,
  meta,
  teamBox,
  teamStats,
  advancedTeam,
  teamEntries,
  playerSeasons,
  priorPlayerSeasons,
  leagueAvg,
  productionScores,
  drives,
  driveSummary,
  plays,
}) => {
  return (
    <GameSummaryTabV2
      game={game}
      awayId={awayId}
      homeId={homeId}
      meta={meta}
      teamStats={teamStats || teamBox}
      advancedTeam={advancedTeam}
      teamEntries={teamEntries}
      playerSeasons={playerSeasons}
      priorPlayerSeasons={priorPlayerSeasons}
      leagueAvg={leagueAvg}
      productionScores={productionScores}
      drives={driveSummary}
      plays={plays}
    />
  );
};
