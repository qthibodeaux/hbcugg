import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { PURPLE, RED, TEAM_BY_V5, n1, pct0, shortOf } from "./ddModel";

// Horizontal bars, one row per team, sorted — slides 1 (first snap) and 3
// (2nd & long). Every bar is our purple; anything else the slide carries (lost
// yards, run rate, sample) is a number column at the end, so a muted team and a
// bar colour never get confused. The rows share the box's height, so the chart
// fills whatever it is given (page card or 1200px poster). A dashed line marks
// the SWAC average. Highlighted teams draw at full strength; the rest mute.

const SPEC = {
  first_snap: {
    value: (p) => p.opener_yards,
    valueText: (p) => n1(p.opener_yards),
    refText: n1,
    sides: [{ head: "Lose yards", cell: (p) => pct0(p.opener_negative_pct), ink: RED }],
  },
  climb_back: {
    value: (p) => p.back_on_schedule_pct,
    valueText: (p) => pct0(p.back_on_schedule_pct),
    refText: pct0,
    sides: [
      { head: "Run %", cell: (p) => pct0(p.run_rate_pct), ink: "rgba(255,255,255,0.85)" },
      { head: "2nd & 7+", cell: (p) => `${p.second_and_long}`, ink: "rgba(255,255,255,0.6)" },
    ],
  },
};

export const DDBars = ({ slide }) => {
  const spec = SPEC[slide.id];
  const c = slide.chart;
  const cols = `150px minmax(0,1fr) 70px ${spec.sides.map(() => "92px").join(" ")}`;
  const rows = [...slide.points].sort((a, b) => spec.value(b) - spec.value(a));
  const ref = c.value?.reference;
  const max = Math.max(...rows.map(spec.value), ref?.value ?? 0) * 1.08;
  const at = (v) => `${(v / max) * 100}%`;
  const anyHl = rows.some((p) => p.highlight);
  const headText = { fontSize: "13px", fontWeight: "900", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right" };

  return (
    <Flex direction="column" h="100%" minH={0}>
      <Grid templateColumns={cols} columnGap="14px" alignItems="end" pb="10px" borderBottom="1px solid rgba(255,255,255,0.14)">
        <Box />
        {/* The measure on its own line, never cut; the average under it. */}
        <Box minW={0}>
          <Text fontSize="14px" fontWeight="900" color="rgba(255,255,255,0.8)" textTransform="uppercase" letterSpacing="0.08em" mb="6px">{c.value.label}</Text>
          {ref && (
            <Flex align="center" gap="6px">
              <Box w="16px" borderTop="2px dashed rgba(255,255,255,0.7)" />
              <Text fontSize="12px" fontWeight="900" color="rgba(255,255,255,0.7)" textTransform="uppercase" letterSpacing="0.06em" whiteSpace="nowrap">
                {ref.label} {spec.refText(ref.value)}
              </Text>
            </Flex>
          )}
        </Box>
        <Box />
        {spec.sides.map((sd) => <Text key={sd.head} {...headText}>{sd.head}</Text>)}
      </Grid>

      <Box position="relative" flex={1} minH={0}>
        <Flex direction="column" h="100%">
          {rows.map((p) => (
            <Grid key={p.team_id} flex={1} minH="34px" templateColumns={cols} columnGap="14px" alignItems="center" borderBottom="1px solid rgba(255,255,255,0.05)" opacity={anyHl && !p.highlight ? 0.42 : 1}>
              <Flex align="center" gap="10px" minW={0}>
                <Image src={TEAM_BY_V5[p.team_id]?.logo} alt="" w="34px" h="34px" objectFit="contain" flexShrink={0} />
                <Text fontSize="19px" fontWeight="900" color="white" textTransform="uppercase" whiteSpace="nowrap">{shortOf(p.team_id)}</Text>
              </Flex>
              <Box position="relative" h="62%" maxH="30px">
                <Box position="absolute" left={0} top={0} bottom={0} borderRadius="0 4px 4px 0" bg={PURPLE} style={{ width: at(spec.value(p)) }} />
              </Box>
              <Text fontSize="22px" fontWeight="950" color="white" fontVariantNumeric="tabular-nums" textAlign="right">{spec.valueText(p)}</Text>
              {spec.sides.map((sd) => (
                <Text key={sd.head} fontSize="18px" fontWeight="900" color={sd.ink} fontVariantNumeric="tabular-nums" textAlign="right">{sd.cell(p)}</Text>
              ))}
            </Grid>
          ))}
        </Flex>
        {/* SWAC average, across the bar column only. */}
        {ref && (
          <Grid position="absolute" inset={0} templateColumns={cols} columnGap="14px" pointerEvents="none">
            <Box />
            <Box position="relative">
              <Box position="absolute" top={0} bottom={0} borderLeft="2px dashed rgba(255,255,255,0.6)" style={{ left: at(ref.value) }} />
            </Box>
          </Grid>
        )}
      </Box>
    </Flex>
  );
};
