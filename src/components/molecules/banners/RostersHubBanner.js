import { BANNER_STRIP_BG, BannerTitleArea, BannerGhostWord, BannerControlStrip, BannerDropdown, BannerIconButton } from "../../organisms/BannerControls";
import { Box, Text, Flex } from "@chakra-ui/react";
import { GAME_CENTER_SEASONS, GAME_CENTER_DEFAULT_SEASON } from "../game/SeasonSelector";
import { useState } from "react";
import { MobileSectionSwitcher } from "../../organisms/MobileSectionSwitcher";
import { Plus } from "lucide-react";
import { BottomSheet } from "../../organisms/BottomSheet";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";

const ROSTERS_HUB_ACCENT = "#A855F7";

const ROSTERS_HUB_GRADIENT = `linear-gradient(110deg, ${ROSTERS_HUB_ACCENT} 0%, #6B21A8 28%, #1B0630 58%, ${BANNER_STRIP_BG} 100%)`;

const DesktopBannerRostersHub = ({ season, onSelectSeason, seasons }) => (
  <Box
    position="relative"
    overflow="hidden"
    borderRadius="2xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    h="full"
    w="full"
    bg={ROSTERS_HUB_GRADIENT}
    display="flex"
    flexDirection="column"
  >
    <BannerTitleArea>
      <BannerGhostWord text="ROSTER" />
      <Box position="relative" zIndex={1}>
        <Text fontSize="clamp(2.6rem, 7vw, 7.5rem)" color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.85} letterSpacing="-0.04em" whiteSpace="nowrap">
          Rosters Hub
        </Text>
      </Box>
    </BannerTitleArea>

    <BannerControlStrip>
      <BannerDropdown
        label="Season"
        options={(seasons ?? GAME_CENTER_SEASONS).map((year) => ({ value: year, label: String(year) }))}
        value={season}
        onChange={onSelectSeason}
      />
    </BannerControlStrip>
  </Box>
);

const MobileBannerRostersHub = ({ season, setPendingSeason, onApplySeason, seasons }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const seasonOptions = seasons ?? GAME_CENTER_SEASONS;

  return (
    <Box position="relative" overflow="hidden" h="full" w="full" display="flex" flexDirection="column">
      <Box
        position="relative"
        overflow="hidden"
        h="var(--app-header-height)"
        flexShrink={0}
        bg={ROSTERS_HUB_GRADIENT}
        display="flex"
        flexDirection="column"
      >
        <BannerTitleArea>
          <BannerGhostWord text="ROSTER" />
          <Box position="relative" zIndex={1}>
            <Text fontSize="clamp(2.6rem, 7vw, 7.5rem)" color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.85} letterSpacing="-0.04em" whiteSpace="nowrap">
              Rosters Hub
            </Text>
          </Box>
        </BannerTitleArea>
      </Box>

      <Flex align="flex-start" justify="space-between">
        <MobileSectionSwitcher accent={ROSTERS_HUB_ACCENT} />
        <Box pt="0.6rem" pr="0.6rem">
          <BannerIconButton ariaLabel="Advanced controls" onClick={() => setIsAdvancedOpen(true)}>
            <Plus size={14} color="white" />
          </BannerIconButton>
        </Box>
      </Flex>

      <BottomSheet isOpen={isAdvancedOpen} onClose={() => setIsAdvancedOpen(false)} title="Rosters Hub Controls">
        <Box px="1rem" py="0.85rem">
          <Text fontSize="0.6rem" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mb="0.5rem">
            Season
          </Text>
          <Flex wrap="wrap" gap="0.4rem">
            {seasonOptions.map((year) => {
              const isActive = String(year) === String(season);
              return (
                <Box
                  key={year}
                  as="button"
                  type="button"
                  onClick={() => {
                    setPendingSeason(year);
                    onApplySeason(year);
                    setIsAdvancedOpen(false);
                  }}
                  px="0.7rem"
                  py="0.4rem"
                  borderRadius="0"
                  bg={isActive ? ROSTERS_HUB_ACCENT : "#1C1C1F"}
                  border="1px solid"
                  borderColor={isActive ? ROSTERS_HUB_ACCENT : "whiteAlpha.200"}
                >
                  <Text fontSize="0.7rem" fontWeight="black" color="white">{year}</Text>
                </Box>
              );
            })}
          </Flex>
        </Box>
      </BottomSheet>
    </Box>
  );
};

export const BannerRostersHub = ({
  season: extSeason,
  pendingSeason: extPendingSeason,
  setPendingSeason: extSetPendingSeason,
  onApplySeason,
  seasons,
} = {}) => {
  const [intSeason, setIntSeason] = useState(GAME_CENTER_DEFAULT_SEASON);
  const [intPendingSeason, setIntPendingSeason] = useState(
    GAME_CENTER_DEFAULT_SEASON,
  );

  const season = extSeason !== undefined ? extSeason : intSeason;
  const pendingSeason =
    extPendingSeason !== undefined ? extPendingSeason : intPendingSeason;
  const setPendingSeason =
    extSetPendingSeason !== undefined ? extSetPendingSeason : setIntPendingSeason;

  const hasPendingChange = Number(pendingSeason) !== Number(season);
  const applySeason = (year) => {
    if (year === undefined && !hasPendingChange) return;
    if (onApplySeason) {
      onApplySeason(year);
      return;
    }
    setIntSeason(year ?? pendingSeason);
  };

  const { isMobile } = useLayoutDensity();
  if (isMobile) {
    return (
      <MobileBannerRostersHub
        season={season}
        setPendingSeason={setPendingSeason}
        onApplySeason={applySeason}
        seasons={seasons}
      />
    );
  }

  return (
    <DesktopBannerRostersHub
      season={season}
      onSelectSeason={(year) => {
        setPendingSeason(year);
        applySeason(year);
      }}
      seasons={seasons}
    />
  );
};
