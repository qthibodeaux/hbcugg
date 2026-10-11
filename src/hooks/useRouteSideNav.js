import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import teamsData from "../data/teams.json";
import { useVenues } from "./useVenues";
import { TEAM_ANALYTICS_TABS, DEFAULT_TEAM_ANALYTICS_TAB, TEAM_SCOPED_TABS } from "../pages/analytics/teamAnalyticsTabs";

// ─── Team Helpers ────────────────────────────────────────────────────────────

const TEAM_BY_ID = teamsData.teams.reduce((acc, t) => {
  acc[t.id] = t;
  acc[t.exportId] = t;
  acc[t.exportId.replace(/25$/, "")] = t;
  return acc;
}, {});

const SORTED_TEAMS = [...teamsData.teams].sort((a, b) => a.name.localeCompare(b.name));
// The analytics hub keys teams by exportId minus the season suffix
// ("swacpvamu"); the sidebar's teams.json uses the short id ("pvamu").
const TEAM_BY_EXPORT = Object.fromEntries(teamsData.teams.map((t) => [t.exportId.replace(/25$/, ""), t]));

const getTeam = (id) => TEAM_BY_ID[id] ?? null;

// ─── Hub Configs ─────────────────────────────────────────────────────────────

// Games Hub is back in the live Game Center nav. The route remains wired in
// App.js and the sidebar simply exposes it again for navigation.
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

