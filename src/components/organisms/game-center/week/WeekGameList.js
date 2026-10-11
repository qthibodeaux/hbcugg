import { Box, Flex, Text } from "@chakra-ui/react";
import { WeekGameRow } from "./WeekGameRow";
import { useWeekCentralActions, useWeekCentralChrome, useWeekCentralSelection } from "./WeekCentralProvider";
import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";

export const WeekGameList = () => {
  const { slate, selected } = useWeekCentralSelection();
  const { weekLabel } = useWeekCentralChrome();
  const { selectGame } = useWeekCentralActions();
  const { isMobile } = useLayoutDensity();

  return (
    <Box h="100%" minH={0} borderRadius={isMobile ? "0" : "lg"} border="1px solid" borderColor="whiteAlpha.100" bg="bg.secondary" overflow="hidden" display="flex" flexDirection="column">
      <Flex flexShrink={0} align="center" justify="space-between" px={5} py={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
        <Text fontSize="2xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1}>
          {weekLabel}
        </Text>
      </Flex>
      {/* Rows keep their natural height and the list scrolls. Without
          flexShrink=0 a column flexbox squeezes every row to fit the slot —
          desktop rows lose their 132px and clip, mobile rows pile up. */}
      <Flex direction="column" gap={isMobile ? 0 : 2} p={isMobile ? 0 : 3} flex="1 1 auto" minH={0} overflowY="auto" overflowX="hidden">
        {slate.map((game) => (
          <Box key={game.id} flexShrink={0}>
            <WeekGameRow game={game} selected={game.id === selected?.id} onSelect={selectGame} />
          </Box>
        ))}
        {slate.length === 0 && (
          <Flex h="100%" align="center" justify="center">
            <Text fontSize="sm" color="text.muted" fontWeight="bold">
              No games available for this filter.
            </Text>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};
