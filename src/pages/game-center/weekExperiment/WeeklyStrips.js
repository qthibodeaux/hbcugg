import { Box, Flex, Text, Grid } from "@chakra-ui/react";
import { TeamLogo } from "./ExperimentPrimitives";

export const ResultsHeadlineStrip = ({ completed }) => {
  const rows = completed.slice(0, 4);

  return (
    <Box h="100%" w="full" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" bg="#F4F0E8" color="#111113" overflow="hidden">
      <Flex h="100%" direction="column" px={4} py={3}>
        <Text fontSize="9px" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
          Final Results Tape
        </Text>
        <Grid mt={3} flex={1} templateColumns="repeat(4, minmax(0, 1fr))" gap={2} alignItems="stretch">
          {rows.map((matchup) => {
            const winner = matchup.awayScore > matchup.homeScore ? matchup.away : matchup.home;
            const loser = matchup.awayScore > matchup.homeScore ? matchup.home : matchup.away;
            const winScore = matchup.awayScore > matchup.homeScore ? matchup.awayScore : matchup.homeScore;
            const loseScore = matchup.awayScore > matchup.homeScore ? matchup.homeScore : matchup.awayScore;

            return (
              <Box key={matchup.game.parsed_game_stem ?? `${winner.label}-${loser.label}`} borderLeft="3px solid #E53E3E" pl={2} minW={0}>
                <Flex align="center" gap={1.5}>
                  <TeamLogo team={winner} size="22px" />
                  <Text fontSize="lg" fontWeight="black" lineHeight={1} lineClamp={1}>
                    {winner.label}
                  </Text>
                </Flex>
                <Text mt={1} fontSize="2xl" fontWeight="black" lineHeight={0.9}>
                  {winScore}-{loseScore}
                </Text>
                <Text mt={1} fontSize="8px" fontWeight="black" textTransform="uppercase" letterSpacing="0.08em" lineClamp={1}>
                  over {loser.label} | margin {matchup.margin}
                </Text>
              </Box>
            );
          })}
        </Grid>
      </Flex>
    </Box>
  );
};

export const UpcomingPreviewStrip = ({ upcoming }) => {
  const rows = upcoming.slice(0, 4);

  return (
    <Box h="100%" w="full" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" bg="bg.secondary" overflow="hidden">
      <Flex h="100%" direction="column" px={4} py={3}>
        <Text fontSize="9px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
          Upcoming Preview Tape
        </Text>
        <Grid mt={3} flex={1} templateColumns="repeat(4, minmax(0, 1fr))" gap={2}>
          {rows.length === 0 ? (
            <Flex gridColumn="span 4" align="center" justify="center">
              <Text fontSize="xs" color="text.muted" fontWeight="bold">
                No upcoming games left in this selected week.
              </Text>
            </Flex>
          ) : (
            rows.map((matchup) => (
              <Box key={matchup.game.parsed_game_stem ?? `${matchup.away.label}-${matchup.home.label}`} border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" px={3} py={2} minW={0}>
                <Flex align="center" justify="center" gap={2}>
                  <TeamLogo team={matchup.away} size="24px" />
                  <Text fontSize="8px" color="text.muted" fontWeight="black">
                    VS
                  </Text>
                  <TeamLogo team={matchup.home} size="24px" />
                </Flex>
                <Text mt={2} fontSize="sm" color="white" fontWeight="black" textAlign="center" textTransform="uppercase" lineClamp={1}>
                  {matchup.away.label} / {matchup.home.label}
                </Text>
                <Text mt={1} fontSize="8px" color="text.muted" fontWeight="bold" textAlign="center">
                  {matchup.dateLabel}
                </Text>
              </Box>
            ))
          )}
        </Grid>
      </Flex>
    </Box>
  );
};