// Coaches Hub pulled from the Schools sidebar for launch.0 — see
// AFTER_LAUNCH_0.md §1. Route stays wired in App.js, just not reachable from
// here anymore. Stadiums came back 2026-09-20 with its first real build, and was
// pulled again for launch.0 on 2026-10-04 (AFTER_LAUNCH_0.md §1).
const SCHOOLS_ITEMS = [
  { id: "school-profiles", label: "DIRECTORY", path: "/schools" },
  { id: "wiki", label: "WIKI", path: "/schools/wiki" },
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

// STATS is one section with three destinations, not three peer hubs that
// cross-link to each other. The old shape gave Stats / Team Analytics / Player
// Analytics their own sidebar identities and had each list the other two, so
// the same three links appeared under three different headers with no parent.
//
// 2026-09-20: Team Analytics' tabs ARE listed here now, as sub-items of that
// destination, with the picked team nested under Profile as a switcher block
// (the Team Hub pattern). That reverses the earlier "never re-enter a tab"
// rule for this page only: its tab set is the real content structure and
// `tab` + `team` both live in the URL, so the sidebar can render them as
// navigation without a second source of truth. Player Analytics is untouched.
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

const COACHES_ITEMS = [
  { id: "dash", label: "DASHBOARD", path: "/coaches" },
  { id: "roster", label: "STAFF DIRECTORY", path: "/coaches?tab=roster" },
  { id: "arcs", label: "CAREER ARCS", path: "/coaches?tab=arcs" },
];

const PLAYER_DETAIL_ITEMS = [
  { id: "profile", label: "BIO & BACKGROUND", path: "profile" },
  { id: "production", label: "SEASON STATS", path: "production" },
  { id: "stats", label: "ADVANCED ANALYTICS", path: "stats" },
];

const LEGACY_PLAYER_TAB_MAP = {
  dash: "stats",
  profile: "profile",
  production: "production",
};

// ─── Hub Definitions ─────────────────────────────────────────────────────────

const HUBS = {
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
    match: (p) => p === "/teams" || p === "/schools" || p === "/schools/wiki" || p.startsWith("/schools/stadiums") || p.startsWith("/rosters"),
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

// ─── URL Segment Parser ──────────────────────────────────────────────────────
// Parses /game-center/week/W15pvamujsu or /game/W15pvamujsu
// Returns { hubId, sectionId, gameId, playerId, teamId, ... }

const parseUrl = (pathname) => {
  const parts = pathname.split("/").filter(Boolean);

  // Game preview: /game/preview/:previewId(/export) — an unplayed game.
  if (parts[0] === "game" && parts[1] === "preview" && parts[2]) {
    return { hubId: "game-center", sectionId: "hub", gameId: parts[2], isPreview: true };
  }

  // Direct game access: /game/:gameId -> Anchors to 'hub' so it stays at the top info level
  if (parts[0] === "game" && parts[1]) {
    return { hubId: "game-center", sectionId: "hub", gameId: parts[1] };
  }

  // Direct player access: /player/:playerKey -> Anchors to 'players' as that is their home
  if (parts[0] === "player" && parts[1]) {
    return { hubId: "people", sectionId: "players", playerId: parts[1] };
  }

  // Lab test page: /lab/test-gamepage
  if (pathname === "/lab/test-gamepage") {
    return { hubId: "game-center", sectionId: "test-gamepage" };
  }

  // Hub-based routing: /game-center/week/W15pvamujsu
  if (parts[0] === "game-center") {
    const sectionId = parts[1] || "hub";
    const gameId = parts[2];
    return { hubId: "game-center", sectionId, gameId };
  }

  // Teams directory: /teams (no teamId)
  if (parts[0] === "teams" && !parts[1]) {
    return { hubId: "schools", sectionId: "school-profiles" };
  }

  // Team detail: /teams/:teamId/*
  if (parts[0] === "teams" && parts[1]) {
    return { hubId: "schools", teamId: parts[1], subPath: parts.slice(2), isTeamDetail: true };
  }

  // Schools directory: /schools (no teamId)
  if (parts[0] === "schools" && !parts[1]) {
    return { hubId: "schools", sectionId: "school-profiles" };
  }

  // Schools wiki: /schools/wiki
  if (parts[0] === "schools" && parts[1] === "wiki" && !parts[2]) {
    return { hubId: "schools", sectionId: "wiki" };
  }

  // Schools stadiums: /schools/stadiums, /schools/stadiums/:venueId
  if (parts[0] === "schools" && parts[1] === "stadiums") {
    return { hubId: "schools", sectionId: "stadiums", venueId: parts[2] ?? null, isStadiums: true };
  }

  // Schools wiki detail: /schools/:teamId/wiki
  if (parts[0] === "schools" && parts[1] && parts[2] === "wiki") {
    return { hubId: "schools", teamId: parts[1], subPath: ["wiki"], isTeamDetail: true };
  }

  // People hub: /people, /players, /coaches, /officials
  if (["people", "players", "coaches", "officials"].includes(parts[0])) {
    const sectionMap = { people: "hub", players: "players", coaches: "coaches", officials: "officials" };
    return { hubId: "people", sectionId: sectionMap[parts[0]] || "hub" };
  }

  // Rosters
  if (parts[0] === "rosters") {
    return { hubId: "schools", sectionId: "rosters-hub" };
  }

  // Stats section — five destinations under one hub
  if (parts[0] === "stats") {
    if (parts[1] === "team") return { hubId: "stats", sectionId: "team-stats" };
    if (parts[1] === "player") return { hubId: "stats", sectionId: "player-stats" };
    return { hubId: "stats", sectionId: "hub" };
  }
  if (parts[0] === "team-analytics") {
    return { hubId: "stats", sectionId: "team-analytics" };
  }
  if (parts[0] === "player-analytics") {
    return { hubId: "stats", sectionId: "player-analytics" };
  }

  // Schedule
  if (parts[0] === "schedule") {
    return { hubId: "schedule", sectionId: parts[1] || "hub" };
  }

  return { hubId: null };
};

// ─── Game Data Resolver ──────────────────────────────────────────────────────
// Builds game data for sidebar button from gameId

// Team codes as they appear in game stems, mapped to v5 ids.
const STEM_CODES = {
  pvamu: "swacpvamu", jsu: "swacjsu", famu: "swacfamu", bcu: "swacbcu",
  aamu: "swacaamu", asu: "swacasu", alc: "swacalc", alcorn: "swacalc", mvsu: "swacmvsu",
  su: "swacsu", tsu: "swactsu", uapb: "swacuapb", gsu: "swacgsu", gram: "swacgsu", grambling: "swacgsu",
  dsu: "meacdsu", hu: "meachu", msu: "meacmsu", morg: "meacmsu", nccu: "meacnccu",
  nsu: "meacnsu", scsu: "meacscsu",
};

const sideFor = (id) => {
  const team = getTeam(id);
  return team ? { id, shortName: team.bannerShort ?? team.shortName, logo: team.logo, color: team.colors?.primary } : null;
};

// The two teams of a game page. Stems are <away><home><yy> (an older W15
// prefix is tolerated): every split point is tried and the one where both
// halves are known team codes wins, so "pvamugsu" reads PVAMU at GSU, never
// PVAMU / SU. Preview ids carry the ids outright (date_away_at_home).
const resolveGameData = (gameId, isPreview = false) => {
  const raw = String(gameId || "");
  if (isPreview) {
    const m = /^(\d{4}-\d{2}-\d{2})_(.+?)_at_(.+)$/.exec(raw);
    if (!m) return null;
    const away = sideFor(m[2]);
    const home = sideFor(m[3]);
    return away && home ? { away, home, kind: "preview", date: m[1], key: raw } : null;
  }
  const clean = raw.toLowerCase().replace(/^w\d+/, "").replace(/\d+$/, "");
  for (let i = 1; i < clean.length; i += 1) {
    const awayId = STEM_CODES[clean.slice(0, i)];
    const homeId = STEM_CODES[clean.slice(i)];
    if (awayId && homeId) {
      const away = sideFor(awayId);
      const home = sideFor(homeId);
      if (away && home) return { away, home, kind: "game", key: raw };
    }
  }
  return null;
};

// ─── Team Detail Helpers ─────────────────────────────────────────────────────

const buildTeamHubTabs = (base, navigate, pathname) => [
  { id: "profile", label: "PROFILE", path: base, activePath: base, exact: true, indent: true, onClick: () => navigate(base) },
  { id: "schedule", label: "SCHEDULE", path: `${base}/schedule`, indent: true, onClick: () => navigate(`${base}/schedule`) },
  { id: "roster", label: "ROSTER PROFILE", path: `${base}/roster/hub`, activePath: `${base}/roster`, indent: true, onClick: () => navigate(`${base}/roster/hub`) },
  // Coaches pulled from the team sidebar for launch.0 (see AFTER_LAUNCH_0.md
  // §1) — the full roster takes its slot. Route stays wired in App.js.
  // Renamed 2026-10-03: Roster Hub → "Roster Profile", Full Roster → "Roster".
  { id: "roster-full", label: "ROSTER", path: `${base}/roster/full`, indent: true, onClick: () => navigate(`${base}/roster/full`) },
  { id: "wiki", label: "SCHOOL WIKI", path: `${base}/wiki`, activePath: pathname && pathname.includes("/wiki") ? pathname : `${base}/wiki`, indent: true, onClick: () => navigate(`${base}/wiki`) },
  // School Stats pulled for launch.0 (2026-10-04) — AFTER_LAUNCH_0.md §1.
  // Route stays wired in App.js.
];

const injectList = (baseList, indexId, injection) => {
  const index = baseList.findIndex(item => item.id === indexId);
  if (index === -1) return [...baseList, ...injection];
  const newList = [...baseList];
  newList.splice(index + 1, 0, ...injection);
  return newList;
};

const buildTeamSwitchPath = (pathname, currentTeamId, nextTeamId) => {
  if (pathname.includes("/wiki") && pathname.startsWith("/schools/")) {
    return `/schools/${nextTeamId}/wiki`;
  }
  const prefix = `/teams/${currentTeamId}`;
  if (!pathname.startsWith(prefix)) return `/teams/${nextTeamId}`;
  const suffix = pathname.slice(prefix.length);
  return `/teams/${nextTeamId}${suffix || ""}`;
};

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const useRouteSideNav = (navigate) => {
  const { pathname, search } = useLocation();
  // Only the Stadiums section reads this; the query is cached forever so
  // every other route pays nothing beyond the first fetch.
  const venues = useVenues();

  return useMemo(() => {
    const searchParams = new URLSearchParams(search);
    const tab = searchParams.get("tab");

    // Home — no sidebar
    if (pathname === "/") {
      return { stack: [], items: [] };
    }

    const parsed = parseUrl(pathname);
    
    // Override sectionId from query param — except in hubs whose pages own
    // their own ?tab= strip (see `ignoreTabParam`), where the sidebar tracks
    // the destination and the tab is the page's business.
    const hubIgnoresTab = Object.values(HUBS).some((h) => h.id === parsed.hubId && h.ignoreTabParam);
    const activeSectionId = (hubIgnoresTab ? null : tab) || parsed.sectionId;

    // ── Team Detail Pages ────────────────────────────────────────────────────
    if (parsed.teamId && parsed.isTeamDetail) {
      const team = TEAM_BY_ID[parsed.teamId];
      if (!team) return { stack: [], items: [] };

      const base = `/teams/${parsed.teamId}`;
      const stack = [{
        id: "team",
        label: team.name,
        shortName: team.shortName,
        logo: team.logo,
        primary: team.colors?.primary,
        secondary: team.colors?.secondary,
        conference: team.conference,
        division: team.division,
        onClick: () => navigate(base),
      }];

      const items = [
        ...SCHOOLS_ITEMS.map((item) => ({
          ...item,
          onClick: () => navigate(item.path),
          active: pathname === item.path || (item.id === "school-profiles" && (pathname === "/schools" || pathname === "/teams")),
        })),
        {
          id: "team-hub-switcher",
          type: "teamHubSwitcher",
          label: `${team.shortName} HUB`,
          teamId: parsed.teamId,
          accent: team.colors?.primary,
          teams: SORTED_TEAMS,
          tabs: buildTeamHubTabs(base, navigate, pathname),
          onClick: () => navigate(base),
          onTeamClick: (nextId) => navigate(buildTeamSwitchPath(pathname, parsed.teamId, nextId)),
        },
      ];

      return { stack, items };
    }

    // ── Hub Pages ────────────────────────────────────────────────────────────
    const hub = Object.values(HUBS).find((h) => h.id === parsed.hubId);
    if (!hub) return { stack: [], items: [] };

    const sectionId = activeSectionId || hub.items[0].id;
    const isGamePage = !!parsed.gameId;
    const isPlayerPage = !!parsed.playerId;

    // Build breadcrumb from section
    const sectionItem = hub.items.find((i) => i.id === sectionId);
    const breadcrumb = sectionItem?.label || sectionId?.toUpperCase() || "";

    // 1. Map Base Items
    let items = hub.items.map((item) => {
      const isActive = item.id === sectionId;
      return {
        ...item,
        onClick: () => {
          if (item.id === "players" && !pathname.includes("/players")) {
            navigate("/players");
          } else {
            navigate(item.path);
          }
        },
        active: isActive && !isGamePage && !isPlayerPage,
      };
    });

    // 2. Perform Injections
    
    // Venue switcher (Stadiums) — the team-hub switcher pattern, catered to
    // venues: a color-bar header for the selected stadium (or the section
    // itself when none is picked) that toggles to a grid of every venue.
    if (parsed.isStadiums) {
      const venue = parsed.venueId ? venues.byId[parsed.venueId] ?? null : null;
      const venueInjection = [{
        id: "venue-hub-switcher",
        type: "venueHubSwitcher",
        venueId: parsed.venueId ?? null,
        label: venue ? venue.name : "ALL STADIUMS",
        meta: venue ? [venue.location, venue.isNeutral ? "Neutral site" : venue.team?.shortName].filter(Boolean).join(" • ") : `${venues.stats.campusCount} campus • ${venues.stats.neutralCount} neutral`,
        logo: venue?.logo ?? null,
        accent: venue?.accent ?? null,
        campus: venues.campus,
        neutral: venues.neutral,
        onClick: () => navigate("/schools/stadiums"),
        onVenueClick: (nextId) => navigate(nextId ? `/schools/stadiums/${nextId}` : "/schools/stadiums"),
      }];
      items = injectList(items, "stadiums", venueInjection);
    }

    // Team Analytics: the tab set as sub-items, and — on a team-scoped tab
    // with a team in the URL — that team nested under the tab as a switcher.
    if (pathname.startsWith("/team-analytics")) {
      const activeTab = TEAM_ANALYTICS_TABS.some((t) => t.id === tab) ? tab : DEFAULT_TEAM_ANALYTICS_TAB;
      const teamParam = searchParams.get("team");
      // A team in the URL rides along to the team-scoped tabs even when the
      // current tab ignores it, so Board -> Profile keeps the pick.
      const carry = teamParam && TEAM_BY_EXPORT[teamParam] ? teamParam : null;
      const scopedTeam = TEAM_SCOPED_TABS.has(activeTab) && carry ? TEAM_BY_EXPORT[carry] : null;
      const hrefFor = (tabId, teamId) => `/team-analytics?tab=${tabId}${teamId ? `&team=${teamId}` : ""}`;

      const tabItems = TEAM_ANALYTICS_TABS.map((t) => ({
        id: `team-analytics-${t.id}`,
        label: t.label.toUpperCase(),
        path: hrefFor(t.id, TEAM_SCOPED_TABS.has(t.id) ? carry : null),
        indent: true,
        active: t.id === activeTab,
        onClick: () => navigate(hrefFor(t.id, TEAM_SCOPED_TABS.has(t.id) ? carry : null)),
      }));
      items = injectList(items, "team-analytics", tabItems);

      if (scopedTeam) {
        const analyticsId = scopedTeam.exportId.replace(/25$/, "");
        items = injectList(items, `team-analytics-${activeTab}`, [{
          id: "team-analytics-team-switcher",
          type: "teamHubSwitcher",
          team: {
            id: "team",
            label: scopedTeam.name,
            shortName: scopedTeam.shortName,
            logo: scopedTeam.logo,
            primary: scopedTeam.colors?.primary,
            secondary: scopedTeam.colors?.secondary,
            conference: scopedTeam.conference,
            division: scopedTeam.division,
          },
          teamId: scopedTeam.id,
          accent: scopedTeam.colors?.primary,
          teams: SORTED_TEAMS,
          tabs: [{ id: "team-analytics-all-teams", label: "ALL TEAMS", indent: true, active: false, onClick: () => navigate(hrefFor(activeTab, null)) }],
          onClick: () => navigate(hrefFor(activeTab, analyticsId)),
          onTeamClick: (nextId) => {
            const next = getTeam(nextId);
            navigate(hrefFor(activeTab, next ? next.exportId.replace(/25$/, "") : null));
          },
        }]);
      }
    }

    // Player Analytics: its in-page tabs that deserve a sidebar entry, as
    // sub-items. The page owns ?tab=; this just mirrors it.
    if (pathname.startsWith("/player-analytics")) {
      const onQbMap = tab === "qb-map";
      items = items.map((i) => (i.id === "player-analytics" && onQbMap ? { ...i, active: false } : i));
      items = injectList(items, "player-analytics", [{
        id: "player-analytics-qb-map",
        label: "QB MAP",
        path: "/player-analytics?tab=qb-map",
        indent: true,
        active: onQbMap,
        onClick: () => navigate("/player-analytics?tab=qb-map"),
      }]);
    }

    // Game Injection (for Game Center)
    if (isGamePage) {
      const gameData = resolveGameData(parsed.gameId, parsed.isPreview);
      const gameInjection = [{
        id: `game-${parsed.gameId}`,
        label: gameData ? `${gameData.away.shortName} vs ${gameData.home.shortName}` : (parsed.gameId?.toUpperCase() || "GAME DETAIL"),
        path: pathname,
        indent: true,
        active: true,
        onClick: () => navigate(pathname),
        type: "game",
        gameData,
      }];
      items = injectList(items, sectionId, gameInjection);
    }

    // Player Injection (for People Hub)
    if (isPlayerPage || pathname.startsWith("/player/")) {
      const playerMatch = pathname.match(/^\/player\/([^/]+)/);
      const playerKey = playerMatch?.[1] || parsed.playerId;
      
      const playerInjection = [{
        id: `player-${playerKey}`,
        label: "PLAYER PROFILE", 
        path: pathname,
        indent: true,
        active: true,
        onClick: () => navigate(pathname),
      }];
      items = injectList(items, "players", playerInjection);

      // Handle player detail sub-items
      if (pathname.startsWith("/player/")) {
        const tabParam = searchParams.get("tab");
        const sectionParam = searchParams.get("section");
        const activePlayerTab = tabParam || LEGACY_PLAYER_TAB_MAP[sectionParam] || "profile";
        const subItems = PLAYER_DETAIL_ITEMS.map((si) => ({
          ...si,
          indent: true,
          path: `/player/${playerKey}?tab=${si.id}`,
          active: activePlayerTab === si.id,
          onClick: () => navigate(`/player/${playerKey}?tab=${si.id}`),
        }));
        // Inject under the "PLAYER PROFILE" button
        items = injectList(items, `player-${playerKey}`, subItems);
      }
    }

    // Hub-specific sub-items (Coaches directory, etc.)
    if (hub.id === "people" && pathname.startsWith("/coaches")) {
      const coachingSubItems = COACHES_ITEMS.map(si => ({
        ...si,
        indent: true,
        active: activeSectionId === si.id,
        onClick: () => navigate(si.path)
      }));
      items = injectList(items, "coaches", coachingSubItems);
    }

    const stack = [{
      id: hub.id,
      label: hub.label,
      shortName: hub.shortName,
      logo: null,
      primary: hub.primary,
      secondary: hub.secondary,
      conference: null,
      division: null,
      onClick: () => navigate(hub.items[0].path),
      breadcrumb,
    }];

    return { stack, items };
  }, [pathname, search, navigate, venues]);
};

export default useRouteSideNav;
