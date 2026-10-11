import { useMemo, useState } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { Section, Kicker } from "./TeamAnalyticsTabs";
import { useCountingTeamStats } from "../../../hooks/useSWACData";
import { glossaryFor, ordinal } from "../../../pages/analytics/metricGlossary";
import {
  PASS_DEPTHS,
  PASS_DIRECTIONS,
  HAVOC_TYPES,
  HAVOC_ZONES,
  fmtProfile,
} from "../../../pages/analytics/teamProfileMetrics";

// ─────────────────────────────────────────────────────────────────────────────
// TEAM PROFILE — THE PHASES
//
// The stat-heavy half of the profile, grouped the way a football team is
// actually discussed: passing, rushing, defense, scoring, situational,
// special teams, totals. Every phase runs the same three layers —
//
//   1. two headline cards, offense against the defense's equivalent
//   2. the full production block, every field we hold for that phase
//   3. the phase's spatial map, where it has one
//
// — so the page reads the same way seven times instead of seven different
// ways once.
//
// Sources: the counting-stats export (real shape, mock values), the hub's
// rate metrics (real), and the EPA / advanced stand-ins. Anything missing for
// the selected season dashes rather than borrowing another season's number.
// ─────────────────────────────────────────────────────────────────────────────

const POSITIVE = "#48BB78";
const NEGATIVE = "#F6AD55";
const OFF_TONE = "#ECC94B";
const DEF_TONE = "#4299E1";

const DASH = "—";
const n0 = (v) => (Number.isFinite(v) ? Math.round(v).toLocaleString() : DASH);
const n1 = (v) => (Number.isFinite(v) ? v.toFixed(1) : DASH);
const n2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : DASH);
const pct = (v) => (Number.isFinite(v) ? `${(v * 100).toFixed(1)}%` : DASH);
const signed2 = (v) => (Number.isFinite(v) ? `${v > 0 ? "+" : ""}${v.toFixed(2)}` : DASH);
const clock = (secs) => {
  if (!Number.isFinite(secs)) return DASH;
  const m = Math.floor(secs / 60);
  return `${m}:${String(Math.round(secs - m * 60)).padStart(2, "0")}`;
};
const ratio = (made, att) => (Number.isFinite(made) && Number.isFinite(att) ? `${made} / ${att}` : DASH);

// ── Rank tone ───────────────────────────────────────────────────────────────
// Top third of the league reads green, bottom third amber, the middle stays
// out of the way. The ordinal carries the exact place.
const rankTone = (rank, total) => {
  if (!Number.isFinite(rank) || !total) return "whiteAlpha.400";
  if (rank <= total / 3) return POSITIVE;
  if (rank > (total * 2) / 3) return NEGATIVE;
  return "whiteAlpha.500";
};

// A hover definition. Pure CSS, so there is no timer and nothing to clean up.
const Tip = ({ text, children }) => {
  if (!text) return children;
  return (
    <Box position="relative" display="inline-block" maxW="100%" _hover={{ "& > .tip": { opacity: 1, visibility: "visible" } }}>
      {children}
      <Box
        className="tip" position="absolute" bottom="calc(100% + 6px)" left={0} zIndex={30}
        w="15rem" maxW="70vw" p={2.5} borderRadius="md" bg="#09090B" border="1px solid" borderColor="whiteAlpha.200"
        boxShadow="0 12px 32px rgba(0,0,0,0.55)" opacity={0} visibility="hidden" pointerEvents="none"
        transition="opacity 0.12s ease"
      >
        <Text fontSize="10px" color="whiteAlpha.800" lineHeight={1.55}>{text}</Text>
      </Box>
    </Box>
  );
};

// One number: label and its league place on top, the value under it.
const Cell = ({ cell, total, tips, big }) => {
  const def = glossaryFor(cell.label);
  const tone = rankTone(cell.rank, total);
  return (
    <Box minW={0}>
      <Flex align="baseline" justify="space-between" gap={1} minW={0}>
        <Tip text={tips ? def?.text : null}>
          <Kicker
            color="whiteAlpha.400"
            borderBottom={tips && def ? "1px dotted" : undefined}
            borderColor="whiteAlpha.300"
          >
            {cell.label}
          </Kicker>
        </Tip>
        {Number.isFinite(cell.rank) && (
          <Text fontSize="8px" fontWeight="900" color={tone} flexShrink={0} fontVariantNumeric="tabular-nums">
            {ordinal(cell.rank)}
          </Text>
        )}
      </Flex>
      {big ? (
        <Text
          fontSize="clamp(0.95rem, 1.7vw, 1.45rem)" fontWeight="900" fontStyle="italic" color="white"
          lineHeight={0.95} letterSpacing="-0.03em" mt={1} fontVariantNumeric="tabular-nums" lineClamp={1}
        >
          {cell.value}
        </Text>
      ) : (
        <Text fontSize="13px" fontWeight="900" color="white" mt={1} fontVariantNumeric="tabular-nums" lineClamp={1}>
          {cell.value}
        </Text>
      )}
      {cell.note && <Text fontSize="8px" fontWeight="700" color="whiteAlpha.400" mt={0.5} lineClamp={2}>{cell.note}</Text>}
    </Box>
  );
};

