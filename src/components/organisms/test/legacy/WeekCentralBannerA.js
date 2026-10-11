/**
 * COMPONENT LAB — Week Central Banner 4x1 (Variant A)
 *
 * Slot:    Slot4x1
 * Date:    2026-04-13
 * Purpose: Identity banner for Week Central. Big "WEEK CENTRAL" headline,
 *          week number as a bold visual anchor, year selector controls.
 *          No subtitle clutter — let the type do the work.
 *
 * Design:  Split panel. Left: oversized week number as background art + label.
 *          Center: "WEEK CENTRAL" stacked editorial headline.
 *          Right: year pill controls + live context badge.
 *          Diagonal slash accent divides left from center.
 */

import { useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";

const SEASONS = [2021, 2022, 2023, 2024, 2025];
const MOCK_WEEK = 15;
const MOCK_WEEK_LABEL = "Celebration Bowl";

// ─── BANNER ────────────────────────────────────────────────────────────────
const WeekCentralBanner4x1 = ({ season, setSeason, currentWeek, weekLabel }) => (
  <Box
    position="relative"
    overflow="hidden"
    borderRadius="2xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    bg="#0B0B0D"
    h="100%"
    minH="160px"
  >
    {/* ── Background: oversized week number as art ── */}
    <Text
      position="absolute"
      right="-10px"
      top="50%"
      fontSize="200px"
      fontWeight="black"
      color="whiteAlpha.050"
      lineHeight={1}
      letterSpacing="-0.06em"
      userSelect="none"
      pointerEvents="none"
      style={{ transform: "translateY(-50%)" }}
    >
      {String(currentWeek).padStart(2, "0")}
    </Text>

    {/* ── Diagonal red slash accent ── */}
    <Box
      position="absolute"
      top={0}
      bottom={0}
      left="260px"
      w="3px"
      bg="brand.500"
      style={{ transform: "skewX(-12deg)", transformOrigin: "top" }}
      opacity={0.7}
    />

    {/* ── Left panel: week number badge ── */}
    <Flex
      position="absolute"
      left={0}
      top={0}
      bottom={0}
      w="260px"
      align="center"
      px={7}
      bg="linear-gradient(90deg, rgba(229,62,62,0.12) 0%, transparent 100%)"
    >
      <Box>
        <Text
          fontSize="9px"
          fontWeight="black"
          color="brand.500"
          textTransform="uppercase"
          letterSpacing="0.22em"
          mb={1}
        >
          {weekLabel ?? `Week ${currentWeek}`}
        </Text>
        <Text
          fontSize="7xl"
          fontWeight="black"
          color="white"
          lineHeight={0.85}
          letterSpacing="-0.05em"
        >
          {String(currentWeek).padStart(2, "0")}
        </Text>
      </Box>
    </Flex>

    {/* ── Center: headline ── */}
    <Flex
      position="absolute"
      left="290px"
      top={0}
      bottom={0}
      align="center"
    >
      <Box>
        <Text
          fontSize="5xl"
          fontWeight="black"
          color="white"
          textTransform="uppercase"
          lineHeight={0.88}
          letterSpacing="-0.04em"
        >
          WEEK
        </Text>
        <Text
          fontSize="5xl"
          fontWeight="black"
          color="brand.500"
          textTransform="uppercase"
          lineHeight={0.88}
          letterSpacing="-0.04em"
        >
          CENTRAL
        </Text>
        <Flex align="center" gap={2} mt={3}>
          <Box w="20px" h="1px" bg="brand.500" />
          <Text fontSize="9px" fontWeight="black" color="text.muted"
            textTransform="uppercase" letterSpacing="0.16em">
            SWAC & MEAC
          </Text>
        </Flex>
      </Box>
    </Flex>

    {/* ── Right panel: year controls ── */}
    <Flex
      position="absolute"
      right={0}
      top={0}
      bottom={0}
      align="center"
      pr={7}
      direction="column"
      justify="center"
      gap={3}
    >
      <Text fontSize="9px" fontWeight="black" color="text.muted"
        textTransform="uppercase" letterSpacing="0.16em">
        Season
      </Text>
      <Flex direction="column" gap={1}>
        {SEASONS.map((s) => (
          <Box
            key={s}
            as="button"
            px={4}
            py={1}
            borderRadius="full"
            cursor="pointer"
            bg={season === s ? "brand.500" : "whiteAlpha.100"}
            border="1px solid"
            borderColor={season === s ? "brand.500" : "whiteAlpha.200"}
            onClick={() => setSeason(s)}
            style={{ transition: "all 0.15s" }}
          >
            <Text
              fontSize="9px"
              fontWeight="black"
              color={season === s ? "white" : "text.muted"}
            >
              {s}
            </Text>
          </Box>
        ))}
      </Flex>
    </Flex>
  </Box>
);

// ─── LAB EXPORT ────────────────────────────────────────────────────────────
export const WeekCentralBannerA = () => {
  const [season, setSeason] = useState(2025);

  return (
    <Box h="200px">
      <WeekCentralBanner4x1
        season={season}
        setSeason={setSeason}
        currentWeek={MOCK_WEEK}
        weekLabel={MOCK_WEEK_LABEL}
      />
    </Box>
  );
};
