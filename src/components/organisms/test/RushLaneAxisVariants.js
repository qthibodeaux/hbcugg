import { useMemo } from "react";
import { Box, Flex, Grid, Spinner, Text } from "@chakra-ui/react";
import { useGameData } from "../../../hooks/useSWACData";
import { getTeamColor, getTeamSecondary, getTeamDisplayName } from "./QGameBoxScore";
import { heatAccent } from "../../game/page/boxscore/ProductionPrimitives";

// ═══════════════════════════════════════════════════════════════════════════════
// RUSH LANE AXIS — four readings of one back's game
// ═══════════════════════════════════════════════════════════════════════════════
// Three bars (left / middle / right), each split into the three things a carry can
// be made of: yardage lost, yardage the line blocked for, and yardage the back added
// himself. The four variants differ ONLY in what bar height means. Everything else —
// fixture, lane assignment, phase maths, colour — is identical, so the comparison is
// about the axis and nothing else.
//
// FIXTURE: Tre Bradford, Grambling at Pine Bluff (gsuuapb25), 25-133, 2 TD.
// Picked because his three directions genuinely disagree — he ran middle more than
// twice as often as anywhere else and got the least out of it, and barely ran right
// and gained the most per touch. So each axis crowns a different direction, which is
// the only way this test tells us anything.
//
//   left    6 car   36 yds    6.0 ypc
//   middle 14 car   42 yds    3.0 ypc
//   right   5 car   55 yds   11.0 ypc

// ─── Line yards ──────────────────────────────────────────────────────────────
// Connelly's college advanced box score (inspo/abs2.jpg), whose own notes read:
// "a line gets 100% credit for 0-3 yards in a carry, 50% for 4-6, 125% for losses."
// The 125% is stale — his printed numbers are 120% (Chase Brice, 1 carry for -1,
// prints LY/Carry -1.20; Mac Jones, 1 for -2, prints -2.40). We follow the numbers.
// The 4.5 ceiling falls out of the tiers rather than being a separate cap rule:
// three yards at full credit plus three at half.
const lineYards = (gain) => (gain <= 0 ? 1.2 * gain : Math.min(gain, 3) + 0.5 * Math.max(0, Math.min(gain, 6) - 3));

// ─── MOCK: which carries went which way ──────────────────────────────────────
// The 25 gains below are real — they come straight off the play-by-play RUSH
// actions and reconcile exactly with individual_stats (25 carries, 133 yards).
// Their DIRECTION is invented: `rushDirection` is null on all 5,064 RUSH actions in
// the feed, and direction survives only as the aggregate {attempts, yards} triple in
// `direction_breakdown`. So the split below is a partition chosen to reproduce that
// aggregate exactly — 6/36, 14/42, 5/55 — and every variant is driven from this one
// assignment so the four charts are the same game seen four ways.
const LANE_CARRIES = {
  left: [12, 11, 6, 4, 3, 0],
  middle: [11, 7, 7, 4, 3, 3, 3, 3, 3, 2, 1, 0, -2, -3],
  right: [17, 15, 13, 10, 0],
};

const GAME_ID = "gsuuapb25";
const TEAM_KEY = "swacgsu";
const PLAYER = "Bradford,Tre";

const LANES = [
  { key: "left", label: "Left" },
  { key: "middle", label: "Middle" },
  { key: "right", label: "Right" },
];

/**
 * Split one lane's carries into three pieces that sum exactly to its actual yardage.
 *
 * The 120% loss weight can't be used for the split itself: a -4 carry would get -4.8
 * of line credit, leaving a phantom +0.8 of "highlight" on a play where the back did
 * nothing. So losses are carried whole in their own segment and the line/highlight
 * split is taken over the gaining carries only. That keeps stuff + line + highlight
 * identically equal to the lane's real yards, which is the property the whole chart
 * rests on. The 120% weighting stays where it belongs — in the printed LY/Car figure,
 * which is a rating of the line, not an accounting of the yards.
 */
