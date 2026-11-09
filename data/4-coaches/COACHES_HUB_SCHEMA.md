# Coaches Hub Frontend Schema

Use these files for the active Coaches Hub:

```text
92-frontend/4-coaches/coaches_hub_payload_index.json
92-frontend/4-coaches/coaches_hub_payload_{year}.json
92-frontend/4-coaches/coach_position_impact_by_school_season.json
92-frontend/4-coaches/coaches_hub_export_summary.json
```

## School Payload

Each `coaches_hub_payload_{year}.json` file contains:

- `schools[]`: school-season ecosystem blocks.
- `network_edges[]`: same-staff relationship edges only.
- `movement_edges[]`: frontend-safe movement edges.

Core school blocks:

- `head_coach`
- `stability`
- `movement`
- `pipeline`
- `style`
- `stock`
- `staff_summary`
- `position_impact`

## Position Impact

`position_impact` is a compact frontend block derived from
`coach_position_impact_by_school_season.json`.

Required guardrails:

```text
safe_label = Position Production Context
attribution_scope = contextual_staff_season
causation_claim = false
```

Do not render this as:

- Coach Effectiveness
- Coach Development Grade
- Causal player development attribution

Recommended UI copy should describe year-to-year position production context
while a staff was in place, with confidence and source notes visible.

## Refresh

```text
python 92-frontend/tools/build_coaches_hub_exports.py
```
