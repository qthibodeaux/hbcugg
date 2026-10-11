// Rating Lab — the model, the presets and the backtest.
//
// A model is nothing but a weight per win lever. Weights run −100…+100:
// positive says "this helps", zero says "ignore it", negative says "I think
// this is actively bad" — which is a real position to hold in this league,
// where forcing run TFLs correlates negatively with winning.
//
// Nothing here is mocked. The levers, percentiles and correlations come from
// team_analytics_hub.json; the backtest runs against the parsed game index.

/** The levers strong enough to model with. */
export const labLevers = (hub) => (hub?.levers ?? []).filter((l) => l.abs >= 0.25);

const seeded = (levers) =>
  levers.reduce((acc, l) => {
    acc[l.field] = Math.round(l.abs * 100);
    return acc;
  }, {});

const byRule = (levers, rule) =>
  levers.reduce((acc, l) => {
    acc[l.field] = rule(l);
    return acc;
  }, {});

const isOffense = (l) => l.field.startsWith("o_");
const isRush = (l) => l.field.includes("rushing.");
const isPass = (l) => l.field.includes("passing.");
const isDisruption = (l) => /pressureRate|tflRate|stuffRate|powerStopRate/.test(l.field);

// Six philosophies to load and then break. Each is a complete set of weights.
export const LAB_PRESETS = [
  {
    id: "wins",
    label: "What actually wins",
    build: (levers) => seeded(levers),
  },
  {
    id: "ground",
    label: "Ground & pound",
    build: (levers) => byRule(levers, (l) => (isRush(l) ? (isOffense(l) ? 100 : 60) : 15)),
  },
  {
    id: "air",
    label: "Air raid",
    build: (levers) => byRule(levers, (l) => (isPass(l) ? (isOffense(l) ? 100 : 55) : 15)),
  },
  {
    id: "bend",
    label: "Bend don't break",
    build: (levers) => byRule(levers, (l) => (isOffense(l) ? 20 : isDisruption(l) ? 10 : 100)),
  },
  {
    id: "havoc",
    label: "Havoc",
    build: (levers) => byRule(levers, (l) => (isDisruption(l) ? 100 : 20)),
  },
  {
    id: "flat",
    label: "Flat",
    build: (levers) => byRule(levers, () => 50),
  },
];

export const presetWeights = (id, levers) => {
  const preset = LAB_PRESETS.find((p) => p.id === id) ?? LAB_PRESETS[0];
  return preset.build(levers);
};

/** Which preset, if any, the current weights are exactly. */
export const presetFor = (weights, levers) =>
  LAB_PRESETS.find((p) => {
    const w = p.build(levers);
    return levers.every((l) => (weights[l.field] ?? 0) === w[l.field]);
  })?.id ?? null;

/**
 * One team's score under a set of weights. Percentiles are already
 * polarity-aware (100 = best at that metric on that side), so a positive
 * weight always means "reward being good at this".
 */
export const scoreRow = (row, levers, weights) => {
  let sum = 0;
  let wsum = 0;
  levers.forEach((l) => {
    const p = row?.percentiles?.[l.field];
    const w = weights[l.field] ?? 0;
    if (!Number.isFinite(p) || !w) return;
    sum += (p - 50) * w;
    wsum += Math.abs(w);
  });
  return wsum ? sum / wsum : 0;
};

/** The whole league, ranked, for a season. */
export const rankLeague = (hub, season, levers, weights) =>
  Object.values(hub?.teams ?? {})
    .filter((t) => t.seasons?.[season])
    .map((t) => ({
      identity: t.identity,
      score: scoreRow(t.seasons[season], levers, weights),
      record: t.seasons[season].record,
    }))
    .sort((a, b) => b.score - a.score);

const pearson = (pairs) => {
  const n = pairs.length;
  if (n < 3) return NaN;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n;
  const my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  pairs.forEach(([x, y]) => {
    num += (x - mx) * (y - my);
    dx += (x - mx) ** 2;
    dy += (y - my) ** 2;
  });
  return dx && dy ? num / Math.sqrt(dx * dy) : NaN;
};

