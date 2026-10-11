import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFootballCurrentContext } from "../../../../hooks/useFootballCurrentContext";
import { useAllPlayersByYear, useLeagueAverages } from "../../../../hooks/useSWACData";
import { gameCenterPaths, fetchJson } from "../../../../utils/gameCenterPayloads";
import { GAME_CENTER_DEFAULT_SEASON } from "../../../molecules/game/SeasonSelector";
import {
  buildWeekCentralModel,
  getCompactWeekLabel,
  getSelectedGameTheme,
  WEEK_CENTRAL_SEASONS,
} from "./weekCentralAdapter";

const WeekCentralChromeContext = createContext(null);
const WeekCentralSelectionContext = createContext(null);
const WeekCentralActionsContext = createContext(null);

// Every season ships a week 1 file; it's the probe for a past season's
// `default_week` when the user hasn't picked a week yet.
const PROBE_WEEK = 1;

export const WeekCentralProvider = ({ children }) => {
  const {
    currentSeason,
    currentWeek,
    phase,
    label: currentContextLabel,
    isLoading: isCurrentContextLoading,
  } = useFootballCurrentContext();
  const [seasonOverride, setSeasonState] = useState(null);
  const [activeWeek, setActiveWeekState] = useState(null);
  const [includeNonConference, setIncludeNonConference] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const season = seasonOverride ?? currentSeason ?? GAME_CENTER_DEFAULT_SEASON;
  const isCurrentSeason = season === currentSeason;

  // Week resolution (Design Doc §3, §8): the user's pick wins; otherwise the
  // current season lands on the context file's week, and a past season lands
  // on that season's `default_week`, learned from a one-time probe fetch.
  const needsProbe = activeWeek == null && !isCurrentSeason;
  const { data: probe } = useQuery({
    queryKey: ["week-central", season, "probe"],
    queryFn: () => fetchJson(gameCenterPaths.weekCentral(season, PROBE_WEEK)),
    staleTime: Infinity,
    retry: false,
    enabled: needsProbe,
  });
  const resolvedWeek = activeWeek
    ?? (isCurrentSeason ? currentWeek : null)
    ?? (Number.isFinite(Number(probe?.default_week)) ? Number(probe.default_week) : null);

  // One request per committed week, keyed on both params so each visited
  // week caches independently and back/forward is instant.
  const { data, isLoading, isError } = useQuery({
    queryKey: ["week-central", season, resolvedWeek],
    queryFn: () => fetchJson(gameCenterPaths.weekCentral(season, resolvedWeek)),
    staleTime: Infinity,
    retry: false,
    enabled: resolvedWeek != null,
  });

  const model = useMemo(() => (
    buildWeekCentralModel({ data, includeNonConference })
  ), [data, includeNonConference]);

  const selected = useMemo(() => (
    model.slate.find((game) => game.id === selectedId) ?? model.slate[0] ?? null
  ), [model.slate, selectedId]);

  // Roster for the season — identity only (headshots, positions); no stat on
  // the brief comes from it. Same source the game page uses.
  const { players: playerSeasons } = useAllPlayersByYear(season);
  // Prior season too — a real headshot under the same person_id where the
  // current roster's URL is dead. Identity only, never a stat.
  const { players: priorPlayerSeasons } = useAllPlayersByYear(Number(season) - 1);
  // League avg / min / max per game-payload field for the season — the notch
  // and the fill scale on the brief's Team Stats block.
  const { data: leagueAvg } = useLeagueAverages(season);

  // The brief panel still reads the parsed game file for the selected game
  // (§5 says `brief` should ride along in the week payload — it doesn't yet;
  // see LAUNCH_0_BACKEND_NOTES.md). Only fetched when the backend says a
  // page exists for it.
  const selectedGameStem = selected?.gamePathId ?? null;
  const selectedHasParsedGame = !!selectedGameStem && selected?.hasGamePage === true;
  const { data: selectedParsedGame, isLoading: isSelectedParsedGameLoading } = useQuery({
    queryKey: ["week-central-brief-game", season, selectedGameStem],
    queryFn: () => fetchJson(gameCenterPaths.gameFile(season, selectedGameStem)),
    staleTime: Infinity,
    retry: false,
    enabled: selectedHasParsedGame,
  });

  // Selector options come from the payload's `weeks[]` — backend owns which
  // weeks exist and what they're called. `game_count: 0` disables the entry.
  const weekOptions = useMemo(() => model.weekEntries.map((entry) => ({
    value: String(entry.week),
    label: getCompactWeekLabel(entry),
    disabled: Number(entry.game_count) === 0,
  })), [model.weekEntries]);

  const seasonOptions = useMemo(() => (
    WEEK_CENTRAL_SEASONS.map((item) => ({ value: String(item), label: String(item) }))
  ), []);

  const currentWeekIndex = model.weeks.indexOf(model.selectedWeek);
  const selectedTheme = useMemo(() => getSelectedGameTheme(selected), [selected]);

  const commitControls = useCallback(({ season: nextSeason, week: nextWeek }) => {
    const parsedSeason = Number(nextSeason);
    const parsedWeek = Number(nextWeek);

    setSeasonState((current) => {
      if (Number.isFinite(parsedSeason) && parsedSeason !== current) {
        setSelectedId(null);
        // A new season resolves its own week (context or probe) unless the
        // user picked one in the same commit.
        if (!Number.isFinite(parsedWeek)) setActiveWeekState(null);
        return parsedSeason;
      }
      return current;
    });

    if (Number.isFinite(parsedWeek)) {
      setActiveWeekState(parsedWeek);
      setSelectedId(null);
    }
  }, []);

  const stepWeek = useCallback((direction) => {
    const index = model.weeks.indexOf(model.selectedWeek);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= model.weeks.length) return;
    setActiveWeekState(model.weeks[nextIndex]);
    setSelectedId(null);
  }, [model.selectedWeek, model.weeks]);

  const goToPreviousWeek = useCallback(() => stepWeek(-1), [stepWeek]);
  const goToNextWeek = useCallback(() => stepWeek(1), [stepWeek]);

  const toggleNonConference = useCallback(() => {
    setIncludeNonConference((value) => !value);
    setSelectedId(null);
  }, []);

  const selectGame = useCallback((id) => setSelectedId(id), []);

  const chromeValue = useMemo(() => ({
    season,
    includeNonConference,
    isLoading: isLoading || isCurrentContextLoading || (resolvedWeek == null && !isError),
    isError,
    weekOptions,
    seasonOptions,
    currentWeekIndex,
    canGoPrev: currentWeekIndex > 0,
    canGoNext: currentWeekIndex >= 0 && currentWeekIndex < model.weeks.length - 1,
    weeks: model.weeks,
    selectedWeek: model.selectedWeek,
    weekLabel: model.weekLabel,
    dateRange: model.dateRange,
    isCurrentWeek: model.isCurrentWeek,
    totals: model.totals,
    currentContext: {
      season: currentSeason,
      week: currentWeek,
      phase,
      label: currentContextLabel,
    },
  }), [
    currentWeekIndex,
    includeNonConference,
    isError,
    isLoading,
    isCurrentContextLoading,
    resolvedWeek,
    model.selectedWeek,
    model.totals,
    model.weekLabel,
    model.weeks,
    model.dateRange,
    model.isCurrentWeek,
    season,
    seasonOptions,
    weekOptions,
    currentSeason,
    currentWeek,
    phase,
    currentContextLabel,
  ]);

  const selectionValue = useMemo(() => ({
    slate: model.slate,
    selected,
    selectedParsedGame,
    isSelectedParsedGameLoading,
    selectedTheme,
    playerSeasons,
    priorPlayerSeasons,
    leagueAvg,
  }), [
    isSelectedParsedGameLoading,
    model.slate,
    selected,
    selectedParsedGame,
    selectedTheme,
    playerSeasons,
    priorPlayerSeasons,
    leagueAvg,
  ]);

  const actionsValue = useMemo(() => ({
    commitControls,
    goToPreviousWeek,
    goToNextWeek,
    toggleNonConference,
    selectGame,
  }), [commitControls, goToNextWeek, goToPreviousWeek, selectGame, toggleNonConference]);

  return (
    <WeekCentralChromeContext.Provider value={chromeValue}>
      <WeekCentralSelectionContext.Provider value={selectionValue}>
        <WeekCentralActionsContext.Provider value={actionsValue}>
          {children}
        </WeekCentralActionsContext.Provider>
      </WeekCentralSelectionContext.Provider>
    </WeekCentralChromeContext.Provider>
  );
};

export const useWeekCentralChrome = () => {
  const value = useContext(WeekCentralChromeContext);
  if (!value) throw new Error("useWeekCentralChrome must be used inside WeekCentralProvider");
  return value;
};

export const useWeekCentralSelection = () => {
  const value = useContext(WeekCentralSelectionContext);
  if (!value) throw new Error("useWeekCentralSelection must be used inside WeekCentralProvider");
  return value;
};

export const useWeekCentralActions = () => {
  const value = useContext(WeekCentralActionsContext);
  if (!value) throw new Error("useWeekCentralActions must be used inside WeekCentralProvider");
  return value;
};
