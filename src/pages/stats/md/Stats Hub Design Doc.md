# Stats Hub — Design Document

**Route:** `/stats`
**Page:** `src/pages/stats/StatsPage.js`
**Status:** In progress. Team Efficiency built 2026-08-30; page structure still being decided.

---

## 1. Naming

The section is **Stats**, not Analytics. Renamed back 2026-08-30 in
`Header.js` — that was the only place the top nav said "Analytics"; the sidebar hub
was already labeled `STATS`. `TEAM ANALYTICS` and `PLAYER ANALYTICS` remain as page
names, since those are distinct pages rather than the section itself.

---

## 2. Removed 2026-08-30

**Transfers, Continuity, and Coaching Trees are cut.** Not deferred — cut.

`StatsPage.js` went 559 → 96 lines. Removed with them: `TEAM_BY_V5`,
`TEAM_BY_V5_FULL`, `TIER_COLORS`, `GRADE_COLORS`, `ARC_COLORS`, `ARC_LABELS`, the
`useLeagueContinuity` and `useCoachingTrees` hooks, and the `TransferBar` /
`ContinuityRow` / `CoachTreeRow` imports. Matching entries removed from
`STATS_ITEMS` in `useRouteSideNav.js`. Verified with a full `react-scripts build`.

**Left in place deliberately:**

- `useCoachingTrees` is still used by `CoachesPage.js`.
- `useLeagueContinuity` now has no callers, and `TransferBar` / `ContinuityRow` /
  `CoachTreeRow` are orphaned component files. Not deleted — that content may return
  somewhere in the new structure.

---

## 3. Visual Rules

### 3.1 Tables use the Data Room's language

Every table in this section renders through `components/molecules/stats/StatTable.js`,
which was lifted from `DataRoomTab` so the section looks like the rest of the site
rather than growing its own look. Three exports: `StatSection`, `StatTable`,
`StatKpiStrip`.

The contract, matching `DataRoomTab` exactly: `bg.secondary` card with a
`whiteAlpha.100` border, a `3.5px` brand accent bar beside an 11px/950 uppercase
title, a header strip on `whiteAlpha.50` at 9px/950, hairline `whiteAlpha.50` row
rules, uppercase 11px row labels, 12px/900 figures with `tabular-nums`, and
`#48BB78` on the better value.

Two things the leaderboard needed that the Data Room's fixed `1fr 100px 100px` grid
didn't: arbitrary column counts (driven by a `columns` array) and click-to-sort
headers. Tables scroll inside their own `overflow-x` container so a wide metric set
never pushes the page sideways.

### 3.2 No in-page tabs

These are **separate pages, not tabs**. Sidebar pages plus an in-page tab strip is
two levels of the same navigation, and that stacking is what made the section read
like a Streamlit app.

What each page gets instead is **inline controls that change the data, not the page** —
a season picker, an Offense/Defense toggle, a position filter, a sort. Those live in
the section card's header row, where `TeamEfficiencyPanel` already puts them.

The one arguable exception is Player Leaders, where Rushing / Passing / Receiving /
Defense genuinely have different columns. Even there it should be a category selector
in the card header, so the table swaps and the page doesn't.

### 3.3 No page-header block

The icon + "2025 SEASON" kicker + 3xl black title + grey subtitle pattern is rejected —
it reads as a Streamlit app. It currently appears on **four** pages: `StatsPage.js`,
`TeamAnalyticsPage.js`, `StatLabPage.js` (~line 109), and `GloryPage.js` (~line 86).
Removing it is a section-wide pass. Note the subtitle was also lying: "44 games · 903
players tracked" is hardcoded text, counted from nothing.

### 3.4 Restraint

No watermarks, gradients, or accent rails beyond the section card's title bar. The
only color carrying meaning is green/orange on values above or below league average,
inherited from the Data Room rather than added.

---

## 4. Page Inventory (proposed)

| Page | What's on it | Data status |
|---|---|---|
| **Stats** (hub) | League snapshot — league averages, top-5 offense / defense / producers, entry points | Ready |
| **Team Efficiency** | 10 rate metrics, offense/defense, 18 teams, 6 seasons, vs league | **Built 2026-08-30** |
| **Team Leaders** | Season counting totals per team | Blocked — 13/18 teams in 2025 |
| **Player Leaders** | Counting per player, sortable, position + team filters | Partial — rushing/passing only |
| **Player Production** | PAR / production ranking, linked to player pages | Partial — 2025 only |
| **Chart Builder** | Any metric vs any metric, 18 logos, league crosshair | Ready |

`Glory` and `Stat Lab` already exist as real pages (~8.5 KB each) and are untouched.

### 4.1 Open decisions

