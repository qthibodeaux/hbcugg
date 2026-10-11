import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { Star, Zap, Flame, Circle } from "lucide-react";
import {
  LAB_BLOCKS,
  LAB_COMPARATIVES,
  LAB_EFFICIENCY,
  LAB_FORM,
  LAB_GAMES,
  LAB_MOMENTS,
  LAB_PAR_PER_GAME,
  LAB_PLAYER,
  LAB_PRODUCTION,
  LAB_RANGE,
  LAB_ROLE,
  LAB_TEAM,
  LAB_WEEKS_LEADER,
} from "./PlayerStatsOverviewLabData";

// ═══════════════════════════════════════════════════════════════
// PLAYER STATS OVERVIEW - VARIANT A  (agent1 direction)
//
// Thesis: "mostly visualized summaries, not a spreadsheet."
//   - Season Snapshot split into PRODUCTION / EFFICIENCY / ROLE, each with
//     ONE dominant number and small supporting values (not equal cards)
//   - a tiny "why this exists" descriptor under every section title
//   - centerline bars (bad <- baseline -> good) for every evaluation metric
//   - Game Range as one distribution object instead of eight statistics
//   - Signature Moments as a week-axis timeline, not N cards
//   - Role as an allocation stack; Comparatives deliberately quiet
//
// Data: see PlayerStatsOverviewLabData.js for real / derived / mock split.
// ═══════════════════════════════════════════════════════════════

const P = LAB_TEAM.primary;
const S = LAB_TEAM.secondary;

const SectionTitle = ({ title, why }) => (
  <Flex align="baseline" gap="0.5rem" mb="0.6rem">
    <Box w="3px" h="0.85rem" bg={S} borderRadius="sm" alignSelf="center" />
    <Text fontSize="0.68rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.08em">
      {title}
    </Text>
    <Text fontSize="0.5rem" fontWeight="700" color="rgba(255,255,255,0.35)" textTransform="uppercase" letterSpacing="0.1em">
      {why}
    </Text>
  </Flex>
);

// One dominant number, supporting values kept deliberately small.
const SnapshotColumn = ({ heroValue, heroLabel, rows }) => (
  <Box>
    <Text
      fontSize="clamp(2.1rem, 4.2vw, 3.4rem)"
      fontWeight="950"
      fontFamily="mono"
      color="white"
      lineHeight={0.95}
      letterSpacing="-0.03em"
    >
      {heroValue}
    </Text>
    <Text fontSize="0.52rem" fontWeight="800" color={S} textTransform="uppercase" letterSpacing="0.1em" mb="0.6rem">
      {heroLabel}
    </Text>
    {rows.map((r) => (
      <Flex key={r.label} justify="space-between" align="baseline" py="0.18rem" borderTop="1px solid" borderColor="whiteAlpha.100">
        <Text fontSize="0.55rem" fontWeight="700" color="rgba(255,255,255,0.45)" textTransform="uppercase" letterSpacing="0.04em">
          {r.label}
        </Text>
        <Text fontSize="0.78rem" fontWeight="900" fontFamily="mono" color="white">
          {r.value}
        </Text>
      </Flex>
    ))}
  </Box>
);

// The core idea of this variant: anchor at a baseline, not at zero-left.
// Fill runs right when above baseline, left when below.
const CenterlineBar = ({ value, min, max, baseline, display, label }) => {
  const pos = (v) => Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
  const basePos = pos(baseline);
  const valPos = pos(value);
  const above = value >= baseline;
  const left = Math.min(basePos, valPos);
  const width = Math.abs(valPos - basePos);

  return (
    <Box mb="0.7rem">
      <Flex justify="space-between" align="baseline" mb="0.2rem">
        <Text fontSize="0.55rem" fontWeight="800" color="rgba(255,255,255,0.55)" textTransform="uppercase" letterSpacing="0.06em">
          {label}
        </Text>
        <Text fontSize="0.85rem" fontWeight="900" fontFamily="mono" color={above ? S : "#F56565"}>
          {display}
        </Text>
      </Flex>
      <Box position="relative" h="7px" bg="rgba(255,255,255,0.06)" borderRadius="2px">
        <Box position="absolute" left={`${left}%`} w={`${width}%`} top={0} bottom={0} bg={above ? S : "#F56565"} borderRadius="1px" opacity={0.9} />
        <Box position="absolute" left={`${basePos}%`} top="-2px" bottom="-2px" w="1px" bg="rgba(255,255,255,0.55)" />
      </Box>
    </Box>
  );
};

