import { useState } from "react";
import useMountEffect from "../../../hooks/useMountEffect";
import { Text, Box, Flex } from "@chakra-ui/react";
import { SeasonSelector } from "../game/SeasonSelector";

const BRAND_GRADIENT = "linear-gradient(110deg, #A855F7 0%, #6B21A8 28%, #1B0630 58%, #0B0B0D 100%)";

const TICK_HOLD = 4000;

const TICK_FADE = 500;

const useSubTicker = (lines) => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  useMountEffect(() => {
    let current = 0;
    let holdTimer, fadeTimer;
    const cycle = () => {
      setVisible(true);
      holdTimer = setTimeout(() => {
        setVisible(false);
        fadeTimer = setTimeout(() => {
          current = (current + 1) % lines.length;
          setIndex(current);
          cycle();
        }, TICK_FADE);
      }, TICK_HOLD);
    };
    cycle();
    return () => { clearTimeout(holdTimer); clearTimeout(fadeTimer); };
  });
  return { line: lines[index], visible };
};

const GhostWord = ({ word }) => (
  <Text
    position="absolute"
    bottom="-20px"
    left="0"
    fontWeight="black"
    style={{ fontSize: "clamp(80px, 16vw, 180px)" }}
    fontStyle="italic"
    color="white"
    opacity={0.05}
    textTransform="uppercase"
    lineHeight={1}
    letterSpacing="-0.05em"
    pointerEvents="none"
    userSelect="none"
    whiteSpace="nowrap"
  >
    {word}
  </Text>
);

const Headline = ({ title, editorial, tickerLines }) => {
  const { line, visible } = useSubTicker(tickerLines);
  return (
    <Box>
      <Text
        fontWeight="black"
        fontStyle="italic"
        color="white"
        textTransform="uppercase"
        lineHeight={0.85}
        letterSpacing="-0.04em"
        whiteSpace="nowrap"
        style={{ fontSize: "clamp(2rem, 5.5vw, 6rem)" }}
      >
        {title}
      </Text>
      <Flex align="center" gap={3} mt={3} flexWrap="nowrap">
        <Box h="1px" w="28px" bg="rgba(255,255,255,0.3)" flexShrink={0} />
        <Text
          fontWeight="black"
          color="rgba(255,255,255,0.5)"
          textTransform="uppercase"
          letterSpacing="0.18em"
          whiteSpace="nowrap"
          style={{ fontSize: "clamp(7px, 0.9vw, 9px)" }}
        >
          {editorial}
        </Text>
        <Box w="1px" h="10px" bg="rgba(255,255,255,0.2)" flexShrink={0} />
        <Text
          fontWeight="black"
          color="rgba(255,255,255,0.28)"
          textTransform="uppercase"
          letterSpacing="0.15em"
          whiteSpace="nowrap"
          style={{
            fontSize: "clamp(7px, 0.9vw, 9px)",
            opacity: visible ? 1 : 0,
            transition: `opacity ${TICK_FADE}ms ease`,
          }}
        >
          {line}
        </Text>
      </Flex>
    </Box>
  );
};

const Hairline = () => (
  <Box w="1px" bg="rgba(255,255,255,0.12)" my={6} flexShrink={0} />
);

const PanelLabel = ({ children }) => (
  <Text
    fontSize="8px"
    fontWeight="black"
    color="rgba(255,255,255,0.35)"
    textTransform="uppercase"
    letterSpacing="0.22em"
    mb={2}
  >
    {children}
  </Text>
);

export const SeasonPicker = ({ season, setSeason, seasons }) => (
  <SeasonSelector season={season} setSeason={setSeason} seasons={seasons} />
);

export const FilterPills = ({ label, options, active, setActive }) => (
  <Box>
    <PanelLabel>{label}</PanelLabel>
    <Flex direction="column" gap={1} align="center">
      {options.map((o) => (
        <Box
          key={o.id}
          as="button"
          px={3}
          py={1}
          borderRadius="sm"
          cursor="pointer"
          bg={active === o.id ? "rgba(255,255,255,0.18)" : "transparent"}
          border="1px solid"
          borderColor={active === o.id ? "rgba(255,255,255,0.45)" : "transparent"}
          onClick={() => setActive(o.id)}
          style={{ transition: "all 0.15s" }}
          whiteSpace="nowrap"
        >
          <Text
            fontSize="9px"
            fontWeight="black"
            textAlign="center"
            color={active === o.id ? "white" : "rgba(255,255,255,0.3)"}
          >
            {o.label}
          </Text>
        </Box>
      ))}
    </Flex>
  </Box>
);

export const BannerShell = ({ ghost, title, editorial, tickerLines, children }) => (
  <Box
    position="relative"
    overflow="hidden"
    borderRadius="2xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    h="100%"
    bg={BRAND_GRADIENT}
  >
    <GhostWord word={ghost} />
    <Flex h="100%" align="stretch">
      <Flex flex={1} align="center" pl={8} pr={6}>
        <Headline title={title} editorial={editorial} tickerLines={tickerLines} />
      </Flex>
      <Hairline />
      <Flex direction="column" justify="center" align="center" px={7} gap={4} flexShrink={0} minW="140px">
        {children}
      </Flex>
    </Flex>
  </Box>
);
