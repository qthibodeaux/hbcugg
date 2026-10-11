import React, { useRef, useState } from "react";
import { Box, Flex, Grid, Image, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MEAC, SWAC } from "../../../data/wiki_data";
import teamsData from "../../../data/teams.json";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const STATE_IDS = {
  Alabama: "01",
  Arkansas: "05",
  Delaware: "10",
  "D.C.": "11",
  Florida: "12",
  Louisiana: "22",
  Maryland: "24",
  Mississippi: "28",
  "North Carolina": "37",
  "South Carolina": "45",
  Texas: "48",
  Virginia: "51",
};

const STATE_NAME_ALIASES = {
  "District of Columbia": "D.C.",
};

const CITY_COORDS = {
  Lorman: [-91.0501, 31.8204],
  Normal: [-86.5686, 34.7834],
  Jackson: [-90.1848, 32.2988],
  Birmingham: [-86.8025, 33.5186],
  "New Orleans": [-90.0715, 29.9511],
  Houston: [-95.3698, 29.7604],
  "Baton Rouge": [-91.1871, 30.4515],
  "Little Rock": [-92.2896, 34.7465],
  "Daytona Beach": [-81.0228, 29.2108],
  Tallahassee: [-84.2807, 30.4383],
  Montgomery: [-86.3, 32.3668],
  "Itta Bena": [-90.3198, 33.4951],
  "Prairie View": [-95.9877, 30.0933],
  "Pine Bluff": [-92.0032, 34.2284],
  Grambling: [-92.714, 32.5277],
  Washington: [-77.0369, 38.9072],
  "Washington D.C.": [-77.0369, 38.9072],
  Baltimore: [-76.6122, 39.2904],
  Norfolk: [-76.2859, 36.8508],
  Richmond: [-77.436, 37.5407],
  Durham: [-78.8986, 35.994],
  Orangeburg: [-80.8556, 33.4918],
  Dover: [-75.5244, 39.1582],
  Raleigh: [-78.6382, 35.7796],
};

const CONFERENCES = [SWAC, MEAC];
const REGION_IDS = new Set(Object.values(STATE_IDS));
const SCHOOL_MARKERS = teamsData.teams.map((team) => ({
  id: team.id,
  shortName: team.shortName,
  conference: team.conference,
  primary: team.colors.primary,
  secondary: team.colors.secondary,
  coordinates: CITY_COORDS[team.city] || [-86.5, 34.1],
}));

const STATE_ABBREVIATIONS = {
  Alabama: "AL",
  Arkansas: "AR",
  Delaware: "DE",
  "D.C.": "DC",
  Florida: "FL",
  Louisiana: "LA",
  Maryland: "MD",
  Mississippi: "MS",
  "North Carolina": "NC",
  "South Carolina": "SC",
  Texas: "TX",
  Virginia: "VA",
};

// One entry per footprint state (12 total, 6 SWAC + 6 MEAC) — drives the
// mobile state-dial explorer. teams.json already carries a 2-letter `state`
// per team that lines up with STATE_ABBREVIATIONS, so schools-per-state is a
// straight group-by rather than a new hand-maintained mapping.
const STATE_LIST = CONFERENCES.flatMap((conf) =>
  conf.states.map((name) => ({
    name,
    abbr: STATE_ABBREVIATIONS[name] || name,
    stateId: STATE_IDS[name],
    conf,
  })),
);

const SCHOOLS_BY_STATE_ABBR = teamsData.teams.reduce((acc, team) => {
  const key = team.state;
  if (!acc[key]) acc[key] = [];
  acc[key].push(team);
  return acc;
}, {});

const averageCoords = (coordsList) => {
  if (!coordsList.length) return [-86.5, 34.1];
  const sum = coordsList.reduce((acc, [lon, lat]) => [acc[0] + lon, acc[1] + lat], [0, 0]);
  return [sum[0] / coordsList.length, sum[1] / coordsList.length];
};

const Eyebrow = ({ children, color = "text.muted", ...props }) => (
  <Text fontSize="9px" fontWeight="black" color={color} textTransform="uppercase" letterSpacing="0.16em" {...props}>
    {children}
  </Text>
);

const Chip = ({ children, color }) => (
  <Box
    as="span"
    display="inline-flex"
    alignItems="center"
    minH={{ base: "18px", xl: "23px" }}
    px={{ base: 2, xl: 2.5 }}
    borderRadius="999px"
    border="1px solid"
    borderColor={`${color}88`}
    bg={`${color}22`}
    color="white"
    fontSize={{ base: "8px", xl: "10px" }}
    fontWeight="black"
    textTransform="uppercase"
    whiteSpace="nowrap"
  >
    {children}
  </Box>
);

