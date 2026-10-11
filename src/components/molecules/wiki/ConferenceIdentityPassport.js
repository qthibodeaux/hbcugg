import React, { useEffect, useState } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { BadgeCheck, MapPin, Shield, Trophy, Users } from "lucide-react";
import { MEAC, SWAC } from "../../../data/wiki_data";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";

/**
 * ConferenceIdentityPassportCard
 *
 * PHILOSOPHY:
 *   Purpose: Display conference identity, current champion, title leader, and
 *   a small set of conference-defining facts.
 *   Grid slot: 2x1 on SchoolsWikiPage; optional paired 4x1 wrapper.
 *
 * CONTENT TIERS:
 *   Essential: conference key/name/logo, founded year, member count, champion.
 *   Nice-to-have: title leader, bowl wins, HQ/path/format in normal density.
 *   Fluff: watermarks, ghost type, animated title ticker.
 *
 * TYPOGRAPHY SCALING:
 *   Heading: clamp-based masthead wordmark.
 *   Labels: compact uppercase labels with no letter-wrapping.
 *   Rule: compact density abbreviates content before shrinking text.
 *
 * COMPONENT SIZING:
 *   Root uses h="100%" w="100%" and lets PageShell own the slot height.
 *   Internal layout uses minmax(0, 1fr), minW/minH guards, and clamp spacing.
 *   Compact density has a separate JSX hierarchy from normal density.
 *
 * CONTENT REDUCTION:
 *   Compact shows three facts only: founded, programs, bowl wins.
 *   Normal preserves the broader fact dashboard.
 */
const CHAMPIONS = {
  MEAC: { year: "2025", name: "South Carolina State", logo: "/assets/meacscsu.svg" },
  SWAC: { year: "2025", name: "Prairie View A&M", logo: "/assets/swacpvamu.svg" },
};

const CONFERENCE_FACTS = {
  MEAC: {
    programs: "6",
    bowlWins: "6",
    format: "Single Table",
    titlePath: "Regular Season",
    commissioner: "Sonja Stills",
    postseason: "Celebration Bowl",
  },
  SWAC: {
    programs: "12",
    bowlWins: "4",
    format: "East / West",
    titlePath: "Title Game",
    commissioner: "Dr. McClelland",
    postseason: "Celebration Bowl",
  },
};

const CONFERENCES = [SWAC, MEAC];

const COMPACT_FACTS = {
  MEAC: [
    ["Est.", "1969", BadgeCheck],
    ["Programs", "6", Users],
    ["HQ", "Norfolk", MapPin],
    ["Bowl Wins", "6", Trophy],
    ["Commish", "Stills", Shield],
    ["Postseason", "Celebration", Trophy],
  ],
  SWAC: [
    ["Est.", "1920", BadgeCheck],
    ["Programs", "12", Users],
    ["HQ", "B'ham", MapPin],
    ["Bowl Wins", "4", Trophy],
    ["Commish", "McClelland", Shield],
    ["Postseason", "Celebration", Trophy],
  ],
};

const TEAM_ABBREVIATIONS = {
  "Alcorn State": "Alcorn",
  "Grambling State": "GSU",
  Howard: "Howard",
  "Jackson State": "JSU",
  "Morgan State": "MSU",
  "N.C. Central": "NCCU",
  "Prairie View A&M": "PVAMU",
  "S.C. State": "SCSU",
  Southern: "SU",
  "South Carolina State": "SCSU",
};

const compactTeamName = (name) => TEAM_ABBREVIATIONS[name] || name;

const Label = ({ children, color = "text.muted", ...props }) => (
  <Text
    fontSize="9px"
    fontWeight="black"
    color={color}
    textTransform="uppercase"
    letterSpacing="0.16em"
    lineHeight={1.1}
    lineClamp={1}
    {...props}
  >
    {children}
  </Text>
);

const Value = ({ children, size = "md", lineClamp = 1 }) => {
  const sizes = {
    md: { fontSize: "sm", lineHeight: 1.1 },
    lg: { fontSize: "xl", lineHeight: 0.95 },
  };

  return (
    <Text fontWeight="black" color="white" lineClamp={lineClamp} {...sizes[size]}>
      {children}
    </Text>
  );
};

