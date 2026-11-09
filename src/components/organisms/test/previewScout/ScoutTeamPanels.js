import { brandOf, COUNTING, EFFICIENCY, GOLD, DIM, LINE } from "./scoutPresentation";
import { Panel, Kicker, SheetCol, RankChip } from "./ScoutPrimitives";
import { teamShort, teamLogo } from "../../../game/export/exportData";
import { Grid, Text, Flex, Box, Image } from "@chakra-ui/react";

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

const AirYards = ({ ay, color }) => {
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

export const Quarterback = ({ side }) => {
  const qb = side.qb;
  const color = brandOf(side.team_id);
  if (!qb) return null;
  const l = qb.line ?? {};
  const cells = [["C/A", `${l.cmp ?? "—"}/${l.att ?? "—"}`], ["Yds", l.yds ?? "—"], ["TD", l.td ?? "—"], ["INT", l.int ?? "—"], ["Sacks", l.sacks ?? "—"]];
  const ay = qb.air_yards;
  return (
    <Panel title={`${teamShort(side.team_id)} · quarterback`} color={color} flex={1} display="flex" flexDirection="column"
      bodyProps={{ flex: 1, display: "flex", flexDirection: "column" }}
      right={ay.mock ? <Text fontSize="0.6rem" fontWeight="900" color={GOLD} letterSpacing="0.12em">MOCK</Text> : null}>
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
      <Box mt={4}>
        <Text fontSize="0.8rem" fontWeight="900" color="white">Where his passes travel</Text>
        <Flex gap={3} mt={1} wrap="wrap">
          <Flex align="center" gap={1}><Box w="0.9rem" h="2px" bg={color} /><Kicker fontSize="0.52rem">{teamShort(side.team_id)}</Kicker></Flex>
          <Flex align="center" gap={1}><Box w="0.9rem" h="0" borderTop="2px dashed rgba(255,255,255,0.6)" /><Kicker fontSize="0.52rem">League</Kicker></Flex>
        </Flex>
      </Box>
      <Grid templateColumns="minmax(0,1fr) 5rem" gap={3} mt={2} flex={1} minH="9rem">
        <Box minH={0}><AirYards ay={ay} color={color} /></Box>
        <Flex direction="column" minH={0}>
          <Kicker fontSize="0.52rem" textAlign="center" mb={1.5}>Throws 30+ yds</Kicker>
          <Flex align="flex-end" justify="center" gap={2} flex={1} minH={0}>
            {[[ay.deep_30_share, color, teamShort(side.team_id)], [ay.league_deep_30_share, "rgba(255,255,255,0.35)", "Lg"]].map(([v, c, lab]) => (
              <Flex key={lab} direction="column" align="center" justify="flex-end" h="full" gap={1}>
                <Text fontSize="0.65rem" fontWeight="900" color="white">{(v * 100).toFixed(1)}%</Text>
                <Box w="1.4rem" bg={c} borderRadius="sm" style={{ height: `${Math.max(6, v * 900)}%` }} />
                <Kicker fontSize="0.5rem">{lab}</Kicker>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Grid>
    </Panel>
  );
};

const UnitBlock = ({ offId, defId, rows, total }) => {
  const oc = brandOf(offId), dc = brandOf(defId);
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={2}>
        <Flex align="center" gap={1.5}><Image src={teamLogo(offId)} alt="" w="1.1rem" h="1.1rem" objectFit="contain" /><Kicker color="white">{teamShort(offId)} offense</Kicker></Flex>
        <Kicker>vs</Kicker>
        <Flex align="center" gap={1.5}><Kicker color="white">{teamShort(defId)} defense</Kicker><Image src={teamLogo(defId)} alt="" w="1.1rem" h="1.1rem" objectFit="contain" /></Flex>
      </Flex>
      <Flex direction="column" gap={2.5}>
        {rows.map((r) => {
          const gap = r.off.rank && r.def.rank ? r.def.rank - r.off.rank : 0;
          const edge = gap > 0 ? offId : gap < 0 ? defId : null;
          const pos = 50 - (gap / (total - 1)) * 44;
          return (
            <Box key={r.label}>
              <Kicker fontSize="0.55rem" textAlign="center" mb={1}>{r.label}</Kicker>
              <Grid templateColumns="auto minmax(0,1fr) auto" alignItems="center" gap={2}>
                <Flex align="center" gap={1.5}>
                  <Text fontSize="0.85rem" fontWeight="900" color="white" fontFamily="mono" w="3.4rem">{r.off.display}</Text>
                  <RankChip rank={r.off.rank} color={oc} total={total} />
                </Flex>
                <Box position="relative" h="1.5rem">
                  <Box position="absolute" left={0} right={0} top="50%" h="4px" mt="-2px" bg="whiteAlpha.100" borderRadius="full" />
                  <Box position="absolute" left="50%" top="20%" bottom="20%" w="1px" bg="whiteAlpha.300" />
                  <Box position="absolute" top="50%" h="4px" mt="-2px" borderRadius="full" bg={edge === offId ? oc : edge === defId ? dc : "transparent"}
                    style={{ left: `${Math.min(pos, 50)}%`, width: `${Math.abs(50 - pos)}%` }} />
                  <Flex position="absolute" top="50%" align="center" justify="center" w="1.5rem" h="1.5rem" borderRadius="full" bg="#0B0B0D" border="1px solid" borderColor="whiteAlpha.300"
                    transform="translate(-50%,-50%)" style={{ left: `${pos}%` }}>
                    {edge ? <Image src={teamLogo(edge)} alt="" w="1.05rem" h="1.05rem" objectFit="contain" /> : <Text fontSize="0.7rem" fontWeight="900" color={DIM}>=</Text>}
                  </Flex>
                </Box>
                <Flex align="center" gap={1.5}>
                  <RankChip rank={r.def.rank} color={dc} total={total} />
                  <Text fontSize="0.85rem" fontWeight="900" color="white" fontFamily="mono" w="3.4rem" textAlign="right">{r.def.display}</Text>
                </Flex>
              </Grid>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
};

export const Advantage = ({ m }) => (
  <Panel title="Unit matchups" color="#A855F7" h="full">
    <Flex direction="column" gap={5}>
      <UnitBlock offId={m.away.team_id} defId={m.home.team_id} rows={m.units.away_offense} total={m.ranked_teams} />
      <Box h="1px" bg={LINE} />
      <UnitBlock offId={m.home.team_id} defId={m.away.team_id} rows={m.units.home_offense} total={m.ranked_teams} />
    </Flex>
  </Panel>
);

export const Leaders = ({ side, max }) => {
  const color = brandOf(side.team_id);
  return (
    <Panel title={`${teamShort(side.team_id)} · production leaders`} color={color} right={<Kicker>Season</Kicker>}>
      <Flex direction="column">
        {side.leaders.map((p, i) => (
          <Grid key={p.person_id} templateColumns="1.2rem 2.8rem minmax(0,1fr)" alignItems="center" gap={3} py={2} borderTop={i ? "1px solid" : "none"} borderColor={LINE}>
            <Text fontSize="0.85rem" fontWeight="900" fontStyle="italic" color={i === 0 ? color : DIM}>{i + 1}</Text>
            <Box w="2.8rem" h="2.8rem" borderRadius="md" overflow="hidden" bg="whiteAlpha.100">
              {p.image_url ? <Image src={p.image_url} alt="" w="full" h="full" objectFit="cover" objectPosition="top center" /> : null}
            </Box>
            <Box minW={0}>
              <Flex align="center" gap={2.5}>
                <Text fontSize="0.9rem" fontWeight="900" color="white" lineClamp={1} minW="5.5rem">{p.last_name}</Text>
                <Kicker w="2rem" flexShrink={0}>{p.position}</Kicker>
                <Box flex={1} h="7px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden" minW="3rem">
                  <Box h="full" bg={color} borderRadius="full" style={{ width: `${(p.production / max) * 100}%` }} />
                </Box>
                <Text fontSize="0.9rem" fontWeight="900" color="white" fontFamily="mono" textAlign="right" w="3rem" flexShrink={0}>{p.production.toFixed(1)}</Text>
                <Text fontSize="0.68rem" fontWeight="800" color={DIM} fontFamily="mono" textAlign="right" w="2.8rem" flexShrink={0}>{p.per_game.toFixed(1)}/g</Text>
              </Flex>
              <Flex gap={4} mt={1}>
                {(p.stats ?? []).map((st) => (
                  <Flex key={st.label} align="baseline" gap={1}>
                    <Text fontSize="0.82rem" fontWeight="900" color="white" fontFamily="mono">{st.value}</Text>
                    <Kicker fontSize="0.52rem">{st.label}</Kicker>
                  </Flex>
                ))}
              </Flex>
            </Box>
          </Grid>
        ))}
      </Flex>
    </Panel>
  );
};
