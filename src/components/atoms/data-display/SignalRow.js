import { Flex, Text } from "@chakra-ui/react";

/**
 * SignalRow - Key-value signal row with accent color
 * @param {Object} props
 * @param {string} props.label - Row label
 * @param {string|number} props.value - Row value
 * @param {string} props.accent - Accent color for value (default: "brand.500")
 */
const SignalRow = ({ label, value, accent = "brand.500" }) => (
  <Flex justify="space-between" align="center" py={3} borderBottom="1px solid" borderColor="whiteAlpha.100" _last={{ borderBottom: "none" }}>
    <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">{label}</Text>
    <Text fontSize="sm" fontWeight="bold" color={accent}>{value}</Text>
  </Flex>
);

export default SignalRow;
