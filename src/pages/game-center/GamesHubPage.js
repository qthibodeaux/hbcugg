import { useGamesHubData } from "../../hooks/useGamesHubData";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";
import { useColorScheme } from "../../theme/colorScheme";
import { useRef } from "react";
import { pickWeeks, GamesHubWeekPoster } from "../../components/game/export/GamesHubWeekPoster";
import GamesHubBanner from "../../components/molecules/game/GamesHubBanner";
import { GAME_CENTER_SEASONS } from "../../components/molecules/game/SeasonSelector";
import teamsData from "../../data/teams.json";
import { Box, Flex, Spinner } from "@chakra-ui/react";
import { GamesGrid } from "../../components/molecules/game/gamesGrid/GamesGrid";
import PageShell from "../../components/layouts/PageShell";
import { ExportCardButton } from "../../components/organisms/stats/ExportCardButton";
import { paletteOf } from "../../components/molecules/export/posterPalette";

const GamesHubPage = () => {
  const {
    season,
    setSeason,
    weekFilter,
    setWeekFilter,
    teamFilter,
    setTeamFilter,
    conferenceFilter,
    setConferenceFilter,
    statusFilter,
    setStatusFilter,
    availableWeeks,
    filteredGames,
    allGames,
    isLoading,
  } = useGamesHubData();

  const { isMobile } = useLayoutDensity();

  // Quick export: last week's results and the coming week's games, as one poster.
  const [scheme] = useColorScheme();
  const posterRef = useRef(null);
  const weeks = pickWeeks(allGames);

  // On load, and on each season switch, scroll to the last week played. A ref
  // callback on that week's first cell does it the moment the cell mounts —
  // no effect; `jumped` keeps it to once per season so filtering never yanks
  // the page.
  const jumped = useRef(null);
  const jumpRef = (el) => {
    if (!el || jumped.current === season) return;
    jumped.current = season;
    requestAnimationFrame(() => el.scrollIntoView({ block: "start" }));
  };

  const banner = (
    <GamesHubBanner
      seasons={GAME_CENTER_SEASONS}
      teams={teamsData.teams}
      season={season}
      week={weekFilter}
      teamId={teamFilter}
      conference={conferenceFilter}
      status={statusFilter}
      weeks={availableWeeks}
      onSeasonChange={(value) => setSeason(value)}
      onWeekChange={setWeekFilter}
      onConferenceChange={setConferenceFilter}
      onTeamChange={setTeamFilter}
      onStatusChange={setStatusFilter}
    />
  );

  // Phones: own tree, not PageShell — banner edge to edge, then the grid flush.
  if (isMobile) {
    return (
      <Box minH="100vh" bg="bg.primary" pt="var(--app-header-height)">
        {banner}
        {isLoading ? (
          <Flex align="center" justify="center" minH="200px">
            <Spinner color="brand.500" size="lg" />
          </Flex>
        ) : (
          <GamesGrid games={filteredGames} mobile jumpRef={jumpRef} />
        )}
      </Box>
    );
  }

  // The grid rides in PageShell's list region rather than a Slot: the shell's
  // grid tracks are a fixed `clamp(200px, 24vw, 320px)` each, so a slot clips at
  // its row span instead of growing with its contents. A whole season is however
  // many rows it is, and the page scrolls.
  return (
    <PageShell
      listContent={
        isLoading ? (
          <Flex align="center" justify="center" minH="200px">
            <Spinner color="brand.500" size="lg" />
          </Flex>
        ) : (
          <>
            {(weeks.last || weeks.next) && (
              <Flex justify="flex-end" mb={2}>
                <ExportCardButton target={posterRef} filename={() => `games-hub-week-${weeks.next?.week ?? weeks.last?.week}-${season}-${scheme}.png`} />
              </Flex>
            )}
            <GamesGrid games={filteredGames} jumpRef={jumpRef} />
            {/* Export source: off screen, full size. */}
            <Box position="fixed" left="-20000px" top={0} aria-hidden="true" pointerEvents="none">
              <GamesHubWeekPoster pal={paletteOf(scheme)} innerRef={posterRef} season={season} last={weeks.last} next={weeks.next} />
            </Box>
          </>
        )
      }
    >
      <PageShell.Slot cols={4}>{banner}</PageShell.Slot>
    </PageShell>
  );
};

export default GamesHubPage;
