import { Box, Text, Flex } from "@chakra-ui/react";
import { abbreviateOpponent } from "./spotlightPresentation";
import { TEAM_BY_ID } from "../../../../utils/teamScheduleModel";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar, Cell } from "recharts";

// Spotlight PAR-by-game chart and custom ticks/tooltip; active-index/touch guards retained.

const BarTooltip = ({ active, payload, primary }) => {
  if (!active || !payload?.length) return null;
  const g = payload[0].payload;
  return (
    <Box bg="rgba(10,10,14,0.95)" border="1px solid" borderColor={`${primary}66`} borderRadius="sm" px="0.55rem" py="0.4rem">
      <Text fontSize="0.58rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.04em">
        {g.week} · {abbreviateOpponent(g.vs)}
      </Text>
      <Text fontSize="0.72rem" fontWeight="950" fontFamily="mono" color={primary}>
        {Number(g.par ?? 0).toFixed(1)} PAR
      </Text>
    </Box>
  );
};

const WeekTick = ({ x, y, payload, index, activeIndex, primary, games }) => {
  const logo = TEAM_BY_ID[games?.[index]?.opponentId]?.logo;
  if (logo) {
    return (
      <g opacity={index === activeIndex ? 1 : 0.4}>
        <image href={logo} x={x - 7} y={y - 1} width={14} height={14} preserveAspectRatio="xMidYMid meet" />
      </g>
    );
  }
  return (
    <text x={x} y={y + 9} textAnchor="middle" fontSize={8} fontWeight={700} fill={index === activeIndex ? primary : "rgba(255,255,255,0.35)"}>
      {String(payload.value).replace(/^Week\s*/i, "")}
    </text>
  );
};

const YTick = ({ x, y, payload }) => (
  <text x={x} y={y} dy={3} textAnchor="end" fontSize={8} fontWeight={700} fill="rgba(255,255,255,0.45)">
    {Number(payload.value ?? 0).toFixed(0)}
  </text>
);

export const SeasonBarChart = ({ games, activeIndex, primary, secondary, onSelect }) => {
  const parOf = (g) => (Number.isFinite(Number(g?.par)) ? Number(g.par) : 0);
  const maxPar = Math.max(...games.map(parOf), 1);
  const minPar = Math.min(...games.map(parOf), 0);
  // Guarded: the timer or a tap can leave activeIndex past the array (or not a
  // number at all), and an unguarded read here threw on phones.
  const activeGame = games[activeIndex] ?? games[0];
  const midPar = maxPar / 2;
  // Recharts 3 does not reliably hand a plain index to a bar's onClick
  // (touch especially). Resolve the tapped game from whatever arrives.
  const pick = (entry, i) => {
    const idx = Number.isInteger(i) ? i : games.indexOf(entry?.payload ?? entry);
    if (idx >= 0 && idx < games.length) onSelect(idx);
  };

  return (
    <Flex direction="column" h="full" p="clamp(0.6rem, 1vw, 0.9rem)" position="relative" overflow="hidden">
      <Flex align="center" justify="space-between" mb="0.35rem" flexShrink={0}>
        <Flex align="center" gap="0.3rem">
          <Box w="3px" h="10px" bg={primary} borderRadius="sm" />
          <Text fontSize="0.62rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.06em">
            PAR by Game
          </Text>
        </Flex>
        <Text fontSize="0.62rem" fontWeight="900" color={primary}>
          {parOf(activeGame).toFixed(1)} PAR
        </Text>
      </Flex>

      <Box flex={1} minH={0}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={games} margin={{ top: 4, right: 2, bottom: 0, left: 0 }} barCategoryGap="25%">
            <XAxis
              dataKey="week"
              axisLine={{ stroke: "rgba(255,255,255,0.3)" }}
              tickLine={false}
              interval={0}
              height={18}
              tick={<WeekTick activeIndex={activeIndex} primary={primary} games={games} />}
            />
            <YAxis
              domain={[minPar, maxPar]}
              ticks={minPar < 0 ? [minPar, 0, maxPar] : [0, midPar, maxPar]}
              axisLine={false}
              tickLine={false}
              width={22}
              tick={<YTick />}
            />
            <Tooltip cursor={{ fill: "rgba(255,255,255,0.06)" }} content={<BarTooltip primary={primary} />} />
            <Bar dataKey="par" radius={[2, 2, 0, 0]} onClick={pick} activeBar={false} isAnimationActive={false}>
              {games.map((g, i) => (
                <Cell key={`${g.week}-${i}`} fill={i === activeIndex ? primary : `${secondary}55`} style={{ cursor: "pointer" }} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Flex>
  );
};
