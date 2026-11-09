import { fgOf, metricOf, splitRanked, SCOPE, tab, rankOf, pct0, caps } from "./posterModel";
import { usePD } from "./usePassDefensePosterData";
import { Grid, Text, Box, Flex } from "@chakra-ui/react";
import { TeamCell, Poster, Card, KickerRight, Waiting } from "./PosterPrimitives";

// Pass-defense first/second-half comparison poster with existing league reference values.

export const HalftimePoster = ({ pal, innerRef }) => {
  const fg = fgOf(pal);
  const { docs, index, ready, error } = usePD();
  const rows = docs.map((d) => {
    const m = metricOf(d, "halftime_change", "success_allowed_change");
    return { id: d.team_id, m, a: m?.first_half?.value, b: m?.second_half?.value };
  }).filter((r) => Number.isFinite(r.a) && Number.isFinite(r.b));
  const [ranked, unranked] = splitRanked(rows, "lower");
  const lg = index?.league?.all?.[SCOPE]?.halftime_change?.metrics?.success_allowed_change;
  const vals = rows.flatMap((r) => [r.a, r.b]);
  const lo = Math.floor((Math.min(...vals, 1) - 0.02) * 20) / 20;
  const hi = Math.ceil((Math.max(...vals, 0) + 0.02) * 20) / 20;
  const at = (v) => `${((v - lo) / (hi - lo || 1)) * 100}%`;
  const cols = "56px 280px minmax(0,1fr) 130px";
  const Row = ({ r, muted }) => {
    const better = r.b < r.a;
    const ink = better ? pal.up : pal.down;
    return (
      <Grid templateColumns={cols} columnGap="16px" alignItems="center" h="52px" borderBottom={`1px solid ${fg(0.06)}`} opacity={muted ? 0.5 : 1}>
        <Text fontSize="24px" fontWeight="950" fontStyle="italic" color={fg(0.55)} textAlign="right" {...tab}>{rankOf(r.m) ?? "—"}</Text>
        <TeamCell id={r.id} />
        <Box position="relative" h="34px">
          <Box position="absolute" top="50%" h="4px" mt="-2px" bg={ink} style={{ left: at(Math.min(r.a, r.b)), width: `calc(${at(Math.max(r.a, r.b))} - ${at(Math.min(r.a, r.b))})` }} />
          <Box position="absolute" top="50%" w="18px" h="18px" mt="-9px" ml="-9px" borderRadius="full" bg={pal.panel} border={`4px solid ${fg(0.45)}`} style={{ left: at(r.a) }} />
          <Box position="absolute" top="50%" w="22px" h="22px" mt="-11px" ml="-11px" borderRadius="full" bg={ink} style={{ left: at(r.b) }} />
        </Box>
        <Text fontSize="22px" fontWeight="950" textAlign="right" whiteSpace="nowrap" {...tab}>
          <Box as="span" color={fg(0.45)}>{pct0(r.a)} → </Box><Box as="span" color={ink}>{pct0(r.b)}</Box>
        </Text>
      </Grid>
    );
  };
  return (
    <Poster pal={pal} innerRef={innerRef} title="After" accent="halftime">
      <Card pal={pal} kicker="Passing success allowed first half vs second half"
        right={lg ? <KickerRight pal={pal}>The 18 avg {pct0(lg.first_half?.value)} → {pct0(lg.second_half?.value)}</KickerRight> : null}>
        {ready ? (
          <Box>
            <Grid templateColumns={cols} columnGap="16px" pb="6px">
              <Box /><Box />
              <Flex justify="space-between">
                <Text fontSize="13px" color={fg(0.5)} {...caps}>{pct0(lo)}</Text>
                <Text fontSize="13px" color={fg(0.5)} {...caps}>{pct0(hi)}</Text>
              </Flex>
              <Box />
            </Grid>
            {ranked.map((r) => <Row key={r.id} r={r} />)}
      {unranked.map((r) => <Row key={r.id} r={r} muted />)}
          </Box>
        ) : <Waiting pal={pal} error={error} />}
      </Card>
    </Poster>
  );
};
