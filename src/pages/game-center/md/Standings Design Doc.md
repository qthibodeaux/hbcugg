# Standings — Design Document

**Route:** `/game-center/standings`
**Page file:** `src/pages/game-center/StandingsPage.js`
**Last updated:** 2026-08-25
**Status:** Desktop and mobile layouts complete. Power Rankings (formerly Glory) ranks by point differential pending combined EPA; season now resolves from current context.

---

## 1. Objective

Standings answers **who is winning, and what is still possible.**

Three division races side by side — SWAC East, SWAC West, MEAC — each as an ordered table with record, form, and streak. Below them, the finish matrix: where each team can still land given what is left to play.

The distinction from every other Game Center page: this one is about **position**, not events. A game page tells you what happened. Standings tells you what it meant.

---

## 2. Data Ownership Rule

**The backend computes the standings. The frontend renders the table.**

Ordering, tiebreakers, form, streak, games back, and finish scenarios are all league facts requiring the full season and the conference's tiebreaker rules. None of them belong in a React component.

This page currently violates that more than any other in Game Center — it sorts, computes head-to-head, derives form and streak, synthesizes the finish matrix, and **invents the Glory score outright.** See section 8.

Local join is visual identity only — logos and colors from `src/data/teams.json`, keyed on `team_id`.

---

## 3. Request Contract

### Endpoint

```
/data/1-game center/current_exports/standings_race/standings_race_{season}.json
```

Season-scoped, one request. At ~32 KB this is the smallest payload in Game Center and there is nothing meaningful to split — the page shows all three groups at once, so a per-group split would mean three requests for one screen.

**Query key** is `["standings", season]`, which is correct.

### Payload

```json
{
  "season": 2026,
  "generated_at": "2026-08-24T00:00:00Z",
  "as_of_week": 12,

  "rules": {
    "tiebreaker_summary": "Head-to-head, then division record, then common opponents."
  },

  "context_cards": [
    {
      "label": "Closest Race",
      "value": "1",
      "sub": "game separates the top two in SWAC East",
      "accent": "#F4811F"
    }
  ],

  "summary_cards": [
    {
      "label": "SWAC East Leader",
      "value": "JSU",
      "sub": "6-2 conference",
      "team_id": "swacjsu"
    }
  ],

  "groups": {
    "swac_east": {
      "id": "swac-east",
      "label": "SWAC East",
      "conference": "SWAC",
      "division": "East",
      "completed_games": 24,
      "remaining_games": 0,
      "scenario_count": 1,
      "unresolved_tiebreakers": [],

      "standings": [
        {
          "team_id": "swacjsu",
          "rank": 1,
          "clinched": "division",

          "record": "10-2",
          "conference_record": "6-2",
          "division_record": "4-1",
          "wins": 10,
          "losses": 2,
          "conf_wins": 6,
          "conf_losses": 2,
          "win_pct": 0.833,
          "conf_win_pct": 0.75,

          "points_for": 341,
          "points_against": 218,
          "point_differential": 123,

          "games_back": 0,
          "last5": "WWLWW",
          "streak": "W2",

          "epa_per_play": 0.18,
          "epa_rank": 2,
          "epa_combined": 0.31,

          "tiebreaker_trace": [],
          "tiebreaker_status": "resolved"
        }
      ],

      "finish_matrix": [
        {
          "team_id": "swacjsu",
          "probabilities": [0.82, 0.14, 0.03, 0.01, 0.0, 0.0]
        }
      ]
    },
    "swac_west": {},
    "meac": {}
  }
}
```

### Field notes

