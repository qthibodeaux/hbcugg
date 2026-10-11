# Stats Hub — Card, Vocabulary & Correlation Inventory

**Created:** 2026-09-02
**Purpose:** The full design space for the Stats Hub — every card we can imagine, every entity and metric we'd want, every correlation and visualization worth building. **This is the document we hand the backend.** Our job was to design the ambition; theirs is to tell us what the data and taxonomy can actually support.
**Companion docs:** [Stats Hub Design Doc.md](../src/pages/stats/md/Stats%20Hub%20Design%20Doc.md) §8–9 (the concept and the decision record), [PLAYER_STATS_ADVANCED_INVENTORY_2026-08-21.md](../inspo/inventory/PLAYER_STATS_ADVANCED_INVENTORY_2026-08-21.md) (the player-side equivalent).

---

## 0. How to read this

Nothing here is filtered for feasibility. That was deliberate — the instruction was to build out the possibilities and let the backend answer what's reachable. Status markers are the frontend's **current** read, not a verdict:

- ✅ **built** — a working card exists in the demo today, on real data
- 🟢 **buildable now** — every input is already on disk
- 🟡 **needs a rollup** — inputs exist at play/game level, nothing aggregates them
- 🔴 **needs new computation** — a model, a classifier, or a join that doesn't exist
- ⚪ **needs new data** — not derivable from anything we currently receive

**Backend: the useful reply is per-row — which of 🟡/🔴/⚪ are cheap, which are expensive, and which are impossible.** Anything you can promote to 🟢 we will build.

---

## 1. The organizing rule

> **Rankings are answers; relationships are questions.**

A leaderboard names who is first and the conversation ends. Every card in this inventory is a *relationship*, a *correlation*, or an *anomaly* — something that ends in "wait, why?" and hands the reader a door. Counting stats are the evidence layer underneath, not the lead.

**And: 18 teams is an advantage.** Comparable sites carry ~130 FBS teams and are forced to truncate — top 25, scroll for more. We never truncate. The full league fits one view, all 324 pairwise relationships are trivially computable, and network structures stay readable. Several cards below exist *only* because the league is small.

---

## 2. Entity & vocabulary inventory

### 2.1 Entities we can build cards about

| Entity | Grain | Have today | Notes |
|---|---|---|---|
| Team | season | ✅ | 18 teams × 6 seasons (2019, 2021–2025). **2020 is absent from every export** |
| Team | game | 🟡 | per-game files exist; no team-game rollup table |
| Team | week | ⚪ | needed for all movement/trend cards |
| Team pair | season | 🟢 | derived — 153 unique pairs |
| Player | season | ✅ | 2025 only (1,054 with production) |
| Player | game | ✅ | `games[]` in enriched stats |
| Player | career | 🟡 | `career_profiles.json` exists, not joined |
| Position group | season | 🟢 | derivable by grouping |
| Conference / division | season | 🟢 | derivable |
| League | season | ✅ | `league_avg_{y}.json` |
| Game | single | ✅ | schedule + results |
| Matchup | pair | 🟡 | needs head-to-head assembly |
| Coach | season | 🟡 | `coaches_2021_2025_frontend_ready.json` |
| Classic / event | game | ⚪ | `event: { kind, name }` specced on schedule payloads; not surfaced on stats |
| Drive | single | ⚪ | exists in play data, never rolled up |
| Play situation | tagged | 🟡 | `enriched.derived` tags exist per play, never aggregated to team-season |

### 2.2 Metric vocabulary — what we have

Ten rate metrics, offense and defense, per team-season:

```
rushing:  successRate · opportunityRate · stuffRate · stopRate · powerStopRate · tflRate
passing:  completionRate · explosiveRate · pressureRate · ypa
```

Plus: `par` / `total_production` / `avg_production` / `season_components` per player (passing, rushing, receiving, hit, hawk, scrum), and wins/losses/streak/last5/conference record per team.

### 2.3 Metric vocabulary — what we want

| Metric | Why | Status |
|---|---|---|
| **EPA/play** — offense, defense, net | The spine of every comparable site. Exists per-play as `play_advanced.epa`; nothing rolls it to team-season | 🟡 **highest value single item** |
| Success rate — overall (not just rushing) | Currently rushing-only; the passing half is missing | 🟡 |
| Points per drive / drive efficiency | Drive-level outcomes | ⚪ |
| Havoc rate (forced + allowed) | Team-level formula exists in `team_season_rollup.py` | 🟡 |
| Sack rate forced / allowed | Pass Defense + Pass Protection concepts both blocked without it | 🟡 |
| Line yards / highlight yards | Run Blocking concept | 🟡 |
| Field position / hidden yardage | Special teams value | 🟡 |
| Red zone efficiency | Situational | 🟡 |
| Third-down conversion | Situational | 🟡 |
| Turnover margin / turnover luck | Anomaly cards depend on it | 🟡 |
| Opponent-adjusted versions of all of the above | Removes schedule illusion | 🔴 |
| Garbage-time-excluded splits | `is_garbage_time_sp_plus` / `is_competitive_time` tagged per play | 🟡 |
| Pace / plays per game | Style classification | 🟡 |
| Explosiveness (rushing) | Only passing explosive rate exists | 🟡 |
| Expected wins (Pythagorean or efficiency) | Over/underperformance cards | 🔴 |
| Strength of schedule | Context on every other number | 🔴 |
| Team style cluster assignment | League Map quadrants | 🔴 |
| Pairwise team similarity | Statistical Twins | 🔴 (we compute a version client-side today) |
| Win-correlation coefficients | The Win Levers | 🔴 (we compute this today — see §5) |

### 2.4 Play-type and situational splits — the deep taxonomy

**This is the biggest single expansion available to us, and it's mostly a rollup, not new collection.** The per-play data already carries these breakdowns (confirmed in the player inventory: `depth_breakdown`, `direction_breakdown`, `pressure_breakdown`, `red_zone_breakdown`, `third_down_breakdown`, plus `enriched.derived` situational tags). None of it is aggregated to team-season, so the Chart Builder can currently only offer 20 axes when it should offer well over a hundred.

Every row below wants **attempts AND success rate AND yards** as separate axes — the pairing is what makes a chart interesting ("power run attempts vs power run success rate" says something about identity *and* execution that neither number says alone):

| Split family | Buckets | Example axis pair |
|---|---|---|
| **Pass depth** | screen · short · medium · deep | Screen usage rate × screen success rate |
| **Pass direction** | left · middle · right | Deep-left attempts × deep-left success |
| **Pass pressure** | clean pocket · pressured | Pressured attempts × pressured completion rate |
| **Run type** | power · zone · outside · draw | Power run attempts × power run success rate |
| **Run direction** | left · middle · right | Middle attempts × middle stuff rate |
| **Down** | early · late · money down | Money-down attempts × money-down conversion |
| **Distance** | short · medium · long | 3rd-and-short attempts × conversion rate |
| **Field zone** | own territory · midfield · red zone · goal line | Red zone attempts × red zone TD rate |
| **Score state** | leading · tied · trailing | Trailing pass rate × trailing success |
| **Game state** | competitive · garbage time | Competitive-only versions of *every* metric above |
| **Tempo** | huddle · no-huddle | No-huddle usage × no-huddle success |
| **Personnel** | if tagged | Heavy-set run rate × success |

