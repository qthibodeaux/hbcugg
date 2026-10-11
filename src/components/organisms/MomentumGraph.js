import { Box, Text, Flex } from "@chakra-ui/react";
import { TrendingUp } from "lucide-react";

const MomentumGraph = ({ team }) => {
  if (!team) return null;

  // Mock game results - W/L over the season
  const games = [
    { week: 1, result: "W", score: "42-17", opponent: "Howard" },
    { week: 2, result: "W", score: "35-21", opponent: "@ AAMU" },
    { week: 3, result: "W", score: "28-14", opponent: "TSU" },
    { week: 4, result: "L", score: "24-31", opponent: "@ Grambling" },
    { week: 5, result: "W", score: "45-10", opponent: "UAPB" },
    { week: 6, result: "W", score: "38-35", opponent: "@ Southern" },
    { week: 7, result: "W", score: "31-20", opponent: "PVAMU" },
    { week: 8, result: "W", score: "42-28", opponent: "@ Alcorn" },
    { week: 9, result: "W", score: "35-14", opponent: "MSU" },
    { week: 10, result: "W", score: "41-17", opponent: "@ BCU" },
  ];

  const wins = games.filter(g => g.result === "W").length;
  const losses = games.filter(g => g.result === "L").length;
  const currentStreak = 4; // Winning streak

  return (
    <Box bg="bg.card" p={5} borderRadius="lg" border="1px solid" borderColor="whiteAlpha.100">
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="sm" fontWeight="bold" color="text.primary">Season Momentum</Text>
        <Flex align="center" gap={2}>
          <TrendingUp size={16} color="green.500" />
          <Text fontSize="xs" color="green.500">W{currentStreak}</Text>
        </Flex>
      </Flex>

      {/* Game Dots */}
      <Flex justify="space-between" mb={4}>
        {games.map((game, idx) => (
          <Box key={idx} position="relative" cursor="pointer" title={`Week ${game.week}: ${game.result} ${game.score} vs ${game.opponent}`}>
            <Box
              w={3}
              h={3}
              borderRadius="full"
              bg={game.result === "W" ? "green.500" : "red.500"}
              border="2px solid"
              borderColor={game.result === "W" ? "green.400" : "red.400"}
            />
            {idx < games.length - 1 && (
              <Box
                position="absolute"
                top="50%"
                left="100%"
                w={{ base: "8px", md: "16px" }}
                h="2px"
                bg="whiteAlpha.200"
                transform="translateY(-50%)"
              />
            )}
          </Box>
        ))}
      </Flex>

      {/* Legend */}
      <Flex justify="center" gap={6} mb={4}>
        <Flex align="center" gap={2}>
          <Box w={2} h={2} borderRadius="full" bg="green.500" />
          <Text fontSize="xs" color="text.muted">{wins} Wins</Text>
        </Flex>
        <Flex align="center" gap={2}>
          <Box w={2} h={2} borderRadius="full" bg="red.500" />
          <Text fontSize="xs" color="text.muted">{losses} Losses</Text>
        </Flex>
      </Flex>

      {/* Recent Form */}
      <Box bg="bg.secondary" p={3} borderRadius="md">
        <Text fontSize="xs" color="text.muted" mb={2}>Last 5 Games</Text>
        <Flex gap={1}>
          {games.slice(-5).map((game, idx) => (
            <Box
              key={idx}
              flex={1}
              py={2}
              bg={game.result === "W" ? "green.500" : "red.500"}
              textAlign="center"
              borderRadius="sm"
            >
              <Text fontSize="xs" fontWeight="bold" color="white">{game.result}</Text>
            </Box>
          ))}
        </Flex>
      </Box>
    </Box>
  );
};

export default MomentumGraph;
