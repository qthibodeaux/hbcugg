#!/usr/bin/env node
/* eslint-disable no-console */
// ─────────────────────────────────────────────────────────────────────────────
// GAME TABLES DEMO  —  a GameOnPaper-style single-game breakdown, built from
// our own parsed game export.
//
// Structure only. GOP's value is how it GROUPS a game — Overall, Expected
// Points, Production, Rushing, Explosiveness, Situational, Drives, Defensive,
// Turnovers, then player lines and the target/rush matrices. This reproduces
// that grouping against our data to find out how much of it we can already
// answer. Nothing here is copied from them; every number is computed from
// public/data/1-game center/games/.
//
// PERCENTILES are ours, not theirs. GOP shades against all FBS single-game
// performances; we shade against all 144 team-games in our own 2025 parsed set,
// which is the more meaningful comparison for this league anyway. A cell says
// "63rd %ile" meaning 63% of SWAC/MEAC team-games in 2025 were worse.
//
// WHAT IS MISSING is reported, never faked — see `gaps` in the output. The
// point of the demo is to show the backend exactly which cells stay blank.
//
//   node scripts/build_gop_demo.js [gameFile] [season]
// ─────────────────────────────────────────────────────────────────────────────

const fs = require("fs");
const path = require("path");

const GAME_FILE = process.argv[2] || "W15pvamujsu.json";
const SEASON = Number(process.argv[3] || 2025);
const ROOT = path.join(__dirname, "..");
const GAMES_DIR = path.join(ROOT, "public", "data", "1-game center", "games", String(SEASON));
const OUT = path.join(ROOT, "public", "data", "0-data", "gop_demo.json");

const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const hub = read(path.join(ROOT, "public", "data", "0-data", "team_analytics_hub.json"));

// ─── Play classification ─────────────────────────────────────────────────────
// One place, so the tables can never disagree with each other about what a
// dropback is.

const PASS_TYPES = new Set(["PASS", "SACK"]);
const ST_TYPES = new Set(["KICKOFF", "PUNT", "FIELD_GOAL", "PAT"]);
const epaOf = (p) => (p.epa && typeof p.epa.epa === "number" ? p.epa.epa : null);
// A nullified play is not a scrimmage play. Excluding `no_play` reproduces the
// export's own `eligible_scrimmage_plays` exactly on all 144 team-games of
// 2025 — verified, not assumed — which is what keeps every table computed here
// consistent with the precomputed rates in advanced_team.
const isScrimmage = (p) => (PASS_TYPES.has(p.play_type) || p.play_type === "RUSH") && !p.no_play;

// GOP's split: a passing down is one where the defence knows you must throw.
const isPassingDown = (p) =>
  (p.down === 2 && p.distance >= 8) || (p.down >= 3 && p.distance >= 5);
// Last four minutes of the second quarter and the first four of the third.
const isMiddle8 = (p) => {
  const [m] = String(p.clock ?? "").split(":").map(Number);
  if (!Number.isFinite(m)) return false;
  return (p.quarter === 2 && m < 4) || (p.quarter === 3 && m >= 11);
};

// EPA thresholds for an explosive play, by play type — the same idea GOP uses.
const EXPLOSIVE_PASS = 2.4;
const EXPLOSIVE_RUSH = 1.8;
const isExplosive = (p) => {
  const e = epaOf(p);
  if (e == null) return false;
  return PASS_TYPES.has(p.play_type) ? e > EXPLOSIVE_PASS : p.play_type === "RUSH" ? e > EXPLOSIVE_RUSH : false;
};

// ─── Per-team play aggregation ───────────────────────────────────────────────

