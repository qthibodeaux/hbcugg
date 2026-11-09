import { fgOf, caps, hexA, tab, P } from "./posterPresentation";
import { Grid, Box, Text, Flex } from "@chakra-ui/react";
import { changeOf, signed, pct, fix, LABEL, fmtKey } from "../teamProfileModel";
import { Card, Stat, SimilarLine } from "./PosterPrimitives";

export const DEPTHS = [["deep", "Deep"], ["medium", "Medium"], ["short", "Short"]];

export const DIRS = [["L", "Left"], ["M", "Middle"], ["R", "Right"]];

export const PassGrid = ({ pal, cells, size = "big" }) => {
  const fg = fgOf(pal);
  const max = Math.max(1, ...cells.map((c) => c.yards ?? 0));
  const big = size === "big";
  const cellOf = (depth, dir) => cells.find((c) => c.depth === depth && c.direction === dir) ?? {};
  return (
    <Grid templateColumns={big ? "70px repeat(3, minmax(0,1fr))" : "repeat(3, minmax(0,1fr))"} gap="2px">
      {big && <Box />}
      {big && DIRS.map(([, l]) => <Text key={l} fontSize="12px" color={fg(0.55)} textAlign="center" {...caps}>{l}</Text>)}
      {DEPTHS.map(([depth, dl]) => (
        <Box key={depth} display="contents">
          {big && <Flex align="center"><Text fontSize="12px" color={fg(0.55)} {...caps}>{dl}</Text></Flex>}
          {DIRS.map(([dir]) => {
            const c = cellOf(depth, dir);
            const a = 0.1 + 0.75 * ((c.yards ?? 0) / max);
            return (
              <Flex key={dir} direction="column" align="center" justify="center" h={big ? "84px" : "30px"} bg={hexA(pal.brand, a)}>
                <Text fontSize={big ? "30px" : "13px"} fontWeight="950" color={a > 0.45 ? "white" : pal.ink} lineHeight={1} {...tab}>{c.completions ?? 0}</Text>
                {big && <Text fontSize="13px" fontWeight="800" color={a > 0.45 ? "white" : fg(0.6)} {...tab}>{c.yards ?? 0} yds</Text>}
              </Flex>
            );
          })}
        </Box>
      ))}
    </Grid>
  );
};

export const QbBanner = ({ pal }) => {
  const fg = fgOf(pal);
  const q = P.quarterbacks[0];
  if (!q) return null;
  const map = P.qb_map?.rows?.[0];
  const c = q.counting;
  const was = changeOf(q.person_id);
  return (
    <Card pal={pal} kicker="Quarterback">
      <Grid templateColumns="minmax(0,1.25fr) 470px" columnGap="40px" alignItems="start">
        <Box minW={0}>
          <Text fontSize="54px" fontWeight="950" fontStyle="italic" textTransform="uppercase" lineHeight={0.95} letterSpacing="-0.03em">{q.name}</Text>
          <Text mt="4px" fontSize="17px" fontWeight="900" color={fg(0.6)} {...caps}>#{q.jersey} · QB · {q.class} · {q.games} league games</Text>
          <Grid mt="20px" templateColumns="repeat(5, minmax(0,1fr))" gap="14px">
            <Stat pal={pal} label="Comp / att" value={`${c.cmp}/${c.att}`} />
            <Stat pal={pal} label="Yards" value={c.yds} />
            <Stat pal={pal} label="TD" value={c.td} />
            <Stat pal={pal} label="INT" value={c.int} />
            <Stat pal={pal} label="Sacks" value={map?.sacks_taken ?? q.advanced.sacks_taken} />
          </Grid>
          <Grid mt="18px" pt="16px" borderTop={`1px solid ${fg(0.08)}`} templateColumns="repeat(3, minmax(0,1fr))" gap="14px">
            <Stat pal={pal} big label="EPA / dropback" value={signed(q.advanced.epa_per_dropback, 2)} r={map ? { rank: map.rank, of: P.qb_map.of } : null} />
            <Stat pal={pal} big label="Success" value={pct(q.advanced.success_rate)} />
            <Stat pal={pal} big label="PAR" value={fix(q.rating.par)} r={{ rank: q.rating.rank_in_position_group, of: q.rating.position_group_total }} />
          </Grid>
          <Grid mt="16px" templateColumns="repeat(3, minmax(0,1fr))" gap="14px">
            <Stat pal={pal} label="Share of plays" value={pct(q.taxonomy?.usage?.overall)} />
            <Stat pal={pal} label="Share of carries" value={pct(q.taxonomy?.usage?.rushing)} />
            {was && <Stat pal={pal} label="PAR / game · '25 → '26" value={`${fix(was.par_per_game_prior, 1)} → ${fix(was.par_per_game, 1)}`} />}
          </Grid>
        </Box>
        <Box>
          <Flex justify="space-between" align="baseline" mb="8px">
            <Text fontSize="14px" color={fg(0.65)} {...caps}>Completions by depth</Text>
            <Text fontSize="13px" fontWeight="800" color={fg(0.5)}>* Completions only</Text>
          </Flex>
          <PassGrid pal={pal} cells={q.chart?.cells ?? []} />
        </Box>
      </Grid>
    </Card>
  );
};

const OL_KEYS = ["line_yards", "second_level_yards", "open_field_yards", "opportunity_rate", "stuff_rate", "power_success", "success_rate_rush", "epa_per_rush", "sack_rate", "havoc_rate"];

