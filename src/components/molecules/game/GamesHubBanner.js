import { useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { SlidersHorizontal } from "lucide-react";
import {
  BannerGhostWord,
  BannerTitleArea,
  BannerControlStrip,
  BannerDropdown,
  BannerIconButton,
  BANNER_STRIP_BG,
} from "../../organisms/BannerControls";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { MobileSectionSwitcher } from "../../organisms/MobileSectionSwitcher";
import { BottomSheet } from "../../organisms/BottomSheet";

const ACCENT = "#A855F7";
const GRADIENT = `linear-gradient(110deg, ${ACCENT} 0%, #5B2D9A 26%, #1E0A2A 60%, ${BANNER_STRIP_BG} 100%)`;

// ── Phones ────────────────────────────────────────────────────────────────────
// The mobile banner standard (Week Central's): a title strip the height of the
// app header, edge to edge, then the section switcher on the left and the
// filters on the right — a one-line summary that opens a bottom sheet holding
// all five filter groups as chips. No control strip on a phone.

const SheetGroup = ({ label, options, value, onChange }) => (
  <Box mb="1.1rem">
    <Text fontSize="0.6rem" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mb="0.5rem">
      {label}
    </Text>
    <Flex wrap="wrap" gap="0.4rem">
      {options.map((opt) => {
        const on = String(opt.value) === String(value);
        return (
          <Box
            key={opt.value}
            as="button"
            type="button"
            onClick={() => onChange?.(opt.value)}
            px="0.7rem"
            py="0.4rem"
            bg={on ? ACCENT : "#1C1C1F"}
            border="1px solid"
            borderColor={on ? ACCENT : "whiteAlpha.200"}
          >
            <Text fontSize="0.7rem" fontWeight="black" color="white">{opt.label}</Text>
          </Box>
        );
      })}
    </Flex>
  </Box>
);

const MobileBanner = ({ groups, summary }) => {
  const [open, setOpen] = useState(false);
  return (
    <Box position="relative" w="full" display="flex" flexDirection="column">
      <Box position="relative" overflow="hidden" h="var(--app-header-height)" flexShrink={0} bg={GRADIENT} display="flex" flexDirection="column">
        <BannerTitleArea>
          <BannerGhostWord text="GAMES" />
          <Box position="relative" zIndex={1}>
            <Text fontSize="clamp(2.6rem, 7vw, 7.5rem)" color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.85} letterSpacing="-0.04em" whiteSpace="nowrap">
              Games
            </Text>
          </Box>
        </BannerTitleArea>
      </Box>

      <Flex align="flex-start" justify="space-between" gap="0.5rem">
        <MobileSectionSwitcher accent={ACCENT} />
        <Flex align="center" gap="0.35rem" pt="0.6rem" pr="0.6rem" minW={0}>
          <Box as="button" type="button" onClick={() => setOpen(true)} minW={0} px="0.25rem">
            <Text fontSize="0.7rem" fontWeight="black" color="white" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{summary}</Text>
          </Box>
          <BannerIconButton ariaLabel="Filters" onClick={() => setOpen(true)}>
            <SlidersHorizontal size={14} color="white" />
          </BannerIconButton>
        </Flex>
      </Flex>

      <BottomSheet isOpen={open} onClose={() => setOpen(false)} title="Games Filters">
        <Box px="1rem" py="0.85rem">
          {groups.map((g) => (
            <SheetGroup key={g.label} {...g} />
          ))}
        </Box>
      </BottomSheet>
    </Box>
  );
};

const GamesHubBanner = ({
  seasons = [2025],
  teams = [],
  season = "2025",
  week = "all",
  teamId = "",
  conference = "all",
  status = "all",
  weeks = [],
  onSeasonChange,
  onWeekChange,
  onConferenceChange,
  onTeamChange,
  onStatusChange,
}) => {
  const seasonOptions = seasons.map((item) => ({ value: String(item), label: String(item) }));
  const weekOptions = [{ value: "all", label: "All Weeks" }, ...weeks.map((item) => ({ value: String(item), label: `Week ${item}` }))];
  const conferenceOptions = [
    { value: "all", label: "All 18" },
    { value: "SWAC", label: "SWAC" },
    { value: "MEAC", label: "MEAC" },
  ];
  const teamOptions = [{ value: "", label: "All Teams" }, ...teams.map((t) => ({ value: t.exportId, label: t.shortName }))];
  const statusOptions = [
    { value: "all", label: "All Games" },
    { value: "played", label: "Played" },
    { value: "upcoming", label: "Upcoming" },
  ];

  const { isMobile } = useLayoutDensity();
  if (isMobile) {
    const labelOf = (opts, v) => opts.find((o) => String(o.value) === String(v))?.label;
    const summary = [String(season), labelOf(weekOptions, week), conference !== "all" ? labelOf(conferenceOptions, conference) : null, teamId ? labelOf(teamOptions, teamId) : null, status !== "all" ? labelOf(statusOptions, status) : null]
      .filter(Boolean)
      .join(" · ");
    return (
      <MobileBanner
        summary={summary}
        groups={[
          { label: "Season", options: seasonOptions, value: season, onChange: onSeasonChange },
          { label: "Week", options: weekOptions, value: week, onChange: onWeekChange },
          { label: "Conference", options: conferenceOptions, value: conference, onChange: onConferenceChange },
          { label: "Status", options: statusOptions, value: status, onChange: onStatusChange },
          { label: "Team", options: teamOptions, value: teamId, onChange: onTeamChange },
        ]}
      />
    );
  }

  return (
    <Box
      position="relative"
      overflow="hidden"
      borderRadius="2xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      h="full"
      w="full"
      bg={GRADIENT}
      display="flex"
      flexDirection="column"
    >
      <BannerTitleArea>
        <BannerGhostWord text="GAMES" size="clamp(7rem, 19vw, 19rem)" left="0.8rem" bottom="-0.2rem" />
        <Box position="relative" zIndex={1}>
          <Text fontSize="clamp(2.8rem, 8vw, 8rem)" color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.82} letterSpacing="-0.05em" whiteSpace="nowrap">
            GAMES
          </Text>
        </Box>
      </BannerTitleArea>

      <BannerControlStrip>
        <BannerDropdown label="Season" value={String(season)} onChange={onSeasonChange} options={seasonOptions} minW="6rem" />
        <BannerDropdown label="Week" value={String(week)} onChange={onWeekChange} options={weekOptions} minW="7.5rem" />
        <BannerDropdown label="Conf." value={String(conference)} onChange={onConferenceChange} options={conferenceOptions} minW="7rem" />
        <BannerDropdown label="Team" value={teamId} onChange={onTeamChange} options={teamOptions} minW="9rem" />
        <BannerDropdown label="Status" value={String(status)} onChange={onStatusChange} options={statusOptions} minW="8rem" />
      </BannerControlStrip>
    </Box>
  );
};

export default GamesHubBanner;
