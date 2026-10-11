# Counting Stats — Design Doc

**Pages:** `/stats/team` (Team Stats) · `/stats/player` (Player Stats)
**Built:** 2026-09-21 · **Last updated:** 2026-09-28

---

## 1. Why these exist

The analytics hubs answer *how good is this team* — percentiles, correlations, EPA, composites. Neither of them answers *how many yards did they rush for*. That is a different question, asked far more often, and every conference site answers it with a plain table.

So these two pages are deliberately the least clever things in `/stats`. They are the SWAC and MEAC Sidearm tables rebuilt on the 18-program universe: totals, per-game averages, and the handful of rates whose definition is the column header. **No percentiles, no EPA, no shading, no opinion.** If a number needs a glossary entry to read, it belongs in Team Analytics, not here.

That split is the design. It is also why these pages have no tile strip: a live tile exists to deliver a verdict at a glance, and these pages do not have verdicts.

The one deliberate exception is the **Penalties** tab (§5). It is still counting — every number in it is a count of flags — but it is the only place on either page where the shape of the data is more interesting than any single row of it, so it gets a chart instead of a table.

---

## 2. Structure

Both pages are the same shape, and it comes from the PageShell 4-column grid:

```
┌─────────────────────────────────────────────────────┐
│ Banner — title, season control                      │  4 cols
├─────────────────────────────────────────────────────┤
│ Tab grid — 4×1 tiles, 5 across × 2 down             │  4 cols
├─────────────────────────────────────────────────────┤
│ OFFENSE table (full width)                          │  4 cols
├─────────────────────────────────────────────────────┤
│ DEFENSE table (full width)                          │  4 cols
└─────────────────────────────────────────────────────┘
```

**The tab grid is 5 columns × 2 rows of 4×1 tiles**, not a scrolling strip. The decision behind that: a horizontal scroller hides half its options, and with ten categories you would never see the last five without scrolling. Two rows show all of them at once.

Team Stats has **ten tabs and the grid holds exactly ten**. It did not always: there were nine, and the tenth cell carried a season / source tile. When the source label came off (§6) that tile was repeating the season the banner already shows, so it went, and Penalties took the cell. The grid has never been ragged and no longer needs a filler to stay that way.

**Offense and defense stack vertically, not side by side.** Same reason: a two-column split gives each table half the width, which forces either a horizontal scroll or a font size nobody can read. Full width, one above the other, with the side named in the section eyebrow.

---

## 3. Team Stats — the ten categories

| Tab | Columns |
|---|---|
| Scoring | TD · FG · XPT · 2PT · DEF XP · SAF · PTS · AVG/G |
| Totals | RUSH · PASS · PLAYS · YDS · AVG/P · TD · AVG/G |
| Rushing | ATT · YDS · AVG · TD · LONG · AVG/G |
| Passing | ATT · CMP · INT · PCT · YDS · AVG/A · TD · LONG · AVG/G |
| Returns | PR: NO · YDS · AVG · TD · LONG — KR: same |
| Kicking | Punting: NO · YDS · AVG · LONG · TB · FC · I20 · BLK — FG: FGM · FGA · PCT · LONG · BLK · PAT |
| Defense | UA · A · TOT · TFL · SACKS · INT · BRUP · QBH · FR · FF · BLK · SAF |
| Conversions | 3rd: ATT · CONV · PCT — 4th: same — Red zone: ATT · SCORES · TD · FG · PCT |
| Misc | 1st downs (total, rush, pass, penalty) · FUM · FUM LOST · PEN · PEN YDS · TOP/G |
| Penalties | Not a table — the foul × team matrix. See §5 |

Every category except Penalties ships twice: `offense` is the team's own production, `defense` is what the team allowed. That is the same both-sides framing the whole site uses, and it means a "Rushing — Defense" table is the opponent's rushing against this team, not a second view of our own.

---

## 4. Player Stats

Same page shape, split by side first and then by category, because a player only ever belongs to one side of the ball.

**Offense:** Passing · Rushing · Receiving · Scoring · Returns · Kicking
**Defense:** Tackles · Interceptions · Fumbles · Sacks & TFL

Each table carries **minimum-attempt floors** for rank eligibility — a back with one carry for 40 yards is not the rushing leader. The floors live in `src/pages/stats/countingStatsTabs.js` per table (`minKey` and `min`), so they are one edit, and they are the front end's call rather than something the backend filters, which keeps the payload complete.

Specialists are keyed by **exact position**, not by position group. The roster's `position_group` collapses every kicker, punter, long snapper and returner into `"ST"`, which is useless for splitting a kicking table from a returns table.

