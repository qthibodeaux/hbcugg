import { useQuery } from "@tanstack/react-query";
import { FE_DOCS_BASE, fetchJson } from "../utils/gameCenterPayloads";
import teamsData from "../data/teams.json";
import { TEAM_ANALYTICS_METRICS, TEAM_ANALYTICS_UNITS } from "../pages/analytics/teamAnalyticsDictionary";
import { demoSeasons } from "../config/demo";

// ─────────────────────────────────────────────────────────────────────────────
// Team Analytics — the backend's weekly files (Team Analytics Fetch Contract,
// src/pages/analytics/md). Seven per-season files under stats/team-analytics/.
// These hooks only reshape: the backend counts every number, ranks it and fits
// the levers; the frontend adds team identity (teams.json) and its own labels
// (teamAnalyticsDictionary.js). The hub hook returns the same object the tabs
// read since 2026-09-02, so no tab had to change when the source did.
// ─────────────────────────────────────────────────────────────────────────────

export const TEAM_ANALYTICS_BASE = `${FE_DOCS_BASE}/stats/team-analytics`;
const file = (name) => fetchJson(`${TEAM_ANALYTICS_BASE}/${name}`);

// Only the 18 — the 2019 file also carries NC A&T (MEAC then).
const TEAM_BY_V5 = Object.fromEntries(teamsData.teams.map((t) => [String(t.exportId).replace(/25$/, ""), t]));
const isOurs = (id) => Boolean(TEAM_BY_V5[id]);

const identityOf = (id) => {
  const t = TEAM_BY_V5[id];
  return {
    id,
    name: t.name,
    short: t.shortName,
    nickname: t.nickname ?? null,
    conference: t.conference,
    division: t.division,
    logo: t.logo,
    primary: t.colors?.primary,
    secondary: t.colors?.secondary,
  };
};

const SIDE = { offense: "o", defense: "d" };

const useIndex = () =>
  useQuery({ queryKey: ["team-analytics-index"], queryFn: () => file("index.json"), staleTime: 5 * 60 * 1000, retry: false });

// ── Hub ──────────────────────────────────────────────────────────────────────

const assembleHub = (index, hubs, advanced = {}, penalties = {}) => {
  const seasons = index.seasons.filter((s) => hubs[s]);
  const current = hubs[index.current_season] ? index.current_season : seasons[seasons.length - 1];

  const teams = {};
  seasons.forEach((season) => {
    const advById = Object.fromEntries((advanced[season]?.teams ?? []).map((a) => [a.team_id, a]));
    const penById = Object.fromEntries((penalties[season]?.teams ?? []).map((p) => [p.team_id, p]));
    hubs[season].teams.filter((t) => isOurs(t.team_id)).forEach((t) => {
      teams[t.team_id] ??= { identity: identityOf(t.team_id), seasons: {} };
      const adv = advById[t.team_id];
      teams[t.team_id].seasons[season] = {
        games: t.games,
        metrics: t.metrics ?? {},
        percentiles: t.percentiles ?? {},
        record: t.record ? { ...t.record, rank: t.record.division_rank ?? null } : null,
        rating: t.rating ?? null,
        rating_display: t.rating_display ?? null,
        rating_rank: t.rating_rank ?? null,
        // advanced_{season}.json — both sides plus the backend's ranks (1 = best).
        advanced: adv ? { offense: adv.offense ?? {}, defense: adv.defense ?? {}, ranks: adv.ranks ?? { offense: {}, defense: {} } } : null,
        // stats/counting/penalties_{season}.json → by_side (offense / defense / special_teams).
        penalties: penById[t.team_id]?.by_side ?? null,
      };
    });
  });

  const league = Object.fromEntries(
    seasons.map((s) => [
      s,
      {
        metrics: hubs[s].league?.metrics ?? {},
        spread: hubs[s].league?.spread ?? {},
        win_pct_spread: hubs[s].league?.win_pct_spread ?? null,
        teams: hubs[s].league?.teams ?? null,
        advanced: advanced[s]?.league ?? null,
        advancedNotes: advanced[s]?.notes ?? [],
      },
    ]),
  );

  // Levers: the current season's file, fitted over every season through it.
  const levers = (hubs[current].levers ?? [])
    .map((l) => {
      const meta = TEAM_ANALYTICS_METRICS[l.metric] ?? {};
      const side = SIDE[l.side] ?? l.side;
      return {
        field: l.field,
        side,
        metric: l.metric,
        label: `${side === "o" ? "Offense" : "Defense"} ${meta.label ?? l.metric}`,
        short: `${side === "o" ? "OFF" : "DEF"} ${meta.short ?? l.metric}`,
        family: meta.family,
        unit: meta.unit,
        r: l.r,
        abs: Math.abs(l.r),
        r2: l.r2,
        good: side === "o" ? meta.offGood : meta.defGood,
        sample: l.sample,
      };
    })
    .sort((a, b) => b.abs - a.abs);

  const definitions = hubs[current].metric_definitions ?? {};
  const glossary = Object.entries(TEAM_ANALYTICS_METRICS).map(([key, m]) => ({
    key,
    label: m.label,
    family: m.family,
    unit: m.unit,
    blurb: m.blurb,
    definition: definitions[key] ?? null,
    offense_reading: m.offGood ? "Higher is better for the offense." : "Lower is better for the offense.",
    defense_reading: m.defGood ? "Higher is better for the defense." : "Lower is better for the defense.",
    wins_correlation: levers.filter((l) => l.metric === key).map((l) => ({ side: l.side, r: l.r })),
  }));

  return {
    teams,
    seasons,
    currentSeason: current,
    throughWeek: hubs[current].through_week ?? null,
    units: TEAM_ANALYTICS_UNITS,
    metrics: TEAM_ANALYTICS_METRICS,
    levers,
    league,
    glossary,
    rating: hubs[current].rating ?? null,
    method: {
      pooled_team_seasons: hubs[current].levers_pool?.team_seasons ?? null,
      rating: hubs[current].rating?.method ?? null,
      caveats: ["Descriptive correlation only — not causal.", "2020 is absent from every season."],
    },
  };
};

