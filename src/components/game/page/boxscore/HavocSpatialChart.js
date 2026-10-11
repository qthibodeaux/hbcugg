import { Box, Flex, Text } from "@chakra-ui/react";

// ═══════════════════════════════════════════════════════════════════════════════
// HAVOC SPATIAL CHART — one dot per havoc play the defender made
// ═══════════════════════════════════════════════════════════════════════════════
// Reads `havoc_events[]` off the defender's `individual_stats.defense` row. Each
// event arrives with its coordinate already worked out by the backend:
//
//   { play_id, category: "TFL" | "SACK" | "PBU" | "INT" | "FF",
//     lane: "left" | "middle" | "right",        // the play's direction
//     yards: number | null }                     // event spot − LOS, signed (was yards_from_los)
//
// The frontend only places it. x: the lane picks the band, and every event in a
// band gets its own column so nothing stacks — bands are sized to the busiest lane
// (two in the middle → six columns: left 1–2, middle 3–4, right 5–6). y: the yards
// from the LOS, with the axis spanning the events plus headroom; the LOS is the
// zero line. Nothing is computed from play text here.

export const HAVOC_CATEGORY = {
  TFL: { label: "TFL", color: "#E8A33D" },
  SACK: { label: "Sack", color: "#C0453A" },
  PBU: { label: "PBU", color: "#3D9AE8" },
  INT: { label: "INT", color: "#A15DE8" },
  FF: { label: "FF", color: "#4FBF7A" },
};

const LANES = [
  { key: "left", label: "Left" },
  { key: "middle", label: "Middle" },
  { key: "right", label: "Right" },
];

const normCategory = (raw) => {
  const c = String(raw ?? "").toUpperCase().replace(/[^A-Z_]/g, "");
  if (c === "PASS_DEFENSED" || c === "PD" || c === "PBU") return "PBU";
  if (c === "FORCED_FUMBLE" || c === "FF") return "FF";
  if (c === "INTERCEPTION" || c === "INT") return "INT";
  if (c === "SACK") return "SACK";
  if (c === "TFL") return "TFL";
  return null;
};

/** Backend rows → plotted events, dropping anything without a lane, a y, or a known category. */
export const toHavocEvents = (rows) =>
  (Array.isArray(rows) ? rows : [])
    .map((r) => ({
      id: r.play_id ?? null,
      cat: normCategory(r.category),
      lane: String(r.lane ?? "").toLowerCase(),
      y: typeof r.yards === "number" ? r.yards : typeof r.yards_from_los === "number" ? r.yards_from_los : null,
    }))
    .filter((e) => e.cat && LANES.some((l) => l.key === e.lane) && e.y != null);

const Dot = ({ event, leftPct, topPct }) => {
  const meta = HAVOC_CATEGORY[event.cat];
  return (
    <Box
      position="absolute"
      title={`${meta.label} · ${event.lane} · ${event.y > 0 ? "+" : ""}${event.y} yds`}
      style={{ left: `${leftPct}%`, top: `${topPct}%` }}
      transform="translate(-50%, -50%)"
      zIndex={3}
    >
      <Box w="0.7rem" h="0.7rem" borderRadius="full" bg={meta.color} boxShadow="0 0 0 2px rgba(20,20,22,0.9)" />
    </Box>
  );
};

const LegendDot = ({ meta }) => (
  <Flex align="center" gap="0.3125rem" minW={0}>
    <Box w="0.5rem" h="0.5rem" borderRadius="full" bg={meta.color} flexShrink={0} />
    <Text fontSize="clamp(0.42rem, 0.55vw, 0.53rem)" fontWeight="800" color="rgba(255,255,255,0.45)" textTransform="uppercase" letterSpacing="0.08em">
      {meta.label}
    </Text>
  </Flex>
);

