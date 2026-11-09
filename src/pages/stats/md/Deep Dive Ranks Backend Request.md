# Deep Dive Ranks — Backend Request

**Date:** 2026-10-27 · **Files:** `passing_grid_2026_swac.json`, `rushing_lanes_2026_swac.json` — `teams[].ranks_swac` and `teams[].ranks_18`
**Ask:** ties share a rank, and the next rank skips the places the tie used (1, 2, 3, 4, 4, 6, 6, 8), the way a standings table reads.

## Request

Today a tie shares a rank and the next team takes the next number, so the ranks run 1, 2, 3, 4, 4, 5, 5, 6, 7, 8, 8, 9. A team that is last of 12 can show `#9`, and `#9 of 12` reads as three teams below it.

Example, `totals.touchdowns` in the passing grid:

| Team | TD | `ranks_swac.touchdowns` now | should be |
|---|---|---|---|
| ALC | 17 | 1 | 1 |
| AAMU | 15 | 2 | 2 |
| GSU | 11 | 3 | 3 |
| PVAMU, UAPB | 10 | 4, 4 | 4, 4 |
| FAMU, JSU | 8 | 5, 5 | 6, 6 |
| TSU | 7 | 6 | 8 |
| B-CU | 6 | 7 | 9 |
| MVSU, SU | 5 | 8, 8 | 10, 10 |
| ASU | 2 | 9 | 12 |

- **Rule:** a team's rank is 1 plus the number of teams strictly ahead of it. Tied teams share the best rank in the tie.
- **Applies to every key** in `ranks_swac` and `ranks_18`, in both files. "Ahead" keeps the file's own direction (most is first; for interceptions and for stuff rate, fewest is first).
- **Definitions:** please state the rule in `definitions.ranks_swac` and `definitions.ranks_18`.

## Response

Same files, same keys, same shape. Only the rank values change where a tie preceded them.
