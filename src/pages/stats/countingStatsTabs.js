// Counting-stats hubs (/stats/team, /stats/player) — the tab sets and the
// column definitions, one place. Shared by the pages (validation + tables),
// the sidebar (sub-items) and the mock builder (which reads the same keys).
//
// Layout follows the conference sites' Sidearm tables: rank · name · G · the
// tab's columns · a per-game average last. Column `key` is the field on the
// payload block; `w` is the grid track; `dec` is decimals for numbers; `pct`
// renders 0.xx as xx.x.

// ─── Team stats ─────────────────────────────────────────────────────────────

export const TEAM_STATS_TABS = [
  { id: "scoring", label: "Scoring" },
  { id: "totals", label: "Totals" },
  { id: "rushing", label: "Rushing" },
  { id: "passing", label: "Passing" },
  { id: "returns", label: "Returns" },
  { id: "kicking", label: "Kicking" },
  { id: "defense", label: "Defense" },
  { id: "conversions", label: "Conversions" },
  { id: "misc", label: "Misc" },
  { id: "penalties", label: "Penalties" },
];
export const TEAM_STATS_TAB_IDS = TEAM_STATS_TABS.map((t) => t.id);
export const DEFAULT_TEAM_STATS_TAB = "scoring";

// Each tab renders one or more tables per side (offense | defense). A table
// is { id, title, block, columns, defaultSort }: `block` is the path under
// teams[].{offense|defense}; `defaultSort` is the column the rank is built on.
export const TEAM_STATS_TABLES = {
  scoring: [
    {
      id: "scoring", title: null, block: "scoring", defaultSort: "avg_g",
      columns: [
        { key: "td", label: "TD" }, { key: "fg", label: "FG" }, { key: "xpt", label: "XPT" },
        { key: "two_pt", label: "2XP" }, { key: "def_xp", label: "DXP" }, { key: "saf", label: "SAF" },
        { key: "pts", label: "PTS" }, { key: "avg_g", label: "AVG/G", dec: 1 },
      ],
    },
  ],
  totals: [
    {
      id: "totals", title: null, block: "totals", defaultSort: "avg_g",
      columns: [
        { key: "rush", label: "RUSH" }, { key: "pass", label: "PASS" }, { key: "plays", label: "PLAYS" },
        { key: "yds", label: "YDS" }, { key: "avg_p", label: "AVG/P", dec: 1 }, { key: "td", label: "TD" },
        { key: "avg_g", label: "AVG/G", dec: 1 },
      ],
    },
  ],
  rushing: [
    {
      id: "rushing", title: null, block: "rushing", defaultSort: "avg_g",
      columns: [
        { key: "att", label: "ATT" }, { key: "yds", label: "YDS" }, { key: "avg", label: "AVG", dec: 1 },
        { key: "td", label: "TD" }, { key: "long", label: "LONG" }, { key: "avg_g", label: "AVG/G", dec: 1 },
      ],
    },
  ],
  passing: [
    {
      id: "passing", title: null, block: "passing", defaultSort: "avg_g",
      columns: [
        { key: "att", label: "ATT" }, { key: "cmp", label: "CMP" }, { key: "int", label: "INT" },
        { key: "pct", label: "PCT", pct: true }, { key: "yds", label: "YDS" }, { key: "avg_a", label: "YDS/ATT", dec: 1 },
        { key: "td", label: "TD" }, { key: "long", label: "LONG" }, { key: "avg_g", label: "AVG/G", dec: 1 },
      ],
    },
  ],
  returns: [
    {
      id: "pr", title: "Punt Returns", block: "returns.pr", defaultSort: "avg",
      columns: [
        { key: "no", label: "NO" }, { key: "yds", label: "YDS" }, { key: "avg", label: "AVG", dec: 1 },
        { key: "td", label: "TD" }, { key: "long", label: "LONG" },
      ],
    },
    {
      id: "kr", title: "Kick Returns", block: "returns.kr", defaultSort: "avg",
      columns: [
        { key: "no", label: "NO" }, { key: "yds", label: "YDS" }, { key: "avg", label: "AVG", dec: 1 },
        { key: "td", label: "TD" }, { key: "long", label: "LONG" },
      ],
    },
  ],
  kicking: [
    {
      id: "punting", title: "Punting", block: "kicking.punting", defaultSort: "avg",
      columns: [
        { key: "no", label: "NO" }, { key: "yds", label: "YDS" }, { key: "avg", label: "AVG", dec: 1 },
        { key: "long", label: "LONG" }, { key: "tb", label: "TB" }, { key: "fc", label: "FC" },
        { key: "i20", label: "I20" }, { key: "blk", label: "BLK" },
      ],
    },
    {
      id: "fg", title: "Field Goals · PAT", block: "kicking.fg", defaultSort: "pct",
      columns: [
        { key: "fgm", label: "FGM" }, { key: "fga", label: "FGA" }, { key: "pct", label: "PCT", pct: true },
        { key: "long", label: "LONG" }, { key: "blk", label: "BLK" },
        { key: "pat_made", label: "PAT" }, { key: "pat_att", label: "PATA" },
      ],
    },
  ],
  defense: [
    {
      id: "defense", title: null, block: "defense", defaultSort: "tot",
      columns: [
        { key: "ua", label: "UA" }, { key: "a", label: "A" }, { key: "tot", label: "TOT" },
        { key: "tfl", label: "TFL" }, { key: "sacks", label: "SACKS", dec: 1 }, { key: "int", label: "INT" },
        { key: "brup", label: "BRUP" }, { key: "qbh", label: "QBH" }, { key: "fr", label: "FR" },
        { key: "ff", label: "FF" }, { key: "blk", label: "BLK" }, { key: "saf", label: "SAF" },
      ],
    },
  ],
  conversions: [
    {
      id: "third", title: "Third Downs", block: "conversions.third", defaultSort: "pct",
      columns: [
        { key: "att", label: "ATT" }, { key: "conv", label: "CONV" }, { key: "pct", label: "PCT", pct: true },
      ],
    },
    {
      id: "fourth", title: "Fourth Downs", block: "conversions.fourth", defaultSort: "pct",
      columns: [
        { key: "att", label: "ATT" }, { key: "conv", label: "CONV" }, { key: "pct", label: "PCT", pct: true },
      ],
    },
    {
      id: "red_zone", title: "Red Zone", block: "conversions.red_zone", defaultSort: "pct",
      columns: [
        { key: "att", label: "ATT" }, { key: "scores", label: "SCORES" }, { key: "td", label: "TD" },
        { key: "fg", label: "FG" }, { key: "pct", label: "PCT", pct: true },
      ],
    },
  ],
  misc: [
    {
      id: "misc", title: null, block: "misc", defaultSort: "first_downs",
      columns: [
        { key: "first_downs", label: "1ST" }, { key: "fd_rush", label: "RUSH" }, { key: "fd_pass", label: "PASS" },
        { key: "fd_pen", label: "PEN" }, { key: "fum", label: "FUM" }, { key: "fum_lost", label: "LOST" },
        { key: "pen", label: "PEN" }, { key: "pen_yds", label: "PEN YDS" }, { key: "top_avg", label: "TOP/G", clock: true },
      ],
    },
  ],
};

