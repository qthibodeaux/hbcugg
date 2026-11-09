import { FE_DOCS_BASE } from "../../../../utils/gameCenterPayloads";
import { MOCK_TILE } from "../../../molecules/home/statsTileMock";
import { TEAMS_MOCK_TILE } from "../../../molecules/home/teamsTileMock";
import { PLAYERS_MOCK_TILE } from "../../../molecules/home/playersTileMock";

// Home tile JSON loaders and existing explicit mock fallbacks; cache policy stays with the hero.

const STATS_TILE_PATH = `${FE_DOCS_BASE}/home/stats-tile/current.json`;

export const fetchStatsTile = async () => {
  try {
    const res = await fetch(STATS_TILE_PATH);
    if (res.ok && (res.headers.get("content-type") ?? "").includes("json")) return await res.json();
  } catch {
    // fall through to the mock
  }
  return MOCK_TILE;
};

const TEAMS_TILE_PATH = `${FE_DOCS_BASE}/home/teams-tile/current.json`;

export const fetchTeamsTile = async () => {
  try {
    const res = await fetch(TEAMS_TILE_PATH);
    if (res.ok && (res.headers.get("content-type") ?? "").includes("json")) return await res.json();
  } catch {
    // fall through to the mock
  }
  return TEAMS_MOCK_TILE;
};

const PLAYERS_TILE_PATH = `${FE_DOCS_BASE}/home/players-tile/current.json`;

export const fetchPlayersTile = async () => {
  try {
    const res = await fetch(PLAYERS_TILE_PATH);
    if (res.ok && (res.headers.get("content-type") ?? "").includes("json")) return await res.json();
  } catch {
    // fall through to the mock
  }
  return PLAYERS_MOCK_TILE;
};
