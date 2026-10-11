# Conference Slate — Design Document

**Route:** `/game-center/conferenceslate`
**Legacy route:** `/game-center/schedule`
**Page file:** `src/pages/game-center/ConferenceSlatePage.js`
**Component:** `src/components/molecules/game/ConferenceSlateMatrix.js`
**Last updated:** 2026-08-25
**Status:** Desktop and mobile both complete and shipping. Blocked on backend for payload-driven `axes`; season now resolves from current context.

---

## 1. Objective

Conference Slate answers one question the schedule pages cannot: **who played whom, and how did it go?**

A schedule is a list ordered by time. A slate is a grid ordered by opponent. The grid makes the shape of a conference season visible at a glance — who swept, who got swept, which pairs haven't met yet, where the holes in the round-robin are. That is a season-level question, and the matrix is the only view on the site that answers it.

Every cell is a matchup. Every filled cell is a link to that game's page.

---

## 2. Data Ownership Rule

**The backend sends one season of matchups, display-ready. The frontend arranges them into a grid.**

The grid arrangement is a frontend concern — cell geometry, sticky axes, winner coloring, the mobile swipe. That stays here.

Everything else is backend: which teams are on each axis, who was home, what the score was, who won, what the date reads as, whether a game page exists. The frontend does not parse score strings, infer final status, format dates, or carry its own list of who is in which division.

Local join is visual identity only — logos and colors from `src/data/teams.json`, keyed on `team_id`.

---

## 3. Request Contract

### Endpoint

```
/data/1-game center/current_exports/slate/conference_slate_{season}.json
```

### Why this one stays season-scoped

Week Central was split into per-week requests because a season payload was 236 KB to render six games, and because one request should not hand over a year of deep game data.

Neither applies here:

- **A matrix has no meaningful slice.** Per-week would return a scattering of disconnected cells. The grid *is* the unit.
- **The payload is shallow** — matchup pairs, scores, dates, route ids. No briefs, no play-by-play, no player stats. ~92 KB for a full conference season.
- **The user is explicitly asking for the season view** by landing on this page.

Season-scoped, one request, `staleTime: Infinity`. Confirmed acceptable.

### Payload

```json
{
  "season": 2026,
  "generated_at": "2026-08-24T00:00:00Z",

  "axes": {
    "meac": {
      "label": "MEAC",
      "conference": "MEAC",
      "team_ids": ["meacdsu", "meachu", "meacmsu", "meacnccu", "meacnsu", "meacscsu"]
    },
    "swac_east": {
      "label": "SWAC East",
      "conference": "SWAC",
      "team_ids": ["swacaamu", "swacasu", "swacbcu", "swacfamu", "swacjsu", "swacmvsu"]
    },
    "swac_west": {
      "label": "SWAC West",
      "conference": "SWAC",
      "team_ids": ["swacalc", "swacgsu", "swacpvamu", "swacsu", "swactsu", "swacuapb"]
    }
  },

  "matchups": [
    {
      "matchup_id": "swacasu_swacjsu_2026",
      "division_scope": "swac_east",
      "game_type": "regular_conference",

      "status": "final",
      "status_label": "Final",
      "date": "2026-10-17",
      "date_label": "Oct 17",
      "week": 8,

      "away_team_id": "swacasu",
      "home_team_id": "swacjsu",
      "away_score": 34,
      "home_score": 38,
      "winner_team_id": "swacjsu",
      "score_display": "34-38",

      "game_path_id": "W8asujsu",
      "route": "/game/W8asujsu",
      "has_game_page": true,

      "warnings": []
    }
  ],

  "special_games": [],

  "data_quality": {
    "score_mismatches": [],
    "warnings": []
  }
}
```

### Field notes

| Field | Rule |
|---|---|
| `axes` | **The matrix rows and columns come from here.** Not from a frontend constant |
| `axes.*.team_ids` | Ordered as they should appear on both axes |
| `away_team_id` / `home_team_id` | True sides. Never `team_a` / `team_b` — the grid needs to know who hosted |
| `away_score` / `home_score` | Real numbers. `null` on an unplayed matchup |
| `score_display` | Display text only. **Never a data source** — the frontend must not parse it back into numbers |
| `status` | `"final"` \| `"scheduled"`. Sent, not inferred from whether a winner exists |
| `date_label` | Pre-formatted. Shown in cells for unplayed matchups |
| `winner_team_id` | Drives cell coloring. `null` when not final |
| `has_game_page` | Whether the cell links. `route` is ready to use when true |
| `division_scope` | `"meac"` \| `"swac_east"` \| `"swac_west"` — matches an `axes` key |
| `game_type` | `"regular_conference"` \| `"championship"` \| `"bowl"` |
| Missing matchup | Simply absent from `matchups[]`. The cell renders empty |

