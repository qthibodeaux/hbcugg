import { GAME_CENTER_DEFAULT_SEASON } from "../../components/molecules/game/SeasonSelector";
import { useQuery } from "@tanstack/react-query";
import { gameCenterPaths, FE_DOCS_BASE } from "../../utils/gameCenterPayloads";
import { fetcher } from "./fetchers";
import { withParAsProduction } from "../../utils/parProduction";

export const useGameData = (gamePathId, season = GAME_CENTER_DEFAULT_SEASON) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["game-detail", String(season), String(gamePathId)],
    queryFn: async () => {
      const res = await fetch(gameCenterPaths.gameFile(season, gamePathId));
      if (!res.ok) throw new Error(`Failed to load game ${gamePathId}`);
      return withParAsProduction(await res.json());
    },
    enabled: !!gamePathId,
    staleTime: Infinity,
    retry: false,
  });

  return { game: data ?? null, isLoading, isError, error };
};

export const useLeagueAverages = (season = 2025) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["league-avg", String(season)],
    queryFn: fetcher(`${FE_DOCS_BASE}/shared/league_avg_${season}.json`),
    staleTime: Infinity,
    retry: false,
  });
  return { data: data ?? null, isLoading, isError, error };
};

export const useTeamSeasonAvg = (teamId, season = 2025) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["team-season-avg", String(teamId), String(season)],
    queryFn: fetcher(`${FE_DOCS_BASE}/shared/team_season_avg_${season}.json`),
    staleTime: Infinity,
    retry: false,
  });
  const teamData = data?.teams?.[teamId] ?? null;
  return { data: teamData, isLoading, isError, error };
};

export const useTeamDefenseAvg = (teamId, season = 2025) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["team-defense-avg", String(teamId), String(season)],
    queryFn: fetcher(`${FE_DOCS_BASE}/shared/team_defense_avg_${season}.json`),
    staleTime: Infinity,
    retry: false,
  });
  const teamData = data?.teams?.[teamId] ?? null;
  return { data: teamData, isLoading, isError, error };
};

export const useAllTeamSeasonAvg = (season = 2025) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["team-season-avg-all", String(season)],
    queryFn: fetcher(`${FE_DOCS_BASE}/shared/team_season_avg_${season}.json`),
    staleTime: Infinity,
    retry: false,
  });
  return { teams: data?.teams ?? null, isLoading, isError, error };
};

export const useAllTeamDefenseAvg = (season = 2025) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["team-defense-avg-all", String(season)],
    queryFn: fetcher(`${FE_DOCS_BASE}/shared/team_defense_avg_${season}.json`),
    staleTime: Infinity,
    retry: false,
  });
  return { teams: data?.teams ?? null, isLoading, isError, error };
};

export const useWikiData = (teamId) => {
  const {
    data: team,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["team", teamId],
    queryFn: async () => {
      const teamsData = await import("../../data/teams.json");
      return teamsData.teams.find((team) => team.id === teamId);
    },
    enabled: !!teamId,
    staleTime: Infinity,
  });

  return { wikiData: team, isLoading, isError };
};

export const useGamesIndex = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["games-index"],
    queryFn: fetcher("/data/93-FE Docs/game-center/games/index.json"),
    staleTime: Infinity,
    retry: false,
  });
  return { games: Array.isArray(data) ? data : data?.games ?? [], isLoading, isError, error };
};
