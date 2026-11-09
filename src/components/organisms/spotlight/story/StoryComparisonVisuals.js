import { Flex, Box, Text, Grid } from "@chakra-ui/react";
import { RED } from "./StoryGameVisuals";
import { signed1, n1, fixNames, shortOf, pct0 } from "../spotlightModel";
import { Label } from "./StoryPrimitives";

// Spotlight comparison, record, split, ranking, tile and norm visuals.

export const ThenVsNow = ({ v, t }) => (
  <Flex direction="column" gap="0.55rem">
    {(v.data ?? []).map((d) => {
      const max = Math.max(Math.abs(d.then), Math.abs(d.now), 0.01);
      const bar = (val, on) => (
        <Flex align="center" gap="0.5rem">
          <Box flex={1} h="0.55rem" bg={t.track} borderRadius="2px" overflow="hidden">
            <Box h="100%" bg={val < 0 ? RED : on ? t.accent : t.muted} opacity={on ? 1 : 0.55} style={{ width: `${(Math.abs(val) / max) * 100}%` }} />
          </Box>
          <Text w="3.2rem" textAlign="right" fontSize={on ? "0.95rem" : "0.78rem"} fontWeight={on ? "950" : "800"} color={on ? t.text : t.muted} fontVariantNumeric="tabular-nums">
            {d.label.toLowerCase().includes("margin") ? signed1(val) : n1(val)}
          </Text>
        </Flex>
      );
      return (
        <Grid key={d.label} templateColumns="minmax(0,0.9fr) minmax(0,1.4fr)" columnGap="0.8rem" alignItems="center">
          <Text fontSize="0.78rem" fontWeight="800" color={t.text} lineClamp={1}>{d.label}</Text>
          <Box>{bar(d.then, false)}{bar(d.now, true)}</Box>
        </Grid>
      );
    })}
    <Flex gap="1rem" mt="0.2rem">
      <Flex align="center" gap="0.35rem"><Box w="0.6rem" h="0.6rem" bg={t.muted} opacity={0.55} /><Label t={t}>Last season</Label></Flex>
      <Flex align="center" gap="0.35rem"><Box w="0.6rem" h="0.6rem" bg={t.accent} /><Label t={t}>This season</Label></Flex>
    </Flex>
  </Flex>
);

export const RecordBook = ({ v, card, t, teamId, season }) => {
  const rows = [...(v.data ?? [])];
  const ours = (r) => r.team === teamId && Number(r.season) === Number(season);
  if (!rows.some(ours) && card.numbers?.[0]?.value != null) {
    rows.push({ value: card.numbers[0].value, who: String(card.headline).split(":")[0], team: teamId, opp: null, season, added: true });
  }
  return (
    <Flex direction="column" gap="2px">
      {rows.map((r, i) => {
        const on = ours(r);
        const rank = rows.filter((x) => x.value > r.value).length + 1;
        const tied = rows.filter((x) => x.value === r.value).length > 1;
        return (
          <Grid key={i} templateColumns="2.2rem minmax(0,1fr) 3rem" columnGap="0.5rem" alignItems="center" px="0.5rem" py="0.3rem" borderRadius="4px" bg={on ? t.accent : "transparent"}>
            <Text fontSize="0.72rem" fontWeight="900" color={on ? "rgba(255,255,255,0.85)" : t.muted}>{tied ? "T-" : ""}{rank}</Text>
            <Box minW={0}>
              <Text fontSize="0.8rem" fontWeight="900" color={on ? "#FFFFFF" : t.text} lineClamp={1}>{fixNames(r.who)}</Text>
              <Text fontSize="0.6rem" fontWeight="800" color={on ? "rgba(255,255,255,0.8)" : t.muted} textTransform="uppercase">
                {shortOf(r.team)}{r.opp ? ` vs ${shortOf(r.opp)}` : ""} · {r.season}
              </Text>
            </Box>
            <Text fontSize="1.05rem" fontWeight="950" color={on ? "#FFFFFF" : t.text} textAlign="right" fontVariantNumeric="tabular-nums">{Number.isInteger(r.value) ? r.value : Number(r.value).toFixed(0)}</Text>
          </Grid>
        );
      })}
    </Flex>
  );
};

export const WhenThen = ({ v, t }) => (
  <Box>
    <Grid templateColumns="minmax(0,1.6fr) repeat(3, minmax(0,1fr))" columnGap="0.6rem" pb="0.35rem" mb="0.25rem" borderBottom={`1px solid ${t.line}`}>
      <Box />
      <Label t={t} textAlign="center">Won it</Label>
      <Label t={t} textAlign="center">Lost it</Label>
      <Label t={t} textAlign="center">League</Label>
    </Grid>
    {(v.data ?? []).map((d) => (
      <Grid key={d.label} templateColumns="minmax(0,1.6fr) repeat(3, minmax(0,1fr))" columnGap="0.6rem" alignItems="center" py="0.35rem" borderBottom={`1px solid ${t.line}`}>
        <Text fontSize="0.82rem" fontWeight="800" color={t.text} textTransform="capitalize" lineClamp={1}>{d.label}</Text>
        <Text fontSize="1.15rem" fontWeight="950" color={t.accent} textAlign="center" fontStyle="italic">{d.won_it}</Text>
        <Text fontSize="1.15rem" fontWeight="950" color={RED} textAlign="center" fontStyle="italic">{d.lost_it}</Text>
        <Text fontSize="0.9rem" fontWeight="900" color={t.muted} textAlign="center">{pct0((d.league_win_rate ?? 0) * 100)}</Text>
      </Grid>
    ))}
  </Box>
);

