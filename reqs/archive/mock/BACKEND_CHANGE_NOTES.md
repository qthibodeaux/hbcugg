# Backend Change Notes

Answers to the open questions in `BACKEND_RESPONSE_SPEC.md`, plus one change to
the contract the frontend has not seen yet.

Mock documents, all Prairie View 2025, in `zzSample/mock/`:

```
team_hub_pvamu_2025.json                          11 KB
team_schedule_pvamu_2025.json                     13 KB
roster_hub_pvamu_2025.json                        86 KB   79 players
player_profile_pvamu_2025_cameron_peters.json     41 KB   14 games
```

---

## 1 · Glory is replaced by PAR

**This is the change to know about.** The spec's §4.2 `glory` block is gone.
A `rating` block replaces it, and `rating.metric` is `"PAR"`.

Glory was fitted for quarterbacks only — 57 of 1,946 players in 2025 — so the
banner was empty for 97% of the roster and there was no path to filling it.
Its bands were also cut against a scale this conference does not sit on:

```
2025, all 57 rated quarterbacks
  WEAK  48        MID  9        nothing above
  best in the league  Cameron Peters 65.45  ->  "MID"
  23 players above the conference mean (53.1) are labeled "WEAK"
```

PAR exists for every position that produces, is already computed per game and
per season, and is ranked inside this corpus rather than against an outside
scale. The new block:

```
rating.metric                  string    "PAR"
rating.available               boolean
rating.value                   number    season PAR
rating.per_game                number
rating.games_played            integer
rating.rank_in_position_group  integer
rating.position_group_total    integer
rating.conference_rank         integer
rating.conference_total        integer
rating.position_group_mean     number
```

**Rank within `position_group`, not the conference rank, is the number to
show.** PAR is a volume stat and it is not position-normalized: a quarterback
accumulates far more of it than a cornerback. Cameron Peters is `conference_rank
1 of 1054`, which is true and useless — it says quarterback, not good. His
`rank_in_position_group` is `1 of 43`, which is the claim worth rendering.
`conference_total` is included so the page can show the field size, not so it
can rank across positions.

`available: false` with every other key null when a player has no production —
`par` is `0.0` on the roster and per-game rows, never null, but the rating
block is hidden rather than showing a zero rating.

**Still open on our side:** the old Glory model had a `consistency` pillar that
scored exactly `0.0` for 22 of the 57 quarterbacks, each with `factor_count: 0`
— no factors measured at all, not a measured zero, while carrying 8% of the
weight. That is left as-is for this mock and is not part of the PAR block. It
needs a decision before any pillar-style rating ships again.

---

## 1b · The ghost player — found, fixed, and it was corpus-wide

The frontend caught a row in the roster mock with `person_id: null`,
`full_name: "View Full Bio"`, the head coach's headshot, and another player's
previous school. That was a real parser bug, not a mock artifact, and it was on
**every roster in the corpus**:

```
255 team-seasons, exactly one ghost each, always the last row
203 of them carried a bogus previous_school
```

Cause: `_iter_li_blocks` chunks the roster list by splitting on each `<li>`, and
the final block had no following `<li>` to stop at, so it ran to the end of the
document — 925,000 characters of page footer on Prairie View. The name regex
then found an `<h3>` down in that footer and returned its link text.

Fixed in `roster_parse_utils.py` by stopping the final block at the list's own
`</ul>`. Verified across all 292 roster files: **0 ghosts remaining**, 26,496
rows, no real player lost and no field emptied on any team.

The frontend's two downstream corrections were both right:

```
roster_size       80  ->  79   real humans
transfer_count     2  ->   1   Lamagea McDowell, Campbell University
transfer_rate    2.5% -> 1.3%
upperclass_pct  73.8% -> 73.4%
Jr.               24  ->  23
```

All four mock documents are rebuilt against the corrected parse.

**Still outstanding:** only `swacpvamu_2025.json` has been regenerated in
`12-roster-pipeline/1-parse/parsed/`. The other 254 files still carry their
ghost until a full re-parse runs, so every team except Prairie View is still
+1 player and possibly +1 transfer.

