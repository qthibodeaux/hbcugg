# Rosters Hub — Design Doc

**Route:** `/rosters`  
**File:** `src/pages/players/RostersPage.js`  
**Last updated:** 2026-04-19  
**Status:** Built ✓

---

## Purpose

The Rosters Hub is the definitive league-wide analytics destination for HBCU GridIron Glory. It is **not** a roster lookup tool — it is a deep analytics platform covering all 18 programs across three tiers: league-wide, by division, and by individual team.

Individual team pages (`/teams/:teamId`) handle team-specific detail. This page owns the aggregate story.

---

## Layout — PageShell Grid (Fixed)

```
Row 1: [─────────────────── BannerRostersHub (4×1) ───────────────────]
Row 2: [ KPI: Players ] [ KPI: Portal % ] [ KPI: In-State ] [ KPI: Avg Dist ]
                          (4× 1×1)
```

Banner season control behavior:
- Dropdown updates `pendingSeason` only
- Data changes only when user clicks **Go**
- Applied season updates roster hub analytics and roster table data

KPI data source: `d.all` from `roster_hub_{year}.json` where `{year}` is the applied season.

KPI backend contract:
- Total Players: `all.composition.total_players`
- Portal Rate: `all.transfers.transfer_rate`
- Transfer Count subtitle: `all.transfers.transfer_count`
- In-State Talent: `all.geographic.in_state_pct`
- Avg Recruit Dist: `all.geographic.avg_recruiting_distance_miles`
- Program count subtitle: `Object.keys(teams).length` from same payload

---

## Layout — listContent (Scrollable)

### Mode Switcher
Horizontal 3-button bar: **By Team · Divisions · League**

Default: **By Team**

---

### Mode: League

Full league-wide analytics from `d.all`:

| Row | Left (2×1) | Right (2×1) |
|---|---|---|
| A | Class Distribution (bars by Fr/So/Jr/Sr/Gr) | Experience (upperclass % + veteran %) |
| B | Physical Profile — all 10 position groups (4×1 full width) | |
| C | Top Recruiting States | Recruiting City Hotspots |
| D | Geographic Distribution (in-state %, avg dist, tier split, states) | Transfer Origin Breakdown (count, rate, tier bars) |
| E | Transfer Origin States | Transfer City Hotspots |

---

### Mode: Divisions

3-column layout: **SWAC East · SWAC West · MEAC**

Division data is computed client-side by aggregating individual team modules from `d.teams`. The `aggregateDivision(teamIds, teamsMap)` helper handles weighted averages for percentages and summed counts.

Division team IDs:
- **SWAC East** (7): swacalc, swacaamu, swacasu, swacbcu, swacfamu, swacjsu, swacmvsu
- **SWAC West** (5): swacpvamu, swacsu, swactsu, swacuapb, swacgsu
- **MEAC** (6): meacdsu, meachu, meacmsu, meacnccu, meacnsu, meacscsu

Each column shows (stacked vertically): header → composition → experience → physical → geographic → transfers

Division accent colors: East = `#E53E3E`, West = `#ECC94B`, MEAC = `#4299E1`

---

### Mode: By Team

```
Row A: Team selector pills (18 pills, 4×1, 6-col × 3-row grid)
Row B: Composition (1×1) | Experience (1×1) | Physical (2×1)
Row C: Geographic (2×1) | Transfers (2×1)
Roster table: jersey · photo · name/hometown · position · class year · transfer badge
```

Compact behavior for team selector labels:
- normal mode: full team names
- compact mode: team abbreviations (`shortName`) to prevent overflow
- fallback abbreviation: initials when `shortName` is absent

Team module data from `d.teams[selectedId]`. Roster from `useSeason2025()` filtered by `team_id`.

---

## Data Hooks

```js
const { allLeague, teams: teamsMap, isLoading } = useRosterHub(season);
const { players, isLoading: playersLoading } = useAllPlayersByYear(season);
```

`useRosterHub(year)` — fetches `/data/2-schools/roster_hub_{year}.json`

---

## Color Systems

```js
CLASS_COLORS = { 'Fr.': '#c53030', 'So.': '#dd6b20', 'Jr.': '#d69e2e', 'Sr.': '#2c7a7b', 'Gr.': '#276749' }
TRANSFER_COLORS = { P4: '#3182ce', G5: '#2c7a7b', FCS: '#dd6b20', D2: '#d69e2e', JUCO: '#c53030', HS: '#718096' }
```

Note: TRANSFER_COLORS keys match the actual data schema (`P4`, `G5`, etc.) — not the stale keys in design bible section 11.

