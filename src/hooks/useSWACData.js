import { useMemo } from "react";
import { nameSlug, teamSlug } from "../utils/headshots";
import { useQuery } from "@tanstack/react-query";
import { FE_DOCS_BASE, gameCenterPaths } from "../utils/gameCenterPayloads";
import { GAME_CENTER_DEFAULT_SEASON } from "../components/molecules/game/SeasonSelector";

// ─── Fetchers ────────────────────────────────────────────────────────────────

const fetcher = (path) => async () => {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
};

const POSITION_GROUP_SET = new Set([
  "QB",
  "RB",
  "WR",
  "TE",
  "OL",
  "DL",
  "LB",
  "DB",
  "ST",
]);

const normalizePositionGroup = (position) => {
  if (!position) return "ST";
  const upper = String(position).trim().toUpperCase();
  if (POSITION_GROUP_SET.has(upper)) return upper;
  if (["K", "P", "LS"].includes(upper)) return "ST";
  return "ST";
};

const toConferenceAffiliations = (assignments = []) => {
  const aff = new Set();
  assignments.forEach((a) => {
    (a?.teams ?? []).forEach((team) => {
      const t = String(team).toLowerCase();
      if (t.includes("meac")) aff.add("meac");
      if (t.includes("swac")) aff.add("swac");
    });
  });
  return [...aff];
};

const mapPlayerForRoster = (p) => ({
  person_id: p.person_id,
  full_name: p.full_name ?? p.person_id,
  team_id: p.team_id,
  jersey_number: p.jersey_number,
  position_abbr: p.position,
  position_group: p.position_group ?? normalizePositionGroup(p.position),
  class_year: p.class_year,
  is_transfer: p.is_transfer,
  transfer_tier: p.transfer_tier,
  image_url: p.image_url ?? null,
  height: p.height,
  weight: p.weight,
  hometown: p.hometown,
  home_city: p.home_city,
  home_state: p.home_state,
  is_in_state: p.is_in_state,
  distance_miles: p.distance_miles,
  distance_tier: p.distance_tier,
  high_school: p.high_school,
  previous_school: p.previous_school,
  experience_score: p.experience_score,
  is_redshirt: p.is_redshirt ?? false,
});

const mapPlayerForStats = (p) => ({
  player_key: p.player_key,
  person_id: p.person_id,
  name_display: p.name_display ?? p.full_name ?? p.person_id,
  full_name: p.full_name ?? p.name_display ?? p.person_id,
  name_raw: p.name_raw,
  team: p.team ?? p.team_id ?? p.roster_source_id,
  jersey_number: p.jersey_number,
  position: p.position,
  position_group: p.position_group ?? normalizePositionGroup(p.position),
  class_year: p.class_year,
  is_transfer: p.is_transfer,
  transfer_tier: p.transfer_tier,
  image_url: p.image_url ?? null,
  height: p.height,
  weight: p.weight,
  hometown: p.hometown,
  home_state: p.home_state,
  total_production: p.total_production ?? null,
  avg_production: p.avg_production ?? null,
  par: p.par ?? 0,
  games_played: p.games_played ?? null,
  is_redshirt: p.is_redshirt ?? false,
  season_components: p.season_components ?? null,
  games: p.games ?? [],
});

const _isHeadCoach = (title = "") =>
  /head\s+(football\s+)?coach/i.test(title) && !/assistant/i.test(title);
const _isCoordinator = (title = "") => /coordinator/i.test(title);

// v2 — roster + analytics per team (exportId with "25" suffix)
const fetchTeamAnalyticsV2 = fetcher(
  "/assets/ALL_2025_teams_frontend_ready_v2.json",
);

const fetchCrewRegistry = fetcher("/data/5-officials/crews_registry.json");
const fetchOfficialsRegistry = fetcher(
  "/data/5-officials/officials_registry.json",
);

// Player stats enriched — 903 players with PAR + roster profile.
// Served from the 93-FE Docs drop (players/roster/), same row shape as the
// legacy 3-players/ file.
const fetchPlayerSeasonsByYear = (year) =>
  fetcher(`${FE_DOCS_BASE}/players/roster/player_seasons_${year}.json`);

