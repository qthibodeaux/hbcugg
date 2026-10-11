import React from "react";
import { Box, Flex, Text, Image, Badge, VStack, HStack } from "@chakra-ui/react";
import { MapPin,  Tv } from "lucide-react";

/**
 * Mock Data based on AGENTS.md / teams.json
 */
const MOCK_GAMES = [
  {
    id: "jsu-famu-2025",
    date: "2025-11-29",
    day_of_week: "Sat",
    stadium: "Bragg Memorial Stadium",
    site: "Tallahassee, FL",
    game_name: "The Orange Blossom Classic",
    conf_game: true,
    bowl_game: false,
    status: "final",
    away: { id: "jackson-state", shortName: "JSU", name: "Jackson State", logo: "/assets/swacjsu.svg", color: "#002147", score: 31 },
    home: { id: "florida-am", shortName: "FAMU", name: "Florida A&M", logo: "/assets/swacfamu.svg", color: "#006747", score: 28 },
    isHbcuMatchup: true,
  },
  {
    id: "alcorn-uapb-2025",
    date: "2025-11-15",
    day_of_week: "Sat",
    stadium: "Simmons Bank Field",
    site: "Pine Bluff, AR",
    game_name: null,
    conf_game: true,
    bowl_game: false,
    status: "upcoming",
    away: { id: "alcorn", shortName: "Alcorn", name: "Alcorn State", logo: "/assets/swacalc.svg", color: "#5C068C", score: null },
    home: { id: "uapb", shortName: "UAPB", name: "Arkansas-Pine Bluff", logo: "/assets/swacuapb.svg", color: "#000000", score: null },
    isHbcuMatchup: true,
  }
];

/**
 * CONCEPT 1: The Editorial Tape
 * Winner-focused with a strong gradient.
 */
export const GameRowEditorialTape = ({ game = MOCK_GAMES[0] }) => {
  const isFinal = game.status === "final";
  const awayWinner = isFinal && game.away.score > game.home.score;
  const homeWinner = isFinal && game.home.score > game.away.score;
  const winColor = awayWinner ? game.away.color : homeWinner ? game.home.color : "transparent";

  return (
    <Box
      w="full"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="lg"
      overflow="hidden"
      position="relative"
      _hover={{ borderColor: "whiteAlpha.300" }}
      transition="all 0.2s"
    >
      {/* Winner Gradient Overlay */}
      <Box
        position="absolute"
        inset={0}
        bg={`linear-gradient(90deg, ${winColor}22 0%, transparent 50%)`}
        pointerEvents="none"
      />

      <Flex h="full" align="center" px={{ base: 2, md: 6 }} py={4} gap={4}>
        {/* Meta Info - Hides on squeeze */}
        <VStack align="start" spacing={0} display={{ base: "none", lg: "flex" }} minW="100px">
          <Text textStyle="kicker" color="text.muted">{game.day_of_week}</Text>
          <Text fontSize="md" fontWeight="bold" color="white">{game.date.split("-").slice(1).join("/")}</Text>
        </VStack>

        {/* Matchup */}
        <Flex flex={1} align="center" justify="space-between" gap={4}>
          {/* Away */}
          <HStack flex={1} justify="flex-end" spacing={3}>
            <Text
              textStyle="cardTitle"
              color={awayWinner || !isFinal ? "text.primary" : "text.muted"}
              textAlign="right"
              lineClamp={1}
            >
              <Box as="span" display={{ base: "none", md: "inline" }}>{game.away.name}</Box>
              <Box as="span" display={{ base: "inline", md: "none" }}>{game.away.shortName}</Box>
            </Text>
            <Image src={game.away.logo} w={{ base: "24px", md: "32px" }} h="auto" />
          </HStack>

          {/* Score / Center */}
          <VStack spacing={0} minW="80px">
            {isFinal ? (
              <HStack spacing={2}>
                <Text fontSize="2xl" fontWeight="900" color={awayWinner ? "white" : "text.muted"}>{game.away.score}</Text>
                <Text fontSize="lg" fontWeight="bold" color="text.muted">-</Text>
                <Text fontSize="2xl" fontWeight="900" color={homeWinner ? "white" : "text.muted"}>{game.home.score}</Text>
              </HStack>
            ) : (
              <Badge variant="subtle" colorPalette="orange">TBD</Badge>
            )}
            <Text textStyle="panelLabel" color="brand.500" display={{ base: "none", md: "block" }}>
              {game.game_name || (game.conf_game ? "CONFERENCE" : "NON-CONF")}
            </Text>
          </VStack>

          {/* Home */}
          <HStack flex={1} justify="flex-start" spacing={3}>
            <Image src={game.home.logo} w={{ base: "24px", md: "32px" }} h="auto" />
            <Text
              textStyle="cardTitle"
              color={homeWinner || !isFinal ? "text.primary" : "text.muted"}
              textAlign="left"
              lineClamp={1}
            >
              <Box as="span" display={{ base: "none", md: "inline" }}>{game.home.name}</Box>
              <Box as="span" display={{ base: "inline", md: "none" }}>{game.home.shortName}</Box>
            </Text>
          </HStack>
        </Flex>

        {/* Actions/Link */}
        <Flex align="center" justify="center" display={{ base: "none", sm: "flex" }}>
          <Box as={Tv} size={16} color="text.muted" />
        </Flex>
      </Flex>
    </Box>
  );
};

