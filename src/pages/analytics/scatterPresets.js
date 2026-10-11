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
};

// A preset can also:
//   flip      reverse an axis whose "low" end is good, so better is right / up
//   quadrants corner labels, [top-left, top-right, bottom-left, bottom-right]
//   tint      wash the best / worst quadrants green / red
//   center    "mean" (default) or "median" crosshair
export const SCATTER_PRESETS = [
  {
    // The four standard charts (added 2026-10-04) — always shown as buttons.
    id: "off_def_epa", label: "Offense vs Defense EPA", standard: true, x: "d_epa_play", y: "o_epa_play",
    flip: { x: true }, tint: true,
    quadrants: ["Good offense, leaky defense", "Good offense, good defense", "Struggling on both sides", "Good defense, struggling offense"],
  },
  {
    id: "havoc_created_conceded", label: "Havoc Created vs Conceded", standard: true, x: "havoc_allowed", y: "havoc_forced",
    flip: { x: true }, tint: true,
    quadrants: ["More created · more conceded", "More created · less conceded", "Less created · more conceded", "Less created · less conceded"],
  },
  {
    id: "discipline", label: "Discipline", standard: true, x: "o_pen_ypg", y: "d_pen_ypg",
    flip: { x: true, y: true }, tint: true,
    quadrants: ["Clean offense, flagged defense", "Clean on both sides", "Flagged on both sides", "Clean defense, flagged offense"],
  },
  {
    id: "net_success_halves", label: "Net Success by Half", standard: true, x: "net_sr_h1", y: "net_sr_h2",
    center: "median", tint: true,
    quadrants: ["Weaker start · stronger finish", "Stronger in both halves", "Weaker in both halves", "Stronger start · weaker finish"],
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
  const read = (axis, row, adv) => (axis.team ? adv[axis.key] : row?.metrics?.[axis.key]);

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
