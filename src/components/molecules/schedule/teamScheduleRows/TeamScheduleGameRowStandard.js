import { getTeam } from "../../../../utils/teamScheduleModel";
import { fmtDateParts, getTag, getVenueDetails, getWeekFromGame } from "./rowPresentation";
import { Navigation, House } from "lucide-react";
import { Grid, Box, Text, Flex, Image } from "@chakra-ui/react";
import { InitialMark, ScoreBox } from "./RowPrimitives";

// Standard schedule row. Keep desktop dimensions separate from the compact layout.

export const TeamScheduleGameRowStandard = ({ game }) => {
  const isCorpus = game.has_parsed_game && game.parsed_game_stem;
  const opponent = getTeam(game.opponent_id);
  const opponentLogo = opponent ? `/assets/${opponent.exportId.replace(/25$/, "")}.svg` : null;
  const opponentName = opponent?.name ?? game.opponent_name ?? "TBD";
  const opponentShort = opponent?.shortName ?? game.opponent_name ?? "TBD";
  const accent = opponent?.colors?.secondary ?? opponent?.colors?.accent ?? "#FFFFFF";
  const dateParts = fmtDateParts(game.date);
  const tag = getTag(game, opponent);
  const venue = getVenueDetails(game);
  const week = getWeekFromGame(game) ?? "-";
  const isAway = game.home_away === "away";
  const LocationIcon = isAway ? Navigation : House;

  return (
    <Grid
      display={{ base: "none", lg: "grid" }}
      minH={{ lg: "128px", xl: "148px" }}
      templateColumns={{
        lg: "82px 72px minmax(0, 2fr) minmax(0, 1.15fr) 118px 104px",
        xl: "96px 82px minmax(0, 2.1fr) minmax(0, 1.2fr) 132px 112px 108px",
      }}
      alignItems="center"
      gap={{ base: 2, xl: 4 }}
      px={{ base: 2, md: 3, xl: 4 }}
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      bg="rgba(20,20,22,0.98)"
      position="relative"
      overflow="hidden"
      _hover={isCorpus ? { bg: "whiteAlpha.50" } : undefined}
      style={{ transition: "background 0.15s" }}
    >
      {opponent && <Box position="absolute" left={0} top={0} bottom={0} w={{ base: "4px", xl: "5px" }} bg={accent} />}

      <Box textAlign="center">
        <Box px={2} py={{ lg: 2, xl: 2.5 }} bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.200" borderRadius="md">
          <Text fontSize={{ lg: "9px", xl: "10px" }} fontWeight="black" color="text.muted" lineHeight={1} textTransform="uppercase" letterSpacing="0.1em">
            Week
          </Text>
          <Text mt={1} fontSize={{ lg: "2xl", xl: "3xl" }} fontWeight="black" color="white" lineHeight={0.9}>
            {week}
          </Text>
        </Box>
      </Box>

      <Box textAlign="center">
        <Text fontSize={{ lg: "sm", xl: "md" }} color="white" fontWeight="black" lineHeight={1}>
          {dateParts.month}
        </Text>
        <Text mt={1} fontSize={{ lg: "lg", xl: "xl" }} color="text.secondary" fontWeight="black" lineHeight={1}>
          {dateParts.day}
        </Text>
      </Box>

      <Flex align="center" gap={{ base: 2, xl: 4 }} minW={0}>
        {opponentLogo ? (
          <Box w={{ base: "58px", md: "66px", xl: "82px" }} h={{ base: "58px", md: "66px", xl: "82px" }} flexShrink={0}>
            <Image src={opponentLogo} w="100%" h="100%" objectFit="contain" onError={(event) => { event.target.style.display = "none"; }} />
          </Box>
        ) : (
          <InitialMark label={opponentShort.slice(0, 3)} />
        )}
        <Box minW={0}>
          <Text fontSize={{ base: "2xl", md: "3xl", xl: "4xl" }} fontWeight="black" color="white" lineHeight="0.95" letterSpacing="-0.02em" lineClamp={1}>
            {opponentName}
          </Text>
        </Box>
      </Flex>

      <Flex display={{ base: "none", lg: "flex" }} align="center" gap={2} minW={0}>
        <LocationIcon size={17} color={accent} />
        <Box minW={0}>
          <Text fontSize={{ lg: "sm", xl: "md" }} color="white" fontWeight="black" lineClamp={1}>
            {isAway ? "Away" : "Home"}
          </Text>
          <Text mt={1} fontSize={{ lg: "10px", xl: "11px" }} color="text.secondary" fontWeight="bold" lineClamp={1}>
            {venue.city}
          </Text>
          <Text mt={0.5} fontSize={{ lg: "9px", xl: "10px" }} color="text.muted" lineClamp={1}>
            {venue.stadium}
          </Text>
        </Box>
      </Flex>

      <Box display={{ base: "none", lg: "block" }} justifySelf="start" px={{ lg: 3, xl: 4 }} py={{ lg: 2, xl: 2.5 }} borderRadius="md" bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.200">
        <Text fontSize={{ lg: "9px", xl: "10px" }} color={accent} fontWeight="black" textTransform="uppercase" whiteSpace="nowrap">
          {tag}
        </Text>
      </Box>

      <ScoreBox game={game} />

      <Flex display={{ base: "none", xl: "flex" }} justify="end">
        {isCorpus ? (
          <Box borderRadius="md" bg={accent} px={3} py={2}>
            <Text fontSize="8px" color="black" fontWeight="black" textTransform="uppercase">
              Recap
            </Text>
          </Box>
        ) : (
          <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase">
            No Recap
          </Text>
        )}
      </Flex>
    </Grid>
  );
};