// ── Layer 1: the headline card ──────────────────────────────────────────────
const HeadCard = ({ label, tone, cells, total, tips }) => (
  <Box flex="1" minW={0} bg="rgba(255,255,255,0.04)" borderRadius="md" p={3} borderTop="2px solid" borderTopColor={tone}>
    <Kicker color={tone}>{label}</Kicker>
    <Grid templateColumns={{ base: "repeat(2, minmax(0,1fr))", md: "repeat(5, minmax(0,1fr))" }} gap={3} mt={2.5}>
      {cells.map((c) => <Cell key={c.label} cell={c} total={total} tips={tips} big />)}
    </Grid>
  </Box>
);

// ── Layer 2: the full production block ──────────────────────────────────────
const FullGrid = ({ label, tone, cells, total, tips }) => (
  <Box flex="1" minW={0}>
    <Flex align="center" gap={2} mb={2}>
      <Box w="8px" h="8px" borderRadius="sm" bg={tone} flexShrink={0} />
      <Kicker color="whiteAlpha.700">{label}</Kicker>
      <Box flex="1" h="1px" bg="whiteAlpha.100" />
    </Flex>
    <Grid templateColumns="repeat(auto-fit, minmax(6.4rem, 1fr))" gap={3} gapY={4}>
      {cells.map((c) => <Cell key={c.label} cell={c} total={total} tips={tips} />)}
    </Grid>
  </Box>
);

// ── The three maps ──────────────────────────────────────────────────────────
const epaFill = (epa) => {
  if (!Number.isFinite(epa)) return "rgba(0,0,0,0.35)";
  const strength = Math.min(1, Math.abs(epa) / 0.45);
  const alpha = (0.12 + strength * 0.62).toFixed(2);
  return epa >= 0 ? `rgba(72,187,120,${alpha})` : `rgba(246,173,85,${alpha})`;
};

const SideToggle = ({ value, onChange }) => (
  <Flex gap={2}>
    {[["offense", "Offense"], ["defense", "Allowed"]].map(([id, label]) => (
      <Box
        key={id} as="button" onClick={() => onChange(id)} px={3} py={1.5} borderRadius="md"
        fontSize="9px" fontWeight="900" textTransform="uppercase" letterSpacing="0.1em"
        bg={value === id ? "brand.500" : "whiteAlpha.100"} color={value === id ? "white" : "whiteAlpha.600"}
        _hover={{ bg: value === id ? "brand.500" : "whiteAlpha.200" }}
      >
        {label}
      </Box>
    ))}
  </Flex>
);

const MapHead = ({ title, side, onSide }) => (
  <Flex align="center" justify="space-between" gap={3} mt={5} mb={2} wrap="wrap">
    <Kicker color="whiteAlpha.700">{title}</Kicker>
    <SideToggle value={side} onChange={onSide} />
  </Flex>
);

// The cells are far wider than they are tall, so each one splits in two: the
// raw line on the left, who the ball went to on the right. The face carries the
// target count on a scrim and the surname underneath, which is what tells you
// why three strangers are sitting in a passing chart.
const TargetFace = ({ player }) => (
  <Flex direction="column" align="center" flex="1" minW={0} gap="2px">
    <Box
      position="relative" w="100%" aspectRatio="1" borderRadius="sm" overflow="hidden"
      bg="rgba(0,0,0,0.4)" border="1px solid" borderColor="whiteAlpha.300"
      title={`${player.name} · ${player.position ?? ""} · ${player.targets} targets`}
    >
      {player.photo ? (
        <Image src={player.photo} alt="" w="100%" h="100%" objectFit="cover" objectPosition="top center" />
      ) : (
        <Flex align="center" justify="center" h="100%">
          <Text fontSize="9px" fontWeight="900" color="whiteAlpha.600">{player.initials}</Text>
        </Flex>
      )}
      <Flex position="absolute" left={0} right={0} bottom={0} justify="center" bg="rgba(0,0,0,0.72)" py="1px">
        <Text fontSize="8px" fontWeight="900" color="white" lineHeight={1.2} fontVariantNumeric="tabular-nums">
          {player.targets}
        </Text>
      </Flex>
    </Box>
    <Text fontSize="7px" fontWeight="800" color="whiteAlpha.700" lineHeight={1.1} textAlign="center" lineClamp={1} w="100%" title={player.name}>
      {player.surname}
    </Text>
  </Flex>
);

