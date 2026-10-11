# HBCU Gridiron Glory — Build TODO

*Last updated: 2026-05-06*

---

## Wiki Page — Data Gaps (High Priority)

### Stadium Photos
Currently 12 of 18 teams use the `Spinks-Casem Stadium.jpg` placeholder (all MEAC + 6 SWAC).
Teams with real stadium photos: BCU, FAMU, AAMU, ASU, JSU, MVSU.

| Team | Status |
|------|--------|
| Delaware State | ❌ Needs `/stadiums/dsu.jpg` |
| Howard | ❌ Needs `/stadiums/howard.jpg` |
| Morgan State | ❌ Needs `/stadiums/morgan-state.jpg` |
| Norfolk State | ❌ Needs `/stadiums/norfolk-state.jpg` |
| NCCU | ❌ Needs `/stadiums/nccu.jpg` |
| SC State | ❌ Needs `/stadiums/sc-state.jpg` |
| Alcorn | ❌ Needs `/stadiums/alcorn.jpg` |
| Grambling | ❌ Needs `/stadiums/grambling.jpg` |
| PVAMU | ❌ Needs `/stadiums/pvamu.jpg` |
| Southern | ❌ Needs `/stadiums/southern.jpg` |
| Texas Southern | ❌ Needs `/stadiums/tsu.jpg` |
| UAPB | ❌ Needs `/stadiums/uapb.jpg` |

### Band Signature Tracks (sonic_profile.tracks)
12 of 18 teams have empty `tracks: []`. Need real band track data added to `public/assets/wiki/wiki.json`.
Currently showing placeholder audio (`/assets/audio/swamp-2014.mp3`) with title "Signature Track — Coming Soon".

Teams with tracks: BCU, FAMU, AAMU, ASU, JSU, MVSU (3 tracks each).
Teams needing tracks: Delaware State, Howard, Morgan State, Norfolk State, NCCU, SC State, Alcorn, Grambling, PVAMU, Southern, Texas Southern, UAPB.

Each entry needs:
```json
{ "title": "Song Title", "url": "/assets/audio/{filename}.mp3", "year": "2024", "event": "MEAC Championship" }
```

### Placeholder Data Still In Components
The following are component-level fallbacks used when wiki.json has no data — they need real data added to wiki.json per team:

| Data | Teams Affected | Component |
|------|---------------|-----------|
| Hall of Famers | DSU (0), BCU (0), AAMU (0), ASU (0) | `FootballLegacyCard` |
| Retired Numbers | 17 of 18 teams (0) — only Alcorn has 1 | `FootballLegacyCard` |
| Alumni Roster | All teams have < 5 entries | `NotableAlumniCard` |

### Wiki Text Still Needs Review
Some `colorsDescription`, `philosophy`, and `briefHistory` fields may have generic placeholder-quality text. Agent should flag for editorial review when adding other data.

---

## Grid Migration — PageShell Rollout

All pages should use `PageShell` + `PageShell.Slot`. The following are still on the old `DesktopBoard4x` / `ContentContainer` pattern and need migration.

| Page | Route | Current Pattern | Priority |
|------|-------|-----------------|----------|
| Game Center Hub | `/game-center` | ✅ **PageShell done** | — |
| Games Hub | `/game-center/games` | ✅ **PageShell done** | — |
| Week Central | `/game-center/week` | ✅ **PageShell done** | — |
| Season Schedule | `/game-center/schedule` | ✅ **PageShell done** (hybrid) | — |
| Team Schedules | `/game-center/team` | ✅ **PageShell done** (hybrid) | — |
| Standings | `/game-center/standings` | ✅ **PageShell done** (hybrid) | — |
| Schools/Teams | `/teams` | ContentContainer | Low |
| Team Detail | `/teams/:teamId` | ContentContainer | Low |
| Players Hub | `/players` | ✅ **PageShell done** — every discovery board renders as a real `PageShell.Slot` with per-board `cols`/`rows`; searchable database stays in `listContent` (hybrid) | — |
| People Hub | `/people` | ✅ **PageShell done** — banner + hero carousel + card deck all render as real `PageShell.Slot`s (`cols`/`rows` per card, from `buildDeck()`) | — |
| Coaches Hub | `/coaches` | ContentContainer | Low |
| Officials | `/officials` | ContentContainer | Low |

