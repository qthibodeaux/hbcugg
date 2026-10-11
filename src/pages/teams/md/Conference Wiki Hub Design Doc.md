# Conference Wiki Hub Design Doc

**Route:** `/schools/wiki` (live page) — the original `/lab/conference-wiki` component it was promoted from still exists as a lab route.
**Primary component:** `src/pages/teams/SchoolsWikiPage.js` — pulls its banner (`ConferenceWikiBanner`) from `src/components/organisms/test/ConferenceWikiPageLabA.js`, the lab file it was promoted from; everything else below the banner is its own component.
**Last updated:** 2026-08-26
**Source note:** Celebration Bowl source tables were provided in chat on 2026-05-06. Some historical teams, such as North Carolina A&T, are not part of the current 18-team app dataset but must remain visible in historical Celebration Bowl records.

---

## 0. Current Implementation — Live Sections

Confirmed working on desktop and mobile — 2026-08-26. Desktop is a `PageShell` grid; mobile is a separate stacked render tree (same architecture as every other converted page). Only the banner (`ConferenceWikiBanner`) has a dedicated mobile layout — everything below it on mobile is the same desktop components, stacked full-width rather than redesigned.

| Slot | Component | Content |
|---|---|---|
| `cols=4` | `ConferenceWikiBanner` (compact variant) | Hero banner |
| `cols=4` | `WikiDirectory` | Team-by-team wiki entry directory (links to per-team wiki pages) |
| `cols=2` + `cols=2` | `ConferenceIdentityPassportCard` × 2 (SWAC, MEAC) | Side-by-side conference identity comparison |
| `cols=4, rows=2` | `ConferenceFootprint` | Shared conference footprint |
| `cols=4` | `CelebrationBowlLedger` | Championship ledger |
| `cols=4` | `MeacSwacChallengeBanner` | MEAC/SWAC Challenge showcase |
| `cols=4` | `ClassicsAndRivalriesBanner` | Classics & rivalries rotation |
| `cols=4` | `TitlePathTimelineBanner` | History timeline |

Data source: `src/data/wiki_data.js` (`SWAC`, `MEAC` exports) — a local data module, not a `public/data/` fetch. This page has no server round-trip; everything on it ships in the bundle.

Everything below this section is the original concept/content doc — some of it (the section list above) matches what shipped; the Celebration Bowl content, data model draft, and future-hub concepts are still forward-looking and haven't been built yet (see their own subsections below for status).

---

## Page Intent

The Conference Wiki is the shared SWAC + MEAC encyclopedia. It should explain the systems, cultural gravity, rivalries, postseason path, and shared HBCU football stage without becoming a flat reference table.

The page should feel like an editorial archive: structured enough to trust, visual enough to remember, and clear about how two conference systems meet in Atlanta.

---

## Current Conference Comparison Direction

The comparison section should use a `3x1 + 1x1` rhythm:

| Slot | Component | Purpose |
|------|-----------|---------|
| `cols=3, rows=1` | Same Fields, Different Systems | Compact system matrix with image atmosphere and direct SWAC/MEAC comparison |
| `cols=1, rows=1` | Editorial quote card | Short thesis line that makes the section memorable |

Design rules:
- Remove generic labels when the headline already carries the meaning.
- Use explicit `standard` and `compact` variants for fixed PageShell slots.
- Keep comparison rows focused on the core system story.
- Move deep postseason history into a dedicated Celebration Bowl section.

---

## Classics And Rivalries Data Requirement

The Classics & Rivalries banner should be powered by a complete, page-ready dataset, not a short hand-entered list. The current component is designed to show 8 visible tiles and rotate additional entries in over time, so the source data should contain more than 8 valid rivalries/classics.

