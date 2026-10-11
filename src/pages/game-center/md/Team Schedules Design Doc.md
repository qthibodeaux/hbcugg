# Team Schedules — Design Document

**Route:** `/game-center/team`
**Page file:** `src/pages/game-center/TeamSchedulePage.js`
**Data hook:** `src/hooks/useTeamScheduleData.js`
**Model:** `src/utils/teamScheduleModel.js`
**Last updated:** 2026-08-25
**Status:** Mobile complete. Desktop row regressed to a mobile idiom. Scoped fetch wired with a transport fallback (see section 3); filters need the shared vocabulary.

---

## 1. Objective

Team Schedules is the single-team browser — **one program's season, top to bottom.**

Pick a team, pick a season, and read their year as two lists: what has happened, and what is left. Every row is one game with enough context to not need a click — opponent, week, date, home or away, venue, result. Rows that have a recap link to it.

Season Schedule shows a division's grid. Conference Slate shows who played whom. This page is the one place a fan reads a **single team's story in order**.

---

## 2. Data Ownership Rule

**The backend sends one team's season, row-ready. The frontend lists it.**

Row layout, the results/upcoming split, and the two responsive row treatments stay frontend. Everything determining *what a row says* is backend: opponent identity, venue split, result, classification.

The frontend must not classify games by substring-searching their names — which is exactly what the filters do today. See section 4.

Local join is visual identity only — logos and colors from `src/data/teams.json`, keyed on `team_id`.

---

## 3. Request Contract

### Endpoint

```
/data/1-game center/current_exports/team_schedules/{season}/{team_id}.json
```

### Why this splits by team

The current request returns **all 18 teams — 508 KB — to display one.** Seventeen teams' schedules are parsed and discarded on every load.

Splitting by team matches the page exactly: it shows one team, and the selector changes which one. Each response is roughly 1/18th the payload, React Query caches per team, and switching back to a previously viewed team is instant. No single request hands over the league's full season.

This is the same argument as Season Schedule's per-division split, one level finer because the unit here is a team rather than a division.

**Query key is `["team-schedule", season, teamId]`.** It was `["team-schedule", season]` — correct only because the payload happened to contain every team, and a latent bug the moment the request became scoped.

### Frontend status — wired 2026-08-25

`useTeamScheduleData` already requests the scoped path. Because the pipeline hasn't published those files yet, it falls back to the wide season file and selects the team from it.

This is a **transport** fallback, not a data fallback: both paths return the same team's real games, so nothing downstream can tell which one served it. That is the difference between this and the fallbacks removed elsewhere in Game Center, which substituted *different* data and made the page lie.

Availability is probed **once per season**, not once per team — the first team viewed that season eats a single 404, and every other team goes straight to the shared season query. The wide file is cached under its own `["team-schedules-season", season]` key so it is fetched once and shared, rather than re-fetched for each team-scoped cache entry.

When the pipeline ships the scoped files the probe succeeds, the fallback goes cold on its own, and both it and `gameCenterPaths.teamSchedules` can be deleted.

**No bytes are saved until then.** The win is that the swap requires no frontend change.

### Payload

```json
{
  "season": 2026,
  "team_id": "swacjsu",
  "generated_at": "2026-08-24T00:00:00Z",

  "team": {
    "team_id": "swacjsu",
    "name": "Jackson State",
    "short_name": "JSU",
    "conference": "SWAC",
    "division": "East",
    "division_label": "SWAC East",
    "record": "10-2",
    "conference_record": "6-2",
    "division_record": "4-1"
  },

  "summary": {
    "games": 12,
    "final_games": 12,
    "upcoming_games": 0,
    "home_games": 6,
    "away_games": 5,
    "neutral_games": 1,
    "conference_games": 8,
    "games_with_recap": 10
  },

  "games": [
    {
      "game_id": "JSUSU11102026",
      "game_path_id": "W6jsusu",
      "route": "/game/W6jsusu",
      "has_recap": true,

      "status": "final",
      "status_label": "Final",
      "date": "2026-11-10",
      "date_label": "Nov 10",
      "week": 6,
      "week_label": "Week 6",
      "kickoff_label": "2:00 PM CT",

      "opponent": {
        "team_id": "swacsu",
        "name": "Southern",
        "short_name": "SU",
        "display_short": "SU",
        "opponent_class": "covered"
      },

      "home_away": "away",
      "neutral_site": false,
      "venue": {
        "stadium_name": "A.W. Mumford Stadium",
        "venue_label": "A.W. Mumford",
        "city": "Baton Rouge, LA",
        "neutral_site_name": null
      },

      "is_covered_matchup": true,
      "conference_scope": "conference",
      "division_scope": "cross_division",
      "game_type": "regular",
      "event": null,

      "result": "W",
      "team_score": 38,
      "opponent_score": 13,
      "display_score": "38-13",
      "winner_team_id": "swacjsu"
    }
  ]
}
```

