import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import PageShell from "../../layouts/PageShell";
import { GameBannerScoreboardA } from "../../organisms/test/GameBannerScoreboardA";
import { SummaryTab } from "./summary/SummaryTab";
import { DrivesTab } from "./drives/DrivesTab";
import { BoxScoreTab } from "./boxscore/BoxScoreTab";
import { DataRoomTab } from "./teamstats/DataRoomTab";
import { PlayByPlayTab } from "./pbp/PlayByPlayTab";
import { GamePageMobile } from "./mobile/GamePageMobile";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";

const BANNER_SECTIONS = [
  { id: "summary", label: "Game Summary" },
  { id: "boxscore", label: "Player Stats" },
  { id: "teamstats", label: "Data Room" },
  { id: "drives", label: "Drives" },
  { id: "pbp", label: "Play by Play" },
];

export const GamePageShell = ({
  game,
  isLoading,
  isError,
  activeSection,
  activeTab,
  onTabChange,
  // Data props passed through to tabs
  awayId,
  homeId,
  awayShort,
  homeShort,
  meta,
  teamBox,
  teamStats,
  advancedTeam,
  teamEntries,
  productionScores,
  drives,
  driveSummary,
  plays,
  playerSeasons,
  priorPlayerSeasons = [],
  leagueAvg = null,
}) => {
  const { isMobile } = useLayoutDensity();

  // Phones get their own tree: banner, sticky section header, parts.
  if (isMobile) {
    return (
      <GamePageMobile
        game={game}
        isLoading={isLoading}
        isError={isError}
        activeTab={activeTab}
        onTabChange={onTabChange}
        awayId={awayId}
        homeId={homeId}
        awayShort={awayShort}
        homeShort={homeShort}
        meta={meta}
        teamBox={teamBox}
        teamStats={teamStats}
        advancedTeam={advancedTeam}
        teamEntries={teamEntries}
        productionScores={productionScores}
        drives={drives}
        driveSummary={driveSummary}
        plays={plays}
        playerSeasons={playerSeasons}
        priorPlayerSeasons={priorPlayerSeasons}
        leagueAvg={leagueAvg}
      />
    );
  }

  // Summary tab uses PageShell grid slots; every other tab renders in the
  // scrollable list region under the banner.
  const isSummary = activeSection === "summary";

  const listContent = (
    <>
      {isLoading && (
        <Flex justify="center" py={20}><Spinner color="brand.500" size="xl" /></Flex>
      )}

      {(isError || (!isLoading && !game)) && (
        <Flex justify="center" py={20}><Text color="text.muted">Game data not found.</Text></Flex>
      )}

      {!isLoading && !isError && game && activeSection === "boxscore" && (
        <BoxScoreTab
          game={game}
          playerSeasons={playerSeasons}
          priorPlayerSeasons={priorPlayerSeasons}
          awayId={awayId}
          homeId={homeId}
          productionScores={productionScores}
        />
      )}

      {!isLoading && !isError && game && activeSection === "teamstats" && (
        <DataRoomTab
          awayId={awayId}
          homeId={homeId}
          game={game}
        />
      )}

      {!isLoading && !isError && game && activeSection === "drives" && (
        <DrivesTab driveSummary={game?.drive_summary} awayId={awayId} homeId={homeId} />
      )}

      {!isLoading && !isError && game && activeSection === "pbp" && (
        <PlayByPlayTab
          game={game}
          awayId={awayId}
          homeId={homeId}
          awayShort={awayShort}
          homeShort={homeShort}
          drives={drives}
        />
      )}

      {!isLoading && !isError && game && !["summary", "boxscore", "teamstats", "drives", "pbp"].includes(activeSection) && (
        <Flex justify="center" py={20}>
          <Text color="text.muted" fontSize="sm">
            {BANNER_SECTIONS.find((s) => s.id === activeSection)?.label} — coming soon
          </Text>
        </Flex>
      )}
    </>
  );

  return (
    <PageShell listContent={listContent}>
      {/* Banner — always first */}
      {game && (
        <PageShell.Slot cols={4} overflow="visible">
          <Box position="relative" h="full">
            {/* Export — the four shareable images, on their own route. */}
            <Box
              as={Link}
              to={`/game/${game.game_path_id ?? game.game_id ?? ""}/export`}
              position="absolute" top="0.75rem" right="0.75rem" zIndex={5}
              px={3} py={1.5} borderRadius="md"
              bg="whiteAlpha.200" _hover={{ bg: "whiteAlpha.300" }}
              fontSize="10px" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.16em"
            >
              Export game
            </Box>
            <GameBannerScoreboardA game={game} activeTab={activeTab} onTabChange={onTabChange} />
          </Box>
        </PageShell.Slot>
      )}

      {/* Summary Tab Grid Slots */}
      {!isLoading && !isError && game && isSummary && (
        <SummaryTab
          game={game}
          awayId={awayId}
          homeId={homeId}
          meta={meta}
          teamBox={teamBox}
          teamStats={teamStats}
          advancedTeam={advancedTeam}
          teamEntries={teamEntries}
          playerSeasons={playerSeasons}
          priorPlayerSeasons={priorPlayerSeasons}
          leagueAvg={leagueAvg}
          productionScores={productionScores}
          drives={drives}
          driveSummary={driveSummary}
          plays={plays}
        />
      )}
    </PageShell>
  );
};
