import DATA from "../../../data/swacDownDistance2026W7.json";
import { TEAM_BY_V5, shortOf } from "../rushing/rushingModel";

// ─────────────────────────────────────────────────────────────────────────────
// SWAC down & distance charts — shared model. TEMPORARY, like the rushing
// thread: a one-off social export the backend sent (2026-10-20,
// src/data/swacDownDistance2026W7.json, 2026 through Week 7). It is not a site
// contract; the charts only draw it. Lives in Team Analytics > Charts as the
// "Down & Distance" mode. Delete this folder, the data file and that mode when
// real endpoints replace it.
//
// Team names are the site's short names (teams.json): the file's own "J-State",
// "B-CU" and "Bama State" never print.
// ─────────────────────────────────────────────────────────────────────────────

export { DATA, TEAM_BY_V5, shortOf };

export const SUBTITLE = `${DATA.season} · through Week ${DATA.through_week} · games vs SWAC/MEAC opponents`;

// House palette (the Series Results colours).
export const PURPLE = "#A855F7";
export const FOREST = "#1F7A3F";
export const GREEN = "#22C55E";
export const TEAL = "#0E7C86";
export const BURNT = "#CC5500";
export const RED = "#E53E3E";
export const GREY = "#71717A";

const CHIP = {
  first_snap: "First snap",
  first_down_shots: "1st-down shots",
  climb_back: "2nd & long",
  free_play: "2nd & short",
  past_the_sticks: "3rd & 5+",
  where_third_down_starts: "3rd-down distance",
  fourth_and_short_map: "4th & short map",
  money_down_quadrant: "3rd & 4th down",
};

// The definitions each image's footer carries (export only).
const FOOTER = {
  first_snap: ["drive_opener", "behind_the_chains"],
  first_down_shots: ["shot"],
  climb_back: ["back_on_schedule"],
  free_play: ["shot"],
  past_the_sticks: ["short_of_the_sticks", "conversion"],
  where_third_down_starts: ["short_yardage"],
  fourth_and_short_map: ["short_yardage"],
  money_down_quadrant: ["win_probability_added", "late_and_close"],
};
const DEF_LABEL = {
  drive_opener: "Drive opener",
  behind_the_chains: "Behind the chains",
  shot: "Shot",
  back_on_schedule: "Back on schedule",
  short_of_the_sticks: "Short of the sticks",
  conversion: "Conversion",
  short_yardage: "Short yardage",
  win_probability_added: "Win probability added",
  late_and_close: "Late and close",
};
export const footerFor = (id) => (FOOTER[id] ?? [])
  .filter((k) => DATA.definitions?.[k])
  .map((k) => ({ label: DEF_LABEL[k] ?? k, text: DATA.definitions[k] }));

export const CHARTS = DATA.slides.map((s) => ({ id: s.id, chip: CHIP[s.id] ?? s.id, title: s.title, kind: s.chart.type, slide: s }));

/** Round a span out to whole steps so a scatter without min/max still frames its points. */
export const niceRange = (values, pad = 0.12) => {
  const v = values.filter(Number.isFinite);
  if (!v.length) return { min: 0, max: 1 };
  const lo = Math.min(...v);
  const hi = Math.max(...v);
  const span = hi - lo || 1;
  const step = span * (1 + 2 * pad) <= 12 ? 1 : span * (1 + 2 * pad) <= 50 ? 5 : 10;
  return { min: Math.floor((lo - span * pad) / step) * step, max: Math.ceil((hi + span * pad) / step) * step };
};

export const pct0 = (v) => (v == null ? "—" : `${Math.round(Number(v))}%`);
export const n1 = (v) => (v == null ? "—" : Number(v).toFixed(1));
export const signed1 = (v) => (v == null ? "—" : `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(Number(v)).toFixed(1)}`);
