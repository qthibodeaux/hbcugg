import React, { useCallback, useRef, useState } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import useMountEffect from "../../../hooks/useMountEffect";
import teamsData from "../../../data/teams.json";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";

const teams = [...teamsData.teams].sort((a, b) => a.name.localeCompare(b.name));

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
const KEN_BURNS_DURATION = 8000;

const COLOR_TREATMENTS = [
  () => ({ filter: "none", opacity: 0.9 }),
  () => ({ filter: "saturate(1.8) contrast(1.1)", opacity: 0.85 }),
  () => ({ filter: "brightness(2) saturate(0)", opacity: 0.15 }),
  () => ({ filter: "grayscale(0.6) sepia(0.4) saturate(1.4)", opacity: 0.75 }),
  () => ({ filter: "contrast(1.6) saturate(1.3)", opacity: 0.8 }),
];

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
    0%   { transform: scale(1.34) translate(-5%, -5%) rotate(-3deg); }
    100% { transform: scale(1.52) translate(5%, 5%) rotate(3deg); }
  }
`;

const compactLabel = (team) => team.bannerShort || team.shortName || team.name;

// Mobile "standard" tiles go edge-to-edge (no shell padding, no grid gap,
// square corners) to match TeamScheduleBannerA's mobile tile look — the
// rotating frame content inside each tile is unchanged.
const DirectoryShell = ({ children, variant }) => {
  const { isMobile } = useLayoutDensity();
  const isMobileStandard = isMobile && variant !== "compact";
  return (
    <Box
      w="full"
      h="full"
      minH={variant === "compact" ? "144px" : "clamp(160px, 20vw, 260px)"}
      bg="#0B0B0D"
      overflow="hidden"
      p={isMobileStandard ? 0 : variant === "compact" ? "4px" : { base: "4px", lg: "6px" }}
    >
      <style>{STATIC_CSS}</style>
      {children}
    </Box>
  );
};

const DirectoryGrid = ({ children, variant }) => {
  const { isMobile } = useLayoutDensity();
  const isMobileStandard = isMobile && variant !== "compact";
  return (
    <Grid
      h="full"
      minH={0}
      templateColumns="repeat(6, minmax(0, 1fr))"
      templateRows="repeat(3, minmax(0, 1fr))"
      gap={isMobileStandard ? "0" : variant === "compact" ? "4px" : { base: "4px", lg: "6px" }}
    >
      {children}
    </Grid>
  );
};

const FrameContent = ({ frame, team, primaryColor, colorTreatment, isMobile }) => {
  if (frame === "abbrev") {
    return (
      <Text
        fontSize="clamp(0.9rem, 1.45vw, 1.22rem)"
        fontWeight="black"
        fontStyle="italic"
        color="white"
        textTransform="uppercase"
        lineHeight={0.92}
        lineClamp={1}
      >
        {compactLabel(team)}
      </Text>
    );
  }

  if (frame === "fullName") {
    return (
      <Text
        fontSize="clamp(0.7rem, 1.05vw, 0.92rem)"
        fontWeight="black"
        fontStyle="italic"
        color="white"
        textTransform="uppercase"
        lineHeight={1.02}
        lineClamp={2}
      >
        {team.name}
      </Text>
    );
  }

  if (frame === "logo") {
    // Mobile — cards are too narrow at 6-across for the logo+mascot inline
    // row (desktop layout below) to read at all. Logo dominates the square,
    // team name sits as its own caption bar pinned to the bottom instead of
    // sharing a vertically-centered row with it.
    if (isMobile) {
      return (
        <Flex direction="column" h="full" w="full" align="center" justify="space-between">
          <Flex flex="1" align="center" justify="center" minH={0} w="full">
            <Image
              src={team.logo}
              alt={team.name}
              maxW="80%"
              maxH="80%"
              objectFit="contain"
              filter="drop-shadow(0 2px 8px rgba(0,0,0,0.6))"
            />
          </Flex>
          <Text
            fontSize="clamp(0.42rem, 1.6vw, 0.58rem)"
            fontWeight="black"
            fontStyle="italic"
            color="white"
            textTransform="uppercase"
            letterSpacing="-0.01em"
            lineHeight={1}
            lineClamp={1}
            textAlign="center"
            w="full"
          >
            {compactLabel(team)}
          </Text>
        </Flex>
      );
    }

    return (
      <Flex align="center" gap={{ base: 1.5, lg: 2.5 }} minW={0}>
        <Image
          src={team.logo}
          alt={team.name}
          boxSize="clamp(24px, 3vw, 38px)"
          objectFit="contain"
          filter="drop-shadow(0 2px 10px rgba(0,0,0,0.6))"
          flexShrink={0}
        />
        <Text
          fontSize="clamp(0.45rem, 0.75vw, 0.62rem)"
          fontWeight="black"
          color="text.muted"
          textTransform="uppercase"
          letterSpacing="0.1em"
          lineHeight={1.15}
          lineClamp={2}
          minW={0}
        >
          {team.mascot}
        </Text>
      </Flex>
    );
  }

  if (frame === "player") {
    return (
      <Flex align="center" gap={{ base: 1.5, lg: 2.5 }} minW={0}>
        <Box
          w="clamp(24px, 3vw, 34px)"
          h="clamp(24px, 3vw, 34px)"
          borderRadius="8px"
          bg={`${primaryColor}33`}
          border="1px solid"
          borderColor={`${primaryColor}66`}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <User size={14} color={primaryColor} />
        </Box>
        <Box minW={0}>
          <Text
            fontSize="clamp(0.42rem, 0.7vw, 0.56rem)"
            fontWeight="black"
            color="text.muted"
            textTransform="uppercase"
            letterSpacing="0.12em"
            lineClamp={1}
          >
            {team.conference}
          </Text>
          <Text fontSize="clamp(0.58rem, 0.85vw, 0.72rem)" fontWeight="black" color="white" textTransform="uppercase" lineClamp={1}>
            {compactLabel(team)}
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

const StandardSchoolCard = ({ team, navigate, target }) => {
  const [frameIndex, setFrameIndex] = useState(() => Math.floor(Math.random() * FRAMES.length));
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
        const options = FRAMES.map((_, index) => index).filter((index) => index !== prev);
        nextIndex = options[Math.floor(Math.random() * options.length)];
        return nextIndex;
      });

      if (FRAMES[nextIndex ?? 0] === "logoBig") {
        const treatment = COLOR_TREATMENTS[Math.floor(Math.random() * COLOR_TREATMENTS.length)];
        setColorTreatment(treatment(primaryColor));
      }

      setEnterKey((key) => key + 1);
      setPhase("entering");
      timeoutRef.current = setTimeout(() => setPhase("idle"), 600);
    }, EXIT_DURATION);
  }, [primaryColor]);

  useMountEffect(() => {
    const runCycle = () => {
      const duration = frame === "logoBig" ? KEN_BURNS_DURATION : 5000 + Math.random() * 15000;
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
        ? { animation: `${ENTER_ANIM[FRAMES[frameIndex]]} 0.5s cubic-bezier(0.22, 1, 0.36, 1) both` }
        : {};

  const { isMobile } = useLayoutDensity();
  const isLogoBig = frame === "logoBig";
  const isFullBleedLogoFrame = isLogoBig || (isMobile && frame === "logo");

  return (
    <Box
      as="button"
      role="group"
      cursor="pointer"
      h="full"
      w="full"
      minW={0}
      minH={0}
      bg="bg.primary"
      borderRadius={isMobile ? 0 : "8px"}
      overflow="hidden"
      position="relative"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderBottom="3px solid"
      borderBottomColor={primaryColor}
      transition="transform 0.25s ease, box-shadow 0.25s ease"
      _hover={{
        transform: "scale(1.025)",
        boxShadow: `0 0 16px ${primaryColor}44`,
      }}
      onClick={() => navigate(`/teams/${team.id}/wiki`)}
      textAlign="left"
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
        bottom="-12%"
        boxSize="clamp(44px, 5vw, 66px)"
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
        align={isFullBleedLogoFrame ? "stretch" : "center"}
        px={isFullBleedLogoFrame ? 0 : { base: 2.5, lg: 3.5 }}
        py={isMobile && frame === "logo" ? 1 : 0}
        style={animStyle}
        minW={0}
      >
        <FrameContent frame={frame} team={team} primaryColor={primaryColor} colorTreatment={colorTreatment} isMobile={isMobile} />
      </Flex>
    </Box>
  );
};

const CompactSchoolCard = ({ team, navigate, target }) => {
  const primaryColor = team.colors?.primary || "#888888";
  const label = compactLabel(team);

  return (
    <Box
      as="button"
      onClick={() => navigate(`/teams/${team.id}/wiki`)}
      h="full"
      w="full"
      minW={0}
      minH={0}
      borderRadius="7px"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderBottom="2px solid"
      borderBottomColor={primaryColor}
      bg={`linear-gradient(135deg, ${primaryColor}22 0%, rgba(11,11,13,0.96) 58%)`}
      position="relative"
      overflow="hidden"
      textAlign="left"
      px={{ base: 1.5, lg: 2 }}
      display="flex"
      alignItems="center"
      gap={{ base: 1.5, lg: 2 }}
      transition="transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease"
      _hover={{ borderColor: primaryColor, transform: "translateY(-1px)", boxShadow: `0 0 12px ${primaryColor}33` }}
    >
      <Image src={team.logo} alt={team.name} boxSize="clamp(18px, 2.2vw, 28px)" objectFit="contain" flexShrink={0} />
      <Box minW={0} flex={1}>
        <Text
          fontSize="clamp(0.48rem, 0.86vw, 0.68rem)"
          color="white"
          fontWeight="black"
          fontStyle="italic"
          textTransform="uppercase"
          lineHeight={0.95}
          lineClamp={1}
          whiteSpace="nowrap"
        >
          {label}
        </Text>
        <Text
          display={{ base: "none", lg: "block" }}
          mt="2px"
          fontSize="7px"
          color="text.muted"
          fontWeight="black"
          textTransform="uppercase"
          letterSpacing="0.12em"
          lineClamp={1}
        >
          {team.conference}
        </Text>
      </Box>
      <Text position="absolute" right="-6px" bottom="-9px" fontSize="38px" color="white" opacity={0.045} fontWeight="black" lineHeight={1}>
        {label}
      </Text>
    </Box>
  );
};

const SchoolDirectoryCompact = ({ navigate, target }) => (
  <DirectoryShell variant="compact">
    <DirectoryGrid variant="compact">
      {teams.map((team) => (
        <CompactSchoolCard key={team.id} team={team} navigate={navigate} target={target} />
      ))}
    </DirectoryGrid>
  </DirectoryShell>
);

const SchoolDirectoryStandard = ({ navigate, target }) => (
  <DirectoryShell variant="standard">
    <DirectoryGrid variant="standard">
      {teams.map((team) => (
        <StandardSchoolCard key={team.id} team={team} navigate={navigate} target={target} />
      ))}
    </DirectoryGrid>
  </DirectoryShell>
);

export const WikiDirectory = ({ variant = "standard", target = "team" }) => {
  const navigate = useNavigate();

  if (variant === "compact") {
    return <SchoolDirectoryCompact navigate={navigate} target={target} />;
  }

  return <SchoolDirectoryStandard navigate={navigate} target={target} />;
};
