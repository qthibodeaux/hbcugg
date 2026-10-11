import teamsData from "../data/teams.json";

export const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  const v5 = team.exportId.replace(/25$/, "");
  acc[v5] = team;
  acc[team.exportId] = team;
  return acc;
}, {});

export const normalizeTeamName = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/#\s*\d+/g, "")
    .replace(/\b(?:no|ranked)\.?\s*\d+/g, "")
    .replace(/&/g, " and ")
    .replace(/\buniv\b/g, "university")
    .replace(/[^a-z0-9]/g, "")
    .trim();

export const TEAM_NAME_ALIASES = {
  alabamaaandmuniversity: "swacaamu",
  alabamaamuniversity: "swacaamu",
  alabamastateuniversity: "swacasu",
  alcornstateuniversity: "swacalc",
  bethunecookmanuniversity: "swacbcu",
  floridaaandmuniversity: "swacfamu",
  floridaamuniversity: "swacfamu",
  gramblingstateuniversity: "swacgsu",
  jacksonstateuniversity: "swacjsu",
  mississippivalleystateuniversity: "swacmvsu",
  prairieviewaandmuniversity: "swacpvamu",
  prairieviewamuniversity: "swacpvamu",
  southernuniversity: "swacsu",
  texassouthernuniversity: "swactsu",
  universityofarkansaspinebluff: "swacuapb",
  arkansaspinebluff: "swacuapb",
  delawarestateuniversity: "meacdsu",
  howarduniversity: "meachu",
  morganstateuniversity: "meacmsu",
  northcarolinacentraluniversity: "meacnccu",
  norfolkstateuniversity: "meacnsu",
  southcarolinastateuniversity: "meacscsu",
};

// Name → team. bannerShort is a display label (Alcorn and Alabama State both
// show "ASU"), so it is not an alias; any alias two schools share (mascots
// like "Tigers") is dropped so it resolves to nothing, not the wrong team.
const nameAliases = (team) => [team.name, team.shortName, team.mascot, `${team.name} ${team.mascot}`].map(normalizeTeamName).filter(Boolean);
const SHARED_NAME_ALIASES = (() => {
  const seen = {};
  teamsData.teams.forEach((team) => new Set(nameAliases(team)).forEach((a) => { seen[a] = (seen[a] ?? 0) + 1; }));
  return new Set(Object.keys(seen).filter((a) => seen[a] > 1));
})();

export const TEAM_BY_NAME = teamsData.teams.reduce((acc, team) => {
  nameAliases(team)
    .filter((alias) => !SHARED_NAME_ALIASES.has(alias))
    .forEach((alias) => {
      acc[alias] = team;
    });
  return Object.entries(TEAM_NAME_ALIASES).reduce((aliases, [alias, teamId]) => {
    aliases[alias] = TEAM_BY_ID[teamId];
    return aliases;
  }, acc);
}, {});

export const GROUPS = {
  "swac-east": {
    id: "swac-east",
    label: "SWAC East",
    accent: "#F4811F",
    teams: ["swacaamu", "swacasu", "swacbcu", "swacfamu", "swacjsu", "swacmvsu"],
  },
  "swac-west": {
    id: "swac-west",
    label: "SWAC West",
    accent: "#FDB913",
    teams: ["swacalc", "swacgsu", "swacpvamu", "swacsu", "swactsu", "swacuapb"],
  },
  meac: {
    id: "meac",
    label: "MEAC",
    accent: "#0077C8",
    teams: ["meacdsu", "meachu", "meacmsu", "meacnccu", "meacnsu", "meacscsu"],
  },
};

export const logo = (team) => team?.logo ?? `/assets/${team?.exportId?.replace(/25$/, "")}.svg`;

export const label = (team) => team?.bannerShort ?? team?.shortName ?? team?.name ?? "TEAM";

export const scoreLabel = (game, hasScore) => {
  if (game.score && typeof game.score === "object") {
    return `${game.score.team ?? "-"}-${game.score.opponent ?? "-"}`;
  }
  if (game.score) return game.score;
  if (hasScore) return `${game.score_team} - ${game.score_opp}`;
  if (game.date_label) return game.date_label.toUpperCase();
  return game.date?.slice(5).replace("-", "/") ?? "TBD";
};

export const resolveOpponent = (game) => {
  const id = game?.opponent?.team_id ?? game?.opponent_id;
  if (id && TEAM_BY_ID[id]) return TEAM_BY_ID[id];
  const name = game?.opponent?.short_name ?? game?.opponent?.name ?? game?.opponent_name;
  return TEAM_BY_NAME[normalizeTeamName(name)] ?? null;
};

