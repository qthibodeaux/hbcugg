// The game file's `par_card` (collegefootballstatcards format): every player's PAR for the
// game, per team. Notable Performers on the game page and Week Central are the game's
// largest PARs, so both read the card through this one function.

/** The game's top `n` players by PAR, high to low, both teams: each card player plus `team_id`.
 *  Empty when the file has no card or it reads `available: false`. */
export const topParPlayers = (parCard, n = 3) => {
  if (!parCard?.available) return [];
  return Object.entries(parCard.teams ?? {})
    .flatMap(([teamId, t]) => (t?.players ?? []).map((p) => ({ ...p, team_id: teamId })))
    .filter((p) => Number.isFinite(p.par))
    .sort((a, b) => b.par - a.par)
    .slice(0, n);
};
