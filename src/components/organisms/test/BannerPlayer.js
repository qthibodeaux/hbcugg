import { useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import useMountEffect from "../../../hooks/useMountEffect";

const STAT_LINES = [
  "2025 · WK 8 · vs JSU · 13 CAR · 98 YDS · 2 TD",
  "2025 · WK 7 · vs PVAMU · 22 CAR · 142 YDS · 3 TD",
  "2025 · WK 10 · @ GSU · 13 CAR · 112 YDS · 1 TD",
];

const TICK_HOLD = 8000;   // visible for 8s
const TICK_FADE = 600;    // fade duration ms

// Cycles through stat lines: fade in → hold → fade out → next
const useStatTicker = (lines) => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useMountEffect(() => {
    let current = 0;
    let fadeTimer;
    let holdTimer;

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
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(fadeTimer);
    };
  });

  return { stat: lines[index], visible };
};

const MOCK_PLAYER = {
  firstName: "Carl",
  lastName: "Henderson-Williams",
  number: "19",
  position: "Running Back",
  gloryRating: 50,
  photo: "https://a.espncdn.com/i/headshots/college-football/players/full/5300389.png",
  team: {
    shortName: "Alcorn",
    conference: "SWAC",
    division: "East",
    primary: "#5C068C",
    secondary: "#FFD100",
  },
};

// Full-height avatar column — stretches to banner height
const PlayerAvatar = ({ src, primary }) => (
  <Box position="relative" w="160px" flexShrink={0} alignSelf="stretch">
    {/* Side glow */}
    <Box
      position="absolute"
      inset="-2px"
      style={{
        background: `linear-gradient(to top, ${primary} 0%, ${primary}30 50%, transparent 100%)`,
        filter: "blur(6px)",
        opacity: 0.5,
      }}
      pointerEvents="none"
    />
    <Box
      w="full"
      h="full"
      overflow="hidden"
      position="relative"
      borderRight="1px solid"
      borderColor={`${primary}40`}
    >
      {src ? (
        <Box
          as="img"
          src={src}
          w="full"
          h="full"
          style={{ objectFit: "cover", objectPosition: "top center" }}
        />
      ) : (
        <Box
          w="full"
          h="full"
          bg={`linear-gradient(180deg, #1a1a1f 0%, ${primary}30 100%)`}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="28px" fontWeight="black" color={`${primary}80`} fontStyle="italic">?</Text>
        </Box>
      )}
      {/* Team color gradient rising from bottom */}
      <Box
        position="absolute"
        bottom={0} left={0} right={0}
        h="60%"
        style={{ background: `linear-gradient(to top, ${primary}cc 0%, transparent 100%)` }}
        pointerEvents="none"
      />
    </Box>
  </Box>
);

// School pill — secondary bg, primary text
// Other pills — outlined in primary
const TagPill = ({ label, school, primary, secondary }) => (
  <Box
    px={2}
    py="3px"
    borderRadius="sm"
    bg={school ? secondary : "transparent"}
    border="1px solid"
    borderColor={school ? secondary : `${primary}80`}
  >
    <Text
      fontSize="9px"
      fontWeight="black"
      color={school ? primary : "white"}
      textTransform="uppercase"
      letterSpacing="0.12em"
    >
      {label}
    </Text>
  </Box>
);