const aggregate = (plays, teamId) => {
  const own = plays.filter((p) => p.offense_team === teamId);
  const scrim = own.filter(isScrimmage);
  const withEpa = (list) => list.filter((p) => epaOf(p) != null);

  const sum = (list) => list.reduce((s, p) => s + (epaOf(p) ?? 0), 0);
  const rate = (num, den) => (den ? num / den : null);

  const pass = scrim.filter((p) => PASS_TYPES.has(p.play_type));
  const rush = scrim.filter((p) => p.play_type === "RUSH");
  const successful = (list) => withEpa(list).filter((p) => epaOf(p) > 0);

  const early = scrim.filter((p) => p.down >= 1 && p.down <= 2);
  const late = scrim.filter((p) => p.down >= 3);
  const standard = scrim.filter((p) => p.down && !isPassingDown(p));
  const passing = scrim.filter((p) => p.down && isPassingDown(p));
  const mid8 = scrim.filter(isMiddle8);

  const explosive = scrim.filter(isExplosive);
  const nonExplosive = scrim.filter((p) => !isExplosive(p));

  return {
    plays: own.length,
    scrim: scrim.length,
    pass, rush, scrimList: scrim,
    epaTotal: sum(withEpa(own)),
    epaOffense: sum(withEpa(scrim)),
    epaSpecial: sum(withEpa(own.filter((p) => ST_TYPES.has(p.play_type)))),
    epaPenalty: sum(withEpa(own.filter((p) => p.play_type === "PENALTY" || p.no_play))),
    epaPass: sum(withEpa(pass)),
    epaRush: sum(withEpa(rush)),
    epaPerPlay: rate(sum(withEpa(scrim)), withEpa(scrim).length),
    epaPerPass: rate(sum(withEpa(pass)), withEpa(pass).length),
    epaPerRush: rate(sum(withEpa(rush)), withEpa(rush).length),
    successAll: successful(scrim).length,
    successRate: rate(successful(scrim).length, withEpa(scrim).length),
    successPass: successful(pass).length, passRateDen: withEpa(pass).length,
    successRush: successful(rush).length, rushRateDen: withEpa(rush).length,
    early, late, standard, passing, mid8,
    successEarly: successful(early).length, successLate: successful(late).length,
    successStandard: successful(standard).length, successPassing: successful(passing).length,
    successMid8: successful(mid8).length,
    explosive: explosive.length,
    explosivePass: pass.filter(isExplosive).length,
    explosiveRush: rush.filter(isExplosive).length,
    epaNoExplosive: sum(withEpa(nonExplosive)),
    epaNoExplosivePerPlay: rate(sum(withEpa(nonExplosive)), withEpa(nonExplosive).length),
    epaNoExplosivePass: sum(withEpa(pass.filter((p) => !isExplosive(p)))),
    epaNoExplosiveRush: sum(withEpa(rush.filter((p) => !isExplosive(p)))),
    firstDownsEarly: early.filter((p) => /1ST DOWN/i.test(p.raw_text ?? "")).length,
    withEpaCount: withEpa(scrim).length,
  };
};

// ─── Percentile population ───────────────────────────────────────────────────
// Every parsed team-game in the season, so a cell can say where this
// performance sits rather than just stating a number in a vacuum.

const buildPopulation = () => {
  const pool = {};
  const push = (field, v) => {
    if (v == null || !Number.isFinite(v)) return;
    (pool[field] = pool[field] ?? []).push(v);
  };
  for (const file of fs.readdirSync(GAMES_DIR).filter((f) => f.endsWith(".json"))) {
    const g = read(path.join(GAMES_DIR, file));
    if (!g.advanced_team || !g.team_box) continue;
    for (const [teamId, adv] of Object.entries(g.advanced_team)) {
      const box = g.team_box[teamId];
      const a = aggregate(g.play_by_play ?? [], teamId);
      push("epa_per_play", adv.epa_per_play);
      push("success_rate", adv.success_rate);
      push("yards_per_play", box && box.plays_offense ? box.total_yards / box.plays_offense : null);
      push("epa_per_dropback", a.epaPerPass);
      push("epa_per_rush", a.epaPerRush);
      push("yards_per_dropback", box && box.pass_attempts ? box.pass_yards / box.pass_attempts : null);
      push("explosive_rate", adv.explosive_rate_epa);
      push("third_down_rate", box ? box.third_down_conversion_rate : null);
      push("red_zone_td_rate", adv.red_zone_td_rate);
      push("stuff_rate", adv.stuff_rate);
      push("havoc_rate", adv.havoc_rate_forced);
    }
  }
  for (const k of Object.keys(pool)) pool[k].sort((x, y) => x - y);
  return pool;
};

