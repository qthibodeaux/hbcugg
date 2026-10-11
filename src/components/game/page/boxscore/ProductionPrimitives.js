import { useMemo, useRef, useState } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { lookupPlayerProfile, resolveImages, splitDisplayName } from "../../../../utils/headshots";
import { productionEntries } from "../../../../utils/gameHelpers";
import { PRODUCTION_NEGATIVE, gameProductionBounds, productionScale } from "../../../../utils/productionBars";
import { getTeamLogoSrc } from "../utils/teamHelpers";
import useMountEffect from "../../../../hooks/useMountEffect";
import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";

// ─────────────────────────────────────────────────────────────────────────────
// Shared chrome for the "clean" production panels (passing, rushing, …).
// Extracted so the groups can't drift into subtly different tables and headers —
// one eyebrow, one table, one player spotlight, and every panel reads as one page.
// ─────────────────────────────────────────────────────────────────────────────

export const pct = (n) => (n == null ? "—" : `${(n * 100).toFixed(0)}%`);
export const rate = (n) => (n == null ? "—" : n.toFixed(1));
export const num = (n) => (n == null ? "—" : String(n));

/** "Watson,Keely" → "Watson". */
export const lastName = (raw) => splitDisplayName(raw)[1];

/**
 * Production scores by player name — the total plus its component breakdown.
 * `production_scores` keys players by PERS_ id while the box score keys them by
 * name, so name is the only join available (99% match on 2025).
 */
export const productionIndex = (productionRows) => {
  const map = new Map();
  productionEntries(productionRows).forEach((r) => {
    const entry = { total: r.production_total, components: r.components ?? {} };
    if (r.name != null) map.set(r.name, entry);
    // 2026 rows carry the PERS_ id on both sides, so the exact join is available too.
    if (r.player_key != null) map.set(r.player_key, entry);
  });
  return map;
};

/** The production entry for a roster row — by id when the row has one, else by name. */
export const productionOf = (index, row) => (row?.key != null ? index.get(row.key) : null) ?? index.get(row?.name) ?? null;

/**
 * Colour a comparative cell against the league: green above the average, red
 * below, deeper the further out — scaled to the league's own spread (avg→max on
 * the good side, avg→min on the bad). `league` is one entry of
 * `shared/league_avg_{season}.keys`. Null when there is nothing to compare to.
 */
// `strength` lifts the tint for print (the export posters pass PRINT_SHADE).
export const PRINT_SHADE = { base: 0.16, gain: 0.5 };

export const shadeVsLeague = (value, league, { lowerIsBetter = false, strength = { base: 0.12, gain: 0.45 } } = {}) => {
  if (typeof value !== "number" || !Number.isFinite(value) || typeof league?.avg !== "number") return null;
  const dev = lowerIsBetter ? league.avg - value : value - league.avg;
  const up = typeof league.max === "number" ? league.max - league.avg : 0;
  const down = typeof league.min === "number" ? league.avg - league.min : 0;
  const span = dev >= 0 ? (lowerIsBetter ? down : up) : (lowerIsBetter ? up : down);
  const t = span > 0 ? Math.min(1, Math.abs(dev) / span) : 0;
  if (t < 0.04) return null;
  const alpha = (strength.base + strength.gain * t).toFixed(2);
  return dev >= 0 ? `rgba(34,197,94,${alpha})` : `rgba(239,68,68,${alpha})`;
};

const PAR_NEGATIVE = PRODUCTION_NEGATIVE;

// The three PAR axes, exactly as the stat card's legend pairs them: an offensive
// meaning and a defensive one sharing a track. A player is only ever one side of
// a pair — offence ships {passing|receiving, rushing}, defence ships {hit, hawk,
// scrum} — so summing both sides of an axis can't double-count anybody.
//
// Every value below is read straight off `components`. Nothing here is invented:
// offensive turnover impact has no component on any player in any export, so an
// offensive bar simply carries two segments where a defender carries three, and
// the gap is filed as a backend ask rather than mocked in.
const PAR_AXES = [
  { key: "pass_hit", label: "Passing/Hit", keys: ["passing_production", "receiving_production", "hit_production"] },
  { key: "rush_hawk", label: "Rushing/Hawk", keys: ["rushing_production", "hawk_production"] },
  { key: "turnover_scrum", label: "Turnover/Scrum", keys: ["scrum_production"] },
];

