import { useQuery } from "@tanstack/react-query";
import { FE_DOCS_BASE } from "../utils/gameCenterPayloads";
import { GAME_CENTER_DEFAULT_SEASON } from "../components/molecules/game/SeasonSelector";

/**
 * useRosterHubData
 * Hook for fetching and memoizing Roster Hub intelligence data.
 */
export const useRosterHubData = (year = GAME_CENTER_DEFAULT_SEASON) => {
  const { data: rosterHub, isLoading, error } = useQuery({
    queryKey: ["roster_hub", year],
    queryFn: async () => {
      const response = await fetch(`${FE_DOCS_BASE}/schools/roster-hub/roster_hub_${year}.json`);
      if (!response.ok) throw new Error("Failed to load roster hub data");
      return response.json();
    },
    staleTime: Infinity,
  });

  return {
    rosterHub,
    isLoading,
    error,
    // Helper to get total counts or specific team data
    allStats: rosterHub?.all ?? {},
    teams: rosterHub?.teams ?? {},
    year
  };
};
