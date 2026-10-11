import React from "react";
import {
  Box,
  Flex,
  Text,
  Grid,
  VStack,
  HStack,
} from "@chakra-ui/react";
import teamsData from "../../../data/teams.json";

/**
 * GameProductionSpecialTeamsE
 * 
 * POLISHED SPECIAL TEAMS REPORT:
 * - Both panels (Away — PVAMU and Home — JSU) are now set to the premium Fancy Playbook UI.
 * - Removed unit headers (KICKOFF UNIT, PUNTING UNIT) to maximize screen real estate.
 * - Converted all kickoff/punt list rows into clean grids of chunky pills that stretch vertically.
 * - Large high-contrast typography inside pills and specialists columns for absolute readability.
 */

/**
 * Panel identity resolves against the full roster, so any matchup renders under its own
 * name and colours. The special-teams numbers below are still the two-team mock — only
 * the chrome is real.
 */
const resolveTeam = (id) =>
  teamsData.teams.find(
    (t) => t.id === id || t.exportId === id || t.exportId?.replace(/25$/, "") === id
  );

const FALLBACK_TEAM = {
  name: "Unknown",
  shortName: "—",
  bannerShort: "—",
  colors: { primary: "#3A3A3E", secondary: "#FFFFFF", accent: null },
};

// ─── Real consolidated box score payload from W15pvamujsu.json ─────────────
const MOCK_DATA = {
  swacpvamu: {
    summary: {
      avg_drive_start: "Own 33",
      opp_drive_start: "Own 24",
      long_field_pct: 42,
      hidden_yards: 10,
      st_play_count: 15,
      penalty_cost_yards: -12,
      penalty_count: 1
    },
    field_goals: {
      overall: { made: 3, attempts: 4, pct: 75.0, long: 42, pat_made: 2, pat_attempts: 2 },
      ranges: {
        u15: { made: 0, attempts: 0 },
        "15_30": { made: 2, attempts: 2 },
        "30_45": { made: 1, attempts: 2 },
        o45: { made: 0, attempts: 0 }
      },
      specialists: [
        { name: "Alfaro, Diego", role: "K", stats_summary: "3/4 FG, 42 Lg, 2/2 PAT" },
        { name: "Brown, Matt", role: "LS", stats_summary: "2 operation snaps" }
      ]
    },
    kickoffs: {
      offense: { kickoffs: 6, touchbacks: 0, avg_yards: 58.0 },
      defense: { returns: 3, touchbacks: 2, avg_start_allowed: 25.8, return_yards_allowed: 62, explosives: 1, turnovers_forced: 0, touchdowns_allowed: 0 },
      specialists: [
        { name: "Alfaro, Diego", role: "KO", stats_summary: "6 KO, 0% TB, 58.0 Avg" },
        { name: "Fortilien, Joanes", role: "RET", stats_summary: "3 returns, 62 yards" }
      ]
    },
    punts: {
      offense: { punts: 3, touchbacks: 0, avg_distance: 31.3, gross_yards: 94, inside_20: 0, inside_10: 0, blocks_allowed: 0 },
      defense: { returns_allowed: 2, return_yards_allowed: 12, avg_return_allowed: 6.0, muffs_recovered: 0, blocks: 0 },
      specialists: [
        { name: "Noll, Matt", role: "P", stats_summary: "3 punts, 31.3 Avg, 0 Inside 20" },
        { name: "Fortilien, Joanes", role: "PR", stats_summary: "2 returns, 12 yards" }
      ]
    }
  },
  swacjsu: {
    summary: {
      avg_drive_start: "Own 24",
      opp_drive_start: "Own 33",
      long_field_pct: 22,
      hidden_yards: -10,
      st_play_count: 15,
      penalty_cost_yards: -20,
      penalty_count: 2
    },
    field_goals: {
      overall: { made: 0, attempts: 0, pct: 0, long: 0, pat_made: 3, pat_attempts: 4 },
      ranges: {
        u15: { made: 0, attempts: 0 },
        "15_30": { made: 0, attempts: 0 },
        "30_45": { made: 0, attempts: 0 },
        o45: { made: 0, attempts: 0 }
      },
      specialists: [
        { name: "Baeza, Gerardo", role: "K", stats_summary: "3/4 PAT, 1 Blk" },
        { name: "Burns, Hunter", role: "LS", stats_summary: "4 operation snaps" }
      ]
    },
    kickoffs: {
      offense: { kickoffs: 5, touchbacks: 0, avg_yards: 58.5 },
      defense: { returns: 6, touchbacks: 0, avg_start_allowed: 27.2, return_yards_allowed: 84, explosives: 0, turnovers_forced: 0, touchdowns_allowed: 0 },
      specialists: [
        { name: "Baeza, Gerardo", role: "KO", stats_summary: "5 KO, 58.5 Avg" },
        { name: "Simmons, Errick", role: "RET", stats_summary: "6 returns, 84 yards" }
      ]
    },
    punts: {
      offense: { punts: 6, touchbacks: 0, avg_distance: 38.5, gross_yards: 231, inside_20: 0, inside_10: 0, blocks_allowed: 0 },
      defense: { returns_allowed: 0, return_yards_allowed: 0, avg_return_allowed: 0, muffs_recovered: 0, blocks: 0 },
      specialists: [
        { name: "Collins, Kye", role: "P", stats_summary: "6 punts, 38.5 Avg, 0 Inside 20" },
        { name: "Ware, Jaylan", role: "COV", stats_summary: "special teams gunner" }
      ]
    }
  }
};

