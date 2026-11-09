# How Saturday Was Won export cleanup

## Frontend changes

- Labeled the right-hand board as success rate with winner net edge in percentage points. The net edge now occupies a separate grid column, independent of logo positions, so large gaps cannot overlap the away/home rates.
- Success-rate axis spans 0–100%; the prior 20–60% axis clipped Alcorn's roughly 66% rate.
- Performer rows retain the entire backend stat_line and supplement nonzero defense fields from the loaded game file. Rows wrap within their own stats column rather than cutting the line to two entries.
- Record-book values use a max-content minimum column and nowrap; 69,384 stays on one line.
- Story tiles use team primary/secondary colors selected for contrast against the current poster palette, plus a low-opacity team-logo watermark. Game-result stories use the winner; lost win-probability stories use the losing team whose probability the number describes; crowd stories use the leading attendance game's home team.

## Reversing the team styling

The preview toolbar has **Tile style: Team / Original**. Original restores the old category colors and removes the watermarks, in both the visible preview and saved PNG. It retains the spacing/data fixes. The poster also accepts `teamStyle={false}`; change PreviewModal's initial teamStyle state to false to restore Original as the default.

## Backend handoff: performer stat lines

Week 9 recap source: `93-FE Docs/game-center/week-recap/2026/9.json`.

The compact frontend previously truncated stat_line to its first two fields. Josh Narcisse's supplied line already contains TKL 1.5, TFL 1, SACKS 1, INT 1, and HAVOC 3. That truncation is fixed.

Raquane Matthews' recap line contains only TKL 4.5. His matching defense row in `game-center/games/2026/scsumsu26.json`, player_key `PERS_00013121`, includes fumble_recoveries 1, fumble_return_yards 10, and fumble_return_touchdowns 1. The frontend now supplements FR and DEF TD. Please include relevant nonzero sacks, TFL, INT, PD, FF, FR, and defensive touchdowns directly in recap stat_line so recap consumers do not need enrichment requests to explain a defender's selection. Preserve ranking and production scores as backend-owned values.

For story branding, please publish `data.stat_team_id` as the team represented by the large displayed value, especially multi-team stories and lost win-probability items. The frontend respects that field when supplied and otherwise uses structured game/team references, never parses the prose.

## Verification

Recap files parse; focused tests cover defensive enrichment/no truncation, team selection, night/light team-color contrast, and unclipped high success rates. Browser automation failed to initialize on this pass, so final visual QA and PNG download verification remain outstanding.
