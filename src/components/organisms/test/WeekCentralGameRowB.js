import { Box, Flex, Text, Image, Badge } from "@chakra-ui/react";

// Variant B: Classic Card Row
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

export const WeekCentralGameRowB = ({ row, squeezed = false }) => {
  const winner = getWinner(row);
  return (
    <Flex
      align="center"
      gap={squeezed ? 2 : 4}
      px={squeezed ? 2 : 4}
      py={squeezed ? 2 : 3}
      bg="bg.card"
      borderRadius="md"
      border="1px solid"
      borderColor="whiteAlpha.100"
      minH={squeezed ? "54px" : "72px"}
      w="full"
      fontFamily="heading"
      fontWeight="bold"
      fontSize={squeezed ? "sm" : "lg"}
      letterSpacing="0.02em"
      overflow="hidden"
    >
      {/* Left: Special Game Badge or Icon */}
      <Box minW={squeezed ? "44px" : "80px"} textAlign="left" pr={2}>
        {row.gameName && (
          squeezed ? (
            <Badge colorScheme="red" fontSize="8px" px={2} py={0.5} borderRadius="sm">
              {row.gameName.split(" ")[0]}
            </Badge>
          ) : (
            <Badge colorScheme="red" fontSize="10px" px={3} py={1} borderRadius="md" fontWeight="extrabold">
              {row.gameName}
            </Badge>
          )
        )}
      </Box>
      {/* Center: Away — Score — Home */}
      <Flex flex={1} align="center" justify="center" gap={squeezed ? 2 : 4} minW={0}>
        {/* Away */}
        <Flex align="center" gap={1} minW={0}>
          <Logo team={row.away} size={squeezed ? "28px" : "36px"} />
          <Text
            color={winner === "away" && row.status === "Final" ? "text.primary" : "text.muted"}
            fontWeight={winner === "away" && row.status === "Final" ? "extrabold" : "bold"}
            lineClamp={1}
            maxW={squeezed ? "60px" : "120px"}
            fontSize={squeezed ? "sm" : "md"}
          >
            {squeezed ? row.away.shortName : row.away.name}
          </Text>
        </Flex>
        {/* Score */}
        <Flex align="center" minW={squeezed ? "44px" : "64px"} justify="center">
          <Text
            color={winner ? "text.primary" : "text.secondary"}
            fontSize={squeezed ? "md" : "2xl"}
            fontWeight="extrabold"
            lineHeight="1"
            w="full"
            textAlign="center"
          >
            {row.awayScore != null && row.homeScore != null ? `${row.awayScore} – ${row.homeScore}` : "–"}
          </Text>
        </Flex>
        {/* Home */}
        <Flex align="center" gap={1} minW={0}>
          <Text
            color={winner === "home" && row.status === "Final" ? "text.primary" : "text.muted"}
            fontWeight={winner === "home" && row.status === "Final" ? "extrabold" : "bold"}
            lineClamp={1}
            maxW={squeezed ? "60px" : "120px"}
            fontSize={squeezed ? "sm" : "md"}
          >
            {squeezed ? row.home.shortName : row.home.name}
          </Text>
          <Logo team={row.home} size={squeezed ? "28px" : "36px"} />
        </Flex>
      </Flex>
      {/* Right: Stadium, Date, Tag */}
      <Box minW={squeezed ? "44px" : "120px"} textAlign="right">
        {!squeezed && (
          <Text color="text.secondary" fontSize="xs" lineClamp={1}>
            {row.venue}
          </Text>
        )}
        <Text color="brand.400" fontSize={squeezed ? "xs" : "sm"}>
          {row.date}
        </Text>
        {row.tag && !squeezed && (
          <Badge colorScheme="gray" fontSize="8px" ml={1}>
            {row.tag}
          </Badge>
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
export const WeekCentralGameRowB__Lab = () => (
  <Box w="100%" maxW="700px" mx="auto" py={6}>
    <Text color="brand.400" fontWeight="extrabold" fontSize="lg" mb={2}>
      Classic Card Row — Responsive
    </Text>
    <Box mb={4}>
      <Text color="text.secondary" fontSize="sm" mb={1}>Desktop</Text>
      {MOCK_ROWS.map((row) => (
        <WeekCentralGameRowB key={row.id} row={row} />
      ))}
    </Box>
    <Box>
      <Text color="text.secondary" fontSize="sm" mb={1}>Squeezed</Text>
      {MOCK_ROWS.map((row) => (
        <WeekCentralGameRowB key={row.id + "-sq"} row={row} squeezed />
      ))}
    </Box>
  </Box>
);
