#!/usr/bin/env node
// Counting-stats MOCK for /stats/team and /stats/player.
//
// The backend has no season counting-stat aggregate yet (see
// src/pages/stats/md/Counting Stats Fetch Contract.md — that doc is the ask).
// Until it ships, this builds two files in the contract's exact shape from
// real teams (src/data/teams.json) and the real 2025 roster
// (public/data/93-FE Docs/players/roster/player_seasons_2025.json), with
// seeded pseudo-random numbers in plausible FCS ranges. Every file carries
// `source: "mock"` and the pages label it. Nothing here is a real stat.
//
//   node scripts/build_counting_stats_mock.js [season]
//
// Outputs:
//   public/data/0-data/counting_team_stats_{season}.json
//   public/data/0-data/counting_player_stats_{season}.json

const fs = require("fs");
const path = require("path");

const SEASON = Number(process.argv[2] || 2025);
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public", "data", "0-data");

const teams = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "data", "teams.json"), "utf8")).teams;
const rosterPath = path.join(ROOT, "public", "data", "93-FE Docs", "players", "roster", `player_seasons_${SEASON}.json`);
const roster = fs.existsSync(rosterPath) ? JSON.parse(fs.readFileSync(rosterPath, "utf8")) : [];

// ─── seeded PRNG (mulberry32) so the mock is stable run to run ─────────────
let seed = 20260921 + SEASON;
const rand = () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const int = (lo, hi) => Math.floor(lo + rand() * (hi - lo + 1));
const num = (lo, hi, dec = 1) => Number((lo + rand() * (hi - lo)).toFixed(dec));
const r1 = (x) => Number(x.toFixed(1));
const r2 = (x) => Number(x.toFixed(2));
const r3 = (x) => Number(x.toFixed(3));

const v5 = (t) => t.exportId.replace(/25$/, "");