---

## 5. Penalties — the foul × team matrix

Every other tab answers *how many*. This one answers *of what kind*, and that is a
different shape of question: one number per team is useless, and the interesting
thing is the whole 39 × 18 field at once.

So the Penalties tab is a single grid. **Fouls down the side**, ordered by how
often the league commits them. **Teams across the top**, ordered by total flags,
logo over count. One cell per pair. Read a column top to bottom and you have a
team's bad habits; read a row across and you have who owns that foul.

### The two rules that make 39 × 18 legible

**Heat is relative to the row, not the grid.** False start and holding are 42% of
all flags between them. Shade the whole grid against one maximum and those two
rows carry every pixel of colour and the other 37 are a grey field. Shading each
row against its own leader means the rare-foul rows are readable too — which is
the half of the chart nobody else publishes.

**Rare rows are muted.** Row-relative shading alone has the opposite failure: a
single tripping call is its row's maximum, so it would burn as bright as a
league-leading 38 holds. Every row's palette therefore dims with its own total.
The bottom of the chart stays quiet without going invisible.

A zero is a dim `·`, not an empty cell — an empty cell reads as missing data, a
dot reads as *none*. The row leader is the only bold number.

### Phase filter

Each foul carries a `phase` — pre-snap, live ball, dead ball. The filter narrows
the rows and never reorders them, so a foul keeps its place in the eye when you
switch. Pre-snap alone is a discipline chart; live ball alone is a technique
chart. It is the one control on the tab, which is why it gets to exist at all.

### Why it is mocked

`penalty_advanced.top_penalty_types` ships per team-game and cannot drive this.
Checked across all 392 exports — 664 team-games, 5,411 accepted penalties:

- **It is a top-five list.** It accounts for 4,524 of 5,411 accepted penalties,
  **83.6%**. What it drops is not a random 16%, it is the tail — exactly the
  bottom two-thirds of this chart.
- **It is unnormalised, and partly not penalties.** 276 distinct strings, of
  which 526 flags are literally `"UNKNOWN"` and much of the tail is play-by-play
  spill: `"BALL ON AAMU39"`, `"1ST AND 10"`, `"&M22"`. Real fouls split across
  spellings — `FACEMASK` / `FACE MASK`, `OFFSIDE` / `OFFSIDE DEFENSE` / `OFF`.

Normalising that on the front end means guessing which garbage string meant which
foul, and publishing the guess under our name. So the tab runs on
`src/pages/stats/penaltyMatrix.js` instead, with one swap point. **The foul
vocabulary and the relative frequencies in it are the real observed
distribution**, so the chart has the right shape — dense at the top, sparse and
scattered at the bottom — even though no individual cell is a real number. The
ask that replaces it is §3 of the fetch contract.

---

## 6. What is real

**Nothing yet.** Both pages run on `scripts/build_counting_stats_mock.js`, which writes `0-data/counting_team_stats_2025.json` and `counting_player_stats_2025.json` with `source: "mock"`. The mock is seeded (mulberry32) so the numbers are stable across reloads, and the player file is built off the **real 2025 roster** — 445 actual players, so names, teams and positions are correct even where the production is invented.

**The pages no longer say so on screen.** They used to carry an amber MOCK DATA chip in each section eyebrow and again in the tab grid's tenth cell. Those came off: a chip on every section is a label the reader has to dismiss on every visit, and mock provenance is a fact about the build, not about the football. The eyebrow now shows `Through {week}` when the payload carries a games-through label and nothing when it does not. Provenance lives in this doc, in the contract, and in `source: "mock"` on the file — not on the page.

(Player Stats still carries the chip. Team Stats was the page asked for; the two should match eventually.)

[Counting Stats Fetch Contract](./Counting%20Stats%20Fetch%20Contract.md) is the ask — §1 team, §2 player, §3 the penalty matrix. The one open gap beyond it: **only 2025 exists.** Team Analytics runs six seasons, so a 2023 team profile currently dashes every counting field. Five more seasons of both files closes it.

---

## 7. Sidebar

`/stats/team` and `/stats/player` are top-level items under STATS, alongside HUB, TEAM ANALYTICS and PLAYER ANALYTICS. **They do not get sub-items.** The ten categories are in-page tabs, and putting them in the sidebar too would be two levels of the same navigation — the same reasoning the Stats Hub doc uses to ban in-page tabs elsewhere, applied in the other direction.

Team Analytics is the exception: it earns sidebar sub-items because its tabs are analytical lenses with their own URLs and their own team scoping, not table filters.

---

*Last updated: 2026-09-28*
