import { Box, Grid, Text } from "@chakra-ui/react";
import { fmt } from "../../../utils/gameHelpers";

const valueColor = (awayValue, homeValue, lowerIsBetter) => {
  if (awayValue == null || homeValue == null) return ["text.primary", "text.primary"];
  if (awayValue === homeValue) return ["text.primary", "text.primary"];

  const awayWins = lowerIsBetter ? awayValue < homeValue : awayValue > homeValue;
  return awayWins ? ["brand.400", "text.primary"] : ["text.primary", "brand.400"];
};

const CompareTable = ({ awayData, homeData, awayLabel, homeLabel, rows }) => (
  <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" overflow="hidden">
    <Grid templateColumns="1fr 1fr 1fr" bg="whiteAlpha.50" px={4} py={3}>
      <Text fontSize="xs" fontWeight="bold" color="text.secondary">
        {awayLabel}
      </Text>
      <Text fontSize="xs" fontWeight="bold" color="text.muted" textAlign="center">
        Metric
      </Text>
      <Text fontSize="xs" fontWeight="bold" color="text.secondary" textAlign="right">
        {homeLabel}
      </Text>
    </Grid>

    {rows.map((row, idx) => {
      const awayRaw = awayData?.[row.key];
      const homeRaw = homeData?.[row.key];
      const formatter = row.format ?? ((v) => fmt(v, row.dec ?? 0));
      const [awayColor, homeColor] = valueColor(awayRaw, homeRaw, row.lowerIsBetter);

      return (
        <Grid
          key={row.key}
          templateColumns="1fr 1fr 1fr"
          px={4}
          py={3}
          borderTop={idx > 0 ? "1px solid" : "none"}
          borderColor="whiteAlpha.100"
        >
          <Text fontSize="sm" fontWeight="bold" color={awayColor}>
            {formatter(awayRaw)}
          </Text>
          <Text fontSize="xs" color="text.muted" textAlign="center" textTransform="uppercase" letterSpacing="wider">
            {row.label}
          </Text>
          <Text fontSize="sm" fontWeight="bold" color={homeColor} textAlign="right">
            {formatter(homeRaw)}
          </Text>
        </Grid>
      );
    })}
  </Box>
);

export default CompareTable;
