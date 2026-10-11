import { useState } from "react";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { IS_DEMO } from "./config/demo";

import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { system } from "./theme";
import MainLayout from "./components/layouts/MainLayout";
import Header from "./components/organisms/Header";
import MobileMenu from "./components/organisms/nav/MobileMenu";
import Home from "./pages/Home";
import ComponentLab from "./pages/ComponentLab";
import PageLab from "./pages/PageLab";
import GridTestPage from "./pages/GridTestPage";
import Teams from "./pages/teams/Teams";
import TeamProfilePage from "./pages/teams/TeamProfilePage";
import TeamIndividualSchedulePage from "./pages/teams/TeamSchedulePage";
import TeamRosterHubPage from "./pages/teams/TeamRosterHubPage";
import TeamRosterFullPage from "./pages/teams/TeamRosterFullPage";
import TeamCoachesPage from "./pages/teams/TeamCoachesPage";
import TeamStatsPage from "./pages/teams/TeamStatsPage";

import GamePage from "./pages/game-center/GamePage";
import GamePreviewPage from "./pages/game-center/GamePreviewPage";
import GamePreviewExportPage from "./pages/game-center/GamePreviewExportPage";
import GameExportPage from "./pages/game-center/GameExportPage";
import GamePageMagazineRoute from "./pages/game-center/GamePageMagazineRoute";
import GameSummaryPacketLabRoute from "./pages/game-center/GameSummaryPacketLabRoute";
import GameBoxScorePacketLabRoute from "./pages/game-center/GameBoxScorePacketLabRoute";
import GameTeamStatsPacketLabRoute from "./pages/game-center/GameTeamStatsPacketLabRoute";
import GameCenterPage from "./pages/game-center/GameCenterPage";
import GamesHubPage from "./pages/game-center/GamesHubPage";
import GameCenterMicroHubPage from "./pages/game-center/GameCenterMicroHubPage";
import GameCenterLayoutLabPage from "./pages/game-center/GameCenterLayoutLabPage";
import WeekCentralPage from "./pages/game-center/WeekCentralPage";
import WeekCentralExperimentPage from "./pages/game-center/WeekCentralExperimentPage";
import WeekCentralEditorialLabPage from "./pages/game-center/WeekCentralEditorialLabPage";
import StandingsExperimentPage from "./pages/game-center/StandingsExperimentPage";
import TestGamePage from "./pages/game-center/TestGamePage";
import ConferenceSlatePage from "./pages/game-center/ConferenceSlatePage";
import SeasonSchedulePage from "./pages/game-center/SeasonSchedulePage";
import TeamSchedulePage from "./pages/game-center/TeamSchedulePage";
import ClassicsHomecomingHubPage from "./pages/game-center/ClassicsHomecomingHubPage";
import SchedulePage from "./pages/schedule/SchedulePage";
import PeopleHubPage from "./pages/people/PeopleHubPage";
import PlayersPage from "./pages/players/PlayersPage";
import RostersPage from "./pages/players/RostersPage";
import PlayerDetailPage from "./pages/players/PlayerDetailPage";
import CoachesPage from "./pages/coaches/CoachesPage";
import CoachDetailPage from "./pages/coaches/CoachDetailPage";
import OfficialsPage from "./pages/officials/OfficialsPage";
import StatsPage from "./pages/stats/StatsPage";
import TeamCountingStatsPage from "./pages/stats/TeamCountingStatsPage";
import PlayerCountingStatsPage from "./pages/stats/PlayerCountingStatsPage";
import StatLabPage from "./pages/stats/StatLabPage";
import TeamAnalyticsPage from "./pages/analytics/TeamAnalyticsPage";
import PlayerAnalyticsPage from "./pages/analytics/PlayerAnalyticsPage";
import GloryPage from "./pages/glory/GloryPage";
import StandingsPage from "./pages/game-center/StandingsPage";
import SchoolsWikiPage from "./pages/teams/SchoolsWikiPage";
import StadiumsPage from "./pages/teams/StadiumsPage";
import SchoolWikiDetailPage from "./pages/teams/SchoolWikiDetailPage";
import SchoolWikiEditorialLabPage from "./pages/teams/SchoolWikiEditorialLabPage";

import { TestedDesignsPage } from "./components/organisms/test/TestedDesignsPage";
import { ConferenceWikiPageLabA } from "./components/organisms/test/ConferenceWikiPageLabA";

