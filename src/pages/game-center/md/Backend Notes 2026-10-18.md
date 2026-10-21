# Backend Notes — 2026-10-18

**Answers:** `WEEK_RECAP_ENGINE.md` and `game-center/week-recap/2026/7.json`.
**Picked up:** Week 7's recap. It is wired as the Game Center's export ("How Saturday Was Won"): the Export button on the hub banner draws the current week's file as a 4:5 poster — the margin board, the top performers, a 3 × 4 of your items in order, then the record book beside the title race.

---

## 1. The copy: a sports voice, plain and human

The poster is read by fans scrolling a timeline. The copy has to sound like a sports desk wrote it — a beat writer, a broadcast lower-third — not social media, and not an imitation of anyone's slang.

| Today | What we want |
|---|---|
| 5 Top-1% Days | Big Time Players Had Big Time Games |
| The Defense Ate | Defense Came Up Big |
| B-CU's defense made a havoc play on 30% of MVSU's snaps, top 2% of games since 2019. | BCU's defense lived in the backfield: a havoc play on 30% of MVSU's snaps. |
| Florida Showed Out | Florida Natives Delivered |
| J-State's defense: 6 takeaways, top 2% of games since 2019. | JSU forced 6 turnovers — X interceptions and Y fumbles recovered. |

**Rules for the copy:**
- **Sports voice, not social-media voice.** No slang ("ate", "showed out", "cooked", "went crazy"). No phrasing that imitates how anyone talks. Write it straight, the way a game story or a broadcast would.
- **Plain words.** Short sentences, no jargon.
- **No "Big-Time" style hyphenation.** Write **Big Time**.
- **The hero title says the story, not the stat.** No percentiles, no "top N%", no "since 2019" in it.
- **Detail over adjectives.** Name who and where: which schools had homecomings, whose stadium drew the crowd, how the takeaways broke down.
- `stat.display` and `stat.label` stay as they are — the big numbers are right.

## 1a. What counts as a big day — challenge on Week 7

Several items are rare for their *slice* but are not big days for the *week*. A "Performance of the Day" has to be elite in plain terms, not just top-percentile inside a narrow group:

| Item | Why it doesn't hold up |
|---|---|
| Andre Powell Jr. (FAMU), 19.2 production | Seven players in the week topped 19.2 (Davis 61.2, Gucake 40.8, Tolbert 36.4, Brown 36.2, Butler 24.2, Bean 22.8, Jefferson 20.6). It is not a performance of the day. |
| Dayvian Bluitt (MVSU), 133 receiving yards | Jaylan Bean had **240** the same day. 133 is only rare against a corpus full of 10-, 15- and 25-yard games; it is not elite. |
| D'Avery Robinson (UAPB), 8.7 production as a freshman | Big for a freshman, small for a receiver and tiny for the week. Freshman Impact should still clear a real bar for the position. |

**Ask:** weigh rarity against the **week's own field and an absolute floor**, not only against the position-slice corpus. A player item should rank near the top of that week's production, or post a number that is big on its face (a 200-yard receiving day, a 5-TD game, a 20-tackle game).

## 1b. Top Performers (`performance_set`)

The set should be the **top 3 production scores of the week, at most one per team**. Week 7 shipped Bean (22.8), Davis (61.2) and Brown (36.2) — two from AAMU, and Gucake's 40.8 and Tolbert's 36.4 left out.
- **What we do now (preview):** the poster picks the top 3 by `production_total` across the week's game files, one per team (Davis, Gucake, Tolbert). We take that out when the set ships this way.

## 1c. Diversify the context

Too many items lean on "top N% of games since 2019". Mix in other angles the engine already has:
- season context (best in the league this year, a season high);
- team history and streaks (first win at X since, a streak extended or snapped);
- the matchup itself (the series, the rivalry, the stakes);
- the week as a whole (most points in a week this year, one-score games).

## 1d. The poster's layout needs, per week

| Slot | Count | From |
|---|---|---|
| Tiles (3 × 4) | 12 | items, any kind except the three below |
| Record book | 2 panels | `record_book`, each with ranked `rows` (this week flagged) |
| Title race | 1 panel | `race`, with `rows` (rank, prev_rank, conference_record, first_place_chance) |
| Top performers | 3 | `performance_set` |

So **16–20 items per week, including at least 2 `record_book`** and a `race` when there is one.

## 1e. Crowd copy

"44,173 at Mississippi Veterans Memorial Stadium (73% of capacity), the week's biggest crowd, top 6% of games since 2019" is too long to read and never says whose stadium it is. Lead with the home team: **"44,173 packed JSU's Mississippi Veterans Memorial Stadium."** Keep it to one short line; the poster lists every crowd under it.

## 2. A broken character in the copy

Week 7, the Freshman Impact headline: `"D�Avery Robinson (UAPB)…"`. The apostrophe in D'Avery came through as U+FFFD (the replacement character), so it printed as "D�Avery".

**What we did:** the frontend replaces U+FFFD between two letters with an apostrophe (’) on every string in the file, so the poster reads "D’Avery Robinson".

