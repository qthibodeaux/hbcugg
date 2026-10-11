# Home Teams Tile Fetch Contract

**Last updated:** 2026-10-03
**Scope:** the **Teams** quadrant of the home page hero (`/`). A live tile that rotates through five faces.
**Companions:** [Home Stats Tile Fetch Contract.md](../../stats/md/Home%20Stats%20Tile%20Fetch%20Contract.md) (same conventions)

**These are type contracts, not example payloads.** Field names and types only.

**Notation:** `string` `integer` `number` `boolean` — plain types. `T | null` — nullable. `T[]` — array of `T`. Team ids are v5 ids (`swacjsu`). Rates are 0–1.

**Data ownership rule:** the backend decides everything: which items run, in what order, and which team each one is about. The frontend joins only identity from `src/data/teams.json` by `team_id` (logo, colors, name, stadium name, band).

---

## Request

One file. Each week the backend overwrites it; no per-week files, no archive.

```text
GET /data/0-data/home-teams-tile/current.json
```

---

## Response

```text
season: integer
week: integer
week_label: string
generated_at: string                    // ISO 8601 with offset
source: "current_season" | "prior_season_fallback"

rotation: string[]                      // the 5 item keys, each once, in display order
items: Item[]
```

### Item

```text
key: string                             // one of the 5 keys below
title: string                           // the face's name as it prints
headline: string                        // one sentence, backend-written ("" allowed for band)
teams: string[]                         // team ids the item is about
why: string                             // 1 short reason this item made the rotation
data: object                            // per key, below
```

---

## `data` per key

| key | title | `data` |
|---|---|---|
| `division_race` | Division Race | `{ group_label: "SWAC East" \| "SWAC West" \| "MEAC", games_total: integer, rows: [{ team_id, conf_wins: integer, conf_losses: integer, record: string }] }` rows in standings order |
| `hot_streak` | Hot Streak | `{ team_id, streak: integer, record: string, results: [{ result: "W" \| "L" }] }` most recent last |
| `band` | The Band | `{ team_id }` |
| `home_field` | Home Field | `{ team_id, home_wins: integer, home_losses: integer, image_url: string \| null }` |
| `rivalry` | Rivalry | `{ event_name: string, team_a: string, team_b: string, wins_a: integer, wins_b: integer, ties: integer, series_from: integer, last_meeting: { date: string, a_score: integer, b_score: integer } \| null, next_meeting: { date: string, venue: string \| null } \| null }` |

---

## Freshness

Rebuild after each week's games are parsed. `current.json` always holds the latest week.
