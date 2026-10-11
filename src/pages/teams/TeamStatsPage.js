import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTeam } from "../../hooks/useTeams";
import { useFootballCurrentContext } from "../../hooks/useFootballCurrentContext";
import PageShell from "../../components/layouts/PageShell";
import { BannerTeamDetailPage } from "../../components/organisms/test/BannerTeamDetail";
import { 
  TeamRankingsCard, 
  IndividualLeadersGrid 
} from "../../components/molecules/schools/TeamStatsModules";
import { Box, Text, Center, Spinner, Badge } from "@chakra-ui/react";

// Mock Data (To be replaced with useTeamStats hook once available)
const TEAM_STATS = [
  { category: "Scoring Offense", value: "42.5", rank: 1, avg: "Points/Game" },
  { category: "Total Offense", value: "487.2", rank: 3, avg: "Yards/Game" },
  { category: "Passing Offense", value: "287.4", rank: 5, avg: "Yards/Game" },
  { category: "Rushing Offense", value: "199.8", rank: 2, avg: "Yards/Game" },
  { category: "Scoring Defense", value: "21.3", rank: 2, avg: "Points/Game" },
  { category: "Total Defense", value: "312.4", rank: 4, avg: "Yards/Game" },
];

const INDIVIDUAL_LEADERS = [
  { category: "Passing", player: "KJ Cooper", stat: "2,847 yds", rank: 3 },
  { category: "Rushing", player: "Tyree Williams", stat: "1,124 yds", rank: 2 },
  { category: "Receiving", player: "Chris Davis", stat: "892 yds", rank: 5 },
  { category: "Sacks", player: "Marcus Green", stat: "8.5 sacks", rank: 3 },
];

/**
 * TeamStatsPage
 * Direct route for /teams/:teamId/stats
 */
const TeamStatsPage = () => {
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

      <PageShell.Slot cols={2}>
        <TeamRankingsCard stats={TEAM_STATS} />
      </PageShell.Slot>

      <PageShell.Slot cols={2}>
        <IndividualLeadersGrid leaders={INDIVIDUAL_LEADERS} />
      </PageShell.Slot>

      {/* Future Performance Slots (Efficiency, Red Zone, Turnovers) */}
      <PageShell.Slot cols={1}>
        <Box 
          bg="bg.card" p={5} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" h="full"
          display="flex" flexDirection="column" justifyContent="center" alignItems="center"
        >
          <Text fontSize="10px" color="text.muted" fontWeight="bold">RED ZONE EFFICIENCY</Text>
          <Text fontSize="4xl" fontWeight="black" color="brand.400">92%</Text>
          <Badge colorPalette="green" size="xs">#1 SWAC</Badge>
        </Box>
      </PageShell.Slot>

      <PageShell.Slot cols={1}>
        <Box 
          bg="bg.card" p={5} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" h="full"
          display="flex" flexDirection="column" justifyContent="center" alignItems="center"
        >
          <Text fontSize="10px" color="text.muted" fontWeight="bold">TURNOVER MARGIN</Text>
          <Text fontSize="4xl" fontWeight="black" color="text.primary">+8</Text>
          <Badge colorPalette="green" size="xs">#2 SWAC</Badge>
        </Box>
      </PageShell.Slot>

    </PageShell>
  );
};

export default TeamStatsPage;
