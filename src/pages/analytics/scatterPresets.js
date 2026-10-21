// Scatter axes and presets — the ready-made charts the Scatter tab opens with
// and the tile rotates through. One list, read by both, so a tile you clicked
// opens the chart you were looking at.
//
// A preset is nothing but a pair of axis keys: picking one sets the two axis
// selectors, and changing a selector from there just leaves no preset lit.
//
// Real since 2026-10-04: the chart axes read the backend's advanced block
// (`row.advanced`, attached by useTeamAnalyticsHub); the lever axes read the
// hub's rate metrics. `teamAxes` is the single read point.

const val = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const diff = (a, b) => (val(a) != null && val(b) != null ? a - b : null);

export const teamAxes = (row) => {
  const O = row?.advanced?.offense ?? {};
  const D = row?.advanced?.defense ?? {};
  return {
    net_epa_play: diff(O.epa_per_play, D.epa_per_play),
    net_success: diff(O.success_rate, D.success_rate),
    havoc_allowed: val(O.havoc_rate),
    havoc_forced: val(D.havoc_rate),
    epa_dropback: val(O.epa_per_pass),
    epa_rush: val(O.epa_per_rush),
    ppo_off: val(O.points_per_opportunity),
    ppo_def: val(D.points_per_opportunity),
    d_epa_dropback: val(D.epa_per_pass),
    d_pass_sr: val(D.success_rate_pass),
    // Garbage time out — the EPA chart's two sides.
    o_epa_play: val(O.competitive_epa_per_play ?? O.epa_per_play),
    d_epa_play: val(D.competitive_epa_per_play ?? D.epa_per_play),
    // Penalty yards per game by side: the advanced block once §11 ships, the
    // counting penalties file's by_side until then (same numbers by contract).
    o_pen_ypg: val(O.penalty_yards_per_game ?? row?.penalties?.offense?.yards_per_game),
    d_pen_ypg: val(D.penalty_yards_per_game ?? row?.penalties?.defense?.yards_per_game),
    // Pending backend (Team Analytics Fetch Contract §11) — null until it ships.
    net_sr_h1: diff(O.success_rate_first_half, D.success_rate_first_half),
    net_sr_h2: diff(O.success_rate_second_half, D.success_rate_second_half),
    // Rushing section — all shipped (stuff rate / power success first; the
    // 1st & 10, QB-share and run-by-half fields with the 10-18 drop).
    stuff_rate: val(O.stuff_rate),
    power_success: val(O.power_success),
    f10_rush_sr: val(O.f10_rush_success_rate),
    f10_run_rate: val(O.f10_run_rate),
    qb_share_carries: val(O.qb_share_of_carries),
    qb_share_rush_yds: val(O.qb_share_of_rush_yards),
    rush_sr_h1: val(O.rush_success_first_half),
    rush_sr_h2: val(O.rush_success_second_half),
  };
};

