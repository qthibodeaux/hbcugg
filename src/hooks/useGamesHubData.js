import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GAME_CENTER_DEFAULT_SEASON } from "../components/molecules/game/SeasonSelector";
import { gameCenterPaths, fetchJson } from "../utils/gameCenterPayloads";
import { buildGamesHubModel } from "../utils/gamesHubModel";
import { useFootballCurrentContext } from "./useFootballCurrentContext";

export const useGamesHubData = () => {
  const { currentSeason, isLoading: isCurrentContextLoading } = useFootballCurrentContext();
  const [seasonOverride, setSeasonOverride] = useState(null);
  const [weekFilter, setWeekFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("");
  const [conferenceFilter, setConferenceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const season = String(seasonOverride ?? currentSeason ?? GAME_CENTER_DEFAULT_SEASON);

  const { data: seasonData, isLoading, isError, error } = useQuery({
    queryKey: ["games-hub", season],
    queryFn: () => fetchJson(gameCenterPaths.gamesHub(season)),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const model = useMemo(
    () => buildGamesHubModel({ seasonData, weekFilter, teamFilter, conferenceFilter, statusFilter }),
    [seasonData, weekFilter, teamFilter, conferenceFilter, statusFilter],
  );

  const setSeason = (value) => {
    setSeasonOverride(String(value));
    setWeekFilter("all");
    setTeamFilter("");
    setConferenceFilter("all");
    setStatusFilter("all");
  };

  return {
    season,
    setSeason,
    weekFilter,
    setWeekFilter,
    teamFilter,
    setTeamFilter,
    conferenceFilter,
    setConferenceFilter,
    statusFilter,
    setStatusFilter,
    isLoading: isLoading || isCurrentContextLoading,
    isError,
    error,
    ...model,
  };
};
