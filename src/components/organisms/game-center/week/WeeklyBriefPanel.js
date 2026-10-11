import { Flex, Text } from "@chakra-ui/react";
import { WeekCentralBrief } from "../../../molecules/game/WeekCentralBrief";
import { useWeekCentralSelection } from "./WeekCentralProvider";
import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";

export const WeeklyBriefPanel = () => {
  const {
    selected,
    selectedParsedGame,
    isSelectedParsedGameLoading,
    selectedTheme,
    playerSeasons,
    priorPlayerSeasons,
    leagueAvg,
  } = useWeekCentralSelection();
  const { isMobile } = useLayoutDensity();

  if (!selected) {
    return (
      <Flex h="100%" borderRadius={isMobile ? "0" : "lg"} border="1px solid" borderColor="whiteAlpha.100" bg="bg.secondary" align="center" justify="center">
        <Text fontSize="sm" color="text.muted" fontWeight="bold">
          Select another week or turn non-conference on.
        </Text>
      </Flex>
    );
  }

  return (
    <WeekCentralBrief
      selectedGame={selected}
      parsedGame={selectedParsedGame}
      playerSeasons={playerSeasons}
      priorPlayerSeasons={priorPlayerSeasons}
      leagueAvg={leagueAvg}
      isLoading={isSelectedParsedGameLoading}
      selectedColor={selectedTheme.surface}
      selectedAccent={selectedTheme.accent}
    />
  );
};
