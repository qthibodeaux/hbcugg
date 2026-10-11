#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * STATS HUB — CARD FEED GENERATOR
 *
 * Same architecture as scripts/build_people_hub_cards.js, pointed at statistical
 * storytelling instead of editorial player cards: archetype = candidate
 * generator -> score -> rank -> top N. The frontend switches on `layout` and
 * `viz.kind`, never on archetype, so new archetypes need no new components.
 *
 * ORGANIZING RULE (see Stats Hub Design Doc §9.1):
 *   Rankings are answers; relationships are questions. Every card here is a
 *   relationship, a correlation, or an anomaly — never a bare leaderboard row.
 *
 * WHY 18 TEAMS MATTERS: the league is small enough that nothing is ever
 * truncated. Every card below considers all 18 teams and every one of the 324
 * pairwise relationships. A 130-team site cannot do this.
 *
 * Sources (all real, all on disk):
 *   team_season_avg_{y}.json     10 offensive rate metrics x 18 teams
 *   team_defense_avg_{y}.json    same, defensive
 *   league_avg_{y}.json          league baseline
 *   standings_race_{y}.json      wins/losses/streak/last5
 *   player_stats_2025_enriched   PAR + production components
 *
 * Output: public/data/0-data/stats_hub_cards_2025.json
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "public", "data");
const SEASON = 2025;
// 2020 is absent from every export — never add it to this list.
const SEASONS = [2019, 2021, 2022, 2023, 2024, 2025];

const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const teamsJson = read(path.join(ROOT, "src", "data", "teams.json")).teams;

const TEAM = teamsJson.reduce((acc, t) => {
  acc[t.exportId.replace(/25$/, "")] = {
    id: t.exportId.replace(/25$/, ""),
    name: t.name,
    short: t.shortName,
    conference: t.conference,
    division: t.division,
    logo: t.logo,
    primary: t.colors?.primary,
    secondary: t.colors?.secondary,
  };
  return acc;
}, {});

// ── Metric vocabulary ───────────────────────────────────────────────────────
// `good` = does a HIGHER raw value help the team this row describes?
// Polarity flips between the offense file and the defense file for the same
// key (a high stuffRate is bad for an offense, good for a defense) — see
// Stats Hub Design Doc §5.1, still pending backend confirmation.
const METRICS = [
  { key: "rushing.successRate", label: "Rush Success", short: "Rush SR", unit: "pct", family: "Rushing" },
  { key: "rushing.opportunityRate", label: "Opportunity Rate", short: "Opp", unit: "pct", family: "Rushing" },
  { key: "rushing.stuffRate", label: "Stuff Rate", short: "Stuff", unit: "pct", family: "Rushing" },
  { key: "rushing.stopRate", label: "Stop Rate", short: "Stop", unit: "pct", family: "Rushing" },
  { key: "rushing.powerStopRate", label: "Power Stop", short: "Power", unit: "pct", family: "Rushing" },
  { key: "rushing.tflRate", label: "TFL Rate", short: "TFL", unit: "pct", family: "Rushing" },
  { key: "passing.completionRate", label: "Completion Rate", short: "Comp", unit: "pct", family: "Passing" },
  { key: "passing.explosiveRate", label: "Explosive Rate", short: "Expl", unit: "pct", family: "Passing" },
  { key: "passing.pressureRate", label: "Pressure Rate", short: "Press", unit: "pct", family: "Passing" },
  { key: "passing.ypa", label: "Yards / Attempt", short: "YPA", unit: "num", family: "Passing" },
];

const at = (obj, dotted) => dotted.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);

