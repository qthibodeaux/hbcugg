# Game Page Production Contract

**Route:** `/game/:gameId`
**Status:** Production target
**Last updated:** 2026-09-08
**Scope:** current game deep-dive page only — Summary, Box Score, Data Room and Play by Play tabs, all fed by one payload
**Governs:** the 2026-season payload shape. 2019-2025 games ship an older, larger schema (`_schema: "frontend_ready_v3"`) that predates several sections this doc requires (`advanced_basics`, `game_leaders`, `notable_performers`, `win_probability` did not exist on it) — the frontend still derives those from raw plays for that range and will keep doing so until they're backfilled. Full field-by-field diff between the two schemas: `reqs/BACKEND_RESPONSE_SPEC.md` §1b.

---

## 1. Purpose

This is the strict backend contract for the live game detail page. The frontend is a fetch-and-render layer only. It does not compute semantics, context, narrative, rankings, win probability, turnover luck, or analytic explanations from raw plays.

The backend owns the game interpretation. The frontend resolves team metadata for branding only and renders the already-prepared payload.

**This version corrects five places where the contract's own example disagreed with what the 2026 files actually ship**, checked directly against all five 2026 games (`asusu26`, `huaamu26`, `nccutsu26`, `scsufamu26`, `tsupvamu26`) rather than assumed. Each is called out inline as **SHIPPING TODAY** vs **REQUIRED**, so the gap is visible instead of silently wrong.

---

## 2. Non-negotiables

1. The frontend must not calculate the winner, momentum, turnover margin, success rate, advanced basics, win probability, notable performers, or game leaders from raw play data.
2. The frontend must not infer classification from names, strings, or text matching.
3. The frontend must not parse display strings back into numbers.
4. The backend must return direct numeric values for any metric shown on the page.
5. Every team object must already include its resolved identity and stats.
6. `team_id` uses v5 format such as `swacjsu`, `swacpvamu`, `meacscsu`.
7. If a section is displayed, it must already exist in the payload as a ready-to-render object.
8. The frontend should never "fill in the blanks" with derived values.

These are the target rules for the 2026 schema. They cannot govern 2019-2025 games today — those files ship none of `advanced_basics`, `game_leaders`, `notable_performers`, or `win_probability`, so the frontend derives all four for that range out of necessity. That fallback path is documented, not hidden, and it retires itself the day a season gets backfilled — see `reqs/STATS_HUB_CARD_INVENTORY.md` asks #7, #8, #10.

---

## 3. API contract

### Endpoint

```text
GET /api/game-center/game/{game_path_id}
```

or

```text
GET /api/game-center/game?game_id={game_id}
```

`game_path_id` is the file stem used across the whole export tree — `games/index.json` keys every entry on it as `game_stem`, and the physical file lives at `game-center/games/{season}/{game_path_id}.json`. **Real values look like `scsufamu26`, `tsupvamu26`, `nccutsu26`** — an away+home abbreviation composite plus the two-digit season, not a week-prefixed form like `W1scsufamu`. `route` is always `/game/{game_path_id}` off that same value. Diverging from this breaks every existing index entry and route at once, so this is the one field in the whole contract with zero room for a different convention later.

### Response shape

