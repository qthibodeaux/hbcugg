# Season Schedule — Design Document

**Routes:** `/game-center/seasonschedule`, `/game-center/seasonschedule/:year`
**Page file:** `src/pages/game-center/SeasonSchedulePage.js`
**Data hook:** `src/hooks/useSeasonScheduleData.js`
**Model:** `src/utils/seasonScheduleModel.js`
**Last updated:** 2026-08-25
**Status:** Desktop and mobile layouts locked in. Fetch needs splitting; filter axis is wrong. Season already resolves from current context.

---

## 1. Objective

Season Schedule is the division board — **one division's entire season on a single grid.**

Columns are the six teams in a division. Rows are the weeks. Every cell is that team's game that week: opponent logo, home or away, final score. Read across a row to see one week league-wide. Read down a column to see one team's season. Read the whole grid to see the shape of a division — bye weeks, the tough stretches, who played whom and when.

Conference Slate answers *who played whom*. Season Schedule answers *when, and in what order*. Both are season-level views; neither replaces the other.

---

## 2. Data Ownership Rule

**The backend sends one division's board, cell-ready. The frontend draws the grid.**

Grid geometry, sticky headers, cell composition, and the mobile resize stay frontend. Everything that determines *what a cell says* is backend: which teams are in the division, which weeks exist, who the opponent was, what the score was, whether it was home or away, whether both teams are ours.

The frontend must not resolve opponents by fuzzy-matching team names, derive week numbers from dates, or carry its own division rosters. All three happen today — see Open Items.

Local join is visual identity only — logos and colors from `src/data/teams.json`, keyed on `team_id`.

---

## 3. Request Contract

### Endpoint

```
/data/1-game center/current_exports/schedule_board/{season}/{group}.json
```

`{group}` is `swac_east` | `swac_west` | `meac`.

### Why this one splits by group

The current single-season board is **768 KB — the largest payload in Game Center** — and the page renders exactly one division at a time. Two thirds of every fetch is discarded on arrival.

Splitting by group matches how the page is actually used:

- The board opens on one division and stays there until the user switches.
- Each group is ~1/3 the payload. React Query caches per group, so switching back is instant.
- No single request hands over the full season across all three divisions.

Unlike Week Central this is not a per-week split — a week slice of a season board is meaningless. The division is the unit, the same way the matrix is the unit on Conference Slate.

**Query key must be `["season-schedule-board", season, group]`** — keyed on both, or switching divisions serves the wrong cached board.

### Payload

```json
{
  "season": 2026,
  "group": "swac_east",
  "generated_at": "2026-08-24T00:00:00Z",

  "division": {
    "label": "SWAC East",
    "conference": "SWAC",
    "accent": "#F4811F",
    "team_ids": ["swacaamu", "swacasu", "swacbcu", "swacfamu", "swacjsu", "swacmvsu"]
  },

  "weeks": [
    { "week": 1, "label": "WK 1", "date_range": "Aug 29 - Sep 1" },
    { "week": 2, "label": "WK 2", "date_range": "Sep 5 - Sep 8" }
  ],

  "teams": [
    {
      "team_id": "swacjsu",
      "record": "10-2",
      "conference_record": "6-2"
    }
  ],

  "cells": [
    {
      "week": 1,
      "team_id": "swacjsu",

      "status": "final",
      "date": "2026-08-29",
      "date_label": "Aug 29",

      "opponent_id": "swacpvamu",
      "opponent_name": "Prairie View A&M",
      "opponent_short": "PVAMU",

      "home_away": "home",
      "neutral_site": false,

      "is_covered_matchup": true,
      "conference_game": true,
      "game_type": "regular_conference",

      "result": "W",
      "score_team": 38,
      "score_opp": 13,
      "display_score": "38-13",
      "winner_team_id": "swacjsu",

      "game_id": "PVAMUJSU08292026",
      "game_path_id": "W1pvamujsu",
      "route": "/game/W1pvamujsu",
      "has_game_page": true
    }
  ],

  "data_quality": {
    "warnings": []
  }
}
```

### Field notes