const OL_FMT = { second_level_yards: (v) => fix(v, 2), open_field_yards: (v) => fix(v, 2) };

export const OLineRow = ({ pal }) => {
  const fg = fgOf(pal);
  const ol = P.offensive_line;
  const byKey = Object.fromEntries(ol.metrics.map((m) => [m.key, m]));
  const lanes = ol.rush_lanes;
  return (
    <Card pal={pal} kicker="Offensive line · as a unit">
      <Grid templateColumns="minmax(0,1fr) 330px" columnGap="28px" alignItems="center">
        <Grid templateColumns="repeat(5, minmax(0,1fr))" rowGap="14px" columnGap="14px">
          {OL_KEYS.map((k) => {
            const m = byKey[k];
            if (!m) return null;
            return <Stat key={k} pal={pal} label={LABEL[k] ?? k} value={(OL_FMT[k] ?? ((v) => fmtKey(k, v)))(m.value)} r={m} />;
          })}
        </Grid>
        <Box>
          <Text fontSize="12px" color={fg(0.55)} mb="6px" {...caps}>Yards / carry by lane</Text>
          <Grid templateColumns="repeat(3, minmax(0,1fr))" gap="2px">
            {[["left", "Left"], ["middle", "Middle"], ["right", "Right"]].map(([k, l]) => (
              <Box key={k} bg={fg(0.06)} px="10px" py="10px" textAlign="center" opacity={k === "middle" ? 0.6 : 1}>
                <Text fontSize="12px" color={fg(0.55)} {...caps}>{l}</Text>
                <Text fontSize="30px" fontWeight="950" fontStyle="italic" lineHeight={1.05} {...tab}>{fix(lanes[k]?.yards_per_carry)}</Text>
                <Text fontSize="13px" fontWeight="800" color={fg(0.55)} {...tab}>{lanes[k]?.attempts} carries</Text>
              </Box>
            ))}
          </Grid>
        </Box>
      </Grid>
    </Card>
  );
};

const Lanes = ({ pal, cells }) => {
  const fg = fgOf(pal);
  return (
    <Grid templateColumns="repeat(3, minmax(0,1fr))" gap="2px" w="150px">
      {DIRS.map(([dir, l]) => {
        const c = (cells ?? []).find((x) => x.direction === dir) ?? {};
        return (
          <Box key={dir} bg={fg(0.07)} py="5px" textAlign="center">
            <Text fontSize="10px" color={fg(0.5)} {...caps}>{l[0]}</Text>
            <Text fontSize="15px" fontWeight="950" {...tab}>{c.attempts ? fix(c.yards / c.attempts) : "—"}</Text>
          </Box>
        );
      })}
    </Grid>
  );
};

export const PlayerHead = ({ pal, p, line }) => {
  const fg = fgOf(pal);
  return (
    <Box minW={0}>
      <Text fontSize="22px" fontWeight="950" textTransform="uppercase" lineHeight={1.05} whiteSpace="nowrap">{p.name}</Text>
      <Text mt="2px" fontSize="14px" fontWeight="800" color={fg(0.6)} whiteSpace="nowrap" {...tab}>{line}</Text>
    </Box>
  );
};

export const RushingCol = ({ pal }) => {
  const fg = fgOf(pal);
  const rows = P.rushers.filter((p) => p.qualified);
  return (
    <Card pal={pal} kicker="Rushing">
      <Flex direction="column" gap="16px">
        {rows.map((p) => {
          const c = p.counting;
          const rk = p.comparables?.ranks ?? {};
          const rt = p.advanced?.rates ?? {};
          const lev = p.taxonomy?.leverage;
          return (
            <Box key={p.person_id} pb="16px" borderBottom={`1px solid ${fg(0.08)}`}>
              <Flex justify="space-between" align="center" gap="14px">
                <PlayerHead pal={pal} p={p} line={`${c.att} carries · ${c.yds} yds · ${c.td} TD · long ${c.long}`} />
                <Lanes pal={pal} cells={p.chart?.cells} />
              </Flex>
              <Grid mt="12px" templateColumns="repeat(5, minmax(0,1fr))" gap="10px">
                <Stat pal={pal} label="Yds / carry" value={fix(rt.yards_per_carry)} r={rk["rates.yards_per_carry"]} />
                <Stat pal={pal} label="Success" value={pct(p.advanced?.epa?.success_rate)} r={rk["epa.success_rate"]} />
                <Stat pal={pal} label="Explosive" value={pct(rt.explosive_rate)} r={rk["rates.explosive_rate"]} />
                <Stat pal={pal} label="Stuffed" value={pct(rt.stuff_rate)} r={rk["rates.stuff_rate"]} />
                <Stat pal={pal} label="Fumbles" value={p.advanced?.totals?.fumbles ?? "—"} />
              </Grid>
              <Flex mt="10px" justify="space-between" gap="10px" wrap="wrap">
                <Text fontSize="14px" fontWeight="800" color={fg(0.6)} {...tab}>
                  PAR {fix(p.rating?.par)} · {pct(p.taxonomy?.usage?.rushing)} of carries{lev ? ` · red zone ${lev.red_zone_attempts} for ${lev.red_zone_touchdowns} TD` : ""}
                </Text>
                <SimilarLine pal={pal} list={p.comparables?.similar_players} />
              </Flex>
            </Box>
          );
        })}
      </Flex>
    </Card>
  );
};
