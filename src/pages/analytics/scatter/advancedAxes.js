import { val, diff } from "./baseAxes";

// Advanced-axis field catalog, side/family picker groups and source read rules.

const ADV_FIELDS = [
  // Passing
  { f: "epa_per_pass", label: "EPA / Dropback", unit: "num", fam: "passing", dir: "up" },
  { f: "success_rate_pass", label: "Pass Success %", unit: "pct", fam: "passing", dir: "up" },
  { f: "explosive_rate_pass", label: "Pass Explosive %", unit: "pct", fam: "passing", dir: "up" },
  { f: "sack_rate", label: "Sack Rate", unit: "pct", fam: "passing", dir: "down" },
  { f: "dropbacks", label: "Dropbacks", unit: "num1", fam: "passing", dir: "none" },
  // Rushing
  { f: "epa_per_rush", label: "EPA / Rush", unit: "num", fam: "rushing", dir: "up" },
  { f: "success_rate_rush", label: "Rush Success %", unit: "pct", fam: "rushing", dir: "up" },
  { f: "explosive_rate_rush", label: "Rush Explosive %", unit: "pct", fam: "rushing", dir: "up" },
  { f: "opportunity_rate", label: "Opportunity Rate", unit: "pct", fam: "rushing", dir: "up" },
  { f: "stuff_rate", label: "Stuffed %", unit: "pct", fam: "rushing", dir: "down" },
  { f: "power_success", label: "Power Success %", unit: "pct", fam: "rushing", dir: "up" },
  { f: "power_attempts", label: "Power Attempts", unit: "num1", fam: "rushing", dir: "none" },
  { f: "line_yards", label: "Line Yards", unit: "num", fam: "rushing", dir: "up" },
  { f: "second_level_yards", label: "Second-Level Yards", unit: "num", fam: "rushing", dir: "up" },
  { f: "open_field_yards", label: "Open-Field Yards", unit: "num", fam: "rushing", dir: "up" },
  { f: "highlight_yards", label: "Highlight Yards", unit: "num", fam: "rushing", dir: "up" },
  { f: "carries", label: "Carries", unit: "num1", fam: "rushing", dir: "none" },
  { f: "f10_run_rate", label: "Run Rate on 1st & 10", unit: "pct", fam: "rushing", dir: "none" },
  { f: "f10_rush_success_rate", label: "Run Success on 1st & 10", unit: "pct", fam: "rushing", dir: "up" },
  { f: "rush_success_first_half", label: "1st-Half Run Success", unit: "pct", fam: "rushing", dir: "up" },
  { f: "rush_success_second_half", label: "2nd-Half Run Success", unit: "pct", fam: "rushing", dir: "up" },
  { f: "qb_share_of_carries", label: "QB Share of Carries", unit: "pct", fam: "rushing", dir: "none", offOnly: true },
  { f: "qb_share_of_rush_yards", label: "QB Share of Rush Yards", unit: "pct", fam: "rushing", dir: "none", offOnly: true },
  // Other
  { f: "epa_per_play", label: "EPA / Play", unit: "num", fam: "other", dir: "up" },
  { f: "adj_epa_per_play", label: "Adj EPA / Play", unit: "num", fam: "other", dir: "up" },
  { f: "competitive_epa_per_play", label: "EPA / Play (No Garbage)", unit: "num", fam: "other", dir: "up" },
  { f: "early_down_epa", label: "Early-Down EPA", unit: "num", fam: "other", dir: "up" },
  { f: "epa_per_drive", label: "EPA / Drive", unit: "num", fam: "other", dir: "up" },
  { f: "total_epa", label: "Total EPA", unit: "num1", fam: "other", dir: "up" },
  { f: "explosiveness", label: "Explosiveness", unit: "num", fam: "other", dir: "up" },
  { f: "success_rate", label: "Success %", unit: "pct", fam: "other", dir: "up" },
  { f: "standard_down_success", label: "Standard-Down Success %", unit: "pct", fam: "other", dir: "up" },
  { f: "passing_down_success", label: "Passing-Down Success %", unit: "pct", fam: "other", dir: "up" },
  { f: "third_fourth_success", label: "3rd/4th-Down Success %", unit: "pct", fam: "other", dir: "up" },
  { f: "third_down_distance", label: "Avg 3rd-Down Distance", unit: "num1", fam: "other", dir: "down" },
  { f: "third_short_share", label: "3rd-and-Short Share (1-3 yds)", unit: "pct", fam: "other", dir: "up" },
  { f: "third_short_conversion", label: "3rd-and-Short Conversion", unit: "pct", fam: "other", dir: "up" },
  { f: "third_long_share", label: "3rd-and-Long Share (7+ yds)", unit: "pct", fam: "other", dir: "down" },
  { f: "third_long_conversion", label: "3rd-and-Long Conversion", unit: "pct", fam: "other", dir: "up" },
  { f: "third_down_attempts", label: "3rd-Down Attempts", unit: "int", fam: "other", dir: "none" },
  { f: "fourth_down_go_rate", label: "4th-Down Go Rate", unit: "pct", fam: "other", dir: "none", offOnly: true },
  { f: "fourth_down_conversion", label: "4th-Down Conversion", unit: "pct", fam: "other", dir: "up" },
  { f: "fourth_down_attempts", label: "4th-Down Attempts", unit: "int", fam: "other", dir: "none" },
  { f: "plays_20_plus", label: "20+ Yard Plays", unit: "int", fam: "other", dir: "up" },
  { f: "plays_25_plus", label: "25+ Yard Plays", unit: "int", fam: "other", dir: "up" },
  { f: "plays_40_plus", label: "40+ Yard Plays", unit: "int", fam: "other", dir: "up" },
  { f: "success_rate_first_half", label: "1st-Half Success %", unit: "pct", fam: "other", dir: "up" },
  { f: "success_rate_second_half", label: "2nd-Half Success %", unit: "pct", fam: "other", dir: "up" },
  { f: "explosive_rate", label: "Explosive %", unit: "pct", fam: "other", dir: "up" },
  { f: "points_per_opportunity", label: "Points / Opportunity", unit: "num", fam: "other", dir: "up" },
  { f: "red_zone_td_rate", label: "Red-Zone TD %", unit: "pct", fam: "other", dir: "up" },
  { f: "scoring_opportunities", label: "Scoring Opportunities", unit: "num1", fam: "other", dir: "up" },
  { f: "available_yards_pct", label: "Available Yards %", unit: "pct", fam: "other", dir: "up" },
  { f: "average_start", label: "Avg Starting Field Position", unit: "num1", fam: "other", dir: "up" },
  { f: "net_field_position", label: "Net Field Position", unit: "num1", fam: "other", dir: "up" },
  { f: "havoc_rate", label: "Havoc %", unit: "pct", fam: "other", dir: "down", own: true },
  { f: "havoc_front_seven", label: "Front-Seven Havoc %", unit: "pct", fam: "other", dir: "down", own: true },
  { f: "havoc_defensive_back", label: "DB Havoc %", unit: "pct", fam: "other", dir: "down", own: true },
  { f: "turnover_luck", label: "Turnover Luck", unit: "num", fam: "other", dir: "up" },
  { f: "penalties_per_game", label: "Penalties / Game", unit: "num1", fam: "other", dir: "down", own: true, noNet: true },
  { f: "penalty_yards_per_game", label: "Penalty Yds / Game", unit: "num1", fam: "other", dir: "down", own: true, noNet: true },
  { f: "plays", label: "Plays", unit: "num1", fam: "other", dir: "none" },
  { f: "drives", label: "Drives", unit: "num1", fam: "other", dir: "none" },
];

