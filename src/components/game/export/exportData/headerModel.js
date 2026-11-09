import { asNum } from "./valueFormat";
import { teamShortName, teamMascot } from "./teamIdentity";

// Game export header reads from the existing game/team/metadata fields.

export const buildHeader = (game) => {
  const away = game?.away_team ?? {};
  const home = game?.home_team ?? {};
  const awayId = away.team_id ?? game?.metadata?.away_team?.id ?? null;
  const homeId = home.team_id ?? game?.metadata?.home_team?.id ?? null;
  const awayScore = asNum(away.score);
  const homeScore = asNum(home.score);
  const winnerId = game?.winner_team_id ?? (awayScore != null && homeScore != null ? (awayScore > homeScore ? awayId : homeScore > awayScore ? homeId : null) : null);
  const margin = awayScore != null && homeScore != null ? Math.abs(awayScore - homeScore) : null;
  return {
    awayId,
    homeId,
    away: { id: awayId, name: teamShortName(awayId), mascot: teamMascot(awayId), score: awayScore, record: away.record ?? null, confRecord: away.conference_record ?? null, conference: away.conference ?? null },
    home: { id: homeId, name: teamShortName(homeId), mascot: teamMascot(homeId), score: homeScore, record: home.record ?? null, confRecord: home.conference_record ?? null, conference: home.conference ?? null },
    winnerId,
    margin,
    status: game?.status ?? "final",
    date: game?.date ?? game?.metadata?.date ?? null,
    weekLabel: game?.week_label ?? (game?.week != null ? `Week ${game.week}` : null),
    site: game?.venue?.site ?? game?.metadata?.site ?? null,
    isOT: Array.isArray(game?.score_by_quarter?.labels) && game.score_by_quarter.labels.length > 4,
  };
};
