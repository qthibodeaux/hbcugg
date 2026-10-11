prompt
Lets go over a page and talk all of hte reqs and responses. We click on a player, i goes to their pag
http://localhost:3000/player/Eric%20Handley__swacaamu25
what are the reqs and res 
Here are the examples not all but a few that come from my mental model
first name last name
team positioin division number
class
height weight hoemtown prev school
games
comparatives
background

What is the specific req and res that you think we should have for this page? i will combine both respones to see if we are aligned and proceed to have the accurate req and res

### Frontend answer
"Read the page top to bottom — PlayerDetailPage.js, the banner, the control strip, all three tabs, and the two hooks they call. Here's what I think the contract should be, laid against your seven blocks.

Where the page actually stands today
Two league-wide fetches, no player endpoint:


/data/3-players/player_seasons_2025.json        useAllPlayers()          1,946 rows
/data/0-data/player_stats_2025_enriched.json    usePlayerStatsEnriched()   903 rows
The page downloads both, .find()s one player out of each, merges them field-by-field with rosterEntry?.x ?? player?.x, and computes every comparative in the browser. Season is hardcoded to 2025 in both hooks — there is no season on this route.

So the first req is structural: one player, one call.

A · The request

GET /api/players/profile/{season}/{person_id}
person_id per the spec's own rule — it's the identity key. The route today is /player/Eric%20Handley__swacaamu25, name-and-team. That's frontend work to change, not backend, but the endpoint should key on person_id and the link builders follow.

One question for you before this is final: does the profile carry its own peer context, or does the page keep fetching the roster? My answer is below in §C — it changes the response shape materially.

B · The response, block by block
1 · Identity — banner
Renders	Field
ERIC / HANDLEY, two lines	first_name last_name
AAMU chip	team_id → frontend teams.json
QUARTERBACK chip	position
SWAC EAST chip	conference division
#8 chip	jersey_number
headshot	image_url
GLORY RATING 50 / 100	does not exist
Two notes on this block.

first_name / last_name should ship split. The page derives them by splitting name_display and popping generational suffixes with a regex — that exists because "JD Davis II" rendered as a player named "II". Spec §4 already has both fields; the page just isn't using them.

Glory Rating is invented on the frontend. Math.min(99, Math.round(50 + par * 0.8)). Handley has par: 0, so the gauge reads 50 — a floor, presented as a rating. Either the backend owns this number:


glory.rating          integer 0-100
glory.percentile      integer | null
glory.basis           string       what fed it
…or the gauge comes off the banner. It should not stay as it is.

2 · Vitals — control strip, left column
Eight rows, in this order, all present in spec §4:


position          string      display label, fine-grained
position_group    string      the ten-value enum — filtering/grouping
jersey_number     integer | null
class_year        integer 1-5
class_year_label  string      ← REQ: "Freshman", not 1
height            integer | null   inches
weight            integer | null   pounds
home_city         string | null
home_state        string | null
previous_school   string | null
high_school       string | null
class_year_label is a new ask. class_year arrives as a bare 1–5, and there are now four local {1:"Freshman", …} lookup tables in the frontend papering over it — PlayerDetailPage.js, PlayerProfileControlStripV2.js, PlayersTab.js, RosterLineList.js. Spec §4 has class_year_raw but it's "So."-style and nullable. Send the full word.

3 · Games — control strip, columns 2–4
This is entirely mock. MOCK_SEASON_GAMES in GameSpotlightColumn.js — twelve hand-written games. The screenshot's "WEEK 1 VS ALCORN · W 24-17 · 6 TKL · 0.5 TFL · 1 PD · Open-field TFL on 3rd & 2" is fabricated data on a real player's page.

Spec §8 already gets partway there:


$.players.{player_key}.games[].game_id      ✓
$.players.{player_key}.games[].total        ✓ → the PAR-by-game bars
$.players.{player_key}.games[].components   ✓
What's missing is everything the readout needs:


games[].week            integer
games[].opponent_id     string | null
games[].opponent_name   string
games[].home_away       string     home | away | neutral
games[].result          string     W | L | T
games[].score           string     "24-17"
games[].stat_line       object     the box-score counting stats for this
                                   player in this game — keys by position
                                   group, e.g. defense: tackles, solo, ast,
                                   sacks, tfl, qb_hurries, passes_defended,
                                   forced_fumbles
Under your two-tier rule, stat_line exists for every game and components/PAR only for covered matchups. Say if that's wrong.

The mock's highlightPlay { description, epa, wpa } — the "TOP PLAY -1.4 EPA" line — I'd punt. It needs the play-by-play taxonomy that isn't settled.

Production Field Map is also mock, and worse: PlayerProductionMaps.js builds a 3×3 field grid by multiplying season_components.passing_production by hardcoded ratios — pass * 0.15, pass * 0.25. It renders as if it were charted target data. It needs real depth×direction buckets or it should come off the page. Handley's grid reads 0/1 in all nine cells.

4 · Comparatives
Computed client-side today against all 1,946 roster rows. Renders: height and weight percentile vs same-position_group players league-wide, the delta vs that average, "1 of N" chips scoped to the player's own team, and a position×class grid.

If the backend ships it:


