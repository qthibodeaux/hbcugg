

export const isLightColor = (hex) => {
  const value = String(hex || "").replace("#", "");
  if (value.length !== 6) return false;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 170;
};

export const formatHeightWeight = (player) => {
  const height = Number(player.height);
  const weight = Number(player.weight);
  const h = Number.isFinite(height) && height > 0 ? `${Math.floor(height / 12)}'${height % 12}"` : "--";
  const w = Number.isFinite(weight) && weight > 0 ? `${weight}` : "--";
  return { h, w };
};

export const getPosition = (player) => player.position_abbr || player.position || player.position_group || "--";

export const getPlayerNumber = (player) => player.jersey_number ?? player.jersey ?? null;

const isPlaceholderName = (value) => /^PERS_\d+$/i.test(String(value || ""));

const toTitleCase = (value) =>
  String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const nameFromImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  const fileName = decodeURIComponent(String(imageUrl).split("/").pop() || "")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/^\d+[_-]+/, "")
    .replace(/\?.*$/, "");
  const cleaned = toTitleCase(fileName);
  return cleaned || null;
};

export const getDisplayName = (player) => {
  const direct = player.name_display || player.full_name || [player.first_name, player.last_name].filter(Boolean).join(" ");
  if (direct && !isPlaceholderName(direct)) return direct;
  return nameFromImageUrl(player.image_url) || direct || "Unknown Player";
};

export const splitDisplayName = (name) => {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { first: parts[0] || "Unknown", last: "" };
  return {
    first: parts.slice(0, -1).join(" "),
    last: parts[parts.length - 1],
  };
};

const CLASS_YEAR_LABELS = { 1: "FR", 2: "SO", 3: "JR", 4: "SR", 5: "GR" };

export const formatClassYear = (classYear) => {
  if (classYear == null || classYear === "") return "--";
  const num = Number(classYear);
  if (Number.isFinite(num) && CLASS_YEAR_LABELS[num]) return CLASS_YEAR_LABELS[num];
  return String(classYear).toUpperCase();
};

export const getSideFields = (position, classYear, heightWeight) => [
  ["POS", position],
  ["HT", heightWeight.h],
  ["CLASS", classYear],
  ["WT", heightWeight.w],
];

export const shouldPanName = (value) => {
  const text = String(value || "");
  return text.length > 15 || (text.length > 12 && text.includes("-"));
};
