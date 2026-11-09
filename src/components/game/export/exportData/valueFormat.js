// Shared export missing-value, numeric, signed/rate and player-name formatting.

export const DASH = "—";

export const num = (v) => (v == null ? DASH : String(v));

export const rate1 = (v) => (v == null ? DASH : Number(v).toFixed(1));

export const signed1 = (v) => (v == null ? DASH : `${v > 0 ? "+" : ""}${Number(v).toFixed(1)}`);

export const signed2 = (v) => (v == null ? DASH : `${v > 0 ? "+" : ""}${Number(v).toFixed(2)}`);

export const pct0 = (v) => (v == null ? DASH : `${Math.round(Number(v) * 100)}%`);

export const asNum = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);

export const shortName = (raw) => {
  const str = String(raw ?? "").trim();
  if (!str) return DASH;
  if (str.includes(",")) {
    const [last, first] = str.split(",");
    return `${(first ?? "").trim().charAt(0).toUpperCase()}.${(last ?? "").trim()}`;
  }
  const parts = str.split(/\s+/);
  if (parts.length < 2) return str;
  return `${parts[0].charAt(0).toUpperCase()}.${parts.slice(1).join(" ")}`;
};
