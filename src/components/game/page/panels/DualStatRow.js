import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { fmt } from "../../../../utils/gameHelpers";

export const DualStatRow = ({ label, awayVal, homeVal, awayDisplay, homeDisplay, format, dec, lowerIsBetter }) => {
  const f = format ?? ((v) => fmt(v, dec ?? 0));
  const total = (awayVal ?? 0) + (homeVal ?? 0);
  const awayPct = total > 0 ? ((awayVal ?? 0) / total) * 100 : 50;
  const awayWins =
    awayVal != null && homeVal != null
      ? lowerIsBetter ? awayVal <= homeVal : awayVal >= homeVal
      : null;

  return (
    <Box py={2} borderBottom="1px solid" borderColor="whiteAlpha.50">
      <Grid templateColumns="1fr auto 1fr" gap={2} alignItems="center" mb={1}>
        <Text fontSize="xs" fontWeight="bold" color={awayWins === true ? "brand.400" : "text.primary"}>
          {awayDisplay ?? f(awayVal)}
        </Text>
        <Text fontSize="9px" color="text.muted" textTransform="uppercase" letterSpacing="wider" textAlign="center" minW="80px">
          {label}
        </Text>
        <Text fontSize="xs" fontWeight="bold" color={awayWins === false ? "brand.400" : "text.primary"} textAlign="right">
          {homeDisplay ?? f(homeVal)}
        </Text>
      </Grid>
      <Flex h="3px" borderRadius="full" overflow="hidden">
        <Box flex={`0 0 ${awayPct}%`} bg={awayWins !== false ? "brand.500" : "whiteAlpha.200"} />
        <Box flex={`0 0 ${100 - awayPct}%`} bg={awayWins === false ? "brand.500" : "whiteAlpha.200"} />
      </Flex>
    </Box>
  );
};