Data rules:
- Every current program should have its important classics and rivalries represented.
- Every entry must use authoritative `src/data/teams.json` team IDs for current app teams.
- Historical or inactive teams are allowed only when the entry is intentionally historical; those entries need a clear display fallback instead of being silently filtered out.
- Do not use legacy aliases like `grambling-state`, `prairie-view`, `alcorn-state`, `north-carolina-central`, or `arkansas-pine-bluff` unless the resolver explicitly maps them.
- The frontend should not be responsible for guessing team IDs from display names.

Recommended shape:

```json
{
  "id": "bayou-classic",
  "name": "Bayou Classic",
  "type": "classic",
  "teamIds": ["grambling", "southern"],
  "primaryTeamId": "grambling",
  "secondaryTeamId": "southern",
  "conferenceScope": "SWAC",
  "stateScope": ["LA"],
  "city": "New Orleans",
  "venue": "Caesars Superdome",
  "status": "active",
  "series": { "wins": { "grambling": 0, "southern": 0 }, "ties": 0 },
  "trophy": null,
  "firstPlayed": null,
  "usualWindow": "Thanksgiving weekend",
  "shortDescription": "New Orleans spectacle and one of HBCU football's defining stages.",
  "tags": ["classic", "rivalry", "neutral-site"]
}
```

Minimum frontend fields:
- `id`
- `name`
- `type`: `classic`, `rivalry`, `showcase`, or `historic`
- `teamIds[]`
- `status`: `active`, `inactive`, or `historic`
- `shortDescription`
- optional `city`, `venue`, `usualWindow`, `trophy`, `series`, `tags`

Coverage goal:
- Build the complete classics and rivalries inventory, not a sampled set.
- Every current school should have all known football rivalries represented.
- Every current school should have all known football classics represented.
- Major annual classics should be included even when one team has changed conferences.
- Historical classics and rivalries should remain available with historical team context, even when one participant is outside the current 18-team app dataset.

Immediate UI requirement:
- The current banner only needs to render 8 visible tiles at a time.
- The source data must contain more valid entries than visible slots so the 8-tile banner can rotate entries in and out.
- Rotation should use only validated entries; invalid team references should be caught by data validation instead of creating empty visual slots.

Validation requirement:
- Add a data validation check that every `teamIds[]` value either exists in `teams.json` or is marked as a historical external team with a display name, logo fallback, and historical conference context.
- The UI should log or surface missing references during development instead of silently reducing the visible tile count.

---

## Data Fetching Architecture

The Conference Wiki uses a multi-tier data strategy:

1. **`useTeams()`**: Fetches all 18 program identities including the `wiki` objects.
2. **`useAllPlayers()`**: (Optional) For identifying current star players that fit the "Culture Catalyst" models.
3. **`public/data/assets/ALL_2025_entities_frontend_ready.json`**: For historical entities (like NC A&T) that aren't in the active 18-team roster but are needed for Celebration Bowl history.
4. **`useFootballCurrentContext()`**: To determine the current season/week for "Upcoming Classics" highlights.

## Celebration Bowl Section Intent

The Celebration Bowl section should become the most innovative part of the Conference Wiki.

Core thesis:

> Two roads to Atlanta. One HBCU football stage.

The section should not be just a results table. It should combine:
- timeline of every game
- MEAC/SWAC series state after each result
- MVP gallery
- appearance leaderboard
- game records and individual records
- venue and attendance story
- "why it mattered" editorial notes

Future standalone hub:
- TODO route candidate: `/game-center/celebration-bowl`
- Conference Wiki should preview the hub, not contain every possible detail forever.

---

## Celebration Bowl Overview Copy

The Celebration Bowl is a postseason college football bowl game first played after the 2015 season. It is contested between the champions of the MEAC and SWAC, the two prominent HBCU conferences in NCAA Division I football. The game serves as the de facto national championship stage for black college football.

The game is held annually in Atlanta on the third weekend of December and has been played at the Georgia Dome and Mercedes-Benz Stadium. It is currently the only active bowl game featuring Football Championship Subdivision teams.

