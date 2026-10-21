# HBCU GridIron Glory — AI Agent Guide

**Read this entirely before writing a single line of code.**

---

## ⛔ Folder Boundary — CRITICAL

**Every agent working in `hbcugg1` edits files inside `hbcugg1` only. Never create, edit, move, rename or delete anything outside this folder. No exceptions.**

- **Outside folders are read-only.** That includes the backend (`parser4\` and everything under it: `93-FE Docs`, `92-frontend`, `90-Output`, `999-frontendfeedback`) and any other project.
- **To ask the backend for something, write the note here**, in the right `src/pages/**/md/` folder (e.g. `Backend Notes YYYY-MM-DD.md`). The user carries it over. Never write into `parser4`.
- **Never run backend scripts** that write files (`publish_fe_docs.py`, builders, exporters). Tell the user what needs running.
- **Scratch work stays inside your session or this folder.** Don't leave scripts or temp files in other project folders.

---

## Project Overview

**HBCU GridIron Glory** is a React-based football analytics platform for Historically Black Colleges and Universities (HBCU). It covers 12 SWAC + 6 MEAC programs with team dashboards, player analytics, game center, coaches, officials, scheduling, roster intelligence, and performance tools.

---

## Technology Stack

- **React** ^19 — Core UI framework
- **React Router DOM** ^7 — Client-side routing
- **Chakra UI** ^3 — UI component library (custom dark theme via `src/theme/index.js`)
- **@tanstack/react-query** — Data fetching & caching
- **lucide-react** — Icons
- **framer-motion** — Animations
- **GSAP** + **@gsap/react** — Scroll-driven animations
- **Create React App** (react-scripts 5.0.1)

---

## Project Structure

```
hbcugg/
├── public/
│   ├── assets/                      # Team logos — /assets/{exportId-without-25}.svg
│   ├── pics/                        # Background images
│   └── data/
│       ├── 1-game center/           # Game JSON files
│       ├── 2-schools/               # Roster hub data (see below)
│       ├── 3-players/               # player_seasons_2021–2025.json
│       ├── 4-coaches/               # coaching_trees, coaches data
│       ├── 5-officials/             # officials, crew registry
│       ├── player_analytics_2025.json
│       ├── season_2025.json
│       └── assets/ALL_2025_teams_frontend_ready_v2.json
├── src/
│   ├── data/
│   │   └── teams.json               # ← AUTHORITATIVE team metadata (18 programs)
│   ├── hooks/
│   │   ├── useSWACData.js           # All React Query data hooks
│   │   └── useMountEffect.js        # useEffect replacement
│   ├── hooks/
│   │   └── useRouteSideNav.js       # Declarative sidebar — pure useMemo from pathname
│   ├── theme/
│   │   └── index.js                 # Chakra UI v3 custom theme
│   ├── pages/
│   │   └── ComponentLab.js          # Dev lab at /lab/components
│   └── components/
│       ├── layouts/                 # MainLayout, ContentContainer
│       └── organisms/
│           ├── test/                # ← ALL test/lab components live here
│           ├── tabs/                # Hub content components (per-team)
│           ├── tabs/                # Tab content components
│           └── [Header, SideNav, etc.]
├── AGENTS.md                        # This file — read before coding
├── AgentDesignBible.md              # Visual + layout philosophy
├── CODEMAP.md                       # File-by-file reference
└── src/pages/teams/md/
    ├── Component Lab Process.md     # Lab workflow + methodology
    └── Roster Hub Design Doc.md     # Roster Hub full spec
```

---

## Routes

| Route | Component | Description |
|---|---|---|
| `/` | Home | Landing page |
| `/teams` | Teams | Conference standings, power rankings |
| `/schools` | Teams | Alias |
| `/schools/wiki` | SchoolsWikiPage | HBCU conference wiki |
| `/teams/:teamId/*` | TeamDetails | URL-driven hub (profile/schedule/roster/coaches/wiki/standings/stats) |
| `/rosters` | RostersPage | League roster analytics — defaults "By Team" |
| `/rosters/full` | RostersPage | defaultMode="team" |
| `/rosters/breakdown` | RostersPage | defaultMode="league" |
| `/players` | PlayersPage | Player hub — discovery, leaderboards, transfers |
| `/player/:playerKey` | PlayerDetailPage | Individual player profile |
| `/coaches` | CoachesPage | Coaches directory |
| `/coaches/:coachId` | CoachDetailPage | Coach profile |
| `/officials` | OfficialsPage | Officials directory |
| `/stats` | StatsPage | League stats |
| `/schedule` | SchedulePage | Season schedule |
| `/game-center` | GameCenterPage | Game center hub |
| `/game-center/games` | GamesHubPage | Games hub |
| `/game-center/week` | WeekCentralPage | Week Central |
| `/game-center/schedule` | SeasonSchedulePage | Season schedule |
| `/game-center/team` | TeamSchedulePage | Team schedules (neutral default) |
| `/game-center/standings` | StandingsPage | Standings |
| `/game/:gameId` | GamePage | Individual game deep-dive |
| `/lab/tested-designs` | TestedDesignsPage | **Component archive — tested visual variants** |
| `/lab/components` | ComponentLab | **Dev lab — component auditioning** |

---

## Team Data — Source of Truth

### `src/data/teams.json`

The authoritative source for all team identity. Always pull names, colors, mascots, IDs from here. Never hardcode.

Key fields:
```json
{
  "id": "jackson-state",
  "exportId": "swacjsu25",
  "name": "Jackson State",
  "shortName": "JSU",
  "mascot": "Tigers",
  "conference": "SWAC",
  "division": "East",
  "city": "Jackson",
  "state": "MS",
  "colors": { "primary": "#002147", "secondary": "#FFFFFF", "accent": "#4A90D9" },
  "logo": "/assets/swacjsu.svg",
  "wiki": {
    "briefHistory": "Foundational narrative of the institution.",
    "traditions": {
      "onField": ["Game day rituals"],
      "offField": ["Campus cultural traditions"]
    },
    "band": { "name": "Official Band Name", "signatureSelection": "Primary Fanfare/Song" },
    "colorsDescription": "Symbolic meaning behind program colors."
  }
}
```

### ID Conventions

| Format | Example | Used In |
|--------|---------|---------|
| `id` | `"jackson-state"` | React Router URLs |
| `exportId` | `"swacjsu25"` | v2 player/analytics JSON keys |
| v5 teamId | `"swacjsu"` | coaching trees, continuity, roster_hub keys |

`toV5TeamId(exportId)` = `exportId.replace(/25$/, "")`

**Logo URL:** `/assets/swacjsu.svg` — take exportId, remove "25", that's the asset filename.

### The 18 Programs

**SWAC (12 teams):**
| shortName | exportId | Primary | Secondary | Mascot |
|-----------|----------|---------|-----------|--------|
| Alcorn | swacalc25 | #5C068C | #FFD100 | Braves |
| AAMU | swacaamu25 | #660000 | #FFFFFF | Bulldogs |
| ASU | swacasu25 | #000000 | #FFC72C | Hornets |
| BCU | swacbcu25 | #6F2633 | #F3A41E | Wildcats |
| FAMU | swacfamu25 | #006747 | #F4811F | Rattlers |
| JSU | swacjsu25 | #002147 | #FFFFFF | Tigers |
| MVSU | swacmvsu25 | #046A38 | #FFFFFF | Delta Devils |
| PVAMU | swacpvamu25 | #4B0082 | #FFB81C | Panthers |
| SU | swacsu25 | #69B3E7 | #FFC72C | Jaguars |
| TSU | swactsu25 | #6F2633 | #A2AAAD | Tigers |
| UAPB | swacuapb25 | #000000 | #FFD100 | Golden Lions |
| Grambling | swacgsu25 | #000000 | #FDB913 | Tigers |

**MEAC (6 teams):**
| shortName | exportId | Primary | Secondary | Mascot |
|-----------|----------|---------|-----------|--------|
| DSU | meacdsu25 | #EE3124 | #0077C8 | Hornets |
| HU | meachu25 | #003A63 | #E31837 | Bison |
| MSU | meacmsu25 | #002D72 | #FFA300 | Bears |
| NCCU | meacnccu25 | #8A1538 | #A89968 | Eagles |
| NSU | meacnsu25 | #007A5E | #FFC72C | Spartans |
| SCSU | meacscsu25 | #900027 | #002B54 | Bulldogs |

**These are the only 18.** Do not invent other teams. NC A&T, Coppin State, and Bethune-Cookman are NOT in this dataset.

---

## Roster Hub Data

**Files:** `public/data/2-schools/`

| File | Description |
|------|-------------|
| `roster_hub_2025.json` | 2025 season — 2,083 players across 18 programs |
| `roster_hub_2024.json` | 2024 season |
| `roster_hub_2023.json` | 2023 season |
| `roster_hub_2022.json` | 2022 season |
| `roster_hub_2021.json` | 2021 season |
| `roster_hub_all.json` | All 5 years combined (for Trend Studio) |
| `ROSTER_HUB_SCHEMA.md` | Full field reference |

Top-level structure:
```json
{
  "year": 2025,
  "total_players": 2083,
  "teams": {
    "swacjsu": { "composition": {}, "experience": {}, "physical": {}, "geographic": {}, "transfers": {} },
    ...18 teams
  },
  "divisions": { "SWAC": {}, "MEAC": {} },
  "all": {}
}
```

Keys use v5 format (`"swacjsu"`, not `"swacjsu25"`).

**When writing mock data for test components, extract real values from these files.** Never invent roster statistics.

---

## Data Hooks (`src/hooks/useSWACData.js`)

| Hook | Source | Returns |
|------|--------|---------|
| `useTeams()` | `src/data/teams.json` | All 18 teams |
| `useTeam(teamId)` | `src/data/teams.json` | One team |
| `useAllPlayers()` | `ALL_2025_teams_frontend_ready_v2.json` | ~2,061 players |
| `usePlayerStatsEnriched()` | `player_stats_2025_enriched.json` | ~903 players with PAR |
| `usePlayerAnalytics()` | `player_analytics_2025.json` | Leaderboards, transfer analytics |
| `useAllPlayersByYear(year)` | `3-players/player_seasons_{year}.json` | Historical rosters |
| `useSWACRoster(exportId)` | `ALL_2025_teams_frontend_ready_v2.json` | One team's roster |
| `useTeamAnalytics(exportId)` | same | Full team analytics |
| `useSeason2025()` | `season_2025.json` | Players, leaderboards, position medians |
| `useAllCoachesByYear(year)` | `4-coaches/coaching_trees.json` | Coaches for one year |
| `useTeamContinuity(exportId)` | `team_continuity_2021_2025.json` | Team continuity data |
| `useLeagueContinuity()` | same | All teams continuity |
| `useAllOfficials()` | `5-officials/officials_all_years_frontend_ready.json` | 106 officials |
| `useAllCrews()` | crew_registry + referee_registry | Crews + analytics |
| `useCoachingTrees()` | `4-coaches/coaching_trees_2021_2025.json` | Full coaching tree data |

All hooks: `staleTime: Infinity`. React Query shared keys = one network request even if multiple components use the same hook.

---

## useEffect Ban — CRITICAL

**`useEffect` is banned everywhere — production AND test/lab files. No exceptions.**

Alternatives:
1. **`useMountEffect(fn)`** — one-time external sync on mount. Import from `src/hooks/useMountEffect.js`
2. **`useMemo`** — derived state instead of sync via effect
3. **React Query** — all data fetching
4. **Event handlers** — direct user action handlers (including `onAnimationIteration` for CSS-driven timers)

See `useEffectDoctorine.md` for full rationale.

---

## Design System

### Chakra v3 Tokens

| Token | Value | Use |
|-------|-------|-----|
| `bg.primary` | `#0B0B0D` | Page background |
| `bg.secondary` | `#141416` | Card/panel background |
| `bg.card` | `#1A1A1D` | Card surface |
| `brand.400` | `#F56565` | Bright red |
| `brand.500` | `#E53E3E` | Primary red |
| `text.primary` | `#F4F4F5` | White text |
| `text.secondary` | `#A1A1AA` | Light gray |
| `text.muted` | `#71717A` | Muted gray |
| `whiteAlpha.100` | rgba(255,255,255,0.06) | Subtle borders |
| `whiteAlpha.200` | rgba(255,255,255,0.12) | Hover states |

### Visual Style
- Dark mode only — near-black backgrounds, red accents
- Bold uppercase headlines with tight letter-spacing
- Left border accent bars (4px, `brand.500`) for section labels
- Card-based layouts with `1px solid whiteAlpha.100` borders
- `whiteAlpha` overlays on images with gradient fade

### Chakra v3 Gotchas
- **CSS animations:** Use `style={{ animation: '...' }}` — not `sx={{ animation }}` (unreliable in v3)
- **SVG colors:** Never use Chakra tokens in SVG. Use raw hex/rgba: `stroke="#E53E3E"`
- **Keyframes:** Inject via `<style>` tag in JSX with unique names per component
- **Gradients:** `bg="linear-gradient(90deg, #002147 0%, transparent 60%)"` works directly

---

## Component Lab Workflow

**Never build directly into a live page. Always: Test File → Lab → Live Page.**

### How the lab works
- `/lab/components` currently renders the active registry as a gallery
- Each registry entry renders automatically in a slot sized like live `PageShell`
- Keep the active registry focused on the current experiment set so side-by-side comparison stays useful

### Steps to add a component
1. Create the file: `src/components/organisms/test/MyComponentA.js`
2. Use a **named export only** — no `export default` from test files
3. Import it in `src/components/organisms/test/componentLabRegistry.js`
4. Add an entry: `{ number, name, agent, date, component }`
5. It appears in the lab immediately

### Registry entry format
```js
{
  number: 5,                                    // unique int, never reuse
  name: "Week Central — Game Card 2x1 (B)",    // page + component + variant
  agent: "HBCUGG",                              // who built it
  date: "2026-04-13",                          // ISO date
  component: MyNamedExport,                    // reference, not JSX
}
```

### File rules
- **Named export only.** `export const MyComponentA = () => ...`
- **File naming:** `{PageContext}{ComponentName}{Variant}.js` e.g. `WeekCentralBannerA.js`
- **No data fetching.** All data is local mock constants extracted from real JSON files
- **Show all states** in the lab export (FINAL + UPCOMING, etc.) side by side
- A `4x1` gallery export is acceptable when the design problem is the full row composition
- **No imports from pages/.** Only import from components/

### Player image rule
- If a player-led test component uses a real player and that player has a valid `image_url` in `public/data/3-players/player_seasons_{year}.json`, use it instead of a generic placeholder

### Legacy files
Old test files live in `src/components/organisms/test/legacy/` — do not import from there in new work.

### Graduating to production
When a component wins:
1. Copy the inner component (not the lab wrapper) to `src/components/molecules/{category}/`
2. Replace mock data with real props
3. Update all imports in page files
4. Test file stays in `test/` — do not delete

**The most common agent mistake:** Importing a file that doesn't exist. Grep before importing. A bad import crashes the entire lab.

Full rules: `AgentDesignBible.md` section 13.

---

## Key Patterns

### Hub View Switching (Local State)
Top-level hubs use URL routing. Views **within** a hub use local `useState` — no navigate(), no unmount/remount.
```jsx
const [view, setView] = useState("list");
{view === "list" && <ListView />}
{view === "calendar" && <CalendarView />}
```
See AgentDesignBible.md section 3b for full rules and the routing-vs-state decision table.

### URL-Driven Hub Selection
Which hub renders inside a team page is determined by the URL suffix, not state:
```jsx
// TeamDetails.js renderContent() switch on pathSuffix
case "schedule": return <ScheduleTab team={team} />;
case "roster/hub": return <RosterHubTab team={team} />;
```

### Declarative Sidebar Pattern (The URL-to-Button Mapper)
`useRouteSideNav.js` — pure `useMemo` from pathname + search. No effects, no registration, no context.
SideNav reads it directly. No page needs to "register" itself.

**Core Principles:**
1. **URL as Source of Truth**: The sidebar is a deterministic function of `window.location`.
2. **Context-Dependent Header**: The top "Hub" button changes based on the root path (e.g., `/game-center` -> "GAME CENTER", `/teams/jsu` -> "JACKSON STATE").
3. **Flat List with Injections**: Predefined button lists (HUBS) are augmented by "Injections" (e.g., if on a game page, inject a game-type button indented under "GAMES").
4. **Tab-Sync via Query Params**: For pages with internal views (Stats, Coaches, etc.), the active button reflects `?tab=...` and clicks update the URL.

**Item Types:**
- `button`: Standard navigation link.
- `game`: Scoreboard-style button for game deep-dives.
- `teamHubSwitcher`: Multi-tab team navigator (Profile/Schedule/Roster/Wiki).

**Logic Flow:**
`parseUrl(pathname)` -> `hubDetails` + `activeSection` -> `Items Array` -> `Render`.

### Team Color Pattern
```jsx
bg={`linear-gradient(135deg, ${team.colors.primary}33 0%, transparent 60%)`}
```
Always use `33` (20% opacity) hex suffix for subtle backgrounds. Never hardcode hex — pull from `teams.json`.

### PageShell Grid System
Production pages use `PageShell` + `PageShell.Slot` — **not** the legacy `DesktopBoard4x`/`SlotNxM`. See `AgentDesignBible.md` section 2 for full reference.

```jsx
<PageShell>
  <PageShell.Slot cols={4}>  {/* banner */}
  <PageShell.Slot cols={1}>  {/* 1×1 card */}
  <PageShell.Slot cols={2} rows={2}>  {/* 2×2 */}
