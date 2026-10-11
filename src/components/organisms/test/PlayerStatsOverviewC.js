import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import {
  LAB_BLOCKS,
  LAB_COMPARATIVES,
  LAB_EFFICIENCY,
  LAB_FORM,
  LAB_GAMES,
  LAB_MOMENTS,
  LAB_PRODUCTION,
  LAB_RANGE,
  LAB_TEAM,
  tierColor,
} from "./PlayerStatsOverviewLabData";

// ═══════════════════════════════════════════════════════════════
// PLAYER STATS OVERVIEW - VARIANT C  (agent3 direction)
//
// Built from agent3's mockup, with one deliberate change: the mockup's
// hardcoded emerald is replaced by the real team palette (PVAMU purple /
// gold from teams.json), since every other page in the app carries team
// identity and a fixed accent would render every player identically.
//
// The two load-bearing ideas from agent3:
//   1. Each production block is a band with a left accent rail whose
//      brightness encodes relevance - bright for the primary block, muted
//      for the secondary. Role is communicated without a label.
//   2. A replacement tick INSIDE each production bar, so the PAR equation
//      reads inline per block with no hero section at all.
//
// Data: see PlayerStatsOverviewLabData.js for real / derived / mock split.
// ═══════════════════════════════════════════════════════════════

const P = LAB_TEAM.primary;
const S = LAB_TEAM.secondary;

// Shared production scale across blocks, with headroom, so passing visibly
// dwarfs rushing instead of every block filling its own bar to 100%.
const SCALE_MAX = Math.max(...LAB_BLOCKS.map((b) => b.production)) * 1.15;

const Label = ({ children, ...rest }) => (
  <Text fontSize="0.46rem" fontWeight="800" color="rgba(255,255,255,0.42)" textTransform="uppercase" letterSpacing="0.09em" {...rest}>
    {children}
  </Text>
);

const SectionLabel = ({ children }) => (
  <Text fontSize="0.56rem" fontWeight="900" color="rgba(255,255,255,0.62)" textTransform="uppercase" letterSpacing="0.12em" mb="0.4rem">
    {children}
  </Text>
);

const Panel = ({ children, ...rest }) => (
  <Box bg="rgba(255,255,255,0.025)" border="1px solid" borderColor="whiteAlpha.100" borderRadius="0.55rem" p="clamp(0.6rem, 1.1vw, 0.95rem)" {...rest}>
    {children}
  </Box>
);

const KpiTile = ({ label, value, accent }) => (
  <Panel>
    <Label mb="0.3rem">{label}</Label>
    <Text fontSize="clamp(1.05rem, 2vw, 1.6rem)" fontWeight="950" fontFamily="mono" color={accent || "white"} lineHeight={1}>
      {value}
    </Text>
  </Panel>
);