**What we want:** the file written as UTF-8 with the apostrophe intact (`'` or `’`). Please check the name source for the same problem on other players with an apostrophe (D'Avery, Ja'Koby, Cam'Ron…).

## 3. Team names in the copy

The headlines name teams as "B-CU" and "J-State". Those don't match the site: we removed "B-CU" everywhere on our side.

**What we did:** the frontend rewrites "B-CU" → "BCU" and "J-State" → "JSU" in every string of the recap file.

**What we want:** headlines that name teams by `teams.json` `shortName` — Alcorn, AAMU, ASU, BCU, FAMU, JSU, MVSU, PVAMU, SU, TSU, UAPB, Grambling, DSU, HU, MSU, NCCU, NSU, SCSU — or the school name in full. One name per team, everywhere in the file. Once that ships we take our rewrite out.

## 4. Still open from earlier

- Outside-opponent abbreviations (Games Hub Fetch Contract, addendum 2026-10-16): `short_name` still equals the full name ("Stony Brook", "Clark Atlanta").
- Rushing lanes: `direction_breakdown` per rusher has attempts, yards and success rate per lane. If you want the lane chart's line-vs-highlight split back, it needs `line_yards`, `highlight_yards` and `stuffed` per lane. Optional — tell us if it's easy.

## 5. Second poster review (evening)

**a. Publish the rebuild.** The poster reads `93-FE Docs/game-center/week-recap/2026/7.json`, which is still the 16:52 file (14 items, 11 tiles). The 17:31 rebuild with 20 items is only in `92-frontend/0-data/week-recap/2026/7.json`. Please run `python 92-frontend/tools/publish_fe_docs.py`.

**b. Twelve tiles, every week.** The 3 × 4 needs **at least 12 items** that are not `performance_set`, `record_book` or `race`. Week 7's rebuild has 15, which is enough. Please hold that floor every week.

**c. Class year on Top Performers.** Each `performance_set.data.players[]` entry needs the player's class:

```json
{ "person_id": "PERS_00013332", "last_name": "Bean", "position": "WR", "class_year": "FR", "team_id": "swacaamu", ... }
```

Use `FR`, `SO`, `JR`, `SR` or `GR`. The poster prints `WR · FR · AAMU`; until the field arrives it prints `WR · AAMU`.

**c2. The next 7.** The Top Performers block now has a second column: the week's **4th through 10th** production scores, ranked, with no one-per-team limit, and the top 3 left out. Please add them to `performance_set` as `data.next`, in the same shape as `data.players`:

```json
"data": {
  "players": [ /* the top 3, one per team */ ],
  "next": [
    { "person_id": "PERS_…", "last_name": "Brown IV", "position": "QB", "class_year": "SR", "team_id": "swacaamu", "production": 36.2 },
    "… 7 in all, highest first"
  ]
}
```

Each `next` entry also needs its **`components`** (the same object as `production_scores[team][].components`). The list draws each player's production as a stacked bar, one color per component. `stat_line` and `tag` are optional on these. **What we do now (preview):** the poster ranks the week's game files' `production_scores` by `production_total`. We take that out when `data.next` ships.

**c3. A fuller stat line for the top 3.** The cards now show up to 8 stats. Please add these to `stat_line` whenever they are not zero:
- **Defense:** INT, FF, FR, PD, DEF TD (interception and fumble-return touchdowns).
- **Offense:** INT thrown, FUM.

Week 7: Davis also had a fumble recovery returned 61 yards for a touchdown, and his `stat_line` didn't include it. **What we do now (preview):** we append any of these that are missing, read from the game file's box score. We take that out when `stat_line` carries them.

**d. Record-book wording.** Drop "between our 18" / "between two of the 18" from `record_book.data.fact`:

| Today | What we want |
|---|---|
| No. 3 for total touchdowns in a game between two of the 18 since 2019 | No. 3 for total touchdowns in a game since 2019 |
| Most receiving yards in a game between our 18 since 2019 | Most receiving yards in a game since 2019 |

**e. The race line says how they got there.** `race.stat.label` reads "PVAMU's chance at first". Write it as the leader's chance **and this week's result**:

| Today | What we want |
|---|---|
| PVAMU's chance at first | PVAMU's probability to win the West after defeating Alcorn 41-38 |

For a loss, "after losing to X 24-27". If the leader didn't play, end at the division: "PVAMU's probability to win the West". **What we do now (preview):** we build this line from `race.data.rows` and the recap's `games`. We take that out when `stat.label` ships in this form.

## 6. Production scores above zero for plays that failed

Week 7, `famujsu26.json`, `production_scores.swacfamu`:

| Player | What he did | Component | Score |
|---|---|---|---|
| James Hayes | 0/1 passing, 0 yards | `passing_production` | **0.12** |
| Corey Petty | 1 target, 0 catches, −0.7 EPA | `receiving_production` | **0.15** |
| Jamal Hailey | 1 target, 0 catches, −1.4 EPA | `receiving_production` | **0.09** |

An incompletion, or a target that went for nothing and cost the offense EPA, should score **0 or below**, not above. Is something giving credit just for being on the field: a participation floor, a share of team credit, or a baseline added before the play value? Please check, and tell us which rule makes these positive.

---

*Created 2026-10-18; updated the same day after the poster review, and again after the second review.*
