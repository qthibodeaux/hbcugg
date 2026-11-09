import { Box, Text, Flex } from "@chakra-ui/react";

export const ProductionHeader = ({ title, color }) => (
  <Box
    w="full"
    bg={color || "brand.500"}
    py="0.313rem"
    px="0.625rem"
    borderRadius="0.25rem"
    mb="0.375rem"
    flexShrink={0}
  >
    <Text
      fontSize="0.688rem"
      fontWeight="950"
      color="white"
      textTransform="uppercase"
      letterSpacing="0.06em"
      lineHeight={1}
    >
      {title}
    </Text>
  </Box>
);

export const ProductionPill = ({ label, value, sub, color, isNegative, isPositive }) => {
  let valColor = "text.primary";
  if (isNegative) valColor = "#E53E3E";
  else if (isPositive) valColor = "#48BB78";

  return (
    <Flex
      direction="row"
      align="center"
      justify="space-between"
      bg="bg.card"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="0.375rem"
      px="0.5rem"
      py="0.375rem"
      h="full"
      flex={1}
      minW={0}
      position="relative"
      overflow="hidden"
      gap="0.375rem"
    >
      {/* Left accent border tick */}
      <Box position="absolute" top={0} bottom={0} left={0} w="0.25rem" bg={color || "whiteAlpha.300"} />

      {/* Value Left */}
      <Text
        fontFamily="heading"
        fontSize="1.3rem"
        fontWeight="950"
        color={valColor}
        pl="0.375rem"
        lineHeight={1}
        flexShrink={0}
      >
        {value}
      </Text>

      {/* Label and Sub-label Right */}
      <Flex direction="column" align="flex-end" justify="center" minW={0} flex={1}>
        <Text
          fontSize="0.55rem"
          fontWeight="950"
          color="text.muted"
          textTransform="uppercase"
          letterSpacing="0.03em"
          lineHeight={1.1}
          textAlign="right"
          lineClamp={1}
        >
          {label}
        </Text>
        {sub && (
          <Text
            fontSize="0.5rem"
            fontWeight="700"
            color="text.secondary"
            lineHeight={1}
            textAlign="right"
            lineClamp={1}
            mt="0.125rem"
          >
            {sub}
          </Text>
        )}
      </Flex>
    </Flex>
  );
};
