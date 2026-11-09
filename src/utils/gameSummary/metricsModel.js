import { normTeamId } from "./teamIdentity";

// Extracted from GameSummaryTabV2; statistical semantics and layout are unchanged.

/** Connelly's rule: 50% of the yards needed on 1st down, 70% on 2nd, all of them after. */
const isSuccessfulPlay = (down, distance, gained) => {
  if (down === 1) return gained >= distance * 0.5;
  if (down === 2) return gained >= distance * 0.7;
  return gained >= distance;
};

export const fInt = (v) => (v == null ? "—" : String(Math.round(v)));

const f1 = (v) => (v == null ? "—" : v.toFixed(1));

const f2 = (v) => (v == null ? "—" : v.toFixed(2));

const fPct = (v) => (v == null ? "—" : `${Math.round(v * 100)}%`);

const fSigned = (v) => (v == null ? "—" : v > 0 ? `+${v}` : String(v));

// One formatter/direction per metric KEY, shared by both render paths — the derived
// blocks below and the real `advanced_basics.blocks` from the 2026 export — so a metric
// prints identically regardless of which one supplied it. `better` picks which of the
// two team values gets set in white: `true` for higher-is-better, `"low"` for the
// handful (turnovers, committed) where fewer is the win. Left unset where there's no
// clear direction — drive count, play count — rather than implying 15 drives beats 13.
export const KEY_META = {
  drives: { fmt: fInt },
  plays: { fmt: fInt },
  yards: { fmt: fInt, better: true },
  opps: { fmt: fInt, better: true },
  avgFp: { fmt: f1, better: true },
  toCommitted: { fmt: fInt, better: "low" },
  turnovers: { fmt: fInt, better: "low" },
  toForced: { fmt: fInt, better: true },
  expectedTos: { fmt: f1, better: "low" },
  toMargin: { fmt: fSigned, better: true },
  expectedToMargin: { fmt: fSigned, better: true },
  toLuckPts: { fmt: fSigned, better: true },
  playsPerDrive: { fmt: f1 },
  yardsPerPlay: { fmt: f1, better: true },
  yardsPerDrive: { fmt: f1, better: true },
  oppsPerDrive: { fmt: f2, better: true },
  pointsPerOpp: { fmt: f2, better: true },
  q1: { fmt: fPct, better: true },
  q2: { fmt: fPct, better: true },
  q3: { fmt: fPct, better: true },
  q4: { fmt: fPct, better: true },
  srRush: { fmt: fPct, better: true },
  srPass: { fmt: fPct, better: true },
  srStd: { fmt: fPct, better: true },
  srPassDn: { fmt: fPct, better: true },
  srGame: { fmt: fPct, better: true },
};

// Column heads, keyed on the metric key so BOTH paths through this card use them —
// the export's own `m.label` and the derived fallback below. Those had drifted:
// a game shipping `advanced_basics` printed the backend's wording verbatim
// ("Expected TO Margin", "Points/Opp") while a game without one printed our short
// forms, so the same column was named two different things depending on season.
//
// Two rules, both forced by a ~40px column:
//   • at most two words, so a head is at most two lines
//   • the space goes where the break should go — "Plays/ Dr", not "Plays/Dr",
//     which has nowhere to break and snaps mid-word instead
// The x- prefix is the analytics convention (xG, xEPA): xTOs is expected
// turnovers, xTO Marg the expected margin.
const BASICS_HEADS = {
  drives: "Drv",
  plays: "Plays",
  yards: "Yards",
  opps: "Sc Opps",
  avgFp: "Avg FP",

  turnovers: "TOs",
  toCommitted: "TOs",
  toForced: "Forced",
  expectedTos: "xTOs",
  toMargin: "TO Marg",
  expectedToMargin: "xTO Marg",
  toLuckPts: "TO Luck",

  playsPerDrive: "Play/ Dr",
  yardsPerPlay: "Yd/ Play",
  yardsPerDrive: "Yd/ Dr",
  oppsPerDrive: "Opp/ Dr",
  pointsPerOpp: "Pts/ Opp",

  q1: "Q1",
  q2: "Q2",
  q3: "Q3",
  q4: "Q4",

  srRush: "Rush",
  srPass: "Pass",
  srStd: "Std Dn",
  srPassDn: "Pass Dn",
  srGame: "Game",
};

/** The short head for a column, falling back to whatever the export called it. */
export const headFor = (key, label) => BASICS_HEADS[key] ?? label;

