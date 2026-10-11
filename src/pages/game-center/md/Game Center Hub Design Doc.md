# Game Center Hub — Design Document

**Route:** `/game-center`
**Page file:** `src/pages/game-center/GameCenterPage.js`
**Data hook:** `src/hooks/useGameCenterHubData.js`
**Last updated:** 2026-08-25
**Status:** Layout complete on desktop and mobile. Blocked on backend for the context engine — both the top-row featured games and the bottom context cards need ranked `why_score` output; see section 4.

---

## 1. Objective

Game Center Hub is the league command surface — the page a fan lands on to answer *"what is happening in HBCU football right now?"* in one screen, without scrolling and without clicking.

It answers four questions in priority order:

1. **What are the games that matter?** — four featured matchups across the top, ranked by the context engine from both upcoming and already-played games
2. **What just happened?** — a vertical rail of recent finals with quarter lines
3. **Who is winning?** — top three in each conference/division
4. **What should I know?** — ranked context cards chosen by the backend Why Engine

The page never asks the user to pick a week. It opens on the current week and shows what is most relevant *today*. Season switching exists in the banner for browsing history, not for normal use.

---

## 2. Data Ownership Rule

**The backend ranks. The frontend displays.**

The hub does not decide which games are featured, which results are recent, or which context cards are interesting. It receives an ordered payload and renders it. The only thing joined locally is visual identity — logos and team colors from `src/data/teams.json`, keyed on `team_id`.

Any label a user reads is a string the backend sent. The frontend does not format dates, shorten venue names, compute stage labels, or derive win/loss state.

---

## 3. Request Contract

### Endpoint

```
/data/1-game center/current_exports/hub/game_center_hub_{season}.json
```

One request. Season is resolved from `useFootballCurrentContext()` before the fetch fires; the user never sees a stale default year.

### Payload

```text
{
  season: integer
  current_week: integer
  week_label: string
  snapshot_date: string (ISO 8601)

  featured_games: [4]{                        // exactly 4, pre-ranked, slot order
    game_id: string
    game_path_id: string
    route: string
    slot: integer                             // 1-4, display order
    status: "preview" | "final"
    status_label: string
    date_label: string
    kickoff_label: string
    stage_label: string
    conference_game: boolean
    away_team: {
      team_id: string (v5 id)
      short_name: string
      name: string
      score: integer | null
      record: string                          // point-in-time, not season total
    }
    home_team: { same shape as away_team }
    winner_team_id: string | null             // null on previews
    supporting_line: string | null

    why_score: number                         // context engine's ranking score for this pick
    why_reasons: string[]                     // record, expected competitiveness, result quality, stakes
  }

  results_season: integer                     // season the rail actually reflects
  results_source: "current_season" | "prior_season_fallback"

  recent_results_rail: [5-6]{                  // finals, newest first
    game_id: string
    game_path_id: string
    route: string
    date_label: string
    stage_label: string
    away_team: {
      team_id: string (v5 id)
      short_name: string
      score: integer
      record: string
      by_quarter: integer[4+]                 // OT appends entries; never null on a final
    }
    home_team: { same shape as away_team }
    winner_team_id: string
    summary: string
  }

  standings: {
    swac_west: { title: string, metric: "conference" | "overall", rows: [3]{
      team_id: string (v5 id)
      rank: integer
      record: string
      conference_record: string
      is_leader: boolean
    }}
    swac_east: { same shape as swac_west }
    meac: { same shape as swac_west }
  }

  context_cards: [5]{                          // same why_score/why_reasons pattern - see section 4
    card_id: string
    card_type: string
    title: string
    why_score: number
    why_reasons: string[]
    payload: {}
  }
}
```

### Field notes

