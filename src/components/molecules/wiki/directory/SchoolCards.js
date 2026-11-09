import { useState, useRef, useCallback } from "react";
import { FRAMES, COLOR_TREATMENTS, EXIT_DURATION, KEN_BURNS_DURATION, EXIT_ANIM, ENTER_ANIM, compactLabel } from "./wikiDirectoryModel";
import useMountEffect from "../../../../hooks/useMountEffect";
import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";
import { Box, Image, Flex, Text } from "@chakra-ui/react";
import { FrameContent } from "./DirectoryFrameContent";

export const StandardSchoolCard = ({ team, navigate, target }) => {
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

export const CompactSchoolCard = ({ team, navigate, target }) => {
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