### Season resolution

Season comes from `useFootballCurrentContext()`, never a hardcoded default. The page opens on the live season; the banner selector sets an override that takes precedence once the user picks a year.

```js
const { currentSeason } = useFootballCurrentContext();
const [seasonOverride, setSeason] = useState(null);
const season = seasonOverride ?? currentSeason ?? GAME_CENTER_DEFAULT_SEASON;
```

`GAME_CENTER_DEFAULT_SEASON` is the last resort only — it applies when current context itself fails to load.

---

## 4. Desktop Layout

`PageShell`, 4-column grid. Banner on row 1, matrix fills the rest.

```
+-------------------------------------------------------------+
| Row 1   BannerSchedule (season selector)           cols 4    |
+-------------------------------------------------------------+
| Rows 2-5                                     cols 4, rows 4  |
| +---------------------------------------------------------+ |
| | CONFERENCE SLATE                  [MEAC][SWAC] | ALL W E | |
| | 2026 MATRIX                                             | |
| +---------------------------------------------------------+ |
| |      | HU  | DSU | MSU | NCCU| NSU | SCSU              | |
| | HU   |=====|cell |cell |cell |cell |cell |               | |
| | DSU  |cell |=====|cell |cell |cell |cell |               | |
| | MSU  |cell |cell |=====|cell |cell |cell |               | |
| | NCCU |cell |cell |cell |=====|cell |cell |               | |
| | NSU  |cell |cell |cell |cell |=====|cell |               | |
| | SCSU |cell |cell |cell |cell |cell |=====|               | |
| +---------------------------------------------------------+ |
+-------------------------------------------------------------+
```

### Matrix mechanics

| Element | Behavior |
|---|---|
| Axis headers | Team logos. Sticky — top row and left column stay pinned while scrolling |
| Corner cell | Sticky at both, `zIndex 4` |
| Diagonal cell | The team itself — logo on a gradient of its primary color |
| Matchup cell | Away team + score over home team + score, winner in white and marked `W` |
| Unplayed cell | Date label instead of scores |
| Cell background | Gradient from the winner's primary color; neutral when unplayed |
| Cell link | Wraps to `/game/{game_path_id}` when `has_game_page` |
| Grid template | `72px repeat(n, minmax(128px, 1fr))`, rows `96px` |

### Controls

**Conference:** `MEAC` / `SWAC` pills. Selecting SWAC while scope is `ALL` snaps scope to `WEST`.

**Scope:** `ALL` / `WEST` / `EAST`. Only active when SWAC is selected — dimmed to `0.36` opacity otherwise. `ALL` renders all 12 SWAC teams in one grid.

### Compact mode

Two triggers, one result:

- SWAC + `ALL` — 12 columns needs narrower cells
- Viewport 641-900px — a raw CSS media query inside the component overrides the grid

Compact swaps cells to `74px` wide, `62px` tall, hides the `ALL` control, and switches cell content from the stacked score block to a condensed logo-@-logo row. The grid gets a `min-width` so it scrolls horizontally rather than crushing.

---

## 5. Mobile Layout

**Mobile is not a shrunken matrix — it is a different presentation of the same data.** A 6×6 grid cannot work at 390px; scrolling in two axes to read one cell is not usable. Mobile pivots to one card per team, swiped horizontally.

```
+---------------------------+
| BannerSchedule            |
+---------------------------+
| CONFERENCE SLATE          |
| 2026 MATRIX    [MEAC][SWAC]|
+---------------------------+
| [ALL] [WEST] [EAST]       |  only when SWAC
+---------------------------+
| (logo)(logo)(logo)(logo)> |  jump strip, scrolls
+---------------------------+
|  +---------------------+  |
|  | (logo) HOWARD       |  |  team header, gradient
|  +---------------------+  |
|  | vs DSU      19-20   |  |
|  | vs MSU      33-27   |  |  one row per opponent
|  | vs NCCU     14-35   |  |
|  | vs NSU      44-13   |  |
|  | vs SCSU     25-29   |  |
|  +---------------------+  |
|   <- swipe to next team   |
+---------------------------+
```

