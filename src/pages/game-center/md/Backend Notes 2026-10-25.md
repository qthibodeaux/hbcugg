# Backend Notes — 2026-10-25

**Re:** the Week Recap ("How Saturday Was Won"), `Week Recap Fetch Contract.md`. Week 8 looks great. One ask: more variety in the 12 tiles.

### 1. Fewer repeats in the tiles

Week 8's 12 tiles have four "Performance of the Day" cards (209, 20.6, 18.2, 156). BCU 24-21 JSU also shows up in four tiles: The Swing, The Series, Down to the Wire, and Underdogs Won. Please add a repeat weight when ranking `items[]` for the tile grid:

- **Same kind:** each extra tile of a `kind` already picked scores lower. Cap `performance` at 2 tiles.
- **Same game:** each extra tile from a `game_path_id` already picked scores lower. Aim for at most 2 tiles per game.
- **Already on the board:** a player who's in Top Performers (`performance_set`, ranks 1–10) shouldn't get a "Performance of the Day" tile too. This week Jefferson (#4, 20.6) and James (#5, 18.2) are in both places.
- **Losing effort:** a "Performance of the Day" from a loss ("in a 24-21 loss at TSU") scores lower than one from a win. Keep it only when the number is a standout, like a record-book line.

The tile kinds themselves don't change. Only the scoring and the cap do.

### Request

```text
GET game-center/week-recap/{season}/{week}.json    (unchanged)
```

### Response

```text
items[]: unchanged shape. The tiles (items that aren't performance_set, record_book or race)
         come out already ranked with the repeat weights applied, 12 or more of them:
  - at most 2 with kind "performance"
  - at most 2 sharing one game_path_id
  - no "performance" for a person_id that's in performance_set
  - "performance" in a loss ranked below wins unless it's a standout
```

---

### 2. Standings finish matrix: last week's numbers

The finish matrix export will show each team's weekly move in its chance to finish first (▲6 / ▼3, in percentage points). The page compares this week's `values` with last week's, so it needs last week's row alongside it. Nothing is worked out on the page; the arrows only draw once this field ships.

### Request

```text
GET game-center/standings/standings_race_{season}.json    (unchanged)
```

### Response — one new field on each `groups[group].finish_matrix[]` row

```text
{
  team_id: string
  current_rank: integer
  values: []number
  controls_destiny: boolean
  values_prev_week: []number | null   // the same row as it stood after last week's games; null in Week 1 or for a team with no conference game yet
}
```

- **Same shape:** the same slot order and the same scale as `values` (percent, one decimal).
- **Previous week:** the run as it stood before the most recent week's games, not the preseason run.
