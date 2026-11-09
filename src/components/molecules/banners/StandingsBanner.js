import { BANNER_STRIP_BG, BannerTitleArea, BannerGhostWord, BannerControlStrip, BannerDropdown, BannerIconButton } from "../../organisms/BannerControls";
import { Box, Text, Flex } from "@chakra-ui/react";
import { GAME_CENTER_SEASONS, GAME_CENTER_DEFAULT_SEASON } from "../game/SeasonSelector";
import { useState } from "react";
import { MobileSectionSwitcher } from "../../organisms/MobileSectionSwitcher";
import { Plus } from "lucide-react";
import { BottomSheet } from "../../organisms/BottomSheet";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";

const STANDINGS_ACCENT = "#A855F7";

const STANDINGS_GRADIENT = `linear-gradient(110deg, ${STANDINGS_ACCENT} 0%, #6B21A8 28%, #1B0630 58%, ${BANNER_STRIP_BG} 100%)`;

const STANDINGS_DIVISIONS = [
  { value: "all",       label: "All",       short: "ALL" },
  { value: "swac-east", label: "SWAC East", short: "EAST" },
  { value: "swac-west", label: "SWAC West", short: "WEST" },
  { value: "meac",      label: "MEAC",      short: "MEAC" },
];

const DesktopBannerStandings = ({ season, setSeason }) => (
  <Box
    position="relative"
    overflow="hidden"
    borderRadius="2xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    h="full"
    w="full"
    bg={STANDINGS_GRADIENT}
    display="flex"
    flexDirection="column"
  >
    <BannerTitleArea>
      <BannerGhostWord text="STANDINGS" />
      <Box position="relative" zIndex={1}>
        <Text fontSize="clamp(2.6rem, 7vw, 7.5rem)" color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.85} letterSpacing="-0.04em" whiteSpace="nowrap">
          Standings
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

const MobileBannerStandings = ({ season, setSeason, division, setDivision }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  return (
    <Box position="relative" overflow="hidden" h="full" w="full" display="flex" flexDirection="column">
      <Box
        position="relative"
        overflow="hidden"
        h="var(--app-header-height)"
        flexShrink={0}
        bg={STANDINGS_GRADIENT}
        display="flex"
        flexDirection="column"
      >
        <BannerTitleArea>
          <BannerGhostWord text="STANDINGS" />
          <Box position="relative" zIndex={1}>
            <Text fontSize="clamp(2.6rem, 7vw, 7.5rem)" color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.85} letterSpacing="-0.04em" whiteSpace="nowrap">
              Standings
            </Text>
          </Box>
        </BannerTitleArea>
      </Box>

      <Flex align="flex-start" justify="space-between">
        <MobileSectionSwitcher accent={STANDINGS_ACCENT} />
        <Box pt="0.6rem" pr="0.6rem">
          <BannerIconButton ariaLabel="Advanced controls" onClick={() => setIsAdvancedOpen(true)}>
            <Plus size={14} color="white" />
          </BannerIconButton>
        </Box>
      </Flex>

      {/* Division tabs stay their own row — real Standings-specific content,
          not part of the season-control pattern being unified here. */}
      <Flex align="stretch" borderTop="1px solid" borderColor="whiteAlpha.100">
        {STANDINGS_DIVISIONS.map((d) => {
          const isActive = division === d.value;
          return (
            <Box
              key={d.value}
              as="button"
              type="button"
              onClick={() => setDivision(d.value)}
              flex="1"
              py="0.55rem"
              bg={isActive ? STANDINGS_ACCENT : "transparent"}
              borderLeft="1px solid"
              borderColor="whiteAlpha.100"
            >
              <Text fontSize="0.6rem" fontWeight="black" color="white" textAlign="center" lineClamp={1}>
                {d.short}
              </Text>
            </Box>
          );
        })}
      </Flex>

      <BottomSheet isOpen={isAdvancedOpen} onClose={() => setIsAdvancedOpen(false)} title="Standings Controls">
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
                  bg={isActive ? STANDINGS_ACCENT : "#1C1C1F"}
                  border="1px solid"
                  borderColor={isActive ? STANDINGS_ACCENT : "whiteAlpha.200"}
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

export const BannerStandings = ({ season: extSeason, setSeason: extSetSeason, division: extDivision, setDivision: extSetDivision } = {}) => {
  const [intSeason, setIntSeason] = useState(GAME_CENTER_DEFAULT_SEASON);
  const [intDivision, setIntDivision] = useState("all");
  const season      = extSeason      !== undefined ? extSeason      : intSeason;
  const setSeason   = extSetSeason   !== undefined ? extSetSeason   : setIntSeason;
  const division    = extDivision    !== undefined ? extDivision    : intDivision;
  const setDivision = extSetDivision !== undefined ? extSetDivision : setIntDivision;
  const { isMobile } = useLayoutDensity();

  return isMobile
    ? <MobileBannerStandings season={season} setSeason={setSeason} division={division} setDivision={setDivision} />
    : <DesktopBannerStandings season={season} setSeason={setSeason} />;
};
