# Page Design Specification Template

**Usage:** Copy this template for every new page hub. Fill in sections 1-6 with product requirements. Sections 7-9 document implementation and backend contracts.

Updated: 2026-04-06  
Purpose: A repeatable workflow that lets agents build pages directly from specifications, with static anchors plus dynamically-scored card rotation.

## 1. Why This Exists

This doc is the **contract between product intent and implementation**.

It standardizes:
- What is fixed vs what rotates on the page
- How dynamic cards are scored and selected
- How slots are predictably filled
- Code and backend behavior expectations

Use this template for every page/hub. It ensures consistency and lets agents build without re-deciding structure.

**This is a template pattern — copy and customize for your page.**

## 2. The Core Model

Each page dashboard is built from **two card classes**:

### Static Anchors
- Always rendered, same position every visit
- Examples: hero banners, search controls, mandatory reference tables
- No scoring; simply placed first

### Dynamic Candidates
- Compete for remaining open slots
- Selected by Why Engine scoring algorithm
- Same slot footprint but different card type/content depending on data
- Rotated by backend-computed scores and diversity guards

The page reads a **Why Manifest** (JSON from backend) that names which cards fill which slots. Page then maps manifest → slot layout → component render.

## 3. Layout Rules (Locked)

These rules apply to **all pages** using this template:

1. **Grid Dimensions via Slot Spans Only**
   - Use predefined slot types: `Slot1x1`, `Slot2x1`, `Slot2x2`, `Slot4x1` (or layout-specific variants)
   - Each slot defines its row/column span via `rowSpan` and `colSpan` props
   - **Never** simulate slot size with card-level `minHeight` or other height hacks

2. **Card Components Are Render-Only**
   - Cards accept `data` + `onClick` props
   - Cards do NOT control their container dimensions
   - Layout integrity is preserved by container slots, not component styling

3. **Modular, Compositional Architecture**
   - Page file: orchestration layer only (50-200 lines)
   - Card files: render functions (50-150 lines each)
   - Shared utilities for common card patterns (charts, tables, narratives)

4. **Banner/Utility Controls Are Page-Level**
   - Search, filters, view toggles live in separate banner components
   - Banner actions dispatch route changes or filter state
   - Page re-renders on route param change; manifest is recomputed by backend

## 4. Selection Pipeline (Why Engine)

### 4.1 Score Inputs (Recommended)

Each candidate card gets a normalized score (0-100) from weighted factors:

- importance_score
- recency_score
- rivalry_score
- ranking_impact_score
- variance_score (upset/comeback/volatility)
- identity_score (HBCU narrative relevance)
- freshness_penalty (prevents same card repeating too often)

### 4.2 Score Formula

Use a weighted sum:

$$
S = \sum_i w_i f_i - P_{freshness}
$$

Where:
- $f_i$ are normalized factor scores
- $w_i$ are page-tuned weights
- $P_{freshness}$ is repeat-appearance penalty

### 4.3 Slot Fill Order

1. Place all static anchors first.
2. Build candidate pool for remaining slots.
3. Rank by score desc.
4. Apply diversity guardrails:
- max 2 cards from same game
- max 2 cards from same team
- at least 1 schedule-context card when available
5. Fill remaining slots in deterministic order.
6. If insufficient candidates, use fallback card family.

## 5. Page Specification Template

**When building a new page, fill this section with your specific data.**

### 5.1 Page Identity

- **Page Name:** [e.g., "Game Center Hub", "Coaches Directory"]
- **Route:** [e.g., `/game-center`, `/coaches`]
- **Primary User Job:** [e.g., "quickly scan top weekly matchups and results"]
- **Data Feeds:** [e.g., games, standings, team_analytics; list all JSON files/API endpoints]

### 5.2 Slot Map

Describe your grid layout:

```
| a | a | b | c |
| a | a | d | e |
| f | g | h | i |
| j | j | k | k |
```

- **Board Shape:** [e.g., "4 cols, 4 rows (16 slots total)"]
- **Fixed Slots:** [e.g., "a (2x2), b-i (1x1), j-k (2x1)"]
- **Dynamic Slots:** [e.g., "b-i, any candidates 1x1"]
- **Utility Strips:** [e.g., "j-k for horizontal lists/carousels"]
- **Banner/Search:** [e.g., "season + week dropdowns + team selector"]

### 5.3 Static Anchors

For each static card, document:

```
| Slot | Card ID | Purpose | Data Contract | Fallback |
|------|---------|---------|---|---|
| a | hero_spotlight | Hero card (always visible) | game object | empty state |
```

### 5.4 Dynamic Candidate Pool

List all possible 1x1 and 2x1 card types that can rotate:

**1x1 Candidates (e.g., 15 total):**
1. Category A (e.g., "Top Performance")
2. Category B (e.g., "Upset Alert")
... [describe each with required data fields]

