import React, { useState } from 'react';
import { Box, Flex, Text, Image, Center } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Radio } from 'lucide-react';

/**
 * GamesHubMetroFlipA
 * Concept: Windows Metro UI / Live Tiles.
 * Features: 3D flip animation, bold solid colors, minimalist data.
 */
export const GamesHubMetroFlipA = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <Box 
      w="full" 
      h="full" 
      perspective="1000px" 
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      cursor="pointer"
    >
      <motion.div
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ width: '100%', height: '100%', transformStyle: "preserve-3d", position: "relative" }}
      >
        {/* Front Face (Logo/Identity) */}
        <Box
          position="absolute"
          inset={0}
          bg="#006747" // FAMU Green
          backfaceVisibility="hidden"
          p={4}
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          <Center flex={1}>
            <Image src="/assets/swacfamu.svg" w="80px" h="80px" filter="brightness(0) invert(1)" />
          </Center>
          <Flex justify="space-between" align="center">
            <Text fontWeight="black" color="white" fontSize="xs">FAMU RATTLERS</Text>
            <Radio size={12} color="white" />
          </Flex>
        </Box>

        {/* Back Face (Live Stats) */}
        <Box
          position="absolute"
          inset={0}
          bg="brand.500" // Red highlight
          backfaceVisibility="hidden"
          transform="rotateY(180deg)"
          p={4}
          display="flex"
          flexDirection="column"
        >
          <Text fontSize="9px" fontWeight="black" color="whiteAlpha.800" letterSpacing="2px">LIVE STREAM</Text>
          <Flex direction="column" justify="center" flex={1}>
            <Text fontSize="3xl" fontWeight="black" color="white" lineHeight="1">
              382
            </Text>
            <Text fontSize="10px" fontWeight="bold" color="whiteAlpha.700">TOTAL OFFENSE YDS</Text>
            
            <Box mt={4} h="2px" bg="whiteAlpha.300" w="full" position="relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: isFlipped ? "72%" : 0 }}
                transition={{ delay: 0.3 }}
                style={{ height: '100%', background: 'white', position: 'absolute' }} 
              />
            </Box>
            <Text mt={1} fontSize="8px" fontWeight="black" color="white">WIN PROB: 72%</Text>
          </Flex>

          <Box borderTop="1px solid" borderColor="whiteAlpha.200" pt={2}>
            <Flex justify="space-between">
              <Text fontSize="8px" color="white" fontWeight="bold">Q4 | 2:14</Text>
              <motion.div
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }}
              />
            </Flex>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
};
