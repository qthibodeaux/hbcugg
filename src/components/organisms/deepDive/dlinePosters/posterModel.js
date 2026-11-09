// Existing fixed SWAC D-line snapshot helpers for the desktop Deep Dive exports.
import { chartOf, DLINE, PEOPLE } from "../deepDiveModel";

export const POSTER_W = 1400;

export const rowsOf = (id) => chartOf(DLINE, id)?.data ?? [];

export const byTeam = (rows) => Object.fromEntries(rows.map((r) => [r.team_id, r]));

export const fgOf = (pal) => (a) => `rgba(${pal.fg}, ${a})`;

export const caps = { textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "900" };

export const tab = { fontVariantNumeric: "tabular-nums" };

export const signed = (v, d = 2) => (v == null ? "—" : `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(Number(v)).toFixed(d)}`);

export const countOf = (pct, n) => Math.round((Number(pct) * Number(n)) / 100);

export const TEAL = "#0E9AA7";

export const STAFF_TAG = { head_coach: "HC", defensive_coordinator: "DC", dl_coach: "DL" };

export const sentences = (...parts) => parts.filter(Boolean).map((t) => `${t}.`).join(" ");

export const listWords = (w) => (w.length < 2 ? w.join("") : `${w.slice(0, -1).join(", ")} and ${w[w.length - 1]}`);

export const extremeOf = (rows, key) => {
  const vals = rows.map((r) => r[key]).filter((v) => v != null);
  const last = vals[vals.length - 1];
  const rest = vals.slice(0, -1);
  if (last == null || !rest.length) return null;
  if (rest.every((v) => last > v)) return `Most since ${rows[0].season}`;
  if (rest.every((v) => last < v)) return `Lowest since ${rows[0].season}`;
  return null;
};

export const ROLE_WORD = { head_coach: "head coach", defensive_coordinator: "DC", dl_coach: "line coach" };

export const sameStaff = (teamId) => {
  const t = PEOPLE.teams?.[teamId] ?? {};
  const kept = ["head_coach", "defensive_coordinator", "dl_coach"]
    .filter((k) => !(t.changes ?? []).includes(k) && [].concat(t[k]?.["2026"] ?? []).length);
  return kept.length ? `the same ${listWords(kept.map((k) => ROLE_WORD[k]))}` : null;
};

export const TD_COLS = "92px minmax(0,1fr) 52px 44px";

export const DEPTH_COLS = "92px minmax(0,1fr) 40px 40px";
