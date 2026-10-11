# HBCU GridIron Glory - Agent Design Bible

The rules that govern how every component is built. Non-negotiable.

---

## 1. Core Philosophy: High-Fidelity Editorial Analytics

This platform is a data-driven magazine, not a dashboard.

It should feel dense, confident, visual, and story-first. Every component should answer:
- what is the story this data tells?
- what is the first thing the eye should notice?
- what makes this feel like HBCU football and not a generic sports app?

The biggest number on screen should be the most important number. Labels should support the data, not compete with it.

---

## 1b. Shared Design Vocabulary

We now use a shared shorthand vocabulary for design direction.

Source:
`inspo/q communication/communication.md`

When the user says one of these terms, treat it as a reusable visual pattern:

| Term | Meaning |
|------|---------|
| `schoolbanner` | big editorial banner, oversized headline, ghost word, strong gradient |
| `watermark` | oversized low-opacity background logo, lettermark, or word |
| `team gradient` | horizontal team-branded strip with logo and fade into dark |
| `player avy` | dramatic tight portrait crop, premium and player-led |
| `logo` | logo-first treatment where the mark carries the card |
| `cool` | sleek dark sports-interface detail, restrained but sharp |

Translation rule:
- do not copy the reference literally
- do reuse its hierarchy, atmosphere, and branding logic

Default biases implied by this vocabulary:
- oversized editorial type
- ghosted background marks
- dark surfaces with team-color gradients
- premium portrait crops instead of generic avatars
- logos with real visual presence
- compact uppercase metadata lines

Avoid:
- flat empty cards
- tiny logos
- generic SaaS dashboard styling
- weak hierarchy

---

## 2. The Grid System

All production pages use an **Asymmetric Magazine Grid** powered by `PageShell`.

File:
`src/components/layouts/PageShell.js`

Do not use legacy `DesktopBoard4x` or `SlotNxM` in new work.

### Usage

```jsx
import PageShell from "../../components/layouts/PageShell";

<PageShell>
  <PageShell.Slot cols={4}>{/* banner */}</PageShell.Slot>
  <PageShell.Slot cols={1}>{/* 1x1 card */}</PageShell.Slot>
  <PageShell.Slot cols={2} rows={2}>{/* 2x2 card */}</PageShell.Slot>
</PageShell>
```

### Slot Rules

| `cols` | Width | Use |
|--------|-------|-----|
| 4 | full width | banners |
| 2 | half width | wide cards, rails |
| 1 | quarter width | KPI cards, standings, game cards, identity plates |

### Grid Flow Strategy

- **Density Management**: Map individual identity tiles (like `SchoolIdentityPlate`) to separate `cols={1}` slots rather than nesting internal `SimpleGrid` containers.
- **Tall Form Safety**: For data-dense cards (e.g., `ProgramWikiCard`), use `rows={2}` to ensure vertical room for stats without breaking the rhythm.
- **Slot Heights**: All nested components must use `h="full" w="full"`. Never hardcode root pixel heights.

### Full-Bleed Media
Components inside slots should favor **Full-Bleed** layouts (zero internal padding for images/backgrounds) to maximize the "Cinematic" impact.

- row unit: `clamp(160px, 20vw, 260px)`
- gap: `4px` at md, `10px` at lg
- max width: `1400px`
- `PageShell` already handles top padding

Inside a slot, the root component must use:

```jsx
<Box w="full" h="full" />
```

Never hardcode root height.

### Component Scaling Inside Slots

`1x1` and other fixed PageShell slots must adapt information density as pixel width gets squeezed (desktop → tablet).

Rules:
- **Use bounded sizing only**: `clamp()`, `%`, responsive props. Never fixed px for primary layout regions.
- **Preserve hierarchy first**: primary data → context → decorative detail. Hide secondary metadata before primary data wraps.
- **One-line labels**: Use `bannerShort → shortName → name` for labels; abbreviate sparingly (`CB`, `SCG`). Avoid letter-wrapping.
- **Proportional media**: Logos/portraits use `%`, `clamp()`, or grid `fr` tracks. Never hardcoded sizing that breaks overflow.
- **Resilient grids**: Use `minmax(0, 1fr)`, `minW={0}`, `minH={0}`, `noOfLines`, `whiteSpace="nowrap"`. Avoid fixed tracks like `minmax(280px, 1fr)`.
- **Composition-driven layout**: Define stable layout regions first (rows, columns), then fit content into those regions.

### Compact vs Standard Variants

When a component needs to work in both full-width and squeezed contexts, create **separate render functions**, not a single structure squeezed with conditionals.

Pattern:
```jsx
export const MyComponent = ({ variant = "standard", ...props }) => {
  if (variant === "compact") return <MyComponentCompact {...props} />;
  return <MyComponentStandard {...props} />;
};
```

Key rules:
- **Parent decides variant** — from slot size, placement, or page state. Do not guess with viewport ternaries inside the component.
- **Separate hierarchy** — If the information structure changes, create separate JSX. Compact mode may use fewer fields, abbreviations, different layout, and hidden secondary context.
- **Reuse non-visual logic** — Data objects, colors, logos, helper functions, small subcomponents may be shared. But layout and content are separate.
- **Both modes complete** — Standard must not be weakened by compact compromises. Compact must be visually whole at its actual slot size.
- **Use `h="full" w="full"`** — Even compact roots must fill their slot. Proportional internal grids/flex ensure scaling.
- **Avoid dense sprawl** — Compact mode should pick 2–3 key facts, not shrink an 8-field dashboard.

### Shared Layout Density

Compact is an app-level contract, not a page-by-page opinion.

Source:
`src/hooks/useLayoutDensity.js`

