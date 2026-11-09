import { splitDisplayName, resolveImages } from "../headshots";
import { normTeamId } from "./teamIdentity";

// Extracted from GameSummaryTabV2; behavior and visual variants are preserved.

// ═══════════════════════════════════════════════════════════════════════════════
// SCORING PLAYS — `scoring_plays[]` off the game file
// ═══════════════════════════════════════════════════════════════════════════════
// One row per scoring play: `period`, `clock`, `team_id`, `points`, `play_type`,
// `scoring_type`, `description`, `play_id`, `drive_id`, `score_after`, `players[]`
// ({ role, player_id, name }) and a `drive` block ({ plays, yards,
// start/end_yardline_absolute, quarter_start, clock_start, possession_obtained_by,
// time_of_possession_seconds }).
//
// PATs and two-point tries ship as their own rows. The card reads score-by-score, so a try
// that follows its touchdown (same team, same period and clock) folds into that row: the
// points add up, the try becomes the parenthetical, and the running score is the try's.
//
// The headline is composed from the roles — receiver-first on a pass, rusher-first on a
// run, kicker-first on a kick, returner-first on a return. Yardage isn't a field on the
// row (only inside `description`), so the headline has none until the backend ships it.
//
// OT: scoring rows carry `period: 4` with the clock at 0:00, so overtime is read off the
// drive's `is_overtime` flag via `drive_id`.
const lastName = (raw) => splitDisplayName(raw)[1] || splitDisplayName(raw)[0] || "";

const byRole = (players, role) => (players ?? []).find((p) => p?.role === role)?.name ?? null;

const scoringHeadline = (row) => {
  const players = row.players ?? [];
  const st = String(row.scoring_type ?? "");
  const pt = String(row.play_type ?? "");
  const desc = String(row.description ?? "").toLowerCase();
  const receiver = byRole(players, "receiver");
  const passer = byRole(players, "passer");
  const rusher = byRole(players, "rusher");
  const kicker = byRole(players, "kicker");
  const returner = byRole(players, "returner");

  if (st === "FG") return kicker ? `${lastName(kicker)} Field Goal` : "Field Goal";
  if (st === "SAFETY") return "Safety";
  if (st === "INTERCEPTION_TD") return returner ? `${lastName(returner)} Interception Return` : "Interception Return";
  if (st === "FUMBLE_TD") {
    if (desc.includes("blocked")) return returner ? `${lastName(returner)} Blocked Punt Return` : "Blocked Punt Return";
    return returner ? `${lastName(returner)} Fumble Return` : "Fumble Return";
  }
  if (pt === "PASS" && receiver) return passer ? `${lastName(receiver)} Pass from ${lastName(passer)}` : `${lastName(receiver)} Pass`;
  if (pt === "RUSH" && rusher) return `${lastName(rusher)} Run`;
  if (pt === "KICKOFF" && returner) return `${lastName(returner)} Kickoff Return`;
  if (pt === "PUNT" && returner) return `${lastName(returner)} Punt Return`;
  return st.replace(/_/g, " ");
};

const tryLabel = (row) => {
  const players = row.players ?? [];
  const st = String(row.scoring_type ?? "");
  if (st === "PAT") {
    const kicker = byRole(players, "kicker");
    return kicker ? `(${lastName(kicker)} Kick)` : "(Kick)";
  }
  if (st === "TWO_POINT") {
    const who = byRole(players, "receiver") ?? byRole(players, "rusher");
    return who ? `(${lastName(who)} 2-Pt)` : "(2-Pt Conversion)";
  }
  return null;
};

const scorerOf = (row) => {
  const players = row.players ?? [];
  const pick = (role) => players.find((p) => p?.role === role) ?? null;
  return pick("receiver") ?? pick("rusher") ?? pick("returner") ?? pick("kicker") ?? null;
};

const mmss = (secs) => {
  if (typeof secs !== "number") return null;
  const m = Math.floor(secs / 60);
  const sec = Math.round(secs % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const isTry = (row) => ["PAT", "TWO_POINT"].includes(String(row?.scoring_type ?? ""));

export const buildScoringPlays = ({ scoringPlays, driveSummary, awayId, homeId, identity }) => {
  const rows = Array.isArray(scoringPlays) ? scoringPlays : [];
  const otDrives = new Set((Array.isArray(driveSummary) ? driveSummary : []).filter((d) => d?.is_overtime).map((d) => d.drive_id));
  const out = [];

  rows.forEach((row) => {
    const prev = out[out.length - 1];
    const sameMoment = prev && prev.teamId === row.team_id && prev.period === row.period && prev.clock === row.clock;
    if (isTry(row) && prev && sameMoment && prev.type === "TD_LIKE") {
      prev.points += row.points ?? 0;
      prev.extra = tryLabel(row);
      prev.awayScore = row.score_after?.away ?? prev.awayScore;
      prev.homeScore = row.score_after?.home ?? prev.homeScore;
      return;
    }

    const isHome = normTeamId(row.team_id) === normTeamId(homeId);
    const flip = (y) => (typeof y === "number" ? (isHome ? 100 - y : y) : null);
    const scorerRow = scorerOf(row);
    const scorer = scorerRow?.name ?? null;
    const st = String(row.scoring_type ?? "");
    const tdLike = st.endsWith("TD");
    out.push({
      key: row.play_id ?? `${row.period}-${row.clock}-${row.team_id}-${out.length}`,
      teamId: row.team_id,
      team: isHome ? "home" : "away",
      period: row.period,
      quarter: otDrives.has(row.drive_id) ? 5 : (row.period ?? 1),
      clock: row.clock ?? "—",
      type: tdLike ? "TD_LIKE" : st,
      typeLabel: st.replace(/_/g, " "),
      points: row.points ?? 0,
      line: scoringHeadline(row),
      extra: null,
      scorer,
      scorerImages: scorerRow ? resolveImages(identity, { player_key: scorerRow.player_id, name: scorerRow.name }, row.team_id) : [],
      awayScore: row.score_after?.away ?? null,
      homeScore: row.score_after?.home ?? null,
      drivePlays: row.drive?.plays ?? null,
      driveYards: row.drive?.yards ?? null,
      drivePossession: mmss(row.drive?.time_of_possession_seconds),
      driveStartYard: flip(row.drive?.start_yardline_absolute),
      driveEndYard: flip(row.drive?.end_yardline_absolute),
    });
  });

  return out;
};
