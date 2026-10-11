# Schools Hub Card System Design Doc

Updated: 2026-08-26  
Scope: Schools Hub (`/teams`, `/schools`)  
Purpose: A standardized page-spec workflow for the Schools Hub, featuring static anchors for standings/rankings and dynamic card rotation via the Why Engine for performance "dash graphs."

## 1. Why This Exists

This doc is the contract between product thinking and page implementation for the Schools Hub.

It standardizes:
- What is fixed vs what rotates (Static Anchors vs Dynamic Candidates)
- How cards are scored and selected (Why Engine)
- How slots are filled predictably (Slot Map)
- How agents should implement pages from spec without re-deciding structure each time

## 2. Core Model

Each page is built from two card classes:

1. **Static Anchors**
   - Always present on that page.
   - Example: 4x1 Hero Banners, 2x2 Conference Standings, 4x1 Wiki CTA.

2. **Dynamic Candidates**
   - Compete for open slots (specifically the "Dash Graph" section).
   - Selected by **Why Engine** score.
   - Same slot footprint (`Slot1x1`), different card type/content by context.

## 4. Sidebar Nav Registrar (Live — `useRouteSideNav.js` `SCHOOLS_ITEMS`)

- **Directory**: Primary directory view (all HBCU programs) — `/schools`.
- **Wiki**: Historical/institution-focused hub — `/schools/wiki`.
- **Rosters Hub**: Global roster explorer, expandable to Roster / Breakdown — `/rosters`.

**Removed for launch.0** (2026-08-26, see `AFTER_LAUNCH_0.md` §1): Coaches Hub and Stadiums. Both routes (`/coaches`, `/schools/stadiums`) stay wired in `App.js`, just not reachable from this sidebar.

## 5. Selection Pipeline (Why Engine)

### 5.1 Score Inputs

Each candidate card (for "Dash Graph" slots) gets a normalized score (0-100):

- **importance_score**: Statistical significance (e.g., league-leading passing attack).
- **recency_score**: Momentum/trending data.
- **identity_score**: HBCU narrative relevance (Rivalry implications).
- **freshness_penalty**: $P_{freshness}$ (prevents same card repeating too often).

### 5.2 Score Formula

$$
S = \sum_i w_i f_i - P_{freshness}
$$

## 6. Page Spec: Schools Hub (Live — `src/pages/teams/Teams.js`)

Confirmed working on desktop and mobile — 2026-08-26. The dash-graph concept below (§6.3, Why-Engine-selected 1x1 cards) was never built — the KPI row that used to occupy that space was fabricated mock data (League Weight Avg / Portal Activity / In-State Talent / Senior Density) and was removed outright rather than replaced with real dynamic cards. No Wiki CTA banner was built into this page either — Wiki is reachable from the sidebar instead.

### 6.1 Slot Map (Grid Blueprint — live)

| Slot | Component |
|---|---|
| `cols=4` | `BannerSchools` (Season selector only — Conference filter removed 2026-08-26, was never wired to anything) |
| `cols=4` | `SchoolsDirectory` (`SchoolDirectoryFusion`) |
| `cols=2, rows=2` + `cols=2, rows=2` | SWAC West / SWAC East standings (`StandingsBrandWash`) |
| `cols=2, rows=2` + `cols=2, rows=2` | MEAC standings (`StandingsBrandWash`) / Power Rankings top 6 (`RankingsPodium`) |
| `cols=2` + `cols=2` | `RosterFieldReport` (→ `/rosters`) / `TeamAnalyticsExplorer` (→ `/team-analytics`) |

