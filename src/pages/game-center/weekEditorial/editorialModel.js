import { GAME_CENTER_DEFAULT_SEASON } from "../../../components/molecules/game/SeasonSelector";
import teamsData from "../../../data/teams.json";

export const DEFAULT_SEASON = GAME_CENTER_DEFAULT_SEASON;

export const SEASONS = [2026, 2025, 2024, 2023, 2022, 2021, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010];

const BRAND_PREVIEW_COLOR = "#E53E3E";

const SPECIAL_GAMES_BY_SEASON = {
  2025: [
    {
      season: 2025,
      team_id: "meacscsu",
      game_index: 16,
      date: "2025-12-13",
      day_of_week: "Saturday",
      week: 16,
      opponent_name: "Prairie View A&M",
      opponent_id: "swacpvamu",
      in_corpus: true,
      home_away: "away",
      site: "Atlanta, Georgia",
      stadium: "Mercedes-Benz Stadium",
      conf_game: false,
      bowl_game: true,
      game_name: "Celebration Bowl",
      result: null,
      score_team: null,
      score_opp: null,
      has_pdf: true,
      has_parsed_game: true,
      parsed_game_stem: "W16scsupvamu",
      parsed_game_id: "SCSUPVAMU13122025",
      parsed_game_path: "92-frontend/1-game center/games/2025/W16scsupvamu.json",
    },
  ],
};

const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  const id = team.exportId.replace(/25$/, "");
  acc[id] = team;
  acc[team.exportId] = team;
  return acc;
}, {});

const teamLabel = (team) => team?.bannerShort ?? team?.shortName ?? "TBD";

const teamLogo = (team) => team?.logo ?? (team?.exportId ? `/assets/${team.exportId.replace(/25$/, "")}.svg` : null);

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

const getLaborDay = (season) => {
  const date = new Date(season, 8, 1);
  while (date.getDay() !== 1) date.setDate(date.getDate() + 1);
  return date;
};

const getCalendarWeek = (dateValue, season) => {
  if (!dateValue) return null;
  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  const boundary = getLaborDay(season);
  boundary.setDate(boundary.getDate() - 2);
  const diffDays = Math.floor((date - boundary) / 86400000);
  return diffDays < 0 ? 0 : Math.floor(diffDays / 7) + 1;
};

export const getGameWeek = (game) => {
  if (game?.week != null) return Number(game.week);
  return getWeekFromStem(game?.parsed_game_stem) ?? getCalendarWeek(game?.date, game?.season);
};

export const getWeekLabel = (week, games = []) => {
  if (week === 16) return "Celebration Bowl";
  if (week === 15) return "SWAC Championship";

  const names = games.map((game) => String(game.game_name ?? "").toLowerCase()).join(" ");
  const hasCelebration = names.includes("celebration") || games.some((game) => game.bowl_game && getGameWeek(game) === week);
  const hasChampionship = names.includes("championship") || (week >= 15 && games.some((game) => game.conf_game && game.bowl_game));

  if (hasCelebration) return "Celebration Bowl";
  if (hasChampionship) return "SWAC Championship";
  return week === 0 ? "Week 0" : `Week ${week}`;
};

export const getCompactWeekLabel = (week, games = []) => {
  if (week === 16) return "CB";
  if (week === 15) return "SCG";
  const label = getWeekLabel(week, games);
  return label.replace("Week ", "W");
};

