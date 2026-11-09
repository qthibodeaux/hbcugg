

export const parseUrl = (pathname) => {
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

  // Team Spotlight: /schools/spotlight
  if (parts[0] === "schools" && parts[1] === "spotlight" && !parts[2]) {
    return { hubId: "schools", sectionId: "spotlight" };
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
    if (parts[1] === "deep-dive") return { hubId: "stats", sectionId: "deep-dive" };
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
