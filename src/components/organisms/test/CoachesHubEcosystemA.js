import React from 'react';
import { Box, Grid, Text, Flex, Heading, Badge } from '@chakra-ui/react';
import { Users, Info, Zap } from 'lucide-react';

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
const ProgressLine = ({ value, color = "green.500" }) => (
  <Box w="full" h="4px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
    <Box h="full" bg={color} w={`${Math.min(100, Math.max(0, value))}%`} transition="width 0.3s" />
  </Box>
);

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
      <Grid templateColumns="1fr 1fr" flex={1} minH={0}>
        {/* Left: Personnel & Continuity */}
        <Box borderRight="1px solid" borderColor="whiteAlpha.100" p={4}>
          <Flex align="center" gap={2} mb={4}>
            <Users size={14} color="#E53E3E" />
            <Text fontSize="xs" fontWeight="black" color="text.primary" textTransform="uppercase">Leadership</Text>
          </Flex>
          
          <Box mb={4}>
            <Text fontSize="9px" color="text.muted" textTransform="uppercase">Head Coach</Text>
            <Text fontSize="md" fontWeight="bold" color="text.primary">{school.head_coach?.name}</Text>
            <Text fontSize="10px" color="text.muted">Year {school.head_coach?.tenure_year} · Replacing {school.head_coach?.previous_head_coach_name}</Text>
          </Box>

          <Box>
            <Text fontSize="9px" color="text.muted" textTransform="uppercase" mb={2}>Stability Index</Text>
            <Flex direction="column" gap={3}>
              <Box>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="10px" color="text.secondary">Continuity</Text>
                  <Text fontSize="10px" fontWeight="bold" color="text.primary">{(school.stability?.continuity_score * 100).toFixed(0)}%</Text>
                </Flex>
                <ProgressLine value={school.stability?.continuity_score * 100} color="green.400" />
              </Box>
              <Box>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="10px" color="text.secondary">Tenure Avg</Text>
                  <Text fontSize="10px" fontWeight="bold" color="text.primary">{school.stability?.tenure_avg} yrs</Text>
                </Flex>
                <ProgressLine value={(school.stability?.tenure_avg / 5) * 100} color="blue.400" />
              </Box>
            </Flex>
          </Box>
        </Box>

        {/* Right: Style & Impact */}
        <Box p={4} display="flex" flexDirection="column">
          <Flex align="center" gap={2} mb={4}>
            <Zap size={14} color="#E53E3E" />
            <Text fontSize="xs" fontWeight="black" color="text.primary" textTransform="uppercase">System Identity</Text>
          </Flex>

          <Flex direction="column" gap={1} mb={4}>
            <Flex justify="space-between" align="center">
              <Text fontSize="10px" color="text.muted">Offense</Text>
              <Text fontSize="10px" textAlign="right" fontWeight="bold" color="text.primary">{school.style?.offense?.primary}</Text>
            </Flex>
            <Flex justify="space-between" align="center">
              <Text fontSize="10px" color="text.muted">Tempo</Text>
              <Text fontSize="10px" textAlign="right" fontWeight="bold" color="text.primary">{school.style?.offense?.tempo}</Text>
            </Flex>
            <Flex justify="space-between" align="center">
              <Text fontSize="10px" color="text.muted">Defense</Text>
              <Text fontSize="10px" textAlign="right" fontWeight="bold" color="text.primary">{school.style?.defense?.primary}</Text>
            </Flex>
          </Flex>

          {/* Position Impact Context (Guardrail Compliant) */}
          <Box mt="auto">
            <Text fontSize="9px" color="text.muted" textTransform="uppercase" mb={2} display="flex" align="center" gap={1}>
              <Info size={10} /> Position Production Context
            </Text>
            <Flex direction="column" gap={2}>
              {(school.position_impact?.top_improving_position_groups || []).slice(0, 2).map((pi, idx) => (
                <Box key={idx} p={2} bg="whiteAlpha.50" borderRadius="md" borderLeft="2px solid" borderColor="brand.500">
                  <Flex justify="space-between">
                    <Text fontSize="10px" fontWeight="bold" color="text.primary">{pi.position_group}</Text>
                    <Text fontSize="9px" color="brand.400">+{pi.production_score_total_delta?.toFixed(1)} PAR</Text>
                  </Flex>
                  <Text fontSize="9px" color="text.muted" mt={1} lineClamp={1}>
                    EPA Delta: {pi.position_epa_per_play_delta > 0 ? '+' : ''}{pi.position_epa_per_play_delta?.toFixed(3)}
                  </Text>
                </Box>
              ))}
              {(!school.position_impact?.top_improving_position_groups || school.position_impact.top_improving_position_groups.length === 0) && (
                <Text fontSize="9px" color="text.muted" italic>No significant production deltas.</Text>
              )}
            </Flex>
          </Box>
        </Box>
      </Grid>
    </Box>
  );
};
