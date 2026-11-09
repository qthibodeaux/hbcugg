import { useState } from "react";
import { Box, Text, Flex } from "@chakra-ui/react";
import { GRADIENT, ACCENT } from "./WeekCentralBannerControls";
import { BannerTitleArea, BannerGhostWord, BannerIconButton } from "../../../BannerControls";
import { MobileSectionSwitcher } from "../../../MobileSectionSwitcher";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { BottomSheet } from "../../../BottomSheet";
import { WeekCentralAdvancedPanel } from "./WeekCentralAdvancedPanel";

// Mobile Week Central banner, section switcher and control sheet.

export const MobileBanner = ({
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
