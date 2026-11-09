// The real RB view uses field_map.rushing. The OL reuse keeps the pre-existing estimated lane fallback; separating these source policies is deferred.
import { getComponent, clamp, ZONE_WEIGHTS, metric, zoneStatsFor, RUSH_DIRECTIONS } from "./playerMapModel";
import { Flex, Box, Text, Grid } from "@chakra-ui/react";

export const RushingLaneMap = ({ player, primary, secondary, gameOverride, bottomOverride, real = false, rushing = null }) => {
  const rush = Math.max(0, getComponent(player, "rushing_production"));

  const gameCarries = Number(gameOverride?.carries ?? gameOverride?.rushing_attempts ?? 0);
  const gameYards = Number(gameOverride?.rushing_yards ?? gameOverride?.rush_yards ?? 0);
  const gameTd = Number(gameOverride?.rushing_touchdowns ?? gameOverride?.rush_td ?? 0);
  const gameFumbles = Number(gameOverride?.fumbles_lost ?? gameOverride?.fumbles ?? 0);
  const hasGame = gameCarries > 0 || gameYards !== 0;

  const baseCarries = hasGame ? gameCarries : Math.round(clamp(rush * 1.1, 6, 22));
  const baseYards = hasGame ? gameYards : Math.round(clamp(rush * 8.5, 25, 180));
  const baseTd = hasGame ? gameTd : Math.round(clamp(rush * 0.08, 0, 3));
  const baseFumbles = hasGame ? gameFumbles : (rush > 14 ? 1 : 0);

  const legacyZones = ZONE_WEIGHTS.map((z) => {
    const netYards = Math.round(baseYards * z.yardShare);
    const olYards = Math.round(netYards * z.olShare);
    return {
      key: z.key,
      label: z.label,
      carries: Math.max(0, Math.round(baseCarries * z.carryShare)),
      netYards,
      olYards,
      td: 0,
      fumbles: 0,
    };
  });
  if (baseTd > 0) legacyZones.reduce((a, b) => (b.netYards > a.netYards ? b : a)).td = baseTd;
  if (baseFumbles > 0) legacyZones.reduce((a, b) => (b.netYards < a.netYards ? b : a)).fumbles = baseFumbles;

  const noData = real && !rushing?.available;
  const zones = real
    ? [["left", "LEFT", "L"], ["middle", "MIDDLE", "M"], ["right", "RIGHT", "R"]].map(([key, label, dir]) => {
        const c = rushing?.available ? rushing.cells?.find((x) => x.direction === dir) : null;
        return {
          key,
          label,
          carries: Number(c?.attempts ?? 0),
          netYards: Number(c?.yards ?? 0),
          olYards: Number(c?.line_yards ?? 0),
          highlightYards: Number(c?.highlight_yards ?? 0),
          td: Number(c?.touchdowns ?? 0),
          fumbles: Number(c?.fumbles ?? 0),
        };
      })
    : legacyZones.map((z) => ({ ...z, highlightYards: z.netYards - z.olYards }));
  // The line segment grows from zero to the line yards, the highlight segment
  // stacks on it; a lane's bar ends at the sum.
  zones.forEach((z) => { z.barTop = z.olYards + z.highlightYards; });

  const extents = zones.flatMap((z) => [z.olYards, z.barTop, z.netYards]);
  const max = Math.max(0, ...extents) + 5;
  const hasNegative = extents.some((n) => n < 0);
  const min = hasNegative ? Math.min(0, ...extents) - 5 : 0;
  const span = max - min || 1;
  const pctFor = (v) => ((v - min) / span) * 100;
  const zeroPct = pctFor(0);

  const totalCarries = zones.reduce((s, z) => s + z.carries, 0);
  const totalYards = zones.reduce((s, z) => s + z.netYards, 0);
  const totalHighlightYards = zones.reduce((s, z) => s + z.highlightYards, 0);
  const totalTd = zones.reduce((s, z) => s + z.td, 0);
  const totalFumbles = zones.reduce((s, z) => s + z.fumbles, 0);
  const yardsPerCarry = totalCarries > 0 ? totalYards / totalCarries : 0;
  const highlightYardsPerCarry = totalCarries > 0 ? totalHighlightYards / totalCarries : 0;
  // Estimated pending real per-carry success/failure data — scales with production
  // the same way other mock-derived fields in this file do (see OLCombinedMap).
  const successRate = real ? (rushing?.success_rate != null ? Number(rushing.success_rate) * 100 : null) : clamp(38 + rush * 1.3, 30, 72);

  const axisTicks = hasNegative ? [max, 0, min] : [max, Math.round(max / 2), 0];

  // Only TD/FB are conditional (they don't happen every game); the rate
  // stats are always meaningful. bottomOverride lets OL's reused-grid view
  // swap this row for real pass-pro/run-block metrics instead of the zone
  // totals, since those aren't OL's own numbers.
  let bottomStats = [{ label: "RUSHES", value: totalCarries }, { label: "YARDS", value: totalYards }];
  if (totalTd > 0) bottomStats.push({ label: "TD", value: totalTd });
  bottomStats.push(
    { label: "YD/CAR", value: metric(yardsPerCarry, 1) },
    { label: "HLT/CAR", value: metric(highlightYardsPerCarry, 1) },
    { label: "SUCCESS%", value: successRate == null ? "—" : `${metric(successRate, 0)}%` },
  );
  if (totalFumbles > 0) bottomStats.push({ label: "FB", value: totalFumbles });
  if (noData) bottomStats = [{ label: "RUSHES", value: "—" }, { label: "YARDS", value: "—" }];
  if (bottomOverride) bottomStats = bottomOverride;

  return (
    <Flex direction="column" h="full" w="full" p="0.4rem">
      <Flex align="center" justify="space-between" gap="0.3rem" mb="0.3rem">
        <Flex align="center" gap="0.3rem">
          <Box w="3px" h="10px" bg={primary} borderRadius="sm" />
          <Text fontSize="0.58rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.06em">
            Rushing Lane Breakdown
          </Text>
        </Flex>
        <Flex align="center" gap="0.5rem">
          <Flex align="center" gap="0.15rem">
            <Box w="0.4rem" h="0.4rem" borderRadius="sm" bg={primary} />
            <Text fontSize="0.44rem" fontWeight="800" color="rgba(255,255,255,0.6)" textTransform="uppercase">OL Yards</Text>
          </Flex>
          <Flex align="center" gap="0.15rem">
            <Box w="0.4rem" h="0.4rem" borderRadius="sm" bg={secondary} />
            <Text fontSize="0.44rem" fontWeight="800" color="rgba(255,255,255,0.6)" textTransform="uppercase">Highlight</Text>
          </Flex>
        </Flex>
      </Flex>

      {/* Single CSS Grid — axis gutter + 3 zone columns share the same row
          tracks, so header/track/footer heights are pixel-identical across all
          4 columns by construction (native grid row sizing) instead of by
          matching hand-picked rem values, which is what was drifting out of
          alignment before. Each zone's border/background spans all 3 rows as
          one item underneath its header/track/footer content. */}
      <Grid
        templateColumns="1.6rem repeat(3, 1fr)"
        templateRows="auto 1fr auto"
        columnGap="0.35rem"
        rowGap={0}
        flex={1}
        minH={0}
      >
        {zones.map((zone, i) => (
          <Box key={`bg-${zone.key}`} gridColumn={i + 2} gridRow="1 / 4" bg="rgba(255,255,255,0.035)" border="1px solid rgba(255,255,255,0.08)" />
        ))}

        {/* Row 1 — zone labels */}
        {zones.map((zone, i) => (
          <Box key={`h-${zone.key}`} gridColumn={i + 2} gridRow={1} px="0.35rem" pt="0.3rem">
            <Text fontSize="clamp(0.62rem, 1vw, 0.8rem)" color="white" fontWeight="900" textTransform="uppercase" letterSpacing="0.03em">
              {zone.label}
            </Text>
          </Box>
        ))}

        {/* Row 2 — axis ticks + bar tracks (same grid row = guaranteed same height) */}
        <Box gridColumn={1} gridRow={2} position="relative">
          {axisTicks.map((t) => (
            <Text
              key={t}
              position="absolute"
              right="0.15rem"
              left={0}
              textAlign="right"
              bottom={`${pctFor(t)}%`}
              transform="translateY(50%)"
              fontSize="0.58rem"
              fontWeight="800"
              color="rgba(255,255,255,0.7)"
              lineHeight={1}
              whiteSpace="nowrap"
            >
              {t}
            </Text>
          ))}
        </Box>
        {zones.map((zone, i) => (
          <Box
            key={`t-${zone.key}`}
            gridColumn={i + 2}
            gridRow={2}
            position="relative"
            mx="0.35rem"
            borderTop="2px solid rgba(255,255,255,0.3)"
            borderBottom="2px solid rgba(255,255,255,0.3)"
          >
            {hasNegative && (
              <Box position="absolute" left={0} right={0} bottom={`${zeroPct}%`} h="1px" bg="rgba(255,255,255,0.4)" />
            )}
            {/* OL segment — grows from the zero line, square corners */}
            <Box
              position="absolute"
              left={0}
              right={0}
              bottom={`${pctFor(Math.min(0, zone.olYards))}%`}
              h={`${Math.abs(pctFor(zone.olYards) - zeroPct)}%`}
              bg={primary}
            />
            {/* Highlight segment — stacks on top of the OL segment */}
            <Box
              position="absolute"
              left={0}
              right={0}
              bottom={`${pctFor(Math.min(zone.olYards, zone.barTop))}%`}
              h={`${Math.abs(pctFor(zone.barTop) - pctFor(zone.olYards))}%`}
              bg={secondary}
            />
          </Box>
        ))}

        {/* Row 3 — per-zone CAR/YDS stats */}
        {zones.map((zone, i) => {
          const stats = zoneStatsFor(zone, noData);
          const cols = stats.length >= 4 ? 2 : stats.length;
          return (
            <Flex key={`f-${zone.key}`} gridColumn={i + 2} gridRow={3} align="center" px="0.35rem" pb="0.3rem" pt="0.2rem">
              <Grid templateColumns={`repeat(${cols}, 1fr)`} gap="0.1rem 0.4rem" w="full">
                {stats.map((s) => (
                  <Flex key={s.label} justify="space-between" align="baseline" gap="0.2rem">
                    <Text fontSize="0.5rem" fontWeight="800" color="rgba(255,255,255,0.6)" textTransform="uppercase">{s.label}</Text>
                    <Text fontSize="0.68rem" fontWeight="900" color="white">{s.value}</Text>
                  </Flex>
                ))}
              </Grid>
            </Flex>
          );
        })}
      </Grid>

      {/* Bottom totals — TD/FB only when they happened, rate stats always */}
      <Grid templateColumns="repeat(auto-fit, minmax(4.2rem, 1fr))" gap="0.3rem" mt="0.3rem">
        {bottomStats.map((s) => (
          <Box key={s.label} textAlign="center" bg="rgba(255,255,255,0.04)" borderRadius="sm" py="0.3rem">
            <Text fontSize="clamp(8px, 0.65vw, 10px)" color="text.muted" fontWeight="800" textTransform="uppercase">{s.label}</Text>
            <Text fontSize="clamp(13px, 1.05vw, 16px)" color="white" fontWeight="950">{s.value}</Text>
          </Box>
        ))}
      </Grid>
    </Flex>
  );
};

