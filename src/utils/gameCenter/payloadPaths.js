// Published and legacy transport paths, stage labels and existing JSON fetch contract.

export const FE_DOCS_BASE = "/data/93-FE Docs";

export const GAME_CENTER_EXPORT_BASE = "/data/1-game center/current_exports";

export const GAME_CENTER_RAW_BASE = "/data/1-game center";

export const gameCenterPaths = {
  // ── Migrated to the new tree — shape verified identical or purely additive ──
  hub: (season) => `${FE_DOCS_BASE}/game-center/hub/game_center_hub_${season}.json`,
  gamesHub: (season) => `${FE_DOCS_BASE}/game-center/games-hub/games_hub_${season}.json`,
  // Both drop a `teams` block the consumers never read (ConferenceSlateMatrix
  // uses bundled teams.json; useSeasonScheduleData reads only `weeks`).
  scheduleBoard: (season) => `${FE_DOCS_BASE}/game-center/season-schedule/schedule_board_${season}.json`,
  conferenceSlate: (season) => `${FE_DOCS_BASE}/game-center/conference-slate/conference_slate_${season}.json`,
  standingsRace: (season) => `${FE_DOCS_BASE}/game-center/standings/standings_race_${season}.json`,
  gamesIndex: () => `${FE_DOCS_BASE}/game-center/games/index.json`,
  gameFile: (season, gamePathId) => `${FE_DOCS_BASE}/game-center/games/${season}/${gamePathId}.json`,
  // The scoped per-team files the Team Schedules doc §3 was waiting on now
  // exist, so the scoped path is live. The wide fallback below is now cold.
  teamSchedule: (season, teamId) => `${FE_DOCS_BASE}/game-center/team-schedules/${season}/${teamId}.json`,

  // One file per week (Week Central Design Doc §3).
  weekCentral: (season, week) => `${FE_DOCS_BASE}/game-center/week-central/${season}/${week}.json`,

  // ── Still on the legacy tree ──
  // Wide fallback: all 18 teams. No equivalent in the new tree — it exists only
  // as the transport fallback in useTeamScheduleData, now that scoped files ship.
  teamSchedules: (season) => `${GAME_CENTER_EXPORT_BASE}/team_schedules/team_schedules_${season}.json`,
};

export const getWeekFromStem = (stem) => {
  const match = String(stem ?? "").match(/^W(\d+)/i);
  return match ? Number(match[1]) : null;
};

export const getStageLabelFromWeek = (week) => {
  if (week === 15) return "Celebration Bowl";
  if (week === 14) return "SWAC Championship Game";
  if (Number.isFinite(week) && week > 0) return `Week ${week}`;
  return "Week --";
};

export const fetchJson = async (path) => {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
};