### Field notes

| Field | Rule |
|---|---|
| `team.division_label` | Display-ready (`SWAC East`), not the export-shaped lowercase form |
| `games[]` | Pre-sorted by date. The frontend splits into results/upcoming on `status` |
| `opponent.display_short` | **Always present.** For outside opponents this is the only identity a row has |
| `opponent.opponent_class` | `covered` · `hbcu_external` · `non_hbcu` — see the vocabulary doc |
| `venue.venue_label` | Pre-shortened for the row. The frontend does not truncate |
| `venue.city` / `stadium_name` | Split fields. `venue` as one mixed string forces the row to guess |
| `result` | `"W"` / `"L"` from the selected team's perspective |
| `team_score` / `opponent_score` | Selected team's perspective, matching `result` |
| `has_recap` | Whether the row links to `/game/{game_path_id}` |
| Classification block | All five fields backend-owned — see section 4 |

### Season resolution

Already correct in `useTeamScheduleData`:

```js
const season = seasonOverride ?? currentSeason ?? GAME_CENTER_DEFAULT_SEASON;
```

---

## 4. Filters

This page has the **richest filter set on the site** — all six from the shared vocabulary:

```js
import { GAME_FILTERS, filterGames } from "../../utils/gameClassification";
```

| Filter | Label | Backend field |
|---|---|---|
| `all` | All | — |
| `hbcu` | HBCU Only | `is_covered_matchup` |
| `conference` | Conference | `conference_scope` |
| `division` | Division | `division_scope` |
| `championship` | Conf Champ | `game_type` |
| `postseason` | Postseason | `game_type` |

Vocabulary, values, and rationale: [Game Classification Vocabulary.md](./Game%20Classification%20Vocabulary.md).

### What this replaces

The current `gameMatchesFilter` is the worst classification code in the tree:

```js
if (filter === "championship") {
  return text.includes("championship") || text.includes("champ game")
      || text.includes("swac champ") || text.includes("meac champ");
}
```

`text` is `game_type`, `game_name`, `event_name`, `classic_name`, `stage_label`, and `status_label` concatenated and lowercased. A game named "Championship Drive Classic" would match. A conference title game whose export omits the word would not.

`filter === "division"` is worse in a quieter way — it compares `team.division === opponent.division` read from `teams.json`, the field that had Alcorn State in the wrong division until 2026-08-25. That filter silently returned wrong results for every Alcorn game.

`filter === "hbcu"` is `!!opponent` — "did `teams.json` resolve this id" standing in for a classification.

All three become field equality checks against backend data.

---

## 5. Desktop Layout

`PageShell` **hybrid mode** — grid slots on top, free-flowing list below via the `listContent` prop.

```
+-------------------------------------------------------------+
| Row 1   BannerTeamDetailPage (or BannerTeamSchedules)  cols 4|
|         team identity + season selector                      |
+-------------------------------------------------------------+
| Row 2   TeamScheduleBannerA                            cols 4|
|         team selector pills + season stat panel              |
+-------------------------------------------------------------+
| listContent  (outside the grid, full width)                  |
|                                                              |
|   [ filter pill rail ]              12 / 12                  |
|                                                              |
|   | RESULTS  10 games ------------------------------          |
|   +--------------------------------------------------+       |
|   | row                                              |       |
|   | row                                              |       |
|   +--------------------------------------------------+       |
|                                                              |
|   | UPCOMING  2 games remaining --------------------          |
|   +--------------------------------------------------+       |
|   | row                                              |       |
|   +--------------------------------------------------+       |
+-------------------------------------------------------------+
```

The banner swaps: `BannerTeamSchedules` (neutral hub) until a team is picked, `BannerTeamDetailPage` (team identity) after.

### Row treatment

Two rows are rendered per game and CSS-toggled — `TeamScheduleGameRowCompact` at `base→lg`, `TeamScheduleGameRowStandard` at `lg+`.

**The desktop row is currently wrong.** See section 8.

---

## 6. Mobile Layout

No `PageShell` — the banner reaches the true edge, same as every converted page.

