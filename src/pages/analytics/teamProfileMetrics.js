// Team Profile metrics — the advanced-efficiency rows and the three spatial
// maps (pass grid, rush lanes, havoc zones) the profile is built on.
//
// Real since 2026-10-04 — the backend's advanced and spatial files
// (stats/team-analytics/advanced_{season}.json, spatial_{season}.json). The
// adapters below only reshape them for the profile's tables and maps; a value
// the backend does not send stays null and renders as a dash.

const val = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);

// ── Advanced efficiency ──────────────────────────────────────────────────────
// `defGood` says which direction is good in the DEFENSE column: "low" for
// production allowed, "high" for disruption created.
export const PROFILE_ADVANCED = [
  { key: "explosiveness", label: "Explosiveness", unit: "num2", defGood: "low" },
  { key: "points_per_opp", label: "Points / Opportunity", unit: "num2", defGood: "low" },
  { key: "scoring_opps", label: "Scoring Opportunities", unit: "int", defGood: "low" },
  { key: "std_down_success", label: "Standard-Down Success", unit: "pct", defGood: "low" },
  { key: "pass_down_success", label: "Passing-Down Success", unit: "pct", defGood: "low" },
  { key: "line_yards", label: "Line Yards / Rush", unit: "num2", defGood: "low" },
  { key: "second_level", label: "Second-Level Yards", unit: "num2", defGood: "low" },
  { key: "open_field", label: "Open-Field Yards", unit: "num2", defGood: "low" },
  { key: "power_success", label: "Power Success", unit: "pct", defGood: "low" },
  { key: "havoc_front7", label: "Front-Seven Havoc", unit: "pct", defGood: "high" },
  { key: "havoc_db", label: "Defensive-Back Havoc", unit: "pct", defGood: "high" },
  { key: "avg_start", label: "Average Start", unit: "fp", defGood: "low" },
];

// PROFILE_ADVANCED key → the backend's ADVANCED key.
const ADVANCED_KEY = {
  explosiveness: "explosiveness",
  points_per_opp: "points_per_opportunity",
  scoring_opps: "scoring_opportunities",
  std_down_success: "standard_down_success",
  pass_down_success: "passing_down_success",
  line_yards: "line_yards",
  second_level: "second_level_yards",
  open_field: "open_field_yards",
  power_success: "power_success",
  havoc_front7: "havoc_front_seven",
  havoc_db: "havoc_defensive_back",
  avg_start: "average_start",
};

/** { o_<key>, d_<key> } values and ranks off a team-season's `advanced` block. */
export const profileAdvancedFrom = (advanced) => {
  const values = {};
  const ranks = {};
  PROFILE_ADVANCED.forEach((row) => {
    const k = ADVANCED_KEY[row.key];
    values[`o_${row.key}`] = val(advanced?.offense?.[k]);
    values[`d_${row.key}`] = val(advanced?.defense?.[k]);
    ranks[`o_${row.key}`] = advanced?.ranks?.offense?.[k] ?? null;
    ranks[`d_${row.key}`] = advanced?.ranks?.defense?.[k] ?? null;
  });
  return { values, ranks };
};

export const PASS_DEPTHS = [
  { key: "deep", label: "Deep", range: "> 12" },
  { key: "medium", label: "Med", range: "4-12" },
  { key: "short", label: "Short", range: "< 4" },
];
export const PASS_DIRECTIONS = [
  { key: "left", label: "L" },
  { key: "middle", label: "M" },
  { key: "right", label: "R" },
];

const cellOf = (side, depth, direction) => (side?.pass_grid ?? []).find((c) => c.depth === depth && c.direction === direction) ?? null;

