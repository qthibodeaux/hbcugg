import React from 'react';
import { Box, Flex, Text, Image, Heading } from '@chakra-ui/react';

/**
 * GamesHubVintageCardA
 * Concept: 1989-style physical sports card. 
 * Features: Cream "cardstock" borders, script player names, grainy texture.
 */
export const GamesHubVintageCardA = () => {
  const player = {
    name: "Shedeur Sanders",
    team: "Jackson State",
    position: "Quarterback",
    year: "1989 COLLECTION", // Aesthetic choice
    img: "https://dbukjj6uep9pa.cloudfront.net/wp-content/uploads/2022/10/Shedeur-Sanders-1.jpg"
  };

  return (
    <Box 
      w="full" 
      h="full" 
      bg="#F4F1E1" // Aged cardstock color
      p={2}
      position="relative"
      boxShadow="lg"
      border="1px solid #D1CCA4"
    >
      {/* Inner Image Frame */}
      <Box 
        w="full" 
        h="80%" 
        border="4px solid" 
        borderColor="#002147" 
        overflow="hidden"
        position="relative"
      >
        <Image 
          src={player.img} 
          w="full" h="full" 
          objectFit="cover" 
          filter="sepia(0.2) contrast(1.2) brightness(0.9)"
        />
        
        {/* Vintage Top Left Badge */}
        <Box 
          position="absolute" 
          top={0} 
          left={0} 
          bg="#002147" 
          px={2} 
          py={1} 
          borderBottomRightRadius="md"
        >
          <Text fontSize="8px" fontWeight="black" color="white" letterSpacing="1px">JSU TIGERS</Text>
        </Box>

        {/* Grainy Texture Overlay */}
        <Box 
          position="absolute" 
          inset={0} 
          opacity={0.15} 
          pointerEvents="none"
          bgImage="url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')"
        />
      </Box>

      {/* Card Footer */}
      <Flex direction="column" justify="center" h="20%" px={1}>
        <Heading 
          fontSize="md" 
          color="#002147" 
          fontFamily="'Brush Script MT', cursive" // script font vibe
          transform="rotate(-2deg)"
        >
          {player.name}
        </Heading>
        <Flex justify="space-between" align="baseline">
          <Text fontSize="10px" fontWeight="black" color="gray.600">
            {player.position}
          </Text>
          <Box bg="#002147" color="white" px={1} fontSize="8px" fontWeight="bold">
            #21
          </Box>
        </Flex>
      </Flex>

      {/* Card Year Stamp */}
      <Text position="absolute" bottom={1} right={1} fontSize="6px" color="gray.400" fontWeight="bold">
        {player.year}
      </Text>
    </Box>
  );
};
