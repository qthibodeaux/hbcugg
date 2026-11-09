export const PASS_DEFENSE_SEASON = 2026;

export const PASS_DEFENSE_VISUALS = [
  { id: "PD01", title: "Pass-defense overview" },
  { id: "PD02", title: "First-down foundations" },
  { id: "PD03", title: "Behind the sticks", blocked: "Pass-only third-and-long conversion opportunities and rates have not been published. All third downs are not a substitute." },
  { id: "PD04", title: "Red-zone resistance", alternate: true },
  { id: "PD05", title: "Closing time" },
  { id: "PD06", title: "Halftime response" },
  { id: "PD07", title: "Air yards / YAC", blocked: "The air-yard component on the same charted-completion cohort as YAC has not been published. Different denominators cannot be stacked." },
  { id: "PD08", title: "Depth / direction" },
  { id: "PD09", title: "WR / TE / RB matchups" },
  { id: "PD10", title: "Situational overview" },
  { id: "PD11", title: "Defensive contributors" },
  { id: "PD12", title: "Explosive prevention", blocked: "The share of passing yards supplied by 20+ completions has not been published on the matching cohort. No scatterplot is available yet." },
  { id: "PD13", title: "Weekly trajectory" },
];

export const OVERVIEW_METRICS = [
  { id: "ball_disruption_rate", label: "Attempts disrupted: PBU or INT", unit: "pct", better: "higher" },
  { id: "epa_per_pass", label: "EPA allowed per pass dropback", unit: "epa", fullOnly: true, source: "advanced" },
  { id: "success_rate_pass", label: "Passing success allowed", unit: "pct", fullOnly: true, source: "advanced" },
  { id: "explosive_rate_pass", label: "16+ passing explosive rate", unit: "pct", fullOnly: true, source: "advanced" },
];

export const TRAJECTORY_METRICS = [
  { id: "completion_rate", label: "Completion rate allowed", unit: "pct" },
  { id: "success_allowed", label: "Passing success allowed", unit: "pct" },
  { id: "explosive_20_rate", label: "20+ gains per attempt", unit: "pct" },
  { id: "epa_allowed", label: "EPA allowed per pass attempt (sacks excluded)", unit: "epa" },
];

export const CONTRIBUTOR_ROLES = [
  { id: "sacks", label: "Sacks", fullOnly: true },
  { id: "brup", label: "Pass break-ups", fullOnly: true },
  { id: "int", label: "Interceptions", fullOnly: true },
  { id: "catches_tackled", label: "Catches tackled" },
];

export const SITUATIONS = [
  ["down_1", "First down"], ["down_2", "Second down"], ["down_3", "Third down"],
  ["down_4", "Fourth down"], ["passing_down", "Passing downs"], ["standard_down", "Standard downs"],
  ["red_zone", "Red zone"], ["goal_to_go", "Goal to go"], ["two_minute", "Two-minute"],
  ["middle_8", "Middle eight"], ["late_close", "Late and close"], ["overtime", "Overtime"],
];

export const INITIAL_PASS_DEFENSE_SELECTION = {
  visual: "PD01", scope: "all", overview: "ball_disruption_rate", trajectory: "completion_rate",
  situation: "down_1", role: "sacks", teamId: "swacjsu",
};

export const fullOnlySelection = (selection) => selection.visual === "PD08"
  || (selection.visual === "PD01" && OVERVIEW_METRICS.find((m) => m.id === selection.overview)?.fullOnly)
  || (selection.visual === "PD11" && CONTRIBUTOR_ROLES.find((r) => r.id === selection.role)?.fullOnly);

export const effectivePassDefenseScope = (selection) => fullOnlySelection(selection) ? "all" : selection.scope;

export const passDefenseExtraSource = (selection) => {
  if (selection.visual === "PD01" && fullOnlySelection(selection)) return "advanced";
  if (selection.visual === "PD08") return "spatial";
  if (selection.visual === "PD09") return "receiving";
  if (selection.visual === "PD11") return selection.role === "catches_tackled" ? "finishing" : "counting";
  return null;
};

export const formatPassDefenseValue = (value, unit = "pct") => {
  if (!Number.isFinite(value)) return "Unavailable";
  if (unit === "pct") return `${(value * 100).toFixed(1)}%`;
  if (unit === "epa") return `${value > 0 ? "+" : ""}${value.toFixed(3)}`;
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
};
