import { Grid, Flex, Box, Image, Text } from "@chakra-ui/react";
import { getTeamTicker } from "./layoutLabModel";
import { Link as RouterLink } from "react-router-dom";

// Historical layout-lab result rail and quarter-score presentation.

const getRailHeading = (cards) => {
  const firstResult = cards.find((card) => card.mode === "result");
  if (!firstResult) return "Week Results";
  return `${firstResult.stageLabel ?? "Week"} Results`;
};

const ScheduleRailResultItem = ({ game }) => {
  const clickTo = game?.mode === "result" && game?.gameId ? `/game/${encodeURIComponent(game.gameId)}` : null;
  const homeByQ = game?.homeByQ ?? ["-", "-", "-", "-"];
  const awayByQ = game?.awayByQ ?? ["-", "-", "-", "-"];

  // Define a shared grid template so headers and rows align perfectly
  // 1fr for team info, then 5 fixed-width columns for scores
  const gridTemplate = "1fr repeat(5, 30px)"; 

  const ScoreRow = ({ team, quarters, total, isHome }) => (
    <Grid templateColumns={gridTemplate} alignItems="center" py={1}>
      {/* Team Info Column */}
      <Flex align="center" gap={2} minW={0}>
        <Box w="22px" h="22px" borderRadius="4px" bg="whiteAlpha.100" flexShrink={0} display="flex" align="center" justify="center">
          {team?.logo && <Image src={team.logo} w="16px" h="16px" objectFit="contain" />}
        </Box>
        <Text fontSize="md" color="white" fontWeight="900" textTransform="uppercase">{getTeamTicker(team)}</Text>
      </Flex>

      {/* Score Columns */}
      {quarters.map((score, i) => (
        <Text key={i} fontSize="sm" color="whiteAlpha.700" fontWeight="bold" textAlign="center">
          {score}
        </Text>
      ))}
      <Text fontSize="md" color="white" fontWeight="900" textAlign="center">
        {total}
      </Text>
    </Grid>
  );

  return (
    <Box
      as={clickTo ? RouterLink : "div"}
      to={clickTo || undefined}
      w="100%"
      py={3}
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      _hover={clickTo ? { bg: "whiteAlpha.050" } : undefined}
    >
      {/* Header Row */}
      <Grid templateColumns={gridTemplate} mb={1} alignItems="center">
        <Text fontSize="9px" color="white" bg="whiteAlpha.300" w="fit-content" px={1.5} py={0.5} borderRadius="sm" fontWeight="black">
          FINAL
        </Text>
        {["1", "2", "3", "4", "T"].map((h) => (
          <Text key={h} fontSize="10px" color="whiteAlpha.500" fontWeight="bold" textAlign="center">{h}</Text>
        ))}
      </Grid>

      {/* Team Rows */}
      <ScoreRow team={game.home} quarters={homeByQ} total={game?.homeScore ?? "--"} isHome />
      <ScoreRow team={game.away} quarters={awayByQ} total={game?.awayScore ?? "--"} />
      
      {game?.stageLabel && (
        <Text mt={1} fontSize="9px" color="whiteAlpha.400" textTransform="uppercase" fontWeight="bold">
          {game.stageLabel}
        </Text>
      )}
    </Box>
  );
};

export const ScheduleRailList = ({ cards = [] }) => (
  <Box p={0} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.200" bg="blackAlpha.350" h="100%" overflow="hidden">
    <Box px={4} pt={4} pb={2}>
      <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="0.12em">
        {getRailHeading(cards)}
      </Text>
    </Box>
    <Box px={4} pb={3}>
      {cards.map((game) => (
        <ScheduleRailResultItem key={game.id} game={game} />
      ))}
    </Box>
  </Box>
);
