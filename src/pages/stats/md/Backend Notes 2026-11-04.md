# Backend Notes: 2026-11-04

**Re:** the leaderboards' `pool` boards (`stats/leaderboards/{season}/week_{n}.json`). These become magazine-style posters: the week's top 3 in one stat, with a line on what the player actually did. Each row has the value, the game and its season rank, but not the detail. The page doesn't count plays, so it needs a `details` block.

### Request

```text
GET stats/leaderboards/{season}/week_{n}.json    (unchanged)
```

### Response: one new field on `pool[].rows[]`, for every row ranked 1-5

```text
third_fourth_conversions:
  details: {
    third:  { converted: integer, chances: integer }   // the player's 3rd-down runs and catches, and how many moved the chains or scored
    fourth: { converted: integer, chances: integer }   // same on 4th down
    longest_to_go: integer                             // the most yards to go on one he converted
  }

game_changers:
  details: {
    biggest_play: {
      description: string          // plain words, "61-yard touchdown catch from A. Parker", not the raw play text
      quarter: integer
      clock: string
      win_chance_before: number    // 0-100
      win_chance_after: number     // 0-100
    }
  }

big_plays:
  details: {
    plays: [ { yards: integer, kind: "run" | "catch", touchdown: boolean } ]   // longest first; adds up to `value`
  }

yards_after_catch:
  details: {
    catches: integer       // catches with a charted catch spot, the ones the YAC comes from
    yards: integer         // total receiving yards on those catches
    longest_yac: integer   // the most yards after the catch on one play
  }
```

- **Same plays as `value`:** garbage time in, the same rule that builds the board, so the detail adds up to the number beside it. A 6 on conversions means `third.converted + fourth.converted` = 6.
- **All published seasons and weeks,** in the weekly run.
- **`yards_after_catch`:** `details` is null where the feed has no air yards (before 2024, most of 2022).

### Question

The narrative "fun" boards aren't in anything we've received. Are they still coming, and in which file?
