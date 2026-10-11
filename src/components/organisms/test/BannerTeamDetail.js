import { useState } from "react";
import { Box, Flex, Text, Image } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import teamsData from "../../../data/teams.json";
import { GAME_CENTER_DEFAULT_SEASON, GAME_CENTER_SEASONS } from "../../molecules/game/SeasonSelector";
import {
  BannerTitleArea,
  BannerControlStrip,
  BannerDropdown,
  BannerActionButton,
  BannerIconButton,
  BANNER_STRIP_BG,
} from "../BannerControls";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { MobileSectionSwitcher } from "../MobileSectionSwitcher";
import { BottomSheet } from "../BottomSheet";

// Migrated to the banner standard locked in AgentDesignBible.md §2b (2026-07-29).
// Controls moved from the old right-side vertical panel + hairline divider into
// a real opaque strip below the title. Identity treatment (logo bleed, mascot
// ghost watermark, italic title, subline) is unchanged — not reinvented, per
// design review. See design doc: src/components/organisms/test/4-1md/Banner System Design Doc.md

const SEASONS = GAME_CENTER_SEASONS;
const TEAMS = teamsData.teams;

const getBannerName = (team) => team.bannerName ?? team.name;

// ── Season dropdown + Go ──────────────────────────────────────────────────────
const SeasonControl = ({ season, setSeason, primary }) => {
  const [pending, setPending] = useState(season);
  const isDirty = pending !== season;
  const seasonOptions = SEASONS.map((s) => ({ value: s, label: String(s) }));

  return (
    <Flex align="center" gap="0.5rem">
      <BannerDropdown label="Season" value={pending} onChange={(v) => setPending(Number(v))} options={seasonOptions} minW="7rem" />
      <BannerActionButton primary={primary} disabled={!isDirty} onClick={() => setSeason(pending)}>
        Go
      </BannerActionButton>
    </Flex>
  );
};

// ── Team toggle — Lab-only (cycles through all teams); production hides this ──
const TeamToggle = ({ onPrev, onNext, index, count }) => (
  <Flex align="center" gap="0.4rem" ml="auto">
    <BannerIconButton ariaLabel="Previous team" onClick={onPrev}>
      <ChevronLeft size={13} color="white" />
    </BannerIconButton>
    <Text fontSize="0.65rem" fontWeight="black" color="whiteAlpha.600" letterSpacing="0.08em" minW="3.5rem" textAlign="center">
      {index + 1} / {count}
    </Text>
    <BannerIconButton ariaLabel="Next team" onClick={onNext}>
      <ChevronRight size={13} color="white" />
    </BannerIconButton>
  </Flex>
);

// ── Banner ────────────────────────────────────────────────────────────────────
const BannerTeamDetail4x1 = ({ team, season, setSeason, onPrev, onNext, teamIndex, teamCount, hideToggle = false }) => {
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

// Mobile — separate render, same pattern as the other converted banners:
// tier 1 locked to nav-bar height, section switcher + "+" bottom sheet for
// Season instead of the desktop draft/Go pattern. Team-branded rather than
// brand-purple — accent is this team's own primary color, both for the
// gradient and for the section switcher, so it reads as "this team's page"
// the same way BannerGameCenter etc. read as "the app's brand." Re-renders
// automatically whenever `team` changes (it's just a prop from the page,
// same as the desktop version), so switching teams updates this immediately.
// Logo bleed instead of a ghost *word* — matches the pattern already used
// for team identity elsewhere (WeekCentralGameRowMobile, the game cards):
// ghosted logos for team-specific content, ghosted words for generic pages.
const MobileBannerTeamDetail = ({ team, season, setSeason }) => {
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

// Production version — team comes from page props, no team toggle
export const BannerTeamDetailPage = ({ team, season, setSeason }) => {
  const { isMobile } = useLayoutDensity();
  if (!team) return null;

  if (isMobile) {
    return <MobileBannerTeamDetail team={team} season={season} setSeason={setSeason} />;
  }

  return (
    <BannerTeamDetail4x1
      team={team}
      season={season}
      setSeason={setSeason}
      onPrev={() => {}}
      onNext={() => {}}
      teamIndex={0}
      teamCount={0}
      hideToggle
    />
  );
};

// Lab version — cycles through all teams internally
export const BannerTeamDetail = () => {
  const [season, setSeason] = useState(GAME_CENTER_DEFAULT_SEASON);
  const [teamIndex, setTeamIndex] = useState(
    TEAMS.findIndex((t) => t.id === "mvsu")
  );

  const onPrev = () => setTeamIndex((i) => (i - 1 + TEAMS.length) % TEAMS.length);
  const onNext = () => setTeamIndex((i) => (i + 1) % TEAMS.length);

  return (
    <BannerTeamDetail4x1
      team={TEAMS[teamIndex]}
      season={season}
      setSeason={setSeason}
      onPrev={onPrev}
      onNext={onNext}
      teamIndex={teamIndex}
      teamCount={TEAMS.length}
    />
  );
};
