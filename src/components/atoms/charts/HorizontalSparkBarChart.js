import { Box, Flex } from "@chakra-ui/react";

/**
 * HorizontalSparkBarChart - Generic tiny vertical-bar trend chart.
 * Reusable across player/team/coach/official cards.
 */
const HorizontalSparkBarChart = ({
  values = [],
  height = "60px",
  gap = "3px",
  baseColor = "whiteAlpha.200",
  highlightColor = "brand.500",
  highlightIndex,
  minBarPercent = 0,
  animate = true,
}) => {
  if (!values.length) return null;

  const maxValue = Math.max(...values, 1);
  const activeIndex =
    typeof highlightIndex === "number" ? highlightIndex : values.length - 1;

  return (
    <Flex align="flex-end" gap={gap} h={height}>
      {values.map((value, index) => {
        const normalized = (value / maxValue) * 100;
        const barHeight = Math.max(minBarPercent, normalized);
        return (
          <Box
            key={`${index}-${value}`}
            flex={1}
            h={`${barHeight}%`}
            bg={index === activeIndex ? highlightColor : baseColor}
            borderRadius="sm"
            transition={animate ? "height 0.3s ease" : "none"}
          />
        );
      })}
    </Flex>
  );
};

export default HorizontalSparkBarChart;
