import { useQuery } from "@tanstack/react-query";
import { fetchPlayerSeasonsByYear, fetchPlayerStatsEnriched, fetchSeason2025, fetchPlayerSeasonsByYearOrLatest } from "./fetchers";
import { mapPlayerForRoster, mapPlayerForStats, normalizePositionGroup } from "./normalizers";
import { useMemo } from "react";
import { teamSlug, nameSlug } from "../../utils/headshots";

export const useAllPlayers = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["player-seasons", "2025"],
    queryFn: fetchPlayerSeasonsByYear("2025"),
    staleTime: Infinity,
    retry: false,
  });

  const players = Array.isArray(data) ? data.map(mapPlayerForRoster) : [];

  return { players, isLoading, isError, error };
};

export const usePlayerStatsEnriched = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["player-stats-enriched", "2025"],
    queryFn: fetchPlayerStatsEnriched,
    staleTime: Infinity,
    retry: false,
  });

  const rawPlayers = Array.isArray(data)
    ? data
    : Object.values(data?.players ?? {});
  const players = rawPlayers.map(mapPlayerForStats);

  return { players, meta: data, isLoading, isError, error };
};

const TOP_PLAYERS_PER_TEAM = 12;

export const useTopPlayersByTeam = () => {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["player-stats-enriched", "2025"],
    queryFn: fetchPlayerStatsEnriched,
    staleTime: Infinity,
    retry: false,
  });
  const { data: seasonsData, isLoading: seasonsLoading } = useQuery({
    queryKey: ["player-seasons", "2025"],
    queryFn: fetchPlayerSeasonsByYear("2025"),
    staleTime: Infinity,
    retry: false,
  });

  const joined = useMemo(() => {
    if (!statsData || !seasonsData) return { byTeam: {}, photos: {} };
    const statsArr = Array.isArray(statsData) ? statsData : Object.values(statsData?.players ?? {});
    const seasonsArr = Array.isArray(seasonsData) ? seasonsData : Object.values(seasonsData?.players ?? seasonsData ?? {});
    // These two files do not share a person_id space. `player_stats_2025_enriched`
    // keys people PERS_00004021-ish, `player_seasons_2025` keys them PERS_00011492-ish,
    // and the overlap is 7 rows out of 1,054 — so joining on it alone left almost
    // every team with no photographed player at all, which is why the player and
    // coach frames in the school directory almost never came up. Name + team is
    // the join that actually lands: 863 of 1,054, all 18 teams, 39-62 each. Same
    // approach headshots.js already uses for the game pages. person_id is still
    // tried first, for the rows where it does hit.
    const seasonById = {};
    const seasonByName = {};
    seasonsArr.forEach((p) => {
      if (p.person_id) seasonById[p.person_id] = p;
      seasonByName[`${teamSlug(p.team_id)}:${nameSlug(p.full_name)}`] = p;
    });

    const byTeam = {};
    // Every photographed player, not just the twelve that survive the slice —
    // the pass-target avatars draw on receivers well down a team's PAR order.
    const photos = {};
    statsArr.forEach((p) => {
      if (typeof p.par !== "number" || !p.team) return;
      const season =
        seasonById[p.person_id] ??
        seasonByName[`${teamSlug(p.team)}:${nameSlug(p.name_raw ?? p.name_display)}`];
      if (!season?.image_url) return;
      if (p.person_id) photos[p.person_id] = season.image_url;
      photos[`${teamSlug(p.team)}:${nameSlug(p.name_raw ?? p.name_display)}`] = season.image_url;
      if (!byTeam[p.team]) byTeam[p.team] = [];
      byTeam[p.team].push({
        person_id: p.person_id,
        last_name: season.last_name,
        position: p.position ?? season.position,
        image_url: season.image_url,
        par: p.par,
      });
    });

    Object.keys(byTeam).forEach((teamId) => {
      byTeam[teamId] = byTeam[teamId].sort((a, b) => b.par - a.par).slice(0, TOP_PLAYERS_PER_TEAM);
    });

    return { byTeam, photos };
  }, [statsData, seasonsData]);

  return {
    byTeamId: joined.byTeam,
    /** person_id, and `teamSlug:nameSlug`, to image_url — for any photographed player. */
    photoByKey: joined.photos,
    isLoading: statsLoading || seasonsLoading,
  };
};

export const useSeason2025 = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["season-2025"],
    queryFn: fetchSeason2025,
    staleTime: Infinity,
    retry: false,
  });

  const players = Array.isArray(data) ? data : (data?.players ?? []);

  return {
    players,
    isLoading,
    isError,
    error,
  };
};

export const useAllPlayersByYear = (year, { exactSeason = false } = {}) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["player-seasons", String(year), ...(exactSeason ? ["exact"] : [])],
    queryFn: exactSeason ? fetchPlayerSeasonsByYear(String(year)) : fetchPlayerSeasonsByYearOrLatest(String(year)),
    staleTime: 5 * 60 * 1000, // 5 minutes instead of Infinity
    retry: false,
  });

  const players = Array.isArray(data)
    ? data.map((p) => ({
        ...p,
        _teamId: p.team_id,
        name: p.full_name ?? p.person_id,
        full_name: p.full_name ?? p.person_id,
        position_abbr: p.position_abbr ?? p.position,
        position_group: p.position_group ?? normalizePositionGroup(p.position),
      }))
    : [];

  return { players, isLoading, isError, error };
};
