import { Shell, Small, GOOD, BAD, Logo, Big, FAINT, ACCENT, DIM } from "./StatsCardPrimitives";
import { Box, Flex, Image, Grid, Text } from "@chakra-ui/react";
import { teamShort } from "../../../game/export/exportData";
import { vivid } from "../../home/teamColor";

// Four stateless card renderers proven identical in the live hub and lab.

export const LeagueMap = ({ c }) => {
  const { points, x, y, league } = c.viz;
  const span = (vals) => {
    const lo = Math.min(...vals), hi = Math.max(...vals), m = (hi - lo) * 0.1 || 0.01;
    return [lo - m, hi + m];
  };
  const [x0, x1] = span(points.map((p) => p.x));
  const [y0, y1] = span(points.map((p) => p.y));
  const fx = (v) => { const t = (v - x0) / (x1 - x0); return (x.better === "low" ? 1 - t : t) * 100; };
  const fy = (v) => { const t = (v - y0) / (y1 - y0); return (y.better === "low" ? t : 1 - t) * 100; };
  const cx = fx(league.x), cy = fy(league.y);
  return (
    <Shell c={c} scale={0.62}>
      <Box position="relative" flex={1} minH={0} borderLeft="1px solid" borderBottom="1px solid" borderColor="whiteAlpha.200">
        <Box position="absolute" left={`${cx}%`} right={0} top={0} h={`${cy}%`} bg="rgba(34,197,94,0.07)" />
        <Box position="absolute" left={0} w={`${cx}%`} bottom={0} top={`${cy}%`} bg="rgba(245,158,11,0.06)" />
        <Box position="absolute" left={`${cx}%`} top={0} bottom={0} borderLeft="1px dashed" borderColor="rgba(168,85,247,0.6)" />
        <Box position="absolute" top={`${cy}%`} left={0} right={0} borderTop="1px dashed" borderColor="rgba(168,85,247,0.6)" />
        <Small position="absolute" top="1.5cqmin" right="2cqmin" size={2.3} color={GOOD}>Better on both</Small>
        <Small position="absolute" bottom="1.5cqmin" left="2cqmin" size={2.3} color={BAD}>Worse on both</Small>
        {points.map((p) => (
          <Logo key={p.team_id} id={p.team_id} size={7.5} position="absolute" left={`${fx(p.x)}%`} top={`${fy(p.y)}%`} transform="translate(-50%,-50%)"
            filter="drop-shadow(0 0.4cqmin 0.8cqmin rgba(0,0,0,0.8))" />
        ))}
      </Box>
      <Flex justify="space-between" mt="1.4cqmin">
        <Small size={2.4}>{x.label} →</Small>
        <Small size={2.4}>↑ {y.label}</Small>
      </Flex>
    </Shell>
  );
};

export const MetricOfWeek = ({ c }) => {
  const e = c.viz.entries;
  const lo = Math.min(...e.map((x) => x.value)), hi = Math.max(...e.map((x) => x.value));
  const pos = (v) => 4 + ((v - lo) / (hi - lo || 1)) * 92;
  return (
    <Shell c={c} scale={0.9} mark={c.stat.team_id}>
      <Flex align="flex-end" gap="3cqmin">
        <Logo id={c.stat.team_id} size={14} />
        <Box>
          <Big size={13}>{c.stat.display}</Big>
          <Small mt="1cqmin">{teamShort(c.stat.team_id)} · {c.stat.label}</Small>
        </Box>
      </Flex>
      <Box position="relative" flex={1} minH="18cqmin" mt="2cqmin">
        <Box position="absolute" left="4%" right="4%" top="50%" h="0.5cqmin" bg={FAINT} borderRadius="full" />
        <Box position="absolute" top="20%" bottom="20%" w="0.5cqmin" bg={ACCENT} style={{ left: `${pos(c.viz.league)}%` }} />
        <Small position="absolute" top="2%" size={2.6} color={ACCENT} style={{ left: `${pos(c.viz.league)}%` }} transform="translateX(-50%)">Lg {c.viz.league.toFixed(1)}</Small>
        {e.map((x, i) => (
          <Logo key={x.team_id} id={x.team_id} size={i === 0 ? 9 : 6.5} position="absolute" style={{ left: `${pos(x.value)}%`, top: i % 2 ? "64%" : "36%" }}
            transform="translate(-50%,-50%)" opacity={i === 0 ? 1 : 0.85} filter="drop-shadow(0 0.4cqmin 0.8cqmin rgba(0,0,0,0.8))" />
        ))}
        <Small position="absolute" bottom={0} left="4%" size={2.4}>{lo.toFixed(1)}</Small>
        <Small position="absolute" bottom={0} right="4%" size={2.4}>{hi.toFixed(1)}</Small>
      </Box>
    </Shell>
  );
};