const Watermark = ({ conf, compact = false }) => (
  <Image
    src={conf.logo}
    alt=""
    position="absolute"
    right={compact ? "-2%" : "-5%"}
    top={compact ? "-55%" : "-32%"}
    h={compact ? "210%" : "180%"}
    maxW={compact ? "68%" : "62%"}
    objectFit="contain"
    opacity={compact ? 0.055 : 0.055}
    filter="grayscale(1)"
    pointerEvents="none"
  />
);

const FactCell = ({ label, value, icon: Icon, color, valueSize = "md", valueLines = 1 }) => (
  <Box
    minW={0}
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="8px"
    bg="rgba(255,255,255,0.04)"
    px={2.5}
    py={1.5}
    display="flex"
    alignItems="center"
    gap={2}
    h="100%"
    overflow="hidden"
  >
    <Flex
      w="22px"
      h="22px"
      align="center"
      justify="center"
      flexShrink={0}
      borderRadius="8px"
      bg={`${color}1F`}
      border="1px solid"
      borderColor={`${color}66`}
    >
      <Icon size={12} color={color} />
    </Flex>
    <Box minW={0}>
      <Label>{label}</Label>
      <Value size={valueSize} lineClamp={valueLines}>
        {value}
      </Value>
    </Box>
  </Box>
);

const ChampionBlock = ({ conf, compact = false }) => {
  const champion = CHAMPIONS[conf.key];

  return (
    <Box
      minW={0}
      h="100%"
      border="1px solid"
      borderColor={`${conf.colors.secondary}55`}
      borderRadius="8px"
      bg={`linear-gradient(135deg, ${conf.colors.primary}55 0%, rgba(0,0,0,0.42) 78%)`}
      px={compact ? "clamp(0.55rem, 1.2vw, 0.9rem)" : 3}
      py={compact ? "clamp(0.35rem, 0.8vw, 0.65rem)" : 1.5}
      display="flex"
      alignItems="center"
      gap={compact ? "clamp(0.45rem, 1vw, 0.75rem)" : 2.5}
      overflow="hidden"
    >
      <Image src={champion.logo} alt="" boxSize={compact ? "clamp(1.55rem, 3.1vw, 2.25rem)" : "28px"} objectFit="contain" flexShrink={0} />
      <Box minW={0}>
        <Label color={conf.colors.secondary}>{champion.year} Champion</Label>
        <Text fontSize={compact ? "clamp(0.74rem, 1.5vw, 0.98rem)" : "sm"} color="white" fontWeight="black" lineHeight={1.02} lineClamp={compact ? 2 : 1}>
          {champion.name}
        </Text>
      </Box>
    </Box>
  );
};

const TitleLeaderCell = ({ conf }) => (
  <Box minW={0} border="1px solid" borderColor="whiteAlpha.100" borderRadius="8px" bg="rgba(255,255,255,0.04)" overflow="hidden" h="100%">
    <style>{`
      @keyframes conferencePassportTitleTicker {
        0%, 24% { transform: translateY(0); }
        25%, 49% { transform: translateY(-25%); }
        50%, 74% { transform: translateY(-50%); }
        75%, 100% { transform: translateY(-75%); }
      }
    `}</style>
    <Box h="100%" minH="48px" overflow="hidden">
      <Box style={{ animation: "conferencePassportTitleTicker 12s steps(1, end) infinite" }}>
        {conf.titles.slice(0, 4).map((team) => (
          <Flex key={team.name} h="52px" align="center" gap={2.5} px={3}>
            <Image src={team.logo} alt="" boxSize="28px" objectFit="contain" flexShrink={0} />
            <Box minW={0}>
              <Text fontSize="xs" fontWeight="black" color="white" lineClamp={1}>
                {team.name}
              </Text>
              <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.08em">
                {team.count} titles
              </Text>
            </Box>
          </Flex>
        ))}
      </Box>
    </Box>
  </Box>
);

const EightFieldPassport = ({ conf }) => {
  const facts = CONFERENCE_FACTS[conf.key];

  return (
    <Grid h="100%" templateColumns="repeat(2, minmax(0, 1fr))" templateRows="repeat(4, minmax(0, 1fr))" gap={2} minW={0} minH={0}>
      <FactCell label="Est." value={conf.founded} icon={BadgeCheck} color={conf.colors.secondary} valueSize="lg" />
      <FactCell label="Programs" value={facts.programs} icon={Users} color={conf.colors.secondary} valueSize="lg" />
      <FactCell label="HQ" value={conf.hq} icon={MapPin} color={conf.colors.secondary} />
      <FactCell label="Bowl Wins" value={facts.bowlWins} icon={Trophy} color={conf.colors.secondary} valueSize="lg" />
      <FactCell label="Commissioner" value={facts.commissioner} icon={Shield} color={conf.colors.secondary} />
      <FactCell label="Postseason" value={facts.postseason} icon={Trophy} color={conf.colors.secondary} />
    </Grid>
  );
};

