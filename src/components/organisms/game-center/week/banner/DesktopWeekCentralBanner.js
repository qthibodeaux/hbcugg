import { Box, Text } from "@chakra-ui/react";
import { GRADIENT, WeekCentralBannerControls } from "./WeekCentralBannerControls";
import { BannerTitleArea, BannerGhostWord } from "../../../BannerControls";

// Desktop Week Central title, actions and committed-control strip.

export const DesktopBanner = ({
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