export const ProductionLeader = ({ c }) => {
  const { person, entries } = c.viz;
  const max = Math.max(...entries.map((e) => e.value), 1);
  const color = vivid(person.team_id);
  return (
    <Shell c={c} accent={color} mark={person.team_id}>
      <Flex align="center" gap="3cqmin">
        <Box w="18cqmin" h="18cqmin" borderRadius="lg" overflow="hidden" bg="whiteAlpha.100" border="0.5cqmin solid" borderColor={color} flexShrink={0}>
          {person.image_url ? <Image src={person.image_url} alt="" w="full" h="full" objectFit="cover" objectPosition="top center" /> : null}
        </Box>
        <Box minW={0}>
          <Big size={13}>{c.stat.display}</Big>
          <Small mt="1cqmin">{person.position} · {teamShort(person.team_id)}</Small>
        </Box>
      </Flex>
      <Flex direction="column" flex={1} justify="center" gap="1.6cqmin" mt="2cqmin">
        {entries.map((e) => (
          <Grid key={e.label} templateColumns="24% minmax(0,1fr) 13%" alignItems="center" gap="2cqmin">
            <Small size={2.8} color={e.is_subject ? "white" : DIM}>{e.label}</Small>
            <Box h="2.4cqmin" bg={FAINT} borderRadius="full" overflow="hidden">
              <Box h="full" borderRadius="full" bg={vivid(e.team_id)} opacity={e.is_subject ? 1 : 0.55} style={{ width: `${(e.value / max) * 100}%` }} />
            </Box>
            <Text fontSize="2.8cqmin" fontWeight="black" color="white" textAlign="right" fontVariantNumeric="tabular-nums">{e.value.toFixed(1)}</Text>
          </Grid>
        ))}
      </Flex>
    </Shell>
  );
};

export const Parity = ({ c }) => {
  const e = c.viz.entries.filter((x) => Number.isFinite(x.value));
  const lo = Math.min(...e.map((x) => x.value)) * 0.85, hi = Math.max(...e.map((x) => x.value));
  return (
    <Shell c={c}>
      <Flex align="flex-end" gap="2.4cqmin">
        <Big size={13}>{c.stat.display}</Big>
        <Small mb="0.8cqmin">{c.stat.label}</Small>
      </Flex>
      <Flex flex={1} minH={0} align="flex-end" gap="2cqmin" mt="3cqmin">
        {e.map((x) => (
          <Flex key={x.label} direction="column" align="center" flex={1} h="full" justify="flex-end" gap="1cqmin">
            <Box w="full" borderRadius="sm" bg={x.highlight ? ACCENT : "rgba(255,255,255,0.18)"} style={{ height: `${10 + ((x.value - lo) / (hi - lo || 1)) * 80}%` }} />
            <Small size={2.5} color={x.highlight ? "white" : DIM}>{x.label.slice(2)}</Small>
          </Flex>
        ))}
      </Flex>
    </Shell>
  );
};
