import { useMemo, useState } from "react";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useGameCenterHubData } from "../../../hooks/useGameCenterHubData";
import { useFootballCurrentContext } from "../../../hooks/useFootballCurrentContext";
import { gameCenterPaths, fetchJson, toLocalTeam } from "../../../utils/gameCenterPayloads";

const GROUPS = [
  { key: "swac_east", label: "SWAC East", odds: "to win the East" },
  { key: "swac_west", label: "SWAC West", odds: "to win the West" },
  { key: "meac", label: "MEAC", odds: "to win the league" },
];

// Time-aware state. The week is read from the current-context file; the day
// of the week decides whether the hero is looking back, ahead, or at game day.
const heroState = (now, game) => {
  const day = now.getDay(); // 0 Sun … 6 Sat
  if (day === 6) return { key: "gameday", pill: "Game Day", live: true };
  if (day === 5) return { key: "preview", pill: "Preview", live: false };
  return { key: "recap", pill: game?.status === "final" ? "Recap" : "This Week", live: false };
};

const Pill = ({ children, bg = "whiteAlpha.200", color = "white" }) => (
  <Box px={3} py={1.5} borderRadius="full" bg={bg} display="inline-flex" alignItems="center">
    <Text textStyle="pill" color={color}>{children}</Text>
  </Box>
);

const TeamRow = ({ side, isWinner, final }) => (
  <Flex align="center" justify="space-between" gap={4}>
    <Flex align="center" gap={4} minW={0}>
      <Box
        w={{ base: "44px", md: "60px" }}
        h={{ base: "44px", md: "60px" }}
        borderRadius="xl"
        bg="whiteAlpha.100"
        border="1px solid"
        borderColor="whiteAlpha.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        {side.logo ? <Image src={side.logo} alt={side.label} w="74%" h="74%" objectFit="contain" /> : null}
      </Box>
      <Box minW={0}>
        <Text
          fontSize={{ base: "xl", md: "3xl" }}
          fontWeight="black"
          fontStyle="italic"
          textTransform="uppercase"
          letterSpacing="-0.03em"
          lineHeight={1}
          color={isWinner || !final ? "white" : "text.secondary"}
          lineClamp={1}
        >
          {side.name}
        </Text>
        {side.record ? (
          <Text textStyle="statLabel" color="text.muted" mt={1.5}>{side.record}</Text>
        ) : null}
      </Box>
    </Flex>
    <Text
      fontSize={{ base: "5xl", md: "7xl" }}
      fontWeight="black"
      fontStyle="italic"
      lineHeight={1}
      letterSpacing="-0.04em"
      color={isWinner ? "white" : "whiteAlpha.600"}
      style={{ fontVariantNumeric: "tabular-nums" }}
      flexShrink={0}
    >
      {final ? side.score : "—"}
    </Text>
  </Flex>
);

const Scoreboard = ({ game, state }) => {
  if (!game) return null;
  const final = game.status === "final";
  const awayWon = final && Number(game.awayScore) > Number(game.homeScore);
  const homeWon = final && Number(game.homeScore) > Number(game.awayScore);
  const accent = game.home?.primary ?? "#A855F7";
  const link = game.gamePathId ? `/game/${encodeURIComponent(game.gamePathId)}` : "/game-center";

  return (
    <Box
      as={Link}
      to={link}
      display="block"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.200"
      overflow="hidden"
      position="relative"
      bg={`linear-gradient(180deg, ${accent}26 0%, rgba(11,11,13,0.96) 46%, #0b0b0d 100%)`}
      boxShadow="0 18px 40px rgba(0,0,0,0.35)"
      transition="transform 0.2s, border-color 0.2s"
      _hover={{ transform: "translateY(-2px)", borderColor: "brand.500", textDecoration: "none" }}
    >
      {/* LED dot grid — a whisper of scoreboard, in brand purple */}
      <Box
        position="absolute"
        inset={0}
        opacity={0.5}
        pointerEvents="none"
        bgImage="radial-gradient(rgba(168,85,247,0.16) 1px, transparent 1.5px)"
        bgSize="9px 9px"
        style={{ maskImage: "linear-gradient(180deg, transparent 0%, #000 70%)" }}
      />
      <Flex
        position="relative"
        align="center"
        justify="space-between"
        px={{ base: 4, md: 6 }}
        py={3}
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
        bg={`${accent}21`}
        gap={3}
      >
        <Flex align="center" gap={3}>
          <Pill>{final ? "Final" : "Preview"}</Pill>
          {game.confGame ? <Text textStyle="statLabel" color="text.secondary">Conf</Text> : null}
          {state.live ? <Pill bg="red.500">Live slate</Pill> : null}
        </Flex>
        <Text textStyle="statLabel" color="text.secondary" textAlign="right" lineClamp={1}>
          {game.stageLabel} · {game.dateLabel}
        </Text>
      </Flex>
      <Flex position="relative" direction="column" gap={{ base: 4, md: 5 }} px={{ base: 4, md: 6 }} py={{ base: 5, md: 6 }}>
        <TeamRow side={game.away} isWinner={awayWon} final={final} />
        <TeamRow side={game.home} isWinner={homeWon} final={final} />
      </Flex>
      <Box position="relative" px={{ base: 4, md: 6 }} py={3} borderTop="1px solid" borderColor="whiteAlpha.100">
        <Text textStyle="cardTitle" color="brand.400" lineClamp={1}>{game.supportingLine}</Text>
      </Box>
    </Box>
  );
};

