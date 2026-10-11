import React, { useState } from "react";
import { Box, Flex, Grid, Image, Text, SimpleGrid, Circle } from "@chakra-ui/react";
import { Trophy } from "lucide-react";
import useMountEffect from "../../../hooks/useMountEffect";

const ConferencePanelCompact = ({ conf }) => {
  const isSWAC = conf.key === "SWAC";

  return (
    <Box
      h="full"
      w="full"
      minW={0}
      overflow="hidden"
      borderRadius="8px"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg={`linear-gradient(135deg, ${conf.colors.primary}3d 0%, rgba(15,15,18,1) 50%, rgba(8,8,10,1) 100%)`}
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        insetInlineStart: 0,
        top: 0,
        bottom: 0,
        width: "3px",
        bg: conf.colors.primary,
        opacity: 0.9,
      }}
    >
      <Image
        src={conf.logo}
        alt=""
        position="absolute"
        right="-10%"
        top="18%"
        boxSize="clamp(140px, 19vw, 230px)"
        opacity={0.075}
        filter="grayscale(1) brightness(1.4)"
        pointerEvents="none"
      />
      <Text
        position="absolute"
        left="5%"
        bottom="-22px"
        fontSize="clamp(6rem, 14vw, 11rem)"
        color="white"
        fontWeight="black"
        opacity={0.045}
        lineHeight={0.75}
        letterSpacing="-0.08em"
        pointerEvents="none"
      >
        {conf.key}
      </Text>

      <Box h="100%" p={{ base: 3, xl: 4 }} position="relative" zIndex={1} display="flex" flexDirection="column" minW={0}>
        <Flex align="start" justify="space-between" gap={3} flexShrink={0}>
          <Box minW={0} flex={1}>
            <Text fontSize="8px" color={conf.colors.secondary} fontWeight="black" textTransform="uppercase" letterSpacing="0.16em" lineClamp={1}>
              {conf.name}
            </Text>
            <Flex align="center" gap={3} mt={1} minW={0}>
              <Text fontSize="clamp(3.2rem, 8vw, 5.6rem)" color="white" fontWeight="black" lineHeight={0.82} textTransform="uppercase" letterSpacing="-0.06em">
                {conf.key}
              </Text>
              <Image src={conf.logo} boxSize="clamp(28px, 4vw, 44px)" objectFit="contain" flexShrink={0} />
            </Flex>
            <Text mt={1.5} fontSize="10px" color={conf.colors.secondary} fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={1.25} lineClamp={2}>
              "{conf.slogan}"
            </Text>
          </Box>

          <Flex gap={3} flexShrink={0}>
            {[
              ["Programs", conf.members.split(" ")[0]],
              ["Bowl Wins", conf.celebrationRecord.split(" ")[0]],
            ].map(([label, value]) => (
              <Box key={label} minW="42px">
                <Text fontSize="7px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em" lineClamp={1}>
                  {label}
                </Text>
                <Text fontSize="xl" color={conf.colors.secondary} fontWeight="black" lineHeight={1}>
                  {value}
                </Text>
              </Box>
            ))}
          </Flex>
        </Flex>

        <Grid templateColumns="1.65fr 0.9fr" gap={3} flex={1} minH={0} mt={3}>
          <Box bg="rgba(255,255,255,0.055)" p={{ base: 3, xl: 4 }} borderRadius="8px" border="1px solid" borderColor="whiteAlpha.100" minW={0} overflow="hidden">
            <Text fontSize="10px" fontWeight="black" color="brand.400" textTransform="uppercase" letterSpacing="0.12em" mb={2}>
              Identity Profile
            </Text>
            <Text fontSize="clamp(0.9rem, 1.45vw, 1.18rem)" fontWeight="black" color="white" lineHeight={1.35} lineClamp={5}>
              {conf.identity}
            </Text>
          </Box>

          <Box bg="rgba(0,0,0,0.38)" p={{ base: 2.5, xl: 3 }} borderRadius="8px" border="1px solid" borderColor="whiteAlpha.100" minW={0} overflow="hidden">
            <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em" mb={2}>
              Admin
            </Text>
            <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" lineClamp={1}>Commissioner</Text>
            <Text fontSize="clamp(0.82rem, 1.35vw, 1.05rem)" color="white" fontWeight="black" lineHeight={1.05} lineClamp={2} mb={2}>
              {conf.commissioner}
            </Text>
            <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" lineClamp={1}>Structure</Text>
            <Text fontSize="sm" color="white" fontWeight="black" lineHeight={1.1} lineClamp={2} mb={2}>
              {isSWAC ? "Divisional" : "Single Table"}
            </Text>
            <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" lineClamp={1}>HQ</Text>
            <Text fontSize="xs" color="text.secondary" fontWeight="bold" lineClamp={1}>
              {conf.hq}
            </Text>
          </Box>
        </Grid>
      </Box>
    </Box>
  );
};

