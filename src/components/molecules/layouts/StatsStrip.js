import { Box, Grid, Text } from "@chakra-ui/react";

/**
 * StatsStrip - Horizontal stats display strip
 * @param {Object} props
 * @param {Array} props.stats - Array of stat objects with label and value
 */
const StatsStrip = ({ stats }) => {
  return (
    <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(5, 1fr)" }} gap={4} mb={8}>
      {stats.map((stat, index) => (
        <Box key={index} textAlign="center">
          <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="black" color="brand.400" lineHeight={1}>
            {stat.value}
          </Text>
          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">
            {stat.label}
          </Text>
        </Box>
      ))}
    </Grid>
  );
};

export default StatsStrip;
