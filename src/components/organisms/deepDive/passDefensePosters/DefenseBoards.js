import { pct1, fgOf, splitRanked, tab, rankOf, rgbOf, metricOf, leagueOf } from "./posterModel";
import { Grid, Text, Box } from "@chakra-ui/react";
import { TeamCell, Poster, Card, AvgNote, Waiting } from "./PosterPrimitives";
import { usePD } from "./usePassDefensePosterData";

// Pass-defense rate boards and module-initialized board-poster factory.

export const RateBoard = ({ pal, rows, better, avg, fmt = pct1, extra }) => {
  const fg = fgOf(pal);
  const [ranked, unranked] = splitRanked(rows, better);
  const max = Math.max(...[...ranked, ...unranked].map((r) => r.m.value), Number.isFinite(avg) ? avg : 0, 0.0001) * 1.04;
  const cols = `56px 280px minmax(0,1fr) 120px ${extra ? "170px" : "130px"}`;
  // Green when the team is better than The 18's average, red when worse.
  const inkOf = (v) => (!Number.isFinite(avg) ? pal.orange : (better === "lower" ? v <= avg : v >= avg) ? pal.up : pal.down);
  const Row = ({ r, muted }) => (
    <Grid templateColumns={cols} columnGap="16px" alignItems="center" h="52px" borderBottom={`1px solid ${fg(0.06)}`} opacity={muted ? 0.5 : 1}>
      <Text fontSize="24px" fontWeight="950" fontStyle="italic" color={fg(0.55)} textAlign="right" {...tab}>{rankOf(r.m) ?? "—"}</Text>
      <TeamCell id={r.id} />
      <Box position="relative" h="28px" bg={fg(0.06)}>
        <Box h="full" bg={muted ? fg(0.35) : inkOf(r.m.value)} style={{ width: `${(r.m.value / max) * 100}%` }} />
        {Number.isFinite(avg) && <Box position="absolute" top="-6px" bottom="-6px" w={0} borderLeft={`2px dashed rgba(${rgbOf(pal.brand)}, 0.9)`} style={{ left: `${(avg / max) * 100}%` }} />}
      </Box>
      <Text fontSize="28px" fontWeight="950" textAlign="right" color={inkOf(r.m.value)} {...tab}>{fmt(r.m.value)}</Text>
      <Text fontSize="17px" fontWeight="800" color={fg(0.6)} textAlign="right" whiteSpace="nowrap" {...tab}>
        {extra ? extra(r) : r.m.numerator != null && r.m.n != null ? `${r.m.numerator} of ${r.m.n}` : ""}
      </Text>
    </Grid>
  );
  return (
    <Box>
      {ranked.map((r) => <Row key={r.id} r={r} />)}
      {unranked.map((r) => <Row key={r.id} r={r} muted />)}
    </Box>
  );
};

export const boardPoster = ({ title, accent, kicker, bucket, measure, better, fmt, visual }) => {
  const BoardPoster = ({ pal, innerRef }) => {
  const { docs, index, ready, error } = usePD(visual);
  const rows = docs.map((d) => ({ id: d.team_id, m: metricOf(d, bucket, measure) }));
  const avg = leagueOf(index, bucket, measure);
  return (
    <Poster pal={pal} innerRef={innerRef} title={title} accent={accent}>
      <Card pal={pal} kicker={kicker} right={<AvgNote pal={pal} avg={avg} fmt={fmt} />}>
        {ready ? <RateBoard pal={pal} rows={rows} better={better} avg={avg} fmt={fmt} /> : <Waiting pal={pal} error={error} />}
      </Card>
    </Poster>
  );
  };
  return BoardPoster;
};