Mobile: same components, stacked full-width, `activeTab=rosters` vs `activeTab=coaches` (the latter renders `CoachesHubSchoolsSection` in-page — separate from the sidebar's removed Coaches Hub route).

### 6.2 Static Anchors — data status

| Card | Data status |
| :--- | :--- |
| `SchoolsDirectory` | Real — `teams.json`, plus real player/coach data for the `player`/`coach` frames (see §"Data contract for player / coach frames" above) |
| SWAC West / SWAC East / MEAC standings | **Mock** — `swacWest`/`swacEast`/`meacStandings` are hardcoded `useMemo` arrays in `Teams.js`, not fetched. `standings_race_{season}.json` (the same contract Game Center's Standings page already consumes) covers this exact shape and could replace them directly — not yet wired, tracked in `AFTER_LAUNCH_0.md` §2. |
| `RankingsPodium` (Power Rankings top 6) | **Mock** — same `gloryTop6` hardcoded array, same fix path. |
| `RosterFieldReport` / `TeamAnalyticsExplorer` | Static promo cards, no data — link to `/rosters` and `/team-analytics`. |

### 6.3 Dynamic Candidate Registry (1x1 Dash Graphs) — not built, removed

This was the original plan for slots f/g/h/i (Top 3 Glory Players, PPG/Rushing/Passing Leaders, Turnover Margin, Defensive Rankings, Longest Field Goal, Unit Spotlight, Rivalry Watch, selected by the Why Engine). None of it shipped — what shipped in that space instead was a 4-card fabricated KPI row (League Weight Avg / Portal Activity / In-State Talent / Senior Density), removed 2026-08-26 because none of those numbers were real. If dash graphs come back, they'd need either the Why Engine actually built or a simpler static substitute — not another mock row.

## 6.4 Mobile — Fusion Card Density Pass (2026-08-30)

The directory's live "fusion" tiles were re-densified for phone width. At a quarter of a
phone viewport a tile cannot carry a school's full name and a person's name as well as
imagery, so both were cut in favour of the imagery:

- **School name → abbreviation only.** The full name wrapped to three lines in a tile
  that is mostly logo.
- **Player / coach photo enlarged to span the tile the way the logo does**, with **no
  name beneath it** — the area is too small for a legible name, and the photo plus the
  school's colors already identify the frame.

Follows the section-wide mobile rules in
[Team Hub Design Doc.md](./Team%20Hub%20Design%20Doc.md#mobile-design-2026-08-30-pass):
square corners, no border, edge-to-edge, no padding, `rem` not `px`, no `PageShell`.

### Open question — the generic-avatar frames

Some tiles render with only a generic user icon rather than a photo. **What those frames
are meant to represent was never resolved** — they are either a `player`/`coach` frame
whose subject has no `image_url`, or a frame type with no subject assigned at all. Until
that is settled these tiles read as broken rather than intentional. See §6.2 data status
and the `player` / `coach` frame data contract at the end of this document.

---

## 7. Navigation & Clickability

- **Card Click**: All team rows inside 2x2 cards link to `/teams/:teamId`.
- **Primary CTAs**: Large 4x1 and 2x1 banners must have explicit button targets.
- **Sidebar**: The Schools sidebar remains fixed while browsing child views.

## 8. Definition of Done (QA)

- [x] Layout adheres to Slot Map constraints (no 1.5x1 hacks).
- [ ] Why Engine correctly rotates "Dash Graphs" on reload (Implementation Phase).
- [x] All 2x2 Standings include team logos and records.
- [x] Responsive behavior stacks 2x2s into 1x1s on mobile.
- [x] Wiki CTA button routes successfully.
---------------------------------------------------------------------------------------------------------------------------------
# Schools System Design Doc

Updated: [need date]
Scope: Desktop 
Purpose: A centralized location for easy access to schools, standings, school dash graphs, intrateam comparos

# Game Center Hub - Game Card Notes

Updated: 2026-04-04
Scope: Desktop

Sidebar
Schools
Rosters
School Wiki

Page
4x1 Banner - a
Standings/Rankings Quad 
-2x2 SWAC West - b
-2x2 SWAC East - c
-2x2 MEAC - d
-2x2 Top 6 Glory Rankings - e
1x1 Dash Graphs - f, g, h, i
4x1 Banner - j
2x1, 1x1, 1x1 Roster Call -k, Coach Call -l,Stat Call -m

|a|
|b|c|
|d|e|
|f|g|h|i|
|j|
|k|l|m|

Banner
4x1 
Headline
Blerb

Standings/Rankings Quad 
4x4 - 4 2x2 Sections
Divison (SWAC West, SWAC East, MEAC) + Power Rankings

Format
Header (Division)
Rankings List - 6 teams
Logo - Team - Seaon Record - Conference Record

Rankings
Top 6 Teams
Logo - Team - Glory Rankings

Dash Graphs - Leader or top 3 in various metrics. Will rotate out glory rankings will decide intersting or may be change on reload
1x1
10 Options
Stat Rankings
-Top 3 Glory Players
-Average Points Per Game
-Top Rushing Leaders
-Top Passing Leders
-Top Defenses
-Turnover Margin
-Longest Field Goal
Player/Coach/Unit Spotlight

Schools Wiki Banner
4x1
Call to action banner with Click me button at the end goes to fun wiki page with teams, names, locations, bands, enrollment, and other wiki information

Roster Explorer 
2x1 Section
Card Interface

Carousel - a
Icon - b
Headline - Roster Explorer - c
Blerb - Browse full team rosters and playeres profiles across all schools - c
View Rosters anchor - d

Columns |a|rest|
Rest in rows
b
c
d

###
Add banner
4x2
Grid with all 18 teams to select the team page you want to navigate to.

---
## HBCU Directory — Implementation Status (2026-04-10)

### Decision: Fusion Card
After auditioning 9+ variants in ComponentLab, the **Fusion card** (`SchoolDirectoryFusion.js`) is the
leading candidate for the 4x2 HBCU Directory slot.

**Location:** `src/components/organisms/test/SchoolDirectoryFusion.js`

**Concept:** Each school card is a living stage that independently cycles through content frames.
No fixed order — next frame is always randomly chosen. Hold time is random 5–20s per frame per card.

**6 content frames:**
| Frame | Content | Entrance |
|---|---|---|
| `abbrev` | Big italic shortName (e.g. PVAMU) | Slides in from right |
| `fullName` | Full school name, wraps 2 lines | Cross-fades + scales |
| `logo` | Team logo + mascot name | Drops from top |
| `player` | Rotating top-3-PAR player: avatar photo, position, last name | Rises from bottom |
| `coach` | Head coach: avatar photo, last name | Slides in from right |
| `logoBig` | Logo only — oversized Ken Burns | Slow fade-in |

**`player` frame (updated 2026-08-26):** No longer a generic silhouette + conference placeholder — shows a real player. On each cycle into this frame, one of the team's top-3 PAR players for the season is chosen at random (uniform, not weighted by PAR — "the user won't be on the page long," so a full ranked-scroll wasn't worth the complexity). Falls back to the existing silhouette treatment if the team has no qualifying players yet (data still loading, or no player on that team has both a `par` value and a photo).

**`coach` frame (new, 2026-08-26):** Shows the current-season head coach's photo and last name. No rotation — one head coach per team. Falls back to the silhouette treatment if the team has no Head Coach row for the season (a handful of teams don't yet).

### Data contract for `player` / `coach` frames

Both frames are populated client-side from three existing local exports — no new backend field required, everything here already ships. `SchoolDirectoryFusion` resolves each team's v5 id via `team.exportId.replace(/25$/, "")` (e.g. `alcorn` → `swacalc`) to join against these exports, which key by v5 id rather than the `teams.json` slug.

**`player` — joined from two exports by `person_id`:**

```text
GET /data/0-data/player_stats_2025_enriched.json
[{
  person_id: string
  team: string          // v5 id
  position: string
  par: number
}]

GET /data/3-players/player_seasons_2025.json
[{
  person_id: string
  last_name: string
  image_url: string | null
}]
```
Per team: filter to rows with both a numeric `par` and a joined `image_url`, sort by `par` descending, take top 3.

**`coach` — filtered from one export by `season` + `title`:**

```text
GET /data/4-coaches/coaches_all_years.json
[{
  team_id: string        // v5 id
  season: integer
  title: string           // filtered to /head\s+(football\s+)?coach/i, excluding "assistant"
  last_name: string
  image_url: string | null
}]
```
Per team: the row matching `season === currentSeason` and the head-coach title pattern. If a team has more than one matching row in a season (rare mid-season change), the last one in file order wins — the export doesn't carry an explicit "current as of" flag to disambiguate.

**Hooks:** `useTopPlayersByTeam()` and `useCurrentHeadCoaches(year)` in `src/hooks/useSWACData.js` — both share React Query cache keys with existing hooks (`usePlayerStatsEnriched`, `useCoachingTrees`) so this doesn't add new network requests beyond what those already fetch.

**logoBig frame details:**
- Logo scaled 140–185% — card shows only 70–90% of it, edges bleed off
- Randomly off-center (random translate X/Y) every appearance
- Ken Burns: slow drift with randomized start/end translate + rotate + skewX over the full hold duration
- 5 color treatments chosen randomly: full color / saturated punch / near-white ghost / sepia-tinted / high contrast
- Each appearance injects a unique `@keyframes` rule so no two drifts are ever the same

**Visual base (from Ribbon + Brand Cards combination):**
- School-color diagonal gradient background (`primaryColor` at 20% opacity)
- Faded watermark logo bottom-right (hidden during `logoBig` frame)
- School-color bottom border (3px)
- Hover: scale 1.03 + school-color glow

**Status:** Live on the Schools Hub (`src/components/molecules/schools/SchoolDirectory.js`, rendered from `TeamsPage`/`TeamsMobile`), desktop and mobile. `player` and `coach` frames wired to real data 2026-08-26.