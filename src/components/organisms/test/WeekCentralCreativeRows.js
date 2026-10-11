import React from "react";
import { Box, Flex, Text, Image, Badge, VStack, HStack, Center } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MOCK_GAME = {
  id: "jsu-famu-2025",
  date: "NOV 29",
  game_name: "ORANGE BLOSSOM CLASSIC",
  status: "final",
  away: { shortName: "JSU", name: "Jackson State", logo: "/assets/swacjsu.svg", color: "#002147", score: 31 },
  home: { shortName: "FAMU", name: "Florida A&M", logo: "/assets/swacfamu.svg", color: "#006747", score: 28 },
};

/**
 * CONCEPT 4: The Glory Ghost
 * Atmospheric, typography-heavy, massive background scores.
 */
export const GameRowGloryGhost = ({ game = MOCK_GAME, squeezed = false }) => {
  const isFinal = game.status === "final";
  const awayWin = isFinal && game.away.score > game.home.score;

  return (
    <Box
      w="full"
      h="full"
      bg="bg.secondary"
      position="relative"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      _hover={{ borderColor: "brand.500" }}
      transition="all 0.3s"
    >
      {/* Background Ghost Score */}
      {isFinal && (
        <Flex
          position="absolute"
          inset={0}
          justify="center"
          align="center"
          pointerEvents="none"
          userSelect="none"
        >
          <Text
            fontSize={squeezed ? "120px" : "180px"}
            fontWeight="900"
            color="whiteAlpha.05"
            letterSpacing="-0.05em"
          >
            {game.away.score}-{game.home.score}
          </Text>
        </Flex>
      )}

      <Flex h="100%" align="center" px={squeezed ? 4 : 10} position="relative" zIndex={1}>
        {/* Away Team */}
        <HStack flex={1} justify="flex-end" spacing={4}>
          <VStack align="end" spacing={0}>
            <Text textStyle="bannerHeadline" fontSize={squeezed ? "xl" : "3xl"} color={awayWin ? "white" : "text.muted"}>
              {squeezed ? game.away.shortName : game.away.name.toUpperCase()}
            </Text>
            {!squeezed && <Text textStyle="kicker" color="brand.500">VISITOR</Text>}
          </VStack>
          <Image src={game.away.logo} w={squeezed ? "32px" : "48px"} filter={awayWin ? "none" : "grayscale(1)"} />
        </HStack>

        {/* Center Divider / VS */}
        <Center px={squeezed ? 4 : 8} flexDirection="column">
          <Box w="1px" h="40px" bg="whiteAlpha.200" mb={2} />
          <Text fontWeight="black" color="text.muted" fontSize="xs">VS</Text>
          <Box w="1px" h="40px" bg="whiteAlpha.200" mt={2} />
        </Center>

        {/* Home Team */}
        <HStack flex={1} justify="flex-start" spacing={4}>
          <Image src={game.home.logo} w={squeezed ? "32px" : "48px"} filter={!awayWin ? "none" : "grayscale(1)"} />
          <VStack align="start" spacing={0}>
            <Text textStyle="bannerHeadline" fontSize={squeezed ? "xl" : "3xl"} color={!awayWin ? "white" : "text.muted"}>
              {squeezed ? game.home.shortName : game.home.name.toUpperCase()}
            </Text>
            {!squeezed && <Text textStyle="kicker" color="brand.500">HOME</Text>}
          </VStack>
        </HStack>
      </Flex>
    </Box>
  );
};

/**
 * CONCEPT 5: The Cyber Pulse
 * Digital, glowing, segmented display aesthetic.
 */
