// Trends — what you can plot, and how each series is read.
//
// The season timeline is entirely real: the hub carries six seasons (2019,
// 2021-2025) of twenty rate metrics per team plus the composite rating, the
// record, and a league average per field per season. Conference averages are
// computed off the same rows.
//
// The game timeline reads the backend's per-game series
// (stats/team-analytics/games_{season}.json): every final game in date order,
// the twenty metric-sides per game, null on games without play-by-play.

export const TEAM_METRICS = [
  { key: "rating", label: "Team Rating", unit: "num", sideless: true },
  { key: "winpct", label: "Win %", unit: "pct", sideless: true },
];

/** The metric picker: team-level first, then every unit metric by family. */
export const trendMetricGroups = (hub) => {
  const bases = [...new Set((hub?.units ?? []).filter((u) => u.available).flatMap((u) => u.metrics))];
  const groups = [{ label: "Team", options: TEAM_METRICS }];
  ["rushing", "passing"].forEach((family) => {
    const options = bases
      .filter((b) => hub.metrics[b]?.family === family)
      .map((b) => ({ key: b, label: hub.metrics[b]?.label ?? b, unit: hub.metrics[b]?.unit ?? "num" }));
    if (options.length) groups.push({ label: family, options });
  });
  return groups;
};

export const trendMetric = (hub, key) =>
  TEAM_METRICS.find((m) => m.key === key) ??
  (hub?.metrics?.[key]
    ? { key, label: hub.metrics[key].label, unit: hub.metrics[key].unit ?? "num", blurb: hub.metrics[key].blurb }
    : { key, label: key, unit: "num" });

/** A metric plus a side becomes the field actually stored on the row. */
export const trendField = (key, side) => {
  if (TEAM_METRICS.some((m) => m.key === key)) return key;
  return `${side === "defense" ? "d" : "o"}_${key}`;
};

const readRow = (row, field) => {
  if (!row) return undefined;
  if (field === "rating") return row.rating;
  if (field === "winpct") return row.record?.pct;
  return row.metrics?.[field];
};

export const teamValue = (hub, teamId, season, field) => readRow(hub?.teams?.[teamId]?.seasons?.[season], field);

const mean = (vals) => {
  const ok = vals.filter((v) => Number.isFinite(v));
  return ok.length ? ok.reduce((a, b) => a + b, 0) / ok.length : undefined;
};

/** League average for a field in a season — the hub's own where it has one. */
export const leagueValue = (hub, season, field) => {
  const lg = hub?.league?.[season]?.metrics;
  if (lg && Number.isFinite(lg[field])) return lg[field];
  return mean(Object.values(hub?.teams ?? {}).map((t) => readRow(t.seasons?.[season], field)));
};

export const conferenceValue = (hub, conference, season, field) =>
  mean(
    Object.values(hub?.teams ?? {})
      .filter((t) => t.identity.conference === conference)
      .map((t) => readRow(t.seasons?.[season], field)),
  );

// ── The game axis ───────────────────────────────────────────────────────────
// Not a calendar. A team's timeline is its own games in order, so a MEAC team
// playing 11 and a SWAC team playing 13 get axes of different lengths, and
// nothing is plotted against a week the team did not play. Comparing teams
// lines them up by game number — game 5 against game 5 — which is the only
// shared footing two different schedules have.

/** One team's parsed games that season, in date order. */
export const teamGames = (games, season, teamId) =>
  (games ?? [])
    .filter((g) => String(g.season) === String(season) && (g.home_team_id === teamId || g.away_team_id === teamId))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .map((g) => {
      const home = g.home_team_id === teamId;
      return { game: g, home, opponent: home ? g.away_team_id : g.home_team_id, date: g.date, stem: g.game_stem };
    });

/**
 * One team's season, game by game, off its games_{season} entry. Win % runs
 * through each game; the rating has no per-game value and stays null.
 */
export const gameSeries = (teamSeason, field) => {
  const games = teamSeason?.games ?? [];
  let w = 0;
  return games.map((g, i) => {
    if (g.result === "W") w += 1;
    if (field === "winpct") return w / (i + 1);
    if (field === "rating") return null;
    const v = g.metrics?.[field];
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  });
};

/**
 * The chart's rows: one per point on the x axis, a key per series.
 * `teams` is a list of identities; the league and conference lines come back
 * as `__league` and `__conference`. In game mode the axis is the team's own
 * games, so `seasonGames` is required and the axis is as long as that schedule.
 */
export const buildTrendRows = (hub, { teams, field, mode, season, conference, seasonGames }) => {
  if (mode === "week") {
    // seasonGames: useTeamAnalyticsGames(season).teams — keyed by team id.
    const perTeam = teams.map((t) => ({
      id: t.id,
      games: seasonGames?.[t.id]?.games ?? [],
      values: gameSeries(seasonGames?.[t.id], field),
    }));
    const length = Math.max(0, ...perTeam.map((p) => p.values.length));
    const lg = leagueValue(hub, season, field);
    const conf = conference ? conferenceValue(hub, conference, season, field) : undefined;
    // One team on the chart? Then the axis can name the opponent instead of
    // counting. More than one, and game number is the only shared footing.
    const solo = perTeam.length === 1 ? perTeam[0] : null;
    return Array.from({ length }, (_, i) => {
      const g = solo?.games?.[i];
      const opp = g ? hub?.teams?.[g.opponent_id]?.identity?.short ?? g.opponent_name : null;
      const row = { x: g ? `${g.home_away === "away" ? "at" : "vs"} ${opp}` : `G${i + 1}` };
      perTeam.forEach((p) => { row[p.id] = p.values[i]; });
      row.__league = lg;
      row.__conference = conf;
      return row;
    });
  }

  return (hub?.seasons ?? []).map((y) => {
    const row = { x: String(y) };
    teams.forEach((t) => { row[t.id] = teamValue(hub, t.id, y, field); });
    row.__league = leagueValue(hub, y, field);
    row.__conference = conference ? conferenceValue(hub, conference, y, field) : undefined;
    return row;
  });
};

export const fmtTrend = (v, unit) => {
  if (!Number.isFinite(v)) return "—";
  if (unit === "pct") return `${(v * 100).toFixed(1)}%`;
  return v.toFixed(2);
};
