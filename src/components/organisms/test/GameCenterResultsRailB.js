import { Box, Flex, Text } from "@chakra-ui/react";
import {
  GAME_CENTER_RESULTS_SAMPLES,
  RailLogo,
  RailShell,
  resolveRailTeams,
} from "./GameCenterResultsRailShared";

const RailRowB = ({ game }) => {
  const { away, home } = resolveRailTeams(game);
  const accent = away?.colors?.primary ?? home?.colors?.primary ?? "#E53E3E";

  return (
    <Box
      px={4}
      py={3}
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      bg={`linear-gradient(90deg, ${accent}20 0%, rgba(11,11,13,0) 72%)`}
    >
      <Flex justify="space-between" align="center">
        <Box minW={0} flex={1}>
          <Flex align="center" gap={2} mb={1}>
            <RailLogo team={away} label={game.awayLabel} size="20px" />
            <Text fontSize="10px" fontWeight="black" color="white" textTransform="uppercase" lineClamp={1}>
              {game.awayLabel} at {game.homeLabel}
            </Text>
          </Flex>
          <Text fontSize="9px" color="text.muted" textTransform="uppercase" lineClamp={1}>
            {game.stageLabel} | {game.summary}
          </Text>
        </Box>
        <Text fontSize="xl" fontWeight="black" color="white" pl={3}>
          {game.awayScore}-{game.homeScore}
        </Text>
      </Flex>
    </Box>
  );
};

export const GameCenterResultsRailB = () => (
  <RailShell title="Results Rail">
    {GAME_CENTER_RESULTS_SAMPLES.map((game) => (
      <RailRowB key={game.id} game={game} />
    ))}
  </RailShell>
);