// ── Load every team-season we have ──────────────────────────────────────────
const loadSeason = (year) => {
  const p = (f) => path.join(DATA, "0-data", f);
  const sp = path.join(DATA, "1-game center", "current_exports", "standings_race", `standings_race_${year}.json`);
  let off, def, lg, st;
  try {
    off = read(p(`team_season_avg_${year}.json`)).teams;
    def = read(p(`team_defense_avg_${year}.json`)).teams;
    lg = read(p(`league_avg_${year}.json`));
    st = read(sp);
  } catch {
    return null;
  }
  const records = {};
  Object.values(st.groups).forEach((g) =>
    g.standings.forEach((r) => {
      records[r.team_id] = {
        wins: r.wins, losses: r.losses, pct: r.win_pct,
        record: r.record, streak: r.streak, last5: r.last5,
        confRecord: r.conference_record, rank: r.rank,
      };
    }),
  );
  return { year, off, def, lg, records };
};

const seasons = SEASONS.map(loadSeason).filter(Boolean);
const current = seasons.find((s) => s.year === SEASON);
if (!current) throw new Error(`no data for ${SEASON}`);

// Flat pooled table — one row per team-season, both sides of the ball.
const pooled = [];
seasons.forEach(({ year, off, def, records }) => {
  Object.keys(off).forEach((id) => {
    if (!def[id] || !records[id] || !TEAM[id]) return;
    const row = { year, id, ...records[id] };
    METRICS.forEach((m) => {
      row[`o_${m.key}`] = at(off[id], m.key);
      row[`d_${m.key}`] = at(def[id], m.key);
    });
    pooled.push(row);
  });
});

// ── Stats helpers ───────────────────────────────────────────────────────────
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
const stdev = (xs) => {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
};
const pearson = (xs, ys) => {
  const n = xs.length;
  if (n < 3) return 0;
  const mx = mean(xs), my = mean(ys);
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    const a = xs[i] - mx, b = ys[i] - my;
    num += a * b; dx += a * a; dy += b * b;
  }
  return dx && dy ? num / Math.sqrt(dx * dy) : 0;
};
const paired = (field) => {
  const rows = pooled.filter((r) => Number.isFinite(r[field]) && Number.isFinite(r.pct));
  return [rows.map((r) => r[field]), rows.map((r) => r.pct)];
};
const round = (v, d = 3) => (Number.isFinite(v) ? Number(v.toFixed(d)) : null);
const pct1 = (v) => (Number.isFinite(v) ? Number((v * 100).toFixed(1)) : null);

// ── 1. WIN LEVERS — what actually predicts winning in THIS league ───────────
const levers = [];
METRICS.forEach((m) => {
  ["o", "d"].forEach((side) => {
    const field = `${side}_${m.key}`;
    const [xs, ys] = paired(field);
    if (xs.length < 20) return;
    const r = pearson(xs, ys);
    levers.push({
      field, side, metric: m.key, label: m.label, short: m.short, family: m.family,
      r: round(r), abs: Math.abs(r),
      // r^2 = share of win-pct variance this metric alone tracks with
      r2: round(r * r),
      direction: r >= 0 ? "higher_wins" : "lower_wins",
      sample: xs.length,
    });
  });
});
levers.sort((a, b) => b.abs - a.abs);

const sideLabel = (s) => (s === "o" ? "Offense" : "Defense");
const leverName = (l) => `${sideLabel(l.side)} ${l.label}`;

// ── 2. Current-season team table with percentiles ───────────────────────────
const currentRows = pooled.filter((r) => r.year === SEASON);
const percentileOf = (field, value, invert) => {
  const xs = currentRows.map((r) => r[field]).filter(Number.isFinite);
  if (!xs.length || !Number.isFinite(value)) return null;
  const below = xs.filter((x) => x < value).length;
  const p = (below / xs.length) * 100;
  return Math.round(invert ? 100 - p : p);
};