// ─── Front-end Derived Calculations Utility ───────────────────────────────
const calculateDerivedStats = (teamId) => {
  const data = MOCK_DATA[teamId];
  const ko = data.kickoffs;
  const punt = data.punts;

  // Touchback Rate (Kickoffs)
  const koAttempts = ko.offense.kickoffs || 0;
  const koTouchbacks = ko.offense.touchbacks || 0;
  const koTouchbackRate = koAttempts > 0 ? (koTouchbacks / koAttempts) * 100 : 0;

  // Punts Inside 20 & 10 Counts (Raw)
  const puntAttempts = punt.offense.punts || 0;
  const inside20Count = punt.offense.inside_20 || 0;
  const inside10Count = punt.offense.inside_10 || 0;

  // Punts from Inside 40 (Coaching/Situational)
  const puntsFromInside40 = 0;

  // Field Flippage %
  const grossPuntYards = punt.offense.gross_yards || (puntAttempts * punt.offense.avg_distance) || 0;
  const returnYardsAllowed = punt.defense.return_yards_allowed || 0;
  const fieldFlippagePct = grossPuntYards > 0
    ? Math.max(0, Math.min(100, ((grossPuntYards - returnYardsAllowed) / grossPuntYards) * 100))
    : 100;

  // True return rate (Punt returns)
  const puntsFaced = teamId === "swacpvamu" ? 6 : 3;
  const puntReturnAttempts = punt.defense.returns_allowed || 0;
  const truePuntReturnRate = puntsFaced > 0 ? (puntReturnAttempts / puntsFaced) * 100 : 0;

  // Kickoff return rate
  const koFaced = teamId === "swacpvamu" ? 5 : 6;
  const koReturnAttempts = ko.defense.returns || 0;
  const trueKoReturnRate = koFaced > 0 ? (koReturnAttempts / koFaced) * 100 : 0;

  return {
    koAttempts,
    koTouchbackRate,
    trueKoReturnRate,
    inside20Count,
    inside10Count,
    puntsFromInside40,
    fieldFlippagePct,
    truePuntReturnRate,
    puntReturnAttempts
  };
};

// ─── Highly Legible Space-Maximizing Subcomponents ─────────────────────────

