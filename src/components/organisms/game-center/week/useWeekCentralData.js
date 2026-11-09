import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAllPlayersByYear, useLeagueAverages } from "../../../../hooks/useSWACData";
import { gameCenterPaths, fetchJson } from "../../../../utils/gameCenterPayloads";
import { buildWeekCentralModel } from "./weekCentralAdapter";

// Every season ships a week 1 file; it's the probe for a past season's
// `default_week` when the user hasn't picked a week yet.
const PROBE_WEEK = 1;

export const useWeekCentralData = ({
  season,
  currentSeason,
  currentWeek,
  activeWeek,
  includeNonConference,
  selectedId,
}) => {
  const isCurrentSeason = season === currentSeason;

  // Week resolution (Design Doc §3, §8): the user's pick wins; otherwise the
  // current season lands on the context file's week, and a past season lands
  // on that season's `default_week`, learned from a one-time probe fetch.
  const needsProbe = activeWeek == null && !isCurrentSeason;
  const { data: probe } = useQuery({
    queryKey: ["week-central", season, "probe"],
    queryFn: () => fetchJson(gameCenterPaths.weekCentral(season, PROBE_WEEK)),
    staleTime: Infinity,
    retry: false,
    enabled: needsProbe,
  });
  const resolvedWeek = activeWeek
    ?? (isCurrentSeason ? currentWeek : null)
    ?? (Number.isFinite(Number(probe?.default_week)) ? Number(probe.default_week) : null);

  // One request per committed week, keyed on both params so each visited
  // week caches independently and back/forward is instant.
  const { data, isLoading, isError } = useQuery({
    queryKey: ["week-central", season, resolvedWeek],
    queryFn: () => fetchJson(gameCenterPaths.weekCentral(season, resolvedWeek)),
    staleTime: Infinity,
    retry: false,
    enabled: resolvedWeek != null,
  });

  const model = useMemo(() => (
    buildWeekCentralModel({ data, includeNonConference })
  ), [data, includeNonConference]);

  const selected = useMemo(() => (
    model.slate.find((game) => game.id === selectedId) ?? model.slate[0] ?? null
  ), [model.slate, selectedId]);

  // Roster for the season — identity only (headshots, positions); no stat on
  // the brief comes from it. Same source the game page uses.
  const { players: playerSeasons } = useAllPlayersByYear(season);
  // Prior season too — a real headshot under the same person_id where the
  // current roster's URL is dead. Identity only, never a stat.
  const { players: priorPlayerSeasons } = useAllPlayersByYear(Number(season) - 1);
  // League avg / min / max per game-payload field for the season — the notch
  // and the fill scale on the brief's Team Stats block.
  const { data: leagueAvg } = useLeagueAverages(season);

  // The brief panel still reads the parsed game file for the selected game
  // (§5 says `brief` should ride along in the week payload — it doesn't yet;
  // see LAUNCH_0_BACKEND_NOTES.md). Only fetched when the backend says a
  // page exists for it.
  const selectedGameStem = selected?.gamePathId ?? null;
  const selectedHasParsedGame = !!selectedGameStem && selected?.hasGamePage === true;
  const { data: selectedParsedGame, isLoading: isSelectedParsedGameLoading } = useQuery({
    queryKey: ["week-central-brief-game", season, selectedGameStem],
    queryFn: () => fetchJson(gameCenterPaths.gameFile(season, selectedGameStem)),
    staleTime: Infinity,
    retry: false,
    enabled: selectedHasParsedGame,
  });

  return {
    model,
    selected,
    resolvedWeek,
    isLoading,
    isError,
    selectedParsedGame,
    isSelectedParsedGameLoading,
    playerSeasons,
    priorPlayerSeasons,
    leagueAvg,
  };
};
