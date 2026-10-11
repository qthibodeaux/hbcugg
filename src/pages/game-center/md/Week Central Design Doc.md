# Week Central — Design Document

**Route:** `/game-center/week`
**Page file:** `src/pages/game-center/WeekCentralPage.js`
**Component dir:** `src/components/organisms/game-center/week/`
**Last updated:** 2026-08-25
**Status:** Layout complete on desktop and mobile. Blocked on backend for the per-week request and embedded briefs.

---

## 1. Objective

Week Central is the single-week command board. Pick a week, see every game in it, click one, read the story.

It is the only page in Game Center where the user drives the time axis. Everything else opens on "now"; this page exists so a fan can go back to Week 7 and see exactly what Week 7 looked like — including each team's record *at that moment*, not their record today.

Two panels, always both on screen:

- **Left — the slate.** Every game that week, one row each.
- **Right — the brief.** The selected game's story: line score, MVP, team metrics, statistical leaders.

Selecting a row on the left swaps the right. There is no third state and no navigation away.

---

## 2. Data Ownership Rule

**The backend sends one week, display-ready. The frontend renders it.**

Today the page fetches the entire season (236 KB) and filters client-side to show six games. That is both wasteful and a scraping surface — one request should not hand over a full year of data.

Target: one request per `[season, week]`. The user pays a small cost per week they actually look at, and no single call exposes the season.

Everything a user reads is a backend string. The frontend does not derive week labels, format dates, shorten stadium names, compute conference tags, or decide which games count as HBCU matchups. The only local join is visual identity — logos and colors from `src/data/teams.json`, keyed on `team_id`.

---

## 3. Request Contract

### Endpoint

```
/data/1-game center/current_exports/week_central/{season}/{week}.json
```

One request per committed week. React Query key must be `["week-central", season, week]` — keyed on both params so each visited week caches independently and back/forward is instant with no refetch.

### Payload

```json
{
  "season": 2026,
  "week": 1,
  "label": "Week 1",
  "compact_label": "W1",
  "date_range": "Aug 29 - Sep 1",
  "is_current_week": true,
  "updated_at": "2026-08-24T00:00:00Z",

  "weeks": [
    { "week": 0,  "label": "Week 0",            "compact_label": "W0",  "game_count": 0 },
    { "week": 1,  "label": "Week 1",            "compact_label": "W1",  "game_count": 6 },
    { "week": 15, "label": "SWAC Championship", "compact_label": "SCG", "game_count": 1 },
    { "week": 16, "label": "Celebration Bowl",  "compact_label": "CB",  "game_count": 1 }
  ],

  "summary": {
    "total_games": 6,
    "hbcu_matchups": 4,
    "outside_games": 2,
    "final_games": 0,
    "preview_games": 6
  },

  "games": [
    {
      "game_id": "PVAMUJSU08292026",
      "game_path_id": "W1pvamujsu",
      "route": "/game/W1pvamujsu",
      "has_detail_page": true,

      "status": "preview",
      "status_label": "Preview",
      "date": "2026-08-29",
      "date_label": "Aug 29",
      "kickoff_label": "1:00 PM CT",
      "tv": "ESPN+",

      "is_covered_matchup": true,
      "tag": "Conference",
      "story_label": "SWAC Opener",
      "conference_game": true,
      "bowl_game": false,
      "sort_order": 1,

      "away_team": {
        "team_id": "swacpvamu",
        "name": "Prairie View A&M",
        "short_name": "PVAMU",
        "score": null,
        "record": "0-0",
        "conference_record": "0-0"
      },
      "home_team": {
        "team_id": "swacjsu",
        "name": "Jackson State",
        "short_name": "JSU",
        "score": null,
        "record": "0-0",
        "conference_record": "0-0"
      },
      "winner_team_id": null,

      "venue": {
        "stadium": "Veterans Memorial Stadium",
        "venue_label": "Veterans Memorial",
        "city": "Jackson, MS",
        "neutral_site_name": null
      },

      "brief": {}
    }
  ]
}
```

### Field notes

