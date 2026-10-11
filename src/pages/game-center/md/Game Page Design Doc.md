# Game Page - Design Document

**Route:** `/game/:gameId`  
**File:** `src/pages/game-center/GamePage.js`  
**Last updated:** 2026-08-25  
**Fetch contract:** tracked in [Game Center Fetch Contract.md](./Game%20Center%20Fetch%20Contract.md) — the cross-page rules there apply to this page's payload like any other.

> **Structure note.** This doc predates the 2026-08-25 Game Center doc pass and was **not** rewritten — it was already the most complete doc in the folder. It keeps its own section numbering rather than the 8-section shape used by the hub and schedule docs. Only cross-links and the rules below were added.

---

## 1. Page Identity

- **Page Name:** Game Page
- **Primary User Job:** Move from a schedule or hub card into one specific game and understand what happened, who drove the result, and how the game unfolded.
- **Character:** Editorial recap + analytics document. More immersive than a table dump, but denser and more detailed than the Game Center Hub.
- **Relationship to Game Center Hub:** This page is the downstream destination for the Hub's featured games, results rail, and recap links. It should feel like the same design system at a deeper level.

---

## 2. Architecture

The page follows the **thin page + rich components** pattern. `GamePage.js` is the route entry — it fetches data and routes to the active tab. All UI lives in `src/components/game/page/`.

```
src/components/game/page/
├── index.js                    # barrel exports
├── GamePageShell.js            # PageShell wrapper + section router
├── panels/                     # reusable primitives
│   ├── SectionShell.js
│   ├── DualStatRow.js
│   └── StubPanel.js
├── utils/
│   ├── teamHelpers.js          # getTeamLabel, getTeamColor, getTeamLogoSrc
│   └── normalizeDrives.js
├── summary/                    # Summary tab
│   ├── SummaryTab.js
│   ├── TeamMetricsPanel.js
│   ├── GameLeadersPanel.js
│   ├── TeamStatsPanel.js
│   ├── GameInfoPanel.js
│   ├── DrivesPanel.js
│   ├── GloryMVPPanel.js
│   └── GameProductionComparison.js
├── boxscore/                   # Box Score tab
│   └── BoxScoreTab.js
├── teamstats/                  # Team Stats tab
│   └── TeamStatsTab.js
└── pbp/                        # Play By Play tab
    └── PlayByPlayTab.js
```

### Data Flow

```
GamePage (fetches game + images)
  ↓ passes data props
GamePageShell (reads activeSection, renders banner + active tab)
  ↓ passes subset of data
SummaryTab / BoxScoreTab / TeamStatsTab / PlayByPlayTab
  ↓ passes specific data slices
Individual Panels (pure props, no data fetching)
```

### GamePage.js Contract

`GamePage.js` is **under 100 lines**. It does exactly four things:

1. **Fetch** — `useQuery(["game", gameId])` + `useQuery(["playerImages"])`
2. **Derive** — `awayId`, `homeId`, `awayShort`, `homeShort`, `season`, `drives`
3. **State** — `activeSection` ("summary" | "boxscore" | "teamstats" | "pbp")
4. **Render** — `<GamePageShell {...allDataProps} />`

No inline components. No layout logic. No panel definitions.

---

## 3. PageShell Layout

The page is a **hybrid PageShell page**:

- `PageShell.Slot cols={4}` for the top hero/banner
- all deep-dive content lives inside `listContent`

```jsx
<PageShell listContent={listContent}>
  <PageShell.Slot cols={4}>
    <GameBannerScoreboardA game={game} activeTab={activeTab} onTabChange={handleTabChange} />
  </PageShell.Slot>
</PageShell>
```

---

## 4. Section Model

`GameBannerScoreboardA` controls the local section state. The page currently supports:

| Section ID | Label | Component | Status |
|---|---|---|---|
| `summary` | Game Summary | `SummaryTab` | Live |
| `boxscore` | Box Score | `BoxScoreTab` | Live |
| `teamstats` | Team Stats | `TeamStatsTab` | Live |
| `pbp` | Play By Play | `PlayByPlayTab` | Live |
| other tabs | — | "coming soon" stub | Partial |

