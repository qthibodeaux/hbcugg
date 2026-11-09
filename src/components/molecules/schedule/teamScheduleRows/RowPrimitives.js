import { Flex, Text, Box } from "@chakra-ui/react";

// Opponent initial fallback and completed/upcoming score box shared across row densities.

export const InitialMark = ({ label }) => (
  <Flex
    w={{ base: "50px", md: "58px", xl: "76px" }}
    h={{ base: "50px", md: "58px", xl: "76px" }}
    borderRadius="md"
    bg="whiteAlpha.100"
    border="1px solid"
    borderColor="whiteAlpha.200"
    align="center"
    justify="center"
    flexShrink={0}
  >
    <Text fontSize={{ base: "lg", xl: "2xl" }} fontWeight="black" color="text.secondary" lineClamp={1}>
      {label}
    </Text>
  </Flex>
);

export const ScoreBox = ({ game }) => {
  const isComplete = !!game.result;
  const won = isComplete && game.result === "W";
  const lost = isComplete && game.result === "L";
  const resultColor = won ? "green.400" : lost ? "red.400" : "text.muted";
  const scoreBg = won ? "rgba(34,197,94,0.16)" : lost ? "rgba(248,113,113,0.16)" : "whiteAlpha.100";
  const scoreBorder = won ? "green.400" : lost ? "red.300" : "whiteAlpha.200";
  const resultLabel = won
    ? `W ${game.score_team}-${game.score_opp}`
    : lost
      ? `L ${game.score_team}-${game.score_opp}`
      : game.result === "T"
        ? `T ${game.score_team}-${game.score_opp}`
        : null;

  return (
    <Box
      justifySelf="end"
      borderRadius="md"
      bg={scoreBg}
      border="1px solid"
      borderColor={scoreBorder}
      px={{ base: 2, xl: 3 }}
      py={{ base: 2, xl: 2.5 }}
      minW={{ base: "74px", xl: "88px" }}
      textAlign="center"
    >
      {isComplete ? (
        <>
          <Text fontSize={{ base: "sm", xl: "md" }} fontWeight="black" color={resultColor} lineHeight={1}>
            {resultLabel}
          </Text>
          {game.has_parsed_game && game.parsed_game_stem && (
            <Text display={{ base: "block", xl: "none" }} fontSize="7px" color="text.secondary" textTransform="uppercase" fontWeight="black" mt={1}>
              Recap
            </Text>
          )}
        </>
      ) : (
        <Text fontSize={{ base: "9px", xl: "10px" }} color="text.muted" textTransform="uppercase" letterSpacing="0.08em" fontWeight="black">
          Upcoming
        </Text>
      )}
    </Box>
  );
};