/**
 * Score a model against what actually happened in that season.
 *
 * For every parsed game where both teams have a season row, the model picks
 * the higher-scoring side; we count how often that was the winner, and how
 * well the model's gap tracks the actual margin.
 *
 * DESCRIPTIVE, NOT PREDICTIVE: the season metrics include the games being
 * scored, so this says how well a model describes the season — not how it
 * would have forecast it. The UI says so.
 */
export const backtest = (hub, season, games, levers, weights) => {
  const rows = {};
  Object.values(hub?.teams ?? {}).forEach((t) => {
    const r = t.seasons?.[season];
    if (r) rows[t.identity.id] = r;
  });

  let hits = 0;
  let played = 0;
  let homeWins = 0;
  const pairs = [];

  (games ?? []).forEach((g) => {
    if (String(g.season) !== String(season)) return;
    const home = rows[g.home_team_id];
    const away = rows[g.away_team_id];
    if (!home || !away) return;
    if (!Number.isFinite(g.home_score) || !Number.isFinite(g.away_score)) return;
    if (g.home_score === g.away_score) return;

    played += 1;
    if (g.home_score > g.away_score) homeWins += 1;

    const sHome = scoreRow(home, levers, weights);
    const sAway = scoreRow(away, levers, weights);
    const pickedHome = sHome >= sAway;
    if (pickedHome === g.home_score > g.away_score) hits += 1;
    pairs.push([sHome - sAway, g.home_score - g.away_score]);
  });

  return {
    games: played,
    hits,
    rate: played ? hits / played : NaN,
    homeRate: played ? homeWins / played : NaN,
    marginR: pearson(pairs),
  };
};

/**
 * What each lever earned or cost one team, under these weights. The values
 * sum to the team's score, so the waterfall adds up to the number on the row.
 */
export const contributions = (row, levers, weights) => {
  let wsum = 0;
  levers.forEach((l) => {
    const p = row?.percentiles?.[l.field];
    const w = weights[l.field] ?? 0;
    if (Number.isFinite(p) && w) wsum += Math.abs(w);
  });
  return levers
    .map((l) => {
      const p = row?.percentiles?.[l.field];
      const w = weights[l.field] ?? 0;
      const value = !Number.isFinite(p) || !w || !wsum ? 0 : ((p - 50) * w) / wsum;
      return { field: l.field, label: l.label, short: l.short ?? l.label, percentile: p, weight: w, value };
    })
    .filter((c) => c.value !== 0)
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
};

/** Where the standings actually had each team that season, by win pct. */
export const standingsRanks = (hub, season) => {
  const sorted = Object.values(hub?.teams ?? {})
    .map((t) => ({ id: t.identity.id, pct: t.seasons?.[season]?.record?.pct }))
    .filter((x) => Number.isFinite(x.pct))
    .sort((a, b) => b.pct - a.pct);
  return Object.fromEntries(sorted.map((x, i) => [x.id, i + 1]));
};

/** The same weights scored across every season the hub carries. */
export const backtestSeasons = (hub, seasons, games, levers, weights) => {
  const totals = (seasons ?? []).reduce(
    (acc, season) => {
      const b = backtest(hub, season, games, levers, weights);
      acc.games += b.games;
      acc.hits += b.hits;
      return acc;
    },
    { games: 0, hits: 0 },
  );
  return { ...totals, rate: totals.games ? totals.hits / totals.games : NaN };
};

// ── A model as a link ───────────────────────────────────────────────────────
// The lever order is stable (it comes off the hub file), so a model encodes
// as one weight per lever, clamped and joined. Short enough to paste.
const clampW = (v) => Math.max(-100, Math.min(100, Math.round(Number(v) || 0)));

export const encodeModel = (levers, weights) => levers.map((l) => clampW(weights[l.field] ?? 0)).join(".");

export const decodeModel = (text, levers) => {
  if (!text) return null;
  const parts = String(text).split(".");
  if (parts.length !== levers.length) return null;
  const out = {};
  for (let i = 0; i < levers.length; i += 1) {
    const v = Number(parts[i]);
    if (!Number.isFinite(v)) return null;
    out[levers[i].field] = clampW(v);
  }
  return out;
};