| Field | Rule |
|---|---|
| `weeks[]` | Rides along in every response so the week selector never needs a second request |
| `weeks[].game_count` | `0` marks a week with nothing to show — selector disables it instead of letting the user land on a dead page |
| `is_covered_matchup` | `true` when **both** teams are among our 18. **Backend-owned — the frontend does not compute it and carries no fallback.** Drives the slate filter, see section 4 |
| `away_team` / `home_team` | **Both always populated.** Every game names both sides, with a `team_id` or with `name`/`short_name` text. Never a null side with no text — including neutral-site games, where the known HBCU side's id is dropped today |
| `record` | Point-in-time — the team's record entering that game, not the season total |
| `sort_order` | `games[]` arrives pre-sorted; this is the tiebreak if anything re-sorts |
| `has_detail_page` | Whether `/game/{game_path_id}` has a parsed file behind it |
| `venue_label` | Pre-shortened for the row. The frontend does not truncate |
| Team identity | Only `team_id` is required — logo and colors join locally |

---

## 4. The Slate Filter

The toggle has **nothing to do with conference**. The axis is: *are both teams ours?*

| Case | `is_covered_matchup` | Behavior |
|---|---|---|
| NC Central vs Texas Southern | `true` | Always shows. MEAC vs SWAC is non-conference, but both are our teams |
| Prairie View vs Jackson State | `true` | Always shows |
| Jackson State vs Florida | `false` | Hidden when the filter is on |
| Neither team ours | — | Never in the payload at all |

Backend owns the boolean. The frontend never runs a team-membership check against `teams.json` to decide what belongs in the slate.

> **Naming debt:** the provider still calls this `includeNonConference` / `toggleNonConference` and the button reads "Non-Conf Off". Both are wrong — a user reading "Non-Conf" would expect NCCU vs Texas Southern to disappear, and it must not. Replace with the shared filters: `pickFilters("all", "hbcu")` from `src/utils/gameClassification.js`, labeled `All Games` / `HBCU Only`.

The full vocabulary — all four axes, their values, and why coverage is not the same as "HBCU" — is specified in [Game Classification Vocabulary.md](./Game%20Classification%20Vocabulary.md).

---

## 5. Weekly Brief

Every game in the payload carries an embedded `brief`. The frontend does **not** make a second fetch for the selected game — that is the current behavior and it is the gap, not the target.

```json
"brief": {
  "source": "parsed",
  "line_score": {
    "away": [7, 3, 6, 7],
    "home": [0, 7, 7, 13]
  },
  "mvp": {
    "player_id": "cameron-peters",
    "name": "Cameron Peters",
    "position": "QB",
    "team_id": "swacpvamu",
    "glory": 22.7,
    "stat_line": "241 pass yds, 2 TD",
    "image_url": "/data/3-players/images/example.jpg"
  },
  "metrics": [
    {
      "key": "epa_play",
      "label": "EPA / Play",
      "away_display": "0.28",
      "home_display": "0.16",
      "away_bar": 72,
      "home_bar": 42
    }
  ],
  "leaders": [
    {
      "key": "passing_yards",
      "label": "Passing Yards",
      "away": {
        "player_id": "cameron-peters",
        "name": "Cameron Peters",
        "value": 241,
        "stat_line": "18/27, 2 TD",
        "image_url": null
      },
      "home": {
        "player_id": "wayne-favors",
        "name": "Wayne Favors",
        "value": 206,
        "stat_line": "16/25, 1 TD",
        "image_url": null
      }
    }
  ],
  "warnings": []
}
```

### `source` values

| Value | Meaning | UI treatment |
|---|---|---|
| `"parsed"` | Real stats from a parsed game file | Normal render |
| `"preview"` | Game hasn't happened | Preview state, no metrics |
| `"mock"` | Placeholder standing in for missing stats | Visually marked as provisional |
| `"schedule_fallback"` | Schedule row only, no stat package | Minimal render, no fabricated numbers |

Mock and fallback must be distinguishable from real data. Rendering placeholder numbers that look real is worse than rendering nothing.

### Metric set (10, fixed order)

