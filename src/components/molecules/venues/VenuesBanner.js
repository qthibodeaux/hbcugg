import { Box, Text } from "@chakra-ui/react";
import { BannerControlStrip, BannerGhostWord, BannerTitleArea, BANNER_STRIP_BG } from "../../organisms/BannerControls";

// Banner standard (AgentDesignBible §2b): title tier, then an opaque control
// strip. No kicker, no subtitle. Slate gradient — the page belongs to the
// Schools hub, which has no single team color to borrow.
const ACCENT = "#2D3748";
const GRADIENT = `linear-gradient(110deg, ${ACCENT} 0%, #1F2733 28%, #111113 58%, ${BANNER_STRIP_BG} 100%)`;

const StatPill = ({ label, value }) => (
  <Box bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.200" borderRadius="md" px="0.75rem" py="0.4rem">
    <Text fontSize="0.45rem" fontWeight="black" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.1em">
      {label}
    </Text>
    <Text fontSize="0.95rem" fontWeight="black" color="white" lineHeight={1.2}>
      {value}
    </Text>
  </Box>
);

export const VenuesBanner = ({ stats }) => (
  <Box
    h="full"
    w="full"
    bg={GRADIENT}
    position="relative"
    overflow="hidden"
    display="flex"
    flexDirection="column"
    borderRadius="2xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
  >
    <BannerTitleArea>
      <BannerGhostWord text="VENUES" />
      <Box position="relative" zIndex={1}>
        <Text
          fontSize="clamp(2.6rem, 7vw, 7.5rem)"
          fontWeight="black"
          fontStyle="italic"
          letterSpacing="-0.04em"
          lineHeight={0.85}
          color="white"
          textTransform="uppercase"
          whiteSpace="nowrap"
        >
          Stadiums
        </Text>
      </Box>
    </BannerTitleArea>

    <BannerControlStrip justify="flex-start">
      <StatPill label="Campus" value={stats.campusCount} />
      <StatPill label="Neutral sites" value={stats.neutralCount} />
      <StatPill label="Campus seats" value={stats.totalCapacity.toLocaleString()} />
      <StatPill label="Largest" value={stats.largest ? `${stats.largest.capacity.toLocaleString()} · ${stats.largest.team?.shortName ?? stats.largest.name}` : "—"} />
    </BannerControlStrip>
  </Box>
);

export default VenuesBanner;
