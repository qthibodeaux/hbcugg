# People Hub — Card Inventory

The People Hub is not a stats page and not a directory. It is the front page
of *who* — a curated set of storylines about players and coaches that is
different every week because the season is different every week.

This document is the **vocabulary**: every kind of card the page can show.
It is not a layout spec and not a schedule. The backend owns selection —
each archetype below generates candidates, every candidate gets scored, and
the top N surface. Nothing here is pinned to a slot.

---

## How this is meant to work

```
archetype  →  candidate generation  →  scoring  →  rank  →  top N surface
```

1. **Every archetype below is a generator.** "Outstanding Performance" doesn't
   produce one card, it produces a candidate for every player who had a big
   week. Most weeks that's dozens of candidates from one archetype.
2. **Every candidate gets a score** from the signals in §Scoring below.
3. **The page requests N cards**, the engine returns the N highest-scoring
   after coverage rules are applied. The frontend renders whatever comes back.

The frontend does not know which archetype it's rendering. It knows the
**layout** (§Layouts) and fills it. That's the contract that lets this
inventory grow to 100 archetypes without a single new component.

---

## Layouts — the whole inventory reduces to six

Sixty-plus archetypes, six components. Every card names its layout; the
frontend implements these and nothing else.

| Layout | Shape | Used by |
|---|---|---|
| `SOLO` | one player, portrait-led, 1 headline stat + 2 support stats | most individual archetypes |
| `DUO` | two players side by side, one shared stat between them | connections, tandems, matchups |
| `GROUP` | 3–6 players as a compact list, one stat column | position rooms, cohorts, pipelines |
| `COHORT` | one big number + 3 exemplar names underneath | class/transfer/geography stories |
| `UNIT` | team-branded, no portrait, 2–4 unit metrics | OL/DL/secondary, team collectives |
| `COACH` | coach identity + one metric + tenure context | all coach archetypes |

Every card, every layout, returns the same envelope:

```
card_id          string
archetype        string    the generator that produced it, e.g. "dual_threat"
layout           string    SOLO | DUO | GROUP | COHORT | UNIT | COACH
headline         string    the editorial line — written by the backend, see §Voice
subject[]        array     1-6 people or one team unit, see below
stat_primary     object    {label, value, context}  the number the card is about
stat_support[]   array     ≤3 more {label, value}
score            number    the ranking score, so the frontend can order without re-ranking
week             integer   the week this fired on
cta              object    {label, href}
```

`subject[]` carries `person_id`, name, position, team_id, image_url — the
frontend joins nothing.

---

## Scoring signals

Cross-cutting. These apply to every archetype; each archetype below adds its
own eligibility test on top.

| Signal | Why it matters |
|---|---|
| **Magnitude** | how far above the player's own baseline / the position baseline |
| **Recency** | this week outranks three weeks ago, steeply |
| **Rarity** | an archetype that fires for 40 players is worth less per-card than one that fires for 3 |
| **Opponent quality** | 300 yards against the conference's best defense ≠ 300 against its worst |
| **Stakes** | rivalry, homecoming, classic, championship, Celebration Bowl path |
| **Novelty** | has this person surfaced in the last 2 weeks? decay hard if so |
| **Coverage balance** | no single program should own the page; cap per-team cards |
| **Layout balance** | don't return six `SOLO`s; the page wants a mix |

The last three are the ones that make this feel curated instead of
algorithmic. Without novelty decay and coverage balance, the same three
players from the same two programs will win every week all season.

---

## 1 · Individual — single-game performance

The bread and butter. `SOLO` unless noted.

| Card | Headline voice | Fires when |
|---|---|---|
| **Outstanding Performance** | "Cameron Peters went for 412 and 4 against UAPB" | highest single-game PAR in the week |
| **Career Day** | "A career-best afternoon" | personal best in a component, season or career |
| **Statement Game** | "He picked the biggest stage" | big game where opponent quality is top-quartile |
| **Dual Threat** | "Beat you two ways" | meaningful production in 2+ components same game |
| **Do-It-All** | "Three phases, one player" | production in 3+ components |
| **The Closer** | "Owned the fourth quarter" | production concentrated late |
| **Big Play Merchant** | "Explosive on demand" | high yards-per-touch, low volume |
| **Volume Workhorse** | "Carried the load" | top-N usage in the week |
| **Efficiency King** | "Didn't waste a snap" | top rate stats at low volume |
| **The Anchor** | "Wrecked the middle of the field" | top `hit_production`/`scrum_production` week |
| **Lockdown** | "Nothing came his way twice" | top `hawk_production` week |
| **Road Warrior** | "Better away from home" | best game came on the road |
| **Debut** | "First start, first statement" | first career start or first appearance with production |
| **Milestone** | "Crossed 2,000 on the season" | round-number threshold crossed |
| **Record Watch** | "Closing on the school record" | within reach of a program/conference mark |