---

## 5. Component Data Contracts

Each component below lists its **props** and the **game JSON paths** it reads.

### 5.1 Summary Tab

**File:** `src/components/game/page/summary/SummaryTab.js`

**Props:**
| Prop | Type | Source |
|------|------|--------|
| `awayId` | string | `metadata.away_team.id` |
| `homeId` | string | `metadata.home_team.id` |
| `meta` | object | `metadata` |
| `teamBox` | object | `team_box` |
| `advancedTeam` | object | `advanced_team` |
| `teamEntries` | array | `Object.entries(individual_stats)` |
| `imageMap` | object | `fetchPlayerImages()` |
| `productionScores` | object | `production_scores` |
| `drives` | array | `normalizeDrives(drive_summary)` |
| `plays` | array | `play_by_play` |

**Layout:** 3-column grid (`1fr 2fr 1fr`)

```txt
| Left Column              | Middle Column        | Right Column           |
|--------------------------|----------------------|------------------------|
| GameOverviewHeroCard     | MomentumTimelineCenter | GloryMVPPanel         |
| ImpactLeadersCard        |                      | DivisionContextCard    |
| BroadcastComparisonCard  |                      | HiddenEdgesCard        |
| GameInfoPanel            |                      | ClutchPerformanceCard  |
```

---

### 5.2 TeamMetricsPanel

**File:** `src/components/game/page/summary/TeamMetricsPanel.js`

**Props:**
| Prop | Type | Game JSON Path |
|------|------|----------------|
| `awayId` | string | `metadata.away_team.id` |
| `homeId` | string | `metadata.home_team.id` |
| `teamBox` | object | `team_box` |
| `advancedTeam` | object | `advanced_team` |

**Data consumed:**
| Display | Source Field | Object |
|---------|-------------|--------|
| EPA / Play | `epa_per_play` | `advanced_team[teamId]` |
| Success Rate | `success_rate` | `advanced_team[teamId]` |
| Yards / Play | `total_yards / plays_offense` | `team_box[teamId]` (derived) |
| EPA / Rush | `epa_per_rush` | `advanced_team[teamId]` |
| EPA / Pass | `epa_per_pass` | `advanced_team[teamId]` |
| Explosive Rate | `explosive_rate_yardage` | `advanced_team[teamId]` |
| 3rd Down | `third_down_conversion_rate` | `team_box[teamId]` |
| Red Zone TD% | `red_zone_td_rate` | `advanced_team[teamId]` |
| Stuff Rate | `stuff_rate` | `advanced_team[teamId]` |
| Havoc Rate | `havoc_rate_forced` | `advanced_team[teamId]` |

---

### 5.3 GameLeadersPanel

**File:** `src/components/game/page/summary/GameLeadersPanel.js`

**Props:**
| Prop | Type | Game JSON Path |
|------|------|----------------|
| `awayId` | string | `metadata.away_team.id` |
| `homeId` | string | `metadata.home_team.id` |
| `teamEntries` | array | `Object.entries(individual_stats)` |
| `imageMap` | object | `fetchPlayerImages()` |

**Data consumed:**
| Leader | Source | Sort Field |
|--------|--------|------------|
| Passing Yards | `individual_stats[teamId].passing` | `yards` |
| Rushing Yards | `individual_stats[teamId].rushing` | `yards` |
| Receiving Yards | `individual_stats[teamId].receiving` | `yards` |
| Havoc Leader | `individual_stats[teamId].defense` | `tfl + sacks + pd + int + ff` |
| Tackles | `individual_stats[teamId].defense` | `tackles` |

---

### 5.4 TeamStatsPanel

**File:** `src/components/game/page/summary/TeamStatsPanel.js`

**Props:**
| Prop | Type | Game JSON Path |
|------|------|----------------|
| `awayId` | string | `metadata.away_team.id` |
| `homeId` | string | `metadata.home_team.id` |
| `teamBox` | object | `team_box` |

