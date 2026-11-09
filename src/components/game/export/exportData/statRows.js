import { asNum, signed1, signed2, pct0, rate1, DASH, num } from "./valueFormat";
import { buildHeader } from "./headerModel";

// Game export offense/counting/advanced row definitions and league-context adaptation.

export const leagueEntry = (leagueAvg, path) => {
  const e = leagueAvg?.keys?.[path];
  if (!e || typeof e.avg !== "number") return null;
  return { avg: e.avg, min: asNum(e.min), max: asNum(e.max) };
};

const basicsMetric = (game, key) => {
  const blocks = game?.advanced_basics?.blocks ?? [];
  for (const b of blocks) {
    const m = (b.metrics ?? []).find((x) => x.key === key);
    if (m) return m;
  }
  return null;
};

export const OFFENSE_ROWS = [
  { key: "epaTotal", fallbackMax: 10, label: "Total EPA", fmt: signed1, path: "advanced_team.epa_total", read: (g, t) => asNum(g?.advanced_team?.[t]?.epa_total) },
  { key: "epaPlay", fallbackMax: 0.5, label: "EPA / Play", fmt: signed2, path: "advanced_team.epa_per_play", read: (g, t) => asNum(g?.advanced_team?.[t]?.epa_per_play) },
  { key: "sr", fallbackMax: 0.6, label: "Success Rate", fmt: pct0, path: "advanced_team.success_rate", read: (g, t) => asNum(g?.advanced_team?.[t]?.success_rate) },
  // Per the backend (2026-09-16): these two live under `game_export.regulation` (regulation only),
  // and the league file will carry them by that same path at the next regen.
  { key: "ypp", fallbackMax: 8, label: "Yards / Play", fmt: rate1, path: "game_export.regulation.yards_per_play", read: (g, t) => asNum(g?.game_export?.regulation?.[t]?.yards_per_play) },
  { key: "passSr", fallbackMax: 0.6, label: "Pass SR%", fmt: pct0, path: "passing_splits.total.success_rate", read: (g, t) => asNum(g?.passing_splits?.[t]?.total?.success_rate) },
  { key: "rushSr", fallbackMax: 0.6, label: "Rush SR%", fmt: pct0, path: "rushing_splits.total.success_rate", read: (g, t) => asNum(g?.rushing_splits?.[t]?.total?.success_rate) },
  { key: "start", fallbackMax: 40, label: "Avg Drive Start", fmt: (v) => (v == null ? DASH : `Own ${Math.round(v)}`), path: "team_box.avg_start_field_position", read: (g, t) => asNum(g?.team_box?.[t]?.avg_start_field_position) },
  { key: "series", fallbackMax: 0.8, label: "Series Conversion", fmt: pct0, path: "series_summary.conversion_rate", read: (g, t) => asNum((g?.series_summary ?? g?.game_export?.series_summary)?.[t]?.conversion_rate) },
  {
    key: "third", fallbackMax: 0.6, label: "3rd Down Conversion", fmt: pct0, path: "team_box.third_down_conversion_rate",
    read: (g, t) => asNum(g?.team_box?.[t]?.third_down_conversion_rate),
    sub: (g, t) => { const b = g?.team_box?.[t] ?? {}; return b.third_down_attempts != null ? `${b.third_down_conversions ?? 0} / ${b.third_down_attempts}` : null; },
  },
  {
    key: "fourth", fallbackMax: 1, label: "4th Down Conversion", fmt: pct0, path: "team_box.fourth_down_go_conversion_rate",
    read: (g, t) => asNum(g?.team_box?.[t]?.fourth_down_go_conversion_rate),
    sub: (g, t) => { const b = g?.team_box?.[t] ?? {}; return b.fourth_down_goes != null ? `${b.fourth_down_go_conversions ?? 0} / ${b.fourth_down_goes}` : null; },
  },
  { key: "ypd", fallbackMax: 50, label: "Yards / Drive", fmt: rate1, path: "derived.yards_per_drive", read: (g, t) => { const m = basicsMetric(g, "derived.yards_per_drive"); return asNum(m?.[t === g?.home_team?.team_id ? "home" : "away"]); } },
  { key: "expl", fallbackMax: 0.25, label: "Explosive Play %", fmt: pct0, path: "advanced_team.explosive_rate_yardage", read: (g, t) => asNum(g?.advanced_team?.[t]?.explosive_rate_yardage) },
  { key: "rzEpa", fallbackMax: 1, label: "Red Zone EPA / Play", fmt: signed2, path: "game_export.regulation.red_zone.epa_per_play", read: (g, t) => asNum(g?.game_export?.regulation?.[t]?.red_zone?.epa_per_play) },
  { key: "to", fallbackMax: 4, label: "Turnovers", fmt: num, path: "team_box.turnovers_committed", read: (g, t) => asNum(g?.team_box?.[t]?.turnovers_committed), lowerIsBetter: true },
];