const ConferencePanelStandard = ({ conf }) => {
  const isSWAC = conf.key === "SWAC";
  
  return (
    <Box
      h="full"
      w="full"
      minW={0}
      overflow="hidden"
      borderRadius="8px"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg={`linear-gradient(135deg, ${conf.colors.primary}44 0%, rgba(20,20,22,1) 48%, rgba(11,11,13,1) 100%)`}
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        insetInlineStart: 0,
        top: 0,
        bottom: 0,
        width: "3px",
        bg: conf.colors.primary,
        opacity: 0.9,
      }}
    >
      <Image
        src={conf.logo}
        alt=""
        position="absolute"
        right="-2%"
        top="-5%"
        boxSize="340px"
        opacity={0.07}
        filter="grayscale(1) brightness(1.5)"
        pointerEvents="none"
        zIndex={0}
      />

      <Box h="100%" p={5} position="relative" zIndex={1} display="flex" flexDirection="column">
        {/* TOP ROW: HERO BRANDING */}
        <Flex justify="space-between" align="flex-start" mb={6}>
          <Box>
             <Text fontSize="8px" color={conf.colors.secondary} fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
                {conf.name}
              </Text>
            <Flex align="center" gap={4} mt={1}>
              <Text 
                fontSize="6xl" 
                color="white" 
                fontWeight="black" 
                lineHeight={1} 
                textTransform="uppercase"
                letterSpacing="-0.04em"
              >
                {conf.key}
              </Text>
              <Image src={conf.logo} boxSize="48px" objectFit="contain" />
            </Flex>
            <Text fontSize="11px" fontStyle="italic" color={conf.colors.secondary} fontWeight="black" mt={2} textTransform="uppercase" letterSpacing="0.05em">
              "{conf.slogan}"
            </Text>
          </Box>
          
          <SimpleGrid columns={2} spacing={10}>
             <Box minW={0}>
                <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em" lineClamp={1} mb={0.5}>
                  Programs
                </Text>
                <Text fontSize="md" color={conf.colors.secondary} fontWeight="black" lineHeight={1.1}>
                  {conf.members.split(" ")[0]}
                </Text>
              </Box>
              <Box minW={0}>
                <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em" lineClamp={1} mb={0.5}>
                  Bowl Wins
                </Text>
                <Text fontSize="md" color={conf.colors.secondary} fontWeight="black" lineHeight={1.1}>
                  {conf.celebrationRecord.split(" ")[0]}
                </Text>
              </Box>
          </SimpleGrid>
        </Flex>

        {/* MIDDLE SECTION: THE CORE CONTENT BENTO */}
        <SimpleGrid columns={3} spacing={6} flex={1}>
          {/* Identity & Mission */}
          <Box gridColumn="span 2">
            <Box bg="whiteAlpha.50" p={5} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" backdropFilter="blur(12px)" h="full">
              <Text fontSize="sm" fontWeight="black" color="brand.400" textTransform="uppercase" mb={2} letterSpacing="0.1em">Identity Profile</Text>
              <Text fontSize="md" fontWeight="bold" color="text.primary" lineHeight={1.6}>
                {conf.identity}
              </Text>
              <Text fontSize="sm" color="text.secondary" mt={3} fontStyle="italic">
                {conf.gameStyle}
              </Text>
            </Box>
          </Box>

          {/* Governance & HQ */}
          <Box>
            <Box bg="rgba(0,0,0,0.4)" p={5} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" h="full">
              <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" mb={4}>Administration</Text>
               <Box minW={0} mb={4}>
                <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em" lineClamp={1} mb={0.5}>
                  Commissioner
                </Text>
                <Text fontSize="md" color="white" fontWeight="black" lineHeight={1.1}>
                  {conf.commissioner}
                </Text>
              </Box>
               <Box minW={0} mb={4}>
                <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em" lineClamp={1} mb={0.5}>
                  Structure
                </Text>
                <Text fontSize="md" color="white" fontWeight="black" lineHeight={1.1}>
                  {isSWAC ? "Divisional" : "Single Table"}
                </Text>
              </Box>
              <Box pt={4} borderTop="1px solid" borderColor="whiteAlpha.100">
                <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" mb={1}>HQ Location</Text>
                <Text fontSize="sm" fontWeight="black" color="white">{conf.hq}</Text>
              </Box>
            </Box>
          </Box>

          {/* Footprint: States */}
          <Box>
            <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" mb={3} letterSpacing="0.1em">Member States</Text>
            <Flex gap={2} flexWrap="wrap">
              {conf.states.map((state) => (
                <Box 
                  key={state} 
                  bg={`${conf.colors.primary}aa`} 
                  border="1px solid" 
                  borderColor="whiteAlpha.200" 
                  px={3} 
                  py={1.5} 
                  borderRadius="999px"
                >
                   <Text fontSize="10px" color="white" fontWeight="bold" lineClamp={1}>
                      {state}
                    </Text>
                </Box>
              ))}
            </Flex>
          </Box>

          {/* Footprint: Market Hubs */}
          <Box gridColumn="span 2">
            <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" mb={3} letterSpacing="0.1em">Key Market Hubs (Strategic Centers)</Text>
            <SimpleGrid columns={4} spacing={2}>
              {conf.cities.map((city) => (
                <Box key={city} bg="whiteAlpha.50" px={3} py={2} borderRadius="md" border="1px solid" borderColor="whiteAlpha.100">
                  <Text fontSize="10px" color="white" fontWeight="black" textAlign="center">{city}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        </SimpleGrid>

        {/* BOTTOM ROW: RECOGNITION */}
        <Flex gap={4} mt={8} align="flex-end">
          <Box flex={1.2}>
             <TitleCarousel titles={conf.titles} color={conf.colors.secondary} />
          </Box>
          
          <Box flex={1}>
            <Box bg="rgba(0,0,0,0.6)" p={3.5} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" position="relative">
              <Trophy size={16} style={{ position: 'absolute', top: 12, right: 12, opacity: 0.3 }} color={conf.colors.secondary} />
              <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" mb={2}>Reigning Champion</Text>
              <Flex align="center" gap={3}>
                <Image src={conf.recentChamp.logo} boxSize="28px" objectFit="contain" />
                <Box>
                  <Text fontSize="11px" fontWeight="black" color="white">{conf.recentChamp.year} Champion</Text>
                  <Text fontSize="14px" fontWeight="black" color={conf.colors.secondary}>{conf.recentChamp.name}</Text>
                </Box>
              </Flex>
            </Box>
          </Box>

          <Box w="120px" bg="whiteAlpha.50" p={3.5} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" textAlign="center">
            <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" mb={1}>Est.</Text>
            <Text fontSize="2xl" fontWeight="black" color="white" lineHeight={1}>{conf.founded}</Text>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export const ConferencePanel = ({ conf, variant = "standard" }) => {
  if (variant === "compact") return <ConferencePanelCompact conf={conf} />;
  return <ConferencePanelStandard conf={conf} />;
};

const TitleCarousel = ({ titles, color }) => {
  const [index, setIndex] = useState(0);

  useMountEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % titles.length);
    }, 3000);
    return () => clearInterval(interval);
  });

  const current = titles[index];

  return (
    <Box bg="rgba(0,0,0,0.3)" p={2.5} borderRadius="lg" border="1px solid" borderColor="whiteAlpha.100">
      <Text fontSize="8px" fontWeight="black" color="text.muted" textTransform="uppercase" mb={2} letterSpacing="0.1em">Historical Power</Text>
      <Flex align="center" gap={3}>
        <Box position="relative">
          <Circle size="32px" bg="whiteAlpha.100" />
          <Image 
            src={current.logo} 
            boxSize="22px" 
            position="absolute" 
            top="50%" 
            left="50%" 
            transform="translate(-50%, -50%)" 
            objectFit="contain" 
          />
        </Box>
        <Box>
          <Text fontSize="11px" fontWeight="black" color="white" lineClamp={1}>{current.name}</Text>
          <Text fontSize="9px" fontWeight="black" color={color}>{current.count} Conference Titles</Text>
        </Box>
      </Flex>
    </Box>
  );
};