| Element | Behavior |
|---|---|
| Team card | `flex 0 0 100%`, full viewport width |
| Swipe | `scrollSnapType: "x mandatory"`, `scrollSnapAlign: "start"` — cards lock into place |
| Jump strip | Logo buttons above; tapping scrolls to that team's card |
| Card header | Team logo + full name on a gradient of the primary color |
| Matchup rows | One per opponent, in axis order. Same lookup as the desktop grid |
| Radius | `0` everywhere — cards and controls run edge to edge |

Same data, same lookup, same filter state. Only the arrangement differs.

---

## 6. Shared State

Both variants hold identical local state:

| State | Values | Default |
|---|---|---|
| `conference` | `"MEAC"` \| `"SWAC"` | `"MEAC"` |
| `swacScope` | `"ALL"` \| `"WEST"` \| `"EAST"` | `"WEST"` |
| `season` | number, lifted to the page | current season |

Season lives on `ConferenceSlatePage` and passes down, so the banner selector drives both variants. Conference and scope are internal to each variant — switching between desktop and mobile resets them, which is acceptable since the layouts don't coexist.

Both use `queryKey: ["conference-slate", season]`, so React Query serves one cached response to whichever variant is mounted.

---

## 7. Empty and Loading States

**Missing data renders a blank matrix, not an error.** The grid structure is meaningful on its own — the axes, the team logos, the colored diagonal all come from `teams.json` and describe the conference regardless of whether any games have been played. An empty grid reads as "no results yet," which is both honest and useful. An error message would throw away structure the user can still read.

| Condition | Behavior |
|---|---|
| Fetch in flight | Matrix renders with blank cells; fills in on arrival |
| Season has no export | Matrix renders with blank cells |
| Fetch fails | Matrix renders with blank cells |
| Season not yet played | Matrix renders with blank cells |
| Individual matchup absent | That cell renders blank |
| `has_game_page: false` | Cell renders content without a link |

All six collapse to the same path: `lookup` is empty or missing a key, and `SlateCell` returns its blank variant. Mobile does the same — `TeamMatchupRow` shows the opponent with `TBD` and no link.

There is deliberately **no** distinct error state. A season with no data and a season that failed to load look identical, because to the reader they mean the same thing: nothing to show here.

---

## 8. Open Items

| Item | Owner | Severity |
|---|---|---|
| Payload has no `axes` block yet; component runs on `FALLBACK_AXES` | Backend | High |
| `away_score` / `home_score` missing; scores recovered by splitting `score_display` | Backend | Medium |
| `status` inferred from presence of `winner_team_id` | Backend | Medium |
| `date_label` formatted client-side by `fmtDate` | Backend | Low |
| Fetch + adapter duplicated across both variants | Frontend | Low |
| `special_games[]` empty — championship and Celebration Bowl not classified | Backend | Low |

### Resolved — 2026-08-25: the `MATCHUPS` fallback

The component carried a hardcoded 43-entry array of real 2025 matchups, used whenever the fetch returned nothing:

```js
buildLookup(data?.matchups ? data.matchups.map(toMatrixMatchup) : MATCHUPS)
```

Any season without an export silently rendered last season's real scores under the new season's header. The page looked correct and every number on it was wrong — the worst class of data failure, because nothing signals it.

Removed. Both variants now pass an empty array through and render a blank matrix per section 7:

```js
buildLookup(data?.matchups?.map(toMatrixMatchup) ?? [])
```

### Resolved — 2026-08-25: hardcoded axes

`SWAC_EAST`, `SWAC_WEST`, and `MEAC` were frozen arrays the matrix read directly, so realignment or a roster change meant a code change.

Replaced with `FALLBACK_AXES` plus a payload read:

```js
const getAxis = (axes, key) => axes?.[key]?.team_ids ?? FALLBACK_AXES[key];
const teamIds = useMemo(() => getTeamsForView(conference, swacScope, data?.axes), [conference, swacScope, data]);
```

The payload's `axes` block wins the moment backend ships it, with no further frontend change. `FALLBACK_AXES` stays until then — deliberately, and unlike the `MATCHUPS` fallback it is safe: a stale division roster shows the wrong teams on an axis, which is visible and self-correcting, where stale scores read as fact.

### Resolved — 2026-08-25: season default

