// Export passing-depth/lane labels and raw cell reads; called and measured depth sets remain distinct.

export const ZONE_DEPTHS = [
  { key: "deep", label: "Deep", range: "13+" },
  { key: "medium", label: "Med", range: "4–12" },
  { key: "short", label: "Short", range: "< 4" },
];

export const CALL_ZONE_DEPTHS = [
  { key: "deep", label: "Deep", range: null },
  { key: "short", label: "Short", range: null },
];

export const ZONE_LANES = [
  { key: "left", label: "Left" },
  { key: "middle", label: "Middle" },
  { key: "right", label: "Right" },
];

export const zoneCell = (grid, depth, lane) => {
  const c = grid?.[depth]?.[lane];
  if (!c) return null;
  return { attempts: c.attempts ?? 0, completions: c.completions ?? 0, yards: c.yards ?? 0 };
};
