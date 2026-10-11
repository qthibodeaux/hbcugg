// GameCard2x1_StackedOverlay.js
// Variant 2: Stacked Overlay — Floating Info Layers
import { Box, Flex, Text, Image } from "@chakra-ui/react";
import { useState } from "react";

const MOCK = {
  home: { name: "Jackson State", abbr: "JSU", logo: "/assets/swacjsu.svg" },
  away: { name: "Alcorn", abbr: "ALC", logo: "/assets/swacalc.svg" },
  state: "FINAL",
  score: "24 - 17",
  excitement: 9.8,
};

export function GameCard2x1StackedOverlay({ game = MOCK }) {
  const [hover, setHover] = useState(false);
  return (
    <Box
      as="a"
      href="#"
      w="full"
      h="full"
      display="block"
      borderRadius="lg"
      overflow="hidden"
      bg="rgba(20,20,22,0.85)"
      position="relative"
      boxShadow={hover ? "0 0 0 4px #E53E3E66" : "0 0 0 2px #E53E3E33"}
      transition="box-shadow 0.2s"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Glassy overlay */}
      <Box position="absolute" inset={0} bg="whiteAlpha.100" style={{ backdropFilter: "blur(6px)" }} zIndex={0} />
      {/* State badge */}
      <Box position="absolute" top={3} right={3} zIndex={2} px={3} py={1} bg="brand.500" color="white" fontWeight="bold" borderRadius="md" fontSize="sm" style={{ animation: hover ? "badgePop 0.4s" : undefined }}>
        {game.state}
      </Box>
      {/* Logos */}
      <Flex w="full" h="full" align="center" justify="center" position="relative" zIndex={1} gap={8}>
        <Image src={game.home.logo} alt={game.home.abbr} boxSize="56px" borderRadius="full" boxShadow="0 0 0 4px #00214755" style={{ animation: hover ? "logoGlow 0.6s" : undefined }} />
        <Image src={game.away.logo} alt={game.away.abbr} boxSize="56px" borderRadius="full" boxShadow="0 0 0 4px #5C068C55" style={{ animation: hover ? "logoGlow 0.6s" : undefined }} />
      </Flex>
      {/* Team names */}
      <Flex direction="column" align="center" position="absolute" top={6} left={0} w="full" zIndex={2}>
        <Text fontWeight="black" fontSize="lg" color="text.primary" letterSpacing="0.08em" textTransform="uppercase">
          {game.home.abbr}
        </Text>
        <Text fontWeight="black" fontSize="lg" color="text.primary" letterSpacing="0.08em" textTransform="uppercase">
          {game.away.abbr}
        </Text>
      </Flex>
      {/* Score pill */}
      <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" px={6} py={2} bg="bg.secondary" borderRadius="full" boxShadow="md" fontSize="2xl" fontWeight="bold" color="text.primary" style={{ animation: hover ? "pillFloat 0.5s" : undefined }}>
        {game.state === "FINAL" ? game.score : "— VS —"}
      </Box>
      {/* Excitement bar */}
      {game.excitement && (
        <Box position="absolute" bottom={3} left="50%" transform="translateX(-50%)" w="60%" h="8px" bg="whiteAlpha.200" borderRadius="full" overflow="hidden">
          <Box w={`${Math.min(game.excitement * 10, 100)}%`} h="full" bg="brand.500" style={{ animation: hover ? "barGrow 0.5s" : undefined }} />
        </Box>
      )}
      <style>{`
        @keyframes badgePop { 0% { transform: scale(0.7); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes logoGlow { 0% { box-shadow: 0 0 0 0 #E53E3E00; } 100% { box-shadow: 0 0 0 8px #E53E3E33; } }
        @keyframes pillFloat { 0% { opacity: 0; transform: translate(-50%, -40%); } 100% { opacity: 1; transform: translate(-50%, -50%); } }
        @keyframes barGrow { 0% { width: 0; } 100% { width: 100%; } }
      `}</style>
    </Box>
  );
}
