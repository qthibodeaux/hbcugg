// Penalty matrix — every foul, every team, one season.
//
// Real since 2026-10-04: stats/counting/penalties_{season}.json. The backend
// owns the foul vocabulary (merged spellings, phase, an "unknown" bucket for
// garbled codes) and every count; this only reshapes it for the grid, by side.

export const PENALTY_PHASES = [
  { id: "all", label: "Every foul" },
  { id: "pre", label: "Pre-snap" },
  { id: "live", label: "Live ball" },
  { id: "dead", label: "Dead ball" },
];

export const PENALTY_SIDES = [
  { id: "all", label: "All units" },
  { id: "offense", label: "Offense" },
  { id: "defense", label: "Defense" },
  { id: "special_teams", label: "Special teams" },
];

/**
 * counts[teamId][foulKey] for one side (or all), plus the totals the grid's
 * axes read, and the file's foul list in league order.
 */
export const penaltyMatrix = (file, teams, side = "all") => {
  const fouls = file?.fouls ?? [];
  const byId = Object.fromEntries((file?.teams ?? []).map((t) => [t.team_id, t]));
  const counts = {};
  const totals = {};
  const foulTotals = Object.fromEntries(fouls.map((f) => [f.key, 0]));
  teams.forEach((t) => {
    const row = byId[t.id];
    const src = side === "all" ? row?.counts : row?.by_side?.[side]?.counts;
    counts[t.id] = src ?? {};
    totals[t.id] = side === "all" ? row?.total_flags ?? 0 : row?.by_side?.[side]?.flags ?? 0;
    fouls.forEach((f) => { foulTotals[f.key] += counts[t.id][f.key] ?? 0; });
  });
  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);
  const foulsSeen = fouls.filter((f) => foulTotals[f.key] > 0).length;
  return { fouls, counts, totals, foulTotals, grandTotal, foulsSeen, notes: file?.notes ?? [] };
};
