import { getTeam } from "../../../../utils/teamScheduleModel";
import { fmtDateParts, getGameLabel, getWeekFromGame } from "./rowPresentation";
import { Grid, Box, Flex, Text, Image } from "@chakra-ui/react";
import { InitialMark, ScoreBox } from "./RowPrimitives";

// Compact/phone schedule row, retaining its own information density and sizing.

export const TeamScheduleGameRowCompact = ({ game }) => {
  const isCorpus = game.has_parsed_game && game.parsed_game_stem;
  const opponent = getTeam(game.opponent_id);
  const opponentLogo = opponent ? `/assets/${opponent.exportId.replace(/25$/, "")}.svg` : null;
  const opponentShort = opponent?.shortName ?? game.opponent_name ?? "TBD";
  const accent = opponent?.colors?.secondary ?? opponent?.colors?.accent ?? "#FFFFFF";
  const dateParts = fmtDateParts(game.date);
  const gameLabel = getGameLabel(game, opponent);
  const homeAway = game.home_away === "away" ? "Away" : "Home";

  return (
    <Grid
      display={{ base: "grid", lg: "none" }}
      minH={{ base: "100px", md: "112px" }}
      templateColumns={{ base: "58px minmax(0, 1fr) 78px", md: "68px minmax(0, 1fr) 86px" }}
      alignItems="center"
      gap={{ base: 2, md: 3 }}
      px={{ base: 2, md: 3 }}
      py={{ base: 2, md: 3 }}
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      bg="rgba(20,20,22,0.98)"
      position="relative"
      overflow="hidden"
      _hover={isCorpus ? { bg: "whiteAlpha.50" } : undefined}
      style={{ transition: "background 0.15s" }}
    >
      {opponent && <Box position="absolute" left={0} top={0} bottom={0} w="4px" bg={accent} />}

      <Flex direction="column" align="center" gap={2}>
        <Box w={{ base: "52px", md: "60px" }} px={2} py={1.5} bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.200" borderRadius="md" textAlign="center">
          <Text fontSize={{ base: "13px", md: "14px" }} fontWeight="black" color="white" lineHeight={1}>
            W{getWeekFromGame(game) ?? "-"}
          </Text>
        </Box>
        <Box textAlign="center">
          <Text fontSize={{ base: "10px", md: "11px" }} color="white" fontWeight="black" lineHeight={1}>
            {dateParts.month}
          </Text>
          <Text mt={1} fontSize={{ base: "10px", md: "11px" }} color="text.secondary" fontWeight="black" lineHeight={1}>
            {dateParts.day}
          </Text>
        </Box>
      </Flex>

      <Flex align="center" gap={{ base: 2, md: 3 }} minW={0}>
        {opponentLogo ? (
          <Box w={{ base: "58px", md: "68px" }} h={{ base: "58px", md: "68px" }} flexShrink={0}>
            <Image src={opponentLogo} w="100%" h="100%" objectFit="contain" onError={(event) => { event.target.style.display = "none"; }} />
          </Box>
        ) : (
          <InitialMark label={opponentShort.slice(0, 3)} />
        )}
        <Box minW={0}>
          <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="black" color="white" lineHeight="0.92" lineClamp={1}>
            {opponentShort}
          </Text>
          <Text mt={1} fontSize={{ base: "9px", md: "10px" }} color={accent} fontWeight="black" textTransform="uppercase" letterSpacing="0.06em" lineClamp={1}>
            {gameLabel} / {homeAway}
          </Text>
        </Box>
      </Flex>

      <ScoreBox game={game} />
    </Grid>
  );
};