History notes:
- It succeeded earlier MEAC vs SWAC postseason bowls, including the Pelican Bowl and Heritage Bowl.
- ESPN Events organizes the game and also runs the MEAC/SWAC Challenge.
- Cricket Wireless became title sponsor in 2020.
- The 2020 game was canceled after MEAC fall athletics were canceled and the SWAC postponed football to spring 2021.
- The SWAC briefly announced it would end its championship game after 2017, then reversed course in 2018. The SWAC champion now advances through the SWAC Championship Game.

---

## Celebration Bowl Results

| Date | MEAC Team | MEAC Score | SWAC Team | SWAC Score | Venue | Attendance | Series After Game |
|------|-----------|------------|-----------|------------|-------|------------|-------------------|
| December 19, 2015 | North Carolina A&T Aggies | 41 | Alcorn State Braves | 34 | Georgia Dome | 35,528 | MEAC, 1-0 |
| December 17, 2016 | North Carolina Central Eagles | 9 | Grambling State Tigers | 10 | Georgia Dome | 31,096 | Tied, 1-1 |
| December 16, 2017 | North Carolina A&T Aggies | 21 | Grambling State Tigers | 14 | Mercedes-Benz Stadium | 25,873 | MEAC, 2-1 |
| December 15, 2018 | North Carolina A&T Aggies | 24 | Alcorn State Braves | 22 | Mercedes-Benz Stadium | 31,672 | MEAC, 3-1 |
| December 21, 2019 | North Carolina A&T Aggies | 64 | Alcorn State Braves | 44 | Mercedes-Benz Stadium | 32,968 | MEAC, 4-1 |
| 2020 | Canceled due to COVID-19 pandemic | - | - | - | - | - | MEAC, 4-1 |
| December 18, 2021 | South Carolina State Bulldogs | 31 | Jackson State Tigers | 10 | Mercedes-Benz Stadium | 48,653 | MEAC, 5-1 |
| December 17, 2022 | North Carolina Central Eagles | 41 | Jackson State Tigers | 34 (OT) | Mercedes-Benz Stadium | 49,670 | MEAC, 6-1 |
| December 16, 2023 | Howard Bison | 26 | Florida A&M Rattlers | 30 | Mercedes-Benz Stadium | 41,108 | MEAC, 6-2 |
| December 14, 2024 | South Carolina State Bulldogs | 7 | Jackson State Tigers | 28 | Mercedes-Benz Stadium | 36,823 | MEAC, 6-3 |
| December 13, 2025 | South Carolina State Bulldogs | 40 | Prairie View A&M Panthers | 38 (4OT) | Mercedes-Benz Stadium | 26,703 | MEAC, 7-3 |

Current summary:
- Games played: 10
- Canceled seasons: 1
- Total appearances: 20
- Series through 2025: MEAC leads 7-3
- Highest attendance: 49,670 in 2022
- Highest combined score: 108 in 2019

---

## Most Appearances

Updated through the December 2025 playing.

| Rank | Appearances | Team | Wins | Losses | Win Pct. | Years |
|------|-------------|------|------|--------|----------|-------|
| 1 | 4 | North Carolina A&T | 4 | 0 | 1.000 | 2015, 2017, 2018, 2019 |
| 2 | 3 | South Carolina State | 2 | 1 | .667 | 2021, 2024, 2025 |
| 3 | 3 | Jackson State | 1 | 2 | .333 | 2021, 2022, 2024 |
| 3 | 3 | Alcorn State | 0 | 3 | .000 | 2015, 2018, 2019 |
| 3 | 2 | Grambling State | 1 | 1 | .500 | 2016, 2017 |
| 3 | 2 | North Carolina Central | 1 | 1 | .500 | 2016, 2022 |
| 4 | 1 | Florida A&M | 1 | 0 | 1.000 | 2023 |
| 4 | 1 | Howard | 0 | 1 | .000 | 2023 |
| 4 | 1 | Prairie View A&M | 0 | 1 | .000 | 2025 |