// One accent, three intensities — the segments are tiers of the same team colour
// rather than three unrelated hues, so the bar still reads as one player's score.
const SEGMENT_ALPHA = [1, 0.62, 0.34];

const parSegments = (entry) => {
  const components = entry?.components ?? {};
  return PAR_AXES.map((axis, tier) => ({
    key: axis.key,
    label: axis.label,
    tier,
    value: axis.keys.reduce((sum, k) => sum + (typeof components[k] === "number" ? components[k] : 0), 0),
  })).filter((s) => s.value !== 0);
};

const Segment = ({ seg, color }) => (
  <Box flex={`${Math.abs(seg.value)} 0 0`} bg={withAlpha(color, SEGMENT_ALPHA[seg.tier])} title={`${seg.label} ${seg.value.toFixed(2)}`} />
);

/**
 * PAR bar — the score, then a stacked track drawn against the domain its whole
 * table shares. Positive segments stack rightward from zero, negative ones
 * leftward, so a player who was a net drag reads as a bar on the wrong side of
 * the line rather than a short one. Colour marks sign and nothing else
 * (AgentDesignBible §6b): red is only ever a negative.
 */
export const ProductionBar = ({ total, segments, scale, accent }) => {
  if (total == null) return <Box h="0.375rem" />;
  const pos = segments.filter((s) => s.value > 0);
  const neg = segments.filter((s) => s.value < 0);
  const extent = (list) => list.reduce((sum, s) => sum + Math.abs(s.value), 0);
  const posWidth = (extent(pos) / scale.span) * 100;
  const negWidth = (extent(neg) / scale.span) * 100;

  return (
    <Flex align="center" gap={1.5} minW={0}>
      <Text
        w="2rem"
        flexShrink={0}
        textAlign="right"
        fontFamily="mono"
        fontWeight="900"
        fontSize="11px"
        color={total < 0 ? PAR_NEGATIVE : "text.primary"}
      >
        {total.toFixed(1)}
      </Text>
      {/* The track is clipped so the segments keep the rounded ends; the zero
          axis lives outside it, in this unclipped wrapper, so it can stand
          taller than the bar and read as an axis rather than a seam inside it. */}
      <Box position="relative" flex="1" minW={0} h="0.375rem">
        <Box position="absolute" inset={0} bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
          <Flex position="absolute" top={0} bottom={0} style={{ left: `${scale.zeroPct}%`, width: `${posWidth}%` }}>
            {pos.map((s) => (
              <Segment key={s.key} seg={s} color={accent} />
            ))}
          </Flex>
          <Flex direction="row-reverse" position="absolute" top={0} bottom={0} style={{ right: `${100 - scale.zeroPct}%`, width: `${negWidth}%` }}>
            {neg.map((s) => (
              <Segment key={s.key} seg={s} color={PAR_NEGATIVE} />
            ))}
          </Flex>
        </Box>
        {/* Drawn only in a table that actually holds a negative. With everything
            positive — which is most tables — zero is the left edge and an axis
            there would be chrome marking nothing. */}
        {scale.hasNegative && (
          <Box
            position="absolute" top="-0.3rem" bottom="-0.3rem" w="2px" zIndex={1}
            bg="rgba(255,255,255,0.7)" borderRadius="full" pointerEvents="none"
            style={{ left: `calc(${scale.zeroPct}% - 1px)` }}
          />
        )}
      </Box>
    </Flex>
  );
};

/**
 * The PAR column for one roster table. Every bar in the table is drawn against a
 * single domain built from that table's own rows — the real [min, max], so zero
 * lands where the data puts it rather than at a reserved mark. Most tables have
 * no negative at all, and those get zero at the left edge and the whole track
 * for their positives.
 */