---

## Shared Sub-Components (defined inline in RostersPage.js)

| Component | Props | Used in |
|---|---|---|
| `SectionCard` | kicker, title, accent, h, children | All modes |
| `ClassBars` | data (composition module) | League, Divisions, Team |
| `ExperienceBars` | data (experience module) | League, Divisions, Team |
| `PhysicalRows` | data (physical module) | League, Divisions, Team |
| `StateList` | data, compact | League, Divisions, Team |
| `HotspotList` | data, compact | League, Divisions |
| `TierBars` | data (transfers module) | League, Divisions, Team |
| `GeoKpis` | data (geographic module) | Divisions, Team |
| `TransferKpis` | data (transfers module) | Divisions, Team |
| `KpiCard` | label, value, sub, accent | Row 2 fixed grid |

---

## Nav

`RosterNavRegistrar` — sets sidebar to Rosters Hub context. Uses `useEffect` (linter-enforced pattern).  
`SchoolsNavRegistrar` — Rosters item points to `/rosters`.

---

## PageLab

Entry: `{ label: "Rosters Hub", path: "/rosters" }` in `src/pages/PageLab.js`

---

## Known Gaps / Next Steps

- Team ranking tables (rank all 18 teams by portal rate, in-state %, upperclass %) not yet built
- `transfer_geographic` sub-key on `d.all.transfers` contains portal-specific geo data — currently falling back to main transfers object if key absent
- `d.all.physical.notables` is empty (tallest/heaviest arrays) — skip this field
- `size_vs_conference` z-scores are all null — skip this field


## Codex 5/10 thoughts
The Players Hub should not be “rosters again” and it should not be “Stat Lab but filtered to players.”

It should answer:

> “Who are the players shaping the conference right now, what types of players exist across the league, and where should I click next?”

So the Players Hub should be a **conference-wide player discovery layer**.

Not:

* full rosters
* raw stat tables
* game logs
* individual profiles first

More like:

* player spotlight
* archetypes
* rising players
* production leaders
* matchup weapons
* transfer impact
* physical profile standouts
* role-based rankings
* “players to know” by conference/division/position

---

# Core Identity of the Players Hub

The Players Hub should feel like:

**“The league’s talent board.”**

A place where users can browse:

* stars
* breakout players
* hidden gems
* role players
* transfer additions
* physical outliers
* production leaders
* impact players
* position groups
* players by conference/division

This gives it a reason to exist apart from:

* **Rosters Hub** = school-by-school personnel list
* **Stat Lab** = data exploration
* **Game Center** = game/event lens
* **Players Hub** = talent discovery and player storytelling

---

# Main Players Hub Questions

The hub should answer these at a glance:

1. Who are the top players right now?
2. Who is breaking out?
3. Who transferred in and is changing teams?
4. Who has unusual size/speed/profile?
5. Who leads each position group?
6. Which divisions/conferences have the strongest talent pools?
7. Which players are producing beyond expectation?
8. Which players are role specialists?
9. Which players should I click into?

---

# Strong Players Hub Widget Ideas

## 1. Player Spotlight Hero

This should be the top feature.

Not just “best player.” Rotate between:

* Player of the Week
* Breakout Watch
* Transfer Impact
* Hidden Gem
* Freshman/Rookie Watch
* Glory Leader
* Matchup Weapon

### Hero content:

```text
Player Spotlight
Andrew Body
QB · Prairie View A&M

Why he matters:
#1 QB by Glory
Top-tier impact score
High leverage production
```

CTA:

* “View Player Card”
* “Explore QB Rankings”

Visual:

* player image if available
* team color accent
* dark editorial card
* stat strip

This makes the hub feel alive.

---

## 2. Players to Know

This is probably your most important hub widget.

A curated/conference-wide board.

Categories:

* Stars
* Breakouts
* New Faces
* Underrated
* Freshmen
* Transfer Impact
* Game Changers

Card example:

```text
Players to Know

Stars: 6
Breakouts: 8
New Faces: 12
Hidden Gems: 5
```

Clicking opens:

* `/players/watchlist`
* or filtered category pages

This is more interesting than “Top 25 Players.”

---

## 3. Position Power Boards

This is where users naturally click.

Separate boards:

* Quarterbacks
* Ball Carriers
* Pass Catchers
* Run Blockers
* Pass Blockers
* Run Stoppers
* Pass Defenders
* Returners
* Kickers/Punters

For the hub, show compact previews:

