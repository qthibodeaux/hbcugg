import React, { useMemo } from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  Image,
  VStack,
  HStack,
  Separator,
  Circle,
  Flex
} from '@chakra-ui/react';
import { MapPin, Users } from 'lucide-react';
import teamsData from '../../../data/teams.json';

/**
 * SchoolsDirectory component
 * A production-ready component integrating Glass, Pulse, and Heritage styles.
 * Layout: 6 columns for desktop (6x3 grid for 18 teams).
 * Fits into a Slot4x2 on a DesktopBoard4x.
 */
export const SchoolsDirectory = () => {
  const teams = [...teamsData.teams].sort((a, b) => a.name.localeCompare(b.name));

  // Why Engine Logic: Randomly highlight 3 teams on each mount/render cycle
  // (using useMemo to stabilize during a single re-render session)
  const highlightedIds = useMemo(() => {
    const shuffled = [...teams].sort(() => 0.5 - Math.random());
    return new Set(shuffled.slice(0, 3).map((t) => t.id));
  }, [teams]);

  return (
    <Box w="full" py={2}>
      <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} gap={4}>
        {teams.map((team) => {
          const isHighlighted = highlightedIds.has(team.id);
          
          return (
            <Box
              key={team.id}
              position="relative"
              role="group"
              cursor="pointer"
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{ transform: 'translateY(-4px)' }}
              borderRadius="xl"
              overflow="hidden"
              border="1px solid"
              borderColor={isHighlighted ? 'brand.500' : 'whiteAlpha.100'}
              bg={isHighlighted 
                ? 'radial-gradient(circle at top right, brand.900, bg.primary 70%)' 
                : 'bg.secondary'
              }
              backdropFilter="blur(10px)"
              boxShadow={isHighlighted ? '0 0 20px rgba(229, 62, 62, 0.15)' : 'none'}
            >
              {/* Variant A (Glass) background gradient overlay */}
              <Box
                position="absolute"
                inset={0}
                bg="radial-gradient(circle at center, whiteAlpha.50, transparent)"
                pointerEvents="none"
              />

              {/* Variant C (Heritage) - Content layout */}
              <VStack spacing={0} align="stretch" h="full">
                
                {/* Logo Section - Shield Look */}
                <Flex 
                  justify="center" 
                  align="center" 
                  pt={6} 
                  pb={4} 
                  position="relative"
                >
                  {/* Subtle 'Why Engine' trace glow if highlighted */}
                  {isHighlighted && (
                    <Box
                      position="absolute"
                      w="80px"
                      h="80px"
                      bg="brand.500"
                      filter="blur(30px)"
                      opacity={0.3}
                      borderRadius="full"
                    />
                  )}
                  
                  <Box
                    transition="transform 0.5s ease"
                    _groupHover={{ transform: 'scale(1.1) rotate(5deg)' }}
                  >
                    <Image
                      src={team.logo}
                      alt={team.name}
                      boxSize="64px"
                      objectFit="contain"
                      filter="drop-shadow(0 4px 12px rgba(0,0,0,0.5))"
                    />
                  </Box>
                </Flex>

                {/* Typography Section */}
                <VStack spacing={1} px={3} align="center" textAlign="center">
                  <Text
                    fontSize="sm"
                    fontWeight="black"
                    color="brand.400"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    lineHeight="shorter"
                  >
                    {team.shortName}
                  </Text>
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    color="text.primary"
                    textTransform="uppercase"
                    letterSpacing="tight"
                    lineClamp={1}
                  >
                    {team.name}
                  </Text>
                </VStack>

                <Box px={4} py={3}>
                  <Separator borderColor="whiteAlpha.100" />
                </Box>

                {/* Variant B (Pulse) - Stats Ribbon */}
                <HStack 
                  px={3} 
                  pb={4} 
                  justify="space-between" 
                  fontSize="2xs" 
                  color="text.muted"
                  fontWeight="medium"
                  mt="auto"
                >
                  <HStack spacing={1}>
                    <MapPin size={10} />
                    <Text>{team.city}, {team.state}</Text>
                  </HStack>
                  <HStack spacing={1}>
                    <Users size={10} />
                    <Text>{(team.enrollment / 1000).toFixed(1)}K</Text>
                  </HStack>
                </HStack>
              </VStack>
              
              {/* Highlight Ribbon - Variant C style */}
              {isHighlighted && (
                <Box
                  position="absolute"
                  top={2}
                  right={2}
                  p={1}
                >
                  <Circle size="6px" bg="brand.500">
                    <Box 
                      as="span" 
                      position="absolute" 
                      inset={0} 
                      borderRadius="full" 
                      bg="brand.500" 
                      animation="pulse 2s infinite" 
                    />
                  </Circle>
                </Box>
              )}
            </Box>
          );
        })}
      </SimpleGrid>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          70% { transform: scale(2.5); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>
    </Box>
  );
};

export default SchoolsDirectory;