| Field | Rule |
|---|---|
| `groups.*.standings[]` | **Pre-sorted, `rank` assigned.** The frontend never sorts or breaks ties |
| `last5` | Five characters, oldest to newest, `W`/`L`/`-`. Backend-computed |
| `streak` | e.g. `"W2"`, `"L1"`, `"-"`. Backend-computed |
| `games_back` | Backend-computed against the group leader |
| `clinched` | `"division"` · `"conference"` · `"playoff"` · `null` |
| `point_differential` | Direct field. Never make the frontend subtract |
| `epa_combined` | Drives the Power Rankings board — see section 4. Replaces point differential in `POWER_METRIC` |
| `epa_per_play` / `epa_rank` | Per-team efficiency for the standings row itself |
| `finish_matrix[].probabilities` | One entry per finish position, ordered 1st→last, summing to 1.0 |
| `context_cards[]` | 3-4 rotation items for KPI slot 1 — see section 5 |
| `summary_cards[]` | Card-ready. The frontend does not pick leaders out of the standings |
| `tiebreaker_trace[]` | Standardized shape across teams — currently inconsistent |
| `as_of_week` | What the table reflects, so a stale export is visible |

### Season resolution

Must come from `useFootballCurrentContext()`. The page currently opens on `GAME_CENTER_DEFAULT_SEASON` — see Open Items.

---

## 4. The Power Rankings card

A 2x2 board showing the top six teams league-wide. Its job is to answer *who is actually best right now* across all three divisions, which the per-group standings tables cannot — they only rank within a group.

**The card's identity is permanent. The metric behind it is not.**

### Target: combined EPA

The ranking should be driven by a combined EPA figure from the backend — a real efficiency measure, ranked league-wide. When it ships, it arrives on each standings row and the card swaps to it.

### Interim: point differential

Until then the board ranks by point differential (`points_for - points_against`). It is real, directly computed, and **labeled as itself** — the card's meta line reads `By Point Diff`, and it will read `By EPA` when that lands.

The whole metric is one object:

```js
const POWER_METRIC = {
  key: "diff",
  label: "By Point Diff",
  format: (value) => `${value > 0 ? "+" : ""}${Math.round(value)}`,
};
```

Swapping to combined EPA is a change to that object and nothing else — no card, model, or layout change.

### What this replaced

The card previously displayed a number the frontend invented:

```js
glory: row.cpct * 55 + row.pct * 25 + Math.max(-10, Math.min(20, row.diff / 10)),
```

Conference win percentage times 55, plus overall win percentage times 25, plus point differential over 10 clamped to [-10, 20]. Those weights had no source. It rendered as `.toFixed(1)` under a heading reading "Glory Rankings," presenting an arbitrary formula as a league metric — the same failure class as the Conference Slate `MATCHUPS` fallback: authoritative-looking, with nothing on screen to signal otherwise.

Point differential is not a better composite. It is a **real number instead of a fake one**, which is the entire point.

### Glory is not gone

Glory remains a real planned metric with its own definition. When it exists it ships as its own backend field. It is not this card's interim number, and it will never again be a formula living in a component.

### Preseason

Teams with no completed games are excluded from the ranking — a board where every team sits at zero is noise. When no team has played, the card renders `No games played yet` rather than an empty frame or a six-way tie at 0.

---

## 5. The KPI row

Four `cols={1}` cards above the standings tables. Slot 1 rotates; slots 2-4 are the division leaders.

### Slot 1 — context rotation

A card that cycles through several race facts rather than holding one. Backend supplies them:

```json
"context_cards": [
  {
    "label": "Closest Race",
    "value": "1",
    "sub": "game separates the top two in SWAC East",
    "accent": "#F4811F"
  }
]
```

Three or four items. The card plays whatever it is given, in order, and adapts its timing to the count — the rotation is `items.length * 6s`, so three items or five both behave.

**The crossfade is pure CSS.** Every item is stacked and runs the same keyframe, separated only by a negative `animation-delay`. No timer, no state, no effect — `AgentDesignBible` bars `useEffect`, and a `setInterval` carousel is precisely the thing it bars. Progress dots below use the same keyframe and delays, so they stay in sync with no shared state. `prefers-reduced-motion` freezes the card on the first item.

Delay math: an item is visible while its own animation time sits in `[0, HOLD)`. A delay of `-X` shifts animation time to `(t + X)`, so item *i* needs `X = ((N - i) % N) * HOLD` to come up at wall time `i * HOLD`.

### Interim items

Until `context_cards[]` ships, the items are derived from fields the live export actually carries:

