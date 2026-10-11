# After Launch.0

**Created:** 2026-08-26
**Purpose:** everything that is intentionally *not* in launch.0 — either pulled from nav, left as a stub, or scoped out — plus the frontend cleanup that becomes possible once backend ships the fields already specified in the Game Center docs. Nothing here is optional-forever; it's sequenced after, not cut.

Related docs, not duplicated here: [Game Center Fetch Contract.md](src/pages/game-center/md/Game%20Center%20Fetch%20Contract.md), the per-page design docs in `src/pages/game-center/md/`, [BACKEND_PIPELINE_TODO.md](BACKEND_PIPELINE_TODO.md), [ESLINT_WARNINGS.md](ESLINT_WARNINGS.md).

---

## 1. Pulled for launch.0 — must come back

These aren't cut features. Most are removed from the sidebar (`useRouteSideNav.js`, 2026-08-26) because what's behind them isn't ready; one (The March) is a card pulled from a page that ships. Every one needs a real build after.

### People Hub (and the whole People section)
**Pulled from nav 2026-09-02** — removed from the top nav (`Header.js` `NAV_ITEMS`) and the overlay menu (`OverlayMenu.js` `NAV_ITEMS`). Routes stay wired in `App.js`, so `/people`, `/players`, `/coaches`, `/officials` all still resolve by direct URL; they're just unreachable from navigation.

**Why it was pulled:** the hub work stalled on a design problem that never got solved. Two rounds of feedback said the same thing and neither landed:

1. **Card visuals need to vary by archetype, not by layout family.** Both `/people` and `/players` currently draw from a small fixed set of visuals (six on People, effectively one ranked-list pattern on Players) and reuse whichever is closest, rather than each card type getting a visual built for its own claim. The reference given was a weather detail grid — a compass for wind, a radial dial for UV, a bar cluster for humidity — each a different visual language, not the same shape resized. See the existing "People Hub — Card Visual Variety" section in [TODO.md](TODO.md), which covers the same ground for `/people`.

2. **The `/players` conversion missed the brief.** The 2026-09-02 pass moved every existing discovery board into real `PageShell.Slot`s with varied `cols`/`rows` and made the boards people-forward (faces on every card that names players, one visual per board type). That part is done and stands. But it was fundamentally a re-layout of the boards that were already there — it did not act on the earlier conversation about editorial framing, cross-data correlation, and narrative angles (journey/path, standing-as-verdict, weighted storyline picks, board cross-referencing per player). Those ideas were discussed at length and then not built.

