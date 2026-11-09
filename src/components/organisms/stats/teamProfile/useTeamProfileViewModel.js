import { useMemo } from "react";
import { matchupTable } from "../../../../pages/analytics/matchupMetrics";
import { profileAdvancedFrom, passGridFrom, rushLanesFrom, havocZonesFrom, passTargetsFrom } from "../../../../pages/analytics/teamProfileMetrics";
import { useTeamAnalyticsSpatial, useTeamAnalyticsUsage } from "../../../../hooks/useTeamAnalyticsData";
import { useTopPlayersByTeam, useGamesIndex, usePlayerAnalytics } from "../../../../hooks/useSWACData";
import { teamSlug, nameSlug } from "../../../../utils/headshots";
import { surnameOf, initialsOf } from "./profilePresentation";

export const useTeamProfileViewModel = ({ hub, season, teamId, row }) => {
  const tape = useMemo(() => matchupTable(hub, season), [hub, season]);

  // The ten real base metrics, and each team's rank on both sides of them.
  const bases = useMemo(
    () => [...new Set((hub.units ?? []).filter((u) => u.available).flatMap((u) => u.metrics))],
    [hub.units],
  );
  const hubRanks = useMemo(() => {
    const map = {};
    bases.forEach((m) => {
      ["o", "d"].forEach((side) => {
        const field = `${side}_${m}`;
        const sorted = Object.values(hub.teams ?? {})
          .map((t) => ({ id: t.identity.id, p: t.seasons?.[season]?.percentiles?.[field] }))
          .filter((x) => Number.isFinite(x.p))
          .sort((a, b) => b.p - a.p);
        map[field] = Object.fromEntries(sorted.map((x, i) => [x.id, i + 1]));
      });
    });
    return map;
  }, [hub.teams, season, bases]);

  // The backend's advanced block and its ranks (1 = best), for this team.
  const advTable = useMemo(() => {
    const { values, ranks } = profileAdvancedFrom(row?.advanced);
    const total = Object.values(hub.teams ?? {}).filter((t) => t.seasons?.[season]?.advanced).length;
    return { values: { [teamId]: values }, ranks: Object.fromEntries(Object.entries(ranks).map(([k, r]) => [k, { [teamId]: r }])), total };
  }, [hub.teams, season, teamId, row?.advanced]);

  // Spatial maps — null for a side/season the feed couldn't place.
  const spatial = useTeamAnalyticsSpatial(season);
  const usage = useTeamAnalyticsUsage(season);
  const teamSpatial = spatial.teams[teamId] ?? null;

  const { byTeamId, photoByKey } = useTopPlayersByTeam();
  const { games } = useGamesIndex();
  const { teamAnalytics } = usePlayerAnalytics();

  // Everyone with production this season, from player_usage_{season}.json.
  const teamUsage = usage.teams[teamId] ?? null;
  const roster = useMemo(
    () =>
      (teamUsage?.players ?? [])
        .filter((p) => Number.isFinite(p.production_total))
        .map((p) => ({
          player_key: p.player_key ?? p.person_id,
          person_id: p.person_id,
          name_display: p.name,
          position: p.position,
          image_url: p.image_url ?? null,
          par: p.production_total,
          games_played: p.games_played,
          usage: p.usage ?? null,
          games: (p.game_log ?? []).map((g) => ({ game_id: g.schedule_game_id, total: g.production })),
        }))
        .sort((a, b) => b.par - a.par),
    [teamUsage],
  );
  const photoBy = useMemo(() => {
    const map = {};
    (byTeamId?.[teamId] ?? []).forEach((p) => { if (p.person_id) map[p.person_id] = p.image_url; });
    return map;
  }, [byTeamId, teamId]);

  // ── Faces ──────────────────────────────────────────────────────────────
  // Every face is a real player the backend named: the pass grid's top three
  // per cell, the leader rails' top three per list. Photo: the backend's
  // image_url first, then the headshot index.
  const facePhoto = (p) =>
    p.image_url ??
    photoByKey?.[p.person_id] ??
    photoByKey?.[`${teamSlug(teamId)}:${nameSlug(p.name)}`] ??
    null;

  const faceOf = (p, title) => ({
    id: p.person_id ?? p.player_key ?? p.name,
    name: p.name ?? "",
    surname: p.last_name ?? surnameOf(p.name),
    initials: initialsOf(p.name),
    position: p.position ?? "",
    photo: facePhoto(p),
    title: title ?? p.name,
  });

  const maps = useMemo(
    () => ({
      passOff: passGridFrom(teamSpatial?.offense),
      passDef: passGridFrom(teamSpatial?.defense),
      rushOff: rushLanesFrom(teamSpatial?.offense),
      rushDef: rushLanesFrom(teamSpatial?.defense),
      havoc: havocZonesFrom(teamSpatial?.defense),
      targetsOff: passTargetsFrom(teamSpatial?.offense, (p) => faceOf(p)),
      targetsDef: passTargetsFrom(teamSpatial?.defense, (p) => faceOf(p)),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [teamSpatial, photoByKey, teamId],
  );

  // Leader rails — the backend's top three per list, with its counting line.
  const leadersOf = (key) =>
    (teamUsage?.leaders?.[key] ?? []).map((l) => faceOf(l, [l.name, l.value_display && `${l.value_display} ${String(l.value_label ?? "").toLowerCase()}`, l.line].filter(Boolean).join(" · ")));
  const passingLeaders = { offense: leadersOf("passing"), defense: leadersOf("pass_defense") };
  // The lane rollup names no players, so the lanes carry no faces; the rail does.
  const rushingLeaders = {
    offense: { left: [], middle: [], right: [], rail: leadersOf("rushing") },
    defense: { left: [], middle: [], right: [], rail: leadersOf("run_defense") },
  };

  const schedule = useMemo(
    () =>
      (games ?? [])
        .filter((g) => String(g.season) === String(season) && (g.home_team_id === teamId || g.away_team_id === teamId))
        .sort((a, b) => String(a.date).localeCompare(String(b.date))),
    [games, season, teamId],
  );

  
  return { tape, bases, hubRanks, advTable, teamAnalytics, teamUsage, roster, photoBy, maps, passingLeaders, rushingLeaders, schedule };
};
