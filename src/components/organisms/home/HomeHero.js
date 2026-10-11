import { useMemo } from "react";
import { Box } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useGameCenterHubData } from "../../../hooks/useGameCenterHubData";
import { FE_DOCS_BASE } from "../../../utils/gameCenterPayloads";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import HomeLoader from "./HomeLoader";
import { CollagePlate, GameOfWeekPlate, LookAheadPlate, SpotlightPlate } from "./GamesPlates";
import { useHomeGamesCollage } from "../../../hooks/useHomeGamesCollage";
import LiveTile, { TileStyles } from "../../molecules/home/LiveTile";
import { statFacesFor } from "../../molecules/home/StatsTileFaces";
import { MOCK_TILE } from "../../molecules/home/statsTileMock";
import { teamFacesFor } from "../../molecules/home/TeamsTileFaces";
import { TEAMS_MOCK_TILE } from "../../molecules/home/teamsTileMock";
import { playerFacesFor } from "../../molecules/home/PlayersTileFaces";
import { PLAYERS_MOCK_TILE } from "../../molecules/home/playersTileMock";

// ─────────────────────────────────────────────────────────────────────────────
// HOME HERO — four live tiles, one per thing this site is for:
//   Games · Stats · Teams · Players
// Each tile rotates its own faces off the same payloads its section reads.
//   Games    hub featured games (the week's scoreboard)
//   Stats    the weekly stats-tile file (backend picks the five faces)
//   Teams    the weekly teams-tile file (backend picks every face)
//   Players  the weekly players-tile file (backend picks every face)
// ─────────────────────────────────────────────────────────────────────────────

// Stats tile: the backend's weekly file (Home Stats Tile Fetch Contract).
// Until it exists, the mock stands in.
const STATS_TILE_PATH = `${FE_DOCS_BASE}/home/stats-tile/current.json`;
const fetchStatsTile = async () => {
  try {
    const res = await fetch(STATS_TILE_PATH);
    if (res.ok && (res.headers.get("content-type") ?? "").includes("json")) return await res.json();
  } catch {
    // fall through to the mock
  }
  return MOCK_TILE;
};

// Teams tile: same pattern (Home Teams Tile Fetch Contract).
const TEAMS_TILE_PATH = `${FE_DOCS_BASE}/home/teams-tile/current.json`;
const fetchTeamsTile = async () => {
  try {
    const res = await fetch(TEAMS_TILE_PATH);
    if (res.ok && (res.headers.get("content-type") ?? "").includes("json")) return await res.json();
  } catch {
    // fall through to the mock
  }
  return TEAMS_MOCK_TILE;
};

// Players tile: same pattern (Home Players Tile Fetch Contract).
const PLAYERS_TILE_PATH = `${FE_DOCS_BASE}/home/players-tile/current.json`;
const fetchPlayersTile = async () => {
  try {
    const res = await fetch(PLAYERS_TILE_PATH);
    if (res.ok && (res.headers.get("content-type") ?? "").includes("json")) return await res.json();
  } catch {
    // fall through to the mock
  }
  return PLAYERS_MOCK_TILE;
};

// ── Hero ─────────────────────────────────────────────────────────────────────

