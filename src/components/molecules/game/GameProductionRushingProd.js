import { useState } from "react";
import {
  Box,
  Flex,
  Grid,
  Text,
  VStack,
} from "@chakra-ui/react";
import teamsData from "../../../data/teams.json";

// ═══════════════════════════════════════════════════════════════
// FORMATTERS & ANALYTICAL HELPERS
// ═══════════════════════════════════════════════════════════════
const fmtPct = (n) => `${Math.round((n ?? 0) * 100)}%`;
const fmt1 = (n) => (n ?? 0).toFixed(1);
const fmt2 = (n) => (n ?? 0).toFixed(2);

function getLastName(name) {
  if (!name || typeof name !== "string") return "—";
  if (!name.includes(",")) return name;
  return name.split(",")[0].trim();
}

function getDisplayName(name) {
  if (!name || typeof name !== "string") return "—";
  if (!name.includes(",")) return name;
  const parts = name.split(",");
  return `${parts[1].trim()} ${parts[0].trim()}`;
}

function getInitials(name) {
  if (!name || typeof name !== "string") return "—";
  if (!name.includes(",")) return name.slice(0, 2).toUpperCase();
  const parts = name.split(",");
  return `${parts[1].trim()[0] || ""}${parts[0].trim()[0] || ""}`;
}

const resolveTeamId = (teamId) => {
  if (!teamId) return "";
  if (typeof teamId === "object") {
    return teamId.team_id || teamId.id || teamId.exportId || "";
  }
  return String(teamId);
};

const getTeamDetails = (teamId) => {
  const resolved = resolveTeamId(teamId);
  const normalizedId = resolved.toLowerCase();
  const team = teamsData.teams.find((t) => {
    const tid = t.id.toLowerCase();
    const expId = t.exportId.toLowerCase().replace(/25$/, "");
    return normalizedId === tid || normalizedId === expId || normalizedId.includes(tid) || tid.includes(normalizedId);
  });
  
  if (team) return team;
  
  return {
    name: resolved,
    shortName: resolved.toUpperCase(),
    colors: { primary: "#141416", secondary: "#FFFFFF", accent: "#E53E3E" }
  };
};

// ═══════════════════════════════════════════════════════════════
// SP+ DYNAMIC HEURISTIC ENRICHER
// ═══════════════════════════════════════════════════════════════
const enrichRushers = (rushers, advancedTeam) => {
  const teamLineYardsPerRush = advancedTeam?.line_yards_per_rush ?? 3.0;
  const teamStuffRate = advancedTeam?.stuff_rate ?? 0.2;
  const teamSuccessRate = advancedTeam?.success_rate ?? 0.45;
  const teamOpportunityRate = advancedTeam?.rush_opportunity_rate ?? 0.35;

  return (rushers ?? []).map((p) => {
    const attempts = p.attempts ?? 0;
    const yards = p.yards ?? 0;
    
    // Heuristic Formulas
    const lineYards = Math.min(yards, attempts * teamLineYardsPerRush);
    const highlightYards = Math.max(0, yards - lineYards);
    
    const stuffedRuns = Math.round(attempts * teamStuffRate);
    const successRuns = Math.round(attempts * teamSuccessRate);
    const opportunityRuns = Math.round(attempts * teamOpportunityRate);
    
    const leftAtt = p.direction_breakdown?.left?.attempts ?? 0;
    const leftYds = p.direction_breakdown?.left?.yards ?? 0;
    
    const middleAtt = p.direction_breakdown?.middle?.attempts ?? 0;
    const middleYds = p.direction_breakdown?.middle?.yards ?? 0;
    
    const rightAtt = p.direction_breakdown?.right?.attempts ?? 0;
    const rightYds = p.direction_breakdown?.right?.yards ?? 0;

    const playerSuccessRate = attempts > 0 ? successRuns / attempts : 0;
    
    const leftSuccess = Math.round(leftAtt * playerSuccessRate);
    const middleSuccess = Math.round(middleAtt * playerSuccessRate);
    const rightSuccess = Math.round(rightAtt * playerSuccessRate);

    return {
      name: p.name,
      key: p.player_key || `name:${p.name?.toLowerCase()}`,
      position: p.position ?? "RB",
      attempts,
      yards,
      touchdowns: p.touchdowns ?? 0,
      lineYards,
      highlightYards,
      opportunityRuns,
      stuffedRuns,
      successRuns,
      lanes: {
        left: { attempts: leftAtt, yards: leftYds, success: leftSuccess, touchdowns: 0 },
        middle: { attempts: middleAtt, yards: middleYds, success: middleSuccess, touchdowns: 0 },
        right: { attempts: rightAtt, yards: rightYds, success: rightSuccess, touchdowns: 0 }
      }
    };
  });
};

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

