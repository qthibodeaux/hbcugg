import { useState } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { ArrowRight, Pause, Play } from "lucide-react";

const TEAM = {
  name: "Prairie View A&M",
  shortName: "PVAMU",
  primary: "#4B0082",
  secondary: "#FFB81C",
};

const PLAYERS = [
  {
    type: "player",
    name: "Ja'Koby Banks",
    label: "Ja'Koby Banks",
    jersey: 1,
    pos: "WR",
    size: "5'9 / 178",
    classYear: "Jr.",
    image: "https://pvpanthers.com/images/2025/7/23/28_Ja_Koby_Banks.jpg",
    stats: ["WR", "5'9 / 178", "Jr.", "Veteran Core"],
  },
  {
    type: "player",
    name: "Sterling Roberts",
    label: "Sterling Roberts",
    jersey: 3,
    pos: "LB",
    size: "6'1 / 200",
    classYear: "Sr.",
    image: "https://pvpanthers.com/images/2025/7/23/91_Sterling_Roberts.jpg",
    stats: ["LB", "6'1 / 200", "Sr.", "Upperclass"],
  },
  {
    type: "player",
    name: "Cameron Petis",
    label: "Cameron Petis",
    jersey: 4,
    pos: "QB",
    size: "6'4 / 207",
    classYear: "Sr.",
    image: "https://pvpanthers.com/images/2025/7/23/11_Cameron_Petis.jpg",
    stats: ["QB", "5 QB Room", "Sr.", "6'4 / 207"],
  },
  {
    type: "player",
    name: "Travor Randle",
    label: "Travor Randle",
    jersey: 4,
    pos: "S",
    size: "5'10 / 205",
    classYear: "Gr.",
    image: "https://pvpanthers.com/images/2025/7/23/52_Travor_Randle.jpg",
    stats: ["S", "DB Room", "Gr.", "5'10 / 205"],
  },
  {
    type: "room",
    name: "Defensive Backs",
    label: "Defensive Backs",
    jersey: "DB",
    pos: "DEEPEST",
    image: null,
    stats: ["15 Players", "47% Upperclass", "Deepest Room", "Roster Build"],
  },
];

const ROSTER_FACTS = {
  total: 80,
  upperclass: 73.8,
  newAdditions: 13,
  transfers: 2,
  dna: "Veteran Core",
  classStack: [
    { label: "FR", count: 11, color: "#4B0082" },
    { label: "SO", count: 10, color: "#7A35B0" },
    { label: "JR", count: 24, color: "#FFB81C" },
    { label: "SR", count: 15, color: "#111111" },
    { label: "GR", count: 20, color: "#B08BFF" },
  ],
  deepestRooms: [
    { label: "DB", value: 15 },
    { label: "OL", value: 15 },
  ],
};

const wrapIndex = (index) => (index + PLAYERS.length) % PLAYERS.length;
const nextIndex = (index) => wrapIndex(index + 1);

