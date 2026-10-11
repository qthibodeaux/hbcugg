#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * TEAM ANALYTICS HUB — DERIVED DATASET
 *
 * One fetch for the whole hub instead of six per-season hooks. Everything here
 * is derived from files already on disk; nothing is invented. Units that have
 * no data are emitted with `available: false` and an explicit reason so the UI
 * can show the gap rather than fake it.
 *
 * THE UNIT TAXONOMY IS THE POINT (see Team Analytics Hub Design Doc):
 * a player is one entity; a team is a bundle of units. Offense and defense are
 * effectively two teams in the same colors, and our data splits exactly that
 * way — rushing x passing x offense/defense = four real units today.
 *
 * POLARITY — resolved here. Stats Hub Design Doc §5.1 flagged that we had
 * *inferred*, not confirmed, that team_season_avg describes the team's own
 * offense (so `stuffRate` = "this offense got stuffed"). The win-correlation
 * signs computed below independently confirm it: o_stuffRate correlates
 * NEGATIVELY with winning (-0.34) and d_stuffRate POSITIVELY (+0.22). If the
 * files were reversed those signs would flip. Empirical support, not proof —
 * still worth a backend confirmation, but the assumption now has evidence.
 *
 * Output: public/data/0-data/team_analytics_hub.json
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "public", "data");
const SEASONS = [2019, 2021, 2022, 2023, 2024, 2025]; // 2020 absent from every export
const CURRENT = 2025;

const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const teamsJson = read(path.join(ROOT, "src", "data", "teams.json")).teams;

// ── Metric dictionary ───────────────────────────────────────────────────────
// `offGood` / `defGood`: does a HIGHER raw value help the team, on that side?
const METRICS = {
  "rushing.successRate":     { label: "Rush Success Rate", short: "Rush SR",  family: "rushing", unit: "pct", offGood: true,  defGood: false, blurb: "How often a run gains enough to stay on schedule." },
  "rushing.opportunityRate": { label: "Opportunity Rate",  short: "Opp",      family: "rushing", unit: "pct", offGood: true,  defGood: false, blurb: "How often the line gets the back at least 4 yards — a line-quality signal." },
  "rushing.stuffRate":       { label: "Stuff Rate",        short: "Stuff",    family: "rushing", unit: "pct", offGood: false, defGood: true,  blurb: "Runs stopped at or behind the line." },
  "rushing.stopRate":        { label: "Stop Rate",         short: "Stop",     family: "rushing", unit: "pct", offGood: false, defGood: true,  blurb: "Runs held short of what the down and distance needed." },
  "rushing.powerStopRate":   { label: "Power Stop Rate",   short: "Power",    family: "rushing", unit: "pct", offGood: false, defGood: true,  blurb: "Short-yardage and goal-line runs stopped." },
  "rushing.tflRate":         { label: "TFL Rate",          short: "TFL",      family: "rushing", unit: "pct", offGood: false, defGood: true,  blurb: "Runs losing yardage." },
  "passing.completionRate":  { label: "Completion Rate",   short: "Comp",     family: "passing", unit: "pct", offGood: true,  defGood: false, blurb: "Share of attempts completed." },
  "passing.explosiveRate":   { label: "Explosive Rate",    short: "Expl",     family: "passing", unit: "pct", offGood: true,  defGood: false, blurb: "Share of pass plays going for a chunk gain." },
  "passing.pressureRate":    { label: "Pressure Rate",     short: "Press",    family: "passing", unit: "pct", offGood: false, defGood: true,  blurb: "How often the quarterback is pressured." },
  "passing.ypa":             { label: "Yards / Attempt",   short: "YPA",      family: "passing", unit: "num", offGood: true,  defGood: false, blurb: "Yards gained per pass attempt." },
};

// ── The unit taxonomy — a team is a bundle of these ─────────────────────────
const UNITS = [
  { id: "off_run",  label: "Run Game",      side: "offense", available: true,
    metrics: ["rushing.successRate", "rushing.opportunityRate", "rushing.stuffRate", "rushing.stopRate", "rushing.powerStopRate", "rushing.tflRate"] },
  { id: "off_pass", label: "Pass Game",     side: "offense", available: true,
    metrics: ["passing.completionRate", "passing.ypa", "passing.explosiveRate", "passing.pressureRate"] },
  { id: "def_run",  label: "Run Defense",   side: "defense", available: true,
    metrics: ["rushing.stopRate", "rushing.stuffRate", "rushing.tflRate", "rushing.powerStopRate", "rushing.successRate", "rushing.opportunityRate"] },
  { id: "def_pass", label: "Pass Defense",  side: "defense", available: true,
    metrics: ["passing.pressureRate", "passing.completionRate", "passing.ypa", "passing.explosiveRate"] },
  { id: "protection", label: "Pass Protection", side: "offense", available: false,
    metrics: [], gap: "Needs sacks allowed and line yards — neither is rolled up to team-season." },
  { id: "havoc", label: "Havoc / Disruption", side: "defense", available: false,
    metrics: [], gap: "Team-level havoc formula exists in the pipeline but is never exported." },
  { id: "special", label: "Special Teams", side: "special", available: false,
    metrics: [], gap: "No special-teams season rollup exists." },
  { id: "situational", label: "Situational", side: "both", available: false,
    metrics: [], gap: "Red zone / third down / money down are tagged per play, never aggregated to team-season." },
];

