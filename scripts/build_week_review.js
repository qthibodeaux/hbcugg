#!/usr/bin/env node
/* eslint-disable no-console */
// ─────────────────────────────────────────────────────────────────────────────
// WEEK REVIEW  —  "Did We Really Get Beat That Bad?"
//
// One bar per game played that week. The bar is the net success edge of the
// WINNER minus the LOSER:
//
//   tall bar      the better team won, and won like it
//   short bar     the scoreboard was louder than the football
//   NEGATIVE bar  the losing team out-played the winner — no, you did not
//                 really get beat that bad
//
// ONE GENERATOR, TWO SEASONS. The export changed shape between 2025 and 2026,
// and for a while that meant two scripts. Two scripts computing the same card
// is how numbers drift, so the season-specific parts are isolated into adapters
// below and everything after them is shared. Both adapters emit the identical
// payload contract, so WeekReviewTab renders either without knowing which it has.
//
//   2026  MEASURED.   inventory_2026 declares score_authority "parsed_game_file"
//                     and each parsed game ships
//                     game_advanced.team_advanced.plays.success_rate_down_distance.
//                     The bar is the real difference between two real rates.
//
//   2025  PROJECTED.  No team-game rollup existed, so the edge is inferred from
//                     both teams' SEASON profiles (offense vs opponent defense).
//                     It answers "should this have been close given who these
//                     teams are", not "who moved the ball that night". Kept
//                     because it covers a full season; labelled so nobody reads
//                     an estimate as a measurement.
//
//   node scripts/build_week_review.js [season]
// ─────────────────────────────────────────────────────────────────────────────

const fs = require("fs");
const path = require("path");

const SEASON = Number(process.argv[2] || 2026);
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public", "data", "0-data", `week_review_${SEASON}.json`);

const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const hub = read(path.join(ROOT, "public", "data", "0-data", "team_analytics_hub.json"));

const identityOf = (id) => (id ? hub.teams?.[id]?.identity ?? null : null);
const round = (v, d = 4) => (v == null ? null : Number(v.toFixed(d)));

// ═════════════════════════════════════════════════════════════════════════════
// ADAPTER — 2026 and later.  Measured.
// ═════════════════════════════════════════════════════════════════════════════

const adapter2026 = () => {
  const DATA = path.join(ROOT, "public", "data", String(SEASON));
  const inventory = read(path.join(DATA, `inventory_${SEASON}.json`));

  // Measured success rate, per team, per parsed game.
  const successByGame = {};
  for (const file of fs.readdirSync(DATA).filter((f) => /^[a-z]+\d*\d{2}\.json$/.test(f))) {
    let g;
    try { g = read(path.join(DATA, file)); } catch { continue; }
    const adv = g?.game_advanced?.team_advanced;
    if (!adv || !g?.metadata?.game_id) continue;
    const rates = {};
    for (const [teamId, t] of Object.entries(adv)) {
      const sr = t?.plays?.success_rate_down_distance;
      if (typeof sr === "number") rates[teamId] = sr;
    }
    if (Object.keys(rates).length === 2) successByGame[g.metadata.game_id] = rates;
  }

  // Inventory carries display names for everyone including non-HBCU opponents;
  // the hub adds logo and colour for the 18 covered teams.
  const sideOf = (side) => {
    const identity = identityOf(side.team_id);
    return {
      id: side.team_id ?? null,
      name: side.name ?? identity?.name ?? "—",
      short: side.display_short ?? side.abbreviation ?? identity?.short ?? side.name ?? "—",
      logo: identity?.logo ?? null,
      primary: identity?.primary ?? null,
      secondary: identity?.secondary ?? null,
      score: side.score ?? null,
    };
  };

  const byWeek = new Map();
  let charted = 0;

  for (const g of inventory.games) {
    const home = sideOf(g.home);
    const away = sideOf(g.away);
    const isFinal = g.status === "final" && home.score != null && away.score != null;
    const margin = isFinal ? home.score - away.score : null;

    const rates = successByGame[g.game_id];
    let netSuccess = null;
    let winnerEdge = null;
    if (rates && home.id && away.id) {
      const h = rates[home.id];
      const a = rates[away.id];
      if (typeof h === "number" && typeof a === "number") {
        netSuccess = h - a;                       // home perspective
        if (margin) winnerEdge = margin > 0 ? netSuccess : -netSuccess;
      }
    }
    if (winnerEdge != null) charted += 1;

    if (!byWeek.has(g.week)) byWeek.set(g.week, []);
    byWeek.get(g.week).push({
      game_id: g.game_id,
      route: g.route ?? (g.game_path_id ? `/game/${g.game_path_id}` : null),
      date: g.date,
      status: g.status,
      conference_game: !!g.is_conference_game,
      home, away,
      margin,
      net_success: round(netSuccess),
      winner_id: g.winner_team_id ?? null,
      winner_edge: round(winnerEdge),
      // Nothing here is provisional: a bar exists only when a parsed game file
      // supplied both success rates.
      provisional: false,
      parsed: !!rates,
    });
  }

  const meta = new Map(inventory.weeks.map((w) => [w.week, w]));
  const weeks = [...byWeek.entries()].sort((a, b) => a[0] - b[0]).map(([week, games]) => {
    const m = meta.get(week) ?? {};
    const bars = games.filter((g) => g.winner_edge != null).length;
    return {
      week,
      label: m.label ?? `Week ${week}`,
      date_range: m.start_date && m.end_date ? `${m.start_date} to ${m.end_date}` : "",
      game_count: games.length,
      final_count: games.filter((g) => g.status === "final").length,
      charted_count: bars,
      // Selectable once something is CHARTABLE, not merely final — otherwise
      // the control offers weeks whose chart is empty.
      played: bars > 0,
      games,
    };
  });

  return {
    measured: true,
    weeks,
    coverage: {
      games: inventory.summary.games,
      final: inventory.summary.final,
      parsed: inventory.summary.parsed,
      charted,
      note: `${charted} of ${inventory.summary.final} completed games have a parsed file, which is what a bar requires.`,
    },
    derivation: {
      real:
        "Every number here is measured. Scores and margins come from the inventory (score authority: the parsed game file); " +
        "each team's success rate is game_advanced.team_advanced.plays.success_rate_down_distance from that same file.",
      derived:
        "Nothing is projected. The 2025 version of this chart had to estimate the edge from season averages because no " +
        "per-game rollup existed; the export now ships it, so the bar measures what happened rather than what the matchup implied.",
      pass_note:
        "Success is the down-and-distance rule — half the needed yards on first down, 70% on second, all of them on third and fourth.",
    },
    log: [`${inventory.summary.games} games, ${inventory.summary.final} final, ${charted} charted`],
  };
};

