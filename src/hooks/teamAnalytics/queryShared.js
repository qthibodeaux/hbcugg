import { FE_DOCS_BASE, fetchJson } from "../../utils/gameCenterPayloads";
import teamsData from "../../data/teams.json";
import { useQuery } from "@tanstack/react-query";

// Shared Team Analytics paths, identity join and cache-preserving query helpers.

export const TEAM_ANALYTICS_BASE = `${FE_DOCS_BASE}/stats/team-analytics`;

export const file = (name) => fetchJson(`${TEAM_ANALYTICS_BASE}/${name}`);

export const TEAM_BY_V5 = Object.fromEntries(teamsData.teams.map((t) => [String(t.exportId).replace(/25$/, ""), t]));

export const isOurs = (id) => Boolean(TEAM_BY_V5[id]);

export const identityOf = (id) => {
  const t = TEAM_BY_V5[id];
  return {
    id,
    name: t.name,
    short: t.shortName,
    nickname: t.nickname ?? null,
    conference: t.conference,
    division: t.division,
    logo: t.logo,
    primary: t.colors?.primary,
    secondary: t.colors?.secondary,
  };
};

export const SIDE = { offense: "o", defense: "d" };

export const useIndex = () =>
  useQuery({ queryKey: ["team-analytics-index"], queryFn: () => file("index.json"), staleTime: 5 * 60 * 1000, retry: false });

export const useSeasonFile = (name, season) =>
  useQuery({
    queryKey: ["team-analytics", name, String(season)],
    queryFn: () => file(`${name}_${season}.json`),
    enabled: season != null,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

export const byTeam = (data) => Object.fromEntries((data?.teams ?? []).filter((t) => isOurs(t.team_id)).map((t) => [t.team_id, t]));