// The newest roster file that actually ships. A season can have games exported
// before its rosters are (2026 was, until the 2026-09-14 drop) — a straight 404 there
// resolves to an empty player list, which silently strips every headshot,
// position and jersey number off every card on the game page. Falling back to
// the last shipped roster keeps identity data on screen; players new to the
// league that season still miss, which is a data gap, not a bug (see
// STATS_HUB_CARD_INVENTORY.md).
const LATEST_SHIPPED_PLAYER_SEASONS = "2026";

const fetchPlayerSeasonsByYearOrLatest = (year) => async () => {
  try {
    return await fetchPlayerSeasonsByYear(year)();
  } catch (err) {
    if (String(year) === LATEST_SHIPPED_PLAYER_SEASONS) throw err;
    return fetchPlayerSeasonsByYear(LATEST_SHIPPED_PLAYER_SEASONS)();
  }
};

// Player analytics — leaderboards + transfer breakdown
const fetchPeopleHubCards = (season) =>
  fetcher(`/data/3-players/people_hub_cards_${season}.json`);
const fetchPlayerAnalytics = fetcher("/data/0-data/player_analytics_2025.json");
const fetchPlayerStatsEnriched = fetcher("/data/0-data/player_stats_2025_enriched.json");
const fetchPlayersHubByYear = (year) =>
  fetcher(`/data/3-players/players_hub_${year}.json`);
const fetchPlayersHubIndex = fetcher("/data/3-players/players_hub_index.json");
const fetchTeamProfileByYear = (year) =>
  fetcher(`/data/2-schools/team_profile/team_profile_${year}.json`);

// Season 2025 canonical player records (replaces removed season_2025.json rollup)
const fetchSeason2025 = fetchPlayerSeasonsByYear("2025");

// Team continuity — continuity scores, HC history, retention 2021-2025
const fetchTeamContinuity = fetcher(
  "/data/0-data/team_continuity_2021_2025.json",
);

// Roster hub analytics — league/conference/team modules by season
const fetchRosterHubByYear = (year) =>
  fetcher(`${FE_DOCS_BASE}/schools/roster-hub/roster_hub_${year}.json`);

// Coach season rows with team_id + season for exact year filtering
const fetchCoachesAllYears = fetcher("/data/4-coaches/coaches_all_years.json");

// Coaches Hub Ecosystem data
const fetchCoachesHubIndex = fetcher("/data/4-coaches/coaches_hub_payload_index.json");
const fetchCoachesHubPayload = (year) => fetcher(`/data/4-coaches/coaches_hub_payload_${year}.json`)();

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

// Coach movement events — promotions, laterals, team changes 2021-2025
const fetchCoachMovements = fetcher(
  "/data/4-coaches/coach_movements_all_years.json",
);

// ─── ID helpers ──────────────────────────────────────────────────────────────

// v5 team IDs drop the "25" suffix that v2/exportId use
const toV5TeamId = (exportId) => exportId?.replace(/25$/, "") ?? null;

// ─── v2 Hooks (roster + analytics) ───────────────────────────────────────────

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

// All players across 18 teams from v2 (flat array, ~2,061 players)
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

// ─── v5 Entities Hooks ────────────────────────────────────────────────────────

// All 2025 coaches flattened across all teams
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

// Coaches for a specific team in 2025
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

// Coach career data across 2021-2025 for a specific team
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

// ─── Officials Hooks ──────────────────────────────────────────────────────────

export const useAllOfficials = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["officials-registry"],
    queryFn: fetchOfficialsRegistry,
    staleTime: Infinity,
    retry: false,
  });

  const officials = Array.isArray(data)
    ? data.map((o) => ({
        ...o,
        name: o.full_name ?? o.person_id,
        conference_affiliations: toConferenceAffiliations(o.assignments ?? []),
      }))
    : [];

  return { officials, isLoading, isError, error };
};

