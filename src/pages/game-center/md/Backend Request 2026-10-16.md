# Backend Request — 2026-10-16

**Answers:** `RESPONSE_BACKEND_2026-10-11_launch0_closeout.md` and `RESPONSE_BACKEND_2026-10-11_qb_map_and_questions.md`.
**Picked up:** the full 10-11 drop (Week 6, previews with Scout blocks, rebuilt season averages, Special Teams, QB Map, counting fumbles). Everything in both "You need to" lists is applied on our side.

This file holds every open ask in one place. Each request is a field contract: request path, then the response shape. Field types: `string` `integer` `float` `boolean`, `T | null`. Team ids are v5 (`swacjsu`). Rates are 0–1.

---

## 1. Answers to your questions (2026-10-11)

| # | Question | Answer |
|---|---|---|
| 1 | Havoc counted once per play (any TFL, sack, forced fumble, INT or breakup ÷ plays) | **Accepted.** Keep it. We change our glossary to your definition. |
| 2 | Week Review holds only games between two of the 18 | **Accepted.** |
| 3 | Per-punt and per-kickoff logs | **Not needed** for launch.0. Aggregates are enough. |
| 4 | New `scoring_type` / drive result for a blocked kick returned for a TD | **No change.** Keep `FUMBLE_TD` / `FUMB_TD`; the `scoring_subtype: "blocked_kick_return"` you added is enough. |
| 5 | Outside-home-site game ids change from `_at_tbd` to `_at_{host slug}` | **Go ahead.** Nothing on our side keys on the id's text. |
| 6 | Remove "▲ WINNER OUT-PLAYED THE LOSER" | **Done** — removed from the Week Review chart. |
| 7 | Conference Slate and Games Hub walk-through | Still open on our side; we will send notes separately. |
| 8 | No national average; label the row "Lg Avg" | **Agreed.** |
| 9 | Re-pull and apply 10-08 → 10-11 | **Done.** |

---

## 2. Outside-opponent short names — every schedule payload

Outside opponents (`team_id: null`) ship `short_name` equal to `name` or a light trim ("Stony Brook", "Nicholls", "Clark Atlanta", "Savannah St."). 74 entries in `games_hub_2026.json`. The field is the tile label and needs a real abbreviation.

```text
SIDE.short_name: string        // the 18: teams.json short name ("PVAMU")
                               // outside: the school's common abbreviation, <= 8 characters
                               //   ("STONY", "NICH", "CAU", "SAVST", "ECSU", "TARLETON", "UCF", "W&M")
```

Same rule in every field that carries an outside opponent's short form, all seasons:

| File | Field |
|---|---|
| `game-center/games-hub/games_hub_{season}.json` | `games[].away.short_name`, `games[].home.short_name` |
| `game-center/team-schedules/{season}/{team_id}.json` | `games[].opponent.short_name`, `games[].opponent.display_short`, `games[].opponent_short` |
| `game-center/season-schedule/schedule_board_{season}.json` | `cells[].opponent_short` |
| `game-center/week-central/{season}/{week}.json` | `games[].away_team.short_name`, `games[].home_team.short_name` |
| `game-center/hub/game_center_hub_{season}.json` | any `away_team` / `home_team` `short_name` on featured and rail games |

Also in [Games Hub Fetch Contract.md](Games%20Hub%20Fetch%20Contract.md), addendum 2026-10-16.

---

## 3. Team Analytics — rushing scatter fields

```text
GET stats/team-analytics/advanced_{season}.json
```

Added to `teams[].offense`, every season (2019, 2021–2026):

```text
ADVANCED.offense += {
  f10_run_rate: float | null              // runs ÷ (runs + dropbacks) on 1st & 10
  f10_rush_success_rate: float | null     // run success on 1st & 10 (50%-of-distance rule)
  qb_share_of_carries: float | null       // QB carries ÷ team carries (designed runs + scrambles)
  qb_share_of_rush_yards: float | null    // QB rush yards ÷ team rush yards
  rush_success_first_half: float | null   // run success, 1st half — same rule as success_rate_rush
  rush_success_second_half: float | null  // run success, 2nd half
}
```

Counted over the season's League plays, divided once, garbage time excluded — the basis of `success_rate_rush`. A team with no League game ships nulls. Also in [Team Analytics Fetch Contract.md](../../analytics/md/Team%20Analytics%20Fetch%20Contract.md) §12.

---

## 4. Team Analytics — down & distance

Same file, both `offense` and `defense` (defense = what it allowed), every season:

```text
ADVANCED.offense / ADVANCED.defense += {
  third_short_share: float | null         // 3rd downs at 1–3 yards to go ÷ all 3rd downs
  third_short_conversion: float | null    // conversions ÷ attempts on those
  third_long_share: float | null          // 3rd downs at 7+ yards to go ÷ all 3rd downs
  third_long_conversion: float | null     // conversions ÷ attempts on those
  third_down_attempts: integer | null
  fourth_down_go_rate: float | null       // 4th downs gone for ÷ 4th downs faced (offense only; null on defense)
  fourth_down_conversion: float | null    // conversions ÷ attempts
  fourth_down_attempts: integer | null
}
```

A conversion is a first down or touchdown on the play, penalties included. Same play pool and garbage-time rule as §3.

---

## 5. Team Analytics — big-play counts

Same file, both sides, every season. The explosive *rates* are there; the bar charts need counts.

```text
ADVANCED.offense / ADVANCED.defense += {
  plays_20_plus: integer | null           // scrimmage plays gaining 20+ yards (defense: allowed)
  plays_25_plus: integer | null           // 25+
  plays_40_plus: integer | null           // 40+
}
```

Season totals over League plays, garbage time included (a big play counts whenever it happens).

---

## 6. Publishing — rollups with the game file

On 10-09 `famuasu26.json` shipped alone; `games/index.json`, Week Central, the Games Hub, the schedule board, both team schedules and the preview's `played_game_path_id` still read "scheduled" until the 10-11 run. The page could not link to the game.

**Ask:** a game file publishes in the same run as every payload that lists it. Nothing changes in any shape.

---

## 7. Still to come (from your 10-11 note) — no new ask

- Real headshots for the players without one.
- The refitted win-probability model — please tell us the day it ships, since every WP and WPA value moves.
- PAT / kickoff split after an opening kickoff-return TD; outside opponent name normalisation; player safeties and points in `stats/counting/`.

---

*Created 2026-10-16.*
