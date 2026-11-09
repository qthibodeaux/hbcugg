
// Extracted from the live production panel; existing semantics are preserved.

export const LANES = [
  { key: "left", label: "Left" },
  { key: "middle", label: "Middle" },
  { key: "right", label: "Right" },
];

const normCategory = (raw) => {
  const c = String(raw ?? "").toUpperCase().replace(/[^A-Z_]/g, "");
  if (c === "PASS_DEFENSED" || c === "PD" || c === "PBU") return "PBU";
  if (c === "FORCED_FUMBLE" || c === "FF") return "FF";
  if (c === "INTERCEPTION" || c === "INT") return "INT";
  if (c === "SACK") return "SACK";
  if (c === "TFL") return "TFL";
  return null;
};

/** Backend rows → plotted events, dropping anything without a lane, a y, or a known category. */
export const toHavocEvents = (rows) =>
  (Array.isArray(rows) ? rows : [])
    .map((r) => ({
      id: r.play_id ?? null,
      cat: normCategory(r.category),
      lane: String(r.lane ?? "").toLowerCase(),
      y: typeof r.yards === "number" ? r.yards : typeof r.yards_from_los === "number" ? r.yards_from_los : null,
    }))
    .filter((e) => e.cat && LANES.some((l) => l.key === e.lane) && e.y != null);
