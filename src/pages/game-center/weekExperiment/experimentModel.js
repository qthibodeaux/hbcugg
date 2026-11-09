// Retained weekly-board lab model, including its original 2025 default and
// deduplication/week parsing. This is not the live Week Central data contract.
import teamsData from "../../../data/teams.json";

export const DEFAULT_SEASON = 2025;

export const SEASONS = [2025, 2024, 2023, 2022, 2021];

const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId] = team;
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

export const fetcher = async (path) => {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
};

const normalizeTeamKey = (value) => String(value ?? "").replace(/25$/, "");

const getWeekFromStem = (stem) => {
  const match = String(stem ?? "").match(/^W(\d+)/i);
  return match ? Number(match[1]) : null;
};

export const getGameWeek = (game) => {
  if (game?.week != null) return Number(game.week);
  return getWeekFromStem(game?.parsed_game_stem);
};

const fmtDate = (value) => {
  if (!value) return "TBD";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return String(value);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const dedupeGames = (games) => {
  const seen = new Map();
  for (const game of games) {
    const stem = game.parsed_game_stem;
    if (stem) {
      if (!seen.has(stem)) seen.set(stem, game);
    } else {
      const key = `${[game.team_id, game.opponent_id || game.opponent_name].sort().join("-")}-${game.date}`;
      if (!seen.has(key)) seen.set(key, game);
    }
  }
  return [...seen.values()];
};

export const getMatchup = (game) => {
  const homeTeamId = game.home_away === "home" ? game.team_id : game.opponent_id;
  const awayTeamId = game.home_away === "away" ? game.team_id : game.opponent_id;
  const homeScore = game.home_away === "home" ? Number(game.score_team ?? 0) : Number(game.score_opp ?? 0);
  const awayScore = game.home_away === "away" ? Number(game.score_team ?? 0) : Number(game.score_opp ?? 0);
  const homeFallback = game.home_away === "home" ? null : game.opponent_name;
  const awayFallback = game.home_away === "away" ? null : game.opponent_name;
  const homeTeam = TEAM_BY_ID[homeTeamId] ?? TEAM_BY_ID[normalizeTeamKey(homeTeamId)];
  const awayTeam = TEAM_BY_ID[awayTeamId] ?? TEAM_BY_ID[normalizeTeamKey(awayTeamId)];
  const isFinal = !!game.result;
  const totalPoints = isFinal ? homeScore + awayScore : null;
  const margin = isFinal ? Math.abs(homeScore - awayScore) : null;

  return {
    game,
    week: getGameWeek(game),
    dateLabel: fmtDate(game.date),
    isFinal,
    totalPoints,
    margin,
    linkTo: game.parsed_game_stem ? `/game/${game.parsed_game_stem}` : null,
    homeScore,
    awayScore,
    home: {
      ...homeTeam,
      label: homeTeam?.shortName ?? homeFallback ?? "HOME",
      logo: homeTeam?.logo,
    },
    away: {
      ...awayTeam,
      label: awayTeam?.shortName ?? awayFallback ?? "AWAY",
      logo: awayTeam?.logo,
    },
  };
};
