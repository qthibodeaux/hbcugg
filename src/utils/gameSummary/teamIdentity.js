import teamsData from "../../data/teams.json";

// Extracted from GameSummaryTabV2. Existing data and presentation behavior is preserved.

const TEAM_META = teamsData.teams.reduce((acc, t) => {
  acc[t.exportId] = t;
  acc[t.exportId.replace(/25$/, "")] = t;
  acc[t.id] = t;
  return acc;
}, {});

const getTeam = (id) => (id ? TEAM_META[id] ?? null : null);

export const getTeamColor = (id, fallback = "#E53E3E") => {
  if (!id) return fallback;
  return getTeam(id)?.colors?.primary ?? fallback;
};

export const getTeamLogoSrc = (id) => {
  if (!id) return "";
  return `/assets/${String(id).replace(/25$/, "")}.svg`;
};

export const getTeamLabel = (id) => {
  if (!id) return "—";
  return getTeam(id)?.shortName ?? String(id).toUpperCase();
};

export const onDark = (hex, minL = 0.55) => {
  const h = String(hex).replace("#", "");
  if (h.length !== 6) return hex;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.substring(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (l >= minL) return hex;
  const d = max - min;
  const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let hue = 0;
  if (d !== 0) {
    if (max === r) hue = ((g - b) / d) % 6;
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  // Achromatic (black/charcoal primaries) has no hue to preserve — go to plain light gray.
  if (sat < 0.12) return "#d4d4d8";
  const c = (1 - Math.abs(2 * minL - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = minL - c / 2;
  const seg = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][Math.floor(hue / 60) % 6];
  return `#${seg.map((v) => Math.round((v + m) * 255).toString(16).padStart(2, "0")).join("")}`;
};

const isBlackish = (hex) => {
  const h = String(hex).replace("#", "");
  if (h.length !== 6) return false;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.substring(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return l < 0.2 && sat < 0.15;
};

export const getTeamAccent = (id) => {
  const colors = getTeam(id)?.colors ?? {};
  const primary = colors.primary;
  if (!primary) return "#E53E3E";
  // A set `accent` in teams.json is the school's readable game color (AAMU, J State).
  if (colors.accent) return colors.accent;
  if (isBlackish(primary) && colors.secondary) return colors.secondary;
  return primary;
};

export const normTeamId = (id) => String(id ?? "").replace(/25$/, "");
