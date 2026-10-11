# Player Analytics Hub — Design Doc

**Route:** `/player-analytics`
**Status:** Foundation build live (scope bar, search, Player tab, mock DNA tiles). Other tabs not built.
**Sibling doc:** `Team Analytics Hub Design Doc.md` — shares the organizing principle in §2 of that doc.
**Inspiration:** Loosely rhymes with the *shape* of PlayerPrint (playerprint.streamlit.app) — scoped filters → search → tabbed lenses → summary tiles → click-to-expand breakdowns. Not a visual copy; this site's own dark theme / `bg.secondary` card language is used throughout, matching `StatsPage.js`.

---

## 1. What This Answers

"Give me everything about one player" — the individual-athlete counterpart to Team Analytics' unit-level breakdowns. Person-attributable stats only (see the shared organizing principle) — QB/RB/WR/TE/DL/LB/DB counting + advanced stats, plus a thin K/P profile. OL does **not** get individual player pages — no real per-lineman stats exist in this dataset; O-Line lives entirely under Team Analytics.

---

## 2. Page Structure

**Scope bar** (persistent, top of page):
- Season (single option today — 2025)
- Division (All / SWAC West / SWAC East / MEAC) — real, filters by `teams.json` `conference`/`division`
- Position Pool (All / QB / RB / WR / TE / OL / DL / LB / DB / K·P) — uses the existing `position_group` values already produced by `useSWACData.js`'s `normalizePositionGroup()` (`QB, RB, WR, TE, OL, DL, LB, DB, ST`) — no new taxonomy invented, reused what the codebase already normalizes to.

**Search row:**
- Player search — real autocomplete against `usePlayerStatsEnriched()`, filtered live by the scope bar's division/position pool.
- Team search — a lookup-only filter (narrows player search to one team), not its own analytical view, matching the "search only" framing from the reference tool.

**Tabs:** Player (built) · Team · Scatter · Scout · Compare · Glossary (all locked/placeholder — see §6).

---

## 3. The Player Tab — Two Layers

1. **Identity header** — name, team logo/color, position, class year, and **PAR** (real, from `usePlayerStatsEnriched`).
2. **Player DNA** — a row of position-specific summary tiles (label + number + bar). **Position-specific per the locked decision**: a QB's tile set (completion %, yards/attempt, TD:INT, EPA/play, success rate, explosive rate) is deliberately different from a DB's (passes defended, INTs, tackles, havoc rate, coverage grade). Every position group in `POSITION_GROUP_SET` has its own tile config in `PlayerAnalyticsPage.js`.
3. **Concepts** — below the DNA row, a set of clickable-in-future category chips (e.g. QB: Accuracy Profile, Arm/Deep Ball, Pocket Poise, Decision Making, Mobility, Red Zone). Mirrors the reference tool's "click a concept, get the full raw-metric breakdown" model. **Not wired yet** — chips render but don't expand. When built, these map onto the rich nested breakdowns already sitting in `individual_stats` (`depth_breakdown`, `direction_breakdown`, `pressure_breakdown`, `red_zone_breakdown`, `third_down_breakdown` — confirmed present on real passing records in the game JSON).

---

## 4. What's Real vs. Mock Right Now

| Element | Status |
|---|---|
| Player search, identity, team, position, class year | ✅ Real — `usePlayerStatsEnriched()` |
| PAR | ✅ Real — same hook |
| Division / Position Pool filtering | ✅ Real — client-side filter over the same player list |
| **Player DNA tile numbers + bar fills** | 🔴 Mock — plausible-looking placeholder values per position, explicitly labeled "Mock Data" in the UI |
| Concepts chips | 🔴 Placeholder — labels only, no expansion, no data behind them |

The DNA tile bar was originally going to be a true percentile-vs-position-pool fill (mirroring the reference tool exactly). **That was explicitly rejected** — real percentile grading needs a season-wide rollup dataset that doesn't exist. Decision: raw numbers + existing composite scores (PAR now; Production/Glory once those are finished) instead of percentile grading. The bar in the current mock tiles is a placeholder visual, not a percentile — do not treat its fill level as meaningful until real comparison data replaces it.

---

## 5. Position Pool List — Locked

`QB, RB, WR, TE, OL, DL, LB, DB, ST(K/P)`. No sub-splitting (no DT vs. EDGE, no CB vs. S) — the underlying team data doesn't distinguish that granularly, so splitting would create pools too thin to mean anything.

---

## 6. Explicitly Not Built Yet

- **Team tab** (within this hub) — would this even live here, or only under Team Analytics? Undecided.
- **Scatter tab** — X/Y metric plot across a position pool, cheap once any two comparable numeric fields exist per player; doesn't strictly need percentiles.
- **Scout tab** — weighted multi-metric custom ranking (pick metrics + importance, get a fit-scored leaderboard). Big build, needs the full player pool with clean per-metric values.
- **Compare tab** — 2+ players, side-by-side Concepts breakdown. Natural extension of the Concepts model once that's real.
- **Glossary tab** — plain metric definitions. Same underlying need already flagged as a P0 item in the Game Page Design Doc ("stat glossary entries for every non-obvious metric") — should probably be one shared glossary dataset, not rebuilt per hub.

---

## 7. Data/Fetch Requests Implied (not yet formal pipeline docs)

- Season-wide per-position percentile dataset (blocks real DNA-bar fills — same infra gap as Team Analytics' rollup and the Game Page's season-avg/league-max idea).
- Structured Concepts-tab data pull per position (largely may already exist in `individual_stats`' nested breakdowns — needs a real audit per position, not assumed).
- Confirmation of what "Production Score" and "Glory Score" will actually measure once finished, so they can be added to DNA tiles as real composite numbers instead of PAR being the only real score shown.

---

*Created: 2026-07-23*
