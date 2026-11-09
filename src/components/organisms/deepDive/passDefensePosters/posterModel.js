// Pass-defense poster metadata, scope, raw metric/rank reads and presentation formatting.
// Keeps existing all-team inclusion and sorting policy; no new ranks or statistical definitions.

export const PD_META = { season: 2026, through_week: "latest" };

export const SCOPE = "competitive";

export const POSTER_W = 1400;

export const fgOf = (pal) => (a) => `rgba(${pal.fg}, ${a})`;

export const caps = { textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "900" };

export const tab = { fontVariantNumeric: "tabular-nums" };

export const pct1 = (v) => (Number.isFinite(v) ? `${(v * 100).toFixed(1)}%` : "—");

export const pct0 = (v) => (Number.isFinite(v) ? `${Math.round(v * 100)}%` : "—");


export const rgbOf = (hex) => {
  const n = parseInt(String(hex).replace("#", ""), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
};

export const metricOf = (doc, bucket, key) => doc?.subsets?.[SCOPE]?.[bucket]?.metrics?.[key] ?? null;

export const leagueOf = (index, bucket, key) => index?.league?.all?.[SCOPE]?.[bucket]?.metrics?.[key]?.value ?? null;

export const rankOf = (m) => m?.ranking?.rank ?? m?.rank ?? null;

const inMain = (r) => rankOf(r.m) != null || String(r.id).startsWith("swac");

export const splitRanked = (rows, better) => {
  const sort = (a, b) => (better === "higher" ? b.m.value - a.m.value : a.m.value - b.m.value);
  const shown = rows.filter((r) => Number.isFinite(r.m?.value));
  return [shown.filter(inMain).sort(sort), shown.filter((r) => !inMain(r)).sort(sort)];
};

export const DEPTHS = [["depth_short", "Short"], ["depth_medium", "Medium"], ["depth_deep", "Deep"]];

export const GROUPS = [["wr", "WR"], ["te", "TE"], ["rb", "RB"]];
