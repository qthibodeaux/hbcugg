# Game Export Fetch Contract

**Last updated:** 2026-09-16
**Scope:** the "Export game" action on `/game/:gameId` — four shareable images rendered from the game file: (1) Offensive Breakdown, (2) Drives & Situations, (3) Away Boxscore, (4) Home Boxscore
**Companions:** [Game Page Fetch Contract.md](./Game%20Page%20Fetch%20Contract.md) (the game file this reads) · [Game Page Design Doc.md](./Game%20Page%20Design%20Doc.md)

The export makes **no request of its own**. It renders off the game file the page already holds, plus `shared/league_avg_{season}.json` for the league-average line under each stat. This document lists, image by image, which field each number reads — and the five fields the images need that the file does not carry today.

**These are type contracts, not example payloads.** Field names and types only.

**Notation:** `string` `integer` `number` `boolean` — plain types. `T | null` — nullable. `T[]` — array of `T`. `{ [team_id]: T }` — keyed by v5 team id, one entry per side.

---

## Request

None new.

```text
GET /data/93-FE Docs/game-center/games/{season}/{game_stem}.json     // already fetched by the page
GET /data/93-FE Docs/shared/league_avg_{season}.json                // already fetched by the page
```

The league file's `keys` map is read by the same field path the game file uses (`advanced_team.epa_per_play` → `keys["advanced_team.epa_per_play"].avg`). **Every stat listed below that is shown with a league average needs its path present in `keys`.** Most are; the new fields below need adding there too.

---

## Image 1 — Offensive Breakdown

Header: both teams, final score, week, date — off `away_team` / `home_team` / `week_label` / `date`. Then one row per stat, away value left, home value right, league average under the label.

| Stat | Field | League key | Status |
|---|---|---|---|
| Total EPA | `advanced_team[team].epa_total` | `advanced_team.epa_total` | shipped |
| EPA / play | `advanced_team[team].epa_per_play` | `advanced_team.epa_per_play` | shipped |
| Success rate | `advanced_team[team].success_rate` | `advanced_team.success_rate` | shipped |
| Yards / play | `team_box[team].yards_per_play` | `team_box.yards_per_play` | **NEW** — see below |
| Pass SR% | `passing_splits[team].total.success_rate` | `passing_splits.total.success_rate` | shipped |
| Rush SR% | `rushing_splits[team].total.success_rate` | `rushing_splits.total.success_rate` | shipped |
| Avg drive start | `team_box[team].avg_start_field_position` | `team_box.avg_start_field_position` | shipped |
| Series conversion rate | `series_summary[team]` (rate = 1 − none / series) | `series_summary.conversion_rate` | **NEW** — see below |
| 3rd down conversion | `team_box[team].third_down_conversions` / `third_down_attempts` / `third_down_conversion_rate` | `team_box.third_down_conversion_rate` | shipped |
| 4th down conversion | `team_box[team].fourth_down_go_conversions` / `fourth_down_goes` / `fourth_down_go_conversion_rate` | `team_box.fourth_down_go_conversion_rate` | shipped |
| Yards / drive | `advanced_basics.blocks[].metrics[key="derived.yards_per_drive"]` | `derived.yards_per_drive` | shipped |
| Explosive play % | `advanced_team[team].explosive_rate_yardage` | `advanced_team.explosive_rate_yardage` | shipped |
| Red zone EPA / play | `advanced_team[team].red_zone_epa_per_play` | `advanced_team.red_zone_epa_per_play` | **NEW** — see below |
| Turnovers | `team_box[team].turnovers_committed` | `team_box.turnovers_committed` | shipped |

---

## Image 2 — Drives & Situations

Three blocks.

**Offense EPA breakdown** — one row per team: dropback EPA, designed-run EPA, offense EPA.

| Column | Field | Status |
|---|---|---|
| Dropback EPA | `passing_splits[team].total.epa_total` | shipped |
| Designed run EPA | `rushing_splits[team].total.epa_total` | shipped |
| Offense EPA | `advanced_team[team].epa_total` | shipped |

