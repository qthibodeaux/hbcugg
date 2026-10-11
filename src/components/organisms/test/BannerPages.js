import { useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import useMountEffect from "../../../hooks/useMountEffect";
import { GAME_CENTER_DEFAULT_SEASON, GAME_CENTER_SEASONS, SeasonSelector } from "../../molecules/game/SeasonSelector";
import {
  BannerGhostWord,
  BannerTitleArea,
  BannerControlStrip,
  BannerDropdown,
  BannerIconButton,
  BANNER_STRIP_BG,
} from "../BannerControls";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { MobileSectionSwitcher } from "../MobileSectionSwitcher";
import { BottomSheet } from "../BottomSheet";

// ─────────────────────────────────────────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

const BRAND_GRADIENT = "linear-gradient(110deg, #A855F7 0%, #6B21A8 28%, #1B0630 58%, #0B0B0D 100%)";
const TICK_HOLD = 4000;
const TICK_FADE = 500;

const useSubTicker = (lines) => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  useMountEffect(() => {
    let current = 0;
    let holdTimer, fadeTimer;
    const cycle = () => {
      setVisible(true);
      holdTimer = setTimeout(() => {
        setVisible(false);
        fadeTimer = setTimeout(() => {
          current = (current + 1) % lines.length;
          setIndex(current);
          cycle();
        }, TICK_FADE);
      }, TICK_HOLD);
    };
    cycle();
    return () => { clearTimeout(holdTimer); clearTimeout(fadeTimer); };
  });
  return { line: lines[index], visible };
};

const GhostWord = ({ word }) => (
  <Text
    position="absolute"
    bottom="-20px"
    left="0"
    fontWeight="black"
    style={{ fontSize: "clamp(80px, 16vw, 180px)" }}
    fontStyle="italic"
    color="white"
    opacity={0.05}
    textTransform="uppercase"
    lineHeight={1}
    letterSpacing="-0.05em"
    pointerEvents="none"
    userSelect="none"
    whiteSpace="nowrap"
  >
    {word}
  </Text>
);

const Headline = ({ title, editorial, tickerLines }) => {
  const { line, visible } = useSubTicker(tickerLines);
  return (
    <Box>
      <Text
        fontWeight="black"
        fontStyle="italic"
        color="white"
        textTransform="uppercase"
        lineHeight={0.85}
        letterSpacing="-0.04em"
        whiteSpace="nowrap"
        style={{ fontSize: "clamp(2rem, 5.5vw, 6rem)" }}
      >
        {title}
      </Text>
      <Flex align="center" gap={3} mt={3} flexWrap="nowrap">
        <Box h="1px" w="28px" bg="rgba(255,255,255,0.3)" flexShrink={0} />
        <Text
          fontWeight="black"
          color="rgba(255,255,255,0.5)"
          textTransform="uppercase"
          letterSpacing="0.18em"
          whiteSpace="nowrap"
          style={{ fontSize: "clamp(7px, 0.9vw, 9px)" }}
        >
          {editorial}
        </Text>
        <Box w="1px" h="10px" bg="rgba(255,255,255,0.2)" flexShrink={0} />
        <Text
          fontWeight="black"
          color="rgba(255,255,255,0.28)"
          textTransform="uppercase"
          letterSpacing="0.15em"
          whiteSpace="nowrap"
          style={{
            fontSize: "clamp(7px, 0.9vw, 9px)",
            opacity: visible ? 1 : 0,
            transition: `opacity ${TICK_FADE}ms ease`,
          }}
        >
          {line}
        </Text>
      </Flex>
    </Box>
  );
};

const Hairline = () => (
  <Box w="1px" bg="rgba(255,255,255,0.12)" my={6} flexShrink={0} />
);

const PanelLabel = ({ children }) => (
  <Text
    fontSize="8px"
    fontWeight="black"
    color="rgba(255,255,255,0.35)"
    textTransform="uppercase"
    letterSpacing="0.22em"
    mb={2}
  >
    {children}
  </Text>
);

const SeasonPicker = ({ season, setSeason, seasons }) => (
  <SeasonSelector season={season} setSeason={setSeason} seasons={seasons} />
);

