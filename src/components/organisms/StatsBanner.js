import { Box, Text } from "@chakra-ui/react";
import {
  BannerGhostWord,
  BannerTitleArea,
  BannerControlStrip,
  BannerSegmentedPills,
  BANNER_STRIP_BG,
} from "./BannerControls";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";
import { MobileSectionSwitcher } from "./MobileSectionSwitcher";

// Stats hub banner — AgentDesignBible.md §2b, same construction as
// PlayerAnalyticsBanner. Violet gradient ties every page in the Stats section
// (hub, team analytics, player analytics) to one identity, matching the
// sidebar hub colour in useRouteSideNav.js.
//
// The section switcher lives in the strip rather than as a tab row under the
// banner, which Team Analytics uses. The difference is deliberate: three
// mutually-exclusive views of the same page are what BannerSegmentedPills is
// for, and keeping them in the strip leaves the grid running banner -> cards
// with nothing between, instead of burning a full 260px row on one row of
// tabs. Seven icon-labelled lenses would overflow the strip, so Team Analytics
// keeps its tab row.
//
// The hub carries no scope control. The card feed is built for one season
// (scripts/build_stats_hub_cards.js) and a dropdown with a single option is a
// control in appearance only. It comes back when there is a second season to
// choose.

const GRADIENT = `linear-gradient(115deg, #C084FC 0%, #6D28D9 36%, ${BANNER_STRIP_BG} 84%)`;

const Title = () => (
  <>
    <BannerGhostWord text="NUMBERS" />
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
        Stats
      </Text>
    </Box>
  </>
);

const Controls = ({ section, setSection, sections }) => (
  <BannerSegmentedPills options={sections} value={section} onChange={setSection} />
);

const DesktopBanner = (props) => (
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
    <BannerTitleArea><Title /></BannerTitleArea>
    {props.sections?.length ? <BannerControlStrip><Controls {...props} /></BannerControlStrip> : null}
  </Box>
);

// Mobile — the Game Center mobile pattern: a title tier exactly the nav
// header's height, then the section switcher (Hub · Team Analytics · Team
// Stats · Player Stats) that opens the section's bottom sheet.
const MobileBanner = () => (
  <Box position="relative" overflow="hidden" w="full" display="flex" flexDirection="column">
    <Box position="relative" overflow="hidden" h="var(--app-header-height)" flexShrink={0} bg={GRADIENT} display="flex" flexDirection="column">
      <BannerTitleArea><Title /></BannerTitleArea>
    </Box>
    <MobileSectionSwitcher accent="#A855F7" />
  </Box>
);

const StatsBanner = (props) => {
  const { isMobile } = useLayoutDensity();
  const Banner = isMobile ? MobileBanner : DesktopBanner;
  return <Banner {...props} />;
};

export default StatsBanner;