const CompactChampionBlock = ({ conf }) => {
  const champion = CHAMPIONS[conf.key];
  const championName = compactTeamName(champion.name);

  return (
    <Box
      minW={0}
      h="100%"
      border="1px solid"
      borderColor={`${conf.colors.secondary}66`}
      borderRadius="8px"
      bg={`linear-gradient(135deg, ${conf.colors.primary}55 0%, rgba(0,0,0,0.46) 78%)`}
      px="clamp(0.5rem, 1vw, 0.8rem)"
      py="clamp(0.32rem, 0.7vw, 0.55rem)"
      display="flex"
      alignItems="center"
      gap="clamp(0.45rem, 0.9vw, 0.7rem)"
      overflow="hidden"
    >
      <Image src={champion.logo} alt="" boxSize="clamp(1.5rem, 2.8vw, 2.15rem)" objectFit="contain" flexShrink={0} />
      <Box minW={0}>
        <Text fontSize="clamp(0.44rem, 0.85vw, 0.58rem)" color={conf.colors.secondary} fontWeight="black" textTransform="uppercase" letterSpacing="0.1em" lineHeight={1} lineClamp={1}>
          {champion.year} Champion
        </Text>
        <Text mt="1px" fontSize="clamp(0.72rem, 1.35vw, 0.95rem)" color="white" fontWeight="black" lineHeight={1.02} lineClamp={1}>
          {championName}
        </Text>
      </Box>
    </Box>
  );
};

const CompactTitleLeaderCell = ({ conf }) => (
  <Box minW={0} h="100%" border="1px solid" borderColor="whiteAlpha.100" borderRadius="8px" bg="rgba(255,255,255,0.045)" overflow="hidden">
    <style>{`
      @keyframes conferenceCompactTitleTicker {
        0%, 24% { transform: translateY(0); }
        25%, 49% { transform: translateY(-25%); }
        50%, 74% { transform: translateY(-50%); }
        75%, 100% { transform: translateY(-75%); }
      }
    `}</style>
    <Box h="100%" overflow="hidden">
      <Box h="400%" style={{ animation: "conferenceCompactTitleTicker 12s steps(1, end) infinite" }}>
        {conf.titles.slice(0, 4).map((team) => (
          <Flex key={team.name} h="25%" align="center" gap="clamp(0.45rem, 0.9vw, 0.7rem)" px="clamp(0.55rem, 1.1vw, 0.85rem)">
            <Image src={team.logo} alt="" boxSize="clamp(1.45rem, 2.8vw, 2.05rem)" objectFit="contain" flexShrink={0} />
            <Box minW={0}>
              <Text fontSize="clamp(0.68rem, 1.25vw, 0.88rem)" fontWeight="black" color="white" lineHeight={1.05} lineClamp={1}>
                {compactTeamName(team.name)}
              </Text>
              <Text fontSize="clamp(0.48rem, 0.9vw, 0.62rem)" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.08em" lineHeight={1} lineClamp={1}>
                {team.count} titles
              </Text>
            </Box>
          </Flex>
        ))}
      </Box>
    </Box>
  </Box>
);

const CompactInfoCell = ({ label, value, icon: Icon, color }) => (
  <Flex
    minW={0}
    minH={0}
    align="center"
    gap="clamp(0.26rem, 0.55vw, 0.42rem)"
    borderRadius="8px"
    border="1px solid"
    borderColor="whiteAlpha.100"
    bg="rgba(255,255,255,0.045)"
    px="clamp(0.34rem, 0.72vw, 0.55rem)"
    py="clamp(0.2rem, 0.48vw, 0.34rem)"
    overflow="hidden"
  >
    <Flex
      boxSize="clamp(0.95rem, 1.6vw, 1.2rem)"
      align="center"
      justify="center"
      flexShrink={0}
      borderRadius="6px"
      bg={`${color}1F`}
      border="1px solid"
      borderColor={`${color}66`}
    >
      <Icon size={11} color={color} />
    </Flex>
    <Box minW={0} flex="1">
      <Text fontSize="clamp(0.4rem, 0.78vw, 0.52rem)" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.08em" lineHeight={1} lineClamp={1}>
        {label}
      </Text>
      <Text mt="1px" fontSize="clamp(0.62rem, 1.18vw, 0.82rem)" color="white" fontWeight="black" lineHeight={0.98} lineClamp={1}>
        {value}
      </Text>
    </Box>
  </Flex>
);

