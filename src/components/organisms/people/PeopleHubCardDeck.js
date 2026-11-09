import { DuoFeatureCard, StateCohortCard, CohortCard, CoachCard } from "./cardDeck/CohortCards";
import { SoloTallCard, SoloCard } from "./cardDeck/SoloCards";

// ── Deck — exactly 4 cols x 3 rows = 12 cell-units ──────────────────────────
// Returns { heroes, deck } where each deck entry is {card, cols, rows, Component}
// — the caller (PeopleHubPage) renders these directly as real PageShell.Slots,
// this module doesn't own any layout/grid of its own.
export const buildDeck = (cards) => {
  const of = (l) => cards.filter((c) => c.layout === l);
  const solo = of("SOLO");
  const cohort = of("COHORT");
  const deck = [];
  const heroIds = new Set(solo.filter((c) => c.archetype === "outstanding_performance").slice(0, 3).map((c) => c.card_id));
  const deckSolo = solo.filter((c) => !heroIds.has(c.card_id));

  // rows 1-2 (8 units)
  of("DUO").slice(0, 1).forEach((card) => deck.push({ card, cols: 2, rows: 2, Component: DuoFeatureCard }));
  deckSolo.slice(0, 1).forEach((card) => deck.push({ card, cols: 1, rows: 2, Component: SoloTallCard }));
  cohort.filter((c) => c.viz?.kind === "state_map").slice(0, 2).forEach((card) => deck.push({ card, cols: 1, rows: 1, Component: StateCohortCard }));

  // row 3 (4 units)
  cohort.filter((c) => c.viz?.kind !== "state_map").slice(0, 2).forEach((card) => deck.push({ card, cols: 1, rows: 1, Component: CohortCard }));
  deckSolo.slice(1, 2).forEach((card) => deck.push({ card, cols: 1, rows: 1, Component: SoloCard }));
  of("COACH").slice(0, 1).forEach((card) => deck.push({ card, cols: 1, rows: 1, Component: CoachCard }));

  return { heroes: solo.filter((c) => heroIds.has(c.card_id)), deck };
};

export { HeroCarousel } from "./cardDeck/HeroCarousel";

export { SoloTallCard, SoloCard } from "./cardDeck/SoloCards";

export { DuoFeatureCard, CohortCard, StateCohortCard, CoachCard } from "./cardDeck/CohortCards";
