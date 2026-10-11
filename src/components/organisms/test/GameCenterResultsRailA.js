import { Box, Flex, Text } from "@chakra-ui/react";
import {
  GAME_CENTER_RESULTS_SAMPLES,
  RailLogo,
  RailShell,
  resolveRailTeams,
} from "./GameCenterResultsRailShared";

const RailRowA = ({ game }) => {
  const { away, home } = resolveRailTeams(game);
  const awayWon = game.awayScore > game.homeScore;
  const homeWon = game.homeScore > game.awayScore;

  return (
    <Box px={4} py={3} borderBottom="1px solid" borderColor="whiteAlpha.100">
      <Flex justify="space-between" align="center" mb={2}>
        <Text fontSize="9px" color="text.muted" fontWeight="bold" textTransform="uppercase">
          {game.stageLabel}
        </Text>
        <Text fontSize="9px" color="text.muted" fontWeight="bold">
          {game.dateLabel}
        </Text>
      </Flex>

      <Flex direction="column" gap={2}>
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={2}>
            <RailLogo team={away} label={game.awayLabel} />
            <Text fontSize="sm" fontWeight="black" color={awayWon ? "white" : "text.secondary"} textTransform="uppercase">
              {game.awayLabel}
            </Text>
          </Flex>
          <Text fontSize="xl" fontWeight="black" color={awayWon ? "white" : "whiteAlpha.700"}>
            {game.awayScore}
          </Text>
        </Flex>
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={2}>
            <RailLogo team={home} label={game.homeLabel} />
            <Text fontSize="sm" fontWeight="black" color={homeWon ? "white" : "text.secondary"} textTransform="uppercase">
              {game.homeLabel}
            </Text>
          </Flex>
          <Text fontSize="xl" fontWeight="black" color={homeWon ? "white" : "whiteAlpha.700"}>
            {game.homeScore}
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
};

export const GameCenterResultsRailA = () => (
  <RailShell title="Game Results">
    {GAME_CENTER_RESULTS_SAMPLES.map((game) => (
      <RailRowA key={game.id} game={game} />
    ))}
  </RailShell>
);
