/**
 * build_people_hub_cards.js
 *
 * Generates a People Hub card feed from REAL 2025 data — no invented stats.
 * Stands in for the backend weighting/ranking engine described in
 * reqs/PEOPLE_HUB_CARD_INVENTORY.md: each archetype is a candidate generator,
 * candidates are scored, and the winners are written in that doc's envelope.
 *
 * COVERAGE BALANCE IS IMPLEMENTED HERE (a per-team cap on hero/solo/duo
 * cards). It's one of the §Scoring signals that doc calls for, and without it
 * a single program wins every slot — which is exactly what the first version
 * of this feed did. Recency, opponent quality and novelty decay are still
 * backend work; there's only one season of results on disk to sort.
 *
 * Sources (all real, all already in the repo):
 *   public/data/0-data/player_stats_2025_enriched.json   production + per-game
 *   public/data/3-players/player_seasons_2025.json       roster identity + photos
 *   public/data/3-players/player_profile/2025/*.json     field maps (1 player today)
 *   public/data/4-coaches/coaches_hub_payload_2025.json  coach tenure
 *   src/data/teams.json                                  team identity
 *
 * Run: node scripts/build_people_hub_cards.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const rows = (v) => (Array.isArray(v) ? v : Object.values(v.players ?? v));
const round = (n, d = 1) => Number(Number(n).toFixed(d));

const enriched = rows(read("public/data/0-data/player_stats_2025_enriched.json"));
const roster = rows(read("public/data/3-players/player_seasons_2025.json"));
const coaches = read("public/data/4-coaches/coaches_hub_payload_2025.json");
const teams = read("src/data/teams.json").teams;

const normTeam = (t) => String(t ?? "").toLowerCase().replace(/25$/, "");
const teamById = new Map(teams.map((t) => [normTeam(t.exportId), t]));

// player_stats_2025_enriched carries a stale person_id generation (only 7 of
// 1,054 rows join to the roster by id; 909 join by name). BACKEND_CHANGE_NOTES
// §5, and a real ask in BACKEND_RESPONSE_SPEC §14/§15. Name+team join is the
// same workaround the player page uses — and the reason that ask matters.
const nameKey = (n, t) => `${String(n ?? "").toLowerCase()}|${normTeam(t)}`;
const rosterByName = new Map(roster.map((r) => [nameKey(r.full_name, r.team_id), r]));

const players = enriched
  .map((e) => ({ ...e, roster: rosterByName.get(nameKey(e.name_display, e.team)) ?? null }))
  .filter((p) => p.roster);
const producers = players.filter((p) => Number(p.par) > 0);

const COMPONENTS = [
  ["passing_production", "Pass"],
  ["rushing_production", "Rush"],
  ["receiving_production", "Recv"],
  ["hit_production", "Havoc"],
  ["hawk_production", "Cover"],
  ["scrum_production", "Trench"],
];
// League maxima, for normalizing the radar so one player's shape is
// comparable to another's rather than self-scaled.
const COMPONENT_MAX = Object.fromEntries(
  COMPONENTS.map(([key]) => [key, Math.max(...players.map((p) => Number(p.season_components?.[key]) || 0), 1)]),
);

const subject = (p) => ({
  person_id: p.roster.person_id,
  name: p.name_display,
  first_name: p.roster.first_name,
  last_name: p.roster.last_name,
  position: p.position ?? p.roster.position ?? p.roster.position_group,
  class_year: p.roster.class_year ?? null,
  team_id: normTeam(p.team),
  team_short: teamById.get(normTeam(p.team))?.shortName ?? normTeam(p.team),
  image_url: p.roster.image_url ?? null,
  href: `/players/${encodeURIComponent(p.roster.person_id)}`,
});

const cards = [];
const push = (c) => cards.push({ ...c, card_id: `${c.archetype}-${cards.length + 1}` });

// ── Coverage balance ────────────────────────────────────────────────────────
// Caps how many person-led cards one program can own. This is the signal that
// turns a leaderboard into a front page: without it the top team sweeps.
const teamCardCount = new Map();
const teamLoad = (id) => teamCardCount.get(id) ?? 0;
const claimTeam = (id) => teamCardCount.set(id, teamLoad(id) + 1);
const TEAM_CAP = 1;
const underCap = (id, cap = TEAM_CAP) => teamLoad(id) < cap;

// Person-level dedup. A team appearing twice is fine variety; the same PLAYER
// twice is not — this is a people page, and a repeated face reads as a thin
// feed. Cards claim their subjects; later archetypes skip anyone claimed.
const usedPeople = new Set();
const isFree = (...people) => people.every((p) => !usedPeople.has(p.roster.person_id));
const claimPeople = (...people) => people.forEach((p) => usedPeople.add(p.roster.person_id));

// ── viz payloads — each keyed to what its card is about ─────────────────────
const gameCurve = (player, highlightGameId) => {
  const series = (player.games ?? [])
    .filter((g) => Number.isFinite(g.total))
    .map((g) => ({ game_id: g.game_id, value: round(g.total) }));
  return { kind: "game_curve", series, highlight_index: series.findIndex((g) => g.game_id === highlightGameId) };
};

// Vertical bars — the frontend renders these as columns, which share width far
// better than a stack of horizontal rows.
const rankBars = (list, subjectName, limit = 6) => ({
  kind: "rank_bars",
  entries: list.slice(0, limit).map((p) => ({
    last_name: p.roster.last_name,
    team_short: teamById.get(normTeam(p.team))?.shortName ?? normTeam(p.team),
    value: round(p.par),
    is_subject: subjectName != null && p.name_display === subjectName,
  })),
});

// Production shape across all six components, normalized to league maxima —
// a defender's havoc/coverage/trench triangle looks nothing like a QB's
// passing spike, which is the point.
const productionRadar = (player) => ({
  kind: "production_radar",
  axes: COMPONENTS.map(([key, label]) => ({
    key,
    label,
    value: round(Number(player.season_components?.[key]) || 0),
    normalized: round((Number(player.season_components?.[key]) || 0) / COMPONENT_MAX[key], 3),
  })),
});

// Share of a whole, as a ring.
const donut = (value, total, label) => ({
  kind: "donut",
  value: round(value),
  total: round(total),
  pct: Math.round((value / (total || 1)) * 100),
  label,
});

const split = (parts) => ({ kind: "split", parts: parts.map(([label, value]) => ({ label, value: round(value) })) });

// Joined on production value, not opponent name: the enriched feed's game_id
// encodes team CODES ("SCSU") while the profile document uses display short
// names ("SC State"), so a name match silently never fires. Real mismatch
// between two backend sources — and why the spec leans on game_path_id.
const loadFieldMap = (personId, gameTotal) => {
  const rel = `public/data/3-players/player_profile/2025/${personId}.json`;
  if (!fs.existsSync(path.join(ROOT, rel))) return null;
  const doc = read(rel);
  const game = (doc.games ?? []).find((g) => g.data_state === "played" && Math.abs(Number(g.par) - Number(gameTotal)) < 0.01);
  const passing = game?.field_map?.passing;
  if (!passing?.available) return null;
  return { kind: "field_map_passing", grid: passing.grid, opponent_name: game.opponent_name, depth_bands: doc.field_map?.depth_bands ?? null, cells: passing.cells };
};

const parseOpponent = (gameId, teamShort) => {
  const codes = String(gameId ?? "").slice(0, -8).toUpperCase();
  const me = String(teamShort ?? "").toUpperCase();
  if (codes.startsWith(me)) return { opp: codes.slice(me.length), away: true };
  if (codes.endsWith(me)) return { opp: codes.slice(0, codes.length - me.length), away: false };
  return { opp: codes, away: false };
};

// ── 1 · Outstanding Performance — 3 hero slides, 3 different programs ───────
const singleGames = [];
producers.forEach((p) => (p.games ?? []).forEach((g) => {
  if (Number.isFinite(g.total)) singleGames.push({ p, game: g });
}));
singleGames.sort((a, b) => b.game.total - a.game.total);

let heroCount = 0;
for (const { p, game } of singleGames) {
  if (heroCount >= 3) break;
  const teamId = normTeam(p.team);
  if (!underCap(teamId) || !isFree(p)) continue;
  const s = subject(p);
  const { opp, away } = parseOpponent(game.game_id, s.team_short);
  push({
    archetype: "outstanding_performance",
    layout: "SOLO",
    icon: "flame",
    headline: `${round(game.total)} production ${away ? "at" : "vs"} ${opp} — his best of the season`,
    subject: [s],
    stat_primary: { label: "Game Production", value: round(game.total), context: `${away ? "at" : "vs"} ${opp}` },
    stat_support: [
      { label: "Season PAR", value: round(p.par) },
      { label: "Per Game", value: round(p.avg_production) },
    ],
    viz: loadFieldMap(s.person_id, game.total) ?? gameCurve(p, game.game_id),
    score: round(game.total, 2),
  });
  claimTeam(teamId);
  claimPeople(p);
  heroCount += 1;
}

// ── 2 · Complete Defender — the radar card ──────────────────────────────────
// Three or more production components above a floor. Defenders naturally
// carry havoc / coverage / trench, which is a genuinely different shape from
// an offensive spike — the whole reason this card gets a radar.
// Ranked by BALANCE, not by raw PAR. A radar of a one-dimensional player is a
// sliver pointing at a single axis — technically accurate and visually useless.
// balance = 1 - (largest axis / sum of axes), so a genuinely three-phase
// player outranks a bigger name whose production all sits in one place. The
// chart has to earn its own card.
const balanceScore = (p) => {
  const live = COMPONENTS.map(([k]) => Number(p.season_components?.[k]) || 0).filter((v) => v > 1);
  if (live.length < 3) return 0;
  const sum = live.reduce((a, b) => a + b, 0);
  const balance = 1 - Math.max(...live) / sum;
  return sum * balance;
};
const multiComponent = producers
  .filter((p) => COMPONENTS.filter(([k]) => (Number(p.season_components?.[k]) || 0) > 1).length >= 3)
  .sort((a, b) => balanceScore(b) - balanceScore(a));
for (const p of multiComponent) {
  const teamId = normTeam(p.team);
  if (!underCap(teamId) || !isFree(p)) continue;
  const s = subject(p);
  const live = COMPONENTS.filter(([k]) => (Number(p.season_components?.[k]) || 0) > 1).length;
  push({
    archetype: "complete_defender",
    layout: "SOLO",
    icon: "shield",
    headline: `Production in ${live} phases — not just one`,
    subject: [s],
    stat_primary: { label: "Season PAR", value: round(p.par), context: `${live} phases` },
    stat_support: [{ label: "Games", value: p.games_played }],
    viz: productionRadar(p),
    score: round(p.par, 2),
  });
  claimTeam(teamId);
  claimPeople(p);
  break;
}

// ── 3 · Dual Threat — split, different program again ────────────────────────
const dualThreats = producers
  .filter((p) => {
    const total = Number(p.total_production) || 0;
    return total > 40 && Object.values(p.season_components ?? {}).filter((v) => v > 0 && v / total > 0.1).length >= 2;
  })
  .sort((a, b) => b.par - a.par);
for (const p of dualThreats) {
  const teamId = normTeam(p.team);
  if (!underCap(teamId) || !isFree(p)) continue;
  const s = subject(p);
  const parts = Object.entries(p.season_components ?? {})
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => [k.replace(/_production$/, ""), v]);
  push({
    archetype: "dual_threat",
    layout: "SOLO",
    icon: "zap",
    headline: "Beating teams two ways",
    subject: [s],
    stat_primary: { label: "Season PAR", value: round(p.par), context: `${parts.length} production types` },
    stat_support: parts.slice(0, 2).map(([k, v]) => ({ label: k, value: round(v) })),
    viz: split(parts.map(([k, v]) => [k, v])),
    score: round(p.par, 2),
  });
  claimTeam(teamId);
  claimPeople(p);
  break;
}

// ── 4 · Freshman — vertical leaderboard ─────────────────────────────────────
const freshmen = producers.filter((p) => p.roster.class_year === 1).sort((a, b) => b.par - a.par);
if (freshmen[0]) {
  push({
    archetype: "freshman_class",
    layout: "COHORT",
    icon: "sprout",
    headline: "These freshmen came to play",
    subject: freshmen.slice(0, 3).map(subject),
    stat_primary: { label: "Freshmen Producing", value: freshmen.length, context: "across 18 programs" },
    stat_support: [{ label: "Top Freshman", value: round(freshmen[0].par) }],
    viz: rankBars(freshmen, freshmen[0].name_display),
    score: round(freshmen[0].par, 2),
  });
}

// ── 5 · Transfers — donut, a share-of-whole claim ───────────────────────────
const transfers = producers.filter((p) => p.roster.is_transfer).sort((a, b) => b.par - a.par);
push({
  archetype: "transfer_impact",
  layout: "COHORT",
  icon: "arrows",
  headline: "These transfers are making their mark",
  subject: transfers.slice(0, 3).map(subject),
  stat_primary: { label: "Of All Producers", value: `${Math.round((transfers.length / producers.length) * 100)}%`, context: `${transfers.length} of ${producers.length}` },
  stat_support: [{ label: "Top Transfer", value: round(transfers[0].par) }],
  viz: donut(transfers.length, producers.length, "of producers"),
  score: round(transfers[0].par, 2),
});

// ── 6 · Duos ────────────────────────────────────────────────────────────────
const leagueTop = producers.slice().sort((a, b) => b.par - a.par).slice(0, 30);
const topByTeam = new Map();
leagueTop.forEach((p) => topByTeam.set(normTeam(p.team), [...(topByTeam.get(normTeam(p.team)) ?? []), p]));

// Pass Rush Tandem — two defensive linemen, one front. Feature duo (2x2).
for (const [teamId, group] of topByTeam) {
  const dl = group.filter((p) => ["DL", "DE", "EDGE"].includes(p.position));
  if (dl.length < 2 || !underCap(teamId, 2) || !isFree(dl[0], dl[1])) continue;
  const [a, b] = [subject(dl[0]), subject(dl[1])];
  push({
    archetype: "pass_rush_tandem",
    layout: "DUO",
    icon: "shield",
    headline: "They hunt in pairs",
    subject: [a, b],
    stat_primary: { label: "Combined PAR", value: round(dl[0].par + dl[1].par), context: "Same defensive front" },
    stat_support: [{ label: a.last_name, value: round(dl[0].par) }, { label: b.last_name, value: round(dl[1].par) }],
    viz: split([[a.last_name, dl[0].par], [b.last_name, dl[1].par]]),
    score: round(dl[0].par + dl[1].par, 2),
  });
  claimTeam(teamId);
  claimPeople(dl[0], dl[1]);
  break;
}

// Same Zip Code — two teammates, one hometown, both genuinely producing.
const hometownPairs = [];
const byTeamAll = new Map();
producers.forEach((p) => byTeamAll.set(normTeam(p.team), [...(byTeamAll.get(normTeam(p.team)) ?? []), p]));
byTeamAll.forEach((group, teamId) => {
  const byTown = new Map();
  group.forEach((p) => {
    if (p.roster.hometown) byTown.set(p.roster.hometown, [...(byTown.get(p.roster.hometown) ?? []), p]);
  });
  byTown.forEach((mates, town) => {
    if (mates.length < 2) return;
    const sorted = mates.sort((a, b) => b.par - a.par);
    if (sorted[1].par < 15) return; // both must actually be producing
    hometownPairs.push({ teamId, town, a: sorted[0], b: sorted[1], sum: sorted[0].par + sorted[1].par });
  });
});
hometownPairs.sort((x, y) => y.sum - x.sum);
for (const pair of hometownPairs) {
  if (!underCap(pair.teamId, 2) || !isFree(pair.a, pair.b)) continue;
  const [sa, sb] = [subject(pair.a), subject(pair.b)];
  push({
    archetype: "same_zip_code",
    layout: "DUO",
    icon: "pin",
    headline: `Both came out of ${pair.town}`,
    subject: [sa, sb],
    stat_primary: { label: "Combined PAR", value: round(pair.sum), context: pair.town },
    stat_support: [{ label: sa.last_name, value: round(pair.a.par) }, { label: sb.last_name, value: round(pair.b.par) }],
    viz: split([[sa.last_name, pair.a.par], [sb.last_name, pair.b.par]]),
    score: round(pair.sum, 2),
  });
  claimTeam(pair.teamId);
  claimPeople(pair.a, pair.b);
  break;
}

// ── 7 · State pipelines — the map cards ─────────────────────────────────────
const STATE_NAME = { FL: "Florida", TX: "Texas", MS: "Mississippi", LA: "Louisiana", GA: "Georgia", AL: "Alabama", NC: "North Carolina", SC: "South Carolina", VA: "Virginia", MD: "Maryland" };
const byState = new Map();
producers.forEach((p) => {
  if (p.roster.home_state) byState.set(p.roster.home_state, [...(byState.get(p.roster.home_state) ?? []), p]);
});
[...byState.entries()]
  .map(([state, group]) => ({ state, count: group.length, par: group.reduce((s, p) => s + p.par, 0), top: group.sort((a, b) => b.par - a.par).slice(0, 3) }))
  .sort((a, b) => b.par - a.par)
  .slice(0, 2)
  .forEach((st) => {
    push({
      archetype: "state_pipeline",
      layout: "COHORT",
      icon: "pin",
      headline: `${STATE_NAME[st.state] ?? st.state} is showing up and showing out`,
      subject: st.top.map(subject),
      stat_primary: { label: "Players Producing", value: st.count, context: STATE_NAME[st.state] ?? st.state },
      stat_support: [{ label: "Combined PAR", value: Math.round(st.par) }],
      viz: { kind: "state_map", state: st.state, state_name: STATE_NAME[st.state] ?? st.state },
      score: round(st.par, 2),
    });
  });

// ── 8 · Coaches — thin by design, no profile page exists yet ────────────────
const firstYear = coaches.schools.filter((s) => s.head_coach?.tenure_year === 1);
const coachSubject = (school) => ({
  coach_id: school.head_coach?.coach_id,
  name: school.head_coach?.name,
  team_id: normTeam(school.school_id),
  team_name: school.school_name,
  team_logo: teamById.get(normTeam(school.school_id))?.logo ?? null,
  tenure_year: school.head_coach?.tenure_year,
});
push({
  archetype: "first_year_coach",
  layout: "COACH",
  icon: "clipboard",
  headline: `${firstYear.length} programs opened 2025 with a new head coach`,
  subject: firstYear.map(coachSubject),
  stat_primary: { label: "First-Year Head Coaches", value: firstYear.length, context: "of 18 programs" },
  stat_support: [],
  viz: null,
  score: firstYear.length,
});

// ── write ───────────────────────────────────────────────────────────────────
const feed = {
  season: 2025,
  generated_at: new Date().toISOString(),
  source: "scripts/build_people_hub_cards.js — derived from real 2025 exports",
  engine_note:
    "Placeholder ranking. Coverage balance IS applied (per-team cap); recency, opponent quality and novelty decay are backend work. See reqs/PEOPLE_HUB_CARD_INVENTORY.md §Scoring.",
  cards,
};

["reqs/mock/people_hub_cards_2025.json", "public/data/3-players/people_hub_cards_2025.json"].forEach((rel) => {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${JSON.stringify(feed, null, 2)}\n`);
  console.log(`wrote ${rel}`);
});
console.log(`\n${cards.length} cards · ${new Set(cards.flatMap((c) => c.subject.map((s) => s.team_id))).size} programs represented`);
cards.forEach((c) => console.log(`  ${c.layout.padEnd(7)} ${(c.viz?.kind ?? "—").padEnd(18)} ${c.subject[0]?.name ?? c.subject[0]?.team_name} — ${c.headline}`));