`EPA / Play` · `Success Rate` · `Yards / Play` · `EPA / Rush` · `EPA / Pass` · `Explosive Rate` · `3rd Down` · `Red Zone TD%` · `Stuff Rate` · `Havoc Rate`

`*_display` is the formatted string the user reads. `*_bar` is a 0-100 value for bar width. The frontend does no math on either.

### Leader set (5, fixed order)

`Passing Yards` · `Rushing Yards` · `Receiving Yards` · `Havoc Leader` · `Tackles`

---

## 6. Desktop Layout

`PageShell`, 4-column grid. Banner on row 1, then one tall slot holding a two-column split.

```
+-------------------------------------------------------------+
| Row 1   WeekCentralBanner                          cols 4    |
+-------------------------------------------------------------+
| Rows 2-6                                     cols 4, rows 5  |
| +-------------------------------+-------------------------+ |
| | WeekGameList                  | WeeklyBriefPanel        | |
| |   minmax(0, 1.65fr)           |   minmax(280px, 0.85fr) | |
| |                               |                         | |
| |   [ WeekGameRow ]  <- selected|   Line score            | |
| |   [ WeekGameRow ]             |   MVP                   | |
| |   [ WeekGameRow ]             |   Metrics x10           | |
| |   [ WeekGameRow ]             |   Leaders x5            | |
| |   scrolls independently       |   scrolls independently | |
| +-------------------------------+-------------------------+ |
+-------------------------------------------------------------+
```

Grid gap `3`. Both panels get `borderRadius="lg"` and a `whiteAlpha.100` border.

| Element | Component |
|---|---|
| Banner + controls | `WeekCentralBanner` |
| Slate container | `WeekGameList` |
| Slate row | `WeekGameRow` |
| Brief container | `WeeklyBriefPanel` |
| Brief content | `WeekCentralBrief` (`molecules/game/`) |

### Banner controls

Season select · week prev · week select · week next · `Go` · filter toggle.

Controls are **draft state until `Go`**. The user changes season and week freely; nothing fetches until they commit. This is deliberate — it keeps a week change from firing three requests while they scroll a dropdown.

---

## 7. Mobile Layout

No `PageShell` — its grid gap and page padding leave a dead band above the content. Mobile builds its own tree.

```
+---------------------------+
| WeekCentralBanner         |  edge-to-edge, no radius
+-------------+-------------+
| WeekGame    | WeeklyBrief |  2 cols, gap 0
| List        | Panel       |
|             |             |
| [row]  <-sel|  Line score |
| [row]       |  MVP        |
| [row]       |  Metrics    |
| [row]       |  Leaders    |
|             |             |
| scrolls     | scrolls     |
+-------------+-------------+
   height: calc(100vh - header - 0.5rem)
```

Both panels stay on screen side by side — the brief is not pushed below the fold or behind a tap-through. `gap={0}` and `borderRadius="0"` so the two columns meet with a single hairline.

| Element | Component |
|---|---|
| Banner + controls | `WeekCentralBanner` (responsive internally) |
| Slate container | `WeekGameList` (same, `p={0}` `gap={0}`) |
| Slate row | `WeekCentralGameRowMobile` |
| Brief | `WeeklyBriefPanel` (same, no radius) |

---

## 8. State Model

Three React contexts from `WeekCentralProvider`, split so a selection change doesn't re-render the chrome:

| Context | Holds |
|---|---|
| `useWeekCentralChrome` | season, week, week options, labels, totals, loading/error, current-context |
| `useWeekCentralSelection` | slate, selected game, selected theme |
| `useWeekCentralActions` | `commitControls`, `goToPreviousWeek`, `goToNextWeek`, `toggleNonConference`, `selectGame` |

**Selected theme** derives from the game: a final themes to the winner's colors, an outside-opponent game themes to whichever side is ours, a preview falls back to brand red. That is a visual decision and stays frontend.

**Default selection** is the first row in the slate. Changing week or filter resets selection to `null` so the first row of the new slate takes over.

---

## 9. Empty and Loading States

