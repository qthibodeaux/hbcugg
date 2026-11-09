import { Grid, Box, Text, Flex } from "@chakra-ui/react";
import { fgOf, Who, tab, DATA, Logo, lastName } from "../kit";

// What the infographic pages share. Each page has its own composition and lead chart, so the
// eight don't read alike (the user, 2026-11-06); the chart types are in ../infoParts.js.

export const Cols = ({ t, gap = "2px", children, ...rest }) => <Grid templateColumns={t} gap={gap} alignItems="stretch" {...rest}>{children}</Grid>;

// A short ranked bar list. `nameW` narrows it for side columns.
export const Bars = ({ pal, rows, get, fmt, name = (r) => r.name, rowH = 40, nameW = 230 }) => {
  const fg = fgOf(pal);
  const max = Math.max(...rows.map((r) => Math.abs(get(r))), 0.0001);
  return rows.map((r, i) => (
    <Grid key={i} templateColumns={`${nameW}px minmax(0,1fr) 72px`} columnGap="10px" alignItems="center" h={`${rowH}px`} borderBottom={`1px solid ${fg(0.06)}`}>
      <Who pal={pal} id={r.id} name={name(r)} size={26} font="15px" />
      <Box h="14px" bg={fg(0.06)}><Box h="100%" bg={pal.brand} style={{ width: `${(Math.abs(get(r)) / max) * 100}%` }} /></Box>
      <Text fontSize="19px" fontWeight="950" textAlign="right" color={pal.orange} {...tab}>{fmt(get(r))}</Text>
    </Grid>
  ));
};

export const teamOf = (id) => DATA.team_yoy.find((t) => t.id === id);

export const who15 = (pal) => (r) => <Who pal={pal} id={r.id} name={r.name} size={26} font="15px" />;

export const pairWho = (pal) => (r) => (
  <Flex align="center" gap="8px" minW={0}>
    <Logo id={r.id} size={26} />
    <Text fontSize="15px" fontWeight="900" textTransform="uppercase" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{lastName(r.qb)} to {lastName(r.wr)}</Text>
  </Flex>
);
