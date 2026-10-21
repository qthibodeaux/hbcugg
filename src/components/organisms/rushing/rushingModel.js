import teamsData from "../../../data/teams.json";
import DATA from "../../../data/swacRushing2026W6.json";

// ─────────────────────────────────────────────────────────────────────────────
// SWAC rushing charts — shared model. TEMPORARY: the data is a one-off file the
// backend sent (src/data/swacRushing2026W6.json, 2026 through Week 6); it is not
// a site contract. The charts only plot it. Delete this folder, the data file
// and the Rushing tab when real endpoints replace it.
// ─────────────────────────────────────────────────────────────────────────────

export { DATA };

export const SUBTITLE = "2026 · through Week 6 · games vs SWAC/MEAC opponents";

export const TEAM_BY_V5 = teamsData.teams.reduce((acc, t) => {
  acc[t.exportId.replace(/25$/, "")] = t;
  return acc;
}, {});

// Team names on the charts are the site's short names (teams.json shortName):
// AAMU, ASU, BCU, TSU... The file's own labels ("B-CU", "Texas Southern") are
// only used to find the team behind an opponent written as text.
export const shortOf = (teamId) => TEAM_BY_V5[teamId]?.shortName ?? String(teamId ?? "").replace(/^(swac|meac)/, "").toUpperCase();

const ID_BY_LABEL = {};
DATA.slides.forEach((s) => {
  [...(s.chart?.points ?? []), ...(s.chart?.rows_data ?? []), ...(s.chart?.off_chart ?? []), ...(s.leaders ?? [])].forEach((r) => {
    if (r.team_id && r.label) ID_BY_LABEL[r.label] = r.team_id;
    if (r.team_id && r.name) ID_BY_LABEL[r.name] = r.team_id;
  });
});
/** A team written as the file's text label ("B-CU", "Texas Southern") -> its short name. */
export const shortOfLabel = (label) => (ID_BY_LABEL[label] ? shortOf(ID_BY_LABEL[label]) : label);

const lumOf = (hex) => {
  const h = String(hex || "#444").replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
};

/** The team colour that reads on near-black: primary, else secondary, else white. */
export const ringOf = (team) => {
  const p = team?.colors?.primary || "#888888";
  if (lumOf(p) >= 0.22) return p;
  const s = team?.colors?.secondary || "#FFFFFF";
  return lumOf(s) >= 0.22 ? s : "#FFFFFF";
};

/** Text colour that reads on a solid team colour. */
export const inkOn = (hex) => (lumOf(hex) > 0.6 ? "#111111" : "#FFFFFF");

const SUFFIX = /^(jr|sr|ii|iii|iv|v)\.?$/i;
export const lastName = (name) => {
  const parts = String(name ?? "").trim().split(/\s+/).filter((w) => !SUFFIX.test(w));
  return parts.slice(-1)[0] ?? "";
};

/** Gridline values for an axis: whole steps that fit the span. */
export const ticksFor = (min, max) => {
  const span = max - min;
  const step = span <= 12 ? 1 : span <= 50 ? 5 : 10;
  const out = [];
  for (let t = Math.ceil(min / step) * step; t <= max + 1e-9; t += step) out.push(t);
  return out;
};

export const tickText = (axis) => (v) => (axis?.format === "percent" ? `${v}%` : `${v}`);

const n1 = (v) => (v == null ? "—" : Number(v).toFixed(1));
const pc = (v) => (v == null ? "—" : `${Number(v).toFixed(1)}%`);
const raw = (v) => (v == null ? "—" : String(v));

// Hover details per chart, beyond the two axes: [key, label, format].
export const EXTRAS = {
  first_and_ten: [["ypc", "Yards per carry", n1], ["pass_success_rate", "Pass success on 1st & 10", pc]],
  qb_share: [["qb_ypc", "QB yards per carry", n1], ["backs_ypc", "Backs yards per carry", n1], ["qb_success_rate", "QB success rate", pc]],
  power_and_stuffs: [["power", "Power runs", raw]],
  explosive_vs_workhorse: [["carries", "Carries", raw], ["ypc", "Yards per carry", n1], ["explosive_runs", "12+ yard runs", raw], ["long", "Long", raw], ["td", "TD", raw]],
  stronger_late: [["closing_runs", "Closing runs", raw]],
  star_rushers: [["carries", "Carries", raw], ["yards", "Yards", raw], ["td", "TD", raw], ["runs_20_plus", "20+ yard runs", raw], ["long", "Long", raw]],
};

const CHIP = {
  first_and_ten: "1st & 10",
  qb_share: "QB share",
  power_and_stuffs: "Power & stuffs",
  explosive_vs_workhorse: "Explosive backs",
  stronger_late: "Late strength",
  run_direction: "Direction",
  star_rushers: "Star rushers",
  week6_and_tidbits: "Week 6",
  valley_rising: "MVSU",
  jackson_steady: "Jackson State",
};

// The tidbit charts name their team in the title only.
const TIDBIT_TEAM = { valley_rising: "swacmvsu", jackson_steady: "swacjsu" };

export const CHARTS = [
  ...DATA.slides.map((s) => ({ id: s.id, chip: CHIP[s.id] ?? s.id, title: s.title, kind: s.chart.type, chart: s.chart, slide: s })),
  ...(DATA.slides.find((s) => s.tidbits)?.tidbits ?? []).map((t) => ({ id: t.id, chip: CHIP[t.id] ?? t.id, title: t.title, kind: "line", tidbit: t, teamId: TIDBIT_TEAM[t.id] ?? null })),
];