---

## 2 · Roster size is 79, not 107

`roster_count` on Team Hub and `roster_size` on Roster Hub now agree, and both
read `12-roster-pipeline/1-parse/parsed/{team}_{season}.json`.

The 107 came from a downstream export that merged ESPN supplemental rows on top
of the parse. Those rows are legacy: they carry an unparsed class year, a string
`jersey_number`, a null `experience_score`, and an `espncdn.com` headshot. They
are what made Prairie View look like a 107-man roster with 28 players of unknown
class.

The parse output is clean — 79 players, every class parsed, images on all 79:

```
Fr. 11    So. 10    Jr. 23    Sr. 15    Gr. 20    = 79, zero unknown
```

Everything roster-facing reads the roster pipeline from here on.

---

## 3 · Corrections to the spec

**`distance_miles` and `distance_tier` are populated.** §4.2 says "0 of 1,946
players carry this today." Actual, in
`12-roster-pipeline/4-entities/players/player_seasons_2025.json`:

```
distance_miles   1,771 / 1,946      home_state    1,877 / 1,946
distance_tier    1,771 / 1,946      is_in_state   1,877 / 1,946
```

They were absent from the earlier PVAMU sample because that sample was built
from the parse output alone, which has no enrichment. Both are on
`players[]` in the mock now. Nothing to build.

**`venue.city` is cleaned in these documents.** The parse welds box-score header
text onto the city, so the raw value reads
`"Atlanta, Georgia (Mercedes-Benz Stadium) Score By Quarters 1st 2nd ..."`. The
mock ships `city: "Atlanta, Georgia"`, `stadium_name: "Mercedes-Benz Stadium"`.
The real fix belongs at the parse and has not been made yet.

---

## 4 · Decisions on the "state whether" questions

### Frame tiers — a fourth tier, and QB stays in SKILL

```
LINE        OL + DL          25
BOX         LB + TE + RB     19
SKILL       WR + DB + QB     30
SPECIALIST  ST                5
                            ---
                             79 of 79
```

Membership is **fixed for every team**, not per-team. `SPECIALIST` is added so
nothing falls outside a tier — the earlier sum of 74 was the 5 `ST` players
having nowhere to go. Every one of the 79 now lands in a tier: the row that had
no position at all was the ghost, so removing it closed that gap too.

QB sits in `SKILL`. It is where a quarterback's frame actually compares — to
receivers and defensive backs rather than to linemen or linebackers.

### Rate scale — percentages are 0–100 everywhere

Every field whose name ends in `_pct` or `_rate` is `0-100`:
`transfer_rate: 1.3` means 1.3%. Every field that is a probability or a
model-fitted rate is `0-1`: `success_rate`, `win_probability`. The split is by
kind, not by endpoint, so it reads the same in §1 and §4.2.

### `image_url` — hotlinked, replaced when it breaks

Absolute URLs to the school's own CMS. When a school moves or deletes an image
the link is updated on the next roster run; the page should fall back to a
blank profile silhouette rather than a broken-image box. No caching layer.

### `data_state` — `not_yet_played` added

The enum is `played | no_appearance | no_play_by_play | not_yet_played`.

**`par` is `0` for every state that is not `played`.** The chart draws a bar for
every scheduled game, and unplayed or uncovered games are zero-height bars, not
gaps. Prairie View's 2025 season, Cameron Peters:

```
week   1     2     3     4     5     6     8     9    10    11    12    13    15    16
par  22.86  0.0   0.0   0.0   1.40 16.47 16.53  0.0  5.64 35.16 22.74 16.59 20.83 39.12
```

The four zeros at weeks 2, 3, 4 and 9 are `no_play_by_play` — non-conference
opponents outside the corpus, so no play-by-play exists to produce PAR from.
That is the two-tier coverage rule, not missing data.

### `home_state` and `transfer_tier` — per player, on `players[]`

Not a team-level `geographic` / `transfers` block duplicating §3.1. The per-team
document already carries every player, so a second aggregated copy could drift
from the rows beside it. The mock does also ship team-level `geographic` and
`transfers` summaries, but they are computed from the same `players[]` array in
the same pass, so they cannot disagree.

