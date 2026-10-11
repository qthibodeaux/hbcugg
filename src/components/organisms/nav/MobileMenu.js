import { useMemo } from "react";
import { Box, Flex, IconButton, Image, Text } from "@chakra-ui/react";
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerContent,
  DrawerPositioner,
  DrawerRoot,
  Portal,
} from "@chakra-ui/react";
import { Facebook, Instagram, Twitter, X, Youtube } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import teamsData from "../../../data/teams.json";
import LiveTile, { TileStyles, lastName } from "../../molecules/home/LiveTile";
import { useGameCenterHubData } from "../../../hooks/useGameCenterHubData";
import { useFootballCurrentContext } from "../../../hooks/useFootballCurrentContext";
import { useRouteSideNav } from "../../../hooks/useRouteSideNav";
import { useVenues } from "../../../hooks/useVenues";
import { fetchTeamSchedule } from "../../../hooks/useTeamScheduleData";
import { buildHeader } from "../../game/export/exportData";
import { parsePreviewId, shortDate } from "../../../utils/gamePreview";
import { GLOSSARY } from "../../../pages/analytics/metricGlossary";
import { MOCK_TILE } from "../../molecules/home/statsTileMock";
import { TEAMS_MOCK_TILE } from "../../molecules/home/teamsTileMock";
import { PLAYERS_MOCK_TILE } from "../../molecules/home/playersTileMock";

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE MENU — the full-screen nav layer on phones.
//
//   HBCUGG (home) · close
//   SECTIONS — Game Center / Schools / Analytics. Each band is one live tile
//     whose faces fill the whole plate: the featured school's solid color (a
//     hard diagonal split for a matchup) with its logo or photo oversized and
//     bleeding off the right edge. The number, name, arrow and "you are here"
//     marker overlay the plate.
//   TEAMS — the 18, 6 across, flush
//   Wordmark sign-off · social icons
//
// Sub-navigation stays in each page's banner controls; this layer is the
// front door. The band markers are visual only. No gradients.
// ─────────────────────────────────────────────────────────────────────────────

const Z_BACKDROP = 1400;
const Z_CONTENT = 1401;
const BRAND = "#A855F7";
// Face information (labels, numbers, names on the plate) prints in the
// secondary gray so it never competes with the white section names.
const INFO = "#A1A1AA";
const TEAMS = [...teamsData.teams].sort((a, b) => a.name.localeCompare(b.name));
const v5 = (t) => String(t.exportId).replace(/25$/, "");
const TEAM_BY_V5 = Object.fromEntries(teamsData.teams.map((t) => [v5(t), t]));
const itemOf = (payload, key) => payload?.items?.find((i) => i.key === key) ?? null;
const abbr = (t) => t?.bannerShort ?? t?.shortName ?? "";
const colorOf = (t) => t?.colors?.primary ?? "#27272A";

// ── Plate atoms (cqmin = the band's height) ─────────────────────────────────

// The plate fills the tile edge to edge, under the tile's own padding.
const Plate = ({ bg = "#141416", children }) => (
  <Box position="absolute" inset="calc(-1 * var(--hl-pad, 3cqmin))" bg={bg} overflow="hidden">
    {children}
  </Box>
);

// An oversized mark cropped by the right edge.
const Bleed = ({ src, size = 150, right = -18, opacity = 1 }) =>
  src ? (
    <Image src={src} alt="" position="absolute" right={`${right}cqmin`} top="50%" transform="translateY(-50%)" h={`${size}cqmin`} w={`${size}cqmin`} objectFit="contain" opacity={opacity} pointerEvents="none" />
  ) : null;

// Sits on its own solid strip so a bleeding logo never runs under it.
const Kicker = ({ children }) => (
  <Text position="absolute" top="5cqmin" right="5cqmin" bg="rgba(0,0,0,0.72)" px="3cqmin" py="2cqmin" fontSize="11cqmin" fontWeight="black" color={INFO} textTransform="uppercase" letterSpacing="0.12em" lineHeight={1} lineClamp={1} maxW="60%">
    {children}
  </Text>
);

