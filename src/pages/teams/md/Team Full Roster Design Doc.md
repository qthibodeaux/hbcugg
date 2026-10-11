# Team Full Roster — Design Document

**Route:** `/teams/:teamId/roster/full`
**Page:** `src/pages/teams/TeamRosterFullPage.js`
**Status:** Live. Card and line views reworked 2026-08-30. No doc existed before that date.

> Sibling page to [Team Roster Hub Design Doc.md](./Team%20Roster%20Hub%20Design%20Doc.md)
> (`/teams/:teamId/roster`), which is the analytics hub. This page is the actual roster —
> every player, in two view modes.

---

## 1. Composition

| Component | File | Role |
|---|---|---|
| `BannerTeamDetailPage` | `components/organisms/test/BannerTeamDetail.js` | Shared team banner (Pattern C on mobile) |
| `RosterViewControlBar` | `components/molecules/roster/RosterViewControlBar.js` | Ticker + view controls |
| `RosterTab` | `components/organisms/tabs/RosterTab.js` | The roster itself; delegates to card grid or line list |

Player cards: `components/atoms/cards/RosterPlayerCard.js`.
Line rows: `components/organisms/tabs/roster/RosterLineList.js`.

---

## 2. Control Bar (2026-08-30)

The control strip was cut down to two controls and the ticker was enlarged so the two
elements balance:

- **Ticker sized up ~80%**, then its font size doubled again on request. Ticker and
  control bar are now deliberately the **same height**.
- **Controls reduced to two:** a card/line **view toggle** and a **position dropdown**.
  Everything else was removed — the extra filters weren't earning their space.

---

## 3. Card View

Four columns. Each card is a **square** photo with a small strip beneath carrying only
the **last name**.

- **Glory score removed** from the card. It was overlaid on the photo and doesn't belong
  on a roster listing — that's player-page content.
- **Jersey number bottom-left, position bottom-right** — opposite corners of the photo,
  so both read without competing.

---

## 4. Line View — Mobile (2026-08-30)

Columns, in order: **avatar · last name · year · position · height · weight**.

Position was added after the first pass, inserted after year. Name and value font sizes
were increased twice — the first pass was too small to scan at arm's length.

Follows the section-wide mobile rules recorded in
[Team Hub Design Doc.md](./Team%20Hub%20Design%20Doc.md#mobile-design-2026-08-30-pass):
square corners, no border, edge-to-edge, no padding, `rem` not `px`, and no `PageShell`
on mobile.

---

## 5. Known Gaps

- The page still imports `PageShell`; confirm the mobile branch fully bypasses it rather
  than rendering inside it (the School Wiki page has this exact unresolved issue).
- Suffix handling: last-name derivation must be suffix-aware or players render as "II"
  or "Jr." — this bug was fixed on the player page and the roster carousel during the
  same session; verify this page uses the same helper rather than a naive
  last-token split.

---

## 6. Backend Requirements

Shared with [Team Roster Hub Design Doc.md](./Team%20Roster%20Hub%20Design%20Doc.md) §4 —
this page consumes the same roster payload:

| # | What's needed | Why | Urgency |
|---|--------------|-----|---------|
| 1 | Fix the `"Unknown"` position bucket in `roster_hub_{season}.json` | Delaware State is 97 of 98 players `Unknown`. On this page it breaks the **position dropdown** — the only remaining filter — leaving one meaningless option. | **High — launch.0** |
| 2 | Real position groups (QB/RB/WR/TE/OL/DL/LB/DB/ST) | Same request as the roster hub and the Stats section. The position column and dropdown are both only as good as this field. | High |
| 3 | Player `image_url` reachable from stat contexts | See [Team Hub Design Doc.md](./Team%20Hub%20Design%20Doc.md) request #10 — `player_key` and roster `id` are disjoint identifier systems, so photos resolve by name matching at ~88%. The card view is entirely photos, so this page feels the gap most. | Medium |

---

*Last updated: 2026-08-30*
