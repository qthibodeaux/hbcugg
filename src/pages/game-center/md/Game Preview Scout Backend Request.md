# Game Preview Scout — Backend Request

**Date:** 2026-10-10 · **File:** `game-preview/{season}/{game_id}.json`
**Updated:** 2026-10-10 — unit matchups now read EPA / play, success rate, havoc rate, explosive %, red-zone TD %. `havoc_rate` is new; `sack_rate` is no longer requested.
**Spec:** the Scout addendum in [Game Preview Fetch Contract.md](Game%20Preview%20Fetch%20Contract.md) (2026-10-07). This is the request to ship it.

## Request

Add to every preview file, for both teams:

### 1. `stats.teams[team_id].fields` — `{ value, rank }`, 1 = best, rank of 18

```text
o_ppg  d_ppg                 points per game, points allowed per game
to_margin                    takeaways − giveaways (season total)
o_turnovers                  giveaways (season total)
pen_ypg                      accepted penalty yards per game
o_ypg                        total yards per game
o_pass_ypg  o_rush_ypg       passing / rushing yards per game
o_havoc_rate  d_havoc_rate   offense: havoc rate it allowed (lower is better)
                             defense: havoc rate it created (higher is better)
o_expl_rate  d_expl_rate     explosive play rate
o_rz_td  d_rz_td             red-zone TD rate
```

`havoc_rate` = (TFL + sacks + forced fumbles + INTs + pass breakups) ÷ plays. Rank 1 = best for each side.

Ranks are required on every one, including the yards and points fields.
Values must agree with `stats/counting/` and `stats/team-analytics/`.

### 2. `away` / `home` — `coaches`

```text
coaches: { head_coach, offensive_coordinator, defensive_coordinator }   // string | null
```

### 3. `away` / `home` — `quarterback`

```text
quarterback: {
  person_id, name, last_name, image_url, games_played,
  line: { cmp, att, yds, td, int, sacks },
  air_yards: {
    attempts, adot,
    bins:        []{ yards, share },   // −5 … 30, 1-yard bins, 30 = 30+
    league_bins: []{ yards, share },
    deep_30_share, league_deep_30_share
  } | null
} | null
```

### 4. `top_players[team_id]` — eight per team, by season production

```text
{ person_id, name, position, production_score, production_per_game, last_name, image_url }
```

## Response

Same file, same path. Nothing existing changes. `null` where a value does not exist; the page prints a dash.
