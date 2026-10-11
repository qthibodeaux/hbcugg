import { Box, Flex, Text, Image } from "@chakra-ui/react";

// Variant F: Neon Glitch Banner - animated, playful, retro
const MOCK_ROWS = [
  {
    id: "gsupvamu",
    away: { name: "Grambling State", shortName: "GSU", logo: "/assets/swacgsu.svg", color: "#000000" },
    home: { name: "Prairie View A&M", shortName: "PVAMU", logo: "/assets/swacpvamu.svg", color: "#4B0082" },
    awayScore: 42,
    homeScore: 38,
    status: "Final",
  },
  {
    id: "asujsu",
    away: { name: "Alabama State", shortName: "ASU", logo: "/assets/swacasu.svg", color: "#000000" },
    home: { name: "Jackson State", shortName: "JSU", logo: "/assets/swacjsu.svg", color: "#002147" },
    awayScore: 20,
    homeScore: 27,
    status: "Final",
  },
];

const FLICKER_ANIMATION = "week-central-row-f-neon-flicker";

function getWinner(row) {
  if (row.awayScore == null || row.homeScore == null || row.awayScore === row.homeScore) return null;
  return row.awayScore > row.homeScore ? "away" : "home";
}

function Logo({ team, size }) {
  return team.logo ? (
    <Image src={team.logo} alt={team.shortName} w={size} h={size} objectFit="contain" borderRadius="full" bg="#222" />
  ) : (
    <Flex w={size} h={size} align="center" justify="center" borderRadius="full" bg="#222">
      <Text fontSize="lg" color="#39ff14" fontWeight="black">
        {team.shortName.slice(0, 3)}
      </Text>
    </Flex>
  );
}

export const WeekCentralGameRowF = ({ row }) => {
  const winner = getWinner(row);

  return (
    <>
      <style>{`
        @keyframes ${FLICKER_ANIMATION} {
          0%, 100% { opacity: 1; filter: blur(0px); }
          10% { opacity: 0.8; filter: blur(1px); }
          20% { opacity: 1; filter: blur(0px); }
          30% { opacity: 0.7; filter: blur(2px); }
          40% { opacity: 1; filter: blur(0px); }
          50% { opacity: 0.9; filter: blur(1px); }
          60% { opacity: 1; filter: blur(0px); }
          70% { opacity: 0.8; filter: blur(2px); }
          80% { opacity: 1; filter: blur(0px); }
          90% { opacity: 0.7; filter: blur(1px); }
        }
      `}</style>
      <Box
        w="full"
        h="84px"
        borderRadius="xl"
        overflow="hidden"
        bgGradient="linear(to-r, #0f0c29 0%, #302b63 50%, #24243e 100%)"
        boxShadow="0 2px 24px #000a"
        position="relative"
        mb={4}
        border="2px solid #39ff14"
      >
        <Flex w="full" h="full" align="center" justify="space-between" px={6} position="relative" zIndex={2}>
          <Flex align="center" gap={3} minW={0}>
            <Logo team={row.away} size="44px" />
            <Text
              color={winner === "away" ? "#39ff14" : "#fff"}
              fontWeight={winner === "away" ? "extrabold" : "bold"}
              fontSize="2xl"
              textShadow="0 0 8px #39ff14, 0 2px 8px #000b"
              lineClamp={1}
              maxW="120px"
              style={{ animation: `${FLICKER_ANIMATION} 2.5s infinite alternate` }}
            >
              {row.away.name}
            </Text>
          </Flex>

          <Flex direction="column" align="center" justify="center" minW="80px">
            <Text
              color="#39ff14"
              fontWeight="extrabold"
              fontSize="4xl"
              lineHeight="1"
              textShadow="0 0 16px #39ff14, 0 2px 12px #000b"
              style={{ animation: `${FLICKER_ANIMATION} 1.2s infinite alternate` }}
            >
              {row.awayScore} - {row.homeScore}
            </Text>
            <Text color="#fff" fontSize="xs" mt={1}>
              {row.status}
            </Text>
          </Flex>

          <Flex align="center" gap={3} minW={0}>
            <Text
              color={winner === "home" ? "#39ff14" : "#fff"}
              fontWeight={winner === "home" ? "extrabold" : "bold"}
              fontSize="2xl"
              textShadow="0 0 8px #39ff14, 0 2px 8px #000b"
              lineClamp={1}
              maxW="120px"
              textAlign="right"
              style={{ animation: `${FLICKER_ANIMATION} 2.5s infinite alternate-reverse` }}
            >
              {row.home.name}
            </Text>
            <Logo team={row.home} size="44px" />
          </Flex>
        </Flex>
        <Box position="absolute" inset={0} pointerEvents="none" borderRadius="xl" boxShadow="0 0 32px 8px #39ff14, 0 0 0 4px #39ff1420" />
      </Box>
    </>
  );
};

export const WeekCentralGameRowF__Lab = () => (
  <Box w="100%" maxW="900px" mx="auto" py={6}>
    <Text color="#39ff14" fontWeight="extrabold" fontSize="xl" mb={2}>
      Neon Glitch Banner - Creative
    </Text>
    {MOCK_ROWS.map((row) => (
      <WeekCentralGameRowF key={row.id} row={row} />
    ))}
  </Box>
);
