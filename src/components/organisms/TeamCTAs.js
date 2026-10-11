import { Box, Text, Flex, SimpleGrid, Container } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { Users, Calendar, BarChart3, History, Scale } from "lucide-react";

const TeamCTAs = ({ team }) => {
  const navigate = useNavigate();
  
  if (!team) return null;

  const ctas = [
    {
      icon: Users,
      title: "Full Roster",
      subtitle: "85 Active Players",
      description: "View complete depth chart and player profiles",
      action: () => navigate(`/teams/${team.id}?tab=roster`),
    },
    {
      icon: Calendar,
      title: "Full Schedule",
      subtitle: "2 Regular Season Left",
      description: "Game-by-game breakdown and results",
      action: () => navigate(`/teams/${team.id}?tab=schedule`),
    },
    {
      icon: BarChart3,
      title: "Advanced Stats",
      subtitle: "Deep Player Telemetry",
      description: "EPA, success rates, and advanced metrics",
      action: () => navigate(`/teams/${team.id}?tab=lab`),
    },
    {
      icon: History,
      title: "Team History",
      subtitle: "17 Conference Titles",
      description: "Championship history and legacy",
      action: () => navigate(`/teams/${team.id}?tab=pipeline`),
    },
  ];

  return (
    <Container maxW="1400px" px={{ base: 4, md: 8 }} py={8}>
      {/* Compare Button */}
      <Flex justify="center" mb={8}>
        <Box
          as="button"
          onClick={() => navigate(`/compare?team=${team.id}`)}
          bg="bg.card"
          px={8}
          py={4}
          borderRadius="lg"
          border="1px solid"
          borderColor="whiteAlpha.200"
          _hover={{ borderColor: team.colors.primary, transform: "translateY(-2px)" }}
          transition="all 0.2s"
          display="flex"
          alignItems="center"
          gap={3}
        >
          <Scale size={20} color={team.colors.primary} />
          <Box textAlign="left">
            <Text fontSize="sm" fontWeight="bold" color="text.primary">Compare Team</Text>
            <Text fontSize="xs" color="text.muted">Match up against any HBCU opponent</Text>
          </Box>
        </Box>
      </Flex>

      {/* CTA Grid */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
        {ctas.map((cta, idx) => (
          <Box
            key={idx}
            as="button"
            onClick={cta.action}
            bg="bg.card"
            p={5}
            borderRadius="lg"
            border="1px solid"
            borderColor="whiteAlpha.100"
            _hover={{ borderColor: team.colors.primary, transform: "translateY(-2px)" }}
            transition="all 0.2s"
            textAlign="left"
          >
            <Box
              p={2}
              bg={`${team.colors.primary}20`}
              borderRadius="md"
              color={team.colors.primary}
              w="fit-content"
              mb={3}
            >
              <cta.icon size={20} />
            </Box>
            <Text fontSize="sm" fontWeight="bold" color="text.primary" mb={1}>
              {cta.title}
            </Text>
            <Text fontSize="xs" color={team.colors.primary} mb={2}>
              {cta.subtitle}
            </Text>
            <Text fontSize="xs" color="text.muted">
              {cta.description}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Container>
  );
};

export default TeamCTAs;