1. **Does Team Efficiency take over `/team-analytics`** (absorbing that placeholder),
   or live at its own route with the placeholder deleted?
2. **Is `/stats` a hub landing page** (league snapshot, like Game Center's hub) **or a
   redirect** to the first real page?
3. **Do Glory and Stat Lab stay in this section's sidebar**, or move out?

Also unresolved: the existing Leaderboards tab (`LeaderboardCard` grid off
`usePlayerAnalytics`) overlaps heavily with what Player Leaders would be. Probably one
page, not two — needs a look at what that hook actually returns before either is cut.

---

## 5. Built — Team Efficiency

`components/organisms/stats/TeamEfficiencyPanel.js`, at `/stats?tab=team-efficiency`
pending the page split.

All 18 teams × 10 rate metrics. Season picker (2025 / 2024 / 2023 / 2022 / 2021 /
2019 — **2020 is not in the export and the picker must skip it**), Offense/Defense
toggle, sortable on any column, league average as a KPI strip above the table.

Added `useAllTeamSeasonAvg` / `useAllTeamDefenseAvg` to `useSWACData.js` — the existing
`useTeamSeasonAvg` / `useTeamDefenseAvg` return a single team's slice, and a
leaderboard needs the whole map.

### 5.1 Metric polarity — needs confirmation

Green/orange is computed against `league_avg`, and the polarity **flips with the
Offense/Defense toggle**: a high `stuffRate` is bad for an offense and good for a
defense — same key, opposite meaning.

This assumes `team_season_avg` describes the team's own offensive performance (so
`stuffRate` = how often *this offense got stuffed*). The file naming supports that,
since `team_defense_avg` exists separately, but **it is inferred, not documented. If
it's backwards, every color on the page is backwards.** Confirm with backend.

---

## 6. Data Inventory (verified 2026-08-30)

### 6.1 Efficiency — ready

`public/data/0-data/team_season_avg_{season}.json` · `team_defense_avg_{season}.json` ·
`league_avg_{season}.json`

18 teams, clean ids (`swacalc`), seasons 2019 + 2021–2025. Ten metrics:

```
rushing: stopRate · stuffRate · tflRate · powerStopRate · successRate · opportunityRate
passing: pressureRate · explosiveRate · completionRate · ypa
```

`league_avg` carries the same ten league-wide — this is what turns a raw value into a
margin and makes the heat map mean anything.

### 6.2 Counting — thinner than expected

`public/data/6-stat lab/counting/season_stats.json` — 7,606 rows = **104 TEAM rows +
7,502 player rows**, 48 counting fields.

- **Only `rushing_*` and `passing_*` columns exist.** The `categories` field says 4,505
  rows are `['defense']` and 740 are `['receiving']` — categories whose stats were
  never exported.
- **Team rows are incomplete:** 2019:22, 2021:18, 2022:18, 2023:17, 2024:16, **2025:13**.
- **Positions are degraded:** DEF 4,981 · WR 1,228 · RB 810 · RET 293 · QB 190. Every
  defensive position collapsed into one bucket; no TE, OL, DB, or LB.
- **2019 team ids are dirty** — 4 of 23 look like `"HOW(3) (1-9 , 1-5)"`. 2021–2025 are
  clean 18/18. Stat-lab-sourced views should start at 2021.

### 6.3 Player production — 2025 only

`public/data/0-data/player_stats_2025_enriched.json` — 1,054 players, **957 carry
`person_id`** (match rate 0.912), with `total_production`, `avg_production`, `par`,
`season_components`, and a per-game `games[]` breakdown. The `person_id` link means
every leaderboard row can deep-link to the player page we already built.

### 6.4 The headline absence

**There is no team-season EPA anywhere.** EPA exists per-play in the game master
(`play_advanced.epa`) but nothing rolls it up. This is the spine of every comparable
site's stats section and the one metric we cannot reproduce today.

---

## 7. Backend Requirements

