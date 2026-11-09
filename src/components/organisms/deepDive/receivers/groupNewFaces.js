import { Pipeline, TransferShare, TransferBoard, TransferTable, YoungTable, ClassGrid } from "./newFaces/ArrivalPanels";
import { RiseFall, TeamYards, TeamEpa, LeagueSeasons, LeagueTimeline } from "./newFaces/SeasonChangePanels";

export const NEW_FACES_GROUP = {
  id: "new-faces", label: "New faces",
  posters: [
    { id: "pipeline", chip: "Where they came from", tweet: "Nearly half the league's receiving yards came from new transfers", Poster: Pipeline },
    { id: "share", chip: "Transfer share by team", tweet: "Which offenses are built on the portal", Poster: TransferShare },
    { id: "top-board", chip: "Top transfers chart", tweet: "The best first year transfers", Poster: TransferBoard },
    { id: "transfers", chip: "Top transfers", tweet: "The best first year transfers at receiver", Poster: TransferTable },
    { id: "young", chip: "Freshmen and sophomores", tweet: "The young receivers already producing", Poster: YoungTable },
    { id: "class", chip: "Yards by class", tweet: "How much receiving production is about to leave", Poster: ClassGrid },
  ],
};

export const THEN_NOW_GROUP = {
  id: "then-now", label: "Then and now",
  posters: [
    { id: "rise-fall", chip: "Risers and fallers", tweet: "The biggest jumps and drops from last season", Poster: RiseFall },
    { id: "team-yards", chip: "Team yards", tweet: "Alcorn nearly doubled its passing. B-CU lost more than half of its.", Poster: TeamYards },
    { id: "team-epa", chip: "Team EPA", tweet: "Which passing games actually got better", Poster: TeamEpa },
    { id: "seasons", chip: "League by season", tweet: "League passing over the last eight seasons", Poster: LeagueSeasons },
    { id: "timeline", chip: "Big timeline", tweet: "Every week of league passing since 2019", Poster: LeagueTimeline },
  ],
};

export { spread } from "./newFaces/SeasonChangePanels";
