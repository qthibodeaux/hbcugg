import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { Star, Flame, TrendingDown } from "lucide-react";

/**
 * PlayerStatsOverview
 *
 * PHILOSOPHY:
 *   Purpose: the Overview view of the Stats tab - what he produced, how
 *     efficiently, how much of the offense ran through him, and what his
 *     recent body of work looks like.
 *   Grid slot: rendered inside PlayerStatsTab's 4x4 slot (no Slot of its own)
 *
 * ONE DESIGN SYSTEM - every section is assembled from the same five parts,
 * so the page reads as a single designed object rather than a stack of
 * separately-styled modules:
 *
 *   Panel       the only container. Same bg, border, radius, padding.
 *               Tier 1 (snapshot) adds a gradient wash + ghost watermark;
 *               nothing else does. That is the only container variation.
 *   SectionHead the only section header. Accent tick + title + why-note.
 *   Track       the only bar. One height, one track color, one radius.
 *               Optional baseline tick handles production bars, centerline
 *               bars and plain fills with a single primitive.
 *   Type        three sizes only - HeroNum / StatNum / StatLabel.
 *   Accent      one resolved color for every fill and tick. Green/red are
 *               reserved exclusively for signed above/below values.
 *
 * DATA (see src/pages/players/md/Player Page Design Doc.md sections 5 and 7):
 *   REAL      total_production, avg_production, par, season_components,
 *             games_played, games[] (total + components), and everything
 *             derived from them - replacement baseline, floor/median/
 *             ceiling, boom/bust, above-replacement, form, best/worst game,
 *             opponent + home/away parsed from game_id.
 *   PERCENTILE  computed live against positionPeers.
 *   MOCK      every counting stat and the share/role block. Flagged inline;
 *             none of it exists in any data source yet.
 */

// ── design tokens ───────────────────────────────────────────────
const POSITIVE = "#4ADE80";
const NEGATIVE = "#F87171";
const TRACK_BG = "whiteAlpha.200";
const TRACK_H = "7px";
const PANEL_BG = "whiteAlpha.50";
const PANEL_BORDER = "whiteAlpha.100";
const PANEL_PAD = 2.5;
const SECTION_GAP = 2;
const ROW_GAP = 2;

// Exactly two numeric sizes on the whole page: hero (snapshot only) and
// stat (every other value, no exceptions). Emphasis comes from color, never
// from a one-off size.
const TYPE = {
  hero: "clamp(2.8rem, 6vw, 4.4rem)",
  stat: "clamp(1.4rem, 2.4vw, 1.9rem)",
  title: "0.95rem",
  inline: "0.8rem",
  label: "0.75rem", // hard floor - nothing smaller anywhere in this file
};

// Accent is always a REAL team color - never a hardcoded brand color, per
// AgentDesignBible section 7. The only thing screened out is a color too
// dark to see against the dark surface (some programs use near-black as a
// secondary); light secondaries including white are fine and stay as-is.
// Last resort is neutral white, never another program's color.
const luminance = (hex) => {
  const h = String(hex ?? "").replace("#", "");
  if (h.length !== 6) return null;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const visibleOnDark = (hex) => {
  const l = luminance(hex);
  return l != null && l > 0.16;
};
export const pickAccent = (primary, secondary) => {
  if (visibleOnDark(secondary)) return secondary;
  if (visibleOnDark(primary)) return primary;
  return "#FFFFFF";
};

// ── data helpers ────────────────────────────────────────────────
const num = (v, fallback = 0) => (Number.isFinite(Number(v)) ? Number(v) : fallback);
const round1 = (v) => Math.round(num(v) * 10) / 10;

export const percentileOf = (values, value) => {
  const list = values.filter((v) => Number.isFinite(v));
  if (!list.length) return null;
  const below = list.filter((v) => v < value).length;
  return Math.round((below / list.length) * 100);
};

const quantile = (sorted, q) => {
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base + 1] !== undefined ? sorted[base] + rest * (sorted[base + 1] - sorted[base]) : sorted[base];
};

