import { cleanName } from "./playerProductionModel";

// Existing implementation extracted from GameSummaryTabV2.

// ═══════════════════════════════════════════════════════════════════════════════
// 6.5 GAME FACTOIDS — Rotating "quick at-a-glance" story card (compact density only)
// See Game Page Design Doc §5.13 for the full concept and what's still a stopgap.
// ═══════════════════════════════════════════════════════════════════════════════
const resolveFactoidTeam = (rawId, awayId, homeId, awayLabel, homeLabel) => {
  if (!rawId) return null;
  const norm = String(rawId).replace(/25$/, "").toLowerCase();
  if (norm === String(awayId).toLowerCase() || norm.includes(String(awayLabel).toLowerCase())) return "away";
  if (norm === String(homeId).toLowerCase() || norm.includes(String(homeLabel).toLowerCase())) return "home";
  return null;
};

const ordinal = (n) => {
  const v = Number(n);
  if (!v) return null;
  const s = ["th", "st", "nd", "rd"];
  const r = v % 100;
  return `${v}${s[(r - 20) % 10] || s[r] || s[0]}`;
};

export const computeGameFactoids = (plays, awayId, homeId, awayLabel, homeLabel) => {
  const factoids = [];

  // 1. Largest single play — scan RUSH/PASS plays for the biggest positive gain, with full context.
  let biggest = null;
  plays.forEach((play) => {
    if (play.play_type !== "RUSH" && play.play_type !== "PASS") return;
    const action = (play.actions || [])[0];
    const yards = action?.net_yards || 0;
    if (yards <= 0) return;
    if (!biggest || yards > biggest.yards) {
      const player = play.play_type === "RUSH" ? action?.rusher : (action?.receiver || action?.passer);
      const side = resolveFactoidTeam(play.offense_team, awayId, homeId, awayLabel, homeLabel);
      biggest = {
        yards,
        player,
        side,
        type: play.play_type,
        quarter: play.quarter,
        down: play.down,
        distance: play.distance,
        isComplete: action?.isComplete,
        isScoring: play.scoring_event === true,
        isTurnover: play.turnover === true,
      };
    }
  });
  if (biggest) {
    const downDistance = biggest.down && biggest.distance != null ? `${ordinal(biggest.down)} & ${biggest.distance}` : null;
    const contextLine = [biggest.quarter ? `Q${biggest.quarter}` : null, downDistance].filter(Boolean).join(" · ");
    const playLabel = biggest.type === "RUSH" ? "Rush" : "Pass";
    const resultTag = biggest.isScoring ? "TOUCHDOWN" : biggest.isTurnover ? "TURNOVER" : null;
    const playerLine = [playLabel, biggest.player ? cleanName(biggest.player) : "Unknown"].join(" — ");
    factoids.push({
      key: "biggest-play",
      label: "Big Play",
      variant: "spotlight",
      title: "Largest Play",
      headline: `${biggest.yards} YDS`,
      contextLine,
      playerLine,
      resultTag,
      side: biggest.side,
    });
  }

  // 2. Explosive play differential — 20+ yard gains on RUSH/PASS, counted per side.
  let awayExplosive = 0;
  let homeExplosive = 0;
  plays.forEach((play) => {
    if (play.play_type !== "RUSH" && play.play_type !== "PASS") return;
    const yards = (play.actions || [])[0]?.net_yards || 0;
    if (yards < 20) return;
    const side = resolveFactoidTeam(play.offense_team, awayId, homeId, awayLabel, homeLabel);
    if (side === "away") awayExplosive += 1;
    else if (side === "home") homeExplosive += 1;
  });
  if (awayExplosive || homeExplosive) {
    factoids.push({
      key: "explosive",
      label: "Explosive",
      variant: "compare",
      title: "Explosive Plays (20+ yds)",
      awayValue: awayExplosive,
      homeValue: homeExplosive,
      lowerIsBetter: false,
    });
  }

  // 3. Penalties/discipline — team attribution is a regex stopgap on raw_text (see design doc P1).
  let awayPenalties = 0;
  let homePenalties = 0;
  let unattributed = 0;
  plays.forEach((play) => {
    if (play.play_type !== "PENALTY") return;
    const match = String(play.raw_text || "").match(/PENALTY\s+(\S+)/i);
    const side = match ? resolveFactoidTeam(match[1], awayId, homeId, awayLabel, homeLabel) : null;
    if (side === "away") awayPenalties += 1;
    else if (side === "home") homePenalties += 1;
    else unattributed += 1;
  });
  const totalPenalties = awayPenalties + homePenalties + unattributed;
  if (totalPenalties > 0) {
    factoids.push({
      key: "penalties",
      label: "Discipline",
      variant: "compare",
      title: "Penalties",
      awayValue: awayPenalties,
      homeValue: homePenalties,
      lowerIsBetter: true,
    });
  }

  return factoids;
};