// The 2026 export keys each metric by its source field path ("derived.plays_per_drive",
// "advanced_team.success_rate"), not by the short keys KEY_META / BASICS_HEADS use. Without
// this map every cell fell to the integer formatter — 5.3 printed as 5, 0.44 as 0. The
// raw path is kept alongside: it is also the key into `shared/league_avg_{season}.json`.
const KEY_ALIAS = {
  "team_box.drives_offense": "drives",
  "team_box.plays_offense": "plays",
  "team_box.total_yards": "yards",
  "advanced_team.opportunities_40": "opps",
  "team_box.avg_start_field_position": "avgFp",
  "team_box.turnovers_committed": "toCommitted",
  "team_box.turnovers": "turnovers",
  "team_box.turnovers_forced": "toForced",
  "team_box.expected_turnovers": "expectedTos",
  "team_box.turnover_margin": "toMargin",
  "team_box.expected_turnover_margin": "expectedToMargin",
  "team_box.turnover_luck_pts": "toLuckPts",
  "derived.plays_per_drive": "playsPerDrive",
  "derived.yards_per_play": "yardsPerPlay",
  "derived.yards_per_drive": "yardsPerDrive",
  "derived.opps_per_drive": "oppsPerDrive",
  "advanced_team.points_per_opportunity_40": "pointsPerOpp",
  "derived.sr_q1": "q1",
  "derived.sr_q2": "q2",
  "derived.sr_q3": "q3",
  "derived.sr_q4": "q4",
  "splits.rushing.total.success_rate": "srRush",
  "splits.passing.total.success_rate": "srPass",
  "advanced_team.success_rate_standard_down": "srStd",
  "advanced_team.success_rate_passing_down": "srPassDn",
  "advanced_team.success_rate": "srGame",
};

export const shortKey = (key) => KEY_ALIAS[key] ?? key;

// Column titles break on spaces, so every multi-word head is written with one — "Sc Opps",
// "Plays/ Dr" — and wraps to a second line instead of clipping in a 40px column. This is
// the FALLBACK block list, used only when a game carries no `advanced_basics` — its
// Turnovers block has three columns because Committed/Forced/Margin are all that's
// derivable; the real export's Turnovers block has five (see the note above).
export const BASIC_BLOCKS = [
  {
    label: "Drives",
    metrics: [
      { key: "drives", label: "Drives" },
      { key: "plays", label: "Plays" },
      { key: "yards", label: "Yards" },
      { key: "opps", label: "Sc Opps" },
      { key: "avgFp", label: "Avg FP" },
    ],
  },
  {
    label: "Turnovers",
    metrics: [
      { key: "toCommitted", label: "Committed" },
      { key: "toForced", label: "Forced" },
      { key: "toMargin", label: "Margin" },
    ],
  },
  {
    label: "Per Drive",
    metrics: [
      { key: "playsPerDrive", label: "Plays/ Dr" },
      { key: "yardsPerDrive", label: "Yards/ Dr" },
      { key: "oppsPerDrive", label: "Opps/ Dr" },
      { key: "pointsPerOpp", label: "Pts/ Opp" },
    ],
  },
  {
    label: "SR By Qtr",
    metrics: [
      { key: "q1", label: "Q1" },
      { key: "q2", label: "Q2" },
      { key: "q3", label: "Q3" },
      { key: "q4", label: "Q4" },
    ],
  },
  {
    label: "Success Rt",
    metrics: [
      { key: "srRush", label: "Rush" },
      { key: "srPass", label: "Pass" },
      { key: "srStd", label: "Std Dn" },
      { key: "srPassDn", label: "Pass Dn" },
      { key: "srGame", label: "Game" },
    ],
  },
];

