import React from "react";
import { Box, Flex, Text, Image, VStack, HStack } from "@chakra-ui/react";
import teams from "../../../data/teams.json";

/**
 * GameRowK: The "Frankenstein" Clash Banner
 * 
 * Features:
 * - Z-Index Orchestration: Massively scaled team watermarks at 0.05 opacity.
 * - High-Identity Cards: Two distinct cards in the center using team primary/secondary mapping.
 * - Fluid Editorial Typography: Massive bannerHeadline mascot names.
 * - Cinematic Collision: (In Variant B) Mascots physically overlap the identity cards.
 */

const MOCK_GAME = {
  homeTeamId: "alcorn",
  awayTeamId: "grambling",
  homeScore: 34,
  awayScore: 27,
  stadium: "Spinks-Casem Stadium",
  city: "Lorman, MS",
  week: "WEEK 10",
  date: "NOV 02, 2025",
  homeRecord: "6-2 (4-1 SWAC)",
  awayRecord: "4-4 (3-2 SWAC)",
};

const getTeam = (id) => teams.teams.find((t) => t.id === id) || teams.teams[0];

const IdentityCard = ({ team, score }) => (
  <Box
    bg={team.colors.primary}
    p={4}
    minW="180px"
    h="100px"
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    border="1px solid"
    borderColor="whiteAlpha.200"
    boxShadow="xl"
    position="relative"
    zIndex={5}
  >
    <Text
      textStyle="pill"
      color={team.colors.secondary}
      mb={1}
      opacity={0.8}
    >
      {team.mascot}
    </Text>
    <Text
      textStyle="heroStat"
      color={team.colors.secondary}
      lineHeight="1"
    >
      {score}
    </Text>
  </Box>
);

const GameClashRow = ({ game, collision = false }) => {
  const home = getTeam(game.homeTeamId);
  const away = getTeam(game.awayTeamId);

  return (
    <Box
      w="full"
      h="full"
      bg="#0B0B0D"
      position="relative"
      overflow="hidden"
      border="1px solid"
      borderColor="whiteAlpha.100"
    >
      {/* LAYER 1: Thematic Watermarking (Massive Logos) */}
      <Image
        src={home.logo}
        position="absolute"
        left="-5%"
        top="50%"
        transform="translateY(-50%) scale(2.2)"
        opacity={0.06}
        pointerEvents="none"
        filter="grayscale(1) brightness(2)"
      />
      <Image
        src={away.logo}
        position="absolute"
        right="-5%"
        top="50%"
        transform="translateY(-50%) scale(2.2)"
        opacity={0.06}
        pointerEvents="none"
        filter="grayscale(1) brightness(2)"
      />

      <Flex w="full" h="full" align="center" justify="center" px={12}>
        
        {/* LEFT SIDE: Home Mascot (Foreground Identity) */}
        <Flex flex={1} justify="flex-end" position="relative">
          <Text
            textStyle="bannerHeadline"
            color="text.primary"
            whiteSpace="nowrap"
            // Variant B logic: Shift text into the center card
            mr={collision ? "-40px" : "20px"}
            zIndex={collision ? 10 : 1}
            transition="all 0.3s ease"
          >
            {home.mascot}
          </Text>
        </Flex>

        {/* CENTER: Identity Cards & Metadata */}
        <VStack spacing={4} zIndex={5} minW="400px">
          <Text textStyle="kicker" color="whiteAlpha.600">
            {game.week} • {game.date}
          </Text>

          <HStack spacing={0} boxShadow="2xl">
            <IdentityCard team={home} score={game.homeScore} />
            <IdentityCard team={away} score={game.awayScore} />
          </HStack>

          <VStack spacing={0}>
            <Text textStyle="editorial" color="white">
              {game.stadium.toUpperCase()}
            </Text>
            <HStack spacing={4}>
                <Text textStyle="panelLabel" color="whiteAlpha.700">{game.homeRecord}</Text>
                <Box w="1px" h="8px" bg="whiteAlpha.300" />
                <Text textStyle="panelLabel" color="whiteAlpha.700">{game.awayRecord}</Text>
            </HStack>
          </VStack>
        </VStack>

        {/* RIGHT SIDE: Away Mascot (Foreground Identity) */}
        <Flex flex={1} justify="flex-start" position="relative">
          <Text
            textStyle="bannerHeadline"
            color="text.primary"
            whiteSpace="nowrap"
            // Variant B logic: Shift text into the center card
            ml={collision ? "-40px" : "20px"}
            zIndex={collision ? 10 : 1}
            transition="all 0.3s ease"
          >
            {away.mascot}
          </Text>
        </Flex>
      </Flex>

      {/* Atmospheric Vignetting */}
      <Box
        position="absolute"
        inset={0}
        pointerEvents="none"
        bg="radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.4) 100%)"
      />
    </Box>
  );
};

export const WeekCentralGameRowK__Lab = () => {
  return (
    <VStack spacing={8} w="full" p={4} bg="blackAlpha.900">
      <VStack align="flex-start" w="full" spacing={2}>
        <Text textStyle="kicker" color="brand.400">Variant A: Clean Identity Clash</Text>
        <Box w="full" h="240px">
          <GameClashRow game={MOCK_GAME} collision={false} />
        </Box>
      </VStack>
      <VStack align="flex-start" w="full" spacing={2}>
        <Text textStyle="kicker" color="brand.400">Variant B: Cinematic Collision (Overlap)</Text>
        <Box w="full" h="240px">
          <GameClashRow game={MOCK_GAME} collision={true} />
        </Box>
      </VStack>
    </VStack>
  );
};
