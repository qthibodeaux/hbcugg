import { Flex, Box, Text } from "@chakra-ui/react";
import { Filter } from "lucide-react";

export const IconButton = ({ label, icon, onClick, disabled }) => (
  <Flex
    as="button"
    type="button"
    onClick={onClick}
    disabled={disabled}
    align="center"
    justify="center"
    w="38px"
    h="38px"
    borderRadius="full"
    border="1px solid"
    borderColor="whiteAlpha.200"
    bg="blackAlpha.400"
    color="white"
    opacity={disabled ? 0.34 : 1}
    cursor={disabled ? "not-allowed" : "pointer"}
    aria-label={label}
    title={label}
    _hover={disabled ? {} : { bg: "whiteAlpha.100", borderColor: "whiteAlpha.300" }}
  >
    {icon}
  </Flex>
);

export const SelectControl = ({ label, icon, value, onChange, options, minW = "118px" }) => (
  <Flex
    align="center"
    gap={2}
    h="38px"
    px={3}
    borderRadius="full"
    border="1px solid"
    borderColor="whiteAlpha.300"
    bg="rgba(255,255,255,0.12)"
    color="white"
    position="relative"
    minW={minW}
  >
    {icon}
    <Box
      as="select"
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      appearance="none"
      bg="transparent"
      border="0"
      outline="0"
      color="white"
      fontSize="9px"
      fontWeight="900"
      textTransform="uppercase"
      cursor="pointer"
      w="100%"
      pr={5}
      style={{ colorScheme: "dark" }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Box>
    <Text position="absolute" right="12px" fontSize="10px" color="whiteAlpha.700" pointerEvents="none">
      v
    </Text>
  </Flex>
);

export const TogglePill = ({ active, onClick, children }) => (
  <Flex
    as="button"
    type="button"
    onClick={onClick}
    align="center"
    gap={2}
    h="38px"
    px={3}
    borderRadius="full"
    border="1px solid"
    borderColor={active ? "brand.400" : "whiteAlpha.200"}
    bg={active ? "rgba(229,62,62,0.28)" : "blackAlpha.400"}
    cursor="pointer"
    _hover={{ bg: active ? "rgba(229,62,62,0.34)" : "whiteAlpha.100" }}
  >
    <Filter size={13} />
    <Text fontSize="9px" color="white" fontWeight="black" textTransform="uppercase" whiteSpace="nowrap">
      {children}
    </Text>
  </Flex>
);
