import { Box, Flex, Text, Image } from "@chakra-ui/react";

// Variant G: Magazine Cover Banner — editorial, vertical, with hero image
const MOCK_ROWS = [
  {
    id: "jsufamu",
    away: { name: "Jackson State", shortName: "JSU", logo: "/assets/swacjsu.svg", color: "#002147" },
    home: { name: "Florida A&M", shortName: "FAMU", logo: "/assets/swacfamu.svg", color: "#006747" },
    awayScore: 31,
    homeScore: 28,
    status: "Final",
    hero: "/pics/jsu-vs-famu-hero.jpg",
  },
  {
    id: "asujsu",
    away: { name: "Alabama State", shortName: "ASU", logo: "/assets/swacasu.svg", color: "#000000" },
    home: { name: "Jackson State", shortName: "JSU", logo: "/assets/swacjsu.svg", color: "#002147" },
    awayScore: 17,
    homeScore: 24,
    status: "Final",
    hero: "/pics/asu-vs-jsu-hero.jpg",
  },
];

function getWinner(row) {
  if (row.awayScore == null || row.homeScore == null || row.awayScore === row.homeScore) return null;
  return row.awayScore > row.homeScore ? "away" : "home";
}

export const WeekCentralGameRowG = ({ row }) => {
  const winner = getWinner(row);
  return (
    <Box
      w="full"
      h="180px"
      borderRadius="2xl"
      overflow="hidden"
      boxShadow="0 4px 32px #000a"
      position="relative"
      mb={6}
      bg="bg.primary"
    >
      {row.hero && (
        <Image
          src={row.hero}
          alt="Game Hero"
          position="absolute"
          top={0}
          left={0}
          w="full"
          h="full"
          objectFit="cover"
          opacity={0.32}
          zIndex={1}
        />
      )}
      <Box
        position="absolute"
        top={0}
        left={0}
        w="full"
        h="full"
        zIndex={2}
        bgGradient="linear(to-b, #000c 0%, #0000 60%, #000c 100%)"
      />
      <Flex
        position="relative"
        zIndex={3}
        w="full"
        h="full"
        direction="column"
        align="center"
        justify="center"
        px={6}
      >
        <Text color="brand.400" fontWeight="extrabold" fontSize="md" letterSpacing="0.12em" mb={2} textTransform="uppercase">
          Game of the Week
        </Text>
        <Flex align="center" gap={4} mb={2}>
          <Logo team={row.away} size="56px" />
          <Text
            color={winner === "away" ? "white" : "whiteAlpha.700"}
            fontWeight={winner === "away" ? "extrabold" : "bold"}
            fontSize="3xl"
            textShadow="0 2px 8px #000b"
            lineClamp={1}
            maxW="160px"
          >
            {row.away.name}
          </Text>
          <Text color="white" fontWeight="extrabold" fontSize="4xl" mx={2} textShadow="0 2px 12px #000b">
            {row.awayScore} – {row.homeScore}
          </Text>
          <Text
            color={winner === "home" ? "white" : "whiteAlpha.700"}
            fontWeight={winner === "home" ? "extrabold" : "bold"}
            fontSize="3xl"
            textShadow="0 2px 8px #000b"
            lineClamp={1}
            maxW="160px"
            textAlign="right"
          >
            {row.home.name}
          </Text>
          <Logo team={row.home} size="56px" />
        </Flex>
        <Text color="whiteAlpha.800" fontSize="md" fontWeight="bold" letterSpacing="0.08em">
          {row.status}
        </Text>
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

export const WeekCentralGameRowG__Lab = () => (
  <Box w="100%" maxW="900px" mx="auto" py={6}>
    <Text color="brand.400" fontWeight="extrabold" fontSize="xl" mb={2}>
      Magazine Cover Banner — Creative
    </Text>
    {MOCK_ROWS.map((row) => (
      <WeekCentralGameRowG key={row.id} row={row} />
    ))}
  </Box>
);
