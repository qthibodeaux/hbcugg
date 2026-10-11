import { Box, Flex, Text, Image } from "@chakra-ui/react";
// eslint-disable-next-line no-unused-vars
import { Link } from "react-router-dom";

const BANNER_DESCRIPTION = "A comprehensive directory for Historical Black Colleges and Universities across the SWAC and MEAC conferences.";

/**
 * Common layout wrapper for the banners to ensure consistency.
 */
const BannerWrapper = ({ children, bgProps = {} }) => (
  <Box
    w="100%"
    position="relative"
    borderRadius="xl"
    overflow="hidden"
    border="1px solid"
    borderColor="whiteAlpha.100"
    py={{ base: 7, md: 10 }}
    {...bgProps}
  >
    {children}
  </Box>
);

/**
 * Variant 1: "The Glass Engine"
 * High-end glassmorphism, subtle gradient, focus on transparency.
 */
export const GlassEngineBanner = () => (
  <BannerWrapper bgProps={{ bg: "bg.secondary" }}>
    {/* Background Image with heavy blur */}
    <Image
      src="/pics/stadium_dusk.jpg"
      alt=""
      position="absolute"
      inset={0}
      w="full"
      h="full"
      objectFit="cover"
      filter="blur(20px) brightness(0.4)"
      opacity={0.6}
    />
    
    <Flex
      position="relative"
      zIndex={1}
      direction="column"
      justify="center"
      h="full"
      px={10}
      backdropFilter="blur(5px)"
      bg="rgba(11, 11, 13, 0.4)"
    >
      <Text 
        fontSize="xs" 
        fontWeight="black" 
        color="whiteAlpha.600" 
        letterSpacing="0.4em" 
        mb={2}
      >
        ENGINE 01 // GLASSMISM
      </Text>
      <Text fontSize={{ base: "4xl", md: "6xl" }} fontWeight="black" lineHeight="1">
        THE <Box as="span" color="whiteAlpha.800" fontStyle="italic">18</Box>
      </Text>
      <Text 
        mt={4} 
        fontSize="sm" 
        color="text.secondary" 
        maxW="450px"
        lineHeight="1.6"
      >
        {BANNER_DESCRIPTION}
      </Text>
    </Flex>
  </BannerWrapper>
);

/**
 * Variant 2: "The Gridiron Pulse"
 * Aggressive linear gradients, slanted typography, sports-broadcast vibe.
 */
export const GridironPulseBanner = () => (
  <BannerWrapper bgProps={{ 
    bg: "linear-gradient(135deg, #E53E3E 0%, #0B0B0D 60%)" 
  }}>
    <Box 
      position="absolute" 
      inset={0} 
      bg="url('/pics/action_closeup.jpg')" 
      bgSize="cover" 
      bgPos="center" 
      opacity={0.15} 
      mixBlendMode="overlay"
    />
    
    {/* Slanted Accent */}
    <Box 
      position="absolute"
      left="-5%"
      top="0"
      bottom="0"
      w="15%"
      bg="brand.500"
      transform="skewX(-15deg)"
      opacity={0.8}
    />

    <Flex
      position="relative"
      zIndex={1}
      direction="column"
      justify="center"
      h="full"
      pl={20}
      pr={10}
    >
      <Box h="2px" w="60px" bg="white" mb={3} />
      <Text 
        fontSize={{ base: "4xl", md: "7xl" }} 
        fontWeight="900" 
        lineHeight="0.85"
        letterSpacing="-0.04em"
        textTransform="uppercase"
      >
        THE <Box as="span" color="brand.400">18</Box>
      </Text>
      <Text 
        mt={6} 
        fontSize="xs" 
        color="whiteAlpha.900" 
        maxW="500px"
        fontWeight="bold"
        textTransform="uppercase"
        letterSpacing="0.05em"
      >
        {BANNER_DESCRIPTION}
      </Text>
    </Flex>
  </BannerWrapper>
);

/**
 * Variant 3: "Institutional Heritage"
 * Clean, high-contrast, academic prestige mark.
 */
export const InstitutionalHeritageBanner = () => (
  <BannerWrapper bgProps={{ bg: "bg.card" }}>
    <Box 
       position="absolute" 
       right="5%" 
       top="50%" 
       transform="translateY(-50%)"
       fontSize="180px"
       fontWeight="black"
       color="whiteAlpha.050"
       lineHeight="1"
       userSelect="none"
       pointerEvents="none"
    >
      18
    </Box>

    <Flex
      position="relative"
      zIndex={1}
      direction="column"
      justify="center"
      h="full"
      px={12}
    >
      <Flex align="center" gap={4} mb={2}>
        <Text fontSize="xs" fontWeight="bold" color="brand.500" letterSpacing="0.2em">
          ESTABLISHED PROGRAMS
        </Text>
        <Box flex={1} h="1px" bg="whiteAlpha.200" maxW="200px" />
      </Flex>
      
      <Text 
        fontSize={{ base: "4xl", md: "6xl" }} 
        fontWeight="black" 
        color="white" 
        lineHeight="1"
        mb={4}
      >
        THE <Box as="span" borderBottom="4px solid" borderColor="brand.500">18</Box>
      </Text>
      
      <Text 
        fontSize="md" 
        color="text.secondary" 
        maxW="600px"
        fontStyle="italic"
      >
        {BANNER_DESCRIPTION}
      </Text>
    </Flex>
  </BannerWrapper>
);
