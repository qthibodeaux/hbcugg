import { useState } from "react";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { ChevronUp, ChevronDown, Minus } from "lucide-react";
import { useMountEffect } from "../../../hooks/useMountEffect";

/**
 * TeamDashComponents
 *
 * PHILOSOPHY:
 *   Purpose: Player spotlight and head coach cards for the Team Details compact grid.
 *   Grid slots: 1×1 (HeadCoachCard) and 2×2 (PlayerSpotlight standard)
 *
 * CONTENT TIERS (Responsive Behavior):
 *   Essential (always show): name, primary stat, identity
 *   Nice-to-have (normal): portrait image, rank label, tenure record
 *   Fluff (drop at mobile): gradient overlays, ghosted logos
 *
 * TYPOGRAPHY SCALING:
 *   Heading:   clamp(1.6rem, 5vw, 2.8rem)  compact → clamp(2.2rem, 6vw, 4.4rem) standard
 *   Label:     8px (compact) → 10px (standard)
 *   Meta:      9px (compact) → 11px (standard)
 *   Rule:      Never hardcode px for primary layout; use clamp() or responsive arrays
 *
 * COMPONENT SIZING:
 *   Grid/flex:  % widths, fr tracks, clamp(), minmax(0, 1fr)
 *   Padding:    compact p={3} → standard p={{ base: 4, lg: 5 }}
 *   Avatars:    clamp(2.25rem, 5.5vw, 3rem) square frames with lg radius
 *   Rule:       h="full" w="full", no hardcoded root heights
 */

const splitName = (name = "Featured Player") => {
  const parts = String(name).trim().split(/\s+/);
  if (parts.length <= 1) return [parts[0] || "Featured", "Player"];
  return [parts.slice(0, -1).join(" "), parts[parts.length - 1]];
};

const asNumber = (value, digits = 1) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "--";
  return n >= 100 ? Math.round(n).toLocaleString() : n.toFixed(digits);
};

const SectionLabel = ({ label, color = "brand.500" }) => (
  <Flex align="center" gap={2} minW={0}>
    <Box w="7px" h="7px" borderRadius="full" bg={color} flexShrink={0} />
    <Text
      fontSize={{ base: "12px", lg: "15px" }}
      fontWeight="black"
      color="text.muted"
      textTransform="uppercase"
      letterSpacing="0.12em"
      lineClamp={1}
    >
      {label}
    </Text>
  </Flex>
);

const PlayerSpotlightCompact = ({ team, player = {} }) => {
  const accent = team?.colors?.secondary || "#F56565";
  const [first, last] = splitName(player.name);

  return (
    <Box w="full" h="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" overflow="hidden" position="relative" p={3}>
      <Box position="absolute" inset={0} bg={`linear-gradient(135deg, ${team?.colors?.primary || "#E53E3E"}33 0%, rgba(11,11,13,0.98) 58%)`} />
      {team?.logo && <Image src={team.logo} alt="" position="absolute" right="-0.75rem" bottom="-1rem" h="75%" opacity={0.12} />}
      <Flex position="relative" zIndex={1} h="full" direction="column" justify="space-between" minH={0}>
        <SectionLabel label="Player Spotlight" color={accent} />
        <Box minW={0}>
          <Text fontSize="xl" fontWeight="black" color="white" lineHeight={0.92} lineClamp={1}>{first}</Text>
          <Text fontSize="xl" fontWeight="black" color="white" lineHeight={0.92} lineClamp={1}>{last}</Text>
          <Text mt={1} fontSize="12px" fontWeight="black" color="text.muted" textTransform="uppercase" lineClamp={1}>
            {player.position || "Position TBD"} / {player.classYear || "Class TBD"}
          </Text>
        </Box>
        <Text fontSize="lg" fontWeight="black" color={accent}>{asNumber(player.par)} PAR</Text>
      </Flex>
    </Box>
  );
};