**Agent instructions for migration:**
1. Read `AgentDesignBible.md` section 2 for PageShell rules
2. Read `AGENTS.md` → PageShell Grid System
3. For each page: wrap content in `<PageShell>`, assign `PageShell.Slot cols/rows` to each card/widget
4. The banner always goes in `<PageShell.Slot cols={4}>` first
5. Do NOT change the banner component or any data logic — layout only
6. Every component must use `w="full" h="full"` to fill its slot

---

## Game Center (`/game-center`)

| Page | Route | Status | Notes |
|------|-------|--------|-------|
| Hub | `/game-center` | ✅ Grid done | PageShell 5-row layout. Data wired. |
| Games Hub | `/game-center/games` | ✅ Grid done | 7-row design-doc layout. 7 new card components. **Open: display all 15 dynamic candidates?** |
| Week Central | `/game-center/week` | ✅ Grid done | Banner height bug fixed. |
| Season Schedule | `/game-center/schedule` | ✅ Grid done | Hybrid (grid + scrollable list). |
| Team Schedules | `/game-center/team` | ✅ Grid done | Hybrid. |
| Standings | `/game-center/standings` | ✅ Grid done | Hybrid. |
| Rankings | `/game-center/rankings` | ❌ Not started | `soon: true` in nav |

### Design Docs
- ✅ `src/pages/game-center/md/Game Center Hub Design Doc.md`
- ✅ `src/pages/game-center/md/Games Hub Design Doc.md`
- ✅ `src/pages/game-center/md/Week Central Design Doc.md`
- ⏳ Season Schedule design doc
- ⏳ Standings design doc
- ⏳ Rankings design doc

### Component Lab — Week Central
| # | Component | Status |
|---|-----------|--------|
| 1 | Banner 4x1 Variant A | ✅ In lab |
| 2 | Banner 4x1 Variant B (Scoreboard) | ✅ In lab |
| 3 | Banner 4x1 Variant C (Magazine) | ✅ In lab — **in production** |
| 4 | Game Card 2x1 Variant A | ✅ In lab |
| 5–9 | Game Card 2x1 Variants B–F | ✅ In lab |
| — | Spotlight 2x2 | ❌ Not built |
| — | KPI cards 1x1 | ❌ Not built |

### Week Central — Next Steps
- Pick game card winner from lab → wire into page
- Build Spotlight 2×2 card (highest Why-scored game)
- Build KPI 1×1 cards (pair beside spotlight)
- Wire Glory score sort + conf-first filter tabs

---

## Banners (All 12 Deployed)

All pages have a 4×1 magazine-style banner. Status: ✅ Done.

Remaining polish:
- ⏳ Record data for BannerTeamDetail subheader (currently shows `— - —`)
- ⏳ Season picker in banners: confirm year data loads correctly end-to-end

---

## Team Hub (`/teams/:teamId`)

| Tab | Status | Notes |
|-----|--------|-------|
| Profile | ⏳ Placeholder | Needs hero upgrade, featured player, standings widget |
| Roster | ⏳ Basic | Needs player cards, glory score, filters, search |
| Breakdown | ⏳ Partial | Composition/experience/physical/geo/transfers |
| Stats | ⏳ Placeholder | PAR leaderboards by position |
| Schedule | ⏳ Placeholder | Calendar view + Telemetry list toggle |
| Coaches | ⏳ Placeholder | Staff list, career arc |

---

## Roster Hub (Component Lab → Live Page)

| # | Component | Slot | Status |
|---|-----------|------|--------|
| 18–20 | Command Header A/B/C | 4x1 | ✅ In lab — awaiting winner |
| 26 | Face-Off Comparator | 4x4 | ⏳ Winner selected — needs D & E variants |
| 31 | Experience Matrix | 4x3 | ✅ In lab — awaiting winner |
| 41–43 | Transfer Board | 4x3 | ✅ In lab — awaiting winner |
| — | Physical Lab | 4x3 | ❌ Not started |
| — | Geographic Pipeline | 4x2 | ❌ Not started |
| — | Trend Studio | 4x4 | ❌ Not started |

- ❌ Live page assembly — waiting on all component winners

---

## Other Pages

| Page | Route | Status |
|------|-------|--------|
| Players Hub | `/players` | ✅ Live |
| Player Detail | `/player/:playerKey` | ✅ Live |
| Coaches Hub | `/coaches` | ✅ Live |
| Coach Detail | `/coaches/:coachId` | ✅ Live |
| Officials | `/officials` | ✅ Live |
| Stats | `/stats` | ✅ Live |
| Schedule | `/schedule` | ✅ Live |
| Game Deep-Dive | `/game/:gameId` | ✅ Live |
| Schools/Teams | `/teams` | ✅ Live |
| People Hub | `/people` | ✅ Live — banner + card deck (see Grid Migration table + People Hub section below) |

