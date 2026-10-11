import { useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import { GAME_CENTER_DEFAULT_SEASON, GAME_CENTER_SEASONS } from "../../molecules/game/SeasonSelector";
import {
  BannerGhostWord,
  BannerTitleArea,
  BannerControlStrip,
  BannerDropdown,
  BannerIconButton,
  BANNER_STRIP_BG,
} from "../BannerControls";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { MobileSectionSwitcher } from "../MobileSectionSwitcher";
import { BottomSheet } from "../BottomSheet";

// Migrated to the banner standard locked in AgentDesignBible.md §2b (2026-07-29) —
// same treatment as BannerSchools/BannerGameCenter: title -> bottom opaque control
// strip, no rotating ticker, real themed dropdown instead of the old native <select>.

const ACCENT = "#A855F7";
const GRADIENT = `linear-gradient(110deg, ${ACCENT} 0%, #6B21A8 28%, #1B0630 58%, ${BANNER_STRIP_BG} 100%)`;

const DesktopBanner = ({ season, setSeason }) => (
  <Box
    position="relative"
    overflow="hidden"
    borderRadius="2xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    h="full"
    w="full"
    bg={GRADIENT}
    display="flex"
    flexDirection="column"
  >
    <BannerTitleArea>
      <BannerGhostWord text="SLATE" />
      <Box position="relative" zIndex={1}>
        <Text fontSize="clamp(2.6rem, 7vw, 7.5rem)" color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.85} letterSpacing="-0.04em" whiteSpace="nowrap">
          Conference Slate
        </Text>
      </Box>
    </BannerTitleArea>

    <BannerControlStrip>
      <BannerDropdown
        label="Season"
        options={GAME_CENTER_SEASONS.map((year) => ({ value: year, label: String(year) }))}
        value={season}
        onChange={setSeason}
      />
    </BannerControlStrip>
  </Box>
);

// Mobile — same pattern as BannerGameCenter/WeekCentralBanner: tier 1 locked
// to nav-bar height, no subtext, section switcher flush against the bottom
// of the gradient (left). Controls beyond the switcher go behind the "+"
// bottom sheet (matching Week Central) rather than sitting inline — this
// page only has one control (Season) today, but the pattern should stay
// consistent regardless of how many controls a given page happens to have.
const MobileBanner = ({ season, setSeason }) => {
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
          <BannerGhostWord text="SLATE" />
          <Box position="relative" zIndex={1}>
            <Text fontSize="clamp(2.6rem, 7vw, 7.5rem)" color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.85} letterSpacing="-0.04em" whiteSpace="nowrap">
              Conference Slate
            </Text>
          </Box>
        </BannerTitleArea>
      </Box>

      <Flex align="flex-start" justify="space-between">
        <MobileSectionSwitcher accent={ACCENT} />
        <Box pt="0.6rem" pr="0.6rem">
          <BannerIconButton ariaLabel="Advanced controls" onClick={() => setIsAdvancedOpen(true)}>
            <Plus size={14} color="white" />
          </BannerIconButton>
        </Box>
      </Flex>

      <BottomSheet isOpen={isAdvancedOpen} onClose={() => setIsAdvancedOpen(false)} title="Conference Slate Controls">
        <Box px="1rem" py="0.85rem">
          <Text fontSize="0.6rem" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mb="0.5rem">
            Season
          </Text>
          <Flex wrap="wrap" gap="0.4rem">
            {GAME_CENTER_SEASONS.map((year) => {
              const isActive = String(year) === String(season);
              return (
                <Box
                  key={year}
                  as="button"
                  type="button"
                  onClick={() => {
                    setSeason(String(year));
                    setIsAdvancedOpen(false);
                  }}
                  px="0.7rem"
                  py="0.4rem"
                  borderRadius="0"
                  bg={isActive ? ACCENT : "#1C1C1F"}
                  border="1px solid"
                  borderColor={isActive ? ACCENT : "whiteAlpha.200"}
                >
                  <Text fontSize="0.7rem" fontWeight="black" color="white">
                    {year}
                  </Text>
                </Box>
              );
            })}
          </Flex>
        </Box>
      </BottomSheet>
    </Box>
  );
};

export const BannerSchedule = ({ season: extSeason, setSeason: extSetSeason } = {}) => {
  const [intSeason, setIntSeason] = useState(GAME_CENTER_DEFAULT_SEASON);
  const season    = extSeason    !== undefined ? extSeason    : intSeason;
  const setSeason = extSetSeason !== undefined ? extSetSeason : setIntSeason;
  const { isMobile } = useLayoutDensity();

  return isMobile
    ? <MobileBanner season={season} setSeason={setSeason} />
    : <DesktopBanner season={season} setSeason={setSeason} />;
};
