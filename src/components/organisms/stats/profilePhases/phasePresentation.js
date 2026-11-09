import { contrastRatio, readableTeamColor } from "../../../../utils/teamColor";
import { fmtProfile } from "../../../../pages/analytics/teamProfileMetrics";

export const POSITIVE = "#48BB78";

export const NEGATIVE = "#F6AD55";

export const OFF_TONE = "#ECC94B";

export const DEF_TONE = "#4299E1";

const DASH = "—";

export const n0 = (v) => (Number.isFinite(v) ? Math.round(v).toLocaleString() : DASH);

const n1 = (v) => (Number.isFinite(v) ? v.toFixed(1) : DASH);

const n2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : DASH);

export const pct = (v) => (Number.isFinite(v) ? `${(v * 100).toFixed(1)}%` : DASH);

export const signed2 = (v) => (Number.isFinite(v) ? `${v > 0 ? "+" : ""}${v.toFixed(2)}` : DASH);

const clock = (secs) => {
  if (!Number.isFinite(secs)) return DASH;
  const m = Math.floor(secs / 60);
  return `${m}:${String(Math.round(secs - m * 60)).padStart(2, "0")}`;
};

export const ratio = (made, att) => (Number.isFinite(made) && Number.isFinite(att) ? `${made} / ${att}` : DASH);

export const rankTone = (rank, total) => {
  if (!Number.isFinite(rank) || !total) return "whiteAlpha.400";
  if (rank <= total / 3) return POSITIVE;
  if (rank > (total * 2) / 3) return NEGATIVE;
  return "whiteAlpha.500";
};

const RUSH_BREAKDOWN_COLORS = {
  lost: "#D05A4B",
  lostAlt: "#63B3ED",
  fallbackLine: "#E8E8EC",
  fallbackHighlight: "#F4D44D",
};

const hexToRgb = (color) => {
  if (typeof color !== "string") return null;
  let hex = color.trim().replace(/^#/, "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
};

const isRedLike = (color) => {
  const rgb = hexToRgb(color);
  if (!rgb) return false;
  return rgb.r >= 150 && rgb.r > rgb.g * 1.22 && rgb.r > rgb.b * 1.22;
};

const isNeutralLike = (color) => {
  const rgb = hexToRgb(color);
  if (!rgb) return false;
  const hi = Math.max(rgb.r, rgb.g, rgb.b);
  const lo = Math.min(rgb.r, rgb.g, rgb.b);
  return hi - lo < 20;
};

const normalizeHex = (color) => (typeof color === "string" ? color.trim().toLowerCase() : "");

const pickTeamBarColor = ({ preferred, alternate, fallback, blocked = [] }) => {
  const blockedSet = new Set(blocked.map(normalizeHex));
  const candidates = [preferred, alternate, fallback, "#FFFFFF", RUSH_BREAKDOWN_COLORS.fallbackHighlight];
  for (const color of candidates) {
    if (!color) continue;
    const norm = normalizeHex(color);
    if (blockedSet.has(norm)) continue;
    if (isRedLike(color)) continue;
    if ((contrastRatio(color, "#141416") ?? 0) < 2) continue;
    return color;
  }
  return fallback;
};

export const rushBreakdownPalette = (teamColors) => {
  const primary = teamColors?.primary ?? null;
  const secondary = teamColors?.secondary ?? null;
  const contextualPrimary = isNeutralLike(primary)
    ? "#FFFFFF"
    : primary;
  const contextualSecondary = isNeutralLike(secondary)
    ? readableTeamColor({ primary: primary, secondary }, undefined, RUSH_BREAKDOWN_COLORS.fallbackHighlight)
    : secondary;
  const line = contextualPrimary || "#FFFFFF";
  const lost = isRedLike(primary) ? RUSH_BREAKDOWN_COLORS.lostAlt : RUSH_BREAKDOWN_COLORS.lost;
  const highlight = pickTeamBarColor({
    preferred: contextualSecondary,
    alternate: contextualPrimary,
    fallback: RUSH_BREAKDOWN_COLORS.fallbackHighlight,
    blocked: [lost, line],
  });
  return {
    lost,
    line: line || "#FFFFFF",
    highlight: highlight || RUSH_BREAKDOWN_COLORS.fallbackHighlight,
  };
};

export const epaFill = (epa) => {
  if (!Number.isFinite(epa)) return "rgba(0,0,0,0.35)";
  const strength = Math.min(1, Math.abs(epa) / 0.45);
  const alpha = (0.12 + strength * 0.62).toFixed(2);
  return epa >= 0 ? `rgba(72,187,120,${alpha})` : `rgba(246,173,85,${alpha})`;
};

export const FMT = { n0, n1, n2, pct, signed2, clock, fp: (v) => fmtProfile(v, "fp") };

export const getPath = (obj, path) => String(path).split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);

export const passingLabelFor = (side) => (side.root === "offense" ? "Pass Offense" : "Pass Defense");

export const rushingLabelFor = (side) => (side.root === "offense" ? "Rush Offense" : "Rush Defense");