// GitHub Pages has no server rewrites, so the demo uses hash URLs (/#/stats).
const Router = IS_DEMO ? HashRouter : BrowserRouter;


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={system}>
        <Router>
            <MainLayout>
              <Header onMenuOpen={() => setIsMenuOpen(true)} />
              
              <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/game-center" element={<GameCenterPage />} />
                <Route path="/game-center/games" element={<GamesHubPage />} />
                <Route path="/game-center/week" element={<WeekCentralPage />} />
                <Route path="/game-center/week/:season/:week" element={<GameCenterMicroHubPage mode="week" />} />
                <Route path="/game-center/conferenceslate" element={<ConferenceSlatePage />} />
                <Route path="/game-center/conferenceslate/:year" element={<ConferenceSlatePage />} />
                <Route path="/game-center/schedule" element={<ConferenceSlatePage />} />
                <Route path="/game-center/schedule/:season" element={<ConferenceSlatePage />} />
                <Route path="/game-center/seasonschedule" element={<SeasonSchedulePage />} />
                <Route path="/game-center/seasonschedule/:year" element={<SeasonSchedulePage />} />
                <Route path="/game-center/team" element={<TeamSchedulePage />} />
                <Route path="/game-center/team/:teamId/:season" element={<GameCenterMicroHubPage mode="team" />} />
                <Route path="/game-center/standings" element={<StandingsPage />} />
                <Route path="/game-center/standings/:season" element={<GameCenterMicroHubPage mode="standings" />} />
                <Route path="/game-center/classics-homecoming" element={<ClassicsHomecomingHubPage />} />
                <Route path="/game-center/rankings/:season" element={<GameCenterMicroHubPage mode="rankings" />} />
                {!IS_DEMO && <Route path="/lab/game-center-layout" element={<GameCenterLayoutLabPage />} />}
                {!IS_DEMO && <Route path="/lab/week-central-experiment" element={<WeekCentralExperimentPage />} />}
                {!IS_DEMO && <Route path="/lab/week-central-editorial" element={<WeekCentralEditorialLabPage />} />}
                {!IS_DEMO && <Route path="/lab/standings-experiment" element={<StandingsExperimentPage />} />}
                {!IS_DEMO && <Route path="/lab/school-wiki-editorial" element={<SchoolWikiEditorialLabPage />} />}
                {!IS_DEMO && <Route path="/lab/conference-wiki" element={<ConferenceWikiPageLabA />} />}
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/schools" element={<Teams />} />
                <Route path="/schools/wiki" element={<SchoolsWikiPage />} />
                <Route path="/schools/stadiums" element={<StadiumsPage />} />
                <Route path="/schools/stadiums/:venueId" element={<StadiumsPage />} />
                <Route path="/teams/:teamId" element={<TeamProfilePage />} />
                <Route path="/teams/:teamId/schedule" element={<TeamIndividualSchedulePage />} />
                <Route path="/teams/:teamId/roster" element={<TeamRosterHubPage />} />
                <Route path="/teams/:teamId/roster/hub" element={<TeamRosterHubPage />} />
                <Route path="/teams/:teamId/roster/full" element={<TeamRosterFullPage />} />
                <Route path="/teams/:teamId/coaches" element={<TeamCoachesPage />} />
                <Route path="/teams/:teamId/coaches/hub" element={<TeamCoachesPage />} />
                <Route path="/teams/:teamId/wiki" element={<SchoolWikiDetailPage />} />
                <Route path="/teams/:teamId/stats" element={<TeamStatsPage />} />
                <Route path="/schools/:teamId/wiki" element={<SchoolWikiDetailPage />} />
                <Route path="/people" element={<PeopleHubPage />} />
                <Route path="/players" element={<PlayersPage />} />
                <Route path="/players/:playerKey" element={<PlayerDetailPage />} />
                <Route path="/rosters" element={<RostersPage defaultMode="team" />} />
                <Route path="/rosters/full" element={<RostersPage defaultMode="team" />} />
                <Route path="/rosters/breakdown" element={<RostersPage defaultMode="league" />} />
                <Route path="/player/:playerKey" element={<PlayerDetailPage />} />
                <Route path="/coaches" element={<CoachesPage />} />
                <Route path="/coaches/:coachId" element={<CoachDetailPage />} />
                <Route path="/officials" element={<OfficialsPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/stats/team" element={<TeamCountingStatsPage />} />
                <Route path="/stats/player" element={<PlayerCountingStatsPage />} />
                <Route path="/stat-lab" element={<StatLabPage />} />
                <Route path="/team-analytics" element={<TeamAnalyticsPage />} />
                <Route path="/player-analytics" element={<PlayerAnalyticsPage />} />
                <Route path="/glory" element={<GloryPage />} />
                <Route path="/game/pvamutsu" element={<GamePage />} />
                <Route path="/game/preview/:gameId" element={<GamePreviewPage />} />
                <Route path="/game/preview/:gameId/export" element={<GamePreviewExportPage />} />
                <Route path="/game/:gameId/export" element={<GameExportPage />} />
                <Route path="/game/:gameId" element={<GamePage />} />
                {!IS_DEMO && <Route path="/lab/game-magazine/:gameId" element={<GamePageMagazineRoute />} />}
                {!IS_DEMO && <Route path="/lab/game-summary-packet/:gameId" element={<GameSummaryPacketLabRoute />} />}
                {!IS_DEMO && <Route path="/lab/game-box-score/:gameId" element={<GameBoxScorePacketLabRoute />} />}
                {!IS_DEMO && <Route path="/lab/game-team-stats/:gameId" element={<GameTeamStatsPacketLabRoute />} />}
                {!IS_DEMO && <Route path="/lab/test-gamepage" element={<TestGamePage />} />}
                {!IS_DEMO && <Route path="/lab/components" element={<ComponentLab />} />}
                {!IS_DEMO && <Route path="/lab/pages" element={<PageLab />} />}
                {!IS_DEMO && <Route path="/lab/tested-designs" element={<TestedDesignsPage />} />}
                {!IS_DEMO && <Route path="/lab/grid" element={<GridTestPage />} />}
              </Routes>
            </MainLayout>
          </Router>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
