# Game Preview Fetch Contract

**Last updated:** 2026-10-01
**Scope:** `/game/preview/:gameId` — the page for a game that has **not been played**, between two of the 18 programs — and its export image `/game/preview/:gameId/export`
**Companions:** [Game Page Fetch Contract.md](./Game%20Page%20Fetch%20Contract.md) (the played-game page this hands off to) · [Game Export Fetch Contract.md](./Game%20Export%20Fetch%20Contract.md) · [Games Hub Design Doc.md](./Games%20Hub%20Design%20Doc.md) · [Team Schedules Design Doc.md](./Team%20Schedules%20Design%20Doc.md)

**Out of scope — post launch.0:** a preview for a game against an opponent outside the 18. See `AFTER_LAUNCH_0.md` §3.

**These are type contracts, not example payloads.** Field names and types only.

**Notation:** `string` `integer` `number` `boolean` — plain types. `T | null` — nullable. `T[]` — array of `T`. `{ [team_id]: T }` — keyed by v5 team id, one entry per side.

**Data ownership rule (same as every other Game Center page):** the backend ranks and decides, the frontend displays. The page joins only visual identity locally — logo, colors, full name, mascot from `src/data/teams.json` keyed on `team_id`. It does not rank teams, compute series records, derive streaks, or reword anything.

---

## Why this document exists

The page ships on launch.0 built from five files that were never designed for it. It works, but two of its three sections are not accurate yet, and the rest depends on workarounds. This document asks for **one purpose-built export** so the page reads real, current data in one request.

| Section | Reads today | State |
|---|---|---|
| Banner — teams, records entering, date, kickoff, venue, event | Both teams' `team-schedules/{season}/{team_id}.json` rows | Real, but kickoff has no time zone and several fields need cleaning (see *Known data problems*) |
| Unit matchups table | `0-data/team_analytics_hub.json` → `matchupTable()` | **Placeholder.** Every value is a deterministic stand-in tilted by each team's rating. Nothing on screen is a real stat. The page says so in its heading. |
| Previous meetings | `games/index.json`, filtered on the client | Real, but only games we hold a file for (2019+). The series tally and streak are computed on the client. |
| Earlier editions of the event (a classic, a homecoming) | `/data/event_instances.json` + `games/index.json`, joined on the client | Partly real. Opponent ids are often null, stadium text carries promo copy, and a result is missing wherever we hold no game file. |
| Export poster | Same data as the page | Inherits every gap above |

---

## Request

**One file per upcoming game**, so a card on any page that already knows the `game_id` can reach it with no lookup:

```text
GET /data/93-FE Docs/game-center/game-preview/{season}/{game_id}.json
```

`{game_id}` is the schedule's game id — `YYYY-MM-DD_<away_team_id>_at_<home_team_id>`, v5 ids (for example `2026-11-28_swacgsu_at_swacsu`). It already exists on every schedule row, hub card and games-hub row, and is the only stable identity an unplayed game has (`game_path_id` is null until a game file exists).

- One request. Season comes from the id's date prefix; the page does not wait on any other fetch.
- **Both covered teams must be in the file.** A game with an outside opponent has no preview file (post launch.0).
- Same cache behavior as the other scoped exports: the page reads it with `staleTime: Infinity` within a visit.

---

## When the game gets played

A preview link outlives the preview. The same file is also what the page checks first, so it can send a visitor to the right place.

```text
status: "scheduled" | "final" | "postponed" | "cancelled"
played_game_path_id: string | null      // set once a game file exists; the page redirects to /game/{played_game_path_id}
```

- `status: "final"` or a non-null `played_game_path_id` → the page redirects to the played-game page.
- `postponed` / `cancelled` → the page shows the banner with that status in place of the countdown, and hides the unit matchups.

---

## Envelope

