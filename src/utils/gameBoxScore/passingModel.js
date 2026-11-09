import { getTeamName, getTeamColor, getTeamSecondary, getTeamDisplayName } from "./teamIdentity";
import { normalizeStatsList, isMatch } from "./statHelpers";

// Existing passing model, extracted unchanged. Legacy grid reconstruction and fallback values remain; see QGameBoxScore Cleanup.md.

const derivePassingGrids = (playByPlay) => {
  const grids = {};
  (playByPlay ?? []).forEach((play) => {
    if (play.play_type !== "PASS") return;
    const action = play.actions?.[0];
    if (!action || action.type !== "PASS") return;
    const team = play.offense_team ? String(play.offense_team).replace(/25$/, "") : null;
    if (!team) return;
    const depth = action.passDepth;
    const isComplete = action.isComplete;
    const yards = action.net_yards || 0;
    const dirMatch = play.raw_text?.match(/(short|deep|medium)\s+(left|middle|right)/i);
    const direction = dirMatch ? dirMatch[2].toLowerCase() : "middle";

    const passerObj = action.passer;
    const receiverObj = action.receiver;
    const passerName = passerObj?.name_raw || passerObj?.name || (typeof passerObj === "string" ? passerObj : null);
    const receiverName = receiverObj?.name_raw || receiverObj?.name || (typeof receiverObj === "string" ? receiverObj : null);

    [
      { name: passerName, role: "passer" },
      { name: receiverName, role: "receiver" }
    ].forEach((pInfo) => {
      const player = pInfo.name;
      if (!player) return;
      if (!grids[team]) grids[team] = {};
      if (!grids[team][player]) grids[team][player] = {};
      if (!grids[team][player][depth]) grids[team][player][depth] = {};
      if (!grids[team][player][depth][direction]) grids[team][player][depth][direction] = { comp: 0, att: 0, yards: 0 };
      grids[team][player][depth][direction].att += 1;
      if (isComplete) grids[team][player][depth][direction].comp += 1;
      grids[team][player][depth][direction].yards += yards;
    });
  });
  return grids;
};

