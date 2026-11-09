import { useState } from "react";
import { Flex, Spinner, Box, Text, Grid } from "@chakra-ui/react";
import { POSITION_ORDER, POSITION_LABELS } from "../../../utils/playersHubPresentation";
import { LeaderboardRow } from "./PlayerLeaderboardRow";

// Existing player-hub presentation, extracted without changing behavior.

export const LeaderboardsView = ({ leaderboards, isLoading, navigate }) => {
  const [activePos, setActivePos] = useState("QB");

  if (isLoading)
    return (
      <Flex justify="center" py={16}>
        <Spinner color="brand.500" size="lg" />
      </Flex>
    );

  const positions = Object.keys(leaderboards).filter((k) =>
    POSITION_ORDER.includes(k),
  );
  const players = leaderboards[activePos] ?? [];

  return (
    <Box>
      <Box
        mb={6}
        p={4}
        borderRadius="xl"
        border="1px solid"
        borderColor="whiteAlpha.100"
        bg="linear-gradient(135deg, rgba(229,62,62,0.08) 0%, transparent 60%)"
      >
        <Text
          fontSize="xs"
          color="text.muted"
          textTransform="uppercase"
          letterSpacing="0.14em"
          mb={1}
        >
          2025 Season
        </Text>
        <Text
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight="black"
          color="white"
          textTransform="uppercase"
          lineHeight={1}
        >
          Position Leaderboards
        </Text>
        <Text mt={2} fontSize="sm" color="text.muted">
          Top performers ranked by PAR — production per game weighted by
          difficulty.
        </Text>
      </Box>
      <Flex gap={2} mb={6} flexWrap="wrap">
        {positions.map((pos) => (
          <Box
            key={pos}
            as="button"
            onClick={() => setActivePos(pos)}
            px={4}
            py={2}
            borderRadius="md"
            bg={activePos === pos ? "brand.500" : "blackAlpha.300"}
            border="1px solid"
            borderColor={activePos === pos ? "brand.500" : "whiteAlpha.200"}
            color={activePos === pos ? "white" : "text.muted"}
            fontSize="sm"
            fontWeight="bold"
            _hover={{ color: "white" }}
            transition="all 0.15s"
          >
            {POSITION_LABELS[pos] ?? pos}
          </Box>
        ))}
      </Flex>
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
        {players.map((player, idx) => (
          <LeaderboardRow
            key={player.player_key ?? idx}
            player={player}
            rank={idx + 1}
            navigate={navigate}
          />
        ))}
      </Grid>
    </Box>
  );
};
