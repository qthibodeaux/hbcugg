import { fin, keyStats } from "./metricRows";

export const coachesFrom = (side, hub) => {
  if (side?.coaches) return side.coaches;
  const cc = hub?.coach_carousel ?? [];
  const role = (re) => cc.find((c) => re.test(c.role ?? ""))?.name ?? null;
  return {
    head_coach: cc.find((c) => c.role_group === "head_coach")?.name ?? null,
    offensive_coordinator: role(/offensive coordinator/i),
    defensive_coordinator: role(/defensive coordinator/i),
  };
};

export const leadersFrom = (raw, teamId, usageTeam, playersById) => {
  const top = raw?.top_players?.[teamId] ?? [];
  const usage = usageTeam?.players ?? [];
  // The preview's list once it carries eight; the season usage file until then.
  const source = top.length >= 8
    ? top.map((p) => ({ ...p, production_total: p.production_score, image_url: p.image_url ?? null }))
    : [...usage].filter((p) => p.production_total != null).sort((a, b) => b.production_total - a.production_total);
  return source.slice(0, 8).map((p) => ({
    person_id: p.person_id,
    name: p.name,
    last_name: p.last_name ?? String(p.name ?? "").split(/\s+/).slice(-1)[0],
    position: p.position,
    image_url: p.image_url ?? null,
    games: p.games_played ?? null,
    production: fin(p.production_total) ?? 0,
    per_game: fin(p.production_per_game) ?? 0,
    stats: keyStats(playersById[p.person_id], p.position),
  }));
};

export const qbFrom = (side, usageTeam, playersById, passMap) => {
  if (side?.quarterback) {
    const q = side.quarterback;
    return { ...q, air_yards: q.air_yards ?? null, pass_map: passMap ?? null };
  }
  const lead = usageTeam?.leaders?.passing?.[0];
  if (!lead) return null;
  const P = playersById[lead.person_id]?.passing ?? null;
  return {
    person_id: lead.person_id,
    name: lead.name,
    last_name: lead.last_name,
    image_url: lead.image_url ?? null,
    line: P ? { cmp: P.cmp, att: P.att, yds: P.yds, td: P.td, int: P.int, sacks: null } : null,
    air_yards: null,
    pass_map: passMap ?? null,
  };
};
