import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import teamsData from "../../../../data/teams.json";

// ═══════════════════════════════════════════════════════════════════════════════
// SERIES CARDS — "When did they move the chains?" and "Series Results"
// ═══════════════════════════════════════════════════════════════════════════════
// A series is one set of downs. The first card is where in the set the offense
// converted — 1st / 2nd / 3rd / 4th down — or didn't; the second is what each set
// ended in — TD / first down / FG / punt / turnover. Both are 100%-stacked bars, one
// per team, after inspo/2.png.
//
// Read off `game.series_summary[team_id]` — NOT on any file yet (see
// LAUNCH_0_BACKEND_NOTES.md, Game Page). Counted by the backend, never here:
//
//   series_summary: {
//     [team_id]: {
//       series: integer                          // sets of downs on offense
//       chains_moved_on: { "1st": n, "2nd": n, "3rd": n, "4th": n, none: n }
//       results: { td: n, first_down: n, fg: n, punt: n, turnover: n, other: n }
//     }
//   }
//
// Until it ships the bars are empty and the card says so.

const TEAM_META = teamsData.teams.reduce((acc, t) => {
  acc[t.id] = t;
  acc[t.exportId] = t;
  acc[String(t.exportId).replace(/25$/, "")] = t;
  return acc;
}, {});
const teamMeta = (id) => TEAM_META[String(id ?? "").replace(/25$/, "")] ?? null;
const teamLabel = (id) => teamMeta(id)?.bannerShort ?? teamMeta(id)?.shortName ?? String(id ?? "").toUpperCase();
const teamLogo = (id) => teamMeta(id)?.logo ?? `/assets/${String(id ?? "").replace(/25$/, "")}.svg`;

const CHAINS_SEGMENTS = [
  { key: "1st", label: "1st down", color: "#6DBE45" },
  { key: "2nd", label: "2nd down", color: "#3B7DD8" },
  { key: "3rd", label: "3rd down", color: "#F0932B" },
  { key: "4th", label: "4th down", color: "#7B3FA0" },
  { key: "none", label: "No conversion", color: "#C8686B" },
];

const RESULT_SEGMENTS = [
  { key: "td", label: "TD", color: "#3CA36A" },
  { key: "first_down", label: "First Down", color: "#3B7DD8" },
  { key: "fg", label: "FG", color: "#E8B23A" },
  { key: "punt", label: "Punt", color: "#8C8C8C" },
  { key: "turnover", label: "TO", color: "#C94B4B" },
  { key: "other", label: "Other", color: "#4A4A50" },
];

const toShares = (counts, segments) => {
  if (!counts) return null;
  const total = segments.reduce((s, seg) => s + (Number(counts[seg.key]) || 0), 0);
  if (!total) return null;
  return segments.map((seg) => ({ ...seg, count: Number(counts[seg.key]) || 0, share: (Number(counts[seg.key]) || 0) / total }));
};

// The bar fills its row — rows split the card's remaining height between them, so
// the bars grow with the slot instead of sitting as thin strips in an empty card.
const BAR_H = "clamp(2.25rem, 4.5vw, 3.75rem)";

const StackedBar = ({ shares }) => {
  if (!shares) {
    return (
      <Flex h="full" minH={BAR_H} w="full" bg="rgba(255,255,255,0.04)" borderRadius="lg" align="center" justify="center" border="0.0625rem dashed" borderColor="rgba(255,255,255,0.12)">
        <Text fontSize="clamp(0.6rem, 0.8vw, 0.8rem)" fontWeight="800" color="rgba(255,255,255,0.3)" textTransform="uppercase" letterSpacing="0.14em">
          —
        </Text>
      </Flex>
    );
  }
  return (
    <Flex h="full" minH={BAR_H} w="full" borderRadius="lg" overflow="hidden">
      {shares.filter((s) => s.share > 0).map((s) => (
        <Flex key={s.key} w={`${s.share * 100}%`} bg={s.color} align="center" justify="center" minW={0} flexShrink={0} px="0.25rem">
          {s.share >= 0.06 && (
            <Text fontSize="clamp(0.8rem, 1.3vw, 1.35rem)" fontWeight="950" color="white" lineHeight={1} textShadow="0 1px 3px rgba(0,0,0,0.55)" whiteSpace="nowrap" letterSpacing="-0.01em">
              {Math.round(s.share * 100)}%
            </Text>
          )}
        </Flex>
      ))}
    </Flex>
  );
};

