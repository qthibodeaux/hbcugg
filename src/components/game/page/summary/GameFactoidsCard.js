import { getTeamColor, getTeamLabel } from "../../../../utils/gameSummary/teamIdentity";
import { useState, useMemo } from "react";
import { computeGameFactoids } from "../../../../utils/gameSummary/factoidsModel";
import { EditorialCard, SectionLabel, MicroLabel } from "./SummaryPrimitives";
import { Box, Flex, Text, Grid, HStack } from "@chakra-ui/react";

// Existing implementation extracted from GameSummaryTabV2.

// ═══════════════════════════════════════════════════════════════════════════════
// 6. NOTABLE PERFORMERS — Editorial player spotlight cards
// ═══════════════════════════════════════════════════════════════════════════════
const AUTO_ROTATE_MS = 4500;

export const GameFactoidsCard = ({ plays, awayId, homeId }) => {
  const awayColor = getTeamColor(awayId);
  const homeColor = getTeamColor(homeId);
  const awayLabel = getTeamLabel(awayId);
  const homeLabel = getTeamLabel(homeId);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const factoids = useMemo(
    () => computeGameFactoids(plays || [], awayId, homeId, awayLabel, homeLabel),
    [plays, awayId, homeId, awayLabel, homeLabel],
  );

  if (!factoids.length) return null;

  const active = factoids[Math.min(index, factoids.length - 1)];
  const activeColor = active.side === "home" ? homeColor : active.side === "away" ? awayColor : "rgba(255,255,255,0.6)";

  return (
    <EditorialCard position="relative" overflow="hidden" className="animate-slide-in" h="full" w="full" display="flex" flexDirection="column" style={{ animationDelay: "0.4s" }}>
      <Box position="relative" zIndex={1} p="0.75rem" h="full" w="full" display="flex" flexDirection="column">
        <Box flexShrink={0}>
          <SectionLabel>Game Factoids</SectionLabel>
        </Box>

        {/* Same CSS-driven auto-advance pattern as Notable Performers — no useEffect/setInterval */}
        {factoids.length > 1 && (
          <Box
            w={0} h={0} overflow="hidden"
            style={{ animation: `rotateTick ${AUTO_ROTATE_MS}ms linear infinite`, animationPlayState: isPlaying ? "running" : "paused" }}
            onAnimationIteration={() => setIndex((i) => (i + 1) % factoids.length)}
          />
        )}

        {active.variant === "compare" ? (
          <Flex flex="1" minH={0} direction="column" justify="center">
            <Text fontSize="clamp(0.5rem, 0.6vw, 0.6rem)" fontWeight="900" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.16em" mb="0.5rem">
              {active.title}
            </Text>
            <Grid templateColumns="1fr auto 1fr" gap="0.75rem" alignItems="center">
              <Text fontSize="clamp(1.2rem, 1.6vw, 1.6rem)" fontWeight="950" color={(active.awayValue >= active.homeValue) === !active.lowerIsBetter ? awayColor : "rgba(255,255,255,0.35)"} textAlign="left" lineHeight={1}>
                {active.awayValue}
              </Text>
              <MicroLabel>{awayLabel} · {homeLabel}</MicroLabel>
              <Text fontSize="clamp(1.2rem, 1.6vw, 1.6rem)" fontWeight="950" color={(active.homeValue >= active.awayValue) === !active.lowerIsBetter ? homeColor : "rgba(255,255,255,0.35)"} textAlign="right" lineHeight={1}>
                {active.homeValue}
              </Text>
            </Grid>
          </Flex>
        ) : (
          <Flex flex="1" minH={0} direction="column" justify="center">
            <Text fontSize="clamp(0.5rem, 0.6vw, 0.6rem)" fontWeight="900" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.16em" mb="0.25rem">
              {active.title}
            </Text>
            <Flex align="baseline" gap="0.5rem" mb="0.25rem">
              <Text fontSize="clamp(1.1rem, 1.5vw, 1.5rem)" fontWeight="950" color={activeColor} lineHeight={1.1} lineClamp={1}>
                {active.headline}
              </Text>
              {active.resultTag && (
                <Text fontSize="clamp(0.55rem, 0.65vw, 0.65rem)" fontWeight="900" color={active.resultTag === "TOUCHDOWN" ? "#22c55e" : "#ef4444"} letterSpacing="0.1em">
                  {active.resultTag}
                </Text>
              )}
            </Flex>
            {active.contextLine && (
              <Text fontSize="clamp(0.65rem, 0.8vw, 0.8rem)" fontWeight="700" color="rgba(255,255,255,0.55)" lineClamp={1}>
                {active.contextLine}
              </Text>
            )}
            <Text fontSize="clamp(0.65rem, 0.8vw, 0.8rem)" fontWeight="700" color="rgba(255,255,255,0.55)" lineClamp={1}>
              {active.playerLine}
            </Text>
          </Flex>
        )}

        <HStack gap="0.375rem" flexShrink={0} mt="0.5rem" align="stretch">
          <Box
            as="button"
            onClick={() => setIsPlaying((p) => !p)}
            w="1.75rem" h="1.75rem" borderRadius="md" bg="rgba(255,255,255,0.08)"
            display="flex" alignItems="center" justifyContent="center"
            color="white" fontSize="0.6rem" cursor="pointer" flexShrink={0}
            _hover={{ bg: "rgba(255,255,255,0.15)" }}
          >
            {isPlaying ? "❚❚" : "▶"}
          </Box>
          {factoids.map((f, i) => (
            <Box
              key={f.key}
              as="button"
              onClick={() => setIndex(i)}
              flex="1" minW={0} h="1.75rem" px="0.5rem" borderRadius="md"
              bg={i === index ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)"}
              color="white" fontSize="0.65rem" fontWeight="800" cursor="pointer"
              whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis"
              transition="all 0.2s"
              _hover={{ bg: "rgba(255,255,255,0.15)" }}
            >
              {f.label}
            </Box>
          ))}
        </HStack>
      </Box>
    </EditorialCard>
  );
};
