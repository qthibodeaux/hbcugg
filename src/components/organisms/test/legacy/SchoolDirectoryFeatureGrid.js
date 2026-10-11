import React from 'react';
import { Box, SimpleGrid, Text, Image, VStack, HStack, Flex, Grid, GridItem } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import teamsData from '../../../data/teams.json';

const teams = [...teamsData.teams].sort((a, b) => a.name.localeCompare(b.name));

// Left panel: oversized featured school card.
// Right panel: compact grid of remaining 17 schools.
// Editorial feel — creates visual hierarchy in the 4x2 slot.
export const SchoolDirectoryFeatureGrid = () => {
  const navigate = useNavigate();

  const [featured, ...rest] = teams;

  return (
    <Box
      w="full"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      overflow="hidden"
      bg="bg.secondary"
    >
      <Grid templateColumns={{ base: '1fr', md: '1fr 3fr' }}>

        {/* Featured school — left panel */}
        <GridItem
          borderRight="1px solid"
          borderColor="whiteAlpha.100"
          position="relative"
          cursor="pointer"
          role="group"
          overflow="hidden"
          transition="background 0.3s ease"
          _hover={{ bg: 'whiteAlpha.50' }}
          onClick={() => navigate(`/teams/${featured.id}`)}
        >
          <Box
            position="absolute"
            inset={0}
            bg="radial-gradient(circle at bottom left, rgba(229,62,62,0.1), transparent 70%)"
            pointerEvents="none"
          />
          <Flex direction="column" h="full" minH="220px" p={6} justify="space-between">
            <Box>
              <Text
                fontSize="9px"
                fontWeight="black"
                color="brand.400"
                textTransform="uppercase"
                letterSpacing="0.16em"
                mb={2}
              >
                Featured
              </Text>
              <Text
                fontSize="xl"
                fontWeight="black"
                color="text.primary"
                textTransform="uppercase"
                letterSpacing="-0.01em"
                lineHeight={1.1}
              >
                {featured.name}
              </Text>
              <Text fontSize="xs" color="text.muted" mt={1}>
                {featured.mascot} · {featured.conference}
              </Text>
            </Box>
            <Flex align="center" justify="space-between">
              <Image
                src={featured.logo}
                alt={featured.name}
                boxSize="72px"
                objectFit="contain"
                filter="drop-shadow(0 4px 16px rgba(0,0,0,0.6))"
                transition="transform 0.35s ease"
                _groupHover={{ transform: 'scale(1.08) rotate(3deg)' }}
              />
              <HStack fontSize="xs" color="brand.400" fontWeight="bold" textTransform="uppercase" letterSpacing="0.08em">
                <Text>View</Text>
                <ChevronRight size={14} />
              </HStack>
            </Flex>
          </Flex>
        </GridItem>

        {/* Compact grid — right panel */}
        <GridItem p={4}>
          <SimpleGrid columns={{ base: 3, md: 4, lg: 5 }} gap={2}>
            {rest.map((team) => (
              <Box
                key={team.id}
                role="group"
                cursor="pointer"
                borderRadius="md"
                border="1px solid"
                borderColor="whiteAlpha.100"
                bg="bg.primary"
                p={3}
                transition="all 0.2s ease"
                _hover={{
                  borderColor: 'brand.500',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
                onClick={() => navigate(`/teams/${team.id}`)}
              >
                <VStack gap={2} align="center">
                  <Image
                    src={team.logo}
                    alt={team.name}
                    boxSize="32px"
                    objectFit="contain"
                    filter="drop-shadow(0 2px 6px rgba(0,0,0,0.4))"
                    transition="transform 0.25s ease"
                    _groupHover={{ transform: 'scale(1.1)' }}
                  />
                  <Text
                    fontSize="9px"
                    fontWeight="black"
                    color="text.secondary"
                    textTransform="uppercase"
                    letterSpacing="0.04em"
                    textAlign="center"
                    lineHeight={1.2}
                    lineClamp={2}
                  >
                    {team.shortName}
                  </Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </GridItem>

      </Grid>
    </Box>
  );
};
