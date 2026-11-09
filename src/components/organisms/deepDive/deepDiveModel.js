import teamsData from "../../../data/teams.json";
import DLINE from "../../../data/swacDline2026W7.json";
import PEOPLE from "../../../data/swacDlinePeople2026W7.json";

// ─────────────────────────────────────────────────────────────────────────────
// Deep Dive — shared model. A deep dive is a one-off backend report on one
// unit or position (first: the SWAC defensive line, 2026 through Week 7,
// src/data/swacDline2026W7.json plus the people file swacDlinePeople2026W7.json,
// from 999-frontendfeedback/10 21/swac_dline).
// It isn't a site contract: the posters only draw the file. Each future deep
// dive is a new data file plus its posters; the frame (DeepDiveCharts) stays.
//
// Team names are the site's short names (teams.json): the file's own "J-State",
// "B-CU" and "Bama State" never print. Players print by last name.
// ─────────────────────────────────────────────────────────────────────────────

export { DLINE, PEOPLE };

export const TEAM_BY_V5 = teamsData.teams.reduce((acc, t) => {
  acc[t.exportId.replace(/25$/, "")] = t;
  return acc;
}, {});

export const shortOf = (teamId) => TEAM_BY_V5[teamId]?.shortName ?? String(teamId ?? "").replace(/^(swac|meac)/, "").toUpperCase();
export const logoOf = (teamId) => TEAM_BY_V5[teamId]?.logo ?? null;

/** One chart of a deep-dive file by id. */
export const chartOf = (file, id) => (file?.charts ?? []).find((c) => c.id === id) ?? null;

const SUFFIX = /^(jr\.?|sr\.?|ii|iii|iv|v)$/i;
export const lastName = (full) => {
  const parts = String(full ?? "").trim().split(/\s+/);
  if (parts.length > 2 && SUFFIX.test(parts[parts.length - 1])) return parts.slice(-2).join(" ");
  return parts[parts.length - 1] ?? "";
};

export const pct1 = (v) => (v == null ? "—" : `${Number(v).toFixed(1)}%`);
export const pct0 = (v) => (v == null ? "—" : `${Math.round(Number(v))}%`);
export const n2 = (v) => (v == null ? "—" : Number(v).toFixed(2));
export const num = (v) => (v == null ? "—" : String(Number(v)));
export const signed2 = (v) => (v == null ? "—" : `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(Number(v)).toFixed(2)}`);
export const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

/** "Indy Cc / Point University" -> "Point University" (the last school). */
export const lastSchool = (s) => String(s ?? "").split("/").map((x) => x.trim()).filter(Boolean).pop() ?? "";
