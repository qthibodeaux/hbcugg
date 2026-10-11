# Team Individual Schedule — Design Document

**Route:** `/teams/:teamId/schedule`
**Page:** `src/pages/teams/TeamSchedulePage.js` (imported in `App.js` as `TeamIndividualSchedulePage`)
**Status:** Live. Mobile pass 2026-08-30. No doc existed before that date.

> **Not** the same page as
> [Team Schedules Design Doc.md](../../game-center/md/Team%20Schedules%20Design%20Doc.md),
> which documents `/game-center/team` (`src/pages/game-center/TeamSchedulePage.js`) — the
> league-wide schedule browser. Two different files with the same basename in two
> different folders, and the route alias in `App.js` obscures it. Check the import path
> before editing either.

---

## 1. Mobile Pass (2026-08-30)

### 1.1 Banner

Converted to **Pattern C**, the mobile banner standard — `MobileSectionSwitcher` plus a
`+` `BannerIconButton` opening a `BottomSheet` of season chips. Definition and rationale
in [Team Hub Design Doc.md](./Team%20Hub%20Design%20Doc.md#pattern-c--the-mobile-banner-standard).

### 1.2 Summary band

`components/molecules/schedule/TeamScheduleSummaryBand.js` **had no mobile branch at
all** — it rendered its desktop layout at phone width. Added
`MobileTeamScheduleSummaryBand`:

- Gradient title tier
- Switcher + `+` control row
- **Stat pills moved out of the control strip onto their own wrapping row** — they were
  competing with the controls for a single row's width and truncating.

### 1.3 Results strip removed

The small results strip was **removed on mobile**. It duplicated information already
carried by the schedule rows and cost vertical space the rows needed.

### 1.4 Standing rules

Per [Team Hub Design Doc.md](./Team%20Hub%20Design%20Doc.md#mobile-design-2026-08-30-pass):
no `PageShell` on mobile, square corners, no border, edge-to-edge, no padding, `rem`
not `px`.

---

## 2. Backend Requirements

| # | What's needed | Why | Urgency |
|---|--------------|-----|---------|
| 1 | Contextual game tagging on schedule rows | Same request as [Team Hub Design Doc.md](./Team%20Hub%20Design%20Doc.md) #7. `tag` is only ever `"Season Opener"` or `"Conference Game"` across all six years (2021–2026), so a schedule can't mark rivalries, homecoming, the MEAC/SWAC Challenge, the SWAC Championship, or the Celebration Bowl. Needs a richer classification or boolean flags (`is_rivalry`, `is_homecoming`, …). Pure data addition — the frontend already renders `tag` verbatim. | Medium |
| 2 | Distinguish `tag` from `headline` | Same as Team Hub #9. Many games ship the identical string in both fields, which produced duplicated rows and clipping on the team hub's `ReviewGameCard`. | Medium |
| 3 | Win probability per game | Listed as Team Hub request #6 for the upcoming-games sidebar; the same field would let this page mark expected outcomes. Note `wpa` exists in the game master schema but is **null on all 256 plays** in the sample — the model isn't populated yet. | Low — future state |

---

## 3. Known Gaps

- Desktop was deliberately untouched during the 2026-08-30 pass — every change above is
  mobile-only and gated on `useLayoutDensity().isMobile`.
- The two same-named `TeamSchedulePage.js` files (see the note at the top) are a standing
  trap. Worth renaming one of them.

---

*Last updated: 2026-08-30*