The page opened on `GAME_CENTER_DEFAULT_SEASON` via `useState`, so it landed on a hardcoded year regardless of the live season. Now reads `useFootballCurrentContext()` — see section 3.

### What the contract removes from the component

| Derived today | Replaced by |
|---|---|
| `FALLBACK_AXES` constant | `axes.*.team_ids` (wired; fallback drops when backend ships) |
| `score_display` split on `-` to recover scores | `away_score` / `home_score` |
| `status ?? (result \|\| winner_team_id ? "final" : "scheduled")` | `status` |
| `fmtDate` | `date_label` |
| `away_team_id ?? team_a_id` fallback chain | `away_team_id` / `home_team_id`, always present |
---
---

# Legacy Reference

*Content below predates the 2026-08-25 rewrite. Kept for pipeline history — the sections above are authoritative.*

## Conference Slate Hub - Design Document

**Route:** `/game-center/conferenceslate`  
**Legacy route:** `/game-center/schedule`  
**Component:** `src/components/molecules/game/ConferenceSlateMatrix.js`  
**Last updated:** 2026-05-03  
**Data status:** Current export wired; matchup schema is thinner than preferred.
**Fetch contract:** tracked in [Game Center Fetch Contract.md](./Game%20Center%20Fetch%20Contract.md) — full-season request confirmed acceptable as-is (92 KB, inherently a season-level view).

---

### Purpose

Conference Slate is the conference matchup matrix. It shows who played whom, who won, and which conference games have game-page links.

---

### Current Frontend Fetch Contract

Production matrix fetches one current-export payload through `gameCenterPaths.conferenceSlate(season)`.

```text
/data/1-game center/current_exports/slate/conference_slate_{season}.json
```

Current component:

```js
fetchJson(gameCenterPaths.conferenceSlate(season))
```

---

### Current Payload Inventory

The 2025 payload currently contains:

| Field | Shape | Current Use |
|---|---|---|
| `season` | number | selector/context |
| `generated_at` | ISO string | data freshness |
| `teams` | object | matrix axes |
| `matchups[]` | array | cell data |
| `special_games[]` | array | currently empty |
| `data_quality` | object | warnings/counts |

#### `teams`

Required keys:

| Key | Purpose |
|---|---|
| `meac` | MEAC matrix axis |
| `swac_west` | SWAC West matrix axis |
| `swac_east` | SWAC East matrix axis |

#### `matchups[]`

Current sample fields:

| Field | Purpose |
|---|---|
| `date`, `week`, `week_label` | cell context |
| `team_a_id`, `team_b_id` | matchup pair |
| `venue`, `venue_type` | location context |
| `status` | final/upcoming |
| `score_display` | score text |
| `division_scope` | matrix filtering |

The matrix converts these rows into its internal matchup lookup.

---

### Stale Or Incomplete Data

| Gap | Impact | Needed Fix |
|---|---|---|
| current matchups use `team_a_id` / `team_b_id` only | frontend cannot always know true away/home side | add `away_team_id`, `home_team_id` |
| no direct `away_score` / `home_score` | score parsing can be brittle | add direct score fields |
| no `winner_team_id` | winner color logic is weaker | add winner id |
| no `game_path_id` / `has_game_page` in sample fields | link authority unclear | include route-ready path id |
| `special_games[]` empty | SWAC title/Celebration display cannot be added | classify and export specials |

---

### Preferred Matchup Shape

```json
{
  "matchup_id": "swacjsu_swacasu_2025",
  "conference": "SWAC",
  "division_scope": "swac_east",
  "game_type": "regular_conference",
  "status": "final",
  "date": "2025-10-18",
  "week": 8,
  "away_team_id": "swacjsu",
  "home_team_id": "swacasu",
  "away_score": 38,
  "home_score": 13,
  "winner_team_id": "swacjsu",
  "score_display": "38-13",
  "game_path_id": "W8jsuasu",
  "has_game_page": true,
  "warnings": []
}
```

---

### Pipeline Requirements

1. Keep exporting `current_exports/slate/conference_slate_{season}.json`.
2. Preserve `teams.meac`, `teams.swac_west`, and `teams.swac_east`.
3. Add home/away side fields to every matchup.
4. Add direct score fields and `winner_team_id`.
5. Add `game_path_id` and `has_game_page`.
6. Classify regular conference vs championship/bowl special games.
7. Keep `data_quality.score_mismatches` and expand warnings per matchup.

