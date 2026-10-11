import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { teamLogo, teamShort } from "../../game/export/exportData";
import { vivid } from "../../molecules/home/teamColor";

// ─────────────────────────────────────────────────────────────────────────────
// STATS HUB — CONTEXT CARDS. The eleven hub cards, rebuilt in
// the Game Center context-card language: one shell (eyebrow, headline, one big
// number, the why line), one bespoke visual per card, everything in cqmin off
// the card so a card reads the same in any slot. Data: the backend's
// stats/hub-cards/{season}.json (Stats Hub Cards Fetch Contract).
// Lab copy: organisms/test/StatsHubContextCardsA.js (#1712).
// ─────────────────────────────────────────────────────────────────────────────

const GOOD = "#22C55E";
const BAD = "#F59E0B";
const ACCENT = "#A855F7";
const DIM = "rgba(255,255,255,0.5)";
const FAINT = "rgba(255,255,255,0.1)";

const sign = (v, d = 3) => (Number.isFinite(v) ? `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(d)}` : "—");
const pct = (v, d = 1) => (Number.isFinite(v) ? `${(v * 100).toFixed(d)}%` : "—");

const Logo = ({ id, size, ...rest }) => <Image src={teamLogo(id)} alt="" w={`${size}cqmin`} h={`${size}cqmin`} objectFit="contain" flexShrink={0} {...rest} />;
const Big = ({ children, size = 16, color = "white", ...rest }) => (
  <Text fontSize={`${size}cqmin`} fontWeight="black" fontStyle="italic" color={color} lineHeight={0.88} letterSpacing="-0.04em" fontVariantNumeric="tabular-nums" lineClamp={1} {...rest}>
    {children}
  </Text>
);
const Small = ({ children, color = DIM, size = 3.4, ...rest }) => (
  <Text fontSize={`${size}cqmin`} fontWeight="black" color={color} textTransform="uppercase" letterSpacing="0.1em" lineHeight={1.15} lineClamp={1} {...rest}>
    {children}
  </Text>
);

// One shell: eyebrow, headline, body, why. `scale` keeps type the same size
// across a 1x1 and a 2x2 (cqmin is the short side, so a 2x1 reads at 1x1 size).
const Shell = ({ c, accent = ACCENT, mark, scale = 1, children }) => (
  <Box position="relative" w="full" h="full" bg="#141416" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" overflow="hidden" style={{ containerType: "size" }}>
    {mark ? <Logo id={mark} size={62 * scale} position="absolute" right="-10cqmin" top="-10cqmin" opacity={0.07} pointerEvents="none" /> : null}
    <Flex position="relative" direction="column" h="full" p={`${5 * scale}cqmin`} gap={`${2.4 * scale}cqmin`}>
      <Flex align="center" gap={`${2 * scale}cqmin`}>
        <Box w={`${1.6 * scale}cqmin`} h={`${1.6 * scale}cqmin`} borderRadius="full" bg={accent} flexShrink={0} />
        <Text fontSize={`${4 * scale}cqmin`} fontWeight="black" color={DIM} textTransform="uppercase" letterSpacing="0.14em" lineClamp={1}>{c.title}</Text>
      </Flex>
      <Text fontSize={`${6.2 * scale}cqmin`} fontWeight="black" color="white" lineHeight={1.05} letterSpacing="-0.01em" lineClamp={2}>{c.headline}</Text>
      <Flex direction="column" flex={1} minH={0}>{children}</Flex>
      {c.why ? <Text fontSize={`${3.6 * scale}cqmin`} fontWeight="bold" color="rgba(255,255,255,0.6)" lineHeight={1.3} lineClamp={2}>{c.why}</Text> : null}
    </Flex>
  </Box>
);

