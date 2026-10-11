import { teamMeta } from "../../game/export/exportData";

const PURPLE = "#C084FC";

const lum = (hex) => {
  const raw = String(hex ?? "").replace("#", "");
  if (raw.length !== 6) return 255;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(raw.slice(i, i + 2), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const lighten = (hex, k) => {
  const raw = hex.replace("#", "");
  const ch = [0, 2, 4].map((i) => Math.round(parseInt(raw.slice(i, i + 2), 16) + (255 - parseInt(raw.slice(i, i + 2), 16)) * k));
  return `#${ch.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
};

// A team color that reads on #141416: the primary, unless it is too dark,
// then whichever of secondary/accent is brighter.
export const vivid = (id) => {
  const c = teamMeta(id)?.colors ?? {};
  const options = [c.primary, c.secondary, c.accent].filter(Boolean);
  if (!options.length) return PURPLE;
  if (lum(options[0]) >= 70) return options[0];
  const best = options.reduce((b, x) => (lum(x) > lum(b) ? x : b), options[0]);
  return lum(best) >= 70 ? best : lighten(best, 0.55);
};

