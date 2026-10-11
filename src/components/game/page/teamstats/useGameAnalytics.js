import { useMemo } from "react";
import { teamSackYards } from "../../../../utils/gameHelpers";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const n = (v) => (v == null || Number.isNaN(Number(v)) ? null : Number(v));
const div = (a, b) => (n(b) ? n(a) / n(b) : null);
const sum = (arr) => arr.reduce((acc, v) => acc + (n(v) ?? 0), 0);
const fmt = (v, d = 0) => (n(v) == null ? "—" : n(v).toFixed(d));
// eslint-disable-next-line no-unused-vars
const pct = (v) => (n(v) == null ? "—" : `${Math.round(n(v) * 100)}%`);
// eslint-disable-next-line no-unused-vars
const signed = (v, d = 1) => {
  if (n(v) == null) return "—";
  const val = n(v);
  return `${val > 0 ? "+" : ""}${val.toFixed(d)}`;
};
// eslint-disable-next-line no-unused-vars
const ratio = (made, att) => `${fmt(made, 0)}/${fmt(att, 0)}`;

const cleanTeamId = (id) => String(id ?? "").replace(/25$/, "");

// ─── PBP Derivation Engine ───────────────────────────────────────────────────
const deriveFromPBP = (game, teamId) => {
  const plays = game?.play_by_play ?? [];
  const cleanId = cleanTeamId(teamId);

  let scrimmagePlays = 0;
  let totalEPA = 0;
  let passEPA = 0;
  let rushEPA = 0;
  let stEPA = 0;
  let penaltyEPA = 0;

  let scrimmageSuccess = 0;
  let passSuccess = 0;
  let rushSuccess = 0;

  let passPlays = 0;
  let rushPlays = 0;

  let explosivePass = 0;
  let explosiveRush = 0;

  let standardDownPlays = 0;
  let standardDownSuccess = 0;
  let passingDownPlays = 0;
  let passingDownSuccess = 0;
  let earlyDownPlays = 0;
  let earlyDownSuccess = 0;
  let lateDownPlays = 0;
  let lateDownSuccess = 0;
  let middle8Plays = 0;
  let middle8Success = 0;
  let goalToGoPlays = 0;
  let goalToGoSuccess = 0;
  let twoMinPlays = 0;
  let twoMinSuccess = 0;

  let epaWithoutExplosive = 0;

  let h1EPA = 0;
  let h2EPA = 0;
  let q1EPA = 0;
  let q2EPA = 0;
  let q3EPA = 0;
  let q4EPA = 0;

  let positiveEPAPlays = 0;

  plays.forEach((play) => {
    const offTeam = cleanTeamId(play.offense_team);
    if (offTeam !== cleanId) return;

    const epa = n(play.epa?.epa ?? play.play_advanced?.epa?.epa ?? 0);
    const playType = play.play_type;
    const quarter = n(play.quarter) || 0;
    const down = n(play.down) || 0;
    const dist = n(play.distance) || 0;
    const yardline = n(play.yardline_absolute) || 0;

    const isST = ["KICKOFF", "PUNT", "FIELD_GOAL", "PAT", "EXTRA_POINT"].includes(playType);
    const isPenalty = playType === "PENALTY" || play.play_advanced?.penalty_model?.has_penalty === true;

    if (isST) {
      stEPA += epa;
      return;
    }
    if (isPenalty) {
      penaltyEPA += epa;
      return;
    }

    if (playType === "PASS" || playType === "RUSH") {
      scrimmagePlays += 1;
      totalEPA += epa;
      if (epa > 0) positiveEPAPlays += 1;

      // Quarter splits
      if (quarter <= 2) h1EPA += epa;
      else h2EPA += epa;
      if (quarter === 1) q1EPA += epa;
      if (quarter === 2) q2EPA += epa;
      if (quarter === 3) q3EPA += epa;
      if (quarter === 4) q4EPA += epa;

      const success = play.play_advanced?.success?.down_distance === true ||
                      play.play_advanced?.success?.epa === true ||
                      epa > 0;
      const explosive = play.play_advanced?.explosive?.yardage_based === true ||
                        play.play_advanced?.explosive?.epa_based === true;

      if (success) scrimmageSuccess += 1;
      if (!explosive) epaWithoutExplosive += epa;

      // Situational
      const isStdDown = down === 1 || (down === 2 && dist <= 8);
      const isPassDown = down === 3 || (down === 2 && dist > 8);
      const isEarlyDown = down === 1 || down === 2;
      const isLateDown = down === 3 || down === 4;
      const isMiddle8 = (quarter === 2 && play.clock) || (quarter === 3 && play.clock);
      const isGoalToGo = yardline >= 90 && down > 0;
      const isTwoMin = (quarter === 2 || quarter === 4) && play.clock && String(play.clock).split(":")[0] === "2";

      if (isStdDown) { standardDownPlays += 1; if (success) standardDownSuccess += 1; }
      if (isPassDown) { passingDownPlays += 1; if (success) passingDownSuccess += 1; }
      if (isEarlyDown) { earlyDownPlays += 1; if (success) earlyDownSuccess += 1; }
      if (isLateDown) { lateDownPlays += 1; if (success) lateDownSuccess += 1; }
      if (isMiddle8) { middle8Plays += 1; if (success) middle8Success += 1; }
      if (isGoalToGo) { goalToGoPlays += 1; if (success) goalToGoSuccess += 1; }
      if (isTwoMin) { twoMinPlays += 1; if (success) twoMinSuccess += 1; }

      if (playType === "PASS") {
        passPlays += 1;
        passEPA += epa;
        if (success) passSuccess += 1;
        if (explosive) explosivePass += 1;
      } else if (playType === "RUSH") {
        rushPlays += 1;
        rushEPA += epa;
        if (success) rushSuccess += 1;
        if (explosive) explosiveRush += 1;
      }
    }
  });

  return {
    scrimmagePlays,
    totalEPA,
    passEPA,
    rushEPA,
    stEPA,
    penaltyEPA,
    totalGameEPA: totalEPA + stEPA + penaltyEPA,
    scrimmageSuccessRate: div(scrimmageSuccess, scrimmagePlays),
    passSuccessRate: div(passSuccess, passPlays),
    rushSuccessRate: div(rushSuccess, rushPlays),
    passPlays,
    rushPlays,
    explosivePass,
    explosiveRush,
    explosiveTotal: explosivePass + explosiveRush,
    standardDownSuccessRate: div(standardDownSuccess, standardDownPlays),
    passingDownSuccessRate: div(passingDownSuccess, passingDownPlays),
    earlyDownSuccessRate: div(earlyDownSuccess, earlyDownPlays),
    lateDownSuccessRate: div(lateDownSuccess, lateDownPlays),
    middle8SuccessRate: div(middle8Success, middle8Plays),
    goalToGoSuccessRate: div(goalToGoSuccess, goalToGoPlays),
    twoMinSuccessRate: div(twoMinSuccess, twoMinPlays),
    epaWithoutExplosive,
    h1EPA,
    h2EPA,
    q1EPA,
    q2EPA,
    q3EPA,
    q4EPA,
    positiveEPAPlayRate: div(positiveEPAPlays, scrimmagePlays),
  };
};

