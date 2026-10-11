import { Box, SimpleGrid } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { useTeam } from "../../hooks/useTeams";
import ContentContainer from "../../components/layouts/ContentContainer";

import TeamHero from "../../components/organisms/TeamHero";
import TeamIdentityBar from "../../components/organisms/TeamIdentityBar";
import AnalyticsCards from "../../components/organisms/AnalyticsCards";
import FeaturedPlayer from "../../components/organisms/FeaturedPlayer";
import MiniStandings from "../../components/organisms/MiniStandings";
import CountdownTimer from "../../components/organisms/CountdownTimer";
import MomentumGraph from "../../components/organisms/MomentumGraph";
import TeamCTAs from "../../components/organisms/TeamCTAs";

const TeamPage = () => {
  const { teamId } = useParams();
  const { data: team, isLoading } = useTeam(teamId);

  if (isLoading) {
    return (
      <Box pt="80px" minH="100vh" bg="bg.primary" display="flex" alignItems="center" justifyContent="center">
        <Box color="text.secondary">Loading team...</Box>
      </Box>
    );
  }

  if (!team) {
    return (
      <Box pt="80px" minH="100vh" bg="bg.primary" display="flex" alignItems="center" justifyContent="center">
        <Box color="text.primary">Team not found</Box>
      </Box>
    );
  }

  return (
    <Box bg="bg.primary" minH="100vh">
      {/* Hero Section */}
      <TeamHero team={team} />
      
      {/* Identity Bar */}
      <TeamIdentityBar team={team} />

      {/* Analytics Cards */}
      <AnalyticsCards team={team} />

      {/* Featured Player & Sidebar */}
      <ContentContainer>
        <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6}>
          {/* Featured Player - Takes up 2 columns */}
          <Box gridColumn={{ lg: "span 2" }}>
            <FeaturedPlayer team={team} />
          </Box>
          
          {/* Sidebar */}
          <Box spaceY={4}>
            <CountdownTimer team={team} />
            <MiniStandings team={team} />
            <MomentumGraph team={team} />
          </Box>
        </SimpleGrid>
      </ContentContainer>

      {/* CTA Section */}
      <TeamCTAs team={team} />
    </Box>
  );
};

export default TeamPage;
