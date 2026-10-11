import { Box, Flex, Text } from "@chakra-ui/react";
import CompareBar from "../../atoms/charts/CompareBar";

/**
 * PlayerComparisonCard - Multiple comparison bars with header and context
 * @param {Object} props
 * @param {Array} props.comparisons - Array of comparison objects with label, playerVal, leagueVal
 * @param {string} props.playerName - Player name for legend
 */
const PlayerComparisonCard = ({ comparisons, playerName }) => {
  return (
    <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={6}>
      <Flex align="center" justify="space-between" mb={6}>
        <Flex align="center" gap={2}>
          <Box w="3px" h="16px" bg="brand.500" borderRadius="full" />
          <Text fontSize="xs" fontWeight="bold" color="white" textTransform="uppercase" letterSpacing="0.1em">
            vs Position Average
          </Text>
        </Flex>
        <Flex gap={4} align="center">
          <Flex align="center" gap={1}>
            <Box w="10px" h="3px" bg="brand.500" borderRadius="full" />
            <Text fontSize="9px" color="text.muted">{playerName?.split(" ").pop()}</Text>
          </Flex>
          <Flex align="center" gap={1}>
            <Box w="10px" h="3px" bg="whiteAlpha.300" borderRadius="full" />
            <Text fontSize="9px" color="text.muted">Avg</Text>
          </Flex>
        </Flex>
      </Flex>
      {comparisons.map((comparison, index) => (
        <CompareBar
          key={index}
          label={comparison.label}
          playerVal={comparison.playerVal}
          leagueVal={comparison.leagueVal}
        />
      ))}
    </Box>
  );
};

export default PlayerComparisonCard;
