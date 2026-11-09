import { getTeam } from "./routeConfig";

const STEM_CODES = {
  pvamu: "swacpvamu", jsu: "swacjsu", famu: "swacfamu", bcu: "swacbcu",
  aamu: "swacaamu", asu: "swacasu", alc: "swacalc", alcorn: "swacalc", mvsu: "swacmvsu",
  su: "swacsu", tsu: "swactsu", uapb: "swacuapb", gsu: "swacgsu", gram: "swacgsu", grambling: "swacgsu",
  dsu: "meacdsu", hu: "meachu", msu: "meacmsu", morg: "meacmsu", nccu: "meacnccu",
  nsu: "meacnsu", scsu: "meacscsu",
};

const sideFor = (id) => {
  const team = getTeam(id);
  return team ? { id, shortName: team.bannerShort ?? team.shortName, logo: team.logo, color: team.colors?.primary } : null;
};

export const resolveGameData = (gameId, isPreview = false) => {
  const raw = String(gameId || "");
  if (isPreview) {
    const m = /^(\d{4}-\d{2}-\d{2})_(.+?)_at_(.+)$/.exec(raw);
    if (!m) return null;
    const away = sideFor(m[2]);
    const home = sideFor(m[3]);
    return away && home ? { away, home, kind: "preview", date: m[1], key: raw } : null;
  }
  const clean = raw.toLowerCase().replace(/^w\d+/, "").replace(/\d+$/, "");
  for (let i = 1; i < clean.length; i += 1) {
    const awayId = STEM_CODES[clean.slice(0, i)];
    const homeId = STEM_CODES[clean.slice(i)];
    if (awayId && homeId) {
      const away = sideFor(awayId);
      const home = sideFor(homeId);
      if (away && home) return { away, home, kind: "game", key: raw };
    }
  }
  return null;
};

export const buildTeamHubTabs = (base, navigate, pathname) => [
  { id: "profile", label: "PROFILE", path: base, activePath: base, exact: true, indent: true, onClick: () => navigate(base) },
  { id: "schedule", label: "SCHEDULE", path: `${base}/schedule`, indent: true, onClick: () => navigate(`${base}/schedule`) },
  { id: "roster", label: "ROSTER PROFILE", path: `${base}/roster/hub`, activePath: `${base}/roster`, indent: true, onClick: () => navigate(`${base}/roster/hub`) },
  // Coaches pulled from the team sidebar for launch.0 (see AFTER_LAUNCH_0.md
  // §1) — the full roster takes its slot. Route stays wired in App.js.
  // Renamed 2026-10-03: Roster Hub → "Roster Profile", Full Roster → "Roster".
  { id: "roster-full", label: "ROSTER", path: `${base}/roster/full`, indent: true, onClick: () => navigate(`${base}/roster/full`) },
  { id: "wiki", label: "SCHOOL WIKI", path: `${base}/wiki`, activePath: pathname && pathname.includes("/wiki") ? pathname : `${base}/wiki`, indent: true, onClick: () => navigate(`${base}/wiki`) },
  // School Stats pulled for launch.0 (2026-10-04) — AFTER_LAUNCH_0.md §1.
  // Route stays wired in App.js.
];

export const injectList = (baseList, indexId, injection) => {
  const index = baseList.findIndex(item => item.id === indexId);
  if (index === -1) return [...baseList, ...injection];
  const newList = [...baseList];
  newList.splice(index + 1, 0, ...injection);
  return newList;
};

export const buildTeamSwitchPath = (pathname, currentTeamId, nextTeamId) => {
  if (pathname.includes("/wiki") && pathname.startsWith("/schools/")) {
    return `/schools/${nextTeamId}/wiki`;
  }
  const prefix = `/teams/${currentTeamId}`;
  if (!pathname.startsWith(prefix)) return `/teams/${nextTeamId}`;
  const suffix = pathname.slice(prefix.length);
  return `/teams/${nextTeamId}${suffix || ""}`;
};
