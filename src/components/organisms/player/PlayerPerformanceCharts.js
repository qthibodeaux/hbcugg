import { buildChartRows, ParByGameChart, PercentileTrendChart, ComponentBreakdownChart } from "./performanceCharts/PerformanceChartPanels";
import { Text, Flex, Grid } from "@chakra-ui/react";

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

export { buildChartRows } from "./performanceCharts/PerformanceChartPanels";