**When did they move the chains?** — one 100%-stacked bar per team. The bar is every **series** the offense ran, split by **the down on which it gained a first down** — or "no conversion" if it never did. Five segments, left to right: 1st down · 2nd down · 3rd down · 4th down · No conversion. Each segment is labelled with its share of the team's series (`21%`).

**Series results** — one 100%-stacked bar per team. The same series, split by **how each one ended**. Five segments: TD · First down · FG · Punt · TO. Each labelled with its share.

**What a series is.** One set of downs: it starts at 1st down and ends when the offense either gains a new first down (the next series starts), scores, punts, kicks a field goal, turns the ball over (interception, fumble lost, turnover on downs), or the half/game ends. A drive is one or more series. A first down by penalty counts as a conversion on whichever down the penalty was accepted on.

**Required response** — counts per team; the frontend takes the shares:
```text
series_summary: { [team_id]: {
  series: integer                        // total sets of downs on offense
  chains_moved_on: {
    "1st": integer                       // series that gained a first down on 1st down
    "2nd": integer                       // … on 2nd down
    "3rd": integer                       // … on 3rd down
    "4th": integer                       // … on 4th down
    none: integer                        // series that never gained a first down
  }
  results: {
    td: integer                          // series that ended in a touchdown (the scoring play was in this series)
    first_down: integer                  // series that ended by gaining a first down (a new series followed)
    fg: integer                          // series that ended in a field-goal attempt, made or missed
    punt: integer                        // series that ended in a punt
    turnover: integer                    // interception, fumble lost, or turnover on downs
    other: integer                       // end of half / end of game / kneel-out — anything else
  }
  conversion_rate: number                // (series − chains_moved_on.none) ÷ series
}}
```

| Field | Rule |
|---|---|
| `chains_moved_on` | The five counts sum to `series`. A series that scored a TD without first gaining a new first down (e.g. 1st-and-10, 70-yard TD) counts under the down the TD was scored on — a score converts the series |
| `results` | The six counts sum to `series`. A series can end only one way |
| `td` vs `first_down` | A series that gained a first down AND later scored is two series: the first ends `first_down`, the second ends `td` |
| `fg` | Made or missed, blocked included — the series ended with the attempt |
| `turnover` | Turnover on downs included; a fumble recovered by the offense is not a turnover and the series continues |
| Overtime | Included. OT possessions start at 1st down like any other |
| `other` on the image | Rendered as a sixth grey segment only when non-zero |
| League line | `league_avg.keys["series_summary.conversion_rate"]` |

**Biggest plays by EPA** — two lists of three: the plays with the highest EPA and the plays with the lowest. One line each on the image: rank · team · quarter clock · down & distance · description · score after · EPA (green above, red below).

**Required response**
```text
biggest_plays: {
  positive: []{ ...play }                // up to 3, highest EPA first
  negative: []{ ...play }                // up to 3, lowest EPA first
}
play: {
  play_id: string
  team_id: string                        // the offense on the play
  quarter: integer                       // 5+ for overtime
  clock: string                          // "12:53"
  down: integer | null                   // null on kickoffs / PATs
  distance: integer | null
  description: string                    // composed, ≤ 120 characters — see rule
  score_after: { away: integer, home: integer }
  epa: number
}
```

| Field | Rule |
|---|---|
| Which plays qualify | Scrimmage plays only — rush, pass, sack. No kickoffs, punts, field goals, PATs, no-plays, or nullified plays. Penalty-only plays excluded |
| Ranking | By `epa`, using the same EPA already on `play_by_play[].epa`. Ties broken by earlier `sequence` |
| Fewer than three | Send what qualifies; the image draws fewer rows |
| `description` | Player names as `F.Last` ("K.Walker"); the play in plain words with yardage and the outcome: "K.Walker left end for 60 yards, TOUCHDOWN." · "P.Mahomes pass deep middle intended for X.Worthy INTERCEPTED by B.Jones at KC 29." No formation tags, no holder/snapper credits, no "clock 10:51" |
| `score_after` | After the play and its try, if the play scored |
| `epa` | Signed, two decimals is enough |

