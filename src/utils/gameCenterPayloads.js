import teamsData from "../data/teams.json";

// ─── Export bases ────────────────────────────────────────────────────────────
// FE_DOCS_BASE is the backend's weekly drop (manifest at `93-FE Docs/manifest.json`,
// refreshed 2026-09-14). It is the single source for game-center, players/,
// schools/ and shared/ — every hook reads from here. One legacy endpoint
// remains below as a cold transport fallback.
export const FE_DOCS_BASE = "/data/93-FE Docs";

// Legacy tree. Delete once the teamSchedules fallback is removed.
export const GAME_CENTER_EXPORT_BASE = "/data/1-game center/current_exports";
export const GAME_CENTER_RAW_BASE = "/data/1-game center";

export const gameCenterPaths = {
  // ── Migrated to the new tree — shape verified identical or purely additive ──
  hub: (season) => `${FE_DOCS_BASE}/game-center/hub/game_center_hub_${season}.json`,
  gamesHub: (season) => `${FE_DOCS_BASE}/game-center/games-hub/games_hub_${season}.json`,
  // Both drop a `teams` block the consumers never read (ConferenceSlateMatrix
  // uses bundled teams.json; useSeasonScheduleData reads only `weeks`).
  scheduleBoard: (season) => `${FE_DOCS_BASE}/game-center/season-schedule/schedule_board_${season}.json`,
  conferenceSlate: (season) => `${FE_DOCS_BASE}/game-center/conference-slate/conference_slate_${season}.json`,
  standingsRace: (season) => `${FE_DOCS_BASE}/game-center/standings/standings_race_${season}.json`,
  gamesIndex: () => `${FE_DOCS_BASE}/game-center/games/index.json`,
  gameFile: (season, gamePathId) => `${FE_DOCS_BASE}/game-center/games/${season}/${gamePathId}.json`,
  // The scoped per-team files the Team Schedules doc §3 was waiting on now
  // exist, so the scoped path is live. The wide fallback below is now cold.
  teamSchedule: (season, teamId) => `${FE_DOCS_BASE}/game-center/team-schedules/${season}/${teamId}.json`,

  // One file per week (Week Central Design Doc §3).
  weekCentral: (season, week) => `${FE_DOCS_BASE}/game-center/week-central/${season}/${week}.json`,

  // ── Still on the legacy tree ──
  // Wide fallback: all 18 teams. No equivalent in the new tree — it exists only
  // as the transport fallback in useTeamScheduleData, now that scoped files ship.
  teamSchedules: (season) => `${GAME_CENTER_EXPORT_BASE}/team_schedules/team_schedules_${season}.json`,
};

export const normalizeName = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/#/g, "")
    .replace(/&/g, " and ")
    .replace(/university|college|state\.?/g, " ")
    .replace(/[^a-z0-9]/g, "")
    .trim();

export const TEAM_BY_EXPORT = teamsData.teams.reduce((acc, team) => {
  const enriched = {
    ...team,
    primary: team?.colors?.primary,
    secondary: team?.colors?.secondary,
  };
  acc[team.exportId] = enriched;
  acc[team.exportId.replace(/25$/, "")] = enriched;
  return acc;
}, {});

// Name → team. An alias two schools share (mascots like "Tigers") is dropped
// so it resolves to nothing rather than to whichever team came last.
const nameAliases = (team) => [team.name, team.shortName, team.mascot, `${team.name} ${team.mascot}`].map(normalizeName).filter(Boolean);
const SHARED_NAME_ALIASES = (() => {
  const seen = {};
  teamsData.teams.forEach((team) => new Set(nameAliases(team)).forEach((a) => { seen[a] = (seen[a] ?? 0) + 1; }));
  return new Set(Object.keys(seen).filter((a) => seen[a] > 1));
})();

export const TEAM_BY_NAME = teamsData.teams.reduce((acc, team) => {
  const enriched = {
    ...team,
    primary: team?.colors?.primary,
    secondary: team?.colors?.secondary,
  };
  nameAliases(team)
    .filter((alias) => !SHARED_NAME_ALIASES.has(alias))
    .forEach((alias) => {
      acc[alias] = enriched;
    });
  return acc;
}, {});

export const getWeekFromStem = (stem) => {
  const match = String(stem ?? "").match(/^W(\d+)/i);
  return match ? Number(match[1]) : null;
};

export const getStageLabelFromWeek = (week) => {
  if (week === 15) return "Celebration Bowl";
  if (week === 14) return "SWAC Championship Game";
  if (Number.isFinite(week) && week > 0) return `Week ${week}`;
  return "Week --";
};

