import React, { useEffect, useRef } from "react";
import { Box, Flex, Text, VStack, HStack, Grid } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { Database, Users, BarChart2, ChevronRight } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// ROSTER EXPLORER — 2x1 VARIANTS
// ─────────────────────────────────────────────────────────────────────────────

// A — FIELD REPORT
// Left: label / title / blurb. Right: oversized jersey number as art.
export const RosterFieldReport = () => (
  <Box
    as={RouterLink}
    to="/players?view=roster"
    w="100%"
    h="100%"
    bg="bg.secondary"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="lg"
    position="relative"
    overflow="hidden"
    cursor="pointer"
    display="flex"
    _hover={{ borderColor: "brand.500" }}
    transition="border-color 0.2s"
  >
    {/* Left panel */}
    <Flex direction="column" justify="center" p={6} flex={1} zIndex={1}>
      <Text
        fontSize="9px"
        fontWeight="black"
        color="brand.400"
        letterSpacing="0.25em"
        textTransform="uppercase"
        mb={2}
      >
        DATABASE
      </Text>
      <Text
        fontSize="2xl"
        fontWeight="black"
        color="white"
        textTransform="uppercase"
        lineHeight={1}
        mb={3}
      >
        Roster
        <br />
        Explorer
      </Text>
      <Text fontSize="xs" color="text.secondary" maxW="260px">
        Search physical profiles and player depth per team.
      </Text>
      <HStack mt={4} gap={1}>
        <Text fontSize="xs" fontWeight="black" color="brand.400">
          EXPLORE
        </Text>
        <ChevronRight size={12} color="var(--chakra-colors-brand-400)" />
      </HStack>
    </Flex>

    {/* Right: jersey number art */}
    <Flex
      align="center"
      justify="center"
      w="200px"
      flexShrink={0}
      position="relative"
    >
      <Text
        fontSize="180px"
        fontWeight="black"
        fontStyle="italic"
        lineHeight={1}
        color="whiteAlpha.50"
        letterSpacing="-0.06em"
        userSelect="none"
        position="absolute"
        right="-20px"
      >
        #1
      </Text>
      <Database
        size={32}
        color="var(--chakra-colors-brand-500)"
        style={{ position: "relative", zIndex: 1 }}
      />
    </Flex>

    {/* Bottom accent line */}
    <Box
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      h="2px"
      bg="linear-gradient(90deg, var(--chakra-colors-brand-500), transparent)"
    />
  </Box>
);

// B — DATABASE TERMINAL
// Monospace aesthetic. Fake player rows scroll behind frosted glass.
const FAKE_ROWS = [
  { pos: "QB", name: "J. Williams", num: "1", ht: "6'2\"", wt: "215" },
  { pos: "RB", name: "M. Davis", num: "22", ht: "5'10\"", wt: "198" },
  { pos: "WR", name: "T. Jackson", num: "5", ht: "6'0\"", wt: "185" },
  { pos: "WR", name: "D. Brown", num: "11", ht: "6'1\"", wt: "190" },
  { pos: "TE", name: "K. Smith", num: "88", ht: "6'4\"", wt: "245" },
  { pos: "OT", name: "R. Jones", num: "72", ht: "6'5\"", wt: "305" },
  { pos: "CB", name: "A. Harris", num: "21", ht: "5'11\"", wt: "185" },
  { pos: "S", name: "C. Thomas", num: "32", ht: "6'0\"", wt: "200" },
];

