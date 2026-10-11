# Home Players Tile Fetch Contract

**Last updated:** 2026-10-03
**Scope:** the **Players** quadrant of the home page hero (`/`). A live tile that rotates through five faces.
**Companions:** [Home Stats Tile Fetch Contract.md](../../stats/md/Home%20Stats%20Tile%20Fetch%20Contract.md) · [Home Teams Tile Fetch Contract.md](../../teams/md/Home%20Teams%20Tile%20Fetch%20Contract.md) (same conventions)

**These are type contracts, not example payloads.** Field names and types only.

**Notation:** `string` `integer` `number` `boolean` — plain types. `T | null` — nullable. `T[]` — array of `T`. Team ids are v5 ids (`swacjsu`). Rates are 0–1.

**Data ownership rule:** the backend decides everything: which items run, in what order, and which player each one is about. The frontend joins only team identity from `src/data/teams.json` by `team_id`.

---

## Request

One file. Each week the backend overwrites it; no per-week files, no archive.

```text
GET /data/93-FE Docs/home/players-tile/current.json
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
headline: string                        // one sentence, backend-written ("" allowed for collage)
players: string[]                       // player ids the item is about
why: string                             // 1 short reason this item made the rotation
data: object                            // per key, below
```

### Player (used inside `data`)

```text
player_id: string
name: string
team_id: string
position: string
class_year: string | null               // "Fr.", "So.", "Jr.", "Sr.", "Gr."
jersey_number: integer | null
image_url: string | null                // headshot; null falls back to the team mark
hometown: string | null
home_state: string | null               // two-letter code
```

### Line cell (used inside `data`)

```text
label: string                           // "Yds", "TD", "Cmp %"
display: string                         // printed as-is
```

---

## `data` per key

| key | title | `data` |
|---|---|---|
| `collage` | Top Producers | `{ players: [Player & { rank: integer, production: number, production_display: string }] }` exactly 16, rank order |
| `player_of_week` | Player of the Week | `{ player: Player, game: { game_id, date, opponent_id: string \| null, result: "W" \| "L", score: string }, line: LineCell[] }` 3–5 cells |
| `breakout` | Breakout | `{ player: Player, weeks: [{ date: string, production: number }], prior_season: number \| null, this_season: number }` |
| `transfer_impact` | Transfer Impact | `{ player: Player, from_school: { team_id: string \| null, name: string, tier: string \| null }, before: { label, display }, after: { label, display } }` |
| `freshman` | Freshman to Watch | `{ player: Player, production: number, freshman_avg: number, freshman_rank: integer, freshmen: integer }` |

---

## Freshness

Rebuild after each week's games are parsed. `current.json` always holds the latest week.
