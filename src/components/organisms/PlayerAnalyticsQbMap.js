import { useQbMap } from "../../hooks/useQbMapData";
import { SEASON, TEAM_BY_V5, signed, pct1 } from "./qbMap/qbMapPresentation";
import { useState, useRef, useMemo } from "react";
import { teamInDivision } from "./PlayerAnalyticsSearchRow";
import { Text, Box, Flex, Grid } from "@chakra-ui/react";
import { ExportCardButton } from "./stats/ExportCardButton";
import { KeyHead, KeyRow } from "./qbMap/QbMapKey";
import { QbPlot } from "./qbMap/QbPlot";
import { QbMapPoster } from "./qbMap/QbMapPoster";

// ── Page ─────────────────────────────────────────────────────────────────────
const PlayerAnalyticsQbMap = ({ division }) => {
  const { data, isLoading } = useQbMap(SEASON);
  const [hover, setHover] = useState(null);
  const posterRef = useRef(null);

  const players = useMemo(
    () => (data?.players || []).filter((p) => teamInDivision(TEAM_BY_V5[p.team_id], division)),
    [data, division],
  );

  if (isLoading) {
    return <Text fontSize="sm" color="text.muted" py={10} textAlign="center">Loading QB map…</Text>;
  }
  if (!data) return null;

  const { qualification, measure } = data;
  const hovered = players.find((p) => p.rank === hover) || null;

  return (
    <Box>
      <Flex align="flex-end" justify="space-between" gap={3} mb={4} wrap="wrap">
        <Box minW={0}>
          <Text fontSize="clamp(1.6rem, 3.2vw, 2.6rem)" fontWeight="900" fontStyle="italic" color="var(--gg-ink)" textTransform="uppercase" letterSpacing="-0.03em" lineHeight={0.95}>
            The {data.season} Quarterback Map
          </Text>
          <Text fontSize="sm" fontWeight="700" color="text.secondary" mt={2}>
            {players.length} quarterbacks · Min. {qualification.min_dropbacks} non-garbage-time dropbacks
            {data.through_date && ` · Through ${data.through_date}`}
          </Text>
        </Box>
        {players.length > 0 && (
          <ExportCardButton target={posterRef} filename={() => `qb-map-${data.season}${division && division !== "all" ? `-${division}` : ""}.png`.toLowerCase()} />
        )}
      </Flex>

      {players.length === 0 ? (
        <Text fontSize="sm" color="text.muted" py={10} textAlign="center">No quarterback has {qualification.min_dropbacks} dropbacks yet.</Text>
      ) : (
        <Grid templateColumns={{ base: "minmax(0,1fr)", lg: "minmax(0,22rem) minmax(0,1fr)" }} gap={4} alignItems="start">
          <Box bg="bg.secondary" border="1px solid" borderColor="line" borderRadius="lg" py={2} overflowY="auto" style={{ maxHeight: "min(46rem, 85vh)" }}>
            <Text px={3} pb={2} fontSize="10px" fontWeight="900" color="text.muted" textTransform="uppercase" letterSpacing="0.12em">
              Numbered key · EPA per dropback, highest first
            </Text>
            <KeyHead />
            {players.map((p) => (
              <KeyRow key={p.player_id} p={p} team={TEAM_BY_V5[p.team_id]} active={hover === p.rank} onHover={setHover} />
            ))}
          </Box>

          <Box bg="bg.secondary" border="1px solid" borderColor="line" borderRadius="lg" p={2} position="relative">
            <QbPlot data={data} players={players} hover={hover} setHover={setHover} W={760} H={720} />
            {hovered && (
              <Box position="absolute" top={3} right={3} bg="bg.primary" border="1px solid" borderColor="line.strong" borderRadius="md" px={3} py={2} pointerEvents="none">
                <Text fontSize="sm" fontWeight="900" color="text.primary">{hovered.rank}. {hovered.name}</Text>
                <Text fontSize="xs" color="text.secondary">
                  {TEAM_BY_V5[hovered.team_id]?.shortName || hovered.team_id}
                  {hovered.class_year && ` · ${hovered.class_year}`}
                </Text>
                <Text fontSize="xs" color="text.secondary" mt={1}>
                  EPA/dropback {signed(hovered.epa_per_dropback)} · Success {pct1(hovered.success_rate)} · {hovered.dropbacks} dropbacks
                </Text>
                <Text fontSize="xs" color="text.secondary">
                  {hovered.completions}/{hovered.attempts} · {hovered.pass_yards} yds · {hovered.pass_tds} TD · {hovered.interceptions} INT
                </Text>
              </Box>
            )}
          </Box>
        </Grid>
      )}

      {measure?.length > 0 && (
        <Box mt={4}>
          <Text fontSize="10px" fontWeight="900" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" mb={1}>How we measure</Text>
          {measure.map((m) => (
            <Text key={m.label} fontSize="xs" color="text.secondary">
              <Text as="span" fontWeight="bold">{m.label}:</Text> {m.text}
            </Text>
          ))}
        </Box>
      )}

      {/* Export source: off screen, fixed size. */}
      {players.length > 0 && (
        <Box position="fixed" left="-20000px" top={0} aria-hidden="true" pointerEvents="none">
          <QbMapPoster data={data} players={players} posterRef={posterRef} />
        </Box>
      )}
    </Box>
  );
};

export default PlayerAnalyticsQbMap;