const FancyPill = ({ label, value, sub, accentColor, isNegative }) => (
  <Flex
    direction="row"
    align="center"
    justify="flex-start"
    bg="bg.card"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="6px"
    px="6px"
    py="3px"
    h="full"
    flex={1}
    minW={0}
    position="relative"
    overflow="hidden"
    gap="4px"
  >
    {/* Left accent bar */}
    <Box position="absolute" top={0} bottom={0} left={0} w="2.5px" bg={accentColor || "whiteAlpha.300"} />

    {/* Left Column: Stat Value (Outfit standard bold header font tweaked to 26px) */}
    <Text
      fontFamily="heading"
      fontSize="26px"
      fontWeight="950"
      color={isNegative ? "#E53E3E" : (accentColor || "text.primary")}
      textAlign="left"
      pl="4px"
      flexShrink={0}
      minW="33%"
      lineHeight={1}
    >
      {value}
    </Text>

    {/* Right Column: 2 Rows (Label & Sub-label) */}
    <VStack align="flex-start" gap="0px" flex={1} justify="center" minW={0}>
      <Text
        fontSize="8px"
        fontWeight="950"
        color="text.muted"
        textTransform="uppercase"
        letterSpacing="0.03em"
        textAlign="left"
        lineHeight={1.05}
        lineClamp={2}
      >
        {label}
      </Text>
      {sub && (
        <Text
          fontSize="7px"
          fontWeight="700"
          color="text.secondary"
          textAlign="left"
          lineHeight={1}
          lineClamp={1}
        >
          {sub}
        </Text>
      )}
    </VStack>
  </Flex>
);

const FancyTopPill = ({ label, value, sub, accentColor, isNegative }) => (
  <Flex
    direction="row"
    align="center"
    justify="flex-start"
    bg="bg.card"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="6px"
    px="8px"
    py="8px"
    h="full"
    flex={1}
    minW={0}
    position="relative"
    overflow="hidden"
    gap="6px"
  >
    {/* Left accent bar */}
    <Box position="absolute" top={0} bottom={0} left={0} w="3px" bg={accentColor || "whiteAlpha.300"} />

    {/* Left Column: Stat Value (Outfit standard bold header font tweaked to 21px) */}
    <Text
      fontFamily="heading"
      fontSize="21px"
      fontWeight="950"
      color={isNegative ? "#E53E3E" : (accentColor || "text.primary")}
      textAlign="left"
      pl="4px"
      flexShrink={0}
      minW="33%"
      lineHeight={1}
    >
      {value}
    </Text>

    {/* Right Column: 2 Rows (Label & Sub-label) */}
    <VStack align="flex-start" gap="0px" flex={1} justify="center" minW={0}>
      <Text
        fontSize="8.5px"
        fontWeight="950"
        color="text.muted"
        textTransform="uppercase"
        letterSpacing="0.03em"
        textAlign="left"
        lineHeight={1.05}
        lineClamp={2}
      >
        {label}
      </Text>
      {sub && (
        <Text
          fontSize="7.5px"
          fontWeight="700"
          color="text.secondary"
          textAlign="left"
          lineHeight={1}
          lineClamp={1}
        >
          {sub}
        </Text>
      )}
    </VStack>
  </Flex>
);

const FancySectionHeader = ({ label, color }) => (
  <Flex align="center" gap="4px" mb="3px" flexShrink={0}>
    <Box w="3px" h="9px" bg={color || "brand.500"} borderRadius="xs" />
    <Text fontSize="8.5px" fontWeight="950" color="text.primary" textTransform="uppercase" letterSpacing="0.06em" lineHeight={1}>
      {label}
    </Text>
  </Flex>
);

