import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { PURPLE, TEAM_BY_V5, pct0, shortOf } from "./ddModel";

// Slide 2 — 1st-down shots as a dot strip: one row per team, one dot per throw
// of 20+ air yards, the completed ones filled. The share of the team's 1st-down
// throws that were shots sits at the end. Rows share the box's height.

const ROW_COLS = "150px minmax(0,1fr) 84px";

export const DDDots = ({ slide }) => {
  const rows = [...slide.points].sort((a, b) => b.shots - a.shots || b.shots_completed - a.shots_completed);
  const most = Math.max(...rows.map((p) => p.shots), 1);
  const anyHl = rows.some((p) => p.highlight);
  const sum = slide.summary;

  return (
    <Flex direction="column" h="100%" minH={0}>
      <Grid templateColumns={ROW_COLS} columnGap="14px" alignItems="end" pb="10px" borderBottom="1px solid rgba(255,255,255,0.14)">
        <Box />
        <Flex align="center" gap="16px">
          <Flex align="center" gap="6px"><Box w="14px" h="14px" borderRadius="full" bg={PURPLE} /><Text fontSize="13px" fontWeight="900" color="rgba(255,255,255,0.75)" textTransform="uppercase" letterSpacing="0.08em">Completed</Text></Flex>
          <Flex align="center" gap="6px"><Box w="14px" h="14px" borderRadius="full" border={`2px solid ${PURPLE}`} /><Text fontSize="13px" fontWeight="900" color="rgba(255,255,255,0.75)" textTransform="uppercase" letterSpacing="0.08em">Incomplete</Text></Flex>
          {sum && <Text fontSize="13px" fontWeight="900" color="rgba(255,255,255,0.5)" textTransform="uppercase" letterSpacing="0.08em">SWAC: {sum.swac_completed} of {sum.swac_shots}</Text>}
        </Flex>
        <Text fontSize="13px" fontWeight="900" color="rgba(255,255,255,0.55)" textTransform="uppercase" letterSpacing="0.08em" textAlign="right">Shot rate</Text>
      </Grid>

      <Flex direction="column" flex={1} minH={0}>
        {rows.map((p) => (
          <Grid key={p.team_id} flex={1} minH="34px" templateColumns={ROW_COLS} columnGap="14px" alignItems="center" borderBottom="1px solid rgba(255,255,255,0.05)" opacity={anyHl && !p.highlight ? 0.42 : 1}>
            <Flex align="center" gap="10px" minW={0}>
              <Image src={TEAM_BY_V5[p.team_id]?.logo} alt="" w="34px" h="34px" objectFit="contain" flexShrink={0} />
              <Text fontSize="19px" fontWeight="900" color="white" textTransform="uppercase" whiteSpace="nowrap">{shortOf(p.team_id)}</Text>
            </Flex>
            {/* Dots on a shared scale, so a row's length is its count. */}
            <Flex align="center" gap="0" minW={0}>
              {Array.from({ length: p.shots }, (_, i) => (
                <Box key={i} flexShrink={0} style={{ width: `${100 / most}%`, maxWidth: "36px" }} display="flex" justifyContent="center">
                  <Box w="22px" h="22px" borderRadius="full" bg={i < p.shots_completed ? PURPLE : "transparent"} border={`2.5px solid ${PURPLE}`} />
                </Box>
              ))}
              {p.shots === 0 && <Text fontSize="16px" fontWeight="800" color="rgba(255,255,255,0.4)">0</Text>}
            </Flex>
            <Text fontSize="20px" fontWeight="950" color="white" fontVariantNumeric="tabular-nums" textAlign="right">{pct0(p.shot_rate_pct)}</Text>
          </Grid>
        ))}
      </Flex>
    </Flex>
  );
};
