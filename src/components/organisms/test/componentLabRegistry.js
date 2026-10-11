import { GamePreviewScoutA } from "./GamePreviewScoutA";
import { StatsHubContextCardsA } from "./StatsHubContextCardsA";
import { GameCenterContextCardsA } from "./GameCenterContextCardsA";
import { GameBannerMobileA } from "./GameBannerMobileA";

const registry = [
  {
    number: 1713,
    name: "Game Preview - Scout (JSU at GSU)",
    agent: "HBCUGG",
    date: "2026-10-07",
    size: "4x8",
    component: GamePreviewScoutA,
    hideOverlay: true,
  },
  {
    number: 1712,
    name: "Stats Hub - Context Cards (11)",
    agent: "HBCUGG",
    date: "2026-10-07",
    size: "4x6",
    component: StatsHubContextCardsA,
    hideOverlay: true,
  },
  {
    number: 1711,
    name: "Game Center Hub - Context Cards (15)",
    agent: "HBCUGG",
    date: "2026-10-04",
    size: "4x8",
    component: GameCenterContextCardsA,
    hideOverlay: true,
  },
  {
    number: 1710,
    name: "Game Page - Banner - Mobile",
    agent: "HBCUGG",
    date: "2026-10-03",
    size: "4x2",
    component: GameBannerMobileA,
    hideOverlay: true,
  },
];

// Diagnostic: Log invalid component types
registry.forEach((entry) => {
  if (typeof entry.component !== "function") {
    // eslint-disable-next-line no-console
    console.warn(
      `[LAB REGISTRY WARNING] Entry #${entry.number} (${entry.name}) has invalid component type:`,
      typeof entry.component,
      entry.component
    );
  }
});

export { registry };