```json
{
  "game_id": "SCSUFAMU06092026",
  "game_path_id": "scsufamu26",
  "route": "/game/scsufamu26",
  "season": 2026,
  "week": 1,
  "status": "final",
  "status_label": "Final",
  "date": "2026-09-06",
  "date_label": "Sep 6, 2026",
  "kickoff_label": "4:43 PM",

  "metadata": {
    "game_id": "SCSUFAMU06092026",
    "date": "2026-09-06",
    "site": "Miami Gardens, Florida (Hard Rock Stadium)",
    "attendance": 23188,
    "weather": null,
    "temperature": null,
    "officials": {
      "Referee": "Myers,Y.N.",
      "Line Judge": "Smith,Derek",
      "Side Judge": "Porter,Jamal",
      "Umpire": "Rogers,James",
      "Back Judge": "Philpart,Joshua",
      "Linesman": "Day,Vernon",
      "Field Judge": "Lowe,Curtis"
    }
  },

  "away_team": {
    "team_id": "meacscsu",
    "name": "South Carolina State",
    "short_name": "SCSU",
    "score": 31,
    "record": "1-0",
    "conference_record": "1-0",
    "winner": true
  },

  "home_team": {
    "team_id": "swacfamu",
    "name": "Florida A&M",
    "short_name": "FAMU",
    "score": 13,
    "record": "0-1",
    "conference_record": "0-1",
    "winner": false
  },

  "winner_team_id": "meacscsu",

  "classification": {
    "opponent_class": "covered",
    "is_covered_matchup": true,
    "conference_scope": "conference",
    "division_scope": "not_applicable",
    "game_type": "regular",
    "event": null
  },

  "scoring_summary": [
    {
      "period": 1,
      "team_id": "swacfamu",
      "points": 3,
      "clock": "07:50",
      "play_type": "FIELD_GOAL",
      "description": "..."
    }
  ],

  "team_box": {
    "swacfamu": {
      "pass_attempts": 30,
      "pass_completions": 13,
      "pass_completion_pct": 0.4333,
      "pass_yards": 162,
      "pass_touchdowns": 0,
      "interceptions_thrown": 0,
      "yards_per_pass_attempt": 5.4,
      "sacks_allowed": 5,
      "rush_attempts": 25,
      "rush_yards": 29,
      "rush_touchdowns": 0,
      "yards_per_carry": 1.16,
      "total_yards": 191,
      "plays_offense": 63,
      "drives_offense": 13,
      "points_scored": 13,
      "points_per_drive": 1.0,
      "turnovers_committed": 1,
      "turnovers_forced": 3,
      "sacks_made": 0,
      "third_down_attempts": 17,
      "third_down_conversions": 4,
      "third_down_conversion_rate": 0.2353,
      "third_down_avg_distance": 9.06,
      "fourth_down_goes": 1,
      "fourth_down_go_conversions": 1,
      "fourth_down_go_rate": 0.3333,
      "fourth_down_go_conversion_rate": 1.0,
      "avg_start_field_position": 33.46,
      "long_field_drives": 9,
      "long_field_rate": 0.6923
    },
    "meacscsu": {
      "pass_attempts": 20,
      "pass_completions": 12,
      "pass_completion_pct": 0.6,
      "pass_yards": 187,
      "pass_touchdowns": 0,
      "interceptions_thrown": 2,
      "yards_per_pass_attempt": 9.35,
      "sacks_allowed": 0,
      "rush_attempts": 38,
      "rush_yards": 297,
      "rush_touchdowns": 4,
      "yards_per_carry": 7.8158,
      "total_yards": 484,
      "plays_offense": 63,
      "drives_offense": 13,
      "points_scored": 31,
      "points_per_drive": 2.3846,
      "turnovers_committed": 3,
      "turnovers_forced": 1,
      "sacks_made": 5,
      "third_down_attempts": 8,
      "third_down_conversions": 2,
      "third_down_conversion_rate": 0.25,
      "third_down_avg_distance": 9.0,
      "fourth_down_goes": 1,
      "fourth_down_go_conversions": 1,
      "fourth_down_go_rate": 0.5,
      "fourth_down_go_conversion_rate": 1.0,
      "avg_start_field_position": 35.38,
      "long_field_drives": 10,
      "long_field_rate": 0.7692
    }
  },

  "advanced_team": {
    "swacfamu": {
      "epa_total": -21.866,
      "epa_per_play": -0.3216,
      "wpa_total": -0.2047,
      "success_rate": 0.25,
      "success_rate_down_distance": 0.2167,
      "eligible_scrimmage_plays": 60,
      "explosive_rate_yardage": 0.05,
      "explosive_rate_epa": 0.1029,
      "stuff_rate": 0.14,
      "havoc_rate_forced": 0.17,
      "red_zone_td_rate": 0.2,
      "quality_drive_rate": 0.23,
      "explosive_drive_rate": 0.08
    },
    "meacscsu": {
      "epa_total": 18.11,
      "epa_per_play": 0.279,
      "wpa_total": 0.76,
      "success_rate": 0.44,
      "success_rate_down_distance": 0.48,
      "eligible_scrimmage_plays": 58,
      "explosive_rate_yardage": 0.2,
      "explosive_rate_epa": 0.35,
      "stuff_rate": 0.13,
      "havoc_rate_forced": 0.19,
      "red_zone_td_rate": 0.5,
      "quality_drive_rate": 0.46,
      "explosive_drive_rate": 0.18
    }
  },

  "individual_stats": {
    "swacfamu": {
      "passing": [],
      "rushing": [],
      "receiving": [],
      "defense": []
    },
    "meacscsu": {
      "passing": [],
      "rushing": [],
      "receiving": [],
      "defense": []
    }
  },

  "production_scores": {
    "swacfamu": [],
    "meacscsu": []
  },

  "win_probability": {
    "away": 0.72,
    "home": 0.28,
    "winner_team_id": "meacscsu",
    "final_label": "SCSU 72%",
    "source": "backend_model"
  },

  "drive_summary": [
    {
      "drive_id": "SCSUFAMU06092026_D001",
      "offense_team": "swacfamu",
      "defense_team": "meacscsu",
      "quarter_start": 1,
      "clock_start": "15:00",
      "start_yardline_absolute": 25,
      "quarter_end": 1,
      "clock_end": "07:50",
      "end_yardline_absolute": 87,
      "possession_obtained_by": "kickoff",
      "plays_total": 14,
      "yards_net": 57,
      "result": "FG",
      "points": 3,
      "is_long_field_drive": true,
      "drive_efficiency_rating": 0.76
    }
  ],

  "play_by_play": [
    {
      "play_id": "SCSUFAMU06092026-14",
      "sequence": 14,
      "quarter": 1,
      "clock": "09:12",
      "down": 2,
      "distance": 7,
      "yardline_absolute": 41,
      "offense_team": "meacscsu",
      "defense_team": "swacfamu",
      "play_type": "RUSH",
      "raw_text": "Shaw,Josh rush right for 12 yards to the FAMU48.",
      "actions": [
        {
          "type": "RUSH",
          "rusher": { "name_raw": "Shaw,Josh", "team": "meacscsu", "player_id": "PERS_00013540" },
          "direction": "right",
          "net_yards": 12,
          "is_tfl": false,
          "tacklers": [
            { "name_raw": "Bostic,Justin", "team": "swacfamu", "player_id": "PERS_00010147" }
          ]
        }
      ],
      "no_play": false,
      "scoring_event": false,
      "scoring_type": null,
      "scoring_points": 0,
      "turnover": false,
      "turnover_type": null,
      "yardline_after_absolute": 53,
      "score_home_after": 0,
      "score_away_after": 0,
      "description": "Shaw,Josh rush right for 12 yards to the FAMU48."
    }
  ],

  "notable_performers": [
    {
      "player_key": "PERS_00010147",
      "name": "Bostic,Justin",
      "team_id": "swacfamu",
      "position": "DB",
      "production_total": 27.3,
      "stat_summary": {
        "tackles": 5.5,
        "sacks": 0,
        "interceptions": 1,
        "passes_defended": 2,
        "forced_fumbles": 0,
        "tfl": 1.5
      },
      "chips": [
        { "label": "INT", "value": 1 },
        { "label": "PBU", "value": 2 },
        { "label": "Tkl", "value": 5.5 },
        { "label": "HVC", "value": 4 }
      ]
    },
    {
      "player_key": "PERS_00013286",
      "name": "Shaw,Josh",
      "team_id": "meacscsu",
      "position": "RB",
      "production_total": 24.1,
      "stat_summary": {
        "rush_yards": 119,
        "rush_tds": 2,
        "carries": 14,
        "yards_per_carry": 8.5
      },
      "chips": [
        { "label": "Rush Yds", "value": 119 },
        { "label": "TD", "value": 2 },
        { "label": "Car", "value": 14 },
        { "label": "YPC", "value": 8.5 }
      ]
    },
    {
      "player_key": "PERS_00010921",
      "name": "Johnson,Denzel",
      "team_id": "swacfamu",
      "position": "LB",
      "production_total": 14.37,
      "stat_summary": {
        "tackles": 8,
        "sacks": 1.5,
        "tfl": 2.5,
        "forced_fumbles": 1
      },
      "chips": [
        { "label": "Tkl", "value": 8 },
        { "label": "Sack", "value": 1.5 },
        { "label": "TFL", "value": 2.5 },
        { "label": "FF", "value": 1 }
      ]
    }
  ],

  "game_leaders": {
    "passing": [
      {
        "player_key": "PERS_00013533",
        "name": "Knowles,Isaiah",
        "team_id": "swacfamu",
        "position": "QB",
        "yards": 162,
        "touchdowns": 0,
        "interceptions": 0
      }
    ],
    "rushing": [
      {
        "player_key": "PERS_00013540",
        "name": "Shaw,Josh",
        "team_id": "meacscsu",
        "position": "RB",
        "yards": 119,
        "touchdowns": 2,
        "carries": 14
      }
    ],
    "receiving": [
      {
        "player_key": "PERS_00013530",
        "name": "Jackson,Kieren",
        "team_id": "swacfamu",
        "position": "WR",
        "yards": 81,
        "touchdowns": 0,
        "receptions": 5
      }
    ],
    "tackles": [
      {
        "player_key": "PERS_00010147",
        "name": "Bostic,Justin",
        "team_id": "swacfamu",
        "position": "DB",
        "tackles": 5.5,
        "solo_tackles": 4,
        "assisted_tackles": 3
      }
    ],
    "havoc": [
      {
        "player_key": "PERS_00010147",
        "name": "Bostic,Justin",
        "team_id": "swacfamu",
        "position": "DB",
        "havoc": 4,
        "interceptions": 1,
        "passes_defended": 2,
        "tfl": 1.5
      }
    ]
  },

  "advanced_basics": {
    "blocks": [
      {
        "label": "Drives",
        "metrics": [
          { "key": "drives", "label": "Drives", "away": 13, "home": 13 },
          { "key": "plays", "label": "Plays", "away": 63, "home": 63 },
          { "key": "yards", "label": "Yards", "away": 191, "home": 484 },
          { "key": "opps", "label": "Sc Opps", "away": 3, "home": 6 },
          { "key": "avgFp", "label": "Avg FP", "away": 33.46, "home": 35.38 }
        ]
      },
      {
        "label": "Turnovers",
        "metrics": [
          { "key": "turnovers", "label": "Turnovers", "away": 1, "home": 3 },
          { "key": "expectedTos", "label": "Expected TOs", "away": 1.1, "home": 0.9 },
          { "key": "toMargin", "label": "TO Margin", "away": -2, "home": 2 },
          { "key": "expectedToMargin", "label": "Expected TO Margin", "away": -0.2, "home": 0.2 },
          { "key": "toLuckPts", "label": "TO Luck (pts)", "away": -1.8, "home": 1.8 }
        ]
      },
      {
        "label": "Per Drive",
        "metrics": [
          { "key": "playsPerDrive", "label": "Plays/Drive", "away": 4.85, "home": 4.85 },
          { "key": "yardsPerPlay", "label": "Yards / Play", "away": 3.0, "home": 7.7 },
          { "key": "yardsPerDrive", "label": "Yards/Drive", "away": 14.7, "home": 37.2 },
          { "key": "oppsPerDrive", "label": "Opps/Drive", "away": 0.23, "home": 0.46 },
          { "key": "pointsPerOpp", "label": "Points/Opp", "away": 4.33, "home": 5.17 }
        ]
      },
      {
        "label": "SR By Qtr",
        "metrics": [
          { "key": "q1", "label": "Q1", "away": 0.27, "home": 0.52 },
          { "key": "q2", "label": "Q2", "away": 0.21, "home": 0.46 },
          { "key": "q3", "label": "Q3", "away": 0.18, "home": 0.54 },
          { "key": "q4", "label": "Q4", "away": 0.25, "home": 0.36 }
        ]
      },
      {
        "label": "Success Rt",
        "metrics": [
          { "key": "srRush", "label": "Rush", "away": 0.28, "home": 0.47 },
          { "key": "srPass", "label": "Pass", "away": 0.22, "home": 0.53 },
          { "key": "srStd", "label": "Std Dn", "away": 0.26, "home": 0.44 },
          { "key": "srPassDn", "label": "Pass Dn", "away": 0.32, "home": 0.49 },
          { "key": "srGame", "label": "Game", "away": 0.25, "home": 0.44 }
        ]
      }
    ]
  }
}
```