// ─── Drive Derivation ────────────────────────────────────────────────────────
const deriveFromDrives = (game, teamId) => {
  const drives = game?.drive_summary ?? [];
  const cleanId = cleanTeamId(teamId);

  const offDrives = drives.filter((d) => cleanTeamId(d.offense_team) === cleanId);
  const defDrives = drives.filter((d) => cleanTeamId(d.defense_team) === cleanId);

  const scoringDrives = offDrives.filter((d) => (d.points ?? 0) > 0).length;
  const tdDrives = offDrives.filter((d) => d.result === "TD").length;
  const fgDrives = offDrives.filter((d) => d.result === "FG").length;
  const puntDrives = offDrives.filter((d) => d.result === "Punt").length;
  const turnoverDrives = offDrives.filter((d) => ["INT", "Fumble", "Safety"].includes(d.result)).length;
  const downsDrives = offDrives.filter((d) => d.result === "Downs").length;
  const threeAndOuts = offDrives.filter((d) => (d.plays_total ?? 0) <= 3 && d.result === "Punt").length;
  const sustainedDrives = offDrives.filter((d) => (d.plays_total ?? 0) >= 8).length;

  const totalPlays = sum(offDrives.map((d) => d.plays_total));
  const totalYards = sum(offDrives.map((d) => d.yards_net));
  const totalPoints = sum(offDrives.map((d) => d.points));

  // Time of possession (approximate from clock strings)
  let topSeconds = 0;
  offDrives.forEach((d) => {
    const start = d.clock_start;
    const end = d.clock_end;
    if (start && end && typeof start === "string" && typeof end === "string") {
      const [sm, ss] = start.split(":").map(Number);
      const [em, es] = end.split(":").map(Number);
      if (!Number.isNaN(sm) && !Number.isNaN(ss) && !Number.isNaN(em) && !Number.isNaN(es)) {
        const startSec = sm * 60 + ss;
        const endSec = em * 60 + es;
        if (d.quarter_start === d.quarter_end && endSec <= startSec) {
          topSeconds += startSec - endSec;
        }
      }
    }
  });

  // Defensive drive stats
  const defStopsPunt = defDrives.filter((d) => d.result === "Punt").length;
  const defStopsTurnover = defDrives.filter((d) => ["INT", "Fumble", "Safety"].includes(d.result)).length;
  const defStopsDowns = defDrives.filter((d) => d.result === "Downs").length;
  const defAllowedTD = defDrives.filter((d) => d.result === "TD").length;
  const defAllowedFG = defDrives.filter((d) => d.result === "FG").length;
  const defThreeAndOutsForced = defDrives.filter((d) => (d.plays_total ?? 0) <= 3 && d.result === "Punt").length;

  return {
    scoringDrives,
    scoringDriveRate: div(scoringDrives, offDrives.length),
    tdDriveRate: div(tdDrives, offDrives.length),
    fgDriveRate: div(fgDrives, offDrives.length),
    puntDriveRate: div(puntDrives, offDrives.length),
    turnoverDriveRate: div(turnoverDrives, offDrives.length),
    downsDriveRate: div(downsDrives, offDrives.length),
    threeAndOutRate: div(threeAndOuts, offDrives.length),
    sustainedDriveRate: div(sustainedDrives, offDrives.length),
    playsPerDrive: div(totalPlays, offDrives.length),
    yardsPerDrive: div(totalYards, offDrives.length),
    pointsPerDrive: div(totalPoints, offDrives.length),
    timeOfPossessionSeconds: topSeconds,
    timeOfPossession: topSeconds > 0 ? `${Math.floor(topSeconds / 60)}:${String(topSeconds % 60).padStart(2, "0")}` : "—",
    drivesOffense: offDrives.length,
    drivesFaced: defDrives.length,
    defStopsPunt,
    defStopsTurnover,
    defStopsDowns,
    defAllowedTD,
    defAllowedFG,
    defThreeAndOutsForced,
  };
};

