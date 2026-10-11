import { useState } from "react";
import {
  Box,
  Flex,
  Grid,
  Text,
  VStack,
} from "@chakra-ui/react";

// ═══════════════════════════════════════════════════════════════
// REAL & MODEL-DERIVED ADVANCED FOOTBALL PAYLOAD (JSU vs PVAMU)
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
        stuffRate: 0.231,
        stopRate: 0.423,
        opportunityRate: 0.423,
        tflRate: 0.095,
        havocRate: 0.167,
        explosivePrevention: 0.881,
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
        stuffRate: 0.196,
        stopRate: 0.435,
        opportunityRate: 0.304,
        tflRate: 0.079,
        havocRate: 0.132,
        explosivePrevention: 0.855,
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

// ─── TEAM RUSHING SUMMARY (ROW 1) ───
const TeamSummaryStrip = ({ data }) => {
  // const accent = data.meta.colors.accent;

  const cards = [
    { label: "Attempts", value: data.team.attempts, details: `${data.team.touchdowns} TDs` },
    { label: "Rushing Yds", value: data.team.yards, details: `${fmt1(data.team.ypc)} YPC` },
    { label: "OL Line Yds", value: fmt1(data.team.lineYards), details: `${fmt2(data.team.lineYpc)} LY/C` },
    { label: "Opportunity %", value: fmtPct(data.team.opportunityRate), details: `${data.team.opportunityRuns} Runs (5+ yds)` },
    { label: "Success Rate", value: fmtPct(data.team.rushSuccessRate), details: `${data.team.successfulRuns} Succ Runs` },
    { label: "Stuff Rate", value: fmtPct(data.team.stuffRate), details: `${data.team.stuffedRuns} Runs <= 0y` },
  ];

  return (
    <Grid templateColumns="repeat(6, 1fr)" gap="4px" w="full">
      {cards.map((c) => (
        <Flex
          key={c.label}
          direction="column"
          justify="center"
          px="6px"
          py="4px"
          bg="rgba(255,255,255,0.03)"
          border="1px solid whiteAlpha.100"
          borderRadius="sm"
        >
          <Text fontSize="clamp(7px, 0.62vw, 9px)" color="text.muted" fontWeight="800" textTransform="uppercase">
            {c.label}
          </Text>
          <Text fontSize="clamp(13px, 1.1vw, 16px)" color="text.primary" fontWeight="950" mt="1px">
            {c.value}
          </Text>
          <Text fontSize="6px" color="text.muted" fontWeight="700" textTransform="uppercase" mt="1px">
            {c.details}
          </Text>
        </Flex>
      ))}
    </Grid>
  );
};

// ─── STACKED RUSHING ANATOMY STRIP ───
const RushingAnatomyStrip = ({ player }) => {
  const att = player.attempts;
  const stuffed = player.stuffedRuns;
  const opp = player.opportunityRuns;
  const blocked = Math.max(0, att - stuffed - opp);

  const stuffedPct = (stuffed / att) * 100;
  const blockedPct = (blocked / att) * 100;
  const oppPct = (opp / att) * 100;

  return (
    <VStack align="stretch" gap="6px" w="full" py="4px">
      <Flex justify="space-between" align="center">
        <Text fontSize="clamp(8px, 0.72vw, 10px)" fontWeight="900" color="text.primary" textTransform="uppercase" letterSpacing="0.05em">
          Rushing Signature
        </Text>
        <Text fontSize="clamp(7px, 0.65vw, 9px)" fontWeight="800" color="text.muted" textTransform="uppercase">
          Carries Anatomy Split
        </Text>
      </Flex>

      {/* Stacked Progress Bar */}
      <Box h="10px" w="full" bg="whiteAlpha.100" borderRadius="sm" overflow="hidden" display="flex">
        {stuffedPct > 0 && (
          <Box h="full" w={`${stuffedPct}%`} bg="#E53E3E" transition="width 0.3s" />
        )}
        {blockedPct > 0 && (
          <Box h="full" w={`${blockedPct}%`} bg="#4A90D9" transition="width 0.3s" />
        )}
        {oppPct > 0 && (
          <Box h="full" w={`${oppPct}%`} bg="#48BB78" transition="width 0.3s" />
        )}
      </Box>

      {/* Legend Grid */}
      <Grid templateColumns="repeat(3, 1fr)" gap={2}>
        <Flex align="center" gap="4px">
          <Box w="6px" h="6px" bg="#E53E3E" borderRadius="full" />
          <Text fontSize="8px" fontWeight="800" color="text.secondary">
            STUFFED: {stuffed} ({Math.round(stuffedPct)}%)
          </Text>
        </Flex>
        <Flex align="center" gap="4px">
          <Box w="6px" h="6px" bg="#4A90D9" borderRadius="full" />
          <Text fontSize="8px" fontWeight="800" color="text.secondary">
            OL BLOCK: {blocked} ({Math.round(blockedPct)}%)
          </Text>
        </Flex>
        <Flex align="center" gap="4px">
          <Box w="6px" h="6px" bg="#48BB78" borderRadius="full" />
          <Text fontSize="8px" fontWeight="800" color="text.secondary">
            EXPLOSIVE: {opp} ({Math.round(oppPct)}%)
          </Text>
        </Flex>
      </Grid>
    </VStack>
  );
};

