import { Box } from "@chakra-ui/react";

/**
 * YearTab - Year selector tab component
 * @param {Object} props
 * @param {string} props.year - Year value
 * @param {boolean} props.active - Whether the tab is active
 * @param {Function} props.onClick - Click handler
 */
const YearTab = ({ year, active, onClick }) => (
  <Box
    as="button"
    onClick={onClick}
    px={4} py="6px"
    borderRadius="md"
    fontSize="sm"
    fontWeight={active ? "bold" : "medium"}
    bg={active ? "brand.500" : "transparent"}
    color={active ? "white" : "text.muted"}
    _hover={{ color: active ? "white" : "text.primary" }}
    transition="all 0.15s"
  >
    {year}
  </Box>
);

export default YearTab;