**Data consumed:**
| Display | Source Field | Object |
|---------|-------------|--------|
| Total Yards | `total_yards` | `team_box[teamId]` |
| Turnovers | `turnovers_committed` | `team_box[teamId]` |
| 3rd Down | `third_down_conversions / third_down_attempts` | `team_box[teamId]` |
| 4th Down | `fourth_down_go_conversions / fourth_down_goes` | `team_box[teamId]` |

---

### 5.5 GameInfoPanel

**File:** `src/components/game/page/summary/GameInfoPanel.js`

**Props:**
| Prop | Type | Game JSON Path |
|------|------|----------------|
| `meta` | object | `metadata` |

**Data consumed:**
| Display | Source Field |
|---------|-------------|
| Date | `metadata.date` |
| Site | `metadata.site` |
| Season | `metadata.season` |
| Week | `metadata.week` |
| Attendance | `metadata.attendance` |

---

### 5.6 DrivesPanel

**File:** `src/components/game/page/summary/DrivesPanel.js`

**Props:**
| Prop | Type | Source |
|------|------|--------|
| `drives` | array | `normalizeDrives(drive_summary)` |
| `plays` | array | `play_by_play` |
| `awayId` | string | `metadata.away_team.id` |
| `homeId` | string | `metadata.home_team.id` |
| `awayShort` | string | `getTeamLabel(awayId)` |
| `homeShort` | string | `getTeamLabel(homeId)` |

**Data consumed:**
| View | Source | Filter |
|------|--------|--------|
| Important / Scoring Plays | `play_by_play` | `scoring_event === true` OR `\|wpa\| >= 0.05` |
| All Drives | `drive_summary` (normalized) | — |

---

### 5.7 GloryMVPPanel

**File:** `src/components/game/page/summary/GloryMVPPanel.js`

**Props:**
| Prop | Type | Game JSON Path |
|------|------|----------------|
| `awayId` | string | `metadata.away_team.id` |
| `homeId` | string | `metadata.home_team.id` |
| `productionScores` | object | `production_scores` |
| `imageMap` | object | `fetchPlayerImages()` |

**Data consumed:**
| Display | Source |
|---------|--------|
| MVP name, position, team | Top `production_total` across both teams |
| Production Score | `production_scores[teamId][].production_total` |
| Component breakdowns | `production_scores[teamId][].components` |

---

### 5.8 GameProductionComparison

**File:** `src/components/game/page/summary/GameProductionComparison.js`

**Props:**
| Prop | Type | Game JSON Path |
|------|------|----------------|
| `awayId` | string | `metadata.away_team.id` |
| `homeId` | string | `metadata.home_team.id` |
| `productionScores` | object | `production_scores` |

**Data consumed:**
| Display | Source |
|---------|--------|
| Player production bars | `production_scores[teamId]` sorted by `production_total` |
| Bucket colors | Primary: pass/rec/hit, Secondary: rush/hawk, Tertiary: turnover/scrum |

---

### 5.9 Production Tab (was "Box Score")

**File:** `src/components/game/page/boxscore/BoxScoreTab.js` (section id stays `boxscore`; the tab label is **Production**)
**Panels:** `PassingProductionClean.js` · `RushingProductionClean.js` · `DefenseProductionClean.js`, all built from `ProductionPrimitives.js`
**Contract:** [Game Page Fetch Contract.md → Production](./Game%20Page%20Fetch%20Contract.md) — field-and-type level, one section per unit, plus the two open units

The old production tables (`QGameBoxScore.*`, `PassingBoxScoreV2`, `GameProductionSpecialTeamsE`, `GameProductionComparison`) are gone from this tab. The 58/42 split, smart pagination and bottom disruption pills described in earlier versions of this section are not the shipped design.

#### The house shell

Every unit panel is the same four-row block, rendered once per team, away | home side by side (`xl: 1fr 1fr`, stacked below):

