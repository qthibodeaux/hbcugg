import { productionEntries } from "./gameHelpers";

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTION BARS — the one scale for every production bar, on the game page and
// on the export posters. Both import from here; neither keeps its own math. A
// change to how production bars read is made here and lands in both places.
// (Stat bars — team stats, offense poster — are the same idea: utils/statBars.js.)
//
// The rule: one range for the whole game. Every player on both teams, every
// unit (passing, receiving, rushing, defense) feeds one [min, max]; min is 0
// unless someone is negative. So the game's best production fills the track and
// everything else reads against it, on every table, on both teams.
// ─────────────────────────────────────────────────────────────────────────────

export const PRODUCTION_NEGATIVE = "#C0453A";

// What each production column prints, and its header.
export const PRODUCTION_UNITS = {
  passing: { keys: ["passing_production"], label: "Passing Prod" },
  receiving: { keys: ["receiving_production"], label: "Receiving Prod" },
  rushing: { keys: ["rushing_production"], label: "Rushing Prod" },
  defense: { keys: ["hit_production", "hawk_production", "scrum_production"], label: "Defensive Prod" },
};

/** { min, max } across every player and every unit in the game (`production_scores` keyed by team id). */
export const gameProductionBounds = (productionScores) => {
  let min = 0;
  let max = 0;
  Object.values(productionScores ?? {}).forEach((teamRows) =>
    productionEntries(teamRows).forEach((r) => {
      const c = r.components ?? {};
      Object.values(PRODUCTION_UNITS).forEach(({ keys }) => {
        const vals = keys.map((k) => c[k]).filter((v) => typeof v === "number");
        const pos = vals.reduce((sum, v) => sum + Math.max(0, v), 0);
        const neg = vals.reduce((sum, v) => sum + Math.min(0, v), 0);
        if (pos > max) max = pos;
        if (neg < min) min = neg;
      });
    }),
  );
  return { min, max };
};

/** The drawing scale for a { min, max }: span, where zero sits (0–100%), and whether to draw the zero mark. */
export const productionScale = ({ min = 0, max = 0 } = {}) => {
  const span = Math.max(max - min, 0.001);
  return { span, zeroPct: ((0 - min) / span) * 100, hasNegative: min < 0 };
};

/** One value's bar on a scale: { leftPct, widthPct, negative } — negatives grow left from zero. */
export const productionFill = (value, scale) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const widthPct = Math.min(100, (Math.abs(value) / scale.span) * 100);
  return value < 0
    ? { leftPct: scale.zeroPct - widthPct, widthPct, negative: true }
    : { leftPct: scale.zeroPct, widthPct, negative: false };
};
