# Game Center Hub - Game Card Notes

Updated: 2026-04-04
Scope: Desktop

## Card Roles On Hub

Use a 4-card strip for game cards on the Game Center Hub:
- 2 completed cards
- 2 upcoming cards

Style allocation (desktop default):
1. Completed game A -> `broadcast`
2. Completed game B -> `broadcast`
3. Upcoming game A -> `data`
4. Upcoming game B -> `spotlight`

This keeps 3 visual systems alive on desktop while preserving clarity by role.

## Required Information (All Cards)

- Home team
- Away team
- Team logos (official assets)
- Score or placeholder score
- Stage label (not raw date)

Examples for stage label:
- Week 12 Final
- SWAC Championship Game
- Celebration Bowl

## Completed Game Card Guidance (`broadcast`)

- Use winner team primary color in card background treatment
- Keep top badge as `FINAL`
- Prefer stage label over raw calendar date
- Add one performance line:
  - MVP line
  - or key player stat line

## Upcoming Card Guidance (`data` / `spotlight`)

- Keep score as `-- --`
- Use narrative labels and context tags:
  - projected matchup theme
  - record comparison
  - watch metric
- Candidate fields:
  - headline
  - random fact (yards, havoc, red-zone efficiency)
  - expected MVP note

## Avatar Shape

Team logo avatars should use:
- square shape
- rounded corners
- subtle border

This aligns with current UI chrome better than circular avatars.

## Notes For Future Wiring

Later, when variable rules are finalized:
- Completed cards should sort by recency and significance
- Upcoming cards should sort by editorial priority (national relevance, title race impact)
- Stage labels should map from schedule metadata and event rules

## Data Pipeline Requirement

- The schedule feed does not include record fields directly, so records were blank unless we derive them ourselves.
- We need to update the data payload feeding this hub file to include team records per game row (home/away snapshot), so cards can render records without inference logic.