| Condition | Behavior |
|---|---|
| Fetch in flight | Full-page spinner |
| Week has zero games | Selector should have disabled it — see `weeks[].game_count` |
| Filter hides everything | Slate shows "No games available for this filter", brief shows a matching prompt |
| `has_detail_page: false` | Row renders without a link; brief still shows whatever `brief` carries |
| `brief.source: "preview"` | Metrics and leaders suppressed, matchup context only |

The Week 0 dead-end is a real bug today: the week is reachable, has no HBCU matchups, and both panels render unhelpful copy. `game_count` on the week list fixes it at the source.

---

## 10. Open Items

| Item | Owner | Blocking |
|---|---|---|
| Per-week endpoint | Backend | Page still fetches the whole season |
| Embedded `brief` on every game | Backend | Brief needs a second fetch per selection |
| `brief.source` flag | Backend | Mock data is indistinguishable from real |
| Point-in-time `record` | Backend | Rows show "Record TBD" |
| `weeks[].game_count` | Backend | Dead weeks are reachable |
| `is_covered_matchup` | Backend | Frontend still classifies via `teams.json` |
| Both sides resolved on every game, neutral sites included | Backend | Rows render literal "Home"/"Away" placeholders |
| `hbcuOnly` rename | Frontend | Toggle label misdescribes what it does |
| Backend-owned labels | Backend | `getWeekLabel`, `fmtDate`, `shortenVenue` still derive in `weekCentralAdapter.js` |

### What the contract removes from `weekCentralAdapter.js`

| Derived today | Replaced by |
|---|---|
| `getWeekLabel` — week 15/16 names hardcoded | `label` / `compact_label` |
| `fmtDate` | `date_label` |
| `shortenVenue` + a 15-entry stadium nickname map | `venue.venue_label` |
| `stage` branching | `tag` |
| `status` from score presence | `status` / `status_label` |
| `getGameWinner` | `winner_team_id` |
| `isHBCUTeam` / `bothHBCU` / `isOutsideOpponent` | `is_covered_matchup` |
| slate `.sort()` | pre-sorted `games[]` |
| `totals` reduce | `summary` |
| `getSeasonGames` flatten + dedupe | gone — one week arrives clean |

---
---

# Legacy Reference

*Content below predates the 2026-08-25 rewrite. Kept for pipeline history — the sections above are authoritative.*

## Week Central Hub - Design Document

**Route:** `/game-center/week`  
**Files:** `src/pages/game-center/WeekCentralPage.js`, `src/components/organisms/game-center/week/`  
**Last updated:** 2026-05-03  
**Data status:** Production route uses the current-export season payload today. Target state is a committed season/week request that returns only the selected week's HBCU games with embedded brief data.
**Fetch contract:** tracked in [Game Center Fetch Contract.md](./Game%20Center%20Fetch%20Contract.md) — flagged there as **needs rework** (236 KB fetched per season just to show one week). Keep both in sync when this moves to `week_central_week_payload(season, week)`.

---

### Purpose

Week Central is the single-week command board. It shows all HBCU games for a selected week and drives the selected-game Weekly Brief panel.

---

### Current Frontend Fetch Contract

Current route:

```js
// WeekCentralPage.js
const WeekCentralPage = () => (
  <WeekCentralProvider>
    <WeekCentralShell />
  </WeekCentralProvider>
);
```

The live implementation currently fetches:

```text
/data/1-game center/current_exports/week_central/week_central_{season}.json
/data/1-game center/current_exports/games/{season}/{parsed_game_stem}.json
```

The first file powers the weekly slate. The second powers the selected-game Weekly Brief when `has_parsed_game` and `parsed_game_stem` / `game_path_id` are available.

---

### Target Supabase Fetch Contract

Week Central should use a committed-control fetch model:

1. User changes draft season/week controls.
2. User clicks `Go`.
3. Frontend commits `{ season, week }`.
4. One query loads the page-ready week payload.

Target query boundary:

```text
week_central_week_payload(season, week)
```

Target response shape:

```json
{
  "season": 2026,
  "week": 7,
  "label": "Week 7",
  "date_range": "Oct 6 - Oct 12",
  "updated_at": "2026-05-03T00:00:00Z",
  "summary": {
    "visible_games": 6,
    "final_games": 4,
    "preview_games": 2,
    "conference_games": 3,
    "hbcu_games": 6
  },
  "games": []
}
```

