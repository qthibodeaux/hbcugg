import teamsData from "../../../../data/teams.json";
import { GAME_CENTER_SEASONS } from "../../../molecules/game/SeasonSelector";

// Week Central adapter — Week Central Design Doc §3.
//
// One request per week: week-central/{season}/{week}.json. The payload is
// already page-shaped (weeks[], summary, games[] with away_team/home_team,
// is_covered_matchup, venue). This file only joins local team identity
// (logo, colors) by team_id and reshapes each game into the slate model the
// row / brief components already read. No week derivation, no name matching,
// no classification — those are the backend's (Fetch Contract cross-page
// rules 1–2).

export const BRAND_PREVIEW_COLOR = "#E53E3E";
// Single shared launch.0 year scope — see GAME_CENTER_SEASONS.
export const WEEK_CENTRAL_SEASONS = GAME_CENTER_SEASONS;

const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  const id = team.exportId.replace(/25$/, "");
  acc[id] = team;
  acc[team.exportId] = team;
  return acc;
}, {});

export const normalizeTeamKey = (value) => String(value ?? "").replace(/25$/, "");
const teamLabel = (team) => team?.bannerShort ?? team?.shortName ?? "TBD";
const teamLogo = (team) => team?.logo ?? (team?.exportId ? `/assets/${team.exportId.replace(/25$/, "")}.svg` : null);

export const isHBCUTeam = (id) => !!(TEAM_BY_ID[normalizeTeamKey(id)] ?? TEAM_BY_ID[id]);

// Week labels come from the payload (`weeks[].label` / `compact_label`).
export const getCompactWeekLabel = (weekEntry) =>
  weekEntry?.compact_label ?? (weekEntry?.week != null ? `W${weekEntry.week}` : "");

export const getSide = (id, text) => {
  const team = TEAM_BY_ID[normalizeTeamKey(id)] ?? TEAM_BY_ID[id];
  return {
    id: normalizeTeamKey(id),
    label: team ? teamLabel(team) : text || "TBD",
    name: team?.name ?? text ?? "TBD",
    logo: teamLogo(team),
    color: team?.colors?.primary ?? "#27272A",
    secondary: team?.colors?.secondary ?? "#FFFFFF",
    accent: team?.colors?.accent ?? team?.colors?.secondary ?? "#FFFFFF",
  };
};

// Contract game → slate game. `rawGame` is the schedule-facts view the brief
// panel reads (date, kickoff, stadium, city, records) — flat, contract-named.
const buildGameModel = (game) => {
  const away = game.away_team ?? {};
  const home = game.home_team ?? {};
  const awayId = away.team_id ? normalizeTeamKey(away.team_id) : null;
  const homeId = home.team_id ? normalizeTeamKey(home.team_id) : null;
  const awayScore = away.score != null ? Number(away.score) : null;
  const homeScore = home.score != null ? Number(home.score) : null;
  const isFinal = game.status === "final" && awayScore != null && homeScore != null;
  const bothHBCU = game.is_covered_matchup === true;
  const venue = game.venue ?? {};
  const tag = game.tag || (game.bowl_game ? "Bowl Game" : game.conference_game ? "Conference" : bothHBCU ? "HBCU Non-conf" : "Non-conf");

  return {
    id: game.game_path_id || game.game_id,
    route: game.route ?? (game.has_game_page && game.game_path_id ? `/game/${game.game_path_id}` : null),
    status: isFinal ? "final" : "preview",
    statusLabel: game.status_label ?? (isFinal ? "Final" : "Preview"),
    tag,
    awayId,
    homeId,
    // Text only for sides that don't resolve locally — the payload always
    // names both sides (§3 field notes), so a non-covered opponent still reads.
    awayText: awayId && isHBCUTeam(awayId) ? null : (away.short_name ?? away.name ?? "Away"),
    homeText: homeId && isHBCUTeam(homeId) ? null : (home.short_name ?? home.name ?? "Home"),
    awayScore,
    homeScore,
    winnerTeamId: game.winner_team_id ?? null,
    dateLabel: game.date_label ?? "TBD",
    venue: venue.venue_label ?? venue.stadium ?? "Site TBD",
    bothHBCU,
    isOutsideOpponent: !bothHBCU,
    hasGamePage: game.has_game_page === true,
    gamePathId: game.game_path_id ?? null,
    rawGame: {
      game_id: game.game_id,
      game_path_id: game.game_path_id,
      has_game_page: game.has_game_page,
      date: game.date,
      date_label: game.date_label,
      kickoff: game.kickoff_label ?? null,
      tv: game.tv ?? null,
      stadium_name: venue.stadium ?? null,
      venue_label: venue.venue_label ?? null,
      venue_city: venue.city ?? null,
      neutral_site_name: venue.neutral_site_name ?? null,
      conference_game: !!game.conference_game,
      bowl_game: !!game.bowl_game,
      is_covered_matchup: bothHBCU,
      game_name: game.tag || null,
      away_record: away.record || null,
      home_record: home.record || null,
      away_conference_record: away.conference_record || null,
      home_conference_record: home.conference_record || null,
      sort_order: game.sort_order,
    },
  };
};

