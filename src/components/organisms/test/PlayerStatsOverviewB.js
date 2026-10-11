import { useState } from "react";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { Star, Zap, Flame, TrendingUp } from "lucide-react";
import {
  LAB_BLOCKS,
  LAB_EFFICIENCY,
  LAB_FORM,
  LAB_GAMES,
  LAB_MOMENTS,
  LAB_PLAYER,
  LAB_PRODUCTION,
  LAB_RANGE,
  LAB_ROLE,
  LAB_TEAM,
} from "./PlayerStatsOverviewLabData";

// ═══════════════════════════════════════════════════════════════
// PLAYER STATS OVERVIEW - VARIANT B  (agent2 direction)
//
// Thesis: four logical dashboard zones, built to agent2's spec as written,
// including the parts I argued against so they can be judged on screen
// rather than in the abstract:
//   Zone 1  Executive KPI strip + radial gauge
//   Zone 2  Form & trend (area sparkline, trend pill, floor/ceiling band,
//           boom/bust badges)
//   Zone 3  Modular production cards (counting grid, explosive-play meter,
//           red-zone callout)
//   Zone 4  Signature moments card stack + role progress rings
// Plus agent2's Total Season <-> Per Game toggle.
//
// Data: see PlayerStatsOverviewLabData.js for real / derived / mock split.
// ═══════════════════════════════════════════════════════════════

const P = LAB_TEAM.primary;
const S = LAB_TEAM.secondary;

// Per-game display values for the toggle. Counting stats are mock, so these
// are simply the season mocks divided by games played.
const PER_GAME = {
  cmp_att: "18.4/28.7",
  comp_pct: "64.1",
  pass_yds: "294.1",
  pass_td: "2.4",
  int: "0.8",
  yds_per_att: "10.2",
  long_pass: "62",
  first_downs: "9.1",
  rush_att: "7.2",
  rush_yds: "31.8",
  ypc: "4.4",
  rush_td: "0.5",
  long_rush: "31",
  first_downs_rushing: "1.9",
};

const ZoneTitle = ({ children, right }) => (
  <Flex align="center" justify="space-between" mb="0.55rem">
    <Flex align="center" gap="0.4rem">
      <Box w="3px" h="0.8rem" bg={S} borderRadius="sm" />
      <Text fontSize="0.63rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.09em">
        {children}
      </Text>
    </Flex>
    {right}
  </Flex>
);

const Card = ({ children, ...rest }) => (
  <Box bg="rgba(255,255,255,0.03)" border="1px solid" borderColor="whiteAlpha.100" borderRadius="0.6rem" p="clamp(0.65rem, 1.2vw, 1rem)" {...rest}>
    {children}
  </Box>
);

// Radial ring. Square viewBox + matching square w/h, pathLength=100 so the
// dash math is a straight percentage (avoids the arc-distortion bug from the
// banner gauge, which came from a wrapper aspectRatio drifting off viewBox).
const Ring = ({ pct, display, label, size = 84, color = S }) => (
  <Flex direction="column" align="center" gap="0.3rem">
    <Box position="relative" w={`${size}px`} h={`${size}px`}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block", transform: "rotate(-90deg)" }}>
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="100"
          strokeDashoffset={100 - Math.max(0, Math.min(100, pct))}
        />
      </svg>
      <Flex position="absolute" inset={0} align="center" justify="center">
        <Text fontSize="0.95rem" fontWeight="950" fontFamily="mono" color="white" lineHeight={1}>
          {display}
        </Text>
      </Flex>
    </Box>
    <Text fontSize="0.44rem" fontWeight="800" color="rgba(255,255,255,0.45)" textTransform="uppercase" letterSpacing="0.08em" textAlign="center">
      {label}
    </Text>
  </Flex>
);

const KpiTile = ({ value, label, accent }) => (
  <Card>
    <Text fontSize="0.46rem" fontWeight="800" color="rgba(255,255,255,0.45)" textTransform="uppercase" letterSpacing="0.09em" mb="0.25rem">
      {label}
    </Text>
    <Text fontSize="clamp(1.15rem, 2.2vw, 1.75rem)" fontWeight="950" fontFamily="mono" color={accent || "white"} lineHeight={1}>
      {value}
    </Text>
  </Card>
);

