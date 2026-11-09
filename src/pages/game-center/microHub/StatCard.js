import { Box, Text } from "@chakra-ui/react";

export const StatCard = ({ label, value, accent = "brand.500" }) => (
  <Box bg="blackAlpha.300" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={4}>
    <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" mb={2}>
      {label}
    </Text>
    <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="black" color={accent} lineHeight={1}>
      {value}
    </Text>
  </Box>
);
