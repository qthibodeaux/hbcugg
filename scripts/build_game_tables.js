#!/usr/bin/env node
/* eslint-disable no-console */
// ─────────────────────────────────────────────────────────────────────────────
// GAME TABLES  —  the single-game breakdown.
//
// Reads the 2026-and-later export shape. The 2025 generator that preceded it
// targeted frontend_ready_v3 (team_box / advanced_team) and is parked at
// archive/scripts/build_gop_demo.js — retired rather than deleted, because the
// 2025 GAMES are still live here: they are the percentile pool below.
//
// Everything past this header is about the schema, not the page. PageLab renders
// whatever this writes without knowing which season produced it.
//
// WHAT THE 2026 EXPORT CHANGES. The 2025 files gave a flat `advanced_team` with
// ~40 fields and a play_by_play whose per-play WPA was null on all 18,018 plays.
// 2026 ships game_advanced.team_advanced with 26 SECTIONS per team, and
// play_advanced on every play carrying success, explosive, epa, wp, havoc,
// rush_model and situational flags already computed. Three things that were
// gaps in the 2025 demo are simply answered now:
//
//   per-play WPA        play_advanced.wp.wpa       → Most Important Plays works
//   power runs          rushing_model.power_*      → real zeros, not nulls
//   situational flags   play_advanced.situational  → no re-deriving down types
//
// One thing regressed. 2025's heat_maps binned passes into nine depth x
// direction cells. 2026's passing_efficiency_depth bins by depth only. The
// direction did not disappear though — it moved to the play actions
// (`targetDirection`), so the 3x3 matrix is rebuilt from play_by_play here
// rather than read from an aggregate.
//
// PERCENTILES come from 2025, deliberately. Three parsed games is six
// team-games, which is not a distribution. The 2025 season has 144, and every
// shaded field exists in both schemas under the same definition, so a cell
// reads "where this 2026 performance would have ranked in 2025".
//
//   node scripts/build_game_tables.js [gameFile]
// ─────────────────────────────────────────────────────────────────────────────

const fs = require("fs");
const path = require("path");

const GAME_FILE = process.argv[2] || "nccutsu26.json";
const ROOT = path.join(__dirname, "..");
const DATA_2026 = path.join(ROOT, "public", "data", "2026");
const GAMES_2025 = path.join(ROOT, "public", "data", "1-game center", "games", "2025");
const OUT = path.join(ROOT, "public", "data", "0-data", "game_tables.json");

const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const hub = read(path.join(ROOT, "public", "data", "0-data", "team_analytics_hub.json"));
const game = read(path.join(DATA_2026, GAME_FILE));
const inventory = read(path.join(DATA_2026, "inventory_2026.json"));

const adv = game.game_advanced.team_advanced;
const box = game.team_stats;

// Away first, the way a scoreboard reads.
const homeId = game.metadata.home_team;
const awayId = game.metadata.away_team;
const ids = [awayId, homeId];

// ─── Percentile pool, from 2025 ──────────────────────────────────────────────

const PASS_TYPES = new Set(["PASS", "SACK"]);
const epa25 = (p) => (p.epa && typeof p.epa.epa === "number" ? p.epa.epa : null);

const pool = {};
const push = (f, v) => { if (typeof v === "number" && Number.isFinite(v)) (pool[f] = pool[f] ?? []).push(v); };

for (const file of fs.readdirSync(GAMES_2025).filter((f) => f.endsWith(".json"))) {
  const g = read(path.join(GAMES_2025, file));
  if (!g.advanced_team || !g.team_box) continue;
  for (const [teamId, a] of Object.entries(g.advanced_team)) {
    const b = g.team_box[teamId];
    // Pass/rush EPA per play are not precomputed in 2025; recompute them the
    // same way, excluding no_play, which is what makes 2025's own
    // eligible_scrimmage_plays reproduce exactly.
    const own = (g.play_by_play ?? []).filter(
      (p) => p.offense_team === teamId && !p.no_play && epa25(p) != null &&
        (PASS_TYPES.has(p.play_type) || p.play_type === "RUSH"),
    );
    const pass = own.filter((p) => PASS_TYPES.has(p.play_type));
    const rush = own.filter((p) => p.play_type === "RUSH");
    const mean = (l) => (l.length ? l.reduce((s, p) => s + epa25(p), 0) / l.length : null);

    push("epa_per_play", a.epa_per_play);
    push("success_rate_dd", a.success_rate_down_distance);
    push("yards_per_play", b.plays_offense ? b.total_yards / b.plays_offense : null);
    push("epa_per_dropback", mean(pass));
    push("epa_per_rush", mean(rush));
    push("explosive_rate_yardage", a.explosive_rate_yardage);
    push("third_down_rate", b.third_down_conversion_rate);
    push("red_zone_td_rate", a.red_zone_td_rate);
    push("stuff_rate", a.stuff_rate);
    push("havoc_rate", a.havoc_rate_forced);
  }
}
for (const k of Object.keys(pool)) pool[k].sort((a, b) => a - b);

