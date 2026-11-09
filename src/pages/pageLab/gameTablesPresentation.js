

// Single-game lab colors, percentile display and depth/direction order. No rate definitions changed.

export const PANEL = "#141416";

export const LINE = "rgba(255,255,255,0.07)";

export const shadeFor = (pct) => {
  if (pct == null) return "transparent";
  const d = (pct - 50) / 50; // -1 … +1
  const a = Math.min(0.32, Math.abs(d) * 0.34);
  return d >= 0 ? `rgba(72, 187, 120, ${a})` : `rgba(246, 173, 85, ${a})`;
};

export const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const DEPTHS = [["deep", "Deep"], ["medium", "Medium"], ["short", "Short"]];

export const DIRS = [["left", "Left"], ["middle", "Middle"], ["right", "Right"]];
