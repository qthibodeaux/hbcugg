import { toLocalTeam, normalizeTeamId } from "./teamIdentity";

// Game-card and legacy schedule adapters; existing source precedence and result policies are preserved.

export const formatDateShort = (value) => {
  if (!value) return "TBD";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return String(value);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