const ADV_BY_FIELD = Object.fromEntries(ADV_FIELDS.map((d) => [d.f, d]));

const SIDE_LABEL = { o: "Off", d: "Def", net: "Net" };

const FAM_LABEL = { passing: "Passing", rushing: "Rushing", other: "Other" };

const hasNet = (d) => d.dir === "up" && !d.own && !d.noNet;

export const advAxis = (key) => {
  const [, side, field] = key.split(":");
  const d = ADV_BY_FIELD[field];
  if (!d || !SIDE_LABEL[side]) return null;
  // Lower is better: an offense on a "down" field; a defense on an "up" field
  // (it allowed it) or on its own "down" act (its flags).
  const low = side === "o" ? d.dir === "down" : side === "d" ? (d.own ? d.dir === "down" : d.dir === "up") : false;
  return { key, label: `${SIDE_LABEL[side]} ${d.label}`, unit: side === "net" && d.unit === "pct" ? "pts" : d.unit, low, team: true, adv: { side, field } };
};

export const readAdv = (row, { side, field }) => {
  const o = row?.advanced?.offense?.[field];
  const d = row?.advanced?.defense?.[field];
  if (side === "o") return val(o);
  if (side === "d") return val(d);
  return diff(o, d);
};

export const ADV_AXIS_GROUPS = ["o", "d", "net"].flatMap((side) =>
  ["passing", "rushing", "other"].map((fam) => ({
    label: `${side === "o" ? "Offense" : side === "d" ? "Defense" : "Net"} · ${FAM_LABEL[fam]}`,
    options: ADV_FIELDS.filter((d) => d.fam === fam && (side === "o" || !d.offOnly) && (side !== "net" || hasNet(d))).map((d) => advAxis(`adv:${side}:${d.f}`)),
  })),
).filter((g) => g.options.length);