const RaceLane = ({ row, pct, maxPct, isLeader, oddsLabel }) => {
  const team = toLocalTeam(row.team_id, row.team?.short_name);
  return (
    <Flex align="center" gap={3}>
      <Text
        w="22px"
        textAlign="center"
        fontSize="lg"
        fontWeight="black"
        fontStyle="italic"
        color={isLeader ? "white" : "text.muted"}
      >
        {row.rank}
      </Text>
      <Box position="relative" flex={1} h="46px" borderRadius="lg" bg="whiteAlpha.50" overflow="hidden">
        {/* Lane fill — length is the team's chance to finish first */}
        <Box
          position="absolute"
          top={0}
          bottom={0}
          left={0}
          w={`${Math.max(8, (pct / maxPct) * 100)}%`}
          bg={`linear-gradient(90deg, ${team.primary}99 0%, ${team.primary}E6 60%, ${team.secondary}CC 100%)`}
          borderRight="3px solid"
          borderColor={isLeader ? "brand.400" : "whiteAlpha.500"}
          transition="width 0.6s ease"
        />
        <Flex position="relative" h="100%" align="center" justify="space-between" px={2.5} gap={3}>
          <Flex align="center" gap={2.5} minW={0}>
            <Box w="30px" h="30px" borderRadius="md" bg="whiteAlpha.200" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
              {team.logo ? <Image src={team.logo} alt={team.label} w="78%" h="78%" objectFit="contain" /> : null}
            </Box>
            <Text textStyle="cardTitle" color="white" lineClamp={1}>{team.shortName}</Text>
            <Text textStyle="statLabel" color="whiteAlpha.700" display={{ base: "none", sm: "block" }}>
              {row.conference_record} conf
            </Text>
          </Flex>
          <Text
            fontSize="xl"
            fontWeight="black"
            fontStyle="italic"
            color="white"
            style={{ fontVariantNumeric: "tabular-nums" }}
            title={`Chance ${oddsLabel}`}
          >
            {pct.toFixed(1)}%
          </Text>
        </Flex>
      </Box>
    </Flex>
  );
};