const StackCard = ({ slide, active = false, offset = 0, onClick }) => {
  const isRoom = slide.type === "room";

  return (
    <Box
      as="button"
      onClick={onClick}
      position="absolute"
      left={active ? "0%" : `${36 + offset * 14}%`}
      top={active ? "0%" : "11%"}
      w={active ? "48%" : "36%"}
      h={active ? "100%" : "80%"}
      overflow="hidden"
      bg={isRoom ? TEAM.primary : "#f2eef7"}
      border="1px solid"
      borderColor="rgba(75,0,130,0.18)"
      cursor="pointer"
      textAlign="left"
      zIndex={active ? 8 : 8 - offset}
      boxShadow={active ? "16px 0 34px rgba(75,0,130,0.16)" : "10px 0 24px rgba(75,0,130,0.10)"}
      style={{ transition: "left 360ms ease, width 360ms ease, height 360ms ease, top 360ms ease" }}
      _hover={{ borderColor: TEAM.secondary }}
    >
      <Text
        position="absolute"
        top={active ? "-20px" : "-12px"}
        left={active ? "-10px" : "-8px"}
        fontSize={active ? "116px" : "76px"}
        fontWeight="black"
        color={isRoom ? "white" : TEAM.primary}
        opacity={isRoom ? 0.08 : 0.1}
        lineHeight="1"
        zIndex={1}
      >
        {slide.jersey}
      </Text>

      {isRoom ? (
        <Flex position="relative" zIndex={2} h="100%" direction="column" justify="center" px={5}>
          <Text fontSize="9px" fontWeight="black" color={TEAM.secondary} textTransform="uppercase" letterSpacing="0.16em">
            Position group
          </Text>
          <Text mt={2} fontSize={active ? "3xl" : "xl"} fontWeight="black" color="white" textTransform="uppercase" lineHeight="0.86">
            Defensive Backs
          </Text>
          <Text mt={3} fontSize="sm" fontWeight="black" color={TEAM.secondary} textTransform="uppercase">
            15 players
          </Text>
        </Flex>
      ) : (
        <Image
          src={slide.image}
          alt={slide.name}
          w="100%"
          h="100%"
          objectFit="cover"
          objectPosition="top center"
          position="relative"
          zIndex={0}
        />
      )}

      <Box
        position="absolute"
        inset={0}
        zIndex={2}
        bg={`linear-gradient(180deg, transparent 56%, ${TEAM.primary}22 76%, #ffffff 100%)`}
      />

      {!active && (
        <Box
          position="absolute"
          top={0}
          right={0}
          bottom={0}
          w="20%"
          zIndex={4}
          bg="rgba(255,255,255,0.42)"
          pointerEvents="none"
        />
      )}

      {!isRoom && (
        <Text
        position="absolute"
        left={3}
        bottom={2}
        zIndex={3}
        fontSize={active ? "12px" : "10px"}
        color={TEAM.primary}
        fontWeight="black"
        textTransform="uppercase"
        lineHeight="1"
        lineClamp={1}
      >
        #{slide.jersey} {slide.pos}
        </Text>
      )}
    </Box>
  );
};

const RosterDnaBlock = () => (
  <Box position="relative" minW={0} borderLeft="1px solid rgba(75,0,130,0.16)" overflow="hidden" px={4} py={4}>
    <Text position="absolute" right="-10px" bottom="-18px" fontSize="72px" fontWeight="black" color={TEAM.primary} opacity={0.07} lineHeight="1">
      74
    </Text>
    <Flex h="100%" direction="column" justify="center" position="relative" zIndex={1}>
      <Text fontSize="8px" fontWeight="black" color={TEAM.primary} textTransform="uppercase" letterSpacing="0.16em">
        Roster DNA
      </Text>
      <Text mt={2} fontSize="3xl" fontWeight="black" color={TEAM.primary} textTransform="uppercase" lineHeight="0.82">
        Veteran Core
      </Text>
      <Grid mt={3} templateColumns="repeat(3, minmax(0, 1fr))" gap={2}>
        <Box>
          <Text fontSize="lg" fontWeight="black" color={TEAM.secondary} lineHeight="1">24</Text>
          <Text fontSize="7px" fontWeight="black" color={TEAM.primary} textTransform="uppercase">Jr.</Text>
        </Box>
        <Box>
          <Text fontSize="lg" fontWeight="black" color={TEAM.secondary} lineHeight="1">15</Text>
          <Text fontSize="7px" fontWeight="black" color={TEAM.primary} textTransform="uppercase">Sr.</Text>
        </Box>
        <Box>
          <Text fontSize="lg" fontWeight="black" color={TEAM.secondary} lineHeight="1">20</Text>
          <Text fontSize="7px" fontWeight="black" color={TEAM.primary} textTransform="uppercase">Gr.</Text>
        </Box>
      </Grid>
    </Flex>
  </Box>
);