// game_id is AWAY+HOME+DDMMYYYY. Match the player's own short code against
// either end to recover opponent + home/away without a schedule join.
const parseGame = (gameId, myCode) => {
  const id = String(gameId ?? "");
  if (id.length < 9) return { opp: "—", away: false, date: "" };
  const teams = id.slice(0, -8);
  const dd = id.slice(-8, -6);
  const mm = id.slice(-6, -4);
  const code = String(myCode ?? "").toUpperCase();
  let opp = teams;
  let away = false;
  if (code && teams.startsWith(code)) {
    away = true;
    opp = teams.slice(code.length);
  } else if (code && teams.endsWith(code)) {
    away = false;
    opp = teams.slice(0, teams.length - code.length);
  }
  const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return { opp: opp || "—", away, date: `${MONTHS[Number(mm)] ?? ""} ${Number(dd) || ""}`.trim() };
};

const BLOCK_LABELS = {
  passing_production: "Passing",
  rushing_production: "Rushing",
  receiving_production: "Receiving",
  hit_production: "Havoc",
  hawk_production: "Coverage",
  scrum_production: "Trenches",
};

// MOCK counting stats. No counting stat exists in any data source yet, so
// these are scaled off the player's REAL per-block production so magnitudes
// stay plausible instead of being flat constants for every player.
const mockCountingStats = (blockKey, production) => {
  const p = Math.max(0, num(production));
  if (blockKey === "passing_production") {
    const att = Math.round(p * 2.15 + 60);
    return [
      { label: "CMP/ATT", value: `${Math.round(att * 0.628)}/${att}` },
      { label: "CMP%", value: "62.8" },
      { label: "YDS", value: Math.round(p * 17.5).toLocaleString() },
      { label: "TD", value: Math.round(p * 0.135) },
      { label: "INT", value: Math.max(1, Math.round(p * 0.05)) },
      { label: "Y/A", value: "8.1" },
      { label: "LONG", value: 75 },
      { label: "1ST", value: Math.round(p * 0.8) },
    ];
  }
  if (blockKey === "rushing_production") {
    return [
      { label: "ATT", value: Math.round(p * 2.05 + 8) },
      { label: "YDS", value: Math.round(p * 16.5).toLocaleString() },
      { label: "YPC", value: "8.0" },
      { label: "TD", value: Math.max(1, Math.round(p * 0.18)) },
      { label: "LONG", value: 45 },
      { label: "1ST", value: Math.round(p * 1.02) },
    ];
  }
  if (blockKey === "receiving_production") {
    return [
      { label: "REC", value: Math.round(p * 0.75 + 4) },
      { label: "YDS", value: Math.round(p * 14).toLocaleString() },
      { label: "TD", value: Math.max(0, Math.round(p * 0.12)) },
      { label: "YPR", value: "13.4" },
      { label: "LONG", value: 52 },
    ];
  }
  return [
    { label: "TKL", value: Math.round(p * 1.4 + 6) },
    { label: "TFL", value: Math.max(1, Math.round(p * 0.22)) },
    { label: "SACKS", value: Math.max(0, Math.round(p * 0.1)) },
    { label: "PD", value: Math.max(0, Math.round(p * 0.16)) },
  ];
};

