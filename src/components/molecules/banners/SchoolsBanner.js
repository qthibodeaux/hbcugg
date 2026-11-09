import { BANNER_STRIP_BG, BannerTitleArea, BannerGhostWord, BannerControlStrip, BannerDropdown, BannerIconButton } from "../../organisms/BannerControls";
import { Box, Text, Flex } from "@chakra-ui/react";
import { GAME_CENTER_SEASONS, GAME_CENTER_DEFAULT_SEASON } from "../game/SeasonSelector";
import { useState } from "react";
import { MobileSectionSwitcher } from "../../organisms/MobileSectionSwitcher";
import { Plus } from "lucide-react";
import { BottomSheet } from "../../organisms/BottomSheet";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";

const SCHOOLS_ACCENT = "#A855F7";

const SCHOOLS_GRADIENT = `linear-gradient(110deg, ${SCHOOLS_ACCENT} 0%, #6B21A8 28%, #1B0630 58%, ${BANNER_STRIP_BG} 100%)`;

const DesktopBannerSchools = ({ season, setSeason }) => (
  <Box
    position="relative"
    overflow="hidden"
    borderRadius="2xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    h="full"
    w="full"
    bg={SCHOOLS_GRADIENT}
    display="flex"
    flexDirection="column"
  >
    <BannerTitleArea>
      <BannerGhostWord text="SCHOOLS" size="clamp(5rem, 16vw, 11.25rem)" />
      <Box position="relative" zIndex={1}>
        <Text
          fontWeight="black"
          fontStyle="italic"
          color="white"
          textTransform="uppercase"
          lineHeight={0.85}
          letterSpacing="-0.04em"
          whiteSpace="nowrap"
          fontSize="clamp(2.6rem, 7vw, 7.5rem)"
        >
          Schools
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

const MobileBannerSchools = ({ season, setSeason }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  return (
    <Box position="relative" overflow="hidden" h="full" w="full" display="flex" flexDirection="column">
      <Box
        position="relative"
        overflow="hidden"
        h="var(--app-header-height)"
        flexShrink={0}
        bg={SCHOOLS_GRADIENT}
        display="flex"
        flexDirection="column"
      >
        <BannerTitleArea>
          <BannerGhostWord text="SCHOOLS" size="clamp(5rem, 16vw, 11.25rem)" />
          <Box position="relative" zIndex={1}>
            <Text
              fontWeight="black"
              fontStyle="italic"
              color="white"
              textTransform="uppercase"
              lineHeight={0.85}
              letterSpacing="-0.04em"
              whiteSpace="nowrap"
              fontSize="clamp(2.6rem, 7vw, 7.5rem)"
            >
              Schools
            </Text>
          </Box>
        </BannerTitleArea>
      </Box>

      <Flex align="flex-start" justify="space-between">
        <MobileSectionSwitcher accent={SCHOOLS_ACCENT} />
        <Box pt="0.6rem" pr="0.6rem">
          <BannerIconButton ariaLabel="Advanced controls" onClick={() => setIsAdvancedOpen(true)}>
            <Plus size={14} color="white" />
          </BannerIconButton>
        </Box>
      </Flex>

      <BottomSheet isOpen={isAdvancedOpen} onClose={() => setIsAdvancedOpen(false)} title="Schools Controls">
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
                    setSeason(year);
                    setIsAdvancedOpen(false);
                  }}
                  px="0.7rem"
                  py="0.4rem"
                  borderRadius="0"
                  bg={isActive ? SCHOOLS_ACCENT : "#1C1C1F"}
                  border="1px solid"
                  borderColor={isActive ? SCHOOLS_ACCENT : "whiteAlpha.200"}
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

export const BannerSchools = ({ season: extSeason, setSeason: extSetSeason } = {}) => {
  const [intSeason, setIntSeason] = useState(GAME_CENTER_DEFAULT_SEASON);
  const season  = extSeason  !== undefined ? extSeason  : intSeason;
  const setSeason = extSetSeason !== undefined ? extSetSeason : setIntSeason;
  const { isMobile } = useLayoutDensity();

  return isMobile
    ? <MobileBannerSchools season={season} setSeason={setSeason} />
    : <DesktopBannerSchools season={season} setSeason={setSeason} />;
};
