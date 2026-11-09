import { useQuery } from "@tanstack/react-query";
import { fetchCoachesHubIndex, fetchCoachesHubPayload, fetchCoachesAllYears } from "./fetchers";
import { toV5TeamId, _isHeadCoach } from "./normalizers";
import { useMemo } from "react";

export const useCoachesHubData = (year = 2025) => {
  const { data: index } = useQuery({
    queryKey: ["coaches-hub-index"],
    queryFn: fetchCoachesHubIndex,
    staleTime: Infinity,
  });

  const { data: payload, isLoading, isError } = useQuery({
    queryKey: ["coaches-hub-payload", String(year)],
    queryFn: () => fetchCoachesHubPayload(year),
    enabled: !!year,
    staleTime: Infinity,
  });

  return {
    index,
    schools: payload?.schools || [],
    summary: payload?.summary || {},
    networkEdges: payload?.network_edges || [],
    movementEdges: payload?.movement_edges || [],
    isLoading,
    isError
  };
};

export const useAllCoaches = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["coaches-all-years"],
    queryFn: fetchCoachesAllYears,
    staleTime: Infinity,
    retry: false,
  });

  const coaches = Array.isArray(data)
    ? data
        .filter((c) => String(c?.season) === "2025")
        .map((c) => ({ ...c, _teamId: c.team_id }))
    : [];

  return { coaches, isLoading, isError, error };
};

export const useTeamCoaches = (exportId) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["coaches-all-years"],
    queryFn: fetchCoachesAllYears,
    staleTime: Infinity,
    enabled: !!exportId,
    retry: false,
  });

  const v5Id = toV5TeamId(exportId);
  const coaches = Array.isArray(data)
    ? data.filter((c) => String(c?.season) === "2025" && c.team_id === v5Id)
    : [];

  return { coaches, isLoading, isError, error };
};

export const useTeamCoachHistory = (exportId) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["coaches-all-years"],
    queryFn: fetchCoachesAllYears,
    staleTime: Infinity,
    enabled: !!exportId,
    retry: false,
  });

  const v5Id = toV5TeamId(exportId);
  // Build seasons map: { "2021": [...coaches], "2022": [...], ... }
  const seasons = useMemo(() => {
    if (!data) return {};
    const result = {};
    data
      .filter((c) => c.team_id === v5Id)
      .forEach((c) => {
        const yr = String(c.season);
        if (!result[yr]) result[yr] = [];
        result[yr].push(c);
      });
    return result;
  }, [data, v5Id]);

  return { seasons, isLoading, isError, error };
};

export const useCurrentHeadCoaches = (year = 2025) => {
  const { data, isLoading } = useQuery({
    queryKey: ["coaches-all-years"],
    queryFn: fetchCoachesAllYears,
    staleTime: Infinity,
    retry: false,
  });

  const byTeamId = useMemo(() => {
    if (!data) return {};
    const result = {};
    data.forEach((c) => {
      if (c.season !== year || !_isHeadCoach(c.title)) return;
      result[c.team_id] = {
        person_id: c.person_id,
        last_name: c.last_name,
        image_url: c.image_url ?? null,
      };
    });
    return result;
  }, [data, year]);

  return { byTeamId, isLoading };
};