// Horizontal stat strip - big numbers, tiny labels, hairline separators.
const ProductionStrip = ({ block }) => (
  <Box mb="0.9rem" opacity={block.primary ? 1 : 0.75}>
    <Flex align="baseline" justify="space-between" mb="0.45rem">
      <Flex align="baseline" gap="0.5rem">
        <Text fontSize="0.72rem" fontWeight="950" color="white" textTransform="uppercase" letterSpacing="0.1em">
          {block.label}
        </Text>
        {!block.primary && (
          <Text fontSize="0.45rem" fontWeight="700" color="rgba(255,255,255,0.3)" textTransform="uppercase" letterSpacing="0.1em">
            secondary block
          </Text>
        )}
      </Flex>
      <Flex align="baseline" gap="0.35rem">
        <Text fontSize="0.95rem" fontWeight="950" fontFamily="mono" color={S}>
          +{block.par.toFixed(1)}
        </Text>
        <Text fontSize="0.45rem" fontWeight="800" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.08em">
          above repl
        </Text>
      </Flex>
    </Flex>
    <Box h="1px" bg="whiteAlpha.200" mb="0.55rem" />
    <Flex wrap="wrap">
      {block.stats.map((s, i) => (
        <Box
          key={s.key}
          flex="1 1 0"
          minW="4.2rem"
          pl={i === 0 ? 0 : "0.65rem"}
          borderLeft={i === 0 ? "none" : "1px solid"}
          borderColor="whiteAlpha.100"
          mb="0.45rem"
        >
          <Text fontSize="clamp(0.95rem, 1.7vw, 1.35rem)" fontWeight="950" fontFamily="mono" color="white" lineHeight={1}>
            {s.value}
          </Text>
          <Text fontSize="0.46rem" fontWeight="800" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.08em">
            {s.label}
          </Text>
        </Box>
      ))}
    </Flex>
    <Flex gap="1rem" mt="0.15rem">
      {block.extras.map((e) => (
        <Flex key={e.key} align="baseline" gap="0.3rem">
          <Text fontSize="0.62rem" fontWeight="900" fontFamily="mono" color="rgba(255,255,255,0.75)">
            {e.value}
          </Text>
          <Text fontSize="0.42rem" fontWeight="700" color="rgba(255,255,255,0.3)" textTransform="uppercase" letterSpacing="0.06em">
            {e.label}
          </Text>
        </Flex>
      ))}
    </Flex>
  </Box>
);

const Sparkline = ({ series }) => {
  const max = Math.max(...series);
  const min = Math.min(...series);
  const span = max - min || 1;
  const pts = series
    .map((v, i) => `${(i / (series.length - 1)) * 100},${30 - ((v - min) / span) * 26}`)
    .join(" ");

  return (
    <Box position="relative" w="full" h="3.2rem">
      <svg viewBox="0 0 100 32" preserveAspectRatio="none" width="100%" height="100%" style={{ display: "block" }}>
        <polyline points={pts} fill="none" stroke={S} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
        <polyline points={`0,32 ${pts} 100,32`} fill={S} opacity="0.12" stroke="none" />
      </svg>
    </Box>
  );
};

