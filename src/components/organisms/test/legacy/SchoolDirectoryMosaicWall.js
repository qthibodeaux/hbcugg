import React from 'react';
import { Box, SimpleGrid, Image, Flex, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import teamsData from '../../../data/teams.json';

const teams = [...teamsData.teams].sort((a, b) => a.name.localeCompare(b.name));

// 9x2 tight grid of square logo tiles.
// School name reveals on hover via bottom gradient overlay.
export const SchoolDirectoryMosaicWall = () => {
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

            {/* Name overlay on hover */}
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
