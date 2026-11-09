// Pure roster-card color and formatting helpers. Class labels are explicit:
// first-letter abbreviations would collide for So./Sr. and Fr./Gr.


const CLASS_SHORT_LABELS = {
  "Fr.": "FR",
  "So.": "SO",
  "Jr.": "JR",
  "Sr.": "SR",
  "Gr.": "GR",
};

export const classShortLabel = (value) =>
  CLASS_SHORT_LABELS[value] ?? String(value ?? "").replace(/\./g, "").toUpperCase().slice(0, 2);

export const buildClassRamp = (primary, steps) => {
  const { r, g, b } = hexToRgb(primary || "#71717A");
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  // Several teams run black or near-black as their primary. Ramping those
  // from a light tint down to the raw color would make the last steps
  // vanish into the card background, so very dark primaries start from a
  // stronger tint and never reach full black.
  const isVeryDark = luminance < 0.22;
  const from = isVeryDark ? 0.85 : 0.72;
  const to = isVeryDark ? 0.18 : 0;

  return Array.from({ length: steps }, (_, index) => {
    const t = from - (from - to) * (index / (steps - 1));
    const mix = (channel) => Math.round(channel + (255 - channel) * t);
    return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
  });
};

export const CLASS_COLORS = {
  "Fr.": "#63B3ED",
  "So.": "#68D391",
  "Jr.": "#F6AD55",
  "Sr.": "#FC8181",
  "Gr.": "#B794F4",
  Unknown: "#71717A",
};

export const TIER_COLORS = {
  FBS: "#63B3ED",
  FCS: "#4FD1C5",
  JUCO: "#F6AD55",
  "D2/D3/NAIA": "#FBD38D",
  Unknown: "#71717A",
};

export const formatPercent = (value, digits = 0) => (value == null ? "--" : `${Number(value).toFixed(digits)}%`);

export const formatNumber = (value) => (value == null ? "--" : Number(value).toLocaleString());

const normalizeHex = (hex, fallback = "#FFFFFF") => {
  const value = String(hex || "").trim();
  if (/^#[0-9a-f]{6}$/i.test(value)) return value.toUpperCase();
  if (/^#[0-9a-f]{3}$/i.test(value)) {
    const parts = value.slice(1).split("");
    return `#${parts.map((part) => `${part}${part}`).join("")}`.toUpperCase();
  }
  return fallback;
};

const hexToRgb = (hex) => {
  const value = normalizeHex(hex).slice(1);
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
};

const rgbToHex = ({ r, g, b }) =>
  `#${[r, g, b]
    .map((channel) => Math.round(Math.max(0, Math.min(255, channel))).toString(16).padStart(2, "0"))
    .join("")}`.toUpperCase();

export const mixColors = (from, to, amount = 0.5) => {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  return rgbToHex({
    r: a.r + (b.r - a.r) * amount,
    g: a.g + (b.g - a.g) * amount,
    b: a.b + (b.b - a.b) * amount,
  });
};

const luminance = (hex) => {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000;
};

export const isLightColor = (hex) => {
  if (!/^#[0-9a-f]{3,6}$/i.test(String(hex || ""))) return false;
  return luminance(hex) > 170;
};

const ensureMapFillColor = (color, fallback = "#6B7280", minLift = 0.16) => {
  const normalized = normalizeHex(color, fallback);
  const value = luminance(normalized);
  if (value < 34) return mixColors(normalized, "#FFFFFF", minLift);
  if (value > 235) return mixColors(normalized, "#0B0B0D", 0.22);
  return normalized;
};

const ensureOutlineColor = (color, fallback = "#FFFFFF") => {
  const normalized = normalizeHex(color, fallback);
  const value = luminance(normalized);
  if (value < 80) return "#FFFFFF";
  if (value > 238) return "rgba(11,11,13,0.72)";
  return normalized;
};

export const getRecruitingMapPalette = (accent, secondaryAccent, tertiaryAccent) => {
  const primary = normalizeHex(accent, "#6B7280");
  const tertiary = normalizeHex(tertiaryAccent, primary);
  const baseSource = luminance(primary) < 14 && luminance(tertiary) > 30 ? tertiary : primary;
  const base = ensureMapFillColor(baseSource, "#6B7280", 0.18);
  const secondary = normalizeHex(secondaryAccent, "#FFFFFF");
  const outline = ensureOutlineColor(secondary, "#FFFFFF");
  const mapBase = ensureMapFillColor(base, "#6B7280");

  return {
    topFills: [mapBase, ensureMapFillColor(secondary, "#D1D5DB", 0.08), "#FFFFFF"],
    outline,
    strongOutline: outline,
    mapBg: "#070709",
    noDataFill: "#F5F5F6",
    noDataStroke: "rgba(11,11,13,0.28)",
    low: mixColors(mapBase, "#FFFFFF", 0.7),
    mid: mixColors(mapBase, "#FFFFFF", 0.38),
    high: mixColors(mapBase, "#0B0B0D", luminance(mapBase) < 58 ? 0.04 : 0.22),
  };
};

export const inchesToFeet = (value) => {
  const inches = Number(value);
  if (!Number.isFinite(inches) || inches <= 0) return "--";
  return `${Math.floor(inches / 12)}'${Math.round(inches % 12)}"`;
};

export const BODY_PROFILE_BUCKETS = [
  { key: "trenches", label: "Line", groups: ["OL", "DL"] },
  { key: "box", label: "Box", groups: ["QB", "RB", "TE", "LB"] },
  { key: "space", label: "Skill", groups: ["WR", "DB"] },
];

export const weightedAverage = (items, field) => {
  const totals = items.reduce(
    (acc, item) => {
      const value = Number(item[field]);
      const count = Number(item.count);
      if (!Number.isFinite(value) || !Number.isFinite(count) || count <= 0) return acc;
      return {
        value: acc.value + value * count,
        count: acc.count + count,
      };
    },
    { value: 0, count: 0 }
  );

  return totals.count ? totals.value / totals.count : null;
};

export const CLASS_PIPELINE_ORDER = ["Fr.", "So.", "Jr.", "Sr.", "Gr."];
