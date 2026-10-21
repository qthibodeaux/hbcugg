import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "../utils/gameCenterPayloads";

// ─────────────────────────────────────────────────────────────────────────────
// Team Spotlight — the Team of the Week's full season profile (Schools > Team
// Spotlight). The backend builds it weekly (92-frontend/tools/
// build_team_spotlight.py) but hasn't published it to 93-FE Docs yet, so for
// now it's read from a copy in public/data/team-spotlight/ (index.json → the
// week's file). When the Team Spotlight Fetch Contract ships, point
// SPOTLIGHT_BASE at `${FE_DOCS_BASE}/schools/team-spotlight` and delete the copy.
// ─────────────────────────────────────────────────────────────────────────────

export const SPOTLIGHT_BASE = "/data/team-spotlight";

const fetchCurrent = async () => {
  const index = await fetchJson(`${SPOTLIGHT_BASE}/index.json`);
  const path = index?.current?.path;
  if (!path) return null;
  return (await fetchJson(`${SPOTLIGHT_BASE}/${path}`)) ?? null;
};

export const useTeamSpotlight = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["team-spotlight", "current"],
    queryFn: fetchCurrent,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  return { spotlight: data ?? null, isLoading, isError };
};