export const getTeamTicker = (team) =>
  String(team?.shortName ?? team?.name ?? "TEAM")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4) || "TEAM";

export const fetchJson = async (path) => {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
};

const localTeamById = teamsData.teams.reduce((acc, team) => {
  const v5 = team.exportId.replace(/25$/, "");
  acc[v5] = team;
  acc[team.exportId] = team;
  return acc;
}, {});

export const normalizeTeamId = (value) =>
  String(value?.team_id ?? value?.id ?? value ?? "").replace(/25$/, "");

export const toLocalTeam = (teamLike, fallbackLabel = "TEAM") => {
  const id = normalizeTeamId(teamLike);
  const local = localTeamById[id];
  const colors = teamLike?.colors ?? local?.colors ?? {};
  const label = local?.bannerShort ?? local?.shortName ?? teamLike?.short_name ?? teamLike?.abbreviation ?? fallbackLabel;

  return {
    ...(local ?? {}),
    teamId: id || null,
    id: local?.id ?? id,
    exportId: local?.exportId ?? (id ? `${id}25` : undefined),
    name: local?.name ?? teamLike?.name ?? label,
    shortName: local?.shortName ?? teamLike?.short_name ?? teamLike?.abbreviation ?? label,
    bannerShort: local?.bannerShort,
    label,
    primary: colors.primary ?? local?.colors?.primary ?? "#27272A",
    secondary: colors.secondary ?? local?.colors?.secondary ?? "#A1A1AA",
    colors: {
      primary: colors.primary ?? local?.colors?.primary ?? "#27272A",
      secondary: colors.secondary ?? local?.colors?.secondary ?? "#A1A1AA",
      accent: colors.tertiary ?? local?.colors?.accent,
    },
    logo: local?.logo ?? (id ? `/assets/${id}.svg` : null),
  };
};

export const teamScoreObjectToTeam = (value, fallbackLabel = "TEAM") => ({
  ...toLocalTeam(value, fallbackLabel),
  score: Number(value?.score ?? 0),
});

export const getScoreFromExportTeam = (value, fallback = null) => {
  if (Number.isFinite(Number(value?.score))) return Number(value.score);
  return fallback;
};

