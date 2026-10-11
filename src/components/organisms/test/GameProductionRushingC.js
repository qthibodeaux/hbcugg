import { useState } from "react";
import {
  Box,
  Flex,
  Grid,
  Text,
  VStack,
} from "@chakra-ui/react";

// ═══════════════════════════════════════════════════════════════
// AUTHENTIC PLAYLOAD (JSU vs PVAMU) — WITH ENRICHED SP+ METRICS
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
  const [last, first] = name.split(",");
  return `${first.trim()} ${last.trim()}`;
}

function getInitials(name) {
  if (!name.includes(",")) return name.slice(0, 2).toUpperCase();
  const parts = name.split(",");
  return `${parts[1].trim()[0] || ""}${parts[0].trim()[0] || ""}`;
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

// ─── TEAM SPLIT TABLES (ROW 1 - THE RB/SHARED/OL BLOCKS) ───
const TeamSplitTables = ({ data }) => {
  const accent = data.meta.colors.accent;

  const tables = [
    {
      title: "RB Created",
      color: accent,
      cols: [
        { label: "HL YDS", val: fmt1(data.team.highlightYards) },
        { label: "HL/C", val: fmt2(data.team.highlightYpc) },
        { label: "OPP RUNS", val: data.team.opportunityRuns },
      ],
    },
    {
      title: "Shared Flow",
      color: "#E53E3E",
      cols: [
        { label: "CARRIES", val: data.team.attempts },
        { label: "NET YDS", val: data.team.yards },
        { label: "AVG YPC", val: fmt2(data.team.ypc) },
      ],
    },
    {
      title: "OL Earned",
      color: "#F6AD55",
      cols: [
        { label: "LINE YDS", val: fmt1(data.team.lineYards) },
        { label: "LY/C", val: fmt2(data.team.lineYpc) },
        { label: "STUFF RATE", val: fmtPct(data.team.stuffRate) },
      ],
    },
  ];

  return (
    <Grid templateColumns="repeat(3, 1fr)" gap="6px" w="full">
      {tables.map((t) => (
        <VStack key={t.title} gap={0} align="stretch" bg="rgba(255,255,255,0.01)" border="1px solid whiteAlpha.50" p="4px" borderRadius="sm">
          {/* Header */}
          <Flex align="center" gap={1} pb="2px" borderBottom="1px solid whiteAlpha.100" mb="2px">
            <Box w="2px" h="8px" bg={t.color} borderRadius="sm" />
            <Text fontSize="7.5px" color="text.primary" fontWeight="900" textTransform="uppercase" letterSpacing="0.04em">
              {t.title}
            </Text>
          </Flex>
          {/* Values Row */}
          <Grid templateColumns="repeat(3, 1fr)" gap={1}>
            {t.cols.map((col) => (
              <Flex key={col.label} direction="column" align="center">
                <Text fontSize="clamp(10px, 0.85vw, 12px)" color="text.primary" fontWeight="950" lineHeight={1.1}>
                  {col.val}
                </Text>
                <Text fontSize="5.5px" color="text.muted" fontWeight="800" textTransform="uppercase" mt="1.5px">
                  {col.label}
                </Text>
              </Flex>
            ))}
          </Grid>
        </VStack>
      ))}
    </Grid>
  );
};

// ─── PLAYER RUSHING TABLE (ROW 2 LEFT) ───
const PlayerTableC = ({ rushers, activeKey, onSelect, accentColor }) => {
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
      <Grid templateColumns={templateColumns} gap={1} py="3px" borderBottom="1px solid whiteAlpha.200" flexShrink={0}>
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

          return (
            <Grid
              key={p.key}
              templateColumns={templateColumns}
              gap={1}
              py="4.5px"
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
                <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight="900" color="text.primary" truncate>
                  {getLastName(p.name)}
                </Text>
                <Text fontSize="6px" color="text.muted" fontWeight="800" textTransform="uppercase">
                  {p.position}
                </Text>
              </Box>

              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight="850" color="text.secondary" textAlign="right">
                {p.attempts}
              </Text>

              {/* Yards (No Bar) */}
              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight="950" color="text.primary" textAlign="right">
                {p.yards}
              </Text>

              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight="900" color="text.primary" textAlign="right">
                {fmt1(ypc)}
              </Text>

              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight="800" color="text.secondary" textAlign="right">
                {fmt1(lyc)}
              </Text>

              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight="800" color="text.secondary" textAlign="right">
                {fmtPct(sr)}
              </Text>

              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight="800" color="text.secondary" textAlign="right">
                {fmtPct(oppRate)}
              </Text>

              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight="900" color={hilOpp > 2 ? accentColor : "text.secondary"} textAlign="right">
                {fmt1(hilOpp)}
              </Text>
            </Grid>
          );
        })}
      </Box>
    </VStack>
  );
};

