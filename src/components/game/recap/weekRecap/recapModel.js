// Existing recap selectors and canvas text measurement. The measurement cache
// remains module-scoped and is initialized lazily only in a browser.
import { short, COMP_INK } from "./recapPresentation";

export const metaOf = (p) => [p.position, p.class_year, short(p.team_id)].filter(Boolean).join(" · ");

const boxRow = (games, teamId, personId, cat) => {
  for (const gm of games) {
    const row = (gm?.individual_stats?.[teamId]?.[cat] ?? []).find((r) => r.player_key === personId);
    if (row) return row;
  }
  return null;
};

export const statsFor = (p, games) => {
  const line = [...(p.stat_line ?? [])];
  const have = new Set(line.map((st) => String(st.label).toUpperCase()));
  const add = (label, v) => {
    if (!Number.isFinite(v) || v === 0 || have.has(label)) return;
    have.add(label);
    line.push({ label, value: v });
  };
  const d = boxRow(games, p.team_id, p.person_id, "defense");
  if (d) {
    add("TKL", d.tackles);
    add("TFL", d.tfl);
    add("SACKS", d.sacks);
    add("INT", d.interceptions);
    add("FF", d.forced_fumbles);
    add("FR", d.fumble_recoveries);
    add("PD", d.passes_defended);
    add("DEF TD", (d.int_touchdowns ?? 0) + (d.fumble_return_touchdowns ?? 0));
    add("QBH", d.qb_hurries);
  }
  const pa = boxRow(games, p.team_id, p.person_id, "passing");
  const ru = boxRow(games, p.team_id, p.person_id, "rushing");
  const re = boxRow(games, p.team_id, p.person_id, "receiving");
  if (pa) add("INT", pa.interceptions);
  add("FUM", (pa?.fumbles ?? 0) + (ru?.fumbles ?? 0) + (re?.fumbles ?? 0));
  return line;
};

let measureCtx = null;

const textWidth = (text, font, spacingEm, size) => {
  if (typeof document === "undefined") return 0;
  measureCtx = measureCtx ?? document.createElement("canvas").getContext("2d");
  if (!measureCtx) return 0;
  const family = getComputedStyle(document.body).fontFamily || "sans-serif";
  measureCtx.font = `${font} ${family}`;
  const str = String(text ?? "");
  return measureCtx.measureText(str).width + spacingEm * size * str.length;
};

export const nameColWidth = (players) => Math.ceil(Math.max(0, ...players.map((p) => Math.max(
  textWidth(String(p.last_name ?? "").toUpperCase(), "italic 900 30px", -0.02, 30),
  textWidth(metaOf(p).toUpperCase(), "900 11px", 0.16, 11),
))) + 6);

// A performer's number: PAR, the figure the backend ranks the set by (Week 10 on).
export const scoreOf = (p) => Number(p?.par);

export const scoreColWidth = (players) => Math.ceil(Math.max(0, ...players.map((p) => textWidth(scoreOf(p).toFixed(1), "900 38px", 0, 38))) + 4);

export const componentsOf = (games, teamId, personId) => {
  for (const gm of games) {
    const row = (gm?.production_scores?.[teamId] ?? []).find((r) => r.player_key === personId);
    if (row) return row.components ?? {};
  }
  return {};
};

export const rowStats = (p, games) => {
  const supplied = statsFor(p, games);
  if (supplied.length) return supplied;
  const comps = p.components ?? {};
  const top = Object.entries(comps).sort((x, y) => y[1] - x[1])[0]?.[0];
  const box = (cat) => boxRow(games, p.team_id, p.person_id, cat) ?? {};
  const pick = {
    passing_production: () => { const r = box("passing"); return [["YDS", r.yards], ["TD", r.touchdowns]]; },
    rushing_production: () => { const r = box("rushing"); return [["RUSH YDS", r.yards], ["TD", r.touchdowns]]; },
    receiving_production: () => { const r = box("receiving"); return [["REC YDS", r.yards], ["TD", r.touchdowns]]; },
    hit_production: () => { const r = box("defense"); return [["TKL", r.tackles], ["TFL", r.tfl], ["FF", r.forced_fumbles], ["FR", r.fumble_recoveries]]; },
    hawk_production: () => { const r = box("defense"); return [["INT", r.interceptions], ["PD", r.passes_defended], ["FR", r.fumble_recoveries], ["TKL", r.tackles]]; },
    scrum_production: () => { const r = box("defense"); return [["SACKS", r.sacks], ["FF", r.forced_fumbles], ["FR", r.fumble_recoveries], ["TFL", r.tfl], ["QBH", r.qb_hurries], ["TKL", r.tackles]]; },
  }[top];
  if (!pick) return [];
  // The first two the player actually had, in that order — never a zero
  // (a pass rusher with no sacks shows his forced fumble instead).
  const list = pick().filter(([, v]) => Number.isFinite(v));
  const had = list.filter(([, v]) => v !== 0);
  return (had.length ? had : list.slice(0, 1)).slice(0, 2).map(([label, value]) => ({ label, value }));
};

export const posTotal = (p) => COMP_INK.reduce((sum, [k]) => sum + Math.max(0, p.components?.[k] ?? 0), 0);

export const nextSeven = (set) => (set?.data?.next ?? []).slice(0, 7);

export const raceLine = (it, games) => {
  const leadId = it.data?.rows?.[0]?.team_id ?? it.team_ids?.[0];
  if (!leadId) return it.stat?.label;
  const division = String(it.data?.group_label ?? "").replace(/^(SWAC|MEAC)\s+/i, "");
  const base = `${short(leadId)}'s probability to win the ${division || "division"}`;
  const g = games.find((x) => x.away?.team_id === leadId || x.home?.team_id === leadId);
  if (!g) return base;
  const isAway = g.away.team_id === leadId;
  const us = isAway ? g.away : g.home;
  const them = isAway ? g.home : g.away;
  const won = g.winner_team_id === leadId;
  return `${base} after ${won ? "defeating" : "losing to"} ${short(them.team_id)} ${us.score}-${them.score}`;
};
