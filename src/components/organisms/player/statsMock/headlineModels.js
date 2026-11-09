import { round1 } from "./categoryMocks";
import { buildProductionGrid } from "./seasonModels";

// LEGACY MOCK HEADLINES: position snapshots/ranks over generated category values.
// Keep distinct from backend-published statistics and ranks.

const HEADLINE_CONFIG = {
  QB: [
    { label: "Pass Yards", category: "passing", key: "yards" },
    { label: "Pass TDs", category: "passing", key: "touchdowns" },
    { label: "Completion %", category: "passing", derive: (s) => round1((s.completions / Math.max(1, s.attempts)) * 100) },
    { label: "Rush Yards", category: "rushing", key: "yards" },
  ],
  RB: [
    { label: "Rush Yards", category: "rushing", key: "yards" },
    { label: "Yards/Carry", category: "rushing", derive: (s) => round1(s.yards / Math.max(1, s.attempts)) },
    { label: "Rush TDs", category: "rushing", key: "touchdowns" },
    { label: "Rec Yards", category: "receiving", key: "yards" },
  ],
  WR: [
    { label: "Rec Yards", category: "receiving", key: "yards" },
    { label: "Receptions", category: "receiving", key: "receptions" },
    { label: "Rec TDs", category: "receiving", key: "touchdowns" },
    { label: "Yards/Rec", category: "receiving", derive: (s) => round1(s.yards / Math.max(1, s.receptions)) },
  ],
  DEFAULT_DEFENSE: [
    { label: "Tackles", category: "defense", key: "tackles" },
    { label: "TFL", category: "defense", key: "tfl" },
    { label: "Sacks", category: "defense", key: "sacks" },
    { label: "Passes Def.", category: "defense", key: "passes_defended" },
  ],
  K: [
    { label: "FG Made", category: "kicking", key: "fg_makes" },
    { label: "FG Attempts", category: "kicking", key: "fg_attempts" },
    { label: "Long", category: "kicking", key: "fg_long" },
    { label: "PATs Made", category: "kicking", key: "pat_makes" },
  ],
  P: [
    { label: "Punts", category: "punting", key: "attempts" },
    { label: "Gross Yards", category: "punting", key: "gross_yards" },
    { label: "Long", category: "punting", key: "long" },
    { label: "Inside 20", category: "punting", key: "inside_20" },
  ],
};

const headlineForPosition = (position) => {
  if (HEADLINE_CONFIG[position]) return HEADLINE_CONFIG[position];
  if (position === "TE" || position === "FB") return HEADLINE_CONFIG.RB;
  if (["K"].includes(position)) return HEADLINE_CONFIG.K;
  if (["P"].includes(position)) return HEADLINE_CONFIG.P;
  return HEADLINE_CONFIG.DEFAULT_DEFENSE;
};

const valueForConfig = (cfg, grid) => {
  const cat = grid.find((g) => g.key === cfg.category);
  if (!cat) return 0;
  return cfg.derive ? cfg.derive(cat.stats) : Number(cat.stats[cfg.key] ?? 0);
};

export const buildHeadlineSnapshot = (player, positionPeers = []) => {
  const position = String(player?.position_group ?? "ATH").toUpperCase();
  const config = headlineForPosition(position);
  const grid = buildProductionGrid(player);

  const peerValues = positionPeers.map((peer) => {
    const peerGrid = buildProductionGrid(peer);
    return config.map((cfg) => valueForConfig(cfg, peerGrid));
  });

  return config.map((cfg, i) => {
    const value = valueForConfig(cfg, grid);
    const better = peerValues.filter((peer) => peer[i] > value).length;
    return {
      label: cfg.label,
      value,
      conferenceRank: positionPeers.length ? better + 1 : null,
      outOf: positionPeers.length || null,
    };
  });
};
