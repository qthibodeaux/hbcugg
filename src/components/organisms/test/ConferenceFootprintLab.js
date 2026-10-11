import React, { useState } from "react";
import { Box, Flex, Grid, Image, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { ChevronLeft, ChevronRight } from "lucide-react";

// --- MOCK DATA FOR LAB ---
const SWAC_MOCK = {
  key: "SWAC",
  name: "Southwestern Athletic Conference",
  logo: "/assets/swaclogo.png",
  colors: { primary: "#6F2633", secondary: "#A2AAAD" },
  states: ["Alabama", "Arkansas", "Florida", "Louisiana", "Mississippi", "Texas"],
  cities: ["Jackson", "Birmingham", "New Orleans", "Houston", "Baton Rouge", "Little Rock", "Tallahassee", "Montgomery"],
};

const MEAC_MOCK = {
  key: "MEAC",
  name: "Mid-Eastern Athletic Conference",
  logo: "/assets/meaclogo.png",
  colors: { primary: "#4B0082", secondary: "#FFD100" },
  states: ["Delaware", "D.C.", "Maryland", "North Carolina", "South Carolina", "Virginia"],
  cities: ["Washington D.C.", "Baltimore", "Norfolk", "Richmond", "Durham", "Orangeburg", "Dover", "Raleigh"],
};

const STATE_ABBREVIATIONS = {
  Alabama: "AL", Arkansas: "AR", Delaware: "DE", "D.C.": "DC", Florida: "FL",
  Louisiana: "LA", Maryland: "MD", Mississippi: "MS", "North Carolina": "NC",
  "South Carolina": "SC", Texas: "TX", Virginia: "VA",
};

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const STATE_IDS = {
  Alabama: "01", Arkansas: "05", Delaware: "10", "D.C.": "11", Florida: "12",
  Louisiana: "22", Maryland: "24", Mississippi: "28", "North Carolina": "37",
  "South Carolina": "45", Texas: "48", Virginia: "51",
};

// --- SUBCOMPONENTS ---

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
    justifyContent="center"
    minH="18px"
    px={2}
    borderRadius="4px"
    border="1px solid"
    borderColor={`${color}44`}
    bg={`${color}12`}
    color="white"
    fontSize="9px"
    fontWeight="black"
    textTransform="uppercase"
  >
    {children}
  </Box>
);

// --- COMPACT VIEW ---
const LegendCompact = ({ conf }) => {
  const [index, setIndex] = useState(0);
  const cities = conf.cities || [];
  const next = () => setIndex((i) => (i + 1) % cities.length);
  const prev = () => setIndex((i) => (i - 1 + cities.length) % cities.length);
  
  return (
    <Box 
      h="full" bg="bg.secondary" borderRadius="8px" p={3} 
      borderLeft="4px solid" borderLeftColor={conf.colors.primary}
      display="flex" flexDirection="column" gap={2}
    >
      <Flex justify="space-between" align="center">
        <Text fontSize="1.2rem" fontWeight="black" color="white">{conf.key}</Text>
        <Image src={conf.logo} boxSize="20px" opacity={0.8} />
      </Flex>
      
      <SimpleGrid columns={3} gap={1}>
        {conf.states.map(s => (
          <Chip key={s} color={conf.colors.primary}>{STATE_ABBREVIATIONS[s] || s}</Chip>
        ))}
      </SimpleGrid>

      <Box mt="auto" bg="blackAlpha.400" p={1.5} borderRadius="6px" border="1px solid" borderColor="whiteAlpha.100">
        <Flex align="center" justify="space-between">
          <ChevronLeft size={14} onClick={prev} cursor="pointer" />
          <Text fontSize="10px" fontWeight="bold" lineClamp={1}>{cities[index]}</Text>
          <ChevronRight size={14} onClick={next} cursor="pointer" />
        </Flex>
      </Box>
    </Box>
  );
};

// --- STANDARD VIEW ---
const LegendStandard = ({ conf }) => (
  <Box 
    h="full" p={4} borderRadius="12px" position="relative" overflow="hidden"
    bg={`linear-gradient(135deg, ${conf.colors.primary}22 0%, transparent 100%)`}
    border="1px solid" borderColor="whiteAlpha.100"
  >
    <Image 
      src={conf.logo} position="absolute" right="-20px" bottom="-20px" 
      boxSize="120px" opacity={0.05} filter="grayscale(1)"
    />
    
    <VStack align="stretch" spacing={4} h="full">
      <Box>
        <Eyebrow color={conf.colors.secondary}>{conf.name}</Eyebrow>
        <Text fontSize="2.4rem" fontWeight="black" lineHeight={1} mt={1}>{conf.key}</Text>
      </Box>

      <Box>
        <Eyebrow mb={2}>Footprint States</Eyebrow>
        <Flex gap={2} wrap="wrap">
          {conf.states.map(s => (
            <Chip key={s} color={conf.colors.primary}>{s}</Chip>
          ))}
        </Flex>
      </Box>

      <Box mt="auto">
        <Eyebrow mb={2}>Primary Markets</Eyebrow>
        <SimpleGrid columns={2} gap={2}>
          {conf.cities.slice(0, 4).map(c => (
            <Text key={c} fontSize="11px" fontWeight="bold" color="whiteAlpha.800">
              • {c}
            </Text>
          ))}
        </SimpleGrid>
      </Box>
    </VStack>
  </Box>
);

// --- MAP ENGINE ---
const MapEngine = () => {
  const REGION_IDS = new Set(Object.values(STATE_IDS));
  return (
    <Box w="full" h="full" bg="#050505" borderRadius="12px" overflow="hidden" border="1px solid" borderColor="whiteAlpha.100">
      <ComposableMap projection="geoAlbersUsa" style={{ width: "100%", height: "100%" }}>
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies
              .filter((geo) => REGION_IDS.has(geo.id))
              .map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#1A1A1D"
                  stroke="#333"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#2A2A2D", outline: "none" },
                  }}
                />
              ))
          }
        </Geographies>
      </ComposableMap>
    </Box>
  );
};

// --- EXPORTS ---

export const ConferenceFootprintStandardLab = () => (
  <Grid templateColumns="1fr 340px" gap={4} w="full" h="full" p={4} bg="bg.primary">
    <MapEngine />
    <VStack spacing={4} align="stretch">
      <LegendStandard conf={SWAC_MOCK} />
      <LegendStandard conf={MEAC_MOCK} />
    </VStack>
  </Grid>
);

export const ConferenceFootprintCompactLab = () => (
  <Grid templateColumns="1fr 180px" gap={2} w="full" h="full" p={2} bg="bg.primary">
    <MapEngine />
    <Flex direction="column" gap={2}>
      <LegendCompact conf={SWAC_MOCK} />
      <LegendCompact conf={MEAC_MOCK} />
    </Flex>
  </Grid>
);
