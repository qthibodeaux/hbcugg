import { Box, Flex, Text, Grid, Image } from "@chakra-ui/react";
import { Kicker, RankChip, Panel } from "./ScoutPrimitives";
import { brandOf, COUNTING, EFFICIENCY, GRID_DIRS, GRID_DEPTHS, GOLD } from "./scoutPresentation";
import { teamShort, withAlpha } from "../../export/exportData";
import { Fragment } from "react";

// Scout counting/efficiency sheets, air-yard readout and quarterback pass-grid presentation.

const SheetCol = ({ title, rows, data, color, total }) => (
  <Box minW={0}>
    <Kicker mb={2}>{title}</Kicker>
    <Flex direction="column" gap={2}>
      {rows.map(([k, label]) => {
        const s = data[k];
        const fill = s.rank ? ((total - s.rank) / (total - 1)) * 100 : 0;
        return (
          <Box key={k}>
            <Flex align="center" justify="space-between" gap={2}>
              <Text fontSize="0.74rem" fontWeight="700" color="rgba(255,255,255,0.75)" lineClamp={1}>{label}</Text>
              <Flex align="center" gap={2} flexShrink={0}>
                <Text fontSize="0.9rem" fontWeight="900" color="white" fontFamily="mono">{s.display}</Text>
                <RankChip rank={s.rank} color={color} total={total} />
              </Flex>
            </Flex>
            <Box h="3px" mt={1} bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
              <Box h="full" bg={color} opacity={0.85} style={{ width: `${Math.max(2, fill)}%` }} />
            </Box>
          </Box>
        );
      })}
    </Flex>
  </Box>
);

export const Sheets = ({ side, total }) => {
  const color = brandOf(side.team_id);
  return (
    <Panel title={`${teamShort(side.team_id)} · season`} color={color} right={<Kicker>{side.games} games</Kicker>}>
      <Grid templateColumns="repeat(2, minmax(0,1fr))" gap={5}>
        <SheetCol title="Counting" rows={COUNTING} data={side.counting} color={color} total={total} />
        <SheetCol title="Efficiency" rows={EFFICIENCY} data={side.efficiency} color={color} total={total} />
      </Grid>
    </Panel>
  );
};

export const AirYards = ({ ay, color }) => {
  const W = 300, H = 150, PADL = 26, PADB = 18, PADT = 8;
  const all = [...ay.bins, ...ay.league_bins].map((b) => b.share);
  const max = Math.max(...all, 0.01);
  const x = (yd) => PADL + ((yd + 5) / 35) * (W - PADL - 4);
  const y = (v) => H - PADB - (v / max) * (H - PADB - PADT);
  const path = (bins) => bins.map((b, i) => `${i ? "L" : "M"}${x(b.yards).toFixed(1)},${y(b.share).toFixed(1)}`).join(" ");
  const area = `${path(ay.bins)} L${x(30)},${y(0)} L${x(-5)},${y(0)} Z`;
  const yTicks = [0, max / 2, max];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="none" style={{ display: "block" }}>
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={PADL} x2={W - 4} y1={y(v)} y2={y(v)} stroke="rgba(255,255,255,0.06)" />
          <text x={PADL - 4} y={y(v) + 2.5} fontSize="7" fill="rgba(255,255,255,0.45)" textAnchor="end">{Math.round(v * 100)}%</text>
        </g>
      ))}
      {[-5, 0, 5, 10, 15, 20, 25, 30].map((t) => (
        <text key={t} x={x(t)} y={H - 6} fontSize="7" fill="rgba(255,255,255,0.45)" textAnchor="middle">{t === 30 ? "30+" : t}</text>
      ))}
      <line x1={x(0)} x2={x(0)} y1={PADT} y2={H - PADB} stroke="rgba(255,255,255,0.3)" />
      <path d={area} fill={color} fillOpacity="0.25" />
      <path d={path(ay.bins)} fill="none" stroke={color} strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
      <path d={path(ay.league_bins)} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
      <line x1={x(ay.adot)} x2={x(ay.adot)} y1={PADT} y2={H - PADB} stroke={color} strokeDasharray="3 2" vectorEffect="non-scaling-stroke" />
      <text x={x(ay.adot) + 3} y={PADT + 7} fontSize="7" fontWeight="900" fill={color}>avg {ay.adot.toFixed(1)}</text>
    </svg>
  );
};

