import React from "react";
import {
  Box,
  Flex,
  Text,
  VStack,
  // eslint-disable-next-line no-unused-vars
  HStack,
  // eslint-disable-next-line no-unused-vars
  Grid,
} from "@chakra-ui/react";

/**
 * GameInfoPassport
 * 
 * PHILOSOPHY:
 *   Purpose: Editorial "Passport" for a game, focusing on When and Where.
 *   Grid slot: 1×1 (Standard)
 * 
 * CONTENT TIERS:
 *   Tier 1 (Billboard): Date, Year, Kickoff.
 *   Tier 2 (Venue): Stadium name (Primary) and City (Secondary).
 *   Tier 3 (Context): Attendance, Temp/Weather, Duration.
 * 
 * RESPONSIVE:
 *   Uses clamp() for typography and spacing. No hardcoded PX.
 *   Fills h="full" w="full" to adapt to PageShell Slot.
 */

const MicroLabel = ({ children, compact = false }) => (
  <Text
    fontSize={compact ? "clamp(0.5rem, 0.6vw, 0.6rem)" : "clamp(0.55rem, 0.65vw, 0.7rem)"}
    fontWeight="black"
    color="rgba(255,255,255,0.4)"
    textTransform="uppercase"
    letterSpacing="0.15em"
    lineHeight={1}
    mb={compact ? 0 : 1}
  >
    {children}
  </Text>
);

const ValueText = ({ children, size = "clamp(0.85rem, 1vw, 1.1rem)", noTruncate = false, weight = "800" }) => (
  <Text
    fontSize={size}
    fontWeight={weight}
    color="white"
    lineHeight={1.2}
    letterSpacing="tight"
    whiteSpace={noTruncate ? "normal" : "nowrap"}
    overflow={noTruncate ? "visible" : "hidden"}
    textOverflow={noTruncate ? "clip" : "ellipsis"}
  >
    {children}
  </Text>
);

const Hairline = ({ compact }) => <Box w="full" h="1px" bg="whiteAlpha.100" my={compact ? 0.25 : 0.5} minH="1px" flexShrink={0} />;

/** 
 * StatStrip - Adaptive footer info 
 */
const StatStrip = ({ meta, variant = "standard" }) => {
  const stats = [
    { label: "Duration", value: meta?.duration },
    { label: "Attendance", value: meta?.attendance?.toLocaleString() },
    { label: "Weather", value: meta?.temperature ? `${meta.temperature}°` : meta?.weather }
  ].filter(s => s.value);

  if (stats.length === 0) return null;

  const isCompact = variant === "compact";

  return (
    <VStack align="stretch" spacing={isCompact ? 1 : 2} w="full">
      {stats.map(s => (
        <Flex key={s.label} direction={isCompact ? "row" : "column"} justify="space-between" align={isCompact ? "center" : "start"} minW={0}>
          <MicroLabel compact={isCompact}>{s.label}</MicroLabel>
          <ValueText size={isCompact ? "clamp(0.7rem, 0.85vw, 0.95rem)" : "clamp(0.8rem, 1vw, 1rem)"} weight={isCompact ? "700" : "800"}>
            {s.value}
          </ValueText>
        </Flex>
      ))}
    </VStack>
  );
};

export const GameInfoPassport = ({ meta, variant = "standard" }) => {
  const isCompact = variant === "compact";
  
  // Parse site: "Houston, Texas (Shell Energy Stadium)" -> ["Houston, Texas", "Shell Energy Stadium"]
  const siteRaw = meta?.site || "";
  let city = siteRaw;
  let stadium = null;
  
  const stadiumMatch = siteRaw.match(/\(([^)]+)\)/);
  if (stadiumMatch) {
    stadium = stadiumMatch[1];
    city = siteRaw.replace(stadiumMatch[0], "").trim().replace(/,$/, "");
  }

  // Triage: What data do we actually have?
  const hasSchedule = !!(meta?.date || meta?.kickoff_time);
  const hasVenue = !!(stadium || city);

  return (
    <VStack
      w="full"
      h="full"
      bg="var(--part-bg, #141416)"
      borderRadius="xl"
      position="relative"
      overflow="hidden"
      border="1px solid"
      borderColor="whiteAlpha.100"
      p={isCompact ? 3 : "clamp(0.75rem, 1.25vw, 1rem)"}
      align="stretch"
      spacing={isCompact ? 1.5 : 3}
    >
      {/* TIER 1: BILLBOARD */}
      {hasSchedule && (
        <VStack align="stretch" spacing={isCompact ? 0.25 : 1}>
          <Flex justify="space-between" align="center" w="full">
            <MicroLabel compact={isCompact}>Date</MicroLabel>
            <ValueText size={isCompact ? "clamp(0.85rem, 1.1vw, 1.1rem)" : "clamp(0.9rem, 1.2vw, 1.2rem)"}>
              {meta?.date || "—"}
            </ValueText>
          </Flex>
          
          {meta?.kickoff_time && (
            <Flex justify="space-between" align="center" w="full">
              <MicroLabel compact={isCompact}>Kickoff</MicroLabel>
              <ValueText size={isCompact ? "clamp(0.8rem, 1vw, 0.95rem)" : "clamp(0.85rem, 1vw, 1rem)"}>
                {meta.kickoff_time}
              </ValueText>
            </Flex>
          )}

          {(!isCompact || (isCompact && !meta?.kickoff_time)) && (
            <Text 
              fontSize="clamp(0.6rem, 0.7vw, 0.75rem)" 
              fontWeight="bold" 
              color="brand.400" 
              letterSpacing="0.1em" 
              lineClamp={1}
              textAlign="right"
            >
              {meta?.season} {meta?.week ? `• WK ${meta.week}` : ""}
            </Text>
          )}
        </VStack>
      )}

      {hasSchedule && hasVenue && <Hairline compact={isCompact} />}

      {/* TIER 2: VENUE */}
      {hasVenue && (
        <VStack align="stretch" spacing={0}>
          <MicroLabel compact={isCompact}>Venue</MicroLabel>
          <Text 
            fontSize={isCompact ? "clamp(0.85rem, 1.1vw, 1.1rem)" : "clamp(0.9rem, 1.2vw, 1.3rem)"}
            fontWeight="800" 
            color="white" 
            lineHeight={1.2}
            lineClamp={2}
          >
            {stadium || city}
          </Text>
          {stadium && city && (
            <Text 
              fontSize={isCompact ? "0.65rem" : "clamp(0.65rem, 0.8vw, 0.85rem)"} 
              fontWeight="medium" 
              color="rgba(255,255,255,0.6)"
              lineClamp={1}
              mt={isCompact ? 0 : 1}
            >
              {city}
            </Text>
          )}
        </VStack>
      )}

      <Hairline compact={isCompact} />

      {/* TIER 3: PHYSICAL CONTEXT */}
      <StatStrip meta={meta} variant={variant} />

      {/* Intentional lack of Officials here per request */}
    </VStack>
  );
};