export const buildBasics = (drives, plays, teamId, box) => {
  const want = normTeamId(teamId);
  // 2026 drives nest their field position under `start.spot_absolute` / `end.spot_absolute`
  // rather than the flat `start_yardline_absolute` / `end_yardline_absolute` every earlier
  // season uses. That's fine here — every 2026 game ships `advanced_basics` and this
  // derivation path is never reached for one (see AdvancedBasicsCard) — but the flat reads
  // below are only ever correct against the pre-2026 shape.
  const own = (drives ?? []).filter((d) => normTeamId(d.offense_team) === want);
  const n = own.length;
  const sumOf = (field) => own.reduce((s, d) => s + (d[field] || 0), 0);
  const playsTotal = sumOf("plays_total");
  const yards = sumOf("yards_net");
  const points = sumOf("points");
  const opps = own.filter((d) => (d.end_yardline_absolute ?? 0) >= 60).length;

  const bucket = () => ({ att: 0, ok: 0 });
  const quarters = [bucket(), bucket(), bucket(), bucket()];
  const rush = bucket();
  const pass = bucket();
  const std = bucket();
  const passDown = bucket();
  const all = bucket();

  (plays ?? []).forEach((play) => {
    if (normTeamId(play.offense_team) !== want) return;
    const type = play.play_type;
    // A sack is a failed passing play, not an absent one — leaving it out flatters
    // every passing success rate on the card.
    if (type !== "RUSH" && type !== "PASS" && type !== "SACK") return;
    if (!play.down || !play.distance) return;
    const gained = (play.actions ?? []).find((a) => a.type === type)?.net_yards ?? 0;
    const ok = isSuccessfulPlay(play.down, play.distance, gained) ? 1 : 0;
    const bump = (b) => {
      b.att += 1;
      b.ok += ok;
    };
    bump(all);
    if (quarters[play.quarter - 1]) bump(quarters[play.quarter - 1]);
    bump(type === "RUSH" ? rush : pass);
    bump(play.down === 1 || (play.down === 2 && play.distance <= 8) ? std : passDown);
  });

  const rateOf = (b) => (b.att > 0 ? b.ok / b.att : null);

  // Real, straight off team_box — no derivation needed.
  const toCommitted = box?.turnovers_committed ?? null;
  const toForced = box?.turnovers_forced ?? null;
  const toMargin = toCommitted != null && toForced != null ? toForced - toCommitted : null;

  return {
    drives: n,
    toCommitted,
    toForced,
    toMargin,
    plays: playsTotal,
    yards,
    opps,
    avgFp: n > 0 ? sumOf("start_yardline_absolute") / n : null,
    playsPerDrive: n > 0 ? playsTotal / n : null,
    yardsPerDrive: n > 0 ? yards / n : null,
    oppsPerDrive: n > 0 ? opps / n : null,
    pointsPerOpp: opps > 0 ? points / opps : null,
    q1: rateOf(quarters[0]),
    q2: rateOf(quarters[1]),
    q3: rateOf(quarters[2]),
    q4: rateOf(quarters[3]),
    srRush: rateOf(rush),
    srPass: rateOf(pass),
    srStd: rateOf(std),
    srPassDn: rateOf(passDown),
    srGame: rateOf(all),
  };
};

/**
 * White for the ahead value, dimmed for the other — but only where a direction exists.
 * `better: "low"` flips the comparison for the metrics (turnovers, committed) where the
 * smaller number is the win.
 */
export const metricInk = (key, value, otherValue) => {
  const better = KEY_META[key]?.better;
  if (!better || value == null || otherValue == null || value === otherValue) {
    return "rgba(255,255,255,0.82)";
  }
  const ahead = better === "low" ? value < otherValue : value > otherValue;
  return ahead ? "white" : "rgba(255,255,255,0.4)";
};

/**
 * Cell shading, after the reference sheet (inspo/abs2.jpg): each value is tinted against
 * the league average — green when it's on the good side, red when it isn't — and the
 * tint deepens with the distance, scaled to the league's own spread (avg→max on the good
 * side, avg→min on the bad). Metrics with no direction (drive count, play count, plays
 * per drive) stay untinted, as does anything without a league entry.
 */
export const metricShade = (key, value, league) => {
  const better = KEY_META[key]?.better;
  if (!better || value == null || !league || league.avg == null) return null;
  const dev = better === "low" ? league.avg - value : value - league.avg;
  const span = dev >= 0
    ? (better === "low" ? league.avg - (league.min ?? league.avg) : (league.max ?? league.avg) - league.avg)
    : (better === "low" ? (league.max ?? league.avg) - league.avg : league.avg - (league.min ?? league.avg));
  const t = span > 0 ? Math.min(1, Math.abs(dev) / span) : 0;
  if (t < 0.04) return null;
  const alpha = 0.1 + 0.42 * t;
  return dev >= 0 ? `rgba(34,197,94,${alpha.toFixed(2)})` : `rgba(239,68,68,${alpha.toFixed(2)})`;
};

/** The formatter for a metric's value. */
export const metricFmt = (key) => KEY_META[key]?.fmt ?? fInt;
