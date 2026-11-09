import { useQuery } from "@tanstack/react-query";
import { FE_DOCS_BASE, fetchJson } from "../utils/gameCenterPayloads";

// Ranked team boards — stats/three-and-outs/ and stats/third-and-long/
// (999-frontendfeedback/10 22/three_and_outs/: THREE_AND_OUT_ and
// THIRD_AND_LONG_FETCH_CONTRACT.md, the same file shape). The backend counts
// and ranks, offense and defense; this only fetches. The current season rebuilds
// in the weekly run, so it is re-read now and then; past seasons are frozen.

export const THREE_AND_OUTS_BASE = `${FE_DOCS_BASE}/stats/three-and-outs`;

/** The seasons on file and the current one. */
export const useThreeAndOutsIndex = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["three-and-outs-index"],
    queryFn: () => fetchJson(`${THREE_AND_OUTS_BASE}/index.json`),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  return { index: data ?? null, isLoading };
};

/**
 * One season of a ranked team board: offense, defense, the game log and the
 * no-games list. `slug` is the folder under stats/: "three-and-outs" or
 * "third-and-long" (THIRD_AND_LONG_FETCH_CONTRACT.md, the same shape).
 */
export const useStatBoard = (slug, season) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: [slug, String(season)],
    queryFn: () => fetchJson(`${FE_DOCS_BASE}/stats/${slug}/${season}.json`),
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: season != null,
  });
  return { file: data ?? null, isLoading, isError };
};

export const useThreeAndOuts = (season) => useStatBoard("three-and-outs", season);
