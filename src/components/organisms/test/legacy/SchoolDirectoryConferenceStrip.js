import React from 'react';
import { Box, Flex, Text, Image, VStack, HStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import teamsData from '../../../data/teams.json';

const teams = [...teamsData.teams].sort((a, b) => a.name.localeCompare(b.name));

// Schools grouped by conference (SWAC / MEAC) as two horizontal scrolling rows.
// Each school = logo chip + name. Conference header labels each row.
export const SchoolDirectoryConferenceStrip = () => {
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
        <Text fontSize="9px" color="text.muted" fontWeight="medium">
          {confTeams.length} Schools
        </Text>
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
              boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
            }}
            onClick={() => navigate(`/teams/${team.id}`)}
          >
            <VStack gap={2} align="center">
              <Image
                src={team.logo}
                alt={team.name}
                boxSize="36px"
                objectFit="contain"
                filter="drop-shadow(0 2px 6px rgba(0,0,0,0.4))"
                transition="transform 0.25s ease"
                _groupHover={{ transform: 'scale(1.12)' }}
              />
              <Text
                fontSize="9px"
                fontWeight="black"
                color="text.secondary"
                textTransform="uppercase"
                letterSpacing="0.04em"
                textAlign="center"
                lineHeight={1.2}
                lineClamp={1}
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
        <ConferenceRow label="SWAC — Southwestern Athletic Conference" confTeams={swac} accentColor="brand.500" />
        <ConferenceRow label="MEAC — Mid-Eastern Athletic Conference" confTeams={meac} accentColor="blue.400" />
      </VStack>
    </Box>
  );
};
