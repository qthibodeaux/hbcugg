import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Grid,
  VStack,
  // eslint-disable-next-line no-unused-vars
  HStack,
  // eslint-disable-next-line no-unused-vars
  Button,
  Image,
} from "@chakra-ui/react";

// Helper utilities for clean name formatting (Last name only for tables)
export const getLastName = (name) => {
  if (!name) return "Unknown";
  if (!name.includes(",")) return name;
  return name.split(",")[0].trim();
};

export const getDisplayName = (name) => {
  if (!name) return "Unknown";
  if (!name.includes(",")) return name;
  const parts = name.split(",");
  return `${parts[1].trim()} ${parts[0].trim()}`;
};

export const getInitials = (name) => {
  if (!name) return "??";
  if (!name.includes(",")) return name.slice(0, 2).toUpperCase();
  const parts = name.split(",");
  return `${parts[1].trim()[0] || ""}${parts[0].trim()[0] || ""}`;
};

/**
 * 1. ProductionHeader
 * Vibrant, solid, flat team-colored header bar with 100% opacity for bold, audacious identity.
 */
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

/**
 * 2. ProductionPill
 * Responsive, wide flat metric card. Uses a single-row horizontal layout in rems.
 */
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

/**
 * 3. SmartTable
 * Standardized table using the Flex Box Lock, locked row heights, and single-row LAST NAME BIG AND BOLD format.
 * Injects automatic pagination bar in rems when row count exceeds the limit.
 */
export const SmartTable = ({ headers = [], data = [], limit = 5, renderRow, activeKey, onSelect, accentColor }) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(data.length / limit);
  const hasPagination = totalPages > 1;
  const startIndex = page * limit;
  const visibleData = data.slice(startIndex, startIndex + limit);

  // Column templates (maximize horizontal space)
  const colTemplate = ["1.3fr", ...Array(headers.length - 1).fill("0.6fr")].join(" ");

  return (
    <Flex direction="column" h="full" minH={0} justify="space-between" w="full">
      <Flex flex={1} minH={0} w="full" direction="row" align="stretch">
        {/* Left Gutter Pagination Track (Page buttons on the left!) */}
        {hasPagination && (
          <Flex
            direction="column"
            w="18px"
            bg="rgba(0,0,0,0.2)"
            borderRight="1px solid"
            borderColor="whiteAlpha.100"
            flexShrink={0}
            h="full"
            mr="0.375rem"
          >
            {/* UP Page Arrow */}
            <Flex
              flex={1}
              align="center"
              justify="center"
              cursor={page === 0 ? "not-allowed" : "pointer"}
              opacity={page === 0 ? 0.2 : 0.7}
              pointerEvents={page === 0 ? "none" : "auto"}
              _hover={page !== 0 ? { bg: "whiteAlpha.150", opacity: 1, color: accentColor || "brand.500" } : {}}
              transition="all 0.2s"
              color="text.secondary"
              onClick={() => {
                if (page > 0) setPage(page - 1);
              }}
            >
              <Text fontSize="11px" fontWeight="black">
                ▲
              </Text>
            </Flex>

            {/* Divider */}
            <Box h="1px" bg="whiteAlpha.100" w="full" />

            {/* DOWN Page Arrow */}
            <Flex
              flex={1}
              align="center"
              justify="center"
              cursor={page === totalPages - 1 ? "not-allowed" : "pointer"}
              opacity={page === totalPages - 1 ? 0.2 : 0.7}
              pointerEvents={page === totalPages - 1 ? "none" : "auto"}
              _hover={page !== totalPages - 1 ? { bg: "whiteAlpha.150", opacity: 1, color: accentColor || "brand.500" } : {}}
              transition="all 0.2s"
              color="text.secondary"
              onClick={() => {
                if (page < totalPages - 1) setPage(page + 1);
              }}
            >
              <Text fontSize="11px" fontWeight="black">
                ▼
              </Text>
            </Flex>
          </Flex>
        )}

        <VStack align="stretch" gap={0} flex={1} minH={0} w="full">
          {/* Table Headers */}
          <Grid templateColumns={colTemplate} gap={1} py="0.25rem" borderBottom="1px solid" borderColor="whiteAlpha.200" flexShrink={0} w="full">
            {headers.map((h, i) => (
              <Text
                key={i}
                fontSize="0.55rem"
                fontWeight="900"
                color="text.muted"
                textTransform="uppercase"
                letterSpacing="0.05em"
                textAlign={i === 0 ? "left" : "right"}
              >
                {h}
              </Text>
            ))}
          </Grid>

          {/* Scroll Pinned Rows */}
          <Box flex={1} overflow="hidden" minH={0} w="full">
            {visibleData.map((item, index) => {
              const isActive = activeKey && item.key === activeKey;
              return (
                <Grid
                  key={item.key || index}
                  templateColumns={colTemplate}
                  gap={1}
                  py="0.25rem"
                  alignItems="center"
                  cursor={onSelect ? "pointer" : "default"}
                  bg={isActive ? "whiteAlpha.100" : "transparent"}
                  borderLeft={isActive && accentColor ? `3px solid ${accentColor}` : "3px solid transparent"}
                  borderBottom="1px solid"
                  borderColor="whiteAlpha.50"
                  _hover={onSelect ? { bg: "whiteAlpha.50" } : {}}
                  onClick={() => onSelect && onSelect(item)}
                  w="full"
                >
                  {renderRow(item)}
                </Grid>
              );
            })}
            {data.length === 0 && (
              <Flex align="center" justify="center" h="5.5rem">
                <Text fontSize="0.625rem" color="text.muted">No entries found</Text>
              </Flex>
            )}
          </Box>
        </VStack>
      </Flex>

      {/* Low-profile bottom indicator label */}
      {hasPagination && (
        <Flex justify="flex-start" align="center" pt="0.125rem" pl={hasPagination ? "24px" : 0} flexShrink={0}>
          <Text fontSize="0.48rem" fontWeight="900" color="text.muted" textTransform="uppercase" letterSpacing="0.02em">
            PAGE {page + 1} OF {totalPages}
          </Text>
        </Flex>
      )}
    </Flex>
  );
};

