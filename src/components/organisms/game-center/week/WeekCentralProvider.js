import { useWeekCentralData } from "./useWeekCentralData";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useFootballCurrentContext } from "../../../../hooks/useFootballCurrentContext";
import { GAME_CENTER_DEFAULT_SEASON } from "../../../molecules/game/SeasonSelector";
import {
  getCompactWeekLabel,
  getSelectedGameTheme,
  WEEK_CENTRAL_SEASONS,
} from "./weekCentralAdapter";

const WeekCentralChromeContext = createContext(null);
const WeekCentralSelectionContext = createContext(null);
const WeekCentralActionsContext = createContext(null);

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
  const {
    model, selected, resolvedWeek, isLoading, isError,
    selectedParsedGame, isSelectedParsedGameLoading, playerSeasons, priorPlayerSeasons, leagueAvg,
  } = useWeekCentralData({ season, currentSeason, currentWeek, activeWeek, includeNonConference, selectedId });

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