// unit: "num" (2dp) · "pct" (xx.x%) · "int" (whole). `low` marks an axis
// where less is better.
export const SCATTER_AXES = {
  net_epa_play: { key: "net_epa_play", label: "Net EPA / Play", unit: "num", team: true },
  net_success: { key: "net_success", label: "Net Success Rate", unit: "pct", team: true },
  havoc_allowed: { key: "havoc_allowed", label: "Havoc Allowed", unit: "pct", low: true, team: true },
  havoc_forced: { key: "havoc_forced", label: "Havoc Forced", unit: "pct", team: true },
  epa_dropback: { key: "epa_dropback", label: "EPA / Dropback", unit: "num", team: true },
  epa_rush: { key: "epa_rush", label: "EPA / Rush", unit: "num", team: true },
  ppo_off: { key: "ppo_off", label: "Points / Opportunity", unit: "num", team: true },
  ppo_def: { key: "ppo_def", label: "Points / Opp Allowed", unit: "num", low: true, team: true },
  d_epa_dropback: { key: "d_epa_dropback", label: "EPA / Dropback Allowed", unit: "num", low: true, team: true },
  d_pass_sr: { key: "d_pass_sr", label: "Pass Success Allowed", unit: "pct", low: true, team: true },
  o_epa_play: { key: "o_epa_play", label: "Offensive EPA / Play", unit: "num", team: true },
  d_epa_play: { key: "d_epa_play", label: "EPA / Play Allowed", unit: "num", low: true, team: true },
  o_pen_ypg: { key: "o_pen_ypg", label: "Offensive Penalty Yds / Game", unit: "num1", low: true, team: true },
  d_pen_ypg: { key: "d_pen_ypg", label: "Defensive Penalty Yds / Game", unit: "num1", low: true, team: true },
  net_sr_h1: { key: "net_sr_h1", label: "First-Half Net Success", unit: "pts", team: true },
  net_sr_h2: { key: "net_sr_h2", label: "Second-Half Net Success", unit: "pts", team: true },
  stuff_rate: { key: "stuff_rate", label: "Stuff Rate", unit: "pct", low: true, team: true },
  power_success: { key: "power_success", label: "Power Success", unit: "pct", team: true },
  f10_rush_sr: { key: "f10_rush_sr", label: "Run Success on 1st & 10", unit: "pct", team: true },
  f10_run_rate: { key: "f10_run_rate", label: "Run Rate on 1st & 10", unit: "pct", team: true },
  qb_share_carries: { key: "qb_share_carries", label: "QB Share of Carries", unit: "pct", team: true },
  qb_share_rush_yds: { key: "qb_share_rush_yds", label: "QB Share of Rush Yards", unit: "pct", team: true },
  rush_sr_h1: { key: "rush_sr_h1", label: "1st-Half Run Success", unit: "pct", team: true },
  rush_sr_h2: { key: "rush_sr_h2", label: "2nd-Half Run Success", unit: "pct", team: true },
};

