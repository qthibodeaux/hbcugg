import { useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { BarChart3, List, User, Users } from "lucide-react";
import PageShell from "../../layouts/PageShell";
import { PlayerGameLog } from "./PlayerGameLog";
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
            <PlayerGameLog player={player} primary={primary} />
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