**Why this matters more than one more headline metric:** a Chart Builder with 20 axes produces ~190 possible pairs, most of them uninteresting. With ~120 axes it produces thousands, and the *specific* ones — screen usage vs passing success, power attempts vs power success — are where identity actually lives. This is the difference between a tool people use once and one they keep coming back to.

---

## 3. The card inventory

### 3.A League-level — what the league *is*

| # | Card | Claim | Viz | Status |
|---|---|---|---|---|
| A1 | **Win Levers** | Which metrics actually predict winning in this league | correlation_bars | ✅ **built** |
| A2 | **Dead Metric** | A widely-quoted stat with ~zero predictive value | dumbbell | ✅ **built** |
| A3 | **League Map** | All 18 teams in identity space, league-average crosshair | scatter_map | ✅ **built** |
| A4 | **Metric of the Week** | One metric explained + full league spread | distribution | ✅ **built** |
| A5 | **League Parity** | Is this season tight or top-heavy, vs history | season_trend | ✅ **built** |
| A6 | **Conference Gap** | Where SWAC and MEAC separate most | conference_split | ✅ **built** |
| A7 | **League Drift** | How the league itself changed year over year (more passing? more havoc?) | multi-line | 🟢 |
| A8 | **Metric Relationship** | Two metrics plotted against each other — do they travel together? | scatter + fit line | 🟢 |
| A9 | **Correlation Matrix** | Every metric against every other, heat grid | heat_matrix | 🟢 |
| A10 | **The Replacement Baseline** | What "average" actually looks like, made concrete | annotated bar | 🟢 |
| A11 | **Style Census** | How many teams play each way | stacked bar | 🔴 needs clusters |
| A12 | **Era Comparison** | 2025 league vs 2019 league on identical axes | paired scatter | 🟢 |
| A13 | **Volatility Index** | Which metrics swing most week to week | ranked bars | ⚪ needs weekly |
| A14 | **Predictability** | How well do metrics predict *next* game vs *this* season | correlation_bars | 🔴 |

### 3.B Team identity — what a team *is*

| # | Card | Claim | Viz | Status |
|---|---|---|---|---|
| B1 | **Team Fingerprint** | Most distinctive profile in the league | radar | ✅ **built** |
| B2 | **Statistical Twins** | Two teams nearly identical, different records | twin_radar | ✅ **built** |
| B3 | **Team Extreme** | League-most on a single metric | distribution | 🟢 |
| B4 | **Polar Opposites** | Two teams maximally *different* | twin_radar | 🟢 |
| B5 | **Unit Split** | Elite one side of the ball, poor the other | delta_bars | 🟢 |
| B6 | **The Balanced Team** | Above average at everything, elite at nothing | radar | 🟢 |
| B7 | **One-Dimensional** | Elite at exactly one thing, average elsewhere | radar | 🟢 |
| B8 | **Identity Shift** | Team that changed style year over year | paired radar | 🟢 |
| B9 | **Style Family** | Teams sharing a play-style cluster | cluster map | 🔴 |
| B10 | **Roster-to-Results** | Does roster composition predict style? | scatter | 🟡 |
| B11 | **The Outlier Unit** | One unit far ahead of the rest of the team | radar + callout | 🟢 |
| B12 | **Coaching Fingerprint** | Does a coach's team look the same across stops? | multi-radar | 🟡 |

### 3.C Anomaly — "doesn't add up"

| # | Card | Claim | Viz | Status |
|---|---|---|---|---|
| C1 | **Record Ahead of Profile** | Winning more than the numbers say | delta_bars | ✅ **built** |
| C2 | **Profile Ahead of Record** | Better than their record — breakout candidate | delta_bars | ✅ **built** |
| C3 | **Close-Game Luck** | Record in one-score games vs everywhere else | split bars | 🟡 |
| C4 | **Turnover Luck** | Margin above/below expectation | delta_bars | 🟡 |
| C5 | **Schedule Illusion** | Numbers inflated by a soft slate | adjusted vs raw | 🔴 |
| C6 | **Hidden Contender** | Bad record, strong underlying profile | radar + record | 🟢 |
| C7 | **Paper Tiger** | Good record, weak underlying profile | radar + record | 🟢 |
| C8 | **The Anomaly Game** | One result that doesn't fit the team's season | game_curve | 🟢 |
| C9 | **Metric Contradiction** | Team elite in one metric, awful in a correlated one | dumbbell | 🟢 |
| C10 | **Regression Watch** | Who's most likely to fall, with the reason | delta_bars | 🔴 |
| C11 | **Did We Really Get Beat That Bad?** | Scoreboard margin against net success rate, every game in a week. A 30-point loss where you won the success-rate battle is a completely different story from a 30-point loss where you didn't — and the scoreboard alone can't tell them apart | signed bars, one per game, winner minus loser, logos at the baseline | 🟡 **built on a proxy** — `/team-analytics?tab=week` |
| C12 | **Closer Than The Score** | Inverse framing — games that looked competitive but weren't | delta_bars | ⚪ same rollup |
| C13 | **Week Net Efficiency** | Every game in a week ranked by net success rate, not margin | ranked bars | ⚪ same rollup |

### 3.D Movement — the season as a story

| # | Card | Claim | Viz | Status |
|---|---|---|---|---|
| D1 | **Rising / Falling** | Biggest week-over-week movers | slope chart | ⚪ needs weekly |
| D2 | **The Transformation** | Most changed since week 1 | paired radar | ⚪ |
| D3 | **Peak Form** | Team at its season best right now | line + marker | ⚪ |
| D4 | **Trajectory Cross** | Two teams whose trend lines crossed | dual line | ⚪ |
| D5 | **Season Arc** | One team's whole season shape | game_curve | 🟢 |
| D6 | **Streak Context** | The numbers behind a hot streak | line + annotation | 🟢 |
| D7 | **Bump Chart** | Rank movement over the season, all 18 | bump | ⚪ |
| D8 | **Early vs Late** | First half of season vs second | dumbbell | 🟡 |

### 3.E Relationship & matchup

| # | Card | Claim | Viz | Status |
|---|---|---|---|---|
| E1 | **The Thread** | Transitive chain — you beat X who beat Y who beat you | chain/network | 🟢 |
| E2 | **Upcoming Mismatch** | Biggest statistical gap in this week's slate | twin_radar | 🟢 |
| E3 | **Style Clash** | Contrasting identities meeting this week | twin_radar | 🔴 needs clusters |
| E4 | **Matchup Edge** | Where one team's strength meets the other's weakness | opposed bars | 🟢 |
| E5 | **Common Opponent** | How two teams fared against the same foe | dumbbell | 🟢 |
| E6 | **Rematch Delta** | What changed since they last played | paired radar | 🟢 |
| E7 | **Head-to-Head History** | Series record with the numbers | timeline | 🟢 |
| E8 | **Circle of Parity** | The full loop, visualized | network | 🟢 |
| E9 | **Nearest Rival** | Closest team in profile *and* standings | twin_radar | 🟢 |

### 3.F HBCU-specific — **nobody else can build these**

| # | Card | Claim | Viz | Status |
|---|---|---|---|---|
| F1 | **Classic Performance** | Who shows up in Classics | split bars | ⚪ needs event flags |
| F2 | **Homecoming Effect** | Home-cooking advantage, measured | dumbbell | ⚪ |
| F3 | **Rivalry Numbers** | Do rivalry games play differently? | distribution | ⚪ |
| F4 | **Celebration Bowl Path** | Projected path by the numbers | bracket/path | 🟡 |
| F5 | **Conference Crown Race** | Title race framed statistically | bump | 🟡 |
| F6 | **SWAC vs MEAC H2H** | Cross-conference results vs profiles | scatter | 🟢 |
| F7 | **The Classic Slate** | Statistical preview of the marquee games | multi-card | ⚪ |
| F8 | **Big-Game Split** | Performance in high-stakes vs routine games | dumbbell | ⚪ |

