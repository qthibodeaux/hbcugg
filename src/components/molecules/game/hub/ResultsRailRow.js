import { Grid, Flex, Text, Box } from "@chakra-ui/react";
import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";
import { getTeamLabelForDensity } from "../../../../utils/gameCenterPayloads";
import { Link as RouterLink } from "react-router-dom";

const QUARTER_COL = "9cqmin";

const TOTAL_COL = "11cqmin";

const GRID_TEMPLATE_FINAL_ONLY = `1fr ${TOTAL_COL}`;

const templateFor = (periods) => `1fr repeat(${periods}, ${QUARTER_COL}) ${TOTAL_COL}`;

const periodsOf = (game) => Math.max(4, game.awayByQ?.length ?? 0, game.homeByQ?.length ?? 0);

const periodLabel = (i) => (i < 4 ? String(i + 1) : i === 4 ? "OT" : `${i - 3}OT`);

const hasQuarterBreakdown = (quarters) =>
  Array.isArray(quarters) && quarters.some((q) => Number.isFinite(Number(q)));

const getShortStageLabel = (label) => {
  const normalized = String(label ?? "").toLowerCase();
  if (normalized.includes("swac championship")) return "SCG";
  if (normalized.includes("celebration bowl")) return "CB";
  return label;
};

const ScoreRow = ({ label, quarters, periods, total, won, showQuarters }) => (
  <Grid
    templateColumns={showQuarters ? templateFor(periods) : GRID_TEMPLATE_FINAL_ONLY}
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
      && Array.from({ length: periods }, (_, index) => quarters[index] ?? "").map((score, index) => (
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

export const ResultsRailRow = ({ game, isLast }) => {
  const { isMobile, isCompact } = useLayoutDensity();
  const awayWon = game.awayScore > game.homeScore;
  const homeWon = game.homeScore > game.awayScore;
  const showQuarters = hasQuarterBreakdown(game.awayByQ) && hasQuarterBreakdown(game.homeByQ);
  const accent = awayWon ? game.away?.primary : game.home?.primary;
  const periods = periodsOf(game);
  // Rows with period scores are tight: the team's short name (teams.json), which
  // always fits. Rows with only a final score have room for the display name.
  const rowLabel = (team) => (showQuarters ? team?.shortName ?? getTeamLabelForDensity(team, { compact: isCompact }) : getTeamLabelForDensity(team, { compact: isCompact }));

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
        templateColumns={showQuarters ? templateFor(periods) : GRID_TEMPLATE_FINAL_ONLY}
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

        {(showQuarters ? [...Array.from({ length: periods }, (_, i) => periodLabel(i)), "T"] : ["T"]).map((header) => (
          <Text key={`${game.id}-${header}`} fontSize="4cqmin" color="whiteAlpha.500" fontWeight="bold" textAlign="center" lineHeight={1.2}>
            {header}
          </Text>
        ))}
      </Grid>

      <ScoreRow
        label={rowLabel(game.away)}
        quarters={game.awayByQ}
        periods={periods}
        total={game.awayScore}
        won={awayWon}
        showQuarters={showQuarters}
      />
      <ScoreRow
        label={rowLabel(game.home)}
        quarters={game.homeByQ}
        periods={periods}
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
