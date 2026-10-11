import { Box, Flex, Grid, Text } from "@chakra-ui/react";

// All three charts share one x-axis (game/week) and read off the SAME real
// per-game data — player.games[] already carries a real per-game PAR total
// + component breakdown from the enriched stats source (no mock needed for
// this one, unlike the box-score category tables elsewhere in this tab).
// Percentile-vs-position-group is flagged 🚧 in the inventory doc (needs a
// real aggregation pass), so percentileFor() below is a placeholder mapping
// off the same real total — a stand-in, not a fabricated-from-nothing value.
// NOTE: no "turnover" layer in the component breakdown — the enriched source
// doesn't carry a turnover production component, so it's omitted here rather
// than invented. Flag for the eventual backend contract if that's wanted.

const COMPONENT_LABELS = {
  passing_production: "Passing",
  rushing_production: "Rushing",
  receiving_production: "Receiving",
};
const COMPONENT_ORDER = ["passing_production", "rushing_production", "receiving_production"];

const percentileFor = (total) => Math.round(Math.max(5, Math.min(99, 50 + Number(total ?? 0) * 4)));

export const buildChartRows = (player) => {
  const games = Array.isArray(player?.games) ? player.games : [];
  return games.map((g, i) => {
    const components = g?.components ?? {};
    const activeKeys = COMPONENT_ORDER.filter((k) => components[k] != null);
    return {
      week: i + 1,
      total: Number(g?.total ?? 0),
      components,
      activeKeys,
    };
  });
};

const ChartCard = ({ title, children }) => (
  <Box bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" p={4}>
    <Text fontSize="11px" fontWeight="800" color="white" textTransform="uppercase" letterSpacing="0.04em" mb={3}>
      {title}
    </Text>
    {children}
  </Box>
);

const ParByGameChart = ({ rows, primary }) => {
  const max = Math.max(1, ...rows.map((r) => r.total));
  const min = Math.min(0, ...rows.map((r) => r.total));
  const span = max - min || 1;
  const zeroPct = ((0 - min) / span) * 100;

  return (
    <ChartCard title="Points Above Replacement">
      <Flex h="140px" gap={1} align="flex-end" position="relative">
        <Box position="absolute" left={0} right={0} bottom={`${zeroPct}%`} h="1px" bg="whiteAlpha.300" />
        {rows.map((r) => {
          const topPct = ((r.total - min) / span) * 100;
          const barBottom = Math.min(topPct, zeroPct);
          const barHeight = Math.abs(topPct - zeroPct);
          return (
            <Flex key={r.week} flex={1} direction="column" align="center" justify="flex-end" h="full" position="relative">
              <Box position="absolute" bottom={`${barBottom}%`} left="15%" right="15%" h={`${barHeight}%`} bg={primary} />
            </Flex>
          );
        })}
      </Flex>
      <Flex gap={1} mt={1}>
        {rows.map((r) => (
          <Flex key={r.week} flex={1} justify="center">
            <Text fontSize="8px" color="text.muted">{r.week}</Text>
          </Flex>
        ))}
      </Flex>
    </ChartCard>
  );
};

const SERIES_COLORS = { total: "#FFFFFF" };

const PercentileTrendChart = ({ rows, primary, secondary }) => {
  const seriesKeys = rows[0]?.activeKeys?.length ? rows[0].activeKeys : [];
  const palette = [primary, secondary, "#68D391"];
  const series = [
    ...seriesKeys.map((key, i) => ({ key, label: COMPONENT_LABELS[key], color: palette[i % palette.length] })),
    { key: "total", label: "Total", color: SERIES_COLORS.total },
  ];

  const width = 100;
  const pointFor = (i) => (rows.length > 1 ? (i / (rows.length - 1)) * width : width / 2);

  const linePath = (key) =>
    rows
      .map((r, i) => {
        const value = key === "total" ? r.total : r.components[key];
        const pct = percentileFor(value);
        return `${i === 0 ? "M" : "L"} ${pointFor(i)} ${100 - pct}`;
      })
      .join(" ");

  return (
    <ChartCard title="Production Percentile Trend">
      <Box position="relative" h="140px">
        {[0, 25, 50, 75, 100].map((tick) => (
          <Flex key={tick} position="absolute" left={0} right={0} top={`${100 - tick}%`} align="center" gap={1}>
            <Text fontSize="8px" color="text.muted" w="24px">{tick}%</Text>
            <Box flex={1} h="1px" bg="whiteAlpha.100" />
          </Flex>
        ))}
        <Box position="absolute" left="26px" right={0} top={0} bottom={0}>
          <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="none" style={{ overflow: "visible" }}>
            {series.map((s) => (
              <path key={s.key} d={linePath(s.key)} fill="none" stroke={s.color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            ))}
          </svg>
        </Box>
      </Box>
      <Flex gap={3} mt={2} pl="26px" flexWrap="wrap">
        {series.map((s) => (
          <Flex key={s.key} align="center" gap={1}>
            <Box w="8px" h="8px" borderRadius="full" bg={s.color} />
            <Text fontSize="9px" color="text.muted" textTransform="uppercase">{s.label}</Text>
          </Flex>
        ))}
      </Flex>
    </ChartCard>
  );
};

const ComponentBreakdownChart = ({ rows, primary, secondary }) => {
  const palette = [primary, secondary, "#68D391"];
  const max = Math.max(1, ...rows.map((r) => r.total));

  return (
    <ChartCard title="Offensive Component Breakdown">
      <Flex h="160px" gap={1} align="flex-end">
        {rows.map((r) => (
          <Flex key={r.week} flex={1} direction="column-reverse" h="full" justify="flex-start">
            {r.activeKeys.map((key, i) => {
              const value = Math.max(0, Number(r.components[key] ?? 0));
              const heightPct = (value / max) * 100;
              return <Box key={key} w="full" h={`${heightPct}%`} bg={palette[i % palette.length]} />;
            })}
          </Flex>
        ))}
      </Flex>
      <Flex gap={1} mt={1}>
        {rows.map((r) => (
          <Flex key={r.week} flex={1} justify="center">
            <Text fontSize="8px" color="text.muted">{r.week}</Text>
          </Flex>
        ))}
      </Flex>
      <Flex gap={3} mt={2} flexWrap="wrap">
        {(rows[0]?.activeKeys ?? []).map((key, i) => (
          <Flex key={key} align="center" gap={1}>
            <Box w="8px" h="8px" borderRadius="sm" bg={palette[i % palette.length]} />
            <Text fontSize="9px" color="text.muted" textTransform="uppercase">{COMPONENT_LABELS[key]}</Text>
          </Flex>
        ))}
      </Flex>
    </ChartCard>
  );
};

const PlayerPerformanceCharts = ({ player, primary, secondary }) => {
  const rows = buildChartRows(player);

  if (!rows.length) {
    return (
      <Text fontSize="sm" color="text.muted" textAlign="center" py={8}>
        No per-game data on file for this player.
      </Text>
    );
  }

  return (
    <Flex direction="column" gap={4}>
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={4}>
        <ParByGameChart rows={rows} primary={primary} />
        <PercentileTrendChart rows={rows} primary={primary} secondary={secondary} />
      </Grid>
      <ComponentBreakdownChart rows={rows} primary={primary} secondary={secondary} />
    </Flex>
  );
};

export default PlayerPerformanceCharts;
