export const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));

export const round1 = (v) => Math.round(v * 10) / 10;

const RADAR_AXES = {
  QB: ["Accuracy", "Ball Security", "Explosiveness", "Pressure Response", "Mobility", "Efficiency"],
  SKILL: ["Opportunity", "Explosiveness", "Efficiency", "Reliability", "Big-Play Rate", "Versatility"],
  DEFENSE: ["Havoc", "Tackle Volume", "Pass Rush", "Coverage", "Run Defense", "Discipline"],
  ST: ["Accuracy", "Leg Strength", "Consistency", "Clutch"],
};

const familyFor = (position) => {
  if (position === "QB") return "QB";
  if (["RB", "FB", "WR", "TE"].includes(position)) return "SKILL";
  if (["DL", "LB", "DB"].includes(position)) return "DEFENSE";
  return "ST";
};

export const buildPercentileRadar = (player) => {
  const position = String(player?.position_group ?? "ATH").toUpperCase();
  const family = familyFor(position);
  const labels = RADAR_AXES[family];
  const signal = Math.max(0, Number(player?.total_production ?? player?.par ?? 8));

  return labels.map((label, i) => ({
    label,
    percentile: Math.round(clamp(35 + signal * (0.8 + 0.15 * i) + (i % 3) * 4, 8, 99)),
  }));
};

const humanize = (key) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const SITUATIONAL_BUILDERS = {
  rushing: (signal) => ({
    red_zone_attempts: Math.round(clamp(3 + signal * 0.08, 1, 12)),
    red_zone_yards: Math.round(clamp(10 + signal * 0.3, 3, 40)),
    red_zone_touchdowns: Math.round(clamp(signal * 0.05, 0, 8)),
    goal_line_attempts: Math.round(clamp(2 + signal * 0.05, 0, 8)),
    goal_line_touchdowns: Math.round(clamp(signal * 0.03, 0, 5)),
  }),
  passing: (signal) => ({
    red_zone_attempts: Math.round(clamp(5 + signal * 0.1, 2, 18)),
    red_zone_completions: Math.round(clamp(3 + signal * 0.08, 1, 14)),
    red_zone_yards: Math.round(clamp(20 + signal * 0.5, 8, 80)),
    red_zone_touchdowns: Math.round(clamp(signal * 0.08, 0, 10)),
    third_down_attempts: Math.round(clamp(9 + signal * 0.15, 3, 28)),
    third_down_completions: Math.round(clamp(5 + signal * 0.1, 2, 18)),
    pressure_attempts: Math.round(clamp(7 + signal * 0.12, 3, 24)),
    pressure_completions: Math.round(clamp(3 + signal * 0.06, 1, 12)),
    pressure_yards: Math.round(clamp(18 + signal * 0.3, 5, 60)),
  }),
  receiving: (signal) => ({
    red_zone_targets: Math.round(clamp(3 + signal * 0.08, 1, 12)),
    red_zone_receptions: Math.round(clamp(2 + signal * 0.06, 0, 9)),
    red_zone_yards: Math.round(clamp(12 + signal * 0.25, 3, 40)),
    red_zone_touchdowns: Math.round(clamp(signal * 0.05, 0, 7)),
    third_down_targets: Math.round(clamp(4 + signal * 0.1, 1, 15)),
    third_down_receptions: Math.round(clamp(3 + signal * 0.07, 1, 10)),
    first_down_receptions: Math.round(clamp(6 + signal * 0.15, 2, 20)),
  }),
  defense: (signal) => ({
    third_down_stops: Math.round(clamp(2 + signal * 0.08, 0, 10)),
    clutch_stops: Math.round(clamp(1 + signal * 0.05, 0, 6)),
    sacks_third_down: round1(clamp(signal * 0.03, 0, 4)),
    tfl_third_down: round1(clamp(signal * 0.04, 0, 5)),
    red_zone_disruptions: Math.round(clamp(signal * 0.05, 0, 6)),
  }),
};

const SITUATIONAL_CATEGORIES = {
  QB: ["passing", "rushing"], RB: ["rushing", "receiving"], FB: ["rushing", "receiving"],
  WR: ["receiving", "rushing"], TE: ["receiving"],
  DL: ["defense"], LB: ["defense"], DB: ["defense"],
};

export const buildSituationalSplits = (player) => {
  const position = String(player?.position_group ?? "ATH").toUpperCase();
  const categories = SITUATIONAL_CATEGORIES[position] ?? ["defense"];
  const signal = Math.max(0, Number(player?.total_production ?? player?.par ?? 8));

  return categories.map((key) => {
    const stats = SITUATIONAL_BUILDERS[key](signal);
    return {
      key,
      label: humanize(key),
      fields: Object.entries(stats).map(([fieldKey, value]) => ({ key: fieldKey, label: humanize(fieldKey), value })),
    };
  });
};