```text
game_id: string
season: integer
generated_at: string                    // ISO 8601 with offset
status: "scheduled" | "final" | "postponed" | "cancelled"
played_game_path_id: string | null

date: string                            // ISO date, "YYYY-MM-DD", the game's local date
week: integer | null
week_label: string | null

kickoff: {
  at: string | null                     // ISO 8601 WITH offset, e.g. "2026-11-28T13:00:00-06:00". null = time not announced
  label: string | null                  // display string, e.g. "1:00 PM CT". null when at is null
  tbd: boolean                          // true when the time is not announced
} 

venue: {
  stadium_name: string | null
  city: string | null                   // "City, ST" — see Known data problems #3
  sponsor: string | null
  neutral_site: boolean
  neutral_site_name: string | null
}

event: {
  kind: "classic" | "homecoming" | "promotion" | "championship" | "bowl" | "theme" | null
  name: string | null                   // display name as it should print, e.g. "53rd Annual Bayou Classic"
  type_id: string | null                // the event_instances event_type_id, e.g. "bayou_classic"
  type_label: string | null             // "Bayou Classic" — the name without the edition
  owner_team_id: string | null          // for a team-specific event (a homecoming), the team whose event it is; null for a classic both teams share
} | null

flags: {
  is_rivalry: boolean
  is_homecoming: boolean
  is_conference_championship: boolean
  is_celebration_bowl: boolean
}

away: TeamSide
home: TeamSide

TeamSide: {
  team_id: string                       // v5 id
  record_entering: string               // e.g. "2-1" — as of this game, not season total
  conference_record_entering: string    // e.g. "0-0"
  conference: "SWAC" | "MEAC"
}
```