export const RankBars = ({ v, t }) => (
  <Flex direction="column" gap="0.6rem">
    {(v.data ?? []).map((d) => {
      const [r, of] = String(d.rank ?? "").match(/\d+/g)?.map(Number) ?? [null, null];
      const share = r && of ? r / of : 0;
      return (
        <Box key={d.label}>
          <Flex justify="space-between" align="baseline" gap="0.6rem">
            <Text fontSize="0.82rem" fontWeight="800" color={t.text} lineClamp={1}>{d.label}</Text>
            <Text fontSize="0.82rem" fontWeight="950" color={RED} whiteSpace="nowrap">{d.rank}</Text>
          </Flex>
          <Box h="0.5rem" mt="0.25rem" bg={t.track} borderRadius="2px" overflow="hidden">
            <Box h="100%" bg={RED} opacity={0.85} style={{ width: `${share * 100}%` }} />
          </Box>
          <Text fontSize="0.66rem" fontWeight="800" color={t.muted} mt="0.15rem">{d.value} · league {d.league}</Text>
        </Box>
      );
    })}
  </Flex>
);

export const StatTiles = ({ v, t }) => (
  <Grid templateColumns="repeat(auto-fill, minmax(7.5rem, 1fr))" gap="0.5rem">
    {(v.data ?? []).map((d) => (
      <Box key={d.label} p="0.55rem" border={`1px solid ${t.line}`} borderRadius="4px">
        <Text fontSize="1.4rem" fontWeight="950" fontStyle="italic" color={t.accent} lineHeight={1}>{d.games ?? d.value}</Text>
        <Text fontSize="0.68rem" fontWeight="800" color={t.text} mt="0.2rem" lineHeight={1.25}>{d.label}</Text>
        {d.rank && <Label t={t} fontSize="0.55rem" mt="0.2rem">{d.rank}{d.league ? ` · lg ${d.league}` : ""}</Label>}
      </Box>
    ))}
  </Grid>
);

export const VsNorm = ({ v, t }) => {
  const rows = v.data ?? [];
  const vals = rows.flatMap((r) => [r.scored, r.opponent_usually_allows]);
  const lo = Math.floor(Math.min(...vals) / 10) * 10;
  const hi = Math.ceil(Math.max(...vals) / 10) * 10;
  const at = (x) => `${((x - lo) / Math.max(1, hi - lo)) * 100}%`;
  return (
    <Flex direction="column" gap="0.55rem">
      {rows.map((r) => (
        <Grid key={r.opponent} templateColumns="5rem minmax(0,1fr) 3rem" columnGap="0.6rem" alignItems="center">
          <Text fontSize="0.8rem" fontWeight="900" color={t.text} textTransform="uppercase" lineClamp={1}>{fixNames(r.opponent)}</Text>
          <Box position="relative" h="1.2rem">
            <Box position="absolute" top="50%" h="2px" mt="-1px" bg={t.muted} opacity={0.5}
              style={{ left: at(Math.min(r.scored, r.opponent_usually_allows)), width: `calc(${at(Math.max(r.scored, r.opponent_usually_allows))} - ${at(Math.min(r.scored, r.opponent_usually_allows))})` }} />
            <Box position="absolute" top="50%" w="0.7rem" h="0.7rem" borderRadius="full" bg={t.muted} style={{ left: at(r.opponent_usually_allows), transform: "translate(-50%,-50%)" }} />
            <Box position="absolute" top="50%" w="0.85rem" h="0.85rem" borderRadius="full" bg={t.accent} style={{ left: at(r.scored), transform: "translate(-50%,-50%)" }} />
          </Box>
          <Text fontSize="0.8rem" fontWeight="950" color={t.text} textAlign="right">{signed1(r.scored - r.opponent_usually_allows)}</Text>
        </Grid>
      ))}
      <Flex gap="1rem"><Flex align="center" gap="0.35rem"><Box w="0.6rem" h="0.6rem" borderRadius="full" bg={t.accent} /><Label t={t}>Scored</Label></Flex>
        <Flex align="center" gap="0.35rem"><Box w="0.6rem" h="0.6rem" borderRadius="full" bg={t.muted} /><Label t={t}>Opponent usually allows</Label></Flex></Flex>
    </Flex>
  );
};
