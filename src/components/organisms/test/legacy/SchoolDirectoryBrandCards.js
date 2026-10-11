import React from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  Flex,
  Image,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import teamsData from '../../../data/teams.json';

const teams = [...teamsData.teams].sort((a, b) => a.name.localeCompare(b.name));

export const SchoolDirectoryBrandCards = () => {
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
          <Box
            key={team.id}
            role="group"
            cursor="pointer"
            h="72px"
            bg="bg.primary"
            borderRadius="lg"
            overflow="hidden"
            position="relative"
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            border="1px solid"
            borderColor="whiteAlpha.100"
            _hover={{
              borderColor: team.colors?.primary || "brand.500",
              transform: "scale(1.02)",
            }}
            onClick={() => navigate(`/teams/${team.id}`)}
          >
            {/* Split Gradient Background */}
            <Box 
              position="absolute"
              inset={0}
              bg={`linear-gradient(45deg, ${team.colors?.primary || "#1a1a1a"}22 0%, transparent 70%)`}
            />
            
            <Flex h="full" align="center" justify="space-between" px={4} position="relative">
              <Text
                fontSize="xl"
                fontWeight="black"
                color="white"
                fontStyle="italic"
                letterSpacing="-0.04em"
                lineHeight={1}
                _groupHover={{ color: team.colors?.primary || "brand.500" }}
              >
                {team.id.toUpperCase()}
              </Text>
              
              <Image
                src={team.logo}
                alt=""
                boxSize="32px"
                objectFit="contain"
                filter="grayscale(0.5) contrast(1.2)"
                _groupHover={{ filter: "grayscale(0) contrast(1.5)" }}
                transition="all 0.3s ease"
              />
            </Flex>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};