The `games[]` array should include only the selected week's visible HBCU/HBCU-relevant games after backend filtering. The frontend should not have to load the whole season and filter it for the main Week Central view.

#### Target `games[]` Shape

```json
{
  "game_id": "PVAMUJSU06122025",
  "game_path_id": "W15pvamujsu",
  "route": "/game/W15pvamujsu",
  "status": "final",
  "date": "2025-12-06",
  "kickoff": "1:11 PM",
  "game_type": "conference_championship",
  "story_label": "SWAC Championship",
  "conference_game": true,
  "bowl_game": false,
  "home_team": {
    "team_id": "swacjsu",
    "name": "Jackson State",
    "short_name": "JSU",
    "score": 27,
    "record": "10-2"
  },
  "away_team": {
    "team_id": "swacpvamu",
    "name": "Prairie View A&M",
    "short_name": "PVAMU",
    "score": 23,
    "record": "9-3"
  },
  "winner_team_id": "swacjsu",
  "venue": {
    "city": "Jackson, MS",
    "stadium": "Veterans Memorial Stadium",
    "neutral_site_name": null
  },
  "brief": {}
}
```

#### Target `brief` Shape

Every selected-week game should include a `brief` object. If parsed stats are unavailable, return a visually usable fallback with `source: "mock"` or `source: "schedule_fallback"` so the frontend does not render blank technical states.

```json
{
  "source": "parsed",
  "line_score": {
    "away": [7, 3, 6, 7],
    "home": [0, 7, 7, 13]
  },
  "mvp": {
    "player_id": "optional-player-key",
    "name": "Cameron Peters",
    "position": "QB",
    "team_id": "swacpvamu",
    "glory": 22.7,
    "image_url": "/data/3-players/images/example.jpg"
  },
  "metrics": [
    {
      "key": "epa_play",
      "label": "EPA / Play",
      "away_value": 0.15,
      "home_value": 0.02,
      "format": "decimal"
    }
  ],
  "leaders": [
    {
      "key": "passing_yards",
      "label": "Passing Yards",
      "away": {
        "player_id": "optional-player-key",
        "name": "Cameron Peters",
        "value": 241,
        "stat_line": "18/27, 2 TD",
        "image_url": "/data/3-players/images/example.jpg"
      },
      "home": {
        "player_id": "optional-player-key",
        "name": "Wayne Favors",
        "value": 206,
        "stat_line": "16/25, 1 TD",
        "image_url": "/data/3-players/images/example.jpg"
      }
    }
  ],
  "warnings": []
}
```

Frontend adapters may still normalize defensively, but the backend owns this page-ready shape.

#### Field Semantics — Resolved 2026-08-13

Two open questions raised while building the backend contract:

**`home_team.record` / `away_team.record` — point-in-time, not season-total.** This is each team's record *as of the moment that specific game was played* (their record entering that game, then updated by its own result if final), not their current end-of-season record. A user browsing Week 3 in November should see what each team's record was at Week 3, not their record today. This matters most for past/final games — a season-total record would silently drift as the season continues, making historical weeks show numbers that don't match what was true at the time. Format: plain string, `"W-L"` (e.g. `"10-2"`), exactly as shown in the `games[]` shape above — not a nested `{wins, losses}` object.

**`last5` / `streak` do not belong in Week Central's contract.** They belong to Standings only — see `Standings` section of `Game Center Fetch Contract.md` and `Standings Design Doc.md`. Week Central's `home_team`/`away_team` objects carry `record` only (see above).

---

### Current-Export Source

```text
/data/1-game center/current_exports/week_central/week_central_{season}.json
```

Current 2025 export top-level fields:

| Field | Shape |
|---|---|
| `season` | number |
| `default_week` | number |
| `updated_at` | ISO string |
| `weeks[]` | array |

#### `weeks[]`

| Field | Purpose |
|---|---|
| `week`, `label`, `date_range`, `is_current` | week selector/context |
| `kpis[]` | page KPI cards |
| `summary` | final/upcoming/live/conference/team counts |
| `games[]` | game rows for that week |

