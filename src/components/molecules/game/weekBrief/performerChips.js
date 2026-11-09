import { normalizeTeamKey } from "./briefBlockModel";

// Existing position-specific raw-field chips for Week Central notable performers.

const DASH = "\u2014";

const num = (v) => (v == null ? DASH : Number.isInteger(Number(v)) ? String(v) : Number(v).toFixed(1));

const rate1 = (v) => (v == null ? DASH : Number(v).toFixed(1));

const rate2 = (v) => (v == null ? DASH : Number(v).toFixed(2));

const pctOf1 = (v) => (v == null ? DASH : `${Math.round(Number(v) * 100)}%`);

const ratio = (a, b) => (a == null || b == null ? DASH : `${a}-${b}`);

const CATEGORY_BY_POSITION = {
  QB: "passing", RB: "rushing", FB: "rushing", WR: "receiving", TE: "receiving",
  DB: "defense", CB: "defense", S: "defense", LB: "defense", DL: "defense", DE: "defense", DT: "defense", DEF: "defense",
};

const CHIPS_BY_CATEGORY = {
  passing: (p) => [
    ["Cmp/ Att", ratio(p.completions, p.attempts)],
    ["Yds", num(p.yards)],
    ["Cmp Rt", pctOf1(p.completion_pct)],
    ["Yd/ Att", rate1(p.yards_per_attempt)],
    ["TD", num(p.touchdowns)],
    ["INT", num(p.interceptions)],
    ["Sacks", num(p.sacks_taken)],
    ["aDOT", rate1(p.adot)],
    ["EPA/ Play", rate2(p.epa_per_play)],
    ["Succ Rt", pctOf1(p.success_rate)],
    ["3rd Dn", p.third_down_breakdown?.attempts ? pctOf1(p.third_down_breakdown.completions / p.third_down_breakdown.attempts) : DASH],
    ["Deep C-A", ratio(p.deep_completions, p.deep_attempts)],
  ],
  rushing: (p) => [
    ["Car-Yds", ratio(p.attempts, p.yards)],
    ["Yd/ Car", rate1(p.yards_per_carry)],
    ["TD", num(p.touchdowns)],
    ["Long", num(p.long)],
    ["Succ Rt", pctOf1(p.success_rate)],
    ["EPA/ Car", rate2(p.epa_per_play)],
    ["LY/ Car", rate1(p.line_yards_per_carry)],
    ["Opp Rt", pctOf1(p.opportunity_rate)],
    ["Hlt/ Opp", rate1(p.highlight_yards_per_opportunity)],
    ["Stuff Rt", pctOf1(p.stuff_rate)],
    ["Power Rt", pctOf1(p.power_rate)],
    ["Expl 10+", num(p.explosive_carries_10)],
  ],
  receiving: (p) => [
    ["Ct/ Tg", ratio(p.receptions, p.targets)],
    ["Yds", num(p.yards)],
    ["Catch Rt", pctOf1(p.catch_rate)],
    ["Yd/ Ch", rate1(p.yards_per_reception)],
    ["Yd/ Tg", rate1(p.yards_per_target)],
    ["TD", num(p.touchdowns)],
    ["Deep C-T", ratio(p.deep_receptions, p.deep_targets)],
    ["Fum", num(p.fumbles)],
  ],
  defense: (p) => [
    ["Tkl", num(p.tackles)],
    ["Solo", num(p.solo_tackles)],
    ["TFL", num(p.tfl)],
    ["Sacks", num(p.sacks)],
    ["INT", num(p.interceptions)],
    ["PD", num(p.passes_defended)],
    ["FF", num(p.forced_fumbles)],
    ["FR", num(p.fumble_recoveries)],
    ["Hrry", num(p.qb_hurries)],
    ["3rd Stp", num(p.third_down_stops)],
    ["Clutch", num(p.clutch_stops)],
    ["RZ Dsr", num(p.red_zone_disruptions)],
  ],
};

const findStatRow = (parsedGame, teamId, category, playerKey) => {
  const rows = parsedGame?.individual_stats?.[normalizeTeamKey(teamId)]?.[category];
  return Array.isArray(rows) ? rows.find((row) => row.player_key === playerKey) ?? null : null;
};

export const buildDesktopChips = (parsedGame, performer) => {
  const primary = CATEGORY_BY_POSITION[String(performer.position ?? "").toUpperCase()];
  const order = primary ? [primary, ...Object.keys(CHIPS_BY_CATEGORY).filter((c) => c !== primary)] : Object.keys(CHIPS_BY_CATEGORY);
  const category = order.find((cat) => findStatRow(parsedGame, performer.teamId, cat, performer.key));
  if (!category) return [];
  const row = findStatRow(parsedGame, performer.teamId, category, performer.key);
  const chips = CHIPS_BY_CATEGORY[category](row).map(([label, value]) => ({ label, value }));
  // A receiver's or back's second line, when he had one.
  const secondary = category === "receiving" ? "rushing" : category === "rushing" ? "receiving" : null;
  const secondRow = secondary ? findStatRow(parsedGame, performer.teamId, secondary, performer.key) : null;
  if (secondRow && chips.length < 12) {
    const extra = secondary === "rushing"
      ? [["Car-Yds", ratio(secondRow.attempts, secondRow.yards)], ["Rush TD", num(secondRow.touchdowns)], ["Yd/ Car", rate1(secondRow.yards_per_carry)], ["Rush Long", num(secondRow.long)]]
      : [["Ct/ Tg", ratio(secondRow.receptions, secondRow.targets)], ["Rec Yds", num(secondRow.yards)], ["Rec TD", num(secondRow.touchdowns)], ["Yd/ Ch", rate1(secondRow.yards_per_reception)]];
    extra.forEach(([label, value]) => { if (chips.length < 12) chips.push({ label, value }); });
  }
  return chips;
};