export const useAllCrews = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["official-crews"],
    queryFn: async () => {
      const [crews, refs] = await Promise.all([
        fetchCrewRegistry(),
        fetchOfficialsRegistry(),
      ]);
      return { crews, refs };
    },
    staleTime: Infinity,
    retry: false,
  });

  // officials_registry.json is an array keyed by person_id
  const refsByPersonId = (data?.refs ?? []).reduce((acc, ref) => {
    if (ref.person_id) acc[ref.person_id] = ref;
    return acc;
  }, {});

  const crews = Array.isArray(data?.crews)
    ? data.crews.map((crew) => ({
        crew_id: crew.crew_id,
        game_id: crew.games?.[0] ?? crew.crew_id,
        officials: (crew.members ?? []).map((m) => ({
          person_id: m.person_id,
          name: m.name ?? refsByPersonId[m.person_id]?.full_name ?? m.person_id,
          role: "OFFICIAL",
        })),
      }))
    : [];

  return {
    crews,
    analyticsSummary: {
      total_crews: crews.length,
      average_crew_size: crews.length
        ? (
            crews.reduce((sum, c) => sum + c.officials.length, 0) / crews.length
          ).toFixed(1)
        : 0,
      total_partnerships: crews.reduce(
        (sum, c) => sum + Math.max(0, c.officials.length - 1),
        0,
      ),
      geographic_coverage: "Multi-conference",
    },
    isLoading,
    isError,
    error,
  };
};

// ─── Player Stats Hooks ───────────────────────────────────────────────────────

// 903 players with PAR, production stats, roster profile merged
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

// With the join fixed each team has 39-62 photographed players to draw on, so the
// directory's player frames can show a different face most times they come up
// rather than cycling the same three.
const TOP_PLAYERS_PER_TEAM = 12;

// Top-3 PAR players per team — joins player_stats_2025_enriched (par, team)
// against player_seasons_2025 (image_url, last_name) by person_id, since PAR
// and photo currently live in two different exports.
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

// Current-season head coach per team — filters the full coaching staff
// export down to just the Head Coach title for the given season.
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

// Leaderboards + transfer analytics
// People Hub card feed — the editorial storyline cards described in
// reqs/PEOPLE_HUB_CARD_INVENTORY.md. Generated today by
// scripts/build_people_hub_cards.js from real 2025 exports; the real feed is
// a backend weighting/ranking job. 404s harmlessly for any season without a
// generated file, same graceful-degrade pattern as the per-entity doc hooks.
export const usePeopleHubCards = (season = 2025) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["people-hub-cards", String(season)],
    queryFn: fetchPeopleHubCards(season),
    staleTime: Infinity,
    retry: false,
  });

  return {
    cards: data?.cards ?? [],
    meta: data ?? null,
    isLoading,
    isError,
    error,
  };
};

// Stats Hub card feed — built by scripts/build_stats_hub_cards.js. `levers`
// carries the full win-correlation table (every metric, both sides of the
// ball) so a page can rank by it without recomputing.
// Stats Hub cards — the backend's stats/hub-cards/{season}.json since 2026-10-07.
export { useStatsHubCards } from "./useTeamAnalyticsData";

// Week Review + Team Analytics Hub — the backend's weekly files since 2026-10-04
// (stats/team-analytics/, Team Analytics Fetch Contract). Same names and return
// shapes as before; the implementations live in useTeamAnalyticsData.js.
export { useWeekReview, useTeamAnalyticsHub } from "./useTeamAnalyticsData";

export const usePlayerAnalytics = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["player-analytics"],
    queryFn: fetchPlayerAnalytics,
    staleTime: Infinity,
    retry: false,
  });

  return {
    leaderboards: data?.leaderboards_enriched ?? {},
    transferAnalytics: data?.transfer_analytics ?? null,
    classAnalytics: data?.class_analytics ?? null,
    positionAnalytics: data?.position_analytics ?? null,
    teamAnalytics: data?.team_analytics ?? null,
    isLoading,
    isError,
    error,
  };
};

// 2025 player season records — flat array of 2083 player-season rows
export const usePlayersHub = (year = 2025) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["players-hub", String(year)],
    queryFn: fetchPlayersHubByYear(String(year)),
    staleTime: Infinity,
    retry: false,
  });

  return {
    hub: data ?? null,
    summary: data?.summary ?? null,
    spotlight: data?.spotlight ?? null,
    positionBoards: data?.position_boards ?? [],
    conferenceTalentMap: data?.conference_talent_map ?? [],
    breakoutRadar: data?.breakout_radar ?? [],
    transferImpact: data?.transfer_impact ?? [],
    hiddenGems: data?.hidden_gems ?? [],
    physicalOutliers: data?.physical_outliers ?? [],
    archetypes: data?.archetypes ?? [],
    gloryLeaders: data?.glory_leaders ?? null,
    playerIndexPreview: data?.player_index_preview ?? [],
    metadata: data?.metadata ?? null,
    isLoading,
    isError,
    error,
  };
};

