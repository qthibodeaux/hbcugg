import { Box, Flex, Grid, Text, VStack } from "@chakra-ui/react";

export const DEFENSE_PRODUCTION_TEAMS = {
  jsu: {
    shortName: "JSU",
    opponent: "PVAMU",
    colors: { primary: "#002147", accent: "#4A90D9" },
    team: {
      plays: 76,
      stopRate: 0.67,
      havoc: 10,
      rushHavoc: 8,
      passHavoc: 2,
      tfl: 6,
      sacks: 1,
      pd: 2,
      int: 0,
      ff: 2,
      pressureRate: 0.2,
      stuffRate: 0.196,
    },
    defenders: [
      { name: "Pulliam,Reid", pos: "LB", tackles: 10.5, tfl: 0.5, sacks: 0, pd: 1, ff: 0, havoc: 2.5 },
      { name: "Sallis,Kam", pos: "DB", tackles: 9, tfl: 0, sacks: 0, pd: 0, ff: 1, havoc: 1 },
      { name: "Hawkins,Shamar", pos: "DB", tackles: 7, tfl: 0, sacks: 0, pd: 0, ff: 0, havoc: 1 },
      { name: "Ivory,Quincy", pos: "DL", tackles: 4.5, tfl: 0.5, sacks: 0, pd: 0, ff: 0, havoc: 1.5 },
      { name: "Taylor,Ashton", pos: "DL", tackles: 4, tfl: 2, sacks: 0, pd: 0, ff: 0, havoc: 4 },
      { name: "Washington,B.J.", pos: "LB", tackles: 4, tfl: 0.5, sacks: 0, pd: 0, ff: 0, havoc: 0.5 },
      { name: "Williams,Jeremiah", pos: "DL", tackles: 3.5, tfl: 1, sacks: 0, pd: 0, ff: 1, havoc: 2 },
      { name: "Chisholm,KJ", pos: "DB", tackles: 3, tfl: 0, sacks: 0, pd: 1, ff: 0, havoc: 1 },
    ],
  },
  pvamu: {
    shortName: "PVAMU",
    opponent: "JSU",
    colors: { primary: "#4B0082", accent: "#FFB81C" },
    team: {
      plays: 42,
      stopRate: 0.67,
      havoc: 7,
      rushHavoc: 4,
      passHavoc: 3,
      tfl: 4,
      sacks: 1,
      pd: 1,
      int: 0,
      ff: 0,
      pressureRate: 0.167,
      stuffRate: 0.231,
    },
    defenders: [
      { name: "Starling,Darrell", pos: "LB", tackles: 6, tfl: 1, sacks: 0.5, pd: 0, ff: 0, havoc: 1.5 },
      { name: "Parker,Kennedy", pos: "DL", tackles: 5, tfl: 1, sacks: 0, pd: 0, ff: 0, havoc: 1 },
      { name: "Randle,Travor", pos: "DB", tackles: 4, tfl: 0, sacks: 0, pd: 1, ff: 0, havoc: 1 },
      { name: "Amao,Kamren", pos: "DB", tackles: 3.5, tfl: 0.5, sacks: 0, pd: 0, ff: 0, havoc: 0.5 },
      { name: "McGee,DeAlo", pos: "DB", tackles: 2.5, tfl: 0, sacks: 0, pd: 0, ff: 0, havoc: 0 },
      { name: "Davis,Cornelius", pos: "LB", tackles: 2, tfl: 0, sacks: 0, pd: 0, ff: 0, havoc: 0 },
      { name: "Ward,Trinity", pos: "DL", tackles: 2, tfl: 0, sacks: 0, pd: 0, ff: 0, havoc: 0 },
    ],
  },
};

const fmtPct = (n) => `${Math.round((n ?? 0) * 100)}%`;
const fmt1 = (n) => (n ?? 0).toFixed(1);
const fmtValue = (n) => (Number.isInteger(n) ? n : fmt1(n));

function displayName(name) {
  if (!name.includes(",")) return name;
  const [last, first] = name.split(",");
  return `${first.trim()} ${last.trim()}`;
}

