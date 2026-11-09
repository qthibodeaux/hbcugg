import { useState } from "react";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import { BannerTitleArea, BannerIconButton } from "../../organisms/BannerControls";
import { MobileSectionSwitcher } from "../../organisms/MobileSectionSwitcher";
import { BottomSheet } from "../../organisms/BottomSheet";

export const MobileRosterHubBanner = ({ team, year, years, onYearChange, bannerName }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const primary = team.colors?.primary ?? "#A855F7";
  const gradient = `linear-gradient(110deg, ${primary} 0%, ${primary} 24%, #140D0F 58%, #0B0B0D 100%)`;

  return (
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
        <Image
          src={team.logo}
          alt=""
          position="absolute"
          right="-1rem"
          top="50%"
          transform="translateY(-50%)"
          w="5.5rem"
          h="5.5rem"
          objectFit="contain"
          opacity={0.24}
          pointerEvents="none"
        />
        <BannerTitleArea>
          <Box position="relative" zIndex={1}>
            <Text
              fontSize="clamp(2.6rem, 7vw, 7.5rem)"
              fontWeight="black"
              fontStyle="italic"
              color="white"
              textTransform="uppercase"
              lineHeight={0.85}
              letterSpacing="-0.04em"
              whiteSpace="nowrap"
            >
              {bannerName}
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

      <BottomSheet isOpen={isAdvancedOpen} onClose={() => setIsAdvancedOpen(false)} title="Roster Profile Controls">
        <Box px="1rem" py="0.85rem">
          <Text fontSize="0.6rem" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mb="0.5rem">
            Season
          </Text>
          <Flex wrap="wrap" gap="0.4rem">
            {years.map((season) => {
              const isActive = Number(season) === Number(year);
              return (
                <Box
                  key={season}
                  as="button"
                  type="button"
                  onClick={() => {
                    onYearChange(Number(season));
                    setIsAdvancedOpen(false);
                  }}
                  px="0.7rem"
                  py="0.4rem"
                  borderRadius="0"
                  bg={isActive ? primary : "#1C1C1F"}
                  border="1px solid"
                  borderColor={isActive ? primary : "whiteAlpha.200"}
                >
                  <Text fontSize="0.7rem" fontWeight="black" color="white">{season}</Text>
                </Box>
              );
            })}
          </Flex>
        </Box>
      </BottomSheet>
    </Box>
  );
};
