# Games Hub — Design Document

**Last updated:** 2026-10-04
**Route:** `/game-center/games` · **Page:** [GamesHubPage.js](../GamesHubPage.js) · **Banner:** [GamesHubBanner.js](../../../components/molecules/game/GamesHubBanner.js) · **Model:** `src/utils/gamesHubModel.js` · **Hook:** `src/hooks/useGamesHubData.js`
**Request:** [Games Hub Fetch Contract.md](Games%20Hub%20Fetch%20Contract.md)

---

## 1. Objective

**The season as one grid, not a feed.** Every game the season contains, played or not, in the order it is played. No narrative layer, no featured cards, no ranking: the page's only job is to show the shape and the count of a season at once, and get you to any game in one tap.

The story-card design this page started as (ranked `story_cards`, a stat carousel, a Why Engine) is retired — the hub (`/game-center`) carries the narrative cards now. See *Legacy Reference* below for what it was.

---

## 2. Data Ownership Rule

The backend decides which games are in the season and every fact about them: status, score, winner, week, event name, venue and the link. The frontend joins only school identity from `src/data/teams.json` (logo, colors, conference) and renders the rows in the order they arrive. It does not dedupe, reorder, classify or derive links — the contract's `route` is the only link a tile follows.

---

## 3. Request

One file per season, rebuilt weekly: `games_hub_{season}.json` → `games[]`, one row per game. Full shape in [Games Hub Fetch Contract.md](Games%20Hub%20Fetch%20Contract.md).

---

## 4. Filters

Five, all client-side over the season's `games[]`, all combined with AND:

| Filter | Options | Reads |
|---|---|---|
| Season | the Game Center seasons (`GAME_CENTER_SEASONS`), current first | which file is fetched |
| Week | All Weeks, then `weeks[]` | `games[].week` |
| Conference | All 18 · SWAC · MEAC | either side's conference (joined from `teams.json`) |
| Team | All Teams, then the 18 | either side's `team_id` |
| Status | All Games · Played · Upcoming | `status === "final"` vs not |

Defaults: current season, all weeks, all 18, all teams, all games.

---

## 5. The tile

Every game is the same five-row card, so the grid stays regular whatever a game carries:

```
+---------------------------+
| OCT 3            6:00 PM  |  1 date (+ kickoff while unplayed)
| [logo] PVAMU          27  |  2 away  (score when final; winner bold/white)
| [logo] MVSU           28  |  3 home
| HOMECOMING                |  4 event name — empty but kept when none
| ------------------------- |
| ITTA BENA, MS             |  5 venue_label, up to two lines
+---------------------------+
```

- **Played** (`status: "final"`): scores on the team rows, winner in white/bold, solid edge.
- **Upcoming:** no scores, kickoff on the date row, dashed edge.
- **Outside opponents** have no logo; a neutral dot holds the column.
- **Link:** the whole cell is the tap target when `route` is set — the game page for a played game, the preview page for an unplayed game between two of the 18. `route: null` is not a link.

### Week grounds

The cell behind each card carries its week: weeks alternate two grounds (dark grey, black), the card is always a step lighter than its ground, and the week label prints only on the first game of each week (the row keeps its height everywhere else). A week can start mid-row; games run continuously.

---

## 6. Desktop Layout

`PageShell`: the banner in a 4-col slot, the grid in the list region below it (the grid is as tall as the season, so it scrolls with the page rather than sitting in a fixed-height slot).

```
+---------------------------------------------------------------+
| GamesHubBanner — title + control strip (5 dropdowns)   cols 4 |
+---------------------------------------------------------------+
| tile | tile | tile | tile | tile | tile | tile | tile          |  6 / 7 / 8 across
| tile | tile | ...                                             |  by breakpoint
+---------------------------------------------------------------+
```

Columns: 2 (base) · 3 (sm) · 6 (md) · 7 (lg) · 8 (xl), every track `minmax(0, 1fr)`.

---

## 7. Mobile Layout

Own tree, not `PageShell` — edge to edge, no outer padding, border or radius.

```
+-------------------------------------+
| GAMES          (title strip, 64px)  |
| [GAMES ∨]          2026 · All Weeks [≡]
+--------+--------+--------+----------+
| tile   | tile   | tile   | tile     |  4 across, ~2px gutters
| tile   | tile   | tile   | tile     |
+--------+--------+--------+----------+
```