const population = buildPopulation();

// Percentile of a value within its field's population — share of team-games at
// or below it. Higher is better for every field here EXCEPT the two marked
// inverted, where a low number is the good outcome.
const INVERTED = new Set(["stuff_rate"]);
const percentileOf = (field, v) => {
  const arr = population[field];
  if (!arr || !arr.length || v == null || !Number.isFinite(v)) return null;
  let below = 0;
  for (const x of arr) if (x < v) below += 1;
  const p = Math.round((below / arr.length) * 100);
  return INVERTED.has(field) ? 100 - p : p;
};

// ─── Formatting ──────────────────────────────────────────────────────────────

const n2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : "—");
const n1 = (v) => (Number.isFinite(v) ? v.toFixed(1) : "—");
const pc = (v) => (Number.isFinite(v) ? `${Math.round(v * 100)}%` : "—");
const int = (v) => (Number.isFinite(v) ? String(Math.round(v)) : "—");
const countPct = (c, den) => (Number.isFinite(c) ? `${c}${den ? ` (${Math.round((c / den) * 100)}%)` : ""}` : "—");

// ─── Build ───────────────────────────────────────────────────────────────────

const game = read(path.join(GAMES_DIR, GAME_FILE));
const pbp = game.play_by_play ?? [];
const teamIds = Object.keys(game.team_box);
const homeId = game.metadata?.home_team?.id;
const orderedIds = homeId && teamIds.includes(homeId) ? [teamIds.find((t) => t !== homeId), homeId] : teamIds;

const identityOf = (id) => {
  const t = hub.teams?.[id]?.identity;
  return {
    id,
    name: t?.name ?? id,
    short: t?.short ?? id,
    logo: t?.logo ?? null,
    primary: t?.primary ?? null,
    secondary: t?.secondary ?? null,
    score: game.team_box[id]?.points_scored ?? null,
  };
};

const teams = orderedIds.map(identityOf);
const A = aggregate(pbp, orderedIds[0]);
const B = aggregate(pbp, orderedIds[1]);
const advA = game.advanced_team[orderedIds[0]];
const advB = game.advanced_team[orderedIds[1]];
const boxA = game.team_box[orderedIds[0]];
const boxB = game.team_box[orderedIds[1]];

const gaps = [];
const noteGap = (label, why) => gaps.push({ label, why });

// A shaded row carries a percentile per side; a plain row is just two numbers.
const shaded = (label, field, va, vb, fmt) => ({
  label,
  values: [
    { display: fmt(va), pct: percentileOf(field, va) },
    { display: fmt(vb), pct: percentileOf(field, vb) },
  ],
});
const plain = (label, da, db, indent = 0) => ({ label, indent, values: [{ display: da }, { display: db }] });

const ypp = (box) => (box.plays_offense ? box.total_yards / box.plays_offense : null);
const ypd = (box) => (box.pass_attempts ? box.pass_yards / box.pass_attempts : null);

if (advA.power_run_attempts == null && advB.power_run_attempts == null) {
  noteGap("Power Run Attempts / Successful Power Runs", "null in advanced_team for both sides — the export computes the field but never populates it");
}
noteGap("Per-play WPA", "the `wpa` key exists on every play row and is null on all 18,018 plays of the 2025 season, while advanced_team.wpa_total IS populated — so win probability is being computed and then dropped before the play rows are written. Blocks GOP's Most Important Plays table and every per-player WPA column.");
noteGap("xQBR", "not in the export at any level");
noteGap("Air yards / YAC", "heat_maps give yards per zone but never split air yards from yards after catch, so aDOT cannot be derived");
noteGap("Passes Defensed / Fumbles Forced as team totals", "only reachable by summing individual_stats.defense, which double-counts shared credit");