export const RosterTerminal = () => (
  <Box
    as={RouterLink}
    to="/players?view=roster"
    w="100%"
    h="100%"
    bg="#080c10"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="lg"
    position="relative"
    overflow="hidden"
    cursor="pointer"
    _hover={{ borderColor: "brand.500" }}
    transition="border-color 0.2s"
  >
    {/* Scanline overlay */}
    <Box
      position="absolute"
      inset={0}
      pointerEvents="none"
      zIndex={2}
      backgroundImage="repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)"
    />

    {/* Header bar */}
    <Flex
      px={4}
      py={2}
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      align="center"
      gap={2}
      position="relative"
      zIndex={3}
    >
      <Box w="8px" h="8px" borderRadius="full" bg="green.400" />
      <Text
        fontFamily="monospace"
        fontSize="10px"
        color="green.400"
        letterSpacing="0.1em"
      >
        HBCU_ROSTER_DB v2.4 — LIVE
      </Text>
    </Flex>

    {/* Fake data rows */}
    <Box px={4} pt={2} position="relative" zIndex={1}>
      <Flex mb={1} gap={0}>
        {["POS", "#", "NAME", "HT", "WT"].map((h, i) => (
          <Text
            key={h}
            fontFamily="monospace"
            fontSize="9px"
            color="green.700"
            fontWeight="bold"
            flex={i === 2 ? 1 : "none"}
            w={i === 0 ? "28px" : i === 1 ? "28px" : i === 3 ? "44px" : "36px"}
          >
            {h}
          </Text>
        ))}
      </Flex>
      {FAKE_ROWS.map((r, i) => (
        <Flex key={i} gap={0} opacity={1 - i * 0.1}>
          <Text
            fontFamily="monospace"
            fontSize="9px"
            color="green.400"
            w="28px"
          >
            {r.pos}
          </Text>
          <Text
            fontFamily="monospace"
            fontSize="9px"
            color="green.600"
            w="28px"
          >
            {r.num}
          </Text>
          <Text
            fontFamily="monospace"
            fontSize="9px"
            color="green.300"
            flex={1}
          >
            {r.name}
          </Text>
          <Text
            fontFamily="monospace"
            fontSize="9px"
            color="green.600"
            w="44px"
          >
            {r.ht}
          </Text>
          <Text
            fontFamily="monospace"
            fontSize="9px"
            color="green.600"
            w="36px"
          >
            {r.wt}
          </Text>
        </Flex>
      ))}
    </Box>

    {/* Frosted bottom fade */}
    <Box
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      h="60px"
      zIndex={2}
      bg="linear-gradient(to top, #080c10 40%, transparent)"
    />
    <Flex
      position="absolute"
      bottom={3}
      left={4}
      right={4}
      align="center"
      justify="space-between"
      zIndex={3}
    >
      <Text fontFamily="monospace" fontSize="9px" color="green.500">
        18 TEAMS / 1,200+ PLAYERS
      </Text>
      <Text
        fontFamily="monospace"
        fontSize="9px"
        color="green.400"
        fontWeight="bold"
      >
        SEARCH_
      </Text>
    </Flex>
  </Box>
);

// C — DEPTH CHART
// Positional stacks visualized as tiered rows.
const DEPTH = [
  { pos: "QB", players: ["J. Williams #1", "M. Carter #14"] },
  { pos: "RB", players: ["M. Davis #22", "T. Reed #35"] },
  { pos: "WR", players: ["T. Jackson #5", "D. Brown #11", "K. Lee #83"] },
  { pos: "OL", players: ["R. Jones #72", "P. Grant #65"] },
];

export const RosterDepthChart = () => (
  <Box
    as={RouterLink}
    to="/players?view=roster"
    w="100%"
    h="100%"
    bg="bg.secondary"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="lg"
    overflow="hidden"
    cursor="pointer"
    _hover={{ borderColor: "brand.500" }}
    transition="border-color 0.2s"
    display="flex"
    flexDirection="column"
  >
    <Flex
      px={5}
      py={3}
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      align="center"
      justify="space-between"
      flexShrink={0}
    >
      <Text
        fontSize="xs"
        fontWeight="black"
        color="white"
        textTransform="uppercase"
        letterSpacing="0.12em"
      >
        Depth Chart
      </Text>
      <Text fontSize="9px" color="text.muted">
        OFFENSE
      </Text>
    </Flex>

    <Box flex={1} px={5} py={3} overflowY="hidden">
      <Grid templateColumns="48px 1fr" gap={2}>
        {DEPTH.map((group) => (
          <React.Fragment key={group.pos}>
            <Flex align="flex-start" pt="2px">
              <Box px={2} py="1px" bg="brand.500" borderRadius="sm">
                <Text fontSize="9px" fontWeight="black" color="white">
                  {group.pos}
                </Text>
              </Box>
            </Flex>
            <VStack gap={1} align="stretch">
              {group.players.map((p, i) => (
                <Flex key={p} align="center" gap={2}>
                  <Box
                    w="12px"
                    h="12px"
                    borderRadius="full"
                    bg={i === 0 ? "white" : "whiteAlpha.200"}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    <Text
                      fontSize="7px"
                      fontWeight="black"
                      color={i === 0 ? "bg.primary" : "text.muted"}
                    >
                      {i + 1}
                    </Text>
                  </Box>
                  <Text
                    fontSize="10px"
                    fontWeight={i === 0 ? "black" : "normal"}
                    color={i === 0 ? "white" : "text.secondary"}
                    lineClamp={1}
                  >
                    {p}
                  </Text>
                </Flex>
              ))}
            </VStack>
          </React.Fragment>
        ))}
      </Grid>
    </Box>

    <Flex
      px={5}
      py={2}
      borderTop="1px solid"
      borderColor="whiteAlpha.100"
      align="center"
      gap={1}
      flexShrink={0}
    >
      <Text fontSize="xs" fontWeight="black" color="brand.400">
        VIEW ALL ROSTERS
      </Text>
      <ChevronRight size={12} color="var(--chakra-colors-brand-400)" />
    </Flex>
  </Box>
);

