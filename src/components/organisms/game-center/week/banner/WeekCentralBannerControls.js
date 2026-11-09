import { BANNER_STRIP_BG, BannerControlStrip, BannerDropdown, BannerIconButton, BannerActionButton, BannerTogglePill } from "../../../BannerControls";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Box } from "@chakra-ui/react";

// Week Central banner colors and staged season/week controls with explicit commit.

export const ACCENT = "#A855F7";

export const GRADIENT = `linear-gradient(135deg, ${ACCENT} 0%, #260A3D 52%, ${BANNER_STRIP_BG} 100%)`;

export const WeekCentralBannerControls = ({
  season,
  selectedWeek,
  seasonOptions,
  weekOptions,
  weeks,
  currentWeekIndex,
  includeNonConference,
  canGoPrev,
  canGoNext,
  commitControls,
  goToPreviousWeek,
  goToNextWeek,
  toggleNonConference,
}) => {
  const [draftSeason, setDraftSeason] = useState(String(season));
  const [draftWeek, setDraftWeek] = useState(String(selectedWeek));
  const dirty = Number(draftSeason) !== Number(season) || Number(draftWeek) !== Number(selectedWeek);

  const commit = () => commitControls({ season: draftSeason, week: draftWeek });
  const handlePreviousWeek = () => {
    if (!canGoPrev) return;
    const nextWeek = weeks[currentWeekIndex - 1];
    setDraftWeek(String(nextWeek));
    goToPreviousWeek();
  };
  const handleNextWeek = () => {
    if (!canGoNext) return;
    const nextWeek = weeks[currentWeekIndex + 1];
    setDraftWeek(String(nextWeek));
    goToNextWeek();
  };

  return (
    <BannerControlStrip>
      <BannerDropdown label="Season" value={draftSeason} onChange={setDraftSeason} options={seasonOptions} minW="7rem" />
      <BannerIconButton ariaLabel="Previous week" disabled={!canGoPrev} onClick={handlePreviousWeek}>
        <ChevronLeft size={14} color="white" />
      </BannerIconButton>
      <BannerDropdown label="Week" value={draftWeek} onChange={setDraftWeek} options={weekOptions} minW="7rem" />
      <BannerIconButton ariaLabel="Next week" disabled={!canGoNext} onClick={handleNextWeek}>
        <ChevronRight size={14} color="white" />
      </BannerIconButton>
      <BannerActionButton disabled={!dirty} onClick={commit}>
        Go
      </BannerActionButton>
      <Box ml="auto">
        <BannerTogglePill active={includeNonConference} onClick={toggleNonConference} icon={<Filter size={12} color={includeNonConference ? "#A855F7" : "white"} />}>
          Non-Conf {includeNonConference ? "On" : "Off"}
        </BannerTogglePill>
      </Box>
    </BannerControlStrip>
  );
};
