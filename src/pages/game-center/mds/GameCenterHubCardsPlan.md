# Game Center Card System Design Doc

Updated: 2026-04-06  
Scope: Game Center Hub + Games Hub  
Purpose: A repeatable page-spec workflow that lets agents build pages directly from docs, with static anchors plus dynamic card rotation from the Why Engine.

## 1. Why This Exists

This doc is the contract between product thinking and page implementation.

It standardizes:
- What is fixed vs what rotates
- How cards are scored and selected
- How slots are filled predictably
- How agents should implement pages from spec without re-deciding structure each time

This is the blueprint pattern to copy for every future page plan.

## 2. Core Model

Each page is built from two card classes:

1. Static Anchors
- Always present on that page
- Example: 2x2 Game of the Week, standings cards, global search/banner utilities

2. Dynamic Candidates
- Compete for open slots
- Selected by Why Engine score
- Same slot footprint, different card type/content by context

## 3. Layout Rules (Locked)

1. Grid dimensions are controlled by slot span only.
- Use Slot1x1, Slot2x1, Slot2x2, Slot4x1 footprints.

2. Do not simulate slot size with card-level hard heights.
- No per-card "fake 2x1" via oversized min-height.

3. Keep reusable wrappers and compositional architecture.
- Page file orchestrates.
- Card components render.

4. Banner controls are part of page-level utilities.
- Search/filter actions route to paramized pages.

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

## 5. Page Spec Template (Copy For Every Page)

Use this structure for all future page docs.

### 5.1 Page Identity

- Page name:
- Route:
- Primary user job:
- Data feeds:

### 5.2 Slot Map

- Board shape:
- Fixed slots:
- Dynamic slots:
- Utility strips:

### 5.3 Static Anchors

For each anchor:
- card_id
- slot footprint
- render priority
- required data contract
- fallback behavior

### 5.4 Dynamic Candidate Registry

For each candidate:
- category_id
- slot footprint compatibility
- scoring inputs
- minimum data requirements
- tie-break behavior

### 5.5 Why Engine Policy

- weights table
- diversity constraints
- freshness windows
- cache/TTL policy

### 5.6 Navigation & Clickability

- card click destination
- row click destination
- route param requirements
- disabled/soon policy when params are unresolved

### 5.7 QA / Definition of Done

- layout adheres to slot spans only
- no broken click targets
- no empty hard failures (all have fallback)
- visual balance across rows
- responsive integrity

## 6. Game Center Hub Spec

### 6.1 Hub Intent

Keep 1x1 cards focused on:
- Results
- Schedules
- Standings

Avoid heavy stat-density cards in the main hub.

### 6.2 Hub Static 1x1 Set (Current Baseline)

1. SWAC West Top 3
2. SWAC East Top 3
3. MEAC Top 3
4. Game of the Week
5. Look Ahead
6. Upcoming Stretch
7. Team Form
8. Home Town Heroes
9. Us vs The World

### 6.3 Hub Expanded Candidate Pool (Target: 15 1x1)

Add these for rotation/experiments:

10. Biggest Mover This Week
11. Streak Watch
12. Title Race Pressure
13. Bowl Path Tracker
14. Red-Zone Edge
15. Turnover Swing Leaders

### 6.4 Hub Quick Contracts

- standings_list:
  - title
  - rows[]: shortName, record

- schedule_headline:
  - title
  - game: awayShort, homeShort, stageLabel, dateLabel
  - footer

- schedule_list:
  - team
  - games[]
  - summary

- trend:
  - team
  - results[]: result, margin

- split:
  - title
  - team
  - record
  - detail

## 7. Games Hub Spec

### 7.1 Games Board Shape

- Slot a: 2x2 -> Game of the Week Spotlight (static)
- Slots b-i: 1x1 -> narrative cards (dynamic rotation)
- Slots j-k (+ future): 2x1 -> utility strips

Grid map:

| a | a | b | c |
| a | a | d | e |
| f | g | h | i |
| j | j | k | k |

### 7.2 Games Hub 1x1 Categories (Target: 15)

1. Game of the Year
2. Best Individual Performance
3. Offensive Explosion
4. Defensive Dominance
5. Upset of the Year
6. Fourth Quarter Flip
7. Rivalry Heat
8. Road Statement
9. Goal-Line Stand
10. Overtime Classic
11. Special Teams Shock
12. Freshman Breakout Game
13. QB Duel of the Week
14. Ground-and-Pound Masterclass
15. Chaos Finish (Final 2 Minutes)

### 7.3 Games Hub 2x1 Categories (Target: 8)

1. Stat Carousel Strip
2. Team Performance Strip
3. Clutch Drives Timeline
4. Quarter-by-Quarter Swing Strip
5. Top Plays Film Strip
6. Penalty Discipline Tracker
7. Red-Zone Conversion Strip
8. Explosive Plays Ledger

### 7.4 Games Banner/Search Pattern

Banner includes two search rails:

1. Season + Week + View
- Routes to week-specific game center views.

2. Team + View
- Routes to team-specific season views.

### 7.5 Games Clickability Requirement

- Narrative cards link to game detail when a source game exists.
- 2x1 strip rows are clickable to game detail pages.
- If no target route exists, render non-clickable fallback state (no dead links).

## 8. Streamlining Recommendations

Use these to speed implementation and improve iteration quality:

1. Create a shared Card Registry JSON per page.
- fields: id, slotType, static/dynamic, contract, scoring_inputs, fallback_component

2. Generate a Why Manifest JSON server-side.
- fields: slot_id, selected_card_id, score, reason_codes, payload_ref

3. Keep page orchestration deterministic.
- page only maps manifest -> slots -> components

4. Introduce a single fallback policy.
- if payload missing, fallback to card-family empty state (not crash/omit)

5. Add a small debug mode in ComponentLab.
- show scores/reason codes under each candidate for fast tuning

## 9. Implementation Checklist (Agent)

- Slot spans are the only dimensional control used.
- Static anchors are locked before dynamic fill.
- Why Engine score and diversity guards are applied.
- Dynamic cards have fallback and no dead click targets.
- Banner controls route correctly.
- Page file remains orchestration-first and modular.
