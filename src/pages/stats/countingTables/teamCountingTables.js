// Team counting-stat tabs, table schemas, column order and default sorts.

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
