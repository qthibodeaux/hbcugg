import React from "react";
import { Box, Flex, Text, Badge } from "@chakra-ui/react";

/**
 * TeamRosterHeroCard — 2x1 Slot
 * High-level roster composition summary for Team Detail Hub
 */
export const TeamRosterHeroCard = ({ analytics, onClick }) => {
  if (!analytics) return null;

  const teamInfo = analytics.team_info ?? {};
  const rosterAnalytics = analytics.roster_analytics ?? {};
  const expProfile = rosterAnalytics.experience_profile ?? {};
  const transferMarket = rosterAnalytics.transfer_market ?? {};
  const compInsights = analytics.competitive_insights ?? {};
  const compIdentity = compInsights.competitive_identity ?? {};

  const totalPlayers = teamInfo.total_players ?? 0;
  const upperclassPct = expProfile.upperclassmen_pct ?? 0;
  const totalTransfers = transferMarket.total_transfers ?? 0;
  const expScore = expProfile.experience_score ?? 0;
  const traits = compIdentity.traits ?? [];

  const experienceLabel = (score) => {
    if (score >= 3.5) return "Senior-Led";
    if (score >= 3.0) return "Veteran";
    if (score >= 2.5) return "Balanced";
    if (score >= 2.0) return "Young";
    return "Freshman-Heavy";
  };

  return (
    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      p={5}
      h="full"
      cursor="pointer"
      transition="all 0.2s"
      _hover={{ borderColor: "whiteAlpha.300", bg: "whiteAlpha.50" }}
      onClick={onClick}
    >
      <Flex direction="column" h="full" justify="space-between">
        <Box>
          <Text fontSize="9px" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="widest" mb={4}>
            Roster Intelligence Summary
          </Text>
          
          <Flex gap={10} mb={6}>
            <Box>
              <Text fontSize="2xl" fontWeight="black" color="text.primary">{totalPlayers}</Text>
              <Text fontSize="9px" color="text.muted" textTransform="uppercase" letterSpacing="wider">Active Players</Text>
            </Box>
            <Box>
              <Text fontSize="2xl" fontWeight="black" color="brand.400">{(upperclassPct * 100).toFixed(0)}%</Text>
              <Text fontSize="9px" color="text.muted" textTransform="uppercase" letterSpacing="wider">Upperclassmen</Text>
            </Box>
            <Box>
              <Text fontSize="2xl" fontWeight="black" color="text.primary">{totalTransfers}</Text>
              <Text fontSize="9px" color="text.muted" textTransform="uppercase" letterSpacing="wider">Transfers Pool</Text>
            </Box>
          </Flex>
          
          <Box mb={2}>
            <Text fontSize="xs" color="text.secondary" fontWeight="semibold">
              <Text as="span" color="brand.400">{experienceLabel(expScore)}</Text> — {compIdentity.style ?? "Standard Identity"}
            </Text>
          </Box>
        </Box>

        <Flex gap={2} flexWrap="wrap">
          {traits.slice(0, 3).map((trait) => (
            <Badge key={trait} variant="subtle" bg="whiteAlpha.100" color="whiteAlpha.700" px={3} py={0.5} borderRadius="sm" fontSize="9px">
              {trait}
            </Badge>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
};

/**
 * PositionDepthCard — 1x1 Slot
 * Visual bar chart of position group health
 */
export const PositionDepthCard = ({ depthScores, onClick }) => {
  const DEPTH_POSITIONS = ["QB", "RB", "WR", "OL", "DL", "LB", "DB"];
  const COLORS = {
    "Deep": "#68D391",
    "Balanced": "#4FD1C5",
    "Adequate": "#63B3ED",
    "Thin": "#F6AD55",
    "Very Thin": "#FC8181"
  };

  return (
    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      p={4}
      h="full"
      cursor="pointer"
      transition="all 0.2s"
      _hover={{ borderColor: "whiteAlpha.300" }}
      onClick={onClick}
    >
      <Text fontSize="9px" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="widest" mb={3}>
        Position Depth Health
      </Text>

      <Flex direction="column" gap={2}>
        {DEPTH_POSITIONS.map(pos => {
          const score = depthScores?.[pos] || "Adequate";
          const color = COLORS[score] || "whiteAlpha.400";
          return (
            <Flex key={pos} align="center" gap={3}>
              <Text fontSize="xs" fontWeight="bold" w="20px" color="text.secondary">{pos}</Text>
              <Box flex="1" h="4px" bg="whiteAlpha.100" borderRadius="full">
                <Box h="full" bg={color} borderRadius="full" style={{ width: score === "Deep" ? '100%' : score === "Thin" ? '40%' : '70%' }} />
              </Box>
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
};
