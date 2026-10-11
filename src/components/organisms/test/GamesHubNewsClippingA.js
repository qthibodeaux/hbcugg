import React from 'react';
import { Box, Flex, Text, Heading, Image, Grid } from '@chakra-ui/react';

/**
 * GamesHubNewsClippingA
 * Concept: Old newspaper "Extra" edition clipping.
 * Features: Halftone backgrounds, serif headlines, monochrome-ish palette.
 */
export const GamesHubNewsClippingA = () => {
  return (
    <Box 
      w="full" 
      h="full" 
      bg="#E5E5E5" 
      p={4}
      position="relative"
      overflow="hidden"
      border="1px solid #CCC"
      boxShadow="inner"
    >
      {/* Newsprint Halftone Texture */}
      <Box 
        position="absolute" 
        inset={0} 
        opacity={0.1} 
        pointerEvents="none"
        backgroundImage="radial-gradient(circle, #000 1px, transparent 1px)"
        backgroundSize="3px 3px"
      />

      <Grid templateColumns="1.2fr 1fr" h="full" gap={6} position="relative" zIndex={1}>
        {/* Left Side: Editorial */}
        <Flex direction="column" justify="space-between">
          <Box>
            <Flex align="center" gap={2} mb={2}>
               <Box bg="black" color="white" px={1} py={0.5} fontSize="8px" fontWeight="black">EXTRA</Box>
               <Text fontSize="9px" fontWeight="bold" color="black" letterSpacing="1px">SATURDAY, NOV 14, 2024</Text>
            </Flex>
            <Heading 
              fontFamily="serif" 
              fontSize="4xl" 
              color="black" 
              lineHeight="0.9" 
              letterSpacing="-1px"
              textTransform="none"
            >
              "The Greatest Game Ever Played in the SWAC"
            </Heading>
          </Box>

          <Box borderTop="2px solid black" pt={2}>
             <Text fontSize="xs" fontFamily="serif" color="black" lineHeight="1.2" lineClamp={3}>
                ORLANDO — In a display of pure gridiron dominance, the Rattlers secured a legendary victory that 
                historians will study for decades. The atmosphere was electric as the final whistle blew...
             </Text>
             <Text mt={2} fontSize="9px" fontWeight="black" color="black">READ MORE ON PAGE 4 →</Text>
          </Box>
        </Flex>

        {/* Right Side: Visual Clipping */}
        <Box position="relative">
           {/* The "Ripped" Image Effect */}
           <Box 
             w="full" 
             h="full" 
             bg="black" 
             transform="rotate(2deg)" 
             boxShadow="md"
             overflow="hidden"
             border="4px solid white"
           >
             <Image 
               src="https://dbukjj6uep9pa.cloudfront.net/wp-content/uploads/2022/10/Shedeur-Sanders-1.jpg"
               w="full"
               h="full"
               objectFit="cover"
               filter="grayscale(1) contrast(1.5)"
             />
             {/* Caption Overlay */}
             <Box position="absolute" bottom={0} left={0} right={0} bg="white" p={2}>
                <Text fontSize="8px" fontWeight="black" color="black" textAlign="center">
                   SANDERS CELEBRATES AFTER RECORD-BREAKING TD (PHOTO: AP)
                </Text>
             </Box>
           </Box>

           {/* Decorative Paper Tear SVG */}
           <Box 
             position="absolute" 
             top="-10px" 
             left="-20px" 
             w="50px" 
             h="110%" 
             bg="#E5E5E5" 
             clipPath="polygon(0% 0%, 100% 0%, 20% 5%, 80% 10%, 10% 20%, 90% 30%, 30% 40%, 70% 50%, 0% 60%, 100% 70%, 20% 80%, 80% 90%, 0% 100%)"
             zIndex={2}
           />
        </Box>
      </Grid>

      {/* Price Tag */}
      <Text position="absolute" top={1} right={4} fontSize="10px" fontWeight="black" border="1px solid black" px={1}>$0.05</Text>
    </Box>
  );
};