const tables = [
  {
    id: "overall",
    title: "Overall",
    shaded: true,
    rows: [
      shaded("EPA/Play", "epa_per_play", advA.epa_per_play, advB.epa_per_play, n2),
      shaded("Success Rate", "success_rate", advA.success_rate, advB.success_rate, pc),
      shaded("Yards/Play", "yards_per_play", ypp(boxA), ypp(boxB), n2),
      shaded("EPA/Dropback", "epa_per_dropback", A.epaPerPass, B.epaPerPass, n2),
      shaded("EPA/Rush", "epa_per_rush", A.epaPerRush, B.epaPerRush, n2),
      shaded("Yards/Dropback", "yards_per_dropback", ypd(boxA), ypd(boxB), n2),
      shaded("Explosive Play Rate", "explosive_rate", advA.explosive_rate_epa, advB.explosive_rate_epa, pc),
      shaded("3rd Down Success Rate", "third_down_rate", boxA.third_down_conversion_rate, boxB.third_down_conversion_rate, pc),
      shaded("Red Zone TD Rate", "red_zone_td_rate", advA.red_zone_td_rate, advB.red_zone_td_rate, pc),
      shaded("Def Run Stuff Rate", "stuff_rate", advA.stuff_rate, advB.stuff_rate, pc),
      shaded("Havoc Rate", "havoc_rate", advA.havoc_rate_forced, advB.havoc_rate_forced, pc),
    ],
  },
  {
    id: "expected_points",
    title: "Expected Points",
    footnote: "Totals may not add up — a play can sit in more than one category (a penalty on a punt).",
    rows: [
      plain("Total Plays", int(A.plays), int(B.plays)),
      plain("Total EPA", n2(A.epaTotal), n2(B.epaTotal)),
      plain("Offensive EPA", n2(A.epaOffense), n2(B.epaOffense), 1),
      plain("Special Teams EPA", n2(A.epaSpecial), n2(B.epaSpecial), 1),
      plain("Penalty EPA", n2(A.epaPenalty), n2(B.epaPenalty), 1),
    ],
  },
  {
    id: "production",
    title: "Production",
    rows: [
      plain("Scrimmage Plays", int(A.scrim), int(B.scrim)),
      plain("Yards", int(boxA.total_yards), int(boxB.total_yards), 1),
      plain("Yards/Play", n2(ypp(boxA)), n2(ypp(boxB)), 1),
      plain("EPA", n2(A.epaOffense), n2(B.epaOffense), 1),
      plain("EPA/Play", n2(A.epaPerPlay), n2(B.epaPerPlay), 1),
      plain("Passes", countPct(A.pass.length, A.scrim), countPct(B.pass.length, B.scrim)),
      plain("Yards", int(boxA.pass_yards), int(boxB.pass_yards), 1),
      plain("Yards/Play", n2(ypd(boxA)), n2(ypd(boxB)), 1),
      plain("EPA", n2(A.epaPass), n2(B.epaPass), 1),
      plain("EPA/Play", n2(A.epaPerPass), n2(B.epaPerPass), 1),
      plain("Rushes", countPct(A.rush.length, A.scrim), countPct(B.rush.length, B.scrim)),
      plain("Yards", int(boxA.rush_yards), int(boxB.rush_yards), 1),
      plain("Yards/Play", n2(boxA.yards_per_carry), n2(boxB.yards_per_carry), 1),
      plain("EPA", n2(A.epaRush), n2(B.epaRush), 1),
      plain("EPA/Play", n2(A.epaPerRush), n2(B.epaPerRush), 1),
    ],
  },
  {
    id: "rushing",
    title: "Rushing",
    rows: [
      plain("Scrimmage Plays", int(A.scrim), int(B.scrim)),
      plain("Rushes", countPct(A.rush.length, A.scrim), countPct(B.rush.length, B.scrim)),
      plain("Power Run Attempts (Down ≥ 3, Dist ≤ 2)", int(advA.power_run_attempts), int(advB.power_run_attempts), 1),
      plain("Successful Power Runs (Rate)", pc(advA.power_run_success_rate), pc(advB.power_run_success_rate), 1),
      plain("Stuffed Runs (Yds ≤ 0)", pc(advA.stuff_rate), pc(advB.stuff_rate), 1),
      plain("Stopped Runs (Yds ≤ 2)", pc(advA.stopped_run_rate), pc(advB.stopped_run_rate), 1),
      plain("Opportunity Runs (Yds ≥ 4)", pc(advA.rush_opportunity_rate), pc(advB.rush_opportunity_rate), 1),
      plain("OL Line Yards", n1(advA.line_yards_total), n1(advB.line_yards_total)),
      plain("Per Carry", n2(advA.line_yards_per_rush), n2(advB.line_yards_per_rush), 1),
      plain("Highlight Yards", n1(advA.highlight_yards_total), n1(advB.highlight_yards_total)),
      plain("Per Rush", n2(advA.highlight_yards_per_rush), n2(advB.highlight_yards_per_rush), 1),
    ],
  },
  {
    id: "explosiveness",
    title: "Explosiveness",
    footnote: `Explosive = EPA above ${EXPLOSIVE_PASS} passing, ${EXPLOSIVE_RUSH} rushing.`,
    rows: [
      plain("Total Plays", int(A.plays), int(B.plays)),
      plain("Scrimmage Plays", int(A.scrim), int(B.scrim)),
      plain("Explosive Plays", countPct(A.explosive, A.scrim), countPct(B.explosive, B.scrim)),
      plain("When Passing", countPct(A.explosivePass, A.pass.length), countPct(B.explosivePass, B.pass.length), 1),
      plain("When Rushing", countPct(A.explosiveRush, A.rush.length), countPct(B.explosiveRush, B.rush.length), 1),
      plain("EPA w/o Explosive Plays", n2(A.epaNoExplosive), n2(B.epaNoExplosive)),
      plain("EPA/Play", n2(A.epaNoExplosivePerPlay), n2(B.epaNoExplosivePerPlay), 1),
      plain("When Passing", n2(A.epaNoExplosivePass), n2(B.epaNoExplosivePass), 1),
      plain("When Rushing", n2(A.epaNoExplosiveRush), n2(B.epaNoExplosiveRush), 1),
    ],
  },
  {
    id: "situational",
    title: "Situational",
    // Two different definitions of "successful", both legitimate, and they do
    // not agree: this table counts a play successful when it gained EPA, which
    // is what GOP shows here. advanced_team.success_rate — the number in the
    // Overall table — uses the down-and-distance rule instead (half the yards
    // on first, 70% on second, all of them on third and fourth).
    footnote: "Successful here means EPA > 0. The Overall table's Success Rate uses the down-and-distance rule, so the two differ by a few points on purpose.",
    rows: [
      plain("Successful Plays (EPA > 0)", countPct(A.successAll, A.withEpaCount), countPct(B.successAll, B.withEpaCount)),
      plain("When Passing", countPct(A.successPass, A.passRateDen), countPct(B.successPass, B.passRateDen), 1),
      plain("When Rushing", countPct(A.successRush, A.rushRateDen), countPct(B.successRush, B.rushRateDen), 1),
      plain("On Standard Downs", countPct(A.successStandard, A.standard.length), countPct(B.successStandard, B.standard.length), 1),
      plain("On Passing Downs", countPct(A.successPassing, A.passing.length), countPct(B.successPassing, B.passing.length), 1),
      plain("On Early Downs", countPct(A.successEarly, A.early.length), countPct(B.successEarly, B.early.length), 1),
      plain("On Late Downs", countPct(A.successLate, A.late.length), countPct(B.successLate, B.late.length), 1),
      plain("During “Middle 8”", countPct(A.successMid8, A.mid8.length), countPct(B.successMid8, B.mid8.length), 1),
      plain("Early Downs", int(A.early.length), int(B.early.length)),
      plain("First Downs Created", countPct(A.firstDownsEarly, A.early.length), countPct(B.firstDownsEarly, B.early.length), 1),
      plain("Late Downs", int(A.late.length), int(B.late.length)),
    ],
  },
  {
    id: "drives",
    title: "Drives",
    rows: (() => {
      const drivesFor = (id) => (game.drive_summary ?? []).filter((d) => d.offense_team === id);
      const stat = (id) => {
        const ds = drivesFor(id);
        if (!ds.length) return { total: 0 };
        const plays = ds.reduce((s, d) => s + (d.plays_total ?? 0), 0);
        const yards = ds.reduce((s, d) => s + (d.yards_net ?? 0), 0);
        const startAvg = ds.reduce((s, d) => s + (d.start_yardline_absolute ?? 0), 0) / ds.length;
        const available = ds.reduce((s, d) => s + (100 - (d.start_yardline_absolute ?? 0)), 0);
        return { total: ds.length, plays: plays / ds.length, yards: yards / ds.length, startAvg, avail: available ? yards / available : null };
      };
      const sa = stat(orderedIds[0]); const sb = stat(orderedIds[1]);
      return [
        plain("Total", int(sa.total), int(sb.total)),
        plain("Avg Starting Field Position", `Own ${int(sa.startAvg)}`, `Own ${int(sb.startAvg)}`),
        plain("Plays/Drive", n2(sa.plays), n2(sb.plays)),
        plain("Yards/Drive", n2(sa.yards), n2(sb.yards)),
        plain("Available Yards %", pc(sa.avail), pc(sb.avail)),
      ];
    })(),
  },
  {
    id: "defensive",
    title: "Defensive",
    rows: [
      plain("Scrimmage Plays Faced", int(B.scrim), int(A.scrim)),
      plain("Havoc Rate Forced", pc(advA.havoc_rate_forced), pc(advB.havoc_rate_forced)),
      plain("TFL Rate Forced", pc(advA.tfl_rate_forced), pc(advB.tfl_rate_forced), 1),
      plain("Sack Rate Forced", pc(advA.sack_rate_forced), pc(advB.sack_rate_forced), 1),
      plain("Pass Defended Rate", pc(advA.pass_defended_rate_forced), pc(advB.pass_defended_rate_forced), 1),
      plain("Sacks Made", int(boxA.sacks_made), int(boxB.sacks_made)),
      plain("Havoc Rate Allowed", pc(advA.havoc_rate_allowed), pc(advB.havoc_rate_allowed)),
    ],
  },
  {
    id: "turnovers",
    title: "Turnovers",
    rows: [
      plain("Turnovers", int(boxA.turnovers_committed), int(boxB.turnovers_committed)),
      plain("Interceptions Thrown", int(boxA.interceptions_thrown), int(boxB.interceptions_thrown), 1),
      plain("Turnovers Forced", int(boxA.turnovers_forced), int(boxB.turnovers_forced)),
      plain("Turnover Margin", int(boxA.turnovers_forced - boxA.turnovers_committed), int(boxB.turnovers_forced - boxB.turnovers_committed)),
      plain("Expected Turnovers", n1(advA.expected_turnovers), n1(advB.expected_turnovers)),
      plain("Turnover Luck", n1(advA.turnover_luck), n1(advB.turnover_luck)),
    ],
  },
];