const Legend = ({ segments }) => (
  <Flex gap="clamp(0.75rem, 1.4vw, 1.5rem)" rowGap="0.5rem" flexWrap="wrap" flexShrink={0}>
    {segments.map((seg) => (
      <Flex key={seg.key} align="center" gap="0.45rem">
        <Box w="clamp(0.75rem, 1vw, 1rem)" h="clamp(0.75rem, 1vw, 1rem)" bg={seg.color} borderRadius="3px" flexShrink={0} />
        <Text fontSize="clamp(0.68rem, 0.9vw, 0.9rem)" fontWeight="800" color="rgba(255,255,255,0.6)" whiteSpace="nowrap">
          {seg.label}
        </Text>
      </Flex>
    ))}
  </Flex>
);

const SeriesCard = ({ title, segments, awayId, homeId, awayCounts, homeCounts, accent }) => {
  const rows = [
    { id: awayId, shares: toShares(awayCounts, segments) },
    { id: homeId, shares: toShares(homeCounts, segments) },
  ];
  const hasData = rows.some((r) => r.shares);

  return (
    <Box w="full" h="full" bg="var(--part-bg, #141416)" borderRadius="xl" position="relative" overflow="hidden">
      <Box p="clamp(0.875rem, 1.4vw, 1.5rem)" h="full" display="flex" flexDirection="column" gap="clamp(0.75rem, 1.2vw, 1.25rem)">
        {/* Eyebrow — house standard: accent dot, label, hairline. */}
        <Flex align="center" justify="space-between" pb="0.5rem" borderBottom="0.0625rem solid" borderColor="whiteAlpha.100" flexShrink={0}>
          <Flex align="center" gap="0.5rem">
            <Box w="0.375rem" h="0.375rem" bg={accent} borderRadius="full" flexShrink={0} />
            <Text fontSize="clamp(0.68rem, 0.85vw, 0.85rem)" fontWeight="black" color="rgba(255,255,255,0.55)" textTransform="uppercase" letterSpacing="0.16em" lineHeight={1.1}>
              {title}
            </Text>
          </Flex>
          {!hasData && (
            <Text fontSize="clamp(0.45rem, 0.55vw, 0.55rem)" fontWeight="800" color="rgba(255,255,255,0.3)" textTransform="uppercase" letterSpacing="0.14em">
              No series data on file
            </Text>
          )}
        </Flex>

        <Legend segments={segments} />

        {/* Rows take the rest of the card equally; the bar stretches to the row. */}
        <Flex direction="column" gap="clamp(0.625rem, 1vw, 1rem)" flex="1" minH={0}>
          {rows.map((row) => (
            <Grid key={row.id} templateColumns="minmax(4.5rem, 7rem) minmax(0, 1fr)" columnGap="clamp(0.625rem, 1.2vw, 1.25rem)" alignItems="stretch" flex="1" minH={BAR_H}>
              <Flex align="center" gap="0.5rem" minW={0}>
                <Image src={teamLogo(row.id)} alt="" boxSize="clamp(1.4rem, 2vw, 2rem)" objectFit="contain" flexShrink={0} />
                <Text fontSize="clamp(0.9rem, 1.3vw, 1.35rem)" fontWeight="950" color="white" lineClamp={1} letterSpacing="-0.01em">
                  {teamLabel(row.id)}
                </Text>
              </Flex>
              <StackedBar shares={row.shares} />
            </Grid>
          ))}
        </Flex>
      </Box>
    </Box>
  );
};

export const ChainsMovedCard = ({ seriesSummary, awayId, homeId, accent }) => (
  <SeriesCard
    title="When did they move the chains?"
    segments={CHAINS_SEGMENTS}
    awayId={awayId}
    homeId={homeId}
    awayCounts={seriesSummary?.[awayId]?.chains_moved_on ?? null}
    homeCounts={seriesSummary?.[homeId]?.chains_moved_on ?? null}
    accent={accent}
  />
);

export const SeriesResultsCard = ({ seriesSummary, awayId, homeId, accent }) => (
  <SeriesCard
    title="Series Results"
    segments={RESULT_SEGMENTS}
    awayId={awayId}
    homeId={homeId}
    awayCounts={seriesSummary?.[awayId]?.results ?? null}
    homeCounts={seriesSummary?.[homeId]?.results ?? null}
    accent={accent}
  />
);