// ─── Player stats ───────────────────────────────────────────────────────────

export const PLAYER_STATS_SIDES = [
  { id: "offense", label: "Offense" },
  { id: "defense", label: "Defense" },
];

export const PLAYER_STATS_TABS = {
  offense: [
    { id: "rushing", label: "Rushing" },
    { id: "passing", label: "Passing" },
    { id: "receiving", label: "Receiving" },
    { id: "scoring", label: "Scoring" },
    { id: "returns", label: "Returns" },
    { id: "overall", label: "Overall" },
    { id: "punting", label: "Punting" },
    { id: "fgs", label: "FGs" },
  ],
  defense: [
    { id: "tackles", label: "Tackles" },
    { id: "tfl", label: "TFL · Sacks" },
    { id: "turnovers", label: "Turnovers" },
    { id: "pass_def", label: "Pass Def" },
  ],
};
export const DEFAULT_PLAYER_STATS_TAB = { offense: "rushing", defense: "tackles" };

export const playerTabIds = (side) => (PLAYER_STATS_TABS[side] ?? []).map((t) => t.id);

// `block` is the path on players[]; `defaultSort` builds the rank; `minKey`
// and `min` are the floor a row must clear to be listed (rule: no rate
// without a count, no leaderboard without a floor).
export const PLAYER_STATS_TABLES = {
  rushing: [
    {
      id: "rushing", title: null, block: "rushing", defaultSort: "avg_g", minKey: "att", min: 10,
      columns: [
        { key: "att", label: "ATT" }, { key: "yds", label: "YDS" }, { key: "avg", label: "AVG", dec: 1 },
        { key: "td", label: "TD" }, { key: "long", label: "LONG" }, { key: "avg_g", label: "AVG/G", dec: 1 },
      ],
    },
  ],
  passing: [
    {
      id: "passing", title: null, block: "passing", defaultSort: "avg_g", minKey: "att", min: 15,
      columns: [
        { key: "att", label: "ATT" }, { key: "cmp", label: "CMP" }, { key: "int", label: "INT" },
        { key: "pct", label: "PCT", pct: true }, { key: "yds", label: "YDS" }, { key: "td", label: "TD" },
        { key: "long", label: "LONG" }, { key: "effic", label: "EFFIC", dec: 1 }, { key: "avg_g", label: "AVG/G", dec: 1 },
      ],
    },
  ],
  receiving: [
    {
      id: "receiving", title: null, block: "receiving", defaultSort: "avg_g", minKey: "rec", min: 5,
      columns: [
        { key: "rec", label: "REC" }, { key: "yds", label: "YDS" }, { key: "td", label: "TD" },
        { key: "long", label: "LONG" }, { key: "avg_c", label: "AVG/C", dec: 1 }, { key: "rec_g", label: "REC/G", dec: 1 },
        { key: "avg_g", label: "AVG/G", dec: 1 },
      ],
    },
  ],
  scoring: [
    {
      id: "scoring", title: null, block: "scoring", defaultSort: "avg_g", minKey: "pts", min: 6,
      columns: [
        { key: "td", label: "TD" }, { key: "fg", label: "FG" }, { key: "pat", label: "PAT" },
        { key: "two_pt", label: "2XP" }, { key: "pts", label: "PTS" }, { key: "avg_g", label: "AVG/G", dec: 1 },
      ],
    },
  ],
  returns: [
    {
      id: "pr", title: "Punt Returns", block: "returns.pr", defaultSort: "avg", minKey: "no", min: 3,
      columns: [
        { key: "no", label: "NO" }, { key: "yds", label: "YDS" }, { key: "avg", label: "AVG", dec: 1 },
        { key: "td", label: "TD" }, { key: "long", label: "LONG" },
      ],
    },
    {
      id: "kr", title: "Kick Returns", block: "returns.kr", defaultSort: "avg", minKey: "no", min: 3,
      columns: [
        { key: "no", label: "NO" }, { key: "yds", label: "YDS" }, { key: "avg", label: "AVG", dec: 1 },
        { key: "td", label: "TD" }, { key: "long", label: "LONG" },
      ],
    },
  ],
  overall: [
    {
      id: "total_offense", title: "Total Offense", block: "total_offense", defaultSort: "yds_g", minKey: "plays", min: 15,
      columns: [
        { key: "rush", label: "RUSH" }, { key: "pass", label: "PASS" }, { key: "plays", label: "PLAYS" },
        { key: "total", label: "TOTAL" }, { key: "yds_g", label: "YDS/G", dec: 1 },
      ],
    },
    {
      id: "all_purpose", title: "All Purpose", block: "all_purpose", defaultSort: "yds_g", minKey: "yds", min: 50,
      columns: [
        { key: "rush", label: "RUSH" }, { key: "rcv", label: "RCV" }, { key: "pr", label: "PR" },
        { key: "kr", label: "KR" }, { key: "yds", label: "YDS" }, { key: "yds_g", label: "YDS/G", dec: 1 },
      ],
    },
  ],
  punting: [
    {
      id: "punting", title: null, block: "punting", defaultSort: "avg", minKey: "no", min: 5,
      columns: [
        { key: "no", label: "NO" }, { key: "yds", label: "YDS" }, { key: "avg", label: "AVG", dec: 1 },
        { key: "long", label: "LONG" }, { key: "tb", label: "TB" }, { key: "fc", label: "FC" },
        { key: "i20", label: "I20" }, { key: "fifty_plus", label: "50+" }, { key: "blk", label: "BLK" },
      ],
    },
  ],
  fgs: [
    {
      id: "fgs", title: null, block: "fgs", defaultSort: "fgm", minKey: "fga", min: 1,
      columns: [
        { key: "fgm", label: "FGM" }, { key: "fga", label: "FGA" }, { key: "pct", label: "PCT", pct: true },
        { key: "r0_19", label: "01-19", split: true }, { key: "r20_29", label: "20-29", split: true },
        { key: "r30_39", label: "30-39", split: true }, { key: "r40_49", label: "40-49", split: true },
        { key: "r50", label: "50+", split: true }, { key: "long", label: "LONG" }, { key: "blk", label: "BLK" },
      ],
    },
  ],
  tackles: [
    {
      id: "tackles", title: null, block: "defense", defaultSort: "tot", minKey: "tot", min: 5,
      columns: [
        { key: "ua", label: "SOLO" }, { key: "a", label: "AST" }, { key: "tot", label: "TOT" },
        { key: "tot_g", label: "TOT/G", dec: 1 }, { key: "tfl", label: "TFL" }, { key: "sacks", label: "SACKS", dec: 1 },
      ],
    },
  ],
  tfl: [
    {
      id: "tfl", title: "Tackles for Loss", block: "defense", defaultSort: "tfl", minKey: "tfl", min: 1,
      columns: [
        { key: "tfl", label: "TFL", dec: 1 }, { key: "tfl_yds", label: "YDS" }, { key: "tfl_g", label: "TFL/G", dec: 2 },
      ],
    },
    {
      id: "sacks", title: "Sacks", block: "defense", defaultSort: "sacks", minKey: "sacks", min: 0.5,
      columns: [
        { key: "sacks", label: "SACKS", dec: 1 }, { key: "sack_yds", label: "YDS" }, { key: "sacks_g", label: "SACKS/G", dec: 2 },
      ],
    },
  ],
  turnovers: [
    {
      id: "int", title: "Interceptions", block: "defense", defaultSort: "int", minKey: "int", min: 1,
      columns: [
        { key: "int", label: "INT" }, { key: "int_yds", label: "YDS" }, { key: "int_td", label: "TD" }, { key: "int_long", label: "LONG" },
      ],
    },
    {
      id: "fumbles", title: "Fumbles", block: "defense", defaultSort: "ff", minKey: "ff_fr", min: 1,
      columns: [
        { key: "ff", label: "FF" }, { key: "fr", label: "FR" }, { key: "fr_yds", label: "YDS" }, { key: "fr_td", label: "TD" },
      ],
    },
  ],
  pass_def: [
    {
      id: "pass_def", title: null, block: "defense", defaultSort: "pd", minKey: "pd", min: 1,
      columns: [
        { key: "brup", label: "BRUP" }, { key: "int", label: "INT" }, { key: "pd", label: "PD" },
        { key: "qbh", label: "QBH" }, { key: "blk", label: "BLK" },
      ],
    },
  ],
};
