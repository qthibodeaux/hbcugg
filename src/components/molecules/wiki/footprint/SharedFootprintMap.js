import { CONFERENCES, STATE_IDS, GEO_URL, REGION_IDS, stateConference, SCHOOL_MARKERS } from "./footprintModel";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { MEAC, SWAC } from "../../../../data/wiki_data";

export const SharedFootprintMap = ({ compact = false }) => {
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
