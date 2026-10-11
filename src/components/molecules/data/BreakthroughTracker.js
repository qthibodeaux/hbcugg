import { Box, Text, Flex, Grid } from "@chakra-ui/react";
import { TrendingUp, Zap } from "lucide-react";

/**
 * BreakthroughTracker - Top performers breakthrough tracker
 * @param {Object} props
 * @param {Array} props.players - Array of players to track
 */
const BreakthroughTracker = ({ players }) => {
  const top = players.slice(0, 3);
  
  return (
    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      p={4}
    >
      <Flex align="center" gap={2} mb={4}>
        <Zap size={16} color="var(--chakra-colors-brand-400)" />
        <Text fontSize="sm" fontWeight="bold" color="text.primary">
          Breakthrough Tracker
        </Text>
      </Flex>
      
      <Grid templateColumns="1fr" gap={3}>
        {top.map((player, index) => (
          <Box key={player.player_key} position="relative">
            {/* Rank indicator */}
            <Box
              position="absolute"
              top="-2px"
              left="-2px"
              w="6px"
              h="6px"
              bg={index === 0 ? "yellow.400" : index === 1 ? "gray.300" : "orange.400"}
              borderRadius="full"
            />
            
            <Flex
              align="center"
              gap={3}
              pl={2}
              py={2}
              borderRadius="lg"
              bg="whiteAlpha.50"
              _hover={{ bg: "whiteAlpha.100" }}
              transition="all 0.2s"
            >
              <Box flex={1} minW={0}>
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color="text.primary"
                  lineClamp={1}
                >
                  {player.name_display}
                </Text>
                <Flex align="center" gap={2} fontSize="9px" color="text.secondary">
                  <Text>{player.position}</Text>
                  <Text>·</Text>
                  <Text>{player.team}</Text>
                </Flex>
              </Box>
              
              <Box textAlign="right" flexShrink={0}>
                <Flex align="center" gap={1}>
                  <TrendingUp size={10} color="var(--chakra-colors-green-400)" />
                  <Text fontSize="sm" fontWeight="black" color="green.400">
                    {Math.round(50 + (player.par ?? 0) * 0.8)}
                  </Text>
                </Flex>
                <Text fontSize="7px" color="text.muted">GLORY</Text>
              </Box>
            </Flex>
          </Box>
        ))}
      </Grid>
      
      <Box mt={3} pt={3} borderTop="1px solid" borderColor="whiteAlpha.100">
        <Text fontSize="8px" color="text.muted" textAlign="center">
          Top 3 performers by PAR score trajectory
        </Text>
      </Box>
    </Box>
  );
};

export default BreakthroughTracker;
