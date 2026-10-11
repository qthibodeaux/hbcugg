// Mock generators for the Stats tab, shaped to match
// inspo/inventory/PLAYER_MOCK_cam_peters_2026-08-21.json and the accompanying
// PLAYER_STATS_ADVANCED_INVENTORY_2026-08-21.md field inventory — real field
// names, mock values. Counting-stat category tables (passing/rushing/etc.)
// aren't in our currently-wired data at all yet (only PAR/production_score
// components are), so every category builder below is driven off the one
// real signal we do have (par / total_production / games_played), same
// convention as the Rushing/Havoc/OL charts elsewhere in this app. Swap-in
// point for real data: replace each mockX() call with a real per-player
// season rollup once the backend contract from PlayerDNAReferenceDesign.md /
// the inventory doc lands.

const clamp = (v, min = 0, max = Infinity) => Math.max(min, Math.min(max, v));
const round1 = (v) => Math.round(v * 10) / 10;

const mockPassing = (signal, games) => {
  const attempts = Math.round(clamp(games * (18 + signal * 0.5), 20, 450));
  const completions = Math.round(attempts * clamp(0.5 + signal * 0.01, 0.4, 0.72));
  const yards = Math.round(completions * clamp(9 + signal * 0.05, 7, 13));
  const touchdowns = Math.round(clamp(signal * 0.25, 0, 40));
  const interceptions = Math.round(clamp(8 - signal * 0.05, 2, 15));
  const sacksTaken = Math.round(clamp(games * 1.5, 5, 35));
  return { attempts, completions, yards, touchdowns, interceptions, sacks_taken: sacksTaken, sack_yards_lost: sacksTaken * 7 };
};

const mockRushing = (signal, games) => {
  const attempts = Math.round(clamp(games * (8 + signal * 0.3), 10, 320));
  const yards = Math.round(attempts * clamp(3.5 + signal * 0.03, 2.5, 7));
  return { attempts, yards, touchdowns: Math.round(clamp(signal * 0.15, 0, 25)), fumbles: Math.round(clamp(signal * 0.02, 0, 6)) };
};

const mockReceiving = (signal, games) => {
  const targets = Math.round(clamp(games * (4 + signal * 0.3), 5, 200));
  const receptions = Math.round(targets * clamp(0.55 + signal * 0.005, 0.45, 0.75));
  const yards = Math.round(receptions * clamp(11 + signal * 0.05, 8, 16));
  return { targets, receptions, yards, touchdowns: Math.round(clamp(signal * 0.12, 0, 20)), fumbles: Math.round(clamp(signal * 0.01, 0, 4)) };
};

const mockDefense = (signal, games) => {
  const tackles = Math.round(clamp(games * (3 + signal * 0.4), 5, 180));
  const soloTackles = Math.round(tackles * 0.65);
  return {
    tackles,
    solo_tackles: soloTackles,
    assisted_tackles: tackles - soloTackles,
    sacks: round1(clamp(signal * 0.08, 0, 18)),
    tfl: round1(clamp(signal * 0.12, 0, 25)),
    interceptions: Math.round(clamp(signal * 0.03, 0, 8)),
    forced_fumbles: Math.round(clamp(signal * 0.02, 0, 6)),
    passes_defended: Math.round(clamp(signal * 0.05, 0, 15)),
  };
};

const mockKicking = (signal, games) => {
  const fgAttempts = Math.round(clamp(games * 1.5, 5, 30));
  return {
    fg_attempts: fgAttempts,
    fg_makes: Math.round(fgAttempts * clamp(0.7 + signal * 0.005, 0.6, 0.92)),
    fg_long: Math.round(clamp(42 + signal * 0.3, 35, 58)),
    pat_attempts: Math.round(clamp(games * 3, 10, 60)),
    pat_makes: Math.round(clamp(games * 3, 10, 60) * 0.94),
  };
};

const mockPunting = (signal, games) => {
  const attempts = Math.round(clamp(games * 4.5, 15, 90));
  return {
    attempts,
    gross_yards: Math.round(attempts * clamp(40 + signal * 0.1, 36, 46)),
    long: Math.round(clamp(58 + signal * 0.2, 50, 70)),
    inside_20: Math.round(attempts * 0.32),
    touchbacks: Math.round(attempts * 0.08),
  };
};

const mockReturns = (signal, games) => {
  const attempts = Math.round(clamp(games * 1.8, 5, 40));
  return { attempts, yards: Math.round(attempts * clamp(11 + signal * 0.1, 8, 18)), touchdowns: Math.round(clamp(signal * 0.02, 0, 3)) };
};

const CATEGORY_BUILDERS = {
  passing: mockPassing, rushing: mockRushing, receiving: mockReceiving,
  defense: mockDefense, kicking: mockKicking, punting: mockPunting, returns: mockReturns,
};