- **Banner** follows the mobile banner standard (Week Central's): a title strip the height of the app header, the section switcher on the left, and on the right a one-line summary of the active filters plus a filter icon. Either opens the shared `BottomSheet` with all five filters as chip groups; it stays open so several can be set at once. No control strip on a phone.
- **Grid:** four across, flush. Tiles tighten (smaller padding, 10px team names, 0.8rem logos); long names end in an ellipsis.

---

## 8. Empty and Loading States

| Condition | Behavior |
|---|---|
| Fetch in flight | Spinner where the grid goes; banner renders |
| No games match the filters | "No games match the current filters." in place of the grid |
| Season file missing | Same empty message; the season filter stays usable so the user can switch away |

---

## 9. Open Items

| Item | Owner |
|---|---|
| Ship `games[]` per the contract (today the rows still arrive as `story_cards`) | Backend |
| `event.name` on classics / homecomings — row 4 of the tile stays empty until it ships | Backend |
| Switch the model to read `games[]` and `route` directly; drop the client-side link building and dedupe | Frontend, when the file ships |

---
---

# Legacy Reference

*Content below predates the 2026-08-25 rewrite. Kept for pipeline history — the sections above are authoritative.*

## Games Hub - Design Document

**Route:** `/game-center/games`  
**File:** `src/pages/game-center/GamesHubPage.js`  
**Last updated:** 2026-05-03  
**Data status:** Current export wired; story selection is still partly frontend-derived.
**Fetch contract:** tracked in [Game Center Fetch Contract.md](./Game%20Center%20Fetch%20Contract.md) — this page's fetch contract is marked **pending** there; don't build against a scoped request until the page design is finalized.

---

### Purpose

Games Hub is the season story browser. It surfaces notable games, result cards, stat highlights, and narrative-ready recap modules.

---

### Current Frontend Fetch Contract

Production fetches one current-export payload through `gameCenterPaths.gamesHub(season)`.

```text
/data/1-game center/current_exports/games_hub/games_hub_{season}.json
```

#### Required Hooks & Secondary Fetches

1. **`useFootballCurrentContext()`**: Used to default the week filter.
2. **`useTeams()`**: Provides the visual identity for all team references in the card list.
3. **`useAllPlayers()`**: (Optional) For high-lighting individual performers in the story cards when `player_id` is present in the payload.

Current page default:

```js
fetchJson(gameCenterPaths.gamesHub(season))
```

---

### Current Payload Inventory

The 2025 payload currently contains:

| Field | Shape | Current Use |
|---|---|---|
| `season` | number | selected season |
| `generated_at` | ISO string | data freshness |
| `summary` | object | available for counts/context |
| `story_cards[]` | array | primary game/story source |
| `stat_carousel[]` | array | stat card source |

#### `summary`

Current keys:

| Field | Purpose |
|---|---|
| `games` | total rows/games in export |
| `final_games` | completed count |
| `scheduled_games` | scheduled/upcoming count |
| `parsed_games` | rows with parsed game files |
| `score_mismatches` | data quality count |

#### `story_cards[]`

Required by current frontend:

| Field | Purpose |
|---|---|
| `game_id`, `game_path_id`, `route` | identity/linking |
| `date`, `week`, `week_label`, `status` | filtering and context |
| `game_type`, `division_scope` | tags/filter context |
| `home_team`, `away_team`, `team`, `opponent` | team/opponent identity |
| `home_score`, `away_score`, `team_score`, `opponent_score` | scoring |
| `winner_team_id` | winner styling |
| `venue`, `home_away` | location context |
| `score_authority`, `score_mismatch` | quality indicators |
| `has_parsed_game` | link/recap readiness |
| `story_label` | narrative label |
| `attendance`, `kickoff_time` | optional context |

#### `stat_carousel[]`

Required by current frontend:

| Field | Purpose |
|---|---|
| `game_id`, `game_path_id`, `date` | identity/context |
| `items[]` | stat rows by team |
| `items[].team_id` | team identity |
| `items[].label`, `value`, `unit` | stat display |

---

### Current Client-Side Derivations

The page currently derives:

- available week options from `story_cards[].week`
- team filtering by checking team/opponent/home/away ids
- selected story cards from the payload rather than a fully ranked candidate manifest
- visual identity from `teams.json`
- some card summaries and display labels

---

### Stale Or Incomplete Data

| Gap | Impact | Needed Fix |
|---|---|---|
| no explicit `selected_story_cards[]` | frontend still chooses how to fill slots | export selected card list in render order |
| no `dynamic_candidates[]` / Why scores | no transparent story ranking | export ranked candidates with reasons |
| some `story_cards` are schedule-level only | cards lack stats/players | join parsed game summary fields when available |
| no normalized card type per story | frontend has to infer treatment | add `card_type` / `story_type` |
| stat carousel lacks precomputed display title | frontend must format generic stat rows | add card-ready labels and summary |

---

### Preferred Production Payload Shape

```json
{
  "season": 2025,
  "generated_at": "2026-05-03T00:00:00Z",
  "summary": {},
  "selected_story_cards": [
    {
      "slot": "spotlight",
      "card_type": "GameOfWeekSpotlight",
      "game_path_id": "W10aamugsu",
      "story_type": "game-of-year",
      "why_score": 91.4,
      "why_reasons": ["High leverage", "Close final"],
      "payload": {}
    }
  ],
  "dynamic_candidates": [],
  "story_cards": [],
  "stat_carousel": []
}
```

---

### Pipeline Requirements

1. Keep exporting `current_exports/games_hub/games_hub_{season}.json`.
2. Add card-ready `selected_story_cards[]` for the page layout.
3. Add `dynamic_candidates[]` with `story_type`, `why_score`, and `why_reasons`.
4. Join parsed game signals into story candidates where `has_parsed_game` is true.
5. Preserve `story_cards[]` as the broader searchable source list.
6. Keep `stat_carousel[]`, but add display-ready title/summary fields.