// ─── PLAYER SPOTLIGHT WIDGET (ROW 2 RIGHT - TALL INTEGRATED PROFILE) ───
const PlayerSpotlightC = ({ player, teamColors }) => {
  const att = player.attempts;
  const stuffed = player.stuffedRuns;
  const opp = player.opportunityRuns;
  const blocked = Math.max(0, att - stuffed - opp);

  const stuffedPct = att > 0 ? (stuffed / att) * 100 : 0;
  const blockedPct = att > 0 ? (blocked / att) * 100 : 0;
  const oppPct = att > 0 ? (opp / att) * 100 : 0;

  // const sr = att > 0 ? player.successRuns / att : 0;
  // const ypc = att > 0 ? player.yards / att : 0;

  return (
    <VStack gap="8px" align="stretch" w="full" h="full" minH={0}>
      {/* ── Spotlight Header: Avatar Left (72px) | Info + Signature Right ── */}
      <Grid templateColumns="72px 1fr" gap="8px" border="1px solid whiteAlpha.100" p="6px" borderRadius="sm" bg="rgba(255,255,255,0.02)">
        {/* Large Avatar */}
        <Flex w="72px" h="72px" borderRadius="sm" bg={teamColors.primary} align="center" justify="center" border="1px solid whiteAlpha.200" flexShrink={0}>
          <Text fontSize="24px" fontWeight="950" color="white" letterSpacing="-0.05em">
            {getInitials(player.name)}
          </Text>
        </Flex>

        {/* Info & Nested Signature Bar */}
        <VStack align="stretch" justify="center" gap="4px" minW={0}>
          <Flex justify="space-between" align="baseline" minW={0}>
            <Text fontSize="clamp(13px, 1.1vw, 16px)" fontWeight="950" color="text.primary" truncate maxW="60%">
              {getDisplayName(player.name)}
            </Text>
            {/* Stats Summary Line */}
            <Text fontSize="clamp(9px, 0.8vw, 11px)" fontWeight="900" color={teamColors.accent || "#4A90D9"} whiteSpace="nowrap">
              {player.attempts} CAR · {player.yards} YDS · {player.touchdowns} TD
            </Text>
          </Flex>

          <Text fontSize="7px" color="text.muted" fontWeight="800" textTransform="uppercase" lineHeight={1}>
            {player.position} selected player signature
          </Text>

          {/* Nested Rushing Anatomy Strip */}
          <VStack align="stretch" gap="2px" w="full" mt="2px">
            <Box h="7px" w="full" bg="whiteAlpha.100" borderRadius="full" overflow="hidden" display="flex">
              {stuffedPct > 0 && <Box h="full" w={`${stuffedPct}%`} bg="#E53E3E" />}
              {blockedPct > 0 && <Box h="full" w={`${blockedPct}%`} bg="#4A90D9" />}
              {oppPct > 0 && <Box h="full" w={`${oppPct}%`} bg="#48BB78" />}
            </Box>
            <Grid templateColumns="repeat(3, 1fr)" gap="1px">
              <Text fontSize="6px" fontWeight="800" color="text.muted">
                STUFF: {fmtPct(stuffedPct / 100)}
              </Text>
              <Text fontSize="6px" fontWeight="800" color="text.muted">
                BLOCK: {fmtPct(blockedPct / 100)}
              </Text>
              <Text fontSize="6px" fontWeight="800" color="text.muted">
                EXPL: {fmtPct(oppPct / 100)}
              </Text>
            </Grid>
          </VStack>
        </VStack>
      </Grid>

      {/* ── TALL 3x1 LANE GRID (NO MASSIVE SVG ARROWS) ── */}
      <Grid templateColumns="repeat(3, 1fr)" gap="4px" flex={1} minH={0}>
        {["left", "middle", "right"].map((k) => {
          const lane = player.lanes[k];
          const laneSR = lane.attempts > 0 ? lane.success / lane.attempts : 0;
          const laneYpc = lane.attempts > 0 ? lane.yards / lane.attempts : 0;
          const label = k === "left" ? "← LEFT" : k === "middle" ? "↑ MIDDLE" : "RIGHT →";

          return (
            <Flex
              key={k}
              direction="column"
              justify="space-between"
              p="8px"
              bg="rgba(255,255,255,0.02)"
              border="1px solid whiteAlpha.100"
              borderRadius="sm"
            >
              {/* Direction Indicator Kicker */}
              <Text fontSize="8px" color="text.muted" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em">
                {label}
              </Text>

              {/* Big Performance Figures */}
              <Box my="auto">
                <Text fontSize="clamp(18px, 1.4vw, 24px)" color="text.primary" fontWeight="950" lineHeight={1.05}>
                  {lane.attempts > 0 ? `${fmt1(laneYpc)}y` : "—"}
                </Text>
                <Text fontSize="clamp(9px, 0.8vw, 11px)" color={laneSR >= 0.45 ? "#48BB78" : laneSR <= 0.20 && lane.attempts > 0 ? "#E53E3E" : "text.secondary"} fontWeight="900" mt="2px">
                  {lane.attempts > 0 ? `${fmtPct(laneSR)} SR` : "no runs"}
                </Text>
              </Box>

              {/* Card Footer Detail */}
              <Text fontSize="6.5px" color="text.muted" fontWeight="800" textTransform="uppercase">
                {lane.attempts} CAR · {lane.yards} YDS
              </Text>
            </Flex>
          );
        })}
      </Grid>
    </VStack>
  );
};

