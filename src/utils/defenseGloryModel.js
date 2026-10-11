/**
 * DefenseGloryModel.js
 * 
 * Purpose: Contextualize defensive stats using HBCU-specific percentiles and "Glory" logic.
 * This model transforms raw game stats into meaningful grades and narrative indicators.
 */

export const DEFENSE_THRESHOLDS = {
  havoc_rate: { elite: 0.18, great: 0.15, good: 0.12, poor: 0.08 },
  stuff_rate: { elite: 0.25, great: 0.20, good: 0.15, poor: 0.10 },
  stop_rate: { elite: 0.65, great: 0.60, good: 0.55, poor: 0.45 }, // 1 - Success Rate
  third_down_stop: { elite: 0.70, great: 0.60, good: 0.50, poor: 0.40 }, // 1 - 3D Conversion Rate Allowed
  late_down_stop: { elite: 0.70, great: 0.60, good: 0.50, poor: 0.40 }, // 1 - Success Rate Late
  epa_allowed: { elite: -0.15, great: -0.05, good: 0.05, poor: 0.15 },
  yds_per_target: { elite: 6.0, great: 7.5, good: 8.5, poor: 10.5 },
  red_zone_td_pct: { elite: 0.35, great: 0.45, good: 0.60, poor: 0.75 }
};

/**
 * Assigns a grade based on metric value and direction (isHigherBetter)
 */
export const computeGrade = (metric, value) => {
  const thresholds = DEFENSE_THRESHOLDS[metric];
  if (!thresholds) return { grade: "B", color: "#4299E1" };

  const isLowerBetter = ["epa_allowed", "yds_per_target", "red_zone_td_pct"].includes(metric);

  if (isLowerBetter) {
    if (value <= thresholds.elite) return { grade: "A", color: "#68D391" };
    if (value <= thresholds.great) return { grade: "B", color: "#4299E1" };
    if (value <= thresholds.good) return { grade: "C", color: "#F6AD55" };
    return { grade: "D", color: "#E53E3E" };
  } else {
    if (value >= thresholds.elite) return { grade: "A", color: "#68D391" };
    if (value >= thresholds.great) return { grade: "B", color: "#4299E1" };
    if (value >= thresholds.good) return { grade: "C", color: "#F6AD55" };
    return { grade: "D", color: "#E53E3E" };
  }
};

/**
 * Computes a "Glory Score" (0-100) for a defensive performance
 */
export const computeGloryScore = (advancedStats) => {
  // Logic: Weighted average of key disruption metrics
  const havocWeight = 0.4;
  const successWeight = 0.3;
  const epaWeight = 0.3;

  // Normalized scores (roughly 0-1)
  const havocScore = Math.min(advancedStats.havoc_rate_forced / 0.20, 1.0);
  const successScore = Math.min((1 - advancedStats.success_rate) / 0.70, 1.0);
  const epaScore = Math.max(0, Math.min(1.0, (0.3 - advancedStats.epa_per_play) / 0.5));

  return Math.round((havocScore * havocWeight + successScore * successWeight + epaScore * epaWeight) * 100);
};

/**
 * Generates an editorial subtitle based on the combination of stats
 */
export const getDefensiveIdentity = (stats) => {
  if (stats.havoc_rate_forced > 0.18) return "CHAOS ENGINE";
  if (stats.stuff_rate > 0.25 && stats.success_rate_late_down < 0.30) return "IRON CURTAIN";
  if (stats.red_zone_td_rate < 0.40) return "BEND-DON'T-BREAK";
  if (stats.epa_per_play < -0.10) return "ELITE EFFICIENCY";
  return "STABILIZER UNIT";
};