comparatives.height.value                integer
comparatives.height.percentile           integer | null    vs position_group, league
comparatives.height.group_avg            number
comparatives.weight.{same three}
comparatives.roster_size                 integer           this team, this season
comparatives.position_group_count        integer           "1 of 5 Quarterbacks"
comparatives.class_count                 integer           "1 of 46 Freshmen"
comparatives.transfer_count              integer           "1 of 63 Transfers"
comparatives.in_state_count              integer           "1 of 55 In-State"
comparatives.home_state_count            integer           teammates from this state
comparatives.position_by_class.{1..5}    integer           the FR/SO/JR/SR/GR grid
Every one of these is a count the backend can do in one pass and the frontend currently does by downloading the league.

5 · Background

is_transfer       boolean
transfer_tier     string | null    P4 G5 FCS D2 JUCO HS
previous_school   string | null
is_redshirt       boolean
high_school       string | null
All in spec §4. The card renders "TRANSFER PLAYER / From Wofford" and "REDSHIRT SEASON" off these. Nothing needed.

6 · Home state

home_city         string | null
home_state        string | null
is_in_state       boolean | null
distance_miles    number | null    ← REQ: populated
distance_tier     string | null    ← REQ: populated
distance_miles and distance_tier are in spec §4 as fields and are 0 of 1,946 populated. The mobile design calls for "X miles from campus"; it renders "N of M from Alabama" instead because the miles aren't there.

7 · Advanced Analytics tab
Every view is advancedTabMock.js — radar percentiles, situational splits, called-upon share, opponent-adjusted, trajectory. The file's own header says so. Spec §6 lists the situational split keys as available on request at the team level; none of it exists per player.

I'd hold this whole tab until Stats is settled rather than write reqs against a design that isn't final.

C · The decision that shapes the response
Does the profile response carry comparatives, or does the page keep pulling the league roster?

I recommend the backend owns it. Three reasons:

The page currently downloads ~2,850 rows to render one player.
The client-side math silently degrades — percentiles group on position_group, and Delaware State is 97 of 98 Unknown, so those players compare against a bucket of nobody.
Percentile definitions belong in one place. "Percentile vs position group" means something slightly different in every file that computes it.
The cost is that the profile response is no longer a slice of the roster export — it's a computed document. Your call.

D · Summary of what's new
Beyond spec §4 and §8, this page asks for:

#	Field	Why
1	class_year_label	four duplicate lookup tables exist because it's missing
2	games[] week / opponent / result / score	the Game Spotlight is mock without it
3	games[].stat_line	the six-stat readout is mock without it
4	comparatives.* block	replaces two league-wide fetches
5	distance_miles / distance_tier populated	field exists, empty on every row
6	glory.* — or drop the gauge	currently a frontend formula on a 50-point floor
And one thing to kill rather than build: the Production Field Map. It's synthesized from ratios and reads as charted data. Unless you want real depth×direction target buckets in launch.0, I'd cut it from the strip.

Give me your version and I'll merge them into §11 of BACKEND_RESPONSE_SPEC.md."

### backend answer
Here's my answer: player_page_response_example.json — the real response for this player, real values, nothing invented.


GET /api/players/PERS_00000445/2025
Key the route on person_id. Eric Handley__swacaamu25 is a name key, and AAMU's 2025 roster has two Handleys — Eric (QB, #8) and Keon Jr. (DB, #14). That's why the page is showing 6 TKL / 0.5 TFL / 1 PD and a defensive top play on a quarterback. Those are Keon's numbers.

Your field list maps almost entirely to one file. Seven blocks: identity, glory, season_totals, games, spotlight, field_map, comparatives, background.

Three things I found that change the shape from what you'd expect:

The Production Field Map is not a build. pass_heat_map already exists on every parsed game — short_left, medium_middle, deep_right, each with attempts/completions/yards. It's the exact 3×3 the page draws. Summed across his seven games: 108/181, 1,077 yards. The page shows 0/1 0y in all nine cells, so it's rendering placeholder. This is an aggregation, not new work.

The PAR chart can't be 12 equal bars. He has 7 game rows against a 12-game schedule, and the missing 5 are missing for two different reasons:


played           7    weeks 5,6,7,9,11,12,13
no_appearance    2    weeks 2,10 — covered games, no production row
no_play_by_play  3    weeks 1,3,4 — Arkansas, Tennessee State, Lane
Weeks 1, 3 and 4 are structurally impossible — non-covered opponents, no play-by-play, by the two-tier rule. Weeks 2 and 10 are covered games where he has no row. Those must render differently or the chart lies. I put an explicit data_state on every game rather than making you infer it from a null. That's the null-vs-zero-vs-absent decision you'd otherwise hit per field.

Glory is quarterbacks only — 57 QBs in 2025, no other position. His real score is 54.23, band WEAK, 3 stars, conference mean 53.1. The page shows 50, which is the dangerous default: indistinguishable from a real average rating. Non-QBs must return null and hide the dial.

Two corrections to what I told you earlier. The person_id break is narrower than I said — the parsed games use PERS_00000445, the same id as the roster. Only player_stats_enriched (built 2026-04-19) and qb_glory are stale generations. So two of four sources agree; two need a rerun, not a crosswalk.

And the spotlight in my example is a real game — week 5 vs B-CU, 27/40, 355 yards, 3 TD, 1 INT — but note the page currently says "Week 1 vs Alcorn, W 24-17." Alcorn was week 2 and the score was 41-31. That card is mock data end to end.

top_play is the one genuine gap — it needs play-level EPA attributed to a person, which exists on the plays but isn't aggregated. Everything else in that response came off disk.
