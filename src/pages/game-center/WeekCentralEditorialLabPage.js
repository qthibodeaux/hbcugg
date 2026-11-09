import { useState, useMemo } from "react";
import { DEFAULT_SEASON, fetcher, getSeasonGames, getGameWeek, getWeekLabel, isHBCUTeam, buildLabGame, getSelectedGameTheme, getCompactWeekLabel, SEASONS } from "./weekEditorial/editorialModel";
import { useQuery } from "@tanstack/react-query";
import { gameCenterPaths } from "../../utils/gameCenterPayloads";
import PageShell from "../../components/layouts/PageShell";
import { Flex, Spinner, Box, Text, Grid } from "@chakra-ui/react";
import { SelectControl, IconButton, TogglePill } from "./weekEditorial/EditorialControls";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { SlateRow } from "./weekEditorial/SlateRow";
import { WeekCentralBrief } from "../../components/molecules/game/WeekCentralBrief";

const WeekCentralEditorialLabPage = () => {
  const [season, setSeason] = useState(DEFAULT_SEASON);
  const [activeWeek, setActiveWeek] = useState(null);
  const [includeNonConference, setIncludeNonConference] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["week-central-editorial-lab", season],
    queryFn: () => fetcher(gameCenterPaths.weekCentral(season)),
    staleTime: Infinity,
    retry: false,
  });

  const { weeks, selectedWeek, weekLabel, slate, selected, totals } = useMemo(() => {
    const games = getSeasonGames(data, season).filter((game) => getGameWeek(game) != null);
    const weeks = [...new Set(games.map(getGameWeek))].sort((a, b) => a - b);
    const defaultWeek = weeks.includes(6) ? 6 : weeks[0] ?? 1;
    const selectedWeek = activeWeek != null && weeks.includes(Number(activeWeek)) ? Number(activeWeek) : defaultWeek;
    const allWeekGames = games.filter((game) => getGameWeek(game) === selectedWeek);
    const weekLabel = getWeekLabel(selectedWeek, allWeekGames);
    const filtered = includeNonConference
      ? allWeekGames
      : allWeekGames.filter((game) => isHBCUTeam(game.team_id) && isHBCUTeam(game.opponent_id));
    const slate = filtered
      .map((game) => buildLabGame(game, weekLabel))
      .sort((a, b) => {
        const priority = Number(a.isOutsideOpponent) - Number(b.isOutsideOpponent);
        if (priority !== 0) return priority;
        return String(a.rawGame.date ?? "").localeCompare(String(b.rawGame.date ?? ""));
      });
    const selected = slate.find((game) => game.id === selectedId) ?? slate[0] ?? null;
    const totals = {
      all: allWeekGames.length,
      visible: slate.length,
      hbcu: slate.filter((game) => game.bothHBCU).length,
      outside: slate.filter((game) => game.isOutsideOpponent).length,
    };

    return { weeks, selectedWeek, weekLabel, slate, selected, totals };
  }, [data, season, activeWeek, includeNonConference, selectedId]);

  const selectedTheme = getSelectedGameTheme(selected);
  const selectedGameStem = selected?.rawGame?.parsed_game_stem ?? null;
  const selectedHasParsedGame = !!selectedGameStem && !!selected?.rawGame?.has_parsed_game;
  const { data: selectedParsedGame, isLoading: isSelectedParsedGameLoading } = useQuery({
    queryKey: ["week-central-brief-game", season, selectedGameStem],
    queryFn: () => fetcher(gameCenterPaths.gameFile(season, selectedGameStem)),
    staleTime: Infinity,
    retry: false,
    enabled: selectedHasParsedGame,
  });

  const seasonGames = getSeasonGames(data, season);
  const weekOptions = weeks.map((week) => {
    const games = seasonGames.filter((game) => getGameWeek(game) === week);
    return { value: String(week), label: getCompactWeekLabel(week, games) };
  });
  const seasonOptions = SEASONS.map((item) => ({ value: String(item), label: String(item) }));
  const currentWeekIndex = weeks.indexOf(selectedWeek);
  const canGoPrev = currentWeekIndex > 0;
  const canGoNext = currentWeekIndex >= 0 && currentWeekIndex < weeks.length - 1;

  if (isLoading) {
    return (
      <PageShell>
        <PageShell.Slot cols={4}>
          <Flex h="100%" align="center" justify="center">
            <Spinner color="brand.500" size="lg" />
          </Flex>
        </PageShell.Slot>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageShell.Slot cols={4}>
        <Box h="100%" w="100%" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" bg="linear-gradient(135deg, #E53E3E 0%, #2A090A 52%, #0B0B0D 100%)" overflow="hidden">
          <Flex h="100%" align="center" justify="space-between" px={{ base: 5, lg: 8 }} gap={5}>
            <Box>
              <Text fontSize="10px" color="whiteAlpha.800" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
                Game Center
              </Text>
              <Text fontSize={{ base: "3xl", lg: "5xl" }} color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.9}>
                Week Central
              </Text>
              <Text mt={3} fontSize="10px" color="whiteAlpha.700" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
                {season} - {weekLabel} - {totals.visible} visible games - {totals.hbcu} HBCU matchups
              </Text>
            </Box>
            <Flex align="center" gap={2} wrap="wrap" justify="end" maxW="560px">
              <SelectControl
                label="Season"
                icon={<CalendarDays size={13} />}
                value={String(season)}
                onChange={(value) => setSeason(Number(value))}
                options={seasonOptions}
                minW="108px"
              />
              <IconButton label="Previous week" icon={<ChevronLeft size={15} />} disabled={!canGoPrev} onClick={() => canGoPrev && setActiveWeek(weeks[currentWeekIndex - 1])} />
              <SelectControl
                label="Week"
                icon={null}
                value={String(selectedWeek)}
                onChange={(value) => setActiveWeek(Number(value))}
                options={weekOptions}
                minW="108px"
              />
              <IconButton label="Next week" icon={<ChevronRight size={15} />} disabled={!canGoNext} onClick={() => canGoNext && setActiveWeek(weeks[currentWeekIndex + 1])} />
              <TogglePill active={includeNonConference} onClick={() => setIncludeNonConference((value) => !value)}>
                Non-conf {includeNonConference ? "on" : "off"}
              </TogglePill>
            </Flex>
          </Flex>
        </Box>
      </PageShell.Slot>

      <PageShell.Slot cols={4} rows={5}>
        <Grid h="100%" minH={0} w="100%" templateColumns="minmax(0, 1.65fr) minmax(280px, 0.85fr)" gap={3}>
          <Box h="100%" minH={0} borderRadius="lg" border="1px solid" borderColor="whiteAlpha.100" bg="bg.secondary" overflow="hidden" display="flex" flexDirection="column">
            <Flex flexShrink={0} align="center" justify="space-between" px={5} py={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
              <Text fontSize="2xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1}>
                {weekLabel}
              </Text>
            </Flex>
            <Flex direction="column" gap={2} p={3} flex="1 1 auto" minH={0} overflowY="auto" overflowX="hidden">
              {slate.map((game) => (
                <SlateRow key={game.id} game={game} selected={game.id === selected.id} onSelect={() => setSelectedId(game.id)} />
              ))}
              {slate.length === 0 && (
                <Flex h="100%" align="center" justify="center">
                  <Text fontSize="sm" color="text.muted" fontWeight="bold">
                    No games available for this filter.
                  </Text>
                </Flex>
              )}
            </Flex>
          </Box>
          {selected ? (
            <WeekCentralBrief
              selectedGame={selected}
              parsedGame={selectedParsedGame}
              isLoading={isSelectedParsedGameLoading}
              selectedColor={selectedTheme.surface}
              selectedAccent={selectedTheme.accent}
            />
          ) : (
            <Flex h="100%" borderRadius="lg" border="1px solid" borderColor="whiteAlpha.100" bg="bg.secondary" align="center" justify="center">
              <Text fontSize="sm" color="text.muted" fontWeight="bold">
                Select another week or turn non-conference on.
              </Text>
            </Flex>
          )}
        </Grid>
      </PageShell.Slot>
    </PageShell>
  );
};

export default WeekCentralEditorialLabPage;