// ── 1 · What Wins — ten levers as a diverging tug from the zero line ────────
const WinLevers = ({ c }) => {
  const max = Math.max(...c.viz.entries.map((e) => Math.abs(e.r)), 0.01);
  return (
    <Shell c={c} scale={0.62}>
      <Flex align="flex-end" gap="3cqmin" mb="2.4cqmin">
        <Big size={11} color={c.stat.value >= 0 ? GOOD : BAD}>{c.stat.display}</Big>
        <Small mb="0.6cqmin">{c.stat.label}</Small>
      </Flex>
      <Flex direction="column" flex={1} minH={0} justify="space-between">
        {c.viz.entries.map((e) => {
          const w = (Math.abs(e.r) / max) * 50;
          const up = e.r >= 0;
          return (
            <Grid key={e.label} templateColumns="22% minmax(0,1fr) 9%" alignItems="center" gap="2cqmin">
              <Small size={2.6} color="rgba(255,255,255,0.75)">{e.short}</Small>
              <Box position="relative" h="2.2cqmin">
                <Box position="absolute" left="50%" top="-0.6cqmin" bottom="-0.6cqmin" w="1px" bg="whiteAlpha.300" />
                <Box position="absolute" top={0} bottom={0} borderRadius="full" bg={up ? GOOD : BAD} opacity={0.9}
                  style={up ? { left: "50%", width: `${w}%` } : { right: "50%", width: `${w}%` }} />
              </Box>
              <Text fontSize="2.6cqmin" fontWeight="black" color={up ? GOOD : BAD} textAlign="right" fontVariantNumeric="tabular-nums">{sign(e.r, 2)}</Text>
            </Grid>
          );
        })}
      </Flex>
      <Flex justify="space-between" mt="1.6cqmin" px="24%">
        <Small size={2.3} color={BAD}>← Less of it wins</Small>
        <Small size={2.3} color={GOOD}>More of it wins →</Small>
      </Flex>
    </Shell>
  );
};

// ── 2 · League Map — logos on the two levers that win, better = up-right ────
const LeagueMap = ({ c }) => {
  const { points, x, y, league } = c.viz;
  const span = (vals) => {
    const lo = Math.min(...vals), hi = Math.max(...vals), m = (hi - lo) * 0.1 || 0.01;
    return [lo - m, hi + m];
  };
  const [x0, x1] = span(points.map((p) => p.x));
  const [y0, y1] = span(points.map((p) => p.y));
  const fx = (v) => { const t = (v - x0) / (x1 - x0); return (x.better === "low" ? 1 - t : t) * 100; };
  const fy = (v) => { const t = (v - y0) / (y1 - y0); return (y.better === "low" ? t : 1 - t) * 100; };
  const cx = fx(league.x), cy = fy(league.y);
  return (
    <Shell c={c} scale={0.62}>
      <Box position="relative" flex={1} minH={0} borderLeft="1px solid" borderBottom="1px solid" borderColor="whiteAlpha.200">
        <Box position="absolute" left={`${cx}%`} right={0} top={0} h={`${cy}%`} bg="rgba(34,197,94,0.07)" />
        <Box position="absolute" left={0} w={`${cx}%`} bottom={0} top={`${cy}%`} bg="rgba(245,158,11,0.06)" />
        <Box position="absolute" left={`${cx}%`} top={0} bottom={0} borderLeft="1px dashed" borderColor="rgba(168,85,247,0.6)" />
        <Box position="absolute" top={`${cy}%`} left={0} right={0} borderTop="1px dashed" borderColor="rgba(168,85,247,0.6)" />
        <Small position="absolute" top="1.5cqmin" right="2cqmin" size={2.3} color={GOOD}>Better on both</Small>
        <Small position="absolute" bottom="1.5cqmin" left="2cqmin" size={2.3} color={BAD}>Worse on both</Small>
        {points.map((p) => (
          <Logo key={p.team_id} id={p.team_id} size={7.5} position="absolute" left={`${fx(p.x)}%`} top={`${fy(p.y)}%`} transform="translate(-50%,-50%)"
            filter="drop-shadow(0 0.4cqmin 0.8cqmin rgba(0,0,0,0.8))" />
        ))}
      </Box>
      <Flex justify="space-between" mt="1.4cqmin">
        <Small size={2.4}>{x.label} →</Small>
        <Small size={2.4}>↑ {y.label}</Small>
      </Flex>
    </Shell>
  );
};