</PageShell>
```

Components use `w="full" h="full"` to fill their slot. Never hardcode height on a component root.

---

## File Encoding — Critical

**All files must be UTF-8 without BOM.** Some agents write UTF-16 LE with BOM which breaks Babel.

Fix BOM corruption:
```
node -e "const fs=require('fs'); let c=fs.readFileSync('PATH','utf8'); if(c.charCodeAt(0)===0xFEFF)c=c.slice(1); fs.writeFileSync('PATH',c,'utf8')"
```

`.vscode/settings.json` is set to `utf8` encoding to prevent recurrence.

---

## Project Structure (updated)

```
src/components/
├── molecules/
│   ├── layouts/          # DesktopBoard4x, Slot1x1, Slot2x1, Slot2x2, Slot4x1, etc.
│   ├── game/             # GameCenterLabCards, GamesHubCards, GamesHubBanner, GameCardStyleLab
│   └── schools/          # StandingsCard, RankingsCard, SchoolDirectory, SchoolsHeroBanner,
│                         #   WikiBannerCTA, UtilityRows  ← promoted from test/legacy
├── organisms/
│   ├── test/             # Active lab files only (no default exports)
│   │   ├── legacy/       # Old/retired test files — do not import
│   │   ├── componentLabRegistry.js
│   │   ├── WeekCentralBannerA/B/C.js
│   │   └── WeekCentralGameCardA.js + GameCard2x1_*.js
│   └── nav/              # NavRegistrar components per page
src/pages/
└── game-center/
    └── md/               # Design docs for each Game Center page
