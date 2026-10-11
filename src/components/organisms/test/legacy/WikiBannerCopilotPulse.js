import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";

export const WikiBannerCopilotPulse = () => (
  <Box
    w="100%"
    minH="200px"
    borderRadius="2xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    position="relative"
    overflow="hidden"
    p={{ base: 8, md: 12 }}
    bg="bg.primary"
  >
    {/* Pulsing radial background */}
    <Box
      position="absolute"
      inset={0}
      bg="radial-gradient(circle at 60% 40%, #A259FF33 0%, transparent 70%)"
      zIndex={0}
      style={{ animation: "pulseGlow 2.5s infinite alternate" }}
    />
    {/* Floating pulse dots */}
    {[...Array(7)].map((_, i) => (
      <Box
        key={i}
        position="absolute"
        left={`${12 + i * 12}%`}
        top={`${30 + Math.sin(i) * 10}%`}
        w="14px"
        h="14px"
        borderRadius="full"
        bg={i % 2 === 0 ? "#0A7CFF" : "#00C2B2"}
        opacity={0.18 + i * 0.07}
        style={{ animation: `pulseDot${i} 2.2s ${i * 0.18}s infinite alternate` }}
        zIndex={0}
      />
    ))}
    <Flex direction="row" align="center" justify="space-between" h="100%" position="relative" zIndex={1}>
      <Flex direction="column" gap={3}>
        <Text fontSize="xs" color="brand.400" fontWeight="black" letterSpacing="0.18em" textTransform="uppercase">
          Schools Wiki
        </Text>
        <Text fontSize={{ base: "2xl", md: "4xl" }} fontWeight="black" color="white" textTransform="uppercase" letterSpacing="-0.04em">
          Pulse Banner
        </Text>
        <Text fontSize="md" color="text.secondary" maxW="420px">
          Pulsing radial background, floating pulse dots, Copilot tag with animated glow.
        </Text>
      </Flex>
      <CopilotPulseTag />
    </Flex>
    <style>{`
      @keyframes pulseGlow {
        0% { opacity: 0.7; }
        100% { opacity: 1; }
      }
      ${[...Array(7)].map((_, i) => `
        @keyframes pulseDot${i} {
          0% { transform: scale(1); opacity: ${0.18 + i * 0.07}; }
          100% { transform: scale(1.4); opacity: ${0.32 + i * 0.09}; }
        }
      `).join("")}
    `}</style>
  </Box>
);

export const CopilotPulseTag = () => (
  <Box
    px={4}
    py={2}
    borderRadius="full"
    bgGradient="linear(to-r, #0A7CFF 0%, #00C2B2 60%, #A259FF 100%)"
    boxShadow="0 2px 16px #A259FF55"
    fontSize="xs"
    fontWeight="bold"
    color="white"
    letterSpacing="0.08em"
    textTransform="uppercase"
    style={{ filter: "drop-shadow(0 0 16px #A259FF)" }}
  >
    GitHub Copilot | GPT-4.1
  </Box>
);