// ─── team side: one block set, used for offense (own) and defense (allowed) ─
const buildSide = (g, strength) => {
  // strength in [-1, 1] nudges every volume stat so the league has a spread.
  const k = 1 + 0.25 * strength;
  const rushAtt = int(30 * g, 42 * g);
  const rushYds = Math.round(rushAtt * num(3.4, 5.6) * k);
  const passAtt = int(22 * g, 36 * g);
  const cmp = Math.round(passAtt * num(0.5, 0.66));
  const passYds = Math.round(passAtt * num(6.0, 8.6) * k);
  const rushTd = int(1 * g, 3 * g);
  const passTd = int(1 * g, 3 * g);
  const fgm = int(0, 2 * g);
  const fga = fgm + int(0, g);
  const td = rushTd + passTd + int(0, 1);
  const xptMade = td - int(0, 1);
  const twoPt = int(0, 1);
  const saf = int(0, 1) === 1 && rand() < 0.2 ? 1 : 0;
  const pts = td * 6 + fgm * 3 + Math.max(0, xptMade) + twoPt * 2 + saf * 2;
  const plays = rushAtt + passAtt;
  const yds = rushYds + passYds;
  const puntNo = int(3 * g, 6 * g);
  const puntYds = Math.round(puntNo * num(37, 44));
  const prNo = int(1 * g, 3 * g);
  const krNo = int(2 * g, 5 * g);
  const ua = int(30 * g, 45 * g);
  const a = int(15 * g, 30 * g);
  const tfl = int(3 * g, 8 * g);
  const sacks = int(0, 3 * g) + (rand() < 0.5 ? 0.5 : 0);
  const thirdAtt = int(12 * g, 16 * g);
  const thirdConv = Math.round(thirdAtt * num(0.3, 0.5));
  const fourthAtt = int(0, 3 * g);
  const fourthConv = Math.round(fourthAtt * num(0.3, 0.7));
  const rzAtt = int(2 * g, 5 * g);
  const rzTd = Math.round(rzAtt * num(0.45, 0.7));
  const rzFg = Math.min(rzAtt - rzTd, int(0, g));
  const fdRush = int(4 * g, 9 * g);
  const fdPass = int(5 * g, 10 * g);
  const fdPen = int(0, 2 * g);
  const fum = int(0, 2 * g);
  const pen = int(4 * g, 9 * g);
  const topSec = int(26 * 60, 34 * 60);
  return {
    scoring: { td, fg: fgm, xpt: Math.max(0, xptMade), two_pt: twoPt, def_xp: 0, saf, pts, avg_g: r1(pts / g) },
    totals: { rush: rushYds, pass: passYds, plays, yds, avg_p: r1(yds / plays), td, avg_g: r1(yds / g) },
    rushing: { att: rushAtt, yds: rushYds, avg: r1(rushYds / rushAtt), td: rushTd, long: int(18, 75), avg_g: r1(rushYds / g) },
    passing: {
      att: passAtt, cmp, int: int(0, 2 * g), pct: r3(cmp / passAtt), yds: passYds, avg_a: r1(passYds / passAtt),
      td: passTd, long: int(25, 88), avg_g: r1(passYds / g),
    },
    returns: {
      pr: (() => { const y = Math.round(prNo * num(4, 12)); return { no: prNo, yds: y, avg: r1(y / Math.max(1, prNo)), td: rand() < 0.1 ? 1 : 0, long: int(5, 60) }; })(),
      kr: (() => { const y = Math.round(krNo * num(16, 25)); return { no: krNo, yds: y, avg: r1(y / Math.max(1, krNo)), td: rand() < 0.08 ? 1 : 0, long: int(20, 95) }; })(),
    },
    kicking: {
      punting: { no: puntNo, yds: puntYds, avg: r1(puntYds / puntNo), long: int(45, 68), tb: int(0, 2), fc: int(0, 4), i20: int(1, Math.max(2, Math.floor(puntNo / 2))), blk: rand() < 0.15 ? 1 : 0 },
      fg: { fgm, fga, pct: fga ? r3(fgm / fga) : null, long: fgm ? int(25, 52) : null, blk: rand() < 0.15 ? 1 : 0, pat_made: Math.max(0, xptMade), pat_att: td },
    },
    defense: {
      ua, a, tot: ua + a, tfl, sacks, int: int(0, 2 * g), brup: int(3 * g, 8 * g), qbh: int(1 * g, 5 * g),
      fr: int(0, g), ff: int(0, g), blk: rand() < 0.2 ? 1 : 0, saf,
    },
    conversions: {
      third: { att: thirdAtt, conv: thirdConv, pct: r3(thirdConv / thirdAtt) },
      fourth: { att: fourthAtt, conv: fourthConv, pct: fourthAtt ? r3(fourthConv / fourthAtt) : null },
      red_zone: { att: rzAtt, scores: rzTd + rzFg, td: rzTd, fg: rzFg, pct: rzAtt ? r3((rzTd + rzFg) / rzAtt) : null },
    },
    misc: {
      first_downs: fdRush + fdPass + fdPen, fd_rush: fdRush, fd_pass: fdPass, fd_pen: fdPen,
      fum, fum_lost: int(0, fum), pen, pen_yds: Math.round(pen * num(7, 11)), top_avg: topSec,
    },
  };
};

const teamRows = teams.map((t, i) => {
  const games = int(3, 4);
  const strength = ((i * 7) % 18) / 8.5 - 1; // spread −1..1 deterministically
  return {
    team_id: v5(t),
    name: t.name,
    short: t.shortName,
    conference: t.conference,
    division: t.division ?? null,
    games,
    offense: buildSide(games, strength),
    defense: buildSide(games, -strength),
  };
});

// ─── players ────────────────────────────────────────────────────────────────
// Keyed on position_group (RB, WR, DB, DL …) except specialists, which the
// roster groups as "ST" — key those on the exact position (K, P) instead.
const byTeamPos = {};
for (const p of roster) {
  const group = p.position_group === "ST" ? p.position : (p.position_group || p.position);
  const key = `${p.team_id}|${group}`;
  (byTeamPos[key] ||= []).push(p);
}
const take = (teamId, pos, n) => {
  const pool = byTeamPos[`${teamId}|${pos}`] ?? [];
  return pool.slice(0, n);
};
const gamesFor = Object.fromEntries(teamRows.map((t) => [t.team_id, t.games]));
const pname = (p) => `${p.last_name},${p.first_name}`;

const players = [];
const push = (p, teamId, blocks) => {
  const g = Math.max(1, gamesFor[teamId] - (rand() < 0.2 ? 1 : 0));
  players.push({
    person_id: p.person_id,
    name: pname(p),
    display_name: p.full_name,
    team_id: teamId,
    position: p.position,
    jersey: p.jersey_number ?? null,
    games: g,
    ...blocks(g),
  });
};