```

---

## Current Status (2026-05-04)

### Deleted / Removed
- ~~`SideNavContext.js`~~ — deleted
- ~~10 NavRegistrar components~~ — all deleted (`TeamNavRegistrar`, `RosterNavRegistrar`, etc.)
- Replaced by `useRouteSideNav.js` — declarative, pure useMemo from pathname

### Live Pages
- ✅ Homepage, Schedule, Teams/Schools Hub
- ✅ Schools Wiki (`/schools/wiki`) — conference wiki cards, animated school directory
- ✅ Rosters Hub (`/rosters`, `/rosters/full`, `/rosters/breakdown`) — League/Divisions/By Team modes; sidebar with indented sub-items
- ✅ Players hub + Player detail
- ✅ Coaches hub + Coach detail
- ✅ Officials + crew analytics
- ✅ Stats page
- ✅ Game deep-dive (`/game/:gameId`)
- ✅ Game Center Hub, Games Hub, Week Central, Season Schedule, Team Schedules, Standings — all on PageShell
- ✅ Tested Designs Page (`/lab/tested-designs`) — Component archive gallery

### Team Detail Hubs (`/teams/:id/*`)
- ✅ Banner — `BannerTeamDetailPage` in `PageShell.Slot cols={4}`
- ✅ Schedule Hub — real data, Season list + Calendar views, record stats control bar
- ✅ Roster Hub (`/roster/hub`) — analytics dashboard, links to full/breakdown
- ✅ Full Roster (`/roster/full`) — player list, depth/card/line views
- ✅ Breakdown (`/roster/breakdown`) — deep analytics
- ✅ Coaches Hub — head coach spotlight, staff grid
- ✅ School Wiki — wiki cards; all 18 teams now have `wiki` metadata in `src/data/teams.json`
- ⏳ Profile Hub (DashTab) — mock data, needs real data wiring
- ⏳ Standings Hub — ComingSoon
- ⏳ Stats Hub — ComingSoon

### Pending / In Progress
- ⏳ Players hub + Player detail — need PageShell + local state view switching
- ⏳ Coaches hub + Coach detail — need PageShell + local state view switching
- ✅ Games hub page refactor — `GamesHubPage.js` now uses `useGamesHubData` + `gamesHubModel`
- ⏳ Stats page refresh
- ✅ MEAC teams wiki data in teams.json
- ⏳ Supabase backend integration
- ⏳ Player comparison tool (VS Protocol)

### Magazine Banners (all deployed to production pages)

All 12 pages have a 4×1 magazine-style banner with editorial + fading ticker subheader. Sources:

| Banner | File | Page |
|--------|------|------|
| `BannerGameCenter` | `BannerGameCenter.js` | `/game-center` |
| `WeekCentralBannerC` | `WeekCentralBannerC.js` | `/game-center/week` |
| `BannerGamesHub` | `BannerPages.js` | `/game-center/games` |
| `BannerSchedule` | `BannerSchedule.js` | `/game-center/schedule` |
| `BannerTeamSchedules` | `BannerPages.js` | `/game-center/team` |
| `BannerStandings` | `BannerPages.js` | `/game-center/standings` |
| `BannerSchools` | `BannerPages.js` | `/teams` |
| `BannerTeamDetailPage` | `BannerTeamDetail.js` | `/teams/:teamId` |
| `BannerPlayer` | `BannerPlayer.js` | `/players` |
| `BannerCoachesHub` | `BannerPages.js` | `/coaches` |
| `BannerOfficialsHub` | `BannerPages.js` | `/officials` |

### Component Lab (active)
- ✅ Week Central Banner 4x1: 3 variants (A=split panel, B=scoreboard, C=magazine cover) — C in production
- ✅ Week Central Game Card 2x1: 6 variants (A–F)
- ⏳ Week Central Spotlight 2x2: not yet built
- ⏳ Week Central KPI cards: not yet built

### GamesHub Cards (`src/components/molecules/game/GamesHubCards.js`)
New components added 2026-04-18 — all grid-compliant (h="100%", no hardcoded heights):
- ✅ `GameCardBroadcast` — 1×1 featured game result/upcoming
- ✅ `ScheduleRailList` — 3×3 scrollable recent results
- ✅ `TopThreeStandingsCard` — 1×1 division top 3
- ✅ `ScheduleHeadlineCard` — 1×1 upcoming game callout
- ✅ `UpcomingStretchCard` — 1×1 team's next 3 opponents
- ✅ `TeamFormCard` — 1×1 last 5 results form dots
- ✅ `RecordSplitCard` — 1×1 home or road record split

Legacy exports (`GameOfWeekSpotlight`, `StoryCard`, `StatCarouselCard`, `TeamPerformanceStrip`) are kept for GridTestPage compatibility.

### PageShell Hybrid Pattern
Pages with a grid top + scrollable list below use `listContent` prop:
```jsx
<PageShell listContent={<MyScrollableList />}>
  <PageShell.Slot cols={4}>...</PageShell.Slot>
  {/* KPI cards etc. */}
