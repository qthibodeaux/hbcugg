import { useSeasonFile, byTeam, useIndex } from "./teamAnalytics/queryShared";
import { useQuery } from "@tanstack/react-query";
import { fetchJson, FE_DOCS_BASE } from "../utils/gameCenterPayloads";

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

export { TEAM_ANALYTICS_BASE } from "./teamAnalytics/queryShared";

export { useTeamAnalyticsHub } from "./teamAnalytics/useTeamAnalyticsHub";

export { useWeekReview } from "./teamAnalytics/useWeekReview";
