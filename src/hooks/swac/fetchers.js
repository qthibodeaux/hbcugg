// Shared fetch functions preserve payload paths and function identity across queries.
// Roster fallback uses the latest shipped 2026 file after any fetch failure,
// not just a 404. Changing that policy is a separate data-layer decision.
import { FE_DOCS_BASE } from "../../utils/gameCenterPayloads";

export const fetcher = (path) => async () => {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
};

export const fetchTeamAnalyticsV2 = fetcher(
  "/assets/ALL_2025_teams_frontend_ready_v2.json",
);

export const fetchCrewRegistry = fetcher("/data/5-officials/crews_registry.json");

export const fetchOfficialsRegistry = fetcher(
  "/data/5-officials/officials_registry.json",
);

export const fetchPlayerSeasonsByYear = (year) =>
  fetcher(`${FE_DOCS_BASE}/players/roster/player_seasons_${year}.json`);

const LATEST_SHIPPED_PLAYER_SEASONS = "2026";

export const fetchPlayerSeasonsByYearOrLatest = (year) => async () => {
  try {
    return await fetchPlayerSeasonsByYear(year)();
  } catch (err) {
    if (String(year) === LATEST_SHIPPED_PLAYER_SEASONS) throw err;
    return fetchPlayerSeasonsByYear(LATEST_SHIPPED_PLAYER_SEASONS)();
  }
};

export const fetchPeopleHubCards = (season) =>
  fetcher(`/data/3-players/people_hub_cards_${season}.json`);

export const fetchPlayerAnalytics = fetcher("/data/0-data/player_analytics_2025.json");

export const fetchPlayerStatsEnriched = fetcher("/data/0-data/player_stats_2025_enriched.json");

export const fetchPlayersHubByYear = (year) =>
  fetcher(`/data/3-players/players_hub_${year}.json`);

export const fetchPlayersHubIndex = fetcher("/data/3-players/players_hub_index.json");

export const fetchTeamProfileByYear = (year) =>
  fetcher(`/data/2-schools/team_profile/team_profile_${year}.json`);

export const fetchSeason2025 = fetchPlayerSeasonsByYear("2025");

export const fetchTeamContinuity = fetcher(
  "/data/0-data/team_continuity_2021_2025.json",
);

export const fetchRosterHubByYear = (year) =>
  fetcher(`${FE_DOCS_BASE}/schools/roster-hub/roster_hub_${year}.json`);

export const fetchCoachesAllYears = fetcher("/data/4-coaches/coaches_all_years.json");

export const fetchCoachesHubIndex = fetcher("/data/4-coaches/coaches_hub_payload_index.json");

export const fetchCoachesHubPayload = (year) => fetcher(`/data/4-coaches/coaches_hub_payload_${year}.json`)();

export const fetchCoachMovements = fetcher(
  "/data/4-coaches/coach_movements_all_years.json",
);

export const fetchTeamHubDoc = (season, teamId) =>
  fetcher(`${FE_DOCS_BASE}/schools/team-hub/${season}/${teamId}.json`);

export const fetchPlayerProfileDoc = (season, personId) =>
  fetcher(`${FE_DOCS_BASE}/players/profile/${season}/${personId}.json`);

export const fetchTeamRosterHubDoc = (season, teamId) =>
  fetcher(`${FE_DOCS_BASE}/schools/team-roster/${season}/${teamId}.json`);
