// Sample game data - matches game-page-fields-mockup.json structure
const gameData = {
  "header": {
    "game_id": "W0hufamu",
    "away_team": {
      "id": "hbcu",
      "name": "Howard Bison",
      "abbreviation": "HBCU",
      "score": 28,
      "final_score": 28
    },
    "home_team": {
      "id": "famu",
      "name": "Florida A&M Rattlers",
      "abbreviation": "FAMU",
      "score": 21,
      "final_score": 21
    },
    "date": "09/07/2025",
    "site": "Bragg Memorial Stadium, Tallahassee, FL",
    "attendance": 15420,
    "temperature": 84,
    "weather": "Cloudy",
    "kickoff_time": "6:00 PM",
    "game_excitement_index": 8.7,
    "winner": "hbcu",
    "final_margin": 7
  },
  "team_stats": {
    "hbcu": {
      "epa_per_play": -0.01,
      "epa_per_play_percentile": 43,
      "success_rate": 0.38,
      "success_rate_percentile": 29,
      "yards_per_play": 4.18,
      "yards_per_play_percentile": 11,
      "explosive_play_rate": 0.05,
      "explosive_play_rate_percentile": 16,
      "third_down_success_rate": 0.39,
      "third_down_success_rate_percentile": 41,
      "red_zone_success_rate": 0.29,
      "red_zone_success_rate_percentile": 26,
      "havoc_rate": 0.14,
      "havoc_rate_percentile": 55
    },
    "famu": {
      "epa_per_play": 0.17,
      "epa_per_play_percentile": 77,
      "success_rate": 0.41,
      "success_rate_percentile": 47,
      "yards_per_play": 5.75,
      "yards_per_play_percentile": 47,
      "explosive_play_rate": 0.12,
      "explosive_play_rate_percentile": 86,
      "third_down_success_rate": 0.6,
      "third_down_success_rate_percentile": 90,
      "red_zone_success_rate": 0.75,
      "red_zone_success_rate_percentile": 94,
      "havoc_rate": 0.16,
      "havoc_rate_percentile": 70
    }
  },
  "situational": {
    "hbcu": {
      "success_rate": 0.38,
      "third_down_success_rate": 0.39,
      "red_zone_success_rate": 0.29,
      "passing_success": { "rate": 0.35 },
      "rushing_success": { "rate": 0.42 }
    },
    "famu": {
      "success_rate": 0.41,
      "third_down_success_rate": 0.6,
      "red_zone_success_rate": 0.75,
      "passing_success": { "rate": 0.55 },
      "rushing_success": { "rate": 0.33 }
    }
  },
  "drive_analysis": {
    "hbcu": {
      "total_drives": 10,
      "avg_starting_field_position": "Own 32",
      "plays_per_drive": 7.4,
      "yards_per_drive": 30.9,
      "available_yards_percentage": 0.46
    },
    "famu": {
      "total_drives": 8,
      "avg_starting_field_position": "Own 24",
      "plays_per_drive": 6.38,
      "yards_per_drive": 36.63,
      "available_yards_percentage": 0.48
    }
  },
  "players": {
    "hbcu": {
      "Cameron Peters": {
        "position": "QB",
        "passing": {
          "completions": 22,
          "attempts": 43,
          "completion_percentage": 0.512,
          "yards": 295,
          "touchdowns": 2,
          "interceptions": 1,
          "epa": -0.92,
          "epa_per_play": -0.02
        }
      },
      "Kheagian Heckaman": {
        "position": "WR",
        "receiving": {
          "receptions": 2,
          "targets": 2,
          "yards": 73,
          "touchdowns": 1,
          "yards_per_reception": 36.5
        }
      },
      "Jyzaiah Rockwell": {
        "position": "WR",
        "receiving": {
          "receptions": 6,
          "targets": 6,
          "yards": 72,
          "touchdowns": 0,
          "yards_per_reception": 12.0
        }
      }
    },
    "famu": {
      "KJ Cooper": {
        "position": "QB",
        "passing": {
          "completions": 11,
          "attempts": 20,
          "completion_percentage": 0.55,
          "yards": 132,
          "touchdowns": 1,
          "interceptions": 0,
          "epa": 13.63,
          "epa_per_play": 0.68
        }
      },
      "Roriyon Richardson": {
        "position": "WR",
        "receiving": {
          "receptions": 3,
          "targets": 4,
          "yards": 57,
          "touchdowns": 1,
          "yards_per_reception": 19.0
        }
      }
    }
  },
  "scoring_plays": [
    {
      "time": "Q1 9:03",
      "offense": "famu",
      "play_description": "Da'Veon Ford run for 10 yds for a TD",
      "epa": 1.88,
      "win_probability_before": 0.56,
      "win_probability_after": 0.682,
      "wpa": 0.121
    },
    {
      "time": "Q1 2:00",
      "offense": "hbcu",
      "play_description": "Cameron Peters pass complete to Kheagian Heckaman for 57 yds for a TD",
      "epa": 7.96,
      "win_probability_before": 0.318,
      "win_probability_after": 0.531,
      "wpa": 0.213
    },
    {
      "time": "Q2 9:11",
      "offense": "hbcu",
      "play_description": "Cameron Franklin run for 5 yds for a TD",
      "epa": 1.71,
      "win_probability_before": 0.646,
      "win_probability_after": 0.722,
      "wpa": 0.076
    },
    {
      "time": "Q2 8:52",
      "offense": "famu",
      "play_description": "Atheen Renfro run for 20 yds for a TD",
      "epa": 2.66,
      "win_probability_before": 0.371,
      "win_probability_after": 0.447,
      "wpa": 0.075
    }
  ]
};

export default gameData;
