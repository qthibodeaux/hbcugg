import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchJson, gameCenterPaths, toLocalTeam } from "../utils/gameCenterPayloads";

// The games the 18 programs played against each other, for one week.
//
// The schedule board is team-by-week: a game between two covered teams shows
// up as a cell for each side (and in two groups when the teams are in
// different ones), so cells are de-duplicated into games here. Non-covered
// opponents are dropped — the collage is only the 18.
//
// Early in a season there are too few finals for a collage (2026 has 1-3 per
// week so far). When the current season has no week with MIN_GAMES finals the
// collage falls back to the prior season's latest such week and says so via
// `fallback` (and `label` carries the season actually shown) — same idea as the hub's `prior_season_fallback`.

const MIN_GAMES = 4;

const coveredFinalsByWeek = (board) => {
  const seen = new Set();
  const byWeek = {};
  Object.values(board?.groups ?? {}).forEach((group) => {
    (group.cells ?? []).forEach((c) => {
      if (!c.is_covered_matchup || c.status !== "final") return;
      const key = `${c.week}|${[c.team_id, c.opponent_id].sort().join("|")}`;
      if (seen.has(key)) return;
      seen.add(key);
      const team = toLocalTeam(c.team_id);
      const opp = toLocalTeam(c.opponent_id);
      const teamIsHome = c.home_away !== "away";
      const side = (t, score) => ({ ...t, score });
      (byWeek[c.week] ??= []).push({
        id: c.game_id ?? key,
        gamePathId: c.game_path_id ?? null,
        home: teamIsHome ? side(team, c.score_team) : side(opp, c.score_opp),
        away: teamIsHome ? side(opp, c.score_opp) : side(team, c.score_team),
        winnerTeamId: c.winner_team_id ?? null,
      });
    });
  });
  return byWeek;
};

const latestFullWeek = (byWeek) => {
  const weeks = Object.keys(byWeek).map(Number).filter((w) => byWeek[w].length >= MIN_GAMES).sort((a, b) => b - a);
  return weeks.length ? weeks[0] : null;
};

const useBoard = (season, enabled) =>
  useQuery({
    queryKey: ["season-schedule-board", season],
    queryFn: () => fetchJson(gameCenterPaths.scheduleBoard(season)),
    staleTime: Infinity,
    retry: false,
    enabled,
  });

export const useHomeGamesCollage = (season) => {
  const current = useBoard(season, !!season);
  const currentWeeks = useMemo(() => coveredFinalsByWeek(current.data), [current.data]);
  const currentWeek = latestFullWeek(currentWeeks);

  const needFallback = !!season && !current.isLoading && currentWeek == null;
  const prior = useBoard(season - 1, needFallback);
  const priorWeeks = useMemo(() => coveredFinalsByWeek(prior.data), [prior.data]);
  const priorWeek = latestFullWeek(priorWeeks);

  const isLoading = current.isLoading || (needFallback && prior.isLoading);

  if (currentWeek != null) {
    return { games: currentWeeks[currentWeek], label: { season, week: currentWeek }, fallback: false, isLoading };
  }
  if (priorWeek != null) {
    return { games: priorWeeks[priorWeek], label: { season: season - 1, week: priorWeek }, fallback: true, isLoading };
  }
  return { games: [], label: null, fallback: false, isLoading };
};
