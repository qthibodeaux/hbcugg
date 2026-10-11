import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";

/**
 * RosterIdentityMatrixCard
 * 
 * PHILOSOPHY:
 *   Purpose: Define the program's DNA through qualitative traits and strategic assessment.
 *   Grid slot: 2x1
 * 
 * CONTENT TIERS:
 *   Essential: Identity Style (Headline), Core Traits (Badge Row)
 *   Standard: Experience Score, Depth Strength, Senior Leadership KPIs
 * 
 * DATA CONTRACT (analytics.roster_analytics):
 *   - competitive_insights.competitive_identity.style: string
 *   - competitive_insights.competitive_identity.traits: string[]
 *   - experience_profile.experience_score: number
 */
export const RosterIdentityMatrixCard = ({ analytics }) => {
  if (!analytics) return null;

  const compIdentity = analytics.competitive_insights?.competitive_identity ?? {};
  const traits = compIdentity.traits ?? [];

  return (
    <Box
      bg="bg.secondary"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      p={5}
      h="full"
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        left: 0,
        top: "20px",
        bottom: "20px",
        width: "3px",
        bg: "brand.500",
        borderRadius: "0 2px 2px 0",
      }}
    >
      <Text fontSize="xs" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="widest" mb={4} pl={2}>
        Program DNA & Identity
      </Text>

      <Flex direction="column" justify="center" h="calc(100% - 40px)">
        <Text fontSize="2xl" fontWeight="black" color="text.primary" mb={3} textTransform="uppercase" lineHeight="1.1">
          {compIdentity.style ?? "Standard Identity"}
        </Text>
        
        <Flex gap={2} flexWrap="wrap">
          {traits.map((trait) => (
            <Box
              key={trait}
              bg="whiteAlpha.100"
              borderRadius="sm"
              px={2}
              py={1}
              fontSize="10px"
              fontWeight="bold"
              color="brand.400"
              textTransform="uppercase"
              border="1px solid"
              borderColor="whiteAlpha.200"
            >
              {trait}
            </Box>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
};

/**
 * PositionPhysicsCard
 * 
 * PHILOSOPHY:
 *   Purpose: Evaluate the physical "frame" of a position group relative to league standards.
 *   Grid slot: 1x1
 * 
 * CONTENT TIERS:
 *   Essential: Position Label, Avg Weight, Avg Height
 *   Standard: Physical Advantage Checkmark (if applicable)
 */
export const PositionPhysicsCard = ({ label, physics, depth, depthColor }) => {
  if (!physics) return null;

  const inchesToFtIn = (inches) => {
    if (!inches || inches <= 0) return "—";
    return `${Math.floor(inches / 12)}'${inches % 12}"`;
  };

  return (
    <Box
      bg="bg.secondary"
      borderRadius="xl"
      p={4}
      h="full"
      borderLeft="4px solid"
      border="1px solid"
      borderColor={depthColor || "whiteAlpha.200"}
    >
      <Flex justify="space-between" align="baseline" mb={3}>
        <Text fontSize="sm" fontWeight="black" color="text.primary">{label}</Text>
        <Text fontSize="10px" color={depthColor} fontWeight="bold" textTransform="uppercase">
          {depth || "—"}
        </Text>
      </Flex>

      <Flex direction="column" gap={1}>
        <Box>
          <Text fontSize="9px" color="text.muted" textTransform="uppercase">Average Mass</Text>
          <Text fontSize="md" fontWeight="black" color="text.primary">
            {physics.avg_weight ? `${Math.round(physics.avg_weight)} lbs` : "—"}
          </Text>
        </Box>
        <Box>
          <Text fontSize="9px" color="text.muted" textTransform="uppercase">Average Height</Text>
          <Text fontSize="sm" fontWeight="bold" color="text.secondary">
            {inchesToFtIn(physics.avg_height)}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

/**
 * GeographicPulseCard
 * 
 * PHILOSOPHY:
 *   Purpose: Visualize the program's talent pipeline hotspots.
 *   Grid slot: 2x1
 * 
 * CONTENT TIERS:
 *   Essential: Top 3 States, In-State %
 */
export const GeographicPulseCard = ({ topStates, inStateRate }) => {
  const stateMaxCount = topStates?.[0]?.[1] || 1;

  return (
    <Box
      bg="bg.secondary"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      p={5}
      h="full"
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="xs" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="widest">
          Recruiting Pipeline
        </Text>
        <Box textAlign="right">
          <Text fontSize="lg" fontWeight="black" color="brand.400">{(inStateRate * 100).toFixed(0)}%</Text>
          <Text fontSize="9px" color="text.muted" textTransform="uppercase">In-State Rate</Text>
        </Box>
      </Flex>

      <Flex direction="column" gap={3}>
        {topStates?.slice(0, 3).map(([state, count], i) => (
          <Box key={state}>
            <Flex justify="space-between" mb={1}>
              <Text fontSize="10px" fontWeight="bold" color="text.secondary">{state}</Text>
              <Text fontSize="10px" fontWeight="bold" color="text.primary">{count} Players</Text>
            </Flex>
            <Box bg="whiteAlpha.100" h="4px" borderRadius="full">
              <Box h="full" bg={i === 0 ? "brand.500" : "whiteAlpha.400"} borderRadius="full" style={{ width: `${(count / stateMaxCount) * 100}%` }} />
            </Box>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};