| Item | Value | Condition |
|---|---|---|
| Closest Race | Gap between 1st and 2nd in the tightest division, or `TIED` | Two teams and a game played |
| Unbeaten | Count of teams with no conference loss | At least one |
| Conference Games | Total played across all divisions | Greater than zero |
| Still To Play | Total remaining | Greater than zero |

**Anything that cannot be computed honestly is dropped, not filled.** The rotation only ever plays real facts and simply gets shorter when there is less to say. In preseason every item drops out and the card reads `No games played yet`.

Deliberately **not** included: a "hottest team" streak card. `streak` and `last5` fall through to `"-"` in the live path because the export ships neither — see `modelFromStandingsRace`. It goes in the moment the backend adds them.

### Slots 2-4 — division leaders

One per division. Previously a bare team abbreviation over the words "Current leader" — which the standings table directly below already said, in more detail, with a `justify="space-between"` layout that pinned the label to the top and the value to the bottom, leaving a dead middle in a tall slot.

Now each card leads with **the number that makes someone the leader**:

| Element | Source |
|---|---|
| Kicker | Division label in the division accent |
| Hero | Conference record, mono, `clamp(2rem, 3.4vw, 3rem)` |
| Identity | Team logo + short name |
| Support | Overall record |
| Ground | Gradient of the leader's primary color, ghost logo watermark at `0.14` |

Content is vertically centered rather than pushed to the edges, so the card fills at any slot height.

---

## 6. Desktop Layout

`PageShell` hybrid — grid slots on top, finish matrices as `listContent` below.

```
+-------------------------------------------------------------+
| Row 1   BannerStandings                            cols 4    |
+------------+------------+------------+----------------------+
| Row 2   Rotation | SWAC East | SWAC West | MEAC     cols 1 ea|
|         (context) | leader    | leader    | leader             |
+-------------------------+-----------------------------------+
| Rows 3-4  SWAC East      | SWAC West          cols 2, rows 2 |
|           standings card | standings card                    |
+-------------------------+-----------------------------------+
| Rows 5-6  MEAC           | Finish Probability cols 2, rows 2 |
|           standings card | (all three groups)                |
+-------------------------+-----------------------------------+
| listContent: per-group finish matrices, full width           |
+-------------------------------------------------------------+
```

### Standings card anatomy

| Element | Source |
|---|---|
| Rank + team logo + label | `rank`, `team_id` |
| Records | `conference_record`, `record` |
| Form boxes | `last5` — five colored cells, green `W` / red `L` / grey `-` |
| Streak | `streak` |
| Games back | `games_back` |
| Row accent | Group accent color |

### Finish matrix

A grid of teams × finish positions, each cell heat-colored by probability. Reads as "how likely is each team to land in each slot."

---

## 7. Mobile Layout

Separate render tree, no `PageShell` — same architecture as every converted page.

```
+---------------------------+
| BannerStandings           |
+---------------------------+
| context rotation          |  full width, 7.5rem
+-------+-------+-----------+
| SWAC  | SWAC  | MEAC      |  3-up leader grid
| East  | West  |           |
+-------+-------+-----------+
| SWAC East                 |
| +-----------------------+ |
| | rank | team | rec |form| |
| +-----------------------+ |
+---------------------------+
| SWAC West                 |
| ...                       |
+---------------------------+
| MEAC                      |
| ...                       |
+---------------------------+
| finish matrices, scrollable|
+---------------------------+
```

The context rotation runs full width above a 3-up leader grid, then groups stack rather than sitting side by side. Standings rows keep the same composition at a tighter scale; form boxes stay, since five small cells survive the narrower column.

---

## 8. Empty and Loading States

| Condition | Behavior |
|---|---|
| Fetch in flight | Spinner |
| Season has no export | Empty standings frame per group |
| Group has no teams | Card renders its header and an empty body |
| `finish_matrix` absent | **Currently synthesized from standings order** — should render empty instead |
| `summary_cards` absent | Cards currently derived client-side — should collapse instead |
| No games played yet | Rows render at `0-0` with `-----` form |

Two rows there are wrong. A synthesized finish matrix and client-derived summary cards both present frontend guesses as backend data. Both should render empty when the fields are missing, matching the Conference Slate rule.

---

## 9. Open Items

