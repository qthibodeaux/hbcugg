import { Box, Text } from "@chakra-ui/react";

/**
 * StatCard - Generic stat display card with label and value
 * @param {Object} props
 * @param {string} props.label - Stat label
 * @param {string|number} props.value - Stat value
 * @param {string} props.accent - Color for the value (default: "brand.500")
 */
const StatCard = ({ label, value, accent = "brand.500" }) => (
  <Box bg="blackAlpha.300" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={4}>
    <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="0.14em" mb={2}>
      {label}
    </Text>
    <Text fontSize={{ base: "2xl", md: "4xl" }} fontWeight="black" color={accent} lineHeight={1}>
      {value}
    </Text>
  </Box>
);

export default StatCard;
