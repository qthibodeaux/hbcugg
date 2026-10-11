import { HEAD_TO_HEAD_ROWS, TAPE_GROUPS, fmtMatchup } from "../pages/analytics/matchupMetrics";

// Pure helpers for the game preview page (an upcoming game with no game file).
//
// A preview has no game_path_id — the only stable identity is the schedule's
// game_id, "YYYY-MM-DD_<away>_at_<home>" with v5 team ids. Everything the page
// shows is read off the two teams' schedule rows for that game.

export const previewPath = (gameId) => `/game/preview/${encodeURIComponent(gameId)}`;

export const parsePreviewId = (gameId) => {
  const m = /^(\d{4}-\d{2}-\d{2})_(.+?)_at_(.+)$/.exec(String(gameId ?? ""));
  if (!m) return null;
  return { date: m[1], awayId: m[2], homeId: m[3], season: Number(m[1].slice(0, 4)) };
};

/**
 * Kickoff as a Date, or null when the schedule has no time yet ("TBA").
 * The schedule gives a local clock string ("13:00" or "06:05 PM") with no time
 * zone, so the instant is read in the viewer's zone — a backend ask is an ISO
 * kickoff with an offset.
 */
export const kickoffDate = (isoDate, label) => {
  const text = String(label ?? "").trim();
  let m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(text);
  let hour;
  let minute;
  if (m) {
    hour = Number(m[1]) % 12 + (m[3].toUpperCase() === "PM" ? 12 : 0);
    minute = Number(m[2]);
  } else {
    m = /^(\d{1,2}):(\d{2})$/.exec(text);
    if (!m) return null;
    hour = Number(m[1]);
    minute = Number(m[2]);
  }
  const d = new Date(`${isoDate}T00:00:00`);
  d.setHours(hour, minute, 0, 0);
  return d;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** "Sat, Nov 28, 2026" */
export const longDate = (isoDate) => {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate ?? "";
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

export const shortDate = (isoDate) => {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate ?? "";
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

// ── Matchup sheet model ──────────────────────────────────────────────────────
// One model feeds both the page and the export poster so they cannot drift.
// Three zones: the away team's season summary, two head-to-head tables in the
// middle (away offense vs home defense, away defense vs home offense), and the
// home team's summary. Values and ranks come from matchupTable (a mock today);
// ranks respect each field's polarity, so #1 is always best.

/** "good" top third, "bad" bottom third, "mid" between. */
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

// Units per summary field, read off the tape groups' own signed flag and the
// field names (percent fields are rates, net_fp is yards).
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
