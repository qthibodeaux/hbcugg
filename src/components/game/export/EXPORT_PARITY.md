# Export ↔ Game Page Parity

The posters are the game page at print size. Every visual rule they share lives in **one** place that both import. Change the rule there and both surfaces move together.

**The rule for new work:** a poster never re-implements a scale, colour rule or shading the page already has. Import it. If the page's version lives inside a component file, lift it into `src/utils/` or export it, then import it on both sides.

| What | Single source | Game page | Poster |
|---|---|---|---|
| Production bars: one game-wide scale, zero mark, red negatives, column labels | `src/utils/productionBars.js` | `ProductionPrimitives.js` (`parColumn`, `ProductionBar`), Passing / Rushing / Defense production | `BoxscorePoster.js` (`Production`) |
| Stat bars: league max, 0 or the negative as min, zero mark, league-average tick | `src/utils/statBars.js` | `GameSummaryTabV2.js` (`buildTeamStatRows`, `statBarSegment`) | `OffensePoster.js` |
| League shading (red/green cells vs league) | `shadeVsLeague` in `page/boxscore/ProductionPrimitives.js` | production tables | `PosterChrome.js` (same function, `PRINT_SHADE` strength) |
| Passing zone grid heat (yds/att vs a fixed 14, neutral under 2 att, team heat colour) | `heatFill`, `heatAccent`, `PASS_ZONE_YPA_SCALE` in `ProductionPrimitives.js` | `PassingProductionClean.js` (`ZoneCell`) | `BoxscorePoster.js` (`ZoneGrid`) |
| Chains Moved / Series Results | the page components themselves | `page/summary/SeriesCards.js` | `DrivesPoster.js` renders them directly |

**Allowed to differ:** sizes (px for print, rem/cq on the page), tint strength (`PRINT_SHADE`), layout. **Not allowed to differ:** scales, thresholds, colours that carry meaning, labels.

When you change a row above, check the other column's file in the same pass.
