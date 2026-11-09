import { Shell, Big, GOOD, BAD, Small, sign, Logo, FAINT, DIM, ACCENT, pct } from "./StatsCardPrimitives";
import { Flex, Grid, Box, Text } from "@chakra-ui/react";
import { vivid } from "../../home/teamColor";
import { teamShort } from "../../../game/export/exportData";

// Live-specific Stats Hub card behavior; kept separate from historical lab variants.

export const WinLevers = ({ c }) => {
  const max = Math.max(...c.viz.entries.map((e) => Math.abs(e.r)), 0.01);
  return (
    <Shell c={c} scale={0.62}>
      <Flex align="flex-end" gap="3cqmin" mb="2.4cqmin">
        <Big size={11} color={c.stat.value >= 0 ? GOOD : BAD}>{c.stat.display}</Big>
        <Small mb="0.6cqmin">{c.stat.label}</Small>
      </Flex>
      <Flex direction="column" flex={1} minH={0} justify="space-between">
        {c.viz.entries.map((e) => {
          const w = (Math.abs(e.r) / max) * 50;
          const up = e.r >= 0;
          return (
            <Grid key={e.label} templateColumns="22% minmax(0,1fr) 9%" alignItems="center" gap="2cqmin">
              <Small size={2.6} color="rgba(255,255,255,0.75)">{e.short}</Small>
              <Box position="relative" h="2.2cqmin">
                <Box position="absolute" left="50%" top="-0.6cqmin" bottom="-0.6cqmin" w="1px" bg="whiteAlpha.300" />
                <Box position="absolute" top={0} bottom={0} borderRadius="full" bg={up ? GOOD : BAD} opacity={0.9}
                  style={up ? { left: "50%", width: `${w}%` } : { right: "50%", width: `${w}%` }} />
              </Box>
              <Text fontSize="2.6cqmin" fontWeight="black" color={up ? GOOD : BAD} textAlign="right" fontVariantNumeric="tabular-nums">{sign(e.r, 2)}</Text>
            </Grid>
          );
        })}
      </Flex>
      <Flex justify="space-between" mt="1.6cqmin" px="24%">
        <Small size={2.3} color={BAD}>← Less of it wins</Small>
        <Small size={2.3} color={GOOD}>More of it wins →</Small>
      </Flex>
    </Shell>
  );
};

export const RankGap = ({ c }) => {
  const { record_rank: a, rating_rank: b, total } = c.viz;
  const id = c.stat.team_id;
  const color = vivid(id);
  const x = (rank) => 6 + ((rank - 1) / (total - 1)) * 88;
  // record_ahead: the record outruns the rating; rating_ahead: the reverse.
  const lead = c.archetype !== "record_ahead";
  return (
    <Shell c={c} accent={color} mark={id}>
      <Flex align="center" gap="3cqmin">
        <Logo id={id} size={16} />
        <Box>
          <Big size={15} color={lead ? GOOD : BAD}>{c.stat.display}</Big>
          <Small mt="1cqmin">{c.stat.label}</Small>
        </Box>
      </Flex>
      <Flex direction="column" flex={1} justify="center" gap="5cqmin" mt="2cqmin">
        {[["By record", a, "white"], ["By rating", b, color]].map(([label, rank, tone]) => (
          <Box key={label}>
            <Flex justify="space-between" mb="1.4cqmin"><Small size={3}>{label}</Small><Small size={3} color="white">#{rank}</Small></Flex>
            <Box position="relative" h="1.2cqmin" bg={FAINT} borderRadius="full">
              <Box position="absolute" top="50%" w="4.4cqmin" h="4.4cqmin" borderRadius="full" bg={tone} border="0.6cqmin solid #141416"
                transform="translate(-50%,-50%)" style={{ left: `${x(rank)}%` }} />
            </Box>
          </Box>
        ))}
        <Flex justify="space-between"><Small size={2.6}>#1</Small><Small size={2.6}>#{total}</Small></Flex>
      </Flex>
    </Shell>
  );
};

export const DeadMetric = ({ c }) => (
  <Shell c={c}>
    <Big size={17} color="rgba(255,255,255,0.45)">{c.stat.display}</Big>
    <Small mt="1.2cqmin">{c.stat.label}</Small>
    <Flex direction="column" flex={1} justify="center" gap="5cqmin">
      {c.viz.rows.map((r) => (
        <Box key={r.label}>
          <Flex justify="space-between" mb="1.4cqmin" gap="2cqmin">
            <Small size={3} color={r.tone === "accent" ? "white" : DIM}>{r.label}</Small>
            <Small size={3} color={r.tone === "accent" ? ACCENT : DIM}>{sign(r.r, 2)}</Small>
          </Flex>
          <Box h="2.6cqmin" bg={FAINT} borderRadius="full" overflow="hidden">
            <Box h="full" borderRadius="full" bg={r.tone === "accent" ? ACCENT : "rgba(255,255,255,0.35)"} style={{ width: `${Math.max(2, Math.abs(r.r) * 100)}%` }} />
          </Box>
        </Box>
      ))}
    </Flex>
  </Shell>
);