const Badge = ({ icon: Icon, color, children }) => (
  <Flex align="center" gap="0.28rem" px="0.42rem" py="0.16rem" borderRadius="0.25rem" bg={`${color}22`} border="1px solid" borderColor={`${color}55`}>
    {Icon && <Icon size={9} color={color} />}
    <Text fontSize="0.46rem" fontWeight="900" color={color} textTransform="uppercase" letterSpacing="0.06em">
      {children}
    </Text>
  </Flex>
);

const AreaSpark = ({ series }) => {
  const max = Math.max(...series);
  const min = Math.min(...series);
  const span = max - min || 1;
  const pts = series.map((v, i) => `${(i / (series.length - 1)) * 100},${34 - ((v - min) / span) * 28}`).join(" ");
  return (
    <Box w="full" h="3.6rem">
      <svg viewBox="0 0 100 36" preserveAspectRatio="none" width="100%" height="100%" style={{ display: "block" }}>
        <defs>
          <linearGradient id="labBFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={S} stopOpacity="0.45" />
            <stop offset="100%" stopColor={S} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={`0,36 ${pts} 100,36`} fill="url(#labBFill)" stroke="none" />
        <polyline points={pts} fill="none" stroke={S} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    </Box>
  );
};

const FloorCeilingBand = () => {
  const { min, max, floor, median, ceiling } = LAB_RANGE;
  const pos = (v) => ((v - min) / (max - min)) * 100;
  return (
    <Box mt="0.55rem">
      <Box position="relative" h="0.55rem" bg="rgba(255,255,255,0.06)" borderRadius="full">
        <Box position="absolute" left={`${pos(floor)}%`} w={`${pos(ceiling) - pos(floor)}%`} top={0} bottom={0} bg={S} opacity={0.7} borderRadius="full" />
        <Box position="absolute" left={`${pos(median)}%`} top="-3px" bottom="-3px" w="2px" bg="white" transform="translateX(-50%)" />
      </Box>
      <Flex justify="space-between" mt="0.25rem">
        <Text fontSize="0.44rem" fontFamily="mono" color="rgba(255,255,255,0.45)">floor {floor}</Text>
        <Text fontSize="0.44rem" fontFamily="mono" color="white">median {median}</Text>
        <Text fontSize="0.44rem" fontFamily="mono" color="rgba(255,255,255,0.45)">ceiling {ceiling}</Text>
      </Flex>
    </Box>
  );
};

const ExplosiveMeter = ({ items }) => (
  <Box mt="0.5rem">
    {items.map((e) => (
      <Box key={e.key} mb="0.35rem">
        <Flex justify="space-between" align="baseline" mb="0.12rem">
          <Text fontSize="0.44rem" fontWeight="800" color="rgba(255,255,255,0.45)" textTransform="uppercase" letterSpacing="0.07em">
            {e.label}
          </Text>
          <Text fontSize="0.6rem" fontWeight="900" fontFamily="mono" color="white">{e.value}</Text>
        </Flex>
        <Box h="4px" bg="rgba(255,255,255,0.06)" borderRadius="full">
          <Box h="full" w={`${(e.value / e.of) * 100}%`} bg={S} opacity={0.8} borderRadius="full" />
        </Box>
      </Box>
    ))}
  </Box>
);

