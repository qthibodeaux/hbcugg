import { splitDisplayName } from "./headshots";

// Extracted from ProductionPrimitives; existing behavior is preserved.

// ─────────────────────────────────────────────────────────────────────────────
// Shared chrome for the "clean" production panels (passing, rushing, …).
// Extracted so the groups can't drift into subtly different tables and headers —
// one eyebrow, one table, one player spotlight, and every panel reads as one page.
// ─────────────────────────────────────────────────────────────────────────────
export const pct = (n) => (n == null ? "—" : `${(n * 100).toFixed(0)}%`);

export const rate = (n) => (n == null ? "—" : n.toFixed(1));

export const num = (n) => (n == null ? "—" : String(n));

/** "Watson,Keely" → "Watson". */
export const lastName = (raw) => splitDisplayName(raw)[1];

/**
 * Colour a comparative cell against the league: green above the average, red
 * below, deeper the further out — scaled to the league's own spread (avg→max on
 * the good side, avg→min on the bad). `league` is one entry of
 * `shared/league_avg_{season}.keys`. Null when there is nothing to compare to.
 */
// `strength` lifts the tint for print (the export posters pass PRINT_SHADE).
export const PRINT_SHADE = { base: 0.16, gain: 0.5 };

export const shadeVsLeague = (value, league, { lowerIsBetter = false, strength = { base: 0.12, gain: 0.45 } } = {}) => {
  if (typeof value !== "number" || !Number.isFinite(value) || typeof league?.avg !== "number") return null;
  const dev = lowerIsBetter ? league.avg - value : value - league.avg;
  const up = typeof league.max === "number" ? league.max - league.avg : 0;
  const down = typeof league.min === "number" ? league.avg - league.min : 0;
  const span = dev >= 0 ? (lowerIsBetter ? down : up) : (lowerIsBetter ? up : down);
  const t = span > 0 ? Math.min(1, Math.abs(dev) / span) : 0;
  if (t < 0.04) return null;
  const alpha = (strength.base + strength.gain * t).toFixed(2);
  return dev >= 0 ? `rgba(34,197,94,${alpha})` : `rgba(239,68,68,${alpha})`;
};

const hexToRgb = (hex) => {
  const raw = String(hex || "").replace("#", "");
  const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  if (full.length !== 6) return null;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const rgbToHsl = ({ r, g, b }) => {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === R ? ((G - B) / d + (G < B ? 6 : 0)) : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  return { h: h / 6, s, l };
};

const hslToRgb = ({ h, s, l }) => {
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p2 = 2 * l - q;
  const channel = (t) => {
    let x = t;
    if (x < 0) x += 1;
    if (x > 1) x -= 1;
    if (x < 1 / 6) return p2 + (q - p2) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p2 + (q - p2) * (2 / 3 - x) * 6;
    return p2;
  };
  return {
    r: Math.round(channel(h + 1 / 3) * 255),
    g: Math.round(channel(h) * 255),
    b: Math.round(channel(h - 1 / 3) * 255),
  };
};

/**
 * Team colours in this league skew very dark — 15 of 18 primaries sit under 0.28
 * luminance and three (Alabama State, Pine Bluff, Grambling) are pure black — so
 * ramping the primary's alpha straight onto a #141416 card would produce cells you
 * cannot tell apart. Lift lightness into a usable band, keeping hue and saturation so
 * the colour still reads as the school's. A black primary has neither to keep, so it
 * defers to the secondary.
 */
export const heatAccent = (primary, secondary) => {
  const rgb = hexToRgb(primary);
  if (!rgb) return "#4A90D9";
  let hsl = rgbToHsl(rgb);
  if (hsl.s < 0.15 && hsl.l < 0.2) {
    const alt = hexToRgb(secondary);
    if (alt) hsl = rgbToHsl(alt);
  }
  // Saturation is capped as well as floored. Lifting a deep, fully-saturated colour —
  // FAMU's #006747, Norfolk's #007A5E — to a high lightness without capping it turns
  // the school green into neon mint, which reads as a bug rather than a brand.
  const s = Math.min(Math.max(hsl.s, 0.3), 0.6);
  const lifted = hslToRgb({ h: hsl.h, s, l: Math.max(hsl.l, 0.46) });
  return `rgb(${lifted.r}, ${lifted.g}, ${lifted.b})`;
};

export const withAlpha = (color, alpha) => {
  const rgb = hexToRgb(color);
  if (rgb) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  const m = String(color).match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const [r, g, b] = m[1].split(",").map((v) => parseFloat(v));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
};

/**
 * Shared heat ramp for the production charts, in the school's own colour. Intensity is
 * a yards-style rate, not a completion percentage: the cell already prints its own
 * counts, so colour has to carry something the numerals don't. Below `minSample`
 * attempts the cell stays neutral — one carry or one throw is not a rate.
 */
// Passing zone grid heat: yards per attempt against a fixed 14 — page and poster.
export const PASS_ZONE_YPA_SCALE = 14;

export const heatFill = (value, attempts, scale, color, minSample = 2) => {
  if (!attempts) return { bg: "transparent", border: "rgba(255,255,255,0.05)" };
  if (attempts < minSample) return { bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.09)" };
  const t = Math.max(0, Math.min(1, value / scale));
  return {
    bg: withAlpha(color, (0.16 + t * 0.68).toFixed(3)),
    border: withAlpha(color, 0.4),
  };
};
