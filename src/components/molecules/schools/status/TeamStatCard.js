import { Box, Text, Flex } from "@chakra-ui/react";
import { SectionLabel } from "./StatusPrimitives";

export const TeamStatCard = ({ team, stat }) => {
  const accent = stat?.accent || team?.colors?.secondary || "#F56565";
  const primary = team?.colors?.primary || "#1A1A1D";
  const value = stat?.value ?? "--";
  const label = stat?.label || "Team Stat";
  const sub = stat?.sub || "Pipeline stat pending";

  return (
    <Box w="full" h="full" bg={primary} border="1px solid" borderColor="whiteAlpha.100" overflow="hidden" position="relative" p={{ base: 3, lg: 4 }}>
      <Text
        position="absolute"
        right="-0.35rem"
        bottom="-0.9rem"
        fontSize="clamp(3rem, 8vw, 5rem)"
        fontWeight="black"
        color="whiteAlpha.100"
        lineHeight={1}
        pointerEvents="none"
      >
        {value}
      </Text>
      <Flex position="relative" zIndex={1} h="full" direction="column" justify="space-between" minH={0}>
        <SectionLabel label={label} color={accent} />
        <Box minW={0}>
          <Text fontSize="clamp(2rem, 6vw, 3.2rem)" fontWeight="black" color="text.primary" lineHeight={0.9} lineClamp={1}>
            {value}
          </Text>
          <Text mt={2} fontSize={{ base: "12px", lg: "14px" }} fontWeight="bold" color="whiteAlpha.800" lineHeight={1.25} lineClamp={2}>
            {sub}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};