export const TwinBars = ({ c }) => {
  const { a, b, axes } = c.viz;
  const ca = vivid(a), cb = vivid(b);
  return (
    <Shell c={c} scale={0.62}>
      <Flex align="center" justify="space-between" mb="2cqmin">
        <Flex align="center" gap="2cqmin"><Logo id={a} size={10} /><Small size={3.6} color="white">{teamShort(a)}</Small></Flex>
        <Flex direction="column" align="center"><Big size={9}>{c.stat.display}</Big><Small size={2.4}>{c.stat.label}</Small></Flex>
        <Flex align="center" gap="2cqmin"><Small size={3.6} color="white">{teamShort(b)}</Small><Logo id={b} size={10} /></Flex>
      </Flex>
      <Flex direction="column" flex={1} minH={0} justify="space-between">
        {axes.map((x) => (
          <Grid key={x.label} templateColumns="minmax(0,1fr) 18% minmax(0,1fr)" alignItems="center" gap="1.6cqmin">
            <Flex justify="flex-end" align="center" gap="1cqmin">
              <Text fontSize="2.4cqmin" fontWeight="black" color="white" fontVariantNumeric="tabular-nums">{x.a}</Text>
              <Box h="2.2cqmin" borderRadius="full" bg={ca} style={{ width: `${Math.max(2, x.a * 0.8)}%` }} />
            </Flex>
            <Small size={2.3} textAlign="center" color="rgba(255,255,255,0.7)">{x.label}</Small>
            <Flex align="center" gap="1cqmin">
              <Box h="2.2cqmin" borderRadius="full" bg={cb} style={{ width: `${Math.max(2, x.b * 0.8)}%` }} />
              <Text fontSize="2.4cqmin" fontWeight="black" color="white" fontVariantNumeric="tabular-nums">{x.b}</Text>
            </Flex>
          </Grid>
        ))}
      </Flex>
    </Shell>
  );
};

export const Fingerprint = ({ c }) => {
  const { team_id: id, axes } = c.viz;
  const color = vivid(id);
  const n = axes.length;
  const pt = (i, v) => {
    const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (v / 100) * 40;
    return [50 + r * Math.cos(ang), 50 + r * Math.sin(ang)];
  };
  const poly = axes.map((x, i) => pt(i, x.value).join(",")).join(" ");
  return (
    <Shell c={c} accent={color} mark={id}>
      <Flex align="center" gap="3cqmin">
        <Logo id={id} size={14} />
        <Box><Big size={13}>{c.stat.display}</Big><Small mt="1cqmin">{c.stat.label}</Small></Box>
      </Flex>
      <Box flex={1} minH={0} mt="2cqmin">
        <svg viewBox="-12 -6 124 112" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          {[25, 50, 75, 100].map((r) => (
            <polygon key={r} points={axes.map((_, i) => pt(i, r).join(",")).join(" ")} fill="none" stroke={r === 50 ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.1)"} strokeWidth="0.4" strokeDasharray={r === 50 ? "1.5 1.5" : undefined} />
          ))}
          <polygon points={poly} fill={color} fillOpacity="0.32" stroke={color} strokeWidth="1" />
          {axes.map((x, i) => {
            const [lx, ly] = pt(i, 122);
            return <text key={x.label} x={lx} y={ly} fontSize="4.2" fontWeight="900" fill="rgba(255,255,255,0.65)" textAnchor="middle" dominantBaseline="middle">{x.label}</text>;
          })}
        </svg>
      </Box>
    </Shell>
  );
};

export const ConferenceSplit = ({ c }) => {
  const [s, m] = c.viz.groups;
  const fmt = (v) => (c.viz.unit === "pct" ? pct(v) : v.toFixed(2));
  const best = (c.viz.better === "high") === (s.value > m.value) ? "SWAC" : "MEAC";
  return (
    <Shell c={c}>
      <Flex flex={1} align="center" justify="space-around">
        {[s, m].map((g) => (
          <Flex key={g.label} direction="column" align="center" gap="1.4cqmin">
            <Small size={3.4} color={g.label === best ? GOOD : DIM}>{g.label}</Small>
            <Big size={13} color={g.label === best ? "white" : "rgba(255,255,255,0.55)"}>{fmt(g.value)}</Big>
            <Small size={2.6}>{g.teams} teams</Small>
          </Flex>
        ))}
      </Flex>
      <Flex align="center" justify="center" gap="2cqmin">
        <Big size={8} color={ACCENT}>{c.stat.display}</Big>
        <Small>{c.stat.label}</Small>
      </Flex>
    </Shell>
  );
};
