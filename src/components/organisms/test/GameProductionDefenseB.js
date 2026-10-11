import { Box, Flex, Grid, Text, VStack } from "@chakra-ui/react";

// ═══════════════════════════════════════════════════════════════
// AUTHENTIC GAME DATA PAYLOAD (JSU vs PVAMU) — TACKLE INTELLIGENCE SCHEMA
// ═══════════════════════════════════════════════════════════════
const TEAMS = {
  jsu: {
    meta: {
      shortName: "JSU",
      mascot: "Tigers",
      colors: { primary: "#002147", secondary: "#FFFFFF", accent: "#4A90D9" },
    },
    tackleStats: {
      totalTackles: 46.5,
      avgTackleDepth: 2.8,
      missedTackles: 4,
      swarmFactor: 0.44,
      depthShares: { behindLos: 12, short: 46, medium: 32, deep: 10 },
      sectors: {
        DL: { tackles: 12.0, tfl: 3.0, sacks: 0, label: "Trench Contain" },
        LB: { tackles: 14.5, tfl: 1.5, sacks: 0, label: "Core Leverage" },
        DB: { tackles: 20.0, tfl: 0.0, sacks: 0, label: "Secondary Saves" },
      },
    },
    players: [
      { name: "Pulliam,Reid", position: "LB", tackles: 10.5, solo: 7, assisted: 7, sacks: 0, tfl: 0.5, hurries: 1, pbu: 1, interceptions: 0, ff: 0, fr: 0 },
      { name: "Sallis,Kam", position: "DB", tackles: 9.0, solo: 7, assisted: 4, sacks: 0, tfl: 0, hurries: 0, pbu: 0, interceptions: 0, ff: 1, fr: 0 },
      { name: "Hawkins,Shamar", position: "DB", tackles: 7.0, solo: 6, assisted: 2, sacks: 0, tfl: 0, hurries: 1, pbu: 0, interceptions: 0, ff: 0, fr: 1 },
      { name: "Ivory,Quincy", position: "DL", tackles: 4.5, solo: 2, assisted: 5, sacks: 0, tfl: 0.5, hurries: 1, pbu: 0, interceptions: 0, ff: 0, fr: 0 },
      { name: "Taylor,Ashton", position: "DL", tackles: 4.0, solo: 4, assisted: 0, sacks: 0, tfl: 2, hurries: 2, pbu: 0, interceptions: 0, ff: 0, fr: 0 },
      { name: "Washington,b.j.", position: "LB", tackles: 4.0, solo: 2, assisted: 4, sacks: 0, tfl: 0.5, hurries: 0, pbu: 0, interceptions: 0, ff: 0, fr: 0 },
      { name: "Williams,Jeremiah", position: "DL", tackles: 3.5, solo: 3, assisted: 1, sacks: 0, tfl: 1, hurries: 0, pbu: 0, interceptions: 0, ff: 1, fr: 0 },
    ],
    opponent: {
      shortName: "PVAMU",
      metrics: {
        powerContain: 0.82,
        explosiveAllowed: 3,
        tacklesAtLos: 15,
        redzoneStopRate: 0.91,
      },
    },
  },
  pvamu: {
    meta: {
      shortName: "PVAMU",
      mascot: "Panthers",
      colors: { primary: "#4B0082", secondary: "#FFB81C", accent: "#FFB81C" },
    },
    tackleStats: {
      totalTackles: 27.0,
      avgTackleDepth: 3.4,
      missedTackles: 6,
      swarmFactor: 0.36,
      depthShares: { behindLos: 8, short: 38, medium: 36, deep: 18 },
      sectors: {
        DL: { tackles: 7.0, tfl: 1.0, sacks: 0, label: "Trench Contain" },
        LB: { tackles: 8.0, tfl: 1.5, sacks: 0.5, label: "Core Leverage" },
        DB: { tackles: 12.0, tfl: 0.5, sacks: 0, label: "Secondary Saves" },
      },
    },
    players: [
      { name: "Starling,Darrell", position: "LB", tackles: 6.0, solo: 4, assisted: 4, sacks: 0.5, tfl: 1, hurries: 0, pbu: 0, interceptions: 0, ff: 0, fr: 0 },
      { name: "Parker,Kennedy", position: "DL", tackles: 5.0, solo: 3, assisted: 4, sacks: 0, tfl: 1, hurries: 0, pbu: 0, interceptions: 0, ff: 0, fr: 0 },
      { name: "Randle,Travor", position: "DB", tackles: 4.0, solo: 3, assisted: 2, sacks: 0, tfl: 0, hurries: 0, pbu: 1, interceptions: 0, ff: 0, fr: 0 },
      { name: "Amao,Kamren", position: "DB", tackles: 3.5, solo: 2, assisted: 3, sacks: 0, tfl: 0.5, hurries: 0, pbu: 0, interceptions: 0, ff: 0, fr: 0 },
      { name: "McGee,DeAlo", position: "DB", tackles: 2.5, solo: 2, assisted: 1, sacks: 0, tfl: 0, hurries: 0, pbu: 0, interceptions: 0, ff: 0, fr: 0 },
      { name: "Davis,Cornelius", position: "LB", tackles: 2.0, solo: 2, assisted: 0, sacks: 0, tfl: 0, hurries: 0, pbu: 0, interceptions: 0, ff: 0, fr: 0 },
      { name: "Ward,Trinity", position: "DL", tackles: 2.0, solo: 2, assisted: 0, sacks: 0, tfl: 0, hurries: 0, pbu: 0, interceptions: 0, ff: 0, fr: 0 },
    ],
    opponent: {
      shortName: "JSU",
      metrics: {
        powerContain: 0.71,
        explosiveAllowed: 6,
        tacklesAtLos: 8,
        redzoneStopRate: 0.80,
      },
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const fmtPct = (n) => `${Math.round((n ?? 0) * 100)}%`;
const fmt1 = (n) => (n ?? 0).toFixed(1);

function getLastNameWithInitial(name) {
  if (!name.includes(",")) return name;
  const parts = name.split(",");
  const lastName = parts[0].trim();
  const firstInitial = parts[1].trim()[0] || "";
  return `${lastName}, ${firstInitial}.`;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

// ─── TACKLE DEPTH SHARES SEGMENTED SPECTRUM (ROW 1) ───
const TackleSharesFingerprint = ({ stats, colors }) => {
  const shares = stats.depthShares;
  const swarmPct = stats.swarmFactor * 100;
  const soloPct = 100 - swarmPct;

  return (
    <Grid templateColumns="1.2fr 2fr" gap="8px" w="full">
      {/* Solo vs Assisted Swarm Factor */}
      <VStack align="stretch" gap="1px" p="5px" bg="rgba(255,255,255,0.02)" border="1px solid whiteAlpha.100" borderRadius="xs">
        <Flex justify="space-between" align="baseline">
          <Text fontSize="7.5px" fontWeight="950" color="text.muted" textTransform="uppercase">
            Tackle Swarm Density
          </Text>
          <Text fontSize="9px" fontWeight="950" color={colors.accent || "#4A90D9"}>
            {Math.round(swarmPct)}% Swarm
          </Text>
        </Flex>
        {/* Swarm Density Ratio Bar */}
        <Box h="6px" w="full" bg="whiteAlpha.100" borderRadius="sm" overflow="hidden" display="flex" mt="2px">
          <Box h="full" w={`${soloPct}%`} bg={colors.accent || "#4A90D9"} />
          <Box h="full" w={`${swarmPct}%`} bg="rgba(255, 255, 255, 0.25)" />
        </Box>
        <Flex justify="space-between" fontSize="5.5px" fontWeight="900" color="text.muted" mt="1.5px">
          <Text>SOLO: {Math.round(soloPct)}%</Text>
          <Text>ASSIST: {Math.round(swarmPct)}%</Text>
        </Flex>
      </VStack>

      {/* Segmented Tackle Depth Spectrum */}
      <VStack align="stretch" gap="1px" p="5px" bg="rgba(255,255,255,0.02)" border="1px solid whiteAlpha.100" borderRadius="xs">
        <Flex justify="space-between" align="baseline">
          <Text fontSize="7.5px" fontWeight="950" color="text.muted" textTransform="uppercase">
            Tackle Depth Shares (LOS to Secondary)
          </Text>
          <Text fontSize="9px" fontWeight="950" color="text.primary">
            Avg Depth: {fmt1(stats.avgTackleDepth)}y
          </Text>
        </Flex>

        {/* Continuous Segmented Bar */}
        <Box h="6px" w="full" bg="whiteAlpha.100" borderRadius="sm" overflow="hidden" display="flex" mt="2px">
          {shares.behindLos > 0 && <Box h="full" w={`${shares.behindLos}%`} bg="#E53E3E" />}
          {shares.short > 0 && <Box h="full" w={`${shares.short}%`} bg="#F6AD55" />}
          {shares.medium > 0 && <Box h="full" w={`${shares.medium}%`} bg="#4A90D9" />}
          {shares.deep > 0 && <Box h="full" w={`${shares.deep}%`} bg="whiteAlpha.400" />}
        </Box>

        <Grid templateColumns="repeat(4, 1fr)" gap="1px" fontSize="5.5px" fontWeight="900" color="text.muted" mt="1.5px">
          <Text color="#E53E3E" truncate>TFL: {shares.behindLos}%</Text>
          <Text color="#F6AD55" truncate>0-2Y: {shares.short}%</Text>
          <Text color="#4A90D9" truncate>3-6Y: {shares.medium}%</Text>
          <Text color="text.muted" truncate textAlign="right">7Y+: {shares.deep}%</Text>
        </Grid>
      </VStack>
    </Grid>
  );
};

// ─── TACKLE SHARE LEADERBOARD WITH INDIVIDUAL SPLIT BARS (ROW 2 LEFT) ───
const TackleShareLeaderboard = ({ players, teamColors }) => {
  const accent = teamColors.accent || "#4A90D9";

  return (
    <VStack gap={0} align="stretch" w="full" h="full" minH={0}>
      {/* Column Headers */}
      <Grid templateColumns="1.2fr 0.4fr 1.6fr 0.8fr" gap={1} py="4px" borderBottom="1px solid whiteAlpha.200" flexShrink={0}>
        <Text fontSize="7.5px" fontWeight="900" color="text.muted" textTransform="uppercase">Player</Text>
        <Text fontSize="7.5px" fontWeight="900" color="text.muted" textTransform="uppercase" textAlign="right">TKL</Text>
        <Text fontSize="7.5px" fontWeight="900" color="text.muted" textTransform="uppercase" pl={3}>Solo / Assist Split Bar</Text>
        <Text fontSize="7.5px" fontWeight="900" color="text.muted" textTransform="uppercase" textAlign="right">Disrupt</Text>
      </Grid>

      {/* Players List */}
      <Box flex={1} overflowY="auto">
        {players.map((p) => {
          const totalTkl = p.tackles;
          const soloShare = totalTkl > 0 ? (p.solo / totalTkl) * 100 : 0;
          const astShare = totalTkl > 0 ? ((p.assisted * 0.5) / totalTkl) * 100 : 0;

          // Impact Indicators (Sacks, TFLs, Hurries, PBUs, INTs, Turnovers Forced)
          const isHighDisrupt = p.sacks > 0 || p.tfl > 0 || p.pbu > 0 || p.interceptions > 0 || p.ff > 0;

          return (
            <Grid
              key={p.name}
              templateColumns="1.2fr 0.4fr 1.6fr 0.8fr"
              gap={1}
              py="5px"
              alignItems="center"
              borderBottom="1px solid whiteAlpha.50"
              _hover={{ bg: "whiteAlpha.50" }}
            >
              {/* Last Name + Position */}
              <Box minW={0} pl="2px">
                <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight="950" color="text.primary" truncate>
                  {getLastNameWithInitial(p.name)}
                </Text>
                <Text fontSize="6px" color="text.muted" fontWeight="900" textTransform="uppercase">
                  {p.position}
                </Text>
              </Box>

              {/* Total Tackle Circular Badge */}
              <Flex justify="flex-end">
                <Flex
                  w="20px"
                  h="20px"
                  borderRadius="full"
                  bg="whiteAlpha.100"
                  border={`1px solid ${totalTkl >= 7 ? accent : "whiteAlpha.200"}`}
                  align="center"
                  justify="center"
                  flexShrink={0}
                >
                  <Text fontSize="clamp(9px, 0.8vw, 11px)" fontWeight="950" color="text.primary">
                    {totalTkl}
                  </Text>
                </Flex>
              </Flex>

              {/* Individual Solo vs Assist Bar */}
              <Box px={3} w="full">
                <Box h="5px" w="full" bg="rgba(255,255,255,0.05)" borderRadius="full" overflow="hidden" display="flex">
                  {soloShare > 0 && <Box h="full" w={`${soloShare}%`} bg={accent} />}
                  {astShare > 0 && <Box h="full" w={`${astShare}%`} bg="rgba(255,255,255,0.3)" />}
                </Box>
                <Flex justify="space-between" fontSize="5px" fontWeight="900" color="text.muted" mt="1px">
                  <Text>{p.solo}S</Text>
                  <Text>{p.assisted}A</Text>
                </Flex>
              </Box>

              {/* Disruption Badges */}
              <Flex gap="2px" justify="flex-end" pr="2px">
                {p.sacks > 0 && (
                  <Flex w="10px" h="10px" bg="#E53E3E" borderRadius="xs" align="center" justify="center">
                    <Text fontSize="6px" fontWeight="950" color="white">S</Text>
                  </Flex>
                )}
                {p.tfl > 0 && (
                  <Flex w="10px" h="10px" bg="#F6AD55" borderRadius="xs" align="center" justify="center">
                    <Text fontSize="6px" fontWeight="950" color="black">T</Text>
                  </Flex>
                )}
                {p.hurries > 0 && (
                  <Flex w="10px" h="10px" bg="whiteAlpha.300" borderRadius="xs" align="center" justify="center">
                    <Text fontSize="6px" fontWeight="950" color="text.primary">H</Text>
                  </Flex>
                )}
                {p.pbu > 0 && (
                  <Flex w="10px" h="10px" bg="#4A90D9" borderRadius="xs" align="center" justify="center">
                    <Text fontSize="6px" fontWeight="950" color="white">P</Text>
                  </Flex>
                )}
                {p.ff > 0 && (
                  <Flex w="10px" h="10px" bg="#48BB78" borderRadius="xs" align="center" justify="center">
                    <Text fontSize="6px" fontWeight="950" color="white">F</Text>
                  </Flex>
                )}
                {!isHighDisrupt && <Text fontSize="9px" color="text.muted" fontWeight="900">—</Text>}
              </Flex>
            </Grid>
          );
        })}
      </Box>
    </VStack>
  );
};

// ─── DEFENSIVE LEVEL SECTORS & CONTAINMENT PROFILE (ROW 2 RIGHT) ───
const DefensiveLevelSectors = ({ stats, teamColors }) => {
  const accent = teamColors.accent || "#4A90D9";
  const DLShare = (stats.sectors.DL.tackles / stats.totalTackles) * 100;
  const LBShare = (stats.sectors.LB.tackles / stats.totalTackles) * 100;
  const DBShare = (stats.sectors.DB.tackles / stats.totalTackles) * 100;

  const sectors = [
    { name: "DL - Trench Front", share: DLShare, color: "#E53E3E", label: stats.sectors.DL.label, details: `${fmt1(stats.sectors.DL.tackles)} Stops · ${stats.sectors.DL.tfl} TFL` },
    { name: "LB - Core Leverage", share: LBShare, color: "#F6AD55", label: stats.sectors.LB.label, details: `${fmt1(stats.sectors.LB.tackles)} Stops · ${stats.sectors.LB.tfl} TFL` },
    { name: "DB - Secondary Flight", share: DBShare, color: accent, label: stats.sectors.DB.label, details: `${fmt1(stats.sectors.DB.tackles)} Stops · ${stats.sectors.DB.tfl} TFL` },
  ];

  return (
    <VStack gap="10px" align="stretch" w="full" h="full" minH={0}>
      {/* Defensive Levels Segment Share */}
      <VStack gap="6px" align="stretch">
        <Text fontSize="8px" color="text.muted" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em">
          Sector Tackle Contribution
        </Text>
        
        {sectors.map((s) => (
          <Box
            key={s.name}
            p="5px"
            bg="rgba(255,255,255,0.015)"
            border="1px solid whiteAlpha.100"
            borderLeft={`3px solid ${s.color}`}
            borderRadius="xs"
          >
            <Flex justify="space-between" align="baseline" mb="1px">
              <Text fontSize="8.5px" fontWeight="950" color="text.primary">
                {s.name}
              </Text>
              <Text fontSize="10px" fontWeight="950" color={s.color}>
                {Math.round(s.share)}%
              </Text>
            </Flex>
            <Box h="3px" w="full" bg="whiteAlpha.100" borderRadius="full" overflow="hidden" my="1.5px">
              <Box h="full" w={`${s.share}%`} bg={s.color} borderRadius="full" />
            </Box>
            <Flex justify="space-between" fontSize="5.5px" color="text.muted" fontWeight="800" textTransform="uppercase">
              <Text>{s.label}</Text>
              <Text color="text.secondary">{s.details}</Text>
            </Flex>
          </Box>
        ))}
      </VStack>

      {/* Gap Fit Containment Card */}
      <VStack gap="4px" align="stretch" flex={1} minH={0}>
        <Text fontSize="8px" color="text.muted" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em">
          Front-7 Alignment & Containment Fit
        </Text>
        <Grid templateColumns="repeat(3, 1fr)" gap="4px" flex={1}>
          <Flex
            direction="column"
            justify="center"
            px="6px"
            py="4px"
            bg="rgba(255,255,255,0.02)"
            border="1px solid whiteAlpha.100"
            borderRadius="sm"
          >
            <Text fontSize="14px" color="#48BB78" fontWeight="950" lineHeight={1.0}>
              {fmt1(stats.avgTackleDepth)}y
            </Text>
            <Text fontSize="6.5px" color="text.secondary" fontWeight="900" textTransform="uppercase" mt="2px">
              Avg Depth
            </Text>
            <Text fontSize="5px" color="text.muted" fontWeight="800" textTransform="uppercase" mt="0.5px">
              Containment yardage
            </Text>
          </Flex>

          <Flex
            direction="column"
            justify="center"
            px="6px"
            py="4px"
            bg="rgba(255,255,255,0.02)"
            border="1px solid whiteAlpha.100"
            borderRadius="sm"
          >
            <Text fontSize="14px" color="#E53E3E" fontWeight="950" lineHeight={1.0}>
              {stats.missedTackles}
            </Text>
            <Text fontSize="6.5px" color="text.secondary" fontWeight="900" textTransform="uppercase" mt="2px">
              Missed Tackles
            </Text>
            <Text fontSize="5px" color="text.muted" fontWeight="800" textTransform="uppercase" mt="0.5px">
              Failed wrap-ups
            </Text>
          </Flex>

          <Flex
            direction="column"
            justify="center"
            px="6px"
            py="4px"
            bg="rgba(255,255,255,0.02)"
            border="1px solid whiteAlpha.100"
            borderRadius="sm"
          >
            <Text fontSize="14px" color="#F6AD55" fontWeight="950" lineHeight={1.0}>
              {stats.totalTackles}
            </Text>
            <Text fontSize="6.5px" color="text.secondary" fontWeight="900" textTransform="uppercase" mt="2px">
              Stops Forced
            </Text>
            <Text fontSize="5px" color="text.muted" fontWeight="800" textTransform="uppercase" mt="0.5px">
              Physical defense
            </Text>
          </Flex>
        </Grid>
      </VStack>
    </VStack>
  );
};

// ─── TACTICAL DEFENSIVE PRESSURE MATRIX (ROW 3) ───
const TacticalPressureMatrix = ({ opponent }) => {
  const list = [
    { label: "Power Contain Rate", val: fmtPct(opponent.metrics.powerContain), sub: "short yardage stop rate", color: "#F6AD55" },
    { label: "Explosive Fits Allowed", val: opponent.metrics.explosiveAllowed, sub: "runs of 10+ yards allowed", color: "#E53E3E" },
    { label: "Tackles at/behind LOS", val: opponent.metrics.tacklesAtLos, sub: "physical front stops", color: "#48BB78" },
    { label: "Red Zone Stop Share", val: fmtPct(opponent.metrics.redzoneStopRate), sub: "RZ defensive leverage", color: "#4A90D9" },
  ];

  return (
    <Box px="8px" py="5px" borderTop="1px solid whiteAlpha.100" flexShrink={0} bg="rgba(0,0,0,0.2)">
      <Flex align="center" gap={1.5} mb="4px">
        <Box w="3px" h="10px" bg="#4A90D9" borderRadius="sm" />
        <Text fontSize="7.5px" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.06em">
          {opponent.shortName} Run Defense Containment & Gap Disruption Index
        </Text>
      </Flex>
      <Grid templateColumns="repeat(4, 1fr)" gap="6px">
        {list.map((m) => (
          <Flex
            key={m.label}
            direction="column"
            px="6px"
            py="4.5px"
            bg="rgba(255,255,255,0.015)"
            border="1px solid whiteAlpha.100"
            borderRadius="xs"
          >
            <Flex justify="space-between" align="baseline">
              <Text fontSize="7px" fontWeight="900" color="text.secondary" truncate maxW="70%">
                {m.label}
              </Text>
              <Text fontSize="10px" fontWeight="950" color={m.color}>
                {m.val}
              </Text>
            </Flex>
            <Text fontSize="5px" color="text.muted" fontWeight="800" textTransform="uppercase" mt="1.5px">
              {m.sub}
            </Text>
          </Flex>
        ))}
      </Grid>
    </Box>
  );
};

// ─── COMPANION ORCHESTRATOR FOR SINGLE TEAM PANEL ───
const TeamDefensePanelB = ({ teamKey }) => {
  const data = TEAMS[teamKey];
  const primary = data.meta.colors.primary;
  const accent = data.meta.colors.accent;

  return (
    <Flex direction="column" w="full" h="full" minH={0} bg="rgba(0,0,0,0.15)">
      {/* ── ROW 1: Heading & Team Fingerprint ── */}
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
            {data.meta.shortName} Tackle Intelligence & Run Containment (Variant B)
          </Text>
        </Flex>
        <TackleSharesFingerprint stats={data.tackleStats} colors={data.meta.colors} />
      </Flex>

      {/* ── ROW 2: Base Table & Spotlight ── */}
      <Flex flex={1} minH={0} overflow="hidden">
        {/* Roster Defensive Table (Left 58%) */}
        <Box w="58%" p="5px" borderRight="1px solid whiteAlpha.100" display="flex" flexDirection="column" minH={0}>
          <TackleShareLeaderboard
            players={data.players}
            teamColors={data.meta.colors}
          />
        </Box>

        {/* Team Havoc & Disruption dashboard (Right 42%) */}
        <Box w="42%" p="6px" minH={0} display="flex" flexDirection="column">
          <DefensiveLevelSectors
            stats={data.tackleStats}
            teamColors={data.meta.colors}
          />
        </Box>
      </Flex>

      {/* ── ROW 3: Defensive Leverages ── */}
      <TacticalPressureMatrix opponent={data.opponent} />
    </Flex>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT (4x2 split layout)
// ═══════════════════════════════════════════════════════════════
export const GameProductionDefenseB = () => {
  return (
    <Flex w="full" h="full" bg="bg.secondary" borderRadius="lg" overflow="hidden" border="1px solid whiteAlpha.100">
      <Box flex={1} minW={0} borderRight="1px solid whiteAlpha.100">
        <TeamDefensePanelB teamKey="jsu" />
      </Box>
      <Box flex={1} minW={0}>
        <TeamDefensePanelB teamKey="pvamu" />
      </Box>
    </Flex>
  );
};