| Field | Rule |
|---|---|
| `division.team_ids` | **The board's columns come from here**, in display order. Not from a frontend constant |
| `division.accent` | Division accent color. Currently hardcoded per group in `GROUPS` |
| `weeks[]` | **The board's rows come from here.** Backend owns which weeks exist and what they're called |
| `cells[]` | Flat array. The frontend keys it by `[team_id][week]` — no derivation, just indexing |
| `opponent_id` | Required whenever the opponent is one of our 18. Never make the frontend match on name |
| `opponent_name` / `opponent_short` | **Always present.** For outside opponents this is the only identity there is; for our teams it still ships so a cell can render before any local join. Never a null side with no text |
| `is_covered_matchup` | `true` when both teams are among our 18. **Backend-owned — the frontend does not compute it and carries no fallback.** Drives the filter, see section 4 |
| `conference_game` | Separate from `is_covered_matchup`. Drives the `NC` badge only |
| `display_score` | Display text. Never parsed back into numbers |
| `date_label` | Shown in the cell's score band when a game hasn't been played |
| A bye week | Simply no cell for that `[team_id, week]` pair. The cell renders blank |

### Season resolution

Route param wins, then the selector override, then current context:

```js
const season = seasonOverride ?? routeSeason ?? currentSeason ?? GAME_CENTER_DEFAULT_SEASON;
```

Already wired correctly in `useSeasonScheduleData`.

---

## 4. The Filter

**Same axis as Week Central: are both teams ours?**

| Case | `is_covered_matchup` | Behavior |
|---|---|---|
| Jackson State vs Alabama State | `true` | Always shows — SWAC East conference game |
| NC Central vs Texas Southern | `true` | **Always shows.** MEAC vs SWAC is non-conference, but both are our 18 |
| Jackson State vs Florida | `false` | Hidden when the filter is on |

The board currently filters on `game_type` containing `"conference"`, which hides NCCU vs Texas Southern. That is the same bug corrected on Week Central, and it is worse here because the filter **defaults to on** — the board opens already hiding every cross-conference HBCU game.

> **Naming debt:** `includeNonConference` / `setIncludeNonConference` and the "Non-Conf On/Off" pill are wrong on both counts — wrong axis, and a user reading "Non-Conf" would expect NCCU vs Texas Southern to disappear. Replace with the shared filters: `pickFilters("all", "hbcu")` from `src/utils/gameClassification.js`, labeled `All Games` / `HBCU Only`. Default to `all` so the board opens complete.

The full vocabulary — all four axes, their values, and why coverage is not the same as "HBCU" — is specified in [Game Classification Vocabulary.md](./Game%20Classification%20Vocabulary.md).

**`conference_game` stays separate.** It is not a filter — it drives the small `NC` badge in a cell's top-right corner, which is a useful marker on a game that still belongs on the board.

---

## 5. Desktop Layout

`PageShell`, 4-column grid. Banner on row 1, board fills nine rows below it.

```
+-------------------------------------------------------------+
| Row 1   ScheduleBanner                             cols 4    |
|         season | division pills | filter toggle              |
+-------------------------------------------------------------+
| Rows 2-10                                    cols 4, rows 9  |
| +---------------------------------------------------------+ |
| | DIVISION BOARD                    @ = away - all games   | |
| | SWAC EAST SCHEDULE                                       | |
| +------+------+------+------+------+------+---------------+ |
| | Week | AAMU | ASU  | BCU  | FAMU | JSU  | MVSU          | |
| +------+------+------+------+------+------+---------------+ |
| | WK 1 | cell | cell | cell | cell | cell | cell          | |
| | WK 2 | cell | cell | cell | cell | cell | cell          | |
| | WK 3 | cell |      | cell | cell | cell | cell          | |  <- bye
| |  ... |      |      |      |      |      |               | |
| +------+------+------+------+------+------+---------------+ |
+-------------------------------------------------------------+
```

Grid template: `58px repeat(6, minmax(0, 1fr))`. Header row and week column are both sticky; the corner cell is sticky at both with `zIndex 4`.

### Cell anatomy

| Element | Behavior |
|---|---|
| Opponent logo | Centered. Larger (`34px`) for conference games, smaller (`25px`) for non-conference |
| Outside opponent | No logo available — renders the name as text, two lines max |
| `@` marker | Top-left, white, when `home_away` is `away` |
| `NC` badge | Top-right, when `conference_game` is false |
| Score band | Pinned to the cell bottom, full width. Filled with the winner's primary color when final |
| Unplayed | Score band shows `date_label` on a neutral background |
| Bye week | Cell renders flat dark, no border treatment |
| Link | Wraps to `/game/{game_path_id}` when `has_game_page` |

### Banner controls

