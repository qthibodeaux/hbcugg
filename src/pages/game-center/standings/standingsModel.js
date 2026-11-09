import { SWAC_EAST, SWAC_WEST, TEAM_BY_ID, GROUP_DEFS, ACCENT } from "./standingsData";
import teamsData from "../../../data/teams.json";

// Existing legacy standings row, head-to-head ordering and group derivations.

const getGroupId = (team) => {
  if (!team) return null;
  const id = team.exportId.replace(/25$/, "");
  if (team.conference === "MEAC") return "meac";
  if (SWAC_EAST.has(id)) return "swac-east";
  if (SWAC_WEST.has(id)) return "swac-west";
  return null;
};

const gameKey = (game) => {
  const ids = [game.team_id, game.opponent_id].filter(Boolean).sort().join("-");
  return game.parsed_game_id ?? game.parsed_game_stem ?? `${game.date}-${ids}`;
};

export const buildBaseRows = (games) => {
  const map = new Map();

  teamsData.teams.forEach((team) => {
    const id = team.exportId.replace(/25$/, "");
    map.set(id, {
      id,
      w: 0,
      l: 0,
      cw: 0,
      cl: 0,
      pf: 0,
      pa: 0,
      hw: 0,
      hl: 0,
      form: [],
      confOpp: [],
    });
  });

  [...games]
    .filter((game) => game.result)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)) || Number(a.game_index ?? 0) - Number(b.game_index ?? 0))
    .forEach((game) => {
      const row = map.get(game.team_id);
      if (!row) return;

      const won = game.result === "W";
      if (won) row.w += 1;
      else row.l += 1;

      if (game.conf_game) {
        if (won) row.cw += 1;
        else row.cl += 1;
        if (game.opponent_id) row.confOpp.push({ opponentId: game.opponent_id, result: game.result, diff: Number(game.score_team ?? 0) - Number(game.score_opp ?? 0) });
      }

      if (game.home_away === "home") {
        if (won) row.hw += 1;
        else row.hl += 1;
      }

      row.pf += Number(game.score_team ?? 0);
      row.pa += Number(game.score_opp ?? 0);
      row.form.push(won ? "W" : "L");
    });

  return [...map.values()].map((row) => {
    const gp = row.w + row.l;
    const cgp = row.cw + row.cl;
    const last = row.form[row.form.length - 1];
    let streakCount = 0;
    for (let i = row.form.length - 1; i >= 0; i -= 1) {
      if (row.form[i] !== last) break;
      streakCount += 1;
    }

    return {
      ...row,
      gp,
      cgp,
      pct: gp ? row.w / gp : 0,
      cpct: cgp ? row.cw / cgp : 0,
      diff: row.pf - row.pa,
      last5: row.form.slice(-5).join("").padStart(5, "-"),
      streak: last ? `${last}${streakCount}` : "-",
    };
  });
};

const headToHeadCompare = (a, b) => {
  const aGames = a.confOpp.filter((game) => game.opponentId === b.id);
  const bGames = b.confOpp.filter((game) => game.opponentId === a.id);
  const aWins = aGames.filter((game) => game.result === "W").length + bGames.filter((game) => game.result === "L").length;
  const bWins = aGames.filter((game) => game.result === "L").length + bGames.filter((game) => game.result === "W").length;

  if (aWins !== bWins) return bWins - aWins;

  const aDiff = aGames.reduce((sum, game) => sum + game.diff, 0) - bGames.reduce((sum, game) => sum + game.diff, 0);
  if (aDiff !== 0) return aDiff > 0 ? -1 : 1;

  return 0;
};

export const standingsCompare = (a, b) =>
  b.cpct - a.cpct ||
  headToHeadCompare(a, b) ||
  b.pct - a.pct ||
  b.diff - a.diff ||
  TEAM_BY_ID[a.id]?.name?.localeCompare(TEAM_BY_ID[b.id]?.name ?? "") ||
  0;

export const groupRows = (rows, games) => {
  const groups = GROUP_DEFS.reduce((acc, def) => {
    acc[def.id] = { ...def, accent: ACCENT[def.id], rows: [], completedGames: 0, remainingGames: 0, scenarioCount: 1 };
    return acc;
  }, {});

  rows.forEach((row) => {
    const groupId = getGroupId(TEAM_BY_ID[row.id]);
    if (groupId) groups[groupId].rows.push(row);
  });

  Object.values(groups).forEach((group) => {
    group.rows.sort(standingsCompare);
  });

  const seenCompleted = new Set();
  const seenRemaining = new Set();
  games.forEach((game) => {
    if (!game.conf_game || !game.opponent_id) return;
    const team = TEAM_BY_ID[game.team_id];
    const groupId = getGroupId(team);
    const group = groups[groupId];
    if (!group) return;

    const key = gameKey(game);
    if (game.result) {
      if (!seenCompleted.has(`${groupId}-${key}`)) {
        group.completedGames += 1;
        seenCompleted.add(`${groupId}-${key}`);
      }
    } else if (!seenRemaining.has(`${groupId}-${key}`)) {
      group.remainingGames += 1;
      seenRemaining.add(`${groupId}-${key}`);
    }
  });

  Object.values(groups).forEach((group) => {
    group.scenarioCount = Math.max(1, 2 ** Math.min(group.remainingGames, 12));
    group.finishMatrix = buildCompletedFinishMatrix(group.rows);
  });

  return groups;
};

const buildCompletedFinishMatrix = (rows) =>
  rows.map((row, rowIndex) => ({
    teamId: row.id,
    values: rows.map((_, colIndex) => (colIndex === rowIndex ? 100 : 0)),
    counts: rows.map((_, colIndex) => (colIndex === rowIndex ? 1 : 0)),
  }));