---

## Offensive And Defensive MVPs

| Year | Offensive MVP | Pos. | Team | Defensive MVP | Pos. | Team |
|------|---------------|------|------|---------------|------|------|
| 2015 | Tarik Cohen | RB | North Carolina A&T | Denzel Jones | LB | North Carolina A&T |
| 2016 | Martez Carter | RB | Grambling State | Jameel Jackson | DB | Grambling State |
| 2017 | Marquell Cartwright | RB | North Carolina A&T | Franklin "Mac" McCain III | CB | North Carolina A&T |
| 2018 | Lamar Raynard | QB | North Carolina A&T | Richie Kittle | DB | North Carolina A&T |
| 2019 | Kylil Carter | QB | North Carolina A&T | Jacob Roberts | LB | North Carolina A&T |
| 2021 | Shaquan Davis | WR | South Carolina State | Cobie Durant | DB | South Carolina State |
| 2022 | Davius Richard | QB | North Carolina Central | Khalil Baker | DB | North Carolina Central |
| 2023 | Kelvin Dean | RB | Florida A&M | Isaiah Major | LB | Florida A&M |
| 2024 | Jacobian Morgan | QB | Jackson State | Jeremiah Williams | DL | Jackson State |
| 2025 | Ryan Subblefield | QB | South Carolina State | Brenyen Scott | DB | South Carolina State |

---

## Game Records

### Team Records

| Record | Mark | Year |
|--------|------|------|
| Most points scored by one team | 64, North Carolina A&T vs. Alcorn State | 2019 |
| Most points scored by losing team | 44, Alcorn State vs. North Carolina A&T | 2019 |
| Most points scored by both teams | 108, North Carolina A&T vs. Alcorn State | 2019 |
| Fewest points allowed | 7, South Carolina State vs. Jackson State | 2024 |
| Largest margin of victory | 21, South Carolina State vs. Jackson State; Jackson State vs. South Carolina State | 2021, 2024 |
| Total yards | 574, North Carolina A&T vs. Alcorn State | 2019 |
| Rushing yards | 366, North Carolina A&T vs. Alcorn State | 2015 |
| Passing yards | 364, North Carolina A&T vs. Alcorn State | 2019 |
| First downs | 24, Alcorn State vs. North Carolina A&T; Jackson State vs. North Carolina Central | 2019, 2022 |
| Fewest yards allowed | 178, South Carolina State vs. Jackson State | 2024 |
| Fewest rushing yards allowed | 19, Jackson State vs. South Carolina State | 2021 |
| Fewest passing yards allowed | 106, Howard vs. Florida A&M | 2023 |

### Individual Records

| Record | Mark | Year |
|--------|------|------|
| All-purpose yards | 348, Tarik Cohen; Shedeur Sanders | 2015, 2022 |
| Touchdowns, all-purpose | 5, Shedeur Sanders, Jackson State | 2022 |
| Rushing yards | 295, Tarik Cohen, North Carolina A&T | 2015 |
| Rushing touchdowns | 3, Tarik Cohen, North Carolina A&T | 2015 |
| Passing yards | 364, Kylil Carter, North Carolina A&T | 2019 |
| Passing touchdowns | 6, Kylil Carter, North Carolina A&T | 2019 |
| Receiving yards | 150, Chris Blair, Alcorn State | 2019 |
| Receptions | 10, Elijah Bell, North Carolina A&T | 2017 |
| Receiving touchdowns | 3, Shaquan Davis, South Carolina State | 2021 |
| Tackles | 17, Aaron Smith, South Carolina State | 2024 |
| Sacks | 2, James Houston, Jackson State | 2021 |
| Interceptions | 1, shared by multiple players | Multiple |

### Long Plays

