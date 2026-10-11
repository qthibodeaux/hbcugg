import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { SectionEyebrow } from "../../atoms/SectionEyebrow";
import { Link } from "react-router-dom";
import {
  ArrowRight, BookOpen, Copy, Fingerprint, Flame, GitCompare,
  Map, Scale, Slash, Target, TrendingDown, TrendingUp,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// STATS HUB — CARDS
//
// Architecture mirrors the People Hub deck: the feed carries `layout` and
// `viz.kind`, this module switches on those and never on `archetype`, so the
// generator can add archetype #40 without a new component here.
//
// THE ORGANIZING RULE (Stats Hub Design Doc §9.1):
//   Rankings are answers; relationships are questions. Every card is a
//   correlation, a relationship, or an anomaly — never a bare leaderboard row.
//   A card should end in "wait, why?" and hand you the door to find out.
//
// EVERY CARD CARRIES A CTA. The hub's whole job is to be a launch point, so
// each card ends in a real link into the tool that lets you chase the thing
// it just showed you.
//
// Feed: /data/0-data/stats_hub_cards_2025.json — built by
// scripts/build_stats_hub_cards.js from 108 real team-seasons. Every number
// rendered here is computed from data on disk; nothing is mocked.
// ─────────────────────────────────────────────────────────────────────────────

const ICONS = {
  target: Target, slash: Slash, map: Map, book: BookOpen, copy: Copy,
  fingerprint: Fingerprint, flame: Flame, "git-compare": GitCompare,
  scale: Scale, "trending-up": TrendingUp, "trending-down": TrendingDown,
};

const POSITIVE = "#48BB78";
const NEGATIVE = "#F6AD55";
const NEUTRAL = "rgba(255,255,255,0.28)";

const fmtPct = (v) => (Number.isFinite(v) ? `${(v * 100).toFixed(1)}%` : "—");
const fmtNum = (v, d = 1) => (Number.isFinite(v) ? v.toFixed(d) : "—");

const Kicker = ({ children, color = "text.muted", ...rest }) => (
  <Text fontSize="9px" fontWeight="900" color={color} textTransform="uppercase" letterSpacing="0.13em" lineClamp={1} {...rest}>
    {children}
  </Text>
);

// Section-card language from Stats Hub Design Doc §3.1 — accent bar beside an
// uppercase title, no gradients or watermarks.
const Panel = ({ icon, label, children, cta }) => {
  const Icon = ICONS[icon] ?? Target;
  return (
    <Flex
      direction="column" h="100%" minW={0} gap={3}
      bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100"
      borderRadius="lg" overflow="hidden" p={4}
    >
      <Box flexShrink={0}>
        <SectionEyebrow mb={0} icon={<Icon size={11} />}>{label}</SectionEyebrow>
      </Box>

      {children}

      {cta && (
        <Flex
          as={Link} to={cta.href} align="center" gap={1.5} mt="auto" flexShrink={0}
          color="brand.400" _hover={{ color: "brand.300" }} style={{ transition: "color 0.15s" }}
        >
          <Text fontSize="10px" fontWeight="900" textTransform="uppercase" letterSpacing="0.1em">
            {cta.label}
          </Text>
          <ArrowRight size={12} />
        </Flex>
      )}
    </Flex>
  );
};

const Headline = ({ children }) => (
  <Text fontSize={{ base: "sm", lg: "md" }} fontWeight="900" color="white" lineHeight={1.2} letterSpacing="-0.01em">
    {children}
  </Text>
);

const Subhead = ({ children }) => (
  <Text fontSize="11px" color="whiteAlpha.700" lineHeight={1.45}>
    {children}
  </Text>
);

const BigStat = ({ value, label, context, color = "white" }) => (
  <Box flexShrink={0}>
    <Text fontSize="clamp(1.6rem, 3vw, 2.4rem)" fontWeight="900" fontStyle="italic" color={color} lineHeight={0.85} letterSpacing="-0.04em" fontVariantNumeric="tabular-nums">
      {value}
    </Text>
    <Kicker mt={1.5}>{label}</Kicker>
    {context && <Kicker mt={0.5} color="whiteAlpha.500">{context}</Kicker>}
  </Box>
);

// ═══ VIZ ═════════════════════════════════════════════════════════════════════

// Diverging bars from a centre line — sign carries meaning (does more of this
// help or hurt), so the axis has to be the zero point, not the left edge.
const CorrelationBars = ({ viz }) => {
  const max = Math.max(...viz.entries.map((e) => e.abs), 0.1);
  return (
    <Flex direction="column" gap={1.5} flex={1} minH={0} justify="center">
      {viz.entries.map((e) => {
        const width = (e.abs / max) * 48;
        const positive = e.r >= 0;
        return (
          <Flex key={e.label} align="center" gap={2} minW={0}>
            <Text fontSize="8px" fontWeight="900" color="whiteAlpha.600" w="62px" flexShrink={0} textTransform="uppercase" lineClamp={1}>
              {e.short}
            </Text>
            <Box position="relative" flex={1} h="9px" minW={0}>
              <Box position="absolute" left="50%" top={0} bottom={0} w="1px" bg="whiteAlpha.300" />
              <Box
                position="absolute" top={0} bottom={0} borderRadius="sm"
                bg={positive ? POSITIVE : NEGATIVE}
                style={positive
                  ? { left: "50%", width: `${width}%` }
                  : { right: "50%", width: `${width}%` }}
              />
            </Box>
            <Text fontSize="9px" fontWeight="900" color="white" w="34px" textAlign="right" flexShrink={0} fontVariantNumeric="tabular-nums">
              {e.r > 0 ? "+" : ""}{e.r.toFixed(2)}
            </Text>
          </Flex>
        );
      })}
      <Flex justify="space-between" mt={1}>
        <Kicker color="whiteAlpha.500">← less of it wins</Kicker>
        <Kicker color="whiteAlpha.500">more of it wins →</Kicker>
      </Flex>
    </Flex>
  );
};

// All 18 teams at once — the point of the card is that nothing is truncated.
const ScatterMap = ({ viz }) => {
  const xs = viz.points.map((p) => p.x);
  const ys = viz.points.map((p) => p.y);
  const pad = (arr) => {
    const lo = Math.min(...arr), hi = Math.max(...arr);
    const m = (hi - lo) * 0.12 || 0.01;
    return [lo - m, hi + m];
  };
  const [x0, x1] = pad(xs);
  const [y0, y1] = pad(ys);
  const px = (v) => ((v - x0) / (x1 - x0)) * 100;
  // y inverted so "better" reads upward when the metric is negative-is-good
  const py = (v) => {
    const raw = ((v - y0) / (y1 - y0)) * 100;
    return viz.y.invert ? raw : 100 - raw;
  };

  return (
    <Box flex={1} minH="140px" position="relative">
      <Box position="relative" w="100%" h="100%" minH="140px">
        {/* League-average crosshair — the quadrant divider */}
        <Box position="absolute" left={`${px(viz.league.x)}%`} top={0} bottom={0} w="1px" bg="whiteAlpha.200" />
        <Box position="absolute" top={`${py(viz.league.y)}%`} left={0} right={0} h="1px" bg="whiteAlpha.200" />

        {viz.points.map((p) => (
          <Box
            key={p.team_id}
            as={Link}
            to={`/teams/${p.team_id}`}
            position="absolute"
            left={`${px(p.x)}%`}
            top={`${py(p.y)}%`}
            transform="translate(-50%, -50%)"
            w="22px" h="22px"
            borderRadius="full"
            bg="blackAlpha.600"
            border="1.5px solid"
            borderColor={p.color ?? "whiteAlpha.400"}
            display="flex" alignItems="center" justifyContent="center"
            overflow="hidden"
            _hover={{ transform: "translate(-50%, -50%) scale(1.25)", zIndex: 3 }}
            style={{ transition: "transform 0.15s" }}
            title={`${p.short} · ${p.record}`}
          >
            {p.logo
              ? <Image src={p.logo} alt={p.short} w="15px" h="15px" objectFit="contain" />
              : <Text fontSize="7px" fontWeight="900" color="white">{p.short}</Text>}
          </Box>
        ))}
      </Box>
      <Flex justify="space-between" mt={1}>
        <Kicker color="whiteAlpha.500">{viz.x.label}</Kicker>
        <Kicker color="whiteAlpha.500">{viz.y.label} ↑</Kicker>
      </Flex>
    </Box>
  );
};

// League spread on one metric — every team as a column, leader emphasized.
const Distribution = ({ viz }) => {
  const vals = viz.entries.map((e) => e.value);
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const span = hi - lo || 1;
  return (
    <Flex direction="column" gap={2} flex={1} minH={0}>
      <Flex align="flex-end" gap="3px" flex={1} minH="70px">
        {viz.entries.map((e, i) => (
          <Flex
            key={e.team_id} as={Link} to={`/teams/${e.team_id}`}
            direction="column" align="center" flex={1} minW={0} h="100%" justify="flex-end" gap={1}
            _hover={{ opacity: 0.75 }} style={{ transition: "opacity 0.15s" }}
            title={`${e.short} · ${viz.unit === "pct" ? fmtPct(e.value) : fmtNum(e.value, 2)}`}
          >
            <Box
              w="100%" borderRadius="sm"
              bg={i === 0 ? (e.color ?? "brand.500") : "whiteAlpha.200"}
              style={{ height: `${Math.max(((e.value - lo) / span) * 100, 6)}%` }}
            />
            {e.logo
              ? <Image src={e.logo} alt={e.short} w="12px" h="12px" objectFit="contain" opacity={i === 0 ? 1 : 0.55} />
              : null}
          </Flex>
        ))}
      </Flex>
      <Flex justify="space-between">
        <Kicker color="whiteAlpha.500">
          Leader {viz.entries[0]?.short} · {viz.unit === "pct" ? fmtPct(viz.entries[0]?.value) : fmtNum(viz.entries[0]?.value, 2)}
        </Kicker>
        <Kicker color="whiteAlpha.500">
          Lg avg {viz.unit === "pct" ? fmtPct(viz.league_avg) : fmtNum(viz.league_avg, 2)}
        </Kicker>
      </Flex>
    </Flex>
  );
};

const Dumbbell = ({ viz }) => (
  <Flex direction="column" gap={3} flex={1} justify="center">
    {viz.rows.map((r) => (
      <Box key={r.label}>
        <Flex align="baseline" justify="space-between" gap={2} mb={1}>
          <Kicker color={r.tone === "accent" ? "white" : "whiteAlpha.600"}>{r.label}</Kicker>
          <Text fontSize="12px" fontWeight="900" fontStyle="italic" color="white" fontVariantNumeric="tabular-nums">
            {r.value.toFixed(3)}
          </Text>
        </Flex>
        <Box h="6px" borderRadius="full" bg="whiteAlpha.100" overflow="hidden">
          <Box
            h="100%" borderRadius="full"
            bg={r.tone === "accent" ? POSITIVE : NEUTRAL}
            style={{ width: `${Math.max((r.value / viz.max) * 100, 2)}%` }}
          />
        </Box>
      </Box>
    ))}
  </Flex>
);

const DeltaBars = ({ viz }) => (
  <Flex direction="column" gap={3} flex={1} justify="center">
    {viz.rows.map((r) => (
      <Box key={r.label}>
        <Flex align="baseline" justify="space-between" gap={2} mb={1}>
          <Kicker color={r.tone === "accent" ? "white" : "whiteAlpha.600"}>{r.label}</Kicker>
          <Text fontSize="13px" fontWeight="900" fontStyle="italic" color="white" fontVariantNumeric="tabular-nums">
            {Math.round(r.value * 100)}%
          </Text>
        </Flex>
        <Box h="7px" borderRadius="full" bg="whiteAlpha.100" overflow="hidden">
          <Box
            h="100%" borderRadius="full"
            bg={r.tone === "accent" ? "brand.500" : NEUTRAL}
            style={{ width: `${Math.max((r.value / viz.max) * 100, 2)}%` }}
          />
        </Box>
      </Box>
    ))}
  </Flex>
);

// Shared radar geometry — one polygon per series, percentile-scaled.
const RadarShape = ({ axes, series, size = 150 }) => {
  const R = 34, CX = 50, CY = 46;
  const pt = (i, scale) => {
    const a = (-90 + i * (360 / axes.length)) * (Math.PI / 180);
    return [CX + R * scale * Math.cos(a), CY + R * scale * Math.sin(a)];
  };
  const ring = (s) => axes.map((_, i) => pt(i, s).join(",")).join(" ");

  return (
    <Flex align="center" justify="center" w="100%" h="100%" minH="120px">
      {/* Width cap — without it the SVG stretches and the axis labels scale with it. */}
      <Box w="100%" maxW={`${size}px`}>
        <svg viewBox="0 0 100 92" width="100%" height="100%" style={{ display: "block", overflow: "visible" }}>
          {[0.33, 0.66, 1].map((s) => (
            <polygon key={s} points={ring(s)} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.6" />
          ))}
          {axes.map((_, i) => {
            const [x, y] = pt(i, 1);
            return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="rgba(255,255,255,0.09)" strokeWidth="0.5" />;
          })}
          {series.map((s) => (
            <polygon
              key={s.label}
              points={axes.map((a, i) => pt(i, Math.max((s.values[i] ?? 0) / 100, 0.03)).join(",")).join(" ")}
              fill={`${s.color}45`} stroke={s.color} strokeWidth="1.6"
            />
          ))}
          {axes.map((a, i) => {
            const [x, y] = pt(i, 1.28);
            return (
              <text key={a.key} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
                fontSize="5.4" fontWeight="800" fill="rgba(255,255,255,0.65)">
                {a.label}
              </text>
            );
          })}
        </svg>
      </Box>
    </Flex>
  );
};

const SingleRadar = ({ viz }) => (
  <RadarShape
    axes={viz.axes}
    series={[{ label: "team", color: viz.color ?? "#A855F7", values: viz.axes.map((a) => a.value) }]}
  />
);

const TwinRadar = ({ viz }) => (
  <Flex direction="column" flex={1} minH={0} gap={1}>
    <RadarShape
      axes={viz.axes}
      series={[
        { label: viz.a_label, color: viz.a_color ?? "#A855F7", values: viz.axes.map((a) => a.a) },
        { label: viz.b_label, color: viz.b_color ?? "#4299E1", values: viz.axes.map((a) => a.b) },
      ]}
    />
    <Flex justify="center" gap={4}>
      {[[viz.a_label, viz.a_color], [viz.b_label, viz.b_color]].map(([label, color]) => (
        <Flex key={label} align="center" gap={1.5}>
          <Box w="8px" h="8px" borderRadius="sm" bg={color ?? "#A855F7"} />
          <Kicker color="whiteAlpha.700">{label}</Kicker>
        </Flex>
      ))}
    </Flex>
  </Flex>
);

const ConferenceSplit = ({ viz }) => {
  const max = Math.max(...viz.groups.map((g) => g.value), 0.01);
  return (
    <Flex direction="column" gap={3} flex={1} justify="center">
      {viz.groups.map((g) => (
        <Box key={g.label}>
          <Flex align="baseline" justify="space-between" gap={2} mb={1}>
            <Flex align="center" gap={1.5}>
              <Kicker color={g.label === viz.better ? "white" : "whiteAlpha.600"}>{g.label}</Kicker>
              <Kicker color="whiteAlpha.400">{g.teams} teams</Kicker>
            </Flex>
            <Text fontSize="12px" fontWeight="900" fontStyle="italic" color="white" fontVariantNumeric="tabular-nums">
              {fmtPct(g.value)}
            </Text>
          </Flex>
          <Box h="8px" borderRadius="full" bg="whiteAlpha.100" overflow="hidden">
            <Box h="100%" borderRadius="full" bg={g.label === viz.better ? "brand.500" : NEUTRAL}
              style={{ width: `${(g.value / max) * 100}%` }} />
          </Box>
        </Box>
      ))}
      <Kicker color="whiteAlpha.500">{viz.metric}</Kicker>
    </Flex>
  );
};

const SeasonTrend = ({ viz }) => {
  const vals = viz.entries.map((e) => e.value);
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const span = hi - lo || 1;
  return (
    <Flex align="flex-end" gap={1.5} flex={1} minH="70px">
      {viz.entries.map((e) => (
        <Flex key={e.label} direction="column" align="center" flex={1} minW={0} h="100%" justify="flex-end" gap={1}>
          <Text fontSize="8px" fontWeight="900" color={e.highlight ? "white" : "whiteAlpha.500"} fontVariantNumeric="tabular-nums">
            {e.value.toFixed(2)}
          </Text>
          <Box w="100%" borderRadius="sm" bg={e.highlight ? "brand.500" : "whiteAlpha.200"}
            style={{ height: `${Math.max(((e.value - lo) / span) * 100, 8)}%` }} />
          <Kicker color={e.highlight ? "white" : "whiteAlpha.500"} fontSize="8px">{e.label}</Kicker>
        </Flex>
      ))}
    </Flex>
  );
};

const RankBars = ({ viz }) => {
  const max = Math.max(...viz.entries.map((e) => e.value), 1);
  return (
    <Flex align="flex-end" gap={1.5} flex={1} minH="70px">
      {viz.entries.map((e) => (
        <Flex key={e.label} direction="column" align="center" flex={1} minW={0} h="100%" justify="flex-end" gap={1}>
          <Text fontSize="8px" fontWeight="900" color={e.is_subject ? "white" : "whiteAlpha.500"} fontVariantNumeric="tabular-nums">
            {e.value}
          </Text>
          <Box w="100%" borderRadius="sm" bg={e.is_subject ? (e.color ?? "brand.500") : "whiteAlpha.200"}
            style={{ height: `${Math.max((e.value / max) * 100, 6)}%` }} />
          <Kicker color={e.is_subject ? "white" : "whiteAlpha.500"} fontSize="7.5px">{e.label}</Kicker>
        </Flex>
      ))}
    </Flex>
  );
};

const VIZ = {
  correlation_bars: CorrelationBars,
  scatter_map: ScatterMap,
  distribution: Distribution,
  dumbbell: Dumbbell,
  delta_bars: DeltaBars,
  radar: SingleRadar,
  twin_radar: TwinRadar,
  conference_split: ConferenceSplit,
  season_trend: SeasonTrend,
  rank_bars: RankBars,
};

const Viz = ({ viz }) => {
  const C = viz ? VIZ[viz.kind] : null;
  return C ? <C viz={viz} /> : null;
};

// ═══ SUBJECT ROW — teams/players the card is about ═══════════════════════════

const SubjectRow = ({ subject = [] }) => {
  if (!subject.length) return null;
  return (
    <Flex gap={3} flexShrink={0} wrap="wrap">
      {subject.map((s) => (
        <Flex key={s.team_id ?? s.person_id} as={Link} to={s.href} align="center" gap={2} minW={0}
          _hover={{ opacity: 0.8 }} style={{ transition: "opacity 0.15s" }}>
          {s.image_url ? (
            <Box w="34px" h="34px" borderRadius="md" overflow="hidden" bg="blackAlpha.500" flexShrink={0}>
              <Image src={s.image_url} alt={s.name} w="100%" h="100%" objectFit="cover" objectPosition="top center" />
            </Box>
          ) : s.logo ? (
            <Image src={s.logo} alt={s.name} w="26px" h="26px" objectFit="contain" flexShrink={0} />
          ) : null}
          <Box minW={0}>
            <Text fontSize="11px" fontWeight="900" color="white" lineClamp={1}>{s.name}</Text>
            <Kicker color="whiteAlpha.500">{s.record ?? s.position ?? s.short}</Kicker>
          </Box>
        </Flex>
      ))}
    </Flex>
  );
};

// ═══ CARD ════════════════════════════════════════════════════════════════════

const ARCHETYPE_LABEL = {
  win_levers: "What Wins",
  dead_metric: "Doesn't Matter",
  league_map: "The League Map",
  metric_of_week: "Metric of the Week",
  record_ahead_of_performance: "Doesn't Add Up",
  performance_ahead_of_record: "Doesn't Add Up",
  statistical_twins: "Statistical Twins",
  team_fingerprint: "Team Fingerprint",
  conference_gap: "SWAC vs MEAC",
  parity_index: "League Parity",
  production_leader: "Production Leader",
};

export const StatsHubCard = ({ card }) => (
  <Panel icon={card.icon} label={ARCHETYPE_LABEL[card.archetype] ?? card.archetype} cta={card.cta}>
    <Box flexShrink={0}>
      <Headline>{card.headline}</Headline>
      {card.subhead && <Box mt={1.5}><Subhead>{card.subhead}</Subhead></Box>}
    </Box>

    <SubjectRow subject={card.subject} />

    {card.stat_primary && (
      <Flex align="flex-end" gap={5} flexShrink={0} wrap="wrap">
        <BigStat
          value={card.stat_primary.value}
          label={card.stat_primary.label}
          context={card.stat_primary.context}
        />
        {(card.stat_support ?? []).map((s) => (
          <Box key={s.label} pb={1}>
            <Text fontSize="sm" fontWeight="900" fontStyle="italic" color="whiteAlpha.900" lineHeight={1} fontVariantNumeric="tabular-nums">
              {s.value}
            </Text>
            <Kicker mt={1}>{s.label}</Kicker>
          </Box>
        ))}
      </Flex>
    )}

    <Box flex={1} minH={0}>
      <Viz viz={card.viz} />
    </Box>
  </Panel>
);

// Slot sizing per viz kind — a correlation chart with ten rows and a scatter of
// all 18 teams both need real estate; a two-row delta bar does not.
const SLOT = {
  correlation_bars: { cols: 2, rows: 2 },
  scatter_map: { cols: 2, rows: 2 },
  distribution: { cols: 2, rows: 1 },
  twin_radar: { cols: 2, rows: 2 },
  radar: { cols: 1, rows: 2 },
  delta_bars: { cols: 1, rows: 1 },
  dumbbell: { cols: 1, rows: 1 },
  conference_split: { cols: 1, rows: 1 },
  season_trend: { cols: 1, rows: 1 },
  rank_bars: { cols: 1, rows: 1 },
};

export const slotFor = (card) => SLOT[card?.viz?.kind] ?? { cols: 1, rows: 1 };

export default StatsHubCard;