// ── 3. Efficiency-predicted win pct -> over/under performers ────────────────
// Weighted z-score composite using every lever, weighted by its own |r| and
// signed so that positive always means "helps you win".
const TOP_LEVERS = levers.filter((l) => l.abs >= 0.25);
const zStats = {};
TOP_LEVERS.forEach((l) => {
  const xs = currentRows.map((r) => r[l.field]).filter(Number.isFinite);
  zStats[l.field] = { m: mean(xs), s: stdev(xs) || 1 };
});
const efficiencyScore = (row) => {
  let sum = 0, weight = 0;
  TOP_LEVERS.forEach((l) => {
    const v = row[l.field];
    if (!Number.isFinite(v)) return;
    const z = (v - zStats[l.field].m) / zStats[l.field].s;
    sum += z * l.r; // l.r carries the sign, so negative-r metrics invert correctly
    weight += l.abs;
  });
  return weight ? sum / weight : 0;
};
const scored = currentRows.map((r) => ({ ...r, eff: efficiencyScore(r) }));
const effVals = scored.map((r) => r.eff);
const pctVals = scored.map((r) => r.pct);
const effMean = mean(effVals), effSd = stdev(effVals) || 1;
const pctMean = mean(pctVals), pctSd = stdev(pctVals) || 1;
scored.forEach((r) => {
  // Both on a common z-scale so "record ahead of performance" is a real gap
  r.effZ = (r.eff - effMean) / effSd;
  r.pctZ = (r.pct - pctMean) / pctSd;
  r.gap = r.pctZ - r.effZ;
  r.expectedPct = Math.max(0, Math.min(1, pctMean + r.effZ * pctSd));
});

// ── 4. Statistical twins — nearest neighbour across all 324 pairs ───────────
const twinFields = TOP_LEVERS.map((l) => l.field);
const zOf = (row, field) => (row[field] - zStats[field].m) / zStats[field].s;
const distance = (a, b) => {
  let sum = 0, n = 0;
  twinFields.forEach((f) => {
    if (!Number.isFinite(a[f]) || !Number.isFinite(b[f])) return;
    sum += (zOf(a, f) - zOf(b, f)) ** 2; n++;
  });
  return n ? Math.sqrt(sum / n) : Infinity;
};
const pairs = [];
for (let i = 0; i < scored.length; i++) {
  for (let j = i + 1; j < scored.length; j++) {
    pairs.push({ a: scored[i], b: scored[j], d: distance(scored[i], scored[j]) });
  }
}
pairs.sort((x, y) => x.d - y.d);

// ── 5. Player production (real PAR) ─────────────────────────────────────────
let players = [];
try {
  const enriched = read(path.join(DATA, "0-data", "player_stats_2025_enriched.json"));
  players = Object.values(enriched.players)
    .filter((p) => Number.isFinite(p.par))
    .sort((a, b) => b.par - a.par);
} catch { /* optional */ }

// ── Card assembly ───────────────────────────────────────────────────────────
const teamSubject = (row) => ({
  team_id: row.id,
  name: TEAM[row.id].name,
  short: TEAM[row.id].short,
  logo: TEAM[row.id].logo,
  conference: TEAM[row.id].conference,
  record: row.record,
  href: `/teams/${row.id}`,
});

const cards = [];
const push = (c) => cards.push(c);

// ── CARD: Win Levers ────────────────────────────────────────────────────────
const topLever = levers[0];
const deadLever = [...levers].sort((a, b) => a.abs - b.abs)[0];
push({
  archetype: "win_levers",
  layout: "LEAGUE",
  icon: "target",
  headline: `${leverName(topLever)} predicts winning better than anything else we measure`,
  subhead: `Across ${pooled.length} team-seasons, ${SEASONS.length} years of SWAC and MEAC football.`,
  stat_primary: { label: "Correlation with win %", value: topLever.r, context: leverName(topLever) },
  stat_support: [
    { label: "Team-seasons", value: pooled.length },
    { label: "Variance tracked", value: `${Math.round(topLever.r2 * 100)}%` },
  ],
  viz: {
    kind: "correlation_bars",
    entries: levers.slice(0, 10).map((l) => ({
      label: leverName(l), short: `${l.side === "o" ? "OFF" : "DEF"} ${l.short}`,
      r: l.r, abs: l.abs, direction: l.direction, family: l.family,
    })),
  },
  cta: { label: "Open Team Efficiency", href: "/stats?tab=team-efficiency" },
  score: 100,
});

