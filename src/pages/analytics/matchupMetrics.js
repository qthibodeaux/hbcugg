// Matchup metrics — the tale-of-the-tape categories and the head-to-head rows.
//
// Real since 2026-10-04: every value is the backend's advanced block
// (stats/team-analytics/advanced_{season}.json), attached to each team-season
// by useTeamAnalyticsHub as `row.advanced`. Nets are offense minus defense.
// League means and ranks are over the teams with a value.

// unit: num2 (2dp) · num1 (1dp) · pct (xx.x%) · fp (Own 26 / Opp 45)
// high: true when more is better — drives the rank, so the chips are honest.
export const MATCHUP_FIELDS = {
  o_adj_epa: { unit: "num2", high: true },
  d_adj_epa: { unit: "num2", high: false },
  net_adj_epa: { unit: "num2", high: true },
  o_epa: { unit: "num2", high: true },
  d_epa: { unit: "num2", high: false },
  net_epa: { unit: "num2", high: true },
  o_success: { unit: "pct", high: true },
  o_success_pass: { unit: "pct", high: true },
  o_success_rush: { unit: "pct", high: true },
  d_success: { unit: "pct", high: false },
  d_success_pass: { unit: "pct", high: false },
  d_success_rush: { unit: "pct", high: false },
  o_epa_drive: { unit: "num2", high: true },
  d_epa_drive: { unit: "num2", high: false },
  net_epa_drive: { unit: "num2", high: true },
  net_fp: { unit: "num1", high: true },
  o_epa_pass: { unit: "num2", high: true },
  d_epa_pass: { unit: "num2", high: false },
  o_epa_rush: { unit: "num2", high: true },
  d_epa_rush: { unit: "num2", high: false },
  o_avail_yds: { unit: "pct", high: true },
  d_avail_yds: { unit: "pct", high: false },
  o_start_fp: { unit: "fp", high: true },
  d_start_fp: { unit: "fp", high: false },
  o_early_epa: { unit: "num2", high: true },
  d_early_epa: { unit: "num2", high: false },
  o_third_succ: { unit: "pct", high: true },
  d_third_succ: { unit: "pct", high: false },
  o_third_dist: { unit: "num2", high: false },
  d_third_dist: { unit: "num2", high: true },
};

// The outside columns: a net headline with the two halves that make it under
// it. A group with no children is a single line.
export const TAPE_GROUPS = [
  {
    key: "net_adj_epa", label: "Net Adj EPA/Play", signed: true,
    children: [{ key: "o_adj_epa", label: "Offense" }, { key: "d_adj_epa", label: "Defense" }],
  },
  {
    key: "net_epa", label: "Net EPA/Play", signed: true,
    children: [{ key: "o_epa", label: "Offense" }, { key: "d_epa", label: "Defense" }],
  },
  {
    key: "o_success", label: "Offense Success",
    children: [{ key: "o_success_pass", label: "Pass" }, { key: "o_success_rush", label: "Rush" }],
  },
  {
    key: "d_success", label: "Defense Success",
    children: [{ key: "d_success_pass", label: "Pass" }, { key: "d_success_rush", label: "Rush" }],
  },
  {
    key: "net_epa_drive", label: "Net EPA/Drive", signed: true,
    children: [{ key: "o_epa_drive", label: "Offense" }, { key: "d_epa_drive", label: "Defense" }],
  },
  { key: "net_fp", label: "Net Field Position", signed: true, children: [] },
];

// The centre column: one row, the attacking side's number against the
// defending side's number. `off` is read from whoever has the ball.
export const HEAD_TO_HEAD_ROWS = [
  { label: "EPA/Pass", off: "o_epa_pass", def: "d_epa_pass" },
  { label: "EPA/Rush", off: "o_epa_rush", def: "d_epa_rush" },
  { label: "Available Yards %", off: "o_avail_yds", def: "d_avail_yds" },
  { label: "Starting Field Position", off: "o_start_fp", def: "d_start_fp" },
  { label: "Early Downs EPA/Play", off: "o_early_epa", def: "d_early_epa" },
  { label: "3rd/4th Down Success", off: "o_third_succ", def: "d_third_succ" },
  { label: "Avg 3rd Down Distance", off: "o_third_dist", def: "d_third_dist" },
];