```text
Position Power Boards

QB: Andrew Body
RB: Player X
WR/TE: Player Y
Run Stopper: Player Z
Returner: Player A
```

This routes users into position-specific player pages.

This also fits your metric ontology perfectly.

---

## 4. Conference / Division Talent Map

This directly addresses your question.

Users click Players and can see the talent landscape by:

* SWAC East
* SWAC West
* MEAC
* school
* position
* class year
* transfer status

Widget idea:

```text
Talent by Division

SWAC East
Top Group: Pass Catchers
Breakout Count: 7
Transfer Impact: High

SWAC West
Top Group: Quarterbacks
Breakout Count: 5
Physical Edge: OL/DL

MEAC
Top Group: Defense
Breakout Count: 6
Hidden Gems: High
```

This makes Players feel bigger than individual players.

---

## 5. Player Archetype Explorer

This would be unique.

Instead of only listing positions, group players by role/archetype.

### Offensive archetypes:

* Chain Mover
* Field Stretcher
* Volume Back
* Explosive Back
* Red Zone Target
* Possession Receiver
* Scramble Creator
* Efficiency QB
* Chaos QB
* Workhorse

### Defensive archetypes:

* Run Eraser
* Edge Disruptor
* Coverage Anchor
* Ball Hawk
* Box Safety
* Havoc Linebacker
* Interior Wall
* Pressure Creator

### Special teams:

* Field Flipper
* Return Threat
* Touchback Leg
* Hidden Yards Weapon

Widget:

```text
Archetype Board

Field Stretchers: 12
Run Erasers: 9
Return Threats: 6
Chain Movers: 14
```

Clicking lets users browse players by “type,” not just position.

That is much more fun.

---

## 6. Breakout Radar

This is a must.

Measure players whose current season is exceeding prior profile.

Inputs:

* year-over-year production increase
* new role
* increased snap/share if available
* EPA/production jump
* first-time contributors
* transfer jump

Widget:

```text
Breakout Radar

Fastest Risers:
1. Player A — WR
2. Player B — LB
3. Player C — RB
```

Reason codes:

* “Production jump”
* “Expanded role”
* “High efficiency”
* “Explosive plays”
* “Transfer impact”

This gives the hub weekly freshness.

---

## 7. Transfer Impact Board

This belongs in Players, not just Rosters.

Rosters tells you who transferred.

Players tells you:

> “Who changed the competitive balance?”

Metrics:

* transfer production score
* transfer usage share
* transfer starter count
* transfer EPA contribution
* transfer position need filled

Widget:

```text
Transfer Impact

Immediate Starters: 18
High-Impact Transfers: 7
Most Impacted Team: Alabama State
```

Click:

* `/players/transfers`

---

## 8. Physical Outlier Board

You already care about roster physical analytics. The Players Hub can show the exciting version.

Not full roster averages. Individual standouts.

Examples:

* Biggest WRs
* Heaviest DL
* Tallest DBs
* Undersized producers
* Prototype OL
* Hybrid defenders

Widget:

```text
Physical Outliers

Prototype WR
Undersized Producer
Massive Interior DL
Long DB Room
```

This connects roster analytics to player discovery.

---

## 9. Hidden Gems / Under the Radar

This is where your platform can shine.

A player is a hidden gem if:

* strong production on bad/low-profile team
* high efficiency with low volume
* good per-touch impact
* high Glory but low traditional stats
* defensive disruption without headline numbers

Widget:

```text
Hidden Gems

High Impact / Low Volume:
Player A
Player B
Player C
```

This should be a signature feature.

---

## 10. Glory Leaders Preview

Glory should appear here, but not dominate.

Widget:

```text
Glory Leaders

Overall
Offense
Defense
Special Teams
By Position
```

Click to:

* `/glory/players`
* or player-specific Glory pages

This ties Players Hub into your rating engine.

---

## 11. Weekly Player Pulse

Make it feel current.

Categories:

* Player of the Week
* Stock Up
* Stock Down
* Injury/absence watch if data supports it
* New starter
* Notable returner
* Clutch performer

Widget:

```text
Player Pulse

Stock Up: 8
New Starters: 4
Clutch Performers: 3
```

This gives the hub life without becoming Game Center.

---

## 12. Matchup Weapons

This connects Players Hub to Game Center.

Feature players who create matchup stress.

Categories:

* Deep threat vs vulnerable secondary
* Power back vs light front
* pass rusher vs weak pass protection
* returner vs poor coverage unit
* QB mobility vs weak containment

Widget:

```text
Matchup Weapons

This Week:
WR X vs Team Y secondary
EDGE A vs Team B pass protection
Returner C vs Team D coverage
```

