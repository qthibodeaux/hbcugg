import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FE_DOCS_BASE, fetchJson, gameCenterPaths } from "../utils/gameCenterPayloads";
import { parsePreviewId } from "../utils/gamePreview";

// One request per preview — the backend's purpose-built export, per
// src/pages/game-center/md/Game Preview Fetch Contract.md:
//
//   /data/93-FE Docs/game-center/game-preview/{season}/{game_id}.json
//
// The page reads it as sent: stats and ranks are the backend's, the series
// record and streak are the backend's, event history is the backend's. The only
// shaping here is renaming fields to what the banner and tables already read.

export const GAME_PREVIEW_BASE = `${FE_DOCS_BASE}/game-center/game-preview`;
export const gamePreviewPath = (season, gameId) => `${GAME_PREVIEW_BASE}/${season}/${gameId}.json`;

// The dev server answers a missing file with index.html (200), so a successful
// status is not proof of JSON — a non-JSON body counts as missing.
const fetchPreviewFile = async (season, gameId) => {
  const res = await fetch(gamePreviewPath(season, gameId));
  if (!res.ok) throw new Error("preview missing");
  const type = res.headers.get("content-type") ?? "";
  if (!type.includes("json")) throw new Error("preview missing");
  return res.json();
};

const placeLine = (v) => [v?.stadium_name, v?.city].filter(Boolean).join(" · ") || null;

const toModel = (p) => {
  const tbd = !!p.kickoff?.tbd || !p.kickoff?.at;

  // The matchup table's own shape: values[team][field], ranks[field][team].
  const values = {};
  const ranks = {};
  const gamesPlayed = {};
  Object.entries(p.stats?.teams ?? {}).forEach(([teamId, team]) => {
    gamesPlayed[teamId] = team.games_played ?? 0;
    values[teamId] = {};
    Object.entries(team.fields ?? {}).forEach(([field, cell]) => {
      values[teamId][field] = cell?.value ?? null;
      (ranks[field] ??= {})[teamId] = cell?.rank ?? null;
    });
  });

  const side = (s) => ({
    id: s.team_id,
    record: s.record_entering ?? null,
    confRecord: s.conference_record_entering ?? null,
    conference: s.conference ?? null,
  });

  return {
    // The file as sent — the scout section reads the addendum blocks from it.
    raw: p,
    gameId: p.game_id,
    season: p.season,
    status: p.status,
    playedGamePathId: p.played_game_path_id ?? null,
    date: p.date,
    weekLabel: p.week_label ?? null,
    kickoffAt: tbd ? null : new Date(p.kickoff.at),
    kickoffLabel: tbd ? "TBA" : p.kickoff.label ?? null,
    venue: p.venue ?? null,
    neutralSite: !!p.venue?.neutral_site,
    event: p.event ?? null,
    eventName: p.event?.name ?? null,
    flags: p.flags ?? {},
    away: side(p.away),
    home: side(p.home),

    // Stats — as sent, with the context the heading needs.
    statSeason: p.stats?.season ?? p.season,
    statBasis: p.stats?.basis ?? null,
    statThroughWeek: p.stats?.through_week ?? null,
    gamesPlayed,
    table: { values, ranks, total: p.stats?.ranked_teams ?? 0 },

    // Previous meetings — series record and streak are the backend's.
    series: p.meetings?.series ?? null,
    seriesFrom: p.meetings?.coverage_from_season ?? null,
    meetings: (p.meetings?.items ?? []).map((m) => ({
      key: m.game_id,
      stem: m.game_path_id ?? null,
      date: m.date,
      season: m.season,
      awayId: m.away_team_id,
      homeId: m.home_team_id,
      awayScore: m.away_score,
      homeScore: m.home_score,
      site: placeLine(m.venue),
    })),

    // Earlier editions of the named event.
    eventHistory: p.event_history
      ? {
          title: p.event_history.title,
          items: (p.event_history.items ?? []).map((e) => ({
            key: e.game_id ?? e.date,
            stem: e.game_path_id ?? null,
            date: e.date,
            season: e.season,
            name: e.name,
            away: { id: e.away?.team_id ?? null, name: e.away?.name ?? null },
            home: { id: e.home?.team_id ?? null, name: e.home?.name ?? null },
            awayScore: e.away_score,
            homeScore: e.home_score,
            resultStatus: e.result_status,
            site: placeLine(e.venue),
          })),
        }
      : null,
  };
};

export const useGamePreview = (gameId) => {
  const ids = useMemo(() => parsePreviewId(gameId), [gameId]);

  const file = useQuery({
    queryKey: ["game-preview", ids?.season, gameId],
    queryFn: () => fetchPreviewFile(ids.season, gameId),
    staleTime: Infinity,
    retry: false,
    enabled: !!ids,
  });

  // No preview file: the game may simply have been played since the link was
  // written. The games index knows; send the visitor to the played page.
  const needIndex = !!ids && file.isError;
  const index = useQuery({
    queryKey: ["games-index"],
    queryFn: () => fetchJson(gameCenterPaths.gamesIndex()),
    staleTime: Infinity,
    retry: false,
    enabled: needIndex,
  });

  const model = useMemo(() => (file.data ? toModel(file.data) : null), [file.data]);

  const playedStem = useMemo(() => {
    if (model?.playedGamePathId) return model.playedGamePathId;
    if (!ids || !needIndex) return null;
    const pair = [ids.awayId, ids.homeId].sort().join("|");
    const hit = (index.data ?? []).find((g) => g.date === ids.date && [g.away_team_id, g.home_team_id].sort().join("|") === pair);
    return hit?.game_stem ?? null;
  }, [model, ids, needIndex, index.data]);

  const isLoading = !!ids && (file.isLoading || (needIndex && index.isLoading));
  return { model, isLoading, playedStem, notFound: !isLoading && !model };
};