**2x1 Candidates (e.g., 8 total):**
1. Category X (e.g., "Stat Carousel")
2. Category Y (e.g., "Recent Results Strip")
... [describe each with required data fields]

### 5.5 Why Engine Scoring Policy

Document the scoring formula and weights:

```json
{
  "weights": {
    "importance_score": 0.25,
    "recency_score": 0.20,
    "narrative_weight": 0.20,
    "identity_score": 0.15,
    "freshness_penalty": -0.20
  },
  "diversity_guards": [
    "max_2_per_category",
    "min_1_featured_entity",
    "avoid_repeat_3_visits"
  ],
  "slot_fill_order": "score_desc_with_guardrails",
  "fallback_strategy": "use_neutral_placeholder"
}
```

- **importance_score:** How significant is this narrative? (0-100)
- **recency_score:** How fresh is the data? (0-100, decays hourly)
- **narrative_weight:** Does it match page identity? (0-100)
- **identity_score:** HBCU-specific relevance? (0-100)
- **freshness_penalty:** Reduce repeat visit score (0-20 points)

### 5.6 Navigation & Clickability

- **Card Click Target:** [e.g., "navigate to /game/{gameId}"]
- **Row Click Target:** [e.g., "navigate to /game/{gameId}"]
- **Route Params Required:** [e.g., `{gameId}`, `{teamId}`, `{season}`]
- **Disabled/Soon Policy:** [e.g., "paramized entries (Week Central) marked `soon: true` until param routing finalized"]

### 5.7 Definition of Done

- [ ] Layout adheres to slot spans only; no per-card height overrides
- [ ] All card click targets route correctly or explicitly disable (no dead links)
- [ ] All data contracts fulfilled; fallbacks provided for missing data
- [ ] Responsive breakpoints tested (cards degrade gracefully on mobile)
- [ ] Visual balance: no blank slots unless intentional
- [ ] Page file under 200 lines; card files under 150 lines each
- [ ] Static anchors lock before dynamic fill
- [ ] Why manifest properly selects cards by score

---

## 6. Code & Component Behavior

This section documents how your page implementation should behave.

### 6.1 Page File Structure (React)

**Pattern:** Page orchestrates, does not render content directly.

```javascript
// src/pages/hubs/MyHubPage.js
export function MyHubPage() {
  // 1. Fetch manifest from backend or compute locally
  const manifest = useWhyManifest({ pageId: 'my_hub' }); // returns { slots: {...} }

  // 2. Fetch static data
  const staticData = useStaticData(); // e.g., standings, hero data

  // 3. Map manifest → component render
  const gridLayout = buildGridLayout(manifest);

  // 4. Render slots
  return (
    <Box bg={colors.bg.primary}>
      <MyHubBanner />
      <DesktopBoard4x>
        {gridLayout.map((slot) => (
          <Slot key={slot.id} {...slot}>
            {componentMap[slot.cardType](slot.data)}
          </Slot>
        ))}
      </DesktopBoard4x>
    </Box>
  );
}
```

**Line Budget:** Keep page file to 50-150 lines. Move all card rendering to separate component files.

### 6.2 Card Component Pattern

**Pattern:** Cards accept data + callbacks, render only.

```javascript
// src/components/molecules/my-hub/MyHubCard.js
export function MyHubCard({ data, onClick }) {
  if (!data) return <FallbackCard />;
  
  return (
    <Box
      p={4}
      bg={colors.bg.card}
      border={borders.card}
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
    >
      <Heading>{data.title}</Heading>
      <Text>{data.description}</Text>
    </Box>
  );
}
```

**Rules:**
- Never set `height` or `minHeight` on card containers
- Never set `width` (parent slot controls it)
- Accept `onClick` prop and call it when user clicks
- Render fallback if data is null/missing

### 6.3 Banner Component Pattern

**Pattern:** Banner handles search/filter state and navigation.

```javascript
// src/components/molecules/my-hub/MyHubBanner.js
export function MyHubBanner() {
  const navigate = useNavigate();
  const [season, setSeason] = useState();
  const [view, setView] = useState();

  const handleViewChange = () => {
    navigate(`/my-page/season/${season}/view/${view}`);
  };

  return (
    <Flex gap={4} mb={4}>
      <Select value={season} onChange={(e) => setSeason(e.target.value)} />
      <Select value={view} onChange={(e) => setView(e.target.value)} />
      <Button onClick={handleViewChange}>View</Button>
    </Flex>
  );
}
```

**Rules:**
- Banner manages own state (selected filters)
- Banner triggers route changes on user action
- Page responds to route param changes by re-rendering

### 6.4 Data Fetching Pattern

Use React Query hooks in `src/hooks/useSWACData.js`:

```javascript
export function useMyHubManifest(pageId) {
  return useQuery({
    queryKey: ['myHubManifest', pageId],
    queryFn: async () => {
      const res = await fetch(`/api/manifests/${pageId}`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}
```

