import teamsData from "../../../../data/teams.json";
import { CalendarDays, BarChart3, School, Users, User } from "lucide-react";

// Home tile face-to-route links and duplicate-key ordering, preserving current destinations.

const TEAM_BY_V5 = teamsData.teams.reduce((acc, t) => {
  acc[t.exportId.replace(/25$/, "")] = t;
  return acc;
}, {});

export const HUB = {
  games: { href: "/game-center", cta: { label: "Game Center", icon: CalendarDays } },
  stats: { href: "/stats", cta: { label: "Stats", icon: BarChart3 } },
  teams: { href: "/teams", cta: { label: "Schools", icon: School } },
  players: { href: "/players", cta: { label: "Players", icon: Users } },
};

const schoolLink = (v5, suffix = "", tail = "") => {
  const t = TEAM_BY_V5[v5];
  return t ? { href: `/teams/${t.id}${suffix}`, cta: { label: `${t.name}${tail}`, icon: School } } : null;
};

export const gameLink = (g, final) => {
  const matchup = `${g.away?.shortName ?? "Away"} at ${g.home?.shortName ?? "Home"}`;
  const path = g.gamePathId ?? g.gameId ?? null;
  if (final && path) return { href: `/game/${path}`, cta: { label: `${matchup} · Final`, icon: CalendarDays } };
  if (!final && g.id) return { href: `/game/preview/${g.id}`, cta: { label: `${matchup} · Preview`, icon: CalendarDays } };
  return HUB.games;
};

export const statLink = (item) => {
  if (item.value_kind === "league" || item.key === "metric_of_week") return { href: "/team-analytics?tab=board", cta: { label: "Team Analytics · Board", icon: BarChart3 } };
  const v5 = item.teams?.[0];
  const t = TEAM_BY_V5[v5];
  return t ? { href: `/team-analytics?tab=profile&team=${v5}`, cta: { label: `${t.shortName} · Team Profile`, icon: BarChart3 } } : HUB.stats;
};

export const teamLink = (item) => {
  if (item.key === "division_race") return { href: "/game-center/standings", cta: { label: "Standings", icon: School } };
  if ((item.teams ?? []).length !== 1) return HUB.teams;
  if (item.key === "band") return schoolLink(item.teams[0], "/wiki", " · Wiki") ?? HUB.teams;
  return schoolLink(item.teams[0]) ?? HUB.teams;
};

const findName = (o, id) => {
  if (!o || typeof o !== "object") return null;
  if ((o.player_id === id || o.person_id === id) && o.name) return o.name;
  for (const v of Object.values(o)) {
    const hit = findName(v, id);
    if (hit) return hit;
  }
  return null;
};

export const playerLink = (item) => {
  const ids = item.players ?? [];
  if (item.key === "collage" || ids.length !== 1) return HUB.players;
  const name = findName(item.data, ids[0]);
  return { href: `/player/${ids[0]}`, cta: { label: name ?? "Player Page", icon: User } };
};

export const linksFor = (faces, items, toLink, hub) => {
  const used = {};
  return faces.map((f) => {
    const key = String(f?.key ?? "").replace(/-\d+$/, "");
    const nth = used[key] ?? 0;
    used[key] = nth + 1;
    const item = (items ?? []).filter((i) => i.key === key)[nth];
    return item ? toLink(item) ?? hub : hub;
  });
};
