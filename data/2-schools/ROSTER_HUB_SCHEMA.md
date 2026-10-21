# Roster Hub — Data Schema & Chart Reference

## Files

| File | Description | Size (approx) |
|------|-------------|---------------|
| `roster_hub_2021.json` | 2021 season only | ~420KB |
| `roster_hub_2022.json` | 2022 season only | ~465KB |
| `roster_hub_2023.json` | 2023 season only | ~490KB |
| `roster_hub_2024.json` | 2024 season only | ~490KB |
| `roster_hub_2025.json` | 2025 season only | ~500KB |
| `roster_hub_all.json` | All 5 years combined | ~2.5MB |

---

## Top-Level Structure

```
{
  "year": 2025,
  "total_players": 2083,

  "teams": {
    "swacjsu": { ...team module },
    "swacasu": { ...team module },
    ...18 teams total
  },

  "divisions": {
    "SWAC": { ...division rollup },
    "MEAC": { ...division rollup }
  },

  "all": { ...all-18 rollup }
}
```

Every scope (team / division / all) contains the same 5 modules:
`composition`, `experience`, `physical`, `geographic`, `transfers`

---

## Team IDs

| ID | School | Division |
|----|--------|----------|
| `swacjsu` | Jackson State | SWAC |
| `swacasu` | Alabama State | SWAC |
| `swacgsu` | Grambling State | SWAC |
| `swactsu` | Texas Southern | SWAC |
| `swacpvam` | Prairie View A&M | SWAC |
| `swacsu` | Southern University | SWAC |
| `swacmsu` | Alcorn State | SWAC |
| `swacuapb` | UAPB | SWAC |
| `swacbcu` | Bethune-Cookman | SWAC |
| `swacfamu` | Florida A&M | SWAC |
| `meaccopst` | Coppin State | MEAC |
| `meacdsu` | Delaware State | MEAC |
| `meachsc` | Howard | MEAC |
| `meacmd` | Maryland Eastern Shore | MEAC |
| `meacmorst` | Morgan State | MEAC |
| `meacncat` | NC A&T | MEAC |
| `meacnsu` | Norfolk State | MEAC |
| `meacsc` | South Carolina State | MEAC |

---

## Module 1: Composition

**Path:** `teams.{team_id}.composition` / `divisions.SWAC.composition` / `all.composition`

```json
{
  "total_players": 111,
  "upperclass_pct": 50.5,
  "underclass_pct": 35.1,

  "position_distribution": [
    { "group": "OL", "count": 23, "pct": 20.7 },
    { "group": "DB", "count": 18, "pct": 16.2 },
    { "group": "DL", "count": 18, "pct": 16.2 },
    { "group": "WR_TE", "count": 18, "pct": 16.2 },
    { "group": "RB", "count": 14, "pct": 12.6 },
    { "group": "LB", "count": 12, "pct": 10.8 },
    { "group": "ST", "count": 4, "pct": 3.6 },
    { "group": "QB", "count": 4, "pct": 3.6 }
  ],

  "class_distribution": [
    { "class": "Fr.", "label": "Freshman",  "count": 22, "pct": 19.8 },
    { "class": "So.", "label": "Sophomore", "count": 17, "pct": 15.3 },
    { "class": "Jr.", "label": "Junior",    "count": 14, "pct": 12.6 },
    { "class": "Sr.", "label": "Senior",    "count": 16, "pct": 14.4 },
    { "class": "Gr.", "label": "Graduate",  "count": 26, "pct": 23.4 },
    { "class": "Unknown", "label": "Unknown", "count": 16, "pct": 14.4 }
  ]
}
```

### Charts
| Measure | Recommended Chart |
|---------|------------------|
| Position group counts | Donut chart or grouped bar |
| Class year breakdown | Stacked bar (100%) |
| Upperclass % KPI | Stat card with color threshold (green ≥55%, yellow 40-55%, red <40%) |
| Team vs team position dist | Side-by-side grouped bar |

---

## Module 2: Experience

**Path:** `teams.{team_id}.experience`

