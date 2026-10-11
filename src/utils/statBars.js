// One scale for the two-team stat bars (game page Team Stats, desktop + mobile,
// and the export's Offensive Breakdown). The bars give a team's number context
// against the league:
//
//   min  — 0, or the lower team's value when it is negative (then a zero mark)
//   max  — the league max for the stat (shared/league_avg_{season}.json), or the
//          row's fallback when the league file doesn't carry it; stretched if a
//          game beats it
//   tick — the league average
//
// Fills run from zero: a positive value outward, a negative one back toward the
// min (drawn red by the callers).

const nums = (...vals) => vals.filter((v) => typeof v === "number" && Number.isFinite(v));

export const barRange = (away, home, league, fallbackMax = null) => {
  const vals = nums(away, home);
  const lo = Math.min(0, ...vals);
  const leagueMax = typeof league?.max === "number" && league.max > 0 ? league.max : null;
  let hi = Math.max(leagueMax ?? fallbackMax ?? 0, 0, ...vals);
  if (hi <= lo) hi = lo + 1;
  return [lo, hi];
};

/** Where a value falls on a range, 0–100. */
export const barPct = (value, range) => {
  if (typeof value !== "number" || !range) return 0;
  const [lo, hi] = range;
  return Math.max(0, Math.min(100, ((value - lo) / (hi - lo || 1)) * 100));
};

/**
 * The filled part of a bar, as percentages from the bar's anchored end:
 * { from, width, zero }. The fill runs between zero and the value; `zero` is
 * where to draw the zero mark when the range goes negative, else null.
 */
export const barSegment = (value, range) => {
  const p = barPct(value, range);
  const crosses = !!range && range[0] < 0;
  const z = crosses ? barPct(0, range) : 0;
  return { from: Math.min(p, z), width: Math.abs(p - z), zero: crosses ? z : null };
};