// ── The full catalog: every measure in the advanced block, three ways ────────
// Each field the backend ships per side (`advanced_{season}.json` offense /
// defense) is an axis three times over: the offense's number, the defense's
// (what it allowed — or, for havoc and penalties, what it did), and the net
// (offense minus defense) where "more" means the same thing on both sides.
// Keys read `adv:o:<field>`, `adv:d:<field>`, `adv:net:<field>`.
//   fam  passing · rushing · other     dir  up = more is better for an offense
//   own  the defense's number is its own act (havoc it created, its own flags),
//        so its direction does not flip
const ADV_FIELDS = [
  // Passing
  { f: "epa_per_pass", label: "EPA / Dropback", unit: "num", fam: "passing", dir: "up" },
  { f: "success_rate_pass", label: "Pass Success %", unit: "pct", fam: "passing", dir: "up" },
  { f: "explosive_rate_pass", label: "Pass Explosive %", unit: "pct", fam: "passing", dir: "up" },
  { f: "sack_rate", label: "Sack Rate", unit: "pct", fam: "passing", dir: "down" },
  { f: "dropbacks", label: "Dropbacks", unit: "num1", fam: "passing", dir: "none" },
  // Rushing
  { f: "epa_per_rush", label: "EPA / Rush", unit: "num", fam: "rushing", dir: "up" },
  { f: "success_rate_rush", label: "Rush Success %", unit: "pct", fam: "rushing", dir: "up" },
  { f: "explosive_rate_rush", label: "Rush Explosive %", unit: "pct", fam: "rushing", dir: "up" },
  { f: "opportunity_rate", label: "Opportunity Rate", unit: "pct", fam: "rushing", dir: "up" },
  { f: "stuff_rate", label: "Stuffed %", unit: "pct", fam: "rushing", dir: "down" },
  { f: "power_success", label: "Power Success %", unit: "pct", fam: "rushing", dir: "up" },
  { f: "power_attempts", label: "Power Attempts", unit: "num1", fam: "rushing", dir: "none" },
  { f: "line_yards", label: "Line Yards", unit: "num", fam: "rushing", dir: "up" },
  { f: "second_level_yards", label: "Second-Level Yards", unit: "num", fam: "rushing", dir: "up" },
  { f: "open_field_yards", label: "Open-Field Yards", unit: "num", fam: "rushing", dir: "up" },
  { f: "highlight_yards", label: "Highlight Yards", unit: "num", fam: "rushing", dir: "up" },
  { f: "carries", label: "Carries", unit: "num1", fam: "rushing", dir: "none" },
  { f: "f10_run_rate", label: "Run Rate on 1st & 10", unit: "pct", fam: "rushing", dir: "none" },
  { f: "f10_rush_success_rate", label: "Run Success on 1st & 10", unit: "pct", fam: "rushing", dir: "up" },
  { f: "rush_success_first_half", label: "1st-Half Run Success", unit: "pct", fam: "rushing", dir: "up" },
  { f: "rush_success_second_half", label: "2nd-Half Run Success", unit: "pct", fam: "rushing", dir: "up" },
  { f: "qb_share_of_carries", label: "QB Share of Carries", unit: "pct", fam: "rushing", dir: "none", offOnly: true },
  { f: "qb_share_of_rush_yards", label: "QB Share of Rush Yards", unit: "pct", fam: "rushing", dir: "none", offOnly: true },
  // Other
  { f: "epa_per_play", label: "EPA / Play", unit: "num", fam: "other", dir: "up" },
  { f: "adj_epa_per_play", label: "Adj EPA / Play", unit: "num", fam: "other", dir: "up" },
  { f: "competitive_epa_per_play", label: "EPA / Play (No Garbage)", unit: "num", fam: "other", dir: "up" },
  { f: "early_down_epa", label: "Early-Down EPA", unit: "num", fam: "other", dir: "up" },
  { f: "epa_per_drive", label: "EPA / Drive", unit: "num", fam: "other", dir: "up" },
  { f: "total_epa", label: "Total EPA", unit: "num1", fam: "other", dir: "up" },
  { f: "explosiveness", label: "Explosiveness", unit: "num", fam: "other", dir: "up" },
  { f: "success_rate", label: "Success %", unit: "pct", fam: "other", dir: "up" },
  { f: "standard_down_success", label: "Standard-Down Success %", unit: "pct", fam: "other", dir: "up" },
  { f: "passing_down_success", label: "Passing-Down Success %", unit: "pct", fam: "other", dir: "up" },
  { f: "third_fourth_success", label: "3rd/4th-Down Success %", unit: "pct", fam: "other", dir: "up" },
  { f: "third_down_distance", label: "Avg 3rd-Down Distance", unit: "num1", fam: "other", dir: "down" },
  { f: "third_short_share", label: "3rd-and-Short Share (1-3 yds)", unit: "pct", fam: "other", dir: "up" },
  { f: "third_short_conversion", label: "3rd-and-Short Conversion", unit: "pct", fam: "other", dir: "up" },
  { f: "third_long_share", label: "3rd-and-Long Share (7+ yds)", unit: "pct", fam: "other", dir: "down" },
  { f: "third_long_conversion", label: "3rd-and-Long Conversion", unit: "pct", fam: "other", dir: "up" },
  { f: "third_down_attempts", label: "3rd-Down Attempts", unit: "int", fam: "other", dir: "none" },
  { f: "fourth_down_go_rate", label: "4th-Down Go Rate", unit: "pct", fam: "other", dir: "none", offOnly: true },
  { f: "fourth_down_conversion", label: "4th-Down Conversion", unit: "pct", fam: "other", dir: "up" },
  { f: "fourth_down_attempts", label: "4th-Down Attempts", unit: "int", fam: "other", dir: "none" },
  { f: "plays_20_plus", label: "20+ Yard Plays", unit: "int", fam: "other", dir: "up" },
  { f: "plays_25_plus", label: "25+ Yard Plays", unit: "int", fam: "other", dir: "up" },
  { f: "plays_40_plus", label: "40+ Yard Plays", unit: "int", fam: "other", dir: "up" },
  { f: "success_rate_first_half", label: "1st-Half Success %", unit: "pct", fam: "other", dir: "up" },
  { f: "success_rate_second_half", label: "2nd-Half Success %", unit: "pct", fam: "other", dir: "up" },
  { f: "explosive_rate", label: "Explosive %", unit: "pct", fam: "other", dir: "up" },
  { f: "points_per_opportunity", label: "Points / Opportunity", unit: "num", fam: "other", dir: "up" },
  { f: "red_zone_td_rate", label: "Red-Zone TD %", unit: "pct", fam: "other", dir: "up" },
  { f: "scoring_opportunities", label: "Scoring Opportunities", unit: "num1", fam: "other", dir: "up" },
  { f: "available_yards_pct", label: "Available Yards %", unit: "pct", fam: "other", dir: "up" },
  { f: "average_start", label: "Avg Starting Field Position", unit: "num1", fam: "other", dir: "up" },
  { f: "net_field_position", label: "Net Field Position", unit: "num1", fam: "other", dir: "up" },
  { f: "havoc_rate", label: "Havoc %", unit: "pct", fam: "other", dir: "down", own: true },
  { f: "havoc_front_seven", label: "Front-Seven Havoc %", unit: "pct", fam: "other", dir: "down", own: true },
  { f: "havoc_defensive_back", label: "DB Havoc %", unit: "pct", fam: "other", dir: "down", own: true },
  { f: "turnover_luck", label: "Turnover Luck", unit: "num", fam: "other", dir: "up" },
  { f: "penalties_per_game", label: "Penalties / Game", unit: "num1", fam: "other", dir: "down", own: true, noNet: true },
  { f: "penalty_yards_per_game", label: "Penalty Yds / Game", unit: "num1", fam: "other", dir: "down", own: true, noNet: true },
  { f: "plays", label: "Plays", unit: "num1", fam: "other", dir: "none" },
  { f: "drives", label: "Drives", unit: "num1", fam: "other", dir: "none" },
];
const ADV_BY_FIELD = Object.fromEntries(ADV_FIELDS.map((d) => [d.f, d]));
const SIDE_LABEL = { o: "Off", d: "Def", net: "Net" };
const FAM_LABEL = { passing: "Passing", rushing: "Rushing", other: "Other" };