// ─────────────────────────────────────────────────────────────────────────────
// COACHES — 1x1 VARIANTS
// ─────────────────────────────────────────────────────────────────────────────

// A — CHALKBOARD
// Dark green, play diagram watermark, chalk-style type.
export const CoachesChalkboard = () => (
  <Box
    as={RouterLink}
    to="/coaches"
    w="100%"
    h="100%"
    bg="#1a2e1a"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="lg"
    position="relative"
    overflow="hidden"
    cursor="pointer"
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    _hover={{ borderColor: "green.500" }}
    transition="border-color 0.2s"
  >
    {/* X's and O's watermark */}
    <Box
      position="absolute"
      inset={0}
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontSize="80px"
      color="whiteAlpha.050"
      fontWeight="black"
      letterSpacing="-0.02em"
      userSelect="none"
      pointerEvents="none"
    >
      X O X
    </Box>
    {/* Chalk lines */}
    <Box
      position="absolute"
      top="30%"
      left="50%"
      w="60px"
      h="1px"
      bg="whiteAlpha.100"
      transform="translate(-50%, 0) rotate(-20deg)"
    />
    <Box
      position="absolute"
      top="40%"
      left="30%"
      w="40px"
      h="1px"
      bg="whiteAlpha.100"
      transform="rotate(10deg)"
    />

    <Text fontSize="3xl" mb={1} position="relative" zIndex={1}>
      📋
    </Text>
    <Text
      fontSize="sm"
      fontWeight="black"
      color="white"
      letterSpacing="0.12em"
      position="relative"
      zIndex={1}
    >
      COACHES
    </Text>
    <Text
      fontSize="9px"
      color="green.400"
      mt={1}
      position="relative"
      zIndex={1}
    >
      GAME PLANS
    </Text>
  </Box>
);

// B — RECORD BOARD
// Scoreboard-style W/L display.
export const CoachesRecordBoard = () => (
  <Box
    as={RouterLink}
    to="/coaches"
    w="100%"
    h="100%"
    bg="bg.secondary"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="lg"
    overflow="hidden"
    cursor="pointer"
    display="flex"
    flexDirection="column"
    _hover={{ borderColor: "brand.500" }}
    transition="border-color 0.2s"
  >
    <Flex
      px={4}
      py={3}
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      align="center"
      gap={2}
      flexShrink={0}
    >
      <Users size={10} color="var(--chakra-colors-text-muted)" />
      <Text
        fontSize="9px"
        fontWeight="black"
        color="text.muted"
        textTransform="uppercase"
        letterSpacing="0.14em"
      >
        Head Coaches
      </Text>
    </Flex>

    <Flex flex={1} align="center" justify="center" gap={6}>
      <VStack gap={0}>
        <Text
          fontSize="3xl"
          fontWeight="black"
          color="green.400"
          lineHeight={1}
        >
          247
        </Text>
        <Text
          fontSize="9px"
          color="text.muted"
          textTransform="uppercase"
          letterSpacing="0.1em"
        >
          Combined W
        </Text>
      </VStack>
      <Box w="1px" h="40px" bg="whiteAlpha.100" />
      <VStack gap={0}>
        <Text fontSize="3xl" fontWeight="black" color="red.400" lineHeight={1}>
          189
        </Text>
        <Text
          fontSize="9px"
          color="text.muted"
          textTransform="uppercase"
          letterSpacing="0.1em"
        >
          Combined L
        </Text>
      </VStack>
    </Flex>

    <Flex
      px={4}
      py={2}
      borderTop="1px solid"
      borderColor="whiteAlpha.100"
      align="center"
      justify="space-between"
      flexShrink={0}
    >
      <Text fontSize="9px" color="text.muted">
        18 ACTIVE COACHES
      </Text>
      <ChevronRight size={10} color="var(--chakra-colors-text-muted)" />
    </Flex>
  </Box>
);

