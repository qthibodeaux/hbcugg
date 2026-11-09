import teamsData from "../../data/teams.json";

export const TEAM_BY_ID = teamsData.teams.reduce((acc, t) => {
  acc[t.id] = t;
  acc[t.exportId] = t;
  acc[t.exportId.replace(/25$/, "")] = t;
  return acc;
}, {});

export const SORTED_TEAMS = [...teamsData.teams].sort((a, b) => a.name.localeCompare(b.name));

export const TEAM_BY_EXPORT = Object.fromEntries(teamsData.teams.map((t) => [t.exportId.replace(/25$/, ""), t]));

export const getTeam = (id) => TEAM_BY_ID[id] ?? null;

const GAME_CENTER_ITEMS = [
  { id: "hub", label: "HUB", path: "/game-center" },
  { id: "games", label: "GAMES", path: "/game-center/games" },
  { id: "week", label: "WEEK CENTRAL", path: "/game-center/week" },
  { id: "conferenceslate", label: "CONFERENCE SLATE", path: "/game-center/conferenceslate" },
  { id: "seasonschedule", label: "SEASON SCHEDULE", path: "/game-center/seasonschedule" },
  { id: "team", label: "TEAM SCHEDULES", path: "/game-center/team" },
  { id: "standings", label: "STANDINGS", path: "/game-center/standings" },
  // Classics & Homecoming pulled for launch.0 (2026-10-04) — AFTER_LAUNCH_0.md §1.
  // Route stays wired in App.js.
];

export const SCHOOLS_ITEMS = [
  { id: "school-profiles", label: "DIRECTORY", path: "/schools" },
  { id: "wiki", label: "WIKI", path: "/schools/wiki" },
  // The week's Team of the Week, as a season profile (2026-10-21).
  { id: "spotlight", label: "TEAM SPOTLIGHT", path: "/schools/spotlight" },
  {
    id: "rosters-hub",
    label: "ROSTERS HUB",
    path: "/rosters",
    expandable: true,
    children: [
      { id: "roster-full", label: "ROSTER", path: "/rosters/full", indent: true },
      { id: "breakdown", label: "BREAKDOWN", path: "/rosters/breakdown", indent: true },
    ],
  },
];

const PEOPLE_ITEMS = [
  { id: "hub", label: "HUB", path: "/people" },
  { id: "players", label: "PLAYERS", path: "/players" },
  { id: "coaches", label: "COACHES", path: "/coaches" },
  { id: "officials", label: "OFFICIALS", path: "/officials" },
];

const STATS_ITEMS = [
  // Phones skip the Hub (its mobile cards are punted): /stats sends them to
  // Team Analytics, and the mobile section menu leaves this item off.
  { id: "hub", label: "HUB", path: "/stats", mobileHidden: true },
  // Analytics first, then the stat tables (order set 2026-10-04).
  { id: "team-analytics", label: "TEAM ANALYTICS", path: "/team-analytics" },
  { id: "player-analytics", label: "PLAYER ANALYTICS", path: "/player-analytics" },
  // Team / Player Stats own their tabs on the page (the 4x1 grid); no
  // sub-items here — the Team Analytics exception stays the exception.
  { id: "team-stats", label: "TEAM STATS", path: "/stats/team" },
  { id: "player-stats", label: "PLAYER STATS", path: "/stats/player" },
  { id: "deep-dive", label: "DEEP DIVE", path: "/stats/deep-dive" },
];

const SCHEDULE_ITEMS = [
  { id: "hub", label: "CALENDAR", path: "/schedule" },
  { id: "results", label: "RESULTS", path: "/schedule?tab=results" },
  { id: "upcoming", label: "UPCOMING", path: "/schedule?tab=upcoming" },
];

const OFFICIALS_ITEMS = [
  { id: "roster", label: "DIRECTORY", path: "/officials" },
  { id: "crews", label: "CREWS", path: "/officials?tab=crews" },
];

export const COACHES_ITEMS = [
  { id: "dash", label: "DASHBOARD", path: "/coaches" },
  { id: "roster", label: "STAFF DIRECTORY", path: "/coaches?tab=roster" },
  { id: "arcs", label: "CAREER ARCS", path: "/coaches?tab=arcs" },
];

export const PLAYER_DETAIL_ITEMS = [
  { id: "profile", label: "BIO & BACKGROUND", path: "profile" },
  { id: "production", label: "SEASON STATS", path: "production" },
  { id: "stats", label: "ADVANCED ANALYTICS", path: "stats" },
];

export const LEGACY_PLAYER_TAB_MAP = {
  dash: "stats",
  profile: "profile",
  production: "production",
};

export const HUBS = {
  gameCenter: {
    id: "game-center",
    label: "GAME CENTER",
    shortName: "GC",
    primary: "#E53E3E",
    secondary: "#F6AD55",
    items: GAME_CENTER_ITEMS,
    match: (p) => p.startsWith("/game-center") || p.startsWith("/game/"),
  },
  schools: {
    id: "schools",
    label: "SCHOOLS",
    shortName: "SCH",
    primary: "#2D3748",
    secondary: "#4A5568",
    items: SCHOOLS_ITEMS,
    match: (p) => p === "/teams" || p === "/schools" || p === "/schools/wiki" || p === "/schools/spotlight" || p.startsWith("/schools/stadiums") || p.startsWith("/rosters"),
  },
  people: {
    id: "people",
    label: "PEOPLE",
    shortName: "PPL",
    primary: "#2D3748",
    secondary: "#4A5568",
    items: PEOPLE_ITEMS,
    match: (p) => p.startsWith("/people") || p.startsWith("/players") || p.startsWith("/player/") || p.startsWith("/coaches") || p.startsWith("/officials"),
  },
  stats: {
    id: "stats",
    label: "STATS",
    shortName: "STT",
    // Violet, not the default slate — the whole Stats section reads as one
    // place, and it matches the banner gradient on every page inside it.
    primary: "#A855F7",
    secondary: "#4A1372",
    items: STATS_ITEMS,
    // Pages in here use ?tab= for their own in-page tabs. The sidebar tracks
    // the destination, not the tab, so the tab param must not steer it.
    ignoreTabParam: true,
    match: (p) => p.startsWith("/stats") || p.startsWith("/team-analytics") || p.startsWith("/player-analytics"),
  },
  schedule: {
    id: "schedule",
    label: "SCHEDULE",
    shortName: "SCH",
    primary: "#2D3748",
    secondary: "#4A5568",
    items: SCHEDULE_ITEMS,
    match: (p) => p.startsWith("/schedule"),
  },
  officials: {
    id: "officials",
    label: "OFFICIALS",
    shortName: "OFF",
    primary: "#2D3748",
    secondary: "#4A5568",
    items: OFFICIALS_ITEMS,
    match: (p) => p.startsWith("/officials"),
  },
};
