import { Grid, Box, Flex, Text, Image } from "@chakra-ui/react";
import { PASS_DIRS, PASS_DEPTHS, brandOf, P_SEAM, COUNTING, GOLD, P_BG } from "../scoutPresentation";
import { PKick, PChip, PBox } from "./PosterHeader";
import { Fragment } from "react";
import { withAlpha, teamShort, teamLogo } from "../../../export/exportData";
import { MirrorTrack } from "../ScoutUnits";

// Full-size scout export passing grids, unit rows and player leaders.

const PPassGrid = ({ cells, color }) => {
  const at = (depth, dir) => cells.find((x) => x.depth === depth && x.direction === dir);
  return (
    <Grid templateColumns="44px repeat(3, minmax(0,1fr))" columnGap="4px" rowGap="4px" alignItems="stretch">
      <Box />
      {PASS_DIRS.map(([k, label]) => <PKick key={k} size={9} textAlign="center">{label}</PKick>)}
      {PASS_DEPTHS.map(([dk, label, range]) => (
        <Fragment key={dk}>
          <Flex direction="column" justify="center">
            <PKick size={10} color="var(--gg-ink)">{label}</PKick>
            <PKick size={8}>{range}</PKick>
          </Flex>
          {PASS_DIRS.map(([k]) => {
            const x = at(dk, k);
            const att = x?.attempts ?? 0;
            const rate = att ? (x.completions ?? 0) / att : 0;
            return (
              <Flex key={k} direction="column" align="center" justify="center" h="40px" borderRadius="5px"
                bg={att ? withAlpha(color, rate) : "rgba(var(--gg-fg), 0.04)"}
                border={att ? `1px solid ${withAlpha(color, 0.5)}` : "1px solid rgba(var(--gg-fg), 0.06)"}>
                <Text fontSize="14px" fontWeight="900" fontFamily="mono" lineHeight={1} color={att ? "var(--gg-ink)" : "rgba(var(--gg-fg), 0.35)"}>{att ? `${x.completions}/${att}` : "—"}</Text>
                {att ? <Text fontSize="10px" fontWeight="700" fontFamily="mono" lineHeight={1} mt="3px" color="rgba(var(--gg-fg), 0.7)">{x.yards}y</Text> : null}
              </Flex>
            );
          })}
        </Fragment>
      ))}
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
            <Text fontSize="12px" fontWeight="700" color="rgba(var(--gg-fg), 0.72)" whiteSpace="nowrap">{label}</Text>
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
  const ay = qb?.air_yards;
  return (
    <Flex direction="column" gap="1px" bg={P_SEAM} minW={0}>
      <PBox title={`${teamShort(sd.team_id)} · season`} color={c} right={<PKick size={10} color="rgba(var(--gg-fg), 0.75)">{sd.games} G · rank of {total}</PKick>}>
        {/* Counting only on the poster — the efficiency read lives in the strip and the matchups. */}
        {col(COUNTING, sd.counting)}
      </PBox>
      {qb && (
        <PBox title={`${teamShort(sd.team_id)} · ${qb.name}`} color={c} flex={1}
          right={qb.air_yards?.mock ? <PKick size={10} color={GOLD}>Mock</PKick> : null}>
          <Flex gap="14px" mb="8px">
            {[["C/A", l.att != null ? `${l.cmp}/${l.att}` : "—"], ["Yds", l.yds ?? "—"], ["TD", l.td ?? "—"], ["INT", l.int ?? "—"], ["Sk", l.sacks ?? "—"], ["aDOT", ay?.adot != null ? ay.adot.toFixed(1) : "—"]].map(([k, v]) => (
              <Flex key={k} align="baseline" gap="4px">
                <Text fontSize="16px" fontWeight="900" fontFamily="mono">{v}</Text>
                <PKick size={9}>{k}</PKick>
              </Flex>
            ))}
          </Flex>
          {qb.pass_map?.cells && <PPassGrid cells={qb.pass_map.cells} color={c} />}
        </PBox>
      )}
    </Flex>
  );
};

export const PUnitRows = ({ offId, defId, awayId, rows }) => {
  const offLeft = offId === awayId;
  const leftId = offLeft ? offId : defId, rightId = offLeft ? defId : offId;
  const lc = brandOf(leftId), rc = brandOf(rightId);
  return (
    <Box>
      <Flex justify="space-between" align="center" mb="4px">
        <Flex align="center" gap="6px"><Image src={teamLogo(leftId)} alt="" w="18px" h="18px" objectFit="contain" /><PKick color="var(--gg-ink)" size={11}>{teamShort(leftId)} {offLeft ? "offense" : "defense"}</PKick></Flex>
        <PKick size={10}>vs</PKick>
        <Flex align="center" gap="6px"><PKick color="var(--gg-ink)" size={11}>{teamShort(rightId)} {offLeft ? "defense" : "offense"}</PKick><Image src={teamLogo(rightId)} alt="" w="18px" h="18px" objectFit="contain" /></Flex>
      </Flex>
      {rows.map((r) => {
        const left = offLeft ? r.off : r.def, right = offLeft ? r.def : r.off;
        const leftExtent = offLeft ? r.offExtent : r.defExtent, rightExtent = offLeft ? r.defExtent : r.offExtent;
        const track = { line: "rgba(var(--gg-fg), 0.1)", face: P_BG, edge: "rgba(var(--gg-fg), 0.3)", marker: "18px", logo: "13px" };
        return (
          <Grid key={r.label} templateColumns="56px 34px 1fr 34px 56px" alignItems="center" columnGap="6px" h="32px">
            <Text fontSize="14px" fontWeight="900" fontFamily="mono">{left.display}</Text>
            <PChip rank={left.rank} color={lc} />
            <Box minW={0}>
              <PKick size={9} textAlign="center" mb="1px">{r.label}</PKick>
              <Grid templateColumns="minmax(0,1fr) minmax(0,1fr)" columnGap="10px">
                <MirrorTrack side="left" extent={leftExtent} value={left.value} teamId={leftId} color={lc} {...track} />
                <MirrorTrack side="right" extent={rightExtent} value={right.value} teamId={rightId} color={rc} {...track} />
              </Grid>
            </Box>
            <PChip rank={right.rank} color={rc} />
            <Text fontSize="14px" fontWeight="900" fontFamily="mono" textAlign="right">{right.display}</Text>
          </Grid>
        );
      })}
    </Box>
  );
};

export const PLeaders = ({ sd, max }) => {
  const c = brandOf(sd.team_id);
  return (
    <PBox title={`${teamShort(sd.team_id)} · production leaders`} color={c} right={<PKick size={10} color="rgba(var(--gg-fg), 0.75)">Season</PKick>}>
      {sd.leaders.slice(0, 5).map((p, i) => (
        // Fixed narrow columns with tight gaps, so the stat line gets the rest of the row.
        <Grid key={p.person_id} templateColumns="12px 88px 24px 84px 34px minmax(0,1fr)" alignItems="center" columnGap="6px" h="25px">
          <Text fontSize="13px" fontWeight="900" fontStyle="italic" color={i === 0 ? c : "rgba(var(--gg-fg), 0.45)"}>{i + 1}</Text>
          <Text fontSize="14px" fontWeight="900" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{p.last_name}</Text>
          <PKick size={10}>{p.position}</PKick>
          <Box h="12px" bg="rgba(var(--gg-fg), 0.1)" borderRadius="full" overflow="hidden">
            <Box h="full" bg={c} borderRadius="full" style={{ width: `${(p.production / max) * 100}%` }} />
          </Box>
          <Text fontSize="14px" fontWeight="900" fontFamily="mono" textAlign="right">{p.production.toFixed(1)}</Text>
          <Text fontSize="12px" fontWeight="700" color="rgba(var(--gg-fg), 0.62)" fontFamily="mono" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
            {(p.stats ?? []).map((st) => `${st.value} ${st.label}`).join(" · ")}
          </Text>
        </Grid>
      ))}
    </PBox>
  );
};
