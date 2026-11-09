import { Box } from "@chakra-ui/react";

// Officials directory tabs and conference filter chips.

export const Tab = ({ active, onClick, children }) => (
  <Box
    as="button"
    onClick={onClick}
    pb={2}
    borderBottom="2px solid"
    borderColor={active ? "brand.500" : "transparent"}
    color={active ? "text.primary" : "text.muted"}
    fontWeight={active ? "bold" : "medium"}
    fontSize="sm"
    letterSpacing="wide"
    _hover={{ color: "text.primary" }}
    transition="all 0.15s"
  >
    {children}
  </Box>
);

export const FilterChip = ({ active, onClick, children }) => (
  <Box
    as="button"
    onClick={onClick}
    px={3}
    py="5px"
    borderRadius="full"
    fontSize="xs"
    fontWeight={active ? "bold" : "medium"}
    bg={active ? "brand.500" : "whiteAlpha.100"}
    color={active ? "white" : "text.secondary"}
    _hover={{ bg: active ? "brand.600" : "whiteAlpha.200" }}
    transition="all 0.15s"
    whiteSpace="nowrap"
  >
    {children}
  </Box>
);