const Big = ({ children, size = 44, top, right = "5cqmin", bottom, color = INFO }) => (
  <Text position="absolute" top={top} right={right} bottom={bottom} fontSize={`${size}cqmin`} fontWeight="black" fontStyle="italic" color={color} lineHeight={0.88} letterSpacing="-0.04em" textShadow="0 2px 14px rgba(0,0,0,0.55)" fontVariantNumeric="tabular-nums" whiteSpace="nowrap">
    {children}
  </Text>
);

// Face shell: the plate, then anything absolutely placed on it.
const Face = ({ bg, children }) => (
  <Box position="relative" h="100%">
    <Plate bg={bg}>{children}</Plate>
  </Box>
);

// Team face: solid school color, the logo bleeding off the right.
const TeamFace = ({ team, kicker, children, logoOpacity = 1 }) => (
  <Face bg={colorOf(team)}>
    <Bleed src={team?.logo} opacity={logoOpacity} />
    <Kicker>{kicker}</Kicker>
    {children}
  </Face>
);

// Matchup face: a hard diagonal split between the two schools' colors.
const MatchupFace = ({ game, kicker }) => {
  const decided = game.status === "final";
  const away = game.away ?? {};
  const home = game.home ?? {};
  return (
    <Face bg={home.primary ?? "#27272A"}>
      <Box position="absolute" inset={0} bg={away.primary ?? "#3F3F46"} style={{ clipPath: "polygon(0 0, 62% 0, 46% 100%, 0 100%)" }} />
      {away.logo ? <Image src={away.logo} alt="" position="absolute" left="30%" top="50%" transform="translate(-50%, -50%)" h="110cqmin" w="110cqmin" objectFit="contain" opacity={0.9} /> : null}
      {home.logo ? <Image src={home.logo} alt="" position="absolute" right="-14cqmin" top="50%" transform="translateY(-50%)" h="130cqmin" w="130cqmin" objectFit="contain" /> : null}
      <Kicker>{kicker}</Kicker>
      {decided ? (
        <Big size={40} bottom="8cqmin">{game.awayScore}–{game.homeScore}</Big>
      ) : (
        <Big size={30} bottom="10cqmin">{away.label ?? away.shortName} · {home.label ?? home.shortName}</Big>
      )}
    </Face>
  );
};

// ── Band faces ───────────────────────────────────────────────────────────────

// The first face of every band: what this section of the site holds.
const IdentityFace = ({ words }) => (
  <Face bg="#141416">
    <Flex position="absolute" top="6cqmin" right="5cqmin" direction="column" align="flex-end">
      {words.map((w) => (
        <Text key={w} fontSize="20cqmin" fontWeight="black" fontStyle="italic" color={INFO} textTransform="uppercase" lineHeight={0.92} letterSpacing="-0.02em">{w}</Text>
      ))}
    </Flex>
  </Face>
);