// Exported so other views can derive from the exact same real numbers —
// percentiles, replacement split, range stats, form — instead of a second,
// drifting copy of this math.
export const buildModel = (player, positionPeers, teamMeta) => {
  const games = Array.isArray(player?.games) ? player.games : [];
  const totalProduction = num(player?.total_production);
  const par = num(player?.par);
  const gamesPlayed = num(player?.games_played, games.length) || games.length || 1;
  const replacement = round1(totalProduction - par);
  const components = player?.season_components ?? {};
  const myCode = String(teamMeta?.shortName ?? "").toUpperCase();

  const rows = games
    .map((g) => ({ ...parseGame(g.game_id, myCode), total: round1(g.total) }))
    .filter((g) => Number.isFinite(g.total));

  const totals = rows.map((g) => g.total).slice().sort((a, b) => a - b);
  const mean = totals.length ? totals.reduce((a, b) => a + b, 0) / totals.length : 0;
  const variance = totals.length ? totals.reduce((a, v) => a + (v - mean) ** 2, 0) / totals.length : 0;
  const perGameReplacement = replacement / Math.max(1, gamesPlayed);
  const avgOf = (arr) => (arr.length ? arr.reduce((a, g) => a + g.total, 0) / arr.length : 0);

  const blocks = Object.keys(components)
    .filter((k) => Math.abs(num(components[k])) > 0.001)
    .map((k) => ({
      key: k,
      label: BLOCK_LABELS[k] ?? k.replace(/_production$/, ""),
      production: round1(components[k]),
      stats: mockCountingStats(k, components[k]),
    }))
    .sort((a, b) => b.production - a.production)
    // Replacement is a position-scoped SEASON constant and does not
    // decompose per component (verified across all 1,054 enriched records).
    // Split it by each block's share of production so every block can still
    // show a baseline tick - an approximation, not a backend field.
    .map((b) => {
      const share = totalProduction ? b.production / totalProduction : 0;
      const blockReplacement = round1(replacement * share);
      return { ...b, replacement: blockReplacement, par: round1(b.production - blockReplacement) };
    });

  return {
    totalProduction: round1(totalProduction),
    par: round1(par),
    parPerGame: round1(par / Math.max(1, gamesPlayed)),
    avgProduction: round1(player?.avg_production ?? mean),
    replacement,
    gamesPlayed,
    blocks,
    rows,
    parPercentile: percentileOf(positionPeers.map((p) => num(p?.par, NaN)), par),
    prodPercentile: percentileOf(positionPeers.map((p) => num(p?.total_production, NaN)), totalProduction),
    range: {
      min: totals[0] ?? 0,
      max: totals[totals.length - 1] ?? 0,
      floor: round1(quantile(totals, 0.25)),
      median: round1(quantile(totals, 0.5)),
      ceiling: round1(quantile(totals, 0.75)),
      stddev: round1(Math.sqrt(variance)),
      boom: rows.filter((g) => g.total >= mean * 1.5).length,
      bust: rows.filter((g) => g.total <= mean * 0.5).length,
      aboveReplacement: rows.filter((g) => g.total > perGameReplacement).length,
    },
    form: {
      last3: round1(avgOf(rows.slice(-3))),
      last5: round1(avgOf(rows.slice(-5))),
      delta: round1(avgOf(rows.slice(-3)) - mean),
      pct: mean ? Math.round(((avgOf(rows.slice(-3)) - mean) / mean) * 100) : 0,
      rolling: rows.map((_, i, arr) => {
        const w = arr.slice(Math.max(0, i - 2), i + 1);
        return round1(w.reduce((a, g) => a + g.total, 0) / w.length);
      }),
    },
    best: rows.length ? rows.reduce((a, b) => (b.total > a.total ? b : a)) : null,
    worst: rows.length ? rows.reduce((a, b) => (b.total < a.total ? b : a)) : null,
  };
};

// ═══ THE FIVE SHARED PARTS ══════════════════════════════════════

const StatLabel = ({ children, ...rest }) => (
  <Text
    fontSize={TYPE.label}
    fontWeight="900"
    color="whiteAlpha.600"
    textTransform="uppercase"
    letterSpacing="0.07em"
    lineHeight={1.2}
    {...rest}
  >
    {children}
  </Text>
);

const StatNum = ({ children, color = "white" }) => (
  <Text fontSize={TYPE.stat} fontWeight="900" fontStyle="italic" color={color} lineHeight={1} letterSpacing="-0.035em" whiteSpace="nowrap">
    {children}
  </Text>
);

const HeroNum = ({ children, color = "white" }) => (
  <Text
    fontSize={TYPE.hero}
    fontWeight="900"
    fontStyle="italic"
    color={color}
    lineHeight={0.82}
    letterSpacing="-0.05em"
    textShadow="0 3px 0 rgba(0,0,0,0.45)"
    whiteSpace="nowrap"
  >
    {children}
  </Text>
);

// The only container. No accent rail - the header tick is the single place
// accent appears on a section, so nothing reads as double-decorated.
const Panel = ({ children, ...rest }) => (
  <Box bg={PANEL_BG} border="1px solid" borderColor={PANEL_BORDER} borderRadius="md" p={PANEL_PAD} {...rest}>
    {children}
  </Box>
);

