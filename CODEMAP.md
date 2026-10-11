# HBCU Gridiron Glory — Code Map

React + Chakra UI v3 + React Query + React Router v7. Dark theme, URL-driven state, component lab workflow.

---

## Project Roots

```
hbcugg/
├── public/
│   ├── assets/          ← team logos — /assets/{exportId-without-25}.svg
│   ├── pics/            ← background images
│   └── data/            ← all JSON data (see Data section below)
├── src/
│   ├── App.js           ← router, providers, route table
│   ├── index.js         ← React DOM entry point
│   ├── theme/index.js   ← Chakra UI v3 system config (dark mode, brand tokens)
│   ├── data/
│   │   └── teams.json   ← AUTHORITATIVE team metadata for all 18 programs
│   ├── hooks/           ← all data hooks (React Query) + useRouteSideNav
│   ├── pages/           ← top-level route components
│   └── components/
│       ├── layouts/     ← MainLayout, PageShell
│       └── organisms/   ← all UI components
│           ├── test/    ← ALL lab/test components live here
│           └── tabs/    ← hub content components (per-team)
```

---

## Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/` | Home | Landing |
| `/teams` | Teams | Conference standings, power rankings |
| `/schools` | Teams | Alias for `/teams` |
| `/schools/wiki` | SchoolsWikiPage | HBCU conference wiki |
| `/teams/:teamId` | TeamDetails | URL-driven hub state (profile/schedule/roster/coaches/wiki/standings/stats) |
| `/rosters` | RostersPage | League-wide roster analytics — defaults to "By Team" mode |
| `/rosters/full` | RostersPage (defaultMode="team") | Full roster view |
| `/rosters/breakdown` | RostersPage (defaultMode="league") | League analytics breakdown |
| `/players` | PlayersPage | Player discovery, leaderboards, transfers |
| `/player/:playerKey` | PlayerDetailPage | Player profile, PAR rating, radar |
| `/coaches` | CoachesPage | Coaches directory |
| `/coaches/:coachId` | CoachDetailPage | Coach profile |
| `/officials` | OfficialsPage | Officials + crew analytics |
| `/stats` | StatsPage | PAR leaderboards, transfers, continuity |
| `/schedule` | SchedulePage | Season schedule |
| `/game-center` | GameCenterPage | Hub |
| `/game-center/games` | GamesHubPage | Games hub |
| `/game-center/week` | WeekCentralPage | Week Central |
| `/game-center/schedule` | SeasonSchedulePage | Season schedule hub |
| `/game-center/team` | TeamSchedulePage | Team schedules — neutral default, select a team |
| `/game-center/standings` | StandingsPage | Standings |
| `/game/:gameId` | GamePage | Full game deep-dive |
| `/lab/components` | ComponentLab | **Dev lab** |

---

## Pages

### TeamDetails.js
URL-driven hub. `pathSuffix` determines which hub renders in `listContent`. Banner always in `PageShell.Slot cols={4}`.

Hubs: `""` / `profile` → DashTab | `schedule` → ScheduleTab | `roster/hub` → RosterHubTab | `roster/full` → RosterTab | `roster/breakdown` → BreakdownTab | `coaches` → CoachesTab | `wiki` → WikiTab | `standings` → ComingSoon | `stats` → ComingSoon

### RostersPage.js
Accepts `defaultMode` prop (`"team"` | `"league"` | `"divisions"`). Owns a `RosterComparisonComponent` which holds mode state + ModeSwitcher + all three mode views (League, Divisions, By Team). PageShell hybrid: Banner 4×1 + 4 KPI cards + `listContent`.

### ScheduleTab.js (`/teams/:id/schedule`)
Real data from `/data/1-game center/schedules/by_team/{fileId}.json`. Owns `view` (list/calendar) and `season` state. ControlBar shows record stats + view toggle + season picker.

### RosterHubTab.js (`/teams/:id/roster/hub`)
Analytics dashboard using `useTeamAnalytics`. Shows position depth, class distribution, physical, geographic, transfers. Links to `/roster/full` and `/roster/breakdown`.

### CoachesTab.js (`/teams/:id/coaches`)
Uses `useTeamCoachesByYear`. HeadCoachSpotlight + IntelStatCards + coordinator/position staff grid.

---

## Static Data Files

### `src/data/teams.json`
The authoritative source for all 18 programs.
Fields: `id`, `exportId`, `name`, `shortName`, `mascot`, `conference`, `division`, `city`, `state`, `colors.primary/secondary/accent`, `logo`, `stadium`, `founded`, `enrollment`, `wiki`.

### `public/data/2-schools/`
| File | Description |
|------|-------------|
| `roster_hub_2025.json` | 2025 — 2,083 players |
| `roster_hub_{year}.json` | 2021–2024 |
| `roster_hub_all.json` | All 5 years |

Structure: `{ year, total_players, teams: { "swacjsu": { composition, experience, physical, geographic, transfers } }, divisions, all }`
Keys use v5 format (`"swacjsu"` not `"swacjsu25"`).

### `public/data/3-players/`
`player_seasons_{year}.json` — 2021–2025.

### `public/data/4-coaches/`
`coaching_trees_2021_2025.json`

### `public/data/5-officials/`
`officials_all_years_frontend_ready.json`, `crew_registry.json`, `referee_registry.json`

