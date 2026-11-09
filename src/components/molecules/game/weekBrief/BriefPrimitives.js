import { Box, Text } from "@chakra-ui/react";

export const Panel = ({ children, selectedColor = "#E53E3E" }) => (
  <Box
    h="100%"
    w="100%"
    borderRadius="lg"
    border="0"
    bg={selectedColor}
    boxShadow="0 18px 42px rgba(0,0,0,0.42)"
    overflow="hidden"
  >
    {children}
  </Box>
);

export const SectionLabel = ({ children, color = "text.muted" }) => (
  <Text fontSize="9px" color={color} fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
    {children}
  </Text>
);

export const StatusPill = ({ children }) => (
  <Box px={2.5} py={1} borderRadius="full" bg="brand.500">
    <Text fontSize="7px" color="white" fontWeight="black" textTransform="uppercase">
      {children}
    </Text>
  </Box>
);