// ─── Matrices ────────────────────────────────────────────────────────────────
// GOP's target and rush matrices, straight from heat_maps. Air yards and YAC
// are not in the export, so the aDOT line they carry is simply absent.

const matrices = orderedIds.map((id) => ({
  team: identityOf(id),
  pass: game.heat_maps?.[id]?.pass_heat_map ?? null,
  rush: game.heat_maps?.[id]?.rush_heat_map ?? null,
}));

// ─── Player lines ────────────────────────────────────────────────────────────
// EPA, success rate and WPA per player, attributed through play_by_play
// `actions` (which name the passer, rusher and receiver) and joined to the
// counting lines in individual_stats.

const playerEpa = {};
for (const p of pbp) {
  const e = epaOf(p);
  const w = typeof p.wpa === "number" ? p.wpa : null;
  if (e == null || !p.offense_team) continue;
  for (const a of p.actions ?? []) {
    for (const [role, who] of [["pass", a.passer], ["rush", a.rusher], ["recv", a.receiver]]) {
      if (!who) continue;
      const k = `${p.offense_team}|${role}|${who}`;
      const row = (playerEpa[k] = playerEpa[k] ?? { epa: 0, wpa: 0, plays: 0, success: 0 });
      row.epa += e; row.wpa += w ?? 0; row.plays += 1; if (e > 0) row.success += 1;
    }
  }
}
const advFor = (teamId, role, name) => {
  const r = playerEpa[`${teamId}|${role}|${name}`];
  if (!r) return { epa: null, epaPerPlay: null, sr: null, wpa: null };
  return { epa: r.epa, epaPerPlay: r.plays ? r.epa / r.plays : null, sr: r.plays ? r.success / r.plays : null, wpa: r.wpa };
};

