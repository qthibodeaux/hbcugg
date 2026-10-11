import { Box, Grid, GridItem } from "@chakra-ui/react";

// ─────────────────────────────────────────────────────────────────────────────
// PAGE SHELL — single source of truth for the page grid system
//
// Usage:
//   <PageShell>
//     <PageShell.Slot cols={4}>  ← 4x1 banner
//     <PageShell.Slot cols={1}>  ← 1x1 card
//     <PageShell.Slot cols={2} rows={2}>  ← 2x2 card
//   </PageShell>
//
// Rules:
//   - Grid is always 4 columns
//   - Row unit equals one column width (1x1 is square) — never declare h on children
//   - Gap is minimal at md, relaxed at lg
//   - Children must render w="100%" h="100%" to fill their slot
// ─────────────────────────────────────────────────────────────────────────────

// Outer grid gap — minimal at md, breathing room at lg
const GRID_GAP = { base: "0.25rem", md: "0.25rem", lg: "0.625rem" };

// The single row unit — equal to one column's width, so a 1x1 slot is square,
// a 4x1 is 4:1, a 1x2 is 1:2. Measured off the padded wrapper (a size container)
// rather than the viewport, so the sidebar and the content cap don't skew it.
// `--shell-gap` is set on the grid so the calc tracks the responsive gap.
const ROW_UNIT = "calc((100cqw - 3 * var(--shell-gap)) / 4)";

// Outer page padding — tight at md, relaxed at lg
// Content cap — past this the 1x1 grid units grow too big to read as cards.
export const PAGE_MAX_W = "1100px";

const PAGE_PX = { base: "0.25rem", md: "0.25rem", lg: "1rem" };
const PAGE_PT = { base: "0.25rem", md: "0.25rem", lg: "0.75rem" };

// ── Slot ─────────────────────────────────────────────────────────────────────
// A grid slot. cols = column span (1–4), rows = row span (default 1).
// Enforces w/h 100% on children via the inner Box.

const Slot = ({ cols = 1, rows = 1, radius = "none", overflow = "hidden", children }) => (
  <GridItem
    colSpan={cols}
    rowSpan={rows}
    minW={0}
    minH={0}
  >
    <Box w="full" h="full" overflow={overflow} borderRadius={radius}>
      {children}
    </Box>
  </GridItem>
);

// ── PageShell ─────────────────────────────────────────────────────────────────

// PageShell supports three usage patterns:
// 1. Full page:     <PageShell>{slots}</PageShell>
// 2. Hybrid list:   <PageShell listContent={<List />}>{slots}</PageShell>
// 3. Embedded tab:  <PageShell embedded>{slots}</PageShell>  ← no nav padding, no outer shell
// `flushMobile`: on phones (base breakpoint) the slots touch the screen edges
// and each other — no page padding, no grid gap. The mobile design language
// for pages still on the desktop grid; md and up are unchanged.
const FLUSH_GAP = { ...GRID_GAP, base: "0px" };
const FLUSH_PX = { ...PAGE_PX, base: 0 };
const FLUSH_PT = { ...PAGE_PT, base: 0 };

const PageShell = ({ children, listContent, embedded = false, flushMobile = false }) => {
  const gap = flushMobile ? FLUSH_GAP : GRID_GAP;
  const px = flushMobile ? FLUSH_PX : PAGE_PX;
  const pt = flushMobile ? FLUSH_PT : PAGE_PT;
  const grid = (
    <Grid
      templateColumns="repeat(4, minmax(0, 1fr))"
      autoRows={ROW_UNIT}
      gap={gap}
      css={{ "--shell-gap": gap }}
      alignItems="stretch"
    >
      {children}
    </Grid>
  );

  if (embedded) {
    return (
      <Box maxW={PAGE_MAX_W} mx="auto" px={px} pt={pt} pb={10} containerType="inline-size">
        {grid}
      </Box>
    );
  }

  return (
    <Box className="page-shell-root" pt="var(--app-header-height)" minH="100vh" bg="bg.primary">
      <Box maxW={PAGE_MAX_W} mx="auto" px={px} pt={pt} pb={listContent ? 2 : 10} containerType="inline-size">
        {grid}
      </Box>
      {listContent && (
        <Box maxW={PAGE_MAX_W} mx="auto" px={PAGE_PX} pb={10} pt={4}>
          {listContent}
        </Box>
      )}
    </Box>
  );
};

PageShell.Slot = Slot;

export default PageShell;