**Notes**
- `kickoff.at` carrying an offset is the one change that matters most for the banner. Today the schedule gives a clock string ("13:00", "06:05 PM", "TBA") with no zone, so the countdown is read in the viewer's time zone and is wrong for anyone outside the venue's zone.
- `event` replaces two sources the page currently reconciles by hand (the schedule row's `event` and the `event_instances` tag). One block, already resolved.
- `record_entering` and `conference_record_entering` are for **both** teams, point-in-time (same rule as the hub's `record`).

---

## Unit matchups

The table is two season-profile columns and two head-to-head tables (away offense vs home defense, away defense vs home offense). It needs, for each team, the fields below — **value and league rank**. The frontend takes both as given and never recomputes a rank.

```text
stats: {
  season: integer                       // the season these numbers describe
  basis: "current_season" | "prior_season"
  through_week: integer | null          // last week included; null if basis is prior_season
  ranked_teams: integer                 // how many teams the ranks are out of (18)
  teams: { [team_id]: {
    games_played: integer               // games behind the numbers; 0 means every field is null
    fields: { [field_key]: { value: number | null, rank: integer | null } }
  } }
}
```

- **`rank`** is polarity-aware: **1 is always best**. A defensive field where lower is better ranks the lowest value 1st. The page colors the top third green and the bottom third red off this number.
- **`games_played`** is required. Early in a season the sample is one to three games, and the page needs to say so rather than show a rank that means little.
- **`basis`** is the backend's call, and the page prints it. The page does not blend seasons. Early in 2026 the current-season files are empty, so the choice is either `prior_season` with the prior season's real numbers, or `current_season` with nulls and a low `games_played`. Either is acceptable — it must be stated in the payload.
- A field with no value is `{ value: null, rank: null }`, never omitted — the table keeps its rows.

### Field keys

Offense fields start `o_`, defense fields start `d_`, net fields `net_`. Every field below is on the page today.

| Section | Field key | Unit | Better |
|---|---|---|---|
| Season profile | `net_adj_epa` | EPA / play, opponent-adjusted | higher |
| | `o_adj_epa` · `d_adj_epa` | EPA / play, opponent-adjusted | higher · lower |
| | `net_epa` | EPA / play | higher |
| | `o_epa` · `d_epa` | EPA / play | higher · lower |
| | `o_success` · `d_success` | success rate (0–1) | higher · lower |
| | `o_success_pass` · `d_success_pass` | success rate on dropbacks | higher · lower |
| | `o_success_rush` · `d_success_rush` | success rate on designed runs | higher · lower |
| | `net_epa_drive` | EPA / drive | higher |
| | `o_epa_drive` · `d_epa_drive` | EPA / drive | higher · lower |
| | `net_fp` | net starting field position, yards | higher |
| Head to head | `o_epa_pass` · `d_epa_pass` | EPA / dropback | higher · lower |
| | `o_epa_rush` · `d_epa_rush` | EPA / designed run | higher · lower |
| | `o_avail_yds` · `d_avail_yds` | available yards % (0–1) | higher · lower |
| | `o_start_fp` · `d_start_fp` | average starting field position, yards from own goal line | higher · lower |
| | `o_early_epa` · `d_early_epa` | EPA / play on 1st and 2nd down | higher · lower |
| | `o_third_succ` · `d_third_succ` | 3rd / 4th down success rate (0–1) | higher · lower |
| | `o_third_dist` · `d_third_dist` | average 3rd-down distance, yards | lower · higher |

**Definitions needed.** These are the stat names the page prints. Each needs a one-line definition from the pipeline so the frontend can show a glossary and the numbers can be audited:

- **Available yards %** — how it is computed (the page has no way to know).
- **Early downs** — 1st and 2nd down only, or includes something else?
- **Start field position** — coordinate convention. `o_start_fp` is read as "yards from own goal line" (so 28 = own 28); `net_fp` is a yard difference.
- **Opponent-adjusted** — the method, the season it uses, and the minimum games before it is shown.
- **Success rate** — the standard definition used elsewhere in the app (`advanced_team.success_rate`) or a different one.

**Optional, not required for launch:** a `league_avg` per field next to `value` and `rank`. The page does not show it today.

---

## Previous meetings

```text
meetings: {
  coverage_from_season: integer | null  // earliest season the data is complete from, e.g. 2019
  series: {
    games: integer                      // meetings counted
    wins: { [team_id]: integer }        // wins for each side; ties are games minus the sum
    current_streak: { team_id: string, games: integer } | null
  } | null
  items: [{                             // newest first; the page shows six
    game_id: string
    game_path_id: string | null         // null when no game file exists — the row is then not a link
    date: string                        // ISO date
    season: integer
    away_team_id: string
    home_team_id: string
    away_score: integer | null
    home_score: integer | null
    venue: { stadium_name: string | null, city: string | null } | null
    event_name: string | null           // if the meeting was itself a named event
  }]
}
```

- **`series` is backend-computed.** The page currently counts wins from the list it holds and states "series since {first season on file}". That undercounts any series older than our files and, if the list is truncated, miscounts it. If the backend has the full series, it should send it and set `coverage_from_season` honestly.
- **`items[].venue`** — today this is a single free-text `site` string off the games index ("Houston, Texas (BBVA Stadium)"). Structured is better; a single string is acceptable if it is consistent.
- Meetings include neutral-site games and conference championship games between these two teams.

---

## Earlier editions of the event

For a named event — a classic, a homecoming, a promotion — the page lists earlier editions below the meetings.

```text
event_history: {
  title: string                         // the heading as it should print, e.g. "Grambling State Homecoming" or "Bayou Classic"
  scope: "shared" | "team"              // shared = one game both teams play (a classic); team = one team's events (a homecoming)
  owner_team_id: string | null          // set when scope is "team"
  items: [{                             // newest first; the page shows six
    date: string                        // ISO date
    season: integer
    name: string | null                 // that edition's own name, e.g. "Gold Rush - Homecoming"
    game_id: string | null
    game_path_id: string | null
    away: { team_id: string | null, name: string }   // name always present; team_id set whenever the opponent is one of the 18
    home: { team_id: string | null, name: string }
    away_score: integer | null
    home_score: integer | null
    result_status: "final" | "no_result_on_file" | "cancelled"
    venue: { stadium_name: string | null, city: string | null } | null
  }]
} | null
```

- **For a homecoming, the list is that team's earlier homecomings only** — not both teams'. This is the main inaccuracy on the page today, fixed on the client for now by filtering on the event row's `team_id`.
- **Opponents must carry a v5 `team_id` whenever the opponent is one of the 18.** Today `event_instances.json` has `opponent_id: null` for many covered opponents (for example "Texas Southern University"), and the page recovers the id by matching names against `teams.json`. That is a guess. Please resolve it in the pipeline.
- **A score wherever one exists.** Editions where we hold no game file currently show "No result on file". If the result is known from any source (box score, schedule), send it, with `result_status` saying where the gap is.
- `null` when the game has no event.

---

## Known data problems the page works around today

Each of these is a fix on the backend that lets a client workaround be deleted.

| # | Problem | Where | Workaround on the client |
|---|---|---|---|
| 1 | Kickoff has no time zone, and arrives in mixed formats ("13:00", "06:05 PM", "TBA") | `team-schedules` rows `kickoff_label` | Parsed to a local `Date`, read in the viewer's zone |
| 2 | 2026 team season files are all null — `team_season_avg_2026.json` and `team_defense_avg_2026.json` carry only empty rate blocks, and neither holds the fields the table needs | `shared/` | The table uses the analytics hub's rating to generate placeholder values |
| 3 | `venue.stadium_name` carries the city on some 2026 rows, and one row carries promo copy ("… Senior Day/ Military Appreciation Day/ High School Day") as the stadium | `team-schedules` rows | Shown as-is |
| 4 | `event_instances.json` — `opponent_id` null for covered opponents; `stadium_name` carries promo text ("… GAME DAY COLOR: BLACK"); no results | `event_instances.json` | Opponent matched by name; promo text trimmed on the client |
| 5 | The games index only lists games we hold a file for, so meetings before 2019 and some editions are absent, and a game not yet parsed has no row | `games/index.json` | Tally covers only what is listed |
| 6 | Hub and games-hub rows for games already played still say `scheduled` with no `game_path_id` | `games_hub_2026.json` | A preview link for a played game redirects to the played page |
| 7 | Week markers and `game_id` formats differ between the schedule board (`2026-11-28_swacgsu_at_swacsu`) and the hub / games hub (`ASUSU29082026`, `2026-04-18-swacgsu-swacgsu`) | several | The preview id is derived from date + teams |

---

## Freshness

The page is only as good as its last build. A preview is read in the days before kickoff, when records, stats and kickoff time all change.

| Event | What must update the preview file |
|---|---|
| A game is played by either team | `record_entering` and `conference_record_entering` for every later game of those teams; `stats` (games played, values, ranks); `meetings` if the game was between these two |
| A game is parsed | `stats` for both teams; every other team's `rank` (ranks shift) |
| Kickoff time or venue changes | `kickoff`, `venue` |
| The game is played | `status`, `played_game_path_id` |

- `generated_at` on the file; the page does not display it today but a stale preview should be detectable.
- **Rebuild all upcoming-game previews, not only the next one.** A fan can open a game weeks out, and its `stats.rank` values must match the ranks in every other file built the same day.

---

## Export image

The shareable image (`/game/preview/:gameId/export`) renders from the **same payload** as the page — no additional fields are requested for it. If the pipeline later adds a short backend-written headline or a win probability, the poster will take them too.

---

## Not requested yet

Deliberately left off the page for now; listed so they are not a surprise later.

- **Win probability and projected points** (the corner box on the inspiration image). The schedule rows carry a `win_probability` field that is null everywhere; no preview section reads it.
- **Weather and attendance** — not in any export.
- **A narrative line or "why this game"** — the page has none; when the Why Engine ships `why_reasons`, they can be added to this file.
- **Direction and depth heat grids** (rush left / middle / right, pass short / deep) — a candidate later section; needs per-team-season direction splits.
- **Last five results** for each team — needs per-game margins in the same file or the team-schedule rows.

---

## Open decisions for the backend

1. **`stats.basis` early in a season** — prior season's real numbers, or current-season with a low `games_played`? The page can show either if the payload says which.
2. **Where `series` and `event_history` come from** — computed in this export, or joined from existing exports? The page does not care, as long as the shape above arrives resolved.
3. **Ids** — will `game_id` stay `date_away_at_home`, or move to the hub's `ASUSU29082026` form? One format, everywhere, is the ask (#7 above).