/**
 * 4. PlayerSpotlight
 * The cohesive visual showcase container for player spotlights.
 * Implements the core 58/42 split wrapper, the 88x88px initials avatar, stats grid, and custom signature progress bars.
 * Dynamically renders the highly audacious 3x3 green Passing Sector Grid or the 3x1 Rushing Lane Deck.
 */
// Sector Heatmap color scaling utility (flat interpolation from nearly white grey to team color)
const getSectorStyle = (sector, teamColor) => {
  const att = sector.attempts || 0;
  const comp = sector.completions || 0;
  const rate = att > 0 ? comp / att : 0;

  // Start color: flat really light, nearly white-type grey (#F3F4F6)
  const startR = 243;
  const startG = 244;
  const startB = 246;

  // End color: team primary color
  const hex = teamColor || "#E53E3E";
  const cleanHex = hex.replace("#", "");
  const endR = parseInt(cleanHex.substring(0, 2), 16) || 229;
  const endG = parseInt(cleanHex.substring(2, 4), 16) || 62;
  const endB = parseInt(cleanHex.substring(4, 6), 16) || 62;

  // Factor represents the progress (0 for empty or 0%, up to 1 for 100%)
  const factor = att > 0 ? rate : 0;

  const r = Math.round(startR + factor * (endR - startR));
  const g = Math.round(startG + factor * (endG - startG));
  const b = Math.round(startB + factor * (endB - startB));

  const bg = `rgb(${r}, ${g}, ${b})`;
  const borderColor = `rgba(${r}, ${g}, ${b}, 0.85)`;

  // For high contrast: use dark text on light backgrounds (factor < 0.5) and light text on dark backgrounds (factor >= 0.5)
  const isLightBg = factor < 0.5;
  const textColor = isLightBg ? "#141416" : "#FFFFFF";
  const subColor = isLightBg ? "#4A5568" : "rgba(255,255,255,0.85)";
  const hoverBg = `rgba(${r}, ${g}, ${b}, 0.9)`;

  return {
    bg,
    borderColor,
    hoverBg,
    hoverBorder: `rgb(${r}, ${g}, ${b})`,
    textColor,
    subColor
  };
};

