# Pass-defense visual follow-up

Reviewed: 2026-11-03. Reviewed by: Codex (cleanup chat).
Destination: backend handoff carried over by the user. No backend files changed.

The initial frontend pass used a generic percentage scale and gave backend team
abbreviations precedence. Those were frontend mistakes, not data defects. The
frontend now uses teams.json shortName, team logos/colors, fitted display axes
and the existing Deep Dive poster hierarchy.

## Existing data can support these revisions

- PD02 First-Down Foundations: scatter, X = published first-down success
  allowed, Y = published first-down 20+ gain rate. Each axis keeps its own
  numerator/sample. Lower left is lower on both measures. No composite score.
- PD06 Halftime Response: scatter, X = first-half success allowed, Y = second-half
  success allowed. Common axis bounds and a y=x visual reference. Below the line
  means a lower second-half rate, not proof of a coaching adjustment. No derived
  improvement rank, league average, causal label or season-rate calculation.
- PD01 and the PD04 success-rate alternate: tighter plotting bounds are a display
  concern. A 22.1% bar should not require a 100% axis. All bar scales retain zero.

## Measures to send back for stronger charts

| Priority / view | Data concern | Owning-builder request |
|---|---|---|
| PD01 disruption | Unique PBU-or-INT attempts are a real observation, but not coverage wins or a complete pass-defense grade. PBU and INT also have different meanings. | Publish PBU-only, INT-only and overlapping-event attempt counts/rates with a mutually exclusive definition, matched denominators and qualification. If offering a disruption-versus-results scatter, publish matched-cohort pass EPA and sample for both full/competitive scopes. Do not make the client subtract overlapping counters or reuse all-play EPA. |
| PD03 third-and-long | Separate third-down and long-distance marginals cannot answer passing conversion prevention. | Publish the standing pass/sack third-down x distance-7+ intersection, conversions/opportunities/rate, qualification and full/competitive ranks. |
| PD04 touchdown denial | Red-zone passing success is available but does not answer passing TD denial. | Publish offensive passing TDs allowed and standing pass-attempt opportunities/rate in red zone and goal-to-go, with samples, qualification and both scopes. |
| PD07 air/YAC | Existing air-yard and YAC fields do not share a denominator. | Publish air yards and YAC on the same charted-completion cohort, including signed sums, averages, n and charting coverage in each scope. |
| PD12 explosive prevention | 20+ attempt rate lacks the matching passing-yard damage share. | Publish credited yards on 20+ completions and their share of completed passing yards, with the zero/negative-total policy, numerator, denominator and qualification. |
| PD05 / PD10 sparse situations | A few late-close or goal-to-go opportunities can dominate a bar. Optional rank alone does not explain eligibility. | Publish measure-specific eligibility/reason, matched game count and denominator floor. If uncertainty intervals or comparison baselines are desired, publish them from the owning builder. The frontend will not invent cutoffs, pool marginal buckets or calculate intervals. |
| PD09 receiver groups | Tiny TE/RB samples are not as conclusive as large WR samples; this is not individual defender coverage. | Provide group-specific qualification/reasons and explicit denominator definitions, alongside other/unidentified target shares. Keep EPA/target and each group's sample on their existing owner. |
| PD13 trajectory | Completion rate alone is a weak result-quality story; attempt-only EPA excludes sacks. | Publish per-game passing dropback EPA including sacks, with numerator/n, scope and qualification, plus explicit unavailable/schedule-gap entries if those games should appear. Do not supply all-play defense EPA under a passing label. Opponent-adjusted comparisons need a separately defined published pass-specific baseline. |

Until these additions ship, retain honest labels and unavailable states. No
pressure-versus-results, verified clean-pocket or individual coverage-assignment
graphics are requested. The current TSU full-game pass-EPA conflict remains visible.

## Frontend validation

Sixteen model/presentation tests cover published values, independent samples,
scope restrictions, Week 0/gaps, null/zero/absent states, source conflicts,
teams.json identity precedence and fitted axes. All 18 team colors are checked
against both poster grounds; AAMU stays maroon rather than switching to white.
