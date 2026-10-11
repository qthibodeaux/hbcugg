// GameCard2x1_SplitBanner.js
// Variant 1: Split Banner — Animated Team Clash
import { Box, Flex, Text, Image } from "@chakra-ui/react";
import { useState } from "react";

// Minimal mock data for demo
const MOCK = {
  home: { name: "Jackson State", abbr: "JSU", logo: "/assets/swacjsu.svg", color: "#002147", score: 24 },
  away: { name: "Alcorn", abbr: "ALC", logo: "/assets/swacalc.svg", color: "#5C068C", score: 17 },
  state: "FINAL",
};

export function GameCard2x1SplitBanner({ game = MOCK }) {
  // Animation state for demo
  const [show, setShow] = useState(true);
  return (
    <Box
      as="a"
      href="#"
      w="full"
      h="full"
      display="block"
      borderRadius="lg"
      overflow="hidden"
      bg="bg.card"
      boxShadow={show ? "0 0 0 2px #E53E3E33" : undefined}
      position="relative"
      transition="box-shadow 0.2s"
      _hover={{ boxShadow: "0 0 0 4px #E53E3E66", cursor: "pointer" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {/* Split background */}
      <Flex w="full" h="full" position="absolute" top={0} left={0} zIndex={0}>
        <Box flex={1} bg={`${game.home.color}33`} />
        <Box flex={1} bg={`${game.away.color}33`} />
      </Flex>
      {/* State badge */}
      <Box position="absolute" top={3} left={3} zIndex={2} px={3} py={1} bg="brand.500" color="white" fontWeight="bold" borderRadius="md" fontSize="sm" style={{ animation: show ? "badgePop 0.4s" : undefined }}>
        {game.state}
      </Box>
      {/* Main content */}
      <Flex w="full" h="full" align="center" justify="space-between" position="relative" zIndex={1} px={6}>
        {/* Home */}
        <Flex direction="column" align="center" flex={1} gap={2}>
          <Image src={game.home.logo} alt={game.home.abbr} boxSize="48px" borderRadius="full" style={{ animation: show ? "logoFade 0.6s" : undefined }} />
          <Text fontWeight="bold" fontSize="xl" color="text.primary" letterSpacing="0.05em" textTransform="uppercase">
            {game.home.abbr}
          </Text>
        </Flex>
        {/* Score or VS */}
        <Flex direction="column" align="center" flex={1}>
          <Text fontSize="4xl" fontWeight="black" color="text.primary" letterSpacing="0.08em">
            {game.state === "FINAL" ? `${game.home.score} - ${game.away.score}` : "— VS —"}
          </Text>
        </Flex>
        {/* Away */}
        <Flex direction="column" align="center" flex={1} gap={2}>
          <Image src={game.away.logo} alt={game.away.abbr} boxSize="48px" borderRadius="full" style={{ animation: show ? "logoFade 0.6s" : undefined }} />
          <Text fontWeight="bold" fontSize="xl" color="text.primary" letterSpacing="0.05em" textTransform="uppercase">
            {game.away.abbr}
          </Text>
        </Flex>
      </Flex>
      {/* Animations */}
      <style>{`
        @keyframes badgePop { 0% { transform: scale(0.7); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes logoFade { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: none; } }
      `}</style>
    </Box>
  );
}
