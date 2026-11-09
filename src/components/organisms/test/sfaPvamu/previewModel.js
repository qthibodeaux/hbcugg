

// Historical 2025 SFA/PVAMU lab fixture and display scales, preserved from the original comparison.
// This two-depth external-reference fixture is distinct from the app's nine-zone passing-grid contract.

export const statRows = [
  { key: "epaPlay", label: "EPA / PLAY" },
  { key: "successRate", label: "SUCCESS RATE" },
  { key: "epaDropback", label: "EPA / DROPBACK" },
  { key: "epaRush", label: "EPA / RUSH" },
  { key: "explosiveRate", label: "EXPLOSIVE PLAY RATE" },
  { key: "yardsPass", label: "YARDS / DROPBACK" },
  { key: "yardsRush", label: "YARDS / RUSH" },
  { key: "lateDown", label: "LATE DOWN SR" },
  { key: "yardsDrive", label: "YARDS / DRIVE" },
];

export const matchupData = {
  sfaOffense: {
    title: "SFA OFFENSE",
    accent: "#D7444B",
    games: 3,
    metrics: { epaPlay: 0.13, successRate: 0.47, epaDropback: 0.11, epaRush: 0.15, explosiveRate: 0.08, yardsPass: 7.82, yardsRush: 5.82, lateDown: 0.48, yardsDrive: 41.5 },
  },
  sfaDefense: {
    title: "SFA DEFENSE",
    accent: "#D7444B",
    games: 3,
    metrics: { epaPlay: -0.12, successRate: 0.4, epaDropback: -0.11, epaRush: 0.07, explosiveRate: 0.08, yardsPass: 5.87, yardsRush: 6.37, lateDown: 0.34, yardsDrive: 35.9 },
  },
  pvamuOffense: {
    title: "PVAMU OFFENSE",
    accent: "#8D4CC3",
    games: 2,
    metrics: { epaPlay: 0.27, successRate: 0.51, epaDropback: 0.32, epaRush: 0.23, explosiveRate: 0.08, yardsPass: 8.14, yardsRush: 7.96, lateDown: 0.5, yardsDrive: 39.9 },
  },
  pvamuDefense: {
    title: "PVAMU DEFENSE",
    accent: "#8D4CC3",
    games: 2,
    metrics: { epaPlay: 0.04, successRate: 0.45, epaDropback: -0.15, epaRush: 0.18, explosiveRate: 0.06, yardsPass: 5.53, yardsRush: 6.56, lateDown: 0.43, yardsDrive: 42.8 },
  },
};

export const fmtSigned = (value, decimals = 2) => {
  const suffix = value >= 0 ? "+" : "";
  return `${suffix}${value.toFixed(decimals)}`;
};

const fmtPct = (value) => `${Math.round(value * 100)}%`;

export const EPA_ROWS = new Set(["epaPlay", "epaDropback", "epaRush"]);

export const formatMetric = (rowKey, value) => {
  if (rowKey === "successRate" || rowKey === "explosiveRate" || rowKey === "lateDown") {
    return fmtPct(value);
  }
  if (EPA_ROWS.has(rowKey)) {
    return fmtSigned(value, 2);
  }
  if (rowKey === "yardsPass" || rowKey === "yardsRush") {
    return value.toFixed(2);
  }
  if (rowKey === "yardsDrive") {
    return value.toFixed(1);
  }
  return String(value);
};

export const LANES = ["L", "M", "R"];

export const directionData = {
  sfaOffense: {
    rush: [{ epa: 5.66, car: 31, yds: 201 }, { epa: 8.95, car: 59, yds: 299 }, { epa: 2.21, car: 24, yds: 163 }],
    deep: [{ epa: 0.26, comp: 1, att: 3, yds: 33 }, { epa: -0.5, comp: 0, att: 1, yds: 0 }, { epa: -6.0, comp: 0, att: 5, yds: 0 }],
    short: [{ epa: -2.58, comp: 18, att: 31, yds: 151 }, { epa: 4.36, comp: 11, att: 13, yds: 180 }, { epa: 5.98, comp: 22, att: 31, yds: 223 }],
  },
  sfaDefense: {
    rush: [{ epa: 1.66, car: 13, yds: 104 }, { epa: 4.29, car: 36, yds: 234 }, { epa: -1.46, car: 16, yds: 76 }],
    deep: [{ epa: 5.03, comp: 1, att: 2, yds: 41 }, { epa: -2.18, comp: 0, att: 1, yds: 0 }, { epa: 11.28, comp: 5, att: 10, yds: 149 }],
    short: [{ epa: 10.97, comp: 20, att: 25, yds: 188 }, { epa: -0.42, comp: 6, att: 7, yds: 40 }, { epa: -3.33, comp: 18, att: 38, yds: 164 }],
  },
  pvamuOffense: {
    rush: [{ epa: 3.08, car: 12, yds: 96 }, { epa: 3.34, car: 31, yds: 242 }, { epa: 3.9, car: 13, yds: 112 }],
    deep: [{ epa: 0.0, comp: 0, att: 0, yds: 0 }, { epa: 1.98, comp: 1, att: 1, yds: 24 }, { epa: 8.56, comp: 4, att: 4, yds: 138 }],
    short: [{ epa: -1.46, comp: 14, att: 20, yds: 115 }, { epa: -1.9, comp: 9, att: 17, yds: 65 }, { epa: 13.48, comp: 19, att: 28, yds: 199 }],
  },
  pvamuDefense: {
    rush: [{ epa: 1.09, car: 19, yds: 97 }, { epa: 4.22, car: 40, yds: 203 }, { epa: 4.91, car: 22, yds: 186 }],
    deep: [{ epa: 0.43, comp: 1, att: 3, yds: 32 }, { epa: 1.65, comp: 1, att: 2, yds: 30 }, { epa: 0.87, comp: 1, att: 2, yds: 22 }],
    short: [{ epa: -1.79, comp: 9, att: 17, yds: 71 }, { epa: -1.0, comp: 5, att: 8, yds: 53 }, { epa: -2.8, comp: 13, att: 24, yds: 105 }],
  },
};

const maxAbs = (kind) => Math.max(0.01, ...Object.values(directionData).flatMap((d) => d[kind].map((c) => Math.abs(c.epa))));

export const EPA_MAX = { rush: maxAbs("rush"), pass: Math.max(maxAbs("deep"), maxAbs("short")) };

export const epaTint = (epa, max, isDefense) => {
  if (epa == null || max <= 0) return "rgba(255,255,255,0.03)";
  const t = Math.min(1, Math.abs(epa) / max);
  if (t < 0.05) return "rgba(255,255,255,0.03)";
  const good = isDefense ? epa < 0 : epa > 0;
  const a = (0.12 + 0.42 * t).toFixed(2);
  return good ? `rgba(34,197,94,${a})` : `rgba(239,68,68,${a})`;
};
