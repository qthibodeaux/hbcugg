// GameCard2x1_DynamicBanner.js
// Variant 5: Dynamic Banner — Animated Team Flags
import { Box, Flex, Text, Image } from "@chakra-ui/react";
import { useState } from "react";

const MOCK = {
  home: { name: "Jackson State", abbr: "JSU", logo: "/assets/swacjsu.svg", color: "#002147" },
  away: { name: "Alcorn", abbr: "ALC", logo: "/assets/swacalc.svg", color: "#5C068C" },
  state: "FINAL",
  score: "24 - 17",
};

export function GameCard2x1_DynamicBanner({ game = MOCK }) {
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
      bg="bg.card"
      position="relative"
      boxShadow={hover ? "0 0 0 4px #E53E3E66" : "0 0 0 2px #E53E3E33"}
      transition="box-shadow 0.2s, transform 0.2s"
      style={{ animation: hover ? "bannerBounce 0.3s" : undefined }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Waving flag background */}
      <Box position="absolute" inset={0} zIndex={0} bg={game.home.color + '33'}>
        <Box w="full" h="full" style={{ animation: "flagWave 2s infinite linear alternate" }} bgGradient={`linear(to-r, ${game.home.color}33 0%, ${game.away.color}33 100%)`} />
      </Box>
      {/* State badge as flag */}
      <Box position="absolute" top={3} left={3} zIndex={2} px={4} py={1} bg="brand.500" color="white" fontWeight="bold" borderRadius="sm" fontSize="sm" style={{ transform: "skew(-10deg)" }}>
        {game.state}
      </Box>
      {/* Logos fly in */}
      <Flex w="full" h="full" align="center" justify="space-between" position="relative" zIndex={1} px={8}>
        <Image src={game.home.logo} alt={game.home.abbr} boxSize="48px" borderRadius="full" style={{ animation: hover ? "logoFlyInL 0.5s" : undefined }} />
        <Text fontWeight="black" fontSize="3xl" color="text.primary" letterSpacing="0.1em" textTransform="uppercase" style={{ animation: hover ? "waveText 0.7s" : undefined }}>
          {game.home.abbr} <span style={{ color: '#E53E3E' }}>VS</span> {game.away.abbr}
        </Text>
        <Image src={game.away.logo} alt={game.away.abbr} boxSize="48px" borderRadius="full" style={{ animation: hover ? "logoFlyInR 0.5s" : undefined }} />
      </Flex>
      {/* Score badge */}
      <Box position="absolute" bottom={4} left="50%" transform="translateX(-50%)" px={6} py={2} bg="bg.secondary" borderRadius="full" boxShadow="md" fontSize="2xl" fontWeight="bold" color="text.primary" style={{ animation: hover ? "scoreBounce 0.4s" : undefined }}>
        {game.state === "FINAL" ? game.score : "— VS —"}
      </Box>
      <style>{`
        @keyframes flagWave { 0% { background-position: 0 0; } 100% { background-position: 40px 0; } }
        @keyframes logoFlyInL { 0% { opacity: 0; transform: translateX(-40px); } 100% { opacity: 1; transform: none; } }
        @keyframes logoFlyInR { 0% { opacity: 0; transform: translateX(40px); } 100% { opacity: 1; transform: none; } }
        @keyframes waveText { 0% { letter-spacing: 0.2em; opacity: 0.5; } 100% { letter-spacing: 0.1em; opacity: 1; } }
        @keyframes scoreBounce { 0% { transform: translateX(-50%) scale(0.7); opacity: 0; } 100% { transform: translateX(-50%) scale(1); opacity: 1; } }
        @keyframes bannerBounce { 0% { transform: scale(1.02); } 100% { transform: scale(1); } }
      `}</style>
    </Box>
  );
}