const CompactConferenceLegend = ({ conf }) => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const cities = conf.cities || [];
  const nextCity = () => setCarouselIndex((i) => (i + 1) % cities.length);
  const prevCity = () => setCarouselIndex((i) => (i - 1 + cities.length) % cities.length);
  const currentCity = cities[carouselIndex];
  const panelBg = conf.key === "MEAC" ? "#170B25" : "#210D18";

  return (
    <Box
      h="full"
      minW={0}
      minH={0}
      borderRadius="8px"
      border="1px solid"
      borderColor={`${conf.colors.primary}88`}
      bg={panelBg}
      boxShadow={`inset 0 0 0 1px rgba(255,255,255,0.03), inset 3px 0 0 ${conf.colors.secondary}`}
      p={{ base: 2.5, lg: 3 }}
      position="relative"
      overflow="hidden"
      display="flex"
      flexDirection="column"
      gap={2.5}
    >
      <Text
        position="relative"
        zIndex={1}
        fontSize="clamp(1.35rem, 3vw, 2rem)"
        color="white"
        fontWeight="black"
        lineHeight={0.82}
        letterSpacing="-0.03em"
        textTransform="uppercase"
      >
        {conf.key}
      </Text>

      {/* States Grid: 2 rows × 3 columns */}
      <Grid
        position="relative"
        zIndex={1}
        templateColumns="repeat(3, minmax(0, 1fr))"
        templateRows="repeat(2, minmax(0, 1fr))"
        gap={1.5}
        minH={0}
        flex="0 0 auto"
      >
        {conf.states.map((state) => (
          <Chip key={state} color={conf.colors.primary}>
            {STATE_ABBREVIATIONS[state] || state}
          </Chip>
        ))}
      </Grid>

      <Flex
        position="relative"
        zIndex={1}
        flex="1"
        minH={0}
        align="center"
        justify="center"
      >
        <Grid
          w="full"
          templateColumns="24px minmax(0, 1fr) 24px"
          alignItems="center"
          gap={1}
          bg="rgba(0,0,0,0.34)"
          border="1px solid"
          borderColor={`${conf.colors.secondary}44`}
          borderRadius="8px"
          px={1}
          py={1.5}
        >
          <Box
            as="button"
            onClick={prevCity}
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxSize="24px"
            borderRadius="6px"
            bg="rgba(255,255,255,0.07)"
            border="1px solid"
            borderColor="whiteAlpha.100"
            cursor="pointer"
            _hover={{ bg: "rgba(255,255,255,0.12)" }}
            style={{ transition: "all 0.15s" }}
          >
            <ChevronLeft size={13} color="white" />
          </Box>

          <Flex minW={0} align="center" justify="center" gap={1.5}>
            <Box
              boxSize="7px"
              borderRadius="full"
              bg={conf.colors.secondary}
              boxShadow={`0 0 12px ${conf.colors.secondary}`}
              flexShrink={0}
            />
            <Text
              fontSize="clamp(0.52rem, 1vw, 0.66rem)"
              color="white"
              fontWeight="black"
              textAlign="center"
              textTransform="uppercase"
              letterSpacing="0.03em"
              lineHeight={1}
              lineClamp={1}
            >
              {currentCity}
            </Text>
          </Flex>

          <Box
            as="button"
            onClick={nextCity}
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxSize="24px"
            borderRadius="6px"
            bg="rgba(255,255,255,0.07)"
            border="1px solid"
            borderColor="whiteAlpha.100"
            cursor="pointer"
            _hover={{ bg: "rgba(255,255,255,0.12)" }}
            style={{ transition: "all 0.15s" }}
          >
            <ChevronRight size={13} color="white" />
          </Box>
        </Grid>
      </Flex>
    </Box>
  );
};

