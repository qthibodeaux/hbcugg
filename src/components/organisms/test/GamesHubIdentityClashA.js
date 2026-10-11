import React from 'react';
import { Box, Flex, Text, Image, Heading } from '@chakra-ui/react';

// Mock data extracted from JSU vs FAMU 2024
const CLASH_DATA = {
  metric: "SUCCESS RATE",
  teams: [
    {
      id: "jackson-state",
      shortName: "JSU",
      color: "#002147",
      value: "48.2%",
      logo: "/assets/swacjsu.svg",
      label: "GROUND GAME"
    },
    {
      id: "famu",
      shortName: "FAMU",
      color: "#006747",
      value: "42.1%",
      logo: "/assets/swacfamu.svg",
      label: "AIR RAID"
    }
  ]
};

/**
 * GamesHubIdentityClashA
 * Size: 1x1
 * Pattern: 'diagonal split' + 'team gradient'
 */
export const GamesHubIdentityClashA = () => {
  const [teamA, teamB] = CLASH_DATA.teams;

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
      {/* Diagonal Split Background */}
      <Box 
        position="absolute"
        top={0}
        left={0}
        w="full"
        h="full"
        bgGradient={`linear(to-br, ${teamA.color}CC 0%, transparent 50%, ${teamB.color}CC 100%)`}
      />

      <Flex 
        direction="column" 
        h="full" 
        p={4} 
        position="relative" 
        zIndex={1}
        justify="space-between"
      >
        {/* Header */}
        <Flex justify="space-between" align="start">
          <Box>
            <Text fontSize="xs" fontWeight="bold" letterSpacing="widest" color="whiteAlpha.600">
              IDENTITY CLASH
            </Text>
            <Heading size="sm" color="white" textTransform="uppercase">
              {CLASH_DATA.metric}
            </Heading>
          </Box>
          <Box bg="brand.500" w="2px" h="20px" />
        </Flex>

        {/* Team A (Top Left-ish) */}
        <Flex align="center" gap={3}>
          <Image src={teamA.logo} w="40px" h="40px" filter="drop-shadow(0 0 8px rgba(0,0,0,0.5))" />
          <Box>
            <Text fontSize="2xl" fontWeight="black" color="white" lineHeight="1">
              {teamA.value}
            </Text>
            <Text fontSize="10px" fontWeight="bold" color="whiteAlpha.700" textTransform="uppercase">
              {teamA.shortName} {teamA.label}
            </Text>
          </Box>
        </Flex>

        {/* The VS Divider Line */}
        <Box w="40%" h="1px" bg="whiteAlpha.200" alignSelf="center" transform="rotate(-15deg)" />

        {/* Team B (Bottom Right-ish) */}
        <Flex align="center" gap={3} justify="flex-end" textAlign="right">
          <Box>
            <Text fontSize="2xl" fontWeight="black" color="white" lineHeight="1">
              {teamB.value}
            </Text>
            <Text fontSize="10px" fontWeight="bold" color="whiteAlpha.700" textTransform="uppercase">
              {teamB.shortName} {teamB.label}
            </Text>
          </Box>
          <Image src={teamB.logo} w="40px" h="40px" filter="drop-shadow(0 0 8px rgba(0,0,0,0.5))" />
        </Flex>

        {/* Footer Ticker */}
        <Box borderTop="1px solid" borderColor="whiteAlpha.100" pt={2}>
          <Text fontSize="9px" fontWeight="bold" color="whiteAlpha.500" letterSpacing="tighter">
            ADVANCED METRIC: SUCCESS PER SCRIMMAGE PLAY
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};