| Record | Mark | Year |
|--------|------|------|
| Touchdown run | 83 yards, Tarik Cohen, North Carolina A&T | 2015 |
| Touchdown pass | 85 yards, Shedeur Sanders to Kevin Coleman Jr., Jackson State | 2022 |
| Kickoff return | 79 yards, Malik Wilson, North Carolina A&T | 2018 |
| Punt return | 84 yards, Anthony Williams Jr., Alcorn State | 2015 |
| Interception return | 38 yards, Anthony Petty, Jackson State | 2024 |
| Fumble return | 3 yards, Taurence Wilson, Alcorn State | 2019 |
| Punt | 74 yards, Dyson Roberts, South Carolina State | 2021 |
| Field goal | 45 yards, Cody Jones, North Carolina A&T | 2015 |

---

## Data Model Draft

The Conference Wiki and future Celebration Bowl Hub should not store this as display strings only. Use structured rows that can power timelines, leaderboards, cards, and tables.

```json
{
  "year": 2025,
  "date": "2025-12-13",
  "venue": "Mercedes-Benz Stadium",
  "attendance": 26703,
  "series_after": { "leader": "MEAC", "meac_wins": 7, "swac_wins": 3 },
  "meac": { "team": "South Carolina State", "score": 40 },
  "swac": { "team": "Prairie View A&M", "score": 38, "note": "4OT" },
  "offensive_mvp": { "player": "Ryan Subblefield", "position": "QB", "team": "South Carolina State" },
  "defensive_mvp": { "player": "Brenyen Scott", "position": "DB", "team": "South Carolina State" }
}
```

Recommended payload fields:
- `results[]`
- `appearances[]`
- `mvp_by_year[]`
- `team_records[]`
- `individual_records[]`
- `long_play_records[]`
- `venue_summary`
- `attendance_summary`
- `series_summary`

---

## Innovative Celebration Bowl Concepts

Use these for the next lab conversation.

### 1. Atlanta Orbit
A radial or orbital visual where every year circles the Atlanta center point. MEAC wins pull one direction, SWAC wins pull the other. Hovering a year reveals score, MVPs, attendance, and series state.

**Decision from 2026-05-06 lab discussion:** Atlanta Orbit is approved as an innovative concept and should be preserved for the future standalone Celebration Bowl Hub. Do not treat it as the final Conference Wiki direction. The Conference Wiki Celebration Bowl section should pivot to a different, more immediately readable editorial treatment while Atlanta Orbit becomes a premium hub interaction.

### 2. Two Roads Bracket
Show the SWAC route and MEAC route as two rails feeding into one center field. SWAC rail can show championship-game pathway; MEAC rail can show regular-season champion pathway.

### 3. Trophy Ledger
An editorial results wall that stacks year plates like engraved trophy panels. Each panel uses winner color, scoreline, venue, attendance, MVP badges, and a one-line "why it mattered."

### 4. Records Vault
A compact 2x2 or 3x2 vault of record cards: highest score, highest attendance, biggest performance, longest play, defensive squeeze, overtime classic.

### 5. MVP Constellation
Offensive and defensive MVPs as player cards by year, grouped by team/conference dominance. If player images are unavailable, use school logo frames and position badges.

### 6. Series Pulse
A horizontal timeline where the MEAC/SWAC series score updates after each game. This should make the 6-1 MEAC run and SWAC response immediately visible.

---

## Conference Wiki Implementation Notes

Current direction note:
- Atlanta Orbit was tested in the Conference Wiki lab and should not be forgotten.
- Move Atlanta Orbit to the future Celebration Bowl Hub concept set.
- For the Conference Wiki preview, explore a different treatment that is compact, readable, and still creative.

First Celebration Bowl lab pass should include:
- `cols=4` section header: "The Postseason"
- `cols=3, rows=2` feature: Celebration Bowl timeline or trophy ledger
- `cols=1, rows=2` series/record capsule
- `cols=2, rows=2` MVP constellation
- `cols=2, rows=2` records vault

Keep the Conference Wiki preview compact. The future standalone Celebration Bowl Hub can own the full dataset and deeper interactions.
