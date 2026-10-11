import { Box, Flex, Grid, Text, VStack } from "@chakra-ui/react";
import { DEFENSE_PRODUCTION_TEAMS } from "./GameProductionDefenseJ";

const fmtPct = (n) => `${Math.round((n ?? 0) * 100)}%`;
const fmt1 = (n) => (n ?? 0).toFixed(1);
const fmtValue = (n) => (Number.isInteger(n) ? n : fmt1(n));

function displayName(name) {
  if (!name.includes(",")) return name;
  const [last, first] = name.split(",");
  return `${first.trim()} ${last.trim()}`;
}

function lastName(name) {
  return name.split(",")[0]?.trim() || name;
}

const TeamHeaderLine = ({ data }) => {
  const stats = [
    { label: "Scrimmage", value: data.team.plays, color: data.colors.accent },
    { label: "Stop Rate", value: fmtPct(data.team.stopRate), color: "#68D391" },
    { label: "Havoc", value: data.team.havoc, color: "#E53E3E" },
    { label: "Rush / Pass", value: `${data.team.rushHavoc}/${data.team.passHavoc}`, color: "#F6AD55" },
    { label: "TFL", value: data.team.tfl, color: "#F6AD55" },
    { label: "Sacks", value: data.team.sacks, color: "#F6AD55" },
    { label: "PD", value: data.team.pd, color: "#63B3ED" },
    { label: "INT / FF", value: `${data.team.int}/${data.team.ff}`, color: "#E53E3E" },
  ];

  return (
    <Box px="8px" py="6px" bg={`linear-gradient(90deg, ${data.colors.primary}44 0%, transparent 72%)`} borderBottom="1px solid rgba(255,255,255,0.08)">
      <Flex align="center" gap={2} mb="6px">
        <Box w="4px" h="17px" bg={data.colors.accent} borderRadius="sm" />
        <Text fontSize="clamp(13px, 1.08vw, 17px)" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em">
          {data.shortName} Defensive Production
        </Text>
      </Flex>
      <Grid templateColumns="repeat(8, minmax(0, 1fr))" border="1px solid rgba(255,255,255,0.08)" borderRadius="sm" overflow="hidden">
        {stats.map((stat, index) => (
          <Flex key={stat.label} direction="column" align="center" justify="center" py="6px" bg={index % 2 === 0 ? "rgba(255,255,255,0.035)" : "rgba(255,255,255,0.02)"} borderRight={index < stats.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none"} minW={0}>
            <Text fontSize="clamp(10px, 0.88vw, 13px)" color={stat.color} fontWeight="950" lineHeight={1}>{stat.value}</Text>
            <Text fontSize="6px" color="text.muted" fontWeight="850" textTransform="uppercase" mt="3px" truncate>{stat.label}</Text>
          </Flex>
        ))}
      </Grid>
    </Box>
  );
};

const PlayerProductionTable = ({ data }) => {
  const players = data.defenders.filter((player) => player.tackles >= 2 || player.havoc > 0);
  return (
    <VStack align="stretch" gap={0} h="full" minH={0}>
      <Grid templateColumns="1.45fr 42px 38px 38px 38px 38px 44px" gap={1} py="3px" borderBottom="1px solid rgba(255,255,255,0.10)">
        {["Defender", "Tack", "TFL", "Sack", "PD", "FF", "Havoc"].map((head) => (
          <Text key={head} fontSize="7px" color="text.muted" fontWeight="900" textTransform="uppercase" textAlign={head === "Defender" ? "left" : "right"}>{head}</Text>
        ))}
      </Grid>
      <Box flex={1} minH={0} overflowY="auto">
        {players.map((player) => (
          <Grid key={player.name} templateColumns="1.45fr 42px 38px 38px 38px 38px 44px" gap={1} alignItems="center" py="4px" borderBottom="1px solid rgba(255,255,255,0.055)" _hover={{ bg: "rgba(255,255,255,0.04)" }}>
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
};

const PhaseStack = ({ data }) => {
  const phases = [
    { label: "Run Stops", value: data.team.rushHavoc, max: Math.max(1, data.team.havoc), color: "#E53E3E", sub: `${data.team.tfl} TFL / ${fmtPct(data.team.stuffRate)} stuff` },
    { label: "Pass Stress", value: data.team.passHavoc, max: Math.max(1, data.team.havoc), color: "#63B3ED", sub: `${data.team.sacks} sacks / ${data.team.pd} PD` },
    { label: "Pressure", value: data.team.pressureRate, max: 0.3, color: "#F6AD55", sub: `${fmtPct(data.team.pressureRate)} pressure rate` },
    { label: "Finish", value: data.team.int + data.team.ff, max: 4, color: "#68D391", sub: `${data.team.int} INT / ${data.team.ff} FF` },
  ];
  const havocLeaders = [...data.defenders].sort((a, b) => b.havoc - a.havoc).slice(0, 5);
  const tackleLeaders = [...data.defenders].sort((a, b) => b.tackles - a.tackles).slice(0, 5);

  return (
    <Grid templateRows="auto 1fr" gap="6px" h="full" minH={0}>
      <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap="4px">
        {phases.map((phase) => (
          <Box key={phase.label} border="1px solid rgba(255,255,255,0.08)" borderRadius="sm" bg="rgba(255,255,255,0.03)" px="6px" py="5px">
            <Flex justify="space-between" align="center" mb="4px">
              <Text fontSize="7px" color="text.primary" fontWeight="900" textTransform="uppercase">{phase.label}</Text>
              <Text fontSize="9px" color={phase.color} fontWeight="950">{typeof phase.value === "number" && phase.value < 1 ? fmtPct(phase.value) : phase.value}</Text>
            </Flex>
            <Box h="5px" bg="rgba(255,255,255,0.08)" borderRadius="full" overflow="hidden">
              <Box h="full" w={`${Math.min(100, (phase.value / phase.max) * 100)}%`} bg={phase.color} borderRadius="full" />
            </Box>
            <Text fontSize="6px" color="text.muted" fontWeight="800" textTransform="uppercase" mt="3px" truncate>{phase.sub}</Text>
          </Box>
        ))}
      </Grid>
      <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap="6px" minH={0}>
        <LeaderList title="Havoc Chain" leaders={havocLeaders} metric="havoc" data={data} />
        <LeaderList title="Tackle Core" leaders={tackleLeaders} metric="tackles" data={data} />
      </Grid>
    </Grid>
  );
};

const LeaderList = ({ title, leaders, metric, data }) => {
  const top = Math.max(1, leaders[0]?.[metric] || 1);
  return (
    <Box minH={0} border="1px solid rgba(255,255,255,0.08)" borderRadius="sm" bg="rgba(255,255,255,0.025)" px="6px" py="6px">
      <Text fontSize="7px" color="text.muted" fontWeight="900" textTransform="uppercase" mb="5px">{title}</Text>
      <VStack align="stretch" gap="5px">
        {leaders.map((leader) => (
          <Box key={`${title}-${leader.name}`}>
            <Flex justify="space-between" align="center" mb="2px">
              <Text fontSize="8px" color="text.primary" fontWeight="900" truncate>{lastName(leader.name)}</Text>
              <Text fontSize="8px" color={data.colors.accent} fontWeight="950">{fmtValue(leader[metric])}</Text>
            </Flex>
            <Box h="5px" bg="rgba(255,255,255,0.08)" borderRadius="full" overflow="hidden">
              <Box h="full" w={`${Math.min(100, (leader[metric] / top) * 100)}%`} bg={data.colors.accent} borderRadius="full" />
            </Box>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

const TeamPanel = ({ teamKey }) => {
  const data = DEFENSE_PRODUCTION_TEAMS[teamKey];
  return (
    <Flex direction="column" h="full" minH={0}>
      <TeamHeaderLine data={data} />
      <Grid templateColumns="minmax(0, 1.45fr) minmax(260px, 0.9fr)" gap="6px" flex={1} minH={0} p="6px">
        <PlayerProductionTable data={data} />
        <PhaseStack data={data} />
      </Grid>
    </Flex>
  );
};

export const GameProductionDefenseK = () => (
  <Flex w="full" h="full" bg="bg.secondary" borderRadius="lg" overflow="hidden" border="1px solid rgba(255,255,255,0.08)">
    <Box flex={1} minW={0} borderRight="1px solid rgba(255,255,255,0.08)">
      <TeamPanel teamKey="jsu" />
    </Box>
    <Box flex={1} minW={0}>
      <TeamPanel teamKey="pvamu" />
    </Box>
  </Flex>
);
