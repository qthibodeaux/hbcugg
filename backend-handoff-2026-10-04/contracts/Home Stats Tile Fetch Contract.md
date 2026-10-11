# Home Stats Tile Fetch Contract

**Last updated:** 2026-10-03
**Scope:** the **Stats** quadrant of the home page hero (`/`). It is a live tile that rotates through five faces. Today it borrows `stats_hub_cards_{season}.json`; this contract replaces that with a file built for the tile.
**Companions:** [Glory Team of the Week Fetch Contract.md](../../game-center/md/Glory%20Team%20of%20the%20Week%20Fetch%20Contract.md) (same conventions) · `stats_hub_cards_{season}.json` (several items reuse its logic)

**These are type contracts, not example payloads.** Field names and types only.

**Notation:** `string` `integer` `number` `boolean` — plain types. `T | null` — nullable. `T[]` — array of `T`. Team ids are v5 ids (`swacjsu`). Rates are 0–1.

**Data ownership rule:** the backend decides. It computes the five items, orders them, and writes every word. The frontend joins only logos and colors from `src/data/teams.json`, and does not rank, choose, reword or format numbers.

---

## Request

One file. Each week the backend overwrites it; no per-week files, no archive.

```text
GET /data/0-data/home-stats-tile/current.json
```

---

## Response

```text
season: integer
week: integer
week_label: string                      // "Week 4"
generated_at: string                    // ISO 8601 with offset
source: "current_season" | "prior_season_fallback"

rotation: string[]                      // the 5 item keys, each once, in display order
items: Item[]                           // one per key; an item it cannot compute is left out
```

### Item (shared envelope)

```text
key: string                             // one of the 5 keys below
title: string                           // the face's name as it prints, e.g. "Metric of the Week"
headline: string                        // one sentence, backend-written
value_kind: "number" | "team" | "pair" | "league"
teams: string[]                         // team ids the item is about, 0–2
primary: {
  value: number | string | null
  display: string                       // printed as-is: "62%", "+0.31", "-0.54", "21.4s"
  label: string                         // what the number is: "Success rate"
}
compare: { display: string, label: string } | null   // optional second value, e.g. league average
why: string                             // 1 short reason this item made the rotation this week
data: object                            // per-key, below — the visual is drawn from this
```

**Notes**
- **`display` is final.** The page never formats, rounds or adds signs. Raw `value`s in `data` are only used for positions and lengths.
- **League-only numbers.** Leaders and league averages use League games only (the stat tier rule); records stay all-games.
- **Offense vs defense.** Where a metric is defensive, say so in `title`/`primary.label`; positions follow the raw value, and `*_lower_is_better` flags flip axes.
- **Empty states.** If an item cannot be computed, `rotation` holds what exists.

---

## The 5 items — `data` per key

### League-wide

| key | title | the face | `data` |
|---|---|---|---|
| `metric_of_week` | Metric of the Week | All teams on one number line, leader pulled out large | `{ metric_label: string, leader_id: string, league_avg: number, league_avg_display: string, values: [{ team_id, value: number, display: string }] }` (all ranked teams) |

### One team

| key | title | the face | `data` |
|---|---|---|---|
| `efficiency_king` | Efficiency King | Ten snaps, the successful ones lit | `{ team_id, rate: number, league_rate: number }` |
| `points_per_drive` | Points Per Drive | Every possession as a column of points | `{ team_id, drives: [{ points: integer }] }` season drives in order |
| `explosive_drives` | Explosive Drives | Drive chart, explosive arcs lit | `{ team_id, league_rate: number, drives: [{ yards: integer, plays: integer, explosive: boolean }] }` |
| `havoc_leader` | Havoc Leader | 10×10 grid of snaps, havoc filled | `{ team_id, havoc_plays: integer, snaps: integer, league_rate: number }` |

---

## Freshness

Rebuild after each week's games are parsed. `current.json` always holds the latest week. A stale file is detectable from `week` and `generated_at`.

---

## Not requested yet

- Player items (the Players tile covers those).
- Week-by-week series.
