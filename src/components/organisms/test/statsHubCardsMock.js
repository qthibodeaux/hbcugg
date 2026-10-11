// GENERATED — lab mock for the Stats Hub context cards, read from the backend's
// real 2026 files (stats/team-analytics/). Regenerate rather than edit.

export const STATS_HUB_CARDS_MOCK = {
  "season": 2026,
  "through_week": 5,
  "cards": [
    {
      "card_id": "win_levers",
      "archetype": "win_levers",
      "title": "What Wins",
      "headline": "Offense Yards / Attempt tracks winning closer than anything else",
      "why": "Across 124 team-seasons, 2019–2026.",
      "stat": {
        "value": 0.544,
        "label": "Correlation with win %"
      },
      "viz": {
        "kind": "correlation_bars",
        "entries": [
          {
            "label": "Offense Yards / Attempt",
            "short": "OFF YPA",
            "r": 0.544
          },
          {
            "label": "Defense Explosive Pass Rate",
            "short": "DEF Expl",
            "r": -0.52
          },
          {
            "label": "Defense Yards / Attempt",
            "short": "DEF YPA",
            "r": -0.49
          },
          {
            "label": "Offense Explosive Pass Rate",
            "short": "OFF Expl",
            "r": 0.471
          },
          {
            "label": "Offense Completion Rate",
            "short": "OFF Comp",
            "r": 0.466
          },
          {
            "label": "Defense Pressure Rate",
            "short": "DEF Press",
            "r": 0.453
          },
          {
            "label": "Defense Rush Success",
            "short": "DEF Rush SR",
            "r": -0.43
          },
          {
            "label": "Offense Pressure Rate",
            "short": "OFF Press",
            "r": -0.426
          },
          {
            "label": "Defense Completion Rate",
            "short": "DEF Comp",
            "r": -0.424
          },
          {
            "label": "Defense Opportunity Rate",
            "short": "DEF Opp",
            "r": -0.408
          }
        ]
      }
    },
    {
      "card_id": "league_map",
      "archetype": "league_map",
      "title": "The League Map",
      "headline": "The whole league on the two numbers that win",
      "why": "Offense Yards / Attempt across, Defense Explosive Pass Rate up. Every team, no cutoff.",
      "viz": {
        "kind": "scatter_map",
        "x": {
          "label": "Offense Yards / Attempt",
          "unit": "pct",
          "better": "high"
        },
        "y": {
          "label": "Defense Explosive Pass Rate",
          "unit": "pct",
          "better": "low"
        },
        "points": [
          {
            "team_id": "meachu",
            "x": 8.4737,
            "y": 0.122
          },
          {
            "team_id": "meacnccu",
            "x": 3.9697,
            "y": 0.2381
          },
          {
            "team_id": "meacscsu",
            "x": 8.1707,
            "y": 0.05
          },
          {
            "team_id": "swacaamu",
            "x": 7.4,
            "y": 0.1261
          },
          {
            "team_id": "swacalc",
            "x": 10.7395,
            "y": 0.1837
          },
          {
            "team_id": "swacasu",
            "x": 6.5938,
            "y": 0.0781
          },
          {
            "team_id": "swacbcu",
            "x": 5.6875,
            "y": 0.087
          },
          {
            "team_id": "swacfamu",
            "x": 5.2857,
            "y": 0.1481
          },
          {
            "team_id": "swacgsu",
            "x": 9.7069,
            "y": 0.2097
          },
          {
            "team_id": "swacjsu",
            "x": 6.549,
            "y": 0.1111
          },
          {
            "team_id": "swacmvsu",
            "x": 6.3721,
            "y": 0.087
          },
          {
            "team_id": "swacpvamu",
            "x": 6.3684,
            "y": 0.1071
          },
          {
            "team_id": "swacsu",
            "x": 5.6588,
            "y": 0.1449
          },
          {
            "team_id": "swactsu",
            "x": 7.7692,
            "y": 0.1532
          },
          {
            "team_id": "swacuapb",
            "x": 6.6875,
            "y": 0.2105
          }
        ],
        "league": {
          "x": 7.028833333333334,
          "y": 0.13710666666666665
        }
      }
    },
    {
      "card_id": "metric_of_week",
      "archetype": "metric_of_week",
      "title": "Metric of the Week",
      "headline": "Offense Yards / Attempt: the spread",
      "why": "Moves with winning at r +0.544; the teams on the right are the ones it rewards.",
      "stat": {
        "team_id": "swacalc",
        "value": 10.7395,
        "label": "League leader",
        "display": "10.7"
      },
      "viz": {
        "kind": "distribution",
        "unit": "num",
        "metric": "Offense Yards / Attempt",
        "league": 7.028833333333334,
        "entries": [
          {
            "team_id": "swacalc",
            "value": 10.7395,
            "record": "3-3"
          },
          {
            "team_id": "swacgsu",
            "value": 9.7069,
            "record": "3-2"
          },
          {
            "team_id": "meachu",
            "value": 8.4737,
            "record": "2-3"
          },
          {
            "team_id": "meacscsu",
            "value": 8.1707,
            "record": "5-1"
          },
          {
            "team_id": "swactsu",
            "value": 7.7692,
            "record": "1-4"
          },
          {
            "team_id": "swacaamu",
            "value": 7.4,
            "record": "4-2"
          },
          {
            "team_id": "swacuapb",
            "value": 6.6875,
            "record": "3-2"
          },
          {
            "team_id": "swacasu",
            "value": 6.5938,
            "record": "3-2"
          },
          {
            "team_id": "swacjsu",
            "value": 6.549,
            "record": "5-0"
          },
          {
            "team_id": "swacmvsu",
            "value": 6.3721,
            "record": "2-4"
          },
          {
            "team_id": "swacpvamu",
            "value": 6.3684,
            "record": "2-4"
          },
          {
            "team_id": "swacbcu",
            "value": 5.6875,
            "record": "3-2"
          },
          {
            "team_id": "swacsu",
            "value": 5.6588,
            "record": "2-4"
          },
          {
            "team_id": "swacfamu",
            "value": 5.2857,
            "record": "1-4"
          },
          {
            "team_id": "meacnccu",
            "value": 3.9697,
            "record": "2-4"
          }
        ]
      }
    },
    {
      "card_id": "record_ahead",
      "archetype": "record_ahead",
      "title": "Doesn't Add Up",
      "headline": "Winning more than the numbers say they should",
      "why": "3-2 overall · #6 by win %, #15 by team rating.",
      "stat": {
        "team_id": "swacgsu",
        "value": 9,
        "display": "+9",
        "label": "Places, record vs rating"
      },
      "viz": {
        "kind": "rank_gap",
        "record_rank": 6,
        "rating_rank": 15,
        "total": 15,
        "record": "3-2",
        "rating_display": "-0.019"
      }
    },
    {
      "card_id": "rating_ahead",
      "archetype": "rating_ahead",
      "title": "Doesn't Add Up",
      "headline": "Better than their record",
      "why": "2-4 overall · #12 by win %, #3 by team rating.",
      "stat": {
        "team_id": "swacpvamu",
        "value": -9,
        "display": "-9",
        "label": "Places, record vs rating"
      },
      "viz": {
        "kind": "rank_gap",
        "record_rank": 12,
        "rating_rank": 3,
        "total": 15,
        "record": "2-4",
        "rating_display": "+0.025"
      }
    },
    {
      "card_id": "dead_metric",
      "archetype": "dead_metric",
      "title": "Doesn't Matter",
      "headline": "Defense Power Stop Rate tells you almost nothing about winning",
      "why": "r -0.034 — against 0.544 for Offense Yards / Attempt.",
      "stat": {
        "value": -0.034,
        "label": "Correlation with win %"
      },
      "viz": {
        "kind": "dumbbell",
        "rows": [
          {
            "label": "Defense Power Stop Rate",
            "r": -0.034,
            "tone": "muted"
          },
          {
            "label": "Offense Yards / Attempt",
            "r": 0.544,
            "tone": "accent"
          }
        ]
      }
    },
    {
      "card_id": "twins",
      "archetype": "statistical_twins",
      "title": "Statistical Twins",
      "headline": "The same team in two different uniforms",
      "why": "Closest pair across the eight levers that predict winning — 1-4 and 3-2.",
      "stat": {
        "value": 20,
        "label": "Avg percentile gap"
      },
      "viz": {
        "kind": "twin_bars",
        "a": "swactsu",
        "b": "swacuapb",
        "axes": [
          {
            "label": "OFF YPA",
            "a": 71,
            "b": 57
          },
          {
            "label": "DEF Expl",
            "a": 29,
            "b": 7
          },
          {
            "label": "DEF YPA",
            "a": 43,
            "b": 21
          },
          {
            "label": "OFF Expl",
            "a": 71,
            "b": 50
          },
          {
            "label": "OFF Comp",
            "a": 29,
            "b": 39
          },
          {
            "label": "DEF Press",
            "a": 14,
            "b": 7
          },
          {
            "label": "DEF Rush SR",
            "a": 29,
            "b": 36
          },
          {
            "label": "OFF Press",
            "a": 43,
            "b": 79
          }
        ]
      }
    },
    {
      "card_id": "fingerprint",
      "archetype": "team_fingerprint",
      "title": "Team Fingerprint",
      "headline": "The most distinctive profile in the league",
      "why": "Furthest from average across every lever that predicts winning.",
      "stat": {
        "team_id": "meacnccu",
        "value": 45,
        "label": "Avg pts from the 50th"
      },
      "viz": {
        "kind": "radar",
        "team_id": "meacnccu",
        "axes": [
          {
            "label": "OFF YPA",
            "value": 0
          },
          {
            "label": "DEF Expl",
            "value": 0
          },
          {
            "label": "DEF YPA",
            "value": 7
          },
          {
            "label": "OFF Expl",
            "value": 0
          },
          {
            "label": "OFF Comp",
            "value": 7
          },
          {
            "label": "DEF Press",
            "value": 93
          },
          {
            "label": "DEF Rush SR",
            "value": 0
          },
          {
            "label": "OFF Press",
            "value": 21
          }
        ]
      }
    },
    {
      "card_id": "production_leader",
      "archetype": "production_leader",
      "title": "Production Leader",
      "headline": "Jaylon Tolbert has produced more than anyone",
      "why": "QB · 3 games · 33.8 per game.",
      "stat": {
        "value": 101.26,
        "display": "101.3",
        "label": "Season production"
      },
      "viz": {
        "kind": "rank_bars",
        "person": {
          "name": "Jaylon Tolbert",
          "last_name": "Tolbert",
          "image_url": "https://alcornsports.com/images/2026/8/25/BUCC9563_6ecSX.JPG",
          "team_id": "swacalc",
          "position": "QB"
        },
        "entries": [
          {
            "label": "Tolbert",
            "team_id": "swacalc",
            "value": 101.3,
            "is_subject": true
          },
          {
            "label": "Brown",
            "team_id": "swacaamu",
            "value": 67.1,
            "is_subject": false
          },
          {
            "label": "Carter",
            "team_id": "swacpvamu",
            "value": 66.9,
            "is_subject": false
          },
          {
            "label": "McCoy",
            "team_id": "swactsu",
            "value": 62.4,
            "is_subject": false
          },
          {
            "label": "Davis",
            "team_id": "swacuapb",
            "value": 44.6,
            "is_subject": false
          },
          {
            "label": "Thompson",
            "team_id": "swactsu",
            "value": 44.1,
            "is_subject": false
          }
        ]
      }
    },
    {
      "card_id": "conference_gap",
      "archetype": "conference_gap",
      "title": "SWAC vs MEAC",
      "headline": "The conferences split most on Defense Completion Rate",
      "why": "1.06 standard deviations apart.",
      "stat": {
        "value": 1.06,
        "label": "Std devs apart"
      },
      "viz": {
        "kind": "conference_split",
        "metric": "Defense Completion Rate",
        "unit": "pct",
        "better": "low",
        "groups": [
          {
            "label": "SWAC",
            "value": 0.5973166666666666,
            "teams": 12
          },
          {
            "label": "MEAC",
            "value": 0.5236333333333333,
            "teams": 3
          }
        ]
      }
    },
    {
      "card_id": "parity",
      "archetype": "parity_index",
      "title": "Parity Index",
      "headline": "2026 is more balanced than most seasons",
      "why": "Spread of win % across the 18 — lower is more even.",
      "stat": {
        "value": 0.2126,
        "display": "0.213",
        "label": "Win % spread"
      },
      "viz": {
        "kind": "season_trend",
        "entries": [
          {
            "label": "2019",
            "value": 0.2268,
            "highlight": false
          },
          {
            "label": "2021",
            "value": 0.1933,
            "highlight": false
          },
          {
            "label": "2022",
            "value": 0.2195,
            "highlight": false
          },
          {
            "label": "2023",
            "value": 0.2184,
            "highlight": false
          },
          {
            "label": "2024",
            "value": 0.211,
            "highlight": false
          },
          {
            "label": "2025",
            "value": 0.2158,
            "highlight": false
          },
          {
            "label": "2026",
            "value": 0.2126,
            "highlight": true
          }
        ]
      }
    }
  ]
};