---

## 4. Required fields by section

### 4.1 Game identity

Required:
- `game_id`
- `game_path_id` — must equal the `game_stem` used in `games/index.json` (see §3)
- `route`
- `season`
- `week`
- `status`
- `status_label`
- `date`
- `date_label`
- `kickoff_label`

### 4.2 Team identity

Required:
- `away_team.team_id`
- `away_team.name`
- `away_team.short_name`
- `away_team.score`
- `away_team.record`
- `away_team.conference_record`
- `home_team.team_id`
- `home_team.name`
- `home_team.short_name`
- `home_team.score`
- `home_team.record`
- `home_team.conference_record`
- `winner_team_id`

**Open question on `record`:** in the five live 2026 files, `record` and `conference_record` are identical on every conference-game team object, and disagree with a simple tally against that team's own earlier results in the same export (Texas Southern reads `record: "0-1"` in `tsupvamu26` despite a real week-0 win over NC Central one game earlier). State plainly what `record` counts — all games, or only games of the same `game_type` as this one.

### 4.3 Classification

Required:
- `classification.opponent_class`
- `classification.is_covered_matchup`
- `classification.conference_scope`
- `classification.division_scope`
- `classification.game_type`
- `classification.event`

Matches what all five 2026 files ship today — no divergence here.

