import { Box, Text } from "@chakra-ui/react";

export const SectionShell = ({ title, children, minH }) => (
  <Box
    bg="bg.secondary"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="xl"
    overflow="hidden"
    minH={minH}
    mb={3}
  >
    {title && (
      <Box px={4} py={3} borderBottom="1px solid" borderColor="whiteAlpha.100" bg="whiteAlpha.50">
        <Text fontSize="xs" fontWeight="black" color="brand.400" textTransform="uppercase" letterSpacing="widest">
          {title}
        </Text>
      </Box>
    )}
    <Box p={4}>{children}</Box>
  </Box>
);
