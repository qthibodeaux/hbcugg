import { useMemo } from "react";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import PlayersTab from "./roster/PlayersTab";
import { RosterLineList, formatClassYear } from "./roster/RosterLineList";

const POSITION_ORDER = ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB", "ST", "Unknown"];
const CLASS_GROUP_ORDER = ["FR", "SO", "JR", "SR", "GR", "--"];

const normalizePosition = (player) => {
  const value = player?.position_group || player?.position || player?.position_abbr || "Unknown";
  const upper = String(value).toUpperCase();
  if (["K", "P", "LS"].includes(upper)) return "ST";
  if (POSITION_ORDER.includes(upper)) return upper;
  return "Unknown";
};

const normalizeClassGroup = (player) => formatClassYear(player.class_year);

const getClassYearNum = (player) => {
  const num = Number(player.class_year);
  return Number.isFinite(num) ? num : 0;
};

const sortPlayers = (players = [], sortBy = "jersey") => {
  const sorted = [...players];
  switch (sortBy) {
    case "name":
      sorted.sort((a, b) => String(a.full_name || "").localeCompare(String(b.full_name || "")));
      break;
    case "class":
      sorted.sort((a, b) => getClassYearNum(a) - getClassYearNum(b));
      break;
    case "glory":
      sorted.sort((a, b) => (b.experience_score ?? b.par ?? 0) - (a.experience_score ?? a.par ?? 0));
      break;
    case "jersey":
    default: {
      sorted.sort((a, b) => {
        const aNum = Number(a.jersey_number);
        const bNum = Number(b.jersey_number);
        const aVal = Number.isFinite(aNum) ? aNum : Infinity;
        const bVal = Number.isFinite(bNum) ? bNum : Infinity;
        return aVal - bVal;
      });
    }
  }
  return sorted;
};

const applyFilters = (roster = [], filters = {}) =>
  roster.filter((player) => {
    if (filters.transfersOnly && !player.is_transfer) return false;
    if (filters.redshirtsOnly && !player.is_redshirt) return false;
    return true;
  });

const groupRoster = (roster = [], groupBy = "position", sortBy = "jersey") => {
  if (groupBy === "none") {
    return [{ key: "all", label: null, players: sortPlayers(roster, sortBy) }];
  }

  const keyFn = groupBy === "class" ? normalizeClassGroup : normalizePosition;
  const order = groupBy === "class" ? CLASS_GROUP_ORDER : POSITION_ORDER;

  const groups = new Map();
  roster.forEach((player) => {
    const key = keyFn(player);
    if (!groups.has(key)) {
      groups.set(key, { key, label: key, players: [] });
    }
    groups.get(key).players.push(player);
  });

  return [...groups.values()]
    .map((group) => ({ ...group, players: sortPlayers(group.players, sortBy) }))
    .sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
};

const RosterTab = ({
  team,
  roster = [],
  isLoading = false,
  year = 2025,
  view = "card",
  groupBy = "position",
  sortBy = "jersey",
  filters = { transfersOnly: false, redshirtsOnly: false },
}) => {
  const filteredRoster = useMemo(() => applyFilters(roster, filters), [roster, filters]);
  const groupedRoster = useMemo(() => groupRoster(filteredRoster, groupBy, sortBy), [filteredRoster, groupBy, sortBy]);
  const cardRoster = useMemo(() => sortPlayers(filteredRoster, sortBy), [filteredRoster, sortBy]);

  if (isLoading) {
    return (
      <Flex h="full" minH="180px" align="center" justify="center">
        <Spinner color="brand.500" size="lg" />
      </Flex>
    );
  }

  if (!filteredRoster.length) {
    return (
      <Box py={12} textAlign="center">
        <Text color="text.muted" fontSize="sm">
          {roster.length ? "No players match the current filters." : "No roster data found for this team."}
        </Text>
      </Box>
    );
  }

  return (
    <Box w="full">
      {view === "card" && <PlayersTab team={team} year={year} players={cardRoster} />}
      {view === "line" && <RosterLineList groupedRoster={groupedRoster} team={team} />}
    </Box>
  );
};

export default RosterTab;