export const buildPassingData = (game, teamId) => {
  const stats = game?.individual_stats?.[teamId];
  if (!stats) return null;

  const awayId = game?.metadata?.away_team;
  const homeId = game?.metadata?.home_team;
  const oppTeamId = teamId === awayId ? homeId : awayId;

  const advancedOpp = game?.game_advanced?.team_advanced?.[oppTeamId] ?? {};
  const defId = advancedOpp.defensive_identity ?? {};
  const havoc = advancedOpp.havoc ?? {};

  const oppDefense = {
    teamId: oppTeamId,
    shortName: getTeamName(oppTeamId),
    colors: { primary: getTeamColor(oppTeamId), secondary: getTeamSecondary(oppTeamId) },
    disruption_rate: defId.disruption_rate ?? 0.13,
    explosive_prevention: defId.explosive_prevention_rate ?? 0.86,
    havoc_rate: havoc.havoc_rate_forced ?? 0.13,
    sack_rate: havoc.sack_rate_forced ?? 0.01,
    ypp: defId.yards_per_pass_allowed ?? 7.0,
    bdb: defId.batted_down_balls ?? defId.pass_breakups ?? 14,
    tfl: havoc.tfl_forced ?? 9.5,
    pd: havoc.passes_defended_forced ?? defId.passes_defended ?? 4,
  };

  const passingRaw = normalizeStatsList(stats.passing);
  const passing = passingRaw.filter((p) => p.name !== "TEAM");
  const receiving = normalizeStatsList(stats.receiving);
  const grids = derivePassingGrids(game.play_by_play);
  const teamGrids = grids[teamId] ?? {};

  const findGridForPlayer = (playerName, tGrids) => {
    const matchKey = Object.keys(tGrids).find(key => isMatch(key, playerName));
    return matchKey ? tGrids[matchKey] : {};
  };

  const passers = passing.map((p) => {
    const attempts = p.attempts ?? 0;
    const completions = p.completions ?? 0;
    const yards = p.yards ?? 0;
    const sacks = p.sacks_taken ?? 0;
    const sackYards = p.sack_yards_lost ?? 0;
    // Two schema halves, neither complete. `third_down_breakdown` and
    // `depth_breakdown` ship on every 2019-2025 passing row and are absent from
    // 2026's; `epa_per_play` is the reverse — 2026 only. Each reads as null on
    // the season that doesn't carry it rather than being counted back out of the
    // raw plays. See STATS_HUB_CARD_INVENTORY.md.
    const thirdDown = p.third_down_breakdown ?? null;
    const deep = p.depth_breakdown?.deep ?? null;
    return {
      key: p.player_key,
      name: p.name,
      attempts,
      completions,
      yards,
      touchdowns: p.touchdowns ?? 0,
      interceptions: p.interceptions ?? 0,
      sacks_taken: sacks,
      sack_yards_lost: sackYards,
      compRate: attempts > 0 ? completions / attempts : 0,
      // SP+ charges sacks and their yardage to the pass game, so this is not the
      // export's plain `yards_per_attempt`.
      ydsPerAtt: attempts + sacks > 0 ? (yards - sackYards) / (attempts + sacks) : 0,
      epaPerPlay: p.epa_per_play ?? null,
      epaTotal: p.epa_total ?? null,
      // The export's plain yards per attempt and aDOT, for the roster table.
      ypa: p.yards_per_attempt ?? (attempts > 0 ? yards / attempts : null),
      adot: p.adot ?? null,
      // Not shipped by any export in any season, and not being counted off the
      // raw plays. Reads null until the backend provides it.
      successRate: p.success_rate ?? null,
      thirdDownRate: thirdDown?.attempts > 0 ? thirdDown.completions / thirdDown.attempts : null,
      deepAttempts: deep?.attempts ?? null,
      deepCompletions: deep?.completions ?? null,
      grid: findGridForPlayer(p.name, teamGrids),
    };
  });

  // Receiving success rate and EPA are not on the receiving row in any season and are
  // not counted off the raw plays here — they read null (LAUNCH_0_BACKEND_NOTES.md,
  // Game Page) and fill in when the backend ships them.
  const receivers = receiving.map((r) => {
    const targets = r.targets ?? 0;
    const receptions = r.receptions ?? 0;
    const yards = r.yards ?? 0;
    return {
      key: r.player_key,
      name: r.name,
      targets,
      receptions,
      yards,
      touchdowns: r.touchdowns ?? 0,
      catchRate: r.catch_rate ?? (targets > 0 ? receptions / targets : 0),
      ydsPerCatch: r.yards_per_reception ?? (receptions > 0 ? yards / receptions : 0),
      ydsPerTarget: r.yards_per_target ?? (targets > 0 ? yards / targets : 0),
      successRate: r.success_rate ?? null,
      epaTotal: r.epa_total ?? null,
      epaPerTarget: r.epa_per_target ?? r.epa_per_play ?? null,
      // Backend-provided, none of it shipping yet on any season — checked across
      // 13,004 receiving rows, 2019-2026. Each reads null and dashes out rather
      // than being reassembled from raw plays. See STATS_HUB_CARD_INVENTORY.md.
      yardsAfterCatch: r.yards_after_catch ?? null,
      yacPerReception: r.yards_after_catch_per_reception ?? null,
      firstDownReceptions: r.first_down_receptions ?? null,
      explosiveReceptions: r.explosive_receptions ?? null,
      thirdDownReceptions: r.third_down_receptions ?? null,
      grid: findGridForPlayer(r.name, teamGrids),
    };
  });

  const teamRow = passingRaw.find((p) => p.name === "TEAM");
  const teamTotal = {
    attempts: teamRow?.attempts ?? passers.reduce((s, p) => s + p.attempts, 0),
    completions: teamRow?.completions ?? passers.reduce((s, p) => s + p.completions, 0),
    yards: teamRow?.yards ?? passers.reduce((s, p) => s + p.yards, 0),
    touchdowns: teamRow?.touchdowns ?? passers.reduce((s, p) => s + p.touchdowns, 0),
    interceptions: teamRow?.interceptions ?? passers.reduce((s, p) => s + p.interceptions, 0),
    sacks: teamRow?.sacks_taken ?? passers.reduce((s, p) => s + p.sacks_taken, 0),
    sackYards: teamRow?.sack_yards_lost ?? passers.reduce((s, p) => s + p.sack_yards_lost, 0),
  };

  const blankSplit = () => ({ comp: 0, att: 0, yards: 0, int: 0, sacks: 0, sackYards: 0 });
  const standardDowns = blankSplit();
  const passingDowns = blankSplit();
  (game.play_by_play ?? []).forEach((play) => {
    const cleanTeam = play.offense_team ? String(play.offense_team).replace(/25$/, "") : "";
    if (cleanTeam !== teamId) return;
    const isStd = play.down === 1 || (play.down === 2 && play.distance <= 8);
    const target = isStd ? standardDowns : passingDowns;

    // Sacks are their own play_type, not a PASS with a sack action, so they never
    // reached these splits before — which is why the INT and Sacks cells were dashes.
    if (play.play_type === "SACK") {
      const sack = (play.actions ?? []).find((a) => a.type === "SACK");
      target.sacks += 1;
      target.sackYards += Math.abs(sack?.net_yards ?? 0);
      return;
    }

    if (play.play_type !== "PASS") return;
    const action = play.actions?.[0];
    if (!action) return;
    target.att += 1;
    if (action.isComplete) target.comp += 1;
    target.yards += action.net_yards || 0;
    if ((play.actions ?? []).some((a) => a.type === "INTERCEPTION")) target.int += 1;
  });

  return {
    meta: {
      shortName: getTeamName(teamId),
      displayName: getTeamDisplayName(teamId),
      colors: { primary: getTeamColor(teamId), secondary: getTeamSecondary(teamId) },
    },
    passing: teamTotal,
    downSplit: { standard: standardDowns, passing: passingDowns },
    passers,
    receivers,
    oppDefense,
  };
};
