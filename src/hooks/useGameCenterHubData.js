import { buildGameCenterHubModel } from "./gameCenterHub/hubModel";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { gameCenterPaths, fetchJson } from "../utils/gameCenterPayloads";
import { GAME_CENTER_DEFAULT_SEASON } from "../components/molecules/game/SeasonSelector";
import { useFootballCurrentContext } from "./useFootballCurrentContext";

export const useGameCenterHubData = () => {
  const { currentSeason, isLoading: isCurrentContextLoading } = useFootballCurrentContext();
  const [seasonOverride, setSeasonOverride] = useState(null);
  const season = seasonOverride ?? currentSeason ?? GAME_CENTER_DEFAULT_SEASON;

  const { data: seasonData, isLoading, isError } = useQuery({
    queryKey: ["game-center-hub", season],
    queryFn: () => fetchJson(gameCenterPaths.hub(season)),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const parsed = useMemo(() => buildGameCenterHubModel(seasonData), [seasonData]);

  return {
    season,
    setSeason: setSeasonOverride,
    isLoading: isLoading || isCurrentContextLoading,
    isError,
    ...parsed,
  };
};