const getReadableColor = (hex) => {
  if (!hex) return "#FFFFFF";
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2];
  }
  
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  
  // Relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // If too dark (luminance < 0.35), blend with 55% white to make it a bright, high-contrast pastel hex
  if (luminance < 0.35) {
    const newR = Math.round(r + (255 - r) * 0.55);
    const newG = Math.round(g + (255 - g) * 0.55);
    const newB = Math.round(b + (255 - b) * 0.55);
    const toHex = (c) => {
      const h = c.toString(16);
      return h.length === 1 ? "0" + h : h;
    };
    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
  }
  return hex;
};

export const PlayerSpotlight = ({ player, teamColors, metrics = [], signatureBar = [], variant = "rushing", imageUrl }) => {
  const primary = teamColors?.primary || "#141416";
  const secondary = teamColors?.secondary || "#A1A1AA";
  const accent = teamColors?.accent || "#E53E3E";
  const [imgError, setImgError] = useState(false);

  const isPassing = variant === "passing";

  return (
    <VStack gap="6px" align="stretch" w="full" h="full" minH={0}>
      {/* Spotlight Header card */}
      <Grid
        templateColumns="110px 1fr"
        gap="0px"
        border="1px solid"
        borderColor="whiteAlpha.100"
        p="0px"
        borderRadius="sm"
        bg="rgba(255,255,255,0.02)"
        flexShrink={0}
        overflow="hidden"
      >
        {/* Large Initials Avatar / Real Player headshot (FLUSH WITH EDGES) */}
        <Flex
          w="110px"
          h="110px"
          bg={primary}
          align="center"
          justify="center"
          borderRight={`2px solid ${accent}`}
          flexShrink={0}
          position="relative"
        >
          {imageUrl && !imgError ? (
            <Image
              src={imageUrl}
              alt={player.name}
              w="full"
              h="full"
              objectFit="cover"
              objectPosition="top"
              onError={() => setImgError(true)}
            />
          ) : (
            <Text fontSize="34px" fontWeight="950" color="white" letterSpacing="-0.06em">
              {getInitials(player.name)}
            </Text>
          )}
          <Box
            position="absolute"
            bottom="4px"
            right="4px"
            px="4px"
            py="1px"
            bg="black"
            borderRadius="xs"
            border="1px solid"
            borderColor="whiteAlpha.200"
            zIndex={2}
          >
            <Text fontSize="6px" fontWeight="900" color="text.primary">
              {player.position || "ATH"}
            </Text>
          </Box>
        </Flex>

        {/* Stats Grid & Spotlight Name */}
        <VStack align="stretch" justify="space-between" gap="4px" minW={0} py="8px" px="8px">
          <Box minW={0}>
            <Text fontSize="clamp(13px, 1.1vw, 15px)" fontWeight="955" color="text.primary" truncate>
              {getDisplayName(player.name)}
            </Text>
          </Box>

          {/* Custom stats grid: handles 2x3 grid dynamically for passing/receiving */}
          {metrics.length > 0 && (
            <Grid
              templateColumns={`repeat(${metrics.length === 6 ? 3 : metrics.length}, 1fr)`}
              gap="4px"
              py="1px"
              borderY="1px solid"
              borderColor="whiteAlpha.100"
            >
              {metrics.map((m, i) => (
                <Flex
                  key={i}
                  direction="column"
                  align="center"
                  justify="center"
                  bg="rgba(255,255,255,0.03)"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                  borderRadius="sm"
                  py="4px"
                  px="2px"
                >
                  <Text fontSize="0.425rem" color="text.muted" fontWeight="900" letterSpacing="-0.01em" lineHeight={1} whiteSpace="nowrap">
                    {m.label}
                  </Text>
                  <Text fontSize="0.6875rem" fontWeight="950" color={m.color || "text.primary"} mt="0.125rem" lineHeight={1} whiteSpace="nowrap">
                    {m.value}
                  </Text>
                </Flex>
              ))}
            </Grid>
          )}
        </VStack>
      </Grid>

      {/* ── Custom Tab overlays (The highly audited specialized layouts) ── */}
      <Box flex={1} minH={0} w="full">
        {isPassing ? (
          /* A: Dynamic Passing Sector Map (Highly Audacious 3x3 Heatmap with Row/Col Labels on Outside) */
          <Grid templateColumns="42px 1fr" templateRows="1fr 18px" gap="4px" h="full" w="full">
            {/* Left Column: Row Labels */}
            <VStack justify="space-around" align="flex-end" pr="6px" py="8px" h="full" gap={0}>
              <Flex direction="column" align="flex-end">
                <Text fontSize="7.5px" fontWeight="950" color="text.primary" textTransform="uppercase" letterSpacing="0.04em" lineHeight={1}>
                  DEEP
                </Text>
                <Text fontSize="7px" fontWeight="900" color="text.muted" textTransform="uppercase" mt="1px">
                  &gt;12
                </Text>
              </Flex>
              <Flex direction="column" align="flex-end">
                <Text fontSize="7.5px" fontWeight="950" color="text.primary" textTransform="uppercase" letterSpacing="0.04em" lineHeight={1}>
                  MED
                </Text>
                <Text fontSize="7px" fontWeight="900" color="text.muted" textTransform="uppercase" mt="1px">
                  4-12
                </Text>
              </Flex>
              <Flex direction="column" align="flex-end">
                <Text fontSize="7.5px" fontWeight="950" color="text.primary" textTransform="uppercase" letterSpacing="0.04em" lineHeight={1}>
                  SHORT
                </Text>
                <Text fontSize="7px" fontWeight="900" color="text.muted" textTransform="uppercase" mt="1px">
                  &lt;4
                </Text>
              </Flex>
            </VStack>

            {/* Right Column Top: 3x3 Sector Grid */}
            <Grid templateRows="repeat(3, 1fr)" templateColumns="repeat(3, 1fr)" gap="4px" h="full" w="full">
              {["deep", "medium", "short"].map((d) => {
                return ["left", "middle", "right"].map((dir) => {
                  const sector = player.sectors?.[d]?.[dir] || { completions: 0, attempts: 0, yards: 0 };
                  const style = getSectorStyle(sector, teamColors?.primary);

                  return (
                    <Flex
                      key={`${d}-${dir}`}
                      direction="column"
                      align="center"
                      justify="center"
                      bg={style.bg}
                      border="1px solid"
                      borderColor={style.borderColor}
                      borderRadius="sm"
                      p="2px"
                      _hover={{ bg: style.hoverBg, borderColor: style.hoverBorder }}
                      transition="all 0.15s"
                    >
                      <Text fontSize="13px" color={style.textColor} fontWeight="950" lineHeight={1}>
                        {sector.completions}/{sector.attempts}
                      </Text>
                      <Text fontSize="7.5px" color={style.subColor} fontWeight="800" textTransform="uppercase" mt="1.5px">
                        {sector.yards}y
                      </Text>
                    </Flex>
                  );
                });
              })}
            </Grid>

            {/* Bottom Left Spacer */}
            <Box />

            {/* Bottom Right Column Labels */}
            <Grid templateColumns="repeat(3, 1fr)" gap="4px" w="full" h="full" alignItems="center">
              {["LEFT", "MIDDLE", "RIGHT"].map((colLabel) => (
                <Text
                  key={colLabel}
                  fontSize="8px"
                  fontWeight="950"
                  color="text.muted"
                  textAlign="center"
                  letterSpacing="0.06em"
                  textTransform="uppercase"
                >
                  {colLabel}
                </Text>
              ))}
            </Grid>
          </Grid>
        ) : variant === "defense" ? (
          /* C: Dynamic Defensive Stoppage Cards (3x1 vertical decks) */
          <Grid templateColumns="repeat(3, 1fr)" gap="6px" h="full" w="full">
            {[
              {
                key: "run",
                label: "← RUN DEFENSE",
                value: player.tfl || 0,
                subLabel: "TACKLES FOR LOSS",
                metric1: "TACKLES",
                val1: player.tackles || 0,
                metric2: "FF / FR",
                val2: `${player.forced_fumbles || 0} / ${player.fumbles_recovered || 0}`,
                color: "#4A90D9"
              },
              {
                key: "rush",
                label: "↑ PASS RUSH",
                value: player.sacks || 0,
                subLabel: "SACKS FORCED",
                metric1: "SACKS",
                val1: player.sacks || 0,
                metric2: "HAVOC",
                val2: player.havoc || 0,
                color: "#48BB78"
              },
              {
                key: "cover",
                label: "COVER WINS →",
                value: (player.passes_defended || 0) + (player.interceptions || 0),
                subLabel: "DEFLECTIONS & INTS",
                metric1: "PBUs",
                val1: player.passes_defended || 0,
                metric2: "INTs",
                val2: player.interceptions || 0,
                color: "#ECC94B"
              }
            ].map((card) => {
              return (
                <Flex
                  key={card.key}
                  direction="column"
                  justify="space-between"
                  p="8px"
                  bg="rgba(255,255,255,0.02)"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                  borderTop={`3px solid ${card.color}`}
                  borderRadius="sm"
                  _hover={{ bg: "rgba(255,255,255,0.04)", borderTopWidth: "4px" }}
                >
                  <Flex align="center" gap={1}>
                    <Box w="3px" h="3px" bg={card.color} borderRadius="full" />
                    <Text fontSize="7px" color="text.muted" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em" truncate>
                      {card.label}
                    </Text>
                  </Flex>
                  <VStack align="stretch" gap={0} my="auto" py={1}>
                    <Text fontSize="clamp(18px, 1.4vw, 24px)" color="text.primary" fontWeight="950" lineHeight={1.0} letterSpacing="-0.04em">
                      {card.value}
                    </Text>
                    <Text fontSize="6px" color="text.muted" fontWeight="900" textTransform="uppercase">
                      {card.subLabel}
                    </Text>
                  </VStack>
                  <VStack align="stretch" gap="3px" borderTop="1px solid" borderColor="whiteAlpha.100" pt="4px">
                    <Flex align="center" justify="space-between">
                      <Text fontSize="6px" color="text.muted" fontWeight="800" textTransform="uppercase">{card.metric1}</Text>
                      <Text fontSize="7px" fontWeight="950" color="text.primary">
                        {card.val1}
                      </Text>
                    </Flex>
                    <Flex align="center" justify="space-between">
                      <Text fontSize="6px" color="text.muted" fontWeight="800" textTransform="uppercase">{card.metric2}</Text>
                      <Text fontSize="6.5px" color="text.secondary" fontWeight="900" textTransform="uppercase" whiteSpace="nowrap">
                        {card.val2}
                      </Text>
                    </Flex>
                  </VStack>
                </Flex>
              );
            })}
          </Grid>
        ) : (
          /* B: Dynamic Rushing Lane Cards (3x1 vertical decks with horizontal bars + stats on right) */
          <Grid templateColumns="repeat(3, 1fr)" gap="6px" h="full" w="full">
            {["left", "middle", "right"].map((k) => {
              const lane = player.lanes?.[k] || {
                attempts: 0, yards: 0, success: 0,
                powerRuns: 0, powerSuccess: 0,
                stuffed: 0, stopped: 0,
                lineYards: 0, opportunity: 0
              };
              const laneSR = lane.attempts > 0 ? lane.success / lane.attempts : 0;
              const leftYds = Math.max(0, player.lanes?.left?.yards || 0);
              const middleYds = Math.max(0, player.lanes?.middle?.yards || 0);
              const rightYds = Math.max(0, player.lanes?.right?.yards || 0);
              const totalLaneYds = leftYds + middleYds + rightYds;

              const laneYds = Math.max(0, lane.yards || 0);
              const barHeightPct = totalLaneYds > 0 ? (laneYds / totalLaneYds) * 100 : 0;

              const ly = lane.lineYards || 0;
              const hly = Math.max(0, lane.yards - ly);

              const lyPct = lane.yards > 0 ? (ly / lane.yards) * 100 : 0;
              const hlyPct = lane.yards > 0 ? (hly / lane.yards) * 100 : 0;

              const barPrimary = (primary === "#000000" || primary === "#000") ? "#4A90D9" : primary;
              const barSecondary = (secondary === "#000000" || secondary === "#000") ? "#FDB913" : secondary;

              const textPrimary = getReadableColor(barPrimary);
              const textSecondary = getReadableColor(barSecondary);

              const label = k === "left" ? "← LEFT LANE" : k === "middle" ? "↑ MIDDLE" : "RIGHT →";
              const themeColor = k === "left" ? "#4A90D9" : k === "middle" ? "#48BB78" : "#F6AD55";

              return (
                <Flex
                  key={k}
                  direction="column"
                  justify="space-between"
                  pt="0.375rem"
                  pr="0.25rem"
                  pb="0rem"
                  pl="0.125rem"
                  bg="rgba(255,255,255,0.02)"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                  borderTop={`3px solid ${themeColor}`}
                  borderRadius="sm"
                  _hover={{ bg: "rgba(255,255,255,0.04)", borderTopWidth: "4px" }}
                  transition="all 0.15s"
                >
                  <Flex align="center" gap={1} mb="2px" pl="0.125rem">
                    <Box w="0.1875rem" h="0.1875rem" bg={themeColor} borderRadius="full" />
                    <Text fontSize="0.46875rem" color="text.muted" fontWeight="955" textTransform="uppercase" letterSpacing="0.04em" truncate>
                      {label}
                    </Text>
                  </Flex>

                  {/* Two Column Layout: Proportional Bar Left (w="2.0rem"), Raw Stats Right */}
                  <Grid templateColumns="2.0rem 1fr" gap="0.25rem" alignItems="stretch" flex={1} minH={0} mt="2px">
                    {/* Column 1: Fat Bar anchored to the bottom and flush-left */}
                    <Flex
                      direction="column"
                      w="2.0rem"
                      h="full"
                      bg="rgba(255,255,255,0.03)"
                      overflow="hidden"
                      flexShrink={0}
                      borderRight="1px solid"
                      borderColor="whiteAlpha.150"
                      justifyContent="flex-end"
                    >
                      {totalLaneYds === 0 ? (
                        <Box h="full" w="full" bg="whiteAlpha.150" />
                      ) : (
                        barHeightPct > 0 && (
                          <Flex direction="column" h={`${Math.max(6, barHeightPct)}%`} w="full" justify="flex-end">
                            {/* Top Tier: Highlight Yards (Secondary Color) */}
                            {hlyPct > 0 && <Box h={`${hlyPct}%`} w="full" bg={barSecondary} borderBottom="1px solid rgba(255,255,255,0.12)" />}
                            {/* Bottom Tier: Line Yards (Primary Color) */}
                            {lyPct > 0 && <Box h={`${lyPct}%`} w="full" bg={barPrimary} />}
                          </Flex>
                        )
                      )}
                    </Flex>
                    {/* Column 2: 3 Stacks of Number (Top) + Label (Bottom) vertically */}
                    <VStack align="flex-start" justify="space-between" py="3px" pb="6px" flex={1} minW={0} h="full" gap={0}>
                      {/* Block 1: Success Rate */}
                      <VStack align="flex-start" gap={0} lineHeight={1}>
                        <Text fontSize="0.75rem" fontWeight="955" color="#48BB78" lineHeight={1}>
                          {lane.attempts > 0 ? `${Math.round(laneSR * 100)}%` : "—"}
                        </Text>
                        <Text fontSize="0.4375rem" fontWeight="800" color="#48BB78" mt="1px" lineHeight={1}>
                          SR
                        </Text>
                      </VStack>

                      {/* Block 2: Highlight Yards (Secondary Color) */}
                      <VStack align="flex-start" gap={0} lineHeight={1}>
                        <Text fontSize="0.75rem" fontWeight="955" color={textSecondary} lineHeight={1}>
                          {hly}
                        </Text>
                        <Text fontSize="0.4375rem" fontWeight="800" color={textSecondary} mt="1px" lineHeight={1}>
                          HL Yds
                        </Text>
                      </VStack>

                      {/* Block 3: OL Yards (Primary Color) */}
                      <VStack align="flex-start" gap={0} lineHeight={1}>
                        <Text fontSize="0.75rem" fontWeight="955" color={textPrimary} lineHeight={1}>
                          {ly}
                        </Text>
                        <Text fontSize="0.4375rem" fontWeight="800" color={textPrimary} mt="1px" lineHeight={1}>
                          OL Yds
                        </Text>
                      </VStack>
                    </VStack>
                  </Grid>
                </Flex>
              );
            })}
          </Grid>
        )}
      </Box>
    </VStack>
  );
};

