import { Box } from "@chakra-ui/react";
import { Search } from "lucide-react";

/**
 * SearchInput - Styled search input with icon
 * @param {Object} props
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 */
const SearchInput = ({ value, onChange, placeholder }) => (
  <Box flex={1} minW="240px" position="relative">
    <Box
      position="absolute"
      left={3}
      top="50%"
      transform="translateY(-50%)"
      pointerEvents="none"
      zIndex={1}
    >
      <Search size={14} color="var(--chakra-colors-whiteAlpha-400)" />
    </Box>
    <Box
      as="input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      pl={8}
      pr={4}
      py={3}
      w="100%"
      bg="whiteAlpha.50"
      border="1px solid"
      borderColor="whiteAlpha.200"
      borderRadius="md"
      color="text.primary"
      fontSize="11px"
      letterSpacing="0.06em"
      _placeholder={{ color: "whiteAlpha.300", fontSize: "11px" }}
      _focus={{ outline: "none", borderColor: "brand.500", bg: "whiteAlpha.100" }}
      transition="all 0.15s"
    />
  </Box>
);

export default SearchInput;
