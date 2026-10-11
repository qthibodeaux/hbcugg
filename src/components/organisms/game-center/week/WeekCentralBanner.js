import { useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight, Filter, Plus } from "lucide-react";
import { useWeekCentralActions, useWeekCentralChrome } from "./WeekCentralProvider";
import {
  BannerGhostWord,
  BannerTitleArea,
  BannerControlStrip,
  BannerDropdown,
  BannerIconButton,
  BannerActionButton,
  BannerTogglePill,
  BANNER_STRIP_BG,
} from "../../BannerControls";
import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";
import { MobileSectionSwitcher } from "../../MobileSectionSwitcher";
import { BottomSheet } from "../../BottomSheet";

// Migrated to the banner standard locked in AgentDesignBible.md §2b (2026-07-29).
// Controls moved from the old right-aligned floating cluster into a real opaque
// strip below the title. See src/components/organisms/test/4-1md/Banner System Design Doc.md

const ACCENT = "#A855F7";
const GRADIENT = `linear-gradient(135deg, ${ACCENT} 0%, #260A3D 52%, ${BANNER_STRIP_BG} 100%)`;

const WeekCentralBannerControls = ({
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

const DesktopBanner = ({
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
}) => (
  <Box
    h="full"
    w="full"
    borderRadius="xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    bg={GRADIENT}
    overflow="hidden"
    position="relative"
    display="flex"
    flexDirection="column"
  >
    <BannerTitleArea>
      <BannerGhostWord text="WEEK" />
      <Box position="relative" zIndex={1}>
        <Text fontSize="clamp(2.6rem, 7vw, 7.5rem)" color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.85} letterSpacing="-0.04em" whiteSpace="nowrap">
          Week Central
        </Text>
      </Box>
    </BannerTitleArea>

    <WeekCentralBannerControls
      key={`${season}-${selectedWeek}`}
      season={season}
      selectedWeek={selectedWeek}
      seasonOptions={seasonOptions}
      weekOptions={weekOptions}
      weeks={weeks}
      currentWeekIndex={currentWeekIndex}
      includeNonConference={includeNonConference}
      canGoPrev={canGoPrev}
      canGoNext={canGoNext}
      commitControls={commitControls}
      goToPreviousWeek={goToPreviousWeek}
      goToNextWeek={goToNextWeek}
      toggleNonConference={toggleNonConference}
    />
  </Box>
);

// Advanced sheet content — Season + full week list (jump straight to any week,
// not just ±1) + the Non-Conf toggle. Everything here is "set once, rarely
// touch again," which is why it's a tap deeper than the quick row.
const WeekCentralAdvancedPanel = ({
  season,
  seasonOptions,
  selectedWeek,
  weekOptions,
  includeNonConference,
  isLoading,
  onSeasonSelect,
  onWeekSelect,
  toggleNonConference,
}) => (
  <Box px="1rem" py="0.85rem">
    <Text fontSize="0.6rem" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mb="0.5rem">
      Season
    </Text>
    <Flex wrap="wrap" gap="0.4rem" mb="1.1rem">
      {seasonOptions.map((opt) => {
        const isActive = String(opt.value) === String(season);
        return (
          <Box
            key={opt.value}
            as="button"
            type="button"
            disabled={isLoading}
            onClick={() => onSeasonSelect(opt.value)}
            px="0.7rem"
            py="0.4rem"
            borderRadius="0"
            bg={isActive ? ACCENT : "#1C1C1F"}
            border="1px solid"
            borderColor={isActive ? ACCENT : "whiteAlpha.200"}
            opacity={isLoading ? 0.4 : 1}
          >
            <Text fontSize="0.7rem" fontWeight="black" color="white">
              {opt.label}
            </Text>
          </Box>
        );
      })}
    </Flex>

    <Text fontSize="0.6rem" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mb="0.5rem">
      Week
    </Text>
    <Flex direction="column" gap="0.3rem" mb="1.1rem" maxH="14rem" overflowY="auto">
      {weekOptions.map((opt) => {
        const isActive = String(opt.value) === String(selectedWeek);
        return (
          <Box
            key={opt.value}
            as="button"
            type="button"
            disabled={isLoading}
            onClick={() => onWeekSelect(opt.value)}
            w="full"
            textAlign="left"
            px="0.75rem"
            py="0.6rem"
            borderRadius="0"
            bg={isActive ? "whiteAlpha.100" : "transparent"}
            borderLeft="3px solid"
            borderColor={isActive ? ACCENT : "transparent"}
            opacity={isLoading ? 0.4 : 1}
          >
            <Text fontSize="0.8rem" fontWeight="black" color={isActive ? "white" : "whiteAlpha.700"}>
              {opt.label}
            </Text>
          </Box>
        );
      })}
    </Flex>

    <BannerTogglePill active={includeNonConference} onClick={toggleNonConference} icon={<Filter size={12} color={includeNonConference ? ACCENT : "white"} />}>
      Non-Conf {includeNonConference ? "On" : "Off"}
    </BannerTogglePill>
  </Box>
);

// Mobile — separate render. Tier 1 locked to nav-bar height like the other
// mobile banners. Tier 2: section switcher (left) + a compact quick row
// (right) — prev/next step one week at a time (the actual point of this
// page), the week label opens the same advanced sheet as "+". Season and
// Non-Conf move into that sheet since they're set-once, not tapped constantly.
// Every control here disables while isLoading — today's data is local and
// resolves instantly, but this wiring is what keeps the buttons from getting
// stacked/racing once week data comes from Supabase instead.
const MobileBanner = ({
  season,
  selectedWeek,
  weekLabel,
  seasonOptions,
  weekOptions,
  includeNonConference,
  canGoPrev,
  canGoNext,
  isLoading,
  commitControls,
  goToPreviousWeek,
  goToNextWeek,
  toggleNonConference,
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  return (
    <Box position="relative" overflow="hidden" h="full" w="full" display="flex" flexDirection="column">
      <Box
        position="relative"
        overflow="hidden"
        h="var(--app-header-height)"
        flexShrink={0}
        bg={GRADIENT}
        display="flex"
        flexDirection="column"
      >
        <BannerTitleArea>
          <BannerGhostWord text="WEEK" />
          <Box position="relative" zIndex={1}>
            <Text fontSize="clamp(2.6rem, 7vw, 7.5rem)" color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.85} letterSpacing="-0.04em" whiteSpace="nowrap">
              Week Central
            </Text>
          </Box>
        </BannerTitleArea>
      </Box>

      <Flex align="flex-start" justify="space-between">
        <MobileSectionSwitcher accent={ACCENT} />

        <Flex align="center" gap="0.35rem" pt="0.6rem" pr="0.6rem">
          <BannerIconButton ariaLabel="Previous week" disabled={!canGoPrev || isLoading} onClick={goToPreviousWeek}>
            <ChevronLeft size={14} color="white" />
          </BannerIconButton>
          <Box as="button" type="button" disabled={isLoading} onClick={() => setIsAdvancedOpen(true)} px="0.5rem" opacity={isLoading ? 0.4 : 1}>
            <Text fontSize="0.7rem" fontWeight="black" color="white" whiteSpace="nowrap">
              {weekLabel}
            </Text>
          </Box>
          <BannerIconButton ariaLabel="Next week" disabled={!canGoNext || isLoading} onClick={goToNextWeek}>
            <ChevronRight size={14} color="white" />
          </BannerIconButton>
          <BannerIconButton ariaLabel="Advanced controls" disabled={isLoading} onClick={() => setIsAdvancedOpen(true)}>
            <Plus size={14} color="white" />
          </BannerIconButton>
        </Flex>
      </Flex>

      <BottomSheet isOpen={isAdvancedOpen} onClose={() => setIsAdvancedOpen(false)} title="Week Central Controls">
        <WeekCentralAdvancedPanel
          season={season}
          seasonOptions={seasonOptions}
          selectedWeek={selectedWeek}
          weekOptions={weekOptions}
          includeNonConference={includeNonConference}
          isLoading={isLoading}
          onSeasonSelect={(nextSeason) => {
            commitControls({ season: nextSeason, week: selectedWeek });
            setIsAdvancedOpen(false);
          }}
          onWeekSelect={(nextWeek) => {
            commitControls({ season, week: nextWeek });
            setIsAdvancedOpen(false);
          }}
          toggleNonConference={toggleNonConference}
        />
      </BottomSheet>
    </Box>
  );
};

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
