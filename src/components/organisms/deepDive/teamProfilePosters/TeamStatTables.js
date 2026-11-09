import { T, fgOf, tab, caps, toneOf } from "./posterPresentation";
import { fix, pct, advOf, LABEL, fmtKey, rankText } from "../teamProfileModel";
import { Box, Grid, Text, Flex } from "@chakra-ui/react";
import { HeadRow, Rank, Card } from "./PosterPrimitives";

const ADV_KEYS = [
  "adj_epa_per_play", "epa_per_play", "success_rate", "explosive_rate", "epa_per_pass", "epa_per_rush",
  "standard_down_success", "passing_down_success", "third_fourth_success", "points_per_opportunity",
  "red_zone_td_rate", "line_yards", "stuff_rate", "sack_rate", "havoc_rate", "average_start",
];

const countingRows = (side) => {
  const c = T[side].counting;
  const t = c.totals;
  const r = c.per_game_ranks;
  const allowed = side === "defense";
  const cv = t.conversions;
  return [
    { label: allowed ? "Points allowed / game" : "Points / game", value: fix(t.scoring.avg_g), rank: r["scoring.avg_g"] },
    { label: allowed ? "Yards allowed / game" : "Yards / game", value: fix(t.totals.avg_g), rank: r["totals.avg_g"] },
    { label: "Rushing", value: `${t.rushing.att} for ${t.rushing.yds} · ${fix(t.rushing.avg)} · ${t.rushing.td} TD`, rank: r["rushing.avg_g"] },
    { label: "Passing", value: `${t.passing.cmp} of ${t.passing.att} · ${t.passing.yds} · ${t.passing.td} TD · ${t.passing.int} INT`, rank: r["passing.avg_g"] },
    { label: "3rd down", value: `${cv.third.conv} of ${cv.third.att} · ${pct(cv.third.pct)}` },
    { label: "4th down", value: `${cv.fourth.conv} of ${cv.fourth.att}` },
    { label: "Red zone", value: `${cv.red_zone.td} TD · ${cv.red_zone.fg} FG on ${cv.red_zone.att} trips` },
    { label: "First downs", value: String(t.misc.first_downs) },
    { label: allowed ? "Opponent fumbles lost" : "Fumbles lost", value: String(t.misc.fum_lost) },
    { label: "Penalties (all units)", value: `${t.misc.pen} for ${t.misc.pen_yds}` },
  ];
};

const CountingTable = ({ pal, side }) => {
  const fg = fgOf(pal);
  const cols = "minmax(0,0.9fr) minmax(0,1.6fr) 56px";
  return (
    <Box>
      <HeadRow pal={pal} cols={cols} labels={["Counting · 5 league games", "", "Rank"]} align={["left", "right", "right"]} />
      {countingRows(side).map((row) => (
        <Grid key={row.label} templateColumns={cols} columnGap="14px" alignItems="center" h="36px" borderBottom={`1px solid ${fg(0.06)}`}>
          <Text fontSize="15px" fontWeight="800" color={fg(0.7)} whiteSpace="nowrap">{row.label}</Text>
          <Text fontSize="17px" fontWeight="900" textAlign="right" whiteSpace="nowrap" {...tab}>{row.value}</Text>
          {row.rank ? <Rank pal={pal} r={row.rank} size="15px" /> : <Box />}
        </Grid>
      ))}
    </Box>
  );
};

const AdvancedTable = ({ pal, side }) => {
  const fg = fgOf(pal);
  const cols = "minmax(0,1fr) 90px 56px 90px";
  return (
    <Box>
      <HeadRow pal={pal} cols={cols} labels={["Advanced", "2026", "Rank", "2025"]} align={["left"]} />
      {ADV_KEYS.map((k) => {
        const a = advOf(side, k);
        if (!a) return null;
        return (
          <Grid key={k} templateColumns={cols} columnGap="14px" alignItems="center" h="36px" borderBottom={`1px solid ${fg(0.06)}`}>
            <Text fontSize="15px" fontWeight="800" color={fg(0.7)} whiteSpace="nowrap">{LABEL[k]}</Text>
            <Text fontSize="17px" fontWeight="900" textAlign="right" {...tab}>{fmtKey(k, a.value)}</Text>
            <Rank pal={pal} r={a} size="15px" />
            <Text fontSize="15px" fontWeight="800" color={fg(0.45)} textAlign="right" {...tab}>{fmtKey(k, a.prior_season)}</Text>
          </Grid>
        );
      })}
    </Box>
  );
};

