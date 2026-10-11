import React, { useState, useCallback, useRef } from "react";
import { Box, SimpleGrid, Image, Flex, Text, Circle } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import useMountEffect from "../../../hooks/useMountEffect";
import teamsData from "../../../data/teams.json";

const teams = [...teamsData.teams].sort((a, b) => a.name.localeCompare(b.name));

// ─── Frames ───────────────────────────────────────────────────────────────────
const FRAMES = ["abbrev", "fullName", "logo", "player", "logoBig"];

const ENTER_ANIM = {
  abbrev: "fusionFromRight",
  fullName: "fusionFadeScale",
  logo: "fusionFromTop",
  player: "fusionFromBottom",
  logoBig: "fusionFadeScale",
};

const EXIT_ANIM = {
  abbrev: "fusionToLeft",
  fullName: "fusionFadeScaleOut",
  logo: "fusionToBottom",
  player: "fusionToTop",
  logoBig: "fusionFadeScaleOut",
};

const EXIT_DURATION = 350;

// ─── Color treatments for logoBig ────────────────────────────────────────────
const COLOR_TREATMENTS = [
  // Full color, bright
  (primary) => ({ filter: "none", opacity: 0.9 }),
  // School color tint via drop-shadow saturation boost
  (primary) => ({ filter: "saturate(1.8) contrast(1.1)", opacity: 0.85 }),
  // Near-white ghost
  (primary) => ({ filter: "brightness(2) saturate(0)", opacity: 0.15 }),
  // School-color duotone feel — desaturate then tint
  (primary) => ({
    filter: "grayscale(0.6) sepia(0.4) saturate(1.4)",
    opacity: 0.75,
  }),
  // High contrast punch
  (primary) => ({ filter: "contrast(1.6) saturate(1.3)", opacity: 0.8 }),
];

// ─── Static Ken Burns animation ──────────────────────────────────────────────
// Uses CSS custom properties for randomization instead of injecting dynamic keyframes
const KEN_BURNS_DURATION = 8000; // Fixed duration for performance

// ─── Frame content renderer ───────────────────────────────────────────────────
const FrameContent = ({ frame, team, primaryColor, colorTreatment }) => {
  if (frame === "abbrev") {
    return (
      <Text
        fontSize="xl"
        fontWeight="black"
        fontStyle="italic"
        color="white"
        letterSpacing="-0.04em"
        textTransform="uppercase"
        lineHeight={1}
      >
        {team.shortName}
      </Text>
    );
  }

  if (frame === "fullName") {
    return (
      <Text
        fontSize="sm"
        fontWeight="black"
        fontStyle="italic"
        color="white"
        letterSpacing="-0.01em"
        textTransform="uppercase"
        lineHeight={1.15}
        lineClamp={2}
      >
        {team.name}
      </Text>
    );
  }

  if (frame === "logo") {
    return (
      <Flex align="center" gap={3}>
        <Image
          src={team.logo}
          alt={team.name}
          boxSize="42px"
          objectFit="contain"
          filter="drop-shadow(0 2px 10px rgba(0,0,0,0.6))"
        />
        <Text
          fontSize="10px"
          fontWeight="black"
          color="text.muted"
          textTransform="uppercase"
          letterSpacing="0.1em"
          lineHeight={1.3}
          lineClamp={2}
        >
          {team.mascot}
        </Text>
      </Flex>
    );
  }

  if (frame === "player") {
    return (
      <Flex align="center" gap={3}>
        <Circle
          size="38px"
          bg={`${primaryColor}33`}
          border="1px solid"
          borderColor={`${primaryColor}66`}
          flexShrink={0}
        >
          <User size={16} color={primaryColor} />
        </Circle>
        <Box>
          <Text
            fontSize="9px"
            fontWeight="black"
            color="text.muted"
            textTransform="uppercase"
            letterSpacing="0.12em"
          >
            {team.conference}
          </Text>
          <Text
            fontSize="xs"
            fontWeight="black"
            color="white"
            textTransform="uppercase"
          >
            {team.shortName}
          </Text>
        </Box>
      </Flex>
    );
  }

  if (frame === "logoBig") {
    return (
      <Box position="absolute" inset={0} overflow="hidden">
        <Box
          as="img"
          src={team.logo}
          alt=""
          position="absolute"
          w="100%"
          h="100%"
          objectFit="contain"
          transformOrigin="center center"
          style={{
            animation: `kenBurns ${KEN_BURNS_DURATION}ms ease-in-out infinite alternate`,
            ...colorTreatment,
          }}
        />
      </Box>
    );
  }

  return null;
};