const ClassStackBlock = () => (
  <Box position="relative" minW={0} borderLeft="1px solid rgba(75,0,130,0.16)" overflow="hidden" px={4} py={4}>
    <Flex h="100%" direction="column" justify="center">
      <Text fontSize="8px" fontWeight="black" color={TEAM.primary} textTransform="uppercase" letterSpacing="0.16em">
        Class Stack
      </Text>
      <Flex mt={3} h="46px" w="100%" overflow="hidden" border="1px solid rgba(75,0,130,0.16)">
        {ROSTER_FACTS.classStack.map((item) => (
          <Flex
            key={item.label}
            w={`${(item.count / ROSTER_FACTS.total) * 100}%`}
            minW="12%"
            bg={item.color}
            align="center"
            justify="center"
            direction="column"
            color={item.color === "#FFB81C" ? TEAM.primary : "white"}
          >
            <Text fontSize="lg" fontWeight="black" lineHeight="1">
              {item.count}
            </Text>
            <Text fontSize="7px" fontWeight="black" textTransform="uppercase" lineHeight="1">
              {item.label}
            </Text>
          </Flex>
        ))}
      </Flex>
      <Text mt={3} fontSize="10px" fontWeight="black" color={TEAM.secondary} textTransform="uppercase" letterSpacing="0.06em" lineClamp={1}>
        59 upperclass players
      </Text>
    </Flex>
  </Box>
);

// eslint-disable-next-line no-unused-vars
const FactBlock = ({ label, value, detail }) => (
  <Flex direction="column" justify="center" minW={0} borderLeft="1px solid rgba(75,0,130,0.16)" pl={4}>
    <Text fontSize="8px" fontWeight="black" color={TEAM.primary} textTransform="uppercase" letterSpacing="0.16em">
      {label}
    </Text>
    <Text mt={1} fontSize="2xl" fontWeight="black" color={TEAM.primary} textTransform="uppercase" lineHeight="0.9" lineClamp={1}>
      {value}
    </Text>
    <Text mt={2} fontSize="10px" fontWeight="black" color={TEAM.secondary} textTransform="uppercase" letterSpacing="0.06em" lineClamp={1}>
      {detail}
    </Text>
  </Flex>
);

const StatChip = ({ value }) => (
  <Text fontSize="8px" fontWeight="black" color={TEAM.primary} textTransform="uppercase" letterSpacing="0.02em" whiteSpace="nowrap">
    {value}
  </Text>
);

const CarouselControls = ({ activeIndex, paused, onTogglePause, onSelect }) => (
  <Flex align="center" justify="flex-end" gap={2} h="100%">
    <Box
      as="button"
      onClick={onTogglePause}
      w="24px"
      h="24px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={TEAM.primary}
      color="white"
      borderRadius="sm"
      title={paused ? "Resume carousel" : "Pause carousel"}
    >
      {paused ? <Play size={12} /> : <Pause size={12} />}
    </Box>
    <Flex align="center" gap={1.25}>
      {PLAYERS.map((slide, index) => (
        <Box
          key={slide.name}
          as="button"
          onClick={() => onSelect(index)}
          title={slide.name}
          w={index === activeIndex ? "18px" : "10px"}
          h="10px"
          borderRadius="full"
          bg={index === activeIndex ? TEAM.primary : "#0B0B0D"}
          border={index === activeIndex ? `2px solid ${TEAM.primary}` : "0"}
          boxShadow={index === activeIndex ? "0 0 0 2px #ffffff inset" : "none"}
          style={{ transition: "width 180ms ease" }}
        />
      ))}
    </Flex>
  </Flex>
);