// C — PORTRAIT FRAME
// Silhouette + nameplate aesthetic.
export const CoachesPortrait = () => (
  <Box
    as={RouterLink}
    to="/coaches"
    w="100%"
    h="100%"
    bg="bg.secondary"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="lg"
    position="relative"
    overflow="hidden"
    cursor="pointer"
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    _hover={{ borderColor: "brand.500" }}
    transition="border-color 0.2s"
  >
    {/* Corner frame accents */}
    {[
      { top: 0, left: 0 },
      { top: 0, right: 0 },
      { bottom: 0, left: 0 },
      { bottom: 0, right: 0 },
    ].map((pos, i) => (
      <Box
        key={i}
        position="absolute"
        {...pos}
        w="16px"
        h="16px"
        borderTop={pos.top === 0 ? "2px solid" : "none"}
        borderBottom={pos.bottom === 0 ? "2px solid" : "none"}
        borderLeft={pos.left === 0 ? "2px solid" : "none"}
        borderRight={pos.right === 0 ? "2px solid" : "none"}
        borderColor="whiteAlpha.200"
        m={2}
      />
    ))}

    {/* Silhouette */}
    <Box
      w="56px"
      h="56px"
      borderRadius="full"
      bg="whiteAlpha.100"
      display="flex"
      alignItems="center"
      justifyContent="center"
      mb={3}
    >
      <Text fontSize="2xl">👤</Text>
    </Box>

    {/* Nameplate */}
    <Box bg="whiteAlpha.100" px={4} py={1} borderRadius="sm">
      <Text
        fontSize="xs"
        fontWeight="black"
        color="white"
        letterSpacing="0.12em"
        textTransform="uppercase"
      >
        COACHES
      </Text>
    </Box>
    <Text fontSize="9px" color="text.muted" mt={2} letterSpacing="0.08em">
      18 HBCU PROGRAMS
    </Text>
  </Box>
);

// ─────────────────────────────────────────────────────────────────────────────
// STAT LAB — 1x1 VARIANTS
// ─────────────────────────────────────────────────────────────────────────────

const STAT_BARS = [
  { label: "PPG", value: 34.2, max: 50, color: "#e53e3e" },
  { label: "YPG", value: 412, max: 600, color: "#3182ce" },
  { label: "SACKS", value: 18, max: 30, color: "#d69e2e" },
];

// A — LIVE BARS
// Animated horizontal stat bars that fill on mount.
export const StatLabLiveBars = () => {
  const barRefs = useRef([]);

  useEffect(() => {
    const timers = barRefs.current.map((el, i) => {
      if (!el) return null;
      el.style.width = "0%";
      return setTimeout(
        () => {
          el.style.width = `${(STAT_BARS[i].value / STAT_BARS[i].max) * 100}%`;
        },
        100 + i * 150,
      );
    });
    return () => timers.forEach((t) => t && clearTimeout(t));
  }, []);

  return (
    <Box
      as={RouterLink}
      to="/stats"
      w="100%"
      h="100%"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="lg"
      overflow="hidden"
      cursor="pointer"
      display="flex"
      flexDirection="column"
      _hover={{ borderColor: "brand.500" }}
      transition="border-color 0.2s"
    >
      <Flex
        px={4}
        py={3}
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
        align="center"
        gap={2}
        flexShrink={0}
      >
        <BarChart2 size={10} color="var(--chakra-colors-brand-500)" />
        <Text
          fontSize="9px"
          fontWeight="black"
          color="text.muted"
          textTransform="uppercase"
          letterSpacing="0.14em"
        >
          Stat Lab
        </Text>
      </Flex>

      <VStack flex={1} px={4} justify="center" gap={3}>
        {STAT_BARS.map((s, i) => (
          <Box key={s.label} w="full">
            <Flex justify="space-between" mb={1}>
              <Text
                fontSize="9px"
                fontWeight="black"
                color="text.muted"
                textTransform="uppercase"
              >
                {s.label}
              </Text>
              <Text fontSize="9px" fontWeight="black" color="white">
                {s.value}
              </Text>
            </Flex>
            <Box
              h="5px"
              bg="whiteAlpha.100"
              borderRadius="full"
              overflow="hidden"
            >
              <Box
                ref={(el) => (barRefs.current[i] = el)}
                h="full"
                borderRadius="full"
                bg={s.color}
                style={{
                  width: "0%",
                  transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
                }}
              />
            </Box>
          </Box>
        ))}
      </VStack>

      <Flex
        px={4}
        py={2}
        borderTop="1px solid"
        borderColor="whiteAlpha.100"
        align="center"
        gap={1}
        flexShrink={0}
      >
        <Text fontSize="9px" fontWeight="black" color="brand.400">
          EXPLORE STATS
        </Text>
        <ChevronRight size={10} color="var(--chakra-colors-brand-400)" />
      </Flex>
    </Box>
  );
};

