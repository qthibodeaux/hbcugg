import { Box, Grid } from "@chakra-ui/react";
import { PlayerSearchPanel, TeamListPanel } from "./playerAnalytics/SearchPanels";

const PlayerAnalyticsSearchRow = ({
  players,
  isLoading,
  division,
  positionPool,
  query,
  setQuery,
  teamFilter,
  setTeamFilter,
  activePlayer,
  onSelectPlayer,
  onClearPlayer,
}) => (
  <Box bg="bg.primary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" h="full" w="full" p={4} overflow="hidden">
    <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} templateRows="1fr" gap={4} h="full" minH={0}>
      <PlayerSearchPanel
        players={players}
        isLoading={isLoading}
        division={division}
        positionPool={positionPool}
        teamFilter={teamFilter}
        query={query}
        setQuery={setQuery}
        activePlayer={activePlayer}
        onSelect={onSelectPlayer}
        onClear={onClearPlayer}
      />
      <TeamListPanel division={division} teamFilter={teamFilter} setTeamFilter={setTeamFilter} />
    </Grid>
  </Box>
);

export default PlayerAnalyticsSearchRow;

export { teamInDivision } from "./playerAnalytics/SearchPanels";
