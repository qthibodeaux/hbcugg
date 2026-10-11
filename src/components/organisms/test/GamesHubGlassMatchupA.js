import React from 'react';
import { Box, Flex, Text, Heading, Image, Grid, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';

/**
 * GamesHubGlassMatchupA
 * Concept: Modern Glassmorphism with deep blur.
 * Features: Backdrop blur, semi-transparent frosted layers, parallax motion.
 */
export const GamesHubGlassMatchupA = () => {
  return (
    <Box 
      w="full" 
      h="full" 
      bgImage="url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1000')" 
      bgSize="cover"
      bgPosition="center"
      position="relative"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid rgba(255,255,255,0.2)"
    >
      {/* Dark Overlay to pop the glass */}
      <Box position="absolute" inset={0} bg="blackAlpha.600" />

      {/* Content Layer */}
      <Flex direction="column" h="full" position="relative" zIndex={2} p={6}>
        
        {/* Frosted Header */}
        <Flex 
          backdropFilter="blur(12px)" 
          bg="rgba(255,255,255,0.05)"
          border="1px solid rgba(255,255,255,0.1)"
          p={3}
          borderRadius="lg"
          justify="space-between"
          align="center"
          mb={4}
        >
           <VStack align="start" spacing={0}>
              <Text fontSize="10px" fontWeight="black" color="brand.400">NEXT UP</Text>
              <Heading size="xs" color="white">GAME CENTER HUB</Heading>
           </VStack>
           <Box bg="white" color="black" px={2} py={1} borderRadius="md" fontSize="10px" fontWeight="black">
              LIVE IN 48m
           </Box>
        </Flex>

        {/* Main Glass Panel */}
        <Grid 
          templateColumns="1fr auto 1fr" 
          flex={1} 
          alignItems="center"
          backdropFilter="blur(20px)"
          bg="rgba(255,255,255,0.03)"
          borderRadius="2xl"
          border="1px solid rgba(255,255,255,0.1)"
          boxShadow="xl"
          px={8}
        >
          {/* Team A */}
          <motion.div whileHover={{ scale: 1.1 }}>
            <Flex direction="column" align="center">
              <Image src="/assets/swacjsu.svg" w="80px" h="80px" filter="drop-shadow(0 10px 20px rgba(0,0,0,0.5))" />
              <Text mt={2} fontSize="xl" fontWeight="black" color="white">JSU</Text>
              <Text fontSize="9px" color="whiteAlpha.600" fontWeight="bold">9-1 SEC</Text>
            </Flex>
          </motion.div>

          {/* Center Divider */}
          <Box px={6} textAlign="center">
             <Text fontSize="2xl" fontWeight="black" color="whiteAlpha.400">VS</Text>
          </Box>

          {/* Team B */}
          <motion.div whileHover={{ scale: 1.1 }}>
            <Flex direction="column" align="center">
              <Image src="/assets/swacfamu.svg" w="80px" h="80px" filter="drop-shadow(0 10px 20px rgba(0,0,0,0.5))" />
              <Text mt={2} fontSize="xl" fontWeight="black" color="white">FAMU</Text>
              <Text fontSize="9px" color="whiteAlpha.600" fontWeight="bold">8-2 SEC</Text>
            </Flex>
          </motion.div>
        </Grid>

        {/* Bottom Ticker */}
        <Flex mt={4} justify="center" gap={8}>
           <Box textAlign="center">
              <Text fontSize="10px" color="whiteAlpha.600">TV</Text>
              <Text fontSize="xs" fontWeight="black" color="white">ESPN+</Text>
           </Box>
           <Box textAlign="center">
              <Text fontSize="10px" color="whiteAlpha.600">SPREAD</Text>
              <Text fontSize="xs" fontWeight="black" color="white">JSU -4.5</Text>
           </Box>
           <Box textAlign="center">
              <Text fontSize="10px" color="whiteAlpha.600">OVER/UNDER</Text>
              <Text fontSize="xs" fontWeight="black" color="white">54.5</Text>
           </Box>
        </Flex>
      </Flex>

      {/* Floating Bokeh Effects */}
      <Box 
        position="absolute" 
        top="-20%" 
        right="-10%" 
        w="300px" 
        h="300px" 
        bg="brand.500" 
        filter="blur(80px)" 
        opacity={0.15} 
      />
    </Box>
  );
};