const ProductionCard = ({ block, perGame }) => (
  <Card>
    <Flex align="center" justify="space-between" mb="0.5rem">
      <Text fontSize="0.66rem" fontWeight="950" color="white" textTransform="uppercase" letterSpacing="0.09em">
        {block.label}
      </Text>
      <Flex align="baseline" gap="0.3rem">
        <Text fontSize="0.46rem" fontWeight="700" color="rgba(255,255,255,0.35)" fontFamily="mono">
          {block.production.toFixed(1)} vs {block.replacement.toFixed(1)} repl
        </Text>
        <Text fontSize="0.82rem" fontWeight="950" fontFamily="mono" color={S}>
          +{block.par.toFixed(1)}
        </Text>
      </Flex>
    </Flex>
    <Grid templateColumns="repeat(auto-fit, minmax(3.6rem, 1fr))" gap="0.45rem">
      {block.stats.map((s) => (
        <Box key={s.key}>
          <Text fontSize="clamp(0.85rem, 1.5vw, 1.15rem)" fontWeight="950" fontFamily="mono" color="white" lineHeight={1}>
            {perGame && PER_GAME[s.key] ? PER_GAME[s.key] : s.value}
          </Text>
          <Text fontSize="0.42rem" fontWeight="800" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.07em">
            {s.label}
          </Text>
        </Box>
      ))}
    </Grid>
    <ExplosiveMeter items={block.explosive} />
    {block.key === "rushing" && (
      <Flex mt="0.4rem" align="center" gap="0.4rem" px="0.5rem" py="0.35rem" borderRadius="0.3rem" bg="rgba(229,62,62,0.12)" border="1px solid rgba(229,62,62,0.4)">
        <Text fontSize="0.44rem" fontWeight="800" color="#FC8181" textTransform="uppercase" letterSpacing="0.07em">
          Red Zone
        </Text>
        <Text fontSize="0.68rem" fontWeight="950" fontFamily="mono" color="white">
          4 TD / 9 ATT inside the 5
        </Text>
      </Flex>
    )}
  </Card>
);

const MOMENT_CARDS = [
  { icon: Star, color: "#FFB81C", label: "BEST GAME", m: LAB_MOMENTS.best },
  { icon: Flame, color: "#ED8936", label: "RIVALRY", m: LAB_MOMENTS.rivalry },
  { icon: TrendingUp, color: "#68D391", label: "MOST RECENT", m: LAB_MOMENTS.mostRecent },
];