const useGameCenterFaces = () => {
  const { featuredGames, scheduleRailCards, standings, contextCards } = useGameCenterHubData();
  const { currentWeek } = useFootballCurrentContext();
  return useMemo(() => {
    const faces = [<IdentityFace key="id" words={["Scores", "Schedules", "Standings"]} />];
    if (currentWeek != null) {
      faces.push(
        <Face key="week" bg="#2A1745">
          <Text position="absolute" right="-6cqmin" top="50%" transform="translateY(-50%)" fontSize="150cqmin" fontWeight="black" fontStyle="italic" lineHeight={0.8} color={BRAND} letterSpacing="-0.06em">
            {currentWeek}
          </Text>
          <Kicker>This week</Kicker>
        </Face>,
      );
    }
    const [gotw, ...rest] = featuredGames ?? [];
    if (gotw) faces.push(<MatchupFace key="gotw" game={gotw} kicker="Game of the week" />);
    const next = (featuredGames ?? []).find((g) => g.status !== "final" && g.id !== gotw?.id) ?? rest[0];
    if (next) faces.push(<MatchupFace key="next" game={next} kicker={`Next up${next.dateLabel ? ` · ${next.dateLabel}` : ""}`} />);
    const last = (scheduleRailCards ?? []).find((g) => g.status === "final");
    if (last) faces.push(<MatchupFace key="last" game={last} kicker="Last final" />);
    const leaders = standings?.swacEast?.rows?.slice(0, 3) ?? [];
    if (leaders[0]?.team) {
      faces.push(
        <TeamFace key="standings" team={leaders[0].team} kicker="SWAC East">
          <Flex position="absolute" top="26cqmin" right="5cqmin" gap="4cqmin" align="flex-end">
            {leaders.map((r) => (
              <Flex key={r.teamId} direction="column" align="center" gap="1cqmin" bg="rgba(0,0,0,0.35)" px="2cqmin" py="1.5cqmin">
                <Image src={r.team?.logo} alt="" w="20cqmin" h="20cqmin" objectFit="contain" />
                <Text fontSize="11cqmin" fontWeight="black" color={INFO}>{r.confRecord ?? "0-0"}</Text>
              </Flex>
            ))}
          </Flex>
        </TeamFace>,
      );
    }
    const card = contextCards?.[0];
    if (card?.title) {
      faces.push(
        <TeamFace key="context" team={card.team} kicker={card.teamLabel ?? "Game Center"} logoOpacity={0.55}>
          <Text position="absolute" bottom="8cqmin" right="5cqmin" maxW="60%" textAlign="right" fontSize="14cqmin" fontWeight="black" fontStyle="italic" color={INFO} textTransform="uppercase" lineHeight={0.95} lineClamp={2} textShadow="0 2px 12px rgba(0,0,0,0.6)">
            {card.title}
          </Text>
        </TeamFace>,
      );
    }
    return faces;
  }, [featuredGames, scheduleRailCards, standings, contextCards, currentWeek]);
};