const players = orderedIds.map((id) => {
  const s = game.individual_stats?.[id] ?? {};
  const line = (role, arr, describe) =>
    (arr ?? []).map((row) => {
      const a = advFor(id, role, row.name);
      return {
        name: row.name,
        stat_line: describe(row),
        epa: a.epa == null ? "—" : n2(a.epa),
        epa_per_play: a.epaPerPlay == null ? "—" : n2(a.epaPerPlay),
        sr: a.sr == null ? "—" : pc(a.sr),
      };
    });
  return {
    team: identityOf(id),
    dropbacks: line("pass", s.passing, (r) =>
      `${r.completions}/${r.attempts}, ${r.yards} yds, ${r.touchdowns} TD, ${r.interceptions} INT, ${r.sacks_taken} Sck`),
    rushes: line("rush", s.rushing, (r) =>
      `${r.attempts} carries, ${r.yards} yds, ${r.touchdowns} TD, ${r.fumbles} Fum`),
    targets: line("recv", s.receiving, (r) =>
      `${r.receptions} catches (${r.targets} targets), ${r.yards} yds, ${r.touchdowns} TD`),
  };
});

// ─── Play lists ──────────────────────────────────────────────────────────────

const playRow = (p) => ({
  time: `Q${p.quarter} ${p.clock ?? ""}`.trim(),
  offense: identityOf(p.offense_team).short,
  text: p.raw_text,
  epa: epaOf(p) == null ? "—" : n2(epaOf(p)),
});
const scored = pbp.filter((p) => epaOf(p) != null && p.offense_team);
const bigPlays = [...scored].sort((a, b) => Math.abs(epaOf(b)) - Math.abs(epaOf(a))).slice(0, 10).map(playRow);
// GOP's "Most Important Plays" ranks by |WPA|. Not one play in the 2025 export
// carries a per-play wpa — it is present as a key and null on all 18,018 of
// them — so the table cannot be built and is reported as a gap instead of being
// quietly re-ranked by EPA, which would just duplicate Big Plays.
const importantPlays = [];
const scoringPlays = (game.scoring_summary ?? []).map((s) => ({
  time: `Q${s.period} ${s.clock}`,
  offense: identityOf(s.team_id).short,
  text: s.description,
  points: s.points,
}));

