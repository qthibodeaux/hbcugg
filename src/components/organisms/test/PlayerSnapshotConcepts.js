import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { LAB_TEAM } from "./PlayerStatsOverviewLabData";

// ═══════════════════════════════════════════════════════════════
// PLAYER STATS OVERVIEW - SEASON SNAPSHOT CONCEPTS
//
// Section-by-section pass on the Season Snapshot strip only.
// Model: one HUGE hero number, supporting metrics to its right, each
// metric carrying its own progress bar underneath.
//
// Three interpretations, because the grouping in the sketch is ambiguous:
//   A  three stacked rows - hero left, metrics right (closest to the sketch)
//   B  three columns - hero on top, metrics beneath
//   C  one dominant hero with a ghost watermark, all metrics in a right grid
//
// Numbers are the same real Cameron Peters values used by the Overview
// variants - see PlayerStatsOverviewLabData.js for the real / mock split.
// Every bar is labeled with what it actually measures, so a full bar means
// something rather than being decoration.
// ═══════════════════════════════════════════════════════════════

const P = LAB_TEAM.primary;
const S = LAB_TEAM.secondary;

const GROUPS = [
  {
    key: "production",
    hero: "197.3",
    heroLabel: "Total Production",
    why: "what he did",
    metrics: [
      { label: "Passing Prod", value: "163.2", pct: 83, note: "83% of production" },
      { label: "Rushing Prod", value: "34.1", pct: 17, note: "17% of production" },
      { label: "Total Yards", value: "3,259", pct: 91, note: "91st pctl" },
    ],
  },
  {
    key: "efficiency",
    hero: "14.2",
    heroLabel: "PAR per game",
    why: "how well he did it",
    metrics: [
      { label: "Season PAR", value: "142.3", pct: 91, note: "91st pctl" },
      { label: "EPA / Play", value: "+0.18", pct: 88, note: "88th pctl" },
      { label: "Success Rate", value: "62.4%", pct: 82, note: "82nd pctl" },
    ],
  },
  {
    key: "role",
    hero: "71%",
    heroLabel: "of team production",
    why: "how much ran through him",
    metrics: [
      { label: "Dropback Share", value: "84%", pct: 84, note: "of team dropbacks" },
      { label: "Snap Share", value: "91%", pct: 91, note: "of offensive snaps" },
      { label: "Weeks Led Team", value: "9", pct: 90, note: "9 of 10 games" },
    ],
  },
];

const Hero = ({ value, label, why, size = "clamp(4rem, 9vw, 7.2rem)" }) => (
  <Box>
    <Text
      fontSize={size}
      fontWeight="950"
      fontFamily="mono"
      color="white"
      lineHeight={0.8}
      letterSpacing="-0.055em"
      textShadow="0 3px 0 rgba(0,0,0,0.45)"
    >
      {value}
    </Text>
    <Text fontSize="0.6rem" fontWeight="900" color={S} textTransform="uppercase" letterSpacing="0.12em" mt="0.35rem">
      {label}
    </Text>
    {why && (
      <Text fontSize="0.46rem" fontWeight="700" color="rgba(255,255,255,0.3)" textTransform="uppercase" letterSpacing="0.1em" mt="0.1rem">
        {why}
      </Text>
    )}
  </Box>
);

// Value, label beneath, then the bar - the stacked unit from the sketch.
const MetricBar = ({ label, value, pct, note, compact }) => (
  <Box mb={compact ? "0.55rem" : "0.7rem"}>
    <Flex align="baseline" justify="space-between" gap="0.6rem">
      <Text fontSize={compact ? "0.9rem" : "1.05rem"} fontWeight="950" fontFamily="mono" color="white" lineHeight={1}>
        {value}
      </Text>
      <Text fontSize="0.42rem" fontWeight="700" color="rgba(255,255,255,0.32)" fontFamily="mono" whiteSpace="nowrap">
        {note}
      </Text>
    </Flex>
    <Text fontSize="0.46rem" fontWeight="800" color="rgba(255,255,255,0.45)" textTransform="uppercase" letterSpacing="0.09em" mt="0.12rem" mb="0.22rem">
      {label}
    </Text>
    <Box h="3px" bg="rgba(255,255,255,0.07)" borderRadius="full">
      <Box h="full" w={`${pct}%`} bg={S} opacity={0.9} borderRadius="full" />
    </Box>
  </Box>
);