// ─── DEFENSIVE LEVERAGE & DISRUPTION METERS (ROW 3) ───
const DefensiveLeverageMeters = ({ opponent }) => {
  const metrics = [
    { label: "Stuff Rate Forced", value: opponent.metrics.stuffRate, sub: "stops at/behind LOS", color: "#E53E3E" },
    { label: "TFL Forced", value: opponent.metrics.tflForced / 10, displayVal: `${fmt1(opponent.metrics.tflForced)}`, sub: "backfield tackles", color: "#E53E3E" },
    { label: "Power Run Stop Rate", value: opponent.metrics.powerStopRate, sub: "short yardage stop", color: "#F6AD55" },
    { label: "Opportunity Allowed", value: opponent.metrics.oppAllowedRate, sub: "prevent 5+ yd runs", color: "#4A90D9" },
    { label: "1D Rush Success Allowed", value: opponent.metrics.firstDownSuccAllowed, sub: "first down leverage", color: "#48BB78" },
  ];

  return (
    <Box px="6px" py="5px" borderTop="1px solid whiteAlpha.100" flexShrink={0}>
      <Flex align="center" gap={1.5} mb="4px">
        <Box w="3px" h="11px" bg="#F6AD55" borderRadius="sm" />
        <Text fontSize="7.5px" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.06em">
          {opponent.shortName} Defensive Rushing Disruption Index
        </Text>
      </Flex>
      <Grid templateColumns="repeat(5, 1fr)" gap="4px">
        {metrics.map((m) => {
          const displayVal = m.displayVal || fmtPct(m.value);
          const barWidth = `${Math.min(100, m.value * 100)}%`;
          return (
            <Flex
              key={m.label}
              direction="column"
              justify="center"
              px="5px"
              py="4px"
              bg="rgba(255,255,255,0.015)"
              border="1px solid whiteAlpha.100"
              borderRadius="sm"
            >
              <Flex justify="space-between" align="center" mb="2px">
                <Text fontSize="7px" fontWeight="900" color="text.secondary" truncate maxW="70%">
                  {m.label}
                </Text>
                <Text fontSize="9px" fontWeight="950" color={m.color} whiteSpace="nowrap">
                  {displayVal}
                </Text>
              </Flex>
              {/* Bullet bar gauge */}
              <Box h="2.5px" w="full" bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
                <Box h="full" w={barWidth} bg={m.color} borderRadius="full" />
              </Box>
              <Text fontSize="5.5px" color="text.muted" fontWeight="800" textTransform="uppercase" mt="2px">
                {m.sub}
              </Text>
            </Flex>
          );
        })}
      </Grid>
    </Box>
  );
};

