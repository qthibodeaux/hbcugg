# Backend Notes: 2026-11-03 (c)

**Re:** the leaderboards in `999-frontendfeedback/11 03/leaderboards/` (`boards_2026_season.json`, `boards_2026_week_9.json`). The boards are what we want on the Team Stats and Player Stats pages, per game with no minimum and garbage time in, as you built them. We won't use `POSTS.md`; the posts get made from the pages' exports.

### 1. Publish the boards in the weekly run

They're only in the feedback folder. The pages read FE Docs, so the boards need to rebuild and publish with each weekly update, for the current season and past seasons.

### Request

```text
GET stats/leaderboards/index.json
GET stats/leaderboards/{season}/season.json
GET stats/leaderboards/{season}/week_{n}.json
```

### Response

```text
index.json: { current: { season, week }, seasons: [ { season, weeks: []integer } ] }    // same shape as stats/leaders/index.json
season.json: the shape of boards_2026_season.json (unchanged)
week_{n}.json: the shape of boards_2026_week_9.json (unchanged)
```

- **`stats/leaders`:** please tell us whether these boards replace it. The Player Stats page reads it today. If they replace it, keep it published until the page has moved.

### 2. Player names in display form

Four rows print the raw "Last,First" form in `display_name`: `McKinney,Cole`, `Culpepper,Jusden`, `Leary,Trenton`, `Rush,Jarvis`. Please send "Cole McKinney" and so on, on every board.

### 3. Team names: nothing needed

The page maps `team_id` to our own names, so `team_id` is all it reads. No change.