This is a great bridge between Players and Games.

---

# What the Players Hub Should NOT Be

Avoid:

* giant player table
* full roster replacement
* school-by-school depth chart
* stat leaderboard clone
* individual profile-heavy landing page
* over-indexing on QBs only

The hub should be **discovery first**.

---

# Best Top-Level Sections

I would structure it like this:

## 1. Spotlight

* featured player
* player of week
* breakout feature

## 2. Talent Boards

* top players
* position power boards
* Glory leaders

## 3. Discovery

* hidden gems
* breakout radar
* transfer impact
* physical outliers

## 4. Conference Lens

* SWAC East
* SWAC West
* MEAC
* school talent maps

## 5. Role / Archetype Lens

* field stretchers
* run erasers
* field flippers
* chaos creators
* chain movers

## 6. Weekly Pulse

* matchup weapons
* stock movers
* players to watch

---

# Suggested Players Hub Layout

## Hero 4x1 Banner

Title:

```text
Players Hub
```

Subtitle:

```text
Stars, breakouts, transfers, archetypes, and impact players across HBCU football.
```

Visual:

* dark red/black gradient
* player silhouette
* jersey-number texture
* stat ticker line
* subtle field hash marks

CTA:

```text
Explore Player Boards
```

---

## Row 2: Snapshot Cards

### Card 1: Player Spotlight

Featured player with image/team accent.

### Card 2: Breakout Radar

Top risers.

### Card 3: Transfer Impact

Top immediate contributors.

### Card 4: Glory Leaders

Top overall / position leader.

---

## Row 3: Position Power Boards

A wide widget with tabs/chips:

* QB
* RB
* WR/TE
* OL
* DL
* LB
* DB
* ST

Shows top 3 per group.

---

## Row 4: Conference Talent Map

Three major cards:

* SWAC East
* SWAC West
* MEAC

Each card shows:

* top position group
* top player
* breakout count
* transfer impact
* hidden gem count

---

## Row 5: Discovery Widgets

### Hidden Gems

High efficiency, lower visibility.

### Physical Outliers

Prototype and unusual profiles.

---

## Row 6: Archetype Explorer

Clickable archetype chips/cards:

* Field Stretchers
* Chain Movers
* Run Erasers
* Chaos Creators
* Field Flippers
* Red Zone Weapons
* Coverage Anchors
* Workhorses

---

## Row 7: Weekly Matchup Weapons

Players tied to upcoming games.

---

# Click-Through Pages

The hub should link to:

```text
/players/spotlight
/players/boards
/players/positions
/players/archetypes
/players/breakouts
/players/transfers
/players/hidden-gems
/players/physical-outliers
/players/glory
/players/conference
/players/:playerId
```

---

# Best “Signature” Feature

If I had to choose one unique thing:

## Player Archetype Board

That is the thing that makes your Players Hub different.

Most sites say:

* QB
* RB
* WR
* LB

Your site can say:

* Chain Movers
* Run Erasers
* Field Flippers
* Chaos Creators
* Hidden Yard Weapons
* High-Variance Playmakers
* Efficiency Engines

That fits your whole system.

---

# Simple First Version

For V1, build only:

1. **Player Spotlight**
2. **Position Power Boards**
3. **Conference Talent Map**
4. **Breakout Radar**
5. **Transfer Impact**
6. **Hidden Gems**
7. **Archetype Explorer**
8. **Glory Leaders Preview**

That is enough to make the Players Hub feel distinct.

---

# Bottom Line

The Players Hub should be:

> **A discovery dashboard for the league’s talent ecosystem.**

Not a roster.
Not a stat table.
Not a profile directory.

It should help a user answer:

```text
Who matters?
Who is rising?
Who is different?
Who should I watch?
Which division has what kind of talent?
What kind of player is this?
```

That gives the hub a clear identity.


## more codex

Use this as the backend/pipeline request.