// Net only where both sides mean the same thing and "more" is better.
const hasNet = (d) => d.dir === "up" && !d.own && !d.noNet;

const advAxis = (key) => {
  const [, side, field] = key.split(":");
  const d = ADV_BY_FIELD[field];
  if (!d || !SIDE_LABEL[side]) return null;
  // Lower is better: an offense on a "down" field; a defense on an "up" field
  // (it allowed it) or on its own "down" act (its flags).
  const low = side === "o" ? d.dir === "down" : side === "d" ? (d.own ? d.dir === "down" : d.dir === "up") : false;
  return { key, label: `${SIDE_LABEL[side]} ${d.label}`, unit: side === "net" && d.unit === "pct" ? "pts" : d.unit, low, team: true, adv: { side, field } };
};

const readAdv = (row, { side, field }) => {
  const o = row?.advanced?.offense?.[field];
  const d = row?.advanced?.defense?.[field];
  if (side === "o") return val(o);
  if (side === "d") return val(d);
  return diff(o, d);
};

/** Picker groups, in the order the dropdown lists them: side × family. */
export const ADV_AXIS_GROUPS = ["o", "d", "net"].flatMap((side) =>
  ["passing", "rushing", "other"].map((fam) => ({
    label: `${side === "o" ? "Offense" : side === "d" ? "Defense" : "Net"} · ${FAM_LABEL[fam]}`,
    options: ADV_FIELDS.filter((d) => d.fam === fam && (side === "o" || !d.offOnly) && (side !== "net" || hasNet(d))).map((d) => advAxis(`adv:${side}:${d.f}`)),
  })),
).filter((g) => g.options.length);

// The standard charts come in sections; the originals follow as "More".
export const SCATTER_SECTIONS = [
  { id: "team", label: "Team" },
  { id: "rushing", label: "Rushing" },
  { id: "downs", label: "Down & Distance" },
];

