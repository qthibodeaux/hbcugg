import { Box, Flex } from "@chakra-ui/react";
import { BannerSegmentedPills, BannerDropdown, BannerTogglePill, BannerControlStrip } from "../../organisms/BannerControls";
import { MOBILE_BAND_H, RosterViewTicker } from "./RosterViewTicker";
import { PlayerAvatarCollage } from "./PlayerAvatarCollage";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";

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
      <RosterViewTicker team={team} season={season} rosterCount={rosterCount} isMobile={isMobile} />

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
