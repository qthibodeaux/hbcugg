import { Box, Text } from "@chakra-ui/react";

/**
 * MetricCard - Single metric display with label and large value
 * @param {Object} props
 * @param {string} props.label - Metric label
 * @param {string|number} props.value - Metric value
 * @param {string} props.accent - Color for the value (default: "brand.500")
 */
const MetricCard = ({ label, value, accent = "brand.500" }) => (
  <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={5}>
    <Text fontSize="9px" color="text.muted" textTransform="uppercase" letterSpacing="0.14em" mb={3}>
      {label}
    </Text>
    <Text fontSize="4xl" fontWeight="black" color={accent} lineHeight={1}>
      {value}
    </Text>
    <Text fontSize="xs" color="text.muted" mt={1}>
      {label}
    </Text>
  </Box>
);

export default MetricCard;
