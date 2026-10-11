import { Box, Flex, Text, Image } from "@chakra-ui/react";

// Variant C: Minimalist Stat Row
const MOCK_ROWS = [
  {
    id: "alcaamu",
    away: { name: "Alcorn State", shortName: "ASU", logo: "/assets/swacalc.svg", color: "#5C068C" },
    home: { name: "Alabama A&M", shortName: "AAMU", logo: "/assets/swacaamu.svg", color: "#660000" },
    awayScore: 21,
    homeScore: 41,
    status: "Final",
    date: "Sep 6",
    day: "Sat",
    gameName: "Louis Crews Classic",
    venue: "Huntsville, AL",
    tag: "HBCU Non-conf",
    bothHBCU: true,
  },
  {
    id: "scsupvamu",
    away: { name: "South Carolina State", shortName: "SCSU", logo: "/assets/meacscsu.svg", color: "#900027" },
    home: { name: "Prairie View A&M", shortName: "PVAMU", logo: "/assets/swacpvamu.svg", color: "#4B0082" },
    awayScore: null,
    homeScore: null,
    status: "Preview",
    date: "Dec 13",
    day: "Sat",
    gameName: "Celebration Bowl",
    venue: "Mercedes-Benz Stadium",
    tag: "Bowl",
    bothHBCU: true,
  },
];

function getWinner(row) {
  if (row.awayScore == null || row.homeScore == null || row.awayScore === row.homeScore) return null;
  return row.awayScore > row.homeScore ? "away" : "home";
}

export const WeekCentralGameRowC = ({ row, squeezed = false }) => {
  const winner = getWinner(row);
  return (
    <Flex
      align="center"
      gap={squeezed ? 1 : 3}
      px={squeezed ? 1 : 3}
      py={squeezed ? 1 : 2}
      bg="bg.card"
      borderRadius="md"
      border="1px solid"
      borderColor="whiteAlpha.100"
      minH={squeezed ? "44px" : "56px"}
      w="full"
      fontFamily="heading"
      fontWeight="bold"
      fontSize={squeezed ? "xs" : "md"}
      letterSpacing="0.02em"
      overflow="hidden"
    >
      {/* Away */}
      <Flex align="center" gap={1} minW={0}>
        <Logo team={row.away} size={squeezed ? "22px" : "28px"} />
        <Text
          color={winner === "away" && row.status === "Final" ? "text.primary" : "text.muted"}
          fontWeight={winner === "away" && row.status === "Final" ? "extrabold" : "bold"}
          lineClamp={1}
          maxW={squeezed ? "32px" : "60px"}
        >
          {row.away.shortName}
        </Text>
      </Flex>
      {/* Score */}
      <Flex align="center" minW={squeezed ? "32px" : "44px"} justify="center">
        <Text
          color={winner ? "text.primary" : "text.secondary"}
          fontSize={squeezed ? "sm" : "xl"}
          fontWeight="extrabold"
          lineHeight="1"
          w="full"
          textAlign="center"
        >
          {row.awayScore != null && row.homeScore != null ? `${row.awayScore}–${row.homeScore}` : "–"}
        </Text>
      </Flex>
      {/* Home */}
      <Flex align="center" gap={1} minW={0}>
        <Text
          color={winner === "home" && row.status === "Final" ? "text.primary" : "text.muted"}
          fontWeight={winner === "home" && row.status === "Final" ? "extrabold" : "bold"}
          lineClamp={1}
          maxW={squeezed ? "32px" : "60px"}
        >
          {row.home.shortName}
        </Text>
        <Logo team={row.home} size={squeezed ? "22px" : "28px"} />
      </Flex>
      {/* W/L Indicator */}
      <Box minW={squeezed ? "24px" : "36px"} textAlign="right">
        {row.status === "Final" && (
          <Text color="brand.400" fontSize={squeezed ? "8px" : "xs"}>
            {winner ? (winner === "away" ? "W" : "L") : ""}
          </Text>
        )}
      </Box>
    </Flex>
  );
};

function Logo({ team, size }) {
  return team.logo ? (
    <Image src={team.logo} alt={team.shortName} w={size} h={size} objectFit="contain" borderRadius="full" bg="whiteAlpha.100" />
  ) : (
    <Flex w={size} h={size} align="center" justify="center" borderRadius="full" bg="whiteAlpha.100">
      <Text fontSize="8px" color="text.muted" fontWeight="black">
        {team.shortName.slice(0, 3)}
      </Text>
    </Flex>
  );
}

// Demo export for Component Lab
export const WeekCentralGameRowC__Lab = () => (
  <Box w="100%" maxW="500px" mx="auto" py={6}>
    <Text color="brand.400" fontWeight="extrabold" fontSize="md" mb={2}>
      Minimalist Stat Row — Responsive
    </Text>
    <Box mb={4}>
      <Text color="text.secondary" fontSize="sm" mb={1}>Desktop</Text>
      {MOCK_ROWS.map((row) => (
        <WeekCentralGameRowC key={row.id} row={row} />
      ))}
    </Box>
    <Box>
      <Text color="text.secondary" fontSize="sm" mb={1}>Squeezed</Text>
      {MOCK_ROWS.map((row) => (
        <WeekCentralGameRowC key={row.id + "-sq"} row={row} squeezed />
      ))}
    </Box>
  </Box>
);