export const usePlayersHubIndex = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["players-hub-index"],
    queryFn: fetchPlayersHubIndex,
    staleTime: Infinity,
    retry: false,
  });

  return {
    index: data ?? null,
    seasons: data?.seasons ?? [],
    latestSeason: data?.latest_season ?? null,
    isLoading,
    isError,
    error,
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

// ─── Roster Hub Hook ─────────────────────────────────────────────────────────

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

// One-team, one-document Team Hub — BACKEND_RESPONSE_SPEC.md §1. Served from
// the 93-FE Docs drop (schools/team-hub/{season}/{team_id}.json), all 18 teams
// for 2019–2026. A missing team/season 404s and `doc` comes back null, same
// graceful-degrade pattern as useTeamRosterHubDoc below.
const fetchTeamHubDoc = (season, teamId) =>
  fetcher(`${FE_DOCS_BASE}/schools/team-hub/${season}/${teamId}.json`);

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

// One-player, one-document profile — BACKEND_RESPONSE_SPEC.md §4.2. Served
// from the 93-FE Docs drop (players/profile/{season}/{person_id}.json). A
// missing person_id/season 404s and `doc` comes back null, same
// graceful-degrade pattern as the other per-entity docs in this file.
const fetchPlayerProfileDoc = (season, personId) =>
  fetcher(`${FE_DOCS_BASE}/players/profile/${season}/${personId}.json`);

export const usePlayerProfileDoc = (season, personId) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["player-profile-doc", String(season), personId],
    queryFn: fetchPlayerProfileDoc(season, personId),
    staleTime: Infinity,
    enabled: !!personId,
    retry: false,
  });

  return {
    doc: data ?? null,
    isLoading,
    isError,
    error,
  };
};

// One-team, one-document roster hub — the new per-team contract
// (roster_hub_pvamu_2025_demo.json shape: composition/frame_profile/
// experience_by_room/players[] all in one file). Only PVAMU/2025 exists on
// disk today; every other team/season 404s and the query settles into
// `isError` with `data: undefined` — same "not published yet" pattern as
// every other single-document fetch in this file, and the caller reads
// `doc ?? null` without branching on isError so a missing file degrades to
// the page's existing "not available" state instead of throwing.
const fetchTeamRosterHubDoc = (season, teamId) =>
  fetcher(`${FE_DOCS_BASE}/schools/team-roster/${season}/${teamId}.json`);

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

// ─── Program Intelligence Hooks ───────────────────────────────────────────────

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

