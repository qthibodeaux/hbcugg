import { MobileRosterHubBanner } from "./MobileRosterHubBanner";
import { Box, Image, Text } from "@chakra-ui/react";
import { BannerTitleArea, BannerControlStrip, BannerDropdown } from "../../organisms/BannerControls";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";

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
export const RosterHubBanner = ({ team, model, year, years, onYearChange }) => {
  const { isMobile } = useLayoutDensity();
  if (!team) return null;

  return isMobile
    ? <MobileRosterHubBanner bannerName={getBannerName(team)} team={team} year={year} years={years} onYearChange={onYearChange} />
    : <DesktopRosterHubBanner team={team} year={year} years={years} onYearChange={onYearChange} />;
};