---

## 2 · Individual — trend and season arc

| Card | Headline voice | Fires when |
|---|---|---|
| **The Breakout** | "The league knows his name now" | first big game after a quiet stretch |
| **Hot Streak** | "Three straight, and climbing" | N consecutive games above a threshold |
| **The Surge** | "Nobody moved further this week" | biggest week-over-week jump |
| **Answered the Bell** | "Came back swinging" | strong game following a quiet one — framed forward, never as a recovery from failure |
| **Model of Consistency** | "You know exactly what you're getting" | lowest variance, always above replacement |
| **Rising All Season** | "Better every month" | positive slope across the full season |
| **Most Improved** | "A different player than last year" | biggest year-over-year gain |
| **Position Leader** | "The conference's top back" | #1 in position group by PAR |
| **Unsung** | "The best player you haven't heard of" | high PAR, low volume/visibility |
| **Iron Man** | "He never comes off the field" | highest usage share on his team, season |

---

## 3 · Duos and pairs — `DUO`

The most editorially distinctive layer, and the one nobody else in this
space does well.

| Card | Headline voice | Fires when |
|---|---|---|
| **The Connection** | "This QB-WR duo is killing it" | QB→WR pair with top combined production |
| **Backfield Committee** | "Two backs, one problem" | RB1/RB2 both producing |
| **Pass Rush Tandem** | "They hunt in pairs" | two DL/EDGE both top-N in `hit_production` |
| **Safety Net** | "The last line holds" | two DBs both top-N in `hawk_production` |
| **Bookends** | "Both edges, sealed" | two OTs, top unit pass-pro marks |
| **Two-Man Wrecking Crew** | "Teammates, both top ten" | any two teammates in the same stat's top N |
| **Same Zip Code** | "They've been doing this since high school" | two teammates, same hometown or same high school |
| **Brothers** | "Family business" | rostered siblings both producing |
| **Portal Package** | "They transferred in together" | two transfers from the same previous school |
| **This Week's Duel** | "Two of the league's best, same field" | two same-position standouts meet next week |
| **The Reunion** | "He faces his old team Saturday" | transfer plays his previous school — a real, recurring HBCU storyline |

---

## 4 · Position rooms and units — `UNIT` / `GROUP`

Groups nobody puts on a card, which is exactly why they're worth putting on
a card.

| Card | Headline voice | Fires when |
|---|---|---|
| **They Pave the Way** | "This OL is opening canyons" | top OL unit marks (`scrum_production`, sack rate allowed) |
| **The Front** | "Five guys, nowhere to go" | top DL combined `hit_production` |
| **Deep Room** | "Four receivers, all producing" | 4+ players from one room above replacement |
| **The Secondary** | "They don't throw here" | DB room combined `hawk_production` |
| **Linebacker Corps** | "The middle belongs to them" | LB room combined production |
| **Special Teams** | "The third phase decided it" | return/kicking unit impact |
| **The Trenches** | "Line of scrimmage battle of the week" | OL vs DL matchup preview, next week |
| **Balanced Attack** | "No single player carries this offense" | production spread evenly across a team's skill players |
| **One-Man Show** | "The whole offense runs through him" | production heavily concentrated in one player |

---

## 5 · Cohorts — `COHORT`

One big number, three faces underneath. The user's "these freshmen have come
to play" shape.

| Card | Headline voice | Fires when |
|---|---|---|
| **Freshman Class** | "These freshmen came to play" | freshmen producing above expectation, league-wide or per team |
| **Transfer Impact** | "These transfers are making their mark" | transfers as a share of top production |
| **Senior Sendoff** | "Their last go-round" | seniors in final home games / final season |
| **The Portal Class** | "This year's portal haul is delivering" | one team's transfer class collectively |
| **Redshirt Payoff** | "The year off worked" | redshirt players in first full seasons |
| **JUCO Pipeline** | "The JUCO route to Saturday" | JUCO-tier transfers producing |
| **Underclassmen Watch** | "The league's future is already here" | Fr./So. in top production tiers |
| **Class of 20XX** | "That recruiting class is grown now" | a single recruiting class now producing at scale |

---

