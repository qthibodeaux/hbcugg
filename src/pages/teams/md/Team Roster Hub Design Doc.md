# Team Roster Hub — Design Document

**Route:** `/teams/:teamId/roster` · `/teams/:teamId/roster/hub`
**Page:** `src/pages/teams/TeamRosterHubPage.js`
**Status:** Live. Desktop stable; full mobile pass completed 2026-08-30.

> **Not to be confused with** [Roster Hub Design Doc.md](./Roster%20Hub%20Design%20Doc.md) (this folder) or
> [Rosters Hub Design Doc.md](../../players/md/Rosters%20Hub%20Design%20Doc.md) — both of those describe
> `RostersPage.js` at `/rosters`, the **league-wide** hub with By Team / Divisions / League modes.
> This document covers the **per-team** roster hub, which had no design doc until 2026-08-30.

---

## 1. Page Composition

Two components carry the page:

| Component | File | Role |
|---|---|---|
| `RosterFeatureRail` | `components/molecules/roster/RosterFeatureRail.js` | Above-the-fold rail — View Roster CTA, player carousel, class stack, Roster DNA |
| `RosterHubGrid` | `components/molecules/roster/RosterHubGrid.js` | The 11-card analytics grid below it |

### 1.1 Grid slot map (desktop)

| Slot | Component |
|---|---|
| `cols=3, rows=2` | `RosterOutlookCarousel` |
| `cols=1` | `RosterCompositionCard` (`variant="compact"`) |
| `cols=1` | `RosterExperienceCard` (`variant="compact"`) |
| `cols=2, rows=4` | `RosterGeographyCard` |
| `cols=2, rows=2` | `RosterTransferCard` |
| `cols=1, rows=2` | `RosterPhysicalProfileCard` |
| `cols=1, rows=2` | `RosterDepthSnapshotCard` |
| `cols=1` ×4 | `RosterKpiTile` |

---

## 2. Mobile Design (2026-08-30 pass)

The whole page was redesigned for phone width in one pass. The standing rules it
follows are section-wide, not specific to this page:

- **No `PageShell` on mobile.** PageShell is a desktop concept. Its `autoRows`
  (`ROW_UNIT = clamp(160px, 20vw, 260px)`) forces a shared row height on every slot,
  which is the root cause of the "dead space under the banner" bug that kept
  recurring across this section. Mobile branches reproduce `rowUnitHeight(rows)`
  locally where a card genuinely needs a definite height.
- **Square, borderless, edge-to-edge, no padding.** Every mobile component touches
  its parent's edges.
- **`rem`, never hardcoded `px`.**

### 2.1 What changed

- **`CardShell`** (`RosterHubCards.js`) — squared, border-free, tighter padding on
  mobile. One change covers all 11 grid cards.
- **`RosterHubGrid`** — local `Slot` wrapper forcing `radius="none"` on mobile
  across every slot, rather than editing each one; stays a plain `PageShell.Slot`
  on desktop. `KpiRow` groups the four KPI tiles into a 4-across strip.
- **`RosterKpiCardMobile`** — added; `RosterKpiTile` selects it when `isMobile`.
- **`RosterFeatureRailMobile`** — 2 columns: a sidebar holding View Roster over
  Class Stack, with the carousel taking the majority. **Roster DNA is dropped on
  mobile**, following the precedent already set by the compact variant.
- **`StackCard`** rebuilt as a fanned deck — cards peek out from under the primary
  photo and fade back. Offsets use `transform: translateX(%)`, which resolves
  against the element's own width, so the fan holds at any stage width.
- **`RosterOutlookCarousel`** — mobile row is `last name | HT | WT | 5 year boxes`
  via a shared `MOBILE_COLUMNS`. `EligibilityBar` gained a `mobile` prop (gap 0,
  square, white hairline borders); the grid uses `alignItems="stretch"` with padding
  moved into the text cells so the year boxes span the full row height.