```text
You are working in the HBCU GridIron Glory backend/data pipeline.

Goal:
Create the backend data support for the first version of the Players Hub.

The Players Hub is not a roster page and not a raw stat leaderboard. It is a conference-wide player discovery dashboard showing stars, breakouts, position boards, transfer impact, hidden gems, physical outliers, archetypes, Glory leaders, and division/conference talent snapshots across SWAC/MEAC football.

Primary question:
What player-level, school-level, conference-level, and position-group data can we provide so the frontend can build a Players Hub that helps users discover who matters, who is rising, who is unusual, and who should be watched?

The backend should provide a single Players Hub payload that supports:
- Player Spotlight
- Position Power Boards
- Conference / Division Talent Map
- Breakout Radar
- Transfer Impact Board
- Hidden Gems
- Physical Outlier Board
- Archetype Explorer
- Glory Leaders Preview
- Weekly Matchup Weapons if data supports it

Important:
Do not return giant raw roster tables.
Do not make the frontend calculate complex metrics inside JSX.
Do not force the frontend to join 8 different files manually.
Return normalized, frontend-ready summary data with IDs, labels, ranks, scores, reason codes, and confidence values.

Use stable player IDs, school IDs, season, conference, and division wherever possible.

Primary route target:
Frontend will consume this for:
- /players

Potential deeper pages:
- /players/spotlight
- /players/boards
- /players/positions
- /players/archetypes
- /players/breakouts
- /players/transfers
- /players/hidden-gems
- /players/physical-outliers
- /players/glory
- /players/conference
- /players/:playerId

Required top-level JSON shape:

{
  "season": 2025,
  "last_updated": "",
  "data_confidence": "high | medium | low",
  "summary": {},
  "spotlight": {},
  "position_boards": [],
  "conference_talent_map": [],
  "breakout_radar": [],
  "transfer_impact": [],
  "hidden_gems": [],
  "physical_outliers": [],
  "archetypes": [],
  "glory_leaders": {},
  "weekly_matchup_weapons": [],
  "player_index_preview": [],
  "metadata": {}
}
```

---

## 1. Core Player Identity Fields

Every player object returned in any widget should use this compact shape when possible:

```json
{
  "player_id": "string",
  "full_name": "string",
  "first_name": "string",
  "last_name": "string",
  "school_id": "string",
  "school_name": "string",
  "conference": "SWAC | MEAC",
  "division": "SWAC East | SWAC West | MEAC",
  "position": "string",
  "position_group": "QB | Ball Carrier | Pass Catcher | OL | DL | LB | DB | Specialist | Returner",
  "class_year": "Fr | So | Jr | Sr | Gr | Unknown",
  "jersey_number": "string | null",
  "height": "string | null",
  "weight": "number | null",
  "hometown_city": "string | null",
  "hometown_state": "string | null",
  "previous_school": "string | null",
  "is_transfer": true,
  "image_url": "string | null",
  "profile_url": "/players/{player_id}",
  "confidence": "high | medium | low"
}
```

---

## 2. Summary Object

Frontend needs quick numbers for snapshot cards.

```json
{
  "summary": {
    "total_players": 0,
    "total_schools": 0,
    "conferences": ["SWAC", "MEAC"],
    "divisions": ["SWAC East", "SWAC West", "MEAC"],
    "players_with_stats": 0,
    "players_with_physical_data": 0,
    "transfers_count": 0,
    "breakout_candidates_count": 0,
    "hidden_gems_count": 0,
    "archetype_count": 0,
    "data_notes": []
  }
}
```

---

## 3. Player Spotlight

Purpose:
The hero/top card needs one featured player and maybe a small rotation list.

Spotlight can be chosen by:

* highest Glory score
* player of the week
* breakout player
* transfer impact
* hidden gem
* matchup weapon

Backend should return one primary spotlight plus alternates.

```json
{
  "spotlight": {
    "primary": {
      "player": {},
      "spotlight_type": "Glory Leader | Breakout | Transfer Impact | Hidden Gem | Player of the Week | Matchup Weapon",
      "headline": "string",
      "dek": "string",
      "rank_label": "#1 QB by Glory",
      "stat_strip": [
        { "label": "Glory", "value": "100.0" },
        { "label": "EPA", "value": "+0.42/play" },
        { "label": "Impact", "value": "Elite" }
      ],
      "reason_codes": [
        "Top positional Glory score",
        "High leverage production",
        "Strong efficiency profile"
      ],
      "cta": {
        "label": "View Player Card",
        "href": "/players/{player_id}"
      },
      "confidence": "high"
    },
    "alternates": []
  }
}
```

Guardrails:

* Do not select a spotlight without reason codes.
* If no advanced stats exist, use roster/profile-based spotlight and mark confidence medium/low.

---

## 4. Position Power Boards

Purpose:
Show top players by role, not just raw position.

Position groups should match the site ontology:

Offense:

* QB / Passers
* Ball Carriers
* Pass Catchers
* Run Blockers
* Pass Blockers

Defense:

* Run Stoppers
* Pass Defenders
* Pressure Creators
* Coverage Players

Special Teams:

