# Player Page - Design Document

**Route:** `/player/:playerKey`
**File:** `src/pages/players/PlayerDetailPage.js`
**Last updated:** 2026-08-22

---

## 1. Page Identity

- **Page Name:** Player Detail Page
- **Primary User Job:** Land on one player from a roster, leaderboard, or discovery grid and understand who they are, how productive they were, and how that production compares to their peers.
- **Character:** Editorial player dossier. Three progressively deeper tabs — identity, production, analysis. Denser than a roster card, more focused than the Player Analytics hub.
- **Relationship to upstream pages:** Downstream destination for `RosterOutlookCarousel`, `RosterFeatureRail`, `LeaderboardRow`, `DiscoveryGrid`, and the roster `PlayersTab` cards.

---

## 2. Architecture

Thin page + rich components. `PlayerDetailPage.js` owns lookup, merge, and tab routing. All UI lives in `src/components/organisms/player/`.

```
src/components/organisms/player/
├── PlayerProfileBanner.js          # 4x1 hero banner + Glory Rating gauge
├── PlayerBioBackgroundPanel.js     # Tab 1 body
├── PlayerHomeStateMap.js           #   └─ home/school state map
├── PlayerStatsTab.js               # Tab 2 shell + ViewRail
├── statsTabMock.js                 #   └─ builders for Tab 2
├── PlayerPerformanceCharts.js      #   └─ Trends view
├── PlayerCompareList.js            #   └─ Compare view (+ Overview preview)
├── PlayerAdvancedTab.js            # Tab 3 shell + ViewRail
├── advancedTabMock.js              #   └─ builders for Tab 3
└── ViewRail.js                     # shared vertical stepper nav (Tabs 2 & 3)

src/components/organisms/test/
└── PlayerProfileControlStripV2.js  # 4x1 identity/control strip under banner
```

**Orphaned, retained for reference:** `PlayerDashOverview.js`, `PlayerComparePanel.js`, `PlayerSeasonStatsPanel.js`, `PlayerDetailHero.js`, `PlayerDetailSidebar.js`, `PlayerPhysicalPanel.js`, `PlayerProfileControlStrip.js` (v1).

### Data Flow

```
PlayerDetailPage
  ├─ usePlayerStatsEnriched()  → statPlayers   (production source)
  ├─ useAllPlayers()           → rosterPlayers (bio/roster source)
  ├─ resolve player from location.state OR URL lookup
  ├─ merge roster + stats fields (roster wins on bio)
  └─ derive peers, class counts, team meta
       ↓ props
  PlayerProfileBanner / ControlStripV2 / active tab component
       ↓ props
  Tab sub-views (pure, no fetching)
```

### PlayerDetailPage.js Contract

The page does exactly five things:

1. **Resolve** — player from `location.state.player`, else URL lookup
2. **Merge** — bio fields preferring `rosterEntry`, production fields from stats source
3. **Derive** — `positionPeers`, `statPositionPeers`, `positionClassCounts`, `teamMeta`
4. **State** — `activeTab` via `?tab=` search param
5. **Render** — banner slot, control strip slot, active tab slot

`listContent` is `null`. Every tab renders as a real `PageShell.Slot`.

### Player Key Resolution

`playerKey` arrives in two formats:

| Format | Example | Lookup |
|---|---|---|
| Person ID | `PERS_00003846` | direct match on `person_id` in either source |
| Name + team | `Cameron Peters__swacpvamu25` | name + normalized team match |

**Team-id normalization is required.** Link-builders across the app disagree on team-id format — some emit `player.team` (`swacpvamu`), some emit `player.team_id` with a season suffix (`swacpvamu25`). `normalizeTeam()` strips a trailing `/25$/` on both sides of the comparison. Without it, a hard reload (which loses `location.state`) 404s.

---

## 3. PageShell Layout

Pure slot page — no `listContent`.

```jsx
<PageShell>
  <PageShell.Slot cols={4}><PlayerProfileBanner /></PageShell.Slot>
  <PageShell.Slot cols={4}><PlayerProfileControlStripV2 /></PageShell.Slot>
  {/* active tab renders its own Slot(s) */}
</PageShell>
```