Season dropdown · division segmented pills (`SWAC East` / `SWAC West` / `MEAC`) · filter toggle pill.

---

## 6. Mobile Layout

**Mobile keeps the grid.** An earlier swipeable-card version was reverted — the board's value is the two-dimensional read, and flattening it to a per-team list destroys that. Instead the same grid is resized: tighter padding, bolder text, square corners, no decorative chrome.

```
+---------------------------+
| ScheduleBanner            |
|  season | E W M | (+)     |  division pills inline
+---------------------------+
| WK | AAMU| ASU | BCU |... |  horizontally scrollable
+----+-----+-----+-----+----+
| 1  |cell |cell |cell |    |
| 2  |cell |cell |cell |    |
| 3  |cell |     |cell |    |
+----+-----+-----+-----+----+
```

| Element | Behavior |
|---|---|
| Division pills | Inline in the banner, set `groupId` immediately — no sheet |
| Advanced sheet | The `+` button opens a sheet holding the filter toggle |
| Cells | `MobileGameCell` — same composition as desktop, tighter |
| Radius | `0` throughout |

---

## 7. Empty and Loading States

| Condition | Behavior |
|---|---|
| Fetch in flight | Spinner in the board frame |
| Fetch fails | "Unable to load season schedule." in the board frame |
| Season has no export | Same as fetch failure |
| Team has a bye that week | Cell renders blank |
| Filter hides a cell | Cell renders blank — the grid never collapses |
| `has_game_page: false` | Cell renders content without a link |

The grid geometry is fixed by `division.team_ids` and `weeks[]`, so filtering and byes leave holes rather than reflowing. That is deliberate: a column must stay under its team's header.

---

## 8. Open Items

| Item | Owner | Severity |
|---|---|---|
| Filter uses `game_type`, hides HBCU cross-conference games; defaults to on | Backend ships `is_covered_matchup`, then Frontend | **High** |
| `WEEK_WINDOWS` hardcodes 2025 date ranges, used to derive weeks for any season | Frontend + Backend | **High** |
| Single 768 KB request for all three divisions | Backend | High |
| Opponents resolved by fuzzy name matching; sides can arrive null | Backend | High |
| `GROUPS` hardcodes division rosters and accent colors | Backend | Medium |
| Two board-building code paths (`cells` vs derived from `games`) | Frontend + Backend | Medium |
| `scoreLabel` builds score strings and falls back to slicing a date | Backend | Low |
| `teams[]` had 17 entries in the 2025 export; the universe is 18 | Backend | Low |

### The `WEEK_WINDOWS` problem

[seasonScheduleModel.js](../../../utils/seasonScheduleModel.js) carries fourteen hardcoded 2025 date ranges:

```js
{ week: 1, label: "WK 1", start: "2025-08-25", end: "2025-08-31" },
```

`deriveWeek(date)` matches a game's date against these windows — **for any season**. Load 2026 and every date falls outside every window, so `deriveWeek` returns `null` and those games are dropped from the board entirely. It also caps at week 14, silently discarding championship and bowl weeks.

This only fires on the fallback path (when the payload has no `cells`), but that path is reachable. `weeks[]` in the contract removes it.

### The name-matching layer

`normalizeTeamName` strips punctuation and rankings, then `TEAM_NAME_ALIASES` maps 22 hand-written strings like `prairieviewaandmuniversity` to team ids, backing `TEAM_BY_NAME` for `resolveOpponent`. It exists because opponents arrive as names rather than ids.

`opponent_id` in the contract removes the entire layer. Outside opponents keep `opponent_name` / `opponent_short` and render as text, which is correct — there is no logo for them anyway.

### What the contract removes

| Derived today | Replaced by |
|---|---|
| `GROUPS[].teams` constants | `division.team_ids` |
| `GROUPS[].accent` constants | `division.accent` |
| `WEEK_WINDOWS` + `deriveWeek` | `weeks[]` |
| `normalizeTeamName` + `TEAM_NAME_ALIASES` + `TEAM_BY_NAME` + `resolveOpponent` | `opponent_id` |
| `scoreLabel` | `display_score` / `date_label` |
| Dual `cells` vs `games` board building | `cells[]`, single path |
| `game_type.includes("conference")` filter test | `is_covered_matchup` |

---
---

# Legacy Reference

*Content below predates the 2026-08-25 rewrite. Kept for pipeline history — the sections above are authoritative.*

## Season Schedule Hub - Design Document

