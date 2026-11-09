import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { Flex, Box, Text } from "@chakra-ui/react";
import { BANNER_PILL_BG } from "./BannerFrame";

// Shared banner icon/action buttons, toggles and segmented pills.

export const BannerIconButton = ({ children, ariaLabel, disabled, ...props }) => {
  const { isMobile } = useLayoutDensity();
  return (
    <Flex
      as="button"
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      align="center"
      justify="center"
      w="1.75rem"
      h="1.75rem"
      bg={BANNER_PILL_BG}
      border="1px solid"
      borderColor="whiteAlpha.200"
      borderRadius={isMobile ? "0" : "md"}
      cursor={disabled ? "not-allowed" : "pointer"}
      opacity={disabled ? 0.4 : 1}
      _hover={disabled ? {} : { borderColor: "whiteAlpha.400" }}
      flexShrink={0}
      {...props}
    >
      {children}
    </Flex>
  );
};

export const BannerActionButton = ({ children, primary = "#A855F7", disabled, ...props }) => {
  const { isMobile } = useLayoutDensity();
  return (
    <Box
      as="button"
      type="button"
      disabled={disabled}
      px="0.9rem"
      py="0.45rem"
      bg={disabled ? "whiteAlpha.100" : primary}
      borderRadius={isMobile ? "0" : "md"}
      cursor={disabled ? "not-allowed" : "pointer"}
      _hover={disabled ? {} : { filter: "brightness(1.1)" }}
      {...props}
    >
      <Text fontSize="0.7rem" fontWeight="black" color={disabled ? "whiteAlpha.500" : "white"} letterSpacing="0.05em">
        {children}
      </Text>
    </Box>
  );
};

export const BannerTogglePill = ({ active, onClick, children, icon }) => {
  const { isMobile } = useLayoutDensity();
  return (
    <Flex
      as="button"
      type="button"
      onClick={onClick}
      align="center"
      gap="0.4rem"
      px="0.75rem"
      py="0.4rem"
      bg={active ? "rgba(168,85,247,0.16)" : BANNER_PILL_BG}
      border="1px solid"
      borderColor={active ? "#A855F7" : "whiteAlpha.200"}
      borderRadius={isMobile ? "0" : "md"}
      cursor="pointer"
      _hover={{ borderColor: active ? "#A855F7" : "whiteAlpha.400" }}
    >
      {icon}
      <Text fontSize="0.65rem" fontWeight="black" color="white" letterSpacing="0.05em" whiteSpace="nowrap">
        {children}
      </Text>
    </Flex>
  );
};

export const BannerSegmentedPills = ({ options, value, onChange }) => {
  const { isMobile } = useLayoutDensity();
  return (
    <Flex bg={BANNER_PILL_BG} border="1px solid" borderColor="whiteAlpha.200" borderRadius={isMobile ? "0" : "md"} p="0.2rem" gap="0.2rem">
      {options.map((opt) => {
        const v = typeof opt === "object" ? opt.value : opt;
        const l = typeof opt === "object" ? opt.label : opt;
        const isActive = v === value;
        return (
          <Box
            key={v}
            as="button"
            type="button"
            onClick={() => onChange(v)}
            px="0.65rem"
            py="0.3rem"
            borderRadius={isMobile ? "0" : "sm"}
            bg={isActive ? "whiteAlpha.300" : "transparent"}
            cursor="pointer"
            _hover={{ bg: isActive ? "whiteAlpha.300" : "whiteAlpha.100" }}
          >
            <Text fontSize="0.7rem" fontWeight="black" color={isActive ? "white" : "whiteAlpha.600"}>
              {l}
            </Text>
          </Box>
        );
      })}
    </Flex>
  );
};