#### `weeks[].games[]`

| Field | Purpose |
|---|---|
| `game_id`, `route` | identity/link |
| `status`, `date`, `kickoff` | schedule state |
| `conference_game`, `bowl_game` | tags/filtering |
| `home_team_id`, `away_team_id` | currently can be team objects or null |
| `home_score`, `away_score`, `winner_team_id`, `display_score` | score display |
| `quarter_scores` | line-score support |
| `venue`, `tv` | context |
| `excitement_index`, `wpa_swing` | future ranking/KPI |
| `why_tags`, `story_label` | story context |

---

### Current Weekly Brief Data Inventory

Weekly Brief currently consumes selected schedule row data plus parsed game data.

#### Schedule-Level Fields Needed

| Field | Purpose |
|---|---|
| `season` | parsed game path |
| `parsed_game_stem` / `game_path_id` | parsed game lookup and `/game/:id` route |
| `has_parsed_game` | enables parsed fetch |
| `team_id`, `opponent_id`, `opponent_name`, `home_away` | fallback side derivation |
| `home_team_id`, `away_team_id` | preferred normalized sides |
| `score_team`, `score_opp`, `home_score`, `away_score` | total score fallback |
| `result`, `status` | final/preview behavior |
| `conf_game` / `conference_game`, `bowl_game`, `game_name` | pill/tag label |
| `date`, `kickoff`, `site`, `stadium`, `venue` | context |

#### Parsed Game Fields Consumed

| Parsed Path | Purpose |
|---|---|
| `metadata.away_team`, `metadata.home_team` | side identity and final score |
| `advanced_team.{teamId}` | EPA, success, explosive, red zone, stuff, havoc |
| `team_box.{teamId}` | yards/play, third down, team totals |
| `individual_stats.{teamId}` | passing/rushing/receiving/defense leaders |
| `production_scores.{teamId}` | MVP / Glory selection |

---

### Stale Or Incomplete Data

All rows below are **backend/pipeline gaps** — nothing here is fixed by frontend work. Full requirement detail and root-cause tracing live in `BACKEND_PIPELINE_TODO.md` (P0 - Week Central); this table is a short index into that file, not a duplicate spec.

| Gap | Impact |
|---|---|
| `home_team_id`/`away_team_id` null for non-current opponents, and the resolved opponent name isn't passed through | row helpers render literal "Home"/"Away" placeholders |
| neutral-site games (`home_away: "neutral"`) drop the *known* HBCU side's ID too, not just the opponent's | known team also renders as "Home"/"Away" |
| no per-game team record field | schedule rows show "Record TBD" |
| compact `brief` object not present on week rows | selected-game brief needs a full parsed-file fetch |
| MVP/metrics/leaders have no `brief.source` flag when parsed stats are unavailable | mock/fallback data renders with no visual distinction from real data |

A local-only patch was applied directly to the `public/data` export files on 2026-08-13 so the current demo renders correctly, and the same fixes were mirrored into this repo's copy of `build_week_central.py`. **Neither of those touches the actual production pipeline** — see `BACKEND_PIPELINE_TODO.md` for what the backend still needs to do.

---

### Preferred Production Payload Additions

Add `brief` to each week game:

```json
{
  "game_id": "AAMUGRAM01112025",
  "game_path_id": "W10aamugsu",
  "home_team_id": "swacgsu",
  "away_team_id": "swacaamu",
  "home_score": 7,
  "away_score": 10,
  "brief": {
    "quarter_scores": { "home": [0, 0, 0, 7], "away": [0, 3, 7, 0] },
    "mvp": {},
    "metrics": {},
    "leaders": {}
  }
}
```

---

### Pipeline Requirements

1. Support a committed season/week query for Week Central.
2. Return only the selected week's visible HBCU/HBCU-relevant games.
3. Embed `brief` data for every returned game.
4. Normalize side IDs, side names, score fields, winner fields, and route fields.
5. Keep full parsed game file fetch available for deep `/game/:gameId` routes.
6. Include per-game warnings for fallback/mock/repair state.
