import { PenaltyHeatGrid } from "./penalties/PenaltyHeatGrid";
import { useMemo, useRef, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { PENALTY_PHASES, PENALTY_SIDES, penaltyMatrix } from "../../../pages/stats/penaltyMatrix";
import { ExportCardButton } from "./ExportCardButton";
import { useColorScheme } from "../../../theme/colorScheme";

// ─────────────────────────────────────────────────────────────────────────────
// PENALTY BREAKDOWN (the penalty matrix) — every foul, every team, one season.
//
// The whole discipline picture as one grid: fouls down the side ordered by how
// often the league commits them, teams across the top ordered by how often they
// get flagged. A column read top to bottom is a team's bad habits; a row read
// across is which team owns that foul.
//
// Two rules keep it readable at 39 rows x 18 columns:
//
//   • Heat is relative to the ROW, not the grid. Holding and false start would
//     otherwise be the only two rows with any colour in them and the other 37
//     would be a grey field.
//   • Rare rows are muted. A single tripping call should not shout as loudly as
//     a league-leading 38 holds, so a row's whole palette dims with its total.
//
// Real: stats/counting/penalties_{season}.json (League games). Filter by phase
// (pre-snap / live / dead ball) and by side (offense / defense / special teams).
// Gridlines between every cell; the filter chips and Export button are
// data-export-skip, so the PNG is the title and the grid only.
// ─────────────────────────────────────────────────────────────────────────────

const BRAND_PURPLE_NIGHT = "168,85,247";
const BRAND_PURPLE_LIGHT = "126,34,206";

const Chip = ({ active, onClick, children }) => (
  <Box
    as="button" type="button" onClick={onClick} px={2.5} py={1.5} borderRadius="md" whiteSpace="nowrap"
    fontSize="9px" fontWeight="900" textTransform="uppercase" letterSpacing="0.1em"
    bg={active ? "brand.500" : "line.subtle"} color={active ? "white" : "text.secondary"}
    _hover={{ bg: active ? "brand.500" : "line.hover" }}
  >
    {children}
  </Box>
);

export const PenaltyMatrix = ({ teams, file }) => {
  const [phase, setPhase] = useState("all");
  const [side, setSide] = useState("all");
  const [scheme] = useColorScheme();
  const exportRef = useRef(null);
  const heatRgb = scheme === "light" ? BRAND_PURPLE_LIGHT : BRAND_PURPLE_NIGHT;

  const data = useMemo(() => penaltyMatrix(file, teams, side), [file, teams, side]);

  // Teams left to right by total flags, the way the reference reads.
  const columns = useMemo(
    () => [...teams].sort((a, b) => (data.totals[b.id] ?? 0) - (data.totals[a.id] ?? 0)),
    [teams, data.totals],
  );

  // Rows by league frequency, hardest-hit foul first. The phase filter narrows
  // the list; it never reorders it, so a foul keeps its place in the eye.
  const rows = useMemo(() => {
    const list = phase === "all" ? data.fouls : data.fouls.filter((f) => f.phase === phase);
    return list
      .map((f) => {
        const cells = columns.map((t) => data.counts[t.id]?.[f.key] ?? 0);
        const max = Math.max(...cells, 0);
        return { ...f, cells, max, total: data.foulTotals[f.key] ?? 0 };
      })
      .filter((r) => r.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [phase, columns, data]);

  return (
    <Box ref={exportRef} bg="bg.secondary" border="1px solid" borderColor="line" borderRadius="lg" overflow="hidden">
      {/* ── Masthead ─────────────────────────────────────────────────── */}
      <Flex align="flex-end" justify="space-between" gap={4} wrap="wrap" px={4} pt={4} pb={3}>
        <Box minW={0}>
          <Text
            fontSize="clamp(1.4rem, 3.2vw, 2.6rem)" fontWeight="900" fontStyle="italic" color="text.primary"
            textTransform="uppercase" letterSpacing="-0.04em" lineHeight={0.9}
          >
            Penalty breakdown
          </Text>
        </Box>
        <Flex direction="column" gap={2} align={{ base: "flex-start", md: "flex-end" }} data-export-skip="true">
          <Flex gap={2} wrap="wrap">
            {PENALTY_PHASES.map((p) => (
              <Chip key={p.id} active={phase === p.id} onClick={() => setPhase(p.id)}>{p.label}</Chip>
            ))}
          </Flex>
          <Flex gap={2} wrap="wrap" justify="flex-end">
            <Flex gap={2} wrap="wrap">
              {PENALTY_SIDES.map((p) => (
                <Chip key={p.id} active={side === p.id} onClick={() => setSide(p.id)}>{p.label}</Chip>
              ))}
            </Flex>
            <ExportCardButton
              target={exportRef}
              filename={() => `penalty-matrix-${file?.meta?.season ?? "season"}-${phase}-${side}.png`}
            />
          </Flex>
        </Flex>
      </Flex>

      {/* ── The grid ─────────────────────────────────────────────────── */}
      <PenaltyHeatGrid columns={columns} rows={rows} totals={data.totals} heatRgb={heatRgb} />
    </Box>
  );
};

export default PenaltyMatrix;
