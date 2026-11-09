import { Box, Text } from "@chakra-ui/react";
import { formatPassDefenseValue } from "../../../../utils/passDefenseConfig";

const rankText = (metric) => metric.rank == null ? metric.qualification
  : `${metric.tied ? "Tied " : ""}#${metric.rank}${metric.of == null ? "" : ` of ${metric.of}`} (published)`;

export const PassDefenseTooltip = ({ active, payload, view, pal }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload?.sourceRow;
  if (!row) return null;
  return (
    <Box bg={pal.panel} color={pal.ink} border="1px solid" borderColor={`rgba(${pal.fg},0.25)`} p={4} maxW="26rem" boxShadow="lg">
      <Text fontWeight="900" mb={2}>{row.fullName}</Text>
      <Text fontSize="xs" mb={2}>{view.scope === "all" ? "Full game" : "Competitive"} · {view.source}</Text>
      {view.series.map((item) => {
        const metric = row[item.key];
        return (
          <Box key={item.key} mt={3}>
            <Text fontSize="sm" fontWeight="800">{item.label}: {formatPassDefenseValue(metric?.value, view.unit)}</Text>
            <Text fontSize="xs">{metric?.definition}</Text>
            <Text fontSize="xs">Numerator: {metric?.numerator ?? "not published"} · n: {metric?.n ?? "not published"} ({metric?.denominator})</Text>
            <Text fontSize="xs">{metric?.state === "absent" ? "Measure/bucket absent" : metric?.state === "null" ? "Published null value" : rankText(metric)}</Text>
            {metric?.detail && <Text fontSize="xs">{metric.detail}</Text>}
          </Box>
        );
      })}
    </Box>
  );
};

