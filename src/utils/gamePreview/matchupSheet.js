import { fmtMatchup, TAPE_GROUPS, HEAD_TO_HEAD_ROWS } from "../../pages/analytics/matchupMetrics";

export const rankTone = (rank, total) => {
  if (!rank || !total) return "none";
  const third = Math.ceil(total / 3);
  if (rank <= third) return "good";
  if (rank > total - third) return "bad";
  return "mid";
};

const cell = (table, teamId, field, unit, signed) => ({
  value: fmtMatchup(table?.values?.[teamId]?.[field], unit, signed),
  rank: table?.ranks?.[field]?.[teamId] ?? null,
  tone: rankTone(table?.ranks?.[field]?.[teamId], table?.total),
});

const SUMMARY_UNIT = (field) => {
  if (/success/.test(field)) return "pct";
  if (field === "net_fp") return "num1";
  return "num2";
};

const summaryRows = (table, teamId) =>
  TAPE_GROUPS.flatMap((g) => [
    { key: g.key, label: g.label, child: false, ...cell(table, teamId, g.key, SUMMARY_UNIT(g.key), !!g.signed) },
    ...g.children.map((c) => ({ key: c.key, label: c.label, child: true, ...cell(table, teamId, c.key, SUMMARY_UNIT(c.key), false) })),
  ]);

const FIELD_UNIT = {
  o_epa_pass: "num2", d_epa_pass: "num2", o_epa_rush: "num2", d_epa_rush: "num2",
  o_avail_yds: "pct", d_avail_yds: "pct", o_start_fp: "fp", d_start_fp: "fp",
  o_early_epa: "num2", d_early_epa: "num2", o_third_succ: "pct", d_third_succ: "pct",
  o_third_dist: "num2", d_third_dist: "num2",
};

const SIGNED_LABEL = new Set(["EPA/Pass", "EPA/Rush", "Early Downs EPA/Play"]);

const h2hTable = (table, leftId, leftSide, rightId, rightSide) =>
  HEAD_TO_HEAD_ROWS.map((r) => {
    const lf = leftSide === "off" ? r.off : r.def;
    const rf = rightSide === "off" ? r.off : r.def;
    return {
      label: r.label,
      left: cell(table, leftId, lf, FIELD_UNIT[lf], SIGNED_LABEL.has(r.label)),
      right: cell(table, rightId, rf, FIELD_UNIT[rf], SIGNED_LABEL.has(r.label)),
    };
  });

export const buildMatchupSheet = (model) => {
  const { table } = model;
  const awayId = model.away.id;
  const homeId = model.home.id;
  return {
    total: table?.total ?? 0,
    left: { teamId: awayId, rows: summaryRows(table, awayId) },
    right: { teamId: homeId, rows: summaryRows(table, homeId) },
    tables: [
      { key: "away-off", leftId: awayId, leftSide: "Offense", rightId: homeId, rightSide: "Defense", rows: h2hTable(table, awayId, "off", homeId, "def") },
      { key: "away-def", leftId: awayId, leftSide: "Defense", rightId: homeId, rightSide: "Offense", rows: h2hTable(table, awayId, "def", homeId, "off") },
    ],
  };
};