```
+---------------------------+
| BannerTeamDetailPage      |
+---------------------------+
| TeamScheduleBannerA       |  selector pills + stats
+---------------------------+
| [ filter rail ] scrolls > |
|                           |
| RESULTS  10 games         |
| +-----------------------+ |
| | compact row           | |
| | compact row           | |
| +-----------------------+ |
|                           |
| UPCOMING  2 remaining     |
| +-----------------------+ |
| | compact row           | |
| +-----------------------+ |
+---------------------------+
```

`TeamScheduleGameRowCompact` — a 3-column grid (`week/date · opponent · score`), 100-112px tall, large opponent short name, colored result chip. This treatment is correct and should be preserved as-is.

Only the banner has had a dedicated mobile pass; the rest is desktop composition stacked in a padded column.

---

## 7. Empty and Loading States

| Condition | Behavior |
|---|---|
| No team selected | Banners render, list area empty |
| Fetch in flight | Spinner |
| Fetch fails | "Unable to load schedule for this team." |
| Team has no games this season | "No games for {team} in {season}" + "Try a different season." |
| Filter matches nothing | "No games match this filter" + "Try a broader schedule view." |
| `has_recap: false` | Row renders without a link |

The two empty states are deliberately distinct — *no data* and *filtered to nothing* are different problems with different fixes.

---

## 8. Open Items

| Item | Owner | Severity |
|---|---|---|
| Desktop row regressed to a mobile idiom; `GameRowOld` is dead code | Frontend | **High** |
| Filters classify by substring-searching prose | Backend ships fields, then Frontend | **High** |
| `division` filter reads structure from `teams.json` | Backend ships `division_scope` | High |
| Pipeline does not publish scoped per-team files | Backend | High |
| `venue` is one mixed city/stadium string | Backend | Medium |
| `opponent.display_short` null for non-HBCUs | Backend | Medium |
| `division` naming is export-shaped lowercase | Backend | Low |
| `team_count` was 17 in the 2025 export; universe is 18 | Backend | Low |

### The desktop row regression