### 4.4 Scoring summary

Each entry must include:
- `period`
- `team_id`
- `points`
- `clock`
- `play_type`
- `description`

### 4.5 Team box score

For both teams, required on each `team_box[teamId]` object:
- `pass_attempts`
- `pass_completions`
- `pass_completion_pct`
- `pass_yards`
- `pass_touchdowns`
- `interceptions_thrown`
- `yards_per_pass_attempt`
- `sacks_allowed`
- `rush_attempts`
- `rush_yards`
- `rush_touchdowns`
- `yards_per_carry`
- `total_yards`
- `plays_offense`
- `drives_offense`
- `points_scored`
- `points_per_drive`
- `turnovers_committed`
- `turnovers_forced`
- `sacks_made`
- `third_down_attempts`
- `third_down_conversions`
- `third_down_conversion_rate`
- `fourth_down_goes`
- `fourth_down_go_conversions`
- `avg_start_field_position`
- `long_field_drives`
- `long_field_rate`

Matches what all five 2026 files ship today — no divergence here.

### 4.6 Advanced team metrics

For both teams, required on each `advanced_team[teamId]` object:
- `epa_total`
- `epa_per_play`
- `wpa_total`
- `success_rate`
- `success_rate_down_distance`
- `eligible_scrimmage_plays`
- `explosive_rate_yardage`
- `explosive_rate_epa`
- `stuff_rate`
- `havoc_rate_forced`
- `red_zone_td_rate`
- `quality_drive_rate`
- `explosive_drive_rate`

