# Week Recap Fetch Contract — "How Saturday Was Won"

**Page:** Game Center hub card → the week's recap page and its export poster (4:5 portrait).
**Date:** 2026-10-18 · **Status:** OPEN
**Cadence:** current season rebuilt **weekly**, in the same run as the week's game files. Past weeks built once.
**Seasons:** 2019, 2021–2026.

The export's name is fixed: **"How Saturday Was Won"** prints on every week's poster (the frontend owns it). Everything under it is the backend's: the week's own headline, the story items, their order and their copy. The backend scores every candidate fact, weighs the categories, ranks them and writes the words. The frontend draws what ships, each item by its `kind`, in the order given. It computes nothing.

---

## Request

```text
GET game-center/week-recap/{season}/{week}.json
GET game-center/week-recap/index.json        // { seasons: []{ season, weeks: integer[] }, current: { season, week } }
```

## Response

```text
{
  season: integer
  week: integer
  week_label: string                        // "Week 7"
  date_label: string                        // "Oct 17"
  generated_at: ISO-8601

  hero: {                                   // the week's own headline, under the fixed "How Saturday Was Won"
    title: string                           // the contextual headline, 2–5 words: "Homecoming Saturday", "Two 5-TD Passers", "Chaos in the East"
    headline: string                        // one sentence that tells the week
    stat: { display: string, label: string }   // "4/5", "homecomings"
    team_ids: string[]                      // logos shown with the hero, 0–6
    theme: string                           // the category the title came from: "event" | "performance" | "game" | "race" | "record" | "crowd"
  }

  games: []GAME                             // every final between two of the 18, the margin board, in display order
  items: []ITEM                             // the ranked story, highest score first
}

GAME = {
  game_path_id: string                      // links to /game/{game_path_id}
  away: { team_id: string, score: integer }
  home: { team_id: string, score: integer }
  winner_team_id: string
  margin: integer                           // winner minus loser
  one_score: boolean                        // margin <= 8
  net_success_edge: float | null            // the winner's net success rate (Week Review)
  out_played: boolean                       // the loser won the play-by-play (edge < 0)
  events: []{ kind: string, display_name: string }   // homecoming, classic, …
  attendance: integer | null
  capacity: integer | null
  venue_name: string | null
}

ITEM = {
  id: string                                // stable within the week
  kind: string                              // the table below — sets the visual
  category: string                          // "performance" | "game" | "crowd" | "event" | "race" | "record" | "team"
  score: float                              // the backend's weighted rank; the frontend only sorts by it
  title: string                             // eyebrow, e.g. "Performance of the Day"
  headline: string                          // one sentence
  stat: { display: string, label: string }  // the big number
  team_ids: string[]
  person_id: string | null
  data: VIZ                                 // shape by kind
}
```

## Kinds and `data`

| kind | Card | `data` |
|---|---|---|
| `performance` | A player's day | `{ person_id, name, last_name, position, team_id, image_url, production: float, stat_line: []{ label, value }, tag: string \| null }` — `tag` e.g. "5 TD in a loss" |
| `performance_set` | Top performers, 3 | `{ players: []` the `performance` shape `}` |
| `big_number` | One fact, one number | `{}` (the `stat` carries it) |
| `game_result` | One game told | `{ game_path_id, away, home, margin, note }` |
| `crowd` | Attendance vs capacity | `{ games: []{ game_path_id, home_team_id, venue_name, attendance, capacity } }` (attendance desc) |
| `event_set` | Homecomings, classics | `{ events: []{ kind, display_name, team_id, game_path_id } }` |
| `race` | Division movement | `{ group_label, rows: []{ team_id, conference_record, rank, prev_rank } }` |
| `record_book` | "First since…" | `{ fact, rows: []{ date_label, value, is_current: boolean } }` (newest-relevant first, current row flagged) |
| `wp_swing` | Biggest win-probability swing | `{ game_path_id, team_id, timeline: []{ t: float, wp: float } }` (0–1 game time, home WP) |
| `comeback` | Largest deficit overcome | `{ game_path_id, team_id, deficit: integer, period_label: string }` |

## What to weigh

Every source the backend already holds is fair game for the hero and the items, and the hero should come from whichever is the week's biggest story:

| Source | Examples of story |
|---|---|
| Game files (scores, `production_scores`, leaders, play-by-play, WP) | a 5-TD passer, a 60-point game, a top production score, a 4th-quarter comeback, a WP swing |
| Events (`events`, `headline_event`) | homecomings, classics, rivalry games — "Homecoming Saturday" when most games are one |
| Venues (`venue`, `attendance`, capacity) | the biggest crowd, a sellout, a record attendance |
| Players (rosters, `players/profile`) | a freshman's breakout, a transfer's big day, a career high |
| Standings (`standings_race`) | a division lead changing hands, a three-way tie, a team eliminated |
| Team Analytics (`advanced`, `week_review`) | the loser that out-played the winner, a defense's best week |
| History (2019, 2021–2026 corpus) | "first since", most ever, streaks |

## Rules

| Field | Rule |
|---|---|
| Selection | The backend picks the items, weights the categories, and ranks by `score`. The frontend shows the top items in order and never re-ranks. |
| Copy | `hero.title`, `title`, `headline`, `stat.display`, `tag` and `note` print as-is. The hero `title` is new every week; it never repeats the fixed export name. |
| Count | 8–14 `items` per week; at most one `performance_set`, one `crowd`, one `event_set`, one `race`. |
| Records | `record_book` lines only from the corpus the backend holds (2019, 2021–2026); the copy says the span ("first since 2021"). |
| Missing | A kind with no qualifying subject is left out, not shipped empty. Attendance and capacity are null when not reported — never estimated. |
| Ids | `team_id` v5, the 18 only. `person_id` is the `PERS_` id; `image_url` real or null. |

---

*Last updated: 2026-10-18*
