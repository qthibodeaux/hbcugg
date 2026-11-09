import { num, listWords, ordinal } from "./leaderboardPresentation";

// Leaderboard article field reads, number tiles, lead text and existing play selection rules.

export const pctOf = (v) => (v == null ? "—" : `${Math.round(v * 100)}%`);

const fix = (v, d = 1) => (v == null ? "—" : Number(v).toFixed(d));

const signedFix = (v, d = 2) => (v == null ? "—" : `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(d)}`);

export const lineOf = (game, r) => {
  const side = game?.individual_stats?.[r.team_id];
  if (!side) return null;
  const of = (key) => (side[key] ?? []).find((x) => x.player_key === r.person_id) ?? null;
  const pass = of("passing");
  const rush = of("rushing");
  const rec = of("receiving");
  if (r.position === "QB" && pass) return { role: "passing", line: pass, rush };
  if (rush && (!rec || rush.attempts >= rec.targets)) return { role: "rushing", line: rush };
  if (rec) return { role: "receiving", line: rec };
  return null;
};

export const NUMBERS = {
  rushing: (l) => [
    ["Carries", l.attempts], ["Yards", num(l.yards)], ["Yards / carry", fix(l.yards_per_carry)], ["Long", l.long], ["TD", l.touchdowns],
    ["Success rate", pctOf(l.success_rate)], ["Stuffed", `${l.stuffed_carries} · ${pctOf(l.stuff_rate)}`], ["Stopped", `${l.stopped_carries} · ${pctOf(l.stop_rate)}`],
    ["4+ yard carries", `${l.opportunity_carries} · ${pctOf(l.opportunity_rate)}`], ["Line yards / carry", fix(l.line_yards_per_carry, 2)],
    ["Short yardage", `${l.power_successes} of ${l.power_attempts}`], ["EPA / play", signedFix(l.epa_per_play)],
  ],
  receiving: (l) => [
    ["Targets", l.targets], ["Catches", l.receptions], ["Yards", num(l.yards)], ["TD", l.touchdowns], ["Catch rate", pctOf(l.catch_rate)],
    ["Yards / catch", fix(l.yards_per_reception)], ["Air depth / target", fix(l.adot)], ["Yards after catch", num(l.yards_after_catch)], ["YAC / catch", fix(l.yards_after_catch_per_reception)],
    ["1st down catches", l.first_down_receptions], ["3rd down conversions", l.third_down_conversions], ["Success rate", pctOf(l.success_rate)], ["EPA / target", signedFix(l.epa_per_target)],
  ],
  passing: (l) => [
    ["Comp / att", `${l.completions}/${l.attempts}`], ["Yards", num(l.yards)], ["TD", l.touchdowns], ["INT", l.interceptions], ["Yards / attempt", fix(l.yards_per_attempt)],
    ["Air depth / attempt", fix(l.adot)], ["Deep", `${l.deep_completions}/${l.deep_attempts}`], ["Sacks taken", l.sacks_taken],
    ["Red zone", `${l.red_zone_breakdown?.completions ?? 0}/${l.red_zone_breakdown?.attempts ?? 0}`], ["3rd down", `${l.third_down_breakdown?.completions ?? 0}/${l.third_down_breakdown?.attempts ?? 0}`],
    ["Success rate", pctOf(l.success_rate)], ["EPA / play", signedFix(l.epa_per_play)],
  ],
};