const TeamSplitPillTables = ({ teamDetails, advancedTeam, teamBox }) => {
  const accent = teamDetails.colors.accent || teamDetails.colors.secondary || "#4A90D9";

  const att = teamBox.rush_attempts ?? 0;
  const oppRuns = Math.round(att * (advancedTeam.rush_opportunity_rate ?? 0));

  const tables = [
    {
      title: "RB Created",
      color: accent,
      cols: [
        { label: "HL YDS", val: fmt1(advancedTeam.highlight_yards_total), sub: "yards past line" },
        { label: "HL/C", val: fmt2(advancedTeam.highlight_yards_per_rush), sub: "created ypc" },
        { label: "OPP RUNS", val: oppRuns, sub: "runs 5+ yds" },
      ],
    },
    {
      title: "Shared Flow",
      color: "#E53E3E",
      cols: [
        { label: "CARRIES", val: att, sub: "total rushes" },
        { label: "NET YDS", val: teamBox.rush_yards ?? 0, sub: "game total" },
        { label: "AVG YPC", val: fmt2(teamBox.yards_per_carry), sub: "yards/carry" },
      ],
    },
    {
      title: "OL Earned",
      color: "#F6AD55",
      cols: [
        { label: "LINE YDS", val: fmt1(advancedTeam.line_yards_total), sub: "run blocking yds" },
        { label: "LY/C", val: fmt2(advancedTeam.line_yards_per_rush), sub: "blocking ypc" },
        { label: "STUFF RATE", val: fmtPct(advancedTeam.stuff_rate), sub: "runs <= 0y" },
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
          border="1px solid rgba(255,255,255,0.06)"
          borderLeft={`3px solid ${t.color}`}
          p="6px"
          borderRadius="sm"
          position="relative"
          _hover={{ bg: "rgba(255,255,255,0.05)" }}
        >
          <Flex align="center" gap={1.5} pb="4px" borderBottom="1px solid rgba(255,255,255,0.1)" mb="4px">
            <Text fontSize="8.5px" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.06em">
              {t.title}
            </Text>
          </Flex>

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
      <Grid templateColumns={templateColumns} gap={1} py="4px" borderBottom="1px solid rgba(255,255,255,0.12)" flexShrink={0}>
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

      <Box flex={1} overflowY="auto">
        {(rushers ?? []).map((p) => {
          const isActive = p.key === activeKey;
          const ypc = p.attempts > 0 ? p.yards / p.attempts : 0;
          const lyc = p.attempts > 0 ? p.lineYards / p.attempts : 0;
          const sr = p.attempts > 0 ? p.successRuns / p.attempts : 0;
          const oppRate = p.attempts > 0 ? p.opportunityRuns / p.attempts : 0;
          const hilOpp = p.opportunityRuns > 0 ? p.highlightYards / p.opportunityRuns : 0;

          const carColor = p.attempts >= 10 ? "text.primary" : "text.secondary";
          const carFontWeight = p.attempts >= 10 ? "950" : "800";
          
          let srColor = "text.secondary";
          if (p.attempts >= 3) {
            if (sr >= 0.45) srColor = "#48BB78";
            else if (sr <= 0.25) srColor = "#E53E3E";
          }

          let hilOppColor = "text.secondary";
          if (p.opportunityRuns > 0 && hilOpp >= 3.0) {
            hilOppColor = "#F6AD55";
          }

          return (
            <Grid
              key={p.key}
              templateColumns={templateColumns}
              gap={1}
              py="5px"
              alignItems="center"
              cursor="pointer"
              bg={isActive ? "rgba(255,255,255,0.06)" : "transparent"}
              borderLeft={isActive ? `3px solid ${accentColor}` : "3px solid transparent"}
              borderBottom="1px solid rgba(255,255,255,0.04)"
              _hover={{ bg: "rgba(255,255,255,0.03)" }}
              onClick={() => onSelect(p)}
            >
              <Box minW={0} pl="2px">
                <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight="950" color="text.primary" truncate>
                  {getLastName(p.name)}
                </Text>
                <Text fontSize="6px" color="text.muted" fontWeight="900" textTransform="uppercase">
                  {p.position}
                </Text>
              </Box>

              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight={carFontWeight} color={carColor} textAlign="right">
                {p.attempts}
              </Text>

              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight="950" color="text.primary" textAlign="right">
                {p.yards}
              </Text>

              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight="900" color="text.primary" textAlign="right">
                {fmt1(ypc)}
              </Text>

              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight="800" color="text.secondary" textAlign="right">
                {fmt1(lyc)}
              </Text>

              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight="900" color={srColor} textAlign="right">
                {fmtPct(sr)}
              </Text>

              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight="800" color="text.secondary" textAlign="right">
                {fmtPct(oppRate)}
              </Text>

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

const PlayerSpotlightD = ({ player, teamColors }) => {
  if (!player) return null;
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
      <Grid templateColumns="88px 1fr" gap="8px" border="1px solid rgba(255,255,255,0.06)" p="6px" borderRadius="sm" bg="rgba(255,255,255,0.02)">
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
            border="1px solid rgba(255,255,255,0.12)"
          >
            <Text fontSize="6px" fontWeight="900" color="text.primary">
              {player.position}
            </Text>
          </Box>
        </Flex>

        <VStack align="stretch" justify="center" gap="4px" minW={0}>
          <Box minW={0}>
            <Text fontSize="clamp(13px, 1.1vw, 16px)" fontWeight="950" color="text.primary" truncate>
              {getDisplayName(player.name)}
            </Text>
            <Text fontSize="7px" color="text.muted" fontWeight="800" textTransform="uppercase" letterSpacing="0.04em">
              SELECTED PLAYER PROFILE SPOTLIGHT
            </Text>
          </Box>

          <Grid templateColumns="repeat(4, 1fr)" gap="3px" py="2px" borderY="1px solid rgba(255,255,255,0.06)">
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

          <VStack align="stretch" gap="1px" w="full" mt="1px">
            <Box h="7px" w="full" bg="rgba(255,255,255,0.06)" borderRadius="full" overflow="hidden" display="flex">
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
              border="1px solid rgba(255,255,255,0.06)"
              borderTop={`3px solid ${themeColor}`}
              borderRadius="sm"
              position="relative"
              _hover={{ bg: "rgba(255,255,255,0.04)", borderTopWidth: "4px" }}
            >
              <Flex align="center" gap={1}>
                <Box w="3px" h="3px" bg={themeColor} borderRadius="full" />
                <Text fontSize="7px" color="text.muted" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em">
                  {label}
                </Text>
              </Flex>

              <VStack align="stretch" gap={0} my="auto" py={1}>
                <Text fontSize="clamp(20px, 1.6vw, 26px)" color="text.primary" fontWeight="950" lineHeight={1.0} letterSpacing="-0.04em">
                  {lane.attempts > 0 ? `${fmt1(laneYpc)}` : "—"}
                </Text>
                <Text fontSize="6px" color="text.muted" fontWeight="900" textTransform="uppercase">
                  YARDS PER CARRY
                </Text>
              </VStack>

              <VStack align="stretch" gap="3px" borderTop="1px solid rgba(255,255,255,0.06)" pt="4px">
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

const DefensiveDisruptionIndex = ({ opponentDetails, opponentAdvanced, opponentDefenders }) => {
  // Derive TFL Sum from actual defenders
  const tflForced = (opponentDefenders ?? []).reduce((s, p) => s + (p.tfl ?? 0), 0);
  const stopRate = opponentAdvanced?.success_rate ? 1 - opponentAdvanced.success_rate : 0.42;

  const metrics = [
    {
      label: "Stop Rate",
      value: stopRate,
      sub: "stuffed/failed rushes",
      color: "#F6AD55",
      desc: "Stop % on all carries"
    },
    {
      label: "Stuff Rate",
      value: opponentAdvanced.stuff_rate ?? 0.2,
      sub: "tackles behind LOS",
      color: "#E53E3E",
      desc: "Rushes stopped <= 0 yds"
    },
    {
      label: "TFL Force",
      value: tflForced / 10,
      displayVal: `${fmt1(tflForced)}`,
      sub: "total backfield TFLs",
      color: "#E53E3E",
      desc: "Tackles for loss forced"
    },
    {
      label: "Power Stoppage",
      value: opponentAdvanced.stopped_run_rate ?? 0.4,
      sub: "short yardage stops",
      color: "#F6AD55",
      desc: "Short yardage leverage stop %"
    },
    {
      label: "1D Success Allowed",
      value: opponentAdvanced.success_rate_early_down ?? 0.35,
      sub: "first down leverage",
      color: "#48BB78",
      desc: "1D rushing success rate allowed"
    },
    {
      label: "Opp Allowed",
      value: opponentAdvanced.rush_opportunity_rate ?? 0.3,
      sub: "prevent 5+ yd runs",
      color: "#4A90D9",
      desc: "Opportunity % allowed to rushers"
    },
  ];

  return (
    <Box px="8px" py="6px" borderTop="1px solid rgba(255,255,255,0.06)" flexShrink={0} bg="rgba(0,0,0,0.2)">
      <Flex align="center" gap={1.5} mb="4px">
        <Box w="3px" h="11px" bg="#E53E3E" borderRadius="sm" />
        <Text fontSize="8px" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.06em">
          {opponentDetails.shortName} Defensive Rushing Disruption Index (Leverage & Disruptive Indicators)
        </Text>
      </Flex>

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
              border="1px solid rgba(255,255,255,0.06)"
              borderRadius="sm"
              position="relative"
              _hover={{ bg: "rgba(255,255,255,0.03)" }}
            >
              <Flex justify="space-between" align="baseline" mb="2px">
                <Text fontSize="7px" fontWeight="950" color="text.secondary" truncate maxW="65%">
                  {m.label}
                </Text>
                <Text fontSize="10px" fontWeight="950" color={m.color} whiteSpace="nowrap">
                  {displayVal}
                </Text>
              </Flex>

              <Box h="2.5px" w="full" bg="rgba(255,255,255,0.06)" borderRadius="full" overflow="hidden" my="2px">
                <Box h="full" w={barWidth} bg={m.color} borderRadius="full" />
              </Box>

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

const TeamRushingPanelProd = ({ teamId, opponentId, teamBox, advancedTeam, opponentAdvanced, individualStats, opponentDefStats }) => {
  const teamDetails = getTeamDetails(teamId);
  const opponentDetails = getTeamDetails(opponentId);

  const enrichedPlayers = enrichRushers(individualStats?.rushing ?? [], advancedTeam);
  const [selectedPlayer, setSelectedPlayer] = useState(enrichedPlayers[0] || null);

  // If selected player unmounted or changed, fallback
  const activePlayer = enrichedPlayers.find((p) => p.key === selectedPlayer?.key) || enrichedPlayers[0] || null;

  const primary = teamDetails.colors.primary;
  const accent = teamDetails.colors.accent || teamDetails.colors.secondary || "#4A90D9";

  return (
    <Flex direction="column" w="full" h="full" minH={0} bg="rgba(0,0,0,0.15)">
      {/* ── ROW 1: Heading & Polished Split Pill-Tables ── */}
      <Flex
        direction="column"
        gap="6px"
        px={2}
        py="6px"
        bg={`linear-gradient(90deg, ${primary}33 0%, transparent 72%)`}
        borderBottom="1px solid rgba(255,255,255,0.08)"
        flexShrink={0}
      >
        <Flex align="center" gap={2}>
          <Box w="3px" h="14px" bg={accent} borderRadius="sm" />
          <Text fontSize="clamp(11px, 1vw, 14px)" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em">
            {teamDetails.name} Rushing Production
          </Text>
        </Flex>
        <TeamSplitPillTables
          teamDetails={teamDetails}
          advancedTeam={advancedTeam}
          teamBox={teamBox}
        />
      </Flex>

      {/* ── ROW 2: Player Table & Spotlight ── */}
      <Flex flex={1} minH={0} overflow="hidden">
        {/* Advanced SP+ Table (Left 58%) */}
        <Box w="58%" p="5px" borderRight="1px solid rgba(255,255,255,0.08)" display="flex" flexDirection="column" minH={0}>
          {enrichedPlayers.length > 0 ? (
            <PlayerTableD
              rushers={enrichedPlayers}
              activeKey={activePlayer?.key}
              onSelect={setSelectedPlayer}
              accentColor={accent}
            />
          ) : (
            <Flex align="center" justify="center" h="full">
              <Text fontSize="11px" color="text.muted">No rushing statistics recorded</Text>
            </Flex>
          )}
        </Box>

        {/* Tall Player Spotlight (Right 42%) */}
        <Box w="42%" p="6px" minH={0}>
          {activePlayer ? (
            <PlayerSpotlightD
              player={activePlayer}
              teamColors={teamDetails.colors}
            />
          ) : (
            <Flex align="center" justify="center" h="full" border="1px dashed rgba(255,255,255,0.06)">
              <Text fontSize="10px" color="text.muted">Select a rusher for detailed analytics</Text>
            </Flex>
          )}
        </Box>
      </Flex>

      {/* ── ROW 3: Defensive Rushing Disruption Index ── */}
      <DefensiveDisruptionIndex
        opponentDetails={opponentDetails}
        opponentAdvanced={opponentAdvanced}
        opponentDefenders={opponentDefStats?.defense ?? []}
      />
    </Flex>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT (Dual team side-by-side production component)
// ═══════════════════════════════════════════════════════════════
export const GameProductionRushingProd = ({ game, awayId, homeId, awayShort, homeShort }) => {
  const resolvedAwayId = resolveTeamId(awayId);
  const resolvedHomeId = resolveTeamId(homeId);
  const teamBox = game?.team_box ?? {};
  const advancedTeam = game?.advanced_team ?? {};
  const individualStats = game?.individual_stats ?? {};

  return (
    <Box
      bg="bg.secondary"
      border="1px solid rgba(255,255,255,0.08)"
      borderRadius="xl"
      overflow="hidden"
      mb={4}
    >
      <Box px={4} py={3} borderBottom="1px solid rgba(255,255,255,0.08)" bg="rgba(255,255,255,0.02)">
        <Text fontSize="xs" fontWeight="black" color="brand.400" textTransform="uppercase" letterSpacing="widest">
          Offensive Rushing Production & Disruption Map
        </Text>
      </Box>

      <Flex w="full" h="540px" bg="bg.secondary" overflow="hidden">
        <Box flex={1} minW={0} borderRight="1px solid rgba(255,255,255,0.08)">
          <TeamRushingPanelProd
            teamId={resolvedAwayId}
            opponentId={resolvedHomeId}
            teamBox={teamBox[resolvedAwayId] ?? {}}
            advancedTeam={advancedTeam[resolvedAwayId] ?? {}}
            opponentAdvanced={advancedTeam[resolvedHomeId] ?? {}}
            individualStats={individualStats[resolvedAwayId] ?? {}}
            opponentDefStats={individualStats[resolvedHomeId] ?? {}}
          />
        </Box>
        <Box flex={1} minW={0}>
          <TeamRushingPanelProd
            teamId={resolvedHomeId}
            opponentId={resolvedAwayId}
            teamBox={teamBox[resolvedHomeId] ?? {}}
            advancedTeam={advancedTeam[resolvedHomeId] ?? {}}
            opponentAdvanced={advancedTeam[resolvedAwayId] ?? {}}
            individualStats={individualStats[resolvedHomeId] ?? {}}
            opponentDefStats={individualStats[resolvedAwayId] ?? {}}
          />
        </Box>
      </Flex>
    </Box>
  );
};
