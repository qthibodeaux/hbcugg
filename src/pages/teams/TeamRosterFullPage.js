import { buildFullRoster } from "./models/fullRosterModel";
import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTeam } from "../../hooks/useTeams";
import { useAllPlayersByYear, usePlayerStatsEnriched } from "../../hooks/useSWACData";
import { useFootballCurrentContext } from "../../hooks/useFootballCurrentContext";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";
import PageShell from "../../components/layouts/PageShell";
import { BannerTeamDetailPage } from "../../components/organisms/test/BannerTeamDetail";
import RosterTab from "../../components/organisms/tabs/RosterTab";
import { RosterViewControlBar } from "../../components/molecules/roster/RosterViewControlBar";
import { Box, Text, Center, Spinner } from "@chakra-ui/react";
import { GAME_CENTER_SEASONS } from "../../components/molecules/game/SeasonSelector";

// Single shared launch.0 year scope — see GAME_CENTER_SEASONS.
const ROSTER_FULL_YEARS = GAME_CENTER_SEASONS;
const DEFAULT_ROSTER_FULL_YEAR = 2025;

const VIEW_MODES = new Set(["card", "line"]);

const normalizeRosterYear = (year) => {
  const numericYear = Number(year);
  return ROSTER_FULL_YEARS.includes(numericYear) ? numericYear : DEFAULT_ROSTER_FULL_YEAR;
};

/**
 * TeamRosterFullPage
 * Direct route for /teams/:teamId/roster/full
 */
const TeamRosterFullPage = () => {
  const { isMobile } = useLayoutDensity();
  const { teamId } = useParams();
  const { data: team, isLoading } = useTeam(teamId);
  const { currentSeason, isLoading: contextLoading } = useFootballCurrentContext();
  const [searchParams] = useSearchParams();
  const [view, setView] = useState(() => {
    const requested = searchParams.get("view");
    return VIEW_MODES.has(requested) ? requested : "card";
  });
  const [groupBy, setGroupBy] = useState("position");
  const [sortBy, setSortBy] = useState("jersey");
  const [filters, setFilters] = useState({ transfersOnly: false, redshirtsOnly: false });
  const toggleFilter = (key) => setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  const [selectedYear, setSelectedYear] = useState(() => searchParams.has("year") ? normalizeRosterYear(searchParams.get("year")) : null);
  const year = selectedYear ?? normalizeRosterYear(currentSeason ?? DEFAULT_ROSTER_FULL_YEAR);
  const { players, isLoading: rosterLoading } = useAllPlayersByYear(year, { exactSeason: true });
  const { players: enrichedPlayers, isLoading: statsLoading } = usePlayerStatsEnriched();
  const teamRosterId = team?.exportId?.replace(/25$/, "") ?? null;
  const roster = useMemo(
    () => buildFullRoster({ enrichedPlayers, players, teamRosterId, year }),
    [enrichedPlayers, players, teamRosterId, year],
  );

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

  const listContent = (
      <RosterTab
        team={team}
        roster={roster}
        isLoading={rosterLoading || (year === 2025 && statsLoading)}
        year={year}
        view={view}
        groupBy={groupBy}
        sortBy={sortBy}
        filters={filters}
      />
  );

  const banner = (
    <BannerTeamDetailPage
      team={team}
      season={year}
      setSeason={(nextYear) => setSelectedYear(normalizeRosterYear(nextYear))}
    />
  );

  const controlBar = (
    <RosterViewControlBar
      team={team}
      season={year}
      rosterCount={roster.length}
      roster={roster}
      view={view}
      onViewChange={setView}
      groupBy={groupBy}
      onGroupByChange={setGroupBy}
      sortBy={sortBy}
      onSortByChange={setSortBy}
      filters={filters}
      onToggleFilter={toggleFilter}
    />
  );

  // Mobile — no PageShell: its fixed row unit forced the control bar to a
  // full row height, which is what left the gap between the banner and the
  // bar and the dead space beneath the controls. Sized to content instead,
  // edge to edge, square.
  if (isMobile) {
    return (
      <Box minH="100vh" bg="bg.primary" pt="var(--app-header-height)">
        {banner}
        {controlBar}
        {listContent}
      </Box>
    );
  }

  return (
    <PageShell listContent={listContent}>
      <PageShell.Slot cols={4}>
        {banner}
      </PageShell.Slot>
      <PageShell.Slot cols={4}>
        {controlBar}
      </PageShell.Slot>
    </PageShell>
  );
};

export default TeamRosterFullPage;
