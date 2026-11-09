import { getTeamAccent, getTeamLabel, getTeamLogoSrc } from "../../../../utils/gameSummary/teamIdentity";
import { buildTeamStatRows, statBarSegment, statBarPct } from "../../../../utils/gameSummary/teamStatsModel";
import { Box, Text, Flex, HStack, Image, Grid } from "@chakra-ui/react";
import { EditorialCard, MicroLabel } from "./SummaryPrimitives";

// Extracted from GameSummaryTabV2; statistical semantics and layout are unchanged.

export const TeamStatsComparisonCard = ({ awayId, homeId, teamStats, advancedTeam, game, leagueAvg = null }) => {
  const awayColor = getTeamAccent(awayId);
  const homeColor = getTeamAccent(homeId);
  const awayLabel = getTeamLabel(awayId);
  const homeLabel = getTeamLabel(homeId);
  // Quieter than it was: the notch has to be findable without competing with the number.
  const notchColor = "rgba(255,255,255,0.55)";

  const statsConfig = buildTeamStatRows({ awayId, homeId, teamStats, advancedTeam, game, leagueAvg });

  // One team's cell: the number, with a hairline meter beneath it. The bar is deliberately
  // quiet — it is a supporting read under the figure, not a competing one, so it sits at a
  // sliver of height and well under full opacity.
  const teamCell = (stat, side, i) => {
    const isAway = side === "away";
    const value = isAway ? stat.away : stat.home;
    const avg = stat.league?.avg ?? null;
    const color = isAway ? awayColor : homeColor;
    const other = isAway ? stat.home : stat.away;
    const tied = value === other;
    const wins = !tied && (stat.lowerIsBetter ? value < other : value > other);
    const seg = statBarSegment(value, stat);
    const avgPct = avg == null ? null : statBarPct(avg, stat);
    const at = (pct) => (isAway ? { right: `${pct}%` } : { left: `${pct}%` });

    return (
      <Box minW={0}>
        <Text
          fontSize="clamp(0.72rem, 0.95vw, 0.95rem)"
          fontWeight="950"
          color={wins ? color : "rgba(255,255,255,0.45)"}
          textAlign={isAway ? "right" : "left"}
          lineHeight={1}
          lineClamp={1}
        >
          {stat.format(value)}
        </Text>
        <Box position="relative" h="0.125rem" w="full" mt="0.25rem">
          <Box position="absolute" inset={0} borderRadius="full" bg="rgba(255,255,255,0.07)" />
          {/* The two sides mirror around the gutter between them: away is anchored to
              its right edge and grows leftward, home anchored left and grows right, so
              the pair reads outward from the centre of the card. */}
          <Box
            position="absolute"
            top={0}
            bottom={0}
            borderRadius="full"
            bg={value < 0 ? "#EF4444" : color}
            opacity={0.7}
            className="animate-bar"
            style={{ width: `${seg.width}%`, animationDelay: `${0.3 + i * 0.05}s`, ...at(seg.from) }}
          />
          {/* Zero line, on a stat that crosses it. */}
          {seg.zero != null && <Box position="absolute" top="-0.125rem" bottom="-0.125rem" w="0.0625rem" bg="rgba(255,255,255,0.3)" style={at(seg.zero)} />}
          {/* League-average notch. */}
          {avgPct != null && <Box
            position="absolute"
            top="-0.09375rem"
            bottom="-0.09375rem"
            w="0.0625rem"
            bg={notchColor}
            zIndex={2}
            style={isAway ? { right: `${avgPct}%` } : { left: `${avgPct}%` }}
          />}
        </Box>
      </Box>
    );
  };

  return (
    <EditorialCard position="relative" overflow="hidden" className="animate-slide-in" h="full" w="full" display="flex" flexDirection="column" style={{ animationDelay: "0.25s" }}>
      <Box position="relative" zIndex={1} p="0.875rem" h="full" w="full" display="flex" flexDirection="column">
        {/* Eyebrow — house standard, same as the Metrics card: accent dot, label, hairline. */}
        <Flex align="center" justify="space-between" mb="0.625rem" pb="0.5rem" borderBottom="0.0625rem solid" borderColor="whiteAlpha.100" flexShrink={0}>
          <Flex align="center" gap="0.5rem">
            <Box w="0.375rem" h="0.375rem" bg={awayColor} borderRadius="full" flexShrink={0} />
            <Text
              fontSize="clamp(0.68rem, 0.85vw, 0.85rem)"
              fontWeight="black"
              color="rgba(255,255,255,0.55)"
              textTransform="uppercase"
              letterSpacing="0.16em"
              lineHeight={1.1}
            >
              Team Stats
            </Text>
          </Flex>
          <HStack gap="0.75rem">
            <Flex align="center" gap="0.3125rem">
              <Image src={getTeamLogoSrc(awayId)} alt="" h="1rem" w="1rem" objectFit="contain" />
              <MicroLabel color="rgba(255,255,255,0.5)">{awayLabel}</MicroLabel>
            </Flex>
            <Box w="0.0625rem" h="0.625rem" bg="rgba(255,255,255,0.15)" />
            <Flex align="center" gap="0.3125rem">
              <MicroLabel color="rgba(255,255,255,0.5)">{homeLabel}</MicroLabel>
              <Image src={getTeamLogoSrc(homeId)} alt="" h="1rem" w="1rem" objectFit="contain" />
            </Flex>
          </HStack>
        </Flex>

        {/* Label left, the two numbers side by side to its right — a comparison table
            rather than a diverging chart. Eleven rows share the slot's height evenly. */}
        <Flex direction="column" justify="space-between" flex="1" minH={0}>
          {statsConfig.map((stat, i) => (
            <Grid
              key={stat.label}
              templateColumns="minmax(0, 1.75fr) minmax(0, 1fr) minmax(0, 1fr)"
              columnGap="0.5rem"
              alignItems="center"
            >
              <Text
                fontSize="clamp(0.6rem, 0.75vw, 0.78rem)"
                fontWeight="black"
                color="rgba(255,255,255,0.5)"
                textTransform="uppercase"
                letterSpacing="0.1em"
                lineHeight={1.15}
              >
                {stat.label}
              </Text>
              {teamCell(stat, "away", i)}
              {teamCell(stat, "home", i)}
            </Grid>
          ))}
        </Flex>

        {/* Key — the notch and the unfilled remainder are both deliberate, and neither is
            self-explanatory without being named. Each entry draws the real mark. */}
        <Flex flexShrink={0} align="center" justify="center" gap="1.25rem" mt="0.5rem" pt="0.5rem" borderTop="0.0625rem solid" borderColor="rgba(255,255,255,0.08)" flexWrap="wrap" rowGap="0.25rem">
          <Flex align="center" gap="0.375rem">
            <Box w="0.0625rem" h="0.5rem" bg={notchColor} flexShrink={0} />
            <MicroLabel>League Avg</MicroLabel>
          </Flex>
          <Flex align="center" gap="0.375rem">
            <Box position="relative" w="1.75rem" h="0.125rem" borderRadius="full" bg="rgba(255,255,255,0.07)" flexShrink={0} overflow="hidden">
              <Box position="absolute" left={0} top={0} bottom={0} w="58%" borderRadius="full" bg="rgba(255,255,255,0.4)" />
            </Box>
            <MicroLabel>Fill = vs League Max</MicroLabel>
          </Flex>
        </Flex>
      </Box>
    </EditorialCard>
  );
};
