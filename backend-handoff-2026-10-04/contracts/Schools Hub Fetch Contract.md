# Schools Hub Fetch Contract

**Last updated:** 2026-10-04
**Scope:** the **Schools** hub (`/teams`, `/schools`), desktop and mobile — the school directory tiles, the three division standings, the Glory rankings, and the coaches view (`?view=coaches`). Updated every week of the season.
**Companions:** [Home Teams Tile Fetch Contract.md](Home%20Teams%20Tile%20Fetch%20Contract.md) (same conventions)

**These are type contracts, not example payloads.** Field names and types only.

**Notation:** `string` `integer` `number` `boolean` — plain types. `T | null` — nullable. `T[]` — array of `T`. Team ids are v5 ids (`swacjsu`). Person ids are `PERS_` ids, the same ones the 2026 roster and game files use.

**Data ownership rule:** the backend decides who is shown: which players feature on each school's tile, who the head coach is this week, the standings order and the rankings. The frontend joins only school identity from `src/data/teams.json` by `team_id` (logo, colors, name, mascot, conference, division) and does not rank, filter or pick people.

---

## Request

One file. Each week the backend overwrites it; no per-week files, no archive.

```text
GET /data/0-data/schools-hub/current.json
```

---

## Response

```text
season: integer
week: integer                           // 0 in the offseason
week_label: string                      // "Week 5", "Offseason"
generated_at: string                    // ISO 8601 with offset
source: "current_season" | "prior_season_fallback"

directory: DirectoryTeam[]              // exactly 18, one per program
standings: {
  swac_west: StandingRow[]              // standings order
  swac_east: StandingRow[]
  meac: StandingRow[]
}
glory_rankings: RankingRow[]            // all 18, rank order
coaches: CoachSummary[]                 // exactly 18, one per program
```

### DirectoryTeam

```text
team_id: string
head_coach: Coach | null                // the head coach as of this week (interim counts; title says so)
featured_players: Player[]              // 3–5, the program's top producers this season, best first
```

### Player

```text
person_id: string
name: string                            // full display name
last_name: string                       // what the tile prints
position: string                        // "QB"
jersey_number: integer | null
class_year: string | null               // "Fr.", "So.", "Jr.", "Sr.", "Gr."
image_url: string | null                // real headshot or null — never a placeholder URL
production: number                      // season production score, used for order only
production_display: string              // "16.9"
```

### Coach

```text
person_id: string
name: string                            // full display name
last_name: string
title: string                           // "Head Coach", "Interim Head Coach"
image_url: string | null                // real headshot or null — never a placeholder URL
```

### StandingRow

```text
rank: integer                           // place in the division
team_id: string
record: string                          // overall, "6-1"
conf_record: string                     // "4-0"
trend: "up" | "down" | "flat"           // place vs. last week
streak: string | null                   // "W3", "L1"
```

### RankingRow

```text
rank: integer
team_id: string
score: number
score_display: string                   // "98"
trend: "up" | "down" | "flat"           // rank vs. last week
previous_rank: integer | null
```

### CoachSummary

```text
team_id: string
head_coach: Coach | null
staff_count: integer                    // on staff this season
```

**Notes**
- **Current people only.** `featured_players` are on this season's roster for that school as of `week`; a player who transferred or left is never featured, and a player who transferred in features for the new school. `head_coach` and `coaches[]` are this season's staff as of `week` — a coaching change lands the week it happens.
- **Headshots.** `image_url` is a working headshot or `null`. The frontend shows the school's mark when it is `null`; a placeholder or dead URL shows a broken image.
- **Offseason.** `week: 0`, `standings` and `glory_rankings` hold the final order of the previous season, and `source: "prior_season_fallback"`; `featured_players` and coaches are the incoming season's people once rosters publish.
- **Empty states.** A school with no player headshots still sends its `featured_players` (with `image_url: null`); the tile skips the photo frames.

---

## Freshness

Rebuild after each week's games are parsed, and again whenever a roster or coaching change publishes. `current.json` always holds the latest week. A stale file is detectable from `week` and `generated_at`.
