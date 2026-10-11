// The glossary — one source, two consumers.
//
// The Glossary tab renders this; every tooltip on the site reads from it. Add
// a term once and it shows up in both.
//
// DEFINITIONS: where GameOnPaper defines a term we also carry, their wording
// is used verbatim and marked `source: "gop"` — there is no reason to invent
// a second definition of success rate. Terms they don't cover are ours,
// marked `source: "ours"`.
//
// ONE MAPPING TO WATCH: GOP's "Stop Rate" is a DRIVE stat (drives ending in a
// punt or turnover). Ours is a RUSHING stat, so it maps to their "Stopped
// run" instead. Their drive-level version is carried separately, as a term we
// do not compute yet.
//
// `tier`: "core" gets a full card in the tab; "box" is plain counting
// vocabulary that only needs to answer a tooltip.
// `metric`: the hub key, where one exists — that is what pulls a term's real
// correlation with winning, its league leader and the league average.
// `status`: "real" or "mock" (a stand-in until the backend ships it).
// `math`: the definition as arithmetic — { num, den } renders as a fraction,
//   { expr } as a single line. Short enough to read on a tile.

const E = (term, def, opts = {}) => ({
  term,
  def,
  family: "core",
  tier: "core",
  source: "ours",
  status: "real",
  math: null,
  aliases: [],
  ...opts,
});

