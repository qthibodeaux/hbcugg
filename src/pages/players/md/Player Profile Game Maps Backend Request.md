# Player Profile Game Maps — Backend Request

**Date:** 2026-10-19 · **File:** `players/profile/{season}/{person_id}.json`
**Ask:** per-game havoc events for defenders, and the missing per-direction rushing fields for rushers. Both go on each row of `games[]`, next to `stat_line` and `field_map`.

## Request

### 1. `games[].havoc` — every havoc play the player made in that game

The Player page draws a defender's "Havoc Spatial Log" for the selected game: one dot per play, by side of the field and depth off the line of scrimmage. It needs the plays themselves; counts alone cannot place a dot.

```text
games[].havoc: {
  available: boolean                  // false when the game has no play-by-play
  totals: {
    tfl: number                       // half-credit TFLs count 0.5
    sacks: number                     // half sacks count 0.5
    qb_hurries: integer
    forced_fumbles: integer
    pass_breakups: integer
    interceptions: integer
  }
  events: []{
    type: "tfl" | "sack" | "qb_hurry" | "forced_fumble" | "pass_breakup" | "interception"
    credit: number                    // 1, or 0.5 for a shared sack / TFL
    zone: "left" | "middle" | "right" | null
    depth: number | null              // yards from the line of scrimmage where the play ended;
                                      // negative = behind it (TFL, sack), positive = downfield
    quarter: integer
    game_clock: string | null         // "07:42"
  }
} | null                              // null for a row that is not a played game
```

- **Rules:**
  - `totals` agree with the game's `stat_line` (TKL / TFL / SACK / INT) wherever both carry a value.
  - `events` has one entry per play, in game order.
  - A game the player was in with no havoc plays is `available: true` with `events: []`.
- **`zone`:** the same left / middle / right as `field_map` (the offense's view). `null` when the play text gives no side.
- **`depth`:** `null` when it cannot be read.

### 2. `games[].field_map.rushing` — the rest of the rushing lane map

`field_map.rushing` already ships `direction`, `attempts` and `yards` for most rushers. The Player page's rushing lane map also prints, per lane, the yards the offensive line created against the yards the runner created on his own, touchdowns and fumbles, and a success rate across the game.

```text
field_map.rushing: {
  available: boolean
  grid: "1x3"
  success_rate: number | null         // new — share of the game's runs that were successful, 0-1
  cells: []{
    direction: "L" | "M" | "R"
    attempts: integer
    yards: integer
    line_yards: integer               // new — yards credited to the offensive line
    highlight_yards: integer          // new — the rest (yards - line_yards)
    touchdowns: integer               // new
    fumbles: integer                  // new — fumbles lost
  }
}
```

`line_yards` and `highlight_yards` use whatever definition the Team Analytics rushing metrics use; please state it in the response. `field_map.rushing.available` stays `false` where the game has no chartable runs.

## Response

Same file, same path. Two additions: `games[].havoc` (new) and the new fields on `field_map.rushing` and its cells. Nothing is removed.