---

## Images 3 & 4 — Boxscore, one per team

Header as Image 1. Then three tables.

**Passing** — one row per passer, plus the passing zone grid for the lead passer.

| Column | Field | Status |
|---|---|---|
| C/A | `individual_stats[team].passing[].completions` / `attempts` | shipped |
| Yds | `.yards` | shipped |
| SR% | `.success_rate` | shipped |
| EPA | `.epa_total` | shipped |
| EPA/DB | `.epa_per_play` | shipped |
| Production | `production_scores[team][].components.passing_production` | shipped |
| Zone grid | `.direction_breakdown.{short,medium,deep}.{left,middle,right}.{attempts,completions,yards}` | shipped |

**Rushing** — one row per rusher.

| Column | Field | Status |
|---|---|---|
| A-Y | `individual_stats[team].rushing[].attempts` / `yards` | shipped |
| YPC | `.yards_per_carry` | shipped |
| SR% | `.success_rate` | shipped |
| EPA | `.epa_total` | shipped |
| EPA/Att | `.epa_per_play` | shipped |
| O-line yds | `.line_yards_per_carry` | shipped |
| Highlight yds | `.highlight_yards_per_opportunity` | shipped |
| Explosive | `.explosive_carries_10` | shipped |
| Production | `components.rushing_production` | shipped |

**Receiving** — one row per receiver.

| Column | Field | Status |
|---|---|---|
| T/R/Yds | `individual_stats[team].receiving[].targets` / `receptions` / `yards` | shipped |
| Yds/Rec | `.yards_per_reception` | shipped |
| Explosive | `.explosive_receptions` | **NEW** — see below |
| SR% | `.success_rate` | **NEW** — see below |
| EPA/Tgt | `.epa_per_target` | **NEW** — see below |
| Production | `components.receiving_production` | shipped |

---

## What the file needs that it doesn't carry

Five items. Two are new to this document; three repeat asks already in LAUNCH_0_BACKEND_NOTES.md and are restated here so this contract is complete on its own.

### 1. `team_box[team].yards_per_play` — number
Total yards ÷ offensive plays. The frontend derives this today; it should be a field, and a key in `league_avg`. *(Repeat ask.)*

### 2. `advanced_team[team].red_zone_epa_per_play` — number | null
EPA per play on snaps inside the opponent's 20. `null` when a team had no red-zone snaps. Add to `league_avg.keys`. *(New.)*

### 3. `series_summary` — per team
Specified in full under **Image 2** above. Add `league_avg.keys["series_summary.conversion_rate"]`. *(Also asked for the Summary tab's series cards — one block serves both.)*

### 4. `biggest_plays` — per game
Specified in full under **Image 2** above. *(New.)*

### 5. Receiving efficiency — on every `individual_stats[team].receiving[]` row
```text
success_rate: number | null                         // per target; an incompletion counts against the receiver
epa_total: number | null
epa_per_target: number | null
explosive_receptions: integer                       // backend-defined threshold, same one as explosive_carries_10's yardage rule for passes
```
Plus `league_avg.keys["receiving_splits.total.success_rate"]` and `["receiving_splits.total.epa_per_target"]` for the shading baseline. *(Repeat ask — Production tab.)*

---

## Rules

| Field | Rule |
|---|---|
| Every value | Read as shipped; the export formats, it does not compute. A missing field prints as a dash on the image |
| League averages | One number per stat, from `league_avg.keys[path].avg`; the image labels it "Lg Avg". A national average, if it ships, is labelled separately |
| Team identity | `away_team` / `home_team` on the file: `team_id`, `name`, `score`, `record`, `conference_record` — the header reads these and nothing else |
| Player names | `name` as shipped ("Kelly,Tyree"); the image prints last name first-initial |
