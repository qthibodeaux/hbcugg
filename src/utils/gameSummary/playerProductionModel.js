import { productionEntries } from "../gameHelpers";

// Extracted from GameSummaryTabV2; behavior and visual variants are preserved.

// ═══════════════════════════════════════════════════════════════════════════════
// FORMATTING HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
export const cleanName = (nameRaw) => {
  const str = String(nameRaw ?? "");
  if (str.includes(",")) {
    const [last, first] = str.split(",");
    return `${first?.trim()} ${last?.trim()}`;
  }
  return str;
};

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED PLAYER-STAT HELPERS — used by both Game Leaders and Notable Performers
// ═══════════════════════════════════════════════════════════════════════════════
/** Tackles, sacks and TFL arrive as halves (5.5) — show the half, drop a bare ".0". */
export const statNum = (n) => {
  const v = Number(n) || 0;
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
};

/** Havoc, defined once so the number reads the same in both cards.
 *  Field names match individual_stats exactly: `tfl`, `forced_fumbles`. */
export const havocOf = (s) =>
  (s.tfl || 0) + (s.sacks || 0) + (s.forced_fumbles || 0) + (s.passes_defended || 0) + (s.interceptions || 0);

// Which counting-stat lines a performer gets, and in what order, is driven by position —
// a QB leads with his passing line and picks up rushing as the secondary if he carried it.
// Positions come from production_scores and are already a small closed set:
// QB / RB / WR / TE / DL / LB / DB / DEF.
const STAT_CATEGORIES_BY_POSITION = {
  QB: ["passing", "rushing"],
  RB: ["rushing", "receiving"],
  WR: ["receiving", "rushing"],
  TE: ["receiving", "rushing"],
  DEF: ["defense"],
  DB: ["defense"],
  DL: ["defense"],
  LB: ["defense"],
  // Blocking is a backend ask, not a frontend derivation — see BACKEND_PIPELINE_TODO.md.
  // Nothing in any exported game carries an OL player or a blocking stat today, so these
  // read as empty and the card falls back to the mock performer set until the fields ship.
  OL: ["blocking"],
  C: ["blocking"],
  G: ["blocking"],
  T: ["blocking"],
};

const FALLBACK_STAT_CATEGORIES = ["passing", "rushing", "receiving", "defense"];

/**
 * Counting stats per category, as [label, value, keep] triples.
 * `keep` false drops a stat the player didn't register, so a QB who threw no picks
 * doesn't burn a slot on "0 INT" while a defender's fumble recovery still shows.
 * Every field here is present in individual_stats — verified non-zero somewhere across
 * all 145 exported games. There is no OL category and no blocking stat in any of them.
 */
const STAT_CHIP_BUILDERS = {
  passing: (s) => [
    ["C/ATT", `${s.completions ?? 0}/${s.attempts ?? 0}`, true],
    ["Pass Yds", s.yards ?? 0, true],
    ["Pass TD", s.touchdowns ?? 0, (s.touchdowns ?? 0) > 0],
    ["INT", s.interceptions ?? 0, (s.interceptions ?? 0) > 0],
  ],
  rushing: (s) => [
    ["Car", s.attempts ?? 0, true],
    ["Rush Yds", s.yards ?? 0, true],
    ["Rush TD", s.touchdowns ?? 0, (s.touchdowns ?? 0) > 0],
  ],
  receiving: (s) => [
    ["Rec", s.receptions ?? 0, true],
    ["Rec Yds", s.yards ?? 0, true],
    ["Rec TD", s.touchdowns ?? 0, (s.touchdowns ?? 0) > 0],
    ["Tgt", s.targets ?? 0, (s.targets ?? 0) > (s.receptions ?? 0)],
  ],
  blocking: (s) => [
    ["Snaps", s.snaps ?? 0, (s.snaps ?? 0) > 0],
    ["Pancakes", s.pancakes ?? 0, (s.pancakes ?? 0) > 0],
    ["Sacks All", s.sacks_allowed ?? 0, s.sacks_allowed != null],
    ["Press All", s.pressures_allowed ?? 0, s.pressures_allowed != null],
    ["Blown", s.blown_blocks ?? 0, s.blown_blocks != null],
  ],
  defense: (s) => [
    ["Tkl", statNum(s.tackles), true],
    ["Sacks", statNum(s.sacks), (s.sacks ?? 0) > 0],
    ["TFL", statNum(s.tfl), (s.tfl ?? 0) > 0],
    ["INT", s.interceptions ?? 0, (s.interceptions ?? 0) > 0],
    ["PBU", s.passes_defended ?? 0, (s.passes_defended ?? 0) > 0],
    ["FF", s.forced_fumbles ?? 0, (s.forced_fumbles ?? 0) > 0],
    ["FR", s.fumble_recoveries ?? 0, (s.fumble_recoveries ?? 0) > 0],
    ["QBH", s.qb_hurries ?? 0, (s.qb_hurries ?? 0) > 0],
    // `havoc` is on the backend ask list as a first-class field; until it ships this
    // reuses the one shared definition rather than the card inventing a second one.
    ["Havoc", statNum(s.havoc ?? havocOf(s)), (s.havoc ?? havocOf(s)) > 0],
  ],
};

const MAX_STAT_CHIPS = 6;

/**
 * The player's stat block: their position's primary category first, then the secondary
 * one if they had volume there — a QB's rushing line, a back's receiving line, and for
 * a defender the base tackle numbers followed by whatever havoc he actually generated.
 */
export const buildStatChips = (playerKey, position, teamId, teamEntries) => {
  if (!playerKey) return [];
  const cats = (teamEntries || []).find(([id]) => id === teamId)?.[1] || {};
  const order = STAT_CATEGORIES_BY_POSITION[String(position ?? "").toUpperCase()] ?? FALLBACK_STAT_CATEGORIES;
  const chips = [];
  order.forEach((cat) => {
    const row = (cats[cat] || []).find((r) => r.player_key === playerKey);
    if (!row) return;
    (STAT_CHIP_BUILDERS[cat]?.(row) || []).forEach(([label, value, keep]) => {
      if (keep && chips.length < MAX_STAT_CHIPS) chips.push({ label, value });
    });
  });
  return chips;
};

// Unwrapping the 2026 object was not enough on its own: that export also renames the
// fields inside each row (`name` → `name_raw`, `production_total` → `production_score.
// total`), so rows came back shaped but empty — every performer sorted on `undefined`
// and rendered without a name. `productionEntries` does the wrapper AND the renames.
export const normalizeProductionRows = (teamScores) => productionEntries(teamScores);
