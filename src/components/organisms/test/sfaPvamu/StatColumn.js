import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { statRows, EPA_ROWS, formatMetric } from "./previewModel";

// Historical matchup comparison column and per-metric presentation.

export const StatColumn = ({ teamKey, data, isFirst = false }) => {
  const { title, accent } = data;
  const isDefense = teamKey.endsWith("Defense");

  return (
    <Box
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg="rgba(17,17,19,0.92)"
      borderRadius="lg"
      overflow="hidden"
      minH="100%"
      boxShadow={isFirst ? "inset 0 0 0 1px rgba(255,255,255,0.04)" : "none"}
    >
      <Flex
        align="center"
        justify="space-between"
        px={3}
        py={3}
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
        bg="linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)"
      >
        <Text fontSize="11px" fontWeight="900" color="text.primary" letterSpacing="0.12em" textTransform="uppercase">
          {title}
        </Text>
        <Box
          minW="28px"
          h="20px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="full"
          bg={accent}
          color="white"
          fontSize="10px"
          fontWeight="800"
          px={1}
        >
          {data.games} GP
        </Box>
      </Flex>

      <VStack gap={0} align="stretch">
        {statRows.map((row, index) => {
          const currentValue = data.metrics[row.key];
          // Only the signed EPA rows carry a colour: green when the number is good
          // for this side of the ball (offense above zero, defense below).
          const tone = !EPA_ROWS.has(row.key) || currentValue === 0
            ? "text.primary"
            : (isDefense ? currentValue < 0 : currentValue > 0)
              ? "#9AE6B4"
              : "#F7B2A8";

          return (
            <Flex
              key={`${teamKey}-${row.key}`}
              align="center"
              justify="space-between"
              gap={2}
              px={3}
              py={2.5}
              borderBottom={index < statRows.length - 1 ? "1px solid" : "none"}
              borderColor="whiteAlpha.100"
              bg={index % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent"}
            >
              <Text fontSize="10px" fontWeight="700" color="text.secondary" letterSpacing="0.05em">
                {row.label}
              </Text>

              <Text fontSize="15px" fontWeight="800" color={tone} letterSpacing="-0.02em" fontVariantNumeric="tabular-nums">
                {formatMetric(row.key, currentValue)}
              </Text>
            </Flex>
          );
        })}
      </VStack>
    </Box>
  );
};