export const useTeamAnalyticsHub = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["team-analytics-hub-v2"],
    queryFn: async () => {
      const index = await file("index.json");
      const list = demoSeasons(index.seasons).filter((s) => index.files?.[s]?.hub !== false);
      // The advanced files are small (~90 KB a season), so they ride with the hub:
      // Matchup, Scatter and the Profile table then read them synchronously.
      const [loaded, loadedAdv, loadedPen] = await Promise.all([
        Promise.all(list.map((s) => file(`hub_${s}.json`).catch(() => null))),
        Promise.all(list.map((s) => (index.files?.[s]?.advanced === false ? null : file(`advanced_${s}.json`).catch(() => null)))),
        // Penalty sides for the Discipline scatter (~60 KB a season).
        Promise.all(list.map((s) => fetchJson(`${FE_DOCS_BASE}/stats/counting/penalties_${s}.json`).catch(() => null))),
      ]);
      const hubs = Object.fromEntries(list.map((s, i) => [s, loaded[i]]).filter(([, h]) => h));
      const advanced = Object.fromEntries(list.map((s, i) => [s, loadedAdv[i]]).filter(([, a]) => a));
      const penalties = Object.fromEntries(list.map((s, i) => [s, loadedPen[i]]).filter(([, p]) => p));
      return assembleHub(index, hubs, advanced, penalties);
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return {
    teams: data?.teams ?? null,
    seasons: data?.seasons ?? [],
    units: data?.units ?? TEAM_ANALYTICS_UNITS,
    metrics: data?.metrics ?? TEAM_ANALYTICS_METRICS,
    levers: data?.levers ?? [],
    league: data?.league ?? {},
    glossary: data?.glossary ?? [],
    method: data?.method ?? null,
    rating: data?.rating ?? null,
    currentSeason: data?.currentSeason ?? null,
    throughWeek: data?.throughWeek ?? null,
    isLoading,
    isError,
    error,
  };
};

// ── Week Review ──────────────────────────────────────────────────────────────