These 13 all ship on every 2026 file. **Not required by this list but consumed elsewhere on the page and currently missing from `advanced_team` in 2026** (present on every 2019-2025 game): `line_yards_per_rush`, `highlight_yards_per_rush`, `rush_opportunity_rate`, `stopped_run_rate`, `special_teams_hidden_yards`, `expected_turnovers`, `turnover_luck`, and every `success_rate_*` situational split (early-down, late-down, goal-to-go, two-minute, middle-8) — 34 fields total. The Box Score tab's rushing panel prints dashes for LY/Car, Opp Rt and Hlt/Opp on a 2026 game as a direct, visible result. Full list: `reqs/BACKEND_RESPONSE_SPEC.md` §1b.

### 4.7 Win probability

Required:
- `win_probability.away`
- `win_probability.home`
- `win_probability.winner_team_id`
- `win_probability.final_label`
- `win_probability.source`

This shape is a **final snapshot** — one number per team, not a curve. It matches what ships today. If the Summary tab is meant to draw an in-game win-probability line (the kind that moves play by play), this shape cannot produce it, and the field it would need — `wpa` or `win_probability` per play — was **removed** from `play_by_play` rows in the 2026 schema (it was present, if often null, in 2019-2025). Confirm whether a curve is in scope; if it is, this section needs a second shape, not a fix to this one.

### 4.8 Notable performers

`notable_performers` is a top-3 list that must be directly supplied by the backend.

Each object must include:
- `player_key`
- `name`
- `team_id`
- `position`
- `production_total`
- `stat_summary`
- `chips`

**SHIPPING TODAY vs REQUIRED:** the JSON in §3 shows `stat_summary` populated (`tackles: 5.5`, `sacks: 0`, …) — that is the required target shape. What actually ships on all five 2026 games is `stat_summary` present with every key **null** (checked: 75 of 75 leaves null, 0 populated), and `chips` containing only a single `{label: "Total", value: <production_total>}` entry rather than the four category-specific chips shown above. The object exists; the numbers inside it don't yet. This section is not derived in the frontend, and today it has nothing to render beyond the total.

### 4.9 Game leaders

`game_leaders` is a direct backend-owned rank summary.

Required categories:
- `passing`
- `rushing`
- `receiving`
- `tackles`
- `havoc`

Each entry must include the relevant stat fields, such as:
- `player_key`
- `name`
- `team_id`
- `position`
- `yards`
- `touchdowns`
- `interceptions`
- `tackles`
- `havoc`