const ConferenceLegend = ({ conf }) => (
  <Box
    h="full"
    minW={0}
    minH={0}
    borderRadius="8px"
    border="1px solid"
    borderColor="whiteAlpha.100"
    bg={`linear-gradient(135deg, ${conf.colors.primary}24, rgba(255,255,255,0.045) 58%)`}
    p={{ base: 2, xl: 3.5 }}
    position="relative"
    overflow="hidden"
  >
    <Image
      src={conf.logo}
      alt=""
      position="absolute"
      right="-20px"
      top="-20px"
      boxSize="110px"
      objectFit="contain"
      opacity={0.06}
      filter="grayscale(1) brightness(1.5)"
      pointerEvents="none"
    />

    <Flex position="relative" zIndex={1} h="full" direction="column" minH={0}>
      <Flex align="start" justify="space-between" gap={3} mb={{ base: 2, xl: 2.5 }}>
        <Box minW={0}>
          <Eyebrow color={conf.colors.secondary} display={{ base: "none", xl: "block" }}>
            {conf.name}
          </Eyebrow>
          <Text mt={{ base: 0, xl: 1 }} fontSize="clamp(1.65rem, 3.4vw, 3.1rem)" color="white" fontWeight="black" lineHeight={0.82} letterSpacing="-0.04em" textTransform="uppercase">
            {conf.key}
          </Text>
        </Box>
        <Image src={conf.logo} alt="" boxSize={{ base: "28px", xl: "38px" }} objectFit="contain" flexShrink={0} display={{ base: "none", xl: "block" }} />
      </Flex>

      <VStack align="stretch" gap={{ base: 2, xl: 3 }} flex="1" minH={0} overflow="hidden">
        <Box>
          <Eyebrow color={conf.colors.secondary} mb={2}>
            States
          </Eyebrow>
          <Flex gap={{ base: 1.5, xl: 2 }} flexWrap="wrap">
            {conf.states.map((state) => (
              <Chip key={state} color={conf.colors.primary}>
                <Box as="span" display={{ base: "inline", xl: "none" }}>
                  {STATE_ABBREVIATIONS[state] || state}
                </Box>
                <Box as="span" display={{ base: "none", xl: "inline" }}>
                  {state}
                </Box>
              </Chip>
            ))}
          </Flex>
        </Box>

        <Box>
          <Eyebrow color={conf.colors.secondary} mb={2}>
            Team Cities
          </Eyebrow>
          <SimpleGrid columns={2} gap={{ base: 1, xl: 2 }}>
            {conf.cities.map((city) => (
              <Flex key={city} align="center" gap={1.5} minW={0} borderRadius="999px" bg="rgba(0,0,0,0.24)" border="1px solid" borderColor="whiteAlpha.100" px={{ base: 1.5, xl: 2 }} py={{ base: 0.5, xl: 1 }}>
                <Box boxSize="7px" borderRadius="full" bg={conf.colors.secondary} boxShadow={`0 0 12px ${conf.colors.secondary}`} flexShrink={0} />
                <Text fontSize={{ base: "8px", xl: "10px" }} color="white" fontWeight="black" lineClamp={1}>
                  {city}
                </Text>
              </Flex>
            ))}
          </SimpleGrid>
        </Box>
      </VStack>
    </Flex>
  </Box>
);

const stateConference = (geo, conferenceStateIds) => {
  const geoId = String(geo.id).padStart(2, "0");
  const geoName = STATE_NAME_ALIASES[geo.properties?.name] || geo.properties?.name;

  return CONFERENCES.find((conf) => {
    const ids = conferenceStateIds[conf.key];
    return ids.has(geoId) || conf.states.includes(geoName);
  });
};

