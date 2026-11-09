import { useGameCenterHubData } from "../../../hooks/useGameCenterHubData";
import { useHomeGamesCollage } from "../../../hooks/useHomeGamesCollage";
import { useQuery } from "@tanstack/react-query";
import { fetchStatsTile, fetchTeamsTile, fetchPlayersTile } from "./hero/tileQueries";
import { useMemo } from "react";
import { CollagePlate, GameOfWeekPlate, SpotlightPlate, LookAheadPlate } from "./GamesPlates";
import { HUB, gameLink, linksFor, statLink, teamLink, playerLink } from "./hero/faceLinks";
import { statFacesFor } from "../../molecules/home/StatsTileFaces";
import { teamFacesFor } from "../../molecules/home/TeamsTileFaces";
import { playerFacesFor } from "../../molecules/home/PlayersTileFaces";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { Box, Flex, Text } from "@chakra-ui/react";
import LiveTile, { TileStyles } from "../../molecules/home/LiveTile";
import HomeLoader from "./HomeLoader";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// ── Hero ─────────────────────────────────────────────────────────────────────

// Desktop tiles are landscape rectangles, width / height. Raise it for flatter tiles.
const TILE_RATIO = "16 / 10";

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
      collage.games.length ? [<CollagePlate key="collage" games={collage.games} label={collage.label} fallback={collage.fallback} />, HUB.games] : null,
      gotw ? [<GameOfWeekPlate key="gotw" game={gotw} />, gameLink(gotw, gotw.status === "final")] : null,
      spotlights[0] ? [<SpotlightPlate key={`spot-${spotlights[0].id}`} game={spotlights[0]} />, gameLink(spotlights[0], true)] : null,
      ahead ? [<LookAheadPlate key="ahead" game={ahead} />, gameLink(ahead, false)] : null,
      spotlights[1] ? [<SpotlightPlate key={`spot-${spotlights[1].id}`} game={spotlights[1]} />, gameLink(spotlights[1], true)] : null,
    ].filter(Boolean);
    return { faces: plates.map((p) => p[0]), links: plates.map((p) => p[1]) };
  }, [featuredGames, scheduleRailCards, collage.games, collage.label, collage.fallback]);

  const statFaces = useMemo(() => statFacesFor(stats.data), [stats.data]);
  const statLinks = useMemo(() => linksFor(statFaces, stats.data?.items, statLink, HUB.stats), [statFaces, stats.data]);

  const teamFaces = useMemo(() => teamFacesFor(teams.data), [teams.data]);
  const teamLinks = useMemo(() => linksFor(teamFaces, teams.data?.items, teamLink, HUB.teams), [teamFaces, teams.data]);

  const playerFaces = useMemo(() => playerFacesFor(people.data), [people.data]);
  const playerLinks = useMemo(() => linksFor(playerFaces, people.data?.items, playerLink, HUB.players), [playerFaces, people.data]);

  const { isMobile } = useLayoutDensity();
  const tiles = [
    // Each face carries its own destination (hrefs) and the bar naming it (ctas);
    // `href` / `cta` are the hub, used when a face has nothing of its own.
    { href: HUB.games.href, cta: HUB.games.cta, faces: gameFaces.faces, hrefs: gameFaces.links.map((l) => l.href), ctas: gameFaces.links.map((l) => l.cta), rotateMs: 7000, transition: "random", mountDelay: 0 },
    { href: HUB.stats.href, cta: HUB.stats.cta, faces: statFaces, hrefs: statLinks.map((l) => l.href), ctas: statLinks.map((l) => l.cta), rotateMs: 7000, transition: "push", mountDelay: 90 },
    { href: HUB.teams.href, cta: HUB.teams.cta, faces: teamFaces, hrefs: teamLinks.map((l) => l.href), ctas: teamLinks.map((l) => l.cta), rotateMs: 7000, transition: "flip", mountDelay: 180 },
    { href: HUB.players.href, cta: HUB.players.cta, faces: playerFaces, hrefs: playerLinks.map((l) => l.href), ctas: playerLinks.map((l) => l.cta), rotateMs: 8000, transition: "fade", mountDelay: 270 },
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

      <Box position="relative" zIndex={1} w="100%" maxW="1200px" mx="auto" px={6} pt={24} pb={0}>
        {/* The way in: a slim brand bar over the tiles, straight to the Game Center. */}
        <Flex
          as={Link}
          to="/game-center"
          align="center"
          justify="space-between"
          gap={6}
          mb={4}
          px={{ base: 4, md: 8 }}
          py={{ base: 3, md: 4 }}
          bg="brand.500"
          borderRadius="xl"
          transition="transform 0.2s"
          _hover={{ transform: "translateY(-2px)", textDecoration: "none" }}
        >
          <Text fontSize={{ base: "xl", md: "3xl" }} fontWeight="black" color="bg.primary" textTransform="uppercase" letterSpacing="tight" lineHeight={1}>
            Enter here
          </Text>
          <Flex align="center" gap={2} bg="bg.primary" color="white" px={6} h="2.75rem" fontWeight="bold" textTransform="uppercase" letterSpacing="wide" fontSize="sm" borderRadius="md">
            Game Center <ArrowRight size={16} strokeWidth={2.8} />
          </Flex>
        </Flex>

        {/* Four equal landscape tiles. Each cell takes its width from the grid and
            its height from TILE_RATIO; the tile fills the cell and sizes its
            contents off its own box (cqmin). */}
        <Box
          display="grid"
          gap={4}
          gridTemplateColumns="repeat(2, minmax(0, 1fr))"
        >
          {tiles.map((t) => (
            <Box key={t.href} display="grid" minW={0} style={{ aspectRatio: TILE_RATIO }}>
              <LiveTile {...t} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default HomeHero;
