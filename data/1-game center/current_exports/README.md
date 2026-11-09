# Current Game Center Exports

Last refreshed: 2026-04-25

This folder is the clean frontend handoff bundle for the current Game Center exports.

Use this folder as the frontend entry point instead of the working export root:

```text
92-frontend/1-game center/current_exports/
```

## Contents

- `FRONTEND_EXPORT_CONTRACT.md` - implementation contract and field guide.
- `manifest.json` - generated inventory of export families and file counts.
- `export_summary.json` - builder run summary.
- `validation_report.json` - validation status.
- `score_mismatches.json` - QA list for score disagreements.
- `week_assignments.json` - parsed game week assignments.
- `games/` - individual frontend-ready game files plus `index.json`.
- `hub/` - Game Center hub payloads.
- `week_central/` - weekly schedule/result payloads.
- `slate/` - conference slate payloads.
- `schedule_board/` - season schedule board payloads.
- `team_schedules/` - team schedule payloads.
- `standings_race/` - standings race payloads.
- `games_hub/` - broad game-card feed payloads.

## Implementation

For 2025, the primary files are:

```text
hub/game_center_hub_2025.json
week_central/week_central_2025.json
slate/conference_slate_2025.json
schedule_board/season_schedule_board_2025.json
team_schedules/team_schedules_2025.json
standings_race/standings_race_2025.json
games_hub/games_hub_2025.json
games/index.json
```

Individual game pages load from:

```text
games/2025/{game_path_id}.json
```

Only link to a game page when a payload field has a non-null `route`.

## Refresh Process

The canonical build still runs from the tools folder:

```bash
python 92-frontend/tools/build_game_center_payloads.py
```

After rebuilding, refresh this bundle by copying the current export folders/files into `current_exports/`.

The working export root remains the source of truth for generation. This bundle is the clean handoff package for frontend consumption.
