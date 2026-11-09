import { productionEntries } from "./gameHelpers";
import { PRODUCTION_NEGATIVE, gameProductionBounds } from "./productionBars";

// Extracted from ProductionPrimitives; existing behavior is preserved.

/**
 * Production scores by player name — the total plus its component breakdown.
 * `production_scores` keys players by PERS_ id while the box score keys them by
 * name, so name is the only join available (99% match on 2025).
 */
export const productionIndex = (productionRows) => {
  const map = new Map();
  productionEntries(productionRows).forEach((r) => {
    const entry = { total: r.production_total, components: r.components ?? {} };
    if (r.name != null) map.set(r.name, entry);
    // 2026 rows carry the PERS_ id on both sides, so the exact join is available too.
    if (r.player_key != null) map.set(r.player_key, entry);
  });
  return map;
};

/** The production entry for a roster row — by id when the row has one, else by name. */
export const productionOf = (index, row) => (row?.key != null ? index.get(row.key) : null) ?? index.get(row?.name) ?? null;

export const PAR_NEGATIVE = PRODUCTION_NEGATIVE;

// The game-wide range lives in utils/productionBars.js so the export posters
// read production on the exact same scale. Kept under its old name here.
export const gameParBounds = gameProductionBounds;

/** Roster tables read top-down by production, so PAR is the sort key — the unit's component when given. */
export const sortByPar = (rows, index, componentKey = null) => {
  const score = (r) => {
    const entry = productionOf(index, r);
    if (componentKey) return typeof entry?.components?.[componentKey] === "number" ? entry.components[componentKey] : -1e9;
    return entry?.total ?? -1e9;
  };
  return [...rows].sort((a, b) => score(b) - score(a));
};
