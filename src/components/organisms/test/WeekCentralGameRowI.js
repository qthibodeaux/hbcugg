import { Box, Flex, Text, Image } from "@chakra-ui/react";

// Variant I: Player Avy Hero — vertical, player portrait, team overlay, hero stat
const MOCK_ROWS = [
  {
    id: "jsufamu",
    away: { name: "Jackson State", shortName: "JSU", logo: "/assets/swacjsu.svg", color: "#002147" },
    home: { name: "Florida A&M", shortName: "FAMU", logo: "/assets/swacfamu.svg", color: "#006747" },
    awayScore: 31,
    homeScore: 28,
    status: "Final",
    hero: "/pics/jsu-player-hero.jpg",
    heroName: "Shedeur Sanders",
    heroRole: "QB, JSU",
  },
];

function getWinner(row) {
  if (row.awayScore == null || row.homeScore == null || row.awayScore === row.homeScore) return null;
  return row.awayScore > row.homeScore ? "away" : "home";
}

export const WeekCentralGameRowI = ({ row }) => {
  // eslint-disable-next-line no-unused-vars
  const winner = getWinner(row);
  return (
    <Box w="full" h="180px" borderRadius="2xl" overflow="hidden" position="relative" bg="bg.primary" mb={6}>
      {/* Player portrait hero */}
      {row.hero && (
        <Image
          src={row.hero}
          alt={row.heroName}
          position="absolute"
          top={0}
          left={0}
          w="full"
          h="full"
          objectFit="cover"
          opacity={0.38}
          zIndex={1}
          style={{ objectPosition: "center 20%" }}
        />
      )}
      <Box position="absolute" top={0} left={0} w="full" h="full" zIndex={2} bgGradient="linear(to-b, #000c 0%, #0000 60%, #000c 100%)" />
      <Flex position="relative" zIndex={3} w="full" h="full" direction="column" align="center" justify="center" px={6}>
        <Text color="brand.400" fontWeight="extrabold" fontSize="md" letterSpacing="0.12em" mb={1} textTransform="uppercase">
          Player of the Game
        </Text>
        <Text color="white" fontWeight="extrabold" fontSize="2xl" mb={1}>
          {row.heroName} <Text as="span" color="brand.400" fontSize="md" ml={2}>{row.heroRole}</Text>
        </Text>
        <Text color="whiteAlpha.800" fontSize="lg" fontWeight="bold" letterSpacing="0.08em" mb={2}>
          {row.away.name} {row.awayScore} — {row.homeScore} {row.home.name}
        </Text>
        <Flex align="center" gap={4}>
          <Logo team={row.away} size="44px" />
          <Logo team={row.home} size="44px" />
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

export const WeekCentralGameRowI__Lab = () => (
  <Box w="100%" maxW="900px" mx="auto" py={6}>
    <Text color="brand.400" fontWeight="extrabold" fontSize="xl" mb={2}>
      Player Avy Hero — Editorial
    </Text>
    {MOCK_ROWS.map((row) => (
      <WeekCentralGameRowI key={row.id} row={row} />
    ))}
  </Box>
);
