import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useGameCenterHubData } from "../../../../hooks/useGameCenterHubData";
import { useVenues } from "../../../../hooks/useVenues";
import { useFootballCurrentContext } from "../../../../hooks/useFootballCurrentContext";
import { v5, TEAM_BY_V5, abbr, INFO, matchupLabel, BRAND, itemOf, ANALYTICS_TABS } from "./menuPresentation";
import teamsData from "../../../../data/teams.json";
import { fetchTeamSchedule } from "../../../../hooks/useTeamScheduleData";
import { parsePreviewId, shortDate } from "../../../../utils/gamePreview";
import { Snapshot } from "./MenuPrimitives";
import { buildHeader } from "../../../game/export/exportData";
import { TEAMS_MOCK_TILE } from "../../../molecules/home/teamsTileMock";
import { MOCK_TILE } from "../../../molecules/home/statsTileMock";

export const usePageSnapshot = ({ pathname, isOpen, team }) => {
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const hub = useGameCenterHubData();
  const venues = useVenues();
  const { currentSeason, currentWeek } = useFootballCurrentContext();

  const teamV5 = team ? v5(teamsData.teams.find((t) => t.logo === team.logo) ?? {}) : null;
  const { data: schedule } = useQuery({
    queryKey: ["team-schedule", currentSeason, teamV5],
    queryFn: () => fetchTeamSchedule({ queryClient, season: currentSeason, teamId: teamV5 }),
    staleTime: Infinity,
    enabled: !!(isOpen && teamV5 && currentSeason),
  });

  const parts = pathname.split("/").filter(Boolean);
  const gotw = hub.featuredGames?.[0];
  const nextGame = (hub.featuredGames ?? []).find((g) => g.status !== "final") ?? null;

  // Game pages
  if (parts[0] === "game" && parts[1] === "preview" && parts[2]) {
    const ids = parsePreviewId(parts[2]);
    if (ids) {
      const a = TEAM_BY_V5[ids.awayId];
      const h = TEAM_BY_V5[ids.homeId];
      return <Snapshot logos={[a?.logo, h?.logo]} label={`${abbr(a)} at ${abbr(h)}`} line={`Preview · ${shortDate(ids.date)}`} big="VS" bigColor={INFO} />;
    }
  }
  if (parts[0] === "game" && parts[1]) {
    const game = queryClient.getQueryData(["game", parts[1]]);
    if (game) {
      const hd = buildHeader(game);
      const a = TEAM_BY_V5[hd.awayId];
      const h = TEAM_BY_V5[hd.homeId];
      const scored = hd.away.score != null && hd.home.score != null;
      return (
        <Snapshot
          logos={[a?.logo, h?.logo]}
          label={`${abbr(a)} at ${abbr(h)}`}
          line={[String(hd.status ?? "").toUpperCase(), hd.date ? shortDate(hd.date) : null, hd.site].filter(Boolean).join(" · ")}
          big={scored ? `${hd.away.score}–${hd.home.score}` : null}
        />
      );
    }
    return null;
  }

  // Team pages
  if (team) {
    const meta = teamsData.teams.find((t) => t.logo === team.logo);
    const rec = schedule?.team ?? null;
    const games = schedule?.games ?? [];
    const next = games.find((g) => g.status !== "final");
    const last = [...games].reverse().find((g) => g.status === "final");
    const vs = (g) => `${g.home_away === "away" ? "at" : "vs"} ${g.opponent_short ?? g.opponent_name ?? ""}`;
    const line = next ? `Next · ${vs(next)} · ${next.date_label ?? ""}` : last ? `Last · ${last.display_score ?? ""} ${vs(last)}` : meta?.mascot;
    return <Snapshot logos={[team.logo]} label={meta?.fullName ?? team.label} line={line} big={rec?.record ?? null} />;
  }

  // Game Center sections
  if (parts[0] === "game-center") {
    const page = parts[1] ?? "";
    if (page === "standings") {
      const leaders = ["swacEast", "swacWest", "meac"].map((k) => hub.standings?.[k]?.rows?.[0]).filter(Boolean);
      return <Snapshot logos={leaders.map((r) => r.team?.logo)} label="Division leaders" line={leaders.map((r) => `${r.shortName} ${r.confRecord ?? "0-0"}`).join(" · ")} />;
    }
    if (page === "seasonschedule" || page === "team") {
      return nextGame ? <Snapshot logos={[nextGame.away?.logo, nextGame.home?.logo]} label={matchupLabel(nextGame)} line={`Next up · ${nextGame.dateLabel ?? ""}`} big={nextGame.dateLabel ?? null} bigColor={INFO} /> : null;
    }
    if (page === "classics-homecoming") {
      const ev = (hub.featuredGames ?? []).find((g) => g.status !== "final" && (g.eventName || g.event?.name)) ?? nextGame;
      return ev ? <Snapshot logos={[ev.away?.logo, ev.home?.logo]} label={ev.eventName ?? ev.event?.name ?? matchupLabel(ev)} line={`${matchupLabel(ev)} · ${ev.dateLabel ?? ""}`} /> : null;
    }
    // hub, games, week central, slates
    return (
      <Snapshot
        logos={gotw ? [gotw.away?.logo, gotw.home?.logo] : []}
        label={gotw ? matchupLabel(gotw) : "This week"}
        line={gotw ? "Game of the week" : null}
        big={currentWeek != null ? `WK ${currentWeek}` : null}
        bigColor={BRAND}
      />
    );
  }

  // Schools sections
  if (parts[0] === "schools" && parts[1] === "stadiums") {
    const v = (parts[2] && venues.byId?.[parts[2]]) || venues.stats?.largest;
    return v ? <Snapshot logos={[v.logo]} label={v.name} line={[v.location, v.isNeutral ? "Neutral site" : abbr(v.team)].filter(Boolean).join(" · ")} big={v.capacity ? Number(v.capacity).toLocaleString() : null} /> : null;
  }
  if (parts[0] === "rosters") {
    const dna = itemOf(TEAMS_MOCK_TILE, "roster_dna");
    const t = dna ? TEAM_BY_V5[dna.data.team_id] : null;
    return dna ? <Snapshot logos={[t?.logo]} label={`${abbr(t)} roster`} line={`${dna.data.total_players} players`} big={`${Math.round(dna.data.transfer_rate * 100)}%`} /> : null;
  }
  if (parts[0] === "schools" || parts[0] === "teams") {
    const swac = teamsData.teams.filter((t) => t.conference === "SWAC").length;
    return <Snapshot label="18 programs" line={`SWAC ${swac} · MEAC ${teamsData.teams.length - swac}`} big="18" />;
  }

  // Stats and analytics
  if (parts[0] === "team-analytics") {
    const tab = ANALYTICS_TABS.find((t) => t.id === params.get("tab")) ?? ANALYTICS_TABS[0];
    const item = tab.key ? itemOf(MOCK_TILE, tab.key) : null;
    const logos = (item?.teams ?? []).map((id) => TEAM_BY_V5[id]?.logo);
    return <Snapshot logos={logos} label={tab.label} line={item?.primary?.label ?? null} big={item?.primary?.display ?? null} bigColor={BRAND} />;
  }
  if (parts[0] === "stats" || parts[0] === "player-analytics") {
    const item = itemOf(MOCK_TILE, "metric_of_week");
    return item ? <Snapshot logos={[TEAM_BY_V5[item.teams?.[0]]?.logo]} label={item.data?.metric_label ?? item.title} line="Metric of the week" big={item.primary?.display ?? null} bigColor={BRAND} /> : null;
  }
  return null;
};