const CATEGORY_LABELS = {
  passing: "Passing", rushing: "Rushing", receiving: "Receiving",
  defense: "Defense", kicking: "Kicking", punting: "Punting", returns: "Returns",
};

const CATEGORY_COLUMNS = {
  passing: [
    { key: "attempts", label: "Att" }, { key: "completions", label: "Comp" }, { key: "yards", label: "Yds" },
    { key: "touchdowns", label: "TD" }, { key: "interceptions", label: "Int" },
    { key: "sacks_taken", label: "Sacks" }, { key: "sack_yards_lost", label: "Sack Yds" },
  ],
  rushing: [
    { key: "attempts", label: "Att" }, { key: "yards", label: "Yds" }, { key: "touchdowns", label: "TD" }, { key: "fumbles", label: "Fum" },
  ],
  receiving: [
    { key: "targets", label: "Tgt" }, { key: "receptions", label: "Rec" }, { key: "yards", label: "Yds" },
    { key: "touchdowns", label: "TD" }, { key: "fumbles", label: "Fum" },
  ],
  defense: [
    { key: "tackles", label: "Tkl" }, { key: "solo_tackles", label: "Solo" }, { key: "assisted_tackles", label: "Ast" },
    { key: "sacks", label: "Sck" }, { key: "tfl", label: "TFL" }, { key: "interceptions", label: "Int" },
    { key: "forced_fumbles", label: "FF" }, { key: "passes_defended", label: "PD" },
  ],
  kicking: [
    { key: "fg_makes", label: "FGM" }, { key: "fg_attempts", label: "FGA" }, { key: "fg_long", label: "Long" },
    { key: "pat_makes", label: "PATM" }, { key: "pat_attempts", label: "PATA" },
  ],
  punting: [
    { key: "attempts", label: "Punts" }, { key: "gross_yards", label: "Yds" }, { key: "long", label: "Long" },
    { key: "inside_20", label: "In-20" }, { key: "touchbacks", label: "TB" },
  ],
  returns: [
    { key: "attempts", label: "Att" }, { key: "yards", label: "Yds" }, { key: "touchdowns", label: "TD" },
  ],
};

const POSITION_CATEGORIES = {
  QB: ["passing", "rushing"], RB: ["rushing", "receiving"], FB: ["rushing", "receiving"],
  WR: ["receiving", "rushing"], TE: ["receiving"],
  OL: [], DL: ["defense"], LB: ["defense"], DB: ["defense"],
  K: ["kicking"], P: ["punting"], ST: ["returns"],
};

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

const EXTRA_COLUMNS = {
  passing: [{ key: "comp_pct", label: "Cmp%" }, { key: "avg", label: "Avg" }, { key: "long", label: "Lng" }],
  rushing: [{ key: "avg", label: "Avg" }, { key: "long", label: "Lng" }],
  receiving: [{ key: "avg", label: "Avg" }, { key: "long", label: "Lng" }],
};

const deriveExtra = (categoryKey, stats) => {
  if (categoryKey === "passing") {
    return {
      comp_pct: stats.attempts ? round1((stats.completions / stats.attempts) * 100) : 0,
      avg: stats.attempts ? round1(stats.yards / stats.attempts) : 0,
      long: Math.round(clamp(35 + stats.yards * 0.02, 15, 90)),
    };
  }
  if (categoryKey === "rushing") {
    return { avg: stats.attempts ? round1(stats.yards / stats.attempts) : 0, long: Math.round(clamp(10 + stats.yards * 0.03, 5, 80)) };
  }
  if (categoryKey === "receiving") {
    return { avg: stats.receptions ? round1(stats.yards / stats.receptions) : 0, long: Math.round(clamp(12 + stats.yards * 0.03, 8, 85)) };
  }
  return {};
};

// ESPN-style season-by-season + bold Career total row. Real multi-season
// per-player rollups don't exist yet (career_profiles.json isn't wired in),
// so this mocks a prior season at reduced scale plus the current season
// (driven by the real signal, same as everywhere else), summed into a
// Career row — same shape PLAYER_MOCK_cam_peters.json's production_grid.
// career already anticipated, just not built against until now.
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

// Yards/Dropback is a real derivation off fields we already mock (no new
// signal needed); EPA/EPA-per-dropback/Success Rate are placeholders — real
// player-level EPA aggregation isn't wired into this app's data hooks yet,
// even though play-level EPA is confirmed real in the game files. Production
// Points is just total_production relabeled — real, not invented.
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

// Headline snapshot — position-dependent marquee stats, each with a
// conference rank computed against the passed-in position peers (using the
// SAME mock generator, so the rank is at least internally consistent even
// though the underlying numbers are placeholders).
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
