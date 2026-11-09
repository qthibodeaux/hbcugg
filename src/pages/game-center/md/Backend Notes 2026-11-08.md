# Backend Notes: 2026-11-08

**Re:** PAR on the Week Recap's top performers (`Week Recap Fetch Contract.md`, `performance_set`). Follows `RESPONSE_par_cards.md`.

### 1. `par` on the recap's top performers

The Week 10 recap file ranks its ten performers by PAR (Thompson 42.53, Sparrow 38.49, Frye 37.68, and so on), but each player still carries only the old `production` score (22.96, 21.0, 26.85). The poster prints the number the file gives it, so the list reads out of order. We want the poster to show PAR, the number the list is ranked by.

### Request

```text
GET game-center/week-recap/{season}/{week}.json    (unchanged)
```

### Response: one new key on every player in `items[kind=performance_set].data.players[]` and `.data.next[]`

```text
par: number   // the player's game PAR, the figure the set is ranked by (par_card / par_leaders)
```

- **Same figure** as `par_leaders[].par` in the hub for the same player and week.
- **Keep `production`** for now; the poster reads `par` when it is there and falls back to `production` when it is not.
- **Order unchanged:** players and next stay in rank order, now ranked and printed on the same number.

### 2. Explosive yards, per team

The Drives & Situations poster shows each offense's explosive plays as a count and the yards they gained. The game file has the counts (`advanced_team[team].explosive_plays`, `explosive_pass_plays`, `explosive_rush_plays`) but not the yards.

### Request

```text
GET game-center/games/{season}/{game}.json    (unchanged)
```

### Response: three new keys in `advanced_team[team_id]`

```text
explosive_yards: integer        // yards gained on the team's explosive plays (the same plays explosive_plays counts)
explosive_pass_yards: integer
explosive_rush_yards: integer
```

### 3. Week recap "Won It Anyway": one decimal, with its sign

Week 10's item reads `stat.display: "6"` and "Grambling was 6 points better in success rate", but the same file's `games[]` has UAPB's `net_success_edge` at -0.0563. The tile now prints -5.6 from `games[]`; the sentence still says 6.

### Request

```text
GET game-center/week-recap/{season}/{week}.json    (unchanged)
```

### Response: `items[]` where `kind: "game_result"`

```text
stat.display: string   // the winner's net success edge in points, one decimal, signed: "-5.6"
headline: string       // the same number in the sentence: "Grambling was 5.6 points better in success rate"
```
