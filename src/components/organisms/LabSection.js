import { Box, Text, Flex } from "@chakra-ui/react";
import { Zap } from "lucide-react";

/**
 * LabSection - The Lab VS Protocol section for player comparisons
 */
const LabSection = () => (
  <Box
    mb={10}
    p={{ base: 6, md: 10 }}
    borderRadius="xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    bg="linear-gradient(135deg, rgba(11,11,13,0.9) 0%, rgba(229,62,62,0.04) 100%)"
    position="relative"
    overflow="hidden"
  >
    <Box
      position="absolute"
      top="-40px"
      right="-40px"
      w="200px"
      h="200px"
      borderRadius="full"
      bg="brand.500"
      opacity={0.03}
      pointerEvents="none"
    />
    <Text
      fontSize={{ base: "2xl", md: "4xl" }}
      fontWeight="black"
      color="white"
      textTransform="uppercase"
      letterSpacing="-0.01em"
      mb={2}
    >
      The Lab:{" "}
      <Text as="span" color="brand.400" fontStyle="italic">
        VS Protocol
      </Text>
    </Text>
    <Text fontSize="sm" color="text.secondary" mb={6} maxW="540px">
      Compare player-to-player or roster-to-roster. Our engine calculates
      matchup advantages, fatigue probability, and clutch performance indices
      using 10 years of HBCU historical data.
    </Text>
    <Flex gap={3} flexWrap="wrap">
      <Box
        as="button"
        px={6}
        py="11px"
        bg="transparent"
        border="2px solid"
        borderColor="white"
        color="white"
        borderRadius="md"
        fontSize="11px"
        fontWeight="bold"
        letterSpacing="0.08em"
        textTransform="uppercase"
        _hover={{ bg: "whiteAlpha.100" }}
        transition="all 0.15s"
        whiteSpace="nowrap"
        display="flex"
        alignItems="center"
        gap={2}
      >
        Comparison Tool <Zap size={12} />
      </Box>
    </Flex>
  </Box>
);

export default LabSection;
