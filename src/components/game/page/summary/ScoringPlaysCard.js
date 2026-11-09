import { getTeamAccent, getTeamLabel, getTeamLogoSrc } from "../../../../utils/gameSummary/teamIdentity";
import { useState, useMemo } from "react";
import { buildScoringPlays } from "../../../../utils/gameSummary/scoringPlaysModel";
import { EditorialCard, SectionLabel, MicroLabel } from "./SummaryPrimitives";
import { Box, Flex, Image, Text, HStack } from "@chakra-ui/react";
import { CandidateImage } from "./CandidateImage";
import { DriveFieldStrip } from "../drives/DriveFieldStrip";
import { ChevronUp } from "lucide-react";

// Extracted from GameSummaryTabV2; behavior and visual variants are preserved.

// ═══════════════════════════════════════════════════════════════════════════════
// 9. SCORING PLAYS TIMELINE — Editorial scoring events
// ═══════════════════════════════════════════════════════════════════════════════
const SCORING_ROTATE_MS = 5200;

/** Past this many scores the per-score strip stops fitting on one line and quarter tabs
 *  take over. Measured against the 2-column slot, where eight already overrun it. */
const MAX_SCORE_BUTTONS = 7;

// `mobile`: no headshot or watermark, a smaller scorebug, and the card takes its natural
// height (description + scorebug, drive line + field, score buttons) instead of a slot's.
export const ScoringPlaysCard = ({ scoringPlays, driveSummary, identity, awayId, homeId, mobile = false }) => {
  const awayColor = getTeamAccent(awayId);
  const homeColor = getTeamAccent(homeId);
  const awayLabel = getTeamLabel(awayId);
  const homeLabel = getTeamLabel(homeId);

  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [cycle, setCycle] = useState(0);
  const advanceTo = (next) => {
    setIndex(next);
    setCycle((c) => c + 1);
  };

  const plays = useMemo(
    () => buildScoringPlays({ scoringPlays, driveSummary, awayId, homeId, identity }),
    [scoringPlays, driveSummary, awayId, homeId, identity],
  );

  if (plays.length === 0) {
    return (
      <EditorialCard position="relative" overflow="hidden" className="animate-slide-in" h="full" w="full" display="flex" flexDirection="column" style={{ animationDelay: "0.45s" }}>
        <Box position="relative" zIndex={1} p="1rem" h="full" w="full" display="flex" flexDirection="column">
          <SectionLabel>Scoring Plays</SectionLabel>
          <Flex flex="1" align="center" justify="center">
            <MicroLabel>No scoring plays on file</MicroLabel>
          </Flex>
        </Box>
      </EditorialCard>
    );
  }

  const active = plays[Math.min(index, plays.length - 1)];
  const isHome = active.team === "home";
  const teamColor = isHome ? homeColor : awayColor;
  const dash = (v) => (v == null ? "—" : v);

  // Default is one button per score, showing the running score it produced. Quarter tabs
  // are the fallback for the games that would otherwise blow the strip out: more scores
  // than fit on one line, or anything that reached overtime.
  const hasOvertime = plays.some((p) => p.quarter > 4);
  const useQuarterTabs = plays.length > MAX_SCORE_BUTTONS || hasOvertime;
  const quarters = [...new Set(plays.map((p) => p.quarter))].sort((a, b) => a - b);
  const quarterLabel = (q) => (q <= 4 ? `Q${q}` : q === 5 ? "OT" : `${q - 4}OT`);
  const visible = plays
    .map((p, i) => ({ ...p, i }))
    .filter((p) => !useQuarterTabs || p.quarter === active.quarter);

  return (
    <EditorialCard position="relative" overflow="hidden" className="animate-slide-in" h={mobile ? "auto" : "full"} borderRadius={mobile ? "0" : "xl"} w="full" display="flex" flexDirection="column" style={{ animationDelay: "0.45s" }}>
      {/* The card changes hands via the ghosted mark alone — no colour wash over the
          surface, which stays the same flat card ground as every other card on the tab.
          The scorer's face carries it when there's a headshot; the team mark stands in
          when there isn't. */}
      {mobile ? null : active.scorerImages.length ? (
        <CandidateImage
          key={active.key}
          srcs={active.scorerImages}
          fallback={<Image src={getTeamLogoSrc(isHome ? homeId : awayId)} alt="" position="absolute" left="-2.5rem" bottom="-3rem" h="115%" objectFit="contain" opacity={0.07} zIndex={0} pointerEvents="none" />}
          alt=""
          position="absolute"
          left="1.5rem"
          top={0}
          h="full"
          objectFit="contain"
          objectPosition="bottom"
          opacity={0.16}
          zIndex={0}
          pointerEvents="none"
          style={{ maskImage: "linear-gradient(to bottom, #000 55%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, #000 55%, transparent)" }}
        />
      ) : (
        <Image src={getTeamLogoSrc(isHome ? homeId : awayId)} alt="" position="absolute" left="-2.5rem" bottom="-3rem" h="115%" objectFit="contain" opacity={0.07} zIndex={0} pointerEvents="none" />
      )}

      <Box position="relative" zIndex={1} p={mobile ? "0.75rem" : "1rem"} pb="0.5rem" h={mobile ? "auto" : "full"} w="full" display="flex" flexDirection="column">
        <Flex align="start" justify="space-between" gap={mobile ? "0.6rem" : "1rem"} flexShrink={0}>
          <Box minW={0} flex="1">
            <SectionLabel>Scoring Plays</SectionLabel>

            {/* The play, as a headline */}
            <Text fontSize={mobile ? "1.05rem" : "clamp(1rem, 1.7vw, 1.75rem)"} fontWeight="950" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={1.02} letterSpacing="-0.02em" lineClamp={mobile ? 3 : 2} mt="0.25rem">
              {active.line}
            </Text>
            {active.extra && (
              <Text fontSize="clamp(0.62rem, 0.78vw, 0.8rem)" fontWeight="700" color="rgba(255,255,255,0.55)" mt="0.1875rem" lineClamp={1}>
                {active.extra}
              </Text>
            )}
          </Box>

          {/* Scorebug, lifted from the Magazine Spread lab row, with the points for this
              play sitting to its left rather than under it */}
          <Flex align="center" gap={mobile ? "0.4rem" : "0.75rem"} flexShrink={0}>
            <Box textAlign="right">
              <Text fontSize={mobile ? "1.15rem" : "clamp(1.3rem, 2vw, 2rem)"} fontWeight="950" color={teamColor} lineHeight={1}>
                +{active.points}
              </Text>
              <Text fontSize="clamp(0.44rem, 0.55vw, 0.58rem)" fontWeight="900" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.14em" whiteSpace="nowrap">
                {active.typeLabel}
              </Text>
            </Box>

            <Flex>
              <Flex direction="column" align="center" bg="white" color="black" px={mobile ? "0.6rem" : "1.5rem"} py={mobile ? "0.35rem" : "0.5rem"} minW={mobile ? "3.4rem" : "6rem"}>
                <Text fontSize="clamp(0.62rem, 0.8vw, 0.82rem)" fontWeight="900" letterSpacing="0.1em">{awayLabel}</Text>
                <Text key={`a${cycle}`} className={!isHome ? "score-tick" : undefined} fontSize={mobile ? "1.6rem" : "clamp(2rem, 3.4vw, 3.5rem)"} fontWeight="900" lineHeight={1}>
                  {dash(active.awayScore)}
                </Text>
              </Flex>
              <Flex direction="column" align="center" bg={homeColor} color="white" px={mobile ? "0.6rem" : "1.5rem"} py={mobile ? "0.35rem" : "0.5rem"} minW={mobile ? "3.4rem" : "6rem"}>
                <Text fontSize="clamp(0.62rem, 0.8vw, 0.82rem)" fontWeight="900" letterSpacing="0.1em">{homeLabel}</Text>
                <Text key={`h${cycle}`} className={isHome ? "score-tick" : undefined} fontSize={mobile ? "1.6rem" : "clamp(2rem, 3.4vw, 3.5rem)"} fontWeight="900" lineHeight={1}>
                  {dash(active.homeScore)}
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Flex>

        {/* Drive line sits directly above the field it describes */}
        <Box flex={mobile ? "none" : "1"} minH={0} display="flex" flexDirection="column" justifyContent="flex-end" gap="0.3125rem" mt={mobile ? "0.9rem" : "0.5rem"}>
          <Flex align="baseline" gap="0.5rem" flexWrap="wrap">
            <Text fontSize={mobile ? "0.66rem" : "clamp(0.5rem, 0.62vw, 0.64rem)"} fontWeight="900" color="rgba(255,255,255,0.45)" textTransform="uppercase" letterSpacing="0.14em">
              {quarterLabel(active.quarter)} · {active.clock}
            </Text>
            {active.drivePlays != null && (
              <Text fontSize={mobile ? "0.66rem" : "clamp(0.5rem, 0.62vw, 0.64rem)"} fontWeight="900" color="rgba(255,255,255,0.45)" textTransform="uppercase" letterSpacing="0.14em">
                {active.drivePlays} plays · {dash(active.driveYards)} yds{active.drivePossession ? ` · ${active.drivePossession}` : ""}
              </Text>
            )}
          </Flex>

          <DriveFieldStrip startYard={active.driveStartYard ?? 0} endYard={active.driveEndYard ?? 0} plays={active.drivePlays ?? 1} team={active.team} awayColor={awayColor} homeColor={homeColor} awayLabel={awayLabel} homeLabel={homeLabel} />
        </Box>

        {/* Auto-advance ticker — same CSS-driven pattern as Notable Performers */}
        {plays.length > 1 && (
          <Box
            key={cycle}
            w={0} h={0} overflow="hidden"
            style={{ animation: `rotateTick ${SCORING_ROTATE_MS}ms linear infinite`, animationPlayState: isPlaying ? "running" : "paused" }}
            onAnimationIteration={() => advanceTo((index + 1) % plays.length)}
          />
        )}
      </Box>

      {/* Two-tier control: quarter tabs, then one pip per score inside that quarter */}
      <Flex
        flexShrink={0} w="full" position="relative" zIndex={2}
        bg="rgba(10,10,12,0.92)" borderTop="0.125rem solid" borderColor="whiteAlpha.200"
        px="0.375rem" py="0.3125rem" gap="0.375rem" align="center" overflow="hidden"
      >
        <Box
          as="button"
          onClick={() => setIsPlaying((v) => !v)}
          w="1.25rem" h="1.25rem" borderRadius="md" bg="rgba(255,255,255,0.08)"
          display="flex" alignItems="center" justifyContent="center"
          color="white" fontSize="0.48rem" cursor="pointer" flexShrink={0}
          _hover={{ bg: "rgba(255,255,255,0.15)" }}
        >
          {isPlaying ? "❚❚" : "▶"}
        </Box>

        {useQuarterTabs && (
          <HStack gap="0.25rem" flexShrink={0}>
            {quarters.map((q) => {
              const first = plays.findIndex((pl) => pl.quarter === q);
              const isActive = q === active.quarter;
              return (
                <Box
                  key={q}
                  as="button"
                  onClick={() => advanceTo(first)}
                  h="1.7rem" px="0.5rem" borderRadius="md"
                  bg={isActive ? teamColor : "rgba(255,255,255,0.08)"}
                  color="white" fontSize="0.62rem" fontWeight="900" cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ bg: isActive ? teamColor : "rgba(255,255,255,0.15)" }}
                >
                  {quarterLabel(q)}
                </Box>
              );
            })}
          </HStack>
        )}

        {/* One button per score: the running score it produced, a chevron against whichever
            side moved, and the scoring team's mark. The active one carries the same fill
            sweep the Notable Performers strip uses. */}
        {/* `nowrap` matters more than it looks — a wrapped second row silently grows the
            strip and eats the card's height, so an overrun scrolls instead. */}
        <Box display="flex" flexWrap="nowrap" gap="0.1875rem" overflowX="auto" overflowY="hidden" flex="1" minW={0}>
          {visible.map((p) => {
            const isActive = p.i === index;
            const pTeamColor = p.team === "home" ? homeColor : awayColor;
            const pIsHome = p.team === "home";
            return (
              <Box
                key={p.key}
                as="button"
                onClick={() => advanceTo(p.i)}
                position="relative" overflow="hidden"
                h="1.7rem" px="0.375rem" borderRadius="sm"
                bg={isActive ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"}
                borderBottom="0.125rem solid"
                borderBottomColor={isActive ? pTeamColor : "transparent"}
                cursor="pointer" flexShrink={0}
                transition="background 0.2s, border-color 0.2s"
                _hover={{ bg: "rgba(255,255,255,0.16)" }}
              >
                {isActive && (
                  <Box
                    key={cycle}
                    className="rotate-sweep"
                    position="absolute" inset={0} bg={pTeamColor} opacity={0.28} pointerEvents="none"
                    style={{ animation: `rotateSweep ${SCORING_ROTATE_MS}ms linear forwards`, animationPlayState: isPlaying ? "running" : "paused" }}
                  />
                )}
                <Flex position="relative" zIndex={1} align="center" gap="0.25rem" h="full">
                  <Flex align="center" gap="0.0625rem">
                    <Text fontSize="0.62rem" fontWeight="900" color={!pIsHome ? "white" : "rgba(255,255,255,0.45)"} lineHeight={1}>
                      {dash(p.awayScore)}
                    </Text>
                    {!pIsHome && <ChevronUp size={9} color={pTeamColor} strokeWidth={3.5} />}
                    <Text fontSize="0.6rem" fontWeight="900" color="rgba(255,255,255,0.3)" lineHeight={1}>
                      -
                    </Text>
                    <Text fontSize="0.62rem" fontWeight="900" color={pIsHome ? "white" : "rgba(255,255,255,0.45)"} lineHeight={1}>
                      {dash(p.homeScore)}
                    </Text>
                    {pIsHome && <ChevronUp size={9} color={pTeamColor} strokeWidth={3.5} />}
                  </Flex>
                  <Box w="0.0625rem" h="0.8rem" bg="rgba(255,255,255,0.28)" flexShrink={0} />
                  <Image src={getTeamLogoSrc(pIsHome ? homeId : awayId)} alt="" w="0.85rem" h="0.85rem" objectFit="contain" flexShrink={0} />
                </Flex>
              </Box>
            );
          })}
        </Box>

      </Flex>
    </EditorialCard>
  );
};
