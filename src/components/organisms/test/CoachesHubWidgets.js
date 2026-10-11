import React from 'react';
import { Box, Flex, Text, Grid, Badge } from '@chakra-ui/react';
import { Shield, GitMerge, GraduationCap, Zap } from 'lucide-react';

const WidgetHeader = ({ icon: Icon, title, subtitle, color = "#E53E3E" }) => (
  <Flex align="center" gap={3} mb={5}>
    <Box p={2} bg={`${color}15`} borderRadius="md">
      <Icon size={16} color={color} />
    </Box>
    <Box>
      <Text fontSize="md" fontWeight="black" color="text.primary" textTransform="uppercase" letterSpacing="tight">
        {title}
      </Text>
      {subtitle && <Text fontSize="xs" color="text.muted">{subtitle}</Text>}
    </Box>
  </Flex>
);

// Helper for bar visualization in v3
const ProgressLine = ({ value, color = "green.400" }) => (
  <Box w="full" h="4px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
    <Box h="full" bg={color} w={`${Math.min(100, Math.max(0, value))}%`} transition="width 0.3s" />
  </Box>
);

// --- 3. Coaching Stability Index ---
export const CoachingStabilityWidget = ({ schools = [] }) => {
  return (
    <Box w="full" h="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={5}>
      <WidgetHeader 
        icon={Shield} 
        title="Stability Index" 
        subtitle="Ranked by continuity & leadership tenure" 
        color="#48BB78"
      />
      <Grid gap={4}>
        {schools.slice(0, 5).map((s, idx) => (
          <Box key={s.school_id}>
            <Flex justify="space-between" align="end" mb={1}>
              <Box>
                <Text fontSize="xs" fontWeight="bold" color="text.primary">{s.school_name}</Text>
                <Text fontSize="10px" color="text.muted">{s.head_coach?.name} ({s.head_coach?.tenure_year}yr)</Text>
              </Box>
              <Text fontSize="xs" fontWeight="black" color="green.400">
                {(s.stability?.continuity_score * 100).toFixed(0)}
              </Text>
            </Flex>
            <ProgressLine value={s.stability?.continuity_score * 100} color="green.400" />
          </Box>
        ))}
      </Grid>
    </Box>
  );
};

// --- 4. Coaching Movement Preview ---
export const CoachingMovementWidget = ({ schools = [] }) => {
  // Extract recent "interesting" moves
  const recentMoves = schools
    .filter(s => s.movement?.hires > 0)
    .sort((a, b) => b.movement.hires - a.movement.hires)
    .slice(0, 4);

  return (
    <Box w="full" h="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={5}>
      <WidgetHeader 
        icon={GitMerge} 
        title="Movement Board" 
        subtitle="Staff turnover & hire analysis" 
        color="#E53E3E"
      />
      <Grid gap={3}>
        {recentMoves.map(s => (
          <Flex key={s.school_id} p={3} bg="whiteAlpha.50" borderRadius="md" align="center" justify="space-between">
            <Box>
              <Text fontSize="xs" fontWeight="bold" color="text.primary">{s.school_name}</Text>
              <Text fontSize="10px" color="text.muted">
                {s.movement.external_hires} External • {s.movement.internal_promotions} Promo
              </Text>
            </Box>
            <Badge variant="subtle" colorScheme="red" fontSize="9px">
              +{s.movement.hires} Hires
            </Badge>
          </Flex>
        ))}
      </Grid>
    </Box>
  );
};

// --- 6. Pipeline Schools Widget ---
export const PipelineSchoolsWidget = ({ schools = [] }) => {
  return (
    <Box w="full" h="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={5}>
      <WidgetHeader 
        icon={GraduationCap} 
        title="Pipeline Hubs" 
        subtitle="Programs exporting coaching talent" 
        color="#4299E1"
      />
      <Grid gap={4}>
        {schools.slice(0, 5).map(s => (
          <Flex key={s.school_id} align="center" gap={3}>
            <Box w={8} h={8} borderRadius="md" bg="whiteAlpha.100" display="flex" align="center" justify="center">
              <Text fontSize="xs" fontWeight="black" color="text.primary">#{s.pipeline?.staff_export_count || 0}</Text>
            </Box>
            <Box flex={1}>
              <Text fontSize="xs" fontWeight="bold" color="text.primary">{s.school_name}</Text>
              <Text fontSize="10px" color="text.muted" lineClamp={1}>
                {s.pipeline?.notable_exports?.join(', ') || 'Various staffs'}
              </Text>
            </Box>
          </Flex>
        ))}
      </Grid>
    </Box>
  );
};

// --- 8. Aggression / Style Widget ---
export const CoachingStyleWidget = ({ schools = [] }) => {
  const topAggressive = schools
    .filter(s => s.style?.offense?.tempo_score !== undefined)
    .sort((a, b) => b.style.offense.tempo_score - a.style.offense.tempo_score)
    .slice(0, 5);

  return (
    <Box w="full" h="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={5}>
      <WidgetHeader 
        icon={Zap} 
        title="Aggression & Style" 
        subtitle="Highest offensive tempo & intent" 
        color="#ECC94B"
      />
      <Grid gap={3}>
        {topAggressive.map(s => (
          <Box key={s.school_id}>
            <Flex justify="space-between" mb={1}>
              <Text fontSize="xs" fontWeight="bold" color="text.primary">{s.school_name}</Text>
              <Text fontSize="10px" fontWeight="bold" color="yellow.400">{s.style?.offense?.primary}</Text>
            </Flex>
            <Flex align="center" gap={2}>
              <Box flex={1}>
                <ProgressLine value={s.style?.offense?.tempo_score * 100} color="yellow.400" />
              </Box>
              <Text fontSize="9px" color="text.muted" w="30px" textAlign="right">
                {s.style?.offense?.tempo}
              </Text>
            </Flex>
          </Box>
        ))}
      </Grid>
    </Box>
  );
};