// Stuff rate is the one field where a low number is the good outcome.
const INVERTED = new Set(["stuff_rate"]);
const percentileOf = (field, v) => {
  const arr = pool[field];
  if (!arr?.length || typeof v !== "number" || !Number.isFinite(v)) return null;
  let below = 0;
  for (const x of arr) if (x < v) below += 1;
  const p = Math.round((below / arr.length) * 100);
  return INVERTED.has(field) ? 100 - p : p;
};

// ─── Formatting ──────────────────────────────────────────────────────────────

const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const n2 = (v) => (num(v) == null ? "—" : v.toFixed(2));
const n1 = (v) => (num(v) == null ? "—" : v.toFixed(1));
const n3 = (v) => (num(v) == null ? "—" : v.toFixed(3));
const pc = (v) => (num(v) == null ? "—" : `${Math.round(v * 100)}%`);
const int = (v) => (num(v) == null ? "—" : String(Math.round(v)));

const at = (obj, dotted) => dotted.split(".").reduce((o, k) => o?.[k], obj);
const advA = (dotted) => at(adv[ids[0]], dotted);
const advB = (dotted) => at(adv[ids[1]], dotted);
const boxA = (k) => box[ids[0]]?.[k];
const boxB = (k) => box[ids[1]]?.[k];

const shaded = (label, field, va, vb, fmt) => ({
  label,
  values: [
    { display: fmt(va), pct: percentileOf(field, va) },
    { display: fmt(vb), pct: percentileOf(field, vb) },
  ],
});
const plain = (label, da, db, indent = 0) => ({ label, indent, values: [{ display: da }, { display: db }] });
const pair = (label, dotted, fmt, indent = 0) => plain(label, fmt(advA(dotted)), fmt(advB(dotted)), indent);
const boxRow = (label, k, fmt, indent = 0) => plain(label, fmt(boxA(k)), fmt(boxB(k)), indent);

const totalYards = (id) => (box[id]?.pass_yards ?? 0) + (box[id]?.rush_yards ?? 0);
const yppOf = (id) => (box[id]?.plays_offense ? totalYards(id) / box[id].plays_offense : null);

// ─── Tables ──────────────────────────────────────────────────────────────────

