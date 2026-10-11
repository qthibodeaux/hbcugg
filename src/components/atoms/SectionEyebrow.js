import { Box, Flex, Text } from "@chakra-ui/react";

// The standard card eyebrow (2026-09): red dot, tracked caps at half-white,
// hairline under, optional right-side content. Lifted out of
// GameSummaryTabV2's SectionLabel so the Stats page and the game page share
// one component instead of two copies that drift.
//
// Layout decisions stay in the parent — this is the label row only.
export const SectionEyebrow = ({ children, rightContent, dot = true, icon = null, dotColor = "#E53E3E", mb = 3 }) => (
  <Flex align="center" justify="space-between" gap={3} mb={mb} pb={2} borderBottom="0.0625rem solid" borderColor="rgba(255,255,255,0.08)">
    <Flex align="center" gap={2} minW={0}>
      {dot && <Box w="0.375rem" h="0.375rem" bg={dotColor} borderRadius="full" flexShrink={0} />}
      {icon && (
        <Box flexShrink={0} display="flex" alignItems="center" justifyContent="center" color={dotColor}>
          {icon}
        </Box>
      )}
      <Text
        fontSize="clamp(0.55rem, 0.65vw, 0.7rem)"
        fontWeight="black"
        color="rgba(255,255,255,0.5)"
        textTransform="uppercase"
        letterSpacing="0.16em"
        lineHeight={1.1}
        lineClamp={1}
      >
        {children}
      </Text>
    </Flex>
    {rightContent && <Box ml="auto" flexShrink={0}>{rightContent}</Box>}
  </Flex>
);

export default SectionEyebrow;