export const WEEK_WINDOWS = [
  { week: 1, label: "WK 1", start: "2025-08-25", end: "2025-08-31" },
  { week: 2, label: "WK 2", start: "2025-09-01", end: "2025-09-07" },
  { week: 3, label: "WK 3", start: "2025-09-08", end: "2025-09-14" },
  { week: 4, label: "WK 4", start: "2025-09-15", end: "2025-09-21" },
  { week: 5, label: "WK 5", start: "2025-09-22", end: "2025-09-28" },
  { week: 6, label: "WK 6", start: "2025-09-29", end: "2025-10-05" },
  { week: 7, label: "WK 7", start: "2025-10-06", end: "2025-10-12" },
  { week: 8, label: "WK 8", start: "2025-10-13", end: "2025-10-19" },
  { week: 9, label: "WK 9", start: "2025-10-20", end: "2025-10-26" },
  { week: 10, label: "WK 10", start: "2025-10-27", end: "2025-11-02" },
  { week: 11, label: "WK 11", start: "2025-11-03", end: "2025-11-09" },
  { week: 12, label: "WK 12", start: "2025-11-10", end: "2025-11-16" },
  { week: 13, label: "WK 13", start: "2025-11-17", end: "2025-11-23" },
  { week: 14, label: "WK 14", start: "2025-11-24", end: "2025-11-30" },
];

export const deriveWeek = (date) => {
  const current = new Date(`${date}T00:00:00`);
  const match = WEEK_WINDOWS.find((item) => current >= new Date(`${item.start}T00:00:00`) && current <= new Date(`${item.end}T23:59:59`));
  return match?.week ?? null;
};

// GROUPS keys are route-facing ("swac-east"); the payload keys its groups the
// backend's way ("swac_east").
const toPayloadGroupKey = (groupId) => String(groupId ?? "").replace(/-/g, "_");

export const buildScheduleModel = (payload, group, includeNonConference) => {
  // Shipped shape (93-FE Docs schedule_board_{season}.json): one file per
  // season, `groups.{swac_east|swac_west|meac}` each carrying the contract's
  // `division` / `teams` / `cells[]`, with `weeks[]` shared at the top level.
  // Cells are keyed [team_id][week] — indexing, no derivation. The filter is
  // `is_covered_matchup` per the contract; `conference_game` drives the NC
  // badge only. A bye is simply no cell.
  const payloadGroup = payload?.groups?.[toPayloadGroupKey(group?.id)];
  if (payloadGroup && Array.isArray(payloadGroup.cells)) {
    const teamIds = Array.isArray(payloadGroup.division?.team_ids) && payloadGroup.division.team_ids.length
      ? payloadGroup.division.team_ids
      : group.teams;
    const byTeamWeek = {};
    teamIds.forEach((teamId) => {
      byTeamWeek[teamId] = {};
    });
    payloadGroup.cells.forEach((cell) => {
      if (!byTeamWeek[cell.team_id]) return;
      if (!includeNonConference && cell.is_covered_matchup === false) return;
      byTeamWeek[cell.team_id][cell.week] = cell;
    });
    return {
      weeks: (payload.weeks ?? []).map((week) => ({ week: week.week, label: week.label ?? `WK ${week.week}`, dateRange: week.date_range ?? null })),
      byTeamWeek,
      teamIds,
      teams: payloadGroup.teams ?? [],
    };
  }

  if (payload?.weeks?.[0]?.cells) {
    const byTeamWeek = {};
    group.teams.forEach((teamId) => {
      byTeamWeek[teamId] = {};
    });
    payload.weeks.forEach((week) => {
      (week.cells ?? []).forEach((cell) => {
        if (!group.teams.includes(cell.team_id)) return;
        if (!includeNonConference && cell.game_type && !String(cell.game_type).includes("conference")) return;
        byTeamWeek[cell.team_id][week.week] = cell;
      });
    });
    return {
      weeks: payload.weeks.map((week) => ({ week: week.week, label: week.label ?? `WK ${week.week}` })),
      byTeamWeek,
    };
  }

  const games = payload?.games ?? payload ?? [];
  const groupTeams = new Set(group.teams);
  const dated = games.filter((game) => game.date && groupTeams.has(game.team_id));
  const weeks = WEEK_WINDOWS;
  const byTeamWeek = {};

  group.teams.forEach((teamId) => {
    byTeamWeek[teamId] = {};
  });

  dated.forEach((game) => {
    if (!includeNonConference && !game.conf_game) return;
    const week = Number(game.week) || deriveWeek(game.date);
    if (!week || week < 1 || week > 14) return;
    if (!byTeamWeek[game.team_id]) return;
    byTeamWeek[game.team_id][week] = game;
  });

  return { weeks, byTeamWeek };
};