export const TeamRosterFeatureRailA = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const featured = PLAYERS[activeIndex];
  const visibleSlides = [0, 1, 2, 3].map((offset) => ({
    slide: PLAYERS[wrapIndex(activeIndex + offset)],
    offset,
    index: wrapIndex(activeIndex + offset),
  }));

  return (
    <Box
      h="100%"
      w="100%"
      bg="#FFFFFF"
      color={TEAM.primary}
      border="1px solid rgba(75,0,130,0.18)"
      borderRadius="lg"
      overflow="hidden"
      position="relative"
    >
      <style>{`
        @keyframes rosterFeatureProgress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
      <Grid h="100%" templateColumns="1.1fr 2.45fr 0.8fr 0.75fr" templateRows="1fr">
        <Box
          as="button"
          gridRow="1 / span 2"
          textAlign="left"
          bg={TEAM.primary}
          color="white"
          px={6}
          py={5}
          position="relative"
          overflow="hidden"
          _hover={{ bg: "#3c006b" }}
        >
          <Text position="absolute" right="-16px" bottom="-26px" fontSize="110px" fontWeight="black" color="white" opacity={0.08} lineHeight="1">
            80
          </Text>
          <Flex h="100%" direction="column" justify="space-between" position="relative" zIndex={1}>
            <Box minH={0}>
              <Text fontSize="9px" fontWeight="black" color={TEAM.secondary} textTransform="uppercase" letterSpacing="0.18em">
                {TEAM.shortName} roster access
              </Text>
              <Text mt={3} fontSize="clamp(2rem, 4vw, 3.75rem)" fontWeight="black" textTransform="uppercase" lineHeight="0.78" letterSpacing="-0.04em">
                View
              </Text>
              <Text fontSize="clamp(2rem, 4vw, 3.75rem)" fontWeight="black" textTransform="uppercase" lineHeight="0.78" letterSpacing="-0.04em">
                Full
              </Text>
              <Text fontSize="clamp(2rem, 4vw, 3.75rem)" fontWeight="black" textTransform="uppercase" lineHeight="0.78" letterSpacing="-0.04em">
                Roster
              </Text>
            </Box>
            <Flex align="center" justify="space-between" borderTop="1px solid rgba(255,255,255,0.18)" pt={3}>
              <Text fontSize="10px" fontWeight="black" color="rgba(255,255,255,0.72)" textTransform="uppercase" letterSpacing="0.1em">
                Cards | Depth | Line
              </Text>
              <ArrowRight size={22} color={TEAM.secondary} />
            </Flex>
          </Flex>
        </Box>

        <Grid gridColumn="2" gridRow="1" templateRows="84% 16%" minH={0} overflow="hidden" borderLeft="1px solid rgba(75,0,130,0.16)" borderRight="1px solid rgba(75,0,130,0.16)">
          <Box position="relative" minH={0} overflow="hidden">
            <Box position="relative" h="100%" w="100%">
            {visibleSlides.map(({ slide, offset, index }) => (
              <StackCard
                key={`${slide.name}-${offset}`}
                slide={slide}
                active={offset === 0}
                offset={offset}
                onClick={() => setActiveIndex(index)}
              />
            ))}
            </Box>
          </Box>

          <Grid templateColumns="minmax(0, 1fr) auto" borderTop="1px solid rgba(75,0,130,0.16)" minH={0}>
          <Flex align="center" px={3} gap={2.5} minW={0}>
            <Text fontSize="lg" fontWeight="black" color={TEAM.primary} textTransform="uppercase" lineHeight="0.85" lineClamp={1}>
              {featured.label}
            </Text>
            <Box h="20px" w="1px" bg="rgba(75,0,130,0.28)" flexShrink={0} />
            <Flex align="center" gap={2.25} minW={0} overflow="hidden">
              {featured.stats.map((stat) => (
                <StatChip key={stat} value={stat} />
              ))}
            </Flex>
          </Flex>
          <Box pr={3}>
          <CarouselControls
            activeIndex={activeIndex}
            paused={paused}
            onTogglePause={() => setPaused((value) => !value)}
            onSelect={setActiveIndex}
          />
          </Box>
          </Grid>
        </Grid>

        <RosterDnaBlock />
        <ClassStackBlock />

        <Flex display="none" gridColumn="3 / span 2" gridRow="2" borderTop="1px solid rgba(75,0,130,0.16)" align="center" px={4} gap={4} minW={0}>
          <Box flex={1} minW={0}>
            <Text fontSize="8px" fontWeight="black" color={TEAM.primary} textTransform="uppercase" letterSpacing="0.16em">
              Build snapshot
            </Text>
            <Text mt={1} fontSize="sm" fontWeight="black" color={TEAM.primary} textTransform="uppercase" lineClamp={1}>
              {ROSTER_FACTS.total} active | {ROSTER_FACTS.newAdditions} new | {ROSTER_FACTS.transfers} transfers
            </Text>
          </Box>
          <Box w="34%" h="5px" bg="rgba(75,0,130,0.13)" overflow="hidden" flexShrink={0}>
            <Box
              h="100%"
              w="100%"
              bg={TEAM.secondary}
              transformOrigin="left"
              style={{
                animation: paused ? "none" : "rosterFeatureProgress 5s linear infinite",
              }}
              onAnimationIteration={() => {
                if (!paused) setActiveIndex((index) => nextIndex(index));
              }}
            />
          </Box>
        </Flex>
      </Grid>
    </Box>
  );
};
