import React, { Fragment, useMemo, useState, useCallback, useRef } from "react";
import { Box, Flex, Grid, Image, SimpleGrid, Text, Circle, Badge } from "@chakra-ui/react";
import {
  BookOpen,
  MapPin,
  Radio,
  Route,
  Trophy,
  Users,
  History,
  Map,
  Music,
  Globe,
  Tv,
  Star,
  Award,
  User,
  Quote,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useMountEffect from "../../../hooks/useMountEffect";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import teamsData from "../../../data/teams.json";
import PageShell from "../../layouts/PageShell";
import { BannerGhostWord, BannerTitleArea, BannerControlStrip } from "../BannerControls";
import { MobileSectionSwitcher } from "../MobileSectionSwitcher";
import { 
  SWAC, 
  MEAC, 
  RIVALRIES, 
  CELEBRATION_LEDGER_GAMES,
  POSTSEASON_DATA,
  COMPARISON_IMAGE,
  SYSTEM_COMPARISON_ROWS,
  CELEBRATION_TEAM_COLORS
} from "../../../data/wiki_data";

const CELEBRATION_RESULTS = POSTSEASON_DATA.celebrationBowl.history.map(game => [
  game.year.toString(),
  game.winner.id.startsWith('swac') ? "SWAC" : "MEAC",
  `${game.winner.name} over ${game.loser.name}`
]);

const TEAMS = [...teamsData.teams].sort((a, b) => a.name.localeCompare(b.name));
const TEAM_BY_ID = Object.fromEntries(TEAMS.map((team) => [team.id, team]));

// --- WikiDirectoryComponent (Expanded with Conditional Compact Mode) ---
const FRAMES = ["abbrev", "fullName", "logo", "player", "logoBig"];
const COMPACT_FRAMES = ["abbrev", "logo", "logoBig"]; // Fewer frames for compact mode

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

const WikiDirectoryComponent = ({ variant = "standard" }) => {
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

// --- Constants and UI Components (OMITTED for brevity in summary, unchanged from previous) ---
// [All Wiki Page Content Remains Exactly The Same]



const getTeamLabel = (team) => team?.bannerShort ?? team?.shortName ?? team?.name ?? "TBD";
const resolveRivalryTeams = (rivalry) => ({
  ...rivalry,
  a: TEAM_BY_ID[rivalry.teamA],
  b: TEAM_BY_ID[rivalry.teamB],
});

const TITLE_PATH_BUCKETS = [
  {
    id: "foundations",
    range: "1920-1971",
    title: "Foundations",
    tone: "#A855F7",
    events: [
      { year: "1920", label: "SWAC Founded", detail: "Houston meeting creates the Southwestern Athletic Conference." },
      { year: "1970", label: "MEAC Confirmed", detail: "East Coast HBCU institutions organize the MEAC." },
      { year: "1971", label: "Morgan State", detail: "First MEAC football season ends with Morgan State as champion." },
    ],
  },
  {
    id: "pelican",
    range: "1972-1975",
    title: "Pelican Bowl",
    tone: "#FDB913",
    events: [
      { year: "1972", label: "First Pelican Bowl", detail: "Grambling defeats North Carolina Central, 56-6." },
      { year: "1974", label: "High-Water Mark", detail: "Grambling beats South Carolina State before 30,120 fans." },
      { year: "1975", label: "Final Pelican", detail: "Southern edges South Carolina State in the Superdome." },
    ],
  },
  {
    id: "bridge",
    range: "1976-1979",
    title: "Bridge Years",
    tone: "#007A5E",
    events: [
      { year: "1976-80", label: "Gold Bowl Era", detail: "MEAC champion meets the CIAA champion in Richmond." },
      { year: "1978", label: "MEAC Division I", detail: "The MEAC reaches NCAA Division I classification." },
      { year: "1979", label: "MEAC Expands", detail: "Bethune-Cookman and Florida A&M are voted into the MEAC." },
    ],
  },
  {
    id: "heritage",
    range: "1991-1999",
    title: "Heritage Bowl",
    tone: "#8A1538",
    events: [
      { year: "1991", label: "Heritage Begins", detail: "The SWAC vs MEAC postseason concept returns." },
      { year: "1994", label: "True Champions", detail: "SCSU beats Grambling in the top-seed Heritage Bowl matchup." },
      { year: "1999", label: "Heritage Ends", detail: "The Heritage Bowl closes after uneven champion participation." },
    ],
  },
  {
    id: "showcase",
    range: "1999-2015",
    title: "Modern Showcase",
    tone: "#4A90D9",
    events: [
      { year: "1999", label: "SWAC Title Game", detail: "Southern defeats Jackson State, 31-30, at Legion Field." },
      { year: "2005", label: "MEAC/SWAC Challenge", detail: "The conferences gain a regular-season showcase window." },
      { year: "2015", label: "Celebration Era", detail: "SWAC and MEAC champions commit to the Atlanta title stage." },
    ],
  },
  {
    id: "modern-map",
    range: "2020-2021",
    title: "Modern Map",
    tone: "#FFFFFF",
    events: [
      { year: "2020", label: "Realignment Set", detail: "FAMU and BCU are added to the SWAC East; Alcorn moves West." },
      { year: "2021", label: "Florida Joins", detail: "Florida A&M and Bethune-Cookman officially enter the SWAC." },
      { year: "2021", label: "MEAC Resets", detail: "The MEAC football map resets around a smaller core." },
    ],
  },
];

const LEGACY_STATS = [
  ["18", "Programs"],
  ["2", "Conferences"],
  ["10", "Bowl Games"],
  ["150+", "Years"],
  ["1000+", "NFL alumni lineage"],
  ["47 of 48", "SWAC FCS attendance-leading seasons"],
];

const MEMBERSHIP = {
  swacEast: ["Alabama A&M", "Alabama State", "Bethune-Cookman", "Florida A&M", "Jackson State", "Mississippi Valley State"],
  swacWest: ["Alcorn State", "Grambling State", "Prairie View A&M", "Southern", "Texas Southern", "Arkansas-Pine Bluff"],
  meacFootball: ["Delaware State", "Howard", "Morgan State", "North Carolina Central", "Norfolk State", "South Carolina State"],
  meacNonFootball: ["Coppin State", "Maryland Eastern Shore"],
  formerContext: ["Florida A&M", "Bethune-Cookman", "North Carolina A&T", "Hampton"],
};

const SHARED_TIMELINE = [
  ["1890s", "HBCU football origins and first intercollegiate games."],
  ["1970s", "FCS landscape solidifies with MEAC founding."],
  ["2005", "MEAC/SWAC Challenge launches the season."],
  ["2015", "Celebration Bowl creates the unified title stage."],
  ["2020s", "National TV windows and HBCU GO expansion."],
  ["Modern", "18 programs defining the FCS HBCU universe."],
];

const PathDiagram = ({ path, color }) => (
  <Flex align="center" gap={2} mt={3} bg="rgba(0,0,0,0.3)" p={3} borderRadius="6px" border="1px dashed" borderColor="whiteAlpha.200">
    {path.split("->").map((step, i, arr) => (
      <Fragment key={step}>
        <Box>
          <Text fontSize="10px" fontWeight="black" color="white" textTransform="uppercase">
            {step.trim()}
          </Text>
        </Box>
        {i < arr.length - 1 && (
          <Route size={12} color={color} style={{ opacity: 0.5 }} />
        )}
      </Fragment>
    ))}
  </Flex>
);

const Card = ({ children, accent = "#A855F7", bg, ...props }) => (
  <Box
    h="full"
    w="full"
    minW={0}
    overflow="hidden"
    borderRadius="8px"
    border="1px solid"
    borderColor="whiteAlpha.100"
    bg={bg ?? "rgba(20,20,22,0.96)"}
    position="relative"
    _before={{
      content: '""',
      position: "absolute",
      insetInlineStart: 0,
      top: 0,
      bottom: 0,
      width: "3px",
      bg: accent,
      opacity: 0.9,
    }}
    {...props}
  >
    {children}
  </Box>
);

const Eyebrow = ({ children, color = "brand.500" }) => (
  <Text fontSize="8px" color={color} fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
    {children}
  </Text>
);

const Title = ({ children, size = "xl" }) => (
  <Text 
    fontSize={size} 
    color="white" 
    fontWeight="black" 
    lineHeight={0.8} 
    textTransform="uppercase"
    letterSpacing="-0.04em"
  >
    {children}
  </Text>
);

const Stat = ({ label, value, color = "white", ...props }) => (
  <Box minW={0} {...props}>
    <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em" lineClamp={1} mb={0.5}>
      {label}
    </Text>
    <Text fontSize="md" color={color} fontWeight="black" lineHeight={1.1}>
      {value}
    </Text>
  </Box>
);

const Chip = ({ children, color = "whiteAlpha.300", ...props }) => (
  <Box
    px={2}
    py={1}
    borderRadius="999px"
    border="1px solid"
    borderColor={color}
    bg="rgba(255,255,255,0.04)"
    minW={0}
    {...props}
  >
    <Text fontSize="9px" color="text.secondary" fontWeight="bold" lineClamp={1}>
      {children}
    </Text>
  </Box>
);

const ConferenceWikiBannerStandard = () => (
  <Card
    accent="#FFD100"
    bg="linear-gradient(100deg, rgba(111,38,51,0.7) 0%, rgba(11,11,13,0.96) 38%, rgba(75,0,130,0.72) 100%)"
  >
    <Box position="absolute" inset={0} pointerEvents="none">
      <Text position="absolute" left="2%" bottom="-28px" fontSize="130px" fontWeight="black" color="white" opacity={0.04}>
        SWAC
      </Text>
      <Text position="absolute" right="2%" top="-34px" fontSize="130px" fontWeight="black" color="white" opacity={0.04}>
        MEAC
      </Text>
    </Box>
    <Flex h="100%" align="center" justify="space-between" gap={8} px={{ base: 5, lg: 9 }} position="relative">
      <Box flex={1}>
        <Text
          fontSize="clamp(2.3rem, 4.5vw, 4.8rem)"
          color="white"
          fontWeight="black"
          fontStyle="italic"
          lineHeight={0.8}
          textTransform="uppercase"
        >
          Conference Wiki
        </Text>
        <Text mt={2} maxW="720px" fontSize="xs" color="text.secondary" lineHeight={1.4} lineClamp={2}>
          Two conferences, eighteen programs, one football culture: the rivalries, title roads,
          classics, and stages that define the HBCU game.
        </Text>
      </Box>
      <SimpleGrid columns={4} gap={3} w={{ base: "auto", lg: "480px" }}>
        {LEGACY_STATS.slice(0, 4).map(([value, label]) => (
          <Box key={label} border="1px solid" borderColor="whiteAlpha.100" bg="rgba(0,0,0,0.25)" borderRadius="8px" p={2}>
            <Text fontSize="xl" color="white" fontWeight="black" lineHeight={1}>
              {value}
            </Text>
            <Text mt={0.5} fontSize="7px" color="text.muted" fontWeight="bold" textTransform="uppercase" letterSpacing="0.06em" lineClamp={1} whiteSpace="nowrap" wordBreak="keep-all">
              {label}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Flex>
  </Card>
);

const COMPACT_LEGACY_STATS = [
  ["18", "Programs"],
  ["2", "Conferences"],
  ["10", "Bowl Games"],
  ["150+", "Years"],
];

// Desktop — migrated onto the current banner standard: title tier on top,
// opaque bottom strip below. No real controls exist on this banner, so the
// bottom tier holds the 4 stat pills instead (same info-strip treatment the
// mobile version already uses) rather than sitting empty. Descriptive
// paragraph dropped — the pills already say what this hub covers.
const ConferenceWikiBannerCompact = () => (
  <Box
    position="relative"
    overflow="hidden"
    borderRadius="2xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    h="full"
    w="full"
    bg={WIKI_GRADIENT}
    display="flex"
    flexDirection="column"
  >
    <Box position="absolute" inset={0} pointerEvents="none">
      <Text
        position="absolute"
        left="14%"
        bottom="-18px"
        fontSize="clamp(4.8rem, 14vw, 9rem)"
        fontWeight="black"
        color="white"
        opacity={0.035}
        lineHeight={0.78}
        letterSpacing="-0.08em"
      >
        SWAC
      </Text>
      <Text
        position="absolute"
        right="2%"
        top="-28px"
        fontSize="clamp(4.8rem, 14vw, 9rem)"
        fontWeight="black"
        color="white"
        opacity={0.06}
        lineHeight={0.78}
        letterSpacing="-0.08em"
      >
        MEAC
      </Text>
    </Box>

    <BannerTitleArea>
      <Box position="relative" zIndex={1}>
        <Text fontSize="clamp(2.6rem, 7vw, 7.5rem)" color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.85} letterSpacing="-0.04em" whiteSpace="nowrap">
          Conference Wiki
        </Text>
      </Box>
    </BannerTitleArea>

    <BannerControlStrip justify="flex-start">
      {COMPACT_LEGACY_STATS.map(([value, label]) => (
        <Box
          key={label}
          bg="whiteAlpha.100"
          border="1px solid"
          borderColor="whiteAlpha.200"
          borderRadius="md"
          px="0.75rem"
          py="0.4rem"
        >
          <Text fontSize="md" fontWeight="black" color="white" lineHeight={1}>
            {value}
          </Text>
          <Text fontSize="9px" fontWeight="bold" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.06em" mt="0.1rem" whiteSpace="nowrap">
            {label}
          </Text>
        </Box>
      ))}
    </BannerControlStrip>
  </Box>
);

const WIKI_ACCENT = "#FFD100";
const WIKI_GRADIENT = "linear-gradient(100deg, rgba(111,38,51,0.78) 0%, rgba(9,9,11,0.98) 45%, rgba(75,0,130,0.86) 100%)";

// Mobile — no controls exist on this banner, so tier 2 becomes an info strip
// (the same 4 legacy stats the desktop/compact variants carry) instead of a
// control strip; the descriptive paragraph is dropped entirely rather than
// squeezed, and MobileSectionSwitcher is added since /schools/wiki is part
// of the same "Schools" hub as every other Schools-family mobile banner.
const MOBILE_WIKI_STATS = [
  ["18", "Programs"],
  ["2", "Conf"],
  ["10", "Bowls"],
  ["150+", "Years"],
];

const MobileConferenceWikiBanner = () => (
  <Box position="relative" overflow="hidden" h="full" w="full" display="flex" flexDirection="column">
    <Box
      position="relative"
      overflow="hidden"
      h="var(--app-header-height)"
      flexShrink={0}
      bg={WIKI_GRADIENT}
      display="flex"
      flexDirection="column"
    >
      <BannerTitleArea>
        <BannerGhostWord text="WIKI" />
        <Box position="relative" zIndex={1}>
          <Text fontSize="clamp(2.6rem, 7vw, 7.5rem)" color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.85} letterSpacing="-0.04em" whiteSpace="nowrap">
            Conference Wiki
          </Text>
        </Box>
      </BannerTitleArea>
    </Box>

    <MobileSectionSwitcher accent={WIKI_ACCENT} />

    <Flex align="stretch" borderTop="1px solid" borderColor="whiteAlpha.100">
      {MOBILE_WIKI_STATS.map(([value, label], index) => (
        <Flex
          key={label}
          direction="column"
          align="center"
          justify="center"
          flex="1"
          py="0.5rem"
          borderLeft={index === 0 ? "none" : "1px solid"}
          borderColor="whiteAlpha.100"
        >
          <Text fontSize="1.1rem" fontWeight="black" color="white" lineHeight={1}>
            {value}
          </Text>
          <Text fontSize="0.55rem" fontWeight="black" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.06em" mt="0.15rem" lineClamp={1}>
            {label}
          </Text>
        </Flex>
      ))}
    </Flex>
  </Box>
);

export const ConferenceWikiBanner = ({ variant = "standard" }) => {
  const { isMobile } = useLayoutDensity();
  if (isMobile) return <MobileConferenceWikiBanner />;
  if (variant === "compact") return <ConferenceWikiBannerCompact />;
  return <ConferenceWikiBannerStandard />;
};

const TitleCarousel = ({ titles, color }) => {
  const [index, setIndex] = useState(0);

  useMountEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % titles.length);
    }, 3000);
    return () => clearInterval(interval);
  });

  const current = titles[index];

  return (
    <Box bg="rgba(0,0,0,0.3)" p={2.5} borderRadius="lg" border="1px solid" borderColor="whiteAlpha.100">
      <Text fontSize="8px" fontWeight="black" color="text.muted" textTransform="uppercase" mb={2} letterSpacing="0.1em">Historical Power</Text>
      <Flex align="center" gap={3}>
        <Box position="relative">
          <Circle size="32px" bg="whiteAlpha.100" />
          <Image 
            src={current.logo} 
            boxSize="22px" 
            position="absolute" 
            top="50%" 
            left="50%" 
            transform="translate(-50%, -50%)" 
            objectFit="contain" 
          />
        </Box>
        <Box>
          <Text fontSize="11px" fontWeight="black" color="white" lineClamp={1}>{current.name}</Text>
          <Text fontSize="9px" fontWeight="black" color={color}>{current.count} Conference Titles</Text>
        </Box>
      </Flex>
    </Box>
  );
};

