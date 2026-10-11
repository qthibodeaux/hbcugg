import React from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  VStack,
  Flex,
  Image,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import teamsData from '../../../data/teams.json';

const teams = [...teamsData.teams].sort((a, b) => a.name.localeCompare(b.name));

export const SchoolDirectoryRibbon = () => {
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
      <SimpleGrid columns={6} gap={2}>
        {teams.map((team) => (
          <Box
            key={team.id}
            role="group"
            cursor="pointer"
            position="relative"
            h="64px"
            borderRadius="md"
            overflow="hidden"
            bg="bg.primary"
            transition="all 0.2s ease"
            borderBottom="3px solid"
            borderBottomColor={team.colors?.primary || "brand.500"}
            _hover={{
              bg: "whiteAlpha.100",
              transform: "translateY(-2px)",
            }}
            onClick={() => navigate(`/teams/${team.id}`)}
          >
            <Image
              src={team.logo}
              alt=""
              position="absolute"
              right="-10%"
              bottom="-10%"
              boxSize="60px"
              objectFit="contain"
              opacity={0.05}
              filter="grayscale(1)"
              _groupHover={{ opacity: 0.15, transform: "scale(1.2) rotate(-10deg)" }}
              transition="all 0.4s ease"
            />
            <Flex h="full" align="center" px={3}>
              <VStack align="start" gap={0}>
                <Text
                  fontSize="xs"
                  fontWeight="black"
                  color="white"
                  textTransform="uppercase"
                  letterSpacing="0.02em"
                  _groupHover={{ color: team.colors?.primary || "brand.500" }}
                >
                  {team.shortName}
                </Text>
                <Text fontSize="10px" color="text.muted" fontWeight="bold">
                  {team.conference}
                </Text>
              </VStack>
            </Flex>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};
