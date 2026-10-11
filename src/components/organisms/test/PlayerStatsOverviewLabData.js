// ═══════════════════════════════════════════════════════════════
// SHARED LAB DATA — Player Stats Overview variants A / B / C
//
// One data module so all three variants render IDENTICAL numbers and the
// comparison is purely about layout and visual treatment.
//
// REAL (from public/data/0-data/player_stats_2025_enriched.json, verified):
//   identity, games_played, total_production, avg_production, par,
//   season_components, and the full games[] series with per-game components.
//   Opponent / home-away / date are parsed from game_id (AWAY+HOME+DDMMYYYY).
//
// DERIVED (computed below from the real series, no backend needed):
//   replacement baseline, floor/median/ceiling, stddev, boom/bust,
//   games above replacement, last-3 / last-5 form.
//
// MOCK (clearly flagged — these fields do NOT exist in any data source yet;
//   see src/pages/players/md/Player Page Design Doc.md sections 5 and 7):
//   every counting stat, EPA / WPA / success rate, snap + share fields,
//   conference ranks.
// ═══════════════════════════════════════════════════════════════

export const LAB_TEAM = {
  name: "Prairie View A&M",
  shortName: "PVAMU",
  primary: "#4B0082",
  secondary: "#FFB81C",
};

export const LAB_PLAYER = {
  name: "Cameron Peters",
  jersey: 4,
  position: "QB",
  classYear: "Sr.",
  team: "PVAMU",
  gamesPlayed: 10,
};

// ── REAL season production ──────────────────────────────────────
export const LAB_PRODUCTION = {
  totalProduction: 197.34,
  avgProduction: 19.734,
  par: 142.255,
  components: {
    passing_production: 163.2,
    rushing_production: 34.14,
  },
};

// REAL relationship, verified across all 1,054 enriched records:
//   sum(components) === total_production   and   par = total_production - replacement
export const LAB_REPLACEMENT = +(LAB_PRODUCTION.totalProduction - LAB_PRODUCTION.par).toFixed(3);
export const LAB_REPLACEMENT_PER_GAME = +(LAB_REPLACEMENT / LAB_PLAYER.gamesPlayed).toFixed(3);
export const LAB_PAR_PER_GAME = +(LAB_PRODUCTION.par / LAB_PLAYER.gamesPlayed).toFixed(2);

// ── REAL per-game series (chronological) ────────────────────────
export const LAB_GAMES = [
  { wk: 1, label: "Aug 30", opp: "TSU", away: true, total: 22.86, pass: 19.41, rush: 3.45 },
  { wk: 2, label: "Sep 27", opp: "GRAM", away: false, total: 1.40, pass: 1.5, rush: -0.1 },
  { wk: 3, label: "Oct 4", opp: "ALC", away: true, total: 16.47, pass: 12.69, rush: 3.78 },
  { wk: 4, label: "Oct 18", opp: "SU", away: true, total: 16.53, pass: 16.14, rush: 0.39 },
  { wk: 5, label: "Nov 1", opp: "ASU", away: false, total: 5.64, pass: 0.27, rush: 5.37 },
  { wk: 6, label: "Nov 8", opp: "AAMU", away: true, total: 35.16, pass: 33.03, rush: 2.13 },
  { wk: 7, label: "Nov 15", opp: "UAPB", away: false, total: 22.74, pass: 21.15, rush: 1.59 },
  { wk: 8, label: "Nov 22", opp: "MVSU", away: false, total: 16.59, pass: 12.0, rush: 4.59 },
  { wk: 9, label: "Dec 6", opp: "JSU", away: true, total: 20.83, pass: 13.29, rush: 7.54 },
  { wk: 10, label: "Dec 13", opp: "SCSU", away: false, total: 39.12, pass: 33.72, rush: 5.4 },
];

// ── DERIVED distribution ────────────────────────────────────────
const totals = LAB_GAMES.map((g) => g.total).slice().sort((a, b) => a - b);
const quantile = (sorted, q) => {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base + 1] !== undefined
    ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
    : sorted[base];
};
const mean = LAB_PRODUCTION.avgProduction;
const variance = LAB_GAMES.reduce((a, g) => a + (g.total - mean) ** 2, 0) / LAB_GAMES.length;

export const LAB_RANGE = {
  floor: +quantile(totals, 0.25).toFixed(2),
  median: +quantile(totals, 0.5).toFixed(2),
  ceiling: +quantile(totals, 0.75).toFixed(2),
  min: totals[0],
  max: totals[totals.length - 1],
  stddev: +Math.sqrt(variance).toFixed(2),
  spread: +(totals[totals.length - 1] - totals[0]).toFixed(2),
  boomGames: LAB_GAMES.filter((g) => g.total >= mean * 1.5).length,
  bustGames: LAB_GAMES.filter((g) => g.total <= mean * 0.5).length,
  aboveReplacement: LAB_GAMES.filter((g) => g.total > LAB_REPLACEMENT_PER_GAME).length,
};

// ── DERIVED form ────────────────────────────────────────────────
const avgOf = (arr) => arr.reduce((a, g) => a + g.total, 0) / arr.length;
const last3 = LAB_GAMES.slice(-3);
const last5 = LAB_GAMES.slice(-5);

export const LAB_FORM = {
  last3Avg: +avgOf(last3).toFixed(2),
  last5Avg: +avgOf(last5).toFixed(2),
  last3Delta: +(avgOf(last3) - mean).toFixed(2),
  last5Delta: +(avgOf(last5) - mean).toFixed(2),
  last3Pct: Math.round(((avgOf(last3) - mean) / mean) * 100),
  last5Pct: Math.round(((avgOf(last5) - mean) / mean) * 100),
  rolling3: LAB_GAMES.map((_, i, arr) => {
    const w = arr.slice(Math.max(0, i - 2), i + 1);
    return +(w.reduce((a, g) => a + g.total, 0) / w.length).toFixed(2);
  }),
};