Matches what all five 2026 files ship today — no divergence here.

### 4.10 Drive summary

Each drive object must include:
- `drive_id`
- `offense_team`
- `defense_team`
- `quarter_start`
- `clock_start`
- `start_yardline_absolute`
- `quarter_end`
- `clock_end`
- `end_yardline_absolute`
- `possession_obtained_by`
- `plays_total`
- `yards_net`
- `result`
- `points`
- `is_long_field_drive`
- `drive_efficiency_rating`

**SHIPPING TODAY vs REQUIRED:** this flat shape is the target and is what every 2019-2025 game ships. **The five live 2026 files do not ship it.** They nest the same information instead — `start: { quarter, clock, spot_absolute, … }` and `end: { quarter, clock, spot_absolute, … }` in place of the six flat fields above — and add a large block of situational/enrichment data (`situation`, `enriched`, `uncounted_summary`, `play_ids`, `time_of_possession_seconds`, and more) not listed here at all. Anything reading `start_yardline_absolute` or `end_yardline_absolute` directly against a 2026 drive gets `undefined`, not an error — the Advanced Basics derivation fallback silently returned zero scoring opportunities for every 2026 game until it was pointed at `advanced_basics` instead. Pick one shape and ship it consistently across seasons, or version the block.

### 4.11 Play-by-play

Each play object must include:
- `play_id`
- `sequence`
- `quarter`
- `clock`
- `down`
- `distance`
- `yardline_absolute`
- `offense_team`
- `defense_team`
- `play_type`
- `raw_text`
- `actions`
- `no_play`
- `scoring_event`
- `scoring_type`
- `scoring_points`
- `turnover`
- `turnover_type`
- `yardline_after_absolute`
- `score_home_after`
- `score_away_after`
- `description`

Matches what ships today. `actions[]` was never specified beyond its name — see §4.12.

### 4.12 Play actions — the `actions[]` shape (new)

Every play carries an `actions` array, and its shape is what the entire Box Score tab is built from (rushing lanes, passing zones, target ledgers, tackle credit). This was undocumented; here is what actually ships, by `type`.

**Role fields changed shape between schemas.** In 2019-2025, `rusher` / `passer` / `receiver` / `sacked_player` / `intercepted_by` / `returner` are plain name strings (`"Shaw,Josh"`). In 2026 they are objects:

```json
{ "name_raw": "Shaw,Josh", "team": "meacscsu", "player_id": "PERS_00013540" }
```

A reader written against the string shape and pointed at the object shape does not throw — it silently stringifies to `"[object Object]"`, and every player using that role on that team collapses into one bucket. This happened in three places in the frontend before being caught by manual inspection, not by an error. **Recommend picking one shape** — the object is more useful (it carries `player_id`, which the string never did) and should become the standard for 2019-2025 too, rather than the frontend permanently branching on season.

**`RUSH`:**
```json
{ "type": "RUSH", "rusher": {…}, "direction": "right", "net_yards": 12, "is_tfl": false, "tacklers": [{…}] }
```
`direction` is new in 2026 and is real: populated on 338 of 339 carries (99.7%) across the five games, values `left` / `middle` / `right`. It did not exist on any 2019-2025 RUSH action — the equivalent information there lives only as a per-player aggregate on `individual_stats.rushing[].direction_breakdown`, not per carry.

**`PASS`:**
```json
{ "type": "PASS", "passer": {…}, "receiver": {…}, "net_yards": 13, "isComplete": true, "airyards": -2, "passDepth": "short", "targetDirection": "left", "tacklers": [{…}] }
```
`passDepth` (98% populated), `targetDirection` (96.7%), and `airyards` (98%) are all new in 2026 and real. `targetDirection` in particular closes a long-standing gap — the frontend was previously regexing direction out of `raw_text` with a `"middle"` default swallowing every miss.

**`SACK`:**
```json
{ "type": "SACK", "sacked_player": {…}, "net_yards": -4, "pressure_detected": true, "tacklers": [{…}] }
```

**`INTERCEPTION` / `INTERCEPTION_RETURN`** appear as separate actions on the same play as the `PASS` that was picked off:
```json
{ "type": "INTERCEPTION", "intercepted_by": {…}, "recovery_team": "meacscsu" }
{ "type": "INTERCEPTION_RETURN", "returner": {…}, "net_yards": 0, "tacklers": [{…}] }
```

None of this is in the frontend's control to invent — a card either has real direction/depth to draw with or it doesn't, and today that split is exactly: 2026 games real, 2019-2025 games not.

