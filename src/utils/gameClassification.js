// ─── Game Classification ─────────────────────────────────────────────────────
//
// One vocabulary for every page that filters games — Week Central, Season
// Schedule, Team Schedule, Games Hub, Conference Slate.
//
// Nothing here classifies a game. Classification is a league fact and the
// backend owns it (see "Cross-page rules" in Game Center Fetch Contract.md).
// Every predicate below is a field equality check against data the payload
// already carries. No substring searches over prose, no reading conference or
// division structure out of teams.json — both of which this module replaces.
//
// The four axes are INDEPENDENT. A SWAC title game is covered AND conference
// AND a championship at the same time; NC Central vs Texas Southern is covered
// AND non-conference. Flattening them into one list is what produced the
// filters that hid HBCU cross-conference games.

// ─── Axis 1: coverage ────────────────────────────────────────────────────────
// Whether we hold full data for the opponent. "HBCU" and "one of our 18" are
// not the same thing: Tennessee State, Hampton, and NC A&T are HBCUs outside
// SWAC/MEAC, and D2 SIAC/CIAA schools appear on non-conference slates. Those
// are `HBCU_EXTERNAL` — real HBCU matchups we simply don't cover.
export const OPPONENT_CLASS = {
  COVERED: "covered",
  HBCU_EXTERNAL: "hbcu_external",
  NON_HBCU: "non_hbcu",
};

// ─── Axis 2: conference relationship ─────────────────────────────────────────
// Independent of coverage. MEAC vs SWAC is NON_CONFERENCE and still covered.
export const CONFERENCE_SCOPE = {
  CONFERENCE: "conference",
  NON_CONFERENCE: "non_conference",
};

// ─── Axis 3: division relationship ───────────────────────────────────────────
// NOT_APPLICABLE covers both MEAC (no divisions) and any non-conference game.
export const DIVISION_SCOPE = {
  DIVISION: "division",
  CROSS_DIVISION: "cross_division",
  NOT_APPLICABLE: "not_applicable",
};

// ─── Axis 4: stage ───────────────────────────────────────────────────────────
export const GAME_TYPE = {
  REGULAR: "regular",
  CONFERENCE_CHAMPIONSHIP: "conference_championship",
  BOWL: "bowl",
  PLAYOFF: "playoff",
};

// Named events sit beside game_type rather than inside it, because a Classic is
// usually also a regular conference game — the Bayou Classic is both. Shape:
//   event: { kind: "classic" | "homecoming", name: "Bayou Classic" }
export const EVENT_KIND = {
  CLASSIC: "classic",
  HOMECOMING: "homecoming",
};

// ─── Filters ─────────────────────────────────────────────────────────────────
//
// Unknown fields pass. While the backend is still adding these fields a strict
// `=== true` would empty the board, which reads as "there are no games" rather
// than "this filter isn't wired yet". Failing open shows a superset instead —
// visibly unfiltered, never falsely empty. Each `!== false` / `!== undefined`
// guard below disappears once the field ships.

export const GAME_FILTERS = [
  {
    id: "all",
    label: "All Games",
    test: () => true,
  },
  {
    id: "hbcu",
    label: "HBCU Only",
    test: (game) => game?.is_covered_matchup !== false,
  },
  {
    id: "conference",
    label: "Conference",
    test: (game) => game?.conference_scope !== CONFERENCE_SCOPE.NON_CONFERENCE,
  },
  {
    id: "division",
    label: "Division",
    test: (game) => game?.division_scope === DIVISION_SCOPE.DIVISION,
  },
  {
    id: "championship",
    label: "Conf Champ",
    test: (game) => game?.game_type === GAME_TYPE.CONFERENCE_CHAMPIONSHIP,
  },
  {
    id: "postseason",
    label: "Postseason",
    test: (game) => game?.game_type === GAME_TYPE.BOWL || game?.game_type === GAME_TYPE.PLAYOFF,
  },
];

const FILTER_BY_ID = GAME_FILTERS.reduce((acc, filter) => {
  acc[filter.id] = filter;
  return acc;
}, {});

// Pages rarely want all six. `pickFilters("all", "hbcu")` returns them in the
// order asked for, so a two-state toggle and a six-pill rail share one source.
export const pickFilters = (...ids) => ids.map((id) => FILTER_BY_ID[id]).filter(Boolean);

export const getFilter = (id) => FILTER_BY_ID[id] ?? FILTER_BY_ID.all;

export const matchesFilter = (game, filterId) => getFilter(filterId).test(game);

export const filterGames = (games = [], filterId) => games.filter((game) => matchesFilter(game, filterId));

// ─── Display helpers ─────────────────────────────────────────────────────────
// Badge text only. These read a classification; they never assign one.

export const isCovered = (game) => game?.is_covered_matchup === true;

export const isNonConference = (game) => game?.conference_scope === CONFERENCE_SCOPE.NON_CONFERENCE;

// The "NC" badge marks a non-conference game that still belongs on the board.
// It is a label, not a filter — the two were conflated in the old code.
export const NON_CONFERENCE_BADGE = "NC";