```
+- * {School} {Unit} Production ---------------------+   SectionLabel   team-colour dot, hairline
|  TEAM TABLE   Total / (splits)  . stat columns     |   PlainTable     static, never drops a column
|  [chips, e.g. Havoc Rate]                          |   StatChip
+----------------------------------------------------+
|  SPOTLIGHT  portrait bleed . name . chips . chart  |   SpotlightCard  short band; chart is the unit's own
+----------------------------------------------------+
|  ROSTER     Player . stats... . PRODUCTION SCORE   |   RosterTable    measured columns; drops low-priority first
|             click row -> spotlight                 |   parColumn / ProductionBar
+----------------------------------------------------+
```

| Primitive | Rule |
|---|---|
| `SectionLabel` | dot + label + hairline. No "TEAM · SECTION" construction |
| `PlainTable` | team aggregate. Few columns, full width, never drops one |
| `RosterTable` | real pixel measurement per column; drops later / lower-`priority` columns to fit; column 0 never drops. Row click sets the active player |
| `SpotlightCard` | portrait bleeds off the left edge under a scrim; <= `clamp(5.5rem, 8vw, 7rem)` tall. Children = the unit's chart |
| `parColumn` + `ProductionBar` | one shared domain per table (real min/max); segments = PAR axes in three alphas of the team accent; negatives stack left in `#C0453A` |
| `sortByPar` | rosters read top-down by `production_total`; no row -> bottom |
| `heatAccent` / `heatFill` | lifts a near-black school primary into a usable band; heat carries a **rate**, never a count; neutral under `minSample` |

**Data rules.** Read the field, dash on null. `production_scores` joins to roster rows by `name`. Rosters show contributors only. Charts draw only what the payload carries — the Defense havoc chart is a labeled concept until ask #11 ships.

| Panel | Team table | Roster | Spotlight chart |
|---|---|---|---|
| Passing | Comp / Att / Yds / Comp% / INT / Sks / Yds-Att · Total + Standard / Passing downs | passers, then receivers | target-zone chart |
| Rushing | Total + Standard / Passing downs | rushers | lane chart (`direction_breakdown`) |
| Defense | Tkl / Hvc / TFL / Sks / PD / FF / INT, one row + Havoc Rate chip | defenders | havoc spatial log (concept) |
| Special Teams | **open** — see contract | | |
| Team Production | **open** — see contract | | |

**Props:**
| Prop | Type | Source |
|------|------|--------|
| `game` | object | Full game payload |
| `playerSeasons` | array | `useAllPlayersByYear(season)` — identity only |
| `awayId` / `homeId` | string | resolved once in `GamePage.js` |
| `productionScores` | object | `production_scores` |

---

### 5.10 Team Stats Tab

**File:** `src/components/game/page/teamstats/TeamStatsTab.js`

**Props:**
| Prop | Type | Game JSON Path |
|------|------|----------------|
| `awayId` | string | `metadata.away_team.id` |
| `homeId` | string | `metadata.home_team.id` |
| `teamBox` | object | `team_box` |
| `advancedTeam` | object | `advanced_team` |

**Components rendered:**
| Component | Data |
|-----------|------|
| `TeamMetricsPanel` | `teamBox` + `advancedTeam` |
| `TeamStatsPanel` | `teamBox` |

---

### 5.11 Play By Play Tab

**File:** `src/components/game/page/pbp/PlayByPlayTab.js` -> `src/components/molecules/game/PlayByPlayPanel.js`
**Adapters:** `utils/normalizePlays.js` (flat export -> the nested shape the panel reads), `utils/normalizeDrives.js`
**Contract:** [Game Page Fetch Contract.md → Play by Play](./Game%20Page%20Fetch%20Contract.md)

Every play of the game as one filterable list, grouped under its drive, with a running score. Reads `play_by_play` and `drive_summary` only.