---

## 5. Required `advanced_basics` block

This block is the exact rendering payload for the Advanced Basics panel. It must be precomputed by the backend and rendered directly.

### Required structure

```json
{
  "advanced_basics": {
    "blocks": [
      {
        "label": "Drives",
        "metrics": [
          { "key": "drives", "label": "Drives", "away": 13, "home": 13 },
          { "key": "plays", "label": "Plays", "away": 63, "home": 63 },
          { "key": "yards", "label": "Yards", "away": 191, "home": 484 },
          { "key": "opps", "label": "Sc Opps", "away": 3, "home": 6 },
          { "key": "avgFp", "label": "Avg FP", "away": 33.46, "home": 35.38 }
        ]
      },
      {
        "label": "Turnovers",
        "metrics": [
          { "key": "turnovers", "label": "Turnovers", "away": 1, "home": 3 },
          { "key": "expectedTos", "label": "Expected TOs", "away": 1.1, "home": 0.9 },
          { "key": "toMargin", "label": "TO Margin", "away": -2, "home": 2 },
          { "key": "expectedToMargin", "label": "Expected TO Margin", "away": -0.2, "home": 0.2 },
          { "key": "toLuckPts", "label": "TO Luck (pts)", "away": -1.8, "home": 1.8 }
        ]
      },
      {
        "label": "Per Drive",
        "metrics": [
          { "key": "playsPerDrive", "label": "Plays/Drive", "away": 4.85, "home": 4.85 },
          { "key": "yardsPerPlay", "label": "Yards / Play", "away": 3.0, "home": 7.7 },
          { "key": "yardsPerDrive", "label": "Yards/Drive", "away": 14.7, "home": 37.2 },
          { "key": "oppsPerDrive", "label": "Opps/Drive", "away": 0.23, "home": 0.46 },
          { "key": "pointsPerOpp", "label": "Points/Opp", "away": 4.33, "home": 5.17 }
        ]
      },
      {
        "label": "SR By Qtr",
        "metrics": [
          { "key": "q1", "label": "Q1", "away": 0.27, "home": 0.52 },
          { "key": "q2", "label": "Q2", "away": 0.21, "home": 0.46 },
          { "key": "q3", "label": "Q3", "away": 0.18, "home": 0.54 },
          { "key": "q4", "label": "Q4", "away": 0.25, "home": 0.36 }
        ]
      },
      {
        "label": "Success Rt",
        "metrics": [
          { "key": "srRush", "label": "Rush", "away": 0.28, "home": 0.47 },
          { "key": "srPass", "label": "Pass", "away": 0.22, "home": 0.53 },
          { "key": "srStd", "label": "Std Dn", "away": 0.26, "home": 0.44 },
          { "key": "srPassDn", "label": "Pass Dn", "away": 0.32, "home": 0.49 },
          { "key": "srGame", "label": "Game", "away": 0.25, "home": 0.44 }
        ]
      }
    ]
  }
}
```

Matches what all five 2026 files ship today, key for key — this block needs no correction. It is also the one section this document can confirm actually landed as specified, so it's the model for how the rest of this contract should read once fixed.

### Exact Turnovers columns

Backend must provide this block exactly:
- `turnovers`
- `expectedTos`
- `toMargin`
- `expectedToMargin`
- `toLuckPts`

### Exact Per Drive columns

Backend must provide this block exactly:
- `playsPerDrive`
- `yardsPerPlay`
- `yardsPerDrive`
- `oppsPerDrive`
- `pointsPerOpp`

These are direct display fields. The frontend does not calculate them.

### Missing: league-average row

SP+-style advanced box scores print a third row under every block — a national/league average — and that row is what makes "6.3 plays per drive" mean anything on its own. Nothing in `advanced_basics` or elsewhere in this payload carries it. The frontend reserves the row and renders a dash until it exists. Tracked as `reqs/STATS_HUB_CARD_INVENTORY.md` ask #10.

---

## 6. `production_scores` — shape mismatch (new)

Not previously documented, and the one divergence that produces a hard crash rather than a blank field.

**Required / 2019-2025 shape** — an **array**:
```json
"production_scores": {
  "swacfamu": [
    {
      "player_key": "PERS_00010147",
      "name": "Bostic,Justin",
      "position": "DB",
      "production_total": 27.3,
      "components": { "hit_production": 0.84, "hawk_production": 13.02, "scrum_production": 0.0 }
    }
  ]
}
```

