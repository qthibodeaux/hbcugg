# Component Lab — Process Guide for Agents

**Read this entirely before writing a single line of code.**

---

## What We Are Building

This project is an HBCU football data platform. We build UI components in isolation first ("test" components), review them visually in a Component Lab page at `/lab/components`, and only promote the winner to the live page once approved by the user.

**Never build directly into a live page. Always go: Test File → Component Lab → Live Page.**

---

## Team Data — Source of Truth

### Static Team Metadata
**File:** `src/data/teams.json`

This is the authoritative source for team identity. Always pull names, colors, mascots, and IDs from here — never hardcode them.

Key fields per team:
```json
{
  "id": "jackson-state",
  "exportId": "swacjsu25",
  "name": "Jackson State",
  "shortName": "JSU",
  "mascot": "Tigers",
  "conference": "SWAC",
  "division": "East",
  "city": "Jackson",
  "state": "MS",
  "colors": {
    "primary": "#002147",
    "secondary": "#FFFFFF",
    "accent": "#4A90D9"
  },
  "logo": "/assets/swacjsu.svg"
}
```

**ID conventions:**
- `id` — hyphenated slug (e.g., `"jackson-state"`) — used in React Router URLs
- `exportId` — JSON data key with year suffix (e.g., `"swacjsu25"`) — used in v2 player/analytics JSON
- v5 teamId = exportId without the "25" (e.g., `"swacjsu"`) — used in coaching trees, continuity, roster_hub JSON

### The 18 Programs (as of 2025)

**SWAC (12 teams):**
| shortName | exportId | Primary | Secondary |
|-----------|----------|---------|-----------|
| Alcorn | swacalc25 | #5C068C | #FFD100 |
| AAMU | swacaamu25 | #660000 | #FFFFFF |
| ASU | swacasu25 | #000000 | #FFC72C |
| BCU | swacbcu25 | #6F2633 | #F3A41E |
| FAMU | swacfamu25 | #006747 | #F4811F |
| JSU | swacjsu25 | #002147 | #FFFFFF |
| MVSU | swacmvsu25 | #046A38 | #FFFFFF |
| PVAMU | swacpvamu25 | #4B0082 | #FFB81C |
| SU | swacsu25 | #004D40 | #FDB913 |
| TSU | swactsu25 | #6F2633 | #A2AAAD |
| UAPB | swacuapb25 | #000000 | #FFD100 |
| Grambling | swacgsu25 | #000000 | #FDB913 |

**MEAC (6 teams):**
| shortName | exportId | Primary | Secondary |
|-----------|----------|---------|-----------|
| DSU | meacdsu25 | #EE3124 | #0077C8 |
| HU | meachu25 | #003A63 | #E31837 |
| MSU | meacmsu25 | #002D72 | #FFA300 |
| NCCU | meacnccu25 | #8A1538 | #A89968 |
| NSU | meacnsu25 | #007A5E | #FFC72C |
| SCSU | meacscsu25 | #900027 | #002B54 |

**Do not invent teams or use stale conference membership.** NC A&T, Coppin State, and Bethune-Cookman are NOT in this dataset.

### Roster Hub Data
**Files:** `public/data/2-schools/roster_hub_2025.json` (and 2021–2024, and _all.json for multi-year)

This is the source for all roster analytics. Do not invent roster data — extract real values from these files for mock data in test components.

Top-level structure:
```
{
  "year": 2025,
  "total_players": 2083,
  "teams": { "swacjsu": { ...5 modules }, "swacfamu": { ... }, ... },
  "divisions": { "SWAC": { ... }, "MEAC": { ... } },
  "all": { ... }
}
```

Note: roster_hub keys use v5 format (no "25" suffix) — `"swacjsu"`, not `"swacjsu25"`.

The 5 modules per team: `composition`, `experience`, `physical`, `geographic`, `transfers`

See `public/data/2-schools/ROSTER_HUB_SCHEMA.md` for full field reference.

---

## Component Building Methodology

This is how components are built here.

### 1. Understand the Slot First

Before writing any JSX, ask: what is the slot size? That determines everything.

| Slot | Columns | Use | Root element |
|------|---------|-----|-------------|
| 4x4 | Full width, very tall | Comparator, Trend Studio | `w="full" h="full"` |
| 4x3 | Full width, tall | Experience Matrix, Transfer Board | `w="full" h="full"` |
| 4x2 | Full width, medium | Geographic, Team Entry Cards | `w="full" h="full"` |
| 4x1 | Full width, short | Command Header, CTA banners | `w="full" h="full"` |
| 2x2 | Half width, square | Standings, Rankings | `w="full" h="full"` |
| 1x1 | Quarter width | KPI cards, Utility rows | `w="full" h="full"` |

The component fills its slot. The slot provides the frame. **Never hardcode pixel heights on the root element** — use `w="full" h="full"` and let the parent `<Box h="Xpx">` in ComponentLab control the visual size.

### 2. Establish the Chrome First

"Chrome" = the outer shell that persists across content changes. For interactive components:
- Fixed header (team selectors, title, controls)
- Fixed tab/sub-tab bar
- Scrollable content area below