export const SideColumns = ({ pal }) => (
  <Grid templateColumns="minmax(0,1fr) minmax(0,1fr)" gap="2px">
    {["offense", "defense"].map((side) => (
      <Card key={side} pal={pal} kicker={side === "offense" ? "Offense" : "Defense"}>
        <CountingTable pal={pal} side={side} />
        <Box h="22px" />
        <AdvancedTable pal={pal} side={side} />
      </Card>
    ))}
  </Grid>
);

const BIG = (side) => {
  const t = T[side].counting.totals;
  const r = T[side].counting.per_game_ranks;
  return [
    { label: side === "offense" ? "Points / game" : "Allowed / game", value: fix(t.scoring.avg_g), rank: r["scoring.avg_g"] },
    { label: "Yards / game", value: fix(t.totals.avg_g), rank: r["totals.avg_g"] },
    { label: "Yards / carry", value: fix(t.rushing.avg) },
    { label: "Passing", value: `${t.passing.cmp}/${t.passing.att}` },
    { label: side === "offense" ? "INT thrown" : "Interceptions", value: String(t.passing.int) },
  ];
};

const BigRow = ({ pal, side }) => {
  const fg = fgOf(pal);
  return (
    <Grid templateColumns="repeat(5, minmax(0,1fr))" gap="10px">
      {BIG(side).map((b) => (
        <Box key={b.label}>
          <Text fontSize="12px" color={fg(0.55)} {...caps}>{b.label}</Text>
          <Flex align="baseline" gap="8px">
            <Text fontSize="34px" fontWeight="950" fontStyle="italic" lineHeight={1.05} {...tab}>{b.value}</Text>
            {b.rank && <Rank pal={pal} r={b.rank} size="14px" />}
          </Flex>
        </Box>
      ))}
    </Grid>
  );
};

export const MirrorTable = ({ pal }) => {
  const fg = fgOf(pal);
  const cols = "80px 56px 90px minmax(0,1fr) 90px 56px 80px";
  const align = ["right", "right", "right", "center", "left", "left", "left"];
  return (
    <Card pal={pal} kicker="Offense · Defense">
      <Grid templateColumns="minmax(0,1fr) minmax(0,1fr)" columnGap="48px" mb="18px">
        <Box><Text fontSize="20px" fontWeight="950" mb="6px" {...caps}>Offense</Text><BigRow pal={pal} side="offense" /></Box>
        <Box><Text fontSize="20px" fontWeight="950" mb="6px" {...caps}>Defense</Text><BigRow pal={pal} side="defense" /></Box>
      </Grid>
      <HeadRow pal={pal} cols={cols} align={align} labels={["2025", "Rank", "Offense", "", "Defense", "Rank", "2025"]} />
      {ADV_KEYS.map((k) => {
        const o = advOf("offense", k);
        const d = advOf("defense", k);
        return (
          <Grid key={k} templateColumns={cols} columnGap="14px" alignItems="center" h="38px" borderBottom={`1px solid ${fg(0.06)}`}>
            <Text fontSize="15px" fontWeight="800" color={fg(0.45)} textAlign="right" {...tab}>{fmtKey(k, o?.prior_season)}</Text>
            <Rank pal={pal} r={o} size="15px" />
            <Text fontSize="19px" fontWeight="950" textAlign="right" {...tab}>{fmtKey(k, o?.value)}</Text>
            <Text fontSize="14px" color={fg(0.7)} textAlign="center" whiteSpace="nowrap" {...caps}>{LABEL[k]}</Text>
            <Text fontSize="19px" fontWeight="950" {...tab}>{fmtKey(k, d?.value)}</Text>
            <Text fontSize="15px" fontWeight="900" color={toneOf(pal, d)} {...tab}>{rankText(d)}</Text>
            <Text fontSize="15px" fontWeight="800" color={fg(0.45)} {...tab}>{fmtKey(k, d?.prior_season)}</Text>
          </Grid>
        );
      })}
    </Card>
  );
};