export const PlayerSpotlight = ({ team, player, variant = "standard", gameContext, keyStats = [] }) => {
  if (variant === "compact") return <PlayerSpotlightCompact team={team} player={player} />;

  const accent = team?.colors?.secondary || "#F56565";
  const displayPlayer = player || {
    name: "Featured Player",
    position: "Position TBD",
    classYear: "Class TBD",
    par: null,
    gamesPlayed: null,
    image: null,
  };
  const [first, last] = splitName(displayPlayer.name);
  const hasImage = Boolean(displayPlayer.image);

  return (
    <Box w="full" h="full" bg="#0A0A0C" border="1px solid" borderColor="whiteAlpha.100" overflow="hidden" position="relative">
      {/* Left edge accent bar */}
      <Box position="absolute" left={0} top={0} bottom={0} w="4px" bg={team?.colors?.primary || "#E53E3E"} zIndex={3} />

      {/* Layer 1: Player Image dominating the left ~70% */}
      <Box position="absolute" left={0} top={0} bottom={0} w="70%" zIndex={1} bg="#0A0A0C">
        {hasImage ? (
          <Image
            src={displayPlayer.image}
            alt={displayPlayer.name}
            w="full"
            h="full"
            objectFit="cover"
            objectPosition="top center"
          />
        ) : (
          <Flex h="full" align="center" justify="center">
            {team?.logo && <Image src={team.logo} alt="" h="60%" maxW="70%" objectFit="contain" opacity={0.2} />}
          </Flex>
        )}
        
        {/* The Fade: Smooth gradient masking the harsh right edge of the image */}
        <Box 
          position="absolute" 
          inset={0} 
          bg="linear-gradient(to right, transparent 35%, #0A0A0C 85%)" 
          pointerEvents="none"
        />
      </Box>

      {/* Layer 2: The Flat Color Information Panel overlapping the right side */}
      <Flex h="full" w="full" position="relative" zIndex={2} justify="flex-end">
        <Box 
          w={{ base: "52%", lg: "45%" }} 
          h="full" 
          bg="rgba(10, 10, 12, 0.92)" 
          borderLeft="1px solid" 
          borderColor="whiteAlpha.100" 
          p={{ base: 3, lg: 5 }} 
          display="flex" 
          flexDirection="column" 
          justifyContent="space-between" 
        >
          {/* Top Row */}
          <Flex direction="column" align="flex-start" gap={3} minW={0}>
            <SectionLabel label="Star Impact" color={accent} />
            {gameContext && (
              <Box px={2} py={1} bg={`${team?.colors?.primary || "#E53E3E"}22`} border="1px solid" borderColor={accent} borderRadius="md" maxW="full">
                <Text fontSize={{ base: "12px", lg: "13px" }} fontWeight="black" color={accent} textTransform="uppercase" letterSpacing="0.05em" lineHeight={1.2}>
                  {gameContext}
                </Text>
              </Box>
            )}
          </Flex>

          {/* Middle Content */}
          <Box minW={0} mt="auto" mb={{ base: 4, lg: 6 }}>
            <Text fontSize="clamp(1.2rem, 3vw, 2.35rem)" fontWeight="black" color="white" lineHeight={0.88} textTransform="uppercase" lineClamp={1}>
              {first}
            </Text>
            <Text fontSize="clamp(1.2rem, 3vw, 2.35rem)" fontWeight="black" color="white" lineHeight={0.88} textTransform="uppercase" lineClamp={1}>
              {last}
            </Text>
            
            <Text mt={2} mb={3} fontSize={{ base: "12px", lg: "14px" }} fontWeight="bold" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="0.08em" lineClamp={1}>
              {displayPlayer.position || "POSITION"} <Box as="span" color={accent} mx={1}>/</Box> {displayPlayer.classYear || "YEAR"}
            </Text>

            {/* Key Stats Row */}
            {keyStats.length > 0 && (
              <Flex gap={4} align="center" py={2} borderTop="1px solid" borderBottom="1px solid" borderColor="whiteAlpha.200">
                {keyStats.map((stat, i) => (
                  <Box key={i} flex={1}>
                    <Text fontSize={{ base: "16px", lg: "18px" }} fontWeight="black" color="white" lineHeight={1}>{stat.value}</Text>
                    <Text fontSize="11px" fontWeight="bold" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.05em" mt={1}>{stat.label}</Text>
                  </Box>
                ))}
              </Flex>
            )}
          </Box>

          {/* Bottom Row */}
          <Flex align="end" justify="space-between" gap={3} minW={0}>
            <Box minW={0}>
              <Text fontSize={{ base: "2xl", lg: "4xl" }} fontWeight="black" color={accent} lineHeight={1}>
                {displayPlayer.gamesPlayed ? asNumber(displayPlayer.par / displayPlayer.gamesPlayed) : asNumber(displayPlayer.par)}
              </Text>
              <Text fontSize="12px" fontWeight="black" color="text.muted" textTransform="uppercase" lineClamp={1}>
                PAR / G
              </Text>
            </Box>
            <Flex 
              align="center" 
              justify="center" 
              px={{ base: 2, lg: 3 }} 
              py={{ base: 1.5, lg: 2 }} 
              bg="whiteAlpha.50" 
              border="1px solid" 
              borderColor="whiteAlpha.200" 
              borderRadius="md" 
              cursor="pointer" 
              _hover={{ bg: "whiteAlpha.200", borderColor: "whiteAlpha.400" }} 
              transition="all 0.2s"
              flexShrink={0}
            >
              <Text fontSize={{ base: "10px", lg: "11px" }} fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.1em">
                View Profile
              </Text>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

// Delta is optional per coach and backend-owned — direction/value arrive
// pre-computed (e.g. "up" / "+4.2"), never derived here.
const DELTA_COLOR = {
  up: { fg: "#48BB78", bg: "rgba(72, 187, 120, 0.15)" },
  down: { fg: "#F56565", bg: "rgba(245, 101, 101, 0.15)" },
  flat: { fg: "whiteAlpha.700", bg: "whiteAlpha.100" },
};

const DeltaIcon = ({ direction, color }) => {
  const Icon = direction === "up" ? ChevronUp : direction === "down" ? ChevronDown : Minus;
  return <Icon size={12} color={color || "currentColor"} strokeWidth={3} />;
};

export const CoachingStaffCard = ({ team, coaches = [] }) => {
  const accent = team?.colors?.secondary || "#F56565";
  const [currentIndex, setCurrentIndex] = useState(0);

  // If no coaches array provided, fallback to a mocked Head Coach just to keep layout from breaking
  const staff = coaches.length > 0 ? coaches : [
    {
      name: "Coach Feed Pending",
      role: "Head Coach",
      statValue: "Y1",
      statLabel: "NEW ERA",
    }
  ];

  const handleTick = () => {
    setCurrentIndex((prev) => (prev + 1) % staff.length);
  };

  const activeCoach = staff[currentIndex];
  
  const hasImage = Boolean(activeCoach?.image);
  const initials = (activeCoach?.name || "HC")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Box 
      w="full" 
      h="full" 
      bg="bg.secondary" 
      border="1px solid" 
      borderColor="whiteAlpha.100" 
      overflow="hidden" 
      position="relative" 
      p={{ base: 3, lg: 4 }}
    >
      {/* Invisible interval driver using purely CSS animations — no useEffect per doctrine! */}
      {staff.length > 1 && (
        <>
          <style>{`
            @keyframes coachingCarouselTick {
              0% { opacity: 0; }
              100% { opacity: 1; }
            }
          `}</style>
          <Box 
            position="absolute" 
            style={{ animation: "coachingCarouselTick 8s infinite" }} 
            onAnimationIteration={handleTick} 
          />
        </>
      )}

      <Box position="absolute" inset={0} bg={`radial-gradient(circle at 100% 100%, ${team?.colors?.primary || "#E53E3E"}33 0%, transparent 48%)`} />
      
      {/* Pagination track at very top if multiple coaches */}
      {staff.length > 1 && (
        <Flex position="absolute" top={2} right={3} gap={1} zIndex={5}>
          {staff.map((_, idx) => (
            <Box 
              key={idx} 
              w={idx === currentIndex ? "12px" : "4px"} 
              h="4px" 
              bg={idx === currentIndex ? accent : "whiteAlpha.300"} 
              borderRadius="full"
              transition="all 0.3s ease"
              cursor="pointer"
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </Flex>
      )}

      <Flex position="relative" zIndex={1} h="full" direction="column" justify="space-between" minH={0}>
        
        {/* Dynamic Section Label */}
        <Box>
          <SectionLabel label={activeCoach.role || "Coaching Staff"} color={accent} />
        </Box>

        {/* Coach Details block */}
        <Flex align="center" gap={2.5} minW={0} mt={1} transition="opacity 0.4s ease" key={activeCoach.name}> {/* key forces remount for visual pop! */}
          {/* Square frame per Design Bible §7 → Avatar And Logo Frame Rule */}
          <Flex
            w="clamp(2.25rem, 5.5vw, 3rem)"
            h="clamp(2.25rem, 5.5vw, 3rem)"
            align="center"
            justify="center"
            borderRadius="lg"
            bg={`${team?.colors?.primary || "#E53E3E"}66`}
            border="1px solid"
            borderColor={accent}
            flexShrink={0}
            overflow="hidden"
          >
            {hasImage ? (
              <Image src={activeCoach.image} alt={activeCoach.name} w="full" h="full" objectFit="cover" />
            ) : (
              <Text fontSize="sm" fontWeight="black" color="text.primary">{initials}</Text>
            )}
          </Flex>
          <Box minW={0}>
            <Text fontSize={{ base: "sm", lg: "md" }} fontWeight="black" color="text.primary" lineHeight={1.05} lineClamp={2}>
              {activeCoach.name}
            </Text>
            <Text mt={0.5} fontSize="12px" fontWeight="bold" color="text.muted" lineClamp={1} textTransform="uppercase">
               {activeCoach.role}
            </Text>
          </Box>
        </Flex>

        {/* Dynamic Contextual Stat block — every coach (HC, coordinator, or
            position coach) gets whatever mix of tenure/stat/delta the
            payload actually sends; delta is optional per coach; e.g. a
            first-year HC's "Y1 / NEW ERA" has no natural YoY comparison,
            while a coordinator's "31.4 PTS/GAME" might. Rendered from
            whatever `delta` this specific coach object carries — never
            computed here. */}
        <Box minW={0} mt="auto">
          <Flex align="baseline" gap={2} minW={0}>
            <Text fontSize="clamp(1.7rem, 5vw, 2.5rem)" fontWeight="black" color="text.primary" lineHeight={0.95} lineClamp={1} style={{ fontVariantNumeric: "tabular-nums" }}>
              {activeCoach.statValue || "--"}
            </Text>
            {activeCoach.delta && (
              <Flex
                align="center"
                gap="2px"
                px="6px"
                py="2px"
                borderRadius="full"
                bg={DELTA_COLOR[activeCoach.delta.direction]?.bg || "whiteAlpha.100"}
                flexShrink={0}
              >
                <DeltaIcon direction={activeCoach.delta.direction} color={DELTA_COLOR[activeCoach.delta.direction]?.fg} />
                <Text fontSize="12px" fontWeight="black" color={DELTA_COLOR[activeCoach.delta.direction]?.fg || "text.muted"} lineHeight={1}>
                  {activeCoach.delta.value}
                </Text>
              </Flex>
            )}
          </Flex>
          <Text fontSize={{ base: "12px", lg: "13px" }} fontWeight="black" color={accent} textTransform="uppercase" letterSpacing="0.1em" lineClamp={1}>
            {activeCoach.statLabel || "PENDING"}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

export const buildSpotlightPlayer = (teamAnalytics, playerRows = []) => {
  const top = teamAnalytics?.top_3_performers?.[0];
  if (!top) return null;
  const row = playerRows.find((p) => p.player_key === top.player_key || p.person_id === top.person_id);

  return {
    name: top.name_display || row?.full_name || row?.name_display,
    position: top.position || row?.position,
    classYear: top.class_year || row?.class_year,
    par: top.par,
    gamesPlayed: top.games_played,
    image: row?.image_url || null,
    rank: "#1 Overall PAR",
  };
};

export const buildHeadCoach = (coaches = []) => {
  const headCoach = coaches.find((coach) => /head\s+(football\s+)?coach/i.test(coach?.title || "") && !/assistant/i.test(coach?.title || ""));
  if (!headCoach) return null;
  return {
    name: headCoach.name || headCoach.full_name,
    title: headCoach.title,
    record: "--",
    sub: "Career record pending",
  };
};
