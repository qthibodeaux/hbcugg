import { useQuery } from "@tanstack/react-query";
import { FE_DOCS_BASE, fetchJson } from "../utils/gameCenterPayloads";

// Player Leaders — stats/leaders/ (src/pages/stats/md/Player Leaders Fetch Contract.md).
// The backend ranks; this only fetches. Current-season files rebuild in the
// weekly run, so they are re-read now and then; past seasons are frozen.

export const LEADERS_BASE = `${FE_DOCS_BASE}/stats/leaders`;

/** The seasons, the weeks each has, and the latest processed week. */
export const useLeadersIndex = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["leaders-index"],
    queryFn: () => fetchJson(`${LEADERS_BASE}/index.json`),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  return { index: data ?? null, isLoading };
};

/** One week's leaders (`week` a number), or the season's (`week` null). */
export const useLeadersFile = (season, week, enabled = true) => {
  const name = week == null ? "season" : `week_${week}`;
  const { data, isLoading, isError } = useQuery({
    queryKey: ["leaders-file", String(season), name],
    queryFn: () => fetchJson(`${LEADERS_BASE}/${season}/${name}.json`),
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: enabled && season != null,
  });
  return { file: data ?? null, isLoading, isError };
};