for (const t of teamRows) {
  const id = t.team_id;
  // QBs
  take(id, "QB", 2).forEach((p, i) => push(p, id, (g) => {
    const att = i === 0 ? int(20 * g, 34 * g) : int(3, 10);
    const cmp = Math.round(att * num(0.5, 0.68));
    const yds = Math.round(att * num(6, 8.8));
    const td = int(0, 2 * g); const ints = int(0, g);
    const rushAtt = int(4, 12 * g); const rushYds = Math.round(rushAtt * num(1.5, 6));
    const effic = r1((8.4 * yds + 330 * td + 100 * cmp - 200 * ints) / Math.max(1, att));
    return {
      passing: { att, cmp, int: ints, pct: r3(cmp / att), yds, td, long: int(20, 85), effic, avg_g: r1(yds / g) },
      rushing: { att: rushAtt, yds: rushYds, avg: r1(rushYds / rushAtt), td: int(0, 2), long: int(5, 40), avg_g: r1(rushYds / g) },
      total_offense: { rush: rushYds, pass: yds, plays: att + rushAtt, total: rushYds + yds, yds_g: r1((rushYds + yds) / g) },
      scoring: null, receiving: null, returns: null, all_purpose: null, punting: null, fgs: null, defense: null,
    };
  }));
  // RBs
  take(id, "RB", 3).forEach((p, i) => push(p, id, (g) => {
    const att = i === 0 ? int(12 * g, 18 * g) : int(4 * g, 10 * g);
    const yds = Math.round(att * num(3.2, 7.5));
    const rec = int(0, 4 * g); const rcv = Math.round(rec * num(5, 12));
    const kr = rand() < 0.3 ? int(1, 3 * g) : 0; const krYds = Math.round(kr * num(16, 26));
    const td = int(0, 2 * g);
    const pts = td * 6;
    return {
      rushing: { att, yds, avg: r1(yds / att), td, long: int(10, 75), avg_g: r1(yds / g) },
      receiving: rec ? { rec, yds: rcv, td: int(0, 1), long: int(5, 40), avg_c: r1(rcv / rec), rec_g: r1(rec / g), avg_g: r1(rcv / g) } : null,
      scoring: pts ? { td, fg: 0, pat: 0, two_pt: 0, pts, avg_g: r1(pts / g) } : null,
      returns: kr ? { pr: null, kr: { no: kr, yds: krYds, avg: r1(krYds / kr), td: 0, long: int(20, 60) } } : null,
      total_offense: { rush: yds, pass: 0, plays: att, total: yds, yds_g: r1(yds / g) },
      all_purpose: { rush: yds, rcv, pr: 0, kr: krYds, yds: yds + rcv + krYds, yds_g: r1((yds + rcv + krYds) / g) },
      passing: null, punting: null, fgs: null, defense: null,
    };
  }));
  // WR / TE
  [...take(id, "WR", 4), ...take(id, "TE", 1)].forEach((p, i) => push(p, id, (g) => {
    const rec = i === 0 ? int(4 * g, 7 * g) : int(1 * g, 4 * g);
    const yds = Math.round(rec * num(8, 22));
    const pr = rand() < 0.25 ? int(1, 2 * g) : 0; const prYds = Math.round(pr * num(4, 14));
    const td = int(0, g);
    return {
      receiving: { rec, yds, td, long: int(12, 94), avg_c: r1(yds / rec), rec_g: r1(rec / g), avg_g: r1(yds / g) },
      scoring: td ? { td, fg: 0, pat: 0, two_pt: 0, pts: td * 6, avg_g: r1((td * 6) / g) } : null,
      returns: pr ? { pr: { no: pr, yds: prYds, avg: r1(prYds / pr), td: 0, long: int(5, 45) }, kr: null } : null,
      all_purpose: { rush: 0, rcv: yds, pr: prYds, kr: 0, yds: yds + prYds, yds_g: r1((yds + prYds) / g) },
      rushing: null, passing: null, total_offense: null, punting: null, fgs: null, defense: null,
    };
  }));
  // K / P
  take(id, "K", 1).forEach((p) => push(p, id, (g) => {
    const fga = int(1, 2 * g); const fgm = int(0, fga);
    const pat = int(2 * g, 4 * g);
    const bands = [int(0, 1), int(0, 1), int(0, 1), int(0, 1), 0];
    return {
      fgs: {
        fgm, fga, pct: r3(fgm / fga), r0_19: `${bands[0]}-${bands[0]}`, r20_29: `${bands[1]}-${bands[1] + (fga > fgm ? 1 : 0)}`,
        r30_39: `${bands[2]}-${bands[2]}`, r40_49: `${bands[3]}-${bands[3]}`, r50: `0-0`, long: fgm ? int(25, 52) : null, blk: 0,
      },
      scoring: { td: 0, fg: fgm, pat, two_pt: 0, pts: fgm * 3 + pat, avg_g: r1((fgm * 3 + pat) / g) },
      rushing: null, passing: null, receiving: null, returns: null, total_offense: null, all_purpose: null, punting: null, defense: null,
    };
  }));
  take(id, "P", 1).forEach((p) => push(p, id, (g) => {
    const no = int(3 * g, 6 * g); const yds = Math.round(no * num(37, 45));
    return {
      punting: { no, yds, avg: r1(yds / no), long: int(45, 70), tb: int(0, 2), fc: int(0, 4), i20: int(1, Math.max(2, Math.floor(no / 2))), fifty_plus: int(0, 3), blk: 0 },
      rushing: null, passing: null, receiving: null, scoring: null, returns: null, total_offense: null, all_purpose: null, fgs: null, defense: null,
    };
  }));
  // Defense
  [...take(id, "LB", 4), ...take(id, "DB", 5), ...take(id, "DL", 4)].forEach((p, i) => push(p, id, (g) => {
    const isDL = p.position_group === "DL" || p.position === "DL";
    const ua = int(isDL ? 2 * g : 3 * g, isDL ? 5 * g : 9 * g);
    const a = int(1 * g, 5 * g);
    const tfl = isDL ? num(0, 2.5 * g, 1) : num(0, 1.5 * g, 1);
    const sacks = isDL ? num(0, 1.5 * g, 1) : num(0, 0.5 * g, 1);
    const ints = !isDL && rand() < 0.35 ? int(1, 2) : 0;
    const ff = rand() < 0.25 ? 1 : 0; const fr = rand() < 0.2 ? 1 : 0;
    const brup = !isDL ? int(0, 2 * g) : int(0, 1);
    const roundHalf = (x) => Math.round(x * 2) / 2;
    const tflR = roundHalf(tfl), sacksR = roundHalf(sacks);
    return {
      defense: {
        ua, a, tot: ua + a, tot_g: r1((ua + a) / g), tfl: tflR, tfl_yds: Math.round(tflR * num(2, 7)), tfl_g: r2(tflR / g),
        sacks: sacksR, sack_yds: Math.round(sacksR * num(5, 9)), sacks_g: r2(sacksR / g),
        int: ints, int_yds: ints ? int(0, 45) : 0, int_td: ints && rand() < 0.15 ? 1 : 0, int_long: ints ? int(0, 45) : 0,
        ff, fr, fr_yds: fr ? int(0, 20) : 0, fr_td: 0, ff_fr: ff + fr,
        brup, pd: brup + ints, qbh: int(0, 2 * g), blk: 0, saf: 0,
      },
      rushing: null, passing: null, receiving: null, scoring: null, returns: null, total_offense: null, all_purpose: null, punting: null, fgs: null,
    };
  }));
}

const stamp = new Date().toISOString();
const teamOut = {
  season: SEASON,
  generated_at: stamp,
  source: "mock",
  note: "MOCK — seeded numbers on real teams. Replace with GET /api/stats/team/{season} (Counting Stats Fetch Contract).",
  games_through: { week: 4, label: "Week 4" },
  teams: teamRows,
};
const playerOut = {
  season: SEASON,
  generated_at: stamp,
  source: "mock",
  note: "MOCK — seeded numbers on the real roster. Replace with GET /api/stats/player/{season} (Counting Stats Fetch Contract).",
  games_through: { week: 4, label: "Week 4" },
  players,
};

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, `counting_team_stats_${SEASON}.json`), JSON.stringify(teamOut, null, 2));
fs.writeFileSync(path.join(OUT, `counting_player_stats_${SEASON}.json`), JSON.stringify(playerOut, null, 2));
console.log(`wrote counting_team_stats_${SEASON}.json (${teamRows.length} teams) and counting_player_stats_${SEASON}.json (${players.length} players)`);
