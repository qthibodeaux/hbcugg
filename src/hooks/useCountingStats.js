import { useQuery } from "@tanstack/react-query";
import { FE_DOCS_BASE, fetchJson } from "../utils/gameCenterPayloads";
import { demoSeasons } from "../config/demo";

// ─────────────────────────────────────────────────────────────────────────────
// Counting stats — the backend's weekly files (Counting Stats Fetch Contract,
// src/pages/stats/md). stats/counting/{index, team_, player_, penalties_}.
// Totals cover League games only (two of the 18, play-by-play); the files say
// so in `tier` / `tier_note`. These hooks only fetch and pass through.
// ─────────────────────────────────────────────────────────────────────────────

export const COUNTING_BASE = `${FE_DOCS_BASE}/stats/counting`;

const useFile = (key, path, enabled = true) =>
  useQuery({ queryKey: ["counting", key], queryFn: () => fetchJson(`${COUNTING_BASE}/${path}`), enabled, staleTime: 5 * 60 * 1000, retry: false });

export const useCountingIndex = () => {
  const { data, isLoading } = useFile("index", "index.json");
  return { currentSeason: data?.current_season ?? null, seasons: demoSeasons(data?.seasons ?? []), isLoading };
};

/** The season a counting page should show: the picked one, else the backend's current. */
export const useCountingSeason = (picked) => {
  const index = useCountingIndex();
  return picked ?? index.currentSeason ?? null;
};

export const useCountingTeamStats = (season) => {
  const { data, isLoading, isError, error } = useFile(`team-${season}`, `team_${season}.json`, season != null);
  return {
    teams: data?.teams ?? [],
    source: data ? "backend" : null,
    tier: data?.tier ?? null,
    tierNote: data?.tier_note ?? null,
    gamesThrough: data?.games_through ?? null,
    isLoading: season == null || isLoading,
    isError,
    error,
  };
};

export const useCountingPlayerStats = (season) => {
  const { data, isLoading, isError, error } = useFile(`player-${season}`, `player_${season}.json`, season != null);
  return {
    players: data?.players ?? [],
    floors: data?.floors ?? null,
    source: data ? "backend" : null,
    tier: data?.tier ?? null,
    gamesThrough: data?.games_through ?? null,
    isLoading: season == null || isLoading,
    isError,
    error,
  };
};

export const useCountingPenalties = (season) => {
  const { data, isLoading } = useFile(`penalties-${season}`, `penalties_${season}.json`, season != null);
  return { file: data ?? null, isLoading: season == null || isLoading };
};
