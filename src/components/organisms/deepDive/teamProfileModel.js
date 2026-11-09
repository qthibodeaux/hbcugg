import PROFILE from "../../../data/teamProfilePvamu2026W8.json";
import { TEAM_BY_V5, ordinal } from "./deepDiveModel";

// ─────────────────────────────────────────────────────────────────────────────
// Team Profile (deep) — shared model. A three-page stat profile of one team's
// season from the backend (92-frontend/0-data/team-profile-deep/2026/{team}.json,
// first: PVAMU through Week 8). src/data/teamProfilePvamu2026W8.json is a local
// copy trimmed to the blocks the posters draw, until the backend publishes it.
//
// Every number is the file's own. Formatting only: rates to percents, EPA to
// signed decimals, ranks to ordinals.
// ─────────────────────────────────────────────────────────────────────────────

export { PROFILE };

export const TEAM = TEAM_BY_V5[PROFILE.team_id];

export const LABEL = {
  adj_epa_per_play: "Adjusted EPA / play",
  epa_per_play: "EPA / play",
  success_rate: "Success rate",
  explosive_rate: "Explosive plays",
  epa_per_pass: "EPA / dropback",
  epa_per_rush: "EPA / carry",
  success_rate_pass: "Pass success",
  success_rate_rush: "Rush success",
  standard_down_success: "Standard downs",
  passing_down_success: "Passing downs",
  third_fourth_success: "3rd & 4th down",
  points_per_opportunity: "Points / scoring chance",
  red_zone_td_rate: "Red-zone TDs",
  line_yards: "Line yards / carry",
  stuff_rate: "Runs stuffed",
  sack_rate: "Sack rate",
  havoc_rate: "Havoc",
  average_start: "Drive start",
  net_field_position: "Field-position margin",
  turnover_margin_per_game: "Turnover margin",
  open_field_yards: "Open-field yards",
  opportunity_rate: "4+ yard carries",
  power_success: "Short yardage",
  second_level_yards: "2nd-level yards",
};

const PCT = new Set([
  "success_rate", "explosive_rate", "success_rate_pass", "success_rate_rush", "standard_down_success",
  "passing_down_success", "third_fourth_success", "red_zone_td_rate", "stuff_rate", "sack_rate", "havoc_rate",
  "opportunity_rate", "power_success",
]);
const EPA = new Set(["adj_epa_per_play", "epa_per_play", "epa_per_pass", "epa_per_rush"]);

export const signed = (v, d = 2) => (v == null ? "—" : `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(Number(v)).toFixed(d)}`);
export const pct = (v) => (v == null ? "—" : `${Math.round(Number(v) * 100)}%`);
export const fix = (v, d = 1) => (v == null ? "—" : Number(v).toFixed(d));

export const fmtKey = (key, v) => {
  if (v == null) return "—";
  if (PCT.has(key)) return pct(v);
  if (EPA.has(key)) return signed(v, 3);
  if (key === "average_start") return `own ${Math.round(v)}`;
  if (key === "net_field_position") return signed(v, 1);
  if (key === "turnover_margin_per_game") return signed(v, 2);
  if (key === "penalties_per_game") return fix(v, 1);
  return fix(v, 2);
};

export const advOf = (side, key) => (PROFILE.team[side]?.advanced ?? []).find((a) => a.key === key) ?? null;

export const rankText = (r) => (r?.rank ? `${ordinal(r.rank)}` : "—");

/** League games only: the week-by-week rows that carry play-by-play rates. */
export const leagueGames = () => (PROFILE.team.week_by_week ?? []).filter((g) => g.offense?.epa_per_play != null);

/** A returner's row from the change block (risers or fallers), by person. */
export const changeOf = (personId) => {
  const r = PROFILE.players.change?.returners ?? {};
  return [...(r.risers ?? []), ...(r.fallers ?? [])].find((p) => p.person_id === personId) ?? null;
};

export const firstInitial = (full) => {
  const parts = String(full ?? "").trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0][0]}. ${parts.slice(1).join(" ")}` : full;
};