All pages and parent containers should read the shared layout density and pass explicit variants to children whose information hierarchy changes.

```jsx
const { density } = useLayoutDensity();
const cardVariant = density === LAYOUT_DENSITY.STANDARD ? "standard" : "compact";

<SomeCard variant={cardVariant} />
```

Density values:

| Density | Meaning |
|---|---|
| `mobile` | phone-width layout; future-first and content-reduced |
| `compact` | tablet/narrow desktop or sidebar-squeezed content |
| `standard` | full desktop content width |

Rules:
- **The app shell owns density** — `MainLayout` provides it based on the shared breakpoints and whether the route has sidebar chrome.
- **Parents pass variants** — pages, list containers, and slot wrappers choose `standard` or `compact` for child components.
- **Children do not invent compact** — do not use viewport ternaries to choose different JSX hierarchy inside a leaf card.
- **Responsive props are still allowed for tuning** — spacing and type can breathe across breakpoints, but structural information hierarchy must come from the explicit variant.
- **Sidebar-aware by default** — routes with the team/sidebar shell remain compact longer because their usable content width is smaller than raw viewport width.

Reference implementation:
`src/components/organisms/tabs/roster/PlayersTab.js`

The roster player card is the standard to look back on:
- `PlayersTab` reads shared layout density once.
- `PlayersTab` passes `variant` to each `PlayerCard`.
- `PlayerCard` renders separate compact and standard name/info plate structures.
- The compact card keeps the player name as the headline and reduces metadata to a single value row.
- The standard card uses the wider two-column name/info plate.

### Hybrid Pages

Pages with a fixed grid on top and a scrollable list below use `listContent`.

```jsx
<PageShell listContent={<MyList />}>
  <PageShell.Slot cols={4}><Banner /></PageShell.Slot>
</PageShell>
```

Do not put long scrollable lists inside fixed-height slots.

---

## 2b. The Banner System

Every major page begins with a `4x1` banner in the first `PageShell.Slot`.

Banner anatomy:
- giant ghost word
- oversized headline
- editorial support line (subtitle) — optional, not every banner needs one
- a control strip, if the page has scope/filter controls at all

**Standard locked 2026-07-29** (superseding the old right-aligned/translucent-pill pattern seen on the live Week Central, Games Hub, Schools, and Team Detail banners as of this date — those are not yet migrated, but any *new* banner work follows this):