export const PlayerStatsOverviewB = () => {
  const [perGame, setPerGame] = useState(false);

  return (
    <Box w="full" h="full" overflow="auto" bg="#0B0B0D" p="clamp(0.85rem, 1.6vw, 1.4rem)">
      {/* ── ZONE 1 — EXECUTIVE KPI STRIP ── */}
      <ZoneTitle
        right={
          <Flex bg="rgba(255,255,255,0.05)" borderRadius="0.35rem" p="2px" gap="2px">
            {[
              { k: false, l: "SEASON" },
              { k: true, l: "PER GAME" },
            ].map((t) => (
              <Box
                key={t.l}
                as="button"
                type="button"
                onClick={() => setPerGame(t.k)}
                px="0.5rem"
                py="0.15rem"
                borderRadius="0.25rem"
                bg={perGame === t.k ? S : "transparent"}
                border="none"
                cursor="pointer"
              >
                <Text fontSize="0.44rem" fontWeight="900" color={perGame === t.k ? "#0B0B0D" : "rgba(255,255,255,0.55)"} textTransform="uppercase" letterSpacing="0.07em">
                  {t.l}
                </Text>
              </Box>
            ))}
          </Flex>
        }
      >
        Season Snapshot
      </ZoneTitle>

      <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr) auto" }} gap="0.55rem" alignItems="stretch" mb="1.1rem">
        <KpiTile label="Total Production" value={LAB_PRODUCTION.totalProduction.toFixed(1)} />
        <KpiTile label="PAR" value={`+${LAB_PRODUCTION.par.toFixed(1)}`} accent={S} />
        <KpiTile label="EPA / Play" value={`+${LAB_EFFICIENCY.epaPerPlay}`} />
        <KpiTile label="Total Yds / TD" value={`3,259 / 29`} />
        <Card display="flex" alignItems="center" justifyContent="center" gap="0.9rem">
          <Ring pct={LAB_EFFICIENCY.successRate} display={`${LAB_EFFICIENCY.successRate}%`} label="Success Rate" />
          <Ring pct={91} display="91" label="Conf Pctl" color={P === "#4B0082" ? "#9F7AEA" : P} />
        </Card>
      </Grid>

      {/* ── ZONE 2 — FORM & TREND ── */}
      <Grid templateColumns={{ base: "1fr", lg: "1.35fr 1fr" }} gap="0.75rem" mb="1.1rem">
        <Box>
          <ZoneTitle
            right={
              <Badge icon={TrendingUp} color="#68D391">
                +{LAB_FORM.last3Delta} vs season avg
              </Badge>
            }
          >
            Form & Trend
          </ZoneTitle>
          <Card>
            <AreaSpark series={LAB_FORM.rolling3} />
            <Flex justify="space-between" mt="0.15rem">
              {LAB_GAMES.map((g) => (
                <Text key={g.wk} fontSize="0.4rem" fontWeight="700" color="rgba(255,255,255,0.28)">
                  {g.opp}
                </Text>
              ))}
            </Flex>
            <Flex gap="1.3rem" mt="0.6rem" pt="0.5rem" borderTop="1px solid" borderColor="whiteAlpha.100">
              <Box>
                <Text fontSize="0.95rem" fontWeight="950" fontFamily="mono" color="white" lineHeight={1}>{LAB_FORM.last3Avg}</Text>
                <Text fontSize="0.42rem" fontWeight="800" color="rgba(255,255,255,0.4)" textTransform="uppercase">last 3</Text>
              </Box>
              <Box>
                <Text fontSize="0.95rem" fontWeight="950" fontFamily="mono" color="white" lineHeight={1}>{LAB_FORM.last5Avg}</Text>
                <Text fontSize="0.42rem" fontWeight="800" color="rgba(255,255,255,0.4)" textTransform="uppercase">last 5</Text>
              </Box>
              <Box>
                <Text fontSize="0.95rem" fontWeight="950" fontFamily="mono" color={S} lineHeight={1}>+{LAB_FORM.last3Pct}%</Text>
                <Text fontSize="0.42rem" fontWeight="800" color="rgba(255,255,255,0.4)" textTransform="uppercase">trend</Text>
              </Box>
            </Flex>
          </Card>
        </Box>
        <Box>
          <ZoneTitle>Consistency</ZoneTitle>
          <Card>
            <FloorCeilingBand />
            <Flex gap="0.4rem" mt="0.7rem" wrap="wrap">
              <Badge color="#48BB78">{LAB_RANGE.boomGames} boom games</Badge>
              <Badge color="#F56565">{LAB_RANGE.bustGames} bust games</Badge>
              <Badge color={S}>{LAB_RANGE.aboveReplacement}/{LAB_PLAYER.gamesPlayed} above repl</Badge>
            </Flex>
            <Flex justify="space-between" mt="0.7rem" pt="0.5rem" borderTop="1px solid" borderColor="whiteAlpha.100">
              <Box>
                <Text fontSize="0.85rem" fontWeight="950" fontFamily="mono" color="white" lineHeight={1}>{LAB_RANGE.stddev}</Text>
                <Text fontSize="0.42rem" fontWeight="800" color="rgba(255,255,255,0.4)" textTransform="uppercase">std dev</Text>
              </Box>
              <Box>
                <Text fontSize="0.85rem" fontWeight="950" fontFamily="mono" color="white" lineHeight={1}>{LAB_RANGE.spread}</Text>
                <Text fontSize="0.42rem" fontWeight="800" color="rgba(255,255,255,0.4)" textTransform="uppercase">spread</Text>
              </Box>
              <Box>
                <Text fontSize="0.85rem" fontWeight="950" fontFamily="mono" color="white" lineHeight={1}>{LAB_RANGE.max}</Text>
                <Text fontSize="0.42rem" fontWeight="800" color="rgba(255,255,255,0.4)" textTransform="uppercase">best</Text>
              </Box>
            </Flex>
          </Card>
        </Box>
      </Grid>

      {/* ── ZONE 3 — MODULAR PRODUCTION ── */}
      <ZoneTitle>Production Blocks</ZoneTitle>
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="0.75rem" mb="1.1rem">
        {LAB_BLOCKS.map((b) => (
          <ProductionCard key={b.key} block={b} perGame={perGame} />
        ))}
      </Grid>

      {/* ── ZONE 4 — MOMENTS + ROLE ── */}
      <Grid templateColumns={{ base: "1fr", lg: "1.4fr 1fr" }} gap="0.75rem">
        <Box>
          <ZoneTitle>Signature Moments</ZoneTitle>
          <Flex direction="column" gap="0.45rem">
            {MOMENT_CARDS.map((c) => (
              <Card key={c.label} display="flex" alignItems="center" gap="0.7rem">
                <Flex w="1.7rem" h="1.7rem" align="center" justify="center" borderRadius="0.35rem" bg={`${c.color}22`} border="1px solid" borderColor={`${c.color}55`} flexShrink={0}>
                  <c.icon size={12} color={c.color} />
                </Flex>
                <Box flex={1} minW={0}>
                  <Text fontSize="0.42rem" fontWeight="900" color={c.color} textTransform="uppercase" letterSpacing="0.09em">
                    {c.label}
                  </Text>
                  <Text fontSize="0.75rem" fontWeight="900" color="white">
                    {c.m.away ? "at" : "vs"} {c.m.opp}
                    <Text as="span" fontSize="0.5rem" color="rgba(255,255,255,0.4)" fontWeight="700"> · {c.m.label}</Text>
                  </Text>
                </Box>
                <Text fontSize="1rem" fontWeight="950" fontFamily="mono" color={c.color}>
                  {c.m.total}
                </Text>
              </Card>
            ))}
            <Card display="flex" alignItems="center" gap="0.7rem">
              <Flex w="1.7rem" h="1.7rem" align="center" justify="center" borderRadius="0.35rem" bg="rgba(99,179,237,0.13)" border="1px solid rgba(99,179,237,0.35)" flexShrink={0}>
                <Zap size={12} color="#63B3ED" />
              </Flex>
              <Box flex={1} minW={0}>
                <Text fontSize="0.42rem" fontWeight="900" color="#63B3ED" textTransform="uppercase" letterSpacing="0.09em">
                  Standout Play
                </Text>
                <Text fontSize="0.68rem" fontWeight="800" color="white" lineHeight={1.3}>
                  {LAB_MOMENTS.standoutPlay.text}
                </Text>
              </Box>
              <Text fontSize="0.85rem" fontWeight="950" fontFamily="mono" color="#63B3ED">
                +{LAB_MOMENTS.standoutPlay.epa}
              </Text>
            </Card>
          </Flex>
        </Box>
        <Box>
          <ZoneTitle>Role & Share</ZoneTitle>
          <Card>
            <Flex justify="space-around" mb="0.8rem">
              <Ring pct={LAB_ROLE[4].pct} display={`${LAB_ROLE[4].pct}%`} label="Snap Share" size={72} />
              <Ring pct={LAB_ROLE[3].pct} display={`${LAB_ROLE[3].pct}%`} label="Dropbacks" size={72} color="#9F7AEA" />
            </Flex>
            {LAB_ROLE.slice(0, 3).map((r) => (
              <Box key={r.key} mb="0.42rem">
                <Flex justify="space-between" align="baseline" mb="0.12rem">
                  <Text fontSize="0.46rem" fontWeight="800" color="rgba(255,255,255,0.5)" textTransform="uppercase" letterSpacing="0.06em">
                    {r.label}
                  </Text>
                  <Text fontSize="0.66rem" fontWeight="900" fontFamily="mono" color="white">{r.pct}%</Text>
                </Flex>
                <Box h="4px" bg="rgba(255,255,255,0.06)" borderRadius="full">
                  <Box h="full" w={`${r.pct}%`} bg={S} opacity={0.85} borderRadius="full" />
                </Box>
              </Box>
            ))}
          </Card>
        </Box>
      </Grid>
    </Box>
  );
};
