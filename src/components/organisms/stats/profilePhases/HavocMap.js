import { HAVOC_ZONES, HAVOC_TYPES } from "../../../../pages/analytics/teamProfileMetrics";
import { Box, Text, Flex } from "@chakra-ui/react";
import { Kicker } from "../analyticsTabs/AnalyticsPrimitives";

export const HavocMap = ({ zones }) => {
  const events = [];
  HAVOC_ZONES.forEach((zone, zi) => {
    const inZone = [];
    HAVOC_TYPES.forEach((t) => {
      for (let i = 0; i < zones[zone][t.key]; i += 1) inZone.push(t);
    });
    inZone.forEach((t, i) => {
      const x = (zi * 100) / 3 + ((i + 0.5) / inZone.length) * (100 / 3);
      const wobble = ((i * 37) % 11) / 11 - 0.5;
      events.push({ key: `${zone}-${t.key}-${i}`, x, depth: t.depth + wobble * t.spread, color: t.color });
    });
  });
  const depths = events.map((e) => e.depth);
  const lo = Math.min(-12, ...depths);
  const hi = Math.max(18, ...depths);
  const yFor = (d) => ((hi - d) / (hi - lo)) * 100;
  const totals = HAVOC_TYPES.map((t) => ({ ...t, count: HAVOC_ZONES.reduce((sum, z) => sum + zones[z][t.key], 0) }));

  return (
    <Box>
      <Box position="relative" h={{ base: "220px", md: "280px" }} borderRadius="md" overflow="hidden" bg="linear-gradient(180deg, #14301a 0%, #0b1c0f 100%)" border="1px solid" borderColor="whiteAlpha.200">
        <Box position="absolute" left={0} right={0} top={`${yFor(0)}%`} h="2px" bg="rgba(255,255,255,0.45)" />
        <Text position="absolute" left="6px" top={`calc(${yFor(0)}% + 4px)`} fontSize="8px" fontWeight="900" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.1em">
          Line of scrimmage
        </Text>
        <Box position="absolute" top={0} bottom={0} left="33.33%" w="1px" bg="whiteAlpha.100" />
        <Box position="absolute" top={0} bottom={0} left="66.66%" w="1px" bg="whiteAlpha.100" />
        {events.map((e) => (
          <Box key={e.key} position="absolute" left={`${e.x}%`} top={`${yFor(e.depth)}%`} transform="translate(-50%, -50%)" w="7px" h="7px" borderRadius="full" bg={e.color} opacity={0.85} />
        ))}
        <Flex position="absolute" left={0} right={0} bottom={0} justify="space-around" py={1.5} bg="blackAlpha.500">
          {HAVOC_ZONES.map((z) => <Kicker key={z} color="whiteAlpha.500">{z}</Kicker>)}
        </Flex>
      </Box>
      <Flex gap={4} wrap="wrap" mt={3}>
        {totals.map((t) => (
          <Flex key={t.key} align="center" gap={1.5}>
            <Box w="8px" h="8px" borderRadius="full" bg={t.color} />
            <Kicker color="whiteAlpha.600">{t.label}</Kicker>
            <Text fontSize="11px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">{t.count}</Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
};
