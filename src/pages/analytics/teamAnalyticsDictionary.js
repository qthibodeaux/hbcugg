// Team Analytics — the frontend's own words for the hub's ten rate metrics and
// the unit taxonomy. The numbers come from the backend (stats/team-analytics/hub_{season}.json);
// labels, short names, polarity (offGood / defGood) and blurbs are ours. Moved out of
// the retired 0-data/team_analytics_hub.json on 2026-10-04.

export const TEAM_ANALYTICS_METRICS = {
  "rushing.successRate": {
    "label": "Rush Success Rate",
    "short": "Rush SR",
    "family": "rushing",
    "unit": "pct",
    "offGood": true,
    "defGood": false,
    "blurb": "How often a run gains enough to stay on schedule."
  },
  "rushing.opportunityRate": {
    "label": "Opportunity Rate",
    "short": "Opp",
    "family": "rushing",
    "unit": "pct",
    "offGood": true,
    "defGood": false,
    "blurb": "How often the line gets the back at least 4 yards — a line-quality signal."
  },
  "rushing.stuffRate": {
    "label": "Stuff Rate",
    "short": "Stuff",
    "family": "rushing",
    "unit": "pct",
    "offGood": false,
    "defGood": true,
    "blurb": "Runs stopped at or behind the line."
  },
  "rushing.stopRate": {
    "label": "Stop Rate",
    "short": "Stop",
    "family": "rushing",
    "unit": "pct",
    "offGood": false,
    "defGood": true,
    "blurb": "Runs held short of what the down and distance needed."
  },
  "rushing.powerStopRate": {
    "label": "Power Stop Rate",
    "short": "Power",
    "family": "rushing",
    "unit": "pct",
    "offGood": false,
    "defGood": true,
    "blurb": "Short-yardage and goal-line runs stopped."
  },
  "rushing.tflRate": {
    "label": "TFL Rate",
    "short": "TFL",
    "family": "rushing",
    "unit": "pct",
    "offGood": false,
    "defGood": true,
    "blurb": "Runs losing yardage."
  },
  "passing.completionRate": {
    "label": "Completion Rate",
    "short": "Comp",
    "family": "passing",
    "unit": "pct",
    "offGood": true,
    "defGood": false,
    "blurb": "Share of attempts completed."
  },
  "passing.explosiveRate": {
    "label": "Explosive Rate",
    "short": "Expl",
    "family": "passing",
    "unit": "pct",
    "offGood": true,
    "defGood": false,
    "blurb": "Share of pass plays going for a chunk gain."
  },
  "passing.pressureRate": {
    "label": "Pressure Rate",
    "short": "Press",
    "family": "passing",
    "unit": "pct",
    "offGood": false,
    "defGood": true,
    "blurb": "How often the quarterback is pressured."
  },
  "passing.ypa": {
    "label": "Yards / Attempt",
    "short": "YPA",
    "family": "passing",
    "unit": "num",
    "offGood": true,
    "defGood": false,
    "blurb": "Yards gained per pass attempt."
  }
};

export const TEAM_ANALYTICS_UNITS = [
  {
    "id": "off_run",
    "label": "Run Game",
    "side": "offense",
    "available": true,
    "metrics": [
      "rushing.successRate",
      "rushing.opportunityRate",
      "rushing.stuffRate",
      "rushing.stopRate",
      "rushing.powerStopRate",
      "rushing.tflRate"
    ]
  },
  {
    "id": "off_pass",
    "label": "Pass Game",
    "side": "offense",
    "available": true,
    "metrics": [
      "passing.completionRate",
      "passing.ypa",
      "passing.explosiveRate",
      "passing.pressureRate"
    ]
  },
  {
    "id": "def_run",
    "label": "Run Defense",
    "side": "defense",
    "available": true,
    "metrics": [
      "rushing.stopRate",
      "rushing.stuffRate",
      "rushing.tflRate",
      "rushing.powerStopRate",
      "rushing.successRate",
      "rushing.opportunityRate"
    ]
  },
  {
    "id": "def_pass",
    "label": "Pass Defense",
    "side": "defense",
    "available": true,
    "metrics": [
      "passing.pressureRate",
      "passing.completionRate",
      "passing.ypa",
      "passing.explosiveRate"
    ]
  },
  {
    "id": "protection",
    "label": "Pass Protection",
    "side": "offense",
    "available": false,
    "metrics": [],
    "gap": "Needs sacks allowed and line yards — neither is rolled up to team-season."
  },
  {
    "id": "havoc",
    "label": "Havoc / Disruption",
    "side": "defense",
    "available": false,
    "metrics": [],
    "gap": "Team-level havoc formula exists in the pipeline but is never exported."
  },
  {
    "id": "special",
    "label": "Special Teams",
    "side": "special",
    "available": false,
    "metrics": [],
    "gap": "No special-teams season rollup exists."
  },
  {
    "id": "situational",
    "label": "Situational",
    "side": "both",
    "available": false,
    "metrics": [],
    "gap": "Red zone / third down / money down are tagged per play, never aggregated to team-season."
  }
];
