import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { CARD_BG, HAIRLINE } from "./PosterChrome";
import { matchupInks, teamLogo, teamShort } from "./exportData";

// ═══════════════════════════════════════════════════════════════════════════════
// GAME FLOW STRIP — 1 x 3 under the poster banner
// ═══════════════════════════════════════════════════════════════════════════════
// The line score, win probability and cumulative EPA, side by side, laid out
// wide. All three read straight off the game file — `score_by_quarter`,
// `win_probability` and `epa_timeline`, the same blocks the game page's
// Scoring Summary and Game Flow cards read. Fixed px, poster tree only.

// `tall` is the vertical poster's strip; `wide` is the 16:9 left column, where the chart's
// viewBox matches its drawn size (35rem column less the card padding) so lines and labels
// aren't stretched.
const SIZES = {
  tall: { chartW: 300, chartH: 96, head: "0.75rem", axis: "0.625rem", team: "0.9375rem", q: "1.0625rem", total: "1.375rem", rowH: "2.75rem", logo: "1.5rem", qCol: "1.875rem", totalCol: "2.625rem", stroke: 2, epaStroke: 2.5, qLabel: 8 },
  wide: { chartW: 526, chartH: 196, head: "0.9375rem", axis: "0.75rem", team: "1.25rem", q: "1.375rem", total: "1.75rem", rowH: "3.375rem", logo: "1.875rem", qCol: "2.5rem", totalCol: "3.375rem", stroke: 3, epaStroke: 3.5, qLabel: 13 },
};

const CardHead = ({ title, right, size }) => (
  <Flex align="center" justify="space-between" pb="0.4375rem" mb="0.625rem" borderBottom="0.0625rem solid" borderColor={HAIRLINE} gap="0.5rem">
    <Text fontSize={size.head} fontWeight="950" textTransform="uppercase" letterSpacing="0.2em" color="rgba(var(--gg-fg), calc(0.7 + var(--gg-faint-boost, 0)))" whiteSpace="nowrap">{title}</Text>
    {right}
  </Flex>
);
const Card = ({ children }) => (
  <Box bg={CARD_BG} boxShadow="var(--gg-poster-shadow)" borderRadius="1rem" border="0.0625rem solid" borderColor={HAIRLINE} px="1rem" py="0.75rem" minW={0}>{children}</Box>
);
const Axis = ({ children, size, color = "rgba(var(--gg-fg), calc(0.35 + var(--gg-faint-boost, 0)))" }) => (
  <Text fontSize={size.axis} fontWeight="900" color={color} textTransform="uppercase" letterSpacing="0.08em" whiteSpace="nowrap">{children}</Text>
);

// "OT1" → "OT", "OT2" → "2OT"; Q1–Q4 print as 1–4.
const periodLabel = (label) => {
  const m = /^OT(\d+)$/i.exec(String(label ?? ""));
  if (m) return Number(m[1]) > 1 ? `${m[1]}OT` : "OT";
  return String(label ?? "").replace(/^Q/i, "");
};

const LineScore = ({ game, awayId, homeId, size }) => {
  const sbq = game?.score_by_quarter ?? {};
  const labels = Array.isArray(sbq.labels) ? sbq.labels : [];
  const awayFinal = game?.away_team?.score ?? null;
  const homeFinal = game?.home_team?.score ?? null;
  const cols = `minmax(0,1fr) repeat(${labels.length}, ${size.qCol}) ${size.totalCol}`;
  const rows = [
    { id: awayId, q: sbq.away ?? [], final: awayFinal, won: awayFinal != null && homeFinal != null && awayFinal > homeFinal },
    { id: homeId, q: sbq.home ?? [], final: homeFinal, won: awayFinal != null && homeFinal != null && homeFinal > awayFinal },
  ];
  return (
    <Card>
      <CardHead title="Scoring" size={size} />
      <Grid templateColumns={cols} columnGap="0.375rem" alignItems="center" mb="0.25rem">
        <Box />
        {labels.map((l) => <Box key={l} textAlign="center"><Axis size={size}>{periodLabel(l)}</Axis></Box>)}
        <Box textAlign="center"><Axis size={size}>T</Axis></Box>
      </Grid>
      {rows.map((r, i) => (
        <Grid key={r.id} templateColumns={cols} columnGap="0.375rem" alignItems="center" h={size.rowH} borderTop={i ? "0.0625rem solid" : "none"} borderColor={HAIRLINE}>
          <Flex align="center" gap="0.5rem" minW={0}>
            <Image src={teamLogo(r.id)} alt="" w={size.logo} h={size.logo} objectFit="contain" flexShrink={0} />
            <Text fontSize={size.team} fontWeight="950" textTransform="uppercase" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" color={r.won ? "var(--gg-ink)" : "rgba(var(--gg-fg), calc(0.6 + var(--gg-faint-boost, 0)))"}>{teamShort(r.id)}</Text>
          </Flex>
          {labels.map((l, qi) => (
            <Text key={l} fontSize={size.q} fontWeight="800" fontFamily="mono" textAlign="center" color="rgba(var(--gg-fg), calc(0.7 + var(--gg-faint-boost, 0)))">{r.q[qi] ?? "—"}</Text>
          ))}
          <Text fontSize={size.total} fontWeight="950" fontFamily="mono" textAlign="center" color={r.won ? (r.id === awayId ? matchupInks(awayId, homeId).away : matchupInks(awayId, homeId).home) : "rgba(var(--gg-fg), calc(0.5 + var(--gg-faint-boost, 0)))"}>{r.final ?? "—"}</Text>
        </Grid>
      ))}
    </Card>
  );
};