// A preset can also:
//   flip      reverse an axis whose "low" end is good, so better is right / up
//   quadrants corner labels, [top-left, top-right, bottom-left, bottom-right]
//   tint      wash the best / worst quadrants green / red
//   center    "mean" (default) or "median" crosshair
export const SCATTER_PRESETS = [
  {
    // The four standard charts (added 2026-10-04) — always shown as buttons.
    id: "off_def_epa", section: "team", label: "Offense vs Defense EPA", standard: true, x: "d_epa_play", y: "o_epa_play",
    flip: { x: true }, tint: true,
    quadrants: ["Good offense, leaky defense", "Good offense, good defense", "Struggling on both sides", "Good defense, struggling offense"],
  },
  {
    id: "havoc_created_conceded", section: "team", label: "Havoc Created vs Conceded", standard: true, x: "havoc_allowed", y: "havoc_forced",
    flip: { x: true }, tint: true,
    quadrants: ["More created · more conceded", "More created · less conceded", "Less created · more conceded", "Less created · less conceded"],
  },
  {
    id: "discipline", section: "team", label: "Discipline", standard: true, x: "o_pen_ypg", y: "d_pen_ypg",
    flip: { x: true, y: true }, tint: true,
    quadrants: ["Clean offense, flagged defense", "Clean on both sides", "Flagged on both sides", "Clean defense, flagged offense"],
  },
  {
    id: "net_success_halves", section: "team", label: "Net Success by Half", standard: true, x: "net_sr_h1", y: "net_sr_h2",
    center: "median", tint: true,
    quadrants: ["Weaker start · stronger finish", "Stronger in both halves", "Weaker in both halves", "Stronger start · weaker finish"],
  },
  // Rushing — the team charts from the rushing series.
  {
    id: "power_stuffs", section: "rushing", label: "Power & Stuffs", standard: true, x: "stuff_rate", y: "power_success",
    flip: { x: true }, tint: true, center: "median",
    quadrants: ["Converts short · stuffed often", "Converts short · rarely stuffed", "Fails short · stuffed often", "Fails short · rarely stuffed"],
  },
  {
    id: "first_and_ten", section: "rushing", label: "1st & 10", standard: true, x: "f10_rush_sr", y: "f10_run_rate",
    center: "median",
    quadrants: ["Runs a lot · runs struggle", "Runs a lot · runs work", "Throws first · runs struggle", "Throws first · runs work"],
  },
  {
    id: "qb_share", section: "rushing", label: "QB Share", standard: true, x: "qb_share_carries", y: "qb_share_rush_yds",
    center: "median",
    quadrants: ["Few QB runs · big QB yards", "QB-driven run game", "Backs carry it", "Many QB runs · few yards"],
  },
  {
    id: "late_strength", section: "rushing", label: "Late Strength", standard: true, x: "rush_sr_h1", y: "rush_sr_h2",
    tint: true, center: "median",
    quadrants: ["Weaker start · stronger finish", "Strong in both halves", "Weak in both halves", "Stronger start · fades late"],
  },
  // Down & Distance — 3rd and 4th down, offense side.
  {
    id: "third_short", section: "downs", label: "3rd & Short", standard: true, x: "adv:o:third_short_share", y: "adv:o:third_short_conversion",
    center: "median", tint: true,
    quadrants: ["Few short 3rds · converts them", "Lives in 3rd & short · converts", "Few short 3rds · fails them", "Lives in 3rd & short · fails"],
  },
  {
    id: "third_long", section: "downs", label: "3rd & Long", standard: true, x: "adv:o:third_long_share", y: "adv:o:third_long_conversion",
    flip: { x: true }, center: "median", tint: true,
    quadrants: ["Stuck in long 3rds · escapes", "Rarely long · escapes when it is", "Stuck in long 3rds · stalls", "Rarely long · stalls when it is"],
  },
  {
    id: "on_schedule", section: "downs", label: "Staying on Schedule", standard: true, x: "adv:o:third_down_distance", y: "adv:o:third_fourth_success",
    flip: { x: true }, center: "median", tint: true,
    quadrants: ["Long 3rd downs · converts anyway", "Short 3rd downs · converts", "Long 3rd downs · stalls", "Short 3rd downs · stalls"],
  },
  {
    id: "fourth_nerve", section: "downs", label: "4th-Down Nerve", standard: true, x: "adv:o:fourth_down_go_rate", y: "adv:o:fourth_down_conversion",
    center: "median",
    quadrants: ["Picks its spots · converts", "Goes for it · converts", "Picks its spots · fails", "Goes for it · fails"],
  },
  // The original presets.
  { id: "efficiency", label: "Efficiency", x: "net_epa_play", y: "net_success" },
  { id: "havoc", label: "Havoc", x: "havoc_allowed", y: "havoc_forced" },
  { id: "identity", label: "Identity", x: "epa_dropback", y: "epa_rush" },
  { id: "points", label: "Points per Opportunity", x: "ppo_off", y: "ppo_def" },
  { id: "pass_defense", label: "Pass Defense", x: "d_epa_dropback", y: "d_pass_sr" },
];

