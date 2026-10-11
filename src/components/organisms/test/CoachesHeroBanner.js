import React from 'react';
import { Box, Flex, Text, Heading, Badge, Button } from '@chakra-ui/react';
import { GitBranch, Map } from 'lucide-react';

/**
 * CoachesHeroBanner
 * 4x1 Magazine-style banner for the Coaches Hub.
 */
export const CoachesHeroBanner = ({ onCtaClick }) => {
  return (
    <Box
      w="full"
      h="full"
      position="relative"
      bg="bg.secondary"
      borderRadius="xl"
      overflow="hidden"
      border="1px solid"
      borderColor="whiteAlpha.100"
    >
      {/* Visual Background Pattern - Grid/Clipboard Texture */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.07}
        backgroundImage="radial-gradient(circle at 2px 2px, white 1px, transparent 0)"
        backgroundSize="24px 24px"
        pointerEvents="none"
      />
      
      {/* Decorative Gradient Overlay */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="linear-gradient(90deg, #1A0B0B 0%, rgba(11, 11, 13, 0.95) 50%, #0B0B0D 100%)"
        pointerEvents="none"
      />

      <Flex h="full" px={10} align="center" justify="space-between" position="relative" zIndex={1}>
        {/* Left Side: Editorial Content */}
        <Box maxW="60%">
          <Badge 
            variant="solid" 
            bg="brand.500" 
            color="white" 
            fontSize="xs" 
            px={2} 
            mb={4}
            letterSpacing="widest"
            textTransform="uppercase"
            borderRadius="sm"
          >
            Leadership Ecosystem
          </Badge>
          <Heading 
            fontSize={{ base: "3xl", md: "5xl" }} 
            fontWeight="black" 
            color="white" 
            textTransform="uppercase" 
            letterSpacing="tighter"
            lineHeight="0.9"
            mb={2}
          >
            Coaches Hub
          </Heading>
          <Text 
            fontSize={{ base: "xs", md: "sm" }} 
            color="text.secondary" 
            maxW="450px" 
            lineHeight="1.4"
            letterSpacing="tight"
          >
            Stability, movement, trees, pipelines, and sideline identity across 
            HBCU football programs. Tracking the DNA of the SWAC and MEAC.
          </Text>
        </Box>

        {/* Right Side: Compact CTAs */}
        <Flex direction="column" gap={3}>
          <Button
            size="sm"
            variant="outline"
            color="white"
            borderColor="whiteAlpha.300"
            _hover={{ bg: 'whiteAlpha.100', borderColor: 'brand.500' }}
            leftIcon={<GitBranch size={14} color="#E53E3E" />}
            onClick={() => onCtaClick?.('tree')}
            fontSize="10px"
            textTransform="uppercase"
            letterSpacing="widest"
          >
            Coaching Tree
          </Button>
          <Button
            size="sm"
            variant="outline"
            color="white"
            borderColor="whiteAlpha.300"
            _hover={{ bg: 'whiteAlpha.100', borderColor: 'brand.500' }}
            leftIcon={<Map size={14} color="#E53E3E" />}
            onClick={() => onCtaClick?.('movement')}
            fontSize="10px"
            textTransform="uppercase"
            letterSpacing="widest"
          >
            Movement Map
          </Button>
        </Flex>
      </Flex>

      {/* Aesthetic Accent Line */}
      <Box position="absolute" left={0} top={0} bottom={0} w="4px" bg="brand.500" />
    </Box>
  );
};
