import { getTeamAccent, getTeamLabel, getTeamLogoSrc } from "../../../../utils/gameSummary/teamIdentity";
import { buildStatChips } from "../../../../utils/gameSummary/playerProductionModel";
import { splitDisplayName, resolveImages } from "../../../../utils/headshots";
import { EditorialCard, SectionLabel } from "./SummaryPrimitives";
import { PerformerCard } from "../../../molecules/game/PerformerCard";
import { topParPlayers } from "../../../../utils/gameParCard";

// Extracted from GameSummaryTabV2; behavior and visual variants are preserved.

// `mobile`: a short card — a narrower portrait (so the photo scales down and the whole
// head fits), last name only, team · position and score on one line.
export const NotablePerformersCard = ({ awayId, homeId, teamEntries, identity, parCard, mobile = false }) => {
  const awayColor = getTeamAccent(awayId);
  const homeColor = getTeamAccent(homeId);
  // The game's three largest PARs (the file's par_card), one number: PAR.
  const performers = topParPlayers(parCard, 3).map((p) => {
    const [first, last] = splitDisplayName(p.name);
    return {
      name: p.name,
      team: p.team_id,
      position: p.position,
      total: p.par,
      chips: buildStatChips(p.person_id, p.position, p.team_id, teamEntries),
      player_key: p.person_id,
      first,
      last,
      images: resolveImages(identity, { ...p, player_key: p.person_id }, p.team_id),
    };
  });
  if (performers.length === 0) return null;

  // Rendered by the shared PerformerCard: "story" here (the card tells the game's
  // story), "mobile" on a phone. Week Central draws the same card as "scan".
  return (
    <EditorialCard position="relative" overflow="hidden" className="animate-slide-in" h="full" w="full" display="flex" flexDirection="column" style={{ animationDelay: "0.35s" }}>
      <PerformerCard
        variant={mobile ? "mobile" : "story"}
        performers={performers.map((p) => ({ key: p.player_key ?? p.name, first: p.first, last: p.last, teamId: p.team, position: p.position, total: p.total, chips: p.chips, images: p.images }))}
        header={<SectionLabel>Notable Performers</SectionLabel>}
        colorFor={(id) => (id === homeId ? homeColor : awayColor)}
        teamLabel={getTeamLabel}
        logoFor={getTeamLogoSrc}
      />
    </EditorialCard>
  );
};
