import { DATA, one, pct, epa, fgOf, RPoster, caps, tab, Scatter } from "../kit";
import { Grid, Box, Text } from "@chakra-ui/react";

// Receiver and team-height posters using the existing published buckets and formatters.

const HEIGHT_ROWS = [
  ["All targets", "Target depth", DATA.height_all, (r) => r.adot, one],
  ["All targets", "Deep share", DATA.height_all, (r) => r.deep_share, pct],
  ["Deep targets", "Catch rate", DATA.height_deep, (r) => r.catch, pct],
  ["Deep targets", "Yards per target", DATA.height_deep, (r) => r.ypt, one],
  ["Deep targets", "EPA per target", DATA.height_deep, (r) => r.epa, epa],
  ["Short targets", "After the catch", DATA.height_short, (r) => r.yac, one],
];

export const HeightInfo = (props) => {
  const { pal } = props;
  const fg = fgOf(pal);
  const cols = "270px repeat(5, minmax(0,1fr))";
  return (
    <RPoster {...props} title="Does height matter">
      <Grid templateColumns={cols} columnGap="10px" pb="10px" borderBottom={`2px solid ${fg(0.15)}`}>
        <Box />
        {DATA.height_all.map((b) => <Text key={b.bucket} fontSize="20px" fontWeight="950" textAlign="center" textTransform="uppercase">{b.bucket}</Text>)}
      </Grid>
      {HEIGHT_ROWS.map(([group, label, rows, get, fmt]) => {
        const max = Math.max(...rows.map(get));
        return (
          <Grid key={`${group}${label}`} templateColumns={cols} columnGap="10px" alignItems="center" h="96px" borderBottom={`1px solid ${fg(0.06)}`}>
            <Box>
              <Text fontSize="14px" color={fg(0.55)} {...caps}>{group}</Text>
              <Text fontSize="21px" fontWeight="950" lineHeight={1.1} textTransform="uppercase">{label}</Text>
            </Box>
            {rows.map((r) => (
              <Text key={r.bucket} fontSize="40px" fontWeight="950" textAlign="center" color={get(r) === max ? pal.up : undefined} {...tab}>{fmt(get(r))}</Text>
            ))}
          </Grid>
        );
      })}
    </RPoster>
  );
};

const heightFmt = (v) => `${Math.floor(v / 12)}-${(v % 12).toFixed(1)}`;

export const TeamHeight = (props) => (
  <RPoster {...props} title="Receiver height × target depth">
    <Scatter pal={props.pal} rows={DATA.team_height} x={(r) => r.height} y={(r) => r.adot} xFmt={heightFmt} yFmt={(v) => v.toFixed(1)} xLabel="Average receiver height, by targets" yLabel="Target depth" />
  </RPoster>
);
