import { ratio, pct } from "./phasePresentation";

const SIDES_STD = [
  { label: "Offense", root: "offense", base: "", prefix: "o" },
  { label: "Defense allowed", root: "defense", base: "", prefix: "d", flip: true },
];

const SIDES_DEFENSE = [
  { label: "Team defense", root: "offense", base: "defense.", prefix: "d" },
  { label: "Opponent defense", root: "defense", base: "defense.", prefix: "o", flip: true },
];

const SIDES_TEAM = [
  { label: "Team", root: "offense", base: "", prefix: "o" },
  { label: "Opponent", root: "defense", base: "", prefix: "d", flip: true },
];

const f = (label, src, key, fmt, opts = {}) => ({ label, src, key, fmt, ...opts });

const rz = (b) => b?.conversions?.red_zone ?? {};

export const PHASES = [
  {
    id: "passing", title: "Passing", sides: SIDES_STD, map: "pass",
    head: [
      f("Attempts", "count", "passing.att", "n0", { high: true }),
      f("Completion %", "count", "passing.pct", "pct", { high: true }),
      f("Yards / Att", "count", "passing.avg_a", "n1", { high: true }),
      f("EPA / Att", "tape", "epa_pass", "signed2"),
      f("Touchdowns", "count", "passing.td", "n0", { high: true }),
    ],
    full: [
      f("Attempts", "count", "passing.att", "n0", { high: true }),
      f("Completions", "count", "passing.cmp", "n0", { high: true }),
      f("Completion %", "count", "passing.pct", "pct", {
        high: true,
        note: (b) => (Number.isFinite(b?.passing?.att) ? `${b.passing.cmp} of ${b.passing.att}` : null),
      }),
      f("Yards", "count", "passing.yds", "n0", { high: true }),
      f("Yards / Att", "count", "passing.avg_a", "n1", { high: true }),
      f("Yards / Game", "count", "passing.avg_g", "n1", { high: true }),
      f("Touchdowns", "count", "passing.td", "n0", { high: true }),
      f("Interceptions", "count", "passing.int", "n0", { high: false }),
      f("Long", "count", "passing.long", "n0", { high: true }),
      f("Completion Rate", "hub", "passing.completionRate", "pct"),
      f("Yards / Attempt", "hub", "passing.ypa", "n2"),
      f("Explosive Rate", "hub", "passing.explosiveRate", "pct"),
      f("Pressure Rate", "hub", "passing.pressureRate", "pct"),
      f("EPA / Attempt", "tape", "epa_pass", "signed2"),
      f("Success Rate", "tape", "success_pass", "pct"),
      f("Explosiveness", "adv", "explosiveness", "n2"),
    ],
  },
  {
    id: "rushing", title: "Rushing", sides: SIDES_STD, map: "rush",
    head: [
      f("Attempts", "count", "rushing.att", "n0", { high: true }),
      f("Yards", "count", "rushing.yds", "n0", { high: true }),
      f("Yards / Carry", "count", "rushing.avg", "n1", { high: true }),
      f("EPA / Rush", "tape", "epa_rush", "signed2"),
      f("Touchdowns", "count", "rushing.td", "n0", { high: true }),
    ],
    full: [
      f("Attempts", "count", "rushing.att", "n0", { high: true }),
      f("Yards", "count", "rushing.yds", "n0", { high: true }),
      f("Yards / Carry", "count", "rushing.avg", "n1", { high: true }),
      f("Yards / Game", "count", "rushing.avg_g", "n1", { high: true }),
      f("Touchdowns", "count", "rushing.td", "n0", { high: true }),
      f("Long", "count", "rushing.long", "n0", { high: true }),
      f("Success Rate", "hub", "rushing.successRate", "pct"),
      f("Opportunity Rate", "hub", "rushing.opportunityRate", "pct"),
      f("Stuff Rate", "hub", "rushing.stuffRate", "pct"),
      f("Stop Rate", "hub", "rushing.stopRate", "pct"),
      f("Power Stop Rate", "hub", "rushing.powerStopRate", "pct"),
      f("TFL Rate", "hub", "rushing.tflRate", "pct"),
      f("Line Yards", "adv", "line_yards", "n2"),
      f("Second Level", "adv", "second_level", "n2"),
      f("Open Field", "adv", "open_field", "n2"),
      f("Power Success", "adv", "power_success", "pct"),
      f("EPA / Rush", "tape", "epa_rush", "signed2"),
    ],
  },
  {
    id: "defense", title: "Defense & havoc", sides: SIDES_DEFENSE, map: "havoc",
    head: [
      f("Total Tackles", "count", "tot", "n0", { high: true }),
      f("TFL", "count", "tfl", "n1", { high: true }),
      f("Sacks", "count", "sacks", "n1", { high: true }),
      f("Takeaways", "calc", "takeaways", "n0", { high: true, num: (b) => (b ? (b.int ?? 0) + (b.fr ?? 0) : undefined) }),
      f("Front-Seven Havoc", "adv", "havoc_front7", "pct"),
    ],
    full: [
      f("Total Tackles", "count", "tot", "n0", { high: true }),
      f("Unassisted", "count", "ua", "n0", { high: true }),
      f("Assisted", "count", "a", "n0", { high: true }),
      f("TFL", "count", "tfl", "n1", { high: true }),
      f("Sacks", "count", "sacks", "n1", { high: true }),
      f("QB Hurries", "count", "qbh", "n0", { high: true }),
      f("Interceptions", "count", "int", "n0", { high: true }),
      f("Break-ups", "count", "brup", "n0", { high: true }),
      f("Forced Fumbles", "count", "ff", "n0", { high: true }),
      f("Fumbles Recovered", "count", "fr", "n0", { high: true }),
      f("Blocked Kicks", "count", "blk", "n0", { high: true }),
      f("Safeties", "count", "saf", "n0", { high: true }),
      f("Front-Seven Havoc", "adv", "havoc_front7", "pct"),
      f("Defensive-Back Havoc", "adv", "havoc_db", "pct"),
    ],
  },
  {
    id: "scoring", title: "Scoring & drives", sides: SIDES_STD,
    head: [
      f("Points", "count", "scoring.pts", "n0", { high: true }),
      f("Points / Game", "count", "scoring.avg_g", "n1", { high: true }),
      f("Touchdowns", "count", "scoring.td", "n0", { high: true }),
      f("Pts / Opportunity", "adv", "points_per_opp", "n2"),
      f("Red Zone TD %", "calc", "rz_td", "pct", { high: true, num: (b) => (rz(b).att ? rz(b).td / rz(b).att : undefined) }),
    ],
    full: [
      f("Points", "count", "scoring.pts", "n0", { high: true }),
      f("Points / Game", "count", "scoring.avg_g", "n1", { high: true }),
      f("Touchdowns", "count", "scoring.td", "n0", { high: true }),
      f("Field Goals", "count", "scoring.fg", "n0", { high: true }),
      f("Extra Points", "count", "scoring.xpt", "n0", { high: true }),
      f("Two-Point", "count", "scoring.two_pt", "n0", { high: true }),
      f("Safeties", "count", "scoring.saf", "n0", { high: true }),
      f("Red Zone Trips", "count", "conversions.red_zone.att", "n0", { high: true }),
      f("Red Zone Scores", "calc", "rz_scores", "pct", {
        high: true,
        num: (b) => (rz(b).att ? rz(b).scores / rz(b).att : undefined),
        text: (b) => ratio(rz(b).scores, rz(b).att),
      }),
      f("Red Zone TD", "calc", "rz_td2", "pct", {
        high: true,
        num: (b) => (rz(b).att ? rz(b).td / rz(b).att : undefined),
        text: (b) => ratio(rz(b).td, rz(b).att),
      }),
      f("Red Zone FG", "calc", "rz_fg", "pct", {
        high: false,
        num: (b) => (rz(b).att ? rz(b).fg / rz(b).att : undefined),
        text: (b) => ratio(rz(b).fg, rz(b).att),
      }),
      f("EPA / Drive", "tape", "epa_drive", "signed2"),
      f("Scoring Opportunities", "adv", "scoring_opps", "n0"),
      f("Pts / Opportunity", "adv", "points_per_opp", "n2"),
    ],
  },
  {
    id: "situational", title: "Situational", sides: SIDES_STD,
    head: [
      f("3rd Down", "count", "conversions.third.pct", "pct", { high: true }),
      f("4th Down", "count", "conversions.fourth.pct", "pct", { high: true }),
      f("Avg 3rd Distance", "tape", "third_dist", "n2"),
      f("First Downs", "count", "misc.first_downs", "n0", { high: true }),
      f("Avg Start", "adv", "avg_start", "fp"),
    ],
    full: [
      f("3rd Down", "count", "conversions.third.pct", "pct", {
        high: true,
        note: (b) => ratio(b?.conversions?.third?.conv, b?.conversions?.third?.att),
      }),
      f("4th Down", "count", "conversions.fourth.pct", "pct", {
        high: true,
        note: (b) => ratio(b?.conversions?.fourth?.conv, b?.conversions?.fourth?.att),
      }),
      f("Avg 3rd Distance", "tape", "third_dist", "n2"),
      f("3rd/4th Success", "tape", "third_succ", "pct"),
      f("Standard-Down Success", "adv", "std_down_success", "pct"),
      f("Passing-Down Success", "adv", "pass_down_success", "pct"),
      f("Early Downs EPA", "tape", "early_epa", "signed2"),
      f("Available Yards %", "tape", "avail_yds", "pct"),
      f("First Downs", "count", "misc.first_downs", "n0", { high: true }),
      f("FD Rushing", "count", "misc.fd_rush", "n0", { high: true }),
      f("FD Passing", "count", "misc.fd_pass", "n0", { high: true }),
      f("FD Penalty", "count", "misc.fd_pen", "n0", { high: false }),
      f("Fumbles", "count", "misc.fum", "n0", {
        high: false,
        note: (b) => (Number.isFinite(b?.misc?.fum_lost) ? `${b.misc.fum_lost} lost` : null),
      }),
      f("Penalties", "count", "misc.pen", "n0", {
        high: false,
        note: (b) => (Number.isFinite(b?.misc?.pen_yds) ? `${b.misc.pen_yds} yards` : null),
      }),
      f("Time of Possession", "count", "misc.top_avg", "clock", { high: true }),
      f("Average Start", "adv", "avg_start", "fp"),
    ],
  },
  {
    id: "special", title: "Special teams", sides: SIDES_TEAM,
    head: [
      f("Punt Avg", "count", "kicking.punting.avg", "n1", { high: true }),
      f("Inside 20", "count", "kicking.punting.i20", "n0", { high: true }),
      f("Field Goals", "calc", "fg_pct", "pct", {
        high: true,
        num: (b) => b?.kicking?.fg?.pct,
        text: (b) => ratio(b?.kicking?.fg?.fgm, b?.kicking?.fg?.fga),
      }),
      f("KR Avg", "count", "returns.kr.avg", "n1", { high: true }),
      f("PR Avg", "count", "returns.pr.avg", "n1", { high: true }),
    ],
    full: [
      f("Punts", "count", "kicking.punting.no", "n0", { high: false }),
      f("Punt Yards", "count", "kicking.punting.yds", "n0", { high: true }),
      f("Punt Avg", "count", "kicking.punting.avg", "n1", { high: true }),
      f("Punt Long", "count", "kicking.punting.long", "n0", { high: true }),
      f("Inside 20", "count", "kicking.punting.i20", "n0", { high: true }),
      f("Touchbacks", "count", "kicking.punting.tb", "n0", { high: false }),
      f("Fair Catches", "count", "kicking.punting.fc", "n0", { high: true }),
      f("Punts Blocked", "count", "kicking.punting.blk", "n0", { high: false }),
      f("Field Goals", "calc", "fg_pct2", "pct", {
        high: true,
        num: (b) => b?.kicking?.fg?.pct,
        text: (b) => ratio(b?.kicking?.fg?.fgm, b?.kicking?.fg?.fga),
        note: (b) => pct(b?.kicking?.fg?.pct),
      }),
      f("FG Long", "count", "kicking.fg.long", "n0", { high: true }),
      f("FG Blocked", "count", "kicking.fg.blk", "n0", { high: false }),
      f("Extra Points", "calc", "pat", "pct", {
        high: true,
        num: (b) => (b?.kicking?.fg?.pat_att ? b.kicking.fg.pat_made / b.kicking.fg.pat_att : undefined),
        text: (b) => ratio(b?.kicking?.fg?.pat_made, b?.kicking?.fg?.pat_att),
      }),
      f("Kick Returns", "count", "returns.kr.no", "n0", {
        high: true,
        note: (b) => (Number.isFinite(b?.returns?.kr?.yds) ? `${b.returns.kr.yds} yards` : null),
      }),
      f("KR Avg", "count", "returns.kr.avg", "n1", {
        high: true,
        note: (b) => (Number.isFinite(b?.returns?.kr?.long) ? `long ${b.returns.kr.long}` : null),
      }),
      f("KR Touchdowns", "count", "returns.kr.td", "n0", { high: true }),
      f("Punt Returns", "count", "returns.pr.no", "n0", {
        high: true,
        note: (b) => (Number.isFinite(b?.returns?.pr?.yds) ? `${b.returns.pr.yds} yards` : null),
      }),
      f("PR Avg", "count", "returns.pr.avg", "n1", {
        high: true,
        note: (b) => (Number.isFinite(b?.returns?.pr?.long) ? `long ${b.returns.pr.long}` : null),
      }),
      f("PR Touchdowns", "count", "returns.pr.td", "n0", { high: true }),
    ],
  },
  {
    id: "totals", title: "Totals", sides: SIDES_STD,
    head: [
      f("Plays", "count", "totals.plays", "n0", { high: true }),
      f("Yards", "count", "totals.yds", "n0", { high: true }),
      f("Yards / Play", "count", "totals.avg_p", "n1", { high: true }),
      f("Yards / Game", "count", "totals.avg_g", "n1", { high: true }),
      f("Touchdowns", "count", "totals.td", "n0", { high: true }),
    ],
    full: [
      f("Plays", "count", "totals.plays", "n0", { high: true }),
      f("Total Yards", "count", "totals.yds", "n0", { high: true }),
      f("Yards / Play", "count", "totals.avg_p", "n1", { high: true }),
      f("Yards / Game", "count", "totals.avg_g", "n1", { high: true }),
      f("Rushing Yards", "count", "totals.rush", "n0", { high: true }),
      f("Passing Yards", "count", "totals.pass", "n0", { high: true }),
      f("Touchdowns", "count", "totals.td", "n0", { high: true }),
    ],
  },
];
