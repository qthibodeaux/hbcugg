/**
 * COMPONENT LAB — Week Central Banner 4x1 (Variant C)
 *
 * Slot:    Slot4x1
 * Date:    2026-04-13
 *
 * Design:  Magazine cover energy. Full-bleed red-to-black gradient.
 *          Massive italic stacked type. Week number as a white knockout badge
 *          cutting through the headline. Year controls as a minimal right panel.
 */

import { useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import useMountEffect from "../../../hooks/useMountEffect";

const SEASONS = [2021, 2022, 2023, 2024, 2025];
const MOCK_WEEK = 15;
const MOCK_WEEK_LABEL = "Celebration Bowl";

const TICK_HOLD = 4000;
const TICK_FADE = 500;
const TICKER_LINES = ["WK 15 · CELEBRATION BOWL", "LEAGUE-WIDE SCHEDULE & RESULTS", "SWAC & MEAC"];

const useSubTicker = (lines) => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  useMountEffect(() => {
    let current = 0;
    let holdTimer, fadeTimer;
    const cycle = () => {
      setVisible(true);
      holdTimer = setTimeout(() => {
        setVisible(false);
        fadeTimer = setTimeout(() => {
          current = (current + 1) % lines.length;
          setIndex(current);
          cycle();
        }, TICK_FADE);
      }, TICK_HOLD);
    };
    cycle();
    return () => { clearTimeout(holdTimer); clearTimeout(fadeTimer); };
  });
  return { line: lines[index], visible };
};

const WeekCentralBanner4x1C = ({ season, setSeason, currentWeek, weekLabel }) => {
  const { line, visible } = useSubTicker(TICKER_LINES);
  return (
  <Box
    position="relative"
    overflow="hidden"
    borderRadius="2xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    h="100%"
    minH="160px"
    bg="linear-gradient(110deg, #E53E3E 0%, #9B1C1C 28%, #1A0505 58%, #0B0B0D 100%)"
  >
    {/* Ghost watermark — "CENTRAL" huge behind everything */}
    <Text
      position="absolute"
      bottom="-20px"
      left="0"
      fontWeight="black"
      fontStyle="italic"
      color="white"
      opacity={0.05}
      textTransform="uppercase"
      lineHeight={1}
      letterSpacing="-0.05em"
      pointerEvents="none"
      userSelect="none"
      whiteSpace="nowrap"
      style={{ fontSize: "clamp(80px, 16vw, 180px)" }}
    >
      CENTRAL
    </Text>

    {/* Layout */}
    <Flex h="100%" align="stretch">

      {/* Left: headline block */}
      <Flex flex={1} align="center" pl={8} pr={6}>
        <Box>
          {/* WEEK CENTRAL + week number badge inline */}
          <Flex align="flex-end" gap={3}>
            <Text
              fontWeight="black"
              fontStyle="italic"
              color="white"
              textTransform="uppercase"
              lineHeight={0.85}
              letterSpacing="-0.04em"
              whiteSpace="nowrap"
              style={{ fontSize: "clamp(2rem, 5.5vw, 6rem)" }}
            >
              WEEK CENTRAL
            </Text>
            <Box
              px={3}
              py={1}
              bg="white"
              borderRadius="md"
              flexShrink={0}
              mb="6px"
            >
              <Text
                fontSize="xl"
                fontWeight="black"
                color="#E53E3E"
                lineHeight={1}
                letterSpacing="-0.02em"
              >
                {String(currentWeek).padStart(2, "0")}
              </Text>
            </Box>
          </Flex>

          {/* Editorial + ticker — same row */}
          <Flex align="center" gap={3} mt={3}>
            <Box h="1px" w="28px" bg="rgba(255,255,255,0.3)" flexShrink={0} />
            <Text fontWeight="black" color="rgba(255,255,255,0.5)" textTransform="uppercase" letterSpacing="0.18em" whiteSpace="nowrap" style={{ fontSize: "clamp(7px, 0.9vw, 9px)" }}>
              THIS WEEK IN HBCU FOOTBALL
            </Text>
            <Box w="1px" h="10px" bg="rgba(255,255,255,0.2)" flexShrink={0} />
            <Text fontWeight="black" color="rgba(255,255,255,0.28)" textTransform="uppercase" letterSpacing="0.15em" whiteSpace="nowrap" style={{ fontSize: "clamp(7px, 0.9vw, 9px)", opacity: visible ? 1 : 0, transition: `opacity ${TICK_FADE}ms ease` }}>
              {line}
            </Text>
          </Flex>
        </Box>
      </Flex>

      {/* Hairline separator */}
      <Box w="1px" bg="rgba(255,255,255,0.12)" my={6} flexShrink={0} />

      {/* Right: year controls */}
      <Flex
        direction="column"
        justify="center"
        align="center"
        px={7}
        gap={1}
        flexShrink={0}
      >
        <Text
          fontSize="8px"
          fontWeight="black"
          color="rgba(255,255,255,0.35)"
          textTransform="uppercase"
          letterSpacing="0.22em"
          mb={2}
        >
          Season
        </Text>
        {SEASONS.map((s) => (
          <Box
            key={s}
            as="button"
            w="56px"
            py={1}
            borderRadius="sm"
            cursor="pointer"
            bg={season === s ? "rgba(255,255,255,0.18)" : "transparent"}
            border="1px solid"
            borderColor={season === s ? "rgba(255,255,255,0.45)" : "transparent"}
            onClick={() => setSeason(s)}
            style={{ transition: "all 0.15s" }}
          >
            <Text
              fontSize="9px"
              fontWeight="black"
              textAlign="center"
              color={season === s ? "white" : "rgba(255,255,255,0.3)"}
            >
              {s}
            </Text>
          </Box>
        ))}
      </Flex>

    </Flex>
  </Box>
  );
};

export const WeekCentralBannerC = ({ season: extSeason, setSeason: extSetSeason, currentWeek, weekLabel } = {}) => {
  const [intSeason, setIntSeason] = useState(2025);
  const season    = extSeason    !== undefined ? extSeason    : intSeason;
  const setSeason = extSetSeason !== undefined ? extSetSeason : setIntSeason;
  return (
    <WeekCentralBanner4x1C
      season={season}
      setSeason={setSeason}
      currentWeek={currentWeek ?? MOCK_WEEK}
      weekLabel={weekLabel ?? MOCK_WEEK_LABEL}
    />
  );
};
