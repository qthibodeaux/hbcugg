import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";

export const WikiBannerCopilotNeonSplit = () => (
  <Box
    w="100%"
    minH="200px"
    borderRadius="2xl"
    border="2px solid"
    borderColor="brand.500"
    position="relative"
    overflow="hidden"
    p={{ base: 8, md: 12 }}
    bgGradient="linear(to-r, #0A7CFF 0%, #A259FF 100%)"
    boxShadow="0 0 32px #A259FF55"
    _before={{
      content: '""',
      position: "absolute",
      inset: 0,
      bgGradient: "linear(to-r, transparent 48%, #00C2B2 52%, transparent 56%)",
      opacity: 0.7,
      zIndex: 0,
      pointerEvents: "none",
      animation: "neonSplit 2.5s infinite alternate"
    }}
  >
    <Flex direction="row" align="center" justify="space-between" h="100%" position="relative" zIndex={1}>
      <Flex direction="column" gap={3} align="flex-start">
        <Text fontSize="xs" color="whiteAlpha.700" fontWeight="black" letterSpacing="0.18em" textTransform="uppercase">
          Schools Wiki
        </Text>
        <Text fontSize={{ base: "2xl", md: "4xl" }} fontWeight="black" color="white" textTransform="uppercase" letterSpacing="-0.04em">
          Neon Split Banner
        </Text>
        <Text fontSize="md" color="whiteAlpha.800" maxW="420px">
          Split neon gradient, animated border, bold left/right editorial split.
        </Text>
      </Flex>
      <CopilotNeonTag />
    </Flex>
    <style>{`
      @keyframes neonSplit {
        0% { box-shadow: 0 0 32px #A259FF55; }
        100% { box-shadow: 0 0 48px #00C2B2AA; }
      }
    `}</style>
  </Box>
);

export const CopilotNeonTag = () => (
  <Box
    px={4}
    py={2}
    borderRadius="full"
    bgGradient="linear(to-r, #0A7CFF 0%, #00C2B2 60%, #A259FF 100%)"
    boxShadow="0 2px 8px #A259FF55"
    fontSize="xs"
    fontWeight="bold"
    color="white"
    letterSpacing="0.08em"
    textTransform="uppercase"
    style={{ filter: "drop-shadow(0 0 12px #00C2B2)" }}
  >
    GitHub Copilot | GPT-4.1
  </Box>
);
