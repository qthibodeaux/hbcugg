import React from "react";
import { Box, Flex, Text, Image, Center, VStack, HStack, Grid, GridItem } from "@chakra-ui/react";


const MOCK_GAME = {
  id: "jsu-famu-2025",
  date: "NOV 29",
  game_name: "ORANGE BLOSSOM CLASSIC",
  status: "final",
  away: { shortName: "JSU", name: "Jackson State", logo: "/assets/swacjsu.svg", color: "#002147", score: 31 },
  home: { shortName: "FAMU", name: "Florida A&M", logo: "/assets/swacfamu.svg", color: "#006747", score: 28 },
};

/**
 * MAGIC 1: The Cinematic Collision
 * Discards the traditional row for an overlapping visual clash.
 */
export const GameRowCinematicCollision = ({ game = MOCK_GAME, squeezed = false }) => {
  return (
    <Box
      w="full"
      h="full"
      bg="bg.primary"
      position="relative"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
    >
      {/* Background Atmosphere */}
      <Box
        position="absolute"
        inset={0}
        bg={`linear-gradient(90deg, ${game.away.color}44 0%, ${game.home.color}44 100%)`}
        opacity={0.3}
      />

      <Flex h="full" align="center" position="relative">
        {/* Overlapping Logos Area */}
        <Center position="absolute" left="50%" top="50%" transform="translate(-50%, -50%)" w="full" h="full">
          <Image
            src={game.away.logo}
            h="140%"
            opacity={0.15}
            position="absolute"
            left="15%"
            transform="rotate(-15deg)"
            filter="grayscale(1) brightness(2)"
          />
          <Image
            src={game.home.logo}
            h="140%"
            opacity={0.15}
            position="absolute"
            right="15%"
            transform="rotate(15deg)"
            filter="grayscale(1) brightness(2)"
          />
        </Center>

        <Grid templateColumns="1fr auto 1fr" w="full" px={10} zIndex={2}>
          <GridItem display="flex" alignItems="center" justifyContent="flex-end">
            <VStack align="end" spacing={0}>
              <Text textStyle="bannerHeadline" fontSize={squeezed ? "2xl" : "4xl"} letterSpacing="tighter">
                {game.away.shortName}
              </Text>
              <Text textStyle="kicker" color="whiteAlpha.400">TIGERS</Text>
            </VStack>
          </GridItem>

          <GridItem px={8}>
             <VStack spacing={-2}>
                <Text fontSize="6xl" fontWeight="900" color="brand.500" fontStyle="italic">
                   {game.away.score}
                </Text>
                <Box h="2px" w="40px" bg="whiteAlpha.300" transform="rotate(-45deg)" />
                <Text fontSize="6xl" fontWeight="900" color="white" fontStyle="italic">
                   {game.home.score}
                </Text>
             </VStack>
          </GridItem>

          <GridItem display="flex" alignItems="center" justifyContent="flex-start">
            <VStack align="start" spacing={0}>
              <Text textStyle="bannerHeadline" fontSize={squeezed ? "2xl" : "4xl"} letterSpacing="tighter">
                {game.home.shortName}
              </Text>
              <Text textStyle="kicker" color="brand.500">RATTLERS</Text>
            </VStack>
          </GridItem>
        </Grid>
      </Flex>
    </Box>
  );
};

/**
 * MAGIC 2: The Neon Monolith
 * High-contrast, glowing edges, architectural feel.
 */
