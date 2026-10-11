import { Box, Flex, Text } from "@chakra-ui/react";
import {
  GAME_CENTER_RESULTS_SAMPLES,
  RailLogo,
  RailShell,
  resolveRailTeams,
} from "./GameCenterResultsRailShared";

const RailRowC = ({ game }) => {
  const { away, home } = resolveRailTeams(game);

  return (
    <Box px={4} py={3} borderBottom="1px solid" borderColor="whiteAlpha.100">
      <Flex justify="space-between" align="center" mb={2}>
        <Text fontSize="9px" color="brand.500" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
          Final
        </Text>
        <Text fontSize="9px" color="text.muted" fontWeight="bold" textTransform="uppercase">
          {game.stageLabel}
        </Text>
      </Flex>

      <Flex justify="space-between" align="center" gap={3}>
        <Flex align="center" gap={2} minW={0}>
          <RailLogo team={away} label={game.awayLabel} size="24px" />
          <Text fontSize="sm" fontWeight="black" color="white" textTransform="uppercase">
            {game.awayLabel}
          </Text>
          <Text fontSize="sm" fontWeight="black" color="whiteAlpha.700">
            {game.awayScore}
          </Text>
        </Flex>

        <Text fontSize="10px" color="text.muted" fontWeight="bold">
          at
        </Text>

        <Flex align="center" gap={2} minW={0} justify="flex-end">
          <Text fontSize="sm" fontWeight="black" color="whiteAlpha.700">
            {game.homeScore}
          </Text>
          <Text fontSize="sm" fontWeight="black" color="white" textTransform="uppercase">
            {game.homeLabel}
          </Text>
          <RailLogo team={home} label={game.homeLabel} size="24px" />
        </Flex>
      </Flex>

      <Text mt={2} fontSize="9px" color="text.muted" lineClamp={1}>
        {game.dateLabel} | {game.summary}
      </Text>
    </Box>
  );
};

export const GameCenterResultsRailC = () => (
  <RailShell title="Scoreboard Rail">
    {GAME_CENTER_RESULTS_SAMPLES.map((game) => (
      <RailRowC key={game.id} game={game} />
    ))}
  </RailShell>
);
