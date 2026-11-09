import { useQuery } from "@tanstack/react-query";
import { fetchTeamAnalyticsV2, fetchRosterHubByYear, fetchTeamHubDoc, fetchTeamRosterHubDoc, fetchTeamProfileByYear, fetchTeamContinuity } from "./fetchers";
import { toV5TeamId } from "./normalizers";

export const useSWACRoster = (exportId) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["team-analytics-v2"],
    queryFn: fetchTeamAnalyticsV2,
    staleTime: Infinity,
    enabled: !!exportId,
    retry: false,
  });

  return {
    roster: data?.teams?.[exportId]?.players ?? [],
    isLoading,
    isError,
    error,
  };
};

export const useTeamAnalytics = (exportId) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["team-analytics-v2"],
    queryFn: fetchTeamAnalyticsV2,
    staleTime: Infinity,
    retry: false,
  });

  return {
    analytics: data?.teams?.[exportId] ?? null,
    isLoading,
    isError,
    error,
  };
};

export const useRosterHub = (year = 2025) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["roster-hub", String(year)],
    queryFn: fetchRosterHubByYear(String(year)),
    staleTime: Infinity,
    retry: false,
  });

  return {
    hub: data ?? null, // full file — { year, total_players, teams, divisions, all }
    allLeague: data?.all ?? null,
    divisions: data?.divisions ?? {},
    teams: data?.teams ?? {},
    isLoading,
    isError,
    error,
  };
};

export const useTeamHubDoc = (season, teamId) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["team-hub-doc", String(season), teamId],
    queryFn: fetchTeamHubDoc(season, teamId),
    staleTime: Infinity,
    enabled: !!teamId,
    retry: false,
  });

  return {
    doc: data ?? null,
    isLoading,
    isError,
    error,
  };
};

export const useTeamRosterHubDoc = (season, teamId) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["roster-hub-team", String(season), teamId],
    queryFn: fetchTeamRosterHubDoc(season, teamId),
    staleTime: Infinity,
    enabled: !!teamId,
    retry: false,
  });

  return {
    doc: data ?? null,
    isLoading,
    isError,
    error,
  };
};

export const useTeamProfilePayload = (year = 2026) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["team-profile", String(year)],
    queryFn: fetchTeamProfileByYear(String(year)),
    staleTime: Infinity,
    retry: false,
  });

  return {
    payload: data ?? null,
    teams: data?.teams ?? {},
    context: data?.context ?? null,
    isLoading,
    isError,
    error,
  };
};

export const useTeamProfile = (exportId, year = 2026) => {
  const result = useTeamProfilePayload(year);
  const v5Id = toV5TeamId(exportId);

  return {
    ...result,
    profile: result.teams?.[v5Id] ?? null,
    teamProfile: result.teams?.[v5Id] ?? null,
  };
};

export const useTeamContinuity = (exportId) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["team-continuity"],
    queryFn: fetchTeamContinuity,
    staleTime: Infinity,
    retry: false,
  });

  const v5Id = toV5TeamId(exportId);

  return {
    continuity: data?.teams?.[v5Id] ?? null,
    leagueSummary: data?.league_summary ?? null,
    isLoading,
    isError,
    error,
  };
};

export const useLeagueContinuity = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["team-continuity"],
    queryFn: fetchTeamContinuity,
    staleTime: Infinity,
    retry: false,
  });

  return {
    teams: data?.teams ?? {},
    leagueSummary: data?.league_summary ?? null,
    isLoading,
    isError,
    error,
  };
};
