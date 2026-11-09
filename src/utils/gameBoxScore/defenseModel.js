import { normalizeStatsList } from "./statHelpers";
import { getTeamName, getTeamDisplayName, getTeamColor, getTeamSecondary, getTeamAccent } from "./teamIdentity";

// Existing defense model. Historical fallback values remain; the unused opponent-play counter was removed.

export const buildDefenseData = (game, teamId) => {
  const stats = game?.individual_stats?.[teamId];
  if (!stats) return null;

  const awayId = game?.metadata?.away_team;
  const homeId = game?.metadata?.home_team;
  const oppTeamId = teamId === awayId ? homeId : awayId;

  // Defensive individual list
  const defenseRaw = normalizeStatsList(stats.defense);
  const players = defenseRaw.filter((p) => p.name !== "TEAM");

  // Sum values from players list
  const tackles = players.reduce((sum, p) => sum + (p.tackles ?? 0), 0);
  const tfl = players.reduce((sum, p) => sum + (p.tfl ?? 0), 0);
  const sacks = players.reduce((sum, p) => sum + (p.sacks ?? 0), 0);
  const pd = players.reduce((sum, p) => sum + (p.passes_defended ?? 0), 0);
  const interceptions = players.reduce((sum, p) => sum + (p.interceptions ?? 0), 0);
  const ff = players.reduce((sum, p) => sum + (p.forced_fumbles ?? 0), 0);

  // Havoc is sum of disruptive actions
  const havocCreated = tfl + sacks + pd + interceptions + ff;

  // Scrimmage plays faced = opponent offensive attempts (passing attempts + rushing attempts)
  let scrimmagePlays = 0;
  const oppStats = game?.individual_stats?.[oppTeamId];
  if (oppStats) {
    const oppPassingRow = normalizeStatsList(oppStats.passing).find((p) => p.name === "TEAM");
    const oppRushingRow = normalizeStatsList(oppStats.rushing).find((p) => p.name === "TEAM");

    const oppPassAttempts = oppPassingRow?.attempts ?? normalizeStatsList(oppStats.passing).reduce((sum, p) => sum + (p.attempts ?? 0), 0);
    const oppRushAttempts = oppRushingRow?.attempts ?? normalizeStatsList(oppStats.rushing).reduce((sum, p) => sum + (p.attempts ?? 0), 0);

    scrimmagePlays = oppPassAttempts + oppRushAttempts;
  }
  if (!scrimmagePlays) {
    scrimmagePlays = tackles + pd + interceptions;
  }

  // Stop rate - from defensive identity or fallback
  const advancedTeam = game?.game_advanced?.team_advanced?.[teamId] ?? {};
  const stopRate = advancedTeam.defensive_identity?.stop_rate ?? 0.67;

  // ─── Play-by-play statistical calculations ───
  let oppRushPlays = 0;
  let stuffedRushPlays = 0;
  
  let stdStopPlays = 0;
  let stdTotalPlays = 0;
  let earlyDownStopPlays = 0;
  let earlyDownTotalPlays = 0;
  let thirdDownStopPlays = 0;
  let thirdDownTotalPlays = 0;
  
  let thirdDownDistancesSum = 0;
  let thirdDownPlaysCount = 0;
  let puntsForced = 0;

  (game.play_by_play ?? []).forEach((play) => {
    const cleanOffenseTeam = play.offense_team ? String(play.offense_team).replace(/25$/, "") : "";
    if (cleanOffenseTeam !== oppTeamId) return;

    const playType = play.play_type;
    const down = Number(play.down) || 0;
    const dist = Number(play.distance) || 0;
    const action = play.actions?.[0];
    const yards = Number(action?.net_yards ?? play.yards_gained ?? 0);
    
    if (playType === "PUNT") {
      puntsForced += 1;
    }
    
    if (playType === "PASS" || playType === "RUSH") {
      
      let isSuccess = false;
      if (down === 1) {
        isSuccess = yards >= Math.max(4, dist * 0.4);
      } else if (down === 2) {
        isSuccess = yards >= (dist * 0.6);
      } else if (down === 3 || down === 4) {
        isSuccess = yards >= dist;
      }
      
      const isStop = !isSuccess;
      
      if (isStop) {
        stdStopPlays += 1;
      }
      stdTotalPlays += 1;
      
      if (down === 1 || down === 2) {
        earlyDownTotalPlays += 1;
        if (isStop) earlyDownStopPlays += 1;
      }
      
      if (down === 3) {
        thirdDownTotalPlays += 1;
        if (isStop) thirdDownStopPlays += 1;
      }
      
      if (playType === "RUSH") {
        oppRushPlays += 1;
        if (yards <= 0) {
          stuffedRushPlays += 1;
        }
      }
    }
    
    if (down === 3) {
      thirdDownDistancesSum += dist;
      thirdDownPlaysCount += 1;
    }
  });

  // Chronological drive parser for three-and-outs
  let currentDrivePlays = [];
  let driveThreeAndOuts = 0;
  
  (game.play_by_play ?? []).forEach((play) => {
    const cleanOffenseTeam = play.offense_team ? String(play.offense_team).replace(/25$/, "") : "";
    if (cleanOffenseTeam !== oppTeamId) {
      if (currentDrivePlays.length > 0) {
        const playCount = currentDrivePlays.filter(p => p.play_type === "PASS" || p.play_type === "RUSH").length;
        const endedInPunt = currentDrivePlays.some(p => p.play_type === "PUNT");
        const gotFirstDown = currentDrivePlays.some(p => p.yards_gained >= p.distance || (p.actions?.[0]?.net_yards >= p.distance));
        
        if (playCount <= 3 && endedInPunt && !gotFirstDown) {
          driveThreeAndOuts += 1;
        }
        currentDrivePlays = [];
      }
      return;
    }
    currentDrivePlays.push(play);
  });
  
  if (currentDrivePlays.length > 0) {
    const playCount = currentDrivePlays.filter(p => p.play_type === "PASS" || p.play_type === "RUSH").length;
    const endedInPunt = currentDrivePlays.some(p => p.play_type === "PUNT");
    const gotFirstDown = currentDrivePlays.some(p => p.yards_gained >= p.distance || (p.actions?.[0]?.net_yards >= p.distance));
    
    if (playCount <= 3 && endedInPunt && !gotFirstDown) {
      driveThreeAndOuts += 1;
    }
  }

  // Advanced metrics and fallback defaults
  const calculatedHavocRate = scrimmagePlays > 0 ? (havocCreated / scrimmagePlays) : 0.15;
  const calculatedStuffRate = oppRushPlays > 0 ? (stuffedRushPlays / oppRushPlays) : 0.18;
  const calculatedStopRate = stdTotalPlays > 0 ? (stdStopPlays / stdTotalPlays) : stopRate;
  const calculatedEarlyDownStop = earlyDownTotalPlays > 0 ? (earlyDownStopPlays / earlyDownTotalPlays) : 0.71;
  const calculatedThirdDownStop = thirdDownTotalPlays > 0 ? (thirdDownStopPlays / thirdDownTotalPlays) : 0.65;
  const calculatedAvg3rdDistance = thirdDownPlaysCount > 0 ? (thirdDownDistancesSum / thirdDownPlaysCount) : 6.8;
  const turnoversForced = interceptions + ff;
  const finalThreeAndOuts = driveThreeAndOuts > 0 ? driveThreeAndOuts : Math.max(1, Math.round(puntsForced * 0.35));

  // Enrich player lists
  const enrichedPlayers = players.map((p) => {
    const pTfl = p.tfl ?? 0;
    const pSck = p.sacks ?? 0;
    const pPd = p.passes_defended ?? 0;
    const pInt = p.interceptions ?? 0;
    const pFf = p.forced_fumbles ?? 0;
    const pHavoc = pTfl + pSck + pPd + pInt + pFf;
    return {
      ...p,
      tackles: p.tackles ?? 0,
      tfl: pTfl,
      sacks: pSck,
      passes_defended: pPd,
      interceptions: pInt,
      forced_fumbles: pFf,
      havoc: pHavoc,
    };
  }).sort((a, b) => b.havoc - a.havoc || b.tackles - a.tackles);

  return {
    meta: {
      shortName: getTeamName(teamId),
      displayName: getTeamDisplayName(teamId),
      colors: { primary: getTeamColor(teamId), secondary: getTeamSecondary(teamId), accent: getTeamAccent(teamId) },
    },
    players: enrichedPlayers,
    totals: {
      scrimmagePlays,
      stopRate: calculatedStopRate,
      havocCreated,
      tfl,
      sacks,
      pd,
      interceptions,
      ff,
      havocRate: calculatedHavocRate,
      stuffRate: calculatedStuffRate,
      earlyDownStop: calculatedEarlyDownStop,
      thirdDownStop: calculatedThirdDownStop,
      avg3rdDistance: calculatedAvg3rdDistance,
      puntsForced: puntsForced > 0 ? puntsForced : 5,
      threeAndOuts: finalThreeAndOuts,
      turnoversForced: turnoversForced > 0 ? turnoversForced : (interceptions + ff || 1),
    }
  };
};
