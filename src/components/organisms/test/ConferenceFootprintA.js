import React from "react";
import { Box,  Flex, Grid, Image, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { MapPin } from "lucide-react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { MEAC, SWAC } from "../../../data/wiki_data";
import useMountEffect from "../../../hooks/useMountEffect";

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
  Jackson: [-90.1848, 32.2988],
  Birmingham: [-86.8025, 33.5186],
  "New Orleans": [-90.0715, 29.9511],
  Houston: [-95.3698, 29.7604],
  "Baton Rouge": [-91.1871, 30.4515],
  "Little Rock": [-92.2896, 34.7465],
  Tallahassee: [-84.2807, 30.4383],
  Montgomery: [-86.3000, 32.3668],
  "Washington D.C.": [-77.0369, 38.9072],
  Baltimore: [-76.6122, 39.2904],
  Norfolk: [-76.2859, 36.8508],
  Richmond: [-77.4360, 37.5407],
  Durham: [-78.8986, 35.9940],
  Orangeburg: [-80.8556, 33.4918],
  Dover: [-75.5244, 39.1582],
  Raleigh: [-78.6382, 35.7796],
};

const CONFERENCES = [SWAC, MEAC];
const REGION_IDS = new Set(Object.values(STATE_IDS));

const Eyebrow = ({ children, color = "text.muted", ...props }) => (
  <Text
    fontSize="9px"
    fontWeight="black"
    color={color}
    textTransform="uppercase"
    letterSpacing="0.16em"
    {...props}
  >
    {children}
  </Text>
);

// eslint-disable-next-line no-unused-vars
const Chip = ({ children, color }) => (
  <Box
    as="span"
    display="inline-flex"
    alignItems="center"
    minH="23px"
    px={2.5}
    borderRadius="999px"
    border="1px solid"
    borderColor={`${color}88`}
    bg={`${color}22`}
    color="white"
    fontSize="10px"
    fontWeight="black"
    textTransform="uppercase"
    whiteSpace="nowrap"
  >
    {children}
  </Box>
);