// ── CARD: The metric that doesn't matter ────────────────────────────────────
push({
  archetype: "dead_metric",
  layout: "LEAGUE",
  icon: "slash",
  headline: `${leverName(deadLever)} tells you almost nothing about winning`,
  subhead: `A correlation of ${deadLever.r} across ${deadLever.sample} team-seasons — effectively zero. Worth knowing before you quote it.`,
  stat_primary: { label: "Correlation with win %", value: deadLever.r, context: leverName(deadLever) },
  stat_support: [
    { label: "vs. best lever", value: `${topLever.r}` },
    { label: "Sample", value: deadLever.sample },
  ],
  viz: {
    kind: "dumbbell",
    rows: [
      { label: leverName(deadLever), value: Math.abs(deadLever.r), tone: "muted" },
      { label: leverName(topLever), value: Math.abs(topLever.r), tone: "accent" },
    ],
    max: 1,
    unit: "r",
  },
  cta: { label: "See every lever", href: "/stats?tab=team-efficiency" },
  score: 88,
});

// ── CARD: League Map — all 18 teams in identity space ───────────────────────
const mapX = levers.find((l) => l.side === "o" && l.abs >= 0.3) ?? levers[0];
const mapY = levers.find((l) => l.side === "d" && l.abs >= 0.3) ?? levers[1];
push({
  archetype: "league_map",
  layout: "LEAGUE",
  icon: "map",
  headline: "The whole league, plotted",
  subhead: `${leverName(mapX)} against ${leverName(mapY)} — all 18 teams, no cutoff.`,
  stat_primary: { label: "Teams plotted", value: 18, context: "no truncation" },
  stat_support: [],
  viz: {
    kind: "scatter_map",
    x: { field: mapX.field, label: leverName(mapX), invert: mapX.r < 0 },
    y: { field: mapY.field, label: leverName(mapY), invert: mapY.r < 0 },
    league: { x: mean(currentRows.map((r) => r[mapX.field]).filter(Number.isFinite)), y: mean(currentRows.map((r) => r[mapY.field]).filter(Number.isFinite)) },
    points: scored.map((r) => ({
      team_id: r.id, short: TEAM[r.id].short, logo: TEAM[r.id].logo,
      color: TEAM[r.id].primary, record: r.record,
      x: round(r[mapX.field], 4), y: round(r[mapY.field], 4),
    })),
  },
  cta: { label: "Open Chart Builder", href: "/stats?tab=chart-builder" },
  score: 95,
});

// ── CARD: Metric of the Week — league spread on one metric ──────────────────
// Rotates deterministically by ISO week so the hub changes without a timer.
const weekIndex = Math.floor(Date.now() / (7 * 24 * 3600 * 1000));
const spotlight = levers[weekIndex % Math.min(6, levers.length)];
const spotVals = scored
  .map((r) => ({ id: r.id, short: TEAM[r.id].short, logo: TEAM[r.id].logo, color: TEAM[r.id].primary, v: r[spotlight.field], record: r.record }))
  .filter((x) => Number.isFinite(x.v))
  .sort((a, b) => (spotlight.r >= 0 ? b.v - a.v : a.v - b.v));
