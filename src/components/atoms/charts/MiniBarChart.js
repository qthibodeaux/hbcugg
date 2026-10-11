import { Box, Flex } from "@chakra-ui/react";

/**
 * MiniBarChart - Small bar chart for power rankings and trends
 * @param {Object} props
 * @param {string} props.color - Bar color (default: "brand.500")
 */
const MiniBarChart = ({ color = "brand.500" }) => (
  <Flex align="flex-end" gap={1} h={8}>
    {[40, 65, 80, 55, 70, 45, 90, 60].map((h, i) => (
      <Box
        key={i}
        w={2}
        h={`${h}%`}
        bg={color}
        borderRadius="sm"
        opacity={0.6 + (i % 3) * 0.2}
      />
    ))}
  </Flex>
);

export default MiniBarChart;
