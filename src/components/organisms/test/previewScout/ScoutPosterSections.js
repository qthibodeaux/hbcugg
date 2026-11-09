import { teamAccent, withAlpha, teamLogo, teamName, teamMascot, teamShort } from "../../../game/export/exportData";
import { Flex, Image, Box, Text, Grid } from "@chakra-ui/react";
import { P_PANEL, brandOf, STRIP, P_SEAM, COUNTING, GOLD, P_BG } from "./scoutPresentation";
import { PKick, PChip, PBox } from "./ScoutPrimitives";

export const PTeamBar = ({ sd, right }) => {
  const c = teamAccent(sd.team_id);
  const coaches = [["HC", sd.coaches.head_coach], ["OC", sd.coaches.offensive_coordinator], ["DC", sd.coaches.defensive_coordinator]];
  return (
    <Flex position="relative" overflow="hidden" align="center" gap="16px" px="18px" h="112px" direction={right ? "row-reverse" : "row"}
      bg={`linear-gradient(${right ? "270deg" : "90deg"}, ${withAlpha(c, 0.75)} 0%, ${withAlpha(c, 0.35)} 45%, ${P_PANEL} 100%)`}>
      <Image src={teamLogo(sd.team_id)} alt="" position="absolute" top="-30px" {...(right ? { left: "-20px" } : { right: "-20px" })} w="170px" h="170px" objectFit="contain" opacity={0.08} />
      <Flex align="center" justify="center" w="84px" h="84px" bg="rgba(0,0,0,0.35)" borderRadius="10px" flexShrink={0}>
        <Image src={teamLogo(sd.team_id)} alt="" w="68px" h="68px" objectFit="contain" />
      </Flex>
      <Box position="relative" minW={0} textAlign={right ? "right" : "left"}>
        <Flex gap="10px" align="baseline" justify={right ? "flex-end" : "flex-start"}>
          <PKick color="rgba(255,255,255,0.85)" size={12}>{teamName(sd.team_id)}</PKick>
          <PKick color="rgba(255,255,255,0.6)" size={11}>{sd.home_away} · {sd.conference_record} {String(sd.conference ?? "").toUpperCase()} ({sd.record})</PKick>
        </Flex>
        <Text fontSize="40px" fontWeight="900" fontStyle="italic" lineHeight={0.95} letterSpacing="-0.03em" textTransform="uppercase" mt="2px">{teamMascot(sd.team_id)}</Text>
        <Flex gap="16px" mt="6px" justify={right ? "flex-end" : "flex-start"}>
          {coaches.map(([k, n]) => (
            <Text key={k} fontSize="12px" fontWeight="700" color="rgba(255,255,255,0.85)"><Text as="span" fontWeight="900" color="rgba(255,255,255,0.5)">{k} </Text>{n ?? "—"}</Text>
          ))}
        </Flex>
      </Box>
    </Flex>
  );
};

export const PStrip = ({ sd }) => {
  const c = brandOf(sd.team_id);
  return (
    <Grid templateColumns="repeat(5, minmax(0,1fr))" bg={P_PANEL} borderTop={`3px solid ${c}`}>
      {STRIP.map(([k, label], i) => {
        const v = sd.strip[k];
        return (
          <Box key={k} px="12px" py="7px" borderLeft={i ? `1px solid ${withAlpha(c, 0.3)}` : "none"}>
            <PKick size={10}>{label}</PKick>
            <Flex align="center" gap="8px" mt="3px">
              <Text fontSize="24px" fontWeight="900" fontFamily="mono" lineHeight={1}>{v.display}</Text>
              <PChip rank={v.rank} color={c} />
            </Flex>
          </Box>
        );
      })}
    </Grid>
  );
};