const Shell = ({ children }) => (
  <Box w="full" h="full" overflow="auto" bg="#0B0B0D" p="clamp(0.9rem, 1.8vw, 1.6rem)">
    <Flex align="center" gap="0.45rem" mb="1rem">
      <Box w="3px" h="0.85rem" bg={S} borderRadius="sm" />
      <Text fontSize="0.66rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.1em">
        Season Snapshot
      </Text>
    </Flex>
    {children}
  </Box>
);

// ── A — three stacked rows, hero left / metrics right ───────────
export const PlayerSnapshotRows = () => (
  <Shell>
    {GROUPS.map((g, i) => (
      <Grid
        key={g.key}
        templateColumns={{ base: "1fr", md: "minmax(0, 0.85fr) minmax(0, 1.6fr)" }}
        gap="clamp(1rem, 3vw, 2.6rem)"
        alignItems="center"
        py="clamp(0.9rem, 1.8vw, 1.4rem)"
        borderTop={i === 0 ? "none" : "1px solid"}
        borderColor="whiteAlpha.100"
      >
        <Hero value={g.hero} label={g.heroLabel} why={g.why} />
        <Grid templateColumns={{ base: "1fr", sm: "repeat(3, minmax(0, 1fr))" }} gap="clamp(0.8rem, 2vw, 1.8rem)">
          {g.metrics.map((m) => (
            <MetricBar key={m.label} {...m} />
          ))}
        </Grid>
      </Grid>
    ))}
  </Shell>
);

// ── B — three columns, hero on top / metrics beneath ────────────
export const PlayerSnapshotColumns = () => (
  <Shell>
    <Grid templateColumns={{ base: "1fr", md: "repeat(3, minmax(0, 1fr))" }} gap="clamp(1rem, 2.5vw, 2.4rem)">
      {GROUPS.map((g, i) => (
        <Box
          key={g.key}
          pl={{ base: 0, md: i === 0 ? 0 : "clamp(0.8rem, 2vw, 1.8rem)" }}
          borderLeft={{ base: "none", md: i === 0 ? "none" : "1px solid" }}
          borderColor="whiteAlpha.100"
        >
          <Hero value={g.hero} label={g.heroLabel} why={g.why} size="clamp(3.2rem, 6.5vw, 5.4rem)" />
          <Box mt="1.1rem">
            {g.metrics.map((m) => (
              <MetricBar key={m.label} {...m} compact />
            ))}
          </Box>
        </Box>
      ))}
    </Grid>
  </Shell>
);

// ── D / E — the target model ────────────────────────────────────
// Card anatomy from the hero panel: team gradient + ghost watermark of the
// same number. Hero number on the left, supporting metrics as a vertical
// COLUMN on the right, each with its own progress bar underneath. Three
// cards, one per group.
const SnapshotCard = ({ group, wide }) => (
  <Flex
    position="relative"
    overflow="hidden"
    borderRadius="0.6rem"
    bg={`linear-gradient(150deg, ${P}4D 0%, rgba(255,255,255,0.02) 72%)`}
    border="1px solid"
    borderColor="whiteAlpha.100"
    p="clamp(0.65rem, 1vw, 1.1rem)"
    gap="clamp(0.75rem, 1.5vw, 1.2rem)"
    align="center"
    h="full"
  >
    {/* ghost watermark of the hero number */}
    <Text
      position="absolute"
      right="-0.35rem"
      bottom="-1.5rem"
      fontSize={wide ? "clamp(6rem, 12vw, 10rem)" : "clamp(4.4rem, 9vw, 7.5rem)"}
      fontWeight="950"
      fontFamily="mono"
      color="whiteAlpha.100"
      lineHeight={0.8}
      letterSpacing="-0.05em"
      pointerEvents="none"
      aria-hidden="true"
    >
      {group.hero}
    </Text>

    {/* hero - sized to dominate the card the way the roster KPI numbers do */}
    <Box position="relative" zIndex={1} flex="1 1 0" minW={0} pr="0.5rem">
      <Text
        fontSize={wide ? "clamp(4.2rem, 9.5vw, 7.5rem)" : "clamp(3.1rem, 7.2vw, 5.2rem)"}
        fontWeight="950"
        fontFamily="mono"
        color="white"
        lineHeight={0.8}
        letterSpacing="-0.055em"
        textShadow="0 3px 0 rgba(0,0,0,0.45)"
        whiteSpace="nowrap"
      >
        {group.hero}
      </Text>
      <Text fontSize="0.56rem" fontWeight="900" color={S} textTransform="uppercase" letterSpacing="0.12em" mt="0.45rem">
        {group.heroLabel}
      </Text>
    </Box>

    {/* metric column */}
    <Box position="relative" zIndex={1} flex={wide ? "0 0 25%" : "0 0 32%"} minW={0}>
      {group.metrics.map((m, i) => (
        <Box key={m.label} mt={i === 0 ? 0 : "0.9rem"}>
          <Flex align="baseline" justify="space-between" gap="0.4rem">
            <Text fontSize="1.45rem" fontWeight="950" fontFamily="mono" color="white" lineHeight={1}>
              {m.value}
            </Text>
          </Flex>
          <Text
            fontSize="0.58rem"
            fontWeight="800"
            color="rgba(255,255,255,0.45)"
            textTransform="uppercase"
            letterSpacing="0.09em"
            mt="0.2rem"
            mb="0.3rem"
          >
            {m.label}
          </Text>
          <Box h="4px" bg="rgba(255,255,255,0.09)" borderRadius="full">
            <Box h="full" w={`${m.pct}%`} bg={S} opacity={0.9} borderRadius="full" />
          </Box>
        </Box>
      ))}
    </Box>
  </Flex>
);

