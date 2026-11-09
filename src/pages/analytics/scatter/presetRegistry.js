// Scatter preset identities, axis pairs and presentation options shared by charts and tiles.

export const SCATTER_SECTIONS = [
  { id: "team", label: "Team" },
  { id: "rushing", label: "Rushing" },
  { id: "downs", label: "Down & Distance" },
];

export const SCATTER_PRESETS = [
  {
    // The four standard charts (added 2026-10-04) — always shown as buttons.
    id: "off_def_epa", section: "team", label: "Offense vs Defense EPA", standard: true, x: "d_epa_play", y: "o_epa_play",
    flip: { x: true }, tint: true,
    quadrants: ["Good offense, leaky defense", "Good offense, good defense", "Struggling on both sides", "Good defense, struggling offense"],
  },
  {
    id: "havoc_created_conceded", section: "team", label: "Havoc Created vs Conceded", standard: true, x: "havoc_allowed", y: "havoc_forced",
    flip: { x: true }, tint: true,
    quadrants: ["More created · more conceded", "More created · less conceded", "Less created · more conceded", "Less created · less conceded"],
  },
  {
    id: "discipline", section: "team", label: "Discipline", standard: true, x: "o_pen_ypg", y: "d_pen_ypg",
    flip: { x: true, y: true }, tint: true,
    quadrants: ["Clean offense, flagged defense", "Clean on both sides", "Flagged on both sides", "Clean defense, flagged offense"],
  },
  {
    id: "net_success_halves", section: "team", label: "Net Success by Half", standard: true, x: "net_sr_h1", y: "net_sr_h2",
    center: "median", tint: true,
    quadrants: ["Weaker start · stronger finish", "Stronger in both halves", "Weaker in both halves", "Stronger start · weaker finish"],
  },
  // Opponent-adjusted and rate pairs (added 2026-11-08, from the Team Analytics file's adj EPA and success rates).
  {
    id: "off_def_adj_epa", section: "team", label: "Defense vs Offense Adjusted EPA", standard: true, x: "adv:o:adj_epa_per_play", y: "adv:d:adj_epa_per_play",
    flip: { y: true }, tight: true, tint: true,
    quadrants: ["Good defense, struggling offense", "Good offense, good defense", "Struggling on both sides", "Good offense, leaky defense"],
  },
  {
    id: "off_success_adj_epa", section: "team", label: "Offensive Success vs Adjusted EPA", standard: true, x: "adv:o:adj_epa_per_play", y: "adv:o:success_rate",
    tight: true, tint: true,
    quadrants: ["Consistent · low impact", "Consistent · high impact", "Inconsistent · low impact", "Inconsistent · high impact"],
  },
  {
    id: "def_success_adj_epa", section: "team", label: "Defensive Success vs Adjusted EPA", standard: true, x: "adv:d:adj_epa_per_play", y: "adv:d:success_rate",
    flip: { x: true, y: true }, tight: true, tint: true,
    quadrants: ["Wins downs · costly plays", "Wins downs · stingy", "Loses downs · costly plays", "Loses downs · stingy"],
  },
  {
    id: "off_pass_success_epa", section: "team", label: "Offensive Pass Success vs EPA", standard: true, x: "adv:o:epa_per_pass", y: "adv:o:success_rate_pass",
    tight: true, tint: true,
    quadrants: ["Consistent · low impact", "Consistent · high impact", "Inconsistent · low impact", "Inconsistent · high impact"],
  },
  // Rushing — the team charts from the rushing series.
  {
    id: "power_stuffs", section: "rushing", label: "Power & Stuffs", standard: true, x: "stuff_rate", y: "power_success",
    flip: { x: true }, tint: true, center: "median",
    quadrants: ["Converts short · stuffed often", "Converts short · rarely stuffed", "Fails short · stuffed often", "Fails short · rarely stuffed"],
  },
  {
    id: "first_and_ten", section: "rushing", label: "1st & 10", standard: true, x: "f10_rush_sr", y: "f10_run_rate",
    center: "median",
    quadrants: ["Runs a lot · runs struggle", "Runs a lot · runs work", "Throws first · runs struggle", "Throws first · runs work"],
  },
  {
    id: "qb_share", section: "rushing", label: "QB Share", standard: true, x: "qb_share_carries", y: "qb_share_rush_yds",
    center: "median",
    quadrants: ["Few QB runs · big QB yards", "QB-driven run game", "Backs carry it", "Many QB runs · few yards"],
  },
  {
    id: "late_strength", section: "rushing", label: "Late Strength", standard: true, x: "rush_sr_h1", y: "rush_sr_h2",
    tint: true, center: "median",
    quadrants: ["Weaker start · stronger finish", "Strong in both halves", "Weak in both halves", "Stronger start · fades late"],
  },
  // Down & Distance — 3rd and 4th down, offense side.
  {
    id: "third_short", section: "downs", label: "3rd & Short", standard: true, x: "adv:o:third_short_share", y: "adv:o:third_short_conversion",
    center: "median", tint: true,
    quadrants: ["Few short 3rds · converts them", "Lives in 3rd & short · converts", "Few short 3rds · fails them", "Lives in 3rd & short · fails"],
  },
  {
    id: "third_long", section: "downs", label: "3rd & Long", standard: true, x: "adv:o:third_long_share", y: "adv:o:third_long_conversion",
    flip: { x: true }, center: "median", tint: true,
    quadrants: ["Stuck in long 3rds · escapes", "Rarely long · escapes when it is", "Stuck in long 3rds · stalls", "Rarely long · stalls when it is"],
  },
  {
    id: "on_schedule", section: "downs", label: "Staying on Schedule", standard: true, x: "adv:o:third_down_distance", y: "adv:o:third_fourth_success",
    flip: { x: true }, center: "median", tint: true,
    quadrants: ["Long 3rd downs · converts anyway", "Short 3rd downs · converts", "Long 3rd downs · stalls", "Short 3rd downs · stalls"],
  },
  {
    id: "fourth_nerve", section: "downs", label: "4th-Down Nerve", standard: true, x: "adv:o:fourth_down_go_rate", y: "adv:o:fourth_down_conversion",
    center: "median",
    quadrants: ["Picks its spots · converts", "Goes for it · converts", "Picks its spots · fails", "Goes for it · fails"],
  },
  // The original presets.
  { id: "efficiency", label: "Efficiency", x: "net_epa_play", y: "net_success" },
  { id: "havoc", label: "Havoc", x: "havoc_allowed", y: "havoc_forced" },
  { id: "identity", label: "Identity", x: "epa_dropback", y: "epa_rush" },
  { id: "points", label: "Points per Opportunity", x: "ppo_off", y: "ppo_def" },
  { id: "pass_defense", label: "Pass Defense", x: "d_epa_dropback", y: "d_pass_sr" },
];

export const presetFor = (xKey, yKey, id = null) =>
  SCATTER_PRESETS.find((p) => p.id === id && p.x === xKey && p.y === yKey) ??
  SCATTER_PRESETS.find((p) => p.x === xKey && p.y === yKey) ??
  null;
