# Roster Hub — Design Document

**Route:** `/rosters` (`defaultMode="team"`) · `/rosters/full` (same, `defaultMode="team"`) · `/rosters/breakdown` (`defaultMode="league"`)
**Component:** `src/pages/players/RostersPage.js`
**Purpose:** Dense, interactive data hub for roster intelligence across all 18 HBCU programs — composition, experience, physical profile, geography, and transfer activity, per team / per division / league-wide.

Confirmed working on desktop and mobile — 2026-08-26.

---

## 1. Current Implementation

The page that shipped is simpler than the original 8-section concept below (see Legacy Reference) — one banner, one KPI/mode-switcher panel, and three interchangeable content modes, rather than eight standalone sections including a cross-team Comparator and a 5-year Trend Studio. Neither of those two were built; the components that would have powered them (`RosterComparator`, `ExperienceMatrix`) exist only as unused lab components under `src/components/organisms/test/legacy/`.

### 1.1 Banner — `BannerRostersHub`

One control: **Season** (2021–2025, `ROSTER_HUB_SEASONS`). Desktop uses `BannerDropdown`; mobile puts it behind the `+` advanced-controls sheet, same pattern as Team Schedules — tapping a year commits immediately, no pending/Go two-step on mobile.

### 1.2 KPI + Mode Switcher — `KpiControlPanel`