const ConferenceLegend = ({ conf }) => {
  const [cityIndex, setCityIndex] = React.useState(0);

  // Auto-carousel for cities
  useMountEffect(() => {
    const timer = setInterval(() => {
      setCityIndex((prev) => (prev + 1) % conf.cities.length);
    }, 3000);
    return () => clearInterval(timer);
  });

  return (
    <Box
      minW={0}
      borderRadius="8px"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg={`linear-gradient(135deg, ${conf.colors.primary}24, rgba(255,255,255,0.045) 58%)`}
      p={{ base: 3, lg: 4 }}
      position="relative"
      overflow="hidden"
      h="100%"
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

      <Box position="relative" zIndex={1} h="100%" display="flex" flexDirection="column">
        <Flex align="start" justify="space-between" gap={3} mb={3}>
          <Box minW={0}>
            <Eyebrow color={conf.colors.secondary}>{conf.name}</Eyebrow>
            <Text
              mt={1}
              fontSize="clamp(2rem, 4vw, 3.5rem)"
              color="white"
              fontWeight="black"
              lineHeight={0.82}
              letterSpacing="-0.06em"
              textTransform="uppercase"
            >
              {conf.key}
            </Text>
          </Box>
          <Image src={conf.logo} alt="" boxSize="38px" objectFit="contain" flexShrink={0} />
        </Flex>

        <Box mb={4}>
          <SimpleGrid columns={3} rows={2} gap={1.5}>
            {conf.states.slice(0, 6).map((state) => (
              <Box
                key={state}
                h="24px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="4px"
                border="1px solid"
                borderColor="whiteAlpha.200"
                bg="whiteAlpha.50"
              >
                <Text fontSize="10px" color="white" fontWeight="black" textTransform="uppercase">
                  {STATE_IDS[state] ? state.substring(0, 2) : state.substring(0, 2)}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        <Box mt="auto" bg="rgba(0,0,0,0.4)" borderRadius="6px" p={2} border="1px solid" borderColor="whiteAlpha.100">
          <Flex align="center" gap={2}>
            <Box boxSize="6px" borderRadius="full" bg={conf.colors.secondary} boxShadow={`0 0 8px ${conf.colors.secondary}`} />
            <Box minW={0} flex={1} position="relative" h="18px" overflow="hidden">
              {conf.cities.map((city, idx) => (
                <Text
                  key={city}
                  position="absolute"
                  top={0}
                  left={0}
                  w="full"
                  fontSize="xs"
                  color="white"
                  fontWeight="black"
                  textTransform="uppercase"
                  letterSpacing="0.05em"
                  transition="all 0.5s ease"
                  opacity={idx === cityIndex ? 1 : 0}
                  transform={idx === cityIndex ? "translateY(0)" : "translateY(20px)"}
                >
                  {city}
                </Text>
              ))}
            </Box>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

const stateConference = (geo, conferenceStateIds) => {
  const geoId = String(geo.id).padStart(2, "0");
  const geoName = STATE_NAME_ALIASES[geo.properties?.name] || geo.properties?.name;

  return CONFERENCES.find((conf) => {
    const ids = conferenceStateIds[conf.key];
    return ids.has(geoId) || conf.states.includes(geoName);
  });
};

const SharedFootprintMap = () => {
  const conferenceStateIds = CONFERENCES.reduce((lookup, conf) => {
    lookup[conf.key] = new Set(conf.states.map((state) => STATE_IDS[state]).filter(Boolean));
    return lookup;
  }, {});

  return (
    <Box
      h="full"
      minH={{ base: "360px", lg: "100%" }}
      w="full"
      borderRadius="8px"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg="radial-gradient(circle at 35% 48%, rgba(111,38,51,0.22) 0%, transparent 34%), radial-gradient(circle at 72% 38%, rgba(75,0,130,0.22) 0%, transparent 32%), linear-gradient(135deg, rgba(20,20,22,0.98), rgba(5,5,7,1))"
      overflow="hidden"
      position="relative"
    >
      <ComposableMap
        width={980}
        height={560}
        projection="geoMercator"
        projectionConfig={{ center: [-86.5, 33.5], scale: 1550 }}
        style={{ width: "100%", height: "100%", transform: "scale(1.15)" }}
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

        <rect x="0" y="0" width="980" height="560" fill="transparent" />

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

        {CONFERENCES.map((conf) =>
          conf.cities.map((city) => (
            <Marker key={`${conf.key}-${city}`} coordinates={CITY_COORDS[city] || [-86.5, 34.1]}>
              <circle r="13" fill={conf.colors.secondary} opacity="0.16" />
              <circle r="5" fill={conf.colors.secondary} stroke="#0B0B0D" strokeWidth="2" />
              <circle r="8" fill="none" stroke={conf.colors.primary} strokeWidth="1.6" opacity="0.9" />
            </Marker>
          )),
        )}
      </ComposableMap>

      <Flex
        position="absolute"
        left={{ base: 3, lg: 5 }}
        bottom={{ base: 3, lg: 5 }}
        gap={3}
        flexWrap="wrap"
        pointerEvents="none"
      >
        {CONFERENCES.map((conf) => (
          <Flex key={conf.key} align="center" gap={2} bg="rgba(11,11,13,0.76)" border="1px solid" borderColor="whiteAlpha.100" borderRadius="999px" px={3} py={1.5}>
            <Box boxSize="9px" borderRadius="full" bg={conf.colors.primary} boxShadow={`0 0 14px ${conf.colors.primary}`} />
            <Text fontSize="10px" color="white" fontWeight="black" textTransform="uppercase">
              {conf.key} footprint
            </Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
};

export const ConferenceFootprintA = () => (
  <Box
    h="full"
    w="full"
    minW={0}
    overflow="hidden"
    borderRadius="8px"
    border="1px solid"
    borderColor="whiteAlpha.100"
    bg="rgba(11,11,13,1)"
    boxShadow="inset 4px 0 0 #E53E3E"
    position="relative"
  >
    <Box
      position="absolute"
      inset={0}
      bg="radial-gradient(circle at 12% 18%, rgba(111,38,51,0.22), transparent 34%), radial-gradient(circle at 88% 22%, rgba(75,0,130,0.22), transparent 32%)"
      pointerEvents="none"
    />

    <Grid
      h="full"
      position="relative"
      zIndex={1}
      templateColumns={{ base: "1fr", xl: "2.15fr 1fr" }}
      gap={4}
      p={{ base: 4, lg: 5 }}
    >
      <Box minW={0} display="flex" flexDirection="column">
        <Flex align="end" justify="space-between" gap={4} mb={3} flexShrink={0}>
          <Box minW={0}>
            <Eyebrow color="brand.400">Conference Geography / Shared Southern Corridor</Eyebrow>
            <Text
              mt={1}
              fontSize="clamp(2.2rem, 5.4vw, 5.25rem)"
              lineHeight={0.84}
              fontWeight="black"
              letterSpacing="-0.055em"
              color="white"
              textTransform="uppercase"
              lineClamp={2}
            >
              One Footprint, Two Leagues
            </Text>
          </Box>
          <Flex align="center" gap={2} flexShrink={0}>
            <MapPin size={17} color="#F56565" />
            <Text fontSize="10px" color="text.secondary" fontWeight="black" textTransform="uppercase" lineClamp={1}>
              Southeast + Mid-Atlantic
            </Text>
          </Flex>
        </Flex>

        <Box flex={1} minH={0}>
          <SharedFootprintMap />
        </Box>
      </Box>

      <VStack align="stretch" gap={3} minW={0} minH={0}>
        {CONFERENCES.map((conf) => (
          <ConferenceLegend key={conf.key} conf={conf} />
        ))}
      </VStack>
    </Grid>
  </Box>
);