// ── 3 · Metric of the Week — every team on one line, leader called out ──────
const MetricOfWeek = ({ c }) => {
  const e = c.viz.entries;
  const lo = Math.min(...e.map((x) => x.value)), hi = Math.max(...e.map((x) => x.value));
  const pos = (v) => 4 + ((v - lo) / (hi - lo || 1)) * 92;
  return (
    <Shell c={c} scale={0.9} mark={c.stat.team_id}>
      <Flex align="flex-end" gap="3cqmin">
        <Logo id={c.stat.team_id} size={14} />
        <Box>
          <Big size={13}>{c.stat.display}</Big>
          <Small mt="1cqmin">{teamShort(c.stat.team_id)} · {c.stat.label}</Small>
        </Box>
      </Flex>
      <Box position="relative" flex={1} minH="18cqmin" mt="2cqmin">
        <Box position="absolute" left="4%" right="4%" top="50%" h="0.5cqmin" bg={FAINT} borderRadius="full" />
        <Box position="absolute" top="20%" bottom="20%" w="0.5cqmin" bg={ACCENT} style={{ left: `${pos(c.viz.league)}%` }} />
        <Small position="absolute" top="2%" size={2.6} color={ACCENT} style={{ left: `${pos(c.viz.league)}%` }} transform="translateX(-50%)">Lg {c.viz.league.toFixed(1)}</Small>
        {e.map((x, i) => (
          <Logo key={x.team_id} id={x.team_id} size={i === 0 ? 9 : 6.5} position="absolute" style={{ left: `${pos(x.value)}%`, top: i % 2 ? "64%" : "36%" }}
            transform="translate(-50%,-50%)" opacity={i === 0 ? 1 : 0.85} filter="drop-shadow(0 0.4cqmin 0.8cqmin rgba(0,0,0,0.8))" />
        ))}
        <Small position="absolute" bottom={0} left="4%" size={2.4}>{lo.toFixed(1)}</Small>
        <Small position="absolute" bottom={0} right="4%" size={2.4}>{hi.toFixed(1)}</Small>
      </Box>
    </Shell>
  );
};

// ── 4 / 5 · Doesn't Add Up — record rank vs rating rank on one 1–18 track ───
const RankGap = ({ c }) => {
  const { record_rank: a, rating_rank: b, total } = c.viz;
  const id = c.stat.team_id;
  const color = vivid(id);
  const x = (rank) => 6 + ((rank - 1) / (total - 1)) * 88;
  // record_ahead: the record outruns the rating; rating_ahead: the reverse.
  const lead = c.archetype !== "record_ahead";
  return (
    <Shell c={c} accent={color} mark={id}>
      <Flex align="center" gap="3cqmin">
        <Logo id={id} size={16} />
        <Box>
          <Big size={15} color={lead ? GOOD : BAD}>{c.stat.display}</Big>
          <Small mt="1cqmin">{c.stat.label}</Small>
        </Box>
      </Flex>
      <Flex direction="column" flex={1} justify="center" gap="5cqmin" mt="2cqmin">
        {[["By record", a, "white"], ["By rating", b, color]].map(([label, rank, tone]) => (
          <Box key={label}>
            <Flex justify="space-between" mb="1.4cqmin"><Small size={3}>{label}</Small><Small size={3} color="white">#{rank}</Small></Flex>
            <Box position="relative" h="1.2cqmin" bg={FAINT} borderRadius="full">
              <Box position="absolute" top="50%" w="4.4cqmin" h="4.4cqmin" borderRadius="full" bg={tone} border="0.6cqmin solid #141416"
                transform="translate(-50%,-50%)" style={{ left: `${x(rank)}%` }} />
            </Box>
          </Box>
        ))}
        <Flex justify="space-between"><Small size={2.6}>#1</Small><Small size={2.6}>#{total}</Small></Flex>
      </Flex>
    </Shell>
  );
};

// ── 6 · Doesn't Matter — the weakest lever beside the strongest ─────────────
const DeadMetric = ({ c }) => (
  <Shell c={c}>
    <Big size={17} color="rgba(255,255,255,0.45)">{c.stat.display}</Big>
    <Small mt="1.2cqmin">{c.stat.label}</Small>
    <Flex direction="column" flex={1} justify="center" gap="5cqmin">
      {c.viz.rows.map((r) => (
        <Box key={r.label}>
          <Flex justify="space-between" mb="1.4cqmin" gap="2cqmin">
            <Small size={3} color={r.tone === "accent" ? "white" : DIM}>{r.label}</Small>
            <Small size={3} color={r.tone === "accent" ? ACCENT : DIM}>{sign(r.r, 2)}</Small>
          </Flex>
          <Box h="2.6cqmin" bg={FAINT} borderRadius="full" overflow="hidden">
            <Box h="full" borderRadius="full" bg={r.tone === "accent" ? ACCENT : "rgba(255,255,255,0.35)"} style={{ width: `${Math.max(2, Math.abs(r.r) * 100)}%` }} />
          </Box>
        </Box>
      ))}
    </Flex>
  </Shell>
);