| # | What's needed | Why | Urgency |
|---|--------------|-----|---------|
| 1 | **Team-season EPA rollup** — EPA/play offense, defense, net; plus overall success rate and explosive rate | The single highest-value item for this whole section. Per-play EPA already exists in the game master; nothing aggregates it to a team-season. Unblocks the headline column on Team Efficiency, both EPA axes on Chart Builder, and the "Situational / Overall" concept the Team Analytics placeholder has been waiting on. | **High — launch.0** |
| 2 | **Receiving + defensive season counting stats** | `categories` claims 4,505 defense and 740 receiving rows, but only `rushing_*` / `passing_*` columns ship. Makes a receiving or tackles leaderboard impossible. The per-game files already carry both in `individual_stats` — this is a rollup that was never exported. | **High** |
| 3 | **Complete team counting rows** — 18/18 every season | Currently 13/18 in 2025, 16/18 in 2024, 17/18 in 2023. Team Leaders cannot ship on a partial league. | **High** |
| 4 | **Real position groups** (QB/RB/WR/TE/OL/DL/LB/DB/ST) | `DEF` collapses 4,981 of 7,502 rows. Any position filter or per-position leaderboard is impossible until the real groups ship. Same request as Team Roster Hub #2. | **High** |
| 5 | **Player production/PAR for 2021–2024** | Team efficiency spans six seasons; player production is 2025-only, so the season picker can't be shared across pages. | Medium |
| 6 | **Clean team ids in 2019 stat-lab rows** | 4 of 23 are raw scraped labels (`"HOW(3) (1-9 , 1-5)"`), so 2019 can't join to logos, colors, or team pages. | Medium |
| 7 | **Confirm metric polarity** on `team_season_avg` vs `team_defense_avg` | Not a build request — a documentation one. See §5.1. If the offense file's `stuffRate` means something other than "this offense got stuffed", the coloring is inverted. | Medium |
| 8 | **Opponent adjustment** (later) | Comparable sites adjust for opponent quality, home field, and garbage time. The master play schema already carries `garbage_time` and `competitive_time`, so garbage-time filtering is reachable; opponent adjustment is a modeling task, not a display one. | Low — post-launch |

---

## 8. Hub Concept — Resolving §4.1 Open Question #2 (2026-09-02)

**Decision: `/stats` is a landing hub, not a redirect.** It is not itself a deep
tool — it's built from components that each act as a CTA into one individual
structure (Team Efficiency, Chart Builder, Team Leaders, Player Analytics,
Player Leaders/Production, Glory, Stat Lab). This also widens scope past §2's
person/unit split: that split still governs which *deep page* a stat lives on,
but `/stats` sits above both sides as one shared front door — consistent with
`Header.js`'s nav already grouping `/stats`, `/stat-lab`, `/glory`,
`/team-analytics`, and `/player-analytics` under one "Stats" tab.

**The job of the hub, in the terms it was given:** someone arrives at a site
like GameOnPaper *already* fluent in advanced stats, looking for more. Our hub
can't assume that fluency — it has to create it. A CTA should surface something
like "[Team] leads the league in [metric] this week," built to make someone
think *what else are they leading in, what does this actually mean, how does
this relate to winning* — and then the CTA is the door into the real tool that
answers that.