const FilterPills = ({ label, options, active, setActive }) => (
  <Box>
    <PanelLabel>{label}</PanelLabel>
    <Flex direction="column" gap={1} align="center">
      {options.map((o) => (
        <Box
          key={o.id}
          as="button"
          px={3}
          py={1}
          borderRadius="sm"
          cursor="pointer"
          bg={active === o.id ? "rgba(255,255,255,0.18)" : "transparent"}
          border="1px solid"
          borderColor={active === o.id ? "rgba(255,255,255,0.45)" : "transparent"}
          onClick={() => setActive(o.id)}
          style={{ transition: "all 0.15s" }}
          whiteSpace="nowrap"
        >
          <Text
            fontSize="9px"
            fontWeight="black"
            textAlign="center"
            color={active === o.id ? "white" : "rgba(255,255,255,0.3)"}
          >
            {o.label}
          </Text>
        </Box>
      ))}
    </Flex>
  </Box>
);

const BannerShell = ({ ghost, title, editorial, tickerLines, children }) => (
  <Box
    position="relative"
    overflow="hidden"
    borderRadius="2xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    h="100%"
    bg={BRAND_GRADIENT}
  >
    <GhostWord word={ghost} />
    <Flex h="100%" align="stretch">
      <Flex flex={1} align="center" pl={8} pr={6}>
        <Headline title={title} editorial={editorial} tickerLines={tickerLines} />
      </Flex>
      <Hairline />
      <Flex direction="column" justify="center" align="center" px={7} gap={4} flexShrink={0} minW="140px">
        {children}
      </Flex>
    </Flex>
  </Box>
);

// ─────────────────────────────────────────────────────────────────────────────
// BANNERS
// ─────────────────────────────────────────────────────────────────────────────

export const BannerGamesHub = ({ season: extSeason, setSeason: extSetSeason } = {}) => {
  const [intSeason, setIntSeason] = useState(GAME_CENTER_DEFAULT_SEASON);
  const season    = extSeason    !== undefined ? extSeason    : intSeason;
  const setSeason = extSetSeason !== undefined ? extSetSeason : setIntSeason;
  return (
    <BannerShell
      ghost="GAMES"
      title="GAMES HUB"
      editorial="EVERY SNAP. EVERY SCORE."
      tickerLines={["MATCHUPS · SCORES · ANALYSIS", "ALL GAMES · ALL SEASONS", "SWAC & MEAC"]}
    >
      <SeasonPicker season={season} setSeason={setSeason} />
    </BannerShell>
  );
};

// Migrated to the banner standard locked in AgentDesignBible.md §2b (2026-07-29) —
// same treatment as BannerSchools/BannerGameCenter/BannerSchedule: title -> bottom
// opaque control strip, no rotating ticker, real themed dropdown instead of the
// old native <select>. Standalone — does NOT use the shared BannerShell above.

const TEAM_SCHEDULES_ACCENT = "#A855F7";
const TEAM_SCHEDULES_GRADIENT = `linear-gradient(110deg, ${TEAM_SCHEDULES_ACCENT} 0%, #6B21A8 28%, #1B0630 58%, ${BANNER_STRIP_BG} 100%)`;

const DesktopBannerTeamSchedules = ({ season, setSeason }) => (
  <Box
    position="relative"
    overflow="hidden"
    borderRadius="2xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    h="full"
    w="full"
    bg={TEAM_SCHEDULES_GRADIENT}
    display="flex"
    flexDirection="column"
  >
    <BannerTitleArea>
      <BannerGhostWord text="SCHEDULE" />
      <Box position="relative" zIndex={1}>
        <Text fontSize="clamp(2.6rem, 7vw, 7.5rem)" color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.85} letterSpacing="-0.04em" whiteSpace="nowrap">
          Team Schedule
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

