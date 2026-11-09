import { BANNER_STRIP_BG, BannerTitleArea, BannerControlStrip } from "../../../organisms/BannerControls";
import { getBannerName } from "./bannerPresentation";
import { Box, Image, Text } from "@chakra-ui/react";
import { SeasonControl, TeamToggle } from "./BannerControls";

// Desktop team-detail banner identity and control strip.

export const BannerTeamDetail4x1 = ({ team, season, setSeason, onPrev, onNext, teamIndex, teamCount, hideToggle = false }) => {
  const primary = team.colors?.primary ?? "#A855F7";
  const gradient = `linear-gradient(110deg, ${primary} 0%, ${primary}88 25%, #0B0B0D 58%, ${BANNER_STRIP_BG} 100%)`;

  // This component only ever renders on the desktop (!isMobile) branch of
  // BannerTeamDetailPage. Chakra's own `lg` breakpoint doesn't line up with
  // this app's isMobile cutoff, so useBreakpointValue({ base/md: short, lg:
  // full }) was showing the abbreviation on desktop windows narrower than
  // `lg` even though they're not "compact" by this app's own definition.
  // Desktop always gets the full name now.
  const displayName = getBannerName(team);

  return (
    <Box
      position="relative"
      overflow="hidden"
      borderRadius="2xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      h="full"
      w="full"
      bg={gradient}
      display="flex"
      flexDirection="column"
      style={{ transition: "background 0.4s" }}
    >
      {/* Logo — standardized to the School Schedule banner's spec:
          right="-38px", 220/300px, opacity 0.18, across every school-specific
          banner. Must be a sibling of BannerTitleArea, not nested inside it —
          top="50%" centers on whatever position:relative ancestor it finds,
          and BannerTitleArea is only the title-tier's own height (shorter
          than the full banner, since it excludes the control strip below
          it). Nested here, the logo was centering on the wrong box and
          visibly landing at a different height than every other banner. */}
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

      {/* Mascot-name ghost watermark */}
      <Text
        position="absolute"
        bottom="-0.9rem"
        left="0"
        fontWeight="black"
        fontStyle="italic"
        color="white"
        opacity={0.05}
        textTransform="uppercase"
        lineHeight={1}
        letterSpacing="-0.05em"
        pointerEvents="none"
        userSelect="none"
        whiteSpace="nowrap"
        style={{ fontSize: "clamp(60px, 12vw, 130px)" }}
      >
        {team.mascot.toUpperCase()}
      </Text>

      <BannerTitleArea>
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
            {displayName}
          </Text>
        </Box>
      </BannerTitleArea>

      <BannerControlStrip>
        <SeasonControl season={season} setSeason={setSeason} primary={primary} />
        {!hideToggle && <TeamToggle onPrev={onPrev} onNext={onNext} index={teamIndex} count={teamCount} />}
      </BannerControlStrip>
    </Box>
  );
};