const at = (obj, dotted) => dotted.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const stdev = (xs) => { const m = mean(xs); return m == null ? null : Math.sqrt(mean(xs.map((x) => (x - m) ** 2))); };
const round = (v, d = 4) => (Number.isFinite(v) ? Number(v.toFixed(d)) : null);

// ── Load ────────────────────────────────────────────────────────────────────
const loaded = {};
SEASONS.forEach((year) => {
  try {
    const off = read(path.join(DATA, "0-data", `team_season_avg_${year}.json`)).teams;
    const def = read(path.join(DATA, "0-data", `team_defense_avg_${year}.json`)).teams;
    const lg = read(path.join(DATA, "0-data", `league_avg_${year}.json`));
    const st = read(path.join(DATA, "1-game center", "current_exports", "standings_race", `standings_race_${year}.json`));
    const records = {};
    Object.values(st.groups).forEach((g) => g.standings.forEach((r) => {
      records[r.team_id] = {
        wins: r.wins, losses: r.losses, pct: r.win_pct, record: r.record,
        conference_record: r.conference_record, streak: r.streak, last5: r.last5, rank: r.rank,
      };
    }));
    loaded[year] = { off, def, lg, records };
  } catch (e) {
    console.warn(`skip ${year}: ${e.message}`);
  }
});

const years = Object.keys(loaded).map(Number).sort();

// ── Flat pooled rows for correlations ───────────────────────────────────────
const pooled = [];
years.forEach((year) => {
  const { off, def, records } = loaded[year];
  Object.keys(off).forEach((id) => {
    if (!def[id] || !records[id]) return;
    const row = { year, id, pct: records[id].pct };
    Object.keys(METRICS).forEach((k) => {
      row[`o_${k}`] = at(off[id], k);
      row[`d_${k}`] = at(def[id], k);
    });
    pooled.push(row);
  });
});

const pearson = (xs, ys) => {
  const n = xs.length;
  if (n < 3) return 0;
  const mx = mean(xs), my = mean(ys);
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) { const a = xs[i] - mx, b = ys[i] - my; num += a * b; dx += a * a; dy += b * b; }
  return dx && dy ? num / Math.sqrt(dx * dy) : 0;
};

const levers = [];
Object.entries(METRICS).forEach(([key, meta]) => {
  ["o", "d"].forEach((side) => {
    const field = `${side}_${key}`;
    const rows = pooled.filter((r) => Number.isFinite(r[field]));
    if (rows.length < 20) return;
    const r = pearson(rows.map((x) => x[field]), rows.map((x) => x.pct));
    levers.push({
      field, side, metric: key,
      label: `${side === "o" ? "Offense" : "Defense"} ${meta.label}`,
      short: `${side === "o" ? "OFF" : "DEF"} ${meta.short}`,
      family: meta.family, unit: meta.unit,
      r: round(r, 3), abs: Math.abs(r), r2: round(r * r, 3),
      good: side === "o" ? meta.offGood : meta.defGood,
      sample: rows.length,
    });
  });
});
levers.sort((a, b) => b.abs - a.abs);

// Sanity check: does the empirical sign agree with our declared polarity?
const polarityConflicts = levers.filter((l) => l.abs > 0.15 && (l.r > 0) !== l.good);

// ── Per-season league stats + percentiles ───────────────────────────────────
const league = {};
years.forEach((year) => {
  const rows = pooled.filter((r) => r.year === year);
  const entry = { metrics: {}, spread: {} };
  Object.keys(METRICS).forEach((k) => {
    ["o", "d"].forEach((side) => {
      const field = `${side}_${k}`;
      const xs = rows.map((r) => r[field]).filter(Number.isFinite);
      entry.metrics[field] = round(mean(xs));
      entry.spread[field] = round(stdev(xs));
    });
  });
  entry.win_pct_spread = round(stdev(rows.map((r) => r.pct).filter(Number.isFinite)));
  entry.teams = rows.length;
  league[year] = entry;
});

const percentile = (year, field, value, higherIsBetter) => {
  const xs = pooled.filter((r) => r.year === year).map((r) => r[field]).filter(Number.isFinite);
  if (!xs.length || !Number.isFinite(value)) return null;
  const below = xs.filter((x) => x < value).length;
  const p = (below / xs.length) * 100;
  return Math.round(higherIsBetter ? p : 100 - p);
};

