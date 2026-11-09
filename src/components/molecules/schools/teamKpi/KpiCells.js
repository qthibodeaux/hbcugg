import { Box, Text, Flex } from "@chakra-ui/react";
import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";

// Responsive KPI cells, context rings and ticker segments.

const ContextRing = ({ pct = 0, color = "#FFFFFF", track = "rgba(255,255,255,0.18)", inner = "#141416", size = 42 }) => (
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

export const KpiCell = ({ label, compactLabel, value, sub, bg, textColor, ringColor, ringTrack, ringInner, contextPct }) => {
  const { isMobile } = useLayoutDensity();
  const isDark = textColor === "#FFFFFF" || textColor === "text.primary";
  const mutedColor = isDark ? "rgba(255,255,255,0.68)" : "rgba(11,11,13,0.66)";
  const valueText = String(value ?? "--");
  // Mobile drops the big desktop floor (3.35rem/2.5rem) — at 4-across on a
  // phone those minimums were wider than the cell, so values clipped to
  // "3.." / "1..." instead of showing the number they represent.
  const valueSize = isMobile
    ? (valueText.length > 4 ? "clamp(0.95rem, 4vw, 1.4rem)" : "clamp(1.3rem, 5.6vw, 1.9rem)")
    : (valueText.length > 4 ? "clamp(2.5rem, 5.4vw, 3.2rem)" : "clamp(3.35rem, 7vw, 4.65rem)");

  const valueShadow = isDark 
    ? `3px 3px 0 rgba(11,11,13,0.15)`
    : `3px 3px 0 rgba(11,11,13,0.06)`;

  return (
    <Box
      w="full"
      h="full"
      bg={bg}
      color={textColor}
      position="relative"
      overflow="hidden"
      p={{ base: 3, md: 4 }}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      borderRight="1px solid"
      borderColor={isDark ? "whiteAlpha.100" : "blackAlpha.100"}
      _last={{ borderRight: "none" }}
    >
      {/* Background Watermark */}
      <Box position="absolute" right="-10px" bottom="-14px" fontSize="4.5rem" fontWeight="black" opacity={isDark ? 0.08 : 0.05} lineHeight="1" pointerEvents="none">
        {valueText}
      </Box>

      {/* Context Ring — smaller and tucked tighter into the corner on
          mobile, where the desktop 42px ring at top/right 3 crowded the
          value beneath it. */}
      <Box position="absolute" top={isMobile ? 1.5 : 3} right={isMobile ? 1.5 : 3} zIndex={2}>
        <ContextRing
          pct={contextPct}
          color={ringColor}
          track={ringTrack}
          inner={ringInner}
          size={isMobile ? 26 : 42}
        />
      </Box>

      <Box position="relative" zIndex={1}>
        <Text fontSize={{ base: "8px", lg: "9px" }} fontWeight="black" color={mutedColor} textTransform="uppercase" letterSpacing="0.14em" lineClamp={1}>
          <Box as="span" display={{ base: "inline", lg: "none" }}>{compactLabel ?? label}</Box>
          <Box as="span" display={{ base: "none", lg: "inline" }}>{label}</Box>
        </Text>
      </Box>

      {/* Mobile centers the value in its cell — left-aligned under a
          right-hand ring, the number sat off-balance in a narrow 4-across
          cell. Desktop keeps the left-aligned editorial treatment. */}
      <Flex flex="1" align="center" justify={isMobile ? "center" : "flex-start"} minH={0} position="relative" zIndex={1} mt={isMobile ? 3 : 1}>
        <Text
          fontSize={valueSize}
          fontWeight="black"
          color={textColor}
          lineHeight="0.82"
          letterSpacing="0"
          textShadow={valueShadow}
          textAlign={isMobile ? "center" : "left"}
          lineClamp={1}
        >
          {valueText}
        </Text>
      </Flex>

      <Flex align="end" justify="space-between" gap={3} minH="34px" position="relative" zIndex={1}>
        <Text fontSize={{ base: "9px", lg: "10px" }} color={mutedColor} fontWeight="bold" lineHeight="1.2" lineClamp={2}>
          {sub}
        </Text>
      </Flex>
    </Box>
  );
};

export const TickerSegment = ({ label, value, dividerColor, textColor }) => (
  <Flex align="center" gap={{ base: 2, lg: 3 }} flexShrink={0}>
    <Text
      fontSize={{ base: "8px", md: "9px", lg: "10px" }}
      fontWeight="black"
      color={textColor}
      textTransform="uppercase"
      letterSpacing="0.1em"
      whiteSpace="nowrap"
    >
      {label}
    </Text>
    <Text
      fontSize={{ base: "8px", md: "9px", lg: "10px" }}
      fontWeight="black"
      color={textColor}
      opacity={0.68}
      textTransform="uppercase"
      whiteSpace="nowrap"
    >
      {value}
    </Text>
    <Box w="1px" h="12px" bg={dividerColor} opacity={0.3} />
  </Flex>
);