export const LEAD = {
  rushing: (n, l) => {
    const d = l.direction_breakdown ?? {};
    const lane = ["left", "middle", "right"].map((k) => [k, d[k]?.attempts ?? 0]).sort((x, y) => y[1] - x[1])[0];
    const where = lane[0] === "middle" ? "up the middle" : `to the ${lane[0]}`;
    return `${n} carried ${l.attempts} times for ${num(l.yards)} yards, ${fix(l.yards_per_carry)} a carry, with a long of ${l.long}. ${l.opportunity_carries} of the carries gained 4 or more, ${l.stuffed_carries} were stuffed at or behind the line, and ${lane[1]} of ${l.attempts} went ${where}.`;
  },
  receiving: (n, l) => `${n} caught ${l.receptions} of ${l.targets} targets for ${num(l.yards)} yards and ${l.touchdowns} TD, with ${num(l.yards_after_catch)} of those yards after the catch. ${l.first_down_receptions} of the catches went for first downs.`,
  passing: (n, l, rush) => `${n} went ${l.completions} of ${l.attempts} for ${num(l.yards)} yards, ${l.touchdowns} TD and ${l.interceptions} INT, ${l.deep_completions} of ${l.deep_attempts} on deep throws, and took ${l.sacks_taken} sacks.${rush ? ` Added ${rush.attempts} carries for ${num(rush.yards)} yards.` : ""}`,
};

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

export const conversionLead = (n, plays) => {
  const carries = plays.filter((p) => p.play_type === "RUSH");
  const catches = plays.length - carries.length;
  const sum = (f) => plays.reduce((t, p) => t + (f(p) ?? 0), 0);
  const middle = carries.filter((p) => /rush middle/i.test(p.description ?? "")).length;
  const stuffed = carries.filter((p) => p.stuffed).length;
  const touches = [carries.length && plural(carries.length, "carry").replace("carrys", "carries"), catches && plural(catches, "catch").replace("catchs", "catches")].filter(Boolean);
  return [
    `On those ${plural(plays.length, "touch").replace("touchs", "touches")}, ${n} had ${listWords(touches)} for ${sum((p) => p.yards_gained)} yards, facing ${fix(sum((p) => p.distance) / plays.length)} yards to go on average.`,
    carries.length ? `${middle} of the ${plural(carries.length, "carry").replace("carrys", "carries")} went up the middle${stuffed ? `, and ${stuffed} ${stuffed === 1 ? "was" : "were"} stuffed` : ""}.` : "",
    `Those plays added ${signedFix(sum((p) => p.epa), 1)} expected points and ${fix(sum(swingOf) * 100)} points of win chance.`,
  ].filter(Boolean).join(" ");
};

export const playsOf = (game, personId) => (game?.play_by_play ?? [])
  .filter((p) => !p.no_play && !p.nullified)
  .map((p) => ({ p, roles: (p.players ?? []).filter((x) => x.player_id === personId).map((x) => x.role) }))
  .filter((x) => x.roles.length > 0);

const touched = (x) => (x.roles.includes("rusher") || x.roles.includes("receiver")) && x.p.actions?.[0]?.isComplete !== false;

export const swingOf = (p) => (p.wp_after ?? 0) - (p.wp_pre ?? 0);

export const PLAY_LISTS = {
  third_fourth_conversions: { title: "Every 3rd & 4th down touch", pick: (xs) => xs.filter((x) => touched(x) && [3, 4].includes(x.p.down)).map((x) => x.p) },
  big_plays: { title: "The big plays", pick: (xs) => xs.filter((x) => touched(x) && x.p.yards_gained >= 20).map((x) => x.p).sort((a, b) => b.yards_gained - a.yards_gained) },
  game_changers: { title: "The biggest swings", swing: true, pick: (xs) => xs.filter((x) => touched(x) || x.roles.includes("passer")).map((x) => x.p).sort((a, b) => swingOf(b) - swingOf(a)).slice(0, 5) },
  yards_after_catch: { title: "The catches", pick: (xs) => xs.filter((x) => x.roles.includes("receiver") && x.p.actions?.[0]?.isComplete !== false).map((x) => x.p).sort((a, b) => b.yards_gained - a.yards_gained).slice(0, 8) },
};

export const playWords = (p) => String(p.description ?? "").replace(/\s*\([^)]*\)/g, "").replace(/,?\s*1st down\.?/i, "").replace(/\.$/, "");

export const downWords = (p) => `${ordinal(p.down)} & ${p.distance}`;