const splitLane = (carries) => {
  const gains = carries.filter((c) => c > 0);
  const line = gains.reduce((s, c) => s + lineYards(c), 0);
  const gained = gains.reduce((s, c) => s + c, 0);
  const stuffCarries = carries.filter((c) => c <= 0);
  return {
    att: carries.length,
    yards: carries.reduce((s, c) => s + c, 0),
    stuff: stuffCarries.reduce((s, c) => s + c, 0), // ≤ 0, drawn below the axis
    line,
    highlight: gained - line,
    // Carry COUNTS, for the percent-of-snaps reading. The buckets are exclusive by
    // construction: under the 0-3 / 4-6 tiers a gain of 1-3 generates exactly zero
    // highlight yards, so "line only" and "highlight" can't both claim a carry.
    stuffCount: stuffCarries.length,
    lineOnlyCount: carries.filter((c) => c >= 1 && c <= 3).length,
    highlightCount: carries.filter((c) => c >= 4).length,
  };
};

// ─── The four axes ───────────────────────────────────────────────────────────
// Each returns the three segment magnitudes for one lane, in the axis's own units.
// Three of the four are the same numbers over a different denominator; percent-of-
// snaps is the only one that counts carries instead of measuring yards.
const AXES = {
  yards: {
    name: "Raw yardage",
    caption: "Bar height = total yards gained in that direction",
    fmt: (v) => (Math.round(v) === v ? String(v) : v.toFixed(1)),
    legend: ["Yards lost", "Line yards", "Highlight yards"],
    parts: (l) => ({ stuff: l.stuff, line: l.line, highlight: l.highlight }),
    total: (l) => l.yards,
  },
  perCarry: {
    name: "Yards per carry",
    caption: "Bar height = yards per carry in that direction",
    fmt: (v) => v.toFixed(1),
    legend: ["Yards lost / car", "Line yds / car", "Hlt yds / car"],
    parts: (l) => ({ stuff: l.stuff / l.att, line: l.line / l.att, highlight: l.highlight / l.att }),
    total: (l) => l.yards / l.att,
  },
  pctYards: {
    name: "Share of yardage",
    caption: "Bar height = 100% of that direction's yardage, whoever earned it",
    fmt: (v) => `${Math.round(v)}%`,
    legend: ["Yards lost", "Line yards", "Highlight yards"],
    parts: (l) => {
      const mag = Math.abs(l.stuff) + Math.abs(l.line) + Math.abs(l.highlight) || 1;
      return {
        stuff: (l.stuff / mag) * 100,
        line: (l.line / mag) * 100,
        highlight: (l.highlight / mag) * 100,
      };
    },
    total: (l) => ((l.yards / (Math.abs(l.stuff) + Math.abs(l.line) + Math.abs(l.highlight) || 1)) * 100),
  },
  pctSnaps: {
    name: "Share of snaps",
    caption: "Bar height = 100% of that direction's carries, sorted by what happened",
    fmt: (v) => `${Math.round(v)}%`,
    legend: ["Stuffed (≤ 0)", "Line only (1-3)", "Highlight (4+)"],
    parts: (l) => ({
      stuff: (-l.stuffCount / l.att) * 100,
      line: (l.lineOnlyCount / l.att) * 100,
      highlight: (l.highlightCount / l.att) * 100,
    }),
    total: (l) => ((l.lineOnlyCount + l.highlightCount - l.stuffCount) / l.att) * 100,
  },
};

const CHART_H = "clamp(8rem, 16vw, 12.5rem)";
const COL_GAP = "0.75rem";
const STUFF_COLOR = "#C0453A";

/**
 * One lane's stack. Line sits against the axis and highlight rides on top of it, so
 * the bar reads bottom-to-top in the order the yards were actually earned: this is
 * how far the blocking got him, and this is what he added past it. Losses hang below.
 */