| Field | Rule |
|---|---|
| `featured_games` | Exactly 4, pre-ranked, `slot` 1-4 in display order. Mixed status — some entries may be upcoming, some completed; see section 4 |
| `featured_games[].why_score` / `.why_reasons` | Why the engine picked this game over other candidates. Same mechanism as `context_cards` — see section 4 |
| `recent_results_rail` | 5-6 finals, newest first |
| `results_season` | The season the rail's games actually come from. Equals `season` in-season; falls back to the prior season during week 0 / preseason, when the current season has no finals yet |
| `results_source` | `"current_season"` \| `"prior_season_fallback"`. Tells the frontend to relabel the rail (e.g. "2025 Results") rather than imply these are current-season games |
| `by_quarter` | Always 4+ entries; OT appends. Never null on a final |
| `record` | Point-in-time — the team's record as of that game, not the season total |
| `standings.*.metric` | `"conference"` or `"overall"` — tells the card which record to show |
| `standings.*.rows` | Exactly 3, pre-sorted, `rank` assigned |
| `winner_team_id` | `null` on previews; set on every final |
| Team identity | Only `team_id` is required — logo and colors join locally |

---

## 4. The Context Engine

**One engine, two candidate pools, five total picks.** The hub is not five independent widgets — every zone below the standings row, and the top row itself, is populated by the same ranking mechanism. The difference between the top 4 and the bottom 5 is only what they rank *over*:

| Zone | Candidate pool | Count | Can include past games? |
|---|---|---|---|
| Featured games (top row) | Real games — upcoming or already played | 4 | Yes — a great game already played is as valid a pick as a great matchup coming up |
| Context cards (bottom two rows) | The narrative card catalog below | 5 | N/A — these are card types, not games |

The backend runs whatever scoring it already has internally — we do not need the individual signal weights broken out as response fields. What the frontend needs from every ranked entry, on **both** zones, is the same two-field output:

```text
why_score: number            // the engine's ranking score for this pick
why_reasons: string[]        // 1-3 short human-readable reasons, rendered as supporting copy
```

### Featured games — ranking signals

For the top 4, `why_score` should weigh (at minimum):

- **Record** — both teams' records entering the game (or at the time it was played)
- **Expected competitiveness** — for upcoming games, how close the projected outcome is
- **Result quality** — for completed games, how good/exciting that specific game actually was (margin, lead changes, a signature performance — whatever the engine already tracks)
- **Stakes** — divisional or championship implications, rivalry status

This list is not exhaustive — `why_reasons[]` is free text specifically so a criterion we have not enumerated here can still surface. The frontend never recomputes or second-guesses `why_score`; it only displays `supporting_line` (or falls back to the first `why_reasons` entry if `supporting_line` is absent).

### Context cards — the candidate catalog

For the bottom 5, the pool is the fixed set of **15 card types** below (from [GameCenterHubCardsPlan.md](../mds/GameCenterHubCardsPlan.md) §6, settled 2026-10-04). The backend scores every candidate across every type it has data for and returns only the top 5, **in display order**:

```text
context_cards: [5]{
  card_id: string
  card_type: string          // one of the 15 keys below
  title: string              // the eyebrow, as printed
  why_score: number
  why_reasons: string[]      // 1–3; the first is the card's supporting line
  payload: {}                // shape depends on card_type — see below
}
```

The frontend switches on `card_type` and renders. It does not rank, filter, or select which 5 — it renders exactly what arrives, in order. Any card fits either the 1x1 or the 2-col slot. Lab: `/lab/components` #1711 ([GameCenterContextCardsA.js](../../../components/organisms/test/GameCenterContextCardsA.js)).

### Card types and payload shapes

Team ids are v5 ids. Records are display strings (`"4-1"`). Rates are 0–100.

