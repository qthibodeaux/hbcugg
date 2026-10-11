import React from "react";
import { Box, SimpleGrid, Flex, Text, Image, Badge,  VStack, HStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import teamsData from "../../../data/teams.json";

const teams = [...teamsData.teams].sort((a, b) => a.name.localeCompare(b.name));

const MOCK_OVERLAY = {
  transfer_rate: { label: "Transfer Rate", value: "18%", color: "brand.500" },
  veteran_pct: { label: "Veteran %", value: "44%", color: "green.400" },
  roster_size: { label: "Roster", value: "116", color: "blue.400" },
};

const TeamEntryCardB = ({ team, onClick }) => (
  <Flex
    as="button"
    w="full"
    h="120px"
    direction="row"
    align="center"
    bg="bg.card"
    borderRadius="lg"
    border="1px solid"
    borderColor="whiteAlpha.100"
    boxShadow="md"
    transition="transform 0.18s, box-shadow 0.18s"
    _hover={{ transform: "scale(1.04)", boxShadow: `0 0 0 2px ${team.colors.primary}55` }}
    p={3}
    position="relative"
    onClick={onClick}
    overflow="hidden"
    gap={3}
  >
    <Image src={team.logo} alt={team.shortName} boxSize="38px" />
    <VStack align="start" spacing={0} flex={1}>
      <Text fontWeight="black" fontSize="md" color={team.colors.primary} textTransform="uppercase" letterSpacing="0.04em">
        {team.shortName}
      </Text>
      <Text fontSize="xs" color="text.muted" fontWeight="bold" lineClamp={1}>
        {team.name}
      </Text>
      <HStack gap={1} mt={1}>
        <Badge colorScheme="red" fontSize="0.7em" px={2} borderRadius="md">
          {MOCK_OVERLAY.transfer_rate.value}
        </Badge>
        <Badge colorScheme="green" fontSize="0.7em" px={2} borderRadius="md">
          {MOCK_OVERLAY.veteran_pct.value}
        </Badge>
        <Badge colorScheme="blue" fontSize="0.7em" px={2} borderRadius="md">
          {MOCK_OVERLAY.roster_size.value}
        </Badge>
      </HStack>
    </VStack>
  </Flex>
);

export function TeamEntryCardGridB() {
  const navigate = useNavigate();
  return (
    <Box w="full" h="full" bg="bg.secondary" borderRadius="xl" p={4}>
      <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} gap={4}>
        {teams.map((team) => (
          <TeamEntryCardB key={team.id} team={team} onClick={() => navigate(`/teams/${team.id}/roster`)} />
        ))}
      </SimpleGrid>
    </Box>
  );
}
