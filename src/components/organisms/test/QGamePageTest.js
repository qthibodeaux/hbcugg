import { useState } from "react";
import { Box, Text, Spinner } from "@chakra-ui/react";
import PageShell from "../../layouts/PageShell";
import { useGameData, useAllPlayersByYear } from "../../../hooks/useSWACData";
import { GameBannerScoreboardA } from "./GameBannerScoreboardA";
import QGamePageSummary from "./QGamePageSummary";
import QGameBoxScore from "./QGameBoxScore";

const LAB_GAME_ID = "W15pvamujsu";
const LAB_SEASON = 2025;

function QGamePageTest() {
  const [activeTab, setActiveTab] = useState("Summary");
  const { game, isLoading, isError } = useGameData(LAB_GAME_ID, LAB_SEASON);
  const { players: playerSeasons } = useAllPlayersByYear(LAB_SEASON);

  return (
    <PageShell>
      {/* Banner */}
      <PageShell.Slot cols={4}>
        <GameBannerScoreboardA game={game} activeTab={activeTab} onTabChange={setActiveTab} />
      </PageShell.Slot>

      {/* Tab Content */}
      <PageShell.Slot cols={4} rows={12}>
        {isLoading && (
          <Box w="full" h="full" display="flex" alignItems="center" justifyContent="center">
            <Spinner size="xl" color="brand.500" />
            <Text ml={4} color="text.muted" fontSize="sm">Loading game data…</Text>
          </Box>
        )}
        {isError && (
          <Box w="full" h="full" display="flex" alignItems="center" justifyContent="center">
            <Text color="brand.400" fontWeight="bold">Failed to load game data</Text>
          </Box>
        )}
        {!isLoading && !isError && game && (
          <PageShell embedded>
            {activeTab === "Summary" && (
              <PageShell.Slot cols={4}>
                <QGamePageSummary game={game} />
              </PageShell.Slot>
            )}
            {activeTab === "Box Score" && (
              <>
                <PageShell.Slot cols={4} rows={2}>
                  <QGameBoxScore.Passing game={game} playerSeasons={playerSeasons} />
                </PageShell.Slot>
                <PageShell.Slot cols={4} rows={2}>
                  <QGameBoxScore.Rushing game={game} />
                </PageShell.Slot>
              </>
            )}
            {activeTab === "Play By Play" && (
              <PageShell.Slot cols={4}>
                <Box p={6} bg="bg.card" border="1px solid" borderColor="whiteAlpha.100" w="full" h="full">
                  <Text color="text.secondary">Play By Play — coming next</Text>
                </Box>
              </PageShell.Slot>
            )}
            {activeTab === "Team Stats" && (
              <PageShell.Slot cols={4}>
                <Box p={6} bg="bg.card" border="1px solid" borderColor="whiteAlpha.100" w="full" h="full">
                  <Text color="text.secondary">Team Stats — coming next</Text>
                </Box>
              </PageShell.Slot>
            )}
          </PageShell>
        )}
      </PageShell.Slot>
    </PageShell>
  );
}

export default QGamePageTest;