// ─── Main Hook ───────────────────────────────────────────────────────────────
export const useGameAnalytics = (game, awayId, homeId) => {
  return useMemo(() => {
    if (!game || !awayId || !homeId) return null;

    const aClean = cleanTeamId(awayId);
    const hClean = cleanTeamId(homeId);

    const aPBP = deriveFromPBP(game, awayId);
    const hPBP = deriveFromPBP(game, homeId);
    const aDrives = deriveFromDrives(game, awayId);
    const hDrives = deriveFromDrives(game, homeId);

    // Native data accessors
    const tBox = (id) => game?.team_box?.[id] ?? {};
    const aAdv = (id) => game?.advanced_team?.[id] ?? {};
    const aST = (id) => game?.special_teams_advanced?.[id] ?? {};
    const aPen = (id) => game?.penalty_advanced?.[id] ?? {};
    const aCoach = (id) => game?.coaching_profile?.[id] ?? {};
    const aDefId = (id) => game?.defensive_identity?.[id] ?? {};
    const aPress = (id) => game?.pressure_profile?.[id] ?? {};
    const aSeq = (id) => game?.sequence_model?.[id] ?? {};
    const aHeat = (id) => game?.heat_maps?.[id] ?? {};
    const aRole = (id) => game?.defense_role_distribution?.[id] ?? {};

    const buildTeam = (id, oppId, pbp, drv) => {
      // Sacks are their own category on the export: rush_yards and total_yards
      // both exclude them. Read the yardage back off the passing rows so the
      // page can show the loss and the net figures alongside the clean ones.
      const sackYardsLost = teamSackYards(game, id);
      const sackYardsForced = teamSackYards(game, oppId);
      const less = (v, lost) => (n(v) == null ? null : n(v) - (lost ?? 0));
      const box = tBox(id);
      const adv = aAdv(id);
      const st = aST(id);
      const pen = aPen(id);
      const coach = aCoach(id);
      const defId = aDefId(id);
      const press = aPress(id);
      const seq = aSeq(id);
      const heat = aHeat(id);
      const role = aRole(id);

      const rpd = coach?.run_pass_by_down ?? {};
      const fgOff = st?.fg_offense ?? {};
      // const fgDef = st?.fg_defense ?? {}; // reserved for future use
      const puntOff = st?.punt_offense ?? {};
      const puntDef = st?.punt_defense ?? {};
      const koOff = st?.kickoff_offense ?? {};
      const koDef = st?.kickoff_defense ?? {};
      const patOff = st?.pat_offense ?? {};
      const patDef = st?.pat_defense ?? {};
      const stSummary = st?.summary ?? {};
      // The current block (the retired special_teams_advanced is gone).
      const stx = game?.special_teams?.[id] ?? {};
      const stFg = stx.field_goals ?? {};
      const stPat = stx.pat ?? {};
      const st2 = stx.two_point ?? {};
      const stPunt = stx.punting ?? {};
      const stKo = stx.kickoffs ?? {};
      const stKr = stx.kick_return ?? {};
      const stPr = stx.punt_return ?? {};

      return {
        // ── Overview ──
        pointsScored: box.points_scored,
        playsOffense: box.plays_offense,
        totalYards: box.total_yards,
        netTotalYards: less(box.total_yards, sackYardsLost),
        yardsPerPlay: box.yards_per_play ?? div(box.total_yards, box.plays_offense),
        firstDowns: box.first_downs,
        successRate: adv.success_rate_down_distance ?? pbp.scrimmageSuccessRate,
        epaTotal: adv.epa_total ?? pbp.totalEPA,
        epaPerPlay: adv.epa_per_play ?? div(pbp.totalEPA, pbp.scrimmagePlays),
        wpaTotal: adv.wpa_total,
        explosiveRate: adv.explosive_rate_yardage,
        turnoverMargin: (box.turnovers_forced ?? 0) - (box.turnovers_committed ?? 0),
        timeOfPossession: drv.timeOfPossession,
        playsPerMinute: drv.timeOfPossessionSeconds > 0 ? div(pbp.scrimmagePlays * 60, drv.timeOfPossessionSeconds) : null,

        // ── EPA Streams ──
        offensiveEPA: adv.epa_total ?? pbp.totalEPA,
        passingEPATotal: pbp.passEPA,
        passingEPAPerDropback: div(pbp.passEPA, (box.pass_attempts ?? 0) + (box.sacks_allowed ?? 0)),
        rushingEPATotal: pbp.rushEPA,
        rushingEPAPerCarry: div(pbp.rushEPA, box.rush_attempts),
        specialTeamsEPA: pbp.stEPA,
        penaltyEPA: pbp.penaltyEPA,
        totalGameEPA: pbp.totalGameEPA,
        competitiveEPA: adv.competitive_epa_total,
        competitiveEPAPerPlay: adv.competitive_epa_per_play,
        garbageTimeShare: adv.garbage_time_play_share,
        h1EPA: pbp.h1EPA,
        h2EPA: pbp.h2EPA,
        q1EPA: pbp.q1EPA,
        q2EPA: pbp.q2EPA,
        q3EPA: pbp.q3EPA,
        q4EPA: pbp.q4EPA,
        positiveEPAPlayRate: pbp.positiveEPAPlayRate,

        // ── Success Rates ──
        overallSuccessRate: adv.success_rate_down_distance ?? pbp.scrimmageSuccessRate,
        standardDownSuccess: adv.success_rate_standard_down ?? pbp.standardDownSuccessRate,
        passingDownSuccess: adv.success_rate_passing_down ?? pbp.passingDownSuccessRate,
        earlyDownSuccess: adv.success_rate_early_down ?? pbp.earlyDownSuccessRate,
        lateDownSuccess: adv.success_rate_late_down ?? pbp.lateDownSuccessRate,
        goalToGoSuccess: adv.success_rate_goal_to_go ?? pbp.goalToGoSuccessRate,
        twoMinuteSuccess: adv.success_rate_two_minute ?? pbp.twoMinSuccessRate,
        middle8Success: adv.success_rate_middle_8 ?? pbp.middle8SuccessRate,
        passingSuccessRate: pbp.passSuccessRate,
        rushingSuccessRate: pbp.rushSuccessRate,

        // ── Explosiveness ──
        explosivePlaysTotal: pbp.explosiveTotal,
        explosivePasses: pbp.explosivePass,
        explosiveRushes: pbp.explosiveRush,
        explosiveRateYardage: adv.explosive_rate_yardage,
        explosiveRateEPA: adv.explosive_rate_epa,
        epaWithoutExplosives: pbp.epaWithoutExplosive,
        epaPerExplosivePlay: div(pbp.totalEPA - pbp.epaWithoutExplosive, pbp.explosiveTotal),
        explosiveDriveRate: adv.explosive_drive_rate,

        // ── Passing ──
        passAttempts: box.pass_attempts,
        passCompletions: box.pass_completions,
        completionPct: box.pass_completion_pct,
        passYards: box.pass_yards,
        yardsPerAttempt: box.yards_per_pass_attempt,
        yardsPerCompletion: div(box.pass_yards, box.pass_completions),
        passTouchdowns: box.pass_touchdowns,
        interceptionsThrown: box.interceptions_thrown,
        sacksAllowed: box.sacks_allowed,
        sackYardsLost,
        sackRate: div(box.sacks_allowed, (box.pass_attempts ?? 0) + (box.sacks_allowed ?? 0)),
        // The SP+ reading of yards per attempt: sack yardage off the top, sacks
        // counted as dropbacks. Lower than raw yards / attempts, and the number
        // that survives comparison across teams that protect differently.
        netYardsPerDropback: div(
          less(box.pass_yards, sackYardsLost),
          (box.pass_attempts ?? 0) + (box.sacks_allowed ?? 0),
        ),
        passingEPA: pbp.passEPA,
        epaPerDropback: div(pbp.passEPA, (box.pass_attempts ?? 0) + (box.sacks_allowed ?? 0)),
        passSuccessRate: pbp.passSuccessRate,
        passExplosiveRate: div(pbp.explosivePass, pbp.passPlays),
        pressureRateFaced: press.pressure_rate_faced,
        pressureCompletionPct: press.pressure_completion_pct,
        hurriesFaced: press.hurries_faced,
        passHeatMap: heat.pass_heat_map,

        // ── Rushing ──
        rushAttempts: box.rush_attempts,
        rushYards: box.rush_yards,
        // What a conference box score prints: sacks charged against rushing.
        // Kept beside the clean figure rather than replacing it, so our number
        // and the Sidearm number are both on the page and neither looks wrong.
        netRushYards: less(box.rush_yards, sackYardsLost),
        yardsPerCarry: box.yards_per_carry,
        rushTouchdowns: box.rush_touchdowns,
        rushingEPA: pbp.rushEPA,
        epaPerRush: div(pbp.rushEPA, box.rush_attempts),
        rushSuccessRate: pbp.rushSuccessRate,
        rushExplosiveRate: div(pbp.explosiveRush, pbp.rushPlays),
        lineYardsTotal: adv.line_yards_total,
        lineYardsPerRush: adv.line_yards_per_rush,
        highlightYardsTotal: adv.highlight_yards_total,
        highlightYardsPerRush: adv.highlight_yards_per_rush,
        opportunityRate: adv.rush_opportunity_rate,
        stuffRate: adv.stuff_rate,
        stoppedRunRate: adv.stopped_run_rate,
        powerRunAttempts: adv.power_run_attempts,
        powerSuccessRate: adv.power_run_success_rate,
        rushHeatMap: heat.rush_heat_map,
        // firstDownRunRate already set above

        // ── Drive Efficiency ──
        drivesOffense: box.drives_offense,
        pointsPerDrive: box.points_per_drive,
        avgStartFieldPosition: box.avg_start_field_position,
        longFieldDrives: box.long_field_drives,
        longFieldRate: box.long_field_rate,
        qualityDriveRate: adv.quality_drive_rate,
        negativeDriveRate: adv.negative_drive_rate,
        pointsPerQualityDrive: adv.points_per_quality_drive,
        opportunitiesInside40: adv.opportunities_40,
        pointsPerOppInside40: adv.points_per_opportunity_40,
        redZoneOpportunities: adv.red_zone_opportunities,
        redZonePointsPerOpp: adv.red_zone_points_per_opportunity,
        redZoneTDRate: adv.red_zone_td_rate,
        scoringDrives: drv.scoringDrives,
        scoringDriveRate: drv.scoringDriveRate,
        tdDriveRate: drv.tdDriveRate,
        fgDriveRate: drv.fgDriveRate,
        puntDriveRate: drv.puntDriveRate,
        turnoverDriveRate: drv.turnoverDriveRate,
        downsDriveRate: drv.downsDriveRate,
        threeAndOutRate: drv.threeAndOutRate,
        sustainedDriveRate: drv.sustainedDriveRate,
        playsPerDrive: drv.playsPerDrive,
        yardsPerDrive: drv.yardsPerDrive,

        // ── Third & Fourth Downs ──
        thirdDownAttempts: box.third_down_attempts,
        thirdDownConversions: box.third_down_conversions,
        thirdDownRate: box.third_down_conversion_rate,
        thirdDownAvgDistance: box.third_down_avg_distance,
        fourthDownGoes: box.fourth_down_goes,
        fourthDownConversions: box.fourth_down_go_conversions,
        fourthDownGoRate: box.fourth_down_go_rate,
        fourthDownConversionRate: box.fourth_down_go_conversion_rate,

        // ── Defense ──
        sacksMade: box.sacks_made,
        sackYardsForced,
        sackRateForced: adv.sack_rate_forced,
        tflRateForced: adv.tfl_rate_forced,
        havocRateForced: adv.havoc_rate_forced,
        havocRateAllowed: adv.havoc_rate_allowed,
        passDefendedRateForced: adv.pass_defended_rate_forced,
        disruptionRate: defId.disruption_rate,
        explosivePreventionRate: defId.explosive_prevention_rate,
        yardsPerPlayAllowed: defId.yards_per_play_allowed,
        bendDontBreakIndex: defId.bend_dont_break_index,
        defPlays: defId.def_plays,
        pressureRateForced: press.pressure_rate_forced,
        totalPressuresForced: press.total_pressures_forced,
        qbHurriesForced: press.qb_hurries_forced,
        sacksForced: press.sacks_forced,
        passRushShareDL: role.pass_rush_share_dl,
        runStopShareDL: role.run_stop_share_dl,
        ballHawkShareDB: role.ball_hawk_share_db,
        coverageShareDB: role.coverage_share_db,
        drivesFaced: drv.drivesFaced,
        defStopsPunt: drv.defStopsPunt,
        defStopsTurnover: drv.defStopsTurnover,
        defStopsDowns: drv.defStopsDowns,
        defAllowedTD: drv.defAllowedTD,
        defAllowedFG: drv.defAllowedFG,
        defThreeAndOutsForced: drv.defThreeAndOutsForced,

        // ── Turnovers ──
        turnoversCommitted: box.turnovers_committed,
        turnoversForced: box.turnovers_forced,
        expectedTurnovers: adv.expected_turnovers,
        actualTurnovers: adv.actual_turnovers,
        turnoverLuck: adv.turnover_luck,
        turnoverScoreRate: seq.turnover_score_rate,
        turnoverTDCount: seq.turnover_td_count,
        turnoverTDRate: seq.turnover_td_rate,
        suddenChangeDefense: seq.sudden_change_defense,
        stabilizationAfterExplosive: seq.stabilization_after_explosive_allowed,

        // ── Special Teams ──
        st: {
          fgAtt: stFg.attempts, fgMade: stFg.made, fgLong: stFg.long, fgBlocked: stFg.blocked, fgEpa: stFg.epa_per_attempt,
          patAtt: stPat.attempts, patMade: stPat.made, twoAtt: st2.attempts, twoMade: st2.made,
          punts: stPunt.punts, puntGross: stPunt.avg_gross, puntNet: stPunt.avg_net, puntIn20: stPunt.inside_20,
          puntRetAllowed: stPunt.avg_return_allowed, puntStartAllowed: stPunt.avg_start_allowed, puntEpa: stPunt.epa_per_punt,
          kickoffs: stKo.kickoffs, koTouchbacks: stKo.touchbacks, koDistance: stKo.avg_kick_distance,
          koRetAllowed: stKo.avg_return_allowed, koStartAllowed: stKo.avg_start_allowed, koEpa: stKo.epa_per_kick,
          krReturns: stKr.returns, krAvg: stKr.avg_return, krTd: stKr.touchdowns,
          prReturns: stPr.returns, prAvg: stPr.avg_return, prTd: stPr.touchdowns,
        },
        stPlayCount: stSummary.st_play_count,
        stSwingYards: stSummary.st_swing_yards,
        stHiddenYards: adv.special_teams_hidden_yards,
        stPenaltyYardsCost: stSummary.penalty_yards_cost,
        fgAttempts: fgOff.attempts,
        fgMade: fgOff.made,
        fgPct: fgOff.pct,
        fgLong: fgOff.long,
        fgBlocked: fgOff.blocked,
        fgByRange: fgOff.by_range,
        kickerTrustRange: fgOff.kicker_talent_trust_range,
        coachAggressionThreshold: fgOff.coach_aggression_threshold,
        puntAttempts: puntOff.attempts,
        puntAvgGross: puntOff.avg_gross_yards,
        puntInside20Rate: puntOff.inside_20_rate,
        puntInside10Rate: puntOff.inside_10_rate,
        puntBlockRate: puntOff.block_rate,
        puntFairCatchRate: puntOff.fair_catch_rate,
        puntDownedCount: puntOff.downed_count,
        puntDefenseAttempts: puntDef.attempts,
        puntDefenseReturnRate: puntDef.return_rate,
        puntDefenseAvgReturn: puntDef.avg_return_yards,
        puntDefenseNYOE: puntDef.nyoe,
        koAttempts: koOff.attempts,
        koTouchbackRate: koOff.touchback_rate,
        koOutOfBounds: koOff.out_of_bounds_count,
        koAvgStartAllowed: koOff.avg_start_allowed,
        koESPA: koOff.espa,
        koDefenseAttempts: koDef.attempts,
        koDefenseReturnRate: koDef.return_rate,
        koDefenseAvgReturn: koDef.avg_return_yards,
        koDefenseExplosives: koDef.explosives,
        koDefenseTurnovers: koDef.turnovers_forced,
        patAttempts: patOff.attempts,
        patMade: patOff.made,
        patPct: patOff.pct,
        patBlocked: patOff.blocked,
        patDefenseAttempts: patDef.attempts_against,
        patDefenseMade: patDef.made_against,
        patDefenseBlocks: patDef.blocks,

        // ── Penalties ──
        penaltiesCommitted: box.penalties,
        penaltyYardsCommitted: box.penalty_yards,
        penaltiesAccepted: pen.total_accepted,
        penaltyYards: pen.total_yards,
        penaltyRate: pen.penalty_rate,
        preSnapRate: pen.pre_snap_rate,
        liveBallRate: pen.live_ball_rate,
        highLeveragePenalties: pen.high_leverage_count,
        driveKills: pen.drive_kill_count,
        driveExtends: pen.drive_extend_count,
        hiddenYardageLost: pen.hidden_yardage_lost,
        hiddenYardageGained: pen.hidden_yardage_gained,
        autoFirstDownsGiven: pen.auto_first_downs_given,
        autoFirstOnCritical: pen.auto_first_on_critical_down,
        falseStart3rdDown: pen.false_start_3rd_down,
        holdingOnPassingDown: pen.holding_on_passing_down,
        penaltiesInRedZone: pen.in_red_zone,
        penaltiesInClutch: pen.in_clutch_time,
        penaltiesOn3rd: pen.on_3rd_down,
        penaltiesOn4th: pen.on_4th_down,
        acceptedPenaltyEPA: pen.accepted_penalty_epa_sum,
        drivesWithPenalty: pen.drives_with_accepted_penalty,
        repeatOffenders: pen.repeat_offender_players,
        topPenaltyTypes: pen.top_penalty_types,
        yardsPerGame: pen.yards_per_game,

        // ── Coaching ──
        firstDownRunRate: rpd["1"]?.run_rate,
        secondDownRunRate: rpd["2"]?.run_rate,
        thirdDownRunRate: rpd["3"]?.run_rate,
        firstDownRuns: rpd["1"]?.runs,
        firstDownPasses: rpd["1"]?.passes,
        redZoneRunRate: coach.red_zone_tendency?.run_rate,
        redZoneRuns: coach.red_zone_tendency?.runs,
        redZonePasses: coach.red_zone_tendency?.passes,
        obviousPassSuccess: coach.obvious_situation_execution?.obvious_pass_success_rate,
        obviousRunSuccess: coach.obvious_situation_execution?.obvious_run_success_rate,
        predictabilityIndex: coach.predictability_index,
        halftimeAdjustment: coach.halftime_adjustment?.adjustment_delta,
        h1SuccessRate: coach.halftime_adjustment?.h1_success_rate,
        h2SuccessRate: coach.halftime_adjustment?.h2_success_rate,
        shortYardageTendency: coach.short_yardage_tendency?.run_rate,
        efficiencyByDown: coach.efficiency_by_down_call,

        // ── Sequence ──
        after3AndOut: seq.after_3_and_out,
        afterOwnTurnover: seq.after_own_turnover,
        maxConsecutiveScoringDrives: seq.max_consecutive_scoring_drives,
        q4GoAheadDrives: seq.q4_go_ahead_drives,
        q4LeadChanges: seq.q4_lead_changes,
        q4LeadTakes: seq.q4_lead_takes,
      };
    };

    return {
      away: buildTeam(aClean, hClean, aPBP, aDrives),
      home: buildTeam(hClean, aClean, hPBP, hDrives),
      meta: {
        schema: game._schema,
        playCount: game.enrichment_summary?.play_count,
        driveCount: game.enrichment_summary?.drive_count,
        enrichmentVersion: game.enrichment_summary?.enrichment_version,
        generatedAt: game.enrichment_summary?.generated_at,
      },
    };
  }, [game, awayId, homeId]);
};
