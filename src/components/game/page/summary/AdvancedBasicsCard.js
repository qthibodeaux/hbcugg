import { getTeamAccent, getTeamLogoSrc, getTeamLabel } from "../../../../utils/gameSummary/teamIdentity";
import { useMetricBlocks } from "../../../../hooks/useGameSummaryMetrics";
import { metricInk, metricShade, KEY_META, fInt } from "../../../../utils/gameSummary/metricsModel";
import { EditorialCard } from "./SummaryPrimitives";
import { Box, Flex, Text, Grid, Image } from "@chakra-ui/react";

// Extracted from GameSummaryTabV2; statistical semantics and layout are unchanged.

// Six tracks. The label column gets a little over one and a half so a logo and an
// abbreviation fit beside each other; the five metric columns share the rest evenly and
// every one is minmax(0, …) so a long value can never widen its own column.
const BASICS_COLS = "minmax(0, 1.65fr) repeat(5, minmax(0, 1fr))";

export const AdvancedBasicsCard = ({ awayId, homeId, drives, plays, teamStats, advancedBasics, leagueAvg }) => {
  const accent = getTeamAccent(awayId);
  const blocks = useMetricBlocks({ awayId, homeId, drives, plays, teamStats, advancedBasics, leagueAvg });
  const inkFor = metricInk;
  const shadeFor = metricShade;

  const teams = [
    { id: awayId, side: "away" },
    { id: homeId, side: "home" },
  ];

  return (
    <EditorialCard position="relative" overflow="hidden" className="animate-slide-in" h="full" w="full" display="flex" flexDirection="column" style={{ animationDelay: "0.3s" }}>
      <Box position="relative" zIndex={1} p="0.75rem" h="full" w="full" display="flex" flexDirection="column">
        {/* Eyebrow — house standard: accent dot, label, hairline. No bar and no italic
            display face; the card's own contents carry the weight. */}
        <Flex align="center" gap="0.5rem" pb="0.5rem" mb="0.625rem" borderBottom="0.0625rem solid" borderColor="whiteAlpha.100" flexShrink={0}>
          <Box w="0.375rem" h="0.375rem" bg={accent} borderRadius="full" flexShrink={0} />
          <Text
            fontSize="clamp(0.68rem, 0.85vw, 0.85rem)"
            fontWeight="black"
            color="rgba(255,255,255,0.55)"
            textTransform="uppercase"
            letterSpacing="0.16em"
            lineHeight={1.1}
          >
            Metrics
          </Text>
        </Flex>

        <Flex direction="column" justify="space-between" gap="0.875rem" flex="1" minH={0}>
          {blocks.map((block) => (
            <Box key={block.label} minW={0}>
              <Grid templateColumns={BASICS_COLS} columnGap="0.3rem" alignItems="end" pb="0.3rem" borderBottom="0.0625rem solid" borderColor="rgba(255,255,255,0.12)">
                <Text fontSize="clamp(0.56rem, 0.72vw, 0.68rem)" fontWeight="950" color="rgba(255,255,255,0.68)" textTransform="uppercase" letterSpacing="0.05em" lineHeight={1.2}>
                  {block.label}
                </Text>
                {block.metrics.map((m) => (
                  <Text key={m.key} textAlign="center" fontSize="clamp(0.48rem, 0.6vw, 0.56rem)" fontWeight="900" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.04em" lineHeight={1.2} overflowWrap="normal" wordBreak="keep-all" hyphens="none">
                    {m.label}
                  </Text>
                ))}
              </Grid>

              {teams.map((team) => (
                <Grid key={team.id} templateColumns={BASICS_COLS} columnGap="0.3rem" alignItems="center" pt="0.3rem">
                  <Flex align="center" gap="0.3rem" minW={0}>
                    <Image src={getTeamLogoSrc(team.id)} alt="" w="0.8125rem" h="0.8125rem" objectFit="contain" flexShrink={0} />
                    <Text fontSize="clamp(0.5rem, 0.64vw, 0.6rem)" fontWeight="900" color="rgba(255,255,255,0.75)" lineClamp={1}>
                      {getTeamLabel(team.id)}
                    </Text>
                  </Flex>
                  {block.metrics.map((m) => {
                    const value = m[team.side];
                    const other = m[team.side === "away" ? "home" : "away"];
                    const fmt = KEY_META[m.key]?.fmt ?? fInt;
                    const shade = shadeFor(m.key, value, m.league);
                    return (
                      <Box key={m.key} bg={shade ?? "transparent"} borderRadius="sm" py="0.15rem" px="0.1rem" minW={0}>
                        <Text
                          textAlign="center"
                          fontFamily="mono"
                          fontSize="clamp(0.58rem, 0.78vw, 0.75rem)"
                          fontWeight="900"
                          lineHeight={1.2}
                          color={shade ? "white" : inkFor(m.key, value, other)}
                        >
                          {fmt(value)}
                        </Text>
                      </Box>
                    );
                  })}
                </Grid>
              ))}

              {/* League-average row — the third row every block on the reference sheet
                  carries, and the one that makes "6.3 plays per drive" mean something.
                  Read from `shared/league_avg_{season}.json` by the export's field path
                  (all 21 keys are there for 2026). The reference sheet's row is a national
                  average; that's on the backend ask list. Dashes on the derived path. */}
              <Grid templateColumns={BASICS_COLS} columnGap="0.3rem" alignItems="center" pt="0.3rem">
                <Text fontSize="clamp(0.46rem, 0.58vw, 0.54rem)" fontWeight="700" fontStyle="italic" color="rgba(255,255,255,0.3)" lineClamp={1}>
                  Lg Avg
                </Text>
                {block.metrics.map((m) => (
                  <Text
                    key={m.key}
                    textAlign="center"
                    fontFamily="mono"
                    fontSize="clamp(0.5rem, 0.66vw, 0.62rem)"
                    fontWeight="700"
                    fontStyle="italic"
                    color="rgba(255,255,255,0.38)"
                  >
                    {(KEY_META[m.key]?.fmt ?? fInt)(m.league?.avg ?? null)}
                  </Text>
                ))}
              </Grid>
            </Box>
          ))}
        </Flex>
      </Box>
    </EditorialCard>
  );
};
