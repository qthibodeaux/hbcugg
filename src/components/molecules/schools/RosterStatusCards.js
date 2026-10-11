import { Box, Flex, Grid, GridItem, Text } from "@chakra-ui/react";
import { useMemo } from "react";

/**
 * 1x1 Status Cards for the Dashboard
 * Redesigned for maximum clarity and space utilization.
 */

const SectionLabel = ({ label, color = "brand.500" }) => (
  <Flex align="center" gap={2} mb={2}>
    <Box w="3px" h="12px" borderRadius="1px" bg={color} />
    <Text
      fontSize="10px"
      fontWeight="black"
      color="text.secondary"
      textTransform="uppercase"
      letterSpacing="0.1em"
    >
      {label}
    </Text>
  </Flex>
);

/**
 * RosterLoadoutCard (1x1)
 * Replaces the old bar-based RosterDepthCard.
 * Uses a ranked grid for tight horizontal efficiency.
 */
export const RosterLoadoutCard = ({ team, analytics }) => {
  const accent = team?.colors?.secondary || "#F56565";
  
  const groups = useMemo(() => {
    const dist = analytics?.basic_analytics?.position_distribution || {};
    return Object.entries(dist)
      .filter(([key]) => key !== "null")
      .map(([label, value]) => ({
        label: label.split(' ').map(w => w[0]).join('').toUpperCase(), // "Wide Receiver" -> "WR"
        full: label,
        value
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, [analytics]);

  return (
    <Box w="full" h="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" p={3} position="relative">
      <SectionLabel label="Unit Loadout" color={accent} />
      
      <Grid templateColumns="repeat(2, 1fr)" gap={2} mt={1}>
        {groups.map((group) => (
          <GridItem key={group.full} bg="whiteAlpha.50" p={2} borderRadius="md" borderLeft="2px solid" borderColor="whiteAlpha.200">
            <Flex justify="space-between" align="baseline">
              <Text fontSize="10px" fontWeight="bold" color="text.muted">{group.label}</Text>
              <Text fontSize="16px" fontWeight="black" color="text.primary">{group.value}</Text>
            </Flex>
          </GridItem>
        ))}
      </Grid>

      <Text position="absolute" right={2} bottom={2} fontSize="9px" fontWeight="bold" color="text.muted" opacity={0.6}>
        TOTAL: {analytics?.team_info?.total_players || "--"}
      </Text>
    </Box>
  );
};

/**
 * ClassPipelineCard (1x1)
 * Visualizes the age/experience distribution vertically.
 */
export const ClassPipelineCard = ({ team, analytics }) => {
  const accent = team?.colors?.secondary || "#F56565";
  
  const pipeline = useMemo(() => {
    const exp = analytics?.basic_analytics?.experience_breakdown || {};
    const order = ["Gr.", "Sr.", "Jr.", "So.", "Fr."];
    const total = Object.values(exp).reduce((sum, v) => sum + (Number(v) || 0), 0) || 1;
    
    return order.map(key => ({
      label: key === "Gr." ? "GRAD" : key === "Fr." ? "FRESH" : key.replace('.', '').toUpperCase(),
      count: exp[key] || 0,
      pct: ((exp[key] || 0) / total) * 100
    }));
  }, [analytics]);

  return (
    <Box w="full" h="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" p={3}>
      <SectionLabel label="Class Pipeline" color={accent} />
      
      <Flex direction="column" gap={1.5} mt={1}>
        {pipeline.map((item) => (
          <Flex key={item.label} align="center" gap={2}>
            <Text fontSize="9px" fontWeight="black" color="text.muted" w="32px">{item.label}</Text>
            <Box flex={1} h="6px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
              <Box 
                h="full" 
                w={`${item.pct}%`} 
                bg={item.label === "GRAD" || item.label === "SR" ? accent : "whiteAlpha.400"} 
                borderRadius="full" 
              />
            </Box>
            <Text fontSize="10px" fontWeight="black" color="text.primary" w="18px" textAlign="right">{item.count}</Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
};
