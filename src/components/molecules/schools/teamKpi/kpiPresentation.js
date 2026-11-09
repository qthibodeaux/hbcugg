// Team KPI formatting and readable-text policy; season data selection stays in the strip.

export const toV5TeamId = (team) => team?.exportId?.replace(/25$/, "");

export const asPct = (value) => {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return "0%";
  return `${Math.round(n > 1 ? n : n * 100)}%`;
};

export const asNumber = (value, fallback = "-") => {
  if (value == null || value === "") return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return n >= 100 ? Math.round(n).toLocaleString() : n.toFixed(1);
};

export const readableTextColor = (hex) => {
  if (!hex || typeof hex !== 'string') return "#0B0B0D";
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (clean.length !== 6 && clean.length !== 8) return "#0B0B0D";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return "#0B0B0D";
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.58 ? "#0B0B0D" : "#FFFFFF";
};
