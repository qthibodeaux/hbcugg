import { Box, Text } from "@chakra-ui/react";
import {
  BannerGhostWord,
  BannerTitleArea,
  BannerControlStrip,
  BannerDropdown,
  BannerSegmentedPills,
  BANNER_STRIP_BG,
} from "../BannerControls";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";

// Counting-stats banner — same construction as StatsBanner / TeamAnalyticsBanner
// (AgentDesignBible §2b): violet Stats-section gradient, ghost word, title on
// the standard size spec, controls in the strip. Used by /stats/team and
// /stats/player with a different title and control set.
//
// Controls: season dropdown, conference scope pills (All / SWAC / MEAC), and —
// on the player page only — the Offense / Defense side pills that pick which
// tab set is showing.

const GRADIENT = `linear-gradient(115deg, #C084FC 0%, #6D28D9 36%, ${BANNER_STRIP_BG} 84%)`;

const CONFERENCES = [
  { value: "all", label: "All" },
  { value: "SWAC", label: "SWAC" },
  { value: "MEAC", label: "MEAC" },
];

const Title = ({ title, ghost }) => (
  <>
    <BannerGhostWord text={ghost} />
    <Box position="relative" zIndex={1}>
      <Text
        fontWeight="black"
        fontStyle="italic"
        color="white"
        textTransform="uppercase"
        lineHeight={0.85}
        letterSpacing="-0.04em"
        fontSize="clamp(2.6rem, 7vw, 7.5rem)"
        whiteSpace="nowrap"
      >
        {title}
      </Text>
    </Box>
  </>
);

const Controls = ({ season, setSeason, seasons, conference, setConference, side, setSide, sides }) => (
  <>
    <BannerDropdown
      label="Season"
      value={String(season)}
      onChange={(v) => setSeason(Number(v))}
      options={seasons.map((y) => ({ value: String(y), label: String(y) }))}
      minW="6rem"
    />
    <BannerSegmentedPills options={CONFERENCES} value={conference} onChange={setConference} />
    {sides && <BannerSegmentedPills options={sides} value={side} onChange={setSide} />}
  </>
);

const DesktopBanner = ({ title, ghost, ...controls }) => (
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
    <BannerTitleArea><Title title={title} ghost={ghost} /></BannerTitleArea>
    <BannerControlStrip><Controls {...controls} /></BannerControlStrip>
  </Box>
);

const MobileBanner = ({ title, ghost, ...controls }) => (
  <Box position="relative" overflow="hidden" h="full" w="full" display="flex" flexDirection="column">
    <Box position="relative" overflow="hidden" flex="1" minH={0} bg={GRADIENT} display="flex" flexDirection="column">
      <BannerTitleArea><Title title={title} ghost={ghost} /></BannerTitleArea>
    </Box>
    <BannerControlStrip bg="transparent" borderTop="none"><Controls {...controls} /></BannerControlStrip>
  </Box>
);

const CountingStatsBanner = (props) => {
  const { isMobile } = useLayoutDensity();
  const Banner = isMobile ? MobileBanner : DesktopBanner;
  return <Banner {...props} />;
};

export default CountingStatsBanner;