export const formatDateShort = (value) => {
  if (!value) return "TBD";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return String(value);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Accepts both hub payload shapes. Legacy: flat `home_team_id` / `home_score`.
// 2026-08-30 tree: a nested `home_team: { team_id, name, short_name, score,
// record }`. toLocalTeam already resolves either an id string or an object.
// Team label by layout density (useLayoutDensity): standard shows the school's
// display name ("Prairie View", "Delaware State"); compact shows the ticker
// ("PVAMU", "DSU"). Non-covered opponents have only the name the payload sent,
// so they read the same in both. Never both at once.
export const getTeamLabelForDensity = (team, { compact = false } = {}) => {
  if (!team) return "TEAM";
  if (compact) return team.bannerShort ?? team.shortName ?? team.name ?? "TEAM";
  return team.displayName ?? team.name ?? team.shortName ?? "TEAM";
};

export const toFeaturedGameCard = (game, index = 0) => {
  const home = toLocalTeam(game.home_team ?? game.home_team_id ?? "HOME");
  const away = toLocalTeam(game.away_team ?? game.away_team_id ?? "AWAY");
  const homeScore = game.home_score ?? game.home_team?.score ?? 0;
  const awayScore = game.away_score ?? game.away_team?.score ?? 0;

  return {
    id: game.game_id ?? game.id ?? `game-${index}`,
    status: game.status ?? "preview",
    confGame: !!game.conference_game,
    stageLabel: game.stage_label ?? (game.week != null ? `Week ${game.week}` : "Season"),
    gamePathId: game.game_path_id ?? null,
    away: { ...away, score: awayScore, record: game.away_team?.record ?? null },
    home: { ...home, score: homeScore, record: game.home_team?.record ?? null },
    awayScore,
    homeScore,
    // Backend-authored copy, passed through untouched (Hub doc §4).
    whyReasons: Array.isArray(game.why_reasons) ? game.why_reasons : [],
    kickoffLabel: game.kickoff_label ?? null,
    supportingLine: game.mvp
      ? `MVP: ${game.mvp}`
      : game.supporting_line ?? game.story_label ?? "Game Detail",
    dateLabel: game.date_label ?? formatDateShort(game.date),
  };
};

export const toRailGameCard = (game, index = 0) => {
  const home = toLocalTeam(game.home_team ?? game.home_team_id ?? "HOME");
  const away = toLocalTeam(game.away_team ?? game.away_team_id ?? "AWAY");

  return {
    id: game.game_id ?? game.id ?? `rail-${index}`,
    gameId: game.game_path_id ?? game.game_id ?? null,
    home,
    away,
    homeScore: game.home_score ?? game.home_team?.score ?? 0,
    awayScore: game.away_score ?? game.away_team?.score ?? 0,
    // Left undefined for out-of-conference games, which carry no quarter
    // breakdown — the rail drops its quarter columns for those rows rather
    // than printing placeholder dashes.
    homeByQ: game.home_by_q ?? game.home_team?.by_quarter,
    awayByQ: game.away_by_q ?? game.away_team?.by_quarter,
    stageLabel: game.stage_label ?? (game.week != null ? `Week ${game.week}` : "Season"),
    dateLabel: game.date_label ?? formatDateShort(game.date),
    summary: game.summary ?? game.story_label ?? "Late Game Update",
  };
};

export const isFinalGame = (game) => game?.status === "final" || !!game?.result;

// team_schedule_{season}/{team_id}.json (per BACKEND_RESPONSE_SPEC.md §2)
// already speaks team-perspective — opponent_id/opponent_name/score_team/
// score_opponent directly, no team/opponent objects to resolve. Running one
// of these through the legacy guessing logic below clobbers real values:
// score_team/opponent_id come back undefined (the legacy branch looks for
// home_score/home_team_id, which this shape doesn't have), and every result
// flips to "T" since undefined > undefined is false both ways.
// The §11 cell also carries an `opponent` object alongside opponent_id /
// score_team, so the check is on the perspective fields alone — `!game.team`
// is what separates it from the legacy home/away-object shape.
const isTeamPerspectiveGame = (game) =>
  !game.team && typeof game.score_team !== "undefined" && typeof game.opponent_id !== "undefined";

const venueString = (venue) => {
  if (!venue) return null;
  if (typeof venue === "string") return venue;
  return venue.stadium_name ?? venue.venue_label ?? null;
};

export const toLegacyScheduleGame = (game) => {
  if (isTeamPerspectiveGame(game)) {
    return {
      ...game,
      parsed_game_stem: game.game_path_id,
      parsed_game_id: game.game_path_id,
      has_parsed_game: game.has_game_page === true || !!game.game_path_id,
      // Classification comes from the backend's scope fields, never the tag text.
      conf_game: game.conference_scope === "conference" || game.is_conference_championship === true,
      bowl_game: game.is_celebration_bowl === true,
      score_opp: game.score_opponent ?? game.opponent_score ?? null,
      stadium: venueString(game.venue),
      venue_city: game.venue?.city ?? null,
      neutral_site_name: game.venue?.neutral_site_name ?? null,
    };
  }

  const hasTeamPerspective = !!game.team || !!game.opponent;
  const team = game.team ?? game.home_team ?? game.home_team_id ?? null;
  const opponent = game.opponent ?? game.away_team ?? game.away_team_id ?? null;
  const teamId = normalizeTeamId(team);
  const opponentId = normalizeTeamId(opponent);
  const isFinal = isFinalGame(game);
  const teamScore = hasTeamPerspective
    ? game.team_score
    : (game.home_score ?? game.home_team_id?.score);
  const opponentScore = hasTeamPerspective
    ? game.opponent_score
    : (game.away_score ?? game.away_team_id?.score);
  const result = !isFinal
    ? null
    : Number(teamScore ?? 0) > Number(opponentScore ?? 0)
      ? "W"
      : Number(teamScore ?? 0) < Number(opponentScore ?? 0)
        ? "L"
        : "T";

  return {
    ...game,
    parsed_game_stem: game.game_path_id,
    parsed_game_id: game.game_path_id,
    team_id: teamId,
    opponent_id: opponentId || null,
    opponent_name: opponent?.short_name ?? opponent?.abbreviation ?? opponent?.name,
    home_away: game.home_away ?? "home",
    conf_game: game.game_type?.includes("conference") || game.conference_game,
    bowl_game: game.game_type?.includes("bowl") || game.bowl_game,
    result,
    score_team: teamScore,
    score_opp: opponentScore,
    stadium: venueString(game.venue),
    venue_city: typeof game.venue === "object" ? game.venue?.city ?? null : null,
  };
};