const tables = [
  {
    id: "overall",
    title: "Overall",
    shaded: true,
    footnote: `Percentiles are against 144 team-games from 2025 — three parsed games is not a distribution.`,
    rows: [
      shaded("EPA/Play", "epa_per_play", advA("plays.epa_per_play"), advB("plays.epa_per_play"), n3),
      shaded("Success Rate", "success_rate_dd", advA("plays.success_rate_down_distance"), advB("plays.success_rate_down_distance"), pc),
      shaded("Yards/Play", "yards_per_play", yppOf(ids[0]), yppOf(ids[1]), n2),
      shaded("EPA/Dropback", "epa_per_dropback", advA("pass_offense.epa_per_play"), advB("pass_offense.epa_per_play"), n3),
      shaded("EPA/Rush", "epa_per_rush", advA("rush_offense.epa_per_play"), advB("rush_offense.epa_per_play"), n3),
      shaded("Explosive Play Rate", "explosive_rate_yardage", advA("plays.explosive_rate_yardage"), advB("plays.explosive_rate_yardage"), pc),
      shaded("3rd Down Rate", "third_down_rate", boxA("third_down_conversion_rate"), boxB("third_down_conversion_rate"), pc),
      shaded("Red Zone TD Rate", "red_zone_td_rate", advA("finishing.red_zone_td_rate"), advB("finishing.red_zone_td_rate"), pc),
      shaded("Def Run Stuff Rate", "stuff_rate", advA("rushing_model.stuff_rate"), advB("rushing_model.stuff_rate"), pc),
      shaded("Havoc Rate", "havoc_rate", advA("havoc.havoc_rate_forced"), advB("havoc.havoc_rate_forced"), pc),
    ],
  },
  {
    id: "expected_points",
    title: "Expected Points",
    footnote: "Streams split by who the play belonged to; a penalty overlay play can also sit in another stream.",
    rows: [
      pair("Total Plays", "plays.epa_streams.total.plays", int),
      pair("Total EPA", "plays.epa_streams.total.epa", n2),
      pair("Offensive EPA", "plays.epa_streams.offense.epa", n2, 1),
      pair("Offensive EPA/Play", "plays.epa_streams.offense.epa_per_play", n3, 1),
      pair("Special Teams EPA", "plays.epa_streams.special_teams.epa", n2, 1),
      pair("Kickoff", "plays.epa_streams.special_teams_breakdown.kickoff.epa", n2, 2),
      pair("Punt", "plays.epa_streams.special_teams_breakdown.punt.epa", n2, 2),
      pair("Field Goal", "plays.epa_streams.special_teams_breakdown.field_goal.epa", n2, 2),
      pair("Penalty Overlay EPA", "plays.epa_streams.penalty_overlay.epa", n2, 1),
      pair("WPA Total", "plays.wpa_total", n3),
      pair("Positive WPA Play Rate", "plays.positive_wpa_play_rate", pc, 1),
    ],
  },
  {
    id: "production",
    title: "Production",
    rows: [
      pair("Scrimmage Plays", "plays.eligible_scrimmage_plays", int),
      plain("Total Yards", int(totalYards(ids[0])), int(totalYards(ids[1])), 1),
      plain("Yards/Play", n2(yppOf(ids[0])), n2(yppOf(ids[1])), 1),
      pair("Passes", "pass_offense.eligible_plays", int),
      boxRow("Yards", "pass_yards", int, 1),
      pair("Success Rate", "pass_offense.success_rate", pc, 1),
      pair("EPA", "pass_offense.epa_total", n2, 1),
      pair("EPA/Play", "pass_offense.epa_per_play", n3, 1),
      pair("Rushes", "rush_offense.eligible_plays", int),
      boxRow("Yards", "rush_yards", int, 1),
      pair("Success Rate", "rush_offense.success_rate", pc, 1),
      pair("EPA", "rush_offense.epa_total", n2, 1),
      pair("EPA/Play", "rush_offense.epa_per_play", n3, 1),
    ],
  },
  {
    id: "rushing",
    title: "Rushing Model",
    rows: [
      pair("Rush Attempts Modeled", "rushing_model.rush_attempts_modeled", int),
      pair("Power Attempts (Down ≥ 3, Dist ≤ 2)", "rushing_model.power_attempts", int, 1),
      pair("Power Successes", "rushing_model.power_successes", int, 1),
      pair("Power Success Rate", "rushing_model.power_success_rate", pc, 1),
      pair("Stuffed Runs (Yds ≤ 0)", "rushing_model.stuff_rate", pc, 1),
      pair("Stopped Runs (Yds ≤ 2)", "rushing_model.stopped_run_rate", pc, 1),
      pair("Opportunity Runs (Yds ≥ 4)", "rushing_model.rush_opportunity_rate", pc, 1),
      pair("OL Line Yards", "rushing_model.line_yards_total", n1),
      pair("Per Carry", "rushing_model.line_yards_per_rush", n2, 1),
      pair("Highlight Yards", "rushing_model.highlight_yards_total", n1),
      pair("Per Carry", "rushing_model.highlight_yards_per_rush", n2, 1),
    ],
  },
  {
    id: "explosiveness",
    title: "Explosiveness & Big Plays",
    rows: [
      pair("Explosive Plays (Total)", "plays.explosive_plays_total", int),
      pair("When Passing", "plays.explosive_pass_plays", int, 1),
      pair("When Rushing", "plays.explosive_rush_plays", int, 1),
      pair("Explosive Rate (Yardage)", "plays.explosive_rate_yardage", pc),
      pair("Explosive Rate (EPA)", "plays.explosive_rate_epa", pc, 1),
      pair("GOP Explosive Rate — Pass", "pass_offense.gop_explosive_rate", pc, 1),
      pair("GOP Explosive Rate — Rush", "rush_offense.gop_explosive_rate", pc, 1),
      pair("Pass EPA/Play w/o Explosives", "pass_offense.epa_per_play_non_explosive", n3),
      pair("Rush EPA/Play w/o Explosives", "rush_offense.epa_per_play_non_explosive", n3),
    ],
  },
  {
    id: "situational",
    title: "Success Rates & Situational",
    rows: [
      pair("Overall Success Rate", "plays.success_rate_down_distance", pc),
      pair("Success Rate (EPA)", "plays.success_rate_epa", pc, 1),
      pair("Standard Down Success", "situational.success_rate_standard_down", pc),
      pair("Passing Down Success", "situational.success_rate_passing_down", pc),
      pair("Early Down Success (1&2)", "situational.success_rate_early_down", pc),
      pair("Late Down Success (3&4)", "situational.success_rate_late_down", pc),
      pair("Goal-To-Go Success", "situational.success_rate_goal_to_go", pc),
      pair("Two-Minute Success", "situational.success_rate_two_minute", pc),
      pair("Middle 8 Success", "situational.success_rate_middle_8", pc),
      pair("Passing Success Rate", "pass_offense.success_rate", pc),
      pair("Rushing Success Rate", "rush_offense.success_rate", pc),
    ],
  },
  {
    id: "drives",
    title: "Drives & Finishing",
    rows: [
      boxRow("Drives", "drives_offense", int),
      boxRow("Points/Drive", "points_per_drive", n2, 1),
      boxRow("Avg Start Field Position", "avg_start_field_position", n1, 1),
      pair("Available Yards %", "drives.available_yards_pct", pc, 1),
      pair("Quality Drive Rate", "drives.quality_drive_rate", pc),
      pair("Explosive Drive Rate", "drives.explosive_drive_rate", pc),
      pair("Negative Drive Rate", "drives.negative_drive_rate", pc),
      pair("Points / Quality Drive", "drives.points_per_quality_drive", n1, 1),
      pair("Opportunities Inside 40", "finishing.opportunities_40", int),
      pair("Points / Opp Inside 40", "finishing.points_per_opportunity_40", n1, 1),
      pair("Red Zone Trips", "finishing.red_zone_opportunities", int),
      pair("Red Zone Points / Trip", "finishing.red_zone_points_per_opportunity", n1, 1),
      pair("Red Zone TD Rate", "finishing.red_zone_td_rate", pc, 1),
    ],
  },
  {
    id: "downs",
    title: "Third & Fourth Downs",
    rows: [
      plain("3rd Down", `${int(boxA("third_down_conversions"))}/${int(boxA("third_down_attempts"))} (${pc(boxA("third_down_conversion_rate"))})`,
        `${int(boxB("third_down_conversions"))}/${int(boxB("third_down_attempts"))} (${pc(boxB("third_down_conversion_rate"))})`),
      boxRow("Avg 3rd Down Distance", "third_down_avg_distance", n1, 1),
      boxRow("4th Down Attempts", "fourth_down_goes", int),
      boxRow("4th Down Go Rate", "fourth_down_go_rate", pc, 1),
      boxRow("4th Down Conversion Rate", "fourth_down_go_conversion_rate", pc, 1),
    ],
  },
  {
    id: "defensive",
    title: "Defensive Performance",
    rows: [
      pair("Defensive Plays", "defensive_identity.def_plays", int),
      pair("Yards/Play Allowed", "defensive_identity.yards_per_play_allowed", n2, 1),
      pair("Disruption Rate", "defensive_identity.disruption_rate", pc, 1),
      pair("Explosive Prevention", "defensive_identity.explosive_prevention_rate", pc, 1),
      pair("Bend-Don't-Break Index", "defensive_identity.bend_dont_break_index", n1, 1),
      pair("Havoc Rate Forced", "havoc.havoc_rate_forced", pc),
      pair("When Defending Pass", "havoc.havoc_rate_forced_pass", pc, 1),
      pair("When Defending Rush", "havoc.havoc_rate_forced_rush", pc, 1),
      pair("TFL Rate Forced", "havoc.tfl_rate_forced", pc, 1),
      pair("Sack Rate Forced", "havoc.sack_rate_forced", pc, 1),
      pair("Pass Defended Rate", "havoc.pass_defended_rate_forced", pc, 1),
      pair("Havoc Rate Allowed", "havoc.havoc_rate_allowed", pc),
      pair("Pass Success Allowed", "pass_defense.success_rate_allowed", pc),
      pair("Rush Success Allowed", "rush_defense.success_rate_allowed", pc),
    ],
  },
  {
    id: "turnovers",
    title: "Turnovers & Luck",
    rows: [
      pair("Actual Turnovers", "turnovers.actual_turnovers", int),
      pair("Expected Turnovers", "turnovers.expected_turnovers", n2),
      pair("Turnover Luck", "turnovers.turnover_luck", n2),
      boxRow("Turnovers Forced", "turnovers_forced", int),
      boxRow("Interceptions Thrown", "interceptions_thrown", int, 1),
      boxRow("Sacks Made", "sacks_made", int),
      boxRow("Sacks Allowed", "sacks_allowed", int, 1),
    ],
  },
  {
    id: "special_teams",
    title: "Special Teams",
    rows: [
      pair("ST Plays", "special_teams_model.st_play_count", int),
      pair("Kickoff Attempts", "special_teams_model.kickoff_attempts", int),
      pair("Avg Kickoff Distance", "special_teams_model.avg_kickoff_distance", n1, 1),
      pair("Kickoff Return Yards For", "special_teams_model.kickoff_return_yards_for", int, 1),
      pair("Punt Attempts", "special_teams_model.punt_attempts", int),
      pair("Avg Punt Distance", "special_teams_model.avg_punt_distance", n1, 1),
      pair("Punt Return Yards For", "special_teams_model.punt_return_yards_for", int, 1),
      pair("ST Swing Yards", "special_teams_advanced.summary.st_swing_yards", int),
    ],
  },
  {
    id: "penalties",
    title: "Penalties & Discipline",
    rows: [
      pair("Accepted Penalties", "penalty_advanced.total_accepted", int),
      pair("Penalty Yards", "penalty_advanced.total_yards", int, 1),
      pair("Penalty Rate", "penalty_advanced.penalty_rate", pc, 1),
      pair("Pre-Snap Rate", "penalty_advanced.pre_snap_rate", pc, 1),
      pair("On 3rd Down", "penalty_advanced.on_3rd_down", int, 1),
      pair("High Leverage", "penalty_advanced.high_leverage_count", int, 1),
    ],
  },
  {
    id: "coaching",
    title: "Coaching & Tendencies",
    rows: [
      pair("1st Down Run Rate", "coaching_profile.run_pass_by_down.1.run_rate", pc),
      pair("2nd Down Run Rate", "coaching_profile.run_pass_by_down.2.run_rate", pc),
      pair("3rd Down Run Rate", "coaching_profile.run_pass_by_down.3.run_rate", pc),
      pair("Pass Rush Share (DL)", "defense_role_distribution.pass_rush_share_dl", pc),
      pair("Run Stop Share (DL)", "defense_role_distribution.run_stop_share_dl", pc),
      pair("Coverage Share (DB)", "defense_role_distribution.coverage_share_db", pc),
      pair("Ball Hawk Share (DB)", "defense_role_distribution.ball_hawk_share_db", pc),
    ],
  },
  {
    id: "sequence",
    title: "Sequence & Momentum",
    rows: [
      pair("Drives After Own Turnover", "sequence_model.after_own_turnover.drives", int),
      pair("Points", "sequence_model.after_own_turnover.points", int, 1),
      pair("Drives After Takeaway", "sequence_model.after_takeaway.drives", int),
      pair("Points", "sequence_model.after_takeaway.points", int, 1),
      pair("Drives Faced After Sudden Change", "sequence_model.sudden_change_defense.drives_faced", int),
      pair("Points Allowed", "sequence_model.sudden_change_defense.points_allowed", int, 1),
    ],
  },
];

