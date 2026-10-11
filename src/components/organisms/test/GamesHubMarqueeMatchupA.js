import React from 'react';
import { Box, Flex, Text, Heading, Image, Grid } from '@chakra-ui/react';

// Mock data for the Florida Classic
const MATCHUP = {
  title: "FLORIDA CLASSIC",
  subtitle: "ORLANDO, FL",
  ghost: "RIVALRY",
  teams: [
    { name: "B-CU", mascot: "Wildcats", logo: "/assets/swacbcu.svg", color: "#6F2633", record: "4-6" },
    { name: "FAMU", mascot: "Rattlers", logo: "/assets/swacfamu.svg", color: "#006747", record: "8-2" }
  ],
  meta: "SATURDAY 2:30 PM • ESPN+"
};

/**
 * GamesHubMarqueeMatchupA
 * Size: 2x1 (Wide)
 * Pattern: 'schoolbanner' + 'watermark' + 'team gradient'
 */
export const GamesHubMarqueeMatchupA = () => {
  return (
    <Box 
      w="full" 
      h="full" 
      bg="bg.secondary" 
      position="relative" 
      overflow="hidden"
      border="1px solid"
      borderColor="whiteAlpha.100"
    >
      {/* Giant Ghost Watermark */}
      <Text
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        fontSize="120px"
        fontWeight="900"
        color="whiteAlpha.05"
        whiteSpace="nowrap"
        zIndex={0}
        userSelect="none"
        pointerEvents="none"
      >
        {MATCHUP.ghost}
      </Text>

      {/* Content Layer */}
      <Flex direction="column" h="full" position="relative" zIndex={1}>
        
        {/* Top Editorial Bar */}
        <Flex justify="space-between" align="center" px={6} py={3} borderBottom="1px solid" borderColor="whiteAlpha.100">
          <Box>
            <Text fontSize="10px" fontWeight="black" color="brand.500" letterSpacing="2px">
              LIVE FROM THE CAMPUS
            </Text>
            <Heading size="sm" color="white">{MATCHUP.title}</Heading>
          </Box>
          <Text fontSize="xs" fontWeight="bold" color="whiteAlpha.600">{MATCHUP.subtitle}</Text>
        </Flex>

        {/* Main Matchup Body */}
        <Grid templateColumns="1fr 100px 1fr" flex={1} px={10} alignItems="center">
          
          {/* Team A */}
          <Flex direction="column" align="center" gap={2}>
            <Box position="relative">
               {/* Team Gradient Backdrop */}
              <Box position="absolute" inset="-20px" bgGradient={`radial(${MATCHUP.teams[0].color}44 0%, transparent 70%)`} zIndex={-1} />
              <Image src={MATCHUP.teams[0].logo} w="80px" h="80px" />
            </Box>
            <Box textAlign="center">
              <Heading size="md" color="white">{MATCHUP.teams[0].name}</Heading>
              <Text fontSize="10px" fontWeight="bold" color="whiteAlpha.600">{MATCHUP.teams[0].record}</Text>
            </Box>
          </Flex>

          {/* VS Divider */}
          <Flex direction="column" align="center">
            <Box w="1px" h="40px" bg="whiteAlpha.200" />
            <Text fontSize="lg" fontWeight="black" color="whiteAlpha.400" my={2}>VS</Text>
            <Box w="1px" h="40px" bg="whiteAlpha.200" />
          </Flex>

          {/* Team B */}
          <Flex direction="column" align="center" gap={2}>
             <Box position="relative">
              <Box position="absolute" inset="-20px" bgGradient={`radial(${MATCHUP.teams[1].color}44 0%, transparent 70%)`} zIndex={-1} />
              <Image src={MATCHUP.teams[1].logo} w="80px" h="80px" />
            </Box>
            <Box textAlign="center">
              <Heading size="md" color="white">{MATCHUP.teams[1].name}</Heading>
              <Text fontSize="10px" fontWeight="bold" color="whiteAlpha.600">{MATCHUP.teams[1].record}</Text>
            </Box>
          </Flex>

        </Grid>

        {/* Bottom Ticker */}
        <Flex 
          bg="blackAlpha.400" 
          px={6} 
          py={2} 
          justify="center" 
          borderTop="1px solid" 
          borderColor="whiteAlpha.100"
        >
          <Text fontSize="xs" fontWeight="black" letterSpacing="1px" color="whiteAlpha.900">
            {MATCHUP.meta}
          </Text>
        </Flex>
      </Flex>

      {/* Accent Corner */}
      <Box position="absolute" bottom={0} right={0} w="40px" h="40px" bgGradient="linear(to-br, transparent 50%, brand.500 50%)" opacity={0.8} />
    </Box>
  );
};
