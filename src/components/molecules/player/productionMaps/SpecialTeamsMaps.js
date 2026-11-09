// Existing season-based estimates are preserved. These displays are not backed by observed kick-distance or punt-position buckets.
import { clamp, metric } from "./playerMapModel";
import { Flex, Box, Text, Grid } from "@chakra-ui/react";

export const KickDistanceMap = ({ player, primary, secondary }) => {
  const signal = Math.max(0, Number(player?.total_production ?? player?.par ?? 5));

  const ranges = [
    { label: "0-29", made: clamp(3 + signal * 0.2, 0, 10), att: clamp(4 + signal * 0.25, 1, 12) },
    { label: "30-39", made: clamp(2 + signal * 0.15, 0, 8), att: clamp(3 + signal * 0.2, 1, 10) },
    { label: "40-49", made: clamp(1 + signal * 0.12, 0, 6), att: clamp(2 + signal * 0.18, 1, 8) },
    { label: "50+", made: clamp(0 + signal * 0.08, 0, 4), att: clamp(1 + signal * 0.12, 1, 6) },
  ];

  return (
    <Flex direction="column" h="full" w="full" p="0.4rem">
      <Flex align="center" gap="0.3rem" mb="0.3rem">
        <Box w="3px" h="10px" bg={primary} borderRadius="sm" />
        <Text fontSize="0.52rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.06em">
          Kick Distance Chart
        </Text>
      </Flex>

      <Flex direction="column" gap="0.3rem" flex={1} justify="center">
        {ranges.map((r) => {
          const pct = r.att > 0 ? (r.made / r.att) * 100 : 0;
          return (
            <Flex key={r.label} align="center" gap="0.4rem">
              <Text fontSize="clamp(8px, 0.65vw, 10px)" fontWeight="900" color="text.secondary" w="2.2rem" textTransform="uppercase" textAlign="right">
                {r.label}
              </Text>
              <Box flex={1} h="0.55rem" bg="rgba(255,255,255,0.08)" borderRadius="sm" overflow="hidden" position="relative">
                <Box h="full" w={`${clamp(pct, 5, 100)}%`} bg={pct >= 75 ? "#68D391" : pct >= 50 ? secondary : primary} borderRadius="sm" />
              </Box>
              <Text fontSize="clamp(8px, 0.65vw, 10px)" fontWeight="900" color="white" w="2.5rem" textAlign="right">
                {r.made}/{r.att}
              </Text>
            </Flex>
          );
        })}
      </Flex>

      <Flex justify="space-between" mt="0.3rem" px="0.2rem">
        {[
          { label: "FG%", value: `${metric(ranges.reduce((s, r) => s + r.made, 0) / ranges.reduce((s, r) => s + r.att, 0) * 100, 1)}%` },
          { label: "LONG", value: `${clamp(38 + signal * 2, 30, 58)}` },
          { label: "XP", value: `${clamp(20 + signal * 2, 15, 45)}/${clamp(22 + signal * 2, 18, 48)}` },
        ].map((s) => (
          <Box key={s.label} textAlign="center">
            <Text fontSize="clamp(7px, 0.55vw, 9px)" color="text.muted" fontWeight="800" textTransform="uppercase">{s.label}</Text>
            <Text fontSize="clamp(10px, 0.85vw, 13px)" color="white" fontWeight="950">{s.value}</Text>
          </Box>
        ))}
      </Flex>
    </Flex>
  );
};

