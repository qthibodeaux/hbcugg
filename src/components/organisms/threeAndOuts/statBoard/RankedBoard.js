import { fgOf, tab, logoOf, shortOf, pct1, caps } from "./boardPresentation";
import { Text, Grid, Image, Box } from "@chakra-ui/react";

// Ranked stat-board rows and league-relative bars.

const Move = ({ pal, row }) => {
  const fg = fgOf(pal);
  if (row.rank_prev_week == null || row.rank_prev_week === row.rank) return <Text fontSize="0.75em" fontWeight="900" color={fg(0.3)} textAlign="center">–</Text>;
  const up = row.rank < row.rank_prev_week;
  return (
    <Text fontSize="0.75em" fontWeight="900" color={up ? pal.up : pal.down} whiteSpace="nowrap" textAlign="center" {...tab}>
      {up ? "▲" : "▼"}{Math.abs(row.rank_prev_week - row.rank)}
    </Text>
  );
};

const rowCols = (stat) => `1.8em 1.8em 2.2em 4.6em minmax(0,1fr) 4.2em 3.6em${stat.allThird ? " 3.2em" : ""}`;

const BoardRow = ({ pal, stat, row, side, maxDev }) => {
  const fg = fgOf(pal);
  const dev = side.better === "lower" ? side.league.rate_pct - row.rate_pct : row.rate_pct - side.league.rate_pct;
  const ink = dev >= 0 ? pal.up : pal.down;
  const w = `${(Math.abs(dev) / maxDev) * 50}%`;
  return (
    <Grid templateColumns={rowCols(stat)} columnGap="0.55em" alignItems="center" h="2.6em" borderBottom={`1px solid ${fg(0.06)}`}>
      <Text fontSize="1em" fontWeight="900" color={fg(0.5)} textAlign="right" {...tab}>{row.rank}</Text>
      <Move pal={pal} row={row} />
      <Image src={logoOf(row.team_id)} alt="" w="2em" h="2em" objectFit="contain" />
      <Text fontSize="1.05em" fontWeight="950" fontStyle="italic" textTransform="uppercase" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{shortOf(row.team_id)}</Text>
      <Box position="relative" h="0.9em">
        <Box position="absolute" left="50%" top="-0.45em" bottom="-0.45em" w="2px" bg={fg(0.25)} />
        <Box position="absolute" top={0} bottom={0} bg={ink} style={dev >= 0 ? { left: "50%", width: w, borderRadius: "0 3px 3px 0" } : { right: "50%", width: w, borderRadius: "3px 0 0 3px" }} />
      </Box>
      <Text fontSize="1.3em" fontWeight="950" fontStyle="italic" color={ink} textAlign="right" letterSpacing="-0.02em" whiteSpace="nowrap" {...tab}>{pct1(row.rate_pct)}</Text>
      <Text fontSize="0.75em" fontWeight="800" color={fg(0.5)} textAlign="right" whiteSpace="nowrap" {...tab}>{row[stat.count]}/{row[stat.n]}</Text>
      {stat.allThird && <Text fontSize="0.8em" fontWeight="900" color={fg(0.55)} textAlign="right" whiteSpace="nowrap" {...tab}>{row.all_third_down ? `${Math.round(row.all_third_down.rate_pct)}%` : "—"}</Text>}
    </Grid>
  );
};

export const Board = ({ pal, stat, side, rows, cols, noGames }) => {
  const fg = fgOf(pal);
  const perCol = Math.ceil(rows.length / cols);
  const columns = Array.from({ length: cols }, (_, c) => rows.slice(c * perCol, (c + 1) * perCol));
  const maxDev = Math.max(...rows.map((r) => Math.abs(r.rate_pct - side.league.rate_pct)), 1);
  return (
    <Box>
      <Grid templateColumns={`repeat(${cols}, minmax(0,1fr))`} columnGap="2.4em">
        {columns.map((col, c) => (
          <Box key={c} minW={0}>
            <Grid templateColumns={rowCols(stat)} columnGap="0.55em" pb="0.4em" borderBottom={`2px solid ${fg(0.14)}`}>
              <Box gridColumn="span 4" />
              <Text fontSize="0.7em" color={fg(0.6)} textAlign="center" whiteSpace="nowrap" {...caps}>League {pct1(side.league.rate_pct)}</Text>
              <Box gridColumn="span 2" />
              {stat.allThird && <Text fontSize="0.62em" color={fg(0.6)} textAlign="right" whiteSpace="nowrap" {...caps}>All 3rd</Text>}
            </Grid>
            {col.map((r) => <BoardRow key={r.team_id} pal={pal} stat={stat} row={r} side={side} maxDev={maxDev} />)}
          </Box>
        ))}
      </Grid>
      {noGames.length > 0 && (
        <Text mt="0.8em" fontSize="0.75em" color={fg(0.5)} {...caps}>No games yet: {noGames.map(shortOf).join(", ")}</Text>
      )}
    </Box>
  );
};
