# Player Stats & Advanced Tabs — Build Inventory (2026-08-21)

Frontend handoff spec for the **Stats** and **Advanced (Analytics)** tabs on the player page, alongside the existing **Bio** tab. Organizing rule: **Stats = what happened** (descriptive, volume, trend). **Advanced = how well, adjusted for what** (conditional, relative, contextual, comparative).

Field paths below are verified against a live game file (`90-Output/2025/alcfamu25.json`) as of this date, not recalled from memory. Where a stat requires new aggregation logic, that's called out explicitly — don't assume everything here is a straight field lookup.

### Status legend
- ✅ **ready** — field exists exactly as named, already computed, per-game
- 🚧 **needs aggregation** — raw pieces exist (usually at play level), but no script currently rolls them up into this specific stat
- ❌ **unbuilt** — concept only, no underlying computation exists; needs design + build before frontend can consume it

---

## Known overlap with Bio — resolve before building

The current Bio mock already shows **PAR by Game** (bar chart) and **Production Field Map** (deep/med/short × L/M/R grid). Both duplicate content proposed below (PAR trend on Stats, lane/direction breakdown on Advanced). Decide: does Bio keep a teaser (one spotlighted game / mini snapshot) while Stats/Advanced hold the full interactive version, or do these move off Bio entirely? Not resolved yet — flagging so it isn't built twice with no stated difference.

---

## STATS TAB

### 1. Headline snapshot row
GOP-style value + inline conference rank (e.g. `+0.54 #30`), 3-4 marquee numbers, position-dependent (e.g. QB: total yards, TDs, PAR-equivalent; RB: rush yards, YPC, TDs).

| Element | Source | Status |
|---|---|---|
| Raw counting totals | `individual_stats.{team}.{category}.{player_id}` — direct fields (see §4) | ✅ ready |
| Conference rank of each headline stat | needs a ranking pass over all players in a category for the season | 🚧 needs aggregation |

### 2. Production grid (season / career toggle)
Full counting-stat grid per category, matching the fields already parsed:

| Category | Fields | Status |
|---|---|---|
| Rushing | `attempts, yards, touchdowns, fumbles` | ✅ ready |
| Passing | `attempts, completions, yards, touchdowns, interceptions, sacks_taken, sack_yards_lost` | ✅ ready |
| Receiving | `targets, receptions, yards, touchdowns, fumbles` | ✅ ready |
| Defense | `tackles, solo_tackles, assisted_tackles, sacks, tfl, interceptions, forced_fumbles, passes_defended` | ✅ ready |
| Kicking | `fg_attempts, fg_makes, fg_long, pat_attempts, pat_makes` | ✅ ready |
| Punting | `attempts, gross_yards, long, inside_20, touchbacks` | ✅ ready |
| Returns | `attempts, yards, touchdowns` | ✅ ready |
| Season totals | sum of per-game `individual_stats` across a player's games | 🚧 needs aggregation (per-player season rollup not yet built — currently only team-season rollups exist) |
| Career totals | sum across seasons via `career_profiles.json` player_key linkage | 🚧 needs aggregation |

### 3. Role / usage (raw share — descriptive half of "role within team")
| Element | Source | Status |
|---|---|---|
| Carry share, target share, snap share | needs play-participant counts ÷ team play counts, by game | ❌ unbuilt |

### 4. Game log
Per-game row table — direct read of `individual_stats` per game, one row per game played. All fields in §2 available per row already. Toggleable extra columns pull from the per-category split fields (red_zone_*, third_down_*, pressure_*, short/medium/deep_*) — see Advanced §2 for the full split-field list, since these are the same underlying data just exposed on demand here.

### 5. Charts
| Chart | Source | Status |
|---|---|---|
| Production bar chart (per-game, e.g. yards or a composite) | direct per-game field(s) | ✅ ready |
| Percentile trend line (season) | needs percentile-vs-position-group computed per game | 🚧 needs aggregation |
| Chart builder (pick-your-metric plotting) | any counting stat already ✅; mixing counting + rate stats on one axis needs normalization — constrain to one scale at a time or auto-percentile | 🚧 needs aggregation + UI constraint |

---

## ADVANCED TAB

### 1. Percentile radar profile
GOP's team-radar pattern, rebuilt on player-level, position-specific axes (mirrors GOP's team radar but swaps in our differentiators):

| Axis (example, RB) | Source | Status |
|---|---|---|
| Opportunity rate | `opportunity_carries / attempts` | ✅ ready (needs season sum) |
| Explosive rate | `(explosive_carries_10 + explosive_carries_20) / attempts` | ✅ ready (needs season sum) |
| Stuffed rate | `stuffed_carries / attempts` | ✅ ready (needs season sum) |
| Power success rate | `power_successes / power_attempts` | ✅ ready (needs season sum) |
| Called-upon share (see §3) | — | ❌ unbuilt |
| Opponent-adjusted production (see §4) | — | ❌ unbuilt |

### 2. Situational splits table (the "how well, adjusted" version of Stats §4's toggle columns)
Already computed per-game, per player, per category — just needs season summing and presentation:

| Category | Situational fields already in `individual_stats` |
|---|---|
| Rushing | `red_zone_attempts/yards/touchdowns`, `goal_line_attempts/touchdowns` |
| Passing | `red_zone_attempts/completions/yards/touchdowns`, `third_down_attempts/completions`, `pressure_attempts/completions/yards` |
| Receiving | `red_zone_targets/receptions/yards/touchdowns`, `third_down_targets/receptions`, `first_down_receptions` |
| Defense | `third_down_stops`, `clutch_stops`, `sacks_third_down`, `tfl_third_down`, `red_zone_disruptions/sacks/ints/tfl/passes_defended` |