// D — three cards across
export const PlayerSnapshotCards = () => (
  <Shell>
    <Grid templateColumns={{ base: "1fr", lg: "repeat(3, minmax(0, 1fr))" }} gap="0.7rem">
      {GROUPS.map((g) => (
        <SnapshotCard key={g.key} group={g} />
      ))}
    </Grid>
  </Shell>
);

// E — same card, stacked full width so the hero number can breathe
export const PlayerSnapshotCardRows = () => (
  <Shell>
    <Flex direction="column" gap="0.7rem">
      {GROUPS.map((g) => (
        <SnapshotCard key={g.key} group={g} wide />
      ))}
    </Flex>
  </Shell>
);

// ── C — one dominant hero + ghost watermark, metrics in a grid ──
export const PlayerSnapshotHero = () => {
  const lead = GROUPS[0];
  const rest = [...GROUPS[0].metrics, ...GROUPS[1].metrics, ...GROUPS[2].metrics];

  return (
    <Shell>
      <Grid templateColumns={{ base: "1fr", lg: "minmax(0, 0.9fr) minmax(0, 1.7fr)" }} gap="clamp(1rem, 3vw, 2.8rem)">
        <Box
          position="relative"
          overflow="hidden"
          borderRadius="0.6rem"
          bg={`linear-gradient(150deg, ${P}4D 0%, rgba(255,255,255,0.02) 70%)`}
          p="clamp(0.9rem, 2vw, 1.5rem)"
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          {/* ghost watermark of the same number, per the roster KPI pattern */}
          <Text
            position="absolute"
            right="-0.4rem"
            bottom="-1.6rem"
            fontSize="clamp(5rem, 12vw, 9rem)"
            fontWeight="950"
            fontFamily="mono"
            color="whiteAlpha.100"
            lineHeight={0.8}
            letterSpacing="-0.05em"
            pointerEvents="none"
            aria-hidden="true"
          >
            {lead.hero}
          </Text>
          <Box position="relative" zIndex={1}>
            <Hero value={lead.hero} label={lead.heroLabel} why={lead.why} />
            <Flex gap="1.1rem" mt="1.1rem" pt="0.8rem" borderTop="1px solid" borderColor="whiteAlpha.200">
              <Box>
                <Text fontSize="1rem" fontWeight="950" fontFamily="mono" color={S} lineHeight={1}>142.3</Text>
                <Text fontSize="0.44rem" fontWeight="800" color="rgba(255,255,255,0.45)" textTransform="uppercase" letterSpacing="0.08em">Season PAR</Text>
              </Box>
              <Box>
                <Text fontSize="1rem" fontWeight="950" fontFamily="mono" color="white" lineHeight={1}>55.1</Text>
                <Text fontSize="0.44rem" fontWeight="800" color="rgba(255,255,255,0.45)" textTransform="uppercase" letterSpacing="0.08em">Replacement</Text>
              </Box>
              <Box>
                <Text fontSize="1rem" fontWeight="950" fontFamily="mono" color="white" lineHeight={1}>10</Text>
                <Text fontSize="0.44rem" fontWeight="800" color="rgba(255,255,255,0.45)" textTransform="uppercase" letterSpacing="0.08em">Games</Text>
              </Box>
            </Flex>
          </Box>
        </Box>

        <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, minmax(0, 1fr))" }} gap="clamp(0.8rem, 2vw, 1.6rem)" alignContent="center">
          {rest.map((m) => (
            <MetricBar key={m.label} {...m} compact />
          ))}
        </Grid>
      </Grid>
    </Shell>
  );
};