```
FILTER BAR   Quarter  Q1 Q2 Q3 Q4  .  Team  Away Home  .  Play Type  Rush Pass Special Teams
             Highlights  Big Plays  Scoring Plays  Scoring Drives  .  Player search
-------------------------------------------------------------------------------------
DRIVE HEADER   #n  {team}  Qn 12:34 . 8 plays . 62 yds . TD (+7)
  PLAY ROW     Q  clock | down & dist  | [team chip] raw_text ...          | +12  | badge  | EPA
               spot (2nd & 7 / at HU 34)                                                  v expand
    expanded:  EP before -> after, EPA, penalties quoted from the text, score after the play
```

- Rows colour-code by category (rush / pass / special teams / penalty / other) on the left edge. EPA > +1.0 is a **big play**; < -0.8 is marked negative. Badges: TD, FG, turnover (type), first down.
- Filters are **or** within a group, **and** across groups — "Rush + Scoring Plays" means rushes that scored.
- Play-type buckets read the export's own `play_type`: Rush = `RUSH, KNEEL` · Pass = `PASS, SACK, SPIKE` · Special Teams = `KICKOFF, PUNT, FIELD_GOAL, PAT, RETURN`. `PENALTY` is an outcome, not a kind of play, and sits in none.

**Reconstructed from `raw_text` because the export doesn't carry it** — the tab's backend asks:

| Reconstructed | How today | Ask |
|---|---|---|
| First down | `yards_gained >= distance` | populate `first_down` (exists on the row, always `null`) |
| Penalties | regex over `raw_text` for `PENALTY ... .` | populate `penalties[]` (`penalty` exists on the row, always `null`) |
| Players on the play | names scraped from `raw_text` for the player filter | read `actions[].passer / receiver / rusher ...` — `actions` already ships; the panel predates it |
| Play -> drive | offense-change walk | `drive_id` on each play matching `drive_summary[].drive_id` |

### 5.12 Special Teams Production Panel — OPEN

**File:** not built. The earlier `GameProductionSpecialTeamsE` mock is off the tab.

Five phases — kickoffs, kick return, punts, punt return, field goals — as one unit block in the §5.9 shell. The required block (`special_teams_production[team_id]`, one shape per phase, `by_range` FG buckets, `net_field_position` as the hero stat, optional `specialists[]` for a K / P / KR / PR spotlight) is in [Game Page Fetch Contract.md → Special Teams Production](./Game%20Page%20Fetch%20Contract.md). Layout lands here once the backend confirms or counters that shape.

---

### 5.13 Game Factoids Card (compact density only)

**File:** `src/components/game/page/summary/GameSummaryTabV2.js` (`GameFactoidsCard`)

**Concept:** Replaces the Win Probability slot in the compact-density arrangement only (standard/mobile still show `MockWinProbabilityCard`). A rotating carousel (same interaction pattern as Notable Performers — CSS-driven auto-advance via `onAnimationIteration`, pause/play + equal-width per-item buttons, no `useEffect`) surfacing one "quick at-a-glance" story per card. The goal: every game should have *some* headline factoid regardless of whether it was a blowout, a comeback, or a slugfest — see the four candidate types below.

**Four candidate factoid types (design target):**
1. **Largest single play** (by yards) — always exists, works for any game shape.
2. **Explosive play count/differential** (20+ yard plays) — "who created more chaos."
3. **Penalties/discipline comparison** — "who beat themselves."
4. **Standings/record implications** ("this win moves PVAMU to 7-2 SWAC") — editorial, not derived from the game file at all; needs team season-record data that isn't currently wired into this component tree.

**What's actually shipped right now:** types 1–3, computed client-side from `play_by_play` (see Section 11 for why this is a stopgap, not the target state). Type 4 is not built — it needs new prop plumbing for team season records (currently only surfaced elsewhere, e.g. the main game banner, not passed into `GameSummaryTabV2`).

**Longer-term idea (not built):** rather than 3-4 fixed factoid types, have the backend score several candidate stats by "how notable is this for this specific game" and return whichever ones actually stand out — so a comeback game surfaces its halftime swing, a field-position battle surfaces avg. starting position, etc., instead of the frontend guessing a fixed set. Backend has an alpha system for this; not wired up yet.

---

