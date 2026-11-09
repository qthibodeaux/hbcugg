import { Box, Text, Flex, Grid } from "@chakra-ui/react";
import { Kicker } from "../analyticsTabs/AnalyticsPrimitives";
import { rushBreakdownPalette, n0, pct, signed2, POSITIVE, NEGATIVE } from "./phasePresentation";
import { TargetFace } from "./PhasePrimitives";

const RushingMapMetric = ({ value, label, accent = "white", big = false }) => (
  <Box minW={0}>
    <Text
      fontSize={big ? "clamp(1rem, 1.95vw, 1.5rem)" : "clamp(0.8rem, 1.28vw, 0.96rem)"}
      fontWeight="900" fontStyle="italic" color={accent} lineHeight={0.92}
      letterSpacing={big ? "-0.04em" : "-0.03em"} fontVariantNumeric="tabular-nums" lineClamp={1}
    >
      {value}
    </Text>
    <Kicker color="whiteAlpha.400" mt={big ? 0.15 : 0.05} fontSize="0.36rem">{label}</Kicker>
  </Box>
);

const RushingLaneBreakdown = ({ lane, maxLost, maxPositive, teamColors }) => {
  const colors = rushBreakdownPalette(teamColors);
  const totalSpan = Math.max(1, maxLost + maxPositive);
  const zeroPct = (maxLost / totalSpan) * 100;
  const lostPct = ((lane.lostYards ?? 0) / totalSpan) * 100;
  const linePct = ((lane.lineYards ?? 0) / totalSpan) * 100;
  const highlightPct = ((lane.highlightYards ?? 0) / totalSpan) * 100;

  return (
    <Box minW={0} mt={0.45}>
      <Flex justify="space-between" align="center" gap={2} mb={0.45}>
        <Kicker color="whiteAlpha.650" fontSize="0.54rem">Yard Makeup</Kicker>
      </Flex>

      <Grid templateColumns="repeat(3, minmax(0,1fr))" gap={0.8} mb={0.45}>
        <Box minW={0}>
          <Text fontSize="1.02rem" fontWeight="900" fontStyle="italic" color={colors.lost} lineHeight={0.95} fontVariantNumeric="tabular-nums" lineClamp={1}>-{n0(lane.lostYards)}</Text>
          <Kicker color="whiteAlpha.500" mt={0.08} fontSize="0.42rem">Lost</Kicker>
        </Box>
        <Box minW={0}>
          <Text fontSize="1.02rem" fontWeight="900" fontStyle="italic" color={colors.line} lineHeight={0.95} fontVariantNumeric="tabular-nums" lineClamp={1}>{n0(lane.lineYards)}</Text>
          <Kicker color="whiteAlpha.500" mt={0.08} fontSize="0.42rem">Line-Created</Kicker>
        </Box>
        <Box minW={0}>
          <Text fontSize="1.02rem" fontWeight="900" fontStyle="italic" color={colors.highlight} lineHeight={0.95} fontVariantNumeric="tabular-nums" lineClamp={1}>{n0(lane.highlightYards)}</Text>
          <Kicker color="whiteAlpha.500" mt={0.08} fontSize="0.42rem">Highlight</Kicker>
        </Box>
      </Grid>

      <Box position="relative" h="1.6rem" borderTop="1px solid" borderColor="whiteAlpha.100" pt={0.42}>
        <Box position="absolute" left={0} right={0} top="1rem" h="0.5rem" bg="whiteAlpha.50" borderRadius="full" />
        <Box position="absolute" left={`${Math.max(0, zeroPct - lostPct)}%`} top="1rem" w={`${lostPct}%`} h="0.5rem" bg={colors.lost} borderTopLeftRadius="full" borderBottomLeftRadius="full" />
        <Box position="absolute" left={`${zeroPct}%`} top="1rem" w={`${linePct}%`} h="0.5rem" bg={colors.line} />
        <Box position="absolute" left={`${Math.min(100, zeroPct + linePct)}%`} top="1rem" w={`${highlightPct}%`} h="0.5rem" bg={colors.highlight} borderTopRightRadius="full" borderBottomRightRadius="full" />
        <Box position="absolute" left={`${zeroPct}%`} top="0.52rem" bottom="0.02rem" w="1px" bg="whiteAlpha.600" />
        <Kicker position="absolute" left={`${zeroPct}%`} top="0" transform="translateX(-50%)" color="whiteAlpha.500" fontSize="0.42rem">LOS</Kicker>
      </Box>

      <Flex justify="space-between" align="center" mt={0.28}>
        <Kicker color="whiteAlpha.500" fontSize="0.5rem">{lane.label.toUpperCase()} · {lane.att} CAR</Kicker>
        <Kicker color="whiteAlpha.400" fontSize="0.42rem">LOS</Kicker>
      </Flex>
    </Box>
  );
};

