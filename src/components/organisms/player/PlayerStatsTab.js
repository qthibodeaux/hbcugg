import { useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { BarChart3, List, User, Users } from "lucide-react";
import PageShell from "../../layouts/PageShell";
import { buildGameLog } from "./statsTabMock";
import PlayerPerformanceCharts from "./PlayerPerformanceCharts";
import PlayerCompareList from "./PlayerCompareList";
import ViewRail from "./ViewRail";
import { PlayerStatsOverview } from "./PlayerStatsOverview";

const VIEWS = [
  { key: "card", label: "Overview", icon: User },
  { key: "logs", label: "Game Log", icon: List },
  { key: "charts", label: "Trends", icon: BarChart3 },
  { key: "compare", label: "Compare", icon: Users },
];

// Flattens each row's category stats into one wide table — prefixing
// columns with the category label only when a position has more than one
// (e.g. a QB's Passing Yds vs Rushing Yds), so single-category positions
// (WR, defense) don't carry a redundant "Receiving" prefix on every column.
const GameLogTable = ({ gameLog, primary }) => {
  const categories = gameLog[0]?.categories ?? [];
  const multiCategory = categories.length > 1;

  return (
    <Box overflowX="auto">
      <Box as="table" w="full" style={{ borderCollapse: "collapse" }}>
        <Box as="thead">
          <Box as="tr" borderBottom="1px solid" borderColor="whiteAlpha.200">
            <Box as="th" px={2} py={2} textAlign="left">
              <Text fontSize="9px" fontWeight="800" color="text.muted" textTransform="uppercase">Wk</Text>
            </Box>
            {categories.flatMap((cat) =>
              cat.columns.map((col) => (
                <Box as="th" key={`${cat.key}-${col.key}`} px={2} py={2} textAlign="right">
                  <Text fontSize="9px" fontWeight="800" color="text.muted" textTransform="uppercase" whiteSpace="nowrap">
                    {multiCategory ? `${cat.label} ${col.label}` : col.label}
                  </Text>
                </Box>
              )),
            )}
          </Box>
        </Box>
        <Box as="tbody">
          {gameLog.map((row) => (
            <Box as="tr" key={row.week} borderBottom="1px solid" borderColor="whiteAlpha.50">
              <Box as="td" px={2} py={2}>
                <Text fontSize="sm" fontWeight="black" fontFamily="mono" color={primary}>
                  {row.week}
                </Text>
              </Box>
              {row.categories.flatMap((cat) =>
                cat.columns.map((col) => (
                  <Box as="td" key={`${cat.key}-${col.key}`} px={2} py={2} textAlign="right">
                    <Text fontSize="sm" fontWeight="700" fontFamily="mono" color="white">
                      {cat.stats[col.key]}
                    </Text>
                  </Box>
                )),
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

const ComingNext = ({ label }) => (
  <Flex flex={1} align="center" justify="center" direction="column" gap={2} minH="200px">
    <Text fontSize="sm" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="0.04em">
      {label}
    </Text>
    <Text fontSize="xs" color="text.muted">
      Coming next in this build pass.
    </Text>
  </Flex>
);

const PlayerStatsTab = ({ player, teamMeta, positionPeers = [] }) => {
  const [activeView, setActiveView] = useState("card");
  const primary = teamMeta?.colors?.primary ?? "#E53E3E";
  const secondary = teamMeta?.colors?.secondary ?? "#FFFFFF";

  const gameLog = buildGameLog(player);

  return (
    <PageShell.Slot cols={4} rows={4}>
      <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" h="full" overflow="hidden">
        <Flex h="full">
          <ViewRail views={VIEWS} active={activeView} onChange={setActiveView} primary={primary} />
          <Box flex={1} minW={0} p={3} overflow="auto">
          {activeView === "card" ? (
            <PlayerStatsOverview
              player={player}
              teamMeta={teamMeta}
              positionPeers={positionPeers}
              primary={primary}
              secondary={secondary}
            />
          ) : activeView === "logs" ? (
            <GameLogTable gameLog={gameLog} primary={primary} />
          ) : activeView === "charts" ? (
            <PlayerPerformanceCharts player={player} primary={primary} secondary={secondary} />
          ) : activeView === "compare" ? (
            <PlayerCompareList player={player} positionPeers={positionPeers} primary={primary} />
          ) : (
            <ComingNext label={VIEWS.find((v) => v.key === activeView)?.label} />
          )}
          </Box>
        </Flex>
      </Box>
    </PageShell.Slot>
  );
};

export default PlayerStatsTab;