export const PassGrid = ({ cells, color }) => {
  const at = (depth, dir) => cells.find((x) => x.depth === depth && x.direction === dir);
  return (
    <Grid templateColumns="3rem repeat(3, minmax(0,1fr))" gap="0.3rem" alignItems="stretch">
      <Box />
      {GRID_DIRS.map(([k, label]) => <Kicker key={k} textAlign="center">{label}</Kicker>)}
      {GRID_DEPTHS.map(([dk, label, range]) => (
        <Fragment key={dk}>
          <Flex direction="column" justify="center">
            <Kicker color="white">{label}</Kicker>
            <Kicker fontSize="0.55rem">{range}</Kicker>
          </Flex>
          {GRID_DIRS.map(([k]) => {
            const x = at(dk, k);
            const att = x?.attempts ?? 0;
            const rate = att ? (x.completions ?? 0) / att : 0;
            return (
              <Flex key={k} direction="column" align="center" justify="center" h="3.2rem" borderRadius="0.35rem"
                bg={att ? withAlpha(color, rate) : "rgba(255,255,255,0.04)"}
                border={att ? `1px solid ${withAlpha(color, 0.5)}` : "1px solid rgba(255,255,255,0.06)"}>
                <Text fontSize="1rem" fontWeight="900" fontFamily="mono" lineHeight={1} color={att ? "white" : "rgba(255,255,255,0.35)"}>{att ? `${x.completions}/${att}` : "—"}</Text>
                {att ? <Text fontSize="0.7rem" fontWeight="700" fontFamily="mono" lineHeight={1} mt="0.25rem" color="rgba(255,255,255,0.75)">{x.yards}y</Text> : null}
              </Flex>
            );
          })}
        </Fragment>
      ))}
    </Grid>
  );
};

export const Quarterback = ({ side }) => {
  const qb = side.qb;
  const color = brandOf(side.team_id);
  if (!qb) return null;
  const l = qb.line ?? {};
  const cells = [["C/A", l.att != null ? `${l.cmp}/${l.att}` : "—"], ["Yds", l.yds ?? "—"], ["TD", l.td ?? "—"], ["INT", l.int ?? "—"], ["Sacks", l.sacks ?? "—"]];
  const ay = qb.air_yards;
  return (
    <Panel title={`${teamShort(side.team_id)} · quarterback`} color={color} flex={1} display="flex" flexDirection="column"
      bodyProps={{ flex: 1, display: "flex", flexDirection: "column" }}
      right={ay?.mock ? <Text fontSize="0.6rem" fontWeight="900" color={GOLD} letterSpacing="0.12em">MOCK</Text> : null}>
      <Flex align="center" gap={3}>
        <Box w="3.4rem" h="3.4rem" borderRadius="md" overflow="hidden" bg="whiteAlpha.100" border="2px solid" borderColor={color} flexShrink={0}>
          {qb.image_url ? <Image src={qb.image_url} alt="" w="full" h="full" objectFit="cover" objectPosition="top center" /> : null}
        </Box>
        <Text fontSize="1.05rem" fontWeight="900" color="white" lineClamp={2} minW={0}>{qb.name}</Text>
      </Flex>
      <Grid templateColumns="repeat(5, minmax(0,1fr))" gap={1.5} mt={3}>
        {cells.map(([k, v]) => (
          <Box key={k} bg="whiteAlpha.50" borderRadius="md" px={1} py={1.5} textAlign="center" minW={0}>
            <Kicker fontSize="0.52rem">{k}</Kicker>
            <Text fontSize="clamp(0.78rem, 1.1vw, 0.95rem)" fontWeight="900" color="white" fontFamily="mono" whiteSpace="nowrap">{v}</Text>
          </Box>
        ))}
      </Grid>
      {qb.pass_map?.cells && (
        <Box mt={4} flex={1}>
          <PassGrid cells={qb.pass_map.cells} color={color} />
        </Box>
      )}
    </Panel>
  );
};