```json
{
  "upperclass_pct": 50.5,
  "veteran_pct": 37.8,

  "pyramid": [
    { "class": "Fr.", "label": "Freshman",  "count": 22, "pct": 19.8 },
    { "class": "So.", "label": "Sophomore", "count": 17, "pct": 15.3 },
    { "class": "Jr.", "label": "Junior",    "count": 14, "pct": 12.6 },
    { "class": "Sr.", "label": "Senior",    "count": 16, "pct": 14.4 },
    { "class": "Gr.", "label": "Graduate",  "count": 26, "pct": 23.4 }
  ],

  "by_position_group": {
    "OL": {
      "total": 23,
      "breakdown": [
        { "class": "Fr.", "count": 7, "pct": 30.4 },
        { "class": "So.", "count": 4, "pct": 17.4 },
        { "class": "Jr.", "count": 4, "pct": 17.4 },
        { "class": "Sr.", "count": 2, "pct": 8.7 },
        { "class": "Gr.", "count": 3, "pct": 13.0 }
      ]
    },
    "DB": { ... },
    "DL": { ... },
    ...
  }
}
```

### Charts
| Measure | Recommended Chart |
|---------|------------------|
| Class pyramid (team-level) | Horizontal bar pyramid (Fr at base → Gr at top) |
| Class breakdown by position group | Stacked bar, one bar per position group |
| Upperclass % | KPI stat card |
| Veteran % (Sr + Gr) | KPI stat card |
| All 18 teams upperclass % comparison | Horizontal ranked bar |

---

## Module 3: Physical Profile

**Path:** `teams.{team_id}.physical`

```json
{
  "overall": {
    "count": 111,
    "height_avg": 73.2,
    "height_median": 73.0,
    "height_max": 80,
    "height_min": 63,
    "weight_avg": 225.4,
    "weight_median": 215.0,
    "weight_max": 365,
    "weight_min": 155,
    "height_coverage": 95,
    "weight_coverage": 108
  },

  "by_position_group": {
    "OL": {
      "count": 23,
      "height_avg": 75.6,
      "height_median": 75.5,
      "height_max": 80,
      "height_min": 70,
      "weight_avg": 305.5,
      "weight_median": 315.0,
      "weight_max": 365,
      "weight_min": 195,
      "height_coverage": 20,
      "weight_coverage": 23
    },
    ...
  },

  "notables": {
    "tallest": [
      { "person_id": "PERS_00005412", "full_name": "Bruno Zandamela",
        "position": "OL", "position_group": "OL", "height": 80, "weight": 315 },
      ...
    ],
    "shortest": [ ... ],
    "heaviest": [ ... ],
    "lightest":  [ ... ]
  },

  "size_vs_conference": {
    "OL":    { "height_z": 0.08,  "weight_z": 0.13 },
    "DL":    { "height_z": -0.22, "weight_z": 0.05 },
    "WR_TE": { "height_z": 0.41,  "weight_z": -0.10 },
    "DB":    { "height_z": 0.15,  "weight_z": 0.22 },
    ...
  }
}
```

### Charts
| Measure | Recommended Chart |
|---------|------------------|
| Avg height/weight per position group | Grouped bar (height + weight bars side by side) |
| Height/weight range (min/max/median) | Box plot or range bar per position group |
| Tallest/shortest/heaviest/lightest | Player cards / callout tiles |
| Size vs conference (z-scores) | Radar chart (one axis per position group, z-score as value) OR horizontal bar with center-zero axis |
| Team A vs Team B size | Overlapping bars or two-color range bars |

**Z-score guide:** `> +1.0` = significantly larger, `< -1.0` = significantly smaller, near 0 = conference average

**Heights are in inches.** Display conversion: `Math.floor(h/12) + "'" + (h%12) + '"'`

---

## Module 4: Geographic Pipeline

**Path:** `teams.{team_id}.geographic`

```json
{
  "total_with_hometown": 111,
  "domestic_count": 28,
  "international_count": 83,
  "in_state_count": 5,
  "in_state_pct": 17.9,
  "avg_recruiting_distance_miles": 505.0,
  "median_recruiting_distance_miles": 538.0,

  "state_distribution": [
    { "state": "TX", "count": 10, "pct": 35.7 },
    { "state": "MS", "count": 5,  "pct": 17.9 },
    { "state": "OH", "count": 4,  "pct": 14.3 },
    { "state": "GA", "count": 3,  "pct": 10.7 },
    ...
  ],

  "hotspots": [
    { "city": "Houston, TX", "count": 4 },
    { "city": "Atlanta, GA", "count": 3 },
    ...
  ]
}
```

