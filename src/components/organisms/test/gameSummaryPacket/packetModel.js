import teamsData from "../../../../data/teams.json";

const TEAM_META = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId] = team;
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

const getTeam = (id) => TEAM_META[id] ?? null;

export const getTeamLabel = (id) => getTeam(id)?.shortName ?? String(id ?? "TEAM").toUpperCase();

const getTeamName = (id) => getTeam(id)?.name ?? getTeamLabel(id);

export const getTeamColor = (id, fallback = "#E53E3E") => getTeam(id)?.colors?.primary ?? fallback;

export const fmt = (value, digits = 1) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return Number(value).toFixed(digits);
};

export const pct = (value) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return `${Math.round(Number(value) * 100)}%`;
};

export const signed = (value, digits = 0) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  const next = Number(value);
  return `${next > 0 ? "+" : ""}${next.toFixed(digits)}`;
};

export const cleanName = (name) => {
  if (!name) return "Unknown";
  const parts = String(name).split(",").map((part) => part.trim());
  return parts.length === 2 ? `${parts[1]} ${parts[0]}` : String(name);
};

export const readableResult = (result) => String(result ?? "Drive").replace(/([a-z])([A-Z])/g, "$1 $2");

export const yardsPerPlay = (box) => {
  const plays = Number(box?.plays_offense) || 0;
  return plays ? Number(box.total_yards ?? 0) / plays : null;
};

export const grade = (value, bands, higherIsBetter = true) => {
  if (value == null || Number.isNaN(Number(value))) return { label: "N/A", color: "#A1A1AA", note: "missing" };
  const v = Number(value);
  const ordered = higherIsBetter ? bands : [...bands].reverse();
  const hit = ordered.find((band) => (higherIsBetter ? v >= band.min : v <= band.max));
  return hit ?? { label: "C", color: "#A1A1AA", note: "average" };
};

export const rateGrade = (value) =>
  grade(value, [
    { min: 0.55, label: "A", color: "#48BB78", note: "elite" },
    { min: 0.45, label: "B", color: "#68D391", note: "strong" },
    { min: 0.35, label: "C", color: "#ECC94B", note: "solid" },
    { min: 0.25, label: "D", color: "#F6AD55", note: "thin" },
  ]);

export const epaGrade = (value) =>
  grade(value, [
    { min: 0.18, label: "A", color: "#48BB78", note: "elite" },
    { min: 0.08, label: "B", color: "#68D391", note: "strong" },
    { min: 0, label: "C", color: "#ECC94B", note: "neutral" },
    { min: -0.12, label: "D", color: "#F6AD55", note: "drag" },
  ]);

const deriveQuarterScores = (plays, awayId, homeId) => {
  const rows = [1, 2, 3, 4].map((quarter) => ({ quarter, away: 0, home: 0 }));
  (plays ?? []).forEach((play) => {
    if (!play?.scoring_event || !play?.scoring_points) return;
    const target = rows.find((row) => row.quarter === Number(play.quarter));
    if (!target) return;
    if (play.offense_team === awayId) target.away += Number(play.scoring_points) || 0;
    if (play.offense_team === homeId) target.home += Number(play.scoring_points) || 0;
  });
  return rows;
};

export const buildModel = (game) => {
  const meta = game?.metadata ?? {};
  // Handle both string IDs and object formats
  const awayId = typeof meta.away_team === 'string' ? meta.away_team : meta.away_team?.id;
  const homeId = typeof meta.home_team === 'string' ? meta.home_team : meta.home_team?.id;
  const plays = game?.play_by_play ?? [];
  const drives = game?.drive_summary ?? [];

  const scoring = plays
    .filter((play) => play.scoring_event)
    .map((play) => ({
      quarter: play.quarter,
      clock: play.clock,
      team: play.offense_team,
      type: play.scoring_type,
      points: play.scoring_points,
      awayScore: play.score_away_after,
      homeScore: play.score_home_after,
      text: play.raw_text,
    }));

  const keyPlays = plays
    .filter((play) => play.epa?.epa != null)
    .sort((a, b) => Math.abs(b.epa.epa) - Math.abs(a.epa.epa))
    .slice(0, 5);

  const productionLeaders = Object.fromEntries(
    Object.entries(game?.production_scores ?? {}).map(([teamId, players]) => [
      teamId,
      [...(players ?? [])].sort((a, b) => Number(b.production_total ?? 0) - Number(a.production_total ?? 0)).slice(0, 4),
    ]),
  );

  const teams = [awayId, homeId].filter(Boolean).map((teamId) => ({
    id: teamId,
    label: getTeamLabel(teamId),
    name: getTeamName(teamId),
    color: getTeamColor(teamId),
    score: teamId === awayId ? meta.away_team?.score : meta.home_team?.score,
    box: game?.team_box?.[teamId] ?? {},
    advanced: game?.advanced_team?.[teamId] ?? {},
    specialTeams: game?.special_teams_advanced?.[teamId] ?? {},
    penalties: game?.penalty_advanced?.[teamId] ?? {},
    sequence: game?.sequence_model?.[teamId] ?? {},
    defense: game?.defensive_identity?.[teamId] ?? {},
    pressure: game?.pressure_profile?.[teamId] ?? {},
    production: productionLeaders[teamId] ?? [],
  }));

  return {
    meta,
    awayId,
    homeId,
    teams,
    plays,
    drives,
    scoring,
    keyPlays,
    quarterScores: deriveQuarterScores(plays, awayId, homeId),
  };
};
