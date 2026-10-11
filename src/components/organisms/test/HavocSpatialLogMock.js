import { Box, Flex, Text } from "@chakra-ui/react";
import { getTeamColor, getTeamDisplayName } from "./QGameBoxScore";

// ═══════════════════════════════════════════════════════════════════════════════
// HAVOC SPATIAL LOG — mock of the intended design, not a working chart
// ═══════════════════════════════════════════════════════════════════════════════
// This is a concept demo for `reqs/STATS_HUB_CARD_INVENTORY.md` ask #11. Nothing
// here is wired to a game — every point is either a real play read by hand off
// play-by-play text (marked REAL below) or an invented one filling out a category
// this session hadn't hit an example of yet (marked MOCK). It exists to show a
// backend engineer exactly what shape of per-play data would make this chart real.
//
// THE AXES
//   x — lane (left / middle / right), same three columns as the rushing lane chart.
//       A play with no direction field (a sack has none) gets coordinated into
//       whichever lane the play call implies. Position WITHIN a lane carries no
//       meaning of its own — it only exists so dots in the same lane don't overlap.
//       Each lane's band WIDTH is data-driven: it's sized to fit however many
//       events landed in it, so a lane with four hits is wider than one with one.
//   y — yards from the line of scrimmage, signed, where the havoc event itself
//       physically happened: `yardline_absolute(event) − yardline_absolute(LOS)`.
//       A TFL/sack tackle spot is behind the LOS → negative. A pass breakup or
//       pick is measured at the thrown-to / intercepted-at spot, which is usually
//       downfield → positive; a ball batted down right at the LOS reads near 0.
//
// REAL anchors (read off actual play text this session):
//   TFL  middle  y=-3   "Hostzclaw,Jamarie rush middle for 3 yards loss to the
//                         ALST24 (Givens,Ckelby)."
//   Sack middle  y=-4   "Body,Andrew sacked for loss of 4 yards to the ALST17
//                         (Givens,Ckelby)." — no direction field on a sack, so
//                         it's coordinated into the same lane as the other hit.
//   PBU  right   y=0    "McCoy,Cam'Ron pass incomplete short right to
//                         Richardson,Roriyon thrown to TSU46 broken up by
//                         Harris,Nahamani" — thrown-to spot equals the LOS.
//
// Everything else below is invented to round the legend out to all five havoc
// categories and to make the lane-width reflow visible (4 left / 3 middle / 2
// right, on purpose, so the bands read as different widths).
// ═══════════════════════════════════════════════════════════════════════════════

const CATEGORY = {
  TFL: { label: "TFL", color: "#E8A33D" },
  SACK: { label: "Sack", color: "#C0453A" },
  PBU: { label: "PBU", color: "#3D9AE8" },
  INT: { label: "INT", color: "#A15DE8" },
  FF: { label: "FF", color: "#4FBF7A" },
};

const LANES = [
  {
    key: "left",
    label: "Left",
    events: [
      { cat: "TFL", y: -1, real: false, note: "Invented — fills out the lane." },
      { cat: "TFL", y: -2, real: false, note: "Invented — fills out the lane." },
      { cat: "SACK", y: -5, real: false, note: "Invented — fills out the lane." },
      { cat: "FF", y: 4, real: false, note: "Invented — fills out the lane." },
    ],
  },
  {
    key: "middle",
    label: "Middle",
    events: [
      { cat: "TFL", y: -3, real: true, note: "Hostzclaw,Jamarie rush middle, TFL by Givens/Ckelby." },
      { cat: "SACK", y: -4, real: true, note: "Body,Andrew sacked; no direction field, coordinated to middle." },
      { cat: "INT", y: 8, real: false, note: "Invented — fills out the lane." },
    ],
  },
  {
    key: "right",
    label: "Right",
    events: [
      { cat: "PBU", y: 0, real: true, note: "McCoy pass right, broken up by Harris; thrown-to spot = LOS." },
      { cat: "PBU", y: 15, real: false, note: "Invented — shows a breakup measured well downfield." },
    ],
  },
];

const TEAM_KEY = "swacasu";
const CHART_H = "clamp(9rem, 17vw, 13rem)";
const LANE_GAP = "1.25rem";

const Dot = ({ event, index, count, topPct }) => {
  const meta = CATEGORY[event.cat];
  const leftPct = ((index + 0.5) / count) * 100;

  return (
    <Box
      position="absolute"
      title={event.note}
      style={{ left: `${leftPct}%`, top: `${topPct}%` }}
      transform="translate(-50%, -50%)"
    >
      <Box
        w="0.625rem"
        h="0.625rem"
        borderRadius="full"
        bg={event.real ? meta.color : "transparent"}
        border="0.125rem solid"
        borderColor={meta.color}
        opacity={event.real ? 1 : 0.75}
      />
    </Box>
  );
};

const LaneBand = ({ lane, yTop, yBottom, isLast }) => {
  const span = yTop - yBottom;
  const toPct = (y) => ((yTop - y) / span) * 100;

  return (
    <Flex
      direction="column"
      flex={`${Math.max(lane.events.length, 1)} 1 0`}
      minW="4.5rem"
      borderRight={isLast ? "none" : "0.0625rem dashed"}
      borderColor="whiteAlpha.150"
      pr={isLast ? 0 : LANE_GAP}
      mr={isLast ? 0 : LANE_GAP}
    >
      <Box position="relative" h={CHART_H}>
        {lane.events.map((ev, i) => (
          <Dot key={i} event={ev} index={i} count={lane.events.length} topPct={toPct(ev.y)} />
        ))}
      </Box>
      <Text
        mt="0.5rem"
        textAlign="center"
        fontSize="clamp(0.5rem, 0.65vw, 0.6rem)"
        fontWeight="900"
        color="rgba(255,255,255,0.7)"
        textTransform="uppercase"
        letterSpacing="0.1em"
      >
        {lane.label}
      </Text>
      <Text textAlign="center" fontSize="clamp(0.42rem, 0.55vw, 0.52rem)" fontWeight="800" color="rgba(255,255,255,0.32)">
        {lane.events.length} event{lane.events.length === 1 ? "" : "s"}
      </Text>
    </Flex>
  );
};

