import { CITY_COORDS, averageCoords, STATE_MAP_SCALE_OVERRIDES, DEFAULT_STATE_MAP_SCALE, GEO_URL, STATE_LIST, SCHOOLS_BY_STATE_ABBR } from "./footprintModel";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { DIAL_VIEW_PX, StateDial } from "./StateDial";
import { useState } from "react";

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

export const StateFootprintExplorer = () => {
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
