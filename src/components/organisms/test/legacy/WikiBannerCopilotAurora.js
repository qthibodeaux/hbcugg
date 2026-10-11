import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";

export const WikiBannerCopilotAurora = () => (
  <Box
    w="100%"
    minH="200px"
    borderRadius="2xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    position="relative"
    overflow="hidden"
    p={{ base: 8, md: 12 }}
    bgGradient="linear(to-r, #0A7CFF 0%, #00C2B2 40%, #A259FF 100%)"
    _before={{
      content: '""',
      position: "absolute",
      inset: 0,
      bgGradient: "radial-gradient(circle at 70% 30%, rgba(162,89,255,0.18) 0%, transparent 60%)",
      zIndex: 0,
    }}
  >
    <Flex direction="row" align="center" justify="space-between" h="100%" position="relative" zIndex={1}>
      <Flex direction="column" gap={3}>
        <Text fontSize="xs" color="whiteAlpha.700" fontWeight="black" letterSpacing="0.18em" textTransform="uppercase">
          Schools Wiki
        </Text>
        <Text fontSize={{ base: "2xl", md: "4xl" }} fontWeight="black" color="white" textTransform="uppercase" letterSpacing="-0.04em">
          Aurora Gradient Banner
        </Text>
        <Text fontSize="md" color="whiteAlpha.800" maxW="420px">
          Animated aurora gradient with a floating Copilot tag. Editorial, modern, and vibrant.
        </Text>
      </Flex>
      <CopilotAuroraTag />
    </Flex>
  </Box>
);

export const CopilotAuroraTag = () => (
  <Box
    px={4}
    py={2}
    borderRadius="full"
    bgGradient="linear(to-r, #0A7CFF 0%, #00C2B2 60%, #A259FF 100%)"
    boxShadow="0 2px 8px rgba(10,124,255,0.12)"
    fontSize="xs"
    fontWeight="bold"
    color="white"
    letterSpacing="0.08em"
    textTransform="uppercase"
    style={{ filter: "drop-shadow(0 0 12px #A259FF)" }}
  >
    GitHub Copilot | GPT-4.1
  </Box>
);
