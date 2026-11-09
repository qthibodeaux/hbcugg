import { Box, Grid, Text, Flex } from "@chakra-ui/react";
import { Users, Info, Zap } from "lucide-react";

const ProgressLine = ({ value, color = "green.500" }) => (
  <Box w="full" h="4px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
    <Box h="full" bg={color} w={`${Math.min(100, Math.max(0, value))}%`} transition="width 0.3s" />
  </Box>
);

export const EcosystemPanels = ({ school }) => (
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
);