### Charts
| Measure | Recommended Chart |
|---------|------------------|
| State distribution | US choropleth map (state fill by player count) |
| City hotspots (≥3 players) | Dot/bubble overlay on map OR ranked list |
| In-state % | KPI stat card |
| Avg recruiting distance | KPI stat card (miles) |
| State bar ranking | Horizontal bar chart, top 10 states |
| Transfer players only toggle | Filter `transfers.transfer_geographic` (same shape) |

**Note:** `international_count` will be high for teams with many players missing hometown parsing (non-US format). Treat as "hometown unknown" for display purposes — label as "Hometown N/A" rather than "International."

---

## Module 5: Transfer Strategy

**Path:** `teams.{team_id}.transfers`

```json
{
  "transfer_count": 49,
  "transfer_rate": 44.1,

  "tier_breakdown": [
    { "tier": "FBS",       "count": 26, "pct": 53.1 },
    { "tier": "JUCO",      "count": 13, "pct": 26.5 },
    { "tier": "FCS",       "count": 7,  "pct": 14.3 },
    { "tier": "D2/D3/NAIA","count": 3,  "pct": 6.1  }
  ],

  "position_impact": [
    {
      "group": "ST",
      "total_players": 4,
      "transfer_count": 3,
      "transfer_rate": 75.0,
      "tier_breakdown": { "FBS": 1, "JUCO": 1, "D2/D3/NAIA": 1 }
    },
    {
      "group": "DB",
      "total_players": 18,
      "transfer_count": 11,
      "transfer_rate": 61.1,
      "tier_breakdown": { "FBS": 5, "FCS": 3, "JUCO": 2, "D2/D3/NAIA": 1 }
    },
    ...
  ],

  "transfer_geographic": {
    "in_state_pct": ...,
    "state_distribution": [ ... ],
    "hotspots": [ ... ],
    ...
  }
}
```

### Charts
| Measure | Recommended Chart |
|---------|------------------|
| Transfer rate | KPI stat card (% of roster) |
| Tier breakdown (FBS/FCS/JUCO/D2) | Donut or stacked bar |
| Transfer rate by position group | Horizontal bar, sorted by rate |
| Tier mix by position group | Stacked bar (one bar per group, segments = tiers) |
| Transfer origin map | Same choropleth as geographic, filtered to transfer players |
| All-18 transfer rate comparison | Ranked horizontal bar |

**Tier color suggestion:**
- FBS = blue (highest level)
- FCS = teal
- D2/D3/NAIA = yellow
- JUCO = orange

---

## Drill Level Reference

Every module is available at 4 levels. Use the appropriate path:

| Scope | Path example |
|-------|-------------|
| Single team | `data.teams["swacjsu"].composition` |
| Division | `data.divisions["SWAC"].composition` |
| All 18 | `data.all.composition` |
| Cross-year | Load `roster_hub_all.json`, access `data["2025"].teams["swacjsu"]` |

---

## Key Measures Quick Reference

| Measure | Module | Field Path |
|---------|--------|------------|
| Total players on roster | composition | `.total_players` |
| Upperclass % | composition / experience | `.upperclass_pct` |
| Veteran % (Sr + Gr) | experience | `.veteran_pct` |
| Class pyramid data | experience | `.pyramid[]` |
| Class breakdown by position | experience | `.by_position_group.{pg}.breakdown[]` |
| Avg height (overall) | physical | `.overall.height_avg` |
| Avg weight (overall) | physical | `.overall.weight_avg` |
| Height/weight by position group | physical | `.by_position_group.{pg}` |
| Tallest players (top 3) | physical | `.notables.tallest[]` |
| Shortest players (top 3) | physical | `.notables.shortest[]` |
| Heaviest players (top 3) | physical | `.notables.heaviest[]` |
| Lightest players (top 3) | physical | `.notables.lightest[]` |
| Size vs conference (z-score) | physical | `.size_vs_conference.{pg}.height_z / weight_z` |
| In-state % | geographic | `.in_state_pct` |
| Avg recruiting distance | geographic | `.avg_recruiting_distance_miles` |
| State distribution | geographic | `.state_distribution[]` |
| City hotspots | geographic | `.hotspots[]` |
| Transfer rate | transfers | `.transfer_rate` |
| Transfer tier breakdown | transfers | `.tier_breakdown[]` |
| Transfer rate by position group | transfers | `.position_impact[]` |
| Transfer player geography | transfers | `.transfer_geographic` |
