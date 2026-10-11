import teamsData from "../data/teams.json";
import { toLocalTeam } from "./gameCenterPayloads";
import { previewPath } from "./gamePreview";

const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  acc[team.id] = team;
  acc[team.exportId] = team;
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

// Name → team. An alias two schools share (mascots like "Tigers") is dropped
// so it resolves to nothing rather than to whichever team came last.
const nameAliases = (team) => [team.name, team.shortName, team.mascot, team.id].filter(Boolean).map((a) => String(a).toLowerCase());
const SHARED_NAME_ALIASES = (() => {
  const seen = {};
  teamsData.teams.forEach((team) => new Set(nameAliases(team)).forEach((a) => { seen[a] = (seen[a] ?? 0) + 1; }));
  return new Set(Object.keys(seen).filter((a) => seen[a] > 1));
})();

const TEAM_BY_NAME = teamsData.teams.reduce((acc, team) => {
  nameAliases(team)
    .filter((alias) => !SHARED_NAME_ALIASES.has(alias))
    .forEach((alias) => {
      acc[alias] = team;
    });
  return acc;
}, {});

export const normalizeTeamKey = (value) => String(value ?? "").replace(/25$/, "").trim();

const dedupeGames = (games) => {
  const seen = new Map();
  for (const game of games) {
    const stem = game.game_path_id ?? game.parsed_game_stem ?? game.game_id;
    if (stem && !seen.has(stem)) {
      seen.set(stem, game);
    } else if (!stem) {
      const teamKey = game.home_team_id ?? game.team?.team_id ?? game.team_id ?? "";
      const oppKey = game.away_team_id ?? game.opponent?.team_id ?? game.opponent_id ?? "";
      const key = `${[teamKey, oppKey].sort().join("-")}-${game.date ?? "tbd"}`;
      if (!seen.has(key)) seen.set(key, game);
    }
  }
  return [...seen.values()];
};