/** grid[depth][direction] = { att, comp, yards, epa, success, td, int } — null cells when the block didn't ship. */
export const passGridFrom = (side) => {
  if (!side?.pass_grid?.length) return null;
  const grid = {};
  PASS_DEPTHS.forEach((d) => {
    grid[d.key] = {};
    PASS_DIRECTIONS.forEach((dir) => {
      const c = cellOf(side, d.key, dir.key);
      grid[d.key][dir.key] = c
        ? { att: c.attempts ?? 0, comp: c.completions ?? 0, yards: c.yards ?? 0, epa: val(c.epa), success: val(c.success_rate), td: c.touchdowns ?? null, int: c.interceptions ?? null }
        : { att: 0, comp: 0, yards: 0, epa: null, success: null, td: null, int: null };
    });
  });
  return grid;
};

/**
 * grid[depth][direction] = the cell's players, as the backend ranked them
 * (top 3 by targets). On defense these are the defenders who made a play on a
 * pass to that cell. `toFace` shapes each into the map's face row.
 */
export const passTargetsFrom = (side, toFace) => {
  const out = {};
  PASS_DEPTHS.forEach((d) => {
    out[d.key] = {};
    PASS_DIRECTIONS.forEach((dir) => {
      out[d.key][dir.key] = (cellOf(side, d.key, dir.key)?.players ?? []).map((p) => ({ ...toFace(p), targets: p.targets ?? null }));
    });
  });
  return out;
};

// ── Rushing lanes — 1 x 3 ────────────────────────────────────────────────────
export const RUSH_LANES = [
  { key: "left", label: "Left" },
  { key: "middle", label: "Middle" },
  { key: "right", label: "Right" },
];
/** [{ key, label, att, yards, ypc, stuff, success, epa, td, … }] — null when the block didn't ship. */
export const rushLanesFrom = (side) => {
  if (!side?.rush_lanes?.length) return null;
  return RUSH_LANES.map((lane) => {
    const l = side.rush_lanes.find((x) => x.direction === lane.key);
    return {
      ...lane,
      att: l?.attempts ?? 0,
      yards: l?.yards ?? 0,
      ypc: val(l?.yards_per_carry) ?? 0,
      stuff: val(l?.stuff_rate),
      success: val(l?.success_rate),
      epa: val(l?.epa),
      td: l?.touchdowns ?? null,
      // Not in the lane rollup — the breakdown bars dash.
      lostYards: null,
      lineYards: null,
      highlightYards: null,
    };
  });
};

// ── Havoc, spatially ─────────────────────────────────────────────────────────
// Where the defense actually made plays behind the line, and how deep.
// `depth` is yards relative to the line of scrimmage (negative = behind it).
export const HAVOC_TYPES = [
  { key: "tfl", label: "TFL", color: "#F6AD55", depth: -3, spread: 3 },
  { key: "sacks", label: "Sack", color: "#A855F7", depth: -6.5, spread: 3.5 },
  { key: "hurries", label: "Hurry", color: "#63B3ED", depth: -2, spread: 2 },
  { key: "ff", label: "FF", color: "#F56565", depth: -1, spread: 3 },
  { key: "pd", label: "PD", color: "#48BB78", depth: 9, spread: 7 },
];
export const HAVOC_ZONES = ["left", "middle", "right"];

/** zones[zone] = { tfl, sacks, hurries, ff, pd } off the defense side's havoc block. */
export const havocZonesFrom = (defense) => {
  if (!defense?.havoc?.length) return null;
  const zones = {};
  HAVOC_ZONES.forEach((z) => {
    const h = defense.havoc.find((x) => x.zone === z) ?? {};
    zones[z] = { tfl: h.tfl ?? 0, sacks: h.sacks ?? 0, hurries: h.hurries ?? 0, ff: h.forced_fumbles ?? 0, pd: h.passes_defended ?? 0 };
  });
  return zones;
};

// ── Formatting ──────────────────────────────────────────────────────────────
export const fmtProfile = (v, unit) => {
  if (!Number.isFinite(v)) return "—";
  if (unit === "fp") return `Own ${Math.round(v)}`;
  if (unit === "pct") return `${(v * 100).toFixed(1)}%`;
  if (unit === "int") return Math.round(v).toString();
  if (unit === "num1") return v.toFixed(1);
  return v.toFixed(2);
};