export const RushLaneMap = ({ lanes, leaders, side, teamColors }) => {
  const maxLost = Math.max(...lanes.map((l) => l.lostYards ?? 0), 1);
  const maxPositive = Math.max(...lanes.map((l) => (l.lineYards ?? 0) + (l.highlightYards ?? 0)), 1);
  return (
    <Grid templateColumns="repeat(3, minmax(0,1fr))" gap={2}>
      {lanes.map((lane) => (
        <Box
          key={lane.key} align="stretch" gap={1.2} px={1.5} py={1.5} borderRadius="sm"
          bg="rgba(255,255,255,0.04)" border="1px solid" borderColor="whiteAlpha.100"
          position="relative" overflow="hidden" minH={{ base: "6.35rem", md: "6.85rem" }}
        >
            <Flex align="stretch" gap={1.2}>
              <Grid flex="1.34" minW={0} templateColumns="minmax(0,1.12fr) minmax(0,0.88fr) minmax(0,0.12fr)" gap={1} alignItems="stretch">
                <Flex direction="column" justify="space-between" minW={0}>
                  <RushingMapMetric value={lane.ypc.toFixed(2)} label="YPC" big />
                  <Grid templateColumns="repeat(3, minmax(0,1fr))" gap={0.75} mt={0.5}>
                    <RushingMapMetric value={`${lane.att}`} label="Lane Car" />
                    <RushingMapMetric value={`${lane.yards}`} label="Lane Yds" />
                    <RushingMapMetric value={pct(lane.stuff)} label="Stuff %" />
                  </Grid>
                </Flex>
                <Flex direction="column" justify="space-between" minW={0}>
                  <RushingMapMetric value={signed2(lane.epa)} label="EPA / Rush" accent={lane.epa >= 0 ? POSITIVE : NEGATIVE} />
                  <RushingMapMetric value={signed2(Number.isFinite(lane.epa) && Number.isFinite(lane.att) ? lane.epa * lane.att : undefined)} label="EPA Total" accent={lane.epa >= 0 ? POSITIVE : NEGATIVE} />
                  <RushingMapMetric value={pct(lane.success)} label="Success Rate" accent={lane.success >= 0.5 ? POSITIVE : "white"} />
                </Flex>
                <Flex align="center" justify="center" minW={0}>
                  <Text
                    fontSize="0.5rem" fontWeight="900" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.12em"
                    style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                  >
                    {side === "offense" ? "Rushers" : "Run Fit"}
                  </Text>
                </Flex>
              </Grid>

              {(leaders?.[lane.key] ?? []).length > 0 && (
                <>
                  <Box alignSelf="stretch" w="1px" bg="whiteAlpha.200" flexShrink={0} />
                  <Flex flex="0.82" minW={0}>
                    <Grid templateColumns="repeat(3, minmax(0,1fr))" gap="0.22rem" flex="1" alignItems="start" minH={{ base: "4.1rem", md: "4.8rem" }}>
                      {(leaders?.[lane.key] ?? []).map((p) => <TargetFace key={`${lane.key}-${p.id}`} player={p} />)}
                    </Grid>
                  </Flex>
                </>
              )}
            </Flex>

          <Box mt={0.75}>
            <RushingLaneBreakdown lane={lane} maxLost={maxLost} maxPositive={maxPositive} teamColors={teamColors} />
          </Box>
        </Box>
      ))}
    </Grid>
  );
};
