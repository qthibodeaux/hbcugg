team_hub_response_example.json — real values, and the four cards are now selection rules rather than fixed fields.

season_state drives the previous/next pair. PVAMU 2025 has no unplayed games, so season_state: "complete", next_game: null, and a season_summary block takes its place — record 10-4, 7-1 conference, 1st SWAC West, avg PAR 9.6. In season, next_game populates and season_summary is null. One field the frontend switches on.

The Celebration Bowl confirmed itself in the data. The game file's venue block literally carries "neutral_site_name": "The Cricket Wireless Celebration Bowl". So is_celebration_bowl is derivable today — no curated list needed, unlike rivalry and homecoming. That game was sitting in next_game as an unplayed matchup.

Coach carousel — three slides, each with a metric and explicit polarity:


Tremaine Jackson     Head Coach    NET EPA YoY   +0.1404   improvement
Christopher Buckner  OC            OFF EPA YoY   +0.1486   improvement
Brandon Andersen     DC            DEF EPA YoY   +0.0082   NOT an improvement
The DC row is why I put higher_is_better and is_improvement on every metric rather than letting the frontend infer from sign. Defensive EPA going up is worse. That's the same trap as powerStopRate — if the frontend colors on sign, every defensive card is backwards. Real DC is Brandon Andersen, not the mock's Marcus Hill. Jackson is Y1, matching the screenshot.

Unit carousel — I built five units, but only four are shippable:


passing            COMP% 6/18   YDS/GM 2/18   PASS TD 1/18   TD:INT 5/18
rushing            YDS/GM 7/18  RUSH TD 4/18  POWER% 8/18    STUFF% 5/18
defensive_havoc    HAVOC% 6/18  SACKS 8/18    TAKEAWAYS 2/18 DISRUPT% 6/18
efficiency         EPA/PLAY 1/18  SUCCESS% 3/18  EXPLOSIVE% 2/18  3RD DOWN% 5/18
special_teams      unavailable
Special teams can't be a slide. FG %, KR AVG, PR AVG are null for all 18 teams — not just PVAMU. Only net_punt_avg populates, and PVAMU's is 0.0. So the carousel picks 2 from the four available and available_units tells the frontend which. That's a real coverage gap in the special-teams season rollup, and given how carefully that unit is modeled, I'd want to look rather than guess why.

I also scoped ranks to conference, /18 rather than division. The screenshot's /8 was wrong twice over — SWAC West has 6 teams, and your top-stat rule is "top 3 out of 18," so conference is the natural scope for both.

Top stat picks from six qualifying candidates, all shipped in the response so the frontend can rotate:


1/18  PASS TD      23        <- selected
1/18  EPA/PLAY     0.3564
2/18  YDS/GM       274.8
2/18  TAKEAWAYS    14
2/18  EXPLOSIVE %  0.165
3/18  SUCCESS %    0.4574
The screenshot's 274.8 was real — it's 2nd of 18.

Star impact pulls from the last game as you described. Cameron Peters in the Celebration Bowl: 24/36, 412 yards, 4 TD, 0 INT, +27.7 EPA, 39.12 game PAR — highest of the 30 PVAMU players with production that game.

One thing to decide: the venue.city on that game is mangled — "Atlanta, Georgia (Mercedes-Benz Stadium) Score By Quarters 1st 2nd 3rd 4th OT OT OT OT al". Box-score header text bled into the venue field at parse. It's cosmetic and it's in the payload, so worth fixing at the parse alongside the two mangled school names I flagged earlier.