const fmtDate = (value) => {
  if (!value) return "TBD";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return String(value);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const fmtTime = (value) => {
  if (!value) return "TBA";
  return String(value).trim();
};

const resolveConference = (teamLike) => {
  const teamId = normalizeTeamKey(teamLike?.team_id ?? teamLike?.id ?? teamLike?.exportId ?? teamLike?.value);
  const team = TEAM_BY_ID[teamId] ?? TEAM_BY_NAME[String(teamLike?.name ?? teamLike?.short_name ?? teamLike?.abbreviation ?? "").toLowerCase()];
  return team?.conference ?? teamLike?.conference ?? null;
};

const getNumericValue = (value, fallback = null) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const buildResolvedGame = (game) => {
  const homeTeamRaw = game.home_team ?? game.team ?? {};
  const awayTeamRaw = game.away_team ?? game.opponent ?? {};

  const homeTeam = toLocalTeam(homeTeamRaw, game.home_team?.name ?? game.team?.name ?? "HOME");
  const awayTeam = toLocalTeam(awayTeamRaw, game.away_team?.name ?? game.opponent?.name ?? "AWAY");

  const homeId = normalizeTeamKey(homeTeam?.teamId ?? homeTeam?.id ?? game.home_team_id ?? game.team?.team_id ?? game.team_id ?? "");
  const awayId = normalizeTeamKey(awayTeam?.teamId ?? awayTeam?.id ?? game.away_team_id ?? game.opponent?.team_id ?? game.opponent_id ?? "");

  const homeScore = getNumericValue(game.home_score, game.home_away === "home" ? getNumericValue(game.team_score, null) : getNumericValue(game.opponent_score, null));
  const awayScore = getNumericValue(game.away_score, game.home_away === "away" ? getNumericValue(game.team_score, null) : getNumericValue(game.opponent_score, null));
  const isFinal = game.status === "final" || game.result || (game.status === "completed") || (homeScore != null && awayScore != null && game.status !== "scheduled");

  return {
    id: game.game_id ?? game.game_path_id ?? `${game.date ?? "game"}-${homeId ?? "home"}-${awayId ?? "away"}`,
    gamePathId: game.game_path_id ?? game.parsed_game_stem ?? null,
    // A played game opens its game page. An unplayed game between two of the 18
    // opens the preview page instead (/game/preview/:gameId, keyed on the
    // schedule's "date_away_at_home" id). Unplayed games against outside
    // opponents get no link until their own preview page exists (post launch.0).
    route: game.route
      ?? (game.game_path_id ? `/game/${game.game_path_id}` : null)
      ?? (!isFinal && game.date && homeId && awayId && TEAM_BY_ID[homeId] && TEAM_BY_ID[awayId]
        ? previewPath(`${game.date}_${awayId}_at_${homeId}`)
        : null),
    week: getGameWeek(game),
    date: game.date ?? null,
    dateLabel: fmtDate(game.date),
    kickoffTime: fmtTime(game.kickoff_time ?? game.kickoff ?? game.game_time),
    venue: game.venue ?? game.stadium_name ?? game.venue_city ?? "TBD",
    // The game's own name — "Bayou Classic", "Homecoming", "Turkey Day Classic".
    // No export carries one: checked all 188 rows of games_hub_2025, and the only
    // thing that ever occupied this line was the narrative layer (`story_label`),
    // which is gone. `neutral_site_name` is a place, not an event. Wired as a
    // field read so the row fills in on its own when the backend ships it; blank
    // until then rather than faked out of the flags. See
    // STATS_HUB_CARD_INVENTORY.md.
    eventName: game.event?.name ?? game.event_name ?? null,
    status: String(game.status ?? (isFinal ? "final" : "scheduled")).toLowerCase(),
    isFinal,
    homeTeam: {
      ...homeTeam,
      teamId: homeId || null,
      conference: resolveConference(homeTeamRaw) ?? resolveConference(game.home_team_id),
    },
    awayTeam: {
      ...awayTeam,
      teamId: awayId || null,
      conference: resolveConference(awayTeamRaw) ?? resolveConference(game.away_team_id),
    },
    homeScore: homeScore ?? null,
    awayScore: awayScore ?? null,
    winnerTeamId: game.winner_team_id ?? (homeScore != null && awayScore != null ? (homeScore > awayScore ? homeId : awayScore > homeScore ? awayId : null) : null),
    winnerLabel: game.winner_team_id ? (homeId === game.winner_team_id ? homeTeam.shortName : awayTeam.shortName) : (homeScore != null && awayScore != null ? (homeScore > awayScore ? homeTeam.shortName : awayScore > homeScore ? awayTeam.shortName : "Tie") : null),
    margin: homeScore != null && awayScore != null ? Math.abs(homeScore - awayScore) : null,
    conference: resolveConference(homeTeamRaw) ?? resolveConference(awayTeamRaw) ?? "all",
  };
};

// The Games Hub contract row (Games Hub Fetch Contract.md): one row per game,
// sides as played, and the backend's `route` as the only link. Nothing here
// builds a link, dedupes or classifies.
const buildContractGame = (g) => {
  const homeId = normalizeTeamKey(g.home?.team_id ?? "");
  const awayId = normalizeTeamKey(g.away?.team_id ?? "");
  const home = toLocalTeam(g.home ?? {}, g.home?.short_name ?? "HOME");
  const away = toLocalTeam(g.away ?? {}, g.away?.short_name ?? "AWAY");
  const homeScore = getNumericValue(g.home?.score, null);
  const awayScore = getNumericValue(g.away?.score, null);
  const isFinal = g.status === "final";
  const winnerLabel = g.winner_team_id ? (g.winner_team_id === homeId ? home.shortName : away.shortName) : null;
  return {
    id: g.game_id,
    scheduleGameId: g.schedule_game_id ?? null,
    gamePathId: g.game_path_id ?? null,
    route: g.route ?? null,
    week: Number.isFinite(Number(g.week)) ? Number(g.week) : null,
    date: g.date ?? null,
    dateLabel: g.date_label ?? fmtDate(g.date),
    kickoffTime: g.kickoff_label ?? "TBA",
    venue: g.venue?.venue_label ?? "TBA",
    eventName: g.event?.name ?? null,
    status: String(g.status ?? "scheduled"),
    isFinal,
    homeTeam: { ...home, teamId: homeId || null, conference: resolveConference(g.home) },
    awayTeam: { ...away, teamId: awayId || null, conference: resolveConference(g.away) },
    homeScore,
    awayScore,
    winnerTeamId: g.winner_team_id ?? null,
    winnerLabel,
    margin: homeScore != null && awayScore != null ? Math.abs(homeScore - awayScore) : null,
    conference: resolveConference(g.home) ?? resolveConference(g.away) ?? "all",
  };
};

const isContractRow = (g) => g && g.schedule_game_id != null && g.home && g.away;

export const getGameWeek = (game) => {
  if (game?.week != null && game.week !== "" && game.week !== "null") return Number(game.week);
  const stem = String(game?.parsed_game_stem ?? game?.game_path_id ?? "");
  const match = stem.match(/^W(\d+)/i);
  return match ? Number(match[1]) : null;
};

export const getMatchup = (game) => {
  if (!game) return null;
  const home = game.homeTeam ?? game.home ?? {};
  const away = game.awayTeam ?? game.away ?? {};
  return {
    game,
    isFinal: Boolean(game.isFinal),
    dateLabel: game.dateLabel,
    away: { ...away, label: away.shortName ?? away.name ?? "AWAY" },
    home: { ...home, label: home.shortName ?? home.name ?? "HOME" },
    awayScore: game.awayScore,
    homeScore: game.homeScore,
    winner: game.winnerLabel,
    margin: game.margin,
    linkTo: game.route,
  };
};

export const buildGamesHubModel = ({
  seasonData,
  weekFilter = "all",
  teamFilter = "",
  conferenceFilter = "all",
  statusFilter = "all",
}) => {
  // `games[]` (the contract) when the file ships it; the older `story_cards`
  // shape only for seasons published before the 2026-10-04 contract.
  const rawGames = seasonData?.games ?? seasonData?.story_cards ?? [];
  const contract = rawGames.length > 0 && isContractRow(rawGames[0]);
  const allGames = (contract ? rawGames.map(buildContractGame) : dedupeGames(rawGames).map(buildResolvedGame))
    .filter(Boolean)
    .filter((game) => {
      const matchesWeek = weekFilter === "all" || String(getGameWeek(game) ?? "") === String(weekFilter);
      const selectedTeamKey = normalizeTeamKey(teamFilter);
      const matchesTeam =
        !selectedTeamKey ||
        normalizeTeamKey(game.homeTeam?.teamId) === selectedTeamKey ||
        normalizeTeamKey(game.awayTeam?.teamId) === selectedTeamKey;
      const matchesConference =
        conferenceFilter === "all" ||
        game.homeTeam?.conference === conferenceFilter ||
        game.awayTeam?.conference === conferenceFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "played" && game.isFinal) ||
        (statusFilter === "upcoming" && !game.isFinal);
      return matchesWeek && matchesTeam && matchesConference && matchesStatus;
    })
    .sort((a, b) => {
      const dateDiff = new Date(a.date ?? "2100-01-01") - new Date(b.date ?? "2100-01-01");
      if (dateDiff !== 0) return dateDiff;
      return (getGameWeek(a) ?? 99) - (getGameWeek(b) ?? 99);
    });

  const groupedWeeks = Array.from(
    allGames.reduce((acc, game) => {
      const week = Number.isFinite(getGameWeek(game)) ? getGameWeek(game) : 0;
      if (!acc.has(week)) acc.set(week, []);
      acc.get(week).push(game);
      return acc;
    }, new Map()).entries(),
  )
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([week, games]) => ({
      week,
      label: `Week ${week}`,
      games,
    }));

  const availableWeeks = [...new Set(allGames.map((game) => getGameWeek(game)).filter((value) => Number.isFinite(value)))].sort((a, b) => a - b);

  return {
    filteredGames: allGames,
    groupedWeeks,
    availableWeeks,
    totalGames: allGames.length,
    completedGames: allGames.filter((game) => game.isFinal).length,
    upcomingGames: allGames.filter((game) => !game.isFinal).length,
  };
};
