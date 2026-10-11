import { Box, Flex, Text } from "@chakra-ui/react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { MapPin } from "lucide-react";
import { US_STATES, stateMapScale } from "../../../data/usStates";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// Fit-to-bounds for the two-state view: center on the midpoint, zoom scaled
// inversely to how far apart the two states are (close states zoom in
// tighter, cross-country states zoom out). Constants are a first-pass
// estimate calibrated off the single-state DEFAULT_STATE_MAP_SCALE — same
// spirit as the DE/DC hand overrides in usStates.js, expect to retune once
// this renders against real out-of-state players.
const twoStateView = (a, b) => {
  const center = [(a.center[0] + b.center[0]) / 2, (a.center[1] + b.center[1]) / 2];
  const distDeg = Math.hypot(a.center[0] - b.center[0], a.center[1] - b.center[1]);
  const scale = Math.max(400, Math.min(5200, 20000 / (distDeg * 1.4 || 1)));
  return { center, scale };
};

// Mobile band — everything that floats over the map on desktop gets its own
// full-width row instead, divided by hairlines. The column has plenty of
// vertical room on a phone, so nothing needs to overlap.
const MobileRow = ({ children, ...rest }) => (
  <Flex
    align="center"
    px="0.7rem"
    py="0.45rem"
    borderBottom="1px solid rgba(255,255,255,0.08)"
    flexShrink={0}
    {...rest}
  >
    {children}
  </Flex>
);

const StateLegend = ({ primary, secondary, ...rest }) => (
  <Flex gap="0.7rem" {...rest}>
    <Flex align="center" gap="0.25rem">
      <Box w="0.4rem" h="0.4rem" borderRadius="full" bg={primary} />
      <Text fontSize="0.5rem" fontWeight="800" color="rgba(255,255,255,0.7)" textTransform="uppercase">
        School
      </Text>
    </Flex>
    <Flex align="center" gap="0.25rem">
      <Box w="0.4rem" h="0.4rem" borderRadius="full" bg={secondary} />
      <Text fontSize="0.5rem" fontWeight="800" color="rgba(255,255,255,0.7)" textTransform="uppercase">
        Home
      </Text>
    </Flex>
  </Flex>
);

