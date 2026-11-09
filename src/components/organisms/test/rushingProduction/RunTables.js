import { fmt2, fmt1, fmtPct } from "./rushingPresentation";
import { VStack, Flex, Box, Text, Grid } from "@chakra-ui/react";

export const CompactRunTables = ({ data }) => {
  const accent = data.meta.colors.accent;
  const rowStyle = {
    fontSize: "clamp(8px, 0.72vw, 10px)",
    fontWeight: "800",
    color: "text.muted",
    textTransform: "uppercase",
  };

  const teamLine = {
    title: "Team Line",
    bar: "#E53E3E",
    cols: ["CAR", "YDS", "YPC", "TD", "EPA"],
    values: [data.team.attempts, data.team.yards, fmt2(data.team.ypc), data.team.touchdowns, fmt2(data.team.rushEpa)],
  };

  const attributionTables = [
    {
      title: "RB Created",
      bar: accent,
      cols: ["HL YDS", "HL/C", "OPP", "EXP", "1&10"],
      values: [fmt1(data.team.highlightYards), fmt2(data.team.highlightYpc), `${data.team.opportunityRuns} (${fmtPct(data.team.opportunityRate)})`, data.team.explosiveRuns, data.team.firstAndTenRushes],
    },
    {
      title: "Shared",
      bar: "#E53E3E",
      cols: ["SUCC", "RATE", "1D", "EXP", "EPA/C"],
      values: [data.team.successfulRuns, fmtPct(data.team.rushSuccessRate), data.team.firstDownRuns, data.team.explosiveRuns, fmt2(data.team.rushEpaPerCarry)],
    },
    {
      title: "OL Earned",
      bar: "#F6AD55",
      cols: ["LY", "LY/C", "STUFF", "RATE", "STOP"],
      values: [fmt1(data.team.lineYards), fmt2(data.team.lineYpc), data.team.stuffedRuns, fmtPct(data.team.stuffRate), fmtPct(data.team.stoppedRate)],
    },
  ];

  const renderTable = (table, columns = 5, showTitle = true) => (
    <VStack key={table.title} gap={0} align="stretch">
      {showTitle && (
        <Flex align="center" gap={1.5} py="2px" borderBottom="1px solid rgba(255,255,255,0.14)">
          <Box w="3px" h="11px" bg={table.bar} borderRadius="sm" />
          <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.primary" fontWeight="900" textTransform="uppercase" letterSpacing="0.05em">
            {table.title}
          </Text>
        </Flex>
      )}
      <Grid templateColumns={`repeat(${columns}, 1fr)`} py="2px" borderBottom="1px solid rgba(255,255,255,0.06)">
        {table.cols.map((col) => (
          <Text key={col} {...rowStyle} textAlign="center">{col}</Text>
        ))}
      </Grid>
      <Grid templateColumns={`repeat(${columns}, 1fr)`} py="3px">
        {table.values.map((value, i) => (
          <Text key={`${table.title}-${i}`} fontSize="clamp(9px, 0.82vw, 12px)" color={i === 0 ? table.bar : "text.primary"} fontWeight="900" textAlign="center">
            {value}
          </Text>
        ))}
      </Grid>
    </VStack>
  );

  return (
    <VStack gap="4px" align="stretch">
      {renderTable(teamLine, 5, false)}
      <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={2}>
        {attributionTables.map((table) => renderTable(table))}
      </Grid>
    </VStack>
  );
};

export const OpponentImpact = ({ data }) => (
  <Box px="6px" py="5px" borderTop="1px solid rgba(255,255,255,0.08)" flex="0 0 20%">
    <Flex align="center" gap={1.5} mb="3px">
      <Box w="4px" h="14px" bg="#F6AD55" borderRadius="sm" />
      <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.primary" fontWeight="900" textTransform="uppercase">
        {data.opponent.shortName} Defensive Impact
      </Text>
    </Flex>
    <Grid templateColumns="repeat(3, 1fr)" templateRows="repeat(2, 1fr)" gap="3px">
      {[
        { label: "Stop Rate", value: fmtPct(data.opponent.metrics.stopRate), sub: "failed rushes", color: "#F6AD55" },
        { label: "Stuff Rate", value: fmtPct(data.opponent.metrics.stuffRate), sub: "line wins", color: "#F6AD55" },
        { label: "TFL Forced", value: fmtPct(data.opponent.metrics.tflRate), sub: "behind LOS", color: "#E53E3E" },
        { label: "Power Stop", value: fmtPct(data.opponent.metrics.powerRunStopRate), sub: "short yardage", color: "#63B3ED" },
        { label: "1D Rush Succ", value: fmtPct(data.opponent.metrics.firstDownRushSuccessAllowed), sub: "allowed", color: "#68D391" },
        { label: "Opp Allowed", value: fmtPct(data.opponent.metrics.opportunityRate), sub: "4+ yards", color: "text.primary" },
      ].map((stat) => (
        <Flex key={stat.label} direction="column" justify="center" px="6px" py="4px" bg="rgba(255,255,255,0.04)" border="1px solid rgba(255,255,255,0.06)" borderRadius="sm" minW={0}>
          <Text fontSize="clamp(8px, 0.72vw, 10px)" color={stat.color} fontWeight="900" lineHeight={1}>{stat.value}</Text>
          <Text fontSize="clamp(7px, 0.65vw, 9px)" color="text.primary" fontWeight="850" mt="2px" truncate>{stat.label}</Text>
          <Text fontSize="6px" color="text.muted" fontWeight="750" textTransform="uppercase" mt="1px" truncate>{stat.sub}</Text>
        </Flex>
      ))}
    </Grid>
  </Box>
);