/**
 * CONCEPT 2: The Broadcast Strip
 * Sleek, technical, logo-first.
 */
export const GameRowBroadcastStrip = ({ game = MOCK_GAMES[0] }) => {
  return (
    <Box
      w="full"
      h="full"
      bg="bg.card"
      borderLeft="4px solid"
      borderLeftColor="brand.500"
      p={4}
      display="flex"
      alignItems="center"
      gap={6}
    >
      <VStack align="start" spacing={1} flex={1}>
        {game.game_name && (
          <Text textStyle="pill" color="brand.400" letterSpacing="widest">
            {game.game_name}
          </Text>
        )}
        <HStack spacing={4} w="full">
          <Flex align="center" gap={3}>
            <Image src={game.away.logo} w="40px" />
            <Text textStyle="heroStat" fontSize="xl">{game.away.shortName}</Text>
          </Flex>
          <Text color="text.muted" fontWeight="black">@</Text>
          <Flex align="center" gap={3}>
            <Image src={game.home.logo} w="40px" />
            <Text textStyle="heroStat" fontSize="xl">{game.home.shortName}</Text>
          </Flex>
          <Box flex={1} />
          {game.status === "final" ? (
            <HStack bg="blackAlpha.400" px={4} py={1} borderRadius="md">
               <Text fontWeight="900" fontSize="xl" color="white">{game.away.score}</Text>
               <Box w="1px" h="20px" bg="whiteAlpha.200" />
               <Text fontWeight="900" fontSize="xl" color="white">{game.home.score}</Text>
            </HStack>
          ) : (
            <Text textStyle="kicker" color="text.muted">{game.day_of_week} {game.date}</Text>
          )}
        </HStack>
        <HStack color="text.muted" spacing={4} display={{ base: "none", md: "flex" }}>
          <HStack spacing={1}>
            <MapPin size={12} />
            <Text fontSize="xs">{game.stadium}</Text>
          </HStack>
          {game.conf_game && <Badge size="xs" variant="outline">SWAC</Badge>}
        </HStack>
      </VStack>
    </Box>
  );
};

/**
 * Lab Gallery Export
 */
export const WeekCentralGameRowsGallery = () => {
  return (
    <VStack w="full" spacing={6} align="stretch" p={4} bg="bg.primary">
       <Box>
        <Text textStyle="panelLabel" mb={2}>Concept 1: Editorial Tape (Final)</Text>
        <Box h="80px">
          <GameRowEditorialTape game={MOCK_GAMES[0]} />
        </Box>
      </Box>

      <Box>
        <Text textStyle="panelLabel" mb={2}>Concept 1: Editorial Tape (Upcoming)</Text>
        <Box h="80px">
          <GameRowEditorialTape game={MOCK_GAMES[1]} />
        </Box>
      </Box>

      <Box>
        <Text textStyle="panelLabel" mb={2}>Concept 2: Broadcast Strip (The Classic)</Text>
        <Box h="100px">
          <GameRowBroadcastStrip game={MOCK_GAMES[0]} />
        </Box>
      </Box>

      <Box maxW="400px">
        <Text textStyle="panelLabel" mb={2}>Concept 1: Squeezed State (1x1 Slot behavior)</Text>
        <Box h="80px">
          <GameRowEditorialTape game={MOCK_GAMES[0]} />
        </Box>
      </Box>
    </VStack>
  );
};

