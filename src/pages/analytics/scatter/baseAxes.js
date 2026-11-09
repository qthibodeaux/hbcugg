// Existing fixed scatter-axis metadata and raw team-axis reads, including source fallbacks.

export const val = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);

export const diff = (a, b) => (val(a) != null && val(b) != null ? a - b : null);

export const teamAxes = (row) => {
  const O = row?.advanced?.offense ?? {};
  const D = row?.advanced?.defense ?? {};
  return {
    net_epa_play: diff(O.epa_per_play, D.epa_per_play),
    net_success: diff(O.success_rate, D.success_rate),
    havoc_allowed: val(O.havoc_rate),
    havoc_forced: val(D.havoc_rate),
    epa_dropback: val(O.epa_per_pass),
    epa_rush: val(O.epa_per_rush),
    ppo_off: val(O.points_per_opportunity),
    ppo_def: val(D.points_per_opportunity),
    d_epa_dropback: val(D.epa_per_pass),
    d_pass_sr: val(D.success_rate_pass),
    // Garbage time out — the EPA chart's two sides.
    o_epa_play: val(O.competitive_epa_per_play ?? O.epa_per_play),
    d_epa_play: val(D.competitive_epa_per_play ?? D.epa_per_play),
    // Penalty yards per game by side: the advanced block once §11 ships, the
    // counting penalties file's by_side until then (same numbers by contract).
    o_pen_ypg: val(O.penalty_yards_per_game ?? row?.penalties?.offense?.yards_per_game),
    d_pen_ypg: val(D.penalty_yards_per_game ?? row?.penalties?.defense?.yards_per_game),
    // Pending backend (Team Analytics Fetch Contract §11) — null until it ships.
    net_sr_h1: diff(O.success_rate_first_half, D.success_rate_first_half),
    net_sr_h2: diff(O.success_rate_second_half, D.success_rate_second_half),
    // Rushing section — all shipped (stuff rate / power success first; the
    // 1st & 10, QB-share and run-by-half fields with the 10-18 drop).
    stuff_rate: val(O.stuff_rate),
    power_success: val(O.power_success),
    f10_rush_sr: val(O.f10_rush_success_rate),
    f10_run_rate: val(O.f10_run_rate),
    qb_share_carries: val(O.qb_share_of_carries),
    qb_share_rush_yds: val(O.qb_share_of_rush_yards),
    rush_sr_h1: val(O.rush_success_first_half),
    rush_sr_h2: val(O.rush_success_second_half),
  };
};

export const SCATTER_AXES = {
  net_epa_play: { key: "net_epa_play", label: "Net EPA / Play", unit: "num", team: true },
  net_success: { key: "net_success", label: "Net Success Rate", unit: "pct", team: true },
  havoc_allowed: { key: "havoc_allowed", label: "Havoc Allowed", unit: "pct", low: true, team: true },
  havoc_forced: { key: "havoc_forced", label: "Havoc Forced", unit: "pct", team: true },
  epa_dropback: { key: "epa_dropback", label: "EPA / Dropback", unit: "num", team: true },
  epa_rush: { key: "epa_rush", label: "EPA / Rush", unit: "num", team: true },
  ppo_off: { key: "ppo_off", label: "Points / Opportunity", unit: "num", team: true },
  ppo_def: { key: "ppo_def", label: "Points / Opp Allowed", unit: "num", low: true, team: true },
  d_epa_dropback: { key: "d_epa_dropback", label: "EPA / Dropback Allowed", unit: "num", low: true, team: true },
  d_pass_sr: { key: "d_pass_sr", label: "Pass Success Allowed", unit: "pct", low: true, team: true },
  o_epa_play: { key: "o_epa_play", label: "Offensive EPA / Play", unit: "num", team: true },
  d_epa_play: { key: "d_epa_play", label: "EPA / Play Allowed", unit: "num", low: true, team: true },
  o_pen_ypg: { key: "o_pen_ypg", label: "Offensive Penalty Yds / Game", unit: "num1", low: true, team: true },
  d_pen_ypg: { key: "d_pen_ypg", label: "Defensive Penalty Yds / Game", unit: "num1", low: true, team: true },
  net_sr_h1: { key: "net_sr_h1", label: "First-Half Net Success", unit: "pts", team: true },
  net_sr_h2: { key: "net_sr_h2", label: "Second-Half Net Success", unit: "pts", team: true },
  stuff_rate: { key: "stuff_rate", label: "Stuff Rate", unit: "pct", low: true, team: true },
  power_success: { key: "power_success", label: "Power Success", unit: "pct", team: true },
  f10_rush_sr: { key: "f10_rush_sr", label: "Run Success on 1st & 10", unit: "pct", team: true },
  f10_run_rate: { key: "f10_run_rate", label: "Run Rate on 1st & 10", unit: "pct", team: true },
  qb_share_carries: { key: "qb_share_carries", label: "QB Share of Carries", unit: "pct", team: true },
  qb_share_rush_yds: { key: "qb_share_rush_yds", label: "QB Share of Rush Yards", unit: "pct", team: true },
  rush_sr_h1: { key: "rush_sr_h1", label: "1st-Half Run Success", unit: "pct", team: true },
  rush_sr_h2: { key: "rush_sr_h2", label: "2nd-Half Run Success", unit: "pct", team: true },
};
