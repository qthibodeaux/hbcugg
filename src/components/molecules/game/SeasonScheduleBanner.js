import { useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Filter, Plus } from "lucide-react";
import { GROUPS } from "../../../utils/seasonScheduleModel";
import { GAME_CENTER_SEASONS } from "./SeasonSelector";
import {
  BannerGhostWord, BannerTitleArea, BannerControlStrip, BannerDropdown,
  BannerSegmentedPills, BannerTogglePill, BannerIconButton, BANNER_STRIP_BG,
} from "../../organisms/BannerControls";
import { MobileSectionSwitcher } from "../../organisms/MobileSectionSwitcher";
import { BottomSheet } from "../../organisms/BottomSheet";

const ACCENT = "#A855F7";
const GRADIENT = `linear-gradient(135deg, ${ACCENT} 0%, #260A3D 58%, ${BANNER_STRIP_BG} 100%)`;

// Migrated to the banner standard locked in AgentDesignBible.md §2b (2026-07-29) —
// controls moved from the old right-side vertical column into the bottom opaque
// control strip, native season <select> replaced with the real themed dropdown.
const DesktopScheduleBanner = ({ season, setSeason, groupId, setGroupId, includeNonConference, setIncludeNonConference }) => (
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
      <BannerGhostWord text="SCHED" />
      <Box position="relative" zIndex={1}>
        <Text fontSize="clamp(2.6rem, 7vw, 7.5rem)" color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.85} letterSpacing="-0.04em" whiteSpace="nowrap">
          Season Schedule
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
      <BannerSegmentedPills
        options={Object.entries(GROUPS).map(([id, group]) => ({ value: id, label: group.label }))}
        value={groupId}
        onChange={setGroupId}
      />
      <Box ml="auto">
        <BannerTogglePill
          active={includeNonConference}
          onClick={() => setIncludeNonConference((value) => !value)}
          icon={<Filter size={12} color={includeNonConference ? "#A855F7" : "white"} />}
        >
          Non-Conf {includeNonConference ? "On" : "Off"}
        </BannerTogglePill>
      </Box>
    </BannerControlStrip>
  </Box>
);

// Mobile — tier 1 locked to nav-bar height, no subtext, section switcher on
// its own row (flush left, unchanged from every other page). Below that, a
// dedicated 5-button control bar: Year + the three division quick-toggles
// (set groupId immediately, no sheet) + "+" for Non-Conf, the one thing left
// over. Five buttons needed their own full-width row rather than squeezing
// in next to the switcher — that's a lot more than the single "+" every
// other page has had room for beside it.
const DIVISION_QUICK_BUTTONS = [
  { id: "swac-west", short: "WEST" },
  { id: "swac-east", short: "EAST" },
  { id: "meac", short: "MEAC" },
];

const MobileScheduleBanner = ({ season, setSeason, groupId, setGroupId, includeNonConference, setIncludeNonConference }) => {
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
          <BannerGhostWord text="SCHED" />
          <Box position="relative" zIndex={1}>
            <Text fontSize="clamp(2.6rem, 7vw, 7.5rem)" color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.85} letterSpacing="-0.04em" whiteSpace="nowrap">
              Season Schedule
            </Text>
          </Box>
        </BannerTitleArea>
      </Box>

      <MobileSectionSwitcher accent={ACCENT} />

      <Flex align="stretch" borderTop="1px solid" borderColor="whiteAlpha.100">
        <Box
          as="button"
          type="button"
          onClick={() => setIsAdvancedOpen(true)}
          flexShrink={0}
          px="0.6rem"
          display="flex"
          alignItems="center"
        >
          <Text fontSize="0.7rem" fontWeight="black" color="white" whiteSpace="nowrap">{season}</Text>
        </Box>
        {DIVISION_QUICK_BUTTONS.map((d) => {
          const isActive = groupId === d.id;
          return (
            <Box
              key={d.id}
              as="button"
              type="button"
              onClick={() => setGroupId(d.id)}
              flex="1"
              py="0.55rem"
              bg={isActive ? ACCENT : "transparent"}
              borderLeft="1px solid"
              borderColor="whiteAlpha.100"
            >
              <Text fontSize="0.6rem" fontWeight="black" color="white" textAlign="center" lineClamp={1}>
                {d.short}
              </Text>
            </Box>
          );
        })}
        <Box borderLeft="1px solid" borderColor="whiteAlpha.100" flexShrink={0}>
          <BannerIconButton ariaLabel="Advanced controls" onClick={() => setIsAdvancedOpen(true)}>
            <Plus size={14} color="white" />
          </BannerIconButton>
        </Box>
      </Flex>

      <BottomSheet isOpen={isAdvancedOpen} onClose={() => setIsAdvancedOpen(false)} title="Season Schedule Controls">
        <Box px="1rem" py="0.85rem">
          <Text fontSize="0.6rem" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mb="0.5rem">
            Season
          </Text>
          <Flex wrap="wrap" gap="0.4rem" mb="1.1rem">
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
                  <Text fontSize="0.7rem" fontWeight="black" color="white">{year}</Text>
                </Box>
              );
            })}
          </Flex>

          <BannerTogglePill
            active={includeNonConference}
            onClick={() => setIncludeNonConference((value) => !value)}
            icon={<Filter size={12} color={includeNonConference ? ACCENT : "white"} />}
          >
            Non-Conf {includeNonConference ? "On" : "Off"}
          </BannerTogglePill>
        </Box>
      </BottomSheet>
    </Box>
  );
};

export const SeasonScheduleBanner = ({ isMobile, ...props }) => {
  return isMobile ? <MobileScheduleBanner {...props} /> : <DesktopScheduleBanner {...props} />;
};

export { ACCENT as SEASON_SCHEDULE_ACCENT };
