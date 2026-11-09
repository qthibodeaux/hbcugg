import { DEPTHS, DIRS, PlayerHead, PassGrid } from "./PlayerPassingRushing";
import { fgOf, P, tab, caps } from "./posterPresentation";
import { Card, Stat, SimilarLine } from "./PosterPrimitives";
import { Text, Flex, Grid, Box } from "@chakra-ui/react";
import { pct, fix } from "../teamProfileModel";

const catchCells = (chart) => {
  const g = chart?.by_depth_direction ?? {};
  const dir = { L: "left", M: "middle", R: "right" };
  return DEPTHS.flatMap(([depth]) => DIRS.map(([d]) => ({ depth, direction: d, completions: g[depth]?.[dir[d]]?.receptions ?? 0, yards: g[depth]?.[dir[d]]?.yards ?? 0 })));
};

export const ReceivingCol = ({ pal }) => {
  const fg = fgOf(pal);
  const rows = P.pass_catchers.filter((p) => p.qualified);
  return (
    <Card pal={pal} kicker="Receiving" right={<Text fontSize="13px" fontWeight="800" color={fg(0.5)}>* Catches only</Text>}>
      <Flex direction="column" gap="14px">
        {rows.map((p) => {
          const c = p.counting;
          const rk = p.comparables?.ranks ?? {};
          const rt = p.advanced?.rates ?? {};
          return (
            <Grid key={p.person_id} templateColumns="minmax(0,1fr) 120px" columnGap="16px" pb="14px" borderBottom={`1px solid ${fg(0.08)}`}>
              <Box minW={0}>
                <PlayerHead pal={pal} p={p} line={`${c.rec} catches · ${c.yds} yds · ${c.td} TD · long ${c.long}`} />
                <Grid mt="10px" templateColumns="repeat(4, minmax(0,1fr))" gap="10px">
                  <Stat pal={pal} label="Catch rate" value={pct(rt.catch_rate)} r={rk["rates.catch_rate"]} />
                  <Stat pal={pal} label="Yds / target" value={fix(rt.yards_per_target)} r={rk["rates.yards_per_target"]} />
                  <Stat pal={pal} label="YAC / catch" value={fix(rt.yac_per_reception)} r={rk["rates.yac_per_reception"]} />
                  <Stat pal={pal} label="Success" value={pct(p.advanced?.epa?.success_rate)} r={rk["epa.success_rate"]} />
                </Grid>
                <Text mt="8px" fontSize="14px" fontWeight="800" color={fg(0.6)} {...tab}>
                  PAR {fix(p.rating?.par)} · {pct(p.taxonomy?.usage?.passing)} of pass plays
                </Text>
              </Box>
              <Box alignSelf="center"><PassGrid pal={pal} cells={catchCells(p.chart)} size="small" /></Box>
            </Grid>
          );
        })}
      </Flex>
    </Card>
  );
};

const LaneBars = ({ pal, lanes }) => {
  const fg = fgOf(pal);
  const max = Math.max(1, lanes.left ?? 0, lanes.middle ?? 0, lanes.right ?? 0);
  return (
    <Flex align="flex-end" gap="4px" h="48px">
      {[["left", "L"], ["middle", "M"], ["right", "R"]].map(([k, l]) => (
        <Flex key={k} direction="column" align="center" justify="flex-end" w="30px" h="full">
          <Text fontSize="12px" fontWeight="900" {...tab}>{lanes[k] ?? 0}</Text>
          <Box w="full" h={`${((lanes[k] ?? 0) / max) * 26}px`} minH="2px" bg={pal.orange} />
          <Text fontSize="10px" color={fg(0.5)} {...caps}>{l}</Text>
        </Flex>
      ))}
    </Flex>
  );
};