const CompactWordmark = ({ conf }) => (
  <Box minW={0} minH={0} h="100%" position="relative" overflow="hidden" display="flex" flexDirection="column" justifyContent="center">
    <Text
      maxW="min(100%, 21rem)"
      color={conf.colors.secondary}
      fontSize="clamp(0.55rem, 1vw, 0.68rem)"
      fontWeight="black"
      textTransform="uppercase"
      letterSpacing="0.14em"
      lineHeight={1.05}
      lineClamp={2}
    >
      {conf.name}
    </Text>
    <Text
      mt="clamp(0.24rem, 0.5vw, 0.4rem)"
      fontSize="clamp(1.85rem, 4.65vw, 3.65rem)"
      fontWeight="black"
      color="white"
      textTransform="uppercase"
      letterSpacing="-0.03em"
      lineHeight={0.78}
      lineClamp={1}
      whiteSpace="nowrap"
    >
      {conf.key}
    </Text>
  </Box>
);

// Mobile — a real restructure, not a resized compact card: the compact
// card's 6-fact grid + full wordmark + animated title ticker were all tuned
// for a ~600px 2-col desktop slot, and no amount of clamp()'d shrinking
// makes that legible at phone width. Facts cut to the 4 that matter most
// (HQ/Commissioner dropped), the scrolling title ticker becomes one static
// "Most Titles" line, and everything left gets a real, readable font size.
const FactCellMobile = ({ label, value, icon: Icon, color }) => (
  <Flex
    minW={0}
    align="center"
    gap="0.4rem"
    border="1px solid"
    borderColor="whiteAlpha.100"
    bg="rgba(255,255,255,0.045)"
    px="0.5rem"
    py="0.4rem"
    overflow="hidden"
  >
    <Flex boxSize="1.5rem" align="center" justify="center" flexShrink={0} borderRadius="6px" bg={`${color}1F`} border="1px solid" borderColor={`${color}66`}>
      <Icon size={13} color={color} />
    </Flex>
    <Box minW={0} flex="1">
      <Text fontSize="0.55rem" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.06em" lineHeight={1} lineClamp={1}>
        {label}
      </Text>
      <Text mt="1px" fontSize="1rem" color="white" fontWeight="black" lineHeight={1} lineClamp={1}>
        {value}
      </Text>
    </Box>
  </Flex>
);

