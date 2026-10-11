import { Box, Flex, Text, Image, Stack } from "@chakra-ui/react";

// Variant D: Context-Heavy Row
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

export const WeekCentralGameRowD = ({ row, squeezed = false }) => {
  const winner = getWinner(row);
  return (
    <Box
      bg="bg.card"
      borderRadius="md"
      border="1px solid"
      borderColor="whiteAlpha.100"
      minH={squeezed ? "64px" : "92px"}
      w="full"
      px={squeezed ? 2 : 4}
      py={squeezed ? 2 : 3}
      fontFamily="heading"
      fontWeight="bold"
      fontSize={squeezed ? "sm" : "lg"}
      letterSpacing="0.02em"
      overflow="hidden"
    >
      <Flex align="center" gap={squeezed ? 2 : 4}>
        {/* Left: Date, Time, Stadium */}
        <Box minW={squeezed ? "44px" : "80px"} textAlign="left">
          <Text color="text.secondary" fontSize={squeezed ? "xs" : "sm"} lineHeight="1.1">
            {row.day} {row.date}
          </Text>
          {!squeezed && (
            <Text color="text.muted" fontSize="xs" lineClamp={1}>
              {row.venue}
            </Text>
          )}
        </Box>
        {/* Center: Away — Score — Home */}
        <Flex flex={1} align="center" justify="center" gap={squeezed ? 2 : 4} minW={0}>
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
        {/* Right: Status & Tag */}
        <Box minW={squeezed ? "44px" : "80px"} textAlign="right">
          <Text color={row.status === "Final" ? "brand.400" : "text.secondary"} fontSize={squeezed ? "xs" : "sm"}>
            {row.status}
          </Text>
          {row.tag && !squeezed && (
            <Text color="brand.400" fontSize="xs" lineClamp={1}>
              {row.tag}
            </Text>
          )}
        </Box>
      </Flex>
      {/* Below: game_name, conf/bowl, HBCU-vs-outside */}
      {!squeezed && (
        <Stack direction="row" spacing={4} mt={2} align="center">
          {row.gameName && (
            <Text color="brand.400" fontSize="xs" fontWeight="extrabold" textTransform="uppercase">
              {row.gameName}
            </Text>
          )}
          {row.bothHBCU ? (
            <Text color="text.secondary" fontSize="xs">HBCU vs HBCU</Text>
          ) : (
            <Text color="text.secondary" fontSize="xs">HBCU vs Outside</Text>
          )}
        </Stack>
      )}
    </Box>
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
export const WeekCentralGameRowD__Lab = () => (
  <Box w="100%" maxW="700px" mx="auto" py={6}>
    <Text color="brand.400" fontWeight="extrabold" fontSize="lg" mb={2}>
      Context-Heavy Row — Responsive
    </Text>
    <Box mb={4}>
      <Text color="text.secondary" fontSize="sm" mb={1}>Desktop</Text>
      {MOCK_ROWS.map((row) => (
        <WeekCentralGameRowD key={row.id} row={row} />
      ))}
    </Box>
    <Box>
      <Text color="text.secondary" fontSize="sm" mb={1}>Squeezed</Text>
      {MOCK_ROWS.map((row) => (
        <WeekCentralGameRowD key={row.id + "-sq"} row={row} squeezed />
      ))}
    </Box>
  </Box>
);
