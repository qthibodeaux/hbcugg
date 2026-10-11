# Light / Night Mode

Night is the site as it is today. Light is the new palette. The switch sits at the bottom of the sidebar.

Backup taken before any of this: `archive/src_backup_2026-10-04_pre-theme.zip`.

---

## 1. Groundwork (done 2026-10-04)

| Piece | File |
|---|---|
| Palette as CSS variables: night on `:root`, light on `:root[data-theme="light"]` | `src/theme/palette.css` |
| Scheme store: sets `data-theme` on `<html>`, remembers the pick in `localStorage`, `useColorScheme()` hook (no effect, no context) | `src/theme/colorScheme.js` |
| Applied before first paint | `src/index.js` → `applyStoredScheme()` |
| Chakra tokens point at the variables: `bg.primary/secondary/card/raised`, `text.primary/secondary/muted/ink`, new `line` / `line.subtle` / `line.strong` / `line.hover` / `line.track` | `src/theme/index.js` |
| Body background + text, scrollbar | `src/index.css` |
| Switch (Night / Light pill), sticky at the sidebar's bottom | `src/components/organisms/ThemeSwitch.js`, `SideNav.js` |

**The switch shows in development only** (`THEME_SWITCH_ENABLED` in `colorScheme.js`). Production stays night until the conversion below is done. Flip that constant to `true` to ship it.

Anything already on `bg.*` / `text.*` tokens flips today. Everything hard-coded stays night, so light mode is a patchwork until the sweep.

---

## 2. The sweep: hard-coded colour → variable

Counts are across `src/components` + `src/pages` (test files excluded).

| Today (night) | Count | Becomes | Note |
|---|---|---|---|
| `"white"`, `"#FFFFFF"` as text colour | ~2,240 | `text.ink` / `text.primary` | **Not** on team-colour or photo surfaces — white on a team gradient stays white in both modes. |
| `whiteAlpha.100` (borders) | 1,518 | `line` | |
| `whiteAlpha.50` | 334 | `line.subtle` | |
| `whiteAlpha.200` | 376 | `line.strong` / `line.hover` | `line.hover` when it sits in `_hover` |
| `whiteAlpha.300`–`800` (muted text) | ~890 | `text.secondary` / `text.muted` | 300–500 → muted, 600–800 → secondary |
| `rgba(255,255,255,0.04–0.12)` | ~220 | `line.*` / `line.track` | `track` for empty bar/meter tracks |
| `rgba(255,255,255,0.3–0.5)` | ~180 | `text.muted` | |
| `#0B0B0D` | 82 | `bg.primary` | |
| `#141416` | 66 | `bg.secondary` | |
| `#1A1A1D` / `#1F1F25` | — | `bg.card` / `bg.raised` | Includes `TONES` in `SummaryMobile.js` and `--part-bg` |

**Stays as-is in both modes:** team colours (`teams.json`), brand red/purple, status colours (`#48BB78` green, `#F6AD55` amber, `#EF4444` red), heat ramps and chart fills. In light mode some of these need a darker step for contrast. Decide per chart in the lab, not by sweep.

**Needs a light design, not a swap:**
- Banners (team gradients over near-black)
- Scoreboards and the game banner
- Photo cards with dark fades (`NotablePerformersCard`, player spotlights, school tiles)
- Heat maps and the finish matrix
- The export posters (always night; they're images)

---

## 3. Order

1. **Shared chrome:** `PageShell`, `SideNav`, `Header`, `MobileMenu`, `BottomSheet`, the table primitives (`ProductionPrimitives`), `EditorialCard`.
2. **Game Center:** hub, Games Hub, game page.
3. **Schools / Team hub / Rosters / Players / Coaches.**
4. **Banners + photo cards:** lab first, one light variant per banner family.

Each page: sweep, check both modes, then move on. The lab gets a mode toggle so both palettes can be compared side by side.