export const PuntFieldPositionMap = ({ player, primary, secondary }) => {
  const signal = Math.max(0, Number(player?.total_production ?? player?.par ?? 5));

  const stats = {
    punts: clamp(25 + signal * 2, 15, 60),
    inside20: clamp(8 + signal * 0.8, 3, 25),
    inside10: clamp(4 + signal * 0.4, 1, 12),
    inside5: clamp(2 + signal * 0.2, 0, 6),
    touchbacks: clamp(3 + signal * 0.15, 0, 8),
    fairCatch: clamp(10 + signal * 0.5, 5, 20),
    avgYards: clamp(38 + signal * 0.6, 32, 48),
    netYards: clamp(35 + signal * 0.5, 28, 44),
  };

  return (
    <Flex direction="column" h="full" w="full" p="0.4rem">
      <Flex align="center" gap="0.3rem" mb="0.3rem">
        <Box w="3px" h="10px" bg={primary} borderRadius="sm" />
        <Text fontSize="0.52rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.06em">
          Punt Field Position
        </Text>
      </Flex>

      {/* Field visualization */}
      <Box flex={1} position="relative" bg="rgba(255,255,255,0.025)" border="1px solid rgba(255,255,255,0.07)" borderRadius="sm" overflow="hidden" mb="0.3rem">
        {/* Yard markers */}
        {[20, 40, 60, 80].map((m) => (
          <Box key={m} position="absolute" top="0" bottom="0" left={`${m}%`} w="1px" bg="rgba(255,255,255,0.08)" />
        ))}

        {/* Bars */}
        <Flex direction="column" justify="center" h="full" gap="0.25rem" px="0.4rem">
          {[
            { label: "Inside 20", value: stats.inside20, max: stats.punts, color: "#68D391" },
            { label: "Inside 10", value: stats.inside10, max: stats.punts, color: secondary },
            { label: "Inside 5", value: stats.inside5, max: stats.punts, color: primary },
            { label: "Touchbacks", value: stats.touchbacks, max: stats.punts, color: "#F56565" },
            { label: "Fair Catch", value: stats.fairCatch, max: stats.punts, color: "#63B3ED" },
          ].map((bar) => (
            <Flex key={bar.label} align="center" gap="0.3rem">
              <Text fontSize="clamp(6px, 0.5vw, 8px)" fontWeight="800" color="text.muted" textTransform="uppercase" w="3.2rem" textAlign="right">
                {bar.label}
              </Text>
              <Box flex={1} h="0.4rem" bg="rgba(255,255,255,0.08)" borderRadius="sm" overflow="hidden">
                <Box h="full" w={`${clamp((bar.value / bar.max) * 100, 5, 100)}%`} bg={bar.color} borderRadius="sm" />
              </Box>
              <Text fontSize="clamp(7px, 0.55vw, 9px)" fontWeight="900" color="white" w="1.2rem" textAlign="right">
                {bar.value}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Box>

      {/* Bottom stats */}
      <Grid templateColumns="repeat(4, 1fr)" gap="0.3rem">
        {[
          { label: "PUNTS", value: stats.punts },
          { label: "AVG", value: `${stats.avgYards}` },
          { label: "NET", value: `${stats.netYards}` },
          { label: "FC%", value: `${metric((stats.fairCatch / stats.punts) * 100, 0)}%` },
        ].map((s) => (
          <Box key={s.label} textAlign="center" bg="rgba(255,255,255,0.04)" borderRadius="sm" py="0.2rem">
            <Text fontSize="clamp(6px, 0.5vw, 8px)" color="text.muted" fontWeight="800" textTransform="uppercase">{s.label}</Text>
            <Text fontSize="clamp(10px, 0.8vw, 12px)" color="white" fontWeight="950">{s.value}</Text>
          </Box>
        ))}
      </Grid>
    </Flex>
  );
};

export const SpecialTeamsGenericMap = ({ player, primary, secondary }) => {
  const signal = Math.max(0, Number(player?.total_production ?? player?.par ?? 5));

  return (
    <Flex direction="column" h="full" w="full" p="0.4rem">
      <Flex align="center" gap="0.3rem" mb="0.3rem">
        <Box w="3px" h="10px" bg={primary} borderRadius="sm" />
        <Text fontSize="0.52rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.06em">
          Special Teams Impact
        </Text>
      </Flex>

      <Flex direction="column" gap="0.35rem" flex={1} justify="center">
        {[
          { label: "CONTROL", value: clamp(40 + signal, 0, 99) },
          { label: "FIELD POS", value: clamp(32 + signal * 1.2, 0, 99) },
          { label: "IMPACT", value: clamp(28 + signal * 1.5, 0, 99) },
          { label: "CONSISTENCY", value: clamp(35 + signal * 1.1, 0, 99) },
        ].map((item) => (
          <Flex key={item.label} align="center" gap="0.4rem">
            <Text fontSize="clamp(7px, 0.55vw, 9px)" fontWeight="900" color="text.muted" textTransform="uppercase" w="4.5rem" textAlign="right">
              {item.label}
            </Text>
            <Box flex={1} h="0.45rem" bg="rgba(255,255,255,0.08)" borderRadius="sm" overflow="hidden">
              <Box h="full" w={`${item.value}%`} bg={`linear-gradient(90deg, ${primary}, ${secondary})`} borderRadius="sm" />
            </Box>
            <Text fontSize="clamp(8px, 0.65vw, 10px)" fontWeight="900" color="white" w="1.5rem" textAlign="right">
              {metric(item.value, 0)}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};