/** A preset by id when its axes still match, else the first preset on these axes. */
export const presetFor = (xKey, yKey, id = null) =>
  SCATTER_PRESETS.find((p) => p.id === id && p.x === xKey && p.y === yKey) ??
  SCATTER_PRESETS.find((p) => p.x === xKey && p.y === yKey) ??
  null;

export const fmtAxis = (v, unit) => {
  if (!Number.isFinite(v)) return "—";
  if (unit === "pct") return `${(v * 100).toFixed(1)}%`;
  if (unit === "pts") return `${v > 0 ? "+" : ""}${(v * 100).toFixed(0)}`;
  if (unit === "num1") return v.toFixed(1);
  if (unit === "int") return Math.round(v).toString();
  return v.toFixed(2);
};

/** An axis key is either a team chart axis (advanced block) or one of the hub's win levers. */
export const axisFor = (key, levers = []) => {
  if (SCATTER_AXES[key]) return SCATTER_AXES[key];
  if (String(key).startsWith("adv:")) return advAxis(key) ?? { key, label: key, unit: "num" };
  const l = levers.find((x) => x.field === key);
  return l ? { key, label: l.label, unit: l.unit ?? "num", low: !l.good, r: l.r } : { key, label: key, unit: "num" };
};

/**
 * Every team plotted on two axes, whichever kind each axis is.
 * Returns { points, avgX, avgY, x, y } — x / y are the resolved axis objects.
 */
export const scatterSeries = (hub, season, xKey, yKey, presetId = null) => {
  const levers = hub?.levers ?? [];
  const x = axisFor(xKey, levers);
  const y = axisFor(yKey, levers);
  const read = (axis, row, adv) => (axis.adv ? readAdv(row, axis.adv) : axis.team ? adv[axis.key] : row?.metrics?.[axis.key]);

  const points = Object.values(hub?.teams ?? {})
    .map((t) => ({ t, row: t.seasons?.[season], adv: teamAxes(t.seasons?.[season]) }))
    .filter((p) => p.row)
    .map(({ t, row, adv }) => ({
      id: t.identity.id,
      short: t.identity.short,
      name: t.identity.name,
      logo: t.identity.logo,
      color: t.identity.primary,
      record: row.record?.record,
      x: read(x, row, adv),
      y: read(y, row, adv),
    }))
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));

  const lg = hub?.league?.[season]?.metrics ?? {};
  const mean = (vals) => (vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : NaN);
  const median = (vals) => {
    if (!vals.length) return NaN;
    const v = [...vals].sort((a, b) => a - b);
    const m = Math.floor(v.length / 2);
    return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
  };
  const preset = presetFor(xKey, yKey, presetId);
  const center = preset?.center === "median" ? median : mean;
  return {
    points,
    x,
    y,
    // Team axes average the plotted teams; lever axes use the hub's league mean.
    avgX: x.team ? center(points.map((p) => p.x)) : lg[x.key],
    avgY: y.team ? center(points.map((p) => p.y)) : lg[y.key],
    centerLabel: preset?.center === "median" ? "median" : "league average",
    preset,
    mock: false,
  };
};

/** Presets with at least three teams to plot this season — the rest wait for their data. */
export const availablePresets = (hub, season) =>
  SCATTER_PRESETS.filter((p) => scatterSeries(hub, season, p.x, p.y, p.id).points.length >= 3);
