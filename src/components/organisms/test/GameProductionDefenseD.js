import { Box, Flex, Grid, Text, VStack } from "@chakra-ui/react";

// ═══════════════════════════════════════════════════════════════
// AUTHENTIC GAME DATA PAYLOAD (JSU vs PVAMU) — DEFENSIVE SCHEMA D
// ═══════════════════════════════════════════════════════════════
const TEAMS = {
  jsu: {
    meta: {
      shortName: "JSU",
      colors: { primary: "#002147", secondary: "#FFFFFF", accent: "#4A90D9" },
    },
    teamStats: {
      scrimmagePlays: 62,
      stopRate: 0.435,
      havocTotal: 12,
      havocRush: 7,
      havocPass: 5,
      tfl: 6.0,
      sacks: 1.0,
      pd: 2,
      interceptions: 1,
      ff: 2,
    },
    players: [
      { name: "Pulliam,Reid", position: "LB", tackles: 10.5, solo: 7, assisted: 7, sacks: 0, tfl: 0.5, pd: 1, interceptions: 0, ff: 0 },
      { name: "Sallis,Kam", position: "DB", tackles: 9.0, solo: 7, assisted: 4, sacks: 0, tfl: 0, pd: 0, interceptions: 0, ff: 1 },
      { name: "Hawkins,Shamar", position: "DB", tackles: 7.0, solo: 6, assisted: 2, sacks: 0, tfl: 0, pd: 0, interceptions: 0, ff: 0 },
      { name: "Ivory,Quincy", position: "DL", tackles: 4.5, solo: 2, assisted: 5, sacks: 0, tfl: 0.5, pd: 0, interceptions: 0, ff: 0 },
      { name: "Taylor,Ashton", position: "DL", tackles: 4.0, solo: 4, assisted: 0, sacks: 0, tfl: 2.0, pd: 0, interceptions: 0, ff: 0 },
      { name: "Washington,b.j.", position: "LB", tackles: 4.0, solo: 2, assisted: 4, sacks: 0, tfl: 0.5, pd: 0, interceptions: 0, ff: 0 },
      { name: "Williams,Jeremiah", position: "DL", tackles: 3.5, solo: 3, assisted: 1, sacks: 0, tfl: 1.0, pd: 0, interceptions: 0, ff: 1 },
    ],
    pressureProfile: {
      edgeRushShare: 45,
      interiorShare: 35,
      blitzShare: 20,
    },
    gapFitScatter: [
      { name: "Ashton Taylor", role: "DL (Trench)", depth: -0.5, color: "#E53E3E" },
      { name: "Reid Pulliam", role: "LB (Core Fit)", depth: 1.8, color: "#F6AD55" },
      { name: "Kam Sallis", role: "DB (Secondary)", depth: 4.8, color: "#4A90D9" },
    ],
  },
  pvamu: {
    meta: {
      shortName: "PVAMU",
      colors: { primary: "#4B0082", secondary: "#FFB81C", accent: "#FFB81C" },
    },
    teamStats: {
      scrimmagePlays: 76,
      stopRate: 0.385,
      havocTotal: 6,
      havocRush: 4,
      havocPass: 2,
      tfl: 4.0,
      sacks: 1.0,
      pd: 1,
      interceptions: 0,
      ff: 0,
    },
    players: [
      { name: "Starling,Darrell", position: "LB", tackles: 6.0, solo: 4, assisted: 4, sacks: 0.5, tfl: 1.0, pd: 0, interceptions: 0, ff: 0 },
      { name: "Parker,Kennedy", position: "DL", tackles: 5.0, solo: 3, assisted: 4, sacks: 0, tfl: 1.0, pd: 0, interceptions: 0, ff: 0 },
      { name: "Randle,Travor", position: "DB", tackles: 4.0, solo: 3, assisted: 2, sacks: 0, tfl: 0, pd: 1, interceptions: 0, ff: 0 },
      { name: "Amao,Kamren", position: "DB", tackles: 3.5, solo: 2, assisted: 3, sacks: 0, tfl: 0.5, pd: 0, interceptions: 0, ff: 0 },
      { name: "McGee,DeAlo", position: "DB", tackles: 2.5, solo: 2, assisted: 1, sacks: 0, tfl: 0, pd: 0, interceptions: 0, ff: 0 },
      { name: "Davis,Cornelius", position: "LB", tackles: 2.0, solo: 2, assisted: 0, sacks: 0, tfl: 0, pd: 0, interceptions: 0, ff: 0 },
      { name: "Ward,Trinity", position: "DL", tackles: 2.0, solo: 2, assisted: 0, sacks: 0, tfl: 0, pd: 0, interceptions: 0, ff: 0 },
    ],
    pressureProfile: {
      edgeRushShare: 35,
      interiorShare: 45,
      blitzShare: 20,
    },
    gapFitScatter: [
      { name: "Kennedy Parker", role: "DL (Trench)", depth: 0.8, color: "#E53E3E" },
      { name: "Darrell Starling", role: "LB (Core Fit)", depth: 2.2, color: "#F6AD55" },
      { name: "Travor Randle", role: "DB (Secondary)", depth: 5.5, color: "#4A90D9" },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// FORMATTERS & HELPERS
// ═══════════════════════════════════════════════════════════════
const fmtPct = (n) => `${Math.round((n ?? 0) * 100)}%`;
const fmt1 = (n) => (n ?? 0).toFixed(1);

function getLastName(name) {
  if (!name.includes(",")) return name;
  return name.split(",")[0].trim();
}

function calcPlayerHavoc(p) {
  return (p.sacks ?? 0) + (p.tfl ?? 0) + (p.pd ?? 0) + (p.interceptions ?? 0) + (p.ff ?? 0);
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

// ─── TEAM HEADER SPLIT ROW (ROW 1) ───
const TeamStatsHeader = ({ stats, colors, shortName }) => {
  const accent = colors.accent || "#4A90D9";

  const cards = [
    { label: "Plays Allowed", value: stats.scrimmagePlays, details: "Total scrimmage plays", color: "text.primary" },
    { label: "Stop Rate", value: fmtPct(stats.stopRate), details: "Containment efficiency", color: "#48BB78" },
    { 
      label: "Havoc plays", 
      value: `${stats.havocTotal}`, 
      valueSplit: `[${stats.havocRush}R / ${stats.havocPass}P]`,
      details: "TFL+Sck+PD+Int+FF", 
      color: "#F6AD55" 
    },
    { label: "TFLs Forced", value: fmt1(stats.tfl), details: "Behind scrimmage line", color: "#F6AD55" },
    { label: "Sacks", value: fmt1(stats.sacks), details: "Trench drops forced", color: "#E53E3E" },
    { label: "Passes Def", value: stats.pd, details: "Deflection total", color: "#4A90D9" },
    { label: "Interceptions", value: stats.interceptions, details: "Air takeaways", color: "#48BB78" },
    { label: "Fumbles Forced", value: stats.ff, details: "Ball security punches", color: "#48BB78" },
  ];

  return (
    <Box w="full" px="8px" py="6px" bg={`linear-gradient(90deg, ${colors.primary}33 0%, transparent 80%)`} borderBottom="1px solid whiteAlpha.100" flexShrink={0}>
      <Flex align="center" gap={2} mb="5px">
        <Box w="3px" h="11px" bg={accent} borderRadius="sm" />
        <Text fontSize="10px" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.06em">
          {shortName} Team Defensive Production Dashboard (Variant D)
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
            border="1px solid whiteAlpha.100"
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

// ─── FILTERED TACKLES TABLE (ROW 2 LEFT) ───
const FilteredDefenderTable = ({ players, teamColors }) => {
  const filteredPlayers = players.filter((p) => p.tackles >= 2.0);

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

      <Box flex={1} overflowY="auto">
        {filteredPlayers.map((p) => {
          const havocScore = calcPlayerHavoc(p);
          
          const sckColor = p.sacks > 0 ? "#E53E3E" : "text.secondary";
          const sckWeight = p.sacks > 0 ? "950" : "800";

          const tflColor = p.tfl > 0 ? "#F6AD55" : "text.secondary";
          const tflWeight = p.tfl > 0 ? "950" : "800";

          const pdColor = p.pd > 0 ? "#4A90D9" : "text.secondary";
          const pdWeight = p.pd > 0 ? "950" : "800";

          const ffColor = p.ff > 0 ? "#48BB78" : "text.secondary";
          const ffWeight = p.ff > 0 ? "950" : "800";

          const havocColor = havocScore >= 1.5 ? "#F6AD55" : havocScore > 0 ? "text.primary" : "text.muted";
          const havocWeight = havocScore > 0 ? "950" : "800";

          return (
            <Grid
              key={p.name}
              templateColumns={templateColumns}
              gap={1}
              py="5.5px"
              alignItems="center"
              borderBottom="1px solid whiteAlpha.50"
              _hover={{ bg: "whiteAlpha.50" }}
            >
              <Box minW={0} pl="2px">
                <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight="950" color="text.primary" truncate>
                  {getLastName(p.name)}
                </Text>
                <Text fontSize="6px" color="text.muted" fontWeight="900" textTransform="uppercase">
                  {p.position}
                </Text>
              </Box>

              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight="900" color="text.primary" textAlign="right">
                {fmt1(p.tackles)}
              </Text>

              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight={tflWeight} color={tflColor} textAlign="right">
                {p.tfl > 0 ? fmt1(p.tfl) : "—"}
              </Text>

              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight={sckWeight} color={sckColor} textAlign="right">
                {p.sacks > 0 ? fmt1(p.sacks) : "—"}
              </Text>

              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight={pdWeight} color={pdColor} textAlign="right">
                {p.pd > 0 ? p.pd : "—"}
              </Text>

              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight={ffWeight} color={ffColor} textAlign="right">
                {p.ff > 0 ? p.ff : "—"}
              </Text>

              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight={havocWeight} color={havocColor} textAlign="right">
                {havocScore > 0 ? fmt1(havocScore) : "—"}
              </Text>
            </Grid>
          );
        })}
      </Box>
    </VStack>
  );
};

// ─── PRESSURE RADAR & TACKLE FIT SCATTER MAP (ROW 2 RIGHT - CREATIVE INFOGRAPHIC) ───
const PressureGapFitInfographic = ({ scatter, pressure, colors }) => {
  const accent = colors.accent || "#4A90D9";

  return (
    <VStack gap="10px" align="stretch" w="full" h="full" minH={0}>
      {/* 1. Pressure Origin Distribution */}
      <VStack gap="4px" align="stretch">
        <Text fontSize="7.5px" color="text.muted" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em">
          Pressure Origin Heatmap (Trench vs Edge vs Support)
        </Text>
        
        <Box p="6px" bg="rgba(255,255,255,0.015)" border="1px solid whiteAlpha.100" borderRadius="xs">
          {/* Segmented Origin Bar */}
          <Box h="7px" w="full" bg="whiteAlpha.100" borderRadius="sm" overflow="hidden" display="flex">
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

      {/* 2. Tackle Spacing & Gap Fit Map */}
      <VStack gap="4px" align="stretch" flex={1} minH={0}>
        <Text fontSize="7.5px" color="text.muted" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em">
          Containment Spacing & Gap Fit Map (Horizontal Yard-line scatter)
        </Text>

        <Box flex={1} bg="rgba(255,255,255,0.01)" border="1px solid whiteAlpha.100" borderRadius="xs" p="6px" position="relative" display="flex" flexDirection="column" justify="space-around">
          {/* Yard line markers */}
          <Flex justify="space-between" borderBottom="1px dashed whiteAlpha.200" pb="2px" position="relative" h="10px">
            {[-2, 0, 2, 4, 6, 8].map((y) => (
              <Box key={y} position="relative" flex={1} textAlign="center">
                <Text fontSize="5px" color="text.muted" fontWeight="800">
                  {y > 0 ? `+${y}y` : `${y}y`}
                </Text>
                {/* Visual dashed vertical guideline */}
                <Box w="1px" h="80px" borderRight="1px dashed whiteAlpha.50" position="absolute" top="7px" left="50%" zIndex={0} />
              </Box>
            ))}
          </Flex>

          {/* Plot nodes */}
          <VStack gap="6px" align="stretch" mt="2px" zIndex={1} position="relative">
            {scatter.map((node) => {
              // Convert yard depth into horizontal percentage from -3y to +9y (range of 12y)
              const minYard = -3;
              const maxYard = 9;
              const pct = ((node.depth - minYard) / (maxYard - minYard)) * 100;
              const boundedPct = Math.max(2, Math.min(98, pct));

              return (
                <Box key={node.name} position="relative" h="18px" bg="rgba(0,0,0,0.2)" border="1px solid whiteAlpha.50" borderRadius="xs" px="3px" py="1px">
                  <Flex align="center" gap="4px">
                    {/* Tiny Role Info */}
                    <Box>
                      <Text fontSize="7px" fontWeight="950" color="text.primary" leading={1}>
                        {node.name}
                      </Text>
                      <Text fontSize="4.5px" color="text.secondary" fontWeight="800" textTransform="uppercase">
                        {node.role}
                      </Text>
                    </Box>
                  </Flex>

                  {/* Horizontal node dot */}
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
                    {/* Depth label inside dot */}
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

// ─── COMPANION ORCHESTRATOR FOR SINGLE TEAM PANEL ───
const TeamDefensePanelD = ({ teamKey }) => {
  const data = TEAMS[teamKey];

  return (
    <Flex direction="column" w="full" h="full" minH={0} bg="rgba(0,0,0,0.15)">
      {/* ── ROW 1: Team Production Header Card ── */}
      <TeamStatsHeader
        stats={data.teamStats}
        colors={data.meta.colors}
        shortName={data.meta.shortName}
      />

      {/* ── ROW 2: Filtered Table & Tackle Scatter Map ── */}
      <Flex flex={1} minH={0} overflow="hidden">
        {/* Filtered Defender Table (Left 56%) */}
        <Box w="56%" p="6px" borderRight="1px solid whiteAlpha.100" display="flex" flexDirection="column" minH={0}>
          <FilteredDefenderTable
            players={data.players}
            teamColors={data.meta.colors}
          />
        </Box>

        {/* Origin & Scatter Scatter Infographic (Right 44%) */}
        <Box w="44%" p="6px" minH={0} display="flex" flexDirection="column">
          <PressureGapFitInfographic
            scatter={data.gapFitScatter}
            pressure={data.pressureProfile}
            colors={data.meta.colors}
          />
        </Box>
      </Flex>
    </Flex>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT (4x2 split layout)
// ═══════════════════════════════════════════════════════════════
export const GameProductionDefenseD = () => {
  return (
    <Flex w="full" h="full" bg="bg.secondary" borderRadius="lg" overflow="hidden" border="1px solid whiteAlpha.100">
      <Box flex={1} minW={0} borderRight="1px solid whiteAlpha.100">
        <TeamDefensePanelD teamKey="jsu" />
      </Box>
      <Box flex={1} minW={0}>
        <TeamDefensePanelD teamKey="pvamu" />
      </Box>
    </Flex>
  );
};
