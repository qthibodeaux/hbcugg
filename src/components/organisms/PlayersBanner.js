import { Box, Text } from "@chakra-ui/react";
import { BannerGhostWord, BannerTitleArea, BANNER_STRIP_BG } from "./BannerControls";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";

// ─────────────────────────────────────────────────────────────────────────────
// PLAYERS HUB BANNER
//
// Built to the standard locked in AgentDesignBible.md §2b. Replaces the old
// `test/BannerPlayer.js`, which was a player-DETAIL concept (mock athlete,
// borrowed ESPN headshot, invented stat-line ticker) sitting on a hub page —
// a placeholder, never real data. That concept file stays in test/ as the
// reference for a future player-detail banner; it just no longer ships here.
//
// NO CONTROL STRIP. The page's scope controls (search, conference/position/
// class filters, view toggle) all live with the database section further down
// where they actually apply — a strip here would duplicate them. Per §2b a
// banner only carries a strip "if the page has scope/filter controls at all"
// at the banner level, and this one doesn't. That leaves the title area as the
// whole card, so the headline is sized up to fill it.
//
// No kicker, no subtitle — house standard.
// ─────────────────────────────────────────────────────────────────────────────

const GRADIENT = `linear-gradient(115deg, #A855F7 0%, #4A1372 38%, ${BANNER_STRIP_BG} 82%)`;

const Title = ({ fontSize }) => (
  <Box position="relative" zIndex={1}>
    <Text
      fontWeight="black"
      fontStyle="italic"
      color="white"
      textTransform="uppercase"
      lineHeight={0.9}
      letterSpacing="-0.03em"
      fontSize={fontSize}
    >
      Players
    </Text>
  </Box>
);

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
      <BannerGhostWord text="ROSTER" />
      {/* Larger than a banner with a strip would allow — nothing is competing
          for the vertical space here. */}
      <Title fontSize="clamp(2.4rem, 5.5vw, 4.5rem)" />
    </BannerTitleArea>
  </Box>
);

// Mobile — separate render tree, not a responsive variant. Edge-to-edge with
// no border radius, same as every other converted mobile banner.
const MobileBanner = () => (
  <Box
    position="relative"
    overflow="hidden"
    w="full"
    h="var(--app-header-height)"
    bg={GRADIENT}
    display="flex"
    flexDirection="column"
  >
    <BannerTitleArea>
      <BannerGhostWord text="ROSTER" />
      <Title fontSize="clamp(2.6rem, 7vw, 7.5rem)" />
    </BannerTitleArea>
  </Box>
);

export const PlayersBanner = () => {
  const { isMobile } = useLayoutDensity();
  return isMobile ? <MobileBanner /> : <DesktopBanner />;
};

export default PlayersBanner;
