# Player game-log data inventory follow-up

Reviewed: 2026-11-06. Reviewer: Codex (cleanup chat).

During structural cleanup, the current source trace confirmed that
`src/components/organisms/player/PlayerStatsTab.js` still calls `buildGameLog`
from `statsTabMock.js` for its Game Log table. The generator uses per-game PAR or
a production-derived fallback signal to create passing/rushing/receiving,
defensive and specialist box-score fields. Those generated counting values are
not measured game statistics. Existing behavior was preserved in the cleanup;
the helper filename alone does not make this a lab-only dependency.

Please identify the current published source for real per-player game counting
lines and its frontend fetch contract. This is an inventory/wiring question,
not a claim that the backend lacks these data or needs a new calculation.

Needed mapping:

- Stable person/player ID, team ID, season and game ID, including historical
  identity aliases and players appearing in more than one category.
- Available counting categories/fields: passing, rushing, receiving, defense,
  kicking, punting and returns. Specify raw-field meanings such as PBU versus
  passes defended, sacks versus sacks taken, and passing attempts versus
  dropbacks.
- Game date/week, opponent and home/away information from the source, rather
  than assigning week numbers from the array position.
- Coverage and missingness: distinguish no published line, unavailable measure,
  an unparsed game and a genuine recorded zero. Preserve fractional sack/TFL
  values and category-specific denominators where supplied.
- Whether the existing game document or player-profile document already supplies
  these lines, and which source wins if both contain them.

Frontend follow-up: wire the published rows into the game-log adapter, then
retire reachable synthetic fallbacks deliberately. Do not infer counting values
from PAR. Keep real PAR gauges separate from synthetic category statistics.

This note is local to hbcugg1 for the user to carry over. No backend files or
scripts were changed or run.
