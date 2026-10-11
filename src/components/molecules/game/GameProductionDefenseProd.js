import { Box, Flex, Grid, Text, VStack } from "@chakra-ui/react";
import teamsData from "../../../data/teams.json";

// ═══════════════════════════════════════════════════════════════
// FORMATTERS & ANALYTICAL HELPERS
// ═══════════════════════════════════════════════════════════════
const fmtPct = (n) => `${Math.round((n ?? 0) * 100)}%`;
const fmt1 = (n) => (n ?? 0).toFixed(1);

function getLastName(name) {
  if (!name || typeof name !== "string") return "—";
  if (!name.includes(",")) return name.trim();
  return name.split(",")[0].trim();
}

// eslint-disable-next-line no-unused-vars
function getDisplayName(name) {
  if (!name || typeof name !== "string") return "—";
  if (!name.includes(",")) return name.trim();
  const parts = name.split(",");
  return `${parts[1].trim()} ${parts[0].trim()}`;
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
// DYNAMIC DEFENSIVE ANALYTICAL HEURISTIC ENRICHER
// ═══════════════════════════════════════════════════════════════
const enrichDefense = (defenders, teamId) => {
  const enriched = (defenders ?? []).map((p) => {
    const tkl = p.tackles ?? 0;
    const tfl = p.tfl ?? 0;
    const sck = p.sacks ?? 0;
    const pd = p.passes_defended ?? 0;
    const int = p.interceptions ?? 0;
    const ff = p.forced_fumbles ?? 0;
    const qbh = p.qb_hurries ?? 0;
    const havoc = tfl + sck + pd + int + ff;
    
    return {
      ...p,
      tkl,
      tfl,
      sck,
      pd,
      int,
      ff,
      qbh,
      havoc,
      name: p.name,
      pos: p.position ?? "LB",
    };
  });

  // Sort defenders by tackles descending, then havoc descending
  enriched.sort((a, b) => b.tkl - a.tkl || b.havoc - a.havoc);

  // Compute Pressure Profiles based on actual game stats & positions
  let interiorScore = 0;
  let edgeScore = 0;
  let supportScore = 0;

  enriched.forEach((p) => {
    const weight = (p.tfl ?? 0) + (p.sacks ?? 0) + (p.qbh ?? 0);
    if (["DL", "DE", "DT", "NT"].includes(p.pos)) {
      interiorScore += weight;
    } else if (["LB", "OLB", "ILB"].includes(p.pos)) {
      edgeScore += weight;
    } else if (["DB", "CB", "S", "FS", "SS"].includes(p.pos)) {
      supportScore += weight;
    }
  });

  let edgeRushShare = 45;
  let interiorShare = 35;
  let blitzShare = 20;

  const totalPressure = interiorScore + edgeScore + supportScore;
  if (totalPressure > 0) {
    edgeRushShare = Math.max(10, Math.min(80, Math.round((edgeScore / totalPressure) * 100)));
    interiorShare = Math.max(10, Math.min(80, Math.round((interiorScore / totalPressure) * 100)));
    blitzShare = 100 - edgeRushShare - interiorShare;
  }

  // Find level leaders for horizontal containment spacing coordinates
  const dlLeader = enriched.find((p) => ["DL", "DE", "DT", "NT"].includes(p.pos));
  const lbLeader = enriched.find((p) => ["LB", "OLB", "ILB"].includes(p.pos));
  const dbLeader = enriched.find((p) => ["DB", "CB", "S", "FS", "SS"].includes(p.pos));

  const gapFitScatter = [];
  if (dlLeader) {
    const depth = Math.max(-1.5, Math.min(2.0, 0.8 - (dlLeader.tfl * 0.8)));
    gapFitScatter.push({
      name: getLastName(dlLeader.name),
      role: `DL Trench (${dlLeader.pos})`,
      depth,
      color: "#E53E3E"
    });
  } else {
    gapFitScatter.push({
      name: "Trench Fit",
      role: "DL Trench",
      depth: 0.5,
      color: "#E53E3E"
    });
  }

  if (lbLeader) {
    const depth = Math.max(-0.5, Math.min(4.0, 2.0 - (lbLeader.tfl * 0.6) + (lbLeader.pd * 0.4)));
    gapFitScatter.push({
      name: getLastName(lbLeader.name),
      role: `LB Core (${lbLeader.pos})`,
      depth,
      color: "#F6AD55"
    });
  } else {
    gapFitScatter.push({
      name: "Core Fit",
      role: "LB Core",
      depth: 2.0,
      color: "#F6AD55"
    });
  }

  if (dbLeader) {
    const depth = Math.max(2.5, Math.min(8.5, 5.2 - (dbLeader.tfl * 0.5) + (dbLeader.pd * 0.5)));
    gapFitScatter.push({
      name: getLastName(dbLeader.name),
      role: `DB Secondary (${dbLeader.pos})`,
      depth,
      color: "#4A90D9"
    });
  } else {
    gapFitScatter.push({
      name: "Secondary Save",
      role: "DB Secondary",
      depth: 5.0,
      color: "#4A90D9"
    });
  }

  return {
    defenders: enriched,
    pressureProfile: { edgeRushShare, interiorShare, blitzShare },
    gapFitScatter
  };
};

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

// ─── TEAM DEFENSIVE STATS PILLS (ROW 1) ───
const TeamStatsHeader = ({ stats, colors, shortName }) => {
  const accent = colors.accent || colors.secondary || "#4A90D9";

  const cards = [
    { label: "Plays Allowed", value: stats.scrimmagePlays, details: "Opp Scrimmage plays", color: "text.primary" },
    { label: "Stop Rate", value: fmtPct(stats.stopRate), details: "Stop efficiency", color: "#48BB78" },
    { 
      label: "Havoc plays", 
      value: `${stats.havocTotal}`, 
      valueSplit: `[${stats.havocRush}R / ${stats.havocPass}P]`,
      details: "TFL+Sck+PD+Int+FF", 
      color: "#F6AD55" 
    },
    { label: "TFLs Forced", value: fmt1(stats.tfl), details: "Behind scrimmage", color: "#F6AD55" },
    { label: "Sacks", value: fmt1(stats.sacks), details: "QB drops forced", color: "#E53E3E" },
    { label: "Passes Def", value: stats.pd, details: "Deflection total", color: "#4A90D9" },
    { label: "Interceptions", value: stats.interceptions, details: "Air takeaways", color: "#48BB78" },
    { label: "Fumbles Forced", value: stats.ff, details: "Punch outs", color: "#48BB78" },
  ];

  return (
    <Box w="full" px="8px" py="6px" bg={`linear-gradient(90deg, ${colors.primary}33 0%, transparent 80%)`} borderBottom="1px solid rgba(255,255,255,0.08)" flexShrink={0}>
      <Flex align="center" gap={2} mb="5px">
        <Box w="3px" h="11px" bg={accent} borderRadius="sm" />
        <Text fontSize="10px" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.06em">
          {shortName} Team Defensive Profile
        </Text>
      </Flex>
      
      <Grid templateColumns="repeat(8, 1fr)" gap="5px" w="full">
        {cards.map((c) => (
          <Flex
            key={c.label}
            direction="column"
            justify="center"
            align="center"
            px="4px"
            py="4.5px"
            bg="rgba(255,255,255,0.02)"
            border="1px solid rgba(255,255,255,0.06)"
            borderRadius="xs"
            _hover={{ bg: "rgba(255,255,255,0.04)" }}
          >
            <Text fontSize="7.5px" color="text.muted" fontWeight="900" textTransform="uppercase" textAlign="center" truncate maxW="full">
              {c.label}
            </Text>
            
            <Flex align="baseline" gap="2px" mt="2px" justify="center" wrap="nowrap">
              <Text fontSize="clamp(11px, 1vw, 14px)" color={c.color} fontWeight="950" lineHeight={1.1}>
                {c.value}
              </Text>
              {c.valueSplit && (
                <Text fontSize="6.5px" color="text.secondary" fontWeight="800">
                  {c.valueSplit}
                </Text>
              )}
            </Flex>
            
            <Text fontSize="4.5px" color="text.muted" fontWeight="800" textTransform="uppercase" mt="2px" textAlign="center" truncate maxW="full">
              {c.details}
            </Text>
          </Flex>
        ))}
      </Grid>
    </Box>
  );
};

// ─── FILTERED TACKLES LIST (ROW 2 LEFT) ───
const FilteredDefenderTable = ({ defenders, teamColors }) => {
  // Filter: total tackles >= 2.0 OR has generated havoc
  const filtered = defenders.filter((p) => p.tkl >= 2.0 || p.havoc > 0);
  const accent = teamColors.accent || teamColors.secondary || "#4A90D9";

  const headers = [
    { label: "Defender", width: "1.2fr", align: "left" },
    { label: "TKL", width: "0.6fr", align: "right" },
    { label: "TFL", width: "0.6fr", align: "right" },
    { label: "SCK", width: "0.6fr", align: "right" },
    { label: "PD", width: "0.6fr", align: "right" },
    { label: "FF", width: "0.6fr", align: "right" },
    { label: "HAVOC", width: "0.7fr", align: "right" },
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
        {filtered.map((p) => {
          const sckColor = p.sck > 0 ? "#E53E3E" : "text.secondary";
          const sckWeight = p.sck > 0 ? "950" : "800";

          const tflColor = p.tfl > 0 ? "#F6AD55" : "text.secondary";
          const tflWeight = p.tfl > 0 ? "950" : "800";

          const pdColor = p.pd > 0 ? "#4A90D9" : "text.secondary";
          const pdWeight = p.pd > 0 ? "950" : "800";

          const ffColor = p.ff > 0 ? "#48BB78" : "text.secondary";
          const ffWeight = p.ff > 0 ? "950" : "800";

          const havocColor = p.havoc >= 1.5 ? "#F6AD55" : p.havoc > 0 ? "text.primary" : "text.muted";
          const havocWeight = p.havoc > 0 ? "950" : "800";

          return (
            <Grid
              key={p.name}
              templateColumns={templateColumns}
              gap={1}
              py="5.5px"
              alignItems="center"
              borderBottom="1px solid rgba(255,255,255,0.04)"
              borderLeft={p.havoc >= 2.0 ? `3px solid ${accent}` : "3px solid transparent"}
              _hover={{ bg: "rgba(255,255,255,0.02)" }}
            >
              <Box minW={0} pl="2px">
                <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight="950" color="text.primary" truncate>
                  {getLastName(p.name)}
                </Text>
                <Text fontSize="6px" color="text.muted" fontWeight="900" textTransform="uppercase">
                  {p.pos}
                </Text>
              </Box>

              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight="900" color="text.primary" textAlign="right">
                {fmt1(p.tkl)}
              </Text>

              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight={tflWeight} color={tflColor} textAlign="right">
                {p.tfl > 0 ? fmt1(p.tfl) : "—"}
              </Text>

              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight={sckWeight} color={sckColor} textAlign="right">
                {p.sck > 0 ? fmt1(p.sck) : "—"}
              </Text>

              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight={pdWeight} color={pdColor} textAlign="right">
                {p.pd > 0 ? p.pd : "—"}
              </Text>

              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight={ffWeight} color={ffColor} textAlign="right">
                {p.ff > 0 ? p.ff : "—"}
              </Text>

              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight={havocWeight} color={havocColor} textAlign="right">
                {p.havoc > 0 ? fmt1(p.havoc) : "—"}
              </Text>
            </Grid>
          );
        })}
      </Box>
    </VStack>
  );
};

// ─── PRESSURE HEATMAP & GEOMETRIC CONTAINMENT MAP (ROW 2 RIGHT) ───
const PressureGapFitInfographic = ({ scatter, pressure, colors }) => {
  const accent = colors.accent || colors.secondary || "#4A90D9";

  return (
    <VStack gap="10px" align="stretch" w="full" h="full" minH={0}>
      {/* 1. Pressure Origin Segments */}
      <VStack gap="4px" align="stretch">
        <Text fontSize="7.5px" color="text.muted" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em">
          Pressure Origin Heatmap (Trench vs Edge vs Support Blitz)
        </Text>
        
        <Box p="6px" bg="rgba(255,255,255,0.015)" border="1px solid rgba(255,255,255,0.06)" borderRadius="xs">
          <Box h="7px" w="full" bg="rgba(255,255,255,0.06)" borderRadius="sm" overflow="hidden" display="flex">
            <Box h="full" w={`${pressure.edgeRushShare}%`} bg="#F6AD55" />
            <Box h="full" w={`${pressure.interiorShare}%`} bg="#E53E3E" />
            <Box h="full" w={`${pressure.blitzShare}%`} bg={accent} />
          </Box>

          <Grid templateColumns="repeat(3, 1fr)" gap="1px" fontSize="5.5px" fontWeight="900" color="text.muted" mt="3px">
            <Text color="#F6AD55">EDGE PRESS: {pressure.edgeRushShare}%</Text>
            <Text color="#E53E3E" textAlign="center">INT PRESS: {pressure.interiorShare}%</Text>
            <Text color={accent} textAlign="right">SUPPORT BLITZ: {pressure.blitzShare}%</Text>
          </Grid>
        </Box>
      </VStack>

      {/* 2. Containment Spacing & Tackle Spacing coordinate map */}
      <VStack gap="4px" align="stretch" flex={1} minH={0}>
        <Text fontSize="7.5px" color="text.muted" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em">
          Containment Spacing & Gap Fit Map (Yard-line coordinates)
        </Text>

        <Box flex={1} bg="rgba(255,255,255,0.01)" border="1px solid rgba(255,255,255,0.06)" borderRadius="xs" p="6px" position="relative" display="flex" flexDirection="column" justify="space-around">
          {/* Yard line indicators */}
          <Flex justify="space-between" borderBottom="1px dashed rgba(255,255,255,0.12)" pb="2px" position="relative" h="10px">
            {[-2, 0, 2, 4, 6, 8].map((y) => (
              <Box key={y} position="relative" flex={1} textAlign="center">
                <Text fontSize="5px" color="text.muted" fontWeight="800">
                  {y > 0 ? `+${y}y` : `${y}y`}
                </Text>
                <Box w="1px" h="80px" borderRight="1px dashed rgba(255,255,255,0.04)" position="absolute" top="7px" left="50%" zIndex={0} />
              </Box>
            ))}
          </Flex>

          {/* Coordinate Plot Nodes */}
          <VStack gap="6px" align="stretch" mt="2px" zIndex={1} position="relative">
            {scatter.map((node) => {
              // Convert yard depth into horizontal percentage from -3y to +9y (range of 12y)
              const minYard = -3;
              const maxYard = 9;
              const pct = ((node.depth - minYard) / (maxYard - minYard)) * 100;
              const boundedPct = Math.max(2, Math.min(98, pct));

              return (
                <Box key={node.name} position="relative" h="18px" bg="rgba(0,0,0,0.2)" border="1px solid rgba(255,255,255,0.04)" borderRadius="xs" px="3px" py="1px">
                  <Flex align="center" gap="4px">
                    <Box>
                      <Text fontSize="7px" fontWeight="950" color="text.primary" leading={1}>
                        {node.name}
                      </Text>
                      <Text fontSize="4.5px" color="text.secondary" fontWeight="800" textTransform="uppercase">
                        {node.role}
                      </Text>
                    </Box>
                  </Flex>

                  {/* Visual Node dot */}
                  <Box
                    position="absolute"
                    top="50%"
                    transform="translate(-50%, -50%)"
                    left={`${boundedPct}%`}
                    w="12px"
                    h="12px"
                    borderRadius="full"
                    bg={node.color}
                    border="2px solid black"
                    boxShadow={`0 0 6px ${node.color}`}
                    display="flex"
                    align="center"
                    justify="center"
                  >
                    <Text fontSize="5.5px" fontWeight="950" color={node.color === "#F6AD55" ? "black" : "white"}>
                      {node.depth > 0 ? `+${fmt1(node.depth)}` : fmt1(node.depth)}
                    </Text>
                  </Box>
                </Box>
              );
            })}
          </VStack>
        </Box>
      </VStack>
    </VStack>
  );
};

// ─── TEAM DEFENSIVE PANEL ───
const TeamDefensePanelProd = ({ teamId, opponentId, defenders, advancedTeam, opponentAdvanced }) => {
  const teamDetails = getTeamDetails(teamId);
  
  // Dynamic stats aggregation
  const tfl = (defenders ?? []).reduce((s, p) => s + (p.tfl ?? 0), 0);
  const sacks = (defenders ?? []).reduce((s, p) => s + (p.sacks ?? 0), 0);
  const pd = (defenders ?? []).reduce((s, p) => s + (p.passes_defended ?? 0), 0);
  const interceptions = (defenders ?? []).reduce((s, p) => s + (p.interceptions ?? 0), 0);
  const ff = (defenders ?? []).reduce((s, p) => s + (p.forced_fumbles ?? 0), 0);
  
  const havocTotal = tfl + sacks + pd + interceptions + ff;
  const havocRush = tfl + ff;
  const havocPass = sacks + pd + interceptions;

  const scrimmagePlays = opponentAdvanced.eligible_scrimmage_plays ?? 60;
  const stopRate = opponentAdvanced.success_rate ? 1 - opponentAdvanced.success_rate : 0.42;

  const statsPayload = {
    scrimmagePlays,
    stopRate,
    havocTotal,
    havocRush,
    havocPass,
    tfl,
    sacks,
    pd,
    interceptions,
    ff
  };

  const { defenders: enriched, pressureProfile, gapFitScatter } = enrichDefense(defenders, teamId);

  return (
    <Flex direction="column" w="full" h="full" minH={0} bg="rgba(0,0,0,0.15)">
      {/* ── ROW 1: Team Defensive Stats Row ── */}
      <TeamStatsHeader
        stats={statsPayload}
        colors={teamDetails.colors}
        shortName={teamDetails.shortName}
      />

      {/* ── ROW 2: Filtered Table & Spacing infograph ── */}
      <Flex flex={1} minH={0} overflow="hidden">
        {/* Left Column: tackles table (56%) */}
        <Box w="56%" p="6px" borderRight="1px solid rgba(255,255,255,0.08)" display="flex" flexDirection="column" minH={0}>
          {enriched.length > 0 ? (
            <FilteredDefenderTable
              defenders={enriched}
              teamColors={teamDetails.colors}
            />
          ) : (
            <Flex align="center" justify="center" h="full">
              <Text fontSize="11px" color="text.muted">No defensive tackles recorded</Text>
            </Flex>
          )}
        </Box>

        {/* Right Column: Spacing infographics (44%) */}
        <Box w="44%" p="6px" minH={0} display="flex" flexDirection="column">
          <PressureGapFitInfographic
            scatter={gapFitScatter}
            pressure={pressureProfile}
            colors={teamDetails.colors}
          />
        </Box>
      </Flex>
    </Flex>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT (Dual side-by-side defensive analytics container)
// ═══════════════════════════════════════════════════════════════
export const GameProductionDefenseProd = ({ game, awayId, homeId, awayShort, homeShort }) => {
  const resolvedAwayId = resolveTeamId(awayId);
  const resolvedHomeId = resolveTeamId(homeId);
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
          Defensive Disruption, Containment & Havoc Map
        </Text>
      </Box>

      <Flex w="full" h="400px" bg="bg.secondary" overflow="hidden">
        <Box flex={1} minW={0} borderRight="1px solid rgba(255,255,255,0.08)">
          <TeamDefensePanelProd
            teamId={resolvedAwayId}
            opponentId={resolvedHomeId}
            defenders={individualStats[resolvedAwayId]?.defense ?? []}
            advancedTeam={advancedTeam[resolvedAwayId] ?? {}}
            opponentAdvanced={advancedTeam[resolvedHomeId] ?? {}}
          />
        </Box>
        <Box flex={1} minW={0}>
          <TeamDefensePanelProd
            teamId={resolvedHomeId}
            opponentId={resolvedAwayId}
            defenders={individualStats[resolvedHomeId]?.defense ?? []}
            advancedTeam={advancedTeam[resolvedHomeId] ?? {}}
            opponentAdvanced={advancedTeam[resolvedAwayId] ?? {}}
          />
        </Box>
      </Flex>
    </Box>
  );
};