const FancySpecialistsColumn = ({ specialists, color }) => (
  <VStack
    align="stretch"
    gap="clamp(0.125rem, 0.3vh, 0.25rem)"
    bg="bg.secondary"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="md"
    p="clamp(0.25rem, 0.8vh, 0.375rem)"
    w="32%"
    flexShrink={0}
    h="full"
  >
    <Text
      fontSize="clamp(0.5rem, 0.6vw, 0.531rem)"
      fontWeight="900"
      color="text.muted"
      textTransform="uppercase"
      letterSpacing="0.05em"
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      pb="clamp(1px, 0.2vh, 3px)"
      mb="clamp(1px, 0.2vh, 2px)"
    >
      SPECIALISTS
    </Text>
    <VStack align="stretch" gap="clamp(0.125rem, 0.4vh, 0.25rem)" overflowY="auto" flex={1} justify="center">
      {specialists.map((p, i) => (
        <Box
          key={i}
          position="relative"
          py="clamp(2px, 0.3vh, 4px)"
          borderBottom={i < specialists.length - 1 ? "1px solid" : "none"}
          borderColor="whiteAlpha.50"
        >
          {/* Row 1: Player Name (REAL BIG) */}
          <Text
            fontFamily="heading"
            fontSize="clamp(0.8rem, 1vw, 0.938rem)"
            fontWeight="950"
            color="text.primary"
            lineHeight={1.1}
            pr="clamp(1.25rem, 1.5vw, 1.875rem)"
            lineClamp={1}
          >
            {p.name.split(",")[0]}
          </Text>

          {/* Soft Position Accent in top right corner */}
          <Text
            position="absolute"
            top="clamp(2px, 0.3vh, 4px)"
            right="0"
            fontSize="clamp(0.5rem, 0.7vw, 0.594rem)"
            fontWeight="950"
            color={color}
            opacity={0.85}
            letterSpacing="0.04em"
            textTransform="uppercase"
          >
            {p.role}
          </Text>

          {/* Row 2: Stats Summary (Clear and highly readable) */}
          <Text
            fontSize="clamp(0.65rem, 0.8vw, 0.75rem)"
            fontWeight="800"
            color="text.secondary"
            mt="clamp(1px, 0.2vh, 3px)"
            lineClamp={1}
          >
            {p.stats_summary}
          </Text>
        </Box>
      ))}
      {specialists.length === 0 && (
        <Flex align="center" justify="center" h="100%">
          <Text fontSize="clamp(0.5rem, 0.6vw, 0.563rem)" color="text.muted">No active specialists</Text>
        </Flex>
      )}
    </VStack>
  </VStack>
);

// ─── Team Column Panel Renderer (Fancy Playbook style for both teams) ────────

