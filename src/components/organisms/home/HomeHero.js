import { useMemo } from "react";
import { Box } from "@chakra-ui/react";
import { BarChart3, CalendarDays, School, User, Users } from "lucide-react";
import teamsData from "../../../data/teams.json";
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

// ── Where each face goes ─────────────────────────────────────────────────────
// A face about one thing opens that thing; a face about the whole league opens
// the hub. Every link is a route the site already has.
const TEAM_BY_V5 = teamsData.teams.reduce((acc, t) => {
  acc[t.exportId.replace(/25$/, "")] = t;
  return acc;
}, {});
const HUB = {
  games: { href: "/game-center", cta: { label: "Game Center", icon: CalendarDays } },
  stats: { href: "/stats", cta: { label: "Stats", icon: BarChart3 } },
  teams: { href: "/teams", cta: { label: "Schools", icon: School } },
  players: { href: "/players", cta: { label: "Players", icon: Users } },
};
const schoolLink = (v5, suffix = "", tail = "") => {
  const t = TEAM_BY_V5[v5];
  return t ? { href: `/teams/${t.id}${suffix}`, cta: { label: `${t.name}${tail}`, icon: School } } : null;
};

const gameLink = (g, final) => {
  const matchup = `${g.away?.shortName ?? "Away"} at ${g.home?.shortName ?? "Home"}`;
  const path = g.gamePathId ?? g.gameId ?? null;
  if (final && path) return { href: `/game/${path}`, cta: { label: `${matchup} · Final`, icon: CalendarDays } };
  if (!final && g.id) return { href: `/game/preview/${g.id}`, cta: { label: `${matchup} · Preview`, icon: CalendarDays } };
  return HUB.games;
};

// Stats faces: a team's number opens that team's Team Analytics profile; the
// league-wide metric opens the Leader Board.
const statLink = (item) => {
  if (item.value_kind === "league" || item.key === "metric_of_week") return { href: "/team-analytics?tab=board", cta: { label: "Team Analytics · Board", icon: BarChart3 } };
  const v5 = item.teams?.[0];
  const t = TEAM_BY_V5[v5];
  return t ? { href: `/team-analytics?tab=profile&team=${v5}`, cta: { label: `${t.shortName} · Team Profile`, icon: BarChart3 } } : HUB.stats;
};

// Schools faces: one school opens its page (the band opens its wiki); a face
// about two schools or a race opens the hub / standings.
const teamLink = (item) => {
  if (item.key === "division_race") return { href: "/game-center/standings", cta: { label: "Standings", icon: School } };
  if ((item.teams ?? []).length !== 1) return HUB.teams;
  if (item.key === "band") return schoolLink(item.teams[0], "/wiki", " · Wiki") ?? HUB.teams;
  return schoolLink(item.teams[0]) ?? HUB.teams;
};

// Players faces: one player opens their page; the collage opens the hub.
const findName = (o, id) => {
  if (!o || typeof o !== "object") return null;
  if ((o.player_id === id || o.person_id === id) && o.name) return o.name;
  for (const v of Object.values(o)) {
    const hit = findName(v, id);
    if (hit) return hit;
  }
  return null;
};
const playerLink = (item) => {
  const ids = item.players ?? [];
  if (item.key === "collage" || ids.length !== 1) return HUB.players;
  const name = findName(item.data, ids[0]);
  return { href: `/player/${ids[0]}`, cta: { label: name ?? "Player Page", icon: User } };
};

// The faces' own builders filter and order the payload items; read each face's
// item back off its key (`${item.key}` or `${item.key}-${n}`), in order.
const linksFor = (faces, items, toLink, hub) => {
  const used = {};
  return faces.map((f) => {
    const key = String(f?.key ?? "").replace(/-\d+$/, "");
    const nth = used[key] ?? 0;
    used[key] = nth + 1;
    const item = (items ?? []).filter((i) => i.key === key)[nth];
    return item ? toLink(item) ?? hub : hub;
  });
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
