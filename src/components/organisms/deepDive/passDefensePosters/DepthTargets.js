import { fgOf, DEPTHS, leagueOf, metricOf, splitRanked, tab, rankOf, rgbOf, pct0, caps, SCOPE, GROUPS } from "./posterModel";
import { usePD } from "./usePassDefensePosterData";
import { Grid, Text, Flex, Box } from "@chakra-ui/react";
import { TeamCell, Poster, Card, KickerRight, Waiting } from "./PosterPrimitives";

// Pass-defense depth and receiving-position target/yards posters.

export const DepthPoster = ({ pal, innerRef }) => {
  const fg = fgOf(pal);
  const { docs, index, ready, error } = usePD();
  const league = Object.fromEntries(DEPTHS.map(([b]) => [b, leagueOf(index, b, "success_allowed")]));
  const rows = docs.map((d) => ({ id: d.team_id, m: metricOf(d, "depth_deep", "success_allowed"), cells: DEPTHS.map(([b]) => metricOf(d, b, "success_allowed")) }));
  const [ranked, unranked] = splitRanked(rows, "lower");
  const max = Math.max(...rows.flatMap((r) => r.cells.map((c) => c?.value ?? 0)), ...Object.values(league).map((v) => v ?? 0), 0.0001) * 1.04;
  const cols = "56px 280px repeat(3, minmax(0,1fr))";
  const Row = ({ r, muted }) => (
    <Grid templateColumns={cols} columnGap="18px" alignItems="center" h="52px" borderBottom={`1px solid ${fg(0.06)}`} opacity={muted ? 0.5 : 1}>
      <Text fontSize="24px" fontWeight="950" fontStyle="italic" color={fg(0.55)} textAlign="right" {...tab}>{rankOf(r.m) ?? "—"}</Text>
      <TeamCell id={r.id} />
      {DEPTHS.map(([b], i) => {
        const c = r.cells[i];
        const lg = league[b];
        const ink = !Number.isFinite(c?.value) || !Number.isFinite(lg) ? fg(0.35) : c.value <= lg ? pal.up : pal.down;
        return (
          <Flex key={b} align="center" gap="10px" minW={0}>
            <Box position="relative" flex={1} h="22px" bg={fg(0.06)}>
              <Box h="full" bg={ink} style={{ width: `${((c?.value ?? 0) / max) * 100}%` }} />
              {Number.isFinite(lg) && <Box position="absolute" top="-5px" bottom="-5px" w={0} borderLeft={`2px dashed rgba(${rgbOf(pal.brand)}, 0.9)`} style={{ left: `${(lg / max) * 100}%` }} />}
            </Box>
            <Text w="58px" fontSize="20px" fontWeight="950" textAlign="right" {...tab}>{pct0(c?.value)}</Text>
          </Flex>
        );
      })}
    </Grid>
  );
  return (
    <Poster pal={pal} innerRef={innerRef} title="Where they" accent="get hit">
      <Card pal={pal} kicker="Passing depth success rate" right={<KickerRight pal={pal}>Dashed = The 18 avg</KickerRight>}>
        {ready ? (
          <Box>
            <Grid templateColumns={cols} columnGap="18px" pb="8px" borderBottom={`2px solid ${fg(0.14)}`}>
              <Box /><Box />
              {DEPTHS.map(([b, label]) => (
                <Text key={b} fontSize="14px" color={fg(0.65)} {...caps}>
                  {label} <Box as="span" color={fg(0.45)}>· The 18 {pct0(league[b])}</Box>
                </Text>
              ))}
            </Grid>
            {ranked.map((r) => <Row key={r.id} r={r} />)}
      {unranked.map((r) => <Row key={r.id} r={r} muted />)}
          </Box>
        ) : <Waiting pal={pal} error={error} />}
      </Card>
    </Poster>
  );
};

export const TargetsPoster = ({ pal, innerRef }) => {
  const fg = fgOf(pal);
  const { receiving, ready, error } = usePD("PD09");
  const inks = { wr: pal.brand, te: pal.teal, rb: pal.orange };
  const rows = Object.entries(receiving?.teams ?? {}).map(([id, t]) => {
    const d = t?.defense?.[SCOPE] ?? {};
    const y = (k) => d[`${k}_yards_per_game`]?.value ?? 0;
    return { id, m: d.pass_yards_per_game, wr: y("wr"), te: y("te"), rb: y("rb"), other: y("other") };
  }).filter((r) => Number.isFinite(r.m?.value));
  const [ranked, unranked] = splitRanked(rows, "lower");
  const avg = receiving?.league?.defense?.[SCOPE]?.pass_yards_per_game;
  const max = Math.max(...rows.map((r) => r.m.value), Number.isFinite(avg) ? avg : 0, 1) * 1.02;
  const cols = "56px 280px minmax(0,1fr) 150px";
  const Row = ({ r, muted }) => (
    <Grid templateColumns={cols} columnGap="16px" alignItems="center" h="52px" borderBottom={`1px solid ${fg(0.06)}`} opacity={muted ? 0.5 : 1}>
      <Text fontSize="24px" fontWeight="950" fontStyle="italic" color={fg(0.55)} textAlign="right" {...tab}>{rankOf(r.m) ?? "—"}</Text>
      <TeamCell id={r.id} />
      <Box position="relative" h="34px">
        <Flex h="full" gap="2px" style={{ width: `${(r.m.value / max) * 100}%` }}>
          {GROUPS.map(([k, label]) => (
            <Flex key={k} align="center" justify="center" bg={inks[k]} minW={0} overflow="hidden" style={{ flex: r[k] }}>
              {r[k] / max >= 0.08 && <Text fontSize="15px" fontWeight="950" color="white" whiteSpace="nowrap" {...tab}>{label} {Math.round(r[k])}</Text>}
            </Flex>
          ))}
          {r.other > 0 && <Box bg={fg(0.22)} style={{ flex: r.other }} />}
        </Flex>
        {Number.isFinite(avg) && <Box position="absolute" top="-6px" bottom="-6px" w={0} borderLeft={`2px dashed rgba(${rgbOf(pal.brand)}, 0.9)`} style={{ left: `${(avg / max) * 100}%` }} />}
      </Box>
      <Text fontSize="26px" fontWeight="950" textAlign="right" whiteSpace="nowrap" {...tab}>
        {r.m.value.toFixed(1)}<Box as="span" ml="4px" fontSize="13px" color={fg(0.55)} {...caps}>yds/g</Box>
      </Text>
    </Grid>
  );
  return (
    <Poster pal={pal} innerRef={innerRef} title="Who they" accent="throw at">
      <Card pal={pal} kicker="Yards allowed to" right={Number.isFinite(avg) ? <KickerRight pal={pal}>Dashed = The 18 avg {avg.toFixed(1)}</KickerRight> : null}>
        {ready && receiving ? (
          <Box>
            {ranked.map((r) => <Row key={r.id} r={r} />)}
            {unranked.map((r) => <Row key={r.id} r={r} muted />)}
          </Box>
        ) : <Waiting pal={pal} error={error} />}
      </Card>
    </Poster>
  );
};