const TeamProduction = ({ data }) => {
  const metrics = [
    { label: "Scrim", value: data.team.plays, tone: data.colors.accent },
    { label: "Stop", value: fmtPct(data.team.stopRate), tone: "#68D391" },
    { label: "Havoc", value: data.team.havoc, tone: "#E53E3E" },
    { label: "TFL", value: data.team.tfl, tone: "#F6AD55" },
    { label: "Sack", value: data.team.sacks, tone: "#F6AD55" },
    { label: "PD", value: data.team.pd, tone: "#63B3ED" },
    { label: "INT", value: data.team.int, tone: "#63B3ED" },
    { label: "FF", value: data.team.ff, tone: "#E53E3E" },
  ];

  return (
    <Box px="8px" py="6px" bg={`linear-gradient(90deg, ${data.colors.primary}44 0%, transparent 72%)`} borderBottom="1px solid rgba(255,255,255,0.08)">
      <Flex align="center" gap={2} mb="5px">
        <Box w="4px" h="17px" bg={data.colors.accent} borderRadius="sm" />
        <Text fontSize="clamp(13px, 1.08vw, 17px)" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em">
          {data.shortName} Defensive Production
        </Text>
      </Flex>
      <Grid templateColumns="repeat(8, minmax(0, 1fr))" gap="4px">
        {metrics.map((metric) => (
          <Flex key={metric.label} direction="column" align="center" justify="center" bg="rgba(255,255,255,0.035)" border="1px solid rgba(255,255,255,0.07)" borderRadius="sm" py="5px" minW={0}>
            <Text fontSize="clamp(10px, 0.88vw, 13px)" color={metric.tone} fontWeight="950" lineHeight={1}>{metric.value}</Text>
            <Text fontSize="6px" color="text.muted" fontWeight="850" textTransform="uppercase" mt="3px">{metric.label}</Text>
          </Flex>
        ))}
      </Grid>
    </Box>
  );
};

const DefenderTable = ({ data }) => (
  <VStack align="stretch" gap={0} h="full" minH={0}>
    <Grid templateColumns="1.3fr 38px 34px 34px 34px 34px 40px" gap={1} py="3px" borderBottom="1px solid rgba(255,255,255,0.10)">
      {["Player", "Tkl", "TFL", "Sck", "PD", "FF", "Havoc"].map((head) => (
        <Text key={head} fontSize="7px" color="text.muted" fontWeight="900" textTransform="uppercase" textAlign={head === "Player" ? "left" : "right"}>{head}</Text>
      ))}
    </Grid>
    <Box flex={1} minH={0} overflowY="auto">
      {data.defenders.filter((p) => p.tackles >= 2 || p.havoc > 0).map((player) => (
        <Grid key={player.name} templateColumns="1.3fr 38px 34px 34px 34px 34px 40px" gap={1} alignItems="center" py="4px" borderBottom="1px solid rgba(255,255,255,0.055)" borderLeft={player.havoc >= 2 ? `3px solid ${data.colors.accent}` : "3px solid transparent"}>
          <Box minW={0} pl="2px">
            <Text fontSize="clamp(8px, 0.72vw, 11px)" color="text.primary" fontWeight="900" truncate>{displayName(player.name)}</Text>
            <Text fontSize="6px" color="text.muted" fontWeight="800">{player.pos}</Text>
          </Box>
          {[fmtValue(player.tackles), fmtValue(player.tfl), fmtValue(player.sacks), player.pd, player.ff, fmtValue(player.havoc)].map((value, index) => (
            <Text key={`${player.name}-${index}`} fontSize="clamp(8px, 0.72vw, 10px)" color={index === 5 ? data.colors.accent : "text.secondary"} fontWeight={index === 5 ? "950" : "850"} textAlign="right">{value}</Text>
          ))}
        </Grid>
      ))}
    </Box>
  </VStack>
);

