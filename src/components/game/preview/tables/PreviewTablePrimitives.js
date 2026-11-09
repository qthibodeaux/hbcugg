import { Flex, Box, Text } from "@chakra-ui/react";

// Shared preview sheet labels, contextual rank chips, values and row framing.

export const Eyebrow = ({ children }) => (
  <Flex align="center" gap={2} mb={3}>
    <Box w="6px" h="6px" borderRadius="full" bg="brand.500" />
    <Text textStyle="kicker" color="text.secondary" fontSize="11px" letterSpacing="0.22em">{children}</Text>
  </Flex>
);

const TONE = {
  good: { bg: "rgba(34,139,84,0.88)", color: "#F4F4F5" },
  bad: { bg: "rgba(200,60,60,0.88)", color: "#F4F4F5" },
  mid: { bg: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.65)" },
  none: { bg: "transparent", color: "rgba(255,255,255,0.4)" },
};

export const Chip = ({ rank, tone }) => {
  const t = TONE[tone] ?? TONE.none;
  return (
    <Box bg={t.bg} borderRadius="sm" minW="2.5em" px="5px" py="2px" textAlign="center" flexShrink={0}>
      <Text fontSize="clamp(0.6rem, 0.78vw, 0.72rem)" fontWeight="900" color={t.color} lineHeight={1.2}>{rank ? rank : "—"}</Text>
    </Box>
  );
};

export const Value = ({ children, dim }) => (
  <Text fontSize="clamp(0.9rem, 1.25vw, 1.12rem)" fontWeight="900" fontVariantNumeric="tabular-nums" color={dim ? "whiteAlpha.700" : "white"} lineHeight={1} minW="3.4em" textAlign="right">
    {children}
  </Text>
);

export const RowShell = ({ children, child }) => (
  <Flex align="center" gap="clamp(0.4rem, 0.8vw, 0.7rem)" py={child ? "clamp(0.3rem, 0.55vw, 0.48rem)" : "clamp(0.45rem, 0.8vw, 0.7rem)"} borderBottom="1px solid" borderColor="whiteAlpha.100">
    {children}
  </Flex>
);