const segmentsFor = (entry, componentKey, label) => {
  if (!componentKey) return parSegments(entry);
  const v = entry?.components?.[componentKey];
  return typeof v === "number" && v !== 0 ? [{ key: componentKey, label, tier: 0, value: v }] : [];
};

// The game-wide range lives in utils/productionBars.js so the export posters
// read production on the exact same scale. Kept under its old name here.
export const gameParBounds = gameProductionBounds;

export const parColumn = (rows, index, accent, label = "Production Score", componentKey = null, bounds = null) => {
  const segmentsOf = new Map();
  const totalOf = new Map();
  let min = bounds?.min ?? 0;
  let max = bounds?.max ?? 0;

  rows.forEach((r) => {
    const entry = productionOf(index, r);
    // A unit table (passing, rushing, receiving) scores the player on THAT unit's
    // component alone — a QB's rushing production doesn't belong in the passing
    // table. The component is read straight off `components`; nothing is split here.
    const total = componentKey
      ? (typeof entry?.components?.[componentKey] === "number" ? entry.components[componentKey] : null)
      : entry?.total ?? null;
    const segs = segmentsFor(entry, componentKey, label);
    const rowKey = r.key ?? r.name;
    segmentsOf.set(rowKey, segs);
    totalOf.set(rowKey, total);
    const pos = segs.reduce((sum, s) => sum + Math.max(0, s.value), 0);
    const neg = segs.reduce((sum, s) => sum + Math.min(0, s.value), 0);
    if (pos > max) max = pos;
    if (neg < min) min = neg;
  });

  const scale = productionScale({ min, max });

  return {
    key: "par",
    label,
    flex: true,
    // Floor, not a target: the number gutter, its gap, and enough track left to
    // read a bar against. Everything past this is leftover the column absorbs.
    minPx: 116,
    render: (r) => (
      <ProductionBar total={totalOf.get(r.key ?? r.name) ?? null} segments={segmentsOf.get(r.key ?? r.name) ?? []} scale={scale} accent={accent} />
    ),
  };
};

/** Roster tables read top-down by production, so PAR is the sort key — the unit's component when given. */
export const sortByPar = (rows, index, componentKey = null) => {
  const score = (r) => {
    const entry = productionOf(index, r);
    if (componentKey) return typeof entry?.components?.[componentKey] === "number" ? entry.components[componentKey] : -1e9;
    return entry?.total ?? -1e9;
  };
  return [...rows].sort((a, b) => score(b) - score(a));
};

/**
 * Section eyebrow — the house standard: a small accent dot, the label, a hairline
 * under it. No leading bar and no "TEAM · SECTION" slash construction; the panel's
 * contents say what they are, so the eyebrow only has to say whose they are.
 */
export const SectionLabel = ({ children, dotColor = "#E53E3E" }) => (
  <Flex align="center" gap={2} px={3} py={2} borderBottom="1px solid" borderColor="whiteAlpha.100">
    <Box w="0.375rem" h="0.375rem" bg={dotColor} borderRadius="full" flexShrink={0} />
    <Text
      fontSize="clamp(0.55rem, 0.65vw, 0.7rem)"
      fontWeight="black"
      color="rgba(255,255,255,0.5)"
      textTransform="uppercase"
      letterSpacing="0.16em"
      lineHeight={1.1}
    >
      {children}
    </Text>
  </Flex>
);

/**
 * Plain, static table — team summary rows (Total / Standard Downs / Passing
 * Downs and the like). Always a handful of columns, always spans the panel
 * full width, never drops anything. Not the place for per-player rosters —
 * see `RosterTable` below for that.
 */