const LaneBar = ({ parts, domain, zeroTop, accent }) => {
  const h = (v) => (Math.abs(v) / domain) * 100;

  const lineH = h(parts.line);
  const hlH = h(parts.highlight);
  const stuffH = h(parts.stuff);

  return (
    <Box position="relative" h="full">
      {/* Positive stack, growing up from the axis. */}
      <Box
        position="absolute"
        left="18%"
        right="18%"
        bg={accent}
        opacity={0.42}
        borderRadius="0.125rem 0.125rem 0 0"
        style={{ top: `${zeroTop - lineH}%`, height: `${lineH}%` }}
      />
      <Box
        position="absolute"
        left="18%"
        right="18%"
        bg={accent}
        borderRadius="0.125rem 0.125rem 0 0"
        style={{ top: `${zeroTop - lineH - hlH}%`, height: `${hlH}%` }}
      />
      {/* Losses, below the axis. */}
      {stuffH > 0 && (
        <Box
          position="absolute"
          left="18%"
          right="18%"
          bg={STUFF_COLOR}
          borderRadius="0 0 0.125rem 0.125rem"
          style={{ top: `${zeroTop}%`, height: `${stuffH}%` }}
        />
      )}
    </Box>
  );
};

const LegendDot = ({ color, opacity = 1, label }) => (
  <Flex align="center" gap="0.3125rem" minW={0}>
    <Box w="0.5rem" h="0.5rem" borderRadius="0.125rem" bg={color} opacity={opacity} flexShrink={0} />
    <Text
      fontSize="clamp(0.42rem, 0.55vw, 0.53rem)"
      fontWeight="800"
      color="rgba(255,255,255,0.45)"
      textTransform="uppercase"
      letterSpacing="0.08em"
      lineClamp={1}
    >
      {label}
    </Text>
  </Flex>
);

