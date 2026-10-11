import React from 'react';
import { Box, Flex, Text, Heading, Center } from '@chakra-ui/react';
import { motion } from 'framer-motion';

/**
 * GamesHubNeonGlitchA
 * Concept: Cyberpunk / Glitch aesthetic.
 * Features: RGB split text, flickering borders, glowing team gradients.
 */
export const GamesHubNeonGlitchA = () => {
  return (
    <Box 
      w="full" 
      h="full" 
      bg="#050505" 
      p={4}
      position="relative"
      overflow="hidden"
      border="2px solid"
      borderColor="#F56565"
      style={{
        boxShadow: "0 0 15px rgba(245, 101, 101, 0.4), inset 0 0 10px rgba(245, 101, 101, 0.2)",
        animation: "flicker 4s infinite"
      }}
    >
      <style>{`
        @keyframes flicker {
          0%, 18%, 22%, 25%, 53%, 57%, 100% { opacity: 1; }
          20%, 24%, 55% { opacity: 0.7; border-color: #3182ce; }
        }
        @keyframes glitch {
          0% { transform: translate(0) }
          20% { transform: translate(-2px, 2px) }
          40% { transform: translate(-2px, -2px) }
          60% { transform: translate(2px, 2px) }
          80% { transform: translate(2px, -2px) }
          100% { transform: translate(0) }
        }
      `}</style>

      <Flex direction="column" justify="space-between" h="full" position="relative" zIndex={2}>
        <Flex justify="space-between" align="start">
          <Box>
            <Text fontSize="8px" fontWeight="black" color="#3182ce" letterSpacing="3px">SYSTEM: ONLINE</Text>
            <Heading 
              size="md" 
              color="white" 
              textShadow="0 0 10px #F56565"
              style={{ animation: "glitch 0.2s infinite" }}
            >
              ELITE METRIC
            </Heading>
          </Box>
          <Box w="10px" h="10px" bg="#F56565" borderRadius="full" />
        </Flex>

        <Center flex={1} flexDirection="column">
          <Text 
            fontSize="6xl" 
            fontWeight="black" 
            color="white" 
            lineHeight="0.8"
            position="relative"
          >
            98.2
            {/* RGB Ghosting */}
            <Text position="absolute" top="1px" left="2px" color="rgba(255,0,0,0.5)" zIndex={-1} opacity={0.6}>98.2</Text>
            <Text position="absolute" top="-1px" left="-2px" color="rgba(0,0,255,0.5)" zIndex={-1} opacity={0.6}>98.2</Text>
          </Text>
          <Text fontSize="xs" fontWeight="black" color="#3182ce" mt={2} letterSpacing="4px">
            GLORY RATING
          </Text>
        </Center>

        <Box borderTop="1px solid" borderColor="whiteAlpha.300" pt={2}>
           <Flex justify="space-between" align="center">
              <Text fontSize="8px" color="whiteAlpha.600">ENCRYPTION: SWAC_PROT</Text>
              <Flex gap={1}>
                 {[1,2,3,4,5].map(i => (
                   <Box key={i} w="4px" h="4px" bg={i < 4 ? "#F56565" : "whiteAlpha.200"} />
                 ))}
              </Flex>
           </Flex>
        </Box>
      </Flex>

      {/* Background Tech Scanline */}
      <Box 
        position="absolute" 
        top={0} left={0} w="full" h="full" 
        pointerEvents="none"
        bgGradient="linear(to-b, transparent 50%, rgba(255,255,255,0.02) 50%)"
        backgroundSize="100% 4px"
      />
      
      {/* Floating Particle */}
      <motion.div
        animate={{ y: [0, -40, 0], x: [0, 20, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ position: 'absolute', width: '2px', height: '10px', background: '#3182ce', top: '80%', left: '20%' }}
      />
    </Box>
  );
};
