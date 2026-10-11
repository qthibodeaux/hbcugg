import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTeam } from "../../hooks/useTeams";
import { useFootballCurrentContext } from "../../hooks/useFootballCurrentContext";
import PageShell from "../../components/layouts/PageShell";
import { BannerTeamDetailPage } from "../../components/organisms/test/BannerTeamDetail";
import CoachesTab from "../../components/organisms/tabs/CoachesTab";
import { Box, Text, Center, Spinner } from "@chakra-ui/react";

/**
 * TeamCoachesPage
 * Direct route for /teams/:teamId/coaches
 */
const TeamCoachesPage = () => {
  const { teamId } = useParams();
  const { data: team, isLoading } = useTeam(teamId);
  const { currentSeason, isLoading: contextLoading } = useFootballCurrentContext();
  const [year, setYear] = useState(2025);

  // Sync with global context on load
  useEffect(() => {
    if (!contextLoading && currentSeason) {
      setYear(currentSeason);
    }
  }, [currentSeason, contextLoading]);

  if (isLoading || contextLoading) {
    return (
      <Box pt="80px" minH="100vh" bg="bg.primary">
        <Center h="400px">
          <Spinner color="brand.500" size="xl" thickness="4px" />
        </Center>
      </Box>
    );
  }

  if (!team) {
    return (
      <Box pt="80px" minH="100vh" bg="bg.primary">
        <Center h="400px">
          <Text color="text.primary" fontWeight="black" letterSpacing="widest">TEAM NOT FOUND</Text>
        </Center>
      </Box>
    );
  }

  return (
    <PageShell>
      <PageShell.Slot cols={4}>
        <BannerTeamDetailPage team={team} season={year} setSeason={setYear} />
      </PageShell.Slot>

      <CoachesTab team={team} year={year} />
    </PageShell>
  );
};

export default TeamCoachesPage;