export const useCoachingTrees = () => {
  const {
    data: coachesData,
    isLoading: cL,
    isError,
    error,
  } = useQuery({
    queryKey: ["coaches-all-years"],
    queryFn: fetchCoachesAllYears,
    staleTime: Infinity,
    retry: false,
  });
  const { data: movementsData, isLoading: mL } = useQuery({
    queryKey: ["coach-movements"],
    queryFn: fetchCoachMovements,
    staleTime: Infinity,
    retry: false,
  });

  const isLoading = cL || mL;

  // One record per unique coach with their full arc across all seasons
  const careerProgressions = useMemo(() => {
    if (!coachesData) return [];
    const byPerson = {};
    coachesData.forEach((c) => {
      if (!byPerson[c.person_id]) {
        byPerson[c.person_id] = {
          person_id: c.person_id,
          name: c.full_name,
          entries: [],
        };
      }
      byPerson[c.person_id].entries.push({
        season: c.season,
        title: c.title,
        team_id: c.team_id,
      });
    });
    return Object.values(byPerson).map((coach) => {
      const entries = coach.entries.sort((a, b) => a.season - b.season);
      const positions = [...new Set(entries.map((e) => e.title))];
      const teams = [...new Set(entries.map((e) => e.team_id))];
      const hasHC = positions.some((p) => _isHeadCoach(p));
      const hasCoord = positions.some((p) => _isCoordinator(p));
      let arc_type = "stable";
      if (hasHC && hasCoord) arc_type = "coordinator_to_head";
      else if (teams.length > 1) arc_type = "lateral";
      return { ...coach, arc: { arc_type, positions, teams } };
    });
  }, [coachesData]);

  // Pairs of coaches who shared the same team in the same season, 2+ times
  const staffRelationships = useMemo(() => {
    if (!coachesData) return [];
    const nameById = {};
    coachesData.forEach((c) => {
      nameById[c.person_id] = c.full_name;
    });
    const byTeamYear = {};
    coachesData.forEach((c) => {
      const key = `${c.team_id}_${c.season}`;
      if (!byTeamYear[key])
        byTeamYear[key] = { team_id: c.team_id, coaches: [] };
      byTeamYear[key].coaches.push(c.person_id);
    });
    const pairs = {};
    Object.values(byTeamYear).forEach(({ team_id, coaches }) => {
      for (let i = 0; i < coaches.length; i++) {
        for (let j = i + 1; j < coaches.length; j++) {
          const key = [coaches[i], coaches[j]].sort().join("__");
          if (!pairs[key])
            pairs[key] = {
              ids: [coaches[i], coaches[j]],
              years_together: 0,
              teams: new Set(),
            };
          pairs[key].years_together++;
          pairs[key].teams.add(team_id);
        }
      }
    });
    return Object.values(pairs)
      .filter((p) => p.years_together >= 2)
      .map((p) => ({
        coach1_name: nameById[p.ids[0]] ?? p.ids[0],
        coach2_name: nameById[p.ids[1]] ?? p.ids[1],
        years_together: p.years_together,
        shared_programs: [...p.teams],
      }))
      .sort((a, b) => b.years_together - a.years_together);
  }, [coachesData]);

  // Coaches who changed programs
  const programTransfers = useMemo(() => {
    if (!movementsData) return [];
    return movementsData
      .filter((m) => m.team_changed)
      .map((m) => ({
        coach_name: m.full_name,
        from_team: m.from_team_id,
        to_team: m.to_team_id,
        year: m.to_season,
        role: m.to_title,
      }));
  }, [movementsData]);

  return {
    summary: null,
    staffTrees: {},
    careerProgressions,
    staffRelationships,
    programTransfers,
    isLoading,
    isError,
    error,
  };
};

// ─── Year-based v5 Hooks ──────────────────────────────────────────────────────

// All coaches for a given year (2021-2025) across all teams
export const useAllCoachesByYear = (year) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["coaches-all-years", String(year)],
    queryFn: fetchCoachesAllYears,
    staleTime: 5 * 60 * 1000, // 5 minutes instead of Infinity
    retry: false,
  });

  const coaches = Array.isArray(data)
    ? data
        .filter((c) => String(c?.season) === String(year))
        .map((c) => ({
          ...c,
          name: c.full_name ?? c.name,
          _teamId: c.team_id,
        }))
    : [];

  return { coaches, isLoading, isError, error };
};

// All season rows + movements for a single coach — used by CoachDetailPage
export const useAllCoachRows = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["coaches-all-years"],
    queryFn: fetchCoachesAllYears,
    staleTime: Infinity,
    retry: false,
  });

  const coaches = Array.isArray(data)
    ? data.map((c) => ({
        ...c,
        name: c.full_name ?? c.name,
        _teamId: c.team_id,
      }))
    : [];

  return { coaches, isLoading, isError, error };
};

export const useCoachCareer = (coachId) => {
  const {
    data: coachesData,
    isLoading: cL,
    isError,
    error,
  } = useQuery({
    queryKey: ["coaches-all-years"],
    queryFn: fetchCoachesAllYears,
    staleTime: Infinity,
    retry: false,
  });
  const { data: movementsData, isLoading: mL } = useQuery({
    queryKey: ["coach-movements"],
    queryFn: fetchCoachMovements,
    staleTime: Infinity,
    retry: false,
  });

  const seasons = useMemo(() => {
    if (!coachesData || !coachId) return [];
    return coachesData
      .filter((c) => c.person_id === coachId)
      .sort((a, b) => a.season - b.season);
  }, [coachesData, coachId]);

  const movements = useMemo(() => {
    if (!movementsData || !coachId) return [];
    return movementsData
      .filter((m) => m.person_id === coachId)
      .sort((a, b) => a.to_season - b.to_season);
  }, [movementsData, coachId]);

  // Most recent season record (for name, image, bio_url)
  const latest = useMemo(() => {
    if (!seasons.length) return null;
    return seasons[seasons.length - 1];
  }, [seasons]);

  return { seasons, movements, latest, isLoading: cL || mL, isError, error };
};

