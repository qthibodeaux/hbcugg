import { normalizeStatsList, fmtPct } from "./statHelpers";
import { getTeamName, getTeamDisplayName, getTeamColor, getTeamSecondary, getTeamAccent } from "./teamIdentity";

// Existing rushing model, extracted unchanged. Estimated values and charting rules are not corrected by this refactor.

export const buildRushingData = (game, teamId, leagueAvg, teamSeasonAvg, teamDefenseAvg) => {
  const stats = game?.individual_stats?.[teamId];
  if (!stats) return null;

  const rushingRaw = normalizeStatsList(stats.rushing);
  const rushing = rushingRaw.filter((p) => p.name !== "TEAM");

  // Team totals from team_box + advanced_team
  const teamBox = game?.team_box?.[teamId] ?? {};
  const adv = game?.advanced_team?.[teamId] ?? {};

  const teamTotal = {
    attempts: teamBox.rush_attempts ?? 0,
    yards: teamBox.rush_yards ?? 0,
    touchdowns: teamBox.rush_touchdowns ?? 0,
    ypc: teamBox.yards_per_carry ?? 0,
    // Advanced metrics for the split rows
    epa: adv.epa_rush ?? null,                    // MISSING — DATA GAP
    successRate: adv.success_rate ?? 0,
    highlightYards: adv.highlight_yards_total ?? 0,
    highlightYardsPerRush: adv.highlight_yards_per_rush ?? 0,
    opportunityRate: adv.rush_opportunity_rate ?? 0,
    explosiveRate: adv.explosive_rate_yardage ?? 0,
    lineYards: adv.line_yards_total ?? 0,
    lineYardsPerRush: adv.line_yards_per_rush ?? 0,
    stuffRate: adv.stuff_rate ?? 0,
    stoppedRate: adv.stopped_run_rate ?? 0,
    epaPerPlay: adv.epa_per_play ?? 0,
  };

  // Derivable counts
  const stuffedCount = Math.round((adv.stuff_rate ?? 0) * (teamBox.rush_attempts ?? 0));
  const opportunityCount = Math.round((adv.rush_opportunity_rate ?? 0) * (teamBox.rush_attempts ?? 0));
  const stoppedCount = Math.round((adv.stopped_run_rate ?? 0) * (teamBox.rush_attempts ?? 0));
  const successfulCount = Math.round((adv.success_rate ?? 0) * (teamBox.rush_attempts ?? 0));

  // Derive lanes from play_by_play
  const lanes = { left: { attempts: 0, yards: 0, success: 0 }, middle: { attempts: 0, yards: 0, success: 0 }, right: { attempts: 0, yards: 0, success: 0 } };
  (game.play_by_play ?? []).forEach((play) => {
    const cleanTeam = play.offense_team ? String(play.offense_team).replace(/25$/, "") : "";
    if (play.play_type !== "RUSH" || cleanTeam !== teamId) return;
    const action = play.actions?.[0];
    if (!action || action.type !== "RUSH") return;
    const dir = action.rushDirection?.toLowerCase() || "middle";
    const lane = dir.includes("left") ? lanes.left : dir.includes("right") ? lanes.right : lanes.middle;
    lane.attempts += 1;
    lane.yards += action.net_yards || 0;
    if ((action.net_yards || 0) >= 4) lane.success += 1;
  });

  // Rushers with lanes
  const rushers = rushing.map((p) => ({
    key: p.player_key,
    name: p.name,
    position: p.position || "RB",
    attempts: p.attempts ?? 0,
    yards: p.yards ?? 0,
    touchdowns: p.touchdowns ?? 0,
    ypc: p.yards_per_carry ?? 0,
    long: p.long ?? 0,
    lanes: { left: { attempts: 0, yards: 0 }, middle: { attempts: 0, yards: 0 }, right: { attempts: 0, yards: 0 } },
  }));

  // Derive per-player lanes. `rusher` is a plain string pre-2026 and an
  // {name_raw, team, player_id} object on 2026+ — pull the name out either way, or
  // every 2026 carry fails this match and the lane grid renders empty rather than
  // wrong. `rushDirection` never existed on any RUSH action (reqs ask #8); the 2026
  // export's real field is `direction`, read here as the honest replacement.
  (game.play_by_play ?? []).forEach((play) => {
    const cleanTeam = play.offense_team ? String(play.offense_team).replace(/25$/, "") : "";
    if (play.play_type !== "RUSH" || cleanTeam !== teamId) return;
    const action = play.actions?.[0];
    if (!action || action.type !== "RUSH") return;
    const rusherName = action.rusher?.name_raw ?? (typeof action.rusher === "string" ? action.rusher : null);
    const rusher = rushers.find((r) => r.name === rusherName);
    if (!rusher) return;
    const dir = (action.direction ?? action.rushDirection)?.toLowerCase() || "middle";
    const lane = dir.includes("left") ? rusher.lanes.left : dir.includes("right") ? rusher.lanes.right : rusher.lanes.middle;
    lane.attempts += 1;
    lane.yards += action.net_yards || 0;
  });

  // ─── Opponent defense metrics — for defensive impact pills ───────────────────
  const metaTeams = game?.metadata?.away_team && game?.metadata?.home_team
    ? [game.metadata.away_team, game.metadata.home_team]
    : [];
  const oppTeamId = metaTeams.find((t) => {
    const id = typeof t === "string" ? t : t?.id;
    return id !== teamId;
  });
  const oppTeamIdClean = typeof oppTeamId === "string" ? oppTeamId : oppTeamId?.id ?? "";
  const oppAdv = game?.advanced_team?.[oppTeamIdClean] ?? {};

  // Fetched season averages from pipeline-generated JSONs
  const offenseSeasonAvg = teamSeasonAvg?.rushing ?? null;
  const defenseSeasonAvg = teamDefenseAvg?.rushing ?? null;

  const defenseImpact = [
    {
      label: "Stop Rate",
      descriptor: "FAILED RUSHES",
      value: fmtPct(oppAdv.stopped_run_rate ?? 0),
      rawValue: oppAdv.stopped_run_rate ?? 0,
      category: "run_stop",
    },
    {
      label: "Stuff Rate",
      descriptor: "LINE WINS",
      value: fmtPct(oppAdv.stuff_rate ?? 0),
      rawValue: oppAdv.stuff_rate ?? 0,
      category: "line_play",
    },
    {
      label: "TFL Forced",
      descriptor: "BEHIND LOSS",
      value: fmtPct(oppAdv.tfl_rate_forced ?? 0),
      rawValue: oppAdv.tfl_rate_forced ?? 0,
      category: "disruption",
    },
    {
      label: "Power Stop",
      descriptor: "SHORT YARDAGE",
      // PLACEHOLDER: power_stop_rate is null in current data, use stopped_run_rate * 0.8 as estimate
      value: fmtPct(oppAdv.power_stop_rate ?? (oppAdv.stopped_run_rate ?? 0) * 0.8),
      rawValue: oppAdv.power_stop_rate ?? (oppAdv.stopped_run_rate ?? 0) * 0.8,
      category: "short_yardage",
    },
    {
      label: "1D Rush Succ",
      descriptor: "ALLOWED",
      value: fmtPct(oppAdv.success_rate ?? 0),
      rawValue: oppAdv.success_rate ?? 0,
      category: "down_success",
    },
    {
      label: "Opp Allowed",
      descriptor: "4+ YARDS",
      value: fmtPct(oppAdv.rush_opportunity_rate ?? 0),
      rawValue: oppAdv.rush_opportunity_rate ?? 0,
      category: "explosive_prevention",
    },
  ];

  return {
    meta: {
      shortName: getTeamName(teamId),
      displayName: getTeamDisplayName(teamId),
      colors: { primary: getTeamColor(teamId), secondary: getTeamSecondary(teamId), accent: getTeamAccent(teamId) },
    },
    team: teamTotal,
    derived: {
      stuffedCount,
      opportunityCount,
      stoppedCount,
      successfulCount,
    },
    lanes,
    rushers,
    opponent: {
      shortName: getTeamName(oppTeamIdClean),
      colors: {
        primary: getTeamColor(oppTeamIdClean),
        secondary: getTeamSecondary(oppTeamIdClean),
      },
      metrics: {
        tflForced: oppAdv.tfl_rate_forced ?? 0,
        stuffRate: oppAdv.stuff_rate ?? 0,
        powerStopRate: oppAdv.power_stop_rate ?? 0,
        oppAllowedRate: oppAdv.rush_opportunity_rate ?? 0,
        firstDownSuccAllowed: oppAdv.success_rate ?? 0,
      },
    },
    defenseImpact,
    context: {
      offenseSeasonAvg,
      defenseSeasonAvg,
    },
  };
};
