# Banner System — Design Doc

**Scope:** every `4x1` banner used as the first `PageShell.Slot` on a major page.
**Rules of record:** `AgentDesignBible.md` §2b "The Banner System" — this doc doesn't restate the anatomy/visual rules, it covers the **templates** (what shapes of banner exist) and **migration status** (what's actually been moved to the current standard vs. what's still the old pattern). Read both together.

---

## 1. Two Templates

Not every banner has the same content shape. Two distinct templates have emerged so far:

### Template A — Hub Banner
For pages with no single "subject" — a browsing/filtering tool, not an entity detail page. Content: eyebrow (optional) → title → subtitle (optional) → control strip.

**Used by (production):** Player Analytics, Games Hub, Week Central, Schools.

**Building blocks (production, shared):** `src/components/organisms/BannerControls.js` — `BannerGhostWord`, `BannerTitleArea` (contained + vertically centered), `BannerControlStrip` (opaque, full-width), `BannerDropdown` (portal-based custom listbox), `BannerSegmentedPills` (for small fixed choice sets like a conference filter), `BannerIconButton`, `BannerActionButton`, `BannerTogglePill`.

**Where it originated (Lab, kept for reference):** `PlayerAnalyticsBannerConcepts.js`, `HubBannerRedesigns.js`.

### Template B — Entity Detail Banner
For pages about one specific thing (a team, eventually a player/coach/game). Content: identity block (name, mascot/logo bleed image, subline) → control strip. The identity block owns more visual real estate than Template A's title block, and typically has an entity-specific ghost word (the mascot name, not a generic page label) plus a bleeding logo/photo image layered behind/beside it.

**Used by (production):** Team Detail (`BannerTeamDetail.js` — both `BannerTeamDetailPage` and the Lab-cycling `BannerTeamDetail` export).

**Not yet built but should follow this template when they're tackled:** Player Detail, Coach Detail — both are entity-detail pages with a natural "one subject" identity block, same shape as Team Detail, just swapping mascot/logo for a headshot.

**Open question:** does the Game Page banner (`GameBannerScoreboardA`) count as a third template, or is it Template B with two entities instead of one? It also has different controls (tab navigation, not scope filters) — needs its own evaluation before assuming either template fits. Not evaluated yet.

---

## 2. Migration Status

**Five banners promoted to production on 2026-07-30.** Each migration reused the Lab-proven structure but rebuilt it against a new shared module (`src/components/organisms/BannerControls.js`) instead of copy-pasting Lab markup, and preserved 100% of each page's existing real state/logic (season commit flow, week prev/next, non-conf toggle, player search filtering, etc.) — only the visual shell changed.

| Page / Banner | Production component | Template | Status | Lab # |
|---|---|---|---|---|
| Player Analytics | `src/components/organisms/PlayerAnalyticsBanner.js`, wired into `PlayerAnalyticsPage.js` (now a real `PageShell` page — it had none before) | A | 🟢 Live in production | #1503/#1504 (origin) |
| Games Hub | `src/components/molecules/game/GamesHubBanner.js` | A | 🟢 Live in production | #1505 (origin) |
| Week Central | `src/components/organisms/game-center/week/WeekCentralBanner.js` | A | 🟢 Live in production | #1506 (origin) |
| Schools | `src/components/organisms/test/BannerPages.js` (`BannerSchools` export — standalone, does not use that file's shared legacy `BannerShell`) | A | 🟢 Live in production | #1507 (origin) |
| Team Detail | `src/components/organisms/test/BannerTeamDetail.js` (`BannerTeamDetailPage` for production, `BannerTeamDetail` for the Lab-cycling variant) | B | 🟢 Live in production | #1508 (origin) |
| Game Center Hub | `BannerGameCenter` | ? | ⚪ Not evaluated — user explicitly likes the current huge-ghost-lettering look, do not migrate without new direction | — |
| Schedule | `BannerSchedule` | A (likely) | ⚪ Not evaluated | — |
| Player Detail | `BannerPlayer` | B (likely) | ⚪ Not evaluated | — |
| Game Page | `GameBannerScoreboardA` | ? | ⚪ Not evaluated — different control shape (tabs, not filters), see open question above | — |
| Team Schedules / Standings / Rosters Hub | `BannerPages.js` shared `BannerShell` (`BannerTeamSchedules`, `BannerStandings`, `BannerRostersHub`, and an unused alt `BannerGamesHub` export) | A (likely) | ⚪ Explicitly out of scope for the 2026-07-30 migration — still the old right-aligned/ticker pattern | — |

**Legend:** 🔴 nothing built · 🟡 Lab prototype exists, production untouched · 🟢 live in production · ⚪ not looked at yet

---

## 3. What "Applying to Production" Actually Required (done, 2026-07-30)

For the record, here's what the five completed migrations actually involved:

1. Extracted the Lab-proven structure into one shared, non-test module (`BannerControls.js`) instead of copy-pasting Lab markup into each production file — so all five (and future) banners share one dropdown/strip/ghost-word implementation, not five slightly-different copies.
2. Rewired each production component's real state/props into the new shell — no mock data introduced anywhere; every dropdown, toggle, and button is wired to the same real handlers (`commitControls`, `toggleNonConference`, `onSeasonChange`, `setDivision`, etc.) that existed before.
3. Player Analytics needed an actual `PageShell` conversion first — that page had no banner and no grid at all before this, just `ContentContainer`. Done as part of this pass; the rest of the page (search, tabs, player body) now lives in `PageShell`'s `listContent`.
4. Scope discipline: `BannerPages.js`'s shared `BannerShell` (used by Team Schedules/Standings/Rosters Hub, and an unused alt Games Hub export) was deliberately **not** touched — only `BannerSchools` was pulled out as a standalone component. Migrating those three is separate future work, not a side effect of this pass.

---

## 4. Open Items

- Game Page banner (`GameBannerScoreboardA`) template classification — undecided, see §1.
- Team Schedules, Standings, and Rosters Hub banners still use the old `BannerPages.js` shared `BannerShell` (right-aligned controls, translucent ticker) — not migrated, out of scope for the 2026-07-30 pass. Migrating `BannerSchools` off the shared shell leaves those three as the shell's only remaining consumers; worth deciding whether to migrate them next or retire the shared shell entirely once they move too.
- Game Center Hub (`BannerGameCenter`), Schedule (`BannerSchedule`), Player Detail (`BannerPlayer`) — not evaluated at all yet.
- Player/Coach Detail banners (Template B) not built yet — should follow `BannerTeamDetail.js`'s shape when tackled.

---

*Created: 2026-07-30*
*Updated: 2026-07-30 — five banners (Player Analytics, Games Hub, Week Central, Schools, Team Detail) migrated to production.*
