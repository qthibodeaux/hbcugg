import { Grid, Box, Flex, Text } from "@chakra-ui/react";
import { laneBg, fmt1, fmtPct, getDisplayName, fmt2, getInitials } from "./rushingPresentation";

const LaneGrid = ({ lanes, teamColor }) => (
  <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap="3px" w="full" h="full" minH={0}>
    {["left", "middle", "right"].map((lane) => {
      const item = lanes[lane];
      const successRate = item.attempts > 0 ? item.success / item.attempts : 0;
      const ypc = item.attempts > 0 ? item.yards / item.attempts : 0;
      return (
        <Box
          key={lane}
          bg={item.attempts > 0 ? laneBg(successRate, teamColor) : "whiteAlpha.50"}
          border="1px solid rgba(255,255,255,0.10)"
          borderRadius="sm"
          overflow="hidden"
          minH={0}
          display="flex"
          flexDirection="column"
        >
          <Flex justify="space-between" align="center" px="6px" py="4px" borderBottom="1px solid rgba(255,255,255,0.08)" flexShrink={0}>
            <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.primary" fontWeight="900" textTransform="uppercase">
              {lane === "middle" ? "Middle" : lane}
            </Text>
            <Text fontSize="clamp(7px, 0.65vw, 9px)" color="text.secondary" fontWeight="800">{fmt1(ypc)} YPC</Text>
          </Flex>
          <Grid templateColumns="repeat(4, minmax(0, 1fr))" px="5px" py="5px" gap={1} flex={1} alignItems="center">
            {[
              { label: "Car", value: item.attempts },
              { label: "Yds", value: item.yards },
              { label: "Succ", value: fmtPct(successRate) },
              { label: "TD", value: item.touchdowns },
            ].map((stat) => (
              <Flex key={stat.label} direction="column" align="center">
                <Text fontSize="clamp(9px, 0.82vw, 12px)" color="text.primary" fontWeight="900" lineHeight={1}>{stat.value}</Text>
                <Text fontSize="6px" color="text.muted" fontWeight="800" textTransform="uppercase" mt="2px">{stat.label}</Text>
              </Flex>
            ))}
          </Grid>
        </Box>
      );
    })}
  </Grid>
);

const RunnerRow = ({ player, active, accent, onSelect }) => {
  const success = Object.values(player.lanes).reduce((sum, lane) => sum + lane.success, 0);
  const successRate = player.attempts > 0 ? success / player.attempts : 0;

  return (
    <Grid
      as="button"
      type="button"
      templateColumns="1.45fr 34px 42px 38px 28px 38px 36px 32px 42px 42px"
      alignItems="center"
      gap={1.5}
      px="4px"
      py="2px"
      bg={active ? "rgba(255,255,255,0.08)" : "transparent"}
      borderLeft={active ? `3px solid ${accent}` : "3px solid transparent"}
      borderBottom="1px solid rgba(255,255,255,0.055)"
      textAlign="left"
      _hover={{ bg: "rgba(255,255,255,0.06)" }}
      onClick={() => onSelect(player)}
    >
      <Box minW={0}>
        <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.primary" fontWeight={active ? "900" : "700"} truncate>{getDisplayName(player.name)}</Text>
        <Text fontSize="6px" color="text.muted" fontWeight="800">{player.position}</Text>
      </Box>
      <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.secondary" fontWeight="850" textAlign="right">{player.attempts}</Text>
      <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.primary" fontWeight="900" textAlign="right">{player.yards}</Text>
      <Text fontSize="clamp(8px, 0.72vw, 10px)" color={player.yards / Math.max(1, player.attempts) >= 4 ? accent : "text.secondary"} fontWeight="900" textAlign="right">{fmt1(player.yards / Math.max(1, player.attempts))}</Text>
      <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.secondary" fontWeight="850" textAlign="right">{player.touchdowns}</Text>
      <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.secondary" fontWeight="850" textAlign="right">{fmtPct(successRate)}</Text>
      <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.secondary" fontWeight="850" textAlign="right">{player.firstAndTen}</Text>
      <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.secondary" fontWeight="850" textAlign="right">{player.firstDowns}</Text>
      <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.secondary" fontWeight="850" textAlign="right">{fmt2(player.epa)}</Text>
      <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.secondary" fontWeight="850" textAlign="right">{fmt2(player.production)}</Text>
    </Grid>
  );
};

const RunnerSpotlightWide = ({ player, teamColor }) => {
  const success = Object.values(player.lanes).reduce((sum, lane) => sum + lane.success, 0);
  const successRate = player.attempts > 0 ? success / player.attempts : 0;

  return (
    <Grid templateColumns="64px minmax(0, 1fr)" border="1px solid rgba(255,255,255,0.10)" borderRadius="sm" overflow="hidden" bg="rgba(255,255,255,0.03)" minH="76px">
      <Flex align="center" justify="center" bg="rgba(255,255,255,0.035)" borderRight="1px solid rgba(255,255,255,0.10)">
        <Flex w="38px" h="38px" borderRadius="md" bg={teamColor} align="center" justify="center" border="1px solid rgba(255,255,255,0.18)">
          <Text fontSize="13px" fontWeight="900" color="white">{getInitials(player.name)}</Text>
        </Flex>
      </Flex>
      <Flex direction="column" justify="center" minW={0} px={2}>
        <Text fontSize="clamp(13px, 1.08vw, 16px)" color="text.primary" fontWeight="950" lineHeight={1.05} truncate>{getDisplayName(player.name)}</Text>
        <Text fontSize="clamp(7px, 0.65vw, 9px)" color="text.muted" fontWeight="800" mt="3px">{player.position} selected runner</Text>
        <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.secondary" fontWeight="850" mt="6px" lineHeight={1.25}>
          {player.attempts} CAR / {player.yards} YDS / {player.touchdowns} TD / {fmtPct(successRate)} Succ
        </Text>
      </Flex>
    </Grid>
  );
};

export const IndividualRushing = ({ data, selected, onSelect }) => {
  const accent = data.meta.colors.accent;
  return (
    <Grid templateColumns="minmax(0, 1.04fr) minmax(294px, 0.96fr)" gap="6px" h="full" minH={0} p="5px">
      <Box minH={0} overflow="hidden">
        <Grid templateColumns="1.45fr 34px 42px 38px 28px 38px 36px 32px 42px 42px" gap={1.5} py="2px" borderBottom="1px solid rgba(255,255,255,0.08)">
          {["Runner", "Car", "Yds", "YPC", "TD", "Succ", "1&10", "1D", "EPA", "Prod"].map((head) => (
            <Text key={head} fontSize="7px" color="text.muted" fontWeight="850" textTransform="uppercase" textAlign={head === "Runner" ? "left" : "right"}>{head}</Text>
          ))}
        </Grid>
        <Box overflowY="auto" h="calc(100% - 18px)">
          {data.rushers.map((player) => (
            <RunnerRow key={player.key} player={player} active={selected.key === player.key} accent={accent} onSelect={onSelect} />
          ))}
        </Box>
      </Box>
      <Flex direction="column" minH={0} gap="6px">
        <Box flexShrink={0}>
          <RunnerSpotlightWide player={selected} teamColor={data.meta.colors.primary} />
        </Box>
        <Box flex={1} minH={0}>
          <LaneGrid lanes={selected.lanes} teamColor={data.meta.colors.primary} />
        </Box>
      </Flex>
    </Grid>
  );
};
