# Backend Notes: 2026-11-03 (b)

**Re:** the pass-defense poster "Who they throw at" (`RESPONSE_pass_defense_charts.md`, §3 Receiver matchups). The poster draws one bar per defense: its length is the passing yards the defense allows per game, split into what WR, TE and RB targets gained against it. Target share can't split yards (backs gain fewer yards per target than receivers), and the page doesn't rebuild yards from share × yards per target ÷ games. It needs the yards per game by group.

### Request

```text
GET stats/production/receiving/{season}.json    (unchanged)
```

### Response: new fields in `teams[team_id].defense[scope]` and `league.defense[scope]`

```text
wr_yards_allowed_per_game:    { value: number, n: integer, rank: integer|null, tied: bool }   // receiving yards gained by opponents' WR targets ÷ games
te_yards_allowed_per_game:    { ... }
rb_yards_allowed_per_game:    { ... }
other_yards_allowed_per_game: { value: number, n: integer }   // other-position plus unidentified targets
pass_yards_allowed_per_game:  { value: number, n: integer, rank: integer|null, tied: bool }   // the four above summed
```

- **Both scopes,** `all` and `competitive`. The poster uses `competitive`.
- **The four group values add up to `pass_yards_allowed_per_game`,** so the bar segments fill the bar exactly.
- **Same games** as the rest of the defense block (the denominator is `teams[id].games` for that scope). Say if it's a different count.
- **`n`** = the targets behind each value.
- **Rank:** 1 = fewest yards allowed. Published only where the sample qualifies, like the other fields.
- **`league.defense[scope]`:** the same fields, pooled across all 18 programs, for the dashed average line.