const HavocBoard = ({ data }) => {
  const total = Math.max(1, data.team.havoc);
  const leaders = [...data.defenders].sort((a, b) => b.havoc - a.havoc).slice(0, 4);
  const tiles = [
    { label: "Rush Havoc", value: data.team.rushHavoc, sub: "TFL + FF pressure", color: "#E53E3E" },
    { label: "Pass Havoc", value: data.team.passHavoc, sub: "Sacks + PD + INT", color: "#63B3ED" },
    { label: "Pressure Rate", value: fmtPct(data.team.pressureRate), sub: "dropbacks affected", color: "#F6AD55" },
    { label: "Stuff Rate", value: fmtPct(data.team.stuffRate), sub: "runs stopped early", color: "#68D391" },
  ];

  return (
    <VStack align="stretch" gap="6px" h="full" minH={0}>
      <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap="4px" flexShrink={0}>
        {tiles.map((tile) => (
          <Box key={tile.label} bg="rgba(255,255,255,0.035)" border="1px solid rgba(255,255,255,0.07)" borderRadius="sm" px="6px" py="6px">
            <Text fontSize="clamp(12px, 1vw, 16px)" color={tile.color} fontWeight="950" lineHeight={1}>{tile.value}</Text>
            <Text fontSize="7px" color="text.primary" fontWeight="900" textTransform="uppercase" mt="3px">{tile.label}</Text>
            <Text fontSize="6px" color="text.muted" fontWeight="800" textTransform="uppercase" mt="1px">{tile.sub}</Text>
          </Box>
        ))}
      </Grid>
      <Box border="1px solid rgba(255,255,255,0.08)" bg="rgba(255,255,255,0.025)" borderRadius="sm" px="7px" py="6px" flexShrink={0}>
        <Flex justify="space-between" align="center" mb="5px">
          <Text fontSize="7px" color="text.muted" fontWeight="900" textTransform="uppercase">Havoc split</Text>
          <Text fontSize="7px" color="text.secondary" fontWeight="850">{data.team.havoc} total</Text>
        </Flex>
        <Box h="10px" bg="rgba(255,255,255,0.08)" borderRadius="full" overflow="hidden" display="flex">
          <Box h="full" w={`${(data.team.rushHavoc / total) * 100}%`} bg="#E53E3E" />
          <Box h="full" w={`${(data.team.passHavoc / total) * 100}%`} bg="#63B3ED" />
        </Box>
        <Flex justify="space-between" mt="3px">
          <Text fontSize="6px" color="#E53E3E" fontWeight="850">Rush {data.team.rushHavoc}</Text>
          <Text fontSize="6px" color="#63B3ED" fontWeight="850">Pass {data.team.passHavoc}</Text>
        </Flex>
      </Box>
      <Box flex={1} minH={0} border="1px solid rgba(255,255,255,0.08)" bg="rgba(255,255,255,0.025)" borderRadius="sm" px="7px" py="6px">
        <Text fontSize="7px" color="text.muted" fontWeight="900" textTransform="uppercase" mb="5px">Disruption leaders</Text>
        <VStack align="stretch" gap="5px">
          {leaders.map((leader) => (
            <Grid key={leader.name} templateColumns="minmax(0, 1fr) 32px" gap="6px" alignItems="center">
              <Box minW={0}>
                <Flex justify="space-between" mb="2px">
                  <Text fontSize="8px" color="text.primary" fontWeight="900" truncate>{displayName(leader.name)}</Text>
                  <Text fontSize="8px" color={data.colors.accent} fontWeight="950">{fmtValue(leader.havoc)}</Text>
                </Flex>
                <Box h="5px" bg="rgba(255,255,255,0.08)" borderRadius="full" overflow="hidden">
                  <Box h="full" w={`${Math.min(100, (leader.havoc / Math.max(1, leaders[0].havoc)) * 100)}%`} bg={data.colors.accent} borderRadius="full" />
                </Box>
              </Box>
              <Text fontSize="6px" color="text.muted" fontWeight="850" textAlign="right">{leader.pos}</Text>
            </Grid>
          ))}
        </VStack>
      </Box>
    </VStack>
  );
};

const TeamPanel = ({ teamKey }) => {
  const data = DEFENSE_PRODUCTION_TEAMS[teamKey];
  return (
    <Flex direction="column" h="full" minH={0}>
      <TeamProduction data={data} />
      <Grid templateColumns="minmax(0, 1.35fr) minmax(230px, 0.75fr)" gap="6px" flex={1} minH={0} p="6px">
        <DefenderTable data={data} />
        <HavocBoard data={data} />
      </Grid>
    </Flex>
  );
};

export const GameProductionDefenseJ = () => (
  <Flex w="full" h="full" bg="bg.secondary" borderRadius="lg" overflow="hidden" border="1px solid rgba(255,255,255,0.08)">
    <Box flex={1} minW={0} borderRight="1px solid rgba(255,255,255,0.08)">
      <TeamPanel teamKey="jsu" />
    </Box>
    <Box flex={1} minW={0}>
      <TeamPanel teamKey="pvamu" />
    </Box>
  </Flex>
);