## 6. Shared Primitives

### SectionShell

**File:** `src/components/game/page/panels/SectionShell.js`

Card wrapper with optional title header. Used by most summary panels.

**Props:** `title` (string, optional), `children`, `minH` (string, optional)

### DualStatRow

**File:** `src/components/game/page/panels/DualStatRow.js`

Away/label/home comparison row with proportional bar.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `label` | string | Center label |
| `awayVal` | number | Away team value |
| `homeVal` | number | Home team value |
| `awayDisplay` | string | Optional override for away display |
| `homeDisplay` | string | Optional override for home display |
| `format` | function | Value formatter |
| `dec` | number | Decimal places for default formatter |
| `lowerIsBetter` | boolean | Inverts win color logic |

---

## 7. Data Fetch Contract

Moved to [Game Page Fetch Contract.md](./Game%20Page%20Fetch%20Contract.md) — request path, query keys, and the typed response per tab. Summary here:

```txt
1. GET /data/93-FE Docs/game-center/games/index.json
2. Match gameId -> { season, game_stem }        // on game_stem (lowercase) OR game_id (uppercase)
3. GET /data/93-FE Docs/game-center/games/{season}/{game_stem}.json
4. GET /data/3-players/player_seasons_{season}.json   // headshots / positions / jerseys only; never a stat
```

| Data | Query Key | staleTime |
|------|-----------|-----------|
| Game payload | `["game", gameId]` | default |
| Player seasons | `["player-seasons", season]` (via `useAllPlayersByYear`) | 5 min |

**Legacy alias:** `/game/pvamutsu` resolves to the newest `*pvamutsu*` stem. Not part of the contract.

### Cross-page rules that apply here

Per [Game Center Fetch Contract.md](./Game%20Center%20Fetch%20Contract.md), regardless of the payload shape below:

- **Both sides always resolved** (rule 3). Every game names its home and away side with a `team_id` or display text — never a null side with no text, neutral-site games included.
- **Direct numeric scores** (rule 4). Never parse a `display_score` string to recover `home_score` / `away_score`.
- **League structure is backend-owned** (rule 7). `teams.json` supplies logos and colors here, nothing structural.

Classification (`is_covered_matchup`, `conference_scope`, `game_type`, ...) is **not** required on this page — it filters nothing. It carries one game the user already chose. Those fields belong on the pages that route *into* here.

### Target Backend Fetch Contract

Future integration should return a page-shaped payload:

```txt
game_detail_payload(game_id)
```

Suggested payload shell:

```json
{
  "game_id": "W15pvamujsu",
  "season": 2025,
  "metadata": {},
  "teams": {},
  "summary": {},
  "box_score": {},
  "play_by_play": {},
  "team_stats": {},
  "stat_glossary": {},
  "data_quality": {}
}
```

---

## 8. Game JSON — Top-Level Structure

```
{
  _schema, _source_game_file,
  metadata,
  scoring_summary,
  team_box,
  advanced_team,
  hidden_yardage,
  individual_stats,
  production_scores,
  heat_maps,
  special_teams_advanced,
  sequence_model,
  penalty_advanced,
  coaching_profile,
  defensive_identity,
  drive_summary,
  play_by_play,
  enrichment_summary
}
```

**Season and week** are NOT in game metadata — they come from the index:
- `index[].season` → season year
- `index[].game_id` contains the week encoding (e.g. "W1" prefix in game_stem)
- **DATA GAP:** `metadata.season` and `metadata.week` are undefined. Pipeline should add these.
- **DATA GAP:** `metadata.weather` and `metadata.temperature` exist as keys but are always `null`.
- **DATA GAP:** `metadata.conference` does not exist.

---

## 9. Full Field Inventory by Game JSON Object

### `metadata`