**Rules:**
- Use `@tanstack/react-query` for all external data
- Prefer static JSON files (public/data/) for lookups
- Compute Why manifest server-side or via memoized function
- never use `useEffect` for data fetching (banned in codebase)

---

## 7. Backend Integration Checklist

If your page requires backend scoring or dynamic manifest generation:

### 7.1 Why Manifest Contract

Backend endpoint: `GET /api/manifests/{pageId}`

**Response Format:**

```json
{
  "pageId": "my_hub",
  "timestamp": "2026-04-06T18:00:00Z",
  "slots": {
    "a": {
      "cardId": "hero_spotlight_1",
      "cardType": "HeroSpotlight",
      "score": 87.5,
      "reasonCodes": ["importance=high", "recency=fresh"],
      "payload": { /* card data */ }
    },
    "b": {
      "cardId": "narrative_1",
      "cardType": "NarrativeCard",
      "score": 72.3,
      "reasonCodes": ["identity=relevant", "variance=high"],
      "payload": { /* card data */ }
    }
  },
  "diversityApplied": true,
  "debug": { /* optional scoring breakdown */ }
}
```

**Manifest Generation Rules:**
1. Compute scores for all candidates using weights (section 5.5)
2. Apply diversity guardrails (no more than N of same category)
3. Place static anchors first
4. Rank remaining candidates by score desc
5. Fill slots deterministically, fallback if insufficient candidates

### 7.2 Card Payload Schema

Each card in manifest must include a `payload` object with its data:

```json
{
  "cardId": "narrative_1",
  "cardType": "NarrativeCard",
  "payload": {
    "id": "narrative_story_42",
    "title": "David vs Goliath",
    "subtitle": "Underdog triumph in week 5",
    "imageUrl": "/pics/highlights/game_42.jpg",
    "teams": ["FAMU", "Howard"],
    "stat": "Comeback from 21 down",
    "clickTarget": {
      "route": "/game/game_42",
      "external": false
    }
  }
}
```

**Requirements:**
- Every card must have a `clickTarget` (or explicit `disabled: true`)
- All URLs must be absolute or relative to `/`
- All images must exist or have fallback

### 7.3 Cache & Invalidation

- **Cache TTL:** 5-15 minutes per manifest (configurable by page)
- **Invalidate On:** new game, standings update, threshold breach
- **Fallback:** If backend unavailable, serve static manifest (pre-computed safe state)

---

## 8. Implementation Checklist (For Agents)

When building a page from this template:

### Pre-Implementation
- [ ] Page spec (sections 1-5) filled in completely
- [ ] Candidate pool documented with 12-20 options per slot type
- [ ] Data contracts finalized with backend team
- [ ] Route structure added to App.js

### Code Structure
- [ ] Page file created: `src/pages/hubs/{hubName}/{PageName}.js` (under 150 lines)
- [ ] Banner component created if needed: `src/components/molecules/{hubName}/{PageName}Banner.js`
- [ ] Card components created: `src/components/molecules/{hubName}/{CardName}Card.js` (one card per file, under 150 lines)
- [ ] All cards imported into page with named exports
- [ ] Page uses `useWhyManifest` or local manifest computation
- [ ] No `useEffect` used anywhere (banned)

### Layout & Styling
- [ ] Grid uses Slot1x1, Slot2x1, Slot2x2 with colSpan/rowSpan only
- [ ] Cards have no `height` or `minHeight` properties
- [ ] Cards are render-only; receive `data` + `onClick` props
- [ ] All slots render; no blank cells unless intentional

### Data & Behavior
- [ ] All data fetched via React Query (useSWACData hooks)
- [ ] Fallback component exists for every card type
- [ ] No dead links: all `onClick` handlers go to valid routes
- [ ] Route params (season, week, team) passed correctly
- [ ] Disabled/soon items explicitly marked in nav registrar

### Testing & QA
- [ ] Visual regression tested (responsive breakpoints, dark mode)
- [ ] All click targets tested (no 404s)
- [ ] Data loading states handled (skeleton, empty, error)
- [ ] Page adds to ComponentLab for visual regression
- [ ] Nav breadcrumb works correctly
- [ ] Scores/diversity guards log correctly (check debug mode if available)

---

## 9. How to Use This Template

**Step 1: Copy This File**
```bash
cp PageTemplate.md src/pages/mds/YourPageSpecName.md
```

**Step 2: Fill In Sections 1-6**
- Describe your page's identity, slots, anchors, candidates, scoring, and code structure

**Step 3: Follow Implementation Checklist**
- Build page, banner, and card files according to patterns in section 6

**Step 4: Backend Integration**
- Coordinate on manifest format (section 7)
- Test with debug mode in ComponentLab

**Step 5: QA & Ship**
- Complete section 8 checklist
- Add page to AGENTS.md (Current Status section)