- **`ClassStackBlock`** — horizontal segmented bar becomes per-class rows.

### 2.2 Charts

Three cards were rebuilt on Recharts during this pass. Two rules learned the hard
way, recorded so they aren't rediscovered:

- **`ResponsiveContainer` measures its parent once at mount, and a percentage
  height does not resolve against `min-height`.** `h="full" minH="7.5rem"` stretches
  the box but leaves `height:100%` computing against `auto`, producing a blank
  chart. Desktop (definite slot height) can use `h="full"`; **mobile needs a
  definite `rem` height.**
- **`interval={0}`** is required on a category axis or Recharts auto-skips ticks —
  this was blanking every other class label on the Class Pipeline chart.

Also: a `LabelList` attached to a zero-value stacked segment does not render (this
caused missing room totals on Experience By Room), and `YAxis width` must stay a
number — SVG user units — even when the rest of the component is in `rem`.

---

## 3. Bugs Fixed 2026-08-30

Distinct from styling work — these were wrong, not just ugly:

1. **Position-group acronym bug** — an acronym transform was reducing already-
   abbreviated position codes to a single letter, so `DL` and `DB` both rendered
   as "D". Card retitled "Biggest Position Groups".
2. **Class Pipeline axis** — Recharts auto-skip blanked every other class label.
   Fixed with `interval={0}`, `domain={[0, rosterTotal]}`, `ticks={[0, rosterTotal]}`.
3. **Experience By Room colors** — classes were colored by palette index, so 5 class
   years wrapped onto 3–4 team colors and different classes shared a color. Replaced
   with `buildClassRamp(primary, steps)`, a single-hue ramp that also handles
   near-black primaries. Class year is **ordinal** (FR→GR), so it wants one hue
   getting progressively stronger, not five unrelated hues.
4. **Geography label format** — `{state}-{count}` read as a single token ("AL-55");
   now `{state}: {count}`.
5. **`buildSlides` cap** — the fanned deck could never show its full card count
   because the source capped players at 4 and total slides at 5. Raised to
   `MAX_PLAYER_SLIDES = 7`, `MAX_SLIDES = 8`.

---

## 4. Backend Requirements

| # | What's needed | Why | Urgency |
|---|--------------|-----|---------|
| 1 | Fix the `"Unknown"` position bucket in `roster_hub_{season}.json` | **Delaware State has 97 of 98 players classified `Unknown` in `roster_hub_2025.json`.** Every position-driven card on this page (Biggest Position Groups, Depth Snapshot, Portal Profile position rows, Experience By Room) degrades to a single meaningless bar for that team. The frontend already filters `Unknown` out of position-specific charts and keeps it in totals — per the shared design note — so this is purely a data-quality fix, no component change. Worth auditing all 18 teams for the same failure. | **High — launch.0, flagged 2026-08-30** |
| 2 | Real position groups, not a collapsed `DEF` bucket | Related to #1 and shared with the Stats section: the season counting export (`6-stat lab/counting/season_stats.json`) collapses every defensive position into one `DEF` value — 4,981 of 7,502 player rows across all years, with no TE, OL, DB, or LB anywhere. Any position filter or per-position leaderboard is impossible until the real groups ship. | High |
| 3 | Receiving and defensive season counting stats | The same export's `categories` field says 4,505 rows are `['defense']` and 740 are `['receiving']`, but the file carries **only** `rushing_*` and `passing_*` columns. The per-game files already have both in `individual_stats` — this is a rollup that was never exported. | High |

---

## 5. Known Gaps (frontend)

- **Roster DNA has no mobile design.** It is dropped on mobile rather than adapted,
  matching the compact variant. If it should appear on phones, it needs its own pass.
- The four KPI tiles share one mobile strip; at very narrow widths (<340px) the
  4-across grid is tight. Not observed to clip, but untested below 360px.

---

*Last updated: 2026-08-30*