// ─── Identity ────────────────────────────────────────────────────────────────

const invGame = inventory.games.find((g) => g.game_id === game.metadata.game_id);
const scoreOf = (id) =>
  game.metadata?.box_score?.[id]?.total ?? box[id]?.points_scored ?? null;

const identityOf = (id) => {
  const t = hub.teams?.[id]?.identity;
  return {
    id,
    name: t?.name ?? id,
    short: t?.short ?? id,
    logo: t?.logo ?? null,
    primary: t?.primary ?? null,
    secondary: t?.secondary ?? null,
    score: scoreOf(id),
  };
};
const teams = ids.map(identityOf);

// ─── Matrices, rebuilt from play actions ─────────────────────────────────────
// passing_efficiency_depth bins by depth only. The direction is still on each
// pass action, so the nine-cell grid is assembled here instead.

const DEPTHS = ["deep", "medium", "short"];
const DIRS = ["left", "middle", "right"];
const normDir = (d) => {
  const v = String(d ?? "").toLowerCase();
  return DIRS.find((x) => v.includes(x)) ?? null;
};
const normDepth = (d) => {
  const v = String(d ?? "").toLowerCase();
  return DEPTHS.find((x) => v.includes(x)) ?? null;
};

const passGrid = {};
for (const id of ids) passGrid[id] = {};
for (const play of game.play_by_play) {
  for (const a of play.actions ?? []) {
    if (a.type !== "PASS") continue;
    const team = a.passer?.team;
    if (!team || !passGrid[team]) continue;
    const depth = normDepth(a.passDepth);
    const dir = normDir(a.targetDirection);
    if (!depth || !dir) continue;
    const key = `${depth}_${dir}`;
    const c = (passGrid[team][key] = passGrid[team][key] ?? { attempts: 0, completions: 0, yards: 0 });
    c.attempts += 1;
    if (a.isComplete) { c.completions += 1; c.yards += Number(a.net_yards) || 0; }
  }
}

