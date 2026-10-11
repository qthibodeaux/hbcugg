import teamsData from "../../../data/teams.json";
import { productionEntries } from "../../../utils/gameHelpers";

// ═══════════════════════════════════════════════════════════════════════════════
// GAME EXPORT — data adapters
// ═══════════════════════════════════════════════════════════════════════════════
// Everything the four posters print, read off the game file and the league file
// per src/pages/game-center/md/Game Export Fetch Contract.md. Field reads only —
// nothing is computed here. A field the file doesn't carry comes back null and
// the poster prints a dash.

const TEAM_META = teamsData.teams.reduce((acc, t) => {
  acc[t.id] = t;
  acc[t.exportId] = t;
  acc[String(t.exportId).replace(/25$/, "")] = t;
  return acc;
}, {});

const isBlackish = (hex) => {
  const raw = String(hex ?? "").replace("#", "");
  if (raw.length !== 6) return false;
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  return (r + g + b) / 3 < 40;
};

/** "#5C068C" → "rgba(92,6,140,a)". Falls back to the input for non-hex colours. */
export const withAlpha = (hex, alpha) => {
  const raw = String(hex ?? "").replace("#", "");
  if (raw.length !== 6) return hex;
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

export const teamMeta = (id) => TEAM_META[String(id ?? "").replace(/25$/, "")] ?? null;
export const teamName = (id) => teamMeta(id)?.name ?? String(id ?? "").toUpperCase();
export const teamMascot = (id) => teamMeta(id)?.mascot ?? "";
export const teamShort = (id) => teamMeta(id)?.bannerShort ?? teamMeta(id)?.shortName ?? String(id ?? "").toUpperCase();
export const teamLogo = (id) => teamMeta(id)?.logo ?? `/assets/${String(id ?? "").replace(/25$/, "")}.svg`;
export const teamColor = (id) => teamMeta(id)?.colors?.primary ?? "#E53E3E";
export const teamAccent = (id) => {
  const c = teamMeta(id)?.colors ?? {};
  if (!c.primary) return "#E53E3E";
  return isBlackish(c.primary) && c.secondary ? c.secondary : c.primary;
};

// ─── Formatting ──────────────────────────────────────────────────────────────
export const DASH = "—";
export const num = (v) => (v == null ? DASH : String(v));
export const rate1 = (v) => (v == null ? DASH : Number(v).toFixed(1));
export const signed1 = (v) => (v == null ? DASH : `${v > 0 ? "+" : ""}${Number(v).toFixed(1)}`);
export const signed2 = (v) => (v == null ? DASH : `${v > 0 ? "+" : ""}${Number(v).toFixed(2)}`);
export const pct0 = (v) => (v == null ? DASH : `${Math.round(Number(v) * 100)}%`);
export const asNum = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);

/** "Kelly,Tyree" → "T.Kelly"; "Wiles-Khoehler,George" → "G.Wiles-Khoehler". */
export const shortName = (raw) => {
  const str = String(raw ?? "").trim();
  if (!str) return DASH;
  if (str.includes(",")) {
    const [last, first] = str.split(",");
    return `${(first ?? "").trim().charAt(0).toUpperCase()}.${(last ?? "").trim()}`;
  }
  const parts = str.split(/\s+/);
  if (parts.length < 2) return str;
  return `${parts[0].charAt(0).toUpperCase()}.${parts.slice(1).join(" ")}`;
};

