import { Box, Flex, Text, Grid } from "@chakra-ui/react";
import { TeamLogo } from "./ExperimentPrimitives";
import { Link } from "react-router-dom";

export const TopBillingCard = ({ matchup }) => {
  if (!matchup) return null;
  const accent = matchup.home?.colors?.primary ?? "#E53E3E";
  const inner = (
    <Box
      h="100%"
      w="full"
      position="relative"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.200"
      bg={`linear-gradient(135deg, ${matchup.away?.colors?.primary ?? "#111113"}55 0%, #0B0B0D 48%, ${accent}66 100%)`}
    >
      <Box position="absolute" inset={0} opacity={0.12} bg="repeating-linear-gradient(135deg, white 0px, white 1px, transparent 1px, transparent 9px)" />
      <Flex h="100%" position="relative" direction="column" px={5} py={4}>
        <Flex align="center" justify="space-between">
          <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
            Top Billing
          </Text>
          <Text fontSize="10px" color="text.secondary" fontWeight="black" textTransform="uppercase">
            {matchup.dateLabel}
          </Text>
        </Flex>

        <Text mt={4} fontSize="clamp(2.1rem, 4vw, 4.8rem)" color="white" fontWeight="black" lineHeight={0.82} textTransform="uppercase">
          {matchup.isFinal ? `${matchup.totalPoints} Point File` : "Preview Board"}
        </Text>

        <Grid mt="auto" templateColumns="1fr 118px" gap={4} alignItems="end">
          <Flex direction="column" gap={3}>
            {[matchup.away, matchup.home].map((team) => (
              <Flex key={team.label} align="center" gap={3}>
                <TeamLogo team={team} size="44px" />
                <Text fontSize="2xl" color="white" fontWeight="black" textTransform="uppercase" lineClamp={1}>
                  {team.label}
                </Text>
              </Flex>
            ))}
          </Flex>
          <Box textAlign="right">
            <Text fontSize="5xl" color="white" fontWeight="black" lineHeight={0.82}>
              {matchup.isFinal ? matchup.awayScore : "--"}
            </Text>
            <Text fontSize="5xl" color="white" fontWeight="black" lineHeight={0.82}>
              {matchup.isFinal ? matchup.homeScore : "--"}
            </Text>
            <Text mt={2} fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">
              {matchup.isFinal ? `margin ${matchup.margin}` : "upcoming"}
            </Text>
          </Box>
        </Grid>
      </Flex>
    </Box>
  );

  return matchup.linkTo ? (
    <Box as={Link} to={matchup.linkTo} display="block" h="100%">
      {inner}
    </Box>
  ) : (
    inner
  );
};

export const ConferenceRibbon = ({ slate }) => {
  const confGames = slate.filter((game) => game.game.conf_game);
  const nonConfGames = slate.length - confGames.length;

  return (
    <Box h="100%" w="full" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" bg="#F4F0E8" color="#111113" overflow="hidden">
      <Flex h="100%" direction="column" px={4} py={4}>
        <Text fontSize="9px" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
          Conference Ledger
        </Text>
        <Flex mt={4} align="end" gap={3}>
          <Text fontSize="5xl" fontWeight="black" lineHeight={0.8}>
            {confGames.length}
          </Text>
          <Text fontSize="xs" fontWeight="black" textTransform="uppercase" pb={1}>
            conf games
          </Text>
        </Flex>
        <Box mt={4} h="10px" bg="rgba(17,17,19,0.14)" overflow="hidden">
          <Box h="100%" w={`${slate.length ? (confGames.length / slate.length) * 100 : 0}%`} bg="#E53E3E" />
        </Box>
        <Text mt="auto" fontSize="xs" fontWeight="bold">
          {nonConfGames} non-conference or special slate games in this week view.
        </Text>
      </Flex>
    </Box>
  );
};

export const HelmetWall = ({ slate }) => {
  const teams = [];
  slate.forEach((matchup) => {
    [matchup.away, matchup.home].forEach((team) => {
      if (team?.logo && !teams.some((item) => item.label === team.label)) teams.push(team);
    });
  });

  return (
    <Box h="100%" w="full" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" bg="bg.secondary" overflow="hidden">
      <Flex h="100%" direction="column" px={4} py={4}>
        <Text fontSize="9px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
          Teams Active
        </Text>
        <Grid mt={4} templateColumns="repeat(4, minmax(0, 1fr))" gap={2}>
          {teams.slice(0, 12).map((team) => (
            <Flex key={team.label} align="center" justify="center" h="34px" borderRadius="md" bg="whiteAlpha.100">
              <TeamLogo team={team} size="24px" />
            </Flex>
          ))}
        </Grid>
        <Text mt="auto" fontSize="xs" color="text.secondary" fontWeight="bold">
          {teams.length} unique HBCU programs appear on this week's board.
        </Text>
      </Flex>
    </Box>
  );
};
