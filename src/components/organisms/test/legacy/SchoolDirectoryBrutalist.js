import React from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  HStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import teamsData from '../../../data/teams.json';

const teams = [...teamsData.teams].sort((a, b) => a.name.localeCompare(b.name));

export const SchoolDirectoryBrutalist = () => {
  const navigate = useNavigate();

  return (
    <Box
      w="full"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg="bg.secondary"
      p={4}
    >
      <SimpleGrid columns={6} gap={2}>
        {teams.map((team) => (
          <HStack
            key={team.id}
            as="button"
            w="full"
            h="40px"
            px={3}
            bg="bg.primary"
            border="1px solid"
            borderColor="whiteAlpha.100"
            borderRadius="md"
            transition="all 0.1s ease"
            _hover={{
              borderColor: "whiteAlpha.400",
              bg: "whiteAlpha.50",
              transform: "translateX(2px)",
            }}
            onClick={() => navigate(`/teams/${team.id}`)}
          >
            <Box boxSize="6px" borderRadius="full" bg={team.colors?.primary || "brand.500"} flexShrink={0} />
            <Text
              fontSize="11px"
              fontWeight="bold"
              color="text.primary"
              textTransform="uppercase"
              letterSpacing="0.05em"
              isTruncated
            >
              {team.shortName}
            </Text>
          </HStack>
        ))}
      </SimpleGrid>
    </Box>
  );
};