const MobilePassportCard = ({ conf }) => {
  const facts = CONFERENCE_FACTS[conf.key];
  const champion = CHAMPIONS[conf.key];
  const titleLeader = conf.titles[0];

  return (
    <Box
      w="100%"
      minW={0}
      overflow="hidden"
      position="relative"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg={`linear-gradient(105deg, ${conf.colors.primary}38 0%, rgba(11,11,13,0.98) 48%, rgba(8,8,10,1) 100%)`}
      boxShadow={`inset 0 -3px 0 ${conf.colors.secondary}`}
      p="0.85rem"
    >
      <Watermark conf={conf} compact />

      <Flex direction="column" position="relative" zIndex={1} gap="0.55rem">
        <Flex align="center" justify="space-between" gap="0.5rem">
          <Box minW={0}>
            <Text fontSize="0.65rem" color={conf.colors.secondary} fontWeight="black" textTransform="uppercase" letterSpacing="0.08em" lineClamp={1}>
              {conf.name}
            </Text>
            <Text fontSize="2.4rem" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="-0.02em" lineHeight={0.85}>
              {conf.key}
            </Text>
          </Box>
          <Image src={conf.logo} alt="" boxSize="2.5rem" objectFit="contain" flexShrink={0} />
        </Flex>

        <Grid templateColumns="repeat(2, minmax(0, 1fr))" templateRows="repeat(2, minmax(0, 1fr))" gap="0.4rem">
          <FactCellMobile label="Est." value={conf.founded} icon={BadgeCheck} color={conf.colors.secondary} />
          <FactCellMobile label="Programs" value={facts.programs} icon={Users} color={conf.colors.secondary} />
          <FactCellMobile label="Bowl Wins" value={facts.bowlWins} icon={Trophy} color={conf.colors.secondary} />
          <FactCellMobile label="Postseason" value={facts.postseason} icon={Trophy} color={conf.colors.secondary} />
        </Grid>

        <Box border="1px solid" borderColor="whiteAlpha.100" bg="rgba(255,255,255,0.04)" px="0.65rem" py="0.4rem">
          <Text fontSize="0.55rem" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.08em" lineClamp={1}>
            Most Titles
          </Text>
          <Text fontSize="1rem" fontWeight="black" color="white" lineClamp={1}>
            {compactTeamName(titleLeader.name)} · {titleLeader.count}
          </Text>
        </Box>

        <Flex
          align="center"
          gap="0.65rem"
          border="1px solid"
          borderColor={`${conf.colors.secondary}66`}
          bg={`linear-gradient(135deg, ${conf.colors.primary}55 0%, rgba(0,0,0,0.46) 78%)`}
          px="0.75rem"
          py="0.55rem"
        >
          <Image src={champion.logo} alt="" boxSize="2.25rem" objectFit="contain" flexShrink={0} />
          <Box minW={0} flex="1">
            <Text fontSize="0.6rem" color={conf.colors.secondary} fontWeight="black" textTransform="uppercase" letterSpacing="0.08em" lineHeight={1}>
              {champion.year} Champion
            </Text>
            <Text fontSize="1.2rem" color="white" fontWeight="black" lineHeight={1.05} lineClamp={1}>
              {compactTeamName(champion.name)}
            </Text>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

const CAROUSEL_CONFS = [SWAC, MEAC];
const AUTO_ADVANCE_MS = 5000;
const FLIP_MS = 700;

// One card, two faces — turns like a passport page instead of stacking SWAC
// and MEAC as two separate cards. Front/back faces sit on top of each other
// (back absolutely positioned, pre-rotated 180deg with backface-visibility
// hidden) and the shared wrapper's rotateY does the flip; auto-advances
// every 5s, and the effect is keyed on activeIndex so any manual toggle tap
// restarts that 5s window instead of fighting the next auto-flip.
export const ConferencePassportCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveIndex((index) => (index + 1) % CAROUSEL_CONFS.length);
    }, AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  return (
    <Box>
      <Flex gap="0.4rem" mb="0.5rem">
        {CAROUSEL_CONFS.map((conf, index) => {
          const isActive = index === activeIndex;
          return (
            <Box
              key={conf.key}
              as="button"
              type="button"
              onClick={() => setActiveIndex(index)}
              flex="1"
              py="0.4rem"
              border="1px solid"
              borderColor={isActive ? conf.colors.secondary : "whiteAlpha.150"}
              bg={isActive ? `${conf.colors.secondary}22` : "transparent"}
            >
              <Text fontSize="0.7rem" fontWeight="black" color={isActive ? "white" : "whiteAlpha.500"} textTransform="uppercase" letterSpacing="0.06em" textAlign="center">
                {conf.key}
              </Text>
            </Box>
          );
        })}
      </Flex>

      <Box style={{ perspective: "1400px" }}>
        <Box
          position="relative"
          style={{
            transformStyle: "preserve-3d",
            transition: `transform ${FLIP_MS}ms cubic-bezier(0.4, 0.2, 0.2, 1)`,
            transform: activeIndex === 1 ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <Box style={{ backfaceVisibility: "hidden" }}>
            <MobilePassportCard conf={CAROUSEL_CONFS[0]} />
          </Box>
          <Box position="absolute" inset={0} style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <MobilePassportCard conf={CAROUSEL_CONFS[1]} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const CompactPassportCard = ({ conf }) => {
  const compactFacts = COMPACT_FACTS[conf.key];

  return (
    <Box
      h="100%"
      w="100%"
      minW={0}
      overflow="hidden"
      position="relative"
      borderRadius="8px"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg={`linear-gradient(105deg, ${conf.colors.primary}38 0%, rgba(11,11,13,0.98) 48%, rgba(8,8,10,1) 100%)`}
      boxShadow={`inset 0 -3px 0 ${conf.colors.secondary}`}
      p={{ base: 3, lg: 4 }}
    >
      <Watermark conf={conf} compact />
      <Text
        position="absolute"
        right="-2%"
        top="-16%"
        fontSize="clamp(5rem, 11vw, 8.5rem)"
        color="white"
        opacity={0.035}
        fontWeight="black"
        lineHeight={0.8}
        letterSpacing="-0.08em"
        pointerEvents="none"
      >
        {conf.key}
      </Text>

      <Grid h="100%" position="relative" zIndex={1} templateRows="4fr 1fr" gap="clamp(0.5rem, 1.05vw, 0.8rem)" minH={0}>
        <Grid templateColumns="2fr 3fr" gap="clamp(0.6rem, 1.2vw, 0.95rem)" minH={0}>
          <CompactWordmark conf={conf} />
          <Grid templateColumns="repeat(2, minmax(0, 1fr))" templateRows="repeat(3, minmax(0, 1fr))" gap="clamp(0.26rem, 0.55vw, 0.42rem)" minH={0}>
            {compactFacts.map(([label, value, Icon]) => (
              <CompactInfoCell key={label} label={label} value={value} icon={Icon} color={conf.colors.secondary} />
            ))}
          </Grid>
        </Grid>

        <Grid templateColumns="minmax(0, 1fr) minmax(0, 0.92fr)" gap="clamp(0.55rem, 1.2vw, 0.85rem)" minH={0}>
          <CompactTitleLeaderCell conf={conf} />
          <CompactChampionBlock conf={conf} />
        </Grid>
      </Grid>
    </Box>
  );
};

const NormalPassportCard = ({ conf }) => (
  <Box
    minW={0}
    h="100%"
    w="100%"
    position="relative"
    overflow="hidden"
    p={4}
    borderRadius="8px"
    bg={`linear-gradient(135deg, ${conf.colors.primary}33 0%, rgba(255,255,255,0.035) 58%, rgba(0,0,0,0.18) 100%)`}
    border="1px solid"
    borderColor="whiteAlpha.100"
  >
    <Watermark conf={conf} />
    <Grid h="100%" templateRows="minmax(0, 1fr) 52px" gap={2.5} minH={0}>
      <Grid templateColumns={{ base: "1fr", lg: "3fr 2fr" }} gap={3} minH={0} alignItems="stretch">
        <Box minW={0} h="100%" position="relative" zIndex={2} display="flex" flexDirection="column" justifyContent="center">
          <Label color={conf.colors.secondary}>{conf.name}</Label>
          <Flex align="center" gap={3} mt={1}>
            <Text fontSize="clamp(3rem, 6vw, 5.35rem)" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0" lineHeight={0.78}>
              {conf.key}
            </Text>
            <Image src={conf.logo} alt={`${conf.key} logo`} h="42px" maxW="98px" objectFit="contain" filter="drop-shadow(0 8px 18px rgba(0,0,0,0.55))" />
          </Flex>
          <Text mt={2} fontSize="10px" color={conf.colors.secondary} fontWeight="black" fontStyle="italic" textTransform="uppercase" letterSpacing="0" lineClamp={2} maxW="300px">
            "{conf.slogan}"
          </Text>
        </Box>
        <EightFieldPassport conf={conf} />
      </Grid>
      <Grid templateColumns="minmax(0, 1fr) minmax(0, 0.92fr)" gap={3} minH={0}>
        <TitleLeaderCell conf={conf} />
        <ChampionBlock conf={conf} />
      </Grid>
    </Grid>
  </Box>
);

export const ConferenceIdentityPassportCard = ({ conf, density = "normal" }) => {
  const { isMobile } = useLayoutDensity();
  if (isMobile) return <MobilePassportCard conf={conf} />;
  if (density === "compact") return <CompactPassportCard conf={conf} />;
  return <NormalPassportCard conf={conf} />;
};

export const ConferenceIdentityPassport = ({ density = "normal" }) => (
  <Box
    h="100%"
    w="100%"
    overflow="hidden"
    position="relative"
    borderRadius="8px"
    border="1px solid"
    borderColor="whiteAlpha.100"
    bg="linear-gradient(90deg, rgba(111,38,51,0.18) 0%, rgba(11,11,13,0.99) 50%, rgba(75,0,130,0.18) 100%)"
    boxShadow="inset 0 -3px 0 #FFD100"
  >
    <Grid h="100%" templateColumns={{ base: "1fr", xl: "repeat(2, minmax(0, 1fr))" }} gap={3} p={3}>
      {CONFERENCES.map((conf) => (
        <ConferenceIdentityPassportCard key={conf.key} conf={conf} density={density} />
      ))}
    </Grid>
  </Box>
);

export default ConferenceIdentityPassport;
