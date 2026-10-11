# Player Explorer — Data Inventory for Frontend Discussion (2026-08-21)

This supersedes the shape (not the field-level facts) of `PLAYER_STATS_ADVANCED_INVENTORY_2026-08-21.md`. That doc was organized around fixed tabs/sections. The actual product decision (see `PLAYER_TAXONOMY_RECONCILED_2026-08-21.md`) is an **explorer**: pick a player, then filter by Situation category × Scale × Stat domain, and see whatever data exists for that cut. This doc maps what's real today onto that matrix, so the frontend conversation about exposing/categorizing/visualizing starts from verified ground, not a wishlist.

Every field/claim below was checked against a live game file (`90-Output/2025/alcfamu25.json`) and the actual pipeline code (`21-Drive-Parser/drive_builder.py`, `24-Game-Advanced/compute_game_advanced.py`) on this date — not recalled from an earlier design doc. Where something in `GloryTaxonomy.md` claims "Existing" but wasn't independently re-verified here, it's marked as such.

### Status legend
- ✅ **player-level, ready** — exists today, attributed to an individual player, usable as-is
- 🟡 **exists, wrong level** — the data is real and computed, but at team/play/drive level, not yet joined to a specific player
- 🚧 **needs aggregation** — the raw ingredients exist; no script currently computes this specific cut
- ❌ **unbuilt** — no underlying computation exists yet

---

## The explorer matrix: Situation × Scale

Rows = the four Glory Situation buckets, plus Own/Opponent Baseline as their own rows (not sub-items). Columns = Scale. Every cell notes the verified evidence, not a guess.

| | Play | Drive | Game | Season | Career |
|---|---|---|---|---|---|
| **Leverage** | ✅ tagged on every play — `enriched.derived`: `money_down`, `third_and_short/medium/long`, `red_zone`, `scoring_position`, `fourth_down_attempt`, `passing_down`, `early_down`/`late_down`, `middle_8` | 🚧 no drive-level leverage rollup exists; would need to summarize a drive's plays by these tags | ✅ *partially* — `individual_stats.{category}` already carries per-player `red_zone_*` and `third_down_*` splits per game (verified: rushing, passing, receiving, defense all have these). 🚧 money_down/passing_down/fourth_down splits are NOT yet aggregated to player level despite being tagged per play | 🚧 needs summing the above across a player's games — no per-player season rollup script exists yet (only team-season rollups) | 🚧 same gap, one level up, via `career_profiles.json` player_key linkage |
| **Opportunity** | ✅ tag exists per play: `explosive` (own explosive), and `play_advanced.xto.actual_turnover` for takeaways created | 🟡 `drive_summary.possession_obtained_by` — verified live values: `kickoff, punt, interception, fumble_recovery, turnover_on_downs, missed_fg, blocked_fg`. A drive starting via `interception`/`fumble_recovery` is a takeaway-opportunity drive. **This is real, team/drive-level, and not yet joined to which player benefited** | 🚧 needs "which players' stats came from opportunity-drives" — no such join exists | ❌ unbuilt | ❌ unbuilt |
| **Adversity** | ✅ `play_advanced.xto.actual_turnover` (a turnover happening), field position on the play (`base.yl_abs`) | 🟡 same `possession_obtained_by` field, inverted: `turnover_on_downs`/`missed_fg`/`blocked_fg` describe the drive the *other* team just lost, and `drive_summary.start.spot_absolute` gives backed-up field position directly | 🚧 not joined to player level | ❌ unbuilt | ❌ unbuilt |
| **Response** | n/a (Response is inherently a sequence concept, not a single-play one) | 🟡 **real and verified, team-level only**: `sq_off["drives_after_own_turnover"]`, `drives_after_opponent_score`, `drives_after_defensive_stop` in `compute_game_advanced.py` (with matching `points_after_*`/`scores_after_*`). Confirmed live code, not aspirational | 🟡 same fields, rolled to game level, team-only | ❌ unbuilt at team or player level | ❌ unbuilt |
| **Own Baseline** | n/a | n/a | ✅ trivially — this game's number next to this player's other games | 🚧 needs a per-player rolling season rate — no per-player season rollup script exists yet | 🚧 same gap via `career_profiles.json` |
| **Opponent Baseline** | 🟡 `formula1_ridge_panel.py`'s `compute_strength_faced()` computes a per-team, per-date `as_of_rating` internally, then **discards it**, averaging into one season-long `strength_faced_as_of_match` number. The per-game value exists transiently and could be exposed | 🚧 not computed at drive level | 🚧 needs the per-game exposure above, joined to a player's game log by date | 🚧 team-level version exists in `team_season_rollup.py`; no player-level equivalent | ❌ unbuilt |

---

## What this means, read plainly

**The single biggest lever**: player-level attribution of *anything* beyond raw counting stats runs through one missing piece — **a player-drive index** (which plays/drives did player X actually participate in). We have play-level player attribution (built this session, for EPA/WPA — see rushing/passing/receiving `epa_sum` etc.) and we have drive-level context (`possession_obtained_by`, drive start/end, `drives_after_*`). We do not yet have the join between them. Once that join exists, Opportunity, Adversity, and Response all become reachable at the player level using data that's *already computed* — none of the three needs a new model, just the join.

**Leverage is the most mature row** — it's the only situation category with real per-player pre-aggregation today (red-zone/third-down splits sit directly on `individual_stats`). It's still incomplete (money-down, passing-down, fourth-down aren't broken out per player yet), but it's a shallower lift than the other three rows.

**Own Baseline is blocked on something more basic than any of the situation rows**: there is currently no per-player season rollup at all. Team-season rollups exist (`25-Season/team_season_rollup.py`); nothing sums a player's own per-game numbers into a season rate. This blocks Own Baseline at every scale past Game, and it also blocks the "season/career" scale selector generally for anything beyond raw counting totals.

**Opponent Baseline is the most expensive row**, because closing it means reviving Formula 1's opponent-strength machinery (currently orphaned, per Glory being postponed) rather than just adding a join.

---

## Stat domain applicability (the Metric × Situation Matrix principle)

Not every situation category is equally meaningful for every position — the explorer's filter options should be scoped per position, not shown uniformly:

| Domain | Leverage | Opportunity | Adversity | Response |
|---|---|---|---|---|
| Passing/Rushing/Receiving (offense) | Full relevance | Full relevance | Full relevance | Full relevance |
| Defense (tackles/sacks/coverage) | Relevant (3rd/4th down stops, red-zone stops already exist per-player) | Less natural (defense doesn't "receive" an opportunity the same way) | Relevant (backed-up defense, opponent explosive just happened) | Relevant (bend-don't-break after a big play) |
| Kicking/Punting | Relevant (clutch attempts, late-game) | Not applicable | Not applicable | Marginally relevant |

---

## Verified vs. claimed — cross-check against GloryTaxonomy.md

A few things Glory Taxonomy's own "Existing" labels claim that were **not** independently re-verified in this pass and shouldn't be treated as confirmed until checked the same way the rest of this document was:
- `nyoe` (punt return, Net Yardage Over Expected)
- `espa` (kickoff/special-teams field-position value)
- `st_swing_yards`
- Defensive role-slice output fields (`pass_rush_share_dl`, `coverage_share_db`, etc.) — the *category structure* was seen in code, but individual field names weren't spot-checked against a live file the way individual_stats was

Recommend the same live-JSON verification pass on these before they're scoped into any frontend build, given this session's repeated finding that design-doc "Existing" labels and even prior session summaries have been wrong before (see `feedback_archive_verification.md`).
