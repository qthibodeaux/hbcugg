import { Box, Flex, Text } from "@chakra-ui/react";
import SeasonVelocity from "../../atoms/charts/SeasonVelocity";

/**
 * SeasonVelocityCard - Season velocity chart with labels and card wrapper
 * @param {Object} props
 * @param {number} props.par - Player PAR score
 * @param {number} props.games - Number of games played
 */
const SeasonVelocityCard = ({ par, games }) => {
  return (
    <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={5}>
      <Flex align="center" justify="space-between" mb={4}>
        <Flex align="center" gap={2}>
          <Box w="3px" h="16px" bg="brand.500" borderRadius="full" />
          <Text fontSize="xs" fontWeight="bold" color="white" textTransform="uppercase" letterSpacing="0.1em">
            Season Velocity
          </Text>
        </Flex>
        <Flex gap={3} align="center">
          <Text fontSize="9px" color="text.muted">Week 1</Text>
          <Text fontSize="9px" color="brand.400" fontWeight="bold">Current</Text>
        </Flex>
      </Flex>
      <SeasonVelocity par={par} games={games} />
      <Flex justify="space-between" mt={2}>
        <Text fontSize="9px" color="text.muted">Week 1</Text>
        <Text fontSize="9px" color="text.muted">Week {games ?? 10}</Text>
      </Flex>
    </Box>
  );
};

export default SeasonVelocityCard;