const RushLaneAxisChart = ({ axis }) => {
  const spec = AXES[axis];
  const { game, isLoading } = useGameData(GAME_ID);

  const model = useMemo(() => {
    const lanes = LANES.map((l) => ({ ...l, ...splitLane(LANE_CARRIES[l.key]) }));
    const row = (game?.individual_stats?.[TEAM_KEY]?.rushing ?? []).find((r) => r.name === PLAYER);

    // The lane assignment is mock, but it is mock ANCHORED to the real aggregate.
    // If a future export moves those numbers, say so on the card rather than quietly
    // drawing a partition that no longer reproduces the game.
    const db = row?.direction_breakdown ?? null;
    const anchored =
      !db ||
      lanes.every(
        (l) => (db[l.key]?.attempts ?? l.att) === l.att && (db[l.key]?.yards ?? l.yards) === l.yards
      );

    return { lanes, row, anchored };
  }, [game]);

  const { lanes, row, anchored } = model;

  const accent = heatAccent(getTeamColor(TEAM_KEY), getTeamSecondary(TEAM_KEY));

  // One domain across the three bars so their heights are comparable, with the axis
  // at the same height in every lane. Under the percent readings every bar spans the
  // full domain by construction; under the yardage readings they differ, which is
  // exactly the information those axes exist to carry.
  const parts = lanes.map((l) => spec.parts(l));
  const posMax = Math.max(0.001, ...parts.map((p) => Math.max(0, p.line) + Math.max(0, p.highlight)));
  const negMax = Math.max(0, ...parts.map((p) => Math.abs(Math.min(0, p.stuff))));
  const domain = posMax + negMax;
  const zeroTop = (posMax / domain) * 100;

  if (isLoading) {
    return (
      <Flex h="full" w="full" align="center" justify="center" bg="#141416" borderRadius="xl">
        <Spinner size="sm" color="whiteAlpha.600" />
      </Flex>
    );
  }

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
      <Flex
        align="center"
        gap="0.5rem"
        px="0.875rem"
        py="0.625rem"
        borderBottom="0.0625rem solid"
        borderColor="whiteAlpha.100"
        flexShrink={0}
      >
        <Box w="0.375rem" h="0.375rem" bg={accent} borderRadius="full" flexShrink={0} />
        <Text
          fontSize="clamp(0.55rem, 0.68vw, 0.7rem)"
          fontWeight="black"
          color="rgba(255,255,255,0.55)"
          textTransform="uppercase"
          letterSpacing="0.16em"
          lineHeight={1.1}
          lineClamp={1}
        >
          {spec.name}
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
          {getTeamDisplayName(TEAM_KEY)} · {row ? `${row.attempts}-${row.yards}` : "25-133"}
        </Text>
      </Flex>

      <Flex direction="column" flex="1" minH={0} px="0.875rem" py="0.75rem" gap="0.5rem">
        <Text
          fontSize="clamp(0.48rem, 0.6vw, 0.58rem)"
          fontWeight="700"
          color="rgba(255,255,255,0.4)"
          lineHeight={1.3}
          flexShrink={0}
        >
          {spec.caption}
        </Text>

        {/* Value row — kept above the plot rather than floated on the bars, so a
            short bar and a tall one print their number in the same place. */}
        <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={COL_GAP} flexShrink={0}>
          {lanes.map((l) => (
            <Text
              key={l.key}
              textAlign="center"
              fontFamily="mono"
              fontWeight="950"
              color="white"
              lineHeight={1}
              fontSize="clamp(0.9rem, 1.5vw, 1.35rem)"
            >
              {spec.fmt(spec.total(l))}
            </Text>
          ))}
        </Grid>

        <Box position="relative" h={CHART_H} flexShrink={0}>
          {/* The axis, drawn once across all three lanes so it reads as a baseline
              rather than three unrelated ticks. */}
          <Box
            position="absolute"
            left={0}
            right={0}
            h="0.0625rem"
            bg="rgba(255,255,255,0.3)"
            zIndex={2}
            style={{ top: `${zeroTop}%` }}
          />
          <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={COL_GAP} h="full">
            {lanes.map((l) => (
              <LaneBar key={l.key} parts={spec.parts(l)} domain={domain} zeroTop={zeroTop} accent={accent} />
            ))}
          </Grid>
        </Box>

        <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={COL_GAP} flexShrink={0}>
          {lanes.map((l) => (
            <Box key={l.key} textAlign="center" minW={0}>
              <Text
                fontSize="clamp(0.5rem, 0.65vw, 0.6rem)"
                fontWeight="900"
                color="rgba(255,255,255,0.7)"
                textTransform="uppercase"
                letterSpacing="0.1em"
                lineClamp={1}
              >
                {l.label}
              </Text>
              {/* Carry count travels with every variant. On the yardage axes his three
                  zero-yard carries contribute nothing visible, so without this the
                  chart understates how often he was stopped. */}
              <Text
                fontSize="clamp(0.42rem, 0.55vw, 0.52rem)"
                fontWeight="800"
                color="rgba(255,255,255,0.32)"
                mt="0.125rem"
              >
                {l.att} car · {l.yards} yds
              </Text>
            </Box>
          ))}
        </Grid>

        <Flex
          mt="auto"
          pt="0.5rem"
          borderTop="0.0625rem solid"
          borderColor="whiteAlpha.100"
          gap="0.75rem"
          wrap="wrap"
          flexShrink={0}
        >
          <LegendDot color={STUFF_COLOR} label={spec.legend[0]} />
          <LegendDot color={accent} opacity={0.42} label={spec.legend[1]} />
          <LegendDot color={accent} label={spec.legend[2]} />
        </Flex>

        {!anchored && (
          <Text fontSize="clamp(0.42rem, 0.55vw, 0.52rem)" fontWeight="800" color="#F87171" flexShrink={0}>
            Lane mock no longer matches direction_breakdown — reassign.
          </Text>
        )}
      </Flex>
    </Flex>
  );
};

export const RushLaneAxisYards = () => <RushLaneAxisChart axis="yards" />;
export const RushLaneAxisPerCarry = () => <RushLaneAxisChart axis="perCarry" />;
export const RushLaneAxisPctYards = () => <RushLaneAxisChart axis="pctYards" />;
export const RushLaneAxisPctSnaps = () => <RushLaneAxisChart axis="pctSnaps" />;