// The only section header: accent tick + title, nothing else. `dim` fades
// the tick to mark a secondary production block, which is how block
// priority is encoded now that the explanatory labels are gone.
const SectionHead = ({ children, accent, dim, right }) => (
  <Flex align="center" justify="space-between" gap={2} mb={1.5}>
    <Flex align="center" gap={2} minW={0}>
      <Box w="4px" h="0.9rem" bg={dim ? `${accent}66` : accent} borderRadius="sm" flexShrink={0} />
      <Text
        fontSize={TYPE.title}
        fontWeight="900"
        color={dim ? "whiteAlpha.700" : "white"}
        textTransform="uppercase"
        letterSpacing="0.06em"
        lineHeight={1}
        whiteSpace="nowrap"
      >
        {children}
      </Text>
    </Flex>
    {right}
  </Flex>
);

// The only bar. `baseline` turns it into a production bar / centerline bar;
// without it, it is a plain fill. One height, one track, one radius, one
// baseline marker (a downward chevron - carried over from the original
// production-block bar since it reads more clearly than a flat tick).
const Track = ({ value, min = 0, max = 100, baseline, accent }) => {
  const span = max - min || 1;
  const pos = (v) => Math.max(0, Math.min(100, ((v - min) / span) * 100));
  const hasBaseline = Number.isFinite(baseline) && baseline > min;
  const basePos = hasBaseline ? pos(baseline) : 0;
  const valPos = pos(value);
  const above = !hasBaseline || value >= baseline;
  const left = Math.min(basePos, valPos);
  const width = Math.abs(valPos - basePos);

  return (
    <Box position="relative" h={TRACK_H} bg={TRACK_BG} borderRadius="full">
      <Box
        position="absolute"
        left={`${left}%`}
        w={`${width}%`}
        top={0}
        bottom={0}
        bg={above ? accent : NEGATIVE}
        borderRadius="full"
      />
      {hasBaseline && (
        <Box position="absolute" left={`${basePos}%`} top="-6px" transform="translateX(-50%)" lineHeight={0}>
          <svg width="9" height="6" viewBox="0 0 9 6" fill="none">
            <path d="M4.5 6L9 0H0L4.5 6Z" fill="white" fillOpacity="0.9" />
          </svg>
        </Box>
      )}
    </Box>
  );
};

// Label + value + track, the repeating unit used by every metric row.
// `display` is the text shown; `amount` is what the track plots.
const MetricRow = ({ label, display, amount, accent, tone = "white", mb = ROW_GAP, min, max, baseline }) => (
  <Box mb={mb}>
    <Flex justify="space-between" align="baseline" gap={2} mb={1}>
      <StatLabel>{label}</StatLabel>
      <StatNum color={tone}>{display}</StatNum>
    </Flex>
    <Track value={amount} min={min} max={max} baseline={baseline} accent={accent} />
  </Box>
);

// ═══ SECTIONS ═══════════════════════════════════════════════════

// Tier 1 - the only container variation: gradient wash + ghost watermark.
const SnapshotCard = ({ hero, heroLabel, metrics, base, accent }) => (
  <Flex
    position="relative"
    overflow="hidden"
    borderRadius="md"
    bg={`linear-gradient(150deg, ${base}4D 0%, rgba(255,255,255,0.02) 72%)`}
    border="1px solid"
    borderColor={PANEL_BORDER}
    p={PANEL_PAD}
    gap={3}
    align="center"
    h="full"
  >
    <Text
      position="absolute"
      right="-0.4rem"
      bottom="-1.4rem"
      fontSize="clamp(3.6rem, 7.5vw, 6rem)"
      fontWeight="900"
      fontStyle="italic"
      color="whiteAlpha.100"
      lineHeight={0.8}
      letterSpacing="-0.05em"
      pointerEvents="none"
      aria-hidden="true"
    >
      {hero}
    </Text>

    <Box position="relative" zIndex={1} flex="1 1 0" minW={0}>
      <HeroNum>{hero}</HeroNum>
      <StatLabel color={accent} mt={1.5}>{heroLabel}</StatLabel>
    </Box>

    <Box position="relative" zIndex={1} flex="0 0 36%" minW={0}>
      {metrics.map((m, i) => (
        <Box key={m.label} mt={i === 0 ? 0 : ROW_GAP}>
          <StatNum>{m.value}</StatNum>
          <StatLabel mt={0.5} mb={1}>{m.label}</StatLabel>
          <Track value={m.pct} accent={accent} />
        </Box>
      ))}
    </Box>
  </Flex>
);

