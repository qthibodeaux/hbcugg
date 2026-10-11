import { useMemo } from "react";
import { Box, Flex, Grid, Text, VStack } from "@chakra-ui/react";
import { Shield, Target, Flame, Activity, Zap, TrendingUp, Crosshair } from "lucide-react";

// Canonical data set directly from 2025 SWAC Championship game (JSU vs PVAMU)
const TEAMS = {
  jsu: {
    meta: {
      shortName: "JSU",
      opponent: "PVAMU",
      colors: { primary: "#002147", accent: "#4A90D9" },
    },
    team: {
      plays: 76,
      stopRate: 0.67,
      avgThirdDownDist: 8.38,
      lateDownSuccess: 0.5217, // Opponent late-down success allowed
      pressureRate: 0.20,
      pressuredCompAllowed: 0.0, // 0/3 completions allowed under pressure!
      stuffRate: 0.1957,
      stoppedRunRate: 0.4348,
      takeaways: 3,
    },
    defenders: [
      { name: "Pulliam,Reid", pos: "LB", tackles: 10.5, tfl: 0.5, sacks: 0, pd: 1, ff: 0, qbh: 1, havoc: 2.5 },
      { name: "Sallis,Kam", pos: "DB", tackles: 9, tfl: 0, sacks: 0, pd: 0, ff: 1, qbh: 0, havoc: 1 },
      { name: "Hawkins,Shamar", pos: "DB", tackles: 7, tfl: 0, sacks: 0, pd: 0, ff: 0, qbh: 1, havoc: 1 },
      { name: "Ivory,Quincy", pos: "DL", tackles: 4.5, tfl: 0.5, sacks: 0, pd: 0, ff: 0, qbh: 1, havoc: 1.5 },
      { name: "Taylor,Ashton", pos: "DL", tackles: 4, tfl: 2.0, sacks: 0, pd: 0, ff: 0, qbh: 2, havoc: 4 },
      { name: "Washington,B.J.", pos: "LB", tackles: 4, tfl: 0.5, sacks: 0, pd: 0, ff: 0, qbh: 0, havoc: 0.5 },
      { name: "Williams,Jeremiah", pos: "DL", tackles: 3.5, tfl: 1.0, sacks: 0, pd: 0, ff: 1, qbh: 0, havoc: 2 },
      { name: "Ware,Jaylan", pos: "DL", tackles: 3, tfl: 0, sacks: 0, pd: 0, ff: 0, qbh: 0, havoc: 0 },
      { name: "Hargon,J'Cori", pos: "LB", tackles: 3, tfl: 0, sacks: 0, pd: 0, ff: 0, qbh: 0, havoc: 0 },
      { name: "Chisholm,KJ", pos: "DB", tackles: 3, tfl: 0, sacks: 0, pd: 1, ff: 0, qbh: 0, havoc: 1 },
    ],
  },
  pvamu: {
    meta: {
      shortName: "PVAMU",
      opponent: "JSU",
      colors: { primary: "#4B0082", accent: "#FFB81C" },
    },
    team: {
      plays: 42,
      stopRate: 0.67,
      avgThirdDownDist: 8.00,
      lateDownSuccess: 0.2727, // Opponent late-down success allowed
      pressureRate: 0.1667,
      pressuredCompAllowed: 0.1667, // 1/6 completions allowed under pressure
      stuffRate: 0.2308,
      stoppedRunRate: 0.4231,
      takeaways: 2,
    },
    defenders: [
      { name: "Starling,Darrell", pos: "LB", tackles: 6, tfl: 1.0, sacks: 0.5, pd: 0, ff: 0, qbh: 0, havoc: 1.5 },
      { name: "Parker,Kennedy", pos: "DL", tackles: 5, tfl: 1.0, sacks: 0, pd: 0, ff: 0, qbh: 0, havoc: 1 },
      { name: "Randle,Travor", pos: "DB", tackles: 4, tfl: 0, sacks: 0, pd: 1, ff: 0, qbh: 0, havoc: 1 },
      { name: "Amao,Kamren", pos: "DB", tackles: 3.5, tfl: 0.5, sacks: 0, pd: 0, ff: 0, qbh: 0, havoc: 0.5 },
      { name: "McGee,DeAlo", pos: "DB", tackles: 2.5, tfl: 0, sacks: 0, pd: 0, ff: 0, qbh: 0, havoc: 0 },
      { name: "Davis,Cornelius", pos: "LB", tackles: 2, tfl: 0, sacks: 0, pd: 0, ff: 0, qbh: 0, havoc: 0 },
      { name: "Ward,Trinity", pos: "DL", tackles: 2, tfl: 0, sacks: 0, pd: 0, ff: 0, qbh: 0, havoc: 0 },
    ],
  },
};

