import { useState } from "react";
import { BANNER_STRIP_BG, BannerTitleArea, BannerIconButton } from "../../../organisms/BannerControls";
import { Box, Image, Text, Flex } from "@chakra-ui/react";
import { getBannerName, SEASONS } from "./bannerPresentation";
import { MobileSectionSwitcher } from "../../../organisms/MobileSectionSwitcher";
import { Plus } from "lucide-react";
import { BottomSheet } from "../../../organisms/BottomSheet";

// Phone team-detail banner, section switcher and season sheet.

export const MobileBannerTeamDetail = ({ team, season, setSeason }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const primary = team.colors?.primary ?? "#A855F7";
  const gradient = `linear-gradient(110deg, ${primary} 0%, ${primary}88 25%, #0B0B0D 58%, ${BANNER_STRIP_BG} 100%)`;

  return (
    // Gradient lives on the title tier only, same as every other mobile
    // banner (Schools, Game Center, etc.) — it used to live on this outer
    // box as a workaround for PageShell forcing this slot to a fixed 160px
    // row on mobile, stretching the gradient across leftover dead space so
    // it read as a fade-tail instead of a gap. TeamDetails.js no longer
    // renders this banner inside PageShell on mobile (2026-08-28), so the
    // box is its natural height now and that workaround just made the
    // gradient's vivid portion stretch further down than every other
    // banner's, instead of ending at the same 64px title tier as the rest.
    <Box position="relative" overflow="hidden" h="full" w="full" display="flex" flexDirection="column">
      <Box
        position="relative"
        overflow="hidden"
        h="var(--app-header-height)"
        flexShrink={0}
        bg={gradient}
        display="flex"
        flexDirection="column"
      >
        <BannerTitleArea>
          <Box position="absolute" right="-1rem" top="50%" style={{ transform: "translateY(-50%)" }} pointerEvents="none">
            <Image src={team.logo} alt="" w="5.5rem" h="5.5rem" objectFit="contain" style={{ opacity: 0.25 }} />
          </Box>
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
              {getBannerName(team)}
            </Text>
          </Box>
        </BannerTitleArea>
      </Box>

      <Flex align="flex-start" justify="space-between">
        <MobileSectionSwitcher accent={primary} />
        <Box pt="0.6rem" pr="0.6rem">
          <BannerIconButton ariaLabel="Advanced controls" onClick={() => setIsAdvancedOpen(true)}>
            <Plus size={14} color="white" />
          </BannerIconButton>
        </Box>
      </Flex>

      <BottomSheet isOpen={isAdvancedOpen} onClose={() => setIsAdvancedOpen(false)} title={`${getBannerName(team)} Controls`}>
        <Box px="1rem" py="0.85rem">
          <Text fontSize="0.6rem" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mb="0.5rem">
            Season
          </Text>
          <Flex wrap="wrap" gap="0.4rem">
            {SEASONS.map((year) => {
              const isActive = Number(year) === Number(season);
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
                  bg={isActive ? primary : "#1C1C1F"}
                  border="1px solid"
                  borderColor={isActive ? primary : "whiteAlpha.200"}
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