* Returners
* Kickers
* Punters
* Coverage / Hidden Yards if supported

Required payload:

```json
{
  "position_boards": [
    {
      "board_id": "qb",
      "label": "Quarterbacks",
      "position_group": "QB",
      "description": "Passers driving offensive value.",
      "href": "/players/positions/qb",
      "leaders": [
        {
          "rank": 1,
          "player": {},
          "score": 100.0,
          "score_label": "Glory",
          "metrics": {
            "glory": 100.0,
            "epa_per_play": 0.42,
            "success_rate": 0.51,
            "explosive_rate": 0.14,
            "production_score": 92.4
          },
          "reason_codes": [
            "Elite Glory score",
            "High efficiency",
            "Strong explosive production"
          ],
          "confidence": "high"
        }
      ]
    }
  ]
}
```

Ranking logic:
Use Glory score where available. If Glory is unavailable, rank by production_score. If neither exists, rank by core position stats with confidence lowered.

---

## 5. Conference / Division Talent Map

Purpose:
Show talent landscape by SWAC East, SWAC West, and MEAC.

Each division/conference card should answer:

* top player
* strongest position group
* breakout count
* transfer impact count
* hidden gem count
* physical profile note if available

```json
{
  "conference_talent_map": [
    {
      "group_id": "swac_east",
      "label": "SWAC East",
      "conference": "SWAC",
      "division": "East",
      "href": "/players/conference/swac-east",
      "summary": {
        "total_players": 0,
        "players_with_stats": 0,
        "top_position_group": "Pass Catchers",
        "top_school_by_talent_score": "Jackson State",
        "breakout_count": 7,
        "transfer_impact_count": 5,
        "hidden_gem_count": 3
      },
      "top_player": {},
      "top_position_groups": [
        {
          "position_group": "Pass Catchers",
          "talent_score": 88.4,
          "top_player_id": "",
          "top_player_name": ""
        }
      ],
      "school_snapshots": [
        {
          "school_id": "",
          "school_name": "",
          "talent_score": 0,
          "top_player": {},
          "strongest_group": "QB",
          "breakout_count": 0,
          "transfer_impact_count": 0
        }
      ],
      "confidence": "medium"
    }
  ]
}
```

Suggested talent score ingredients:

* top-end Glory
* number of ranked players
* production score by position group
* transfer impact
* breakout count
* physical completeness confidence

---

## 6. Breakout Radar

Purpose:
Identify players rising above prior expectation or previous baseline.

Inputs to use if available:

* year-over-year production increase
* year-over-year EPA increase
* expanded role
* increased touches/targets/tackles
* new starter flag
* class-year jump
* transfer jump
* high efficiency with growing usage

Payload:

```json
{
  "breakout_radar": [
    {
      "rank": 1,
      "player": {},
      "breakout_score": 91.2,
      "breakout_type": "Production Jump | Expanded Role | Efficiency Spike | New Starter | Young Player Rise | Transfer Leap",
      "current_metrics": {
        "production_score": 88.1,
        "epa_per_play": 0.31,
        "usage_share": 0.22,
        "glory": 84.0
      },
      "prior_metrics": {
        "production_score": 49.4,
        "epa_per_play": 0.05,
        "usage_share": 0.08,
        "glory": null
      },
      "delta_metrics": {
        "production_score_delta": 38.7,
        "usage_share_delta": 0.14,
        "epa_per_play_delta": 0.26
      },
      "reason_codes": [
        "Production score up sharply",
        "Usage share increased",
        "Efficiency improved with larger role"
      ],
      "href": "/players/{player_id}",
      "confidence": "high"
    }
  ]
}
```

Fallback:
If no prior-year data exists, use “First-Year Impact” instead of “Breakout.”

---

## 7. Transfer Impact Board

Purpose:
Show transfers who changed the competitive picture.

Inputs:

* is_transfer
* previous_school
* transfer_tier if available
* production score
* usage
* starting role
* EPA contribution
* team need filled
* position scarcity

Payload:

```json
{
  "transfer_impact": [
    {
      "rank": 1,
      "player": {},
      "previous_school": "string",
      "transfer_tier": "FBS | FCS | D2 | JUCO | HS | Unknown",
      "impact_score": 89.5,
      "impact_type": "Immediate Starter | Rotation Impact | Star Addition | Need Filler | High-Upside",
      "metrics": {
        "production_score": 0,
        "usage_share": 0,
        "glory": 0,
        "team_position_need_score": 0
      },
      "reason_codes": [
        "Immediate starter",
        "High usage",
        "Filled position need"
      ],
      "href": "/players/{player_id}",
      "confidence": "medium"
    }
  ]
}
```

