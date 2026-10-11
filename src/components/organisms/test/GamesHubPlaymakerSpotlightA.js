import React from 'react';
import { Box, Flex, Text, Heading, Image, Badge } from '@chakra-ui/react';

// Mock data for a star player
const PLAYMAKER = {
  name: "SHEDEUR SANDERS",
  teamId: "jackson-state",
  teamShort: "JSU",
  gloryScore: 94.2,
  stat: "4 TD / 382 YDS",
  status: "GAME CHANGER",
  image: "https://dbukjj6uep9pa.cloudfront.net/wp-content/uploads/2022/10/Shedeur-Sanders-1.jpg", // Example real URL pattern
  teamColor: "#002147"
};

/**
 * GamesHubPlaymakerSpotlightA
 * Size: 1x1
 * Pattern: 'player avy' + 'recessed dark tile'
 */
export const GamesHubPlaymakerSpotlightA = () => {
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
      {/* Player Image - Dramatic Crop */}
      <Image 
        src={PLAYMAKER.image} 
        objectFit="cover" 
        w="full" 
        h="full" 
        filter="grayscale(40%) contrast(110%)"
      />
      
      {/* Team Color Overlay Gradient */}
      <Box 
        position="absolute"
        top={0}
        left={0}
        w="full"
        h="full"
        bgGradient={`linear(to-t, ${PLAYMAKER.teamColor}EE 0%, ${PLAYMAKER.teamColor}33 50%, transparent 100%)`}
      />

      {/* Content Layer */}
      <Flex 
        direction="column" 
        h="full" 
        p={4} 
        position="relative" 
        zIndex={2}
        justify="space-between"
      >
        <Flex justify="space-between" align="start">
          <Badge variant="solid" bg="brand.500" fontSize="10px" px={2}>
            {PLAYMAKER.status}
          </Badge>
          <Box textAlign="right">
            <Text fontSize="xs" fontWeight="bold" color="whiteAlpha.800">{PLAYMAKER.teamShort}</Text>
          </Box>
        </Flex>

        <Box>
          <Text fontSize="10px" fontWeight="bold" color="whiteAlpha.700" mb={-1}>
            WEEK 12 MVP CANDIDATE
          </Text>
          <Heading size="md" color="white" letterSpacing="tighter" textTransform="uppercase">
            {PLAYMAKER.name}
          </Heading>
          <Text fontSize="sm" fontWeight="black" color="brand.400">
            {PLAYMAKER.stat}
          </Text>
        </Box>

        {/* Recessed Score Tile */}
        <Box 
          bg="blackAlpha.800" 
          p={3} 
          borderRadius="sm" 
          border="1px solid"
          borderColor="whiteAlpha.100"
          boxShadow="inset 0 0 15px rgba(0,0,0,0.8)"
        >
          <Flex justify="space-between" align="center">
            <Box>
              <Text fontSize="8px" fontWeight="bold" color="whiteAlpha.600" textTransform="uppercase">
                Glory Rating
              </Text>
              <Text fontSize="xl" fontWeight="black" color="white" lineHeight="1">
                {PLAYMAKER.gloryScore}
              </Text>
            </Box>
            <Box textAlign="right">
              <Text fontSize="8px" fontWeight="bold" color="whiteAlpha.500">
                PERCENTILE
              </Text>
              <Text fontSize="xs" fontWeight="bold" color="white">
                99.8th
              </Text>
            </Box>
          </Flex>
        </Box>
      </Flex>

      {/* Decorative Scanline */}
      <Box position="absolute" top={0} left={0} w="full" h="2px" bg="whiteAlpha.200" opacity={0.3} />
    </Box>
  );
};