### 3.G Player — statistical framing, not editorial

| # | Card | Claim | Viz | Status |
|---|---|---|---|---|
| G1 | **Production Leader** | PAR leader with league context | rank_bars | ✅ **built** |
| G2 | **Component Specialist** | Dominant in exactly one production phase | radar | 🟢 |
| G3 | **Balanced Producer** | Spread across phases | radar | 🟢 |
| G4 | **Usage vs Efficiency** | Volume against rate — who's efficient at scale | scatter | 🟢 |
| G5 | **Player Carrying** | One player as a share of team production | donut | 🟢 |
| G6 | **Positional Scarcity** | Which position groups are thin league-wide | distribution | 🟢 |
| G7 | **Freshman Impact** | Young production against the league | rank_bars | 🟢 |
| G8 | **Transfer Delta** | Portal impact, measured | dumbbell | 🟡 |
| G9 | **Position Group Map** | All players at a position in 2-metric space | scatter | 🟢 |
| G10 | **Replacement Level** | What PAR = 0 actually means, made concrete | annotated bar | 🟢 |
| G11 | **Workload Curve** | Usage across a season | line | 🟢 |
| G12 | **Player vs Team Fit** | Does the player's style match the team's? | twin_radar | 🔴 |

### 3.H Evidence layer — counting stats

Explicitly **not** the lead, but they back every drill-in and own the Leaders pages.

| # | Card | Claim | Viz | Status |
|---|---|---|---|---|
| H1 | **Team Totals** | Season counting stats, all 18 | table | 🟡 13/18 in 2025 |
| H2 | **Counting Leader** | Raw totals leader | rank_bars | 🟡 |
| H3 | **Milestone Watch** | Approaching a round number | progress | 🟡 |
| H4 | **Per-Game Normalization** | Totals adjusted for games played | table | 🟡 |
| H5 | **Rate vs Volume** | Counting stat against its rate equivalent | scatter | 🟡 |

---

## 4. Visualization inventory

| Viz | Built | Best for | Notes |
|---|---|---|---|
| `correlation_bars` | ✅ | Signed relationships | Diverging from a centre line — the sign *is* the message |
| `scatter_map` | ✅ | All-league identity space | League-average crosshair makes quadrants |
| `distribution` | ✅ | League spread on one metric | Every team as a column, leader emphasized |
| `dumbbell` | ✅ | Two values compared | |
| `delta_bars` | ✅ | Actual vs expected | |
| `radar` | ✅ | Multi-axis profile | Percentile-scaled; width-capped or labels blow up |
| `twin_radar` | ✅ | Two profiles overlaid | Same geometry, two series |
| `conference_split` | ✅ | SWAC vs MEAC | |
| `season_trend` | ✅ | One value across seasons | |
| `rank_bars` | ✅ | Ordered comparison | Vertical — shares width better |
| `heat_matrix` | | Metric × metric correlation | |
| `slope_chart` | | Two points, change between | |
| `bump_chart` | | Rank over time, all teams | |
| `network` | | Transitive chains, circle of parity | Only readable at 18 teams |
| `game_curve` | | One entity across a season | Already exists in the People Hub deck |
| `donut` | | Share of a whole | Already exists |
| `box_plot` | | Distribution shape + outliers | |
| `small_multiples` | | 18 sparklines at once | Only possible because the league is small |
| `opposed_bars` | | Matchup — my strength vs your weakness | |
| `bracket_path` | | Postseason projection | |
| `annotated_bar` | | Making a baseline concrete | |
| `state_map` | | Geography | `StateShape` already exists |

---

## 5. What we compute client-side today (and would rather not)

The demo computes these in `scripts/build_stats_hub_cards.js` because they don't exist upstream. **Every one is a candidate to move server-side** — they're league-wide computations that shouldn't be redone in a browser:

1. **Win-correlation coefficients** — Pearson r between each of 20 metric-sides and win %, pooled across 108 team-seasons
2. **Efficiency composite** — weighted z-score across all levers, weighted by each lever's own |r|
3. **Expected win %** — the composite mapped back onto the win-% distribution
4. **Pairwise team distance** — normalized Euclidean across predictive metrics, all 153 pairs
5. **Percentile ranks** — every team against the league on every metric
6. **Parity spread** — standard deviation of win % per season

**Caveats we are carrying openly, and would like backend guidance on:**
- Correlations are **descriptive, not causal**, and **not opponent-adjusted**. A team can post good rates against a soft slate.
- Metric polarity between `team_season_avg` and `team_defense_avg` is **inferred, not documented** (Stats Hub Design Doc §5.1). If the offense file's `stuffRate` doesn't mean "this offense got stuffed," several cards invert.
- 108 team-seasons is a real sample but a small one. Conference-level splits get thin fast.

---

## 6a. STATUS — the 2026 export answers most of this (checked 2026-09-05)

The `public/data/2026/` export landed while this document still read as an open
ask. It is not open any more. Verified by walking the real files, not by reading
a changelog — `game_advanced.team_advanced` carries **661 leaf fields per team
per game**.

| # | Ask | Status | Where |
|---|---|---|---|
| 1 | Team-GAME rollup | **DELIVERED** | `game_advanced.team_advanced.plays.*` — eligible plays, EPA total and per play, success rate (down-distance AND EPA), explosive counts |
| 2 | Play-type & situational splits | **DELIVERED** | `pass_offense` / `rush_offense` / `pass_defense` / `rush_defense`, plus `situational.*` (15), `passing_efficiency_depth.*` (18), `rushing_direction_efficiency.*` (12), `explosive_by_down.*` (24) |
| 3 | EPA | **DELIVERED** | per play at `play_advanced.epa.epa`; per team at `plays.epa_total`; split by stream at `plays.epa_streams.{offense,special_teams,penalty_overlay}` |
| 4 | Event context | **PARTIAL** | `inventory_2026.games[].event_name` on **47 of 145** games (Orange Blossom Classic, MEAC/SWAC Challenge, Labor Day Classic…), plus `game_type`, `is_conference_game`, `is_postseason`. **No homecoming or rivalry flag** — that half of §3.F is still blocked |
| 5 | Opponent adjustment | **NOT DELIVERED** | nothing in the export adjusts for schedule strength. The schedule-illusion caveat stays on every card |