const mmss = (sec) => (sec == null ? DASH : `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, "0")}`);

const box = (g, t) => g?.team_box?.[t] ?? {};

export const COUNTING_ROWS = [
  { key: "totYds", fallbackMax: 600, label: "Total Yards", fmt: num, path: "team_box.total_yards", read: (g, t) => asNum(box(g, t).total_yards) },
  {
    key: "passYds", fallbackMax: 400, label: "Passing Yards", fmt: num, path: "team_box.pass_yards", read: (g, t) => asNum(box(g, t).pass_yards),
    sub: (g, t) => (box(g, t).pass_attempts != null ? `${box(g, t).pass_completions ?? 0} / ${box(g, t).pass_attempts}` : null),
  },
  {
    key: "rushYds", fallbackMax: 300, label: "Rushing Yards", fmt: num, path: "team_box.rush_yards", read: (g, t) => asNum(box(g, t).rush_yards),
    sub: (g, t) => (box(g, t).rush_attempts != null ? `${box(g, t).rush_attempts} car` : null),
  },
  OFFENSE_ROWS.find((r) => r.key === "ypp"),
  OFFENSE_ROWS.find((r) => r.key === "third"),
  OFFENSE_ROWS.find((r) => r.key === "fourth"),
  OFFENSE_ROWS.find((r) => r.key === "to"),
  {
    key: "pen", fallbackMax: 12, label: "Penalties", fmt: num, path: "penalty_profile.discipline_overview.accepted_count", lowerIsBetter: true,
    read: (g, t) => asNum(g?.penalty_profile?.[t]?.discipline_overview?.accepted_count),
    sub: (g, t) => { const y = g?.penalty_profile?.[t]?.discipline_overview?.accepted_yards; return y != null ? `${Math.round(y)} yds` : null; },
  },
  { key: "top", fallbackMax: 2400, label: "Time of Possession", fmt: mmss, path: "time_of_possession.seconds", read: (g, t) => asNum(g?.time_of_possession?.teams?.[t]?.seconds) },
  { key: "sacks", fallbackMax: 6, label: "Sacks Allowed", fmt: num, path: "team_box.sacks_allowed", read: (g, t) => asNum(box(g, t).sacks_allowed), lowerIsBetter: true },
];

const ADVANCED_KEYS = ["epaTotal", "epaPlay", "sr", "passSr", "rushSr", "series", "expl", "rzEpa", "ypd", "start"];

export const ADVANCED_ROWS = ADVANCED_KEYS.map((k) => OFFENSE_ROWS.find((r) => r.key === k));

const buildRows = (defs, game, leagueAvg) => {
  const h = buildHeader(game);
  return defs.map((row) => ({
    key: row.key,
    label: row.label,
    fmt: row.fmt,
    lowerIsBetter: !!row.lowerIsBetter,
    fallbackMax: row.fallbackMax ?? null,
    away: row.read(game, h.awayId),
    home: row.read(game, h.homeId),
    awaySub: row.sub ? row.sub(game, h.awayId) : null,
    homeSub: row.sub ? row.sub(game, h.homeId) : null,
    league: leagueEntry(leagueAvg, row.path),
  }));
};

export const buildOffenseRows = (game, leagueAvg) => buildRows(OFFENSE_ROWS, game, leagueAvg);

export const buildCountingRows = (game, leagueAvg) => buildRows(COUNTING_ROWS, game, leagueAvg);

export const buildAdvancedRows = (game, leagueAvg) => buildRows(ADVANCED_ROWS, game, leagueAvg);

export const buildEpaBreakdown = (game) => {
  const h = buildHeader(game);
  return [h.awayId, h.homeId].map((t) => ({
    id: t,
    dropback: asNum(game?.passing_splits?.[t]?.total?.epa_total),
    run: asNum(game?.rushing_splits?.[t]?.total?.epa_total),
    offense: asNum(game?.advanced_team?.[t]?.epa_total),
  }));
};