push({
  archetype: "metric_of_week",
  layout: "LEAGUE",
  icon: "book",
  headline: `Metric of the week: ${leverName(spotlight)}`,
  subhead: spotlight.r >= 0
    ? `Higher is better. It moves with winning at r = ${spotlight.r}, so the teams on the right of this spread are the ones it rewards.`
    : `Lower is better. It moves against winning at r = ${spotlight.r}, so the teams on the left of this spread are the ones it rewards.`,
  stat_primary: { label: "League leader", value: spotVals[0]?.short, context: leverName(spotlight) },
  stat_support: [
    { label: "League average", value: pct1(mean(spotVals.map((x) => x.v))) },
    { label: "Correlation", value: spotlight.r },
  ],
  viz: {
    kind: "distribution",
    unit: METRICS.find((m) => m.key === spotlight.metric)?.unit ?? "pct",
    entries: spotVals.map((x) => ({ team_id: x.id, short: x.short, logo: x.logo, color: x.color, value: round(x.v, 4), record: x.record })),
    league_avg: round(mean(spotVals.map((x) => x.v)), 4),
  },
  cta: { label: "Rank every team on it", href: "/stats?tab=team-efficiency" },
  score: 92,
});

// ── CARD: Overperformer / Underperformer ────────────────────────────────────
const byGap = [...scored].sort((a, b) => b.gap - a.gap);
const over = byGap[0];
const under = byGap[byGap.length - 1];
[
  { row: over, kind: "record_ahead_of_performance", icon: "trending-up",
    headline: `${TEAM[over.id].name} is winning more than the numbers say they should`,
    sub: "Their record sits well ahead of their efficiency profile. That gap is usually close-game luck, turnover margin, or a schedule that hasn't tested them yet — and it usually closes.",
    label: "Record ahead of profile" },
  { row: under, kind: "performance_ahead_of_record", icon: "trending-down",
    headline: `${TEAM[under.id].name} is better than their record`,
    sub: "Their underlying numbers are stronger than their win total. Teams in this spot are the classic breakout candidate — the profile is already there.",
    label: "Profile ahead of record" },
].forEach((c, i) => {
  push({
    archetype: c.kind,
    layout: "SOLO",
    icon: c.icon,
    headline: c.headline,
    subhead: c.sub,
    subject: [teamSubject(c.row)],
    stat_primary: { label: c.label, value: `${c.row.gap > 0 ? "+" : ""}${round(c.row.gap, 2)}`, context: "z-score gap" },
    stat_support: [
      { label: "Actual", value: c.row.record },
      { label: "Expected win %", value: `${Math.round(c.row.expectedPct * 100)}%` },
    ],
    viz: {
      kind: "delta_bars",
      rows: [
        { label: "Actual win %", value: round(c.row.pct, 3), tone: "accent" },
        { label: "Expected from profile", value: round(c.row.expectedPct, 3), tone: "muted" },
      ],
      max: 1,
    },
    cta: { label: `${TEAM[c.row.id].short} team page`, href: `/teams/${c.row.id}` },
    score: 90 - i,
  });
});

// ── CARD: Statistical twins ─────────────────────────────────────────────────
// Nearest pair with a real standings gap — identical profiles, different results
const twin = pairs.find((p) => Math.abs(p.a.wins - p.b.wins) >= 2) ?? pairs[0];
if (twin) {
  const better = twin.a.pct >= twin.b.pct ? twin.a : twin.b;
  const worse = better === twin.a ? twin.b : twin.a;
  push({
    archetype: "statistical_twins",
    layout: "DUO",
    icon: "copy",
    headline: `${TEAM[better.id].short} and ${TEAM[worse.id].short} are statistically the same team`,
    subhead: `Closest pair in the league across every metric that predicts winning — and ${Math.abs(better.wins - worse.wins)} games apart in the standings.`,
    subject: [teamSubject(better), teamSubject(worse)],
    stat_primary: { label: "Profile distance", value: round(twin.d, 2), context: "closest of 153 pairs" },
    stat_support: [
      { label: TEAM[better.id].short, value: better.record },
      { label: TEAM[worse.id].short, value: worse.record },
    ],
    viz: {
      kind: "twin_radar",
      axes: TOP_LEVERS.slice(0, 6).map((l) => ({
        key: l.field, label: `${l.side === "o" ? "OFF" : "DEF"} ${l.short}`,
        a: percentileOf(l.field, better[l.field], l.r < 0),
        b: percentileOf(l.field, worse[l.field], l.r < 0),
      })),
      a_label: TEAM[better.id].short, b_label: TEAM[worse.id].short,
      a_color: TEAM[better.id].primary, b_color: TEAM[worse.id].primary,
    },
    cta: { label: "Compare them", href: "/stats?tab=chart-builder" },
    score: 86,
  });
}