**Basis for now, not forever:** the six GameOnPaper page-types already
catalogued in this conversation (Leaderboards, Charts/Trends, Chart Builder,
Seasons, Team profile, Matchup Builder) are being used as a *temporary*
organizing basis for what categories of CTA to build, specifically because our
own team-stat taxonomy is thinner than theirs today (see §6's gaps). Once the
backend can expound on our taxonomy beyond GOP's set, the category list here
should be revisited against that, not treated as final.

**The hook mechanism already exists elsewhere in this codebase** — the People
Hub's card feed (`people_hub_cards_2025.json` / `scripts/build_people_hub_cards.js`)
already does real weighted-storyline selection (coverage balance, person dedup,
"who's actually notable this week" instead of a flat leaderboard row). The
same instinct — surface a real standout, not just the #1 row of a table —
is what a curiosity-hooking CTA on this hub needs, aimed at team/player
stat leaders instead of editorial cards.

---

## 9. Hub Concept — The Design (2026-09-02)

### 9.1 Two reframes that drive everything

**Rankings are answers; relationships are questions.** A leaderboard names who
is first and the conversation ends — which is why GOP serves people who already
know what they want and does nothing for anyone else. Build the hub out of
*relationships* instead of *rankings* and every component ends in "wait, why?"
That reaction is the entire point of the page.

**18 teams is a structural advantage, not a limitation.** GOP has ~130 FBS
teams and is therefore *forced* to rank and truncate — top 25, scroll for more.
We never truncate. The whole league fits one view, always. Every pairwise
relationship (18×18 = 324) is trivially computable. Full-league network
structures are readable instead of hairballs. **Do not imitate tools built
around a constraint we don't have.**

### 9.2 Components

| # | Component | What it does | Why it's ours |
|---|---|---|---|
| 1 | **The Win Levers** | Which metrics actually predict winning *in this league*, ranked by correlation strength, likely split by conference. "In SWAC play, stuff rate predicts wins 2.3× better than passing yards." | Original analysis nobody publishes for HBCU football. Teaches what matters, and gives every other number on the site a known weight. Literal answer to "how does this relate to winning the game." |
| 2 | **Metric of the Week** | One metric spotlighted, explained in plain language, league spread shown, current leader named. Rotates weekly. | The fluency engine — how a casual visitor becomes someone who knows what stuff rate means. Also means the hub is never the same page twice. |
| 3 | **The League Map** | All 18 teams plotted at once in identity space, swappable axes, quadrants *editorially labeled* ("Grind It Out", "Air It Out", "Bend Don't Break", "Chaos"). | Discovery-first presentation of what would otherwise be Chart Builder. Surfaces "these two teams play identically" — a relationship no ranked list can show. Only readable because the league is small. |
| 4 | **Doesn't Add Up** | Anomaly feed: records that don't match efficiency (regression / breakout candidates), **statistical twins** (near-identical profiles, far apart in standings), teams transformed since Week 1. | Reuses the People Hub's weighted-selection machinery (coverage balance, dedup) pointed at teams. Every card is a story with a number behind it. |
| 5 | **The Thread** | Transitive chains — you beat X, who beat Y, who beat you. | The circle-of-parity argument fans already have, made computable. Only possible at 18 teams. |
| 6 | **The Pulse** | Week-over-week movement; who's rising and falling. | A season is a story, not a snapshot. Nobody in this space renders it as one. |
| 7 | **Big-Game Splits** | Performance in Classics, homecomings, rivalry games. | **The differentiator nobody else can build** — FBS analytics sites have no cultural-context axis because FBS has no Classics. `event: { kind, name }` already exists on schedule payloads. |

**Counting stats** are the evidence layer, not the lead: they back every
relationship on drill-in and they own the Leaders pages. "What happened" is the
floor under "what it means."

### 9.3 What we tell the backend to build

We specify; we don't wait. Beyond GOP's metric set:

1. **Win-correlation coefficients per metric**, league-wide and per conference — powers The Win Levers
2. **Team style-cluster assignments** — powers League Map quadrants and grouping
3. **Week-over-week metric snapshots** — powers The Pulse; today only season totals exist
4. **Expected wins vs actual wins** (efficiency- or Pythagorean-derived) — powers Doesn't Add Up
5. **Pairwise team similarity scores** (nearest neighbour in metric space) — powers Statistical Twins
6. **Opponent-adjusted rates** — GOP has this; we need it
7. **Team-season situational splits** (money down, garbage time excluded) — play-level tags already exist, see `inspo/inventory/PLAYER_STATS_ADVANCED_INVENTORY_2026-08-21.md` §2
8. **Event-context flags on team stats** (classic / homecoming / rivalry) — powers Big-Game Splits

Plus the already-filed §7 requests, of which **team-season EPA (§7.1) remains
the single highest-value item** — but note that *none of the seven components
above are blocked on it*. Every one can ship on rate stats, PAR, and game
results we already have, and get sharper when EPA lands.

### 9.4 Built — the demo (2026-09-02)

Live at `/stats` as the default view. Team Efficiency and Leaderboards remain
reachable and untouched.

| Piece | Where |
|---|---|
| Feed generator | `scripts/build_stats_hub_cards.js` |
| Feed output | `public/data/0-data/stats_hub_cards_2025.json` (+ `reqs/mock/` copy) |
| Card + viz components | `src/components/organisms/stats/StatsHubCards.js` |
| Hook | `useStatsHubCards` in `useSWACData.js` |
| Page | `src/pages/stats/StatsPage.js` |
| Full design space | [`reqs/STATS_HUB_CARD_INVENTORY.md`](../../../../reqs/STATS_HUB_CARD_INVENTORY.md) — ~70 cards, entity/metric vocabulary, 22 viz types, the backend ask |

**11 cards, 10 visualization types, every number real.** Architecture matches
the People Hub deck: the feed carries `layout` + `viz.kind`, components switch
on those and never on `archetype`, so new archetypes need no new components.
Slot sizes are assigned per viz kind (`slotFor()`), not per card.

**The headline finding, computed from 108 real team-seasons across 2019 and
2021–2025:** defensive rush success rate allowed (r = **−0.543**) predicts
winning better than any other metric we hold — narrowly ahead of the offensive
side. And offensive TFL rate is r = **−0.007**, which is to say *nothing*. That
second number is its own card: a widely-quoted stat with no predictive value in
this league is exactly the kind of "wait, why?" the hub exists to produce.

**Page-header block removed** while wiring this, per §3.3 — including the
hardcoded "44 games · 903 players tracked" subtitle, which was counted from
nothing.

### 9.5 Still open

- Component order and which lead the page
- Whether Team Leaders appears while blocked at 13/18 teams (§7.3), or waits
- Whether The League Map replaces Chart Builder as a destination or fronts it

---

*Last updated: 2026-09-02*