// ─── Emit ────────────────────────────────────────────────────────────────────

const out = {
  generated_at: new Date().toISOString(),
  source_file: `games/${SEASON}/${GAME_FILE}`,
  game: {
    game_id: game.metadata?.game_id ?? null,
    date: game.metadata?.date ?? null,
    venue: String(game.metadata?.site ?? "").split(" Score By Quarters")[0] || null,
    attendance: game.metadata?.attendance ?? null,
  },
  teams,
  tables,
  matrices,
  players,
  big_plays: bigPlays,
  important_plays: importantPlays,
  scoring_plays: scoringPlays,
  percentile_basis: {
    season: SEASON,
    team_games: population.success_rate?.length ?? 0,
    note: "Percentiles are against every parsed team-game in our own season, not against FBS.",
  },
  gaps,
};

fs.writeFileSync(OUT, JSON.stringify(out));
console.log(`wrote ${path.relative(ROOT, OUT)}  (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
console.log(`  game: ${teams.map((t) => `${t.short} ${t.score}`).join(" vs ")}   ${out.game.date}`);
console.log(`  tables ${tables.length}  ·  rows ${tables.reduce((s, t) => s + t.rows.length, 0)}`);
console.log(`  percentile basis: ${out.percentile_basis.team_games} team-games`);
console.log(`  players ${players.map((p) => p.dropbacks.length + p.rushes.length + p.targets.length).join(" / ")}`);
console.log(`  plays: big ${bigPlays.length}, important ${importantPlays.length}, scoring ${scoringPlays.length}`);
console.log(`  gaps flagged: ${gaps.length}`);
gaps.forEach((g) => console.log(`    - ${g.label}: ${g.why}`));
