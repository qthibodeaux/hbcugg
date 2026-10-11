/**
 * COMPONENT LAB — Week Central Banner 4x1 (Variant B)
 *
 * Slot:    Slot4x1
 * Date:    2026-04-13
 *
 * Design:  Stadium scoreboard. Dark segmented-display aesthetic.
 *          "WEEK CENTRAL" in a broadcast ticker font treatment.
 *          Week number rendered like a Daktronics LED board — chunky, glowing.
 *          Year controls as a horizontal strip across the bottom edge.
 */

import { useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";

const SEASONS = [2021, 2022, 2023, 2024, 2025];
const MOCK_WEEK = 15;
const MOCK_WEEK_LABEL = "Celebration Bowl";

// Segment-style digit — each "digit" is a box with inner glow
const ScoreDigit = ({ char, color = "#E53E3E" }) => (
  <Box
    px={3}
    py={1}
    bg="rgba(0,0,0,0.6)"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="md"
    style={{
      boxShadow: `inset 0 0 12px rgba(0,0,0,0.8), 0 0 8px ${color}33`,
    }}
  >
    <Text
      fontSize="5xl"
      fontWeight="black"
      lineHeight={1}
      letterSpacing="-0.02em"
      color={color}
      style={{
        fontVariantNumeric: "tabular-nums",
        textShadow: `0 0 20px ${color}99, 0 0 40px ${color}44`,
      }}
    >
      {char}
    </Text>
  </Box>
);

const WeekCentralBanner4x1B = ({ season, setSeason, currentWeek, weekLabel }) => {
  const digits = String(currentWeek).padStart(2, "0").split("");

  return (
    <Box
      position="relative"
      overflow="hidden"
      borderRadius="2xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      h="100%"
      minH="160px"
      bg="linear-gradient(180deg, #0D0D0F 0%, #080809 100%)"
    >
      {/* Subtle scanline texture */}
      <Box
        position="absolute"
        inset={0}
        pointerEvents="none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 4px)",
        }}
      />

      {/* Top ticker line */}
      <Flex
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="3px"
        overflow="hidden"
      >
        <Box flex={1} bg="brand.500" opacity={0.9} />
        <Box flex={1} bg="whiteAlpha.200" />
        <Box flex={1} bg="brand.500" opacity={0.5} />
      </Flex>

      {/* Main content */}
      <Flex h="100%" align="center" px={8} gap={10}>

        {/* Left: scoreboard digits */}
        <Flex align="center" gap={2} flexShrink={0}>
          <Box mr={2}>
            <Text fontSize="9px" fontWeight="black" color="brand.500"
              textTransform="uppercase" letterSpacing="0.22em" mb={2}>
              Week
            </Text>
            <Flex gap={2}>
              {digits.map((d, i) => (
                <ScoreDigit key={i} char={d} color="#E53E3E" />
              ))}
            </Flex>
          </Box>
        </Flex>

        {/* Separator */}
        <Box w="1px" alignSelf="stretch" my={6} bg="whiteAlpha.100" flexShrink={0} />

        {/* Center: label + title */}
        <Box flex={1}>
          <Flex align="center" gap={3} mb={2}>
            {/* Pulsing live dot */}
            <Box
              w="6px" h="6px" borderRadius="full" bg="brand.500" flexShrink={0}
              style={{ animation: "wcPulseB 2s ease-in-out infinite" }}
            />
            <Text fontSize="9px" fontWeight="black" color="brand.500"
              textTransform="uppercase" letterSpacing="0.22em">
              {weekLabel ?? `Week ${currentWeek}`}
            </Text>
          </Flex>
          <Text
            fontSize="4xl"
            fontWeight="black"
            color="white"
            textTransform="uppercase"
            lineHeight={0.9}
            letterSpacing="-0.03em"
          >
            WEEK CENTRAL
          </Text>
          <Text fontSize="10px" color="whiteAlpha.400" mt={3}
            fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
            SWAC · MEAC · LEAGUE-WIDE
          </Text>
        </Box>

        {/* Separator */}
        <Box w="1px" alignSelf="stretch" my={6} bg="whiteAlpha.100" flexShrink={0} />

        {/* Right: year controls */}
        <Flex gap={2} flexShrink={0} flexWrap="wrap" maxW="160px" justify="flex-end">
          {SEASONS.map((s) => (
            <Box
              key={s}
              as="button"
              px={3}
              py={1}
              borderRadius="sm"
              cursor="pointer"
              bg={season === s ? "brand.500" : "rgba(255,255,255,0.05)"}
              border="1px solid"
              borderColor={season === s ? "brand.500" : "whiteAlpha.100"}
              onClick={() => setSeason(s)}
              style={{
                transition: "all 0.15s",
                boxShadow: season === s ? "0 0 12px rgba(229,62,62,0.4)" : "none",
              }}
            >
              <Text fontSize="9px" fontWeight="black"
                color={season === s ? "white" : "whiteAlpha.500"}
                style={{ fontVariantNumeric: "tabular-nums" }}>
                {s}
              </Text>
            </Box>
          ))}
        </Flex>

      </Flex>

      {/* Bottom accent line */}
      <Box position="absolute" bottom={0} left={0} right={0} h="2px"
        bg="linear-gradient(90deg, transparent, rgba(229,62,62,0.4), transparent)" />

      <style>{`
        @keyframes wcPulseB {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.3; transform: scale(0.7); }
        }
      `}</style>
    </Box>
  );
};

export const WeekCentralBannerB = () => {
  const [season, setSeason] = useState(2025);
  return (
    <Box h="200px">
      <WeekCentralBanner4x1B
        season={season}
        setSeason={setSeason}
        currentWeek={MOCK_WEEK}
        weekLabel={MOCK_WEEK_LABEL}
      />
    </Box>
  );
};
