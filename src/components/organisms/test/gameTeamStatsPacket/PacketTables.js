import { Flex, Box, Text, Grid } from "@chakra-ui/react";
import { normalizeTeamId, getTeamLabel, getTeamColor, fmt } from "./packetModel";
import { Fragment } from "react";
import { Info } from "lucide-react";

// Packet comparison tables and source/data-quality caveats.

const SectionHeader = ({ title, subtitle }) => (
  <Flex direction={{ base: "column", md: "row" }} align={{ base: "flex-start", md: "center" }} justify="space-between" gap={3} mb={3}>
    <Box>
      <Text fontSize="10px" color="brand.500" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">Team Stats</Text>
      <Text fontSize="xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1}>{title}</Text>
    </Box>
    {subtitle && <Text fontSize="xs" color="text.muted" maxW="460px" textAlign={{ base: "left", md: "right" }}>{subtitle}</Text>}
  </Flex>
);

export const TableShell = ({ title, subtitle, rows, teams, tint = true }) => (
  <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" p={4}>
    <SectionHeader title={title} subtitle={subtitle} />
    <Box overflowX="auto">
      <Grid templateColumns="minmax(190px, 1.4fr) repeat(2, minmax(100px, 0.8fr))" minW="520px" gap={0}>
        <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase" borderBottom="1px solid" borderColor="whiteAlpha.100" pb={2}>Metric</Text>
        {teams.map((teamId) => {
          const normalizedTeamId = normalizeTeamId(teamId);
          return (
          <Text key={normalizedTeamId} fontSize="9px" color="text.muted" fontWeight="black" textAlign="right" textTransform="uppercase" borderBottom="1px solid" borderColor="whiteAlpha.100" pb={2}>
            {getTeamLabel(normalizedTeamId)}
          </Text>
          );
        })}
        {rows.map((row) => {
          const values = teams.map((teamId) => row.value(normalizeTeamId(teamId)));
          const nums = values.map((value) => (typeof value === "number" ? value : null));
          const best = row.higherIsBetter === false ? Math.min(...nums.filter((v) => v != null)) : Math.max(...nums.filter((v) => v != null));
          return (
            <Fragment key={row.label}>
              <Text fontSize="11px" color="text.secondary" fontWeight="black" py={2} borderBottom="1px solid" borderColor="whiteAlpha.50">{row.label}</Text>
              {teams.map((teamId, index) => {
                const normalizedTeamId = normalizeTeamId(teamId);
                const value = values[index];
                const numeric = nums[index];
                const isEdge = tint && numeric != null && numeric === best && nums.filter((v) => v != null).length > 1;
                return (
                  <Box key={`${row.label}-${normalizedTeamId}`} py={2} px={2} borderBottom="1px solid" borderColor="whiteAlpha.50" bg={isEdge ? `${getTeamColor(normalizedTeamId)}22` : "transparent"}>
                    <Text fontSize="12px" color="white" fontWeight="black" textAlign="right">{row.format ? row.format(value, normalizedTeamId) : fmt(value, 1)}</Text>
                    {row.context && <Text fontSize="8px" color="text.muted" textAlign="right" textTransform="uppercase" fontWeight="black">{row.context(value, normalizedTeamId)}</Text>}
                  </Box>
                );
              })}
            </Fragment>
          );
        })}
      </Grid>
    </Box>
  </Box>
);

export const DataQuality = ({ game }) => {
  const coverage = game.aggregation_coverage ?? {};
  const advanced = game.advanced_coverage ?? {};
  const summary = game.enrichment_summary ?? {};
  return (
    <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" p={4}>
      <Flex align="center" gap={2} mb={3}>
        <Info size={14} color="#E53E3E" />
        <Text fontSize="xl" color="white" fontWeight="black" textTransform="uppercase">Data Quality / Coverage</Text>
      </Flex>
      <Grid templateColumns={{ base: "1fr", lg: "repeat(4, 1fr)" }} gap={3}>
        {[
          ["PBP Schema", coverage.pbp_schema_level],
          ["Play Count", summary.play_count ?? advanced.reconciliation?.play_count],
          ["Drive Count", summary.drive_count ?? advanced.reconciliation?.drive_count],
          ["Advanced Schema", advanced.schema_version],
          ["Computed Groups", (advanced.computed_metric_groups ?? []).length],
          ["Deferred Groups", (advanced.deferred_metric_groups ?? []).join(", ") || "None"],
          ["Unavailable Metrics", (coverage.metrics_unavailable ?? []).join(", ") || "None"],
          ["Mismatch Count", coverage.reconciliation_checks?.team_player_mismatch_count ?? 0],
        ].map(([label, value]) => (
          <Box key={label} bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100" p={3}>
            <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase" mb={1}>{label}</Text>
            <Text fontSize="sm" color="white" fontWeight="black" lineClamp={2}>{String(value ?? "-")}</Text>
          </Box>
        ))}
      </Grid>
    </Box>
  );
};