// Coaches for a specific team and year from explicit season rows
export const useTeamCoachesByYear = (exportId, year) => {
  const { coaches, isLoading, isError, error } = useAllCoachesByYear(year);
  const v5Id = toV5TeamId(exportId);
  const teamCoaches = coaches.filter((c) => c._teamId === v5Id);

  return { coaches: teamCoaches, isLoading, isError, error };
};

// All players for a given year (2021-2025) across all teams
export const useAllPlayersByYear = (year) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["player-seasons", String(year)],
    queryFn: fetchPlayerSeasonsByYearOrLatest(String(year)),
    staleTime: 5 * 60 * 1000, // 5 minutes instead of Infinity
    retry: false,
  });

  const players = Array.isArray(data)
    ? data.map((p) => ({
        ...p,
        _teamId: p.team_id,
        name: p.full_name ?? p.person_id,
        full_name: p.full_name ?? p.person_id,
        position_abbr: p.position,
        position_group: p.position_group ?? normalizePositionGroup(p.position),
      }))
    : [];

  return { players, isLoading, isError, error };
};

// ─── Game Data Hook ──────────────────────────────────────────────────────────

export const useGameData = (gamePathId, season = GAME_CENTER_DEFAULT_SEASON) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["game-detail", String(season), String(gamePathId)],
    queryFn: async () => {
      const res = await fetch(gameCenterPaths.gameFile(season, gamePathId));
      if (!res.ok) throw new Error(`Failed to load game ${gamePathId}`);
      return res.json();
    },
    enabled: !!gamePathId,
    staleTime: Infinity,
    retry: false,
  });

  return { game: data ?? null, isLoading, isError, error };
};

// ─── League & Team Season Averages (Contextual Stat Grading) ─────────────────
// Moved to the 2026-08-30 export tree (`93-FE Docs/shared/`) — same shape as the
// old `0-data/` files plus a new `defense_impact` block, and it carries 2026.

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

// League-wide variants of the two hooks above — the Stats section ranks all
// 18 teams at once rather than grading one, so it needs the whole map.
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

// Wiki data for a specific team by id (e.g. "pvam")
// Uses authoritative teams.json as data source instead of separate wiki.json
export const useWikiData = (teamId) => {
  const {
    data: team,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["team", teamId],
    queryFn: async () => {
      const teamsData = await import("../data/teams.json");
      return teamsData.teams.find((team) => team.id === teamId);
    },
    enabled: !!teamId,
    staleTime: Infinity,
  });

  return { wikiData: team, isLoading, isError };
};

// Counting stats (/stats/team, /stats/player) — the season aggregate the
// conference sites publish (Sidearm tables). Until the backend ships
// GET /api/stats/{team|player}/{season} (Counting Stats Fetch Contract), the
// files are the labelled mock from scripts/build_counting_stats_mock.js.
// Counting stats — the backend's weekly files since 2026-10-04
// (stats/counting/, Counting Stats Fetch Contract). Implementations live in
// useCountingStats.js; the names stay importable from here.
export { useCountingTeamStats, useCountingPlayerStats, useCountingPenalties, useCountingSeason } from "./useCountingStats";

// Games index — every parsed game (416 across 2019-2026) with both team ids,
// the final score and its route. The Matchup tab reads it for head-to-head
// history; it is real data, not a derived stat.
export const useGamesIndex = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["games-index"],
    queryFn: fetcher("/data/93-FE Docs/game-center/games/index.json"),
    staleTime: Infinity,
    retry: false,
  });
  return { games: Array.isArray(data) ? data : data?.games ?? [], isLoading, isError, error };
};
