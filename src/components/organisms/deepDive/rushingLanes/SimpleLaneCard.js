import { teamAccent, teamLogo } from "../../../game/export/exportData";
import { fgOf, tab, int, caps, rankInk, tdInk } from "../gridPosterKit";
import { SPAN, ZERO, RANKS, LANES, teamPairOf } from "./lanePresentation";
import { Flex, Text, Box, Image, Grid } from "@chakra-ui/react";
import { PLOT_H, Seg } from "./DetailedLaneCard";
import { shortOf } from "../deepDiveModel";

const SimpleLane = ({ pal, lane, name, colors }) => {
  const fg = fgOf(pal);
  const loss = Math.abs(lane.loss_yards);
  const line = lane.line_yards_on_gains;
  const hl = lane.highlight_yards_on_gains;
  const pc = (v) => (v / SPAN) * 100;
  return (
    <Flex direction="column" align="center" minW={0}>
      <Text fontSize="24px" fontWeight="950" lineHeight={1} {...tab}>{int(lane.yards)}</Text>
      <Text mt="2px" mb="6px" fontSize="11px" fontWeight="800" color={fg(0.6)} lineHeight={1} {...tab}>{lane.attempts} car</Text>
      <Box position="relative" w="full" bg={fg(0.05)} borderRadius="4px" overflow="hidden" style={{ height: `${PLOT_H}px` }}>
        <Seg bottom={ZERO - pc(loss)} height={pc(loss)} color={pal.down} />
        <Seg bottom={ZERO} height={pc(line)} color={colors[0]} />
        <Seg bottom={ZERO + pc(line)} height={pc(hl)} color={colors[1]} />
        <Box position="absolute" left={0} right={0} h="2px" bg={fg(0.55)} style={{ bottom: `${ZERO}%` }} />
      </Box>
      <Text mt="6px" fontSize="12px" color={fg(0.8)} lineHeight={1} {...caps}>{name}</Text>
    </Flex>
  );
};

export const SimpleCard = ({ pal, t }) => {
  const fg = fgOf(pal);
  const r = RANKS[t.team_id];
  const o = t.totals;
  const colors = teamPairOf(t.team_id, pal);
  const small = (value, unit, ink) => (
    <Text fontSize="17px" fontWeight="950" lineHeight={1} color={ink} whiteSpace="nowrap" {...tab}>
      {value}<Box as="span" ml="3px" fontSize="9px" color={fg(0.5)} {...caps}>{unit}</Box>
    </Text>
  );
  return (
    <Flex direction="column" bg={pal.panel} px="14px" pt="12px" pb="14px" minW={0} gap="12px" style={{ borderTop: `4px solid ${teamAccent(t.team_id)}` }}>
      <Flex align="center" justify="space-between" gap="10px">
        <Flex align="center" gap="9px" minW={0}>
          <Image src={teamLogo(t.team_id)} alt="" w="30px" h="30px" objectFit="contain" flexShrink={0} />
          <Text fontSize="24px" fontWeight="950" textTransform="uppercase" letterSpacing="-0.01em" lineHeight={1} whiteSpace="nowrap">{shortOf(t.team_id)}</Text>
        </Flex>
        <Flex align="baseline" gap="12px" flexShrink={0}>
          <Text fontSize="30px" fontWeight="950" fontStyle="italic" color={pal.orange} lineHeight={0.95} letterSpacing="-0.03em" {...tab}>
            {int(o.yards)}<Box as="span" ml="3px" fontSize="10px" fontStyle="normal" color={fg(0.5)} {...caps}>yds</Box>
          </Text>
          <Text fontSize="13px" fontWeight="900" color={rankInk(r.yards, pal)} ml="-6px">#{r.yards}</Text>
          {small(o.carries, "car")}
          {small(o.touchdowns, "TD", tdInk(pal))}
        </Flex>
      </Flex>
      <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap="10px">
        {LANES.map(([dir, name]) => <SimpleLane key={dir} pal={pal} lane={t.lanes.find((l) => l.direction === dir)} name={name} colors={colors} />)}
      </Grid>
    </Flex>
  );
};