const PassFieldMap = ({ grid, targets, side }) => (
  <Box>
    <Flex gap={2} align="stretch">
      <Flex direction="column" justify="space-around" py="2px" flexShrink={0}>
        {PASS_DEPTHS.map((d) => (
          <Box key={d.key} textAlign="right">
            <Text fontSize="9px" fontWeight="900" color="whiteAlpha.700" textTransform="uppercase" lineHeight={1}>{d.label}</Text>
            <Text fontSize="8px" color="whiteAlpha.400" lineHeight={1.3}>{d.range}</Text>
          </Box>
        ))}
      </Flex>
      <Box position="relative" flex="1" minW={0}>
        <Box position="absolute" inset={0} borderRadius="md" bg="linear-gradient(180deg, #14301a 0%, #0b1c0f 100%)" border="1px solid" borderColor="whiteAlpha.200" />
        <Grid position="relative" templateColumns="repeat(3, minmax(0,1fr))" templateRows="repeat(3, minmax(0,1fr))" gap="3px" p="3px">
          {PASS_DEPTHS.map((d) =>
            PASS_DIRECTIONS.map((dir) => {
              const cell = grid[d.key][dir.key];
              const faces = targets?.[d.key]?.[dir.key] ?? [];
              return (
                <Flex
                  key={`${d.key}-${dir.key}`} align="center" gap={2} px={2.5} py={2.5} borderRadius="sm"
                  bg={epaFill(cell.epa)} border="1px solid" borderColor="whiteAlpha.100"
                >
                  <Flex direction="column" flex="1" minW={0} align="flex-start">
                    <Text fontSize="13px" fontWeight="900" color="white" lineHeight={1} fontVariantNumeric="tabular-nums">
                      {cell.comp}/{cell.att}
                    </Text>
                    <Kicker color="whiteAlpha.400" mt="2px">Comp / Att</Kicker>
                    <Text fontSize="9px" fontWeight="800" color="whiteAlpha.800" lineHeight={1} mt={1.5} fontVariantNumeric="tabular-nums">
                      {cell.yards} yds
                    </Text>
                    <Text fontSize="9px" fontWeight="900" color={cell.epa >= 0 ? POSITIVE : NEGATIVE} lineHeight={1} mt={1} fontVariantNumeric="tabular-nums">
                      {signed2(cell.epa)} EPA
                    </Text>
                  </Flex>

                  {faces.length > 0 && (
                    <>
                      <Box alignSelf="stretch" w="1px" bg="whiteAlpha.200" flexShrink={0} />
                      <Box flex="1.15" minW={0} maxW="7.5rem">
                        <Kicker color="whiteAlpha.500" mb={1}>
                          {side === "offense" ? "Top targets" : "In coverage"}
                        </Kicker>
                        <Flex gap="4px" align="flex-start">
                          {faces.map((p) => <TargetFace key={p.id} player={p} />)}
                        </Flex>
                      </Box>
                    </>
                  )}
                </Flex>
              );
            }),
          )}
        </Grid>
      </Box>
    </Flex>
    <Flex justify="center" gap={10} mt={2}>
      {PASS_DIRECTIONS.map((d) => <Kicker key={d.key} color="whiteAlpha.400">{d.label}</Kicker>)}
    </Flex>
  </Box>
);

const RushLaneMap = ({ lanes }) => {
  const max = Math.max(...lanes.map((l) => l.ypc), 1);
  return (
    <Grid templateColumns="repeat(3, minmax(0,1fr))" gap={2}>
      {lanes.map((lane) => (
        <Box key={lane.key} borderRadius="md" bg="rgba(255,255,255,0.04)" p={3} position="relative" overflow="hidden">
          <Box position="absolute" left={0} bottom={0} right={0} h="3px" bg="whiteAlpha.100" />
          <Box position="absolute" left={0} bottom={0} h="3px" bg={lane.epa >= 0 ? POSITIVE : NEGATIVE} style={{ width: `${(lane.ypc / max) * 100}%` }} />
          <Kicker color="whiteAlpha.500">{lane.label}</Kicker>
          <Text fontSize="clamp(1.1rem, 2.2vw, 1.7rem)" fontWeight="900" fontStyle="italic" color="white" lineHeight={0.9} letterSpacing="-0.04em" mt={1.5} fontVariantNumeric="tabular-nums">
            {lane.ypc.toFixed(2)}
          </Text>
          <Kicker color="whiteAlpha.400" mt={1}>Yards / carry</Kicker>
          <Flex gap={3} mt={2.5} wrap="wrap">
            <Box><Kicker color="whiteAlpha.400">Car</Kicker><Text fontSize="11px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">{lane.att}</Text></Box>
            <Box><Kicker color="whiteAlpha.400">Yds</Kicker><Text fontSize="11px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">{lane.yards}</Text></Box>
            <Box><Kicker color="whiteAlpha.400">Stuff</Kicker><Text fontSize="11px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">{pct(lane.stuff)}</Text></Box>
          </Flex>
        </Box>
      ))}
    </Grid>
  );
};