const SharedFootprintMap = ({ compact = false }) => {
  const conferenceStateIds = CONFERENCES.reduce((lookup, conf) => {
    lookup[conf.key] = new Set(conf.states.map((state) => STATE_IDS[state]).filter(Boolean));
    return lookup;
  }, {});

  return (
    <Box
      h="full"
      minH={0}
      w="full"
      borderRadius="8px"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg="radial-gradient(circle at 35% 48%, rgba(111,38,51,0.22) 0%, transparent 34%), radial-gradient(circle at 72% 38%, rgba(75,0,130,0.22) 0%, transparent 32%), linear-gradient(135deg, rgba(20,20,22,0.98), rgba(5,5,7,1))"
      overflow="hidden"
      position="relative"
    >
      <ComposableMap
        width={1036}
        height={560}
        projection="geoMercator"
        projectionConfig={{ center: compact ? [-85.8, 33.35] : [-86.5, 34.25], scale: compact ? 2180 : 2300 }}
        style={{ width: "100%", height: "100%" }}
        role="img"
        aria-label="SWAC and MEAC shared conference footprint map"
      >
        <defs>
          {CONFERENCES.map((conf) => (
            <filter key={conf.key} id={`conference-footprint-glow-${conf.key.toLowerCase()}`} x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor={conf.colors.primary} floodOpacity="0.7" />
            </filter>
          ))}
        </defs>

        <rect x="0" y="0" width={1036} height={560} fill="transparent" />

        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies
              .filter((geo) => REGION_IDS.has(String(geo.id).padStart(2, "0")))
              .map((geo) => {
                const conf = stateConference(geo, conferenceStateIds);
                const active = Boolean(conf);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={active ? `${conf.colors.primary}8f` : "rgba(255,255,255,0.055)"}
                    stroke={active ? conf.colors.primary : "rgba(255,255,255,0.16)"}
                    strokeWidth={active ? 1.45 : 0.7}
                    filter={active ? `url(#conference-footprint-glow-${conf.key.toLowerCase()})` : undefined}
                    style={{
                      default: { outline: "none" },
                      hover: {
                        fill: active ? `${conf.colors.primary}d5` : "rgba(255,255,255,0.12)",
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
          }
        </Geographies>

        {SCHOOL_MARKERS.map((school) => {
          const fill = school.secondary || (school.conference === "MEAC" ? MEAC.colors.secondary : SWAC.colors.secondary);
          const stroke = school.primary || (school.conference === "MEAC" ? MEAC.colors.primary : SWAC.colors.primary);
          return (
            <Marker key={school.id} coordinates={school.coordinates}>
              <circle r={compact ? 12.5 : 13} fill={fill} opacity={compact ? "0.22" : "0.16"} />
              <circle r={compact ? 4.8 : 5} fill={fill} stroke="#0B0B0D" strokeWidth="2" />
              <circle r={compact ? 8.2 : 8} fill="none" stroke={stroke} strokeWidth={compact ? "2" : "1.6"} opacity="0.95" />
            </Marker>
          );
        })}
      </ComposableMap>

      {!compact && (
        <Flex position="absolute" left={{ base: 3, lg: 5 }} bottom={{ base: 3, lg: 5 }} gap={3} flexWrap="wrap" pointerEvents="none">
          {CONFERENCES.map((conf) => (
            <Flex key={conf.key} align="center" gap={2} bg="rgba(11,11,13,0.76)" border="1px solid" borderColor="whiteAlpha.100" borderRadius="999px" px={3} py={1.5}>
              <Box boxSize="9px" borderRadius="full" bg={conf.colors.primary} boxShadow={`0 0 14px ${conf.colors.primary}`} />
              <Text fontSize="10px" color="white" fontWeight="black" textTransform="uppercase">
                {conf.key} footprint
              </Text>
            </Flex>
          ))}
        </Flex>
      )}
    </Box>
  );
};

// Mobile — a different concept entirely, not a shrunk version of the shared
// map: browse one state at a time. A vertical scroll-snap "dial" of state
// abbreviations on the left drives everything else — dragging/tapping it
// swaps which single state's outline+city zooms into the map, and which
// state's schools populate the right panel. Built with raw scroll-snap
// rather than a physics library: item height is fixed so scrollTop maps
// directly to an index, and a fade mask top/bottom sells the "wheel" look.
const DIAL_ITEM_PX = 44;
const DIAL_VIEW_PX = 224;
const DIAL_PAD_PX = (DIAL_VIEW_PX - DIAL_ITEM_PX) / 2;

const StateDial = ({ states, activeIndex, onSelect }) => {
  const scrollRef = useRef(null);
  const isProgrammatic = useRef(false);

  const goTo = (index) => {
    isProgrammatic.current = true;
    onSelect(index);
    scrollRef.current?.scrollTo({ top: index * DIAL_ITEM_PX, behavior: "smooth" });
    window.setTimeout(() => {
      isProgrammatic.current = false;
    }, 450);
  };

  const handleScroll = () => {
    if (isProgrammatic.current) return;
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.max(0, Math.min(states.length - 1, Math.round(el.scrollTop / DIAL_ITEM_PX)));
    if (index !== activeIndex) onSelect(index);
  };

  return (
    <Box position="relative" h={`${DIAL_VIEW_PX}px`} w="2.75rem" flexShrink={0} overflow="hidden">
      <style>{`.wiki-state-dial::-webkit-scrollbar { display: none; }`}</style>
      <Box
        ref={scrollRef}
        onScroll={handleScroll}
        className="wiki-state-dial"
        h="full"
        overflowY="scroll"
        style={{ scrollSnapType: "y mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <Box h={`${DIAL_PAD_PX}px`} />
        {states.map((state, index) => {
          const distance = Math.abs(index - activeIndex);
          const isActive = index === activeIndex;
          return (
            <Flex
              key={state.abbr}
              as="button"
              type="button"
              onClick={() => goTo(index)}
              h={`${DIAL_ITEM_PX}px`}
              w="full"
              align="center"
              justify="center"
              style={{ scrollSnapAlign: "center" }}
            >
              <Text
                fontSize={isActive ? "0.9rem" : "0.65rem"}
                fontWeight="black"
                color={isActive ? state.conf.colors.secondary : "whiteAlpha.500"}
                opacity={isActive ? 1 : Math.max(0.3, 1 - distance * 0.3)}
                transition="all 0.2s ease"
              >
                {state.abbr}
              </Text>
            </Flex>
          );
        })}
        <Box h={`${DIAL_PAD_PX}px`} />
      </Box>

      <Box position="absolute" top={0} left={0} right={0} h="2.25rem" bg="linear-gradient(to bottom, #0B0B0D, transparent)" pointerEvents="none" />
      <Box position="absolute" bottom={0} left={0} right={0} h="2.25rem" bg="linear-gradient(to top, #0B0B0D, transparent)" pointerEvents="none" />
      <Box position="absolute" left={0} top="50%" transform="translateY(-50%)" w="3px" h={`${DIAL_ITEM_PX}px`} bg={states[activeIndex].conf.colors.secondary} pointerEvents="none" />
    </Box>
  );
};

// Flat scale=5500 reads fine for most states, but Delaware and especially
// D.C. are so much smaller geographically that at that scale they shrink to
// a sliver or a near-invisible dot — bump those two individually instead of
// re-tuning every state.
const DEFAULT_STATE_MAP_SCALE = 5500;
const STATE_MAP_SCALE_OVERRIDES = {
  DE: 16000,
  DC: 55000,
};

const SingleStateMap = ({ state, schools }) => {
  const coords = schools.map((team) => CITY_COORDS[team.city] || [-86.5, 34.1]);
  const center = averageCoords(coords);
  const scale = STATE_MAP_SCALE_OVERRIDES[state.abbr] || DEFAULT_STATE_MAP_SCALE;

  return (
    <Box h="full" w="full" overflow="hidden" bg="rgba(0,0,0,0.35)" position="relative">
      <ComposableMap
        width={400}
        height={DIAL_VIEW_PX}
        projection="geoMercator"
        projectionConfig={{ center, scale }}
        style={{ width: "100%", height: "100%" }}
        role="img"
        aria-label={`${state.name} footprint map`}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies
              .filter((geo) => String(geo.id).padStart(2, "0") === state.stateId)
              .map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={`${state.conf.colors.primary}8f`}
                  stroke={state.conf.colors.primary}
                  strokeWidth={1.6}
                  style={{ default: { outline: "none" }, hover: { outline: "none" }, pressed: { outline: "none" } }}
                />
              ))
          }
        </Geographies>

        {schools.map((team) => (
          <Marker key={team.id} coordinates={CITY_COORDS[team.city] || [-86.5, 34.1]}>
            <circle r={16} fill={team.colors.primary} opacity={0.25} />
            <circle r={7} fill={team.colors.primary} stroke="#0B0B0D" strokeWidth="2" />
            <circle r={11} fill="none" stroke={team.colors.secondary} strokeWidth="2" opacity={0.95} />
          </Marker>
        ))}
      </ComposableMap>
    </Box>
  );
};

const StateSchoolCard = ({ team }) => (
  <Flex
    align="center"
    gap="0.6rem"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderLeft="3px solid"
    borderLeftColor={team.colors.primary}
    bg="rgba(255,255,255,0.045)"
    px="0.65rem"
    py="0.75rem"
    flex="1"
    minH="3.5rem"
  >
    <Image src={team.logo} alt="" boxSize="2.5rem" objectFit="contain" flexShrink={0} />
    <Box minW={0}>
      <Text fontSize="1rem" fontWeight="black" color="white" lineClamp={1}>
        {team.bannerShort || team.shortName}
      </Text>
      <Text fontSize="0.6rem" color="whiteAlpha.600" fontWeight="black" textTransform="uppercase" letterSpacing="0.04em" lineClamp={1}>
        {team.city}
      </Text>
    </Box>
  </Flex>
);

const StateFootprintExplorer = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeState = STATE_LIST[activeIndex];
  const schools = SCHOOLS_BY_STATE_ABBR[activeState.abbr] || [];

  return (
    <Box overflow="hidden" border="1px solid" borderColor="whiteAlpha.100" bg="rgba(11,11,13,1)" boxShadow="inset 4px 0 0 #E53E3E" position="relative">
      <Box position="absolute" inset={0} bg="radial-gradient(circle at 12% 18%, rgba(111,38,51,0.22), transparent 34%), radial-gradient(circle at 88% 22%, rgba(75,0,130,0.22), transparent 32%)" pointerEvents="none" />

      <Flex position="relative" zIndex={1} align="center" justify="space-between" px="0.75rem" py="0.55rem" borderBottom="1px solid" borderColor="whiteAlpha.100">
        <Text fontSize="1rem" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="-0.01em" lineClamp={1}>
          {activeState.name}
        </Text>
        <Box px="0.5rem" py="0.15rem" bg={`${activeState.conf.colors.secondary}22`} border="1px solid" borderColor={`${activeState.conf.colors.secondary}88`}>
          <Text fontSize="0.6rem" fontWeight="black" color={activeState.conf.colors.secondary} textTransform="uppercase" letterSpacing="0.06em">
            {activeState.conf.key}
          </Text>
        </Box>
      </Flex>

      <Flex position="relative" zIndex={1} gap="0.5rem" p="0.5rem">
        <StateDial states={STATE_LIST} activeIndex={activeIndex} onSelect={setActiveIndex} />

        <Box h={`${DIAL_VIEW_PX}px`} flex="1.1" minW={0}>
          <SingleStateMap state={activeState} schools={schools} />
        </Box>

        <Flex h={`${DIAL_VIEW_PX}px`} flex="1" minW={0} direction="column" gap="0.4rem" overflowY="auto">
          {schools.map((team) => (
            <StateSchoolCard key={team.id} team={team} />
          ))}
        </Flex>
      </Flex>
    </Box>
  );
};

const ConferenceFootprintCompact = () => {
  return (
    <Box h="full" w="full" minW={0} overflow="hidden" borderRadius="8px" border="1px solid" borderColor="whiteAlpha.100" bg="rgba(11,11,13,1)" boxShadow="inset 4px 0 0 #E53E3E" position="relative">
      <Box position="absolute" inset={0} bg="radial-gradient(circle at 12% 18%, rgba(111,38,51,0.22), transparent 34%), radial-gradient(circle at 88% 22%, rgba(75,0,130,0.22), transparent 32%)" pointerEvents="none" />

      <Grid h="full" position="relative" zIndex={1} templateColumns="3fr 1fr">
        <Box minW={0} display="flex" flexDirection="column">
          <Box flex={1} minH={0}>
            <SharedFootprintMap compact />
          </Box>
        </Box>

        <VStack align="stretch" gap={2.5} minW={0} minH={0} h="full" overflow="hidden" p={3}>
          {CONFERENCES.map((conf) => (
            <Box key={conf.key} flex="1" minH={0}>
              <CompactConferenceLegend conf={conf} />
            </Box>
          ))}
        </VStack>
      </Grid>
    </Box>
  );
};

export const ConferenceFootprint = ({ compact = false }) => {
  const { isMobile } = useLayoutDensity();
  if (isMobile) return <StateFootprintExplorer />;
  if (compact) return <ConferenceFootprintCompact />;
  return (
    <Box h="full" w="full" minW={0} overflow="hidden" borderRadius="8px" border="1px solid" borderColor="whiteAlpha.100" bg="rgba(11,11,13,1)" boxShadow="inset 4px 0 0 #E53E3E" position="relative">
      <Box position="absolute" inset={0} bg="radial-gradient(circle at 12% 18%, rgba(111,38,51,0.22), transparent 34%), radial-gradient(circle at 88% 22%, rgba(75,0,130,0.22), transparent 32%)" pointerEvents="none" />

      <Grid h="full" position="relative" zIndex={1} templateColumns={{ base: "1fr", md: "3fr 1fr", xl: "2.15fr 1fr" }}>
        <Box minW={0} display="flex" flexDirection="column">
          <Box flex={1} minH={0}>
            <SharedFootprintMap />
          </Box>
        </Box>

        <VStack align="stretch" gap={3} minW={0} minH={0} h="full" overflow="hidden" p={{ base: 0, md: 0 }}>
          {CONFERENCES.map((conf) => (
            <Box key={conf.key} flex="1" minH={0}>
              <ConferenceLegend conf={conf} />
            </Box>
          ))}
        </VStack>
      </Grid>
    </Box>
  );
};

export default ConferenceFootprint;
