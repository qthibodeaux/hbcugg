import { useState } from "react";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import useMountEffect from "../../../hooks/useMountEffect";

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const metric = (value, digits = 0) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return Number(value).toFixed(digits).replace(/\.0$/, "");
};

const getPosition = (player) =>
  String(player?.position_group ?? player?.position ?? player?.position_abbr ?? "ATH").toUpperCase();

const getComponent = (player, key) => Number(player?.season_components?.[key] ?? 0);

const POSITION_GROUPS = {
  PASS: new Set(["QB", "WR", "TE"]),
  RUN: new Set(["RB", "FB"]),
  DEF: new Set(["DL", "DE", "DT", "EDGE", "LB", "OLB", "ILB", "DB", "CB", "S", "SAF"]),
  OL: new Set(["OL", "OT", "OG", "C", "G", "T"]),
  K: new Set(["K", "PK"]),
  P: new Set(["P"]),
  ST: new Set(["KO", "LS", "PR", "KR"]),
};

// ─── COLOR HELPERS ───
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 };
}

function getCellColor(comp, att, primaryColor) {
  if (att === 0) return "transparent";
  const rate = comp / att;
  const rgb = hexToRgb(primaryColor);
  const opacity = 0.15 + rate * 0.65;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

function getCellTextColor(comp, att) {
  if (att === 0) return "#71717A";
  const rate = comp / att;
  return rate >= 0.5 ? "#FFFFFF" : "#F4F4F5";
}

// ═══════════════════════════════════════════════════════════════
// PASSING 3×3 FIELD GRID (QB, WR, TE)
// ═══════════════════════════════════════════════════════════════

// field_map.cells[] (BACKEND_RESPONSE_SPEC.md §4.2) — real depth×direction
// attempts/completions/yards, direction as L/M/R rather than this
// component's left/middle/right keys.
const FIELD_MAP_DIRECTION = { L: "left", M: "middle", R: "right" };

const buildRealGrid = (cells) => {
  const grid = {
    deep: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } },
    medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } },
    short: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } },
  };
  cells.forEach((cell) => {
    const dirKey = FIELD_MAP_DIRECTION[cell.direction] ?? cell.direction;
    if (!grid[cell.depth]?.[dirKey]) return;
    grid[cell.depth][dirKey] = { comp: cell.completions, att: cell.attempts, yards: cell.yards };
  });
  return grid;
};