// ── CARD: Team fingerprint — most extreme profile in the league ─────────────
const extremeness = (row) => mean(TOP_LEVERS.map((l) => Math.abs(zOf(row, l.field))).filter(Number.isFinite));
const mostExtreme = [...scored].sort((a, b) => extremeness(b) - extremeness(a))[0];
push({
  archetype: "team_fingerprint",
  layout: "SOLO",
  icon: "fingerprint",
  headline: `${TEAM[mostExtreme.id].name} has the most distinctive profile in the league`,
  subhead: "Furthest from league average across every predictive metric — the most identifiable shape on the board, for better and worse.",
  subject: [teamSubject(mostExtreme)],
  stat_primary: { label: "Distance from average", value: round(extremeness(mostExtreme), 2), context: "avg |z| across levers" },
  stat_support: [{ label: "Record", value: mostExtreme.record }],
  viz: {
    kind: "radar",
    color: TEAM[mostExtreme.id].primary,
    axes: TOP_LEVERS.slice(0, 8).map((l) => ({
      key: l.field, label: `${l.side === "o" ? "OFF" : "DEF"} ${l.short}`,
      value: percentileOf(l.field, mostExtreme[l.field], l.r < 0),
    })),
  },
  cta: { label: `${TEAM[mostExtreme.id].short} team page`, href: `/teams/${mostExtreme.id}` },
  score: 84,
});

// ── CARD: Conference gap ────────────────────────────────────────────────────
const confGap = TOP_LEVERS.map((l) => {
  const swac = currentRows.filter((r) => TEAM[r.id].conference === "SWAC").map((r) => r[l.field]).filter(Number.isFinite);
  const meac = currentRows.filter((r) => TEAM[r.id].conference === "MEAC").map((r) => r[l.field]).filter(Number.isFinite);
  if (!swac.length || !meac.length) return null;
  return { lever: l, swac: mean(swac), meac: mean(meac), gap: Math.abs(mean(swac) - mean(meac)) / (stdev([...swac, ...meac]) || 1) };
}).filter(Boolean).sort((a, b) => b.gap - a.gap);
if (confGap.length) {
  const g = confGap[0];
  const swacBetter = g.lever.r >= 0 ? g.swac > g.meac : g.swac < g.meac;
  push({
    archetype: "conference_gap",
    layout: "LEAGUE",
    icon: "git-compare",
    headline: `SWAC and MEAC separate most on ${leverName(g.lever)}`,
    subhead: `${swacBetter ? "SWAC" : "MEAC"} holds the edge here — the widest gap between the two conferences on any metric that predicts winning.`,
    stat_primary: { label: "Gap", value: round(g.gap, 2), context: "standard deviations" },
    stat_support: [
      { label: "SWAC avg", value: pct1(g.swac) },
      { label: "MEAC avg", value: pct1(g.meac) },
    ],
    viz: {
      kind: "conference_split",
      metric: leverName(g.lever),
      groups: [
        { label: "SWAC", value: round(g.swac, 4), teams: currentRows.filter((r) => TEAM[r.id].conference === "SWAC").length },
        { label: "MEAC", value: round(g.meac, 4), teams: currentRows.filter((r) => TEAM[r.id].conference === "MEAC").length },
      ],
      better: swacBetter ? "SWAC" : "MEAC",
    },
    cta: { label: "Break it down by team", href: "/stats?tab=team-efficiency" },
    score: 80,
  });
}

