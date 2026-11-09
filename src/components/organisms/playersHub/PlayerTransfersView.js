import { Flex, Spinner, Box, Text, Grid, Badge } from "@chakra-ui/react";
import { TIER_ORDER, TIER_COLORS, TIER_LABELS } from "../../../utils/playersHubPresentation";
import { LeaderboardRow } from "./PlayerLeaderboardRow";

// Existing player-hub presentation, extracted without changing behavior.

export const TransfersView = ({ transferAnalytics, isLoading, navigate }) => {
  if (isLoading)
    return (
      <Flex justify="center" py={16}>
        <Spinner color="brand.500" size="lg" />
      </Flex>
    );
  if (!transferAnalytics) return null;

  const {
    by_tier,
    top_10_transfers_by_par,
    transfer_count,
    total_players,
    avg_par_transfers,
    avg_par_non_transfers,
  } = transferAnalytics;
  const transferRate = ((transfer_count / total_players) * 100).toFixed(0);
  const maxAvgPar = Math.max(
    ...Object.values(by_tier).map((t) => t.avg_par ?? 0),
  );

  return (
    <Box>
      <Box
        mb={6}
        p={4}
        borderRadius="xl"
        border="1px solid"
        borderColor="whiteAlpha.100"
        bg="linear-gradient(135deg, rgba(66,153,225,0.08) 0%, transparent 60%)"
      >
        <Text
          fontSize="xs"
          color="text.muted"
          textTransform="uppercase"
          letterSpacing="0.14em"
          mb={1}
        >
          2025 Season
        </Text>
        <Text
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight="black"
          color="white"
          textTransform="uppercase"
          lineHeight={1}
        >
          Transfer Analytics
        </Text>
        <Text mt={2} fontSize="sm" color="text.muted">
          Movement intel for the 2025 HBCU class — tier breakdown, PAR impact,
          and top performers.
        </Text>
      </Box>
      <Grid
        templateColumns={{ base: "repeat(2,1fr)", md: "repeat(4,1fr)" }}
        gap={3}
        mb={6}
      >
        {[
          {
            label: "Transfer Rate",
            value: `${transferRate}%`,
            sub: `${transfer_count} of ${total_players} players`,
            color: "brand.400",
          },
          {
            label: "Avg PAR (Transfers)",
            value: avg_par_transfers.toFixed(1),
            sub: `vs ${avg_par_non_transfers.toFixed(1)} non-transfer`,
            color: "green.400",
          },
          {
            label: "Top Tier (PAR)",
            value: "FCS",
            sub: `${by_tier.FCS?.avg_par?.toFixed(1)} avg PAR`,
            color: "yellow.400",
          },
          {
            label: "HS Recruits",
            value: by_tier.HS?.count ?? 0,
            sub: `${by_tier.HS?.avg_par?.toFixed(1)} avg PAR`,
            color: "purple.400",
          },
        ].map(({ label, value, sub, color }) => (
          <Box
            key={label}
            bg="blackAlpha.300"
            border="1px solid"
            borderColor="whiteAlpha.100"
            borderRadius="lg"
            p={3}
          >
            <Text
              fontSize="xs"
              color="text.muted"
              textTransform="uppercase"
              letterSpacing="0.08em"
            >
              {label}
            </Text>
            <Text fontSize="2xl" fontWeight="black" color={color}>
              {value}
            </Text>
            <Text fontSize="9px" color="text.muted" mt={1}>
              {sub}
            </Text>
          </Box>
        ))}
      </Grid>
      <Box
        mb={6}
        bg="blackAlpha.300"
        border="1px solid"
        borderColor="whiteAlpha.100"
        borderRadius="xl"
        p={4}
      >
        <Text
          fontSize="sm"
          fontWeight="bold"
          color="white"
          mb={4}
          textTransform="uppercase"
          letterSpacing="0.05em"
        >
          Performance by Origin
        </Text>
        <Flex direction="column" gap={3}>
          {TIER_ORDER.filter((t) => by_tier[t]?.count > 0).map((tier) => {
            const d = by_tier[tier];
            const width = `${Math.min(100, ((d.avg_par ?? 0) / (maxAvgPar || 1)) * 100)}%`;
            const color = TIER_COLORS[tier] ?? "gray";
            return (
              <Box key={tier}>
                <Flex justify="space-between" mb={1}>
                  <Flex align="center" gap={2}>
                    <Badge colorScheme={color} variant="subtle" fontSize="9px">
                      {tier}
                    </Badge>
                    <Text fontSize="xs" color="text.muted">
                      {TIER_LABELS[tier]}
                    </Text>
                    <Text fontSize="xs" color="text.muted">
                      · {d.count} players
                    </Text>
                  </Flex>
                  <Text fontSize="sm" fontWeight="bold" color="white">
                    {d.avg_par?.toFixed(1) ?? "—"} PAR
                  </Text>
                </Flex>
                <Box
                  h="6px"
                  borderRadius="full"
                  bg="whiteAlpha.100"
                  overflow="hidden"
                >
                  <Box
                    h="100%"
                    w={width}
                    bg={`var(--chakra-colors-${color}-400)`}
                    transition="width 0.4s ease"
                  />
                </Box>
              </Box>
            );
          })}
        </Flex>
      </Box>
      <Box>
        <Flex align="center" gap={3} mb={4}>
          <Box w="4px" h="24px" bg="brand.500" borderRadius="full" />
          <Text
            fontSize="lg"
            fontWeight="bold"
            color="white"
            textTransform="uppercase"
          >
            Top Transfers — 2025
          </Text>
        </Flex>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
          {top_10_transfers_by_par.map((player, idx) => (
            <LeaderboardRow
              key={player.player_key ?? idx}
              player={player}
              rank={idx + 1}
              navigate={navigate}
            />
          ))}
        </Grid>
      </Box>
    </Box>
  );
};
