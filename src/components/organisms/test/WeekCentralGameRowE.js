import { Box, Flex, Text, Image } from "@chakra-ui/react";

// Variant E: Diagonal Split Banner — creative, bold, color-driven
const MOCK_ROWS = [
  {
    id: "alcjsu",
    away: { name: "Alcorn State", shortName: "ASU", logo: "/assets/swacalc.svg", color: "#5C068C" },
    home: { name: "Jackson State", shortName: "JSU", logo: "/assets/swacjsu.svg", color: "#002147" },
    awayScore: 28,
    homeScore: 35,
    status: "Final",
  },
  {
    id: "pvamufamu",
    away: { name: "Prairie View A&M", shortName: "PVAMU", logo: "/assets/swacpvamu.svg", color: "#4B0082" },
    home: { name: "Florida A&M", shortName: "FAMU", logo: "/assets/swacfamu.svg", color: "#006747" },
    awayScore: 17,
    homeScore: 24,
    status: "Final",
  },
];

function getWinner(row) {
  if (row.awayScore == null || row.homeScore == null || row.awayScore === row.homeScore) return null;
  return row.awayScore > row.homeScore ? "away" : "home";
}

export const WeekCentralGameRowE = ({ row }) => {
  const winner = getWinner(row);
  return (
    <Box
      w="full"
      h="88px"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="0 2px 16px #0008"
      position="relative"
      mb={4}
    >
      <Flex w="full" h="full" position="absolute" top={0} left={0} zIndex={1}>
        <Box flex={1} bg={row.away.color + "e6"} />
        <Box flex={1} bg={row.home.color + "e6"} />
      </Flex>
      <Box
        position="absolute"
        top={0}
        left={0}
        w="full"
        h="full"
        zIndex={2}
        style={{
          background: "linear-gradient(135deg, rgba(0,0,0,0.7) 60%, transparent 100%)",
        }}
      />
      <Flex
        position="relative"
        zIndex={3}
        w="full"
        h="full"
        align="center"
        justify="space-between"
        px={6}
      >
        {/* Away */}
        <Flex align="center" gap={3} minW={0}>
          <Logo team={row.away} size="48px" />
          <Text
            color={winner === "away" ? "white" : "whiteAlpha.700"}
            fontWeight={winner === "away" ? "extrabold" : "bold"}
            fontSize="2xl"
            textShadow="0 2px 8px #000b"
            lineClamp={1}
            maxW="120px"
          >
            {row.away.name}
          </Text>
        </Flex>
        {/* Score */}
        <Flex direction="column" align="center" justify="center" minW="80px">
          <Text
            color="white"
            fontWeight="extrabold"
            fontSize="4xl"
            lineHeight="1"
            textShadow="0 2px 12px #000b"
          >
            {row.awayScore} – {row.homeScore}
          </Text>
          <Text color="whiteAlpha.700" fontSize="xs" mt={1}>
            {row.status}
          </Text>
        </Flex>
        {/* Home */}
        <Flex align="center" gap={3} minW={0}>
          <Text
            color={winner === "home" ? "white" : "whiteAlpha.700"}
            fontWeight={winner === "home" ? "extrabold" : "bold"}
            fontSize="2xl"
            textShadow="0 2px 8px #000b"
            lineClamp={1}
            maxW="120px"
            textAlign="right"
          >
            {row.home.name}
          </Text>
          <Logo team={row.home} size="48px" />
        </Flex>
      </Flex>
    </Box>
  );
};

function Logo({ team, size }) {
  return team.logo ? (
    <Image src={team.logo} alt={team.shortName} w={size} h={size} objectFit="contain" borderRadius="full" bg="whiteAlpha.200" />
  ) : (
    <Flex w={size} h={size} align="center" justify="center" borderRadius="full" bg="whiteAlpha.200">
      <Text fontSize="lg" color="whiteAlpha.700" fontWeight="black">
        {team.shortName.slice(0, 3)}
      </Text>
    </Flex>
  );
}

export const WeekCentralGameRowE__Lab = () => (
  <Box w="100%" maxW="900px" mx="auto" py={6}>
    <Text color="brand.400" fontWeight="extrabold" fontSize="xl" mb={2}>
      Diagonal Split Banner — Creative
    </Text>
    {MOCK_ROWS.map((row) => (
      <WeekCentralGameRowE key={row.id} row={row} />
    ))}
  </Box>
);
