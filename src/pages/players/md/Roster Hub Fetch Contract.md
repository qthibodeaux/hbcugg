# Roster Hub Fetch Contract

**Last updated:** 2026-10-04
**Scope:** the **Rosters** hub (`/rosters`, `/rosters/full`, `/rosters/breakdown`), desktop and mobile — the league KPI strip, the By Team / Divisions / League modes, and the team analytics panel (composition, experience, physical, geography, transfers, and the position range chart).
**Companions:** [Rosters Hub Design Doc.md](Rosters%20Hub%20Design%20Doc.md) · [Schools Hub Fetch Contract.md](../../teams/md/Schools%20Hub%20Fetch%20Contract.md) (same conventions)

**These are type contracts, not example payloads.** Field names and types only.

**Notation:** `string` `integer` `number` `boolean` — plain types. `T | null` — nullable. `T[]` — array of `T`. Team ids are v5 ids (`swacjsu`). Person ids are `PERS_` ids, the same ones the game files use. `pct` and `*_pct` / `*_rate` fields are 0–100.

**Data ownership rule:** the backend computes every aggregate. The frontend reads the numbers as shipped, joins school identity from `src/data/teams.json` by `team_id`, and does not recount rosters.

---

## Request

Two files per season. The page opens on the current season and can switch to any earlier one.

```text
GET /data/93-FE Docs/schools/roster-hub/roster_hub_{season}.json
GET /data/93-FE Docs/players/roster/player_seasons_{season}.json
```

---

## Response — `roster_hub_{season}.json`

```text
season: integer
generated_at: string                    // ISO 8601 with offset
roster_as_of: string                    // ISO date the rosters were pulled
total_players: integer

teams: { [team_id]: RosterModule }      // exactly 18
divisions: { SWAC: RosterModule, MEAC: RosterModule }   // `division` set, no `team_id`
all: RosterModule                       // all 18 programs together
```

### RosterModule

```text
team_id: string                         // teams[] only
division: "SWAC" | "MEAC"

composition: {
  total_players: integer
  position_distribution: [{ group: string, count: integer, pct: number }]
  class_distribution: [{ class: ClassYear, label: string, count: integer, pct: number, vs_conference_avg: number }]
  upperclass_pct: number
  underclass_pct: number
}

experience: {
  upperclass_pct: number                // Jr. + Sr. + Gr.
  veteran_pct: number                   // Sr. + Gr.
  pyramid: [{ class: ClassYear, label: string, count: integer, pct: number }]
  by_position_group: { [group]: { total: integer, breakdown: [{ class: ClassYear, count: integer, pct: number }] } }
}

physical: {
  overall: PhysicalLine
  by_position_group: { [group]: PhysicalLine }
}

geographic: Geography

transfers: {
  transfer_count: integer
  transfer_rate: number
  tier_breakdown: [{ tier: TransferTier, count: integer, pct: number }]
  position_impact: [{ group: string, total_players: integer, transfer_count: integer, transfer_rate: number, tier_breakdown: { [TransferTier]: integer } }]
  transfer_geographic: Geography        // the transfers only
}
```

```text
ClassYear: "Fr." | "So." | "Jr." | "Sr." | "Gr."
TransferTier: "P4" | "G5" | "FCS" | "D2" | "JUCO"
group: "QB" | "RB" | "WR" | "TE" | "OL" | "DL" | "LB" | "DB" | "ST"

PhysicalLine: {
  count: integer
  height_avg: number, height_median: number, height_max: number, height_min: number      // inches
  weight_avg: number, weight_median: number, weight_max: number, weight_min: number      // pounds
  height_coverage: integer, weight_coverage: integer                                      // players with a value
}

Geography: {
  total_with_hometown: integer
  domestic_count: integer
  international_count: integer
  in_state_count: integer
  in_state_pct: number
  avg_recruiting_distance_miles: number
  median_recruiting_distance_miles: number
  distance_tier_breakdown: { local: integer, regional: integer, national: integer }
  state_distribution: [{ state: string, count: integer, pct: number }]     // two-letter codes
  hotspots: [{ city: string, count: integer }]
}
```

---

## Response — `player_seasons_{season}.json`

One row per player on a roster that season (the position range chart and the team roster pages read these).

```text
person_id: string
full_name: string
first_name: string
last_name: string
team_id: string
season: integer
jersey_number: integer | null
position: string
position_group: group
class_year: integer | null              // 1–5
class_label: ClassYear | null
is_redshirt: boolean
is_transfer: boolean
transfer_tier: TransferTier | null
previous_school: string | null
height: number | null                   // inches
weight: number | null                   // pounds
hometown: string | null
home_state: string | null
is_in_state: boolean | null
distance_miles: number | null
image_url: string | null                // real headshot or null — never a placeholder URL
```

**Notes**
- **One roster, two files.** Both files are built from the same roster pull: a player counted in `roster_hub` is a row in `player_seasons`, and `total_players` equals the row count for the season.
- **Current school only.** A player who transferred mid-cycle is counted for the school he is on as of `roster_as_of`, never for both.
- **Headshots.** `image_url` is a working headshot or `null`.
- **Offseason.** The new season's files ship as soon as its rosters publish; until then the page shows the latest season that has them.
- **Class, tier, position.** `class_year` is the 1–5 integer and `class_label` the `ClassYear` string. `transfer_tier` may also be `"Unknown"` (a transfer whose previous school isn't named). `position_group` may be `"HYBRID"` or `null`.

---

## Freshness

Rosters are static once the season starts. Pull them **once**, when fall rosters publish (before Week 0), and build both files from that pull — no in-season pulls. `roster_as_of` is the date of that pull. A stale file is detectable from `roster_as_of` and `generated_at`.