// ── DERIVED signature games (real opponents + real PAR) ─────────
const best = LAB_GAMES.reduce((a, b) => (b.total > a.total ? b : a));
const worst = LAB_GAMES.reduce((a, b) => (b.total < a.total ? b : a));

export const LAB_MOMENTS = {
  best: { ...best, kind: "best", label2: "BEST GAME" },
  worst: { ...worst, kind: "worst", label2: "WORST GAME" },
  mostRecent: { ...LAB_GAMES[LAB_GAMES.length - 1], kind: "recent", label2: "MOST RECENT" },
  debut: { ...LAB_GAMES[0], kind: "debut", label2: "SEASON DEBUT" },
  // MOCK — no rivalry/homecoming/primetime flags exist in the pipeline yet.
  rivalry: { ...LAB_GAMES[8], kind: "rivalry", label2: "RIVALRY" },
  standoutPlay: {
    kind: "play",
    label2: "STANDOUT PLAY",
    text: "58-yd TD strike on 3rd & 12 to flip the fourth quarter",
    epa: 4.8,
    opp: "SCSU",
    wk: 10,
  },
};

// ── MOCK counting stats ─────────────────────────────────────────
// No counting stats exist in ANY data source. Magnitudes here are scaled to
// look plausible against the real production split (passing 163.2 vs
// rushing 34.14) so the layouts are judged on realistic proportions.
export const LAB_BLOCKS = [
  {
    key: "passing",
    label: "Passing",
    production: 163.2,
    par: 108.12,
    replacement: 55.08,
    primary: true,
    stats: [
      { key: "cmp_att", label: "CMP/ATT", value: "184/287" },
      { key: "comp_pct", label: "CMP%", value: "64.1" },
      { key: "pass_yds", label: "YDS", value: "2,941" },
      { key: "pass_td", label: "TD", value: "24" },
      { key: "int", label: "INT", value: "8" },
      { key: "yds_per_att", label: "Y/A", value: "10.2" },
      { key: "long_pass", label: "LONG", value: "62" },
      { key: "first_downs", label: "1ST", value: "91" },
    ],
    extras: [
      { key: "dropbacks", label: "DROPBACKS", value: "305" },
      { key: "sacks_taken", label: "SACKED", value: "18" },
      { key: "sack_yds_lost", label: "SACK YDS", value: "-112" },
      { key: "net_yds_per_att", label: "NET Y/A", value: "8.9" },
    ],
    explosive: [
      { key: "20plus", label: "20+ YD", value: 18, of: 30 },
      { key: "40plus", label: "40+ YD", value: 4, of: 30 },
    ],
  },
  {
    key: "rushing",
    label: "Rushing",
    production: 34.14,
    par: 31.2,
    replacement: 2.94,
    primary: false,
    stats: [
      { key: "rush_att", label: "ATT", value: "72" },
      { key: "rush_yds", label: "YDS", value: "318" },
      { key: "ypc", label: "YPC", value: "4.4" },
      { key: "rush_td", label: "TD", value: "5" },
      { key: "long_rush", label: "LONG", value: "31" },
      { key: "first_downs_rushing", label: "1ST", value: "19" },
    ],
    extras: [
      { key: "scrambles", label: "SCRAMBLES", value: "28" },
      { key: "scramble_yds", label: "SCR YDS", value: "186" },
      { key: "designed_runs", label: "DESIGNED", value: "44" },
      { key: "inside_5", label: "TD INSIDE 5", value: "4" },
    ],
    explosive: [
      { key: "10plus", label: "10+ YD", value: 8, of: 20 },
      { key: "20plus", label: "20+ YD", value: 3, of: 20 },
    ],
  },
];

// ── MOCK efficiency ─────────────────────────────────────────────
export const LAB_EFFICIENCY = {
  epaTotal: 41.2,
  epaPerPlay: 0.18,
  epaPassing: 33.8,
  epaRushing: 7.4,
  wpaTotal: 1.84,
  successRate: 62.4,
  successRatePassing: 63.8,
  successRateRushing: 57.1,
};

// ── MOCK role / share ───────────────────────────────────────────
export const LAB_ROLE = [
  { key: "team_production", label: "Team Production", pct: 71 },
  { key: "team_yards", label: "Team Yards", pct: 74 },
  { key: "team_tds", label: "Team TDs", pct: 63 },
  { key: "dropback_share", label: "Dropback Share", pct: 84 },
  { key: "snap_share", label: "Snap Share", pct: 91 },
];
export const LAB_WEEKS_LEADER = 9;

// ── MOCK comparatives ───────────────────────────────────────────
export const LAB_COMPARATIVES = [
  { key: "pass_yds", label: "Pass Yards", rank: 2, of: 11, pct: 91 },
  { key: "pass_td", label: "Pass TD", rank: 1, of: 11, pct: 96 },
  { key: "par", label: "PAR", rank: 2, of: 11, pct: 91 },
  { key: "epa_play", label: "EPA / Play", rank: 3, of: 11, pct: 88 },
  { key: "success", label: "Success Rate", rank: 4, of: 11, pct: 82 },
];

// Shared red-to-green percentile scale, same one used by the Bio
// Comparatives card so the lab variants speak the app's existing language.
export const tierColor = (pct) => {
  if (pct == null) return "#E2E8F0";
  if (pct >= 80) return "#48BB78";
  if (pct >= 60) return "#9AE6B4";
  if (pct >= 40) return "#ECC94B";
  if (pct >= 20) return "#ED8936";
  return "#F56565";
};
