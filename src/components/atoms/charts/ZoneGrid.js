import { Box, Grid, Text, Flex } from "@chakra-ui/react";

/**
 * ZoneGrid - Field zone completion percentages grid
 * @param {Object} props
 * @param {number} props.parScore - Player PAR score to calculate zone percentages
 */
const ZoneGrid = ({ parScore }) => {
  // Generate plausible zone completion % based on PAR
  const base = parScore ? Math.min(95, 50 + parScore * 1.2) : 60;
  const zones = [
    [Math.round(base - 14), Math.round(base - 8), Math.round(base - 18)],
    [Math.round(base - 4), Math.round(base + 1), Math.round(base - 10)],
    [Math.round(base + 6), Math.round(base + 10), Math.round(base + 3)],
  ];
  const labels = ["LEFT", "MID", "RIGHT"];

  const getBg = (val) => {
    if (val >= 85) return "rgba(229,62,62,0.7)";
    if (val >= 70) return "rgba(229,62,62,0.45)";
    if (val >= 55) return "rgba(229,62,62,0.25)";
    return "rgba(229,62,62,0.1)";
  };

  return (
    <Box>
      <Grid templateColumns="repeat(3, 1fr)" gap="2px" mb={2}>
        {zones.map((row, ri) =>
          row.map((val, ci) => (
            <Box
              key={`${ri}-${ci}`}
              bg={getBg(val)}
              borderRadius="sm"
              p={3}
              textAlign="center"
              border="1px solid"
              borderColor="whiteAlpha.100"
            >
              <Text fontSize="md" fontWeight="black" color="white">
                {val}%
              </Text>
            </Box>
          )),
        )}
      </Grid>
      <Grid templateColumns="repeat(3, 1fr)" gap="2px" mb={1}>
        {labels.map((l) => (
          <Text
            key={l}
            fontSize="8px"
            color="text.muted"
            textAlign="center"
            textTransform="uppercase"
            letterSpacing="0.1em"
          >
            {l}
          </Text>
        ))}
      </Grid>
      <Flex gap={3} mt={2} justify="center" flexWrap="wrap">
        {[
          { color: "rgba(229,62,62,0.1)", label: "Below Avg" },
          { color: "rgba(229,62,62,0.35)", label: "Neutral" },
          { color: "rgba(229,62,62,0.7)", label: "Elite Zone" },
        ].map(({ color, label }) => (
          <Flex key={label} align="center" gap={1}>
            <Box
              w="10px"
              h="10px"
              bg={color}
              borderRadius="2px"
              border="1px solid rgba(255,255,255,0.1)"
            />
            <Text fontSize="8px" color="text.muted">
              {label}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
};

export default ZoneGrid;
