import { Box, Grid, Text, Flex } from "@chakra-ui/react";

/**
 * StatsStrip - Horizontal statistics display strip with key metrics
 * @param {Object} props
 * @param {Array} props.topPlayers - Top players for glory ratings
 * @param {Object} props.transferAnalytics - Transfer analytics data
 * @param {Array} props.rosterPlayers - All roster players
 * @param {boolean} props.isLoading - Loading state
 */
const StatsStrip = ({ topPlayers, transferAnalytics, rosterPlayers, isLoading }) => {
  if (isLoading) return null;

  const top3 = topPlayers.slice(0, 3);
  const transferRate = transferAnalytics
    ? `${((transferAnalytics.transfer_count / transferAnalytics.total_players) * 100).toFixed(0)}%`
    : "—";
  const srGrCount = rosterPlayers.filter(
    (p) => p.class_year === "Sr." || p.class_year === "Gr.",
  ).length;
  const expPct = rosterPlayers.length
    ? Math.round((srGrCount / rosterPlayers.length) * 100)
    : 0;

  return (
    <Grid
      templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }}
      gap={2}
      mb={8}
      borderRadius="xl"
      overflow="hidden"
      border="1px solid"
      borderColor="whiteAlpha.100"
    >
      {/* Top Glory Ratings */}
      <Box
        bg="bg.secondary"
        p={4}
        borderRight="1px solid"
        borderColor="whiteAlpha.100"
      >
        <Text fontSize="9px" color="text.muted" textTransform="uppercase" letterSpacing="0.14em" mb={3}>
          Top Glory Ratings
        </Text>
        <Flex direction="column" gap={2}>
          {top3.map((p, i) => (
            <Flex key={p.player_key} align="center" gap={2}>
              <Text
                fontSize="xs"
                fontWeight="black"
                color={i === 0 ? "yellow.400" : i === 1 ? "gray.300" : "orange.400"}
                w={4}
                textAlign="right"
              >
                {i + 1}
              </Text>
              <Text fontSize="xs" color="text.primary" lineClamp={1} flex={1}>
                {p.name_display}
              </Text>
              <Text fontSize="xs" color="brand.400" fontWeight="bold">
                {Math.round(50 + (p.par ?? 0) * 0.8)}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Box>

      {/* Transfer Rate */}
      <Box bg="bg.secondary" p={4} borderRight="1px solid" borderColor="whiteAlpha.100">
        <Text fontSize="9px" color="text.muted" textTransform="uppercase" letterSpacing="0.14em" mb={3}>
          Transfer Activity
        </Text>
        <Text fontSize="2xl" fontWeight="black" color="brand.400" lineHeight={1}>
          {transferRate}
        </Text>
        <Text fontSize="xs" color="text.muted">of roster</Text>
      </Box>

      {/* Experience */}
      <Box bg="bg.secondary" p={4} borderRight="1px solid" borderColor="whiteAlpha.100">
        <Text fontSize="9px" color="text.muted" textTransform="uppercase" letterSpacing="0.14em" mb={3}>
          Experience Level
        </Text>
        <Text fontSize="2xl" fontWeight="black" color="text.primary" lineHeight={1}>
          {expPct}%
        </Text>
        <Text fontSize="xs" color="text.muted">Sr/Gr players</Text>
      </Box>

      {/* Total Players */}
      <Box bg="bg.secondary" p={4}>
        <Text fontSize="9px" color="text.muted" textTransform="uppercase" letterSpacing="0.14em" mb={3}>
          Total Tracked
        </Text>
        <Text fontSize="2xl" fontWeight="black" color="white" lineHeight={1}>
          {rosterPlayers.length}
        </Text>
        <Text fontSize="xs" color="text.muted">active players</Text>
      </Box>
    </Grid>
  );
};

export default StatsStrip;
