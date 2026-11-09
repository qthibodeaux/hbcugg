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
    if (pickedHome === (g.home_score > g.away_score)) hits += 1;
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

export const standingsRanks = (hub, season) => {
  const sorted = Object.values(hub?.teams ?? {})
    .map((t) => ({ id: t.identity.id, pct: t.seasons?.[season]?.record?.pct }))
    .filter((x) => Number.isFinite(x.pct))
    .sort((a, b) => b.pct - a.pct);
  return Object.fromEntries(sorted.map((x, i) => [x.id, i + 1]));
};

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
