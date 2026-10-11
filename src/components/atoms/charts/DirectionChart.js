import { Box, Flex, Text } from "@chakra-ui/react";

/**
 * DirectionChart - Left/Middle/Right breakdown bars for rushing plays
 * @param {Object} props
 * @param {Object} props.breakdown - Direction breakdown data with left, middle, right keys
 */
const DirectionChart = ({ breakdown }) => {
  if (!breakdown) return null;
  const dirs = [
    { key: "left",   label: "L" },
    { key: "middle", label: "M" },
    { key: "right",  label: "R" },
  ];
  const maxAtt = Math.max(...dirs.map((d) => breakdown[d.key]?.attempts ?? 0), 1);
  return (
    <Flex gap={2} mt={2}>
      {dirs.map(({ key, label }) => {
        const d = breakdown[key] ?? { attempts: 0, yards: 0 };
        const barH = Math.max(4, Math.round((d.attempts / maxAtt) * 24));
        return (
          <Box key={key} flex={1} textAlign="center">
            <Text fontSize="9px" color="text.muted" mb={1}>{label}</Text>
            <Flex justify="center" align="flex-end" h="28px">
              <Box
                w="10px" bg={d.attempts > 0 ? "brand.500" : "whiteAlpha.100"}
                borderRadius="sm" style={{ height: `${barH}px` }}
                opacity={d.attempts > 0 ? 0.8 : 0.3}
              />
            </Flex>
            <Text fontSize="9px" color="text.secondary" mt={1}>{d.attempts}att</Text>
            <Text fontSize="9px" color="text.muted">{d.yards}yds</Text>
          </Box>
        );
      })}
    </Flex>
  );
};

export default DirectionChart;
