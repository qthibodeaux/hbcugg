# Backend Request: Field Position March Data

## Endpoint
`game_detail_payload(game_id)` or new `game_field_position_timeline(game_id)`

## Purpose
Support "The March" visualization — a single continuous line showing field position over time, color-coded by possession team.

## Required Output

```json
{
  "field_position_timeline": [
    {
      "sequence": 0,
      "quarter": 1,
      "clock": "14:54",
      "clock_seconds": 894,
      "game_time_progress": 0.0,
      "offense_team": "swacjsu",
      "defense_team": "swacpvamu",
      "yl_abs": 33,
      "yl_team": "swacjsu",
      "yl_num": 33,
      "yards_gained": 0,
      "down": 1,
      "distance": 10,
      "is_scoring": false,
      "is_turnover": false,
      "is_big_play": false,
      "play_type": "RUSH",
      "result": "gain"
    }
  ]
}
```

## Field Definitions

| Field | Type | Description |
|-------|------|-------------|
| `sequence` | int | Play order in game (0-indexed) |
| `quarter` | int | 1-4 (or 5+ for OT) |
| `clock` | string | "MM:SS" format |
| `clock_seconds` | int | Seconds remaining in quarter (0-900) |
| `game_time_progress` | float | 0.0 to 1.0 (0 = start of game, 1 = end) |
| `offense_team` | string | v5 team ID (e.g., "swacjsu") |
| `defense_team` | string | v5 team ID |
| `yl_abs` | int | Absolute yard line (1-99). Always measured from one fixed end zone. |
| `yl_team` | string | Which team's perspective the yard line is from |
| `yl_num` | int | Yard line number (1-50) |
| `yards_gained` | int | Net yards on play |
| `down` | int | 1-4 |
| `distance` | int | Yards to go |
| `is_scoring` | bool | Touchdown, FG, safety, etc. |
| `is_turnover` | bool | Interception, fumble lost, downs |
| `is_big_play` | bool | 20+ yard gain |
| `play_type` | string | RUSH, PASS, SACK, PENALTY, etc. |
| `result` | string | gain, loss, incomplete, etc. |

## Y-Coordinate Mapping (Frontend Responsibility)

The frontend maps `yl_abs` to Y-coordinate based on offense team:

- **Away team has ball**: `y = yl_abs` (drives UP toward 100)
- **Home team has ball**: `y = 100 - yl_abs` (drives DOWN toward 0)

## Data Quality Requirements

1. **Only actual plays** — filter out `line_type === "EVENT"` and `line_type === "HEADER"`
2. **Every play must have `yl_abs`** — if missing, infer from previous play + yards gained
3. **Possession changes** — explicitly mark when `offense_team` changes from previous play
4. **Chronological order** — sorted by quarter, then clock descending

## Current Gap

In the existing `play_by_play` data:
- 161 `PLAY` entries exist
- Some `PLAY` entries lack `yl_abs` (e.g., kickoff returns where field position is implicit)
- The backend should compute `yl_abs` for every play, even kickoffs/punts

## Visualization Reference

- X-axis: `game_time_progress` (0 to 1)
- Y-axis: Computed Y-coordinate (0 to 100)
- Line color: Changes when `offense_team` changes
- Background: Yard lines at 0, 10, 20... 100
- Markers: Scores (green), turnovers (red), big plays (yellow)
