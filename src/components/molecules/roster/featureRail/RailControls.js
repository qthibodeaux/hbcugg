import { Text, Flex, Box } from "@chakra-ui/react";
import { Play, Pause, ArrowRight } from "lucide-react";

export const StatChip = ({ value, team }) => (
  <Text fontSize="8px" fontWeight="black" color={team.colors?.primary ?? "#E53E3E"} textTransform="uppercase" letterSpacing="0.02em" whiteSpace="nowrap">
    {value}
  </Text>
);

export const CarouselControls = ({ slides, activeIndex, paused, team, onTogglePause, onSelect }) => {
  const primary = team.colors?.primary ?? "#E53E3E";

  return (
    <Flex align="center" justify="flex-end" gap={2} h="100%">
      <Box
        as="button"
        onClick={onTogglePause}
        w="24px"
        h="24px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={primary}
        color="white"
        borderRadius="sm"
        title={paused ? "Resume carousel" : "Pause carousel"}
      >
        {paused ? <Play size={12} /> : <Pause size={12} />}
      </Box>
      <Flex align="center" gap={1.25}>
        {slides.map((slide, index) => (
          <Box
            key={slide.name}
            as="button"
            onClick={() => onSelect(index)}
            title={slide.name}
            w={index === activeIndex ? "18px" : "10px"}
            h="10px"
            borderRadius="full"
            bg={index === activeIndex ? primary : "#0B0B0D"}
            border={index === activeIndex ? `2px solid ${primary}` : "0"}
            boxShadow={index === activeIndex ? "0 0 0 2px #ffffff inset" : "none"}
            style={{ transition: "width 180ms ease" }}
          />
        ))}
      </Flex>
    </Flex>
  );
};

export const RosterCta = ({ team, model, secondaryAccent, compact = false, onFullRoster }) => {
  const primary = team.colors?.primary ?? "#E53E3E";
  const lines = ["View", "Roster"];

  return (
    <Box
      as="button"
      type="button"
      onClick={onFullRoster}
      textAlign="left"
      bg={primary}
      color="white"
      borderRadius="lg"
      px={compact ? 4 : 6}
      py={compact ? 3 : 5}
      position="relative"
      overflow="hidden"
      h="100%"
      style={{ transition: "filter 0.15s" }}
      _hover={{ filter: "brightness(0.92)" }}
    >
      <Text position="absolute" right="-16px" bottom="-26px" fontSize={compact ? "86px" : "110px"} fontWeight="black" color="white" opacity={0.08} lineHeight="1">
        {model.kpis.totalPlayers}
      </Text>
      <Flex h="100%" direction="column" justify="space-between" position="relative" zIndex={1}>
        <Box minH={0}>
          {lines.map((line) => (
            <Text key={line} fontSize={compact ? "clamp(1.45rem, 3.6vw, 2.35rem)" : "clamp(2rem, 4vw, 3.75rem)"} fontWeight="black" textTransform="uppercase" lineHeight="0.78" letterSpacing="-0.04em">
              {line}
            </Text>
          ))}
        </Box>
        <Flex align="center" justify="flex-end">
          <ArrowRight size={compact ? 16 : 22} color={secondaryAccent} />
        </Flex>
      </Flex>
    </Box>
  );
};

export const ProgressLine = ({ primary, secondaryAccent, paused, slides, onAdvance }) => (
  <Box position="absolute" left="20%" right="18%" bottom={0} h="4px" bg={`${primary}1F`} pointerEvents="none">
    <Box
      h="100%"
      w="100%"
      bg={secondaryAccent}
      transformOrigin="left"
      style={{ animation: paused || slides.length <= 1 ? "none" : "rosterFeatureProgress 5s linear infinite" }}
      onAnimationIteration={() => {
        if (!paused && slides.length > 1) onAdvance();
      }}
    />
  </Box>
);