Pattern:
```jsx
<Box w="full" h="full" display="flex" flexDirection="column" overflow="hidden">
  {/* CHROME — fixed, never scrolls */}
  <Box flexShrink={0}>
    {/* header, selectors */}
  </Box>
  <Box flexShrink={0} borderBottom="1px solid" borderColor="whiteAlpha.100">
    {/* tab bar */}
  </Box>

  {/* CONTENT — scrolls */}
  <Box flex={1} overflow="auto">
    {/* tab content renders here */}
  </Box>
</Box>
```

This prevents the header from scrolling away and keeps controls always visible — critical for 4x4 and 4x3 components.

### 3. Design the Data Shape Before the UI

Before touching JSX, write out what fields you need from the data. Example for a Composition tab:
```
- composition.total_players
- composition.upperclass_pct
- composition.underclass_pct
- composition.position_distribution[] → group, pct
- composition.class_distribution[] → class, pct
```

Then build the UI around that exact shape. This prevents components that work visually but fail when real data is wired in.

### 4. Size Hierarchy in Charts

Small charts are a common failure. The correct approach:

**Bars:** Never use `h="5px"` for data bars in a 4x3+ component. Minimum 16px. Ideal 20–24px. Label the value inside or beside the bar.

**Numbers:** Hero KPI numbers should be `fontSize="3xl"` or larger. If a number is the story, make it the biggest thing on screen.

**Spacing:** Use `gap={4}` minimum between chart rows. Don't compress — the slot is large, use it.

**Sub-tabs over tabs:** If a module has too much to show at readable sizes, add a sub-tab layer (e.g., "Overview | By Position | Class Year") so each sub-view can use the full content area instead of splitting it 5 ways.

### 5. Two-Column vs Unified Chart Space

For comparison components, two approaches:

**Two-Column (Face-Off style):** Team A data on left, Team B data on right. Team colors dominate each half. Works best when values stand alone (big KPI numbers, donuts, pyramids). Use `flex={1}` on each side column.

**Unified Chart (overlay style):** Both teams rendered on the same chart, differentiated by color. Works best for bar comparisons where relative magnitude matters. Use `aColor` / `bColor` to differentiate bars in the same chart space.

Don't mix them randomly — pick one approach per tab and stay consistent.

### 6. State Management Pattern

For interactive components in test files:
```jsx
const [teamAId, setTeamAId] = useState('swacjsu');
const [teamBId, setTeamBId] = useState('swacfamu');
const [activeTab, setActiveTab] = useState(0);
const [subTab, setSubTab] = useState(0);

const teamA = MOCK_TEAMS[teamAId];
const teamB = MOCK_TEAMS[teamBId];
```

All derived values (the actual team objects) come from looking up the ID in the data dict. Never store the team object in state — store the ID and derive.

### 7. Mock Data in Test Files

**Rule: All mock data must come from the real JSON files.** Open `roster_hub_2025.json`, find the real values, copy them in. Do not invent numbers. Invented mock data masks real-world layout problems (columns too narrow for actual values, bar widths that work for fake % but not real ones, etc.).

**Format:** Inline in the same file, above the component exports.
```js
// MOCK DATA — extracted from roster_hub_2025.json
const MOCK_TEAMS = {
  swacjsu: {
    label: 'Jackson State', short: 'JSU', division: 'SWAC',
    primary: '#002147', secondary: '#FFFFFF',  // ← from teams.json, not invented
    composition: { ... },  // ← real values from roster_hub_2025.json
  },
};
```

Colors always come from `teams.json`. Roster stats always come from the roster_hub JSON.

### 8. Rendering Patterns — Common Gotchas

**Height distribution in lists:** If rows should fill the card height evenly, don't use fixed pixel heights on each row. Use:
```jsx
<Flex direction="column" h="full">
  {rows.map(row => (
    <Flex key={row.id} flex={1} align="center"> ... </Flex>
  ))}
</Flex>
```

**CSS animations:** Never `sx={{ animation: '...' }}` on Chakra components — unreliable in v3. Use `style={{ animation: '...' }}` (native prop).

**SVG colors:** Never `stroke="brand.500"` inside SVG. SVG requires raw hex or rgba. Always `stroke="#E53E3E"` or `stroke="rgba(229,62,62,0.5)"`.

**Keyframes:** Inject via `<style>` tag inside JSX, or `document.head`. Use unique names per component to avoid collisions (`radarPulse_comparator`, not `radarPulse`).

**Gradients:** `bg="linear-gradient(90deg, #002147 0%, transparent 60%)"` — Chakra `bg` accepts CSS gradient strings directly.

**Guard array access:** `state_distribution[0]?.count` not `state_distribution[0].count`. Real data can have empty arrays.

---

## The Three-Step Process

### Step 1: Create the Test Component File

All test/experimental components live in:
```
src/components/organisms/test/
```

**Rules for this folder:**
- One file per logical group (e.g. `ExperienceMatrix.js`, `TransferBoard.js`)
- All exports are **named exports** — never `export default`
- All mock data lives **inline** in the same file — do not import from external data files
- Mock data values must be extracted from the real JSON files (see above)
- All components must be self-contained and renderable with zero props
- Use `useNavigate` from `react-router-dom` for any navigation links
- **Never use `useEffect`** — use `useState` only. `useMountEffect` is permitted for DOM sync.

