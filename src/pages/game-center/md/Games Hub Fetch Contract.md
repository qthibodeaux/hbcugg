# Games Hub Fetch Contract

**Last updated:** 2026-10-04
**Scope:** the **Games** page (`/game-center/games`), desktop and mobile — every game of a season, played or not, as one grid, filtered by season, week, conference, team and status.
**Replaces:** the story-card payload in [Game Center Fetch Contract.md](Game%20Center%20Fetch%20Contract.md) §Games Hub and the Games Hub section of `reqs/BACKEND_RESPONSE_SPEC.md`. Page design: [Games Hub Design Doc.md](Games%20Hub%20Design%20Doc.md).

**These are type contracts, not example payloads.** Field names and types only.

**Notation:** `string` `integer` `number` `boolean` — plain types. `T | null` — nullable. `T[]` — array of `T`. Team ids are v5 ids (`swacjsu`).

**Data ownership rule:** the backend decides which games are in the season and every fact about them — status, score, winner, week, event name, venue, links. The frontend joins only school identity from `src/data/teams.json` by `team_id` (logo, colors, conference) and does not dedupe, reorder or classify games.

---

## Request

One file per season. Rebuilt every week in season.

```text
GET /data/93-FE Docs/game-center/games-hub/games_hub_{season}.json
```

---

## Response

```text
season: integer
generated_at: string                    // ISO 8601 with offset
current_week: integer | null            // the week the context file names; null outside the season
weeks: [{
  week: integer
  label: string                         // "Week 5"
  start_date: string                    // YYYY-MM-DD
  end_date: string
}]                                      // every week that has a game, in order
summary: {
  games: integer
  final: integer
  scheduled: integer
}
games: Game[]                           // one row per game, in play order (date, then kickoff)
```

### Game

```text
game_id: string                         // canonical id (the parsed form once play-by-play lands)
schedule_game_id: string                // "2026-10-03_swacpvamu_at_swacmvsu" — never changes
game_path_id: string | null             // the game page, when the game has one
preview_path_id: string | null          // the preview page, unplayed games between two of the 18
route: string | null                    // what the tile links to: "/game/{game_path_id}" or "/game/preview/{preview_path_id}"; null = no link

week: integer
week_label: string                      // "Week 5"
date: string                            // YYYY-MM-DD
date_label: string                      // "Oct 3"
kickoff_label: string | null            // "6:00 PM"; null when not announced

status: "final" | "scheduled" | "postponed" | "canceled"
away: Side
home: Side
neutral_site: boolean
winner_team_id: string | null           // final games between known sides; null on a tie or unplayed

event: { kind: "classic" | "homecoming" | "championship" | "bowl", name: string } | null   // "Bayou Classic"
venue: {
  stadium_name: string | null
  city: string | null
  venue_label: string                   // what the tile prints: stadium, else city
}

conference_scope: "conference" | "cross_conference" | "non_conference"
game_type: string                       // the classification vocabulary (Game Classification Vocabulary.md)
is_covered_matchup: boolean             // both sides are among the 18
```

### Side

```text
team_id: string | null                  // null for an opponent outside the 18
name: string                            // "Prairie View A&M", "Tarleton State"
short_name: string                      // what the tile prints: "PVAMU", "Tarleton St."
score: integer | null                   // final games only
```

**Notes**
- **One row per game.** A game appears once, under one `game_id`, with the away and home sides as played — never once per team's schedule. No spring, intrasquad or placeholder (TBD championship) rows.
- **`schedule_game_id`** is on every row and never changes; the frontend keys the preview → game redirect on it.
- **`route`** is the only link the tile follows. A played game with no game page yet and an unplayed game against an outside opponent send `null`.
- **`short_name`** fits a tile ~100px wide on a phone: abbreviations for the 18 (`teams.json` short names), a short form for outside opponents.
- **Retired:** `story_cards`, `selected_story_cards`, `dynamic_candidates`, `stat_carousel`, and every `why_*` field on this file. `games[]` replaces `story_cards` as the row list.

---

## Freshness

Rebuild after each week's games are parsed, in the same run as the games index, so status, scores and routes always match it.