`GameRowOld` at [TeamSchedulePage.js:102-202](../../../pages/game-center/TeamSchedulePage.js#L102-L202) is **defined and never rendered** — 100 lines of dead code. It is the original desktop row: a dense table line with a 52px week badge, a 32px logo, small-caps labels, and a right-aligned result. A list idiom.

What replaced it, `TeamScheduleGameRowStandard`, is 128-148px tall with `4xl` opponent names and boxed metric cells. That is a **card** idiom — the mobile treatment scaled up rather than a desktop row.

The intent is desktop returns to the dense list while mobile keeps `TeamScheduleGameRowCompact`. `GameRowOld` is the reference for what it looked like; it should either be restored as the `lg+` row or deliberately deleted once a replacement is designed. Leaving 100 lines of unrendered code as the only record of the old design is the worst of both.

### Resolved — 2026-08-25: scoped fetch wired

The hook requested `team_schedules_{season}.json` — all 18 teams, 508 KB — and `buildTeamScheduleModel` picked one out of it, so seventeen schedules were parsed and discarded per load. The query key omitted `teamId`, which was safe only because every team was in the payload.

Now:

- `gameCenterPaths.teamSchedule(season, teamId)` is the requested path
- `queryKey` is `["team-schedule", season, teamId]`
- team selection moved out of the model into the fetch layer; `buildTeamScheduleModel` takes a pre-selected `teamEntry` and no longer knows how many teams a request returned
- the wide file remains reachable as a per-season fallback until the pipeline ships scoped files

### What the contract removes

| Derived today | Replaced by |
|---|---|
| `gameMatchesFilter` string matching over six concatenated fields | `game_type`, `conference_scope`, `division_scope` |
| `team.division === opponent.division` from `teams.json` | `division_scope` |
| `!!opponent` as a proxy for "is HBCU" | `is_covered_matchup` |
| `SCHEDULE_FILTERS` local definitions | `GAME_FILTERS` |
| `getVenueDetails` regex-splitting `"Stadium (City)"` | `venue.city` / `venue.stadium_name` |
| `fmtDateParts` | `date_label` |
| `getGameLabel` / `getTag` fallback chains | `story_label` / `game_type` |
| `getWeekFromStem` regex on the path id | `week` / `week_label` |
| Client-side selection of one team from all 18 | per-team endpoint (wired; fallback drops when the pipeline ships) |

---
---

# Legacy Reference

*Content below predates the 2026-08-25 rewrite. Kept for pipeline history — the sections above are authoritative.*

## Team Schedules Hub - Design Document

**Route:** `/game-center/team`  
**File:** `src/pages/game-center/TeamSchedulePage.js`  
**Last updated:** 2026-05-03  
**Data status:** Current export wired; row UI recently updated; filters are frontend-derived.
**Fetch contract:** tracked in [Game Center Fetch Contract.md](./Game%20Center%20Fetch%20Contract.md) — full-season, all-18-teams request confirmed acceptable as-is per product call (508 KB, one team selected client-side).

---

### Purpose

Team Schedules is the single-team schedule browser. The user selects one HBCU program and season, then scans results/upcoming games with filters.

---

### Current Frontend Fetch Contract

Production fetches one current-export payload through `gameCenterPaths.teamSchedules(season)`.

```text
/data/1-game center/current_exports/team_schedules/team_schedules_{season}.json
```

Current page:

```js
fetchJson(gameCenterPaths.teamSchedules(season))
```

---

### Current Payload Inventory

The 2025 payload currently contains:

| Field | Shape | Current Use |
|---|---|---|
| `season` | number | selected season |
| `generated_at` | ISO string | freshness |
| `team_count` | number | context |
| `teams[]` | array | selected team schedule source |

#### `teams[]`

| Field | Purpose |
|---|---|
| `team` | embedded team identity |
| `conference`, `division` | filter/context |
| `record`, `conference_record`, `division_record` | banner stats |
| `summary` | schedule counts |
| `games[]` | team-perspective schedule rows |

#### `teams[].summary`

Current keys:

| Field | Purpose |
|---|---|
| `games`, `final_games`, `upcoming_games` | counts |
| `home_games`, `away_games`, `neutral_games` | location counts |
| `conference_games` | filter count |
| `parsed_games` | recap-ready count |

#### `teams[].games[]`

Current row fields:

| Field | Purpose |
|---|---|
| `game_id`, `game_path_id`, `route` | identity/linking |
| `date`, `week`, `week_label`, `status` | schedule context |
| `game_type`, `division_scope` | filters/tags |
| `home_team`, `away_team`, `team`, `opponent` | identity |
| `home_score`, `away_score`, `team_score`, `opponent_score` | score display |
| `winner_team_id` | winner styling |
| `venue`, `home_away` | location display |
| `score_authority`, `score_mismatch` | quality status |
| `has_parsed_game` | recap link readiness |

---

### Current Frontend Filters

Filters are currently computed in React:

| Filter | Current Logic |
|---|---|
| `All` | all selected team games |
| `HBCU Only` | opponent exists in `teams.json` |
| `Conference` | `conf_game` / `conference_game` |
| `Division` | same conference and division as selected team |
| `Conf Champ` | text match on championship labels |
| `Celebration / Playoffs` | `bowl_game` or text match on celebration/playoff/bowl |

---

### Stale Or Incomplete Data

| Gap | Impact | Needed Fix |
|---|---|---|
| `team_count` is 17 in 2025 export | app universe is 18 current programs | audit missing/extra program coverage |
| championship/playoff filters depend on text matching | brittle filter behavior | add normalized `game_type` enum values |
| `venue` can be null or mixed city/stadium text | row city/stadium split is imperfect | add `venue_city`, `stadium_name`, `neutral_site_name` |
| opponent abbreviations for non-HBCUs can be null | compact row fallback weak | add `opponent.abbreviation` or `opponent.display_short` |
| division naming is lowercase export-shaped | UI wants readable SWAC East/West | add display label or normalize in pipeline |

---

### Preferred Game Row Additions

```json
{
  "game_type": "regular_conference",
  "game_subtype": "division",
  "is_hbcu_opponent": true,
  "is_conference_championship": false,
  "is_postseason": false,
  "venue_city": "Baton Rouge, LA",
  "stadium_name": "A.W. Mumford Stadium",
  "opponent": {
    "team_id": "swacsu",
    "name": "Southern",
    "abbreviation": "SU",
    "display_short": "SU"
  }
}
```

---

### Pipeline Requirements

1. Keep exporting `current_exports/team_schedules/team_schedules_{season}.json`.
2. Ensure all 18 current HBCU programs are present or explicitly excluded.
3. Add normalized boolean fields for HBCU opponent, championship, postseason, and division game.
4. Split venue into city/stadium fields.
5. Provide compact display names for non-HBCU opponents.
6. Keep `has_parsed_game`, `game_path_id`, and `route` aligned.

