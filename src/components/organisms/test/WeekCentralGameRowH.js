import { Box, Flex, Text, Image } from "@chakra-ui/react";

// Variant H: Schoolbanner Watermark — oversized ghost logo, headline, team gradient
const MOCK_ROWS = [
  {
    id: "alcjsu",
    away: { name: "Alcorn State", shortName: "ASU", logo: "/assets/swacalc.svg", color: "#5C068C" },
    home: { name: "Jackson State", shortName: "JSU", logo: "/assets/swacjsu.svg", color: "#002147" },
    awayScore: 28,
    homeScore: 35,
    status: "Final",
  },
];

function getWinner(row) {
  if (row.awayScore == null || row.homeScore == null || row.awayScore === row.homeScore) return null;
  return row.awayScore > row.homeScore ? "away" : "home";
}

export const WeekCentralGameRowH = ({ row }) => {
  const winner = getWinner(row);
  return (
    <Box w="full" h="120px" position="relative" borderRadius="2xl" overflow="hidden" bg="bg.primary" mb={6}>
      {/* Watermark ghost logo */}
      <Image
        src={row.home.logo}
        alt={row.home.shortName}
        position="absolute"
        top="-16px"
        right="-16px"
        w="180px"
        h="180px"
        opacity={0.08}
        zIndex={1}
        pointerEvents="none"
        style={{ filter: "blur(1px)" }}
      />
      {/* Team gradient bar */}
      <Box
        position="absolute"
        left={0}
        bottom={0}
        w="full"
        h="48px"
        zIndex={2}
        bg={`linear-gradient(90deg, ${row.away.color}cc 0%, ${row.home.color}cc 100%)`}
        opacity={0.85}
      />
      <Flex
        position="relative"
        zIndex={3}
        w="full"
        h="full"
        direction="column"
        align="flex-start"
        justify="center"
        px={8}
        py={4}
      >
        <Text fontSize="xs" color="brand.400" fontWeight="extrabold" letterSpacing="0.18em" mb={1} textTransform="uppercase">
          Final Score
        </Text>
        <Text fontSize="3xl" fontWeight="extrabold" color="white" mb={1} style={{ textShadow: "0 2px 12px #000b" }}>
          {row.away.name} {row.awayScore} — {row.homeScore} {row.home.name}
        </Text>
        <Text fontSize="md" color="whiteAlpha.700" fontWeight="bold" letterSpacing="0.08em">
          {winner === "home" ? `${row.home.name} wins at home` : `${row.away.name} upsets on the road`}
        </Text>
      </Flex>
    </Box>
  );
};

export const WeekCentralGameRowH__Lab = () => (
  <Box w="100%" maxW="900px" mx="auto" py={6}>
    <Text color="brand.400" fontWeight="extrabold" fontSize="xl" mb={2}>
      Schoolbanner Watermark — Editorial
    </Text>
    {MOCK_ROWS.map((row) => (
      <WeekCentralGameRowH key={row.id} row={row} />
    ))}
  </Box>
);