// ─── Header ──────────────────────────────────────────────────────────────────
export const buildHeader = (game) => {
  const away = game?.away_team ?? {};
  const home = game?.home_team ?? {};
  const awayId = away.team_id ?? game?.metadata?.away_team?.id ?? null;
  const homeId = home.team_id ?? game?.metadata?.home_team?.id ?? null;
  const awayScore = asNum(away.score);
  const homeScore = asNum(home.score);
  const winnerId = game?.winner_team_id ?? (awayScore != null && homeScore != null ? (awayScore > homeScore ? awayId : homeScore > awayScore ? homeId : null) : null);
  const margin = awayScore != null && homeScore != null ? Math.abs(awayScore - homeScore) : null;
  return {
    awayId,
    homeId,
    away: { id: awayId, name: teamName(awayId), mascot: teamMascot(awayId), score: awayScore, record: away.record ?? null, confRecord: away.conference_record ?? null, conference: away.conference ?? null },
    home: { id: homeId, name: teamName(homeId), mascot: teamMascot(homeId), score: homeScore, record: home.record ?? null, confRecord: home.conference_record ?? null, conference: home.conference ?? null },
    winnerId,
    margin,
    status: game?.status ?? "final",
    date: game?.date ?? game?.metadata?.date ?? null,
    weekLabel: game?.week_label ?? (game?.week != null ? `Week ${game.week}` : null),
    site: game?.venue?.site ?? game?.metadata?.site ?? null,
    isOT: Array.isArray(game?.score_by_quarter?.labels) && game.score_by_quarter.labels.length > 4,
  };
};

// ─── League context ──────────────────────────────────────────────────────────
export const leagueEntry = (leagueAvg, path) => {
  const e = leagueAvg?.keys?.[path];
  if (!e || typeof e.avg !== "number") return null;
  return { avg: e.avg, min: asNum(e.min), max: asNum(e.max) };
};

// ─── Image 1 — Offensive breakdown ───────────────────────────────────────────
const basicsMetric = (game, key) => {
  const blocks = game?.advanced_basics?.blocks ?? [];
  for (const b of blocks) {
    const m = (b.metrics ?? []).find((x) => x.key === key);
    if (m) return m;
  }
  return null;
};

// `fallbackMax` is the bar's max when the league file has no entry for the row.
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

