import { CARD_ACCENTS } from "../../../utils/rosterHubConfig";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { Box, Text, Flex } from "@chakra-ui/react";
import { TrendingUp, TrendingDown } from "lucide-react";

// Extracted from the live roster hub. Existing calculations and layouts preserved.

export const SectionCard = ({ kicker, title, children, accent = CARD_ACCENTS.players, h, borderRadius = "lg", flat = false }) => {
  const { isMobile } = useLayoutDensity();
  return (
  <Box
    h={h}
    bg={flat ? "bg.secondary" : `linear-gradient(145deg, ${accent}14 0%, rgba(20,20,22,0.98) 34%, rgba(10,10,12,1) 100%)`}
    border="1px solid"
    borderColor={flat ? "whiteAlpha.100" : `${accent}33`}
    borderRadius={borderRadius}
    overflow="hidden"
    display="flex"
    flexDirection="column"
    position="relative"
    boxShadow={flat ? "0 14px 32px rgba(0,0,0,0.22)" : `inset 3px 0 0 ${accent}, 0 14px 32px rgba(0,0,0,0.22)`}
  >
    {!flat && (
      <Box position="absolute" right="-28px" top="-28px" boxSize="96px" borderRadius="full" bg={`${accent}18`} filter="blur(20px)" pointerEvents="none" />
    )}
    <Box
      px={isMobile ? 2 : { base: 3, lg: 4 }}
      pt={isMobile ? 2 : { base: 3, lg: 4 }}
      pb={2}
      flexShrink={0}
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      position="relative"
      zIndex={1}
    >
      {kicker && (
        <Text textStyle="kicker" color="text.muted" lineClamp={1} fontSize={isMobile ? "7px" : undefined} letterSpacing={isMobile ? "0.08em" : undefined}>
          {kicker}
        </Text>
      )}
      <Flex align="center" gap={flat ? "0.5rem" : 0}>
        {flat && (
          <Box w="0.1875rem" h={isMobile ? "0.9rem" : "1.1rem"} bg={accent} borderRadius="full" flexShrink={0} />
        )}
        <Text
          fontSize={isMobile ? "xs" : "lg"}
          fontWeight="black"
          color="white"
          textTransform="uppercase"
          letterSpacing={isMobile ? "0" : "0.02em"}
          lineHeight={1.1}
          lineClamp={1}
        >
          {!flat && accent && (
            <Box as="span" color={accent} mr={1}>
              ▸
            </Box>
          )}
          {title}
        </Text>
      </Flex>
    </Box>
    <Box flex={isMobile ? "unset" : 1} overflow={isMobile ? "visible" : "hidden"} px={isMobile ? 2 : { base: 3, lg: 4 }} py={isMobile ? 2 : { base: 2.5, lg: 3 }} position="relative" zIndex={1}>
      {children}
    </Box>
  </Box>
  );
};

export const PctBox = ({ label, pct, color }) => (
  <Box
    bg={`${color}1F`}
    border="1px solid"
    borderColor={`${color}44`}
    borderRadius="md"
    px={2}
    py={2}
    textAlign="center"
  >
    <Text fontSize="2xl" fontWeight="black" lineHeight={1} style={{ color }}>
      {pct}%
    </Text>
    <Text fontSize="xs" fontWeight="bold" color="text.muted" mt={1}>
      {label}
    </Text>
  </Box>
);

export const DonutChart = ({ segments, size = "9rem", thickness = "1.5rem", hollow = true }) => {
  let cumulative = 0;
  const stops = segments
    .map((seg) => {
      const start = cumulative;
      cumulative += seg.pct;
      return `${seg.color} ${start}% ${cumulative}%`;
    })
    .join(", ");

  return (
    <Box position="relative" boxSize={size} flexShrink={0}>
      <Box boxSize="100%" borderRadius="full" style={{ background: `conic-gradient(${stops})` }} />
      {hollow && (
        <Flex
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          boxSize={`calc(${size} - ${thickness} * 2)`}
          borderRadius="full"
          bg="bg.secondary"
          align="center"
          justify="center"
        >
          <Text fontSize="0.6rem" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.08em">
            Roster
          </Text>
        </Flex>
      )}
    </Box>
  );
};

export const DeltaTag = ({ value, avgValue, avgLabel }) => {
  const delta = Math.round(value - avgValue);
  if (!Number.isFinite(delta) || delta === 0) {
    return (
      <Text fontSize="sm" fontWeight="bold" color="text.muted" whiteSpace="nowrap">
        Even w/ {avgLabel} avg
      </Text>
    );
  }
  const up = delta > 0;
  return (
    <Flex align="center" gap={1} flexShrink={0}>
      {up ? <TrendingUp size={15} color="#48BB78" /> : <TrendingDown size={15} color="#F56565" />}
      <Text fontSize="sm" fontWeight="black" color={up ? "#48BB78" : "#F56565"} whiteSpace="nowrap">
        {up ? "+" : ""}{delta} vs {avgLabel} avg
      </Text>
    </Flex>
  );
};
