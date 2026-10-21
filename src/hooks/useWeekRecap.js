import { useQuery } from "@tanstack/react-query";
import { FE_DOCS_BASE, fetchJson } from "../utils/gameCenterPayloads";

// ─────────────────────────────────────────────────────────────────────────────
// "How Saturday Was Won" — the current week's recap (Week Recap Fetch Contract:
// game-center/week-recap/index.json → {season}/{week}.json). The backend picks,
// ranks and writes everything; this only loads it. (The two copy shims —
// U+FFFD apostrophes and "B-CU" / "J-State" — came out on 2026-10-18 when the
// backend fixed both at the source.)
// ─────────────────────────────────────────────────────────────────────────────

export const WEEK_RECAP_BASE = `${FE_DOCS_BASE}/game-center/week-recap`;

const fetchCurrentRecap = async () => {
  const index = await fetchJson(`${WEEK_RECAP_BASE}/index.json`);
  const cur = index?.current;
  if (!cur?.season || cur.week == null) return null;
  const doc = await fetchJson(`${WEEK_RECAP_BASE}/${cur.season}/${cur.week}.json`);
  return doc ?? null;
};

export const useWeekRecap = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["week-recap", "current"],
    queryFn: fetchCurrentRecap,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  return { recap: data ?? null, isLoading, isError };
};

export default useWeekRecap;
