// Legacy player statistics adapters. buildGameLog still generates mock counting
// values from PAR/production signals; it is used by the player game-log view.
// buildParGauges reads real PAR components. Do not treat generated categories
// as published box scores. See the player backend note dated 2026-11-06.
import { round1, POSITION_CATEGORIES, CATEGORY_LABELS, CATEGORY_COLUMNS, CATEGORY_BUILDERS } from "./statsMock/categoryMocks";

const percentileRank = (list, value) => {
  const nums = list.filter((n) => Number.isFinite(n));
  if (!nums.length || !Number.isFinite(value)) return null;
  const below = nums.filter((n) => n < value).length;
  return Math.round((below / nums.length) * 100);
};

// Real data, not mocked — season_components (per-category PAR) and par
// (total) both exist on the enriched stats source today. Whatever component
// keys a player actually has (passing_production for a QB, rushing/
// receiving for a skill player) drive the gauges, plus one Total gauge.
export const buildParGauges = (player, positionPeers = []) => {
  const components = player?.season_components ?? {};
  const gauges = Object.keys(components).map((key) => {
    const value = Number(components[key] ?? 0);
    const peerValues = positionPeers.map((p) => Number(p?.season_components?.[key] ?? 0));
    return {
      key,
      label: `${key.replace(/_production$/, "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} PAR`,
      value: round1(value),
      percentile: percentileRank(peerValues, value),
    };
  });

  const totalValue = Number(player?.par ?? 0);
  gauges.push({
    key: "total",
    label: "Total PAR",
    value: round1(totalValue),
    percentile: percentileRank(positionPeers.map((p) => Number(p?.par ?? 0)), totalValue),
  });

  return gauges;
};

// Game log — one row per game. Box-score columns are mock (same reason as
// buildProductionGrid), but the per-game magnitude driving each row is real:
// player.games[] already carries a real per-game PAR total from the enriched
// stats source, so a big/small game in this table lines up with the player's
// actual real good/bad games instead of being independently randomized.
export const buildGameLog = (player) => {
  const position = String(player?.position_group ?? "ATH").toUpperCase();
  const categories = POSITION_CATEGORIES[position] ?? ["defense"];
  const realGames = Array.isArray(player?.games) && player.games.length ? player.games : null;
  const count = realGames ? realGames.length : Math.max(1, Number(player?.games_played ?? 8));
  const fallbackSignal = Math.max(0, Number(player?.total_production ?? player?.par ?? 8)) / count;

  return Array.from({ length: count }, (_, i) => {
    const real = realGames?.[i];
    const gameSignal = Math.max(0.5, Number(real?.total ?? fallbackSignal));
    return {
      week: i + 1,
      gameId: real?.game_id ?? null,
      categories: categories.map((key) => ({
        key,
        label: CATEGORY_LABELS[key],
        columns: CATEGORY_COLUMNS[key],
        stats: CATEGORY_BUILDERS[key](gameSignal, 1),
      })),
    };
  });
};

export { buildSeasonByYear, buildAdvancedMetrics, buildProductionGrid } from "./statsMock/seasonModels";

export { buildHeadlineSnapshot } from "./statsMock/headlineModels";