| Slot | Component | Size |
|---|---|---|
| 1 | `PlayerProfileBanner` | `cols={4}` |
| 2 | `PlayerProfileControlStripV2` | `cols={4}` |
| 3 | `PlayerBioBackgroundPanel` | `cols={4} rows={2}` |
| 3 | `PlayerStatsTab` | `cols={4} rows={4}` |
| 3 | `PlayerAdvancedTab` | `cols={4} rows={4}` |

---

## 4. Tab Model

Tab state lives in the `?tab=` search param, not local state, so a tab is linkable.

| Tab ID | Label | Component | Status |
|---|---|---|---|
| `profile` | BIO & BACKGROUND | `PlayerBioBackgroundPanel` | Live |
| `production` | SEASON STATS | `PlayerStatsTab` | Live (mock-heavy) |
| `stats` | ADVANCED ANALYTICS | `PlayerAdvancedTab` | Partial |

**Naming gotcha:** the tab *id* `stats` renders the **Advanced Analytics** tab, and the id `production` renders the **Season Stats** tab. The ids predate the labels. `LEGACY_TAB_MAP` also aliases `dash` → `stats`. Do not rename without updating every inbound link.

### Sub-view navigation

Tabs 2 and 3 use the shared `ViewRail` — a vertical icon-and-label stepper on the left edge with connected progression dots, not a horizontal tab bar. Chosen deliberately to avoid a second row of pills stacked under the page's existing tab row.

**Tab 2 views:** Overview (`card`) · Game Log (`logs`) · Trends (`charts`) · Compare (`compare`)
**Tab 3 views:** Radar · Splits · Called-Upon · Opp. Adjusted · Field Map · Modules · Trajectory

---

## 5. Backend Contract — What Exists Today

Two sources, joined on the page. **Neither carries a single counting stat.**

### 5.1 `player_stats_2025_enriched.json` → `players{}`

Keyed by `team:player_key`. 1,054 records. Production source.

| Field | Type | Notes |
|---|---|---|
| `player_key` | string | e.g. `swacpvamu25100004` |
| `person_id` | string | join key to roster source |
| `team` | string | bare id, no season suffix |
| `name_raw` / `name_display` | string | `"Peters,Cameron"` / `"Cameron Peters"` |
| `jersey_number` | number\|null | |
| `position` / `position_assumed` / `position_group` | string | |
| `class_year` | string\|null | AP-style `"Sr."`; **frequently null** |
| `is_transfer` / `transfer_tier` | bool / string | |
| `height` / `weight` / `bmi` / `body_type` | number / string | |
| `home_state` | string | 2-letter |
| `experience_score` | number | |
| `games_played` | number | |
| `total_production` | number | |
| `avg_production` | number | `total_production / games_played` |
| `par` | number | production above replacement |
| `season_components` | object | see below |
| `games[]` | array | `{ game_id, total, components{} }` |

### 5.2 `player_seasons_2025.json`

1,946 records. Roster/bio source. Adds: `full_name`, `first_name`, `last_name`, `team_id`, `season`, `raw_position`, `class_year_raw`, `class_year` (numeric 1–5), `is_redshirt`, `transfer_inferred`, `previous_school`, `high_school`, `image_url`, `hometown`, `birth_place`, `home_city`, `is_in_state`, `distance_miles`, `distance_tier`.

**Known nulls:** `distance_miles` and `distance_tier` are populated for 0 players. `previous_school` / `high_school` sparse.

