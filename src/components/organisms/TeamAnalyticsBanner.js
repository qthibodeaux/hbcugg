import { Box, Image, Text } from "@chakra-ui/react";
import {
  BannerGhostWord,
  BannerTitleArea,
  BannerControlStrip,
  BannerDropdown,
  BANNER_STRIP_BG,
} from "./BannerControls";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";

// Team Analytics banner — AgentDesignBible.md §2b, built to match
// StatsBanner and PlayerAnalyticsBanner so the whole Stats section reads as
// one place. Replaces the page's old bare ContentContainer header.
//
// Season is the page's only scope control. Team is NOT here (2026-09-21):
// the team is a sub-selection of the Profile tab — the picker under the
// tiles and the sidebar switcher own it, and Trends follows whatever the
// URL says. Matchup's two teams stay in the tab body: they're arguments to
// that view, not page scope.
//
// Week deliberately does NOT live here. Only one tab is weekly, so week is that
// card's own scope and its control sits on the card (see WeekReviewTab). A
// control that steers exactly one of eight tabs is not page scope.
//
// A control the current tab does not read is dimmed, never removed, so the
// strip never reflows underneath you as you move between tabs.

const GRADIENT = `linear-gradient(115deg, #9333EA 0%, #3B0764 40%, ${BANNER_STRIP_BG} 84%)`;

const Title = ({ logo }) => (
  <>
    <BannerGhostWord text="TEAMS" />
    {logo && (
      <Image
        src={logo}
        alt=""
        position="absolute"
        right="-38px"
        bottom="-10px"
        w={{ base: "220px", lg: "300px" }}
        opacity={0.18}
        pointerEvents="none"
        zIndex={0}
      />
    )}
    <Box position="relative" zIndex={1}>
      <Text
        fontWeight="black"
        fontStyle="italic"
        color="white"
        textTransform="uppercase"
        lineHeight={0.85}
        letterSpacing="-0.04em"
        fontSize="clamp(2.6rem, 7vw, 7.5rem)" whiteSpace="nowrap"
      >
        Team Analytics
      </Text>
    </Box>
  </>
);

const Controls = ({ season, setSeason, seasons, seasonDisabled }) => (
  <BannerDropdown
    label="Season"
    value={String(season)}
    onChange={(v) => setSeason(Number(v))}
    options={seasons.map((y) => ({ value: String(y), label: String(y) }))}
    minW="6rem"
    disabled={seasonDisabled}
    disabledHint="This view spans every season"
  />
);

const DesktopBanner = ({ logo, ...controls }) => (
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
    <BannerTitleArea><Title logo={logo} /></BannerTitleArea>
    <BannerControlStrip><Controls {...controls} /></BannerControlStrip>
  </Box>
);

const MobileBanner = ({ logo, ...controls }) => (
  <Box position="relative" overflow="hidden" h="full" w="full" display="flex" flexDirection="column">
    <Box position="relative" overflow="hidden" flex="1" minH={0} bg={GRADIENT} display="flex" flexDirection="column">
      <BannerTitleArea><Title logo={logo} /></BannerTitleArea>
    </Box>
    <BannerControlStrip bg="transparent" borderTop="none"><Controls {...controls} /></BannerControlStrip>
  </Box>
);

const TeamAnalyticsBanner = (props) => {
  const { isMobile } = useLayoutDensity();
  const Banner = isMobile ? MobileBanner : DesktopBanner;
  return <Banner {...props} />;
};

export default TeamAnalyticsBanner;
