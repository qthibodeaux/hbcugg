

// LEGACY MOCK STATISTICS: category values are generated from a production/PAR signal.
// These are not published counting statistics. Preserve only for existing compatibility pending real-data wiring.

export const clamp = (v, min = 0, max = Infinity) => Math.max(min, Math.min(max, v));

export const round1 = (v) => Math.round(v * 10) / 10;

export const mockPassing = (signal, games) => {
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

export const CATEGORY_BUILDERS = {
  passing: mockPassing, rushing: mockRushing, receiving: mockReceiving,
  defense: mockDefense, kicking: mockKicking, punting: mockPunting, returns: mockReturns,
};

export const CATEGORY_LABELS = {
  passing: "Passing", rushing: "Rushing", receiving: "Receiving",
  defense: "Defense", kicking: "Kicking", punting: "Punting", returns: "Returns",
};

export const CATEGORY_COLUMNS = {
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

export const POSITION_CATEGORIES = {
  QB: ["passing", "rushing"], RB: ["rushing", "receiving"], FB: ["rushing", "receiving"],
  WR: ["receiving", "rushing"], TE: ["receiving"],
  OL: [], DL: ["defense"], LB: ["defense"], DB: ["defense"],
  K: ["kicking"], P: ["punting"], ST: ["returns"],
};

export const EXTRA_COLUMNS = {
  passing: [{ key: "comp_pct", label: "Cmp%" }, { key: "avg", label: "Avg" }, { key: "long", label: "Lng" }],
  rushing: [{ key: "avg", label: "Avg" }, { key: "long", label: "Lng" }],
  receiving: [{ key: "avg", label: "Avg" }, { key: "long", label: "Lng" }],
};

export const deriveExtra = (categoryKey, stats) => {
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
