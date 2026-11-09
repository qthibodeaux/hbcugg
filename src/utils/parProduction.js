// ─────────────────────────────────────────────────────────────────────────────
// PAR in place of the production scores (the user, 2026-11-08: "replace production scores
// with PAR"). The backend's `par_card` (RESPONSE_par_cards.md) is turned into the
// `production_scores` row shape, so every consumer (box score bars, notable performers,
// the MVP panel, the export posters) reads PAR without its own change.
//
//   total                  ← par
//   passing_production     ← pass_par, for players compared as QB
//   receiving_production   ← pass_par, for everyone else (catching is their pass production)
//   rushing_production     ← rush_par
//   hit / hawk / scrum     ← hit_par / hawk_par / scrum_par
//   turnover_production    ← turn_par (counted in the total; no unit column of its own)
//
// A game without an available card keeps its production scores. The original block stays
// on the game as `production_scores_legacy`.
// ─────────────────────────────────────────────────────────────────────────────

const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);

const toRow = (p) => {
  const isQb = (p.compared_as ?? p.position) === "QB";
  const components = {
    passing_production: isQb ? num(p.pass_par) : undefined,
    receiving_production: isQb ? undefined : num(p.pass_par),
    rushing_production: num(p.rush_par),
    hit_production: num(p.hit_par),
    hawk_production: num(p.hawk_par),
    scrum_production: num(p.scrum_par),
    turnover_production: num(p.turn_par),
  };
  Object.keys(components).forEach((k) => components[k] === undefined && delete components[k]);
  return { player_key: p.person_id, name: p.name, position: p.position, production_total: num(p.par) ?? null, components, note: null };
};

export const withParAsProduction = (game) => {
  const card = game?.par_card;
  if (!game || !card?.available || !card.teams) return game;
  const production = Object.fromEntries(Object.entries(card.teams).map(([teamId, t]) => [teamId, (t.players ?? []).map(toRow)]));
  return { ...game, production_scores: production, production_scores_legacy: game.production_scores ?? null };
};