**Merge rule:** bio fields prefer `rosterEntry` (its `class_year` is reliable, the stats source's is not); production fields come only from the stats source.

### 5.3 Verified structural relationships

Both confirmed against all 1,054 enriched records:

**A. Components sum exactly to production.** Zero exceptions.

```
sum(season_components.values()) === total_production
```

**B. PAR is production minus a replacement baseline.**

```
par = total_production − replacement_baseline
```

`replacement_baseline` is a flat per-season constant tied to the player's listed position, **not** scaled by games played and **not** decomposable per component. Observed values: QB ≈ 55.08, DB 3.92, TE 3.93, WR 3.84, RB 2.94, plus 0.78 / 9.97 / 12.70 variants on defensive profiles.

Worked example (Cameron Peters, QB, Prairie View):

```
passing_production  163.20
rushing_production   34.14
                   ───────
total_production    197.34
− replacement        55.08
                   ───────
par                 142.26
```

These four numbers are currently rendered in two unrelated sections of the Overview with no indication they form one equation. Worth fixing.

### 5.4 Existing component vocabulary

`season_components` ships six keys today:

`passing_production` · `rushing_production` · `receiving_production` · `hit_production` · `hawk_production` · `scrum_production`

`hit` / `hawk` / `scrum` are the defensive family. This vocabulary needs reconciliation against the production-block naming requested in §7.

---

## 6. Tab Contracts

### 6.1 Bio & Background (`profile`)

**Component:** `PlayerBioBackgroundPanel.js` — one unified `cols={4} rows={2}` shell, four internal columns divided by borders (no separate cards).

| Column | Content | Source |
|---|---|---|
| Comparatives | Height/weight vs position peers, tier-colored value + percentile bar | real, derived from peers |
| Position on Roster | Class-year distribution grid, current player's cell filled | real (`positionClassCounts`) |
| Class Timeline | FR→GR stepper | real (merged `classYear`) |
| Background | Transfer tier, previous school, high school, hometown | real (roster source) |
| Home State | `PlayerHomeStateMap` — school state + home state | real (`home_state`, `is_in_state`) |

**Tier color scale** (shared language across the page): `≥80` green · `≥60` light-green · `≥40` yellow · `≥20` orange · below red.

### 6.2 Season Stats (`production`)

**Component:** `PlayerStatsTab.js`. Overview field inventory in §7.

| View | Real today | Mock |
|---|---|---|
| Overview | `par`, `season_components`, `total_production`, `games_played` | all counting stats, season-by-season table, EPA row |
| Game Log | per-game `total` + `components` | per-game counting stats |
| Trends | `games[].total` series | percentile trend |
| Compare | full — PAR-ranked position peers | — |

### 6.3 Advanced Analytics (`stats`)

**Component:** `PlayerAdvancedTab.js`. Seven views, most awaiting backend.

| View | Status |
|---|---|
| Radar | mock, position-family-aware axes |
| Splits | mock, real field *names* from inventory doc |
| Called-Upon | blocked — labeled "Not Built Yet" |
| Opp. Adjusted | blocked — labeled, uses real week numbers |
| Field Map | mock |
| Modules | mock, position-gated (Havoc / Pocket / FG Range / Punt) |
| Trajectory | partial — real transfer/redshirt/class flags, blocked role-change + coaching-continuity |

**Convention:** genuinely unbuilt backend features render as explicit amber "Not Built Yet" previews rather than being silently omitted.

---

## 7. Backend Contract — Requested

### 7.1 Production blocks (vocabulary to dictate)

Restructure production as **modular blocks**. The page renders one block per type present in the payload, so a pocket passer gets one and a dual-threat gets two with no special-casing. Each block is self-contained: its own counting stats, its own production score, its own above-replacement value.

| Block | Backend status |
|---|---|
| Passing | exists — `passing_production` |
| Rushing | exists — `rushing_production` |
| Receiving | exists — `receiving_production` |
| Havoc | partial — maps onto `hit` / `hawk` / `scrum`, needs naming reconciliation |
| Defense (counting) | not a component today |
| Punting | absent |
| Punt return | absent |
| Kickoff | absent |
| Kick return | absent |
| Field goals | absent |
| Position-group / team-unit categorization | absent |

### 7.2 Counting stats per block — QB scope

**Passing** — `dropbacks`, `pass_att`, `completions`, `comp_pct`, `pass_yds`, `pass_td`, `int`, `sacks_taken`, `sack_yds_lost`, `yds_per_att`, `net_yds_per_att`, `long_pass`, `20plus_completions`, `40plus_completions`, `first_downs_passing`, `fumbles`, `fumbles_lost`

**Rushing** — `rush_att`, `rush_yds`, `rush_td`, `ypc`, `long_rush`, `scrambles`, `scramble_yds`, `designed_runs`, `designed_run_yds`, `10plus_runs`, `20plus_runs`, `first_downs_rushing`, `rush_att_inside_5`, `rush_td_inside_5`, `fumbles`, `fumbles_lost`

**Receiving** — `targets`, `receptions`, `catch_pct`, `rec_yds`, `rec_td`, `ypr`, `long_rec`, `first_downs_receiving`, `drops`

**Cross-block totals** — `total_yds`, `total_td`, `total_touches`, `yds_from_scrimmage`

No passer rating — not in the pipeline and not requested.

### 7.3 Efficiency — Overview scope only

`epa_total` · `epa_per_play` · `wpa_total` · `success_rate` · `total_production` · `par` · `replacement_baseline` · `avg_production`

Per-block variants where the block exists: `epa_passing`, `epa_rushing`, `success_rate_passing`, `success_rate_rushing`.

`replacement_baseline` should ship as an explicit field rather than being inferred by subtraction.

Everything else — CPOE, ANY/A, pressure rate, time to throw, explosive rate, turnover-worthy rate, sack rate, air yards / YAC — belongs to **Analytics**, not Overview.

### 7.4 Signature moments

`best_game` (PAR + opponent + week) · `worst_game` · `standout_play` (max EPA/WPA play + description) · `homecoming_game` · `rivalry_game` · `ranked_opponent_game` · `primetime_game` · `postseason_game` · `season_debut` · `most_recent_game` · `game_winning_drives` · `fourth_quarter_comebacks` · `largest_deficit_overcome`

### 7.5 Share & role

`share_of_team_production` · `share_of_team_production_by_block` · `share_of_team_yards` · `share_of_team_tds` · `snap_count` · `snap_share` · `dropback_share` · `weeks_as_team_leader`

### 7.6 Form

`last3_avg_par` · `last3_vs_season_avg` · `last5_avg_par` · `rolling3_par_series` · `trend_direction` · `game_over_game_delta`

### 7.7 Consistency & floor

`par_floor` (25th pct game) · `par_ceiling` (75th pct / max) · `par_median` · `par_stddev` · `boom_game_count` · `bust_game_count` · `games_above_replacement` · `pct_games_above_replacement` · `worst_to_best_spread`

### 7.8 Light comparatives

Attach to each counting stat and each production score: `conference_rank` · `conference_qualifiers` · `percentile`.

Position-scoped only. National / HBCU rank, award counts, and leader-weeks belong to **Compare**.

### 7.9 Derivable today, no backend needed

These come out of `games[]` and the peer array with data already shipping, and should not wait on the pipeline:

| Field | Derivation |
|---|---|
| `best_game` / `worst_game` | max/min of `games[].total` |
| `share_of_team_production` | player `total_production` ÷ team sum |
| `par_floor` / `par_ceiling` / `par_stddev` | distribution of `games[].total` |
| `last3_vs_season_avg` | tail of `games[]` vs `avg_production` |
| `games_above_replacement` | count of `games[].total` > per-game baseline |
| `replacement_baseline` | `total_production − par` |

### 7.10 Scope routing

Where each family lives, so Overview stops restating other tabs:

| Family | Home |
|---|---|
| Counting stats, basic efficiency, signature moments, share & role, form, consistency & floor | **Overview** |
| Trajectory, multi-season progression | **Trends** |
| Clutch & situation, opponent context, advanced efficiency | **Analytics** |
| Full peer standing, national rank, awards | **Compare** |
| Availability metrics | **Cut** — not wanted |

---

## 8. Design Decisions

### 8.1 Overview must not restate other tabs

The Overview's failure mode is becoming a summary of the other three views. Game-log rows, the full compare list, and the full chart set each have a dedicated view. Overview earns its place by showing the *season-level* story: production composition, standing, form, and signature moments.

### 8.2 Real / mock / blocked discipline

Every field falls in exactly one bucket and is treated differently:

- **Real** — used directly, no annotation
- **Mock** — formula-driven off a real signal (`clamp(base + signal * weight, min, max)` where `signal = total_production ?? par`), so magnitude tracks something true; commented as mock at the source
- **Blocked** — rendered as an explicit amber "Not Built Yet" preview, never silently dropped

The season-by-season table currently violates the spirit of this — its 2024 and 2025 rows are byte-identical because no prior-season data exists. It reads as fake at a glance and should be gated behind real multi-season data or reduced to a single season row.

### 8.3 No third semicircle gauge

The semicircle-arc gauge has been built twice (banner Glory Rating, Overview PAR) and read thin and undersized both times. PAR magnitude now uses the tier-colored value + percentile bar language from Bio's Comparatives instead. If a radial mark is wanted later, reuse the ring-badge treatment already shipping on the Roster hub KPI row rather than hand-rolling a third arc.

**Standing lesson:** CSS `aspectRatio` on a wrapper drifts from the SVG `viewBox` inside flex layouts and distorts arcs. Use explicit matching `w`/`h` pairs plus `preserveAspectRatio="none"`.

### 8.4 Typography

Numeric values use `fontWeight="black"` / `900`+ with `fontFamily="mono"`, sourced from the game page's Data Room stat treatment. Color carries the quality signal (tier scale) so the value itself reads good/bad without a separate badge.

### 8.5 Charting

Recharts is the charting library going forward. First conversion: `SeasonBarChart` in `GameSpotlightColumn.js` — gained real hover tooltips and dropped hand-rolled axis math. Remaining hand-rolled charts (`MiniParChart`, `PercentileTrendChart`, `ComponentBreakdownChart`, `RadarChart`) are conversion candidates where tooltips or axis math would genuinely help.

Install note: the repo requires `--legacy-peer-deps` because `react-simple-maps@3` pins React 18 while the project is on React 19.

---

## 9. Current Gaps

| # | Gap | Impact |
|---|---|---|
| 1 | Zero counting stats in any data source | Entire headline row, game log detail, and season table are fabricated |
| 2 | No multi-season data | Season-by-season table shows duplicate rows; career totals meaningless |
| 3 | No EPA / WPA / success rate per player | Efficiency row is placeholder-labeled |
| 4 | `replacement_baseline` only inferable by subtraction | Cannot show the PAR equation authoritatively |
| 5 | No production blocks for kicking, punting, returns | Specialists have no page |
| 6 | `hit`/`hawk`/`scrum` vocabulary unreconciled with havoc/defense naming | Defensive players render with opaque labels |
| 7 | `class_year` null in stats source | Fixed by roster merge; do not read it from stats directly |
| 8 | `distance_miles` / `distance_tier` null for all players | Home-state distance context blocked |
| 9 | Ranks and percentiles computed client-side | Conference-scoped only; no national context |

---

## 10. Relationships

| Page | Relationship |
|---|---|
| `/players` | Discovery grid and leaderboard rows route here |
| `/rosters` · team roster tab | `PlayersTab` cards, `RosterOutlookCarousel`, `RosterFeatureRail` route here |
| `/analytics/players` | Player Analytics hub leaders route here |
| `/game/:gameId` | Box score and Glory MVP panels should route here (not yet wired) |

---

## 11. Next Build Priority

1. Rebuild the Overview around the production-composition equation (§5.3) so PAR, components, and total production read as one relationship
2. Implement the §7.9 derivable-today fields — real substance with no pipeline dependency
3. Collapse the duplicate Per-Game Averages and Advanced rows into one efficiency strip
4. Gate or remove the fabricated season-by-season table until real multi-season data lands
5. Deliver §7.1 production-block vocabulary to the backend as the counting-stat contract
6. Wire game page box score → player page links

---

*Last updated: 2026-08-22 | Field inventory and structural findings verified against `player_stats_2025_enriched.json` (1,054 records)*