// The signature object of this variant: counting row, then a production bar
// carrying its own replacement tick, with the block PAR anchored right.
const ProductionBand = ({ block }) => {
  const fillPct = (block.production / SCALE_MAX) * 100;
  const tickPct = (block.replacement / SCALE_MAX) * 100;
  const rail = block.primary ? S : `${S}55`;

  return (
    <Flex
      mb="0.6rem"
      borderRadius="0.55rem"
      overflow="hidden"
      // Team gradient wash (Bible section 7) - stronger on the primary block,
      // so team identity is present without a second accent color.
      bg={`linear-gradient(100deg, ${P}${block.primary ? "3D" : "1F"} 0%, rgba(255,255,255,0.025) 55%)`}
      border="1px solid"
      borderColor="whiteAlpha.100"
    >
      <Box w="3px" bg={rail} flexShrink={0} />
      <Box flex={1} minW={0} p="clamp(0.6rem, 1.1vw, 0.95rem)">
        <Flex align="baseline" justify="space-between" mb="0.5rem">
          <Text
            fontSize="0.6rem"
            fontWeight="900"
            color={block.primary ? "white" : "rgba(255,255,255,0.6)"}
            textTransform="uppercase"
            letterSpacing="0.11em"
          >
            {block.label}
          </Text>
          <Label>{block.primary ? "primary block" : "secondary block"}</Label>
        </Flex>

        <Flex wrap="wrap" gap="0.9rem" mb="0.75rem">
          {block.stats.map((s) => (
            <Box key={s.key} minW="3.4rem">
              <Label mb="0.1rem">{s.label}</Label>
              <Text fontSize="clamp(0.9rem, 1.6vw, 1.25rem)" fontWeight="950" fontFamily="mono" color="white" lineHeight={1}>
                {s.value}
              </Text>
            </Box>
          ))}
        </Flex>

        <Flex align="center" gap="0.7rem">
          <Label flexShrink={0}>Production</Label>
          <Box position="relative" flex={1} h="0.55rem" bg="rgba(255,255,255,0.07)" borderRadius="full" minW={0}>
            <Box position="absolute" left={0} top={0} bottom={0} w={`${fillPct}%`} bg={rail} opacity={0.85} borderRadius="full" />
            {/* replacement tick - everything left of it is replacement level */}
            <Box position="absolute" left={`${tickPct}%`} top="-3px" bottom="-3px" w="2px" bg="#0B0B0D" />
            <Box position="absolute" left={`${tickPct}%`} top="-6px" transform="translateX(-50%)" w="0" h="0"
              borderLeft="3px solid transparent" borderRight="3px solid transparent" borderTop="3px solid rgba(255,255,255,0.7)" />
          </Box>
          <Text fontSize="0.8rem" fontWeight="950" fontFamily="mono" color={S} flexShrink={0}>
            +{block.par.toFixed(1)}
          </Text>
        </Flex>
        <Flex justify="space-between" mt="0.2rem">
          <Label fontSize="0.4rem">replacement {block.replacement.toFixed(1)}</Label>
          <Label fontSize="0.4rem">production {block.production.toFixed(1)}</Label>
        </Flex>
      </Box>
    </Flex>
  );
};

const FormBars = () => {
  const last5 = LAB_GAMES.slice(-5);
  const max = Math.max(...last5.map((g) => g.total));
  return (
    <Panel h="full">
      <SectionLabel>Form · Last 5</SectionLabel>
      <Flex align="flex-end" gap="0.4rem" h="4rem" mb="0.5rem">
        {last5.map((g, i) => (
          <Flex key={g.wk} direction="column" align="center" flex={1} h="full" justify="flex-end" gap="0.2rem">
            <Box
              w="full"
              h={`${Math.max(6, (g.total / max) * 100)}%`}
              bg={i >= 3 ? S : `${S}4D`}
              borderRadius="2px 2px 0 0"
            />
            <Text fontSize="0.4rem" fontWeight="700" color="rgba(255,255,255,0.3)">{g.opp}</Text>
          </Flex>
        ))}
      </Flex>
      <Flex align="baseline" gap="0.4rem">
        <Text fontSize="0.78rem" fontWeight="950" fontFamily="mono" color={S}>
          +{LAB_FORM.last3Delta}
        </Text>
        <Label>PAR vs season avg</Label>
      </Flex>
    </Panel>
  );
};

const ConsistencyStrip = () => {
  const { min, max, floor, median, ceiling } = LAB_RANGE;
  const pos = (v) => ((v - min) / (max - min)) * 100;
  return (
    <Panel h="full">
      <SectionLabel>Consistency</SectionLabel>
      <Box position="relative" h="0.5rem" bg="rgba(255,255,255,0.07)" borderRadius="full" mt="1.1rem">
        <Box position="absolute" left={`${pos(floor)}%`} w={`${pos(ceiling) - pos(floor)}%`} top={0} bottom={0} bg={S} opacity={0.55} borderRadius="full" />
        <Box position="absolute" left={`${pos(median)}%`} top="-4px" bottom="-4px" w="2px" bg="white" transform="translateX(-50%)" />
      </Box>
      <Flex justify="space-between" mt="0.4rem">
        <Box>
          <Text fontSize="0.68rem" fontWeight="900" fontFamily="mono" color="rgba(255,255,255,0.7)">{floor}</Text>
          <Label fontSize="0.4rem">floor</Label>
        </Box>
        <Box textAlign="center">
          <Text fontSize="0.68rem" fontWeight="900" fontFamily="mono" color="white">{median}</Text>
          <Label fontSize="0.4rem">median</Label>
        </Box>
        <Box textAlign="right">
          <Text fontSize="0.68rem" fontWeight="900" fontFamily="mono" color="rgba(255,255,255,0.7)">{ceiling}</Text>
          <Label fontSize="0.4rem">ceiling</Label>
        </Box>
      </Flex>
      <Flex gap="0.9rem" mt="0.6rem" pt="0.5rem" borderTop="1px solid" borderColor="whiteAlpha.100">
        <Flex align="baseline" gap="0.25rem">
          <Text fontSize="0.7rem" fontWeight="950" fontFamily="mono" color="#48BB78">{LAB_RANGE.boomGames}</Text>
          <Label fontSize="0.4rem">boom</Label>
        </Flex>
        <Flex align="baseline" gap="0.25rem">
          <Text fontSize="0.7rem" fontWeight="950" fontFamily="mono" color="#F56565">{LAB_RANGE.bustGames}</Text>
          <Label fontSize="0.4rem">bust</Label>
        </Flex>
        <Flex align="baseline" gap="0.25rem">
          <Text fontSize="0.7rem" fontWeight="950" fontFamily="mono" color={S}>{LAB_RANGE.aboveReplacement}/10</Text>
          <Label fontSize="0.4rem">above repl</Label>
        </Flex>
      </Flex>
    </Panel>
  );
};