// ─── Per-card component ───────────────────────────────────────────────────────
const SchoolCard = ({ team, navigate }) => {
  const [frameIndex, setFrameIndex] = useState(() =>
    Math.floor(Math.random() * FRAMES.length),
  );
  const [phase, setPhase] = useState("idle");
  const [enterKey, setEnterKey] = useState(0);
  const [colorTreatment, setColorTreatment] = useState({});
  const timeoutRef = useRef(null);

  const primaryColor = team.colors?.primary || "#888888";
  const frame = FRAMES[frameIndex];

  const advance = useCallback(() => {
    setPhase("exiting");

    timeoutRef.current = setTimeout(() => {
      let nextIndex;
      setFrameIndex((prev) => {
        const options = FRAMES.map((_, i) => i).filter((i) => i !== prev);
        nextIndex = options[Math.floor(Math.random() * options.length)];
        return nextIndex;
      });

      // If entering logoBig, apply random color treatment
      const nextFrame = FRAMES[nextIndex ?? 0];
      if (nextFrame === "logoBig") {
        const treatment =
          COLOR_TREATMENTS[Math.floor(Math.random() * COLOR_TREATMENTS.length)];
        setColorTreatment(treatment(primaryColor));
      }

      setEnterKey((k) => k + 1);
      setPhase("entering");
      timeoutRef.current = setTimeout(() => setPhase("idle"), 600);
    }, EXIT_DURATION);
  }, [primaryColor]);

  // Use useMountEffect for the animation cycle - cleaner than useEffect with deps
  useMountEffect(() => {
    const runCycle = () => {
      const duration =
        frame === "logoBig" ? KEN_BURNS_DURATION : 5000 + Math.random() * 15000;

      timeoutRef.current = setTimeout(() => {
        advance();
        runCycle();
      }, duration);
    };

    runCycle();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  });

  const animStyle =
    phase === "exiting"
      ? { animation: `${EXIT_ANIM[frame]} ${EXIT_DURATION}ms ease forwards` }
      : phase === "entering"
        ? {
            animation: `${ENTER_ANIM[FRAMES[frameIndex]]} 0.5s cubic-bezier(0.22, 1, 0.36, 1) both`,
          }
        : {};

  const isLogoBig = frame === "logoBig";

  return (
    <Box
      role="group"
      cursor="pointer"
      h="72px"
      bg="bg.primary"
      borderRadius="lg"
      overflow="hidden"
      position="relative"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderBottom="3px solid"
      borderBottomColor={primaryColor}
      transition="transform 0.25s ease, box-shadow 0.25s ease"
      _hover={{
        transform: "scale(1.03)",
        boxShadow: `0 0 16px ${primaryColor}44`,
      }}
      onClick={() => navigate(`/teams/${team.id}`)}
    >
      {/* Diagonal gradient — subtle behind logoBig */}
      <Box
        position="absolute"
        inset={0}
        bg={`linear-gradient(45deg, ${primaryColor}33 0%, transparent 65%)`}
        opacity={isLogoBig ? 0.4 : 1}
        transition="opacity 0.5s ease"
        pointerEvents="none"
      />

      {/* Small watermark — hidden during logoBig */}
      <Image
        src={team.logo}
        alt=""
        position="absolute"
        right="-8%"
        bottom="-8%"
        boxSize="62px"
        objectFit="contain"
        opacity={isLogoBig ? 0 : 0.07}
        filter="grayscale(1)"
        transition="opacity 0.4s ease"
        pointerEvents="none"
      />

      {/* Animated frame — key forces remount on enter */}
      <Flex
        key={enterKey}
        position="absolute"
        inset={0}
        align="center"
        px={isLogoBig ? 0 : 4}
        style={animStyle}
      >
        <FrameContent
          frame={frame}
          team={team}
          primaryColor={primaryColor}
          colorTreatment={colorTreatment}
        />
      </Flex>
    </Box>
  );
};

// ─── Static keyframes for enter/exit and Ken Burns ───────────────────────────
const STATIC_CSS = `
  @keyframes fusionFromRight    { from { opacity:0; transform:translateX(28px);  } to { opacity:1; transform:translateX(0);  } }
  @keyframes fusionToLeft       { from { opacity:1; transform:translateX(0);     } to { opacity:0; transform:translateX(-20px); } }
  @keyframes fusionFadeScale    { from { opacity:0; transform:scale(0.94);       } to { opacity:1; transform:scale(1);       } }
  @keyframes fusionFadeScaleOut { from { opacity:1; transform:scale(1);          } to { opacity:0; transform:scale(0.94);   } }
  @keyframes fusionFromTop      { from { opacity:0; transform:translateY(-22px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fusionToBottom     { from { opacity:1; transform:translateY(0);     } to { opacity:0; transform:translateY(16px);  } }
  @keyframes fusionFromBottom   { from { opacity:0; transform:translateY(22px);  } to { opacity:1; transform:translateY(0); } }
  @keyframes fusionToTop        { from { opacity:1; transform:translateY(0);     } to { opacity:0; transform:translateY(-16px); } }
  
  /* Static Ken Burns animation - no dynamic injection needed */
  @keyframes kenBurns {
    0%   { transform: scale(1.4) translate(-5%, -5%) rotate(-3deg); }
    100% { transform: scale(1.6) translate(5%, 5%) rotate(3deg); }
  }
`;

// ─── Main export ──────────────────────────────────────────────────────────────
export const SchoolDirectoryFusion = () => {
  const navigate = useNavigate();

  return (
    <Box
      w="full"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg="bg.secondary"
      p={4}
    >
      <style>{STATIC_CSS}</style>
      <SimpleGrid columns={6} gap={3}>
        {teams.map((team) => (
          <SchoolCard key={team.id} team={team} navigate={navigate} />
        ))}
      </SimpleGrid>
    </Box>
  );
};