export const RushingDirectionStrip = ({ cells, primary }) => {
  const byDirection = Object.fromEntries((cells ?? []).map((c) => [c.direction, c]));
  const maxAttempts = Math.max(1, ...(cells ?? []).map((c) => c.attempts ?? 0));

  return (
    <Flex direction="column" h="full" w="full" p="0.4rem">
      <Flex align="center" gap="0.3rem" mb="0.3rem">
        <Box w="3px" h="10px" bg={primary} borderRadius="sm" />
        <Text fontSize="0.52rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.06em">
          Rushing By Direction
        </Text>
      </Flex>
      <Grid templateColumns="repeat(3, 1fr)" gap="6px" flex={1} minH={0}>
        {RUSH_DIRECTIONS.map((dir) => {
          const cell = byDirection[dir.key] ?? { attempts: 0, yards: 0 };
          const hasData = cell.attempts > 0;
          const strength = hasData ? Math.max(0.18, cell.attempts / maxAttempts) : 0;
          const bg = hasData ? `${primary}${Math.round(strength * 255).toString(16).padStart(2, "0")}` : "rgba(0,0,0,0.35)";
          return (
            <Flex
              key={dir.key}
              direction="column"
              align="center"
              justify="center"
              borderRadius="md"
              bg={bg}
              border={hasData ? `1px solid ${primary}66` : "1px solid rgba(255,255,255,0.06)"}
            >
              <Text fontSize="clamp(11px, 1vw, 14px)" fontWeight="900" color={hasData ? "white" : "text.muted"} lineHeight={1}>
                {cell.attempts}
              </Text>
              <Text fontSize="clamp(7px, 0.6vw, 9px)" color={hasData ? "white" : "text.muted"} opacity={0.8} lineHeight={1} mt="2px">
                {cell.yards}y
              </Text>
              <Text fontSize="clamp(6px, 0.5vw, 8px)" fontWeight="800" color="text.secondary" textTransform="uppercase" mt="3px" letterSpacing="0.06em">
                {dir.label}
              </Text>
            </Flex>
          );
        })}
      </Grid>
    </Flex>
  );
};
