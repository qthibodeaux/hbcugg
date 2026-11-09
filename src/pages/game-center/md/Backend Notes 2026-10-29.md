# Backend Notes: 2026-10-29

**Re:** the Game Preview poster (`Game Preview Fetch Contract.md`, scout addendum).

### 1. Net success rate, per team

The preview poster now shows **net success rate** for each team. It's the team's offensive success rate minus the success rate its defense allows: positive means the team wins more snaps than it gives up. You already produce this measure for the week chart ("Did we really get beat that bad?", net success rates by game), so this asks for the same thing per team, season to date.

**Answered 2026-11-05:** `net_success` is in all 27 game previews with value and rank. The page reads it and the interim stand-in is deleted.

### Request

```text
GET game-center/game-preview/{season}/{game}.json    (unchanged)
```

### Response: one new key in `stats.teams[team_id].fields`

```text
net_success: {
  value: number   // o_success - d_success, both 0-1 rates (0.074 = +7.4 points); same games and rules as o_success / d_success
  rank: integer   // among the ranked teams (stats.ranked_teams); 1 = highest
}
```

- **The rank is the part the page can't make.** The interim value is already on the poster (e.g. NCCU +4.1, Norfolk −7.0), but its rank prints a dash. The page doesn't rank teams itself, so the rank has to come from you.
- **Same shape** as the other fields (`net_epa`, `o_success` and so on).
- **When either rate is missing,** send null, not 0.