const PassingGridMap = ({ player, primary, secondary, bottomStats, fieldMap, depthBands }) => {
  const pass = Math.max(0, getComponent(player, "passing_production"));
  const rec = Math.max(0, getComponent(player, "receiving_production"));
  const rush = Math.max(0, getComponent(player, "rushing_production"));

  // Real field_map.cells replace the fabricated ratio-based grid below when
  // present — see BACKEND_CHANGE_NOTES.md §1: pass_heat_map already exists
  // on every parsed game, this was a placeholder for it, not a design.
  const grid = fieldMap?.length ? buildRealGrid(fieldMap) : {
    deep: {
      left: { comp: clamp(Math.round(pass * 0.15), 0, 9), att: clamp(Math.round(pass * 0.25), 1, 12), yards: clamp(Math.round(pass * 8.5), 0, 150) },
      middle: { comp: clamp(Math.round(pass * 0.2), 0, 9), att: clamp(Math.round(pass * 0.3), 1, 12), yards: clamp(Math.round(pass * 10), 0, 180) },
      right: { comp: clamp(Math.round(rec * 0.18), 0, 9), att: clamp(Math.round(rec * 0.28), 1, 12), yards: clamp(Math.round(rec * 9), 0, 160) },
    },
    medium: {
      left: { comp: clamp(Math.round(pass * 0.12), 0, 9), att: clamp(Math.round(pass * 0.2), 1, 10), yards: clamp(Math.round(pass * 6), 0, 100) },
      middle: { comp: clamp(Math.round(rec * 0.22), 0, 9), att: clamp(Math.round(rec * 0.32), 1, 12), yards: clamp(Math.round(rec * 7), 0, 120) },
      right: { comp: clamp(Math.round(rush * 0.1), 0, 9), att: clamp(Math.round(rush * 0.18), 1, 10), yards: clamp(Math.round(rush * 5), 0, 90) },
    },
    short: {
      left: { comp: clamp(Math.round(rec * 0.15), 0, 9), att: clamp(Math.round(rec * 0.22), 1, 10), yards: clamp(Math.round(rec * 4), 0, 60) },
      middle: { comp: clamp(Math.round(rush * 0.18), 0, 9), att: clamp(Math.round(rush * 0.25), 1, 10), yards: clamp(Math.round(rush * 4.5), 0, 70) },
      right: { comp: clamp(Math.round(pass * 0.1), 0, 9), att: clamp(Math.round(pass * 0.16), 1, 8), yards: clamp(Math.round(pass * 3.5), 0, 50) },
    },
  };

  // field_map.depth_bands (§4.2) labels the axis from real data rather than
  // a hardcoded guess — falls back to the known values for players with no
  // profile document.
  const depths = [
    { key: "deep", label: "DEEP", range: depthBands?.deep ?? ">12" },
    { key: "medium", label: "MED", range: depthBands?.medium ?? "4-12" },
    { key: "short", label: "SHORT", range: depthBands?.short ?? "<4" },
  ];
  const directions = ["left", "middle", "right"];
  const dirLabels = ["L", "M", "R"];

  return (
    <Flex direction="column" h="full" w="full" p="0.4rem">
      {/* Header */}
      <Flex align="center" gap="0.3rem" mb="0.3rem">
        <Box w="3px" h="10px" bg={primary} borderRadius="sm" />
        <Text fontSize="0.52rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.06em">
          Production Field Map
        </Text>
      </Flex>

      <Flex gap="6px" align="stretch" flex={1} minH={0}>
        {/* Depth labels */}
        <Flex direction="column" justify="space-around" py="2px">
          {depths.map((d) => (
            <Flex key={d.key} direction="column" align="flex-end" gap="1px">
              <Text fontSize="clamp(6px, 0.5vw, 8px)" fontWeight="800" color="text.secondary" textTransform="uppercase" lineHeight={1}>
                {d.label}
              </Text>
              <Text fontSize="clamp(5px, 0.45vw, 7px)" color="text.muted" lineHeight={1}>
                {d.range}
              </Text>
            </Flex>
          ))}
        </Flex>

        {/* Grid */}
        <Box position="relative" flex={1}>
          <Box position="absolute" inset="0" borderRadius="md" overflow="hidden"
            bg="linear-gradient(180deg, #1a3d1a 0%, #0d260d 100%)"
            border="1px solid rgba(255,255,255,0.15)"
          >
            <Box position="absolute" left="0" right="0" top="33.3%" h="1px" bg="rgba(255,255,255,0.12)" />
            <Box position="absolute" left="0" right="0" top="66.6%" h="1px" bg="rgba(255,255,255,0.12)" />
            <Box position="absolute" top="0" bottom="0" left="33.3%" w="1px" bg="rgba(255,255,255,0.12)" />
            <Box position="absolute" top="0" bottom="0" left="66.6%" w="1px" bg="rgba(255,255,255,0.12)" />
          </Box>
          <Grid position="absolute" inset="3px" templateColumns="repeat(3, 1fr)" templateRows="repeat(3, 1fr)" gap="2px">
            {depths.map((d) =>
              directions.map((dir, di) => {
                const cell = grid[d.key][dir];
                const hasData = cell.att > 0;
                const bg = hasData ? getCellColor(cell.comp, cell.att, primary) : "rgba(0,0,0,0.35)";
                const textColor = hasData ? getCellTextColor(cell.comp, cell.att) : "text.muted";
                return (
                  <Flex key={`${d.key}-${dir}`} direction="column" align="center" justify="center"
                    bg={bg}
                    borderRadius="sm"
                    border={hasData ? `1px solid ${primary}66` : "1px solid rgba(255,255,255,0.06)"}
                  >
                    <Text fontSize="clamp(9px, 0.75vw, 11px)" fontWeight="800" color={textColor} lineHeight={1}>
                      {cell.comp}/{cell.att}
                    </Text>
                    <Text fontSize="clamp(6px, 0.5vw, 8px)" color={textColor} lineHeight={1} mt="1px" opacity={0.8}>
                      {cell.yards}y
                    </Text>
                  </Flex>
                );
              })
            )}
          </Grid>
        </Box>
      </Flex>

      {/* Direction labels */}
      <Flex justify="center" gap={4} mt="4px">
        {dirLabels.map((d) => (
          <Text key={d} fontSize="clamp(7px, 0.6vw, 9px)" fontWeight="700" color="text.muted" textTransform="uppercase">
            {d}
          </Text>
        ))}
      </Flex>

      {/* Optional bottom stat row — used by OL's reused-grid view to carry
          real pass-pro/run-block metrics under the grid; omitted for
          QB/WR/TE, which never pass this prop. */}
      {bottomStats && bottomStats.length > 0 && (
        <Grid templateColumns="repeat(auto-fit, minmax(4.2rem, 1fr))" gap="0.3rem" mt="0.35rem">
          {bottomStats.map((s) => (
            <Box key={s.label} textAlign="center" bg="rgba(255,255,255,0.04)" borderRadius="sm" py="0.3rem">
              <Text fontSize="clamp(7px, 0.55vw, 9px)" color="text.muted" fontWeight="800" textTransform="uppercase">{s.label}</Text>
              <Text fontSize="clamp(11px, 0.9vw, 14px)" color="white" fontWeight="950">{s.value}</Text>
            </Box>
          ))}
        </Grid>
      )}
    </Flex>
  );
};

// ═══════════════════════════════════════════════════════════════
// RUSHING 3×1 LANE GRID (RB, FB)
// ═══════════════════════════════════════════════════════════════

