import { useQuery } from "@tanstack/react-query";
import { FE_DOCS_BASE, fetchJson } from "../utils/gameCenterPayloads";

// Leaderboards — stats/leaderboards/ (Backend Notes 2026-11-03c): every player and team,
// season per game and each week, no minimum, garbage time in. The backend ranks; this
// only fetches.
//
// INTERIM: the boards reach FE Docs with the backend's next publish. Until then a request
// that fails falls back to the copies in public/data/leaderboards-interim (2026 season and
// Week 9). Once stats/leaderboards is published, delete that folder and the fallbacks.

const BASE = `${FE_DOCS_BASE}/stats/leaderboards`;
const INTERIM_BASE = "/data/leaderboards-interim";
const INTERIM_INDEX = { current: { season: 2026, week: 9 }, seasons: [{ season: 2026, weeks: [9], season_file: true }] };

export const useLeaderboardsIndex = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["leaderboards-index"],
    queryFn: () => fetchJson(`${BASE}/index.json`).catch(() => INTERIM_INDEX),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  return { index: data ?? null, isLoading };
};

/** One week's boards (`week` a number), or the season's (`week` null). */
export const useLeaderboardFile = (season, week, enabled = true) => {
  const name = week == null ? "season" : `week_${week}`;
  const { data, isLoading, isError } = useQuery({
    queryKey: ["leaderboards-file", String(season), name],
    queryFn: () => fetchJson(`${BASE}/${season}/${name}.json`).catch(() => fetchJson(`${INTERIM_BASE}/${season}/${name}.json`)),
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: enabled && season != null,
  });
  return { file: data ?? null, isLoading, isError };
};
