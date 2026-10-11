import { useMemo, useState } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { PENALTY_PHASES, PENALTY_SIDES, penaltyMatrix } from "../../../pages/stats/penaltyMatrix";

// ─────────────────────────────────────────────────────────────────────────────
// PENALTY MATRIX — every foul, every team, one season.
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
// ─────────────────────────────────────────────────────────────────────────────

const AMBER = "246,173,85";

const heatFill = (n, rowMax, rowTotal) => {
  if (!n) return "transparent";
  const t = rowMax > 0 ? n / rowMax : 0;
  const mute = Math.min(1, 0.38 + rowTotal / 140);
  return `rgba(${AMBER},${((0.1 + t * 0.62) * mute).toFixed(3)})`;
};

const Chip = ({ active, onClick, children }) => (
  <Box
    as="button" type="button" onClick={onClick} px={2.5} py={1.5} borderRadius="md" whiteSpace="nowrap"
    fontSize="9px" fontWeight="900" textTransform="uppercase" letterSpacing="0.1em"
    bg={active ? "brand.500" : "whiteAlpha.100"} color={active ? "white" : "whiteAlpha.600"}
    _hover={{ bg: active ? "brand.500" : "whiteAlpha.200" }}
  >
    {children}
  </Box>
);

export const PenaltyMatrix = ({ teams, file }) => {
  const [phase, setPhase] = useState("all");
  const [side, setSide] = useState("all");

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

  const template = `minmax(9.5rem, 1.2fr) 2.6rem repeat(${columns.length}, minmax(2.2rem, 1fr))`;

  return (
    <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" overflow="hidden">
      {/* ── Masthead ─────────────────────────────────────────────────── */}
      <Flex align="flex-end" justify="space-between" gap={4} wrap="wrap" px={4} pt={4} pb={3}>
        <Box minW={0}>
          <Text
            fontSize="clamp(1.4rem, 3.2vw, 2.6rem)" fontWeight="900" fontStyle="italic" color="white"
            textTransform="uppercase" letterSpacing="-0.04em" lineHeight={0.9}
          >
            Every flag, every foul
          </Text>
        </Box>
        <Flex direction="column" gap={2} align={{ base: "flex-start", md: "flex-end" }}>
          <Flex gap={2} wrap="wrap">
            {PENALTY_PHASES.map((p) => (
              <Chip key={p.id} active={phase === p.id} onClick={() => setPhase(p.id)}>{p.label}</Chip>
            ))}
          </Flex>
          <Flex gap={2} wrap="wrap">
            {PENALTY_SIDES.map((p) => (
              <Chip key={p.id} active={side === p.id} onClick={() => setSide(p.id)}>{p.label}</Chip>
            ))}
          </Flex>
        </Flex>
      </Flex>

      {/* ── The grid ─────────────────────────────────────────────────── */}
      <Box overflowX="auto" px={4} pb={3}>
        <Grid templateColumns={template} columnGap="2px" rowGap="2px" minW="52rem">
          {/* Header: logo over that team's season flag count */}
          <Box position="sticky" left={0} zIndex={2} bg="bg.secondary" pb={2} display="flex" alignItems="flex-end">
            <Text fontSize="9px" fontWeight="900" color="whiteAlpha.400" textTransform="uppercase" letterSpacing="0.13em">Foul</Text>
          </Box>
          <Flex direction="column" align="center" justify="flex-end" pb={2}>
            <Text fontSize="9px" fontWeight="900" color="whiteAlpha.400" textTransform="uppercase" letterSpacing="0.1em">All</Text>
          </Flex>
          {columns.map((t) => (
            <Flex key={t.id} direction="column" align="center" justify="flex-end" gap={1} pb={2} minW={0} title={t.name}>
              {t.logo ? (
                <Image src={t.logo} alt="" w="18px" h="18px" objectFit="contain" />
              ) : (
                <Text fontSize="9px" fontWeight="900" color="whiteAlpha.700">{t.short}</Text>
              )}
              <Text fontSize="10px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">
                {data.totals[t.id] ?? 0}
              </Text>
            </Flex>
          ))}

          {/* One row per foul */}
          {rows.map((r) => (
            <Box key={r.key} display="contents">
              <Flex
                position="sticky" left={0} zIndex={1} bg="bg.secondary" align="center" pr={3} py="3px" minW={0}
              >
                <Text fontSize="11px" fontWeight="900" color="white" lineClamp={1} title={r.label}>{r.label}</Text>
              </Flex>
              <Flex align="center" justify="center" bg="whiteAlpha.50" borderRadius="sm">
                <Text fontSize="10px" fontWeight="900" color="whiteAlpha.700" fontVariantNumeric="tabular-nums">{r.total}</Text>
              </Flex>
              {r.cells.map((n, i) => {
                const leader = n > 0 && n === r.max;
                return (
                  <Flex
                    key={columns[i].id} align="center" justify="center" borderRadius="sm" minW={0} py="4px"
                    bg={heatFill(n, r.max, r.total)}
                    title={`${columns[i].short} · ${r.label} · ${n}`}
                  >
                    {n > 0 ? (
                      <Text
                        fontSize="10px" fontWeight={leader ? "900" : "700"}
                        color={leader ? "white" : "whiteAlpha.900"} fontVariantNumeric="tabular-nums"
                      >
                        {n}
                      </Text>
                    ) : (
                      <Text fontSize="10px" color="whiteAlpha.200" lineHeight={1}>·</Text>
                    )}
                  </Flex>
                );
              })}
            </Box>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default PenaltyMatrix;
