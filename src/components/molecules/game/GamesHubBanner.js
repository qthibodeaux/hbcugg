import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { MobileBanner, GRADIENT } from "./gamesHubBanner/GamesHubMobileBanner";
import { Box, Text } from "@chakra-ui/react";
import { BannerTitleArea, BannerGhostWord, BannerControlStrip, BannerDropdown } from "../../organisms/BannerControls";

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
