import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import {
  GAME_CENTER_RESULTS_SAMPLES,
  RailLogo,
  RailShell,
  resolveRailTeams,
} from "./GameCenterResultsRailShared";

const GRID_TEMPLATE = "1fr repeat(5, 24px)";

const ScoreRow = ({ team, label, quarters, total, won }) => (
  <Grid templateColumns={GRID_TEMPLATE} alignItems="center" py={0.5}>
    <Flex align="center" gap={2} minW={0}>
      <RailLogo team={team} label={label} size="18px" />
      <Text fontSize="xs" color={won ? "white" : "text.secondary"} fontWeight="black" textTransform="uppercase" lineClamp={1}>
        {label}
      </Text>
    </Flex>

    {quarters.map((score, index) => (
      <Text key={`${label}-${index}`} fontSize="10px" color="whiteAlpha.700" fontWeight="bold" textAlign="center">
        {score}
      </Text>
    ))}

    <Text fontSize="xs" color={won ? "white" : "whiteAlpha.800"} fontWeight="black" textAlign="center">
      {total}
    </Text>
  </Grid>
);

const RailRowE = ({ game }) => {
  const { away, home } = resolveRailTeams(game);
  const awayWon = game.awayScore > game.homeScore;
  const homeWon = game.homeScore > game.awayScore;
  const awayQuarters = [7, 7, 7, Math.max(0, game.awayScore - 21)];
  const homeQuarters = [7, 3, 7, Math.max(0, game.homeScore - 17)];

  return (
    <Box
      flex={1}
      px={4}
      py={1.5}
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      <Flex justify="space-between" align="center" mb={0.75}>
        <Text fontSize="9px" color="brand.500" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
          {game.stageLabel}
        </Text>
        <Text fontSize="9px" color="text.muted" fontWeight="bold">
          {game.dateLabel}
        </Text>
      </Flex>

      <Grid templateColumns={GRID_TEMPLATE} mb={1} alignItems="center">
        <Box />
        {["1", "2", "3", "4", "T"].map((header) => (
          <Text key={`${game.id}-hdr-${header}`} fontSize="9px" color="whiteAlpha.500" fontWeight="bold" textAlign="center">
            {header}
          </Text>
        ))}
      </Grid>

      <ScoreRow team={away} label={game.awayLabel} quarters={awayQuarters} total={game.awayScore} won={awayWon} />
      <ScoreRow team={home} label={game.homeLabel} quarters={homeQuarters} total={game.homeScore} won={homeWon} />

      <Text mt={0.75} fontSize="8px" color="text.muted" textTransform="uppercase" lineClamp={1}>
        {game.summary}
      </Text>
    </Box>
  );
};

export const GameCenterResultsRailE = () => (
  <RailShell title="Scoreboard Rail">
    {GAME_CENTER_RESULTS_SAMPLES.map((game) => (
      <RailRowE key={game.id} game={game} />
    ))}
  </RailShell>
);
