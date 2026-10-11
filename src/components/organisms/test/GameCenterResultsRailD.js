import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import {
  GAME_CENTER_RESULTS_SAMPLES,
  RailLogo,
  RailShell,
  resolveRailTeams,
} from "./GameCenterResultsRailShared";

const GRID_TEMPLATE = "1fr repeat(5, 26px)";

const ScoreRow = ({ team, label, quarters, total, won }) => (
  <Grid templateColumns={GRID_TEMPLATE} alignItems="center" py={1}>
    <Flex align="center" gap={2} minW={0}>
      <RailLogo team={team} label={label} size="20px" />
      <Text
        fontSize="xs"
        color={won ? "white" : "text.secondary"}
        fontWeight="black"
        textTransform="uppercase"
        lineClamp={1}
      >
        {label}
      </Text>
    </Flex>

    {quarters.map((score, index) => (
      <Text
        key={`${label}-${index}`}
        fontSize="xs"
        color={won ? "whiteAlpha.900" : "whiteAlpha.700"}
        fontWeight="bold"
        textAlign="center"
      >
        {score}
      </Text>
    ))}

    <Text fontSize="sm" color={won ? "white" : "whiteAlpha.800"} fontWeight="black" textAlign="center">
      {total}
    </Text>
  </Grid>
);

const RailRowD = ({ game }) => {
  const { away, home } = resolveRailTeams(game);
  const awayWon = game.awayScore > game.homeScore;
  const homeWon = game.homeScore > game.awayScore;
  const awayQuarters = [7, 7, 7, Math.max(0, game.awayScore - 21)];
  const homeQuarters = [7, 3, 7, Math.max(0, game.homeScore - 17)];
  const accent = awayWon ? away?.colors?.primary : home?.colors?.primary;

  return (
    <Box
      flex={1}
      px={4}
      py={2}
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      bg={`linear-gradient(90deg, ${accent ?? "#E53E3E"}14 0%, rgba(11,11,13,0) 68%)`}
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      <Grid templateColumns={GRID_TEMPLATE} mb={1} alignItems="center">
        <Flex align="center" gap={2}>
          <Text
            fontSize="9px"
            color="white"
            bg="whiteAlpha.200"
            px={1.5}
            py={0.5}
            borderRadius="sm"
            fontWeight="black"
            textTransform="uppercase"
          >
            Final
          </Text>
          <Text fontSize="9px" color="text.muted" fontWeight="bold" textTransform="uppercase">
            {game.stageLabel}
          </Text>
        </Flex>

        {["1", "2", "3", "4", "T"].map((header) => (
          <Text key={`${game.id}-${header}`} fontSize="10px" color="whiteAlpha.500" fontWeight="bold" textAlign="center">
            {header}
          </Text>
        ))}
      </Grid>

      <ScoreRow team={away} label={game.awayLabel} quarters={awayQuarters} total={game.awayScore} won={awayWon} />
      <ScoreRow team={home} label={game.homeLabel} quarters={homeQuarters} total={game.homeScore} won={homeWon} />

      <Text mt={0.5} fontSize="8px" color="text.muted" lineClamp={1}>
        {game.summary}
      </Text>
    </Box>
  );
};

export const GameCenterResultsRailD = () => (
  <RailShell title="Game Results">
    {GAME_CENTER_RESULTS_SAMPLES.map((game) => (
      <RailRowD key={game.id} game={game} />
    ))}
  </RailShell>
);
