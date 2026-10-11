# Team Hub — Design Document

**Route:** `/teams/:teamId`
**File:** `src/pages/TeamDetails.js`
**Last updated:** 2026-08-30 (Mobile Design pass added; Pipeline Requests §9–10 added)

---

## Current Architecture Note

The team hub sidebar navigates to separate URL pages: profile, schedule, roster, coaches, school wiki, standings, and stats. These are not tabs sharing one content template. Any older tab-language below is legacy direction unless a later section explicitly says otherwise.

The profile page owns the magazine grid below the team KPI strip:

```
[HERO BANNER]
[TEAM KPI STRIP]
[Season record 2x1] [Next game 2x1]
[Player spotlight 2x2] [Previous game 1x1] [Head coach 1x1]
                       [Roster depth 1x1]   [Team stat 1x1]
```

Profile grid radius rule:
- `PageShell.Slot` owns card clipping. Profile cards should opt into `radius="lg"` on the slot rather than hardcoding large root heights or custom wrappers.
- `PageShell.Slot` defaults to `radius="none"` for legacy/grid-composition compatibility, which is why older profile components appeared square.
- Card roots still render `w="full" h="full"` and let the slot clip the visual surface.

## Resolved — 2026-08-27: profile data was real all along, just unreachable

The "Needed dedicated profile fetch" section below was written as a spec for a fetch that didn't exist yet. It already existed — `public/data/2-schools/team_profile/team_profile_{year}.json`, covering all 18 teams for 2021-2026, in almost exactly this shape. Two real bugs were hiding it, both fixed:

1. **Fetch path bug** — `fetchTeamProfileByYear` in `useSWACData.js` requested `/data/2-schools/team_profile_{year}.json`; the real file lives one directory deeper at `/data/2-schools/team_profile/team_profile_{year}.json`. Every request 404'd silently (React Query with `retry:false`), so `profile` was always `null` and every card on this page rendered its pending fallback — not because backend hadn't built it, but because the frontend was asking the wrong address. Fixed by correcting the path.
2. **`TeamKPIStrip` year-mislabeling bug** — `usePlayerAnalytics()` reads `player_analytics_2025.json`, which is not year-parameterized (2025 only), but its `avg_par`/`roster_size`/`transfer_rate`/`transfer_count` fields were used as an unconditional fallback behind `roster_hub_{season}.json` (which *is* year-scoped, 2021-2025 — note no `roster_hub_2026.json` exists yet either). Result: selecting any season other than 2025 could silently show 2025's numbers under that season's label. Fixed by gating the 2025-only fallback to only apply when `season === 2025`; other seasons now show an honest "0.0"/"-" rather than mislabeled data.