export const PSide = ({ sd, total }) => {
  const c = brandOf(sd.team_id);
  const col = (rows, data) => (
    <Box minW={0}>
      {rows.map(([k, label]) => {
        const v = data[k];
        return (
          <Flex key={k} align="center" justify="space-between" gap="6px" h="24px">
            <Text fontSize="12px" fontWeight="700" color="rgba(255,255,255,0.72)" whiteSpace="nowrap">{label}</Text>
            <Flex align="center" gap="6px">
              <Text fontSize="14px" fontWeight="900" fontFamily="mono">{v.display}</Text>
              <PChip rank={v.rank} color={c} w="32px" />
            </Flex>
          </Flex>
        );
      })}
    </Box>
  );
  const qb = sd.qb;
  const l = qb?.line ?? {};
  return (
    <Flex direction="column" gap="1px" bg={P_SEAM} minW={0}>
      <PBox title={`${teamShort(sd.team_id)} · season`} color={c} right={<PKick size={10} color="rgba(255,255,255,0.75)">{sd.games} G · rank of {total}</PKick>}>
        {/* Counting only on the poster — the efficiency read lives in the strip and the matchups. */}
        {col(COUNTING, sd.counting)}
      </PBox>
      {qb && (
        <PBox title={`${teamShort(sd.team_id)} · ${qb.name}`} color={c} flex={1}
          right={qb.air_yards?.mock ? <PKick size={10} color={GOLD}>Mock</PKick> : null}>
          <Flex gap="14px" mb="4px">
            {[["C/A", `${l.cmp}/${l.att}`], ["Yds", l.yds], ["TD", l.td], ["INT", l.int], ["Sk", l.sacks ?? "—"], ["aDOT", qb.air_yards?.adot?.toFixed(1)]].map(([k, v]) => (
              <Flex key={k} align="baseline" gap="4px">
                <Text fontSize="16px" fontWeight="900" fontFamily="mono">{v}</Text>
                <PKick size={9}>{k}</PKick>
              </Flex>
            ))}
          </Flex>
          {qb.air_yards && <PAirYards ay={qb.air_yards} color={c} />}
        </PBox>
      )}
    </Flex>
  );
};

