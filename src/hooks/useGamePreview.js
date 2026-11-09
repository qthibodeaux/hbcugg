import { FE_DOCS_BASE, fetchJson, gameCenterPaths } from "../utils/gameCenterPayloads";
import { useMemo } from "react";
import { parsePreviewId } from "../utils/gamePreview";
import { useQuery } from "@tanstack/react-query";
import { toModel } from "./gamePreview/previewModel";

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
