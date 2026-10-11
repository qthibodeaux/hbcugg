import { Box, Text } from "@chakra-ui/react";

/**
 * ComingSoon - Placeholder component for upcoming features
 * @param {Object} props
 * @param {string} props.label - Feature label
 */
const ComingSoon = ({ label }) => (
  <Box py={16} textAlign="center">
    <Text fontSize="lg" fontWeight="bold" color="text.primary" mb={2}>{label}</Text>
    <Text fontSize="sm" color="text.muted">This hub is coming soon.</Text>
  </Box>
);

export default ComingSoon;
