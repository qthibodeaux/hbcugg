import { Box, Flex, Text, Spinner, Grid } from "@chakra-ui/react";
import { ArrowRightLeft, TrendingUp } from "lucide-react";

/**
 * TransfersView - Transfer analytics view with tier breakdowns
 * @param {Object} props
 * @param {Object} props.transferAnalytics - Transfer analytics data
 * @param {boolean} props.isLoading - Loading state
 * @param {Function} props.navigate - Navigation function
 */
const TransfersView = ({ transferAnalytics, isLoading, navigate }) => {
  if (isLoading)
    return (
      <Flex justify="center" py={16}>
        <Spinner color="brand.500" size="lg" />
      </Flex>
    );

  const {
    total_players,
    transfer_count,
    by_tier,
    avg_par_transfers,
    avg_par_non_transfers,
  } = transferAnalytics;
  const transferRate = ((transfer_count / total_players) * 100).toFixed(0);
  const maxAvgPar = Math.max(
    ...Object.values(by_tier).map((t) => t.avg_par ?? 0),
  );

  const TIER_COLORS = {
    FBS: "blue.400",
    FCS: "purple.400",
    JUCO: "orange.400",
    HS: "green.400",
    "D2/D3/NAIA": "orange",
  };
  const TIER_ORDER = ["FBS", "FCS", "JUCO", "D2/D3/NAIA", "HS"];

  return (
    <Box>
      {/* Overview cards */}
      <Grid
        templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
        gap={4}
        mb={8}
      >
        <Box
          bg="bg.secondary"
          border="1px solid"
          borderColor="whiteAlpha.100"
          borderRadius="xl"
          p={5}
        >
          <Flex align="center" gap={2} mb={3}>
            <ArrowRightLeft size={16} color="var(--chakra-colors-brand-400)" />
            <Text fontSize="sm" fontWeight="bold" color="text.primary">
              Transfer Activity
            </Text>
          </Flex>
          <Text
            fontSize="3xl"
            fontWeight="black"
            color="brand.400"
            lineHeight={1}
          >
            {transferRate}%
          </Text>
          <Text fontSize="xs" color="text.muted">
            {transfer_count} of {total_players} players
          </Text>
        </Box>

        <Box
          bg="bg.secondary"
          border="1px solid"
          borderColor="whiteAlpha.100"
          borderRadius="xl"
          p={5}
        >
          <Text fontSize="sm" fontWeight="bold" color="text.primary" mb={3}>
            Transfer PAR
          </Text>
          <Text
            fontSize="3xl"
            fontWeight="black"
            color="text.primary"
            lineHeight={1}
          >
            {avg_par_transfers?.toFixed(1)}
          </Text>
          <Text fontSize="xs" color="text.muted">
            Average
          </Text>
        </Box>

        <Box
          bg="bg.secondary"
          border="1px solid"
          borderColor="whiteAlpha.100"
          borderRadius="xl"
          p={5}
        >
          <Text fontSize="sm" fontWeight="bold" color="text.primary" mb={3}>
            Non-Transfer PAR
          </Text>
          <Text
            fontSize="3xl"
            fontWeight="black"
            color="text.primary"
            lineHeight={1}
          >
            {avg_par_non_transfers?.toFixed(1)}
          </Text>
          <Text fontSize="xs" color="text.muted">
            Average
          </Text>
        </Box>
      </Grid>

      {/* Tier breakdown */}
      <Box
        bg="bg.secondary"
        border="1px solid"
        borderColor="whiteAlpha.100"
        borderRadius="xl"
        p={5}
      >
        <Flex align="center" gap={2} mb={4}>
          <TrendingUp size={16} color="var(--chakra-colors-brand-400)" />
          <Text fontSize="sm" fontWeight="bold" color="text.primary">
            Transfer Tier Breakdown
          </Text>
        </Flex>

        <Flex direction="column" gap={3}>
          {TIER_ORDER.filter((t) => by_tier[t]?.count > 0).map((tier) => {
            const d = by_tier[tier];
            const width = `${Math.min(100, ((d.avg_par ?? 0) / (maxAvgPar || 1)) * 100)}%`;
            const color = TIER_COLORS[tier] ?? "gray";
            return (
              <Box key={tier}>
                <Flex justify="space-between" mb={1}>
                  <Flex align="center" gap={2}>
                    <Box w="10px" h="10px" bg={color} borderRadius="full" />
                    <Text
                      fontSize="xs"
                      fontWeight="bold"
                      color={color}
                      textTransform="uppercase"
                      w={10}
                    >
                      {tier}
                    </Text>
                    <Text fontSize="xs" color="text.muted">
                      {d.count} players
                    </Text>
                  </Flex>
                  <Text fontSize="xs" color="text.muted">
                    avg {d.avg_par?.toFixed(1)} PAR
                  </Text>
                </Flex>
                <Box
                  bg="whiteAlpha.100"
                  borderRadius="full"
                  h={2}
                  overflow="hidden"
                >
                  <Box
                    bg={color}
                    h="100%"
                    w={width}
                    borderRadius="full"
                    transition="width 0.3s"
                  />
                </Box>
              </Box>
            );
          })}
        </Flex>
      </Box>
    </Box>
  );
};

export default TransfersView;