---

## 5 · Two things in the mock that are not production-ready

**`par` is joined by name, not `person_id`.** The roster and the parsed games
agree on `person_id` — Cameron Peters is `PERS_00011214` in both. The season
production file does not: it was generated 2026-04-19, four months before the
current entity build, so its ids are from an older generation. Regenerating it
against the current build is the fix; there is no crosswalk table to write.

**`win_probability` is provisional.** A logistic on the gap in
opponent-adjusted net rating, plus a small home adjustment. It is `null` for
every opponent outside the corpus, which is 4 of Prairie View's 14 games.

---

## 6 · Transfer coverage is a real difference between schools, now labeled

`transfers.source_coverage` is added: `published | sparse | none`.

Some schools print a transfer's previous school on their roster page and some
do not. Prairie View publishes 1 on a 79-man roster; Florida A&M publishes 107
on 118. That is not a roster-building difference, it is what the school chose to
put on the page, and Portal Profile should say so rather than render a confident
1.3%.

A parse fix already recovered the schools where the field was present but
unread — the previous school is printed only in a second card template on some
Sidearm sites:

```
              in the HTML   before   after
swacmvsu           46          0       47
swacalc            71          0       72
meacmsu            --          2       34
swacpvamu           3          1        2     genuinely sparse
meacdsu             3          0        3     genuinely sparse
```

No regressions on the fourteen schools that already worked.

---

## 7 · The field map — both frontend asks answered yes

Two concrete asks came back on the Player Profile: whether `games[].field_map`
is possible with real data, and whether an equivalent rushing spatial breakdown
exists at all. Both are yes, and both are now in the mock and written into
`BACKEND_RESPONSE_SPEC.md` §4.2.

### Per-game field map is pure aggregation

`pass_heat_map` is on all 10 of Cameron Peters' covered games. The season grid
the page renders today is the sum of them, so per-game is a matter of not
summing. It reconciles exactly:

```
season pass grid          246 att   165 cmp   2,439 yds
sum of the 10 per-game    246 att   165 cmp   2,439 yds
```

Week 16 vs South Carolina State, as an example of one game's grid:

```
short   L  9/6  31y     M  2/1  13y     R  8/4  33y
```

### Rushing spatial exists — it is a different shape, not an empty state

`rush_heat_map` is on all 10 games too. It is **1x3 by direction**, with
`attempts` and `yards` only:

```
L  10 att   53y        M  56 att  319y        R  23 att   91y        = 89 / 463
```

No depth band, because the parse does not record one for a carry. No
`completions`, because the field is meaningless on a carry. So the RUSH toggle
should render a three-cell strip, not a 3x3 with two rows dropped and not an
empty state.

### A bug worth naming, because it is the one the frontend was guarding against

While wiring this, the per-game map was assigned only inside the "parsed file
exists" branch of the builder loop, so weeks without play-by-play inherited the
previous week's values. Week 2 rendered week 1's grid while correctly reporting
`no_play_by_play`. The same leak hit `stat_line` and the per-game components.

Fixed before the mock shipped — the four uncovered weeks now send
`field_map: null`, `stat_line: []`, `par: 0.0`. But it is exactly the failure
mode behind the refusal to synthesize a grid from season ratios: a wrong map is
indistinguishable from a right one on the page. If a week ever reports
`no_play_by_play` and still carries cells, that is a backend bug — flag it
rather than rendering it.

### Spec changes that came with this

```
§4.2 games[]        + games[].field_map, null when data_state != "played"
§4.2 games[]          "exactly 12 rows" -> the team's own schedule length
                      (Prairie View 2025 is 14, including a bowl)
§4.2 field_map      rewritten: available / views[] / depth_bands, then
                      passing (3x3) and rushing (1x3) as separate blocks
§4.2 glory          replaced by rating, metric "PAR" (this doc §1)
§4.2 background     distance_miles / distance_tier marked populated (this doc §3)
business rules      the coverage-tier bullet now names PAR and the field map
                      instead of Glory
```
