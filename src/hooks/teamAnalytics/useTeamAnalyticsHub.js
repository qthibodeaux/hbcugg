import { useQuery } from "@tanstack/react-query";
import { file } from "./queryShared";
import { demoSeasons } from "../../config/demo";
import { fetchJson, FE_DOCS_BASE } from "../../utils/gameCenterPayloads";
import { assembleHub } from "./hubModel";
import { TEAM_ANALYTICS_UNITS, TEAM_ANALYTICS_METRICS } from "../../pages/analytics/teamAnalyticsDictionary";

// Team Analytics hub queries and existing multi-season assembly orchestration.

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
