import teamsData from "../../../../data/teams.json";
import { teamShortName } from "../../../game/export/exportData";

// Leaderboard dimensions, canonical team identity, photo fallbacks, counting lines and editorial copy templates.

const COL_W = 420;

export const COL_GAP = 20;

export const POSTER_PAD = 48;

export const widthOf = (columns) => POSTER_PAD * 2 + Math.max(columns, 2) * COL_W + (Math.max(columns, 2) - 1) * COL_GAP;

export const ZOOM_BASE = 1400;

export const MAX_ROWS = 10;

export const PHOTO_H = 300;

const EXTS = ["jpg", "jpeg", "png", "webp"];

const META = Object.fromEntries(teamsData.teams.map((t) => [t.exportId.replace(/25$/, ""), t]));

export const primaryOf = (id) => META[id]?.colors?.primary ?? "#71717A";

export const tab = { fontVariantNumeric: "tabular-nums" };

export const num = (v) => (v == null ? "—" : Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 }));

export const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

const join = (...parts) => parts.filter(Boolean).join(", ");

const SUFFIX = /^(jr\.?|sr\.?|ii|iii|iv|v)$/i;

export const lastName = (full) => {
  const parts = String(full ?? "").trim().split(/\s+/);
  if (parts.length > 2 && SUFFIX.test(parts[parts.length - 1])) return parts.slice(-2).join(" ");
  return parts[parts.length - 1] ?? "";
};

