import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { Zap } from "lucide-react";
import RadarChart from "../../atoms/charts/RadarChart";

/**
 * EfficiencyProfile - Radar chart with labels and scores for player efficiency
 * @param {Object} props
 * @param {number[]} props.scores - Array of scores (0-100)
 * @param {string[]} props.labels - Array of labels for each point
 */
const EfficiencyProfile = ({ scores, labels }) => {
  return (
    <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={5}>
      <Flex align="center" justify="space-between" mb={4}>
        <Flex align="center" gap={2}>
          <Box w="3px" h="16px" bg="brand.500" borderRadius="full" />
          <Text fontSize="xs" fontWeight="bold" color="white" textTransform="uppercase" letterSpacing="0.1em">
            Efficiency Profile
          </Text>
        </Flex>
        <Zap size={14} color="var(--chakra-colors-brand-400)" />
      </Flex>
      <Flex justify="center">
        <RadarChart scores={scores} labels={labels} />
      </Flex>
      <Grid templateColumns="repeat(5, 1fr)" gap={2} mt={3}>
        {labels.map((label, i) => (
          <Box key={label} textAlign="center">
            <Text fontSize="sm" fontWeight="black" color="brand.400">{scores[i]}</Text>
            <Text fontSize="8px" color="text.muted" textTransform="uppercase" letterSpacing="0.04em">
              {label}
            </Text>
          </Box>
        ))}
      </Grid>
    </Box>
  );
};

export default EfficiencyProfile;