// ═════════════════════════════════════════════════════════════════════════════
// ADAPTER — 2025.  Projected from season profiles.
// ═════════════════════════════════════════════════════════════════════════════

const adapter2025 = () => {
  const weekCentral = read(
    path.join(ROOT, "public", "data", "1-game center", "week_central", `week_central_${SEASON}.json`),
  );

  // Season profile per team. Pass efficiency is folded onto the same 0–1 scale
  // as a success rate so one term cannot swamp the other.
  const seasonKey = String(SEASON);
  const profiles = {};
  for (const [id, team] of Object.entries(hub.teams)) {
    const row = team.seasons?.[seasonKey];
    if (!row) continue;
    const m = row.metrics;
    profiles[id] = {
      identity: team.identity,
      oRun: m["o_rushing.successRate"], dRun: m["d_rushing.successRate"],
      oComp: m["o_passing.completionRate"], dComp: m["d_passing.completionRate"],
      oExpl: m["o_passing.explosiveRate"], dExpl: m["d_passing.explosiveRate"],
    };
  }

  // Only rushing has a true success rate in this export; pass efficiency rides
  // at half weight, which is stated on the card rather than hidden.
  const PASS_WEIGHT = 0.5;
  const expectedOffense = (off, def) => {
    const run = (off.oRun + def.dRun) / 2;
    const pass = ((off.oComp + def.dComp) / 2 + (off.oExpl + def.dExpl) / 2) / 2;
    return (run + PASS_WEIGHT * pass) / (1 + PASS_WEIGHT);
  };

  // week_central ships two kinds of row for the same fixture: a real parsed row
  // and a placeholder emitted ONE PER TEAM. So a fixture appears two or three
  // times, and the kinds disagree on the score (ASU-MVSU is 34-10 parsed and
  // 41-3 placeholder, on different dates). One row per fixture, parsed
  // preferred. Placeholder-only fixtures are kept — 75 of 147 have no parsed
  // game and dropping them would silently halve the season.
  const isPlaceholder = (g) => /^week\d+-/.test(g.game_id ?? "");
  const fixtureKey = (g) => [g.home_team_id, g.away_team_id].sort().join("~");
  const dedupe = (rows) => {
    const byFixture = new Map();
    for (const g of rows) {
      const k = fixtureKey(g);
      const held = byFixture.get(k);
      if (!held) byFixture.set(k, g);
      else if (isPlaceholder(held) && !isPlaceholder(g)) byFixture.set(k, g);
    }
    return [...byFixture.values()];
  };

  // A route naming neither team points at somebody else's game
  // (HUDSU15112025 -> /game/W12bcujsu). Better no link than a wrong one.
  const routeNamesATeam = (g) => {
    if (!g.route) return false;
    const slug = g.route.toLowerCase();
    return [g.home_team_id, g.away_team_id]
      .map((id) => id.replace(/^(swac|meac)/, "").slice(0, 3))
      .some((stem) => slug.includes(stem));
  };

  const sideOf = (id, name, score) => {
    const p = profiles[id];
    return {
      id, name,
      short: p?.identity?.short ?? name,
      logo: p?.identity?.logo ?? null,
      primary: p?.identity?.primary ?? null,
      secondary: p?.identity?.secondary ?? null,
      score: score ?? null,
    };
  };

  const joined = [];
  const weeks = [];
  const quality = { collapsed: 0, placeholder_only: 0, dropped_routes: 0 };

  for (const w of weekCentral.weeks) {
    const raw = w.games ?? [];
    const rows = dedupe(raw);
    quality.collapsed += raw.length - rows.length;

    const games = [];
    for (const g of rows) {
      const home = profiles[g.home_team_id];
      const away = profiles[g.away_team_id];
      const isFinal = g.status === "final" && g.home_score != null && g.away_score != null;
      const margin = isFinal ? g.home_score - g.away_score : null;

      // A game against an opponent outside the 18-team hub still shows its
      // margin; it just has no projected edge.
      const edge = home && away ? expectedOffense(home, away) - expectedOffense(away, home) : null;

      const placeholder = isPlaceholder(g);
      if (placeholder) quality.placeholder_only += 1;
      const route = routeNamesATeam(g) ? g.route : null;
      if (g.route && !route) quality.dropped_routes += 1;

      const game = {
        game_id: g.game_id,
        route,
        date: g.date,
        status: g.status,
        conference_game: !!g.conference_game,
        home: sideOf(g.home_team_id, g.home_name, g.home_score),
        away: sideOf(g.away_team_id, g.away_name, g.away_score),
        margin,
        net_success: round(edge),
        winner_id: isFinal ? (margin > 0 ? g.home_team_id : margin < 0 ? g.away_team_id : null) : null,
        // net_success is written from the home side; flip it when the away team
        // won so every bar reads winner-minus-loser.
        winner_edge: !isFinal || edge == null || margin === 0 ? null : round(margin > 0 ? edge : -edge),
        // A placeholder row's score disagrees with the parsed game wherever
        // both exist, so a bar built from one is worth marking in the UI.
        provisional: placeholder,
        parsed: !placeholder,
      };
      games.push(game);
      if (isFinal && edge != null) joined.push(game);
    }

    const bars = games.filter((g) => g.winner_edge != null).length;
    weeks.push({
      week: w.week,
      label: w.label,
      date_range: w.date_range,
      game_count: games.length,
      final_count: games.filter((g) => g.status === "final").length,
      charted_count: bars,
      played: bars > 0,
      games,
    });
  }

  // A least-squares fit of actual margin on the projected edge. Not plotted —
  // it exists so the card can state how well the proxy tracks real scoreboards
  // instead of asking to be taken on faith.
  const n = joined.length;
  const mx = joined.reduce((s, g) => s + g.net_success, 0) / n;
  const my = joined.reduce((s, g) => s + g.margin, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (const g of joined) {
    const dx = g.net_success - mx, dy = g.margin - my;
    sxy += dx * dy; sxx += dx * dx; syy += dy * dy;
  }
  const slope = sxy / sxx;
  const intercept = my - slope * mx;
  const r = sxy / Math.sqrt(sxx * syy);

  return {
    measured: false,
    weeks,
    fit: { slope: round(slope, 2), intercept: round(intercept, 2), r: round(r, 3), n },
    data_quality: {
      ...quality,
      note:
        "week_central ships a per-TEAM placeholder row alongside each parsed game, so every fixture appears two or three " +
        "times and the two kinds disagree on the score. One row per fixture is kept, parsed preferred. Routes that name " +
        "neither team are dropped rather than followed.",
    },
    derivation: {
      real: "Scores, margins, dates, statuses and team ids are measured — from week_central.",
      derived:
        "The success edge is PROJECTED from both teams' season profiles (offense vs opponent defense), because per-game " +
        "success rate does not exist in this season's export. It says whether the matchup should have been close, not " +
        "whether a team moved the ball that night.",
      pass_note:
        "Only rushing has a true success rate in this export. Pass efficiency (completion + explosive) is folded in at " +
        "half weight until a pass success rate ships.",
    },
    log: [
      `collapsed ${quality.collapsed} duplicate rows, ${quality.placeholder_only} placeholder-only, ${quality.dropped_routes} bad route(s)`,
      `fit: margin = ${round(slope, 2)} * edge + ${round(intercept, 2)}   r=${round(r, 3)}  n=${n}`,
    ],
  };
};

// ═════════════════════════════════════════════════════════════════════════════
// Shared emit
// ═════════════════════════════════════════════════════════════════════════════

const built = SEASON >= 2026 ? adapter2026() : adapter2025();
const firstChartable = built.weeks.find((w) => w.played);

const out = {
  season: SEASON,
  generated_at: new Date().toISOString(),
  default_week: firstChartable ? firstChartable.week : 0,
  ...built,
};
delete out.log;

fs.writeFileSync(OUT, JSON.stringify(out));

const bars = built.weeks.flatMap((w) => w.games).filter((g) => g.winner_edge != null);
console.log(`wrote ${path.relative(ROOT, OUT)}`);
console.log(`  season ${SEASON} · ${built.measured ? "MEASURED" : "PROJECTED"}`);
console.log(`  weeks ${built.weeks.length} · chartable ${built.weeks.filter((w) => w.played).length} · default W${out.default_week}`);
console.log(`  bars ${bars.length} (${bars.filter((g) => g.winner_edge < 0).length} negative — loser out-played the winner)`);
built.log.forEach((l) => console.log(`  ${l}`));
