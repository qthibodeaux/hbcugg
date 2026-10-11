import { useMemo } from "react";
import { Center, Spinner, Text } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { useRosterHub } from "../../../../hooks/useSWACData";
import PageShell from "../../../layouts/PageShell";
import { RosterHubGrid } from "../../../molecules/roster/RosterHubGrid";
import {
  DEFAULT_ROSTER_HUB_YEAR,
  buildTeamRosterHubModel,
  normalizeRosterHubYear,
} from "../../../../pages/teams/models/rosterHubModel";

const RosterHubTab = ({ team, year = DEFAULT_ROSTER_HUB_YEAR }) => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const season = normalizeRosterHubYear(year);
  const { hub, isLoading } = useRosterHub(season);
  const model = useMemo(
    () => buildTeamRosterHubModel({ team, hub, year: season }),
    [hub, season, team],
  );
  const fullRosterPath = `/teams/${teamId}/roster/full`;

  if (isLoading) {
    return (
      <Center py={16}>
        <Spinner color="brand.500" thickness="3px" size="lg" />
      </Center>
    );
  }

  if (!model.hasData) {
    return (
      <Center py={16} bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg">
        <Text fontSize="sm" color="text.secondary">
          Roster profile data is not available for this team and season.
        </Text>
      </Center>
    );
  }

  return (
    <PageShell embedded>
      <RosterHubGrid
        team={team}
        model={model}
        year={season}
        onFullRoster={() => navigate(fullRosterPath)}
      />
    </PageShell>
  );
};

export default RosterHubTab;
