import { Flex, Box, Text } from "@chakra-ui/react";

// Section label shared by the player spotlight and coaching carousel.

export const SectionLabel = ({ label, color = "brand.500" }) => (
  <Flex align="center" gap={2} minW={0}>
    <Box w="7px" h="7px" borderRadius="full" bg={color} flexShrink={0} />
    <Text
      fontSize={{ base: "12px", lg: "15px" }}
      fontWeight="black"
      color="text.muted"
      textTransform="uppercase"
      letterSpacing="0.12em"
      lineClamp={1}
    >
      {label}
    </Text>
  </Flex>
);
