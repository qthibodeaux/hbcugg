import teamsData from "../../../../data/teams.json";
import { getColorScheme } from "../../../../theme/colorScheme";

// Shared export team identity and existing color/contrast policies.
// Structural extraction does not redesign light/night team-color selection.

const TEAM_META = teamsData.teams.reduce((acc, t) => {
  acc[t.id] = t;
  acc[t.exportId] = t;
  acc[String(t.exportId).replace(/25$/, "")] = t;
  return acc;
}, {});

const isBlackish = (hex) => {
  const raw = String(hex ?? "").replace("#", "");
  if (raw.length !== 6) return false;
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  return (r + g + b) / 3 < 40;
};

export const withAlpha = (hex, alpha) => {
  const raw = String(hex ?? "").replace("#", "");
  if (raw.length !== 6) return hex;
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

export const teamMeta = (id) => TEAM_META[String(id ?? "").replace(/25$/, "")] ?? null;

export const teamName = (id) => teamMeta(id)?.name ?? String(id ?? "").toUpperCase();

export const teamMascot = (id) => teamMeta(id)?.mascot ?? "";

const BANNER_NAME = {
  swacjsu: "J State", meacdsu: "Del State", meacmsu: "Morgan St",
  swacaamu: "Bama A&M", swacasu: "Bama State", swacbcu: "Bethune", meacnsu: "Norfolk", swacmvsu: "Valley",
};

export const teamShortName = (id) => BANNER_NAME[String(id ?? "").replace(/25$/, "")] ?? teamMeta(id)?.displayName ?? teamName(id);

export const teamShort = (id) => teamMeta(id)?.bannerShort ?? teamMeta(id)?.shortName ?? String(id ?? "").toUpperCase();

export const teamLogo = (id) => teamMeta(id)?.logo ?? `/assets/${String(id ?? "").replace(/25$/, "")}.svg`;

export const teamColor = (id) => teamMeta(id)?.colors?.primary ?? "#E53E3E";

const accentBase = (id) => {
  const c = teamMeta(id)?.colors ?? {};
  if (!c.primary) return "#E53E3E";
  // A school with a set `accent` in teams.json (its readable game color, e.g. AAMU and J State,
  // whose primaries are too dark to read) uses it.
  if (c.accent) return c.accent;
  return isBlackish(c.primary) && c.secondary ? c.secondary : c.primary;
};

// In light mode an accent too pale to read on white (a gold, a light blue) is darkened, a step
// at a time, until it holds 3:1 against white. Night keeps the school's color as it is.
const mix = (hex, t) => {
  const raw = String(hex ?? "").replace("#", "");
  if (raw.length !== 6) return hex;
  return `#${[0, 2, 4].map((i) => Math.round(parseInt(raw.slice(i, i + 2), 16) * (1 - t)).toString(16).padStart(2, "0")).join("")}`;
};
export const teamAccent = (id) => {
  const base = accentBase(id);
  if (getColorScheme() !== "light") return base;
  let c = base;
  for (let i = 0; i < 8 && contrast(c, "#FFFFFF") < 3; i += 1) c = mix(base, 0.1 * (i + 1));
  return c;
};

const rgbOf = (hex) => {
  const raw = String(hex ?? "").replace("#", "");
  if (raw.length !== 6) return null;
  return [0, 2, 4].map((i) => parseInt(raw.slice(i, i + 2), 16));
};

const tooClose = (a, b) => {
  const x = rgbOf(a);
  const y = rgbOf(b);
  if (!x || !y) return false;
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]) < 110;
};

const luminance = (hex) => {
  const c = rgbOf(hex);
  if (!c) return 0;
  const [r, g, b] = c.map((v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

export const teamFillColors = (id) => {
  const c = teamMeta(id)?.colors ?? {};
  const fill = c.primary ?? "#71717A";
  const best = contrast(fill, "#FFFFFF") >= contrast(fill, "#0B0B0D") ? "#FFFFFF" : "#0B0B0D";
  const ink = c.secondary && contrast(fill, c.secondary) >= 3.5 ? c.secondary : best;
  return { fill, ink, rgb: (rgbOf(ink) ?? [255, 255, 255]).join(",") };
};

export const matchupInks = (awayId, homeId) => {
  const home = teamAccent(homeId);
  const away = teamAccent(awayId);
  const awaySecondary = teamMeta(awayId)?.colors?.secondary;
  return { home, away: tooClose(away, home) && awaySecondary ? awaySecondary : away };
};
