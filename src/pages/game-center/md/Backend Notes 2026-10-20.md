# Backend Notes — 2026-10-20

## 1. Conference Slate: add the SWAC cross-division games

`game-center/conference-slate/conference_slate_{season}.json` lists **division games only**: 45 matchups in 2026, 15 each for `swac_east`, `swac_west` and `meac`. The Conference Slate matrix's SWAC "All" view is 12 × 12, so every East-vs-West cell is empty. Those are real conference games and should be on the matrix.

The team-schedule files have them. 2026 so far:

| Week | Game | Result |
|---|---|---|
| 0 | ASU at Southern | ASU 30-17 |
| 4 | Southern at JSU | JSU 35-17 |
| 5 | PVAMU at MVSU | MVSU 28-27 |
| 6 | JSU at Grambling | Grambling 45-38 |
| 6 | MVSU at TSU | MVSU 38-34 |
| 7 | Grambling at AAMU | AAMU 61-31 |
| 7 | ASU at UAPB | ASU 21-15 |
| 8–12 | 12 more scheduled | — |

### Request

```text
GET game-center/conference-slate/conference_slate_{season}.json
```

### Response — the same matchup shape, plus the cross-division games

```text
{
  axes: { swac_east, swac_west, meac }              // unchanged
  matchups: [
    {
      matchup_id: string
      division_scope: "swac_east" | "swac_west" | "meac" | "swac_cross"   // new value for East vs West
      game_type: "regular_conference"
      status, status_label, date, date_label, week,
      away_team_id, home_team_id, away_score, home_score, winner_team_id,
      score_display, game_path_id, route, has_game_page, warnings
    }
  ]
}
```

- **Every SWAC conference game:** every East-vs-West game, final and scheduled, in every season file (2019, 2021–2026).
- **One row per game,** like the division games. The matrix fills both mirror cells from it.
- **The SWAC Championship** isn't a cross-division regular-season game. Keep it out of `swac_cross`; it goes in `special_games` if anywhere.
- **Missing team ids:** some team-schedule rows still have `opponent_team_id: null` for opponents among the 18 (Backend Notes 2026-10-19 §2). Build this list from the games themselves so no cross-division game is dropped.
