import { useWeekCentralChrome, useWeekCentralActions } from "./WeekCentralProvider";
import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";
import { MobileBanner } from "./banner/MobileWeekCentralBanner";
import { DesktopBanner } from "./banner/DesktopWeekCentralBanner";

export const WeekCentralBanner = () => {
  const {
    season,
    selectedWeek,
    weekLabel,
    seasonOptions,
    weekOptions,
    weeks,
    currentWeekIndex,
    includeNonConference,
    canGoPrev,
    canGoNext,
    isLoading,
  } = useWeekCentralChrome();
  const { commitControls, goToPreviousWeek, goToNextWeek, toggleNonConference } = useWeekCentralActions();
  const { isMobile } = useLayoutDensity();

  const shared = {
    season,
    selectedWeek,
    weekLabel,
    seasonOptions,
    weekOptions,
    weeks,
    currentWeekIndex,
    includeNonConference,
    canGoPrev,
    canGoNext,
    isLoading,
    commitControls,
    goToPreviousWeek,
    goToNextWeek,
    toggleNonConference,
  };

  return isMobile ? <MobileBanner {...shared} /> : <DesktopBanner {...shared} />;
};
