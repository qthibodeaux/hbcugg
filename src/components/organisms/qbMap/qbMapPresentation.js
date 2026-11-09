import teamsData from "../../../data/teams.json";

// Canonical QB-map team identity, existing color/label rules and page/export dimensions.

export const SEASON = 2026;

export const BRAND = "#A855F7";

export const TEAM_BY_V5 = teamsData.teams.reduce((acc, t) => {
  acc[t.exportId.replace(/25$/, "")] = t;
  return acc;
}, {});

export const QUADRANT_FILL = {
  top_left: "rgba(214,190,120,0.09)",
  top_right: "rgba(72,187,120,0.12)",
  bottom_left: "rgba(229,62,62,0.10)",
  bottom_right: "rgba(99,130,190,0.09)",
};

export const QUADRANT_INK = {
  top_left: "#D6BE78",
  top_right: "#68D391",
  bottom_left: "#FC8181",
  bottom_right: "#93A9D6",
};

const lum = (hex) => {
  const h = (hex || "#444").replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
};

export const inkFor = (hex) => (lum(hex) > 0.6 ? "#111" : "var(--gg-ink)");

export const dotColors = (team) => {
  const fill = team?.colors?.primary || "#444";
  const sec = team?.colors?.secondary || "var(--gg-ink)";
  const ring = Math.abs(lum(fill) - lum(sec)) < 0.2 ? "var(--gg-ink)" : sec;
  return { fill, ring };
};

export const pct = (v) => `${Math.round(v * 100)}%`;

export const pct1 = (v) => `${(v * 100).toFixed(1)}%`;

export const signed = (v) => (v > 0 ? `+${v.toFixed(2)}` : v.toFixed(2));

const SUFFIX = /^(jr|sr|ii|iii|iv|v)\.?$/i;

export const lastName = (name) => {
  const parts = String(name ?? "").trim().split(/\s+/).filter((w) => !SUFFIX.test(w));
  return parts.slice(-1)[0] ?? "";
};

export const POSTER_W = 1200;

export const POSTER_H = 1600;