export const HavocSpatialChart = ({ events, height = "clamp(4.5rem, 7vw, 6rem)" }) => {
  const byLane = LANES.map((lane) => ({ ...lane, events: events.filter((e) => e.lane === lane.key) }));
  const perLane = Math.max(1, ...byLane.map((l) => l.events.length));
  const columns = perLane * LANES.length;
  const hasEvents = events.length > 0;

  // y-axis: the events plus headroom, never tighter than a few yards either side of
  // the LOS so a single dot doesn't sit on the frame edge.
  const ys = events.map((e) => e.y);
  const yTop = Math.max(2, ...ys) + 2;
  const yBottom = Math.min(-2, ...ys) - 2;
  const span = yTop - yBottom;
  const toTop = (y) => ((yTop - y) / span) * 100;
  const losPct = toTop(0);

  return (
    <Flex direction="column" gap="0.5rem" minW={0}>
      <Box position="relative">
        {/* LOS — the zero line, drawn once across every lane. */}
        <Box position="absolute" left={0} right={0} h="0.0625rem" bg="rgba(255,255,255,0.3)" zIndex={2} style={{ top: `${losPct}%` }} />
        <Text position="absolute" left={0} fontSize="clamp(0.4rem, 0.5vw, 0.48rem)" fontWeight="900" color="rgba(255,255,255,0.4)" zIndex={2} style={{ top: `calc(${losPct}% - 0.7rem)` }}>
          LOS
        </Text>
        {/* y ticks at the frame's top and bottom, so the scale is readable. */}
        <Text position="absolute" right={0} top={0} fontSize="clamp(0.38rem, 0.48vw, 0.46rem)" fontWeight="800" color="rgba(255,255,255,0.28)">
          +{yTop}
        </Text>
        <Text position="absolute" right={0} bottom={0} fontSize="clamp(0.38rem, 0.48vw, 0.46rem)" fontWeight="800" color="rgba(255,255,255,0.28)">
          {yBottom}
        </Text>

        {/* The column grid: `columns` equal slots across the width, each lane owning
            `perLane` of them in order. A dot sits at the centre of its slot. */}
        <Box position="relative" h={height}>
          {byLane.map((lane, li) => {
            const startCol = li * perLane;
            const leftPct = (startCol / columns) * 100;
            const widthPct = (perLane / columns) * 100;
            return (
              <Box
                key={lane.key}
                position="absolute"
                top={0}
                bottom={0}
                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                borderRight={li < LANES.length - 1 ? "0.0625rem dashed" : "none"}
                borderColor="whiteAlpha.150"
              >
                {lane.events.map((ev, i) => (
                  <Dot key={ev.id ?? i} event={ev} leftPct={((i + 0.5) / perLane) * 100} topPct={toTop(ev.y)} />
                ))}
              </Box>
            );
          })}
          {!hasEvents && (
            <Flex position="absolute" inset={0} align="center" justify="center">
              <Text fontSize="clamp(0.45rem, 0.58vw, 0.55rem)" fontWeight="800" color="rgba(255,255,255,0.3)" textTransform="uppercase" letterSpacing="0.12em">
                No havoc events on file
              </Text>
            </Flex>
          )}
        </Box>

        {/* Lane labels + counts, under the frame. */}
        <Flex mt="0.4rem">
          {byLane.map((lane) => (
            <Box key={lane.key} flex="1 1 0" minW={0} textAlign="center">
              <Text fontSize="clamp(0.5rem, 0.65vw, 0.6rem)" fontWeight="900" color="rgba(255,255,255,0.7)" textTransform="uppercase" letterSpacing="0.1em">
                {lane.label}
              </Text>
              <Text fontSize="clamp(0.42rem, 0.55vw, 0.52rem)" fontWeight="800" color="rgba(255,255,255,0.32)">
                {lane.events.length} event{lane.events.length === 1 ? "" : "s"}
              </Text>
            </Box>
          ))}
        </Flex>
      </Box>

      <Flex pt="0.5rem" borderTop="0.0625rem solid" borderColor="whiteAlpha.100" gap="0.75rem" wrap="wrap" flexShrink={0}>
        {Object.values(HAVOC_CATEGORY).map((meta) => (
          <LegendDot key={meta.label} meta={meta} />
        ))}
      </Flex>
    </Flex>
  );
};
