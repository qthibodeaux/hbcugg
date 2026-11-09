import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { normalizeTeamKey, teamMeta, teamShort, teamLogo } from "./weekBrief/briefBlockModel";
import { Box } from "@chakra-ui/react";
import { PerformerCard } from "./PerformerCard";
import { BlockLabel } from "./weekBrief/BriefTeamStats";

// ─── Identity ────────────────────────────────────────────────────────────────
// Roster identity for a game-file player row. `player_key` is the PERS_ id on
// the 2026 files, so the roster joins on person_id first; older files carry a
// name key and fall back to the name+team headshot lane. No image when neither
// resolves — the avatar renders initials.
// `priorPlayerSeasons` is the season before — same person_id, and often a
// real headshot where the current roster's URL is dead (the 2026 drop ships
// placeholder hosts; see LAUNCH_0_BACKEND_NOTES.md). Candidates are tried
// in order at render time; a URL that fails to load falls through to the next.
export { buildIdentityIndex, resolveImages, resolveImage } from "../../../utils/headshots";

// The Notable Performers card is the shared PerformerCard. Desktop reads as a
// dense "scan" card (the production-card stat set, six stats); compact and mobile
// get the short "mobile" card (the backend's chips, three).
export const BriefPerformers = ({ performers, homeId, awayColor, homeColor, accent }) => {
  const { isStandard } = useLayoutDensity();
  if (!performers.length) return null;
  const colorFor = (teamId) => (normalizeTeamKey(teamId) === normalizeTeamKey(homeId) ? homeColor : awayColor);
  const cards = performers.map((p) => ({
    ...p,
    chips: isStandard && p.desktopChips.length > 0 ? p.desktopChips : p.chips,
  }));

  return (
    <Box
      position="relative"
      overflow="hidden"
      borderRadius="md"
      bg="rgba(0,0,0,0.28)"
      border="1px solid"
      borderColor="rgba(255,255,255,0.12)"
      minH={{ base: "150px", xl: "230px" }}
      display="flex"
    >
      <PerformerCard
        variant={isStandard ? "scan" : "mobile"}
        performers={cards}
        header={<BlockLabel color={accent}>Notable Performers</BlockLabel>}
        colorFor={colorFor}
        teamLabel={(id) => teamMeta(id)?.shortName ?? teamShort(id)}
        logoFor={teamLogo}
      />
    </Box>
  );
};

export { buildTeamStatRows } from "./weekBrief/briefBlockModel";

export { initialsOf, HeadshotOrInitials } from "./weekBrief/HeadshotOrInitials";

export { BriefTeamStats } from "./weekBrief/BriefTeamStats";

export { buildDesktopChips } from "./weekBrief/performerChips";

export { buildPerformers } from "./weekBrief/performerModel";
