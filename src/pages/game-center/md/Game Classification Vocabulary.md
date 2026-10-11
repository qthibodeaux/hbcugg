# Game Classification Vocabulary

**Module:** `src/utils/gameClassification.js`
**Applies to:** Week Central, Season Schedule, Team Schedule, Games Hub, Conference Slate, Classics & Homecomings
**Last updated:** 2026-08-25
**Status:** Vocabulary settled. Backend fields not yet shipping — filters fail open until they do.

---

## 1. Why this exists

Five pages filter games. Each grew its own implementation, and each got the same case wrong.

**NC Central vs Texas Southern** is MEAC vs SWAC — non-conference, and both teams are ours. Every existing filter hides it behind a control labeled "Non-Conf," which is exactly what a user would expect that label to do. The label isn't the bug; the axis is.

Worse, classification was being done by substring search over prose. From `teamScheduleModel.js`:

```js
if (filter === "championship") {
  return text.includes("championship") || text.includes("champ game")
      || text.includes("swac champ") || text.includes("meac champ");
}
```

`text` is `game_type`, `game_name`, `event_name`, `classic_name`, `stage_label`, and `status_label` concatenated and lowercased. The same pattern appears in `gameCenterPayloads.js` (`game_type?.includes("conference")`) and `weekCentralAdapter.js` (`names.includes("celebration")`).

And `filter === "division"` read `team.division === opponent.division` straight off `teams.json` — the field that listed Alcorn State in the wrong division until 2026-08-25.

---

## 2. The four axes

**These are independent.** A SWAC title game is covered *and* conference *and* a championship at once. NC Central vs Texas Southern is covered *and* non-conference. Flattening them into a single sibling list is what produced the broken filters.

| Axis | Field | Values |
|---|---|---|
| Coverage | `opponent_class` | `covered` · `hbcu_external` · `non_hbcu` |
| Conference | `conference_scope` | `conference` · `non_conference` |
| Division | `division_scope` | `division` · `cross_division` · `not_applicable` |
| Stage | `game_type` | `regular` · `conference_championship` · `bowl` · `playoff` |

### Coverage

"HBCU" and "one of our 18" are not the same thing, and the difference is not hypothetical:

| Opponent | `opponent_class` | Why |
|---|---|---|
| Jackson State | `covered` | SWAC, one of our 18 |
| North Carolina Central | `covered` | MEAC, one of our 18 |
| Tennessee State | `hbcu_external` | HBCU, but Big South-OVC |
| Hampton, NC A&T | `hbcu_external` | HBCUs that left for the CAA |
| D2 SIAC / CIAA schools | `hbcu_external` | HBCUs below FCS |
| Florida, Southern Miss | `non_hbcu` | FBS guarantee games |

`is_covered_matchup` is the derived boolean the filters use: **true when both teams are `covered`.**

### Why `is_covered_matchup`, not `is_hbcu_matchup`

Jackson State vs Tennessee State *is* an HBCU matchup. It is not a matchup we cover. A field named `is_hbcu_matchup` returning `false` for it would be lying.

The **UI label stays "HBCU Only"** — that is what a fan means, and the distinction is pedantic in a filter pill. The field name is precise; the label is human.

### Conference and division

`conference_scope` is independent of coverage. MEAC vs SWAC is `non_conference` and still `covered`.

`division_scope` is `not_applicable` for MEAC (no divisions) and for any non-conference game.

### Stage, and named events

`game_type` replaces every string match. Named events sit **beside** it, not inside it, because a Classic is usually also a regular conference game:

```json
{
  "game_type": "regular",
  "conference_scope": "conference",
  "event": { "kind": "classic", "name": "Bayou Classic" }
}
```

`event.kind` is `classic` or `homecoming`. This is also the field the Classics & Homecomings page needs and does not currently have.

---

## 3. Backend contract

Every game object on every page that filters carries:

```json
{
  "opponent_class": "covered",
  "is_covered_matchup": true,
  "conference_scope": "non_conference",
  "division_scope": "not_applicable",
  "game_type": "regular",
  "event": null
}
```

| Field | Required | Notes |
|---|---|---|
| `opponent_class` | yes | Per-opponent classification |
| `is_covered_matchup` | yes | Both sides `covered`. The primary filter field |
| `conference_scope` | yes | Independent of coverage |
| `division_scope` | yes | `not_applicable` is a real value, not a null |
| `game_type` | yes | Never inferred from a name string |
| `event` | when applicable | `null` for an ordinary game |

Backend owns all six. Per cross-page rule 6 in [Game Center Fetch Contract.md](./Game%20Center%20Fetch%20Contract.md), the frontend computes none of them.

---

## 4. Frontend usage

```js
import { GAME_FILTERS, pickFilters, filterGames } from "../../utils/gameClassification";

// Two-state toggle - Week Central, Season Schedule
const filters = pickFilters("all", "hbcu");

// Full pill rail - Team Schedule
const filters = GAME_FILTERS;

const visible = filterGames(games, activeFilterId);
```

| Filter id | Label | Test |
|---|---|---|
| `all` | All Games | always true |
| `hbcu` | HBCU Only | `is_covered_matchup` |
| `conference` | Conference | `conference_scope === "conference"` |
| `division` | Division | `division_scope === "division"` |
| `championship` | Conf Champ | `game_type === "conference_championship"` |
| `postseason` | Postseason | `game_type` is `bowl` or `playoff` |

Same ids, same labels, same semantics on every page. No page keeps its own copy.

### Filters fail open

While the backend is still adding these fields, a strict `=== true` would empty the board — which reads to a user as *"there are no games"* rather than *"this filter isn't wired yet."*

So unknown passes. `is_covered_matchup: undefined` is included by the `hbcu` filter; only an explicit `false` is excluded. The result is a visible superset rather than a false empty. Each guard disappears when its field ships.

### Filters are not badges

`conference_scope` drives the small `NC` badge on a Season Schedule cell. That badge marks a non-conference game that **still belongs on the board** — it is a label, not a filter. The old code conflated them, which is how a display marker became a reason to hide a row.

---

## 5. What this replaces

| Removed | Replaced by |
|---|---|
| `gameMatchesFilter` string matching over six concatenated text fields | `game_type` equality |
| `team.division === opponent.division` read from `teams.json` | `division_scope` |
| `!!opponent` as a proxy for "is HBCU" | `is_covered_matchup` |
| `game_type?.includes("conference")` | `conference_scope` |
| `names.includes("celebration")` | `game_type` / `event` |
| `includeNonConference` on Week Central and Season Schedule | `hbcu` filter id |
| Per-page `SCHEDULE_FILTERS` / toggle definitions | `GAME_FILTERS` |

---

## 6. Migration status

| Page | Filter today | Target | Blocked on |
|---|---|---|---|
| Week Central | `includeNonConference`, correct axis, wrong name | `pickFilters("all", "hbcu")` | `is_covered_matchup` |
| Season Schedule | `game_type.includes("conference")`, wrong axis, defaults on | `pickFilters("all", "hbcu")` | `is_covered_matchup` |
| Team Schedule | `SCHEDULE_FILTERS` + string matching | `GAME_FILTERS` | all six fields |
| Games Hub | not audited | TBD | — |
| Conference Slate | none — the matrix axes are the filter | none needed | — |
| Classics & Homecomings | no data | `event.kind` | `event` |

No page has been migrated yet. The module exists; adoption follows the backend fields.
