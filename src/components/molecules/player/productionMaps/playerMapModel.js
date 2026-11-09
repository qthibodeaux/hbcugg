// Legacy estimates are retained for profiles without spatial payloads. ZONE_WEIGHTS distributes totals; it is not observed per-lane production. See Passing Grid Architecture.md and Backend Notes 2026-10-30.md in pages/game-center/md.


export const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

export const metric = (value, digits = 0) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return Number(value).toFixed(digits).replace(/\.0$/, "");
};

export const getPosition = (player) =>
  String(player?.position_group ?? player?.position ?? player?.position_abbr ?? "ATH").toUpperCase();

export const getComponent = (player, key) => Number(player?.season_components?.[key] ?? 0);

export const POSITION_GROUPS = {
  PASS: new Set(["QB", "WR", "TE"]),
  RUN: new Set(["RB", "FB"]),
  DEF: new Set(["DL", "DE", "DT", "EDGE", "LB", "OLB", "ILB", "DB", "CB", "S", "SAF"]),
  OL: new Set(["OL", "OT", "OG", "C", "G", "T"]),
  K: new Set(["K", "PK"]),
  P: new Set(["P"]),
  ST: new Set(["KO", "LS", "PR", "KR"]),
};

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 };
}

export function getCellColor(comp, att, primaryColor) {
  if (att === 0) return "transparent";
  const rate = comp / att;
  const rgb = hexToRgb(primaryColor);
  const opacity = 0.15 + rate * 0.65;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

export function getCellTextColor(comp, att) {
  if (att === 0) return "#71717A";
  const rate = comp / att;
  return rate >= 0.5 ? "#FFFFFF" : "#F4F4F5";
}

const FIELD_MAP_DIRECTION = { L: "left", M: "middle", R: "right" };

export const buildRealGrid = (cells) => {
  const grid = {
    deep: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } },
    medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } },
    short: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } },
  };
  cells.forEach((cell) => {
    const dirKey = FIELD_MAP_DIRECTION[cell.direction] ?? cell.direction;
    if (!grid[cell.depth]?.[dirKey]) return;
    grid[cell.depth][dirKey] = { comp: cell.completions, att: cell.attempts, yards: cell.yards };
  });
  return grid;
};

export const ZONE_WEIGHTS = [
  { key: "left", label: "LEFT", carryShare: 0.3, yardShare: 0.26, olShare: 0.62 },
  { key: "middle", label: "MIDDLE", carryShare: 0.42, yardShare: 0.42, olShare: 0.72 },
  { key: "right", label: "RIGHT", carryShare: 0.28, yardShare: 0.32, olShare: 0.58 },
];

export const zoneStatsFor = (zone, noData = false) => {
  if (noData) return [{ label: "CAR", value: "—" }, { label: "YDS", value: "—" }];
  const stats = [
    { label: "CAR", value: zone.carries },
    { label: "YDS", value: zone.netYards },
  ];
  if (zone.td > 0) stats.push({ label: "TD", value: zone.td });
  if (zone.fumbles > 0) stats.push({ label: "FB", value: zone.fumbles });
  return stats;
};

export const HAVOC_TYPES = [
  { type: "tfl", label: "TFL" },
  { type: "sack", label: "SACK" },
  { type: "qb_hurry", label: "QBH" },
  { type: "forced_fumble", label: "FF" },
  { type: "pass_breakup", label: "PD" },
  { type: "interception", label: "INT" },
];

export const ZONE_RANGE = { left: [0, 100 / 3], middle: [100 / 3, 200 / 3], right: [200 / 3, 100] };

export const ZONE_ORDER = ["left", "middle", "right"];

export const RUSH_DIRECTIONS = [
  { key: "L", label: "LEFT" },
  { key: "M", label: "MIDDLE" },
  { key: "R", label: "RIGHT" },
];

export const KIND_LABEL = { passing: "PASS", rushing: "RUSH", receiving: "REC" };

export const KIND_HEADLINE = { passing: "Passing", rushing: "Rushing", receiving: "Receiving" };

export const COMPONENT_TO_VIEW = { passing_production: "passing", rushing_production: "rushing", receiving_production: "receiving" };
