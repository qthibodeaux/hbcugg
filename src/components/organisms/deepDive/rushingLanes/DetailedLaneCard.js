import { Flex, Text, Box, Image, Grid } from "@chakra-ui/react";
import { tab, fgOf, int, caps, rankInk, Stat, one, pct, successInk, epa, tdInk, surnameOf } from "../gridPosterKit";
import { SPAN, ZERO, RANKS, LANES, inkOn, teamPairOf } from "./lanePresentation";
import { teamAccent, teamLogo } from "../../../game/export/exportData";
import { shortOf } from "../deepDiveModel";

export const PLOT_H = 150;

export const Seg = ({ bottom, height, color, value, ink }) => (
  <Flex position="absolute" left={0} right={0} align="center" justify="center" bg={color} overflow="hidden" style={{ bottom: `${bottom}%`, height: `${height}%` }}>
    {value != null && height > 11 && <Text fontSize="12px" fontWeight="950" color={ink} lineHeight={1} {...tab}>{Math.round(value)}</Text>}
  </Flex>
);

const LaneColumn = ({ pal, lane, name, colors }) => {
  const fg = fgOf(pal);
  const loss = Math.abs(lane.loss_yards);
  const line = lane.line_yards_on_gains;
  const hl = lane.highlight_yards_on_gains;
  const pc = (v) => (v / SPAN) * 100;
  return (
    <Flex direction="column" align="center" minW={0}>
      <Text fontSize="19px" fontWeight="950" lineHeight={1} {...tab}>{int(lane.yards)}</Text>
      <Text mt="2px" mb="5px" fontSize="10px" fontWeight="800" color={fg(0.6)} lineHeight={1} {...tab}>{lane.attempts} car</Text>
      <Box position="relative" w="full" bg={fg(0.05)} borderRadius="4px" overflow="hidden" style={{ height: `${PLOT_H}px` }}>
        <Seg bottom={ZERO - pc(loss)} height={pc(loss)} color={pal.down} />
        <Seg bottom={ZERO} height={pc(line)} color={colors[0]} value={line} ink={inkOn(colors[0], pal)} />
        <Seg bottom={ZERO + pc(line)} height={pc(hl)} color={colors[1]} value={hl} ink={inkOn(colors[1], pal)} />
        <Box position="absolute" left={0} right={0} h="2px" bg={fg(0.55)} style={{ bottom: `${ZERO}%` }} />
      </Box>
      <Text mt="5px" fontSize="11px" color={fg(0.8)} lineHeight={1} {...caps}>{name}</Text>
    </Flex>
  );
};

const Swatch = ({ color, label, pal }) => (
  <Flex align="center" gap="5px">
    <Box w="10px" h="10px" borderRadius="2px" bg={color} />
    <Text fontSize="9px" color={fgOf(pal)(0.6)} {...caps}>{label}</Text>
  </Flex>
);

export const TeamCard = ({ pal, t }) => {
  const fg = fgOf(pal);
  const r = RANKS[t.team_id];
  const o = t.totals;
  const COLS = "minmax(0,1fr) 38px 52px 40px 50px 44px";
  const colors = teamPairOf(t.team_id, pal);
  return (
    <Flex direction="column" bg={pal.panel} px="14px" pt="12px" pb="12px" minW={0} gap="10px" style={{ borderTop: `4px solid ${teamAccent(t.team_id)}` }}>
      <Flex align="center" justify="space-between" gap="10px">
        <Flex align="center" gap="9px" minW={0}>
          <Image src={teamLogo(t.team_id)} alt="" w="36px" h="36px" objectFit="contain" flexShrink={0} />
          <Text fontSize="30px" fontWeight="950" textTransform="uppercase" letterSpacing="-0.01em" lineHeight={1} whiteSpace="nowrap">{shortOf(t.team_id)}</Text>
        </Flex>
        <Flex align="baseline" gap="7px" flexShrink={0}>
          <Text fontSize="40px" fontWeight="950" fontStyle="italic" color={pal.orange} lineHeight={0.95} letterSpacing="-0.03em" {...tab}>{int(o.yards)}</Text>
          <Text fontSize="13px" fontWeight="900" color={rankInk(r.yards, pal)}>#{r.yards}</Text>
        </Flex>
      </Flex>

      <Grid templateColumns="minmax(0, 1fr) minmax(0, 1fr)" gap="14px" alignItems="stretch">
        <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap="12px 10px" alignContent="space-between">
          <Stat pal={pal} label="YPC" value={one(o.yards_per_carry)} rank={r.yards_per_carry} />
          <Stat pal={pal} label="Succ" value={pct(o.success_rate)} rank={r.success_rate} ink={successInk(pal)} />
          <Stat pal={pal} label="Stuff" value={pct(o.stuff_rate)} rank={r.stuff_rate} />
          <Stat pal={pal} label="EPA/C" value={epa(o.epa_per_carry)} rank={r.epa_per_carry} />
          <Stat pal={pal} label="Line/C" value={one(o.line_yards_per_carry)} rank={r.line_yards_per_carry} />
          <Stat pal={pal} label="Opp" value={pct(o.opportunity_rate)} rank={r.opportunity_rate} />
          <Stat pal={pal} label="HL/C" value={one(o.highlight_yards_per_carry)} rank={r.highlight_yards_per_carry} />
          <Stat pal={pal} label="TD" value={o.touchdowns} rank={r.touchdowns} ink={tdInk(pal)} />
        </Grid>

        <Box>
          <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap="6px">
            {LANES.map(([dir, name]) => <LaneColumn key={dir} pal={pal} lane={t.lanes.find((l) => l.direction === dir)} name={name} colors={colors} />)}
          </Grid>
          <Flex mt="7px" align="center" justify="space-between" gap="6px">
            <Swatch pal={pal} color={pal.down} label="Lost" />
            <Swatch pal={pal} color={colors[0]} label="Line" />
            <Swatch pal={pal} color={colors[1]} label="HL" />
          </Flex>
        </Box>
      </Grid>

      <Box borderTop={`1px solid ${fg(0.1)}`} pt="6px">
        <Grid templateColumns={COLS} columnGap="6px" pb="3px">
          {["Rusher", "CAR", "YDS", "YPC", "EPA/c", "12+"].map((l, i) => <Text key={l} fontSize="9px" color={fg(0.5)} textAlign={i ? "right" : "left"} {...caps}>{l}</Text>)}
        </Grid>
        {t.top_rushers.map((p) => (
          <Grid key={p.player_id} templateColumns={COLS} columnGap="6px" alignItems="baseline" py="2px" borderTop={`1px solid ${fg(0.06)}`}>
            <Text fontSize="14px" fontWeight="950" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{surnameOf(p.name)}</Text>
            <Text fontSize="13px" fontWeight="800" textAlign="right" {...tab}>{p.carries}</Text>
            <Text fontSize="13px" fontWeight="800" textAlign="right" {...tab}>{int(p.yards)}</Text>
            <Text fontSize="13px" fontWeight="800" textAlign="right" {...tab}>{one(p.yards_per_carry)}</Text>
            <Text fontSize="13px" fontWeight="800" textAlign="right" {...tab}>{epa(p.epa_per_carry)}</Text>
            <Text fontSize="13px" fontWeight="800" textAlign="right" {...tab}>{pct(p.explosive_rate)}</Text>
          </Grid>
        ))}
      </Box>
    </Flex>
  );
};