| Item | Owner | Severity |
|---|---|---|
| Power Rankings ranks by point differential pending combined EPA | Backend | Medium |
| Standings ordering, tiebreakers, head-to-head computed client-side | Backend | High |
| `last5` / `streak` derived from games when absent | Backend | High |
| `finish_matrix` synthesized when absent | Backend + Frontend | High |
| `SWAC_EAST` / `SWAC_WEST` hardcoded as `Set`s | Backend ships `groups` membership | Medium |
| `context_cards` / `summary_cards` derived client-side | Backend | Medium |
| No streak rotation item — export ships no `streak` / `last5` | Backend | Medium |
| `tiebreaker_trace` shape inconsistent between teams | Backend | Medium |
| Legacy fallback path for old `games[]` payloads still present | Frontend | Low |

### Resolved — 2026-08-25: the invented Glory score

The 2x2 board displayed `cpct * 55 + pct * 25 + clamp(diff / 10, -10, 20)` as "Glory Rankings" — a composite with no source, formatted to one decimal so it read as a real metric.

Renamed to **Power Rankings** and repointed at a declared metric object. It now ranks by point differential and says so on the card. Combined EPA replaces it by editing `POWER_METRIC` alone. Teams with no completed games are excluded, and an all-zero preseason board renders `No games played yet`.

### Resolved — 2026-08-25: the KPI row

Three of the four cards restated the standings tables directly below them — each showing one division's leader as a bare abbreviation over the words "Current leader." The fourth read `RULESET / LIVE / Data-backed standings`, a status indicator in a KPI slot. `FeatureCard` used `justify="space-between"` inside `h="100%"`, guaranteeing a dead middle at any real slot height, with the value at `2xl`.

The games-derived path had its own problem — a "Live Paths" card computing `2 ** Math.min(totalRemaining, 12)` and labeling it "Open scenario branches," another fabricated number in the Glory family.

Slot 1 is now a CSS-driven context rotation; slots 2-4 are division leaders that lead with the conference record. Both are documented in section 5.

### Resolved — 2026-08-25: the season default

`StandingsPage` opened on `useState(DEFAULT_SEASON)` with no `useFootballCurrentContext()` — a hardcoded year regardless of the live season. Same bug as Conference Slate, fixed the same day with the same pattern:

```js
const { currentSeason, isLoading: isCurrentContextLoading } = useFootballCurrentContext();
const [seasonOverride, setSeasonOverride] = useState(null);
const season = seasonOverride ?? currentSeason ?? DEFAULT_SEASON;
const setSeason = (value) => setSeasonOverride(Number(value));
```

`isLoading` now waits on current context resolving in addition to the standings query itself, so the page doesn't briefly render a stale/default season's table before current context lands.

### The computation problem

This page derives more than any other in Game Center. `buildBaseRows` walks every game to accumulate records; `headToHeadCompare` and `standingsCompare` implement tiebreakers; `groupRows` computes form and streak; `buildCompletedFinishMatrix` synthesizes finish positions; `addGloryScore` invents a ranking.

Tiebreakers are **conference rules**, not display logic. A frontend implementation will drift from the conference's actual rules the moment those rules have a wrinkle — common opponents, records against a division, a three-way tie. Backend owns the sort and ships `rank`.

### What the contract removes

| Derived today | Replaced by |
|---|---|
| `buildBaseRows` record accumulation | `standings[]` with records |
| `standingsCompare` / `headToHeadCompare` | pre-sorted `standings[]` + `rank` |
| `groupRows` form and streak | `last5` / `streak` |
| `buildCompletedFinishMatrix` | `finish_matrix[]` |
| `addGloryScore` | `epa_per_play` / `epa_rank` |
| `buildFeatureCards` | `summary_cards[]` |
| `SWAC_EAST` / `SWAC_WEST` `Set`s + `getGroupId` | `groups.*.standings[].team_id` |
| `recordText(wins, losses)` | `record` / `conference_record` |

---
---

# Legacy Reference

*Content below predates the 2026-08-25 rewrite. Kept for pipeline history — the sections above are authoritative.*

## Standings Hub - Design Document