---

## People Hub — Card Visual Variety (Follow-Up)

**Status:** Deferred — documented here, not started.

### What's done
- Card deck (`src/components/organisms/people/PeopleHubCardDeck.js`) now renders
  through real `PageShell.Slot`s in `PeopleHubPage.js` — `buildDeck()` returns
  `{ card, cols, rows, Component }` per card and the page composes them directly,
  same pattern as every other PageShell page. The deck no longer owns its own
  `Grid`/`gridAutoFlow: dense`.
- A card-family size study (Solo/Duo/Cohort/State-Pipeline/Coach, each at 1–3
  sizes) was built and reviewed as a private artifact, then deleted per request —
  not saved anywhere else. Findings folded into the notes below.

### What's still open — visual variety, not just size
The family study explored *sizing and information hierarchy within each family's
existing visualization* — it did not explore genuinely different visualizations.
Direction from design review: a real pass should vary the actual chart/graphic per
content type, the way a weather app's detail grid does — a compass for wind, a
radial dial for UV, a bar cluster for humidity, a curve for pressure — each one a
different visual language, not the same shape resized. (The weather reference was
cited for visual *variety* only — its two-column layout template was explicitly
rejected as a pattern to copy.)

Today the deck draws from six viz kinds only: `production_radar`, `rank_bars`,
`donut`, `field_map_passing`, `game_curve`, `split`. Several archetypes reuse
whichever of the six is closest rather than getting a bespoke visual (e.g. both
`same_zip_code` and `pass_rush_tandem` currently use `split`, which fits neither
claim especially well — "grew up in the same city" and "hunt in pairs" don't have
anything in common structurally).

**Next step when picked back up:** go archetype-by-archetype (not family-by-family)
and design a visual bespoke to each claim — the way `field_map_passing` is already
bespoke to a passer's game and `production_radar` is already bespoke to a
multi-phase defender's shape. Reference `reqs/PEOPLE_HUB_CARD_INVENTORY.md` for
the full ~70-archetype list this needs to eventually cover.

---

## Data Pipeline Requests

| Priority | Item | Blocks |
|----------|------|--------|
| **High** | **`person_id` is not stable across exports or seasons** — Cameron Peters ships as three different ids in three files that deploy together: `PERS_00011369` (players_hub_2025.json, a 2024-generation id), `PERS_00011214` (player_seasons_2025.json), `PERS_00003846` (player_stats_2025_enriched.json). Frontend currently joins on name+team as a workaround (verified 0 collisions across all 1,946 players in 2025), but that breaks on a name change or a mid-season transfer. Needs one stable person key emitted by every export. | Any cross-source player join — player spotlight standing/boards/jump cards, People Hub card → player page links, multi-year history |
| Medium | Prior-season production stats (`player_stats_{year}_enriched.json` for 2024 and back) | Year-over-year comparison on the player page — currently only the 20 players on `breakout_radar` carry prior metrics, so "The Jump" card can't render for anyone else |
| Low | Three teams use a different code inside `game_id` than their `shortName` (Alcorn→`ALC`, GSU→`GRAM`, MSU→`MORG`) | Opponent decoding from `game_id`; frontend carries an alias map as a workaround |
| High | Quarter-by-quarter scores in schedule index | Game Center rail byQ display |
| High | Game detail page-shaped fetch contract | Game Summary, Box Score, Play By Play, Team Stats |
| High | Excitement index pre-computed per game | Week Central spotlight, Games Hub story cards |
| High | Special teams production payload with glossary metadata | Game detail production report |
| Medium | Fix position data — Alcorn, ASU, DSU, Morgan State | Roster Hub |
| Medium | Fix transfer data — Alcorn, MVSU, DSU, Morgan State | Roster Hub |
| Medium | Fix in-state/distance — 7 teams | Roster Hub geographic tab |
| Low | Win probability per game | Week Central upcoming cards |
| Low | TV network per game | Week Central upcoming cards |

---

## Game Detail Production Report

### Game Page Tabs - Data Contract

Future Firebase/Supabase integration should expose a direct game-detail fetch:

```text
game_detail_payload(game_id)
```

The response should be page-shaped so the frontend requests the specific data needed by `/game/:gameId`:

