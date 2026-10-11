import { Box, Text } from "@chakra-ui/react";
import { BannerControlStrip, BannerDropdown, BannerGhostWord, BannerTitleArea, BANNER_STRIP_BG } from "../../organisms/BannerControls";

// Banner standard (AgentDesignBible §2b). Game Center red, like the rest of
// the hub. The title is two lines — "CLASSICS &" over "HOMECOMING" — because
// the hub's name doesn't fit on one at the standard title size, and it is
// the hub's name.
const ACCENT = "#E53E3E";
const GRADIENT = `linear-gradient(110deg, ${ACCENT} 0%, #7A1C1C 28%, #1A0A0A 58%, ${BANNER_STRIP_BG} 100%)`;

const StatPill = ({ label, value }) => (
  <Box bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.200" borderRadius="md" px="0.75rem" py="0.4rem" minW={0}>
    <Text fontSize="0.45rem" fontWeight="black" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.1em">
      {label}
    </Text>
    <Text fontSize="0.95rem" fontWeight="black" color="white" lineHeight={1.2} lineClamp={1}>
      {value}
    </Text>
  </Box>
);

export const EventsBanner = ({ season, seasons, onSeasonChange, stats }) => {
  const next = stats.nextUp;
  return (
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
        <BannerGhostWord text="CLASSICS" />
        <Box position="relative" zIndex={1}>
          <Text
            fontSize="clamp(2.6rem, 7vw, 7.5rem)"
            fontWeight="black"
            fontStyle="italic"
            letterSpacing="-0.04em"
            lineHeight={0.85}
            color="white"
            textTransform="uppercase"
          >
            Classics &amp;
            <br />
            Homecoming
          </Text>
        </Box>
      </BannerTitleArea>

      <BannerControlStrip justify="flex-start">
        <BannerDropdown
          label="Season"
          value={String(season)}
          onChange={onSeasonChange}
          options={seasons.map((s) => ({ value: String(s), label: String(s) }))}
          minW="6rem"
        />
        <StatPill label="Events" value={stats.eventsThisSeason} />
        <StatPill label="Classics" value={stats.classicsThisSeason} />
        <StatPill label="Homecomings" value={stats.homecomingsThisSeason} />
        <StatPill label="Next up" value={next ? `${next.label} · ${next.dateLabel}` : "—"} />
      </BannerControlStrip>
    </Box>
  );
};

export default EventsBanner;
