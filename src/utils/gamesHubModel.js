import { isContractRow, buildContractGame, dedupeGames, buildResolvedGame, normalizeTeamKey, getGameWeek } from "./gamesHub/gameAdapters";

export const getMatchup = (game) => {
  if (!game) return null;
  const home = game.homeTeam ?? game.home ?? {};
  const away = game.awayTeam ?? game.away ?? {};
  return {
    game,
    isFinal: Boolean(game.isFinal),
    dateLabel: game.dateLabel,
    away: { ...away, label: away.shortName ?? away.name ?? "AWAY" },
    home: { ...home, label: home.shortName ?? home.name ?? "HOME" },
    awayScore: game.awayScore,
    homeScore: game.homeScore,
    winner: game.winnerLabel,
    margin: game.margin,
    linkTo: game.route,
  };
};

export const buildGamesHubModel = ({
  seasonData,
  weekFilter = "all",
  teamFilter = "",
  conferenceFilter = "all",
  statusFilter = "all",
}) => {
  // `games[]` (the contract) when the file ships it; the older `story_cards`
  // shape only for seasons published before the 2026-10-04 contract.
  const rawGames = seasonData?.games ?? seasonData?.story_cards ?? [];
  const contract = rawGames.length > 0 && isContractRow(rawGames[0]);
  const allGames = (contract ? rawGames.map(buildContractGame) : dedupeGames(rawGames).map(buildResolvedGame))
    .filter(Boolean)
    .filter((game) => {
      const matchesWeek = weekFilter === "all" || String(getGameWeek(game) ?? "") === String(weekFilter);
      const selectedTeamKey = normalizeTeamKey(teamFilter);
      const matchesTeam =
        !selectedTeamKey ||
        normalizeTeamKey(game.homeTeam?.teamId) === selectedTeamKey ||
        normalizeTeamKey(game.awayTeam?.teamId) === selectedTeamKey;
      const matchesConference =
        conferenceFilter === "all" ||
        game.homeTeam?.conference === conferenceFilter ||
        game.awayTeam?.conference === conferenceFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "played" && game.isFinal) ||
        (statusFilter === "upcoming" && !game.isFinal);
      return matchesWeek && matchesTeam && matchesConference && matchesStatus;
    })
    .sort((a, b) => {
      const dateDiff = new Date(a.date ?? "2100-01-01") - new Date(b.date ?? "2100-01-01");
      if (dateDiff !== 0) return dateDiff;
      return (getGameWeek(a) ?? 99) - (getGameWeek(b) ?? 99);
    });

  const groupedWeeks = Array.from(
    allGames.reduce((acc, game) => {
      const week = Number.isFinite(getGameWeek(game)) ? getGameWeek(game) : 0;
      if (!acc.has(week)) acc.set(week, []);
      acc.get(week).push(game);
      return acc;
    }, new Map()).entries(),
  )
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([week, games]) => ({
      week,
      label: `Week ${week}`,
      games,
    }));

  const availableWeeks = [...new Set(allGames.map((game) => getGameWeek(game)).filter((value) => Number.isFinite(value)))].sort((a, b) => a - b);

  return {
    filteredGames: allGames,
    groupedWeeks,
    availableWeeks,
    totalGames: allGames.length,
    completedGames: allGames.filter((game) => game.isFinal).length,
    upcomingGames: allGames.filter((game) => !game.isFinal).length,
  };
};

export { normalizeTeamKey, getGameWeek } from "./gamesHub/gameAdapters";

/** The two weeks the poster shows: the latest week with every game final, and the
 *  earliest week that still has a game to play. Either is null when there is none. */
export const pickWeeks = (games) => {
  const byWeek = new Map();
  (games ?? []).forEach((g) => {
    const w = getGameWeek(g);
    if (!Number.isFinite(w)) return;
    if (!byWeek.has(w)) byWeek.set(w, []);
    byWeek.get(w).push(g);
  });
  const weeks = [...byWeek.keys()].sort((a, b) => a - b);
  const last = [...weeks].reverse().find((w) => byWeek.get(w).every((g) => g.isFinal)) ?? null;
  const next = weeks.find((w) => byWeek.get(w).some((g) => !g.isFinal) && (last == null || w > last)) ?? null;
  return {
    last: last == null ? null : { week: last, games: byWeek.get(last) },
    next: next == null ? null : { week: next, games: byWeek.get(next) },
  };
};
