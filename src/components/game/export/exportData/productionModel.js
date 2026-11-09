import { productionEntries } from "../../../../utils/gameHelpers";
import { asNum } from "./valueFormat";

// Game export biggest-play and box-score/production adapters.

export const buildBiggestPlays = (game) => {
  const src = game?.game_export?.biggest_plays ?? game?.biggest_plays ?? {};
  const periods = src.regulation || src.overtime ? [["REG", src.regulation], ["OT", src.overtime]] : [["REG", src]];
  const pick = (side, desc) => periods
    .flatMap(([period, block]) => (Array.isArray(block?.[side]) ? block[side].map((p) => ({ ...p, period })) : []))
    .filter((p) => typeof p.epa === "number")
    .sort((a, b) => (desc ? b.epa - a.epa : a.epa - b.epa))
    .slice(0, 3);
  return { positive: pick("positive", true), negative: pick("negative", false) };
};

const rowsOf = (v) => (Array.isArray(v) ? v : v && typeof v === "object" ? Object.values(v) : []);

const productionOf = (game, teamId) => {
  const map = new Map();
  productionEntries(game?.production_scores?.[teamId]).forEach((r) => {
    const entry = { total: r.production_total, components: r.components ?? {} };
    if (r.player_key != null) map.set(r.player_key, entry);
    if (r.name != null) map.set(r.name, entry);
  });
  return (key, name, component) => {
    const e = map.get(key) ?? map.get(name) ?? null;
    const v = e?.components?.[component];
    return typeof v === "number" ? v : null;
  };
};

export const buildBoxscore = (game, teamId) => {
  const ist = game?.individual_stats?.[teamId] ?? {};
  const prod = productionOf(game, teamId);
  const byCall = game?.metadata?.pass_spotting?.incompletion_depth === "unspotted";

  const passers = rowsOf(ist.passing).filter((r) => r.name !== "TEAM").map((r) => ({
    key: r.player_key ?? r.name,
    name: r.name,
    completions: r.completions ?? null,
    attempts: r.attempts ?? null,
    yards: r.yards ?? null,
    touchdowns: r.touchdowns ?? null,
    interceptions: r.interceptions ?? null,
    sr: asNum(r.success_rate),
    epa: asNum(r.epa_total),
    epaPer: asNum(r.epa_per_play),
    production: prod(r.player_key, r.name, "passing_production"),
    // The 16:9 QB card's extra lines, straight off the passer row.
    compPct: asNum(r.completion_pct),
    ypa: asNum(r.yards_per_attempt),
    adot: asNum(r.adot),
    sacks: r.sacks_taken ?? null,
    sackYards: r.sack_yards_lost ?? null,
    hurries: r.hurries_faced ?? null,
    wpa: asNum(r.wpa_total),
    deep: r.deep_attempts != null ? { completions: r.deep_completions ?? null, attempts: r.deep_attempts } : null,
    pressure: r.pressure_breakdown ?? null,
    redZone: r.red_zone_breakdown ?? null,
    third: r.third_down_breakdown ?? null,
    // The crew's-call grid when the crew never spotted incompletions (see ZONE_DEPTHS).
    grid: byCall && r.call_breakdown ? r.call_breakdown : r.direction_breakdown ?? null,
    gridByCall: byCall && !!r.call_breakdown,
  })).sort((a, b) => (b.attempts ?? 0) - (a.attempts ?? 0));

  const rushers = rowsOf(ist.rushing).filter((r) => r.name !== "TEAM").map((r) => ({
    key: r.player_key ?? r.name,
    name: r.name,
    attempts: r.attempts ?? null,
    yards: r.yards ?? null,
    ypc: asNum(r.yards_per_carry),
    sr: asNum(r.success_rate),
    epa: asNum(r.epa_total),
    epaPer: asNum(r.epa_per_play),
    lineYards: asNum(r.line_yards_per_carry),
    highlight: asNum(r.highlight_yards_per_opportunity),
    explosive: r.explosive_carries ?? null,
    production: prod(r.player_key, r.name, "rushing_production"),
  })).sort((a, b) => (b.production ?? -1e9) - (a.production ?? -1e9));

  const receivers = rowsOf(ist.receiving).filter((r) => r.name !== "TEAM").map((r) => ({
    key: r.player_key ?? r.name,
    name: r.name,
    targets: r.targets ?? null,
    receptions: r.receptions ?? null,
    yards: r.yards ?? null,
    ypr: asNum(r.yards_per_reception),
    explosive: r.explosive_receptions ?? null,
    sr: asNum(r.success_rate),
    epa: asNum(r.epa_total),
    epaPer: asNum(r.epa_per_target),
    production: prod(r.player_key, r.name, "receiving_production"),
  })).sort((a, b) => (b.production ?? -1e9) - (a.production ?? -1e9));

  const rushTotal = game?.rushing_splits?.[teamId]?.total ?? null;
  const passTotal = game?.passing_splits?.[teamId]?.total ?? null;

  const passSplits = game?.passing_splits?.[teamId] ?? null;

  return {
    passers,
    rushers,
    receivers,
    // The team's dropbacks on standard and passing downs (the QB card's down split).
    passDowns: passSplits ? { standard: passSplits.standard_downs ?? null, passing: passSplits.passing_downs ?? null } : null,
    rushTeam: rushTotal ? {
      attempts: rushTotal.attempts ?? null, yards: rushTotal.yards ?? null, ypc: asNum(rushTotal.yards_per_carry),
      sr: asNum(rushTotal.success_rate), epa: asNum(rushTotal.epa_total), epaPer: asNum(rushTotal.epa_per_play),
      lineYards: asNum(rushTotal.line_yards_per_rush), highlight: asNum(rushTotal.highlight_yards_per_rush), explosive: asNum(rushTotal.explosive_carries),
    } : null,
    recvTeam: passTotal ? {
      targets: passTotal.attempts ?? null, receptions: passTotal.completions ?? null, yards: passTotal.yards ?? null,
      ypr: asNum(passTotal.yards_per_completion), explosive: asNum(passTotal.explosive_completions ?? passTotal.explosive_receptions),
      sr: asNum(passTotal.success_rate), epa: asNum(passTotal.epa_total), epaPer: asNum(passTotal.epa_per_target),
    } : null,
  };
};