const HomeHero = () => {
  const { season, featuredGames, scheduleRailCards, isLoading } = useGameCenterHubData();
  const collage = useHomeGamesCollage(season);
  
  const stats = useQuery({ queryKey: ["home-stats-tile"], queryFn: fetchStatsTile, staleTime: Infinity, retry: false });
  const teams = useQuery({ queryKey: ["home-teams-tile"], queryFn: fetchTeamsTile, staleTime: Infinity, retry: false });
  const people = useQuery({ queryKey: ["home-players-tile"], queryFn: fetchPlayersTile, staleTime: Infinity, retry: false });

  // Games plates. The hub payload is already ranked by the backend: slot 1 is
  // the Game of the Week, the first unplayed pick is the Look Ahead, and the
  // spotlights are finals from the results rail. Order alternates so no two
  // narrative plates run back to back.
  const gameFaces = useMemo(() => {
    const [gotw, ...rest] = featuredGames ?? [];
    const ahead = [gotw, ...rest].find((g) => g && g.status !== "final" && g.id !== gotw?.id) ?? null;
    // Only games between the 18: a local team carries `conference`, an outside
    // opponent does not. Rail finals first (they carry quarter lines), then
    // any other finished game the backend ranked into the featured four.
    const covered = (g) => !!(g.home?.conference && g.away?.conference);
    const featuredFinals = (featuredGames ?? [])
      .filter((g) => g.status === "final")
      .map((g) => ({ ...g, summary: g.whyReasons?.[0] ?? g.supportingLine }));
    const seen = new Set([gotw?.id]);
    const spotlights = [...(scheduleRailCards ?? []), ...featuredFinals]
      .filter((g) => covered(g) && !seen.has(g.id) && seen.add(g.id))
      .slice(0, 2);
    const plates = [
      collage.games.length ? <CollagePlate key="collage" games={collage.games} label={collage.label} fallback={collage.fallback} /> : null,
      gotw ? <GameOfWeekPlate key="gotw" game={gotw} /> : null,
      spotlights[0] ? <SpotlightPlate key={`spot-${spotlights[0].id}`} game={spotlights[0]} /> : null,
      ahead ? <LookAheadPlate key="ahead" game={ahead} /> : null,
      spotlights[1] ? <SpotlightPlate key={`spot-${spotlights[1].id}`} game={spotlights[1]} /> : null,
    ];
    return plates.filter(Boolean);
  }, [featuredGames, scheduleRailCards, collage.games, collage.label, collage.fallback]);

  const statFaces = useMemo(() => statFacesFor(stats.data), [stats.data]);

  const teamFaces = useMemo(() => teamFacesFor(teams.data), [teams.data]);

  const playerFaces = useMemo(() => playerFacesFor(people.data), [people.data]);

  const { isMobile } = useLayoutDensity();
  const tiles = [
    { href: "/game-center", faces: gameFaces, rotateMs: 7000, transition: "random", mountDelay: 0 },
    { href: "/stats", faces: statFaces, rotateMs: 7000, transition: "push", mountDelay: 90 },
    { href: "/teams", faces: teamFaces, rotateMs: 7000, transition: "flip", mountDelay: 180 },
    { href: "/players", faces: playerFaces, rotateMs: 8000, transition: "fade", mountDelay: 270 },
  ];

  // Mobile: the same 2×2, flush — no gaps, no frame. Each tile is square and
  // its faces switch to their mobile versions through the tile variant.
  if (isMobile) {
    return (
      <Box position="relative" overflow="hidden">
        <TileStyles />
        <HomeLoader ready={!isLoading && !stats.isLoading && !teams.isLoading && !people.isLoading} />
        <Box
          position="relative"
          zIndex={1}
          mt="var(--app-header-height)"
          display="grid"
          gridTemplateColumns="repeat(2, minmax(0, 1fr))"
          gridTemplateRows="repeat(2, minmax(0, 1fr))"
          aspectRatio="1 / 1"
        >
          {tiles.map((t) => (
            <LiveTile key={t.href} {...t} variant="mobile" />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box position="relative" overflow="hidden">
      <TileStyles />
      <HomeLoader ready={!isLoading && !stats.isLoading && !teams.isLoading && !people.isLoading} />

      <Box position="relative" zIndex={1} w="100%" maxW="1200px" mx="auto" px={8} pt={24} pb={8}>
        {/* Four equal quadrants. The grid owns the size; each tile fills its
            cell and sizes its contents off its own box (cqmin). */}
        <Box
          display="grid"
          gap={4}
          gridTemplateColumns="repeat(2, minmax(0, 1fr))"
          gridTemplateRows="repeat(2, minmax(0, 1fr))"
          h="calc(100vh - 140px)"
          minH="560px"
        >
          {tiles.map((t) => (
            <LiveTile key={t.href} {...t} />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default HomeHero;