---

## 8. Hidden Gems

Purpose:
Find players whose impact is stronger than their visibility.

Possible logic:

* high efficiency, low volume
* strong Glory but low raw stat rank
* high EPA contribution on lower-profile team
* high per-touch impact
* strong defensive disruption without headline counting stats
* underrated due to team record or low usage

Payload:

```json
{
  "hidden_gems": [
    {
      "rank": 1,
      "player": {},
      "hidden_gem_score": 86.7,
      "gem_type": "High Efficiency / Low Volume | Small School Standout | Underused Weapon | Defensive Disruptor | Special Teams Weapon",
      "visibility_score": 32.1,
      "impact_score": 84.9,
      "metrics": {
        "production_score": 78.2,
        "usage_share": 0.09,
        "epa_per_touch": 0.48,
        "glory": 82.0
      },
      "reason_codes": [
        "High efficiency on limited volume",
        "Strong impact score",
        "Low raw stat visibility"
      ],
      "href": "/players/{player_id}",
      "confidence": "medium"
    }
  ]
}
```

Important:
Do not mark obvious top stars as hidden gems unless visibility score supports it.

---

## 9. Physical Outliers

Purpose:
Give the Players Hub a discovery layer based on body profile.

Inputs:

* height
* weight
* position
* conference position averages
* percentile by position group
* class year
* production if available

Outlier types:

* Prototype Size
* Undersized Producer
* Massive Interior
* Long DB
* Big Receiver
* Compact Power Back
* Hybrid Defender
* Frame Projection

Payload:

```json
{
  "physical_outliers": [
    {
      "rank": 1,
      "player": {},
      "outlier_type": "Big Receiver",
      "position_group": "Pass Catcher",
      "height": "6-4",
      "weight": 215,
      "percentiles": {
        "height_percentile": 96,
        "weight_percentile": 88,
        "bmi_percentile": 72
      },
      "production_context": {
        "production_score": 71.4,
        "usage_share": 0.18
      },
      "reason_codes": [
        "96th percentile height among pass catchers",
        "Above-average production profile"
      ],
      "href": "/players/{player_id}",
      "confidence": "high"
    }
  ]
}
```

Fallback:
If production is missing, still return physical outliers but label them as “profile only.”

---

## 10. Archetype Explorer

Purpose:
Group players by football role identity.

This is one of the signature Players Hub features.

Suggested archetypes:

Offense:

* Efficiency QB
* Chaos QB
* Scramble Creator
* Chain Mover
* Field Stretcher
* Red Zone Target
* Volume Back
* Explosive Back
* Workhorse
* Pass-Pro Anchor
* Run-Game Mover

Defense:

* Run Eraser
* Edge Disruptor
* Interior Wall
* Havoc Linebacker
* Coverage Anchor
* Ball Hawk
* Box Safety
* Pressure Creator

Special Teams:

* Field Flipper
* Return Threat
* Touchback Leg
* Hidden Yards Weapon

Payload:

```json
{
  "archetypes": [
    {
      "archetype_id": "field_stretcher",
      "label": "Field Stretchers",
      "description": "Pass catchers who create vertical stress and explosive gains.",
      "category": "Offense",
      "href": "/players/archetypes/field-stretcher",
      "count": 12,
      "leaders": [
        {
          "rank": 1,
          "player": {},
          "archetype_score": 92.3,
          "metrics": {
            "explosive_rate": 0.18,
            "yards_per_reception": 18.4,
            "air_yards_share": null,
            "touchdown_rate": 0.11
          },
          "reason_codes": [
            "High explosive rate",
            "Strong yards per reception"
          ],
          "confidence": "medium"
        }
      ]
    }
  ]
}
```

Guardrails:

* Only assign archetypes if the data supports them.
* Use confidence levels.
* If advanced route/depth data does not exist, avoid over-specific labels like “deep route specialist.”
* Use general labels like “Explosive Pass Catcher” if needed.

---

## 11. Glory Leaders Preview

Purpose:
Let Players Hub surface the Glory system without replacing the Glory hub.

Payload:

```json
{
  "glory_leaders": {
    "overall": [
      {
        "rank": 1,
        "player": {},
        "glory": 100.0,
        "tier": "ELITE",
        "pillars": {
          "impact": 100.0,
          "execution": 90.7,
          "disruption": 50.0,
          "context": 50.0,
          "consistency": 50.0
        },
        "href": "/players/{player_id}",
        "confidence": "high"
      }
    ],
    "by_position_group": [
      {
        "position_group": "QB",
        "leader": {},
        "glory": 100.0,
        "href": "/players/positions/qb"
      }
    ]
  }
}
```