**Routes:** `/game-center/seasonschedule`, `/game-center/seasonschedule/:year`  
**File:** `src/pages/game-center/SeasonSchedulePage.js`  
**Last updated:** 2026-05-03  
**Data status:** Current export wired; frontend still supports legacy/fallback shapes.
**Fetch contract:** tracked in [Game Center Fetch Contract.md](./Game%20Center%20Fetch%20Contract.md) — full-season request confirmed acceptable as-is per product call, though at 768 KB it's the largest confirmed-OK payload in Game Center; revisit if it keeps growing.

---

### Purpose

Season Schedule is the full weekly board across HBCU teams, grouped by SWAC East, SWAC West, and MEAC.

---

### Current Frontend Fetch Contract

Production fetches one current-export payload through `gameCenterPaths.scheduleBoard(season)`.

```text
/data/1-game center/current_exports/schedule_board/season_schedule_board_{season}.json
```

Current page:

```js
fetchJson(gameCenterPaths.scheduleBoard(season))
```

---

### Current Payload Inventory

The 2025 payload currently contains:

| Field | Shape | Current Use |
|---|---|---|
| `season` | number | selected season |
| `generated_at` | ISO string | freshness |
| `teams[]` | array | team records and selectors |
| `weeks[]` | array | board rows |
| `data_quality` | object | mismatch/unlinked counts |

#### `teams[]`

| Field | Purpose |
|---|---|
| `team` | embedded team identity |
| `record` | overall record |
| `conference_record` | conference record |

#### `weeks[]`

| Field | Purpose |
|---|---|
| `week`, `label` | row identity |
| `summary` | counts for the week |
| `games[]` | canonical game rows |
| `cells` | board-ready cells when present |

#### `weeks[].games[]`

| Field | Purpose |
|---|---|
| `game_id`, `game_path_id`, `route` | identity/linking |
| `date`, `week`, `week_label`, `status` | schedule context |
| `game_type`, `division_scope` | filter/group metadata |
| `home_team`, `away_team`, `team`, `opponent` | identity |
| `home_score`, `away_score`, `team_score`, `opponent_score` | score display |
| `winner_team_id` | winner styling |
| `venue`, `home_away` | location marker |
| `score_authority`, `score_mismatch` | quality status |
| `has_parsed_game` | route readiness |

---

### Current Client-Side Derivations

The page currently:

- selects season from route or default
- selects group locally (`swac-east`, `swac-west`, `meac`)
- toggles non-conference inclusion locally
- can build board cells from `weeks[].cells` or derive from `weeks[].games`
- joins team identity from `teams.json`

---

### Stale Or Incomplete Data

| Gap | Impact | Needed Fix |
|---|---|---|
| `teams[]` count is 17 in 2025 export | expected HBCU universe is 18 in app metadata | audit missing/extra team membership |
| `cells` shape is not documented strongly enough | frontend keeps fallback derivation logic | make `weeks[].cells` the required board contract |
| some games lack parsed routes | cells cannot link to game detail | ensure `game_path_id` where parsed file exists |
| non-HBCU opponent identity is variable | fallback marks can be inconsistent | provide `opponent.display_name` and `opponent.abbreviation` |
| `data_quality` is only counts | hard to diagnose page-specific defects | add per-week/per-game warnings |

---

### Preferred Board Cell Shape

```json
{
  "week": 6,
  "label": "Week 6",
  "cells": {
    "swacjsu": {
      "status": "final",
      "game_id": "JSUSU11102025",
      "game_path_id": "W6jsusu",
      "route": "/game/W6jsusu",
      "team_id": "swacjsu",
      "opponent_id": "swacsu",
      "opponent_name": "Southern",
      "home_away": "away",
      "neutral_site": false,
      "conference_game": true,
      "game_type": "regular_conference",
      "result": "W",
      "score_team": 38,
      "score_opp": 13,
      "display_score": "38-13",
      "winner_team_id": "swacjsu"
    }
  }
}
```

---

### Pipeline Requirements

1. Keep exporting `current_exports/schedule_board/season_schedule_board_{season}.json`.
2. Ensure all 18 current HBCU programs are represented or explicitly explain exclusions.
3. Make `weeks[].cells` the authoritative board-ready data.
4. Include route-ready `game_path_id` when a game file exists.
5. Normalize HBCU opponent IDs to v5 ids.
6. Provide stable non-HBCU opponent display fields.
7. Expand `data_quality` beyond counts into actionable warnings.