// ─── COMPANION ORCHESTRATOR FOR SINGLE PANEL ───
const TeamRushingPanelC = ({ teamKey }) => {
  const data = TEAMS[teamKey];
  const [selectedPlayer, setSelectedPlayer] = useState(data.rushers[0]);

  const primary = data.meta.colors.primary;
  const accent = data.meta.colors.accent;

  return (
    <Flex direction="column" w="full" h="full" minH={0} bg="rgba(0,0,0,0.12)">
      {/* ── ROW 1: Header & RB/Shared/OL Split Tables ── */}
      <Flex
        direction="column"
        gap="5px"
        px={2}
        py="6px"
        bg={`linear-gradient(90deg, ${primary}33 0%, transparent 72%)`}
        borderBottom="1px solid whiteAlpha.100"
        flexShrink={0}
      >
        <Flex align="center" gap={2}>
          <Box w="3px" h="14px" bg={accent} borderRadius="sm" />
          <Text fontSize="clamp(11px, 1vw, 14px)" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em">
            {data.meta.shortName} Rushing Production (Variant C)
          </Text>
        </Flex>
        <TeamSplitTables data={data} />
      </Flex>

      {/* ── ROW 2: Player Table & Spotlight ── */}
      <Flex flex={1} minH={0} overflow="hidden">
        {/* Advanced SP+ Table (Left 58%) */}
        <Box w="58%" p="5px" borderRight="1px solid whiteAlpha.100" display="flex" flexDirection="column" minH={0}>
          <PlayerTableC
            rushers={data.rushers}
            activeKey={selectedPlayer.key}
            onSelect={setSelectedPlayer}
            accentColor={accent}
          />
        </Box>

        {/* Tall Player Spotlight (Right 42%) */}
        <Box w="42%" p="6px" minH={0}>
          <PlayerSpotlightC
            player={selectedPlayer}
            teamColors={data.meta.colors}
          />
        </Box>
      </Flex>

      {/* ── ROW 3: Defensive Rushing Disruption Index ── */}
      <DefensiveLeverageMeters opponent={data.opponent} />
    </Flex>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT (4x2 split layout)
// ═══════════════════════════════════════════════════════════════
export const GameProductionRushingC = () => {
  return (
    <Flex w="full" h="full" bg="bg.secondary" borderRadius="lg" overflow="hidden" border="1px solid whiteAlpha.100">
      <Box flex={1} minW={0} borderRight="1px solid whiteAlpha.100">
        <TeamRushingPanelC teamKey="jsu" />
      </Box>
      <Box flex={1} minW={0}>
        <TeamRushingPanelC teamKey="pvamu" />
      </Box>
    </Flex>
  );
};
