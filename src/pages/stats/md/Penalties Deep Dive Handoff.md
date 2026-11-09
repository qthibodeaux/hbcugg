# SWAC Penalties Deep Dive: handoff (2026-10-27)

You're picking up a build that may be half done. Read `AGENTS.md` first. Then read these rules from the user's memory:
- Edit only inside `hbcugg1`. `parser4` is read-only.
- No `useEffect`.
- No npm build or lint, and no screenshot self-checks. The user compiles and looks.
- No explainer copy on the graphics (no footnotes, legends or "how to read it" boxes).
- Outside graphics are references for the data only. Draw everything in HBCUGG style.
- Never recompute a number the backend publishes.
- No Claude attribution in commits.

## What the user asked for

A deep dive on SWAC penalties: 8 Twitter graphics, export-only. It lives in **Team Analytics → Charts → Deep Dive** as a third dive chip, **"SWAC penalties"**, next to "SWAC D-line" and "PVAMU profile".

Some slides are a chart only. Some are a chart plus a few infographic tiles. Some details go in the tweet text instead of on the image.

The user shared a reference graphic, "Who gets the benefit of the flags? (SEC)": a diverging bar per team with net yards, plus opp/team yards per game. Use it for the data only, not the look.

## Posters (current)

Each poster has **one main chart**, with the other topics as infographic tiles under it. The rest goes in the tweet text.

| # | Poster | Main chart | Tiles below |
|---|---|---|---|
| 1 | Who gets the benefit of the flags? | `net_penalty_battle.rows`: diverging net yards per game, with drawn / committed yards | Southern most; MVSU least and 123.5 committed a game; yards balance 3,712 = 3,712 (`meta.accepted_yards`); `flags_and_winning` (fewer flags 13–12; less EPA lost 15–11) |
| 2 | What flags cost | `team_cost.rows`: `epa_lost_per_game` by team, with crucial (count and share) and decisive flags | `cost_by_foul` (PI 81.3 EPA, 41 auto first downs; holding 91 flags, 12 first downs erased; roughing the passer 1.80 a flag); UAPB 44% crucial share; biggest single flag from `game_swinging_flags.largest_win_probability_swings[0]` |
| 3 | After the flag | `bounce_back.by_team`: recovered of flags per team | `third_down_flags` (defense 30 of 36 continued; MVSU offense 1 of 8; Alcorn 3 of 4, all scored); `bounce_back.by_foul` (false start 61%, holding 52%); `bounce_back.total` |
| 4 | Habits | `habits_and_direction.game_log`: flags by game per team (small bars), `team_summary` (pre-snap first half → second half, `most_common_foul` in N of N games, `direction`) | TSU pre-snap 16 → 5; MVSU 10, 15, 14, 15; AAMU 3 → 6; `swac_by_week` (weeks with 6+ team games) |
| 5 | Officials | `officiating_crews.crews`: crew profile matrix (flags/game, home-vs-away gap, defense share, pre-snap share), referee-last-name crew labels | Pinkard game spread 7–31; Green crew foul profile ratios vs SWAC (`fouls_vs_swac_rate`) |

**Naming rule for slide 5:** referee last-name labels on poster (e.g., "Pinkard crew"), with one-game crews marked `n=1`.

## Files

- **Data:** `src/data/penaltiesSwac2026W8.json`, copied from `parser4/999-frontendfeedback/10 27/penalties_deep_dive_2026_swac.json`. The schema is in `PENALTIES_DEEP_DIVE_2026_SWAC.md` in that folder.
- **Posters:** `src/components/organisms/deepDive/PenaltyPosters.js`. It exports `PENALTY_POSTERS = [{ id, chip, Poster }]`.
- **Frame:** `src/components/organisms/deepDive/DeepDiveCharts.js`. Add `{ id: "penalties", label: "SWAC penalties", file: <meta with season and through_week>, slug: "swac-penalties", posters: PENALTY_POSTERS }` to `DIVES`.
- **Patterns to copy:**
  - `DlinePosters.js` and `TeamProfilePosters.js`: Poster/Frame, Card, NumberTile, `pal` from `paletteOf(scheme)`, and ExportWordmark on top.
  - Posters are 1400px wide and as tall as their content.
- **Team names:** `shortOf(team_id)` and logos `logoOf(team_id)` from `deepDiveModel.js`. Never print the file's own names.

