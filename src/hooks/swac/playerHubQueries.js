import { useQuery } from "@tanstack/react-query";
import { fetchPeopleHubCards, fetchPlayerAnalytics, fetchPlayersHubByYear, fetchPlayersHubIndex, fetchPlayerProfileDoc } from "./fetchers";

export const usePeopleHubCards = (season = 2025) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["people-hub-cards", String(season)],
    queryFn: fetchPeopleHubCards(season),
    staleTime: Infinity,
    retry: false,
  });

  return {
    cards: data?.cards ?? [],
    meta: data ?? null,
    isLoading,
    isError,
    error,
  };
};

export const usePlayerAnalytics = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["player-analytics"],
    queryFn: fetchPlayerAnalytics,
    staleTime: Infinity,
    retry: false,
  });

  return {
    leaderboards: data?.leaderboards_enriched ?? {},
    transferAnalytics: data?.transfer_analytics ?? null,
    classAnalytics: data?.class_analytics ?? null,
    positionAnalytics: data?.position_analytics ?? null,
    teamAnalytics: data?.team_analytics ?? null,
    isLoading,
    isError,
    error,
  };
};

export const usePlayersHub = (year = 2025) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["players-hub", String(year)],
    queryFn: fetchPlayersHubByYear(String(year)),
    staleTime: Infinity,
    retry: false,
  });

  return {
    hub: data ?? null,
    summary: data?.summary ?? null,
    spotlight: data?.spotlight ?? null,
    positionBoards: data?.position_boards ?? [],
    conferenceTalentMap: data?.conference_talent_map ?? [],
    breakoutRadar: data?.breakout_radar ?? [],
    transferImpact: data?.transfer_impact ?? [],
    hiddenGems: data?.hidden_gems ?? [],
    physicalOutliers: data?.physical_outliers ?? [],
    archetypes: data?.archetypes ?? [],
    gloryLeaders: data?.glory_leaders ?? null,
    playerIndexPreview: data?.player_index_preview ?? [],
    metadata: data?.metadata ?? null,
    isLoading,
    isError,
    error,
  };
};

export const usePlayersHubIndex = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["players-hub-index"],
    queryFn: fetchPlayersHubIndex,
    staleTime: Infinity,
    retry: false,
  });

  return {
    index: data ?? null,
    seasons: data?.seasons ?? [],
    latestSeason: data?.latest_season ?? null,
    isLoading,
    isError,
    error,
  };
};

export const usePlayerProfileDoc = (season, personId) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["player-profile-doc", String(season), personId],
    queryFn: fetchPlayerProfileDoc(season, personId),
    staleTime: Infinity,
    enabled: !!personId,
    retry: false,
  });

  return {
    doc: data ?? null,
    isLoading,
    isError,
    error,
  };
};
