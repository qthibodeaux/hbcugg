import { PassingProductionClean } from "./PassingProductionClean";
import { RushingProductionClean } from "./RushingProductionClean";
import { DefenseProductionClean } from "./DefenseProductionClean";
import { SpecialTeamsProductionClean } from "./SpecialTeamsProductionClean";

// The Player Stats tab (was "Production" until 2026-09-20) — one clean panel per unit, each a side-by-side pair of
// team blocks (eyebrow / team line / spotlight / roster). Special teams reads
// `special_teams_individual` + `special_teams_production`, which the 2026 export
// ships per player and per team.
export const BoxScoreTab = ({ game, playerSeasons, priorPlayerSeasons = [], awayId, homeId, productionScores }) => (
  <>
    <PassingProductionClean game={game} playerSeasons={playerSeasons} priorPlayerSeasons={priorPlayerSeasons} productionScores={productionScores} awayId={awayId} homeId={homeId} />

    <RushingProductionClean game={game} playerSeasons={playerSeasons} priorPlayerSeasons={priorPlayerSeasons} productionScores={productionScores} awayId={awayId} homeId={homeId} />

    <DefenseProductionClean game={game} playerSeasons={playerSeasons} priorPlayerSeasons={priorPlayerSeasons} productionScores={productionScores} awayId={awayId} homeId={homeId} />

    <SpecialTeamsProductionClean game={game} playerSeasons={playerSeasons} priorPlayerSeasons={priorPlayerSeasons} awayId={awayId} homeId={homeId} />
  </>
);