| Field | Type | Notes |
|-------|------|-------|
| `game_id` | string | e.g. "AAMUFAMU29112024" |
| `date` | string | "2024-11-29" |
| `site` | string | "Tallahassee, Florida (Bragg Stadium)" |
| `attendance` | number \| null | |
| `kickoff_time` | string \| null | |
| `weather` | null | **ALWAYS NULL — DATA GAP** |
| `temperature` | null | **ALWAYS NULL — DATA GAP** |
| `home_team.id` | string | exportId without "25" e.g. "swacfamu" |
| `home_team.name` | string | |
| `home_team.abbreviation` | string | |
| `home_team.score` | number | |
| `away_team.*` | same | |
| **season** | — | **MISSING — DATA GAP** (available in index.json) |
| **week** | — | **MISSING — DATA GAP** (available in index.json game_stem prefix) |
| **conference** | — | **MISSING — DATA GAP** |

### `team_box[teamId]`

| Field | Type | Used By |
|-------|------|---------|
| `plays_offense` | number | TeamMetricsPanel (calc), TeamStatsPanel |
| `total_yards` | number | TeamMetricsPanel (calc), TeamStatsPanel |
| `pass_attempts` | number | — |
| `pass_completions` | number | — |
| `pass_yards` | number | — |
| `rush_attempts` | number | — |
| `rush_yards` | number | — |
| `turnovers_committed` | number | TeamStatsPanel |
| `third_down_conversions` | number | TeamStatsPanel |
| `third_down_attempts` | number | TeamStatsPanel |
| `fourth_down_go_conversions` | number | TeamStatsPanel |
| `fourth_down_goes` | number | TeamStatsPanel |

### `advanced_team[teamId]`

| Field | Type | Used By |
|-------|------|---------|
| `epa_per_play` | number | TeamMetricsPanel |
| `success_rate` | number | TeamMetricsPanel |
| `epa_per_rush` | number | TeamMetricsPanel |
| `epa_per_pass` | number | TeamMetricsPanel |
| `explosive_rate_yardage` | number | TeamMetricsPanel |
| `third_down_conversion_rate` | number | TeamMetricsPanel |
| `red_zone_td_rate` | number | TeamMetricsPanel |
| `stuff_rate` | number | TeamMetricsPanel |
| `havoc_rate_forced` | number | TeamMetricsPanel |

### `individual_stats[teamId]`

| Category | Used By |
|----------|---------|
| `passing` | GameLeadersPanel (top by yards) |
| `rushing` | GameLeadersPanel (top by yards) |
| `receiving` | GameLeadersPanel (top by yards) |
| `defense` | GameLeadersPanel (havoc score, tackles) |

### `production_scores[teamId]`

| Field | Used By |
|-------|---------|
| `player_key` | GloryMVPPanel, GameProductionComparison |
| `name` | GloryMVPPanel, GameProductionComparison |
| `position` | GloryMVPPanel, GameProductionComparison |
| `production_total` | GloryMVPPanel, GameProductionComparison |
| `components` | GloryMVPPanel, GameProductionComparison |

### `drive_summary[]`

| Field | Used By |
|-------|---------|
| `offense_team` | DrivesPanel |
| `quarter_start` | DrivesPanel |
| `clock_start` | DrivesPanel |
| `plays_total` | DrivesPanel |
| `yards_net` | DrivesPanel |
| `result` | DrivesPanel |
| `points` | DrivesPanel |

### `play_by_play[]`

| Field | Used By |
|-------|---------|
| `scoring_event` | DrivesPanel (filter) |
| `wpa.wpa` | DrivesPanel (filter) |
| `offense_team` | DrivesPanel, PlayByPlayPanel |
| `quarter` | DrivesPanel, PlayByPlayPanel |
| `clock` | DrivesPanel, PlayByPlayPanel |
| `raw_text` | DrivesPanel, PlayByPlayPanel |
| `score_away_after` | DrivesPanel |
| `score_home_after` | DrivesPanel |

---

## 10. Design Direction

### Game Overview Must Mirror Hub Feature Cards

The **Game Overview** area should not feel like a separate visual language from the Game Center Hub.