**What needs to happen after launch.0:**
- Decide the actual editorial concept for the People section before writing more layout code — the last two passes both jumped to implementation and both missed
- Per-archetype visual design (see TODO.md's People Hub section for the full framing)
- Revisit whether `/people` and `/players` should both exist as hubs, or collapse into one

**Known-good work to keep, not redo:**
- [PlayersBanner.js](src/components/organisms/PlayersBanner.js) — production banner built to AgentDesignBible §2b, no control strip. Replaced a mock player-detail placeholder.
- [PlayersHubCards.js](src/components/organisms/player/PlayersHubCards.js) — nine board cards, all rendering real `players_hub_2025.json` data with faces
- [PeopleHubCardDeck.js](src/components/organisms/people/PeopleHubCardDeck.js) + [build_people_hub_cards.js](scripts/build_people_hub_cards.js) — the card-archetype feed, coverage balance, and person dedup
- `PlayersPage.js` lost ~950 lines of dead code in the conversion; that cleanup stands regardless of the redesign

### The March (Game Summary tab)
**Pulled 2026-09-05** — the `FieldPositionMarch` card (row 1, 4x1) no longer renders on the Game Summary tab. The component and its helpers (`EventDot`, `DriveEndMarker`, `MarchTooltip`, and the `PVAMUJSU_RAW_PLAYS` mock feed) are left intact in [GameSummaryTabV2.js](src/components/game/page/summary/GameSummaryTabV2.js) with an `eslint-disable` on the now-unused component — bringing it back is re-adding one `PageShell.Slot`, not a rebuild.

**Why it was pulled:** it's the one card on the tab still leaning on a hardcoded mock play feed when real play-by-play is missing, and the yard-line trace is the piece most sensitive to parse quality — exactly the thing that isn't there yet across the season (`145 games · 14 final · 3 parsed`, see §6a of `reqs/STATS_HUB_CARD_INVENTORY.md`).

**What needs to happen after launch.0:**
- Drop `generateMockPlays` / `PVAMUJSU_RAW_PLAYS` entirely — the card should render empty, not fabricated, when a game has no parsed drive data
- Revisit the design with real 2026 play data behind it before deciding it earns a full-width row

### Classics & Homecoming
**Postponed again 2026-10-04** — off the Game Center sidebar for launch.0 (`useRouteSideNav.js` `GAME_CENTER_ITEMS`); route stays wired. This is also where events (classics, homecomings, neutral-site games) get their page.

**Confirmed must return.** Right now [ClassicsHomecomingHubPage.js](src/pages/game-center/ClassicsHomecomingHubPage.js) is a 24-line `ComingSoon` stub — no layout, no data, no design pass yet. Needs:
- A design doc (none exists yet — every other Game Center page got one this session, this one didn't)
- A backend contract for what a "classic" or "homecoming" game actually is — the `event: { kind, name }` field already exists on Team Schedules and Games Hub payloads for exactly this, but nothing surfaces it as its own page yet
- Real page build, desktop + mobile

### Games Hub
Blocked on the Why Engine specifically, not on data shape. [Games Hub Design Doc.md](src/pages/game-center/md/Games%20Hub%20Design%20Doc.md) section 2 explains why: `wildFinish`/`statementGame`/`coverStory` are currently sorted by point margin and presented as narrative, which is fabricated editorial, not real ranking. Needs:
- Why Engine to actually rank story candidates and ship `story_cards[]` with real `why_score`/`why_reasons`
- No mobile layout exists yet — deliberately not built until the ranking is real, so it isn't built twice

### Test Game Page
Lowest priority of the three — it's a dev/lab route (`/lab/test-gamepage`) that had gotten wired into production nav by mistake, not a real feature. After launch.0: decide whether to keep it as an internal dev tool (fine to leave dev-only, just never in customer nav again) or delete `TestGamePage.js` outright.

### Coaches Hub
Removed 2026-08-26: the `COACHES HUB` entry in the Schools sidebar (`useRouteSideNav.js` `SCHOOLS_ITEMS`), pointing at `/coaches`. Route stays wired in `App.js`; it's just not reachable from the Schools sidebar anymore. Needs a real build pass before it comes back — same "hidden for launch.0" status already noted in section 3 below.

Also removed 2026-08-26: the per-team `COACHES` entry in the team-detail sidebar (`useRouteSideNav.js` `buildTeamHubTabs`, pointing at `${base}/coaches/hub`) — replaced in the same slot by `FULL ROSTER` (`${base}/roster/full`). Route stays wired in `App.js`.

### School Stats
Postponed 2026-10-04: the per-school stats page (`/teams/:teamId/stats`, [TeamStatsPage.js](src/pages/teams/TeamStatsPage.js) — Team Rankings, Stat Leaders) is off the team sidebar / team switcher (`useRouteSideNav.js` `buildTeamHubTabs`). Route stays wired in `App.js`. Needs: real data (its rankings and leaders are hard-coded placeholders in the page — "KJ Cooper", "92% red zone #1 SWAC"), a backend request, a mobile layout, and removing its `useEffect` (banned).

### Stadiums
Removed 2026-08-26: the `STADIUMS` entry in the Schools sidebar (`useRouteSideNav.js` `SCHOOLS_ITEMS`), pointing at `/schools/stadiums`. Route stays wired in `App.js`.

Came back 2026-09-20 with its first real build; **postponed again 2026-10-04** for launch.0 and pulled from the sidebar. Still needs: flesh out, mobile conversion.

---

## 2. Backend contract adoption — frontend cleanup once fields ship

Every item below is **frontend work that becomes trivial the moment backend ships the field** — these are the fallbacks and workarounds documented across the Game Center design docs, listed here as a single punch list so nothing gets lost once the data lands.

### Classification vocabulary (`is_covered_matchup`, `conference_scope`, `division_scope`, `game_type`, `event`)
Spec: [Game Classification Vocabulary.md](src/pages/game-center/md/Game%20Classification%20Vocabulary.md). One field set, unlocks correct filtering on three pages at once:
- **Week Central** — swap `pickFilters("all", "hbcu")` from fail-open to real filtering
- **Season Schedule** — same swap; also fixes the filter defaulting to *on* and hiding HBCU cross-conference games
- **Team Schedules** — replace `gameMatchesFilter`'s string-matching (`text.includes("championship")`) with real field checks; this is the worst offender, documented in its own doc section 4

### Team Hub Previous/Next Game contextual tagging
Spec: [Team Hub Design Doc.md](src/pages/teams/md/Team%20Hub%20Design%20Doc.md) Pipeline Requests §7. `team_profile_{year}.json`'s `next_game.tag`/`previous_game` only ever carry `"Season Opener"` or `"Conference Game"` today (checked across all 6 years). Needs real game classification (rivalry, homecoming, theme game, MEAC/SWAC Challenge, SWAC Championship, Celebration Bowl) so the Previous/Next Game cards on the Team Profile page can actually highlight them — frontend already renders `game.tag` verbatim, so this is a pure data addition.

### Conference Slate `axes`
Once backend ships `axes.*.team_ids`, delete `FALLBACK_AXES` in `ConferenceSlateMatrix.js`. Currently a safe fallback (wrong axis membership is visible and self-correcting, unlike stale scores) but still a frontend constant standing in for backend data.

### Season Schedule `division.team_ids` / `division.accent`
Once shipped, delete the hardcoded `GROUPS` object in `seasonScheduleModel.js` (rosters + accent colors).

### Per-slice scoped exports
- **Week Central** — split `week_central_{season}.json` into `week_central/{season}/{week}.json`. Currently 236 KB to show one week.
- **Season Schedule** — split `season_schedule_board_{season}.json` into `schedule_board/{season}/{group}.json`. Currently 768 KB to show one division — the largest payload in Game Center.
- **Team Schedules** — already wired frontend-side (`useTeamScheduleData.js` requests the scoped path first, falls back to the wide file per season). Once backend ships `team_schedules/{season}/{team_id}.json`, the fallback goes cold on its own — delete it and `gameCenterPaths.teamSchedules` once nothing reaches for the wide path anymore.

### Game Center Hub context engine
[Game Center Hub Design Doc.md](src/pages/game-center/md/Game%20Center%20Hub%20Design%20Doc.md) section 4. Two things ship together:
- `featured_games[].why_score` / `.why_reasons` — top row currently has no ranking signal at all
- `context_cards[]` populated with real `why_score` — bottom two rows currently fall back to client-derived filler in `useGameCenterHubData.js`

Also: `results_season` / `results_source` for the week-0 prior-season fallback on the results rail — without it the frontend can't detect or label that it's showing last year's results.

### Standings
- `epa_combined` — swaps `POWER_METRIC` from point differential to real combined EPA. One-object edit once the field exists (see doc section 4)
- `finish_matrix[]` — currently synthesized client-side from standings order (`buildCompletedFinishMatrix`); should render empty instead of a fabricated matrix until real
- `last5` / `streak` — **discrepancy worth resolving, not a frontend bug.** `BACKEND_PIPELINE_TODO.md` (2026-08-13 upload) claims these fields now exist and are populated in `standings_race_{season}.json`. But `StandingsPage.js`'s `modelFromStandingsRace` (the live-payload path) still falls through to `"-----"` / `"-"` — the frontend is correctly wired to `row.last5 ?? row.recent_form ?? row.form`, it's just that none of those keys are present in the export being fetched today. Confirm against the current export before assuming either doc is right.
- `context_cards[]` (KPI rotation) — currently derived client-side in `buildContextItems`; drops items it can't compute honestly rather than faking them, but should be replaced by real backend picks

### Cross-page naming unification
- **`has_game_page`** — currently spelled 4 different ways across contracts (`has_detail_page`, `has_recap`, `has_parsed_game`). Standardize once backend picks it up; frontend already documents the target name.
- **`teams.json` vs backend structure** — `axes`, `division.team_ids`, `groups` should own conference/division membership; `teams.json` should carry visual identity only (logos/colors/names). The Alcorn State division bug (fixed 2026-08-25, frontend-side) is the evidence this needs real unification, not just a one-off patch.

---

## 3. Full builds deferred past launch.0

From the original site-wide roadmap pass — launch.0 ships a minimal version, real depth comes after:

- **Homepage** — full update; launch.0 is close to static
- **Team Stats page** — launch.0 is generic basic tabling; needs real build
- **People Hub** — launch.0 is basic; may reconsider scope entirely (was being weighed as "just Players" for now)
- **Players Hub** — visual consistency pass, remove sections without real backing data, banner update
- **Coaches Hub** — hidden for launch.0; real build after
- **Officials Hub** — hidden for launch.0; real build after
- **Rosters Hub** — KPI section rework; sidebar nav complaint specifically at `/teams/[team]/roster/full` needs a fix. ~~Directory no-default-team behavior~~ — done 2026-08-26: Team mode's initial selection is now random per page load instead of hardcoded to `swacjsu`.
- **Schools section** — multiple fixes flagged, not yet itemized into a design doc
- **`/stats` page cleanup** — confirm nav removal of `?tab=transfers` and `?tab=continuity` (no clear owner for what these were meant to be); confirm `team-analytics` and `player-analytics` stay delayed; confirm `?tab=coaching` stays hidden until launch.0 passes
- **Team Schedules desktop row** — `GameRowOld` (the correct dense desktop row) is dead code, never rendered; the row that IS rendered (`TeamScheduleGameRowStandard`) is a mobile card idiom scaled up. Documented as a High open item in the design doc, not yet fixed. Worth revisiting even before "after launch.0" if there's time — it's a visual regression, not a data wait.
- **Play by Play — dynamic stat strip** (added 2026-09-20). launch.0 ships the filter bar + list ([PlayByPlayPanel.js](src/components/molecules/game/PlayByPlayPanel.js)): quarter / team / play type (rush, pass, special teams, penalty) / highlights / player search, and the only readout is "N filters · M plays". After launch.0, the strip between the filters and the list becomes a live stat line that describes whatever the current filters have selected, and changes shape with them:
  - **Player selected** — that player's line off the visible plays, by role: rusher → car / yds / YPC / long / TD; passer → comp / att / yds / TD / INT; receiver → tgt / rec / yds; tackler → tkl / TFL / sacks; returner → ret / yds. Plus EPA and WPA totals and big-play count.
  - **Away / Home selected** — that offense's line over the visible plays: plays / yds / YPP / EPA / success rate / explosive count / 3rd-down record / turnovers.
  - **Play type selected** — the split for that type: rush → carries, YPC, stuff rate; pass → comp %, YPA, sack count; special teams → net punt / kick avg; penalty → count, yards, by team, no-play count.
  - **Combinations** stack (a player + Q4 + pass = that player's Q4 passing line), and the strip labels itself with the active filter chips so it always says what it is summing.
  - **Rule:** the strip sums fields the export already puts on each row — `yards_gained`, `epa`, `wpa`, `scoring_event`, `turnover`, `first_down`, `big_play`, `players[].role`, `penalties[]` — over the rows the filters left visible. It is a window over the list, not a stat engine: nothing rate-based that needs a definition (success rate, stuff rate, TFL) ships until the backend puts the per-play flag on the row (`success`, `stuffed`, `tfl`), same as `big_play` today. Those three flags are the backend ask.
  - Also in scope for the same pass: row expand should show the play's `players[]` with roles (today it shows the raw text and penalties only), and the Player search should be reachable from a row (click a name → filter).

---

### Preview page for games against opponents outside the 18 *(noted 2026-10-01)*
Game previews shipped for games **between two of the 18** (`/game/preview/:gameId`, [GamePreviewPage.js](src/pages/game-center/GamePreviewPage.js)). An upcoming game against an outside opponent has no preview page yet, so on the Games Hub (`/game-center/games`) those cards stay unlinked — [gamesHubModel.js](src/utils/gamesHubModel.js) only builds a preview link when both teams are in `teams.json`.

Needs a separate design pass, not a reuse of the covered-game page: the outside team has no schedule file, no records entering the game (Week Central already flags this — "Records are empty for opponents outside the 18"), no unit stats and no league rank, so most of the matchup table has nothing to show. Decide what a non-18 preview *is* (the 18-team side's profile, the opponent's name and conference, venue and event, countdown) before building.

## 4. Mobile passes still needed

Confirmed working on mobile this session: Game Center Hub, Week Central, Conference Slate, Season Schedule, Team Schedules, Standings. Not yet audited:

- Games Hub (blocked on the Why Engine anyway — build once, build correctly)
- Homepage
- Rosters Hub
- Team Stats
- People / Players / Coaches / Officials hubs
- Schools section pages
- Every page in the "full builds deferred" list above, once each is actually built

---

## 5. Tech debt

- **ESLint warnings** — full inventory in [ESLINT_WARNINGS.md](ESLINT_WARNINGS.md), 136 warnings across 5 rule types, 0 errors, all pre-existing. Flagged for a separate review pass; two `react/jsx-no-duplicate-props` spots specifically worth a look since a duplicate prop can silently shadow one that was meant to do something.
- **`Games Hub`, `Classics & Homecoming`, `Test Game Page` routes** — still wired in `App.js` even though unreachable from nav. Fine as-is (nothing 404s), but worth a pass to decide if `TestGamePage.js` should just be deleted rather than kept as a ghost route.
- **Full codebase cleanup / reconfiguration pass.** Not a targeted fix — a thorough sweep across the whole app once launch.0 ships. Scope:
  - **`useEffect` audit.** The ban (`AGENTS.md` "useEffect Ban — CRITICAL") is meant to be absolute already, but this has been a fast-moving multi-agent codebase — confirm nothing slipped through, everywhere (production and test/lab). Anything doing one-time external sync on mount should be `useMountEffect`; anything else should turn out to be `useMemo`, React Query, or an event handler instead, per the same section's alternatives list.
  - **One component per file.** Audit for components that grew multiple named components stacked in a single file (a real pattern in this codebase from fast iteration — e.g. panel + sub-cards + table pieces all in one file) and split them out where the file has genuinely grown into more than one reusable unit. Judgment call per file, not a mechanical split of every helper subcomponent.
  - **Efficiency / reuse / stability.** Look for duplicated logic that should already be a shared util (the `productionEntries` consolidation this session — three separate copies of the same normalizer before it was pulled into `gameHelpers.js` — is the shape of thing to hunt for elsewhere), unnecessary re-renders, and any component that isn't actually stable against the real data shapes it's given (missing null guards on backend fields that are allowed to be absent).
  - **Security pass.** Standard OWASP-style check across the app now that feature work has slowed down — injection, unsafe `dangerouslySetInnerHTML` usage if any exists, anything trusting raw external input.
  - Cross-reference `ESLINT_WARNINGS.md`'s 136 warnings (above) as a starting index, but this is broader than lint-clean — it's a structural/architecture pass, not just silencing warnings.

---

## 6. Visual library (cross-reference our designs)

Post launch.0. A lab page that groups every visual in the app **by kind of visual**, not by page: maps, rings/donuts, rank ladders, waffle grids, slope charts, timelines, field diagrams, logo collages, banners. Each family shows every existing version side by side at the same size (the home hero tile faces built 2026-10-01/02 next to what the site already has, e.g. the Schools Wiki `ConferenceFootprint` map vs the tile-grid map in `TeamsTileFaces.js`). The user picks a winner per family; the winner becomes the one shared component and every usage switches to it. First known case: replace the tile-grid map in The Map, Pipeline and Hometown Hero faces with the wiki's footprint map.

---

## 7. Sidebar: games and players nest under the section they came from

Post launch.0 (decided 2026-10-03). `useRouteSideNav.js` currently files every `/game/:id` and `/game/preview/:id` under "hub". The game/preview scoreboard button should be injected under the sidebar tab it was clicked from (Games, Week Central, Season Slate, Team Schedules, etc.); same for player buttons. The source section has to travel with the navigation (e.g. router state or a `?from=` param) since the URL alone can't say where the click happened.

---

## 8. Data Room — Data Quality & Coverage panel

Hidden for launch.0 (2026-10-04) on desktop and mobile: the Team section's last panel (schema, play/drive counts, enrichment, field coverage, generated date). The panel is intact in `src/components/game/page/teamstats/DataRoomTab.js`; set `SHOW_DATA_QUALITY` to `true` to bring it back. Decide after launch whether it returns publicly or moves to an internal/admin view.


## 9. Light / Night mode
Groundwork is in (2026-10-04): palette variables, the scheme store, Chakra tokens on variables, and the Night / Light switch at the bottom of the sidebar (development only). The colour sweep and the light designs for banners, scoreboards and photo cards come after launch.0. Plan, token map and order: [THEME_LIGHT_NIGHT.md](THEME_LIGHT_NIGHT.md). Backup before the work: `archive/src_backup_2026-10-04_pre-theme.zip`.

## 10. Player Analytics hub
Postponed past launch.0 (2026-10-04). The sidebar shows PLAYER ANALYTICS greyed with a lock (`locked: true` in `STATS_ITEMS`, `src/hooks/useRouteSideNav.js`); `/player-analytics` redirects to `/stats` in production and still opens in development (`src/App.js`). To unlock: drop `locked` and restore the plain route. Needs its own fetch contract before it ships, like Team Analytics.

## 11. Stats Hub: Team Efficiency, Leaderboards and the hub switch
Parked 2026-10-07. `/stats` is the hub only: banner + the eleven context cards (`components/molecules/stats/StatsHubContextCards.js`, data `stats/hub-cards/{season}.json`, [Stats Hub Cards Fetch Contract](src/pages/stats/md/Stats%20Hub%20Cards%20Fetch%20Contract.md)). The banner's Hub / Team Efficiency / Leaderboards switch is gone (`StatsBanner` shows its control strip only when given `sections`). `TeamEfficiencyPanel` and `LeaderboardCard` are untouched; bring them back by restoring `SECTIONS` in `src/pages/stats/StatsPage.js`. Retired with this: `0-data/stats_hub_cards_2025.json`, `scripts/build_stats_hub_cards.js`, `components/organisms/stats/StatsHubCards.js` (no longer imported).
