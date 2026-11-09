import teamsData from "../../../data/teams.json";
import { fetchJson, gameCenterPaths, toLegacyScheduleGame } from "../../../utils/gameCenterPayloads";

export const TEAM_BY_EXPORT = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId] = team;
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

const TEAM_GROUPS = [
  { id: "swac-west", label: "SWAC West", filter: (team) => team?.conference === "SWAC" && team?.division === "West" },
  { id: "swac-east", label: "SWAC East", filter: (team) => team?.conference === "SWAC" && team?.division === "East" },
  { id: "meac", label: "MEAC", filter: (team) => team?.conference === "MEAC" },
];

export const HUB_CONFIG = {
  week: {
    kicker: "League-Wide Telemetry",
    title: "Week Central",
    description: "This hub will become the live Saturday board: active matchups, upset alerts, slate segmentation, and fast paths into each game feed.",
    deliverables: ["Live scoreboard grid", "Critical alerts rail", "Best matchup spotlight"],
  },
  schedule: {
    kicker: "Conference Matrix",
    title: "Conference Slate",
    description: "This hub holds the league matchup matrix for conference games only, with MEAC, SWAC East, SWAC West, and full SWAC views.",
    deliverables: ["Conference toggles", "Away-at-home matrix", "Game result anchors"],
  },
  team: {
    kicker: "Team Campaign View",
    title: "Team Schedule",
    description: "This hub will track a single team's full campaign with completed recaps, upcoming previews, form, and strength-of-schedule context.",
    deliverables: ["Completed vs upcoming rails", "Team calendar mode", "Schedule strength blocks"],
  },
  standings: {
    kicker: "Conference Race",
    title: "Standings",
    description: "This hub will power SWAC East, SWAC West, and MEAC tables with division leaders, streaks, points for and against, and title race context.",
    deliverables: ["Division tabs", "Leader spotlight", "Streak and scoring metrics"],
  },
  rankings: {
    kicker: "Power Board",
    title: "Rankings",
    description: "This hub will publish the league power board with tiering, movers, elite-zone callouts, and the signature glory score ladder.",
    deliverables: ["Top team hero", "Tiered ranking table", "Mover and elite-zone cards"],
  },
};

export const getWeekFromStem = (stem) => {
  const match = String(stem ?? "").match(/^W(\d+)/i);
  return match ? Number(match[1]) : null;
};

export const formatDate = (dateLike) => {
  if (!dateLike) return "TBD";
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return String(dateLike);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const toDateSortValue = (dateLike) => {
  const date = new Date(dateLike ?? "");
  return Number.isNaN(date.getTime()) ? Number.MAX_SAFE_INTEGER : date.getTime();
};

const toDayGroupKey = (dateLike, dayName) => {
  const date = new Date(dateLike ?? "");
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }
  if (dayName) return String(dayName);
  return "TBD";
};

const computeStandings = (games) => {
  const standings = new Map();

  for (const game of games ?? []) {
    const teamId = game.team_id;
    if (!teamId) continue;

    if (!standings.has(teamId)) {
      standings.set(teamId, {
        teamId,
        wins: 0,
        losses: 0,
        confWins: 0,
        confLosses: 0,
        pf: 0,
        pa: 0,
      });
    }

    const row = standings.get(teamId);
    if (game.result === "W") row.wins += 1;
    if (game.result === "L") row.losses += 1;
    if (game.conf_game && game.result === "W") row.confWins += 1;
    if (game.conf_game && game.result === "L") row.confLosses += 1;

    row.pf += Number(game.score_team ?? 0);
    row.pa += Number(game.score_opp ?? 0);
  }

  return [...standings.values()]
    .map((row) => ({
      ...row,
      gamesPlayed: row.wins + row.losses,
      winPct: row.wins + row.losses > 0 ? row.wins / (row.wins + row.losses) : 0,
      confGames: row.confWins + row.confLosses,
      confPct: row.confWins + row.confLosses > 0 ? row.confWins / (row.confWins + row.confLosses) : 0,
      diff: row.pf - row.pa,
    }))
    .sort((a, b) => b.winPct - a.winPct || b.confPct - a.confPct || b.diff - a.diff || b.pf - a.pf);
};

export const buildGroupedBoards = (standingsRows) => {
  const standingsByTeamId = new Map((standingsRows ?? []).map((row) => [row.teamId, row]));

  return TEAM_GROUPS.map((group) => {
    const groupRows = teamsData.teams
      .filter(group.filter)
      .map((team) => {
        const standing = standingsByTeamId.get(team.exportId) ?? standingsByTeamId.get(team.exportId.replace(/25$/, ""));
        return (
          standing ?? {
            teamId: team.exportId,
            wins: 0,
            losses: 0,
            confWins: 0,
            confLosses: 0,
            pf: 0,
            pa: 0,
            gamesPlayed: 0,
            winPct: 0,
            confGames: 0,
            confPct: 0,
            diff: 0,
          }
        );
      })
      .sort((a, b) => b.winPct - a.winPct || b.confPct - a.confPct || b.diff - a.diff || b.pf - a.pf);

    return { id: group.id, label: group.label, rows: groupRows };
  });
};

export const buildWeekBuckets = (games) => {
  const buckets = new Map();

  for (const game of games ?? []) {
    const key = toDayGroupKey(game.date, game.day_of_week);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(game);
  }

  return [...buckets.entries()]
    .map(([label, bucketGames]) => ({
      label,
      games: bucketGames.sort((a, b) => toDateSortValue(a.date) - toDateSortValue(b.date)),
      sortValue: Math.min(...bucketGames.map((game) => toDateSortValue(game.date))),
    }))
    .sort((a, b) => a.sortValue - b.sortValue);
};

export const loadHubData = async ({ mode, season, teamId, week }) => {
  const seasonValue = Number(season ?? 2025);

  if (mode === "team" && teamId) {
    const payload = await fetchJson(gameCenterPaths.teamSchedules(seasonValue));
    const seasonGames = ((payload.teams ?? []).find((entry) => entry.team?.team_id === teamId)?.games ?? []).map(toLegacyScheduleGame);
    return { games: seasonGames, standings: computeStandings(seasonGames) };
  }

  if (mode === "standings" || mode === "rankings") {
    const payload = await fetchJson(gameCenterPaths.standingsRace(seasonValue));
    const standings = Object.values(payload.groups ?? {})
      .flatMap((group) => group.standings ?? group.rows ?? [])
      .filter((row) => TEAM_BY_EXPORT[row.team_id])
      .map((row) => ({
        teamId: row.team_id,
        wins: row.wins,
        losses: row.losses,
        confWins: row.conf_wins,
        confLosses: row.conf_losses,
        pf: 0,
        pa: 0,
        gamesPlayed: Number(row.wins ?? 0) + Number(row.losses ?? 0),
        winPct: row.win_pct ?? 0,
        confGames: Number(row.conf_wins ?? 0) + Number(row.conf_losses ?? 0),
        confPct: row.conf_win_pct ?? 0,
        diff: 0,
      }));
    return { games: [], standings };
  }

  if (mode === "schedule") {
    const payload = await fetchJson(gameCenterPaths.scheduleBoard(seasonValue));
    const games = (payload.weeks ?? []).flatMap((weekData) => (weekData.games ?? []).map(toLegacyScheduleGame));
    return { games, standings: computeStandings(games) };
  }

  // Per-week file on the new tree; this legacy page reads that week's games only.
  const payload = await fetchJson(gameCenterPaths.weekCentral(seasonValue, week));
  const games = (payload.games ?? []).map(toLegacyScheduleGame);
  return { games, standings: computeStandings(games) };
};