const BannerPlayer4x1 = ({ player, season, setSeason }) => {
  const { team } = player;
  const primary = team.primary ?? "#A855F7";
  const secondary = team.secondary ?? "#FFFFFF";
  const { stat, visible } = useStatTicker(STAT_LINES);
  const gradient = `linear-gradient(110deg, ${primary} 0%, ${primary}60 20%, #0B0B0D 50%, #0B0B0D 100%)`;
  const divisionLabel = team.division ? `${team.conference} ${team.division}` : team.conference;

  return (
    <Box
      position="relative"
      overflow="hidden"
      borderRadius="2xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      h="100%"
      bg={gradient}
    >
      {/* Ghost watermark — slow scrolls left forever */}
      <style>{`
        @keyframes ghostScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
      <Box
        position="absolute"
        bottom="-20px"
        left="0"
        pointerEvents="none"
        userSelect="none"
        style={{ animation: "ghostScroll 18s linear infinite", fontSize: "clamp(80px, 16vw, 180px)" }}
        whiteSpace="nowrap"
      >
        {/* Duplicate so the scroll loops seamlessly */}
        {[0, 1].map((i) => (
          <Text
            key={i}
            as="span"
            fontWeight="black"
            style={{ fontSize: "clamp(80px, 16vw, 180px)" }}
            fontStyle="italic"
            color="white"
            opacity={0.05}
            textTransform="uppercase"
            lineHeight={1}
            letterSpacing="-0.05em"
            pr="80px"
          >
            {player.lastName.toUpperCase()}
          </Text>
        ))}
      </Box>

      <Flex h="100%" align="stretch">

        {/* Col 1: full-height avatar */}
        <PlayerAvatar src={player.photo} primary={primary} />

        {/* Col 2: name + pills */}
        <Flex flex={1} align="center" pl={7} pr={6} minW={0} overflow="hidden">
          <Box minW={0} overflow="hidden">
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
              {player.firstName}
            </Text>
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
              {player.lastName}
            </Text>
            <Flex align="center" gap={2} mt={3} flexWrap="wrap">
              <TagPill label={team.shortName} school primary={primary} secondary={secondary} />
              <TagPill label={player.position} primary={primary} secondary={secondary} />
              <TagPill label={divisionLabel} primary={primary} secondary={secondary} />

              {/* Editorial — same row as stat ticker */}
              <Box w="1px" h="10px" bg="rgba(255,255,255,0.2)" alignSelf="center" flexShrink={0} />
              <Text fontWeight="black" color="rgba(255,255,255,0.5)" textTransform="uppercase" letterSpacing="0.18em" whiteSpace="nowrap" style={{ fontSize: "clamp(7px, 0.9vw, 9px)" }}>
                THE PLAYERS DRIVING THE GLORY
              </Text>
              {/* Stat ticker */}
              <Box w="1px" h="14px" bg="rgba(255,255,255,0.15)" mx={1} alignSelf="center" />
              <Text
                fontSize="9px"
                fontWeight="black"
                color="rgba(255,255,255,0.6)"
                textTransform="uppercase"
                letterSpacing="0.1em"
                whiteSpace="nowrap"
                style={{
                  opacity: visible ? 1 : 0,
                  transition: `opacity ${TICK_FADE}ms ease`,
                }}
              >
                {stat}
              </Text>
            </Flex>
          </Box>
        </Flex>

        {/* Hairline */}
        <Box w="1px" bg="rgba(255,255,255,0.12)" my={6} flexShrink={0} />

        {/* Right: Glory Rating */}
        <Flex direction="column" justify="center" align="center" px={10} flexShrink={0} minW="180px" gap={1}>
          <Text
            fontSize="8px"
            fontWeight="black"
            color="rgba(255,255,255,0.35)"
            textTransform="uppercase"
            letterSpacing="0.22em"
            mb={1}
          >
            Glory Rating
          </Text>
          <Text
            fontSize="9xl"
            fontWeight="black"
            color="white"
            lineHeight={1}
            letterSpacing="-0.04em"
          >
            {player.gloryRating}
          </Text>
          <Text
            fontSize="10px"
            fontWeight="black"
            color="rgba(255,255,255,0.3)"
            letterSpacing="0.1em"
          >
            / 100
          </Text>
        </Flex>

      </Flex>
    </Box>
  );
};

export const BannerPlayer = () => {
  const [season, setSeason] = useState(2025);
  return <BannerPlayer4x1 player={MOCK_PLAYER} season={season} setSeason={setSeason} />;
};