export const PlainTable = ({ columns, rows, activeKey, onRowClick, rowKey }) => (
  <Box as="table" w="full" style={{ borderCollapse: "collapse" }}>
    <Box as="thead">
      <Box as="tr" bg="whiteAlpha.50">
        {columns.map((c, i) => (
          <Box
            as="th"
            key={c.key}
            textAlign={i === 0 ? "left" : "right"}
            py={1.5}
            px={i === 0 ? 3 : 2}
            borderRight={i < columns.length - 1 ? "1px solid" : "none"}
            borderColor="whiteAlpha.100"
          >
            <Text fontSize="9px" fontWeight="950" color="text.muted" textTransform="uppercase" letterSpacing="0.06em">
              {c.label}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
    <Box as="tbody">
      {rows.map((row) => {
        const key = rowKey(row);
        const isActive = activeKey && key === activeKey;
        return (
          <Box
            as="tr"
            key={key}
            cursor={onRowClick ? "pointer" : "default"}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            bg={isActive ? "whiteAlpha.100" : "transparent"}
            _hover={onRowClick ? { bg: "whiteAlpha.50" } : undefined}
            borderBottom="1px solid"
            borderColor="whiteAlpha.50"
          >
            {columns.map((c, i) => (
              <Box
                as="td"
                key={c.key}
                textAlign={i === 0 ? "left" : "right"}
                py={1.5}
                px={i === 0 ? 3 : 2}
                borderRight={i < columns.length - 1 ? "1px solid" : "none"}
                borderColor="whiteAlpha.50"
              >
                <Text
                  fontSize={i === 0 ? "11px" : "12px"}
                  fontWeight={i === 0 ? "800" : "900"}
                  fontFamily={i === 0 ? "inherit" : "mono"}
                  color="text.primary"
                >
                  {c.render ? c.render(row) : row[c.key]}
                </Text>
              </Box>
            ))}
          </Box>
        );
      })}
      {rows.length === 0 && (
        <Box as="tr">
          <Box as="td" colSpan={columns.length} py={4} textAlign="center">
            <Text fontSize="xs" color="text.muted">No data</Text>
          </Box>
        </Box>
      )}
    </Box>
  </Box>
);

// Real pixel measurement of column content, via a scratch canvas — not a `ch`
// or rem/vw guess. `ch` is defined by the width of "0" in the element's own
// font, which is a fine proxy for a monospace numeral column but a bad one for
// a proportional-font name column: bold letters in "Carter" render wider than
// six "0"s do, which is exactly what was clipping both the header ("PLA…")
// and the values ("Car…", "Sm…") to unreadable fragments. Measuring the actual
// string in the actual font it renders with can't guess wrong.
let measureCtx = null;
const measureTextPx = (text, font) => {
  if (typeof document === "undefined") return 0;
  if (!measureCtx) measureCtx = document.createElement("canvas").getContext("2d");
  measureCtx.font = font;
  return measureCtx.measureText(String(text ?? "")).width;
};

const HEADER_FONT = "950 9px Inter, system-ui, sans-serif";
const NAME_FONT = "800 11px Inter, system-ui, sans-serif";
const STAT_FONT = "900 12px monospace";
const CELL_H_PADDING_PX = 24; // covers px={3} (name) and px={2} (stat) with margin to spare
const MEASURE_SAFETY_PX = 4; // canvas vs. DOM text layout can differ by a hair; round up, not down
const NAME_MAX_EXTRA_PX = 28; // how much leftover width the name column may claim as breathing room

/**
 * Each column's real minimum width: the wider of its header label and the
 * longest actual value across these rows, in the font that column renders
 * with. This is the "get each column's size" step — done once per column,
 * from real content, not assumed.
 */
const naturalColumnWidths = (columns, rows) =>
  columns.map((c, i) => {
    // A `flex` column draws rather than prints — a production bar has no text
    // to measure, and it's the column that soaks up leftover width, so all it
    // needs here is a floor.
    if (c.flex) return c.minPx ?? 96;
    const font = i === 0 ? NAME_FONT : STAT_FONT;
    const headerPx = measureTextPx(c.label, HEADER_FONT);
    const valuePx = rows.map((r) => measureTextPx(c.render ? c.render(r) : r[c.key], font));
    return Math.max(headerPx, ...valuePx, 0) + CELL_H_PADDING_PX + MEASURE_SAFETY_PX;
  });

/**
 * The full sequence, in order: (1) measure the real container width via
 * ResizeObserver (through `useMountEffect`, never raw `useEffect` — see
 * AGENTS.md's ban), (2) get each column's real natural width from its actual
 * content, (3) keep adding columns — dropping the lowest-priority one first
 * (later columns before earlier ones, unless a column sets its own lower
 * `priority`; column 0 never drops) — until what's left fits the container,
 * (4) fit all: scale the survivors' widths UP to fill the container exactly,
 * never down past their measured minimum, so real text never clips.
 */
const useFitColumns = (columns, rows) => {
  const ref = useRef(null);
  const [width, setWidth] = useState(null);

  useMountEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width;
      if (w) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  });

  const result = useMemo(() => {
    const natural = naturalColumnWidths(columns, rows);
    if (!width) return { visible: columns, widths: natural };

    let keptIdx = columns.map((_, i) => i);
    const totalOf = (idxs) => idxs.reduce((sum, i) => sum + natural[i], 0);

    while (keptIdx.length > 1 && totalOf(keptIdx) > width) {
      // A `flex` column is never a drop candidate. It is the column that gives
      // width back — it counts into the total at a floor, not at a natural
      // size — so dropping it to make room is backwards, and it was costing the
      // production score its column on whichever of the two side-by-side panels
      // happened to have the longer surnames. Stats go first; the score stays.
      const droppable = keptIdx.slice(1).filter((i) => !columns[i].flex);
      if (droppable.length === 0) break;
      const dropCandidate = droppable
        .map((i) => ({ i, priority: columns[i].priority ?? i }))
        .sort((a, b) => a.priority - b.priority)
        .at(-1).i;
      keptIdx = keptIdx.filter((i) => i !== dropCandidate);
    }

    // Where leftover width goes is the whole ballgame. Spreading it across
    // every column blows up right-aligned numbers into mostly-empty cells;
    // dumping it all on the name column just moves that gap next to the name.
    // A `flex` column — the production bar — is the one thing here that
    // genuinely wants to be wider, so it takes the remainder and the table
    // lands exactly on the container's width. With no flex column, the name
    // takes a capped sip and the rest is left honestly unclaimed.
    const visible = keptIdx.map((i) => columns[i]);
    const keptNatural = keptIdx.map((i) => natural[i]);
    const total = keptNatural.reduce((a, b) => a + b, 0);
    const leftover = Math.max(0, width - total);
    const flexPos = visible.findIndex((c) => c.flex);
    const absorb = flexPos >= 0 ? flexPos : 0;
    const boost = flexPos >= 0 ? leftover : Math.min(leftover, NAME_MAX_EXTRA_PX);
    const widths = keptNatural.map((w, idx) => (idx === absorb ? w + boost : w));
    return { visible, widths };
  }, [columns, rows, width]);

  return [ref, result.visible, result.widths];
};

/**
 * The per-player roster tables (Passing, Receiving, Rushing, Defense player
 * lists) — many rows, the same stat columns repeated, a row click swaps the
 * spotlight. See `useFitColumns` above for the sizing sequence.
 */
export const RosterTable = ({ columns, rows, activeKey, onRowClick, rowKey }) => {
  const [wrapRef, visibleColumns, widths] = useFitColumns(columns, rows);
  const colWidth = (i) => `${widths[i]}px`;
  // The table's own width is the real sum of its (capped) columns, not a
  // forced `w="full"` — a fixed-layout table stretched wider than the sum of
  // its specified column widths redistributes the difference back across
  // every column, which would undo the name column's cap right back into the
  // same gap-in-every-stat-column problem this was fixing.
  const tableWidth = widths.reduce((a, b) => a + b, 0);

  return (
    <Box ref={wrapRef} w="full">
      <Box as="table" w={`${tableWidth}px`} style={{ borderCollapse: "collapse", tableLayout: "fixed" }}>
        <Box as="thead">
          <Box as="tr" bg="whiteAlpha.50">
            {visibleColumns.map((c, i) => (
              <Box
                as="th"
                key={c.key}
                w={colWidth(i)}
                textAlign={i === 0 ? "left" : "right"}
                py={1}
                px={i === 0 ? 3 : 2}
                borderRight={i < visibleColumns.length - 1 ? "1px solid" : "none"}
                borderColor="whiteAlpha.100"
              >
                <Text fontSize="9px" fontWeight="950" color="text.muted" textTransform="uppercase" letterSpacing="0.06em" lineHeight="1.15">
                  {c.label}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
        <Box as="tbody">
          {rows.map((row) => {
            const key = rowKey(row);
            const isActive = activeKey && key === activeKey;
            return (
              <Box
                as="tr"
                key={key}
                cursor={onRowClick ? "pointer" : "default"}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                bg={isActive ? "whiteAlpha.100" : "transparent"}
                _hover={onRowClick ? { bg: "whiteAlpha.50" } : undefined}
                borderBottom="1px solid"
                borderColor="whiteAlpha.50"
              >
                {visibleColumns.map((c, i) => (
                  <Box
                    as="td"
                    key={c.key}
                    w={colWidth(i)}
                    textAlign={i === 0 ? "left" : "right"}
                    py={1.5}
                    px={i === 0 ? 3 : c.flex ? 1.5 : 2}
                    borderRight={i < visibleColumns.length - 1 ? "1px solid" : "none"}
                    borderColor="whiteAlpha.50"
                  >
                    {c.flex ? (
                      c.render(row)
                    ) : (
                      // `shade` paints the cell against the league (see shadeVsLeague)
                      // — the inspo's red/green comparative read, on the cells only.
                      <Box bg={c.shade?.(row) ?? "transparent"} borderRadius="sm" px={c.shade ? 1.5 : 0} py={c.shade ? 0.5 : 0} display="inline-block" minW={c.shade ? "2.4rem" : undefined} textAlign="right">
                        <Text
                          fontSize={i === 0 ? "11px" : "12px"}
                          fontWeight={i === 0 ? "800" : "900"}
                          fontFamily={i === 0 ? "inherit" : "mono"}
                          color="text.primary"
                          lineClamp={1}
                        >
                          {c.render ? c.render(row) : row[c.key]}
                        </Text>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            );
          })}
          {rows.length === 0 && (
            <Box as="tr">
              <Box as="td" colSpan={visibleColumns.length} py={4} textAlign="center">
                <Text fontSize="xs" color="text.muted">No data</Text>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export const StatChip = ({ label, value }) => (
  <Box minW={0}>
    <Text fontSize="clamp(0.42rem, 0.55vw, 0.52rem)" fontWeight="900" color="rgba(255,255,255,0.35)" textTransform="uppercase" letterSpacing="0.1em" lineHeight={1.2} lineClamp={1}>
      {label}
    </Text>
    <Text fontSize="clamp(0.7rem, 0.95vw, 0.88rem)" fontWeight="900" color="white" lineHeight={1.15} lineClamp={1}>
      {value}
    </Text>
  </Box>
);

// The portrait bleeds from the panel's left edge and is darkened away under the
// copy rather than being boxed into an avatar tile — the same construction the
// Summary tab's Notable Performers card uses. Gradient stops are tuned tighter
// here because this band is short and the copy starts much further left.
const PORTRAIT_W = "44%";
const PORTRAIT_SCRIM = "linear-gradient(to right, rgba(20,20,22,0.06) 0%, rgba(20,20,22,0.78) 42%, #141416 94%)";

/**
 * The player spotlight — a full-bleed band, not a card inside a card. The
 * portrait is a background layer bleeding off the panel's left edge and fading
 * out to the right; the name, chips and the group's chart (lane chart, target
 * zones, havoc concept) ride on top of it. Deliberately short: this sits
 * between the team table above and the roster table below, so nothing in it is
 * allowed to set a tall floor.
 */
// Tries each headshot candidate in order; the team mark takes over once they're all
// dead — so a placeholder URL never renders as a broken image.
const CandidatePortrait = ({ srcs, teamId }) => {
  const [attempt, setAttempt] = useState(0);
  const current = srcs[attempt] ?? null;
  if (!current) {
    return (
      <Flex h="full" align="center" justify="flex-start" pl={2}>
        <Image src={getTeamLogoSrc(teamId)} alt="" h="150%" maxW="90%" objectFit="contain" opacity={0.35} />
      </Flex>
    );
  }
  return <Image key={current} src={current} alt="" w="full" h="full" objectFit="cover" objectPosition="center 12%" onError={() => setAttempt((a) => a + 1)} />;
};

export const SpotlightCard = ({
  name,
  playerKey = null,
  accent,
  teamId,
  headshotIndex,
  identity = null,
  productionRows,
  productionComponent = null,
  roleFallback = "—",
  chips = [],
  children,
}) => {
  const [first, last] = splitDisplayName(name);
  // Identity by PERS_ id with the prior-season fallback when the panel passes it;
  // the older name-only index otherwise (Defense still uses that path).
  const rosterRow = identity ? identity.byPerson?.[playerKey] ?? identity.priorByPerson?.[playerKey] ?? null : null;
  const profile = identity
    ? { position: rosterRow?.position ?? rosterRow?.raw_position ?? lookupPlayerProfile(identity.headshots, name, teamId)?.position ?? null, jersey: rosterRow?.jersey_number ?? null }
    : lookupPlayerProfile(headshotIndex, name, teamId);
  const srcs = identity ? resolveImages(identity, { player_key: playerKey, name }, teamId) : (profile?.image ? [profile.image] : []);
  const position = profile?.position || roleFallback;
  const entry = productionOf(productionIndex(productionRows), { key: playerKey, name });
  const production = productionComponent
    ? (typeof entry?.components?.[productionComponent] === "number" ? entry.components[productionComponent] : null)
    : entry?.total ?? null;
  // Phones: the portrait + stats are one block and the chart sits under it, clear of
  // the photo, instead of sharing the row (or stacking on top of the portrait).
  const { isMobile } = useLayoutDensity();

  const card = (
    <Box
      position="relative"
      overflow="hidden"
      minW={0}
      minH="clamp(5.5rem, 8vw, 7rem)"
      borderY="1px solid"
      borderColor="whiteAlpha.100"
    >
      {/* Layer 0 — portrait, bleeding off the left edge */}
      <Box position="absolute" left={0} top={0} bottom={0} w={PORTRAIT_W} zIndex={0} overflow="hidden">
        {/* No live headshot: the school's mark stands in as an oversized watermark
            rather than a two-letter tile. */}
        <CandidatePortrait key={playerKey ?? name} srcs={srcs} teamId={teamId} />
        <Box position="absolute" inset={0} bg={PORTRAIT_SCRIM} pointerEvents="none" />
      </Box>

      {/* Team-colour edge, same marker the Notable Performers card uses */}
      <Box position="absolute" left={0} top={0} bottom={0} w="0.1875rem" bg={accent} zIndex={2} />

      {/* Layer 1 — copy, starting clear of the portrait's brightest part */}
      <Grid
        position="relative"
        zIndex={1}
        templateColumns={{ base: "1fr", lg: "minmax(0, 1.05fr) minmax(0, 1fr)" }}
        gap={3}
        alignItems="center"
        pl={{ base: 3, lg: "13%" }}
        pr={3}
        py={2}
      >
        <Box minW={0}>
          <Flex align="baseline" gap={1.5} minW={0} mb={1.5}>
            <Text fontSize="clamp(0.85rem, 1.15vw, 1.15rem)" fontWeight="950" color="white" textTransform="uppercase" letterSpacing="-0.01em" lineHeight={1.05} lineClamp={1}>
              {first} {last}
            </Text>
            <Text fontSize="clamp(0.45rem, 0.6vw, 0.55rem)" fontWeight="900" color={accent} textTransform="uppercase" letterSpacing="0.12em" flexShrink={0}>
              {position}
            </Text>
            {profile?.jersey != null && (
              <Text fontSize="clamp(0.45rem, 0.6vw, 0.55rem)" fontWeight="800" color="rgba(255,255,255,0.35)" flexShrink={0}>
                #{profile.jersey}
              </Text>
            )}
            {production != null && (
              <Text ml="auto" fontFamily="mono" fontSize="clamp(0.6rem, 0.8vw, 0.75rem)" fontWeight="950" color={production < 0 ? PAR_NEGATIVE : accent} flexShrink={0}>
                {production.toFixed(1)}
              </Text>
            )}
          </Flex>

          <Grid templateColumns="repeat(4, minmax(0, 1fr))" columnGap={2} rowGap={1.5}>
            {chips.map(([label, value]) => (
              <StatChip key={label} label={label} value={value} />
            ))}
          </Grid>
        </Box>

        {/* Whatever chart the group wants. */}
        {!isMobile && <Box minW={0}>{children}</Box>}
      </Grid>
    </Box>
  );

  if (!isMobile || !children) return card;
  return (
    <Box>
      {card}
      <Box px={3} py={2.5} borderBottom="1px solid" borderColor="whiteAlpha.100">{children}</Box>
    </Box>
  );
};

const hexToRgb = (hex) => {
  const raw = String(hex || "").replace("#", "");
  const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  if (full.length !== 6) return null;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const rgbToHsl = ({ r, g, b }) => {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === R ? ((G - B) / d + (G < B ? 6 : 0)) : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  return { h: h / 6, s, l };
};

const hslToRgb = ({ h, s, l }) => {
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p2 = 2 * l - q;
  const channel = (t) => {
    let x = t;
    if (x < 0) x += 1;
    if (x > 1) x -= 1;
    if (x < 1 / 6) return p2 + (q - p2) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p2 + (q - p2) * (2 / 3 - x) * 6;
    return p2;
  };
  return {
    r: Math.round(channel(h + 1 / 3) * 255),
    g: Math.round(channel(h) * 255),
    b: Math.round(channel(h - 1 / 3) * 255),
  };
};

/**
 * Team colours in this league skew very dark — 15 of 18 primaries sit under 0.28
 * luminance and three (Alabama State, Pine Bluff, Grambling) are pure black — so
 * ramping the primary's alpha straight onto a #141416 card would produce cells you
 * cannot tell apart. Lift lightness into a usable band, keeping hue and saturation so
 * the colour still reads as the school's. A black primary has neither to keep, so it
 * defers to the secondary.
 */
export const heatAccent = (primary, secondary) => {
  const rgb = hexToRgb(primary);
  if (!rgb) return "#4A90D9";
  let hsl = rgbToHsl(rgb);
  if (hsl.s < 0.15 && hsl.l < 0.2) {
    const alt = hexToRgb(secondary);
    if (alt) hsl = rgbToHsl(alt);
  }
  // Saturation is capped as well as floored. Lifting a deep, fully-saturated colour —
  // FAMU's #006747, Norfolk's #007A5E — to a high lightness without capping it turns
  // the school green into neon mint, which reads as a bug rather than a brand.
  const s = Math.min(Math.max(hsl.s, 0.3), 0.6);
  const lifted = hslToRgb({ h: hsl.h, s, l: Math.max(hsl.l, 0.46) });
  return `rgb(${lifted.r}, ${lifted.g}, ${lifted.b})`;
};

const withAlpha = (color, alpha) => {
  const rgb = hexToRgb(color);
  if (rgb) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  const m = String(color).match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const [r, g, b] = m[1].split(",").map((v) => parseFloat(v));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
};

/**
 * Shared heat ramp for the production charts, in the school's own colour. Intensity is
 * a yards-style rate, not a completion percentage: the cell already prints its own
 * counts, so colour has to carry something the numerals don't. Below `minSample`
 * attempts the cell stays neutral — one carry or one throw is not a rate.
 */
// Passing zone grid heat: yards per attempt against a fixed 14 — page and poster.
export const PASS_ZONE_YPA_SCALE = 14;

export const heatFill = (value, attempts, scale, color, minSample = 2) => {
  if (!attempts) return { bg: "transparent", border: "rgba(255,255,255,0.05)" };
  if (attempts < minSample) return { bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.09)" };
  const t = Math.max(0, Math.min(1, value / scale));
  return {
    bg: withAlpha(color, (0.16 + t * 0.68).toFixed(3)),
    border: withAlpha(color, 0.4),
  };
};
