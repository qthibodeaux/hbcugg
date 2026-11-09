import { isOurs, identityOf, SIDE } from "./queryShared";
import { TEAM_ANALYTICS_METRICS, TEAM_ANALYTICS_UNITS } from "../../pages/analytics/teamAnalyticsDictionary";

// Pure published Team Analytics hub/advanced/penalty assembly, preserving existing contracts.

export const assembleHub = (index, hubs, advanced = {}, penalties = {}) => {
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