| # | `card_type` | The card | `payload` |
|---|---|---|---|
| 1 | `look_ahead` | Two schools face to face, the date and kickoff between them | `{ away: { team_id, record }, home: { team_id, record }, date_label, kickoff: string \| null, stage_label, venue: string \| null, route: string \| null }` |
| 2 | `upcoming_stretch` | A team's next three, opponent by opponent | `{ team_id, record, games: [3]{ date_label, home_away: "home" \| "away" \| "neutral", opponent: { team_id: string \| null, short: string, record: string \| null } }, summary: string \| null }` |
| 3 | `team_form` | Last five results, wins up / losses down off a midline, sized by margin | `{ team_id, results: [5]{ result: "W" \| "L", margin: integer }, summary: string }` (oldest first) |
| 4 | `home_town_heroes` | The homegrown share, and the top hometowns | `{ team_id, state: string, in_state_pct: number, in_state_count: integer, total: integer, hotspots: [≤3]{ city: string, count: integer } }` |
| 5 | `us_vs_world` | Record against teams outside the SWAC/MEAC, game by game | `{ team_id, wins: integer, losses: integer, games: [{ opponent_name, result: "W" \| "L", score: string }] }` |
| 6 | `biggest_mover` | The week's biggest jump, rank to rank | `{ team_id, from_rank: integer, to_rank: integer, metric_label: string }` (`"Glory Rankings"`, `"SWAC West"`) |
| 7 | `streak_watch` | The longest active streak, one link per game | `{ team_id, result: "W" \| "L", length: integer, record, recent: ("W" \| "L")[] }` (≤5, oldest first) |
| 8 | `title_race` | A division's top three, how far back each is | `{ group_label, rows: [3]{ team_id, record, conference_record, games_back: number } }` |
| 9 | `bowl_path` | The SWAC and MEAC leaders meeting at the Celebration Bowl | `{ bowl_name, date_label, venue, swac: { team_id, record, conference_record, path: string }, meac: { … same } }` |
| 10 | `red_zone_edge` | TD rate inside the 20, ring vs league ring | `{ team_id, td_rate: number, tds: integer, trips: integer, league_rate: number }` |
| 11 | `turnover_swing` | Turnover margins, best and worst, off a zero line | `{ rows: [3]{ team_id, margin: integer } }` (best first; may include a negative) |
| 12 | `defending_champs` | The banner from the rafters | `{ team_id, conference: "SWAC" \| "MEAC", season: integer, conference_record, record }` (`record` = this season) |
| 13 | `record_split` | Home vs road, split down the middle | `{ team_id, home: string, road: string }` |
| 14 | `schedule_headline` | The matchup and its hook (upcoming or final) | `{ away: { team_id, record, score: integer \| null }, home: { … same }, stage_label, date_label, event_name: string \| null, footer: string, route: string \| null }` |
| 15 | `upset_watch` | The winner big, the favorite it took down | `{ winner: { team_id, record, score: integer }, loser: { … same }, line: string, route: string \| null }` |

**Retired names.** The four earlier types map onto this list: `ScheduleHeadlineCard` → `schedule_headline`, `UpcomingStretchCard` → `upcoming_stretch`, `TeamFormCard` → `team_form`, `RecordSplitCard` → `record_split` (the `"Defending champions"` and `"Us vs the world"` titles that ship as `RecordSplitCard` today become `defending_champs` and `us_vs_world`).

**Hub intent** (§6.1 of the plan): results, schedules, standings — keep each card to one visual and one number; no stat tables.

### Slot budget

Desktop has **5 context slots** across two rows: one double-wide (2 cols) and four single. Mobile currently renders none — the section is desktop-only until the mobile pass. Backend should return 5 cards; if it returns fewer, the trailing slots collapse.

---

## 5. Desktop Layout

`PageShell`, 4-column grid.

```
+-------------------------------------------------------------+
| Row 1  BannerGameCenter                            cols 4   |
+------------+------------+------------+----------------------+
| Row 2  Featured 1 | Featured 2 | Featured 3 | Featured 4     |
|        cols 1     | cols 1     | cols 1     | cols 1         |
+------------+------------+------------+----------------------+
| Row 3  | SWAC West   | SWAC East   | MEAC                    |
| Results| cols 1      | cols 1      | cols 1                  |
| Rail   +-------------+-------------+-------------------------+
|        | Context card A (cols 2)   | Context card B (cols 1) |
| cols 1 +-------------+-------------+-------------------------+
| rows 3 | Context C   | Context D   | Context E               |
+--------+-------------+-------------+-------------------------+
```

