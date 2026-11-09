import { getTeamLabel, normTeamId } from "./teamIdentity";

// Extracted from GameSummaryTabV2. Existing data and presentation behavior is preserved.

const OBTAINED_LABEL = {
  kickoff: "Kickoff",
  punt: "Punt",
  interception: "INT",
  fumble_recovery: "Fumble",
  missed_fg: "Missed FG",
  blocked_fg: "Blk FG",
  downs: "Downs",
  blocked_punt: "Blk Punt",
  onside_kick: "Onside",
};

const RESULT_LABEL = {
  BlockedFG: "Blk FG",
  MissedFG: "Missed FG",
  INT_TD: "INT TD",
  FUMB_TD: "FUMB TD",
  EndHalf: "End Half",
  EndGame: "End Game",
  PUNT_RET_TD: "Ret TD",
  BLK_PUNT_TD: "Blk TD",
  BLK_FG_TD: "Blk TD",
  FG_RET_TD: "Ret TD",
};

const spotLabel = (yard, offenseId, defenseId) => {
  if (typeof yard !== "number") return "—";
  if (yard <= 50) return `${getTeamLabel(offenseId)} ${yard}`;
  return `${getTeamLabel(defenseId)} ${100 - yard}`;
};

const conv = (block) => (block ? `${block.conversions ?? 0}-${block.attempts ?? 0}` : "—");

export const toDriveRow = (d, awayId, homeId) => {
  const isHome = normTeamId(d.offense_team) === normTeamId(homeId);
  const offenseId = isHome ? homeId : awayId;
  const defenseId = isHome ? awayId : homeId;
  const flip = (y) => (typeof y === "number" ? (isHome ? 100 - y : y) : null);
  return {
    team: isHome ? "home" : "away",
    quarter: d.is_overtime ? "OT" : `Q${d.quarter_start ?? "—"}`,
    startSpot: spotLabel(d.start_yardline_absolute, offenseId, defenseId),
    startTime: d.clock_start ?? "—",
    obtained: OBTAINED_LABEL[d.possession_obtained_by] ?? String(d.possession_obtained_by ?? "—").replace(/_/g, " "),
    endSpot: spotLabel(d.end_yardline_absolute, offenseId, defenseId),
    endTime: d.clock_end ?? "—",
    result: d.result ?? "—",
    resultLabel: RESULT_LABEL[d.result] ?? d.result ?? "—",
    plays: d.plays_total ?? null,
    yards: d.yards_net ?? null,
    top: d.time_of_possession ?? null,
    epa: typeof d.epa === "number" ? d.epa : null,
    thirdDown: conv(d.third_down),
    fourthDown: conv(d.fourth_down),
    explosive: d.explosive_plays ?? null,
    penaltyCount: d.penalties?.count ?? null,
    penaltyYards: d.penalties?.yards ?? null,
    awayScore: d.score_after?.away ?? null,
    homeScore: d.score_after?.home ?? null,
    startYard: flip(d.start_yardline_absolute),
    endYard: flip(d.end_yardline_absolute),
  };
};
