import { Text, Flex, Image, Circle, Box, Grid } from "@chakra-ui/react";
import { User } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import useMountEffect from "../../../../hooks/useMountEffect";
import { useNavigate } from "react-router-dom";
import { TEAMS } from "./ConferenceWikiData";

// Existing implementation extracted along responsibility boundaries.

const FRAMES = ["abbrev", "fullName", "logo", "player", "logoBig"];

const COMPACT_FRAMES = ["abbrev", "logo", "logoBig"];

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

const KEN_BURNS_DURATION = 8000;

const COLOR_TREATMENTS = [
  (primary) => ({ filter: "none", opacity: 0.9 }),
  (primary) => ({ filter: "saturate(1.8) contrast(1.1)", opacity: 0.85 }),
  (primary) => ({ filter: "brightness(2) saturate(0)", opacity: 0.15 }),
  (primary) => ({
    filter: "grayscale(0.6) sepia(0.4) saturate(1.4)",
    opacity: 0.75,
  }),
  (primary) => ({ filter: "contrast(1.6) saturate(1.3)", opacity: 0.8 }),
];

const FrameContent = ({ frame, team, primaryColor, colorTreatment, isCompact }) => {
  if (frame === "abbrev") {
    return (
      <Text
        fontSize={isCompact ? "lg" : "xl"}
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
      <Flex align="center" gap={isCompact ? 2 : 3}>
        <Image
          src={team.logo}
          alt={team.name}
          boxSize={isCompact ? "32px" : "42px"}
          objectFit="contain"
          filter="drop-shadow(0 2px 10px rgba(0,0,0,0.6))"
        />
        {!isCompact && (
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
        )}
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

const SchoolCard = ({ team, navigate, isCompact }) => {
  const activeFrames = isCompact ? COMPACT_FRAMES : FRAMES;
  const [frameIndex, setFrameIndex] = useState(() =>
    Math.floor(Math.random() * activeFrames.length),
  );
  const [phase, setPhase] = useState("idle");
  const [enterKey, setEnterKey] = useState(0);
  const [colorTreatment, setColorTreatment] = useState({});
  const timeoutRef = useRef(null);

  const primaryColor = team.colors?.primary || "#888888";
  const frame = activeFrames[frameIndex];

  const advance = useCallback(() => {
    setPhase("exiting");

    timeoutRef.current = setTimeout(() => {
      let nextIndex;
      setFrameIndex((prev) => {
        const options = activeFrames.map((_, i) => i).filter((i) => i !== prev);
        nextIndex = options[Math.floor(Math.random() * options.length)];
        return nextIndex;
      });

      const nextFrame = activeFrames[nextIndex ?? 0];
      if (nextFrame === "logoBig") {
        const treatment =
          COLOR_TREATMENTS[Math.floor(Math.random() * COLOR_TREATMENTS.length)];
        setColorTreatment(treatment(primaryColor));
      }

      setEnterKey((k) => k + 1);
      setPhase("entering");
      timeoutRef.current = setTimeout(() => setPhase("idle"), 600);
    }, EXIT_DURATION);
  }, [primaryColor, activeFrames]);

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
            animation: `${ENTER_ANIM[activeFrames[frameIndex]]} 0.5s cubic-bezier(0.22, 1, 0.36, 1) both`,
          }
        : {};

  const isLogoBig = frame === "logoBig";

  return (
    <Box
      role="group"
      cursor="pointer"
      h={isCompact ? "48px" : "72px"}
      bg="bg.primary"
      borderRadius={isCompact ? "md" : "lg"}
      overflow="hidden"
      position="relative"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderBottom={isCompact ? "2px solid" : "3px solid"}
      borderBottomColor={primaryColor}
      transition="transform 0.25s ease, box-shadow 0.25s ease"
      _hover={{
        transform: "scale(1.03)",
        boxShadow: `0 0 16px ${primaryColor}44`,
      }}
      onClick={() => navigate(`/teams/${team.id}/wiki`)}
    >
      <Box
        position="absolute"
        inset={0}
        bg={`linear-gradient(45deg, ${primaryColor}33 0%, transparent 65%)`}
        opacity={isLogoBig ? 0.4 : 1}
        transition="opacity 0.5s ease"
        pointerEvents="none"
      />

      <Image
        src={team.logo}
        alt=""
        position="absolute"
        right="-8%"
        bottom="-8%"
        boxSize={isCompact ? "42px" : "62px"}
        objectFit="contain"
        opacity={isLogoBig ? 0 : 0.07}
        filter="grayscale(1)"
        transition="opacity 0.4s ease"
        pointerEvents="none"
      />

      <Flex
        key={enterKey}
        position="absolute"
        inset={0}
        align="center"
        px={isLogoBig ? 0 : isCompact ? 3 : 4}
        style={animStyle}
      >
        <FrameContent
          frame={frame}
          team={team}
          primaryColor={primaryColor}
          colorTreatment={colorTreatment}
          isCompact={isCompact}
        />
      </Flex>
    </Box>
  );
};

const STATIC_CSS = `
  @keyframes fusionFromRight    { from { opacity:0; transform:translateX(28px);  } to { opacity:1; transform:translateX(0);  } }
  @keyframes fusionToLeft       { from { opacity:1; transform:translateX(0);     } to { opacity:0; transform:translateX(-20px); } }
  @keyframes fusionFadeScale    { from { opacity:0; transform:scale(0.94);       } to { opacity:1; transform:scale(1);       } }
  @keyframes fusionFadeScaleOut { from { opacity:1; transform:scale(1);          } to { opacity:0; transform:scale(0.94);   } }
  @keyframes fusionFromTop      { from { opacity:0; transform:translateY(-22px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fusionToBottom     { from { opacity:1; transform:translateY(0);     } to { opacity:0; transform:translateY(16px);  } }
  @keyframes fusionFromBottom   { from { opacity:0; transform:translateY(22px);  } to { opacity:1; transform:translateY(0); } }
  @keyframes fusionToTop        { from { opacity:1; transform:translateY(0);     } to { opacity:0; transform:translateY(-16px); } }
  @keyframes kenBurns {
    0%   { transform: scale(1.4) translate(-5%, -5%) rotate(-3deg); }
    100% { transform: scale(1.6) translate(5%, 5%) rotate(3deg); }
  }
`;

export const WikiDirectoryComponent = ({ variant = "standard" }) => {
    const navigate = useNavigate();
    const isCompact = variant === "compact";

    return (
        <Box w="full" bg="#0B0B0D" p={isCompact ? 1 : 2}>
            <style>{STATIC_CSS}</style>
            <Grid templateColumns="repeat(6, 1fr)" gap={isCompact ? 1 : 2}>
                {TEAMS.map((team) => (
                    <SchoolCard key={team.id} team={team} navigate={navigate} isCompact={isCompact} />
                ))}
            </Grid>
        </Box>
    );
};