export const Defenders = ({ pal }) => {
  const fg = fgOf(pal);
  const rows = P.defenders.filter((p) => p.qualified).slice(0, 6);
  return (
    <Card pal={pal} kicker="Defense · top six by PAR">
      <Grid templateColumns="repeat(3, minmax(0,1fr))" gap="2px" bg={fg(0.06)}>
        {rows.map((p) => {
          const c = p.counting;
          const rk = p.comparables?.ranks ?? {};
          return (
            <Box key={p.person_id} bg={pal.panel} px="16px" py="14px">
              <Flex justify="space-between" align="flex-start" gap="10px">
                <PlayerHead pal={pal} p={p} line={`${p.position} · ${p.games} games`} />
                <Box textAlign="right">
                  <Text fontSize="11px" color={fg(0.5)} {...caps}>Havoc by lane</Text>
                  <LaneBars pal={pal} lanes={p.chart?.by_lane ?? {}} />
                </Box>
              </Flex>
              <Grid mt="10px" templateColumns="repeat(5, minmax(0,1fr))" gap="8px">
                <Stat pal={pal} label="PAR" value={fix(p.rating?.par)} r={rk.par} />
                <Stat pal={pal} label="Tackles" value={c.tot} />
                <Stat pal={pal} label="Sacks" value={c.sacks} />
                <Stat pal={pal} label="TFL" value={c.tfl} />
                <Stat pal={pal} label="Havoc" value={p.chart?.events ?? "—"} />
              </Grid>
              <Box mt="8px"><SimilarLine pal={pal} list={p.comparables?.similar_players} /></Box>
            </Box>
          );
        })}
      </Grid>
    </Card>
  );
};

export const ProductionLeft = ({ pal }) => {
  const fg = fgOf(pal);
  const ch = P.change;
  const gone = (ch.departed?.players ?? []).slice(0, 5);
  const up = (ch.returners?.risers ?? []).slice(0, 3);
  return (
    <Card pal={pal} kicker="From 2025">
      <Grid templateColumns="300px minmax(0,1.4fr) minmax(0,1fr)" columnGap="34px" alignItems="start">
        <Box>
          <Text fontSize="76px" fontWeight="950" fontStyle="italic" color={pal.orange} lineHeight={0.9} letterSpacing="-0.04em" {...tab}>{pct(ch.departed?.share_of_prior_par)}</Text>
          <Text mt="8px" fontSize="18px" fontWeight="900" lineHeight={1.25}>of 2025's production left: {fix(ch.departed?.par)} of {fix(ch.prior_par_total)} PAR</Text>
        </Box>
        <Box>
          <Text fontSize="13px" color={fg(0.55)} mb="6px" {...caps}>Gone</Text>
          {gone.map((p) => (
            <Grid key={p.person_id} templateColumns="minmax(0,1fr) 50px 70px" columnGap="10px" h="32px" alignItems="center" borderBottom={`1px solid ${fg(0.06)}`}>
              <Text fontSize="17px" fontWeight="900" whiteSpace="nowrap">{p.name}</Text>
              <Text fontSize="14px" fontWeight="800" color={fg(0.55)} {...caps}>{p.position}</Text>
              <Text fontSize="17px" fontWeight="900" textAlign="right" {...tab}>{fix(p.par)}</Text>
            </Grid>
          ))}
        </Box>
        <Box>
          <Text fontSize="13px" color={fg(0.55)} mb="6px" {...caps}>Stepped up · PAR / game</Text>
          {up.map((p) => (
            <Grid key={p.person_id} templateColumns="minmax(0,1fr) auto" columnGap="10px" h="32px" alignItems="center" borderBottom={`1px solid ${fg(0.06)}`}>
              <Text fontSize="17px" fontWeight="900" whiteSpace="nowrap">{p.name}</Text>
              <Text fontSize="17px" fontWeight="900" {...tab}><Text as="span" color={fg(0.45)}>{fix(p.par_per_game_prior)} → </Text><Text as="span" color={pal.up}>{fix(p.par_per_game)}</Text></Text>
            </Grid>
          ))}
          <Text mt="10px" fontSize="15px" fontWeight="800" color={fg(0.6)} {...tab}>New to the roster: {fix(ch.new_to_roster?.par)} PAR</Text>
        </Box>
      </Grid>
    </Card>
  );
};