// ── 7 · Statistical Twins — a butterfly of percentiles, one team each side ──
const TwinBars = ({ c }) => {
  const { a, b, axes } = c.viz;
  const ca = vivid(a), cb = vivid(b);
  return (
    <Shell c={c} scale={0.62}>
      <Flex align="center" justify="space-between" mb="2cqmin">
        <Flex align="center" gap="2cqmin"><Logo id={a} size={10} /><Small size={3.6} color="white">{teamShort(a)}</Small></Flex>
        <Flex direction="column" align="center"><Big size={9}>{c.stat.display}</Big><Small size={2.4}>{c.stat.label}</Small></Flex>
        <Flex align="center" gap="2cqmin"><Small size={3.6} color="white">{teamShort(b)}</Small><Logo id={b} size={10} /></Flex>
      </Flex>
      <Flex direction="column" flex={1} minH={0} justify="space-between">
        {axes.map((x) => (
          <Grid key={x.label} templateColumns="minmax(0,1fr) 18% minmax(0,1fr)" alignItems="center" gap="1.6cqmin">
            <Flex justify="flex-end" align="center" gap="1cqmin">
              <Text fontSize="2.4cqmin" fontWeight="black" color="white" fontVariantNumeric="tabular-nums">{x.a}</Text>
              <Box h="2.2cqmin" borderRadius="full" bg={ca} style={{ width: `${Math.max(2, x.a * 0.8)}%` }} />
            </Flex>
            <Small size={2.3} textAlign="center" color="rgba(255,255,255,0.7)">{x.label}</Small>
            <Flex align="center" gap="1cqmin">
              <Box h="2.2cqmin" borderRadius="full" bg={cb} style={{ width: `${Math.max(2, x.b * 0.8)}%` }} />
              <Text fontSize="2.4cqmin" fontWeight="black" color="white" fontVariantNumeric="tabular-nums">{x.b}</Text>
            </Flex>
          </Grid>
        ))}
      </Flex>
    </Shell>
  );
};

// ── 8 · Team Fingerprint — the radar, in the team's colour ──────────────────
const Fingerprint = ({ c }) => {
  const { team_id: id, axes } = c.viz;
  const color = vivid(id);
  const n = axes.length;
  const pt = (i, v) => {
    const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (v / 100) * 40;
    return [50 + r * Math.cos(ang), 50 + r * Math.sin(ang)];
  };
  const poly = axes.map((x, i) => pt(i, x.value).join(",")).join(" ");
  return (
    <Shell c={c} accent={color} mark={id}>
      <Flex align="center" gap="3cqmin">
        <Logo id={id} size={14} />
        <Box><Big size={13}>{c.stat.display}</Big><Small mt="1cqmin">{c.stat.label}</Small></Box>
      </Flex>
      <Box flex={1} minH={0} mt="2cqmin">
        <svg viewBox="-12 -6 124 112" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          {[25, 50, 75, 100].map((r) => (
            <polygon key={r} points={axes.map((_, i) => pt(i, r).join(",")).join(" ")} fill="none" stroke={r === 50 ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.1)"} strokeWidth="0.4" strokeDasharray={r === 50 ? "1.5 1.5" : undefined} />
          ))}
          <polygon points={poly} fill={color} fillOpacity="0.32" stroke={color} strokeWidth="1" />
          {axes.map((x, i) => {
            const [lx, ly] = pt(i, 122);
            return <text key={x.label} x={lx} y={ly} fontSize="4.2" fontWeight="900" fill="rgba(255,255,255,0.65)" textAnchor="middle" dominantBaseline="middle">{x.label}</text>;
          })}
        </svg>
      </Box>
    </Shell>
  );
};

// ── 9 · Production Leader — the face, then the chasing pack ─────────────────
const ProductionLeader = ({ c }) => {
  const { person, entries } = c.viz;
  const max = Math.max(...entries.map((e) => e.value), 1);
  const color = vivid(person.team_id);
  return (
    <Shell c={c} accent={color} mark={person.team_id}>
      <Flex align="center" gap="3cqmin">
        <Box w="18cqmin" h="18cqmin" borderRadius="lg" overflow="hidden" bg="whiteAlpha.100" border="0.5cqmin solid" borderColor={color} flexShrink={0}>
          {person.image_url ? <Image src={person.image_url} alt="" w="full" h="full" objectFit="cover" objectPosition="top center" /> : null}
        </Box>
        <Box minW={0}>
          <Big size={13}>{c.stat.display}</Big>
          <Small mt="1cqmin">{person.position} · {teamShort(person.team_id)}</Small>
        </Box>
      </Flex>
      <Flex direction="column" flex={1} justify="center" gap="1.6cqmin" mt="2cqmin">
        {entries.map((e) => (
          <Grid key={e.label} templateColumns="24% minmax(0,1fr) 13%" alignItems="center" gap="2cqmin">
            <Small size={2.8} color={e.is_subject ? "white" : DIM}>{e.label}</Small>
            <Box h="2.4cqmin" bg={FAINT} borderRadius="full" overflow="hidden">
              <Box h="full" borderRadius="full" bg={vivid(e.team_id)} opacity={e.is_subject ? 1 : 0.55} style={{ width: `${(e.value / max) * 100}%` }} />
            </Box>
            <Text fontSize="2.8cqmin" fontWeight="black" color="white" textAlign="right" fontVariantNumeric="tabular-nums">{e.value.toFixed(1)}</Text>
          </Grid>
        ))}
      </Flex>
    </Shell>
  );
};

