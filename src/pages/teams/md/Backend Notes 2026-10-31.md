# Roster page data wiring audit

Scope: team roster hub (`/teams/:teamId/roster` and `/roster/hub`), full roster (`/roster/full`), and league roster modes (`/rosters`, `/rosters/full`, `/rosters/breakdown`). This is a roster audit, not an audit of every application page.

## Confirmed payload gap

All 127 published team-roster documents across selectable seasons 2019 and 2021–2026 omit both `geographic` and `transfers`. The season roster-hub files already contain those sections. Team roster sizes agree between these two exports for all 127 documents.

Example: `schools/team-roster/2026/swactsu.json` contains 107 players, including 50 transfers, but no geographic or transfer aggregates. `schools/roster-hub/roster_hub_2026.json`, at `teams.swactsu`, contains 16 states, six transfer source tiers, and ten position groups (including Unknown). The screenshot's missing charts were caused by selecting the incomplete per-team document instead of supplementing its missing fields.

## Frontend wiring

| View | Data required | Source |
|---|---|---|
| Team hub composition, class, experience, frame profile, player outlook | Team document's composition, experience_by_room, frame_profile, players | `schools/team-roster/{season}/{team_id}.json` |
| Team hub recruiting map and geography KPIs | state_distribution, hotspots, in_state_pct, avg_recruiting_distance_miles | Per-team geographic fields when provided; otherwise matching season hub `teams[team_id].geographic` |
| Team hub portal profile | transfer_count, transfer_rate, tier_breakdown, position_impact | Per-team transfer fields when provided; otherwise matching season hub `teams[team_id].transfers` |
| Full roster and hub fallback player cards | Exact selected season's player rows | `players/roster/player_seasons_{season}.json` |
| League/division/team roster comparisons | Season aggregates and exact-season player measurements | Season roster hub plus player season file |

Supplementation requires matching document team ID, document season, and season-hub year. Explicit empty arrays and zeros remain authoritative. Missing numeric KPIs stay null instead of becoming zero. Roster pages opt out of the player hook's latest-season fallback. The hub's full-roster link carries `?year=`.

## Backend requested change

Publish `geographic` and `transfers` inside every per-team roster document, generated from the same roster snapshot as `players`, `composition`, and `frame_profile`. Reuse the existing season-hub aggregates, including rates and denominators; do not independently compute a second inconsistent set. Include explicit coverage/status metadata to distinguish unavailable information from a valid empty distribution.

Validate team_id/season, roster_size versus player count, transfer_count versus classified player flags, tier counts versus transfer_count (including Unknown), and position group totals. Preserve null for unavailable metrics. Add a snapshot/version identifier shared by team and season exports so temporary frontend supplementation can verify freshness beyond season and roster size.

The 2019 export contains 19 programs while the current identity catalog contains 18. Confirm historical membership semantics; the frontend must not invent current identities for extra historical keys.

No backend scripts were run and no backend files were edited. After the backend ships complete team documents, the frontend will prefer those fields automatically.
