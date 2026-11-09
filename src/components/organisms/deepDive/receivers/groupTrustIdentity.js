import { GoToGrid, TargetShare, YardsShare, Situation, Trusted, QbTables, Pairs } from "./trust/TrustPanels";
import { Types, DeepEpa, ByScore, GroupGrid, TeBacks, ClassLeague, Profile, Tendency, SecondShort } from "./identity/IdentityPanels";
import { StateMap } from "./identity/StateMap";

export const TRUST_GROUP = {
  id: "trust", label: "Who they trust",
  posters: [
    { id: "go-to", chip: "Go to by down", tweet: "Every team's go to target on every down", Poster: GoToGrid },
    { id: "target-share", chip: "Target share", tweet: "The offenses that run through one receiver", Poster: TargetShare },
    { id: "yards-share", chip: "Yards share", tweet: "Who carries the most of his team's receiving yards", Poster: YardsShare },
    { id: "situation", chip: "By situation", tweet: "Who each team looks for when the situation changes", Poster: Situation },
    { id: "trusted", chip: "Biggest downs", tweet: "The most trusted receivers on the biggest downs", Poster: Trusted },
    { id: "qb", chip: "QB targets", tweet: "The quarterback's most reliable option", Poster: QbTables },
    { id: "pairs", chip: "Connections", tweet: "The best quarterback and receiver connections", Poster: Pairs },
  ],
};

export const IDENTITY_GROUP = {
  id: "identity", label: "Team identity",
  posters: [
    { id: "types", chip: "Offense types", tweet: "Every passing offense in the league, by type", Poster: Types },
    { id: "deep-epa", chip: "Deep rate vs EPA", tweet: "The teams that throw deep are the teams that pass well", Poster: DeepEpa },
    { id: "by-score", chip: "Ahead vs behind", tweet: "Who changes the most when the score changes", Poster: ByScore },
    { id: "groups", chip: "Target groups", tweet: "How each offense splits its targets", Poster: GroupGrid },
    { id: "te-backs", chip: "Tight ends and backs", tweet: "The best pass catchers who don't play receiver", Poster: TeBacks },
    { id: "states", chip: "Home states", tweet: "Florida and Texas lead the way at receiver", Poster: StateMap },
    { id: "class", chip: "Class years", tweet: "Which class is doing the receiving", Poster: ClassLeague },
    { id: "profile", chip: "Early down profile", tweet: "Who throws on early downs, and does it work", Poster: Profile },
    { id: "tendency", chip: "Down and distance", tweet: "When the league throws", Poster: Tendency },
    { id: "second-short", chip: "2nd and short", tweet: "Who takes the free shot on 2nd and short", Poster: SecondShort },
  ],
};

export { GoToTiles } from "./trust/TrustPanels";
