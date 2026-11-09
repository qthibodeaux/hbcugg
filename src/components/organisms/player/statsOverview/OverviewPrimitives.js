import { Text, Box, Flex } from "@chakra-ui/react";

export const POSITIVE = "#4ADE80";

export const NEGATIVE = "#F87171";

export const TRACK_BG = "whiteAlpha.200";

export const TRACK_H = "7px";

export const PANEL_BG = "whiteAlpha.50";

export const PANEL_BORDER = "whiteAlpha.100";

export const PANEL_PAD = 2.5;

export const SECTION_GAP = 2;

export const ROW_GAP = 2;

export const TYPE = {
  hero: "clamp(2.8rem, 6vw, 4.4rem)",
  stat: "clamp(1.4rem, 2.4vw, 1.9rem)",
  title: "0.95rem",
  inline: "0.8rem",
  label: "0.75rem", // hard floor - nothing smaller anywhere in this file
};

export const StatLabel = ({ children, ...rest }) => (
  <Text
    fontSize={TYPE.label}
    fontWeight="900"
    color="whiteAlpha.600"
    textTransform="uppercase"
    letterSpacing="0.07em"
    lineHeight={1.2}
    {...rest}
  >
    {children}
  </Text>
);

export const StatNum = ({ children, color = "white" }) => (
  <Text fontSize={TYPE.stat} fontWeight="900" fontStyle="italic" color={color} lineHeight={1} letterSpacing="-0.035em" whiteSpace="nowrap">
    {children}
  </Text>
);

export const HeroNum = ({ children, color = "white" }) => (
  <Text
    fontSize={TYPE.hero}
    fontWeight="900"
    fontStyle="italic"
    color={color}
    lineHeight={0.82}
    letterSpacing="-0.05em"
    textShadow="0 3px 0 rgba(0,0,0,0.45)"
    whiteSpace="nowrap"
  >
    {children}
  </Text>
);

export const Panel = ({ children, ...rest }) => (
  <Box bg={PANEL_BG} border="1px solid" borderColor={PANEL_BORDER} borderRadius="md" p={PANEL_PAD} {...rest}>
    {children}
  </Box>
);

export const SectionHead = ({ children, accent, dim, right }) => (
  <Flex align="center" justify="space-between" gap={2} mb={1.5}>
    <Flex align="center" gap={2} minW={0}>
      <Box w="4px" h="0.9rem" bg={dim ? `${accent}66` : accent} borderRadius="sm" flexShrink={0} />
      <Text
        fontSize={TYPE.title}
        fontWeight="900"
        color={dim ? "whiteAlpha.700" : "white"}
        textTransform="uppercase"
        letterSpacing="0.06em"
        lineHeight={1}
        whiteSpace="nowrap"
      >
        {children}
      </Text>
    </Flex>
    {right}
  </Flex>
);
