import { useNavigate } from "react-router-dom";
import { barColor, net } from "./weekReviewPresentation";
import { Flex, Text, Box } from "@chakra-ui/react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine, Bar } from "recharts";
import { ChartTooltip, BarShape } from "./WeekChartMarks";

// Week-scoped chart rows and zero-centered display bounds; no new statistical definitions.

export const WeekChart = ({ games }) => {
  const navigate = useNavigate();

  // Ascending, so the games the scoreboard exaggerated lead — that ordering is
  // the question the card is named after.
  const rows = games
    .filter((g) => g.winner_edge != null)
    .sort((a, b) => a.winner_edge - b.winner_edge)
    .map((g) => {
      const winner = g.winner_id === g.home.id ? g.home : g.away;
      const loser = g.winner_id === g.home.id ? g.away : g.home;
      return {
        key: g.game_id,
        edge: g.winner_edge,
        label: `${winner.short} ${winner.score}-${loser.score}`,
        winner,
        loser,
        route: g.route,
        provisional: !!g.provisional,
        fill: barColor(winner.primary, winner.secondary),
      };
    });

  if (!rows.length) {
    return (
      <Flex h="240px" align="center" justify="center" border="1px dashed" borderColor="line.strong" borderRadius="md" px={6}>
        <Text fontSize="xs" color="text.muted" textAlign="center">
          No parsed games this week yet — a bar needs a parsed game file.
        </Text>
      </Flex>
    );
  }

  // Domain follows the week. Zero is always inside it so the baseline — the
  // line the whole card is read against — is never off-screen.
  const dataMax = Math.max(0, ...rows.map((r) => r.edge));
  const dataMin = Math.min(0, ...rows.map((r) => r.edge));
  const pad = Math.max((dataMax - dataMin) * 0.18, 0.02);
  const lo = dataMin - pad;
  const hi = dataMax + pad;
  // Ticks are built around zero rather than left to auto-ticking, which put a
  // "-0.003" gridline where the baseline belongs.
  const step = (hi - lo) / 8;
  const nice = [0.005, 0.01, 0.02, 0.025, 0.05, 0.1].find((v) => v >= step) ?? 0.1;
  const ticks = [];
  for (let v = Math.ceil(lo / nice) * nice; v <= hi + 1e-9; v += nice) ticks.push(Number(v.toFixed(4)));
  if (!ticks.some((t) => Math.abs(t) < 1e-9)) ticks.push(0);
  ticks.sort((a, b) => a - b);

  return (
    <Box>
      {/* ResponsiveContainer measures 0 unless the parent resolves a real
          height — same trap documented at RosterHubCards.js:584. */}
      <Box h={{ base: "320px", lg: "440px" }} w="100%" position="relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 16, right: 8, bottom: 4, left: 0 }} barCategoryGap="18%">
            <CartesianGrid vertical={false} stroke="rgba(var(--gg-fg), 0.07)" />
            <XAxis
              dataKey="label"
              interval={0}
              angle={-45}
              textAnchor="end"
              height={78}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "rgba(var(--gg-fg), 0.55)", fontSize: 10, fontWeight: 700 }}
            />
            <YAxis
              domain={[lo, hi]}
              ticks={ticks}
              width={68}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "rgba(var(--gg-fg), 0.45)", fontSize: 10 }}
              // Net success rate: +0.100 = the winner succeeded on 10% more of its plays.
              tickFormatter={net}
              label={{ value: "Net Success Rate", angle: -90, position: "insideLeft", offset: 4, style: { fill: "rgba(var(--gg-fg), 0.55)", fontSize: 10, fontWeight: 800, textAnchor: "middle", letterSpacing: "0.06em", textTransform: "uppercase" } }}
            />
            <Tooltip cursor={{ fill: "rgba(var(--gg-fg), 0.05)" }} content={<ChartTooltip />} />
            <ReferenceLine y={0} stroke="rgba(var(--gg-fg), 0.35)" />
            <Bar
              dataKey="edge"
              maxBarSize={96}
              isAnimationActive={false}
              shape={<BarShape onSelect={(r) => navigate(r)} />}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>

    </Box>
  );
};