// ─── DYNAMIC SVG LANE ARROW WIDGETS ───
const LaneArrow = ({ direction, successRate, attempts, totalAttempts, teamColors }) => {
  const rate = attempts > 0 ? successRate : 0;
  const isDominant = rate >= 0.45;
  const isChoked = rate <= 0.20 && attempts > 0;

  // Arrow thickness scales with volume ratio
  const strokeWidth = 1.5 + (attempts / Math.max(1, totalAttempts)) * 4.5;

  // Color color-maps based on success
  let color = "rgba(113, 128, 150, 0.4)"; // default gray
  if (attempts > 0) {
    if (isDominant) {
      color = "#48BB78"; // dominant green
    } else if (isChoked) {
      color = "#E53E3E"; // choked red
    } else {
      color = teamColors.accent || "#4A90D9"; // team color middle ground
    }
  }

  if (direction === "left") {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
        <path d="M19 19 C 13 19, 9 14, 5 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
        <path d="M5 6 L10 6 M5 6 L6 11" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    );
  }

  if (direction === "middle") {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
        <path d="M12 20 L12 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
        <path d="M8 8 L12 4 L16 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    );
  }

  // Right lane
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M5 19 C 11 19, 15 14, 19 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
      <path d="M19 6 L14 6 M19 6 L18 11" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
};

// ─── 3x1 LANE GRID ───
const LaneGrid = ({ lanes, totalAttempts, teamColors }) => {
  const keys = ["left", "middle", "right"];

  return (
    <Grid templateColumns="repeat(3, 1fr)" gap="4px" w="full">
      {keys.map((k) => {
        const lane = lanes[k];
        const successRate = lane.attempts > 0 ? lane.success / lane.attempts : 0;
        const ypc = lane.attempts > 0 ? lane.yards / lane.attempts : 0;

        return (
          <Flex
            key={k}
            align="center"
            gap="6px"
            p="6px"
            bg="rgba(255,255,255,0.02)"
            border="1px solid whiteAlpha.100"
            borderRadius="sm"
          >
            <LaneArrow
              direction={k}
              successRate={successRate}
              attempts={lane.attempts}
              totalAttempts={totalAttempts}
              teamColors={teamColors}
            />
            <Box minW={0}>
              <Text fontSize="8px" color="text.muted" fontWeight="900" textTransform="uppercase" lineHeight={1}>
                {k}
              </Text>
              <Text fontSize="12px" color="text.primary" fontWeight="950" mt="2px" lineHeight={1}>
                {lane.attempts > 0 ? `${fmt1(ypc)}y` : "—"}
              </Text>
              <Text fontSize="6px" color="text.secondary" fontWeight="800" textTransform="uppercase" mt="2px">
                {lane.attempts > 0 ? `${lane.attempts} C · ${fmtPct(successRate)} SR` : "no runs"}
              </Text>
            </Box>
          </Flex>
        );
      })}
    </Grid>
  );
};

