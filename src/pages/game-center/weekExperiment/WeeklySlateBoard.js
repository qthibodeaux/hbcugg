import { Box, Flex, Text, Grid } from "@chakra-ui/react";
import { TeamLogo } from "./ExperimentPrimitives";
import { Link } from "react-router-dom";

const SlateGameCard = ({ matchup }) => {
  const winner =
    matchup.isFinal && matchup.awayScore !== matchup.homeScore
      ? matchup.awayScore > matchup.homeScore
        ? matchup.away.label
        : matchup.home.label
      : null;

  const content = (
    <Box
      h="100%"
      minH="150px"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      overflow="hidden"
      bg="linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(13,13,16,0.98) 52%, rgba(229,62,62,0.10) 100%)"
    >
      <Flex h="100%" direction="column" px={4} py={3}>
        <Flex align="center" justify="space-between">
          <Text fontSize="9px" color={matchup.isFinal ? "text.muted" : "brand.400"} fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
            {matchup.isFinal ? "Final" : "Upcoming"}
          </Text>
          <Text fontSize="9px" color="text.muted" fontWeight="bold">
            {matchup.dateLabel}
          </Text>
        </Flex>

        {[matchup.away, matchup.home].map((team, index) => {
          const score = index === 0 ? matchup.awayScore : matchup.homeScore;
          const won = winner === team.label;
          return (
            <Flex key={`${team.label}-${index}`} mt={3} align="center" gap={3}>
              <TeamLogo team={team} size="30px" muted={matchup.isFinal && winner && !won} />
              <Text flex={1} fontSize="lg" color={won || !winner ? "white" : "text.secondary"} fontWeight="black" textTransform="uppercase" lineClamp={1}>
                {team.label}
              </Text>
              <Text fontSize="2xl" color={won || !winner ? "white" : "text.muted"} fontWeight="black" lineHeight={1}>
                {matchup.isFinal ? score : "--"}
              </Text>
            </Flex>
          );
        })}

        <Text mt="auto" fontSize="10px" color="text.muted" fontWeight="bold" textTransform="uppercase" letterSpacing="0.08em">
          {matchup.game.conf_game ? "Conference game" : matchup.game.game_name ?? "Week slate"}
        </Text>
      </Flex>
    </Box>
  );

  return matchup.linkTo ? (
    <Box as={Link} to={matchup.linkTo} display="block">
      {content}
    </Box>
  ) : (
    content
  );
};

export const WeeklySlateBoard = ({ slate }) => {
  const finals = slate.filter((matchup) => matchup.isFinal).length;
  const upcoming = slate.length - finals;

  return (
    <Box
      h="100%"
      w="full"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg="linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(10,10,12,0.98) 44%, rgba(229,62,62,0.10) 100%)"
    >
      <Flex h="100%" direction="column">
        <Flex px={5} py={4} align="center" gap={3} flexShrink={0} borderBottom="1px solid" borderColor="whiteAlpha.100">
          <Box px={2} py={1} bg="brand.500">
            <Text fontSize="9px" color="white" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
              Weekly Slate
            </Text>
          </Box>
          <Text fontSize="sm" color="white" fontWeight="black" textTransform="uppercase">
            {slate.length} games on the board
          </Text>
          <Text fontSize="xs" color="text.muted" fontWeight="bold">
            {finals} final | {upcoming} upcoming
          </Text>
          <Box h="1px" flex={1} bg="whiteAlpha.100" />
          <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
            Schedule-first experiment
          </Text>
        </Flex>

        <Grid flex={1} minH={0} templateColumns="repeat(3, minmax(0, 1fr))" autoRows="minmax(0, 1fr)" gap={1} p={1}>
          {slate.slice(0, 9).map((matchup) => (
            <SlateGameCard key={matchup.game.parsed_game_stem ?? `${matchup.game.team_id}-${matchup.game.date}`} matchup={matchup} />
          ))}
        </Grid>
      </Flex>
    </Box>
  );
};