### `public/data/1-game center/`
`schedules/by_team/{fileId}.json` — per-team schedule. `fileId` = exportId without "25" (special case: swacjsu → swacmjsu).

---

## Hooks (`src/hooks/`)

### `useRouteSideNav.js`
Pure `useMemo` from pathname. Returns `{ stack, items }`. No effects, no mounting. SideNav reads this to derive its content. **The replacement for the deleted NavRegistrar pattern.**

Items support `indent: true` for sub-item styling (smaller, dimmer, indented).

### `useMountEffect.js`
`useMountEffect(fn)` — zero-dep wrapper. Use instead of raw `useEffect(() => {}, [])`.

### `useTeams.js`
`useTeams()` → `{ teams[], isLoading }`. `useTeam(teamId)` → single team.

### `useSWACData.js` — All hooks use `staleTime: Infinity`

**ID convention:**
- v2 exportId: `swacjsu25` — v2 roster + analytics files
- v5 teamId: `swacjsu` — coaching trees, continuity, roster_hub keys
- `toV5TeamId(exportId)` = `exportId.replace(/25$/, "")`

| Hook | Source | Returns |
|------|--------|---------|
| `useSWACRoster(exportId)` | ALL_2025_teams_frontend_ready_v2.json | roster[] for one team |
| `useTeamAnalytics(exportId)` | same | full analytics for one team |
| `useAllPlayers()` | player_seasons_2025.json | ~1,900 normalized players |
| `usePlayerStatsEnriched()` | player_stats_2025_enriched.json | ~903 players with PAR |
| `usePlayerAnalytics()` | player_analytics_2025.json | leaderboards, transfer analytics |
| `useSeason2025()` | season_2025.json | players, leaderboards, medians |
| `useAllPlayersByYear(year)` | player_seasons_{year}.json | historical rosters |
| `useRosterHub()` | roster_hub_2025.json | allLeague + teams map |
| `useAllCoaches()` | coaching_trees_2021_2025.json | all coaches |
| `useAllCoachesByYear(year)` | same | coaches for one year |
| `useTeamCoaches(exportId)` | same | one team's 2025 staff |
| `useTeamCoachesByYear(exportId, year)` | same | staff for one team + year |
| `useAllOfficials()` | officials_all_years_frontend_ready.json | 106 officials |
| `useAllCrews()` | crew_registry + referee_registry | crews + analytics |
| `useTeamContinuity(exportId)` | team_continuity_2021_2025.json | continuity for one team |
| `useLeagueContinuity()` | same | all teams continuity |
| `useCoachingTrees()` | coaching_trees_2021_2025.json | full coaching tree data |

---

## Components

### `layouts/`
| File | Purpose |
|------|---------|
| `MainLayout.js` | Wrapper with fixed 255px SideNav |
| `PageShell.js` | 4-column grid system — use for all production pages |

### `organisms/` (production)
| File | Purpose |
|------|---------|
| `Header.js` | Fixed top nav |
| `SideNav.js` | Left sidebar — reads `useRouteSideNav` hook. Supports `indent` on nav items |
| `OverlayMenu.js` | Mobile full-screen nav |

### `organisms/tabs/` (team hub content)
| File | Purpose |
|------|---------|
| `DashTab.js` | Profile hub — mock data, placeholder |
| `ScheduleTab.js` | Schedule hub — real data, season list + calendar views |
| `RosterTab.js` | Full roster — player list with depth/card/line views |
| `CoachesTab.js` | Coaches hub — real staff data |
| `StatsTab.js` | Stats hub — placeholder |
| `roster/RosterHubTab.js` | Roster analytics dashboard |
| `roster/BreakdownTab.js` | Deep roster breakdown |
| `roster/PlayersTab.js` | Players hub |

### `organisms/test/` (Component Lab — dev only)
All test/experimental components live here. Named exports only.

---

## Key Patterns

### Hub View Switching (Local State)
**URL routing** for top-level hubs. **Local `useState`** for views within a hub.
```jsx
const [view, setView] = useState("list");
{view === "list"     && <ListView />}
{view === "calendar" && <CalendarView />}
```
See AgentDesignBible.md section 3b.

### Declarative Sidebar
`useRouteSideNav.js` — pure `useMemo` from pathname. No effects, no registration, no context.
`SideNav.js` reads it and renders. Works for every route without page-level wiring.

### PageShell Grid
All production pages use `PageShell`. Never use legacy `DesktopBoard4x` / `SlotNxM`.
Scrollable content goes in `listContent` prop, not inside a slot.

### Team ID Translation
```
v2 exportId   →  "swacjsu25"   (v2 JSON keys, hook params)
v5 teamId     →  "swacjsu"     (coaching trees, continuity, roster_hub keys)
logo filename →  "swacjsu"     → /assets/swacjsu.svg
route id      →  "jackson-state" → /teams/jackson-state
```

### Deleted Patterns — Do Not Use
- ~~`SideNavContext.js`~~ — deleted
- ~~NavRegistrar components~~ — deleted (all 10 files removed)
- ~~`ContentContainer`~~ — legacy, use PageShell
- ~~`TabNavigation`~~ — legacy, use URL routing + local state

---

*Last updated: 2026-04-20*