// One object communicating the whole shape of the season.
const GameRange = () => {
  const { min, max, floor, median, ceiling, stddev } = LAB_RANGE;
  const pos = (v) => ((v - min) / (max - min)) * 100;

  return (
    <Box>
      <Box position="relative" h="2.4rem" mt="0.9rem">
        <Box position="absolute" left={0} right={0} top="1.1rem" h="2px" bg="rgba(255,255,255,0.1)" borderRadius="full" />
        <Box
          position="absolute"
          left={`${pos(floor)}%`}
          w={`${pos(ceiling) - pos(floor)}%`}
          top="1.1rem"
          h="2px"
          bg={S}
          opacity={0.85}
        />
        {LAB_GAMES.map((g) => (
          <Box
            key={g.wk}
            position="absolute"
            left={`${pos(g.total)}%`}
            top="0.62rem"
            w="1px"
            h="0.7rem"
            bg="rgba(255,255,255,0.35)"
            transform="translateX(-50%)"
          />
        ))}
        <Box
          position="absolute"
          left={`${pos(median)}%`}
          top="0.5rem"
          transform="translateX(-50%)"
          w="9px"
          h="9px"
          borderRadius="full"
          bg={S}
          border="2px solid #0B0B0D"
        />
      </Box>
      <Flex justify="space-between">
        {[
          { l: "FLOOR", v: floor },
          { l: "MEDIAN", v: median },
          { l: "CEILING", v: ceiling },
          { l: "STD DEV", v: stddev },
        ].map((x) => (
          <Box key={x.l}>
            <Text fontSize="0.85rem" fontWeight="950" fontFamily="mono" color="white" lineHeight={1}>
              {x.v}
            </Text>
            <Text fontSize="0.44rem" fontWeight="800" color="rgba(255,255,255,0.35)" textTransform="uppercase" letterSpacing="0.08em">
              {x.l}
            </Text>
          </Box>
        ))}
      </Flex>
      <Flex gap="1.1rem" mt="0.6rem" pt="0.5rem" borderTop="1px solid" borderColor="whiteAlpha.100">
        <Flex align="baseline" gap="0.3rem">
          <Text fontSize="0.8rem" fontWeight="950" fontFamily="mono" color={S}>
            {LAB_RANGE.aboveReplacement}/{LAB_PLAYER.gamesPlayed}
          </Text>
          <Text fontSize="0.44rem" fontWeight="800" color="rgba(255,255,255,0.4)" textTransform="uppercase">
            above repl
          </Text>
        </Flex>
        <Flex align="baseline" gap="0.3rem">
          <Text fontSize="0.8rem" fontWeight="950" fontFamily="mono" color="#48BB78">
            {LAB_RANGE.boomGames}
          </Text>
          <Text fontSize="0.44rem" fontWeight="800" color="rgba(255,255,255,0.4)" textTransform="uppercase">
            boom
          </Text>
        </Flex>
        <Flex align="baseline" gap="0.3rem">
          <Text fontSize="0.8rem" fontWeight="950" fontFamily="mono" color="#F56565">
            {LAB_RANGE.bustGames}
          </Text>
          <Text fontSize="0.44rem" fontWeight="800" color="rgba(255,255,255,0.4)" textTransform="uppercase">
            bust
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
};

const MARKERS = {
  best: { icon: Star, color: "#FFB81C" },
  worst: { icon: Circle, color: "#F56565" },
  rivalry: { icon: Flame, color: "#ED8936" },
  play: { icon: Zap, color: "#63B3ED" },
};

// Week-axis timeline instead of one card per moment type.
const SignatureTimeline = () => {
  const marks = [
    { wk: LAB_MOMENTS.best.wk, kind: "best", title: "BEST GAME", detail: `${LAB_MOMENTS.best.total} PAR vs ${LAB_MOMENTS.best.opp}` },
    { wk: LAB_MOMENTS.worst.wk, kind: "worst", title: "WORST GAME", detail: `${LAB_MOMENTS.worst.total} PAR vs ${LAB_MOMENTS.worst.opp}` },
    { wk: LAB_MOMENTS.rivalry.wk, kind: "rivalry", title: "RIVALRY", detail: `${LAB_MOMENTS.rivalry.total} PAR at ${LAB_MOMENTS.rivalry.opp}` },
    { wk: LAB_MOMENTS.standoutPlay.wk, kind: "play", title: "STANDOUT PLAY", detail: `+${LAB_MOMENTS.standoutPlay.epa} EPA vs ${LAB_MOMENTS.standoutPlay.opp}` },
  ];
  const n = LAB_GAMES.length;

  return (
    <Box>
      <Box position="relative" h="1.5rem">
        <Box position="absolute" left={0} right={0} top="0.7rem" h="1px" bg="whiteAlpha.200" />
        {LAB_GAMES.map((g, i) => (
          <Box
            key={g.wk}
            position="absolute"
            left={`${(i / (n - 1)) * 100}%`}
            top="0.52rem"
            transform="translateX(-50%)"
            w="4px"
            h="4px"
            borderRadius="full"
            bg="rgba(255,255,255,0.25)"
          />
        ))}
        {marks.map((m) => {
          const Icon = MARKERS[m.kind].icon;
          return (
            <Flex
              key={m.kind}
              position="absolute"
              left={`${((m.wk - 1) / (n - 1)) * 100}%`}
              top="0.05rem"
              transform="translateX(-50%)"
              w="1.35rem"
              h="1.35rem"
              align="center"
              justify="center"
              borderRadius="full"
              bg="#0B0B0D"
              border="1px solid"
              borderColor={MARKERS[m.kind].color}
            >
              <Icon size={9} color={MARKERS[m.kind].color} />
            </Flex>
          );
        })}
      </Box>
      <Grid templateColumns="repeat(4, 1fr)" gap="0.6rem" mt="0.8rem">
        {marks.map((m) => (
          <Box key={m.kind} borderLeft="2px solid" borderColor={MARKERS[m.kind].color} pl="0.5rem">
            <Text fontSize="0.44rem" fontWeight="800" color={MARKERS[m.kind].color} textTransform="uppercase" letterSpacing="0.08em">
              {m.title}
            </Text>
            <Text fontSize="0.68rem" fontWeight="900" fontFamily="mono" color="white" lineHeight={1.25}>
              {m.detail}
            </Text>
          </Box>
        ))}
      </Grid>
    </Box>
  );
};

export const PlayerStatsOverviewA = () => (
  <Box w="full" h="full" overflow="auto" bg="#0B0B0D" p="clamp(0.85rem, 1.6vw, 1.4rem)">
    {/* ── SEASON SNAPSHOT ── */}
    <SectionTitle title="Season Snapshot" why="the whole season in three numbers" />
    <Grid templateColumns={{ base: "1fr", md: "repeat(3, minmax(0, 1fr))" }} gap="clamp(0.9rem, 2vw, 2rem)" mb="1.3rem">
      <SnapshotColumn
        heroValue={LAB_PRODUCTION.totalProduction.toFixed(1)}
        heroLabel="Total Production"
        rows={[
          { label: "Pass Prod", value: LAB_PRODUCTION.components.passing_production.toFixed(1) },
          { label: "Rush Prod", value: LAB_PRODUCTION.components.rushing_production.toFixed(1) },
          { label: "Total Yds", value: "3,259" },
        ]}
      />
      <SnapshotColumn
        heroValue={LAB_PAR_PER_GAME.toFixed(1)}
        heroLabel="PAR per game"
        rows={[
          { label: "Season PAR", value: LAB_PRODUCTION.par.toFixed(1) },
          { label: "EPA / Play", value: `+${LAB_EFFICIENCY.epaPerPlay}` },
          { label: "Success", value: `${LAB_EFFICIENCY.successRate}%` },
        ]}
      />
      <SnapshotColumn
        heroValue={`${LAB_ROLE[0].pct}%`}
        heroLabel="of team production"
        rows={[
          { label: "Dropbacks", value: `${LAB_ROLE[3].pct}%` },
          { label: "Snap Share", value: `${LAB_ROLE[4].pct}%` },
          { label: "Weeks Led", value: LAB_WEEKS_LEADER },
        ]}
      />
    </Grid>

    {/* ── PRODUCTION BLOCKS ── */}
    <SectionTitle title="Production" why="what he did" />
    {LAB_BLOCKS.map((b) => (
      <ProductionStrip key={b.key} block={b} />
    ))}

    {/* ── PERFORMANCE PROFILE + ROLE ── */}
    <Grid templateColumns={{ base: "1fr", lg: "1.15fr 1fr" }} gap="clamp(0.9rem, 2vw, 1.8rem)" mt="0.9rem" mb="1.2rem">
      <Box>
        <SectionTitle title="Performance Profile" why="how well he did it" />
        <CenterlineBar label="PAR / Game" value={LAB_PAR_PER_GAME} min={-6} max={24} baseline={0} display={`+${LAB_PAR_PER_GAME}`} />
        <CenterlineBar label="EPA / Play" value={LAB_EFFICIENCY.epaPerPlay} min={-0.3} max={0.4} baseline={0} display={`+${LAB_EFFICIENCY.epaPerPlay}`} />
        <CenterlineBar label="Success Rate" value={LAB_EFFICIENCY.successRate} min={30} max={75} baseline={45} display={`${LAB_EFFICIENCY.successRate}%`} />
        <CenterlineBar label="WPA" value={LAB_EFFICIENCY.wpaTotal} min={-2} max={3} baseline={0} display={`+${LAB_EFFICIENCY.wpaTotal}`} />
        <Text fontSize="0.44rem" color="rgba(255,255,255,0.3)" fontWeight="700" textTransform="uppercase" letterSpacing="0.06em">
          center tick = replacement / league baseline
        </Text>
      </Box>
      <Box>
        <SectionTitle title="Role" why="how much ran through him" />
        {LAB_ROLE.map((r) => (
          <Box key={r.key} mb="0.5rem">
            <Flex justify="space-between" align="baseline" mb="0.15rem">
              <Text fontSize="0.55rem" fontWeight="800" color="rgba(255,255,255,0.55)" textTransform="uppercase" letterSpacing="0.05em">
                {r.label}
              </Text>
              <Text fontSize="0.8rem" fontWeight="900" fontFamily="mono" color="white">
                {r.pct}%
              </Text>
            </Flex>
            <Box h="5px" bg="rgba(255,255,255,0.06)" borderRadius="2px">
              <Box h="full" w={`${r.pct}%`} bg={P === "#4B0082" ? S : P} opacity={0.85} borderRadius="2px" />
            </Box>
          </Box>
        ))}
      </Box>
    </Grid>

    {/* ── FORM + GAME RANGE ── */}
    <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="clamp(0.9rem, 2vw, 1.8rem)" mb="1.2rem">
      <Box>
        <SectionTitle title="Form" why="how he's moving" />
        <Flex justify="space-between" align="baseline">
          <Flex gap="1.4rem">
            <Box>
              <Text fontSize="1.15rem" fontWeight="950" fontFamily="mono" color="white" lineHeight={1}>
                {LAB_FORM.last3Avg}
              </Text>
              <Text fontSize="0.44rem" fontWeight="800" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.08em">
                last 3 PAR
              </Text>
            </Box>
            <Box>
              <Text fontSize="1.15rem" fontWeight="950" fontFamily="mono" color="white" lineHeight={1}>
                {LAB_FORM.last5Avg}
              </Text>
              <Text fontSize="0.44rem" fontWeight="800" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.08em">
                last 5 PAR
              </Text>
            </Box>
          </Flex>
          <Text fontSize="0.72rem" fontWeight="900" fontFamily="mono" color={S}>
            +{LAB_FORM.last3Pct}% vs season
          </Text>
        </Flex>
        <Sparkline series={LAB_FORM.rolling3} />
        <Flex justify="space-between">
          {LAB_GAMES.map((g) => (
            <Text key={g.wk} fontSize="0.4rem" fontWeight="700" color="rgba(255,255,255,0.28)">
              {g.opp}
            </Text>
          ))}
        </Flex>
      </Box>
      <Box>
        <SectionTitle title="Game Range" why="how wide the range is" />
        <GameRange />
      </Box>
    </Grid>

    {/* ── SIGNATURE MOMENTS ── */}
    <SectionTitle title="Signature Moments" why="where the season turned" />
    <Box mb="1.2rem">
      <SignatureTimeline />
    </Box>

    {/* ── CONFERENCE POSITION (deliberately quiet) ── */}
    <SectionTitle title="Conference Position" why="full detail lives in compare" />
    <Grid templateColumns={{ base: "1fr", md: "repeat(5, 1fr)" }} gap="0.5rem">
      {LAB_COMPARATIVES.map((c) => (
        <Flex key={c.key} justify="space-between" align="baseline" py="0.3rem" borderTop="1px solid" borderColor="whiteAlpha.100">
          <Text fontSize="0.5rem" fontWeight="700" color="rgba(255,255,255,0.45)" textTransform="uppercase" letterSpacing="0.04em">
            {c.label}
          </Text>
          <Flex align="baseline" gap="0.3rem">
            <Text fontSize="0.72rem" fontWeight="900" fontFamily="mono" color="white">
              {c.rank}/{c.of}
            </Text>
            <Text fontSize="0.44rem" fontWeight="700" color={S} fontFamily="mono">
              {c.pct}%
            </Text>
          </Flex>
        </Flex>
      ))}
    </Grid>
  </Box>
);
