import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";
import { isLightColor } from "./rosterCardModel";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ArrowRight } from "lucide-react";

export const CardShell = ({ title, actionLabel, onClick, accent = "#E53E3E", children }) => {
  const { isMobile } = useLayoutDensity();
  const labelColor = isLightColor(accent) ? "#0B0B0D" : "#FFFFFF";

  return (
    // Mobile: square corners, no outer border, and the content padding drops
    // so the card fills its parent edge to edge.
    <Box
      w="full"
      h="full"
      bg="bg.secondary"
      border={isMobile ? "none" : "1px solid"}
      borderColor="whiteAlpha.100"
      borderRadius={isMobile ? 0 : "lg"}
      overflow="hidden"
      cursor={onClick ? "pointer" : "default"}
      transition="all 0.18s ease"
      _hover={onClick ? { borderColor: "whiteAlpha.300", bg: "whiteAlpha.100" } : undefined}
      onClick={onClick}
    >
      <Box h="5px" bg={accent} />
      <Box px={isMobile ? 2 : 4} py={isMobile ? 2 : 4} h="calc(100% - 5px)" overflow="hidden">
        <Flex justify="space-between" align="center" mb={isMobile ? 2 : 3} minH="20px">
          <Box bg={accent} px={2} py="3px" borderRadius={isMobile ? 0 : "sm"} maxW="calc(100% - 52px)">
            <Text
              fontSize="8px"
              fontWeight="black"
              color={labelColor}
              textTransform="uppercase"
              letterSpacing="0.14em"
              lineClamp={1}
            >
              {title}
            </Text>
          </Box>
          {onClick && (
            <Flex align="center" gap={1} color={accent}>
              <Text fontSize="9px" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
                {actionLabel ?? "Open"}
              </Text>
              <ArrowRight size={12} />
            </Flex>
          )}
        </Flex>
        {children}
      </Box>
    </Box>
  );
};

export const BarRow = ({ label, value, pct, color = "brand.500", valueLabel, size = "md" }) => (
  <Box>
    <Flex justify="space-between" align="center" mb={1}>
      <Text fontSize="10px" fontWeight="black" color="text.secondary" textTransform="uppercase">
        {label}
      </Text>
      <Text fontSize="10px" fontWeight="black" color="text.primary">
        {valueLabel ?? value}
      </Text>
    </Flex>
    <Box h={size === "lg" ? "12px" : "9px"} bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
      <Box h="full" borderRadius="full" bg={color} style={{ width: `${Math.max(3, Math.min(100, pct ?? 0))}%` }} />
    </Box>
  </Box>
);

export const ContextRing = ({ pct = 0, color = "#FFFFFF", track = "rgba(255,255,255,0.18)", inner = "#141416", size = 50 }) => (
  <Box
    w={`${size}px`}
    h={`${size}px`}
    borderRadius="full"
    flexShrink={0}
    bg={`conic-gradient(${color} 0deg ${Math.max(0, Math.min(100, pct)) * 3.6}deg, ${track} 0deg 360deg)`}
    display="flex"
    alignItems="center"
    justifyContent="center"
  >
    <Box w={`${Math.round(size * 0.7)}px`} h={`${Math.round(size * 0.7)}px`} borderRadius="full" bg={inner} />
  </Box>
);