**What Should Carry Over:**
- strong scoreboard-first hierarchy
- bigger team identity
- larger, bolder short names
- more prominent logos
- team-color atmospheres / gradients
- optional watermark behavior
- clean center tension around score / winner / matchup
- a supporting editorial sub-row like MVP, glory player, or production note

**What Should Change:**
- more information-rich than the Hub card
- less compressed
- allowed to add secondary rows and context
- still bold enough to feel like a continuation

**Rule:** Game Overview components should be treated as expanded descendants of the Hub featured-game card family.

### Suggested Card Family Language

- `Game Overview Hero Card`
- `Impact Leaders Card`
- `Broadcast Comparison Card`
- `Glory Performer Card`

---

## 11. Pipeline Requests

### P0 — Needed for polished overview cards

- final score by team
- quarter scoring by team
- game status / completed flag
- home / away team IDs
- team display-name safety through v5 IDs and frontend join metadata
- date, venue, attendance, kickoff time when available
- **Consolidated Marquee Ticker Leaders (`ticker_leaders`)**: Pre-calculate leading performers
- top game performers with stable player identity
- production / glory score candidate for MVP strapline
- scoring summary grouped by quarter
- chart-ready EPA timeline
- chart-ready drive summary
- stat glossary entries for every non-obvious metric

### P1 — Strongly desired

- excitement score or game quality score
- lead-change count
- largest lead
- decisive drive or decisive play marker
- ranked list of top 2-3 impact players
- hidden-edges summary
- standings snapshot at game week/date (blocks Game Factoids card's "record implications" type — see 5.13)
- `penalized_team` (and ideally `penalty_yards`) as a structured field on `PENALTY` plays in `play_by_play` — currently only recoverable by regex-parsing `raw_text` ("PENALTY PVAM UNS..."), which is what the Game Factoids card's penalty-comparison type does today as a stopgap. Fragile, should not stay long-term.

### P2 — Future premium

- win probability snapshots
- EPA summaries
- drive success / explosiveness rollups
- actor-enriched play-by-play rows
- significant series/drive/quarter summaries

---

## 12. Current Gaps

| # | Gap | Impact |
|---|---|---|
| 1 | `summary` panels are informative but not visually aligned with Hub featured cards | Weak continuity between hub click and game destination |
| 2 | `Win Probability`, `EPA Chart`, and `Standings` are still stub panels | Right column feels unfinished |
| 3 | `scoring_summary` is empty in sample data despite scoring events in PBP | Quarter scoring requires frontend derivation |
| 4 | `play_by_play[].wpa` is null | Win probability chart blocked |
| 5 | `hidden_yardage` exists but is null | Hidden edges need fallback or pipeline fix |
| 6 | Standings context not embedded in game payload | Needs second source or game-week snapshot |

---

## 13. Relationships

| Page | Relationship |
|---|---|
| `/game-center` | Featured cards and results rail hand off into this page |
| `/game-center/games` | Games Hub recap/story cards route here |
| `/game-center/seasonschedule` | Season schedule cells route here |
| `/game-center/conferenceslate` | Conference Slate cells route here |
| `/game-center/team` | Team schedule links route here |
| `/game-center/week` | Week Central cards route here |

Every one of those routes is `/game/{game_path_id}`, gated on a `has_game_page` / `has_recap` / `has_detail_page` flag in the upstream payload. Those flags are named inconsistently across the six contracts — worth unifying to one name when the backend next touches them.

**This page is the reason those flags matter.** A cell, row, or card that links here when no game file exists produces a dead route; one that fails to link when a file does exist hides the deepest content on the site.

---

## 14. Next Build Priority

1. Refactor summary modules to visually inherit from Hub featured game cards
2. Make left and right feature panels feel like one connected game package
3. Replace at least one right-column stub with a real downstream component
4. Continue promoting lab-winning components into `game/page/` production files
5. Document component contracts before each lab variant, per `AgentDesignBible.md`

---

*Last updated: 2026-08-25 | Cross-page rules and route-flag note added. Structure unchanged — see the note at the top.*
*2026-05-25 | Restructured: GamePage.js split into 18 files under `src/components/game/page/`*