const matrices = ids.map((id) => {
  const rushDir = adv[id]?.rushing_direction_efficiency ?? {};
  const rush = {};
  for (const d of DIRS) {
    const r = rushDir[d];
    rush[d] = r ? { attempts: r.attempts, yards: r.yards, yards_per_carry: r.yards_per_carry } : { attempts: 0, yards: 0, yards_per_carry: null };
  }
  return { team: identityOf(id), pass: passGrid[id], rush };
});

// ─── Player lines ────────────────────────────────────────────────────────────
// Attribution is by player_id — the actions and individual_stats agree on it,
// so no name matching is needed at all this season.

const perPlayer = {};
for (const play of game.play_by_play) {
  const pa = play.play_advanced;
  const e = num(pa?.epa?.epa);
  const w = num(pa?.wp?.wpa);
  if (e == null) continue;
  const success = pa?.success?.down_distance === true;
  for (const a of play.actions ?? []) {
    const seats = [["pass", a.passer], ["rush", a.rusher], ["recv", a.receiver]];
    for (const [role, who] of seats) {
      if (!who?.player_id) continue;
      const k = `${role}|${who.player_id}`;
      const r = (perPlayer[k] = perPlayer[k] ?? { epa: 0, wpa: 0, plays: 0, success: 0 });
      r.epa += e; r.wpa += w ?? 0; r.plays += 1; if (success) r.success += 1;
    }
  }
}
const advLine = (role, pid) => {
  const r = perPlayer[`${role}|${pid}`];
  if (!r) return { epa: "—", epa_per_play: "—", sr: "—", wpa: "—" };
  return {
    epa: n2(r.epa),
    epa_per_play: n2(r.plays ? r.epa / r.plays : null),
    sr: pc(r.plays ? r.success / r.plays : null),
    wpa: `${(r.wpa * 100).toFixed(1)}%`,
  };
};

