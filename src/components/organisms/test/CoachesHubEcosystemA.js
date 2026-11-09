import React from 'react';
import { Box, Text, Flex, Heading, Badge } from '@chakra-ui/react';
import { EcosystemPanels } from "./coachesEcosystem/EcosystemPanels";

/**
 * CoachesHubEcosystemA
 * 
 * A 2x2 or 4x1 candidate for the Coaches Hub that renders the new "Ecosystem" data:
 * - Head Coach Profile
 * - Stability & Stock (New Era, Rising, etc.)
 * - Style Metrics (Air, Ground, Tempo)
 * - Position Impact (Production context)
 */

// Helper for bar visualization in v3
export const CoachesHubEcosystemA = ({ schoolData }) => {
  // If no data, use a subset of the DSU 2025 payload as reference
  const school = schoolData || {
    school_id: "meacdsu",
    school_name: "Delaware State",
    season: 2025,
    head_coach: {
      name: "DeSean Jackson",
      tenure_year: 1,
      previous_head_coach_name: "Lee Hull",
      summary: "First season under DeSean Jackson following transition from Lee Hull."
    },
    stability: {
      tenure_avg: 1.0,
      turnover_rate: 0.15,
      continuity_score: 0.85
    },
    stock: {
      label: "New Era",
      trajectory: "Rising",
      confidence: "High"
    },
    style: {
      offense: { primary: "Pass-Heavy", air_raid_score: 0.85, tempo: "High" },
      defense: { primary: "Hybrid 4-3", blitz_rate: 0.42, pressure_style: "Aggressive" }
    },
    position_impact: [
      { group: "WR", impact_context: "High Production", notes: "Transition to Air Raid expected to boost WR output." },
      { group: "DL", impact_context: "Rebuilding", notes: "Replacing 3 starters from 2024 unit." }
    ]
  };

  const getStockColor = (label) => {
    switch (label) {
      case 'New Era': return 'purple.500';
      case 'Rising': return 'green.500';
      case 'Stable': return 'blue.500';
      case 'Under Pressure': return 'red.500';
      default: return 'brand.500';
    }
  };

  return (
    <Box 
      w="full" 
      h="full" 
      bg="bg.secondary" 
      border="1px solid" 
      borderColor="whiteAlpha.100" 
      borderRadius="xl" 
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      {/* Header - Identity & Stock */}
      <Flex p={4} align="center" justify="space-between" borderBottom="1px solid" borderColor="whiteAlpha.100" bg="whiteAlpha.50">
        <Flex align="center" gap={3}>
          <Box w={1} h={8} bg={getStockColor(school.stock?.label)} borderRadius="full" />
          <Box>
            <Heading size="sm" color="text.primary" textTransform="uppercase" letterSpacing="widest">
              {school.school_name}
            </Heading>
            <Text fontSize="10px" color="text.muted" fontWeight="bold">
              {school.season} STAFF ECOSYSTEM
            </Text>
          </Box>
        </Flex>
        <Badge variant="subtle" colorScheme={school.stock?.label === 'New Era' ? 'purple' : 'green'} fontSize="10px" px={2} py={1}>
          {school.stock?.label}
        </Badge>
      </Flex>

      {/* Main Grid */}
      <EcosystemPanels school={school} />
    </Box>
  );
};
