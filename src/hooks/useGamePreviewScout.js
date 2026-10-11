import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { FE_DOCS_BASE, fetchJson } from "../utils/gameCenterPayloads";
import { useCountingPlayerStats, useCountingTeamStats } from "./useCountingStats";
import { TEAM_ANALYTICS_BASE, useTeamAnalyticsUsage } from "./useTeamAnalyticsData";
import { usePlayerProfileDoc } from "./useSWACData";
import { buildScoutModel } from "../utils/gamePreviewScout";

// The Game Preview scout: the preview file plus the season's backend files it
// leans on until the preview carries the scout addendum (see gamePreviewScout.js).
export const useGamePreviewScout = (model) => {
  const season = model?.statSeason ?? model?.season ?? null;
  const ids = model ? [model.away.id, model.home.id] : [];

  const counting = useCountingTeamStats(season);
  const players = useCountingPlayerStats(season);
  const usage = useTeamAnalyticsUsage(season);
  const advanced = useQuery({
    queryKey: ["team-analytics", "advanced", String(season)],
    queryFn: () => fetchJson(`${TEAM_ANALYTICS_BASE}/advanced_${season}.json`),
    enabled: season != null,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const hubs = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["team-hub", String(season), id],
      queryFn: () => fetchJson(`${FE_DOCS_BASE}/schools/team-hub/${season}/${id}.json`),
      enabled: season != null,
      staleTime: 5 * 60 * 1000,
      retry: false,
    })),
  });

  // The QB's season passing field map (depth x direction) lives on his profile.
  const profA = usePlayerProfileDoc(season, model?.raw?.away?.quarterback?.person_id).doc;
  const profB = usePlayerProfileDoc(season, model?.raw?.home?.quarterback?.person_id).doc;
  const hubA = hubs[0]?.data ?? null;
  const hubB = hubs[1]?.data ?? null;
  return useMemo(
    () =>
      buildScoutModel(model, {
        counting: counting.teams,
        players: players.players,
        advanced: advanced.data?.teams ?? [],
        usage: usage.teams,
        hubs: Object.fromEntries(ids.map((id, i) => [id, [hubA, hubB][i]])),
        fieldMaps: Object.fromEntries(ids.map((id, i) => [id, [profA, profB][i]?.field_map?.passing ?? null])),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [model, counting.teams, players.players, advanced.data, usage.teams, hubA, hubB, profA, profB],
  );
};

export default useGamePreviewScout;