const fmtPct = (n) => `${Math.round((n ?? 0) * 100)}%`;
const fmtValue = (n) => (Number.isInteger(n) ? n : (n ?? 0).toFixed(1));

function displayName(name) {
  if (!name.includes(",")) return name;
  const [last, first] = name.split(",");
  return `${first.trim().charAt(0)}. ${last.trim()}`;
}

const TeamStatsHeader = ({ data }) => {
  const metrics = [
    { label: "Def Snaps", value: data.team.plays, sub: "Plays allowed", icon: Activity, color: data.meta.colors.accent },
    { label: "Stop Rate", value: fmtPct(data.team.stopRate), sub: "Drive stalls", icon: Shield, color: "#68D391" },
    { label: "3rd Dn Dist", value: `${fmtValue(data.team.avgThirdDownDist)}y`, sub: "Avg forced", icon: Target, color: "#F6AD55" },
    { label: "Pressured Comp%", value: fmtPct(data.team.pressuredCompAllowed), sub: "Opp pass heat", icon: Crosshair, color: "#E53E3E" },
    { label: "Stuff Rate", value: fmtPct(data.team.stuffRate), sub: "Tkl behind LOS", icon: Flame, color: "#F6AD55" },
    { label: "Zero Stops", value: fmtPct(data.team.stoppedRunRate), sub: "Runs <=0y", icon: Zap, color: "#63B3ED" },
    { label: "Takeaways", value: data.team.takeaways, sub: "INTs + FFs", icon: TrendingUp, color: "#68D391" },
  ];

  return (
    <Box 
      px="6px" 
      py="5px" 
      bg={`linear-gradient(90deg, ${data.meta.colors.primary}33 0%, rgba(20, 20, 22, 0.45) 85%)`}
      borderBottom="1px solid rgba(255,255,255,0.08)"
    >
      <Grid templateColumns="repeat(7, minmax(0, 1fr))" gap="4px">
        {metrics.map((metric) => (
          <Flex 
            key={metric.label} 
            direction="column" 
            bg="rgba(255,255,255,0.02)" 
            border="1px solid rgba(255,255,255,0.05)" 
            borderRadius="sm" 
            p="4px"
            position="relative"
            overflow="hidden"
            borderLeft={`2px solid ${metric.color}`}
          >
            <Flex justify="space-between" align="center" mb="1px" minW={0}>
              <Text fontSize="6px" color="text.muted" fontWeight="900" textTransform="uppercase" truncate>{metric.label}</Text>
            </Flex>
            <Text fontSize="clamp(10px, 0.9vw, 13px)" color="text.primary" fontWeight="950" lineHeight={1}>{metric.value}</Text>
          </Flex>
        ))}
      </Grid>
    </Box>
  );
};

const DefenderTable = ({ data }) => {
  const players = useMemo(() => {
    return data.defenders.filter((p) => p.tackles >= 2 || p.havoc > 0);
  }, [data.defenders]);

  return (
    <VStack align="stretch" gap={0} h="full" minH={0} bg="rgba(20, 20, 22, 0.2)" borderRight="1px solid rgba(255,255,255,0.08)" p="5px">
      <Flex align="center" justify="space-between" mb="3px">
        <Text fontSize="8px" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em">
          Roster Disruption Box
        </Text>
      </Flex>
      <Grid templateColumns="1.3fr 0.5fr repeat(6, 1fr)" gap={1} py="3px" borderBottom="2px solid rgba(255,255,255,0.12)">
        {["Player", "Pos", "Tkl", "TFL", "Sck", "PD", "FF", "QBH"].map((head) => (
          <Text 
            key={head} 
            fontSize="6.5px" 
            color="text.muted" 
            fontWeight="950" 
            textTransform="uppercase" 
            textAlign={head === "Player" || head === "Pos" ? "left" : "right"}
          >
            {head}
          </Text>
        ))}
      </Grid>
      <Box flex={1} minH={0} overflowY="auto">
        {players.map((player) => (
          <Grid 
            key={player.name} 
            templateColumns="1.3fr 0.5fr repeat(6, 1fr)" 
            gap={1} 
            alignItems="center" 
            py="4px" 
            borderBottom="1px solid rgba(255,255,255,0.06)" 
            _hover={{ bg: "rgba(255,255,255,0.03)" }}
          >
            <Text fontSize="clamp(8px, 0.65vw, 9.5px)" color="text.primary" fontWeight="900" truncate pl="1px">
              {displayName(player.name)}
            </Text>
            <Text fontSize="6.5px" color="text.muted" fontWeight="800">
              {player.pos}
            </Text>
            <Text fontSize="clamp(8px, 0.65vw, 9.5px)" color="text.secondary" fontWeight="850" textAlign="right">
              {fmtValue(player.tackles)}
            </Text>
            <Text fontSize="clamp(8px, 0.65vw, 9.5px)" color={player.tfl > 0 ? data.meta.colors.accent : "text.muted"} fontWeight="850" textAlign="right">
              {player.tfl > 0 ? fmtValue(player.tfl) : "-"}
            </Text>
            <Text fontSize="clamp(8px, 0.65vw, 9.5px)" color={player.sacks > 0 ? "#68D391" : "text.muted"} fontWeight="900" textAlign="right">
              {player.sacks > 0 ? fmtValue(player.sacks) : "-"}
            </Text>
            <Text fontSize="clamp(8px, 0.65vw, 9.5px)" color={player.pd > 0 ? "#63B3ED" : "text.muted"} fontWeight="850" textAlign="right">
              {player.pd > 0 ? player.pd : "-"}
            </Text>
            <Text fontSize="clamp(8px, 0.65vw, 9.5px)" color={player.ff > 0 ? "#E53E3E" : "text.muted"} fontWeight="850" textAlign="right">
              {player.ff > 0 ? player.ff : "-"}
            </Text>
            <Text fontSize="clamp(8px, 0.65vw, 9.5px)" color={player.qbh > 0 ? "#F6AD55" : "text.muted"} fontWeight="900" textAlign="right">
              {player.qbh > 0 ? player.qbh : "-"}
            </Text>
          </Grid>
        ))}
      </Box>
    </VStack>
  );
};