// B — RADAR PULSE
// Hexagonal radar shape with pulsing glow ring — pure aesthetic.
export const StatLabRadar = () => {
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180);
    const r = 36;
    return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
  }).join(" ");

  const innerPoints = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180);
    const r = 22;
    return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
  }).join(" ");

  return (
    <Box
      as={RouterLink}
      to="/stats"
      w="100%"
      h="100%"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="lg"
      position="relative"
      overflow="hidden"
      cursor="pointer"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      _hover={{ borderColor: "brand.500" }}
      transition="border-color 0.2s"
    >
      <Box w="100px" h="100px" position="relative">
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <polygon
            points={points}
            fill="none"
            stroke="rgba(229,62,62,0.15)"
            strokeWidth="1"
          />
          <polygon
            points={innerPoints}
            fill="rgba(229,62,62,0.08)"
            stroke="rgba(229,62,62,0.3)"
            strokeWidth="1"
          />
          {/* Axis lines */}
          {Array.from({ length: 6 }, (_, i) => {
            const angle = (i * 60 - 90) * (Math.PI / 180);
            return (
              <line
                key={i}
                x1="50"
                y1="50"
                x2={50 + 36 * Math.cos(angle)}
                y2={50 + 36 * Math.sin(angle)}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="0.5"
              />
            );
          })}
          <circle cx="50" cy="50" r="3" fill="var(--chakra-colors-brand-500)" />
          <style>{`
            @keyframes radarPulse {
              0% { r: 3; opacity: 1; }
              100% { r: 40; opacity: 0; }
            }
            .radar-ring { animation: radarPulse 2.5s ease-out infinite; }
          `}</style>
          <circle
            className="radar-ring"
            cx="50"
            cy="50"
            r="3"
            fill="none"
            stroke="var(--chakra-colors-brand-500)"
            strokeWidth="0.5"
            opacity="0.6"
          />
        </svg>
      </Box>
      <Text
        fontSize="xs"
        fontWeight="black"
        color="white"
        letterSpacing="0.12em"
        mt={2}
      >
        STAT LAB
      </Text>
      <Text fontSize="9px" color="text.muted" mt={1}>
        ANALYTICS ENGINE
      </Text>
    </Box>
  );
};

// C — TICKER
// Scrolling ESPN-style stat ticker.
const TICKER_ITEMS = [
  "JSU PPG: 38.4",
  "FAMU YPG: 445",
  "SU SACKS: 22",
  "NCCU QBR: 91.2",
  "HU 3rd%: 48",
  "GSU RTG: 87.4",
  "PVAMU TFL: 19",
  "ASU INT: 11",
];

export const StatLabTicker = () => (
  <Box
    as={RouterLink}
    to="/stats"
    w="100%"
    h="100%"
    bg="bg.secondary"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="lg"
    overflow="hidden"
    cursor="pointer"
    display="flex"
    flexDirection="column"
    _hover={{ borderColor: "brand.500" }}
    transition="border-color 0.2s"
  >
    <Flex
      px={4}
      py={3}
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      align="center"
      gap={2}
      flexShrink={0}
    >
      <Box
        w="6px"
        h="6px"
        borderRadius="full"
        bg="red.500"
        flexShrink={0}
        style={{ animation: "hbPulse 1.5s infinite" }}
      />
      <Text
        fontSize="9px"
        fontWeight="black"
        color="white"
        textTransform="uppercase"
        letterSpacing="0.14em"
      >
        LIVE STATS
      </Text>
    </Flex>

    <Flex flex={1} direction="column" justify="center" px={4} gap={2}>
      <Text
        fontSize="xs"
        fontWeight="black"
        color="white"
        textTransform="uppercase"
        letterSpacing="0.06em"
      >
        Stat Lab
      </Text>
      <Text fontSize="9px" color="text.secondary">
        Deep analytics across all 18 programs
      </Text>
    </Flex>

    {/* Ticker strip */}
    <Box
      borderTop="1px solid"
      borderColor="whiteAlpha.100"
      bg="brand.500"
      overflow="hidden"
      flexShrink={0}
    >
      <Box
        display="flex"
        gap={8}
        px={4}
        py="6px"
        whiteSpace="nowrap"
        style={{ animation: "tickerScroll 18s linear infinite" }}
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <Text
            key={i}
            fontSize="9px"
            fontWeight="black"
            color="white"
            letterSpacing="0.08em"
            flexShrink={0}
          >
            {item}
          </Text>
        ))}
      </Box>
    </Box>

    <style>{`
      @keyframes tickerScroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      @keyframes hbPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.4; transform: scale(1.6); }
      }
    `}</style>
  </Box>
);

