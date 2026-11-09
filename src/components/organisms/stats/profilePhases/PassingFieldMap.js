import { Box, Text, Flex, Grid } from "@chakra-ui/react";
import { Kicker } from "../analyticsTabs/AnalyticsPrimitives";
import { PASS_DEPTHS, PASS_DIRECTIONS } from "../../../../pages/analytics/teamProfileMetrics";
import { epaFill, n0, signed2, POSITIVE, NEGATIVE, pct } from "./phasePresentation";
import { TargetFace } from "./PhasePrimitives";

const PassingMapMetric = ({ value, label, accent = "white", big = false }) => (
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

const PassingMapMiniMetric = ({ value, label, accent = "white" }) => (
  <Box minW={0}>
    <Text
      fontSize="clamp(0.8rem, 1.28vw, 0.96rem)" fontWeight="900" fontStyle="italic" color={accent}
      lineHeight={0.95} letterSpacing="-0.03em" fontVariantNumeric="tabular-nums" lineClamp={1}
    >
      {value}
    </Text>
    <Kicker color="whiteAlpha.400" mt={0.05} fontSize="0.36rem">{label}</Kicker>
  </Box>
);

export const PassFieldMap = ({ grid, targets, side }) => (
  <Box>
    <Flex gap={2} align="stretch">
      <Flex direction="column" justify="space-around" py="2px" flexShrink={0}>
        {PASS_DEPTHS.map((d) => (
          <Box key={d.key} textAlign="right">
            <Text fontSize="9px" fontWeight="900" color="whiteAlpha.700" textTransform="uppercase" lineHeight={1}>{d.label}</Text>
            <Text fontSize="8px" color="whiteAlpha.400" lineHeight={1.3}>{d.range}</Text>
          </Box>
        ))}
      </Flex>
      <Box position="relative" flex="1" minW={0}>
        <Box position="absolute" inset={0} borderRadius="md" bg="linear-gradient(180deg, #14301a 0%, #0b1c0f 100%)" border="1px solid" borderColor="whiteAlpha.200" />
        <Grid position="relative" templateColumns="repeat(3, minmax(0,1fr))" templateRows="repeat(3, minmax(0,1fr))" gap="3px" p="3px">
          {PASS_DEPTHS.map((d) =>
            PASS_DIRECTIONS.map((dir) => {
              const cell = grid[d.key][dir.key];
              const faces = targets?.[d.key]?.[dir.key] ?? [];
              return (
                <Flex
                  key={`${d.key}-${dir.key}`} align="stretch" gap={1.2} px={1.5} py={1.5} borderRadius="sm"
                  bg={epaFill(cell.epa)} border="1px solid" borderColor="whiteAlpha.100"
                  minH={{ base: "5.1rem", md: "5.7rem" }}
                >
                  <Grid flex="1.34" minW={0} templateColumns="minmax(0,1.12fr) minmax(0,0.88fr) minmax(0,0.12fr)" gap={1} alignItems="stretch">
                    <Flex direction="column" justify="space-between" minW={0}>
                      <PassingMapMetric value={`${cell.comp}/${cell.att}`} label="Comp / Att" big />
                      <Grid templateColumns="repeat(3, minmax(0,1fr))" gap={0.75} mt={0.5}>
                        <PassingMapMiniMetric value={`${cell.yards}`} label="Yds" />
                        <PassingMapMiniMetric value={n0(cell.td)} label="TDs" />
                        <PassingMapMiniMetric value={n0(cell.int)} label="INTs" />
                      </Grid>
                    </Flex>
                    <Flex direction="column" justify="space-between" minW={0}>
                      <PassingMapMetric value={signed2(cell.epa)} label="EPA / Play" accent={cell.epa >= 0 ? POSITIVE : NEGATIVE} />
                      <PassingMapMetric value={signed2(Number.isFinite(cell.epa) && Number.isFinite(cell.att) ? cell.epa * cell.att : undefined)} label="EPA Total" accent={cell.epa >= 0 ? POSITIVE : NEGATIVE} />
                      <PassingMapMetric value={pct(cell.success)} label="Success Rate" accent={cell.success >= 0.5 ? POSITIVE : "white"} />
                    </Flex>
                    <Flex align="center" justify="center" minW={0}>
                      <Text
                        fontSize="0.42rem" fontWeight="900" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.12em"
                        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                      >
                        {side === "offense" ? "Targets" : "Coverage"}
                      </Text>
                    </Flex>
                  </Grid>

                  {faces.length > 0 && (
                    <>
                      <Box alignSelf="stretch" w="1px" bg="whiteAlpha.200" flexShrink={0} />
                      <Flex flex="0.96" minW={0}>
                        <Grid templateColumns="repeat(3, minmax(0,1fr))" gap="0.22rem" flex="1" alignItems="start" minH={{ base: "4.1rem", md: "4.8rem" }}>
                          {faces.map((p) => <TargetFace key={p.id} player={p} />)}
                        </Grid>
                      </Flex>
                    </>
                  )}
                </Flex>
              );
            }),
          )}
        </Grid>
      </Box>
    </Flex>
    <Flex justify="center" gap={10} mt={2}>
      {PASS_DIRECTIONS.map((d) => <Kicker key={d.key} color="whiteAlpha.400">{d.label}</Kicker>)}
    </Flex>
  </Box>
);