const MOMENTS = [
  { label: "BEST GAME", m: LAB_MOMENTS.best, color: "#48BB78", sign: "+" },
  { label: "RIVALRY GAME", m: LAB_MOMENTS.rivalry, color: S, sign: "+" },
  { label: "WORST GAME", m: LAB_MOMENTS.worst, color: "#F56565", sign: "+" },
];

export const PlayerStatsOverviewC = () => (
  <Box w="full" h="full" overflow="auto" bg="#0B0B0D" p="clamp(0.85rem, 1.6vw, 1.4rem)">
    {/* ── KPI STRIP ── */}
    <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(5, 1fr)" }} gap="0.5rem" mb="1rem">
      <KpiTile label="Total Yds" value="3,259" />
      <KpiTile label="Total TD" value="29" />
      <KpiTile label="PAR" value={`+${LAB_PRODUCTION.par.toFixed(1)}`} accent={S} />
      <KpiTile label="EPA / Play" value={`+${LAB_EFFICIENCY.epaPerPlay}`} />
      <KpiTile label="Success Rate" value={`${LAB_EFFICIENCY.successRate}%`} />
    </Grid>

    {/* ── PRODUCTION BANDS ── */}
    {LAB_BLOCKS.map((b) => (
      <Box key={b.key}>
        <SectionLabel>{b.label}</SectionLabel>
        <ProductionBand block={b} />
      </Box>
    ))}

    {/* ── FORM + CONSISTENCY ── */}
    <Grid templateColumns={{ base: "1fr", md: "1fr 1.15fr" }} gap="0.6rem" mt="0.9rem" mb="0.9rem">
      <FormBars />
      <ConsistencyStrip />
    </Grid>

    {/* ── COMPARATIVES ── */}
    <Panel mb="0.9rem">
      <SectionLabel>Comparatives</SectionLabel>
      {LAB_COMPARATIVES.map((c) => (
        <Box key={c.key} mb="0.55rem">
          <Flex justify="space-between" align="baseline" mb="0.18rem">
            <Text fontSize="0.6rem" fontWeight="800" color="white">{c.label}</Text>
            <Text fontSize="0.46rem" fontWeight="700" fontFamily="mono" color="rgba(255,255,255,0.42)">
              {c.pct}th pct · conf rank {c.rank}
            </Text>
          </Flex>
          <Box h="0.4rem" bg="rgba(255,255,255,0.07)" borderRadius="full">
            <Box h="full" w={`${c.pct}%`} bg={tierColor(c.pct)} opacity={0.85} borderRadius="full" />
          </Box>
        </Box>
      ))}
    </Panel>

    {/* ── SIGNATURE MOMENTS ── */}
    <SectionLabel>Signature Moments</SectionLabel>
    <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="0.6rem">
      {MOMENTS.map((x) => (
        <Panel key={x.label}>
          <Label mb="0.3rem">{x.label}</Label>
          <Text fontSize="0.82rem" fontWeight="900" color="white" mb="0.15rem">
            {x.m.label} {x.m.away ? "at" : "vs"} {x.m.opp}
          </Text>
          <Text fontSize="0.72rem" fontWeight="950" fontFamily="mono" color={x.color}>
            {x.sign}{x.m.total} PAR
          </Text>
        </Panel>
      ))}
    </Grid>
  </Box>
);
