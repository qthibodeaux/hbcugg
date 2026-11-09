# Team Spotlight — Fetch Contract

**Page:** `/schools/spotlight` (Schools → Team Spotlight). It shows the week's Team of the Week the way the team page does: the team banner, a KPI strip, then the `editorial` story cards marked `selected` as tiles, each exportable. Updated 2026-10-21 for the editorial version of the file.
**Date:** 2026-10-21 · **Status:** OPEN
**Answers:** `999-frontendfeedback/10 21/team_spotlight/FRONTEND_CHART_SPEC.md`. The page is built on `week_07_swacaamu.json`, read from a copy in the frontend for now.
**Cadence:** weekly, after the Week Recap, in the same run as `build_team_spotlight.py`.

### Files

All under `93-FE Docs/schools/team-spotlight/`.

| # | File | What |
|---|---|---|
| 1 | `index.json` | which spotlight is current, plus the past ones |
| 2 | `{season}/week_{NN}_{team_id}.json` | the spotlight itself, the same file you build today |

### Rules

1. **Publish it.** Today the file is only in `92-frontend/0-data/team-spotlight/`, so the page can't pick it up.
2. **One current spotlight:** the week's Team of the Week. `index.current` moves when the week advances.
3. **Team names:** every label prints teams.json `shortName` (JSU, BCU, ASU…), never "J-State", "B-CU" or "Bama State". This file still has the old names in the game labels ("W 55-17 vs B-CU", "vs J-State"), and the frontend swaps them for now.
4. **Opponent ids next to labels:** wherever a chart row is a game, add `opponent_team_id` beside its `label`, so the page can show the opponent's logo and never parses text. That means:
   - `season_in_win_probability.panels[]`
   - `every_possession.rows[]`
   - `quarter_by_quarter.rows[]`
   - `field_position.data[]`
   - `swing_plays.data[]`
5. **Home, away or neutral:** the game labels say "vs FAMU" for a road game (Week 4 was **at** FAMU). Use `vs` / `at` correctly, or add `home_away` to those rows.
6. **`every_possession`:** the opponent's drives ship as `defense`; the spec says `opponent`. Either works, but keep one name. The page reads both.
7. **`who_carries_it`:** the spec says each player carries `league_par_rank` of `league_players_rated` and a position rank. They aren't on this week's `charts[].data`. Please add them.
8. **The `editorial` copy follows the copy rules.** Every `headline`, `dek`, `numbers[].value` and `visual` label:
   - uses `shortName` (rule 3). Today the copy has "J-State", "B-CU" and "Bama State", e.g. "Next: vs Bama State (Magic City Classic)".
   - never prints a raw id. The straight-scoring-drives record book has a `who` of "meacncat vs Howard" and "meacncat vs Alcorn".
   - uses an em dash, not "--" ("+15.4 a game -- -10.6 at this point last season").
9. **Record books cover our 18 only.** The `record_book` lists include NC A&T rows (2019): Kylil Carter's 6 total touchdowns, and the scoring-drive streaks. NC A&T isn't one of the 18, has no logo and has no page. Rank among the 18 only, the same as every other since-2019 record on the site, or tell us if the record book is meant to include former MEAC members.
10. **Put the spotlighted player's own row in the list.** Brown's card says "tied for the 3rd-most total touchdowns", but the 5-row list stops at the other three 6-TD games and he isn't in it. Include the spotlighted row (with its rank) whenever the list is truncated. The page adds it from `numbers[0]` for now.
11. **`turning_point.visual.annotate[]`:** give each play its index into `series` (or its `sequence`), not only quarter and clock, which repeat across snaps.

---

## 0. Index

### Request

```text
GET schools/team-spotlight/index.json
```

### Response

```text
{
  generated_at: ISO-8601
  current: { season: integer, week: integer, team_id: string, path: string }    // path: "2026/week_07_swacaamu.json"
  history: [ { season, week, team_id, path } ]                                  // newest first
}
```

---

## 1. Spotlight

### Request

```text
GET schools/team-spotlight/{season}/week_{NN}_{team_id}.json
```

### Response

The file exactly as `build_team_spotlight.py` writes it today: `season`, `through_week`, `team_id`, `generated_at`, `scope`, `editorial`, `facts`, `findings` and `charts[]`, with the additions in rules 3–11. The page reads `editorial` (the `selected` cards, in order, by `kind` and `visual.type`) and `facts` for the banner and the KPI strip. Chart `id`s stay stable week to week:

`rating_climb` · `season_in_win_probability` · `fingerprint` · `every_possession` · `quarter_by_quarter` · `swing_plays` · `field_position` · `who_carries_it` · `home_and_away` · `division_odds`