// ─── ADVANCED SP+ RUSHING TABLE (ROW 2 LEFT) ───
const PlayerAdvancedTable = ({ rushers, activeKey, onSelect, teamYards, accentColor }) => {
  const headers = [
    { label: "Player", width: "1.3fr", align: "left" },
    { label: "Car", width: "0.6fr", align: "right" },
    { label: "Yds", width: "1fr", align: "right" },
    { label: "YPC", width: "0.7fr", align: "right" },
    { label: "LY/C", width: "0.7fr", align: "right" },
    { label: "SR", width: "0.7fr", align: "right" },
    { label: "Opp %", width: "0.7fr", align: "right" },
    { label: "Hil/Opp", width: "0.9fr", align: "right" },
  ];

  const templateColumns = headers.map((h) => h.width).join(" ");

  return (
    <VStack gap={0} align="stretch" w="full" h="full" minH={0}>
      {/* Header Row */}
      <Grid templateColumns={templateColumns} gap={1} py="3px" borderBottom="1px solid whiteAlpha.200" flexShrink={0}>
        {headers.map((h) => (
          <Text
            key={h.label}
            fontSize="7px"
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

      {/* Row List */}
      <Box flex={1} overflowY="auto">
        {rushers.map((p) => {
          const isActive = p.key === activeKey;
          const ypc = p.attempts > 0 ? p.yards / p.attempts : 0;
          const lyc = p.attempts > 0 ? p.lineYards / p.attempts : 0;
          const sr = p.attempts > 0 ? p.successRuns / p.attempts : 0;
          const oppRate = p.attempts > 0 ? p.opportunityRuns / p.attempts : 0;
          const hilOpp = p.opportunityRuns > 0 ? p.highlightYards / p.opportunityRuns : 0;

          const yardsShare = teamYards > 0 ? (p.yards / teamYards) * 100 : 0;

          return (
            <Grid
              key={p.key}
              templateColumns={templateColumns}
              gap={1}
              py="4px"
              alignItems="center"
              cursor="pointer"
              bg={isActive ? "whiteAlpha.100" : "transparent"}
              borderLeft={isActive ? `3px solid ${accentColor}` : "3px solid transparent"}
              borderBottom="1px solid whiteAlpha.50"
              _hover={{ bg: "whiteAlpha.50" }}
              onClick={() => onSelect(p)}
            >
              {/* Player Info */}
              <Box minW={0} pl="2px">
                <Text fontSize="clamp(9px, 0.8vw, 11px)" fontWeight="900" color="text.primary" truncate>
                  {getDisplayName(p.name)}
                </Text>
                <Text fontSize="6px" color="text.muted" fontWeight="800" textTransform="uppercase">
                  {p.position}
                </Text>
              </Box>

              {/* Stats */}
              <Text fontSize="clamp(9px, 0.8vw, 11px)" fontWeight="800" color="text.secondary" textAlign="right">
                {p.attempts}
              </Text>

              {/* Yards with relative share progress strip */}
              <VStack align="stretch" spacing="2px" flexShrink={0}>
                <Text fontSize="clamp(9px, 0.8vw, 11px)" fontWeight="900" color="text.primary" textAlign="right" lineHeight={1}>
                  {p.yards}
                </Text>
                <Box h="1.5px" w="full" bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
                  {yardsShare > 0 && (
                    <Box h="full" w={`${yardsShare}%`} bg={accentColor} borderRadius="full" />
                  )}
                </Box>
              </VStack>

              <Text fontSize="clamp(9px, 0.8vw, 11px)" fontWeight="850" color="text.primary" textAlign="right">
                {fmt1(ypc)}
              </Text>

              <Text fontSize="clamp(9px, 0.8vw, 11px)" fontWeight="800" color="text.secondary" textAlign="right">
                {fmt1(lyc)}
              </Text>

              <Text fontSize="clamp(9px, 0.8vw, 11px)" fontWeight="800" color="text.secondary" textAlign="right">
                {fmtPct(sr)}
              </Text>

              <Text fontSize="clamp(9px, 0.8vw, 11px)" fontWeight="800" color="text.secondary" textAlign="right">
                {fmtPct(oppRate)}
              </Text>

              <Text fontSize="clamp(9px, 0.8vw, 11px)" fontWeight="850" color={hilOpp > 2 ? accentColor : "text.secondary"} textAlign="right">
                {fmt1(hilOpp)}
              </Text>
            </Grid>
          );
        })}
      </Box>
    </VStack>
  );
};

// ─── PLAYER SPOTLIGHT WIDGET (ROW 2 RIGHT) ───
const PlayerSpotlight = ({ player, teamColors, totalAttempts }) => {
  return (
    <VStack gap="6px" align="stretch" w="full" h="full" minH={0}>
      {/* Upper Profile Card */}
      <Grid templateColumns="52px 1fr" border="1px solid whiteAlpha.100" borderRadius="sm" overflow="hidden" bg="rgba(255,255,255,0.02)">
        <Flex align="center" justify="center" bg="rgba(255,255,255,0.03)" borderRight="1px solid whiteAlpha.100">
          <Flex w="34px" h="34px" borderRadius="sm" bg={teamColors.primary} align="center" justify="center" border="1px solid whiteAlpha.200">
            <Text fontSize="12px" fontWeight="950" color="white">
              {getInitials(player.name)}
            </Text>
          </Flex>
        </Flex>
        <Box minW={0} px={3} py="6px" display="flex" flexDirection="column" justify="center">
          <Text fontSize="clamp(12px, 1vw, 14px)" fontWeight="950" color="text.primary" truncate lineHeight={1.1}>
            {getDisplayName(player.name)}
          </Text>
          <Text fontSize="7px" color="text.muted" fontWeight="800" textTransform="uppercase" mt="2px">
            {player.position} spotlight
          </Text>
        </Box>
      </Grid>

      {/* Rushing Anatomy Strip */}
      <RushingAnatomyStrip player={player} />

      {/* 3x1 Lane Visual Grid */}
      <Box flex={1} display="flex" alignItems="center">
        <LaneGrid lanes={player.lanes} totalAttempts={totalAttempts} teamColors={teamColors} />
      </Box>
    </VStack>
  );
};

// ─── DEFENSIVE RUSHING IMPACT BULLET ROWS (ROW 3) ───
const OpponentImpactMeters = ({ opponent }) => {
  const metrics = [
    { label: "Stop Rate", value: opponent.metrics.stopRate, sub: "stuffed/failed rushes", color: "#F6AD55" },
    { label: "Stuff Rate", value: opponent.metrics.stuffRate, sub: "tackles behind LOS", color: "#E53E3E" },
    { label: "Expl. Prev", value: opponent.metrics.explosivePrevention, sub: "no explosive runs", color: "#48BB78" },
  ];

  return (
    <Box px="6px" py="5px" borderTop="1px solid whiteAlpha.100" flexShrink={0}>
      <Flex align="center" gap={1.5} mb="4px">
        <Box w="3px" h="11px" bg="#F6AD55" borderRadius="sm" />
        <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.primary" fontWeight="900" textTransform="uppercase" letterSpacing="0.05em">
          {opponent.shortName} Rushing Defense Impact
        </Text>
      </Flex>
      <Grid templateColumns="repeat(3, 1fr)" gap={3}>
        {metrics.map((m) => {
          const barWidth = `${m.value * 100}%`;
          return (
            <Flex
              key={m.label}
              direction="column"
              justify="center"
              px="6px"
              py="4px"
              bg="rgba(255,255,255,0.02)"
              border="1px solid whiteAlpha.50"
              borderRadius="sm"
            >
              <Flex justify="space-between" align="center" mb="2px">
                <Text fontSize="clamp(8px, 0.72vw, 10px)" fontWeight="900" color="text.primary">
                  {m.label}
                </Text>
                <Text fontSize="clamp(9px, 0.8vw, 11px)" fontWeight="950" color={m.color}>
                  {fmtPct(m.value)}
                </Text>
              </Flex>
              {/* Bullet progress line */}
              <Box h="3px" w="full" bg="whiteAlpha.100" borderRadius="full" overflow="hidden" position="relative">
                <Box h="full" w={barWidth} bg={m.color} borderRadius="full" />
              </Box>
              <Text fontSize="6px" color="text.muted" fontWeight="700" textTransform="uppercase" mt="2px">
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
const TeamRushingPanelB = ({ teamKey }) => {
  const data = TEAMS[teamKey];
  const [selectedPlayer, setSelectedPlayer] = useState(data.rushers[0]);

  const primary = data.meta.colors.primary;
  const accent = data.meta.colors.accent;

  return (
    <Flex direction="column" w="full" h="full" minH={0} bg="rgba(0,0,0,0.1)">
      {/* ── ROW 1: Heading & Team Rushing Strip ── */}
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
          <Box w="3px" h="16px" bg={accent} borderRadius="sm" />
          <Text fontSize="clamp(12px, 1.1vw, 15px)" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em">
            {data.meta.shortName} Rushing Production (Variant B)
          </Text>
        </Flex>
        <TeamSummaryStrip data={data} />
      </Flex>

      {/* ── ROW 2: Player Advanced Table (Left 58%) & Spotlight (Right 42%) ── */}
      <Flex flex={1} minH={0} overflow="hidden">
        {/* Advanced Stats Table */}
        <Box w="58%" p="5px" borderRight="1px solid whiteAlpha.100" display="flex" flexDirection="column" minH={0}>
          <PlayerAdvancedTable
            rushers={data.rushers}
            activeKey={selectedPlayer.key}
            onSelect={setSelectedPlayer}
            teamYards={data.team.yards}
            accentColor={accent}
          />
        </Box>

        {/* Player Spotlight Card */}
        <Box w="42%" p="6px" minH={0}>
          <PlayerSpotlight
            player={selectedPlayer}
            teamColors={data.meta.colors}
            totalAttempts={data.team.attempts}
          />
        </Box>
      </Flex>

      {/* ── ROW 3: Defensive Bullet Impact ── */}
      <OpponentImpactMeters opponent={data.opponent} />
    </Flex>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT (4x2 side-by-side split concept)
// ═══════════════════════════════════════════════════════════════
export const GameProductionRushingB = () => {
  return (
    <Flex w="full" h="full" bg="bg.secondary" borderRadius="lg" overflow="hidden" border="1px solid whiteAlpha.100">
      <Box flex={1} minW={0} borderRight="1px solid whiteAlpha.100">
        <TeamRushingPanelB teamKey="jsu" />
      </Box>
      <Box flex={1} minW={0}>
        <TeamRushingPanelB teamKey="pvamu" />
      </Box>
    </Flex>
  );
};