// ── 10 · SWAC vs MEAC — two numbers, the gap between them ───────────────────
const ConferenceSplit = ({ c }) => {
  const [s, m] = c.viz.groups;
  const fmt = (v) => (c.viz.unit === "pct" ? pct(v) : v.toFixed(2));
  const best = (c.viz.better === "high") === (s.value > m.value) ? "SWAC" : "MEAC";
  return (
    <Shell c={c}>
      <Flex flex={1} align="center" justify="space-around">
        {[s, m].map((g) => (
          <Flex key={g.label} direction="column" align="center" gap="1.4cqmin">
            <Small size={3.4} color={g.label === best ? GOOD : DIM}>{g.label}</Small>
            <Big size={13} color={g.label === best ? "white" : "rgba(255,255,255,0.55)"}>{fmt(g.value)}</Big>
            <Small size={2.6}>{g.teams} teams</Small>
          </Flex>
        ))}
      </Flex>
      <Flex align="center" justify="center" gap="2cqmin">
        <Big size={8} color={ACCENT}>{c.stat.display}</Big>
        <Small>{c.stat.label}</Small>
      </Flex>
    </Shell>
  );
};

// ── 11 · Parity Index — one column a season, this one lit ───────────────────
const Parity = ({ c }) => {
  const e = c.viz.entries.filter((x) => Number.isFinite(x.value));
  const lo = Math.min(...e.map((x) => x.value)) * 0.85, hi = Math.max(...e.map((x) => x.value));
  return (
    <Shell c={c}>
      <Flex align="flex-end" gap="2.4cqmin">
        <Big size={13}>{c.stat.display}</Big>
        <Small mb="0.8cqmin">{c.stat.label}</Small>
      </Flex>
      <Flex flex={1} minH={0} align="flex-end" gap="2cqmin" mt="3cqmin">
        {e.map((x) => (
          <Flex key={x.label} direction="column" align="center" flex={1} h="full" justify="flex-end" gap="1cqmin">
            <Box w="full" borderRadius="sm" bg={x.highlight ? ACCENT : "rgba(255,255,255,0.18)"} style={{ height: `${10 + ((x.value - lo) / (hi - lo || 1)) * 80}%` }} />
            <Small size={2.5} color={x.highlight ? "white" : DIM}>{x.label.slice(2)}</Small>
          </Flex>
        ))}
      </Flex>
    </Shell>
  );
};

// ── Registry + slots ─────────────────────────────────────────────────────────

export const STATS_HUB_CARD_VIEWS = {
  correlation_bars: { View: WinLevers, cols: 2, rows: 2 },
  scatter_map: { View: LeagueMap, cols: 2, rows: 2 },
  distribution: { View: MetricOfWeek, cols: 2, rows: 1 },
  rank_gap: { View: RankGap, cols: 1, rows: 1 },
  dumbbell: { View: DeadMetric, cols: 1, rows: 1 },
  twin_bars: { View: TwinBars, cols: 2, rows: 2 },
  radar: { View: Fingerprint, cols: 1, rows: 2 },
  rank_bars: { View: ProductionLeader, cols: 1, rows: 1 },
  conference_split: { View: ConferenceSplit, cols: 1, rows: 1 },
  season_trend: { View: Parity, cols: 1, rows: 1 },
};

export const StatsHubContextCard = ({ card }) => {
  const entry = STATS_HUB_CARD_VIEWS[card?.viz?.kind];
  return entry ? <entry.View c={card} /> : null;
};

/** The hub slot for a card: { cols, rows } off its viz kind. */
export const statsHubSlotFor = (card) => {
  const e = STATS_HUB_CARD_VIEWS[card?.viz?.kind];
  return { cols: e?.cols ?? 1, rows: e?.rows ?? 1 };
};

export default StatsHubContextCard;
