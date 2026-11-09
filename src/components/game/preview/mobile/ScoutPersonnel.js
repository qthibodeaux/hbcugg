import { useState } from "react";
import { brandOf, PassGrid } from "../GamePreviewScout";
import { Section, TeamSwitch, Label } from "./ScoutPrimitives";
import { Text, Box, Flex, Image, Grid } from "@chakra-ui/react";
import { DIM, LINE, PANEL } from "./scoutMobilePresentation";

// Mobile scout quarterback passing grid and production-leader sections.

export const Quarterbacks = ({ m, refs }) => {
  const [team, setTeam] = useState(m.away.team_id);
  const side = team === m.home.team_id ? m.home : m.away;
  const qb = side.qb;
  const color = brandOf(side.team_id);
  const l = qb?.line ?? {};
  return (
    <Section id="qb" refs={refs} title="Quarterbacks">
      <TeamSwitch m={m} value={team} onChange={setTeam} />
      {!qb ? (
        <Text px="0.75rem" py="1rem" fontSize="0.85rem" color={DIM}>—</Text>
      ) : (
        <Box px="0.75rem" py="0.85rem">
          <Flex align="center" gap="0.75rem">
            <Box w="4.2rem" h="4.2rem" borderRadius="0.6rem" overflow="hidden" bg="whiteAlpha.100" border="2px solid" borderColor={color} flexShrink={0}>
              {qb.image_url ? <Image src={qb.image_url} alt="" w="full" h="full" objectFit="cover" objectPosition="top center" /> : null}
            </Box>
            <Box minW={0}>
              <Text fontSize="1.6rem" fontWeight="900" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={1} lineClamp={1}>{qb.last_name ?? qb.name}</Text>
              <Text fontSize="0.78rem" fontWeight="800" color={DIM} mt="0.25rem" lineClamp={1}>{qb.name}</Text>
            </Box>
          </Flex>
          <Grid templateColumns="repeat(5, minmax(0, 1fr))" gap="1px" bg={LINE} mt="0.85rem" mx="-0.75rem">
            {[["C/A", l.att != null ? `${l.cmp}/${l.att}` : "—"], ["Yds", l.yds ?? "—"], ["TD", l.td ?? "—"], ["INT", l.int ?? "—"], ["Sk", l.sacks ?? "—"]].map(([k, v]) => (
              <Box key={k} bg={PANEL} py="0.6rem" textAlign="center" minW={0}>
                <Label>{k}</Label>
                <Text fontSize="1.05rem" fontWeight="900" color="white" fontVariantNumeric="tabular-nums" whiteSpace="nowrap" mt="0.2rem">{v}</Text>
              </Box>
            ))}
          </Grid>
          {qb.pass_map?.cells && (
            <Box mt="0.85rem">
              <PassGrid cells={qb.pass_map.cells} color={color} />
            </Box>
          )}
        </Box>
      )}
    </Section>
  );
};

export const Leaders = ({ m, refs }) => {
  const [team, setTeam] = useState(m.away.team_id);
  const side = team === m.home.team_id ? m.home : m.away;
  const color = brandOf(side.team_id);
  const max = Math.max(...[...m.away.leaders, ...m.home.leaders].map((p) => p.production), 1);
  return (
    <Section id="leaders" refs={refs} title="Production leaders">
      <TeamSwitch m={m} value={team} onChange={setTeam} />
      {side.leaders.map((p, i) => (
        <Grid key={p.person_id} templateColumns="1.2rem 2.8rem minmax(0, 1fr)" alignItems="center" gap="0.6rem" px="0.75rem" py="0.6rem" borderTop={i ? "1px solid" : "none"} borderColor={LINE}>
          <Text fontSize="0.9rem" fontWeight="900" fontStyle="italic" color={i === 0 ? color : DIM}>{i + 1}</Text>
          <Box w="2.8rem" h="2.8rem" borderRadius="0.5rem" overflow="hidden" bg="whiteAlpha.100">
            {p.image_url ? <Image src={p.image_url} alt="" w="full" h="full" objectFit="cover" objectPosition="top center" /> : null}
          </Box>
          <Box minW={0}>
            <Flex align="baseline" justify="space-between" gap="0.5rem">
              <Flex align="baseline" gap="0.4rem" minW={0}>
                <Text fontSize="1rem" fontWeight="900" color="white" textTransform="uppercase" lineClamp={1}>{p.last_name}</Text>
                <Label flexShrink={0}>{p.position}</Label>
              </Flex>
              <Text fontSize="1rem" fontWeight="900" color="white" fontVariantNumeric="tabular-nums" flexShrink={0}>{p.production.toFixed(1)}</Text>
            </Flex>
            <Box h="0.35rem" mt="0.3rem" bg="whiteAlpha.100" overflow="hidden">
              <Box h="full" bg={color} style={{ width: `${(p.production / max) * 100}%` }} />
            </Box>
            <Flex gap="0.85rem" mt="0.35rem" wrap="wrap">
              {(p.stats ?? []).map((st) => (
                <Flex key={st.label} align="baseline" gap="0.25rem">
                  <Text fontSize="0.85rem" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">{st.value}</Text>
                  <Label fontSize="0.55rem">{st.label}</Label>
                </Flex>
              ))}
            </Flex>
          </Box>
        </Grid>
      ))}
    </Section>
  );
};