// One row inside the shared production block panel - blocks are divided by
// a border, not separate cards, so Passing/Rushing/etc. read as one object.
const ProductionBlock = ({ block, scaleMax, accent, isFirst }) => {
  const positive = block.par >= 0;
  return (
    <Box p={PANEL_PAD} borderTop={isFirst ? "none" : "1px solid"} borderColor={PANEL_BORDER}>
      <SectionHead accent={accent} dim={!isFirst}>{block.label}</SectionHead>

      <Flex wrap="wrap" columnGap={5} rowGap={1.5} mb={2}>
        {block.stats.map((s) => (
          <Box key={s.label}>
            <StatLabel color={accent} mb={0.5}>{s.label}</StatLabel>
            <StatNum>{s.value}</StatNum>
          </Box>
        ))}
      </Flex>

      <Flex align="center" gap={3}>
        <StatLabel flexShrink={0} whiteSpace="nowrap">Production</StatLabel>
        <Box flex={1} minW={0}>
          <Track value={block.production} min={0} max={scaleMax} baseline={block.replacement} accent={accent} />
          <Flex justify="space-between" mt={1}>
            <Flex gap={1.5} align="baseline">
              <StatLabel>Baseline</StatLabel>
              <Text fontSize={TYPE.inline} fontWeight="900" fontStyle="italic" color="whiteAlpha.900">
                {block.replacement.toFixed(1)}
              </Text>
            </Flex>
            <Flex gap={1.5} align="baseline">
              <StatLabel>Total</StatLabel>
              <Text fontSize={TYPE.inline} fontWeight="900" fontStyle="italic" color="whiteAlpha.900">
                {block.production.toFixed(1)}
              </Text>
            </Flex>
          </Flex>
        </Box>
        <StatNum color={positive ? POSITIVE : NEGATIVE}>
          {positive ? "+" : ""}{block.par.toFixed(1)}
        </StatNum>
      </Flex>
    </Box>
  );
};

const Sparkline = ({ series, accent }) => {
  if (series.length < 2) return null;
  const max = Math.max(...series);
  const min = Math.min(...series);
  const span = max - min || 1;
  const pts = series.map((v, i) => `${(i / (series.length - 1)) * 100},${30 - ((v - min) / span) * 26}`).join(" ");
  return (
    <Box w="full" h="2.75rem" my={1}>
      <svg viewBox="0 0 100 32" preserveAspectRatio="none" width="100%" height="100%" style={{ display: "block" }}>
        <polyline points={`0,32 ${pts} 100,32`} fill={accent} opacity="0.15" stroke="none" />
        <polyline points={pts} fill="none" stroke={accent} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </Box>
  );
};

// Distribution, not a fill - but it reuses the Track height, color and
// radius so it sits in the same family as every other bar on the page.
const GameRange = ({ range, rows, accent, gamesPlayed }) => {
  const span = range.max - range.min || 1;
  const pos = (v) => ((v - range.min) / span) * 100;

  return (
    <Box>
      <Box position="relative" h={TRACK_H} bg={TRACK_BG} borderRadius="full" mt={3} mb={2}>
        <Box position="absolute" left={`${pos(range.floor)}%`} w={`${pos(range.ceiling) - pos(range.floor)}%`} top={0} bottom={0} bg={accent} borderRadius="full" />
        {rows.map((g, i) => (
          <Box key={`${g.opp}-${i}`} position="absolute" left={`${pos(g.total)}%`} top="-3px" bottom="-3px" w="2px" bg="whiteAlpha.700" transform="translateX(-50%)" />
        ))}
        <Box position="absolute" left={`${pos(range.median)}%`} top="50%" transform="translate(-50%, -50%)" w="13px" h="13px" borderRadius="full" bg={accent} border="3px solid" borderColor="bg.secondary" />
      </Box>
      <Flex justify="space-between" gap={2}>
        {[
          { l: "Floor", v: range.floor },
          { l: "Median", v: range.median },
          { l: "Ceiling", v: range.ceiling },
          { l: "Std Dev", v: range.stddev },
        ].map((x) => (
          <Box key={x.l}>
            <StatNum>{x.v}</StatNum>
            <StatLabel mt={0.5}>{x.l}</StatLabel>
          </Box>
        ))}
      </Flex>
      <Flex gap={4} mt={2} pt={2} borderTop="1px solid" borderColor={PANEL_BORDER}>
        <Flex align="baseline" gap={1.5}>
          <StatNum color={accent}>{range.aboveReplacement}/{gamesPlayed}</StatNum>
          <StatLabel>Above Repl</StatLabel>
        </Flex>
        <Flex align="baseline" gap={1.5}>
          <StatNum color={POSITIVE}>{range.boom}</StatNum>
          <StatLabel>Boom</StatLabel>
        </Flex>
        <Flex align="baseline" gap={1.5}>
          <StatNum color={NEGATIVE}>{range.bust}</StatNum>
          <StatLabel>Bust</StatLabel>
        </Flex>
      </Flex>
    </Box>
  );
};

