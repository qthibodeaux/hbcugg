// GameCard2x1_ScoreboardClassic.js
// Variant 4: Scoreboard Classic — Digital Board
import { Box, Flex, Text, Image } from "@chakra-ui/react";
import { useState } from "react";

const MOCK = {
  home: { name: "Jackson State", abbr: "JSU", logo: "/assets/swacjsu.svg" },
  away: { name: "Alcorn", abbr: "ALC", logo: "/assets/swacalc.svg" },
  state: "FINAL",
  score: "24 - 17",
};

export function GameCard2x1_ScoreboardClassic({ game = MOCK }) {
  const [press, setPress] = useState(false);
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
      boxShadow={press ? "0 0 0 4px #E53E3E99" : "0 0 0 2px #E53E3E33"}
      transition="box-shadow 0.15s, transform 0.1s"
      style={{ fontFamily: '"Share Tech Mono", monospace', transform: press ? "scale(0.97)" : undefined }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      onMouseLeave={() => setPress(false)}
    >
      {/* State badge as blinking dot */}
      <Flex align="center" position="absolute" top={3} left={3} zIndex={2} gap={2}>
        <Box w="10px" h="10px" borderRadius="full" bg="brand.500" style={{ animation: "blinkDot 1s infinite alternate" }} />
        <Text color="brand.500" fontWeight="bold" fontSize="sm">{game.state}</Text>
      </Flex>
      {/* Logos in corners */}
      <Image src={game.home.logo} alt={game.home.abbr} boxSize="36px" position="absolute" top={3} left={3} zIndex={1} opacity={0.7} />
      <Image src={game.away.logo} alt={game.away.abbr} boxSize="36px" position="absolute" top={3} right={3} zIndex={1} opacity={0.7} />
      {/* Team names */}
      <Flex w="full" h="full" align="center" justify="space-between" px={8}>
        <Text fontWeight="bold" fontSize="2xl" color="text.primary" letterSpacing="0.1em">
          {game.home.abbr}
        </Text>
        <Text fontWeight="bold" fontSize="2xl" color="text.primary" letterSpacing="0.1em">
          {game.away.abbr}
        </Text>
      </Flex>
      {/* Score */}
      <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" px={8} py={3} bg="bg.secondary" borderRadius="md" boxShadow="md" fontSize="4xl" fontWeight="bold" color="brand.500" letterSpacing="0.15em" style={{ animation: press ? "scoreFlicker 0.2s" : undefined }}>
        {game.state === "FINAL" ? game.score : "— VS —"}
      </Box>
      <style>{`
        @keyframes blinkDot { 0% { opacity: 0.3; } 100% { opacity: 1; } }
        @keyframes scoreFlicker { 0% { opacity: 0.5; } 100% { opacity: 1; } }
      `}</style>
      {/* Google Fonts for digital look (must be loaded in main app for full effect) */}
    </Box>
  );
}