const useSchoolsFaces = () => {
  const { standings } = useGameCenterHubData();
  return useMemo(() => {
    const faces = [<IdentityFace key="id" words={["Teams", "Wiki", "Rosters"]} />];
    const leader = standings?.meac?.rows?.[0];
    if (leader?.team) {
      faces.push(
        <TeamFace key="leader" team={leader.team} kicker="MEAC leader">
          <Big size={44} bottom="8cqmin" right="42%">{leader.confRecord ?? "0-0"}</Big>
        </TeamFace>,
      );
    }
    // A wiki fun fact from a school picked once per menu mount.
    const withFacts = TEAMS.filter((t) => t.wiki?.history?.funFacts?.length);
    const factTeam = withFacts[Math.floor(Math.random() * withFacts.length)];
    if (factTeam) {
      faces.push(
        <TeamFace key="fact" team={factTeam} kicker={abbr(factTeam)} logoOpacity={0.35}>
          <Text position="absolute" top="24cqmin" right="5cqmin" maxW="66%" textAlign="right" fontSize="11cqmin" fontWeight="black" color={INFO} lineHeight={1.15} lineClamp={4} textShadow="0 1px 8px rgba(0,0,0,0.7)">
            {factTeam.wiki.history.funFacts[0]}
          </Text>
        </TeamFace>,
      );
    }
    const dna = itemOf(TEAMS_MOCK_TILE, "roster_dna");
    if (dna) {
      const t = TEAM_BY_V5[dna.data.team_id];
      faces.push(
        <TeamFace key="roster" team={t} kicker={`${abbr(t)} transfers`}>
          <Big size={52} bottom="6cqmin" right="40%">{Math.round(dna.data.transfer_rate * 100)}%</Big>
        </TeamFace>,
      );
    }
    const top = itemOf(PLAYERS_MOCK_TILE, "collage")?.data?.players?.[0];
    if (top) {
      const t = TEAM_BY_V5[top.team_id];
      faces.push(
        <Face key="player" bg={colorOf(t)}>
          {top.image_url ? (
            <Image src={top.image_url} alt="" position="absolute" right={0} top={0} h="100%" w="48%" objectFit="cover" objectPosition="top" />
          ) : (
            <Bleed src={t?.logo} />
          )}
          <Kicker>{`${top.position ?? ""} · ${abbr(t)}`}</Kicker>
          <Big size={30} bottom="8cqmin" right="50%">{lastName(top.name).toUpperCase()}</Big>
        </Face>,
      );
    }
    const coach = itemOf(TEAMS_MOCK_TILE, "head_coach");
    if (coach) {
      const t = TEAM_BY_V5[coach.data.team_id];
      faces.push(
        <TeamFace key="coach" team={t} kicker={`Head coach · ${abbr(t)}`}>
          <Big size={34} bottom="8cqmin" right="40%">{lastName(coach.data.coach_name).toUpperCase()}</Big>
        </TeamFace>,
      );
    }
    return faces;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [standings]);
};

// One face per Team Analytics tab, each a CTA into that tab.
const ANALYTICS_TABS = [
  { id: "week", label: "Week Review", key: "biggest_mover" },
  { id: "profile", label: "Team Profile", key: "one_of_a_kind" },
  { id: "board", label: "Leader Board", key: "metric_of_week" },
  { id: "map", label: "Scatter", key: "league_map" },
  { id: "matchup", label: "Matchup", key: "statistical_twins" },
  { id: "lab", label: "Rating Lab", key: "adjusted_leader" },
  { id: "trends", label: "Trends", key: "parity_meter" },
  { id: "glossary", label: "Glossary", key: null },
];

const useAnalyticsFaces = () =>
  useMemo(() => {
    const core = GLOSSARY.filter((g) => g.tier === "core");
    const term = core[Math.floor(Math.random() * core.length)];
    const tabs = ANALYTICS_TABS.map((tab) => {
      const item = tab.key ? itemOf(MOCK_TILE, tab.key) : null;
      const team = item?.teams?.[0] ? TEAM_BY_V5[item.teams[0]] : null;
      const second = item?.teams?.[1] ? TEAM_BY_V5[item.teams[1]] : null;
      let node;
      if (tab.id === "glossary" || !item) {
        node = (
          <Face key={tab.id} bg="#1E1433">
            <Text position="absolute" right="-4cqmin" top="50%" transform="translateY(-50%)" fontSize="120cqmin" fontWeight="black" fontStyle="italic" lineHeight={0.8} color="rgba(168,85,247,0.35)">?</Text>
            <Kicker>{tab.label}</Kicker>
            <Big size={22} bottom="10cqmin" right="5cqmin">{String(term?.term ?? "").toUpperCase()}</Big>
          </Face>
        );
      } else if (second) {
        node = (
          <Face key={tab.id} bg={colorOf(second)}>
            <Box position="absolute" inset={0} bg={colorOf(team)} style={{ clipPath: "polygon(0 0, 62% 0, 46% 100%, 0 100%)" }} />
            <Image src={team.logo} alt="" position="absolute" left="30%" top="50%" transform="translate(-50%, -50%)" h="110cqmin" w="110cqmin" objectFit="contain" opacity={0.9} />
            <Bleed src={second.logo} size={130} right={-14} />
            <Kicker>{tab.label}</Kicker>
          </Face>
        );
      } else if (team) {
        node = (
          <TeamFace key={tab.id} team={team} kicker={tab.label}>
            {item.primary?.display ? <Big size={44} bottom="8cqmin" right="40%">{item.primary.display}</Big> : null}
          </TeamFace>
        );
      } else {
        node = (
          <Face key={tab.id} bg="#1E1433">
            <Kicker>{tab.label}</Kicker>
            {item.primary?.display ? <Big size={60} bottom="6cqmin">{item.primary.display}</Big> : null}
          </Face>
        );
      }
      return { href: `/team-analytics?tab=${tab.id}`, node };
    });
    return [{ href: "/stats", node: <IdentityFace key="id" words={["Stats", "Ratings", "Glossary"]} /> }, ...tabs];
  }, []);

// ── Bands ────────────────────────────────────────────────────────────────────

// The band you are in carries a breadcrumb under its name, and a panel
// attaches beneath it with more context: what you are looking at, and the
// section's pages with yours lit. Visual only — not navigation.
const Band = ({ title, href, faces, hrefs, crumb, here, onNavigate, rotateMs }) => (
  <Box position="relative">
    {crumb ? <Box position="absolute" left={0} top={0} bottom={0} w="5px" bg={BRAND} zIndex={3} pointerEvents="none" /> : null}
    <Box position="relative" h="clamp(5.8rem, 12.6vh, 7.2rem)" display="grid" gridTemplateColumns="minmax(0, 1fr)" gridTemplateRows="minmax(0, 1fr)">
      <LiveTile href={href} hrefs={hrefs} faces={faces} rotateMs={rotateMs} transition="random" variant="mobile" accent={BRAND} onClick={onNavigate} />
      <Flex position="absolute" left={4} bottom={3} right="30%" direction="column" align="flex-start" gap={1} pointerEvents="none" zIndex={2}>
        <Text fontSize="clamp(1.6rem, 8vw, 2.2rem)" fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={0.9} letterSpacing="-0.03em" textShadow="0 2px 14px rgba(0,0,0,0.85)">
          {title}
        </Text>
        {crumb ? (
          <Text fontSize="clamp(1rem, 5vw, 1.35rem)" fontWeight="black" fontStyle="italic" color={BRAND} textTransform="uppercase" lineHeight={0.95} letterSpacing="-0.02em" textShadow="0 2px 10px rgba(0,0,0,0.9)" lineClamp={1}>
            {crumb}
          </Text>
        ) : null}
      </Flex>
    </Box>
    {here}
  </Box>
);

// ── Page snapshot ────────────────────────────────────────────────────────────
// The panel under the current band: one snapshot of the page you are on —
// identity on the left, the key number big on the right. Visual only.

const Snapshot = ({ logos = [], label, line, big, bigColor = "white" }) => (
  <Flex bg="#1A1A1D" px={4} py={3} align="center" gap={3} minH="4.2rem">
    {logos.filter(Boolean).length ? (
      <Flex gap={1.5} flexShrink={0}>
        {logos.filter(Boolean).map((src, i) => <Image key={`${src}-${i}`} src={src} alt="" w="2.4rem" h="2.4rem" objectFit="contain" />)}
      </Flex>
    ) : null}
    <Box flex={1} minW={0}>
      {label ? <Text fontSize="1.1rem" fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={1} letterSpacing="-0.01em" lineClamp={1}>{label}</Text> : null}
      {line ? <Text fontSize="0.78rem" fontWeight="black" color={INFO} textTransform="uppercase" letterSpacing="0.08em" mt={1} lineClamp={1}>{line}</Text> : null}
    </Box>
    {big != null && big !== "" ? (
      <Text fontSize="2.2rem" fontWeight="black" fontStyle="italic" color={bigColor} lineHeight={0.9} letterSpacing="-0.04em" flexShrink={0} fontVariantNumeric="tabular-nums">{big}</Text>
    ) : null}
  </Flex>
);

const matchupLabel = (g) => `${g?.away?.label ?? g?.away?.shortName ?? ""} · ${g?.home?.label ?? g?.home?.shortName ?? ""}`;

// Works out what the page you are on is, and builds its snapshot from feeds
// the app already loads (cached queries are read, not re-fetched).
const usePageSnapshot = ({ pathname, isOpen, team }) => {
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const hub = useGameCenterHubData();
  const venues = useVenues();
  const { currentSeason, currentWeek } = useFootballCurrentContext();

  const teamV5 = team ? v5(teamsData.teams.find((t) => t.logo === team.logo) ?? {}) : null;
  const { data: schedule } = useQuery({
    queryKey: ["team-schedule", currentSeason, teamV5],
    queryFn: () => fetchTeamSchedule({ queryClient, season: currentSeason, teamId: teamV5 }),
    staleTime: Infinity,
    enabled: !!(isOpen && teamV5 && currentSeason),
  });

  const parts = pathname.split("/").filter(Boolean);
  const gotw = hub.featuredGames?.[0];
  const nextGame = (hub.featuredGames ?? []).find((g) => g.status !== "final") ?? null;

  // Game pages
  if (parts[0] === "game" && parts[1] === "preview" && parts[2]) {
    const ids = parsePreviewId(parts[2]);
    if (ids) {
      const a = TEAM_BY_V5[ids.awayId];
      const h = TEAM_BY_V5[ids.homeId];
      return <Snapshot logos={[a?.logo, h?.logo]} label={`${abbr(a)} at ${abbr(h)}`} line={`Preview · ${shortDate(ids.date)}`} big="VS" bigColor={INFO} />;
    }
  }
  if (parts[0] === "game" && parts[1]) {
    const game = queryClient.getQueryData(["game", parts[1]]);
    if (game) {
      const hd = buildHeader(game);
      const a = TEAM_BY_V5[hd.awayId];
      const h = TEAM_BY_V5[hd.homeId];
      const scored = hd.away.score != null && hd.home.score != null;
      return (
        <Snapshot
          logos={[a?.logo, h?.logo]}
          label={`${abbr(a)} at ${abbr(h)}`}
          line={[String(hd.status ?? "").toUpperCase(), hd.date ? shortDate(hd.date) : null, hd.site].filter(Boolean).join(" · ")}
          big={scored ? `${hd.away.score}–${hd.home.score}` : null}
        />
      );
    }
    return null;
  }

  // Team pages
  if (team) {
    const meta = teamsData.teams.find((t) => t.logo === team.logo);
    const rec = schedule?.team ?? null;
    const games = schedule?.games ?? [];
    const next = games.find((g) => g.status !== "final");
    const last = [...games].reverse().find((g) => g.status === "final");
    const vs = (g) => `${g.home_away === "away" ? "at" : "vs"} ${g.opponent_short ?? g.opponent_name ?? ""}`;
    const line = next ? `Next · ${vs(next)} · ${next.date_label ?? ""}` : last ? `Last · ${last.display_score ?? ""} ${vs(last)}` : meta?.mascot;
    return <Snapshot logos={[team.logo]} label={meta?.fullName ?? team.label} line={line} big={rec?.record ?? null} />;
  }

  // Game Center sections
  if (parts[0] === "game-center") {
    const page = parts[1] ?? "";
    if (page === "standings") {
      const leaders = ["swacEast", "swacWest", "meac"].map((k) => hub.standings?.[k]?.rows?.[0]).filter(Boolean);
      return <Snapshot logos={leaders.map((r) => r.team?.logo)} label="Division leaders" line={leaders.map((r) => `${r.shortName} ${r.confRecord ?? "0-0"}`).join(" · ")} />;
    }
    if (page === "seasonschedule" || page === "team") {
      return nextGame ? <Snapshot logos={[nextGame.away?.logo, nextGame.home?.logo]} label={matchupLabel(nextGame)} line={`Next up · ${nextGame.dateLabel ?? ""}`} big={nextGame.dateLabel ?? null} bigColor={INFO} /> : null;
    }
    if (page === "classics-homecoming") {
      const ev = (hub.featuredGames ?? []).find((g) => g.status !== "final" && (g.eventName || g.event?.name)) ?? nextGame;
      return ev ? <Snapshot logos={[ev.away?.logo, ev.home?.logo]} label={ev.eventName ?? ev.event?.name ?? matchupLabel(ev)} line={`${matchupLabel(ev)} · ${ev.dateLabel ?? ""}`} /> : null;
    }
    // hub, games, week central, slates
    return (
      <Snapshot
        logos={gotw ? [gotw.away?.logo, gotw.home?.logo] : []}
        label={gotw ? matchupLabel(gotw) : "This week"}
        line={gotw ? "Game of the week" : null}
        big={currentWeek != null ? `WK ${currentWeek}` : null}
        bigColor={BRAND}
      />
    );
  }

  // Schools sections
  if (parts[0] === "schools" && parts[1] === "stadiums") {
    const v = (parts[2] && venues.byId?.[parts[2]]) || venues.stats?.largest;
    return v ? <Snapshot logos={[v.logo]} label={v.name} line={[v.location, v.isNeutral ? "Neutral site" : abbr(v.team)].filter(Boolean).join(" · ")} big={v.capacity ? Number(v.capacity).toLocaleString() : null} /> : null;
  }
  if (parts[0] === "rosters") {
    const dna = itemOf(TEAMS_MOCK_TILE, "roster_dna");
    const t = dna ? TEAM_BY_V5[dna.data.team_id] : null;
    return dna ? <Snapshot logos={[t?.logo]} label={`${abbr(t)} roster`} line={`${dna.data.total_players} players`} big={`${Math.round(dna.data.transfer_rate * 100)}%`} /> : null;
  }
  if (parts[0] === "schools" || parts[0] === "teams") {
    const swac = teamsData.teams.filter((t) => t.conference === "SWAC").length;
    return <Snapshot label="18 programs" line={`SWAC ${swac} · MEAC ${teamsData.teams.length - swac}`} big="18" />;
  }

  // Stats and analytics
  if (parts[0] === "team-analytics") {
    const tab = ANALYTICS_TABS.find((t) => t.id === params.get("tab")) ?? ANALYTICS_TABS[0];
    const item = tab.key ? itemOf(MOCK_TILE, tab.key) : null;
    const logos = (item?.teams ?? []).map((id) => TEAM_BY_V5[id]?.logo);
    return <Snapshot logos={logos} label={tab.label} line={item?.primary?.label ?? null} big={item?.primary?.display ?? null} bigColor={BRAND} />;
  }
  if (parts[0] === "stats" || parts[0] === "player-analytics") {
    const item = itemOf(MOCK_TILE, "metric_of_week");
    return item ? <Snapshot logos={[TEAM_BY_V5[item.teams?.[0]]?.logo]} label={item.data?.metric_label ?? item.title} line="Metric of the week" big={item.primary?.display ?? null} bigColor={BRAND} /> : null;
  }
  return null;
};

const SectionLabel = ({ children }) => (
  <Text px={4} pt={5} pb={2.5} fontSize="0.9rem" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.24em" textAlign="center">
    {children}
  </Text>
);

// ── Menu ─────────────────────────────────────────────────────────────────────

const MobileMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { stack, items } = useRouteSideNav(navigate);

  const gameFaces = useGameCenterFaces();
  const schoolFaces = useSchoolsFaces();
  const analytics = useAnalyticsFaces();

  const close = () => onClose();

  // "You are here" — the breadcrumb and the Here panel on the current band.
  const { pathname } = useLocation();
  const game = items.find((i) => i.type === "game");
  const team = stack[0]?.id === "team" ? stack[0] : null;
  const switcher = items.find((i) => i.type === "teamHubSwitcher");
  // Team tabs carry paths, not an active flag: the longest path that matches
  // the URL is the one you are on (exact tabs only match themselves).
  const teamTabs = (() => {
    const tabs = (switcher?.tabs ?? []).filter((t) => t.label);
    const hit = (t) => {
      const p = t.activePath ?? t.path;
      return t.exact ? pathname === p : pathname === p || pathname.startsWith(`${p}/`) || pathname.startsWith(p);
    };
    const best = tabs.filter(hit).sort((x, y) => (y.activePath ?? y.path).length - (x.activePath ?? x.path).length)[0];
    return tabs.map((t) => ({ ...t, active: t === best }));
  })();
  const activeItems = items.filter((i) => i.active && i.type !== "teamHubSwitcher" && i.type !== "game");
  const pageLabel = teamTabs.find((t) => t.active)?.label ?? (activeItems.length ? activeItems[activeItems.length - 1].label : "Hub");
  const inGames = pathname.startsWith("/game-center") || pathname.startsWith("/game/");
  const inSchools = pathname.startsWith("/schools") || pathname.startsWith("/teams") || pathname.startsWith("/rosters") || pathname.startsWith("/player");
  const inStats = pathname.startsWith("/stats") || pathname.startsWith("/team-analytics") || pathname.startsWith("/player-analytics");

  const crumbFor = (on, section) => {
    if (!on) return null;
    if (section === "Game Center" && game) return game.label;
    if (section === "Schools" && team) return `${team.shortName ?? team.label} · ${pageLabel}`;
    return pageLabel;
  };
  const snapshot = usePageSnapshot({ pathname, isOpen, team });
  const hereFor = (on) => (on ? snapshot : null);

  return (
    <DrawerRoot open={isOpen} onOpenChange={(e) => !e.open && close()} placement="start" modal preventScroll trapFocus={false}>
      <Portal>
        <DrawerBackdrop bg="blackAlpha.900" zIndex={Z_BACKDROP} />
        <DrawerPositioner zIndex={Z_CONTENT}>
          <DrawerContent bg="bg.primary" maxW="100%" w="100%" h="100dvh" borderRadius={0}>
            <TileStyles />
            {/* Top bar — sits where the header sits */}
            <Flex h="var(--app-header-height, 64px)" flexShrink={0} align="center" justify="space-between" px={4} borderBottom="1px solid" borderColor="whiteAlpha.200">
              <Link to="/" onClick={close}>
                <Text fontSize="2xl" fontWeight="black" color="text.primary" letterSpacing="tight">
                  HBCU<Box as="span" color="brand.500">GG</Box>
                </Text>
              </Link>
              <IconButton aria-label="Close menu" onClick={close} variant="ghost" color="white" size="lg" borderRadius="none" _hover={{ bg: "whiteAlpha.100" }}>
                <X size={26} />
              </IconButton>
            </Flex>

            <DrawerBody p={0} overflowY="auto">
              <SectionLabel>Sections</SectionLabel>
              <Flex direction="column" gap={3}>
                <Band title="Game Center" href="/game-center" faces={gameFaces} crumb={crumbFor(inGames, "Game Center")} here={hereFor(inGames)} onNavigate={close} rotateMs={6500} />
                <Band title="Schools" href="/schools" faces={schoolFaces} crumb={crumbFor(inSchools, "Schools")} here={hereFor(inSchools)} onNavigate={close} rotateMs={7500} />
                <Band title="Analytics" href="/stats" faces={analytics.map((a) => a.node)} hrefs={analytics.map((a) => a.href)} crumb={crumbFor(inStats, "Analytics")} here={hereFor(inStats)} onNavigate={close} rotateMs={7000} />
              </Flex>

              {/* The 18 — 6 across, 3 down, flush */}
              <SectionLabel>Teams</SectionLabel>
              <Box display="grid" gridTemplateColumns="repeat(6, minmax(0, 1fr))">
                {TEAMS.map((t) => (
                  <Flex
                    key={t.id}
                    as={Link}
                    to={`/teams/${t.id}`}
                    onClick={close}
                    direction="column"
                    align="center"
                    justify="center"
                    gap={1}
                    aspectRatio="1"
                    bg={`${t.colors.primary}30`}
                    borderRight="1px solid"
                    borderBottom="1px solid"
                    borderColor={`${t.colors.primary}55`}
                    _hover={{ bg: `${t.colors.primary}55`, textDecoration: "none" }}
                  >
                    <Image src={t.logo} alt="" w="58%" h="58%" objectFit="contain" />
                    <Text fontSize="0.62rem" fontWeight="black" color="white" textTransform="uppercase" lineClamp={1}>{abbr(t)}</Text>
                  </Flex>
                ))}
              </Box>

              {/* Sign-off */}
              <Box px={4} pt={10} pb={4} textAlign="center">
                {["HBCU", "GRIDIRON", "GLORY"].map((w, i) => (
                  <Text key={w} fontSize="clamp(2.1rem, 12vw, 3.4rem)" fontWeight="black" fontStyle="italic" lineHeight={0.85} letterSpacing="-0.04em" color={i === 2 ? BRAND : "white"}>
                    {w}
                  </Text>
                ))}
              </Box>
              <Flex gap={8} px={4} pt={2} pb={10} justify="center" color="whiteAlpha.600">
                <Twitter size={24} />
                <Instagram size={24} />
                <Youtube size={24} />
                <Facebook size={24} />
              </Flex>
            </DrawerBody>
          </DrawerContent>
        </DrawerPositioner>
      </Portal>
    </DrawerRoot>
  );
};

export default MobileMenu;