Verified across all 6 available years (2021-2026): all 18 teams present in every year's `teams{}` map; `useTeamProfile`'s query key is `["team-profile", year]` (independent of team) so switching teams within the same year is an instant cache-slice, not a refetch; switching years correctly refetches. A season outside 2021-2026 (the banner's selector goes back to 2010) has no `team_profile` export at all — that's not a bug, it correctly falls through to the same honest pending state every card already had, just for a real reason now instead of the path bug.

**One backend data-quality note, not a frontend fix:** `record.label` in the 2021 file reads `"2021 Current"` with `record_context: "current_year"` despite that season being long over (`context.phase: "final"`) — every past-year label should probably read `"{year} Final"`. Frontend just displays `record.label` verbatim; worth flagging to whoever owns this export.

Profile component data contract (now backed by real data for 2021-2026):
- Team identity comes from `src/data/teams.json`.
- Record, next game, review game, and top stat are real pipeline fields as of 2026-08-27, not temporary fallbacks — see the Resolved note above.
- Season record already pulls the current active season record with the offseason fallback built in: the 2026 export's `record_context: "offseason_previous_year"` correctly serves the 2025 record labeled `"2025 Final"` while `next_game` points at the real 2026 season opener. This logic lives in the export itself, not something the frontend re-derives.
- Previous-season record cards should use the large record value as the watermark, matching the reference direction, instead of using the team logo as the primary watermark.
- Next game uses team logo tiles in the matchup squares.
- If no next game is available, the 2x1 next-game slot should render the last-game/review component. Redundancy with the separate 1x1 previous-game card is acceptable.
- Player spotlight uses real player pipeline data (`player_spotlight` in the profile export), with a visible player avatar when available.
- **Team Production card (renamed from Roster Depth, 2026-08-27):** was a roster position-count bar chart (QB/WR/OL/LB counts). Redesigned across three passes in the same session before landing here: (1) 4 fixed category rows with conference-rank bars, (2) a rotating carousel of category cards showing plain metric numbers, (3) **current form** — both combined: a slow-rotating carousel over 2-3 category "cards" (Passing Production / Rushing Production / Havoc / Pass Defense / Kickoff / Kick Return / etc. — whichever categories the Why Engine judges notable for this team), and *within* each category frame, its 4 metrics render as horizontal bars scaled to that metric's conference-best value, each with a label + conference-rank line beneath it ("3rd / SWAC EAST"). Pure CSS crossfade between category frames, same technique as `ContextRotationCard` in `StandingsPage.js` (stacked frames, one shared keyframe, separated only by negative `animation-delay` — no timer, no state, no effect). This is explicitly fetch-and-display, not derive-client-side: which 2-3 categories to surface, the full stat taxonomy per category, and every metric's value/conference-best/rank, are all backend/Why-Engine calls — the frontend has no way to derive a stat taxonomy on its own. Pending state (no payload yet) renders 2 fallback category cards (Passing, Rushing) with all 4 bars empty and ranks showing `--`.
- **Coaching Staff card (renamed `HeadCoachCard` → `CoachingStaffCard`, 2026-08-27):** rebuilt as a slow-rotating carousel over the team's coaching staff (Head Coach, coordinators, and — per 2026-08-27 direction — any position coach too), not a single head-coach card. Same pure-CSS rotation technique as `TeamProductionCard`/`ContextRotationCard` (a hidden element runs an 8s CSS keyframe and ticks the index forward via `onAnimationIteration` — no timer, no `useEffect`). Each coach shows whatever mix of tenure/stat/delta the payload sends for them — a first-year HC's "Y1 / NEW ERA" has no natural YoY comparison, while a coordinator's "31.4 PTS/GAME" might carry one; delta is optional per coach, not mandatory. **Still on a hardcoded dummy array today** (`coachingStaffForTest` in `TeamDetails.js`) — only the Head Coach slide reads real data (`profile.head_coach`), the coordinator slides are fake names/stats. See the `coaching_staff[]` contract below for what real data this needs.
- Coach identity/photo interim source: `public/data/4-coaches/coaches_hub_payload_{year}.json`, falling back to `coaches_all_years.json` only when needed.
- Top stat is also a placeholder for a future variable Why Engine card. For now, use top rushing or passing production when the data is available.

Live profile fetch shape (real as of 2026-08-27, `team_profile_{year}.json`) — the `why_cards.team_production` block is the one part still pending, per the Resolved note above:

```json
{
  "team_id": "swacaamu",
  "season": 2026,
  "context": {
    "phase": "offseason",
    "week": 0,
    "display_record_season": 2025
  },
  "record": {
    "season": 2025,
    "label": "2025 Final",
    "overall": "7-4",
    "conference": "4-3 conference",
    "division_rank": "2nd - SWAC East"
  },
  "next_game": {
    "season": 2026,
    "opponent_id": "swacjsu",
    "date": "2026-08-29",
    "kickoff": "TBD",
    "venue": "Louis Crews Stadium",
    "tag": "Season Opener"
  },
  "next_game_fallback": {
    "mode": "last_game",
    "note": "If next_game is unavailable, render the last completed game in the 2x1 next-game slot."
  },
  "review_game": {
    "season": 2025,
    "opponent_id": "swacalc",
    "date": "2025-11-22",
    "result": "W",
    "score": "24-17",
    "headline": "Final game recap"
  },
  "player_spotlight": {
    "player_id": "PERS_...",
    "full_name": "Player Name",
    "position": "QB",
    "class_year": "Jr.",
    "image_url": "https://...",
    "stat_strip": [{ "label": "PAR", "value": 42.1 }]
  },
  "head_coach": {
    "coach_id": "PERS_...",
    "name": "Coach Name",
    "title": "Head Coach",
    "tenure_year": 2,
    "stock_label": "Stable"
  },
  "coaching_staff": [
    {
      "coach_id": "PERS_...",
      "name": "Coach Name",
      "role": "Head Coach",
      "image": "https://...",
      "stat_value": "Y1",
      "stat_label": "TENURE",
      "delta": null
    },
    {
      "coach_id": "PERS_...",
      "name": "Coach Name",
      "role": "Offensive Coordinator",
      "image": "https://...",
      "stat_value": "31.4",
      "stat_label": "PTS / GAME",
      "delta": { "direction": "up", "value": "+4.2 YoY" }
    }
  ],
  "team_stat": {
    "label": "Top Stat",
    "value": "312",
    "sub": "Passing yards/game",
    "placeholder_type": "top_rushing_or_passing"
  },
  "why_cards": {
    "team_production": {
      "cards": [
        {
          "key": "passing",
          "label": "Passing Production",
          "metrics": [
            { "key": "comp_pct", "label": "Comp %", "value": 61.4, "conference_best": 68.2, "conference_rank": 3 },
            { "key": "yds_att", "label": "Yds / Att", "value": 7.8, "conference_best": 9.1, "conference_rank": 4 },
            { "key": "passer_rtg", "label": "Passer Rtg", "value": 138.2, "conference_best": 161.5, "conference_rank": 3 },
            { "key": "td_int", "label": "TD : INT", "value": 3.0, "conference_best": 4.2, "conference_rank": 2 }
          ]
        },
        {
          "key": "kick_return",
          "label": "Kick Return",
          "metrics": [
            { "key": "avg_return", "label": "Avg Return", "value": 24.1, "conference_best": 27.6, "conference_rank": 2 },
            { "key": "long", "label": "Long", "value": 68, "conference_best": 96, "conference_rank": 5 },
            { "key": "return_td", "label": "Return TDs", "value": 1, "conference_best": 3, "conference_rank": 4 },
            { "key": "fair_catch_pct", "label": "Fair Catch %", "value": 32, "conference_best": 51, "conference_rank": 6 }
          ]
        }
      ]
    },
    "top_stat": {}
  }
}
```

Field types for `why_cards.team_production.cards[]`: `key: string`, `label: string` (the category — Passing Production, Rushing Production, Havoc, Pass Defense, Kickoff, Kick Return, etc. — kept short; long category names still get truncated to one line in the UI, so backend should favor short labels here), `metrics: [4]{ key: string, label: string (short — one line, no wrap), value: number | null, conference_best: number | null, conference_rank: integer | null, conference_size: integer | null }`. Two things are backend-owned and out of frontend reach entirely: (1) which 2-3 categories appear at all — a Why Engine selection from a larger taxonomy, not a fixed set the frontend picks from; (2) the stat taxonomy itself — which 4 metrics belong to a given category, and what "conference best" means for each. The frontend only ever renders whatever `cards[]` it's handed. The rank line renders small and secondary to the bar by design — format is `"{ordinal(conference_rank)} / {conference_size}"` (e.g. "3rd / 6"), not the team's conference name. A `null` metric value renders that row's bar empty and its rank as `--`.

**Dev mock (2026-08-27):** `PRODUCTION_FALLBACK` in `TeamStatusBlocks.js` currently holds invented placeholder numbers (not derived from any real production data) purely so the rotating-bar layout can be reviewed before the real field exists. Delete it the moment `why_cards.team_production.cards` ships for real.

Field types for `coaching_staff[]`: `coach_id: string`, `name: string`, `role: string` (Head Coach, Offensive Coordinator, Defensive Coordinator, or any position coach — the carousel plays whatever list it's given, in order), `image: string | null`, `stat_value: string | null`, `stat_label: string | null`, `delta: { direction: "up" | "down" | "flat", value: string } | null`. Delta is per-coach and optional by design — a first-year hire's tenure stat has no natural comparison, a coordinator's per-game stat might. **This must be a real backend field for launch.0, not a frontend derivation.** A real dataset already computes genuine YoY deltas per position group per coach-season — `public/data/4-coaches/coach_position_impact_by_school_season.json` (`current_metrics`/`previous_metrics`/`deltas` per school+season+position_group) — which is useful precedent that this is a real, already-modeled concept, but it's keyed to position groups (QB/RB/WR/etc.), not cleanly "the OC's PPG delta" as one number, and many rows have empty `deltas` (no previous adjacent season). Don't wire that file directly into this card; use it as reference for what backend should compute and expose as `coaching_staff[].delta` instead.

**Dev mock (2026-08-27):** `coachingStaffForTest` in `TeamDetails.js` is a fully hardcoded 3-entry array — only the Head Coach slide's name/title/image reads real data (`profile.head_coach`); the two coordinator slides (names, stats, and their example deltas) are entirely invented, standing in for the `coaching_staff[]` field above until it ships.

## Mobile Design (2026-08-30 pass)

Standing rules for this section, applied here and on every school hub page:

- **No `PageShell` on mobile.** PageShell's `autoRows` (`ROW_UNIT = clamp(160px, 20vw, 260px)`)
  forces one row height across every slot; that shared forced height is the cause of
  the recurring "dead space under the banner" bug. Mobile branches drop the shell and
  reproduce `rowUnitHeight(rows)` locally only where a card needs a definite height.
- **Square corners, no border, edge-to-edge, no padding** on every mobile component.
- **`rem`, never hardcoded `px`.**
- **Pattern C is the mobile banner standard** (see below).

### Pattern C — the mobile banner standard

`MobileSectionSwitcher` + a `+` `BannerIconButton` that opens a `BottomSheet` of season
chips. Adopted as the standard for all mobile banners; Game Center, Schools, Standings,
School Wiki and Team Detail have been converted. Game and player banners have **not**
been converted yet.

### What changed on this page

- **`TeamDetailsMobile`** (`TeamDetails.js`) — no PageShell, no padding/gap/radius. The
  four small cards (`NextGameCard`, `CoachingStaffCard`, `TeamProductionCard`,
  `TeamStatCard`) sit in an equal 2-column grid, `repeat(2, minmax(0, 1fr))`, each at
  `rowUnitHeight(1)`. All four read correctly as 1×1 tiles.
- **`BannerTeamDetail`** — converted to Pattern C. Its gradient moved from the outer box
  back onto the title tier; the outer placement was a stale workaround for PageShell's
  forced height and is no longer needed.
- **`TeamKPIStrip`** — the mobile `valueSize` floor was dropped. The `3.35rem` clamp
  minimum was wider than a 4-across cell, clipping values to "3..". Value centered,
  ring reduced 42px → 26px at inset `1.5`, `borderRadius={isMobile ? 0 : "lg"}`.
- **`MobileTeamScheduleSummaryBand`** — added to `TeamScheduleSummaryBand.js`, which had
  **no mobile branch at all**. Gradient title tier, switcher/`+` row, and the stat pills
  moved out of the control strip onto their own wrapping row.
- **Sidebar / drawer** — `TeamHubBlock` in `SideNav.js` merges the school button and the
  team switcher into one team-colored bar. On mobile the same content folds into
  `MobileSectionSwitcher`'s bottom sheet as `TeamHubSwitcherSheetBlock`: team name and
  "Switch Teams" inline in one header row, logo watermark behind the block at 0.14
  opacity, rows on `blackAlpha` so the watermark reads through, and a 6-column × 3-row
  team grid with a load-gated reveal (skeleton shimmer → spinner → logos).

---

## Component Wires (Standardized)

### BannerTeamDetailPage (4x1)
- **Source:** `src/data/teams.json`
- **Dynamic Content:** Editorial headline based on team status (e.g., "The Hill is Rising").
- **Visuals:** Team logo (left), primary color gradient background, fading ticker subheader.

### TeamStatusStrip (4x1)
- **KPIs:** Record, Rank (Glory), Streak, Next Opponent.
- **Data Hook:** `useTeamAnalytics(exportId)`

### TeamProductionCard (1x1) — renamed from RosterDepthCard, 2026-08-27
- **Visual:** Slow CSS-crossfade carousel over 2-3 category cards (8s hold each); each frame shows that category's 4 metrics as horizontal Recharts bars (scaled to `conference_best`), with a label + conference-rank line beneath each bar.
- **Data:** `profile.why_cards.team_production.cards` — fetched and displayed only, no client-side aggregation, category selection, or stat-taxonomy derivation. No backend field exists yet, so it renders its 2-card pending fallback (Passing, Rushing — all 4 bars empty, ranks `--`) today.
- **Component:** `TeamProductionCard` in `src/components/molecules/schools/TeamStatusBlocks.js`.

### TeamStatCard (1x1)
- **Data:** `profile.why_cards.top_stat` — variable Why Engine card selected by team context, still pending.

---

## Inspiration

- `inspo/teampage.jpg` — Cinematic team hero, efficiency KPIs, featured player spotlight, standings, quick-nav cards
- `inspo/sharing/roster/rstoer1.jpg` — Player card grid with glory score, position filters, search bar
- `inspo/sharing/roster/roster outlook.jpg` — Positional depth chart with D1 snaps, recruiting class, multi-year outlook
- `inspo/sharing/roster/roster outlook 2.jpg` — OL-specific depth with height/weight, career snap counts, composite ranking
- `inspo/sharing/roster/roster stats.jpg` — Performance Lab: personnel groupings, tactical view, impact delta, EPA
- `inspo/sharing/roster/roster stats 2.jpg` — Overview/Offense/Defense tab layout, radar chart, execution split
- `inspo/sharing/game center/team calendar.jpg` — Monthly calendar view, games on Saturdays, bye week rows, upcoming sidebar
- `inspo/sharing/game center/team week.jpg` — Schedule telemetry list, completed vs upcoming, win probability, bottom KPIs

---

## Page Philosophy

This is the **command center for a single program.** A recruiter, fan, or analyst lands here and gets the complete picture — who they are, how they perform, who's on the roster, and what the data says about their future. It should feel like a premium team dossier, not a Wikipedia table.

Every section answers a question:
- **Hero** → Who is this program right now?
- **Roster tab** → Who is on this team?
- **Breakdown tab** → What does this roster look like analytically?
- **Stats tab** → How are they performing?
- **Schedule tab** → What have they played and what's coming?
- **Coaches tab** → Who runs this program?

---

## Layout — Tab Structure

```
[HERO BANNER — always visible, not in tabs]

[TAB BAR]
  Profile | Roster | Breakdown | Stats | Schedule | Coaches
```

Each tab fills the content area below the fixed hero + tab bar. The hero never scrolls away.

---

## Section 1 — Hero Banner

**Slot:** Full width, ~280px tall
**Inspired by:** `inspo/teampage.jpg` top section

### What it shows:
- **Background:** Team stadium photo from `public/pics/` with a dark gradient overlay
- **Team logo:** `/assets/{exportId-without-25}.svg` — large, left-anchored
- **Team name:** Giant bold uppercase — two-tone like "JACKSON **STATE**" where second word is in `brand.500` red
- **Conference badge:** "SWAC EAST" or "MEAC" pill
- **Live record:** Current season W-L (e.g., `9-1`)
- **Conference rank:** `#1 SWAC East`
- **Next game:** Opponent + date + time (if available)

### Data source:
- Team identity → `src/data/teams.json`
- Record/standings → `public/data/0-data/player_analytics_2025.json` → `team_analytics.{v5id}` (has roster_size, avg_par, top performers)
- Schedule → `public/data/1-game center/games/2025/` — parse game files for this team's results
- Stadium photo → `public/pics/` (confirm naming convention)

### Data gaps:
- Win/loss record is not in a single pre-computed field — must be derived from game files
- `next game` requires schedule data that is not yet in a JSON endpoint

---

## Section 2 — KPI Strip (below hero, above tabs)

**Slot:** Full width, ~80px
**Inspired by:** `inspo/teampage.jpg` Team Efficiency row

### What it shows (4 cards):
1. **Avg PAR** — average production score across all players with stats (from `player_analytics_2025.json`)
2. **Roster Size** — total active players (from `roster_hub_2025.json`)
3. **Transfer Rate** — % of roster from portal (from `roster_hub_2025.json`)
4. **Veteran %** — Sr + Gr percentage (from `roster_hub_2025.json`)

Each card: label (tiny uppercase), big number, subtle delta indicator if available.

### Data source:
- `public/data/0-data/player_analytics_2025.json` → `team_analytics.{v5id}.avg_par`
- `public/data/2-schools/roster_hub_2025.json` → `teams.{v5id}.composition.total_players`, `transfers.transfer_rate`, `experience.veteran_pct`

---

## Section 3 — Profile Tab (default landing)

**Inspired by:** `inspo/teampage.jpg` middle section

### Layout — 2 columns:

**Left (60%):**
- Featured player spotlight — top PAR performer from `player_analytics_2025.json → team_analytics.{id}.top_3_performers[0]`
  - Player photo (image_url from player_seasons_2025.json)
  - Name, position, class year
  - PAR score big
  - 2-3 key stats

**Right (40%):**
- Conference standings widget — SWAC East or MEAC standings (all teams, this team highlighted)
- Quick-nav cards — Roster / Schedule / Stats / History (icon + label + subtitle)

### Data source:
- Featured player → `public/data/0-data/player_analytics_2025.json` → `team_analytics.{v5id}.top_3_performers[0]`
- Player photo → `public/data/3-players/player_seasons_2025.json` → match by player_key → `image_url`
- Standings → derive from game results across all teams OR add a pre-computed standings JSON to pipeline

### Data gaps:
- **Standings not pre-computed** — currently must derive from game files. Pipeline should output a `standings_2025.json`
- **Player photo** — `image_url` exists in player_seasons_2025.json but linkage from player_key → image_url requires a join

---

## Section 4 — Roster Tab

**Route segment:** `?tab=roster`
**Inspired by:** `inspo/sharing/roster/rstoer1.jpg`

### What it shows:
A searchable, filterable grid of player cards. Each card:
- Jersey number
- Player photo (image_url)
- Name
- Position + class year
- Height / weight
- Glory score (PAR — from enriched data if available, else `—`)
- "View Stats" link → `/player/:playerKey`

### Filters:
- Position group buttons: ALL | QB | WR | RB | OL | DEF | ST
- Class year: ALL | Fr. | So. | Jr. | Sr. | Gr.
- Search by name or number

### Sort options:
- By Glory Score (default)
- By position
- By jersey number
- By class year

### Data source:
- Player list → `public/data/3-players/player_seasons_2025.json` filtered by `team_id === v5id`
- PAR/Glory score → `public/data/0-data/player_stats_2025_enriched.json` — join by `player_key`
- Photo → `player_seasons_2025.json → image_url`

### Data gaps:
- Not all players have enriched PAR (only ~903 of 2083) — show `—` for players without it
- Some players missing `image_url` — show placeholder with jersey number

---

## Section 5 — Breakdown Tab

**Route segment:** `?tab=breakdown`
**Inspired by:** `inspo/sharing/roster/roster outlook.jpg`, `inspo/sharing/roster/roster outlook 2.jpg`

This is the **roster intelligence view** — data-driven analysis of the roster's composition, experience, and recruiting geography.

### Sub-tabs:

**A. Composition**
- Position distribution bar chart (filter Unknown)
- Class distribution stacked bar
- Upperclass vs underclass split KPIs

**B. Experience**
- Veteran % big KPI
- Class pyramid (Fr → Gr)
- Year-over-year trend if available (roster_hub_all.json)

**C. Physical**
- Avg height/weight by position group (bar chart)
- Tallest and heaviest players (notable cards)

**D. Geographic**
- In-state % big KPI
- Avg recruiting distance
- Top 5 recruiting states bar chart

**E. Transfers**
- Transfer rate big KPI
- Tier breakdown (FBS/FCS/JUCO/D2 donut)
- Position impact bars (which positions lean on transfers most)

### Data source:
- All from `public/data/2-schools/roster_hub_2025.json` → `teams.{v5id}` — all 5 modules
- Year-over-year → `public/data/2-schools/roster_hub_all.json`

### Data gaps:
- See `DATA_PIPELINE_ISSUES.md` — 4 teams have bad position data, 4 teams have no transfer data

---

## Section 6 — Stats Tab

**Route segment:** `?tab=stats`
**Inspired by:** `inspo/sharing/roster/roster stats 2.jpg`

### What it shows:
Team-level season performance analytics.

**Top KPIs (4 cards):**
- Games played
- Avg PAR (team)
- Top performer name + PAR
- Transfer contribution rate

**Leaderboard tables by group:**
- Offensive leaders (QB, WR/TE, RB) — sorted by PAR
- Defensive leaders — sorted by PAR

Each row: player name, position, class, PAR score, games played

**Link to full player hub:** `/players?team={exportId}` (filter players page to this team)

### Data source:
- `public/data/0-data/player_stats_2025_enriched.json` — filter by team, sort by par
- `public/data/0-data/player_analytics_2025.json` → `team_analytics.{v5id}`

---

## Section 7 — Schedule Tab

**Route segment:** `?tab=schedule`
**Inspired by:** `inspo/sharing/game center/team calendar.jpg`, `inspo/sharing/game center/team week.jpg`

### Two views — toggled by the user (same data, different presentation):

**View 1 — Calendar**
Inspired by `inspo/sharing/game center/team calendar.jpg`
- Monthly calendar grid (Sun–Sat columns)
- Games land on their Saturday date — show opponent name, location, kickoff time
- Game result badge (W/L + score) for completed games
- Bye week spans the full row with "BYE WEEK" label
- Non-game weekdays can show practice/media day markers if available
- Right sidebar: upcoming 3 games with win probability bars (future state — needs model data)
- Month navigation: PREV / NEXT arrows
- Season selector in the page header to switch years

**View 2 — Telemetry List**
Inspired by `inspo/sharing/game center/team week.jpg`
- Vertical list of all games in season order
- Each row: week badge (W1, W2...), date, opponent logo + name, location (Home/Away/city)
- Completed games: score, VICTORY/DEFEAT label, net EPA sparkline, RECAP button → `/game/:gameId`
- Upcoming games: win probability bar + %, kickoff time, TV network, PREVIEW button
- Divider between completed and upcoming sections
- Bottom KPI strip: Strength of Schedule rank, Home record, (Playoff probability — future state)
- Season selector in the page header

### Season selector:
- Displayed in the tab header area, not inside the content
- Dropdown or pill buttons: 2021 | 2022 | 2023 | 2024 | 2025
- Changing season reloads the schedule data for that year

### Data source:
- **Requires `schedule_2025.json` (and per-year versions)** — pre-indexed by team, listing all games with: `game_id`, `week`, `date`, `opponent_id`, `home_away`, `score_us`, `score_them`, `result`, `kickoff_time`, `tv_network`
- Net EPA per game → available in individual game files `public/data/1-game center/games/2025/{gameId}.json` → `advanced_team.{teamId}.net_epa` or similar
- Win probability → not currently in data — future state

### Data gaps / pipeline requests:
- **`schedule_2025.json` (and 2021–2024)** indexed by team — critical blocker. Cannot scan 100+ raw game files at runtime.
- **Win probability** — not in current data pipeline. Mark as future state in UI with placeholder.
- Net EPA sparkline per game — available in game files but requires joining game_id to schedule index

---

## Section 8 — Coaches Tab

**Route segment:** `?tab=coaches`

### What it shows:
Current coaching staff for this team.

Each coach card:
- Name
- Title / role
- Years at this program
- Previous stops (career arc)

### Data source:
- `public/data/4-coaches/coaches_all_years.json` — filter by team + year 2025
- `public/data/0-data/coaching_trees_2021_2025.json` — career arc

---

## Navigation

The `SideNavContext` sidebar should populate when on this page with links to each tab. The `TeamNavRegistrar` component handles this — it already exists in `src/components/organisms/nav/`.

URL state drives tab selection — `useLocation()` reads `?tab=roster` etc. No `useState` for active tab.

---

## ID Translation Reference

| Used for | Format | Example |
|----------|--------|---------|
| React Router URL | `id` from teams.json | `jackson-state` |
| roster_hub keys | v5 (no "25") | `swacjsu` |
| player_seasons team_id | v5 | `swacjsu` |
| player_analytics team key | v5 | `swacjsu` (note: some files use v5 without "25") |
| Logo asset | v5 | `/assets/swacjsu.svg` |

---

## Pipeline Requests (Blockers)

Items 1–2 below predate the 2026-08-27 Resolved section above and are superseded: standings exist as `standings_race_{season}.json` (Game Center), and the Team Schedules per-team scoped/wide fallback already solves the "can't scan 100+ game files" problem (see [Team Schedules Design Doc.md](../../game-center/md/Team%20Schedules%20Design%20Doc.md)). Left here for history rather than deleted.

| # | What's needed | Why | Urgency |
|---|--------------|-----|---------|
| 1 | ~~`standings_2025.json`~~ | ~~Profile tab standings widget~~ — resolved, see note above | — |
| 2 | ~~`schedule_2025.json` indexed by team~~ | ~~Schedule tab~~ — resolved, see note above | — |
| 3 | Fix position data for Alcorn, ASU, DSU, Morgan State | Breakdown tab position charts | Medium |
| 4 | Fix transfer data for Alcorn, MVSU, DSU, Morgan State | Breakdown tab transfers | Medium |
| 5 | Fix in-state/distance for 7 teams | Breakdown tab geographic | Medium |
| 6 | Win probability per game | Schedule tab upcoming games sidebar | Low (future state) |
| 7 | Contextual game tagging on `next_game`/`previous_game` (`team_profile_{year}.json`) | Today `tag` is only ever `"Season Opener"` or `"Conference Game"` (checked across all 6 years, 2021–2026) — the Previous/Next Game cards can't highlight rivalries, homecoming, theme games, MEAC/SWAC Challenge, SWAC Championship, or Celebration Bowl because the pipeline doesn't classify games that way yet. Needs a richer tag/classification value (or a small set of boolean flags — `is_rivalry`, `is_homecoming`, `is_conference_championship`, `is_celebration_bowl`, etc.) on both fields. The frontend already renders `game.tag` verbatim, so this is a pure data addition, no component change needed once it ships. | Medium — flagged 2026-08-27 |
| 8 | `coaching_staff[]` on `team_profile_{year}.json`, replacing/extending single `head_coach` | Powers the new `CoachingStaffCard` carousel (HC + coordinators + position coaches). Needs per-coach `stat_value`/`stat_label` and an optional `delta: {direction, value}`. Explicitly requested as a launch.0 item, not deferred — see field types above. `coach_position_impact_by_school_season.json` already proves the delta concept is real and computable; this item asks backend to expose it pre-shaped for this card instead of the frontend deriving it. | High — launch.0, flagged 2026-08-27 |
| 9 | Distinguish `tag` from `headline` on `next_game` / `previous_game` | The `ReviewGameCard` was rendering the tag banner and the headline as two rows of identical text, overflowing the card and clipping the date/venue line beneath it. Fixed frontend-side 2026-08-30 by dropping the `tag → headline` fallback and skipping the banner when it would duplicate, but the underlying export still ships the same string in both fields for many games. Related to #7: once real classification lands, `tag` should be the short classification ("Homecoming", "Rivalry") and `headline` the sentence. | Medium — flagged 2026-08-30 |
| 10 | Per-player `image_url` reachable from game/stat contexts | `individual_stats[].player_key` (`PERS_00011465`) and the roster's `players[].id` (`meacdsu25100001`) are **two different identifier systems with zero overlap**, so a stat line cannot resolve to a player photo without matching on `"Last,First"` name strings — which lands 57 of 65 (88%), failing on suffixes (`Murray Jr,Quinton`) and on at least one corrupted name in the export itself (`"Thompson,Darmarcus QB hurried"`, a parser leak). Either identifier system needs to carry the other's key. | Medium — flagged 2026-08-30 |

---

## Build Order

1. **Hero Banner + KPI Strip** — visual impact, data mostly available
2. **Roster Tab** — player cards, filters, search — data available
3. **Breakdown Tab** — all data available via roster_hub, graceful degradation for gaps
4. **Stats Tab** — player_stats_enriched available
5. **Coaches Tab** — coaching_trees available
6. **Schedule Tab** — blocked on schedule index JSON from pipeline
7. **Profile Tab** — blocked on standings JSON from pipeline

---

---

## Note — Game Center (separate page)

`inspo/sharing/game center/team week 2.jpg` is **not** part of the team hub. That is the **league-wide Game Center** at `/game-center` — showing all SWAC + MEAC games for a given week across all 18 programs. Live scores, final scores, upcoming matchups. That page has its own design doc to be written separately.

---

*Last updated: 2026-08-30*
