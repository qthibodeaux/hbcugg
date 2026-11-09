import { Box, Flex, Text } from "@chakra-ui/react";
import { HomeStateMapSvg } from "./homeStateMap/HomeStateMapSvg";
import { MobileHomeStateMap, StateLegend } from "./homeStateMap/MobileHomeStateMap";
import { MapPin } from "lucide-react";
import { US_STATES, stateMapScale } from "../../../data/usStates";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";

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
    <HomeStateMapSvg
      home={home}
      school={school}
      anchor={anchor}
      isTwoState={isTwoState}
      center={center}
      mapScale={mapScale}
      primary={primary}
      secondary={secondary}
    />
  );

  if (isMobile) {
    return (
      <MobileHomeStateMap
        primary={primary}
        secondary={secondary}
        hometownLabel={hometownLabel}
        showStateShare={showStateShare}
        homeStateTeamCount={homeStateTeamCount}
        rosterTeamCount={rosterTeamCount}
        homeStateName={homeStateName}
        isInState={isInState}
        isTwoState={isTwoState}
        mapSvg={mapSvg}
      />
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
