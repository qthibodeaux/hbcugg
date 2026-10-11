import { useState } from "react";
import {
  Box,
  Flex,
  Grid,
  Text,
  VStack,
} from "@chakra-ui/react";

// ═══════════════════════════════════════════════════════════════
// AUTHENTIC PAYLOAD (JSU vs PVAMU) — WITH ENRICHED SP+ METRICS
// ═══════════════════════════════════════════════════════════════
const TEAMS = {
  jsu: {
    meta: {
      shortName: "JSU",
      colors: { primary: "#002147", secondary: "#FFFFFF", accent: "#4A90D9" },
    },
    team: {
      attempts: 26,
      yards: 95,
      touchdowns: 2,
      ypc: 3.65,
      lineYards: 68.3,
      lineYpc: 2.63,
      highlightYards: 26.7,
      highlightYpc: 1.03,
      opportunityRate: 0.423,
      opportunityRuns: 11,
      stuffRate: 0.231,
      stuffedRuns: 6,
      stoppedRate: 0.423,
      successfulRuns: 10,
      rushSuccessRate: 0.385,
    },
    lanes: {
      left: { attempts: 12, yards: 30, success: 4, touchdowns: 0 },
      middle: { attempts: 11, yards: 36, success: 5, touchdowns: 1 },
      right: { attempts: 3, yards: 29, success: 1, touchdowns: 1 },
    },
    rushers: [
      {
        name: "Miller,Ahmad",
        key: "name:miller,ahmad",
        position: "RB",
        attempts: 13,
        yards: 27,
        touchdowns: 1,
        lineYards: 16.0,
        highlightYards: 11.0,
        opportunityRuns: 2,
        stuffedRuns: 3,
        successRuns: 5,
        lanes: {
          left: { attempts: 8, yards: 14, success: 3, touchdowns: 0 },
          middle: { attempts: 5, yards: 13, success: 2, touchdowns: 1 },
          right: { attempts: 0, yards: 0, success: 0, touchdowns: 0 },
        },
      },
      {
        name: "Terrell Jr,Travis",
        key: "name:terrell jr,travis",
        position: "RB",
        attempts: 9,
        yards: 34,
        touchdowns: 0,
        lineYards: 22.0,
        highlightYards: 12.0,
        opportunityRuns: 3,
        stuffedRuns: 2,
        successRuns: 3,
        lanes: {
          left: { attempts: 1, yards: 11, success: 1, touchdowns: 0 },
          middle: { attempts: 6, yards: 23, success: 2, touchdowns: 0 },
          right: { attempts: 2, yards: 0, success: 0, touchdowns: 0 },
        },
      },
      {
        name: "Morgan,JaCobian",
        key: "name:morgan,jacobian",
        position: "QB",
        attempts: 2,
        yards: 28,
        touchdowns: 1,
        lineYards: 3.0,
        highlightYards: 25.0,
        opportunityRuns: 1,
        stuffedRuns: 0,
        successRuns: 2,
        lanes: {
          left: { attempts: 1, yards: -1, success: 0, touchdowns: 0 },
          middle: { attempts: 0, yards: 0, success: 0, touchdowns: 0 },
          right: { attempts: 1, yards: 29, success: 2, touchdowns: 1 },
        },
      },
      {
        name: "Paul,Kobe",
        key: "name:paul,kobe",
        position: "RB",
        attempts: 1,
        yards: 2,
        touchdowns: 0,
        lineYards: 2.0,
        highlightYards: 0.0,
        opportunityRuns: 0,
        stuffedRuns: 0,
        successRuns: 0,
        lanes: {
          left: { attempts: 1, yards: 2, success: 0, touchdowns: 0 },
          middle: { attempts: 0, yards: 0, success: 0, touchdowns: 0 },
          right: { attempts: 0, yards: 0, success: 0, touchdowns: 0 },
        },
      },
      {
        name: "Lockhart,Jared",
        key: "name:lockhart,jared",
        position: "QB",
        attempts: 1,
        yards: 4,
        touchdowns: 0,
        lineYards: 4.0,
        highlightYards: 0.0,
        opportunityRuns: 0,
        stuffedRuns: 0,
        successRuns: 0,
        lanes: {
          left: { attempts: 1, yards: 4, success: 0, touchdowns: 0 },
          middle: { attempts: 0, yards: 0, success: 0, touchdowns: 0 },
          right: { attempts: 0, yards: 0, success: 0, touchdowns: 0 },
        },
      },
    ],
    opponent: {
      shortName: "PVAMU",
      metrics: {
        tflForced: 4.0,
        stuffRate: 0.231,
        powerStopRate: 0.667,
        oppAllowedRate: 0.423,
        firstDownSuccAllowed: 0.385,
        stopRate: 0.423,
      },
    },
  },
  pvamu: {
    meta: {
      shortName: "PVAMU",
      colors: { primary: "#4B0082", secondary: "#FFB81C", accent: "#FFB81C" },
    },
    team: {
      attempts: 48,
      yards: 155,
      touchdowns: 1,
      ypc: 3.23,
      lineYards: 113.3,
      lineYpc: 2.46,
      highlightYards: 33.7,
      highlightYpc: 0.73,
      opportunityRate: 0.304,
      opportunityRuns: 14,
      stuffRate: 0.196,
      stuffedRuns: 9,
      stoppedRate: 0.435,
      successfulRuns: 15,
      rushSuccessRate: 0.326,
    },
    lanes: {
      left: { attempts: 15, yards: 34, success: 3, touchdowns: 0 },
      middle: { attempts: 25, yards: 110, success: 11, touchdowns: 1 },
      right: { attempts: 8, yards: 11, success: 1, touchdowns: 0 },
    },
    rushers: [
      {
        name: "Peters,Cameron",
        key: "name:peters,cameron",
        position: "QB",
        attempts: 23,
        yards: 103,
        touchdowns: 1,
        lineYards: 58.0,
        highlightYards: 45.0,
        opportunityRuns: 6,
        stuffedRuns: 4,
        successRuns: 10,
        lanes: {
          left: { attempts: 3, yards: 7, success: 0, touchdowns: 0 },
          middle: { attempts: 15, yards: 87, success: 8, touchdowns: 1 },
          right: { attempts: 5, yards: 9, success: 2, touchdowns: 0 },
        },
      },
      {
        name: "Bingmon,Chase",
        key: "name:bingmon,chase",
        position: "RB",
        attempts: 11,
        yards: 23,
        touchdowns: 0,
        lineYards: 19.0,
        highlightYards: 4.0,
        opportunityRuns: 1,
        stuffedRuns: 3,
        successRuns: 3,
        lanes: {
          left: { attempts: 6, yards: 15, success: 2, touchdowns: 0 },
          middle: { attempts: 4, yards: 10, success: 1, touchdowns: 0 },
          right: { attempts: 1, yards: -2, success: 0, touchdowns: 0 },
        },
      },
      {
        name: "Byrd,Shadrick",
        key: "name:byrd,shadrick",
        position: "QB",
        attempts: 4,
        yards: 22,
        touchdowns: 0,
        lineYards: 14.0,
        highlightYards: 8.0,
        opportunityRuns: 1,
        stuffedRuns: 1,
        successRuns: 2,
        lanes: {
          left: { attempts: 1, yards: 6, success: 1, touchdowns: 0 },
          middle: { attempts: 2, yards: 14, success: 1, touchdowns: 0 },
          right: { attempts: 1, yards: 2, success: 0, touchdowns: 0 },
        },
      },
      {
        name: "McDowell,Lamagea",
        key: "name:mcdowell,lamagea",
        position: "RB",
        attempts: 5,
        yards: 6,
        touchdowns: 0,
        lineYards: 6.0,
        highlightYards: 0.0,
        opportunityRuns: 0,
        stuffedRuns: 1,
        successRuns: 0,
        lanes: {
          left: { attempts: 2, yards: 4, success: 0, touchdowns: 0 },
          middle: { attempts: 3, yards: 2, success: 0, touchdowns: 0 },
          right: { attempts: 0, yards: 0, success: 0, touchdowns: 0 },
        },
      },
      {
        name: "Bonner,Cameron",
        key: "name:bonner,cameron",
        position: "RB",
        attempts: 1,
        yards: -6,
        lineYards: -6.0,
        highlightYards: 0.0,
        opportunityRuns: 0,
        stuffedRuns: 1,
        successRuns: 0,
        touchdowns: 0,
        lanes: {
          left: { attempts: 1, yards: -6, success: 0, touchdowns: 0 },
          middle: { attempts: 0, yards: 0, success: 0, touchdowns: 0 },
          right: { attempts: 0, yards: 0, success: 0, touchdowns: 0 },
        },
      },
    ],
    opponent: {
      shortName: "JSU",
      metrics: {
        tflForced: 6.0,
        stuffRate: 0.196,
        powerStopRate: 0.500,
        oppAllowedRate: 0.304,
        firstDownSuccAllowed: 0.312,
        stopRate: 0.435,
      },
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// FORMATTERS & ANALYTICAL HELPERS
// ═══════════════════════════════════════════════════════════════
const fmtPct = (n) => `${Math.round((n ?? 0) * 100)}%`;
const fmt1 = (n) => (n ?? 0).toFixed(1);
const fmt2 = (n) => (n ?? 0).toFixed(2);

function getLastName(name) {
  if (!name.includes(",")) return name;
  return name.split(",")[0].trim();
}

function getDisplayName(name) {
  if (!name.includes(",")) return name;
  const parts = name.split(",");
  return `${parts[1].trim()} ${parts[0].trim()}`;
}

function getInitials(name) {
  if (!name.includes(",")) return name.slice(0, 2).toUpperCase();
  const parts = name.split(",");
  return `${parts[1].trim()[0] || ""}${parts[0].trim()[0] || ""}`;
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

// ─── TEAM SPLIT TABLES (ROW 1 - POLISHED PILL-SPLITS CONCEPT) ───
const TeamSplitPillTables = ({ data }) => {
  const accent = data.meta.colors.accent;

  const tables = [
    {
      title: "RB Created",
      color: accent,
      cols: [
        { label: "HL YDS", val: fmt1(data.team.highlightYards), sub: "yards past line" },
        { label: "HL/C", val: fmt2(data.team.highlightYpc), sub: "created ypc" },
        { label: "OPP RUNS", val: data.team.opportunityRuns, sub: "runs 5+ yds" },
      ],
    },
    {
      title: "Shared Flow",
      color: "#E53E3E",
      cols: [
        { label: "CARRIES", val: data.team.attempts, sub: "total rushes" },
        { label: "NET YDS", val: data.team.yards, sub: "game total" },
        { label: "AVG YPC", val: fmt2(data.team.ypc), sub: "yards/carry" },
      ],
    },
    {
      title: "OL Earned",
      color: "#F6AD55",
      cols: [
        { label: "LINE YDS", val: fmt1(data.team.lineYards), sub: "run blocking yds" },
        { label: "LY/C", val: fmt2(data.team.lineYpc), sub: "blocking ypc" },
        { label: "STUFF RATE", val: fmtPct(data.team.stuffRate), sub: "runs <= 0y" },
      ],
    },
  ];

  return (
    <Grid templateColumns="repeat(3, 1fr)" gap="8px" w="full">
      {tables.map((t) => (
        <VStack
          key={t.title}
          gap={0}
          align="stretch"
          bg="rgba(255,255,255,0.03)"
          border="1px solid whiteAlpha.100"
          borderLeft={`3px solid ${t.color}`}
          p="6px"
          borderRadius="sm"
          position="relative"
          _hover={{ bg: "rgba(255,255,255,0.05)" }}
        >
          {/* Section Heading Tag */}
          <Flex align="center" gap={1.5} pb="4px" borderBottom="1px solid whiteAlpha.100" mb="4px">
            <Text fontSize="8.5px" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.06em">
              {t.title}
            </Text>
          </Flex>

          {/* Value Columns Grid */}
          <Grid templateColumns="repeat(3, 1fr)" gap={2}>
            {t.cols.map((col) => (
              <Flex key={col.label} direction="column" align="center" justify="center">
                <Text
                  fontSize="clamp(12px, 0.9vw, 15px)"
                  color="text.primary"
                  fontWeight="950"
                  lineHeight={1.05}
                >
                  {col.val}
                </Text>
                <Text fontSize="6px" color="text.secondary" fontWeight="900" textTransform="uppercase" mt="2px" whiteSpace="nowrap">
                  {col.label}
                </Text>
                <Text fontSize="4.5px" color="text.muted" fontWeight="700" textTransform="uppercase" mt="0.5px" whiteSpace="nowrap">
                  {col.sub}
                </Text>
              </Flex>
            ))}
          </Grid>
        </VStack>
      ))}
    </Grid>
  );
};

// ─── PLAYER RUSHING TABLE (ROW 2 LEFT - COLOR CODED ADVANCED SP+ METRICS) ───
const PlayerTableD = ({ rushers, activeKey, onSelect, accentColor }) => {
  const headers = [
    { label: "Player", width: "1.1fr", align: "left" },
    { label: "Car", width: "0.5fr", align: "right" },
    { label: "Yds", width: "0.6fr", align: "right" },
    { label: "YPC", width: "0.6fr", align: "right" },
    { label: "LY/C", width: "0.6fr", align: "right" },
    { label: "SR", width: "0.7fr", align: "right" },
    { label: "Opp %", width: "0.7fr", align: "right" },
    { label: "Hil/Opp", width: "0.8fr", align: "right" },
  ];

  const templateColumns = headers.map((h) => h.width).join(" ");

  return (
    <VStack gap={0} align="stretch" w="full" h="full" minH={0}>
      {/* Table Headers */}
      <Grid templateColumns={templateColumns} gap={1} py="4px" borderBottom="1px solid whiteAlpha.200" flexShrink={0}>
        {headers.map((h) => (
          <Text
            key={h.label}
            fontSize="7.5px"
            fontWeight="900"
            color="text.muted"
            textTransform="uppercase"
            letterSpacing="0.05em"
            textAlign={h.align}
          >
            {h.label}
          </Text>
        ))}
      </Grid>

      {/* Roster list */}
      <Box flex={1} overflowY="auto">
        {rushers.map((p) => {
          const isActive = p.key === activeKey;
          const ypc = p.attempts > 0 ? p.yards / p.attempts : 0;
          const lyc = p.attempts > 0 ? p.lineYards / p.attempts : 0;
          const sr = p.attempts > 0 ? p.successRuns / p.attempts : 0;
          const oppRate = p.attempts > 0 ? p.opportunityRuns / p.attempts : 0;
          const hilOpp = p.opportunityRuns > 0 ? p.highlightYards / p.opportunityRuns : 0;

          // Color Indicators for Usage & Efficiency
          const carColor = p.attempts >= 10 ? "text.primary" : "text.secondary";
          const carFontWeight = p.attempts >= 10 ? "950" : "800";
          
          let srColor = "text.secondary";
          if (p.attempts >= 3) {
            if (sr >= 0.45) srColor = "#48BB78"; // High-efficiency green
            else if (sr <= 0.25) srColor = "#E53E3E"; // Struggling efficiency red
          }

          let hilOppColor = "text.secondary";
          if (p.opportunityRuns > 0 && hilOpp >= 3.0) {
            hilOppColor = "#F6AD55"; // Gold explosive highlight yards/opp
          }

          return (
            <Grid
              key={p.key}
              templateColumns={templateColumns}
              gap={1}
              py="5px"
              alignItems="center"
              cursor="pointer"
              bg={isActive ? "whiteAlpha.100" : "transparent"}
              borderLeft={isActive ? `3px solid ${accentColor}` : "3px solid transparent"}
              borderBottom="1px solid whiteAlpha.50"
              _hover={{ bg: "whiteAlpha.50" }}
              onClick={() => onSelect(p)}
            >
              {/* Last Name Only */}
              <Box minW={0} pl="2px">
                <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight="950" color="text.primary" truncate>
                  {getLastName(p.name)}
                </Text>
                <Text fontSize="6px" color="text.muted" fontWeight="900" textTransform="uppercase">
                  {p.position}
                </Text>
              </Box>

              {/* Carries */}
              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight={carFontWeight} color={carColor} textAlign="right">
                {p.attempts}
              </Text>

              {/* Yards (No Bar underneath, keeping it clean) */}
              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight="950" color="text.primary" textAlign="right">
                {p.yards}
              </Text>

              {/* YPC */}
              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight="900" color="text.primary" textAlign="right">
                {fmt1(ypc)}
              </Text>

              {/* LY/C */}
              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight="800" color="text.secondary" textAlign="right">
                {fmt1(lyc)}
              </Text>

              {/* Success Rate (Color-coded) */}
              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight="900" color={srColor} textAlign="right">
                {fmtPct(sr)}
              </Text>

              {/* Opportunity % */}
              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight="800" color="text.secondary" textAlign="right">
                {fmtPct(oppRate)}
              </Text>

              {/* Hil/Opp (Color-coded Gold for explosive plays) */}
              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight="950" color={hilOppColor} textAlign="right">
                {fmt1(hilOpp)}
              </Text>
            </Grid>
          );
        })}
      </Box>
    </VStack>
  );
};

// ─── PLAYER SPOTLIGHT WIDGET (ROW 2 RIGHT - TALL HIGH REAL-ESTATE PROFILE) ───
const PlayerSpotlightD = ({ player, teamColors }) => {
  const att = player.attempts;
  const stuffed = player.stuffedRuns;
  const opp = player.opportunityRuns;
  const blocked = Math.max(0, att - stuffed - opp);

  const stuffedPct = att > 0 ? (stuffed / att) * 100 : 0;
  const blockedPct = att > 0 ? (blocked / att) * 100 : 0;
  const oppPct = att > 0 ? (opp / att) * 100 : 0;

  const sr = att > 0 ? player.successRuns / att : 0;
  const ypc = att > 0 ? player.yards / att : 0;

  return (
    <VStack gap="6px" align="stretch" w="full" h="full" minH={0}>
      {/* ── Spotlight Header: Large Avatar Left (88px) | Info + Basic Stats + Signature Right ── */}
      <Grid templateColumns="88px 1fr" gap="8px" border="1px solid whiteAlpha.100" p="6px" borderRadius="sm" bg="rgba(255,255,255,0.02)">
        {/* Large Avatar Block */}
        <Flex
          w="88px"
          h="88px"
          borderRadius="sm"
          bg={teamColors.primary}
          align="center"
          justify="center"
          border={`2px solid ${teamColors.accent || "#4A90D9"}`}
          flexShrink={0}
          position="relative"
          boxShadow="0 4px 10px rgba(0,0,0,0.3)"
        >
          <Text fontSize="30px" fontWeight="950" color="white" letterSpacing="-0.06em">
            {getInitials(player.name)}
          </Text>
          <Box
            position="absolute"
            bottom="2px"
            right="3px"
            px="4px"
            py="1px"
            bg="black"
            borderRadius="xs"
            border="1px solid whiteAlpha.200"
          >
            <Text fontSize="6px" fontWeight="900" color="text.primary">
              {player.position}
            </Text>
          </Box>
        </Flex>

        {/* Info, Stats Grid & Signature Bar */}
        <VStack align="stretch" justify="center" gap="4px" minW={0}>
          {/* Name & Kicker */}
          <Box minW={0}>
            <Text fontSize="clamp(13px, 1.1vw, 16px)" fontWeight="950" color="text.primary" truncate>
              {getDisplayName(player.name)}
            </Text>
            <Text fontSize="7px" color="text.muted" fontWeight="800" textTransform="uppercase" letterSpacing="0.04em">
              SELECTED PLAYER PROFILE SPOTLIGHT
            </Text>
          </Box>

          {/* Mini Basic Stats Grid */}
          <Grid templateColumns="repeat(4, 1fr)" gap="3px" py="2px" borderY="1px solid whiteAlpha.100">
            <Flex direction="column" align="center">
              <Text fontSize="10px" fontWeight="950" color="text.primary" lineHeight={1}>
                {player.attempts}
              </Text>
              <Text fontSize="5px" color="text.muted" fontWeight="900" mt="1.5px">CARRIES</Text>
            </Flex>
            <Flex direction="column" align="center">
              <Text fontSize="10px" fontWeight="950" color={teamColors.accent || "#4A90D9"} lineHeight={1}>
                {player.yards}
              </Text>
              <Text fontSize="5px" color="text.muted" fontWeight="900" mt="1.5px">YARDS</Text>
            </Flex>
            <Flex direction="column" align="center">
              <Text fontSize="10px" fontWeight="950" color="text.primary" lineHeight={1}>
                {fmt1(ypc)}
              </Text>
              <Text fontSize="5px" color="text.muted" fontWeight="900" mt="1.5px">YPC</Text>
            </Flex>
            <Flex direction="column" align="center">
              <Text fontSize="10px" fontWeight="950" color={sr >= 0.45 ? "#48BB78" : sr <= 0.25 ? "#E53E3E" : "text.secondary"} lineHeight={1}>
                {fmtPct(sr)}
              </Text>
              <Text fontSize="5px" color="text.muted" fontWeight="900" mt="1.5px">SUCCESS %</Text>
            </Flex>
          </Grid>

          {/* Rushing Anatomy Signature Bar */}
          <VStack align="stretch" gap="1px" w="full" mt="1px">
            <Box h="7px" w="full" bg="whiteAlpha.100" borderRadius="full" overflow="hidden" display="flex">
              {stuffedPct > 0 && <Box h="full" w={`${stuffedPct}%`} bg="#E53E3E" />}
              {blockedPct > 0 && <Box h="full" w={`${blockedPct}%`} bg="#4A90D9" />}
              {oppPct > 0 && <Box h="full" w={`${oppPct}%`} bg="#48BB78" />}
            </Box>
            <Grid templateColumns="repeat(3, 1fr)" gap="1px">
              <Text fontSize="5.5px" fontWeight="800" color="text.muted" textTransform="uppercase" whiteSpace="nowrap">
                STUFF: {fmtPct(stuffedPct / 100)}
              </Text>
              <Text fontSize="5.5px" fontWeight="800" color="text.muted" textTransform="uppercase" whiteSpace="nowrap" textAlign="center">
                BLOCK: {fmtPct(blockedPct / 100)}
              </Text>
              <Text fontSize="5.5px" fontWeight="800" color="text.muted" textTransform="uppercase" whiteSpace="nowrap" textAlign="right">
                EXPL: {fmtPct(oppPct / 100)}
              </Text>
            </Grid>
          </VStack>
        </VStack>
      </Grid>

      {/* ── TALL 3x1 LANE GRID DECK (NO ARROWS, VERTICALLY RICH STRUCTURE) ── */}
      <Grid templateColumns="repeat(3, 1fr)" gap="6px" flex={1} minH={0}>
        {["left", "middle", "right"].map((k) => {
          const lane = player.lanes[k];
          const laneSR = lane.attempts > 0 ? lane.success / lane.attempts : 0;
          const laneYpc = lane.attempts > 0 ? lane.yards / lane.attempts : 0;
          
          const label = k === "left" ? "← LEFT LANE" : k === "middle" ? "↑ MIDDLE LANE" : "RIGHT LANE →";
          const themeColor = k === "left" ? "#4A90D9" : k === "middle" ? "#48BB78" : "#F6AD55";

          return (
            <Flex
              key={k}
              direction="column"
              justify="space-between"
              p="8px"
              bg="rgba(255,255,255,0.02)"
              border="1px solid whiteAlpha.100"
              borderTop={`3px solid ${themeColor}`}
              borderRadius="sm"
              position="relative"
              _hover={{ bg: "rgba(255,255,255,0.04)", borderTopWidth: "4px" }}
            >
              {/* Lane Direction Kicker */}
              <Flex align="center" gap={1}>
                <Box w="3px" h="3px" bg={themeColor} borderRadius="full" />
                <Text fontSize="7px" color="text.muted" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em">
                  {label}
                </Text>
              </Flex>

              {/* Massive Hero YPC Metric */}
              <VStack align="stretch" gap={0} my="auto" py={1}>
                <Text fontSize="clamp(20px, 1.6vw, 26px)" color="text.primary" fontWeight="950" lineHeight={1.0} letterSpacing="-0.04em">
                  {lane.attempts > 0 ? `${fmt1(laneYpc)}` : "—"}
                </Text>
                <Text fontSize="6px" color="text.muted" fontWeight="900" textTransform="uppercase">
                  YARDS PER CARRY
                </Text>
              </VStack>

              {/* Structured Lane Details Bottom */}
              <VStack align="stretch" gap="3px" borderTop="1px solid whiteAlpha.100" pt="4px">
                {/* Success Rate Pill */}
                <Flex align="center" justify="space-between">
                  <Text fontSize="6px" color="text.muted" fontWeight="800">SUCC RATE</Text>
                  <Text
                    fontSize="7px"
                    fontWeight="950"
                    color={laneSR >= 0.45 ? "#48BB78" : laneSR <= 0.20 && lane.attempts > 0 ? "#E53E3E" : "text.primary"}
                  >
                    {lane.attempts > 0 ? fmtPct(laneSR) : "—"}
                  </Text>
                </Flex>
                {/* Volume Details */}
                <Flex align="center" justify="space-between">
                  <Text fontSize="6px" color="text.muted" fontWeight="800">VOLUME</Text>
                  <Text fontSize="6.5px" color="text.secondary" fontWeight="900" textTransform="uppercase">
                    {lane.attempts} CAR · {lane.yards} YDS
                  </Text>
                </Flex>
              </VStack>
            </Flex>
          );
        })}
      </Grid>
    </VStack>
  );
};

// ─── DEFENSIVE RUSHING DISRUPTION INDEX (ROW 3 - 6x1 HIGH PRESSURE MATRIX) ───
const DefensiveDisruptionIndex = ({ opponent }) => {
  const metrics = [
    {
      label: "Stop Rate",
      value: opponent.metrics.stopRate,
      sub: "stuffed/failed rushes",
      color: "#F6AD55",
      desc: "Stop % on all carries"
    },
    {
      label: "Stuff Rate",
      value: opponent.metrics.stuffRate,
      sub: "tackles behind LOS",
      color: "#E53E3E",
      desc: "Rushes stopped <= 0 yds"
    },
    {
      label: "TFL Force",
      value: opponent.metrics.tflForced / 10,
      displayVal: `${fmt1(opponent.metrics.tflForced)}`,
      sub: "total backfield TFLs",
      color: "#E53E3E",
      desc: "Tackles for loss forced"
    },
    {
      label: "Power Stoppage",
      value: opponent.metrics.powerStopRate,
      sub: "short yardage stops",
      color: "#F6AD55",
      desc: "Short yardage leverage stop %"
    },
    {
      label: "1D Success Allowed",
      value: opponent.metrics.firstDownSuccAllowed,
      sub: "first down leverage",
      color: "#48BB78",
      desc: "1D rushing success rate allowed"
    },
    {
      label: "Opp Allowed",
      value: opponent.metrics.oppAllowedRate,
      sub: "prevent 5+ yd runs",
      color: "#4A90D9",
      desc: "Opportunity % allowed to rushers"
    },
  ];

  return (
    <Box px="8px" py="6px" borderTop="1px solid whiteAlpha.100" flexShrink={0} bg="rgba(0,0,0,0.2)">
      {/* Title */}
      <Flex align="center" gap={1.5} mb="4px">
        <Box w="3px" h="11px" bg="#E53E3E" borderRadius="sm" />
        <Text fontSize="8px" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.06em">
          {opponent.shortName} Defensive Rushing Disruption Index (Leverage & Disruptive Indicators)
        </Text>
      </Flex>

      {/* Grid of disruption metrics */}
      <Grid templateColumns="repeat(6, 1fr)" gap="6px">
        {metrics.map((m) => {
          const displayVal = m.displayVal || fmtPct(m.value);
          const barWidth = `${Math.min(100, m.value * 100)}%`;
          
          return (
            <Flex
              key={m.label}
              direction="column"
              justify="center"
              px="6px"
              py="4.5px"
              bg="rgba(255,255,255,0.015)"
              border="1px solid whiteAlpha.100"
              borderRadius="sm"
              position="relative"
              _hover={{ bg: "rgba(255,255,255,0.03)" }}
            >
              {/* Label and Big Value */}
              <Flex justify="space-between" align="baseline" mb="2px">
                <Text fontSize="7px" fontWeight="950" color="text.secondary" truncate maxW="65%">
                  {m.label}
                </Text>
                <Text fontSize="10px" fontWeight="950" color={m.color} whiteSpace="nowrap">
                  {displayVal}
                </Text>
              </Flex>

              {/* Progress Bullet Line */}
              <Box h="2.5px" w="full" bg="whiteAlpha.100" borderRadius="full" overflow="hidden" my="2px">
                <Box h="full" w={barWidth} bg={m.color} borderRadius="full" />
              </Box>

              {/* Small details */}
              <Text fontSize="5px" color="text.muted" fontWeight="800" textTransform="uppercase" truncate>
                {m.sub}
              </Text>
            </Flex>
          );
        })}
      </Grid>
    </Box>
  );
};

// ─── COMPANION DENSITY ORCHESTRATOR FOR SINGLE TEAM PANEL ───
const TeamRushingPanelD = ({ teamKey }) => {
  const data = TEAMS[teamKey];
  const [selectedPlayer, setSelectedPlayer] = useState(data.rushers[0]);

  const primary = data.meta.colors.primary;
  const accent = data.meta.colors.accent;

  return (
    <Flex direction="column" w="full" h="full" minH={0} bg="rgba(0,0,0,0.15)">
      {/* ── ROW 1: Heading & Polished Split Pill-Tables ── */}
      <Flex
        direction="column"
        gap="6px"
        px={2}
        py="6px"
        bg={`linear-gradient(90deg, ${primary}33 0%, transparent 72%)`}
        borderBottom="1px solid whiteAlpha.100"
        flexShrink={0}
      >
        <Flex align="center" gap={2}>
          <Box w="3px" h="14px" bg={accent} borderRadius="sm" />
          <Text fontSize="clamp(11px, 1vw, 14px)" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em">
            {data.meta.shortName} Rushing Production (Variant D)
          </Text>
        </Flex>
        <TeamSplitPillTables data={data} />
      </Flex>

      {/* ── ROW 2: Player Table & Spotlight ── */}
      <Flex flex={1} minH={0} overflow="hidden">
        {/* Advanced SP+ Table (Left 58%) */}
        <Box w="58%" p="5px" borderRight="1px solid whiteAlpha.100" display="flex" flexDirection="column" minH={0}>
          <PlayerTableD
            rushers={data.rushers}
            activeKey={selectedPlayer.key}
            onSelect={setSelectedPlayer}
            accentColor={accent}
          />
        </Box>

        {/* Tall Player Spotlight (Right 42%) */}
        <Box w="42%" p="6px" minH={0}>
          <PlayerSpotlightD
            player={selectedPlayer}
            teamColors={data.meta.colors}
          />
        </Box>
      </Flex>

      {/* ── ROW 3: Defensive Rushing Disruption Index ── */}
      <DefensiveDisruptionIndex opponent={data.opponent} />
    </Flex>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT (4x2 split layout)
// ═══════════════════════════════════════════════════════════════
export const GameProductionRushingD = () => {
  return (
    <Flex w="full" h="full" bg="bg.secondary" borderRadius="lg" overflow="hidden" border="1px solid whiteAlpha.100">
      <Box flex={1} minW={0} borderRight="1px solid whiteAlpha.100">
        <TeamRushingPanelD teamKey="jsu" />
      </Box>
      <Box flex={1} minW={0}>
        <TeamRushingPanelD teamKey="pvamu" />
      </Box>
    </Flex>
  );
};
