import { useState } from "react";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import { BannerTitleArea, BannerControlStrip, BannerDropdown, BannerIconButton } from "../../organisms/BannerControls";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { MobileSectionSwitcher } from "../../organisms/MobileSectionSwitcher";
import { BottomSheet } from "../../organisms/BottomSheet";

const getBannerName = (team) => team?.bannerName ?? team?.name ?? "Roster Profile";

// Migrated onto the current banner standard: title tier on top (just the
// team name — no "Roster Hub" kicker, no year/division/identity subline),
// opaque bottom control strip below holding the real Season control instead
// of the old right-side panel with a native <select>.
const DesktopRosterHubBanner = ({ team, year, years, onYearChange }) => {
  const primary = team.colors?.primary ?? "#A855F7";
  const gradient = `linear-gradient(110deg, ${primary} 0%, ${primary} 24%, #140D0F 58%, #0B0B0D 100%)`;

  return (
    <Box
      w="full"
      h="full"
      position="relative"
      overflow="hidden"
      borderRadius="2xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg={gradient}
      display="flex"
      flexDirection="column"
    >
      {/* Corner logo — standardized to the School Schedule banner's spec:
          right="-38px", 220/300px, opacity 0.18, across every school-specific
          banner instead of drifting per-component. */}
      <Image
        src={team.logo}
        alt=""
        position="absolute"
        right="-38px"
        top="50%"
        transform="translateY(-50%)"
        w={{ base: "220px", xl: "300px" }}
        h={{ base: "220px", xl: "300px" }}
        objectFit="contain"
        opacity={0.18}
        pointerEvents="none"
      />

      <Text
        position="absolute"
        left="0"
        bottom="-18px"
        fontWeight="black"
        fontStyle="italic"
        color="white"
        opacity={0.05}
        textTransform="uppercase"
        lineHeight={1}
        whiteSpace="nowrap"
        pointerEvents="none"
        style={{ fontSize: "clamp(72px, 14vw, 170px)" }}
      >
        {team.mascot}
      </Text>

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
            {getBannerName(team)}
          </Text>
        </Box>
      </BannerTitleArea>

      <BannerControlStrip>
        <BannerDropdown
          label="Season"
          options={years.map((season) => ({ value: season, label: String(season) }))}
          value={year}
          onChange={(nextYear) => onYearChange(Number(nextYear))}
        />
      </BannerControlStrip>
    </Box>
  );
};

// Mobile — same locked tier-1 + section-switcher-row pattern as the other
// migrated banners. Season is the only control, so it goes behind the "+"
// sheet and commits immediately on tap.
const MobileRosterHubBanner = ({ team, year, years, onYearChange }) => {
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

export const RosterHubBanner = ({ team, model, year, years, onYearChange }) => {
  const { isMobile } = useLayoutDensity();
  if (!team) return null;

  return isMobile
    ? <MobileRosterHubBanner team={team} year={year} years={years} onYearChange={onYearChange} />
    : <DesktopRosterHubBanner team={team} year={year} years={years} onYearChange={onYearChange} />;
};
