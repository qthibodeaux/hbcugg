import { useParams } from "react-router-dom";
import { useTeam } from "../../hooks/useTeams";
import { useTeamScheduleData } from "../../hooks/useTeamScheduleData";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";
import PageShell from "../../components/layouts/PageShell";
import { Box, Text, Center, Spinner } from "@chakra-ui/react";
import { TeamScheduleSummaryBand } from "../../components/molecules/schedule/TeamScheduleSummaryBand";
import { TeamScheduleList } from "../../components/molecules/schedule/TeamScheduleList";

/**
 * TeamSchedulePage
 * Direct route for /teams/:teamId/schedule
 */
const TeamSchedulePage = () => {
  const { teamId } = useParams();
  const { data: team, isLoading } = useTeam(teamId);
  const { isMobile } = useLayoutDensity();
  const scheduleTeamId = team?.exportId?.replace(/25$/, "") ?? null;
  const {
    season,
    setSeason,
    seasonGames,
    completed,
    upcoming,
    scheduleAccent,
    isLoading: scheduleLoading,
    isError: scheduleError,
  } = useTeamScheduleData({ fixedTeamId: scheduleTeamId });

  if (isLoading || scheduleLoading) {
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

  const listContent = scheduleError ? (
    <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={8} textAlign="center">
      <Text color="text.muted">Unable to load schedule for this team.</Text>
    </Box>
  ) : (
    <TeamScheduleList
      accent={scheduleAccent}
      seasonGames={seasonGames}
      completed={completed}
      upcoming={upcoming}
      team={team}
      season={season}
    />
  );

  // Mobile — no PageShell (desktop grid concept), no page padding, no
  // rounded corners: the band and the schedule list run edge-to-edge.
  if (isMobile) {
    return (
      <Box minH="100vh" bg="bg.primary" pt="var(--app-header-height)">
        <TeamScheduleSummaryBand team={team} season={season} setSeason={setSeason} seasonGames={seasonGames} />
        {listContent}
      </Box>
    );
  }

  return (
    <PageShell listContent={listContent}>
      <PageShell.Slot cols={4}>
        <TeamScheduleSummaryBand team={team} season={season} setSeason={setSeason} seasonGames={seasonGames} />
      </PageShell.Slot>
    </PageShell>
  );
};

export default TeamSchedulePage;
