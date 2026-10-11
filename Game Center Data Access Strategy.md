# Game Center Data Access Strategy

**Scope:** Game Center hubs and game detail pages  
**Last updated:** 2026-04-25

---

## Principle

Game Center pages should fetch only the data needed for the active view state.

Do not load all years, all weeks, all teams, or all games into the browser and filter client-side.

State changes that materially change the data surface should trigger a new scoped request.

Examples:
- year change -> new request
- week change -> new request
- selected team change -> new request
- selected division/group change -> new request for heavier pages
- non-conference toggle -> new request when backed by Supabase/API

The frontend should mostly render page-shaped payloads. Heavy joins, week assignment, standings math, scenario math, and Why Engine selection should happen in the backend/pipeline.

---

## Preferred Request Shapes

Use narrow, page-specific requests.

```text
/api/game-center/week-central?season=2025&week=12
/api/game-center/team-schedule?season=2025&team_id=swacjsu
/api/game-center/season-schedule?season=2025&group=swac-east&include_non_conference=false
/api/game-center/conference-slate?season=2025&conference=swac&scope=west
/api/game-center/standings-race?season=2025&group=swac-east
/api/game-center/game?game_id=W12example
```

Static-file equivalents may exist during the pre-Supabase phase, but the target Supabase/API model should be scoped like the examples above.

---

## Public Payload Rules

Public page payloads should be render-ready and intentionally limited.

Include:
- display fields
- stable route IDs
- team IDs needed for `teams.json` visual joins
- precomputed records, rankings, matrix cells, and summary values
- nulls for unavailable optional fields

Avoid exposing:
- all seasons in one response
- raw pipeline intermediate data
- filesystem paths
- internal parser/debug metadata
- entire source game files when a page only needs a card or row
- bulk exports through public endpoints

---

## Scraping Defense

Public sports data cannot be made impossible to scrape, but the app can reduce exposure and abuse.

Recommended defenses:

1. **Scoped responses**
   - Return only the selected week/team/group/year.
   - Avoid public `all-years`, `all-games`, or `all-teams-full` endpoints.

2. **Supabase RLS**
   - Expose only read-safe views or RPCs.
   - Do not expose raw source tables directly to the public client.

3. **RPC functions**
   - Prefer functions such as `get_week_central(season, week)` or `get_team_schedule(season, team_id)`.
   - Keep business logic and filtering server-side.

4. **Rate limiting**
   - Rate-limit by IP, user/session, and endpoint.
   - Apply tighter limits to endpoints that can traverse data broadly.

5. **Pagination/cursors**
   - For any large list, require pagination.
   - Avoid unbounded result sets.

6. **Edge caching with origin protection**
   - Cache normal public traffic.
   - Still rate-limit origin requests and cache misses.

7. **Bot/WAF controls**
   - Use Cloudflare or equivalent bot scoring for abuse patterns.
   - Challenge unusual traversal patterns.

8. **Auth tiers later**
   - Public clients get page-shaped payloads.
   - Admin/internal tools can access bulk exports behind auth.

9. **Audit logging**
   - Log endpoint, params, IP/session, response size, and request frequency.
   - Watch for broad scraping patterns such as iterating every year/week/team quickly.

---

## Page-Specific Fetch Expectations

### Game Center Hub

```text
/api/game-center/hub?season=2025
```

Returns one weekly snapshot for the hub. It should include featured games, rail results, standings cards, and selected dynamic cards.

### Week Central

```text
/api/game-center/week-central?season=2025&week=12
```

Returns only one week. Week change triggers a new request.

### Season Schedule

```text
/api/game-center/season-schedule?season=2025&group=swac-east&include_non_conference=false
```

Returns one division/group board for one season. Group or non-conference toggle can trigger a new request.

### Conference Slate

```text
/api/game-center/conference-slate?season=2025&conference=swac&scope=west
```

Returns one conference/scope matrix. Scope changes can trigger a new request.

### Team Schedules

```text
/api/game-center/team-schedule?season=2025&team_id=swacjsu
```

Returns one team schedule. Team or year change triggers a new request.

### Standings

```text
/api/game-center/standings-race?season=2025&group=swac-east
```

Returns one standings/race group when scoped. If the page needs the full overview, a separate small summary endpoint can return just the three group headers/cards, not every scenario tree for every year.

### Game Detail

```text
/api/game-center/game?game_id=W12example
```

Returns one game detail payload. Do not expose all parsed games to render one game page.

---

## Frontend Rule

React should handle:
- active view state
- controls
- loading/error states
- visual joins to `teams.json`
- rendering page-shaped payloads

React should not handle:
- loading all years and filtering
- assigning football weeks
- standings scenario trees
- tiebreaker math
- Why Engine winner selection
- joining many raw game files for a single page view

---

*Last updated: 2026-04-25 | Codex*
