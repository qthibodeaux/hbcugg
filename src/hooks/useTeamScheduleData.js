import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GAME_CENTER_DEFAULT_SEASON } from "../components/molecules/game/SeasonSelector";
import { fetchJson, gameCenterPaths } from "../utils/gameCenterPayloads";
import { buildTeamScheduleModel, DEFAULT_TEAM } from "../utils/teamScheduleModel";
import { useFootballCurrentContext } from "./useFootballCurrentContext";

// ─── Scoped fetch, with a transport fallback ─────────────────────────────────
//
// The page shows one team. The request should return one team (~28 KB), not
// all eighteen (~508 KB) — see Team Schedules Design Doc section 3. The
// pipeline doesn't publish the scoped files yet, so this asks for the scoped
// path and falls back to the wide season file when it isn't there.
//
// This is a TRANSPORT fallback, not a data fallback: both paths return the
// same team's real games, so nothing downstream can tell which one served it.
// That's the difference between this and the fallbacks removed elsewhere in
// Game Center, which substituted *different* data and made the page lie.
//
// Availability is probed once per season rather than once per team. The first
// team viewed in a season eats a single 404; every other team that season goes
// straight to the shared season query. When the pipeline ships the scoped
// files, the probe succeeds, this map stays empty of `false`, and the whole
// fallback below goes cold and can be deleted.
const scopedAvailability = new Map();

const selectTeamFromSeason = (seasonPayload, teamId) =>
  (seasonPayload?.teams ?? []).find((entry) => entry.team?.team_id === teamId) ?? null;

export const fetchTeamSchedule = async ({ queryClient, season, teamId }) => {
  if (!teamId) return null;

  if (scopedAvailability.get(season) !== false) {
    try {
      const scoped = await fetchJson(gameCenterPaths.teamSchedule(season, teamId));
      scopedAvailability.set(season, true);
      return scoped;
    } catch {
      scopedAvailability.set(season, false);
    }
  }

  // Cached under its own key so the 508 KB file is fetched once per season and
  // shared by every team, rather than re-fetched per team-scoped cache entry.
  const seasonPayload = await queryClient.fetchQuery({
    queryKey: ["team-schedules-season", season],
    queryFn: () => fetchJson(gameCenterPaths.teamSchedules(season)),
    staleTime: Infinity,
  });

  return selectTeamFromSeason(seasonPayload, teamId);
};

export const useTeamScheduleData = ({ fixedTeamId = null } = {}) => {
  const { currentSeason, isLoading: isCurrentContextLoading } = useFootballCurrentContext();
  const queryClient = useQueryClient();
  const [teamIdState, setTeamId] = useState(DEFAULT_TEAM);
  const [seasonOverride, setSeasonOverride] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const teamId = fixedTeamId ?? teamIdState;
  const season = seasonOverride ?? currentSeason ?? GAME_CENTER_DEFAULT_SEASON;

  // teamId is part of the key because the request is scoped by it. Without it,
  // switching teams would serve the previous team's schedule from cache.
  const { data: teamEntry, isLoading, isError, error } = useQuery({
    queryKey: ["team-schedule", season, teamId],
    queryFn: () => fetchTeamSchedule({ queryClient, season, teamId }),
    staleTime: Infinity,
    enabled: !!teamId,
  });

  const model = useMemo(() => (
    buildTeamScheduleModel({ teamEntry, teamId, activeFilter })
  ), [teamEntry, teamId, activeFilter]);

  const setSeason = (value) => {
    setSeasonOverride(Number(value));
    setActiveFilter("all");
  };

  const handleTeamChange = (newId) => {
    if (fixedTeamId) return;
    setTeamId(newId ?? null);
    setActiveFilter("all");
  };

  return {
    teamId,
    setTeamId,
    season,
    setSeason,
    activeFilter,
    setActiveFilter,
    handleTeamChange,
    // `enabled` keeps the query idle until a team is picked; React Query reports
    // that as pending, which would otherwise render a spinner over the empty
    // hub state forever.
    isLoading: (!!teamId && isLoading) || isCurrentContextLoading,
    isError,
    error,
    ...model,
  };
};

// Small, focused hook for "last N completed games" (e.g. a Season Record
// card's recent-form strip) — shares the same query key and scoped/wide
// fetch fallback as useTeamScheduleData, so viewing this and the full Team
// Schedules page for the same team+season never double-fetches.
export const useTeamRecentGames = (exportId, season, count = 5) => {
  const queryClient = useQueryClient();
  const teamId = exportId?.replace(/25$/, "") ?? null;

  const { data: teamEntry, isLoading } = useQuery({
    queryKey: ["team-schedule", season, teamId],
    queryFn: () => fetchTeamSchedule({ queryClient, season, teamId }),
    staleTime: Infinity,
    enabled: !!teamId && !!season,
  });

  const { completed } = buildTeamScheduleModel({ teamEntry, teamId, activeFilter: "all" });

  return {
    // completed is sorted oldest -> newest; take the last `count` and flip
    // so the most recent game reads first.
    recentGames: completed.slice(-count).reverse(),
    isLoading,
  };
};
