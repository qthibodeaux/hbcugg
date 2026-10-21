import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { BURNT, FOREST, TEAL, TEAM_BY_V5, n1, shortOf } from "./ddModel";

// Slide 6 — where 3rd down starts: each team's 3rd downs split into 1-2, 3-6
// and 7+ to go, drawn as shares of the row, sorted by the 7+ share. The
// average distance sits at the end of the row.

const ROW_COLS = "150px minmax(0,1fr) 110px";
const INK = { short: FOREST, medium: TEAL, long: BURNT };

export const DDStacked = ({ slide }) => {
  const c = slide.chart;
  const rows = [...slide.points].sort((a, b) => b.long_share_pct - a.long_share_pct);
  const anyHl = rows.some((p) => p.highlight);

  return (
    <Flex direction="column" h="100%" minH={0}>
      <Grid templateColumns={ROW_COLS} columnGap="14px" alignItems="end" pb="10px" borderBottom="1px solid rgba(255,255,255,0.14)">
        <Box />
        <Flex align="center" gap="18px">
          {c.segments.map((s) => (
            <Flex key={s.key} align="center" gap="6px">
              <Box w="14px" h="14px" borderRadius="3px" bg={INK[s.key]} />
              <Text fontSize="13px" fontWeight="900" color="rgba(255,255,255,0.75)" textTransform="uppercase" letterSpacing="0.08em">{s.label}</Text>
            </Flex>
          ))}
        </Flex>
        <Text fontSize="13px" fontWeight="900" color="rgba(255,255,255,0.55)" textTransform="uppercase" letterSpacing="0.08em" textAlign="right">
          Avg ({c.reference ? `SWAC ${n1(c.reference.value)}` : "to go"})
        </Text>
      </Grid>

      <Flex direction="column" flex={1} minH={0}>
        {rows.map((p) => {
          const total = c.segments.reduce((n, s) => n + (p[s.key] ?? 0), 0) || 1;
          return (
            <Grid key={p.team_id} flex={1} minH="34px" templateColumns={ROW_COLS} columnGap="14px" alignItems="center" borderBottom="1px solid rgba(255,255,255,0.05)" opacity={anyHl && !p.highlight ? 0.42 : 1}>
              <Flex align="center" gap="10px" minW={0}>
                <Image src={TEAM_BY_V5[p.team_id]?.logo} alt="" w="34px" h="34px" objectFit="contain" flexShrink={0} />
                <Text fontSize="19px" fontWeight="900" color="white" textTransform="uppercase" whiteSpace="nowrap">{shortOf(p.team_id)}</Text>
              </Flex>
              <Flex h="62%" maxH="32px" borderRadius="4px" overflow="hidden">
                {c.segments.map((s) => {
                  const share = (p[s.key] ?? 0) / total;
                  return (
                    <Flex key={s.key} align="center" justify="center" bg={INK[s.key]} style={{ width: `${share * 100}%` }}>
                      {share >= 0.12 && <Text fontSize="15px" fontWeight="950" color="white">{Math.round(share * 100)}%</Text>}
                    </Flex>
                  );
                })}
              </Flex>
              <Text fontSize="20px" fontWeight="950" color="white" fontVariantNumeric="tabular-nums" textAlign="right" whiteSpace="nowrap">3rd & {n1(p.avg_to_go)}</Text>
            </Grid>
          );
        })}
      </Flex>
    </Flex>
  );
};
