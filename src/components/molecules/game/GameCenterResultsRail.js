import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { getTeamLabelForDensity } from "../../../utils/gameCenterPayloads";

// Every dimension in this rail is in cqmin — a fraction of the rail's own
// width (it's a 1x3 slot, so width is the short side). Rows are flex: 1 and
// split the slot's height between them; nothing here has a px floor or a
// viewport breakpoint.
const GRID_TEMPLATE = "1fr repeat(5, 12cqmin)";
// Out-of-conference games have no quarter breakdown — when one of our 18 plays
// a team outside the league, the export sends teams and the final score only.
// Those rows drop the quarter columns entirely instead of printing "- - - -".
const GRID_TEMPLATE_FINAL_ONLY = "1fr 12cqmin";

const hasQuarterBreakdown = (quarters) =>
  Array.isArray(quarters) && quarters.some((q) => Number.isFinite(Number(q)));

const getShortStageLabel = (label) => {
  const normalized = String(label ?? "").toLowerCase();
  if (normalized.includes("swac championship")) return "SCG";
  if (normalized.includes("celebration bowl")) return "CB";
  return label;
};

const ScoreRow = ({ label, quarters, total, won, showQuarters }) => (
  <Grid
    templateColumns={showQuarters ? GRID_TEMPLATE : GRID_TEMPLATE_FINAL_ONLY}
    alignItems="center"
    py="1cqmin"
  >
    <Flex align="center" gap="2cqmin" minW={0}>
      <Text
        fontSize="6.5cqmin"
        color={won ? "white" : "text.secondary"}
        fontWeight="black"
        textTransform="uppercase"
        lineHeight={1.2}
        lineClamp={1}
      >
        {label}
      </Text>
    </Flex>

    {showQuarters
      && quarters.map((score, index) => (
        <Text
          key={`${label}-${index}`}
          fontSize="5cqmin"
          color={won ? "whiteAlpha.900" : "whiteAlpha.700"}
          fontWeight="bold"
          textAlign="center"
          lineHeight={1.2}
        >
          {score}
        </Text>
      ))}

    <Text fontSize="8cqmin" color={won ? "white" : "whiteAlpha.800"} fontWeight="black" textAlign="center" lineHeight={1.2}>
      {total}
    </Text>
  </Grid>
);

const ResultsRailRow = ({ game, isLast }) => {
  const { isMobile, isCompact } = useLayoutDensity();
  const awayWon = game.awayScore > game.homeScore;
  const homeWon = game.homeScore > game.awayScore;
  const showQuarters = hasQuarterBreakdown(game.awayByQ) && hasQuarterBreakdown(game.homeByQ);
  const accent = awayWon ? game.away?.primary : game.home?.primary;

  return (
    <Box
      as={game?.gameId ? RouterLink : "div"}
      to={game?.gameId ? `/game/${encodeURIComponent(game.gameId)}` : undefined}
      flex={1}
      minH={0}
      px="5cqmin"
      py="2.5cqmin"
      borderBottom={isLast ? "none" : "1px solid"}
      borderColor="whiteAlpha.100"
      bg={`linear-gradient(90deg, ${accent ?? "#E53E3E"}14 0%, rgba(11,11,13,0) 68%)`}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      _hover={
        game?.gameId
          ? { bg: `linear-gradient(90deg, ${accent ?? "#E53E3E"}22 0%, rgba(11,11,13,0.08) 68%)` }
          : undefined
      }
    >
      <Grid
        templateColumns={showQuarters ? GRID_TEMPLATE : GRID_TEMPLATE_FINAL_ONLY}
        mb="1cqmin"
        alignItems="center"
      >
        <Text
          fontSize="4cqmin"
          color="white"
          bg="whiteAlpha.200"
          px="2cqmin"
          py="0.75cqmin"
          borderRadius={isMobile ? "0" : "sm"}
          fontWeight="black"
          textTransform="uppercase"
          lineHeight={1.2}
          w="fit-content"
        >
          Final
        </Text>

        {(showQuarters ? ["1", "2", "3", "4", "T"] : ["T"]).map((header) => (
          <Text key={`${game.id}-${header}`} fontSize="4cqmin" color="whiteAlpha.500" fontWeight="bold" textAlign="center" lineHeight={1.2}>
            {header}
          </Text>
        ))}
      </Grid>

      <ScoreRow
        label={getTeamLabelForDensity(game.away, { compact: isCompact })}
        quarters={game.awayByQ}
        total={game.awayScore}
        won={awayWon}
        showQuarters={showQuarters}
      />
      <ScoreRow
        label={getTeamLabelForDensity(game.home, { compact: isCompact })}
        quarters={game.homeByQ}
        total={game.homeScore}
        won={homeWon}
        showQuarters={showQuarters}
      />

      <Text mt="1cqmin" fontSize="4cqmin" color="text.muted" fontWeight="bold" textTransform="uppercase" lineHeight={1.2} lineClamp={1}>
        {getShortStageLabel(game.stageLabel)}
      </Text>
    </Box>
  );
};

export const GameCenterResultsRail = ({ cards = [] }) => {
  const { isMobile } = useLayoutDensity();
  return (
    <Box
      h="100%"
      containerType="size"
      borderRadius={isMobile ? "0" : "xl"}
      border="1px solid"
      borderColor="whiteAlpha.200"
      bg="linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(11,11,13,0.96) 18%, #0b0b0d 100%)"
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      <Flex
        align="center"
        justify="space-between"
        px="5cqmin"
        py="3.5cqmin"
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
        flexShrink={0}
      >
        <Text fontSize="5.5cqmin" color="brand.500" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em" lineHeight={1}>
          Game Results
        </Text>
        <Text fontSize="5.5cqmin" color="text.muted" fontWeight="bold" textTransform="uppercase" lineHeight={1}>
          Latest
        </Text>
      </Flex>

      <Flex direction="column" flex={1} minH={0}>
        {cards.map((game, index) => (
          <ResultsRailRow key={game.id} game={game} isLast={index === cards.length - 1} />
        ))}
      </Flex>
    </Box>
  );
};
