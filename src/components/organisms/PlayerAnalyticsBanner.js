import { Box, Text } from "@chakra-ui/react";
import {
  BannerGhostWord,
  BannerTitleArea,
  BannerControlStrip,
  BannerDropdown,
  BANNER_STRIP_BG,
} from "./BannerControls";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";

// Production Player Analytics banner — first production banner built directly
// to the standard locked in AgentDesignBible.md §2b (2026-07-29), no legacy
// pattern to migrate from (this page previously had no banner at all).
// Proven out in the Component Lab as #1503/#1504 before being promoted here.

const DIVISIONS = [
  { value: "all", label: "All Divisions" },
  { value: "swac-west", label: "SWAC West" },
  { value: "swac-east", label: "SWAC East" },
  { value: "meac", label: "MEAC" },
];

const POSITION_POOLS = [
  { value: "all", label: "All Positions" },
  { value: "QB", label: "QB" },
  { value: "RB", label: "RB" },
  { value: "WR", label: "WR" },
  { value: "TE", label: "TE" },
  { value: "OL", label: "OL" },
  { value: "DL", label: "DL" },
  { value: "LB", label: "LB" },
  { value: "DB", label: "DB" },
  { value: "ST", label: "K / P" },
];

const DesktopBanner = ({ division, setDivision, positionPool, setPositionPool }) => (
  <Box
    position="relative"
    overflow="hidden"
    borderRadius="2xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    h="full"
    w="full"
    bg={`linear-gradient(115deg, #A855F7 0%, #4A1372 38%, ${BANNER_STRIP_BG} 82%)`}
    display="flex"
    flexDirection="column"
  >
    <BannerTitleArea>
      <BannerGhostWord text="ANALYTICS" />
      <Box position="relative" zIndex={1}>
        <Text fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={0.85} letterSpacing="-0.04em" fontSize="clamp(2.6rem, 7vw, 7.5rem)" whiteSpace="nowrap">
          Player Analytics
        </Text>
      </Box>
    </BannerTitleArea>

    <BannerControlStrip>
      <BannerDropdown label="Season" value="2025" options={[{ value: "2025", label: "2025" }]} minW="6rem" />
      <BannerDropdown label="Division" value={division} onChange={setDivision} options={DIVISIONS} minW="9rem" />
      <BannerDropdown label="Position Pool" value={positionPool} onChange={setPositionPool} options={POSITION_POOLS} minW="9rem" />
    </BannerControlStrip>
  </Box>
);

// Mobile — separate render, not a responsive variant of the desktop markup.
// Tier 1 (gradient + ghost word) is its own box; tier 2 (controls) is bare
// and sits below it, unbordered, so it reads as a distinct block.
const MobileBanner = ({ division, setDivision, positionPool, setPositionPool }) => (
  <Box position="relative" overflow="hidden" h="full" w="full" display="flex" flexDirection="column">
    <Box
      position="relative"
      overflow="hidden"
      flex="1"
      minH={0}
      bg={`linear-gradient(115deg, #A855F7 0%, #4A1372 38%, ${BANNER_STRIP_BG} 82%)`}
      display="flex"
      flexDirection="column"
    >
      <BannerTitleArea>
        <BannerGhostWord text="ANALYTICS" />
        <Box position="relative" zIndex={1}>
          <Text fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={0.85} letterSpacing="-0.04em" fontSize="clamp(2.6rem, 7vw, 7.5rem)" whiteSpace="nowrap">
            Player Analytics
          </Text>
        </Box>
      </BannerTitleArea>
    </Box>

    <BannerControlStrip bg="transparent" borderTop="none">
      <BannerDropdown label="Season" value="2025" options={[{ value: "2025", label: "2025" }]} minW="6rem" />
      <BannerDropdown label="Division" value={division} onChange={setDivision} options={DIVISIONS} minW="9rem" />
      <BannerDropdown label="Position Pool" value={positionPool} onChange={setPositionPool} options={POSITION_POOLS} minW="9rem" />
    </BannerControlStrip>
  </Box>
);

const PlayerAnalyticsBanner = (props) => {
  const { isMobile } = useLayoutDensity();
  return isMobile ? <MobileBanner {...props} /> : <DesktopBanner {...props} />;
};

export default PlayerAnalyticsBanner;
