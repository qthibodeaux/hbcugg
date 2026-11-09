import { Text, Box, Grid, Flex, Image, VStack, SimpleGrid } from "@chakra-ui/react";
import { useState } from "react";
import { STATE_ABBREVIATIONS } from "./footprintModel";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

export const CompactConferenceLegend = ({ conf }) => {
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

export const ConferenceLegend = ({ conf }) => (
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
