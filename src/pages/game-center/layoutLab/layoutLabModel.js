import teamsData from "../../../data/teams.json";

// Pure adapter for the historical Game Center layout experiment.
// Retains its original illustrative MVP, quarter-score and quick-card placeholders; not a live analytics feed.

const RAIL_GAME_COUNT = 6;

const getWeekFromStem = (stem) => {
  const match = String(stem ?? "").match(/^W(\d+)/i);
  return match ? Number(match[1]) : null;
};

const getStageLabelFromWeek = (week) => {
  if (week === 15) return "Celebration Bowl";
  if (week === 14) return "SWAC Championship Game";
  if (Number.isFinite(week) && week > 0) return `Week ${week}`;
  return "Week --";
};

export const getTeamTicker = (team) =>
  String(team?.shortName ?? team?.name ?? "TEAM")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4) || "TEAM";

const normalizeName = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/#/g, "")
    .replace(/&/g, " and ")
    .replace(/university|college|state\.?/g, " ")
    .replace(/[^a-z0-9]/g, "")
    .trim();

const TEAM_BY_EXPORT = teamsData.teams.reduce((acc, team) => {
  const enriched = {
    ...team,
    primary: team?.colors?.primary,
    secondary: team?.colors?.secondary,
  };
  acc[team.exportId] = enriched;
  acc[team.exportId.replace(/25$/, "")] = enriched;
  return acc;
}, {});

const TEAM_BY_NAME = teamsData.teams.reduce((acc, team) => {
  const enriched = {
    ...team,
    primary: team?.colors?.primary,
    secondary: team?.colors?.secondary,
  };
  [team.name, team.shortName, team.mascot, `${team.name} ${team.mascot}`]
    .map(normalizeName)
    .filter(Boolean)
    .forEach((alias) => {
      acc[alias] = enriched;
    });
  return acc;
}, {});

