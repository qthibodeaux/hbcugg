import { useState } from "react";
import { Box, Flex, Text, Spinner } from "@chakra-ui/react";
import LeaderboardRow from "../../atoms/data-display/LeaderboardRow";

/**
 * LeaderboardsView - Leaderboards view with position filtering
 * @param {Object} props
 * @param {Object} props.leaderboards - Leaderboards data by position
 * @param {boolean} props.isLoading - Loading state
 * @param {Function} props.navigate - Navigation function
 */
const LeaderboardsView = ({ leaderboards, isLoading, navigate }) => {
  const [activePos, setActivePos] = useState("QB");

  if (isLoading)
    return (
      <Flex justify="center" py={16}>
        <Spinner color="brand.500" size="lg" />
      </Flex>
    );

  const POSITION_ORDER = ["QB", "RB", "WR", "DEF"];
  const positions = Object.keys(leaderboards).filter((k) =>
    POSITION_ORDER.includes(k),
  );
  const players = leaderboards[activePos] ?? [];

  const POSITION_ICONS = { QB: "🏈", RB: "💨", WR: "📡", DEF: "🛡️" };

  return (
    <Box>
      {/* Position tabs */}
      <Flex
        gap={1}
        mb={6}
        bg="bg.secondary"
        borderRadius="lg"
        p={1}
        display="inline-flex"
      >
        {positions.map((pos) => (
          <Box
            key={pos}
            as="button"
            onClick={() => setActivePos(pos)}
            px={4}
            py={2}
            borderRadius="md"
            fontSize="sm"
            fontWeight="medium"
            bg={activePos === pos ? "brand.500" : "transparent"}
            color={activePos === pos ? "white" : "text.muted"}
            _hover={{ color: activePos === pos ? "white" : "text.primary" }}
            transition="all 0.15s"
          >
            <Flex align="center" gap={2}>
              <Text>{POSITION_ICONS[pos] ?? "📊"}</Text>
              <Text>{pos}</Text>
            </Flex>
          </Box>
        ))}
      </Flex>

      {/* Leaderboard */}
      <Box
        bg="bg.secondary"
        border="1px solid"
        borderColor="whiteAlpha.100"
        borderRadius="xl"
        p={5}
      >
        <Flex align="center" gap={2} mb={4}>
          <Text fontSize="xl">{POSITION_ICONS[activePos] ?? "📊"}</Text>
          <Text fontSize="lg" fontWeight="black" color="text.primary">
            {activePos}
          </Text>
          <Text fontSize="xs" color="text.muted" ml="auto">
            PAR Leaders
          </Text>
        </Flex>
        {players.map((p, i) => (
          <LeaderboardRow
            key={p.player_key}
            rank={i + 1}
            player={p}
            navigate={navigate}
          />
        ))}
      </Box>
    </Box>
  );
};

export default LeaderboardsView;
