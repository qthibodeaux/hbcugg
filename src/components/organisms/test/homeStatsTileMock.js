// Generated mock for the Home Stats Tile lab (contract shape, plus `data`).
// Real where noted in MOCK_SOURCE; everything else is placeholder.
export const MOCK_TILE = {
 "season": 2026,
 "week": 4,
 "week_label": "Week 4",
 "rotation": [
  "metric_of_week",
  "league_map",
  "adjusted_leader",
  "efficiency_king",
  "win_lever"
 ],
 "items": [
  {
   "key": "metric_of_week",
   "title": "Metric of the Week",
   "headline": "Alcorn takes more of the field than anyone",
   "value_kind": "team",
   "teams": [
    "swacalc"
   ],
   "primary": {
    "value": 0.6197,
    "display": "62%",
    "label": "Available yards"
   },
   "compare": {
    "display": "44%",
    "label": "League avg"
   },
   "data": {
    "metric_label": "Available yards %",
    "leader_id": "swacalc",
    "league_avg": 0.4388,
    "league_avg_display": "44%",
    "values": [
     {
      "team_id": "swacfamu",
      "value": 0.1701,
      "display": "17%"
     },
     {
      "team_id": "swacmvsu",
      "value": 0.2368,
      "display": "24%"
     },
     {
      "team_id": "swacbcu",
      "value": 0.2964,
      "display": "30%"
     },
     {
      "team_id": "swacgsu",
      "value": 0.3679,
      "display": "37%"
     },
     {
      "team_id": "swacasu",
      "value": 0.3986,
      "display": "40%"
     },
     {
      "team_id": "swacsu",
      "value": 0.4097,
      "display": "41%"
     },
     {
      "team_id": "swacjsu",
      "value": 0.458,
      "display": "46%"
     },
     {
      "team_id": "swactsu",
      "value": 0.4674,
      "display": "47%"
     },
     {
      "team_id": "meacnccu",
      "value": 0.4697,
      "display": "47%"
     },
     {
      "team_id": "meacscsu",
      "value": 0.5164,
      "display": "52%"
     },
     {
      "team_id": "meachu",
      "value": 0.5175,
      "display": "52%"
     },
     {
      "team_id": "swacpvamu",
      "value": 0.529,
      "display": "53%"
     },
     {
      "team_id": "swacaamu",
      "value": 0.5436,
      "display": "54%"
     },
     {
      "team_id": "swacuapb",
      "value": 0.5818,
      "display": "58%"
     },
     {
      "team_id": "swacalc",
      "value": 0.6197,
      "display": "62%"
     }
    ]
   },
   "why": ""
  },
  {
   "key": "league_map",
   "title": "League Map",
   "headline": "Jackson State is good on both sides of the ball",
   "value_kind": "league",
   "teams": [],
   "primary": {
    "value": null,
    "display": "",
    "label": "Offense vs defense EPA/play"
   },
   "compare": null,
   "data": {
    "x_label": "Offense EPA/play",
    "y_label": "Defense EPA/play allowed",
    "y_lower_is_better": true,
    "league_x": -0.017,
    "league_y": 0.012,
    "teams": [
     {
      "team_id": "meachu",
      "x": 0.0532,
      "y": 0.0342
     },
     {
      "team_id": "meacnccu",
      "x": -0.0326,
      "y": 0.3963
     },
     {
      "team_id": "meacscsu",
      "x": 0.0268,
      "y": -0.2865
     },
     {
      "team_id": "swacaamu",
      "x": 0.0159,
      "y": -0.1563
     },
     {
      "team_id": "swacalc",
      "x": 0.233,
      "y": 0.2151
     },
     {
      "team_id": "swacasu",
      "x": -0.1186,
      "y": -0.2709
     },
     {
      "team_id": "swacbcu",
      "x": -0.0068,
      "y": 0.2597
     },
     {
      "team_id": "swacfamu",
      "x": -0.4701,
      "y": -0.1015
     },
     {
      "team_id": "swacgsu",
      "x": -0.0074,
      "y": 0.0476
     },
     {
      "team_id": "swacjsu",
      "x": 0.2247,
      "y": -0.0653
     },
     {
      "team_id": "swacmvsu",
      "x": -0.4291,
      "y": -0.3147
     },
     {
      "team_id": "swacpvamu",
      "x": 0.0551,
      "y": -0.041
     },
     {
      "team_id": "swacsu",
      "x": -0.098,
      "y": 0.1306
     },
     {
      "team_id": "swactsu",
      "x": 0.189,
      "y": 0.0991
     },
     {
      "team_id": "swacuapb",
      "x": 0.1098,
      "y": 0.233
     }
    ]
   },
   "why": ""
  },
  {
   "key": "adjusted_leader",
   "title": "Best Team, Adjusted",
   "headline": "SCSU sits on top once the schedule is accounted for",
   "value_kind": "team",
   "teams": [
    "meacscsu"
   ],
   "primary": {
    "value": 0.3133,
    "display": "+0.31",
    "label": "Net adj. EPA/play"
   },
   "compare": null,
   "data": {
    "rows": [
     {
      "team_id": "meacscsu",
      "value": 0.3133,
      "display": "+0.31"
     },
     {
      "team_id": "swacjsu",
      "value": 0.29,
      "display": "+0.29"
     },
     {
      "team_id": "swacaamu",
      "value": 0.1722,
      "display": "+0.17"
     },
     {
      "team_id": "swacasu",
      "value": 0.1523,
      "display": "+0.15"
     },
     {
      "team_id": "swacpvamu",
      "value": 0.0961,
      "display": "+0.10"
     },
     {
      "team_id": "swactsu",
      "value": 0.0899,
      "display": "+0.09"
     },
     {
      "team_id": "meachu",
      "value": 0.019,
      "display": "+0.02"
     },
     {
      "team_id": "swacalc",
      "value": 0.0179,
      "display": "+0.02"
     },
     {
      "team_id": "swacgsu",
      "value": -0.055,
      "display": "-0.06"
     },
     {
      "team_id": "swacmvsu",
      "value": -0.1144,
      "display": "-0.11"
     },
     {
      "team_id": "swacuapb",
      "value": -0.1232,
      "display": "-0.12"
     },
     {
      "team_id": "swacsu",
      "value": -0.2286,
      "display": "-0.23"
     },
     {
      "team_id": "swacbcu",
      "value": -0.2665,
      "display": "-0.27"
     },
     {
      "team_id": "swacfamu",
      "value": -0.3686,
      "display": "-0.37"
     },
     {
      "team_id": "meacnccu",
      "value": -0.4289,
      "display": "-0.43"
     }
    ]
   },
   "why": ""
  },
  {
   "key": "efficiency_king",
   "title": "Efficiency King",
   "headline": "Alcorn stays on schedule more than anyone",
   "value_kind": "team",
   "teams": [
    "swacalc"
   ],
   "primary": {
    "value": 0.5114,
    "display": "51%",
    "label": "Success rate"
   },
   "compare": {
    "display": "40%",
    "label": "League avg"
   },
   "data": {
    "team_id": "swacalc",
    "rate": 0.5114,
    "league_rate": 0.397
   },
   "why": ""
  },
  {
   "key": "win_lever",
   "title": "Win Lever",
   "headline": "Stopping the run predicts winning better than anything else",
   "value_kind": "number",
   "teams": [],
   "primary": {
    "value": -0.543,
    "display": "-0.54",
    "label": "Correlation with win %"
   },
   "compare": null,
   "data": {
    "metric_label": "Defense Rush Success Rate",
    "r": -0.543,
    "x_lower_is_better": true,
    "points": [
     {
      "team_id": "swacalc",
      "x": 0.3321,
      "y": 0.3846
     },
     {
      "team_id": "swacaamu",
      "x": 0.4578,
      "y": 0.3077
     },
     {
      "team_id": "swacasu",
      "x": 0.4508,
      "y": 0.7692
     },
     {
      "team_id": "swacbcu",
      "x": 0.4581,
      "y": 0.4615
     },
     {
      "team_id": "swacfamu",
      "x": 0.4478,
      "y": 0.3846
     },
     {
      "team_id": "swacjsu",
      "x": 0.3989,
      "y": 0.7778
     },
     {
      "team_id": "swacmvsu",
      "x": 0.5137,
      "y": 0.1429
     },
     {
      "team_id": "swacpvamu",
      "x": 0.3552,
      "y": 0.7692
     },
     {
      "team_id": "swacsu",
      "x": 0.4284,
      "y": 0.1538
     },
     {
      "team_id": "swactsu",
      "x": 0.454,
      "y": 0.5455
     },
     {
      "team_id": "swacuapb",
      "x": 0.4858,
      "y": 0.3333
     },
     {
      "team_id": "swacgsu",
      "x": 0.386,
      "y": 0.6154
     },
     {
      "team_id": "meacdsu",
      "x": 0.4314,
      "y": 0.6667
     },
     {
      "team_id": "meachu",
      "x": 0.3943,
      "y": 0.5
     },
     {
      "team_id": "meacmsu",
      "x": 0.4901,
      "y": 0.3333
     },
     {
      "team_id": "meacnccu",
      "x": 0.3688,
      "y": 0.6667
     },
     {
      "team_id": "meacnsu",
      "x": 0.4645,
      "y": 0.0833
     },
     {
      "team_id": "meacscsu",
      "x": 0.379,
      "y": 0.75
     }
    ]
   },
   "why": ""
  },
  {
   "key": "noise_stat",
   "title": "Noise Stat",
   "headline": "Offense TFL Rate tells you almost nothing about winning",
   "value_kind": "number",
   "teams": [],
   "primary": {
    "value": -0.007,
    "display": "-0.01",
    "label": "Correlation with win %"
   },
   "compare": null,
   "data": {
    "metric_label": "Offense TFL Rate",
    "r": -0.007,
    "points": [
     {
      "team_id": "swacalc",
      "x": 0.06,
      "y": 0.3846
     },
     {
      "team_id": "swacaamu",
      "x": 0.0691,
      "y": 0.3077
     },
     {
      "team_id": "swacasu",
      "x": 0.0476,
      "y": 0.7692
     },
     {
      "team_id": "swacbcu",
      "x": 0.0441,
      "y": 0.4615
     },
     {
      "team_id": "swacfamu",
      "x": 0.0571,
      "y": 0.3846
     },
     {
      "team_id": "swacjsu",
      "x": 0.0775,
      "y": 0.7778
     },
     {
      "team_id": "swacmvsu",
      "x": 0.0618,
      "y": 0.1429
     },
     {
      "team_id": "swacpvamu",
      "x": 0.0699,
      "y": 0.7692
     },
     {
      "team_id": "swacsu",
      "x": 0.0517,
      "y": 0.1538
     },
     {
      "team_id": "swactsu",
      "x": 0.0495,
      "y": 0.5455
     },
     {
      "team_id": "swacuapb",
      "x": 0.0532,
      "y": 0.3333
     },
     {
      "team_id": "swacgsu",
      "x": 0.057,
      "y": 0.6154
     },
     {
      "team_id": "meacdsu",
      "x": 0.0591,
      "y": 0.6667
     },
     {
      "team_id": "meachu",
      "x": 0.0419,
      "y": 0.5
     },
     {
      "team_id": "meacmsu",
      "x": 0.0627,
      "y": 0.3333
     },
     {
      "team_id": "meacnccu",
      "x": 0.0739,
      "y": 0.6667
     },
     {
      "team_id": "meacnsu",
      "x": 0.045,
      "y": 0.0833
     },
     {
      "team_id": "meacscsu",
      "x": 0.0805,
      "y": 0.75
     }
    ]
   },
   "why": ""
  },
  {
   "key": "better_than_record",
   "title": "Better Than Their Record",
   "headline": "Norfolk State is better than 1-11",
   "value_kind": "team",
   "teams": [
    "meacnsu"
   ],
   "primary": {
    "value": 8,
    "display": "8 spots",
    "label": "Record rank vs profile rank"
   },
   "compare": null,
   "data": {
    "team_id": "meacnsu",
    "record": "1-11",
    "record_rank": 18,
    "profile_rank": 10,
    "ranked_teams": 18
   },
   "why": ""
  },
  {
   "key": "ahead_of_numbers",
   "title": "Winning Ahead of the Numbers",
   "headline": "Texas Southern is winning more than its numbers say",
   "value_kind": "team",
   "teams": [
    "swactsu"
   ],
   "primary": {
    "value": -4,
    "display": "4 spots",
    "label": "Record rank vs profile rank"
   },
   "compare": null,
   "data": {
    "team_id": "swactsu",
    "record": "6-5",
    "record_rank": 8,
    "profile_rank": 12,
    "ranked_teams": 18
   },
   "why": ""
  },
  {
   "key": "statistical_twins",
   "title": "Statistical Twins",
   "headline": "Delaware State and FAMU are statistically the same team",
   "value_kind": "pair",
   "teams": [
    "meacdsu",
    "swacfamu"
   ],
   "primary": {
    "value": 0.76,
    "display": "0.76",
    "label": "Profile distance"
   },
   "compare": null,
   "data": {
    "levers": [
     {
      "label": "DEF Rush SR",
      "a": 0.08,
      "b": 0.41
     },
     {
      "label": "DEF YPA",
      "a": 0.71,
      "b": -0.22
     },
     {
      "label": "OFF Rush SR",
      "a": -0.44,
      "b": -0.61
     },
     {
      "label": "DEF Expl",
      "a": 0.54,
      "b": 0.39
     },
     {
      "label": "OFF YPA",
      "a": 0.38,
      "b": -0.07
     },
     {
      "label": "DEF Comp",
      "a": -0.58,
      "b": 0.02
     }
    ]
   },
   "why": ""
  },
  {
   "key": "one_of_a_kind",
   "title": "One of a Kind",
   "headline": "Mississippi Valley State looks like no one else in the league",
   "value_kind": "team",
   "teams": [
    "swacmvsu"
   ],
   "primary": {
    "value": 1.2804,
    "display": "1.28",
    "label": "Distance from average"
   },
   "compare": null,
   "data": {
    "team_id": "swacmvsu",
    "distances": [
     {
      "team_id": "swacalc",
      "value": 0.805
     },
     {
      "team_id": "swacaamu",
      "value": 0.657
     },
     {
      "team_id": "swacasu",
      "value": 1.212
     },
     {
      "team_id": "swacbcu",
      "value": 0.976
     },
     {
      "team_id": "swacfamu",
      "value": 0.476
     },
     {
      "team_id": "swacjsu",
      "value": 1.089
     },
     {
      "team_id": "swacmvsu",
      "value": 1.28
     },
     {
      "team_id": "swacpvamu",
      "value": 0.941
     },
     {
      "team_id": "swacsu",
      "value": 0.58
     },
     {
      "team_id": "swactsu",
      "value": 0.618
     },
     {
      "team_id": "swacuapb",
      "value": 0.849
     },
     {
      "team_id": "swacgsu",
      "value": 0.755
     },
     {
      "team_id": "meacdsu",
      "value": 0.462
     },
     {
      "team_id": "meachu",
      "value": 1.209
     },
     {
      "team_id": "meacmsu",
      "value": 0.661
     },
     {
      "team_id": "meacnccu",
      "value": 0.729
     },
     {
      "team_id": "meacnsu",
      "value": 0.69
     },
     {
      "team_id": "meacscsu",
      "value": 0.712
     }
    ]
   },
   "why": ""
  },
  {
   "key": "conference_split",
   "title": "SWAC vs MEAC",
   "headline": "The conferences play at the same efficiency so far",
   "value_kind": "league",
   "teams": [],
   "primary": {
    "value": -0.0188,
    "display": "-1.9 pts",
    "label": "Success rate gap"
   },
   "compare": null,
   "data": {
    "metric_label": "Success rate",
    "swac": {
     "value": 0.3932,
     "display": "39.3%"
    },
    "meac": {
     "value": 0.4121,
     "display": "41.2%"
    }
   },
   "why": ""
  },
  {
   "key": "parity_meter",
   "title": "Parity Meter",
   "headline": "2025 is more top-heavy than most seasons on record",
   "value_kind": "league",
   "teams": [],
   "primary": {
    "value": 0.2224,
    "display": "0.222",
    "label": "Win % spread"
   },
   "compare": null,
   "data": {
    "current": 2025,
    "seasons": [
     {
      "season": 2019,
      "spread": 0.2599,
      "display": "0.260"
     },
     {
      "season": 2021,
      "spread": 0.2045,
      "display": "0.204"
     },
     {
      "season": 2022,
      "spread": 0.216,
      "display": "0.216"
     },
     {
      "season": 2023,
      "spread": 0.2328,
      "display": "0.233"
     },
     {
      "season": 2024,
      "spread": 0.2201,
      "display": "0.220"
     },
     {
      "season": 2025,
      "spread": 0.2224,
      "display": "0.222"
     }
    ]
   },
   "why": ""
  },
  {
   "key": "biggest_mover",
   "title": "Biggest Mover",
   "headline": "Prairie View jumped more than anyone this week",
   "value_kind": "team",
   "teams": [
    "swacpvamu"
   ],
   "primary": {
    "value": 0.31,
    "display": "+0.31",
    "label": "EPA/play, week over week"
   },
   "compare": null,
   "data": {
    "metric_label": "EPA/play",
    "team_id": "swacpvamu",
    "teams": [
     {
      "team_id": "meacdsu",
      "before": -0.122,
      "after": -0.11
     },
     {
      "team_id": "meachu",
      "before": -0.217,
      "after": -0.234
     },
     {
      "team_id": "meacmsu",
      "before": 0.058,
      "after": 0.134
     },
     {
      "team_id": "meacnccu",
      "before": -0.26,
      "after": -0.333
     },
     {
      "team_id": "meacnsu",
      "before": -0.005,
      "after": 0.052
     },
     {
      "team_id": "meacscsu",
      "before": -0.099,
      "after": -0.133
     },
     {
      "team_id": "swacaamu",
      "before": -0.268,
      "after": -0.325
     },
     {
      "team_id": "swacalc",
      "before": -0.021,
      "after": -0.082
     },
     {
      "team_id": "swacasu",
      "before": -0.279,
      "after": -0.31
     },
     {
      "team_id": "swacbcu",
      "before": -0.061,
      "after": -0.01
     },
     {
      "team_id": "swacfamu",
      "before": -0.262,
      "after": -0.313
     },
     {
      "team_id": "swacgsu",
      "before": -0.25,
      "after": -0.237
     },
     {
      "team_id": "swacjsu",
      "before": -0.067,
      "after": -0.045
     },
     {
      "team_id": "swacmvsu",
      "before": 0.155,
      "after": 0.135
     },
     {
      "team_id": "swacpvamu",
      "before": -0.232,
      "after": 0.078
     },
     {
      "team_id": "swacsu",
      "before": -0.177,
      "after": -0.247
     },
     {
      "team_id": "swactsu",
      "before": 0.045,
      "after": -0.025
     },
     {
      "team_id": "swacuapb",
      "before": 0.221,
      "after": 0.174
     }
    ]
   },
   "why": ""
  },
  {
   "key": "points_per_drive",
   "title": "Points Per Drive",
   "headline": "Alcorn turns a possession into points better than anyone",
   "value_kind": "team",
   "teams": [
    "swacalc"
   ],
   "primary": {
    "value": 2.77,
    "display": "2.77",
    "label": "Points per drive"
   },
   "compare": null,
   "data": {
    "team_id": "swacalc",
    "drives": [
     {
      "points": 0
     },
     {
      "points": 3
     },
     {
      "points": 0
     },
     {
      "points": 7
     },
     {
      "points": 7
     },
     {
      "points": 0
     },
     {
      "points": 0
     },
     {
      "points": 0
     },
     {
      "points": 0
     },
     {
      "points": 0
     },
     {
      "points": 7
     },
     {
      "points": 7
     },
     {
      "points": 3
     },
     {
      "points": 0
     },
     {
      "points": 0
     },
     {
      "points": 7
     },
     {
      "points": 7
     },
     {
      "points": 7
     },
     {
      "points": 3
     },
     {
      "points": 0
     },
     {
      "points": 0
     },
     {
      "points": 3
     }
    ]
   },
   "why": ""
  },
  {
   "key": "explosive_drives",
   "title": "Explosive Drives",
   "headline": "Alcorn gets chunk drives a third of the time",
   "value_kind": "team",
   "teams": [
    "swacalc"
   ],
   "primary": {
    "value": 0.33,
    "display": "33%",
    "label": "Explosive drive rate"
   },
   "compare": null,
   "data": {
    "team_id": "swacalc",
    "drives": [
     {
      "yards": 80,
      "plays": 8,
      "explosive": true
     },
     {
      "yards": 80,
      "plays": 11,
      "explosive": true
     },
     {
      "yards": 35,
      "plays": 7,
      "explosive": false
     },
     {
      "yards": 12,
      "plays": 3,
      "explosive": false
     },
     {
      "yards": 4,
      "plays": 3,
      "explosive": false
     },
     {
      "yards": 15,
      "plays": 3,
      "explosive": false
     },
     {
      "yards": 22,
      "plays": 5,
      "explosive": false
     },
     {
      "yards": 55,
      "plays": 13,
      "explosive": true
     },
     {
      "yards": 80,
      "plays": 9,
      "explosive": true
     },
     {
      "yards": 22,
      "plays": 3,
      "explosive": false
     },
     {
      "yards": 12,
      "plays": 3,
      "explosive": false
     },
     {
      "yards": 8,
      "plays": 3,
      "explosive": false
     },
     {
      "yards": 35,
      "plays": 4,
      "explosive": false
     },
     {
      "yards": 80,
      "plays": 13,
      "explosive": true
     },
     {
      "yards": 35,
      "plays": 5,
      "explosive": false
     },
     {
      "yards": 55,
      "plays": 9,
      "explosive": false
     },
     {
      "yards": 15,
      "plays": 3,
      "explosive": false
     },
     {
      "yards": 48,
      "plays": 7,
      "explosive": true
     },
     {
      "yards": 15,
      "plays": 3,
      "explosive": false
     },
     {
      "yards": 62,
      "plays": 7,
      "explosive": true
     },
     {
      "yards": 8,
      "plays": 3,
      "explosive": false
     },
     {
      "yards": 15,
      "plays": 3,
      "explosive": false
     },
     {
      "yards": 48,
      "plays": 7,
      "explosive": true
     },
     {
      "yards": 55,
      "plays": 14,
      "explosive": false
     }
    ],
    "league_rate": 0.19
   },
   "why": ""
  },
  {
   "key": "finishing_drives",
   "title": "Finishing Drives",
   "headline": "Jackson State cashes in when it gets inside the 40",
   "value_kind": "team",
   "teams": [
    "swacjsu"
   ],
   "primary": {
    "value": 5.1,
    "display": "5.1",
    "label": "Points per opportunity"
   },
   "compare": null,
   "data": {
    "team_id": "swacjsu",
    "opportunities": 14,
    "points": 71,
    "league_value": 4.0,
    "league_display": "4.0",
    "trips": [
     {
      "result": "T"
     },
     {
      "result": "T"
     },
     {
      "result": "T"
     },
     {
      "result": "F"
     },
     {
      "result": "T"
     },
     {
      "result": "T"
     },
     {
      "result": "T"
     },
     {
      "result": "O"
     },
     {
      "result": "T"
     },
     {
      "result": "F"
     },
     {
      "result": "T"
     },
     {
      "result": "T"
     },
     {
      "result": "T"
     },
     {
      "result": "T"
     }
    ]
   },
   "why": ""
  },
  {
   "key": "havoc_leader",
   "title": "Havoc Leader",
   "headline": "Texas Southern wrecks one of every five snaps",
   "value_kind": "team",
   "teams": [
    "swactsu"
   ],
   "primary": {
    "value": 0.21,
    "display": "21%",
    "label": "Havoc rate"
   },
   "compare": {
    "display": "14%",
    "label": "League avg"
   },
   "data": {
    "team_id": "swactsu",
    "havoc_plays": 42,
    "snaps": 200,
    "league_rate": 0.144
   },
   "why": ""
  },
  {
   "key": "havoc_split",
   "title": "Front Seven vs Secondary",
   "headline": "Jackson State's havoc lives up front",
   "value_kind": "team",
   "teams": [
    "swacjsu"
   ],
   "primary": {
    "value": 0.17,
    "display": "17%",
    "label": "Front-seven havoc"
   },
   "compare": null,
   "data": {
    "team_id": "swacjsu",
    "front_seven": {
     "rate": 0.17,
     "display": "17%"
    },
    "db": {
     "rate": 0.04,
     "display": "4%"
    },
    "league_front_seven": 0.11,
    "league_db": 0.04
   },
   "why": ""
  },
  {
   "key": "drive_killers",
   "title": "Drive Killers",
   "headline": "SCSU ends half its opponents' drives with a punt or a takeaway",
   "value_kind": "team",
   "teams": [
    "meacscsu"
   ],
   "primary": {
    "value": 0.57,
    "display": "57%",
    "label": "Drive stop rate"
   },
   "compare": null,
   "data": {
    "team_id": "meacscsu",
    "drives": [
     {
      "result": "punt"
     },
     {
      "result": "turnover"
     },
     {
      "result": "punt"
     },
     {
      "result": "downs"
     },
     {
      "result": "downs"
     },
     {
      "result": "punt"
     },
     {
      "result": "punt"
     },
     {
      "result": "td"
     },
     {
      "result": "punt"
     },
     {
      "result": "punt"
     },
     {
      "result": "half"
     },
     {
      "result": "turnover"
     },
     {
      "result": "td"
     },
     {
      "result": "turnover"
     },
     {
      "result": "td"
     },
     {
      "result": "punt"
     },
     {
      "result": "td"
     },
     {
      "result": "fg"
     },
     {
      "result": "turnover"
     },
     {
      "result": "td"
     },
     {
      "result": "td"
     },
     {
      "result": "punt"
     },
     {
      "result": "td"
     },
     {
      "result": "downs"
     },
     {
      "result": "punt"
     },
     {
      "result": "punt"
     },
     {
      "result": "fg"
     },
     {
      "result": "turnover"
     },
     {
      "result": "td"
     },
     {
      "result": "fg"
     }
    ]
   },
   "why": ""
  },
  {
   "key": "third_down_over_expected",
   "title": "Third Down Over Expected",
   "headline": "Texas Southern converts third downs it should not",
   "value_kind": "team",
   "teams": [
    "swactsu"
   ],
   "primary": {
    "value": 0.12,
    "display": "+12%",
    "label": "Over expected"
   },
   "compare": null,
   "data": {
    "team_id": "swactsu",
    "actual": 0.5217,
    "expected": 0.4017,
    "attempts": 23
   },
   "why": ""
  },
  {
   "key": "turnover_luck",
   "title": "Turnover Luck",
   "headline": "Florida A&M has been on the wrong end of the bounces",
   "value_kind": "team",
   "teams": [
    "swacfamu"
   ],
   "primary": {
    "value": -2.6,
    "display": "-2.6",
    "label": "Turnovers vs expected"
   },
   "compare": null,
   "data": {
    "team_id": "swacfamu",
    "expected": 3.4,
    "actual": 6,
    "fumbles_lost": 4,
    "fumbles_recovered": 1
   },
   "why": ""
  },
  {
   "key": "middle_eight",
   "title": "Middle 8",
   "headline": "Alcorn wins the eight minutes around halftime",
   "value_kind": "team",
   "teams": [
    "swacalc"
   ],
   "primary": {
    "value": 24,
    "display": "+24",
    "label": "Middle 8 point differential"
   },
   "compare": null,
   "data": {
    "team_id": "swacalc",
    "points_for": 31,
    "points_against": 7
   },
   "why": ""
  },
  {
   "key": "trench_report",
   "title": "Trench Report",
   "headline": "Jackson State's line moves people",
   "value_kind": "team",
   "teams": [
    "swacjsu"
   ],
   "primary": {
    "value": 3.4,
    "display": "3.4",
    "label": "Line yards per carry"
   },
   "compare": null,
   "data": {
    "team_id": "swacjsu",
    "line_yards": 3.4,
    "league_line_yards": 2.7,
    "stuff_rate": 0.11,
    "league_stuff_rate": 0.18
   },
   "why": ""
  },
  {
   "key": "field_position",
   "title": "Field Position Battle",
   "headline": "Bethune-Cookman starts nine yards ahead every drive",
   "value_kind": "team",
   "teams": [
    "swacbcu"
   ],
   "primary": {
    "value": 8.97,
    "display": "+9.0",
    "label": "Net yards per drive start"
   },
   "compare": null,
   "data": {
    "team_id": "swacbcu",
    "own_start": 35.33,
    "opp_start": 26.36
   },
   "why": ""
  },
  {
   "key": "tendency_meter",
   "title": "Tendency Meter",
   "headline": "Mississippi Valley throws in neutral situations more than anyone",
   "value_kind": "team",
   "teams": [
    "swacmvsu"
   ],
   "primary": {
    "value": 0.64,
    "display": "64%",
    "label": "Neutral pass rate"
   },
   "compare": null,
   "data": {
    "team_id": "swacmvsu",
    "league_avg": 0.46,
    "teams": [
     {
      "team_id": "meacdsu",
      "pass_rate": 0.482
     },
     {
      "team_id": "meachu",
      "pass_rate": 0.513
     },
     {
      "team_id": "meacmsu",
      "pass_rate": 0.527
     },
     {
      "team_id": "meacnccu",
      "pass_rate": 0.565
     },
     {
      "team_id": "meacnsu",
      "pass_rate": 0.512
     },
     {
      "team_id": "meacscsu",
      "pass_rate": 0.56
     },
     {
      "team_id": "swacaamu",
      "pass_rate": 0.328
     },
     {
      "team_id": "swacalc",
      "pass_rate": 0.441
     },
     {
      "team_id": "swacasu",
      "pass_rate": 0.565
     },
     {
      "team_id": "swacbcu",
      "pass_rate": 0.489
     },
     {
      "team_id": "swacfamu",
      "pass_rate": 0.554
     },
     {
      "team_id": "swacgsu",
      "pass_rate": 0.349
     },
     {
      "team_id": "swacjsu",
      "pass_rate": 0.442
     },
     {
      "team_id": "swacmvsu",
      "pass_rate": 0.64
     },
     {
      "team_id": "swacpvamu",
      "pass_rate": 0.384
     },
     {
      "team_id": "swacsu",
      "pass_rate": 0.461
     },
     {
      "team_id": "swactsu",
      "pass_rate": 0.469
     },
     {
      "team_id": "swacuapb",
      "pass_rate": 0.323
     }
    ]
   },
   "why": ""
  },
  {
   "key": "tempo",
   "title": "Tempo",
   "headline": "Alcorn snaps it every 21 seconds",
   "value_kind": "pair",
   "teams": [
    "swacalc",
    "swacasu"
   ],
   "primary": {
    "value": 21.4,
    "display": "21.4s",
    "label": "Seconds per play"
   },
   "compare": null,
   "data": {
    "fastest": {
     "team_id": "swacalc",
     "seconds": 21.4,
     "display": "21.4s"
    },
    "slowest": {
     "team_id": "swacasu",
     "seconds": 31.8,
     "display": "31.8s"
    },
    "league_avg": 26.2
   },
   "why": ""
  },
  {
   "key": "special_teams_edge",
   "title": "Special Teams Edge",
   "headline": "Southern wins the hidden yards",
   "value_kind": "team",
   "teams": [
    "swacsu"
   ],
   "primary": {
    "value": 2.4,
    "display": "+2.4",
    "label": "Special teams EPA/game"
   },
   "compare": null,
   "data": {
    "team_id": "swacsu",
    "units": [
     {
      "label": "Kickoff",
      "value": 0.6,
      "display": "+0.6"
     },
     {
      "label": "Kick return",
      "value": 0.9,
      "display": "+0.9"
     },
     {
      "label": "Punt",
      "value": 0.3,
      "display": "+0.3"
     },
     {
      "label": "Punt return",
      "value": -0.2,
      "display": "-0.2"
     },
     {
      "label": "FG / PAT",
      "value": 0.8,
      "display": "+0.8"
     }
    ]
   },
   "why": ""
  },
  {
   "key": "coaches_call",
   "title": "Coach's Call",
   "headline": "Prairie View's staff makes the model's call on fourth down",
   "value_kind": "team",
   "teams": [
    "swacpvamu"
   ],
   "primary": {
    "value": 0.85,
    "display": "85%",
    "label": "4th-down agreement"
   },
   "compare": null,
   "data": {
    "team_id": "swacpvamu",
    "decisions": [
     {
      "went": false,
      "agreed": true,
      "converted": false
     },
     {
      "went": false,
      "agreed": true,
      "converted": false
     },
     {
      "went": false,
      "agreed": true,
      "converted": false
     },
     {
      "went": true,
      "agreed": false,
      "converted": false
     },
     {
      "went": true,
      "agreed": true,
      "converted": false
     },
     {
      "went": false,
      "agreed": true,
      "converted": false
     },
     {
      "went": true,
      "agreed": true,
      "converted": true
     },
     {
      "went": true,
      "agreed": false,
      "converted": false
     },
     {
      "went": false,
      "agreed": false,
      "converted": false
     },
     {
      "went": false,
      "agreed": true,
      "converted": false
     },
     {
      "went": true,
      "agreed": true,
      "converted": true
     },
     {
      "went": false,
      "agreed": true,
      "converted": false
     },
     {
      "went": false,
      "agreed": true,
      "converted": false
     },
     {
      "went": true,
      "agreed": true,
      "converted": false
     },
     {
      "went": false,
      "agreed": false,
      "converted": false
     },
     {
      "went": false,
      "agreed": true,
      "converted": false
     },
     {
      "went": false,
      "agreed": true,
      "converted": false
     },
     {
      "went": false,
      "agreed": true,
      "converted": false
     },
     {
      "went": true,
      "agreed": false,
      "converted": true
     },
     {
      "went": false,
      "agreed": true,
      "converted": false
     }
    ]
   },
   "why": ""
  }
 ]
};

export const MOCK_SOURCE = {
 "metric_of_week": "real 2026 wk4",
 "league_map": "real 2026 wk4",
 "adjusted_leader": "placeholder (net EPA, adjusted not shipped)",
 "efficiency_king": "real 2026 wk4",
 "field_position": "real 2026 wk4",
 "third_down_over_expected": "actual real 2026 wk4, expected placeholder",
 "conference_split": "real 2026 wk4",
 "points_per_drive": "placeholder drives",
 "win_lever": "real 2025",
 "noise_stat": "real 2025",
 "better_than_record": "real 2025",
 "ahead_of_numbers": "real 2025",
 "statistical_twins": "real 2025",
 "one_of_a_kind": "real 2025",
 "parity_meter": "real 2025",
 "biggest_mover": "placeholder",
 "havoc_leader": "placeholder",
 "havoc_split": "placeholder",
 "special_teams_edge": "placeholder",
 "explosive_drives": "placeholder",
 "finishing_drives": "placeholder",
 "drive_killers": "placeholder",
 "turnover_luck": "placeholder",
 "middle_eight": "placeholder",
 "trench_report": "placeholder",
 "tendency_meter": "placeholder",
 "tempo": "placeholder",
 "coaches_call": "placeholder"
};