export const GLOSSARY = [
  // ── The core ideas ────────────────────────────────────────────────────────
  E("Expected Points Added", "The change in expected points caused by one play, based on down, distance, field position, and time.", {
    source: "gop", status: "real", aliases: ["epa"],
    formula: "EPA = expected points after − expected points before",
    math: { expr: "EP after − EP before" },
  }),
  E("EPA / Play", "Total expected points added divided by plays, to measure offensive and defensive efficiency.", {
    source: "gop", status: "real", aliases: ["epa / play", "epa/play"],
  }),
  E("Adjusted EPA / Play", "EPA per play corrected for who a team played and when, by adjusting for opponent strength and home-field advantage.", {
    source: "gop", status: "real", aliases: ["net adj epa/play", "adj epa / play"],
  }),
  E("Net EPA / Play", "A team's offensive EPA minus defensive EPA allowed per play.", {
    source: "gop", status: "real", aliases: ["net epa/play"],
  }),
  E("EPA / Pass", "Expected points added per pass attempt. Positive means the average throw left the offense better off than the down and distance predicted.", {
    status: "real", family: "passing", aliases: ["epa / att", "epa / attempt", "epa/pass"],
  }),
  E("EPA / Rush", "Expected points added per carry.", {
    status: "real", family: "rushing", aliases: ["epa / rush", "epa/rush"],
  }),
  E("EPA / Drive", "Expected points added per possession.", {
    status: "real", family: "scoring", aliases: ["epa / drive"],
  }),
  E("Success Rate", "A play with positive EPA; success rate measures the share of plays achieving this threshold.", {
    source: "gop", metric: "rushing.successRate",
    math: { num: "plays with EPA > 0", den: "all plays" },
    aliases: ["success rate", "offense success", "defense success", "rush success", "rush success allowed"],
  }),
  E("Explosiveness", "Pass plays gaining over 2.4 EPA or rush plays over 1.8 EPA; explosiveness is the share of plays exceeding these thresholds.", {
    source: "gop", status: "real", aliases: ["explosive rate", "explosive play", "explosiveness"],
    metric: "passing.explosiveRate",
  }),
  E("Havoc Rate", "The share of a defense's plays on which it either recorded a tackle for loss, forced a fumble or defensed a pass.", {
    source: "gop", status: "real", family: "defense", aliases: ["havoc"],
    math: { num: "TFL + FF + passes defensed", den: "all plays" },
  }),
  E("Front-Seven Havoc", "Havoc plays made by the defensive line and linebackers.", {
    status: "real", family: "defense", aliases: ["front-seven havoc"],
  }),
  E("Defensive-Back Havoc", "Havoc plays made by the secondary.", {
    status: "real", family: "defense", aliases: ["defensive-back havoc"],
  }),
  E("Garbage Time", "Plays run after a game is effectively decided, using score-margin thresholds by quarter.", {
    source: "gop", status: "real",
  }),

  // ── Rushing ───────────────────────────────────────────────────────────────
  E("Rush Opportunity", "Carries in which the offensive line “does its job” and produces at least four yards.", {
    source: "gop", family: "rushing", metric: "rushing.opportunityRate",
    aliases: ["opportunity rate"],
  }),
  E("Stuffed Run", "Rushing play where the runner is tackled at or behind the line of scrimmage.", {
    source: "gop", family: "rushing", metric: "rushing.stuffRate", aliases: ["stuff rate", "stuff"],
    math: { expr: "rush gain ≤ 0 yards" },
  }),
  E("Stopped Run", "Rushing play gaining zero to two yards.", {
    source: "gop", family: "rushing", metric: "rushing.stopRate", aliases: ["stop rate"],
  }),
  E("Power Run", "Runs on third or fourth down, two yards or less to go, that achieved a first down or touchdown.", {
    source: "gop", family: "rushing", metric: "rushing.powerStopRate",
    aliases: ["power success", "power stop rate", "power"],
  }),
  E("OL Line Yards", "Portion of rushes that are credited to the work of the offensive line. Yards lost count 1.2×, the first four yards in full, the fifth to tenth at half, and anything past ten not at all.", {
    source: "gop", status: "real", family: "rushing", aliases: ["line yards", "line yards / rush"],
    math: { num: "yards 0–4 ×1 · 5–10 ×½ · 11+ ×0", den: "carries" },
  }),
  E("Highlight Yards", "Portion of a given run that is credited only to the running back.", {
    source: "gop", status: "real", family: "rushing", aliases: ["highlight yards"],
    math: { num: "rush yards − line yards", den: "4+ yard carries" },
  }),
  E("Second-Level Yards", "Rushing yards earned between 5 and 10 yards past the line — the back beating the linebackers.", {
    status: "real", family: "rushing", aliases: ["second level", "second-level yards"],
  }),
  E("Open-Field Yards", "Rushing yards earned more than 10 yards past the line — the back beating the secondary.", {
    status: "real", family: "rushing", aliases: ["open field", "open-field yards"],
  }),
  E("TFL Rate", "Runs losing yardage. Worth knowing: in this league, forcing more run TFLs correlates slightly negatively with winning.", {
    family: "rushing", metric: "rushing.tflRate", aliases: ["tfl rate"],
  }),
  E("Yards / Carry", "Rushing yards per attempt.", { family: "rushing", tier: "box", aliases: ["yards / carry", "avg"] }),

  // ── Passing ───────────────────────────────────────────────────────────────
  E("Completion Rate", "Share of attempts completed, counted off the play-by-play rather than the box score.", {
    family: "passing", metric: "passing.completionRate", aliases: ["completion rate", "completion allowed", "comp"],
  }),
  E("Yards / Attempt", "Yards gained per pass attempt.", {
    family: "passing", metric: "passing.ypa", aliases: ["yards / attempt", "yards / att", "ypa"],
  }),
  E("Pressure Rate", "How often the quarterback is pressured.", {
    family: "passing", metric: "passing.pressureRate", aliases: ["pressure rate", "press"],
  }),
  E("Average Depth of Target", "How far downfield the average throw travelled, measured from the line of scrimmage.", {
    status: "mock", family: "passing", aliases: ["adot", "average depth of target"],
  }),

  // ── Defense ───────────────────────────────────────────────────────────────
  E("Drive Stop Rate", "The percentage of a defense's drives that end in punts, turnovers or a turnover on downs. Not the same as our rushing Stop Rate.", {
    source: "gop", status: "mock", family: "defense", aliases: ["drive stop rate"],
  }),
  E("Tackle Share", "A defender's tackles plus half of their assists, as a share of the team's total.", {
    source: "gop", status: "mock", family: "defense", aliases: ["tackle share"],
  }),
  E("Total Tackles", "Unassisted plus assisted tackles.", { family: "defense", tier: "box", aliases: ["total tackles", "tackles"] }),
  E("Unassisted", "Tackles made alone.", { family: "defense", tier: "box", aliases: ["unassisted", "ua"] }),
  E("Assisted", "Tackles shared with a teammate.", { family: "defense", tier: "box", aliases: ["assisted"] }),
  E("Tackles For Loss", "Plays stopped behind the line of scrimmage.", { family: "defense", tier: "box", aliases: ["tfl"] }),
  E("Sacks", "Quarterback tackled behind the line on a pass attempt. Half credit is shared, so the number can be fractional.", {
    family: "defense", tier: "box", aliases: ["sacks"],
  }),
  E("QB Hurries", "Pressures that forced the quarterback off his spot without a sack.", { family: "defense", tier: "box", aliases: ["qb hurries"] }),
  E("Pass Break-ups", "Passes knocked down or defended without an interception.", { family: "defense", tier: "box", aliases: ["break-ups", "brup"] }),
  E("Forced Fumbles", "Fumbles caused by the defense.", { family: "defense", tier: "box", aliases: ["forced fumbles"] }),
  E("Fumbles Recovered", "Loose balls the defense came away with.", { family: "defense", tier: "box", aliases: ["fumbles recovered"] }),
  E("Takeaways", "Interceptions plus fumble recoveries.", { family: "defense", tier: "box", aliases: ["takeaways"] }),
  E("Blocked Kicks", "Punts, field goals or extra points blocked.", { family: "special", tier: "box", aliases: ["blocked kicks"] }),
  E("Safety", "A two-point score from tackling the offense in its own end zone.", { family: "defense", tier: "box", aliases: ["safeties"] }),
  E("Expected Turnovers", "What a team's turnover margin would be with exactly a 50% fumble recovery rate and average interception-to-pass-defensed ratios.", {
    source: "gop", status: "mock", family: "defense", aliases: ["expected turnovers"],
  }),
  E("Turnover Luck", "The difference between actual and expected turnover margins, converted to points.", {
    source: "gop", status: "real", family: "defense", aliases: ["turnover luck"],
  }),

  // ── Scoring & drives ──────────────────────────────────────────────────────
  E("Scoring Opportunity", "A drive with at least one snap inside the opponent's 40-yard line.", {
    source: "gop", status: "real", family: "scoring", aliases: ["scoring opportunities", "scoring opportunity"],
  }),
  E("Points / Opportunity", "Points scored per drive that reached the opponent's 40. Separates finishing from field position.", {
    status: "real", family: "scoring", aliases: ["pts / opportunity", "points / opportunity"],
  }),
  E("Available Yards %", "Calculated by dividing drive yards earned by available yards, measured from starting field position to end zone.", {
    source: "gop", status: "real", family: "scoring", aliases: ["available yards %"],
  }),
  E("Red Zone Trips", "Drives reaching the opponent's 20-yard line.", { family: "scoring", tier: "box", aliases: ["red zone trips"] }),
  E("Red Zone TD %", "Share of red-zone trips ending in a touchdown rather than a kick.", {
    family: "scoring", tier: "box", aliases: ["red zone td %", "red zone td", "red zone scores", "red zone fg"],
  }),
  E("Points / Game", "Points divided by games played.", { family: "scoring", tier: "box", aliases: ["points / game", "points", "touchdowns"] }),
  E("Scripted Drives", "A team's first two drives of each half, planned in advance before in-game adaptation.", {
    source: "gop", status: "mock", family: "scoring", aliases: ["scripted drives"],
  }),

  // ── Situational ───────────────────────────────────────────────────────────
  E("Early Down", "First and second down.", { source: "gop", family: "situational", aliases: ["early downs epa", "early down"] }),
  E("Late Down", "Third and fourth down.", { source: "gop", family: "situational", aliases: ["late down"] }),
  E("Standard Down", "First downs, second-and-7 or fewer, third-and-4 or fewer, and fourth-and-4 or fewer.", {
    source: "gop", status: "real", family: "situational", aliases: ["standard-down success", "standard down"],
  }),
  E("Passing Down", "Second-and-8 or more, third-and-5 or more, or fourth-and-5 or more, where passing is advantageous.", {
    source: "gop", status: "real", family: "situational", aliases: ["passing-down success", "passing down"],
  }),
  E("Third Downs Over Expected", "Third downs converted minus the expected conversion rate for that yardage distance.", {
    source: "gop", status: "mock", family: "situational", aliases: ["third downs over expected"],
  }),
  E("Average 3rd Down Distance", "Average yards to go on third down. Lower means the first two downs did their job.", {
    status: "real", family: "situational", aliases: ["avg 3rd distance", "average 3rd down distance"],
  }),
  E("Third Down Conversion", "Share of third downs converted into a first down or touchdown.", {
    family: "situational", tier: "box", aliases: ["3rd down", "3rd/4th success"],
  }),
  E("Fourth Down Conversion", "Share of fourth-down attempts converted.", { family: "situational", tier: "box", aliases: ["4th down"] }),
  E("Middle 8", "The last four minutes of the first half and the first four minutes of the second half.", {
    source: "gop", status: "mock", family: "situational", aliases: ["middle 8"],
  }),
  E("Seconds Per Play", "Game clock elapsed per offensive snap, measuring a coaching staff's tempo choices.", {
    source: "gop", status: "mock", family: "situational", aliases: ["seconds per play"],
  }),
  E("Situation-Neutral Pass Rate", "Pass rate counted only on snaps where the game is still in the balance.", {
    source: "gop", status: "mock", family: "situational", aliases: ["situation-neutral pass rate"],
  }),
  E("Time of Possession", "Average time of possession per game.", { family: "situational", tier: "box", aliases: ["time of possession"] }),
  E("First Downs", "First downs gained, split by rush, pass and penalty.", {
    family: "situational", tier: "box", aliases: ["first downs", "fd rushing", "fd passing", "fd penalty"],
  }),
  E("Penalties", "Penalties accepted against this team, with the yardage.", { family: "situational", tier: "box", aliases: ["penalties"] }),
  E("Fumbles", "Fumbles, with the number lost noted.", { family: "situational", tier: "box", aliases: ["fumbles"] }),

  // ── Field position ────────────────────────────────────────────────────────
  E("Average Start", "Average starting field position, as a spot on the field.", {
    status: "real", family: "special", aliases: ["average start", "avg start", "starting field position"],
  }),
  E("Net Field Position", "A team's average starting spot minus the spot it hands its opponent.", {
    status: "real", family: "special", aliases: ["net field position"],
  }),
  E("Net Punt Average", "Gross punt yards minus return yards allowed minus 20 yards for every touchback, divided by punts.", {
    source: "gop", status: "mock", family: "special", aliases: ["net punt average", "net"],
  }),

  // ── Special teams ─────────────────────────────────────────────────────────
  E("Punt Average", "Gross yards per punt.", { family: "special", tier: "box", aliases: ["punt avg", "punt average"] }),
  E("Inside 20", "Punts downed inside the opponent's 20-yard line.", { family: "special", tier: "box", aliases: ["inside 20"] }),
  E("Touchback", "A punt or kickoff that reached the end zone and came out to the 20 or 25.", { family: "special", tier: "box", aliases: ["touchbacks"] }),
  E("Fair Catch", "A punt caught with no return.", { family: "special", tier: "box", aliases: ["fair catches"] }),
  E("Field Goal %", "Field goals made as a share of attempts.", { family: "special", tier: "box", aliases: ["field goals", "fg long", "fg blocked"] }),
  E("Extra Points", "Point-after kicks made and attempted.", { family: "special", tier: "box", aliases: ["extra points"] }),
  E("Kick Return Average", "Yards per kickoff return.", { family: "special", tier: "box", aliases: ["kr avg", "kick returns", "kr touchdowns"] }),
  E("Punt Return Average", "Yards per punt return.", { family: "special", tier: "box", aliases: ["pr avg", "punt returns", "pr touchdowns"] }),
  E("Punts", "Punts attempted, with gross yardage.", { family: "special", tier: "box", aliases: ["punts", "punt yards", "punt long", "punts blocked"] }),

  // ── Player measures ───────────────────────────────────────────────────────
  E("Production Above Replacement", "What a player produced beyond what a freely available replacement at the same position would have.", {
    family: "player", aliases: ["par", "production above replacement"],
  }),
  E("Target Share", "A receiver's targets as a share of every target the team threw in the game.", {
    source: "gop", status: "mock", family: "player", aliases: ["target share"],
  }),
  E("First Down Share", "A player's first downs as a share of every first down the team earned by rush or reception.", {
    source: "gop", status: "mock", family: "player", aliases: ["first down share"],
  }),
  E("First Down + Touchdown Rate", "The share of a player's opportunities that ended in a first down or a touchdown.", {
    source: "gop", status: "mock", family: "player", aliases: ["first down + touchdown rate"],
  }),
  E("Scoring Opportunity Touches", "Player touches on snaps inside the opponent's 40-yard line and 20-yard line.", {
    source: "gop", status: "mock", family: "player", aliases: ["scoring opportunity touches"],
  }),
  E("DETMER", "Downfield Eventful Throwing Metric Encouraging Rippin' it — a measure of quarterback performance.", {
    source: "gop", status: "mock", family: "player", aliases: ["detmer"],
  }),
  E("Expected QBR", "An estimated version of ESPN's QBR, derived from historical data.", {
    source: "gop", status: "mock", family: "player", aliases: ["expected qbr"],
  }),

  // ── Game model ────────────────────────────────────────────────────────────
  E("Win Probability", "An instantaneous estimate of a team's chance of winning, updated after each play.", {
    source: "gop", status: "mock", family: "model", aliases: ["win probability", "wp%"],
  }),
  E("Win Probability Left On The Field", "The difference between optimal and actual fourth-down decisions, expressed as percentage points.", {
    source: "gop", status: "mock", family: "model", aliases: ["win probability left on the field"],
  }),
  E("Fourth Down Recommendation", "Guidance on whether to go for it, kick, or punt, based on win probability optimization.", {
    source: "gop", status: "mock", family: "model", aliases: ["fourth down recommendations"],
  }),
  E("Fourth-Down Agreement Rate", "The share of a head coach's fourth-down decisions that matched the model's recommendation.", {
    source: "gop", status: "mock", family: "model", aliases: ["fourth-down agreement rate"],
  }),
  E("Two-Point Try Recommendation", "Guidance on attempting or kicking, based on win probability optimization.", {
    source: "gop", status: "mock", family: "model", aliases: ["two-point try recommendations"],
  }),
  E("Team Rating", "Opponent-adjusted EPA per play, over every game with play-by-play, blended toward last season's final rating early in the year. The rating the Schools page ranks on.", {
    family: "model", aliases: ["team rating", "glory rating", "glory"],
  }),

  // ── Box-score vocabulary ──────────────────────────────────────────────────
  E("Attempts", "Pass or rush attempts, from the box score.", { tier: "box", family: "box", aliases: ["attempts", "completions"] }),
  E("Completion %", "Share of attempts completed, from the box score.", { tier: "box", family: "box", aliases: ["completion %"] }),
  E("Interceptions", "Passes thrown to the other team. In a Defense allowed column these are takeaways.", { tier: "box", family: "box", aliases: ["interceptions"] }),
  E("Long", "Longest single gain.", { tier: "box", family: "box", aliases: ["long"] }),
  E("Yards / Play", "Yards gained per snap.", { tier: "box", family: "box", aliases: ["yards / play", "plays", "total yards", "yards", "yards / game", "rushing yards", "passing yards"] }),
];

// Alias index — every label a grid might use, pointing at its entry.
const INDEX = (() => {
  const map = {};
  GLOSSARY.forEach((entry) => {
    [entry.term, ...entry.aliases].forEach((a) => {
      const k = String(a).toLowerCase();
      if (!map[k]) map[k] = entry;
    });
  });
  return map;
})();

/** Tooltip lookup. Keeps the older { text, mock } shape its callers expect. */
export const glossaryFor = (label) => {
  const entry = INDEX[String(label ?? "").toLowerCase()];
  if (!entry) return null;
  return { text: entry.def, mock: entry.status === "mock", entry };
};

export const glossaryEntry = (key) =>
  GLOSSARY.find((e) => e.term === key) ?? INDEX[String(key ?? "").toLowerCase()] ?? null;

export const GLOSSARY_FAMILIES = ["core", "rushing", "passing", "defense", "scoring", "situational", "special", "player", "model", "box"];

/** The ordinal a rank reads as: 1 → 1st, 22 → 22nd. */
export const ordinal = (n) => {
  if (!Number.isFinite(n)) return null;
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
};