## 6 · Geography and pipeline — `COHORT` / `GROUP`

The "X state is showing out" family. HBCU football's recruiting map is a real
story and nobody tells it.

| Card | Headline voice | Fires when |
|---|---|---|
| **State Pipeline** | "Texas is showing up and showing out" | one state's players over-indexing in production |
| **Metro Connection** | "Houston built this backfield" | one metro area's players clustering |
| **Hometown Heroes** | "They stayed home and starred" | in-state players producing for in-state schools |
| **Far From Home** | "2,100 miles from home, and worth it" | high-production players at max recruiting distance |
| **High School Pipeline** | "One school, three Saturdays" | multiple producers from one high school |
| **The Corridor** | "The Mid-Atlantic is loaded" | MEAC-footprint states over-indexing |
| **Deep South** | "Louisiana, Mississippi, Alabama" | SWAC-footprint states over-indexing |

---

## 7 · HBCU-specific — the ones only this site can run

These are the reason this page isn't a generic sports app. Cultural and
structural to HBCU football specifically.

| Card | Headline voice | Fires when |
|---|---|---|
| **Came Home** | "He left the Power 4 for this" | P4/FBS transfer producing at an HBCU |
| **Classic Performance** | "He showed out at the Bayou Classic" | big game in a named Classic |
| **Homecoming Hero** | "Homecoming belonged to him" | big game in a homecoming game |
| **Celebration Bowl Path** | "The road to Atlanta runs through him" | player on a team in championship contention |
| **MEAC vs SWAC** | "He won the crossover" | performance in a MEAC/SWAC Challenge game |
| **Rivalry Week** | "He owns this rivalry" | production in a designated rivalry game |
| **HBCU Lifer** | "Four years, one program" | multi-year producer, no transfers |
| **The Crossover** | "HBCU to HBCU, and better for it" | transfer between two covered programs producing |
| **Championship Stage** | "The biggest game of his life" | conference championship performance |

---

## 8 · Coaches — `COACH`

Deliberately thin. There is no coach profile page yet, so these carry one
real metric and stop — no embellishment past what's true.

| Card | Headline voice | Fires when |
|---|---|---|
| **Coaching Milestone** | "Win number 100" | round-number career/program win |
| **The Turnaround** | "Two years, a different program" | team improvement vs prior season under this coach |
| **Coordinator Impact** | "The defense he inherited is unrecognizable" | unit metric improvement, coordinator-attributed |
| **First-Year Coach** | "Year one, and it's working" | first-season head coach with positive movement |
| **Longest Tenure** | "Fifteen years, one sideline" | tenure milestone |
| **Coaching His Alma Mater** | "He played here. Now he leads here." | coach is an alum of the program |
| **Staff Development** | "His players keep getting better" | multiple players on one staff's roster trending up |

---

## Voice

Headlines are written by the backend and rendered verbatim. Rules:

- **Write a sentence, not a label.** "This QB-WR duo is killing it" is a
  card. "QB-WR Duo" is a database column.
- **Name people.** Specificity is the whole product.
- **Never negative.** No "worst," no "struggling," no "disappointing," no
  card whose premise is a player's failure. Every card in this inventory is
  either a celebration or a forward-looking setup. A player's own page and
  this hub are places people share; they don't get to be places people get
  dunked on. (Same rule as the player page's Signature Games — see
  `AgentDesignBible.md` §6b.)
- **`headline` is never equal to `archetype`.** Same rule as `tag` vs
  `headline` everywhere else in `BACKEND_RESPONSE_SPEC.md`.

---

## Open questions for the backend

1. **How many cards does the page ask for, and does it ask by layout?**
   Preference: the page requests a mix (`1 SOLO hero, 4 mixed, 1 COACH`) and
   the engine fills each bucket. Alternative is the page takes the top N
   however they land and adapts.
2. **Is scoring stable within a week?** A card that changes on refresh is a
   different product than one that's fixed until next week's results land.
   Preference: stable per week, regenerated on result ingest.
3. **Where does archetype weighting live?** If the relative worth of
   "Outstanding Performance" vs "State Pipeline" is tunable without a deploy,
   this page gets editorially steerable — which is worth a lot.
4. **Which archetypes are reachable now vs. need new collection?** Most of
   §1–§6 run on `season_components`, `games[]`, and roster fields that already
   exist. Snap share, targets, pressures, and situational (4th-quarter,
   red-zone) splits do not exist today and gate roughly a dozen of these.
   Not a blocker for the inventory — a sequencing question for which cards
   ship first.
