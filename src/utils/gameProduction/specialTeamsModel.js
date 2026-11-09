import { getTeamDisplayName } from "../gameBoxScore/teamIdentity";
import { num, rate } from "../productionPresentation";

// Extracted from SpecialTeamsProductionClean; existing behavior preserved.

// ─────────────────────────────────────────────────────────────────────────────
// Special Teams Production — the fourth panel on the Production tab, on the same
// four-row shell as passing / rushing / defense: eyebrow, team line, spotlight,
// roster tables.
//
// Everything is a straight read off the game file:
//   • team line      — `special_teams[team]` (punting, kickoffs, both return
//                      units, field goals), each with a league-max meter from
//                      the league file's `special_teams.*` keys
//   • roster tables  — `special_teams_individual[team].{kickers, punters,
//                      returners_ko, returners_punt, coverage, blockers}`
//   • spotlight      — the active row's chips; holders / long snappers fold into
//                      the kicking table as a note rather than their own table
//
// `production_scores` carries no special-teams component, so there is no
// production column here — logged as an ask, not invented.
// ─────────────────────────────────────────────────────────────────────────────
export const made = (m, a) => (m == null || a == null ? "—" : `${m}/${a}`);

export const asNum = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);

const rowsOf = (v) => (Array.isArray(v) ? v : v && typeof v === "object" ? Object.values(v) : []);

export const buildSpecialTeamsData = (game, teamId) => {
  const ind = game?.special_teams_individual?.[teamId];
  const st = game?.special_teams?.[teamId];
  if (!ind && !st) return null;

  const fg = st?.field_goals ?? {};
  const ko = st?.kickoffs ?? {};
  const punts = st?.punting ?? {};
  const kr = st?.kick_return ?? {};
  const pr = st?.punt_return ?? {};

  const kickers = rowsOf(ind?.kickers).map((r, i) => ({
    key: `k-${r.name ?? i}`,
    name: r.name,
    role: "K",
    fgMade: r.fg_made ?? null,
    fgAtt: r.fg_attempts ?? null,
    fgLong: r.fg_long ?? null,
    patMade: r.pat_made ?? null,
    patAtt: r.pat_attempts ?? null,
    kickoffs: r.kickoffs?.kicks ?? r.attempts ?? null,
    touchbacks: r.kickoffs?.touchbacks ?? r.touchbacks ?? null,
    koAvg: r.kickoffs?.avg_distance ?? r.avg_yards ?? null,
    oob: r.kickoffs?.out_of_bounds ?? r.oob ?? null,
  }));

  const punters = rowsOf(ind?.punters).map((r, i) => ({
    key: `p-${r.name ?? i}`,
    name: r.name,
    role: "P",
    punts: r.attempts ?? null,
    gross: r.avg_gross ?? null,
    net: r.avg_net ?? null,
    inside20: r.inside_20 ?? null,
    inside10: r.inside_10 ?? null,
    fairCatches: r.fair_catches ?? null,
    touchbacks: r.touchbacks ?? null,
    blocked: r.blocked ?? null,
  }));

  const returners = [
    ...rowsOf(ind?.returners_ko).map((r, i) => ({
      key: `kr-${r.name ?? i}`,
      name: r.name,
      role: "KR",
      type: "KO",
      returns: r.attempts ?? null,
      yards: r.yards ?? null,
      avg: r.avg_yards ?? null,
      tds: r.tds ?? null,
      muffs: null,
    })),
    ...rowsOf(ind?.returners_punt).map((r, i) => ({
      key: `pr-${r.name ?? i}`,
      name: r.name,
      role: "PR",
      type: "Punt",
      returns: r.attempts ?? null,
      yards: r.yards ?? null,
      avg: r.avg_yards ?? null,
      tds: r.tds ?? null,
      muffs: r.muffs ?? null,
    })),
  ];

  const coverage = [
    ...rowsOf(ind?.coverage).map((r, i) => ({ key: `c-${r.name ?? i}`, name: r.name, role: "COV", tackles: r.tackles ?? null, blocks: null })),
    ...rowsOf(ind?.blockers).map((r, i) => ({ key: `b-${r.name ?? i}`, name: r.name, role: "BLK", tackles: null, blocks: r.blocks ?? null })),
  ].sort((a, b) => (b.tackles ?? 0) + (b.blocks ?? 0) * 2 - ((a.tackles ?? 0) + (a.blocks ?? 0) * 2));

  const snapOps = [...rowsOf(ind?.holders), ...rowsOf(ind?.long_snappers)];
  const opsAtt = snapOps.reduce((s, r) => s + (r.attempts ?? 0), 0);
  const opsMade = snapOps.reduce((s, r) => s + (r.made ?? 0), 0);

  return {
    meta: { displayName: getTeamDisplayName(teamId) },
    line: {
      puntNet: asNum(punts.avg_net),
      puntStart: asNum(punts.avg_start_allowed),
      koStart: asNum(ko.avg_start_allowed),
      krAvg: asNum(kr.avg_return),
      prAvg: asNum(pr.avg_return),
      fgMade: fg.made ?? null,
      fgAtt: fg.attempts ?? null,
      fgLong: asNum(fg.long),
    },
    kickers,
    punters,
    returners,
    coverage,
    snapOps: snapOps.length ? { attempts: opsAtt, made: opsMade } : null,
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// SPOTLIGHT — chips per role, no chart
// ═══════════════════════════════════════════════════════════════════════════════
export const chipsFor = (p) => {
  if (!p) return [];
  if (p.role === "K") {
    return [
      ["FG", made(p.fgMade, p.fgAtt)],
      ["Long", num(p.fgLong)],
      ["PAT", made(p.patMade, p.patAtt)],
      ["Kickoffs", num(p.kickoffs)],
      ["Touchbacks", num(p.touchbacks)],
      ["KO Avg", rate(p.koAvg)],
      ["OOB", num(p.oob)],
    ];
  }
  if (p.role === "P") {
    return [
      ["Punts", num(p.punts)],
      ["Gross", rate(p.gross)],
      ["Net", rate(p.net)],
      ["In 20", num(p.inside20)],
      ["In 10", num(p.inside10)],
      ["Fair Ct", num(p.fairCatches)],
      ["TB", num(p.touchbacks)],
      ["Blocked", num(p.blocked)],
    ];
  }
  if (p.role === "KR" || p.role === "PR") {
    return [
      ["Type", p.type],
      ["Returns", num(p.returns)],
      ["Yds", num(p.yards)],
      ["Avg", rate(p.avg)],
      ["TD", num(p.tds)],
      ["Muffs", num(p.muffs)],
    ];
  }
  return [
    ["Cov Tkl", num(p.tackles)],
    ["Blocks", num(p.blocks)],
  ];
};
