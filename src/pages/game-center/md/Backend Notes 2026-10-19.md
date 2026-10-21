# Backend Notes — 2026-10-19

## 1. "Us vs the World" leaves out losses

`game-center/hub/game_center_hub_2026.json`, card `us_vs_world:meacdsu`, says Del State is **4-0** against teams outside the SWAC and MEAC, and lists only the four wins. Del State's own schedule file (`team-schedules/2026/meacdsu.json`) has seven outside games, and three were losses:

| Week | Opponent | Result | On the card? |
|---|---|---|---|
| 0 | Stony Brook | W 41-34 | yes |
| 1 | at William & Mary | L 15-22 | **no** |
| 2 | Bowie State | W 21-6 | yes |
| 3 | at South Florida | L 17-59 | **no** |
| 4 | Towson | W 33-28 | yes |
| 5 | at UAlbany | L 3-28 | **no** |
| 6 | Franklin Pierce | W 34-0 | yes |

The true record is **4-3**. The losses were all road games against FCS/FBS opponents, so the filter may be dropping away games or non-Division II opponents. Please check:
- **The game list:** `payload.games` should hold **every** final against a team outside the 18, wins and losses.
- **The record:** `wins` / `losses` counted from that full list.
- **The copy:** `why_reasons` and any "unbeaten" wording follow the true record.

Please also check the same card for the other 17 teams.

## 2. Conference opponents with no `opponent_team_id`

The same schedule file lists Del State's remaining MEAC games with `opponent_team_id: null`: NC Central, Norfolk, Morgan, Howard and SC State. Those are all among the 18 (`meacnccu`, `meacnsu`, `meacmsu`, `meachu`, `meacscsu`). Without the id, these rows can't show a logo or link to the team, and any "outside the 18" filter that keys on a null id will count them as outside games.

**What we want:** `opponent_team_id` set for every opponent among the 18, on scheduled games as well as finals, in every team-schedule file.

## 3. Standings: who controls their own destiny

The Division Finish Probability matrix will ring a team in purple when it **controls its own destiny**: if it wins every remaining conference game, it finishes first in its division (or the MEAC) **in every scenario**, whatever the other results are. For example, if UAPB wins out, UAPB wins the West.

You already play out every scenario for each group (`scenario_count`, `finish_method: "exact"`), so this is one more check on the same run.

### Request

```text
GET game-center/standings/standings_race_{season}.json
```

### Response — one new field on each `groups[group].finish_matrix[]` row

```text
{
  team_id: string
  current_rank: integer
  values: []number
  controls_destiny: boolean   // wins out → finishes first in every scenario, tiebreakers included
}
```

- **Tiebreakers:** count a scenario as a win only if the team is first after the tiebreakers, not merely tied for first. Where `co_champions_possible` is true (the MEAC), a share of first counts.
- **Teams already out:** a team that can't finish first even by winning out is `false`.
- **Clinched teams:** a team that has already clinched is `true`.
- **Finished seasons:** `false` for everyone.
