// Team colour, made visible.
//
// Six of our eighteen teams carry a primary that is black or nearly black
// (ASU, UAPB and GSU are literally #000000), which disappears entirely when
// it is drawn as a line or a stroke on a dark panel. Fills are fine — a black
// chip with white text reads — so this is only for strokes, sparklines and
// chart series.
//
// The rule: keep the primary when it clears a minimum contrast against the
// surface it is drawn on; otherwise take the secondary, but only when the
// secondary is actually better. SCSU's secondary (#002B54) is darker than its
// maroon primary, so SCSU keeps its maroon rather than getting worse.

const PANEL_BG = "#141416";
const MIN_CONTRAST = 2;

const channel = (hex) => {
  const v = parseInt(hex, 16) / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

/** WCAG relative luminance, or null for anything that isn't a hex colour. */
export const relativeLuminance = (color) => {
  if (typeof color !== "string") return null;
  let hex = color.trim().replace(/^#/, "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
  return 0.2126 * channel(hex.slice(0, 2)) + 0.7152 * channel(hex.slice(2, 4)) + 0.0722 * channel(hex.slice(4, 6));
};

export const contrastRatio = (a, b) => {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  if (la == null || lb == null) return null;
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * The colour to draw this team's line in, on `bg`.
 * Pass an identity ({ primary, secondary }) or a primary/secondary pair.
 */
export const readableTeamColor = (identity, bg = PANEL_BG, fallback = "#A855F7") => {
  const primary = identity?.primary ?? null;
  const secondary = identity?.secondary ?? null;
  const cp = contrastRatio(primary, bg);
  if (cp == null) return secondary ?? fallback;
  if (cp >= MIN_CONTRAST) return primary;
  const cs = contrastRatio(secondary, bg);
  return cs != null && cs > cp ? secondary : primary;
};
