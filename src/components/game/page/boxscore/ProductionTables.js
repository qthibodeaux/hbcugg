import { Flex, Box, Text } from "@chakra-ui/react";
import { useRef, useState, useMemo } from "react";
import useMountEffect from "../../../../hooks/useMountEffect";

// Extracted from ProductionPrimitives; existing behavior is preserved.

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

const CELL_H_PADDING_PX = 24;

// covers px={3} (name) and px={2} (stat) with margin to spare
const MEASURE_SAFETY_PX = 4;

// canvas vs. DOM text layout can differ by a hair; round up, not down
const NAME_MAX_EXTRA_PX = 28;

// how much leftover width the name column may claim as breathing room
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
