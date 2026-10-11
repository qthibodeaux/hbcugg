import { Box, Flex, Text } from "@chakra-ui/react";
import { BannerSegmentedPills, BannerDropdown, BannerTogglePill, BannerControlStrip } from "../../organisms/BannerControls";
import { usePlayerAnalytics, useRosterHub } from "../../../hooks/useSWACData";
import { PlayerAvatarCollage } from "./PlayerAvatarCollage";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";

// Shared height for the two mobile bands (ticker + controls) so they always
// match. ~80% taller than the desktop ticker strip.
const MOBILE_BAND_H = "3.25rem";

const VIEW_OPTIONS = [
  { value: "card", label: "Card View" },
  { value: "line", label: "Line View" },
];

const GROUP_OPTIONS = [
  { value: "position", label: "Position" },
  { value: "class", label: "Class Year" },
  { value: "none", label: "None" },
];

const SORT_OPTIONS = [
  { value: "jersey", label: "Jersey #" },
  { value: "name", label: "Name" },
  { value: "class", label: "Class" },
  { value: "glory", label: "Glory Score" },
];

const toV5TeamId = (team) => team?.exportId?.replace(/25$/, "");

const asPct = (value) => {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return "0%";
  return `${Math.round(n > 1 ? n : n * 100)}%`;
};

const asNumber = (value, fallback = "-") => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return n >= 100 ? Math.round(n).toLocaleString() : n.toFixed(1);
};

const readableTextColor = (hex) => {
  if (!hex || !/^#?[0-9a-f]{6}$/i.test(hex)) return "#0B0B0D";
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.58 ? "#0B0B0D" : "#FFFFFF";
};

const TickerSegment = ({ label, value, dividerColor, textColor, isMobile }) => {
  // Mobile doubles the desktop 8px ticker type to fill the taller band.
  const size = isMobile ? "1rem" : { base: "8px", md: "9px", lg: "10px" };

  return (
    <Flex align="center" gap={{ base: 2, lg: 3 }} flexShrink={0}>
      <Text fontSize={size} fontWeight="black" color={textColor} textTransform="uppercase" letterSpacing="0.1em" whiteSpace="nowrap">
        {label}
      </Text>
      <Text fontSize={size} fontWeight="black" color={textColor} opacity={0.68} textTransform="uppercase" whiteSpace="nowrap">
        {value}
      </Text>
      <Box w="1px" h={isMobile ? "1.5rem" : "12px"} bg={dividerColor} opacity={0.3} />
    </Flex>
  );
};

export const RosterViewControlBar = ({
  team,
  season = 2025,
  rosterCount,
  roster,
  view,
  onViewChange,
  groupBy,
  onGroupByChange,
  sortBy,
  onSortByChange,
  filters,
  onToggleFilter,
}) => {
  const { isMobile } = useLayoutDensity();
  const secondary = team?.colors?.secondary ?? "#FDB913";
  const tickerText = readableTextColor(secondary);
  const v5TeamId = toV5TeamId(team);

  const { teams: rosterTeams } = useRosterHub(season);
  const { teamAnalytics } = usePlayerAnalytics();

  const rosterModule = rosterTeams?.[v5TeamId] ?? {};
  const teamStats = teamAnalytics?.[v5TeamId] ?? {};

  const tickerData = {
    par: asNumber(teamStats.avg_par ?? 0, "0.0"),
    transferRate: asPct(rosterModule.transfers?.transfer_rate ?? teamStats.transfer_rate ?? 0),
    transferCount: rosterModule.transfers?.transfer_count ?? teamStats.transfer_count ?? "-",
    veterans: asPct(rosterModule.experience?.veteran_pct ?? 0),
  };

  const tickerItems = [
    ["Team", `${team?.shortName || "Team"} - ${team?.mascot || "Football"}`],
    ["Roster", `${rosterCount} active`],
    ["Avg PAR", tickerData.par],
    ["Transfers", `${tickerData.transferRate} / ${tickerData.transferCount} players`],
    ["Veterans", `${tickerData.veterans} upperclass`],
    ["Conference", `${team?.conference || "HBCU"}${team?.division ? ` ${team.division}` : ""}`],
    ["Season", season],
  ];
  const tickerLoop = [...tickerItems, ...tickerItems];

  return (
    <Flex
      direction="column"
      w="full"
      h="full"
      bg="bg.secondary"
      border={isMobile ? "none" : "1px solid"}
      borderColor="whiteAlpha.100"
      borderRadius={isMobile ? 0 : "2xl"}
      overflow="hidden"
    >
      <style>{`
        @keyframes rosterControlBarTickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Mobile ticker is ~80% taller than the desktop strip. Both bands
          read from MOBILE_BAND_H so they are equal by construction rather
          than by two literals that can drift apart. */}
      <Box
        h={isMobile ? MOBILE_BAND_H : "clamp(1.75rem, 12%, 2.25rem)"}
        bg={secondary}
        overflow="hidden"
        borderBottom="1px solid"
        borderColor="blackAlpha.200"
        flexShrink={0}
      >
        <Flex
          h="full"
          align="center"
          gap={{ base: 4, lg: 7 }}
          px={4}
          w="max-content"
          style={{ animation: "rosterControlBarTickerScroll 34s linear infinite" }}
        >
          {tickerLoop.map(([label, value], index) => (
            <TickerSegment key={`${label}-${index}`} label={label} value={value} dividerColor={tickerText} textColor={tickerText} isMobile={isMobile} />
          ))}
        </Flex>
      </Box>

      {/* The avatar marquee is desktop-only — on mobile the bar is just the
          scrolling ticker with the controls as a stripe directly beneath it,
          no filler art and no reserved height for it. */}
      {!isMobile && (
        <Box flex={1} minH={0}>
          <PlayerAvatarCollage players={roster} />
        </Box>
      )}

      {/* Mobile keeps only the card/line toggle and the position dropdown —
          Sort, Transfers and Redshirts wrapped onto a second row and made
          this band twice the ticker's height. One row, matching the ticker. */}
      {isMobile ? (
        <Flex align="center" justify="space-between" gap="0.5rem" h={MOBILE_BAND_H} px="0.6rem" flexShrink={0}>
          <BannerSegmentedPills options={VIEW_OPTIONS} value={view} onChange={onViewChange} />
          <BannerDropdown label="Group" value={groupBy} onChange={onGroupByChange} options={GROUP_OPTIONS} minW="7rem" />
        </Flex>
      ) : (
        <BannerControlStrip>
          <BannerSegmentedPills options={VIEW_OPTIONS} value={view} onChange={onViewChange} />
          <BannerDropdown label="Group" value={groupBy} onChange={onGroupByChange} options={GROUP_OPTIONS} minW="8rem" />
          <BannerDropdown label="Sort" value={sortBy} onChange={onSortByChange} options={SORT_OPTIONS} minW="8rem" />
          <BannerTogglePill active={filters.transfersOnly} onClick={() => onToggleFilter("transfersOnly")}>
            Transfers
          </BannerTogglePill>
          <BannerTogglePill active={filters.redshirtsOnly} onClick={() => onToggleFilter("redshirtsOnly")}>
            Redshirts
          </BannerTogglePill>
        </BannerControlStrip>
      )}
    </Flex>
  );
};
