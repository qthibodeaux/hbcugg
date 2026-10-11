import React from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  Image,
  VStack,
  HStack,
  Flex,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import teamsData from '../../../data/teams.json';

const teams = [...teamsData.teams].sort((a, b) => a.name.localeCompare(b.name));

// -----------------------------------------------------------------------------
// VARIANT D — Mosaic Wall
// 9 × 2 tight grid of square logo tiles.
// -----------------------------------------------------------------------------
export const DirectoryVariantD = () => {
  const navigate = useNavigate();

  return (
    <Box
      w="full"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      overflow="hidden"
      bg="bg.secondary"
      p={4}
    >
      <SimpleGrid columns={9} gap={2}>
        {teams.map((team) => (
          <Box
            key={team.id}
            role="group"
            cursor="pointer"
            position="relative"
            aspectRatio="1"
            borderRadius="lg"
            overflow="hidden"
            border="1px solid"
            borderColor="whiteAlpha.100"
            bg="bg.primary"
            transition="all 0.22s ease"
            _hover={{
              borderColor: 'brand.500',
              boxShadow: '0 0 14px rgba(229,62,62,0.22)',
              transform: 'scale(1.07)',
              zIndex: 2,
            }}
            onClick={() => navigate(`/teams/${team.id}`)}
          >
            <Flex position="absolute" inset={0} align="center" justify="center" p={3}>
              <Image
                src={team.logo}
                alt={team.name}
                boxSize="44px"
                objectFit="contain"
                filter="drop-shadow(0 2px 8px rgba(0,0,0,0.5))"
                transition="transform 0.3s ease"
                _groupHover={{ transform: 'scale(1.1)' }}
              />
            </Flex>
            <Box
              position="absolute"
              inset={0}
              bg="linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 55%)"
              opacity={0}
              _groupHover={{ opacity: 1 }}
              transition="opacity 0.22s ease"
              display="flex"
              alignItems="flex-end"
              p={2}
            >
              <Text
                fontSize="9px"
                fontWeight="black"
                color="white"
                textTransform="uppercase"
                letterSpacing="0.04em"
                lineHeight={1.2}
              >
                {team.shortName}
              </Text>
            </Box>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

// -----------------------------------------------------------------------------
// VARIANT E — Conference Strip
// -----------------------------------------------------------------------------
export const DirectoryVariantE = () => {
  const navigate = useNavigate();

  const swac = teams.filter((t) => t.conference === 'SWAC');
  const meac = teams.filter((t) => t.conference === 'MEAC');

  const ConferenceRow = ({ label, confTeams, accentColor }) => (
    <Box>
      <HStack mb={3} gap={3}>
        <Box w="3px" h="16px" bg={accentColor} borderRadius="full" flexShrink={0} />
        <Text
          fontSize="10px"
          fontWeight="black"
          color="text.muted"
          textTransform="uppercase"
          letterSpacing="0.14em"
        >
          {label}
        </Text>
        <Box flex={1} h="1px" bg="whiteAlpha.100" />
      </HStack>

      <Flex gap={2} wrap="nowrap" overflowX="auto" pb={1}>
        {confTeams.map((team) => (
          <Box
            key={team.id}
            role="group"
            cursor="pointer"
            flexShrink={0}
            borderRadius="lg"
            border="1px solid"
            borderColor="whiteAlpha.100"
            bg="bg.primary"
            px={3}
            py={3}
            minW="72px"
            transition="all 0.2s ease"
            _hover={{
              borderColor: accentColor,
              transform: 'translateY(-3px)',
              boxShadow: `0 6px 16px rgba(0,0,0,0.3)`,
            }}
            onClick={() => navigate(`/teams/${team.id}`)}
          >
            <VStack gap={2} align="center">
              <Image
                src={team.logo}
                alt={team.name}
                boxSize="36px"
                objectFit="contain"
              />
              <Text
                fontSize="9px"
                fontWeight="black"
                color="text.secondary"
                textTransform="uppercase"
                textAlign="center"
              >
                {team.shortName}
              </Text>
            </VStack>
          </Box>
        ))}
      </Flex>
    </Box>
  );

  return (
    <Box
      w="full"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg="bg.secondary"
      p={5}
    >
      <VStack gap={6} align="stretch">
        <ConferenceRow label="SWAC" confTeams={swac} accentColor="brand.500" />
        <ConferenceRow label="MEAC" confTeams={meac} accentColor="blue.400" />
      </VStack>
    </Box>
  );
};

// -----------------------------------------------------------------------------
// VARIANT F — Feature + Grid
// -----------------------------------------------------------------------------
export const DirectoryVariantF = () => {
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
      <Grid templateColumns={{ base: '1fr', md: '1fr 3fr' }} h="full">
        <GridItem
          borderRight="1px solid"
          borderColor="whiteAlpha.100"
          p={6}
          cursor="pointer"
          onClick={() => navigate(`/teams/${featured.id}`)}
          _hover={{ bg: 'whiteAlpha.50' }}
        >
          <Text fontSize="xs" fontWeight="black" color="brand.400" textTransform="uppercase" mb={2}>Featured</Text>
          <Text fontSize="xl" fontWeight="black" color="white" textTransform="uppercase">{featured.name}</Text>
          <Image src={featured.logo} alt="" boxSize="64px" mt={4} />
        </GridItem>

        <GridItem p={4}>
          <SimpleGrid columns={4} gap={2}>
            {rest.map((team) => (
              <Box
                key={team.id}
                p={2}
                border="1px solid"
                borderColor="whiteAlpha.100"
                borderRadius="md"
                cursor="pointer"
                onClick={() => navigate(`/teams/${team.id}`)}
                _hover={{ borderColor: 'brand.500' }}
              >
                <VStack gap={1}>
                  <Image src={team.logo} alt="" boxSize="28px" />
                  <Text fontSize="8px" fontWeight="bold" color="white">{team.shortName}</Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </GridItem>
      </Grid>
    </Box>
  );
};