**Shipping today on all five 2026 files** — an **object** keyed by `player_key`, with every field renamed:
```json
"production_scores": {
  "swacfamu": {
    "PERS_00010147": {
      "name_raw": "Bostic,Justin",
      "team": "swacfamu",
      "position_assumed": "DB",
      "position_source": "profile",
      "production_score": { "hit_production": 0.84, "hawk_production": 13.02, "scrum_production": 0.0, "total": 13.86 }
    }
  }
}
```

The component keys inside (`passing_production`, `rushing_production`, `receiving_production`, `hit_production`, `hawk_production`, `scrum_production`) are identical in both — only the wrapper and the four outer field names moved. A frontend written against the array shape and given the object throws `TypeError: productionRows.find is not a function` in the box-score player spotlight; this was live before being caught. **Pick one shape.** If the object stays, keep the original field names (`name`, `position`, `production_total`, `components`) inside it rather than introducing a second vocabulary for the same four values.

---

## 7. Frontend restrictions

The frontend must not do any of the following on the current game page:

- calculate `advanced_basics` from `drive_summary` or `play_by_play` — except as the documented, temporary fallback for games with no `advanced_basics` block (§2)
- calculate `success_rate`, turnover margin, expected turnovers, or luck metrics locally
- calculate `win_probability` from score states or game simulation
- infer winner, records, or status from scratch
- generate notable performers by ranking raw production objects locally
- assemble game leaders from raw play-by-play without a direct backend payload
- parse display strings back into numbers
- infer classification fields from names or labels
- reshape `production_scores` or extract names out of action role objects — that's a compatibility shim for a schema disagreement, not derivation, and it goes away the day §6 is resolved

If a field is not explicitly sent by the backend, the frontend must not display it.

---

## 8. Frontend responsibilities

The frontend is allowed to:

- fetch the game payload
- resolve team branding and logos using team metadata
- render tabs, cards, and comparison blocks
- format numeric values and labels
- apply color and layout logic
- normalize the two known schema/shape divergences in §4.10 and §6 until the backend picks one shape for each
- render the already-computed backend payload

---

## 9. Backend deliverable checklist

Before this contract is considered live, the backend should confirm it can return all of the following:

- [ ] `game_id` + `game_path_id` (matching `game_stem`) + `route`
- [ ] both `away_team` and `home_team` with scores and resolved ids, and a stated definition for `record`
- [ ] `winner_team_id`
- [ ] `classification`
- [ ] `metadata` with site, attendance, weather, officials
- [ ] full `team_box` for both teams
- [ ] full `advanced_team` for both teams, including the 34 fields listed in §4.6 that are on 2019-2025 games but missing from 2026
- [ ] direct `win_probability` payload — confirm whether a per-play curve is also needed, and if so, restore `wpa` (or equivalent) on play rows
- [ ] `scoring_summary`
- [ ] `drive_summary` in ONE shape across seasons (§4.10)
- [ ] `play_by_play`, with `actions[]` role fields in ONE shape across seasons (§4.12)
- [ ] `production_scores` in ONE shape across seasons (§6)
- [ ] `individual_stats`, including `defense[].passes_defended` / `forced_fumbles` / `qb_hurries` — present on every 2019-2025 row, absent entirely from 2026 (`reqs/STATS_HUB_CARD_INVENTORY.md` ask #11)
- [ ] a per-player havoc log with real per-play location (`reqs/STATS_HUB_CARD_INVENTORY.md` ask #11) — the raw material (`tacklers[]`, `intercepted_by`, `broken_up_by`, `qb_hurried_by`, each with a real `yardline_absolute`) already exists on 2026 `play_by_play` actions; this is a reshape, not new modeling
- [ ] `notable_performers` with `stat_summary` actually populated, not null (§4.8)
- [ ] `game_leaders`
- [ ] exact `advanced_basics` block with the required labels and keys — **already delivered correctly**
- [ ] a league-average row for `advanced_basics` (§5)
- [ ] no frontend derivation required for any visible section, on any season

---

## 10. Final status

This is the production target for the current game page. The frontend is not the analytics layer. The backend supplies the display-ready game object and the frontend renders it — for the 2026 schema specifically, six sections still disagree with this contract (§4.6, §4.7/§4.12, §4.8, §4.10, §5's missing average row, §6) and two are fully absent from earlier seasons by design (§2). This document is the list of exactly what to close, in the order it's written.