</PageShell>
```
Used by: SeasonSchedulePage, TeamSchedulePage, StandingsPage.

### Shared Football Current Context
- `public/data/0-data/football_current_context.json` is the app-wide football reset reference.
- `src/hooks/useFootballCurrentContext.js` reads it for default page loads.
- Current default intent: 2026 offseason, week 0.
- During the football season, the data pipeline should advance this once per week after games are processed.
- Game Center pages should read this context before falling back to static defaults.

### Game Center Refactor Status
- ✅ Games Hub: `useGamesHubData` + `gamesHubModel`
- ✅ Team Schedule: `useTeamScheduleData` + `teamScheduleModel`
- ✅ Season Schedule: `useSeasonScheduleData` + `seasonScheduleModel`
- Continue moving remaining Game Center pages toward thin PageShell files, page-scoped hooks, and pure model utilities.

### Design Docs (src/pages/game-center/md/)
- ✅ Game Center Hub Design Doc
- ✅ Games Hub Design Doc
- ✅ Week Central Design Doc

### Roster Hub Components (paused)
- ✅ Command Header, Comparator, Experience Matrix, Transfer Board variants in legacy lab
- ⏳ Winners not selected — live page assembly blocked

### Planned / Offloadable
- ⏳ GamesHub — decide: display all 15 dynamic card candidates on page or just the 6 active ones (Why Engine is future state)
- ⏳ Why Engine client-side implementation (computeWhyScores hook)
- ⏳ Supabase backend integration
- ⏳ GSAP ScrollTrigger animations
- ⏳ Player comparison tool (VS Protocol)
- ⏳ Rankings page (`/game-center/rankings`)
