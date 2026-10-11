import { Box, Flex, Text } from "@chakra-ui/react";

/**
 * TransferBar - Transfer tier bar chart with percentage and PAR info
 * @param {Object} props
 * @param {string} props.label - Transfer tier label
 * @param {number} props.count - Number of players in this tier
 * @param {number} props.total - Total number of players
 * @param {number} props.avgPar - Average PAR score for this tier
 * @param {string} props.color - Bar color
 */
const TransferBar = ({ label, count, total, avgPar, color }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <Box>
      <Flex justify="space-between" mb={1}>
        <Flex align="center" gap={2}>
          <Text fontSize="xs" fontWeight="bold" color={color} textTransform="uppercase" w={10}>{label}</Text>
          <Text fontSize="xs" color="text.muted">{count} players</Text>
        </Flex>
        <Text fontSize="xs" color="text.muted">avg {avgPar?.toFixed(1)} PAR</Text>
      </Flex>
      <Box bg="whiteAlpha.100" borderRadius="full" h={2} overflow="hidden">
        <Box bg={color} h="100%" w={`${pct}%`} borderRadius="full" transition="width 0.3s" />
      </Box>
    </Box>
  );
};

export default TransferBar;