// gameOverride — a single game's rushing totals (carries, rushing_yards,
// rushing_touchdowns, fumbles). Real per-game data doesn't carry a zone-level
// OL-yards/highlight-yards split yet, so this distributes the game's real
// totals across three zones with fixed weights — shaped like what a real
// per-zone rushing endpoint would return, not season-level guesswork, once
// gameOverride is supplied. Falls back to season-level estimates otherwise.
const ZONE_WEIGHTS = [
  { key: "left", label: "LEFT", carryShare: 0.3, yardShare: 0.26, olShare: 0.62 },
  { key: "middle", label: "MIDDLE", carryShare: 0.42, yardShare: 0.42, olShare: 0.72 },
  { key: "right", label: "RIGHT", carryShare: 0.28, yardShare: 0.32, olShare: 0.58 },
];

const zoneStatsFor = (zone) => {
  const stats = [
    { label: "CAR", value: zone.carries },
    { label: "YDS", value: zone.netYards },
  ];
  if (zone.td > 0) stats.push({ label: "TD", value: zone.td });
  if (zone.fumbles > 0) stats.push({ label: "FB", value: zone.fumbles });
  return stats;
};

const RushingLaneMap = ({ player, primary, secondary, gameOverride, bottomOverride }) => {
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

  const zones = ZONE_WEIGHTS.map((z) => {
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
  if (baseTd > 0) zones.reduce((a, b) => (b.netYards > a.netYards ? b : a)).td = baseTd;
  if (baseFumbles > 0) zones.reduce((a, b) => (b.netYards < a.netYards ? b : a)).fumbles = baseFumbles;

  const nets = zones.map((z) => z.netYards);
  const max = Math.max(0, ...nets) + 5;
  const hasNegative = nets.some((n) => n < 0);
  const min = hasNegative ? Math.min(0, ...nets) - 5 : 0;
  const span = max - min || 1;
  const pctFor = (v) => ((v - min) / span) * 100;
  const zeroPct = pctFor(0);

  const totalCarries = zones.reduce((s, z) => s + z.carries, 0);
  const totalYards = zones.reduce((s, z) => s + z.netYards, 0);
  const totalOlYards = zones.reduce((s, z) => s + z.olYards, 0);
  const totalHighlightYards = totalYards - totalOlYards;
  const totalTd = zones.reduce((s, z) => s + z.td, 0);
  const totalFumbles = zones.reduce((s, z) => s + z.fumbles, 0);
  const yardsPerCarry = totalCarries > 0 ? totalYards / totalCarries : 0;
  const highlightYardsPerCarry = totalCarries > 0 ? totalHighlightYards / totalCarries : 0;
  // Estimated pending real per-carry success/failure data — scales with production
  // the same way other mock-derived fields in this file do (see OLCombinedMap).
  const successRate = clamp(38 + rush * 1.3, 30, 72);

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
    { label: "SUCCESS%", value: `${metric(successRate, 0)}%` },
  );
  if (totalFumbles > 0) bottomStats.push({ label: "FB", value: totalFumbles });
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
              bottom={`${pctFor(Math.min(zone.olYards, zone.netYards))}%`}
              h={`${Math.abs(pctFor(zone.netYards) - pctFor(zone.olYards))}%`}
              bg={secondary}
            />
          </Box>
        ))}

        {/* Row 3 — per-zone CAR/YDS stats */}
        {zones.map((zone, i) => {
          const stats = zoneStatsFor(zone);
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

// ═══════════════════════════════════════════════════════════════
// HAVOC SPATIAL LOG (DEFENSE)
// ═══════════════════════════════════════════════════════════════

// gameOverride — a single game's real box-score shape (tfl, sacks, qb_hurries,
// forced_fumbles, passes_defended), e.g. from public/data/1-game center/games/{year}/*.json's
// individual_stats[team].defense[player] entries. Falls back to season-level
// estimates when a specific game isn't selected.
//
// PIPELINE NOTE: real per-play zone (left/middle/right) + depth-off-LOS
// coordinates don't exist yet. Once a real per-play feed exists, each event
// gets a real x/y. Until then, every event is placed using the ordinal rule
// confirmed for the zone-only case: split each zone's third of the x-axis
// into N equal slots (N = events in that zone) and center each event in its
// slot, in chronological order — this is also exactly what the real-x
// version falls back to for any play where we only know the zone.
const HAVOC_EVENT_DEFS = [
  { key: "tfl", label: "TFL", baseDepth: -3, spread: 3 },
  { key: "sacks", label: "SACK", baseDepth: -6, spread: 3.5 },
  { key: "qb_hurries", label: "QBH", baseDepth: -2, spread: 2 },
  { key: "forced_fumbles", label: "FF", baseDepth: -1, spread: 3 },
  { key: "passes_defended", label: "PD", baseDepth: 9, spread: 7 },
];
const ZONE_RANGE = { left: [0, 100 / 3], middle: [100 / 3, 200 / 3], right: [200 / 3, 100] };
const ZONE_ORDER = ["left", "middle", "right"];

const HavocSpatialMap = ({ player, primary, secondary, gameOverride }) => {
  const total = Math.max(1, Number(player?.total_production ?? player?.par ?? 8));
  const counts = {
    tfl: Math.round(Number(gameOverride?.tfl ?? player?.season_totals?.tfl ?? player?.tfl ?? Math.max(0, total * 0.15))),
    sacks: Math.round(Number(gameOverride?.sacks ?? player?.season_totals?.sck ?? player?.sck ?? Math.max(0, total * 0.1))),
    qb_hurries: Math.round(Number(gameOverride?.qb_hurries ?? Math.max(0, total * 0.12))),
    forced_fumbles: Math.round(Number(gameOverride?.forced_fumbles ?? player?.season_totals?.ff ?? player?.ff ?? Math.max(0, total * 0.05))),
    passes_defended: Math.round(Number(gameOverride?.passes_defended ?? player?.season_totals?.pd ?? player?.pd ?? Math.max(0, total * 0.08))),
  };
  const COLORS = { tfl: secondary, sacks: primary, qb_hurries: "#63B3ED", forced_fumbles: "#F56565", passes_defended: "#4299E1" };

  let order = 0;
  const events = [];
  HAVOC_EVENT_DEFS.forEach((def, ti) => {
    const count = counts[def.key];
    for (let i = 0; i < count; i++) {
      events.push({
        id: `${def.key}-${i}`,
        label: def.label,
        color: COLORS[def.key],
        zone: ZONE_ORDER[(i + ti) % 3],
        depth: def.baseDepth + (count > 1 ? (i - (count - 1) / 2) * (def.spread / (count - 1)) : 0),
        order: order++,
      });
    }
  });

  // Ordinal X — equal slots within each zone's third, centered, in order.
  const byZone = { left: [], middle: [], right: [] };
  events.forEach((e) => byZone[e.zone].push(e));
  Object.values(byZone).forEach((list) => {
    const [start, end] = ZONE_RANGE[list[0]?.zone ?? "left"];
    const width = end - start;
    list.forEach((e, i) => {
      e.x = start + ((i + 0.5) / list.length) * width;
    });
  });

  const depths = events.map((e) => e.depth);
  const maxDepth = Math.max(0, ...depths) + 5;
  const minDepth = Math.min(0, ...depths) - 5;
  const depthSpan = maxDepth - minDepth || 1;
  const topFor = (d) => ((d - minDepth) / depthSpan) * 100;
  const losTop = topFor(0);

  // Yard-line markers every 5 yards off the LOS, like real hash lines.
  const yardLines = [];
  for (let y = Math.ceil(minDepth / 5) * 5; y <= maxDepth; y += 5) {
    if (y !== 0) yardLines.push(y);
  }

  const legend = HAVOC_EVENT_DEFS.filter((def) => counts[def.key] > 0).map((def) => ({
    label: def.label,
    color: COLORS[def.key],
    count: counts[def.key],
  }));

  return (
    <Flex direction="column" h="full" w="full" p="0.4rem">
      <Flex align="center" gap="0.3rem" mb="0.3rem">
        <Box w="3px" h="10px" bg={primary} borderRadius="sm" />
        <Text fontSize="0.58rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.06em">
          Havoc Spatial Log
        </Text>
      </Flex>

      <Box
        flex={1}
        minH={0}
        position="relative"
        overflow="hidden"
        bg="linear-gradient(180deg, #1a3d1a 0%, #0d260d 100%)"
        border="1px solid rgba(255,255,255,0.15)"
      >
        {/* Yard-line markers, every 5 yards off the LOS */}
        {yardLines.map((y) => (
          <Box key={y} position="absolute" left={0} right={0} top={`${topFor(y)}%`} h="1px" bg="rgba(255,255,255,0.12)">
            <Text
              position="absolute"
              right="0.3rem"
              top={0}
              transform={y < 0 ? "translateY(2px)" : "translateY(calc(-100% - 2px))"}
              fontSize="0.4rem"
              fontWeight="800"
              color="rgba(255,255,255,0.35)"
            >
              {Math.abs(y)}
            </Text>
          </Box>
        ))}

        {/* Zone dividers — dashed, like hash lines */}
        <Box position="absolute" top={0} bottom={0} left="33.33%" w="0" borderLeft="1px dashed rgba(255,255,255,0.2)" />
        <Box position="absolute" top={0} bottom={0} left="66.67%" w="0" borderLeft="1px dashed rgba(255,255,255,0.2)" />

        {/* LOS */}
        <Box position="absolute" left={0} right={0} top={`${losTop}%`} h="2px" bg="rgba(255,255,255,0.55)" zIndex={2} />
        <Text position="absolute" left="0.3rem" top={`${losTop}%`} transform="translateY(-100%)" fontSize="0.5rem" fontWeight="900" color="rgba(255,255,255,0.75)" textTransform="uppercase">
          LOS
        </Text>

        {/* Event dots — one per occurrence, positioned by zone-slot (x) and real depth (y) */}
        {events.map((e) => (
          <Box
            key={e.id}
            position="absolute"
            left={`${e.x}%`}
            top={`${topFor(e.depth)}%`}
            transform="translate(-50%, -50%)"
            w="0.55rem"
            h="0.55rem"
            borderRadius="full"
            bg={e.color}
            border="1.5px solid rgba(255,255,255,0.85)"
            boxShadow={`0 0 0.5rem ${e.color}`}
            zIndex={3}
          />
        ))}
      </Box>

      {/* Zone axis labels */}
      <Flex justify="space-between" px="0.2rem" mt="0.15rem">
        {["LEFT", "MIDDLE", "RIGHT"].map((z) => (
          <Text key={z} fontSize="0.42rem" fontWeight="800" color="rgba(255,255,255,0.45)" textTransform="uppercase">
            {z}
          </Text>
        ))}
      </Flex>

      {/* Legend — only event types that actually occurred */}
      <Flex justify="center" gap="0.6rem" mt="0.25rem" flexWrap="wrap">
        {legend.map((l) => (
          <Flex key={l.label} align="center" gap="0.2rem">
            <Box w="0.42rem" h="0.42rem" borderRadius="full" bg={l.color} />
            <Text fontSize="0.5rem" fontWeight="800" color="rgba(255,255,255,0.75)" textTransform="uppercase">
              {l.label} {l.count}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

// ═══════════════════════════════════════════════════════════════
// KICK DISTANCE MAP (K, PK)
// ═══════════════════════════════════════════════════════════════

const KickDistanceMap = ({ player, primary, secondary }) => {
  const signal = Math.max(0, Number(player?.total_production ?? player?.par ?? 5));

  const ranges = [
    { label: "0-29", made: clamp(3 + signal * 0.2, 0, 10), att: clamp(4 + signal * 0.25, 1, 12) },
    { label: "30-39", made: clamp(2 + signal * 0.15, 0, 8), att: clamp(3 + signal * 0.2, 1, 10) },
    { label: "40-49", made: clamp(1 + signal * 0.12, 0, 6), att: clamp(2 + signal * 0.18, 1, 8) },
    { label: "50+", made: clamp(0 + signal * 0.08, 0, 4), att: clamp(1 + signal * 0.12, 1, 6) },
  ];

  return (
    <Flex direction="column" h="full" w="full" p="0.4rem">
      <Flex align="center" gap="0.3rem" mb="0.3rem">
        <Box w="3px" h="10px" bg={primary} borderRadius="sm" />
        <Text fontSize="0.52rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.06em">
          Kick Distance Chart
        </Text>
      </Flex>

      <Flex direction="column" gap="0.3rem" flex={1} justify="center">
        {ranges.map((r) => {
          const pct = r.att > 0 ? (r.made / r.att) * 100 : 0;
          return (
            <Flex key={r.label} align="center" gap="0.4rem">
              <Text fontSize="clamp(8px, 0.65vw, 10px)" fontWeight="900" color="text.secondary" w="2.2rem" textTransform="uppercase" textAlign="right">
                {r.label}
              </Text>
              <Box flex={1} h="0.55rem" bg="rgba(255,255,255,0.08)" borderRadius="sm" overflow="hidden" position="relative">
                <Box h="full" w={`${clamp(pct, 5, 100)}%`} bg={pct >= 75 ? "#68D391" : pct >= 50 ? secondary : primary} borderRadius="sm" />
              </Box>
              <Text fontSize="clamp(8px, 0.65vw, 10px)" fontWeight="900" color="white" w="2.5rem" textAlign="right">
                {r.made}/{r.att}
              </Text>
            </Flex>
          );
        })}
      </Flex>

      <Flex justify="space-between" mt="0.3rem" px="0.2rem">
        {[
          { label: "FG%", value: `${metric(ranges.reduce((s, r) => s + r.made, 0) / ranges.reduce((s, r) => s + r.att, 0) * 100, 1)}%` },
          { label: "LONG", value: `${clamp(38 + signal * 2, 30, 58)}` },
          { label: "XP", value: `${clamp(20 + signal * 2, 15, 45)}/${clamp(22 + signal * 2, 18, 48)}` },
        ].map((s) => (
          <Box key={s.label} textAlign="center">
            <Text fontSize="clamp(7px, 0.55vw, 9px)" color="text.muted" fontWeight="800" textTransform="uppercase">{s.label}</Text>
            <Text fontSize="clamp(10px, 0.85vw, 13px)" color="white" fontWeight="950">{s.value}</Text>
          </Box>
        ))}
      </Flex>
    </Flex>
  );
};

// ═══════════════════════════════════════════════════════════════
// PUNT FIELD POSITION MAP (P)
// ═══════════════════════════════════════════════════════════════

const PuntFieldPositionMap = ({ player, primary, secondary }) => {
  const signal = Math.max(0, Number(player?.total_production ?? player?.par ?? 5));

  const stats = {
    punts: clamp(25 + signal * 2, 15, 60),
    inside20: clamp(8 + signal * 0.8, 3, 25),
    inside10: clamp(4 + signal * 0.4, 1, 12),
    inside5: clamp(2 + signal * 0.2, 0, 6),
    touchbacks: clamp(3 + signal * 0.15, 0, 8),
    fairCatch: clamp(10 + signal * 0.5, 5, 20),
    avgYards: clamp(38 + signal * 0.6, 32, 48),
    netYards: clamp(35 + signal * 0.5, 28, 44),
  };

  return (
    <Flex direction="column" h="full" w="full" p="0.4rem">
      <Flex align="center" gap="0.3rem" mb="0.3rem">
        <Box w="3px" h="10px" bg={primary} borderRadius="sm" />
        <Text fontSize="0.52rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.06em">
          Punt Field Position
        </Text>
      </Flex>

      {/* Field visualization */}
      <Box flex={1} position="relative" bg="rgba(255,255,255,0.025)" border="1px solid rgba(255,255,255,0.07)" borderRadius="sm" overflow="hidden" mb="0.3rem">
        {/* Yard markers */}
        {[20, 40, 60, 80].map((m) => (
          <Box key={m} position="absolute" top="0" bottom="0" left={`${m}%`} w="1px" bg="rgba(255,255,255,0.08)" />
        ))}

        {/* Bars */}
        <Flex direction="column" justify="center" h="full" gap="0.25rem" px="0.4rem">
          {[
            { label: "Inside 20", value: stats.inside20, max: stats.punts, color: "#68D391" },
            { label: "Inside 10", value: stats.inside10, max: stats.punts, color: secondary },
            { label: "Inside 5", value: stats.inside5, max: stats.punts, color: primary },
            { label: "Touchbacks", value: stats.touchbacks, max: stats.punts, color: "#F56565" },
            { label: "Fair Catch", value: stats.fairCatch, max: stats.punts, color: "#63B3ED" },
          ].map((bar) => (
            <Flex key={bar.label} align="center" gap="0.3rem">
              <Text fontSize="clamp(6px, 0.5vw, 8px)" fontWeight="800" color="text.muted" textTransform="uppercase" w="3.2rem" textAlign="right">
                {bar.label}
              </Text>
              <Box flex={1} h="0.4rem" bg="rgba(255,255,255,0.08)" borderRadius="sm" overflow="hidden">
                <Box h="full" w={`${clamp((bar.value / bar.max) * 100, 5, 100)}%`} bg={bar.color} borderRadius="sm" />
              </Box>
              <Text fontSize="clamp(7px, 0.55vw, 9px)" fontWeight="900" color="white" w="1.2rem" textAlign="right">
                {bar.value}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Box>

      {/* Bottom stats */}
      <Grid templateColumns="repeat(4, 1fr)" gap="0.3rem">
        {[
          { label: "PUNTS", value: stats.punts },
          { label: "AVG", value: `${stats.avgYards}` },
          { label: "NET", value: `${stats.netYards}` },
          { label: "FC%", value: `${metric((stats.fairCatch / stats.punts) * 100, 0)}%` },
        ].map((s) => (
          <Box key={s.label} textAlign="center" bg="rgba(255,255,255,0.04)" borderRadius="sm" py="0.2rem">
            <Text fontSize="clamp(6px, 0.5vw, 8px)" color="text.muted" fontWeight="800" textTransform="uppercase">{s.label}</Text>
            <Text fontSize="clamp(10px, 0.8vw, 12px)" color="white" fontWeight="950">{s.value}</Text>
          </Box>
        ))}
      </Grid>
    </Flex>
  );
};

// ═══════════════════════════════════════════════════════════════
// OL COMBINED IMPACT MAP (OL) — rotates between real team-level Pass
// Protection and Run Blocking numbers for the active game. Individual O-line
// stats aren't tracked in box scores (checked: public/data/1-game center/
// games/{year}/*.json → pressure_profile[team] + advanced_team[team] are
// both team-level; no per-player OL entries exist anywhere in the schema),
// so this is framed as team context for the game, not a personal grade —
// replaces the old fabricated Pancakes/Grade numbers entirely.
// ═══════════════════════════════════════════════════════════════

// Same hold/fade rotation used by useGameSpotlight, generalized to N modes.
const useRotatingIndex = (count, holdMs = 6000, fadeMs = 400) => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useMountEffect(() => {
    if (count < 2) return undefined;
    let current = 0;
    let holdTimer;
    let fadeTimer;

    const cycle = () => {
      setVisible(true);
      holdTimer = setTimeout(() => {
        setVisible(false);
        fadeTimer = setTimeout(() => {
          current = (current + 1) % count;
          setIndex(current);
          cycle();
        }, fadeMs);
      }, holdMs);
    };

    cycle();
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(fadeTimer);
    };
  });

  return { index, visible };
};

const OLCombinedMap = ({ player, primary, secondary, gameOverride }) => {
  const signal = Math.max(0, Number(player?.total_production ?? player?.par ?? 8));

  const dropbacks = Number(gameOverride?.own_dropbacks ?? Math.round(clamp(30 + signal, 20, 45)));
  const sacksAllowed = Number(gameOverride?.sacks_taken ?? Math.max(0, Math.round(3 - signal * 0.08)));
  const hurries = Number(gameOverride?.hurries_faced ?? Math.max(0, Math.round(4 - signal * 0.1)));
  const sackRate = dropbacks > 0 ? sacksAllowed / dropbacks : 0;
  const pressureRate = Number(gameOverride?.pressure_rate_faced ?? (dropbacks > 0 ? (sacksAllowed + hurries) / dropbacks : 0));

  const lineYardsPerRush = Number(gameOverride?.line_yards_per_rush ?? clamp(1.6 + signal * 0.03, 0.8, 3.2));
  const rushOpportunityRate = Number(gameOverride?.rush_opportunity_rate ?? clamp(0.32 + signal * 0.005, 0.2, 0.55));
  const stuffRate = Number(gameOverride?.stuff_rate ?? clamp(0.4 - signal * 0.004, 0.2, 0.5));

  // Team-as-player: OL has no personal passing/rushing production, so these
  // reuse the exact PassingGridMap/RushingLaneMap components (same estimate
  // convention they already use for real skill players) to represent "the
  // offense's production while this lineman was blocking," not his own stats.
  const teamPassPlayer = {
    season_components: {
      passing_production: signal * 1.1,
      receiving_production: signal * 0.9,
      rushing_production: signal * 0.3,
    },
  };
  const teamRunPlayer = { season_components: { rushing_production: signal * 1.2 } };

  const passBottomStats = [
    { label: "DROPBACKS", value: dropbacks },
    { label: "SACKS ALLOWED", value: sacksAllowed },
    { label: "SACK RATE", value: `${metric(sackRate * 100, 1)}%` },
    { label: "PRESSURE RATE", value: `${metric(pressureRate * 100, 1)}%` },
  ];
  const runBottomStats = [
    { label: "LINE YDS/CAR", value: metric(lineYardsPerRush, 2) },
    { label: "OPPORTUNITY RATE", value: `${metric(rushOpportunityRate * 100, 0)}%` },
    { label: "STUFF RATE", value: `${metric(stuffRate * 100, 0)}%` },
  ];

  const modes = [
    { key: "pass", label: "Pass Protection" },
    { key: "run", label: "Run Blocking" },
  ];
  const { index, visible } = useRotatingIndex(modes.length);

  return (
    <Box h="full" w="full" position="relative">
      <Flex position="absolute" top="0.3rem" right="0.5rem" gap="0.3rem" zIndex={2}>
        {modes.map((m, i) => (
          <Box key={m.key} w="0.3rem" h="0.3rem" borderRadius="full" bg={i === index ? primary : "whiteAlpha.300"} />
        ))}
      </Flex>
      <Box h="full" w="full" opacity={visible ? 1 : 0} transition="opacity 0.3s ease">
        {index === 0 ? (
          <PassingGridMap player={teamPassPlayer} primary={primary} secondary={secondary} bottomStats={passBottomStats} />
        ) : (
          <RushingLaneMap player={teamRunPlayer} primary={primary} secondary={secondary} bottomOverride={runBottomStats} />
        )}
      </Box>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════
// SPECIAL TEAMS GENERIC (KO, LS, PR, KR)
// ═══════════════════════════════════════════════════════════════

const SpecialTeamsGenericMap = ({ player, primary, secondary }) => {
  const signal = Math.max(0, Number(player?.total_production ?? player?.par ?? 5));

  return (
    <Flex direction="column" h="full" w="full" p="0.4rem">
      <Flex align="center" gap="0.3rem" mb="0.3rem">
        <Box w="3px" h="10px" bg={primary} borderRadius="sm" />
        <Text fontSize="0.52rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.06em">
          Special Teams Impact
        </Text>
      </Flex>

      <Flex direction="column" gap="0.35rem" flex={1} justify="center">
        {[
          { label: "CONTROL", value: clamp(40 + signal, 0, 99) },
          { label: "FIELD POS", value: clamp(32 + signal * 1.2, 0, 99) },
          { label: "IMPACT", value: clamp(28 + signal * 1.5, 0, 99) },
          { label: "CONSISTENCY", value: clamp(35 + signal * 1.1, 0, 99) },
        ].map((item) => (
          <Flex key={item.label} align="center" gap="0.4rem">
            <Text fontSize="clamp(7px, 0.55vw, 9px)" fontWeight="900" color="text.muted" textTransform="uppercase" w="4.5rem" textAlign="right">
              {item.label}
            </Text>
            <Box flex={1} h="0.45rem" bg="rgba(255,255,255,0.08)" borderRadius="sm" overflow="hidden">
              <Box h="full" w={`${item.value}%`} bg={`linear-gradient(90deg, ${primary}, ${secondary})`} borderRadius="sm" />
            </Box>
            <Text fontSize="clamp(8px, 0.65vw, 10px)" fontWeight="900" color="white" w="1.5rem" textAlign="right">
              {metric(item.value, 0)}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

// ═══════════════════════════════════════════════════════════════
// RUSHING DIRECTION STRIP — field_map.rushing (BACKEND_RESPONSE_SPEC.md
// §4.2): a real 1x3, direction-only breakdown (no depth band, no
// completions — neither applies to a carry). Deliberately not the
// fabricated 5-zone RushingLaneMap below, which still splits one aggregate
// number by fixed ratio — this renders the three cells exactly as sent.
// ═══════════════════════════════════════════════════════════════

const RUSH_DIRECTIONS = [
  { key: "L", label: "LEFT" },
  { key: "M", label: "MIDDLE" },
  { key: "R", label: "RIGHT" },
];

const RushingDirectionStrip = ({ cells, primary }) => {
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

// ═══════════════════════════════════════════════════════════════
// PRODUCTION-KIND TOGGLE — field_map.views (BACKEND_RESPONSE_SPEC.md §4.2)
// names which spatial breakdowns this player actually has; a player with
// more than one (a QB with real rushing production) gets a toggle. views
// is the authoritative source — season_components (productionComponents)
// is only a fallback for players with no profile document at all, where
// neither view has real data anyway.
// ═══════════════════════════════════════════════════════════════

const KIND_LABEL = { passing: "PASS", rushing: "RUSH", receiving: "REC" };
const KIND_HEADLINE = { passing: "Passing", rushing: "Rushing", receiving: "Receiving" };
const COMPONENT_TO_VIEW = { passing_production: "passing", rushing_production: "rushing", receiving_production: "receiving" };

const ProductionKindToggle = ({ kinds, active, onChange, primary }) => (
  <Flex position="absolute" top="0.3rem" right="0.3rem" zIndex={2} gap="2px" bg="rgba(0,0,0,0.45)" borderRadius="sm" p="2px">
    {kinds.map((kind) => (
      <Box
        key={kind}
        as="button"
        type="button"
        onClick={() => onChange(kind)}
        px="0.32rem"
        py="0.08rem"
        borderRadius="xs"
        bg={active === kind ? primary : "transparent"}
        cursor="pointer"
      >
        <Text fontSize="0.42rem" fontWeight="900" letterSpacing="0.04em" color={active === kind ? "white" : "rgba(255,255,255,0.6)"}>
          {KIND_LABEL[kind] ?? kind}
        </Text>
      </Box>
    ))}
  </Flex>
);

const ProductionKindUnavailable = ({ kind }) => (
  <Flex direction="column" h="full" w="full" align="center" justify="center" p="0.5rem" gap="0.25rem" textAlign="center">
    <Text fontSize="0.58rem" fontWeight="900" color="text.secondary" textTransform="uppercase" letterSpacing="0.06em">
      {KIND_HEADLINE[kind] ?? kind} Field Map
    </Text>
    <Text fontSize="0.5rem" fontWeight="700" color="text.muted">
      Spatial data not available for this production type yet.
    </Text>
  </Flex>
);

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT — Position Router
// ═══════════════════════════════════════════════════════════════

export const PlayerProductionMap = ({ player, primary, secondary, gameOverride, fieldMap, fieldMapViews, depthBands, productionComponents }) => {
  const position = getPosition(player);

  // fieldMap is the active game's {passing, rushing} block (or undefined
  // for a player with no profile document, which keeps the legacy
  // fabricated fallbacks below untouched).
  const availableKinds = fieldMapViews?.length
    ? fieldMapViews
    : Object.entries(productionComponents ?? {})
        .filter(([, value]) => Number(value) > 0)
        .map(([key]) => COMPONENT_TO_VIEW[key] ?? key);
  const [activeKind, setActiveKind] = useState(null);
  const kind = activeKind ?? (availableKinds.includes("passing") ? "passing" : availableKinds[0]);

  if (POSITION_GROUPS.PASS.has(position) && availableKinds.length > 1) {
    const view = fieldMap?.[kind];
    return (
      <Box position="relative" h="full" w="full">
        <ProductionKindToggle kinds={availableKinds} active={kind} onChange={setActiveKind} primary={primary} />
        {kind === "passing" ? (
          <PassingGridMap player={player} primary={primary} secondary={secondary} fieldMap={view?.cells} depthBands={depthBands} />
        ) : kind === "rushing" && view?.available ? (
          <RushingDirectionStrip cells={view.cells} primary={primary} />
        ) : (
          <ProductionKindUnavailable kind={kind} />
        )}
      </Box>
    );
  }

  if (POSITION_GROUPS.PASS.has(position)) {
    return <PassingGridMap player={player} primary={primary} secondary={secondary} fieldMap={fieldMap?.passing?.cells} depthBands={depthBands} />;
  }
  if (POSITION_GROUPS.RUN.has(position)) {
    return <RushingLaneMap player={player} primary={primary} secondary={secondary} gameOverride={gameOverride} />;
  }
  if (POSITION_GROUPS.DEF.has(position)) {
    return <HavocSpatialMap player={player} primary={primary} secondary={secondary} gameOverride={gameOverride} />;
  }
  if (POSITION_GROUPS.K.has(position)) {
    return <KickDistanceMap player={player} primary={primary} secondary={secondary} />;
  }
  if (POSITION_GROUPS.P.has(position)) {
    return <PuntFieldPositionMap player={player} primary={primary} secondary={secondary} />;
  }
  if (POSITION_GROUPS.OL.has(position)) {
    return <OLCombinedMap player={player} primary={primary} secondary={secondary} gameOverride={gameOverride} />;
  }
  if (POSITION_GROUPS.ST.has(position)) {
    return <SpecialTeamsGenericMap player={player} primary={primary} secondary={secondary} />;
  }

  // Default fallback
  return <PassingGridMap player={player} primary={primary} secondary={secondary} />;
};
