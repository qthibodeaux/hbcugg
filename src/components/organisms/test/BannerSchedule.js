import { Box, Text } from "@chakra-ui/react";
import { GRADIENT, MobileBanner } from "./scheduleBanner/MobileScheduleBanner";
import { BannerTitleArea, BannerGhostWord, BannerControlStrip, BannerDropdown } from "../BannerControls";
import { GAME_CENTER_SEASONS, GAME_CENTER_DEFAULT_SEASON } from "../../molecules/game/SeasonSelector";
import { useState } from "react";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";

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

export const BannerSchedule = ({ season: extSeason, setSeason: extSetSeason } = {}) => {
  const [intSeason, setIntSeason] = useState(GAME_CENTER_DEFAULT_SEASON);
  const season    = extSeason    !== undefined ? extSeason    : intSeason;
  const setSeason = extSetSeason !== undefined ? extSetSeason : setIntSeason;
  const { isMobile } = useLayoutDensity();

  return isMobile
    ? <MobileBanner season={season} setSeason={setSeason} />
    : <DesktopBanner season={season} setSeason={setSeason} />;
};