const LeverageVisuals = ({ data }) => {
  const avgDist = data.team.avgThirdDownDist;
  const pctDist = Math.min(100, (avgDist / 10) * 100);
  const pressVal = data.team.pressureRate;
  const pressComp = data.team.pressuredCompAllowed;

  return (
    <Grid templateRows="repeat(3, 1fr)" gap="4px" h="full" minH={0} p="6px">
      {/* Visual A: Down & Distance Battlefield Map */}
      <Box border="1px solid rgba(255,255,255,0.06)" bg="rgba(255,255,255,0.01)" borderRadius="sm" p="6px" display="flex" direction="column" justify="center">
        <Box w="full">
          <Flex justify="space-between" align="center" mb="3px">
            <Text fontSize="7.5px" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em">
              Leverage Track: Avg 3rd Down Forced
            </Text>
            <Text fontSize="7.5px" color="#F6AD55" fontWeight="950">
              {fmtValue(avgDist)}y Forced
            </Text>
          </Flex>
          {/* Visual Track */}
          <Box position="relative" h="16px" bg="rgba(255,255,255,0.04)" borderRadius="xs" border="1px solid rgba(255,255,255,0.06)" overflow="hidden">
            {/* Yard lines */}
            <Flex justify="space-between" position="absolute" top="0" left="0" w="full" h="full" px="6px" pointerEvents="none">
              {[0, 2, 4, 6, 8, 10].map((yd) => (
                <Flex key={yd} direction="column" align="center" justify="space-between" h="full" py="1px">
                  <Box w="1px" h="3px" bg="rgba(255,255,255,0.15)" />
                  <Text fontSize="4.5px" color="text.muted" fontWeight="800">{yd}y</Text>
                </Flex>
              ))}
            </Flex>
            {/* Stranglehold Highlight Zone */}
            <Box position="absolute" left="70%" w="30%" h="full" bg={`linear-gradient(90deg, transparent, ${data.meta.colors.accent}15)`} />
            {/* Live Indicator Pin */}
            <Box 
              position="absolute" 
              left={`${pctDist}%`} 
              top="50%" 
              transform="translate(-50%, -50%)" 
              w="6px" 
              h="6px" 
              borderRadius="full" 
              bg="#F6AD55" 
              boxShadow={`0 0 6px ${data.meta.colors.accent}`}
            />
            {/* Label at indicator */}
            <Box position="absolute" left={`${pctDist}%`} top="1px" transform="translateX(-50%)" bg="bg.secondary" px="2px" borderRadius="xs" border="1px solid #F6AD55" py="0.2px">
              <Text fontSize="4.5px" color="#F6AD55" fontWeight="900">{fmtValue(avgDist)}y</Text>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Visual B: Steel Trap Pressure & Coverage */}
      <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap="4px">
        {/* Pass Rush Metric */}
        <Box border="1px solid rgba(255,255,255,0.06)" bg="rgba(255,255,255,0.01)" borderRadius="sm" p="5px">
          <Flex justify="space-between" mb="2px">
            <Text fontSize="6.5px" color="text.muted" fontWeight="900" textTransform="uppercase">Pass Pressure Rate</Text>
            <Text fontSize="6.5px" color="#E53E3E" fontWeight="950">{fmtPct(pressVal)}</Text>
          </Flex>
          <Box h="4px" bg="rgba(255,255,255,0.06)" borderRadius="full" overflow="hidden" mb="3px">
            <Box h="full" w={`${pressVal * 100}%`} bg="#E53E3E" borderRadius="full" />
          </Box>
          <Text fontSize="5px" color="text.secondary" fontWeight="800" truncate>
            {fmtPct(pressVal)} dropbacks disrupted.
          </Text>
        </Box>

        {/* Coverage Containment */}
        <Box border="1px solid rgba(255,255,255,0.06)" bg="rgba(255,255,255,0.01)" borderRadius="sm" p="5px" position="relative" overflow="hidden">
          <Flex justify="space-between" mb="2px">
            <Text fontSize="6.5px" color="text.muted" fontWeight="900" textTransform="uppercase">Pressured Comp% Allowed</Text>
            <Text fontSize="6.5px" color="#68D391" fontWeight="950">{fmtPct(pressComp)}</Text>
          </Flex>
          <Box h="4px" bg="rgba(255,255,255,0.06)" borderRadius="full" overflow="hidden" mb="3px">
            <Box h="full" w={`${pressComp * 100}%`} bg="#68D391" borderRadius="full" />
          </Box>
          <Text fontSize="5px" color={pressComp === 0 ? "#68D391" : "text.secondary"} fontWeight="900" truncate>
            {pressComp === 0 ? "STEEL TRAP: 100% Lock!" : `${fmtPct(pressComp)} allowed under heat.`}
          </Text>
        </Box>
      </Grid>

      {/* Visual C: Trench Containment Profile (Run Stifling) */}
      <Box border="1px solid rgba(255,255,255,0.06)" bg="rgba(255,255,255,0.01)" borderRadius="sm" p="6px">
        <Text fontSize="7.5px" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em" mb="4px">
          Trench Run Containment
        </Text>
        <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap="6px" alignItems="center">
          {/* Stuff Rate */}
          <Box>
            <Flex justify="space-between" mb="1px">
              <Text fontSize="6.5px" color="text.muted" fontWeight="900" textTransform="uppercase">Stuff Rate (LOS)</Text>
              <Text fontSize="7.5px" color="#F6AD55" fontWeight="950">{fmtPct(data.team.stuffRate)}</Text>
            </Flex>
            <Box h="4px" bg="rgba(255,255,255,0.06)" borderRadius="full" overflow="hidden">
              <Box h="full" w={`${data.team.stuffRate * 100}%`} bg="#F6AD55" borderRadius="full" />
            </Box>
          </Box>
          {/* Zero Yard stops */}
          <Box>
            <Flex justify="space-between" mb="1px">
              <Text fontSize="6.5px" color="text.muted" fontWeight="900" textTransform="uppercase">Zero/Neg Run Stops</Text>
              <Text fontSize="7.5px" color="#63B3ED" fontWeight="950">{fmtPct(data.team.stoppedRunRate)}</Text>
            </Flex>
            <Box h="4px" bg="rgba(255,255,255,0.06)" borderRadius="full" overflow="hidden">
              <Box h="full" w={`${data.team.stoppedRunRate * 100}%`} bg="#63B3ED" borderRadius="full" />
            </Box>
          </Box>
        </Grid>
      </Box>
    </Grid>
  );
};