export const buildLayoutLabModel = (games) => {
    const parsed = [...games].sort((a, b) => String(a.date ?? "").localeCompare(String(b.date ?? "")));

    const completed = [...parsed.filter((game) => game.result)].reverse();
    const upcoming = parsed.filter((game) => !game.result);

    const celebrationBowl = completed.find((game) => getWeekFromStem(game.parsed_game_stem) === 15) ?? null;
    const swacChampionship = completed.find((game) => getWeekFromStem(game.parsed_game_stem) === 14) ?? null;
    const prioritized = [celebrationBowl, swacChampionship].filter(Boolean);
    const usedGameIndexes = new Set(prioritized.map((game) => game.game_index));
    const latestTwo = completed.filter((game) => !usedGameIndexes.has(game.game_index)).slice(0, 2);

    const featured = [...prioritized, ...latestTwo].slice(0, 4).map((game, index) => {
      const week = getWeekFromStem(game.parsed_game_stem);
      return {
        id: `featured-${index}`,
        variant: "broadcast",
        home: TEAM_BY_EXPORT[game.team_id] ?? {
          shortName: game.team_id,
          name: game.team_id,
          primary: "#1A1A1D",
        },
        away: TEAM_BY_NAME[normalizeName(game.opponent_name)] ?? {
          shortName: game.opponent_name,
          name: game.opponent_name,
          primary: "#27272A",
        },
        homeScore: Number(game.score_team ?? 0),
        awayScore: Number(game.score_opp ?? 0),
        stageLabel: getStageLabelFromWeek(week),
        dateLabel: game.date ?? "TBD",
        mvp: index === 0 ? "QB 312 total yds" : index === 1 ? "RB 148 rush yds" : "Captain 11 tackles",
      };
    });

    const recordByTeamId = parsed.reduce((acc, game) => {
      const teamId = String(game.team_id ?? "");
      if (!teamId || !game.result) return acc;
      if (!acc[teamId]) acc[teamId] = { w: 0, l: 0 };
      if (game.result === "W") acc[teamId].w += 1;
      if (game.result === "L") acc[teamId].l += 1;
      return acc;
    }, {});

    const resultCards = completed.slice(0, RAIL_GAME_COUNT).map((game, index) => {
      const week = getWeekFromStem(game.parsed_game_stem) ?? game.game_index;
      const awayTeam =
        (game.opponent_id ? TEAM_BY_EXPORT[game.opponent_id] : null) ??
        TEAM_BY_NAME[normalizeName(game.opponent_name)] ??
        { shortName: game.opponent_name, name: game.opponent_name, primary: "#27272A" };
      const awayKey = String(game.opponent_id ?? awayTeam?.exportId?.replace(/25$/, "") ?? "");

      return {
        id: `rail-result-${index}`,
        mode: "result",
        gameId: game.parsed_game_stem ?? game.parsed_game_id ?? null,
        home: {
          ...(TEAM_BY_EXPORT[game.team_id] ?? null),
          record: recordByTeamId[game.team_id] ? `${recordByTeamId[game.team_id].w}-${recordByTeamId[game.team_id].l}` : "--",
        },
        away: {
          ...awayTeam,
          record: recordByTeamId[awayKey] ? `${recordByTeamId[awayKey].w}-${recordByTeamId[awayKey].l}` : "--",
        },
        homeScore: Number(game.score_team ?? 0),
        awayScore: Number(game.score_opp ?? 0),
        homeByQ: [7, 3, 10, 7],
        awayByQ: [3, 7, 7, 6],
        stageLabel: getStageLabelFromWeek(week),
        gameName: week === 15 ? "Celebration Bowl" : week === 14 ? "SWAC Championship Game" : "Conference Matchup",
        location: "Neutral Site",
      };
    });

    const teamMetaById = teamsData.teams.reduce((acc, team) => {
      acc[team.exportId.replace(/25$/, "")] = team;
      return acc;
    }, {});

    const teamRows = Object.entries(recordByTeamId)
      .map(([teamId, rec]) => ({
        teamId,
        shortName: TEAM_BY_EXPORT[teamId]?.shortName ?? teamMetaById[teamId]?.shortName ?? teamId,
        conference: teamMetaById[teamId]?.conference,
        division: teamMetaById[teamId]?.division,
        wins: rec.w,
        losses: rec.l,
        record: `${rec.w}-${rec.l}`,
      }))
      .sort((a, b) => b.wins - a.wins || a.losses - b.losses);

    const topBy = (conference, division = null) =>
      teamRows
        .filter((row) => row.conference === conference)
        .filter((row) => (division ? row.division === division : true))
        .slice(0, 3);

    const upcomingForTeam = (teamId) =>
      parsed
        .filter((game) => game.team_id === teamId && !game.result)
        .slice(0, 3)
        .map((game) => game.opponent_name ?? "TBD");

    const recentForTeam = (teamId) =>
      parsed
        .filter((game) => game.team_id === teamId && !!game.result)
        .slice(-5)
        .reverse();

    const jsuRecent = recentForTeam("swacjsu");
    const jsuHomeRecent = jsuRecent.filter((g) => g.home_away === "home").slice(0, 3);
    const jsuRoadRecent = jsuRecent.filter((g) => g.home_away === "away").slice(0, 3);

    const quick = {
      swacWestTop3: topBy("SWAC", "West"),
      swacEastTop3: topBy("SWAC", "East"),
      meacTop3: topBy("MEAC"),
      gameOfWeek: {
        awayShort: getTeamTicker(TEAM_BY_NAME[normalizeName(upcoming[0]?.opponent_name)] ?? { shortName: upcoming[0]?.opponent_name }),
        homeShort: getTeamTicker(TEAM_BY_EXPORT[upcoming[0]?.team_id]),
        stageLabel: getStageLabelFromWeek(getWeekFromStem(upcoming[0]?.parsed_game_stem) ?? upcoming[0]?.game_index),
        dateLabel: upcoming[0]?.date ?? "TBD",
      },
      lookAhead: {
        awayShort: getTeamTicker(TEAM_BY_NAME[normalizeName(upcoming[1]?.opponent_name)] ?? { shortName: upcoming[1]?.opponent_name }),
        homeShort: getTeamTicker(TEAM_BY_EXPORT[upcoming[1]?.team_id]),
        stageLabel: getStageLabelFromWeek(getWeekFromStem(upcoming[1]?.parsed_game_stem) ?? upcoming[1]?.game_index),
        dateLabel: upcoming[1]?.date ?? "TBD",
      },
      upcomingStretch: {
        team: TEAM_BY_EXPORT.swacjsu?.shortName ?? "JSU",
        games: upcomingForTeam("swacjsu"),
        summary: "2 of next 3 are versus projected top Glory-5 opponents.",
      },
      teamForm: {
        team: TEAM_BY_EXPORT.swacjsu?.shortName ?? "JSU",
        results: jsuRecent.map((g) => ({
          result: g.result,
          margin: Number(g.score_team ?? 0) - Number(g.score_opp ?? 0),
        })),
      },
      homeHeroes: {
        team: TEAM_BY_EXPORT.swacjsu?.shortName ?? "JSU",
        record: `${jsuHomeRecent.filter((g) => g.result === "W").length}-${jsuHomeRecent.filter((g) => g.result === "L").length}`,
        detail: "Recent home stand with consistent closing drives in Q4.",
      },
      roadWorld: {
        team: TEAM_BY_EXPORT.swacjsu?.shortName ?? "JSU",
        record: `${jsuRoadRecent.filter((g) => g.result === "W").length}-${jsuRoadRecent.filter((g) => g.result === "L").length}`,
        detail: "Road slate resilience and win conversion outside home turf.",
      },
    };

    return {
      featuredGames: featured,
      scheduleRailCards: resultCards,
      quickCards: quick,
    };
  };
