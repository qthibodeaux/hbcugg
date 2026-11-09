import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";
import { STATE_FIPS, StateShape, US_STATES_GEO_URL } from "../../maps";
import { CardShell } from "./RosterCardPrimitives";
import { Flex, Text, SimpleGrid, Box } from "@chakra-ui/react";
import { getRecruitingMapPalette, isLightColor, mixColors, formatPercent, formatNumber } from "./rosterCardModel";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

export const RosterGeographyCard = ({ model, accent, secondaryAccent, tertiaryAccent }) => {
  const { isMobile } = useLayoutDensity();
  const states = model.geographic.stateDistribution.filter((item) => STATE_FIPS[item.state]).slice(0, 18);

  if (!states.length) {
    return (
      <CardShell title="Recruiting Map" accent={accent}>
        <Flex h="calc(100% - 24px)" align="center" justify="center">
          <Text fontSize="11px" color="text.muted" fontWeight="bold" textAlign="center" maxW="70%">
            Geographic data not available for this team yet.
          </Text>
        </Flex>
      </CardShell>
    );
  }
  const topStates = states.slice(0, 3);
  const otherStates = states.slice(3);
  const maxCount = topStates[0]?.count || 1;
  const countByState = new Map(states.map((item) => [item.state, item.count]));
  const topStateIds = new Set(topStates.map((item) => STATE_FIPS[item.state]));
  const mapPalette = getRecruitingMapPalette(accent, secondaryAccent, tertiaryAccent);
  const topColors = mapPalette.topFills;
  const topTextColors = topColors.map((color) => (isLightColor(color) ? "#0B0B0D" : "#FFFFFF"));
  const heatColor = (stateAbbr) => {
    const count = countByState.get(stateAbbr) ?? 0;
    if (count <= 0) return mapPalette.noDataFill;
    const strength = Math.max(0.12, Math.min(1, count / maxCount));
    if (strength > 0.72) return mapPalette.high;
    if (strength > 0.34) return mixColors(mapPalette.mid, mapPalette.high, (strength - 0.34) / 0.38);
    return mixColors(mapPalette.low, mapPalette.mid, strength / 0.34);
  };

  return (
    <CardShell title="Recruiting Map" accent={mapPalette.topFills[0]}>
      <Flex direction="column" h="calc(100% - 24px)" gap={3} minH={0}>
        <SimpleGrid columns={3} gap={3}>
          <Box>
            <Text fontSize="3xl" color={mapPalette.topFills[0]} fontWeight="black" lineHeight="1">
              {formatPercent(model.kpis.inStatePct)}
            </Text>
            <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">
              In-State
            </Text>
          </Box>
          <Box>
            <Text fontSize="3xl" color="text.primary" fontWeight="black" lineHeight="1">
              {model.kpis.avgDistance ? formatNumber(model.kpis.avgDistance) : "--"}
            </Text>
            <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">
              Avg Miles
            </Text>
          </Box>
          <Box>
            <Text fontSize="3xl" color={mapPalette.topFills[1]} fontWeight="black" lineHeight="1">
              {model.geographic.stateDistribution.length}
            </Text>
            <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">
              States
            </Text>
          </Box>
        </SimpleGrid>

        <SimpleGrid columns={3} gap={2} minH="116px">
          {topStates.map((item, index) => (
            <Flex key={item.state} direction="column" minW={0} minH={0} overflow="hidden">
              <Box flex="1" minH="72px">
                <StateShape
                  state={item.state}
                  fill={topColors[index]}
                  stroke={index === 2 ? mapPalette.outline : mapPalette.strongOutline}
                  strokeWidth={1.1}
                  padding={5}
                />
              </Box>
              <Box pt={1} color={topTextColors[index]}>
                {/* Was "{state}-{count}" — the hyphen made "AL-55" read as a
                    single code rather than a state and its player count. */}
                <Text fontSize="lg" fontWeight="black" lineHeight="0.95" textTransform="uppercase" color={topColors[index]} lineClamp={1}>
                  {item.state}: {item.count}
                </Text>
                <Text mt="2px" fontSize="7px" fontWeight="black" textTransform="uppercase" letterSpacing="0.08em" color="text.secondary" lineClamp={1}>
                  players
                </Text>
              </Box>
            </Flex>
          ))}
        </SimpleGrid>

        <Box flex="1" minH="150px" border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" overflow="hidden" bg={mapPalette.mapBg}>
          <ComposableMap projection="geoAlbersUsa" style={{ width: "100%", height: "100%" }}>
            <Geographies geography={US_STATES_GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const id = String(geo.id).padStart(2, "0");
                  const stateAbbr = Object.keys(STATE_FIPS).find((key) => STATE_FIPS[key] === id);
                  const hasData = stateAbbr ? (countByState.get(stateAbbr) ?? 0) > 0 : false;
                  const fill = stateAbbr ? heatColor(stateAbbr) : mapPalette.noDataFill;
                  const stroke = topStateIds.has(id)
                    ? mapPalette.strongOutline
                    : hasData
                      ? mapPalette.outline
                      : mapPalette.noDataStroke;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={topStateIds.has(id) ? 1.25 : hasData ? 0.7 : 0.4}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none", fill },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        </Box>

        <Flex gap={1.5} wrap="wrap">
          {otherStates.map((item) => (
            <Box key={item.state} px={2} py="3px" borderRadius={isMobile ? 0 : "sm"} bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.100">
              <Text fontSize="9px" color="text.secondary" fontWeight="black" textTransform="uppercase">
                {item.state}: {item.count}
              </Text>
            </Box>
          ))}
        </Flex>
      </Flex>
    </CardShell>
  );
};