One panel, two tiers: 4 league-wide KPIs on top (Total Players, Portal Rate, In-State Talent, Avg Recruit Dist — all from `allLeague`, i.e. the season's `all` module), then a 3-way mode switcher along the bottom (By Team / Divisions / League). Mobile stacks the KPIs 2×2.

### 1.3 Mode: By Team (default)

- `TeamModeContent` — team picker (mobile: 6-across logo grid, grayscale until selected; desktop: text-button list). Initial selection is randomized per page load (2026-08-26) — was previously hardcoded to `swacjsu`.
- `TeamAnalyticsPanel` — header strip (team name, links to `/teams/:id/roster/full`) + 4 cards pulled from that team's module in `teams.{id}`:
  - **Composition & Experience** (combined — class donut + Upperclass/Veteran pills)
  - **Physical** (`PositionRangeChart` — per-position height/weight range, plotted against individual player records, not just team averages)
  - **Geographic**
  - **Transfers**
- `PositionRangeChart`'s player-level axis is pinned to `player_seasons_2025.json` (`useSeason2025()`) regardless of the season selector above it — that per-player file only exists for 2025 today. The team-average bar/marker on the same chart does move with the selected season; only the underlying player scatter doesn't.

### 1.4 Mode: Divisions

`DivisionsModeContent` — 3 columns (SWAC East / SWAC West / MEAC), each a team-link list plus the same 4 module cards (Composition, Physical, Geographic, Transfers) aggregated across that division's teams client-side (`aggregateDivision`).

### 1.5 Mode: League

`LeagueModeContent` — the same module set aggregated across all 18 teams, plus two transfer-origin cards (Top States / Hotspots, filtered to `transfers.transfer_geographic`) not shown in Team or Divisions mode.

### 1.6 Mobile status

Confirmed working 2026-08-26. Note for future passes: the banner and mode switcher have dedicated mobile layouts; the analytics cards inside each mode currently reuse the same desktop card components stacked full-width rather than a from-scratch mobile redesign (documented in-code at `RostersPage.js` line ~1873). Reads fine at phone width today — flagged here only so a future density pass on those cards isn't a surprise.

**Still true as of 2026-08-30.** The mobile pass on that date covered the **per-team** roster hub (`/teams/:teamId/roster`), not this league-wide page — see [Team Roster Hub Design Doc.md](./Team%20Roster%20Hub%20Design%20Doc.md). The two are easy to confuse: this document and [Rosters Hub Design Doc.md](../../players/md/Rosters%20Hub%20Design%20Doc.md) both describe `RostersPage.js`, while the per-team hub is `TeamRosterHubPage.js` and had no doc at all until 2026-08-30. The card-density work done there (`CardShell`, `RosterHubGrid`, `RosterFeatureRail`) is a reasonable template if this page gets the same treatment.

---

## 2. Fetch Contract

```text
GET /data/2-schools/roster_hub_{season}.json
{
  year: integer
  total_players: integer
  all: RosterModule                    // league-wide aggregate
  divisions: { [divisionName: string]: RosterModule }
  teams: { [teamId: string]: RosterModule }   // teamId = v5 id, e.g. "swacjsu"
}

RosterModule = {
  composition: {
    total_players: integer
    upperclass_pct: number
    underclass_pct: number
    position_distribution: [{ position: string, count: integer }]
    class_distribution: [{ class: string, count: integer, pct: number }]
  }
  experience: {
    upperclass_pct: number
    veteran_pct: number
    pyramid: [{ class: string, count: integer }]
    by_position_group: { [group: string]: { ... } }
  }
  physical: {
    overall: { height_avg: number, weight_avg: number, ... }
    by_position_group: { [group: string]: { height_avg: number, weight_avg: number, count: integer } }
    notables: { ... }
    size_vs_conference: { [group: string]: { height_z: number, weight_z: number } }
  }
  geographic: {
    total_with_hometown: integer
    in_state_count: integer
    in_state_pct: number
    avg_recruiting_distance_miles: number
    distance_tier_breakdown: { local: integer, regional: integer, national: integer }
    state_distribution: [{ state: string, count: integer, pct: number }]
    hotspots: [{ city: string, count: integer }]
  }
  transfers: {
    transfer_count: integer
    transfer_rate: number
    tier_breakdown: [{ tier: string, count: integer, pct: number }]
    position_impact: [{ ... }]
    transfer_geographic: { state_distribution: [...], hotspots: [...] }
  }
}
```

Divisions and League aggregates in `divisions`/`all` are pre-computed server-side in this file — `RostersPage.js`'s own `aggregateDivision()` helper is a client-side re-derivation used only where a division cut isn't already in the payload (e.g. conference-average comparisons inside Team mode), not a replacement for the shipped `divisions`/`all` fields.

```text
GET /data/3-players/player_seasons_2025.json
[{
  person_id: string
  team_id: string          // v5 id
  position: string
  height: integer | null
  weight: integer | null
  ...
}]
```
2025-only. Powers `PositionRangeChart`'s player-level scatter in Team mode; no equivalent per-player file exists for 2021–2024, which is why that chart's point cloud doesn't move with the season selector.

**Hooks:** `useRosterHub(season)` and `useSeason2025()` in `src/hooks/useSWACData.js`.

---

## 3. Legacy Reference — Original 8-Section Plan (superseded)

Everything below this line is the original concept doc from 2026-04-11. It's preserved for context — some of it (the Data Modules shape) matches what actually shipped; the section-by-section page plan (Comparator, Experience Matrix, Transfer Board, Physical Lab, Trend Studio, Geographic, Team Entry Cards as eight standalone slots) does not. `RosterComparator` and `ExperienceMatrix` exist as built-but-unused components under `src/components/organisms/test/legacy/` if a future pass wants to revive that direction.

### Data Modules (per team / division / all-18)

Every scope exposes the same 5 modules — this part matches the live `roster_hub_{year}.json` shape:

**Module 1: Composition** — `total_players`, `upperclass_pct` / `underclass_pct`, `position_distribution[]`, `class_distribution[]`

**Module 2: Experience** — `upperclass_pct` / `veteran_pct` (Sr + Gr), `pyramid[]`, `by_position_group{}`

**Module 3: Physical Profile** — `overall{}`, `by_position_group{}`, `notables{}`, `size_vs_conference{}` (z-score vs conference avg)

**Module 4: Geographic Pipeline** — `total_with_hometown` / `domestic_count` / `international_count`, `in_state_count` / `in_state_pct`, `avg_recruiting_distance_miles`, `state_distribution[]`, `hotspots[]`

**Module 5: Transfer Strategy** — `transfer_count` / `transfer_rate`, `tier_breakdown[]`, `position_impact[]`, `transfer_geographic{}`

### Original Page Layout — Section by Section (not built as specced)

**Section 1 — Command Header (4x1):** league stat headline, 3 KPI pills, year sparkline. *(Shipped instead as the KpiControlPanel's 4-KPI top tier.)*

**Section 2 — The Comparator (4x4):** two-panel side-by-side team/division/league comparison across 5 tabs (Composition, Experience, Physical, Transfers, Geographic). *(Not built — no comparator UI ships today; Team/Divisions/League are three separate modes, not a dual-panel compare.)*

**Section 3 — Experience Matrix (4x3):** all 18 teams, one row each, sortable stacked class bars. *(Not built as a standalone sortable matrix; the `ExperienceMatrix` lab component exists but isn't wired into the live page.)*

**Section 4 — Transfer Intelligence Board (4x3):** team-selector list + transfer rate/tier donut/position breakdown with an auto-generated philosophy tag ("Portal Raiders" / "JUCO Pipeline" / etc). *(Not built — the philosophy-tag concept was never implemented; Transfers is a card within Team/Divisions/League mode instead of its own board.)*

**Section 5 — Physical Profile Lab (4x3):** ranked bar chart across all 18 teams for a selected position group + z-score heat grid. *(Not built as a dedicated lab; `PositionRangeChart` in Team mode is the physical-profile UI that shipped instead.)*

**Section 6 — 5-Year Trend Studio (4x4):** multi-year grouped bars per metric, using `roster_hub_all.json`. *(Not built — `roster_hub_all.json` is not fetched anywhere in the current page; the season selector re-fetches a single year's file instead of using a combined multi-year export.)*

**Section 7 — Geographic Pipeline (4x2):** top 10 states, city hotspots, in-state % ranked list, "Furthest Reach" callout. *(Partially shipped — state/hotspot lists exist inside the Geographic card in every mode; no dedicated "Furthest Reach" callout or standalone geographic section.)*

**Section 8 — Team Entry Cards (4x2):** Fusion-style 18-card grid with data overlays, linking to `/teams/:id/roster`. *(Not built this way — Team mode's team picker is a flat logo/text grid without data overlays; the Fusion animated-card treatment lives on the Schools Hub directory instead, see [Schools Design Doc.md](Schools%20Design%20Doc.md).)*

### Design Notes (still accurate)

- **Tier colors (transfers):** FBS=blue, FCS=teal, JUCO=orange, D2/D3/NAIA=yellow
- **Class year colors:** Fr=red-muted, So=orange, Jr=yellow, Sr=teal, Gr=brand green
- **Z-score thresholds:** >+1.0 = significantly larger (dark red), <-1.0 = significantly smaller (dark blue), near 0 = gray
- **Height display:** always convert inches → feet/inches: `Math.floor(h/12) + "'" + (h%12) + '"'`
- **"Unknown" position group:** exclude from position-specific charts, include in totals
- **Year selector** is a global page control — not per-section

---

*Last updated: 2026-08-30*