const ConferencePanel = ({ conf }) => {
  const isSWAC = conf.key === "SWAC";
  
  return (
    <Card
      accent={conf.colors.primary}
      bg={`linear-gradient(135deg, ${conf.colors.primary}44 0%, rgba(20,20,22,1) 48%, rgba(11,11,13,1) 100%)`}
      position="relative"
      overflow="hidden"
    >
      <Image
        src={conf.logo}
        alt=""
        position="absolute"
        right="-2%"
        top="-5%"
        boxSize="340px"
        opacity={0.07}
        filter="grayscale(1) brightness(1.5)"
        pointerEvents="none"
        zIndex={0}
      />

      <Box h="100%" p={5} position="relative" zIndex={1} display="flex" flexDirection="column">
        {/* TOP ROW: HERO BRANDING */}
        <Flex justify="space-between" align="flex-start" mb={6}>
          <Box>
            <Eyebrow color={conf.colors.secondary}>{conf.name}</Eyebrow>
            <Flex align="center" gap={4} mt={1}>
              <Title size="6xl" lineHeight={1}>{conf.key}</Title>
              <Image src={conf.logo} boxSize="48px" objectFit="contain" />
            </Flex>
            <Text fontSize="11px" fontStyle="italic" color={conf.colors.secondary} fontWeight="black" mt={2} textTransform="uppercase" letterSpacing="0.05em">
              "{conf.slogan}"
            </Text>
          </Box>
          
          <SimpleGrid columns={2} spacing={10}>
            <Stat label="Programs" value={conf.members.split(" ")[0]} color={conf.colors.secondary} size="xl" />
            <Stat label="Bowl Wins" value={conf.celebrationRecord.split(" ")[0]} color={conf.colors.secondary} size="xl" />
          </SimpleGrid>
        </Flex>

        {/* MIDDLE SECTION: THE CORE CONTENT BENTO */}
        <SimpleGrid columns={3} spacing={6} flex={1}>
          {/* Identity & Mission */}
          <Box gridColumn="span 2">
            <Box bg="whiteAlpha.50" p={5} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" backdropFilter="blur(12px)" h="full">
              <Text fontSize="sm" fontWeight="black" color="brand.400" textTransform="uppercase" mb={2} letterSpacing="0.1em">Identity Profile</Text>
              <Text fontSize="md" fontWeight="bold" color="text.primary" lineHeight={1.6}>
                {conf.identity}
              </Text>
              <Text fontSize="sm" color="text.secondary" mt={3} fontStyle="italic">
                {conf.gameStyle}
              </Text>
            </Box>
          </Box>

          {/* Governance & HQ */}
          <Box>
            <Box bg="rgba(0,0,0,0.4)" p={5} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" h="full">
              <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" mb={4}>Administration</Text>
              <Stat label="Commissioner" value={conf.commissioner} size="sm" mb={4} />
              <Stat label="Structure" value={isSWAC ? "Divisional" : "Single Table"} size="sm" mb={4} />
              <Box pt={4} borderTop="1px solid" borderColor="whiteAlpha.100">
                <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" mb={1}>HQ Location</Text>
                <Text fontSize="sm" fontWeight="black" color="white">{conf.hq}</Text>
              </Box>
            </Box>
          </Box>

          {/* Footprint: States */}
          <Box>
            <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" mb={3} letterSpacing="0.1em">Member States</Text>
            <Flex gap={2} flexWrap="wrap">
              {conf.states.map((state) => (
                <Chip key={state} color="white" bg={`${conf.colors.primary}aa`} border="1px solid" borderColor="whiteAlpha.200" px={3} py={1.5} fontSize="10px">
                  {state}
                </Chip>
              ))}
            </Flex>
          </Box>

          {/* Footprint: Market Hubs */}
          <Box gridColumn="span 2">
            <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" mb={3} letterSpacing="0.1em">Key Market Hubs (Strategic Centers)</Text>
            <SimpleGrid columns={4} spacing={2}>
              {conf.cities.map((city) => (
                <Box key={city} bg="whiteAlpha.50" px={3} py={2} borderRadius="md" border="1px solid" borderColor="whiteAlpha.100">
                  <Text fontSize="10px" color="white" fontWeight="black" textAlign="center">{city}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        </SimpleGrid>

        {/* BOTTOM ROW: RECOGNITION */}
        <Flex gap={4} mt={8} align="flex-end">
          <Box flex={1.2}>
            <TitleCarousel titles={conf.titles} color={conf.colors.secondary} />
          </Box>
          
          <Box flex={1}>
            <Box bg="rgba(0,0,0,0.6)" p={3.5} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" position="relative">
              <Trophy size={16} style={{ position: 'absolute', top: 12, right: 12, opacity: 0.3 }} color={conf.colors.secondary} />
              <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" mb={2}>Reigning Champion</Text>
              <Flex align="center" gap={3}>
                <Image src={conf.recentChamp.logo} boxSize="28px" objectFit="contain" />
                <Box>
                  <Text fontSize="11px" fontWeight="black" color="white">{conf.recentChamp.year} Champion</Text>
                  <Text fontSize="14px" fontWeight="black" color={conf.colors.secondary}>{conf.recentChamp.name}</Text>
                </Box>
              </Flex>
            </Box>
          </Box>

          <Box w="120px" bg="whiteAlpha.50" p={3.5} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" textAlign="center">
            <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" mb={1}>Est.</Text>
            <Text fontSize="2xl" fontWeight="black" color="white" lineHeight={1}>{conf.founded}</Text>
          </Box>
        </Flex>
      </Box>
    </Card>
  );
};

const ComparisonMatrix = ({ variant = "standard" }) => {
  if (variant === "compact") {
    return <ComparisonMatrixCompact />;
  }

  return <ComparisonMatrixStandard />;
};

const ComparisonMatrixStandard = () => (
  <Card
    accent="#FFD100"
    bg="linear-gradient(90deg, rgba(4,5,7,0.98) 0%, rgba(11,11,13,0.98) 44%, rgba(20,20,22,0.96) 100%)"
  >
    <Grid h="100%" templateColumns={{ base: "0.9fr 2.2fr", xl: "0.8fr 2.35fr" }} overflow="hidden">
      <Box position="relative" overflow="hidden" minW={0}>
        <Image
          src={COMPARISON_IMAGE}
          alt=""
          w="100%"
          h="100%"
          objectFit="cover"
          filter="grayscale(1) contrast(1.15)"
          opacity={0.58}
        />
        <Box position="absolute" inset={0} bg="linear-gradient(90deg, rgba(0,0,0,0.2), rgba(11,11,13,0.96))" />
        <Box position="absolute" inset={0} bg="linear-gradient(0deg, rgba(111,38,51,0.32), rgba(75,0,130,0.18))" />
        <Text
          position="absolute"
          left="-16px"
          bottom="-10px"
          fontSize="clamp(2.6rem, 6vw, 5.6rem)"
          fontWeight="black"
          color="white"
          opacity={0.08}
          lineHeight={0.8}
          letterSpacing="-0.06em"
        >
          HBCU
        </Text>
      </Box>

      <Box p={{ base: 3, xl: 4 }} minW={0} h="100%" display="flex" flexDirection="column">
        <Flex align="start" justify="space-between" gap={4} mb={2}>
          <Box minW={0}>
            <Title size="xl">Same Fields, Different Systems</Title>
          </Box>
          <BookOpen size={20} color="#A1A1AA" />
        </Flex>

        <Grid
          templateColumns="0.8fr 1.2fr 1.2fr"
          gap={0}
          flex={1}
          minH={0}
          borderTop="1px solid"
          borderColor="whiteAlpha.100"
        >
          <HeaderCell>Field</HeaderCell>
          <HeaderCell color={SWAC.colors.primary}>SWAC</HeaderCell>
          <HeaderCell color={MEAC.colors.secondary}>MEAC</HeaderCell>
          {SYSTEM_COMPARISON_ROWS.map(([field, swac, meac]) => (
            <Fragment key={field}>
              <MatrixCell muted>{field}</MatrixCell>
              <MatrixCell>{swac}</MatrixCell>
              <MatrixCell>{meac}</MatrixCell>
            </Fragment>
          ))}
        </Grid>
      </Box>
    </Grid>
  </Card>
);

const ComparisonMatrixCompact = () => (
  <Card
    accent="#FFD100"
    bg="linear-gradient(90deg, rgba(4,5,7,0.98) 0%, rgba(11,11,13,0.98) 44%, rgba(20,20,22,0.96) 100%)"
  >
    <Grid h="100%" templateColumns="0.85fr 2.4fr" overflow="hidden">
      <Box position="relative" overflow="hidden" minW={0}>
        <Image
          src={COMPARISON_IMAGE}
          alt=""
          w="100%"
          h="100%"
          objectFit="cover"
          filter="grayscale(1) contrast(1.15)"
          opacity={0.5}
        />
        <Box position="absolute" inset={0} bg="linear-gradient(90deg, rgba(0,0,0,0.18), rgba(11,11,13,0.96))" />
        <Box position="absolute" inset={0} bg="linear-gradient(0deg, rgba(111,38,51,0.34), rgba(75,0,130,0.18))" />
        <Text
          position="absolute"
          left="-14px"
          bottom="-8px"
          fontSize="clamp(2.2rem, 5vw, 4.4rem)"
          fontWeight="black"
          color="white"
          opacity={0.075}
          lineHeight={0.8}
          letterSpacing="-0.06em"
        >
          HBCU
        </Text>
      </Box>

      <Box p={{ base: 2, xl: 3 }} minW={0} h="100%" display="flex" flexDirection="column">
        <Flex align="start" justify="space-between" gap={3} mb={1.5} flexShrink={0}>
          <Text
            fontSize="clamp(1.15rem, 2vw, 1.75rem)"
            color="white"
            fontWeight="black"
            lineHeight={0.84}
            textTransform="uppercase"
            letterSpacing="-0.045em"
            lineClamp={2}
          >
            Same Fields, Different Systems
          </Text>
          <BookOpen size={18} color="#A1A1AA" />
        </Flex>

        <Grid
          templateColumns="0.8fr 1.18fr 1.18fr"
          gap={0}
          flex={1}
          minH={0}
          borderTop="1px solid"
          borderColor="whiteAlpha.100"
        >
          <HeaderCell density="compact">Field</HeaderCell>
          <HeaderCell density="compact" color={SWAC.colors.primary}>SWAC</HeaderCell>
          <HeaderCell density="compact" color={MEAC.colors.secondary}>MEAC</HeaderCell>
          {SYSTEM_COMPARISON_ROWS.map(([field, swac, meac]) => (
            <Fragment key={field}>
              <MatrixCell density="compact" muted>{field}</MatrixCell>
              <MatrixCell density="compact">{swac}</MatrixCell>
              <MatrixCell density="compact">{meac}</MatrixCell>
            </Fragment>
          ))}
        </Grid>
      </Box>
    </Grid>
  </Card>
);

const ConferenceQuoteCard = ({ variant = "standard" }) => {
  const isCompact = variant === "compact";

  return (
  <Card
    accent="#A855F7"
    bg="radial-gradient(circle at 20% 10%, rgba(255,209,0,0.13), transparent 34%), linear-gradient(145deg, rgba(20,20,22,0.98), rgba(8,8,10,1))"
  >
    <Box h="100%" p={isCompact ? 4 : 5} display="flex" flexDirection="column" justifyContent="center" position="relative" overflow="hidden">
      <Text
        position="absolute"
        right="-12px"
        bottom="-18px"
        fontSize={isCompact ? "72px" : "88px"}
        fontWeight="black"
        color="white"
        opacity={0.035}
        lineHeight={1}
      >
        ATL
      </Text>
      <Quote size={isCompact ? 24 : 28} color="#FFD100" style={{ opacity: 0.72 }} />
      <Text
        mt={isCompact ? 3 : 4}
        fontSize={isCompact ? "clamp(1.08rem, 1.55vw, 1.45rem)" : "clamp(1.2rem, 1.8vw, 1.7rem)"}
        color="white"
        fontWeight="black"
        lineHeight={0.98}
        textTransform="uppercase"
        letterSpacing="-0.04em"
      >
        Two roads to Atlanta. One HBCU football stage.
      </Text>
      <Box h="1px" w="42px" bg="#FFD100" my={isCompact ? 3 : 4} />
      <Text fontSize={isCompact ? "8px" : "9px"} color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em" lineClamp={3}>
        SWAC divisions. MEAC table. Celebration Bowl orbit.
      </Text>
    </Box>
  </Card>
  );
};

const HeaderCell = ({ children, color = "white", density = "standard" }) => (
  <Box
    bg="rgba(255,255,255,0.06)"
    px={density === "compact" ? 2 : 3}
    py={density === "compact" ? 1 : 2}
    borderBottom="1px solid"
    borderRight="1px solid"
    borderColor="whiteAlpha.100"
    minW={0}
  >
    <Text fontSize={density === "compact" ? "8px" : "9px"} color={color} fontWeight="black" textTransform="uppercase" letterSpacing="0.12em" lineClamp={1}>
      {children}
    </Text>
  </Box>
);

const MatrixCell = ({ children, muted = false, density = "standard" }) => (
  <Box
    px={density === "compact" ? 2 : 3}
    py={density === "compact" ? 1 : 2}
    borderBottom="1px solid"
    borderRight="1px solid"
    borderColor="whiteAlpha.100"
    minW={0}
    overflow="hidden"
  >
    <Text
      fontSize={density === "compact" ? "8px" : "10px"}
      color={muted ? "text.muted" : "text.secondary"}
      fontWeight={muted ? "black" : "bold"}
      lineHeight={density === "compact" ? 1.18 : 1.35}
      lineClamp={density === "compact" ? 1 : 2}
    >
      {children}
    </Text>
  </Box>
);

const CelebrationLedgerTile = ({ game, side }) => {
  const winnerColor = game.winner === "MEAC" ? MEAC.colors.secondary : "#A855F7";
  const winnerBg =
    game.winner === "MEAC"
      ? "linear-gradient(135deg, rgba(255,209,0,0.18), rgba(11,11,13,0.96))"
      : "linear-gradient(135deg, rgba(229,62,62,0.2), rgba(11,11,13,0.96))";
  const meacWon = game.winner === "MEAC";
  const teamColor = CELEBRATION_TEAM_COLORS[game.winnerAbbrev] || winnerColor;

  return (
    <Box
      minW={0}
      p={0}
      borderRadius="8px"
      bg={winnerBg}
      border="1px solid"
      borderColor={`${winnerColor}66`}
      borderTop="3px solid"
      borderTopColor={winnerColor}
      boxShadow={`0 0 18px ${winnerColor}14`}
      position="relative"
      overflow="hidden"
    >
      <Text
        position="absolute"
        right="-4px"
        top="18px"
        fontSize="36px"
        color="white"
        fontWeight="black"
        opacity={0.035}
        lineHeight={1}
      >
        {game.winner}
      </Text>
      <Box position="relative" zIndex={1} h="56%" px={{ base: 2, xl: 2.5 }} pt={{ base: 2, xl: 2.5 }}>
        <Flex align="center" justify="center" gap={2} mb={2}>
          <Text fontSize="12px" color={winnerColor} fontWeight="black" lineHeight={1}>
            {game.year}
          </Text>
        </Flex>
        <Flex align="center" justify="space-between" gap={2}>
          <Text fontSize="12px" color={meacWon ? "white" : "text.muted"} fontWeight="black" lineClamp={1}>
            {game.meacAbbrev}
          </Text>
          <Text fontSize="16px" color={meacWon ? winnerColor : "text.secondary"} fontWeight="black" lineHeight={1}>
            {game.meacScore}
          </Text>
        </Flex>
        <Box h="1px" bg="whiteAlpha.100" my={1.2} />
        <Flex align="center" justify="space-between" gap={2}>
          <Text fontSize="12px" color={!meacWon ? "white" : "text.muted"} fontWeight="black" lineClamp={1}>
            {game.swacAbbrev}
          </Text>
          <Text fontSize="16px" color={!meacWon ? winnerColor : "text.secondary"} fontWeight="black" lineHeight={1}>
            {game.swacScore}
          </Text>
        </Flex>
      </Box>

      <Box position="absolute" left={0} right={0} bottom={0} h="58%" overflow="hidden">
        <Image
          src={game.photo}
          alt=""
          w="100%"
          h="100%"
          objectFit="cover"
          objectPosition="center center"
          opacity={0.82}
          filter="contrast(1.08) saturate(1.02)"
        />
        <Box position="absolute" inset={0} bg="linear-gradient(180deg, rgba(9,9,11,0.96) 0%, rgba(9,9,11,0.58) 18%, rgba(9,9,11,0.12) 46%, rgba(9,9,11,0.04) 72%, rgba(0,0,0,0.42) 100%)" />
        <Box position="absolute" inset={0} bg={`linear-gradient(0deg, ${winnerColor}22, transparent 44%)`} />
        <Text
          position="absolute"
          left="50%"
          bottom={0.25}
          transform="translateX(-50%)"
          w="82%"
          fontSize="clamp(1.2rem, 2.1vw, 2.0rem)"
          color={teamColor}
          fontWeight="black"
          textTransform="uppercase"
          letterSpacing="-0.07em"
          lineHeight={0.84}
          textAlign="center"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="clip"
          textShadow="0 2px 8px rgba(0,0,0,0.9)"
          lineClamp={1}
        >
          {game.winnerDisplay}
        </Text>
      </Box>
    </Box>
  );
};

const CelebrationBowlLedger = () => {
  const leftGames = CELEBRATION_LEDGER_GAMES.slice(0, 5);
  const rightGames = CELEBRATION_LEDGER_GAMES.slice(5);

  return (
    <Card
      accent="#FF4B00"
      bg="radial-gradient(circle at 50% 54%, rgba(255,75,0,0.14), transparent 28%), linear-gradient(90deg, rgba(11,11,13,1), rgba(15,15,18,0.98) 50%, rgba(11,11,13,1))"
    >
      <Box position="absolute" inset={0} pointerEvents="none">
        <Box position="absolute" left="2%" right="2%" top="50%" h="1px" bg="linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)" />
        <Text
          position="absolute"
          left="50%"
          bottom="-22px"
          transform="translateX(-50%)"
          fontSize="clamp(4rem, 11vw, 9rem)"
          color="white"
          fontWeight="black"
          opacity={0.025}
          lineHeight={0.8}
          letterSpacing="-0.07em"
        >
          ATLANTA
        </Text>
      </Box>

      <Grid h="100%" templateColumns="1.4fr 0.8fr 1.4fr" gap={0} p={{ base: 2, xl: 4 }} position="relative">
        <Box minW={0} display="flex" flexDirection="column" mr={{ base: "-8px", xl: "-12px" }} zIndex={2}>
          <SimpleGrid columns={5} gap={{ base: 1, xl: 1.5 }} flex={1} alignItems="stretch">
            {leftGames.map((game) => (
              <CelebrationLedgerTile key={game.year} game={game} side="left" />
            ))}
          </SimpleGrid>
        </Box>

        <Flex direction="column" align="center" justify="center" minW={0} textAlign="center" position="relative" zIndex={1}>
          <Image
            src="/assets/celebrationbowl.png"
            alt="Celebration Bowl"
            w="clamp(180px, 22vw, 320px)"
            h="auto"
            objectFit="contain"
            filter="drop-shadow(0 12px 24px rgba(0,0,0,0.7))"
          />
        </Flex>

        <Box minW={0} display="flex" flexDirection="column" textAlign="right" ml={{ base: "-8px", xl: "-12px" }} zIndex={2}>
          <SimpleGrid columns={5} gap={{ base: 1, xl: 1.5 }} flex={1} alignItems="stretch">
            {rightGames.map((game) => (
              <CelebrationLedgerTile key={game.year} game={game} side="right" />
            ))}
          </SimpleGrid>
        </Box>
      </Grid>
    </Card>
  );
};

const TimelinePanel = ({ conf }) => (
  <Card accent={conf.colors.primary}>
    <Box p={4} h="100%" display="flex" flexDirection="column">
      <Flex align="center" justify="space-between" mb={3}>
        <Box>
          <Eyebrow color={conf.colors.secondary}>{conf.name}</Eyebrow>
          <Title size="lg">Foundation Timeline</Title>
        </Box>
        <History size={24} color={conf.colors.secondary} />
      </Flex>
      <Flex direction="column" gap={3} flex={1}>
        {conf.timeline.map(([year, event]) => (
          <Flex key={year} gap={4} align="center">
            <Box w="45px" textAlign="right">
              <Text fontSize="10px" fontWeight="black" color="whiteAlpha.400">{year}</Text>
            </Box>
            <Box flex={1} bg="rgba(255,255,255,0.04)" p={2} borderRadius="4px" borderLeft="2px solid" borderColor={conf.colors.primary}>
              <Text fontSize="9px" color="text.secondary" fontWeight="bold">{event}</Text>
            </Box>
          </Flex>
        ))}
      </Flex>
    </Box>
  </Card>
);

const RIVALRY_TILE_COUNT = 8;
const RIVALRY_ROTATION_MS = 8000;

const RIVALRY_BANNER_CSS = `
  @keyframes rivalryTileIn {
    from { opacity: 0; transform: translateY(8px) scale(0.985); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
`;

const RivalryLogoPair = ({ a, b }) => (
  <Flex
    align="center"
    justify="center"
    gap={{ base: 0, lg: 0 }}
    minW={0}
    flex={1}
    my={{ base: -2.5, lg: -3.5 }}
    position="relative"
  >
    <Image
      src={a.logo}
      alt={a.name}
      boxSize={{ base: "54px", lg: "78px" }}
      objectFit="contain"
      filter="drop-shadow(0 5px 12px rgba(0,0,0,0.82))"
      flexShrink={0}
      transform="translateX(8px) rotate(-6deg)"
      zIndex={1}
    />
    <Text
      fontSize={{ base: "8px", lg: "10px" }}
      color="whiteAlpha.700"
      fontWeight="black"
      textTransform="uppercase"
      lineHeight={1}
      flexShrink={0}
      zIndex={3}
      textShadow="0 2px 8px rgba(0,0,0,0.9)"
    >
      vs
    </Text>
    <Image
      src={b.logo}
      alt={b.name}
      boxSize={{ base: "54px", lg: "78px" }}
      objectFit="contain"
      filter="drop-shadow(0 5px 12px rgba(0,0,0,0.82))"
      flexShrink={0}
      transform="translateX(-8px) rotate(6deg)"
      zIndex={2}
    />
  </Flex>
);

const RivalryTile = ({ rivalry, tileKey }) => {
  const { a, b } = rivalry;
  const aLabel = getTeamLabel(a);
  const bLabel = getTeamLabel(b);

  return (
    <Box
      key={tileKey}
      minW={0}
      minH={0}
      overflow="hidden"
      borderRadius="7px"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg={`linear-gradient(135deg, ${a.colors.primary}42 0%, rgba(10,10,12,0.92) 47%, ${b.colors.primary}42 100%)`}
      position="relative"
      p={{ base: 1.5, lg: 2 }}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      style={{ animation: "rivalryTileIn 420ms cubic-bezier(0.22, 1, 0.36, 1) both" }}
    >
      <Box position="absolute" inset={0} bg="linear-gradient(180deg, rgba(0,0,0,0.16), rgba(0,0,0,0.44))" />
      <Text
        position="relative"
        zIndex={3}
        fontSize={{ base: "8px", lg: "10px" }}
        color={a.colors.secondary || "brand.400"}
        fontWeight="black"
        textTransform="uppercase"
        letterSpacing={{ base: "0.06em", lg: "0.1em" }}
        lineHeight={0.95}
        textAlign="center"
        lineClamp={1}
        minW={0}
        textShadow="0 2px 8px rgba(0,0,0,0.9)"
      >
        {rivalry.name}
      </Text>

      <Box position="relative" zIndex={2} minW={0} flex={1} display="flex" alignItems="center" justifyContent="center">
        <RivalryLogoPair a={a} b={b} />
      </Box>

      <Text
        position="relative"
        zIndex={3}
        fontSize={{ base: "9px", lg: "11px" }}
        color="white"
        fontWeight="black"
        textTransform="uppercase"
        letterSpacing="0.02em"
        lineHeight={1}
        textAlign="center"
        lineClamp={1}
        minW={0}
      >
        {aLabel} vs {bLabel}
      </Text>
    </Box>
  );
};

const ClassicsAndRivalriesBanner = () => {
  const rivalries = useMemo(
    () => RIVALRIES.map(resolveRivalryTeams).filter((rivalry) => rivalry.a && rivalry.b),
    [],
  );
  const [rotation, setRotation] = useState(() => ({
    visibleIndexes: Array.from(
      { length: Math.min(RIVALRY_TILE_COUNT, rivalries.length) },
      (_, index) => index,
    ),
    slot: 0,
    nextIndex: RIVALRY_TILE_COUNT,
  }));

  useMountEffect(() => {
    if (rivalries.length <= RIVALRY_TILE_COUNT) return undefined;

    const interval = setInterval(() => {
      setRotation((prev) => {
        const visibleIndexes = [...prev.visibleIndexes];
        visibleIndexes[prev.slot] = prev.nextIndex % rivalries.length;

        return {
          visibleIndexes,
          slot: (prev.slot + 1) % visibleIndexes.length,
          nextIndex: (prev.nextIndex + 1) % rivalries.length,
        };
      });
    }, RIVALRY_ROTATION_MS);

    return () => clearInterval(interval);
  });

  return (
    <Card
      accent="#FFD100"
      bg="linear-gradient(90deg, rgba(7,7,8,0.98) 0%, rgba(20,20,22,0.96) 38%, rgba(39,27,9,0.94) 100%)"
    >
      <style>{RIVALRY_BANNER_CSS}</style>
      <Flex h="100%" minW={0} gap={{ base: 2, lg: 3 }} p={{ base: 2, lg: 3 }}>
        <Box
          w={{ base: "128px", lg: "220px" }}
          flexShrink={0}
          minH={0}
          borderRadius="7px"
          overflow="hidden"
          position="relative"
          bg="linear-gradient(135deg, rgba(255,255,255,0.08), rgba(0,0,0,0.55))"
          border="1px solid"
          borderColor="whiteAlpha.100"
        >
          <Image
            src="/pics/stadium_dusk.jpg"
            alt=""
            position="absolute"
            inset={0}
            w="100%"
            h="100%"
            objectFit="cover"
            opacity={0.2}
            filter="grayscale(1) contrast(1.35)"
          />
          <Box position="absolute" inset={0} bg="linear-gradient(90deg, rgba(0,0,0,0.78), rgba(0,0,0,0.35))" />
          <Flex position="relative" zIndex={1} h="100%" direction="column" justify="center" px={{ base: 3, lg: 5 }}>
            <Text
              fontSize={{ base: "2xl", lg: "4xl" }}
              color="white"
              fontWeight="black"
              textTransform="uppercase"
              lineHeight={0.82}
              lineClamp={3}
            >
              Classics
              <br />&
              <br />Rivalries
            </Text>
            <Text
              mt={{ base: 2, lg: 3 }}
              fontSize={{ base: "7px", lg: "8px" }}
              color="#FFD100"
              fontWeight="black"
              textTransform="uppercase"
              letterSpacing="0.14em"
              lineClamp={1}
            >
              Rotating HBCU slate
            </Text>
          </Flex>
        </Box>

        <Grid
          flex={1}
          minW={0}
          minH={0}
          templateColumns="repeat(4, minmax(0, 1fr))"
          templateRows="repeat(2, minmax(0, 1fr))"
          gap={{ base: 1.5, lg: 2 }}
        >
          {rotation.visibleIndexes.map((rivalryIndex, slotIndex) => {
            const rivalry = rivalries[rivalryIndex];
            if (!rivalry) return null;
            return (
              <RivalryTile
                key={`${rivalry.name}-${slotIndex}-${rivalryIndex}`}
                tileKey={`${rivalry.name}-${slotIndex}-${rivalryIndex}`}
                rivalry={rivalry}
              />
            );
          })}
        </Grid>
      </Flex>
    </Card>
  );
};

const TIMELINE_MIN_DWELL_MS = 7000;
const TIMELINE_MAX_DWELL_MS = 25000;

const TITLE_PATH_TIMELINE_CSS = `
  @keyframes timelineCardIn {
    from { opacity: 0; transform: translateY(6px) scale(0.985); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
`;

const randomTimelineDwell = () =>
  TIMELINE_MIN_DWELL_MS + Math.floor(Math.random() * (TIMELINE_MAX_DWELL_MS - TIMELINE_MIN_DWELL_MS + 1));

const TimelinePeriodCard = ({ bucket, event }) => (
  <Box
    minW={0}
    h="100%"
    overflow="hidden"
    borderRadius="7px"
    border="1px solid"
    borderColor={`${bucket.tone}66`}
    bg={`linear-gradient(145deg, ${bucket.tone}24, rgba(8,8,10,0.96) 58%)`}
    position="relative"
    p={{ base: 2, lg: 2.5 }}
    display="flex"
    flexDirection="column"
    justifyContent="space-between"
    style={{ animation: "timelineCardIn 420ms cubic-bezier(0.22, 1, 0.36, 1) both" }}
  >
    <Text
      position="absolute"
      right={{ base: "-6px", lg: "-10px" }}
      bottom={{ base: "-10px", lg: "-16px" }}
      fontSize={{ base: "42px", lg: "62px" }}
      color="white"
      opacity={0.055}
      fontWeight="black"
      lineHeight={0.8}
      pointerEvents="none"
    >
      {bucket.range}
    </Text>

    <Flex align="center" justify="space-between" gap={2} position="relative" zIndex={1}>
      <Text
        fontSize={{ base: "7px", lg: "8px" }}
        color={bucket.tone}
        fontWeight="black"
        textTransform="uppercase"
        letterSpacing="0.12em"
        lineClamp={1}
      >
        {bucket.title}
      </Text>
      <Box px={1.5} py={0.5} borderRadius="999px" bg={`${bucket.tone}1f`} border="1px solid" borderColor={`${bucket.tone}55`} minW={0}>
        <Text fontSize="7px" color="text.secondary" fontWeight="black" textTransform="uppercase" letterSpacing="0.08em" lineClamp={1}>
          {bucket.range}
        </Text>
      </Box>
    </Flex>

    <Box key={`${bucket.id}-${event.year}-${event.label}`} position="relative" zIndex={1} minW={0} style={{ animation: "timelineCardIn 360ms cubic-bezier(0.22, 1, 0.36, 1) both" }}>
      <Text
        fontSize={{ base: "lg", lg: "2xl" }}
        color="white"
        fontWeight="black"
        lineHeight={0.82}
        lineClamp={1}
        mb={1}
      >
        {event.year}
      </Text>
      <Text
        fontSize={{ base: "9px", lg: "11px" }}
        color="white"
        fontWeight="black"
        textTransform="uppercase"
        lineHeight={0.95}
        lineClamp={1}
        mb={1}
      >
        {event.label}
      </Text>
      <Text
        fontSize={{ base: "7px", lg: "8px" }}
        color="text.secondary"
        fontWeight="bold"
        lineHeight={1.25}
        lineClamp={2}
      >
        {event.detail}
      </Text>
    </Box>

    <Box position="relative" zIndex={1} h="2px" w="54%" bg={bucket.tone} borderRadius="full" opacity={0.75} />
  </Box>
);

const TitlePathTimelineBanner = () => {
  const [indexes, setIndexes] = useState(() =>
    Object.fromEntries(TITLE_PATH_BUCKETS.map((bucket) => [bucket.id, 0])),
  );
  const timersRef = useRef([]);

  useMountEffect(() => {
    const scheduleBucket = (bucket) => {
      const timer = setTimeout(() => {
        setIndexes((prev) => ({
          ...prev,
          [bucket.id]: (prev[bucket.id] + 1) % bucket.events.length,
        }));
        scheduleBucket(bucket);
      }, randomTimelineDwell());

      timersRef.current.push(timer);
    };

    TITLE_PATH_BUCKETS.forEach(scheduleBucket);

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  });

  const topBuckets = [TITLE_PATH_BUCKETS[0], TITLE_PATH_BUCKETS[2], TITLE_PATH_BUCKETS[4]];
  const bottomBuckets = [TITLE_PATH_BUCKETS[1], TITLE_PATH_BUCKETS[3], TITLE_PATH_BUCKETS[5]];

  return (
    <Card
      accent="#FFFFFF"
      bg="linear-gradient(90deg, rgba(4,4,5,0.98) 0%, rgba(16,16,18,0.97) 44%, rgba(28,17,7,0.94) 100%)"
    >
      <style>{TITLE_PATH_TIMELINE_CSS}</style>
      <Box h="100%" minW={0} p={{ base: 2, lg: 3 }} display="flex" flexDirection="column" justifyContent="space-between">
        <Grid
          templateColumns="repeat(3, minmax(0, 1fr))"
          gap={{ base: 1.5, lg: 2 }}
          h="39%"
        >
          {topBuckets.map((bucket) => (
            <TimelinePeriodCard
              key={bucket.id}
              bucket={bucket}
              event={bucket.events[indexes[bucket.id] ?? 0]}
            />
          ))}
        </Grid>

        <Box position="relative" h="12%" display="flex" alignItems="center" px={{ base: 2, lg: 5 }}>
          <Box h="3px" w="100%" bg="linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.72), rgba(255,255,255,0.08))" borderRadius="full" />
          {TITLE_PATH_BUCKETS.map((bucket, index) => (
            <Box
              key={`${bucket.id}-dot`}
              position="absolute"
              left={`${(index / (TITLE_PATH_BUCKETS.length - 1)) * 100}%`}
              top="50%"
              transform="translate(-50%, -50%)"
              boxSize={{ base: "9px", lg: "12px" }}
              borderRadius="full"
              bg={bucket.tone}
              border="2px solid"
              borderColor="#0B0B0D"
              boxShadow={`0 0 16px ${bucket.tone}66`}
            />
          ))}
        </Box>

        <Grid
          templateColumns="repeat(3, minmax(0, 1fr))"
          gap={{ base: 1.5, lg: 2 }}
          h="39%"
        >
          {bottomBuckets.map((bucket) => (
            <TimelinePeriodCard
              key={bucket.id}
              bucket={bucket}
              event={bucket.events[indexes[bucket.id] ?? 0]}
            />
          ))}
        </Grid>
      </Box>
    </Card>
  );
};

const MeacSwacChallengeBanner = () => (
  <Card bg="white" border="1px solid" borderColor="gray.200" boxShadow="0 10px 40px rgba(0,0,0,0.08)" overflow="hidden">
    <Grid h="100%" templateColumns="2fr 1.5fr 2fr" gap={0} position="relative">
      {/* Background Watermark */}
      <Text
        position="absolute"
        left="50%"
        top="50%"
        transform="translate(-50%, -50%)"
        fontSize="24rem"
        fontWeight="900"
        color="gray.50"
        zIndex={0}
        pointerEvents="none"
        letterSpacing="-0.05em"
      >
        W0
      </Text>

      {/* LEFT BLOCK: Series History & Dominance */}
      <Box zIndex={1} borderRight="1px solid" borderColor="gray.100" bg="linear-gradient(135deg, rgba(0,63,135,0.03) 0%, transparent 100%)">
        <Grid templateColumns="repeat(2, 1fr)" gap={0} h="100%">
          {/* Detailed Series Meter */}
          <Flex direction="column" justify="center" p={4} borderRight="1px solid" borderColor="gray.100" position="relative">
            <Box position="absolute" left={0} top={0} bottom={0} w="4px" bg="blue.600" />
            <Text fontSize="10px" fontWeight="black" color="blue.700" mb={1} textTransform="uppercase">Series Record</Text>
            <Flex align="baseline" gap={1}>
              <Text fontSize="3xl" fontWeight="900" color="gray.800">11</Text>
              <Text fontSize="xs" fontWeight="bold" color="blue.500">MEAC</Text>
              <Text fontSize="3xl" fontWeight="900" color="gray.300">-</Text>
              <Text fontSize="3xl" fontWeight="900" color="gray.800">7</Text>
              <Text fontSize="xs" fontWeight="bold" color="red.500">SWAC</Text>
            </Flex>
            <Box w="full" h="6px" bg="gray.100" borderRadius="full" mt={2} overflow="hidden" boxShadow="inset 0 1px 2px rgba(0,0,0,0.1)">
              <Box w="61%" h="full" bg="blue.600" />
            </Box>
            <Text fontSize="9px" color="blue.600" mt={2} fontWeight="900">MEAC DOMINANCE: +4</Text>
          </Flex>

          {/* Participation Density */}
          <Flex direction="column" justify="center" p={4} bg="gray.50/40">
            <Text fontSize="10px" fontWeight="black" color="gray.400" mb={2} textTransform="uppercase">Most Active</Text>
            {[
              ["SC State", "7 App", "blue"],
              ["Southern", "4 App", "red"],
              ["BCU", "4 App", "blue"]
            ].map(([team, stat, color]) => (
              <Flex key={team} justify="space-between" mb={1} align="center">
                <Text fontSize="10px" fontWeight="900" color="gray.700">{team}</Text>
                <Badge variant="solid" colorScheme={color} fontSize="8px" size="sm">{stat}</Badge>
              </Flex>
            ))}
          </Flex>

          {/* Venue & Location Heritage */}
          <Flex direction="column" justify="center" p={4} borderTop="1px solid" borderColor="gray.100" gridColumn="span 2" bg="white">
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="9px" fontWeight="black" color="gray.400" textTransform="uppercase">Current Residency</Text>
                <Text fontSize="sm" fontWeight="1000" color="gray.800">CENTER PARC STADIUM</Text>
                <Text fontSize="9px" fontWeight="bold" color="red.600">ATLANTA, GA (2018-PRES)</Text>
              </Box>
              <Box textAlign="right">
                <Text fontSize="9px" fontWeight="black" color="gray.400" textTransform="uppercase">Legacy Path</Text>
                <Text fontSize="9px" fontWeight="bold" color="gray.600">ORLANDO � BIRMINGHAM � BATON ROUGE</Text>
              </Box>
            </Flex>
          </Flex>
        </Grid>
      </Box>

      {/* CENTER: BRAND CORE */}
      <Flex direction="column" align="center" justify="center" px={4} zIndex={2} bg="white" boxShadow="0 0 40px rgba(0,0,0,0.05)">
        <Box position="relative">
           <Image 
            src="/assets/meacswachallengelogo.png" 
            alt="MEAC/SWAC Challenge" 
            h="115px" 
            objectFit="contain"
            filter="drop-shadow(0 6px 15px rgba(0,0,0,0.15))"
            mb={3}
          />
        </Box>
        <Flex gap={1} mb={2}>
          <Badge variant="solid" bg="gray.800" color="white" px={2} borderRadius="0" fontSize="9px">EST. 2005</Badge>
          <Badge variant="solid" bg="#A855F7" color="white" px={2} borderRadius="0" fontSize="9px">ESPN EVENTS</Badge>
        </Flex>
        <Text fontSize="9px" fontWeight="black" color="#A855F7" letterSpacing="0.4em" ml="4px">THE SEASON STARTS HERE</Text>
      </Flex>

      {/* RIGHT BLOCK: Highs, Props & Talent */}
      <Box zIndex={1} borderLeft="1px solid" borderColor="gray.100" bg="linear-gradient(225deg, rgba(229,62,62,0.03) 0%, transparent 100%)">
        <Grid templateColumns="repeat(2, 1fr)" gap={0} h="100%">
          {/* Scoring & Slams */}
          <Flex direction="column" justify="center" p={4} borderRight="1px solid" borderColor="gray.100" position="relative">
            <Text fontSize="10px" fontWeight="black" color="red.700" mb={1} textTransform="uppercase">Scoring High</Text>
            <Flex align="baseline" gap={1}>
              <Text fontSize="4xl" fontWeight="1000" color="#A855F7" lineHeight={1}>63</Text>
              <Text fontSize="10px" fontWeight="black" color="gray.400">PTS</Text>
            </Flex>
            <Text fontSize="9px" fontWeight="bold" color="gray.700" mt={1}>BCU vs PVAMU</Text>
            <Text fontSize="8px" fontWeight="bold" color="gray.400">ORLANDO, 2011</Text>
          </Flex>

          {/* Pro Pedigree */}
          <Flex direction="column" justify="center" p={4} bg="gray.50/40">
            <Text fontSize="10px" fontWeight="black" color="gray.400" mb={1} textTransform="uppercase">Draft Alumni</Text>
            <Text fontSize="4xl" fontWeight="1000" color="gray.800" lineHeight={1}>9</Text>
            <Text fontSize="9px" fontWeight="black" color="blue.700">NFL PICKS</Text>
            <Text fontSize="8px" fontWeight="bold" color="gray.500">HARGRAVE � DURANT � ADAMS</Text>
          </Flex>

          {/* Recent Ledger Strip */}
          <Box p={3} borderTop="1px solid" borderColor="gray.100" gridColumn="span 2" bg="white" position="relative">
            <Box position="absolute" right={0} top={0} bottom={0} w="4px" bg="red.600" />
            <Text fontSize="9px" fontWeight="black" color="gray.400" mb={2} textTransform="uppercase">Recent Outcomes</Text>
            <Flex justify="space-between" gap={2}>
              {[
                ["2025", "NC CENTRAL", "31-14", "MEAC"],
                ["2024", "FLORIDA A&M", "24-23", "SWAC"],
                ["2023", "JACKSON ST", "37-7", "SWAC"]
              ].map(([yr, team, score, conf]) => (
                <Box key={yr} flex={1} bg={conf === "MEAC" ? "blue.50" : "red.50"} p={1.5} borderRadius="sm" borderLeft="2px solid" borderColor={conf === "MEAC" ? "blue.200" : "red.200"}>
                  <Flex justify="space-between">
                    <Text fontSize="8px" fontWeight="black" color="gray.500">{yr}</Text>
                    <Text fontSize="7px" fontWeight="black" color={conf === "MEAC" ? "blue.600" : "red.600"}>{conf}</Text>
                  </Flex>
                  <Text fontSize="8px" fontWeight="1000" color="gray.800" lineClamp={1}>{team}</Text>
                  <Text fontSize="9px" fontWeight="bold" color="gray.600">{score}</Text>
                </Box>
              ))}
            </Flex>
          </Box>
        </Grid>
      </Box>
    </Grid>
  </Card>
);

const RivalryPanel = () => (
  <Card accent="#A855F7">
    <Box p={4} h="100%" display="flex" flexDirection="column">
      <Flex align="center" justify="space-between" mb={3}>
        <Box>
          <Eyebrow>Defining Matchups</Eyebrow>
          <Title size="lg">Classics & Rivalries</Title>
        </Box>
        <Map size={24} color="#A855F7" />
      </Flex>
      <SimpleGrid columns={2} gap={3} flex={1}>
        {RIVALRIES.slice(0, 6).map(resolveRivalryTeams).map((rivalry) => (
          <Box key={rivalry.name} border="1px solid" borderColor="whiteAlpha.100" borderRadius="8px" p={3} bg="rgba(255,255,255,0.02)">
            <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase">{rivalry.name}</Text>
            <Text fontSize="xs" color="white" fontWeight="black" mb={1}>
              {rivalry.a?.name} vs {rivalry.b?.name}
            </Text>
            <Text fontSize="8px" color="text.muted" fontWeight="bold" lineHeight={1.3}>{rivalry.desc}</Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  </Card>
);

const CelebrationBowlPanel = () => (
  <Card
    accent="#FFD100"
    bg="linear-gradient(90deg, rgba(111,38,51,0.34) 0%, rgba(20,20,22,0.98) 42%, rgba(75,0,130,0.34) 100%)"
  >
    <Box p={4} h="100%">
      <Flex align="center" justify="space-between" mb={3}>
        <Box>
          <Eyebrow color="#FFD100">Championship Bridge</Eyebrow>
          <Title size="2xl">Celebration Bowl</Title>
        </Box>
        <Trophy size={30} color="#FFD100" />
      </Flex>
      <Flex direction="column" gap={4}>
        <Text fontSize="sm" color="text.secondary" lineHeight={1.5} maxW="760px">
          The SWAC champion and MEAC champion meet in Atlanta in the Celebration Bowl, the modern
          centerpiece of the HBCU national championship conversation.
        </Text>
        
        <Grid templateColumns="1fr 1fr" gap={6}>
          <Box>
            <Eyebrow color={SWAC.colors.secondary}>SWAC Path</Eyebrow>
            <PathDiagram path={SWAC.championPath} color={SWAC.colors.primary} />
          </Box>
          <Box>
            <Eyebrow color={MEAC.colors.secondary}>MEAC Path</Eyebrow>
            <PathDiagram path={MEAC.championPath} color={MEAC.colors.primary} />
          </Box>
        </Grid>
      </Flex>

      <SimpleGrid columns={3} gap={3} mt={4}>
        <Stat label="Series record" value="MEAC 6, SWAC 4" color="#FFD100" />
        <Stat label="2025 National Champ" value="South Carolina State" color="#FFD100" />
        <Stat label="Selection model" value="SWAC title winner vs MEAC regular-season champion" />
      </SimpleGrid>
    </Box>
  </Card>
);

const CelebrationTable = () => (
  <Card accent="#FFD100">
    <Box p={4} h="100%" display="flex" flexDirection="column">
      <Eyebrow color="#FFD100">Celebration Bowl Results</Eyebrow>
      <Title size="lg">SWAC vs MEAC Record</Title>
      <Grid mt={3} templateColumns="64px 70px 1fr" gap={0} flex={1} border="1px solid" borderColor="whiteAlpha.100" borderRadius="8px" overflow="hidden">
        <HeaderCell>Year</HeaderCell>
        <HeaderCell>Winner</HeaderCell>
        <HeaderCell>Game</HeaderCell>
        {CELEBRATION_RESULTS.map(([year, winner, game]) => (
          <Fragment key={year}>
            <MatrixCell muted>{year}</MatrixCell>
            <MatrixCell>{winner}</MatrixCell>
            <MatrixCell>{game}</MatrixCell>
          </Fragment>
        ))}
      </Grid>
    </Box>
  </Card>
);

const MembershipPanel = () => (
  <Card accent="#A855F7">
    <Box p={4} h="100%" display="flex" flexDirection="column">
      <Flex align="center" justify="space-between" mb={3}>
        <Box>
          <Eyebrow>Membership And Alignment</Eyebrow>
          <Title size="lg">Football Members Plus Context</Title>
        </Box>
        <Users size={24} color="#A855F7" />
      </Flex>
      <SimpleGrid columns={4} gap={3} flex={1}>
        <MemberGroup title="SWAC East" items={MEMBERSHIP.swacEast} color={SWAC.colors.primary} />
        <MemberGroup title="SWAC West" items={MEMBERSHIP.swacWest} color={SWAC.colors.secondary} />
        <MemberGroup title="MEAC Football" items={MEMBERSHIP.meacFootball} color={MEAC.colors.primary} />
        <MemberGroup title="Historic Context" items={MEMBERSHIP.formerContext} color="whiteAlpha.400" />
      </SimpleGrid>
    </Box>
  </Card>
);

const MemberGroup = ({ title, items, color }) => (
  <Box minW={0}>
    <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em" mb={2}>
      {title}
    </Text>
    <Flex direction="column" gap={1}>
      {items.map((school) => (
        <Flex key={school} align="center" gap={2}>
          <Box w="2px" h="10px" bg={color} borderRadius="full" />
          <Text fontSize="9px" color="white" fontWeight="bold" lineClamp={1}>{school}</Text>
        </Flex>
      ))}
    </Flex>
  </Box>
);

const MediaPanel = () => (
  <Card accent="#4A90D9">
    <Box p={4} h="100%" display="flex" flexDirection="column">
      <Flex align="center" justify="space-between" mb={3}>
        <Box>
          <Eyebrow color="#4A90D9">Media & Broadcast</Eyebrow>
          <Title size="lg">The National Stage</Title>
        </Box>
        <Tv size={24} color="#4A90D9" />
      </Flex>
      <SimpleGrid columns={2} gap={4} flex={1}>
        <Box>
          <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase" mb={2}>SWAC Coverage</Text>
          <Flex direction="column" gap={1.5}>
            {SWAC.media.map(m => (
              <Flex key={m} align="center" gap={2}>
                <Radio size={10} color="#6F2633" />
                <Text fontSize="9px" color="text.secondary" fontWeight="bold">{m}</Text>
              </Flex>
            ))}
          </Flex>
        </Box>
        <Box>
          <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase" mb={2}>MEAC Coverage</Text>
          <Flex direction="column" gap={1.5}>
            {MEAC.media.map(m => (
              <Flex key={m} align="center" gap={2}>
                <Globe size={10} color="#4B0082" />
                <Text fontSize="9px" color="text.secondary" fontWeight="bold">{m}</Text>
              </Flex>
            ))}
          </Flex>
        </Box>
      </SimpleGrid>
    </Box>
  </Card>
);

const TraditionPanel = () => (
  <Card accent="#FFD100" bg="rgba(0,0,0,0.4)">
    <Box p={4} h="100%" display="flex" flexDirection="column">
      <Flex align="center" justify="space-between" mb={3}>
        <Box>
          <Eyebrow color="#FFD100">Culture & Pageantry</Eyebrow>
          <Title size="lg">Signature Traditions</Title>
        </Box>
        <Music size={24} color="#FFD100" />
      </Flex>
      <SimpleGrid columns={2} gap={2} flex={1}>
        {[...SWAC.traditions, ...MEAC.traditions].map(t => (
          <Flex key={t} align="center" gap={2} bg="whiteAlpha.100" p={2} borderRadius="4px">
            <Star size={10} color="#FFD100" />
            <Text fontSize="9px" color="white" fontWeight="black" textTransform="uppercase">{t}</Text>
          </Flex>
        ))}
      </SimpleGrid>
    </Box>
  </Card>
);

const LeagueStatsSection = () => (
  <Card accent="#FFFFFF">
    <Box p={4} h="100%" display="flex" flexDirection="column">
      <Flex align="center" justify="space-between" mb={3}>
        <Box>
          <Eyebrow color="text.muted">League Scale</Eyebrow>
          <Title size="lg">Combined Legacy Stats</Title>
        </Box>
        <Award size={24} color="white" />
      </Flex>
      <SimpleGrid columns={3} gap={3} flex="1" minW={0}>
        {LEGACY_STATS.map(([value, label]) => (
          <Box key={label} border="1px solid" borderColor="whiteAlpha.100" borderRadius="8px" p={3} bg="rgba(0,0,0,0.22)">
            <Text fontSize="2xl" color="white" fontWeight="black" lineHeight={1}>
              {value}
            </Text>
            <Text mt={1} fontSize="8px" color="text.muted" fontWeight="bold" textTransform="uppercase" letterSpacing="0.1em">
              {label}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  </Card>
);

const TeamDirectoryBottom = () => (
  <Card accent="#71717A">
    <Box p={4} h="100%" display="flex" flexDirection="column">
      <Flex align="center" justify="space-between" mb={3}>
        <Box>
          <Eyebrow>Member Team Directory</Eyebrow>
          <Title size="lg">At The Bottom, Where It Belongs</Title>
        </Box>
        <MapPin size={24} color="#A1A1AA" />
      </Flex>
      <Grid templateColumns="repeat(6, minmax(0, 1fr))" gap={2} flex={1}>
        {TEAMS.map((team) => (
          <Box key={`bottom-${team.id}`} border="1px solid" borderColor="whiteAlpha.100" borderRadius="8px" p={2} bg="rgba(255,255,255,0.035)" minW={0}>
            <Flex align="center" gap={2}>
              <Image src={team.logo} boxSize="22px" objectFit="contain" flexShrink={0} />
              <Box minW={0}>
                <Text fontSize="10px" color="white" fontWeight="black" lineClamp={1}>{team.name}</Text>
                <Text fontSize="8px" color="text.muted" fontWeight="bold" lineClamp={1}>{team.conference} / {team.division || "MEAC"}</Text>
              </Box>
            </Flex>
          </Box>
        ))}
      </Grid>
    </Box>
  </Card>
);

const SharedTimelinePanel = () => (
  <Card accent="#FFFFFF" bg="rgba(20,20,22,0.99)">
    <Box p={4} h="100%">
      <Flex align="center" gap={3} mb={4}>
        <History size={20} color="white" />
        <Box>
          <Eyebrow color="white">Shared HBCU History</Eyebrow>
          <Title size="md">The Unified Timeline</Title>
        </Box>
      </Flex>
      <Flex direction="column" gap={3}>
        {SHARED_TIMELINE.map(([year, text]) => (
          <Flex key={year} gap={4} align="center">
            <Box w="60px" textAlign="right">
              <Text fontSize="xs" fontWeight="black" color="whiteAlpha.400">{year}</Text>
            </Box>
            <Box flex={1} bg="whiteAlpha.50" p={2} borderRadius="4px" borderLeft="2px solid white">
              <Text fontSize="10px" color="text.secondary" fontWeight="bold">{text}</Text>
            </Box>
          </Flex>
        ))}
      </Flex>
    </Box>
  </Card>
);

const CategoryHeader = ({ title, subtitle }) => (
  <Box mb={4} mt={8}>
    <Eyebrow color="brand.500">{title}</Eyebrow>
    <Title size="2xl">{subtitle}</Title>
    <Box h="1px" bg="whiteAlpha.100" mt={2} />
  </Box>
);

export const ConferenceWikiPageLabA = () => (
  <PageShell>
    <PageShell.Slot cols={4} rows={1}>
      <ConferenceWikiBanner />
    </PageShell.Slot>
    <PageShell.Slot cols={4} rows={1}>
      <WikiDirectoryComponent variant="compact" />
    </PageShell.Slot>

    <PageShell.Slot cols={4}><CategoryHeader title="The Governance" subtitle="Conference Identities" /></PageShell.Slot>
    <PageShell.Slot cols={2} rows={3}>
      <ConferencePanel conf={SWAC} />
    </PageShell.Slot>
    <PageShell.Slot cols={2} rows={3}>
      <ConferencePanel conf={MEAC} />
    </PageShell.Slot>

    <PageShell.Slot cols={4}><CategoryHeader title="The Systems" subtitle="Comparison Matrix" /></PageShell.Slot>
    <PageShell.Slot cols={3} rows={1}>
      <ComparisonMatrix variant="compact" />
    </PageShell.Slot>
    <PageShell.Slot cols={1} rows={1}>
      <ConferenceQuoteCard variant="compact" />
    </PageShell.Slot>

    <PageShell.Slot cols={4}><CategoryHeader title="The Postseason" subtitle="Celebration Bowl Ledger" /></PageShell.Slot>
    <PageShell.Slot cols={4} rows={1}>
      <CelebrationBowlLedger />
    </PageShell.Slot>
    <PageShell.Slot cols={4} rows={1}>
      <ClassicsAndRivalriesBanner />
    </PageShell.Slot>
    <PageShell.Slot cols={4} rows={1}>
      <TitlePathTimelineBanner />
    </PageShell.Slot>

    <PageShell.Slot cols={4}><CategoryHeader title="The History" subtitle="Era Timelines" /></PageShell.Slot>
    <PageShell.Slot cols={1} rows={2}>
      <SharedTimelinePanel />
    </PageShell.Slot>
    <PageShell.Slot cols={1} rows={2}>
      <TimelinePanel conf={SWAC} />
    </PageShell.Slot>
    <PageShell.Slot cols={1} rows={2}>
      <TimelinePanel conf={MEAC} />
    </PageShell.Slot>
    <PageShell.Slot cols={1} rows={2}>
      <TraditionPanel />
    </PageShell.Slot>

    <PageShell.Slot cols={4}><CategoryHeader title="The Postseason" subtitle="Celebration Bowl Orbit" /></PageShell.Slot>
    <PageShell.Slot cols={3} rows={2}>
      <CelebrationBowlPanel />
    </PageShell.Slot>
    <PageShell.Slot cols={1} rows={4}>
      <CelebrationTable />
    </PageShell.Slot>
    
    <PageShell.Slot cols={3} rows={2}>
      <RivalryPanel />
    </PageShell.Slot>

    <PageShell.Slot cols={4}><CategoryHeader title="The Kickoff" subtitle="MEAC/SWAC Challenge" /></PageShell.Slot>
    <PageShell.Slot cols={4} rows={1}>
      <MeacSwacChallengeBanner />
    </PageShell.Slot>

    <PageShell.Slot cols={4}><CategoryHeader title="The Members" subtitle="Realignment & Membership" /></PageShell.Slot>
    <PageShell.Slot cols={2} rows={2}>
      <MembershipPanel />
    </PageShell.Slot>
    <PageShell.Slot cols={2} rows={2}>
      <MediaPanel />
    </PageShell.Slot>

    <PageShell.Slot cols={4}><CategoryHeader title="The Scale" subtitle="Big Picture Stats" /></PageShell.Slot>
    <PageShell.Slot cols={4} rows={1}>
      <LeagueStatsSection />
    </PageShell.Slot>
    <PageShell.Slot cols={4} rows={1}>
      <TeamDirectoryBottom />
    </PageShell.Slot>
  </PageShell>
);
