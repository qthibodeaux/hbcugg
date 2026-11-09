import teamsData from "../../../../data/teams.json";

export const BRAND_PREVIEW_COLOR = "#E53E3E";

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

export const buildGameModel = (game) => {
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