## Colors (memory: `feedback_brand_colors`)

- **Purple is primary:** `pal.brand`, for the headline accent word.
- **Green is secondary:** `pal.orange` (the key name is kept). Hunter green `#3A5A40` in light, Shamrock `#5A9F68` at night.
- **Red is for bad news only:** `pal.down`.
- **Open question:** the "up" green sits close to the secondary green. The user hasn't ruled on it yet.

## Tidbits from the backend conversation: check them against the file

The user pasted tidbits from a chat with the backend. **Some don't match the delivered file,** which has 415 flags in 26 SWAC games:

| Tidbit | The file says |
|---|---|
| 528 flags, 289 live / 218 pre-snap | 415 flags, 231 live / 165 pre-snap / 19 dead |
| 2nd quarter 168 flags | 129 |
| Red zone 40 of 69 pre-snap | 33 of 58 |
| 23 decisive flags; AAMU 4 | 22 decisive (`decisive_flags`); AAMU `decisive_flags` = 3 |
| "Fewer flags won 16–16" | 13–12 |
| EPA cost table with SC State, Morgan State, NCCU, DSU | Those are MEAC teams. The file is SWAC-only. |
| TSU pre-snap 17 → 5 | 16 → 5 |

**Always print the file's numbers.** The chat tidbits are useful for the *angle* (which story to tell), not the values.

## Status

See the bottom of this file. The agent updates it as slides land.

- [x] 1 Who gets the benefit (`BenefitPoster`)
- [x] 2 What flags cost (`CostPoster`)
- [x] 3 After the flag (`AfterFlagPoster`)
- [x] 4 Habits (`HabitsPoster`)
- [x] 5 Officials (`OfficialsPoster`)
- [x] Wired into DeepDiveCharts (dive chip "SWAC penalties")
- [x] Review round 1 applied (below)
- [ ] User visual review of round 1 (not compiled or viewed by the agent)

## Review round 1 (the user, 2026-10-27): applied

The user's rule for this dive: **tidbits that need explaining go in the tweet, not on the poster.** If a tile needs a sentence before a casual fan gets it, cut it.

| Poster | Change |
|---|---|
| 1 | Title is now **"The flag battle"** (chip "1 · Flag battle"). Removed the "fewer flags 13–12" and "less EPA lost 15–11" tiles. Two tiles remain: Southern +20.6 and MVSU's 123.5 yards a game. |
| 2 | **No tiles at all.** The user explains it in the tweet. Removed the decisive column (it had no reference the user could explain). The kicker now reads "Points given away by flags, per game". Kept: the bar, flags per game, crucial flags · share. |
| 3 | Removed the 3rd-down defense tile (it read 30/35 on the poster; the backend's finding says 30 of 36, so the table and the finding disagree). Removed the "by foul" card ("Every offensive flag 56%" was unclear). Two tiles remain: MVSU 1/8 and Alcorn 3/4. |
| 4 | Respaced the table (wider columns, taller rows, bigger game bars). "Holding 4/4" now reads "Holding · Every game" or "In 4 of 5 games". Removed the AAMU 3→6 tile. TSU, MVSU and the by-week chart remain. |

**Still open:**
- **The "up" green vs the secondary green.** The user hasn't ruled.
- **Ask the backend:** the 3rd-down defense rows sum to 35 flags and 30 continued, but the finding says 30 of 36.
- ~~ASU's "pass interference every game"~~: fixed by the backend 10-27 evening (`PENALTY_FIXES_2026-10-27.md`). ASU is out and B-CU is in. `most_common_foul` now means the foul with the most accepted flags (FAMU, JSU and ASU changed to holding), and `most_common_foul_flags` is new. The local copy was re-pulled.

- [ ] Tweet copy in `src/pages/stats/md/SWAC Penalties Tweets.md`

## Review round 2 (the user, 2026-10-27): applied

- **Team names on all 4 posters** use the poster short names (`teamShortName` from `game/export/exportData.js`: "Texas So", "Valley", "Bama A&M", "Pine Bluff" and so on), not abbreviations. The team columns are now 220px.
- **Poster 4:**
  - Removed the "Every game" / "In N of M games" line. The column shows only the foul.
  - Respaced the columns.
  - The game bars are red above the SWAC average and green at or below it. The average is 8.0 flags per team per game: `officiating_crews.swac_flags_per_game` (16.0, both teams together) ÷ 2.
