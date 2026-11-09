import { Flex, Box, Text } from "@chakra-ui/react";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export const SectionLabel = ({ label, color = "brand.500" }) => (
  <Flex align="center" gap={2} mb={2}>
    <Box w="7px" h="7px" borderRadius="full" bg={color} />
    <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.14em">
      {label}
    </Text>
  </Flex>
);

export const CardShell = ({ children, accent = "#E53E3E", p = 4 }) => (
  <Box w="full" h="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" overflow="hidden" position="relative">
    <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={accent} />
    <Box position="absolute" inset={0} bg={`linear-gradient(135deg, ${accent}08 0%, transparent 50%)`} pointerEvents="none" />
    <Box position="relative" zIndex={1} p={p} h="full">
      {children}
    </Box>
  </Box>
);

export const CollapsibleSection = ({ title, kicker, count, children }) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" overflow="hidden" mb={4}>
      <Flex
        align="center" justify="space-between" px={5} py={4}
        borderBottom={collapsed ? "none" : "1px solid"} borderColor="whiteAlpha.100"
        bg="linear-gradient(90deg, rgba(229,62,62,0.06) 0%, transparent 60%)"
        cursor="pointer"
        onClick={() => setCollapsed(!collapsed)}
      >
        <Box>
          <Text fontSize="9px" fontWeight="black" color="brand.500" textTransform="uppercase" letterSpacing="widest">{kicker}</Text>
          <Text fontSize="lg" fontWeight="black" color="text.primary">{title}</Text>
        </Box>
        <Flex align="center" gap={3}>
          {count != null && <Text fontSize="10px" color="text.muted" textTransform="uppercase">{count} items</Text>}
          <Box w="28px" h="28px" borderRadius="full" border="1px solid" borderColor="whiteAlpha.100" bg="whiteAlpha.50" display="flex" alignItems="center" justifyContent="center">
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </Box>
        </Flex>
      </Flex>
      {!collapsed && <Box p={4}>{children}</Box>}
    </Box>
  );
};