const fmtDate = (value) => {
  if (!value) return "TBD";
  const dt = new Date(`${value}T12:00:00`);
  if (Number.isNaN(dt.getTime())) return String(value);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const SHORT_VENUE_BY_NAME = {
  "A.W. Mumford Stadium": "A.W. Mumford",
  "Bragg Memorial Stadium": "Bragg Memorial",
  "Daytona Stadium": "Daytona Stadium",
  "Eddie Robinson Stadium": "Eddie Robinson",
  "Hughes Stadium": "Hughes Stadium",
  "Louis Crews Stadium": "Louis Crews",
  "Mercedes-Benz Stadium": "Mercedes-Benz",
  "Oliver C. Dawson Stadium/Willie Jeffries Field": "Oliver C. Dawson",
  "Rice-Totten Stadium": "Rice-Totten",
  "Shell Energy Stadium": "Shell Energy",
  "Simmons Bank Field": "Simmons Bank",
  "Spinks-Casem Stadium": "Spinks-Casem",
  "Veterans Memorial Stadium": "Veterans Memorial",
  "William H. Greene Stadium": "Greene Stadium",
  "William 'Spong' Stadium": "Spong Stadium",
};

const shortenVenue = (game) => {
  const stadium = String(game?.rawGame?.stadium ?? "").trim();
  const site = String(game?.rawGame?.site ?? "").trim();
  const mapped = SHORT_VENUE_BY_NAME[stadium];
  const value = mapped || (stadium.length <= 22 ? stadium : site) || game?.venue || "Site TBD";
  return value.length > 22 ? `${value.slice(0, 19).trim()}...` : value;
};

const dedupeGames = (games) => {
  const seen = new Map();
  for (const game of games) {
    const stem = game.parsed_game_stem;
    const key = stem || `${[normalizeTeamKey(game.team_id), normalizeTeamKey(game.opponent_id) || game.opponent_name].sort().join("-")}-${game.date}`;
    if (!seen.has(key)) seen.set(key, game);
  }
  return [...seen.values()];
};

const toScalarTeamId = (value) => normalizeTeamKey(value?.team_id ?? value?.id ?? value);

export const getSeasonGames = (data, season) => {
  if (Array.isArray(data?.weeks)) {
    return dedupeGames(data.weeks.flatMap((week) => (
      (week.games ?? []).map((game) => ({
        ...game,
        season,
        week: game.week ?? week.week,
        week_label: game.week_label ?? week.label,
        parsed_game_stem: game.parsed_game_stem ?? game.game_path_id,
        parsed_game_id: game.parsed_game_id ?? game.game_id,
        conf_game: game.conf_game ?? game.conference_game,
        bowl_game: game.bowl_game,
        stadium: game.stadium ?? game.stadium_name,
        site: game.site ?? game.venue_city,
      }))
    )));
  }

  return dedupeGames([...(data?.games ?? []), ...(SPECIAL_GAMES_BY_SEASON[season] ?? [])]);
};

const getSide = (id, text) => {
  const team = TEAM_BY_ID[normalizeTeamKey(id)] ?? TEAM_BY_ID[id];
  return {
    id: normalizeTeamKey(id),
    label: team ? teamLabel(team) : text ?? "TBD",
    name: team?.name ?? text ?? "TBD",
    logo: teamLogo(team),
    color: team?.colors?.primary ?? "#27272A",
    secondary: team?.colors?.secondary ?? "#FFFFFF",
    accent: team?.colors?.accent ?? team?.colors?.secondary ?? "#FFFFFF",
  };
};

export const isHBCUTeam = (id) => !!(TEAM_BY_ID[normalizeTeamKey(id)] ?? TEAM_BY_ID[id]);

export const buildLabGame = (rawGame, weekLabel) => {
  if (rawGame.home_team_id != null || rawGame.away_team_id != null || rawGame.home_score != null || rawGame.away_score != null) {
    const homeId = toScalarTeamId(rawGame.home_team_id);
    const awayId = toScalarTeamId(rawGame.away_team_id);
    const homeScore = rawGame.home_score != null ? Number(rawGame.home_score) : null;
    const awayScore = rawGame.away_score != null ? Number(rawGame.away_score) : null;
    const bothHBCU = isHBCUTeam(homeId) && isHBCUTeam(awayId);
    const isOutsideOpponent = !bothHBCU;
    const isFinal = rawGame.status === "final" && homeScore != null && awayScore != null;
    const stage = rawGame.bowl_game && rawGame.story_label
      ? rawGame.story_label
      : rawGame.bowl_game
        ? "Bowl Game"
        : rawGame.conf_game
          ? "Conference"
          : bothHBCU
            ? "HBCU Non-conf"
            : "Non-conf";
    const gameId = rawGame.parsed_game_stem || rawGame.game_path_id || rawGame.game_id || `${awayId || "away"}-${homeId || "home"}-${rawGame.date}`;

    return {
      id: gameId,
      route: rawGame.route ?? (rawGame.parsed_game_stem ? `/game/${rawGame.parsed_game_stem}` : null),
      status: isFinal ? "final" : "preview",
      tag: stage,
      angle: isOutsideOpponent ? "Schedule note" : isFinal ? "Review file" : "Preview board",
      awayId,
      homeId,
      awayText: !isHBCUTeam(awayId) ? rawGame.away_name ?? rawGame.away_team_name ?? "Away" : null,
      homeText: !isHBCUTeam(homeId) ? rawGame.home_name ?? rawGame.home_team_name ?? "Home" : null,
      awayScore,
      homeScore,
      dateLabel: fmtDate(rawGame.date),
      venue: rawGame.stadium_name ?? rawGame.venue ?? rawGame.venue_city ?? rawGame.story_label ?? "Site TBD",
      note: isOutsideOpponent
        ? "This matchup is part of the season schedule wall, but it does not have an HBCU GridIron Glory recap or preview package yet."
        : isFinal
          ? `${weekLabel} has a completed HBCU matchup with a parsed game file ready for deeper review.`
          : `${weekLabel} preview slot for an HBCU-vs-HBCU matchup on the weekly board.`,
      rawGame,
      bothHBCU,
      isOutsideOpponent,
    };
  }

  const teamId = normalizeTeamKey(rawGame.team_id);
  const opponentId = normalizeTeamKey(rawGame.opponent_id);
  const teamIsHome = rawGame.home_away === "home";
  const homeId = teamIsHome ? teamId : opponentId || null;
  const awayId = teamIsHome ? opponentId || null : teamId;
  const homeText = teamIsHome ? null : rawGame.opponent_name;
  const awayText = teamIsHome ? rawGame.opponent_name : null;
  const hasScore = rawGame.score_team != null && rawGame.score_opp != null;
  const homeScore = hasScore ? Number(teamIsHome ? rawGame.score_team : rawGame.score_opp) : null;
  const awayScore = hasScore ? Number(teamIsHome ? rawGame.score_opp : rawGame.score_team) : null;
  const bothHBCU = isHBCUTeam(teamId) && isHBCUTeam(opponentId);
  const isOutsideOpponent = !bothHBCU;
  const isFinal = !!rawGame.result && hasScore;
  const stage = rawGame.bowl_game && rawGame.game_name ? rawGame.game_name : rawGame.conf_game ? "Conference" : bothHBCU ? "HBCU Non-conf" : "Non-conf";
  const gameId = rawGame.parsed_game_stem || `${teamId}-${opponentId || rawGame.opponent_name}-${rawGame.date}`;

  return {
    id: gameId,
    route: rawGame.parsed_game_stem ? `/game/${rawGame.parsed_game_stem}` : null,
    status: isFinal ? "final" : "preview",
    tag: stage,
    angle: isOutsideOpponent ? "Schedule note" : isFinal ? "Review file" : "Preview board",
    awayId,
    homeId,
    awayText,
    homeText,
    awayScore,
    homeScore,
    dateLabel: fmtDate(rawGame.date),
    venue: rawGame.stadium ?? rawGame.site ?? rawGame.game_name ?? "Site TBD",
    note: isOutsideOpponent
      ? "This matchup is part of the season schedule wall, but it does not have an HBCU GridIron Glory recap or preview package yet."
      : isFinal
        ? `${weekLabel} has a completed HBCU matchup with a parsed game file ready for deeper review.`
        : `${weekLabel} preview slot for an HBCU-vs-HBCU matchup on the weekly board.`,
    rawGame,
    bothHBCU,
    isOutsideOpponent,
  };
};

const getGameWinner = (game) => {
  if (game.status !== "final" || game.awayScore == null || game.homeScore == null) return null;
  const away = getSide(game.awayId, game.awayText);
  const home = getSide(game.homeId, game.homeText);

  if (game.awayScore === game.homeScore) return null;
  return game.awayScore > game.homeScore ? away : home;
};

export const toGradientRow = (game) => {
  const away = getSide(game.awayId, game.awayText);
  const home = getSide(game.homeId, game.homeText);
  const raw = game.rawGame ?? {};
  const context = raw.game_name || game.tag || "Weekly Matchup";

  return {
    id: game.id,
    away: {
      name: away.name,
      shortName: away.label,
      logo: away.logo,
      color: away.color,
      record: raw.away_conference_record ?? raw.away_conf_record ?? raw.away_record ?? raw.team_record ?? "Record TBD",
    },
    home: {
      name: home.name,
      shortName: home.label,
      logo: home.logo,
      color: home.color,
      record: raw.home_conference_record ?? raw.home_conf_record ?? raw.home_record ?? raw.opponent_record ?? "Record TBD",
    },
    awayScore: game.awayScore,
    homeScore: game.homeScore,
    status: game.status === "final" ? "Final" : "Preview",
    gameName: context,
    displayVenue: shortenVenue(game),
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
    return {
      surface: BRAND_PREVIEW_COLOR,
      border: "#FFFFFF",
      accent: "#FFFFFF",
    };
  }

  return {
    surface: selectedTeam.color ?? BRAND_PREVIEW_COLOR,
    border: selectedTeam.secondary ?? selectedTeam.accent ?? "#FFFFFF",
    accent: selectedTeam.accent ?? selectedTeam.secondary ?? "#FFFFFF",
  };
};