**Also arrived, unasked for and worth using:** `play_advanced.wp.wpa` per play
(win probability added — this was null on all 18,018 plays of 2025, and it
unblocks Most Important Plays and every per-player WPA column);
`rushing_model.power_*` now real values instead of nulls; `sequence_model`
(after takeaway / after own turnover / sudden change); `coaching_profile`
(run-pass by down, halftime adjustment delta, predictability);
`defensive_identity` (disruption rate, explosive prevention, bend-don't-break);
`uncounted_summary`; and `attributes_2026.json`, a per-game archetype tagger
(shootout, slugfest) that carries its own evidence.

**What regressed.** 2025's `heat_maps` binned passes into nine depth x direction
cells. 2026's `passing_efficiency_depth` bins by **depth only**. The direction
survives on each pass action (`targetDirection`), so the 3x3 matrix is rebuilt
from play_by_play in `scripts/build_game_tables.js` — but anyone reading the team
aggregate alone can no longer get it. Worth restoring as an aggregate.

**Still missing, smaller:** xQBR (absent at every level); yards-after-catch (air
yards ARE on the pass action, so aDOT is derivable and YAC is not); team-level
`first_downs` (only countable by scanning play text).

### The real gate is parsing, not fields

```
145 games  ·  14 final  ·  3 parsed        (all of Week 0)
```

Every field above exists **only inside a parsed game file**. Three parsed games
is six team-games, which is not a distribution — it is why the game-tables page
shades percentiles against 2025's 144 team-games instead of this season's.
League-level pages (leaderboards, the stats hub, anything ranking teams) stay
empty until parse coverage catches up, no matter how complete the schema is.
**Ask the backend for a parsing-throughput timeline separately from a fields
timeline. Only the first one gates the stats hub.**

---

## 6. The ask, in priority order

1. **Team-GAME rollup** — every metric we already have at team-season, but per game. Unblocks the entire weekly-narrative family (C11–C13, "Did we really get beat that bad?") and every movement card in §3.D. **Probably the highest-leverage single item**, because it turns a season-summary site into a weekly one — and a weekly site is the one people come back to.
   - **Still the ask, even though C11 now ships.** The Week Review tab is live on a *proxy*: scores and margins are measured, but the success edge is projected from both teams' season profiles (`scripts/build_week_review.js`). Across 2025 that proxy correlates with actual margin at **r = 0.705 over 141 games**, which is strong enough to be worth shipping and nowhere near a measurement. It answers "should this have been close, given who these two teams are?" — not "was this team moving the ball that night?", which is the question the card is named after. A per-game rollup swaps the projection for the real thing without the card changing shape.
   - Second gap the proxy exposes: **only rushing has a true `successRate`**. Passing ships `completionRate` / `explosiveRate` / `ypa`, so pass efficiency is folded in at half weight. A pass success rate would remove that fudge.
2. **Play-type and situational splits rolled to team-season** (§2.4) — screen/short/medium/deep, power/zone, pressured/clean, by down, distance, field zone, score state. Mostly aggregation of tags that already exist per play. Takes the Chart Builder from 20 axes to 120+, which is the difference between a tool used once and one used repeatedly.
3. **Team-season EPA rollup** (offense / defense / net) — unblocks the headline metric on nearly every card
4. **Event context flags on team stats** (classic / homecoming / rivalry) — unblocks §3.F, the section no competitor can copy
5. **Opponent adjustment** — removes the schedule-illusion caveat from every card
6. **The remaining §2.3 metrics** — havoc, sack rate, line yards, drive efficiency, turnover margin, situational splits
7. **Complete counting rows** (18/18 every season, plus receiving and defense) — unblocks §3.H
8. **Confirmation of metric polarity** — documentation, not a build. **Update: this now has evidence.** We cross-checked declared polarity against empirical win-correlation sign for all 20 metric-sides; 19 of 20 agree, which supports the assumption that `team_season_avg` describes the team's own offense. Still want confirmation, but it is no longer a blind guess
9. **Style clustering + similarity scores** — if cheap server-side, several 🔴 cards become 🟢

**And the open question back to you:** what's in our taxonomy that isn't in this document? This inventory is built from what we can see on disk plus what comparable sites do. If the pipeline can produce concepts we haven't imagined, those are the cards worth designing next.

---

## 6b. Player-GAME stat coverage — the Notable Performers ask (checked 2026-09-05)

Measured across **every exported game file, all seasons** (`individual_stats` + `production_scores`), not sampled.

### What ships today

| Category | Rows across all games | Fields |
|---|---|---|
| `defense` | 16,116 | `tackles`, `solo_tackles`, `assisted_tackles`, `tfl`, `sacks`, `qb_hurries`, `passes_defended`, `interceptions`, `forced_fumbles`, `fumble_recoveries` |
| `receiving` | 6,544 | `targets`, `receptions`, `catch_rate`, `yards`, `touchdowns`, `fumbles`, `yards_per_reception`, `yards_per_target`, `deep_targets`, `deep_receptions` |
| `rushing` | 4,311 | `attempts`, `yards`, `touchdowns`, `fumbles`, `yards_per_carry`, `long` |
| `passing` | 1,538 | `attempts`, `completions`, `completion_pct`, `yards`, `touchdowns`, `interceptions`, `sacks_taken`, `sack_yards_lost`, `yards_per_attempt`, `hurries_faced`, `fumbles` + `depth_breakdown` / `pressure_breakdown` / `red_zone_breakdown` |
| `returns` | **0** | category key exists in every game, always an empty list |

Every one of the ten defensive fields is populated somewhere, so a DB's full line — tackles, PBU, INT, forced fumbles, fumble recoveries, hurries — is renderable from fields alone with no derivation.

### What does not exist

1. **No offensive-line anything.** `OL` / `C` / `G` / `T` never appear as a position in `production_scores` (the only values ever seen are `DEF`, `WR`, `RB`, `QB`, `DB`, `DL`, `LB`, `TE`), and there is no blocking category in `individual_stats`. `sacks_allowed` and `line_yards` exist only as team totals. **An OL cannot be a notable performer today** — the card carries a mock OL line so the layout is reviewable, and lights up on real data the moment the fields ship.
2. **`havoc` is not a field.** Both cards currently sum it client-side from `tfl + sacks + forced_fumbles + passes_defended + interceptions` (`havocOf`, one shared definition in `GameSummaryTabV2.js`). This is exactly the kind of client-side derivation §5 says we would rather not own.
3. **`returns` is always empty**, so return production can't contribute to a performer's line even though the category is exported.

### The ask

1. **Blocking stats per OL per game** — snaps, pancakes, sacks allowed, pressures allowed, blown blocks. The card's `blocking` chip builder already reads these exact field names; shipping them is the whole integration.
2. **`havoc` as a first-class field on the defense row** — the card already prefers `row.havoc` and falls back to the local sum only while the field is missing.
3. **Populate `returns`** — kick/punt return attempts, yards, TD, long.
4. **Composed scoring-play strings** — the Summary tab's Scoring Plays list renders from a mock payload (`MOCK_SCORING_PLAYS` in `GameSummaryTabV2.js`) because the pieces can't be assembled from the export without deriving. Per scoring play we want, as fields: `player`, `action` (e.g. "13 yd pass"), `secondary` (the receiver, where the play has one), `score_away_after` / `score_home_after`, and the drive that produced it — `drive_plays`, `drive_yards`, `time_of_possession`.
   - Today `actions` carries `passer` / `receiver` / `rusher` / `net_yards` on passes and runs — **505 of 1,108 scoring plays across 2025** — but ships `{ type }` alone for field goals, PATs, safeties and defensive returns: no player, no yardage.
   - Plays carry **no `drive_id`**, so a scoring play cannot be joined to its drive at all.
   - `drive_summary` has `clock_start` and `clock_end` but **no `time_of_possession`**, which is why the Drive Summary table has no TOP column.
5. **Drive-chart fields on `drive_summary`** — the Summary tab's Drive Summary renders from a mock payload (`MOCK_DRIVES` in `GameSummaryTabV2.js`) for the same reason. Measured across **1,744 drives in 2025**, the export already ships and populates ~100%: `offense_team`, `quarter_start`/`quarter_end`, `clock_start`/`clock_end`, `start_yardline_absolute`/`end_yardline_absolute`, `possession_obtained_by` (kickoff / punt / fumble_recovery / missed_fg / blocked_fg / interception), `plays_total`, `yards_net`, `result` (12 values), `points`, plus two nothing currently renders — `drive_efficiency_rating` (range −4.00 to +2.08) and `is_long_field_drive`.
   Missing, and wanted per drive:
   - `time_of_possession` — both clocks are there, the elapsed time isn't
   - `epa` for the drive
   - `score_away_after` / `score_home_after`
   - `start_spot` / `end_spot` as strings (`"TSU17"`) — the raw yardline is offense-relative, so composing the label needs the side of the fifty
   - `third_down` / `fourth_down` conversions on the drive (`"2-3"`) — the best single explanation of why a drive lasted twelve plays
   - `explosive_plays` on the drive, or its longest gain
   - `penalty_yards` on the drive
7. **ANSWERED BY THE 2026 EXPORT (checked 2026-09-08).** The PASS action now carries `passDepth` on 297 of 303 attempts (98%), `targetDirection` on 293 (96.7%) and `airyards` on 297 (98%), across all five 2026 games. The `"middle"` default that was hiding a regex miss is gone. Still on the 2019-2025 files, so the target-zone map keeps its mock path for those seasons. Original ask below.

   **Pass depth and direction as fields on the PASS action** — the Box Score tab's target-zone map (the 3x3 grid in `PassingProductionClean.js`) renders from a mock payload because the real grid cannot be trusted. Two separate problems, both measured across all **4,302 pass actions in 2025**:
   - **`passDepth` is missing on 350 of them (8%).** Those plays are written to `grid[undefined]` and the renderer, which only reads `deep` / `medium` / `short`, never draws them. On a 30-attempt game that is 2-3 throws silently absent from the chart.
   - **There is no direction field at all.** `derivePassingGrids` regexes it out of `raw_text` with `/(short|deep|medium)\s+(left|middle|right)/`, and when the match fails — 155 plays, 4% — the code does `dirMatch ? dirMatch[2] : "middle"`. It does not drop the play, it **files it under middle**. The middle column is structurally inflated with throws whose direction nobody knows.

   What we want per PASS action: `pass_depth` (the existing short / medium / deep bucket, populated on every attempt) and `pass_direction` (left / middle / right), both as real fields rather than text-scrape, plus `air_yards` if it exists upstream — that would let the map key off actual depth instead of three coarse buckets. Where either is genuinely unknown, we want it **explicitly null**, not defaulted: the card renders an "uncharted" strip for exactly this case so the grid's totals never quietly disagree with the passing table beside it.

   **7b. `yards_after_catch` on the receiving row.** The Box Score tab's receiving table (`PassingProductionClean.js`) now carries a YAC column, per the reference sheet's column grammar, and it dashes out on every game because the field does not exist and **cannot be derived**. The receiving row ships `targets`, `receptions`, `catch_rate`, `yards`, `touchdowns`, `fumbles`, `yards_per_reception`, `yards_per_target`, `deep_targets`, `deep_receptions` and `direction_breakdown` — no YAC and no catch point. The PASS action carries only `type`, `passer`, `receiver`, `isComplete`, `net_yards`, `passDepth` and `pressure_detected` — **no air yards**, so there is nothing to subtract the catch point from either. This is the same missing `air_yards` named above, seen from the receiving side; either `air_yards` on the PASS action or `yards_after_catch` on the receiving row closes it. Nothing is mocked into the column in the meantime.

8. **PARTLY ANSWERED BY THE 2026 EXPORT (checked 2026-09-08).** RUSH actions now carry a real `direction` on 338 of 339 carries (99.7%), so the rushing lane chart places every carry by where it actually went and the partition-of-an-aggregate mock never runs on a 2026 game. It still runs for 2019-2025. **Going the other way:** the 2026 export DROPS `direction_breakdown` from the rushing row, and drops `line_yards_per_rush`, `highlight_yards_per_rush`, `rush_opportunity_rate` and `stopped_run_rate` from `advanced_team` — so the team-level rushing row prints dashes on 2026 games. See `BACKEND_RESPONSE_SPEC.md` §1b. Original ask below.

   **Per-rusher advanced metrics, and a `rushDirection` that isn't a fiction** — the Box Score tab's Rushing panel (`RushingProductionClean.js`). Measured across all **5,064 RUSH actions and 795 rushing rows in 2025**:
   - **`rushDirection` does not exist on a single RUSH action** (0 of 5,064; the action carries only `type`, `net_yards`, `rusher`, `is_tfl`). The legacy `QGameBoxScore.Rushing` lane chart reads `action.rushDirection?.toLowerCase() || "middle"`, so **100% of carries are charted up the middle** — the chart has never shown anything but a fabricated default. The new panel ignores that path entirely and reads `individual_stats[].direction_breakdown` instead, which is real and ships on every row.
   - **`direction_breakdown` disagrees with the row's own totals on 35 of 795 rows (4.4%)** — the three lanes' attempts/yards don't sum to the player's `attempts`/`yards`. Worth reconciling upstream, since the gap chart and the table beside it are then telling different stories about the same player.
   - **`long` is null on all 795 rushing rows.** Longest carry is a headline number in every box score on the internet; it renders as an em dash today.

   - **The play-by-play and `individual_stats` disagree about how many carries a back had.** Joining RUSH actions to rushing rows by name hits on **795 of 795 rows (100%)**, but the attempt counts match on only **677 (85.2%)** and the yardage on **697 (87.7%)**. The play-by-play is always the larger of the two — usually by exactly one carry (97 rows), occasionally by a lot (one row is +18 attempts, and the worst yardage gap is 159). One is authoritative; we don't know which. Please reconcile, or tell us which to trust.

   What we want per rusher, matching what `advanced_team` already ships per team (`line_yards_per_rush`, `highlight_yards_per_rush`, `rush_opportunity_rate`, `stuff_rate`, `stopped_run_rate` — all 100% populated across 144 team-games): **`line_yards_per_rush`, `opportunity_rate`, `highlight_yards_per_rush`, `success_rate`, and `long`**.

   **Update — we now count four of those ourselves.** Because the RUSH actions carry `net_yards` and the name join is perfect, the panel computes per-rusher line yards, opportunity rate, highlight yards per opportunity, success rate and stuff rate directly off the play-by-play rather than mocking them against the team rate. Those numbers are real. **The only thing still mocked in the rushing panel is which direction each carry went** — see the formula spec below, and the lane note under it.

8b. **Line yards and highlight yards — the exact definition we are computing to.** Three different published versions of this metric are in circulation and they disagree by ~40% on the same carries, so this is a spec, not a preference. We follow the legend printed on Bill Connelly's college advanced box score (`inspo/abs2.jpg`), which is the sheet this panel's column grammar is cloned from:

   - **Line yards per carry** — the line is credited 100% of yards 0–3 on a carry, 50% of yards 4–6, and 0% of anything past 6. A carry that loses yardage is charged to the line at **120%**. Note that the sheet's own legend says *125%* for losses but its printed numbers are 120% (Chase Brice, 1 carry for −1, prints `LY/Carry -1.20`; Mac Jones, 1 for −2, prints `-2.40`) — **we follow the numbers, and would like the discrepancy settled.** The 4.5 ceiling per carry falls out of the tiers and is not a separate cap rule.
   - **Opportunity** — a carry gaining **4 or more** yards. The sheet annotates this as a deliberate change from an earlier 5-yard threshold, so the older 5+ definition still circulating online is out of date. **Opportunity rate** is opportunities ÷ carries.
   - **Highlight yards** — total rushing yards minus total line yards, reported **per opportunity**, not per carry. Verified against a row on the sheet that has no losses to muddy it: Tavien Feaster, 3–11, prints `LY/Car 3.33`, `Opp Rate 67%`, `Hlt/Opp 0.50` — carries of 4/4/3 give line credit 3.5 + 3.5 + 3 = 10.0, two opportunities, and (11 − 10) ÷ 2 = 0.50. Every term checks.
   - **Stuff** — a carry stopped at or behind the line of scrimmage (≤ 0 yards). Distinct from a TFL, which is what the down-split rows currently count as a fallback.

   Two consequences for the current export. First, **the team-level `highlight_yards_per_rush` is named for a denominator the metric doesn't use** — if it is genuinely per rush rather than per opportunity, it is not comparable to anyone else's published figure and we would like it renamed or recomputed. Second, our own converter (`scripts/convert_mock_game.py`) had been deriving it as `opportunity_yards / attempts`, which is a third quantity again — `opportunity_yards` is yards gained *on* opportunity carries, not yards past what the line blocked. That is fixed on our side.

   **The lane chart's mock.** The Rushing panel's gap chart draws three bars — left, middle, right — each stacked into yards lost, line yards and highlight yards, with losses hanging below the axis. Bar height is raw yardage. Every carry's yardage in it is real and every lane total matches `direction_breakdown` exactly; **which carry went which way is invented**, because `rushDirection` doesn't exist (above) and direction survives only as the aggregate. The panel partitions each back's real carries into three groups reproducing that aggregate — 698 of 795 rows (88%) land exactly, and where no partition exists the leftover is spread across the lane's carries (median 0.5 yards per carry, p90 2.0) so the bar's total stays honest. **All of this disappears the moment a carry carries its own direction.** The single field that would do it: `rushDirection` on the RUSH action, with the same left/middle/right vocabulary `direction_breakdown` already uses.

10. **Per-game league averages for the drive and success-rate basics** — *(2026 update: the export now ships `advanced_basics.blocks` outright, so the card reads real values rather than deriving them — but still no league-average row. The ask below stands, narrowed to that row alone. Full 2026 payload contract: `BACKEND_RESPONSE_SPEC.md` §1b.)* — the Summary tab's Advanced Basics card (`AdvancedBasicsCard` in `GameSummaryTabV2.js`) reproduces the top block of Connelly's advanced box score (`inspo/abs2.jpg`): drives, plays, yards, scoring opportunities and average field position; the per-drive rates and points per scoring opportunity; and success rate by quarter, by play type and by down type.

   **Every one of those we can derive, and do** — checked across all **144 team-games in 2025**, all of them populate off `drive_summary` and `play_by_play`, with a single legitimate null (one team never reached the opponent's 40, so it has no points-per-opportunity). We would rather read them than count them, but this is not blocking.

   **What is missing is the National Average row.** On the reference sheet every block prints a third row beneath the two teams, and that row is what makes the numbers legible — 6.3 plays per drive means nothing until 5.5 sits under it. `league_avg_2025.json` carries only `rushing`, `passing` and `defense_impact` rate blocks (`successRate`, `stuffRate`, `ypa`, `havocRateForced` and so on). Of the eighteen figures on our card it could fill one. Computing it in the browser means fetching all 72 game files, which we will not do.

   What we want: a per-season league-average block covering **drives per team-game, plays per drive, yards per drive, scoring opportunities per drive, points per scoring opportunity, average starting field position, and success rate split by quarter, by play type and by down type** — the same shape as the existing `rushing`/`passing` blocks in `league_avg_<season>.json`. The card leaves the row out rather than faking it, and gets its context from contrast instead: on metrics with a good direction the better of the two values is set in white and the other dimmed.

11. **`passes_defended`, `forced_fumbles`, `qb_hurries` on `individual_stats.defense`, and a real per-play havoc log** — the Box Score tab's Defense panel (`DefenseProductionClean.js`). Two separate asks.

    **The three dropped fields.** All three ship on every 2019-2025 defense row (checked across **3,423 rows in 2025**, 100% populated) and are absent entirely from `individual_stats.defense` in all five 2026 games — not null, not zero, the keys don't exist. `tackles`, `tfl`, `sacks` and `interceptions` survive. The panel prints Tkl/TFL/Sacks/INT for 2026 games and dashes PD/FF/Havoc rather than reconstruct them by scanning `play_by_play` for `broken_up_by` / `qb_hurried_by` / a `"forced by NAME"` string on `FORCED_FUMBLE` — that would be the frontend assembling an individual stat out of raw plays, which is exactly what the payload is supposed to arrive having already done.

    **A per-play havoc log.** The player page ships a "Havoc Spatial Log" (`HavocSpatialMap` in `PlayerProfileControlStrip.js`) that draws five dots — TFL, QBH, Sack, FF, PD — at fixed coordinates for every defender, nudged only by a season production number. It has never plotted a real event; the positions are constants. A real version needs the backend to attribute each havoc play to a player with a real location, e.g. an array of `{ category, yardline_absolute, quarter, clock }` per defender, or a `havoc_plays[]` block on the game payload keyed by `player_key`. The 2026 export already carries the raw material for this internally — `tacklers[]`, `intercepted_by`, `broken_up_by`, `qb_hurried_by` are all real, attributed objects on `play_by_play` actions with a real `yardline_absolute` on the play — so this is a reshaping job on data you already compute, not new modeling. Until it exists as a direct field, the Defense panel's spotlight states plainly that the log is pending rather than drawing the old fixed-position version or reassembling one client-side.

9. **`turnover_production` on the production-score components** — the Summary tab's PAR Breakdown card (`ProductionBreakdownCard` in `GameSummaryTabV2.js`) draws each player as a stacked diverging bar, and turnover impact is the component that belongs on the negative side of the axis. Checked across all **4,885 production rows in 2025**, `components` only ever carries six keys: `passing_production`, `rushing_production`, `receiving_production` for offensive players and `hit_production`, `hawk_production`, `scrum_production` for defenders. Nothing turnover-shaped exists.

   The card currently reconstructs it: the **counts are real** — `interceptions` and `fumbles` off `individual_stats` (107 and 100 league-wide in 2025) — but the **cost per turnover is a mocked constant** (`MOCK_PAR_PER_TURNOVER = -2.5`), and the card adds that charge onto `production_total` itself so the number beside the bar still matches the bar's length. That means our displayed total deliberately disagrees with the exported `production_total` for any player who turned it over.

   What we want: a real `turnover_production` on the components object, already replacement-adjusted and already folded into `production_total`, so we can stop charging it ourselves. If the exported `production_total` is *meant* to be turnover-inclusive already, say so and we will drop the adjustment entirely.

   **Second consumer, added 2026-09-09.** The Box Score tab's four roster tables (`ProductionPrimitives.parColumn`) now draw the same stacked diverging bar per player, on the three axes the Summary card's legend pairs — Passing/Hit, Rushing/Hawk, Turnover/Scrum. Defenders get all three segments off real components; **offensive players get two**, because this is the missing one. Unlike the Summary card, the roster bar charges nothing of its own: no `MOCK_PAR_PER_TURNOVER`, no adjusted total, so an offensive bar is simply short a segment until the field ships. Both consumers close on the same field.

12. **`player_seasons_2026.json` — the 2026 games ship without a 2026 roster** (found 2026-09-09). Every player identity on the game page — headshot, position, jersey — comes from `/data/3-players/player_seasons_{season}.json`, matched on name + team. The 2026 games are exported (`93-FE Docs/game-center/games/2026/`) and carry `season: 2026`, but the newest roster file is 2025, so that fetch 404s and **every card on a 2026 game renders with no face, no position and no number** — Summary tab's Notable Performers and Game Leaders, and all four Box Score spotlights.

    Patched on our side, but only partly: the fetch now falls back to the last shipped roster rather than resolving to an empty list, and the lookup falls back to a league-unique name match when a player's team has changed since. Measured on `tsupvamu26`, across all 92 individual-stat rows: **42 (46%) match team-scoped, 7 more (53% total) are rescued by the name match, and 43 (47%) still have no roster row at all** — genuine newcomers like Zayvion Turner-Knox, who appears in no `player_seasons` file for any year. Nothing is faked for those; they fall through to the school-mark treatment.

    What we want: `player_seasons_2026.json` in the same shape as 2025 (`full_name`, `team_id`, `image_url`, `position`, `jersey_number`), shipped alongside a season's game exports rather than behind them. As a general rule: **a season's roster should land before, or with, that season's games.**

13. **The player spotlight's third stat row — 17 fields, per player** (filed 2026-09-11). Each Box Score spotlight (`PassingProductionClean.js`, `RushingProductionClean.js`, `DefenseProductionClean.js`) now carries a twelve-chip grid, three rows of four. The first two rows are live. **The third row is wired and dashing**, because none of the fields below exist on any row in any season. Every one is read as `row.<field> ?? null` and rendered through a null-safe formatter — nothing is derived, mocked, or counted off `play_by_play`, so each chip lights up on its own the moment its field ships. Counts checked across every exported game, 2019-2026.

    **Passing** (2,598 rows checked). `success_rate` — per attempt or per dropback, your definition; we want yours rather than ours. *(Two more chips on this row already ship, on opposite schema halves: `epa_per_play` is 2026-only, `third_down_breakdown` and `depth_breakdown.deep` are 2019-2025-only. See the 2026 thinning note below.)*

    **Receiving** (13,004 rows). `yards_after_catch`, `yards_after_catch_per_reception`, `first_down_receptions`, `explosive_receptions`, `third_down_receptions`. YAC is also ask **7b** above, reached from the passing side. **Please pin the explosive threshold** — we use 10/20 for rushing per your spec below, and receiving explosives are commonly 15+ or 20+; whichever you pick, name it in the field or tell us and we'll label the chip accordingly.

    **Rushing** (8,172 rows). `power_successes` + `power_attempts` (carries with ≤2 to go that converted or scored — short-yardage identity in one number), `explosive_carries_10`, `explosive_carries_20`, `epa_per_play`, `stopped_carries` (0-2 yards — a wider net than stuffs, which are ≤0). Power rate and stop rate are shown as rates computed from those shipped counts against the row's own `attempts`; ship a rate directly if you'd rather own the denominator.

    **Defense** (31,836 rows). `clutch_stops`, `red_zone_disruptions` (any sack / TFL / INT / PBU / FF inside the 20), `turnovers_created`, `third_down_havoc`. Note `fumble_recoveries` and `qb_hurries` already ship on every 2019-2025 defense row — `turnovers_created` may be derivable upstream from `interceptions` + `fumble_recoveries` if that matches your intent, but we'd rather read your number than assume the definition.

    **One thing to fix regardless: the 2026 export is much thinner than the historical one at the player level**, and it is losing ground the older files already held.
    - *Passing* dropped `completion_pct`, `yards_per_attempt`, `sacks_taken`, `sack_yards_lost`, `hurries_faced`, `fumbles`, and all four breakdown blocks (`depth_`, `direction_`, `pressure_`, `red_zone_`, `third_down_`). It gained `epa_per_play`, which is genuinely new and wanted.
    - *Rushing* dropped `direction_breakdown`, `long`, `fumbles`.
    - *Receiving* dropped `catch_rate`, `yards_per_reception`, `yards_per_target`, `deep_targets`, `deep_receptions`, `direction_breakdown`, `fumbles`.
    - *Defense* dropped `solo_tackles`, `assisted_tackles`, `passes_defended`, `forced_fumbles`, `qb_hurries`, `fumble_recoveries` (also ask **#11**).

    The 2019-2025 shape plus `epa_per_play` plus the fields above is the target. A season's export should be a superset of the last one's, not a different subset.

14. **`event` on the schedule / games-hub row — the name a game is known by** (filed 2026-09-12). The Games Hub grid (`GamesHubPage.js`) shows the whole season at once, every game played or not, as a five-row tile: date, away, home, **game name**, location. That fourth row has no source. Checked all 188 rows of `games_hub_2025.json`: nothing carries a game's own name. The closest fields are `neutral_site_name` (25 rows, and it holds a place — "Shreveport, La.", "Miami Gardens, Florida (Hard Rock Stadium)" — not "Bayou Classic"), `game_type` (`regular_conference` / `non_conference` / `swac_championship`), and `is_postseason` (2 rows). The narrative fields that used to sit on this line, `story_label` and `story_type`, were the story layer and are no longer rendered.

    This matters more here than a normal missing stat: **the classics and homecomings are the league's identity.** A grid of 142 tiles that cannot say Bayou Classic, Turkey Day Classic, Magic City Classic, Florida Classic or Homecoming is a schedule; one that can is the season.

    What we want, on the schedule and games-hub rows: `event: { kind, name }` — the same shape §2.1 of this document already records as specced on schedule payloads but never surfaced. `kind` one of `classic` / `homecoming` / `championship` / `rivalry` / `bowl`, `name` the full public name of the game. Both null on an ordinary conference game. A game can be both a classic and someone's homecoming, so if that happens in practice we would rather have a short array than have to pick.

    The row is already wired as `game.event?.name ?? game.event_name ?? null` and renders blank, holding its height. It fills in the day the field ships, with no frontend change.

15. **Clean venue strings, and a game page for every game** (filed 2026-09-13). Both are Games Hub grid (`GamesHubPage.js`) blockers, and both are upstream.

    **15a. `venue` is free text and it is not clean.** Across the seven seasons the hub offers there are **346 distinct venue strings, 186 of them carrying something that is not a location.** At least six different shapes are in circulation for the same information:

    | Shape | Example |
    |---|---|
    | City, USPS code | `Orangeburg, SC` |
    | City, AP abbreviation | `Jackson, Miss.` · `Norfolk, Va.` |
    | City, full state | `Houston, Texas` |
    | City, state + stadium, unparenthesised | `Dover, Del. Alumni Stadium` |
    | City, state + stadium, parenthesised | `Pine Bluff, Arkansas (Simmons Bank Field)` |
    | Stadium only, no city at all | `, (A.W. Mumford Stadium)` · `, (ASU Stadium)` |

    Plus genuine scrape bleed — `Atlanta, Georgia (Mercedes-Benz Stadium) Score By Quarters 1st 2nd 3rd 4th OT OT OT OT al` — and casing that varies mid-field (`BALTIMORE, MD (HUGHES STADIUM)`). The same venue appears under many spellings: `Atlanta, GA Center Parc Stadium`, `Atlanta, GA Center Pac Stadium` (sic), `Atlanta, Georgia (Center Parc Stadium)`, `Atlanta, Ga. (GSU Stadium)`.

    We are deliberately **not** writing a frontend parser for this. A regex that splits city from state from stadium across six shapes would be wrong on the rows that matter and would silently absorb the scrape bleed.

    What we want: the pieces as separate fields, each authoritative — **`venue_city`, `venue_state` (USPS two-letter), `venue_stadium`** — with `null` where genuinely unknown rather than an empty-city string like `", (ASU Stadium)"`. The grid prints city and state and nothing else; other surfaces can use the stadium. If a single display string is easier on your side, `venue_short` as `"Atlanta, GA"` would also do.

    **15b. Most games have no game page.** The grid's tiles link through to the game, but `game_path_id` / `route` / `has_game_page` / `has_parsed_game` all move together and all are sparse: **72 of 188 rows in 2025 (38%), 65 of 188 in 2024, and 0 of 147 in 2026.** So roughly six of every ten tiles are dead on the best season we have, and the whole 2026 grid is inert. The tile renders as a non-link in that case rather than a link that 404s, but the season reads as mostly unclickable. Worth knowing whether the gap is unparsed source games or an export filter — if the parsed game exists and just isn't being emitted, that is a much cheaper fix than it looks.

16. **`play_by_play` should contain plays, and only plays** (filed 2026-09-13). The Play-by-Play tab (`PlayByPlayPanel.js`) lists the export's rows directly. **A third of them are not plays.** Counted across all 392 exported games, 97,668 rows:

    | `play_type` | Rows | Share |
    |---|---:|---:|
    | RUSH | 27,199 | 27.8% |
    | PASS | 23,426 | 24.0% |
    | **`null`** | **17,266** | **17.7%** |
    | **DOWN_DISTANCE** | **14,470** | **14.8%** |
    | KICKOFF | 3,947 | 4.0% |
    | PUNT | 3,883 | 4.0% |
    | PAT | 2,301 | 2.4% |
    | PENALTY | 2,131 | 2.2% |
    | SACK | 1,736 | 1.8% |
    | FIELD_GOAL | 1,006 | 1.0% |
    | KNEEL | 205 | 0.2% |
    | RETURN | 49 | 0.1% |
    | SPIKE | 49 | 0.1% |

    **31,736 rows — 32.5% — are `null` or `DOWN_DISTANCE`**, and neither is a play. They are the scoreboard and administrative lines scraped along with the drive: `"Start of 1st Half"`, `"Morgan St. wins toss and will kickoff; DSU will defend East end-zone."`, `"Delaware St. at 14:55"`, `"1st and 10 at DSU21 Delaware St. drive start at 14:55."` The down-and-distance rows in particular are duplicates — the very next row is the actual snap from that spot, carrying the same down, distance and yardline.

    What we want: **`play_by_play` carries one row per play, and nothing else.** Anything administrative moves to its own array (`game_events[]`, or onto `drive_summary`, where drive-start already belongs) or is dropped. Every remaining row should carry a non-null `play_type`.

    Two smaller notes from the same count:
    - **`SACK` and `SPIKE` are their own types, not `PASS`.** That is defensible, but it has to be documented, because a consumer filtering `play_type === "PASS"` silently loses 1,736 sacks — most of a season's pressure story. We now union RUSH+KNEEL, PASS+SACK+SPIKE, and KICKOFF+PUNT+FIELD_GOAL+PAT+RETURN for the tab's new Rush / Pass / Special Teams filters. Confirm those groupings match your intent.
    - **`RETURN` appears 49 times in 97,668 rows.** Given 3,947 kickoffs and 3,883 punts, nearly every return is evidently being folded into the kick row rather than emitted separately. Fine if intended — but then `RETURN` as a type is misleading and should probably go.

17. **A canonical play description, or the parts to build one** (filed 2026-09-13). The Play-by-Play tab prints `raw_text` verbatim, and `raw_text` is the scrape line, not a description. A representative row:

    > `1st and 10 at TSU46 No Huddle-Shotgun Renfro,Athean rush right for 3 yards gain to the TSU49 (Zachery,Eric).`

    Four separate problems in one string:
    - **The down and distance is repeated inside it.** `"1st and 10 at TSU46"` is already its own column, built from the row's real `down` / `distance` / `yardline_absolute`. Printed twice on every row.
    - **The formation is prepended to the play.** `"No Huddle-Shotgun"`, `"No Huddle"` — useful data, wrong place. It belongs in a `formation` field, where it could become a filter; inside the sentence it just pushes the actual play right.
    - **The end yardline is restated.** `"to the TSU49"` is `yardline_after_absolute`, which we already have.
    - **Names are in scrape order** — `Renfro,Athean`, `Zachery,Eric` — so every consumer splits on the comma to print a person's name.

    What we want, in order of preference:

    **(a) A `description` field** — the play as a reader would want it, with the redundant frame stripped and names in natural order:
    > `A. Renfro rush right for 3 yards (E. Zachery)`

    **(b) Failing that, the parts**, so the frontend composes it once: `primary_actor` (name, in a consistent shape), `action` (rush / pass / sack), `direction` (left / middle / right), `yards`, `result` (gain / loss / no gain), `tacklers[]`, plus `formation` lifted out to its own field. Several of these already exist inside `actions[]` — `rusher`, `net_yards` — but not `direction`, and not the tacklers as a structured list.

    Either way the frontend stops parsing prose. Note this is the same request as the tackler/havoc attribution in ask **#11**: a `tacklers[]` array serves both this and the havoc spatial log.

6. **`yards_per_play` on `team_box`** — the Team Stats card is the last place on the Summary tab still dividing (`total_yards / plays_offense`). Every other figure on that card is a straight field read.
4. **Position on the individual_stats row**, or a stable position on the production row for non-`DEF` defenders. `production_scores` sometimes reports the generic `DEF` rather than `DB` / `DL` / `LB`, which is what decides a player's stat block.

### One related note on `player_key`

It is **not stable across game files** — some games key players by name (`"name:kuhns,otto"`), others by person id (`"PERS_00011824"`). It is internally consistent within a file, so joins inside one game work, but nothing can join a player across games on it. Headshots are matched on name + team instead (~92% hit rate). Worth unifying.

---

## 7. Next phase — the per-card pass (not yet done)

**The cards in §3 are narrative shells. The next pass makes data the lead, not the words.**

Reference: `inspo/weather.jpg` — a better model for this section than the People Hub deck was. In that grid every panel opens with the *visualization* — a compass, a radial dial, a bar cluster, a curve, a big number — and the sentence sits underneath as support. Our current demo cards lead with a headline and put the chart below it. That ordering is backwards for a stats page: **numbers and charts sell the story here; words only caption it.**

What that pass has to do, per card, is match five things to each other:

| Layer | Question |
|---|---|
| **Vocabulary** | What do we *call* this thing, in the reader's language, not the pipeline's? |
| **Entity** | What is the subject — team, pair, unit, player, league, season, matchup? |
| **Stat** | Which exact field(s), at which grain? |
| **Correlation** | What relationship is being claimed, and how strong is it really? |
| **Visualization** | Which of §4's forms actually carries *this* claim — not which is available |

The failure mode to avoid is the one already recorded for the People Hub: reusing whichever of the existing viz kinds is closest, instead of designing one that fits the claim. A card whose chart doesn't carry the claim on its own is not finished.

**Sequencing:** this pass happens *after* backend returns §6, because which cards survive depends on what data comes back. No point matching a visualization to a stat that turns out to be ⚪.
