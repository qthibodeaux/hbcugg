import { splitDisplayName, resolveImages } from "../../../../utils/headshots";
import { normalizeTeamKey } from "./briefBlockModel";
import { buildDesktopChips } from "./performerChips";
import { topParPlayers } from "../../../../utils/gameParCard";

// The game's three largest PARs (the file's par_card), identity resolution and the desktop chip
// adaptation. The mobile chips are the backend's notable_performers chips when the player is on
// that list, else none.

const PERFORMER_COUNT = 3;

export const buildPerformers = (parsedGame, identity) => {
  const listed = Array.isArray(parsedGame?.notable_performers) ? parsedGame.notable_performers : [];
  const chipsOf = (id) => listed.find((n) => n.player_key === id)?.chips;
  return topParPlayers(parsedGame?.par_card, PERFORMER_COUNT).map((p) => {
    const [first, last] = splitDisplayName(p.name);
    return {
      key: p.person_id ?? p.name,
      first,
      last,
      name: `${first} ${last}`.trim(),
      teamId: normalizeTeamKey(p.team_id),
      position: p.position ?? null,
      total: p.par,
      chips: Array.isArray(chipsOf(p.person_id)) ? chipsOf(p.person_id) : [],
      images: resolveImages(identity, { ...p, player_key: p.person_id }, p.team_id),
    };
  }).map((performer) => ({ ...performer, desktopChips: buildDesktopChips(parsedGame, performer) }));
};
