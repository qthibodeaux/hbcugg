import { useContext, useMemo, useState } from "react";
import { TileMobile, Empty, Body, Rotator, TileTitle, WideRow, WideNum, POS, NEG, fmtSigned, WideLabel, hfs, Context, BRAND, WideLogo, WideStat, fmtMetric, Mark } from "./TilePrimitives";
import { Flex, Box, Text } from "@chakra-ui/react";
import { readableTeamColor } from "../../../../utils/teamColor";

export const LabBody = ({ hub }) => {
  const mobile = useContext(TileMobile);
  const levers = useMemo(
    () => (hub.levers ?? []).filter((l) => l.abs >= 0.25).slice(0, 6),
    [hub.levers],
  );
  const [i, setI] = useState(0);
  if (!levers.length) return <Empty>No levers on file</Empty>;
  const lever = levers[i % levers.length];
  return (
    <Body
      cycle={i}
      live={levers.length > 1}
      top={
        <>
          <Rotator count={levers.length} onTick={() => setI((v) => (v + 1) % levers.length)} />
          <TileTitle>What Wins</TileTitle>
        </>
      }
    >
      {mobile ? (
        <WideRow gap="0.8rem">
          <WideNum color={lever.r >= 0 ? POS : NEG} size="2.2rem">{fmtSigned(lever.r, 2)}</WideNum>
          <Flex direction="column" gap="0.4rem" flex={1} minW={0}>
            <WideLabel color="white">{lever.short ?? lever.label}</WideLabel>
            <Box h="0.4rem" bg="whiteAlpha.100">
              <Box h="100%" w={`${Math.min(1, Math.abs(lever.r)) * 100}%`} bg={lever.r >= 0 ? POS : NEG} />
            </Box>
          </Flex>
        </WideRow>
      ) : (
      <Flex direction="column" align="center" justify="center" flex={1} minH="36cqmin" minW={0} textAlign="center">
        <Text
          fontSize={hfs(14)} fontWeight="black" fontStyle="italic" color={lever.r >= 0 ? POS : NEG}
          lineHeight={0.9} letterSpacing="-0.05em" fontVariantNumeric="tabular-nums" lineClamp={1}
        >
          {fmtSigned(lever.r, 2)}
        </Text>
        <Context mt="1cqmin" color="rgba(255,255,255,0.8)" textAlign="center">{mobile ? lever.short ?? lever.label : lever.label ?? lever.short}</Context>
      </Flex>
      )}
    </Body>
  );
};

const TREND_TILE_STATS = [
  { key: "rating", label: "Team Rating", unit: "num", signed: true },
  { key: "o_rushing.successRate", label: "Rush Success", unit: "pct" },
  { key: "o_rushing.opportunityRate", label: "Opportunity Rate", unit: "pct" },
  { key: "o_passing.ypa", label: "Yards / Attempt", unit: "num" },
  { key: "o_passing.explosiveRate", label: "Explosive Rate", unit: "pct" },
  { key: "d_rushing.successRate", label: "Rush Success Allowed", unit: "pct" },
  { key: "d_passing.completionRate", label: "Completion Allowed", unit: "pct" },
  { key: "d_passing.pressureRate", label: "Pressure Rate", unit: "pct" },
];

const TREND_TILE_SLIDES = 4;

const readTrend = (row, key) => (key === "rating" ? row?.rating : row?.metrics?.[key]);

const drawSome = (list, n) => {
  const pool = [...list];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
};

const Sparkline = ({ points, color }) => {
  if (points.length < 2) return null;
  const lo = Math.min(...points);
  const hi = Math.max(...points);
  const span = hi - lo || 1;
  const xy = points.map((v, i) => [(i / (points.length - 1)) * 100, 26 - ((v - lo) / span) * 22]);
  const line = xy.map(([x, y]) => `${x},${y}`).join(" ");
  const last = xy[xy.length - 1];
  return (
    <svg viewBox="0 0 100 30" width="100%" height="100%" preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      {xy.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.1" fill={color} opacity={0.55} vectorEffect="non-scaling-stroke" />
      ))}
      <circle cx={last[0]} cy={last[1]} r="2.1" fill={color} vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

export const TrendsBody = ({ hub }) => {
  const mobile = useContext(TileMobile);
  // Random on load: four team-and-stat pairings, each with a full line.
  const slides = useMemo(() => {
    const seasons = (hub.seasons ?? []).slice().sort((a, b) => a - b);
    const teams = Object.values(hub.teams ?? {});
    return drawSome(teams, TREND_TILE_SLIDES)
      .map((team, i) => {
        const stat = drawSome(TREND_TILE_STATS, TREND_TILE_SLIDES)[i % TREND_TILE_SLIDES];
        const points = seasons
          .map((y) => readTrend(team.seasons?.[y], stat.key))
          .filter((v) => Number.isFinite(v));
        return points.length >= 2 ? { team, stat, points } : null;
      })
      .filter(Boolean);
  }, [hub.teams, hub.seasons]);

  const [i, setI] = useState(0);
  if (!slides.length) return <Empty>Not enough seasons</Empty>;
  const { team, stat, points } = slides[i % slides.length];
  const latest = points[points.length - 1];
  // Black primaries vanish as a line on a dark tile; swap to the secondary.
  const color = readableTeamColor(team.identity, "#141416", BRAND);

  return (
    <Body
      cycle={i}
      live={slides.length > 1}
      top={
        <>
          <Rotator count={slides.length} onTick={() => setI((v) => (v + 1) % slides.length)} />
          <TileTitle>Trends</TileTitle>
        </>
      }
    >
      {mobile ? (
        <WideRow gap="0.6rem"><WideLogo team={team.identity} size="2.3rem" /><WideStat value={stat.signed ? fmtSigned(latest, 2) : fmtMetric(latest, stat.unit)} label={stat.label} size="1.7rem" /><Box flex={1} minW="3rem" h="2.4rem"><Sparkline points={points} color={color} /></Box></WideRow>
      ) : (
      <Box position="relative" flex={1} minH="36cqmin" minW={0}>
        <Flex position="absolute" inset={0} align="center" justify="center" opacity={0.2} pointerEvents="none">
          <Mark logo={team.identity.logo} label={team.identity.short} size={46} />
        </Flex>
        <Flex position="relative" direction="column" align="center" justify="center" h="100%" minW={0} textAlign="center">
          <Text fontSize={hfs(13)} fontWeight="black" fontStyle="italic" color="white" lineHeight={0.9} letterSpacing="-0.05em" fontVariantNumeric="tabular-nums" lineClamp={1} textShadow="0 0 2cqmin rgba(0,0,0,0.8)">
            {stat.signed ? fmtSigned(latest, 2) : fmtMetric(latest, stat.unit)}
          </Text>
          <Context mt="1cqmin" color="rgba(255,255,255,0.8)" textAlign="center">{stat.label}</Context>
          <Box w="100%" h="10cqmin" mt="1.6cqmin" px="1cqmin">
            <Sparkline points={points} color={color} />
          </Box>
        </Flex>
      </Box>
      )}
    </Body>
  );
};