const LegendDot = ({ meta }) => (
  <Flex align="center" gap="0.3125rem" minW={0}>
    <Box w="0.5rem" h="0.5rem" borderRadius="full" border="0.125rem solid" borderColor={meta.color} bg={meta.color} flexShrink={0} />
    <Text
      fontSize="clamp(0.42rem, 0.55vw, 0.53rem)"
      fontWeight="800"
      color="rgba(255,255,255,0.45)"
      textTransform="uppercase"
      letterSpacing="0.08em"
    >
      {meta.label}
    </Text>
  </Flex>
);

/**
 * The chart itself — LOS baseline, three reflowing lane bands, legend, footnote.
 * Split out so `DefenderSpotlight` (Defense box score) can drop it in under a
 * spotlight's chips without a second card frame around it; `bare` skips the
 * eyebrow and outer card chrome that the standalone lab entry still wants.
 */
export const HavocSpatialLogChart = ({ bare = false }) => {
  const allY = LANES.flatMap((l) => l.events.map((e) => e.y));
  const rawMax = Math.max(...allY);
  const rawMin = Math.min(...allY);
  const pad = Math.max(3, (rawMax - rawMin) * 0.18);
  const yTop = rawMax + pad;
  const yBottom = rawMin - pad;
  const losPct = ((yTop - 0) / (yTop - yBottom)) * 100;

  return (
    <Flex direction="column" gap="0.5rem">
      {!bare && (
        <Text fontSize="clamp(0.48rem, 0.6vw, 0.58rem)" fontWeight="700" color="rgba(255,255,255,0.4)" lineHeight={1.3} flexShrink={0}>
          x = lane the play went; y = yards from the LOS where the havoc happened. Solid dots are read off real play text, ringed dots fill out categories with no example yet.
        </Text>
      )}

      <Box position="relative">
        {/* LOS baseline, drawn once across every lane. */}
        <Box
          position="absolute"
          left={0}
          right={0}
          h="0.0625rem"
          bg="rgba(255,255,255,0.3)"
          zIndex={2}
          style={{ top: `calc(${losPct}% )` }}
        />
        <Text
          position="absolute"
          left={0}
          fontSize="clamp(0.4rem, 0.5vw, 0.48rem)"
          fontWeight="900"
          color="rgba(255,255,255,0.4)"
          style={{ top: `calc(${losPct}% - 0.7rem)` }}
        >
          LOS
        </Text>

        <Flex h={bare ? "clamp(4rem, 6vw, 5.5rem)" : CHART_H}>
          {LANES.map((lane, i) => (
            <LaneBand key={lane.key} lane={lane} yTop={yTop} yBottom={yBottom} isLast={i === LANES.length - 1} />
          ))}
        </Flex>
      </Box>

      <Flex pt="0.5rem" borderTop="0.0625rem solid" borderColor="whiteAlpha.100" gap="0.75rem" wrap="wrap" flexShrink={0}>
        {Object.values(CATEGORY).map((meta) => (
          <LegendDot key={meta.label} meta={meta} />
        ))}
      </Flex>

      <Text fontSize="clamp(0.4rem, 0.5vw, 0.46rem)" fontWeight="700" color="rgba(255,255,255,0.28)" flexShrink={0}>
        {bare
          ? "Concept — not live. Needs a per-play havoc entry with category + yardline_absolute per player. Ask #11."
          : "Needs from backend: a per-play havoc entry with category + the event's own yardline_absolute, attributed to a player. See STATS_HUB_CARD_INVENTORY.md ask #11."}
      </Text>
    </Flex>
  );
};

export const HavocSpatialLogMock = () => {
  const accent = getTeamColor(TEAM_KEY);

  return (
    <Flex
      direction="column"
      h="full"
      w="full"
      bg="#141416"
      borderRadius="xl"
      border="0.0625rem solid"
      borderColor="whiteAlpha.100"
      overflow="hidden"
    >
      {/* Eyebrow — house standard: accent dot, label, hairline. */}
      <Flex align="center" gap="0.5rem" px="0.875rem" py="0.625rem" borderBottom="0.0625rem solid" borderColor="whiteAlpha.100" flexShrink={0}>
        <Box w="0.375rem" h="0.375rem" bg={accent} borderRadius="full" flexShrink={0} />
        <Text
          fontSize="clamp(0.55rem, 0.68vw, 0.7rem)"
          fontWeight="black"
          color="rgba(255,255,255,0.55)"
          textTransform="uppercase"
          letterSpacing="0.16em"
          lineHeight={1.1}
        >
          Havoc Spatial Log — Concept
        </Text>
        <Text
          ml="auto"
          fontSize="clamp(0.45rem, 0.58vw, 0.56rem)"
          fontWeight="800"
          color="rgba(255,255,255,0.3)"
          textTransform="uppercase"
          letterSpacing="0.1em"
          flexShrink={0}
        >
          {getTeamDisplayName(TEAM_KEY)} · mock, not live
        </Text>
      </Flex>

      <Flex direction="column" flex="1" minH={0} px="0.875rem" py="0.75rem">
        <HavocSpatialLogChart />
      </Flex>
    </Flex>
  );
};

export default HavocSpatialLogMock;