const photoSlug = (name) => {
  const parts = String(name ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().split(/\s+/);
  const last = parts.length > 2 && SUFFIX.test(parts[parts.length - 1]) ? parts[parts.length - 2] : parts[parts.length - 1] ?? "";
  return last.toLowerCase().replace(/['’.,]/g, "");
};

export const photoUrls = (rows, mode, week) => rows.flatMap((r) => {
  const slug = photoSlug(r.display_name);
  // Per Game also takes the latest week's photo, so the same file serves both posters.
  const names = [...(mode === "week" ? [] : [`${slug}Season`]), `${slug}W${week}`, slug];
  return names.flatMap((n) => EXTS.map((e) => `/pics/leaders/${n}.${e}`));
});

const PHOTO_FOCUS = { tolbertW9: "80% center", rembertW9: "0% center", hollyW9: "90% center", adamsW9: "90% center" };

export const focusOf = (url) => PHOTO_FOCUS[String(url).split("/").pop().split(".")[0]] ?? "center";

export const SEASON_LINES = {
  passing_yards: (p) => p.passing && join(`${p.passing.cmp}/${p.passing.att}`, `${p.passing.td} TD`, `${p.passing.int} INT`),
  rushing_yards: (p) => p.rushing && join(`${p.rushing.att} car`, `${p.rushing.td} TD`, `long ${p.rushing.long}`),
  receiving_yards: (p) => p.receiving && join(`${p.receiving.rec} rec`, `${p.receiving.td} TD`, `long ${p.receiving.long}`),
  receptions: (p) => p.receiving && join(`${num(p.receiving.yds)} yds`, `${p.receiving.td} TD`),
  total_offense: (p) => p.total_offense && join(`${num(p.total_offense.pass)} pass`, `${num(p.total_offense.rush)} rush`),
  // Only the player's two biggest sources, so the line fits the card; the total prints under it.
  all_purpose: (p) => p.all_purpose && join(...[[p.all_purpose.rush, "rush"], [p.all_purpose.rcv, "rec"], [p.all_purpose.kr, "KR"], [p.all_purpose.pr, "PR"]]
    .filter(([v]) => v > 0).sort((a, b) => b[0] - a[0]).slice(0, 2).map(([v, label]) => `${num(v)} ${label}`)),
  points: (p) => p.scoring && join(`${p.scoring.td} TD`, p.scoring.fg ? `${p.scoring.fg} FG` : null, p.scoring.pat ? `${p.scoring.pat} PAT` : null),
  touchdowns: (p) => p.scoring && `${p.scoring.pts} pts`,
  tackles: (p) => p.defense && join(`${p.defense.ua} solo`, `${p.defense.a} ast`),
  tackles_for_loss: (p) => p.defense && join(`${num(p.defense.tfl_yds)} yds`, `${num(p.defense.sacks)} sacks`),
  sacks: (p) => p.defense && join(`${num(p.defense.sack_yds)} yds`, `${num(p.defense.tfl)} TFL`),
  interceptions: (p) => p.defense && join(`${num(p.defense.int_yds)} ret yds`, p.defense.int_td ? `${p.defense.int_td} TD` : null),
  pass_breakups: (p) => p.defense && join(`${p.defense.int} INT`, `${p.defense.pd} PD`),
};

export const TEAM_LINES = {
  points_per_game: (t) => `${num(t.offense?.scoring?.pts)} pts`,
  points_allowed_per_game: (t) => `${num(t.defense?.scoring?.pts)} pts`,
  yards_per_game: (t) => `${num(t.offense?.totals?.yds)} yds`,
  yards_allowed_per_game: (t) => `${num(t.defense?.totals?.yds)} yds`,
  yards_per_play: (t) => `${num(t.offense?.totals?.yds)} yds, ${num(t.offense?.totals?.plays)} plays`,
  yards_per_play_allowed: (t) => `${num(t.defense?.totals?.yds)} yds, ${num(t.defense?.totals?.plays)} plays`,
  rush_yards_per_game: (t) => `${num(t.offense?.rushing?.att)} car, ${num(t.offense?.rushing?.yds)} yds`,
  rush_yards_allowed_per_game: (t) => `${num(t.defense?.rushing?.att)} car, ${num(t.defense?.rushing?.yds)} yds`,
  pass_yards_per_game: (t) => `${num(t.offense?.passing?.cmp)}/${num(t.offense?.passing?.att)}, ${num(t.offense?.passing?.yds)} yds`,
  pass_yards_allowed_per_game: (t) => `${num(t.defense?.passing?.cmp)}/${num(t.defense?.passing?.att)}, ${num(t.defense?.passing?.yds)} yds`,
  third_down_pct: (t) => `${num(t.offense?.conversions?.third?.conv)} of ${num(t.offense?.conversions?.third?.att)}`,
  third_down_pct_allowed: (t) => `${num(t.defense?.conversions?.third?.conv)} of ${num(t.defense?.conversions?.third?.att)}`,
  red_zone_score_pct: (t) => `${num(t.offense?.conversions?.red_zone?.scores)} of ${num(t.offense?.conversions?.red_zone?.att)} trips`,
  red_zone_score_pct_allowed: (t) => `${num(t.defense?.conversions?.red_zone?.scores)} of ${num(t.defense?.conversions?.red_zone?.att)} trips`,
  penalty_yards_per_game: (t) => `${num(t.offense?.misc?.pen)} for ${num(t.offense?.misc?.pen_yds)} yds`,
};

export const gameLine = (r) => {
  const where = r.home_away === "away" ? "at" : "vs.";
  return [r.result && r.score ? `${r.result} ${r.score}` : null, r.opponent_team_id ? `${where} ${teamShortName(r.opponent_team_id)}` : null].filter(Boolean).join(" ");
};

export const MEDAL = { 2: "rgba(168,176,184,0.32)", 3: "rgba(205,127,50,0.26)" };

export const ARTICLE_W = 1200;

export const seasonRankLine = (r) => {
  if (!r.season_game_rank) return null;
  return r.season_game_rank === 1 ? "The most in a game this season." : `The ${ordinal(r.season_game_rank)} most in a game this season.`;
};

export const listWords = (w) => (w.length < 2 ? w.join("") : `${w.slice(0, -1).join(", ")} and ${w[w.length - 1]}`);

const aOrAn = (n) => (/^(8|11|18)/.test(String(n)) ? "an" : "a");

export const ARTICLE = {
  third_fourth_conversions: {
    headline: (n, v, full) => [full, "Chain Mover"],
    body: (r, v, opp) => {
      const d = r.details;
      const downs = [d?.third?.chances > 0 && `${d.third.converted} of ${d.third.chances} on 3rd down`, d?.fourth?.chances > 0 && `${d.fourth.converted} of ${d.fourth.chances} on 4th down`].filter(Boolean);
      return `converted ${v} times on 3rd and 4th down against ${opp}${downs.length ? `, going ${listWords(downs)}` : ""}.${d?.longest_to_go != null ? ` Longest: ${d.longest_to_go} to go.` : ""}`;
    },
  },
  game_changers: {
    headline: (n) => [n, "Game Changer"],
    body: (r, v, opp) => {
      const b = r.details?.biggest_play;
      return `added ${v} points of win chance against ${opp}.${b ? ` Biggest play: ${b.description} in Q${b.quarter}, taking the chance to win from ${Math.round(b.win_chance_before)}% to ${Math.round(b.win_chance_after)}%.` : ""}`;
    },
  },
  big_plays: {
    headline: (n, v) => `${n} Hit ${v} Big Plays`,
    body: (r, v, opp) => {
      const plays = (r.details?.plays ?? []).map((x) => `${aOrAn(x.yards)} ${x.yards} yard ${x.kind}${x.touchdown ? " for a TD" : ""}`);
      return `had ${v} plays of 20+ yards against ${opp}${plays.length ? `: ${listWords(plays)}` : ""}.`;
    },
  },
  yards_after_catch: {
    headline: (n, v) => `${n} Added ${v} After the Catch`,
    body: (r, v, opp) => {
      const d = r.details;
      return `piled up ${v} yards after the catch against ${opp}${d?.catches != null ? ` on ${d.catches} catches for ${num(d.yards)} yards` : ""}.${d?.longest_yac != null ? ` Longest after the catch: ${d.longest_yac}.` : ""}`;
    },
  },
};