export const buildOffenseRows = (game, leagueAvg) => {
  const h = buildHeader(game);
  return OFFENSE_ROWS.map((row) => ({
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

// ─── Image 2 — Drives & situations ───────────────────────────────────────────
export const buildEpaBreakdown = (game) => {
  const h = buildHeader(game);
  return [h.awayId, h.homeId].map((t) => ({
    id: t,
    dropback: asNum(game?.passing_splits?.[t]?.total?.epa_total),
    run: asNum(game?.rushing_splits?.[t]?.total?.epa_total),
    offense: asNum(game?.advanced_team?.[t]?.epa_total),
  }));
};

/**
 * The file ships biggest plays split by period — `game_export.biggest_plays.{regulation,overtime}`,
 * each a top-3 positive / top-3 negative. The game's top 3 is the top 3 of the two lists
 * together (any play in the game's top 3 is in its period's top 3), so this is a pick, not
 * a computation. Overtime rows carry quarter 4 / 00:00 on the file; `period` tags them.
 */
export const buildBiggestPlays = (game) => {
  const src = game?.game_export?.biggest_plays ?? game?.biggest_plays ?? {};
  const periods = src.regulation || src.overtime ? [["REG", src.regulation], ["OT", src.overtime]] : [["REG", src]];
  const pick = (side, desc) => periods
    .flatMap(([period, block]) => (Array.isArray(block?.[side]) ? block[side].map((p) => ({ ...p, period })) : []))
    .filter((p) => typeof p.epa === "number")
    .sort((a, b) => (desc ? b.epa - a.epa : a.epa - b.epa))
    .slice(0, 3);
  return { positive: pick("positive", true), negative: pick("negative", false) };
};

// ─── Images 3 & 4 — Boxscore ─────────────────────────────────────────────────
const rowsOf = (v) => (Array.isArray(v) ? v : v && typeof v === "object" ? Object.values(v) : []);

const productionOf = (game, teamId) => {
  const map = new Map();
  productionEntries(game?.production_scores?.[teamId]).forEach((r) => {
    const entry = { total: r.production_total, components: r.components ?? {} };
    if (r.player_key != null) map.set(r.player_key, entry);
    if (r.name != null) map.set(r.name, entry);
  });
  return (key, name, component) => {
    const e = map.get(key) ?? map.get(name) ?? null;
    const v = e?.components?.[component];
    return typeof v === "number" ? v : null;
  };
};

export const buildBoxscore = (game, teamId) => {
  const ist = game?.individual_stats?.[teamId] ?? {};
  const prod = productionOf(game, teamId);

  const passers = rowsOf(ist.passing).filter((r) => r.name !== "TEAM").map((r) => ({
    key: r.player_key ?? r.name,
    name: r.name,
    completions: r.completions ?? null,
    attempts: r.attempts ?? null,
    yards: r.yards ?? null,
    touchdowns: r.touchdowns ?? null,
    interceptions: r.interceptions ?? null,
    sr: asNum(r.success_rate),
    epa: asNum(r.epa_total),
    epaPer: asNum(r.epa_per_play),
    production: prod(r.player_key, r.name, "passing_production"),
    grid: r.direction_breakdown ?? null,
  })).sort((a, b) => (b.attempts ?? 0) - (a.attempts ?? 0));

  const rushers = rowsOf(ist.rushing).filter((r) => r.name !== "TEAM").map((r) => ({
    key: r.player_key ?? r.name,
    name: r.name,
    attempts: r.attempts ?? null,
    yards: r.yards ?? null,
    ypc: asNum(r.yards_per_carry),
    sr: asNum(r.success_rate),
    epa: asNum(r.epa_total),
    epaPer: asNum(r.epa_per_play),
    lineYards: asNum(r.line_yards_per_carry),
    highlight: asNum(r.highlight_yards_per_opportunity),
    explosive: r.explosive_carries ?? null,
    production: prod(r.player_key, r.name, "rushing_production"),
  })).sort((a, b) => (b.production ?? -1e9) - (a.production ?? -1e9));

  const receivers = rowsOf(ist.receiving).filter((r) => r.name !== "TEAM").map((r) => ({
    key: r.player_key ?? r.name,
    name: r.name,
    targets: r.targets ?? null,
    receptions: r.receptions ?? null,
    yards: r.yards ?? null,
    ypr: asNum(r.yards_per_reception),
    explosive: r.explosive_receptions ?? null,
    sr: asNum(r.success_rate),
    epa: asNum(r.epa_total),
    epaPer: asNum(r.epa_per_target),
    production: prod(r.player_key, r.name, "receiving_production"),
  })).sort((a, b) => (b.production ?? -1e9) - (a.production ?? -1e9));

  const rushTotal = game?.rushing_splits?.[teamId]?.total ?? null;
  const passTotal = game?.passing_splits?.[teamId]?.total ?? null;

  return {
    passers,
    rushers,
    receivers,
    rushTeam: rushTotal ? {
      attempts: rushTotal.attempts ?? null, yards: rushTotal.yards ?? null, ypc: asNum(rushTotal.yards_per_carry),
      sr: asNum(rushTotal.success_rate), epa: asNum(rushTotal.epa_total), epaPer: asNum(rushTotal.epa_per_play),
      lineYards: asNum(rushTotal.line_yards_per_rush), highlight: asNum(rushTotal.highlight_yards_per_rush), explosive: asNum(rushTotal.explosive_carries),
    } : null,
    recvTeam: passTotal ? {
      targets: passTotal.attempts ?? null, receptions: passTotal.completions ?? null, yards: passTotal.yards ?? null,
      ypr: asNum(passTotal.yards_per_completion), explosive: asNum(passTotal.explosive_completions ?? passTotal.explosive_receptions),
      sr: asNum(passTotal.success_rate), epa: asNum(passTotal.epa_total), epaPer: asNum(passTotal.epa_per_target),
    } : null,
  };
};

/** The zone grid: rows deep → short, columns left → right, straight off `direction_breakdown`. */
export const ZONE_DEPTHS = [
  { key: "deep", label: "Deep", range: "13+" },
  { key: "medium", label: "Med", range: "4–12" },
  { key: "short", label: "Short", range: "< 4" },
];
export const ZONE_LANES = [
  { key: "left", label: "Left" },
  { key: "middle", label: "Middle" },
  { key: "right", label: "Right" },
];
export const zoneCell = (grid, depth, lane) => {
  const c = grid?.[depth]?.[lane];
  if (!c) return null;
  return { attempts: c.attempts ?? 0, completions: c.completions ?? 0, yards: c.yards ?? 0 };
};
