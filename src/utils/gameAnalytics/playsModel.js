import { cleanTeamId, n, div } from "./numbers";

export const deriveFromPBP = (game, teamId) => {
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