/**
 * 5. DisruptionPanel
 * Standardized Defensive Disruption Index metrics matrix.
 * Sits inside both passing and rushing cards to align offensive and defensive indicators.
 */
const UpArrow = ({ color }) => (
  <svg width="1.6rem" height="1.6rem" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M18 15l-6-6-6 6" />
  </svg>
);

const DownArrow = ({ color }) => (
  <svg width="1.6rem" height="1.6rem" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const DashIcon = ({ color }) => (
  <svg width="1.6rem" height="1.6rem" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M5 12h14" />
  </svg>
);

const getArrowStatus = (label, displayValue, value) => {
  const cleanValStr = String(displayValue || value || "0").replace(/[^0-9.]/g, "");
  const val = parseFloat(cleanValStr) || 0;
  
  let left = "dash";
  let right = "dash";
  let grade = "C";
  let gradeColor = "#A1A1AA";

  const isLowBest = label.toLowerCase().includes("allow") || label.toLowerCase().includes("prevent") || label.toLowerCase().includes("allowed");

  if (label.includes("Stop") || label.includes("Stop Rate") || label.includes("3rd Down Stop")) {
    if (val >= 60) { left = "up"; right = "up"; grade = "A+"; gradeColor = "#48BB78"; }
    else if (val >= 50) { left = "up"; right = "dash"; grade = "B"; gradeColor = "#63B3ED"; }
    else if (val >= 40) { left = "dash"; right = "dash"; grade = "C"; gradeColor = "#A1A1AA"; }
    else if (val >= 30) { left = "dash"; right = "down"; grade = "D"; gradeColor = "#ED8936"; }
    else { left = "down"; right = "down"; grade = "F"; gradeColor = "#E53E3E"; }
  } else if (label.includes("Stuff") || label.includes("Stuff Rate")) {
    if (val >= 22) { left = "up"; right = "up"; grade = "A+"; gradeColor = "#48BB78"; }
    else if (val >= 18) { left = "up"; right = "dash"; grade = "B"; gradeColor = "#63B3ED"; }
    else if (val >= 14) { left = "dash"; right = "dash"; grade = "C"; gradeColor = "#A1A1AA"; }
    else if (val >= 10) { left = "dash"; right = "down"; grade = "D"; gradeColor = "#ED8936"; }
    else { left = "down"; right = "down"; grade = "F"; gradeColor = "#E53E3E"; }
  } else if (label.includes("TFL") || label.includes("Sacks Forced") || label.includes("Sacks")) {
    if (val >= 6) { left = "up"; right = "up"; grade = "A"; gradeColor = "#48BB78"; }
    else if (val >= 4) { left = "up"; right = "dash"; grade = "B"; gradeColor = "#63B3ED"; }
    else if (val >= 2) { left = "dash"; right = "dash"; grade = "C"; gradeColor = "#A1A1AA"; }
    else if (val >= 1) { left = "dash"; right = "down"; grade = "D"; gradeColor = "#ED8936"; }
    else { left = "down"; right = "down"; grade = "F"; gradeColor = "#E53E3E"; }
  } else if (label.includes("Blitz") || label.includes("Pressure")) {
    if (val >= 35) { left = "up"; right = "up"; grade = "A+"; gradeColor = "#48BB78"; }
    else if (val >= 28) { left = "up"; right = "dash"; grade = "B"; gradeColor = "#63B3ED"; }
    else if (val >= 22) { left = "dash"; right = "dash"; grade = "C"; gradeColor = "#A1A1AA"; }
    else if (val >= 15) { left = "dash"; right = "down"; grade = "D"; gradeColor = "#ED8936"; }
    else { left = "down"; right = "down"; grade = "F"; gradeColor = "#E53E3E"; }
  } else {
    if (isLowBest) {
      if (val <= 20) { left = "up"; right = "up"; grade = "A+"; gradeColor = "#48BB78"; }
      else if (val <= 30) { left = "up"; right = "dash"; grade = "B"; gradeColor = "#63B3ED"; }
      else if (val <= 40) { left = "dash"; right = "dash"; grade = "C"; gradeColor = "#A1A1AA"; }
      else if (val <= 50) { left = "dash"; right = "down"; grade = "D"; gradeColor = "#ED8936"; }
      else { left = "down"; right = "down"; grade = "F"; gradeColor = "#E53E3E"; }
    } else {
      if (val >= 60) { left = "up"; right = "up"; grade = "A+"; gradeColor = "#48BB78"; }
      else if (val >= 45) { left = "up"; right = "dash"; grade = "B"; gradeColor = "#63B3ED"; }
      else if (val >= 30) { left = "dash"; right = "dash"; grade = "C"; gradeColor = "#A1A1AA"; }
      else if (val >= 15) { left = "dash"; right = "down"; grade = "D"; gradeColor = "#ED8936"; }
      else { left = "down"; right = "down"; grade = "F"; gradeColor = "#E53E3E"; }
    }
  }

  return { left, right, grade, gradeColor };
};

export const DisruptionPanel = ({ opponentName, metrics = [] }) => {
  return (
    <Box
      px="0.5rem"
      py="0.375rem"
      borderTop="0.0625rem solid"
      borderColor="whiteAlpha.100"
      flexShrink={0}
      bg="rgba(0,0,0,0.2)"
      w="full"
    >
      {/* Panel Header */}
      <Flex align="center" gap="0.375rem" mb="0.375rem">
        <Box w="0.1875rem" h="0.6875rem" bg="#E53E3E" borderRadius="0.125rem" />
        <Text
          fontSize="0.5625rem"
          color="text.primary"
          fontWeight="950"
          textTransform="uppercase"
          letterSpacing="0.06em"
        >
          {opponentName} Defensive Disruption Index (Leverage & Disruptive Indicators)
        </Text>
      </Flex>

      {/* Grid of indicators */}
      <Grid
        templateColumns={
          metrics.length === 8 ? "repeat(4, 1fr)" :
            metrics.length === 6 ? "repeat(3, 1fr)" :
              `repeat(${metrics.length || 6}, 1fr)`
        }
        gap="0.375rem"
        w="full"
      >
        {metrics.map((m, idx) => {
          const { left, right, grade, gradeColor } = getArrowStatus(m.label, m.displayValue, m.value);

          const renderArrow = (type) => {
            if (type === "up") return <UpArrow color="#48BB78" />;
            if (type === "down") return <DownArrow color="#E53E3E" />;
            return <DashIcon color="#71717A" />;
          };

          return (
            <Flex
              key={idx}
              direction="column"
              bg="rgba(255,255,255,0.015)"
              border="0.0625rem solid"
              borderColor="whiteAlpha.100"
              borderRadius="0.25rem"
              px="0.5rem"
              py="0.375rem"
              justify="space-between"
              align="stretch"
              _hover={{ bg: "rgba(255,255,255,0.03)" }}
            >
              {/* Row 1: Header typology (Title left, Grade right) */}
              <Flex align="center" justify="space-between" pb="0.25rem" borderBottom="0.0625rem solid" borderColor="whiteAlpha.150" w="full" mb="0.375rem">
                <Text
                  fontSize="0.5625rem"
                  fontWeight="950"
                  color="text.secondary"
                  textTransform="uppercase"
                  letterSpacing="0.03em"
                  truncate
                  maxW="75%"
                >
                  {m.label}
                </Text>
                <Text fontSize="0.625rem" fontWeight="950" color={gradeColor}>
                  {grade}
                </Text>
              </Flex>

              {/* Row 2: Metric & Visual Section (Huge value flanked by massive arrows on the same level) */}
              <Flex align="center" justify="center" gap="0.375rem" py="0.125rem" w="full">
                {renderArrow(left)}
                <Text
                  fontSize="1.375rem"
                  fontWeight="950"
                  color="text.primary"
                  fontFamily="heading"
                  lineHeight={1}
                >
                  {m.displayValue || m.value}
                </Text>
                {renderArrow(right)}
              </Flex>
            </Flex>
          );
        })}
      </Grid>
    </Box>
  );
};