Status: ✅ ready per-game, 🚧 needs season aggregation.

**Not yet joined to these:** the play-level situational taxonomy tags (`enriched.derived`: `money_down`, `third_and_short/medium/long`, `standard_down`, `passing_down`, `early_down`, `late_down`, `middle_8`; `enriched.game_situation`: `is_garbage_time_sp_plus`, `is_competitive_time`) are computed per-play but never rolled up to a per-player subset. That join is what's needed for called-upon share below — ❌ unbuilt, this is the real gap.

### 3. Called-upon share + efficiency-when-called-upon
Not a usage-rate copy — conditioned on real situational buckets we already tag (early-down, standard-distance, money-down, non-garbage-time).

| Element | Status |
|---|---|
| Share of situational-bucket plays run through this player | ❌ unbuilt — needs play-participant × `enriched.derived` join, described above |
| Performance rate on that subset (success rate, YPA, etc.) with min-sample gating | ❌ unbuilt — same join, plus a sample-size floor before showing a rate |

### 4. Opponent-adjusted production (context/matchup)
| Element | Source | Status |
|---|---|---|
| Per-game opponent strength | `formula1_ridge_panel.py`'s `compute_strength_faced()` computes this internally (`as_of_rating` dict, keyed by team+date) but currently discards it after averaging into a season-long number | 🚧 needs aggregation — expose the per-game value instead of throwing it away, then join to the player's game log by date |

### 5. Pocket-management / sack accounting (QB-specific)
| Element | Status |
|---|---|
| Sacks split into own category, off completion%/YPA | 🚧 needs aggregation — `sacks_taken`/`sack_yards_lost` already exist on `passing`, just never separated out as a standalone display category from the rest of the QB's line |

### 6. Player-level havoc / disruption score (defenders)
| Element | Source | Status |
|---|---|---|
| Havoc rate (TFL + sacks + FF + PBU, forced) | team-level version exists (`havoc_rate_forced`/`havoc_rate_allowed` in `team_season_rollup.py`); player-level components (`tfl`, `sacks`, `forced_fumbles`, `passes_defended`) already sit on `individual_stats.defense` per game | 🚧 needs aggregation — no player-level havoc formula built yet, but every input field already exists |

### 7. Production field map (lane / direction breakdown — advanced version)
| Element | Source | Status |
|---|---|---|
| Rush lane grid (L/M/R × attempts/yards) | `rush_heat_map` (left/middle/right) | ✅ ready |
| Pass direction grid (9-zone: short/medium/deep × L/M/R) | `pass_heat_map` | ✅ ready |
| Receiving direction breakdown | `direction_breakdown` (short/medium/deep) on `receiving` | ✅ ready |

### 8. Component breakdown chart (per-game stacked)
Adapts StatCards' stacked-bar decomposition, but sliced by our taxonomy instead of passing/rushing/turnover.

| Element | Status |
|---|---|
| Per-game production sliced into standard-down / money-down / garbage-time | ❌ unbuilt — same join as §3 |

### 9. Development / trajectory
| Element | Source | Status |
|---|---|---|
| Multi-season career link, transfer flag | `career_profiles.json` (`transfer_detected`, `name_collision`, multi-season records, keyed by `player_key` union-find groups) | ✅ ready |
| Role/usage change over time | depends on §3 being built first (need called-upon share history to show a real trend, not just raw stat trend) | ❌ unbuilt (blocked on §3) |
| Coaching-continuity overlay (did a scheme/staff change coincide with a production shift) | `team_trajectories.json` has coaching-continuity signals at team level already | 🚧 needs aggregation — join is team-level data onto a player timeline, not yet done |

### 10. Compare tool
Not tier-specific — should attach as a toggle to whatever view (Stats or Advanced) the user is already on, not live only under Advanced. Underlying data for both raw and adjusted comparison already covered by everything above; the only new work is the UI overlay itself, not new stats.

### 11. Position-specific modules
| Position | Element | Status |
|---|---|---|
| Kicker | `fg_by_range` (u30/30_39/40_49/50p splits) | ✅ ready |
| Punter | `inside_20`, `inside_10`, `touchbacks`, `blocked` | ✅ ready |
| OL/DL | no individual stats exist in play-by-play for either position (not a gap — football doesn't generate this data); would need to borrow team-level pass-pro/run-block context (`havoc_rate_allowed`, opportunity/stuffed rates on the O-line side) | ❌ unbuilt, and partially unbuildable at the individual level |

---

## Priority read for the frontend build

**Build now (✅ ready, straight field reads):** production grid, game log, rush/pass heat maps, situational split raw values (red-zone/third-down/pressure per category), FG-by-range, career/transfer linkage.

**Needs a backend aggregation pass before frontend can consume (🚧):** season/career per-player rollups (doesn't exist yet — only team-season rollups do), conference ranking pass, percentile-vs-position-group, player-level havoc formula, exposing per-game opponent strength from Formula 1, sack-accounting split-out.

**Needs real design + build work, not just aggregation (❌):** the play-participant × situational-taxonomy join (unlocks called-upon share, efficiency-when-called-upon, and the component-breakdown chart — all three block on this one join), carry/target/snap share, role-change trajectory.
