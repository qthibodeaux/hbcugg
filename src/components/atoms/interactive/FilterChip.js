import { Box } from "@chakra-ui/react";

/**
 * FilterChip - Toggle filter chip for category selection
 * @param {Object} props
 * @param {boolean} props.active - Whether the chip is active
 * @param {Function} props.onClick - Click handler
 * @param {ReactNode} props.children - Chip content
 */
const FilterChip = ({ active, onClick, children }) => (
  <Box
    as="button"
    onClick={onClick}
    px={3} py="5px"
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

export default FilterChip;
