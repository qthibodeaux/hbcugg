import { useMemo } from "react";
import { applyFilters, groupRoster, sortPlayers } from "./roster/rosterListModel";
import { Flex, Spinner, Box, Text } from "@chakra-ui/react";
import PlayersTab from "./roster/PlayersTab";
import { RosterLineList } from "./roster/RosterLineList";

const RosterTab = ({
  team,
  roster = [],
  isLoading = false,
  year = 2025,
  view = "card",
  groupBy = "position",
  sortBy = "jersey",
  filters = { transfersOnly: false, redshirtsOnly: false },
}) => {
  const filteredRoster = useMemo(() => applyFilters(roster, filters), [roster, filters]);
  const groupedRoster = useMemo(() => groupRoster(filteredRoster, groupBy, sortBy), [filteredRoster, groupBy, sortBy]);
  const cardRoster = useMemo(() => sortPlayers(filteredRoster, sortBy), [filteredRoster, sortBy]);

  if (isLoading) {
    return (
      <Flex h="full" minH="180px" align="center" justify="center">
        <Spinner color="brand.500" size="lg" />
      </Flex>
    );
  }

  if (!filteredRoster.length) {
    return (
      <Box py={12} textAlign="center">
        <Text color="text.muted" fontSize="sm">
          {roster.length ? "No players match the current filters." : "No roster data found for this team."}
        </Text>
      </Box>
    );
  }

  return (
    <Box w="full">
      {view === "card" && <PlayersTab team={team} year={year} players={cardRoster} />}
      {view === "line" && <RosterLineList groupedRoster={groupedRoster} team={team} />}
    </Box>
  );
};

export default RosterTab;
