import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ResultsRailRow } from "./hub/ResultsRailRow";

export const GameCenterResultsRail = ({ cards = [] }) => {
  const { isMobile } = useLayoutDensity();
  return (
    <Box
      h="100%"
      containerType="size"
      borderRadius={isMobile ? "0" : "xl"}
      border="1px solid"
      borderColor="whiteAlpha.200"
      bg="linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(11,11,13,0.96) 18%, #0b0b0d 100%)"
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      <Flex
        align="center"
        justify="space-between"
        px="5cqmin"
        py="3.5cqmin"
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
        flexShrink={0}
      >
        <Text fontSize="5.5cqmin" color="brand.500" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em" lineHeight={1}>
          Game Results
        </Text>
        <Text fontSize="5.5cqmin" color="text.muted" fontWeight="bold" textTransform="uppercase" lineHeight={1}>
          Latest
        </Text>
      </Flex>

      <Flex direction="column" flex={1} minH={0}>
        {cards.map((game, index) => (
          <ResultsRailRow key={game.id} game={game} isLast={index === cards.length - 1} />
        ))}
      </Flex>
    </Box>
  );
};