const HavocMap = ({ zones }) => {
  const events = [];
  HAVOC_ZONES.forEach((zone, zi) => {
    const inZone = [];
    HAVOC_TYPES.forEach((t) => {
      for (let i = 0; i < zones[zone][t.key]; i += 1) inZone.push(t);
    });
    inZone.forEach((t, i) => {
      const x = (zi * 100) / 3 + ((i + 0.5) / inZone.length) * (100 / 3);
      const wobble = ((i * 37) % 11) / 11 - 0.5;
      events.push({ key: `${zone}-${t.key}-${i}`, x, depth: t.depth + wobble * t.spread, color: t.color });
    });
  });
  const depths = events.map((e) => e.depth);
  const lo = Math.min(-12, ...depths);
  const hi = Math.max(18, ...depths);
  const yFor = (d) => ((hi - d) / (hi - lo)) * 100;
  const totals = HAVOC_TYPES.map((t) => ({ ...t, count: HAVOC_ZONES.reduce((sum, z) => sum + zones[z][t.key], 0) }));

  return (
    <Box>
      <Box position="relative" h={{ base: "220px", md: "280px" }} borderRadius="md" overflow="hidden" bg="linear-gradient(180deg, #14301a 0%, #0b1c0f 100%)" border="1px solid" borderColor="whiteAlpha.200">
        <Box position="absolute" left={0} right={0} top={`${yFor(0)}%`} h="2px" bg="rgba(255,255,255,0.45)" />
        <Text position="absolute" left="6px" top={`calc(${yFor(0)}% + 4px)`} fontSize="8px" fontWeight="900" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.1em">
          Line of scrimmage
        </Text>
        <Box position="absolute" top={0} bottom={0} left="33.33%" w="1px" bg="whiteAlpha.100" />
        <Box position="absolute" top={0} bottom={0} left="66.66%" w="1px" bg="whiteAlpha.100" />
        {events.map((e) => (
          <Box key={e.key} position="absolute" left={`${e.x}%`} top={`${yFor(e.depth)}%`} transform="translate(-50%, -50%)" w="7px" h="7px" borderRadius="full" bg={e.color} opacity={0.85} />
        ))}
        <Flex position="absolute" left={0} right={0} bottom={0} justify="space-around" py={1.5} bg="blackAlpha.500">
          {HAVOC_ZONES.map((z) => <Kicker key={z} color="whiteAlpha.500">{z}</Kicker>)}
        </Flex>
      </Box>
      <Flex gap={4} wrap="wrap" mt={3}>
        {totals.map((t) => (
          <Flex key={t.key} align="center" gap={1.5}>
            <Box w="8px" h="8px" borderRadius="full" bg={t.color} />
            <Kicker color="whiteAlpha.600">{t.label}</Kicker>
            <Text fontSize="11px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">{t.count}</Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// THE SPEC
//
// One list per phase, not two: each field says where it comes from and which
// direction is good, and the two columns are the same list read through
// different sides. `flip` on the right-hand side inverts polarity, because a
// yard gained and a yard allowed are not the same thing.

const SIDES_STD = [
  { label: "Offense", root: "offense", base: "", prefix: "o" },
  { label: "Defense allowed", root: "defense", base: "", prefix: "d", flip: true },
];
const SIDES_DEFENSE = [
  { label: "Team defense", root: "offense", base: "defense.", prefix: "d" },
  { label: "Opponent defense", root: "defense", base: "defense.", prefix: "o", flip: true },
];
const SIDES_TEAM = [
  { label: "Team", root: "offense", base: "", prefix: "o" },
  { label: "Opponent", root: "defense", base: "", prefix: "d", flip: true },
];

// src: count (the counting export) · hub (real rate metrics) · adv / tape
// (the stand-ins) · calc (derived from the counting block).
const f = (label, src, key, fmt, opts = {}) => ({ label, src, key, fmt, ...opts });

const rz = (b) => b?.conversions?.red_zone ?? {};

const PHASES = [
  {
    id: "passing", title: "Passing", sides: SIDES_STD, map: "pass",
    head: [
      f("Attempts", "count", "passing.att", "n0", { high: true }),
      f("Completion %", "count", "passing.pct", "pct", { high: true }),
      f("Yards / Att", "count", "passing.avg_a", "n1", { high: true }),
      f("EPA / Att", "tape", "epa_pass", "signed2"),
      f("Touchdowns", "count", "passing.td", "n0", { high: true }),
    ],
    full: [
      f("Attempts", "count", "passing.att", "n0", { high: true }),
      f("Completions", "count", "passing.cmp", "n0", { high: true }),
      f("Completion %", "count", "passing.pct", "pct", {
        high: true,
        note: (b) => (Number.isFinite(b?.passing?.att) ? `${b.passing.cmp} of ${b.passing.att}` : null),
      }),
      f("Yards", "count", "passing.yds", "n0", { high: true }),
      f("Yards / Att", "count", "passing.avg_a", "n1", { high: true }),
      f("Yards / Game", "count", "passing.avg_g", "n1", { high: true }),
      f("Touchdowns", "count", "passing.td", "n0", { high: true }),
      f("Interceptions", "count", "passing.int", "n0", { high: false }),
      f("Long", "count", "passing.long", "n0", { high: true }),
      f("Completion Rate", "hub", "passing.completionRate", "pct"),
      f("Yards / Attempt", "hub", "passing.ypa", "n2"),
      f("Explosive Rate", "hub", "passing.explosiveRate", "pct"),
      f("Pressure Rate", "hub", "passing.pressureRate", "pct"),
      f("EPA / Attempt", "tape", "epa_pass", "signed2"),
      f("Success Rate", "tape", "success_pass", "pct"),
      f("Explosiveness", "adv", "explosiveness", "n2"),
    ],
  },
  {
    id: "rushing", title: "Rushing", sides: SIDES_STD, map: "rush",
    head: [
      f("Attempts", "count", "rushing.att", "n0", { high: true }),
      f("Yards", "count", "rushing.yds", "n0", { high: true }),
      f("Yards / Carry", "count", "rushing.avg", "n1", { high: true }),
      f("EPA / Rush", "tape", "epa_rush", "signed2"),
      f("Touchdowns", "count", "rushing.td", "n0", { high: true }),
    ],
    full: [
      f("Attempts", "count", "rushing.att", "n0", { high: true }),
      f("Yards", "count", "rushing.yds", "n0", { high: true }),
      f("Yards / Carry", "count", "rushing.avg", "n1", { high: true }),
      f("Yards / Game", "count", "rushing.avg_g", "n1", { high: true }),
      f("Touchdowns", "count", "rushing.td", "n0", { high: true }),
      f("Long", "count", "rushing.long", "n0", { high: true }),
      f("Success Rate", "hub", "rushing.successRate", "pct"),
      f("Opportunity Rate", "hub", "rushing.opportunityRate", "pct"),
      f("Stuff Rate", "hub", "rushing.stuffRate", "pct"),
      f("Stop Rate", "hub", "rushing.stopRate", "pct"),
      f("Power Stop Rate", "hub", "rushing.powerStopRate", "pct"),
      f("TFL Rate", "hub", "rushing.tflRate", "pct"),
      f("Line Yards", "adv", "line_yards", "n2"),
      f("Second Level", "adv", "second_level", "n2"),
      f("Open Field", "adv", "open_field", "n2"),
      f("Power Success", "adv", "power_success", "pct"),
      f("EPA / Rush", "tape", "epa_rush", "signed2"),
    ],
  },
  {
    id: "defense", title: "Defense & havoc", sides: SIDES_DEFENSE, map: "havoc",
    head: [
      f("Total Tackles", "count", "tot", "n0", { high: true }),
      f("TFL", "count", "tfl", "n1", { high: true }),
      f("Sacks", "count", "sacks", "n1", { high: true }),
      f("Takeaways", "calc", "takeaways", "n0", { high: true, num: (b) => (b ? (b.int ?? 0) + (b.fr ?? 0) : undefined) }),
      f("Front-Seven Havoc", "adv", "havoc_front7", "pct"),
    ],
    full: [
      f("Total Tackles", "count", "tot", "n0", { high: true }),
      f("Unassisted", "count", "ua", "n0", { high: true }),
      f("Assisted", "count", "a", "n0", { high: true }),
      f("TFL", "count", "tfl", "n1", { high: true }),
      f("Sacks", "count", "sacks", "n1", { high: true }),
      f("QB Hurries", "count", "qbh", "n0", { high: true }),
      f("Interceptions", "count", "int", "n0", { high: true }),
      f("Break-ups", "count", "brup", "n0", { high: true }),
      f("Forced Fumbles", "count", "ff", "n0", { high: true }),
      f("Fumbles Recovered", "count", "fr", "n0", { high: true }),
      f("Blocked Kicks", "count", "blk", "n0", { high: true }),
      f("Safeties", "count", "saf", "n0", { high: true }),
      f("Front-Seven Havoc", "adv", "havoc_front7", "pct"),
      f("Defensive-Back Havoc", "adv", "havoc_db", "pct"),
    ],
  },
  {
    id: "scoring", title: "Scoring & drives", sides: SIDES_STD,
    head: [
      f("Points", "count", "scoring.pts", "n0", { high: true }),
      f("Points / Game", "count", "scoring.avg_g", "n1", { high: true }),
      f("Touchdowns", "count", "scoring.td", "n0", { high: true }),
      f("Pts / Opportunity", "adv", "points_per_opp", "n2"),
      f("Red Zone TD %", "calc", "rz_td", "pct", { high: true, num: (b) => (rz(b).att ? rz(b).td / rz(b).att : undefined) }),
    ],
    full: [
      f("Points", "count", "scoring.pts", "n0", { high: true }),
      f("Points / Game", "count", "scoring.avg_g", "n1", { high: true }),
      f("Touchdowns", "count", "scoring.td", "n0", { high: true }),
      f("Field Goals", "count", "scoring.fg", "n0", { high: true }),
      f("Extra Points", "count", "scoring.xpt", "n0", { high: true }),
      f("Two-Point", "count", "scoring.two_pt", "n0", { high: true }),
      f("Safeties", "count", "scoring.saf", "n0", { high: true }),
      f("Red Zone Trips", "count", "conversions.red_zone.att", "n0", { high: true }),
      f("Red Zone Scores", "calc", "rz_scores", "pct", {
        high: true,
        num: (b) => (rz(b).att ? rz(b).scores / rz(b).att : undefined),
        text: (b) => ratio(rz(b).scores, rz(b).att),
      }),
      f("Red Zone TD", "calc", "rz_td2", "pct", {
        high: true,
        num: (b) => (rz(b).att ? rz(b).td / rz(b).att : undefined),
        text: (b) => ratio(rz(b).td, rz(b).att),
      }),
      f("Red Zone FG", "calc", "rz_fg", "pct", {
        high: false,
        num: (b) => (rz(b).att ? rz(b).fg / rz(b).att : undefined),
        text: (b) => ratio(rz(b).fg, rz(b).att),
      }),
      f("EPA / Drive", "tape", "epa_drive", "signed2"),
      f("Scoring Opportunities", "adv", "scoring_opps", "n0"),
      f("Pts / Opportunity", "adv", "points_per_opp", "n2"),
    ],
  },
  {
    id: "situational", title: "Situational", sides: SIDES_STD,
    head: [
      f("3rd Down", "count", "conversions.third.pct", "pct", { high: true }),
      f("4th Down", "count", "conversions.fourth.pct", "pct", { high: true }),
      f("Avg 3rd Distance", "tape", "third_dist", "n2"),
      f("First Downs", "count", "misc.first_downs", "n0", { high: true }),
      f("Avg Start", "adv", "avg_start", "fp"),
    ],
    full: [
      f("3rd Down", "count", "conversions.third.pct", "pct", {
        high: true,
        note: (b) => ratio(b?.conversions?.third?.conv, b?.conversions?.third?.att),
      }),
      f("4th Down", "count", "conversions.fourth.pct", "pct", {
        high: true,
        note: (b) => ratio(b?.conversions?.fourth?.conv, b?.conversions?.fourth?.att),
      }),
      f("Avg 3rd Distance", "tape", "third_dist", "n2"),
      f("3rd/4th Success", "tape", "third_succ", "pct"),
      f("Standard-Down Success", "adv", "std_down_success", "pct"),
      f("Passing-Down Success", "adv", "pass_down_success", "pct"),
      f("Early Downs EPA", "tape", "early_epa", "signed2"),
      f("Available Yards %", "tape", "avail_yds", "pct"),
      f("First Downs", "count", "misc.first_downs", "n0", { high: true }),
      f("FD Rushing", "count", "misc.fd_rush", "n0", { high: true }),
      f("FD Passing", "count", "misc.fd_pass", "n0", { high: true }),
      f("FD Penalty", "count", "misc.fd_pen", "n0", { high: false }),
      f("Fumbles", "count", "misc.fum", "n0", {
        high: false,
        note: (b) => (Number.isFinite(b?.misc?.fum_lost) ? `${b.misc.fum_lost} lost` : null),
      }),
      f("Penalties", "count", "misc.pen", "n0", {
        high: false,
        note: (b) => (Number.isFinite(b?.misc?.pen_yds) ? `${b.misc.pen_yds} yards` : null),
      }),
      f("Time of Possession", "count", "misc.top_avg", "clock", { high: true }),
      f("Average Start", "adv", "avg_start", "fp"),
    ],
  },
  {
    id: "special", title: "Special teams", sides: SIDES_TEAM,
    head: [
      f("Punt Avg", "count", "kicking.punting.avg", "n1", { high: true }),
      f("Inside 20", "count", "kicking.punting.i20", "n0", { high: true }),
      f("Field Goals", "calc", "fg_pct", "pct", {
        high: true,
        num: (b) => b?.kicking?.fg?.pct,
        text: (b) => ratio(b?.kicking?.fg?.fgm, b?.kicking?.fg?.fga),
      }),
      f("KR Avg", "count", "returns.kr.avg", "n1", { high: true }),
      f("PR Avg", "count", "returns.pr.avg", "n1", { high: true }),
    ],
    full: [
      f("Punts", "count", "kicking.punting.no", "n0", { high: false }),
      f("Punt Yards", "count", "kicking.punting.yds", "n0", { high: true }),
      f("Punt Avg", "count", "kicking.punting.avg", "n1", { high: true }),
      f("Punt Long", "count", "kicking.punting.long", "n0", { high: true }),
      f("Inside 20", "count", "kicking.punting.i20", "n0", { high: true }),
      f("Touchbacks", "count", "kicking.punting.tb", "n0", { high: false }),
      f("Fair Catches", "count", "kicking.punting.fc", "n0", { high: true }),
      f("Punts Blocked", "count", "kicking.punting.blk", "n0", { high: false }),
      f("Field Goals", "calc", "fg_pct2", "pct", {
        high: true,
        num: (b) => b?.kicking?.fg?.pct,
        text: (b) => ratio(b?.kicking?.fg?.fgm, b?.kicking?.fg?.fga),
        note: (b) => pct(b?.kicking?.fg?.pct),
      }),
      f("FG Long", "count", "kicking.fg.long", "n0", { high: true }),
      f("FG Blocked", "count", "kicking.fg.blk", "n0", { high: false }),
      f("Extra Points", "calc", "pat", "pct", {
        high: true,
        num: (b) => (b?.kicking?.fg?.pat_att ? b.kicking.fg.pat_made / b.kicking.fg.pat_att : undefined),
        text: (b) => ratio(b?.kicking?.fg?.pat_made, b?.kicking?.fg?.pat_att),
      }),
      f("Kick Returns", "count", "returns.kr.no", "n0", {
        high: true,
        note: (b) => (Number.isFinite(b?.returns?.kr?.yds) ? `${b.returns.kr.yds} yards` : null),
      }),
      f("KR Avg", "count", "returns.kr.avg", "n1", {
        high: true,
        note: (b) => (Number.isFinite(b?.returns?.kr?.long) ? `long ${b.returns.kr.long}` : null),
      }),
      f("KR Touchdowns", "count", "returns.kr.td", "n0", { high: true }),
      f("Punt Returns", "count", "returns.pr.no", "n0", {
        high: true,
        note: (b) => (Number.isFinite(b?.returns?.pr?.yds) ? `${b.returns.pr.yds} yards` : null),
      }),
      f("PR Avg", "count", "returns.pr.avg", "n1", {
        high: true,
        note: (b) => (Number.isFinite(b?.returns?.pr?.long) ? `long ${b.returns.pr.long}` : null),
      }),
      f("PR Touchdowns", "count", "returns.pr.td", "n0", { high: true }),
    ],
  },
  {
    id: "totals", title: "Totals", sides: SIDES_STD,
    head: [
      f("Plays", "count", "totals.plays", "n0", { high: true }),
      f("Yards", "count", "totals.yds", "n0", { high: true }),
      f("Yards / Play", "count", "totals.avg_p", "n1", { high: true }),
      f("Yards / Game", "count", "totals.avg_g", "n1", { high: true }),
      f("Touchdowns", "count", "totals.td", "n0", { high: true }),
    ],
    full: [
      f("Plays", "count", "totals.plays", "n0", { high: true }),
      f("Total Yards", "count", "totals.yds", "n0", { high: true }),
      f("Yards / Play", "count", "totals.avg_p", "n1", { high: true }),
      f("Yards / Game", "count", "totals.avg_g", "n1", { high: true }),
      f("Rushing Yards", "count", "totals.rush", "n0", { high: true }),
      f("Passing Yards", "count", "totals.pass", "n0", { high: true }),
      f("Touchdowns", "count", "totals.td", "n0", { high: true }),
    ],
  },
];

const FMT = { n0, n1, n2, pct, signed2, clock, fp: (v) => fmtProfile(v, "fp") };
const getPath = (obj, path) => String(path).split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);

export const TeamProfilePhases = ({ season, teamId, row, vals, adv, maps, tapeRanks, advRanks, hubRanks }) => {
  const [passSide, setPassSide] = useState("offense");
  const [rushSide, setRushSide] = useState("offense");
  const [tips, setTips] = useState(true);

  const { teams: countingTeams, gamesThrough } = useCountingTeamStats(season);
  const counting = useMemo(
    () => (countingTeams ?? []).find((t) => t.team_id === teamId) ?? null,
    [countingTeams, teamId],
  );
  const total = (countingTeams ?? []).length || 18;

  // Ranks over the counting export, worked out once per field and kept.
  const cache = useMemo(() => ({}), [countingTeams]);
  const countRank = (root, cacheKey, getter, high) => {
    const key = `${root}|${cacheKey}|${high}`;
    if (!cache[key]) {
      const sorted = (countingTeams ?? [])
        .map((t) => ({ id: t.team_id, v: getter(t[root]) }))
        .filter((x) => Number.isFinite(x.v))
        .sort((a, b) => (high ? b.v - a.v : a.v - b.v));
      cache[key] = Object.fromEntries(sorted.map((x, i) => [x.id, i + 1]));
    }
    return cache[key][teamId];
  };

  const resolve = (spec, side) => {
    const block = counting?.[side.root] ?? null;
    const scoped = side.base ? getPath(block, side.base.slice(0, -1)) : block;
    const fmt = FMT[spec.fmt] ?? n0;

    if (spec.src === "count" || spec.src === "calc") {
      const get = spec.src === "calc" ? spec.num : (b) => getPath(b, spec.key);
      const value = get(scoped);
      const high = side.flip ? spec.defHigh ?? !spec.high : spec.high;
      const base = side.base.slice(0, -1);
      return {
        label: spec.label,
        value: spec.text ? spec.text(scoped) : fmt(value),
        note: spec.note ? spec.note(scoped) : null,
        rank: countRank(side.root, `${spec.key}|${base}`, (b) => get(base ? getPath(b, base) : b), high),
      };
    }

    const field = `${side.prefix}_${spec.key}`;
    const source = spec.src === "hub" ? row?.metrics : spec.src === "adv" ? adv : vals;
    const ranks = spec.src === "hub" ? hubRanks : spec.src === "adv" ? advRanks : tapeRanks;
    return {
      label: spec.label,
      value: fmt(source?.[field]),
      note: spec.note ? spec.note(scoped) : null,
      rank: ranks?.[field]?.[teamId],
    };
  };

  const games = counting?.games;
  const note = <Kicker color="whiteAlpha.400">{games ? `${games} games · rank of ${total}` : season}</Kicker>;

  const mapFor = (id) => {
    if (id === "pass") {
      return (
        <>
          <MapHead title="Passing field map" side={passSide} onSide={setPassSide} />
          <PassFieldMap
            grid={passSide === "offense" ? maps.passOff : maps.passDef}
            targets={passSide === "offense" ? maps.targetsOff : maps.targetsDef}
            side={passSide}
          />
        </>
      );
    }
    if (id === "rush") {
      return (
        <>
          <MapHead title="Rushing lanes" side={rushSide} onSide={setRushSide} />
          <RushLaneMap lanes={rushSide === "offense" ? maps.rushOff : maps.rushDef} />
        </>
      );
    }
    if (id === "havoc") {
      return (
        <Box mt={5}>
          <Kicker color="whiteAlpha.700" mb={2}>Havoc map</Kicker>
          <HavocMap zones={maps.havoc} />
        </Box>
      );
    }
    return null;
  };

  return (
    <Flex direction="column" gap={4}>
      <Flex justify="flex-end">
        <Box as="button" onClick={() => setTips((v) => !v)} px={3} py={1.5} borderRadius="md"
          bg={tips ? "whiteAlpha.100" : "brand.500"} color={tips ? "whiteAlpha.700" : "white"}
          fontSize="9px" fontWeight="900" textTransform="uppercase" letterSpacing="0.1em"
          _hover={{ bg: tips ? "whiteAlpha.200" : "brand.500" }}>
          {tips ? "Hide definitions" : "Show definitions"}
        </Box>
      </Flex>

      {!counting && (
        <Section title="Phase breakdown">
          <Text fontSize="sm" color="whiteAlpha.600">
            No counting stats on file for {season}. The rate and EPA numbers above still apply.
          </Text>
        </Section>
      )}

      {PHASES.map((phase) => (
        <Section key={phase.id} title={phase.title} right={note}>
          <Flex gap={3} direction={{ base: "column", md: "row" }} align="stretch">
            {phase.sides.map((side, si) => (
              <HeadCard
                key={side.label} label={side.label} tone={si ? DEF_TONE : OFF_TONE} total={total} tips={tips}
                cells={phase.head.map((spec) => resolve(spec, side))}
              />
            ))}
          </Flex>
          <Flex gap={5} mt={4} direction={{ base: "column", lg: "row" }} align="flex-start">
            {phase.sides.map((side, si) => (
              <FullGrid
                key={side.label} label={side.label} tone={si ? DEF_TONE : OFF_TONE} total={total} tips={tips}
                cells={phase.full.map((spec) => resolve(spec, side))}
              />
            ))}
          </Flex>
          {mapFor(phase.map)}
        </Section>
      ))}

      {gamesThrough?.label && <Kicker color="whiteAlpha.300" px={1}>Through {gamesThrough.label}</Kicker>}
    </Flex>
  );
};

export default TeamProfilePhases;