// ── Rating composite — the Rating Lab's default preset ──────────────────────
// Weight each lever by its own |r| so the seeded rating IS "what wins", then
// let the UI move the weights.
const RATING_LEVERS = levers.filter((l) => l.abs >= 0.25);
const zStats = {};
years.forEach((year) => {
  zStats[year] = {};
  RATING_LEVERS.forEach((l) => {
    const xs = pooled.filter((r) => r.year === year).map((r) => r[l.field]).filter(Number.isFinite);
    zStats[year][l.field] = { m: mean(xs), s: stdev(xs) || 1 };
  });
});

// ── Assemble teams ──────────────────────────────────────────────────────────
const teams = {};
teamsJson.forEach((t) => {
  const id = t.exportId.replace(/25$/, "");
  const seasons = {};
  years.forEach((year) => {
    const row = pooled.find((r) => r.year === year && r.id === id);
    if (!row) return;
    const rec = loaded[year].records[id];
    const metrics = {}, percentiles = {};
    Object.entries(METRICS).forEach(([k, meta]) => {
      ["o", "d"].forEach((side) => {
        const field = `${side}_${k}`;
        const good = side === "o" ? meta.offGood : meta.defGood;
        metrics[field] = round(row[field]);
        percentiles[field] = percentile(year, field, row[field], good);
      });
    });
    // Signed composite: z * r keeps every lever pointing the same way.
    let sum = 0, weight = 0;
    RATING_LEVERS.forEach((l) => {
      const v = row[l.field];
      if (!Number.isFinite(v)) return;
      const { m, s } = zStats[year][l.field];
      sum += ((v - m) / s) * l.r;
      weight += l.abs;
    });
    seasons[year] = {
      metrics, percentiles,
      record: rec ? { ...rec } : null,
      rating: round(weight ? sum / weight : 0, 3),
    };
  });
  if (Object.keys(seasons).length) {
    teams[id] = {
      identity: {
        id, name: t.name, short: t.shortName, nickname: t.nickname ?? null,
        conference: t.conference, division: t.division, logo: t.logo,
        primary: t.colors?.primary, secondary: t.colors?.secondary,
      },
      seasons,
    };
  }
});

// Rank teams by composite within each season
years.forEach((year) => {
  const ranked = Object.values(teams)
    .filter((t) => t.seasons[year])
    .sort((a, b) => b.seasons[year].rating - a.seasons[year].rating);
  ranked.forEach((t, i) => { t.seasons[year].rating_rank = i + 1; });
});

// ── Glossary ────────────────────────────────────────────────────────────────
const glossary = Object.entries(METRICS).map(([key, m]) => ({
  key, label: m.label, family: m.family, unit: m.unit, blurb: m.blurb,
  offense_reading: m.offGood ? "Higher is better for the offense." : "Lower is better for the offense.",
  defense_reading: m.defGood ? "Higher is better for the defense." : "Lower is better for the defense.",
  wins_correlation: levers.filter((l) => l.metric === key).map((l) => ({ side: l.side, r: l.r })),
}));

const payload = {
  generated_at: new Date().toISOString(),
  current_season: CURRENT,
  seasons: years,
  units: UNITS,
  metrics: METRICS,
  levers,
  league,
  teams,
  glossary,
  method: {
    pooled_team_seasons: pooled.length,
    rating: "Weighted z-score composite. Each metric is z-scored within its season, multiplied by its own win-correlation r (which carries the sign), then averaged weighted by |r|. Levers with |r| < 0.25 are excluded.",
    polarity_check: polarityConflicts.length
      ? `WARNING: ${polarityConflicts.length} metric(s) correlate against declared polarity: ${polarityConflicts.map((l) => l.field).join(", ")}`
      : "All metrics with |r| > 0.15 correlate with winning in the direction their declared polarity predicts. Supports (does not prove) the assumption that team_season_avg describes the team's own offense.",
    caveats: [
      "Descriptive correlation only — not causal, not opponent-adjusted.",
      "2020 is absent from every export.",
      "Four of eight units have no data; they ship with available:false and a stated reason.",
    ],
  },
};

const out = path.join(DATA, "0-data", "team_analytics_hub.json");
fs.writeFileSync(out, JSON.stringify(payload, null, 2));
console.log("wrote", path.relative(ROOT, out));
console.log(`${Object.keys(teams).length} teams · ${years.length} seasons · ${pooled.length} team-seasons · ${levers.length} levers`);
console.log("polarity:", polarityConflicts.length ? `${polarityConflicts.length} CONFLICTS` : "consistent");
console.log("top 5 levers:");
levers.slice(0, 5).forEach((l) => console.log(`  ${l.label.padEnd(30)} r=${l.r}`));
