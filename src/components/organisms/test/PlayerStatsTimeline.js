import { Box, Flex, Text } from "@chakra-ui/react";
import { Star, TrendingDown, Flame } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

/**
 * PLAYER STATS TIMELINE - NARRATIVE ARC
 *
 * Season trajectory as a clean, readable line.
 * The curve shows momentum. Moments are marked. Context below.
 *
 * Data: Cameron Peters, QB, PVAMU, 10 games.
 */

const S = "#FFB81C"; // PVAMU secondary
const POSITIVE = "#4ADE80";
const NEGATIVE = "#F87171";

const GAMES = [
  { wk: "W1", par: 8.2, opp: "ASU", away: true },
  { wk: "W2", par: 14.1, opp: "AAMU", away: false },
  { wk: "W3", par: 22.3, opp: "SU", away: false },
  { wk: "W4", par: 38.1, opp: "PVAMU", away: false },
  { wk: "W5", par: 12.4, opp: "JSU", away: true },
  { wk: "W6", par: 5.8, opp: "TXS", away: false },
  { wk: "W7", par: 1.4, opp: "GRAM", away: true },
  { wk: "W8", par: 39.2, opp: "SCSU", away: false },
  { wk: "W9", par: 18.7, opp: "3SU", away: true },
  { wk: "W10", par: 20.5, opp: "MVSU", away: false },
];

const pars = GAMES.map((g) => g.par);
const mean = pars.reduce((a, b) => a + b, 0) / pars.length;
const sorted = [...pars].sort((a, b) => a - b);
const min = sorted[0];
const max = sorted[sorted.length - 1];
const floor = sorted[Math.floor(sorted.length * 0.25)];
const ceiling = sorted[Math.floor(sorted.length * 0.75)];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload[0]) {
    const data = payload[0].payload;
    return (
      <Box bg="rgba(0,0,0,0.95)" px={2} py={1.5} borderRadius="sm" border="1px solid" borderColor={S}>
        <Text fontSize="0.75rem" fontWeight="900" color="white">
          {data.wk}: {data.par.toFixed(1)} PAR
        </Text>
        <Text fontSize="0.65rem" fontWeight="800" color="whiteAlpha.600">
          {data.away ? "at" : "vs"} {data.opp}
        </Text>
      </Box>
    );
  }
  return null;
};

export const PlayerStatsTimeline = () => {
  return (
    <Box w="full" h="full" overflow="auto" bg="#0B0B0D" p={4}>
      {/* HEADER */}
      <Flex align="center" gap={2} mb={4}>
        <Box w="3px" h="1rem" bg={S} borderRadius="sm" />
        <Text fontSize="1rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.06em">
          Season Momentum
        </Text>
      </Flex>

      {/* CHART */}
      <Box
        bg="whiteAlpha.50"
        border="1px solid"
        borderColor="whiteAlpha.100"
        borderRadius="md"
        p={3}
        mb={4}
        h="16rem"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={GAMES} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis
              dataKey="opp"
              stroke="rgba(255,255,255,0.3)"
              style={{ fontSize: "0.7rem" }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: "0.75rem" }} domain={[Math.max(0, min - 2), max + 2]} />

            {/* Reference lines */}
            <ReferenceLine y={floor} stroke={S} strokeOpacity={0.2} strokeDasharray="3 3" />
            <ReferenceLine y={mean} stroke="rgba(255,255,255,0.3)" strokeDasharray="3 3" strokeWidth={1.5} />
            <ReferenceLine y={ceiling} stroke={S} strokeOpacity={0.2} strokeDasharray="3 3" />

            <Tooltip content={<CustomTooltip />} />

            {/* Main momentum line */}
            <Line
              type="linear"
              dataKey="par"
              stroke={S}
              dot={false}
              strokeWidth={3}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* MOMENT MARKERS - just the icons */}
      <Flex justify="space-between" align="center" px={3} h="2.5rem" position="relative">
        {/* Stretching line behind */}
        <Box position="absolute" left={3} right={3} top="50%" h="1px" bg="whiteAlpha.100" transform="translateY(-50%)" />

        {/* Best marker */}
        <Box position="relative" zIndex={1}>
          <Box w="2rem" h="2rem" borderRadius="full" border="2px solid" borderColor={POSITIVE} display="flex" align="center" justify="center" bg="#0B0B0D">
            <Star size={12} color={POSITIVE} />
          </Box>
        </Box>

        {/* Worst marker */}
        <Box position="relative" zIndex={1}>
          <Box w="2rem" h="2rem" borderRadius="full" border="2px solid" borderColor={NEGATIVE} display="flex" align="center" justify="center" bg="#0B0B0D">
            <TrendingDown size={12} color={NEGATIVE} />
          </Box>
        </Box>

        {/* Recent marker */}
        <Box position="relative" zIndex={1}>
          <Box w="2rem" h="2rem" borderRadius="full" border="2px solid" borderColor={S} display="flex" align="center" justify="center" bg="#0B0B0D">
            <Flame size={12} color={S} />
          </Box>
        </Box>
      </Flex>

    </Box>
  );
};

export default PlayerStatsTimeline;
