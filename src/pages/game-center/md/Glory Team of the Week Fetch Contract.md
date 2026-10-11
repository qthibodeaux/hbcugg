# Glory Team of the Week Fetch Contract

**Last updated:** 2026-10-01
**Scope:** the **Glory Team of the Week** block on the home page (`/`). Today it is a hardcoded sample (Howard, "+12 Glory Rating jump"). This contract replaces it with a backend-chosen team and a backend-chosen highlight.
**Companions:** [Game Preview Fetch Contract.md](./Game%20Preview%20Fetch%20Contract.md) (same conventions) · `27-Why` / Glory Engine outputs (`why_glory_{season}.json`)

**These are type contracts, not example payloads.** Field names and types only.

**Notation:** `string` `integer` `number` `boolean` — plain types. `T | null` — nullable. `T[]` — array of `T`. Team ids are v5 ids (`swacjsu`).

**Data ownership rule:** the backend decides. It picks the team, the one highlight term, and writes the sentence. The frontend joins only logo, colors, full name and mascot from `src/data/teams.json`, and does not rank teams, choose the stat, or reword anything.

---

## What the block shows

While the data loads, the block shows a dictionary-style entry for the word *glory* (chosen by the frontend, no data needed). When the data arrives it becomes the team: logo, name, the Glory rating and how it moved, one highlight term with its value, and one line of backend-written copy.

---

## Request

One file. Each week the backend overwrites it with that week's team; the page displays whatever it contains and nothing else.

```text
GET /data/93-FE Docs/game-center/glory-team-of-week/current.json
```

No per-week files, no archive. `season` and `week` in the payload say which week it is.

---

## Response

```text
season: integer
week: integer
week_label: string                      // "Week 4"
generated_at: string                    // ISO 8601 with offset
source: "current_season" | "prior_season_fallback"   // during preseason or a bye week with no results, the prior season's best week may stand in; the page labels it

team: {
  team_id: string | null                // null = no pick this week; the page shows the definition only
  glory: {
    rating: number                      // the team's Glory rating after this week
    previous_rating: number | null      // the rating before this week; null in a team's first rated week
    delta: number | null                // rating - previous_rating
    rank: integer                       // the team's Glory rank among the 18 after this week
    ranked_teams: integer               // 18
  }
  record: string                        // record entering the next game, e.g. "3-1"
  conference_record: string
} | null

game: {                                 // the game that earned the pick
  game_id: string
  game_path_id: string | null           // the played-game page; the block links to it when set
  date: string                          // ISO date
  opponent_team_id: string | null       // null if the opponent is outside the 18
  opponent_name: string
  home_away: "home" | "away" | "neutral"
  team_score: integer
  opponent_score: integer
  event_name: string | null             // "Truth Bowl", "Bayou Classic" — when the game was a named event
} | null

highlight: {                            // the one term / stat the backend chose to feature
  key: string                           // stable id of the metric, e.g. "havoc_rate"
  label: string                         // the term as it should print, e.g. "Havoc rate"
  value: number | string
  display: string                       // the value as it should print, e.g. "24.1%", "+0.31", "5 sacks"
  context: string | null                // short qualifier, e.g. "best in the league this week", "season high"
  rank: integer | null                  // rank among the 18, if the metric has one
}

copy: {
  headline: string | null               // optional short head, e.g. "Defense wins the Truth Bowl"
  summary: string                       // one or two sentences, backend-written: why this team, this week
}

why_reasons: string[]                   // 1-3 short reasons, as on the hub cards (same mechanism as `why_reasons` elsewhere)
```

**Notes**
- **The backend picks the highlight.** The page shows exactly one. If you want it to vary, vary it on the backend (weekly, or per request); the page does not choose among alternatives.
- **Optional, not required for launch:** `highlight_alternates: [{ key, label, display, context }]` — if present, the page may rotate through them like a live tile. Leave it out and the page shows `highlight` only.
- **`delta` and `previous_rating`** are what turn "Glory 84" into "Glory 84, up 12". If a team has no previous week, both are null and the page shows the rating only.
- **Empty states.** No pick (`team: null`) when no 2026 game has been rated. The page falls back to the definition alone and says nothing about a team. During preseason `source: "prior_season_fallback"` is acceptable if the backend prefers.

---

## Freshness

Rebuild after each week's games are parsed and the Glory Engine has rated them. `current.json` must always hold the latest week with a pick. A stale file is detectable from `week` and `generated_at`.

---

## Not requested yet

- A list of runners-up ("also considered").
- A player of the week counterpart (same shape would work).
- Win probability or any prediction.
