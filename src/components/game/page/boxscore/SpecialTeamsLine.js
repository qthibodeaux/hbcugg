import { rate } from "../../../../utils/productionPresentation";
import { asNum, made } from "../../../../utils/gameProduction/specialTeamsModel";
import { Box, Grid, Text, Flex } from "@chakra-ui/react";

// Extracted from SpecialTeamsProductionClean; existing behavior preserved.

// ═══════════════════════════════════════════════════════════════════════════════
// TEAM LINE — six figures, each with a league-max meter
// ═══════════════════════════════════════════════════════════════════════════════
const ST_LINE = [
  { key: "puntNet", label: "Punt Net", fmt: rate, league: "special_teams.punting.avg_net" },
  { key: "puntStart", label: "Opp Start · Punt", fmt: rate, league: "special_teams.punting.avg_start_allowed", lowerIsBetter: true },
  { key: "koStart", label: "Opp Start · KO", fmt: rate, league: "special_teams.kickoffs.avg_start_allowed", lowerIsBetter: true },
  { key: "krAvg", label: "KR Avg", fmt: rate, league: "special_teams.kick_return.avg_return" },
  { key: "prAvg", label: "PR Avg", fmt: rate, league: "special_teams.punt_return.avg_return" },
  // FG prints made/att; its meter reads the long, the one FG figure the league file ranges.
  { key: "fgLong", label: "FG", fmt: null, league: "special_teams.field_goals.long" },
];

const Meter = ({ value, league, color, signed = false }) => {
  const v = asNum(value);
  const max = asNum(league?.max);
  const min = asNum(league?.min);
  const avg = asNum(league?.avg);
  // Signed stats (field-position margin) span the league's min→max with zero
  // inside the track; everything else fills from zero to the league max.
  const lo = signed ? Math.min(min ?? 0, v ?? 0, 0) : 0;
  const hi = Math.max(max ?? 0, v ?? 0, avg ?? 0, 0.0001);
  const span = hi - lo || 0.0001;
  const x = (n) => `${Math.min(100, Math.max(0, ((n - lo) / span) * 100))}%`;
  const zero = x(0);
  return (
    <Box position="relative" h="0.3rem" w="full" bg="whiteAlpha.100" borderRadius="full" mt="0.3rem">
      {v != null && (
        v >= 0
          ? <Box position="absolute" top={0} bottom={0} left={zero} w={`calc(${x(v)} - ${zero})`} bg={color} borderRadius="full" />
          : <Box position="absolute" top={0} bottom={0} left={x(v)} w={`calc(${zero} - ${x(v)})`} bg={color} opacity={0.35} borderRadius="full" />
      )}
      {avg != null && <Box position="absolute" top="-0.15rem" bottom="-0.15rem" left={x(avg)} w="2px" bg="rgba(255,255,255,0.85)" transform="translateX(-1px)" />}
    </Box>
  );
};

export const TeamLine = ({ data, color, leagueKeys }) => {
  const line = data.line;
  const hasLeague = ST_LINE.some((c) => asNum(leagueKeys?.[c.league]?.avg) != null);
  return (
    <Box px={3} pt={2}>
      <Grid templateColumns="repeat(6, minmax(0, 1fr))" columnGap={2}>
        {ST_LINE.map((c) => {
          const value = line[c.key];
          const text = c.key === "fgLong" ? made(line.fgMade, line.fgAtt) : c.fmt(value);
          return (
            <Box key={c.key} minW={0}>
              <Text fontSize="clamp(0.42rem, 0.58vw, 0.52rem)" fontWeight="900" color="rgba(255,255,255,0.35)" textTransform="uppercase" letterSpacing="0.1em" lineHeight={1.2} lineClamp={2}>
                {c.label}
              </Text>
              <Text fontSize="clamp(0.8rem, 1.1vw, 1rem)" fontWeight="950" color="white" lineHeight={1.1} mt="0.15rem">
                {text}
              </Text>
              <Meter value={value} league={leagueKeys?.[c.league]} color={color} signed={c.signed} />
            </Box>
          );
        })}
      </Grid>
      {hasLeague && (
        <Flex gap={3} mt={2}>
          <Flex align="center" gap={1}>
            <Box w="0.7rem" h="0.25rem" bg={color} borderRadius="full" />
            <Text fontSize="clamp(0.4rem, 0.52vw, 0.48rem)" fontWeight="800" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.08em">Fill = vs league max</Text>
          </Flex>
          <Flex align="center" gap={1}>
            <Box w="2px" h="0.5rem" bg="rgba(255,255,255,0.85)" />
            <Text fontSize="clamp(0.4rem, 0.52vw, 0.48rem)" fontWeight="800" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.08em">League avg</Text>
          </Flex>
        </Flex>
      )}
    </Box>
  );
};
