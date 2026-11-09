# Players Hub Frontend Schema

Active payload:

```text
92-frontend/3-players/players_hub_index.json
92-frontend/3-players/players_hub_{year}.json
```

Validation report:

```text
92-frontend/3-players/players_hub_validation_{year}.json
```

## Purpose

The Players Hub payload powers `/players` as a conference-wide discovery
dashboard. It is not a raw roster table. The payload is pre-ranked,
pre-labeled, and confidence-aware.

Top-level sections:

- `summary`
- `spotlight`
- `position_boards`
- `conference_talent_map`
- `breakout_radar`
- `transfer_impact`
- `hidden_gems`
- `physical_outliers`
- `archetypes`
- `glory_leaders`
- `player_index_preview`
- `metadata`

## Guardrails

- Every ranked or labeled player includes `reason_codes`.
- Player objects use stable canonical `PERS_...` IDs.
- Rankings are pre-sorted for the frontend.
- Profile-only or inferred labels carry lower confidence.
- Unsupported archetypes are omitted.
- `player_index_preview` is intentionally compact and is not a roster table.

## Refresh

```text
python 92-frontend/tools/build_players_hub.py --season 2021
python 92-frontend/tools/build_players_hub.py --season 2022
python 92-frontend/tools/build_players_hub.py --season 2023
python 92-frontend/tools/build_players_hub.py --season 2024
python 92-frontend/tools/build_players_hub.py --season 2025
python 92-frontend/tools/validate_players_hub.py --season 2021
python 92-frontend/tools/validate_players_hub.py --season 2022
python 92-frontend/tools/validate_players_hub.py --season 2023
python 92-frontend/tools/validate_players_hub.py --season 2024
python 92-frontend/tools/validate_players_hub.py --season 2025
python 92-frontend/tools/build_players_hub_index.py
```

## Primary Sources

```text
12-roster-pipeline/4-entities/players/player_seasons_{year}.json
90-Output/season_{year}.json
92-frontend/7-glory/why_glory_{year}.json
11-entity/teams/teams.json
```