const PAirYards = ({ ay, color }) => {
  const W = 470, H = 92, L = 26, B = 16, T = 6;
  const max = Math.max(...[...ay.bins, ...ay.league_bins].map((b) => b.share), 0.01);
  const x = (yd) => L + ((yd + 5) / 35) * (W - L - 4);
  const y = (v) => H - B - (v / max) * (H - B - T);
  const path = (bins) => bins.map((b, i) => `${i ? "L" : "M"}${x(b.yards).toFixed(1)},${y(b.share).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {[0, max].map((v) => (
        <g key={v}>
          <line x1={L} x2={W - 4} y1={y(v)} y2={y(v)} stroke="rgba(255,255,255,0.07)" />
          <text x={L - 5} y={y(v) + 4} fontSize="10" fill="rgba(255,255,255,0.45)" textAnchor="end">{Math.round(v * 100)}%</text>
        </g>
      ))}
      {[-5, 0, 5, 10, 15, 20, 25, 30].map((t) => (
        <text key={t} x={x(t)} y={H - 3} fontSize="10" fill="rgba(255,255,255,0.45)" textAnchor="middle">{t === 30 ? "30+" : t}</text>
      ))}
      <line x1={x(0)} x2={x(0)} y1={T} y2={H - B} stroke="rgba(255,255,255,0.3)" />
      <path d={`${path(ay.bins)} L${x(30)},${y(0)} L${x(-5)},${y(0)} Z`} fill={color} fillOpacity="0.22" />
      <path d={path(ay.bins)} fill="none" stroke={color} strokeWidth="2.5" />
      <path d={path(ay.league_bins)} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeDasharray="4 3" />
    </svg>
  );
};

export const PUnitRows = ({ offId, defId, rows, total }) => {
  const oc = brandOf(offId), dc = brandOf(defId);
  return (
    <Box>
      <Flex justify="space-between" align="center" mb="4px">
        <Flex align="center" gap="6px"><Image src={teamLogo(offId)} alt="" w="18px" h="18px" objectFit="contain" /><PKick color="white" size={11}>{teamShort(offId)} offense</PKick></Flex>
        <PKick size={10}>vs</PKick>
        <Flex align="center" gap="6px"><PKick color="white" size={11}>{teamShort(defId)} defense</PKick><Image src={teamLogo(defId)} alt="" w="18px" h="18px" objectFit="contain" /></Flex>
      </Flex>
      {rows.map((r) => {
        const gap = r.off.rank && r.def.rank ? r.def.rank - r.off.rank : 0;
        const edge = gap > 0 ? offId : gap < 0 ? defId : null;
        const pos = 50 - (gap / (total - 1)) * 44;
        return (
          <Grid key={r.label} templateColumns="56px 34px 1fr 34px 56px" alignItems="center" columnGap="6px" h="30px">
            <Text fontSize="14px" fontWeight="900" fontFamily="mono">{r.off.display}</Text>
            <PChip rank={r.off.rank} color={oc} />
            <Box position="relative" h="30px">
              <PKick size={9} position="absolute" top="0" left="0" right="0" textAlign="center">{r.label}</PKick>
              <Box position="absolute" left={0} right={0} top="19px" h="4px" bg="rgba(255,255,255,0.1)" borderRadius="full" />
              <Box position="absolute" top="19px" h="4px" borderRadius="full" bg={edge === offId ? oc : edge === defId ? dc : "transparent"}
                style={{ left: `${Math.min(pos, 50)}%`, width: `${Math.abs(50 - pos)}%` }} />
              <Flex position="absolute" top="12px" w="18px" h="18px" ml="-9px" borderRadius="full" bg={P_BG} border="1px solid rgba(255,255,255,0.3)" align="center" justify="center" style={{ left: `${pos}%` }}>
                {edge ? <Image src={teamLogo(edge)} alt="" w="13px" h="13px" objectFit="contain" /> : <Text fontSize="10px" fontWeight="900" color="rgba(255,255,255,0.5)">=</Text>}
              </Flex>
            </Box>
            <PChip rank={r.def.rank} color={dc} />
            <Text fontSize="14px" fontWeight="900" fontFamily="mono" textAlign="right">{r.def.display}</Text>
          </Grid>
        );
      })}
    </Box>
  );
};

export const PLeaders = ({ sd, max }) => {
  const c = brandOf(sd.team_id);
  return (
    <PBox title={`${teamShort(sd.team_id)} · production leaders`} color={c} right={<PKick size={10} color="rgba(255,255,255,0.75)">Season</PKick>}>
      {sd.leaders.slice(0, 5).map((p, i) => (
        <Grid key={p.person_id} templateColumns="16px 120px 34px 1fr 50px minmax(0,1.4fr)" alignItems="center" columnGap="10px" h="25px">
          <Text fontSize="13px" fontWeight="900" fontStyle="italic" color={i === 0 ? c : "rgba(255,255,255,0.45)"}>{i + 1}</Text>
          <Text fontSize="14px" fontWeight="900" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{p.last_name}</Text>
          <PKick size={10}>{p.position}</PKick>
          <Box h="6px" bg="rgba(255,255,255,0.1)" borderRadius="full" overflow="hidden">
            <Box h="full" bg={c} borderRadius="full" style={{ width: `${(p.production / max) * 100}%` }} />
          </Box>
          <Text fontSize="14px" fontWeight="900" fontFamily="mono" textAlign="right">{p.production.toFixed(1)}</Text>
          <Text fontSize="12px" fontWeight="700" color="rgba(255,255,255,0.62)" fontFamily="mono" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
            {(p.stats ?? []).map((st) => `${st.value} ${st.label}`).join(" · ")}
          </Text>
        </Grid>
      ))}
    </PBox>
  );
};