const TeamSTPanel = ({ teamId, data, derived }) => {
  const team = resolveTeam(teamId) || FALLBACK_TEAM;
  const primary = team.colors?.primary || FALLBACK_TEAM.colors.primary;
  const secondary = team.colors?.secondary || "#FFFFFF";
  // Accent where the school has one, otherwise the secondary — either way something that
  // reads against the dark panel, which the primary often does not.
  const color = team.colors?.accent || secondary;

  const fg = data.field_goals;
  const ko = data.kickoffs;
  const punt = data.punts;
  const sum = data.summary;

  const fgPct = fg.overall.attempts > 0 ? `${fg.overall.pct.toFixed(0)}%` : "0%";

  return (
    <VStack
      align="stretch"
      gap="0.375rem"
      bg={`linear-gradient(180deg, ${primary}0D 0%, transparent 100%)`}
      p="8px"
      w="full"
      h="full"
      minW={0}
    >
      {/* Team Header */}
      <Flex justify="flex-start" align="center" borderBottom="1px solid" borderColor="whiteAlpha.100" pb="4px" flexShrink={0}>
        <Flex align="center" gap="6px">
          <Flex w="18px" h="18px" borderRadius="sm" bg={primary} align="center" justify="center" border="1px solid" borderColor="whiteAlpha.200">
            <Text fontSize="8.5px" fontWeight="950" color={secondary}>{team.bannerShort || team.shortName}</Text>
          </Flex>
          <Text fontSize="11px" fontWeight="950" color="text.primary" textTransform="uppercase" letterSpacing="0.04em">
            {team.name} Special Teams Production
          </Text>
        </Flex>
      </Flex>

      {/* Top Ledger: 5 Pills */}
      <HStack gap="3.5px" w="100%" h="52px" flexShrink={0}>
        <FancyTopPill label="Avg Start" value={sum.avg_drive_start} sub={`Opp: ${sum.opp_drive_start}`} accentColor={color} />
        <FancyTopPill label="Long Field" value={`${sum.long_field_pct}%`} sub="Inside 20" accentColor={color} />
        <FancyTopPill label="ST Plays" value={sum.st_play_count} sub="Snaps" accentColor={color} />
        <FancyTopPill label="ST Penalty" value={`${sum.penalty_count} Pen`} sub={`${sum.penalty_cost_yards}y`} accentColor={sum.penalty_cost_yards < 0 ? "#E53E3E" : color} />
        <FancyTopPill label="Hidden Yds" value={sum.hidden_yards >= 0 ? `+${sum.hidden_yards}y` : `${sum.hidden_yards}y`} sub="ST Impact" accentColor={sum.hidden_yards >= 0 ? "#48BB78" : "#E53E3E"} isNegative={sum.hidden_yards < 0} />
      </HStack>

      <Box h="1px" bg="whiteAlpha.100" w="100%" flexShrink={0} />

      {/* Layer 1: Field Goals (Equal Height Row 1) */}
      <Flex direction="column" flex="1" minH={0}>
        <FancySectionHeader label="Field Goals & PAT" color={color} />
        <Flex gap="5px" flex={1} minH={0} align="stretch">
          <Grid templateRows="1fr 1fr" templateColumns="repeat(4, 1fr)" gap="4px" h="full" flex={1}>
            <FancyPill label="FG" value={`${fg.overall.made}/${fg.overall.attempts}`} accentColor={color} />
            <FancyPill label="FG %" value={fgPct} accentColor={color} />
            <FancyPill label="Long" value={fg.overall.long > 0 ? `${fg.overall.long}y` : "—"} accentColor={color} />
            <FancyPill label="PAT" value={`${fg.overall.pat_made}/${fg.overall.pat_attempts}`} accentColor={color} />
            <FancyPill label="<15y" value={`${fg.ranges.u15.made}/${fg.ranges.u15.attempts}`} />
            <FancyPill label="15-30y" value={`${fg.ranges["15_30"].made}/${fg.ranges["15_30"].attempts}`} />
            <FancyPill label="30-45y" value={`${fg.ranges["30_45"].made}/${fg.ranges["30_45"].attempts}`} />
            <FancyPill label=">45y" value={`${fg.ranges.o45.made}/${fg.ranges.o45.attempts}`} />
          </Grid>
          <FancySpecialistsColumn specialists={fg.specialists} color={color} />
        </Flex>
      </Flex>

      <Box h="1px" bg="whiteAlpha.50" w="100%" flexShrink={0} />

      {/* Layer 2: Kickoffs (Equal Height Row 2 with clean Section Header) */}
      <Flex direction="column" flex="1" minH={0}>
        <FancySectionHeader label="Kickoffs" color={color} />
        <Flex gap="5px" flex={1} minH={0} align="stretch">
          <Grid templateRows="1fr 1fr" templateColumns="repeat(3, 1fr)" gap="4px" h="full" flex={1}>
            {/* Row 1: Kickoff Offense */}
            <FancyPill label="KICKOFFS" value={derived.koAttempts} accentColor={color} />
            <FancyPill label="TOUCHBACK %" value={`${derived.koTouchbackRate.toFixed(0)}%`} accentColor={color} />
            <FancyPill label="OPP START" value={ko.defense.avg_start_allowed} accentColor={color} />
            {/* Row 2: Kickoff Returns */}
            <FancyPill label="RET FACED" value={ko.defense.returns} />
            <FancyPill label="AVG RETURN" value={`${ko.defense.avg_start_allowed}y`} />
            <FancyPill label="EXPLOSIVES" value={ko.defense.explosives} />
          </Grid>
          <FancySpecialistsColumn specialists={ko.specialists} color={color} />
        </Flex>
      </Flex>

      <Box h="1px" bg="whiteAlpha.50" w="100%" flexShrink={0} />

      {/* Layer 3: Punts (Equal Height Row 3 with clean Section Header) */}
      <Flex direction="column" flex="1" minH={0}>
        <FancySectionHeader label="Punts" color={color} />
        <Flex gap="5px" flex={1} minH={0} align="stretch">
          <Grid templateRows="repeat(3, 1fr)" templateColumns="repeat(4, 1fr)" gap="4px" h="full" flex={1}>
            {/* Row 1: Punts Offense */}
            <FancyPill label="PUNTS" value={punt.offense.punts} accentColor={color} />
            <FancyPill label="AVG DISTANCE" value={`${punt.offense.avg_distance}y`} accentColor={color} />
            <FancyPill label="INSIDE 20" value={derived.inside20Count} accentColor={color} />
            <FancyPill label="INSIDE 10" value={derived.inside10Count} accentColor={color} />
            {/* Row 2: Offense & Returns */}
            <FancyPill label="OPP RET %" value={`${(punt.defense.returns_allowed / punt.offense.punts * 100).toFixed(0)}%`} />
            <FancyPill label="PUNTS IN-40" value={derived.puntsFromInside40} />
            <FancyPill label="FLIPPAGE %" value={`${derived.fieldFlippagePct.toFixed(0)}%`} />
            <FancyPill label="RETURN ATT" value={derived.puntReturnAttempts} />
            {/* Row 3: Punt Returns */}
            <FancyPill label="RETURN %" value={`${derived.truePuntReturnRate.toFixed(0)}%`} />
            <FancyPill label="AVG RETURN" value={`${punt.defense.avg_return_allowed}y`} />
            <FancyPill label="EXPLOSIVES" value={punt.defense.blocks} />
            <FancyPill label="PUNT NYOE" value={`${punt.defense.avg_return_allowed - 10.0}y`} />
          </Grid>
          <FancySpecialistsColumn specialists={punt.specialists} color={color} />
        </Flex>
      </Flex>
    </VStack>
  );
};

