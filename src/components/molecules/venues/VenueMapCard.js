import { Box, Flex, Text } from "@chakra-ui/react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { US_STATES_GEO_URL } from "../maps";

// 2x2 slot. Pin radius scales with capacity, campus pins wear the home
// team's primary, neutral sites are hollow. Clicking a pin selects the venue
// through the URL (/schools/stadiums/:venueId) so the sidebar switcher, the
// Fortress card and this map all agree. Only venues with coordinates are
// pinned — today that is the 19 campus stadiums; every neutral site in
// venues.json ships lat/lon (and capacity) as null, so they appear here the
// day the file fills in.
//
// Sized in cqmin like the rest of the page. The slot is 2 row units on a
// side, so every value here is half what a 1x1 card would use.

const MAX_CAPACITY = 60492;
const pinRadius = (capacity) => 3 + Math.sqrt((capacity ?? 0) / MAX_CAPACITY) * 9;

const Legend = ({ swatch, label }) => (
  <Flex align="center" gap="1cqmin">
    {swatch}
    <Text fontSize="2cqmin" fontWeight="bold" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="0.08em">
      {label}
    </Text>
  </Flex>
);

export const VenueMapCard = ({ venues, selectedId, onSelect }) => {
  const pinned = venues.filter((v) => Number.isFinite(v.lat) && Number.isFinite(v.lon));
  const hasNeutralPins = pinned.some((v) => v.isNeutral);
  return (
  <Box
    h="100%"
    w="100%"
    containerType="size"
    position="relative"
    overflow="hidden"
    bg="#141416"
    border="1px solid rgba(255,255,255,0.07)"
    borderRadius="xl"
    display="flex"
    flexDirection="column"
  >
    <Flex align="center" gap="1cqmin" px="3cqmin" pt="3cqmin" flexShrink={0}>
      <Box w="0.4cqmin" h="2.2cqmin" bg="brand.500" />
      <Text fontSize="2cqmin" fontWeight="black" letterSpacing="0.4em" color="text.muted">
        THE MAP
      </Text>
    </Flex>

    <Box flex={1} minH={0} position="relative">
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 1050 }}
        width={800}
        height={520}
        style={{ width: "100%", height: "100%" }}
        role="img"
        aria-label="Map of every stadium and neutral site"
      >
        <Geographies geography={US_STATES_GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="rgba(255,255,255,0.04)"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={0.6}
                style={{ default: { outline: "none" }, hover: { outline: "none" }, pressed: { outline: "none" } }}
              />
            ))
          }
        </Geographies>

        {/* Largest pins first so small campus pins stay clickable on top.
            Unpinnable venues are filtered above — geoAlbersUsa returns null
            for a missing coordinate and Marker throws on it. */}
        {[...pinned]
          .sort((a, b) => (b.capacity ?? 0) - (a.capacity ?? 0))
          .map((v) => {
          const isSelected = v.id === selectedId;
          const r = pinRadius(v.capacity);
          const fill = v.isNeutral ? "transparent" : v.accent ?? "#E53E3E";
          const stroke = v.isNeutral ? "rgba(255,255,255,0.85)" : v.secondary ?? "#FFFFFF";
          return (
            <Marker key={v.id} coordinates={[v.lon, v.lat]} onClick={() => onSelect?.(v.id)} style={{ default: { cursor: "pointer" } }}>
              {isSelected && <circle r={r + 6} fill="none" stroke="#FFFFFF" strokeWidth={1.5} opacity={0.9} />}
              <circle r={r} fill={fill} stroke={stroke} strokeWidth={isSelected ? 2.2 : 1.4} fillOpacity={isSelected ? 1 : 0.85} />
              <title>{`${v.name} · ${v.location}${v.capacity ? ` · ${v.capacity.toLocaleString()}` : ""}`}</title>
            </Marker>
          );
        })}
      </ComposableMap>
    </Box>

    <Flex px="3cqmin" pb="2.5cqmin" gap="3cqmin" flexShrink={0} flexWrap="wrap">
      <Legend swatch={<Box w="2cqmin" h="2cqmin" borderRadius="full" bg="brand.500" />} label="Campus · team color" />
      {hasNeutralPins && <Legend swatch={<Box w="2cqmin" h="2cqmin" borderRadius="full" border="1px solid rgba(255,255,255,0.85)" />} label="Neutral site" />}
      <Legend swatch={<Flex align="center" gap="0.4cqmin"><Box w="1.2cqmin" h="1.2cqmin" borderRadius="full" bg="whiteAlpha.600" /><Box w="2.4cqmin" h="2.4cqmin" borderRadius="full" bg="whiteAlpha.600" /></Flex>} label="Size · capacity" />
    </Flex>
  </Box>
  );
};

export default VenueMapCard;