---

## 12. Weekly Matchup Weapons

Purpose:
Bridge Players Hub with Game Center.

Only return this if schedule/opponent matchup data exists.

Inputs:

* upcoming games
* opponent weakness by unit
* player strength by role
* player usage
* explosive profile
* defensive/offensive matchup metrics

Payload:

```json
{
  "weekly_matchup_weapons": [
    {
      "player": {},
      "game_id": "string",
      "week": 1,
      "opponent_school_id": "string",
      "opponent_school_name": "string",
      "weapon_type": "Deep Threat | Power Runner | Mobile QB | Edge Pressure | Return Threat | Red Zone Target",
      "matchup_note": "WR vs vulnerable secondary",
      "advantage_score": 81.4,
      "player_strength_metric": {
        "label": "Explosive Rate",
        "value": "18%"
      },
      "opponent_weakness_metric": {
        "label": "Explosive Passes Allowed",
        "value": "High"
      },
      "reason_codes": [
        "Player creates explosives",
        "Opponent allows explosive pass gains"
      ],
      "href": "/games/{game_id}",
      "confidence": "medium"
    }
  ]
}
```

Fallback:
If matchup data is unavailable, omit this array or return an empty array with a metadata note.

---

## 13. Player Index Preview

Purpose:
Give the frontend a small general browsing list without returning the entire roster.

```json
{
  "player_index_preview": [
    {
      "player": {},
      "tags": ["Breakout", "Transfer", "Glory Top 10"],
      "primary_metric": {
        "label": "Production",
        "value": "88.4"
      },
      "href": "/players/{player_id}"
    }
  ]
}
```

---

# Derived Metric Suggestions

## Talent Score

Use at school/division/position group level.

Possible formula:

```text
talent_score =
  weighted_top_end_glory
+ ranked_player_depth
+ production_score_depth
+ transfer_impact
+ breakout_count_bonus
```

Normalize 0–100.

---

## Breakout Score

```text
breakout_score =
  production_score_delta
+ usage_share_delta
+ epa_delta
+ new_starter_bonus
+ young_player_bonus
```

Normalize 0–100.

---

## Transfer Impact Score

```text
transfer_impact_score =
  production_score
+ usage_share
+ starter_bonus
+ team_need_bonus
+ transfer_tier_context
```

Normalize 0–100.

---

## Hidden Gem Score

```text
hidden_gem_score =
  impact_score - visibility_score
+ efficiency_bonus
+ low_volume_bonus
+ lower_team_attention_bonus
```

Normalize 0–100.

---

## Archetype Score

Depends on archetype.

Examples:

Field Stretcher:

```text
explosive_rate + yards_per_reception + deep_target_rate if available
```

Chain Mover:

```text
success_rate + first_down_rate + third_down_conversion_involvement
```

Run Eraser:

```text
run_stop_rate + tackles_for_loss + short-yardage defensive stops
```

Return Threat:

```text
return_yards_over_expected + explosive_return_rate + TD/near-TD return events
```

Field Flipper:

```text
punt_net_yards + inside_20_rate + opponent_start_position_suppression
```

---

# Backend Acceptance Criteria

The backend should return:

1. A single frontend-ready Players Hub payload.
2. Stable IDs for all players and schools.
3. Confidence values for all inferred metrics.
4. Reason codes for spotlight, breakouts, hidden gems, archetypes, transfers, and stock-like labels.
5. Graceful nulls for missing data.
6. No unsupported labels.
7. No mentor-style narrative or subjective claims without evidence.
8. No giant raw roster table.
9. Enough data for the frontend to render compact cards, boards, and widgets immediately.
10. Metrics should be pre-ranked and pre-sorted where possible.

---

# Minimum Viable V1 Payload

If the full version is too much, prioritize this:

```json
{
  "season": 2025,
  "summary": {},
  "spotlight": {},
  "position_boards": [],
  "conference_talent_map": [],
  "breakout_radar": [],
  "transfer_impact": [],
  "hidden_gems": [],
  "archetypes": [],
  "glory_leaders": {},
  "metadata": {
    "missing_or_pending": []
  }
}
```

V1 must support these frontend widgets:

* Player Spotlight
* Position Power Boards
* Conference Talent Map
* Breakout Radar
* Transfer Impact
* Hidden Gems
* Archetype Explorer
* Glory Leaders Preview

Everything else can be added later.
