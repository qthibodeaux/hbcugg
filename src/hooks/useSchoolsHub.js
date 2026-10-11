import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FE_DOCS_BASE, fetchJson } from "../utils/gameCenterPayloads";
import teamsData from "../data/teams.json";

// Schools Hub — one weekly file (src/pages/teams/md/Schools Hub Fetch Contract.md),
// published at schools/schools-hub/current.json in the bundle. The backend picks
// every person, the standings order and the rankings; this only reshapes rows for
// the cards and joins school identity from teams.json.
export const SCHOOLS_HUB_PATH = `${FE_DOCS_BASE}/schools/schools-hub/current.json`;

const TEAM_BY_V5 = teamsData.teams.reduce((acc, t) => {
  acc[String(t.exportId).replace(/25$/, "")] = t;
  return acc;
}, {});

// Standings / rankings cards key rows by teams.json shortName.
const identity = (teamId) => {
  const t = TEAM_BY_V5[teamId];
  return { teamId, shortName: t?.shortName ?? String(teamId ?? "").toUpperCase(), name: t?.name ?? teamId };
};

const TREND = { up: "up", down: "down", flat: "flat" };

export const useSchoolsHub = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["schools-hub"],
    queryFn: () => fetchJson(SCHOOLS_HUB_PATH),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const model = useMemo(() => {
    if (!data) return null;
    const standingsRows = (rows) =>
      (rows ?? []).map((r) => ({ ...identity(r.team_id), record: r.record, conf: r.conf_record, trend: TREND[r.trend] ?? "flat", streak: r.streak ?? null }));
    const directoryById = Object.fromEntries((data.directory ?? []).map((d) => [d.team_id, d]));
    return {
      weekLabel: data.week_label ?? null,
      standings: {
        swacWest: standingsRows(data.standings?.swac_west),
        swacEast: standingsRows(data.standings?.swac_east),
        meac: standingsRows(data.standings?.meac),
      },
      rankings: (data.glory_rankings ?? []).map((r) => ({
        ...identity(r.team_id),
        rank: r.rank,
        glory: r.score_display,
        trend: r.trend === "flat" ? "hold" : r.trend,
        previousRank: r.previous_rank ?? null,
      })),
      // No team Glory rating exists yet — the backend names the metric it ranks on.
      rankingsLabel: data.glory_rankings_metric?.metric_label ?? "Team rating",
      topPlayersByTeamId: Object.fromEntries(Object.entries(directoryById).map(([id, d]) => [id, d.featured_players ?? []])),
      headCoachByTeamId: Object.fromEntries(Object.entries(directoryById).map(([id, d]) => [id, d.head_coach ?? null])),
      coaches: (data.coaches ?? []).map((c) => ({ ...identity(c.team_id), headCoach: c.head_coach ?? null, staffCount: c.staff_count ?? null })),
    };
  }, [data]);

  return { hub: model, isLoading, isError };
};

export default useSchoolsHub;
