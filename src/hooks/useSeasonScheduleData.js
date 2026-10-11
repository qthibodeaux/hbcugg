import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GAME_CENTER_DEFAULT_SEASON } from "../components/molecules/game/SeasonSelector";
import { fetchJson, gameCenterPaths } from "../utils/gameCenterPayloads";
import { buildScheduleModel, GROUPS } from "../utils/seasonScheduleModel";
import { useFootballCurrentContext } from "./useFootballCurrentContext";

export const useSeasonScheduleData = ({ routeYear } = {}) => {
  const { currentSeason, isLoading: isCurrentContextLoading } = useFootballCurrentContext();
  const [seasonOverride, setSeasonOverride] = useState(null);
  const [groupId, setGroupId] = useState("swac-east");
  const [includeNonConference, setIncludeNonConference] = useState(false);
  const routeSeason = Number(routeYear) || null;
  const season = seasonOverride ?? routeSeason ?? currentSeason ?? GAME_CENTER_DEFAULT_SEASON;
  const group = GROUPS[groupId] ?? GROUPS["swac-east"];

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["season-schedule-board", season],
    queryFn: () => fetchJson(gameCenterPaths.scheduleBoard(season)),
    staleTime: Infinity,
  });

  const model = useMemo(() => (
    buildScheduleModel(data, group, includeNonConference)
  ), [data, group, includeNonConference]);

  const setSeason = (value) => {
    setSeasonOverride(Number(value));
  };

  return {
    season,
    setSeason,
    groupId,
    setGroupId,
    includeNonConference,
    setIncludeNonConference,
    group,
    model,
    data,
    isLoading: isLoading || isCurrentContextLoading,
    isError,
    error,
  };
};
