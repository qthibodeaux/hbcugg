import { Box, Text } from "@chakra-ui/react";
import {
  BannerGhostWord,
  BannerTitleArea,
  BANNER_STRIP_BG,
} from "../BannerControls";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { MobileSectionSwitcher } from "../MobileSectionSwitcher";

// Migrated to the banner standard locked in AgentDesignBible.md §2b (2026-07-29) —
// same treatment as BannerSchools: title -> bottom opaque control strip, no
// subtitle/ticker, real themed dropdown instead of the old native <select>.

const ACCENT = "#A855F7";
const GRADIENT = `linear-gradient(110deg, ${ACCENT} 0%, #6B21A8 28%, #1B0630 58%, ${BANNER_STRIP_BG} 100%)`;

const DesktopBanner = () => (
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
      <BannerGhostWord text="GAMES" />
      <Box position="relative" zIndex={1}>
        <Text fontSize="clamp(2.6rem, 7vw, 7.5rem)" color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.85} letterSpacing="-0.04em" whiteSpace="nowrap">
          Game Center
        </Text>
      </Box>
    </BannerTitleArea>
  </Box>
);

// Mobile — separate render. Tier 1 (gradient + ghost word) locked to the nav
// bar's own height via the shared CSS var; tier 2 (controls) is bare below it.
// Standardized 2026-08-28 to the app's one mobile banner control pattern:
// section switcher + "+" advanced-controls sheet (was previously the only
// banner using an inline dropdown here — Schools/Standings/Team Detail/Team
// Schedules/Rosters Hub all already used the sheet).
const MobileBanner = () => (
  (
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
          <BannerGhostWord text="GAMES" />
          <Box position="relative" zIndex={1}>
            <Text fontSize="clamp(2.6rem, 7vw, 7.5rem)" color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.85} letterSpacing="-0.04em" whiteSpace="nowrap">
              Game Center
            </Text>
          </Box>
        </BannerTitleArea>
      </Box>

      <MobileSectionSwitcher accent={ACCENT} />
    </Box>
  )
);

// The hub is a live document — the backend decides which season it describes,
// so this banner carries no season control. Every other Game Center page still
// has one (the manifest lists 7 seasons for those and exactly 1 for the hub).
export const BannerGameCenter = () => {
  const { isMobile } = useLayoutDensity();
  return isMobile ? <MobileBanner /> : <DesktopBanner />;
};