- **Controls always stack below the title block. Never right-aligned, never floated beside the title.** The old side-by-side "title left / controls right" layout is retired.
- **The control strip is a real structural part of the card, not an inset pill floating over the gradient.** It's a genuine full-width flex child with its own solid background — not `position: absolute` margin/padding tricks pretending to be flush.
- **The strip is opaque, never translucent.** Prefer a warm near-black that shares an undertone with the hero gradient (e.g. gradient fading into the exact strip color at its final stop) so the strip reads as a continuation/shadow of the hero, not an unrelated block bolted underneath. If the gradient's angle still leaves a visible seam on one side, mark it with a deliberate top border rather than leaving an accidental hard cut.
- **Individual controls (pills/dropdowns) use a solid color distinct from the strip's own background**, so each one reads as a clickable thing rather than blending into the strip.
- **Controls are real, not decorative.** A dropdown must actually be a dropdown — build a themed custom listbox (see `ControlPill`/`Dropdown` in `src/components/organisms/test/PlayerAnalyticsBannerConcepts.js` or `HubBannerRedesigns.js`), never a native `<select>` (unstyleable cross-browser) and never static label+value text pretending to be interactive.
  - Dropdown panels must be rendered via a **portal to `document.body`**, positioned from the trigger's measured `getBoundingClientRect()`. Banner cards use `overflow: hidden` for their rounded-corner gradient clipping, which will silently clip any panel that isn't portaled out.
  - Position measurement happens synchronously inside the click handler — do **not** reach for `useEffect` to measure/reposition (see `AGENTS.md`'s useEffect ban). Outside-click-to-close uses a full-screen invisible backdrop `Box`, not a `document` event listener.
  - A small fixed set of mutually-exclusive options (e.g. a conference filter) reads better as segmented pill buttons than a dropdown — use judgment, don't force everything into the same control shape.
- **The ghost word must be physically contained to the title region**, not the whole card. Wrap it and the title together in their own `position: relative; overflow: hidden` box. Two reasons: (1) at the sizes this system wants now (see below), an uncontained ghost word will visually bleed into the control strip; (2) `position: absolute` children with `z-index: 0` paint *above* static in-flow siblings by default CSS stacking rules — an uncontained ghost word sitting near the strip can appear to render on top of it, making an actually-opaque strip look transparent. Containment fixes this at the source; give the strip `position: relative; z-index: 2` too, as a belt-and-suspenders safety net.
- **Ghost word sizing has been revised up.** Earlier examples on this page (Week Central, Games Hub, Schools) undersize it — the standard now is large enough to feel like a genuine background presence behind the title, not a small corner accent. Reference `clamp(6rem, 18vw, 13rem)` as a starting point.
- **Title is vertically centered** within its title-area box, not top-pinned — give the title-area box `flex: 1; display: flex; flex-direction: column; justify-content: center`.

Visual rules (unchanged):
- ghost word stays low opacity
- headline uses clamp sizing
- supporting text stays compact and uppercase
- banners should feel cinematic, not utility-first

**Shared production module:** `src/components/organisms/BannerControls.js` — `BannerGhostWord`, `BannerTitleArea`, `BannerControlStrip`, `BannerDropdown`, `BannerSegmentedPills`, `BannerIconButton`, `BannerActionButton`, `BannerTogglePill`. All production banners built to this standard import from here — don't re-implement a portal dropdown or a control strip per banner.

**Migrated to this standard and live in production (as of 2026-07-30):**
- Player Analytics — `PlayerAnalyticsBanner.js` (first production banner built directly to this standard; the page had no banner/`PageShell` at all before)
- Games Hub — `GamesHubBanner.js`
- Week Central — `WeekCentralBanner.js`
- Schools — `BannerPages.js`'s `BannerSchools` export (standalone; does not use that file's older shared `BannerShell`)
- Team Detail — `BannerTeamDetail.js` (`BannerTeamDetailPage` for production, `BannerTeamDetail` for the Lab-cycling variant)
- Players Hub — `PlayersBanner.js` (no control strip: the page's scope controls live with the database section below, so a strip here would duplicate them — title area takes the whole card). Replaced `test/BannerPlayer.js`, a mock player-detail concept that was standing in as a placeholder; that file stays in `test/` as reference for a future player-detail banner.

Origin/Lab work for the above: `src/components/organisms/test/PlayerAnalyticsBannerConcepts.js` (#1503–#1504), `HubBannerRedesigns.js` (#1505–#1507), `BannerTeamDetailRedo.js` (#1508) — kept for reference, superseded by the production versions above.

**Not yet migrated — still the old right-aligned/translucent pattern:**
- `BannerGameCenter`
- `BannerSchedule`
- `BannerPages.js`'s shared `BannerShell` and its other consumers (`BannerTeamSchedules`, `BannerStandings`, `BannerRostersHub`, an unused alt `BannerGamesHub` export) — deliberately out of scope for the 2026-07-30 pass, see the Banner System Design Doc §4
- `GameBannerScoreboardA` (Game Page) — template classification undecided, see Banner System Design Doc §1

Full migration status and template breakdown: `src/components/organisms/test/4-1md/Banner System Design Doc.md`.

---

## 2c. Text Style System

Use named text styles from `src/theme/index.js`. All headers must follow **Fluid Editorial Typography** rules.

Rules:
- Use **Fluid Sizing**: Implement headers using `fontSize={clamp(...)}` tokens where possible.
- Apply **Negative Kerning**: Display faces should use `letterSpacing="-0.02em"` or tighter.
- **Semantic Uppercase**: Kickers and labels should be technically transformed to `uppercase`.

Common text styles:
- `bannerHeadline`
- `bannerGhost`
- `heroStat`
- `kicker`
- `panelLabel`
- `editorial`
- `cardTitle`
- `statLabel`
- `pill`
- `bodySecondary`

Color is always separate from text style.

---

## 2d. Responsive Design & Component Philosophy

### CRITICAL MANDATE: Absolute Ban on Hardcoded Pixel Sizing (px & fixed rem)

Going forward, hardcoding absolute size metrics for ANY visual property is strictly forbidden. This applies to component heights, widths, padding, margins, border radii, and especially typography.

*   **Why Fixed Pixels are Banned**: Static layout elements break on smaller screens, overlap during browser scaling, and look miniature or cramped on ultra-wide monitors.
*   **The "Static rem" Anti-Pattern**: Do NOT bypass this rule by dividing a pixel value by 16 and hardcoding it as a decimal `rem` (e.g. `fontSize="0.438rem"` to represent `7px`). Static `rem` values act exactly like static pixels and do not scale dynamically with the viewport width.
*   **Mandatory Responsive Design Patterns**:
    1.  **Fluid Typography with `clamp()`**: All text sizes must use fluid CSS equations: `clamp(minSize, preferredSize, maxSize)` leveraging viewport width (`vw`) units. Example: `fontSize="clamp(1.5rem, 2.2vw, 2.125rem)"`.
    2.  **Relative / Percentage / Proportional Dimensions**: Use percentage widths (`w="32%"` or `w="50%"`), grid fraction units (`1fr`), flex layouts (`flex={1}`), and full fills (`w="full" h="full"`).
    3.  **Responsive Layout Reflow**: Outer structures must adapt their flex directions using responsive breakpoints: e.g., `direction={{ base: "column", lg: "row" }}` so that side-by-side elements stack naturally on tablet/mobile rather than compressing.
    4.  **Flexible Spacing**: Paddings and margins should breathe fluidly: e.g., `p="clamp(0.5rem, 1vw, 1rem)"` or use standard Chakra theme token arrays (`p={{ base: 2, md: 4 }}`).

Every component is a **contract** that specifies how it adapts across viewports. This contract must be documented before implementation.

### Viewport Breakpoints

All components follow these breakpoints. Do not create custom breakpoints per component.

| Mode | Range | Use |
|------|-------|-----|
| normal | 1024px+ | full desktop experience |
| compact | 768px–1024px | tablet/narrow desktop |
| mobile | 0–768px | phones (future — not yet implemented) |

### Component Philosophy Contract

Every component must document this at the top of the file:

```jsx
/**
 * ConferenceIdentityPassportCard
 * 
 * PHILOSOPHY:
 *   Purpose: Display conference record, champion, leadership, key facts
 *   Grid slot: 2×1 (or specify where it lives)
 * 
 * CONTENT TIERS (Responsive Behavior):
 *   Essential (always show):     logo, conference name, win-loss record
 *   Nice-to-have (normal/compact): facts grid, champion block, carousel animation
 *   Fluff (drop at mobile):      gradient overlays, secondary watermarks, hover effects
 * 
 * TYPOGRAPHY SCALING:
 *   Heading: 24px (normal) → 18px (compact) → 14px (mobile) — use rem-based, not px
 *   Label: 10px (normal) → 9px (compact) → 8px (mobile)
 *   Rule: Never hardcode px; scale via `clamp()` or responsive arrays
 * 
 * COMPONENT SIZING:
 *   Grid/flex: Use `%` widths, `fr` tracks, `clamp()`, responsive props
 *   Padding/gap: Scale with `clamp()` — e.g., `clamp(0.5rem, 2vw, 1rem)`
 *   At compact: Elements stack or reflow; preserve readability first
 *   At mobile: Not yet implemented; future placeholder
 *   Rule: Never hardcoded px for primary layout
 * 
 * CONTENT REDUCTION (mobile):
 *   Drop: Secondary stats, animations, optional fields
 *   Simplify: Shorten labels (16 chars → 12 chars → 8 chars abbreviation)
 *   Reflow: 2-column grid → 1 column stack
 */
```

Rules:
- **Every new component must fill this contract before coding.**
- **Contractors should agree on the contract with the designer before implementation.**
- **The contract lives as a doc block in the component file.**
- **When a component breaks across viewports, check if it violated its own contract.**

---

For interactive modules, establish **Fixed Interface Controls** (the chrome) first.

Chrome means:
- title row
- selectors
- tabs
- fixed controls

Then let content scroll beneath it.

```jsx
<Box h="full" display="flex" flexDirection="column" overflow="hidden">
  <Flex flexShrink={0}>{/* chrome */}</Flex>
  <Box flex={1} overflow="auto">{/* content */}</Box>
</Box>
```

Controls should not scroll away.

---

## 3b. Hub View Switching Pattern

**FUTURE DECISION PENDING**: Top-level hub routing vs. Supabase fetch strategy is not yet decided. This section reflects current practice and will be revisited when backend integration happens.

Current rule:
- Use URL routing for top-level hub changes (`/teams/:id/schedule` → different hub).

Good examples:
- list vs calendar view **within** Schedule Hub (local state)
- dashboard vs profile **within** Team Detail Hub (local state)

Avoid:
- route churn for every view toggle inside a hub
- remounting large hub content just to switch views

**Note for later**: When Supabase is integrated, some views may need true routes for URL-shareable deep links and server-side filtering. This decision will be documented in a separate routing architecture doc.

---

## 4. Component Architecture

Prefer shell/content separation.

- shell handles layout, chrome, spacing, interaction frame
- content handles the specific data rendering

Store IDs, not full duplicated objects. Derive objects from the data source.

Use sub-tabs when a module is too dense for one view.

---

## 4b. Page File Architecture

**Pages are the orchestration layer.**

A page file (`src/pages/`) owns:
1. `PageShell` slot arrangement — which slot gets `cols`, `rows`
2. Top-level routing decisions — which hub/tab to render based on URL
3. Top-level data calls when the entire page depends on a single query result (e.g. `useTeam(teamId)`)
4. Loading and error states at the page level
5. Conditional rendering between major hubs or views

There is no line count rule. A page file can be long if it is doing real orchestration work. What matters is the type of work, not the size.

### What Does NOT Belong in a Page File

| Anti-pattern | Move it to |
|---|---|
| Inline component definitions (`const MyCard = () => ...` inside the page) | `organisms/` or `molecules/` |
| Raw data transformation and aggregation | `hooks/` or `utils/` |
| `useState` for component-level UI (open menus, hover states) | the component itself |
| Business logic buried in JSX | a hook or util |
| Shared context providers | `organisms/{domain}/Provider.js` |

A page that has grown into a 1,000-line monolith owning every card, all data transformation, and inline component definitions is the problem — not page length itself.

### The Correct Shape of a Page File

```jsx
// src/pages/SomePage.js
import PageShell from '../components/layouts/PageShell';
import SomeBanner from '../components/organisms/some/SomeBanner';
import SomeCard from '../components/organisms/some/SomeCard';

const SomePage = () => (
  <PageShell>
    <PageShell.Slot cols={4}><SomeBanner /></PageShell.Slot>
    <PageShell.Slot cols={2}><SomeCard /></PageShell.Slot>
  </PageShell>
);

export default SomePage;
```

Components handle their own data fetching or use a page-scoped hook (e.g., `useGameCenterHubData`).

### Current Game Center Refactor Pattern

The Game Center pages are being moved toward thin page shells backed by page-scoped hooks and pure model utilities.

Current accepted structure:

```txt
src/pages/game-center/SomePage.js
  PageShell slots, banner/grid composition, loading/error placement

src/hooks/useSomePageData.js
  page state, React Query calls, shared current-season defaults, memoized model build

src/utils/somePageModel.js
  team lookup maps, schedule/game adapters, filtering, grouping, preview/final state rules
```

Completed examples:
- `GamesHubPage.js` uses `useGamesHubData` + `gamesHubModel`.
- `TeamSchedulePage.js` uses `useTeamScheduleData` + `teamScheduleModel`.
- `SeasonSchedulePage.js` uses `useSeasonScheduleData` + `seasonScheduleModel`.

Rules:
- Keep pages visual and shallow.
- Put state/query/model assembly in hooks.
- Put reusable schedule/game derivation in `src/utils/*Model.js`.
- Do not rebuild team maps, week windows, or schedule adapters inside JSX.
- Use the shared football current-context file for default season/week instead of hardcoding page defaults.

### Handling Seasonal Data Gaps

When a page depends on seasonal data (e.g., Game Center), the logic must account for the off-season or pending schedules.

Rules:
- **Detect Empty States**: Hooks should return an `isEmpty` flag if the data file is valid but contains no records.
- **Preserved Chrome**: Always render the banner and navigation elements (like season selectors) even when data is missing.
- **High-Fidelity Placeholders**: Use a dedicated `OffSeasonMessage` or themed placeholder component inside a `PageShell.Slot` instead of showing empty cards or generic error messages.
- **Defensive Property Access**: Use optional chaining or guard clauses when calculating "Hero" stats or featured items that may not exist in a pending schedule.

If the page needs a top-level data call that all children share, pass it via a Context Provider — not via prop drilling through every slot.

### Shared Map Assets And Simple Maps

Maps are reusable visual primitives, not one-off card decorations.

Source:
`src/components/molecules/maps/`

Current shared exports:
- `StateShape` from `src/components/molecules/maps/StateShape.js`
- `STATE_FIPS`
- `US_STATES_GEO_URL`

Use `StateShape` whenever a card needs an individual state cutout:

```jsx
import { StateShape } from "../maps";

<StateShape state="TX" fill={team.colors.primary} />
```

Rules:
- **Do not hand-position individual states** inside feature cards. No per-state `center`, `scale`, or magic projection values in the card component.
- **Use the shared primitive**. `StateShape` fits the requested state into its own SVG viewBox with `react-simple-maps` and `d3-geo`.
- **Cards own layout, map primitives own geometry**. Roster, rankings, recruiting, and wiki cards should pass `state`, `fill`, `stroke`, and sizing through their own layout containers.
- **Full US maps still use `ComposableMap` directly** when the whole country is the visual. Use `US_STATES_GEO_URL` and `STATE_FIPS` from the shared maps module so every map reads the same geography source.
- **State cutouts should float cleanly**: no fake mini-map background, no bottom color band, no manually cropped geography unless the component is intentionally editorial.
- **SVG color values must be raw colors**, not Chakra tokens. Use team colors from `teams.json` or raw hex/rgba values.

Reference implementation:
`src/components/molecules/roster/RosterHubCards.js`

The recruiting geography card uses:
- top-three state cutouts via `StateShape`
- a full US heat map via `ComposableMap`
- remaining state chips below the map

### Shared Football Current Context

All football pages that need a default season/week must read from:

```txt
public/data/0-data/football_current_context.json
src/hooks/useFootballCurrentContext.js
```

This file is the reset reference point for the app. During the season, the data pipeline should update it once per week after games are processed.

Current default intent:
- `current_season`: `2026`
- `current_week`: `0`
- `phase`: `offseason`

Rules:
- Do not hardcode active season/week in individual pages.
- Use this context before falling back to `GAME_CENTER_DEFAULT_SEASON`.
- A route param or user-selected season may override the shared default.
- Week Central, Game Center Hub, Games Hub, Team Schedule, and Season Schedule should all stay aligned to this reference point.

### Page State And Provider Pattern

For complex hub pages, use a page-scoped provider in `src/components/organisms/{domain}/`.

Best shape:

```txt
src/pages/game-center/WeekCentralPage.js
  layout shell only

src/components/organisms/game-center/week/WeekCentralProvider.js
  committed page state
  React Query calls
  memoized adapters
  context values/actions

src/components/organisms/game-center/week/WeekCentralBanner.js
src/components/organisms/game-center/week/WeekGameList.js
src/components/organisms/game-center/week/WeeklyBriefPanel.js
  render focused UI pieces
```

Rules:
- Store IDs and committed control values, not duplicated full objects.
- Page/hub state belongs in the provider: `season`, `week`, `selectedGameId`, filters, view mode.
- Tiny component-only state may stay local: open menus, hover state, collapsed/expanded card details.
- Do not put page state in Redux/Recoil unless there is a real cross-page workflow problem.
- Prefer React Query for server/cache state and Context/useState for page UI state.

### Committed Controls

Expensive page context changes should feel deliberate.

For season/week/team controls that trigger data loading:
- keep draft values locally in the banner/control component
- update committed provider state only when the user clicks `Go`
- React Query keys should use committed values only

Pattern:

```jsx
const [draftSeason, setDraftSeason] = useState(season);
const [draftWeek, setDraftWeek] = useState(week);

const commit = () => setQueryContext({ season: draftSeason, week: draftWeek });
```

Do not refetch a full page payload on every dropdown change.

### Context Rerender Control

A single giant context can cause unrelated components to rerender when one value changes.

Guidelines:
- Keep context values small and memoized.
- Split read contexts and action contexts when useful.
- Expose stable callbacks from providers with `useCallback` when passing them deep.
- Selected-row changes should rerender only the affected rows and the detail panel, not the whole page.

### React.memo For Repeated Rows

Use `React.memo` for repeated, mostly-static rows/cards such as game rows, schedule rows, and standings rows.

Purpose:
- clicking one game should not rerender every game row
- changing selected row should affect only the previous selected row, the next selected row, and the detail panel

Rules:
- Memoization only helps when props are stable.
- Avoid creating inline object props inside `.map()`.
- Prefer primitive props like `selected={game.id === selectedGameId}`.
- Keep row components pure; row components should not fetch data.

### File Placement Rule

| Layer | Path | Exports |
|---|---|---|
| Page shell | `src/pages/` | `export default` only |
| Production organisms | `src/components/organisms/{domain}/` | named + default |
| Lab/test variants | `src/components/organisms/test/` | named only, no default |
| Promoted molecules | `src/components/molecules/{category}/` | named + default |

---

## 5. Comparison Layouts

Choose one comparison model per component:

### Two-Column Face-Off
Best for:
- standalone KPIs
- side-by-side identity
- direct team contrast

### Unified Overlay Chart
Best for:
- magnitude comparison
- ranked lists
- bar charts
- shared scales

Do not mix both models in one cramped card unless there is a very strong reason.

---

## 6. Chart Sizing Rules

The most common failure is charts that are too small.

Minimum expectations:
- bars should feel readable, not hairline
- hero numbers should feel hero-sized
- spacing should breathe

When in doubt, make it bigger.

---

## 6b. Dense Stat Tables — The Restrained Language

Scope: this section governs **stat-heavy comparison content only** — box
scores, per-block production breakdowns, EPA/success-rate style panels,
season snapshots, anything whose job is "show a lot of real numbers at
once." It does not touch §1 or §6 anywhere else. A hero banner, a snapshot
identity card, a single headline moment still gets the magazine treatment —
biggest number wins, make it bigger. This section exists because applying
that same instinct to *every* number on a dense page is what made those
pages loud: five simultaneously-glowing hero tiles and a bar under nearly
every stat (including stats with no real min/max to scale against) compete
with each other until nothing reads as signal.

Reference: `src/components/organisms/test/PlayerCleanOverview.js` and
`PlayerCleanStatCard.js` are the worked examples. Both are still test
components living alongside the production page they're based on, not yet
swapped in — `src/components/organisms/player/PlayerStatsOverview.js` is
the "before" this section is reacting to, kept in place until a decision is
made to replace it.

Rules:

- **One accent color per card, spent once** — a 3px tick beside the card
  title. Never repeated as a fill color on every row; that's what made the
  old cards read as "orange means number" instead of "orange means this
  team/player."
- **Color is semantic only.** Green/red exist exclusively to mark a value's
  own sign (PAR positive/negative, a game's W/L) — never decorative.
  Percentages, counts, and physical measurables (height, weight, snap
  share) stay neutral text; there's no good/bad direction for them, so they
  don't get one.
- **No decorative bars.** A bar earns its place only when it plots a real
  range with real endpoints — a floor-to-ceiling spread with actual game
  markers on it, a real 0-100 percentile. A single value with no anchoring
  min/max does not get a fill-to-value gauge; it's a right-aligned number in
  a table row. When in doubt, it's a row, not a bar.
- **Comparatives are real or they're a dash.** A "vs. position avg" /
  "conf. percentile" column is a live `percentileOf()`-style computation
  against real peers — never a fabricated league-average placeholder. Render
  `—`, not a guess, when no real comparison source exists yet.
- **Card width follows row count, not a fixed full-width default.** A
  2-3 row table doesn't earn its own full-width band — pair short tables
  side by side in a grid instead of stacking every card at full width
  regardless of content. Full width is for a table that actually needs the
  room (many columns, many rows), not the default.
- **Never shrink data breadth to gain calm.** Restraint is a discipline on
  color, bars, and glow — not license to cut real stat categories. If a
  field has no real data source yet, show the row with `—`, don't omit it —
  the gap is real information (and a `BACKEND_PIPELINE_TODO.md`-worthy note),
  not something a cleanup pass gets to quietly delete.
- **A trend line gets one stroke, no area fill, no glow** — and keeps
  whatever context made the trend meaningful in the first place (opponent or
  week labels under it). A trend without what happened alongside it loses
  the reason it was worth charting.
- **"Notable game" / "signature moment" style picks are a backend
  weighting job, not a fixed frontend heuristic wearing curation's
  clothes.** Best-game-by-PAR and most-recent are honest, objective
  derivations; anything past that (which storyline actually matters this
  week) needs a real selection rule from the backend, the same as Game
  Center's `featured_games` does. If the frontend has to stand in with a
  placeholder, say so inline. Never frame one of these cards negatively
  (no "Worst Game") on a player's own page — a losing framing there reads as
  a knock on the player, not useful context.

---

## 7. Team Identity Rules

Always pull team identity from:
`src/data/teams.json`

Never hardcode team colors in production work.

Rules:
- primary and secondary come from `teams.json`
- logos come from `/assets/{exportId-without-25}.svg`
- use subtle opacity versions of team color for backgrounds
- secondary color is often better for data marks on dark backgrounds

Pattern for **Team Gradient Wash**:

```jsx
bg={`linear-gradient(135deg, ${team.colors.primary}33 0%, transparent 60%)`}
```

Always include a logo fallback path visually.

### Avatar And Logo Frame Rule

Identity avatars in game rows, player cards, roster cards, and lab concepts should default to square frames with rounded corners, not circles.

Rules:
- Use `borderRadius="lg"` or an 8px radius for avatar/logo frames.
- Keep the frame square with equal width and height.
- Use `objectFit="cover"` for player portraits and `objectFit="contain"` for team logos.
- Add a subtle border or dark translucent surface so white or light logos do not disappear.
- Reserve circular avatars only for a deliberate visual concept where the circle is part of the composition, not as the default.

### Avatar Image Mapping Rule
Always fetch player portraits and roster images dynamically using the structured `image_url` property directly from the player database/JSON object. 

Never parse image filenames (e.g. scanning folder hierarchies, suffixes, or raw filenames with regex) to build player search maps. Naming conventions across different school assets can vary (e.g., swapped First_Last vs. Last_First orders), which breaks regex lookups.

---

## 8. Data Rules

### For Test Components

Mock data must come from real files.

Approved sources:
- team identity -> `src/data/teams.json`
- schedule data -> `public/data/1-game center/schedules/by_year/{year}.json`
- game data -> `public/data/1-game center/games/{year}/{gameId}.json`
- roster analytics -> `public/data/2-schools/roster_hub_{year}.json`
- player portraits -> `public/data/3-players/player_seasons_{year}.json` when `image_url` exists
- enriched player context -> `public/data/0-data/player_stats_2025_enriched.json` when needed

Do not invent statistics.

If a player-led design uses a real player and a valid `image_url` exists, use it.
Only fall back when the join truly fails or the image is missing.

### For Production Components

Use shared data hooks from `src/hooks/useSWACData.js` or a page-level query flow.

Do not do ad hoc `fetch()` calls in random components if a shared hook or structured page query already exists.

Guard array access and optional nested structures defensively.

### Team Wiki Metadata

`src/data/teams.json` now contains wiki metadata for all 18 programs, including all 6 MEAC schools.

Rules:
- School wiki/profile UI should read institutional fields directly from `teams.json`.
- Do not duplicate MEAC wiki copy in page components.
- Do not use short external aliases such as `dsu`, `hu`, `msu`, `nsu`, or `scsu` as React route IDs. Existing route IDs remain `delaware-state`, `howard`, `morgan-state`, `norfolk-state`, and `sc-state`.
- Preserve `exportId` and logo conventions when adding or editing school metadata.

### Server State, Fetching, And Page-Ready Payloads

React Query is the preferred tool for server/cache state.

Use React Query for:
- current JSON exports
- future Supabase calls
- loading/error/cache/refetch behavior
- sharing fetched results within a page/hub

Do not use Redux/Recoil for fetched data unless the project has a clearly documented cross-page state problem. React Query should remain the data boundary.

Preferred fetch style for page hubs:
- one committed query per page context where practical
- query keys use committed values, not draft dropdown values
- backend/Supabase returns page-ready shapes
- frontend adapters are thin defensive normalizers, not deep reconstruction engines

Example:

```txt
week_central_week_payload(season, week)
```

Expected behavior:
- controls hold draft `season` / `week`
- `Go` commits those values
- React Query refetches `["week-central", season, week]`
- response contains the selected week's visible games and embedded brief data
- clicking games changes client selection only and does not hit the database again

### useMemo And Derived Models

Use `useMemo` for derived page models that are expensive or shared:
- filtering current week games
- adapting raw payloads into UI models
- grouping standings rows
- building lookup maps
- deriving selected game objects from IDs

Rules:
- Derive once in provider/organism code, not repeatedly in JSX.
- Avoid `array.filter().map().sort()` chains directly inside render.
- Keep `useMemo` dependencies precise and stable.
- Do not use `useMemo` to hide side effects; it is only for pure derivation.

### Backend Shape Responsibility

Every page design doc must explicitly list:
- fetch boundary / function name
- top-level payload fields
- nested row/card shapes
- fallback/mock source markers
- warnings/data quality shape

Production components should receive stable objects such as:

```json
{
  "game_id": "W15pvamujsu",
  "home_team": { "team_id": "swacjsu", "name": "Jackson State", "score": 27 },
  "away_team": { "team_id": "swacpvamu", "name": "Prairie View A&M", "score": 23 },
  "brief": { "source": "parsed", "metrics": [], "leaders": [] }
}
```

The frontend may guard missing fields, but it should not have to parse display strings, rebuild sides, infer winners, or extract a brief from a full game file for normal page rendering.

---

## 9. Chakra v3 Technical Rules

### Animations

Use:

```jsx
style={{ animation: "pulse 2s infinite" }}
```

Do not rely on:

```jsx
sx={{ animation: "..." }}
```

### Keyframes

Inject via `<style>` tags with unique names per component.

### SVG Colors

Do not use Chakra tokens inside raw SVG nodes.
Use raw hex or rgba.

### Gradients

Direct CSS gradients in Chakra props are allowed.

### Height Distribution

In vertical lists, use flex-based distribution when equal row rhythm matters.

---

## 10. What Not To Do

- No monolithic components when shell/content separation is obvious
- No hardcoded production team colors
- No invented mock data
- No `useEffect` in production components
- No `export default` in test files
- No broken imports in the lab registry
- No tiny unreadable charts in large slots
- No fixed pixel heights on component roots inside `PageShell`
- No Chakra tokens inside SVG attributes
- No `sx={{ animation }}` for motion styling
- No imperative sidebar registration pattern
- No loading state that changes the overall layout shell and causes thrash

---

## 11. Standard Color Mappings

### Class Year Colors

```js
const CLASS_COLORS = {
  "Fr.": "#c53030",
  "So.": "#dd6b20",
  "Jr.": "#d69e2e",
  "Sr.": "#2c7a7b",
  "Gr.": "#276749",
};
```

### Transfer Tier Colors

```js
const TIER_COLORS = {
  "FBS": "#3182ce",
  "FCS": "#2c7a7b",
  "JUCO": "#dd6b20",
  "D2/D3/NAIA": "#d69e2e",
};
```

---

## 12. Forbidden Components & Version Policy

Never use:
- `Divider`
- deprecated Chakra components
- components not supported by the installed Chakra v3 version

For simple separators, use a `Box` line instead.

---

## 13. Component Lab Rules

The Component Lab at `/lab/components` is the only place new UI components are built and reviewed before production.

### Current Lab Behavior

The current lab behaves like a registry gallery.

- every registered entry renders automatically
- every entry renders inside a slot sized like live `PageShell`
- registry curation matters

If a design pass is focused on one problem, it is acceptable to temporarily reduce the active registry to only that experiment set.

### Registry Contract

Every test component must be registered in:
`src/components/organisms/test/componentLabRegistry.js`

Required fields:

```js
{
  number: 101,
  name: "Game Center Hub Featured Games - Variant A",
  agent: "Codex",
  date: "2026-04-22",
  size: "4x1",
  component: MyNamedExport,
}
```

### Strict Registry Process

The registry is fragile because one bad import or malformed object crashes the entire Component Lab. Treat registry edits as production-critical.

Required process before editing `componentLabRegistry.js`:

1. Open the component file you intend to register.
2. Confirm the exact named export with `rg "export const|export function" src/components/organisms/test/FileName.js`.
3. Confirm there is no `export default` in the test file.
4. Confirm the file lives in `src/components/organisms/test/`, not the repo root, not `pages/`, and not `legacy/`.
5. Pick a unique `number` by reading the current registry first. Never reuse a number.

Required registry structure:

```js
import { MyVariantA } from "./MyVariantA";
import { MyVariantB } from "./MyVariantB";

const registry = [
  {
    number: 101,
    name: "Page Context - Component Variant A",
    agent: "Codex",
    date: "2026-04-26",
    size: "4x1",
    component: MyVariantA,
    hideOverlay: true,
  },
  {
    number: 102,
    name: "Page Context - Component Variant B",
    agent: "Codex",
    date: "2026-04-26",
    size: "4x1",
    component: MyVariantB,
    hideOverlay: true,
  },
];

export default registry;
```

Hard registry rules:

1. All `import` statements must be at the very top of the file.
2. The only top-level values after imports are `const registry = [...]` and `export default registry`.
3. Never paste a registry object outside the `registry` array.
4. Never leave duplicate registry objects for the same component unless intentionally comparing separate wrappers.
5. Never import a component that has not been verified to exist.
6. Never import from `pages/`.
7. Never import from `legacy/` for new work.
8. Never import from the repo root. If another agent created a test file at the repo root, move/copy it into `src/components/organisms/test/` first.
9. Use ASCII punctuation in registry names. Prefer `-` over em dashes to avoid encoding churn.
10. Every registry entry must include `number`, `name`, `agent`, `date`, `size`, and `component`.

Required verification after every registry edit:

```sh
node -e "const fs=require('fs'); const parser=require('@babel/parser'); for (const file of ['src/components/organisms/test/componentLabRegistry.js']) { parser.parse(fs.readFileSync(file,'utf8'), { sourceType:'module', plugins:['jsx'] }); console.log(file + ': parse ok'); }"
```

If you added or changed test component files, include them in the same parse check:

```sh
node -e "const fs=require('fs'); const parser=require('@babel/parser'); const files=['src/components/organisms/test/componentLabRegistry.js','src/components/organisms/test/MyVariantA.js']; for (const file of files) { parser.parse(fs.readFileSync(file,'utf8'), { sourceType:'module', plugins:['jsx'] }); console.log(file + ': parse ok'); }"
```

If the parse check fails, fix the registry before doing anything else. Do not leave the Component Lab broken.

### File Rules

1. One file per component variant.
2. Named exports only. No default exports from test files.
3. File naming: `{PageContext}{ComponentName}{Variant}.js`
4. Files live in `src/components/organisms/test/`
5. Keep the active registry coherent during a focused review pass.

### Mock Data Rules

1. Use real data only.
2. Define mock data clearly at the top of the file.
3. Show meaningful states.

For example:
- final + preview states side by side
- or a `4x1` gallery that contains four `1x1` cards if the design problem is the full row composition

### Test Components Must Not

1. Fetch data
2. Import from page files
3. Use `useEffect`
4. Trigger navigation side effects
5. Break the registry

### Game Center Featured Card Guidance

For `/game-center` featured-card exploration:
- the production target is a `1x1` card
- the lab entry may still be `4x1` if it is showing the full featured row
- test both completed and preview states
- use real team identity, real game context, and real player identity when available

Current accepted directions:
- safe scoreboard-first
- logo-dominant
- player-led `QB vs QB` / `Glory Player`
- oversized watermark split-background

### Graduation Rule

When a component wins:
1. move the inner component into production code
2. replace mock data with real props/data flow
3. wire it into the page
4. keep the lab file for future comparison history

---

## 13b. Page Lab Rules

The Page Lab at `/lab/pages` is for reviewing full-page experiences at fixed content widths, not individual cards or modules.

### Viewport Sizes

The Page Lab renders pages at two content widths that match the actual sidebar-constrained layout:

| Mode | Content Width | Viewport Equivalent | Use |
|------|--------------|---------------------|-----|
| Compact | 768px | 1024px (768 + 255px sidebar) | Tablet / narrow desktop with sidebar |
| Normal | 1200px | 1455px (1200 + 255px sidebar) | Full desktop with sidebar |

The sidebar is always 255px at `lg` breakpoint and above. The Page Lab renders the sidebar context so components see the real constrained width.

### How It Works

- Two fixed-width containers side by side (or stacked)
- Each container renders the selected page component directly (no iframes, no routes)
- A selector chooses which page component to test
- The component receives mock data/props as needed

### Registration

Pages are registered in `src/pages/PageLab.js`:

```js
const REGISTERED_PAGES = [
  {
    label: "Game Page",
    component: GamePage,
    props: { gameId: "W15pvamujsu" },
    notes: "Full game experience with banner, tabs, and packet content",
  },
];
```

### Rules

1. Import the page component directly into `PageLab.js` — no iframes, no route simulation
2. Pass mock data/props through the registration object
3. Do not mount page experiments inside Component Lab
4. Do not create new routes just for Page Lab
5. If the page needs data, provide it via props or mock constants in the registration

---

## 14. Dev Loop Verification

This is a React / Create React App project with hot reload during local visual work.

For Component Lab and Page Lab iteration:
- saving a file is enough for the browser preview to refresh
- assume the React dev server is already handled by the user or current workspace
- do not run `npm start`, `npm run start`, dev server startup commands, or alternate-port server commands unless the user explicitly asks
- do not run `npm run build` after every visual edit
- do not run `npm run build` for normal lab/component exploration unless the user asks or there is a specific syntax/runtime issue that cannot be checked another way
- use the existing browser/dev-server preview for normal design feedback

This keeps the design loop fast and avoids interrupting active React sessions with unnecessary server or build commands.

---

*Last updated: 2026-05-04 | Codex*
