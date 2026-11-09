import { Box, Flex, Image, Grid, Text } from "@chakra-ui/react";
import { teamLogo, teamShort } from "../../export/exportData";
import { brandOf, LINE, DIM } from "./scoutPresentation";
import { Kicker, RankChip, Panel } from "./ScoutPrimitives";

// Scout mirrored tracks, unit comparisons, advantages and production leaders.

export const MirrorTrack = ({ side, extent, value, teamId, color, line, face, edge, marker, logo }) => {
  const range = extent ? extent.max - extent.min || 1 : 1;
  const at = extent && value != null ? ((extent.highBest ? value - extent.min : extent.max - value) / range) * 100 : null;
  const left = side === "left";
  return (
    <Box minW={0}>
      <Box position="relative" h={marker} mx={`calc(${marker} / 2)`}>
        <Box position="absolute" left={0} right={0} top="50%" h="4px" mt="-2px" bg={line} borderRadius="full" />
        {at != null && (
          <>
            <Box position="absolute" top="50%" h="4px" mt="-2px" borderRadius="full" bg={color} style={left ? { right: 0, width: `${at}%` } : { left: 0, width: `${at}%` }} />
            <Flex position="absolute" top={0} w={marker} h={marker} ml={`calc(${marker} / -2)`} borderRadius="full" bg={face} border={`1px solid ${edge}`} align="center" justify="center" style={{ left: `${left ? 100 - at : at}%` }}>
              <Image src={teamLogo(teamId)} alt="" w={logo} h={logo} objectFit="contain" />
            </Flex>
          </>
        )}
      </Box>
    </Box>
  );
};

const UnitBlock = ({ offId, defId, awayId, rows, total }) => {
  const offLeft = offId === awayId;
  const leftId = offLeft ? offId : defId, rightId = offLeft ? defId : offId;
  const lc = brandOf(leftId), rc = brandOf(rightId);
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={2}>
        <Flex align="center" gap={1.5}><Image src={teamLogo(leftId)} alt="" w="1.1rem" h="1.1rem" objectFit="contain" /><Kicker color="white">{teamShort(leftId)} {offLeft ? "offense" : "defense"}</Kicker></Flex>
        <Kicker>vs</Kicker>
        <Flex align="center" gap={1.5}><Kicker color="white">{teamShort(rightId)} {offLeft ? "defense" : "offense"}</Kicker><Image src={teamLogo(rightId)} alt="" w="1.1rem" h="1.1rem" objectFit="contain" /></Flex>
      </Flex>
      <Flex direction="column" gap={2.5}>
        {rows.map((r) => {
          const left = offLeft ? r.off : r.def, right = offLeft ? r.def : r.off;
          const leftExtent = offLeft ? r.offExtent : r.defExtent, rightExtent = offLeft ? r.defExtent : r.offExtent;
          const track = { line: "rgba(255,255,255,0.08)", face: "#0B0B0D", edge: "rgba(255,255,255,0.3)", marker: "1.5rem", logo: "1.05rem" };
          return (
            <Box key={r.label}>
              <Kicker fontSize="0.55rem" textAlign="center" mb={1}>{r.label}</Kicker>
              <Grid templateColumns="auto minmax(0,1fr) minmax(0,1fr) auto" alignItems="center" gap={2}>
                <Flex align="center" gap={1.5}>
                  <Text fontSize="0.85rem" fontWeight="900" color="white" fontFamily="mono" w="3.4rem">{left.display}</Text>
                  <RankChip rank={left.rank} color={lc} total={total} />
                </Flex>
                <MirrorTrack side="left" extent={leftExtent} value={left.value} teamId={leftId} color={lc} {...track} />
                <MirrorTrack side="right" extent={rightExtent} value={right.value} teamId={rightId} color={rc} {...track} />
                <Flex align="center" gap={1.5}>
                  <RankChip rank={right.rank} color={rc} total={total} />
                  <Text fontSize="0.85rem" fontWeight="900" color="white" fontFamily="mono" w="3.4rem" textAlign="right">{right.display}</Text>
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
      <UnitBlock awayId={m.away.team_id} offId={m.away.team_id} defId={m.home.team_id} rows={m.units.away_offense} total={m.ranked_teams} />
      <Box h="1px" bg={LINE} />
      <UnitBlock awayId={m.away.team_id} offId={m.home.team_id} defId={m.away.team_id} rows={m.units.home_offense} total={m.ranked_teams} />
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
