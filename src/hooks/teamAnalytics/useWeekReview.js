import { TEAM_BY_V5, useIndex, file } from "./queryShared";
import { useQuery } from "@tanstack/react-query";

// Team Analytics week-review query, side identity and empty-week adaptation.

const sideOf = (s) => {
  const t = s?.team_id ? TEAM_BY_V5[s.team_id] : null;
  return {
    id: s?.team_id ?? null,
    name: s?.name ?? t?.name ?? "",
    short: t?.shortName ?? s?.short_name ?? "", // ours first; the backend's codes (TXSO, JKST...) never print
    logo: t?.logo ?? null,
    primary: t?.colors?.primary ?? null,
    secondary: t?.colors?.secondary ?? null,
    score: s?.score ?? null,
  };
};

const fmtRange = (r) => (r?.start && r?.end ? `${r.start} to ${r.end}` : "");

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
