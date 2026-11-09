import { rate, pct } from "../../../../utils/productionPresentation";
import { Box, Grid, Text, Flex } from "@chakra-ui/react";

// Extracted from the live production panel; existing semantics are preserved.

// ═══════════════════════════════════════════════════════════════════════════════
// TABLES
// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
// TEAM LINE — Connelly's six rushing columns, each with a context bar
// ═══════════════════════════════════════════════════════════════════════════════
// Value, then a hairline meter: fill is the game value against the LEAGUE MAX for
// that stat (shared/league_avg_{season}.keys), a white notch is this team's SEASON
// average (shared/team_season_avg_{season}.teams[team].rushing), a red notch is what
// the OPPOSING DEFENSE allows on average this season. Nothing estimated: where a file
// doesn't carry the number the notch is simply not drawn (today the season file has
// success, opportunity and stuff rate only, and no defense-allowed block at all — both
// on the backend ask list; the keys below are the ones asked for).
const RUSH_LINE = [
  { key: "ypc", label: "Yds/ Carry", fmt: rate, league: "rushing_splits.total.yards_per_carry", season: "yardsPerCarry", allowed: "yardsPerCarryAllowed" },
  { key: "lineYards", label: "LY/ Carry", fmt: rate, league: "rushing_splits.total.line_yards_per_rush", season: "lineYardsPerRush", allowed: "lineYardsPerRushAllowed" },
  { key: "successRate", label: "Succ. Rt", fmt: pct, league: "rushing_splits.total.success_rate", season: "successRate", allowed: "successRateAllowed" },
  { key: "oppRate", label: "Opp Rate", fmt: pct, league: "rushing_splits.total.opportunity_rate", season: "opportunityRate", allowed: "opportunityRateAllowed" },
  { key: "highlight", label: "Hlt/ Rush", fmt: rate, league: "rushing_splits.total.highlight_yards_per_rush", season: "highlightYardsPerRush", allowed: "highlightYardsPerRushAllowed" },
  { key: "stuffRate", label: "Stuff Rt", fmt: pct, league: "rushing_splits.total.stuff_rate", season: "stuffRate", allowed: "stuffRateAllowed" },
];

const SEASON_NOTCH = "rgba(255,255,255,0.85)";

const ALLOWED_NOTCH = "#ef4444";

const asNum = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);

const ContextMeter = ({ value, max, season, allowed, color }) => {
  const scale = Math.max(asNum(max) ?? 0, asNum(value) ?? 0, asNum(season) ?? 0, asNum(allowed) ?? 0, 0.0001);
  const x = (v) => `${Math.min(100, Math.max(0, (v / scale) * 100))}%`;
  return (
    <Box position="relative" h="0.3rem" w="full" bg="whiteAlpha.100" borderRadius="full" mt="0.3rem">
      {asNum(value) != null && <Box position="absolute" left={0} top={0} bottom={0} w={x(value)} bg={color} borderRadius="full" />}
      {asNum(season) != null && <Box position="absolute" top="-0.15rem" bottom="-0.15rem" left={x(season)} w="2px" bg={SEASON_NOTCH} transform="translateX(-1px)" />}
      {asNum(allowed) != null && <Box position="absolute" top="-0.15rem" bottom="-0.15rem" left={x(allowed)} w="2px" bg={ALLOWED_NOTCH} transform="translateX(-1px)" />}
    </Box>
  );
};

export const TeamRushLine = ({ data, color, context }) => {
  const line = data.line;
  const hasSeason = RUSH_LINE.some((c) => asNum(context?.season?.[c.season]) != null);
  const hasAllowed = RUSH_LINE.some((c) => asNum(context?.allowed?.[c.allowed]) != null);
  const hasLeague = RUSH_LINE.some((c) => asNum(context?.league?.[c.league]?.max) != null);

  return (
    <Box px={3} pt={2}>
      <Grid templateColumns="repeat(6, minmax(0, 1fr))" columnGap={2}>
        {RUSH_LINE.map((c) => {
          const value = line?.[c.key] ?? null;
          return (
            <Box key={c.key} minW={0}>
              <Text fontSize="clamp(0.42rem, 0.58vw, 0.52rem)" fontWeight="900" color="rgba(255,255,255,0.35)" textTransform="uppercase" letterSpacing="0.1em" lineHeight={1.2} overflowWrap="normal" wordBreak="keep-all">
                {c.label}
              </Text>
              <Text fontSize="clamp(0.8rem, 1.1vw, 1rem)" fontWeight="950" color="white" lineHeight={1.1} mt="0.15rem">
                {c.fmt(value)}
              </Text>
              <ContextMeter
                value={value}
                max={context?.league?.[c.league]?.max}
                season={context?.season?.[c.season]}
                allowed={context?.allowed?.[c.allowed]}
                color={color}
              />
            </Box>
          );
        })}
      </Grid>

      {(hasLeague || hasSeason || hasAllowed) && (
        <Flex gap={3} mt={2} flexWrap="wrap">
          {hasLeague && (
            <Flex align="center" gap={1}>
              <Box w="0.7rem" h="0.25rem" bg={color} borderRadius="full" />
              <Text fontSize="clamp(0.4rem, 0.52vw, 0.48rem)" fontWeight="800" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.08em">Fill = vs league max</Text>
            </Flex>
          )}
          {hasSeason && (
            <Flex align="center" gap={1}>
              <Box w="2px" h="0.5rem" bg={SEASON_NOTCH} />
              <Text fontSize="clamp(0.4rem, 0.52vw, 0.48rem)" fontWeight="800" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.08em">Season avg</Text>
            </Flex>
          )}
          {hasAllowed && (
            <Flex align="center" gap={1}>
              <Box w="2px" h="0.5rem" bg={ALLOWED_NOTCH} />
              <Text fontSize="clamp(0.4rem, 0.52vw, 0.48rem)" fontWeight="800" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.08em">Opp defense allows</Text>
            </Flex>
          )}
        </Flex>
      )}
    </Box>
  );
};