// ── CARD: Parity ────────────────────────────────────────────────────────────
const spread = stdev(currentRows.map((r) => r.pct).filter(Number.isFinite));
const priorSpreads = seasons.filter((s) => s.year !== SEASON).map((s) => {
  const rows = pooled.filter((r) => r.year === s.year).map((r) => r.pct).filter(Number.isFinite);
  return { year: s.year, sd: stdev(rows) };
});
const tighter = priorSpreads.filter((p) => p.sd > spread).length;
push({
  archetype: "parity_index",
  layout: "LEAGUE",
  icon: "scale",
  headline: tighter > priorSpreads.length / 2
    ? `${SEASON} is one of the tighter seasons on record`
    : `${SEASON} is more top-heavy than most seasons on record`,
  subhead: `Win-percentage spread across all 18 teams, measured against every season we have.`,
  stat_primary: { label: "Win % spread", value: round(spread, 3), context: `${SEASON}` },
  stat_support: [{ label: "Seasons compared", value: priorSpreads.length + 1 }],
  viz: {
    kind: "season_trend",
    entries: [...priorSpreads, { year: SEASON, sd: spread }]
      .sort((a, b) => a.year - b.year)
      .map((p) => ({ label: String(p.year), value: round(p.sd, 4), highlight: p.year === SEASON })),
    invert: true,
  },
  cta: { label: "See the standings", href: "/game-center/standings" },
  score: 74,
});

// ── CARD: Production leader (player, but framed statistically) ──────────────
if (players.length) {
  const top = players[0];
  const teamMeta = TEAM[top.team];
  const groupPeers = players.filter((p) => p.position_group === top.position_group);
  push({
    archetype: "production_leader",
    layout: "SOLO",
    icon: "flame",
    headline: `${top.name_display} has produced more than anyone in the league`,
    subhead: `PAR measures production above a replacement-level player at the same position. ${top.name_display} leads all ${players.length} producers.`,
    subject: [{
      person_id: top.person_id, name: top.name_display, position: top.position,
      team_id: top.team, short: teamMeta?.short, logo: teamMeta?.logo,
      image_url: top.image_url, href: `/players/${top.person_id}`,
    }],
    stat_primary: { label: "PAR", value: round(top.par, 1), context: `${top.games_played} games` },
    stat_support: [
      { label: "Per game", value: round(top.avg_production, 1) },
      { label: `Of ${groupPeers.length} ${top.position_group}s`, value: "#1" },
    ],
    viz: {
      kind: "rank_bars",
      entries: players.slice(0, 6).map((p, i) => ({
        label: p.name_display.split(/\s+/).slice(-1)[0],
        value: round(p.par, 1),
        team: TEAM[p.team]?.short,
        color: TEAM[p.team]?.primary,
        is_subject: i === 0,
      })),
    },
    cta: { label: "Open Player Analytics", href: "/player-analytics" },
    score: 82,
  });
}

// ── Write ───────────────────────────────────────────────────────────────────
cards.sort((a, b) => b.score - a.score);
cards.forEach((c, i) => { c.card_id = `${c.archetype}-${i + 1}`; });

const payload = {
  season: SEASON,
  generated_at: new Date().toISOString(),
  method: {
    pooled_team_seasons: pooled.length,
    seasons: SEASONS,
    note: "Correlations are Pearson r between a team-season rate metric and that team's win percentage. Descriptive only — not opponent-adjusted, and correlation is not causation. See Stats Hub Design Doc §9.",
  },
  levers,
  cards,
};

const outputs = [
  path.join(DATA, "0-data", `stats_hub_cards_${SEASON}.json`),
  path.join(ROOT, "reqs", "mock", `stats_hub_cards_${SEASON}.json`),
];
outputs.forEach((out) => {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(payload, null, 2));
  console.log("wrote", path.relative(ROOT, out));
});

console.log(`\n${cards.length} cards · ${pooled.length} team-seasons pooled`);
console.log("top levers:");
levers.slice(0, 5).forEach((l) => console.log(`  ${leverName(l).padEnd(28)} r=${l.r}`));
console.log(`dead metric: ${leverName(deadLever)} r=${deadLever.r}`);