const players = ids.map((id) => {
  const s = game.individual_stats?.[id] ?? {};
  const rows = (group, role, describe) =>
    Object.values(group ?? {})
      .map((r) => ({ name: r.name_raw ?? r.name ?? r.player_id, stat_line: describe(r), ...advLine(role, r.player_id) }))
      .sort((a, b) => parseFloat(b.epa) - parseFloat(a.epa));
  return {
    team: identityOf(id),
    dropbacks: rows(s.passing, "pass", (r) =>
      `${r.completions}/${r.attempts}, ${r.yards} yds, ${r.touchdowns} TD, ${r.interceptions} INT, ${r.sacks_taken} Sck`),
    rushes: rows(s.rushing, "rush", (r) =>
      `${r.attempts} carries, ${r.yards} yds, ${r.touchdowns} TD, ${r.fumbles ?? 0} Fum`),
    targets: rows(s.receiving, "recv", (r) =>
      `${r.receptions} catches (${r.targets} targets), ${r.yards} yds, ${r.touchdowns} TD`),
  };
});

// ─── Play lists ──────────────────────────────────────────────────────────────

const shortOf = (id) => identityOf(id).short;
const playRow = (p) => ({
  time: `Q${p.base.quarter} ${p.base.clock ?? ""}`.trim(),
  offense: p.base.offense_team ? shortOf(p.base.offense_team) : "—",
  text: p.base.raw,
  epa: n2(num(p.play_advanced?.epa?.epa)),
  wpa: num(p.play_advanced?.wp?.wpa) == null ? "—" : `${(p.play_advanced.wp.wpa * 100).toFixed(1)}%`,
});
const scored = game.play_by_play.filter((p) => num(p.play_advanced?.epa?.epa) != null && p.base?.offense_team);
const bigPlays = [...scored].sort((a, b) => Math.abs(b.play_advanced.epa.epa) - Math.abs(a.play_advanced.epa.epa)).slice(0, 10).map(playRow);
// Works this season: play_advanced.wp.wpa is populated, unlike 2025.
const importantPlays = [...scored]
  .filter((p) => num(p.play_advanced?.wp?.wpa) != null)
  .sort((a, b) => Math.abs(b.play_advanced.wp.wpa) - Math.abs(a.play_advanced.wp.wpa)).slice(0, 10).map(playRow);