export const GameRowCyberPulse = ({ game = MOCK_GAME, squeezed = false }) => {
  return (
    <Box
      w="full"
      h="full"
      bg="black"
      borderRadius="md"
      border="1px solid"
      borderColor="brand.900"
      position="relative"
      p={1}
    >
      {/* Scanning Line Animation */}
      <Box
        as={motion.div}
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        position="absolute"
        left={0}
        right={0}
        h="1px"
        bg="brand.500"
        opacity={0.3}
        zIndex={2}
      />

      <Flex h="full" bg="#0a0a0a" align="center" px={6} gap={6}>
        <VStack align="start" spacing={0} minW="80px" display={squeezed ? "none" : "flex"}>
          <Text fontSize="10px" color="brand.500" fontWeight="black" letterSpacing="2px">STATUS</Text>
          <Text color="white" fontWeight="bold">{game.status.toUpperCase()}</Text>
        </VStack>

        <Flex flex={1} justify="center" align="center" gap={squeezed ? 4 : 12}>
          <Text fontSize={squeezed ? "2xl" : "4xl"} fontWeight="black" color="white" fontStyle="italic">
            {game.away.shortName}
          </Text>
          
          <Box bg="whiteAlpha.100" px={6} py={2} borderRadius="sm" border="1px solid" borderColor="whiteAlpha.200">
            <Text fontSize={squeezed ? "2xl" : "5xl"} fontWeight="900" color="brand.500" style={{ fontVariantNumeric: "tabular-nums" }}>
              {game.away.score || "00"} : {game.home.score || "00"}
            </Text>
          </Box>

          <Text fontSize={squeezed ? "2xl" : "4xl"} fontWeight="black" color="white" fontStyle="italic">
            {game.home.shortName}
          </Text>
        </Flex>

        {!squeezed && (
          <Box textAlign="right">
            <Text fontSize="10px" color="whiteAlpha.400" fontWeight="bold">{game.game_name}</Text>
            <Text fontSize="10px" color="brand.500" fontWeight="black">{game.date}</Text>
          </Box>
        )}
      </Flex>
    </Box>
  );
};

/**
 * CONCEPT 6: The Heritage Ledger
 * Newspaper meets dark mode. Serif accents and historical feel.
 */
export const GameRowHeritageLedger = ({ game = MOCK_GAME, squeezed = false }) => {
  return (
    <Box
      w="full"
      h="full"
      bg="#111"
      borderBottom="4px solid"
      borderBottomColor="brand.500"
      position="relative"
      p={6}
    >
      <Flex h="full" align="center" justify="space-between">
        <VStack align="start" spacing={-1} flex={1}>
          <Text fontSize="10px" color="brand.500" fontWeight="black" letterSpacing="3px">THE DISPATCH</Text>
          <Text
            fontFamily="serif"
            fontSize={squeezed ? "2xl" : "4xl"}
            color="white"
            fontStyle="italic"
          >
            {game.away.name} <Text as="span" color="text.muted" fontSize="xl">vs</Text> {game.home.name}
          </Text>
        </VStack>

        <HStack spacing={8}>
          <VStack spacing={0} align="center" borderLeft="1px solid" borderColor="whiteAlpha.200" pl={8}>
             <Text fontSize="8px" color="text.muted" fontWeight="black">RESULT</Text>
             <Text fontSize="5xl" fontWeight="black" color="white" lineHeight="1">
               {game.away.score}—{game.home.score}
             </Text>
          </VStack>
          
          {!squeezed && (
            <VStack align="end" spacing={0}>
              <Badge variant="outline" colorPalette="gray" mb={2}>WK 12</Badge>
              <Text fontSize="xs" color="text.muted" fontWeight="bold">{game.date}</Text>
            </VStack>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

/**
 * Lab Gallery Export
 */
export const WeekCentralCreativeRowsGallery = () => {
  return (
    <VStack w="full" spacing={10} align="stretch" p={8} bg="bg.primary">
       <Box>
        <Text textStyle="panelLabel" mb={4} color="brand.500">Variant 4: The Glory Ghost (Cinematic)</Text>
        <Box h="120px">
          <GameRowGloryGhost />
        </Box>
      </Box>

      <Box>
        <Text textStyle="panelLabel" mb={4} color="brand.500">Variant 5: The Cyber Pulse (Digital Ticker)</Text>
        <Box h="100px">
          <GameRowCyberPulse />
        </Box>
      </Box>

      <Box>
        <Text textStyle="panelLabel" mb={4} color="brand.500">Variant 6: The Heritage Ledger (Editorial)</Text>
        <Box h="110px">
          <GameRowHeritageLedger />
        </Box>
      </Box>

      <Flex gap={4}>
        <Box flex={1}>
          <Text textStyle="panelLabel" mb={2}>Ghost (Squeezed)</Text>
          <Box h="80px">
            <GameRowGloryGhost squeezed />
          </Box>
        </Box>
        <Box flex={1}>
          <Text textStyle="panelLabel" mb={2}>Cyber (Squeezed)</Text>
          <Box h="80px">
            <GameRowCyberPulse squeezed />
          </Box>
        </Box>
      </Flex>
    </VStack>
  );
};
