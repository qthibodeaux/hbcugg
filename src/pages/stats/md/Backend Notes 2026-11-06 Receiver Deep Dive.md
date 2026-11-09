# Backend Notes: 2026-11-06, Receiver Deep Dive

**Re:** `zThinking/explorations/2026-11-06_receiver_deep_dive`, now drawn in Stats > Deep Dive (`/stats/deep-dive`).

The page reads a local copy: `src/data/receiverDeepDive2026W9.json`, made from `TABLES.md`, `GO_TO_BY_DOWN.md`, `LEAGUE_BY_WEEK.md`, `league_by_week.csv`, the first year transfer tables in `verify.log`, and the printout of `wp_corrected.py`.

### Request

A published export of the same tables, so the page can update each week instead of holding a Week 9 copy.

1. **Keep:** every table the data file holds, under the same names and columns.
2. **Add to the transfers tables:** the first year definition (flagged and not on that team's 2025 roster). `TABLES.md` still lists anyone ever flagged, so Rembert and Wall show there.
3. **Add to the win chance tables:** the corrected value, read from the next snap. `TABLES.md` still prints the overstated one.
4. **Add for the leaders table:** first downs and TD rate for every leader, not only those with 25+ targets.
5. **Add for team passing:** EPA per pass by week for each team.
6. **Add to the most clutch pairs:** touchdowns on those clutch catches (3rd and 4th down conversions and late and close).

### Response

```
game-center or stats path: ?
through_week: int
{table name}: rows
```
