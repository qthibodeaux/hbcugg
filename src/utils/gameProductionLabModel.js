import teamsData from "../data/teams.json";
import { getLastName } from "../components/molecules/game/productionLab/productionNames";

// Existing implementation extracted along responsibility boundaries.

const TEAM_META = teamsData.teams.reduce((acc, team) => {
  acc[team.id] = team;
  acc[team.exportId] = team;
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

export const resolveTeamId = (teamId) => {
  if (!teamId) return "";
  if (typeof teamId === "object") {
    return teamId.team_id || teamId.id || teamId.exportId || "";
  }
  return String(teamId);
};

export const getTeam = (id) => TEAM_META[resolveTeamId(id)] ?? {};

export const getPassingSplits = (game, teamId, totalComps, totalAtts, totalYards, totalINTs) => {
  const plays = game?.play_by_play ?? [];

  let stdComps = 0, stdAtts = 0, stdYards = 0, stdInts = 0;
  let passComps = 0, passAtts = 0, passYards = 0, passInts = 0;

  plays.forEach(p => {
    const pTeam = String(p.base?.offense_team ?? p.offense_team ?? "").toLowerCase();
    const targetTeam = String(teamId ?? "").toLowerCase();
    const isOffense = pTeam === targetTeam && targetTeam !== "";
    const isPass = String(p.base?.play_type ?? p.play_type ?? "").toUpperCase() === "PASS";

    if (isOffense && isPass) {
      const isStd = p.enriched?.derived?.standard_down || p.play_advanced?.situational?.standard_down || false;

      const yards = p.state_after?.yards_gained ?? p.yards_gained ?? 0;
      let complete = false;
      let intercepted = false;

      const actions = p.actions ?? [];
      actions.forEach(act => {
        if (act.type === "PASS") {
          complete = act.complete || act.is_complete || (act.receiver !== undefined && !act.interception);
          intercepted = act.interception || act.is_intercepted || false;
        }
      });

      if (isStd) {
        stdAtts++;
        if (complete) stdComps++;
        stdYards += yards;
        if (intercepted) stdInts++;
      } else {
        passAtts++;
        if (complete) passComps++;
        passYards += yards;
        if (intercepted) passInts++;
      }
    }
  });

  if (stdAtts === 0 && passAtts === 0) {
    stdComps = Math.round(totalComps * 0.55);
    stdAtts = Math.round(totalAtts * 0.55);
    stdYards = Math.round(totalYards * 0.52);
    stdInts = Math.round(totalINTs * 0.3);

    passComps = Math.max(0, totalComps - stdComps);
    passAtts = Math.max(0, totalAtts - stdAtts);
    passYards = Math.max(0, totalYards - stdYards);
    passInts = Math.max(0, totalINTs - stdInts);
  }

  return {
    total: { cmp: totalComps, att: totalAtts, yds: totalYards, int: totalINTs },
    standard: { cmp: stdComps, att: stdAtts, yds: stdYards, int: stdInts },
    passing: { cmp: passComps, att: passAtts, yds: passYards, int: passInts }
  };
};

export const getRushingPlaybookMetrics = (game, teamId, rushers, totalCarries, totalYards, totalYpc, totalLineYards) => {
  const plays = game?.play_by_play ?? [];
  let rushPlays = 0;
  let totalRushEpa = 0;
  let maxLongestRun = 0;
  let firstDownsRushing = 0;
  let explosiveRunsCount = 0;
  let calculatedSuccesses = 0;

  plays.forEach(p => {
    const pOff = String(p.base?.offense_team ?? p.offense_team ?? "").toLowerCase();
    const targetTeam = String(teamId ?? "").toLowerCase();
    if (pOff === targetTeam && targetTeam !== "") {
      const playType = String(p.base?.play_type ?? p.play_type ?? "").toUpperCase();
      const isRush = playType === "RUSH" || playType === "RUSHING";
      if (isRush) {
        const epa = Number(p.enriched?.derived?.epa ?? p.play_advanced?.epa ?? 0);
        if (!isNaN(epa)) {
          totalRushEpa += epa;
          rushPlays++;
        }

        const yards = Number(p.state_after?.yards_gained ?? p.yards_gained ?? 0);
        if (!isNaN(yards)) {
          if (yards > maxLongestRun) {
            maxLongestRun = yards;
          }
          if (yards >= 10) {
            explosiveRunsCount++;
          }
        }

        const down = p.base?.down ?? p.down ?? 1;
        const distance = p.base?.distance ?? p.distance ?? 10;
        const isSuccess = p.enriched?.derived?.success || p.play_advanced?.success || (
          down === 1 ? yards >= distance * 0.5 :
          down === 2 ? yards >= distance * 0.7 :
          yards >= distance
        );

        if (isSuccess) {
          calculatedSuccesses++;
        }

        const isFirstDown = p.state_after?.down === 1 || p.state_after?.first_down || p.enriched?.derived?.is_first_down || yards >= distance;
        if (isFirstDown) {
          firstDownsRushing++;
        }
      }
    }
  });

  const carries = totalCarries > 0 ? totalCarries : (rushPlays > 0 ? rushPlays : 25);
  const yards = totalYards > 0 ? totalYards : 100;
  const ypc = totalCarries > 0 ? totalYards / totalCarries : (rushPlays > 0 ? yards / carries : 4.0);
  const tds = rushers.reduce((s, r) => s + (r.touchdowns || r.tds || 0), 0);
  const longest = maxLongestRun > 0 ? maxLongestRun : Math.round(ypc * 4.5);

  const successes = calculatedSuccesses > 0 ? calculatedSuccesses : Math.round(carries * 0.42);
  const successPct = carries > 0 ? (successes / carries) * 100 : 42;
  const firstDowns = firstDownsRushing > 0 ? firstDownsRushing : Math.round(carries * 0.24);
  const explosives = explosiveRunsCount > 0 ? explosiveRunsCount : Math.round(carries * 0.12);

  let epaPerRush = rushPlays > 0 ? totalRushEpa / rushPlays : Number(game?.advanced_team?.[teamId]?.epa_per_rush ?? 0.05);
  if (isNaN(epaPerRush)) {
    epaPerRush = 0.05;
  }

  const lineYards = totalLineYards > 0 ? totalLineYards : Math.round(yards * 0.45);
  const lineYardsPerCarry = carries > 0 ? lineYards / carries : 1.8;
  const highlightYards = Math.max(0, yards - lineYards);
  const highlightYpc = carries > 0 ? highlightYards / carries : 0.8;

  const stuffRate = game?.advanced_team?.[teamId]?.stuff_rate
    ? game.advanced_team[teamId].stuff_rate * 100
    : 18;
  const opportunityRate = game?.advanced_team?.[teamId]?.rush_opportunity_rate
    ? game.advanced_team[teamId].rush_opportunity_rate * 100
    : 30;

  return {
    totals: [
      { val: carries, unit: "ru" },
      { val: yards, unit: "yds" },
      { val: ypc.toFixed(1), unit: "ypc" },
      { val: tds, unit: "td" },
      { val: longest, unit: "lg" }
    ],
    shared: [
      { val: successes, unit: "succ" },
      { val: `${successPct.toFixed(0)}%`, unit: "sr" },
      { val: firstDowns, unit: "fd" },
      { val: explosives, unit: "expl" },
      { val: epaPerRush.toFixed(2), unit: "epa" }
    ],
    rbCreated: [
      { val: highlightYards.toFixed(0), unit: "hl yds" },
      { val: highlightYpc.toFixed(1), unit: "hl ypc" },
      { val: Math.round(carries * (opportunityRate/100)), unit: "opp" },
      { val: Math.round(carries * 0.22), unit: "mt" },
      { val: Math.round(yards * 0.58), unit: "yac" }
    ],
    olEarned: [
      { val: lineYards.toFixed(0), unit: "line yds" },
      { val: lineYardsPerCarry.toFixed(1), unit: "lypc" },
      { val: Math.round(yards * 0.28), unit: "2nd lvl" },
      { val: Math.round(yards * 0.17), unit: "open" },
      { val: `${stuffRate.toFixed(0)}%`, unit: "stuff" }
    ]
  };
};

export const getPassSectors = (player, isReceiving = false) => {
  const comps = isReceiving ? (player.receptions || 0) : (player.completions || 0);
  const atts = isReceiving ? (player.targets || 0) : (player.attempts || 0);
  const yds = player.yards || 0;

  return {
    deep: {
      left: { completions: Math.round(comps * 0.1), attempts: Math.max(Math.round(comps * 0.1), Math.round(atts * 0.12)), yards: Math.round(yds * 0.25) },
      middle: { completions: Math.round(comps * 0.05), attempts: Math.max(Math.round(comps * 0.05), Math.round(atts * 0.08)), yards: Math.round(yds * 0.15) },
      right: { completions: Math.round(comps * 0.1), attempts: Math.max(Math.round(comps * 0.1), Math.round(atts * 0.15)), yards: Math.round(yds * 0.2) }
    },
    medium: {
      left: { completions: Math.round(comps * 0.15), attempts: Math.max(Math.round(comps * 0.15), Math.round(atts * 0.18)), yards: Math.round(yds * 0.15) },
      middle: { completions: Math.round(comps * 0.1), attempts: Math.max(Math.round(comps * 0.1), Math.round(atts * 0.12)), yards: Math.round(yds * 0.1) },
      right: { completions: Math.round(comps * 0.15), attempts: Math.max(Math.round(comps * 0.15), Math.round(atts * 0.15)), yards: Math.round(yds * 0.1) }
    },
    short: {
      left: { completions: Math.round(comps * 0.15), attempts: Math.max(Math.round(comps * 0.15), Math.round(atts * 0.12)), yards: Math.round(yds * 0.03) },
      middle: { completions: Math.round(comps * 0.1), attempts: Math.max(Math.round(comps * 0.1), Math.round(atts * 0.05)), yards: Math.round(yds * 0.01) },
      right: { completions: Math.round(comps * 0.1), attempts: Math.max(Math.round(comps * 0.1), Math.round(atts * 0.03)), yards: Math.round(yds * 0.01) }
    }
  };
};

export const getRushLanes = (player, game) => {
  const lanes = {
    left: { attempts: 0, yards: 0, success: 0, powerRuns: 0, powerSuccess: 0, stuffed: 0, stopped: 0, lineYards: 0, opportunity: 0 },
    middle: { attempts: 0, yards: 0, success: 0, powerRuns: 0, powerSuccess: 0, stuffed: 0, stopped: 0, lineYards: 0, opportunity: 0 },
    right: { attempts: 0, yards: 0, success: 0, powerRuns: 0, powerSuccess: 0, stuffed: 0, stopped: 0, lineYards: 0, opportunity: 0 },
  };

  const plays = game?.play_by_play ?? [];
  plays.forEach(p => {
    const playType = String(p.base?.play_type ?? p.play_type ?? "").toUpperCase();
    if (playType === "RUSH" || playType === "RUSHING") {
      const actions = p.actions ?? [];
      let isCurrentRusher = false;
      let rushDir = "middle";
      let yards = Number(p.state_after?.yards_gained ?? p.yards_gained ?? 0);
      if (isNaN(yards)) yards = 0;

      actions.forEach(act => {
        if (act.type === "RUSH") {
          const rusherObj = act.rusher;
          let rusherName = "";
          if (typeof rusherObj === "string") {
            rusherName = rusherObj;
          } else if (rusherObj && typeof rusherObj === "object") {
            rusherName = rusherObj.name || rusherObj.name_raw || "";
          }

          if (rusherName && player.name && (
            String(rusherName).toLowerCase().includes(String(player.name).toLowerCase()) ||
            String(player.name).toLowerCase().includes(String(rusherName).toLowerCase()) ||
            getLastName(player.name).toLowerCase() === getLastName(rusherName).toLowerCase()
          )) {
            isCurrentRusher = true;
          }
          rushDir = String(act.rushDirection || "middle").toLowerCase();
        }
      });

      if (isCurrentRusher) {
        const laneKey = rushDir.includes("left") ? "left" : rushDir.includes("right") ? "right" : "middle";
        const lane = lanes[laneKey];

        lane.attempts += 1;
        lane.yards += yards;

        const down = p.base?.down ?? p.down ?? 1;
        const distance = p.base?.distance ?? p.distance ?? 10;
        const isSuccess = p.enriched?.derived?.success || p.play_advanced?.success || (
          down === 1 ? yards >= distance * 0.5 :
          down === 2 ? yards >= distance * 0.7 :
          yards >= distance
        );
        if (isSuccess) {
          lane.success += 1;
        } else {
          lane.stopped += 1;
        }

        if (yards <= 0) {
          lane.stuffed += 1;
        }

        const isPower = (down >= 3 && distance <= 2) || (p.base?.yardline <= 2);
        if (isPower) {
          lane.powerRuns += 1;
          if (yards >= distance || yards > 0) {
            lane.powerSuccess += 1;
          }
        }

        let ly = 0;
        if (yards <= 0) {
          ly = yards;
        } else if (yards <= 4) {
          ly = yards;
        } else if (yards <= 10) {
          ly = 4 + (yards - 4) * 0.5;
        } else {
          ly = 7;
        }
        lane.lineYards += ly;

        if (yards >= 4) {
          lane.opportunity += 1;
        }
      }
    }
  });

  const atts = player.attempts || 0;
  const yds = player.yards || 0;
  const success = player.successRuns || Math.round(atts * 0.4);
  const stuffed = player.stuffedRuns || Math.round(atts * 0.18);
  const opp = player.opportunityRuns || Math.round(atts * 0.28);
  const power = Math.max(1, Math.round(atts * 0.15));

  ["left", "middle", "right"].forEach(k => {
    const lane = lanes[k];
    if (lane.attempts === 0) {
      const share = k === "left" ? 0.3 : k === "middle" ? 0.5 : 0.2;
      lane.attempts = Math.round(atts * share);
      lane.yards = Math.round(yds * share);
      lane.success = Math.round(success * share);
      lane.stuffed = Math.round(stuffed * share);
      lane.opportunity = Math.round(opp * share);
      lane.powerRuns = Math.round(power * share);
      lane.powerSuccess = Math.round(lane.powerRuns * 0.6);
      lane.stopped = Math.max(0, lane.attempts - lane.success);
      lane.lineYards = Math.round(lane.yards * 0.45);
    }
  });

  return lanes;
};

export const normalizeStatsList = (statsField) => {
  if (!statsField) return [];
  const rawList = Array.isArray(statsField) ? statsField : Object.values(statsField);
  return rawList.map((p, idx) => ({
    ...p,
    name: p.name ?? p.name_raw ?? "Unknown",
    player_key: p.player_key ?? p.player_id ?? `p-${idx}`,
  }));
};

export const getDefenseMetricGrade = (label, val) => {
  if (label === "Havoc Rate") {
    if (val >= 0.18) return { grade: "A", color: "#48BB78" };
    if (val >= 0.14) return { grade: "B", color: "#63B3ED" };
    if (val >= 0.10) return { grade: "C", color: "#ECC94B" };
    if (val >= 0.07) return { grade: "D", color: "#ED8936" };
    return { grade: "F", color: "#E53E3E" };
  }
  if (label === "Stuff Rate") {
    if (val >= 0.25) return { grade: "A", color: "#48BB78" };
    if (val >= 0.20) return { grade: "B", color: "#63B3ED" };
    if (val >= 0.15) return { grade: "C", color: "#ECC94B" };
    if (val >= 0.10) return { grade: "D", color: "#ED8936" };
    return { grade: "F", color: "#E53E3E" };
  }
  if (label === "Stop Rate") {
    if (val >= 0.65) return { grade: "A", color: "#48BB78" };
    if (val >= 0.58) return { grade: "B", color: "#63B3ED" };
    if (val >= 0.50) return { grade: "C", color: "#ECC94B" };
    if (val >= 0.40) return { grade: "D", color: "#ED8936" };
    return { grade: "F", color: "#E53E3E" };
  }
  if (label === "Early Down Stop") {
    if (val >= 0.75) return { grade: "A", color: "#48BB78" };
    if (val >= 0.70) return { grade: "B", color: "#63B3ED" };
    if (val >= 0.65) return { grade: "C", color: "#ECC94B" };
    if (val >= 0.55) return { grade: "D", color: "#ED8936" };
    return { grade: "F", color: "#E53E3E" };
  }
  if (label === "3rd Down Stop") {
    if (val >= 0.75) return { grade: "A", color: "#48BB78" };
    if (val >= 0.68) return { grade: "B", color: "#63B3ED" };
    if (val >= 0.60) return { grade: "C", color: "#ECC94B" };
    if (val >= 0.50) return { grade: "D", color: "#ED8936" };
    return { grade: "F", color: "#E53E3E" };
  }
  return { grade: "B", color: "#63B3ED" };
};