const MomentRow = ({ icon: Icon, tone, label, game, value }) => (
  <Panel display="flex" alignItems="center" gap={3}>
    <Flex w="1.9rem" h="1.9rem" align="center" justify="center" borderRadius="md" bg={`${tone}26`} flexShrink={0}>
      <Icon size={15} color={tone} />
    </Flex>
    <Box flex={1} minW={0}>
      <StatLabel color={tone}>{label}</StatLabel>
      <Text fontSize={TYPE.title} fontWeight="900" color="white" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
        {game ? `${game.away ? "at" : "vs"} ${game.opp}` : "—"}
        {game?.date ? <Text as="span" fontSize={TYPE.label} fontWeight="800" color="whiteAlpha.500"> · {game.date}</Text> : null}
      </Text>
    </Box>
    <StatNum color={tone}>{value}</StatNum>
  </Panel>
);

// ═══════════════════════════════════════════════════════════════
export const PlayerStatsOverview = ({ player, teamMeta, positionPeers = [], primary, secondary }) => {
  const base = primary ?? teamMeta?.colors?.primary ?? "#4B0082";
  const accent = pickAccent(base, secondary ?? teamMeta?.colors?.secondary);
  const m = buildModel(player, positionPeers, teamMeta);

  if (!m.rows.length && !m.totalProduction) {
    return (
      <Flex align="center" justify="center" minH="12rem">
        <Text fontSize={TYPE.title} fontWeight="900" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.06em">
          No production data for this season
        </Text>
      </Flex>
    );
  }

  const scaleMax = Math.max(...m.blocks.map((b) => b.production), 1) * 1.15;
  const lead = m.blocks[0];

  // MOCK - share/role fields do not exist in any data source yet.
  const role = [
    { label: "Team Production", pct: 71, value: "71%" },
    { label: "Dropback Share", pct: 84, value: "84%" },
    { label: "Snap Share", pct: 91, value: "91%" },
  ];

  return (
    <Flex direction="column" gap={SECTION_GAP}>
      {/* ── SEASON SNAPSHOT ── */}
      <Grid templateColumns={{ base: "1fr", lg: "repeat(3, minmax(0, 1fr))" }} gap={2}>
        <SnapshotCard
          base={base}
          accent={accent}
          hero={m.totalProduction.toFixed(1)}
          heroLabel="Total Production"
          metrics={m.blocks.slice(0, 3).map((b) => ({
            label: `${b.label} Prod`,
            value: b.production.toFixed(1),
            pct: m.totalProduction ? (b.production / m.totalProduction) * 100 : 0,
          }))}
        />
        <SnapshotCard
          base={base}
          accent={accent}
          hero={m.parPerGame.toFixed(1)}
          heroLabel="PAR per game"
          metrics={[
            { label: "Season PAR", value: m.par.toFixed(1), pct: m.parPercentile ?? 50 },
            { label: "Replacement", value: m.replacement.toFixed(1), pct: m.totalProduction ? (m.replacement / m.totalProduction) * 100 : 0 },
            { label: "Prod / Game", value: m.avgProduction.toFixed(1), pct: m.prodPercentile ?? 50 },
          ]}
        />
        <SnapshotCard base={base} accent={accent} hero={`${role[0].pct}%`} heroLabel="of team production" metrics={role.slice(1)} />
      </Grid>

      {/* ── PRODUCTION BLOCKS ── */}
      <Box bg={PANEL_BG} border="1px solid" borderColor={PANEL_BORDER} borderRadius="md" overflow="hidden">
        {m.blocks.map((b, i) => (
          <ProductionBlock key={b.key} block={b} scaleMax={scaleMax} accent={accent} isFirst={i === 0} />
        ))}
      </Box>

      {/* ── PERFORMANCE PROFILE + ROLE ── */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={SECTION_GAP}>
        <Panel>
          <SectionHead accent={accent}>Performance Profile</SectionHead>
          <MetricRow
            label="PAR / Game"
            display={`${m.parPerGame >= 0 ? "+" : ""}${m.parPerGame.toFixed(1)}`}
            amount={m.parPerGame}
            accent={accent}
            min={Math.min(-8, m.parPerGame * 1.2)}
            max={Math.max(24, m.parPerGame * 1.25)}
            baseline={0}
          />
          <MetricRow
            label="Production / Game"
            display={m.avgProduction.toFixed(1)}
            amount={m.avgProduction}
            accent={accent}
            min={0}
            max={Math.max(30, m.avgProduction * 1.3)}
            baseline={m.replacement / Math.max(1, m.gamesPlayed)}
          />
          {lead && (
            <MetricRow
              label={`${lead.label} Production`}
              display={lead.production.toFixed(1)}
              amount={lead.production}
              accent={accent}
              min={0}
              max={scaleMax}
              baseline={lead.replacement}
              mb={0}
            />
          )}
        </Panel>

        <Panel>
          <SectionHead accent={accent}>Role</SectionHead>
          {role.map((r, i) => (
            <MetricRow
              key={r.label}
              label={r.label}
              display={r.value}
              amount={r.pct}
              accent={accent}
              min={0}
              max={100}
              mb={i === role.length - 1 ? 0 : ROW_GAP}
            />
          ))}
        </Panel>
      </Grid>

      {/* ── FORM + GAME RANGE ── */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={SECTION_GAP}>
        <Panel>
          <SectionHead
            accent={accent}
            right={<StatNum color={m.form.delta >= 0 ? POSITIVE : NEGATIVE}>{m.form.delta >= 0 ? "+" : ""}{m.form.pct}%</StatNum>}
          >
            Form
          </SectionHead>
          <Flex gap={5}>
            <Box>
              <StatNum>{m.form.last3.toFixed(1)}</StatNum>
              <StatLabel mt={0.5}>Last 3 PAR</StatLabel>
            </Box>
            <Box>
              <StatNum>{m.form.last5.toFixed(1)}</StatNum>
              <StatLabel mt={0.5}>Last 5 PAR</StatLabel>
            </Box>
          </Flex>
          <Sparkline series={m.form.rolling} accent={accent} />
          <Flex justify="space-between" gap={1}>
            {m.rows.map((g, i) => (
              <StatLabel key={`${g.opp}-${i}`} color="whiteAlpha.400">{g.opp}</StatLabel>
            ))}
          </Flex>
        </Panel>

        <Panel>
          <SectionHead accent={accent}>Game Range</SectionHead>
          <GameRange range={m.range} rows={m.rows} accent={accent} gamesPlayed={m.gamesPlayed} />
        </Panel>
      </Grid>

      {/* ── SIGNATURE MOMENTS ── */}
      <Box>
        <SectionHead accent={accent}>Signature Moments</SectionHead>
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, minmax(0, 1fr))" }} gap={2}>
          <MomentRow icon={Star} tone={POSITIVE} label="Best Game" game={m.best} value={m.best ? `${m.best.total.toFixed(1)}` : "—"} />
          <MomentRow icon={TrendingDown} tone={NEGATIVE} label="Worst Game" game={m.worst} value={m.worst ? `${m.worst.total.toFixed(1)}` : "—"} />
          <MomentRow icon={Flame} tone={accent} label="Most Recent" game={m.rows[m.rows.length - 1]} value={m.rows.length ? `${m.rows[m.rows.length - 1].total.toFixed(1)}` : "—"} />
        </Grid>
      </Box>
    </Flex>
  );
};

export default PlayerStatsOverview;
