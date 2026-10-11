# Team Profile Fetch Contract

**Last updated:** 2026-10-04
**Scope:** a school's **Profile** page (`/teams/:teamId`), desktop and mobile — the KPI strip (PAR / roster / transfers / veterans), conference record + last 5, previous game, star impact, next game (or the season summary once the season is over), the coach carousel, the unit production carousel, and the team stat card. One document per school per season, rebuilt every week.
**Supersedes:** `reqs/BACKEND_RESPONSE_SPEC.md` §10 (same fields, now with freshness rules and the as-of fields).
**Companions:** [Schools Hub Fetch Contract.md](Schools%20Hub%20Fetch%20Contract.md) · [Roster Hub Fetch Contract.md](../../players/md/Roster%20Hub%20Fetch%20Contract.md) (same conventions)

**These are type contracts, not example payloads.** Field names and types only.

**Notation:** `string` `integer` `number` `boolean` — plain types. `T | null` — nullable. `T[]` — array of `T`. Team ids are v5 ids (`swacjsu`). Person ids are `PERS_` ids, the same ones the game and roster files use. Every rate / pct is **0–100**. `*_label`, `score` and `display` strings are rendered verbatim.

**Data ownership rule:** the backend decides everything on the page — the records, which game is "previous" and "next", who the star is, which coaches and units show, which stat is the team's top stat. The frontend joins only school identity from `src/data/teams.json` by `team_id` and never fills a missing block with its own numbers.

---

## Request

One file per school per season. Each week the backend overwrites it.

```text
GET /data/93-FE Docs/schools/team-hub/{season}/{team_id}.json
```

---

## Response

```text
team_id: string
season: integer
season_state: "in_progress" | "complete"
as_of_week: integer                     // the last week whose games are in this document
generated_at: string                    // ISO 8601 with offset

header: Header
conference_record: ConferenceRecord
previous_game: Game | null              // null only before the team's first game
next_game: NextGame | null              // in_progress with a game left; null otherwise
season_summary: SeasonSummary | null    // complete only; null otherwise
coach_carousel: CarouselCoach[]         // head coach first, then coordinators
unit_carousel: UnitCarousel
top_stat: TopStat | null                // null only before the team's first game
star_impact: StarImpact | null          // null only before the team's first game
```

### Header

```text
conference: "SWAC" | "MEAC"
division: string                        // "West", "East", "" for MEAC
division_label: string                  // "SWAC WEST"
season: integer
team_abbreviation: string
school_name: string
avg_par: number | null                  // null only before the team's first game
roster_count: integer
transfer_count: integer
transfer_rate: number
upperclass_pct: number
```

### ConferenceRecord

```text
conference_label: string                // "3-0"
conference_wins: integer                // 0 before conference play — never omitted
conference_losses: integer
overall_label: string                   // "4-1"
overall_wins: integer
overall_losses: integer
overall_ties: integer                   // 0 default
division_rank: string                   // "1st - SWAC West"
last_5: [{
  week: integer
  result: "W" | "L" | "T"
  home_away: "home" | "away" | "neutral"
  opponent_id: string | null            // null for an opponent outside the 18
  opponent_short: string
  score_team: integer
  score_opponent: integer
  score: string                         // "L 30-49"
  game_path_id: string | null           // the game page, when it has one
}]                                      // up to 5, this season's games only, most recent last
```

### Game (previous_game)

```text
game_id: string
game_path_id: string | null
week: integer
date: string                            // YYYY-MM-DD
opponent_id: string | null
opponent_name: string
result: "W" | "L" | "T"
score_team: integer
score_opponent: integer
score: string
venue: Venue
tag: string                             // short label
headline: string                        // one sentence, never equal to tag
is_rivalry: boolean
is_homecoming: boolean
is_conference_championship: boolean
is_celebration_bowl: boolean
```

### NextGame

```text
game_id: string
preview_path_id: string | null          // "2026-10-10_swacpvamu_at_swacsu" when both teams are in the 18
date: string                            // YYYY-MM-DD
kickoff: string                         // "TBA" or a time
opponent_id: string | null
opponent_name: string
opponent_short_name: string
opponent_mascot: string | null
opponent_logo: string | null
home_away: "home" | "away" | "neutral"
venue: Venue
broadcast: string | null
tag: string
headline: string
is_rivalry: boolean
is_homecoming: boolean
is_conference_championship: boolean
is_celebration_bowl: boolean
```

### Venue

```text
stadium_name: string
venue_label: string                     // "Atlanta, GA" — what the page renders
city: string | null
neutral_site_name: string | null
```

### SeasonSummary

```text
headline: string
record: string
wins: integer
losses: integer
conference_record: string
conference_wins: integer
conference_losses: integer
division_finish: string
avg_par: number
games_played: integer
```

### CarouselCoach

```text
coach_id: string                        // PERS_ id
name: string
role: string                            // "Head Coach", "Offensive Coordinator", "Defensive Coordinator", position title
role_group: "head_coach" | "coordinator" | "position_coach"
image_url: string | null                // real headshot or null — never a placeholder URL
tenure_year: integer | null             // 1 = first season
metric: {
  key: string
  label: string
  value: number
  display: string
  scope: string                         // "vs 2025"
  higher_is_better: boolean
  is_improvement: boolean               // the good/bad flag
  direction: "up" | "down" | "flat"     // which way the number moved — display only
} | null                                // null until the coach has a measured metric
```

### UnitCarousel

```text
scope: "conference"
scope_total: integer
available_units: string[]               // the units with a slide, in slide order
slides: [{
  unit: string                          // "passing", "rushing", "defense", "special_teams"
  label: string                         // "Passing Production"
  metrics: [{
    key: string
    label: string
    value: number
    display: string
    rank: integer
    total: integer                      // may be < scope_total
    higher_is_better: boolean
  }]                                    // exactly 4
}]
```

### TopStat

```text
unit: string
key: string
label: string
value: number
display: string                         // the value as printed
rank: integer
total: integer                          // against all 18
sentence: string                        // sentence-case, "Passing touchdowns"
```

### StarImpact

```text
person_id: string
full_name: string
last_name: string
position: string
class_year: string | null
image_url: string | null                // real headshot or null — never a placeholder URL
from_game: { game_id: string, game_path_id: string | null, week: integer, opponent_name: string, result: "W" | "L" | "T", score: string }
game_par: number
season_par: number
par_per_game: number
stat_line: [{ label: string, value: string }]   // position-agnostic, 3–6 cells
profile_url: string                     // "/player/{person_id}"
```

**Notes**
- **This season, as of this week.** `conference_record`, `last_5`, `previous_game`, `star_impact`, `top_stat`, `unit_carousel` and `header.avg_par` are built from this season's games through `as_of_week` only. Last season's records never stand in; before a team's first game the record is `0-0` and the game-driven blocks are `null`.
- **Previous / next.** `previous_game` is the team's most recent completed game. `next_game` is its earliest regular-season game dated after the build — never a spring game or intrasquad scrimmage.
- **Star impact.** The player with the highest `game_par` in the team's most recent completed game. State the tie-break rule.
- **Units.** Include a unit only when all 4 of its metrics have a value for this team; drop the whole slide otherwise. State the tie-break rule when two candidates share a rank.
- **Coaches.** This season's staff as of the build; a coaching change lands the week it happens.
- **Tagging.** `tag` is one short label; the four booleans are sent separately and never folded into it. `is_rivalry` / `is_homecoming` are `false` (never `null`) until a curated list exists.

---

## Freshness

Rebuild all 18 documents after each week's games are parsed. A stale document is detectable from `as_of_week` and `generated_at`.
