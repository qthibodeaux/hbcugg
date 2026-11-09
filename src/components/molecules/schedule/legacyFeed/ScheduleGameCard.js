import { Link } from "react-router-dom";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ArrowRight } from "lucide-react";

// Legacy schedule-feed game card; score emphasis and recap link behavior are preserved.

export const GameCard = ({ game }) => {
  const winner = game.away.score > game.home.score ? "away" : "home";
  return (
    <Link to={`/game/${game.stem}`} style={{ display: "block" }}>
      <Box
        bg="bg.secondary"
        border="1px solid"
        borderColor="whiteAlpha.100"
        borderRadius="xl"
        p={5}
        _hover={{ borderColor: "brand.500", bg: "whiteAlpha.50" }}
        transition="all 0.15s"
        maxW="480px"
      >
        <Flex justify="space-between" align="center" mb={4}>
          <Text
            fontSize="xs"
            color="brand.400"
            fontWeight="bold"
            textTransform="uppercase"
            letterSpacing="widest"
          >
            {game.week}
          </Text>
          <Text fontSize="xs" color="text.muted">
            {game.date}
          </Text>
        </Flex>

        <Flex align="center" justify="space-between" mb={3}>
          {/* Away */}
          <Box flex={1}>
            <Text
              fontSize="xl"
              fontWeight="black"
              color={winner === "away" ? "text.primary" : "text.muted"}
            >
              {game.away.label}
            </Text>
            <Text fontSize="xs" color="text.muted">
              Away
            </Text>
          </Box>

          {/* Score */}
          <Flex align="center" gap={3} mx={4}>
            <Text
              fontSize="3xl"
              fontWeight="black"
              color={winner === "away" ? "text.primary" : "text.muted"}
            >
              {game.away.score}
            </Text>
            <Text fontSize="lg" color="whiteAlpha.300">
              –
            </Text>
            <Text
              fontSize="3xl"
              fontWeight="black"
              color={winner === "home" ? "text.primary" : "text.muted"}
            >
              {game.home.score}
            </Text>
          </Flex>

          {/* Home */}
          <Box flex={1} textAlign="right">
            <Text
              fontSize="xl"
              fontWeight="black"
              color={winner === "home" ? "text.primary" : "text.muted"}
            >
              {game.home.label}
            </Text>
            <Text fontSize="xs" color="text.muted">
              Home
            </Text>
          </Box>
        </Flex>

        <Flex align="center" justify="space-between">
          <Text fontSize="xs" color="text.muted">
            {game.site}
          </Text>
          <Flex align="center" gap={1} color="brand.400">
            <Text fontSize="xs" fontWeight="bold">
              Full Recap
            </Text>
            <ArrowRight size={12} />
          </Flex>
        </Flex>
      </Box>
    </Link>
  );
};
