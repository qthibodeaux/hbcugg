import { Box, Flex, Text, Grid, Image } from "@chakra-ui/react";
import { Label } from "./StoryPrimitives";
import { pct0, ordinal, TEAM_BY_V5, shortOf, fixNames } from "../spotlightModel";

// Spotlight win-probability timeline, quarter bars and odds visuals.

export const RED = "#E53E3E";

export const WpAnnotated = ({ v, t, palette, id }) => {
  const s = v.series ?? [];
  const W = 600, H = 170;
  const x = (i) => (i / Math.max(1, s.length - 1)) * W;
  const y = (wp) => H - wp * H;
  const line = s.map((p, i) => `${i ? "L" : "M"} ${x(i)} ${y(p.wp)}`).join(" ");
  const at = (a) => {
    let idx = -1;
    s.forEach((p, i) => { if (p.q === `Q${a.quarter}` && p.clock === a.clock) idx = i; });
    return idx;
  };
  const marks = (v.annotate ?? []).map((a, k) => ({ ...a, k: k + 1, i: at(a) })).filter((a) => a.i >= 0);
  const peak = s.reduce((m, p, i) => (p.wp > m.wp ? { wp: p.wp, i } : m), { wp: 0, i: 0 });
  return (
    <Box>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="none" style={{ display: "block", height: "9rem", overflow: "visible" }}>
        <defs><clipPath id={`wpa-${id}`}><rect x="0" y="0" width={W} height={H / 2} /></clipPath></defs>
        <path d={`${line} L ${W} ${H / 2} L 0 ${H / 2} Z`} fill={palette.ink} fillOpacity="0.45" clipPath={`url(#wpa-${id})`} />
        <line x1="0" x2={W} y1={H / 2} y2={H / 2} stroke={t.muted} strokeDasharray="5 5" vectorEffect="non-scaling-stroke" />
        <path d={line} fill="none" stroke={t.text} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <circle cx={x(peak.i)} cy={y(peak.wp)} r="5" fill={palette.ink} stroke={t.text} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {marks.map((m) => (
          <g key={m.k}>
            <line x1={x(m.i)} x2={x(m.i)} y1="0" y2={H} stroke={RED} strokeWidth="1.5" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </svg>
      <Flex justify="space-between" mt="0.3rem">
        <Label t={t}>Kickoff</Label>
        <Label t={t} color={palette.ink}>Peak {pct0(peak.wp * 100)}</Label>
        <Label t={t}>Final</Label>
      </Flex>
      <Flex direction="column" gap="0.3rem" mt="0.6rem">
        {marks.map((m) => (
          <Flex key={m.k} gap="0.5rem" align="baseline">
            <Text fontSize="0.9rem" fontWeight="950" color={RED} w="2.6rem" flexShrink={0}>{Math.round(m.swing * 100)}</Text>
            <Text fontSize="0.76rem" fontWeight="700" color={t.text} lineClamp={1}>Q{m.quarter} {m.clock} · {m.description}</Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
};

export const QuarterBars = ({ v, t }) => {
  const rows = v.data ?? [];
  const max = Math.max(...rows.flatMap((r) => [r.for, r.against]), 1);
  return (
    <Grid templateColumns={`repeat(${rows.length}, minmax(0,1fr))`} gap="0.5rem" h="100%" alignItems="end">
      {rows.map((r) => (
        <Flex key={r.label} direction="column" align="center" gap="0.3rem" h="100%" justify="flex-end">
          <Text fontSize="0.82rem" fontWeight="950" color={t.text}>{r.for}-{r.against}</Text>
          <Flex align="flex-end" gap="3px" h="6rem" w="100%" justify="center">
            <Box w="42%" bg={t.accent} borderRadius="2px 2px 0 0" style={{ height: `${(r.for / max) * 100}%` }} />
            <Box w="42%" bg={t.muted} opacity={0.45} borderRadius="2px 2px 0 0" style={{ height: `${(r.against / max) * 100}%` }} />
          </Flex>
          <Text fontSize="0.8rem" fontWeight="950" color={t.text}>{r.label}</Text>
          <Label t={t} fontSize="0.55rem" textAlign="center">{r.rank}</Label>
        </Flex>
      ))}
    </Grid>
  );
};

export const OddsBar = ({ v, card, t }) => {
  const d = v.data ?? {};
  const odds = d.finish_odds_pct ?? [];
  const next = (card.numbers ?? []).find((n) => /^next$/i.test(n.label))?.value;
  return (
    <Box>
      <Flex h="1.6rem" borderRadius="3px" overflow="hidden">
        {odds.map((o, i) => (
          <Flex key={i} align="center" justify="center" bg={t.accent} borderRight={`1px solid ${t.bg === "#FFFFFF" ? "#FFFFFF" : "#0B0B0D"}`}
            style={{ width: `${o}%`, opacity: 1 - i * (0.78 / Math.max(1, odds.length - 1)) }}>
            {o >= 12 && <Text fontSize="0.62rem" fontWeight="950" color="#FFFFFF">{ordinal(i + 1)}</Text>}
          </Flex>
        ))}
      </Flex>
      {d.favorite && (
        <Flex align="center" gap="0.45rem" mt="0.7rem">
          <Image src={TEAM_BY_V5[d.favorite]?.logo} alt="" w="1.5rem" h="1.5rem" objectFit="contain" />
          <Text fontSize="0.8rem" fontWeight="900" color={t.text} textTransform="uppercase">{shortOf(d.favorite)}</Text>
          <Text fontSize="0.8rem" fontWeight="800" color={t.muted}>favored at {pct0(d.favorite_odds_pct)}</Text>
        </Flex>
      )}
      {next && <Text mt="0.45rem" fontSize="0.75rem" fontWeight="800" color={t.muted}>Next: <Text as="span" color={t.text} fontWeight="900">{fixNames(next)}</Text></Text>}
    </Box>
  );
};