**File template:**
```js
import { useState } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';

// MOCK DATA — extracted from src/data/teams.json and public/data/2-schools/roster_hub_2025.json
const MOCK_TEAMS = { ... };

// Named export — never export default
export const MyComponentVariantA = () => {
  const [tab, setTab] = useState(0);
  return ( ... );
};

export const MyComponentVariantB = () => {
  return ( ... );
};
```

---

### Step 2: Add to Component Lab

The Component Lab page lives at:
```
src/pages/ComponentLab.js
```

It renders at `/lab/components`.

**Rules for ComponentLab.js:**
- Import ONLY named exports that actually exist in the test file — grep first
- Never import a component and leave it unused
- Each variant gets a label in this exact format:
  ```
  ##. VARIANT NAME — Short description [Agent Name | YYYY-MM-DD]
  ```
- Number variants sequentially — check the current highest before adding
- Wrap each variant in `<Box h="Xpx">` at a realistic display size

**Height guide by slot:**
- 4x1 → `h="200px"`
- 4x2 → `h="400px"`
- 4x3 → `h="600px"`
- 4x4 → `h="680px"`
- 2x2 → `h="400px"`

**Before adding any import to ComponentLab.js:**
1. Run `grep -n "export const MyComponent" src/components/organisms/test/MyFile.js`
2. Verify the export name matches exactly
3. Never import a default export as a named import

---

### Step 3: Promote to Live Page (only after user approval)

Once the user picks a winner, import it into the relevant page. Remove all other variants from the import. Replace placeholder JSX entirely. Remove unused imports.

---

## Import Safety — The #1 Agent Mistake

Other agents repeatedly break the lab by importing components that don't exist. Pattern:
```js
// WRONG — ExperienceMatrix.js doesn't exist yet
import { ExperienceMatrixC } from "../components/organisms/test/ExperienceMatrix";
```

**Result:** The entire lab page crashes for everyone.

**Rule:** If you didn't create the file in this session, grep for the export before importing it.

**Rule:** Never add `export default` to a file that uses named exports — it breaks the entire module.

**Rule:** Remove both the import AND the JSX if you remove a component. Leaving either causes errors.

---

## Chakra UI v3 Token Reference

| Token | Value | Use |
|-------|-------|-----|
| `bg.primary` | `#0B0B0D` | Page background |
| `bg.secondary` | `#141416` | Card/panel background |
| `text.primary` | `#F4F4F5` | White text |
| `text.secondary` | `#A1A1AA` | Light gray |
| `text.muted` | `#71717A` | Muted gray |
| `brand.500` | `#E53E3E` | Platform red |
| `whiteAlpha.100` | rgba(255,255,255,0.06) | Subtle borders |
| `whiteAlpha.200` | rgba(255,255,255,0.12) | Hover states |

---

## Current Component Lab State (as of 2026-04-12)

| # | Name | File | Slot | Status |
|---|------|------|------|--------|
| 18–20 | Roster Command Header A/B/C | RosterCommandHeader.js | 4x1 | Testing |
| 21–23 | Roster Comparator A/B/C | RosterComparator.js | 4x4 | Testing (other agent) |
| 25–27 | Comparator Alt A/B/C | RosterComparatorLab.js | 4x4 | B = winner |
| 31–33 | Experience Matrix variants | ExperienceMatrix.js | 4x3 | Testing (other agent) |

**Next build targets (Comparator section):**
- Promote Face-Off (B) winner
- Add Variants D and E with sub-layer drill-down

**Next build targets (Roster Hub):**
- TransferBoard — 4x3
- PhysicalLab — 4x3
- TrendStudio — 4x4

---

## Where Things Live (Quick Reference)

```
src/
  data/
    teams.json                  ← AUTHORITATIVE team names, colors, mascots, IDs

  components/organisms/test/   ← ALL lab component files
    RosterComparatorLab.js      ← Comparator variants
    RosterCommandHeader.js      ← Command header variants
    RosterComparator.js         ← Comparator variants (other agent)
    ExperienceMatrix.js         ← Experience matrix variants (other agent)
    UtilityRowLab.js            ← Roster/Coaches/StatLab utility row cards

  pages/
    ComponentLab.js             ← Lab page at /lab/components
    teams/
      md/
        Component Lab Process.md    ← THIS FILE
        Roster Hub Design Doc.md    ← Full Roster Hub spec

public/
  data/
    2-schools/
      roster_hub_2025.json      ← Primary roster data (all 18 teams, 5 modules)
      roster_hub_all.json       ← Multi-year data (2021–2025) for Trend Studio
      ROSTER_HUB_SCHEMA.md      ← Full field reference for roster hub data

  assets/
    swacjsu.svg, swacfamu.svg...  ← Team logos — referenced as "/assets/{exportId without 25}.svg"
```

**Logo URL pattern:** `/assets/swacjsu.svg` — take the exportId, remove the "25", that's the asset filename.

---

*Last updated: 2026-04-12*