| Slot | Component | Source |
|---|---|---|
| Banner | `BannerGameCenter` | `organisms/test/BannerGameCenter` |
| Featured x4 | `GameCenterFeaturedGameCard` | `molecules/game/` |
| Results rail | `GameCenterResultsRail` | `molecules/game/` |
| Standings x3 | `TopThreeStandingsCard` | `molecules/game/GameCenterLabCards` |
| Context x5 | the 15 `card_type`s in §4 (lab #1711 until graduated) | `organisms/test/GameCenterContextCardsA` |

---

## 6. Mobile Layout

No `PageShell` — its fixed row units and page padding are a desktop concern. Mobile builds its own tree with `gap={0}` so panels touch edge to edge, and cards drop their border radius.

```
+---------------------------+
| BannerGameCenter          |  edge-to-edge, no radius
+-------------+-------------+
| Featured 1  | Featured 2  |  2x2 grid, gap 0
+-------------+-------------+
| Featured 3  | Featured 4  |
+-------------+-------------+
|             | SWAC West   |
| Results     +-------------+
| Rail        | SWAC East   |
|             +-------------+
|             | MEAC        |
+-------------+-------------+
```

| Slot | Component |
|---|---|
| Banner | `BannerGameCenter` (responsive internally) |
| Featured x4 | `GameCenterFeaturedGameCardMobile` |
| Results rail | `GameCenterResultsRail` (same component, narrow) |
| Standings x3 | `TopThreeStandingsCardMobile`, stacked |

**Not yet on mobile:** context cards. Deferred to the mobile pass.

---

## 7. Empty and Loading States

| Condition | Behavior |
|---|---|
| Fetch in flight | Full-page spinner, banner suppressed |
| Season resolved but no games | Banner renders, `OffSeasonMessage` below it — season switching stays available |
| `context_cards` empty | Slots collapse; the rest of the page renders normally |
| A featured slot missing | Card renders its own empty frame rather than shifting the grid |
| `results_source` is `"prior_season_fallback"` | Results rail header relabels to show the season it's actually displaying |

The banner always renders when data has loaded, even on an empty season, so the user can switch away from a dead year.

---

## 8. Open Items

| Item | Owner | Blocking |
|---|---|---|
| `context_cards` returned empty | Backend / Why Engine | Bottom two rows fall back to client-derived filler |
| `featured_games[].why_score` / `.why_reasons` not yet in the export | Backend / Why Engine | Top row falls back to client-derived selection instead of engine ranking |
| `results_season` / `results_source` not yet in the export | Backend | Frontend cannot detect or label a prior-season fallback during week 0 |
| Point-in-time `record` on featured + rail | Backend | Cards show season totals or `--` |
| `supporting_line` / MVP on featured games | Backend | Cards lose their editorial line |
| Mobile context card treatment | Design | Section is desktop-only |

---
---

# Legacy Reference

*Content below predates the 2026-08-25 rewrite. Kept for pipeline history — the sections above are authoritative.*

## Game Center Hub - Design Document

**Route:** `/game-center`  
**File:** `src/pages/game-center/GameCenterPage.js`  
**Last updated:** 2026-05-03  
**Data status:** Current export wired; dynamic Why candidates incomplete.
**Fetch contract:** tracked in [Game Center Fetch Contract.md](./Game%20Center%20Fetch%20Contract.md) — keep both in sync when the request shape or response fields change.

---

### Purpose

Game Center Hub is the league command surface. It gives a fast weekly snapshot of featured games, recent results, standings leaders, and quick context cards.

---

### Current Frontend Fetch Contract

Production fetches one current-export payload through `gameCenterPaths.hub(season)`.

```text
/data/1-game center/current_exports/hub/game_center_hub_{season}.json
```

#### Required Hooks & Secondary Fetches

1. **`useFootballCurrentContext()`**: **CRITICAL.** Must be checked first to set the `season` and `week` defaults. If the app is in "Offseason" mode (Week 0), the hub should prioritize upcoming season openers or previous season final standings.
2. **`useTeams()`**: For authoritative logos, colors, and mascot names.
3. **`useTeamAnalytics(exportId)`**: Used for the "Quick Context" cards (Record Split, Team Form) when not provided by the Hub JSON.

Current page default:

```js
const DEFAULT_SEASON = 2026;
fetchJson(gameCenterPaths.hub(season))
```

---

### Current Payload Inventory

The 2025 payload currently contains:

| Field | Shape | Current Use |
|---|---|---|
| `year` | number | season context |
| `snapshot_date` | ISO string | data freshness |
| `banner` | object | available; page banner remains component/static-led |
| `featured_games[]` | 4 objects | mapped through `toFeaturedGameCard()` |
| `recent_results_rail[]` | 6 objects | mapped through `toRailGameCard()` |
| `standings.swac_west_top3[]` | array | top-three standings card |
| `standings.swac_east_top3[]` | array | top-three standings card |
| `standings.meac_top3[]` | array | top-three standings card |
| `dynamic_candidates[]` | array | currently empty |
| `selected_dynamic_cards[]` | array | currently empty |

#### `featured_games[]`

Required by current frontend:

| Field | Notes |
|---|---|
| `slot` | card ordering |
| `game_id`, `game_path_id` | identity and route link |
| `date`, `week`, `stage_label`, `status` | game context |
| `home_team_id`, `away_team_id` | currently objects with `id`, `name`, `abbreviation`, `score` |
| `home_score`, `away_score` | may be null; helper falls back to score on team objects |
| `mvp` | optional supporting line |

#### `recent_results_rail[]`

Required by current frontend:

| Field | Notes |
|---|---|
| `id`, `game_id`, `game_path_id` | identity and route link |
| `date`, `week`, `stage_label` | row context |
| `home_team_id`, `away_team_id` | team objects or ids |
| `home_score`, `away_score` | score display |
| `home_by_q`, `away_by_q` | quarter line; fallback is dashes |
| `home_record`, `away_record` | optional row context |

#### `standings.*_top3[]`

Required by current frontend:

| Field | Notes |
|---|---|
| `team_id` | v5 team id |
| `wins`, `losses`, `record` | display record |
| `conference_record` | preferred metric |
| `win_pct`, `conf_win_pct`, `rank` | ordering/support |

---

### Current Client-Side Derivations

The page still derives or falls back for:

- visual team identity from `src/data/teams.json`
- feature cards if `featured_games` / `recent_results_rail` are absent
- quick cards such as Game of Week, stretch, form, and record split when dynamic cards are not supplied
- rail/card route links from `game_path_id`

---

### Stale Or Incomplete Data

| Gap | Impact | Needed Fix |
|---|---|---|
| `dynamic_candidates[]` is empty | Why Engine cards fall back to static/client-derived content | export ranked candidate objects |
| `selected_dynamic_cards[]` is empty | dynamic slot selection not pipeline-controlled | export selected card IDs in layout order |
| some `featured_games` use team objects in `home_team_id` / `away_team_id` | helper supports this, but naming is confusing | prefer `home_team` / `away_team` objects or scalar IDs plus scores |
| `home_score` / `away_score` can be null | helpers fall back, but contract is weaker | populate direct score fields |
| MVP is often null | featured cards lose player-led support | add normalized MVP object |

---

### Preferred Production Payload Shape

```json
{
  "year": 2025,
  "snapshot_date": "2026-05-03T00:00:00Z",
  "banner": {},
  "featured_games": [],
  "recent_results_rail": [],
  "standings": {
    "swac_west_top3": [],
    "swac_east_top3": [],
    "meac_top3": []
  },
  "dynamic_candidates": [
    {
      "card_id": "game-of-week",
      "card_type": "ScheduleHeadlineCard",
      "why_score": 88.2,
      "why_reasons": ["Top matchup", "Division pressure"],
      "payload": {}
    }
  ],
  "selected_dynamic_cards": ["game-of-week", "look-ahead", "upcoming-stretch", "team-form", "road-world"]
}
```

---

### Pipeline Requirements

1. Keep exporting `current_exports/hub/game_center_hub_{season}.json`.
2. Populate direct score fields on featured and rail games.
3. Normalize team IDs to v5 ids while allowing optional embedded team objects.
4. Populate quarter arrays for rail cards.
5. Add MVP/player identity for featured games.
6. Export non-empty `dynamic_candidates[]` and `selected_dynamic_cards[]`.
7. Keep `teams.json` as the frontend visual identity join.
