// Public data-hook API. Domain modules preserve existing query keys and return contracts.
// Stats Hub card feed — built by scripts/build_stats_hub_cards.js. `levers`
// carries the full win-correlation table (every metric, both sides of the
// ball) so a page can rank by it without recomputing.
// Stats Hub cards — the backend's stats/hub-cards/{season}.json since 2026-10-07.
export { useStatsHubCards } from "./useTeamAnalyticsData";

// Week Review + Team Analytics Hub — the backend's weekly files since 2026-10-04
// (stats/team-analytics/, Team Analytics Fetch Contract). Same names and return
// shapes as before; the implementations live in useTeamAnalyticsData.js.
export { useWeekReview, useTeamAnalyticsHub } from "./useTeamAnalyticsData";

// Counting stats — the backend's weekly files since 2026-10-04
// (stats/counting/, Counting Stats Fetch Contract). Implementations live in
// useCountingStats.js; the names stay importable from here.
export { useCountingTeamStats, useCountingPlayerStats, useCountingPenalties, useCountingSeason } from "./useCountingStats";

export { useCoachesHubData, useAllCoaches, useTeamCoaches, useTeamCoachHistory, useCurrentHeadCoaches } from "./swac/coachDirectoryQueries";

export { useCoachingTrees, useAllCoachesByYear, useAllCoachRows, useCoachCareer, useTeamCoachesByYear } from "./swac/coachHistoryQueries";

export { useAllPlayers, usePlayerStatsEnriched, useTopPlayersByTeam, useSeason2025, useAllPlayersByYear } from "./swac/playerRosterQueries";

export { usePeopleHubCards, usePlayerAnalytics, usePlayersHub, usePlayersHubIndex, usePlayerProfileDoc } from "./swac/playerHubQueries";

export { useSWACRoster, useTeamAnalytics, useRosterHub, useTeamHubDoc, useTeamRosterHubDoc, useTeamProfilePayload, useTeamProfile, useTeamContinuity, useLeagueContinuity } from "./swac/schoolQueries";

export { useGameData, useLeagueAverages, useTeamSeasonAvg, useTeamDefenseAvg, useAllTeamSeasonAvg, useAllTeamDefenseAvg, useWikiData, useGamesIndex } from "./swac/gameWikiQueries";

export { useAllOfficials, useAllCrews } from "./swac/officialQueries";