export const fmtMatchup = (v, unit, signed) => {
  if (!Number.isFinite(v)) return "—";
  if (unit === "fp") return v <= 50 ? `Own ${Math.round(v)}` : `Opp ${Math.round(100 - v)}`;
  if (unit === "pct") return `${(v * 100).toFixed(1)}%`;
  const dp = unit === "num1" ? 1 : 2;
  const mag = Math.abs(v).toFixed(dp);
  if (!signed) return v < 0 ? `-${mag}` : mag;
  return `${v > 0 ? "+" : v < 0 ? "-" : ""}${mag}`;
};

const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const net = (o, d) => (o != null && d != null ? Number((o - d).toFixed(4)) : null);

/** One team's tape off its advanced block — null where the backend has no value. */
export const matchupFromAdvanced = (advanced) => {
  const O = advanced?.offense ?? {};
  const D = advanced?.defense ?? {};
  const v = {
    o_adj_epa: num(O.adj_epa_per_play),
    d_adj_epa: num(D.adj_epa_per_play),
    o_epa: num(O.epa_per_play),
    d_epa: num(D.epa_per_play),
    o_success: num(O.success_rate),
    o_success_pass: num(O.success_rate_pass),
    o_success_rush: num(O.success_rate_rush),
    d_success: num(D.success_rate),
    d_success_pass: num(D.success_rate_pass),
    d_success_rush: num(D.success_rate_rush),
    o_epa_drive: num(O.epa_per_drive),
    d_epa_drive: num(D.epa_per_drive),
    net_fp: num(O.net_field_position),
    o_epa_pass: num(O.epa_per_pass),
    d_epa_pass: num(D.epa_per_pass),
    o_epa_rush: num(O.epa_per_rush),
    d_epa_rush: num(D.epa_per_rush),
    o_avail_yds: num(O.available_yards_pct),
    d_avail_yds: num(D.available_yards_pct),
    o_start_fp: num(O.average_start),
    d_start_fp: num(D.average_start),
    o_early_epa: num(O.early_down_epa),
    d_early_epa: num(D.early_down_epa),
    o_third_succ: num(O.third_fourth_success),
    d_third_succ: num(D.third_fourth_success),
    o_third_dist: num(O.third_down_distance),
    d_third_dist: num(D.third_down_distance),
  };
  v.net_adj_epa = net(v.o_adj_epa, v.d_adj_epa);
  v.net_epa = net(v.o_epa, v.d_epa);
  v.net_epa_drive = net(v.o_epa_drive, v.d_epa_drive);
  return v;
};

/**
 * Every team's slate for a season plus the league rank on each field and the
 * 18-team mean. Ranks respect each field's polarity, so #1 is always best.
 * Returns { values: {teamId: {field: value}}, ranks: {field: {teamId: rank}},
 * league: {field: mean}, total }.
 */
export const matchupTable = (hub, season) => {
  const values = {};
  Object.values(hub?.teams ?? {}).forEach((t) => {
    const row = t.seasons?.[season];
    if (!row) return;
    values[t.identity.id] = matchupFromAdvanced(row.advanced);
  });

  const ids = Object.keys(values);
  const ranks = {};
  const league = {};
  Object.entries(MATCHUP_FIELDS).forEach(([field, def]) => {
    const sorted = ids
      .map((id) => ({ id, v: values[id][field] }))
      .filter((x) => Number.isFinite(x.v))
      .sort((a, b) => (def.high ? b.v - a.v : a.v - b.v));
    ranks[field] = Object.fromEntries(sorted.map((x, i) => [x.id, i + 1]));
    league[field] = sorted.length ? sorted.reduce((acc, x) => acc + x.v, 0) / sorted.length : undefined;
  });

  return { values, ranks, league, total: ids.length };
};