const Race = ({ season }) => {
  const [groupKey, setGroupKey] = useState("swac_west");
  const group = GROUPS.find((g) => g.key === groupKey);

  const { data } = useQuery({
    queryKey: ["home-standings-race", season],
    queryFn: () => fetchJson(gameCenterPaths.standingsRace(season)),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const lanes = useMemo(() => {
    const g = data?.groups?.[groupKey];
    if (!g) return [];
    const odds = Object.fromEntries((g.finish_matrix ?? []).map((f) => [f.team_id, Number(f.values?.[0] ?? 0)]));
    return (g.standings ?? []).map((row) => ({ row, pct: odds[row.team_id] ?? 0 }));
  }, [data, groupKey]);

  const maxPct = Math.max(1, ...lanes.map((l) => l.pct));
  const leaderPct = Math.max(0, ...lanes.map((l) => l.pct));

  return (
    <Box
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.200"
      bg="rgba(20,20,22,0.82)"
      backdropFilter="blur(12px)"
      p={{ base: 4, md: 6 }}
      h="100%"
    >
      <Flex align="center" justify="space-between" mb={1} wrap="wrap" gap={3}>
        <Text textStyle="cardTitle" color="white" fontSize="14px">The Race</Text>
        <Flex gap={2}>
          {GROUPS.map((g) => (
            <Box
              as="button"
              key={g.key}
              onClick={() => setGroupKey(g.key)}
              px={3}
              py={2}
              minH="32px"
              borderRadius="full"
              bg={g.key === groupKey ? "brand.500" : "whiteAlpha.100"}
              _hover={{ bg: g.key === groupKey ? "brand.500" : "whiteAlpha.200" }}
              aria-pressed={g.key === groupKey}
            >
              <Text textStyle="pill" color="white">{g.label}</Text>
            </Box>
          ))}
        </Flex>
      </Flex>
      <Text textStyle="bodySecondary" color="text.muted" mb={4}>
        Chance {group.odds}, from 20,000 simulated finishes.
      </Text>
      <Flex direction="column" gap={2}>
        {lanes.map(({ row, pct }) => (
          <RaceLane key={row.team_id} row={row} pct={pct} maxPct={maxPct} isLeader={pct === leaderPct} oddsLabel={group.odds} />
        ))}
        {!lanes.length ? <Text textStyle="bodySecondary" color="text.muted">Loading the race…</Text> : null}
      </Flex>
    </Box>
  );
};

const HomeHeroScoreboard = () => {
  const { season, featuredGames, isLoading } = useGameCenterHubData();
  const { label: seasonLabel } = useFootballCurrentContext();
  const now = useMemo(() => new Date(), []);

  const game = useMemo(() => {
    if (!featuredGames?.length) return null;
    const day = now.getDay();
    const wantsUpcoming = day === 5 || day === 6;
    const pick = featuredGames.find((g) => (wantsUpcoming ? g.status !== "final" : g.status === "final"));
    return pick ?? featuredGames[0];
  }, [featuredGames, now]);

  const state = heroState(now, game);

  return (
    <Box position="relative" overflow="hidden" minH={{ base: "auto", lg: "640px" }} display="flex" alignItems="center">
      <Box position="absolute" inset={0} bgImage="url('/pics/hero_stadium.jpg')" bgSize="cover" bgPosition="center" />
      <Box position="absolute" inset={0} bg="linear-gradient(180deg, rgba(11,11,13,0.78) 0%, rgba(11,11,13,0.92) 100%)" />
      <Box position="absolute" inset={0} boxShadow="inset 0 0 200px rgba(0,0,0,0.8)" />
      <Text
        position="absolute"
        right="-20px"
        bottom="-70px"
        textStyle="bannerGhost"
        fontSize="clamp(140px, 24vw, 340px)"
        color="white"
        opacity={0.05}
        pointerEvents="none"
        userSelect="none"
      >
        GLORY
      </Text>

      <Box position="relative" zIndex={1} w="100%" maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} pt={{ base: 24, md: 28 }} pb={{ base: 10, md: 14 }}>
        <Flex align="center" gap={3} mb={4} wrap="wrap">
          <Box bg="brand.500" px={3} py={1.5}>
            <Text textStyle="pill" color="white">{state.pill}</Text>
          </Box>
          <Text textStyle="kicker" color="text.secondary" fontSize="11px">{seasonLabel}</Text>
        </Flex>
        <Text textStyle="bannerHeadline" color="white" mb={2}>
          HBCU <Box as="span" color="brand.500">Gridiron</Box>
        </Text>
        <Text textStyle="editorial" color="text.secondary" fontSize="12px" mb={{ base: 6, md: 8 }}>
          The scoreboard, and the race it is changing
        </Text>

        <Box display="grid" gridTemplateColumns={{ base: "1fr", lg: "minmax(0, 1.05fr) minmax(0, 1fr)" }} gap={{ base: 4, md: 6 }}>
          {isLoading && !game ? (
            <Box borderRadius="xl" bg="bg.card" minH="260px" />
          ) : (
            <Scoreboard game={game} state={state} />
          )}
          <Race season={season} />
        </Box>
      </Box>
    </Box>
  );
};

export default HomeHeroScoreboard;