const scoringPlays = (game.scoring_summary ?? []).map((s) => ({
  time: `Q${s.period} ${s.clock}`,
  offense: shortOf(s.team_id),
  text: s.description,
  points: s.points,
}));

// ─── Gaps ────────────────────────────────────────────────────────────────────

const gaps = [];
const gap = (label, why) => gaps.push({ label, why });
gap("Target matrix direction, as an aggregate",
  "passing_efficiency_depth bins passes by depth only, where 2025's heat_maps gave nine depth x direction cells. The direction is still on each pass action (targetDirection), so the grid is rebuilt from play_by_play here — but it is no longer available to anyone reading the team aggregate alone.");
gap("xQBR", "not in the export at any level.");
gap("Air yards / YAC split",
  "pass actions carry `airyards`, but yards after catch is never separated, so aDOT is derivable and YAC is not.");
gap("First downs as a team total",
  "team_stats has no first_downs field; it can only be counted by scanning play text.");
if (advA("rushing_model.power_attempts") === 0 && advB("rushing_model.power_attempts") === 0) {
  gap("Power run attempts — zero, not missing",
    "Both sides show 0 power attempts with a null success rate. In 2025 this field was null (never populated); here it is a real zero, so the finding is that neither team faced a down 3+ / distance 2- rushing situation, not that the data is absent.");
}

// ─── Emit ────────────────────────────────────────────────────────────────────

const out = {
  generated_at: new Date().toISOString(),
  source_file: `2026/${GAME_FILE}`,
  game: {
    game_id: game.metadata.game_id,
    date: invGame?.date ?? null,
    // 2026 ships venue as an object, 2025 as a string — normalise here so the
    // page only ever receives text.
    venue: typeof invGame?.venue === "string"
      ? invGame.venue
      : invGame?.venue?.site ?? invGame?.venue?.stadium ?? null,
    neutral_site: invGame?.venue?.neutral_site ?? false,
    attendance: invGame?.attendance ?? null,
  },
  teams,
  tables,
  matrices,
  players,
  big_plays: bigPlays,
  important_plays: importantPlays,
  scoring_plays: scoringPlays,
  percentile_basis: {
    season: 2025,
    team_games: pool.success_rate_dd?.length ?? 0,
    note: "Percentiles are against 144 team-games from 2025 — 2026 has three parsed games, which is not a distribution.",
  },
  gaps,
};

fs.writeFileSync(OUT, JSON.stringify(out));
console.log(`wrote ${path.relative(ROOT, OUT)}  (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
console.log(`  ${teams.map((t) => `${t.short} ${t.score}`).join(" @ ")}   ${out.game.date}`);
console.log(`  tables ${tables.length}  ·  rows ${tables.reduce((s, t) => s + t.rows.length, 0)}`);
console.log(`  percentile basis: ${out.percentile_basis.team_games} team-games from 2025`);
console.log(`  players ${players.map((p) => p.dropbacks.length + p.rushes.length + p.targets.length).join(" / ")}`);
console.log(`  plays: big ${bigPlays.length}, important ${importantPlays.length}, scoring ${scoringPlays.length}`);
console.log(`  gaps ${gaps.length}`);
gaps.forEach((g) => console.log(`    - ${g.label}`));
