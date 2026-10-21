import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { PURPLE, TEAM_BY_V5, shortOf } from "./ddModel";

// Slide 4 — 2nd & short as a stat card: the two numbers side by side (snaps,
// deep shots), the league line under them, then a strip of every team's own
// count. The contrast between the two numbers is the image.

export const DDStatCard = ({ slide }) => {
  const h = slide.chart.headline;
  const rows = [...slide.points].sort((a, b) => b.shots - a.shots || b.second_and_short - a.second_and_short);
  const anyHl = rows.some((p) => p.highlight);
  return (
    <Flex direction="column" h="100%" minH={0} justify="space-between" gap="24px">
      <Grid templateColumns="1fr 1fr" gap="24px" flex={1} alignItems="center">
        {[[h.big, h.big_label, "white"], [h.small, h.small_label, PURPLE]].map(([n, label, ink]) => (
          <Box key={label} textAlign="center">
            <Text fontSize="190px" fontWeight="950" fontStyle="italic" color={ink} lineHeight={0.9} letterSpacing="-0.04em" fontVariantNumeric="tabular-nums">{n}</Text>
            <Text mt="14px" fontSize="24px" fontWeight="900" color="rgba(255,255,255,0.8)" textTransform="uppercase" letterSpacing="0.06em">{label}</Text>
          </Box>
        ))}
      </Grid>
      {slide.chart.sub && <Text textAlign="center" fontSize="22px" fontWeight="800" color="rgba(255,255,255,0.65)">{slide.chart.sub}</Text>}
      <Grid templateColumns={`repeat(${rows.length}, minmax(0,1fr))`} gap="6px">
        {rows.map((p) => (
          <Flex key={p.team_id} direction="column" align="center" gap="4px" py="10px" bg="rgba(255,255,255,0.04)" borderRadius="6px" opacity={anyHl && !p.highlight ? 0.45 : 1}>
            <Image src={TEAM_BY_V5[p.team_id]?.logo} alt="" w="34px" h="34px" objectFit="contain" />
            <Text fontSize="13px" fontWeight="900" color="white" textTransform="uppercase">{shortOf(p.team_id)}</Text>
            <Text fontSize="22px" fontWeight="950" color={PURPLE} lineHeight={1}>{p.shots}</Text>
            <Text fontSize="12px" fontWeight="800" color="rgba(255,255,255,0.5)">of {p.second_and_short}</Text>
          </Flex>
        ))}
      </Grid>
    </Flex>
  );
};
