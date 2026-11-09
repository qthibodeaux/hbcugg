import { ChevronUp, ChevronDown, Minus } from "lucide-react";
import { useState } from "react";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { SectionLabel } from "./TeamDashPrimitives";

// Coaching carousel, per-coach backend delta and CSS animation-driven rotation.

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