| Tab | Required Payload Group | Notes |
|-----|------------------------|-------|
| Game Summary | `summary` | Scoreboard, team metrics, leaders, game flow, hidden edges, chart feeds |
| Box Score | `box_score` | Production components moved out of the lab and backed by production fields |
| Play By Play | `play_by_play` | Drive rows, play rows, actors, EPA/WPA, significant play/drive/series flags |
| Team Stats | `team_stats` | Full raw and derived stat dump in basic tables |

Documentation source of truth:

- `src/pages/game-center/md/Game Page Design Doc.md`
- `DATA_PIPELINE_ISSUES.md` -> `P0 - Game Detail Page Fetch Contract And Summary Inventory`

### Special Teams B - Tightening Pass

Keep `Game Production - Special Teams B` as the production direction. It should become a wide postgame module with four explicit sections:

| Section | Production Stats |
|---------|------------------|
| Hidden Field Position | Avg start field position, long field drive rate, special teams hidden yards, special teams swing yards, penalty cost, special teams play count |
| Kickoffs | Attempts, touchback rate, out-of-bounds count, opponent avg start allowed, kickoff field position value, return rate allowed, avg return allowed, explosive returns allowed |
| Kick Returns | Returners, returns, yards, average return, long return, touchdowns, fumbles when available |
| Punts | Attempts, punt distance from scrimmage, inside-20 rate, inside-10 rate, block rate, fair-catch rate, downed count |
| Punt Returns | Returners, returns, yards, average return, long return, muffs, blocks, net yards over expected |
| Field Goals / PAT | FG made/attempts, FG%, long made, trust range, aggression threshold, by-distance range, PAT made/attempts, blocks allowed/forced |

UI polish needed:

- [ ] Rename the top section from "Hidden Field Position" to either "Field Position Ledger" or "Hidden Yardage Ledger" after final copy review.
- [ ] Replace raw `espa` display with a user-facing label such as "Kickoff Field Position Added".
- [ ] Replace raw `nyoe` display with a user-facing label such as "Net Yards Over Expected".
- [ ] Add tooltip support for every non-obvious stat.
- [ ] Add a glossary section/page for football analytics definitions used across game detail pages.
- [ ] Add polarity metadata in the UI copy: make clear whether positive or negative is good for the displayed team.
- [ ] Add return-player rows for kick returns and punt returns.
- [ ] Keep the component wide; do not reduce it to a sidebar card.

Glossary/tooltips should cover at least:

- Avg Start Field Position
- Long Field Drive Rate
- Special Teams Hidden Yards
- Special Teams Swing Yards
- Penalty Cost
- Kickoff Field Position Added
- Touchback Rate
- Avg Start Allowed
- Explosive Return
- Punt Distance From Scrimmage
- Inside-20 Rate
- Inside-10 Rate
- Fair-Catch Rate
- Net Yards Over Expected
- Trust Range
- Coach Aggression Threshold

---

## Platform Backlog

### Stat Visual Inspiration

- New reference folder: `inspo/found`
- Use these screenshots as inspiration for upcoming stats, analytics, team profile, game recap, standings projection, box score, EPA, win expectancy, success rate, QB performance, and year-over-year change visuals.
- When designing Stats page refresh, Game Center cards, Team Hub stats, player analytics, or comparison tools, review this folder before building lab variants.

| Item | Priority | Notes |
|------|----------|-------|
| GamesHub — display all 15 dynamic card candidates on page | High | Q confirmed intent; pending — asked A or B, session ended before answer |
| Why Engine — computeWhyScores hook | High | Client-side excitement/significance scoring |
| Rankings page `/game-center/rankings` | Medium | Not started |
| Player comparison tool (VS Protocol) | Medium | Lab designs not started |
| GSAP ScrollTrigger animations | Low | Depends on layout stability |
| Supabase backend integration | Low | Future |

---

## Celebration Bowl Hub

| Item | Priority | Notes |
|------|----------|-------|
| Standalone Celebration Bowl Hub | High | Add a future postseason hub route, likely `/game-center/celebration-bowl`, for the MEAC vs SWAC title stage. Preserve the approved Atlanta Orbit concept here as a premium interaction: every year circles Atlanta, hover reveals score/MVPs/attendance/series state, and the orbit shows how each result pulls the series toward MEAC or SWAC. |
| Conference Wiki Celebration Bowl section | High | Use `src/pages/teams/md/Conference Wiki Hub Design Doc.md` as the source planning doc for the first lab pass. |
