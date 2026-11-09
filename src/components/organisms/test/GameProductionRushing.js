import { TEAMS } from "./rushingProduction/fixtures";
import { useState } from "react";
import { Flex, Box, Text } from "@chakra-ui/react";
import { CompactRunTables, OpponentImpact } from "./rushingProduction/RunTables";
import { IndividualRushing } from "./rushingProduction/RunnerPanels";

const TeamRushingPanel = ({ teamKey }) => {
  const data = TEAMS[teamKey];
  const [selected, setSelected] = useState(data.rushers[0]);
  const primary = data.meta.colors.primary;

  return (
    <Flex direction="column" w="full" h="full" minH={0}>
      <Flex
        direction="column"
        gap="4px"
        px={2}
        py="6px"
        bg={`linear-gradient(90deg, ${primary}44 0%, transparent 72%)`}
        borderBottom="1px solid rgba(255,255,255,0.08)"
        flexShrink={0}
      >
        <Flex align="center" gap={2}>
          <Box w="4px" h="18px" bg={data.meta.colors.accent} borderRadius="sm" />
          <Text fontSize="clamp(14px, 1.2vw, 18px)" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em">{data.meta.shortName} Rushing Production</Text>
        </Flex>
        <CompactRunTables data={data} />
      </Flex>

      <Box flex={1} minH={0}>
        <IndividualRushing data={data} selected={selected} onSelect={setSelected} />
      </Box>

      <OpponentImpact data={data} />
    </Flex>
  );
};

export const GameProductionRushing = () => (
  <Flex w="full" h="full" bg="bg.secondary" borderRadius="lg" overflow="hidden" border="1px solid rgba(255,255,255,0.08)">
    <Box flex={1} minW={0} borderRight="1px solid rgba(255,255,255,0.08)">
      <TeamRushingPanel teamKey="pvamu" />
    </Box>
    <Box flex={1} minW={0}>
      <TeamRushingPanel teamKey="jsu" />
    </Box>
  </Flex>
);