const sideOf = (s) => {
  const t = s?.team_id ? TEAM_BY_V5[s.team_id] : null;
  return {
    id: s?.team_id ?? null,
    name: s?.name ?? t?.name ?? "",
    short: s?.short_name ?? t?.shortName ?? "",
    logo: t?.logo ?? null,
    primary: t?.colors?.primary ?? null,
    secondary: t?.colors?.secondary ?? null,
    score: s?.score ?? null,
  };
};

const fmtRange = (r) => (r?.start && r?.end ? `${r.start} to ${r.end}` : "");

// The week strip shows every week of the season, so weeks the file omits (no
// game with play-by-play) come back as empty, unplayable entries.
const SEASON_WEEKS = 16;

export const useWeekReview = (season) => {
  const index = useIndex();
  const target = season ?? index.data?.current_season ?? null;
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["team-analytics-week-review", String(target)],
    queryFn: () => file(`week_review_${target}.json`),
    enabled: target != null,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const byWeek = new Map((data?.weeks ?? []).map((w) => [w.week, w]));
  const last = Math.max(SEASON_WEEKS, ...[...byWeek.keys()]);
  const weeks = data
    ? Array.from({ length: last + 1 }, (_, week) => {
        const w = byWeek.get(week);
        const games = (w?.games ?? []).map((g) => ({
          game_id: g.schedule_game_id,
          route: g.route ?? null,
          date: g.date,
          status: g.status,
          conference_game: g.conference_game,
          home: sideOf(g.home),
          away: sideOf(g.away),
          winner_id: g.winner_id,
          margin: g.margin,
          net_success: g.net_success,
          epa_diff: g.epa_diff,
          winner_edge: g.winner_edge,
          provisional: false,
        }));
        return {
          week,
          label: w?.label ?? `Week ${week}`,
          date_range: fmtRange(w?.date_range),
          games,
          played: games.length > 0,
          final_count: games.length,
          charted_count: games.filter((g) => g.winner_edge != null).length,
        };
      })
    : [];

  return {
    season: target,
    weeks,
    defaultWeek: data?.default_week ?? 0,
    edgeMethod: data?.edge_method ?? null,
    isLoading: isLoading || index.isLoading,
    isError,
    error,
  };
};

// ── Per-season files read by one tab each ───────────────────────────────────

const useSeasonFile = (name, season) =>
  useQuery({
    queryKey: ["team-analytics", name, String(season)],
    queryFn: () => file(`${name}_${season}.json`),
    enabled: season != null,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

const byTeam = (data) => Object.fromEntries((data?.teams ?? []).filter((t) => isOurs(t.team_id)).map((t) => [t.team_id, t]));

/** spatial_{season}.json — pass grid, rush lanes, havoc zones per team and side. */
export const useTeamAnalyticsSpatial = (season) => {
  const { data, isLoading } = useSeasonFile("spatial", season);
  return { teams: byTeam(data), depthBands: data?.depth_bands ?? null, availability: data?.availability ?? null, isLoading };
};

/** player_usage_{season}.json — every player's production, usage and game log, plus leaders. */
export const useTeamAnalyticsUsage = (season) => {
  const { data, isLoading } = useSeasonFile("player_usage", season);
  return { teams: byTeam(data), usageDefinition: data?.usage_definition ?? null, isLoading };
};

/** games_{season}.json — each team's games in date order, with per-game metrics. */
export const useTeamAnalyticsGames = (season) => {
  const { data, isLoading } = useSeasonFile("games", season);
  return { teams: byTeam(data), isLoading };
};

// ── Stats Hub cards ─────────────────────────────────────────────────────────
// stats/hub-cards/{season}.json (Stats Hub Cards Fetch Contract) — the backend
// picks every subject and writes every line. Defaults to the current season.
export const useStatsHubCards = (season) => {
  const index = useIndex();
  const target = season ?? index.data?.current_season ?? null;
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["stats-hub-cards", String(target)],
    queryFn: () => fetchJson(`${FE_DOCS_BASE}/stats/hub-cards/${target}.json`),
    enabled: target != null,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  return {
    season: target,
    cards: data?.cards ?? [],
    throughWeek: data?.through_week ?? null,
    isLoading: isLoading || index.isLoading,
    isError,
    error,
  };
};

