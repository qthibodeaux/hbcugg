import { BANNER_STRIP_BG, BannerTitleArea, BannerGhostWord, BannerIconButton } from "../../BannerControls";
import { useState } from "react";
import { Box, Text, Flex } from "@chakra-ui/react";
import { MobileSectionSwitcher } from "../../MobileSectionSwitcher";
import { Plus } from "lucide-react";
import { BottomSheet } from "../../BottomSheet";
import { GAME_CENTER_SEASONS } from "../../../molecules/game/SeasonSelector";

const ACCENT = "#A855F7";

export const GRADIENT = `linear-gradient(110deg, ${ACCENT} 0%, #6B21A8 28%, #1B0630 58%, ${BANNER_STRIP_BG} 100%)`;

export const MobileBanner = ({ season, setSeason }) => {
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
          <BannerGhostWord text="SLATE" />
          <Box position="relative" zIndex={1}>
            <Text fontSize="clamp(2.6rem, 7vw, 7.5rem)" color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.85} letterSpacing="-0.04em" whiteSpace="nowrap">
              Conference Slate
            </Text>
          </Box>
        </BannerTitleArea>
      </Box>

      <Flex align="flex-start" justify="space-between">
        <MobileSectionSwitcher accent={ACCENT} />
        <Box pt="0.6rem" pr="0.6rem">
          <BannerIconButton ariaLabel="Advanced controls" onClick={() => setIsAdvancedOpen(true)}>
            <Plus size={14} color="white" />
          </BannerIconButton>
        </Box>
      </Flex>

      <BottomSheet isOpen={isAdvancedOpen} onClose={() => setIsAdvancedOpen(false)} title="Conference Slate Controls">
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
