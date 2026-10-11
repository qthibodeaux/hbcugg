// GameCard2x1_HeroStrip.js
// Variant 3: Hero Strip — Animated Nameplate
import { Box, Flex, Text, Image } from "@chakra-ui/react";
import { useState } from "react";

const MOCK = {
  home: { name: "Jackson State", abbr: "JSU", logo: "/assets/swacjsu.svg", color: "#002147" },
  away: { name: "Alcorn", abbr: "ALC", logo: "/assets/swacalc.svg", color: "#5C068C" },
  state: "FINAL",
  score: "24 - 17",
};

export function GameCard2x1HeroStrip({ game = MOCK }) {
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
      bg={`linear-gradient(90deg, ${game.home.color}33 0%, ${game.away.color}33 100%)`}
      position="relative"
      boxShadow={hover ? "0 0 0 4px #E53E3E66" : "0 0 0 2px #E53E3E33"}
      transition="box-shadow 0.2s"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* State ribbon */}
      <Box position="absolute" left={0} top={0} bottom={0} w="32px" bg="brand.500" color="white" display="flex" alignItems="center" justifyContent="center" fontWeight="bold" fontSize="sm" borderTopLeftRadius="lg" borderBottomLeftRadius="lg" style={{ writingMode: "vertical-rl", textOrientation: "mixed", animation: hover ? "ribbonIn 0.4s" : undefined }}>
        {game.state}
      </Box>
      {/* Nameplate */}
      <Flex w="full" h="full" align="center" justify="center" position="relative" zIndex={1}>
        <Flex align="center" bg="bg.secondary" borderRadius="full" px={8} py={3} boxShadow="md" style={{ animation: hover ? "nameplateSlide 0.5s" : undefined }}>
          <Image src={game.home.logo} alt={game.home.abbr} boxSize="40px" borderRadius="full" mr={4} />
          <Text fontWeight="black" fontSize="2xl" color="text.primary" letterSpacing="0.08em" textTransform="uppercase">
            {game.home.abbr}
          </Text>
          <Text fontWeight="black" fontSize="2xl" color="brand.500" mx={4}>
            VS
          </Text>
          <Text fontWeight="black" fontSize="2xl" color="text.primary" letterSpacing="0.08em" textTransform="uppercase">
            {game.away.abbr}
          </Text>
          <Image src={game.away.logo} alt={game.away.abbr} boxSize="40px" borderRadius="full" ml={4} />
        </Flex>
      </Flex>
      {/* Score */}
      <Box position="absolute" bottom={4} left="50%" transform="translateX(-50%)" px={6} py={2} bg="bg.card" borderRadius="full" boxShadow="md" fontSize="2xl" fontWeight="bold" color="text.primary" style={{ animation: hover ? "scorePop 0.4s" : undefined }}>
        {game.state === "FINAL" ? game.score : "— VS —"}
      </Box>
      <style>{`
        @keyframes ribbonIn { 0% { transform: translateX(-32px); opacity: 0; } 100% { transform: none; opacity: 1; } }
        @keyframes nameplateSlide { 0% { opacity: 0; transform: translateY(-20px); } 100% { opacity: 1; transform: none; } }
        @keyframes scorePop { 0% { transform: scale(0.7); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
    </Box>
  );
}