const WinProbability = ({ game, awayId, homeId, size }) => {
  const CHART_W = size.chartW;
  const WP_H = size.chartH;
  const wp = game?.win_probability ?? {};
  const pre = typeof wp.pregame_home === "number" ? wp.pregame_home : null;
  const fin = typeof wp.final?.home === "number" ? wp.final.home : null;
  const series = [];
  if (pre != null) series.push({ wp: pre, quarter: null });
  (Array.isArray(wp.timeline) ? wp.timeline : []).forEach((pt) => {
    if (typeof pt?.wp_home === "number") series.push({ wp: pt.wp_home, quarter: pt.quarter ?? null });
  });
  if (fin != null) series.push({ wp: fin, quarter: null });
  const n = series.length;
  const pts = series.map((p, i) => ({ ...p, x: n > 1 ? (i / (n - 1)) * CHART_W : 0, y: WP_H - p.wp * WP_H }));
  const path = pts.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
  const dividers = [];
  pts.forEach((p, i) => {
    const prev = pts.slice(0, i).reverse().find((q) => q.quarter != null);
    if (p.quarter != null && prev && prev.quarter !== p.quarter) dividers.push({ x: p.x, label: `Q${p.quarter}` });
  });
  const { home: homeC, away: awayC } = matchupInks(awayId, homeId);
  return (
    <Card>
      <CardHead title="Win Probability" size={size} right={pre != null ? <Axis size={size}>Pregame {teamShort(homeId)} {Math.round(pre * 100)}%</Axis> : null} />
      <svg viewBox={`0 0 ${CHART_W} ${WP_H}`} width="100%" height={WP_H} preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
        {/* Flat fills: the area above 50% in the home colour, below it in the away colour. */}
        <defs>
          <clipPath id="poster-wp-top"><rect x="0" y="0" width={CHART_W} height={WP_H / 2} /></clipPath>
          <clipPath id="poster-wp-bottom"><rect x="0" y={WP_H / 2} width={CHART_W} height={WP_H / 2} /></clipPath>
        </defs>
        <line x1="0" y1={WP_H / 2} x2={CHART_W} y2={WP_H / 2} stroke="rgba(var(--gg-fg), 0.18)" strokeWidth="1" strokeDasharray="4 4" />
        {dividers.map((d) => (
          <g key={`${d.label}-${d.x}`}>
            <line x1={d.x} y1="0" x2={d.x} y2={WP_H} stroke="rgba(var(--gg-fg), 0.08)" strokeWidth="1" />
            <text x={d.x + 3} y={size.qLabel + 1} fill="rgba(var(--gg-fg), 0.3)" fontSize={size.qLabel} fontWeight="bold">{d.label}</text>
          </g>
        ))}
        {n > 1 && (
          <>
            <path d={`${path} L ${CHART_W} ${WP_H / 2} L 0 ${WP_H / 2} Z`} fill={homeC} fillOpacity="0.45" clipPath="url(#poster-wp-top)" />
            <path d={`${path} L ${CHART_W} ${WP_H / 2} L 0 ${WP_H / 2} Z`} fill={awayC} fillOpacity="0.45" clipPath="url(#poster-wp-bottom)" />
            <path d={path} fill="none" stroke="var(--gg-ink)" strokeWidth={size.stroke} strokeLinejoin="round" strokeLinecap="round" />
          </>
        )}
      </svg>
      <Flex justify="space-between" mt="0.375rem">
        <Axis size={size} color={awayC}>{teamShort(awayId)} ↓</Axis>
        <Axis size={size}>50%</Axis>
        <Axis size={size} color={homeC}>{teamShort(homeId)} ↑</Axis>
      </Flex>
    </Card>
  );
};

