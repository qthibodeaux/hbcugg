# Team Analytics Hub — Design Doc

**Route:** `/team-analytics`
**Status:** Eight tabs built (§8), all on the backend's weekly files since 2026-10-04 (§9, §10).
**Sibling doc:** `Player Analytics Hub Design Doc.md` — read both together, they share one organizing principle.

---

## 1. Why This Exists

A season-long, team-scoped analytics view — separate from the existing `/stats` page (leaderboards/transfers/continuity/coaching trees, which stays as-is) and separate from the Game Page's per-game Team Stats card. This hub answers "how good is this team, unit by unit, across the season" — not "who are the best individual players" (that's Player Analytics) and not "what happened in this one game" (that's the Game Page).

Loosely inspired by the *shape* of tools like PlayerPrint (streamlit.app) — a scoped, tabbed analytics browser — but not visually copied. Uses this site's existing dark theme, `bg.secondary` card language, and `brand.500` accent, matching `StatsPage.js`'s established pattern.

---

## 2. The Organizing Principle (shared with Player Analytics)

**Does this stat describe one identifiable person, or a unit/scheme's collective outcome?**

- Person-attributable stats (a QB's completions, a linebacker's tackles) → **Player Analytics Hub**, not here.
- Unit/scheme-attributable outcomes (how well did this team's offensive line block, how well did this defense stop the run) → **Team Analytics Hub**.

This split exists because football has real positions (like OL) with no meaningful individual counting stats in this dataset, and defensive scheme grading (run defense, pass defense as a whole) is inherently a team outcome even though individual tackles/sacks are person-level. Team Analytics owns the "can't be pinned on one player" side of that line.

---

## 3. Team Concepts (the tabbed/expandable categories)

Mirrors the two-layer "DNA tile → click → full breakdown" model from Player Analytics, but every concept here is unit-scoped:

| Concept | What it answers | Candidate source fields |
|---|---|---|
| **Run Blocking / O-Line** | How well did this team's line create rushing lanes? | `advanced_team.line_yards_total`, `line_yards_per_rush`, `highlight_yards_per_rush`, `stuff_rate` (allowed), `opportunity_rate` |
| **Pass Protection** | How well did this team protect the QB? | `team_box.sacks_allowed`, `pressure_rate_faced`, `pressure_completion_pct` |
| **Run Defense** | How well did this defense stop the run? | `defensive_identity.yards_per_play_allowed` (rush split), `stuff_rate_forced`, `explosive_prevention_rate` |
| **Pass Defense** | How well did this defense defend the pass? | `advanced_team.pass_defended_rate_forced`, `sack_rate_forced`, `havoc_rate_forced`, `pressure_profile.*` |
| **Special Teams** | Field position value across kicks/punts/returns as a unit | `special_teams_advanced.summary.*`, `fg_offense`, `punt_offense`, `kickoff_offense` (see §5 for the individual-specialist wrinkle) |
| **Situational/Overall** | EPA/play, success rate, explosive rate, red zone — the general team-efficiency tiles already built for the Game Page's Team Stats card, aggregated to season | `advanced_team.*` season rollup |

Every one of these already has a per-game equivalent cataloged in `src/components/game/page/teamstats/DATA_ROOM_SPEC.md` — Team Analytics is that same field vocabulary, aggregated across a season instead of one game.

---

## 4. Data Gap — Season Rollup Required

> **Partially resolved — 2026-08-30.** The claim below that no season rollup exists is
> **out of date**. `public/data/0-data/team_season_avg_{season}.json`,
> `team_defense_avg_{season}.json` and `league_avg_{season}.json` provide **10 rate
> metrics × offense/defense × 18 teams × 6 seasons (2019, 2021–2025), with a league
> baseline** — clean team ids, fully populated:
>
> ```
> rushing: stopRate · stuffRate · tflRate · powerStopRate · successRate · opportunityRate
> passing: pressureRate · explosiveRate · completionRate · ypa
> ```
>
> Mapped against this doc's §3 concepts: **Run Blocking** has stuff + opportunity rate
> (line yards still missing), **Pass Protection** has pressure rate faced (sacks allowed
> missing), **Run Defense** has stuff rate forced, **Situational/Overall** has success and
> explosive rate (**EPA/play still missing — the one big absence**). **Pass Defense**
> (havoc, sack rate forced) and **Special Teams** have nothing yet.
>
> A working table over this data shipped 2026-08-30 as `TeamEfficiencyPanel` — see
> [Stats Hub Design Doc.md](../../stats/md/Stats%20Hub%20Design%20Doc.md) §5. **This page
> should stop being a placeholder and become that table**, rather than waiting on a
> dataset that half-exists. The remaining gap is narrower than stated below: team-season
> **EPA**, havoc/sack rate forced, line yards, sacks allowed, and special teams.
>
> Original text follows.


None of the above works from a single game file. Every Team Concept needs a **season-aggregate dataset per team**, not per-game. This is the same infrastructure gap flagged for the Game Page's Team Stats card (season-avg/league-max) and for Player Analytics' percentile bars — they're all the same underlying need: **a season-wide rollup, computed once, not derived client-side from individual game files.**

Until that exists: this page ships as a placeholder. No mock data has been built for it yet (unlike Player Analytics, which mocks percentile bars to unblock visual design) — there's less value in mocking a page with no scaffolded UI yet. Revisit once the season-rollup dataset is scoped.

---

## 5. Special Teams — The One Concept That Straddles Both Hubs

Kickers and punters have real individual stats (FG%, punt average) nested inside the special-teams data (`fg_offense`/`punt_offense`, described as having a "specialists list" per the Game Page Design Doc §5.12). So:

- **Team Analytics** → "Special Teams" concept = the unit-level outcome (field position value, coverage/return grading).
- **Player Analytics** → K/P get a thin individual page with their personal stat line, per that doc's own K/P scoping.

Same data, two different scopes, split by the person/unit rule from §2.

---

## 6. Open Questions

- Exact season-rollup field list/shape — not yet specced as a formal pipeline request (unlike the March chart's `field_position_timeline` or Team Stats' `season_avg`/`league_max`). Needs its own request doc once this hub moves past placeholder.
- Whether Team Analytics gets its own Scatter/Scout/Compare-style tabs (mirroring Player Analytics' planned tab set) or stays a single-page Concepts browser — undecided, lower priority than getting the data itself.

---

*Created: 2026-07-23 · Last updated: 2026-08-30*

---

## 7. Built — 2026-09-02

Placeholder replaced. Seven tabs, all on real data from
`public/data/0-data/team_analytics_hub.json` (built by
`scripts/build_team_analytics.js` — 18 teams x 6 seasons = 108 team-seasons,
plus win-correlation levers, percentiles, composite ratings, and a glossary).

### 7.1 The structural decision

**A player is one entity; a team is a bundle of units.** That is the difference
that shapes this page. Offense and defense are effectively two teams in the
same colors, and our data splits exactly that way. So:

- **Content structure = the unit taxonomy** (§3's concepts), living as sections
  inside Profile — Run Game, Pass Game, Run Defense, Pass Defense, plus the four
  units with no data, which render an explicit gap card stating *why* rather
  than being hidden or faked.
- **Tabs = analytical lenses** over that structure, not the concepts themselves.

This is why the page doesn't mirror GameOnPaper: their nav is tool-shaped
(Leaderboards / Charts / Seasons / Teams / Matchup) and flattens a team to two
aggregate numbers. Keeping units as content and lenses as navigation preserves
the thing that actually makes a football team legible.

### 7.2 The tabs

| Tab | Lens | Notes |
|---|---|---|
| **Profile** | Who is this team | Identity + unit radar + per-unit percentile rules; 4 live units, 4 gap cards |
| **Board** | Who's best at X | All 18, offense/defense toggle, sortable; colour is percentile, not raw value |
| **Map** | What goes with what | Free X/Y axis choice, league-average crosshair. **Every axis option is labelled with its correlation to winning**, so you can pick axes that matter |
| **Matchup** | What happens when these meet | Overlaid radars + opposed bars, each row labelled with that metric's r |
| **Rating Lab** | Build your own rating | See below |
| **Trends** | How this changed | Composite rating + rank by season |
| **Glossary** | What does this mean | Every metric with its real correlation to winning |

### 7.3 Rating Lab — the original piece

The team answer to the player hub's planned "Scout" tab, with a twist that is
ours: **the sliders start at each metric's real correlation with winning**, so
the default ranking *is* the "what actually wins" model. You then move the
weights and watch the league reorder. It teaches what each metric is worth by
letting you break it, and it's the natural destination for the Stats Hub's
Win Levers card.

### 7.4 Tabs-vs-pages — a deliberate exception

[Stats Hub Design Doc](../../stats/md/Stats%20Hub%20Design%20Doc.md) §3.2 bans
in-page tabs for `/stats`, on the grounds that sidebar pages plus a tab strip is
two levels of the same navigation. That reasoning doesn't apply to a
single-entity hub: here the tabs are the only level, and it keeps parity with
`/player-analytics`, which is already built this way. Recorded as an exception,
not a drift.

### 7.5 Polarity — §5.1 of the Stats doc now has evidence

The Stats Hub doc flagged that we had *inferred*, not confirmed, that
`team_season_avg` describes the team's own offense (so `stuffRate` = "this
offense got stuffed"). The generator now checks declared polarity against the
empirical win-correlation sign for all 20 metric-sides. **19 of 20 agree** —
`o_stuffRate` correlates negatively with winning, `d_stuffRate` positively,
exactly as the assumption predicts. That supports, without proving, the file
semantics. A backend confirmation is still wanted.

> **Retracted 2026-10-04 (§10).** The backend traced this to `team_season_avg`
> shipping the TFL columns swapped (offense carried the team's defensive TFL
> rate). Recounted, `o_rushing.tflRate` r = −0.26 and `d_rushing.tflRate`
> r = +0.22, and all 20 metric-sides agree with their polarity. The Glossary
> tab's "TFL finding" and "Polarity audit" cards are removed.

**The one exception is a finding, not a bug:** `d_rushing.tflRate` correlates
**-0.163** with winning — defenses that force more run TFLs win slightly *less*.
Paired with offensive TFL rate at **-0.007**, the read is that TFL rate — the
splash-play stat everyone quotes — has no positive relationship with winning in
this league on either side of the ball. That's surfaced in the Glossary tab
rather than smoothed over.

---

## 8. Rebuilt — 2026-09-25

The seven tabs of §7 became eight, and every one of them was rebuilt. The
structural idea did not change: units are the content, tabs are lenses. What
changed is that each lens now emulates the best existing tool for that
question, in our design language, rather than being a thinner version of it.

### 8.1 The tab strip is eight live tiles

The tab bar is a 4×1 slot of eight portrait tiles. Each tile is the tab button
**and** the verdict that tab exists to deliver — not a thumbnail of the tab's
chart, but the number you would have opened it for.

Rules the strip follows:

- **One template.** Big italic header word, huge number as the sell, small
  stat label, team logo oversize and offset behind, all centred in the tile's
  top section only. The tab footer is the whole bottom section, edge to edge.
- **No hover motion.** Tiles move on their own clock or not at all.
- **Windows live-tile transitions**, not crossfades: slide, push, flip, cube,
  peek, fade and zoom, one assigned per tile, implemented as a two-layer stage
  that animates the outgoing snapshot against the incoming one.
- **No two clocks alike.** Each tile draws a fresh interval in the 5–12s band
  every cycle, seeded off its own base, so the eight never sync with each
  other or with themselves. Rotation runs on an invisible looping CSS
  animation and `onAnimationIteration` — there are no effects and no timers.
- **Everything in `cqmin`.** No fixed pixel heights anywhere in the strip.

Three tiles break the single-readout pattern on purpose:

- **Matchup** splits into three bands — a team, the comparison, the other team
  — each with its own clock and its own transition. The middle band owns the
  *stat*; the number is derived live from whichever two teams are showing, so
  a team band flipping underneath can never leave a stale number behind.
- **Trends** draws a real line: four random teams paired with four random
  stats on every load, each showing that team's arc across all six seasons.
- **Glossary** teaches instead of reporting. Six terms — expected points
  added, success rate, havoc rate, OL line yards, highlight yards, stuffed run
  — the ideas a reader has to hold before any other tab means anything. Each
  runs as **two slides, the word then the arithmetic**, and each face owns the
  whole tile.

  That split is the point, and it is a legibility constraint, not a flourish.
  `cqmin` on this strip resolves against its short side — the strip's height —
  so the ~2.4cqmin the other tiles use for their caption line lands near 6px.
  That is fine for "with wins · offense", which is glanced at rather than read,
  and useless for content. A prose definition at that size was unreadable; so
  was a formula squeezed under a headline. Giving the formula its own slide
  buys it 5.6–6.4cqmin and it becomes text again. The footer names the term
  while the math is showing, so a glance landing mid-pair is not looking at an
  orphan fraction.

  The `math` field lives on the glossary entry beside the wording —
  `{ num, den }` renders as a fraction, `{ expr }` as one line — so the tab and
  every tooltip can use it too. Only one entry of 95 had a formula before this;
  the six on the tile now do.

### 8.2 The eight tabs

| Tab | Question | Emulates | Built as |
|---|---|---|---|
| **Week Review** | Did we really get beat that badly | — | Most recent week with games; winner logo, axis, a standard bar in the winner's primary, the edge number coloured by sign |
| **Team Profile** | Everything about this team | CFBD team profile + GOP leaders and radars | See §8.3 |
| **Leader Board** | Who is best at X | GOP Team Rankings | Three dropdowns (unit / teams / metric), every metric as a column, cells shaded by percentile, click-to-sort, sticky rank and team |
| **Scatter** | What goes with what | GOP Charts | Five preset charts plus always-live axis selectors, axis ticks and min/max, MEAC / SWAC / East / West scopes, shaded table below |
| **Matchup** | What happens when these meet | GOP Matchup Builder | See §8.4 |
| **Rating Lab** | Build your own rating | Nothing — ours | See §8.5 |
| **Trends** | How this changed | CFBD trends charts | Metric / side / timeline dropdowns, league and conference reference lines, up to five teams, recharts, data table under |
| **Glossary** | What does this mean | GOP Glossary | See §8.6 |

### 8.3 Team Profile — the stat-heavy one

Lands with **no team selected**; a directory in the team-schedule picker style
sits above and the profile appears below once you pick. The profile itself
runs top to bottom:

1. **Identity** — name in the banner treatment, ghost logo, record and streak,
   then five KPI tiles with rank chips.
2. **Two radars** — Offensive Profile and Defensive Profile, the one thing
   worth keeping from GOP's team page, on recharts so axis labels hold a real
   type size instead of scaling with the viewBox.
3. **Leaders** — passing, rushing, receiving, with faces. Real headshots.
4. **Team efficiency** and **Advanced efficiency** side by side — offense
   against defense, rank chips, percentile fills.
5. **Seven phase sections** — passing, rushing, defense & havoc, scoring &
   drives, situational, special teams, totals. Each runs the same two layers:
   two headline cards, then the full production block with every field we
   hold. The three spatial maps live inside the phase they belong to. Each of
   the passing map's nine cells names its **top three targets as faces**, with
   the target count on a scrim across the foot of each square — the map stops
   being a heat map and starts telling you who the ball went to there. On the
   allowed side the same three squares are who was in coverage.
6. **Units** — the taxonomy as percentile rules, four live, four gap cards.
7. **Player impact** — PAR, expandable to a per-game production bar chart.
8. **Results** and **Roster composition**.

Two decisions worth recording:

- **Phases are one spec, not two lists.** Each phase declares its fields once;
  the two columns are the same list read through different sides, with the
  right-hand side flipping polarity automatically. That is how ~200 cells get
  correct ranks without 200 hand-written polarity decisions.
- **Ranks are ordinals, not colour washes.** Every cell shows its league place
  (`3rd`, `14th`) toned green in the top third and amber in the bottom third.
  Colouring the value alone says good or bad but not how good, and across 200
  numbers a field of green and amber becomes noise.

Definitions live in a hover card with a **Hide definitions** toggle, sourced
from the same glossary the Glossary tab renders. Mock provenance moved into
the definition — a stand-in field says so when you ask what it means, rather
than wearing the word "Mock" under every number.

### 8.4 Matchup

Two grids of 6 columns × 3 rows of logo tiles, one per slot, each with a
**League Average · 18** bar that drops the 18-team mean into that slot.
Picking the other slot's team swaps them rather than refusing.

Above the tape: **unit matchups** — A's offense against B's defence and the
reverse — with a **Bars | Spider** toggle. Below it, the **tale of the tape**
in three columns, which is how a tale of the tape is actually read:

```
team A's stats   |   the head to head   |   team B's stats
```

The outside columns run net headlines with the two halves that make them
indented underneath, each carrying its league rank. The centre column is two
tables — A offence vs B defence, then A defence vs B offence — with the rank
chips on the outside, the values inside, the metric between, and the better
side's cell filled in that team's colour. Previous meetings sit below, real,
off the 416-game index.

### 8.5 Rating Lab — now with a scoreboard

The original piece of §7.3 had a flaw: you could move fifteen sliders and
nothing ever told you whether your model was any good. It now has four
scorecards across the top, run against every parsed game of the season:

```
YOUR MODEL     WHAT ACTUALLY WINS     HOME TEAM     MARGIN CORRELATION     EVERY SEASON
```

Your card lights up when it beats the seeded weights. The scoring is
**descriptive, not predictive** — season metrics include the games being
scored — and the page says so rather than letting the number imply more than
it means. The "every season" card runs the same weights over all 401 parsed
games, which is the closest honest thing to a holdout we can build: the
correlations were fitted over all 108 team-seasons, so no single season is
truly held out.

Six presets load a philosophy and let you break it, and they genuinely
disagree — bend-don't-break beats the correlation-seeded default by three
points in 2024, havoc takes 2023 by six, ground-and-pound is the worst model
in two seasons of three. Weights run **−100 to +100**, because "I think this
is actively bad" is a real position to hold in a league where forcing run TFLs
correlates negatively with winning. Each slider carries a tick where the
correlation would put it, so you can see how far you have argued from the
data. Clicking a team opens a waterfall of which levers earned or cost it
points, summing exactly to its score, plus how many places the model has it
above or below the actual standings. A model encodes to a 44-character URL.

### 8.6 Glossary

One glossary object, two consumers: this tab renders it, every tooltip on the
site reads it. 95 terms.

**Where GameOnPaper defines a term we also carry, their wording is used
verbatim and credited** — there is no reason to invent a second definition of
success rate. 41 terms are theirs.

One mapping needed care: **GOP's "Stop Rate" is a drive statistic** (drives
ending in a punt or turnover) while ours is a rushing statistic, so ours
carries their **"Stopped run"** definition and their drive-level version is
listed separately as something we do not compute. Adopting a definition
without checking what it is attached to is how two sites end up publishing the
same word for different numbers.

The tab opens with the argument rather than the alphabet: all 20 metric-sides
ranked by how hard they pull on winning, then the two findings — the TFL
result and the polarity audit — as display cards, then search, family filters
and the definitions themselves with live leaders and league averages attached.

**The ladder reads against a team.** A 3 × 6 grid of the league in the matchup
picker's tile language sits to its left; picking a team re-reads every row
against that team's season. The bar does not gain a second scale to do it —
its **length is still the pull**, and the solid part is **how much of that pull
the team earns**, its percentile on that metric-side. So a long bar mostly
filled is a strength that matters, and a long bar barely filled is the team's
actual problem, sorted to the top of the page by the league rather than by the
team. The hub orients percentiles so higher is better on both sides of the
ball, which is why one fill works for offense and defense without a polarity
branch. Value and rank join the row; the correlation dims to context.

### 8.7 What is real and what is not

Real: the ten rate metrics per side with percentiles, league averages and
win-correlations across six seasons; the composite rating and its rank;
records; the 416-game index; PAR and per-game player production; roster
composition; headshots.

Mocked, and specified in
[Team Analytics Fetch Contract](./Team%20Analytics%20Fetch%20Contract.md):
the whole EPA family, the advanced efficiency block, all three spatial maps,
per-game team series, scatter axes, player usage, and counting stats for every
season other than 2025.

Mocked sections say so — an amber chip in the section eyebrow, and the mock
state read from the file rather than hard-coded, so it disappears on its own
when a real payload lands.

> **Superseded 2026-10-04 — see §9.** The "real" list above was real for
> 2019–2025 only, and built by our own scripts, not the backend.

---

## 9. Backend handoff — 2026-10-04

### 9.1 Where it stood

Every file this hub reads was built on our side, offline:

| File | Built by | Covers |
|---|---|---|
| `0-data/team_analytics_hub.json` | `scripts/build_team_analytics.js` | 2019, 2021–2025 — **no 2026** |
| `0-data/week_review_2026.json` | `scripts/build_week_review.js` | frozen at Week 0 (3 of 14 games charted) |
| `0-data/counting_*_stats_2025.json` | `scripts/build_counting_stats_mock.js` | 2025 only |

The page defaults to 2025, so in the middle of the 2026 season the hub shows
last year. Meanwhile the backend already publishes the inputs for 2026
(`shared/team_season_avg_2026.json`, `team_defense_avg_2026.json`, and
per-game `advanced_team.*` in `league_avg_2026.json`) — nothing rolls them up
for this page.

### 9.2 What changes

The rollup, the percentiles, the win-correlation levers and the rating move to
the backend, rebuilt weekly with the rest of the bundle. Seven files under
`93-FE Docs/stats/team-analytics/` — index, hub, advanced, spatial, games,
week review, player usage — specified in the
[Fetch Contract](./Team%20Analytics%20Fetch%20Contract.md). The tab layouts
in §8 do not change.

| Tab | Was | Becomes |
|---|---|---|
| Week Review | frozen at Week 0 | every week, `epa_diff` added |
| Team Profile | 2025 rate metrics + mocked EPA, maps, usage | all seven seasons, real advanced block, maps, leaders, usage |
| Leader Board | 20 metric-sides | 20 metric-sides + the advanced columns, with backend ranks |
| Scatter | ten axes, half mocked | every axis real |
| Matchup | mocked numbers, real meetings | all real |
| Rating Lab | correlations over 2019–2025 | adds 2026; scorecards on `games_{season}` |
| Trends | season mode real, game mode mocked | both real |
| Glossary | our adopted definitions | backend confirms or corrects in `notes` |

### 9.3 Decisions

- **One team rating.** The hub's composite rating was ours. The backend now
  ranks teams on "Team rating (adj. EPA/play)" for the Schools Hub. The hub
  takes the backend's rating so the Schools page, Profile and Board agree on
  who is first. The Rating Lab keeps its own sliders; it builds *a* rating,
  not *the* rating.
- **Season default follows the calendar.** Once `index.json` lands, the page
  opens on `current_season`, not a hard-coded 2025.
- **Sidebar order** (2026-10-04): HUB · TEAM ANALYTICS · PLAYER ANALYTICS ·
  TEAM STATS · PLAYER STATS. Team Analytics keeps its tab sub-items.
- **Our build scripts retire** when the backend files land. They stay in
  `scripts/` until then so the page keeps working.

### 9.4 Frontend wiring when it lands

1. Hooks read `93-FE Docs/stats/team-analytics/*`; `useTeamAnalyticsHub`
   assembles the per-season hub files into today's shape so the tabs don't
   change.
2. Default season from `index.json`.
3. Mock chips disappear on their own as each section's payload arrives.

---

## 10. Wired — 2026-10-04

The backend answered the contract the same day
(`public/data/RESPONSE_BACKEND_2026-10-04_team_analytics.md`): all six files for
2019 and 2021–2026, 2026 through Week 5. Every tab now reads them.

| Tab | Reads | Notes |
|---|---|---|
| All | `index.json`, `hub_{season}.json` + `advanced_{season}.json` (loaded together) | `useTeamAnalyticsHub` (`src/hooks/useTeamAnalyticsData.js`) assembles them into the shape the tabs already read. Opens on `current_season` (2026). Only the 18: 2019's file also carries NC A&T |
| Week Review | `week_review_{season}.json` | Bar is **net success rate, winner − loser** (`winner_edge = net_success`, re-ruled 2026-10-04); subtitle "Net Success Rates in Week N", axis "Net Success Rate". Only games between two of the 18 with play-by-play |
| Team Profile | advanced, `spatial_{season}`, `player_usage_{season}` | Advanced table uses the backend's ranks. Maps skip a season the feed couldn't place (2019–2023). Players, leaders and per-game production are that season's, not 2025's. Rush lanes carry no faces (the rollup names no players); the leader rail does |
| Leader Board | hub | Rating column is the **Team Rating** |
| Scatter | advanced | Identity preset is now EPA/dropback × EPA/rush; Points preset is points per opportunity (no per-drive points or yards-per-game field exists) |
| Matchup | advanced | Every tape row real |
| Rating Lab | hub levers (fitted over 124 team-seasons) | Unchanged |
| Trends | hub (season), `games_{season}` (game by game) | Game mode real; rating has no per-game value |
| Glossary | hub levers + `metricGlossary.js` | 25 terms flipped to on-file. The two findings cards removed (§7.5) |

**What our labels changed:** "Glory Rating" is now **Team Rating** everywhere on
this page: one rating sitewide, the Schools Hub's.

**Retired:** `0-data/team_analytics_hub.json`, `0-data/week_review_*.json` and
`scripts/build_team_analytics.js` / `build_week_review*.js` are no longer read.
The static labels and units moved to `src/pages/analytics/teamAnalyticsDictionary.js`.

**Still open:**
- **Definitions.** The backend's success (down-and-distance), explosive
  (12+ yd run / 16+ yd pass) and havoc (plays with any event) differ from the
  GameOnPaper wording in our glossary. Decision pending: change the glossary,
  or ask the backend to switch every file.
- ~~**Counting stats.**~~ Shipped 2026-10-04 (`stats/counting/`, 7 seasons).
  League games only: a team's totals leave out games against outside opponents.
- **Scatter §11 fields** (penalties per game, success by half) not yet on
  `advanced`. Discipline runs off `stats/counting/penalties_{season}.json`
  `by_side` meanwhile; Net Success by Half stays hidden until it ships.
- **Units.** Protection, Havoc and Situational still show gap cards, though
  the advanced block now has sack rate, havoc and third/standard-down success.
- **Roster composition.** Still the 2025 roster file.

---

*Last updated: 2026-10-04*