const TeamPanel = ({ teamKey }) => {
  const data = TEAMS[teamKey];
  return (
    <Flex direction="column" h="full" minH={0}>
      {/* Visual Title strip for side-by-side context */}
      <Flex px="8px" py="4px" bg={data.meta.colors.primary} borderBottom="1px solid rgba(255,255,255,0.08)" align="center" gap={1.5}>
        <Box w="3px" h="10px" bg={data.meta.colors.accent} borderRadius="full" />
        <Text fontSize="9px" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em">
          {data.meta.shortName} Defensive leverage
        </Text>
      </Flex>
      <TeamStatsHeader data={data} />
      <Grid templateColumns="minmax(0, 1.45fr) minmax(0, 1.75fr)" gap="0" flex={1} minH={0}>
        <Box h="full" minH={0}>
          <DefenderTable data={data} />
        </Box>
        <Box h="full" minH={0}>
          <LeverageVisuals data={data} />
        </Box>
      </Grid>
    </Flex>
  );
};

export const GameProductionDefenseL = () => {
  return (
    <Flex w="full" h="full" bg="bg.secondary" borderRadius="lg" overflow="hidden" border="1px solid rgba(255,255,255,0.08)">
      {/* Side by Side Split panels - Always horizontal to fit the 4x2 aspect ratio */}
      <Box flex={1} minW={0} borderRight="1px solid rgba(255,255,255,0.08)" h="full">
        <TeamPanel teamKey="jsu" />
      </Box>
      <Box flex={1} minW={0} h="full">
        <TeamPanel teamKey="pvamu" />
      </Box>
    </Flex>
  );
};
