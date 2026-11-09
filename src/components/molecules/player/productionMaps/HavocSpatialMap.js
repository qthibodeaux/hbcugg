import { ZONE_ORDER, ZONE_RANGE, HAVOC_TYPES } from "./playerMapModel";
import { Flex, Box, Text } from "@chakra-ui/react";

export const HavocSpatialMap = ({ primary, secondary, havoc }) => {
  const COLORS = { tfl: secondary, sack: primary, qb_hurry: "#63B3ED", forced_fumble: "#F56565", pass_breakup: "#4299E1", interception: "#68D391" };
  const all = havoc?.available ? havoc.events ?? [] : [];

  // Events the backend located (a zone and a depth) are drawn; the rest still count in the legend.
  const events = all
    .filter((e) => ZONE_ORDER.includes(e.zone) && e.depth != null && Number.isFinite(Number(e.depth)))
    .map((e, i) => ({ id: `${e.type}-${i}`, type: e.type, zone: e.zone, depth: Number(e.depth), color: COLORS[e.type] ?? "#FFFFFF" }));

  const byZone = { left: [], middle: [], right: [] };
  events.forEach((e) => byZone[e.zone].push(e));
  Object.entries(byZone).forEach(([zone, list]) => {
    const [start, end] = ZONE_RANGE[zone];
    list.forEach((e, i) => {
      e.x = start + ((i + 0.5) / list.length) * (end - start);
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

  // Legend: what the box score credits — the events' own credits added up, so a
  // shared half-TFL reads 0.5 like the stat line, not one play.
  const creditOf = (type) => all.filter((e) => e.type === type).reduce((n, e) => n + (Number(e.credit) || 1), 0);
  const legend = HAVOC_TYPES.map((t) => ({ label: t.label, color: COLORS[t.type], count: Math.round(creditOf(t.type) * 10) / 10 })).filter((l) => l.count > 0);

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

        {all.length === 0 && (
          <Text position="absolute" left={0} right={0} top="62%" textAlign="center" fontSize="0.5rem" fontWeight="800" color="rgba(255,255,255,0.45)" textTransform="uppercase" letterSpacing="0.1em">
            {havoc?.available ? "No havoc plays" : "—"}
          </Text>
        )}

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