// Players only carry home_state (no per-hometown coordinates), so markers
// sit at each state's approximate center rather than a geocoded city pin —
// honest given what the data actually has, not faked precision. See the
// Havoc/rushing chart discussions this session for the same principle.
const PlayerHomeStateMap = ({
  stateAbbr,
  cityLabel,
  schoolState,
  primary,
  secondary,
  isInState,
  homeStateTeamCount,
  rosterTeamCount,
}) => {
  const { isMobile } = useLayoutDensity();
  const home = US_STATES[String(stateAbbr ?? "").toUpperCase()];
  const school = US_STATES[String(schoolState ?? "").toUpperCase()];
  const isTwoState = Boolean(home && school && home.fips !== school.fips);
  const anchor = home ?? school;

  if (!anchor) {
    return (
      <Flex direction="column" h="full" w="full" p={isMobile ? "0.7rem" : "0.4rem"}>
        <Flex align="center" gap="0.3rem" mb="0.3rem">
          <Box w="3px" h="10px" bg={primary} borderRadius="sm" />
          <Text fontSize="0.58rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.06em">
            Home State
          </Text>
        </Flex>
        <Flex flex={1} align="center" justify="center">
          <Text fontSize="0.6rem" color="rgba(255,255,255,0.4)" fontWeight="700" textTransform="uppercase">
            No hometown on file
          </Text>
        </Flex>
      </Flex>
    );
  }

  const { center, scale } = isTwoState ? twoStateView(home, school) : { center: anchor.center, scale: stateMapScale(anchor === home ? stateAbbr : schoolState) };

  // Mobile gets its own full-width row for the map instead of a short strip
  // behind the labels, so pull the projection back to leave breathing room
  // around the state outline.
  const mapScale = isMobile ? scale * 0.78 : scale;

  const hometownLabel = cityLabel ? `${cityLabel}, ${stateAbbr}` : anchor.name;
  const homeStateName = (home ?? anchor).name;
  const showStateShare = Number.isFinite(homeStateTeamCount) && Number.isFinite(rosterTeamCount) && rosterTeamCount > 0;

  const mapSvg = (
    <ComposableMap
      width={400}
      height={260}
      projection="geoMercator"
      projectionConfig={{ center, scale: mapScale }}
      style={{ width: "100%", height: "100%" }}
      role="img"
      aria-label={isTwoState ? `${home.name} to ${school.name} map` : `${anchor.name} map`}
    >
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies
            .filter((geo) => {
              const id = String(geo.id).padStart(2, "0");
              return isTwoState ? id === home.fips || id === school.fips : id === anchor.fips;
            })
            .map((geo) => {
              const id = String(geo.id).padStart(2, "0");
              const isSchoolState = isTwoState && id === school.fips;
              // Outline is always the opposite of the fill — school
              // state fills primary/outlines secondary and vice versa;
              // single-state view fills primary/outlines secondary too.
              const fillColor = isTwoState ? (isSchoolState ? primary : secondary) : primary;
              const strokeColor = isTwoState ? (isSchoolState ? secondary : primary) : secondary;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={`${fillColor}8f`}
                  stroke={strokeColor}
                  strokeWidth={1.6}
                  style={{ default: { outline: "none" }, hover: { outline: "none" }, pressed: { outline: "none" } }}
                />
              );
            })
        }
      </Geographies>
    </ComposableMap>
  );

  // Mobile — one row per element, top to bottom, with the map taking
  // whatever height is left over and the color key closing it out.
  if (isMobile) {
    return (
      <Flex direction="column" h="full" w="full" minH={0}>
        <MobileRow gap="0.35rem">
          <Box w="3px" h="0.7rem" bg={primary} />
          <Text fontSize="0.58rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.06em">
            Hometown
          </Text>
        </MobileRow>

        <MobileRow bg="rgba(0,0,0,0.35)">
          <Text fontSize="0.78rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.01em" lineClamp={1}>
            {hometownLabel}
          </Text>
        </MobileRow>

        {/* Roster share from this player's state. Distance-from-school miles
            would be the more natural stat, but no player carries coordinates
            — this is a real count off the roster instead of a fake radius. */}
        {showStateShare && (
          <MobileRow gap="0.3rem">
            <Text fontSize="0.7rem" fontWeight="900" color={secondary} lineHeight={1}>
              {homeStateTeamCount} of {rosterTeamCount}
            </Text>
            <Text fontSize="0.5rem" fontWeight="800" color="rgba(255,255,255,0.6)" textTransform="uppercase" letterSpacing="0.06em" lineClamp={1}>
              from {homeStateName}
            </Text>
          </MobileRow>
        )}

        {isInState != null && (
          <MobileRow>
            <Text
              fontSize="0.58rem"
              fontWeight="900"
              color={isInState ? "green.300" : "white"}
              textTransform="uppercase"
              letterSpacing="0.06em"
            >
              {isInState ? "In-State" : "Out-of-State"}
            </Text>
          </MobileRow>
        )}

        <Box flex={1} minH="8rem" position="relative" overflow="hidden" bg="rgba(0,0,0,0.35)">
          {mapSvg}
        </Box>

        {isTwoState && (
          <MobileRow borderBottom="none" borderTop="1px solid rgba(255,255,255,0.08)" justify="center">
            <StateLegend primary={primary} secondary={secondary} />
          </MobileRow>
        )}
      </Flex>
    );
  }

  return (
    <Flex direction="column" h="full" w="full" p="0.4rem">
      <Flex align="center" gap="0.3rem" mb="0.3rem">
        <Box w="3px" h="10px" bg={primary} borderRadius="sm" />
        <Text fontSize="0.58rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.06em">
          Home State
        </Text>
      </Flex>

      <Box flex={1} minH={0} position="relative" overflow="hidden" bg="rgba(0,0,0,0.35)" border="1px solid rgba(255,255,255,0.08)">
        {mapSvg}

        <Flex position="absolute" left="0.5rem" top="0.5rem" direction="column" align="flex-start" gap="0.15rem">
          <Text fontSize="0.42rem" fontWeight="800" color="rgba(255,255,255,0.6)" textTransform="uppercase" letterSpacing="0.08em" pl="0.15rem">
            Hometown
          </Text>
          <Flex
            align="center"
            gap="0.35rem"
            bg="rgba(0,0,0,0.6)"
            border="1px solid"
            borderColor="whiteAlpha.300"
            borderRadius="full"
            px="0.6rem"
            py="0.3rem"
          >
            <MapPin size={13} color={secondary} />
            <Text fontSize="0.78rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.01em">
              {hometownLabel}
            </Text>
          </Flex>
        </Flex>

        {isTwoState && (
          <StateLegend primary={primary} secondary={secondary} position="absolute" right="0.4rem" bottom="0.3rem" />
        )}
      </Box>
    </Flex>
  );
};

export default PlayerHomeStateMap;
