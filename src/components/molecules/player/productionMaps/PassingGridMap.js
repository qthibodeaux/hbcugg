import { getComponent, buildRealGrid, clamp, getCellColor, getCellTextColor } from "./playerMapModel";
import { Flex, Box, Text, Grid } from "@chakra-ui/react";

export const PassingGridMap = ({ player, primary, secondary, bottomStats, fieldMap, depthBands }) => {
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