**Route:** `/game-center/standings`  
**File:** `src/pages/game-center/StandingsPage.js`  
**Last updated:** 2026-05-03  
**Data status:** Current export wired; finish matrix is derived from standings order when explicit matrix data is absent.
**Fetch contract:** tracked in [Game Center Fetch Contract.md](./Game%20Center%20Fetch%20Contract.md) — request shape not yet reviewed against the rest of Game Center (payload is small, 32 KB, likely fine as-is).

---

### Purpose

Standings Hub shows the SWAC East, SWAC West, and MEAC race state, then presents a finish-position matrix.

---

### Current Frontend Fetch Contract

Production fetches one current-export payload through `gameCenterPaths.standingsRace(season)`.

```text
/data/1-game center/current_exports/standings_race/standings_race_{season}.json
```

Current page:

```js
fetchJson(gameCenterPaths.standingsRace(season))
```

---

### Current Payload Inventory

The 2025 payload currently contains:

| Field | Shape | Current Use |
|---|---|---|
| `season` | number | selected season |
| `generated_at` | ISO string | freshness |
| `rules` | object | rule context |
| `groups` | object | standings groups |

#### `groups`

Current keys:

| Key | Purpose |
|---|---|
| `swac_east` | SWAC East standings |
| `swac_west` | SWAC West standings |
| `meac` | MEAC standings |

Current group shape is an array of team rows, not the older documented object shape with nested `standings` and `finish_matrix`.

#### Group Row Fields

| Field | Purpose |
|---|---|
| `team_id`, `team` | team identity |
| `record`, `conference_record`, `division_record` | display records |
| `wins`, `losses`, `conf_wins`, `conf_losses` | sorting/display |
| `division_wins`, `division_losses` | division race context |
| `win_pct`, `conf_win_pct`, `division_win_pct` | ranking support |
| `conference`, `division` | group context |
| `tiebreaker_trace`, `tiebreaker_status` | standings explanation |
| `head_to_head_record`, `head_to_head_pct` | optional tie context |
| `rank`, `games_back` | standings display |

---

### Current Client-Side Derivations

The page currently:

- converts `groups.swac_east`, `groups.swac_west`, `groups.meac` into UI group models
- derives feature cards from group leaders
- derives a finish matrix when the payload does not provide one
- joins visual identity from `teams.json`
- keeps legacy fallback logic for older payloads with `games[]`

---

### Stale Or Incomplete Data

| Gap | Impact | Needed Fix |
|---|---|---|
| current `groups` are arrays, not object groups | older doc shape was stale | document current shape and support target shape |
| no explicit `finish_matrix` in current export | frontend synthesizes deterministic matrix | pipeline should export true matrix |
| no `summary_cards` | feature cards are frontend-derived | export card-ready race summary |
| no `glory_top_six` | Glory card cannot be fully real | add ranking feed or remove expectation |
| tiebreaker traces exist but are inconsistent by team | explanation quality varies | standardize trace schema |

---

### Preferred Production Payload Shape

```json
{
  "season": 2025,
  "generated_at": "2026-05-03T00:00:00Z",
  "rules": {},
  "summary_cards": [],
  "groups": {
    "swac_east": {
      "id": "swac-east",
      "label": "SWAC East",
      "conference": "SWAC",
      "division": "East",
      "standings": [],
      "finish_matrix": [],
      "completed_games": 24,
      "remaining_games": 0,
      "scenario_count": 1,
      "unresolved_tiebreakers": []
    },
    "swac_west": {},
    "meac": {}
  },
  "glory_top_six": []
}
```

The frontend can keep accepting the current array-based shape during transition, but the pipeline should move toward the object group shape above.

---

### Pipeline Requirements

1. Keep exporting `current_exports/standings_race/standings_race_{season}.json`.
2. Move groups from raw arrays to group objects with `standings[]`.
3. Export true `finish_matrix[]` per group.
4. Export `summary_cards[]` for top feature cards.
5. Add `completed_games`, `remaining_games`, and `scenario_count`.
6. Standardize `tiebreaker_trace[]` and `unresolved_tiebreakers[]`.
7. Add `glory_top_six[]` only when a real Glory ranking feed is available.