// D - COMBO - Live bars with scrolling ticker (Cascade - 2026-04-11 6:46am)
export const StatLabCombo = () => {
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180);
    const r = 36;
    return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
  }).join(" ");

  const innerPoints = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180);
    const r = 22;
    return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
  }).join(" ");

  const barRefs = useRef([]);

  useEffect(() => {
    const timers = barRefs.current.map((el, i) => {
      if (!el) return null;
      el.style.width = "0%";
      return setTimeout(
        () => {
          el.style.width = `${(STAT_BARS[i].value / STAT_BARS[i].max) * 100}%`;
        },
        100 + i * 150,
      );
    });
    return () => timers.forEach((t) => t && clearTimeout(t));
  }, []);

  return (
    <Box
      as={RouterLink}
      to="/stats"
      w="100%"
      h="100%"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="lg"
      overflow="hidden"
      cursor="pointer"
      display="flex"
      flexDirection="column"
      _hover={{ borderColor: "brand.500" }}
      transition="border-color 0.2s"
    >
      <Flex
        px={4}
        py={3}
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
        align="center"
        gap={2}
        flexShrink={0}
      >
        <Box
          w="6px"
          h="6px"
          borderRadius="full"
          bg="red.500"
          flexShrink={0}
          style={{ animation: "hbPulse 1.5s infinite" }}
        />
        <BarChart2 size={10} color="var(--chakra-colors-brand-500)" />
        <Text
          fontSize="9px"
          fontWeight="black"
          color="white"
          textTransform="uppercase"
          letterSpacing="0.14em"
        >
          LIVE STAT LAB
        </Text>
      </Flex>

      <VStack flex={1} px={4} justify="center" gap={3} py={3}>
        {STAT_BARS.map((s, i) => (
          <Box key={s.label} w="full">
            <Flex justify="space-between" mb={1}>
              <Text
                fontSize="9px"
                fontWeight="black"
                color="text.muted"
                textTransform="uppercase"
              >
                {s.label}
              </Text>
              <Text fontSize="9px" fontWeight="black" color="white">
                {s.value}
              </Text>
            </Flex>
            <Box
              h="4px"
              bg="whiteAlpha.100"
              borderRadius="full"
              overflow="hidden"
            >
              <Box
                ref={(el) => (barRefs.current[i] = el)}
                h="full"
                borderRadius="full"
                bg={s.color}
                style={{
                  width: "0%",
                  transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
                }}
              />
            </Box>
          </Box>
        ))}
      </VStack>

      {/* Radar visual section */}
      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justify="center"
        py={4}
        position="relative"
      >
        <Box
          position="absolute"
          w="72px"
          h="72px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(229,62,62,0.15) 0%, transparent 70%)"
          style={{ animation: "radarPulse 3s ease-in-out infinite" }}
        />
        <svg
          width="72"
          height="72"
          viewBox="0 0 100 100"
          position="relative"
          zIndex={1}
        >
          <polygon
            points={points}
            fill="none"
            stroke="brand.500"
            strokeWidth="1"
            opacity="0.6"
          />
          <polygon
            points={innerPoints}
            fill="none"
            stroke="brand.500"
            strokeWidth="1"
            opacity="0.4"
          />
          {Array.from({ length: 6 }, (_, i) => {
            const angle = (i * 60 - 90) * (Math.PI / 180);
            const x1 = 50 + 36 * Math.cos(angle);
            const y1 = 50 + 36 * Math.sin(angle);
            const x2 = 50 + 22 * Math.cos(angle);
            const y2 = 50 + 22 * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="brand.500"
                strokeWidth="1"
                opacity="0.3"
              />
            );
          })}
          <circle cx="50" cy="50" r="2" fill="brand.500" />
        </svg>
        <Text
          fontSize="xs"
          fontWeight="black"
          color="white"
          textTransform="uppercase"
          letterSpacing="0.06em"
          mt={3}
        >
          Stat Lab
        </Text>
        <Text fontSize="9px" color="text.secondary" textAlign="center">
          Deep analytics across all 18 programs
        </Text>
      </Box>

      {/* Ticker strip */}
      <Box
        borderTop="1px solid"
        borderColor="whiteAlpha.100"
        bg="brand.500"
        overflow="hidden"
        flexShrink={0}
      >
        <Box
          display="flex"
          gap={8}
          px={4}
          py="6px"
          whiteSpace="nowrap"
          style={{ animation: "tickerScroll 18s linear infinite" }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <Text
              key={i}
              fontSize="9px"
              fontWeight="black"
              color="white"
              letterSpacing="0.08em"
              flexShrink={0}
            >
              {item}
            </Text>
          ))}
        </Box>
      </Box>

      <style>{`
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes hbPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes radarPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
      `}</style>
    </Box>
  );
};

