# Player Leaders — Fetch Contract

**Page:** `/stats/player` (Player Stats). The banner's **Leaders** export draws these files as posters: Offensive Leaders and Defensive Leaders, for a week or for the season.
**Date:** 2026-10-19 · **Status:** SHIPPED 2026-10-19 (`RESPONSE_BACKEND_2026-10-19_player_leaders.md`)
**Cadence:** the current season's files are rebuilt **weekly**, in the same run as the counting stats. Past seasons are built once and frozen.
**Seasons:** 2019, 2021, 2022, 2023, 2024, 2025, **2026**. 2020 does not exist.

The week's and the season's top 10 in six categories, ranked by you:

| Side | Categories |
|---|---|
| Offense | Passing yards, Rushing yards, Receiving yards |
| Defense | Tackles, Sacks, Interceptions |

### Files

All under `93-FE Docs/stats/leaders/`.

| # | File | What |
|---|---|---|
| 1 | `index.json` | the seasons, and the weeks each season has |
| 2 | `{season}/week_{week}.json` | one week's leaders |
| 3 | `{season}/season.json` | the season's leaders, through the latest week |

### Rules

1. `team_id` and `opponent_team_id` are v5 ids (`swacjsu`). Every opponent is one of the 18 (see rule 3); `opponent_name` and `opponent_short_name` are always `null` and stay in the file so the shape holds.
2. Names are given as `display_name` ("Andre Powell Jr."), first name first.
3. **Games between two of the 18 only** — the site's stat-tier rule (leaderboards and rankings use League games only), and outside games have no player stat lines. Every file says so in `scope`: `"Games between two of the 18"`. *(Changed 2026-10-19, backend response.)*
4. **Ranking:** by `value` descending. Ties are broken by `tiebreak` (listed per category below), and then by fewer games. Rows still tied share a rank (`rank` 4, 4, 6).
5. Each category has 10 rows; a row is added for a tie at 10. If a week has fewer than 10 players with a value above 0, ship the shorter list. Rows with a value of 0 are left out.
6. `null` means not available and renders as `—`; `0` means zero.

| Category `id` | `value` | `tiebreak` | Row fields |
|---|---|---|---|
| `passing` | passing yards | passing TD | `completions`, `attempts`, `touchdowns`, `interceptions` |
| `rushing` | rushing yards | rushing TD | `carries`, `touchdowns`, `long` |
| `receiving` | receiving yards | receiving TD | `receptions`, `touchdowns`, `long` |
| `tackles` | total tackles | solo tackles | `solo`, `assisted`, `tfl` |
| `sacks` | sacks (half sacks count 0.5) | sack yards | `sack_yards`, `tfl`, `qb_hurries`, `forced_fumbles` |
| `interceptions` | interceptions | return yards | `return_yards`, `touchdowns`, `pass_breakups` |

---

## 0. Index

### Request

```text
GET stats/leaders/index.json
```

### Response

```text
{
  generated_at: ISO-8601
  current: { season: integer, week: integer }          // the latest processed week
  seasons: [
    { season: integer, weeks: []integer, season_file: boolean }
  ]
}
```

---

## 1. Week leaders

### Request

```text
GET stats/leaders/{season}/week_{week}.json
```

### Response

```text
{
  season: integer
  week: integer
  week_label: string                     // "Week 7"
  date_label: string                     // "Oct 17"
  generated_at: ISO-8601
  scope: string                          // "Games between two of the 18"
  categories: [
    {
      id: "passing" | "rushing" | "receiving" | "tackles" | "sacks" | "interceptions"
      side: "offense" | "defense"
      label: string                      // "Passing"
      unit: string                       // "YDS" | "TKL" | "SCK" | "INT"
      rows: [
        {
          rank: integer
          person_id: string              // "PERS_00013332"
          display_name: string           // "Jaylan Bean"
          position: string               // "WR"
          class_year: "FR" | "SO" | "JR" | "SR" | "GR" | null
          team_id: string
          image_url: string | null
          game_path_id: string           // "gsuaamu26"
          opponent_team_id: string | null
          opponent_name: string | null           // outside opponents only
          opponent_short_name: string | null     // outside opponents only
          home_away: "home" | "away" | "neutral"
          result: "W" | "L"
          score: string                  // "61-31", the player's team first
          value: number                  // 240
          // the category's row fields from the table above, e.g. for receiving:
          receptions: integer
          touchdowns: integer
          long: integer | null
        }
      ]
    }
  ]
}
```

---

## 2. Season leaders

### Request

```text
GET stats/leaders/{season}/season.json
```

### Response

```text
{
  season: integer
  generated_at: ISO-8601
  games_through: { week: integer, label: string } | null   // null once the season is over
  scope: string
  categories: [
    {
      id, side, label, unit                                // as in §1
      rows: [
        {
          rank: integer
          person_id: string
          display_name: string
          position: string
          class_year: "FR" | "SO" | "JR" | "SR" | "GR" | null
          team_id: string
          image_url: string | null
          games: integer
          value: number                  // season total
          per_game: number               // value / games, 1 decimal
          best_game: { value: number, opponent_team_id: string | null, opponent_short_name: string | null, week: integer }
          // the category's row fields from the table above, as season totals
        }
      ]
    }
  ]
}
```