// Mobile — same pattern as the other converted banners: tier 1 locked to
// nav-bar height, no subtext, section switcher flush left, Season behind
// the "+" bottom sheet rather than inline.
const MobileBannerTeamSchedules = ({ season, setSeason }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  return (
    <Box position="relative" overflow="hidden" h="full" w="full" display="flex" flexDirection="column">
      <Box
        position="relative"
        overflow="hidden"
        h="var(--app-header-height)"
        flexShrink={0}
        bg={TEAM_SCHEDULES_GRADIENT}
        display="flex"
        flexDirection="column"
      >
        <BannerTitleArea>
          <BannerGhostWord text="SCHEDULE" />
          <Box position="relative" zIndex={1}>
            <Text fontSize="clamp(2.6rem, 7vw, 7.5rem)" color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.85} letterSpacing="-0.04em" whiteSpace="nowrap">
              Team Schedule
            </Text>
          </Box>
        </BannerTitleArea>
      </Box>

      <Flex align="flex-start" justify="space-between">
        <MobileSectionSwitcher accent={TEAM_SCHEDULES_ACCENT} />
        <Box pt="0.6rem" pr="0.6rem">
          <BannerIconButton ariaLabel="Advanced controls" onClick={() => setIsAdvancedOpen(true)}>
            <Plus size={14} color="white" />
          </BannerIconButton>
        </Box>
      </Flex>

      <BottomSheet isOpen={isAdvancedOpen} onClose={() => setIsAdvancedOpen(false)} title="Team Schedule Controls">
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
                  bg={isActive ? TEAM_SCHEDULES_ACCENT : "#1C1C1F"}
                  border="1px solid"
                  borderColor={isActive ? TEAM_SCHEDULES_ACCENT : "whiteAlpha.200"}
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

export const BannerTeamSchedules = ({ season: extSeason, setSeason: extSetSeason } = {}) => {
  const [intSeason, setIntSeason] = useState(GAME_CENTER_DEFAULT_SEASON);
  const season    = extSeason    !== undefined ? extSeason    : intSeason;
  const setSeason = extSetSeason !== undefined ? extSetSeason : setIntSeason;
  const { isMobile } = useLayoutDensity();

  return isMobile
    ? <MobileBannerTeamSchedules season={season} setSeason={setSeason} />
    : <DesktopBannerTeamSchedules season={season} setSeason={setSeason} />;
};

const STANDINGS_ACCENT = "#A855F7";
const STANDINGS_GRADIENT = `linear-gradient(110deg, ${STANDINGS_ACCENT} 0%, #6B21A8 28%, #1B0630 58%, ${BANNER_STRIP_BG} 100%)`;
const STANDINGS_DIVISIONS = [
  { value: "all",       label: "All",       short: "ALL" },
  { value: "swac-east", label: "SWAC East", short: "EAST" },
  { value: "swac-west", label: "SWAC West", short: "WEST" },
  { value: "meac",      label: "MEAC",      short: "MEAC" },
];

// Division control dropped 2026-08-25: desktop always renders all three
// groups side by side (GROUP_DEFS.map in StandingsPage, unconditional) - the
// control was plumbed in but never filtered anything here. Mobile's division
// filter is real (it hides the other two group tables on a narrow screen) and
// stays in MobileBannerStandings below.
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

// Mobile — same shape as Season Schedule's control bar: tier 1 locked to
// nav-bar height, no subtext, section switcher on its own row, then a
// dedicated control bar below it. Division here already has an "All" option
// covering what a "+" would otherwise hide, so the bar is just Year (opens
// the season-picker sheet) + the four division quick-toggles (instant set).
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

// Migrated to the banner standard locked in AgentDesignBible.md §2b (2026-07-29).
const SCHOOLS_ACCENT = "#A855F7";
const SCHOOLS_GRADIENT = `linear-gradient(110deg, ${SCHOOLS_ACCENT} 0%, #6B21A8 28%, #1B0630 58%, ${BANNER_STRIP_BG} 100%)`;
// Standalone — does NOT use the shared BannerShell above (that's still used by
// BannerGamesHub/BannerTeamSchedules/BannerStandings/BannerRostersHub, which are
// out of scope for this migration).
const DesktopBannerSchools = ({ season, setSeason }) => (
  <Box
    position="relative"
    overflow="hidden"
    borderRadius="2xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    h="full"
    w="full"
    bg={SCHOOLS_GRADIENT}
    display="flex"
    flexDirection="column"
  >
    <BannerTitleArea>
      <BannerGhostWord text="SCHOOLS" size="clamp(5rem, 16vw, 11.25rem)" />
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
          Schools
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

// Mobile — standardized 2026-08-28 to the app's one mobile banner control
// pattern: section switcher + "+" advanced-controls sheet (was previously a
// switcher row followed by a separate stacked row for Season).
const MobileBannerSchools = ({ season, setSeason }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  return (
    <Box position="relative" overflow="hidden" h="full" w="full" display="flex" flexDirection="column">
      <Box
        position="relative"
        overflow="hidden"
        h="var(--app-header-height)"
        flexShrink={0}
        bg={SCHOOLS_GRADIENT}
        display="flex"
        flexDirection="column"
      >
        <BannerTitleArea>
          <BannerGhostWord text="SCHOOLS" size="clamp(5rem, 16vw, 11.25rem)" />
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
              Schools
            </Text>
          </Box>
        </BannerTitleArea>
      </Box>

      <Flex align="flex-start" justify="space-between">
        <MobileSectionSwitcher accent={SCHOOLS_ACCENT} />
        <Box pt="0.6rem" pr="0.6rem">
          <BannerIconButton ariaLabel="Advanced controls" onClick={() => setIsAdvancedOpen(true)}>
            <Plus size={14} color="white" />
          </BannerIconButton>
        </Box>
      </Flex>

      <BottomSheet isOpen={isAdvancedOpen} onClose={() => setIsAdvancedOpen(false)} title="Schools Controls">
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
                    setSeason(year);
                    setIsAdvancedOpen(false);
                  }}
                  px="0.7rem"
                  py="0.4rem"
                  borderRadius="0"
                  bg={isActive ? SCHOOLS_ACCENT : "#1C1C1F"}
                  border="1px solid"
                  borderColor={isActive ? SCHOOLS_ACCENT : "whiteAlpha.200"}
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

export const BannerSchools = ({ season: extSeason, setSeason: extSetSeason } = {}) => {
  const [intSeason, setIntSeason] = useState(GAME_CENTER_DEFAULT_SEASON);
  const season  = extSeason  !== undefined ? extSeason  : intSeason;
  const setSeason = extSetSeason !== undefined ? extSetSeason : setIntSeason;
  const { isMobile } = useLayoutDensity();

  return isMobile
    ? <MobileBannerSchools season={season} setSeason={setSeason} />
    : <DesktopBannerSchools season={season} setSeason={setSeason} />;
};

const ROSTERS_HUB_ACCENT = "#A855F7";
const ROSTERS_HUB_GRADIENT = `linear-gradient(110deg, ${ROSTERS_HUB_ACCENT} 0%, #6B21A8 28%, #1B0630 58%, ${BANNER_STRIP_BG} 100%)`;

// Desktop — migrated off the old BannerShell (left title / right vertical
// controls) onto the current standard: title -> bottom opaque control strip,
// real BannerDropdown instead of the native <select> + separate Go button.
// Selecting a season now commits immediately, same as Team Schedule/
// Standings/Schools' desktop banners.
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

// Mobile — tier 1 locked to nav-bar height, no subtext, section switcher on
// its own row. Season is the only control, so it goes behind the "+" sheet
// like Team Schedule's; unlike desktop's pending/Go two-step, tapping a year
// commits immediately (no draft state on mobile — same call already made
// for Week Central's advanced panel).
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

export const BannerCoachesHub = ({ season: extSeason, setSeason: extSetSeason } = {}) => {
  const [intSeason, setIntSeason] = useState(GAME_CENTER_DEFAULT_SEASON);
  const season    = extSeason    !== undefined ? extSeason    : intSeason;
  const setSeason = extSetSeason !== undefined ? extSetSeason : setIntSeason;
  return (
    <BannerShell
      ghost="COACHES"
      title="COACHES HUB"
      editorial="THE MEN BUILDING THESE PROGRAMS"
      tickerLines={["STAFF · COACHING TREES", "HEAD COACHES · COORDINATORS", "SWAC & MEAC"]}
    >
      <SeasonPicker season={season} setSeason={setSeason} />
    </BannerShell>
  );
};

const PEOPLE_HUB_ACCENT = "#A855F7";
const PEOPLE_HUB_GRADIENT = `linear-gradient(110deg, ${PEOPLE_HUB_ACCENT} 0%, #6B21A8 28%, #1B0630 58%, ${BANNER_STRIP_BG} 100%)`;
const PEOPLE_HUB_FOCUS_OPTIONS = [
  { id: "all", label: "Overview" },
  { id: "players", label: "Players" },
  { id: "coaches", label: "Coaches" },
];

// Mobile — same locked tier-1 + section-switcher-row pattern as Rosters Hub.
// Focus is a single 3-way pick, so it goes behind the "+" sheet and commits
// immediately on tap (no pending/apply step, same call as Rosters Hub's
// season pills).
const MobileBannerPeopleHub = ({ focus, setFocus }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  return (
    <Box position="relative" overflow="hidden" h="full" w="full" display="flex" flexDirection="column">
      <Box
        position="relative"
        overflow="hidden"
        h="var(--app-header-height)"
        flexShrink={0}
        bg={PEOPLE_HUB_GRADIENT}
        display="flex"
        flexDirection="column"
      >
        <BannerTitleArea>
          <BannerGhostWord text="PERSONNEL" />
          <Box position="relative" zIndex={1}>
            <Text fontSize="clamp(2.6rem, 7vw, 7.5rem)" color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.85} letterSpacing="-0.04em" whiteSpace="nowrap">
              People Hub
            </Text>
          </Box>
        </BannerTitleArea>
      </Box>

      <Flex align="flex-start" justify="space-between">
        <MobileSectionSwitcher accent={PEOPLE_HUB_ACCENT} />
        <Box pt="0.6rem" pr="0.6rem">
          <BannerIconButton ariaLabel="Advanced controls" onClick={() => setIsAdvancedOpen(true)}>
            <Plus size={14} color="white" />
          </BannerIconButton>
        </Box>
      </Flex>

      <BottomSheet isOpen={isAdvancedOpen} onClose={() => setIsAdvancedOpen(false)} title="People Hub Controls">
        <Box px="1rem" py="0.85rem">
          <Text fontSize="0.6rem" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mb="0.5rem">
            Focus
          </Text>
          <Flex wrap="wrap" gap="0.4rem">
            {PEOPLE_HUB_FOCUS_OPTIONS.map((o) => {
              const isActive = o.id === focus;
              return (
                <Box
                  key={o.id}
                  as="button"
                  type="button"
                  onClick={() => {
                    setFocus(o.id);
                    setIsAdvancedOpen(false);
                  }}
                  px="0.7rem"
                  py="0.4rem"
                  borderRadius="0"
                  bg={isActive ? PEOPLE_HUB_ACCENT : "#1C1C1F"}
                  border="1px solid"
                  borderColor={isActive ? PEOPLE_HUB_ACCENT : "whiteAlpha.200"}
                >
                  <Text fontSize="0.7rem" fontWeight="black" color="white">{o.label}</Text>
                </Box>
              );
            })}
          </Flex>
        </Box>
      </BottomSheet>
    </Box>
  );
};

export const BannerPeopleHub = ({ focus: extFocus, setFocus: extSetFocus } = {}) => {
  const [intFocus, setIntFocus] = useState("all");
  const focus = extFocus !== undefined ? extFocus : intFocus;
  const setFocus = extSetFocus !== undefined ? extSetFocus : setIntFocus;

  const { isMobile } = useLayoutDensity();
  if (isMobile) {
    return <MobileBannerPeopleHub focus={focus} setFocus={setFocus} />;
  }

  return (
    <BannerShell
      ghost="PERSONNEL"
      title="PEOPLE HUB"
      editorial="THE DISTINGUISHED INDIVIDUALS WHO CAPTIVATE ON SATURDAYS"
      tickerLines={["PLAYERS | COACHES | LEADERSHIP", "PROFILES | MOVEMENT | SIGNALS", "SWAC & MEAC PEOPLE INDEX"]}
    >
      <FilterPills label="Focus" options={PEOPLE_HUB_FOCUS_OPTIONS} active={focus} setActive={setFocus} />
    </BannerShell>
  );
};

export const BannerOfficialsHub = () => {
  const [conf, setConf] = useState("all");
  const CONFS = [
    { id: "all",  label: "All" },
    { id: "swac", label: "SWAC" },
    { id: "meac", label: "MEAC" },
  ];
  return (
    <BannerShell
      ghost="OFFICIALS"
      title="OFFICIALS HUB"
      editorial="THE CREWS CALLING THE GAME"
      tickerLines={["CREWS · ASSIGNMENTS", "OFFICIALS DATABASE", "SWAC & MEAC"]}
    >
      <FilterPills label="Conference" options={CONFS} active={conf} setActive={setConf} />
    </BannerShell>
  );
};
