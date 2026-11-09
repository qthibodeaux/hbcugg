import { useQueries, useQuery } from "@tanstack/react-query";
import { FE_DOCS_BASE, fetchJson } from "../utils/gameCenterPayloads";
import { PASS_DEFENSE_SEASON, passDefenseExtraSource } from "../utils/passDefenseConfig";

const ROOT = `${FE_DOCS_BASE}/stats/pass-defense/${PASS_DEFENSE_SEASON}`;
const EXTRA_PATHS = {
  advanced: "stats/team-analytics/advanced_2026.json",
  spatial: "stats/team-analytics/spatial_2026.json",
  receiving: "stats/production/receiving/2026.json",
  finishing: "stats/production/pass-defense/2026.json",
  counting: "stats/counting/player_2026.json",
};

const readSeason = async (url) => {
  const data = await fetchJson(url);
  if (Number(data.season) !== PASS_DEFENSE_SEASON) throw new Error("The published pass-defense source has a different season.");
  return data;
};

export const usePassDefenseData = (selection) => {
  const index = useQuery({ queryKey: ["pass-defense", 2026, "index"], queryFn: () => readSeason(`${ROOT}/index.json`), staleTime: Infinity });
  const definitions = useQuery({ queryKey: ["pass-defense", "definitions"], queryFn: () => fetchJson(`${FE_DOCS_BASE}/stats/pass-defense/definitions.json`), staleTime: Infinity });
  const metadata = useQuery({ queryKey: ["pass-defense", "team-metadata"], queryFn: () => fetchJson(`${FE_DOCS_BASE}/shared/teams.json`), staleTime: Infinity });
  const entries = index.data?.teams ?? [];
  const teams = useQueries({ queries: entries.map((entry) => ({
    queryKey: ["pass-defense", 2026, entry.team_id], staleTime: Infinity,
    queryFn: async () => {
      if (!/^[a-z0-9]+$/.test(entry.team_id) || entry.file !== `${entry.team_id}.json`) throw new Error("Invalid pass-defense team file in the published index.");
      const data = await readSeason(`${ROOT}/${entry.file}`);
      if (data.team_id !== entry.team_id) throw new Error("Pass-defense team identity does not match its index entry.");
      return data;
    },
  })) });
  const source = passDefenseExtraSource(selection);
  const extra = useQuery({
    queryKey: ["pass-defense-source", 2026, source],
    queryFn: () => readSeason(`${FE_DOCS_BASE}/${EXTRA_PATHS[source]}`),
    enabled: Boolean(source), staleTime: Infinity,
  });
  const required = [index, definitions, metadata, ...teams, ...(source ? [extra] : [])];
  return {
    data: { index: index.data, definitions: definitions.data, metadata: metadata.data, documents: teams.map((t) => t.data).filter(Boolean), [source]: extra.data },
    isLoading: required.some((q) => q.isPending),
    error: required.find((q) => q.error)?.error ?? null,
    retry: () => Promise.all(required.map((q) => q.refetch())),
  };
};