// E — RADAR + TICKER COMBO [2026-04-11]
export const StatLabRadarTicker = () => {
  const hexOuter = Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 - 90) * (Math.PI / 180);
    return `${50 + 36 * Math.cos(a)},${50 + 36 * Math.sin(a)}`;
  }).join(' ');
  const hexInner = Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 - 90) * (Math.PI / 180);
    return `${50 + 20 * Math.cos(a)},${50 + 20 * Math.sin(a)}`;
  }).join(' ');

  return (
    <Box
      as={RouterLink} to="/stats"
      w="100%" h="100%" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100"
      borderRadius="lg" overflow="hidden" cursor="pointer"
      display="flex" flexDirection="column"
      _hover={{ borderColor: 'brand.500' }} transition="border-color 0.2s"
    >
      {/* Centered radar + label */}
      <Flex flex={1} direction="column" align="center" justify="center" position="relative">
        <Box
          position="absolute" w="90px" h="90px" borderRadius="full"
          bg="radial-gradient(circle, rgba(229,62,62,0.2) 0%, transparent 70%)"
          style={{ animation: 'statRadarGlow 2.5s ease-in-out infinite' }}
        />
        <Box w="80px" h="80px" position="relative">
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <polygon points={hexOuter} fill="none" stroke="rgba(229,62,62,0.3)" strokeWidth="1" />
            <polygon points={hexInner} fill="rgba(229,62,62,0.1)" stroke="rgba(229,62,62,0.6)" strokeWidth="1" />
            {Array.from({ length: 6 }, (_, i) => {
              const a = (i * 60 - 90) * (Math.PI / 180);
              return (
                <line key={i} x1="50" y1="50"
                  x2={50 + 36 * Math.cos(a)} y2={50 + 36 * Math.sin(a)}
                  stroke="rgba(255,255,255,0.07)" strokeWidth="0.5"
                />
              );
            })}
            <circle cx="50" cy="50" r="4" fill="#e53e3e" />
            <circle cx="50" cy="50" r="4" fill="none" stroke="#e53e3e" strokeWidth="0.8"
              style={{ animation: 'statRadarRing 2.5s ease-out infinite' }} />
          </svg>
        </Box>
        <Text fontSize="sm" fontWeight="black" color="white" letterSpacing="0.12em" mt={2} textTransform="uppercase">
          STAT LAB
        </Text>
      </Flex>

      {/* Ticker strip */}
      <Box borderTop="1px solid" borderColor="whiteAlpha.100" bg="brand.500" overflow="hidden" flexShrink={0}>
        <Box display="flex" gap={8} px={4} py="6px" whiteSpace="nowrap"
          style={{ animation: 'statTickerScroll 18s linear infinite' }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <Text key={i} fontSize="9px" fontWeight="black" color="white" letterSpacing="0.08em" flexShrink={0}>
              {item}
            </Text>
          ))}
        </Box>
      </Box>

      <style>{`
        @keyframes statRadarGlow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes statRadarRing {
          0% { r: 4; opacity: 0.8; }
          100% { r: 44; opacity: 0; }
        }
        @keyframes statTickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </Box>
  );
};

