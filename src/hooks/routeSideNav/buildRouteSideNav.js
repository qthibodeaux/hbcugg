// Pure URL/context-to-sidebar resolver. Navigation callbacks are created here
// but run only when a consumer invokes them; this resolver performs no effects.
import { parseUrl } from "./parseUrl";
import { HUBS, TEAM_BY_ID, SCHOOLS_ITEMS, SORTED_TEAMS, TEAM_BY_EXPORT, getTeam, LEGACY_PLAYER_TAB_MAP, PLAYER_DETAIL_ITEMS, COACHES_ITEMS } from "./routeConfig";
import { buildTeamHubTabs, buildTeamSwitchPath, injectList, resolveGameData } from "./routeHelpers";
import { TEAM_ANALYTICS_TABS, DEFAULT_TEAM_ANALYTICS_TAB, TEAM_SCOPED_TABS } from "../../pages/analytics/teamAnalyticsTabs";

export const buildRouteSideNav = ({ pathname, search, navigate, venues }) => {
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
    const onRushing = tab === "rushing";
    items = items.map((i) => (i.id === "player-analytics" && (onQbMap || onRushing) ? { ...i, active: false } : i));
    items = injectList(items, "player-analytics", [
      {
        id: "player-analytics-qb-map",
        label: "QB MAP",
        path: "/player-analytics?tab=qb-map",
        indent: true,
        active: onQbMap,
        onClick: () => navigate("/player-analytics?tab=qb-map"),
      },
      {
        id: "player-analytics-rushing",
        label: "RUSHING",
        path: "/player-analytics?tab=rushing",
        indent: true,
        active: onRushing,
        onClick: () => navigate("/player-analytics?tab=rushing"),
      },
    ]);
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
};
