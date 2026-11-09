import { POSITION_CATEGORIES, CATEGORY_BUILDERS, deriveExtra, CATEGORY_LABELS, CATEGORY_COLUMNS, EXTRA_COLUMNS, mockPassing, round1, clamp } from "./categoryMocks";

// LEGACY MOCK ADAPTERS: synthetic season/career and advanced/category values.
// Extraction preserves prior behavior; it does not validate these values as measured football statistics.

export const buildSeasonByYear = (player) => {
  const position = String(player?.position_group ?? "ATH").toUpperCase();
  const categories = POSITION_CATEGORIES[position] ?? ["defense"];
  const signal = Math.max(0, Number(player?.total_production ?? player?.par ?? 8));
  const games = Math.max(1, Number(player?.games_played ?? 8));
  const team = (player?.team ?? player?.team_id ?? "-").toUpperCase();

  const seasons = [
    { year: 2024, games: Math.max(1, Math.round(games * 0.8)), signal: signal * 0.55 },
    { year: 2025, games, signal },
  ];

  return categories.map((catKey) => {
    const rows = seasons.map((s) => {
      const stats = CATEGORY_BUILDERS[catKey](s.signal, s.games);
      return { year: String(s.year), team, ...stats, ...deriveExtra(catKey, stats) };
    });

    const career = rows.reduce((acc, row) => {
      Object.entries(row).forEach(([k, v]) => {
        if (typeof v === "number") acc[k] = (acc[k] ?? 0) + v;
      });
      return acc;
    }, {});
    Object.assign(career, deriveExtra(catKey, career));
    career.year = "Career";
    career.team = "";

    return {
      key: catKey,
      label: CATEGORY_LABELS[catKey],
      columns: [...CATEGORY_COLUMNS[catKey], ...(EXTRA_COLUMNS[catKey] ?? [])],
      rows: [...rows, career],
    };
  });
};

export const buildAdvancedMetrics = (player) => {
  const signal = Math.max(0, Number(player?.total_production ?? player?.par ?? 8));
  const position = String(player?.position_group ?? "ATH").toUpperCase();
  const games = Math.max(1, Number(player?.games_played ?? 8));
  const passing = position === "QB" ? mockPassing(signal, games) : null;
  const dropbacks = passing ? passing.attempts + passing.sacks_taken : null;

  return {
    productionPoints: round1(Number(player?.total_production ?? 0)),
    yardsPerDropback: passing && dropbacks ? round1(passing.yards / dropbacks) : null,
    epaPerDropback: round1(clamp(0.15 + signal * 0.01, -0.3, 0.6)),
    epa: round1(clamp(signal * 1.1, -20, 60)),
    successRate: round1(clamp(38 + signal * 0.5, 20, 65)),
  };
};

export const buildProductionGrid = (player) => {
  const position = String(player?.position_group ?? "ATH").toUpperCase();
  const categories = POSITION_CATEGORIES[position] ?? ["defense"];
  const signal = Math.max(0, Number(player?.total_production ?? player?.par ?? 8));
  const games = Math.max(1, Number(player?.games_played ?? 8));

  return categories.map((key) => ({
    key,
    label: CATEGORY_LABELS[key],
    columns: CATEGORY_COLUMNS[key],
    stats: CATEGORY_BUILDERS[key](signal, games),
  }));
};