const ExpectedPoints = ({ game, awayId, homeId, size }) => {
  const CHART_W = size.chartW;
  const EPA_H = size.chartH;
  const tl = game?.epa_timeline ?? {};
  const seriesFor = (id) => (Array.isArray(tl[id]) ? tl[id] : [])
    .filter((r) => typeof r?.cumulative_epa === "number")
    .map((r, i) => ({ x: typeof r.play_number === "number" ? r.play_number : i + 1, y: r.cumulative_epa }));
  const away = seriesFor(awayId);
  const home = seriesFor(homeId);
  const all = [...away, ...home];
  const maxX = Math.max(1, ...all.map((p) => p.x));
  const lo = Math.min(0, ...all.map((p) => p.y));
  const hi = Math.max(0, ...all.map((p) => p.y));
  const pad = Math.max(1, (hi - lo) * 0.08);
  const yMin = lo - pad;
  const yMax = hi + pad;
  const sx = (x) => (x / maxX) * CHART_W;
  const sy = (y) => EPA_H - ((y - yMin) / (yMax - yMin)) * EPA_H;
  const toPath = (pts) => (pts.length ? `M 0 ${sy(0)} ` + pts.map((p) => `L ${sx(p.x)} ${sy(p.y)}`).join(" ") : "");
  const fmt = (v) => (v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(1)}`);
  const { home: homeC, away: awayC } = matchupInks(awayId, homeId);
  return (
    <Card>
      <CardHead
        title="Expected Points"
        size={size}
        right={all.length ? (
          <Flex gap="0.625rem">
            <Axis size={size} color={awayC}>{teamShort(awayId)} {fmt(away[away.length - 1]?.y ?? null)}</Axis>
            <Axis size={size} color={homeC}>{teamShort(homeId)} {fmt(home[home.length - 1]?.y ?? null)}</Axis>
          </Flex>
        ) : null}
      />
      <svg viewBox={`0 0 ${CHART_W} ${EPA_H}`} width="100%" height={EPA_H} preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
        <line x1="0" y1={sy(0)} x2={CHART_W} y2={sy(0)} stroke="rgba(var(--gg-fg), 0.2)" strokeWidth="1" strokeDasharray="4 4" />
        {all.length > 0 && (
          <>
            <path d={toPath(away)} fill="none" stroke={awayC} strokeWidth={size.epaStroke} strokeLinejoin="round" strokeLinecap="round" />
            <path d={toPath(home)} fill="none" stroke={homeC} strokeWidth={size.epaStroke} strokeLinejoin="round" strokeLinecap="round" />
          </>
        )}
      </svg>
      <Flex justify="space-between" mt="0.375rem">
        <Axis size={size}>Play 1</Axis>
        <Axis size={size}>Cumulative EPA</Axis>
        <Axis size={size}>{all.length ? `Play ${maxX}` : "—"}</Axis>
      </Flex>
    </Card>
  );
};

// `stacked`: the three cards one above the other (the 16:9 Offensive Breakdown's left column).
export const GameFlowStrip = ({ game, awayId, homeId, stacked = false }) => (
  <Grid templateColumns={stacked ? "minmax(0,1fr)" : "repeat(3, minmax(0,1fr))"} gap="0.75rem" mb={stacked ? 0 : "1.125rem"} alignItems="stretch">
    <LineScore game={game} awayId={awayId} homeId={homeId} size={stacked ? SIZES.wide : SIZES.tall} />
    <WinProbability game={game} awayId={awayId} homeId={homeId} size={stacked ? SIZES.wide : SIZES.tall} />
    <ExpectedPoints game={game} awayId={awayId} homeId={homeId} size={stacked ? SIZES.wide : SIZES.tall} />
  </Grid>
);