export const getGameWinner = (game) => {
  if (game?.status !== "final" || game.awayScore == null || game.homeScore == null) return null;
  const away = getSide(game.awayId, game.awayText);
  const home = getSide(game.homeId, game.homeText);
  if (game.winnerTeamId) return normalizeTeamKey(game.winnerTeamId) === away.id ? away : home;
  if (game.awayScore === game.homeScore) return null;
  return game.awayScore > game.homeScore ? away : home;
};

export const toGradientRow = (game) => {
  const away = getSide(game.awayId, game.awayText);
  const home = getSide(game.homeId, game.homeText);
  const raw = game.rawGame ?? {};

  return {
    id: game.id,
    away: {
      name: away.name,
      shortName: away.label,
      logo: away.logo,
      color: away.color,
      record: raw.away_record ?? "Record TBD",
    },
    home: {
      name: home.name,
      shortName: home.label,
      logo: home.logo,
      color: home.color,
      record: raw.home_record ?? "Record TBD",
    },
    awayScore: game.awayScore,
    homeScore: game.homeScore,
    status: game.status === "final" ? "Final" : "Preview",
    gameName: raw.game_name || game.tag || "Weekly Matchup",
    // `venue_label` is pre-shortened by the backend (§3); the frontend does
    // not truncate.
    displayVenue: raw.venue_label ?? raw.stadium_name ?? game.venue ?? "Site TBD",
  };
};

const getSelectedGameTeam = (game) => {
  if (!game || game.status !== "final") return null;
  if (game.isOutsideOpponent) {
    const away = getSide(game.awayId, game.awayText);
    const home = getSide(game.homeId, game.homeText);
    return isHBCUTeam(away.id) ? away : isHBCUTeam(home.id) ? home : null;
  }
  return getGameWinner(game);
};

export const getSelectedGameTheme = (game) => {
  const selectedTeam = getSelectedGameTeam(game);
  if (!selectedTeam) {
    return { surface: BRAND_PREVIEW_COLOR, border: "#FFFFFF", accent: "#FFFFFF" };
  }
  return {
    surface: selectedTeam.color ?? BRAND_PREVIEW_COLOR,
    border: selectedTeam.secondary ?? selectedTeam.accent ?? "#FFFFFF",
    accent: selectedTeam.accent ?? selectedTeam.secondary ?? "#FFFFFF",
  };
};

const EMPTY_MODEL = {
  weeks: [],
  weekEntries: [],
  selectedWeek: null,
  weekLabel: "",
  dateRange: null,
  isCurrentWeek: false,
  slate: [],
  totals: { all: 0, visible: 0, hbcu: 0, outside: 0 },
};

// `data` is one week-central payload. The slate filter (§4): the toggle off
// keeps only `is_covered_matchup: true`; on shows everything. Order is the
// backend's — `games[]` arrives pre-sorted, `sort_order` is the tiebreak.
export const buildWeekCentralModel = ({ data, includeNonConference }) => {
  if (!data) return EMPTY_MODEL;

  const weekEntries = Array.isArray(data.weeks) ? data.weeks : [];
  const games = Array.isArray(data.games) ? data.games : [];
  const visibleGames = includeNonConference ? games : games.filter((game) => game.is_covered_matchup === true);
  const slate = visibleGames
    .map(buildGameModel)
    .sort((a, b) => (a.rawGame.sort_order ?? 0) - (b.rawGame.sort_order ?? 0));

  return {
    weeks: weekEntries.map((entry) => Number(entry.week)),
    weekEntries,
    selectedWeek: Number(data.week),
    weekLabel: data.week_label ?? data.label ?? `Week ${data.week}`,
    dateRange: data.date_range ?? null,
    isCurrentWeek: data.is_current_week === true,
    slate,
    totals: {
      all: data.summary?.total_games ?? games.length,
      visible: slate.length,
      hbcu: data.summary?.hbcu_matchups ?? slate.filter((game) => game.bothHBCU).length,
      outside: data.summary?.outside_games ?? slate.filter((game) => game.isOutsideOpponent).length,
    },
  };
};
