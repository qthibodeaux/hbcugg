import { Box, Grid, Text } from "@chakra-ui/react";

/**
 * DepthChart - Short/Medium/Deep completion percentage grid for QB passing
 * @param {Object} props
 * @param {Object} props.breakdown - Depth breakdown data with short, medium, deep keys
 */
const DepthChart = ({ breakdown }) => {
  if (!breakdown) return null;
  const zones = [
    { key: "short",  label: "Short" },
    { key: "medium", label: "Medium" },
    { key: "deep",   label: "Deep" },
  ];
  return (
    <Grid templateColumns="repeat(3,1fr)" gap={1} mt={2}>
      {zones.map(({ key, label }) => {
        const z = breakdown[key] ?? { attempts: 0, completions: 0 };
        const pctVal = z.attempts > 0 ? Math.round((z.completions / z.attempts) * 100) : 0;
        return (
          <Box key={key} bg="whiteAlpha.50" borderRadius="md" p={2} textAlign="center">
            <Text fontSize="9px" color="text.muted" textTransform="uppercase" letterSpacing="wide" mb={1}>{label}</Text>
            <Text fontSize="sm" fontWeight="black" color="text.primary">{z.completions}/{z.attempts}</Text>
            <Text fontSize="9px" color={pctVal >= 60 ? "green.400" : pctVal >= 40 ? "brand.400" : "text.muted"}>
              {pctVal}%
            </Text>
          </Box>
        );
      })}
    </Grid>
  );
};

export default DepthChart;