export const GameRowNeonMonolith = ({ game = MOCK_GAME, squeezed = false }) => {
  return (
    <Box w="full" h="full" bg="#050505" borderRadius="md" p={1}>
      <Flex h="full" bg="#0D0D0D" border="1px solid #222" align="center" px={6} position="relative">
        <Box
          position="absolute"
          left={0}
          w="4px"
          h="60%"
          bg={game.away.color}
          boxShadow={`0 0 15px ${game.away.color}`}
        />

        <HStack spacing={8} flex={1}>
          <Text fontSize="8xl" fontWeight="black" color="whiteAlpha.100" userSelect="none" position="absolute" left="5%">
            {game.away.shortName[0]}
          </Text>
          <VStack align="start" spacing={0} zIndex={1}>
            <Text fontWeight="black" fontSize="xs" color="brand.500" letterSpacing="widest">VISITOR</Text>
            <Text fontSize="2xl" fontWeight="bold" color="white">{game.away.name}</Text>
          </VStack>
        </HStack>

        <Center flexShrink={0} bg="black" w="120px" h="70%" border="1px solid #333" borderRadius="sm" flexDirection="column">
          <Text textStyle="heroStat" fontSize="3xl" lineHeight="1">{game.away.score}-{game.home.score}</Text>
          <Text fontSize="10px" color="whiteAlpha.400" mt={1}>FINAL</Text>
        </Center>

        <HStack spacing={8} flex={1} justify="flex-end">
           <VStack align="end" spacing={0} zIndex={1}>
            <Text fontWeight="black" fontSize="xs" color="brand.500" letterSpacing="widest">HOME</Text>
            <Text fontSize="2xl" fontWeight="bold" color="white">{game.home.name}</Text>
          </VStack>
          <Text fontSize="8xl" fontWeight="black" color="whiteAlpha.100" userSelect="none" position="absolute" right="5%">
            {game.home.shortName[0]}
          </Text>
        </HStack>

        <Box
          position="absolute"
          right={0}
          w="4px"
          h="60%"
          bg={game.home.color}
          boxShadow={`0 0 15px ${game.home.color}`}
        />
      </Flex>
    </Box>
  );
};

/**
 * MAGIC 3: The Magazine Spread
 * 70s Editorial style, serif fonts, ghosted text.
 */
export const GameRowMagazineSpread = ({ game = MOCK_GAME, squeezed = false }) => {
  return (
    <Box
      w="full"
      h="full"
      bg="#1a1a1a"
      position="relative"
      overflow="hidden"
      borderBottom="8px solid"
      borderBottomColor="brand.500"
    >
      {/* Ghost Word - rule 2b */}
      <Text
        position="absolute"
        top="-10px"
        left="20px"
        fontSize="120px"
        fontWeight="black"
        color="whiteAlpha.05"
        lineHeight="1"
        letterSpacing="-0.05em"
      >
        GLORY
      </Text>

      <Flex h="full" px={12} align="center" justify="space-between">
        <VStack align="start" spacing={-2} zIndex={2}>
           <Text fontFamily="serif" fontSize="xs" fontStyle="italic" color="brand.400">The Battle of the South</Text>
           <Text fontSize="5xl" fontWeight="900" color="white" letterSpacing="tight">
              {game.away.shortName} <Box as="span" color="brand.500">×</Box> {game.home.shortName}
           </Text>
           <HStack spacing={4}>
              <Text textStyle="pill" bg="whiteAlpha.200" color="white">{game.game_name}</Text>
              <Text textStyle="kicker" color="text.muted">{game.date}</Text>
           </HStack>
        </VStack>

        <HStack spacing={0} zIndex={2}>
           <VStack bg="white" color="black" px={6} py={2} align="center" spacing={0}>
              <Text fontSize="xs" fontWeight="black">AWAY</Text>
              <Text fontSize="4xl" fontWeight="900">{game.away.score}</Text>
           </VStack>
           <VStack bg="brand.500" color="white" px={6} py={2} align="center" spacing={0}>
              <Text fontSize="xs" fontWeight="black">HOME</Text>
              <Text fontSize="4xl" fontWeight="900">{game.home.score}</Text>
           </VStack>
        </HStack>
      </Flex>
    </Box>
  );
};

/**
 * Lab Gallery Export
 */
export const WeekCentralMagicRowsGallery = () => {
  return (
    <VStack w="full" spacing={12} align="stretch" p={8} bg="bg.primary">
       <Box>
        <Text textStyle="panelLabel" mb={4} color="brand.500">Magic 1: The Cinematic Collision</Text>
        <Box h="180px">
          <GameRowCinematicCollision />
        </Box>
      </Box>

      <Box>
        <Text textStyle="panelLabel" mb={4} color="brand.500">Magic 2: The Neon Monolith</Text>
        <Box h="140px">
          <GameRowNeonMonolith />
        </Box>
      </Box>

      <Box>
        <Text textStyle="panelLabel" mb={4} color="brand.500">Magic 3: The Magazine Spread</Text>
        <Box h="160px">
          <GameRowMagazineSpread />
        </Box>
      </Box>

      <Box maxW="500px">
        <Text textStyle="panelLabel" mb={4} color="brand.500">Squeezed State: Collision</Text>
        <Box h="140px">
          <GameRowCinematicCollision squeezed />
        </Box>
      </Box>
    </VStack>
  );
};