// ─── Main Named Export Component ─────────────────────────────────────────────

export const GameProductionSpecialTeamsE = ({ game, awayId, homeId }) => {
  const away = awayId || "swacpvamu";
  const home = homeId || "swacjsu";

  // MOCK_DATA only carries the two teams this row was built from, so every other matchup
  // borrows them — away reads as PVAMU, home as JSU. Resolve the key once and use it for
  // both the data and the derived numbers: keying them separately is what let the derived
  // pass fall through to an undefined team and take the tab down.
  const awayKey = MOCK_DATA[away] ? away : "swacpvamu";
  const homeKey = MOCK_DATA[home] ? home : "swacjsu";

  const awayData = MOCK_DATA[awayKey];
  const homeData = MOCK_DATA[homeKey];

  const awayDerived = calculateDerivedStats(awayKey);
  const homeDerived = calculateDerivedStats(homeKey);

  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      w="full"
      h="full"
      minH="37.5rem"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="lg"
      overflow="hidden"
    >
      <Box
        flex={1}
        borderRight={{ base: "none", md: "1px solid whiteAlpha.100" }}
        borderBottom={{ base: "1px solid whiteAlpha.100", md: "none" }}
        minH={0}
      >
        <TeamSTPanel teamId={away} data={awayData} derived={awayDerived} />
      </Box>
      <Box flex={1} minH={0}>
        <TeamSTPanel teamId={home} data={homeData} derived={homeDerived} />
      </Box>
    </Flex>
  );
};
