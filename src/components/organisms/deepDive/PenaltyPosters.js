import { Poster } from "./penalties/PenaltyPosterPrimitives";
import { NetBattle, BenefitTiles, TeamCost } from "./penalties/PenaltyBattlePanels";
import { BounceBack, ThirdDown } from "./penalties/PenaltyResponsePanels";
import { Habits, HabitTiles } from "./penalties/PenaltyHabitsPanels";
import { OfficialsMain, OfficialsTiles } from "./penalties/PenaltyOfficialsPanels";

// ─────────────────────────────────────────────────────────────────────────────
// SWAC penalties deep dive: five posters, each one main chart with infographic
// tiles under it.
//
//   1. The flag battle: net penalty yards per game.
//   2. What flags cost: points given away per game and crucial flags. No tiles;
//      the user explains it in the tweet.
//   3. After the flag: bounce-back by team, 3rd-down flags.
//   4. Habits: flags game by game (red above the SWAC average, green at or
//      below), pre-snap direction, the most common foul.
//   5. The whistle crews: officiating crew matrix and callout tiles.
//
// Everything printed is the backend's (src/data/penaltiesSwac2026W8.json, from
// 999-frontendfeedback/10 27). The only arithmetic is display: totals of a
// table's shipped counts and percents of a shipped rate. `pal` is the recap
// palette, so the posters follow Light / Night.
// ─────────────────────────────────────────────────────────────────────────────

export { PEN } from "./penalties/penaltyPosterModel";

export const BenefitPoster = ({ pal, innerRef }) => (
  <Poster pal={pal} innerRef={innerRef} title="The flag" accent="battle">
    <NetBattle pal={pal} />
    <BenefitTiles pal={pal} />
  </Poster>
);

export const CostPoster = ({ pal, innerRef }) => (
  <Poster pal={pal} innerRef={innerRef} title="What flags" accent="cost">
    <TeamCost pal={pal} />
  </Poster>
);

export const AfterFlagPoster = ({ pal, innerRef }) => (
  <Poster pal={pal} innerRef={innerRef} title="After the" accent="flag">
    <BounceBack pal={pal} />
    <ThirdDown pal={pal} />
  </Poster>
);

export const HabitsPoster = ({ pal, innerRef }) => (
  <Poster pal={pal} innerRef={innerRef} title="Flag" accent="habits">
    <Habits pal={pal} />
    <HabitTiles pal={pal} />
  </Poster>
);

export const OfficialsPoster = ({ pal, innerRef }) => (
  <Poster pal={pal} innerRef={innerRef} title="The whistle" accent="crews">
    <OfficialsMain pal={pal} />
    <OfficialsTiles pal={pal} />
  </Poster>
);

export const PENALTY_POSTERS = [
  { id: "battle", chip: "1 · Flag battle", Poster: BenefitPoster },
  { id: "cost", chip: "2 · What flags cost", Poster: CostPoster },
  { id: "after", chip: "3 · After the flag", Poster: AfterFlagPoster },
  { id: "habits", chip: "4 · Habits", Poster: HabitsPoster },
  { id: "officials", chip: "5 · Officials", Poster: OfficialsPoster },
];

export { PEN_META } from "./penalties/penaltyPosterModel";
