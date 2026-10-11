import { useQuery } from "@tanstack/react-query";
import { FE_DOCS_BASE, fetchJson } from "../utils/gameCenterPayloads";
import qbMapMock from "../data/mock/qbMapMock.json";

// QB Map — stats/player-analytics/qb-map_{season}.json (QB Map Fetch Contract,
// src/pages/analytics/md). Until the backend ships the file, a missing file falls
// back to the synthetic sample in src/data/mock; the payload's `_mock` key lets the
// page badge it. Delete the fallback and the mock file when the real files land.
export const QB_MAP_BASE = `${FE_DOCS_BASE}/stats/player-analytics`;

const fetchQbMap = async (season) => {
  try {
    return await fetchJson(`${QB_MAP_BASE}/qb-map_${season}.json`);
  } catch {
    return qbMapMock;
  }
};

export const useQbMap = (season) => {
  const { data, isLoading } = useQuery({
    queryKey: ["qb-map", season],
    queryFn: () => fetchQbMap(season),
    staleTime: Infinity,
    retry: false,
  });
  return { data: data || null, isLoading };
};
