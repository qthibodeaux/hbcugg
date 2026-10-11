import React from 'react';
import { Box, Flex, Text, Badge, Grid } from '@chakra-ui/react';
import { TrendingUp } from 'lucide-react';

/**
 * CoachStockWidget
 * Market-board style tracker for staff trajectory.
 */
export const CoachStockWidget = ({ schools = [] }) => {
  const stockItems = schools
    .filter(s => s.stock)
    .sort((a, b) => {
      // Priority: Under Pressure, Rising, New Era
      const order = { 'Under Pressure': 0, 'Rising': 1, 'New Era': 2, 'Stable': 3 };
      return (order[a.stock.label] ?? 4) - (order[b.stock.label] ?? 4);
    })
    .slice(0, 5);

  const getLabelColor = (label) => {
    switch (label) {
      case 'Rising': return 'green';
      case 'Under Pressure': return 'red';
      case 'New Era': return 'purple';
      case 'Rebuild': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <Box w="full" h="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={5}>
      <Flex align="center" gap={3} mb={5}>
        <Box p={2} bg="brand.500" borderRadius="md">
          <TrendingUp size={16} color="white" />
        </Box>
        <Box>
          <Text fontSize="md" fontWeight="black" color="text.primary" textTransform="uppercase" letterSpacing="tight">
            Stock Watch
          </Text>
          <Text fontSize="xs" color="text.muted">Trajectory & confidence signals</Text>
        </Box>
      </Flex>

      <Grid gap={3}>
        {stockItems.map(s => (
          <Flex key={s.school_id} p={3} bg="whiteAlpha.50" borderRadius="md" align="center" justify="space-between">
            <Box>
              <Text fontSize="xs" fontWeight="bold" color="text.primary">{s.school_name}</Text>
              <Text fontSize="10px" color="text.muted">{s.head_coach?.name}</Text>
            </Box>
            <Flex direction="column" align="end" gap={1}>
              <Badge variant="subtle" colorScheme={getLabelColor(s.stock.label)} fontSize="9px">
                {s.stock.label}
              </Badge>
              <Text fontSize="8px" color="text.muted" textTransform="uppercase">
                {s.stock.confidence} Confidence
              </Text>
            </Flex>
          </Flex>
        ))}
      </Grid>
    </Box>
  );
};
